// ============================================
// CHECKOUT MODULE
// ============================================

// Use Cart from cart.js (loaded before this file)
// Use formatCurrency from utils.js (loaded before this file)
// Use showToast from utils.js (loaded before this file)
// Use saveToStorage, getFromStorage from utils.js

// Render checkout items
function renderCheckoutItems() {
  const container = document.getElementById("order-items")
  if (!container) return

  const items = Cart.getItems()

  if (items.length === 0) {
    container.innerHTML = '<p style="text-align: center; color: var(--muted-foreground); padding: 20px;">Giỏ hàng trống</p>'
    window.location.href = "cart.htm"
    return
  }

  container.innerHTML = items
    .map(
      (item) => {
        const itemTotal = item.price * item.quantity
        return `
    <div class="order-item">
      <div class="order-item-image">
        <img src="${item.image}" alt="${item.name}" onerror="this.onerror=null; this.src='./public/placeholder.jpg';">
      </div>
      <div class="order-item-info">
        <h4>${item.name}</h4>
        <p>Số lượng: ${item.quantity} x ${formatCurrency(item.price)}</p>
      </div>
      <div class="order-item-price">${formatCurrency(itemTotal)}</div>
    </div>
  `
      }
    )
    .join("")

  // Update totals
  const subtotal = Cart.getTotal()
  const shipping = subtotal >= 500000 ? 0 : 30000
  const discount = Cart.discountAmount || 0
  const total = subtotal + shipping - discount

  const subtotalEl = document.getElementById("subtotal")
  const shippingEl = document.getElementById("shipping")
  const discountEl = document.getElementById("discount")
  const totalEl = document.getElementById("total")

  if (subtotalEl) subtotalEl.textContent = formatCurrency(subtotal)
  if (shippingEl) {
    shippingEl.textContent = shipping === 0 ? "Miễn phí" : formatCurrency(shipping)
    shippingEl.style.color = shipping === 0 ? "#22c55e" : "inherit"
  }
  if (discountEl) {
    discountEl.textContent = discount > 0 ? `-${formatCurrency(discount)}` : "-0đ"
    discountEl.style.color = discount > 0 ? "#22c55e" : "inherit"
  }
  if (totalEl) {
    totalEl.textContent = formatCurrency(total)
    totalEl.style.color = "var(--primary)"
  }
}

// Select payment method
function selectPayment(element) {
  const options = document.querySelectorAll(".payment-option")
  options.forEach((opt) => opt.classList.remove("active"))
  element.classList.add("active")
  element.querySelector('input[type="radio"]').checked = true
}

// Handle checkout form submission
function handleCheckout(event) {
  event.preventDefault()

  const formData = new FormData(event.target)
  const shippingInfo = {
    fullname: formData.get("fullname"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    city: formData.get("city"),
    district: formData.get("district"),
    address: formData.get("address"),
    note: formData.get("note") || "",
  }

  const paymentMethod = formData.get("payment") || "cod"

  // Validate
  if (!shippingInfo.fullname || !shippingInfo.phone || !shippingInfo.email || !shippingInfo.address || !shippingInfo.city || !shippingInfo.district) {
    showToast("Vui lòng điền đầy đủ thông tin giao hàng!", "error")
    return
  }

  // Calculate totals
  const subtotal = Cart.getTotal()
  const shipping = subtotal >= 500000 ? 0 : 30000
  const discount = Cart.discountAmount || 0
  const total = subtotal + shipping - discount

  // Create order with full format
  const order = {
    id: "DH" + Date.now().toString().slice(-8),
    createdAt: new Date().toISOString(),
    date: new Date().toISOString(), // Keep for backward compatibility
    items: Cart.getItems().map(item => ({ ...item })), // Create copy of items
    shippingInfo: shippingInfo,
    paymentMethod: paymentMethod,
    subtotal: subtotal,
    shipping: shipping,
    shippingFee: shipping, // Add both for compatibility
    discount: discount,
    total: total,
    status: "pending",
    statusText: "Chờ xác nhận",
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

  // Save order
  const orders = getFromStorage("orders", [])
  orders.unshift(order)
  saveToStorage("orders", orders)

  // Clear cart
  Cart.clear()

  showToast("Đặt hàng thành công!", "success")
  setTimeout(() => {
    window.location.href = "orders.html"
  }, 1500)
}
