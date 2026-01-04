var MODERATION_ITEMS_KEY = 'shopvn_moderation_items';

var moderationItems = [];
var currentFilter = 'all';
var currentSearch = '';

function loadModerationItems() {
  try {
    var raw = localStorage.getItem(MODERATION_ITEMS_KEY);
    if (!raw) {
      moderationItems = [
        {
          id: 1,
          kind: 'product',
          title: 'Áo thun đen cao cấp',
          subtitle: 'Sản phẩm #12345',
          creatorName: 'Nguyễn Văn A',
          creatorShop: 'Shop ABC',
          date: '16/01/2025',
          timeAgo: '1 giờ trước',
          status: 'pending',
          violations: ['Nội dung nhạy cảm'],
          images: [
            'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
            'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400'
          ]
        },
        {
          id: 2,
          kind: 'product',
          title: 'Túi da xanh lá',
          subtitle: 'Sản phẩm #12346',
          creatorName: 'Lê Thị B',
          creatorShop: 'Shop XYZ',
          date: '16/01/2025',
          timeAgo: '2 giờ trước',
          status: 'violation',
          violations: ['Ảnh không phù hợp', 'Mô tả sai'],
          images: [
            'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=400'
          ]
        },
        {
          id: 3,
          kind: 'attribute',
          title: 'Thuộc tính: Màu sắc',
          subtitle: 'Giá trị: "Đỏ máu", "Xanh rêu"',
          creatorName: 'Trần Văn C',
          creatorShop: 'Shop 123',
          date: '15/01/2025',
          timeAgo: '1 ngày trước',
          status: 'rejected',
          violations: ['Thuộc tính nhạy cảm'],
          images: []
        }
      ];
      saveModerationItems();
      return;
    }
    var parsed = JSON.parse(raw);
    moderationItems = Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Không thể đọc danh sách kiểm duyệt', e);
    moderationItems = [];
  }
}

function saveModerationItems() {
  try {
    localStorage.setItem(MODERATION_ITEMS_KEY, JSON.stringify(moderationItems));
  } catch (e) {
    console.error('Không thể lưu danh sách kiểm duyệt', e);
  }
}

function getStatusBadgeClass(status) {
  if (status === 'pending') return 'status-pending';
  if (status === 'violation') return 'status-violation';
  if (status === 'approved') return 'status-approved';
  if (status === 'rejected') return 'status-rejected';
  return '';
}

function getStatusLabel(status) {
  if (status === 'pending') return 'Chờ duyệt';
  if (status === 'violation') return 'Vi phạm';
  if (status === 'approved') return 'Đã duyệt';
  if (status === 'rejected') return 'Từ chối';
  return '';
}

function renderModerationTable() {
  var tbody = document.getElementById('moderationTableBody');
  if (!tbody) return;

  var items = moderationItems.filter(function (item) {
    if (currentFilter !== 'all' && item.status !== currentFilter) return false;
    if (!currentSearch) return true;
    var q = currentSearch.toLowerCase();
    return (
      (item.title || '').toLowerCase().includes(q) ||
      (item.subtitle || '').toLowerCase().includes(q) ||
      (item.creatorName || '').toLowerCase().includes(q) ||
      (item.creatorShop || '').toLowerCase().includes(q)
    );
  });

  tbody.innerHTML = items
    .map(function (item, index) {
      var badgeClass = getStatusBadgeClass(item.status);
      var statusLabel = getStatusLabel(item.status);
      var violationsHtml = (item.violations || [])
        .map(function (v) {
          return '<span class="violation-tag">' + v + '</span>';
        })
        .join('');

      var imagesHtml = (item.images || [])
        .map(function (src) {
          return '<img src="' + src + '" onclick="viewImage(\'' + src + '\')" />';
        })
        .join('');

      var rowIndex = moderationItems.indexOf(item);

      return (
        '<tr>' +
        '  <td class="chk"><input type="checkbox" /></td>' +
        '  <td>' +
        '    <div class="product">' +
        '      <div class="thumb">' +
        (item.images && item.images[0]
          ? '        <img src="' + item.images[0] + '" alt="" />'
          : '        <div class="thumb-placeholder"></div>') +
        '      </div>' +
        '      <div>' +
        '        <div class="name">' + item.title + '</div>' +
        '        <div class="sub">' + (item.subtitle || '') + '</div>' +
        (imagesHtml
          ? '        <div class="image-preview">' + imagesHtml + '</div>'
          : '') +
        '      </div>' +
        '    </div>' +
        '  </td>' +
        '  <td>' + (item.kind === 'attribute' ? 'Thuộc tính' : 'Sản phẩm') + '</td>' +
        '  <td>' +
        '    <div>' + item.creatorName + '</div>' +
        '    <div class="sub">' + item.creatorShop + '</div>' +
        '  </td>' +
        '  <td>' +
        '    <div>' + item.date + '</div>' +
        '    <div class="sub">' + item.timeAgo + '</div>' +
        '  </td>' +
        '  <td><span class="status-badge ' + badgeClass + '">' + statusLabel + '</span></td>' +
        '  <td><div class="violation-tags">' + violationsHtml + '</div></td>' +
        '  <td>' +
        '    <div class="act">' +
        '      <div class="pill view" title="Xem chi tiết" onclick="viewDetails(' + rowIndex + ')">' +
        '        <svg viewBox="0 0 24 24" fill="none" width="16" height="16"><circle cx="12" cy="12" r="3" stroke="currentColor"/><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" stroke="currentColor"/></svg>' +
        '      </div>' +
        (item.status === 'approved'
          ? ''
          : '      <div class="pill edit" title="Duyệt" onclick="approveContent(' + rowIndex + ')" style="color:#10b981">' +
            '        <svg viewBox="0 0 24 24" fill="none" width="16" height="16"><path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2"/></svg>' +
            '      </div>') +
        (item.status === 'violation'
          ? '      <div class="pill del" title="Gỡ vi phạm" onclick="removeViolation(' + rowIndex + ')">' +
            '        <svg viewBox="0 0 24 24" fill="none" width="16" height="16"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14z" stroke="currentColor"/></svg>' +
            '      </div>'
          : '') +
        '    </div>' +
        '  </td>' +
        '</tr>'
      );
    })
    .join('');

  updateCounters();
}

function updateCounters() {
  var total = moderationItems.length;
  var pending = moderationItems.filter(function (i) { return i.status === 'pending'; }).length;
  var violation = moderationItems.filter(function (i) { return i.status === 'violation'; }).length;
  var approved = moderationItems.filter(function (i) { return i.status === 'approved'; }).length;
  var rejected = moderationItems.filter(function (i) { return i.status === 'rejected'; }).length;

  var tabAll = document.getElementById('tab-all');
  var tabPending = document.getElementById('tab-pending');
  var tabViolation = document.getElementById('tab-violation');
  var tabApproved = document.getElementById('tab-approved');
  var tabRejected = document.getElementById('tab-rejected');

  if (tabAll) tabAll.textContent = 'Tất cả (' + total + ')';
  if (tabPending) tabPending.textContent = 'Chờ duyệt (' + pending + ')';
  if (tabViolation) tabViolation.textContent = 'Vi phạm (' + violation + ')';
  if (tabApproved) tabApproved.textContent = 'Đã duyệt (' + approved + ')';
  if (tabRejected) tabRejected.textContent = 'Từ chối (' + rejected + ')';
}

function filterContent(status, evt) {
  currentFilter = status;
  var tabs = document.querySelectorAll('.filter-tab');
  tabs.forEach(function (tab) { tab.classList.remove('active'); });
  if (evt && evt.target) {
    evt.target.classList.add('active');
  }
  renderModerationTable();
}

function viewDetails(index) {
  var item = moderationItems[index];
  if (!item) return;

  var backdrop = document.getElementById('moderation-detail-backdrop');
  var titleEl = document.getElementById('detail-title');
  var subtitleEl = document.getElementById('detail-subtitle');
  var creatorEl = document.getElementById('detail-creator');
  var dateEl = document.getElementById('detail-date');
  var statusEl = document.getElementById('detail-status');
  var violationsEl = document.getElementById('detail-violations');
  var imagesEl = document.getElementById('detail-images');

  if (!backdrop || !titleEl || !subtitleEl || !creatorEl || !dateEl || !statusEl || !violationsEl || !imagesEl) return;

  titleEl.textContent = item.title || '';
  subtitleEl.textContent = item.subtitle || '';
  creatorEl.textContent = (item.creatorName || '') + ' · ' + (item.creatorShop || '');
  dateEl.textContent = item.date + ' · ' + item.timeAgo;
  statusEl.textContent = getStatusLabel(item.status);
  statusEl.className = 'status-badge ' + getStatusBadgeClass(item.status);

  violationsEl.innerHTML = (item.violations || [])
    .map(function (v) { return '<span class="violation-tag">' + v + '</span>'; })
    .join('') || '<span class="sub">Không có vi phạm</span>';

  imagesEl.innerHTML = (item.images || [])
    .map(function (src) {
      return '<img src="' + src + '" onclick="viewImage(\'' + src + '\')" />';
    })
    .join('');

  backdrop.style.display = 'flex';
}

function closeModerationDetail() {
  var backdrop = document.getElementById('moderation-detail-backdrop');
  if (backdrop) {
    backdrop.style.display = 'none';
  }
}

function approveContent(index) {
  var item = moderationItems[index];
  if (!item) return;
  if (!confirm('Bạn có chắc muốn duyệt nội dung này?')) return;
  item.status = 'approved';
  saveModerationItems();
  renderModerationTable();
}

function removeViolation(index) {
  var item = moderationItems[index];
  if (!item) return;
  if (!confirm('Bạn có chắc muốn gỡ vi phạm và duyệt nội dung này?')) return;
  item.status = 'approved';
  item.violations = [];
  saveModerationItems();
  renderModerationTable();
}

function viewImage(src) {
  window.open(src, '_blank');
}

document.addEventListener('DOMContentLoaded', function () {
  loadModerationItems();
  var searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', function (e) {
      currentSearch = e.target.value || '';
      renderModerationTable();
    });
  }

  var backdrop = document.getElementById('moderation-detail-backdrop');
  if (backdrop) {
    backdrop.addEventListener('click', function (event) {
      if (event.target === backdrop) closeModerationDetail();
    });
  }

  renderModerationTable();
});
