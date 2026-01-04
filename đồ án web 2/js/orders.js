// ============================================
// ORDERS MODULE
// ============================================
const Orders = {
  items: [],

  init() {
    this.items = getFromStorage("orders", [])
    // Normalize all orders to ensure consistency
    this.items = this.items.map(order => normalizeOrder(order))
    return this.items
  },

  getAll() {
    // Ensure data is loaded
    if (this.items.length === 0) {
      this.init()
    }
    return this.items
  },

  getById(orderId) {
    // Ensure data is loaded
    if (this.items.length === 0) {
      this.init()
    }
    return this.items.find((o) => o.id === orderId)
  },

  getByStatus(status) {
    // Ensure data is loaded
    if (this.items.length === 0) {
      this.init()
    }
    if (status === "all") return this.items
    return this.items.filter((o) => o.status === status)
  },

  create(shippingInfo, paymentMethod) {
    const cartItems = Cart.getItems()
    if (cartItems.length === 0) {
      showToast("Giỏ hàng trống!", "error")
      return null
    }

    const subtotal = Cart.getTotal()
    const shipping = subtotal >= 500000 ? 0 : 30000
    const discount = Cart.discountAmount || 0
    const total = subtotal + shipping - discount

    const order = {
      id: "DH" + Date.now().toString().slice(-8),
      items: cartItems.map(item => ({ ...item })),
      subtotal: subtotal,
      shipping: shipping,
      shippingFee: shipping,
      discount: discount,
      total: total,
      shippingInfo: shippingInfo,
      paymentMethod: paymentMethod,
      status: "pending",
      statusText: "Chờ xác nhận",
      createdAt: new Date().toISOString(),
      date: new Date().toISOString(),
      timeline: [
        {
          status: "Đặt hàng thành công",
          time: new Date().toLocaleString("vi-VN"),
          completed: true,
        },
        {
          status: "Đang xử lý",
          time: "",
          completed: false,
        },
        {
          status: "Đang giao hàng",
          time: "",
          completed: false,
        },
        {
          status: "Đã giao hàng",
          time: "",
          completed: false,
        },
      ],
    }

    // Ensure items array is initialized
    if (this.items.length === 0) {
      this.init()
    }
    
    this.items.unshift(order)
    this.save()
    Cart.clear()

    return order
  },

  save() {
    saveToStorage("orders", this.items)
  },
}

// Normalize order data structure
function normalizeOrder(order) {
  if (!order) return null
  
  // Ensure required fields exist
  const normalized = {
    id: order.id || "DH" + Date.now(),
    createdAt: order.createdAt || order.date || new Date().toISOString(),
    date: order.date || order.createdAt || new Date().toISOString(),
    items: order.items || [],
    shippingInfo: order.shippingInfo || {},
    paymentMethod: order.paymentMethod || "cod",
    subtotal: order.subtotal || order.total || 0,
    shipping: order.shipping || order.shippingFee || 0,
    shippingFee: order.shippingFee || order.shipping || 0,
    discount: order.discount || 0,
    total: order.total || 0,
    status: order.status || "pending",
    statusText: order.statusText || getStatusText(order.status || "pending"),
    timeline: order.timeline || [
      {
        status: "Đặt hàng thành công",
        time: order.createdAt ? new Date(order.createdAt).toLocaleString("vi-VN") : new Date().toLocaleString("vi-VN"),
        completed: true,
      },
      {
        status: "Đang xử lý",
        time: "",
        completed: false,
      },
      {
        status: "Đang giao hàng",
        time: "",
        completed: false,
      },
      {
        status: "Đã giao hàng",
        time: "",
        completed: false,
      },
    ],
    returnRequests: order.returnRequests || [],
    hasReturnRequest: order.hasReturnRequest || false,
  }
  
  return normalized
}

// Get status text in Vietnamese
function getStatusText(status) {
  const statusMap = {
    pending: "Chờ xác nhận",
    confirmed: "Đã xác nhận",
    processing: "Đang xử lý",
    shipping: "Đang giao",
    delivered: "Đã giao",
    cancelled: "Đã hủy",
  }
  return statusMap[status] || "Chờ xác nhận"
}

// Get status badge class
function getStatusBadgeClass(status) {
  const classes = {
    pending: "badge-warning",
    processing: "badge-info",
    shipping: "badge-info",
    delivered: "badge-success",
    cancelled: "badge-danger",
  }
  return classes[status] || "badge-info"
}

// Render orders list
function renderOrders(container, status = "all") {
  if (!container) return

  // Initialize orders to load from storage
  Orders.init()
  const orders = Orders.getByStatus(status)

  if (orders.length === 0) {
    container.innerHTML = `
      <div class="empty-cart">
        <h2>Chưa có đơn hàng</h2>
        <p>Bạn chưa có đơn hàng nào</p>
        <a href="products.html" class="btn btn-primary">Mua sắm ngay</a>
      </div>
    `
    return
  }

  container.innerHTML = orders
    .map(
      (order) => {
        // Normalize order data
        const normalizedOrder = normalizeOrder(order)
        if (!normalizedOrder) return ""
        
        const orderDate = normalizedOrder.createdAt ? new Date(normalizedOrder.createdAt) : normalizedOrder.date ? new Date(normalizedOrder.date) : new Date()
        const orderTotal = (normalizedOrder.total || 0) + (normalizedOrder.shippingFee || normalizedOrder.shipping || 0)
        
        return `
    <div class="order-card">
      <div class="order-card-header">
        <div>
          <span class="order-id">${normalizedOrder.id}</span>
          <span class="order-date"> - ${orderDate.toLocaleDateString("vi-VN")}</span>
        </div>
        <span class="badge ${getStatusBadgeClass(normalizedOrder.status)}">${normalizedOrder.statusText || "Chờ xác nhận"}</span>
      </div>
      <div class="order-card-body">
        <div class="order-products">
          ${normalizedOrder.items && normalizedOrder.items.length > 0
            ? normalizedOrder.items
                .slice(0, 2)
                .map(
                  (item) => `
                <div class="order-product">
                  <div class="order-product-image">
                    <img src="${item.image || './public/placeholder.jpg'}" alt="${item.name || 'Sản phẩm'}" onerror="this.src='./public/placeholder.jpg'">
                  </div>
                  <div class="order-product-info">
                    <h4>${item.name || 'Sản phẩm'}</h4>
                    <p>Số lượng: ${item.quantity || 1}</p>
                  </div>
                  <div class="order-item-price">${formatCurrency((item.price || 0) * (item.quantity || 1))}</div>
                </div>
              `,
                )
                .join("")
            : "<p>Không có sản phẩm</p>"}
          ${normalizedOrder.items && normalizedOrder.items.length > 2 ? `<p class="text-muted">và ${normalizedOrder.items.length - 2} sản phẩm khác...</p>` : ""}
        </div>
        
        ${normalizedOrder.timeline && normalizedOrder.timeline.length > 0 ? `
        <div class="order-timeline">
          <div class="timeline">
            ${normalizedOrder.timeline
              .map(
                (step, index) => {
                  const currentIndex = normalizedOrder.timeline.findIndex((s) => !s.completed)
                  return `
                <div class="timeline-item ${step.completed ? "completed" : ""} ${index === currentIndex - 1 ? "current" : ""}">
                  <div class="timeline-dot"></div>
                  <div class="timeline-content">
                    <h4>${step.status || "Trạng thái"}</h4>
                    <p>${step.time || "Đang chờ"}</p>
                  </div>
                </div>
              `
                },
              )
              .join("")}
          </div>
        </div>
        ` : ""}
      </div>
      <div class="order-card-footer">
        <div class="order-total">Tổng tiền: <span>${formatCurrency(orderTotal)}</span></div>
        <div>
          <button class="btn btn-outline btn-sm" onclick="viewOrderDetail('${normalizedOrder.id}')">Chi tiết</button>
          ${normalizedOrder.status === "delivered" ? `<button class="btn btn-primary btn-sm" onclick="window.location.href='returns.html?orderId=${normalizedOrder.id}'">Đổi/Trả hàng</button>` : ""}
        </div>
      </div>
    </div>
  `
      }
    )
    .join("")
}

function viewOrderDetail(orderId) {
  Orders.init()
  const order = Orders.getById(orderId)
  if (!order) {
    showToast("Không tìm thấy đơn hàng!", "error")
    return
  }

  // Show order detail in modal
  const modal = document.getElementById("order-modal")
  const modalContent = document.getElementById("order-detail-content")
  
  if (!modal || !modalContent) {
    showToast("Chi tiết đơn hàng: " + orderId)
    return
  }

  const orderTotal = (order.total || 0) + (order.shippingFee || order.shipping || 0)
  
  modalContent.innerHTML = `
    <div style="margin-bottom: 20px;">
      <h3 style="margin-bottom: 16px; color: var(--foreground);">Thông tin đơn hàng</h3>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
        <div>
          <p style="color: var(--muted-foreground); font-size: 14px; margin-bottom: 4px;">Mã đơn hàng</p>
          <p style="font-weight: 600;">${order.id}</p>
        </div>
        <div>
          <p style="color: var(--muted-foreground); font-size: 14px; margin-bottom: 4px;">Ngày đặt</p>
          <p style="font-weight: 600;">${new Date(order.createdAt).toLocaleString("vi-VN")}</p>
        </div>
        <div>
          <p style="color: var(--muted-foreground); font-size: 14px; margin-bottom: 4px;">Trạng thái</p>
          <span class="badge ${getStatusBadgeClass(order.status)}">${order.statusText}</span>
        </div>
        <div>
          <p style="color: var(--muted-foreground); font-size: 14px; margin-bottom: 4px;">Phương thức thanh toán</p>
          <p style="font-weight: 600;">${order.paymentMethod === "cod" ? "Thanh toán khi nhận hàng" : order.paymentMethod === "bank" ? "Chuyển khoản" : "Thẻ tín dụng"}</p>
        </div>
      </div>
    </div>

    <div style="margin-bottom: 20px;">
      <h3 style="margin-bottom: 16px; color: var(--foreground);">Sản phẩm</h3>
      <div style="display: flex; flex-direction: column; gap: 12px;">
        ${order.items.map(item => `
          <div style="display: flex; gap: 16px; padding: 12px; background: var(--muted); border-radius: 8px; align-items: center;">
            <img src="${item.image || './public/placeholder.jpg'}" alt="${item.name}" 
                 style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px;" 
                 onerror="this.src='./public/placeholder.jpg'">
            <div style="flex: 1;">
              <h4 style="margin-bottom: 4px; font-size: 16px;">${item.name}</h4>
              <p style="color: var(--muted-foreground); font-size: 14px;">Số lượng: ${item.quantity}</p>
              <p style="color: var(--muted-foreground); font-size: 14px;">Đơn giá: ${formatCurrency(item.price)}</p>
            </div>
            <div style="font-weight: 600; color: var(--primary); font-size: 16px;">
              ${formatCurrency((item.price || 0) * (item.quantity || 1))}
            </div>
          </div>
        `).join("")}
      </div>
    </div>

    <div style="margin-bottom: 20px;">
      <h3 style="margin-bottom: 16px; color: var(--foreground);">Thông tin giao hàng</h3>
      <div style="background: var(--muted); padding: 16px; border-radius: 8px;">
        <p style="margin-bottom: 8px;"><strong>${order.shippingInfo.fullname || order.shippingInfo.name}</strong></p>
        <p style="margin-bottom: 4px; color: var(--muted-foreground);">${order.shippingInfo.phone}</p>
        <p style="margin-bottom: 4px; color: var(--muted-foreground);">${order.shippingInfo.email}</p>
        <p style="color: var(--muted-foreground);">${order.shippingInfo.address}, ${order.shippingInfo.district || ""}, ${order.shippingInfo.city}</p>
        ${order.shippingInfo.note ? `<p style="margin-top: 8px; color: var(--muted-foreground);"><em>Ghi chú: ${order.shippingInfo.note}</em></p>` : ""}
      </div>
    </div>

    <div style="border-top: 2px solid var(--border); padding-top: 20px;">
      <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
        <span>Tạm tính:</span>
        <span>${formatCurrency(order.subtotal || order.total || 0)}</span>
      </div>
      <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
        <span>Phí vận chuyển:</span>
        <span>${formatCurrency(order.shippingFee || order.shipping || 0)}</span>
      </div>
      ${order.discount ? `
      <div style="display: flex; justify-content: space-between; margin-bottom: 8px; color: var(--success);">
        <span>Giảm giá:</span>
        <span>-${formatCurrency(order.discount)}</span>
      </div>
      ` : ""}
      <div style="display: flex; justify-content: space-between; padding-top: 16px; border-top: 2px solid var(--border); font-size: 18px; font-weight: 700; color: var(--primary);">
        <span>Tổng cộng:</span>
        <span>${formatCurrency(orderTotal)}</span>
      </div>
    </div>

    ${order.timeline ? `
    <div style="margin-top: 24px; padding-top: 24px; border-top: 2px solid var(--border);">
      <h3 style="margin-bottom: 16px; color: var(--foreground);">Trạng thái đơn hàng</h3>
      <div style="position: relative; padding-left: 30px;">
        ${order.timeline.map((step, index) => `
          <div style="position: relative; padding-bottom: 24px;">
            <div style="position: absolute; left: -22px; top: 0; width: 16px; height: 16px; border-radius: 50%; background: ${step.completed ? 'var(--success)' : index === order.timeline.findIndex((s) => !s.completed) - 1 ? 'var(--primary)' : 'var(--border)'}; border: 3px solid white;"></div>
            <div>
              <h4 style="font-size: 14px; font-weight: 600; margin-bottom: 4px;">${step.status}</h4>
              <p style="font-size: 12px; color: var(--muted-foreground);">${step.time || "Đang chờ"}</p>
            </div>
          </div>
        `).join("")}
      </div>
    </div>
    ` : ""}
  `
  
  modal.style.display = "flex"
}

function closeModal() {
  const modal = document.getElementById("order-modal")
  if (modal) {
    modal.style.display = "none"
  }
}

// Make functions globally available
window.viewOrderDetail = viewOrderDetail
window.closeModal = closeModal

// Filter orders by tab
function filterOrders(status, element) {
  const tabs = document.querySelectorAll(".tab-btn")
  tabs.forEach((tab) => tab.classList.remove("active"))
  
  if (element) {
    element.classList.add("active")
  } else {
    // Find tab by data-status if element not provided
    const targetTab = document.querySelector(`.tab-btn[data-status="${status}"]`)
    if (targetTab) {
      targetTab.classList.add("active")
    }
  }

  const container = document.getElementById("orders-list")
  renderOrders(container, status)
}

// Make function globally available
window.filterOrders = filterOrders
