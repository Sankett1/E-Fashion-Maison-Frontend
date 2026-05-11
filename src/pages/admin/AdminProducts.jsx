import { useState, useEffect, useRef, useCallback } from "react";
import AdminLayout from "./AdminLayout";
import { C, Spinner } from "../../components/shared";
import { getProducts, createProduct, updateProduct, deleteProduct } from "../../api/productApi";

const CATEGORIES = ["Women", "Men", "Accessories", "Kids"];
const TAGS = ["", "NEW", "SALE", "TRENDING"];

/* ─── Full website category / subcategory map ───────────────────────────────── */
const CATEGORY_MAP = {
  Women: [
    "Dresses", "Tops & Blouses", "Trousers & Pants", "Skirts",
    "Outerwear & Coats", "Knitwear & Cardigans", "Suits & Blazers",
    "Activewear", "Swimwear", "Lingerie & Loungewear",
    "Shoes & Heels", "Bags & Purses", "Accessories",
  ],
  Men: [
    "Shirts & Polos", "T-Shirts", "Trousers & Chinos", "Jeans",
    "Suits & Blazers", "Outerwear & Coats", "Knitwear & Jumpers",
    "Activewear", "Swimwear", "Underwear & Loungewear",
    "Shoes & Boots", "Bags & Wallets", "Accessories",
  ],
  Accessories: [
    "Bags", "Clutches & Evening Bags", "Backpacks",
    "Silk Scarves", "Belts", "Fine Jewellery",
    "Watches", "Sunglasses", "Hats & Caps",
    "Wallets & Card Holders", "Ties & Pocket Squares",
    "Gloves", "Hair Accessories",
  ],
  Kids: [
    "Girls 2–8 yrs", "Girls 8–14 yrs", "Boys 2–8 yrs", "Boys 8–14 yrs",
    "Baby 0–24 months", "Shoes", "Accessories",
  ],
};

/* ─── Named colour palette ──────────────────────────────────────────────────── */
const COLOUR_PALETTE = [
  { name:"Noir Black",    hex:"#000000" },{ name:"Jet Black",     hex:"#0a0a0a" },
  { name:"Charcoal",      hex:"#2c2c2c" },{ name:"Graphite",      hex:"#444444" },
  { name:"Gunmetal",      hex:"#555b6e" },{ name:"Dark Espresso", hex:"#1c1714" },
  { name:"Dark Mahogany", hex:"#1a1208" },{ name:"Ivory White",   hex:"#ffffff" },
  { name:"Off White",     hex:"#f5f0eb" },{ name:"Linen Cream",   hex:"#f0e6d6" },
  { name:"Champagne",     hex:"#e8d5b0" },{ name:"Antique White", hex:"#faebd7" },
  { name:"Light Grey",    hex:"#d3d3d3" },{ name:"Silver",        hex:"#c0c0c0" },
  { name:"Slate Grey",    hex:"#708090" },{ name:"Steel Grey",    hex:"#636363" },
  { name:"French Grey",   hex:"#bdb9b1" },{ name:"Camel",        hex:"#c19a6b" },
  { name:"Tan",           hex:"#d2b48c" },{ name:"Sand",          hex:"#c2b280" },
  { name:"Caramel",       hex:"#c68642" },{ name:"Warm Brown",    hex:"#8b6347" },
  { name:"Walnut",        hex:"#5c4033" },{ name:"Chocolate",     hex:"#3d1c02" },
  { name:"Sienna",        hex:"#a0522d" },{ name:"Saddle Brown",  hex:"#8b4513" },
  { name:"Maison Gold",   hex:"#c9a84c" },{ name:"Gold",          hex:"#ffd700" },
  { name:"Amber",         hex:"#ffbf00" },{ name:"Bronze",        hex:"#cd7f32" },
  { name:"Scarlet Red",   hex:"#ff2400" },{ name:"Crimson",       hex:"#dc143c" },
  { name:"Deep Red",      hex:"#8b0000" },{ name:"Burgundy",      hex:"#800020" },
  { name:"Wine",          hex:"#722f37" },{ name:"Maroon",        hex:"#800000" },
  { name:"Terracotta",    hex:"#e2725b" },{ name:"Rust",          hex:"#b7410e" },
  { name:"Coral",         hex:"#ff6b6b" },{ name:"Blush Pink",    hex:"#ffc0cb" },
  { name:"Rose Pink",     hex:"#ff69b4" },{ name:"Dusty Rose",    hex:"#dcae96" },
  { name:"Mauve",         hex:"#e0b0ff" },{ name:"Hot Pink",      hex:"#ff007f" },
  { name:"Orange",        hex:"#ffa500" },{ name:"Burnt Orange",  hex:"#cc5500" },
  { name:"Peach",         hex:"#ffcba4" },{ name:"Mustard",       hex:"#e1ad01" },
  { name:"Lemon Yellow",  hex:"#fff44f" },{ name:"Straw",         hex:"#e4d96f" },
  { name:"Forest Green",  hex:"#228b22" },{ name:"Olive",         hex:"#808000" },
  { name:"Sage Green",    hex:"#9caf88" },{ name:"Mint Green",    hex:"#98ff98" },
  { name:"Emerald",       hex:"#50c878" },{ name:"Hunter Green",  hex:"#355e3b" },
  { name:"Teal",          hex:"#008080" },{ name:"Midnight Navy", hex:"#001f3f" },
  { name:"Navy Blue",     hex:"#000080" },{ name:"Royal Blue",    hex:"#4169e1" },
  { name:"Cobalt Blue",   hex:"#0047ab" },{ name:"Sky Blue",      hex:"#87ceeb" },
  { name:"Powder Blue",   hex:"#b0e0e6" },{ name:"Denim Blue",    hex:"#1560bd" },
  { name:"Prussian Blue", hex:"#003153" },{ name:"Indigo",        hex:"#4b0082" },
  { name:"Purple",        hex:"#800080" },{ name:"Violet",        hex:"#7f00ff" },
  { name:"Lavender",      hex:"#e6e6fa" },{ name:"Lilac",         hex:"#c8a2c8" },
  { name:"Grape",         hex:"#6f2da8" },{ name:"Plum",          hex:"#dda0dd" },
  { name:"Amethyst",      hex:"#9b59b6" },{ name:"Beige",         hex:"#f5f5dc" },
  { name:"Khaki",         hex:"#c3b091" },{ name:"Stone",         hex:"#928e85" },
  { name:"Taupe",         hex:"#483c32" },
];

const isLight = (hex) => {
  try {
    const h = hex.replace("#","");
    const r=parseInt(h.slice(0,2),16), g=parseInt(h.slice(2,4),16), b=parseInt(h.slice(4,6),16);
    return (r*299+g*587+b*114)/1000 > 155;
  } catch { return true; }
};

const tagColor = t => ({ NEW:C.gold, SALE:"#f09090", TRENDING:"#90c0f0" }[t] || "transparent");

const DEMO_PRODUCTS = [
  { _id:"1", name:"Navy Pinstripe Blazer",   category:"Men",         price:18500, stock:12, tag:"NEW",  isActive:true,  images:[{url:"https://images.unsplash.com/photo-1594938298870-5100bf2e3c8c?w=200&q=80&fit=crop"}] },
  { _id:"2", name:"Belted Trench Coat",       category:"Women",       price:24900, stock:8,  tag:"NEW",  isActive:true,  images:[{url:"https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=200&q=80&fit=crop"}] },
  { _id:"3", name:"Chelsea Leather Boots",    category:"Accessories", price:12750, stock:3,  tag:"SALE", isActive:true,  images:[{url:"https://images.unsplash.com/photo-1638247025967-51873b8a5a6b?w=200&q=80&fit=crop"}] },
  { _id:"4", name:"Silk Satin Blouse",        category:"Women",       price:8200,  stock:15, tag:"SALE", isActive:true,  images:[{url:"https://images.unsplash.com/photo-1485968579580-ee2a6b1e450f?w=200&q=80&fit=crop"}] },
];

/* ─── Styles (defined once, never inside render) ────────────────────────────── */
const S = {
  label: {
    display:"block", fontSize:"10px", fontWeight:700, letterSpacing:"0.14em",
    color:"rgba(255,255,255,0.45)", marginBottom:"7px", textTransform:"uppercase",
    fontFamily:"'DM Sans',sans-serif",
  },
  input: {
    width:"100%", padding:"11px 14px",
    background:"rgba(255,255,255,0.05)",
    border:"1.5px solid rgba(201,168,76,0.2)",
    color:"#fff", fontSize:"14px", outline:"none",
    fontFamily:"'DM Sans',sans-serif",
    boxSizing:"border-box", borderRadius:"3px",
    transition:"border-color 0.2s",
  },
  // Native selects need a solid dark bg so options are visible on all OSes
  select: {
    width:"100%", padding:"11px 14px",
    background:"#1a1410",
    border:"1.5px solid rgba(201,168,76,0.2)",
    color:"#fff", fontSize:"14px", outline:"none",
    fontFamily:"'DM Sans',sans-serif",
    boxSizing:"border-box", borderRadius:"3px",
    cursor:"pointer", appearance:"none",
    WebkitAppearance:"none", MozAppearance:"none",
    backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23c9a84c' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
    backgroundRepeat:"no-repeat",
    backgroundPosition:"right 12px center",
    paddingRight:"36px",
    transition:"border-color 0.2s",
  },
};

/* ─── Field components — defined OUTSIDE AdminProducts so React never remounts them ── */
const Field = ({ label, value, onChange, type="text", span2=false, placeholder="" }) => {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ gridColumn: span2 ? "span 2" : "span 1" }}>
      <label style={S.label}>{label}</label>
      <input
        type={type} value={value} placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{ ...S.input, ...(focused ? { borderColor:"rgba(201,168,76,0.6)" } : {}) }}
      />
    </div>
  );
};

const TextArea = ({ label, value, onChange }) => {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ gridColumn:"span 2" }}>
      <label style={S.label}>{label}</label>
      <textarea value={value} rows={3} onChange={e => onChange(e.target.value)}
        onFocus={()=>setFocused(true)} onBlur={()=>setFocused(false)}
        style={{ ...S.input, resize:"vertical", ...(focused?{borderColor:"rgba(201,168,76,0.6)"}:{}) }}
      />
    </div>
  );
};

/* Styled select — solid dark bg so options are readable on all platforms */
const SelectField = ({ label, value, onChange, options, placeholder="" }) => {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label style={S.label}>{label}</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          ...S.select,
          ...(focused ? { borderColor:"rgba(201,168,76,0.7)" } : {}),
        }}
      >
        {placeholder && <option value="" style={{ background:"#1a1410", color:"rgba(255,255,255,0.45)" }}>{placeholder}</option>}
        {options.map(opt => (
          <option
            key={opt.value ?? opt}
            value={opt.value ?? opt}
            style={{ background:"#1a1410", color:"#fff", fontFamily:"'DM Sans',sans-serif", padding:"8px" }}
          >
            {opt.label ?? opt}
          </option>
        ))}
      </select>
    </div>
  );
};

/* ─── Colour Picker ─────────────────────────────────────────────────────────── */
const ColourPicker = ({ selected, onChange }) => {
  const [search, setSearch] = useState("");
  const [open,   setOpen]   = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const fn = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const filtered = COLOUR_PALETTE.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));
  const add    = (hex) => { if (!selected.includes(hex)) onChange([...selected, hex]); setOpen(false); setSearch(""); };
  const remove = (hex) => onChange(selected.filter(c => c !== hex));

  return (
    <div style={{ gridColumn:"span 2" }} ref={ref}>
      <label style={S.label}>Colours</label>

      {/* Selected pills */}
      <div style={{
        minHeight:48, padding:"8px 10px", marginBottom:8,
        background:"rgba(255,255,255,0.03)",
        border:"1.5px solid rgba(201,168,76,0.2)", borderRadius:3,
        display:"flex", flexWrap:"wrap", gap:7, alignItems:"center",
      }}>
        {selected.length === 0
          ? <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13, color:"rgba(255,255,255,0.2)" }}>No colours added yet</span>
          : selected.map(hex => {
              const name = COLOUR_PALETTE.find(c => c.hex === hex)?.name || hex;
              return (
                <div key={hex} style={{
                  display:"flex", alignItems:"center", gap:6,
                  background:"rgba(255,255,255,0.07)",
                  border:"1px solid rgba(255,255,255,0.10)",
                  borderRadius:20, padding:"4px 10px 4px 6px",
                }}>
                  <div style={{
                    width:16, height:16, borderRadius:"50%", background:hex, flexShrink:0,
                    border: isLight(hex) ? "1px solid rgba(0,0,0,0.18)" : "1px solid rgba(255,255,255,0.12)",
                  }}/>
                  <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12, fontWeight:500, color:"rgba(255,255,255,0.8)" }}>{name}</span>
                  <button onClick={()=>remove(hex)} style={{ background:"none", border:"none", cursor:"pointer", color:"rgba(255,255,255,0.35)", fontSize:16, lineHeight:1, padding:"0 0 0 2px", display:"flex", alignItems:"center" }}>×</button>
                </div>
              );
            })
        }
      </div>

      {/* Add button */}
      <button type="button" onClick={()=>setOpen(o=>!o)} style={{
        padding:"8px 16px",
        background: open ? "rgba(201,168,76,0.12)" : "rgba(255,255,255,0.04)",
        border:`1.5px solid ${open?"rgba(201,168,76,0.5)":"rgba(201,168,76,0.22)"}`,
        color: open ? C.gold : "rgba(255,255,255,0.5)",
        fontSize:11, fontWeight:700, letterSpacing:"0.12em",
        fontFamily:"'DM Sans',sans-serif", cursor:"pointer", borderRadius:3,
        transition:"all 0.2s",
      }}>
        + ADD COLOUR
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          marginTop:6, background:"#0d0a06",
          border:"1.5px solid rgba(201,168,76,0.25)", borderRadius:4,
          boxShadow:"0 8px 32px rgba(0,0,0,0.5)", padding:14,
          position:"relative", zIndex:200,
        }}>
          <input autoFocus placeholder="Search colour name…" value={search}
            onChange={e=>setSearch(e.target.value)}
            style={{ ...S.input, marginBottom:12 }}
          />
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))", gap:6, maxHeight:260, overflowY:"auto" }}>
            {filtered.map(c => {
              const added = selected.includes(c.hex);
              return (
                <button key={c.hex} type="button" onClick={()=>!added&&add(c.hex)} style={{
                  display:"flex", alignItems:"center", gap:8,
                  padding:"7px 10px",
                  background: added ? "rgba(201,168,76,0.10)" : "rgba(255,255,255,0.03)",
                  border:`1px solid ${added?"rgba(201,168,76,0.4)":"rgba(255,255,255,0.07)"}`,
                  borderRadius:4, cursor:added?"default":"pointer",
                  opacity:added?0.6:1, textAlign:"left", transition:"all 0.15s",
                }}
                onMouseEnter={e=>{ if(!added) e.currentTarget.style.borderColor="rgba(201,168,76,0.45)"; }}
                onMouseLeave={e=>{ if(!added) e.currentTarget.style.borderColor="rgba(255,255,255,0.07)"; }}>
                  <div style={{
                    width:22, height:22, borderRadius:"50%", flexShrink:0, background:c.hex,
                    border: isLight(c.hex)?"1.5px solid rgba(0,0,0,0.18)":"1.5px solid rgba(255,255,255,0.08)",
                    display:"flex", alignItems:"center", justifyContent:"center",
                  }}>
                    {added && <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2 2.5 4-4" stroke={isLight(c.hex)?"#000":"#fff"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                  </div>
                  <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12, fontWeight:500, color:added?"rgba(201,168,76,0.8)":"rgba(255,255,255,0.75)", lineHeight:1.3 }}>{c.name}</span>
                </button>
              );
            })}
            {filtered.length===0 && (
              <div style={{ gridColumn:"1/-1", padding:"14px 0", textAlign:"center", fontFamily:"'DM Sans',sans-serif", fontSize:12, color:"rgba(255,255,255,0.2)" }}>
                No results for "{search}"
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

/* ─── Main component ─────────────────────────────────────────────────────────── */
const EMPTY = { name:"", price:"", originalPrice:"", category:"Women", subCategory:"", stock:"", tag:"", description:"", fabric:"", careInstructions:"", colorGroup:"", isFeatured:false, colors:[] };

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [modal,    setModal]    = useState(null);
  const [editing,  setEditing]  = useState(null);
  const [search,   setSearch]   = useState("");
  const [saving,   setSaving]   = useState(false);
  const [page,     setPage]     = useState(1);
  const [total,    setTotal]    = useState(0);
  const [previews, setPreviews] = useState([]);
  const [files,    setFiles]    = useState([]);
  const [form,     setForm]     = useState(EMPTY);
  const fileRef = useRef(null);

  // Stable setter — never causes field remount
  const set = useCallback((field, value) => setForm(prev => ({ ...prev, [field]: value })), []);

  const load = async (p=1) => {
    setLoading(true);
    try {
      const data = await getProducts({ page:p, limit:8, keyword:search });
      setProducts(data.products||[]); setTotal(data.total||0);
    } catch { setProducts(DEMO_PRODUCTS); setTotal(DEMO_PRODUCTS.length); }
    finally { setLoading(false); }
  };

  useEffect(()=>{ load(page); }, [page, search]);

  const openAdd = () => { setForm(EMPTY); setEditing(null); setFiles([]); setPreviews([]); setModal("add"); };
  const openEdit = (p) => {
    setForm({ name:p.name, price:p.price, originalPrice:p.originalPrice||"", category:p.category, subCategory:p.subCategory||"", stock:p.stock, tag:p.tag||"",
      description:p.description||"", fabric:p.fabric||"", careInstructions:p.careInstructions||"",
      colorGroup:p.colorGroup||"", isFeatured:p.isFeatured||false, colors:p.colors||[] });
    setEditing(p); setFiles([]); setPreviews([]); setModal("edit");
  };

  const handleFiles = (e) => {
    const sel = [...e.target.files];
    setFiles(sel); setPreviews(sel.map(f=>URL.createObjectURL(f)));
  };

  const handleSave = async () => {
    if (!form.name||!form.price||!form.stock) { alert("Name, price and stock are required."); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      const { colors, ...rest } = form;
      Object.entries(rest).forEach(([k,v]) => fd.append(k, v));
      (colors||[]).forEach(c => fd.append("colors[]", c));
      files.forEach(f => fd.append("images", f));
      if (modal==="add") {
        await createProduct(fd);
      } else {
        fd.append("existingImages", JSON.stringify(editing?.images||[]));
        await updateProduct(editing._id, fd);
      }
      setModal(null); load(page);
    } catch(e) { alert(e?.response?.data?.message||"Error saving."); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this product permanently?")) return;
    try { await deleteProduct(id); load(page); } catch { alert("Error deleting."); }
  };

  return (
    <AdminLayout title="Products">
      {/* Toolbar */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24, gap:16 }}>
        <input value={search} onChange={e=>{ setSearch(e.target.value); setPage(1); }} placeholder="Search products…"
          style={{ ...S.input, width:280, borderRadius:3 }} />
        <button onClick={openAdd} style={{ padding:"10px 24px", background:C.gold, color:"#0f0c08", border:"none", fontSize:11, letterSpacing:"0.16em", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontWeight:700, whiteSpace:"nowrap", borderRadius:3 }}>
          + ADD PRODUCT
        </button>
      </div>

      {/* Table */}
      <div style={{ background:"linear-gradient(135deg,#0f0c08,#110e08)", border:"1px solid rgba(201,168,76,0.15)", borderRadius:4, overflow:"hidden" }}>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead>
            <tr style={{ borderBottom:"1px solid rgba(201,168,76,0.15)" }}>
              {["","Product","Category","Price","Stock","Tag","Status","Actions"].map((h,i)=>(
                <th key={i} style={{ padding:"14px 16px", textAlign:"left", fontSize:10, letterSpacing:"0.14em", color:"rgba(255,255,255,0.3)", fontWeight:700, fontFamily:"'DM Sans',sans-serif" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} style={{ padding:56, textAlign:"center", color:C.gold }}><Spinner/></td></tr>
            ) : products.map(p => (
              <tr key={p._id} style={{ borderBottom:"1px solid rgba(255,255,255,0.04)", transition:"background 0.15s" }}
                onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.02)"}
                onMouseLeave={e=>e.currentTarget.style.background=""}>
                <td style={{ padding:"10px 16px", width:56 }}>
                  <div style={{ width:44, height:56, overflow:"hidden", background:"rgba(255,255,255,0.05)", borderRadius:2 }}>
                    {p.images?.[0]?.url ? <img src={p.images[0].url} alt="" style={{ width:"100%",height:"100%",objectFit:"cover" }} onError={e=>e.target.style.display="none"}/> : <div style={{ width:"100%",height:"100%",background:"linear-gradient(135deg,#2a1e0a,#1a1208)" }}/>}
                  </div>
                </td>
                <td style={{ padding:"10px 16px", fontSize:13, color:"rgba(255,255,255,0.82)", maxWidth:200, fontFamily:"'DM Sans',sans-serif" }}>
                  <div style={{ whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{p.name}</div>
                  {p.colors?.length>0 && (
                    <div style={{ display:"flex", gap:4, marginTop:5 }}>
                      {p.colors.slice(0,6).map((c,i)=>(
                        <div key={i} title={COLOUR_PALETTE.find(x=>x.hex===c)?.name||c}
                          style={{ width:10, height:10, borderRadius:"50%", background:c, border:"1px solid rgba(255,255,255,0.18)" }}/>
                      ))}
                    </div>
                  )}
                  {p.isFeatured && <div style={{ fontSize:9, letterSpacing:"0.10em", color:C.gold, marginTop:3, fontFamily:"'DM Sans',sans-serif", fontWeight:700 }}>★ FEATURED</div>}
                </td>
                <td style={{ padding:"10px 16px", fontSize:11, color:"rgba(255,255,255,0.4)", fontFamily:"'DM Sans',sans-serif" }}>
                  <div>{p.category}</div>
                  {p.subCategory && <div style={{ fontSize:10, color:"rgba(255,255,255,0.25)", marginTop:2 }}>{p.subCategory}</div>}
                </td>
                <td style={{ padding:"10px 16px", fontSize:13, color:C.gold, fontFamily:"'DM Sans',sans-serif", fontWeight:700 }}>₹{p.price?.toLocaleString()}</td>
                <td style={{ padding:"10px 16px", fontSize:13, color:p.stock<=5?"#f09090":"rgba(255,255,255,0.6)", fontFamily:"'DM Sans',sans-serif" }}>
                  {p.stock}
                  {p.stock<=5 && <div style={{ fontSize:9, color:"#f09090", fontFamily:"'DM Sans',sans-serif", fontWeight:700 }}>LOW</div>}
                </td>
                <td style={{ padding:"10px 16px" }}>
                  {p.tag && <span style={{ fontSize:9, letterSpacing:"0.10em", padding:"3px 8px", border:`1px solid ${tagColor(p.tag)}40`, color:tagColor(p.tag), background:`${tagColor(p.tag)}10`, fontFamily:"'DM Sans',sans-serif", fontWeight:700 }}>{p.tag}</span>}
                </td>
                <td style={{ padding:"10px 16px" }}>
                  <span style={{ fontSize:9, letterSpacing:"0.08em", padding:"3px 10px", border:`1px solid ${p.isActive!==false?"#7ab87a40":"rgba(255,80,80,0.3)"}`, color:p.isActive!==false?"#7ab87a":"#f09090", background:p.isActive!==false?"rgba(122,184,122,0.08)":"rgba(255,80,80,0.06)", fontFamily:"'DM Sans',sans-serif", fontWeight:700 }}>
                    {p.isActive!==false?"ACTIVE":"INACTIVE"}
                  </span>
                </td>
                <td style={{ padding:"10px 16px" }}>
                  <div style={{ display:"flex", gap:8 }}>
                    <button onClick={()=>openEdit(p)} style={{ background:"none", border:"1px solid rgba(201,168,76,0.3)", color:C.gold, padding:"5px 12px", fontSize:10, letterSpacing:"0.10em", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontWeight:700, borderRadius:2 }}>EDIT</button>
                    <button onClick={()=>handleDelete(p._id)} style={{ background:"none", border:"1px solid rgba(255,80,80,0.3)", color:"#f09090", padding:"5px 12px", fontSize:10, letterSpacing:"0.10em", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontWeight:700, borderRadius:2 }}>DEL</button>
                  </div>
                </td>
              </tr>
            ))}
            {!loading && !products.length && (
              <tr><td colSpan={8} style={{ padding:56, textAlign:"center", color:"rgba(255,255,255,0.2)", fontSize:14, fontFamily:"'DM Sans',sans-serif" }}>No products found</td></tr>
            )}
          </tbody>
        </table>

        <div style={{ padding:"16px 18px", borderTop:"1px solid rgba(255,255,255,0.05)", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div style={{ fontSize:12, color:"rgba(255,255,255,0.3)", fontFamily:"'DM Sans',sans-serif" }}>{products.length} of {total} products</div>
          <div style={{ display:"flex", gap:8 }}>
            <button disabled={page===1} onClick={()=>setPage(p=>p-1)} style={{ padding:"6px 14px", background:"none", border:"1px solid rgba(201,168,76,0.2)", color:page===1?"rgba(255,255,255,0.2)":C.gold, cursor:page===1?"default":"pointer", fontSize:10, fontFamily:"'DM Sans',sans-serif", fontWeight:700 }}>← PREV</button>
            <span style={{ padding:"6px 12px", fontSize:11, color:"rgba(255,255,255,0.4)", fontFamily:"'DM Sans',sans-serif" }}>Page {page}</span>
            <button disabled={products.length<8} onClick={()=>setPage(p=>p+1)} style={{ padding:"6px 14px", background:"none", border:"1px solid rgba(201,168,76,0.2)", color:products.length<8?"rgba(255,255,255,0.2)":C.gold, cursor:products.length<8?"default":"pointer", fontSize:10, fontFamily:"'DM Sans',sans-serif", fontWeight:700 }}>NEXT →</button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.88)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }} onClick={()=>setModal(null)}>
          <div style={{ background:"#0d0a06", border:"1px solid rgba(201,168,76,0.2)", borderTop:`3px solid ${C.gold}`, width:"100%", maxWidth:680, maxHeight:"92vh", overflowY:"auto", padding:36, borderRadius:4 }} onClick={e=>e.stopPropagation()}>

            <div style={{ fontFamily:"'DM Serif Display',serif", fontSize:24, color:"#fff", marginBottom:28, fontWeight:400 }}>
              {modal==="add" ? "Add New Product" : `Edit — ${editing?.name}`}
            </div>

            {/* Image upload */}
            <div style={{ marginBottom:24 }}>
              <label style={S.label}>Product Images (up to 6)</label>
              <div onClick={()=>fileRef.current?.click()} style={{ border:"1.5px dashed rgba(201,168,76,0.3)", padding:20, textAlign:"center", cursor:"pointer", background:"rgba(201,168,76,0.03)", borderRadius:3, transition:"all 0.2s" }}
                onMouseEnter={e=>{e.currentTarget.style.borderColor=C.gold;e.currentTarget.style.background="rgba(201,168,76,0.06)";}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(201,168,76,0.3)";e.currentTarget.style.background="rgba(201,168,76,0.03)";}}>
                <div style={{ fontSize:28, marginBottom:8 }}>📷</div>
                <div style={{ fontSize:12, color:"rgba(255,255,255,0.5)", letterSpacing:"0.10em", fontFamily:"'DM Sans',sans-serif", fontWeight:600 }}>CLICK TO UPLOAD IMAGES</div>
                <div style={{ fontSize:11, color:"rgba(255,255,255,0.25)", marginTop:4, fontFamily:"'DM Sans',sans-serif" }}>JPG, PNG, WEBP · Max 5MB each</div>
              </div>
              <input ref={fileRef} type="file" multiple accept="image/*" onChange={handleFiles} style={{ display:"none" }}/>
              {modal==="edit" && editing?.images?.length>0 && previews.length===0 && (
                <div style={{ display:"flex", gap:10, marginTop:12, flexWrap:"wrap" }}>
                  {editing.images.map((img,i)=>(
                    <div key={i} style={{ width:72, height:90, overflow:"hidden", border:"1px solid rgba(201,168,76,0.2)", position:"relative", borderRadius:2 }}>
                      <img src={img.url} alt="" style={{ width:"100%",height:"100%",objectFit:"cover" }}/>
                      <div style={{ position:"absolute",bottom:0,left:0,right:0,background:"rgba(0,0,0,0.6)",fontSize:8,color:"rgba(255,255,255,0.5)",textAlign:"center",padding:2,fontFamily:"'DM Sans',sans-serif" }}>SAVED</div>
                    </div>
                  ))}
                </div>
              )}
              {previews.length>0 && (
                <div style={{ display:"flex", gap:10, marginTop:12, flexWrap:"wrap" }}>
                  {previews.map((src,i)=>(
                    <div key={i} style={{ width:72, height:90, overflow:"hidden", border:`1px solid ${C.gold}40`, position:"relative", borderRadius:2 }}>
                      <img src={src} alt="" style={{ width:"100%",height:"100%",objectFit:"cover" }}/>
                      <div style={{ position:"absolute",bottom:0,left:0,right:0,background:"rgba(201,168,76,0.7)",fontSize:8,color:"#0f0c08",textAlign:"center",padding:2,fontWeight:700,fontFamily:"'DM Sans',sans-serif" }}>NEW</div>
                    </div>
                  ))}
                  <button onClick={()=>{setFiles([]);setPreviews([]);}} style={{ width:72, height:90, background:"none", border:"1.5px dashed rgba(255,80,80,0.3)", color:"#f09090", cursor:"pointer", fontSize:11, fontFamily:"'DM Sans',sans-serif", fontWeight:700, borderRadius:2 }}>CLEAR</button>
                </div>
              )}
            </div>

            {/* Form grid — uses stable Field/TextArea/ColourPicker components */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:16 }}>
              <Field label="Product Name"      value={form.name}            onChange={v=>set("name",v)}             span2 />
              <TextArea label="Description"    value={form.description}      onChange={v=>set("description",v)} />
              <Field label="Price (₹)"         value={form.price}            onChange={v=>set("price",v)}            type="number" />
              <Field label="Stock Quantity"    value={form.stock}            onChange={v=>set("stock",v)}            type="number" />
              <Field label="Fabric / Material" value={form.fabric}           onChange={v=>set("fabric",v)} />
              <Field label="Care Instructions" value={form.careInstructions} onChange={v=>set("careInstructions",v)} />
              <Field label="Colour Group ID"   value={form.colorGroup}       onChange={v=>set("colorGroup",v)} span2
                placeholder="e.g. silk-midi-dress — same value links all colour variants together" />
              <ColourPicker selected={form.colors} onChange={v=>set("colors",v)} />
              {/* ── Category ── */}
              <SelectField
                label="Category"
                value={form.category}
                onChange={v => { set("category", v); set("subCategory", ""); }}
                options={Object.keys(CATEGORY_MAP)}
              />

              {/* ── Sub-Category ── */}
              <div>
                <SelectField
                  label="Sub-Category"
                  value={form.subCategory}
                  onChange={v => set("subCategory", v)}
                  placeholder="— Select sub-category —"
                  options={(CATEGORY_MAP[form.category] || []).map(s => ({ value:s, label:s }))}
                />
                {form.subCategory && (
                  <div style={{ marginTop:6, fontSize:11, color:"rgba(201,168,76,0.65)", fontFamily:"'DM Sans',sans-serif", display:"flex", alignItems:"center", gap:5 }}>
                    <span style={{ opacity:0.5 }}>📂</span>
                    {form.category} › {form.subCategory}
                  </div>
                )}
              </div>

              {/* ── Tag ── */}
              <SelectField
                label="Tag"
                value={form.tag}
                onChange={v => set("tag", v)}
                placeholder="None"
                options={TAGS.filter(Boolean).map(t => ({ value:t, label:t }))}
              />

              {/* ── Original Price ── */}
              <Field label="Original Price (₹) — for discount display" value={form.originalPrice||""} onChange={v=>set("originalPrice",v)} type="number" />
            </div>

            {/* Featured toggle */}
            <div style={{ marginBottom:28, display:"flex", alignItems:"center", gap:12 }}>
              <div onClick={()=>set("isFeatured",!form.isFeatured)}
                style={{ width:40, height:22, background:form.isFeatured?C.gold:"rgba(255,255,255,0.1)", borderRadius:11, position:"relative", cursor:"pointer", transition:"background 0.25s", flexShrink:0 }}>
                <div style={{ position:"absolute", top:3, left:form.isFeatured?21:3, width:16, height:16, background:form.isFeatured?"#0f0c08":"rgba(255,255,255,0.4)", borderRadius:"50%", transition:"left 0.25s" }}/>
              </div>
              <span style={{ fontSize:11, letterSpacing:"0.12em", color:form.isFeatured?C.gold:"rgba(255,255,255,0.4)", fontFamily:"'DM Sans',sans-serif", fontWeight:600 }}>
                {form.isFeatured ? "★ FEATURED PRODUCT" : "Mark as featured"}
              </span>
            </div>

            {/* Actions */}
            <div style={{ display:"flex", gap:12, justifyContent:"flex-end", paddingTop:20, borderTop:"1px solid rgba(255,255,255,0.07)" }}>
              <button onClick={()=>setModal(null)} style={{ padding:"12px 24px", background:"none", border:"1px solid rgba(255,255,255,0.12)", color:"rgba(255,255,255,0.5)", fontSize:11, letterSpacing:"0.14em", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontWeight:600, borderRadius:3 }}>CANCEL</button>
              <button onClick={handleSave} disabled={saving} style={{ padding:"12px 32px", background:saving?"rgba(201,168,76,0.4)":C.gold, color:"#0f0c08", border:"none", fontSize:11, letterSpacing:"0.16em", cursor:saving?"not-allowed":"pointer", fontFamily:"'DM Sans',sans-serif", fontWeight:700, display:"flex", alignItems:"center", gap:8, borderRadius:3 }}>
                {saving&&<Spinner/>} {saving?"SAVING…":modal==="add"?"CREATE PRODUCT":"SAVE CHANGES"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
