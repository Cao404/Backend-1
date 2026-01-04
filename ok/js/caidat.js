// Quản lý cài đặt - SellerHub
document.addEventListener("DOMContentLoaded", () => {
  
  // ========== TAB SWITCHING ==========
  function setupTabSwitching() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetTab = btn.getAttribute('data-tab');
        
        // Xóa active từ tất cả
        tabButtons.forEach(b => b.classList.remove('active'));
        tabContents.forEach(c => c.style.display = 'none');
        
        // Thêm active cho tab được chọn
        btn.classList.add('active');
        const targetContent = document.getElementById(`tab-${targetTab}`);
        if (targetContent) {
          targetContent.style.display = 'block';
        }
      });
    });
  }
  
  // Khởi tạo tab switching
  setupTabSwitching();

  // ========== QUẢN LÝ TÀI KHOẢN ==========
  // Đợi một chút để đảm bảo DOM đã sẵn sàng
  setTimeout(() => {
    try {
      setupAccountTab();
      setupSecurityTab();
      setupNotificationsTab();
      setupPaymentTab();
    } catch (e) {
      console.error('Lỗi khi khởi tạo các tab:', e);
    }
  }, 100);

  function setupAccountTab() {
    // Kiểm tra xem tab có tồn tại không
    const accountTab = document.getElementById('tab-account');
    if (!accountTab) {
      console.warn('Tab account không tồn tại');
      return;
    }

    const ACCOUNT_STORAGE_KEY = "userAccountSettings";
    
    // Load dữ liệu
    function loadAccountData() {
      try {
        const stored = localStorage.getItem(ACCOUNT_STORAGE_KEY);
        if (stored) return JSON.parse(stored);
      } catch (e) {
        console.error('Lỗi khi đọc dữ liệu tài khoản:', e);
      }
      return {
        firstName: "Hoàng",
        lastName: "Nguyễn",
        email: "nguyenhoang@email.com",
        phone: "0912 345 678",
        avatar: null,
        language: "vi",
        timezone: "GMT+7",
        darkMode: true
      };
    }

    function saveAccountData(data) {
      try {
        localStorage.setItem(ACCOUNT_STORAGE_KEY, JSON.stringify(data));
        return true;
      } catch (e) {
        console.error('Lỗi khi lưu dữ liệu tài khoản:', e);
        return false;
      }
    }

    // Khởi tạo dữ liệu
    const accountData = loadAccountData();
    
    // Cập nhật UI - kiểm tra element tồn tại
    const firstNameEl = document.getElementById('accountFirstName');
    const lastNameEl = document.getElementById('accountLastName');
    const emailEl = document.getElementById('accountEmail');
    const phoneEl = document.getElementById('accountPhone');
    const languageEl = document.getElementById('accountLanguage');
    const timezoneEl = document.getElementById('accountTimezone');
    const darkModeEl = document.getElementById('accountDarkMode');

    if (firstNameEl) firstNameEl.value = accountData.firstName;
    if (lastNameEl) lastNameEl.value = accountData.lastName;
    if (emailEl) emailEl.value = accountData.email;
    if (phoneEl) phoneEl.value = accountData.phone;
    if (languageEl) languageEl.value = accountData.language;
    if (timezoneEl) timezoneEl.value = accountData.timezone;
    if (darkModeEl) darkModeEl.checked = accountData.darkMode !== false;
    
    // Cập nhật avatar
    updateAvatar(accountData.avatar, accountData.firstName, accountData.lastName);

    function updateAvatar(avatarSrc, firstName, lastName) {
      const avatarImg = document.getElementById('accountAvatarImg');
      const avatarText = document.getElementById('accountAvatarText');
      if (!avatarImg || !avatarText) return;
      
      const initials = (firstName?.[0] || '') + (lastName?.[0] || '') || 'NH';
      
      if (avatarSrc) {
        avatarImg.src = avatarSrc;
        avatarImg.style.display = 'block';
        avatarText.style.display = 'none';
      } else {
        avatarImg.style.display = 'none';
        avatarText.textContent = initials;
        avatarText.style.display = 'flex';
      }
    }

    // Upload avatar
    const avatarInput = document.getElementById('accountAvatarInput');
    const changeAvatarBtn = document.getElementById('changeAvatarBtn');
    if (changeAvatarBtn && avatarInput) {
      changeAvatarBtn.addEventListener('click', () => avatarInput.click());
      avatarInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = (event) => {
            accountData.avatar = event.target.result;
            saveAccountData(accountData);
            updateAvatar(accountData.avatar, accountData.firstName, accountData.lastName);
          };
          reader.readAsDataURL(file);
        }
      });
    }

    // Lưu tài khoản
    const saveAccountBtn = document.getElementById('saveAccount');
    if (saveAccountBtn) {
      saveAccountBtn.addEventListener('click', () => {
        const data = loadAccountData();
        if (firstNameEl) data.firstName = firstNameEl.value;
        if (lastNameEl) data.lastName = lastNameEl.value;
        if (emailEl) data.email = emailEl.value;
        if (phoneEl) data.phone = phoneEl.value;
        if (languageEl) data.language = languageEl.value;
        if (timezoneEl) data.timezone = timezoneEl.value;
        if (darkModeEl) data.darkMode = darkModeEl.checked;
        
        if (saveAccountData(data)) {
          updateAvatar(data.avatar, data.firstName, data.lastName);
          alert('Đã lưu thông tin tài khoản thành công!');
          
          // Cập nhật dark mode nếu thay đổi
          if (data.darkMode) {
            document.body.classList.add('dark-mode');
          } else {
            document.body.classList.remove('dark-mode');
          }
        }
      });
    }

    // Hủy thay đổi
    const cancelAccountBtn = document.getElementById('cancelAccount');
    if (cancelAccountBtn) {
      cancelAccountBtn.addEventListener('click', () => {
        const data = loadAccountData();
        if (firstNameEl) firstNameEl.value = data.firstName;
        if (lastNameEl) lastNameEl.value = data.lastName;
        if (emailEl) emailEl.value = data.email;
        if (phoneEl) phoneEl.value = data.phone;
        if (languageEl) languageEl.value = data.language;
        if (timezoneEl) timezoneEl.value = data.timezone;
        if (darkModeEl) darkModeEl.checked = data.darkMode !== false;
        alert('Đã hủy các thay đổi!');
      });
    }
  }

  function setupSecurityTab() {
    // Kiểm tra xem tab có tồn tại không
    const securityTab = document.getElementById('tab-security');
    if (!securityTab) {
      console.warn('Tab security không tồn tại');
      return;
    }

    const SECURITY_STORAGE_KEY = "userSecuritySettings";
    
    function loadSecurityData() {
      try {
        const stored = localStorage.getItem(SECURITY_STORAGE_KEY);
        if (stored) return JSON.parse(stored);
      } catch (e) {
        console.error('Lỗi khi đọc dữ liệu bảo mật:', e);
      }
      return {
        twoFactorAuth: false,
        sessions: [
          { id: '1', device: 'Chrome trên Windows', location: 'TP. Hồ Chí Minh', active: true, time: 'Đang hoạt động', isCurrent: true },
          { id: '2', device: 'Safari trên iPhone', location: 'TP. Hồ Chí Minh', active: false, time: '2 giờ trước', isCurrent: false },
          { id: '3', device: 'Firefox trên MacOS', location: 'Hà Nội', active: false, time: '3 ngày trước', isCurrent: false }
        ]
      };
    }

    function saveSecurityData(data) {
      try {
        localStorage.setItem(SECURITY_STORAGE_KEY, JSON.stringify(data));
        return true;
      } catch (e) {
        console.error('Lỗi khi lưu dữ liệu bảo mật:', e);
        return false;
      }
    }

    // Toggle password visibility
    document.querySelectorAll('.toggle-password').forEach(btn => {
      btn.addEventListener('click', () => {
        const targetId = btn.getAttribute('data-target');
        const input = document.getElementById(targetId);
        if (input) {
          input.type = input.type === 'password' ? 'text' : 'password';
          btn.textContent = input.type === 'password' ? '👁️' : '🙈';
        }
      });
    });

    // Cập nhật mật khẩu
    const updatePasswordBtn = document.getElementById('updatePasswordBtn');
    if (updatePasswordBtn) {
      updatePasswordBtn.addEventListener('click', () => {
        const currentPassword = document.getElementById('currentPassword');
        const newPassword = document.getElementById('newPassword');
        const confirmPassword = document.getElementById('confirmPassword');

        if (!currentPassword || !newPassword || !confirmPassword) return;

        const current = currentPassword.value;
        const newPwd = newPassword.value;
        const confirm = confirmPassword.value;

        if (!current || !newPwd || !confirm) {
          alert('Vui lòng điền đầy đủ thông tin!');
          return;
        }

        if (newPwd !== confirm) {
          alert('Mật khẩu mới và xác nhận mật khẩu không khớp!');
          return;
        }

        if (newPwd.length < 6) {
          alert('Mật khẩu mới phải có ít nhất 6 ký tự!');
          return;
        }

        // Giả lập cập nhật mật khẩu
        alert('Đã cập nhật mật khẩu thành công!');
        currentPassword.value = '';
        newPassword.value = '';
        confirmPassword.value = '';
      });
    }

    // Render sessions
    function renderSessions() {
      const securityData = loadSecurityData();
      const container = document.getElementById('loginSessionsList');
      if (!container) return;

      container.innerHTML = securityData.sessions.map(session => `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 16px; background: var(--bg); border-radius: 8px; margin-bottom: 12px;">
          <div>
            <div style="font-weight: 500; margin-bottom: 4px;">${session.device}</div>
            <div style="font-size: 13px; color: var(--text-muted);">${session.location} - ${session.time}</div>
          </div>
          <div style="display: flex; align-items: center; gap: 12px;">
            ${session.isCurrent ? '<span style="color: #10b981; font-weight: 600; font-size: 13px;">Thiết bị này</span>' : ''}
            ${!session.isCurrent ? `<button class="btn-cancel" style="padding: 4px 8px; font-size: 12px;" data-session-id="${session.id}">Đăng xuất</button>` : ''}
          </div>
        </div>
      `).join('');

      // Event cho nút xóa session
      container.querySelectorAll('[data-session-id]').forEach(btn => {
        btn.addEventListener('click', () => {
          const sessionId = btn.getAttribute('data-session-id');
          if (confirm('Bạn có chắc muốn đăng xuất thiết bị này?')) {
            const securityData = loadSecurityData();
            securityData.sessions = securityData.sessions.filter(s => s.id !== sessionId);
            saveSecurityData(securityData);
            renderSessions();
          }
        });
      });
    }

    // Đăng xuất tất cả thiết bị khác
    const logoutAllBtn = document.getElementById('logoutAllDevicesBtn');
    if (logoutAllBtn) {
      logoutAllBtn.addEventListener('click', () => {
        if (confirm('Bạn có chắc muốn đăng xuất tất cả thiết bị khác?')) {
          const securityData = loadSecurityData();
          securityData.sessions = securityData.sessions.filter(s => s.isCurrent);
          saveSecurityData(securityData);
          renderSessions();
          alert('Đã đăng xuất tất cả thiết bị khác!');
        }
      });
    }

    // Two factor auth
    const twoFactorAuth = document.getElementById('twoFactorAuth');
    let securityData = loadSecurityData();
    if (twoFactorAuth) {
      twoFactorAuth.checked = securityData.twoFactorAuth;
      twoFactorAuth.addEventListener('change', () => {
        securityData = loadSecurityData();
        securityData.twoFactorAuth = twoFactorAuth.checked;
        saveSecurityData(securityData);
      });
    }

    // Lưu bảo mật
    const saveSecurityBtn = document.getElementById('saveSecurity');
    if (saveSecurityBtn) {
      saveSecurityBtn.addEventListener('click', () => {
        const data = loadSecurityData();
        const twoFactorEl = document.getElementById('twoFactorAuth');
        if (twoFactorEl) data.twoFactorAuth = twoFactorEl.checked;
        if (saveSecurityData(data)) {
          alert('Đã lưu cài đặt bảo mật thành công!');
        }
      });
    }

    // Hủy thay đổi
    const cancelSecurityBtn = document.getElementById('cancelSecurity');
    if (cancelSecurityBtn) {
      cancelSecurityBtn.addEventListener('click', () => {
        const data = loadSecurityData();
        const twoFactorEl = document.getElementById('twoFactorAuth');
        if (twoFactorEl) twoFactorEl.checked = data.twoFactorAuth;
        renderSessions();
        alert('Đã hủy các thay đổi!');
      });
    }

    renderSessions();
  }

  function setupNotificationsTab() {
    // Kiểm tra xem tab có tồn tại không
    const notificationsTab = document.getElementById('tab-notifications');
    if (!notificationsTab) {
      console.warn('Tab notifications không tồn tại');
      return;
    }

    const NOTIFICATIONS_STORAGE_KEY = "userNotificationsSettings";
    
    function loadNotificationsData() {
      try {
        const stored = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
        if (stored) return JSON.parse(stored);
      } catch (e) {
        console.error('Lỗi khi đọc dữ liệu thông báo:', e);
      }
      return {
        email: {
          orders: true,
          reviews: true,
          messages: true,
          weeklyReport: false,
          system: false
        },
        push: {
          orders: true,
          promotions: false,
          messages: true
        }
      };
    }

    function saveNotificationsData(data) {
      try {
        localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(data));
        return true;
      } catch (e) {
        console.error('Lỗi khi lưu dữ liệu thông báo:', e);
        return false;
      }
    }

    const notificationsData = loadNotificationsData();

    // Cập nhật UI
    const emailOrders = document.getElementById('notifEmailOrders');
    const emailReviews = document.getElementById('notifEmailReviews');
    const emailMessages = document.getElementById('notifEmailMessages');
    const emailWeeklyReport = document.getElementById('notifEmailWeeklyReport');
    const emailSystem = document.getElementById('notifEmailSystem');
    const pushOrders = document.getElementById('notifPushOrders');
    const pushPromotions = document.getElementById('notifPushPromotions');
    const pushMessages = document.getElementById('notifPushMessages');

    if (emailOrders) emailOrders.checked = notificationsData.email.orders;
    if (emailReviews) emailReviews.checked = notificationsData.email.reviews;
    if (emailMessages) emailMessages.checked = notificationsData.email.messages;
    if (emailWeeklyReport) emailWeeklyReport.checked = notificationsData.email.weeklyReport;
    if (emailSystem) emailSystem.checked = notificationsData.email.system;
    if (pushOrders) pushOrders.checked = notificationsData.push.orders;
    if (pushPromotions) pushPromotions.checked = notificationsData.push.promotions;
    if (pushMessages) pushMessages.checked = notificationsData.push.messages;

    // Lưu thông báo
    const saveNotificationsBtn = document.getElementById('saveNotifications');
    if (saveNotificationsBtn) {
      saveNotificationsBtn.addEventListener('click', () => {
        const data = loadNotificationsData();
        if (emailOrders) data.email.orders = emailOrders.checked;
        if (emailReviews) data.email.reviews = emailReviews.checked;
        if (emailMessages) data.email.messages = emailMessages.checked;
        if (emailWeeklyReport) data.email.weeklyReport = emailWeeklyReport.checked;
        if (emailSystem) data.email.system = emailSystem.checked;
        if (pushOrders) data.push.orders = pushOrders.checked;
        if (pushPromotions) data.push.promotions = pushPromotions.checked;
        if (pushMessages) data.push.messages = pushMessages.checked;
        
        if (saveNotificationsData(data)) {
          alert('Đã lưu cài đặt thông báo thành công!');
        }
      });
    }

    // Hủy thay đổi
    const cancelNotificationsBtn = document.getElementById('cancelNotifications');
    if (cancelNotificationsBtn) {
      cancelNotificationsBtn.addEventListener('click', () => {
        const data = loadNotificationsData();
        if (emailOrders) emailOrders.checked = data.email.orders;
        if (emailReviews) emailReviews.checked = data.email.reviews;
        if (emailMessages) emailMessages.checked = data.email.messages;
        if (emailWeeklyReport) emailWeeklyReport.checked = data.email.weeklyReport;
        if (emailSystem) emailSystem.checked = data.email.system;
        if (pushOrders) pushOrders.checked = data.push.orders;
        if (pushPromotions) pushPromotions.checked = data.push.promotions;
        if (pushMessages) pushMessages.checked = data.push.messages;
        alert('Đã hủy các thay đổi!');
      });
    }
  }

  function setupPaymentTab() {
    // Kiểm tra xem tab có tồn tại không
    const paymentTab = document.getElementById('tab-payment');
    if (!paymentTab) {
      console.warn('Tab payment không tồn tại');
      return;
    }

    const PAYMENT_STORAGE_KEY = "userPaymentSettings";
    
    function loadPaymentData() {
      try {
        const stored = localStorage.getItem(PAYMENT_STORAGE_KEY);
        if (stored) return JSON.parse(stored);
      } catch (e) {
        console.error('Lỗi khi đọc dữ liệu thanh toán:', e);
      }
      return {
        bankAccounts: [
          { id: '1', bank: 'Vietcombank', account: '**** **** **** 1234', owner: 'NGUYEN VAN HOANG', default: true },
          { id: '2', bank: 'Techcombank', account: '**** **** **** 5678', owner: 'NGUYEN VAN HOANG', default: false }
        ],
        schedule: 'weekly'
      };
    }

    function savePaymentData(data) {
      try {
        localStorage.setItem(PAYMENT_STORAGE_KEY, JSON.stringify(data));
        return true;
      } catch (e) {
        console.error('Lỗi khi lưu dữ liệu thanh toán:', e);
        return false;
      }
    }

    // Render bank accounts
    function renderBankAccounts() {
      const paymentData = loadPaymentData();
      const container = document.getElementById('bankAccountsList');
      if (!container) return;

      container.innerHTML = paymentData.bankAccounts.map(account => `
        <div style="background: var(--bg-elevated-2); border-radius: 8px; padding: 20px; margin-bottom: 16px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div style="font-weight: 600; font-size: 16px; margin-bottom: 8px;">${account.bank}</div>
              <div style="font-size: 14px; color: var(--text-muted); margin-bottom: 4px;">${account.account}</div>
              <div style="font-size: 13px; color: var(--text-muted);">${account.owner}</div>
            </div>
            <div style="display: flex; gap: 8px; align-items: center;">
              ${account.default ? '<button class="btn-submit" style="padding: 6px 12px; font-size: 12px;">Mặc định</button>' : ''}
              <button class="btn-cancel" style="padding: 6px 12px; font-size: 12px;" data-delete-account="${account.id}">🗑️</button>
            </div>
          </div>
        </div>
      `).join('');

      // Event xóa tài khoản
      container.querySelectorAll('[data-delete-account]').forEach(btn => {
        btn.addEventListener('click', () => {
          const accountId = btn.getAttribute('data-delete-account');
          if (confirm('Bạn có chắc muốn xóa tài khoản này?')) {
            const paymentData = loadPaymentData();
            paymentData.bankAccounts = paymentData.bankAccounts.filter(a => a.id !== accountId);
            savePaymentData(paymentData);
            renderBankAccounts();
          }
        });
      });
    }

    // Modal thêm tài khoản
    const addBankAccountBtn = document.getElementById('addBankAccountBtn');
    const bankModal = document.getElementById('addBankAccountModal');
    const closeBankModal = document.getElementById('closeBankModal');
    const cancelBankModal = document.getElementById('cancelBankModal');
    const saveBankModal = document.getElementById('saveBankModal');

    if (addBankAccountBtn && bankModal) {
      addBankAccountBtn.addEventListener('click', () => {
        bankModal.style.display = 'flex';
      });
    }

    if (closeBankModal) {
      closeBankModal.addEventListener('click', () => {
        if (bankModal) bankModal.style.display = 'none';
      });
    }

    if (cancelBankModal) {
      cancelBankModal.addEventListener('click', () => {
        if (bankModal) bankModal.style.display = 'none';
        // Reset form
        const modalAccount = document.getElementById('modalBankAccount');
        const modalOwner = document.getElementById('modalBankOwner');
        const modalDefault = document.getElementById('modalBankDefault');
        if (modalAccount) modalAccount.value = '';
        if (modalOwner) modalOwner.value = '';
        if (modalDefault) modalDefault.checked = false;
      });
    }

    if (saveBankModal) {
      saveBankModal.addEventListener('click', () => {
        const paymentData = loadPaymentData();
        const modalBankName = document.getElementById('modalBankName');
        const modalAccount = document.getElementById('modalBankAccount');
        const modalOwner = document.getElementById('modalBankOwner');
        const modalDefault = document.getElementById('modalBankDefault');

        if (!modalBankName || !modalAccount || !modalOwner) return;

        const bankName = modalBankName.value;
        const account = modalAccount.value;
        const owner = modalOwner.value;
        const isDefault = modalDefault ? modalDefault.checked : false;

        if (!account || !owner) {
          alert('Vui lòng điền đầy đủ thông tin!');
          return;
        }

        // Mask account number
        const maskedAccount = '**** **** **** ' + account.slice(-4);

        const bankNames = {
          'vietcombank': 'Vietcombank',
          'techcombank': 'Techcombank',
          'biddv': 'BIDV',
          'vietinbank': 'VietinBank',
          'acb': 'ACB',
          'tpb': 'TPBank'
        };

        // Nếu đặt làm mặc định, bỏ mặc định của các tài khoản khác
        if (isDefault) {
          paymentData.bankAccounts.forEach(a => a.default = false);
        }

        const newAccount = {
          id: Date.now().toString(),
          bank: bankNames[bankName] || bankName,
          account: maskedAccount,
          owner: owner.toUpperCase(),
          default: isDefault || paymentData.bankAccounts.length === 0
        };

        paymentData.bankAccounts.push(newAccount);
        savePaymentData(paymentData);
        renderBankAccounts();
        if (bankModal) bankModal.style.display = 'none';
        
        // Reset form
        if (modalAccount) modalAccount.value = '';
        if (modalOwner) modalOwner.value = '';
        if (modalDefault) modalDefault.checked = false;
      });
    }

    // Đóng modal khi click bên ngoài
    if (bankModal) {
      bankModal.addEventListener('click', (e) => {
        if (e.target === bankModal) {
          bankModal.style.display = 'none';
        }
      });
    }

    // Lưu thanh toán
    const savePaymentBtn = document.getElementById('savePayment');
    const paymentSchedule = document.getElementById('paymentSchedule');
    if (savePaymentBtn && paymentSchedule) {
      savePaymentBtn.addEventListener('click', () => {
        const paymentData = loadPaymentData();
        paymentData.schedule = paymentSchedule.value;
        if (savePaymentData(paymentData)) {
          alert('Đã lưu cài đặt thanh toán thành công!');
        }
      });
    }

    // Hủy thay đổi
    const cancelPaymentBtn = document.getElementById('cancelPayment');
    if (cancelPaymentBtn && paymentSchedule) {
      cancelPaymentBtn.addEventListener('click', () => {
        const data = loadPaymentData();
        paymentSchedule.value = data.schedule;
        renderBankAccounts();
        alert('Đã hủy các thay đổi!');
      });
    }

    // Khởi tạo
    renderBankAccounts();
    if (paymentSchedule) {
      paymentSchedule.value = loadPaymentData().schedule;
    }
  }
});
