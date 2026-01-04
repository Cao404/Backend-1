// Khuyến mãi & Voucher functionality
document.addEventListener("DOMContentLoaded", () => {
  const voucherModal = document.getElementById("voucherModal");
  const voucherForm = document.getElementById("voucherForm");
  const btnCreateVoucher = document.getElementById("btnCreateVoucher");
  const closeVoucherModal = document.getElementById("closeVoucherModal");
  const cancelVoucherBtn = document.getElementById("cancelVoucherBtn");
  const discountType = document.getElementById("discountType");
  const discountValue = document.getElementById("discountValue");
  const maxDiscount = document.getElementById("maxDiscount");
  const voucherTable = document.querySelector("table tbody");
  const voucherSearchInput = document.getElementById("voucherSearchInput");
  
  // ========== TABS & SECTIONS ==========
  const tabButtons = document.querySelectorAll(".tab-btn");
  const voucherSection = document.getElementById("voucherSection");
  const campaignSection = document.getElementById("campaignSection");
  let currentFilterStatus = ""; // "" = Tất cả, "active", "pending", "expired"
  let currentSearchTerm = ""; // Từ khóa tìm kiếm
  
  // ========== FILTER DROPDOWN ==========
  const statusFilterBtn = document.getElementById("statusFilterBtn");
  const statusFilterText = document.getElementById("statusFilterText");
  const statusFilterDropdown = document.getElementById("statusFilterDropdown");
  const filterOptions = document.querySelectorAll("#statusFilterDropdown .filter-option");
  
  // ========== PHÂN TRANG ==========
  const ITEMS_PER_PAGE = 10;
  let currentPage = 1;
  const paginationContainer = document.getElementById("paginationContainer");
  const paginationInfo = document.getElementById("paginationInfo");
  const prevPageBtn = document.getElementById("prevPageBtn");
  const nextPageBtn = document.getElementById("nextPageBtn");
  const paginationNumbers = document.getElementById("paginationNumbers");

  // ========== MỞ/ĐÓNG MODAL ==========
  if (btnCreateVoucher) {
    btnCreateVoucher.addEventListener("click", () => {
      voucherModal.style.display = "flex";
      // Reset form
      voucherForm.reset();
      // Reset edit mode
      voucherForm.dataset.editingCode = "";
      // Set default values
      discountType.value = "percent";
      updateDiscountPlaceholder();
      // Set min date to today
      const today = new Date().toISOString().split('T')[0];
      document.getElementById("startDate").setAttribute("min", today);
      document.getElementById("endDate").setAttribute("min", today);
      // Reset modal title và button
      const modalTitle = voucherModal.querySelector("h2");
      const submitBtn = voucherForm.querySelector('button[type="submit"]');
      if (modalTitle) modalTitle.textContent = "Tạo voucher mới";
      if (submitBtn) submitBtn.textContent = "Tạo voucher";
    });
  }

  [closeVoucherModal, cancelVoucherBtn].forEach(btn => {
    if (btn) {
      btn.addEventListener("click", () => {
        voucherModal.style.display = "none";
        // Reset form về trạng thái tạo mới
        voucherForm.reset();
        voucherForm.dataset.editingCode = "";
        const modalTitle = voucherModal.querySelector("h2");
        const submitBtn = voucherForm.querySelector('button[type="submit"]');
        if (modalTitle) modalTitle.textContent = "Tạo voucher mới";
        if (submitBtn) submitBtn.textContent = "Tạo voucher";
      });
    }
  });

  // Đóng modal khi click bên ngoài
  if (voucherModal) {
    voucherModal.addEventListener("click", (e) => {
      if (e.target === voucherModal) {
        voucherModal.style.display = "none";
        // Reset form về trạng thái tạo mới
        voucherForm.reset();
        voucherForm.dataset.editingCode = "";
        const modalTitle = voucherModal.querySelector("h2");
        const submitBtn = voucherForm.querySelector('button[type="submit"]');
        if (modalTitle) modalTitle.textContent = "Tạo voucher mới";
        if (submitBtn) submitBtn.textContent = "Tạo voucher";
      }
    });
  }

  // ========== CẬP NHẬT PLACEHOLDER KHI ĐỔI LOẠI GIẢM GIÁ ==========
  function updateDiscountPlaceholder() {
    const type = discountType.value;
    if (type === "percent") {
      discountValue.placeholder = "50";
      discountValue.setAttribute("max", "100");
    } else if (type === "amount") {
      discountValue.placeholder = "200000";
      discountValue.removeAttribute("max");
    } else if (type === "freeship") {
      discountValue.placeholder = "50000";
      discountValue.removeAttribute("max");
    }
  }

  if (discountType) {
    discountType.addEventListener("change", updateDiscountPlaceholder);
  }

  // ========== XỬ LÝ FORM SUBMIT ==========
  if (voucherForm) {
    voucherForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const formData = new FormData(voucherForm);
      const editingCode = voucherForm.dataset.editingCode;

      const voucher = {
        code: formData.get("voucherCode").toUpperCase().trim(),
        name: formData.get("voucherName").trim(),
        discountType: formData.get("discountType"),
        discountValue: parseFloat(formData.get("discountValue")),
        maxDiscount: formData.get("maxDiscount") ? parseFloat(formData.get("maxDiscount")) : null,
        minOrder: formData.get("minOrder") ? parseFloat(formData.get("minOrder")) : 0,
        usageLimit: formData.get("usageLimit") ? parseInt(formData.get("usageLimit")) : null,
        startDate: formData.get("startDate"),
        endDate: formData.get("endDate"),
        applyTo: formData.get("applyTo"),
        used: 0,
        status: "active",
        createdAt: new Date().toISOString()
      };

      // Validate
      if (!voucher.code || !voucher.name) {
        alert("Vui lòng điền đầy đủ thông tin bắt buộc!");
        return;
      }

      if (voucher.startDate > voucher.endDate) {
        alert("Ngày kết thúc phải sau ngày bắt đầu!");
        return;
      }

      if (editingCode) {
        // EDIT MODE
        const vouchers = getVouchersFromStorage();
        const existingVoucher = vouchers.find(v => v.code === editingCode);
        
        if (existingVoucher) {
          // Giữ lại used và createdAt
          voucher.used = existingVoucher.used;
          voucher.createdAt = existingVoucher.createdAt;
        }

        // Kiểm tra mã mới có trùng với voucher khác không
        if (voucher.code !== editingCode) {
          const existingVouchers = getVouchersFromStorage();
          if (existingVouchers.some(v => v.code === voucher.code && v.code !== editingCode)) {
            alert("Mã voucher này đã tồn tại! Vui lòng chọn mã khác.");
            return;
          }
        }

        // Xóa row cũ
        const oldRow = document.querySelector(`tr[data-voucher-code="${editingCode}"]`);
        if (oldRow) {
          oldRow.remove();
        }

        // Xóa khỏi storage
        let vouchersList = getVouchersFromStorage();
        vouchersList = vouchersList.filter(v => v.code !== editingCode);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(vouchersList));

        // Thêm voucher mới (đã cập nhật)
        addVoucherToTable(voucher);
        saveVoucherToStorage(voucher);

        // Reset form state
        voucherForm.dataset.editingCode = "";
        const modalTitle = voucherModal.querySelector("h2");
        const submitBtn = voucherForm.querySelector('button[type="submit"]');
        if (modalTitle) modalTitle.textContent = "Tạo voucher mới";
        if (submitBtn) submitBtn.textContent = "Tạo voucher";
        
        // Cập nhật phân trang
        updatePagination();

        // Cập nhật phân trang
        updatePagination();

        alert(`Đã cập nhật voucher ${voucher.code} thành công!`);
      } else {
        // CREATE MODE
        // Kiểm tra mã voucher đã tồn tại chưa
        const existingVouchers = getVouchersFromStorage();
        if (existingVouchers.some(v => v.code === voucher.code)) {
          alert("Mã voucher này đã tồn tại! Vui lòng chọn mã khác.");
          return;
        }

        // Thêm voucher vào bảng
        addVoucherToTable(voucher);

        // Lưu vào localStorage
        saveVoucherToStorage(voucher);

        alert(`Đã tạo voucher ${voucher.code} thành công!`);
      }

      // Cập nhật KPI
      updateVoucherKPIs();
      
      // Cập nhật phân trang
      updatePagination();

      // Đóng modal
      voucherModal.style.display = "none";

      // Reset form
      voucherForm.reset();
    });
  }

  // ========== THÊM VOUCHER VÀO BẢNG ==========
  function addVoucherToTable(voucher) {
    if (!voucherTable) return;

    // Format giá trị giảm
    let discountDisplay = "";
    let maxDiscountDisplay = "";
    
    if (voucher.discountType === "percent") {
      discountDisplay = `${voucher.discountValue}%`;
      maxDiscountDisplay = voucher.maxDiscount ? `Tối đa: ${formatCurrency(voucher.maxDiscount)}` : "";
    } else if (voucher.discountType === "amount") {
      discountDisplay = formatCurrency(voucher.discountValue);
      maxDiscountDisplay = voucher.maxDiscount ? `Tối đa: ${formatCurrency(voucher.maxDiscount)}` : "";
    } else if (voucher.discountType === "freeship") {
      discountDisplay = "Free Ship";
      maxDiscountDisplay = voucher.maxDiscount ? `Tối đa: ${formatCurrency(voucher.maxDiscount)}` : "";
    }

    // Format điều kiện
    const minOrderDisplay = voucher.minOrder > 0 ? `Đơn từ ${formatCurrency(voucher.minOrder)}` : "Không có";
    const applyToDisplay = voucher.applyTo === "all" ? "Tất Cả" : 
                           voucher.applyTo === "category" ? "Theo Danh Mục" : "Theo Sản Phẩm";

    // Format thời hạn
    const startDateFormatted = formatDateForDisplay(voucher.startDate);
    const endDateFormatted = formatDateForDisplay(voucher.endDate);
    const dateRange = `${startDateFormatted} - ${endDateFormatted}`;

    // Tính % sử dụng
    const usagePercent = voucher.usageLimit ? (voucher.used / voucher.usageLimit * 100) : 0;
    const usageDisplay = voucher.usageLimit ? `${voucher.used}/${voucher.usageLimit}` : `${voucher.used}/∞`;

    // Trạng thái
    const now = new Date();
    const startDate = new Date(voucher.startDate);
    const endDate = new Date(voucher.endDate);
    let statusClass = "success";
    let statusText = "Đang hoạt động";
    
    if (now < startDate) {
      statusClass = "pending";
      statusText = "Chưa bắt đầu";
    } else if (now > endDate) {
      statusClass = "cancelled";
      statusText = "Đã hết hạn";
    }

    // Tạo row mới
    const tr = document.createElement("tr");
    tr.dataset.voucherCode = voucher.code;
    tr.innerHTML = `
      <td>
        <div>
          <div class="product-name">${voucher.code}</div>
          <div class="product-meta">${voucher.name}</div>
        </div>
      </td>
      <td>
        <div>
          <div style="font-weight: 600;">${discountDisplay}</div>
          ${maxDiscountDisplay ? `<div class="product-meta">${maxDiscountDisplay}</div>` : ''}
        </div>
      </td>
      <td>
        <div>
          <div>${minOrderDisplay}</div>
          <div class="product-meta">${applyToDisplay}</div>
        </div>
      </td>
      <td>
        <div style="display: flex; flex-direction: column; gap: 4px;">
          <div style="width: 100px; height: 8px; background: var(--bg); border-radius: 4px; overflow: hidden;">
            <div style="width: ${Math.min(usagePercent, 100)}%; height: 100%; background: var(--accent);"></div>
          </div>
          <span style="font-size: 12px;">${usageDisplay}</span>
        </div>
      </td>
      <td>${dateRange}</td>
      <td><span class="status ${statusClass}">${statusText}</span></td>
      <td>
        <div style="display: flex; align-items: center; gap: 8px;">
          <label class="toggle-switch">
            <input type="checkbox" ${voucher.status === "active" ? "checked" : ""} data-voucher-code="${voucher.code}" />
            <span class="slider"></span>
          </label>
          <div class="action-menu">
            <button class="action-toggle">⋯</button>
            <div class="action-dropdown">
              <button class="action-item" data-action="edit" data-voucher-code="${voucher.code}">✏️ Chỉnh sửa</button>
              <button class="action-item" data-action="duplicate" data-voucher-code="${voucher.code}">📑 Nhân bản</button>
              <button class="action-item danger" data-action="delete" data-voucher-code="${voucher.code}">🗑 Xóa</button>
            </div>
          </div>
        </div>
      </td>
    `;

    // Thêm vào đầu bảng
    voucherTable.insertBefore(tr, voucherTable.firstChild);
  }

  // ========== LOCALSTORAGE ==========
  const STORAGE_KEY = "vouchers";
  const DELETED_VOUCHERS_KEY = "deleted_vouchers";

  function saveVoucherToStorage(voucher) {
    try {
      let vouchers = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      vouchers.push(voucher);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(vouchers));
    } catch (e) {
      console.error("Error saving voucher:", e);
    }
  }

  function getVouchersFromStorage() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    } catch (e) {
      console.error("Error getting vouchers:", e);
      return [];
    }
  }

  // ========== HELPER FUNCTIONS ==========
  function formatCurrency(amount) {
    if (!amount) return "0₫";
    return amount.toLocaleString('vi-VN') + '₫';
  }

  function formatDate(dateString) {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
  }

  function formatDateForDisplay(dateString) {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
  }

  // ========== CẬP NHẬT KPI ==========
  function updateVoucherKPIs() {
    const allVouchers = getVouchersFromStorage();
    const deletedVouchers = JSON.parse(localStorage.getItem(DELETED_VOUCHERS_KEY) || "[]");
    
    // Lọc bỏ các voucher đã bị xóa
    const activeVouchers = allVouchers.filter(v => !deletedVouchers.includes(v.code));
    
    const totalVouchers = activeVouchers.length;
    let activeCount = 0;
    let totalUsed = 0;
    let totalDiscount = 0; // Tổng tiền đã giảm (tính bằng VNĐ)
    const now = new Date();

    activeVouchers.forEach(voucher => {
      // Đếm lượt sử dụng
      totalUsed += voucher.used || 0;
      
      // Kiểm tra trạng thái hoạt động
      const startDate = new Date(voucher.startDate);
      const endDate = new Date(voucher.endDate);
      const isInDateRange = now >= startDate && now <= endDate;
      const isActiveStatus = voucher.status === "active";
      
      if (isActiveStatus && isInDateRange) {
        activeCount++;
      }
      
      // Tính tổng tiền đã giảm
      if (voucher.used && voucher.used > 0) {
        if (voucher.discountType === "percent") {
          // Giảm theo % - ước tính dựa trên giá trị trung bình đơn hàng
          // Giả sử giá trị trung bình đơn hàng là 1,000,000 VNĐ
          const avgOrderValue = 1000000;
          const discountPerOrder = (avgOrderValue * voucher.discountValue / 100);
          const maxDiscount = voucher.maxDiscount || discountPerOrder;
          const actualDiscountPerOrder = Math.min(discountPerOrder, maxDiscount);
          totalDiscount += actualDiscountPerOrder * voucher.used;
        } else if (voucher.discountType === "amount") {
          // Giảm theo số tiền cố định
          const discountAmount = voucher.discountValue || 0;
          const maxDiscount = voucher.maxDiscount || discountAmount;
          const actualDiscount = Math.min(discountAmount, maxDiscount);
          totalDiscount += actualDiscount * voucher.used;
        } else if (voucher.discountType === "freeship") {
          // Miễn phí vận chuyển
          const freeshipValue = voucher.maxDiscount || 50000;
          totalDiscount += freeshipValue * voucher.used;
        }
      }
    });

    // Format tổng tiền đã giảm
    let totalDiscountDisplay = "";
    if (totalDiscount >= 1000000000) {
      totalDiscountDisplay = (totalDiscount / 1000000000).toFixed(1) + "B";
    } else if (totalDiscount >= 1000000) {
      totalDiscountDisplay = (totalDiscount / 1000000).toFixed(1) + "M";
    } else if (totalDiscount >= 1000) {
      totalDiscountDisplay = (totalDiscount / 1000).toFixed(1) + "K";
    } else {
      totalDiscountDisplay = totalDiscount.toString();
    }

    // Cập nhật KPI cards
    const kpiCards = document.querySelectorAll(".kpi-value");
    if (kpiCards.length >= 4) {
      kpiCards[0].textContent = totalVouchers;
      kpiCards[1].textContent = activeCount;
      kpiCards[2].textContent = totalUsed;
      kpiCards[3].textContent = totalDiscountDisplay;
    }
  }

  // ========== KHỞI TẠO VOUCHER TỪ HTML ==========
  function initializeVouchersFromHTML() {
    const rows = document.querySelectorAll("table tbody tr[data-voucher-code]");
    const existingVouchers = getVouchersFromStorage();
    const existingCodes = existingVouchers.map(v => v.code);

    rows.forEach(row => {
      const voucherCode = row.getAttribute("data-voucher-code");
      
      // Nếu voucher đã bị xóa, ẩn row và không tạo lại
      if (isVoucherDeleted(voucherCode)) {
        row.style.display = "none";
        return;
      }
      
      // Nếu voucher chưa có trong localStorage, tạo và lưu
      if (!existingCodes.includes(voucherCode)) {
        const voucher = parseVoucherFromRow(row);
        if (voucher) {
          saveVoucherToStorage(voucher);
        }
      } else {
        // Nếu voucher đã có trong localStorage, cập nhật toggle switch và status text từ localStorage
        const existingVoucher = existingVouchers.find(v => v.code === voucherCode);
        if (existingVoucher) {
          const toggle = row.querySelector('input[type="checkbox"][data-voucher-code]');
          if (toggle) {
            toggle.checked = existingVoucher.status === "active";
          }
          
          // Cập nhật status text
          const statusElement = row.querySelector(".status");
          if (statusElement) {
            if (existingVoucher.status === "active") {
              statusElement.textContent = "Đang hoạt động";
              statusElement.className = "status success";
            } else {
              statusElement.textContent = "Đã tắt";
              statusElement.className = "status cancelled";
            }
          }
        }
      }
    });
  }

  // ========== PARSE VOUCHER TỪ ROW HTML ==========
  function parseVoucherFromRow(row) {
    const cells = row.querySelectorAll("td");
    if (cells.length < 6) return null;

    const codeCell = cells[0];
    const discountCell = cells[1];
    const conditionCell = cells[2];
    const usageCell = cells[3];
    const dateCell = cells[4];
    const statusCell = cells[5];

    const code = codeCell.querySelector(".product-name")?.textContent.trim() || row.getAttribute("data-voucher-code");
    const name = codeCell.querySelector(".product-meta")?.textContent.trim() || "";
    const discountText = discountCell.querySelector("div")?.textContent.trim() || "";
    const maxDiscountText = discountCell.querySelector(".product-meta")?.textContent.trim() || "";
    const minOrderText = conditionCell.querySelector("div")?.textContent.trim() || "";
    const applyToText = conditionCell.querySelector(".product-meta")?.textContent.trim() || "";
    const dateRange = dateCell.textContent.trim();
    const usageText = usageCell.querySelector("span")?.textContent.trim() || "0/0";
    const toggleChecked = row.querySelector('input[type="checkbox"]')?.checked || false;

    // Parse dates
    const [startDateStr, endDateStr] = dateRange.split(" - ");
    
    // Parse discount type và value
    let discountType = "percent";
    let discountValue = 0;
    if (discountText.includes("%")) {
      discountType = "percent";
      discountValue = parseFloat(discountText.replace("%", ""));
    } else if (discountText.includes("Free Ship") || discountText.includes("Free")) {
      discountType = "freeship";
      discountValue = parseFloat(maxDiscountText.replace(/[^\d]/g, "")) || 50000;
    } else {
      discountType = "amount";
      discountValue = parseFloat(discountText.replace(/[^\d]/g, ""));
    }
    
    // Parse max discount
    const maxDiscount = maxDiscountText ? parseFloat(maxDiscountText.replace(/[^\d]/g, "")) : null;
    
    // Parse min order
    const minOrder = minOrderText.includes("Đơn từ") ? parseFloat(minOrderText.replace(/[^\d]/g, "")) : 0;
    
    // Parse usage
    const [used, limit] = usageText.split("/").map(s => parseInt(s) || 0);
    
    // Parse apply to
    let applyTo = "all";
    if (applyToText.includes("Danh Mục")) applyTo = "category";
    else if (applyToText.includes("Sản Phẩm")) applyTo = "product";

    return {
      code: code,
      name: name,
      discountType: discountType,
      discountValue: discountValue,
      maxDiscount: maxDiscount,
      minOrder: minOrder,
      usageLimit: limit > 0 ? limit : null,
      startDate: startDateStr,
      endDate: endDateStr,
      applyTo: applyTo,
      used: used,
      status: toggleChecked ? "active" : "inactive",
      createdAt: new Date().toISOString()
    };
  }

  // ========== KHÔI PHỤC VOUCHER TỪ LOCALSTORAGE ==========
  function loadVouchersFromStorage() {
    const vouchers = getVouchersFromStorage();
    vouchers.forEach(voucher => {
      // Kiểm tra xem voucher đã có trong bảng chưa
      const existingRow = document.querySelector(`tr[data-voucher-code="${voucher.code}"]`);
      if (!existingRow) {
        addVoucherToTable(voucher);
      } else {
        // Cập nhật toggle switch và status text
        const toggle = existingRow.querySelector('input[type="checkbox"][data-voucher-code]');
        if (toggle) {
          toggle.checked = voucher.status === "active";
        }
        
        // Cập nhật status text
        const statusElement = existingRow.querySelector(".status");
        if (statusElement) {
          if (voucher.status === "active") {
            statusElement.textContent = "Đang hoạt động";
            statusElement.className = "status success";
          } else {
            statusElement.textContent = "Đã tắt";
            statusElement.className = "status cancelled";
          }
        }
      }
    });
    updateVoucherKPIs();
  }

  // ========== XỬ LÝ ACTION MENU ==========
  document.addEventListener("click", (e) => {
    const item = e.target.closest(".action-item");
    if (!item) return;

    const action = item.getAttribute("data-action");
    const voucherCode = item.getAttribute("data-voucher-code");
    
    if (!action || !voucherCode) return;

    e.stopPropagation();
    e.preventDefault();

    // Đóng menu
    const menu = item.closest(".action-menu");
    if (menu) {
      menu.classList.remove("open");
    }

    // Xử lý các action
    switch (action) {
      case "edit":
        editVoucher(voucherCode);
        break;
      case "duplicate":
        duplicateVoucher(voucherCode);
        break;
      case "delete":
        deleteVoucher(voucherCode);
        break;
    }
  });

  // ========== CHỈNH SỬA VOUCHER ==========
  function editVoucher(voucherCode) {
    const vouchers = getVouchersFromStorage();
    let voucher = vouchers.find(v => v.code === voucherCode);
    
    if (!voucher) {
      // Nếu không tìm thấy trong storage, lấy từ bảng HTML
      const row = document.querySelector(`tr[data-voucher-code="${voucherCode}"]`);
      if (!row) {
        alert("Không tìm thấy voucher!");
        return;
      }
      
      // Parse dữ liệu từ row
      const cells = row.querySelectorAll("td");
      const codeCell = cells[0];
      const discountCell = cells[1];
      const conditionCell = cells[2];
      const usageCell = cells[3];
      const dateCell = cells[4];
      
      const code = codeCell.querySelector(".product-name")?.textContent.trim() || voucherCode;
      const name = codeCell.querySelector(".product-meta")?.textContent.trim() || "";
      const discountText = discountCell.querySelector("div")?.textContent.trim() || "";
      const maxDiscountText = discountCell.querySelector(".product-meta")?.textContent.trim() || "";
      const minOrderText = conditionCell.querySelector("div")?.textContent.trim() || "";
      const applyToText = conditionCell.querySelector(".product-meta")?.textContent.trim() || "";
      const dateRange = dateCell.textContent.trim();
      const usageText = usageCell.querySelector("span")?.textContent.trim() || "0/0";
      
      // Parse dates
      const [startDateStr, endDateStr] = dateRange.split(" - ");
      
      // Parse discount type và value
      let discountType = "percent";
      let discountValue = 0;
      if (discountText.includes("%")) {
        discountType = "percent";
        discountValue = parseFloat(discountText.replace("%", ""));
      } else if (discountText.includes("Free Ship") || discountText.includes("Free")) {
        discountType = "freeship";
        discountValue = 0;
      } else {
        discountType = "amount";
        discountValue = parseFloat(discountText.replace(/[^\d]/g, ""));
      }
      
      // Parse max discount
      const maxDiscount = maxDiscountText ? parseFloat(maxDiscountText.replace(/[^\d]/g, "")) : null;
      
      // Parse min order
      const minOrder = minOrderText.includes("Đơn từ") ? parseFloat(minOrderText.replace(/[^\d]/g, "")) : 0;
      
      // Parse usage
      const [used, limit] = usageText.split("/").map(s => parseInt(s) || 0);
      
      // Parse apply to
      let applyTo = "all";
      if (applyToText.includes("Danh Mục")) applyTo = "category";
      else if (applyToText.includes("Sản Phẩm")) applyTo = "product";
      
      voucher = {
        code: code,
        name: name,
        discountType: discountType,
        discountValue: discountValue,
        maxDiscount: maxDiscount,
        minOrder: minOrder,
        usageLimit: limit > 0 ? limit : null,
        startDate: startDateStr,
        endDate: endDateStr,
        applyTo: applyTo,
        used: used,
        status: "active",
        createdAt: new Date().toISOString()
      };
    }

    // Điền form với dữ liệu voucher
    document.getElementById("voucherCode").value = voucher.code;
    document.getElementById("voucherName").value = voucher.name;
    document.getElementById("discountType").value = voucher.discountType;
    document.getElementById("discountValue").value = voucher.discountValue;
    document.getElementById("maxDiscount").value = voucher.maxDiscount || "";
    document.getElementById("minOrder").value = voucher.minOrder || "";
    document.getElementById("usageLimit").value = voucher.usageLimit || "";
    document.getElementById("startDate").value = voucher.startDate;
    document.getElementById("endDate").value = voucher.endDate;
    document.getElementById("applyTo").value = voucher.applyTo;

    updateDiscountPlaceholder();

    // Đổi title modal và button
    const modalTitle = voucherModal.querySelector("h2");
    const submitBtn = voucherForm.querySelector('button[type="submit"]');
    if (modalTitle) modalTitle.textContent = "Chỉnh sửa voucher";
    if (submitBtn) submitBtn.textContent = "Cập nhật voucher";

    // Lưu voucher code đang edit
    voucherForm.dataset.editingCode = voucherCode;

    // Mở modal
    voucherModal.style.display = "flex";
  }

  // ========== NHÂN BẢN VOUCHER ==========
  function duplicateVoucher(voucherCode) {
    const vouchers = getVouchersFromStorage();
    const voucher = vouchers.find(v => v.code === voucherCode);
    
    if (!voucher) {
      alert("Không tìm thấy voucher để nhân bản!");
      return;
    }

    // Tạo voucher mới từ voucher cũ
    const newVoucher = {
      ...voucher,
      code: voucher.code + "_COPY",
      name: voucher.name + " (Bản sao)",
      used: 0,
      status: "active",
      createdAt: new Date().toISOString()
    };

    // Kiểm tra mã mới có trùng không
    if (vouchers.some(v => v.code === newVoucher.code)) {
      newVoucher.code = voucher.code + "_COPY_" + Date.now();
    }

    // Thêm vào bảng
    addVoucherToTable(newVoucher);

    // Lưu vào localStorage
    saveVoucherToStorage(newVoucher);

    // Cập nhật KPI
    updateVoucherKPIs();
    
    // Cập nhật phân trang
    updatePagination();

    alert(`Đã nhân bản voucher ${voucher.code} thành công! Mã mới: ${newVoucher.code}`);
  }

  // ========== LƯU VOUCHER ĐÃ XÓA ==========
  function markVoucherAsDeleted(voucherCode) {
    try {
      let deletedVouchers = JSON.parse(localStorage.getItem(DELETED_VOUCHERS_KEY) || "[]");
      if (!deletedVouchers.includes(voucherCode)) {
        deletedVouchers.push(voucherCode);
        localStorage.setItem(DELETED_VOUCHERS_KEY, JSON.stringify(deletedVouchers));
      }
    } catch (e) {
      console.error("Error marking voucher as deleted:", e);
    }
  }

  // ========== KIỂM TRA VOUCHER ĐÃ BỊ XÓA ==========
  function isVoucherDeleted(voucherCode) {
    try {
      const deletedVouchers = JSON.parse(localStorage.getItem(DELETED_VOUCHERS_KEY) || "[]");
      return deletedVouchers.includes(voucherCode);
    } catch (e) {
      return false;
    }
  }

  // ========== XÓA VOUCHER ==========
  function deleteVoucher(voucherCode) {
    if (!confirm(`Bạn có chắc chắn muốn xóa voucher ${voucherCode}?\n\nHành động này không thể hoàn tác!`)) {
      return;
    }

    // Xóa row khỏi bảng
    const row = document.querySelector(`tr[data-voucher-code="${voucherCode}"]`);
    if (row) {
      row.remove();
    }

    // Xóa khỏi localStorage
    try {
      let vouchers = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      vouchers = vouchers.filter(v => v.code !== voucherCode);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(vouchers));
    } catch (e) {
      console.error("Error deleting voucher:", e);
    }

    // Đánh dấu voucher đã bị xóa để không tạo lại từ HTML
    markVoucherAsDeleted(voucherCode);

    // Cập nhật KPI
    updateVoucherKPIs();
    
    // Cập nhật phân trang
    updatePagination();

    alert(`Đã xóa voucher ${voucherCode} thành công!`);
  }


  // ========== XỬ LÝ TOGGLE SWITCH ==========
  document.addEventListener("change", (e) => {
    if (e.target.type === "checkbox" && e.target.hasAttribute("data-voucher-code")) {
      const voucherCode = e.target.getAttribute("data-voucher-code");
      const isActive = e.target.checked;
      const row = e.target.closest("tr");

      // Cập nhật trong localStorage
      try {
        let vouchers = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
        let voucher = vouchers.find(v => v.code === voucherCode);
        
        // Nếu voucher chưa có trong localStorage, tạo mới từ row hiện tại
        if (!voucher && row) {
          voucher = parseVoucherFromRow(row);
          if (voucher) {
            voucher.status = isActive ? "active" : "inactive";
            vouchers.push(voucher);
          }
        } else if (voucher) {
          voucher.status = isActive ? "active" : "inactive";
        }
        
        if (voucher) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(vouchers));
          
          // Cập nhật status text trong bảng
          if (row) {
            const statusElement = row.querySelector(".status");
            if (statusElement) {
              if (isActive) {
                statusElement.textContent = "Đang hoạt động";
                statusElement.className = "status success";
              } else {
                statusElement.textContent = "Đã tắt";
                statusElement.className = "status cancelled";
              }
            }
          }
        }
      } catch (err) {
        console.error("Error updating voucher status:", err);
      }

      // Cập nhật KPI
      updateVoucherKPIs();
    }
  });

  // ========== EVENT LISTENERS CHO PHÂN TRANG ==========
  if (prevPageBtn) {
    prevPageBtn.addEventListener("click", () => {
      if (currentPage > 1) {
        currentPage--;
        updatePagination();
      }
    });
  }
  
  if (nextPageBtn) {
    nextPageBtn.addEventListener("click", () => {
      // Tính toán lại totalPages dựa trên filter
      const allRows = Array.from(voucherTable.querySelectorAll("tr[data-voucher-code]")).filter(row => {
        if (row.style.display === "none" && isVoucherDeleted(row.getAttribute("data-voucher-code"))) {
          return false;
        }
        if (currentFilterStatus) {
          const statusElement = row.querySelector(".status");
          if (!statusElement) return false;
          const statusText = statusElement.textContent.trim();
          const statusClass = statusElement.className;
          if (currentFilterStatus === "active") {
            return statusText === "Đang hoạt động" || (statusClass.includes("success") && statusText.includes("hoạt động"));
          } else if (currentFilterStatus === "pending") {
            return statusText === "Chưa bắt đầu" || statusClass.includes("pending");
          } else if (currentFilterStatus === "expired") {
            return statusText === "Đã hết hạn" || statusClass.includes("cancelled");
          }
        }
        return true;
      });
      const totalPages = Math.ceil(allRows.length / ITEMS_PER_PAGE);
      if (currentPage < totalPages) {
        currentPage++;
        updatePagination();
      }
    });
  }

  // ========== XỬ LÝ TAB SWITCHING ==========
  tabButtons.forEach((btn, index) => {
    btn.addEventListener("click", () => {
      // Cập nhật active state
      tabButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      
      // Hiển thị section tương ứng
      if (index === 0) {
        // Tab Voucher
        if (voucherSection) voucherSection.style.display = "block";
        if (campaignSection) campaignSection.style.display = "none";
      } else {
        // Tab Chiến dịch
        if (voucherSection) voucherSection.style.display = "none";
        if (campaignSection) campaignSection.style.display = "block";
        // Load campaigns khi chuyển sang tab
        loadCampaigns();
        updateCampaignPagination();
      }
    });
  });

  // ========== XỬ LÝ FILTER DROPDOWN ==========
  if (statusFilterBtn && statusFilterDropdown) {
    // Mở/đóng dropdown
    statusFilterBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      statusFilterBtn.classList.toggle("open");
      statusFilterDropdown.classList.toggle("open");
    });

    // Đóng dropdown khi click bên ngoài
    document.addEventListener("click", (e) => {
      if (!statusFilterBtn.contains(e.target) && !statusFilterDropdown.contains(e.target)) {
        statusFilterBtn.classList.remove("open");
        statusFilterDropdown.classList.remove("open");
      }
    });

    // Xử lý chọn option
    filterOptions.forEach(option => {
      option.addEventListener("click", () => {
        const status = option.getAttribute("data-status");
        currentFilterStatus = status;
        
        // Cập nhật text hiển thị
        const optionText = option.textContent.replace("✓ ", "");
        statusFilterText.textContent = optionText.includes("Tất cả") ? "Tất cả" : optionText;
        
        // Cập nhật active state
        filterOptions.forEach(opt => {
          opt.classList.remove("active");
          opt.textContent = opt.textContent.replace("✓ ", "");
        });
        option.classList.add("active");
        option.textContent = "✓ " + optionText;
        
        // Đóng dropdown
        statusFilterBtn.classList.remove("open");
        statusFilterDropdown.classList.remove("open");
        
        // Reset về trang 1 và cập nhật filter
        currentPage = 1;
        updatePagination();
      });
    });
  }

  // ========== TÌM KIẾM VOUCHER ==========
  if (voucherSearchInput) {
    voucherSearchInput.addEventListener("input", (e) => {
      currentSearchTerm = e.target.value.toLowerCase().trim();
      currentPage = 1; // Reset về trang 1 khi tìm kiếm
      updatePagination();
    });
  }

  // ========== TÍNH TOÁN VÀ HIỂN THỊ PHÂN TRANG (CÓ HỖ TRỢ FILTER VÀ TÌM KIẾM) ==========
  function updatePagination() {
    // Lấy tất cả rows và filter theo trạng thái và tìm kiếm
    const allRows = Array.from(voucherTable.querySelectorAll("tr[data-voucher-code]")).filter(row => {
      // Bỏ qua các row đã bị xóa
      if (row.style.display === "none" && isVoucherDeleted(row.getAttribute("data-voucher-code"))) {
        return false;
      }
      
      // Tìm kiếm theo mã voucher và tên
      if (currentSearchTerm) {
        const voucherCode = row.getAttribute("data-voucher-code")?.toLowerCase() || "";
        const productName = row.querySelector(".product-name")?.textContent.toLowerCase() || "";
        const productMeta = row.querySelector(".product-meta")?.textContent.toLowerCase() || "";
        
        if (!voucherCode.includes(currentSearchTerm) && 
            !productName.includes(currentSearchTerm) && 
            !productMeta.includes(currentSearchTerm)) {
          return false;
        }
      }
      
      // Filter theo trạng thái nếu có
      if (currentFilterStatus) {
        const statusElement = row.querySelector(".status");
        if (!statusElement) return false;
        
        const statusText = statusElement.textContent.trim();
        const statusClass = statusElement.className;
        
        if (currentFilterStatus === "active") {
          return statusText === "Đang hoạt động" || (statusClass.includes("success") && statusText.includes("hoạt động"));
        } else if (currentFilterStatus === "pending") {
          return statusText === "Chưa bắt đầu" || statusClass.includes("pending");
        } else if (currentFilterStatus === "expired") {
          return statusText === "Đã hết hạn" || statusClass.includes("cancelled");
        }
      }
      
      return true;
    });
    
    const totalItems = allRows.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));
    
    // Ẩn/hiện pagination
    if (totalItems <= ITEMS_PER_PAGE) {
      paginationContainer.style.display = "none";
      // Hiển thị tất cả rows đã filter
      allRows.forEach(row => row.style.display = "");
      // Ẩn các rows không match filter
      Array.from(voucherTable.querySelectorAll("tr[data-voucher-code]")).forEach(row => {
        if (!allRows.includes(row)) {
          row.style.display = "none";
        }
      });
      return;
    }
    
    paginationContainer.style.display = "flex";
    
    // Đảm bảo currentPage hợp lệ
    if (currentPage > totalPages) {
      currentPage = totalPages;
    }
    if (currentPage < 1) {
      currentPage = 1;
    }
    
    // Tính toán range hiển thị
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, totalItems);
    
    // Cập nhật thông tin
    paginationInfo.textContent = `Hiển thị ${startIndex + 1}-${endIndex} trong tổng số ${totalItems} voucher`;
    
    // Ẩn/hiện rows
    allRows.forEach((row, index) => {
      if (index >= startIndex && index < endIndex) {
        row.style.display = "";
      } else {
        row.style.display = "none";
      }
    });
    
    // Ẩn các rows không match filter
    Array.from(voucherTable.querySelectorAll("tr[data-voucher-code]")).forEach(row => {
      if (!allRows.includes(row)) {
        row.style.display = "none";
      }
    });
    
    // Cập nhật nút Previous/Next
    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage === totalPages;
    
    // Tạo số trang
    paginationNumbers.innerHTML = "";
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      const pageBtn = document.createElement("button");
      pageBtn.className = "btn-sm";
      pageBtn.textContent = i;
      if (i === currentPage) {
        pageBtn.classList.add("active");
      }
      pageBtn.addEventListener("click", () => {
        currentPage = i;
        updatePagination();
      });
      paginationNumbers.appendChild(pageBtn);
    }
  }

  // ========== CHIẾN DỊCH FUNCTIONALITY ==========
  const campaignModal = document.getElementById("campaignModal");
  const campaignForm = document.getElementById("campaignForm");
  const btnCreateCampaign = document.getElementById("btnCreateCampaign");
  const btnCreateCampaignEmpty = document.getElementById("btnCreateCampaignEmpty");
  const closeCampaignModal = document.getElementById("closeCampaignModal");
  const cancelCampaignBtn = document.getElementById("cancelCampaignBtn");
  const campaignTableBody = document.getElementById("campaignTableBody");
  const campaignSearchInput = document.getElementById("campaignSearchInput");
  const campaignEmptyState = document.getElementById("campaignEmptyState");
  const campaignTableWrapper = document.getElementById("campaignTableWrapper");
  const CAMPAIGN_STORAGE_KEY = "campaigns";
  const CAMPAIGN_ITEMS_PER_PAGE = 10;
  let campaignCurrentPage = 1;
  const campaignPaginationContainer = document.getElementById("campaignPaginationContainer");
  const campaignPaginationInfo = document.getElementById("campaignPaginationInfo");
  const campaignPrevPageBtn = document.getElementById("campaignPrevPageBtn");
  const campaignNextPageBtn = document.getElementById("campaignNextPageBtn");
  const campaignPaginationNumbers = document.getElementById("campaignPaginationNumbers");

  // ========== MỞ/ĐÓNG MODAL CHIẾN DỊCH ==========
  [btnCreateCampaign, btnCreateCampaignEmpty].forEach(btn => {
    if (btn) {
      btn.addEventListener("click", () => {
        campaignModal.style.display = "flex";
        campaignForm.reset();
        campaignForm.dataset.editingId = "";
        const today = new Date().toISOString().split('T')[0];
        document.getElementById("campaignStartDate").setAttribute("min", today);
        document.getElementById("campaignEndDate").setAttribute("min", today);
        const modalTitle = campaignModal.querySelector("h2");
        const submitBtn = campaignForm.querySelector('button[type="submit"]');
        if (modalTitle) modalTitle.textContent = "Tạo chiến dịch mới";
        if (submitBtn) submitBtn.textContent = "Tạo chiến dịch";
      });
    }
  });

  [closeCampaignModal, cancelCampaignBtn].forEach(btn => {
    if (btn) {
      btn.addEventListener("click", () => {
        campaignModal.style.display = "none";
        campaignForm.reset();
        campaignForm.dataset.editingId = "";
        const modalTitle = campaignModal.querySelector("h2");
        const submitBtn = campaignForm.querySelector('button[type="submit"]');
        if (modalTitle) modalTitle.textContent = "Tạo chiến dịch mới";
        if (submitBtn) submitBtn.textContent = "Tạo chiến dịch";
      });
    }
  });

  if (campaignModal) {
    campaignModal.addEventListener("click", (e) => {
      if (e.target === campaignModal) {
        campaignModal.style.display = "none";
        campaignForm.reset();
        campaignForm.dataset.editingId = "";
        const modalTitle = campaignModal.querySelector("h2");
        const submitBtn = campaignForm.querySelector('button[type="submit"]');
        if (modalTitle) modalTitle.textContent = "Tạo chiến dịch mới";
        if (submitBtn) submitBtn.textContent = "Tạo chiến dịch";
      }
    });
  }

  // ========== XỬ LÝ FORM CHIẾN DỊCH ==========
  if (campaignForm) {
    campaignForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const formData = new FormData(campaignForm);
      const campaignName = formData.get("campaignName").trim();
      const campaignDescription = formData.get("campaignDescription").trim();
      const startDate = formData.get("startDate");
      const endDate = formData.get("endDate");
      const campaignStatus = formData.get("campaignStatus");

      // Validation
      if (!campaignName || !campaignDescription || !startDate || !endDate) {
        alert("Vui lòng điền đầy đủ thông tin!");
        return;
      }

      if (new Date(startDate) > new Date(endDate)) {
        alert("Ngày kết thúc phải sau ngày bắt đầu!");
        return;
      }

      const editingId = campaignForm.dataset.editingId;
      
      if (editingId) {
        // EDIT MODE
        const campaigns = getCampaignsFromStorage();
        const campaignIndex = campaigns.findIndex(c => c.id === editingId);
        if (campaignIndex !== -1) {
          campaigns[campaignIndex] = {
            ...campaigns[campaignIndex],
            name: campaignName,
            description: campaignDescription,
            startDate: startDate,
            endDate: endDate,
            status: campaignStatus,
            updatedAt: new Date().toISOString()
          };
          localStorage.setItem(CAMPAIGN_STORAGE_KEY, JSON.stringify(campaigns));
          campaignForm.dataset.editingId = "";
        }
        alert(`Đã cập nhật chiến dịch ${campaignName} thành công!`);
      } else {
        // CREATE MODE
        const campaign = {
          id: "campaign_" + Date.now(),
          name: campaignName,
          description: campaignDescription,
          startDate: startDate,
          endDate: endDate,
          status: campaignStatus,
          createdAt: new Date().toISOString()
        };

        saveCampaignToStorage(campaign);
        alert(`Đã tạo chiến dịch ${campaignName} thành công!`);
      }

      // Đóng modal và reset form
      campaignModal.style.display = "none";
      campaignForm.reset();
      campaignForm.dataset.editingId = "";

      // Reload campaigns
      loadCampaigns();
      updateCampaignPagination();
    });
  }

  // ========== LOCALSTORAGE CHO CHIẾN DỊCH ==========
  function getCampaignsFromStorage() {
    try {
      return JSON.parse(localStorage.getItem(CAMPAIGN_STORAGE_KEY) || "[]");
    } catch (e) {
      return [];
    }
  }

  function saveCampaignToStorage(campaign) {
    const campaigns = getCampaignsFromStorage();
    campaigns.push(campaign);
    localStorage.setItem(CAMPAIGN_STORAGE_KEY, JSON.stringify(campaigns));
  }

  // ========== HIỂN THỊ CHIẾN DỊCH ==========
  function loadCampaigns() {
    const campaigns = getCampaignsFromStorage();
    
    if (campaignTableBody) {
      campaignTableBody.innerHTML = "";
    }

    if (campaigns.length === 0) {
      if (campaignEmptyState) campaignEmptyState.style.display = "block";
      if (campaignTableWrapper) campaignTableWrapper.style.display = "none";
      if (campaignPaginationContainer) campaignPaginationContainer.style.display = "none";
      return;
    }

    if (campaignEmptyState) campaignEmptyState.style.display = "none";
    if (campaignTableWrapper) campaignTableWrapper.style.display = "block";

    campaigns.forEach(campaign => {
      addCampaignToTable(campaign);
    });
  }

  function addCampaignToTable(campaign) {
    if (!campaignTableBody) return;

    const tr = document.createElement("tr");
    tr.dataset.campaignId = campaign.id;

    // Tính trạng thái dựa trên ngày
    const now = new Date();
    const startDate = new Date(campaign.startDate);
    const endDate = new Date(campaign.endDate);
    let statusClass = "success";
    let statusText = "Đang hoạt động";
    
    if (now < startDate) {
      statusClass = "pending";
      statusText = "Chưa bắt đầu";
    } else if (now > endDate) {
      statusClass = "cancelled";
      statusText = "Đã hết hạn";
    } else if (campaign.status === "active") {
      statusClass = "success";
      statusText = "Đang hoạt động";
    } else if (campaign.status === "pending") {
      statusClass = "pending";
      statusText = "Chưa bắt đầu";
    } else if (campaign.status === "expired") {
      statusClass = "cancelled";
      statusText = "Đã hết hạn";
    }

    const dateRange = `${formatDateForDisplay(campaign.startDate)} - ${formatDateForDisplay(campaign.endDate)}`;

    tr.innerHTML = `
      <td>
        <div>
          <div class="product-name">${campaign.name}</div>
        </div>
      </td>
      <td>
        <div style="max-width: 300px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${campaign.description}">
          ${campaign.description}
        </div>
      </td>
      <td>${dateRange}</td>
      <td><span class="status ${statusClass}">${statusText}</span></td>
      <td>
        <div class="action-menu">
          <button class="action-toggle">⋯</button>
          <div class="action-dropdown">
            <button class="action-item" data-action="edit" data-campaign-id="${campaign.id}">✏️ Chỉnh sửa</button>
            <button class="action-item" data-action="duplicate" data-campaign-id="${campaign.id}">📑 Nhân bản</button>
            <button class="action-item danger" data-action="delete" data-campaign-id="${campaign.id}">🗑 Xóa</button>
          </div>
        </div>
      </td>
    `;

    campaignTableBody.appendChild(tr);
  }

  // ========== TÌM KIẾM CHIẾN DỊCH ==========
  if (campaignSearchInput) {
    campaignSearchInput.addEventListener("input", (e) => {
      const searchTerm = e.target.value.toLowerCase().trim();
      filterCampaigns(searchTerm);
    });
  }

  function filterCampaigns(searchTerm) {
    if (!campaignTableBody) return;
    
    const rows = campaignTableBody.querySelectorAll("tr[data-campaign-id]");
    
    rows.forEach(row => {
      const name = row.querySelector(".product-name")?.textContent.toLowerCase() || "";
      const description = row.querySelector("td:nth-child(2)")?.textContent.toLowerCase() || "";
      
      if (!searchTerm || name.includes(searchTerm) || description.includes(searchTerm)) {
        row.style.display = "";
      } else {
        row.style.display = "none";
      }
    });

    campaignCurrentPage = 1; // Reset về trang 1 khi tìm kiếm
    updateCampaignPagination();
  }

  // ========== PHÂN TRANG CHIẾN DỊCH ==========
  function updateCampaignPagination() {
    const allRows = Array.from(campaignTableBody.querySelectorAll("tr[data-campaign-id]")).filter(row => {
      return row.style.display !== "none";
    });
    const totalItems = allRows.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / CAMPAIGN_ITEMS_PER_PAGE));

    if (totalItems === 0) {
      if (campaignPaginationContainer) campaignPaginationContainer.style.display = "none";
      return;
    }

    if (totalItems <= CAMPAIGN_ITEMS_PER_PAGE) {
      if (campaignPaginationContainer) campaignPaginationContainer.style.display = "none";
      allRows.forEach(row => row.style.display = "");
      return;
    }

    if (campaignPaginationContainer) campaignPaginationContainer.style.display = "flex";

    if (campaignCurrentPage > totalPages) {
      campaignCurrentPage = totalPages;
    }
    if (campaignCurrentPage < 1) {
      campaignCurrentPage = 1;
    }

    const startIndex = (campaignCurrentPage - 1) * CAMPAIGN_ITEMS_PER_PAGE;
    const endIndex = Math.min(startIndex + CAMPAIGN_ITEMS_PER_PAGE, totalItems);

    if (campaignPaginationInfo) {
      campaignPaginationInfo.textContent = `Hiển thị ${startIndex + 1}-${endIndex} trong tổng số ${totalItems} chiến dịch`;
    }

    allRows.forEach((row, index) => {
      if (index >= startIndex && index < endIndex) {
        row.style.display = "";
      } else {
        row.style.display = "none";
      }
    });

    if (campaignPrevPageBtn) campaignPrevPageBtn.disabled = campaignCurrentPage === 1;
    if (campaignNextPageBtn) campaignNextPageBtn.disabled = campaignCurrentPage === totalPages;

    if (campaignPaginationNumbers) {
      campaignPaginationNumbers.innerHTML = "";
      const maxVisiblePages = 5;
      let startPage = Math.max(1, campaignCurrentPage - Math.floor(maxVisiblePages / 2));
      let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

      if (endPage - startPage < maxVisiblePages - 1) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
      }

      for (let i = startPage; i <= endPage; i++) {
        const pageBtn = document.createElement("button");
        pageBtn.className = "btn-sm";
        pageBtn.textContent = i;
        if (i === campaignCurrentPage) {
          pageBtn.classList.add("active");
        }
        pageBtn.addEventListener("click", () => {
          campaignCurrentPage = i;
          updateCampaignPagination();
        });
        campaignPaginationNumbers.appendChild(pageBtn);
      }
    }
  }

  if (campaignPrevPageBtn) {
    campaignPrevPageBtn.addEventListener("click", () => {
      if (campaignCurrentPage > 1) {
        campaignCurrentPage--;
        updateCampaignPagination();
      }
    });
  }

  if (campaignNextPageBtn) {
    campaignNextPageBtn.addEventListener("click", () => {
      const allRows = Array.from(campaignTableBody.querySelectorAll("tr[data-campaign-id]")).filter(row => {
        return row.style.display !== "none";
      });
      const totalPages = Math.ceil(allRows.length / CAMPAIGN_ITEMS_PER_PAGE);
      if (campaignCurrentPage < totalPages) {
        campaignCurrentPage++;
        updateCampaignPagination();
      }
    });
  }

  // ========== XỬ LÝ ACTION MENU CHO CHIẾN DỊCH ==========
  document.addEventListener("click", (e) => {
    const item = e.target.closest(".action-item[data-campaign-id]");
    if (!item) return;

    const action = item.getAttribute("data-action");
    const campaignId = item.getAttribute("data-campaign-id");

    if (!action || !campaignId) return;

    e.stopPropagation();
    e.preventDefault();

    const menu = item.closest(".action-menu");
    if (menu) {
      menu.classList.remove("open");
    }

    switch (action) {
      case "edit":
        editCampaign(campaignId);
        break;
      case "duplicate":
        duplicateCampaign(campaignId);
        break;
      case "delete":
        deleteCampaign(campaignId);
        break;
    }
  });

  function editCampaign(campaignId) {
    const campaigns = getCampaignsFromStorage();
    const campaign = campaigns.find(c => c.id === campaignId);

    if (!campaign) {
      alert("Không tìm thấy chiến dịch!");
      return;
    }

    document.getElementById("campaignName").value = campaign.name;
    document.getElementById("campaignDescription").value = campaign.description;
    document.getElementById("campaignStartDate").value = campaign.startDate;
    document.getElementById("campaignEndDate").value = campaign.endDate;
    document.getElementById("campaignStatus").value = campaign.status;

    const modalTitle = campaignModal.querySelector("h2");
    const submitBtn = campaignForm.querySelector('button[type="submit"]');
    if (modalTitle) modalTitle.textContent = "Chỉnh sửa chiến dịch";
    if (submitBtn) submitBtn.textContent = "Cập nhật chiến dịch";

    campaignForm.dataset.editingId = campaignId;
    campaignModal.style.display = "flex";
  }

  function duplicateCampaign(campaignId) {
    const campaigns = getCampaignsFromStorage();
    const campaign = campaigns.find(c => c.id === campaignId);

    if (!campaign) {
      alert("Không tìm thấy chiến dịch để nhân bản!");
      return;
    }

    const newCampaign = {
      ...campaign,
      id: "campaign_" + Date.now(),
      name: campaign.name + " (Bản sao)",
      createdAt: new Date().toISOString()
    };

    saveCampaignToStorage(newCampaign);
    loadCampaigns();
    updateCampaignPagination();
    alert(`Đã nhân bản chiến dịch ${campaign.name} thành công!`);
  }

  function deleteCampaign(campaignId) {
    if (!confirm("Bạn có chắc chắn muốn xóa chiến dịch này?\n\nHành động này không thể hoàn tác!")) {
      return;
    }

    const campaigns = getCampaignsFromStorage();
    const filtered = campaigns.filter(c => c.id !== campaignId);
    localStorage.setItem(CAMPAIGN_STORAGE_KEY, JSON.stringify(filtered));

    const row = document.querySelector(`tr[data-campaign-id="${campaignId}"]`);
    if (row) {
      row.remove();
    }

    updateCampaignPagination();
    loadCampaigns();
    alert("Đã xóa chiến dịch thành công!");
  }

  // Khởi tạo: Load từ storage trước để có trạng thái đã lưu, sau đó khởi tạo các voucher mới từ HTML
  loadVouchersFromStorage();
  initializeVouchersFromHTML();
  updateVoucherKPIs();
  updatePagination();
  
  // Load campaigns khi vào tab chiến dịch
  loadCampaigns();
  updateCampaignPagination();
});


