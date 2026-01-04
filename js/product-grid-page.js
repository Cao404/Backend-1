

// Initialize product grid
document.addEventListener('DOMContentLoaded', function() {
  console.log('Product Grid Page loaded');
  
  // Render products
  renderProductGrid();
  
  // Setup search
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', function() {
      renderProductGrid();
    });
  }
  
  // Setup sort
  const sortSelect = document.getElementById('sortSelect');
  if (sortSelect) {
    sortSelect.addEventListener('change', function() {
      renderProductGrid();
    });
  }
  
  // Setup filters
  setupFilters();
});

// Render product grid with beautiful cards
function renderProductGrid() {
  const grid = document.getElementById('productsGrid');
  const resultsInfo = document.getElementById('resultsInfo');
  if (!grid) return;
  
  // Get all products
  let products = getAllProductsCompat();
  
  // Apply search filter
  const searchInput = document.getElementById('searchInput');
  if (searchInput && searchInput.value.trim()) {
    const searchTerm = searchInput.value.trim().toLowerCase();
    products = products.filter(function(p) {
      return (p.name && p.name.toLowerCase().includes(searchTerm)) ||
             (p.sku && p.sku.toLowerCase().includes(searchTerm)) ||
             (p.category && p.category.toLowerCase().includes(searchTerm));
    });
  }
  
  
  const selectedCategories = getSelectedCategories();
  if (selectedCategories.length > 0 && !selectedCategories.includes('all')) {
    products = products.filter(function(p) {
      return selectedCategories.includes(p.category);
    });
  }
  
  // Apply price filter
  products = applyPriceFilter(products);
  
  // Apply sort
  const sortSelect = document.getElementById('sortSelect');
  if (sortSelect) {
    const sortValue = sortSelect.value;
    products = sortProducts(products, sortValue);
  }
  
  // Update results info
  if (resultsInfo) {
    resultsInfo.innerHTML = 'Hiển thị <strong>' + products.length + '</strong> kết quả';
  }
  
  // Render products
  if (products.length === 0) {
    grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:60px 20px;color:var(--muted)"><div style="font-size:48px;margin-bottom:16px">📦</div><div style="font-size:16px;font-weight:600;margin-bottom:8px">Không tìm thấy sản phẩm</div><div style="font-size:14px">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</div></div>';
    return;
  }
  
  grid.innerHTML = products.map(function(product) {
    const image = product.image || 'https://via.placeholder.com/300';
    const price = product.price || 0;
    const originalPrice = product.originalPrice || price;
    const discount = originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;
    const category = typeof getCategoryDisplayName === 'function' ? getCategoryDisplayName(product.category) : (product.category || 'N/A');
    const status = getProductStatus(product);
    
    return `
      <div class="product-card" data-product-id="${product.id}">
        <div class="product-image" onclick="viewProductFromGrid(${product.id})">
          <img src="${image}" alt="${product.name || 'Product'}" onerror="this.src='https://via.placeholder.com/300'" />
          ${discount > 0 ? `<div class="discount-badge">-${discount}%</div>` : ''}
          <div class="wishlist-btn" onclick="event.stopPropagation();toggleWishlist(${product.id})" title="Thêm vào yêu thích">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </div>
        </div>
        <div class="product-info">
          <div class="product-category" style="font-size:12px;color:var(--muted);margin-bottom:6px;text-transform:uppercase;letter-spacing:0.5px">${category}</div>
          <div class="product-name" onclick="viewProductFromGrid(${product.id})" title="${product.name || ''}">${product.name || 'N/A'}</div>
          <div class="product-meta" style="display:flex;justify-content:space-between;align-items:center;margin-top:8px;font-size:12px;color:var(--muted)">
            <span>SKU: ${product.sku || product.id || 'N/A'}</span>
            <span class="status ${status.class}" style="display:inline-block;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:600">${status.text}</span>
          </div>
          <div class="product-price">
            <span class="current-price">${formatPrice(price)}</span>
            ${originalPrice > price ? `<span class="old-price">${formatPrice(originalPrice)}</span>` : ''}
          </div>
          <div class="product-actions" style="display:flex;gap:8px;margin-top:12px">
            <button class="btn-view" onclick="viewProductFromGrid(${product.id})" style="flex:1;padding:8px;background:var(--panel-2);border:1px solid var(--line);border-radius:6px;color:var(--text);font-size:13px;font-weight:600;cursor:pointer;transition:all 0.2s" onmouseover="this.style.background='var(--panel)';this.style.borderColor='var(--accent)'" onmouseout="this.style.background='var(--panel-2)';this.style.borderColor='var(--line)'">👁️ Xem</button>
            <button class="btn-edit" onclick="editProductFromGrid(${product.id})" style="flex:1;padding:8px;background:var(--accent);border:none;border-radius:6px;color:#2b1606;font-size:13px;font-weight:700;cursor:pointer;transition:all 0.2s" onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 4px 12px rgba(255,143,61,0.3)'" onmouseout="this.style.transform='translateY(0)';this.style.boxShadow='none'">✏️ Sửa</button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// Get selected categories from filter
function getSelectedCategories() {
  const selected = [];
  const allCheckbox = document.getElementById('filter-all-categories');
  if (allCheckbox && allCheckbox.checked) {
    return ['all'];
  }
  
  const checkboxes = document.querySelectorAll('#categoryFiltersList input[type="checkbox"]:checked');
  checkboxes.forEach(function(cb) {
    const category = cb.getAttribute('data-category');
    if (category) selected.push(category);
  });
  
  return selected.length > 0 ? selected : ['all'];
}

// Apply price filter
function applyPriceFilter(products) {
  const allPriceCheckbox = document.getElementById('filter-all-prices');
  if (allPriceCheckbox && allPriceCheckbox.checked) {
    return products;
  }
  
  const selectedRanges = [];
  document.querySelectorAll('[data-price-range]:checked').forEach(function(cb) {
    const range = cb.getAttribute('data-price-range');
    if (range && range !== 'all') selectedRanges.push(range);
  });
  
  if (selectedRanges.length === 0) return products;
  
  // Custom price range
  const priceMin = document.getElementById('priceMin');
  const priceMax = document.getElementById('priceMax');
  const min = priceMin && priceMin.value ? parseFloat(priceMin.value) : null;
  const max = priceMax && priceMax.value ? parseFloat(priceMax.value) : null;
  
  return products.filter(function(p) {
    const price = p.price || 0;
    
    // Check custom range
    if (min !== null && price < min) return false;
    if (max !== null && price > max) return false;
    
    // Check predefined ranges
    if (selectedRanges.length > 0) {
      return selectedRanges.some(function(range) {
        const [minRange, maxRange] = range.split('-').map(Number);
        return price >= minRange && price <= maxRange;
      });
    }
    
    return true;
  });
}

// Sort products
function sortProducts(products, sortValue) {
  const sorted = products.slice();
  
  switch(sortValue) {
    case 'price-asc':
      sorted.sort(function(a, b) { return (a.price || 0) - (b.price || 0); });
      break;
    case 'price-desc':
      sorted.sort(function(a, b) { return (b.price || 0) - (a.price || 0); });
      break;
    case 'name-asc':
      sorted.sort(function(a, b) {
        const nameA = (a.name || '').toLowerCase();
        const nameB = (b.name || '').toLowerCase();
        return nameA.localeCompare(nameB);
      });
      break;
    case 'name-desc':
      sorted.sort(function(a, b) {
        const nameA = (a.name || '').toLowerCase();
        const nameB = (b.name || '').toLowerCase();
        return nameB.localeCompare(nameA);
      });
      break;
    case 'newest':
    default:
      sorted.sort(function(a, b) {
        const dateA = a.createdAt || a.id || 0;
        const dateB = b.createdAt || b.id || 0;
        return dateB - dateA;
      });
      break;
  }
  
  return sorted;
}

// Get product status
function getProductStatus(product) {
  const quantity = product.quantity || product.stock || 0;
  if (quantity === 0) {
    return { class: 'cancelled', text: 'Hết hàng' };
  } else if (quantity <= 5) {
    return { class: 'pending', text: 'Sắp hết' };
  } else {
    return { class: 'success', text: 'Đang bán' };
  }
}

// Format price
function formatPrice(price) {
  if (!price) return '0 ₫';
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' ₫';
}

// View product from grid
function viewProductFromGrid(productId) {
  console.log('View product:', productId);
  const product = getProductByIdCompat(productId);
  if (!product) {
    console.error('Product not found:', productId);
    alert('Không tìm thấy sản phẩm!');
    return;
  }
  
  // Try to use openProductDetailModal from product-list-page.js
  if (typeof window.openProductDetailModal === 'function') {
    console.log('Using openProductDetailModal');
    window.openProductDetailModal(product);
  } else {
    // Fallback: manually open modal
    console.log('Manually opening detail modal');
    openProductDetailModalManual(product);
  }
}

// Manual open product detail modal (fallback)
function openProductDetailModalManual(product) {
  const modal = document.getElementById('productDetailModal');
  if (!modal) {
    console.error('productDetailModal not found');
    // Fallback: redirect to product details page
    window.location.href = 'product-details.html?id=' + product.id;
    return;
  }
  
  // Fill detail info
  const detailImage = document.getElementById('detailImage');
  const detailName = document.getElementById('detailName');
  const detailCategory = document.getElementById('detailCategory');
  const detailSku = document.getElementById('detailSku');
  const detailPrice = document.getElementById('detailPrice');
  const detailQuantity = document.getElementById('detailQuantity');
  const detailDescription = document.getElementById('detailDescription');
  const detailAttributes = document.getElementById('detailAttributes');
  
  if (detailImage) {
    detailImage.src = product.image || 'https://via.placeholder.com/300';
    // Ensure onclick handler is set
    detailImage.onclick = function(e) {
      e.stopPropagation();
      viewFullProductDetails();
    };
  }
  if (detailName) detailName.textContent = product.name || 'N/A';
  if (detailCategory) {
    const categoryName = typeof getCategoryDisplayName === 'function' ? getCategoryDisplayName(product.category) : (product.category || 'N/A');
    detailCategory.textContent = categoryName;
  }
  if (detailSku) detailSku.textContent = product.sku || product.id || 'N/A';
  if (detailPrice) detailPrice.textContent = formatPrice(product.price);
  if (detailQuantity) detailQuantity.textContent = product.quantity || product.stock || 0;
  if (detailDescription) detailDescription.textContent = product.description || '—';
  
  // Fill attributes
  if (detailAttributes) {
    const attrs = product.attributes || {};
    const keys = Object.keys(attrs);
    if (keys.length === 0) {
      detailAttributes.innerHTML = '<div style="color:var(--muted);padding:20px;text-align:center">Không có thuộc tính thêm.</div>';
    } else {
      detailAttributes.innerHTML = '<h4 style="font-size:16px;font-weight:700;margin-bottom:12px;color:var(--text)">Thuộc tính</h4>' +
        keys.map(key => `
          <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--line)">
            <span style="color:var(--muted);font-size:14px">${key}:</span>
            <span style="color:var(--text);font-size:14px;font-weight:600">${attrs[key] || '—'}</span>
          </div>
        `).join('');
    }
  }
  
  // Store product ID for edit button
  if (modal) {
    modal.dataset.productId = product.id;
  }
  
  modal.style.display = 'flex';
}

// Edit product from detail modal
function editProductFromDetailModal() {
  const modal = document.getElementById('productDetailModal');
  if (!modal) return;
  
  const productId = modal.dataset.productId;
  if (!productId) return;
  
  closeProductDetailModal();
  editProductFromGrid(productId);
}

// Close product detail modal
function closeProductDetailModal() {
  const modal = document.getElementById('productDetailModal');
  if (modal) modal.style.display = 'none';
}

// View full product details page (from modal image click)
function viewFullProductDetails() {
  const modal = document.getElementById('productDetailModal');
  if (!modal) return;
  
  const productId = modal.dataset.productId;
  if (!productId) return;
  
  // Store product ID for product-details.html
  localStorage.setItem('selectedProductId', productId);
  
  // Also store full product data
  const product = getProductByIdCompat(productId);
  if (product) {
    localStorage.setItem('selectedProduct', JSON.stringify(product));
  }
  
  // Close modal and navigate
  closeProductDetailModal();
  window.location.href = 'product-details.html';
}

// Edit product from grid
function editProductFromGrid(productId) {
  if (typeof window.openProductModal === 'function') {
    const product = getProductByIdCompat(productId);
    if (product) {
      window.openProductModal(product);
    }
  } else {
    // Fallback: redirect to product edit page
    window.location.href = 'product-edit.html?id=' + productId;
  }
}

// Toggle wishlist (placeholder)
function toggleWishlist(productId) {
  console.log('Toggle wishlist for product:', productId);
  // TODO: Implement wishlist functionality
}

// Setup filters
function setupFilters() {
  // Category filters
  const allCategoryCheckbox = document.getElementById('filter-all-categories');
  if (allCategoryCheckbox) {
    allCategoryCheckbox.addEventListener('change', function() {
      if (this.checked) {
        document.querySelectorAll('#categoryFiltersList input[type="checkbox"]').forEach(function(cb) {
          cb.checked = false;
        });
        renderProductGrid();
        updateCategoryCounts();
      }
    });
  }
  
  document.querySelectorAll('#categoryFiltersList input[type="checkbox"]').forEach(function(cb) {
    cb.addEventListener('change', function() {
      if (this.checked && allCategoryCheckbox) {
        allCategoryCheckbox.checked = false;
      }
      renderProductGrid();
      updateCategoryCounts();
    });
  });
  
  // Price filters
  const allPriceCheckbox = document.getElementById('filter-all-prices');
  if (allPriceCheckbox) {
    allPriceCheckbox.addEventListener('change', function() {
      if (this.checked) {
        document.querySelectorAll('[data-price-range]:checked').forEach(function(cb) {
          cb.checked = false;
        });
        renderProductGrid();
        updatePriceCounts();
      }
    });
  }
  
  document.querySelectorAll('[data-price-range]').forEach(function(cb) {
    cb.addEventListener('change', function() {
      if (this.checked && allPriceCheckbox) {
        allPriceCheckbox.checked = false;
      }
      renderProductGrid();
      updatePriceCounts();
    });
  });
  
  // Custom price range
  const priceMin = document.getElementById('priceMin');
  const priceMax = document.getElementById('priceMax');
  if (priceMin) {
    priceMin.addEventListener('input', function() {
      renderProductGrid();
    });
  }
  if (priceMax) {
    priceMax.addEventListener('input', function() {
      renderProductGrid();
    });
  }
  
  
  if (typeof renderCategoryFilters === 'function') {
    renderCategoryFilters();
  }
  if (typeof updateCategoryCounts === 'function') {
    updateCategoryCounts();
  }
  if (typeof updatePriceCounts === 'function') {
    updatePriceCounts();
  }
}


function getProductByIdCompat(id) {
  const products = getAllProductsCompat();
  return products.find(function(p) { return p.id == id; }) || null;
}


function getAllProductsCompat() {
  try {
    const shopvn = localStorage.getItem('shopvn_products');
    if (shopvn) {
      const parsed = JSON.parse(shopvn);
      if (Array.isArray(parsed)) return parsed;
    }
    const products = localStorage.getItem('products');
    if (products) {
      const parsed = JSON.parse(products);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch(e) {
    console.error('Error loading products:', e);
  }
  return [];
}


window.viewProductFromGrid = viewProductFromGrid;
window.editProductFromGrid = editProductFromGrid;
window.toggleWishlist = toggleWishlist;
window.closeProductDetailModal = closeProductDetailModal;
window.editProductFromDetailModal = editProductFromDetailModal;
window.viewFullProductDetails = viewFullProductDetails;
