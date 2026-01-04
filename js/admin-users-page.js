// Admin Users Management
var USERS_STORAGE_KEY = 'shopvn_users';
// Dữ liệu yêu cầu người bán (dùng cho đăng nhập kênh người bán)
var SELLER_REQUESTS_STORAGE_KEY = 'shopvn_seller_requests';

var users = [];
var currentFilter = 'all';
var currentSearch = '';

// Load users from localStorage
function loadUsers() {
  try {
    var raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (!raw) {
      // Seed sample data
      users = [
        {
          id: 1,
          name: 'Nguyễn Văn Admin',
          email: 'admin@shopvn.com',
          phone: '0123456789',
          role: 'admin',
          status: 'active',
          createdAt: '2024-01-15',
          avatar: 'NA'
        },
        {
          id: 2,
          name: 'Trần Thị Seller',
          email: 'seller@shopvn.com',
          phone: '0987654321',
          role: 'seller',
          status: 'active',
          createdAt: '2024-02-20',
          avatar: 'TS'
        },
        {
          id: 3,
          name: 'Lê Văn Customer',
          email: 'customer@shopvn.com',
          phone: '0912345678',
          role: 'customer',
          status: 'active',
          createdAt: '2024-03-10',
          avatar: 'LC'
        },
        {
          id: 4,
          name: 'Phạm Thị Bán',
          email: 'phamthi@email.com',
          phone: '0901234567',
          role: 'seller',
          status: 'locked',
          createdAt: '2024-01-25',
          avatar: 'PB'
        },
        {
          id: 5,
          name: 'Hoàng Văn Mua',
          email: 'hoangvan@email.com',
          phone: '0923456789',
          role: 'customer',
          status: 'active',
          createdAt: '2024-04-05',
          avatar: 'HM'
        }
      ];
      saveUsers();
      return;
    }
    var parsed = JSON.parse(raw);
    users = Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Không thể đọc users:', e);
    users = [];
  }
}

// Save users to localStorage
function saveUsers() {
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  } catch (e) {
    console.error('Không thể lưu users:', e);
  }
}

// Load seller requests (dùng để đồng bộ mật khẩu khi sửa người bán)
function loadSellerRequestsForAdmin() {
  try {
    var raw = localStorage.getItem(SELLER_REQUESTS_STORAGE_KEY);
    if (!raw) return [];
    var parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Không thể đọc yêu cầu người bán:', e);
    return [];
  }
}

function saveSellerRequestsForAdmin(list) {
  try {
    localStorage.setItem(SELLER_REQUESTS_STORAGE_KEY, JSON.stringify(list || []));
  } catch (e) {
    console.error('Không thể lưu yêu cầu người bán:', e);
  }
}

// Get role display name
function getRoleDisplayName(role) {
  var roleMap = {
    'admin': 'Admin',
    'seller': 'Người Bán',
    'customer': 'Khách Hàng'
  };
  return roleMap[role] || role;
}

// Get status display name
function getStatusDisplayName(status) {
  var statusMap = {
    'active': 'Đang hoạt động',
    'locked': 'Đã khóa'
  };
  return statusMap[status] || status;
}

// Get initials for avatar
function getInitials(name) {
  if (!name) return '??';
  var parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

// Get avatar color gradient
function getAvatarColor(name) {
  var colors = [
    'linear-gradient(135deg, #667eea, #764ba2)',
    'linear-gradient(135deg, #f093fb, #f5576c)',
    'linear-gradient(135deg, #4facfe, #00f2fe)',
    'linear-gradient(135deg, #43e97b, #38f9d7)',
    'linear-gradient(135deg, #fa709a, #fee140)',
    'linear-gradient(135deg, #30cfd0, #330867)',
    'linear-gradient(135deg, #a8edea, #fed6e3)',
    'linear-gradient(135deg, #ff9a9e, #fecfef)'
  ];
  var index = name ? name.charCodeAt(0) % colors.length : 0;
  return colors[index];
}

// Filter users
function filterUsers(filter) {
  currentFilter = filter;
  
  // Update active tab
  document.querySelectorAll('.filter-tab').forEach(function(tab) {
    tab.classList.remove('active');
  });
  event.target.classList.add('active');
  
  renderUsers();
}

// Search users
function searchUsers() {
  var searchInput = document.getElementById('searchInput');
  if (!searchInput) return;
  currentSearch = searchInput.value.toLowerCase();
  renderUsers();
}

// Get filtered users
function getFilteredUsers() {
  var filtered = users;
  
  // Apply filter
  if (currentFilter !== 'all') {
    if (currentFilter === 'admin' || currentFilter === 'seller' || currentFilter === 'customer') {
      filtered = filtered.filter(function(u) { return u.role === currentFilter; });
    } else if (currentFilter === 'active') {
      filtered = filtered.filter(function(u) { return u.status === 'active'; });
    } else if (currentFilter === 'locked') {
      filtered = filtered.filter(function(u) { return u.status === 'locked'; });
    }
  }
  
  // Apply search
  if (currentSearch) {
    filtered = filtered.filter(function(u) {
      return u.name.toLowerCase().includes(currentSearch) ||
             u.email.toLowerCase().includes(currentSearch) ||
             (u.phone && u.phone.includes(currentSearch));
    });
  }
  
  return filtered;
}

// Sort users
function sortUsers() {
  var sortValue = document.getElementById('sortSelect').value;
  var filtered = getFilteredUsers();
  
  filtered.sort(function(a, b) {
    switch(sortValue) {
      case 'oldest':
        return new Date(a.createdAt) - new Date(b.createdAt);
      case 'name':
        return a.name.localeCompare(b.name);
      case 'email':
        return a.email.localeCompare(b.email);
      case 'newest':
      default:
        return new Date(b.createdAt) - new Date(a.createdAt);
    }
  });
  
  renderUsersTable(filtered);
}

// Update counts
function updateCounts() {
  var counts = {
    admin: users.filter(function(u) { return u.role === 'admin'; }).length,
    seller: users.filter(function(u) { return u.role === 'seller'; }).length,
    customer: users.filter(function(u) { return u.role === 'customer'; }).length,
    active: users.filter(function(u) { return u.status === 'active'; }).length,
    locked: users.filter(function(u) { return u.status === 'locked'; }).length
  };
  
  document.getElementById('count-admin').textContent = counts.admin;
  document.getElementById('count-seller').textContent = counts.seller;
  document.getElementById('count-customer').textContent = counts.customer;
  document.getElementById('count-active').textContent = counts.active;
  document.getElementById('count-locked').textContent = counts.locked;
}

// Render users table
function renderUsersTable(userList) {
  var tbody = document.getElementById('userTableBody');
  if (!tbody) return;
  
  if (userList.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:40px;color:var(--muted)">Không có người dùng nào</td></tr>';
    return;
  }
  
  tbody.innerHTML = userList.map(function(user) {
    var initials = user.avatar || getInitials(user.name);
    var avatarColor = getAvatarColor(user.name);
    var roleClass = 'role-' + user.role;
    var statusClass = 'status-' + user.status;
    
    return (
      '<tr>' +
      '  <td class="chk"><input type="checkbox" /></td>' +
      '  <td>' +
      '    <div class="product">' +
      '      <div class="thumb" style="background:' + avatarColor + '">' +
      '        <div style="color:white;font-weight:700">' + initials + '</div>' +
      '      </div>' +
      '      <div>' +
      '        <div class="name">' + (user.name || 'N/A') + '</div>' +
      '        <div class="sub">ID: #' + user.id + '</div>' +
      '      </div>' +
      '    </div>' +
      '  </td>' +
      '  <td>' +
      '    <div>' + (user.email || 'N/A') + '</div>' +
      '    <div class="sub">' + (user.phone || 'Chưa có') + '</div>' +
      '  </td>' +
      '  <td><span class="role-badge ' + roleClass + '">' + getRoleDisplayName(user.role) + '</span></td>' +
      '  <td><span class="status-badge ' + statusClass + '">' + getStatusDisplayName(user.status) + '</span></td>' +
      '  <td>' +
      '    <div>' + (user.createdAt || 'N/A') + '</div>' +
      '  </td>' +
      '  <td>' +
      '    <div class="action-buttons">' +
      '      <button class="btn-small btn-edit" onclick="openUserModal(\'edit\', ' + user.id + ')">Sửa</button>' +
      (user.status === 'active' 
        ? '      <button class="btn-small btn-lock" onclick="lockUser(' + user.id + ')">Khóa</button>'
        : '      <button class="btn-small btn-unlock" onclick="unlockUser(' + user.id + ')">Mở khóa</button>') +
      '      <button class="btn-small btn-delete" onclick="deleteUser(' + user.id + ')">Xóa</button>' +
      '    </div>' +
      '  </td>' +
      '</tr>'
    );
  }).join('');
}

// Render users
function renderUsers() {
  updateCounts();
  sortUsers();
}

// Open user modal
function openUserModal(mode, userId) {
  var backdrop = document.getElementById('userModalBackdrop');
  var title = document.getElementById('userModalTitle');
  var form = document.getElementById('userForm');
  var passwordField = document.getElementById('user-password');
  var passwordRow = document.getElementById('passwordRow');
  
  if (!backdrop || !title || !form) return;
  
  backdrop.dataset.mode = mode;
  backdrop.dataset.userId = userId || '';
  backdrop.classList.add('active');
  
  // Reset form
  form.reset();
  
  if (mode === 'create') {
    title.textContent = 'Tạo Người Dùng';
    passwordField.required = true;
    passwordRow.style.display = 'grid';
  } else if (mode === 'edit' && userId) {
    title.textContent = 'Sửa Người Dùng';
    passwordField.required = false;
    passwordRow.style.display = 'grid';
    
    var user = users.find(function(u) { return u.id === userId; });
    if (user) {
      document.getElementById('user-name').value = user.name || '';
      document.getElementById('user-email').value = user.email || '';
      document.getElementById('user-phone').value = user.phone || '';
      document.getElementById('user-role').value = user.role || '';
      document.getElementById('user-status').value = user.status || 'active';
    }
  }
}

// Close user modal
function closeUserModal(event) {
  if (event && event.target !== event.currentTarget) return;
  
  var backdrop = document.getElementById('userModalBackdrop');
  if (backdrop) {
    backdrop.classList.remove('active');
    document.getElementById('userForm').reset();
  }
}

// Save user
function saveUser(event) {
  event.preventDefault();
  
  var backdrop = document.getElementById('userModalBackdrop');
  var mode = backdrop ? backdrop.dataset.mode : 'create';
  var userId = backdrop ? parseInt(backdrop.dataset.userId) : null;
  
  var name = document.getElementById('user-name').value.trim();
  var email = document.getElementById('user-email').value.trim();
  var phone = document.getElementById('user-phone').value.trim();
  var role = document.getElementById('user-role').value;
  var status = document.getElementById('user-status').value;
  var password = document.getElementById('user-password').value;
  
  if (!name || !email || !role) {
    alert('Vui lòng điền đầy đủ thông tin bắt buộc');
    return;
  }
  
  if (mode === 'create') {
    if (!password) {
      alert('Vui lòng nhập mật khẩu');
      return;
    }
    
    // Check if email already exists
    if (users.some(function(u) { return u.email === email; })) {
      alert('Email đã tồn tại');
      return;
    }
    
    var maxId = users.length ? Math.max.apply(null, users.map(function(u) { return u.id || 0; })) : 0;
    var newUser = {
      id: maxId + 1,
      name: name,
      email: email,
      phone: phone || '',
      role: role,
      status: status || 'active',
      createdAt: new Date().toISOString().split('T')[0],
      avatar: getInitials(name),
      // Lưu mật khẩu để front-end có thể xác thực (demo, không dùng cho production)
      password: password
    };
    
    users.push(newUser);
    alert('Đã tạo người dùng thành công');
  } else if (mode === 'edit' && userId) {
    var user = users.find(function(u) { return u.id === userId; });
    if (!user) {
      alert('Không tìm thấy người dùng');
      return;
    }
    
    // Check if email already exists (except current user)
    if (users.some(function(u) { return u.email === email && u.id !== userId; })) {
      alert('Email đã tồn tại');
      return;
    }
    
    user.name = name;
    user.email = email;
    user.phone = phone || '';
    user.role = role;
    user.status = status;
    user.avatar = getInitials(name);

    // Nếu nhập mật khẩu mới, lưu vào user.password
    if (password) {
      user.password = password;
    }

    // Nếu là người bán và nhập mật khẩu mới, đồng bộ sang shopvn_seller_requests
    if (password && user.role === 'seller') {
      var sellerRequests = loadSellerRequestsForAdmin();
      var idx = sellerRequests.findIndex(function(r) { return r.email === user.email; });
      if (idx !== -1) {
        sellerRequests[idx].password = password;
        saveSellerRequestsForAdmin(sellerRequests);
      }
    }
    
    alert('Đã cập nhật người dùng thành công');
  }
  
  async function saveUser(e) {
    e.preventDefault(); // ✅ chặn submit reload trang
  
    // lấy dữ liệu từ form/modal
    const fullName = document.querySelector('#fullName').value.trim();
    const email    = document.querySelector('#email').value.trim();
    const phone    = document.querySelector('#phone').value.trim();
    const password = document.querySelector('#password').value;
  
    const roleVN   = document.querySelector('#roleSelect').value;    // "Người Bán"...
    const statusVN = document.querySelector('#statusSelect').value;  // "Đang hoạt động"...
  
    // map VN -> EN cho backend
    const roleMap = { "Admin": "Admin", "Người Bán": "Seller", "Khách Hàng": "Customer" };
    const statusMap = { "Đang hoạt động": "Active", "Đã khóa": "Locked" };
  
    const payload = {
      fullName,
      email,
      phone,
      passwordHash: password,
      role: roleMap[roleVN] || roleVN,
      status: statusMap[statusVN] || statusVN
    };
  
    try {
      // ✅ gọi API tạo user
      await API.post("/api/admin/users", payload);
  
      // ✅ reload lại list từ backend (không gọi renderUsers trực tiếp)
      await loadUsers();
  
      // đóng modal nếu bạn có hàm
      // closeUserModal();
    } catch (err) {
      console.error(err);
      alert("Tạo user lỗi: " + err.message);
    }
  }
  
}

// Lock user
function lockUser(userId) {
  if (!confirm('Bạn có chắc muốn khóa người dùng này?')) return;
  
  var user = users.find(function(u) { return u.id === userId; });
  if (user) {
    user.status = 'locked';
    saveUsers();
    renderUsers();
    alert('Đã khóa người dùng');
  }
}

// Unlock user
function unlockUser(userId) {
  if (!confirm('Bạn có chắc muốn mở khóa người dùng này?')) return;
  
  var user = users.find(function(u) { return u.id === userId; });
  if (user) {
    user.status = 'active';
    saveUsers();
    renderUsers();
    alert('Đã mở khóa người dùng');
  }
}

// Delete user
function deleteUser(userId) {
  if (!confirm('Bạn có chắc muốn xóa người dùng này? Hành động này không thể hoàn tác.')) return;
  
  var index = users.findIndex(function(u) { return u.id === userId; });
  if (index !== -1) {
    users.splice(index, 1);
    saveUsers();
    renderUsers();
    alert('Đã xóa người dùng');
  }
}

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
  loadUsers();
  

  
  // Search input
  var searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', searchUsers);
  }
  
  // Sort select
  var sortSelect = document.getElementById('sortSelect');
  if (sortSelect) {
    sortSelect.addEventListener('change', sortUsers);
  }
  
  // Select all checkbox
  var selectAll = document.getElementById('selectAll');
  if (selectAll) {
    selectAll.addEventListener('change', function() {
      var checkboxes = document.querySelectorAll('#userTableBody input[type="checkbox"]');
      checkboxes.forEach(function(cb) {
        cb.checked = selectAll.checked;
      });
    });
  }
});

