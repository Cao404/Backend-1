// Auth Guard - Kiểm tra đăng nhập
(function() {
  const isLoggedIn = localStorage.getItem('isLoggedIn');
  const currentPage = window.location.pathname.split('/').pop();
  
  // Danh sách trang không cần đăng nhập
  const publicPages = ['login.html', 'signup.html', 'reset-password.html', 'index.html'];
  
  // Nếu chưa đăng nhập và không phải trang public
  if (!isLoggedIn && !publicPages.includes(currentPage)) {
    window.location.href = 'login.html';
  }
  
  // Nếu đã đăng nhập mà vào trang login/signup → redirect đến dashboard
  if (isLoggedIn && (currentPage === 'login.html' || currentPage === 'signup.html')) {
    window.location.href = 'dashboard.html';
  }
})();

// Hàm logout
function logout() {
  if (confirm('Bạn có chắc muốn đăng xuất?')) {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    window.location.href = 'login.html';
  }
}

// Hiển thị thông tin user trong sidebar
document.addEventListener('DOMContentLoaded', function() {
  const userNameElement = document.querySelector('.user div[style*="font-weight:700"]');
  const userName = localStorage.getItem('userName') || 'Admin';
  
  if (userNameElement) {
    userNameElement.textContent = userName;
  }
});


