var FINANCE_RECON_KEY = 'shopvn_finance_reconciliations';
var FINANCE_PAYOUT_KEY = 'shopvn_finance_payouts';

var reconciliations = [];
var payouts = [];
var financeSearch = '';

function toggleSidebar() {
  document.querySelector('.layout').classList.toggle('collapsed');
  localStorage.setItem('sidebarCollapsed', document.querySelector('.layout').classList.contains('collapsed'));
}

if (localStorage.getItem('sidebarCollapsed') === 'true') {
  document.addEventListener('DOMContentLoaded', function () {
    document.querySelector('.layout').classList.add('collapsed');
  });
}

function loadFinanceData() {
  try {
    var rawRe = localStorage.getItem(FINANCE_RECON_KEY);
    if (!rawRe) {
      reconciliations = [
        {
          id: 1,
          period: 'Tháng 1/2025',
          gmv: '45.800.000.000 ₫',
          platformFee: '2.290.000.000 ₫',
          commission: '1.832.000.000 ₫',
          payoutAmount: '41.678.000.000 ₫',
          status: 'pending'
        },
        {
          id: 2,
          period: 'Tháng 12/2024',
          gmv: '52.300.000.000 ₫',
          platformFee: '2.615.000.000 ₫',
          commission: '2.092.000.000 ₫',
          payoutAmount: '47.593.000.000 ₫',
          status: 'completed'
        }
      ];
      saveReconciliations();
    } else {
      var parsedRe = JSON.parse(rawRe);
      reconciliations = Array.isArray(parsedRe) ? parsedRe : [];
      
      // Kiểm tra và cập nhật format tiền từ "đ" sang "₫"
      var needsUpdate = false;
      if (reconciliations.length > 0) {
        var firstRecon = reconciliations[0];
        if (firstRecon.gmv && firstRecon.gmv.includes('đ') && !firstRecon.gmv.includes('₫')) {
          needsUpdate = true;
        }
      }
      
      if (needsUpdate) {
        reconciliations = reconciliations.map(function(r) {
          return {
            id: r.id,
            period: r.period,
            gmv: (r.gmv || '').replace(/đ/g, '₫').replace(/,/g, '.'),
            platformFee: (r.platformFee || '').replace(/đ/g, '₫').replace(/,/g, '.'),
            commission: (r.commission || '').replace(/đ/g, '₫').replace(/,/g, '.'),
            payoutAmount: (r.payoutAmount || '').replace(/đ/g, '₫').replace(/,/g, '.'),
            status: r.status
          };
        });
        saveReconciliations();
      }
    }

    var rawPayouts = localStorage.getItem(FINANCE_PAYOUT_KEY);
    if (!rawPayouts) {
      payouts = [
        {
          id: 1,
          sellerName: 'Shop Điện Tử ABC',
          sellerOwner: 'Nguyễn Văn An',
          walletBalance: '125.450.000 ₫',
          pendingAmount: '45.230.000 ₫',
          schedule: '15/01/2025 (hàng tuần)',
          lastManual: null
        },
        {
          id: 2,
          sellerName: 'Shop Thời Trang XYZ',
          sellerOwner: 'Trần Thị Bình',
          walletBalance: '89.670.000 ₫',
          pendingAmount: '32.150.000 ₫',
          schedule: '20/01/2025 (hàng tháng)',
          lastManual: null
        },
        {
          id: 3,
          sellerName: 'Shop Mỹ Phẩm 123',
          sellerOwner: 'Lê Văn Cường',
          walletBalance: '156.890.000 ₫',
          pendingAmount: '78.450.000 ₫',
          schedule: '25/01/2025 (hàng tuần)',
          lastManual: null
        },
        {
          id: 4,
          sellerName: 'Shop Đồ Gia Dụng',
          sellerOwner: 'Phạm Thị Dung',
          walletBalance: '98.230.000 ₫',
          pendingAmount: '35.670.000 ₫',
          schedule: '10/01/2025 (hàng tháng)',
          lastManual: null
        },
        {
          id: 5,
          sellerName: 'Shop Sách Online',
          sellerOwner: 'Hoàng Văn Em',
          walletBalance: '67.450.000 ₫',
          pendingAmount: '22.890.000 ₫',
          schedule: '05/01/2025 (hàng tuần)',
          lastManual: null
        }
      ];
      savePayouts();
    } else {
      var parsedP = JSON.parse(rawPayouts);
      payouts = Array.isArray(parsedP) ? parsedP : [];
      
      // Kiểm tra và cập nhật format tiền từ "đ" sang "₫"
      var needsUpdatePayout = false;
      if (payouts.length > 0) {
        var firstPayout = payouts[0];
        if (firstPayout.walletBalance && firstPayout.walletBalance.includes('đ') && !firstPayout.walletBalance.includes('₫')) {
          needsUpdatePayout = true;
        }
      }
      
      if (needsUpdatePayout) {
        payouts = payouts.map(function(p) {
          return {
            id: p.id,
            sellerName: p.sellerName,
            sellerOwner: p.sellerOwner,
            walletBalance: (p.walletBalance || '').replace(/đ/g, '₫').replace(/,/g, '.'),
            pendingAmount: (p.pendingAmount || '').replace(/đ/g, '₫').replace(/,/g, '.'),
            schedule: p.schedule,
            lastManual: p.lastManual
          };
        });
        savePayouts();
      }
    }
  } catch (e) {
    console.error('Không thể đọc dữ liệu tài chính', e);
    reconciliations = [];
    payouts = [];
  }
}

function saveReconciliations() {
  try {
    localStorage.setItem(FINANCE_RECON_KEY, JSON.stringify(reconciliations));
  } catch (e) {
    console.error('Không thể lưu đối soát', e);
  }
}

function savePayouts() {
  try {
    localStorage.setItem(FINANCE_PAYOUT_KEY, JSON.stringify(payouts));
  } catch (e) {
    console.error('Không thể lưu payout', e);
  }
}

function renderFinance() {
  renderReconciliations();
  renderPayouts();
  updateFinanceStats();
}

function renderReconciliations() {
  var tbody = document.getElementById('reconciliationTableBody');
  if (!tbody) return;

  var items = reconciliations.filter(function (r) {
    if (!financeSearch) return true;
    var q = financeSearch.toLowerCase();
    return (r.period || '').toLowerCase().includes(q);
  });

  tbody.innerHTML = items
    .map(function (r) {
      var statusLabel = r.status === 'completed' ? 'Đã thanh toán' : 'Chờ thanh toán';
      var statusClass = r.status === 'completed' ? 'status-completed' : 'status-pending';
      var canProcess = r.status !== 'completed';
      return (
        '<tr>' +
        '  <td>' + r.period + '</td>' +
        '  <td class="price">' + r.gmv + '</td>' +
        '  <td class="price">' + r.platformFee + '</td>' +
        '  <td class="price">' + r.commission + '</td>' +
        '  <td class="price">' + r.payoutAmount + '</td>' +
        '  <td><span class="status-badge ' + statusClass + '">' + statusLabel + '</span></td>' +
        '  <td>' +
        '    <div class="act">' +
        '      <div class="pill view" onclick="viewDetails(' + r.id + ')">' +
        '        <svg viewBox="0 0 24 24" fill="none" width="16" height="16"><circle cx="12" cy="12" r="3" stroke="currentColor"/><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" stroke="currentColor"/></svg>' +
        '      </div>' +
        (canProcess
          ? '      <div class="pill edit" onclick="processPayout(' + r.id + ')">' +
            '        <svg viewBox="0 0 24 24" fill="none" width="16" height="16"><path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2"/></svg>' +
            '      </div>'
          : '') +
        '    </div>' +
        '  </td>' +
        '</tr>'
      );
    })
    .join('');
}

function renderPayouts() {
  var tbody = document.getElementById('payoutTableBody');
  if (!tbody) return;

  tbody.innerHTML = payouts
    .map(function (p) {
      return (
        '<tr>' +
        '  <td>' +
        '    <div class="name">' + p.sellerName + '</div>' +
        '    <div class="sub">' + p.sellerOwner + '</div>' +
        '  </td>' +
        '  <td class="price">' + p.walletBalance + '</td>' +
        '  <td class="price">' + p.pendingAmount + '</td>' +
        '  <td>' + p.schedule + (p.lastManual ? '<br/><span class="sub">Lần chuyển thủ công cuối: ' + p.lastManual + '</span>' : '') + '</td>' +
        '  <td>' +
        '    <div class="act">' +
        '      <div class="pill edit" onclick="manualPayout(' + p.id + ')">' +
        '        <svg viewBox="0 0 24 24" fill="none" width="16" height="16"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke="currentColor" stroke-width="2"/></svg>' +
        '      </div>' +
        '    </div>' +
        '  </td>' +
        '</tr>'
      );
    })
    .join('');
}

function updateFinanceStats() {
  var statGmv = document.getElementById('stat-gmv');
  var statPlatform = document.getElementById('stat-platform-fee');
  var statCommission = document.getElementById('stat-commission');
  var statWallet = document.getElementById('stat-seller-wallet');

  if (!statGmv || !statPlatform || !statCommission || !statWallet) return;

  // Dùng dữ liệu thô (chuỗi) để hiển thị, đơn giản lấy từ kỳ gần nhất
  if (reconciliations.length) {
    var latest = reconciliations[0];
    statGmv.textContent = latest.gmv;
    statPlatform.textContent = latest.platformFee;
    statCommission.textContent = latest.commission;
  } else {
    statGmv.textContent = '0 ₫';
    statPlatform.textContent = '0 ₫';
    statCommission.textContent = '0 ₫';
  }

  // Hàm parse chuỗi tiền tệ "45.800.000 ₫" -> số 45800000
  function parseMoney(value) {
    if (!value) return 0;
    try {
      return parseInt(
        String(value).replace(/[^0-9]/g, ''),
        10
      ) || 0;
    } catch (e) {
      return 0;
    }
  }

  // Hàm format số -> chuỗi tiền tệ VN "45.800.000 ₫"
  function formatMoney(num) {
    try {
      return (num || 0).toLocaleString('vi-VN') + ' ₫';
    } catch (e) {
      return num + ' ₫';
    }
  }

  // Tổng ví người bán = tổng walletBalance payout (tính thật, không ghép chuỗi)
  var totalWalletNumber = payouts.reduce(function (sum, p) {
    return sum + parseMoney(p.walletBalance);
  }, 0);

  statWallet.textContent = formatMoney(totalWalletNumber);
}

function createReconciliation() {
  // demo: tạo thêm 1 kỳ mới với số liệu giả
  var month = prompt('Nhập tên kỳ đối soát (vd: Tháng 2/2025):');
  if (!month) return;
  var gmv = prompt('Tổng GMV của kỳ (vd: 40.000.000.000 ₫):', '40.000.000.000 ₫') || '0 ₫';
  var platform = prompt('Phí nền tảng (vd: 2.000.000.000 ₫):', '2.000.000.000 ₫') || '0 ₫';
  var commission = prompt('Hoa hồng (vd: 1.500.000.000 ₫):', '1.500.000.000 ₫') || '0 ₫';
  var payout = prompt('Số tiền thanh toán (vd: 36.500.000.000 ₫):', '36.500.000.000 ₫') || '0 ₫';

  var id = Date.now();
  reconciliations.unshift({
    id: id,
    period: month,
    gmv: gmv,
    platformFee: platform,
    commission: commission,
    payoutAmount: payout,
    status: 'pending'
  });

  saveReconciliations();
  renderFinance();
}

function getReconciliationById(id) {
  return reconciliations.find(function (r) { return r.id === id; });
}

function viewDetails(id) {
  var r = getReconciliationById(id);
  if (!r) return;

  var backdrop = document.getElementById('finance-detail-backdrop');
  var periodEl = document.getElementById('detail-period');
  var gmvEl = document.getElementById('detail-gmv');
  var platformEl = document.getElementById('detail-platform-fee');
  var commEl = document.getElementById('detail-commission');
  var payoutEl = document.getElementById('detail-payout');
  var statusEl = document.getElementById('detail-status');

  if (!backdrop || !periodEl || !gmvEl || !platformEl || !commEl || !payoutEl || !statusEl) return;

  periodEl.textContent = r.period;
  gmvEl.textContent = r.gmv;
  platformEl.textContent = r.platformFee;
  commEl.textContent = r.commission;
  payoutEl.textContent = r.payoutAmount;
  statusEl.textContent = r.status === 'completed' ? 'Đã thanh toán' : 'Chờ thanh toán';
  statusEl.className = 'status-badge ' + (r.status === 'completed' ? 'status-completed' : 'status-pending');

  backdrop.style.display = 'flex';
}

function closeFinanceDetail() {
  var backdrop = document.getElementById('finance-detail-backdrop');
  if (backdrop) {
    backdrop.style.display = 'none';
  }
}

function processPayout(id) {
  var r = getReconciliationById(id);
  if (!r) return;
  if (!confirm('Bạn có chắc muốn xử lý thanh toán cho kỳ đối soát này?')) return;
  r.status = 'completed';
  saveReconciliations();
  renderFinance();
}

function manualPayout(id) {
  var p = payouts.find(function (x) { return x.id === id; });
  if (!p) return;
  if (!confirm('Bạn có chắc muốn chuyển tiền thủ công cho người bán ' + p.sellerName + '?')) return;
  var now = new Date();
  p.lastManual = now.toLocaleString('vi-VN');
  savePayouts();
  renderFinance();
}

document.addEventListener('DOMContentLoaded', function () {
  loadFinanceData();

  var searchInput = document.getElementById('financeSearch');
  if (searchInput) {
    searchInput.addEventListener('input', function (e) {
      financeSearch = e.target.value || '';
      renderReconciliations();
    });
  }

  var detailBackdrop = document.getElementById('finance-detail-backdrop');
  if (detailBackdrop) {
    detailBackdrop.addEventListener('click', function (event) {
      if (event.target === detailBackdrop) closeFinanceDetail();
    });
  }

  renderFinance();

  // đảm bảo hàm dùng trong onclick inline luôn sẵn trên window
  window.createReconciliation = createReconciliation;
  window.viewDetails = viewDetails;
  window.processPayout = processPayout;
  window.manualPayout = manualPayout;
  window.closeFinanceDetail = closeFinanceDetail;
});
