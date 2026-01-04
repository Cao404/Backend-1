// Product Details Page
var PRODUCT_DETAILS_STORAGE_KEY = 'shopvn_product_details';
var currentProductId = null;
var currentSpecIndex = null;

// Load product details from localStorage
function loadProductDetails() {
  try {
    var raw = localStorage.getItem(PRODUCT_DETAILS_STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch (e) {
    console.error('Không thể đọc product details:', e);
    return {};
  }
}

// Save product details to localStorage
function saveProductDetails(details) {
  try {
    localStorage.setItem(PRODUCT_DETAILS_STORAGE_KEY, JSON.stringify(details));
  } catch (e) {
    console.error('Không thể lưu product details:', e);
  }
}

// Get current product
function getCurrentProduct() {
  // Try to get product ID from URL or localStorage
  var productId = new URLSearchParams(window.location.search).get('id');
  if (!productId) {
    productId = localStorage.getItem('selectedProductId');
  }
  
  if (!productId) {
    // Default to first product or show empty
    var products = typeof getAllProducts === 'function' ? getAllProducts() : [];
    if (products.length > 0) {
      productId = products[0].id;
    }
  }
  
  currentProductId = productId;
  
  if (productId) {
    var products = typeof getAllProducts === 'function' ? getAllProducts() : [];
    return products.find(function(p) { return p.id == productId; });
  }
  
  return null;
}

// Get default specs based on category and product data
function getDefaultSpecsForCategory(product) {
  if (!product) return [];
  
  var category = (product.category || '').toLowerCase();
  var categoryLower = category;
  var specs = [];
  
  // Electronics
  if (categoryLower.includes('laptop') || categoryLower.includes('điện tử') || categoryLower.includes('electronics') || 
      categoryLower.includes('ram') || categoryLower.includes('cpu') || categoryLower.includes('vga') || categoryLower.includes('main')) {
    // Auto-detect from product name
    var nameLower = (product.name || '').toLowerCase();
    var cpu = '';
    var ram = '';
    var storage = '';
    
    if (nameLower.includes('i5') || nameLower.includes('intel core i5')) cpu = 'Intel Core i5';
    else if (nameLower.includes('i7') || nameLower.includes('intel core i7')) cpu = 'Intel Core i7';
    else if (nameLower.includes('i9') || nameLower.includes('intel core i9')) cpu = 'Intel Core i9';
    else if (nameLower.includes('ryzen')) cpu = 'AMD Ryzen';
    
    if (nameLower.includes('8gb') || nameLower.includes('8 gb')) ram = '8GB';
    else if (nameLower.includes('16gb') || nameLower.includes('16 gb')) ram = '16GB';
    else if (nameLower.includes('32gb') || nameLower.includes('32 gb')) ram = '32GB';
    
    if (nameLower.includes('256gb') || nameLower.includes('256 gb')) storage = '256GB SSD';
    else if (nameLower.includes('512gb') || nameLower.includes('512 gb')) storage = '512GB SSD';
    else if (nameLower.includes('1tb') || nameLower.includes('1 tb')) storage = '1TB SSD';
    
    specs = [
      { label: 'Danh mục', value: product.category || '' },
      { label: 'Tên sản phẩm', value: product.name || '' },
      { label: 'CPU', value: cpu },
      { label: 'RAM', value: ram },
      { label: 'Ổ cứng', value: storage },
      { label: 'Card đồ họa', value: '' },
      { label: 'Màn hình', value: '' },
      { label: 'Hệ điều hành', value: 'Windows 11' },
      { label: 'Pin', value: '' },
      { label: 'Trọng lượng', value: '' },
      { label: 'Kích thước', value: '' }
    ];
  }
  // Fashion/Clothing
  else if (categoryLower.includes('fashion') || categoryLower.includes('thời trang') || categoryLower.includes('áo') || 
           categoryLower.includes('quần') || categoryLower.includes('hand bag') || categoryLower.includes('shoes') || 
           categoryLower.includes('cap') || categoryLower.includes('wallet')) {
    var sizes = (product.sizes && product.sizes.length > 0) ? product.sizes.join(', ') : '';
    var colors = (product.colors && product.colors.length > 0) ? product.colors.length + ' màu sắc' : '';
    
    // Auto-detect gender from product name
    var nameLower = (product.name || '').toLowerCase();
    var gender = '';
    if (nameLower.includes('nam') || nameLower.includes('men') || nameLower.includes('đàn ông')) {
      gender = 'Nam';
    } else if (nameLower.includes('nữ') || nameLower.includes('women') || nameLower.includes('phụ nữ')) {
      gender = 'Nữ';
    } else if (nameLower.includes('unisex')) {
      gender = 'Unisex';
    }
    
    // Auto-detect material from category
    var material = '';
    if (categoryLower.includes('bag') || categoryLower.includes('túi')) {
      material = 'Da thật';
    } else if (categoryLower.includes('shoes') || categoryLower.includes('giày')) {
      material = 'Da tổng hợp';
    } else if (categoryLower.includes('fashion') || categoryLower.includes('thời trang')) {
      material = 'Cotton 100%';
    }
    
    specs = [
      { label: 'Danh mục', value: product.category || '' },
      { label: 'Tên sản phẩm', value: product.name || '' },
      { label: 'Chất liệu', value: material },
      { label: 'Kích thước có sẵn', value: sizes },
      { label: 'Màu sắc', value: colors },
      { label: 'Giới tính', value: gender },
      { label: 'Xuất xứ', value: 'Việt Nam' },
      { label: 'Thương hiệu', value: 'shop vn' }
    ];
  }
  // General/Default
  else {
    specs = [
      { label: 'Danh mục', value: product.category || '' },
      { label: 'Tên sản phẩm', value: product.name || '' },
      { label: 'Kích thước', value: '' },
      { label: 'Trọng lượng', value: '' },
      { label: 'Nhà sản xuất', value: 'shop vn' },
      { label: 'Xuất xứ', value: 'Việt Nam' },
      { label: 'Mô tả', value: product.name || '' }
    ];
  }
  
  // Return all specs (don't filter - let user see all relevant fields)
  return specs;
}

// Render specs
function renderSpecs() {
  var product = getCurrentProduct();
  var specsGrid = document.getElementById('specsGrid');
  
  if (!specsGrid) {
    console.warn('Specs grid element not found');
    return;
  }
  
  if (!product) {
    specsGrid.innerHTML = '<div style="text-align:center;padding:40px;color:var(--muted)">Không tìm thấy sản phẩm</div>';
    return;
  }
  
  var details = loadProductDetails();
  if (!details || typeof details !== 'object') {
    details = {};
  }
  
  var productDetails = details[product.id] || { specs: [] };
  if (!productDetails.specs || !Array.isArray(productDetails.specs)) {
    productDetails.specs = [];
  }

  // If no specs, initialize with default based on category and product data
  if (productDetails.specs.length === 0) {
    var defaultSpecs = getDefaultSpecsForCategory(product);
    if (defaultSpecs && Array.isArray(defaultSpecs)) {
      productDetails.specs = defaultSpecs.map(function(spec) {
        return { label: spec.label || '', value: spec.value || '' };
      });
      details[product.id] = productDetails;
      saveProductDetails(details);
    }
  }
  
  // Update existing specs with product data if needed (auto-fill from product)
  productDetails.specs.forEach(function(spec) {
    if (spec.label === 'Danh mục' && (!spec.value || spec.value.trim() === '')) {
      spec.value = product.category || '';
    }
    if (spec.label === 'Kích thước có sẵn' && (!spec.value || spec.value.trim() === '') && product.sizes && product.sizes.length > 0) {
      spec.value = product.sizes.join(', ');
    }
    if (spec.label === 'Màu sắc' && (!spec.value || spec.value.trim() === '') && product.colors && product.colors.length > 0) {
      spec.value = product.colors.length + ' màu sắc';
    }
    if (spec.label === 'Thương hiệu' && (!spec.value || spec.value.trim() === '') && product.brand) {
      spec.value = product.brand;
    }
    if (spec.label === 'Tên sản phẩm' && (!spec.value || spec.value.trim() === '')) {
      spec.value = product.name || '';
    }
  });
  
  // Save updated specs
  details[product.id] = productDetails;
  saveProductDetails(details);
  
  var specsGrid = document.getElementById('specsGrid');
  var emptySpecs = document.getElementById('emptySpecs');
  
  if (!specsGrid) return;
  
  if (productDetails.specs.length === 0) {
    specsGrid.style.display = 'none';
    if (emptySpecs) emptySpecs.style.display = 'block';
    return;
  }
  
  specsGrid.style.display = 'block';
  if (emptySpecs) emptySpecs.style.display = 'none';
  
  specsGrid.innerHTML = productDetails.specs.map(function(spec, index) {
    var displayValue = spec.value && spec.value.trim() !== '' ? spec.value : 'Chưa có';
    var valueClass = spec.value && spec.value.trim() !== '' ? '' : 'style="color: var(--muted); font-style: italic;"';
    return (
      '<div class="spec-row" data-index="' + index + '">' +
      '  <div class="spec-label">' + (spec.label || 'N/A') + '</div>' +
      '  <div class="spec-value" style="display: flex; align-items: center; gap: 8px;">' +
      '    <span style="flex: 1;" ' + valueClass + '>' + displayValue + '</span>' +
      '    <button class="btn-small btn-edit" onclick="editSpec(' + index + ')" style="padding: 4px 8px; font-size: 11px;">Sửa</button>' +
      '    <button class="btn-small btn-delete" onclick="deleteSpec(' + index + ')" style="padding: 4px 8px; font-size: 11px;">Xóa</button>' +
      '  </div>' +
      '</div>'
    );
  }).join('');
}

// Open add spec modal
function openAddSpecModal(index) {
  var backdrop = document.getElementById('specModalBackdrop');
  var title = document.getElementById('specModalTitle');
  var form = document.getElementById('specForm');
  
  if (!backdrop || !title || !form) return;
  
  currentSpecIndex = index !== undefined ? index : null;
  backdrop.style.display = 'flex';
  
  if (index !== undefined) {
    title.textContent = 'Sửa Thông Tin Chi Tiết';
    var product = getCurrentProduct();
    if (product) {
      var details = loadProductDetails();
      var productDetails = details[product.id] || { specs: [] };
      if (productDetails.specs[index]) {
        document.getElementById('spec-label').value = productDetails.specs[index].label || '';
        document.getElementById('spec-value').value = productDetails.specs[index].value || '';
      }
    }
  } else {
    title.textContent = 'Thêm Thông Tin Chi Tiết';
    form.reset();
  }
}

// Close spec modal
function closeSpecModal(event) {
  if (event && event.target !== event.currentTarget) return;
  
  var backdrop = document.getElementById('specModalBackdrop');
  if (backdrop) {
    backdrop.style.display = 'none';
    document.getElementById('specForm').reset();
    currentSpecIndex = null;
  }
}

// Save spec
function saveSpec(event) {
  event.preventDefault();
  
  var product = getCurrentProduct();
  if (!product) {
    alert('Không tìm thấy sản phẩm');
    return;
  }
  
  var label = document.getElementById('spec-label').value.trim();
  var value = document.getElementById('spec-value').value.trim();
  
  if (!label || !value) {
    alert('Vui lòng điền đầy đủ thông tin');
    return;
  }
  
  var details = loadProductDetails();
  if (!details[product.id]) {
    details[product.id] = { specs: [] };
  }
  
  if (currentSpecIndex !== null) {
    // Edit existing spec
    if (details[product.id].specs[currentSpecIndex]) {
      details[product.id].specs[currentSpecIndex].label = label;
      details[product.id].specs[currentSpecIndex].value = value;
    }
  } else {
    // Add new spec
    details[product.id].specs.push({ label: label, value: value });
  }
  
  saveProductDetails(details);
  renderSpecs();
  closeSpecModal();
}

// Edit spec
function editSpec(index) {
  openAddSpecModal(index);
}

// Delete spec
function deleteSpec(index) {
  if (!confirm('Bạn có chắc muốn xóa thông tin này?')) return;
  
  var product = getCurrentProduct();
  if (!product) return;
  
  var details = loadProductDetails();
  if (details[product.id] && details[product.id].specs) {
    details[product.id].specs.splice(index, 1);
    saveProductDetails(details);
    renderSpecs();
  }
}

// Change main image
function changeImage(src, thumbnail) {
  var mainImg = document.querySelector('#mainImage img');
  if (mainImg) mainImg.src = src;
  document.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
  if (thumbnail) thumbnail.classList.add('active');
}

// Color selection
document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('.color-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
    });
  });
  
  // Render specs on load
  renderSpecs();
});

// Quantity control
function changeQty(delta) {
  const input = document.getElementById('qtyInput');
  if (!input) return;
  const newValue = parseInt(input.value) + delta;
  if (newValue >= 1) {
    input.value = newValue;
  }
}

// Add to cart - wrapper function for product details page
window.addToCartFromDetails = function() {
  // Get product ID from localStorage or current product
  const idRaw = localStorage.getItem('selectedProductId');
  const id = idRaw ? Number(idRaw) : NaN;
  
  if (isNaN(id)) {
    alert('Không tìm thấy sản phẩm!');
    return;
  }
  
  const qty = document.getElementById('qtyInput') ? parseInt(document.getElementById('qtyInput').value) || 1 : 1;
  
  // Use global addToCart function from products.js
  if (typeof window.addToCart === 'function') {
    window.addToCart(id, qty);
  } else {
    alert(`Đã thêm ${qty} sản phẩm vào giỏ hàng!`);
  }
};

// Toggle wishlist
function toggleWishlist(btn) {
  if (!btn) return;
  btn.classList.toggle('active');
  const svg = btn.querySelector('svg path');
  if (btn.classList.contains('active')) {
    svg.setAttribute('fill', '#ef4444');
    svg.setAttribute('stroke', '#ef4444');
  } else {
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', '#d7e0f0');
  }
}

// Smooth scroll animation
document.addEventListener('DOMContentLoaded', function() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.review-card').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'all 0.5s ease';
    observer.observe(card);
  });
});
