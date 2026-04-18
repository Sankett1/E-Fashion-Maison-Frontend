import api from "./axiosClient.js";

// ── Create order (Pending, before payment) ────────────────────────────────────
export const createOrder = async (orderData) => {
  const { data } = await api.post("/orders", orderData);
  return data; // { success, order }
};

// ── Get my orders ─────────────────────────────────────────────────────────────
export const getMyOrders = async () => {
  const { data } = await api.get("/orders/my-orders");
  return data; // { success, orders, count }
};

// ── Get single order ──────────────────────────────────────────────────────────
export const getOrderById = async (id) => {
  const { data } = await api.get(`/orders/${id}`);
  return data; // { success, order }
};

// ── Mark order as paid (generic fallback) ─────────────────────────────────────
export const markOrderPaid = async (id, paymentResult) => {
  const { data } = await api.put(`/orders/${id}/pay`, paymentResult);
  return data;
};

// ── Admin: get all orders ─────────────────────────────────────────────────────
export const getAllOrders = async (params = {}) => {
  const { data } = await api.get("/orders/admin/all", { params });
  return data;
};

// ── Admin: update order status ────────────────────────────────────────────────
export const updateOrderStatus = async (id, payload) => {
  const { data } = await api.put(`/orders/${id}/status`, payload);
  return data;
};

// ── Admin: get order stats ────────────────────────────────────────────────────
export const getOrderStats = async () => {
  const { data } = await api.get("/orders/admin/stats");
  return data;
};

// ── Razorpay: create Razorpay order on server ─────────────────────────────────
// orderId = MongoDB _id of the already-created pending order
export const createRazorpayOrder = async (orderId) => {
  const { data } = await api.post("/orders/razorpay/create", { orderId });
  return data; // { razorpayOrderId, amount, currency, razorpayKeyId, orderNumber, customerName, customerEmail, customerPhone }
};

// ── Razorpay: verify payment signature on server ─────────────────────────────
export const verifyRazorpayPayment = async (payload) => {
  const { data } = await api.post("/orders/razorpay/verify", payload);
  return data; // { success, message, order }
};
