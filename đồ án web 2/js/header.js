// ============================================
// HEADER MODULE
// ============================================

// Declare Auth and Cart variables
const Auth = {
  isLoggedIn: () => {
    // Implementation here
  },
  getUser: () => {
    // Implementation here
  },
}

const Cart = {
  updateCount: () => {
    // Implementation here
  },
}

// Update header based on auth state
function updateHeader() {
  const userActions = document.getElementById("user-actions")
  if (!userActions) return

  if (Auth.isLoggedIn()) {
    const user = Auth.getUser()
    userActions.innerHTML = `
      <a href="orders.html" style="display: flex; flex-direction: column; align-items: center; font-size: 12px; text-decoration: none; color: var(--foreground);">
        <img src="https://via.placeholder.com/24x24/4A90E2/FFFFFF?text=📦" alt="Đơn hàng" style="width: 24px; height: 24px; margin-bottom: 4px;">
        Đơn hàng
      </a>
      <div class="user-dropdown">
        <a href="#" onclick="event.preventDefault()" style="display: flex; flex-direction: column; align-items: center; font-size: 12px; text-decoration: none; color: var(--foreground);">
          <img src="images/user-icon.png" alt="User" style="width: 24px; height: 24px; margin-bottom: 4px;">
          ${user.name}
        </a>
        <div class="dropdown-menu">
          <a href="orders.html">Đơn hàng của tôi</a>
          <a href="returns.html">Đổi/Trả hàng</a>
          <a href="#" onclick="logout()">Đăng xuất</a>
        </div>
      </div>
    `
  } else {
    userActions.innerHTML = `
      <a href="login.html" style="display: flex; flex-direction: column; align-items: center; font-size: 12px; text-decoration: none; color: var(--foreground);">
        <img src="images/user-icon.png" alt="Đăng nhập" style="width: 24px; height: 24px; margin-bottom: 4px;">
        Đăng nhập
      </a>
    `
  }

  // Update cart count
  Cart.updateCount()
}

// Initialize search functionality
function initSearch() {
  // Find all search boxes on the page
  const searchBoxes = document.querySelectorAll(".search-box")
  
  if (searchBoxes.length === 0) {
    return
  }
  
  searchBoxes.forEach((searchBox) => {
    const searchInput = searchBox.querySelector("input[type='text']")
    const searchButton = searchBox.querySelector("button")
    
    if (!searchInput) return
    
    // Check if suggestions container already exists
    let suggestionsContainer = searchBox.querySelector(".search-suggestions")
    if (!suggestionsContainer) {
      // Create search suggestions dropdown
      suggestionsContainer = document.createElement("div")
      suggestionsContainer.className = "search-suggestions"
      suggestionsContainer.style.display = "none"
      searchBox.appendChild(suggestionsContainer)
    }
    
    // Handle input typing
    let searchTimeout
    searchInput.addEventListener("input", (e) => {
      const query = e.target.value.trim()
      
      clearTimeout(searchTimeout)
      
      if (query.length === 0) {
        suggestionsContainer.style.display = "none"
        return
      }
      
      // Show suggestions immediately for 1+ characters, with debounce for performance
      if (query.length >= 1) {
        // Show immediately first
        showSearchSuggestions(query, suggestionsContainer, searchInput)
        
        // Then update with debounce for better performance
        searchTimeout = setTimeout(() => {
          showSearchSuggestions(query, suggestionsContainer, searchInput)
        }, 150)
      }
    })
    
    // Also trigger on keyup for better responsiveness
    searchInput.addEventListener("keyup", (e) => {
      const query = e.target.value.trim()
      if (query.length >= 1 && e.key !== "ArrowDown" && e.key !== "ArrowUp" && e.key !== "Enter") {
        showSearchSuggestions(query, suggestionsContainer, searchInput)
      }
    })
    
    // Handle focus - show suggestions if there's text
    searchInput.addEventListener("focus", () => {
      const query = searchInput.value.trim()
      if (query.length >= 1) {
        showSearchSuggestions(query, suggestionsContainer, searchInput)
      }
    })
    
    // Hide suggestions when clicking outside
    document.addEventListener("click", (e) => {
      if (!searchBox.contains(e.target)) {
        suggestionsContainer.style.display = "none"
      }
    })
    
    // Handle search button click
    if (searchButton) {
      searchButton.addEventListener("click", (e) => {
        e.preventDefault()
        suggestionsContainer.style.display = "none"
        handleSearch(searchInput.value.trim())
      })
    }
    
    // Handle Enter key press
    searchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        e.preventDefault()
        suggestionsContainer.style.display = "none"
        handleSearch(searchInput.value.trim())
      }
    })
    
    // Handle arrow keys in suggestions
    searchInput.addEventListener("keydown", (e) => {
      const suggestions = suggestionsContainer.querySelectorAll(".suggestion-item")
      const active = suggestionsContainer.querySelector(".suggestion-item.active")
      let activeIndex = -1
      
      if (active) {
        activeIndex = Array.from(suggestions).indexOf(active)
      }
      
      if (e.key === "ArrowDown") {
        e.preventDefault()
        if (activeIndex < suggestions.length - 1) {
          if (active) active.classList.remove("active")
          suggestions[activeIndex + 1].classList.add("active")
          suggestions[activeIndex + 1].scrollIntoView({ block: "nearest" })
        }
      } else if (e.key === "ArrowUp") {
        e.preventDefault()
        if (activeIndex > 0) {
          if (active) active.classList.remove("active")
          suggestions[activeIndex - 1].classList.add("active")
          suggestions[activeIndex - 1].scrollIntoView({ block: "nearest" })
        } else if (active) {
          active.classList.remove("active")
        }
      } else if (e.key === "Enter" && active) {
        e.preventDefault()
        active.click()
      }
    })
  })
}

// Show search suggestions
function showSearchSuggestions(query, container, searchInput) {
  if (!query || query.length === 0) {
    container.style.display = "none"
    return
  }
  
  // Wait for AppData to be available
  let appData = window.AppData || (typeof AppData !== 'undefined' ? AppData : null)
  
  if (!appData) {
    // Try again after a short delay
    setTimeout(() => showSearchSuggestions(query, container, searchInput), 100)
    return
  }
  
  if (!appData.searchProducts || !appData.products || !appData.categories) {
    container.style.display = "none"
    return
  }
  
  const products = appData.searchProducts(query).slice(0, 8)
  const categories = appData.categories.filter(cat => 
    cat.name.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 3)
  
  if (products.length === 0 && categories.length === 0) {
    container.innerHTML = `
      <div class="suggestion-item no-results">
        <span>Không tìm thấy kết quả cho "${query}"</span>
      </div>
    `
    container.style.display = "block"
    return
  }
  
  let html = ""
  
  // Add categories first
  if (categories.length > 0) {
    html += '<div class="suggestions-section"><div class="suggestions-title">Danh mục</div>'
    categories.forEach(category => {
      const highlightedName = highlightText(category.name, query)
      const safeCategoryName = category.name.replace(/'/g, "\\'")
      html += `
        <div class="suggestion-item" onclick="handleSearch('${safeCategoryName}')">
          <span class="suggestion-icon">📁</span>
          <span class="suggestion-text">${highlightedName}</span>
        </div>
      `
    })
    html += '</div>'
  }
  
  // Add products
  if (products.length > 0) {
    html += '<div class="suggestions-section"><div class="suggestions-title">Sản phẩm</div>'
    products.forEach(product => {
      const highlightedName = highlightText(product.name, query)
      const safeName = product.name.replace(/'/g, "\\'").replace(/"/g, '&quot;')
      html += `
        <div class="suggestion-item" onclick="window.location.href='product-detail.html?id=${product.id}'">
          <img src="${product.image || './public/placeholder.jpg'}" alt="${safeName}" onerror="this.src='./public/placeholder.jpg'">
          <div class="suggestion-content">
            <div class="suggestion-text">${highlightedName}</div>
            <div class="suggestion-price">${typeof formatCurrency === 'function' ? formatCurrency(product.price) : product.price.toLocaleString('vi-VN') + ' ₫'}</div>
          </div>
        </div>
      `
    })
    html += '</div>'
  }
  
  // Add "View all results" link
  const safeQuery = query.replace(/'/g, "\\'").replace(/"/g, '&quot;')
  html += `
    <div class="suggestions-footer">
      <div class="suggestion-item view-all" onclick="handleSearch('${safeQuery}')">
        <span>Xem tất cả kết quả cho "${safeQuery}"</span>
      </div>
    </div>
  `
  
  container.innerHTML = html
  container.style.display = "block"
}

// Highlight matching text
function highlightText(text, query) {
  if (!query) return text
  const regex = new RegExp(`(${query})`, "gi")
  return text.replace(regex, '<mark>$1</mark>')
}

// Make functions globally available
window.highlightText = highlightText

// Handle search function
function handleSearch(query) {
  if (!query || query.length === 0) {
    // If empty, just go to products page
    window.location.href = "products.html"
    return
  }
  
  // Encode query and redirect to products page
  const encodedQuery = encodeURIComponent(query)
  window.location.href = `products.html?search=${encodedQuery}`
}

// Make handleSearch globally available
window.handleSearch = handleSearch

// Initialize header and search on page load
function initHeader() {
  updateHeader()
  // Initialize search with a small delay to ensure AppData is loaded
  setTimeout(() => {
    initSearch()
  }, 200)
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initHeader)
} else {
  // DOM is already loaded
  initHeader()
}
