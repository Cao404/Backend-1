// Products JavaScript
// Dùng cho product-grid.html, product-list.html, product-details.html

// Format price to VND
function formatPrice(price) {
  if (!price) return '0 ₫';
  const numPrice = parseFloat(price) || 0;
  return numPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' ₫';
}

// Sample product data (dùng làm dữ liệu khởi tạo cho kho localStorage)
const PRODUCTS_DATA = [
  {
    id: 1,
    name: 'Áo thun nam màu đen Slim Fit',
    price: 80,
    oldPrice: 100,
    discount: 30,
    rating: 4.5,
    reviews: 65,
    stock: 486,
    sold: 155,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
    category: 'Fashion',
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    colors: ['#1a1a1a', '#ffffff', '#ef4444', '#3b82f6', '#10b981']
  },
  {
    id: 2,
    name: 'Túi da màu xanh ô liu',
    price: 136,
    oldPrice: 150,
    discount: 30,
    rating: 4.1,
    reviews: 143,
    stock: 784,
    sold: 674,
    image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=400',
    category: 'Hand Bag',
    sizes: ['S', 'M'],
    colors: ['#4ade80', '#1a1a1a']
  },
  {
    id: 3,
    name: 'Phụ nữ vàng Dress',
    price: 219,
    oldPrice: 250,
    discount: 30,
    rating: 4.4,
    reviews: 174,
    stock: 769,
    sold: 180,
    image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400',
    category: 'Fashion',
    sizes: ['S', 'M', 'L'],
    colors: ['#fbbf24', '#ef4444']
  },
  {
    id: 4,
    name: 'Mũ Xám Cho Nam',
    price: 76,
    oldPrice: 100,
    discount: 30,
    rating: 4.2,
    reviews: 23,
    stock: 571,
    sold: 87,
    image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400',
    category: 'Cap',
    sizes: ['S', 'M', 'L'],
    colors: ['#6b7280', '#1a1a1a']
  },
  {
    id: 5,
    name: 'Dark Green Cargo Pent',
    price: 110,
    oldPrice: null,
    discount: null,
    rating: 4.4,
    reviews: 109,
    stock: 241,
    sold: 342,
    image: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400',
    category: 'Fashion',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['#166534', '#1a1a1a']
  },
  {
    id: 6,
    name: 'Orange Multi Color Headphone',
    price: 231,
    oldPrice: null,
    discount: null,
    rating: 4.2,
    reviews: 200,
    stock: 821,
    sold: 231,
    image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=400',
    category: 'Electronics',
    sizes: ['S', 'M'],
    colors: ['#f97316', '#ec4899']
  },
  {
    id: 7,
    name: "Kid's Yellow Shoes",
    price: 89,
    oldPrice: null,
    discount: null,
    rating: 4.5,
    reviews: 321,
    stock: 321,
    sold: 681,
    image: 'https://images.unsplash.com/photo-1514989940723-e8e51635b782?w=400',
    category: 'Shoes',
    sizes: ['18', '19', '20', '21'],
    colors: ['#fbbf24', '#3b82f6']
  },
  {
    id: 8,
    name: 'Men Dark Brown Wallet',
    price: 132,
    oldPrice: null,
    discount: null,
    rating: 4.1,
    reviews: 190,
    stock: 190,
    sold: 212,
    image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=400',
    category: 'Wallet',
    sizes: ['S', 'M'],
    colors: ['#78350f', '#1a1a1a']
  }
];

// Kho sản phẩm trong localStorage
const PRODUCT_STORAGE_KEY = 'shopvn_products';

// Mapping danh mục: code -> tên hiển thị tiếng Việt
const CATEGORY_NAMES = {
  'Fashion': 'Thời trang',
  'Hand Bag': 'Túi xách',
  'Cap': 'Mũ & Kính',
  'Electronics': 'Điện tử',
  'Shoes': 'Giày dép',
  'Wallet': 'Ví',
  'Watch': 'Đồng hồ',
  'Furniture': 'Nội thất',
  'Headphone': 'Tai nghe',
  'Beauty': 'Làm đẹp & Sức khỏe'
};

// Lấy tên hiển thị của danh mục
function getCategoryDisplayName(categoryCode) {
  return CATEGORY_NAMES[categoryCode] || categoryCode;
}

// Export to global scope
window.getCategoryDisplayName = getCategoryDisplayName;
window.CATEGORY_NAMES = CATEGORY_NAMES;

// Đọc toàn bộ sản phẩm từ localStorage, nếu chưa có thì seed từ PRODUCTS_DATA
function getAllProducts() {
  try {
    const raw = localStorage.getItem(PRODUCT_STORAGE_KEY);
    if (!raw) {
      const seed = Array.isArray(PRODUCTS_DATA) ? PRODUCTS_DATA.slice() : [];
      localStorage.setItem(PRODUCT_STORAGE_KEY, JSON.stringify(seed));
      return seed;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return Array.isArray(PRODUCTS_DATA) ? PRODUCTS_DATA.slice() : [];
    }
    return parsed;
  } catch (e) {
    console.error('Không thể đọc kho sản phẩm, dùng PRODUCTS_DATA mặc định', e);
    return Array.isArray(PRODUCTS_DATA) ? PRODUCTS_DATA.slice() : [];
  }
}

// Ghi toàn bộ danh sách sản phẩm vào localStorage
function saveAllProducts(products) {
  try {
    localStorage.setItem(PRODUCT_STORAGE_KEY, JSON.stringify(products || []));
  } catch (e) {
    console.error('Không thể lưu kho sản phẩm', e);
  }
}

// Lấy 1 sản phẩm theo id từ kho
function getProductById(id) {
  const products = getAllProducts();
  return products.find(function (p) { return p.id === id; }) || null;
}

// Product Grid Functions
function initProductGrid() {
  const grid = document.getElementById('productsGrid');
  const searchInput = document.getElementById('searchInput');
  const sortSelect = document.getElementById('sortSelect');
  
  if (!grid) return;
  
  // Luôn lấy dữ liệu mới nhất từ kho
  let currentProducts = getAllProducts();
  
  // Render products
  function renderProducts(products = currentProducts) {
    grid.innerHTML = '';
    
    products.forEach(product => {
      const card = createProductCard(product);
      grid.appendChild(card);
    });
    
    // Update results count
    const resultsInfo = document.querySelector('.results-info');
    if (resultsInfo) {
      resultsInfo.innerHTML = `Hiển thị tất cả <strong>${products.length}</strong> kết quả`;
    }
  }
  
  // Create product card
  function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.onclick = () => {
      // Lưu thông tin sản phẩm được chọn để trang chi tiết sử dụng
      if (product && typeof product.id !== 'undefined') {
        localStorage.setItem('selectedProductId', String(product.id));
      }
      localStorage.setItem('selectedProduct', JSON.stringify(product));
      window.location.href = 'product-details.html';
    };
    
    card.innerHTML = `
      <div class="product-image">
        <img src="${product.image}" alt="${product.name}" />
        ${product.discount ? `<div class="discount-badge">Giảm ${product.discount}%</div>` : ''}
        <div class="wishlist-btn" onclick="event.stopPropagation(); toggleWishlist(this, ${product.id})">
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="currentColor" stroke-width="2"/>
          </svg>
        </div>
      </div>
      <div class="product-info">
        <div class="product-name">${product.name}</div>
        <div class="product-rating">
          <svg viewBox="0 0 24 24" fill="currentColor" style="color:#fbbf24">
            <polygon points="12 2 15 8 22 9 17 14 18 21 12 18 6 21 7 14 2 9 9 8"/>
          </svg>
          ${product.rating} <span style="color: var(--muted)">· ${product.reviews} Đánh giá</span>
        </div>
        <div class="product-price">
          <div class="current-price">${formatPrice(product.price)}</div>
          ${product.oldPrice ? `<div class="old-price">${formatPrice(product.oldPrice)}</div>` : ''}
        </div>
        <button class="add-to-cart-btn" onclick="event.stopPropagation(); addToCart(${product.id})">
          <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" stroke="currentColor" stroke-width="2"/>
            <line x1="3" y1="6" x2="21" y2="6" stroke="currentColor" stroke-width="2"/>
          </svg>
          Thêm vào giỏ hàng
        </button>
      </div>
    `;
    
    return card;
  }
  
  // Search functionality
  let searchTerm = '';
  if (searchInput) {
    searchInput.addEventListener('input', function(e) {
      searchTerm = e.target.value.toLowerCase();
      applyFilters();
    });
  }
  
  // Sort functionality
  if (sortSelect) {
    sortSelect.addEventListener('change', function(e) {
      applyFilters();
    });
  }
  
  // Apply search to filtered products
  function applySearch(products) {
    if (!searchTerm) return products;
    return products.filter(function (p) {
      return (
        (p.name || '').toLowerCase().includes(searchTerm) ||
        (p.category || '').toLowerCase().includes(searchTerm)
      );
    });
  }
  
  // Apply sort to filtered products
  function applySort(products) {
    if (!sortSelect) return products;
    const sorted = products.slice();
    switch(sortSelect.value) {
      case 'Giá: Thấp đến Cao':
        sorted.sort(function (a, b) { return (a.price || 0) - (b.price || 0); });
        break;
      case 'Giá: Cao đến Thấp':
        sorted.sort(function (a, b) { return (b.price || 0) - (a.price || 0); });
        break;
      case 'Đánh giá cao nhất':
        sorted.sort(function (a, b) { return (b.rating || 0) - (a.rating || 0); });
        break;
      default:
        // Mới nhất - giữ nguyên thứ tự
        break;
    }
    return sorted;
  }
  
  // Update category counts
  function updateCategoryCounts() {
    const allProducts = getAllProducts();
    const categoryMap = {};
    
    // Count products by category
    allProducts.forEach(product => {
      const cat = product.category || 'Other';
      categoryMap[cat] = (categoryMap[cat] || 0) + 1;
    });
    
    // Update all category count
    const allCountEl = document.getElementById('count-all');
    if (allCountEl) {
      allCountEl.textContent = allProducts.length.toLocaleString('vi-VN');
    }
    
    // Update individual category counts
    document.querySelectorAll('[data-category-count]').forEach(el => {
      const category = el.getAttribute('data-category-count');
      const count = categoryMap[category] || 0;
      el.textContent = count.toLocaleString('vi-VN');
    });
  }
  
  // Get all unique categories from products
  function getAllCategoriesFromProducts() {
    const products = getAllProducts();
    const categorySet = new Set();
    products.forEach(product => {
      if (product.category) {
        categorySet.add(product.category);
      }
    });
    return Array.from(categorySet);
  }
  
  // Update price range counts
  function updatePriceCounts() {
    const allProducts = getAllProducts();
    const priceRanges = {
      '0-200000': 0,
      '200000-500000': 0,
      '500000-800000': 0,
      '800000-1000000': 0,
      '1000000-1100000': 0
    };
    
    allProducts.forEach(product => {
      const price = product.price || 0;
      if (price < 200000) priceRanges['0-200000']++;
      else if (price < 500000) priceRanges['200000-500000']++;
      else if (price < 800000) priceRanges['500000-800000']++;
      else if (price < 1000000) priceRanges['800000-1000000']++;
      else if (price <= 1100000) priceRanges['1000000-1100000']++;
    });
    
    Object.keys(priceRanges).forEach(range => {
      const el = document.querySelector(`[data-price-count="${range}"]`);
      if (el) {
        el.textContent = `(${priceRanges[range].toLocaleString('vi-VN')})`;
      }
    });
  }
  
  // Filter functionality
  function applyFilters() {
    const allProducts = getAllProducts();
    let filtered = allProducts.slice();
    
    // Category filter
    const allCategoriesCheckbox = document.getElementById('filter-all-categories');
    const categoryCheckboxes = document.querySelectorAll('[data-category]:not([data-category="all"])');
    const selectedCategories = [];
    
    if (allCategoriesCheckbox && allCategoriesCheckbox.checked) {
      // All categories selected
    } else {
      categoryCheckboxes.forEach(cb => {
        if (cb.checked) {
          selectedCategories.push(cb.getAttribute('data-category'));
        }
      });
      
      if (selectedCategories.length > 0) {
        filtered = filtered.filter(p => selectedCategories.includes(p.category));
      } else {
        // No category selected, show nothing
        filtered = [];
      }
    }
    
    // Price range filter
    const allPricesCheckbox = document.getElementById('filter-all-prices');
    const priceCheckboxes = document.querySelectorAll('[data-price-range]:not([data-price-range="all"])');
    const selectedPriceRanges = [];
    
    if (allPricesCheckbox && allPricesCheckbox.checked) {
      // All prices selected
    } else {
      priceCheckboxes.forEach(cb => {
        if (cb.checked) {
          selectedPriceRanges.push(cb.getAttribute('data-price-range'));
        }
      });
      
      if (selectedPriceRanges.length > 0) {
        filtered = filtered.filter(p => {
          const price = p.price || 0;
          return selectedPriceRanges.some(range => {
            const [min, max] = range.split('-').map(Number);
            return price >= min && price < (max || Infinity);
          });
        });
      } else {
        // No price range selected, show nothing
        filtered = [];
      }
    }
    
    // Custom price range filter
    const priceMin = document.getElementById('priceMin');
    const priceMax = document.getElementById('priceMax');
    if (priceMin && priceMin.value) {
      const min = Number(priceMin.value);
      filtered = filtered.filter(p => (p.price || 0) >= min);
    }
    if (priceMax && priceMax.value) {
      const max = Number(priceMax.value);
      filtered = filtered.filter(p => (p.price || 0) <= max);
    }
    
    // Apply search
    filtered = applySearch(filtered);
    
    // Apply sort
    filtered = applySort(filtered);
    
    currentProducts = filtered;
    renderProducts(currentProducts);
  }
  
  // Setup filter event listeners (will be called after renderCategoryFilters)
  function setupFilterListeners() {
    // Use event delegation to handle dynamically added checkboxes
    const filterSidebar = document.querySelector('.filter-sidebar');
    if (!filterSidebar) return;
    
    // Remove old listeners and add new one using delegation
    filterSidebar.addEventListener('change', function(e) {
      if (e.target.type === 'checkbox') {
        const checkbox = e.target;
        
        // Handle "all categories" checkbox
        if (checkbox.id === 'filter-all-categories') {
          if (checkbox.checked) {
            document.querySelectorAll('[data-category]:not([data-category="all"])').forEach(cb => {
              cb.checked = false;
            });
          }
        } else if (checkbox.getAttribute('data-category')) {
          // If a specific category is checked, uncheck "all categories"
          const allCatCheckbox = document.getElementById('filter-all-categories');
          if (allCatCheckbox && checkbox.checked) {
            allCatCheckbox.checked = false;
          }
        }
        
        // Handle "all prices" checkbox
        if (checkbox.id === 'filter-all-prices') {
          if (checkbox.checked) {
            document.querySelectorAll('[data-price-range]:not([data-price-range="all"])').forEach(cb => {
              cb.checked = false;
            });
          }
        } else if (checkbox.getAttribute('data-price-range')) {
          // If a specific price range is checked, uncheck "all prices"
          const allPriceCheckbox = document.getElementById('filter-all-prices');
          if (allPriceCheckbox && checkbox.checked) {
            allPriceCheckbox.checked = false;
          }
        }
        
        applyFilters();
      }
    });
  }
  
  // Custom price range inputs
  const priceMin = document.getElementById('priceMin');
  const priceMax = document.getElementById('priceMax');
  if (priceMin) {
    priceMin.addEventListener('input', applyFilters);
  }
  if (priceMax) {
    priceMax.addEventListener('input', applyFilters);
  }
  
  // View toggle
  const viewButtons = document.querySelectorAll('.view-btn');
  viewButtons.forEach((btn, index) => {
    btn.addEventListener('click', function() {
      if (index === 1) {
        window.location.href = 'product-list.html';
      }
    });
  });
  
  // Render category filters dynamically
  function renderCategoryFilters() {
    const categories = getAllCategoriesFromProducts();
    const container = document.getElementById('categoryFiltersList');
    if (!container) return;
    
    container.innerHTML = '';
    
    categories.forEach(categoryCode => {
      const displayName = getCategoryDisplayName(categoryCode);
      const label = document.createElement('label');
      label.className = 'filter-checkbox';
      label.innerHTML = `
        <input type="checkbox" data-category="${categoryCode}" />
        <span>${displayName}</span>
        <span class="filter-count" data-category-count="${categoryCode}">0</span>
      `;
      container.appendChild(label);
    });
  }
  
  // Setup filter listeners once
  setupFilterListeners();
  
  // Initial render
  renderCategoryFilters();
  updateCategoryCounts();
  updatePriceCounts();
  renderProducts();
}

// Product Details Functions
function initProductDetails() {
  let product = null;

  // Ưu tiên id sản phẩm được chọn
  const idRaw = localStorage.getItem('selectedProductId');
  const id = idRaw ? Number(idRaw) : NaN;
  if (!isNaN(id)) {
    product = getProductById(id);
  }

  // Fallback: selectedProduct cũ (nếu còn dùng ở nơi khác)
  if (!product) {
    const savedProduct = localStorage.getItem('selectedProduct');
    if (savedProduct) {
      try {
        product = JSON.parse(savedProduct);
      } catch (e) {
        product = null;
      }
    }
  }

  if (product) {
    displayProductDetails(product);
  }
  
  // Image gallery
  setupImageGallery();
  
  // Size selection
  setupSizeSelection();
  
  // Color selection
  setupColorSelection();
  
  // Quantity control
  setupQuantityControl();
  
  // Tabs
  setupTabs();
}

function displayProductDetails(product) {
  if (!product) return;

  // Cập nhật ảnh chính
  const mainImage = document.querySelector('#mainImage img');
  if (mainImage && product.image) {
    mainImage.src = product.image;
    mainImage.alt = product.name || '';
  }

  // Tiêu đề sản phẩm
  const titleElement = document.querySelector('.product-title');
  if (titleElement) {
    titleElement.textContent = product.name || '';
  }

  // Giá hiện tại
  const priceElement = document.querySelector('.current-price') || document.getElementById('productPrice');
  if (priceElement) {
    priceElement.textContent = formatPrice(product.price || 0);
  }

  // Giá cũ (nếu có)
  const oldPriceElement = document.querySelector('.price-section .old-price') || document.getElementById('productOldPrice');
  if (oldPriceElement) {
    if (product.oldPrice) {
      oldPriceElement.textContent = formatPrice(product.oldPrice);
      oldPriceElement.style.display = 'inline-block';
    } else {
      oldPriceElement.style.display = 'none';
    }
  }

  // Badge giảm giá (nếu có)
  const discountBadge = document.querySelector('.price-section .discount-badge');
  if (discountBadge) {
    if (product.discount) {
      discountBadge.textContent = `Giảm ${product.discount}%`;
      discountBadge.style.display = 'inline-block';
    } else {
      discountBadge.style.display = 'none';
    }
  }
}

function setupImageGallery() {
  window.changeImage = function(src, thumbnail) {
    const mainImage = document.querySelector('#mainImage img');
    if (mainImage) mainImage.src = src;
    
    document.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
    thumbnail.classList.add('active');
  };
}

function setupSizeSelection() {
  document.querySelectorAll('.size-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
    });
  });
}

function setupColorSelection() {
  document.querySelectorAll('.color-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
    });
  });
}

function setupQuantityControl() {
  window.changeQty = function(delta) {
    const input = document.getElementById('qtyInput');
    if (!input) return;
    
    const newValue = parseInt(input.value) + delta;
    if (newValue >= 1) {
      input.value = newValue;
    }
  };
}

function setupTabs() {
  window.switchTab = function(index) {
    document.querySelectorAll('.tab-btn').forEach((btn, i) => {
      btn.classList.toggle('active', i === index);
    });
    document.querySelectorAll('.tab-pane').forEach((pane, i) => {
      pane.classList.toggle('active', i === index);
    });
  };
}

// Wishlist Functions
window.toggleWishlist = function(btn, productId) {
  btn.classList.toggle('active');
  
  let wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
  
  if (btn.classList.contains('active')) {
    if (!wishlist.includes(productId)) {
      wishlist.push(productId);
    }
    showNotification('Đã thêm vào wishlist! ❤️', 'success');
  } else {
    wishlist = wishlist.filter(id => id !== productId);
    showNotification('Đã xóa khỏi wishlist', 'info');
  }
  
  localStorage.setItem('wishlist', JSON.stringify(wishlist));
};

// Add to Cart Function
window.addToCart = function(productId, quantity = 1) {
  // Get product from getAllProducts() instead of PRODUCTS_DATA
  const product = getProductById(productId);
  if (!product) {
    console.error('Product not found:', productId);
    if (typeof showNotification === 'function') {
      showNotification('Không tìm thấy sản phẩm!', 'error');
    }
    return;
  }
  
  let cart = JSON.parse(localStorage.getItem('cart') || '[]');
  
  const existingItem = cart.find(item => item.id === productId);
  if (existingItem) {
    existingItem.quantity = (existingItem.quantity || 1) + quantity;
  } else {
    cart.push({
      id: productId,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: quantity
    });
  }
  
  localStorage.setItem('cart', JSON.stringify(cart));
  
  // Update cart badge - CHỈ cập nhật badge có id="sidebarCartBadge"
  if (typeof updateCartBadge === 'function') {
    updateCartBadge();
  } else {
    // Fallback: update badge directly - CHỈ cập nhật badge có id="sidebarCartBadge"
    const cartBadge = document.getElementById('sidebarCartBadge');
    if (cartBadge) {
      const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
      if (totalItems > 0) {
        cartBadge.textContent = totalItems;
        cartBadge.style.display = 'inline-block';
      } else {
        cartBadge.style.display = 'none';
      }
    }
  }
  
  if (typeof showNotification === 'function') {
    showNotification(`Đã thêm "${product.name}" vào giỏ hàng! 🛒`, 'success');
  } else {
    alert(`Đã thêm "${product.name}" vào giỏ hàng!`);
  }
};

// Update cart badge - CHỈ cập nhật badge có id="sidebarCartBadge" (chỉ có ở trang sản phẩm)
function updateCartBadge() {
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  
  // CHỈ cập nhật badge có id="sidebarCartBadge" (chỉ có ở các trang sản phẩm)
  const badge = document.getElementById('sidebarCartBadge');
  if (badge) {
    badge.textContent = totalItems;
    badge.style.display = totalItems > 0 ? 'inline-block' : 'none';
  }
}

// Show notification
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  
  const colors = {
    success: { bg: 'linear-gradient(135deg, #10b981, #059669)', icon: '✓' },
    error: { bg: 'linear-gradient(135deg, #ef4444, #dc2626)', icon: '✕' },
    info: { bg: 'linear-gradient(135deg, #3b82f6, #2563eb)', icon: 'ℹ' }
  };
  
  const color = colors[type] || colors.info;
  
  notification.style.cssText = `
    position: fixed;
    bottom: 30px;
    right: 30px;
    background: ${color.bg};
    color: white;
    padding: 16px 24px;
    border-radius: 12px;
    box-shadow: 0 10px 40px rgba(0,0,0,0.3);
    z-index: 10000;
    animation: slideUp 0.3s ease;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 12px;
    max-width: 400px;
  `;
  
  notification.innerHTML = `
    <span style="font-size: 20px;">${color.icon}</span>
    <span>${message}</span>
  `;
  
  document.body.appendChild(notification);
  
  // Add animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideUp {
      from { transform: translateY(100px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
  `;
  document.head.appendChild(style);
  
  setTimeout(() => {
    notification.style.animation = 'slideUp 0.3s ease reverse';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
  const currentPage = window.location.pathname.split('/').pop();
  
  if (currentPage === 'product-grid.html') {
    initProductGrid();
  } else if (currentPage === 'product-details.html') {
    initProductDetails();
  }
  
  // Load wishlist state
  const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
  wishlist.forEach(productId => {
    const btn = document.querySelector(`[onclick*="toggleWishlist"][onclick*="${productId}"]`);
    if (btn) btn.classList.add('active');
  });
  
  // Update cart badge
  updateCartBadge();
});


