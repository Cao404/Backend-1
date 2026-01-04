document.addEventListener("DOMContentLoaded", function () {
  // ============ HÀM TIỆN ÍCH DÙNG CHUNG ============
  const SELLER_REQ_KEY = "shopvn_seller_requests";

  function loadSellerRequests() {
    try {
      const raw = localStorage.getItem(SELLER_REQ_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error("Không thể đọc seller requests:", e);
      return [];
    }
  }

  function saveSellerRequests(list) {
    try {
      localStorage.setItem(SELLER_REQ_KEY, JSON.stringify(list || []));
    } catch (e) {
      console.error("Không thể lưu seller requests:", e);
    }
  }

  // ============ XỬ LÝ FORM ĐĂNG KÝ (trang sinup.html) ============
  const registerForm = document.getElementById("registerForm");

  if (registerForm) {
    registerForm.addEventListener("submit", function (e) {
      e.preventDefault(); // chặn submit mặc định

      const phone = registerForm.phone.value.trim();
      const email = registerForm.email.value.trim();
      const password = registerForm.password.value.trim();

      const phoneRegex = /^0\d{9}$/; // 10 số, bắt đầu bằng 0
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!phone || !email || !password) {
        alert("Vui lòng nhập đầy đủ Số điện thoại, Email và Mật khẩu!");
        return;
      }

      if (!phoneRegex.test(phone)) {
        alert(
          "Số điện thoại không hợp lệ!\nVí dụ đúng: 0987654321 (10 số, bắt đầu bằng 0)"
        );
        registerForm.phone.focus();
        return;
      }

      if (!emailRegex.test(email)) {
        alert("Email không đúng định dạng!\nVí dụ: ten@gmail.com");
        registerForm.email.focus();
        return;
      }

      if (password.length < 6) {
        alert("Mật khẩu phải có ít nhất 6 ký tự!");
        registerForm.password.focus();
        return;
      }

      // Lưu thông tin đăng ký người bán vào localStorage để admin duyệt
      try {
        let requests = loadSellerRequests();

        // Không cho trùng email đăng ký seller
        if (requests.some(r => r.email === email)) {
          alert("Email này đã đăng ký người bán rồi, vui lòng dùng email khác!");
          return;
        }

        const newId = requests.length > 0 ? (requests[requests.length - 1].id || requests.length) + 1 : 1;

        const now = new Date();
        const isoDate = now.toISOString();

        const request = {
          id: newId,
          email: email,
          phone: phone,
          password: password, // mật khẩu để đăng nhập kênh người bán
          status: "submitted", // Đang chờ duyệt
          shopName: null,
          sellerName: null,
          createdAt: isoDate
        };

        requests.push(request);
        saveSellerRequests(requests);
      } catch (err) {
        console.error("Không thể lưu yêu cầu người bán:", err);
      }

      alert("Đăng ký thành công! Yêu cầu của bạn sẽ được admin duyệt.");

      // Sau khi đăng ký xong quay về trang đăng nhập kênh người bán
      // Dùng đường dẫn tương đối rõ ràng để luôn trỏ tới /ok/login.html
      window.location.href = "./login.html";
    });
  }

  // ============ XỬ LÝ FORM ĐĂNG NHẬP (trang login.html) ============
  const loginForm = document.getElementById("loginForm");

  if (loginForm) {
    loginForm.addEventListener("submit", function (e) {
      e.preventDefault(); // chặn submit mặc định

      const account = loginForm.account.value.trim();
      const password = loginForm.password.value.trim();

      if (!account || !password) {
        alert("Vui lòng nhập đầy đủ Tài khoản và Mật khẩu!");
        return;
      }

      if (password.length < 6) {
        alert("Mật khẩu phải có ít nhất 6 ký tự!");
        loginForm.password.focus();
        return;
      }

      // Login dựa trên danh sách seller_requests
      const requests = loadSellerRequests();
      const req = requests.find(r => r.email === account && r.password === password);

      if (!req) {
        alert("Sai email hoặc mật khẩu, hoặc tài khoản chưa đăng ký kênh người bán!");
        return;
      }

      // Kiểm tra trạng thái duyệt
      if (req.status === "submitted" || !req.status) {
        alert("Tài khoản của bạn đang chờ admin duyệt, vui lòng quay lại sau.");
        return;
      }
      if (req.status === "rejected") {
        alert("Tài khoản người bán của bạn đã bị từ chối. Vui lòng liên hệ hỗ trợ.");
        return;
      }
      if (req.status === "suspended") {
        alert("Tài khoản người bán của bạn đang bị tạm ngưng. Không thể đăng nhập.");
        return;
      }
      if (req.status === "locked") {
        alert("Tài khoản người bán của bạn đã bị khóa. Không thể đăng nhập.");
        return;
      }

      // Chỉ approved mới cho đăng nhập
      if (req.status !== "approved") {
        alert("Trạng thái tài khoản không hợp lệ để đăng nhập.");
        return;
      }

      // Trích xuất tên hiển thị và avatar từ email
      const emailParts = account.split("@");
      const emailName = emailParts[0];
      const displayName = emailName
        .split(/[._-]/)
        .filter(Boolean)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(" ") || account;

      const words = displayName.split(" ");
      const avatarInitials = words.length >= 2
        ? (words[0][0] + words[words.length - 1][0]).toUpperCase()
        : displayName.substring(0, 2).toUpperCase();

      const userInfo = {
        email: account,
        username: account,
        displayName: displayName,
        avatar: avatarInitials
      };

      localStorage.setItem("userInfo", JSON.stringify(userInfo));
      localStorage.setItem("isLoggedIn", "true");

      alert("Đăng nhập thành công!");

      // Chuyển sang trang chính của Kênh Người Bán trong folder ok
      // Đây là trang seller-portal riêng, tách biệt với admin dashboard
      window.location.href = "./index.html";
    });
  }

  // ============ XỬ LÝ FORM QUÊN MẬT KHẨU / ĐẶT LẠI (trang forgot.html) ============
  const forgotForm = document.getElementById("forgotForm");

  if (forgotForm) {
    forgotForm.addEventListener("submit", function (e) {
      e.preventDefault(); // chặn submit mặc định

      const account = forgotForm.account.value.trim();
      const newPassword = forgotForm.newPassword.value.trim();
      const confirmPassword = forgotForm.confirmPassword.value.trim();

      if (!account || !newPassword || !confirmPassword) {
        alert("Vui lòng nhập đầy đủ Tài khoản và hai ô mật khẩu!");
        return;
      }

      if (newPassword.length < 6) {
        alert("Mật khẩu mới phải có ít nhất 6 ký tự!");
        forgotForm.newPassword.focus();
        return;
      }

      if (newPassword !== confirmPassword) {
        alert("Mật khẩu nhập lại không khớp. Vui lòng kiểm tra lại!");
        forgotForm.confirmPassword.focus();
        return;
      }

      // Cập nhật mật khẩu trong danh sách seller_requests nếu tồn tại
      const requests = loadSellerRequests();
      const idx = requests.findIndex(r => r.email === account);
      if (idx === -1) {
        alert("Không tìm thấy tài khoản người bán với email này!");
        return;
      }

      requests[idx].password = newPassword;
      saveSellerRequests(requests);

      alert(
        "Đặt lại mật khẩu thành công!\nBạn hãy đăng nhập bằng mật khẩu mới."
      );

      // Sau khi đặt lại xong, quay về trang đăng nhập
      window.location.href = "login.html";
    });
  }

  // ============ ICON 👁 HIỆN / ẨN MẬT KHẨU (DÙNG CHUNG CHO MỌI TRANG) ============
  const toggles = document.querySelectorAll(".toggle-password");

  toggles.forEach((toggle) => {
    toggle.addEventListener("click", function () {
      const inputId = this.getAttribute("data-input");
      const input = document.getElementById(inputId);
      if (!input) return;

      if (input.type === "password") {
        input.type = "text";
        this.classList.add("active");
        this.textContent = "🙈"; // đang hiện mật khẩu
      } else {
        input.type = "password";
        this.classList.remove("active");
        this.textContent = "👁"; // đang ẩn mật khẩu
      }
    });
  });
});
