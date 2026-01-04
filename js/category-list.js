// Category list management
var CATEGORY_STORAGE_KEY = 'shopvn_categories';
var CATEGORY_ITEMS_PER_PAGE = 8;
var categoryCurrentPage = 1;
var allCategories = [];

function loadCategories() {
  try {
    var raw = localStorage.getItem(CATEGORY_STORAGE_KEY);
    if (!raw) {
      return [];
    }
    var parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Không thể đọc danh mục', e);
    return [];
  }
}

function getParentCategoryName(categories, parentId) {
  if (!parentId) return null;
  for (var i = 0; i < categories.length; i++) {
    if (categories[i].id === parentId) {
      return categories[i].name;
    }
  }
  return null;
}

function formatDate(timestamp) {
  if (!timestamp) return '-';
  var date = new Date(timestamp);
  var day = String(date.getDate()).padStart(2, '0');
  var month = String(date.getMonth() + 1).padStart(2, '0');
  var year = date.getFullYear();
  return day + '/' + month + '/' + year;
}

// Calculate product count from actual product data (same as admin-category-attributes.js)
function calculateProductCountForCategory(categoryName) {
  try {
    var productsRaw = localStorage.getItem('shopvn_products');
    if (!productsRaw) return 0;
    
    var products = JSON.parse(productsRaw);
    if (!Array.isArray(products)) return 0;
    
    if (!categoryName) return 0;
    
    // Normalize category name for comparison (lowercase, trim)
    var normalizedCategoryName = (categoryName || '').toLowerCase().trim();
    
    // Nhóm các biến thể điện thoại lại với nhau - tất cả đều được coi là cùng một danh mục
    var phoneVariants = ['smatphone', 'smartphone', 'điện thoại', 'điện thoại'];
    var isPhoneCategory = phoneVariants.some(function(v) {
      return normalizedCategoryName === v.toLowerCase().trim();
    });
    
    var count = 0;
    for (var i = 0; i < products.length; i++) {
      var productCategory = products[i].category || '';
      var normalizedProductCategory = (productCategory || '').toLowerCase().trim();
      
      // Nếu cả hai đều rỗng, bỏ qua
      if (!normalizedCategoryName || !normalizedProductCategory) {
        continue;
      }
      
      // Case 1: Khớp chính xác (case-insensitive)
      if (normalizedCategoryName === normalizedProductCategory) {
        count++;
        continue;
      }
      
      // Case 2: Nếu danh mục là điện thoại (bất kỳ biến thể nào), đếm tất cả sản phẩm điện thoại
      if (isPhoneCategory) {
        var isProductPhone = phoneVariants.some(function(v) {
          return normalizedProductCategory === v.toLowerCase().trim();
        });
        if (isProductPhone) {
          count++;
          continue;
        }
      }
      
      // Case 3: Khớp chính xác (case-sensitive) như fallback
      if (productCategory === categoryName) {
        count++;
      }
    }
    
    return count;
  } catch (e) {
    console.error('Error calculating product count:', e);
    return 0;
  }
}

function renderCategories() {
  // Clean up duplicates first
  cleanupDuplicateCategories();
  
  allCategories = loadCategories();
  var tbody = document.getElementById('categoryTableBody');
  if (!tbody) {
    tbody = document.querySelector('.table tbody');
  }
  if (!tbody) return;

  // If no categories, show default data
  if (allCategories.length === 0) {
    // Keep the default HTML rows
    return;
  }

  // Clear existing rows (except header)
  tbody.innerHTML = '';

  var startIndex = (categoryCurrentPage - 1) * CATEGORY_ITEMS_PER_PAGE;
  var endIndex = Math.min(startIndex + CATEGORY_ITEMS_PER_PAGE, allCategories.length);

  // Render each category in current page
  for (var i = startIndex; i < endIndex; i++) {
    var cat = allCategories[i];
    var parentName = getParentCategoryName(allCategories, cat.parentId);
    var categoryType = cat.parentId ? 'Danh mục con' : 'Danh mục chính';
    var parentDisplay = parentName ? parentName : '<span style="color:var(--muted)">—</span>';
    
    // Calculate actual product count from product data - LUÔN tính lại từ dữ liệu thực tế
    var actualCount = calculateProductCountForCategory(cat.name);
    // Luôn dùng actualCount (tính từ dữ liệu thực tế), không dùng giá trị cũ
    var productCount = actualCount;
    
    // Cập nhật stored count để đồng bộ
    if (cat.productCount !== actualCount) {
      cat.productCount = actualCount;
    }
    
    // Get image - use default if not available
    var imageUrl = cat.image || 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=100';
    
    var row = document.createElement('tr');
    row.dataset.id = cat.id;
    var icon = cat.icon || '📦';
    var code = cat.code || 'N/A';
    var status = cat.status || 'success';
    var statusText = cat.statusText || 'Đang bán';
    
    row.innerHTML = [
      '<td>' + (i + 1) + '</td>',
      '<td>',
      '  <div style="display: flex; align-items: center; gap: 10px">',
      '    <span style="font-size: 20px;">' + icon + '</span>',
      '    <span style="font-weight: 500;">' + (cat.name || '') + '</span>',
      '  </div>',
      '</td>',
      '<td>' + code + '</td>',
      '<td>' + productCount + '</td>',
      '<td>' + (parentName || '—') + '</td>',
      '<td><span class="status ' + status + '">' + statusText + '</span></td>',
      '<td class="cell-right">',
      '  <div class="action-menu">',
      '    <button type="button" class="action-toggle" aria-label="Thao tác">⋯</button>',
      '    <div class="action-dropdown">',
      '      <button class="action-item" data-action="edit" data-category-id="' + cat.id + '">✏️ Chỉnh sửa</button>',
      '      <button class="action-item" data-action="add-child" data-category-id="' + cat.id + '">➕ Thêm danh mục con</button>',
      '      <button class="action-item" data-action="manage-attributes" data-category-id="' + cat.id + '">🏷️ Quản lý thuộc tính</button>',
      '      <button class="action-item danger" data-action="delete" data-category-id="' + cat.id + '">🗑 Xóa danh mục</button>',
      '    </div>',
      '  </div>',
      '</td>'
    ].join('');

    tbody.appendChild(row);
  }

  // Save updated counts
  if (allCategories.some(function(c) { return c.productCount !== (calculateProductCountForCategory(c.name) || 0); })) {
    try {
      localStorage.setItem(CATEGORY_STORAGE_KEY, JSON.stringify(allCategories));
    } catch (e) {
      console.error('Error saving updated counts:', e);
    }
  }
  
  // Update pagination info
  updatePaginationInfo(allCategories.length);
  renderCategoryPagination();
  
  // Update KPI cards
  updateCategoryKpis();
  
  // Setup action menu handlers
  setupCategoryActionMenuHandler();
}

function updatePaginationInfo(total) {
  var pageInfo = document.getElementById('categoryPageInfo');
  if (pageInfo) {
    if (total === 0) {
      pageInfo.textContent = 'Không có kết quả';
      return;
    }
    var start = (categoryCurrentPage - 1) * CATEGORY_ITEMS_PER_PAGE + 1;
    var end = Math.min(categoryCurrentPage * CATEGORY_ITEMS_PER_PAGE, total);
    pageInfo.textContent = 'Hiển thị ' + start + '-' + end + ' trong ' + total + ' kết quả';
  }
}

function renderCategoryPagination() {
  var pagination = document.getElementById('categoryPagination');
  if (!pagination) return;

  var total = allCategories.length;
  var totalPages = Math.ceil(total / CATEGORY_ITEMS_PER_PAGE) || 1;

  var html = '';

  html += '<button style="padding:6px 12px;background:var(--panel);border:1px solid var(--line);border-radius:6px;color:var(--muted);cursor:pointer" ' +
          (categoryCurrentPage === 1 ? 'disabled' : 'onclick="changeCategoryPage(' + (categoryCurrentPage - 1) + ')"') +
          '>Trước đó</button>';

  for (var i = 1; i <= totalPages; i++) {
    if (i === categoryCurrentPage) {
      html += '<button style="padding:6px 12px;background:var(--accent);border:1px solid var(--accent);border-radius:6px;color:#2b1606;font-weight:700;cursor:pointer">' + i + '</button>';
    } else {
      html += '<button style="padding:6px 12px;background:var(--panel);border:1px solid var(--line);border-radius:6px;color:var(--text);cursor:pointer" onclick="changeCategoryPage(' + i + ')">' + i + '</button>';
    }
  }

  html += '<button style="padding:6px 12px;background:var(--panel);border:1px solid var(--line);border-radius:6px;color:var(--text);cursor:pointer" ' +
          (categoryCurrentPage === totalPages ? 'disabled' : 'onclick="changeCategoryPage(' + (categoryCurrentPage + 1) + ')"') +
          '>Tiếp theo</button>';

  pagination.innerHTML = html;
}

function changeCategoryPage(page) {
  var total = allCategories.length;
  var totalPages = Math.ceil(total / CATEGORY_ITEMS_PER_PAGE) || 1;
  if (page < 1 || page > totalPages) return;
  categoryCurrentPage = page;
  renderCategories();
}

function deleteCategory(id) {
  if (!confirm('Bạn có chắc muốn xóa danh mục này?')) {
    return;
  }

  var categories = loadCategories();
  var index = -1;
  for (var i = 0; i < categories.length; i++) {
    if (categories[i].id === id) {
      index = i;
      break;
    }
  }

  if (index !== -1) {
    categories.splice(index, 1);
    try {
      localStorage.setItem(CATEGORY_STORAGE_KEY, JSON.stringify(categories));
      alert('Xóa danh mục thành công!');
      renderCategories();
    } catch (e) {
      console.error('Lỗi khi xóa danh mục:', e);
      alert('Có lỗi xảy ra khi xóa danh mục!');
    }
  }
}

// Clean up duplicate categories and ensure data consistency
function cleanupDuplicateCategories() {
  var categories = loadCategories();
  var cleaned = [];
  var seen = {}; // Track seen categories by name+parentId
  
  for (var i = 0; i < categories.length; i++) {
    var cat = categories[i];
    var key = (cat.name || '').toLowerCase() + '_' + (cat.parentId || 'null');
    
    // Skip if we've seen this exact combination before
    if (seen[key]) {
      console.log('Xóa danh mục trùng lặp:', cat.name, 'parentId:', cat.parentId);
      continue;
    }
    
    seen[key] = true;
    cleaned.push(cat);
  }
  
  if (cleaned.length !== categories.length) {
    localStorage.setItem(CATEGORY_STORAGE_KEY, JSON.stringify(cleaned));
    console.log('Đã làm sạch dữ liệu: ' + (categories.length - cleaned.length) + ' danh mục trùng lặp đã bị xóa');
    return true;
  }
  
  return false;
}

// Calculate total product count for a category including all subcategories
function calculateTotalProductCount(category, categories) {
  if (!category) return 0;
  
  // Count products in this category
  var count = calculateProductCountForCategory(category.name);
  
  // Find all subcategories
  var subcategories = categories.filter(function(c) {
    return c.parentId === category.id;
  });
  
  // Add counts from subcategories recursively
  for (var i = 0; i < subcategories.length; i++) {
    count += calculateTotalProductCount(subcategories[i], categories);
  }
  
  return count;
}

// Update category cards from actual category data in localStorage
// DISABLED: Category cards section has been removed
function updateCategoryCards() {
  // Category cards section has been removed, so this function does nothing
  return;
}

// Modal functions for add/edit category
var editingCategoryId = null;

function openCategoryModal(id) {
  var modal = document.getElementById('categoryModal');
  var form = document.getElementById('categoryForm');
  var title = document.getElementById('categoryModalTitle');
  var submitBtn = document.getElementById('categoryModalSubmit');
  var nameInput = document.getElementById('modalCategoryName');
  var codeInput = document.getElementById('modalCategoryCode');
  var iconInput = document.getElementById('modalCategoryIcon');
  var parentSelect = document.getElementById('modalCategoryParent');
  var descTextarea = document.getElementById('modalCategoryDescription');
  
  if (!modal || !form) return;
  
  // Reset form
  form.reset();
  editingCategoryId = null;
  
  // Load categories for parent dropdown
  var categories = loadCategories();
  if (parentSelect) {
    parentSelect.innerHTML = '<option value="">Không có</option>';
    for (var i = 0; i < categories.length; i++) {
      var cat = categories[i];
      // Don't show current category as parent option
      if (id && cat.id == id) continue;
      // Only show parent categories (no parentId) or all if editing
      if (!cat.parentId || (id && cat.id != id)) {
        var option = document.createElement('option');
        option.value = cat.name || cat.id;
        option.textContent = cat.name || 'Danh mục #' + cat.id;
        parentSelect.appendChild(option);
      }
    }
  }
  
  if (id) {
    // Edit mode
    var cat = categories.find(function(c) { return c.id == id; });
    if (!cat) {
      alert('Không tìm thấy danh mục!');
      return;
    }
    editingCategoryId = id;
    if (title) title.textContent = 'Chỉnh sửa danh mục';
    if (submitBtn) submitBtn.textContent = 'Lưu thay đổi';
    if (nameInput) nameInput.value = cat.name || '';
    if (codeInput) codeInput.value = cat.code || '';
    if (iconInput) iconInput.value = cat.icon || '📦';
    if (parentSelect) {
      var parentName = getParentCategoryName(categories, cat.parentId);
      parentSelect.value = parentName || '';
    }
    if (descTextarea) descTextarea.value = cat.description || '';
  } else {
    // Add mode
    if (title) title.textContent = 'Thêm danh mục mới';
    if (submitBtn) submitBtn.textContent = 'Thêm danh mục';
    if (iconInput) iconInput.value = '📦'; // Default icon
  }
  
  modal.style.display = 'flex';
}

function closeCategoryModal() {
  var modal = document.getElementById('categoryModal');
  if (modal) modal.style.display = 'none';
  var form = document.getElementById('categoryForm');
  if (form) form.reset();
  editingCategoryId = null;
}

// Save category (new version with icon, code, description)
function saveCategoryNew(name, code, icon, parentId, productCount, description) {
  var categories = loadCategories();
  
  if (editingCategoryId) {
    // Edit existing
    var index = categories.findIndex(function(c) { return c.id === editingCategoryId; });
    if (index !== -1) {
      categories[index] = Object.assign({}, categories[index], {
        name: name,
        code: code || categories[index].code || '',
        icon: icon || categories[index].icon || '📦',
        parentId: parentId ? Number(parentId) : null,
        productCount: Number(productCount) || 0,
        description: description || '',
        status: categories[index].status || 'success',
        statusText: categories[index].statusText || 'Đang bán'
      });
    }
  } else {
    // Add new
    var newId = categories.length ? Math.max.apply(null, categories.map(function(c) { return parseInt(c.id) || 0; })) + 1 : 1;
    categories.push({
      id: newId,
      name: name,
      code: code || '',
      icon: icon || '📦',
      parentId: parentId ? Number(parentId) : null,
      productCount: Number(productCount) || 0,
      description: description || '',
      status: 'success',
      statusText: 'Đang bán',
      createdAt: Date.now()
    });
  }
  
  try {
    localStorage.setItem(CATEGORY_STORAGE_KEY, JSON.stringify(categories));
    return true;
  } catch (e) {
    console.error('Error saving category:', e);
    return false;
  }
}

// Save category (old version for backward compatibility)
function saveCategory(name, parentId, productCount, createdBy) {
  var categories = loadCategories();
  
  if (editingCategoryId) {
    // Edit existing
    var index = categories.findIndex(function(c) { return c.id === editingCategoryId; });
    if (index !== -1) {
      categories[index] = Object.assign({}, categories[index], {
        name: name,
        parentId: parentId ? Number(parentId) : null,
        productCount: Number(productCount) || 0,
        createdBy: createdBy || 'Quản trị'
      });
    }
  } else {
    // Add new
    var newId = categories.length ? Math.max.apply(null, categories.map(function(c) { return parseInt(c.id) || 0; })) + 1 : 1;
    categories.push({
      id: newId,
      name: name,
      parentId: parentId ? Number(parentId) : null,
      productCount: Number(productCount) || 0,
      createdBy: createdBy || 'Quản trị',
      createdAt: Date.now()
    });
  }
  
  try {
    localStorage.setItem(CATEGORY_STORAGE_KEY, JSON.stringify(categories));
    return true;
  } catch (e) {
    console.error('Error saving category:', e);
    return false;
  }
}

// Initialize default categories: Linh kiện > Laptop > (RAM, CPU, VGA, Main)
function initializeLaptopSubcategories() {
  var categories = loadCategories();
  var added = false;
  
  // Step 1: Find or create "Linh kiện" (main category)
  var linhKienCategory = categories.find(function(c) {
    return c.name && (c.name.toLowerCase() === 'linh kiện' || c.name.toLowerCase() === 'linh kien');
  });
  
  if (!linhKienCategory) {
    var newId = categories.length ? Math.max.apply(null, categories.map(function(c) { return c.id; })) + 1 : 1;
    linhKienCategory = {
      id: newId,
      name: 'Linh kiện',
      parentId: null,
      productCount: 0,
      createdBy: 'Quản trị',
      createdAt: Date.now()
    };
    categories.push(linhKienCategory);
    added = true;
    console.log('Đã tạo danh mục chính: Linh kiện');
  }
  
  // Step 2: Find or create "Laptop" as subcategory of "Linh kiện"
  var laptopCategory = categories.find(function(c) {
    return c.name && c.name.toLowerCase() === 'laptop' && c.parentId === linhKienCategory.id;
  });
  
  if (!laptopCategory) {
    // Check if laptop exists with different parent, update it
    var existingLaptop = categories.find(function(c) {
      return c.name && c.name.toLowerCase() === 'laptop';
    });
    
    if (existingLaptop) {
      // Update existing laptop to be child of Linh kiện
      existingLaptop.parentId = linhKienCategory.id;
      laptopCategory = existingLaptop;
      added = true;
      console.log('Đã cập nhật Laptop thành con của Linh kiện');
    } else {
      // Create new laptop category
      var newId = categories.length ? Math.max.apply(null, categories.map(function(c) { return c.id; })) + 1 : 1;
      laptopCategory = {
        id: newId,
        name: 'Laptop',
        parentId: linhKienCategory.id,
        productCount: 0,
        createdBy: 'Quản trị',
        createdAt: Date.now()
      };
      categories.push(laptopCategory);
      added = true;
      console.log('Đã tạo danh mục con: Laptop (con của Linh kiện)');
    }
  }
  
  // Step 3: Create subcategories of Laptop: RAM, CPU, VGA, Main
  var subcategories = [
    { name: 'RAM', parentId: laptopCategory.id },
    { name: 'CPU', parentId: laptopCategory.id },
    { name: 'VGA', parentId: laptopCategory.id },
    { name: 'Main', parentId: laptopCategory.id }
  ];
  
  for (var i = 0; i < subcategories.length; i++) {
    var sub = subcategories[i];
    var exists = categories.some(function(c) {
      return c.name && c.name.toLowerCase() === sub.name.toLowerCase() && c.parentId === sub.parentId;
    });
    
    if (!exists) {
      var newSubId = categories.length ? Math.max.apply(null, categories.map(function(c) { return c.id; })) + 1 : 1;
      categories.push({
        id: newSubId,
        name: sub.name,
        parentId: sub.parentId,
        productCount: 0,
        createdBy: 'Quản trị',
        createdAt: Date.now()
      });
      added = true;
      console.log('Đã tạo danh mục con: ' + sub.name + ' (con của Laptop)');
    }
  }
  
  if (added) {
    localStorage.setItem(CATEGORY_STORAGE_KEY, JSON.stringify(categories));
    console.log('Hoàn tất: Đã tạo cấu trúc danh mục Linh kiện > Laptop > (RAM, CPU, VGA, Main)');
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  console.log('Category List JS loaded');
  
  // Clean up duplicates first
  cleanupDuplicateCategories();
  
  // Initialize laptop subcategories
  initializeLaptopSubcategories();
  
  // Clean up again after initialization
  cleanupDuplicateCategories();
  
  renderCategories();
  updateCategoryCards();
  updateCategoryKpis();
  
  // Setup category form (new modal - categoryForm)
  var categoryForm = document.getElementById('categoryForm');
  if (categoryForm) {
    categoryForm.addEventListener('submit', function(event) {
      event.preventDefault();
      var formData = new FormData(categoryForm);
      var name = formData.get('categoryName')?.trim() || document.getElementById('modalCategoryName')?.value.trim();
      var code = formData.get('categoryCode')?.trim() || document.getElementById('modalCategoryCode')?.value.trim();
      var icon = formData.get('icon')?.trim() || document.getElementById('modalCategoryIcon')?.value.trim() || '📦';
      var parentName = formData.get('parentCategory') || document.getElementById('modalCategoryParent')?.value || '';
      var description = formData.get('description')?.trim() || document.getElementById('modalCategoryDescription')?.value.trim() || '';
      
      if (!name) {
        alert('Vui lòng nhập tên danh mục!');
        return;
      }
      
      // Get parentId from parent name
      var categories = loadCategories();
      var parentId = null;
      if (parentName) {
        var parentCat = categories.find(function(c) { return c.name === parentName; });
        if (parentCat) parentId = parentCat.id;
      }
      
      // Calculate actual product count
      var actualCount = calculateProductCountForCategory(name);
      
      if (saveCategoryNew(name, code, icon, parentId, actualCount, description)) {
        closeCategoryModal();
        renderCategories();
        updateCategoryCards();
        updateCategoryKpis();
        alert(editingCategoryId ? 'Cập nhật danh mục thành công!' : 'Thêm danh mục thành công!');
      } else {
        alert('Có lỗi xảy ra khi lưu danh mục!');
      }
    });
  }
  
  // Also keep old form handler for backward compatibility (category-form)
  var oldCategoryForm = document.getElementById('category-form');
  if (oldCategoryForm) {
    oldCategoryForm.addEventListener('submit', function(event) {
      event.preventDefault();
      var name = document.getElementById('category-name')?.value.trim();
      var parentId = document.getElementById('category-parent')?.value || null;
      var productCount = document.getElementById('category-product-count')?.value || 0;
      var createdBy = document.getElementById('category-created-by') ? document.getElementById('category-created-by').value : 'Quản trị';
      
      if (!name) {
        alert('Vui lòng nhập tên danh mục!');
        return;
      }
      
      // Calculate actual product count
      var actualCount = calculateProductCountForCategory(name);
      if (actualCount > 0) {
        productCount = actualCount;
      }
      
      if (saveCategory(name, parentId, productCount, createdBy)) {
        closeCategoryModal();
        renderCategories();
        updateCategoryCards();
        updateCategoryKpis();
      } else {
        alert('Có lỗi xảy ra khi lưu danh mục!');
      }
    });
  }
  
  // Close modal when clicking outside
  window.addEventListener('click', function(e) {
    var categoryModal = document.getElementById('categoryModal');
    var attributesModal = document.getElementById('attributesModal');
    
    if (e.target === categoryModal) {
      closeCategoryModal();
    }
    if (e.target === attributesModal) {
      closeAttributesModal();
    }
  });
  
  // Close modal when clicking backdrop
  var backdrop = document.getElementById('category-modal-backdrop');
  if (backdrop) {
    backdrop.addEventListener('click', function(event) {
      if (event.target === backdrop) {
        closeCategoryModal();
      }
    });
  }
  
  // Initial render
  renderCategories();
  updateCategoryKpis();
});

// Update KPI cards (giống ok/category.js)
function updateCategoryKpis() {
  var categories = loadCategories();
  var products = getAllProductsCompat();
  
  var totalCategoriesEl = document.getElementById('kpiTotalCategories');
  var totalProductsEl = document.getElementById('kpiTotalProducts');
  var largestCountEl = document.getElementById('kpiLargestCount');
  var largestNameEl = document.getElementById('kpiLargestName');
  
  if (totalCategoriesEl) totalCategoriesEl.textContent = categories.length;
  if (totalProductsEl) totalProductsEl.textContent = products.length;
  
  // Tính danh mục lớn nhất dựa trên số sản phẩm
  var counts = {};
  products.forEach(function(p) {
    var key = (p.category || 'Khác').trim();
    counts[key] = (counts[key] || 0) + 1;
  });
  
  var largestName = '—';
  var largestCount = 0;
  Object.keys(counts).forEach(function(name) {
    var count = counts[name];
    if (count > largestCount) {
      largestCount = count;
      largestName = name;
    }
  });
  
  if (largestCountEl) largestCountEl.textContent = largestCount;
  if (largestNameEl) largestNameEl.textContent = largestName;
}

// Get products compat (support both keys)
function getAllProductsCompat() {
  var shopvn = localStorage.getItem('shopvn_products');
  if (shopvn) {
    try {
      var parsed = JSON.parse(shopvn);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    } catch(e) {}
  }
  
  var products = localStorage.getItem('products');
  if (products) {
    try {
      var parsed = JSON.parse(products);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    } catch(e) {}
  }
  
  return [];
}

// Action menu handler (giống ok/category.js)
function setupCategoryActionMenuHandler() {
  document.removeEventListener('click', handleCategoryActionMenuClick);
  document.addEventListener('click', handleCategoryActionMenuClick);
}

function handleCategoryActionMenuClick(e) {
  var toggle = e.target.closest('.action-toggle');
  var menu = e.target.closest('.action-menu');
  var item = e.target.closest('.action-item');
  
  // Toggle open
  if (toggle && menu) {
    var isOpen = menu.classList.contains('open');
    document.querySelectorAll('.action-menu.open').forEach(function(m) {
      m.classList.remove('open');
    });
    if (!isOpen) {
      menu.classList.add('open');
    }
    return;
  }
  
  // Action click
  if (item && menu) {
    menu.classList.remove('open');
    var action = item.getAttribute('data-action');
    var row = item.closest('tr');
    var id = row ? row.dataset.id : null;
    if (!id) {
      id = item.getAttribute('data-category-id');
    }
    
    if (!id) return;
    
    if (action === 'edit') {
      openEditCategory(id);
    } else if (action === 'add-child') {
      openAddChildCategory(id);
    } else if (action === 'manage-attributes') {
      openManageAttributes(id);
    } else if (action === 'delete') {
      deleteCategoryById(id);
    }
    return;
  }
  
  // Click outside closes
  if (!e.target.closest('.action-menu')) {
    document.querySelectorAll('.action-menu.open').forEach(function(m) {
      m.classList.remove('open');
    });
  }
}

// Open edit category
function openEditCategory(id) {
  var categories = loadCategories();
  var cat = categories.find(function(c) { return c.id == id; });
  if (!cat) {
    alert('Không tìm thấy danh mục!');
    return;
  }
  
  // Use new modal
  openCategoryModal(id);
}

// Open add child category
function openAddChildCategory(id) {
  var categories = loadCategories();
  var cat = categories.find(function(c) { return String(c.id) === String(id); });
  if (!cat) {
    alert('Không tìm thấy danh mục!');
    return;
  }
  
  // Use new modal with parent pre-selected
  var modal = document.getElementById('categoryModal');
  var form = document.getElementById('categoryForm');
  var title = document.getElementById('categoryModalTitle');
  var submitBtn = document.getElementById('categoryModalSubmit');
  var parentSelect = document.getElementById('modalCategoryParent');
  
  if (!modal || !form) return;
  
  // Reset form
  form.reset();
  editingCategoryId = null;
  
  if (title) title.textContent = 'Thêm danh mục con';
  if (submitBtn) submitBtn.textContent = 'Thêm danh mục';
  
  // Load categories for parent dropdown
  var categories = loadCategories();
  if (parentSelect) {
    parentSelect.innerHTML = '<option value="">Không có</option>';
    categories.filter(function(c) { return !c.parentId; }).forEach(function(c) {
      var option = document.createElement('option');
      option.value = c.name || c.id;
      option.textContent = c.name || 'Danh mục #' + c.id;
      if (String(c.id) === String(cat.id)) option.selected = true;
      parentSelect.appendChild(option);
    });
  }
  
  // Set default icon
  var iconInput = document.getElementById('modalCategoryIcon');
  if (iconInput) iconInput.value = '📦';
  
  modal.style.display = 'flex';
}

// Delete category by id
function deleteCategoryById(id) {
  if (!confirm('Bạn có chắc muốn xóa danh mục này?')) return;
  
  var categories = loadCategories();
  categories = categories.filter(function(c) { return c.id != id; });
  
  try {
    localStorage.setItem(CATEGORY_STORAGE_KEY, JSON.stringify(categories));
  } catch(e) {
    console.error('Error deleting category:', e);
    alert('Có lỗi xảy ra khi xóa danh mục!');
    return;
  }
  
  allCategories = categories;
  renderCategories();
  updateCategoryCards();
  updateCategoryKpis();
  alert('Đã xóa danh mục thành công!');
}

// Attributes Management Functions (giống ok/category.js)
var currentCategoryIdForAttributes = null;
var editingAttributeIndex = null;

function openManageAttributes(categoryId) {
  currentCategoryIdForAttributes = categoryId;
  editingAttributeIndex = null;
  
  var modal = document.getElementById('attributesModal');
  var modalTitle = document.getElementById('attributesModalTitle');
  var categories = loadCategories();
  var category = categories.find(function(c) { return String(c.id) === String(categoryId); });
  
  if (!modal || !category) {
    alert('Không tìm thấy danh mục!');
    return;
  }
  
  // Set modal title
  if (modalTitle) {
    modalTitle.textContent = 'Quản lý thuộc tính - ' + category.name;
  }
  
  // Load and render attributes
  renderAttributesList();
  
  // Clear input
  var newAttributeInput = document.getElementById('newAttributeInput');
  if (newAttributeInput) {
    newAttributeInput.value = '';
    newAttributeInput.placeholder = 'Tên thuộc tính mới...';
  }
  
  // Show modal
  modal.style.display = 'flex';
  
  // Setup event listeners
  setupAttributesModalListeners();
}

function setupAttributesModalListeners() {
  var modal = document.getElementById('attributesModal');
  var closeBtn = document.getElementById('closeAttributesModal');
  var closeBtnFooter = document.querySelector('#attributesModal .btn-cancel');
  var addBtn = document.getElementById('addAttributeBtn');
  var newAttributeInput = document.getElementById('newAttributeInput');
  
  // Close modal functions
  var closeModal = function() {
    if (modal) modal.style.display = 'none';
    currentCategoryIdForAttributes = null;
    editingAttributeIndex = null;
  };
  
  if (closeBtn) {
    closeBtn.onclick = closeModal;
  }
  
  if (closeBtnFooter) {
    closeBtnFooter.onclick = closeModal;
  }
  
  // Close when clicking outside
  if (modal) {
    modal.onclick = function(e) {
      if (e.target === modal) closeModal();
    };
  }
  
  // Add/Edit attribute
  var handleAddAttribute = function() {
    if (!newAttributeInput || !currentCategoryIdForAttributes) return;
    
    var attributeName = newAttributeInput.value.trim();
    if (!attributeName) {
      alert('Vui lòng nhập tên thuộc tính!');
      return;
    }
    
    // Get category info
    var categories = loadCategories();
    var category = categories.find(function(c) { return String(c.id) === String(currentCategoryIdForAttributes); });
    if (!category) return;
    
    // Get attributes from localStorage
    var attributesKey = 'category_attributes_' + currentCategoryIdForAttributes;
    var attributes = JSON.parse(localStorage.getItem(attributesKey) || '[]');
    
    if (editingAttributeIndex !== null) {
      // Edit existing attribute - rename attribute in all products
      var oldAttributeName = attributes[editingAttributeIndex];
      attributes[editingAttributeIndex] = attributeName;
      
      // Update all products in this category
      updateProductsAttributeName(category.name, oldAttributeName, attributeName);
      
      editingAttributeIndex = null;
      if (newAttributeInput) {
        newAttributeInput.value = '';
        newAttributeInput.placeholder = 'Tên thuộc tính mới...';
      }
      if (addBtn) addBtn.textContent = '+ Thêm';
    } else {
      // Check if attribute already exists
      if (attributes.indexOf(attributeName) !== -1) {
        alert('Thuộc tính này đã tồn tại!');
        return;
      }
      // Add new attribute
      attributes.push(attributeName);
      
      // Add this attribute to all products in this category
      addAttributeToCategoryProducts(category.name, attributeName);
    }
    
    // Save to localStorage
    localStorage.setItem(attributesKey, JSON.stringify(attributes));
    
    // Clear input and re-render
    if (newAttributeInput) {
      newAttributeInput.value = '';
      newAttributeInput.placeholder = 'Tên thuộc tính mới...';
    }
    renderAttributesList();
  };
  
  if (addBtn) {
    addBtn.onclick = handleAddAttribute;
  }
  
  // Allow Enter key to add
  if (newAttributeInput) {
    newAttributeInput.onkeypress = function(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleAddAttribute();
      }
    };
  }
}

function renderAttributesList() {
  if (!currentCategoryIdForAttributes) return;
  
  var attributesList = document.getElementById('attributesList');
  if (!attributesList) return;
  
  // Get attributes from localStorage
  var attributesKey = 'category_attributes_' + currentCategoryIdForAttributes;
  var attributes = JSON.parse(localStorage.getItem(attributesKey) || '[]');
  
  if (attributes.length === 0) {
    attributesList.innerHTML = '<div style="color:var(--muted);padding:20px;text-align:center">Chưa có thuộc tính nào</div>';
    return;
  }
  
  attributesList.innerHTML = attributes.map(function(attr, index) {
    return '<div style="display:flex;align-items:center;justify-content:space-between;padding:12px 14px;background:var(--panel-2);border:1px solid var(--line);border-radius:8px;transition:background 0.2s" onmouseover="this.style.background=\'var(--panel)\'" onmouseout="this.style.background=\'var(--panel-2)\'">' +
      '<span style="color:var(--text);font-size:14px">' + attr + '</span>' +
      '<div style="display:flex;gap:8px">' +
      '<button type="button" onclick="editAttribute(' + index + ')" style="background:transparent;border:none;color:var(--text);cursor:pointer;padding:4px 8px;border-radius:4px;transition:background 0.2s" onmouseover="this.style.background=\'rgba(255,255,255,0.1)\'" onmouseout="this.style.background=\'transparent\'" title="Chỉnh sửa">✏️</button>' +
      '<button type="button" onclick="deleteAttribute(' + index + ')" style="background:transparent;border:none;color:var(--danger);cursor:pointer;padding:4px 8px;border-radius:4px;transition:background 0.2s" onmouseover="this.style.background=\'rgba(249,115,115,0.1)\'" onmouseout="this.style.background=\'transparent\'" title="Xóa">🗑️</button>' +
      '</div>' +
      '</div>';
  }).join('');
}

// Global functions for inline onclick handlers
window.editAttribute = function(index) {
  if (!currentCategoryIdForAttributes) return;
  
  var attributesKey = 'category_attributes_' + currentCategoryIdForAttributes;
  var attributes = JSON.parse(localStorage.getItem(attributesKey) || '[]');
  
  if (index >= 0 && index < attributes.length) {
    editingAttributeIndex = index;
    var newAttributeInput = document.getElementById('newAttributeInput');
    var addBtn = document.getElementById('addAttributeBtn');
    
    if (newAttributeInput) {
      newAttributeInput.value = attributes[index];
      newAttributeInput.focus();
    }
    if (addBtn) {
      addBtn.textContent = '💾 Lưu';
    }
  }
};

window.deleteAttribute = function(index) {
  if (!currentCategoryIdForAttributes) return;
  
  if (!confirm('Bạn có chắc muốn xóa thuộc tính này? Thuộc tính này sẽ bị xóa khỏi tất cả sản phẩm trong danh mục.')) return;
  
  // Get category info
  var categories = loadCategories();
  var category = categories.find(function(c) { return String(c.id) === String(currentCategoryIdForAttributes); });
  if (!category) return;
  
  var attributesKey = 'category_attributes_' + currentCategoryIdForAttributes;
  var attributes = JSON.parse(localStorage.getItem(attributesKey) || '[]');
  
  var attributeNameToDelete = attributes[index];
  attributes.splice(index, 1);
  localStorage.setItem(attributesKey, JSON.stringify(attributes));
  
  // Remove this attribute from all products in this category
  removeAttributeFromCategoryProducts(category.name, attributeNameToDelete);
  
  // Reset editing state if needed
  if (editingAttributeIndex === index) {
    editingAttributeIndex = null;
    var newAttributeInput = document.getElementById('newAttributeInput');
    var addBtn = document.getElementById('addAttributeBtn');
    if (newAttributeInput) {
      newAttributeInput.value = '';
      newAttributeInput.placeholder = 'Tên thuộc tính mới...';
    }
    if (addBtn) addBtn.textContent = '+ Thêm';
  }
  
  renderAttributesList();
};

function closeAttributesModal() {
  var modal = document.getElementById('attributesModal');
  if (modal) modal.style.display = 'none';
  currentCategoryIdForAttributes = null;
  editingAttributeIndex = null;
}

// Helper functions to update products when attributes change
function addAttributeToCategoryProducts(categoryName, attributeName) {
  var products = getAllProductsCompat();
  var updatedCount = 0;
  
  products = products.map(function(product) {
    // Check if product belongs to this category
    if (product.category === categoryName) {
      // Initialize attributes object if it doesn't exist
      if (!product.attributes) {
        product.attributes = {};
      }
      // Add new attribute with empty value if it doesn't exist
      if (!product.attributes.hasOwnProperty(attributeName)) {
        product.attributes[attributeName] = '';
        updatedCount++;
      }
    }
    return product;
  });
  
  if (updatedCount > 0) {
    try {
      localStorage.setItem('products', JSON.stringify(products));
    } catch(e) {
      console.error('Error saving products:', e);
    }
  }
  
  return updatedCount;
}

function updateProductsAttributeName(categoryName, oldAttributeName, newAttributeName) {
  var products = getAllProductsCompat();
  var updatedCount = 0;
  
  products = products.map(function(product) {
    // Check if product belongs to this category and has the old attribute
    if (product.category === categoryName && product.attributes && product.attributes.hasOwnProperty(oldAttributeName)) {
      // Rename the attribute key
      var value = product.attributes[oldAttributeName];
      delete product.attributes[oldAttributeName];
      product.attributes[newAttributeName] = value;
      updatedCount++;
    }
    return product;
  });
  
  if (updatedCount > 0) {
    try {
      localStorage.setItem('products', JSON.stringify(products));
      console.log('Đã đổi tên thuộc tính trong ' + updatedCount + ' sản phẩm: "' + oldAttributeName + '" → "' + newAttributeName + '"');
    } catch(e) {
      console.error('Error saving products:', e);
    }
  }
  
  return updatedCount;
}

function removeAttributeFromCategoryProducts(categoryName, attributeName) {
  var products = getAllProductsCompat();
  var updatedCount = 0;
  
  products = products.map(function(product) {
    // Check if product belongs to this category and has this attribute
    if (product.category === categoryName && product.attributes && product.attributes.hasOwnProperty(attributeName)) {
      delete product.attributes[attributeName];
      updatedCount++;
    }
    return product;
  });
  
  if (updatedCount > 0) {
    try {
      localStorage.setItem('products', JSON.stringify(products));
      console.log('Đã xóa thuộc tính "' + attributeName + '" khỏi ' + updatedCount + ' sản phẩm');
    } catch(e) {
      console.error('Error saving products:', e);
    }
  }
  
  return updatedCount;
}

// Expose functions globally
window.closeAttributesModal = closeAttributesModal;
window.calculateProductCountForCategory = calculateProductCountForCategory;

