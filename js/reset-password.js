// JavaScript cho trang đặt lại mật khẩu
document.addEventListener('DOMContentLoaded', function() {
  const form = document.querySelector('form');
  const emailInput = document.getElementById('email');
  
  // Xử lý submit form
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = emailInput.value.trim();
    
    // Validation cơ bản
    if (!email) {
      alert('Vui lòng nhập email!');
      emailInput.focus();
      return;
    }
    
    // Kiểm tra email hợp lệ
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert('Email không hợp lệ!');
      emailInput.focus();
      return;
    }
    
    // Giả lập gửi email thành công
    alert(`Đã gửi hướng dẫn đặt lại mật khẩu đến ${email}!`);
    
    // Hiệu ứng loading
    const submitBtn = document.querySelector('.btn');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Đang gửi...';
    submitBtn.disabled = true;
    
    setTimeout(() => {
      submitBtn.textContent = 'Gửi lại';
      submitBtn.disabled = false;
      
      // Thêm thông báo thành công
      const successMsg = document.createElement('div');
      successMsg.style.cssText = `
        background: #d1fae5;
        color: #065f46;
        padding: 12px;
        border-radius: 8px;
        margin-top: 16px;
        font-size: 14px;
        border: 1px solid #a7f3d0;
      `;
      successMsg.textContent = '✅ Email đã được gửi! Vui lòng kiểm tra hộp thư của bạn.';
      
      form.appendChild(successMsg);
      
      // Ẩn thông báo sau 5 giây
      setTimeout(() => {
        successMsg.remove();
      }, 5000);
    }, 2000);
  });
  
  // Hiệu ứng focus cho input
  emailInput.addEventListener('focus', function() {
    this.style.borderColor = '#4F46E5';
    this.style.boxShadow = '0 0 0 3px rgba(79, 70, 229, 0.1)';
  });
  
  emailInput.addEventListener('blur', function() {
    this.style.borderColor = '#D1D5DB';
    this.style.boxShadow = 'none';
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
  
  // Hiệu ứng typing cho input
  emailInput.addEventListener('input', function() {
    if (this.value.length > 0) {
      this.style.borderColor = '#10b981';
    } else {
      this.style.borderColor = '#D1D5DB';
    }
  });
  
  // Thêm placeholder animation
  emailInput.addEventListener('focus', function() {
    if (this.value === '') {
      this.placeholder = 'Ví dụ: user@example.com';
    }
  });
  
  emailInput.addEventListener('blur', function() {
    if (this.value === '') {
      this.placeholder = 'Nhập email của bạn';
    }
  });
});








