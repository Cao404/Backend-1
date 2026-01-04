// js/api.js
(() => {
    const API_BASE = "http://localhost:5118"; // backend của bạn
  
    async function request(path, options = {}) {
      const res = await fetch(API_BASE + path, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...(options.headers || {}),
        },
        // Nếu dùng cookie/session thì mở dòng dưới:
        // credentials: "include",
      });
  
      const contentType = res.headers.get("content-type") || "";
      const isJson = contentType.includes("application/json");
      const data = isJson ? await res.json().catch(() => null) : await res.text().catch(() => "");
  
      if (!res.ok) {
        const msg =
          (data && data.message) ? data.message :
          (typeof data === "string" ? data : `HTTP ${res.status}`);
        throw new Error(msg);
      }
      return data;
    }
  
    window.API = {
      get: (path) => request(path, { method: "GET" }),
      post: (path, body) => request(path, { method: "POST", body: JSON.stringify(body) }),
      put: (path, body) => request(path, { method: "PUT", body: JSON.stringify(body) }),
      patch: (path, body) => request(path, { method: "PATCH", body: body ? JSON.stringify(body) : undefined }),
      del: (path) => request(path, { method: "DELETE" }),
    };
  })();
  