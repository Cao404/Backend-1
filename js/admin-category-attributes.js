function toggleSidebar() {
  document.querySelector('.layout').classList.toggle('collapsed');
  localStorage.setItem('sidebarCollapsed', document.querySelector('.layout').classList.contains('collapsed'));
}

if (localStorage.getItem('sidebarCollapsed') === 'true') {
  document.querySelector('.layout').classList.add('collapsed');
}

var ATTRIBUTE_STORAGE_KEY = 'shopvn_attribute_groups';

var attributeGroups = [];
var editingAttributeId = null;

function loadAttributeGroups() {
  try {
    var raw = localStorage.getItem(ATTRIBUTE_STORAGE_KEY);
    if (!raw) {
      attributeGroups = [];
      return;
    }
    var parsed = JSON.parse(raw);
    attributeGroups = Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Không thể đọc nhóm thuộc tính', e);
    attributeGroups = [];
  }
}

function saveAttributeGroups() {
  try {
    localStorage.setItem(ATTRIBUTE_STORAGE_KEY, JSON.stringify(attributeGroups));
  } catch (e) {
    console.error('Không thể lưu nhóm thuộc tính', e);
  }
}

function renderAttributeGroups() {
  var container = document.getElementById('attribute-groups');
  if (!container) return;

  if (!attributeGroups || attributeGroups.length === 0) {
    container.innerHTML = '<div class="empty-state">Chưa có nhóm thuộc tính nào. Bấm "Thêm Nhóm Thuộc Tính" để tạo mới.</div>';
    return;
  }

  container.innerHTML = attributeGroups
    .sort(function (a, b) { return (a.name || '').localeCompare(b.name || ''); })
    .map(function (g) {
      var appliesText = g.appliesToText || 'Tất cả';
      var values = Array.isArray(g.values) ? g.values : [];
      var valuesHtml = values
        .map(function (v, index) {
          return (
            '<span class="attribute-value">' +
            v +
            ' <button type="button" class="inline-action-btn" onclick="removeAttributeValue(' + g.id + ',' + index + ');event.stopPropagation();">×</button></span>'
          );
        })
        .join('');

      return [
        '<div class="attribute-group">',
        '  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">',
        '    <div>',
        '      <div style="font-weight:700;font-size:16px">' + (g.name || '') + '</div>',
        '      <div style="color:var(--muted);font-size:13px;margin-top:4px">Áp dụng cho: ' + appliesText + '</div>',
        '    </div>',
        '    <div class="act" style="display:flex;gap:6px">',
        '      <div class="pill edit" title="Sửa" onclick="openAttributeModal(' + g.id + ')">',
        '        <svg viewBox="0 0 24 24" fill="none" width="16" height="16"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor"/></svg>',
        '      </div>',
        '      <div class="pill del" title="Xóa" onclick="deleteAttributeGroup(' + g.id + ')">',
        '        <svg viewBox="0 0 24 24" fill="none" width="16" height="16"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14z" stroke="currentColor"/></svg>',
        '      </div>',
        '    </div>',
        '  </div>',
        '  <div class="attribute-values">' + (valuesHtml || '<span class="attribute-value" style="color:var(--muted)">Chưa có giá trị</span>') + '</div>',
        '</div>'
      ].join('');
    })
    .join('');
}

function openAttributeModal(id) {
  var backdrop = document.getElementById('attribute-modal-backdrop');
  var title = document.getElementById('attribute-modal-title');
  var nameInput = document.getElementById('attr-name');
  var appliesInput = document.getElementById('attr-applies');
  var valuesInput = document.getElementById('attr-values');
  if (!backdrop || !title || !nameInput || !appliesInput || !valuesInput) return;

  if (id) {
    var g = attributeGroups.find(function (ag) { return ag.id === id; });
    if (!g) return;
    editingAttributeId = id;
    title.textContent = 'Chỉnh sửa nhóm thuộc tính';
    nameInput.value = g.name || '';
    appliesInput.value = g.appliesToText || '';
    valuesInput.value = (Array.isArray(g.values) ? g.values : []).join(', ');
  } else {
    editingAttributeId = null;
    title.textContent = 'Thêm nhóm thuộc tính';
    nameInput.value = '';
    appliesInput.value = '';
    valuesInput.value = '';
  }

  backdrop.style.display = 'flex';
}

function closeAttributeModal() {
  var backdrop = document.getElementById('attribute-modal-backdrop');
  if (backdrop) backdrop.style.display = 'none';
  editingAttributeId = null;
}

function deleteAttributeGroup(id) {
  if (!confirm('Xóa nhóm thuộc tính này?')) return;
  attributeGroups = attributeGroups.filter(function (g) { return g.id !== id; });
  saveAttributeGroups();
  renderAttributeGroups();
}

function removeAttributeValue(groupId, valueIndex) {
  var g = attributeGroups.find(function (ag) { return ag.id === groupId; });
  if (!g || !Array.isArray(g.values)) return;
  g.values.splice(valueIndex, 1);
  saveAttributeGroups();
  renderAttributeGroups();
}

document.addEventListener('DOMContentLoaded', function () {
  loadAttributeGroups();

  if (!attributeGroups || attributeGroups.length === 0) {
    attributeGroups = [
      {
        id: 1,
        name: 'Kích Thước (Size)',
        appliesToText: 'Thời Trang',
        values: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
        createdAt: Date.now()
      },
      {
        id: 2,
        name: 'Màu Sắc (Color)',
        appliesToText: 'Tất cả',
        values: ['Đỏ', 'Xanh dương', 'Xanh lá', 'Vàng', 'Đen', 'Trắng'],
        createdAt: Date.now() + 1
      },
      {
        id: 3,
        name: 'Chất Liệu (Material)',
        appliesToText: 'Thời Trang, Nội Thất',
        values: ['Cotton', 'Polyester', 'Silk', 'Leather', 'Wood'],
        createdAt: Date.now() + 2
      }
    ];
    saveAttributeGroups();
  }

  renderAttributeGroups();

  var categoryForm = document.getElementById('category-form');
  if (categoryForm) {
    categoryForm.addEventListener('submit', function (event) {
      event.preventDefault();
      var name = document.getElementById('category-name').value.trim();
      var parentId = document.getElementById('category-parent').value || null;
      var productCount = Number(document.getElementById('category-product-count').value || 0);
      if (!name) {
        alert('Vui lòng nhập tên danh mục');
        return;
      }
      if (editingCategoryId) {
        var index = categories.findIndex(function (c) { return c.id === editingCategoryId; });
        if (index !== -1) {
          categories[index] = Object.assign({}, categories[index], {
            name: name,
            parentId: parentId ? Number(parentId) : null,
            productCount: productCount
          });
        }
      } else {
        var newId = categories.length ? Math.max.apply(null, categories.map(function (c) { return c.id; })) + 1 : 1;
        categories.push({
          id: newId,
          name: name,
          parentId: parentId ? Number(parentId) : null,
          productCount: productCount,
          createdAt: Date.now()
        });
      }
      // Auto-update product count from actual product data before saving
      var actualCount = calculateProductCountForCategory(name);
      if (actualCount > 0) {
        productCount = actualCount;
      }
      
      saveCategories();
      renderCategoryTree();
      closeCategoryModal();
    });
  }

  var attrForm = document.getElementById('attribute-form');
  if (attrForm) {
    attrForm.addEventListener('submit', function (event) {
      event.preventDefault();
      var name = document.getElementById('attr-name').value.trim();
      var applies = document.getElementById('attr-applies').value.trim();
      var valuesRaw = document.getElementById('attr-values').value.trim();
      if (!name) {
        alert('Vui lòng nhập tên nhóm thuộc tính');
        return;
      }
      var values = valuesRaw
        ? valuesRaw.split(',').map(function (v) { return v.trim(); }).filter(Boolean)
        : [];

      if (editingAttributeId) {
        var index = attributeGroups.findIndex(function (g) { return g.id === editingAttributeId; });
        if (index !== -1) {
          attributeGroups[index] = Object.assign({}, attributeGroups[index], {
            name: name,
            appliesToText: applies || 'Tất cả',
            values: values
          });
        }
      } else {
        var newIdAttr = attributeGroups.length ? Math.max.apply(null, attributeGroups.map(function (g) { return g.id; })) + 1 : 1;
        attributeGroups.push({
          id: newIdAttr,
          name: name,
          appliesToText: applies || 'Tất cả',
          values: values,
          createdAt: Date.now()
        });
      }

      saveAttributeGroups();
      renderAttributeGroups();
      closeAttributeModal();
    });
  }

  var attrBackdrop = document.getElementById('attribute-modal-backdrop');
  if (attrBackdrop) {
    attrBackdrop.addEventListener('click', function (event) {
      if (event.target === attrBackdrop) closeAttributeModal();
    });
  }
});


function toggleTree(element) {
  // Toggle expand/collapse cho node cây danh mục tĩnh
  if (!element) return;
  element.classList.toggle('expanded');
}

function addAttributeGroup() {
  if (typeof openAttributeModal === 'function') {
    openAttributeModal(null);
  }
}

function editAttributeGroup(id) {
  if (typeof openAttributeModal === 'function') {
    openAttributeModal(id);
  }
}
