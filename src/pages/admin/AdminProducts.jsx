import { useState, useEffect, useRef } from "react";
import AdminLayout from "./AdminLayout";
import { C, Spinner } from "../../components/shared";
import { getProducts, createProduct, updateProduct, deleteProduct } from "../../api/productApi";

const CATEGORIES = ["Women", "Men", "Accessories", "Kids"];
const TAGS = ["", "NEW", "SALE", "TRENDING"];

// Sub-categories per category — must match exactly what ShopPage filters on
const SUB_CATEGORIES = {
  Women:       ["Dresses", "Tops", "Trousers", "Outerwear", "Knitwear", "Shoes"],
  Men:         ["Shirts", "Trousers", "Suits", "Outerwear", "Knitwear", "Shoes"],
  Accessories: ["Bags", "Scarves", "Belts", "Jewellery", "Sunglasses", "Hats"],
  Kids:        ["Tops", "Bottoms", "Outerwear", "Shoes"],
};

const DEMO_PRODUCTS = [
  { _id: "1", name: "Navy Pinstripe Blazer",   category: "Men",         subCategory: "Suits",     price: 18500, stock: 12, tag: "NEW",  isActive: true,  images: [{ url: "https://images.unsplash.com/photo-1594938298870-5100bf2e3c8c?w=200&q=80&fit=crop" }] },
  { _id: "2", name: "Belted Trench Coat",       category: "Women",       subCategory: "Outerwear", price: 24900, stock: 8,  tag: "NEW",  isActive: true,  images: [{ url: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=200&q=80&fit=crop" }] },
  { _id: "3", name: "Chelsea Leather Boots",    category: "Accessories", subCategory: "Shoes",     price: 12750, stock: 3,  tag: "SALE", isActive: true,  images: [{ url: "https://images.unsplash.com/photo-1638247025967-51873b8a5a6b?w=200&q=80&fit=crop" }] },
  { _id: "4", name: "Silk Satin Blouse",        category: "Women",       subCategory: "Tops",      price: 8200,  stock: 15, tag: "SALE", isActive: true,  images: [{ url: "https://images.unsplash.com/photo-1485968579580-ee2a6b1e450f?w=200&q=80&fit=crop" }] },
  { _id: "5", name: "Cashmere Wrap Cardigan",   category: "Women",       subCategory: "Knitwear",  price: 19500, stock: 2,  tag: "SALE", isActive: false, images: [{ url: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=200&q=80&fit=crop" }] },
  { _id: "6", name: "Leather Crossbody Bag",    category: "Accessories", subCategory: "Bags",      price: 16800, stock: 22, tag: "NEW",  isActive: true,  images: [{ url: "https://images.unsplash.com/photo-1548036161-65bde8cd75d4?w=200&q=80&fit=crop" }] },
  { _id: "7", name: "Shawl Collar Overcoat",    category: "Men",         subCategory: "Outerwear", price: 34500, stock: 10, tag: null,   isActive: true,  images: [{ url: "https://images.unsplash.com/photo-1520975916090-8105d898b5a1?w=200&q=80&fit=crop" }] },
  { _id: "8", name: "Heritage Silk Scarf",      category: "Accessories", subCategory: "Scarves",   price: 6500,  stock: 60, tag: null,   isActive: true,  images: [{ url: "https://images.unsplash.com/photo-1601924638-f3a5efb9f5c9?w=200&q=80&fit=crop" }] },
];

const tagColor = t => ({ NEW: C.gold, SALE: "#f09090", TRENDING: "#90c0f0" }[t] || "transparent");

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [modal, setModal]       = useState(null);
  const [editing, setEditing]   = useState(null);
  const [search, setSearch]     = useState("");
  const [saving, setSaving]     = useState(false);
  const [page, setPage]         = useState(1);
  const [total, setTotal]       = useState(0);
  const [previews, setPreviews] = useState([]);
  const [files, setFiles]       = useState([]);
  const fileRef = useRef(null);

  const EMPTY = {
    name: "", price: "", category: "Women", subCategory: "Dresses",
    stock: "", tag: "", description: "", fabric: "", careInstructions: "", isFeatured: false,
  };
  const [form, setForm] = useState(EMPTY);

  // When category changes, reset subCategory to first option of new category
  const setCategory = (cat) => {
    const firstSub = SUB_CATEGORIES[cat]?.[0] || "";
    setForm(v => ({ ...v, category: cat, subCategory: firstSub }));
  };

  const load = async (p = 1) => {
    setLoading(true);
    try {
      const data = await getProducts({ page: p, limit: 8, keyword: search });
      setProducts(data.products || []);
      setTotal(data.total || 0);
    } catch {
      setProducts(DEMO_PRODUCTS);
      setTotal(DEMO_PRODUCTS.length);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(page); }, [page, search]);

  const openAdd = () => {
    setForm(EMPTY); setEditing(null); setFiles([]); setPreviews([]); setModal("add");
  };

  const openEdit = (p) => {
    setForm({
      name:             p.name,
      price:            p.price,
      category:         p.category,
      subCategory:      p.subCategory || SUB_CATEGORIES[p.category]?.[0] || "",
      stock:            p.stock,
      tag:              p.tag || "",
      description:      p.description || "",
      fabric:           p.fabric || "",
      careInstructions: p.careInstructions || "",
      isFeatured:       p.isFeatured || false,
    });
    setEditing(p); setFiles([]); setPreviews([]); setModal("edit");
  };

  const handleFiles = (e) => {
    const selected = [...e.target.files];
    setFiles(selected);
    setPreviews(selected.map(f => URL.createObjectURL(f)));
  };

  const handleSave = async () => {
    if (!form.name || !form.price || !form.stock) {
      alert("Name, price and stock are required."); return;
    }
    if (!form.subCategory) {
      alert("Please select a sub-category."); return;
    }
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      files.forEach(f => fd.append("images", f));

      if (modal === "add") await createProduct(fd);
      else await updateProduct(editing._id, fd);

      setModal(null); load(page);
    } catch (e) {
      alert(e?.response?.data?.message || "Error saving — ensure backend is running.");
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this product permanently?")) return;
    try { await deleteProduct(id); load(page); }
    catch { alert("Error deleting product."); }
  };

  const InputField = ({ label, field, type = "text", half = false }) => (
    <div style={{ gridColumn: half ? "span 1" : "span 2" }}>
      <label style={{ display: "block", fontSize: "9px", letterSpacing: "0.18em", color: "rgba(255,255,255,0.4)", marginBottom: "7px" }}>
        {label.toUpperCase()}
      </label>
      <input
        type={type}
        value={form[field] ?? ""}
        onChange={e => setForm(v => ({ ...v, [field]: e.target.value }))}
        style={{ width: "100%", padding: "11px 14px", background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(201,168,76,0.2)", color: "#fff", fontSize: "13px",
          outline: "none", fontFamily: "inherit", boxSizing: "border-box" }}
      />
    </div>
  );

  const SelectField = ({ label, field, options, onChange, half = true }) => (
    <div style={{ gridColumn: half ? "span 1" : "span 2" }}>
      <label style={{ display: "block", fontSize: "9px", letterSpacing: "0.18em", color: "rgba(255,255,255,0.4)", marginBottom: "7px" }}>
        {label.toUpperCase()}
      </label>
      <select
        value={form[field]}
        onChange={onChange || (e => setForm(v => ({ ...v, [field]: e.target.value })))}
        style={{ width: "100%", padding: "11px 14px", background: "#0d0a06",
          border: "1px solid rgba(201,168,76,0.2)", color: "#fff", fontSize: "13px",
          fontFamily: "inherit", outline: "none" }}
      >
        {options.map(o => (
          <option key={typeof o === "string" ? o : o.value} value={typeof o === "string" ? o : o.value}>
            {typeof o === "string" ? o : o.label}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <AdminLayout title="Products">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", gap: "16px" }}>
        <input
          value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search products…"
          style={{ padding: "10px 16px", background: "#0f0c08", border: "1px solid rgba(201,168,76,0.25)",
            color: "#fff", fontSize: "12px", outline: "none", width: "280px", fontFamily: "inherit" }}
        />
        <button onClick={openAdd} style={{ padding: "10px 24px", background: C.gold, color: "#0f0c08",
          border: "none", fontSize: "10px", letterSpacing: "0.18em", cursor: "pointer",
          fontFamily: "inherit", fontWeight: 700, whiteSpace: "nowrap" }}>
          + ADD PRODUCT
        </button>
      </div>

      {/* Product table */}
      <div style={{ background: "linear-gradient(135deg,#0f0c08,#110e08)", border: "1px solid rgba(201,168,76,0.15)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(201,168,76,0.15)" }}>
              {["", "Product", "Category", "Sub-Category", "Price", "Stock", "Tag", "Status", "Actions"].map((h, i) => (
                <th key={i} style={{ padding: "14px 12px", textAlign: "left", fontSize: "9px",
                  letterSpacing: "0.2em", color: "rgba(255,255,255,0.3)", fontWeight: 400 }}>
                  {h.toUpperCase()}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={9} style={{ padding: "56px", textAlign: "center", color: C.gold }}><Spinner /></td></tr>
            ) : products.map(p => (
              <tr key={p._id}
                style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", transition: "background 0.15s" }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.02)"}
                onMouseLeave={e => e.currentTarget.style.background = ""}>
                {/* Thumbnail */}
                <td style={{ padding: "10px 12px", width: "52px" }}>
                  <div style={{ width: "40px", height: "52px", overflow: "hidden", background: "rgba(255,255,255,0.05)" }}>
                    {p.images?.[0]?.url
                      ? <img src={p.images[0].url} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => { e.target.style.display = "none"; }} />
                      : <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg,#2a1e0a,#1a1208)" }} />
                    }
                  </div>
                </td>
                <td style={{ padding: "10px 12px", fontSize: "13px", color: "rgba(255,255,255,0.8)", maxWidth: "180px" }}>
                  <div style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</div>
                  {p.isFeatured && <div style={{ fontSize: "8.5px", letterSpacing: "0.12em", color: C.gold, marginTop: "3px" }}>★ FEATURED</div>}
                </td>
                <td style={{ padding: "10px 12px", fontSize: "10px", letterSpacing: "0.1em", color: "rgba(255,255,255,0.45)" }}>{p.category}</td>
                {/* SUB-CATEGORY — highlighted if missing so admin knows to fix it */}
                <td style={{ padding: "10px 12px", fontSize: "10px", letterSpacing: "0.08em",
                  color: p.subCategory ? C.gold : "#f09090" }}>
                  {p.subCategory || "⚠ NOT SET"}
                </td>
                <td style={{ padding: "10px 12px", fontSize: "13px", color: C.gold }}>₹{p.price?.toLocaleString()}</td>
                <td style={{ padding: "10px 12px", fontSize: "12px", color: p.stock <= 5 ? "#f09090" : "rgba(255,255,255,0.6)" }}>
                  {p.stock}
                  {p.stock <= 5 && <span style={{ fontSize: "8px", letterSpacing: "0.1em", color: "#f09090", display: "block" }}>LOW</span>}
                </td>
                <td style={{ padding: "10px 12px" }}>
                  {p.tag && (
                    <span style={{ fontSize: "8.5px", letterSpacing: "0.12em", padding: "3px 8px",
                      border: `1px solid ${tagColor(p.tag)}40`, color: tagColor(p.tag),
                      background: `${tagColor(p.tag)}10` }}>
                      {p.tag}
                    </span>
                  )}
                </td>
                <td style={{ padding: "10px 12px" }}>
                  <span style={{ fontSize: "8.5px", letterSpacing: "0.1em", padding: "3px 8px",
                    border: `1px solid ${p.isActive !== false ? "#7ab87a40" : "rgba(255,80,80,0.3)"}`,
                    color: p.isActive !== false ? "#7ab87a" : "#f09090",
                    background: p.isActive !== false ? "rgba(122,184,122,0.08)" : "rgba(255,80,80,0.06)" }}>
                    {p.isActive !== false ? "ACTIVE" : "INACTIVE"}
                  </span>
                </td>
                <td style={{ padding: "10px 12px" }}>
                  <div style={{ display: "flex", gap: "6px" }}>
                    <button onClick={() => openEdit(p)}
                      style={{ background: "none", border: "1px solid rgba(201,168,76,0.3)", color: C.gold,
                        padding: "5px 10px", fontSize: "9px", letterSpacing: "0.12em",
                        cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}>
                      EDIT
                    </button>
                    <button onClick={() => handleDelete(p._id)}
                      style={{ background: "none", border: "1px solid rgba(255,80,80,0.3)", color: "#f09090",
                        padding: "5px 10px", fontSize: "9px", letterSpacing: "0.12em",
                        cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}>
                      DEL
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!loading && !products.length && (
              <tr><td colSpan={9} style={{ padding: "56px", textAlign: "center", color: "rgba(255,255,255,0.2)", fontSize: "14px" }}>No products found</td></tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div style={{ padding: "14px 16px", borderTop: "1px solid rgba(255,255,255,0.05)",
          display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)" }}>{products.length} of {total} products</div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
              style={{ padding: "6px 14px", background: "none", border: "1px solid rgba(201,168,76,0.2)",
                color: page === 1 ? "rgba(255,255,255,0.2)" : C.gold,
                cursor: page === 1 ? "default" : "pointer", fontSize: "10px", fontFamily: "inherit" }}>
              ← PREV
            </button>
            <span style={{ padding: "6px 12px", fontSize: "10px", color: "rgba(255,255,255,0.4)" }}>Page {page}</span>
            <button disabled={products.length < 8} onClick={() => setPage(p => p + 1)}
              style={{ padding: "6px 14px", background: "none", border: "1px solid rgba(201,168,76,0.2)",
                color: products.length < 8 ? "rgba(255,255,255,0.2)" : C.gold,
                cursor: products.length < 8 ? "default" : "pointer", fontSize: "10px", fontFamily: "inherit" }}>
              NEXT →
            </button>
          </div>
        </div>
      </div>

      {/* ── Add / Edit Modal ─────────────────────────────────────────────────── */}
      {modal && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.88)", zIndex: 1000,
            display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}
          onClick={() => setModal(null)}
        >
          <div
            style={{ background: "#0d0a06", border: "1px solid rgba(201,168,76,0.2)",
              borderTop: `3px solid ${C.gold}`, width: "100%", maxWidth: "640px",
              maxHeight: "90vh", overflowY: "auto", padding: "36px" }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: "22px", color: "#fff", marginBottom: "28px" }}>
              {modal === "add" ? "Add New Product" : `Edit — ${editing?.name}`}
            </div>

            {/* Image upload */}
            <div style={{ marginBottom: "24px" }}>
              <label style={{ display: "block", fontSize: "9px", letterSpacing: "0.18em", color: "rgba(255,255,255,0.4)", marginBottom: "10px" }}>
                PRODUCT IMAGES (up to 6)
              </label>
              <div
                onClick={() => fileRef.current?.click()}
                style={{ border: "1px dashed rgba(201,168,76,0.3)", padding: "20px",
                  textAlign: "center", cursor: "pointer", background: "rgba(201,168,76,0.03)", transition: "all 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = C.gold; e.currentTarget.style.background = "rgba(201,168,76,0.06)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(201,168,76,0.3)"; e.currentTarget.style.background = "rgba(201,168,76,0.03)"; }}
              >
                <div style={{ fontSize: "28px", marginBottom: "8px" }}>📷</div>
                <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", letterSpacing: "0.12em" }}>CLICK TO UPLOAD IMAGES</div>
                <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.25)", marginTop: "4px" }}>JPG, PNG, WEBP · Max 5MB each</div>
              </div>
              <input ref={fileRef} type="file" multiple accept="image/*" onChange={handleFiles} style={{ display: "none" }} />

              {/* Existing images in edit mode */}
              {modal === "edit" && editing?.images?.length > 0 && previews.length === 0 && (
                <div style={{ display: "flex", gap: "10px", marginTop: "12px", flexWrap: "wrap" }}>
                  {editing.images.map((img, i) => (
                    <div key={i} style={{ width: "72px", height: "90px", overflow: "hidden",
                      border: "1px solid rgba(201,168,76,0.2)", position: "relative" }}>
                      <img src={img.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0,
                        background: "rgba(0,0,0,0.6)", fontSize: "8px", color: "rgba(255,255,255,0.5)",
                        textAlign: "center", padding: "2px" }}>SAVED</div>
                    </div>
                  ))}
                </div>
              )}

              {/* New previews */}
              {previews.length > 0 && (
                <div style={{ display: "flex", gap: "10px", marginTop: "12px", flexWrap: "wrap" }}>
                  {previews.map((src, i) => (
                    <div key={i} style={{ width: "72px", height: "90px", overflow: "hidden",
                      border: `1px solid ${C.gold}40`, position: "relative" }}>
                      <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0,
                        background: `rgba(201,168,76,0.7)`, fontSize: "8px", color: "#0f0c08",
                        textAlign: "center", padding: "2px", fontWeight: 700 }}>NEW</div>
                    </div>
                  ))}
                  <button onClick={() => { setFiles([]); setPreviews([]); }}
                    style={{ width: "72px", height: "90px", background: "none",
                      border: "1px dashed rgba(255,80,80,0.3)", color: "#f09090",
                      cursor: "pointer", fontSize: "10px", fontFamily: "inherit" }}>
                    CLEAR
                  </button>
                </div>
              )}
            </div>

            {/* Form fields */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "14px" }}>
              <InputField label="Product Name"       field="name" />
              <div style={{ gridColumn: "span 2" }}>
                <label style={{ display: "block", fontSize: "9px", letterSpacing: "0.18em",
                  color: "rgba(255,255,255,0.4)", marginBottom: "7px" }}>DESCRIPTION</label>
                <textarea value={form.description} onChange={e => setForm(v => ({ ...v, description: e.target.value }))} rows={3}
                  style={{ width: "100%", padding: "11px 14px", background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(201,168,76,0.2)", color: "#fff", fontSize: "13px",
                    outline: "none", fontFamily: "inherit", resize: "vertical", boxSizing: "border-box" }} />
              </div>
              <InputField label="Price (₹)"          field="price"            type="number" half />
              <InputField label="Original Price (₹)" field="originalPrice"    type="number" half />
              <InputField label="Stock Quantity"      field="stock"            type="number" half />
              <InputField label="Fabric / Material"   field="fabric"                        half />
              <InputField label="Care Instructions"   field="careInstructions"              half />

              {/* Category */}
              <SelectField
                label="Category"
                field="category"
                options={CATEGORIES}
                onChange={e => setCategory(e.target.value)}
                half
              />

              {/* Sub-category — dynamically filtered by selected category */}
              <SelectField
                label="Sub-Category ★"
                field="subCategory"
                options={SUB_CATEGORIES[form.category] || []}
                half
              />

              {/* Tag */}
              <SelectField
                label="Tag"
                field="tag"
                options={[{ value: "", label: "None" }, ...TAGS.filter(Boolean).map(t => ({ value: t, label: t }))]}
                half
              />
            </div>

            {/* Featured toggle */}
            <div style={{ marginBottom: "28px", display: "flex", alignItems: "center", gap: "12px" }}>
              <div onClick={() => setForm(v => ({ ...v, isFeatured: !v.isFeatured }))}
                style={{ width: "40px", height: "22px",
                  background: form.isFeatured ? C.gold : "rgba(255,255,255,0.1)",
                  borderRadius: "11px", position: "relative", cursor: "pointer",
                  transition: "background 0.25s", flexShrink: 0 }}>
                <div style={{ position: "absolute", top: "3px",
                  left: form.isFeatured ? "21px" : "3px", width: "16px", height: "16px",
                  background: form.isFeatured ? "#0f0c08" : "rgba(255,255,255,0.4)",
                  borderRadius: "50%", transition: "left 0.25s" }} />
              </div>
              <span style={{ fontSize: "10px", letterSpacing: "0.14em",
                color: form.isFeatured ? C.gold : "rgba(255,255,255,0.4)" }}>
                {form.isFeatured ? "★ FEATURED PRODUCT" : "Mark as featured"}
              </span>
            </div>

            {/* Sub-category reminder */}
            <div style={{ padding: "10px 14px", background: "rgba(201,168,76,0.05)",
              border: "1px solid rgba(201,168,76,0.2)", marginBottom: "20px",
              fontFamily: "'Cormorant Garamond',serif", fontSize: "11px",
              color: "rgba(201,168,76,0.7)", letterSpacing: "0.06em" }}>
              ★ Sub-Category is required for navbar filtering (e.g. Women → Dresses shows only Dresses).
            </div>

            <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end",
              paddingTop: "20px", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
              <button onClick={() => setModal(null)}
                style={{ padding: "12px 24px", background: "none",
                  border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.5)",
                  fontSize: "10px", letterSpacing: "0.16em", cursor: "pointer", fontFamily: "inherit" }}>
                CANCEL
              </button>
              <button onClick={handleSave} disabled={saving}
                style={{ padding: "12px 32px",
                  background: saving ? "rgba(201,168,76,0.4)" : C.gold,
                  color: "#0f0c08", border: "none", fontSize: "10px",
                  letterSpacing: "0.18em", cursor: saving ? "not-allowed" : "pointer",
                  fontFamily: "inherit", fontWeight: 700,
                  display: "flex", alignItems: "center", gap: "8px" }}>
                {saving && <Spinner />}
                {saving ? "SAVING…" : modal === "add" ? "CREATE PRODUCT" : "SAVE CHANGES"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
