import api from "./axiosClient.js";

// ── Create order ──────────────────────────────────────────────────────────────
export const createOrder = async (orderData) => {
  const { data } = await api.post("/orders", orderData);
  return data; // { order }
};

// ── Get my orders ─────────────────────────────────────────────────────────────
export const getMyOrders = async () => {
  const { data } = await api.get("/orders/my-orders");
  return data; // { orders, count }
};

// ── Get single order ──────────────────────────────────────────────────────────
export const getOrderById = async (id) => {
  const { data } = await api.get(`/orders/${id}`);
  return data; // { order }
};

// ── Mark order as paid ────────────────────────────────────────────────────────
export const markOrderPaid = async (id, paymentResult) => {
  const { data } = await api.put(`/orders/${id}/pay`, paymentResult);
  return data;
};

// ── Admin: get all orders ─────────────────────────────────────────────────────
export const getAllOrders = async (params = {}) => {
  const { data } = await api.get("/orders", { params });
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

// ── Razorpay: create Razorpay order (server-side) ────────────────────────────
export const createRazorpayOrder = async (orderId) => {
  const { data } = await api.post("/orders/razorpay/create", { orderId });
  return data; // { razorpayOrderId, amount, currency, razorpayKeyId, ... }
};

// ── Razorpay: verify payment signature (server-side) ─────────────────────────
export const verifyRazorpayPayment = async (payload) => {
  const { data } = await api.post("/orders/razorpay/verify", payload);
  return data; // { success, order }
};

