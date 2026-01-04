const PROMO_STORAGE_KEY = 'shopvn_admin_promos';
let promos = [];
let editingPromoId = null;

function loadPromos() {
  try {
    const raw = localStorage.getItem(PROMO_STORAGE_KEY);
    if (!raw) {
      promos = [];
      return;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      promos = parsed;
    } else {
      promos = [];
    }
  } catch (e) {
    console.error('Không thể đọc khuyến mãi từ localStorage', e);
    promos = [];
  }
}

function savePromos() {
  try {
    localStorage.setItem(PROMO_STORAGE_KEY, JSON.stringify(promos));
  } catch (e) {
    console.error('Không thể lưu khuyến mãi vào localStorage', e);
  }
}

function formatCurrency(value) {
  if (value === null || value === undefined || value === '') return '0đ';
  const num = Number(value) || 0;
  return num.toLocaleString('vi-VN') + 'đ';
}

function getStatusBadge(status) {
  switch (status) {
    case 'active':
      return '<span class="promo-badge badge-active">Đang hoạt động</span>';
    case 'scheduled':
      return '<span class="promo-badge badge-scheduled">Đã lên lịch</span>';
    case 'ended':
      return '<span class="promo-badge badge-ended">Đã kết thúc</span>';
    default:
      return '<span class="promo-badge badge-ended">Không xác định</span>';
  }
}

function renderPromos() {
  const container = document.getElementById('promo-list');
  if (!container) return;

  if (!promos || promos.length === 0) {
    container.innerHTML = '<div class="promo-empty">Chưa có khuyến mãi nào. Bấm "Tạo Voucher" để thêm mới.</div>';
    return;
  }

  const itemsHtml = promos
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
    .map(function (p) {
      const budget = formatCurrency(p.budget);
      const used = formatCurrency(p.used);
      const issued = Number(p.issued || 0);
      const redeemed = Number(p.redeemed || 0);
      const usedPercent = p.budget ? Math.min(100, ((Number(p.used || 0) / Number(p.budget || 1)) * 100)).toFixed(1) : null;
      const redeemedPercent = issued ? Math.min(100, ((redeemed / issued) * 100)).toFixed(1) : null;

      const timeLabel = (p.start || p.end)
        ? [p.start, p.end].filter(Boolean).join(' - ')
        : 'Không giới hạn';

      const budgetInfo = [
        '<div class="budget-info">',
        '  <div>',
        '    <div style="color:var(--muted);font-size:12px">Ngân sách</div>',
        '    <div style="font-weight:700;font-size:16px;margin-top:4px">' + budget + '</div>',
        usedPercent !== null
          ? '    <div style="color:var(--muted);font-size:12px;margin-top:2px">Đã sử dụng: ' + used + ' (' + usedPercent + '%)</div>'
          : '    <div style="color:var(--muted);font-size:12px;margin-top:2px">Đã sử dụng: ' + used + '</div>',
        '  </div>',
        '  <div>',
        '    <div style="color:var(--muted);font-size:12px">Thời gian</div>',
        '    <div style="font-weight:700;font-size:16px;margin-top:4px">' + timeLabel + '</div>',
        '    <div style="color:var(--muted);font-size:12px;margin-top:2px">Trạng thái: ' + (p.statusLabel || '') + '</div>',
        '  </div>',
        '  <div>',
        '    <div style="color:var(--muted);font-size:12px">Voucher</div>',
        '    <div style="font-weight:700;font-size:16px;margin-top:4px">' + issued + ' voucher</div>',
        redeemedPercent !== null
          ? '    <div style="color:var(--muted);font-size:12px;margin-top:2px">Đã dùng: ' + redeemed + ' (' + redeemedPercent + '%)</div>'
          : '    <div style="color:var(--muted);font-size:12px;margin-top:2px">Đã dùng: ' + redeemed + '</div>',
        '  </div>',
        '</div>'
      ].join('');

      var actions = [
        '<button class="btn btn-secondary" onclick="editPromo(' + p.id + ')">Chỉnh sửa</button>'
      ];

      if (p.status !== 'ended') {
        actions.push('<button class="btn" style="background:rgba(239,68,68,0.2);color:#ef4444;border:1px solid rgba(239,68,68,0.3)" onclick="endPromo(' + p.id + ')">Kết thúc</button>');
      }

      actions.push('<button class="btn btn-danger" onclick="deletePromo(' + p.id + ')">Xóa</button>');

      return [
        '<div class="promo-card">',
        '  <div class="promo-header">',
        '    <div>',
        '      <div style="font-weight:700;font-size:18px">' + (p.code || '') + '</div>',
        '      <div style="color:var(--muted);font-size:13px;margin-top:4px">' + (p.description || '') + '</div>',
        '    </div>',
        '    ' + getStatusBadge(p.status || 'active'),
        '  </div>',
        budgetInfo,
        '  <div class="promo-actions">' + actions.join('') + '</div>',
        '</div>'
      ].join('');
    })
    .join('');

  container.innerHTML = itemsHtml;
}

function openPromoModal(mode, promo) {
  const backdrop = document.getElementById('promo-modal-backdrop');
  const title = document.getElementById('promo-modal-title');
  const form = document.getElementById('promo-form');

  if (!backdrop || !title || !form) return;

  title.textContent = mode === 'edit' ? 'Chỉnh sửa khuyến mãi' : 'Tạo khuyến mãi';

  document.getElementById('promo-code').value = promo?.code || '';
  document.getElementById('promo-description').value = promo?.description || '';
  document.getElementById('promo-budget').value = promo?.budget || '';
  document.getElementById('promo-used').value = promo?.used || '';
  document.getElementById('promo-start').value = promo?.start || '';
  document.getElementById('promo-end').value = promo?.end || '';
  document.getElementById('promo-issued').value = promo?.issued || '';
  document.getElementById('promo-redeemed').value = promo?.redeemed || '';
  document.getElementById('promo-status').value = promo?.status || 'active';

  backdrop.style.display = 'flex';
}

function closePromoModal() {
  const backdrop = document.getElementById('promo-modal-backdrop');
  if (backdrop) {
    backdrop.style.display = 'none';
  }
  editingPromoId = null;
}

function createVoucher() {
  editingPromoId = null;
  openPromoModal('create', null);
}

function editPromo(id) {
  const promo = promos.find(function (p) { return String(p.id) === String(id); });
  if (!promo) {
    alert('Không tìm thấy khuyến mãi để chỉnh sửa');
    return;
  }
  editingPromoId = promo.id;
  openPromoModal('edit', promo);
}

function endPromo(id) {
  if (confirm('Bạn có chắc muốn kết thúc khuyến mãi này?')) {
    const index = promos.findIndex(function (p) { return String(p.id) === String(id); });
    if (index === -1) {
      alert('Không tìm thấy khuyến mãi');
      return;
    }
    promos[index].status = 'ended';
    promos[index].statusLabel = 'Đã kết thúc';
    savePromos();
    renderPromos();
    alert('Đã kết thúc khuyến mãi!');
  }
}

function cancelPromo(id) {
  if (confirm('Bạn có chắc muốn hủy khuyến mãi này?')) {
    deletePromo(id);
    alert('Đã hủy khuyến mãi!');
  }
}

function deletePromo(id) {
  const index = promos.findIndex(function (p) { return String(p.id) === String(id); });
  if (index === -1) {
    alert('Không tìm thấy khuyến mãi');
    return;
  }
  promos.splice(index, 1);
  savePromos();
  renderPromos();
}

document.addEventListener('DOMContentLoaded', function () {
  loadPromos();

  if (!promos || promos.length === 0) {
    promos = [
      {
        id: Date.now(),
        code: 'GIAM50K',
        description: 'Giảm 50,000đ cho đơn từ 500,000đ',
        budget: 50000000,
        used: 23450000,
        start: '2025-01-01',
        end: '2025-01-31',
        issued: 469,
        redeemed: 234,
        status: 'active',
        statusLabel: 'Đang hoạt động',
        createdAt: Date.now()
      }
    ];
    savePromos();
  }

  renderPromos();

  const form = document.getElementById('promo-form');
  if (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();

      const code = document.getElementById('promo-code').value.trim();
      if (!code) {
        alert('Vui lòng nhập mã khuyến mãi');
        return;
      }

      const promoData = {
        code: code,
        description: document.getElementById('promo-description').value.trim(),
        budget: Number(document.getElementById('promo-budget').value || 0),
        used: Number(document.getElementById('promo-used').value || 0),
        start: document.getElementById('promo-start').value,
        end: document.getElementById('promo-end').value,
        issued: Number(document.getElementById('promo-issued').value || 0),
        redeemed: Number(document.getElementById('promo-redeemed').value || 0),
        status: document.getElementById('promo-status').value,
        statusLabel:
          document.getElementById('promo-status').value === 'active'
            ? 'Đang hoạt động'
            : document.getElementById('promo-status').value === 'scheduled'
            ? 'Đã lên lịch'
            : 'Đã kết thúc'
      };

      if (editingPromoId !== null && editingPromoId !== undefined) {
        const index = promos.findIndex(function (p) { return String(p.id) === String(editingPromoId); });
        if (index !== -1) {
          promos[index] = Object.assign({}, promos[index], promoData);
        }
      } else {
        promoData.id = Date.now();
        promoData.createdAt = Date.now();
        promos.push(promoData);
      }

      savePromos();
      renderPromos();
      closePromoModal();
    });
  }

  const backdrop = document.getElementById('promo-modal-backdrop');
  if (backdrop) {
    backdrop.addEventListener('click', function (event) {
      if (event.target === backdrop) {
        closePromoModal();
      }
    });
  }
});

