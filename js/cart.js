// Cart Management JavaScript

// Format price to VND
function formatPrice(price) {
  if (!price) return '0 ₫';
  const numPrice = parseFloat(price) || 0;
  return numPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' ₫';
}

// Get cart from localStorage
function getCart() {
  try {
    const cartRaw = localStorage.getItem('cart');
    if (!cartRaw) return [];
    return JSON.parse(cartRaw);
  } catch (e) {
    console.error('Error loading cart:', e);
    return [];
  }
}

// Save cart to localStorage
function saveCart(cart) {
  try {
    localStorage.setItem('cart', JSON.stringify(cart));
  } catch (e) {
    console.error('Error saving cart:', e);
  }
}

// Get product by ID from all products
function getCartProduct(productId) {
  console.log('getCartProduct called with productId:', productId);
  if (typeof getAllProducts === 'function') {
    const products = getAllProducts();
    console.log('getAllProducts returned:', products);
    const product = products.find(p => p.id === productId);
    console.log('found product:', product);
    return product;
  }
  console.error('getAllProducts is not a function!');
  return null;
}

// Render cart items
function renderCart() {
  const cart = getCart();
  console.log('renderCart: cart =', cart);
  const cartItemsContainer = document.getElementById('cartItems');
  const emptyCart = document.getElementById('emptyCart');
  const cartContent = document.getElementById('cartContent');
  
  if (!cartItemsContainer) return;
  
  if (cart.length === 0) {
    if (emptyCart) emptyCart.style.display = 'flex';
    if (cartContent) cartContent.style.display = 'none';
    updateCartSummary(0, 0);
    updateCartBadge();
    return;
  }
  
  if (emptyCart) emptyCart.style.display = 'none';
  if (cartContent) cartContent.style.display = 'block';
  
  cartItemsContainer.innerHTML = '';
  
  let subtotal = 0;
  
  cart.forEach((item, index) => {
    const product = getCartProduct(item.id);
    if (!product) {
      console.warn('Product not found for cart item:', item);
      // Không xóa sản phẩm khỏi giỏ, chỉ hiển thị thông báo lỗi
      const cartItem = document.createElement('div');
      cartItem.className = 'cart-item';
      cartItem.innerHTML = `
        <div class="cart-item-info">
          <div class="cart-item-name">Sản phẩm không tồn tại (ID: ${item.id})</div>
          <div class="cart-item-price">-</div>
          <button class="cart-item-remove" onclick="removeFromCart(${item.id})" title="Xóa sản phẩm">
            <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2"/>
            </svg>
          </button>
        </div>
      `;
      cartItemsContainer.appendChild(cartItem);
      return;
    }
    
    const itemTotal = (product.price || 0) * (item.quantity || 1);
    subtotal += itemTotal;
    
    const cartItem = document.createElement('div');
    cartItem.className = 'cart-item';
    cartItem.dataset.productId = item.id;
    
    cartItem.innerHTML = `
      <div class="cart-item-image">
        <img src="${product.image || 'https://via.placeholder.com/120?text=Product'}" alt="${product.name || 'Sản phẩm'}" onerror="this.src='https://via.placeholder.com/120?text=Product'" />
      </div>
      <div class="cart-item-info">
        <div class="cart-item-header">
          <div class="cart-item-name">${product.name || 'Sản phẩm'}</div>
          <button class="cart-item-remove" onclick="removeFromCart(${item.id})" title="Xóa sản phẩm">
            <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2"/>
            </svg>
          </button>
        </div>
        <div class="cart-item-price">${formatPrice(product.price || 0)}</div>
        <div class="cart-item-controls">
          <div class="quantity-control">
            <button class="quantity-btn" onclick="updateQuantity(${item.id}, ${(item.quantity || 1) - 1})" title="Giảm số lượng">
              <svg viewBox="0 0 24 24" fill="none" width="16" height="16">
                <path d="M5 12h14" stroke="currentColor" stroke-width="2"/>
              </svg>
            </button>
            <input type="number" class="quantity-input" value="${item.quantity || 1}" min="1" 
                   onchange="updateQuantity(${item.id}, parseInt(this.value) || 1)" 
                   onblur="if(!this.value || parseInt(this.value) < 1) { this.value = 1; updateQuantity(${item.id}, 1); }" />
            <button class="quantity-btn" onclick="updateQuantity(${item.id}, ${(item.quantity || 1) + 1})" title="Tăng số lượng">
              <svg viewBox="0 0 24 24" fill="none" width="16" height="16">
                <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2"/>
              </svg>
            </button>
          </div>
          <div class="cart-item-total">${formatPrice(itemTotal)}</div>
        </div>
      </div>
    `;
    
    cartItemsContainer.appendChild(cartItem);
  });
  
  updateCartSummary(subtotal, cart.length);
  updateCartBadge();
}

// Update cart summary
function updateCartSummary(subtotal, itemCount) {
  const subtotalEl = document.getElementById('subtotal');
  const totalEl = document.getElementById('total');
  
  if (subtotalEl) subtotalEl.textContent = formatPrice(subtotal);
  if (totalEl) totalEl.textContent = formatPrice(subtotal);
}

// Update quantity
function updateQuantity(productId, newQuantity) {
  if (newQuantity < 1) {
    removeFromCart(productId);
    return;
  }
  
  const cart = getCart();
  const item = cart.find(item => item.id === productId);
  
  if (item) {
    item.quantity = newQuantity;
    saveCart(cart);
    renderCart();
  }
}

// Remove item from cart
function removeFromCart(productId) {
  if (!confirm('Bạn có chắc muốn xóa sản phẩm này khỏi giỏ hàng?')) {
    return;
  }
  
  const cart = getCart();
  const newCart = cart.filter(item => item.id !== productId);
  saveCart(newCart);
  renderCart();
  
  // Show notification
  if (typeof showNotification === 'function') {
    showNotification('Đã xóa sản phẩm khỏi giỏ hàng', 'info');
  }
}

// Clear all cart
function clearCart() {
  if (!confirm('Bạn có chắc muốn xóa tất cả sản phẩm khỏi giỏ hàng?')) {
    return;
  }
  
  saveCart([]);
  renderCart();
  
  // Show notification
  if (typeof showNotification === 'function') {
    showNotification('Đã xóa tất cả sản phẩm khỏi giỏ hàng', 'info');
  }
}

// Checkout
function checkout() {
  const cart = getCart();
  
  if (cart.length === 0) {
    alert('Giỏ hàng của bạn đang trống!');
    return;
  }
  
  // Calculate total
  let total = 0;
  cart.forEach(item => {
    const product = getCartProduct(item.id);
    if (product) {
      total += (product.price || 0) * (item.quantity || 1);
    }
  });
  
  // Show checkout confirmation
  if (confirm(`Xác nhận thanh toán đơn hàng với tổng tiền: ${formatPrice(total)}?`)) {
    // Tạo đơn hàng mới và lưu vào localStorage để trang quản lý đơn hàng đọc được
    try {
      // Chuẩn bị danh sách sản phẩm trong đơn
      const orderProducts = [];
      cart.forEach(item => {
        const product = getCartProduct(item.id);
        if (!product) return;
        orderProducts.push({
          productId: product.id,
          name: product.name,
          quantity: item.quantity || 1,
          price: product.price || 0,
          emoji: '📦'
        });
      });

      // Nếu vì lý do nào đó không có sản phẩm hợp lệ thì không tạo đơn
      if (orderProducts.length === 0) {
        alert('Không thể tạo đơn hàng vì không tìm thấy thông tin sản phẩm.');
        return;
      }

      // Đọc danh sách đơn hiện tại
      let existingOrders = [];
      try {
        const raw = localStorage.getItem('orders');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) existingOrders = parsed;
        }
      } catch (e) {
        console.error('Lỗi khi đọc orders từ localStorage:', e);
      }

      // Tạo mã đơn đơn giản, tránh trùng bằng timestamp
      const codeSuffix = Date.now().toString().slice(-5);
      const orderCode = `#DH-${codeSuffix}`;

      const newOrder = {
        code: orderCode,
        customer: {
          name: 'Khách hàng Online',
          phone: '',
          email: '',
          avatar: 'KO'
        },
        products: orderProducts,
        total: total,
        payment: {
          method: 'COD',
          paid: false
        },
        status: 'pending',
        createdAt: new Date().toISOString(),
        shippingAddress: '',
        note: ''
      };

      existingOrders.push(newOrder);

      try {
        localStorage.setItem('orders', JSON.stringify(existingOrders));
      } catch (e) {
        console.error('Lỗi khi lưu orders vào localStorage:', e);
      }

      alert('Đặt hàng thành công! Mã đơn của bạn là ' + orderCode + '. Tổng tiền: ' + formatPrice(total));

      // Sau khi tạo đơn, có thể xóa giỏ hàng để tránh đặt trùng
      saveCart([]);
      renderCart();
    } catch (e) {
      console.error('Lỗi khi tạo đơn hàng từ giỏ hàng:', e);
      alert('Có lỗi xảy ra khi tạo đơn hàng. Vui lòng thử lại.');
    }
  }
}

// Update cart badge in sidebar
function updateCartBadge() {
  const cart = getCart();
  const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
  
  const badge = document.getElementById('sidebarCartBadge');
  if (badge) {
    badge.textContent = totalItems;
    // Luôn hiện badge, nếu 0 thì hiện số 0
    badge.style.display = 'inline-block';
  }
  
  // Also update cart badge in other pages if function exists
  if (typeof window.updateCartBadge === 'function' && window.updateCartBadge !== updateCartBadge) {
    window.updateCartBadge();
  }
}

// Initialize cart page
document.addEventListener('DOMContentLoaded', function() {
  renderCart();
  
  // Update cart badge on load
  updateCartBadge();
});

// Expose functions globally
window.updateQuantity = updateQuantity;
window.removeFromCart = removeFromCart;
window.clearCart = clearCart;
window.checkout = checkout;
window.renderCart = renderCart;
window.updateCartBadge = updateCartBadge;





