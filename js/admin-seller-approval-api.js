// js/admin-seller-approval-api.js

let allApps = [];
let currentStatus = "all";

// map status FE (button) -> status backend
function normStatus(s) {
  s = String(s || "").toLowerCase();
  if (s === "all") return "all";
  if (s === "submitted" || s === "pending") return "Submitted";
  if (s === "approved") return "Approved";
  if (s === "rejected") return "Rejected";
  if (s === "suspended") return "Suspended";
  if (s === "locked") return "Locked";
  return "all";
}

function fmtDate(d) {
  if (!d) return "";
  const dt = new Date(d);
  return isNaN(dt.getTime()) ? "" : dt.toISOString().slice(0, 10);
}

function applyStatus(list, status) {
  const st = normStatus(status);
  if (st === "all") return [...list];
  return list.filter(x => String(x.status).toLowerCase() === st.toLowerCase());
}

// Cập nhật số trên các tab (đang chờ/đã duyệt/...)
function updateTabCounts(list) {
  const count = (st) => list.filter(x => String(x.status).toLowerCase() === st.toLowerCase()).length;

  const setText = (dataStatus, text) => {
    const btn = document.querySelector(`.filter-tab[data-status="${dataStatus}"]`);
    if (btn) btn.textContent = text;
  };

  setText("all", `Tất cả`);
  setText("submitted", `Đang chờ (${count("Submitted")})`);
  setText("approved", `Đã duyệt (${count("Approved")})`);
  setText("rejected", `Từ chối (${count("Rejected")})`);
  setText("suspended", `Tạm ngưng (${count("Suspended")})`);
  setText("locked", `Đã khóa (${count("Locked")})`);
}

function setActiveTab(status) {
  document.querySelectorAll(".filter-tab").forEach(b => b.classList.remove("active"));
  const btn = document.querySelector(`.filter-tab[data-status="${String(status).toLowerCase()}"]`);
  if (btn) btn.classList.add("active");
}

function renderTable(list) {
  const tbody = document.getElementById("sellerTableBody");
  if (!tbody) {
    console.error("Không thấy tbody#sellerTableBody");
    return;
  }

  if (!list.length) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;opacity:.7;padding:18px">Không có kết quả</td></tr>`;
    const info = document.getElementById("sellerPageInfo");
    if (info) info.textContent = "Không có kết quả";
    return;
  }

  tbody.innerHTML = list.map(x => {
    const initials = (x.fullName || x.email || "U").slice(0, 2).toUpperCase();
    return `
      <tr>
        <td style="width:32px"><input type="checkbox" /></td>

        <td>
          <div style="display:flex;align-items:center;gap:10px;">
            <div style="width:36px;height:36px;border-radius:10px;background:#223;display:flex;align-items:center;justify-content:center;font-weight:700">
              ${initials}
            </div>
            <div>
              <div style="font-weight:600">${x.fullName || "Seller"}</div>
              <div style="opacity:.7;font-size:12px">ID: ${x.userId}</div>
            </div>
          </div>
        </td>

        <td>${x.email || ""}<br><span style="opacity:.7;font-size:12px">${x.phone || ""}</span></td>
        <td>${x.kyc ?? ""}</td>
        <td>${x.status}</td>
        <td>${fmtDate(x.createdAt)}</td>

        <td style="display:flex;gap:8px;flex-wrap:wrap">
          <button class="btn-approve" data-id="${x.id}">Duyệt</button>
          <button class="btn-reject" data-id="${x.id}">Từ chối</button>
          <button class="btn-suspend" data-id="${x.id}">Tạm ngưng</button>
          <button class="btn-lock" data-id="${x.id}">Khóa</button>
        </td>
      </tr>
    `;
  }).join("");

  const info = document.getElementById("sellerPageInfo");
  if (info) info.textContent = `Hiển thị 1-${list.length} trong ${list.length} kết quả`;
}

async function loadSellerApps() {
  try {
    const q = document.getElementById("searchInput")?.value?.trim() || "";

    // Luôn lấy ALL để update counts đúng theo search, rồi filter client-side
    allApps = await API.get(`/api/admin/seller-applications?status=all&q=${encodeURIComponent(q)}`);

    updateTabCounts(allApps);
    setActiveTab(currentStatus);

    const filtered = applyStatus(allApps, currentStatus);
    renderTable(filtered);
  } catch (err) {
    console.error(err);
    alert("Lỗi load seller applications: " + (err.message || err));
  }
}

// ✅ HTML đang gọi filterSellers(...) => phải export đúng tên này
window.filterSellers = function (status) {
  currentStatus = String(status || "all").toLowerCase();
  setActiveTab(currentStatus);
  loadSellerApps();
};

// Click hành động (duyệt/từ chối/tạm ngưng/khóa)
document.addEventListener("click", async (e) => {
  const id = e.target?.dataset?.id;
  if (!id) return;

  try {
    if (e.target.classList.contains("btn-approve")) {
      await API.patch(`/api/admin/seller-applications/${id}/approve`);
      return loadSellerApps();
    }

    if (e.target.classList.contains("btn-suspend")) {
      await API.patch(`/api/admin/seller-applications/${id}/suspend`);
      return loadSellerApps();
    }

    if (e.target.classList.contains("btn-lock")) {
      await API.patch(`/api/admin/seller-applications/${id}/lock`);
      return loadSellerApps();
    }

    if (e.target.classList.contains("btn-reject")) {
      const reason = prompt("Lý do từ chối (có thể để trống):") || "";
      // nếu API.patch của bạn hỗ trợ body:
      await API.patch(`/api/admin/seller-applications/${id}/reject`, { reason });

      // nếu API.patch KHÔNG hỗ trợ body, dùng fetch thủ công:
      // await fetch(`${API.base}/api/admin/seller-applications/${id}/reject`, {
      //   method: "PATCH",
      //   headers: { "Content-Type": "application/json", ...(API.authHeader?.()||{}) },
      //   body: JSON.stringify({ reason })
      // });

      return loadSellerApps();
    }
  } catch (err) {
    console.error(err);
    alert(err.message || err);
  }
});

document.addEventListener("DOMContentLoaded", () => {
  // search realtime
  const si = document.getElementById("searchInput");
  if (si) {
    let t = null;
    si.addEventListener("input", () => {
      clearTimeout(t);
      t = setTimeout(loadSellerApps, 250);
    });
  }

  loadSellerApps();
});
