// Hoàn tiền search functionality
document.addEventListener("DOMContentLoaded", () => {
  const refundSearch = document.getElementById("refundSearch");
  const refundSearchFilter = document.getElementById("refundSearchFilter");
  const refundTable = document.querySelector("table tbody");
  
  if (!refundTable) {
    console.warn("Refund table not found");
    return;
  }
  
  // Lưu tất cả các dòng ban đầu
  const allRows = Array.from(refundTable.querySelectorAll("tr"));

  // ========== LOCALSTORAGE: Lưu và khôi phục trạng thái ==========
  const STORAGE_KEY = "refund_statuses";
  
  // Lưu trạng thái vào localStorage
  function saveRefundStatus(refundId, status, statusClass) {
    try {
      let statuses = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      statuses[refundId] = {
        status: status,
        statusClass: statusClass,
        updatedAt: Date.now()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(statuses));
    } catch (e) {
      console.error("Error saving refund status:", e);
    }
  }

  // Khôi phục trạng thái từ localStorage
  function restoreRefundStatuses() {
    try {
      const statuses = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      const rows = document.querySelectorAll("table tbody tr");
      
      rows.forEach(row => {
        const codeCell = row.querySelector("td:first-child");
        if (!codeCell) return;
        
        const code = codeCell.textContent.trim();
        const refundId = code.replace("#", "");
        
        if (statuses[refundId]) {
          const savedStatus = statuses[refundId];
          const statusCell = row.querySelector("td:nth-child(6)");
          
          if (statusCell) {
            // Cập nhật trạng thái
            statusCell.innerHTML = `<span class="status ${savedStatus.statusClass}">${savedStatus.status}</span>`;
            
            // Cập nhật action menu dựa trên trạng thái
            const actionMenu = row.querySelector(".action-dropdown");
            if (actionMenu) {
              const statusLower = savedStatus.status.toLowerCase();
              if (statusLower.includes("đã hoàn") || statusLower.includes("đã duyệt")) {
                // Đã hoàn tiền - chỉ còn Xem chi tiết và Nhắn tin
                actionMenu.innerHTML = `
                  <button class="action-item" data-action="view" data-refund-id="${refundId}">👁 Xem chi tiết</button>
                  <button class="action-item" data-action="message" data-refund-id="${refundId}">💬 Nhắn tin</button>
                `;
              } else if (statusLower.includes("từ chối")) {
                // Từ chối - có thêm nút Xóa
                actionMenu.innerHTML = `
                  <button class="action-item" data-action="view" data-refund-id="${refundId}">👁 Xem chi tiết</button>
                  <button class="action-item" data-action="message" data-refund-id="${refundId}">💬 Nhắn tin</button>
                  <button class="action-item danger" data-action="delete" data-refund-id="${refundId}">🗑 Xóa</button>
                `;
              }
            }
          }
        }
      });
      
      // Cập nhật KPI sau khi khôi phục
      updateKPICounts();
    } catch (e) {
      console.error("Error restoring refund statuses:", e);
    }
  }

  // Khôi phục trạng thái khi trang load - gọi sau khi tab filter được setup
  // Gọi ngay lập tức
  restoreRefundStatuses();
  
  // Gọi lại sau các khoảng thời gian để đảm bảo
  setTimeout(() => {
    restoreRefundStatuses();
    // Sau khi khôi phục, áp dụng lại tab filter nếu có
    const activeTab = document.querySelector(".tab-btn.active");
    if (activeTab) {
      activeTab.click();
    }
  }, 200);
  
  setTimeout(() => {
    restoreRefundStatuses();
  }, 500);
  
  // Cũng gọi khi window load hoàn tất
  window.addEventListener('load', () => {
    setTimeout(() => {
      restoreRefundStatuses();
      // Áp dụng lại tab filter
      const activeTab = document.querySelector(".tab-btn.active");
      if (activeTab) {
        activeTab.click();
      }
    }, 100);
  });
  
  const performSearch = (searchTerm) => {
    if (!searchTerm) {
      // Hiển thị tất cả nếu không có từ khóa
      allRows.forEach(row => {
        row.style.display = "";
      });
      return;
    }
    
    // Lọc các dòng
    allRows.forEach(row => {
      const text = row.textContent.toLowerCase();
      if (text.includes(searchTerm)) {
        row.style.display = "";
      } else {
        row.style.display = "none";
      }
    });
  };
  
  // Search trong topbar
  if (refundSearch) {
    refundSearch.addEventListener("input", (e) => {
      const searchTerm = e.target.value.toLowerCase().trim();
      performSearch(searchTerm);
    });
  }
  
  // Search trong filter group
  if (refundSearchFilter) {
    refundSearchFilter.addEventListener("input", (e) => {
      const searchTerm = e.target.value.toLowerCase().trim();
      performSearch(searchTerm);
      
      // Sync với topbar search
      if (refundSearch) {
        refundSearch.value = e.target.value;
      }
    });
  }
  
  // Sync từ topbar đến filter
  if (refundSearch && refundSearchFilter) {
    refundSearch.addEventListener("input", (e) => {
      refundSearchFilter.value = e.target.value;
    });
  }
  
  // ========== TAB FILTER FUNCTIONALITY ==========
  const tabButtons = document.querySelectorAll(".tab-btn");
  const refundRows = Array.from(refundTable.querySelectorAll("tr"));
  
  tabButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      // Remove active class from all tabs
      tabButtons.forEach(b => b.classList.remove("active"));
      // Add active class to clicked tab
      btn.classList.add("active");
      
      const tabText = btn.textContent.trim();
      
      // Filter rows based on tab
      refundRows.forEach(row => {
        const statusCell = row.querySelector("td:nth-child(6)");
        if (!statusCell) return;
        
        const statusText = statusCell.textContent.trim();
        let shouldShow = false;
        
        if (tabText === "Tất cả") {
          shouldShow = true;
        } else if (tabText === "Chờ xử lý" && statusText.includes("Chờ xử lý")) {
          shouldShow = true;
        } else if (tabText === "Đang xử lý" && statusText.includes("Đang xử lý")) {
          shouldShow = true;
        } else if (tabText === "Đã hoàn" && (statusText.includes("Đã hoàn") || statusText.includes("Đã duyệt"))) {
          shouldShow = true;
        }
        
        row.style.display = shouldShow ? "" : "none";
      });
    });
  });

  // ========== KHỞI TẠO: Cập nhật số lượng KPI khi trang load ==========
  // Gọi ngay sau khi DOM ready và sau một chút để đảm bảo tất cả elements đã render
  updateKPICounts();
  setTimeout(() => {
    updateKPICounts();
  }, 50);
  setTimeout(() => {
    updateKPICounts();
  }, 200);

  // ========== CẬP NHẬT HÌNH ẢNH SẢN PHẨM ==========
  function updateProductImages() {
    const productImages = document.querySelectorAll(".product-thumb");
    
    // Sử dụng hình ảnh từ Picsum (Lorem Picsum) - CDN đáng tin cậy và miễn phí
    // Mỗi sản phẩm sẽ có một seed cố định để luôn hiển thị cùng một hình
    const productImageMap = {
      "iPhone": "https://picsum.photos/seed/iphone15/100/100",
      "AirPods": "https://picsum.photos/seed/airpods/100/100",
      "MacBook": "https://picsum.photos/seed/macbook/100/100",
      "Apple Watch": "https://picsum.photos/seed/watch/100/100",
      "iPad": "https://picsum.photos/seed/ipad/100/100"
    };

    productImages.forEach((img) => {
      // Tìm tên sản phẩm từ parent element
      const productCell = img.closest(".product-cell");
      if (productCell) {
        const productNameElement = productCell.querySelector(".product-name");
        if (productNameElement) {
          const productName = productNameElement.textContent.trim();
          
          // Tìm hình ảnh phù hợp
          let imageUrl = null;
          for (const [key, url] of Object.entries(productImageMap)) {
            if (productName.includes(key)) {
              imageUrl = url;
              img.alt = key;
              break;
            }
          }

          // Nếu tìm thấy hình ảnh và src hiện tại khác, cập nhật
          if (imageUrl && img.src !== imageUrl && !img.src.includes(imageUrl)) {
            // Force reload bằng cách thêm cache buster
            img.src = imageUrl + '?v=' + Date.now();
            img.loading = "eager";
          }
        }
      }

      // Thêm error handler để fallback về placeholder có text nếu hình ảnh không load được
      if (!img.hasAttribute('data-error-handled')) {
        img.setAttribute('data-error-handled', 'true');
        const originalOnError = img.onerror;
        img.onerror = function(e) {
          // Nếu đang dùng Picsum và lỗi, thử lại với cache buster mới
          if (this.src.includes('picsum.photos') && !this.src.includes('placeholder')) {
            const newUrl = this.src.split('?')[0] + '?v=' + Date.now();
            this.src = newUrl;
            return;
          }
          
          // Nếu vẫn lỗi, dùng placeholder
          const productNameElement = this.closest(".product-cell")?.querySelector(".product-name");
          const productName = productNameElement?.textContent.trim() || "Product";
          const initials = productName.substring(0, 2).toUpperCase();
          this.src = `https://via.placeholder.com/40/1a1a2e/ffffff?text=${encodeURIComponent(initials)}`;
          
          if (originalOnError) {
            originalOnError.call(this, e);
          }
        };
      }
    });
  }

  // Gọi hàm cập nhật hình ảnh ngay khi DOM ready
  updateProductImages();
  
  // Gọi lại sau các khoảng thời gian khác nhau để đảm bảo
  setTimeout(updateProductImages, 50);
  setTimeout(updateProductImages, 200);
  setTimeout(updateProductImages, 500);
  
  // Cũng gọi khi window load hoàn tất
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updateProductImages);
  }
  
  window.addEventListener('load', () => {
    setTimeout(updateProductImages, 100);
  });

  // ========== ACTION MENU HANDLING ==========
  document.addEventListener("click", (e) => {
    const item = e.target.closest(".action-item");
    if (!item) return;

    const action = item.getAttribute("data-action");
    const refundId = item.getAttribute("data-refund-id");
    
    if (!action || !refundId) return;

    e.stopPropagation();
    e.preventDefault();

    // Đóng menu
    const menu = item.closest(".action-menu");
    if (menu) {
      menu.classList.remove("open");
    }

    // Xử lý các action
    switch (action) {
      case "view":
        openRefundDetail(refundId);
        break;
      case "approve":
        approveRefund(refundId);
        break;
      case "reject":
        rejectRefund(refundId);
        break;
      case "message":
        openMessageModal(refundId);
        break;
      case "delete":
        deleteRefund(refundId);
        break;
    }
  });

  // ========== XEM CHI TIẾT ==========
  function openRefundDetail(refundId) {
    const row = findRefundRow(refundId);
    if (!row) {
      alert("Không tìm thấy thông tin hoàn tiền!");
      return;
    }

    // Lấy thông tin từ row
    const cells = row.querySelectorAll("td");
    const code = cells[0].textContent.trim();
    const customerName = cells[1].querySelector(".product-name")?.textContent.trim() || "";
    const customerPhone = cells[1].querySelector(".product-meta")?.textContent.trim() || "";
    const customerAvatar = cells[1].querySelector(".avatar");
    const customerAvatarText = customerAvatar?.textContent.trim() || customerName.substring(0, 2).toUpperCase();
    
    const productName = cells[2].querySelector(".product-name")?.textContent.trim() || "";
    const productQty = cells[2].querySelector(".product-meta")?.textContent.trim() || "";
    const productImage = cells[2].querySelector("img.product-thumb");
    
    // Lấy hình ảnh - ưu tiên src thực tế, nếu không có thì dùng fallback
    let productImageSrc = "https://via.placeholder.com/60";
    if (productImage) {
      // Lấy src thực tế từ img element
      productImageSrc = productImage.src || productImage.getAttribute("src") || productImage.getAttribute("data-src");
      
      // Nếu là placeholder, thử lấy từ alt hoặc tên sản phẩm để tạo URL phù hợp
      if (productImageSrc.includes("placeholder") || !productImageSrc || productImageSrc === "") {
        // Tạo URL hình ảnh dựa trên tên sản phẩm
        const productImageMap = {
          "iPhone": "https://picsum.photos/seed/iphone15/100/100",
          "AirPods": "https://picsum.photos/seed/airpods/100/100",
          "MacBook": "https://picsum.photos/seed/macbook/100/100",
          "Apple Watch": "https://picsum.photos/seed/watch/100/100",
          "iPad": "https://picsum.photos/seed/ipad/100/100"
        };
        
        for (const [key, url] of Object.entries(productImageMap)) {
          if (productName.includes(key)) {
            productImageSrc = url;
            break;
          }
        }
      }
    }
    
    const reason = cells[3].textContent.trim();
    const amount = cells[4].textContent.trim();
    const statusText = cells[5].querySelector(".status")?.textContent.trim() || "";
    const statusClass = cells[5].querySelector(".status")?.className || "";

    // Tạo mã đơn hàng giả lập (dựa trên refundId)
    const orderCode = `ĐH-${refundId.replace("HT-", "").padStart(5, "0")}`;

    // Điền thông tin vào modal
    document.getElementById("refundDetailCodeSpan").textContent = code;
    document.getElementById("refundDetailOrder").textContent = `Đơn hàng: ${orderCode}`;
    
    // Thông tin khách hàng với avatar
    const customerContainer = document.getElementById("refundDetailCustomer");
    customerContainer.innerHTML = `
      <div class="avatar" style="width: 48px; height: 48px; flex-shrink: 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; border-radius: 50%; color: white; font-weight: 600; font-size: 18px;">
        ${customerAvatarText}
      </div>
      <div style="flex: 1;">
        <div style="font-weight: 600; color: var(--text); margin-bottom: 4px; font-size: 15px;">${customerName}</div>
        <div style="font-size: 13px; color: var(--text-muted);">${customerPhone}</div>
      </div>
    `;

    // Thông tin sản phẩm với hình ảnh và giá
    const productContainer = document.getElementById("refundDetailProduct");
    productContainer.innerHTML = `
      <div style="display: flex; align-items: center; gap: 12px;">
        <img id="refundDetailProductImage" src="${productImageSrc}" alt="${productName}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px; flex-shrink: 0; background: var(--bg-elevated-2);" 
             onerror="this.onerror=null; this.src='https://via.placeholder.com/60/1a1a2e/ffffff?text=${encodeURIComponent(productName.substring(0, 2))}'" />
        <div style="flex: 1;">
          <div style="font-weight: 600; color: var(--text); margin-bottom: 4px; font-size: 15px;">${productName}</div>
          <div style="font-size: 13px; color: var(--text-muted); margin-bottom: 8px;">${productQty}</div>
          <div style="font-size: 18px; font-weight: 700; color: #10b981;">${amount}</div>
        </div>
      </div>
    `;
    
    // Đảm bảo hình ảnh được load đúng - thử load lại nếu cần
    const modalProductImage = document.getElementById("refundDetailProductImage");
    if (modalProductImage && productImage) {
      // Nếu hình ảnh trong bảng đã load, dùng src đó
      if (productImage.complete && productImage.naturalHeight !== 0) {
        modalProductImage.src = productImage.src;
      } else {
        // Đợi hình ảnh trong bảng load xong
        productImage.addEventListener('load', function() {
          if (modalProductImage) {
            modalProductImage.src = this.src;
          }
        }, { once: true });
      }
    }

    document.getElementById("refundDetailReason").textContent = reason;
    
    // Xóa textarea feedback
    document.getElementById("refundDetailFeedbackText").value = "";

    // Hiển thị/ẩn các nút dựa trên trạng thái
    const rejectBtn = document.getElementById("rejectFromDetailBtn");
    const approveBtn = document.getElementById("approveFromDetailBtn");
    
    if (statusText.includes("Chờ xử lý") || statusText.includes("Đang xử lý")) {
      rejectBtn.style.display = "inline-flex";
      approveBtn.style.display = "inline-flex";
    } else {
      rejectBtn.style.display = "none";
      approveBtn.style.display = "none";
    }

    // Lưu refundId vào modal để dùng khi approve/reject
    const modal = document.getElementById("refundDetailModal");
    modal.dataset.refundId = refundId;

    // Images (giả lập - nếu có)
    const imagesContainer = document.getElementById("refundDetailImages");
    const imagesDiv = document.getElementById("refundDetailImagesContainer");
    if (imagesContainer && imagesDiv) {
      if (reason.includes("hình ảnh")) {
        imagesContainer.style.display = "block";
        // Đếm số lượng hình ảnh từ lý do (ví dụ: "1 hình ảnh đính kèm")
        const imageMatch = reason.match(/(\d+)\s*hình\s*ảnh/i);
        const imageCount = imageMatch ? parseInt(imageMatch[1]) : 1;
        
        let imagesHTML = "";
        for (let i = 0; i < imageCount; i++) {
          imagesHTML += `
            <div style="width: 120px; height: 120px; background: var(--bg-elevated-2); border: 1px solid var(--border); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: var(--text-muted); cursor: pointer; transition: all 0.2s; position: relative; overflow: hidden;" 
                 onmouseover="this.style.borderColor='var(--accent)'; this.style.opacity='0.9'" 
                 onmouseout="this.style.borderColor='var(--border)'; this.style.opacity='1'"
                 onclick="this.style.transform='scale(1.05)'">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="opacity: 0.6;">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                <polyline points="21 15 16 10 5 21"></polyline>
              </svg>
            </div>
          `;
        }
        imagesDiv.innerHTML = imagesHTML;
      } else {
        imagesContainer.style.display = "none";
      }
    }

    // Mở modal
    modal.style.display = "flex";
  }

  // ========== DUYỆT HOÀN TIỀN ==========
  function approveRefund(refundId) {
    if (!confirm(`Bạn có chắc chắn muốn duyệt hoàn tiền cho yêu cầu ${refundId}?`)) {
      return;
    }

    const row = findRefundRow(refundId);
    if (!row) return;

    // Cập nhật trạng thái
    const statusCell = row.querySelector("td:nth-child(6)");
    if (statusCell) {
      statusCell.innerHTML = '<span class="status success">Đã hoàn tiền</span>';
      // Lưu vào localStorage
      saveRefundStatus(refundId, "Đã hoàn tiền", "success");
    }

    // Cập nhật action menu - chỉ giữ lại Xem chi tiết và Nhắn tin
    const actionMenu = row.querySelector(".action-dropdown");
    if (actionMenu) {
      actionMenu.innerHTML = `
        <button class="action-item" data-action="view" data-refund-id="${refundId}">👁 Xem chi tiết</button>
        <button class="action-item" data-action="message" data-refund-id="${refundId}">💬 Nhắn tin</button>
      `;
    }

    // Kiểm tra tab đang active và cập nhật hiển thị row
    const activeTab = document.querySelector(".tab-btn.active");
    if (activeTab) {
      const tabText = activeTab.textContent.trim();
      if (tabText === "Chờ xử lý" || tabText === "Đang xử lý") {
        // Nếu đang filter theo tab "Chờ xử lý" hoặc "Đang xử lý", ẩn row này
        row.style.display = "none";
      } else if (tabText === "Đã hoàn") {
        // Nếu đang filter theo tab "Đã hoàn", hiển thị row này
        row.style.display = "";
      }
    }

    // Cập nhật KPI và tab counts
    updateKPICounts();
    
    // Đóng modal nếu đang mở
    const refundDetailModal = document.getElementById("refundDetailModal");
    if (refundDetailModal && refundDetailModal.style.display === "flex") {
      refundDetailModal.style.display = "none";
    }
    
    alert(`Đã duyệt hoàn tiền cho yêu cầu ${refundId} thành công!`);
  }

  // ========== TỪ CHỐI ==========
  function rejectRefund(refundId) {
    const reason = prompt("Vui lòng nhập lý do từ chối:");
    if (!reason || reason.trim() === "") {
      return;
    }

    if (!confirm(`Bạn có chắc chắn muốn từ chối yêu cầu ${refundId}?\nLý do: ${reason}`)) {
      return;
    }

    const row = findRefundRow(refundId);
    if (!row) return;

    // Cập nhật trạng thái
    const statusCell = row.querySelector("td:nth-child(6)");
    if (statusCell) {
      statusCell.innerHTML = '<span class="status cancelled">Từ chối</span>';
      // Lưu vào localStorage
      saveRefundStatus(refundId, "Từ chối", "cancelled");
    }

    // Cập nhật action menu - Từ chối có thêm nút Xóa
    const actionMenu = row.querySelector(".action-dropdown");
    if (actionMenu) {
      actionMenu.innerHTML = `
        <button class="action-item" data-action="view" data-refund-id="${refundId}">👁 Xem chi tiết</button>
        <button class="action-item" data-action="message" data-refund-id="${refundId}">💬 Nhắn tin</button>
        <button class="action-item danger" data-action="delete" data-refund-id="${refundId}">🗑 Xóa</button>
      `;
    }

    // Kiểm tra tab đang active và cập nhật hiển thị row
    const activeTab = document.querySelector(".tab-btn.active");
    if (activeTab) {
      const tabText = activeTab.textContent.trim();
      if (tabText === "Chờ xử lý" || tabText === "Đang xử lý" || tabText === "Đã hoàn") {
        // Nếu đang filter theo các tab này, ẩn row này vì đã chuyển sang "Từ chối"
        row.style.display = "none";
      }
    }

    // Cập nhật KPI và tab counts
    updateKPICounts();
    
    // Đóng modal nếu đang mở
    const refundDetailModal = document.getElementById("refundDetailModal");
    if (refundDetailModal && refundDetailModal.style.display === "flex") {
      refundDetailModal.style.display = "none";
    }
    
    alert(`Đã từ chối yêu cầu ${refundId}!`);
  }

  // ========== XÓA YÊU CẦU HOÀN TIỀN ==========
  function deleteRefund(refundId) {
    if (!confirm(`Bạn có chắc chắn muốn xóa yêu cầu hoàn tiền ${refundId}?\n\nHành động này không thể hoàn tác!`)) {
      return;
    }

    const row = findRefundRow(refundId);
    if (!row) return;

    // Xóa row khỏi DOM
    row.remove();

    // Xóa khỏi localStorage
    try {
      let statuses = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      delete statuses[refundId];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(statuses));
    } catch (e) {
      console.error("Error deleting refund from storage:", e);
    }

    // Cập nhật KPI và tab counts
    updateKPICounts();
    
    // Đóng modal nếu đang mở
    const refundDetailModal = document.getElementById("refundDetailModal");
    if (refundDetailModal && refundDetailModal.style.display === "flex") {
      refundDetailModal.style.display = "none";
    }
    
    alert(`Đã xóa yêu cầu hoàn tiền ${refundId} thành công!`);
  }

  // ========== NHẮN TIN ==========
  function openMessageModal(refundId) {
    const row = findRefundRow(refundId);
    if (!row) return;

    const customerName = row.querySelector("td:nth-child(2) .product-name")?.textContent.trim() || "";
    document.getElementById("messageCustomerName").textContent = `Khách hàng: ${customerName}`;
    document.getElementById("messageContent").value = "";

    const modal = document.getElementById("messageModal");
    modal.style.display = "flex";
    
    // Lưu refundId để dùng khi gửi
    modal.dataset.refundId = refundId;
  }

  // ========== HELPER FUNCTIONS ==========
  function findRefundRow(refundId) {
    const rows = document.querySelectorAll("table tbody tr");
    for (const row of rows) {
      const code = row.querySelector("td:first-child")?.textContent.trim();
      if (code === `#${refundId}`) {
        return row;
      }
    }
    return null;
  }

  function updateKPICounts() {
    const rows = Array.from(document.querySelectorAll("table tbody tr"));
    let pendingCount = 0;
    let processingCount = 0;
    let completedCount = 0;
    let rejectedCount = 0;

    rows.forEach(row => {
      // Đếm TẤT CẢ các row, không quan tâm đến filter (vì KPI hiển thị tổng số)
      const statusCell = row.querySelector("td:nth-child(6)");
      if (!statusCell) return;

      // Lấy text từ status cell - ưu tiên lấy từ .status element
      let statusText = "";
      const statusElement = statusCell.querySelector(".status");
      if (statusElement) {
        statusText = statusElement.textContent.trim();
      } else {
        statusText = statusCell.textContent.trim();
      }
      
      // Đếm chính xác theo trạng thái (không phân biệt hoa thường)
      const statusLower = statusText.toLowerCase();
      
      if (statusLower.includes("chờ xử lý") || statusLower.includes("chờ")) {
        pendingCount++;
      } else if (statusLower.includes("đang xử lý") || statusLower.includes("đang")) {
        processingCount++;
      } else if (statusLower.includes("đã hoàn tiền") || statusLower.includes("đã hoàn") || statusLower.includes("đã duyệt")) {
        completedCount++;
      } else if (statusLower.includes("từ chối")) {
        rejectedCount++;
      }
    });

    // Cập nhật KPI cards - đảm bảo cập nhật đúng thứ tự
    const kpiCards = document.querySelectorAll(".kpi-value");
    if (kpiCards.length >= 4) {
      kpiCards[0].textContent = pendingCount;
      kpiCards[1].textContent = processingCount;
      kpiCards[2].textContent = completedCount;
      kpiCards[3].textContent = rejectedCount;
    }
  }

  // ========== MODAL HANDLERS ==========
  // Đóng modal chi tiết
  const closeRefundDetailModal = document.getElementById("closeRefundDetailModal");
  const closeRefundDetailModalBtn = document.getElementById("closeRefundDetailModalBtn");
  const refundDetailModal = document.getElementById("refundDetailModal");

  [closeRefundDetailModal, closeRefundDetailModalBtn].forEach(btn => {
    if (btn) {
      btn.addEventListener("click", () => {
        refundDetailModal.style.display = "none";
      });
    }
  });

  // Đóng modal nhắn tin
  const closeMessageModal = document.getElementById("closeMessageModal");
  const closeMessageModalBtn = document.getElementById("closeMessageModalBtn");
  const messageModal = document.getElementById("messageModal");
  const sendMessageBtn = document.getElementById("sendMessageBtn");

  [closeMessageModal, closeMessageModalBtn].forEach(btn => {
    if (btn) {
      btn.addEventListener("click", () => {
        messageModal.style.display = "none";
      });
    }
  });

  // Gửi tin nhắn
  if (sendMessageBtn) {
    sendMessageBtn.addEventListener("click", () => {
      const content = document.getElementById("messageContent").value.trim();
      if (!content) {
        alert("Vui lòng nhập nội dung tin nhắn!");
        return;
      }

      const refundId = messageModal.dataset.refundId;
      // Giả lập gửi tin nhắn
      alert(`Đã gửi tin nhắn cho yêu cầu ${refundId}!\n\nNội dung: ${content}`);
      messageModal.style.display = "none";
    });
  }

  // Xử lý các nút trong modal chi tiết
  const approveFromDetailBtn = document.getElementById("approveFromDetailBtn");
  const rejectFromDetailBtn = document.getElementById("rejectFromDetailBtn");

  // Duyệt hoàn tiền từ modal chi tiết
  if (approveFromDetailBtn) {
    approveFromDetailBtn.addEventListener("click", () => {
      const refundId = refundDetailModal.dataset.refundId;
      if (!refundId) return;

      if (!confirm(`Bạn có chắc chắn muốn duyệt hoàn tiền cho yêu cầu ${refundId}?`)) {
        return;
      }

      const row = findRefundRow(refundId);
      if (!row) return;

      // Cập nhật trạng thái
      const statusCell = row.querySelector("td:nth-child(6)");
      if (statusCell) {
        statusCell.innerHTML = '<span class="status success">Đã hoàn tiền</span>';
        // Lưu vào localStorage
        saveRefundStatus(refundId, "Đã hoàn tiền", "success");
      }

      // Cập nhật action menu - chỉ giữ lại Xem chi tiết và Nhắn tin
      const actionMenu = row.querySelector(".action-dropdown");
      if (actionMenu) {
        actionMenu.innerHTML = `
          <button class="action-item" data-action="view" data-refund-id="${refundId}">👁 Xem chi tiết</button>
          <button class="action-item" data-action="message" data-refund-id="${refundId}">💬 Nhắn tin</button>
        `;
      }

      // Kiểm tra tab đang active và cập nhật hiển thị row
      const activeTab = document.querySelector(".tab-btn.active");
      if (activeTab) {
        const tabText = activeTab.textContent.trim();
        if (tabText === "Chờ xử lý" || tabText === "Đang xử lý") {
          // Nếu đang filter theo tab "Chờ xử lý" hoặc "Đang xử lý", ẩn row này
          row.style.display = "none";
        } else if (tabText === "Đã hoàn") {
          // Nếu đang filter theo tab "Đã hoàn", hiển thị row này
          row.style.display = "";
        }
      }

      // Cập nhật KPI và tab counts
      updateKPICounts();
      
      // Đóng modal
      refundDetailModal.style.display = "none";
      
      alert(`Đã duyệt hoàn tiền cho yêu cầu ${refundId} thành công!`);
    });
  }

  // Từ chối từ modal chi tiết
  if (rejectFromDetailBtn) {
    rejectFromDetailBtn.addEventListener("click", () => {
      const refundId = refundDetailModal.dataset.refundId;
      if (!refundId) return;

      const feedbackText = document.getElementById("refundDetailFeedbackText").value.trim();
      
      if (!feedbackText) {
        alert("Vui lòng nhập lý do từ chối trong phần 'Phản hồi của bạn'!");
        document.getElementById("refundDetailFeedbackText").focus();
        return;
      }

      if (!confirm(`Bạn có chắc chắn muốn từ chối yêu cầu ${refundId}?\nLý do: ${feedbackText}`)) {
        return;
      }

      const row = findRefundRow(refundId);
      if (!row) return;

      // Cập nhật trạng thái
      const statusCell = row.querySelector("td:nth-child(6)");
      if (statusCell) {
        statusCell.innerHTML = '<span class="status cancelled">Từ chối</span>';
        // Lưu vào localStorage
        saveRefundStatus(refundId, "Từ chối", "cancelled");
      }

      // Cập nhật action menu - Từ chối có thêm nút Xóa
      const actionMenu = row.querySelector(".action-dropdown");
      if (actionMenu) {
        actionMenu.innerHTML = `
          <button class="action-item" data-action="view" data-refund-id="${refundId}">👁 Xem chi tiết</button>
          <button class="action-item" data-action="message" data-refund-id="${refundId}">💬 Nhắn tin</button>
          <button class="action-item danger" data-action="delete" data-refund-id="${refundId}">🗑 Xóa</button>
        `;
      }

      // Kiểm tra tab đang active và cập nhật hiển thị row
      const activeTab = document.querySelector(".tab-btn.active");
      if (activeTab) {
        const tabText = activeTab.textContent.trim();
        if (tabText === "Chờ xử lý" || tabText === "Đang xử lý" || tabText === "Đã hoàn") {
          // Nếu đang filter theo các tab này, ẩn row này vì đã chuyển sang "Từ chối"
          row.style.display = "none";
        }
      }

      // Cập nhật KPI và tab counts
      updateKPICounts();
      
      // Đóng modal
      refundDetailModal.style.display = "none";
      
      alert(`Đã từ chối yêu cầu ${refundId}!`);
    });
  }

  // Đóng modal khi click bên ngoài
  [refundDetailModal, messageModal].forEach(modal => {
    if (modal) {
      modal.addEventListener("click", (e) => {
        if (e.target === modal) {
          modal.style.display = "none";
        }
      });
    }
  });

  // ========== XUẤT BÁO CÁO ==========
  const exportReportBtn = document.getElementById("exportReportBtn");
  if (exportReportBtn) {
    exportReportBtn.addEventListener("click", exportRefundReport);
  }

  function exportRefundReport() {
    const table = document.querySelector("table");
    if (!table) {
      alert("Không tìm thấy bảng dữ liệu!");
      return;
    }

    // Lấy tất cả các dòng hiển thị (không phải ẩn bởi filter)
    const rows = Array.from(table.querySelectorAll("tbody tr"))
      .filter(row => row.style.display !== "none");

    if (rows.length === 0) {
      alert("Không có dữ liệu để xuất!");
      return;
    }

    // Lấy tiêu đề cột
    const headers = Array.from(table.querySelectorAll("thead th"))
      .map(th => th.textContent.trim())
      .slice(0, -1); // Bỏ cột "THAO TÁC"

    // Tạo mảng dữ liệu CSV
    const csvData = [headers];

    // Lấy dữ liệu từng dòng
    rows.forEach(row => {
      const cells = Array.from(row.querySelectorAll("td")).slice(0, -1); // Bỏ cột "THAO TÁC"
      const rowData = cells.map((cell, index) => {
        let text = "";

        // Xử lý từng loại cột
        if (index === 0) {
          // Mã yêu cầu
          text = cell.textContent.trim();
        } else if (index === 1) {
          // Khách hàng - lấy tên và số điện thoại
          const name = cell.querySelector(".product-name")?.textContent.trim() || "";
          const phone = cell.querySelector(".product-meta")?.textContent.trim() || "";
          text = `${name} - ${phone}`;
        } else if (index === 2) {
          // Sản phẩm - lấy tên và số lượng
          const name = cell.querySelector(".product-name")?.textContent.trim() || "";
          const qty = cell.querySelector(".product-meta")?.textContent.trim() || "";
          text = `${name} (${qty})`;
        } else if (index === 3) {
          // Lý do
          text = cell.textContent.trim();
        } else if (index === 4) {
          // Số tiền
          text = cell.textContent.trim();
        } else if (index === 5) {
          // Trạng thái
          const status = cell.querySelector(".status")?.textContent.trim() || cell.textContent.trim();
          text = status;
        }

        // Escape dấu phẩy và dấu ngoặc kép trong CSV
        text = text.replace(/"/g, '""');
        if (text.includes(",") || text.includes('"') || text.includes("\n")) {
          text = `"${text}"`;
        }
        return text;
      });
      csvData.push(rowData);
    });

    // Chuyển đổi sang CSV format
    const csvContent = csvData.map(row => row.join(",")).join("\n");

    // Thêm BOM để Excel hiểu UTF-8
    const BOM = "\uFEFF";
    const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });

    // Tạo link download
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    // Tạo tên file với ngày tháng
    const now = new Date();
    const dateStr = now.toISOString().split("T")[0].replace(/-/g, "");
    const timeStr = now.toTimeString().split(" ")[0].replace(/:/g, "");
    const fileName = `BaoCaoHoanTien_${dateStr}_${timeStr}.csv`;

    link.setAttribute("href", url);
    link.setAttribute("download", fileName);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Thông báo thành công
    alert(`Đã xuất báo cáo thành công!\n\nTệp: ${fileName}\nSố dòng: ${rows.length}`);
  }
});





