// ============================================
// RETURNS MODULE
// ============================================
// Use utility functions from utils.js (loaded before this file)
// Use Orders from orders.js (loaded before this file)

const Returns = {
  items: getFromStorage("returns", []),

  init() {
    // Load returns from localStorage
    this.items = getFromStorage("returns", [])
  },

  getAll() {
    return this.items
  },

  getByOrderId(orderId) {
    return this.items.filter(r => r.orderId === orderId)
  },

  create(orderId, productId, type, reason, description, images) {
    // Get order to validate
    const order = Orders.getById(orderId)
    if (!order) {
      showToast("Không tìm thấy đơn hàng!", "error")
      return null
    }

    // Find product in order
    const product = order.items.find(item => 
      String(item.productId || item.id) === String(productId)
    )
    
    if (!product) {
      showToast("Không tìm thấy sản phẩm trong đơn hàng!", "error")
      return null
    }

    // Create return request
    const returnRequest = {
      id: "YC" + Date.now().toString().slice(-8),
      orderId: orderId,
      productId: productId,
      product: {
        id: product.productId || product.id,
        name: product.name,
        image: product.image,
        quantity: product.quantity,
        price: product.price,
      },
      type: type, // "return" or "exchange"
      reason: reason,
      description: description || "",
      images: images || [],
      status: "pending",
      statusText: "Chờ xử lý",
      createdAt: new Date().toISOString(),
    }

    this.items.unshift(returnRequest)
    this.save()

    // Update order to include return request
    if (!order.returnRequests) {
      order.returnRequests = []
    }
    order.returnRequests.push({
      returnId: returnRequest.id,
      productId: productId,
      type: type,
      status: "pending",
      createdAt: returnRequest.createdAt,
    })
    
    // Update order status if needed
    if (order.status === "delivered") {
      // Keep delivered status but mark as having return request
      order.hasReturnRequest = true
    }
    
    Orders.save()
    showToast("Đã gửi yêu cầu đổi/trả hàng!", "success")

    return returnRequest
  },

  save() {
    saveToStorage("returns", this.items)
  },
}

// Initialize returns on load
Returns.init()

// Load delivered orders for dropdown
function loadDeliveredOrders() {
  const orderSelect = document.getElementById("order-select")
  if (!orderSelect) return

  // Ensure Orders is initialized
  if (typeof Orders !== 'undefined' && Orders.init) {
    Orders.init()
  }
  
  const deliveredOrders = Orders ? Orders.getByStatus("delivered") : []

  // Clear existing options except first one
  orderSelect.innerHTML = '<option value="">Chọn đơn hàng đã giao</option>'

  if (deliveredOrders.length === 0) {
    const option = document.createElement("option")
    option.value = ""
    option.textContent = "Không có đơn hàng đã giao"
    option.disabled = true
    orderSelect.appendChild(option)
    return
  }

  deliveredOrders.forEach(order => {
    const option = document.createElement("option")
    option.value = order.id
    const orderDate = order.createdAt 
      ? new Date(order.createdAt).toLocaleDateString("vi-VN")
      : "N/A"
    option.textContent = `${order.id} - ${orderDate} (${formatCurrency(order.total || 0)})`
    orderSelect.appendChild(option)
  })
}

// Load products from selected order
function loadOrderProducts() {
  const orderSelect = document.getElementById("order-select")
  const productSelect = document.getElementById("product-select")
  
  if (!orderSelect || !productSelect) return

  const orderId = orderSelect.value
  if (!orderId) {
    productSelect.disabled = true
    productSelect.innerHTML = '<option value="">Chọn sản phẩm cần đổi/trả</option>'
    return
  }

  // Ensure Orders is initialized
  if (typeof Orders !== 'undefined' && Orders.init) {
    Orders.init()
  }

  if (!Orders) {
    productSelect.disabled = true
    productSelect.innerHTML = '<option value="">Lỗi: Không tìm thấy module Orders</option>'
    return
  }

  const order = Orders.getById(orderId)
  if (!order || !order.items) {
    productSelect.disabled = true
    productSelect.innerHTML = '<option value="">Không tìm thấy đơn hàng</option>'
    return
  }

  // Enable and populate product select
  productSelect.disabled = false
  productSelect.innerHTML = '<option value="">Chọn sản phẩm cần đổi/trả</option>'
  
  order.items.forEach(item => {
    const option = document.createElement("option")
    option.value = item.productId || item.id
    option.textContent = `${item.name} (Số lượng: ${item.quantity})`
    productSelect.appendChild(option)
  })
}

// Render returns list
function renderReturns(container) {
  if (!container) return

  // Re-initialize to get latest data
  Returns.init()
  if (typeof Orders !== 'undefined' && Orders.init) {
    Orders.init()
  }
  
  const returns = Returns.getAll()

  const emptyState = document.getElementById("empty-returns")
  if (emptyState) {
    emptyState.style.display = returns.length === 0 ? "block" : "none"
  }

  if (returns.length === 0) {
    container.innerHTML = ""
    return
  }

  container.innerHTML = returns
    .map(
      (ret) => {
        const order = Orders && typeof Orders.getById === 'function' 
          ? Orders.getById(ret.orderId) 
          : null
        const orderInfo = order ? ` - Đơn: ${ret.orderId}` : ""
        
        return `
    <div class="return-card">
      <div class="return-card-header">
        <div>
          <strong>${ret.id}</strong>
          <span class="text-muted">${orderInfo}</span>
        </div>
        <span class="badge ${ret.status === "pending" ? "badge-warning" : ret.status === "approved" ? "badge-success" : "badge-danger"}">${ret.statusText || "Chờ xử lý"}</span>
      </div>
      <div style="margin-top: 12px;">
        ${ret.product ? `
        <div style="display: flex; gap: 12px; margin-bottom: 12px;">
          <img src="${ret.product.image || ''}" alt="${ret.product.name || ''}" 
               style="width: 60px; height: 60px; object-fit: cover; border-radius: var(--radius);" 
               onerror="this.src='https://via.placeholder.com/60'">
          <div style="flex: 1;">
            <p style="font-weight: 500; margin-bottom: 4px;">${ret.product.name || 'Sản phẩm'}</p>
            <p style="font-size: 12px; color: var(--muted-foreground);">Số lượng: ${ret.product.quantity || 1}</p>
          </div>
        </div>
        ` : ''}
        <p style="margin-bottom: 8px;"><strong>Loại:</strong> ${ret.type === "return" ? "Trả hàng hoàn tiền" : "Đổi hàng"}</p>
        <p style="margin-bottom: 8px;"><strong>Lý do:</strong> ${ret.reason || "N/A"}</p>
        ${ret.description ? `<p style="margin-bottom: 8px; color: var(--muted-foreground); font-size: 14px;">${ret.description}</p>` : ''}
        ${ret.images && ret.images.length > 0 ? `
        <div style="margin-top: 12px; margin-bottom: 8px;">
          <p style="font-size: 12px; color: var(--muted-foreground); margin-bottom: 8px;">Hình ảnh đính kèm (${ret.images.length}):</p>
          <div style="display: flex; gap: 8px; flex-wrap: wrap;">
            ${ret.images.slice(0, 3).map((img, idx) => `
              <img src="${img}" 
                   alt="Hình ${idx + 1}" 
                   onclick="viewImageModal('${img}')"
                   style="width: 60px; height: 60px; object-fit: cover; border-radius: 6px; cursor: pointer; border: 2px solid var(--border); transition: transform 0.2s;"
                   onmouseover="this.style.transform='scale(1.1)'"
                   onmouseout="this.style.transform='scale(1)'"
                   title="Click để xem ảnh lớn">
            `).join('')}
            ${ret.images.length > 3 ? `<div style="width: 60px; height: 60px; border-radius: 6px; background: var(--muted); display: flex; align-items: center; justify-content: center; font-size: 12px; color: var(--muted-foreground); border: 2px solid var(--border);">+${ret.images.length - 3}</div>` : ''}
          </div>
        </div>
        ` : ''}
        <p class="text-muted" style="font-size: 12px;">Ngày tạo: ${ret.createdAt ? new Date(ret.createdAt).toLocaleString("vi-VN") : "N/A"}</p>
      </div>
    </div>
  `
      },
    )
    .join("")
}

// Handle return form submission
function handleReturnSubmit(event) {
  event.preventDefault()

  const formData = new FormData(event.target)
  const orderId = formData.get("orderId")
  const productId = formData.get("productId")
  const type = formData.get("type") || "return"
  const reason = formData.get("reason")
  const description = formData.get("description")

  // Validate
  if (!orderId || !productId || !reason) {
    showToast("Vui lòng điền đầy đủ thông tin!", "error")
    return
  }

  // Get image files if any (async processing)
  const imageInput = document.getElementById("image-input")
  
  if (imageInput && imageInput.files.length > 0) {
    // Process images asynchronously
    const imagePromises = []
    Array.from(imageInput.files).slice(0, 5).forEach((file) => {
      const promise = new Promise((resolve) => {
        const reader = new FileReader()
        reader.onload = (e) => resolve(e.target.result)
        reader.onerror = () => resolve(null)
        reader.readAsDataURL(file)
      })
      imagePromises.push(promise)
    })

    // Wait for all images to load
    Promise.all(imagePromises).then((images) => {
      const validImages = images.filter(img => img !== null)
      submitReturnRequest(orderId, productId, type, reason, description, validImages)
    })
  } else {
    // No images, submit immediately
    submitReturnRequest(orderId, productId, type, reason, description, [])
  }
}

// Submit return request
function submitReturnRequest(orderId, productId, type, reason, description, images) {
  // Ensure Orders is initialized
  if (typeof Orders !== 'undefined' && Orders.init) {
    Orders.init()
  }

  // Get reason text
  const reasonSelect = document.querySelector(`select[name="reason"]`)
  const reasonText = reasonSelect 
    ? (reasonSelect.options[reasonSelect.selectedIndex]?.text || reason)
    : reason

  // Create return request
  const returnRequest = Returns.create(
    orderId,
    productId,
    type,
    reasonText,
    description,
    images
  )

  if (returnRequest) {
    // Reset form
    const form = document.getElementById("return-form")
    if (form) form.reset()
    
    const productSelect = document.getElementById("product-select")
    if (productSelect) productSelect.disabled = true
    
    // Clear image input and preview
    const imageInput = document.getElementById("image-input")
    if (imageInput) imageInput.value = ""
    const imagePreview = document.getElementById("image-preview")
    if (imagePreview) {
      imagePreview.style.display = "none"
      const previewGrid = document.getElementById("image-preview-grid")
      if (previewGrid) previewGrid.innerHTML = ""
    }

    // Refresh lists
    loadDeliveredOrders()
    const container = document.getElementById("returns-list")
    renderReturns(container)

    // Scroll to returns list
    setTimeout(() => {
      const returnsList = document.getElementById("returns-list")
      if (returnsList) {
        returnsList.scrollIntoView({ behavior: "smooth", block: "start" })
      }
    }, 100)
  }
}

// Handle image preview
function handleImagePreview(event) {
  const files = event.target.files
  const previewContainer = document.getElementById("image-preview")
  const previewGrid = document.getElementById("image-preview-grid")
  
  if (!previewContainer || !previewGrid) return

  if (files.length === 0) {
    previewContainer.style.display = "none"
    previewGrid.innerHTML = ""
    return
  }

  // Limit to 5 images
  const filesArray = Array.from(files).slice(0, 5)
  
  previewGrid.innerHTML = ""
  previewContainer.style.display = "block"

  filesArray.forEach((file, index) => {
    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      showToast(`Ảnh ${file.name} vượt quá 5MB!`, "error")
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const previewItem = document.createElement("div")
      previewItem.style.position = "relative"
      previewItem.innerHTML = `
        <img src="${e.target.result}" 
             alt="Preview ${index + 1}" 
             style="width: 100%; height: 100px; object-fit: cover; border-radius: 8px; border: 2px solid var(--border);">
        <button type="button" 
                onclick="removeImagePreview(${index})" 
                style="position: absolute; top: -8px; right: -8px; background: var(--danger); color: white; border: none; border-radius: 50%; width: 24px; height: 24px; cursor: pointer; font-size: 14px; display: flex; align-items: center; justify-content: center;"
                title="Xóa ảnh">&times;</button>
      `
      previewGrid.appendChild(previewItem)
    }
    reader.readAsDataURL(file)
  })
}

// Remove image from preview
function removeImagePreview(index) {
  const imageInput = document.getElementById("image-input")
  if (!imageInput) return

  const dt = new DataTransfer()
  const files = Array.from(imageInput.files)
  
  files.forEach((file, i) => {
    if (i !== index) {
      dt.items.add(file)
    }
  })
  
  imageInput.files = dt.files
  handleImagePreview({ target: imageInput })
}

// Make functions globally available
window.loadDeliveredOrders = loadDeliveredOrders
window.loadOrderProducts = loadOrderProducts
window.renderReturns = renderReturns
window.handleReturnSubmit = handleReturnSubmit
window.handleImagePreview = handleImagePreview
window.removeImagePreview = removeImagePreview

// View image in modal
function viewImageModal(imageSrc) {
  const modal = document.createElement("div")
  modal.style.cssText = `
    position: fixed; top: 0; left: 0; right: 0; bottom: 0; 
    background: rgba(0,0,0,0.9); z-index: 9999; 
    display: flex; align-items: center; justify-content: center;
    cursor: pointer;
  `
  modal.onclick = () => modal.remove()
  
  const img = document.createElement("img")
  img.src = imageSrc
  img.style.cssText = `
    max-width: 90%; max-height: 90%; 
    object-fit: contain; border-radius: 8px;
  `
  img.onclick = (e) => e.stopPropagation()
  
  modal.appendChild(img)
  document.body.appendChild(modal)
}

window.viewImageModal = viewImageModal
