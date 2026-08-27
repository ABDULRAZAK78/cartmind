const HOSTNAME = typeof window !== "undefined" && window.location.hostname ? window.location.hostname : "127.0.0.1";
const BASE_URL = `http://${HOSTNAME}:8000/api`;

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    ...options,
  });
  if (!res.ok) {
    let errMsg = `API error ${res.status}`;
    try {
      const errObj = await res.json();
      errMsg = errObj.error || (typeof errObj === "string" ? errObj : Object.values(errObj)[0]) || errMsg;
      if (Array.isArray(errMsg)) errMsg = errMsg[0];
    } catch {
      const text = await res.text();
      if (text) errMsg = text;
    }
    throw new Error(errMsg);
  }
  return res.json();
}

export const api = {
  // Auth
  register: async (payload) => {
    const data = await request("/auth/register/", { method: "POST", body: JSON.stringify(payload) });
    if (data?.user && typeof localStorage !== "undefined") {
      localStorage.setItem("cartmind_user", JSON.stringify(data.user));
    }
    return data;
  },
  login: async (payload) => {
    const data = await request("/auth/login/", { method: "POST", body: JSON.stringify(payload) });
    if (data?.user && typeof localStorage !== "undefined") {
      localStorage.setItem("cartmind_user", JSON.stringify(data.user));
    }
    return data;
  },
  logout: async () => {
    if (typeof localStorage !== "undefined") {
      localStorage.removeItem("cartmind_user");
    }
    try {
      await request("/auth/logout/", { method: "POST" });
    } catch {}
    return { success: true };
  },
  getMe: async () => {
    try {
      const res = await request("/auth/me/");
      if (res?.user) {
        if (typeof localStorage !== "undefined") localStorage.setItem("cartmind_user", JSON.stringify(res.user));
        return res;
      }
    } catch {}
    if (typeof localStorage !== "undefined") {
      const saved = localStorage.getItem("cartmind_user");
      if (saved) {
        try {
          return { user: JSON.parse(saved) };
        } catch {}
      }
    }
    return { user: null };
  },

  // Products & Cart
  getProducts: () => request("/products/"),
  getCart: (sessionId) => request(`/cart/${sessionId}/`),
  addItem: (sessionId, productId, quantity = 1, customerName = null) =>
    request(`/cart/${sessionId}/add_item/`, {
      method: "POST",
      body: JSON.stringify({ product_id: productId, quantity, customer_name: customerName }),
    }),
  removeItem: (sessionId, productId) =>
    request(`/cart/${sessionId}/remove_item/`, {
      method: "POST",
      body: JSON.stringify({ product_id: productId }),
    }),
  abandonCart: (sessionId, customerName = null) =>
    request(`/cart/${sessionId}/abandon/`, {
      method: "POST",
      body: JSON.stringify({ customer_name: customerName }),
    }),
  getAbandonedCarts: () => request("/cart/abandoned/"),
  generateRecovery: (sessionId) =>
    request("/agent/recover/", {
      method: "POST",
      body: JSON.stringify({ session_id: sessionId }),
    }),
  markRecovered: (decisionId, amount) =>
    request("/agent/mark_recovered/", {
      method: "POST",
      body: JSON.stringify({ decision_id: decisionId, amount }),
    }),
  getDashboard: () => request("/agent/dashboard/"),
  createOrder: (sessionId, discountPercent = 0) =>
    request("/payments/create_order/", {
      method: "POST",
      body: JSON.stringify({ session_id: sessionId, discount_percent: discountPercent }),
    }),
  verifyPayment: (payload) =>
    request("/payments/verify/", { method: "POST", body: JSON.stringify(payload) }),
};
