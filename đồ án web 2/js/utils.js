// ============================================
// UTILITY FUNCTIONS
// ============================================
function formatCurrency(amount) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount)
}

function saveToStorage(key, data) {
  localStorage.setItem(key, JSON.stringify(data))
}

function getFromStorage(key, defaultValue = null) {
  const data = localStorage.getItem(key)
  return data ? JSON.parse(data) : defaultValue
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

function showToast(message, type = "success") {
  const container = document.getElementById("toast-container") || createToastContainer()
  const toast = document.createElement("div")
  toast.className = `toast ${type}`
  toast.innerHTML = `
    <span>${type === "success" ? "✓" : "✕"}</span>
    <span>${message}</span>
  `
  container.appendChild(toast)

  setTimeout(() => {
    toast.remove()
  }, 3000)
}

function createToastContainer() {
  const container = document.createElement("div")
  container.id = "toast-container"
  container.className = "toast-container"
  document.body.appendChild(container)
  return container
}

function getUrlParam(param) {
  const urlParams = new URLSearchParams(window.location.search)
  return urlParams.get(param)
}
