// Product List Page - Updated to match ok/ style
// Make getCategoryDisplayName available globally
if (typeof getCategoryDisplayName === 'undefined' && typeof CATEGORY_NAMES !== 'undefined') {
  window.getCategoryDisplayName = function(categoryCode) {
    return CATEGORY_NAMES[categoryCode] || categoryCode;
  };
}

// Product data - support both shopvn_products and products keys
function getAllProductsCompat() {
  // Try shopvn_products first (existing data)
  var shopvn = localStorage.getItem('shopvn_products');
  if (shopvn) {
    try {
      var parsed = JSON.parse(shopvn);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    } catch(e) {}
  }
  
  // Try products (ok/ style)
  var products = localStorage.getItem('products');
  if (products) {
    try {
      var parsed = JSON.parse(products);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    } catch(e) {}
  }
  
  // Fallback to getAllProducts if available
  if (typeof getAllProducts === 'function') {
    return getAllProducts();
  }
  
  return [];
}

let products = getAllProductsCompat();
let currentPage = 1;
const itemsPerPage = 10;
let filteredProducts = products.slice();

// Format price
function formatPrice(price) {
  if (!price) return '0 ₫';
  try {
    const numPrice = parseFloat(price) || 0;
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(numPrice);
  } catch (error) {
    const numPrice = parseFloat(price) || 0;
    return numPrice.toLocaleString("vi-VN").replace(/,/g, ".") + " ₫";
  }
}

// Get status display
function getStatusDisplay(product) {
  if (product.status === 'success' || product.statusText === 'Đang bán') {
    return { text: 'Đang bán', class: 'success' };
  }
  if (product.status === 'pending' || product.statusText === 'Sắp hết') {
    return { text: 'Sắp hết', class: 'pending' };
  }
  if (product.status === 'cancelled' || product.statusText === 'Tạm ngừng' || product.statusText === 'Hết hàng') {
    return { text: 'Tạm ngừng', class: 'cancelled' };
  }
  // Auto-detect from quantity
  if (product.quantity === 0) {
    return { text: 'Hết hàng', class: 'cancelled' };
  }
  if (product.quantity <= 5) {
    return { text: 'Sắp hết', class: 'pending' };
  }
  return { text: 'Đang bán', class: 'success' };
}

// Render products
function renderProducts() {
  const tbody = document.getElementById('productTableBody');
  if (!tbody) return;
  
  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const pageProducts = filteredProducts.slice(start, end);
  
  if (pageProducts.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="9" style="text-align: center; padding: 60px 20px; color: var(--muted);">
          <div style="font-size: 48px; margin-bottom: 16px; opacity: 0.6;">📦</div>
          <div style="font-size: 16px; margin-bottom: 8px; color: var(--text);">Chưa có sản phẩm nào</div>
          <div style="font-size: 14px;">Nhấn "Thêm sản phẩm" để bắt đầu</div>
        </td>
      </tr>
    `;
    renderPagination();
    updatePageInfo();
    return;
  }
  
  tbody.innerHTML = pageProducts.map(product => {
    const status = getStatusDisplay(product);
    const sku = product.sku || product.id || 'N/A';
    const category = typeof getCategoryDisplayName === 'function' ? getCategoryDisplayName(product.category) : (product.category || 'N/A');
    const quantity = product.quantity || product.stock || 0;
    const sold = product.sold || 0;
    
    return `
    <tr data-id="${product.id}">
      <td class="chk"><input type="checkbox" class="row-check" data-id="${product.id}" /></td>
      <td>
        <div class="product">
          <div class="thumb">
            <img src="${product.image || 'https://via.placeholder.com/40'}" alt="${product.name}" onerror="this.src='https://via.placeholder.com/40'" />
          </div>
          <div>
            <div class="name">${product.name || 'N/A'}</div>
            <div class="sub">⭐ ${product.rating || '4.8'}</div>
          </div>
        </div>
      </td>
      <td>${sku}</td>
      <td><span class="tag">${category}</span></td>
      <td class="price">${formatPrice(product.price)}</td>
      <td>${quantity}</td>
      <td>${sold}</td>
      <td><span class="status ${status.class}">${status.text}</span></td>
      <td class="cell-right">
        <div class="action-menu">
          <button type="button" class="action-toggle" aria-label="Thao tác">⋯</button>
          <div class="action-dropdown">
            <button class="action-item" data-action="view" data-product-id="${product.id}">👁 Xem chi tiết</button>
            <button class="action-item" data-action="edit" data-product-id="${product.id}">✏️ Chỉnh sửa</button>
            <button class="action-item" data-action="duplicate" data-product-id="${product.id}">📑 Nhân bản</button>
            <button class="action-item danger" data-action="delete" data-product-id="${product.id}">🗑 Xóa sản phẩm</button>
          </div>
        </div>
      </td>
    </tr>
  `;
  }).join('');
  
  // Setup action menu handlers
  setupActionMenuHandler();
  
  renderPagination();
  updatePageInfo();
}

// Action menu handler (giống ok/js/product-clean.js)
function setupActionMenuHandler() {
  document.removeEventListener("click", handleActionMenuClick);
  document.addEventListener("click", handleActionMenuClick);
}

function handleActionMenuClick(e) {
  const toggle = e.target.closest(".action-toggle");
  const menu = e.target.closest(".action-menu");
  const item = e.target.closest(".action-item");

  // Click on toggle button
  if (toggle && menu) {
    e.stopPropagation();
    const isOpen = menu.classList.contains("open");
    document.querySelectorAll(".action-menu.open").forEach((m) => m.classList.remove("open"));
    if (!isOpen) {
      menu.classList.add("open");
    }
    return;
  }

  // Click on action item
  if (item) {
    e.stopPropagation();
    e.preventDefault();
    
    const menu = item.closest(".action-menu");
    if (menu) {
      menu.classList.remove("open");
    }
    
    const action = item.getAttribute("data-action");
    let productId = item.getAttribute("data-product-id");
    if (!productId) {
      const row = item.closest("tr");
      productId = row?.dataset?.id;
    }
    
    if (!productId) {
      alert("Không tìm thấy ID sản phẩm!");
      return;
    }
    
    if (action === "view") {
      viewProduct(productId);
    } else if (action === "delete") {
      deleteProduct(productId);
    } else if (action === "edit") {
      editProduct(productId);
    } else if (action === "duplicate") {
      duplicateProduct(productId);
    }
    return;
  }

  // Click outside -> close all menus
  if (!e.target.closest(".action-menu")) {
    document.querySelectorAll(".action-menu.open").forEach((m) => m.classList.remove("open"));
  }
}

// View product (mở modal thay vì chuyển trang)
function viewProduct(id) {
  const product = products.find(p => p.id == id) || filteredProducts.find(p => p.id == id);
  if (!product) {
    alert("Không tìm thấy sản phẩm!");
    return;
  }
  
  openProductDetailModal(product);
}

// Edit product (mở modal thay vì chuyển trang)
function editProduct(id) {
  const product = products.find(p => p.id == id) || filteredProducts.find(p => p.id == id);
  if (!product) {
    alert("Không tìm thấy sản phẩm!");
    return;
  }
  
  openProductModal(product);
}

// Duplicate product
function duplicateProduct(id) {
  const product = products.find(p => p.id == id) || filteredProducts.find(p => p.id == id);
  if (!product) {
    alert("Không tìm thấy sản phẩm!");
    return;
  }

  const copy = {
    ...product,
    id: `${product.id}-copy-${Date.now()}`,
    name: product.name + ' (Copy)',
    sku: product.sku ? `${product.sku}-COPY` : `COPY-${Date.now()}`,
  };

  // Save to both keys for compatibility
  var allProducts = getAllProductsCompat();
  allProducts.push(copy);
  
  // Save to products (ok/ style)
  try {
    localStorage.setItem('products', JSON.stringify(allProducts));
  } catch(e) {
    console.error('Error saving to products:', e);
  }
  
  // Also save to shopvn_products if using that
  if (typeof saveAllProducts === 'function') {
    saveAllProducts(allProducts);
  }
  
  products = getAllProductsCompat();
  filteredProducts = products.slice();
  
  // Reset to page 1
  currentPage = 1;
  renderProducts();
  
  alert("Đã nhân bản sản phẩm.");
}

// Delete product
function deleteProduct(id) {
  const product = products.find(p => p.id == id) || filteredProducts.find(p => p.id == id);
  if (!product) {
    alert("Không tìm thấy sản phẩm!");
    return;
  }

  if (!confirm(`Bạn có chắc muốn xóa sản phẩm "${product.name}"?\n\nHành động này không thể hoàn tác!`)) {
    return;
  }

  var allProducts = getAllProductsCompat();
  allProducts = allProducts.filter(p => p.id != id);
  
  // Save to products (ok/ style)
  try {
    localStorage.setItem('products', JSON.stringify(allProducts));
  } catch(e) {
    console.error('Error saving to products:', e);
  }
  
  // Also save to shopvn_products if using that
  if (typeof saveAllProducts === 'function') {
    saveAllProducts(allProducts);
  }
  
  products = allProducts.slice();
  filteredProducts = products.slice();
  
  const maxPage = Math.max(1, Math.ceil(filteredProducts.length / itemsPerPage));
  if (currentPage > maxPage) currentPage = maxPage;
  
  renderProducts();
  
  alert(`Đã xóa sản phẩm "${product.name}" thành công!`);
}

// Render pagination
function renderPagination() {
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  const pagination = document.getElementById('pagination');
  if (!pagination) return;
  
  let html = '';
  
  // Previous button
  if (currentPage > 1) {
    html += `<button style="padding:6px 12px;background:var(--panel);border:1px solid var(--line);border-radius:6px;color:var(--text);cursor:pointer" onclick="changePage(${currentPage - 1})">Trước</button>`;
  }
  
  // Page numbers
  const startPage = Math.max(1, currentPage - 2);
  const endPage = Math.min(totalPages, currentPage + 2);
  
  for (let i = startPage; i <= endPage; i++) {
    if (i === currentPage) {
      html += `<button style="padding:6px 12px;background:var(--accent);border:1px solid var(--accent);border-radius:6px;color:#2b1606;font-weight:700;cursor:pointer">${i}</button>`;
    } else {
      html += `<button style="padding:6px 12px;background:var(--panel);border:1px solid var(--line);border-radius:6px;color:var(--text);cursor:pointer" onclick="changePage(${i})">${i}</button>`;
    }
  }
  
  // Next button
  if (currentPage < totalPages) {
    html += `<button style="padding:6px 12px;background:var(--panel);border:1px solid var(--line);border-radius:6px;color:var(--text);cursor:pointer" onclick="changePage(${currentPage + 1})">Sau</button>`;
  }
  
  pagination.innerHTML = html;
}

// Change page
function changePage(page) {
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  if (page < 1 || page > totalPages) return;
  currentPage = page;
  renderProducts();
}

// Update page info
function updatePageInfo() {
  const start = (currentPage - 1) * itemsPerPage + 1;
  const end = Math.min(currentPage * itemsPerPage, filteredProducts.length);
  const total = filteredProducts.length;
  const pageInfo = document.getElementById('pageInfo');
  if (pageInfo) {
    pageInfo.textContent = `Hiển thị ${start}-${end} trong ${total} kết quả`;
  }
}

// Search products
const searchInput = document.getElementById('searchInput');
if (searchInput) {
  searchInput.addEventListener('input', function(e) {
    const query = e.target.value.toLowerCase();
    filteredProducts = products.filter(function (p) {
      const name = (p.name || '').toLowerCase();
      const sku = (p.sku || p.id || '').toLowerCase();
      const category = (p.category || '').toLowerCase();
      return name.includes(query) || sku.includes(query) || category.includes(query);
    });
    currentPage = 1;
    renderProducts();
  });
}

// Select all
const selectAll = document.getElementById('selectAll');
if (selectAll) {
  selectAll.addEventListener('change', function() {
    const checkboxes = document.querySelectorAll('tbody .row-check');
    checkboxes.forEach(cb => cb.checked = this.checked);
  });
}

// Toggle sidebar (use common.js)
if (typeof toggleSidebar === 'undefined') {
  function toggleSidebar() {
    const layout = document.querySelector('.layout');
    if (!layout) return;
    layout.classList.toggle('collapsed');
    try {
      localStorage.setItem('sidebarCollapsed', layout.classList.contains('collapsed'));
    } catch(e) {}
  }
  window.toggleSidebar = toggleSidebar;
}

// Restore sidebar state (use common.js)
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', function() {
    try {
      if (localStorage.getItem('sidebarCollapsed') === 'true') {
        const layout = document.querySelector('.layout');
        if (layout) {
          layout.classList.add('collapsed');
        }
      }
    } catch(e) {}
  });
}

// Modal management
let editingProductId = null;

// Open product modal (add or edit)
function openProductModal(product) {
  const modal = document.getElementById('productModal');
  const form = document.getElementById('productForm');
  const title = document.getElementById('productModalTitle');
  const submitBtn = document.getElementById('productModalSubmit');
  
  if (!modal || !form) return;
  
  // Reset form
  form.reset();
  editingProductId = null;
  
  // Reset image preview
  const imagePreview = document.getElementById('imagePreview');
  const imagePreviewImg = document.getElementById('imagePreviewImg');
  const uploadIcon = document.getElementById('imageUploadIcon') || document.querySelector('.image-upload-icon');
  if (imagePreviewImg) {
    imagePreviewImg.src = '';
    imagePreviewImg.onerror = null;
    imagePreviewImg.onload = null;
  }
  if (imagePreview) imagePreview.style.display = 'none';
  if (uploadIcon) {
    uploadIcon.style.display = 'flex';
  }
  
  // Load categories
  loadCategoriesIntoModal();
  
  if (product) {
    // Edit mode
    editingProductId = product.id;
    if (title) title.textContent = 'Chỉnh sửa sản phẩm';
    if (submitBtn) submitBtn.textContent = 'Lưu thay đổi';
    
    // Fill form
    document.getElementById('modalProductName').value = product.name || '';
    document.getElementById('modalSku').value = product.sku || '';
    document.getElementById('modalCategory').value = product.category || '';
    document.getElementById('modalPrice').value = product.price ? formatNumberWithDots(product.price.toString()) : '';
    document.getElementById('modalOriginalPrice').value = product.originalPrice ? formatNumberWithDots(product.originalPrice.toString()) : '';
    document.getElementById('modalQuantity').value = product.quantity || product.stock || 0;
    document.getElementById('modalDescription').value = product.description || '';
    
    // Load image if exists
    if (product.image && imagePreviewImg && imagePreview) {
      // Set image source
      imagePreviewImg.src = product.image;
      
      // Handle image load error
      imagePreviewImg.onerror = function() {
        console.warn('Image failed to load:', product.image);
        imagePreviewImg.src = 'https://via.placeholder.com/140';
        imagePreview.style.display = 'block';
        if (uploadIcon) uploadIcon.style.display = 'none';
      };
      
      // Handle image load success
      imagePreviewImg.onload = function() {
        imagePreview.style.display = 'block';
        if (uploadIcon) uploadIcon.style.display = 'none';
      };
      
      // If image is data URL or already loaded, show immediately
      if (product.image.startsWith('data:') || product.image.startsWith('blob:')) {
        imagePreview.style.display = 'block';
        if (uploadIcon) uploadIcon.style.display = 'none';
      } else {
        // For external URLs, wait for load/error events
        imagePreview.style.display = 'block';
        if (uploadIcon) uploadIcon.style.display = 'none';
      }
    }
  } else {
    // Add mode
    if (title) title.textContent = 'Thêm sản phẩm mới';
    if (submitBtn) submitBtn.textContent = 'Thêm sản phẩm';
  }
  
  // Show modal first
  modal.style.display = 'flex';
  
  // Setup image upload (must be after modal is shown to ensure elements exist)
  setTimeout(function() {
    setupImageUpload();
  }, 100);
  
  // Setup price formatting
  setupModalPriceFormatting();
  
  // Setup form submit
  setupModalFormSubmit();
}

// Close product modal
function closeProductModal() {
  const modal = document.getElementById('productModal');
  if (modal) modal.style.display = 'none';
  const form = document.getElementById('productForm');
  if (form) form.reset();
  editingProductId = null;
}

// Open product detail modal
function openProductDetailModal(product) {
  const modal = document.getElementById('productDetailModal');
  if (!modal || !product) return;
  
  // Store product ID in modal dataset for image click
  modal.dataset.productId = product.id;
  
  // Fill detail info
  const detailImage = document.getElementById('detailImage');
  if (detailImage) {
    detailImage.src = product.image || 'https://via.placeholder.com/300';
    // Ensure onclick handler is set
    detailImage.onclick = function(e) {
      e.stopPropagation();
      viewFullProductDetailsFromModal();
    };
  }
  
  document.getElementById('detailName').textContent = product.name || 'N/A';
  document.getElementById('detailCategory').textContent = typeof getCategoryDisplayName === 'function' ? getCategoryDisplayName(product.category) : (product.category || 'N/A');
  document.getElementById('detailSku').textContent = product.sku || product.id || 'N/A';
  document.getElementById('detailPrice').textContent = formatPrice(product.price);
  document.getElementById('detailQuantity').textContent = product.quantity || product.stock || 0;
  document.getElementById('detailDescription').textContent = product.description || '—';
  
  // Fill attributes
  const attrContainer = document.getElementById('detailAttributes');
  if (attrContainer) {
    const attrs = product.attributes || {};
    const keys = Object.keys(attrs);
    if (keys.length === 0) {
      attrContainer.innerHTML = '<div style="color:var(--muted);padding:20px;text-align:center">Không có thuộc tính thêm.</div>';
    } else {
      attrContainer.innerHTML = keys.map(key => `
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:12px;padding:12px;background:var(--panel-2);border-radius:8px">
          <div style="font-size:11px;color:var(--muted)">${key}</div>
          <div style="font-size:14px;font-weight:500">${attrs[key]}</div>
        </div>
      `).join('');
    }
  }
  
  modal.style.display = 'flex';
}

// Close product detail modal
function closeProductDetailModal() {
  const modal = document.getElementById('productDetailModal');
  if (modal) modal.style.display = 'none';
}

// View full product details page (from modal image click or button)
function viewFullProductDetailsFromModal() {
  const modal = document.getElementById('productDetailModal');
  if (!modal) {
    console.warn('productDetailModal not found');
    return;
  }
  
  // Get product ID from modal dataset
  let productId = modal.dataset.productId;
  
  if (!productId) {
    // Try to get from current viewing product
    const products = getAllProductsCompat();
    const detailName = document.getElementById('detailName');
    if (detailName) {
      const productName = detailName.textContent.trim();
      if (productName && productName !== 'N/A') {
        const product = products.find(function(p) { 
          return p.name && p.name.trim() === productName; 
        });
        if (product) {
          productId = product.id;
          console.log('Found product by name:', productId);
        }
      }
    }
  }
  
  if (!productId) {
    console.error('Product ID not found. Cannot navigate to details page.');
    alert('Không tìm thấy thông tin sản phẩm!');
    return;
  }
  
  console.log('Navigating to product details page with ID:', productId);
  
  // Store product ID for product-details.html
  localStorage.setItem('selectedProductId', String(productId));
  
  // Also store full product data
  const product = getAllProductsCompat().find(function(p) { return String(p.id) === String(productId); });
  if (product) {
    localStorage.setItem('selectedProduct', JSON.stringify(product));
    console.log('Product data stored:', product.name);
  } else {
    console.warn('Product not found in storage');
  }
  
  // Close modal and navigate
  closeProductDetailModal();
  window.location.href = 'product-details.html';
}

// Edit product from detail modal
function editProductFromDetailModal() {
  const modal = document.getElementById('productDetailModal');
  if (!modal) return;
  
  const productId = modal.dataset.productId;
  if (!productId) {
    // Try to get from product name
    const products = getAllProductsCompat();
    const detailName = document.getElementById('detailName');
    if (detailName) {
      const productName = detailName.textContent.trim();
      const product = products.find(function(p) { 
        return p.name && p.name.trim() === productName; 
      });
      if (product) {
        closeProductDetailModal();
        if (typeof window.openProductModal === 'function') {
          window.openProductModal(product);
        }
        return;
      }
    }
    alert('Không tìm thấy thông tin sản phẩm!');
    return;
  }
  
  closeProductDetailModal();
  if (typeof window.editProduct === 'function') {
    window.editProduct(productId);
  } else if (typeof window.openProductModal === 'function') {
    const product = getAllProductsCompat().find(function(p) { return String(p.id) === String(productId); });
    if (product) {
      window.openProductModal(product);
    }
  }
}

// Load categories into modal dropdown
function loadCategoriesIntoModal() {
  const select = document.getElementById('modalCategory');
  if (!select) return;
  
  // Try to get categories from localStorage
  let categories = [];
  try {
    const shopvn = localStorage.getItem('shopvn_categories');
    if (shopvn) {
      categories = JSON.parse(shopvn);
    } else {
      const cat = localStorage.getItem('categories');
      if (cat) categories = JSON.parse(cat);
    }
  } catch(e) {
    console.error('Error loading categories:', e);
  }
  
  const currentValue = select.value;
  select.innerHTML = '<option value="">Chọn danh mục</option>';
  
  categories.forEach(function(cat) {
    const option = document.createElement('option');
    option.value = cat.name || cat.id;
    option.textContent = cat.name || cat.id;
    select.appendChild(option);
  });
  
  if (currentValue) select.value = currentValue;
}

// Setup image upload preview
function setupImageUpload() {
  const imageUpload = document.getElementById('imageUpload');
  if (!imageUpload) {
    console.warn('imageUpload element not found');
    return;
  }
  
  // Remove existing listener to avoid duplicates
  const newImageUpload = imageUpload.cloneNode(true);
  imageUpload.parentNode.replaceChild(newImageUpload, imageUpload);
  const newUpload = document.getElementById('imageUpload');
  
  if (!newUpload) {
    console.warn('Failed to get new imageUpload element');
    return;
  }
  
  // Update onclick handler on image-upload-box to use new input
  const uploadBox = document.querySelector('.image-upload-box');
  if (uploadBox) {
    uploadBox.onclick = function() {
      const input = document.getElementById('imageUpload');
      if (input) input.click();
    };
  }
  
  newUpload.onchange = function(e) {
    console.log('File selected:', e.target.files);
    const file = e.target.files[0];
    if (!file) {
      console.warn('No file selected');
      return;
    }
    
    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn file ảnh hợp lệ!');
      newUpload.value = '';
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      alert('Kích thước file không được vượt quá 5MB!');
      newUpload.value = '';
      return;
    }
    
    console.log('Reading file:', file.name, file.type, file.size);
    const reader = new FileReader();
    
    reader.onload = function(event) {
      console.log('FileReader onload triggered, result length:', event.target.result.length);
      const previewImg = document.getElementById('imagePreviewImg');
      const preview = document.getElementById('imagePreview');
      const icon = document.getElementById('imageUploadIcon') || document.querySelector('.image-upload-icon');
      
      console.log('Preview elements:', { previewImg: !!previewImg, preview: !!preview, icon: !!icon });
      
      if (previewImg) {
        previewImg.src = event.target.result;
        console.log('Image src set to:', previewImg.src.substring(0, 50) + '...');
        
        // Force display
        previewImg.style.display = 'block';
        previewImg.style.visibility = 'visible';
      }
      
      if (preview) {
        preview.style.display = 'block';
        preview.style.visibility = 'visible';
        console.log('Preview container displayed');
      }
      
      if (icon) {
        icon.style.display = 'none';
        console.log('Upload icon hidden');
      }
    };
    
    reader.onerror = function(error) {
      console.error('FileReader error:', error);
      alert('Lỗi khi đọc file ảnh!');
      newUpload.value = '';
    };
    
    reader.onprogress = function(e) {
      if (e.lengthComputable) {
        const percentLoaded = Math.round((e.loaded / e.total) * 100);
        console.log('File reading progress:', percentLoaded + '%');
      }
    };
    
    reader.readAsDataURL(file);
  };
  
  console.log('Image upload handler setup complete');
}

// Format number with dots (for price input)
function formatNumberWithDots(value) {
  const numbers = value.replace(/[^\d]/g, '');
  return numbers.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

// Remove dots from number
function removeDotsFromNumber(value) {
  if (!value) return '';
  return value.toString().replace(/\./g, '');
}

// Setup price input formatting
function setupModalPriceFormatting() {
  const priceInput = document.getElementById('modalPrice');
  const originalPriceInput = document.getElementById('modalOriginalPrice');
  
  if (priceInput) {
    priceInput.addEventListener('input', function(e) {
      e.target.value = formatNumberWithDots(e.target.value);
    });
  }
  
  if (originalPriceInput) {
    originalPriceInput.addEventListener('input', function(e) {
      e.target.value = formatNumberWithDots(e.target.value);
    });
  }
}

// Setup form submit
function setupModalFormSubmit() {
  const form = document.getElementById('productForm');
  if (!form) return;
  
  // Remove existing listener
  const newForm = form.cloneNode(true);
  form.parentNode.replaceChild(newForm, form);
  
  // Re-get form after clone
  const newFormElement = document.getElementById('productForm');
  if (!newFormElement) return;
  
  newFormElement.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const formData = new FormData(newFormElement);
    const name = formData.get('productName')?.trim();
    const sku = formData.get('sku')?.trim();
    const category = formData.get('category');
    const priceRaw = formData.get('price') || '';
    const originalPriceRaw = formData.get('originalPrice') || '';
    const quantity = parseInt(formData.get('quantity')) || 0;
    const description = formData.get('description')?.trim() || '';
    
    // Validate
    if (!name) {
      alert('Vui lòng nhập tên sản phẩm!');
      return;
    }
    if (!category) {
      alert('Vui lòng chọn danh mục!');
      return;
    }
    
    const price = parseFloat(removeDotsFromNumber(priceRaw)) || 0;
    const originalPrice = parseFloat(removeDotsFromNumber(originalPriceRaw)) || price;
    
    if (price <= 0) {
      alert('Vui lòng nhập giá bán hợp lệ!');
      return;
    }
    
    // Get image
    const imagePreviewImg = document.getElementById('imagePreviewImg');
    let imageUrl = 'https://via.placeholder.com/40';
    if (imagePreviewImg && imagePreviewImg.src && !imagePreviewImg.src.includes('placeholder')) {
      imageUrl = imagePreviewImg.src;
    }
    
    // Determine status
    let status = 'success';
    let statusText = 'Đang bán';
    if (quantity <= 5 && quantity > 0) {
      status = 'pending';
      statusText = 'Sắp hết';
    }
    if (quantity === 0) {
      status = 'cancelled';
      statusText = 'Hết hàng';
    }
    
    const productData = {
      name: name,
      sku: sku || `SKU-${Date.now()}`,
      category: category,
      price: price,
      originalPrice: originalPrice,
      quantity: quantity,
      description: description,
      image: imageUrl,
      sold: 0,
      status: status,
      statusText: statusText,
      rating: 4.8,
      attributes: {}
    };
    
    let allProducts = getAllProductsCompat();
    
    if (editingProductId) {
      // Edit mode
      const index = allProducts.findIndex(p => p.id == editingProductId);
      if (index !== -1) {
        allProducts[index] = { ...allProducts[index], ...productData, id: editingProductId };
      }
    } else {
      // Add mode
      const newId = allProducts.length ? Math.max(...allProducts.map(p => parseInt(p.id) || 0)) + 1 : 1;
      allProducts.push({ ...productData, id: newId });
    }
    
    // Save to both keys
    try {
      localStorage.setItem('products', JSON.stringify(allProducts));
    } catch(e) {
      console.error('Error saving products:', e);
    }
    
    if (typeof saveAllProducts === 'function') {
      saveAllProducts(allProducts);
    }
    
    // Reload and close
    products = getAllProductsCompat();
    filteredProducts = products.slice();
    currentPage = 1;
    renderProducts();
    closeProductModal();
    
    alert(editingProductId ? 'Cập nhật sản phẩm thành công!' : 'Thêm sản phẩm thành công!');
  });
}

// Close modal when clicking outside
window.addEventListener('click', function(e) {
  const productModal = document.getElementById('productModal');
  const detailModal = document.getElementById('productDetailModal');
  
  if (e.target === productModal) {
    closeProductModal();
  }
  if (e.target === detailModal) {
    closeProductDetailModal();
  }
});

// Expose functions globally
window.openProductModal = openProductModal;
window.closeProductModal = closeProductModal;
window.openProductDetailModal = openProductDetailModal;
window.closeProductDetailModal = closeProductDetailModal;
window.viewFullProductDetailsFromModal = viewFullProductDetailsFromModal;
window.editProductFromDetailModal = editProductFromDetailModal;

// Initial render
products = getAllProductsCompat();
filteredProducts = products.slice();
renderProducts();

