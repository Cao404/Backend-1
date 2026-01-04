// ============================================
// CART MODULE
// ============================================

// Use utility functions from utils.js (loaded before this file)
// Use AppData from data.js (loaded before this file)

const Cart = {
  items: getFromStorage("cart", []),
  discountAmount: 0,

  getItems() {
    return this.items
  },

  addItem(productId, quantity = 1) {
    const product = AppData.getProductById(productId)
    if (!product) {
      showToast("Không tìm thấy sản phẩm!")
      return
    }

    const existingItem = this.items.find((item) => item.productId === productId)

    if (existingItem) {
      existingItem.quantity += quantity
    } else {
      this.items.push({
        id: generateId(),
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: quantity,
      })
    }

    this.save()
    this.updateCount()
    showToast("Đã thêm vào giỏ hàng!")
  },

  removeItem(itemId) {
    // Convert to string for comparison to handle both string and number IDs
    const idToRemove = String(itemId)
    const beforeCount = this.items.length
    
    this.items = this.items.filter((item) => {
      return String(item.id) !== idToRemove
    })
    
    const removed = beforeCount - this.items.length
    
    if (removed > 0) {
      this.save()
      this.updateCount()
      
      // Reset discount if cart is empty
      if (this.items.length === 0) {
        this.discountAmount = 0
        this.save()
      }
      
      showToast("Đã xóa khỏi giỏ hàng", "success")
    } else {
      showToast("Không tìm thấy sản phẩm để xóa!", "error")
    }
  },

  updateQuantity(itemId, quantity) {
    const item = this.items.find((i) => i.id === itemId)
    if (item) {
      item.quantity = Math.max(1, quantity)
      this.save()
    }
  },

  getTotal() {
    return this.items.reduce((total, item) => total + item.price * item.quantity, 0)
  },

  getCount() {
    return this.items.reduce((count, item) => count + item.quantity, 0)
  },

  clear() {
    this.items = []
    this.save()
    this.updateCount()
  },

  save() {
    saveToStorage("cart", this.items)
  },

  updateCount() {
    const cartCountElements = document.querySelectorAll(".cart-count")
    const count = this.getCount()
    cartCountElements.forEach((el) => {
      el.textContent = count
      el.style.display = count > 0 ? "flex" : "none"
    })
  },

  render() {
    renderCart()
    this.updateSummary()
  },

  updateSummary() {
    const items = this.getItems()
    const subtotal = this.getTotal()
    const shipping = subtotal >= 500000 ? 0 : 30000
    const discount = this.discountAmount || 0
    const total = subtotal + shipping - discount

    // Update summary elements
    const subtotalEl = document.getElementById("subtotal")
    const shippingEl = document.getElementById("shipping")
    const discountEl = document.getElementById("discount")
    const totalEl = document.getElementById("total")
    const checkoutBtn = document.getElementById("checkout-btn")

    if (subtotalEl) subtotalEl.textContent = formatCurrency(subtotal)
    if (shippingEl) {
      shippingEl.textContent = shipping === 0 ? "Miễn phí" : formatCurrency(shipping)
      shippingEl.style.color = shipping === 0 ? "#22c55e" : "inherit"
    }
    if (discountEl) {
      discountEl.textContent = discount > 0 ? `-${formatCurrency(discount)}` : "-0đ"
      discountEl.style.color = discount > 0 ? "#22c55e" : "inherit"
    }
    if (totalEl) totalEl.textContent = formatCurrency(total)
    if (checkoutBtn) {
      checkoutBtn.style.display = items.length > 0 ? "block" : "none"
    }

    // Show/hide empty cart
    const emptyCart = document.getElementById("empty-cart")
    const cartItems = document.getElementById("cart-items")
    if (emptyCart && cartItems) {
      if (items.length === 0) {
        emptyCart.style.display = "block"
        cartItems.style.display = "none"
      } else {
        emptyCart.style.display = "none"
        cartItems.style.display = "block"
      }
    }
  },

  applyCoupon() {
    const couponInput = document.getElementById("coupon-input")
    const coupon = couponInput?.value.trim().toUpperCase()
    
    if (!coupon) {
      showToast("Vui lòng nhập mã giảm giá!")
      return
    }

    // Simple coupon logic
    const coupons = {
      "WELCOME10": 0.1,
      "SAVE20": 0.2,
      "VIP30": 0.3,
    }

    if (coupons[coupon]) {
      const subtotal = this.getTotal()
      this.discountAmount = Math.floor(subtotal * coupons[coupon])
      this.save()
      this.updateSummary()
      showToast(`Áp dụng mã giảm giá thành công! Giảm ${formatCurrency(this.discountAmount)}`)
      if (couponInput) couponInput.value = ""
    } else {
      showToast("Mã giảm giá không hợp lệ!")
    }
  },
}

// Cart helper functions
function addToCart(productId, quantity = 1) {
  Cart.addItem(productId, quantity)
}

function removeFromCart(itemId) {
  if (!itemId) {
    showToast("Lỗi: Không có ID sản phẩm!", "error")
    return
  }
  
  // Find item to get name for confirmation
  const item = Cart.items.find(i => String(i.id) === String(itemId))
  
  if (!item) {
    showToast("Không tìm thấy sản phẩm để xóa!", "error")
    return
  }
  
  const itemName = item.name || 'sản phẩm'
  
  // Confirm before removing
  if (confirm(`Bạn có chắc chắn muốn xóa "${itemName}" khỏi giỏ hàng?`)) {
    Cart.removeItem(itemId)
    Cart.render()
    Cart.updateCount()
  }
}

// Make function globally available
window.removeFromCart = removeFromCart

function updateCartQuantity(itemId, quantity) {
  Cart.updateQuantity(itemId, quantity)
  Cart.render()
  Cart.updateCount()
}

// Make function globally available
window.updateCartQuantity = updateCartQuantity

// Render cart page
function renderCart() {
  const cartItemsContainer = document.getElementById("cart-items")
  const cartSummary = document.getElementById("cart-summary")

  if (!cartItemsContainer) return

  const items = Cart.getItems()

  if (items.length === 0) {
    cartItemsContainer.innerHTML = `
      <div class="empty-cart">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <h2>Giỏ hàng trống</h2>
        <p>Bạn chưa có sản phẩm nào trong giỏ hàng</p>
        <a href="products.html" class="btn btn-primary">Tiếp tục mua sắm</a>
      </div>
    `
    if (cartSummary) cartSummary.style.display = "none"
    return
  }

  if (cartSummary) cartSummary.style.display = "block"

  cartItemsContainer.innerHTML = `
    <div class="cart-header">Giỏ hàng của bạn (${Cart.getCount()} sản phẩm)</div>
    ${items
      .map(
        (item) => {
          const itemTotal = item.price * item.quantity
          return `
      <div class="cart-item">
        <div class="cart-item-image">
          <img src="${item.image}" alt="${item.name}" onerror="this.onerror=null; this.src='./public/placeholder.jpg';">
        </div>
        <div class="cart-item-info">
          <h3>${item.name}</h3>
          <div class="cart-item-details">
            <span class="cart-item-unit-price">Đơn giá: ${formatCurrency(item.price)}</span>
          </div>
          <div class="cart-item-actions">
            <div class="quantity-input">
              <button onclick="updateCartQuantity('${item.id}', ${item.quantity - 1})" ${item.quantity <= 1 ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : ''}>-</button>
              <input type="number" value="${item.quantity}" min="1" readonly id="qty-${item.id}">
              <button onclick="updateCartQuantity('${item.id}', ${item.quantity + 1})">+</button>
            </div>
            <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 12px;">
              <p class="cart-item-price">${formatCurrency(itemTotal)}</p>
              <button class="remove-btn" onclick="removeFromCart('${item.id}')" type="button" title="Xóa sản phẩm" data-item-id="${item.id}">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Xóa
              </button>
            </div>
          </div>
        </div>
      </div>
    `
        }
      )
      .join("")}
  `

  // Update summary will be handled by Cart.updateSummary()
  Cart.updateSummary()
}
