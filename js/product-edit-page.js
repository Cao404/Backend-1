let currentProductId = null;

// Toggle size/option selection
function toggleOption(element) {
  element.classList.toggle('active');
}

// Toggle color selection
function toggleColor(element) {
  element.classList.toggle('active');
}

// Handle file selection
function handleFileSelect(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      document.querySelector('#previewImage img').src = e.target.result;
    };
    reader.readAsDataURL(file);
  }
}

// Update product tags based on category
function updateProductTags() {
  const categorySelect = document.getElementById('productCategory');
  const tagsContainer = document.getElementById('productTags');
  
  if (!categorySelect || !tagsContainer) return;
  
  const category = categorySelect.value;
  
  // Category to tag mapping
  const categoryTagMap = {
    'Fashion': 'Thời trang',
    'Electronics': 'Điện tử',
    'Shoes': 'Giày dép',
    'Hand Bag': 'Túi xách',
    'Wallet': 'Ví',
    'Cap': 'Mũ & Kính',
    'Watch': 'Đồng hồ',
    'Furniture': 'Nội thất',
    'Headphone': 'Tai nghe',
    'Beauty': 'Làm đẹp & Sức khỏe'
  };
  
  // Tag colors
  const tagColors = [
    { bg: 'var(--accent)', color: '#2b1606' }, // Orange
    { bg: '#3b82f6', color: 'white' }, // Blue
    { bg: '#10b981', color: 'white' }, // Green
    { bg: '#f59e0b', color: 'white' }, // Yellow
    { bg: '#ef4444', color: 'white' }, // Red
    { bg: '#8b5cf6', color: 'white' }  // Purple
  ];
  
  if (category && categoryTagMap[category]) {
    const categoryName = categoryTagMap[category];
    const colorIndex = Object.keys(categoryTagMap).indexOf(category) % tagColors.length;
    const tagColor = tagColors[colorIndex];
    
    tagsContainer.innerHTML = '<span style="background: ' + tagColor.bg + '; color: ' + tagColor.color + '; padding: 2px 10px; border-radius: 4px; font-size: 12px; font-weight: 600;">' + categoryName + '</span>';
  } else {
    tagsContainer.innerHTML = '<span style="background: var(--muted); color: var(--text); padding: 2px 10px; border-radius: 4px; font-size: 12px; font-weight: 600;">Chưa chọn danh mục</span>';
  }
}

// Toggle gender and size fields based on category
function toggleGenderField() {
  const categorySelect = document.getElementById('productCategory');
  const genderField = document.getElementById('genderField');
  const sizeField = document.getElementById('sizeField');
  const previewSizes = document.getElementById('previewSizes');
  const previewSizeLabel = document.getElementById('previewSizeLabel');
  
  if (!categorySelect) return;
  
  const category = categorySelect.value;
  // Categories that need gender and size: Fashion, Hand Bag, Shoes, Cap, Wallet
  const categoriesWithSizeAndGender = ['Fashion', 'Hand Bag', 'Shoes', 'Cap', 'Wallet'];
  
  if (categoriesWithSizeAndGender.includes(category)) {
    // Show gender field
    if (genderField) genderField.style.display = 'block';
    // Show size field
    if (sizeField) sizeField.style.display = 'block';
    // Show preview sizes
    if (previewSizes) previewSizes.style.display = 'flex';
    if (previewSizeLabel) previewSizeLabel.style.display = 'block';
  } else {
    // Hide gender field
    if (genderField) {
      genderField.style.display = 'none';
      const genderSelect = document.getElementById('productGender');
      if (genderSelect) genderSelect.value = '';
    }
    // Hide size field
    if (sizeField) sizeField.style.display = 'none';
    // Hide preview sizes
    if (previewSizes) previewSizes.style.display = 'none';
    if (previewSizeLabel) previewSizeLabel.style.display = 'none';
  }
}

// Update preview
function updatePreview() {
  const name = document.getElementById('productName').value;
  const category = document.getElementById('productCategory').value;
  const price = document.getElementById('productPrice').value;
  const discount = document.getElementById('productDiscount').value;
  
  document.getElementById('previewTitle').textContent = name;
  document.getElementById('previewSubtitle').textContent = `(${category})`;
  document.getElementById('previewPriceNew').textContent = formatPrice(price);
  
  if (discount > 0) {
    const oldPrice = Math.round(price / (1 - discount / 100));
    document.getElementById('previewPriceOld').textContent = formatPrice(oldPrice);
    document.getElementById('previewDiscount').textContent = `Giảm ${discount}%`;
    document.getElementById('previewPriceOld').style.display = 'block';
    document.getElementById('previewDiscount').style.display = 'block';
  } else {
    document.getElementById('previewPriceOld').style.display = 'none';
    document.getElementById('previewDiscount').style.display = 'none';
  }
}

// Format price to VND
function formatPrice(price) {
  if (!price) return '0 ₫';
  const numPrice = parseFloat(price) || 0;
  return numPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' ₫';
}

// Save product: cập nhật lại trong kho localStorage
function saveProduct() {
  if (currentProductId == null) {
    alert('Không xác định được sản phẩm cần sửa. Hãy quay lại danh sách và chọn lại.');
    return;
  }

  const nameInput = document.getElementById('productName');
  const categorySelect = document.getElementById('productCategory');
  const priceInput = document.getElementById('productPrice');
  const discountInput = document.getElementById('productDiscount');

  const name = nameInput ? nameInput.value.trim() : '';
  const category = categorySelect ? categorySelect.value : '';
  const price = priceInput ? Number(priceInput.value || 0) : 0;
  const discount = discountInput ? Number(discountInput.value || 0) : 0;

  // Lấy ảnh hiện tại từ preview
  let image = '';
  const previewImg = document.querySelector('#previewImage img');
  if (previewImg && previewImg.src) {
    image = previewImg.src;
  }

  const products = typeof getAllProducts === 'function' ? getAllProducts() : [];
  const index = products.findIndex(function (p) { return p.id === currentProductId; });
  if (index === -1) {
    alert('Không tìm thấy sản phẩm trong kho.');
    return;
  }

  const existing = products[index];
  const oldCategory = existing.category;
  const newCategory = category || existing.category;
  
  products[index] = Object.assign({}, existing, {
    name: name || existing.name,
    category: newCategory,
    price: price || existing.price,
    discount: discount > 0 ? discount : null,
    oldPrice: discount > 0 ? Math.round(price / (1 - discount / 100)) : existing.oldPrice || null,
    image: image || existing.image
  });

  if (typeof saveAllProducts === 'function') {
    saveAllProducts(products);
  }

  // Cập nhật số lượng sản phẩm cho danh mục nếu danh mục thay đổi
  if (oldCategory !== newCategory) {
    updateCategoryProductCount(oldCategory);
    updateCategoryProductCount(newCategory);
  } else {
    updateCategoryProductCount(newCategory);
  }

  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    bottom: 30px;
    right: 30px;
    background: linear-gradient(135deg, #10b981, #059669);
    color: white;
    padding: 16px 24px;
    border-radius: 12px;
    box-shadow: 0 10px 40px rgba(0,0,0,0.3);
    z-index: 10000;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 12px;
  `;
  notification.innerHTML = '<span style="font-size: 20px;">✓</span><span>Sản phẩm đã được cập nhật và lưu vào kho!</span>';
  document.body.appendChild(notification);
  
  setTimeout(function () {
    notification.remove();
    window.location.href = 'product-list.html';
  }, 2000);
}

// Drag and drop
const uploadArea = document.querySelector('.upload-area');

if (uploadArea) {
  uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = 'var(--accent)';
    uploadArea.style.background = 'rgba(255, 143, 61, 0.1)';
  });
  
  uploadArea.addEventListener('dragleave', () => {
    uploadArea.style.borderColor = '';
    uploadArea.style.background = '';
  });
  
  uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = '';
    uploadArea.style.background = '';
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        document.querySelector('#previewImage img').src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  });
}

// Toggle sidebar
function toggleSidebar() {
  document.querySelector('.layout').classList.toggle('collapsed');
  localStorage.setItem('sidebarCollapsed', document.querySelector('.layout').classList.contains('collapsed'));
}

// Toggle submenu
function toggleSubmenu(element) {
  const navItem = element.parentElement;
  navItem.classList.toggle('open');
}

// Restore sidebar state on load
if (localStorage.getItem('sidebarCollapsed') === 'true') {
  document.querySelector('.layout').classList.add('collapsed');
}

// Load categories from localStorage and populate dropdown
function loadCategoriesIntoSelect() {
  const categorySelect = document.getElementById('productCategory');
  if (!categorySelect) return;
  
  try {
    // Load categories from localStorage
    const categoriesRaw = localStorage.getItem('shopvn_categories');
    const categories = categoriesRaw ? JSON.parse(categoriesRaw) : [];
    
    // Category name to code mapping (Vietnamese -> English code)
    const categoryNameToCode = {
      'Thời Trang': 'Fashion',
      'Thời Trang Nam': 'Fashion',
      'Thời Trang Nữ': 'Fashion',
      'Điện Tử': 'Electronics',
      'Điện tử': 'Electronics',
      'Điện Thoại': 'Electronics',
      'Laptop': 'Electronics',
      'Linh kiện': 'Electronics',
      'RAM': 'Electronics',
      'CPU': 'Electronics',
      'VGA': 'Electronics',
      'Main': 'Electronics',
      'Giày dép': 'Shoes',
      'Giày Dép': 'Shoes',
      'Túi xách': 'Hand Bag',
      'Túi Xách': 'Hand Bag',
      'Ví': 'Wallet',
      'Mũ & Kính': 'Cap',
      'Mũ & kính': 'Cap',
      'Đồng hồ': 'Watch',
      'Đồng Hồ': 'Watch',
      'Nội Thất': 'Furniture',
      'Nội thất': 'Furniture',
      'Tai nghe': 'Headphone',
      'Tai Nghe': 'Headphone',
      'Làm đẹp & Sức khỏe': 'Beauty',
      'Làm Đẹp & Sức Khỏe': 'Beauty'
    };
    
    // Also support direct code mapping
    const directCodeMap = {
      'Fashion': 'Fashion',
      'Electronics': 'Electronics',
      'Shoes': 'Shoes',
      'Hand Bag': 'Hand Bag',
      'Wallet': 'Wallet',
      'Cap': 'Cap',
      'Watch': 'Watch',
      'Furniture': 'Furniture',
      'Headphone': 'Headphone',
      'Beauty': 'Beauty'
    };
    
    // Get current selected value
    const currentValue = categorySelect.value;
    
    // Clear existing options except the first placeholder
    const placeholder = categorySelect.querySelector('option[value=""][disabled]');
    categorySelect.innerHTML = '';
    if (placeholder) {
      categorySelect.appendChild(placeholder);
    } else {
      categorySelect.innerHTML = '<option value="" disabled selected>Chọn danh mục</option>';
    }
    
    // If no categories in localStorage, use default categories
    if (!categories || categories.length === 0) {
      const defaultCategories = [
        { name: 'Thời trang', code: 'Fashion' },
        { name: 'Điện tử', code: 'Electronics' },
        { name: 'Giày dép', code: 'Shoes' },
        { name: 'Túi xách', code: 'Hand Bag' },
        { name: 'Ví', code: 'Wallet' },
        { name: 'Mũ & Kính', code: 'Cap' }
      ];
      
      defaultCategories.forEach(function(cat) {
        const option = document.createElement('option');
        option.value = cat.code;
        option.textContent = cat.name;
        categorySelect.appendChild(option);
      });
    } else {
      // Group categories by parent
      const mainCategories = [];
      const subCategories = {};
      
      categories.forEach(function(cat) {
        if (!cat.parentId) {
          mainCategories.push(cat);
        } else {
          if (!subCategories[cat.parentId]) {
            subCategories[cat.parentId] = [];
          }
          subCategories[cat.parentId].push(cat);
        }
      });
      
      // Sort main categories
      mainCategories.sort(function(a, b) {
        return a.name.localeCompare(b.name);
      });
      
      // Add main categories and their subcategories
      mainCategories.forEach(function(cat) {
        // Get category code
        let categoryCode = categoryNameToCode[cat.name] || directCodeMap[cat.name] || cat.name;
        
        // Add main category
        const mainOption = document.createElement('option');
        mainOption.value = categoryCode;
        mainOption.textContent = cat.name;
        categorySelect.appendChild(mainOption);
        
        // Add subcategories if any
        if (subCategories[cat.id] && subCategories[cat.id].length > 0) {
          subCategories[cat.id].sort(function(a, b) {
            return a.name.localeCompare(b.name);
          });
          
          subCategories[cat.id].forEach(function(subCat) {
            const subOption = document.createElement('option');
            subOption.value = categoryNameToCode[subCat.name] || directCodeMap[subCat.name] || subCat.name;
            subOption.textContent = cat.name + ' > ' + subCat.name;
            categorySelect.appendChild(subOption);
          });
        }
      });
    }
    
    // Restore selected value if it exists
    if (currentValue) {
      categorySelect.value = currentValue;
    }
    
    return currentValue; // Return for use in product loading
  } catch (e) {
    console.error('Error loading categories:', e);
    // Fallback to default categories on error
    const defaultCategories = [
      { name: 'Thời trang', code: 'Fashion' },
      { name: 'Điện tử', code: 'Electronics' },
      { name: 'Giày dép', code: 'Shoes' },
      { name: 'Túi xách', code: 'Hand Bag' },
      { name: 'Ví', code: 'Wallet' },
      { name: 'Mũ & Kính', code: 'Cap' }
    ];
    
    defaultCategories.forEach(function(cat) {
      const option = document.createElement('option');
      option.value = cat.code;
      option.textContent = cat.name;
      categorySelect.appendChild(option);
    });
    return null;
  }
}

// Khi DOM sẵn sàng, đọc sản phẩm được chọn và đổ vào form
document.addEventListener('DOMContentLoaded', function () {
  // Load categories first
  loadCategoriesIntoSelect();
  
  const idRaw = localStorage.getItem('selectedProductId');
  const id = idRaw ? Number(idRaw) : NaN;
  let product = null;
  if (!isNaN(id) && typeof getProductById === 'function') {
    product = getProductById(id);
  }

  if (!product && typeof getAllProducts === 'function') {
    const all = getAllProducts();
    product = all && all.length ? all[0] : null;
  }

  if (!product) return;
  currentProductId = product.id;

  // Đổ dữ liệu cơ bản vào preview + form
  const previewImg = document.querySelector('#previewImage img');
  if (previewImg && product.image) previewImg.src = product.image;

  const previewTitle = document.getElementById('previewTitle');
  const previewSubtitle = document.getElementById('previewSubtitle');
  const previewPriceNew = document.getElementById('previewPriceNew');
  const previewPriceOld = document.getElementById('previewPriceOld');
  const previewDiscount = document.getElementById('previewDiscount');

  if (previewTitle) previewTitle.textContent = product.name || '';
  if (previewSubtitle) previewSubtitle.textContent = `(${product.category || ''})`;
  if (previewPriceNew) previewPriceNew.textContent = formatPrice(product.price || 0);
  if (previewPriceOld) {
    if (product.oldPrice) {
      previewPriceOld.textContent = formatPrice(product.oldPrice);
      previewPriceOld.style.display = 'block';
    } else {
      previewPriceOld.style.display = 'none';
    }
  }
  if (previewDiscount) {
    if (product.discount) {
      previewDiscount.textContent = `Giảm ${product.discount}%`;
      previewDiscount.style.display = 'block';
    } else {
      previewDiscount.style.display = 'none';
    }
  }

  const nameInput = document.getElementById('productName');
  const categorySelect = document.getElementById('productCategory');
  const priceInput = document.getElementById('productPrice');
  const discountInput = document.getElementById('productDiscount');

  if (nameInput) nameInput.value = product.name || '';
  
  // Set category after categories are loaded
  if (categorySelect && product.category) {
    // Wait a bit for categories to be populated
    setTimeout(function() {
      categorySelect.value = product.category;
      toggleGenderField(); // Update gender field visibility
      updateProductTags(); // Update tags based on category
    }, 100);
  } else {
    // Call even if no category to set initial state
    toggleGenderField();
    updateProductTags();
  }
  if (priceInput) priceInput.value = product.price || 0;
  if (discountInput) discountInput.value = product.discount || 0;
  
  // Set gender if exists
  const genderSelect = document.getElementById('productGender');
  if (genderSelect && product.gender) {
    genderSelect.value = product.gender;
  }
});

