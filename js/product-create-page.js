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
      const container = document.getElementById('previewImage');
      let imgElement = container.querySelector('img');
      if (!imgElement) {
        container.innerHTML = '<img src="' + e.target.result + '" alt="Product" style="width:100%;height:100%;object-fit:contain;" />';
      } else {
        imgElement.src = e.target.result;
      }
    };
    reader.readAsDataURL(file);
  }
}

// Update preview
// Format price to VND
function formatPrice(price) {
  if (!price) return '0 ₫';
  const numPrice = parseFloat(price) || 0;
  return numPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' ₫';
}

function updatePreview() {
  const name = document.getElementById('productName').value;
  const category = document.getElementById('productCategory').value;
  const price = document.getElementById('productPrice').value;
  const discount = document.getElementById('productDiscount').value;
  
  document.getElementById('previewTitle').textContent = name;
  document.getElementById('previewSubtitle').textContent = '(' + category + ')';
  document.getElementById('previewPriceNew').textContent = formatPrice(price);
  
  if (discount > 0) {
    const oldPrice = Math.round(price / (1 - discount / 100));
    document.getElementById('previewPriceOld').textContent = formatPrice(oldPrice);
    document.getElementById('previewDiscount').textContent = 'Giảm ' + discount + '%';
    document.getElementById('previewPriceOld').style.display = 'block';
    document.getElementById('previewDiscount').style.display = 'block';
  } else {
    document.getElementById('previewPriceOld').style.display = 'none';
    document.getElementById('previewDiscount').style.display = 'none';
  }
}

// Create product: lưu vào localStorage thông qua kho sản phẩm chung
function createProduct() {
  // Lấy thông tin cơ bản từ form
  const nameInput = document.getElementById('productName');
  const categorySelect = document.getElementById('productCategory');
  const priceInput = document.getElementById('productPrice');
  const discountInput = document.getElementById('productDiscount');

  const name = nameInput ? nameInput.value.trim() : '';
  const category = categorySelect ? categorySelect.value : '';
  const price = priceInput ? Number(priceInput.value || 0) : 0;
  const discount = discountInput ? Number(discountInput.value || 0) : 0;

  if (!name) {
    alert('Vui lòng nhập tên sản phẩm');
    if (nameInput) nameInput.focus();
    return;
  }
  if (!category) {
    alert('Vui lòng chọn danh mục sản phẩm');
    if (categorySelect) categorySelect.focus();
    return;
  }

  // Lấy stock (nếu có)
  const stockInput = Array.prototype.slice.call(document.querySelectorAll('.form-section input.form-input'))
    .find(function (el) { return el.placeholder === 'Quantity'; });
  const stock = stockInput ? Number(stockInput.value || 0) : 0;

  // Lấy danh sách màu được chọn
  const colorPickers = document.querySelectorAll('#colorOptions .color-picker.active');
  const colors = Array.prototype.slice.call(colorPickers).map(function (el) {
    return window.getComputedStyle(el).backgroundColor;
  });

  // Lấy ảnh preview nếu có
  let image = '';
  const previewImg = document.querySelector('#previewImage img');
  if (previewImg && previewImg.src) {
    image = previewImg.src;
  }

  // Lấy danh sách sản phẩm hiện tại từ kho
  const products = typeof getAllProducts === 'function' ? getAllProducts() : [];
  const maxId = products.length ? Math.max.apply(null, products.map(function (p) { return p.id || 0; })) : 0;
  const newId = maxId + 1;

  const newProduct = {
    id: newId,
    name: name,
    price: price,
    oldPrice: discount > 0 ? Math.round(price / (1 - discount / 100)) : null,
    discount: discount > 0 ? discount : null,
    rating: 0,
    reviews: 0,
    stock: stock,
    sold: 0,
    image: image || 'https://via.placeholder.com/400x400?text=Product',
    category: category,
    sizes: [],
    colors: colors.length ? colors : ['#1a1a1a']
  };

  products.push(newProduct);
  if (typeof saveAllProducts === 'function') {
    saveAllProducts(products);
  }

  // Cập nhật số lượng sản phẩm cho danh mục
  updateCategoryProductCount(category);

  // Lưu id sản phẩm vừa tạo để có thể mở trực tiếp ở trang chi tiết/sửa
  localStorage.setItem('selectedProductId', String(newId));

  const notification = document.createElement('div');
  notification.style.cssText = '\
    position: fixed;\
    bottom: 30px;\
    right: 30px;\
    background: linear-gradient(135deg, #10b981, #059669);\
    color: white;\
    padding: 16px 24px;\
    border-radius: 12px;\
    box-shadow: 0 10px 40px rgba(0,0,0,0.3);\
    z-index: 10000;\
    font-weight: 600;\
    display: flex;\
    align-items: center;\
    gap: 12px;\
  ';
  notification.innerHTML = '<span style="font-size: 20px;">✓</span><span>Sản phẩm mới đã được tạo và lưu vào kho!</span>';
  document.body.appendChild(notification);
  
  setTimeout(function () {
    notification.remove();
    window.location.href = 'product-list.html';
  }, 2000);
}

// Drag and drop
var uploadArea = document.querySelector('.upload-area');
if (uploadArea) {
  uploadArea.addEventListener('dragover', function (e) {
    e.preventDefault();
    uploadArea.style.borderColor = 'var(--accent)';
    uploadArea.style.background = 'rgba(255, 143, 61, 0.1)';
  });
  
  uploadArea.addEventListener('dragleave', function () {
    uploadArea.style.borderColor = '';
    uploadArea.style.background = '';
  });
  
  uploadArea.addEventListener('drop', function (e) {
    e.preventDefault();
    uploadArea.style.borderColor = '';
    uploadArea.style.background = '';
    
    var file = e.dataTransfer.files[0];
    if (file && file.type && file.type.indexOf('image/') === 0) {
      var reader = new FileReader();
      reader.onload = function (ev) {
        var imgElement = document.querySelector('#previewImage img');
        if (!imgElement) {
          document.querySelector('#previewImage').innerHTML = '<img src="' + ev.target.result + '" alt="Product" style="width: 100%; height: 100%; object-fit: contain;" />';
        } else {
          imgElement.src = ev.target.result;
        }
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
  var navItem = element.parentElement;
  navItem.classList.toggle('open');
}

// Restore sidebar state on load
if (localStorage.getItem('sidebarCollapsed') === 'true') {
  document.querySelector('.layout').classList.add('collapsed');
}

// Load categories from localStorage and populate dropdown
function loadCategoriesIntoSelect() {
  const categorySelect = document.getElementById('productCategory');
  if (!categorySelect) {
    console.warn('Category select element not found');
    return;
  }
  
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
  }
}

// Toggle gender field based on category
function toggleCategorySpecificFields() {
  const categorySelect = document.getElementById('productCategory');
  const genderField = document.getElementById('genderField');
  
  if (!categorySelect) return;
  
  const category = categorySelect.value;
  // Categories that need gender: Fashion, Hand Bag, Shoes, Cap, Wallet
  const categoriesWithGender = ['Fashion', 'Hand Bag', 'Shoes', 'Cap', 'Wallet'];
  
  const shouldShow = categoriesWithGender.includes(category);
  
  if (genderField) genderField.style.display = shouldShow ? 'block' : 'none';
  
  // Reset values if hidden
  if (!shouldShow) {
    const genderSelect = document.getElementById('productGender');
    if (genderSelect) genderSelect.value = '';
  }
}

// Cập nhật số lượng sản phẩm cho danh mục sau khi thêm sản phẩm
// Sử dụng cùng logic với calculateProductCountForCategory trong category-list.js
function updateCategoryProductCount(categoryCode) {
  try {
    // Lấy danh sách danh mục từ localStorage
    const categoriesRaw = localStorage.getItem('shopvn_categories');
    if (!categoriesRaw) return;
    
    const categories = JSON.parse(categoriesRaw);
    if (!Array.isArray(categories)) return;
    
    // Lấy danh sách sản phẩm từ localStorage (giống category-list.js)
    const productsRaw = localStorage.getItem('shopvn_products');
    if (!productsRaw) return;
    
    const products = JSON.parse(productsRaw);
    if (!Array.isArray(products)) return;
    
    // Category mapping: Vietnamese name -> Product category code (giống category-list.js)
    const categoryMapping = {
      'Thời Trang': 'Fashion',
      'Thời Trang Nam': 'Fashion',
      'Thời Trang Nữ': 'Fashion',
      'Điện Tử': 'Electronics',
      'Điện tử': 'Electronics',
      'Điện Thoại': 'Electronics',
      'Điện thoại': 'Electronics',
      'điện thoại': 'Electronics',
      'Laptop': 'Electronics',
      'laptop': 'Electronics',
      'Linh kiện': 'Electronics',
      'Linh Kiện': 'Electronics',
      'RAM': 'Electronics',
      'CPU': 'Electronics',
      'VGA': 'Electronics',
      'Main': 'Electronics',
      'Nội Thất': 'Furniture',
      'Nội thất': 'Furniture',
      'Fashion': 'Fashion',
      'Electronics': 'Electronics',
      'Hand Bag': 'Hand Bag',
      'Túi xách': 'Hand Bag',
      'Túi Xách': 'Hand Bag',
      'Cap': 'Cap',
      'Mũ & Kính': 'Cap',
      'Mũ & kính': 'Cap',
      'Shoes': 'Shoes',
      'Giày dép': 'Shoes',
      'Giày Dép': 'Shoes',
      'Wallet': 'Wallet',
      'Ví': 'Wallet',
      'Watch': 'Watch',
      'Đồng hồ': 'Watch',
      'Đồng Hồ': 'Watch',
      'Headphone': 'Headphone',
      'Tai nghe': 'Headphone',
      'Tai Nghe': 'Headphone',
      'Beauty': 'Beauty',
      'Làm đẹp & Sức khỏe': 'Beauty',
      'Làm Đẹp & Sức Khỏe': 'Beauty',
      // Thêm mapping cho các biến thể của điện thoại - nhóm tất cả lại với nhau
      'smatphone': 'smatphone',
      'smartphone': 'smatphone',
      'Smartphone': 'smatphone',
      'SMARTPHONE': 'smatphone'
    };
    
    // Cập nhật số lượng sản phẩm cho tất cả danh mục
    let updated = false;
    categories.forEach(function(cat) {
      // Sử dụng cùng logic với calculateProductCountForCategory
      // Gọi trực tiếp hàm calculateProductCountForCategory nếu có, nếu không thì tính thủ công
      let count = 0;
      if (typeof calculateProductCountForCategory === 'function') {
        count = calculateProductCountForCategory(cat.name);
      } else {
        // Fallback: tính thủ công với logic đơn giản
        const normalizedCategoryName = (cat.name || '').toLowerCase().trim();
        const phoneVariants = ['smatphone', 'smartphone', 'điện thoại', 'điện thoại'];
        const isPhoneCategory = phoneVariants.some(function(v) {
          return normalizedCategoryName === v.toLowerCase().trim();
        });
        
        for (let i = 0; i < products.length; i++) {
          const productCategory = products[i].category || '';
          const normalizedProductCategory = (productCategory || '').toLowerCase().trim();
          
          if (!normalizedCategoryName || !normalizedProductCategory) continue;
          
          // Case 1: Khớp chính xác (case-insensitive)
          if (normalizedCategoryName === normalizedProductCategory) {
            count++;
            continue;
          }
          
          // Case 2: Nếu danh mục là điện thoại, đếm tất cả sản phẩm điện thoại
          if (isPhoneCategory) {
            const isProductPhone = phoneVariants.some(function(v) {
              return normalizedProductCategory === v.toLowerCase().trim();
            });
            if (isProductPhone) {
              count++;
              continue;
            }
          }
          
          // Case 3: Khớp chính xác (case-sensitive)
          if (productCategory === cat.name) {
            count++;
          }
        }
      }
      
      // Cập nhật nếu khác với giá trị hiện tại
      if (cat.productCount !== count) {
        cat.productCount = count;
        updated = true;
      }
    });
    
    // Lưu lại nếu có thay đổi
    if (updated) {
      localStorage.setItem('shopvn_categories', JSON.stringify(categories));
      console.log('Đã cập nhật số lượng sản phẩm cho các danh mục');
    }
  } catch (e) {
    console.error('Lỗi khi cập nhật số lượng sản phẩm cho danh mục:', e);
  }
}

// Load categories when page loads
document.addEventListener('DOMContentLoaded', function() {
  loadCategoriesIntoSelect();
  toggleCategorySpecificFields();
});