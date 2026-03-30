import api from "./axiosClient.js";

export const getDashboardStats  = async ()         => { const { data } = await api.get("/admin/dashboard"); return data; };
export const getAllUsers         = async (params)   => { const { data } = await api.get("/admin/users", { params }); return data; };
export const updateUserRole     = async (id, role) => { const { data } = await api.put(`/admin/users/${id}`, { role }); return data; };
export const deactivateUser     = async (id)       => { const { data } = await api.delete(`/admin/users/${id}`); return data; };
export const getRevenueChart    = async ()         => { const { data } = await api.get("/admin/revenue-chart"); return data; };
// Fixed endpoints
export const getAllOrdersAdmin   = async (params)   => { const { data } = await api.get("/orders/admin/all", { params }); return data; };
export const updateOrderStatus  = async (id, st)   => { const { data } = await api.put(`/orders/${id}/status`, { status: st }); return data; };
export const getOrderStats      = async ()         => { const { data } = await api.get("/orders/admin/stats"); return data; };
