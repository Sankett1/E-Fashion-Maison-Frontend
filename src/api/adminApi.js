import api from "./axiosClient.js";

export const getDashboardStats  = async ()         => { const { data } = await api.get("/admin/dashboard");      return data; };
export const getAllUsers         = async (params)   => { const { data } = await api.get("/admin/users", { params }); return data; };
export const updateUserRole     = async (id, role) => { const { data } = await api.put(`/admin/users/${id}`, { role }); return data; };
export const deactivateUser     = async (id)       => { const { data } = await api.delete(`/admin/users/${id}`); return data; };
export const getRevenueChart    = async ()         => { const { data } = await api.get("/admin/revenue-chart");  return data; };
 
// ── Order admin endpoints (correct paths from orderRoutes) ────────────────────
export const getAllOrdersAdmin  = async (params)   => { const { data } = await api.get("/orders/admin/all",   { params }); return data; };
export const updateOrderStatus  = async (id, st)   => { const { data } = await api.put(`/orders/${id}/status`, { status: st }); return data; };
export const getOrderStats      = async ()         => { const { data } = await api.get("/orders/admin/stats"); return data; };
export const getAnalytics       = async (period ="12")=> { const { data } = await api.get("/admin/analytics",{ params: { period } }); return data; };

// ── Site Content / Story Images ────────────────────────────────────────────────
export const getAboutContent = async () => {
  const { data } = await api.get("/site-content/about");
  return data; // { content }
};

const uploadStory = async (url, formData) => {
  const { data } = await api.put(url, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};
const postStory = async (url, formData) => {
  const { data } = await api.post(url, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

export const updateHeroImage       = (file)              => { const f = new FormData(); f.append("image", file); return uploadStory("/site-content/about/hero", f); };
export const updateCtaImage        = (file)              => { const f = new FormData(); f.append("image", file); return uploadStory("/site-content/about/cta", f); };
export const updateStorySlot       = (slot, file)        => { const f = new FormData(); f.append("image", file); return uploadStory(`/site-content/about/story/${slot}`, f); };
export const addAtelierImage       = (file, label="")    => { const f = new FormData(); f.append("image", file); f.append("label", label); return postStory("/site-content/about/atelier", f); };
export const removeAtelierImage    = async (publicId)    => { const { data } = await api.delete(`/site-content/about/atelier/${encodeURIComponent(publicId)}`); return data; };
export const addJourneyItem        = (file, body)        => { const f = new FormData(); if(file) f.append("image",file); Object.entries(body).forEach(([k,v])=>f.append(k,v)); return postStory("/site-content/about/journey", f); };
export const updateJourneyItem     = (id, file, body)    => { const f = new FormData(); if(file) f.append("image",file); Object.entries(body).forEach(([k,v])=>f.append(k,v)); return uploadStory(`/site-content/about/journey/${id}`, f); };
export const deleteJourneyItem     = async (id)          => { const { data } = await api.delete(`/site-content/about/journey/${id}`); return data; };
export const updateValueImage      = (idx, file, body={})=> { const f = new FormData(); if(file) f.append("image",file); Object.entries(body).forEach(([k,v])=>f.append(k,v)); return uploadStory(`/site-content/about/values/${idx}`, f); };
export const updateTeamMemberApi   = (idx, file, body={})=> { const f = new FormData(); if(file) f.append("image",file); Object.entries(body).forEach(([k,v])=>f.append(k,v)); return uploadStory(`/site-content/about/team/${idx}`, f); };
