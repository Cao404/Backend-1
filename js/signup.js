// JavaScript cho trang đăng ký
document.addEventListener('DOMContentLoaded', function() {
  const form = document.querySelector('form');
  const nameInput = document.getElementById('name');
  const emailInput = document.getElementById('email');
  const phoneInput = document.getElementById('phone');
  const passwordInput = document.getElementById('password');
  const termsCheckbox = document.querySelector('input[type="checkbox"]');

  // Key lưu user dùng chung với trang Quản Lý Người Dùng
  const USERS_STORAGE_KEY = 'shopvn_users';

  function loadUsersForSignup() {
    try {
      const raw = localStorage.getItem(USERS_STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error('Không thể đọc users:', e);
      return [];
    }
  }

  function saveUsersForSignup(list) {
    try {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(list || []));
    } catch (e) {
      console.error('Không thể lưu users:', e);
    }
  }

  function getInitialsForSignup(name) {
    if (!name) return '??';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }
  
  // Xử lý submit form
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const phone = phoneInput ? phoneInput.value.trim() : '';
    const password = passwordInput.value.trim();
    
    // Validation cơ bản
    if (!name) {
      alert('Vui lòng nhập họ và tên!');
      nameInput.focus();
      return;
    }
    
    if (!email) {
      alert('Vui lòng nhập email!');
      emailInput.focus();
      return;
    }

    if (!phone) {
      alert('Vui lòng nhập số điện thoại!');
      if (phoneInput) phoneInput.focus();
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
    
    // Kiểm tra mật khẩu mạnh
    if (password.length < 6) {
      alert('Mật khẩu phải có ít nhất 6 ký tự!');
      passwordInput.focus();
      return;
    }
    
    // Kiểm tra điều khoản
    if (!termsCheckbox.checked) {
      alert('Vui lòng đồng ý với Điều khoản sử dụng!');
      termsCheckbox.focus();
      return;
    }

    // Lưu thông tin khách hàng vào shopvn_users để hiển thị trong Quản Lý Người Dùng
    let users = loadUsersForSignup();

    // Không cho trùng email
    if (users.some(u => u.email === email)) {
      alert('Email đã tồn tại trong hệ thống, vui lòng dùng email khác hoặc đăng nhập.');
      return;
    }

    const maxId = users.length ? Math.max.apply(null, users.map(u => u.id || 0)) : 0;
    const today = new Date().toISOString().split('T')[0];

    const newUser = {
      id: maxId + 1,
      name: name,
      email: email,
      phone: phone || '',
      role: 'customer',
      status: 'active',
      createdAt: today,
      avatar: getInitialsForSignup(name)
    };

    users.push(newUser);
    saveUsersForSignup(users);

    // Lưu session đăng nhập nhanh
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userEmail', email);
    localStorage.setItem('userName', name);
    
    // Hiển thị thông báo
    alert(`Đăng ký thành công! Chào mừng ${name} đến với shop vn!`);
    
    // Chuyển hướng đến Dashboard
    window.location.href = 'dashboard.html';
  });
  
  // Hiệu ứng focus cho input
  const inputs = document.querySelectorAll('input[type="text"], input[type="email"], input[type="password"]');
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
  
  // Hiệu ứng hover cho button
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
      alert(`Đăng ký bằng ${provider} - Tính năng đang phát triển!`);
    });
  });
  
  // Hiệu ứng loading khi submit
  form.addEventListener('submit', function() {
    const submitBtn = document.querySelector('.btn');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Đang tạo tài khoản...';
    submitBtn.disabled = true;
    
    // Giả lập thời gian xử lý
    setTimeout(() => {
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }, 2000);
  });
  
  // Kiểm tra mật khẩu mạnh
  passwordInput.addEventListener('input', function() {
    const password = this.value;
    const strength = getPasswordStrength(password);
    
    // Tạo hoặc cập nhật indicator
    let indicator = document.querySelector('.password-strength');
    if (!indicator) {
      indicator = document.createElement('div');
      indicator.className = 'password-strength';
      indicator.style.cssText = 'margin-top: 5px; font-size: 12px;';
      this.parentNode.appendChild(indicator);
    }
    
    if (password.length > 0) {
      indicator.textContent = `Độ mạnh: ${strength.text}`;
      indicator.style.color = strength.color;
    } else {
      indicator.textContent = '';
    }
  });
  
  function getPasswordStrength(password) {
    let score = 0;
    
    if (password.length >= 6) score++;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    
    if (score < 2) return { text: 'Yếu', color: '#ef4444' };
    if (score < 4) return { text: 'Trung bình', color: '#f59e0b' };
    return { text: 'Mạnh', color: '#10b981' };
  }
});


