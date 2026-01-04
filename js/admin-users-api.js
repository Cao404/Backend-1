// js/admin-users-api.js

let allUsers = [];

function pick(obj, ...keys) {
  for (const k of keys) {
    if (obj?.[k] !== undefined && obj?.[k] !== null) return obj[k];
  }
  return "";
}

function isLocked(status) {
  const s = String(status ?? "").toLowerCase();
  return s.includes("lock") || s === "0" || s === "locked";
}

function fmtDate(d) {
  if (!d) return "";
  const dt = new Date(d);
  return isNaN(dt.getTime()) ? "" : dt.toISOString().slice(0, 10);
}

document.addEventListener("DOMContentLoaded", () => {
  loadUsers();

  // nếu có sortSelect
  const sortSelect = document.getElementById("sortSelect");
  if (sortSelect) {
    sortSelect.addEventListener("change", () => renderUsers(applyFilter(allUsers)));
  }
});

// để các nút onclick="filterUsers('...')" trong HTML hoạt động
window.filterUsers = function (type) {
  renderUsers(applyFilter(allUsers, type));
};

function applyFilter(users, type = "all") {
  const t = String(type).toLowerCase();
  if (t === "all") return sortUsers([...users]);

  if (t === "admin" || t === "seller" || t === "customer") {
    return sortUsers(users.filter(u => String(pick(u, "role", "Role")).toLowerCase() === t));
  }

  if (t === "active") {
    return sortUsers(users.filter(u => !isLocked(pick(u, "status", "Status"))));
  }

  if (t === "locked") {
    return sortUsers(users.filter(u => isLocked(pick(u, "status", "Status"))));
  }

  return sortUsers([...users]);
}

function sortUsers(users) {
  const sortSelect = document.getElementById("sortSelect");
  const mode = sortSelect?.value || "newest";

  const getName = (u) => String(pick(u, "fullName", "FullName", "email", "Email") || "").toLowerCase();
  const getEmail = (u) => String(pick(u, "email", "Email") || "").toLowerCase();
  const getDate = (u) => new Date(pick(u, "createdAt", "CreatedAt") || 0).getTime();

  if (mode === "oldest") return users.sort((a, b) => getDate(a) - getDate(b));
  if (mode === "name") return users.sort((a, b) => getName(a).localeCompare(getName(b)));
  if (mode === "email") return users.sort((a, b) => getEmail(a).localeCompare(getEmail(b)));

  // newest
  return users.sort((a, b) => getDate(b) - getDate(a));
}

async function loadUsers() {
  try {
    // ✅ dùng API.get (vì bạn đã có API object)
    allUsers = await API.get("/api/admin/users");
    updateCounts(allUsers);
    renderUsers(sortUsers([...allUsers]));
  } catch (err) {
    console.error(err);
    alert("Lỗi load users: " + err.message);
  }
}

function updateCounts(users) {
  const admin = users.filter(u => String(pick(u, "role", "Role")).toLowerCase() === "admin").length;
  const seller = users.filter(u => String(pick(u, "role", "Role")).toLowerCase() === "seller").length;
  const customer = users.filter(u => String(pick(u, "role", "Role")).toLowerCase() === "customer").length;

  const active = users.filter(u => !isLocked(pick(u, "status", "Status"))).length;
  const locked = users.filter(u => isLocked(pick(u, "status", "Status"))).length;

  const set = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  };

  set("count-admin", admin);
  set("count-seller", seller);
  set("count-customer", customer);
  set("count-active", active);
  set("count-locked", locked);
}

function renderUsers(users) {
  const tbody = document.getElementById("userTableBody");
  if (!tbody) {
    console.error("Không tìm thấy <tbody id='userTableBody'> trong admin-users.html");
    return;
  }

  tbody.innerHTML = users.map(u => {
    const id = pick(u, "id", "Id", "_id");
    const fullName = pick(u, "fullName", "FullName") || pick(u, "email", "Email") || "User";
    const email = pick(u, "email", "Email");
    const phone = pick(u, "phone", "Phone");
    const role = pick(u, "role", "Role");
    const status = pick(u, "status", "Status");
    const createdAt = fmtDate(pick(u, "createdAt", "CreatedAt"));

    const locked = isLocked(status);

    return `
      <tr>
        <td style="width:32px"><input type="checkbox" /></td>

        <td>
          <div style="display:flex;align-items:center;gap:10px;">
            <div style="width:36px;height:36px;border-radius:10px;background:#223;display:flex;align-items:center;justify-content:center;font-weight:700">
              ${String(fullName).slice(0,2).toUpperCase()}
            </div>
            <div>
              <div style="font-weight:600">${fullName}</div>
              <div style="opacity:.7;font-size:12px">ID: ${id}</div>
            </div>
          </div>
        </td>

        <td>${email}<br><span style="opacity:.7;font-size:12px">${phone || ""}</span></td>
        <td>${role}</td>
        <td>${status}</td>
        <td>${createdAt}</td>

        <td>
          <button class="btn-lock" data-id="${id}" ${locked ? "" : ""}>Khóa</button>
          <button class="btn-unlock" data-id="${id}">Mở khóa</button>
          <button class="btn-delete" data-id="${id}">Xóa</button>
        </td>
      </tr>
    `;
  }).join("");
}
window.saveUser = async function (e) {
  e.preventDefault();

  const must = (sel) => {
    const el = document.querySelector(sel);
    if (!el) throw new Error("Thiếu element: " + sel);
    return el;
  };

  const fullName = must("#user-name").value.trim();
  const email = must("#user-email").value.trim();
  const phone = must("#user-phone").value.trim();
  const password = must("#user-password").value; // create thì nên bắt buộc
  const roleVal = must("#user-role").value;      // admin | seller | customer
  const statusVal = must("#user-status").value;  // active | locked

  if (!fullName || !email) {
    alert("Vui lòng nhập Họ tên và Email");
    return;
  }
  if (!roleVal) {
    alert("Vui lòng chọn Vai trò");
    return;
  }
  if (!password) {
    alert("Vui lòng nhập Mật khẩu");
    return;
  }

  // map sang format backend (Swagger của bạn đang dùng PascalCase)
  const roleMap = { admin: "Admin", seller: "Seller", customer: "Customer" };
  const statusMap = { active: "Active", locked: "Locked" };

  const payload = {
    fullName,
    email,
    phone,
    passwordHash: password,
    role: roleMap[roleVal] || roleVal,
    status: statusMap[statusVal] || statusVal,
  };

  try {
    await API.post("/api/admin/users", payload);
    await loadUsers(); // reload bảng

    // reset form + đóng modal
    document.getElementById("userForm")?.reset();
    if (window.closeUserModal) closeUserModal();
  } catch (err) {
    console.error(err);
    alert("Tạo user lỗi: " + (err?.message || err));
  }
};


// Click hành động
document.addEventListener("click", async (e) => {
  const id = e.target?.dataset?.id;
  if (!id) return;

  try {
    if (e.target.classList.contains("btn-lock")) {
      await API.patch(`/api/admin/users/${id}/lock`);
      await loadUsers();
    }

    if (e.target.classList.contains("btn-unlock")) {
      await API.patch(`/api/admin/users/${id}/unlock`);
      await loadUsers();
    }

    if (e.target.classList.contains("btn-delete")) {
      if (!confirm("Xóa user này?")) return;
      await API.del(`/api/admin/users/${id}`);
      await loadUsers();
    }
  } catch (err) {
    console.error(err);
    alert(err.message);
  }
});
