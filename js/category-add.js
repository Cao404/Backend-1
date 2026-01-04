// Category management functions
var CATEGORY_STORAGE_KEY = 'shopvn_categories';

// Make sure functions are available immediately
console.log('category-add.js loaded');

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

function saveCategories(categories) {
  try {
    localStorage.setItem(CATEGORY_STORAGE_KEY, JSON.stringify(categories));
    return true;
  } catch (e) {
    console.error('Không thể lưu danh mục', e);
    return false;
  }
}

// Update preview when user types - make it global
window.updatePreview = function() {
  var titleEl = document.getElementById('categoryTitle');
  var createdByEl = document.getElementById('createdBy');
  var stockEl = document.getElementById('stock');
  var tagIDEl = document.getElementById('tagID');
  var parentCategoryEl = document.getElementById('parentCategory');
  
  var title = titleEl ? titleEl.value : '';
  var createdBy = createdByEl ? createdByEl.value : '';
  var stock = stockEl ? stockEl.value : '';
  var tagID = tagIDEl ? tagIDEl.value : '';
  var parentId = parentCategoryEl ? parentCategoryEl.value : '';
  
  // Get parent category name if selected
  var parentName = '';
  if (parentId) {
    var parentOption = parentCategoryEl.querySelector('option[value="' + parentId + '"]');
    if (parentOption) {
      parentName = parentOption.textContent;
    }
  }

  // Update preview title
  var previewTitle = document.querySelector('.preview-title');
  if (previewTitle) {
    var displayTitle = title || 'Thời trang Nam, Nữ & Trẻ em';
    if (parentName) {
      displayTitle += ' (Con của: ' + parentName + ')';
    }
    previewTitle.textContent = displayTitle;
  }

  // Update preview info
  var previewCreatedBy = document.getElementById('previewCreatedBy');
  if (previewCreatedBy) {
    previewCreatedBy.textContent = createdBy || '-';
  }

  var previewStock = document.getElementById('previewStock');
  if (previewStock) {
    previewStock.textContent = stock || '-';
  }

  var previewID = document.getElementById('previewID');
  if (previewID) {
    previewID.textContent = tagID || '-';
  }
};

// Create new category - make it global
window.createCategory = function(e) {
  console.log('createCategory called');
  
  // Prevent default form submission if called from form
  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }
  
  // Also prevent default button behavior
  if (e && e.target) {
    e.target.disabled = true;
  }

  var titleEl = document.getElementById('categoryTitle');
  var createdByEl = document.getElementById('createdBy');
  var stockEl = document.getElementById('stock');
  var tagIDEl = document.getElementById('tagID');
  var descriptionEl = document.getElementById('description');
  var parentCategoryEl = document.getElementById('parentCategory');

  var title = titleEl ? titleEl.value.trim() : '';
  var createdBy = createdByEl ? createdByEl.value : '';
  var stock = stockEl ? stockEl.value.trim() : '';
  var tagID = tagIDEl ? tagIDEl.value.trim() : '';
  var description = descriptionEl ? descriptionEl.value.trim() : '';
  var parentId = parentCategoryEl ? (parentCategoryEl.value ? parseInt(parentCategoryEl.value) : null) : null;

  // Validation
  if (!title) {
    alert('Vui lòng nhập tên danh mục!');
    if (titleEl) {
      titleEl.focus();
    }
    return false;
  }

  try {
    // Load existing categories
    var categories = loadCategories();

    // Generate new ID
    var maxId = 0;
    for (var i = 0; i < categories.length; i++) {
      if (categories[i].id && categories[i].id > maxId) {
        maxId = categories[i].id;
      }
    }
    var newId = maxId + 1;

    // Get image
    var imgEl = document.querySelector('#previewImage img');
    var imageUrl = imgEl ? imgEl.src : '';

    // Validate parent category if provided
    if (parentId) {
      var parentExists = categories.some(function(c) { return c.id === parentId; });
      if (!parentExists) {
        alert('Danh mục cha không tồn tại!');
        return false;
      }
    }

    // Create category object
    var newCategory = {
      id: newId,
      name: title,
      parentId: parentId, // Can be null for main categories or a number for subcategories
      productCount: parseInt(stock) || 0,
      createdBy: createdBy || 'Quản trị',
      tagID: tagID || '',
      description: description || '',
      image: imageUrl,
      createdAt: Date.now()
    };

    // Add to categories
    categories.push(newCategory);

    // Save to localStorage
    if (saveCategories(categories)) {
      console.log('Category saved successfully, redirecting...');
      // Redirect immediately - use location.replace to avoid back button issues
      window.location.replace('category-list.html');
      // Also try href as fallback
      setTimeout(function() {
        if (window.location.href.indexOf('category-list.html') === -1) {
          window.location.href = 'category-list.html';
        }
      }, 50);
      return true;
    } else {
      alert('Có lỗi xảy ra khi lưu danh mục!');
      return false;
    }
  } catch (error) {
    console.error('Lỗi khi tạo danh mục:', error);
    alert('Có lỗi xảy ra: ' + (error.message || error));
    return false;
  }
};

// Load parent categories for dropdown
function loadParentCategories() {
  var categories = loadCategories();
  var parentSelect = document.getElementById('parentCategory');
  if (!parentSelect) return;
  
  // Clear existing options except the first one
  parentSelect.innerHTML = '<option value="">(Không có - Danh mục chính)</option>';
  
  // Add all existing categories as potential parents
  for (var i = 0; i < categories.length; i++) {
    var cat = categories[i];
    var option = document.createElement('option');
    option.value = cat.id;
    option.textContent = cat.name || 'Danh mục #' + cat.id;
    parentSelect.appendChild(option);
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  console.log('Category Add JS loaded');
  console.log('createCategory function available:', typeof window.createCategory);
  
  // Load parent categories
  loadParentCategories();
  
  // Add event listeners to form inputs for preview update
  var inputs = ['categoryTitle', 'createdBy', 'stock', 'tagID', 'description', 'parentCategory'];
  for (var i = 0; i < inputs.length; i++) {
    var element = document.getElementById(inputs[i]);
    if (element) {
      element.addEventListener('input', updatePreview);
      element.addEventListener('change', updatePreview);
    }
  }

  // Also add click listeners to buttons as backup
  var buttons = document.querySelectorAll('button');
  for (var i = 0; i < buttons.length; i++) {
    var btn = buttons[i];
    var btnText = btn.textContent.trim();
    if (btnText === 'Tạo danh mục' || btnText.includes('Tạo')) {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        console.log('Button clicked via event listener');
        createCategory(e);
        return false;
      });
    }
  }

  // Initial preview update
  updatePreview();
});

