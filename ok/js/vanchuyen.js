// Vận chuyển functionality
document.addEventListener("DOMContentLoaded", () => {
  const shippingModal = document.getElementById("shippingModal");
  const shippingForm = document.getElementById("shippingForm");
  const btnCreateShipping = document.getElementById("btnCreateShipping");
  const btnCreateShippingEmpty = document.getElementById("btnCreateShippingEmpty");
  const closeShippingModal = document.getElementById("closeShippingModal");
  const cancelShippingBtn = document.getElementById("cancelShippingBtn");
  const shippingTableBody = document.getElementById("shippingTableBody");
  const shippingSearchInput = document.getElementById("shippingSearchInput");
  const shippingEmptyState = document.getElementById("shippingEmptyState");
  const shippingTableWrapper = document.querySelector(".table-wrapper");
  const SHIPPING_STORAGE_KEY = "shipping_methods";
  const SHIPPING_ITEMS_PER_PAGE = 10;
  let shippingCurrentPage = 1;
  const shippingPaginationContainer = document.getElementById("shippingPaginationContainer");
  const shippingPaginationInfo = document.getElementById("shippingPaginationInfo");
  const shippingPrevPageBtn = document.getElementById("shippingPrevPageBtn");
  const shippingNextPageBtn = document.getElementById("shippingNextPageBtn");
  const shippingPaginationNumbers = document.getElementById("shippingPaginationNumbers");
  const feeType = document.getElementById("feeType");
  const shippingFee = document.getElementById("shippingFee");

  // ========== MỞ/ĐÓNG MODAL ==========
  function openShippingModal() {
    if (!shippingModal) {
      console.error("Shipping modal not found!");
      return;
    }
    // Đảm bảo modal hiển thị đúng cách
    shippingModal.style.display = "flex";
    // Force reflow để đảm bảo CSS được áp dụng
    void shippingModal.offsetWidth;
    
    if (shippingForm) {
      shippingForm.reset();
      shippingForm.dataset.editingId = "";
    }
    const providerSelect = document.getElementById("shippingProvider");
    if (providerSelect) {
      providerSelect.value = "";
    }
    if (feeType) {
      feeType.value = "fixed";
      updateFeePlaceholder();
    }
    const modalTitle = shippingModal.querySelector("h2");
    const submitBtn = shippingForm ? shippingForm.querySelector('button[type="submit"]') : null;
    if (modalTitle) modalTitle.textContent = "Tạo phương thức vận chuyển mới";
    if (submitBtn) submitBtn.textContent = "Tạo phương thức";
  }

  if (btnCreateShipping) {
    btnCreateShipping.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      openShippingModal();
    });
  }

  if (btnCreateShippingEmpty) {
    btnCreateShippingEmpty.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      openShippingModal();
    });
  }

  [closeShippingModal, cancelShippingBtn].forEach(btn => {
    if (btn) {
      btn.addEventListener("click", () => {
        shippingModal.style.display = "none";
        if (shippingForm) {
          shippingForm.reset();
          shippingForm.dataset.editingId = "";
        }
        const providerSelect = document.getElementById("shippingProvider");
        if (providerSelect) {
          providerSelect.value = "";
        }
        const modalTitle = shippingModal.querySelector("h2");
        const submitBtn = shippingForm ? shippingForm.querySelector('button[type="submit"]') : null;
        if (modalTitle) modalTitle.textContent = "Tạo phương thức vận chuyển mới";
        if (submitBtn) submitBtn.textContent = "Tạo phương thức";
      });
    }
  });

  if (shippingModal) {
    shippingModal.addEventListener("click", (e) => {
      if (e.target === shippingModal) {
        shippingModal.style.display = "none";
        if (shippingForm) {
          shippingForm.reset();
          shippingForm.dataset.editingId = "";
        }
        const providerSelect = document.getElementById("shippingProvider");
        if (providerSelect) {
          providerSelect.value = "";
        }
        const modalTitle = shippingModal.querySelector("h2");
        const submitBtn = shippingForm ? shippingForm.querySelector('button[type="submit"]') : null;
        if (modalTitle) modalTitle.textContent = "Tạo phương thức vận chuyển mới";
        if (submitBtn) submitBtn.textContent = "Tạo phương thức";
      }
    });
  }

  // ========== CẬP NHẬT PLACEHOLDER PHÍ VẬN CHUYỂN ==========
  function updateFeePlaceholder() {
    if (!feeType || !shippingFee) return;
    
    const feeTypeValue = feeType.value;
    if (feeTypeValue === "free") {
      shippingFee.value = "0";
      shippingFee.disabled = true;
      shippingFee.required = false;
    } else {
      shippingFee.disabled = false;
      shippingFee.required = true;
      if (feeTypeValue === "fixed") {
        shippingFee.placeholder = "VD: 30000";
      } else if (feeTypeValue === "weight") {
        shippingFee.placeholder = "VD: 5000 (phí/kg)";
      } else if (feeTypeValue === "distance") {
        shippingFee.placeholder = "VD: 2000 (phí/km)";
      }
    }
  }

  if (feeType) {
    feeType.addEventListener("change", updateFeePlaceholder);
  }

  // ========== XỬ LÝ FORM ==========
  if (shippingForm) {
    shippingForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const formData = new FormData(shippingForm);
      const shippingProvider = formData.get("shippingProvider");
      const shippingName = formData.get("shippingName").trim();
      const shippingDescription = formData.get("shippingDescription").trim();
      const feeTypeValue = formData.get("feeType");
      const shippingFeeValue = parseFloat(formData.get("shippingFee")) || 0;
      const deliveryTime = parseInt(formData.get("deliveryTime")) || 1;
      const shippingArea = formData.get("shippingArea");
      const shippingStatus = formData.get("shippingStatus");

      // Validation
      if (!shippingProvider) {
        alert("Vui lòng chọn đơn vị vận chuyển!");
        return;
      }
      if (!shippingName || !shippingDescription) {
        alert("Vui lòng điền đầy đủ thông tin!");
        return;
      }

      if (feeTypeValue !== "free" && shippingFeeValue < 0) {
        alert("Phí vận chuyển không hợp lệ!");
        return;
      }

      if (deliveryTime < 1) {
        alert("Thời gian giao hàng phải lớn hơn 0!");
        return;
      }

      const editingId = shippingForm.dataset.editingId;
      
      if (editingId) {
        // EDIT MODE
        const methods = getShippingMethodsFromStorage();
        const methodIndex = methods.findIndex(m => m.id === editingId);
        if (methodIndex !== -1) {
          methods[methodIndex] = {
            ...methods[methodIndex],
            provider: shippingProvider,
            name: shippingName,
            description: shippingDescription,
            feeType: feeTypeValue,
            fee: feeTypeValue === "free" ? 0 : shippingFeeValue,
            deliveryTime: deliveryTime,
            area: shippingArea,
            status: shippingStatus,
            updatedAt: new Date().toISOString()
          };
          localStorage.setItem(SHIPPING_STORAGE_KEY, JSON.stringify(methods));
          shippingForm.dataset.editingId = "";
        }
        alert(`Đã cập nhật phương thức ${shippingName} thành công!`);
      } else {
        // CREATE MODE
        const shippingMethod = {
          id: "shipping_" + Date.now(),
          provider: shippingProvider,
          name: shippingName,
          description: shippingDescription,
          feeType: feeTypeValue,
          fee: feeTypeValue === "free" ? 0 : shippingFeeValue,
          deliveryTime: deliveryTime,
          area: shippingArea,
          status: shippingStatus,
          orders: 0, // Số đơn đã sử dụng
          revenue: 0, // Doanh thu từ phương thức này
          createdAt: new Date().toISOString()
        };

        saveShippingMethodToStorage(shippingMethod);
        alert(`Đã tạo phương thức ${shippingName} thành công!`);
      }

      // Đóng modal và reset form
      shippingModal.style.display = "none";
      if (shippingForm) {
        shippingForm.reset();
        shippingForm.dataset.editingId = "";
      }
      const providerSelect = document.getElementById("shippingProvider");
      if (providerSelect) {
        providerSelect.value = "";
      }

      // Reload và cập nhật
      loadShippingMethods();
      updateShippingPagination();
      updateShippingKPIs();
    });
  }

  // ========== LOCALSTORAGE ==========
  function getShippingMethodsFromStorage() {
    try {
      return JSON.parse(localStorage.getItem(SHIPPING_STORAGE_KEY) || "[]");
    } catch (e) {
      return [];
    }
  }

  function saveShippingMethodToStorage(method) {
    const methods = getShippingMethodsFromStorage();
    methods.push(method);
    localStorage.setItem(SHIPPING_STORAGE_KEY, JSON.stringify(methods));
  }

  // ========== HELPER FUNCTIONS ==========
  function formatCurrency(amount) {
    if (!amount) return "0₫";
    return amount.toLocaleString('vi-VN') + '₫';
  }

  function formatFeeDisplay(feeType, fee) {
    if (feeType === "free") {
      return "Miễn phí";
    } else if (feeType === "weight") {
      return formatCurrency(fee) + "/kg";
    } else if (feeType === "distance") {
      return formatCurrency(fee) + "/km";
    } else {
      return formatCurrency(fee);
    }
  }

  function formatAreaDisplay(area) {
    const areaMap = {
      "all": "Toàn quốc",
      "north": "Miền Bắc",
      "central": "Miền Trung",
      "south": "Miền Nam"
    };
    return areaMap[area] || area;
  }

  function formatProviderDisplay(provider) {
    const providerMap = {
      "ghn": "Giao hàng nhanh (GHN)",
      "ghtk": "Giao hàng tiết kiệm (GHTK)",
      "viettel": "Viettel Post",
      "jt": "J&T Express",
      "vnpost": "Bưu điện Việt Nam (VNPost)",
      "ninja": "Ninja Van",
      "best": "Best Express",
      "grab": "Grab Express",
      "ahamove": "AhaMove",
      "other": "Khác"
    };
    return providerMap[provider] || provider || "Chưa chọn";
  }

  // ========== HIỂN THỊ PHƯƠNG THỨC VẬN CHUYỂN ==========
  function loadShippingMethods() {
    const methods = getShippingMethodsFromStorage();
    
    if (shippingTableBody) {
      shippingTableBody.innerHTML = "";
    }

    if (methods.length === 0) {
      if (shippingEmptyState) shippingEmptyState.style.display = "block";
      if (shippingTableWrapper) shippingTableWrapper.style.display = "none";
      if (shippingPaginationContainer) shippingPaginationContainer.style.display = "none";
      return;
    }

    if (shippingEmptyState) shippingEmptyState.style.display = "none";
    if (shippingTableWrapper) shippingTableWrapper.style.display = "block";

    methods.forEach(method => {
      addShippingMethodToTable(method);
    });
  }

  function addShippingMethodToTable(method) {
    if (!shippingTableBody) return;

    const tr = document.createElement("tr");
    tr.dataset.shippingId = method.id;

    const statusClass = method.status === "active" ? "success" : "cancelled";
    const statusText = method.status === "active" ? "Đang hoạt động" : "Tạm dừng";
    const feeDisplay = formatFeeDisplay(method.feeType, method.fee);
    const areaDisplay = formatAreaDisplay(method.area);
    const deliveryTimeText = `${method.deliveryTime} ngày`;
    const providerDisplay = formatProviderDisplay(method.provider);

    tr.innerHTML = `
      <td>
        <div>
          <div class="product-name">${method.name}</div>
          <div class="product-meta">${providerDisplay}</div>
        </div>
      </td>
      <td>
        <div style="max-width: 300px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${method.description}">
          ${method.description}
        </div>
      </td>
      <td>${feeDisplay}</td>
      <td>
        <div>
          <div>${deliveryTimeText}</div>
          <div class="product-meta">${areaDisplay}</div>
        </div>
      </td>
      <td><span class="status ${statusClass}">${statusText}</span></td>
      <td>
        <div class="action-menu">
          <button class="action-toggle">⋯</button>
          <div class="action-dropdown">
            <button class="action-item" data-action="edit" data-shipping-id="${method.id}">✏️ Chỉnh sửa</button>
            <button class="action-item" data-action="duplicate" data-shipping-id="${method.id}">📑 Nhân bản</button>
            <button class="action-item danger" data-action="delete" data-shipping-id="${method.id}">🗑 Xóa</button>
          </div>
        </div>
      </td>
    `;

    shippingTableBody.appendChild(tr);
  }

  // ========== TÌM KIẾM ==========
  if (shippingSearchInput) {
    shippingSearchInput.addEventListener("input", (e) => {
      const searchTerm = e.target.value.toLowerCase().trim();
      filterShippingMethods(searchTerm);
    });
  }

  function filterShippingMethods(searchTerm) {
    if (!shippingTableBody) return;
    
    const rows = shippingTableBody.querySelectorAll("tr[data-shipping-id]");
    
    rows.forEach(row => {
      const name = row.querySelector(".product-name")?.textContent.toLowerCase() || "";
      const description = row.querySelector("td:nth-child(2)")?.textContent.toLowerCase() || "";
      
      if (!searchTerm || name.includes(searchTerm) || description.includes(searchTerm)) {
        row.style.display = "";
      } else {
        row.style.display = "none";
      }
    });

    shippingCurrentPage = 1;
    updateShippingPagination();
  }

  // ========== PHÂN TRANG ==========
  function updateShippingPagination() {
    if (!shippingTableBody) return;
    
    const allRows = Array.from(shippingTableBody.querySelectorAll("tr[data-shipping-id]")).filter(row => {
      return row.style.display !== "none";
    });
    const totalItems = allRows.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / SHIPPING_ITEMS_PER_PAGE));

    if (totalItems === 0) {
      if (shippingPaginationContainer) shippingPaginationContainer.style.display = "none";
      return;
    }

    if (totalItems <= SHIPPING_ITEMS_PER_PAGE) {
      if (shippingPaginationContainer) shippingPaginationContainer.style.display = "none";
      allRows.forEach(row => row.style.display = "");
      return;
    }

    if (shippingPaginationContainer) shippingPaginationContainer.style.display = "flex";

    if (shippingCurrentPage > totalPages) {
      shippingCurrentPage = totalPages;
    }
    if (shippingCurrentPage < 1) {
      shippingCurrentPage = 1;
    }

    const startIndex = (shippingCurrentPage - 1) * SHIPPING_ITEMS_PER_PAGE;
    const endIndex = Math.min(startIndex + SHIPPING_ITEMS_PER_PAGE, totalItems);

    if (shippingPaginationInfo) {
      shippingPaginationInfo.textContent = `Hiển thị ${startIndex + 1}-${endIndex} trong tổng số ${totalItems} phương thức`;
    }

    allRows.forEach((row, index) => {
      if (index >= startIndex && index < endIndex) {
        row.style.display = "";
      } else {
        row.style.display = "none";
      }
    });

    if (shippingPrevPageBtn) shippingPrevPageBtn.disabled = shippingCurrentPage === 1;
    if (shippingNextPageBtn) shippingNextPageBtn.disabled = shippingCurrentPage === totalPages;

    if (shippingPaginationNumbers) {
      shippingPaginationNumbers.innerHTML = "";
      const maxVisiblePages = 5;
      let startPage = Math.max(1, shippingCurrentPage - Math.floor(maxVisiblePages / 2));
      let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

      if (endPage - startPage < maxVisiblePages - 1) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
      }

      for (let i = startPage; i <= endPage; i++) {
        const pageBtn = document.createElement("button");
        pageBtn.className = "btn-sm";
        pageBtn.textContent = i;
        if (i === shippingCurrentPage) {
          pageBtn.classList.add("active");
        }
        pageBtn.addEventListener("click", () => {
          shippingCurrentPage = i;
          updateShippingPagination();
        });
        shippingPaginationNumbers.appendChild(pageBtn);
      }
    }
  }

  if (shippingPrevPageBtn) {
    shippingPrevPageBtn.addEventListener("click", () => {
      if (shippingCurrentPage > 1) {
        shippingCurrentPage--;
        updateShippingPagination();
      }
    });
  }

  if (shippingNextPageBtn) {
    shippingNextPageBtn.addEventListener("click", () => {
      const allRows = Array.from(shippingTableBody.querySelectorAll("tr[data-shipping-id]")).filter(row => {
        return row.style.display !== "none";
      });
      const totalPages = Math.ceil(allRows.length / SHIPPING_ITEMS_PER_PAGE);
      if (shippingCurrentPage < totalPages) {
        shippingCurrentPage++;
        updateShippingPagination();
      }
    });
  }

  // ========== XỬ LÝ ACTION MENU ==========
  // action-menu.js sẽ tự động xử lý việc mở/đóng menu khi click vào toggle
  // Chúng ta chỉ cần xử lý các action cụ thể
  document.addEventListener("click", (e) => {
    const item = e.target.closest(".action-item[data-shipping-id]");
    if (!item) return;

    const action = item.getAttribute("data-action");
    const shippingId = item.getAttribute("data-shipping-id");

    if (!action || !shippingId) return;

    e.stopPropagation();
    e.preventDefault();

    // Đóng menu (action-menu.js cũng sẽ làm điều này, nhưng đảm bảo chắc chắn)
    const menu = item.closest(".action-menu");
    if (menu) {
      menu.classList.remove("open");
    }

    // Xử lý action
    switch (action) {
      case "edit":
        editShippingMethod(shippingId);
        break;
      case "duplicate":
        duplicateShippingMethod(shippingId);
        break;
      case "delete":
        deleteShippingMethod(shippingId);
        break;
    }
  });

  function editShippingMethod(shippingId) {
    const methods = getShippingMethodsFromStorage();
    const method = methods.find(m => m.id === shippingId);

    if (!method) {
      alert("Không tìm thấy phương thức vận chuyển!");
      return;
    }

    // Điền dữ liệu vào form
    const nameInput = document.getElementById("shippingName");
    const descInput = document.getElementById("shippingDescription");
    const feeTypeInput = document.getElementById("feeType");
    const feeInput = document.getElementById("shippingFee");
    const timeInput = document.getElementById("deliveryTime");
    const areaInput = document.getElementById("shippingArea");
    const statusInput = document.getElementById("shippingStatus");

    if (nameInput) nameInput.value = method.name || "";
    if (descInput) descInput.value = method.description || "";
    if (feeTypeInput) feeTypeInput.value = method.feeType || "fixed";
    if (feeInput) feeInput.value = method.fee || 0;
    if (timeInput) timeInput.value = method.deliveryTime || 1;
    if (areaInput) areaInput.value = method.area || "all";
    if (statusInput) statusInput.value = method.status || "active";

    updateFeePlaceholder();

    const modalTitle = shippingModal.querySelector("h2");
    const submitBtn = shippingForm ? shippingForm.querySelector('button[type="submit"]') : null;
    if (modalTitle) modalTitle.textContent = "Chỉnh sửa phương thức vận chuyển";
    if (submitBtn) submitBtn.textContent = "Cập nhật phương thức";

    if (shippingForm) {
      shippingForm.dataset.editingId = shippingId;
    }
    
    // Mở modal
    shippingModal.style.display = "flex";
    // Force reflow để đảm bảo CSS được áp dụng
    void shippingModal.offsetWidth;
  }

  function duplicateShippingMethod(shippingId) {
    const methods = getShippingMethodsFromStorage();
    const method = methods.find(m => m.id === shippingId);

    if (!method) {
      alert("Không tìm thấy phương thức vận chuyển để nhân bản!");
      return;
    }

    const newMethod = {
      ...method,
      id: "shipping_" + Date.now(),
      name: method.name + " (Bản sao)",
      orders: 0,
      revenue: 0,
      createdAt: new Date().toISOString()
    };

    saveShippingMethodToStorage(newMethod);
    loadShippingMethods();
    updateShippingPagination();
    updateShippingKPIs();
    alert(`Đã nhân bản phương thức ${method.name} thành công!`);
  }

  function deleteShippingMethod(shippingId) {
    if (!confirm("Bạn có chắc chắn muốn xóa phương thức vận chuyển này?\n\nHành động này không thể hoàn tác!")) {
      return;
    }

    const methods = getShippingMethodsFromStorage();
    const filtered = methods.filter(m => m.id !== shippingId);
    localStorage.setItem(SHIPPING_STORAGE_KEY, JSON.stringify(filtered));

    const row = document.querySelector(`tr[data-shipping-id="${shippingId}"]`);
    if (row) {
      row.remove();
    }

    updateShippingPagination();
    loadShippingMethods();
    updateShippingKPIs();
    alert("Đã xóa phương thức vận chuyển thành công!");
  }

  // ========== CẬP NHẬT KPI ==========
  function updateShippingKPIs() {
    const methods = getShippingMethodsFromStorage();
    const totalMethods = methods.length;
    let activeCount = 0;
    let totalOrders = 0;
    let totalRevenue = 0;

    methods.forEach(method => {
      if (method.status === "active") {
        activeCount++;
      }
      totalOrders += method.orders || 0;
      totalRevenue += method.revenue || 0;
    });

    // Cập nhật KPI cards
    const totalMethodsEl = document.getElementById("totalShippingMethods");
    const activeMethodsEl = document.getElementById("activeShippingMethods");
    const totalOrdersEl = document.getElementById("totalOrders");
    const totalRevenueEl = document.getElementById("totalRevenue");

    if (totalMethodsEl) totalMethodsEl.textContent = totalMethods;
    if (activeMethodsEl) activeMethodsEl.textContent = activeCount;
    if (totalOrdersEl) totalOrdersEl.textContent = totalOrders;
    if (totalRevenueEl) totalRevenueEl.textContent = formatCurrency(totalRevenue);
  }

  // Khởi tạo
  function initializeShipping() {
    console.log("Initializing Shipping...");
    loadShippingMethods();
    updateShippingPagination();
    updateShippingKPIs();
  }

  // Gọi ngay khi DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeShipping);
  } else {
    initializeShipping();
  }

  // Cũng gọi khi window load để đảm bảo
  window.addEventListener("load", () => {
    console.log("Window loaded, reloading shipping methods...");
    loadShippingMethods();
    updateShippingPagination();
    updateShippingKPIs();
  });
});


