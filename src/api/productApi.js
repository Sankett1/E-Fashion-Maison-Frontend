import api from "./axiosClient.js";

// ── Get all products (with filters) ──────────────────────────────────────────
export const getProducts = async (params = {}) => {
  const { data } = await api.get("/products", { params });
  return data; // { products, total, pages, page, count }
};

// ── Get featured products ─────────────────────────────────────────────────────
export const getFeaturedProducts = async () => {
  const { data } = await api.get("/products/featured");
  return data;
};

// ── Get single product ────────────────────────────────────────────────────────
export const getProductById = async (id) => {
  const { data } = await api.get(`/products/${id}`);
  return data; // { product }
};

// ── Add review ────────────────────────────────────────────────────────────────
export const addReview = async (productId, { rating, comment }) => {
  const { data } = await api.post(`/products/${productId}/review`, { rating, comment });
  return data;
};

// ── Get colour variants (products sharing the same colorGroup) ────────────────
export const getColorVariants = async (id) => {
  const { data } = await api.get(`/products/${id}/color-variants`);
  return data; // { variants: [...] }
};


export const toggleWishlist = async (productId) => {
  const { data } = await api.put(`/products/${productId}/wishlist`);
  return data; // { wishlist: [...] }
};

// ── Admin: create product ─────────────────────────────────────────────────────
export const createProduct = async (formData) => {
  const { data } = await api.post("/products", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

// ── Admin: update product ─────────────────────────────────────────────────────
export const updateProduct = async (id, payload) => {
  // payload must be a FormData (multipart) — same as createProduct
  const { data } = await api.put(`/products/${id}`, payload, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

// ── Admin: delete product ─────────────────────────────────────────────────────
export const deleteProduct = async (id) => {
  const { data } = await api.delete(`/products/${id}`);
  return data;
};

// ── Admin: delete product image ───────────────────────────────────────────────
export const deleteProductImage = async (productId, imagePublicId) => {
  const { data } = await api.delete(`/products/${productId}/image/${imagePublicId}`);
  return data;
};
