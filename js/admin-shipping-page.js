var SHIPPING_PARTNERS_KEY = 'shopvn_shipping_partners';

var shippingPartners = [];
var currentSearch = '';

function toggleSidebar() {
  document.querySelector('.layout').classList.toggle('collapsed');
  localStorage.setItem('sidebarCollapsed', document.querySelector('.layout').classList.contains('collapsed'));
}

if (localStorage.getItem('sidebarCollapsed') === 'true') {
  document.addEventListener('DOMContentLoaded', function () {
    document.querySelector('.layout').classList.add('collapsed');
  });
}

function loadShippingPartners() {
  try {
    var raw = localStorage.getItem(SHIPPING_PARTNERS_KEY);
    if (!raw) {
      shippingPartners = [
        {
          id: 1,
          name: 'GHN - Giao Hàng Nhanh',
          webhook: 'https://api.ghn.vn/webhook/status',
          apiKeyMasked: '••••••••••••••••',
          sla: 'Thời gian giao hàng: 1-3 ngày làm việc',
          successRate: 98.5,
          status: 'active',
          fees: [
            { id: 1, region: 'Nội thành', baseFee: '25.000 ₫', extraFee: '5.000 ₫' },
            { id: 2, region: 'Liên tỉnh', baseFee: '35.000 ₫', extraFee: '8.000 ₫' }
          ]
        },
        {
          id: 2,
          name: 'GHTK - Giao Hàng Tiết Kiệm',
          webhook: 'https://api.ghtk.vn/webhook/status',
          apiKeyMasked: '••••••••••••••••',
          sla: 'Thời gian giao hàng: 2-5 ngày làm việc',
          successRate: 97.2,
          status: 'active',
          fees: [
            { id: 1, region: 'Nội thành', baseFee: '22.000 ₫', extraFee: '4.500 ₫' },
            { id: 2, region: 'Liên tỉnh', baseFee: '30.000 ₫', extraFee: '7.000 ₫' }
          ]
        },
        {
          id: 3,
          name: 'Viettel Post',
          webhook: 'https://api.viettelpost.vn/webhook/status',
          apiKeyMasked: '••••••••••••••••',
          sla: 'Thời gian giao hàng: 2-4 ngày làm việc',
          successRate: 96.8,
          status: 'active',
          fees: [
            { id: 1, region: 'Nội thành', baseFee: '20.000 ₫', extraFee: '4.000 ₫' },
            { id: 2, region: 'Liên tỉnh', baseFee: '28.000 ₫', extraFee: '6.000 ₫' },
            { id: 3, region: 'Vùng sâu vùng xa', baseFee: '40.000 ₫', extraFee: '10.000 ₫' }
          ]
        },
        {
          id: 4,
          name: 'J&T Express',
          webhook: 'https://api.jtexpress.vn/webhook/status',
          apiKeyMasked: '••••••••••••••••',
          sla: 'Thời gian giao hàng: 1-2 ngày làm việc',
          successRate: 97.5,
          status: 'active',
          fees: [
            { id: 1, region: 'Nội thành', baseFee: '18.000 ₫', extraFee: '3.500 ₫' },
            { id: 2, region: 'Liên tỉnh', baseFee: '25.000 ₫', extraFee: '5.500 ₫' }
          ]
        },
        {
          id: 5,
          name: 'Ninja Van',
          webhook: 'https://api.ninjavan.vn/webhook/status',
          apiKeyMasked: '••••••••••••••••',
          sla: 'Thời gian giao hàng: 2-3 ngày làm việc',
          successRate: 96.2,
          status: 'active',
          fees: [
            { id: 1, region: 'Nội thành', baseFee: '23.000 ₫', extraFee: '4.800 ₫' },
            { id: 2, region: 'Liên tỉnh', baseFee: '32.000 ₫', extraFee: '7.500 ₫' }
          ]
        },
        {
          id: 6,
          name: 'Best Express',
          webhook: 'https://api.bestexpress.vn/webhook/status',
          apiKeyMasked: '••••••••••••••••',
          sla: 'Thời gian giao hàng: 2-4 ngày làm việc',
          successRate: 95.8,
          status: 'active',
          fees: [
            { id: 1, region: 'Nội thành', baseFee: '19.000 ₫', extraFee: '3.800 ₫' },
            { id: 2, region: 'Liên tỉnh', baseFee: '27.000 ₫', extraFee: '6.200 ₫' }
          ]
        },
        {
          id: 7,
          name: 'Shopee Express',
          webhook: 'https://api.shopee.vn/express/webhook/status',
          apiKeyMasked: '••••••••••••••••',
          sla: 'Thời gian giao hàng: 1-3 ngày làm việc',
          successRate: 98.0,
          status: 'active',
          fees: [
            { id: 1, region: 'Nội thành', baseFee: '21.000 ₫', extraFee: '4.200 ₫' },
            { id: 2, region: 'Liên tỉnh', baseFee: '29.000 ₫', extraFee: '6.800 ₫' }
          ]
        }
      ];
      saveShippingPartners();
      return;
    }
    var parsed = JSON.parse(raw);
    shippingPartners = Array.isArray(parsed) ? parsed : [];
    
    // Danh sách đối tác mặc định mới
    var defaultPartners = [
      {
        id: 3,
        name: 'Viettel Post',
        webhook: 'https://api.viettelpost.vn/webhook/status',
        apiKeyMasked: '••••••••••••••••',
        sla: 'Thời gian giao hàng: 2-4 ngày làm việc',
        successRate: 96.8,
        status: 'active',
        fees: [
          { id: 1, region: 'Nội thành', baseFee: '20.000 ₫', extraFee: '4.000 ₫' },
          { id: 2, region: 'Liên tỉnh', baseFee: '28.000 ₫', extraFee: '6.000 ₫' },
          { id: 3, region: 'Vùng sâu vùng xa', baseFee: '40.000 ₫', extraFee: '10.000 ₫' }
        ]
      },
      {
        id: 4,
        name: 'J&T Express',
        webhook: 'https://api.jtexpress.vn/webhook/status',
        apiKeyMasked: '••••••••••••••••',
        sla: 'Thời gian giao hàng: 1-2 ngày làm việc',
        successRate: 97.5,
        status: 'active',
        fees: [
          { id: 1, region: 'Nội thành', baseFee: '18.000 ₫', extraFee: '3.500 ₫' },
          { id: 2, region: 'Liên tỉnh', baseFee: '25.000 ₫', extraFee: '5.500 ₫' }
        ]
      },
      {
        id: 5,
        name: 'Ninja Van',
        webhook: 'https://api.ninjavan.vn/webhook/status',
        apiKeyMasked: '••••••••••••••••',
        sla: 'Thời gian giao hàng: 2-3 ngày làm việc',
        successRate: 96.2,
        status: 'active',
        fees: [
          { id: 1, region: 'Nội thành', baseFee: '23.000 ₫', extraFee: '4.800 ₫' },
          { id: 2, region: 'Liên tỉnh', baseFee: '32.000 ₫', extraFee: '7.500 ₫' }
        ]
      },
      {
        id: 6,
        name: 'Best Express',
        webhook: 'https://api.bestexpress.vn/webhook/status',
        apiKeyMasked: '••••••••••••••••',
        sla: 'Thời gian giao hàng: 2-4 ngày làm việc',
        successRate: 95.8,
        status: 'active',
        fees: [
          { id: 1, region: 'Nội thành', baseFee: '19.000 ₫', extraFee: '3.800 ₫' },
          { id: 2, region: 'Liên tỉnh', baseFee: '27.000 ₫', extraFee: '6.200 ₫' }
        ]
      },
      {
        id: 7,
        name: 'Shopee Express',
        webhook: 'https://api.shopee.vn/express/webhook/status',
        apiKeyMasked: '••••••••••••••••',
        sla: 'Thời gian giao hàng: 1-3 ngày làm việc',
        successRate: 98.0,
        status: 'active',
        fees: [
          { id: 1, region: 'Nội thành', baseFee: '21.000 ₫', extraFee: '4.200 ₫' },
          { id: 2, region: 'Liên tỉnh', baseFee: '29.000 ₫', extraFee: '6.800 ₫' }
        ]
      }
    ];
    
    // Thêm các đối tác mới nếu chưa có
    var needsUpdate = false;
    defaultPartners.forEach(function(newPartner) {
      var exists = shippingPartners.some(function(p) {
        return p.id === newPartner.id || p.name === newPartner.name;
      });
      if (!exists) {
        shippingPartners.push(newPartner);
        needsUpdate = true;
      }
    });
    
    // Kiểm tra và cập nhật format tiền từ "đ" sang "₫" và từ dấu phẩy sang dấu chấm
    shippingPartners.forEach(function(partner) {
      if (partner.fees && Array.isArray(partner.fees)) {
        partner.fees.forEach(function(fee) {
          if (fee.baseFee && fee.baseFee.includes('đ') && !fee.baseFee.includes('₫')) {
            needsUpdate = true;
            fee.baseFee = fee.baseFee.replace(/đ/g, '₫').replace(/,/g, '.');
          }
          if (fee.extraFee && fee.extraFee.includes('đ') && !fee.extraFee.includes('₫')) {
            needsUpdate = true;
            fee.extraFee = fee.extraFee.replace(/đ/g, '₫').replace(/,/g, '.');
          }
        });
      }
    });
    
    // Cập nhật GHTK nếu chưa có fees
    var ghtk = shippingPartners.find(function(p) {
      return p.name === 'GHTK - Giao Hàng Tiết Kiệm';
    });
    if (ghtk && (!ghtk.fees || ghtk.fees.length === 0)) {
      ghtk.fees = [
        { id: 1, region: 'Nội thành', baseFee: '22.000 ₫', extraFee: '4.500 ₫' },
        { id: 2, region: 'Liên tỉnh', baseFee: '30.000 ₫', extraFee: '7.000 ₫' }
      ];
      needsUpdate = true;
    }
    
    if (needsUpdate) {
      saveShippingPartners();
    }
  } catch (e) {
    console.error('Không thể đọc danh sách đối tác vận chuyển', e);
    shippingPartners = [];
  }
}

function saveShippingPartners() {
  try {
    localStorage.setItem(SHIPPING_PARTNERS_KEY, JSON.stringify(shippingPartners));
  } catch (e) {
    console.error('Không thể lưu danh sách đối tác vận chuyển', e);
  }
}

function renderShippingPartners() {
  var container = document.getElementById('shipping-partners-container');
  if (!container) return;

  var items = shippingPartners.filter(function (p) {
    if (!currentSearch) return true;
    var q = currentSearch.toLowerCase();
    return (
      (p.name || '').toLowerCase().includes(q) ||
      (p.webhook || '').toLowerCase().includes(q)
    );
  });

  container.innerHTML = items
    .map(function (partner, partnerIndex) {
      var statusClass = partner.status === 'active' ? 'status-active' : 'status-inactive';
      var statusLabel = partner.status === 'active' ? 'Đang hoạt động' : 'Vô hiệu hóa';

      var feesHtml = (partner.fees || [])
        .map(function (fee, feeIndex) {
          return (
            '<tr>' +
            '  <td>' + fee.region + '</td>' +
            '  <td>' + fee.baseFee + '</td>' +
            '  <td>' + fee.extraFee + '</td>' +
            '  <td>' +
            '    <div class="act">' +
            '      <div class="pill edit" onclick="editFee(' + partnerIndex + ',' + feeIndex + ')">' +
            '        <svg viewBox="0 0 24 24" fill="none" width="16" height="16"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor"/></svg>' +
            '      </div>' +
            '    </div>' +
            '  </td>' +
            '</tr>'
          );
        })
        .join('');

      return (
        '<div class="shipping-partner">' +
        '  <div class="shipping-partner-header">' +
        '    <div>' +
        '      <div class="shipping-partner-name">' + partner.name + '</div>' +
        '      <div class="shipping-partner-sub">Webhook: ' + (partner.webhook || '') + '</div>' +
        '      <div class="shipping-partner-sub">API Key: ' + (partner.apiKeyMasked || '••••••••••••••••') + '</div>' +
        '    </div>' +
        '    <span class="' + statusClass + '">' + statusLabel + '</span>' +
        '  </div>' +
        '  <div class="shipping-partner-section">' +
        '    <div class="shipping-partner-section-title">SLA (Service Level Agreement)</div>' +
        '    <div class="shipping-partner-sub">' + (partner.sla || '') + '</div>' +
        '    <div class="shipping-partner-sub">Tỷ lệ thành công: ' + (partner.successRate || 0) + '%</div>' +
        '  </div>' +
        '  <div class="shipping-partner-section">' +
        '    <div class="shipping-partner-section-title">Bảng Phí Vận Chuyển</div>' +
        '    <table class="fee-table">' +
        '      <thead>' +
        '        <tr>' +
        '          <th>Khu vực</th>' +
        '          <th>Phí cơ bản (kg đầu)</th>' +
        '          <th>Phí thêm (mỗi kg)</th>' +
        '          <th>Hành động</th>' +
        '        </tr>' +
        '      </thead>' +
        '      <tbody>' + feesHtml + '</tbody>' +
        '    </table>' +
        '    <button class="btn btn-secondary" style="margin-top:8px" onclick="addFee(' + partnerIndex + ')">Thêm dòng phí</button>' +
        '  </div>' +
        '  <div class="shipping-partner-actions">' +
        '    <button class="btn" style="background:var(--panel-2);color:var(--text);border:1px solid var(--line)" onclick="editPartner(' + partnerIndex + ')">Chỉnh sửa</button>' +
        (partner.status === 'active'
          ? '    <button class="btn btn-danger" onclick="togglePartnerStatus(' + partnerIndex + ')">Vô hiệu hóa</button>'
          : '    <button class="btn" onclick="togglePartnerStatus(' + partnerIndex + ')">Kích hoạt lại</button>') +
        '  </div>' +
        '</div>'
      );
    })
    .join('');
}

function openPartnerModal(index) {
  console.log('openPartnerModal called with index:', index);
  
  var backdrop = document.getElementById('shipping-partner-modal-backdrop');
  if (!backdrop) {
    console.error('Không tìm thấy modal backdrop');
    alert('Không tìm thấy form thêm đối tác. Vui lòng làm mới trang.');
    return;
  }
  
  var title = document.getElementById('shipping-partner-modal-title');
  var nameInput = document.getElementById('partner-name');
  var webhookInput = document.getElementById('partner-webhook');
  var apiKeyInput = document.getElementById('partner-api-key');
  var slaInput = document.getElementById('partner-sla');
  var successInput = document.getElementById('partner-success');
  var statusSelect = document.getElementById('partner-status');
  
  if (!nameInput || !webhookInput || !apiKeyInput || !slaInput || !successInput || !statusSelect || !title) {
    console.error('Không tìm thấy các input trong modal');
    alert('Không tìm thấy các trường input trong form. Vui lòng làm mới trang.');
    return;
  }

  backdrop.dataset.index = typeof index === 'number' ? String(index) : '';

  if (typeof index === 'number' && shippingPartners[index]) {
    var p = shippingPartners[index];
    nameInput.value = p.name || '';
    webhookInput.value = p.webhook || '';
    apiKeyInput.value = p.apiKeyMasked || '';
    slaInput.value = p.sla || '';
    successInput.value = p.successRate != null ? p.successRate : '';
    statusSelect.value = p.status || 'active';
    title.textContent = 'Chỉnh sửa đối tác vận chuyển';
  } else {
    nameInput.value = '';
    webhookInput.value = '';
    apiKeyInput.value = '';
    slaInput.value = '';
    successInput.value = '';
    statusSelect.value = 'active';
    title.textContent = 'Thêm đối tác vận chuyển';
  }

  // Hiển thị modal - XÓA HOÀN TOÀN inline style và set lại bằng cssText
  backdrop.removeAttribute('style');
  backdrop.classList.add('show');
  
  // Set toàn bộ style bằng cssText để đảm bảo override mọi thứ
  backdrop.style.cssText = 'display: flex !important; position: fixed !important; top: 0 !important; left: 0 !important; right: 0 !important; bottom: 0 !important; width: 100vw !important; height: 100vh !important; z-index: 99999 !important; background: rgba(15, 23, 42, 0.6) !important; align-items: center !important; justify-content: center !important; margin: 0 !important; padding: 0 !important;';
  
  // Đảm bảo modal content hiển thị
  var modalContent = backdrop.querySelector('.modal');
  if (modalContent) {
    // Lấy màu từ CSS variable hoặc dùng màu mặc định
    var panelColor = getComputedStyle(document.documentElement).getPropertyValue('--panel') || '#141c2b';
    var lineColor = getComputedStyle(document.documentElement).getPropertyValue('--line') || '#21314a';
    modalContent.style.cssText = 'position: relative !important; max-width: 520px !important; background: ' + panelColor + ' !important; border-radius: 12px !important; border: 1px solid ' + lineColor + ' !important; padding: 20px 20px 16px !important; box-shadow: 0 22px 45px rgba(15, 23, 42, 0.45) !important; margin: 20px !important; z-index: 100000 !important; display: block !important; visibility: visible !important; opacity: 1 !important;';
  } else {
    console.error('Không tìm thấy modal content!');
  }
  
  // Force reflow
  void backdrop.offsetHeight;
  
  console.log('Modal opened:', {
    styleDisplay: backdrop.style.display,
    computedDisplay: window.getComputedStyle(backdrop).display,
    classList: backdrop.classList.toString(),
    modalContent: modalContent ? 'found' : 'not found',
    modalDisplay: modalContent ? window.getComputedStyle(modalContent).display : 'N/A'
  });
}

function closePartnerModal() {
  var backdrop = document.getElementById('shipping-partner-modal-backdrop');
  if (backdrop) {
    backdrop.style.display = 'none';
    backdrop.classList.remove('show');
    backdrop.dataset.index = '';
  }
}

function addPartner() {
  console.log('addPartner called');
  try {
    openPartnerModal(null);
  } catch (e) {
    console.error('Error in addPartner:', e);
    alert('Có lỗi xảy ra: ' + e.message);
  }
}

function editPartner(index) {
  console.log('editPartner called with index:', index);
  try {
    openPartnerModal(index);
  } catch (e) {
    console.error('Error in editPartner:', e);
    alert('Có lỗi xảy ra: ' + e.message);
  }
}

function togglePartnerStatus(index) {
  var p = shippingPartners[index];
  if (!p) return;
  var toInactive = p.status === 'active';
  if (!confirm((toInactive ? 'Vô hiệu hóa' : 'Kích hoạt lại') + ' đối tác này?')) return;
  p.status = toInactive ? 'inactive' : 'active';
  saveShippingPartners();
  renderShippingPartners();
}

function openFeeModal(partnerIndex, feeIndex) {
  var backdrop = document.getElementById('shipping-fee-modal-backdrop');
  var title = document.getElementById('shipping-fee-modal-title');
  var regionInput = document.getElementById('fee-region');
  var baseInput = document.getElementById('fee-base');
  var extraInput = document.getElementById('fee-extra');
  
  if (!backdrop || !title || !regionInput || !baseInput || !extraInput) {
    alert('Không tìm thấy form bảng phí. Vui lòng làm mới trang.');
    return;
  }
  
  if (typeof partnerIndex !== 'number' || !shippingPartners[partnerIndex]) {
    alert('Đối tác không hợp lệ.');
    return;
  }

  backdrop.dataset.partnerIndex = String(partnerIndex);
  backdrop.dataset.feeIndex = typeof feeIndex === 'number' ? String(feeIndex) : '';

  var p = shippingPartners[partnerIndex];
  var fee = p && typeof feeIndex === 'number' && p.fees && p.fees[feeIndex] ? p.fees[feeIndex] : null;

  if (fee) {
    regionInput.value = fee.region || '';
    baseInput.value = fee.baseFee || '';
    extraInput.value = fee.extraFee || '';
    title.textContent = 'Chỉnh sửa bảng phí';
  } else {
    regionInput.value = '';
    baseInput.value = '';
    extraInput.value = '';
    title.textContent = 'Thêm bảng phí';
  }

  // Hiển thị modal - XÓA HOÀN TOÀN inline style và set lại bằng cssText
  backdrop.removeAttribute('style');
  backdrop.classList.add('show');
  
  // Set toàn bộ style bằng cssText để đảm bảo override mọi thứ
  backdrop.style.cssText = 'display: flex !important; position: fixed !important; top: 0 !important; left: 0 !important; right: 0 !important; bottom: 0 !important; width: 100vw !important; height: 100vh !important; z-index: 99999 !important; background: rgba(15, 23, 42, 0.6) !important; align-items: center !important; justify-content: center !important; margin: 0 !important; padding: 0 !important;';
  
  // Đảm bảo modal content hiển thị
  var modalContent = backdrop.querySelector('.modal');
  if (modalContent) {
    // Lấy màu từ CSS variable hoặc dùng màu mặc định
    var panelColor = getComputedStyle(document.documentElement).getPropertyValue('--panel') || '#141c2b';
    var lineColor = getComputedStyle(document.documentElement).getPropertyValue('--line') || '#21314a';
    modalContent.style.cssText = 'position: relative !important; max-width: 520px !important; background: ' + panelColor + ' !important; border-radius: 12px !important; border: 1px solid ' + lineColor + ' !important; padding: 20px 20px 16px !important; box-shadow: 0 22px 45px rgba(15, 23, 42, 0.45) !important; margin: 20px !important; z-index: 100000 !important; display: block !important; visibility: visible !important; opacity: 1 !important;';
  } else {
    console.error('Không tìm thấy modal content!');
  }
  
  // Force reflow
  void backdrop.offsetHeight;
}

function closeFeeModal() {
  var backdrop = document.getElementById('shipping-fee-modal-backdrop');
  if (backdrop) {
    backdrop.style.display = 'none';
    backdrop.classList.remove('show');
    backdrop.dataset.partnerIndex = '';
    backdrop.dataset.feeIndex = '';
  }
}

function addFee(partnerIndex) {
  openFeeModal(partnerIndex, null);
}

function editFee(partnerIndex, feeIndex) {
  openFeeModal(partnerIndex, feeIndex);
}

// Expose functions globally
window.addPartner = addPartner;
window.editPartner = editPartner;
window.closePartnerModal = closePartnerModal;
window.closeFeeModal = closeFeeModal;
window.togglePartnerStatus = togglePartnerStatus;
window.addFee = addFee;
window.editFee = editFee;

document.addEventListener('DOMContentLoaded', function () {
  loadShippingPartners();

  var searchInput = document.getElementById('shippingSearch');
  if (searchInput) {
    searchInput.addEventListener('input', function (e) {
      currentSearch = e.target.value || '';
      renderShippingPartners();
    });
  }

  // Đăng ký form submit handlers
  var partnerForm = document.getElementById('shipping-partner-form');
  if (partnerForm) {
    partnerForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var backdrop = document.getElementById('shipping-partner-modal-backdrop');
      var indexStr = backdrop ? backdrop.dataset.index : '';
      var nameInput = document.getElementById('partner-name');
      var webhookInput = document.getElementById('partner-webhook');
      var apiKeyInput = document.getElementById('partner-api-key');
      var slaInput = document.getElementById('partner-sla');
      var successInput = document.getElementById('partner-success');
      var statusSelect = document.getElementById('partner-status');
      
      if (!nameInput || !webhookInput || !apiKeyInput || !slaInput || !successInput || !statusSelect) {
        alert('Có lỗi xảy ra. Vui lòng làm mới trang và thử lại.');
        return;
      }

      var data = {
        name: nameInput.value || '',
        webhook: webhookInput.value || '',
        apiKeyMasked: apiKeyInput.value || '••••••••••••••••',
        sla: slaInput.value || '',
        successRate: successInput.value ? parseFloat(successInput.value) : 0,
        status: statusSelect.value || 'active'
      };

      if (!data.name || data.name.trim() === '') {
        alert('Vui lòng nhập tên đối tác');
        return;
      }

      if (indexStr) {
        var idx = parseInt(indexStr, 10);
        if (!isNaN(idx) && shippingPartners[idx]) {
          data.fees = shippingPartners[idx].fees || [];
          data.id = shippingPartners[idx].id;
          shippingPartners[idx] = data;
        }
      } else {
        data.id = Date.now();
        data.fees = [];
        shippingPartners.push(data);
      }

      saveShippingPartners();
      renderShippingPartners();
      closePartnerModal();
      alert('Đã lưu đối tác vận chuyển thành công!');
    });
  }

  var feeForm = document.getElementById('shipping-fee-form');
  if (feeForm) {
    feeForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var backdrop = document.getElementById('shipping-fee-modal-backdrop');
      if (!backdrop) return;
      var partnerIndexStr = backdrop.dataset.partnerIndex;
      var feeIndexStr = backdrop.dataset.feeIndex;
      var partnerIndex = partnerIndexStr ? parseInt(partnerIndexStr, 10) : NaN;
      if (isNaN(partnerIndex) || !shippingPartners[partnerIndex]) return;

      var regionInput = document.getElementById('fee-region');
      var baseInput = document.getElementById('fee-base');
      var extraInput = document.getElementById('fee-extra');
      if (!regionInput || !baseInput || !extraInput) return;

      var fee = {
        region: regionInput.value || '',
        baseFee: baseInput.value || '',
        extraFee: extraInput.value || ''
      };

      if (!fee.region) {
        alert('Vui lòng nhập khu vực');
        return;
      }

      var p = shippingPartners[partnerIndex];
      if (!Array.isArray(p.fees)) p.fees = [];

      if (feeIndexStr) {
        var fIdx = parseInt(feeIndexStr, 10);
        if (!isNaN(fIdx) && p.fees[fIdx]) {
          fee.id = p.fees[fIdx].id;
          p.fees[fIdx] = fee;
        }
      } else {
        fee.id = Date.now();
        p.fees.push(fee);
      }

      saveShippingPartners();
      renderShippingPartners();
      closeFeeModal();
      alert('Đã lưu bảng phí vận chuyển thành công!');
    });
  }

  // Đăng ký click outside để đóng modal
  var partnerBackdrop = document.getElementById('shipping-partner-modal-backdrop');
  if (partnerBackdrop) {
    partnerBackdrop.addEventListener('click', function (event) {
      if (event.target === partnerBackdrop) {
        closePartnerModal();
      }
    });
  }

  var feeBackdrop = document.getElementById('shipping-fee-modal-backdrop');
  if (feeBackdrop) {
    feeBackdrop.addEventListener('click', function (event) {
      if (event.target === feeBackdrop) {
        closeFeeModal();
      }
    });
  }

  renderShippingPartners();
});
