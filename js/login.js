// JavaScript cho trang đăng nhập
document.addEventListener('DOMContentLoaded', function() {
  const form = document.querySelector('form');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const rememberCheckbox = document.querySelector('input[type="checkbox"]');
  
  // Lưu thông tin đăng nhập nếu checkbox được chọn
  if (localStorage.getItem('rememberedEmail')) {
    emailInput.value = localStorage.getItem('rememberedEmail');
    rememberCheckbox.checked = true;
  }
  
  // Xử lý submit form
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    
    // Validation cơ bản
    if (!email) {
      alert('Vui lòng nhập email!');
      emailInput.focus();
      return;
    }
    
    if (!password) {
      alert('Vui lòng nhập mật khẩu!');
      passwordInput.focus();
      return;
    }
    
    // Kiểm tra email hợp lệ
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert('Email không hợp lệ!');
      emailInput.focus();
      return;
    }
    
    // Lưu thông tin nếu checkbox được chọn
    if (rememberCheckbox.checked) {
      localStorage.setItem('rememberedEmail', email);
    } else {
      localStorage.removeItem('rememberedEmail');
    }
    
    // Lưu session đăng nhập
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userEmail', email);
    
    // Hiển thị loading
    const submitBtn = document.querySelector('.btn');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Đang đăng nhập...';
    submitBtn.disabled = true;
    
    // Giả lập đăng nhập và chuyển hướng đến Dashboard
    setTimeout(() => {
      window.location.href = 'dashboard.html';
    }, 800);
  });
  
  // Hiệu ứng focus cho input
  const inputs = document.querySelectorAll('input[type="email"], input[type="password"]');
  inputs.forEach(input => {
    input.addEventListener('focus', function() {
      this.style.borderColor = '#4F46E5';
      this.style.boxShadow = '0 0 0 3px rgba(79, 70, 229, 0.1)';
    });
    
    input.addEventListener('blur', function() {
      this.style.borderColor = '#D1D5DB';
      this.style.boxShadow = 'none';
    });
  });
  
  // Hiệu ứng  cho button
  const submitBtn = document.querySelector('.btn');
  submitBtn.addEventListener('mouseenter', function() {
    this.style.transform = 'translateY(-2px)';
    this.style.boxShadow = '0 10px 25px rgba(79, 70, 229, 0.3)';
  });
  
  submitBtn.addEventListener('mouseleave', function() {
    this.style.transform = 'translateY(0)';
    this.style.boxShadow = '0 4px 14px rgba(79, 70, 229, 0.2)';
  });
  
  // Xử lý SSO buttons
  const ssoButtons = document.querySelectorAll('.sso-btn');
  ssoButtons.forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      const provider = this.textContent.includes('Google') ? 'Google' : 'Facebook';
      alert(`Đăng nhập bằng ${provider} - Tính năng đang phát triển!`);
    });
  });
  
});








