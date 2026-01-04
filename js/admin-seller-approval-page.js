function toggleSidebar() {
  document.querySelector('.layout').classList.toggle('collapsed');
  localStorage.setItem('sidebarCollapsed', document.querySelector('.layout').classList.contains('collapsed'));
}

if (localStorage.getItem('sidebarCollapsed') === 'true') {
  document.querySelector('.layout').classList.add('collapsed');
}

function toggleSubmenu(element) {
  const navItem = element.parentElement;
  navItem.classList.toggle('open');
}

// ==== DỮ LIỆU YÊU CẦU NGƯỜI BÁN TỪ localStorage ====
var SELLER_REQUESTS_STORAGE_KEY = 'shopvn_seller_requests';
var sellerRequests = [];
var SELLERS_PER_PAGE = 5;
var sellerCurrentPage = 1;
var sellerCurrentFilter = 'all';

function loadSellerRequests() {
  try {
    var raw = localStorage.getItem(SELLER_REQUESTS_STORAGE_KEY);
    if (!raw) {
      sellerRequests = [];
      return;
    }
    var parsed = JSON.parse(raw);
    sellerRequests = Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Không thể đọc yêu cầu người bán:', e);
    sellerRequests = [];
  }
}

function updateSellerPageInfo(total) {
  var info = document.getElementById('sellerPageInfo');
  if (!info) return;
  if (total === 0) {
    info.textContent = 'Không có kết quả';
    return;
  }
  var start = (sellerCurrentPage - 1) * SELLERS_PER_PAGE + 1;
  var end = Math.min(sellerCurrentPage * SELLERS_PER_PAGE, total);
  info.textContent = 'Hiển thị ' + start + '-' + end + ' trong ' + total + ' kết quả';
}

function renderSellerPagination(total) {
  var container = document.getElementById('sellerPagination');
  if (!container) return;

  if (total === 0) {
    container.innerHTML = '';
    return;
  }

  var totalPages = Math.ceil(total / SELLERS_PER_PAGE) || 1;
  var html = '';

  // Trước đó
  var prevPage = sellerCurrentPage - 1;
  html += '<button type="button" data-page="' + (prevPage > 0 ? prevPage : 1) + '" ' +
          ' style="padding:6px 12px;background:var(--panel);border:1px solid var(--line);border-radius:6px;color:var(--muted);cursor:pointer">Trước đó</button>';

  for (var i = 1; i <= totalPages; i++) {
    if (i === sellerCurrentPage) {
      html += '<button type="button" data-page="' + i + '" style="padding:6px 12px;background:var(--accent);border:1px solid var(--accent);border-radius:6px;color:#2b1606;font-weight:700;cursor:pointer">' + i + '</button>';
    } else {
      html += '<button type="button" data-page="' + i + '" style="padding:6px 12px;background:var(--panel);border:1px solid var(--line);border-radius:6px;color:var(--text);cursor:pointer">' + i + '</button>';
    }
  }

  var nextPage = sellerCurrentPage + 1;
  html += '<button type="button" data-page="' + (nextPage <= totalPages ? nextPage : totalPages) + '" ' +
          ' style="padding:6px 12px;background:var(--panel);border:1px solid var(--line);border-radius:6px;color:var(--text);cursor:pointer">Tiếp theo</button>';

  container.innerHTML = html;

  // Gắn event click bằng JS để đảm bảo hoạt động
  var buttons = container.querySelectorAll('button[data-page]');
  buttons.forEach(function(btn) {
    btn.addEventListener('click', function() {
      var targetPage = parseInt(this.getAttribute('data-page'), 10);
      if (!isNaN(targetPage)) {
        changeSellerPage(targetPage);
      }
    });
  });
}

function changeSellerPage(page) {
  // Tính số trang dựa trên danh sách đã lọc theo trạng thái hiện tại
  loadSellerRequests();
  var filtered = sellerRequests.filter(function (req) {
    if (!sellerCurrentFilter || sellerCurrentFilter === 'all') return true;
    return (req.status || 'submitted') === sellerCurrentFilter;
  });

  var total = filtered.length;
  var totalPages = Math.ceil(total / SELLERS_PER_PAGE) || 1;
  if (page < 1 || page > totalPages) return;

  sellerCurrentPage = page;
  renderSellerRequests();
}

function formatDateDisplay(isoString) {
  if (!isoString) return '-';
  var d = new Date(isoString);
  if (isNaN(d.getTime())) return '-';
  var day = String(d.getDate()).padStart(2, '0');
  var month = String(d.getMonth() + 1).padStart(2, '0');
  var year = d.getFullYear();
  return day + '/' + month + '/' + year;
}

function getInitialsFromEmail(email) {
  if (!email) return 'NV';
  var namePart = email.split('@')[0] || '';
  var parts = namePart.split(/[._-]/).filter(Boolean);
  if (parts.length === 0) return (namePart.substring(0, 2) || 'NV').toUpperCase();
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function getSellerStatusBadge(status) {
  var st = status || 'submitted';
  if (st === 'approved') {
    return { cls: 'status-approved', text: 'Đã duyệt' };
  }
  if (st === 'rejected') {
    return { cls: 'status-rejected', text: 'Từ chối' };
  }
  if (st === 'suspended') {
    return { cls: 'status-suspended', text: 'Tạm ngưng' };
  }
  if (st === 'locked') {
    return { cls: 'status-locked', text: 'Đã khóa' };
  }
  return { cls: 'status-submitted', text: 'Đang chờ' };
}

function renderSellerRequests() {
  loadSellerRequests();
  var tbody = document.getElementById('sellerTableBody');
  if (!tbody) return;

  // Tính lại số lượng theo trạng thái và cập nhật label tab
  updateSellerFilterCounts();

  // Áp dụng filter trạng thái hiện tại
  var filtered = sellerRequests.filter(function (req) {
    if (!sellerCurrentFilter || sellerCurrentFilter === 'all') return true;
    return (req.status || 'submitted') === sellerCurrentFilter;
  });

  // Nếu không có yêu cầu nào theo filter, xóa bảng và cập nhật info/pagination rỗng
  if (filtered.length === 0) {
    tbody.innerHTML = '';
    updateSellerPageInfo(0);
    renderSellerPagination(0);
    return;
  }

  // Phân trang
  var total = filtered.length;
  var totalPages = Math.ceil(total / SELLERS_PER_PAGE) || 1;
  if (sellerCurrentPage > totalPages) sellerCurrentPage = totalPages;
  var startIndex = (sellerCurrentPage - 1) * SELLERS_PER_PAGE;
  var endIndex = Math.min(startIndex + SELLERS_PER_PAGE, total);

  tbody.innerHTML = '';

  for (var i = startIndex; i < endIndex; i++) {
    var req = filtered[i];
    var tr = document.createElement('tr');
    tr.dataset.requestId = String(req.id);
    var initials = getInitialsFromEmail(req.email);
    var displayName = req.email || 'Người bán mới';
    var statusInfo = getSellerStatusBadge(req.status);
    var statusClass = statusInfo.cls;
    var statusText = statusInfo.text;

    tr.innerHTML = [
      '<td class="chk"><input type="checkbox" /></td>',
      '<td>',
      '  <div class="product">',
      '    <div class="thumb" style="background:linear-gradient(135deg,#667eea,#764ba2)">',
      '      <div style="color:white;font-weight:700">' + initials + '</div>',
      '    </div>',
      '    <div>',
      '      <div class="name">' + displayName + '</div>',
      '      <div class="sub">Người bán mới</div>',
      '    </div>',
      '  </div>',
      '</td>',
      '<td>',
      '  <div>' + (req.email || '-') + '</div>',
      '  <div class="sub">' + (req.phone || '-') + '</div>',
      '</td>',
      '<td>',
      '  <div class="kyc-info">',
      '    <div class="kyc-item">',
      '      <div class="kyc-label">CMND/CCCD</div>',
      '      <div class="kyc-value" style="color:#10b981">✓ Đã gửi</div>',
      '    </div>',
      '    <div class="kyc-item">',
      '      <div class="kyc-label">Giấy phép KD</div>',
      '      <div class="kyc-value" style="color:#10b981">✓ Đã gửi</div>',
      '    </div>',
      '  </div>',
      '</td>',
      '<td><span class="status-badge ' + statusClass + '">' + statusText + '</span></td>',
      '<td>',
      '  <div>' + formatDateDisplay(req.createdAt) + '</div>',
      '  <div class="sub">Mới đăng ký</div>',
      '</td>',
      '<td>',
      '  <div class="action-buttons">',
      '    <button class="btn-small btn-approve" onclick="approveSeller(' + req.id + ')">Duyệt</button>',
      '    <button class="btn-small btn-reject" onclick="rejectSeller(' + req.id + ')">Từ chối</button>',
      '    <button class="btn-small btn-suspend" onclick="suspendSeller(' + req.id + ')">Tạm ngưng</button>',
      '  </div>',
      '</td>'
    ].join('');

    tbody.appendChild(tr);
  }

  updateSellerPageInfo(total);
  renderSellerPagination(total);
}

function saveSellerRequests() {
  try {
    localStorage.setItem(SELLER_REQUESTS_STORAGE_KEY, JSON.stringify(sellerRequests));
  } catch (e) {
    console.error('Không thể lưu yêu cầu người bán:', e);
  }
}

function setRequestStatus(id, status) {
  // Cập nhật trong mảng và localStorage
  var updated = false;
  for (var i = 0; i < sellerRequests.length; i++) {
    if (String(sellerRequests[i].id) === String(id)) {
      sellerRequests[i].status = status;
      updated = true;
      break;
    }
  }
  if (updated) {
    saveSellerRequests();
  }

  // Sau khi đổi trạng thái thì render lại để cập nhật filter + phân trang
  renderSellerRequests();
}

function ensureUserForApprovedSeller(id) {
  var req = null;
  for (var i = 0; i < sellerRequests.length; i++) {
    if (String(sellerRequests[i].id) === String(id)) {
      req = sellerRequests[i];
      break;
    }
  }
  if (!req || !req.email) return;

  var USERS_STORAGE_KEY = 'shopvn_users';
  var users = [];
  try {
    var raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (raw) {
      var parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) users = parsed;
    }
  } catch (e) {
    console.error('Không thể đọc users để đồng bộ seller:', e);
  }

  // Nếu user với email này đã tồn tại thì chỉ cập nhật role/status
  var existing = null;
  for (var j = 0; j < users.length; j++) {
    if (users[j].email === req.email) {
      existing = users[j];
      break;
    }
  }

  var displayName = req.email.split('@')[0] || 'Người Bán';
  displayName = displayName
    .split(/[._-]/)
    .filter(Boolean)
    .map(function (w) { return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase(); })
    .join(' ') || 'Người Bán';

  if (existing) {
    existing.role = 'seller';
    if (!existing.name) existing.name = displayName;
    if (!existing.phone && req.phone) existing.phone = req.phone;
    if (!existing.status) existing.status = 'active';
  } else {
    var maxId = users.length ? Math.max.apply(null, users.map(function (u) { return u.id || 0; })) : 0;
    var initials = displayName.substring(0, 2).toUpperCase();
    var today = new Date().toISOString().split('T')[0];
    users.push({
      id: maxId + 1,
      name: displayName,
      email: req.email,
      phone: req.phone || '',
      role: 'seller',
      status: 'active',
      createdAt: today,
      avatar: initials
    });
  }

  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  } catch (e2) {
    console.error('Không thể lưu users sau khi đồng bộ seller:', e2);
  }
}

function filterSellers(status) {
  sellerCurrentFilter = status || 'all';
  sellerCurrentPage = 1;

  var tabs = document.querySelectorAll('.filter-tab');
  tabs.forEach(function(tab) {
    var tabStatus = tab.getAttribute('data-status') || 'all';
    if (tabStatus === sellerCurrentFilter) {
      tab.classList.add('active');
    } else {
      tab.classList.remove('active');
    }
  });

  renderSellerRequests();
}

function updateSellerFilterCounts() {
  var counts = {
    submitted: 0,
    approved: 0,
    rejected: 0,
    suspended: 0,
    locked: 0
  };

  sellerRequests.forEach(function (req) {
    var st = req.status || 'submitted';
    if (counts.hasOwnProperty(st)) {
      counts[st]++;
    }
  });

  var tabs = document.querySelectorAll('.filter-tab');
  tabs.forEach(function (tab) {
    var st = tab.getAttribute('data-status');
    if (!st || st === 'all') {
      // Tất cả: tổng tất cả trạng thái được đếm
      var total = 0;
      for (var key in counts) {
        if (counts.hasOwnProperty(key)) total += counts[key];
      }
      tab.textContent = 'Tất cả';
    } else if (st === 'submitted') {
      tab.textContent = 'Đang chờ (' + counts.submitted + ')';
    } else if (st === 'approved') {
      tab.textContent = 'Đã duyệt (' + counts.approved + ')';
    } else if (st === 'rejected') {
      tab.textContent = 'Từ chối (' + counts.rejected + ')';
    } else if (st === 'suspended') {
      tab.textContent = 'Tạm ngưng (' + counts.suspended + ')';
    } else if (st === 'locked') {
      tab.textContent = 'Đã khóa (' + counts.locked + ')';
    }
  });
}

function approveSeller(id) {
  if (confirm('Bạn có chắc muốn duyệt người bán này?')) {
    setRequestStatus(id, 'approved');
    ensureUserForApprovedSeller(id);
    alert('Đã duyệt người bán thành công!');
  }
}

function rejectSeller(id) {
  const reason = prompt('Nhập lý do từ chối:');
  if (reason) {
    setRequestStatus(id, 'rejected');
    alert('Đã từ chối người bán. Lý do: ' + reason);
  }
}

function suspendSeller(id) {
  const days = prompt('Nhập số ngày tạm ngưng (hoặc để trống cho vô thời hạn):');
  if (confirm('Bạn có chắc muốn tạm ngưng người bán này?')) {
    setRequestStatus(id, 'suspended');
    alert('Đã tạm ngưng người bán ' + (days ? days + ' ngày' : 'vô thời hạn'));
  }
}

function lockSeller(id) {
  if (confirm('Bạn có chắc muốn khóa tài khoản người bán này? Hành động này không thể hoàn tác.')) {
    alert('Đã khóa tài khoản người bán!');
    // Update status logic here
  }
}

// Search
document.addEventListener('DOMContentLoaded', function() {
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', function(e) {
      const query = e.target.value.toLowerCase();
      // Search logic here
      console.log('Search:', query);
    });
  }

  // Sau khi trang load, hiển thị các yêu cầu người bán mới
  renderSellerRequests();
});

