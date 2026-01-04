// ============================================
// AUTHENTICATION MODULE
// ============================================

// Declare necessary functions
function getFromStorage(key, defaultValue) {
  const value = localStorage.getItem(key)
  return value ? JSON.parse(value) : defaultValue
}

function generateId() {
  return Math.random().toString(36).substr(2, 9)
}

function saveToStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

function showToast(message, type = "success") {
  alert(message)
}

const Auth = {
  user: getFromStorage("user", null),

  isLoggedIn() {
    return this.user !== null
  },

  getUser() {
    return this.user
  },

  login(email, password) {
    if (email && password) {
      // Đọc users dùng chung với trang admin
      const USERS_STORAGE_KEY = 'shopvn_users'
      let users = getFromStorage(USERS_STORAGE_KEY, [])
      if (!Array.isArray(users)) users = []

      // Tìm user customer theo email + mật khẩu và đang hoạt động
      const matched = users.find(function(u) {
        var isCustomer = (u.role === 'customer' || !u.role);
        var isActive = (u.status === 'active' || u.status === undefined || u.status === null);
        return u.email === email && u.password === password && isCustomer && isActive;
      });

      if (matched) {
        const sessionUser = {
          id: matched.id,
          email: matched.email,
          name: matched.name,
          phone: matched.phone || "",
          address: "",
        }
        this.user = sessionUser
        saveToStorage("user", sessionUser)
        showToast("Đăng nhập thành công!")
        window.location.href = "index.html"
        return true
      }
    }
    showToast("Email hoặc mật khẩu không đúng!", "error")
    return false
  },

  register(name, email, password) {
    if (name && email && password) {
      const user = {
        id: generateId(),
        email: email,
        name: name,
        phone: "",
        address: "",
      }
      this.user = user
      saveToStorage("user", user)

      // Đồng bộ khách hàng sang hệ thống admin (shopvn_users)
      try {
        const USERS_STORAGE_KEY = 'shopvn_users'
        let users = getFromStorage(USERS_STORAGE_KEY, [])
        if (!Array.isArray(users)) users = []

        // Lấy id lớn nhất hiện có trong shopvn_users (nếu có)
        let maxId = 0
        users.forEach(u => {
          if (typeof u.id === 'number' && u.id > maxId) maxId = u.id
        })

        // Tạo avatar initials từ tên
        const trimmedName = (name || '').trim()
        let avatar = '??'
        if (trimmedName) {
          const parts = trimmedName.split(' ').filter(Boolean)
          if (parts.length >= 2) {
            avatar = (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
          } else {
            avatar = trimmedName.substring(0, 2).toUpperCase()
          }
        }

        const today = new Date().toISOString().split('T')[0]

        // Nếu email đã tồn tại trong shopvn_users thì không tạo trùng
        if (!users.some(u => u.email === email)) {
          users.push({
            id: maxId + 1,
            name: name,
            email: email,
            phone: "",
            role: 'customer',
            status: 'active',
            createdAt: today,
            avatar: avatar
          })

          saveToStorage(USERS_STORAGE_KEY, users)
        }
      } catch (e) {
        console.error('Không thể đồng bộ khách hàng sang shopvn_users:', e)
      }

      showToast("Đăng ký thành công!")
      window.location.href = "index.html"
      return true
    }
    showToast("Vui lòng điền đầy đủ thông tin!", "error")
    return false
  },

  logout() {
    this.user = null
    localStorage.removeItem("user")
    showToast("Đã đăng xuất!")
    window.location.href = "index.html"
  },

  forgotPassword(email) {
    if (email) {
      showToast("Đã gửi link khôi phục mật khẩu đến email của bạn!")
      return true
    }
    showToast("Vui lòng nhập email!", "error")
    return false
  },
}

// Login form handler
function handleLogin(event) {
  event.preventDefault()
  const email = document.getElementById("email").value
  const password = document.getElementById("password").value
  Auth.login(email, password)
}

// Register form handler
function handleRegister(event) {
  event.preventDefault()
  const name = document.getElementById("name").value
  const email = document.getElementById("email").value
  const password = document.getElementById("password").value
  const confirmPassword = document.getElementById("confirmPassword").value

  if (password !== confirmPassword) {
    showToast("Mật khẩu xác nhận không khớp!", "error")
    return
  }

  Auth.register(name, email, password)
}

// Forgot password form handler
function handleForgotPassword(event) {
  event.preventDefault()
  const email = document.getElementById("email").value
  Auth.forgotPassword(email)
}

// Logout handler
function logout() {
  Auth.logout()
}
