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

// View product
function viewProduct(id) {
  localStorage.setItem('selectedProductId', String(id));
  window.location.href = 'product-details.html';
}

// Edit product
function editProduct(id) {
  localStorage.setItem('selectedProductId', String(id));
  window.location.href = 'product-edit.html';
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

// Initial render
products = getAllProductsCompat();
filteredProducts = products.slice();
renderProducts();

