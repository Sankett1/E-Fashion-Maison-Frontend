import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { C } from "../components/shared";
import { getProducts } from "../api/productApi";

// ── Master product catalogue ──────────────────────────────────────────────────
// sub field maps to URL ?sub= param from navbar dropdown links
const PRODUCTS = [
  { id:1,  name:"Navy Pinstripe Blazer",    category:"Men",         sub:"Suits",      price:18500, original:null,  tag:"NEW",  colors:["#1a2a4a","#2a2a2a","#c9a84c"], image:"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80&fit=crop" },
  { id:2,  name:"Belted Trench Coat",       category:"Women",       sub:"Outerwear",  price:24900, original:null,  tag:"NEW",  colors:["#c8b080","#1a1a1a","#e8e8e8"], image:"https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=80&fit=crop" },
  { id:3,  name:"Chelsea Leather Boots",    category:"Accessories", sub:"Shoes",      price:12750, original:18000, tag:"SALE", colors:["#1a1208","#4a321e","#c8b080"], image:"https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80&fit=crop" },
  { id:4,  name:"Silk Satin Blouse",        category:"Women",       sub:"Tops",       price:8200,  original:null,  tag:null,   colors:["#f0ebe0","#c9a84c","#1a2a4a"], image:"https://images.unsplash.com/photo-1485968579580-ee2a6b1e450f?w=600&q=80&fit=crop" },
  { id:5,  name:"Structured Wool Blazer",   category:"Men",         sub:"Suits",      price:22000, original:28000, tag:"SALE", colors:["#2a2a2a","#8a6228","#e8e8e8"], image:"https://images.unsplash.com/photo-1594938298870-5100bf2e3c8c?w=600&q=80&fit=crop" },
  { id:6,  name:"Pleated Midi Skirt",       category:"Women",       sub:"Dresses",    price:9800,  original:null,  tag:"NEW",  colors:["#f0ebe0","#c9a84c","#1a2a4a"], image:"https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=600&q=80&fit=crop" },
  { id:7,  name:"Silk Scarf – Heritage",    category:"Accessories", sub:"Scarves",    price:6500,  original:null,  tag:null,   colors:["#c9a84c","#1a2a4a","#e07070"], image:"https://images.unsplash.com/photo-1601924638-f3a5efb9f5c9?w=600&q=80&fit=crop" },
  { id:8,  name:"Slim Fit Dress Trousers",  category:"Men",         sub:"Trousers",   price:11200, original:null,  tag:null,   colors:["#1a1a1a","#2a2a2a","#6b5c44"], image:"https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&q=80&fit=crop" },
  { id:9,  name:"Cashmere Wrap Cardigan",   category:"Women",       sub:"Knitwear",   price:19500, original:26000, tag:"SALE", colors:["#e8e8e8","#c8b080","#1a1208"], image:"https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=600&q=80&fit=crop" },
  { id:10, name:"Leather Crossbody Bag",    category:"Accessories", sub:"Bags",       price:16800, original:null,  tag:"NEW",  colors:["#4a321e","#1a1208","#c8b080"], image:"https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80&fit=crop" },
  { id:11, name:"Shawl Collar Overcoat",    category:"Men",         sub:"Outerwear",  price:34500, original:null,  tag:null,   colors:["#2a2a2a","#6b5c44","#e8e8e8"], image:"https://images.unsplash.com/photo-1520975916090-8105d898b5a1?w=600&q=80&fit=crop" },
  { id:12, name:"Draped Maxi Dress",        category:"Women",       sub:"Dresses",    price:13900, original:null,  tag:"NEW",  colors:["#1a2a4a","#c9a84c","#e8e8e8"], image:"https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&q=80&fit=crop" },
  { id:13, name:"Double-Breasted Suit",     category:"Men",         sub:"Suits",      price:48000, original:null,  tag:"NEW",  colors:["#1a1a1a","#2a2a2a","#c9a84c"], image:"https://images.unsplash.com/photo-1617137968427-85924c800a22?w=600&q=80&fit=crop" },
  { id:14, name:"Wrap Evening Dress",       category:"Women",       sub:"Dresses",    price:15500, original:null,  tag:"NEW",  colors:["#e8d5c0","#c9a84c","#4a2a1a"], image:"https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600&q=80&fit=crop" },
  { id:15, name:"Structured Leather Tote",  category:"Accessories", sub:"Bags",       price:22000, original:null,  tag:null,   colors:["#1a1208","#4a321e","#e8e0d0"], image:"https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600&q=80&fit=crop" },
  { id:16, name:"Fine Merino Sweater",      category:"Men",         sub:"Knitwear",   price:14800, original:null,  tag:null,   colors:["#c8b080","#2a2a2a","#e8e8e8"], image:"https://images.unsplash.com/photo-1614935151651-0bea6508db6b?w=600&q=80&fit=crop" },
  { id:17, name:"Silk Wrap Blouse",         category:"Women",       sub:"Tops",       price:7600,  original:null,  tag:"NEW",  colors:["#f0e8d0","#c9a84c","#1a2a4a"], image:"https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=600&q=80&fit=crop" },
  { id:18, name:"Oxford Dress Shirt",       category:"Men",         sub:"Shirts",     price:6800,  original:null,  tag:null,   colors:["#f0ebe0","#e8e8e8","#1a2a4a"], image:"https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&q=80&fit=crop" },
  { id:19, name:"Wide Leg Trousers",        category:"Women",       sub:"Trousers",   price:8900,  original:null,  tag:"NEW",  colors:["#1a1a1a","#c8b080","#f0ebe0"], image:"https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=600&q=80&fit=crop" },
  { id:20, name:"Gold Hoop Earrings",       category:"Accessories", sub:"Jewellery",  price:4500,  original:null,  tag:null,   colors:["#c9a84c","#e8c96e","#b8953e"], image:"https://images.unsplash.com/photo-1535632787350-4e68ef0ac584?w=600&q=80&fit=crop" },
  { id:21, name:"Classic Leather Belt",     category:"Accessories", sub:"Belts",      price:3800,  original:null,  tag:null,   colors:["#1a1208","#4a321e","#c8b080"], image:"https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=600&q=80&fit=crop" },
  { id:22, name:"Aviator Sunglasses",       category:"Accessories", sub:"Sunglasses", price:8900,  original:null,  tag:"NEW",  colors:["#c9a84c","#1a1208","#2a2a2a"], image:"https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&q=80&fit=crop" },
  { id:23, name:"Cashmere Wide Brim Hat",   category:"Accessories", sub:"Hats",       price:5200,  original:null,  tag:null,   colors:["#1a1208","#c8b080","#e8e0d0"], image:"https://images.unsplash.com/photo-1514327605112-b887c0e61c0a?w=600&q=80&fit=crop" },
  { id:24, name:"Women's Loafer",           category:"Women",       sub:"Shoes",      price:9800,  original:14000, tag:"SALE", colors:["#1a1208","#4a321e","#c8b080"], image:"https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&q=80&fit=crop" },
  { id:25, name:"Men's Derby Shoe",         category:"Men",         sub:"Shoes",      price:11500, original:16000, tag:"SALE", colors:["#1a1208","#2a2a2a","#4a321e"], image:"https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=600&q=80&fit=crop" },
  { id:26, name:"Linen Tailored Suit",      category:"Men",         sub:"Suits",      price:38000, original:null,  tag:"NEW",  colors:["#e8e0d0","#c8b080","#1a1208"], image:"https://images.unsplash.com/photo-1600091166971-7f9faad6c498?w=600&q=80&fit=crop" },
  { id:27, name:"Cashmere Turtleneck",      category:"Women",       sub:"Knitwear",   price:12800, original:null,  tag:null,   colors:["#e8e8e8","#c8b080","#1a1208"], image:"https://images.unsplash.com/photo-1554568218-0f1715e72254?w=600&q=80&fit=crop" },
  { id:28, name:"Tailored Chino Trousers",  category:"Men",         sub:"Trousers",   price:9200,  original:null,  tag:null,   colors:["#c8b080","#1a1208","#e8e0d0"], image:"https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&q=80&fit=crop" },
];

const GRAD = [
  "linear-gradient(160deg,#e8e8e8 0%,#c8c8d0 100%)",
  "linear-gradient(160deg,#c8b080 0%,#806840 100%)",
  "linear-gradient(160deg,#6b4c36 0%,#2e1e0e 100%)",
  "linear-gradient(160deg,#f0ebe0 0%,#c8bca8 100%)",
  "linear-gradient(160deg,#2a2a2a 0%,#0d0d0d 100%)",
  "linear-gradient(160deg,#c9a84c 0%,#8a6228 100%)",
];

// ── Derive page title from URL params ─────────────────────────────────────────
function getPageMeta(params) {
  const cat  = params.get("category");
  const sub  = params.get("sub");
  const tag  = params.get("tag");
  const sort = params.get("sort");
  const filter = params.get("filter");
  const q    = params.get("q");

  if (q)      return { title: `Search: "${q}"`,     sub: "SEARCH RESULTS" };
  if (sub)    return { title: sub,                   sub: `${cat?.toUpperCase() || ""} · ${sub.toUpperCase()}` };
  if (tag === "SALE") {
    if (cat)  return { title: `${cat} Sale`,         sub: "UP TO 70% OFF" };
    return    { title: "Sale",                        sub: "UP TO 70% OFF · SELECTED STYLES" };
  }
  if (tag === "NEW") return { title: "New Arrivals", sub: "SPRING / SUMMER 2026" };
  if (sort === "trending") return { title: "Trending Now", sub: "MOST COVETED THIS SEASON" };
  if (filter === "restock") return { title: "Back in Stock", sub: "RETURNED BY POPULAR DEMAND" };
  if (filter === "editors") return { title: "Editor's Picks", sub: "CURATED BY THE MAISON TEAM" };
  if (cat)   return { title: cat,                    sub: `THE ${cat.toUpperCase()} COLLECTION` };
  return     { title: "The Collection",              sub: "SPRING / SUMMER 2026" };
}

const HeartIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);

function ProductCard({ product, index }) {
  const [wishlist, setWishlist] = useState(false);
  const [hov, setHov] = useState(false);
  const [imgErr, setImgErr] = useState(false);
  const navigate = useNavigate();
  const grad = GRAD[index % GRAD.length];

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onClick={() => navigate(`/shop/${product.id}`)}
      style={{ cursor: "pointer", animation: `fadeUp 0.5s ease ${Math.min(index * 0.05, 0.4)}s both` }}
    >
      <div style={{ position: "relative", overflow: "hidden", aspectRatio: "3/4", marginBottom: "13px", background: grad }}>
        {product.image && !imgErr && (
          <img src={product.image} alt={product.name} onError={() => setImgErr(true)}
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover",
              transition: "transform 0.5s ease", transform: hov ? "scale(1.06)" : "scale(1)" }} />
        )}
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.15)", opacity: hov ? 1 : 0, transition: "opacity 0.3s" }} />

        {product.tag && (
          <div style={{ position: "absolute", top: 12, left: 12,
            background: product.tag === "SALE" ? "#e07070" : C.gold,
            color: "#0f0c08", fontSize: "8px", letterSpacing: "0.18em", fontWeight: 600, padding: "3px 9px" }}>
            {product.tag}
          </div>
        )}

        <button onClick={e => { e.stopPropagation(); setWishlist(w => !w); }}
          style={{ position: "absolute", top: 12, right: 12, width: 32, height: 32,
            background: "rgba(255,255,255,0.92)", display: "flex", alignItems: "center",
            justifyContent: "center", border: "none", cursor: "pointer",
            color: wishlist ? "#e07070" : "#3a2e1e", transition: "all 0.2s" }}>
          <HeartIcon />
        </button>

        <button style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "12px",
          textAlign: "center", fontSize: "9px", letterSpacing: "0.2em",
          background: "#1a1208", color: "#fff", border: "none", width: "100%",
          fontFamily: "'Cormorant Garamond',Georgia,serif", cursor: "pointer",
          opacity: hov ? 1 : 0, transform: hov ? "translateY(0)" : "translateY(100%)",
          transition: "all 0.28s ease" }}>
          ADD TO CART
        </button>

        <div style={{ position: "absolute", bottom: hov ? 50 : 12, right: 12,
          display: "flex", gap: 4, transition: "bottom 0.28s ease" }}>
          {product.colors.map(c => (
            <div key={c} style={{ width: 10, height: 10, borderRadius: "50%",
              background: c, border: "1px solid rgba(255,255,255,0.5)" }} />
          ))}
        </div>
      </div>

      <div style={{ fontSize: "9.5px", letterSpacing: "0.14em", color: "#6b5c44",
        fontFamily: "'Cormorant Garamond',Georgia,serif", marginBottom: 3 }}>
        {product.category.toUpperCase()}{product.sub ? ` · ${product.sub.toUpperCase()}` : ""}
      </div>
      <div style={{ fontFamily: "'Playfair Display',serif", fontSize: "15px", color: "#1a1208", marginBottom: 5 }}>
        {product.name}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
        <span style={{ fontFamily: "'Playfair Display',serif", fontSize: "14px", color: "#1a1208" }}>
          ₹{product.price.toLocaleString("en-IN")}
        </span>
        {product.original && (
          <span style={{ fontSize: "12px", color: "#b0a08a", textDecoration: "line-through",
            fontFamily: "'Cormorant Garamond',Georgia,serif" }}>
            ₹{product.original.toLocaleString("en-IN")}
          </span>
        )}
        {product.original && (
          <span style={{ fontSize: "9px", color: "#e07070", letterSpacing: "0.1em" }}>
            {Math.round((1 - product.price / product.original) * 100)}% OFF
          </span>
        )}
      </div>
    </div>
  );
}

export default function ShopPage() {
  const [searchParams] = useSearchParams();
  const [sortBy, setSortBy] = useState("Featured");
  const [priceMax, setPriceMax] = useState(60000);
  const [filterOpen, setFilterOpen] = useState(false);

  // ── API-driven product state ─────────────────────────────────────────────
  const [apiProducts, setApiProducts] = useState([]);
  const [apiLoading,  setApiLoading]  = useState(true);

  const cat    = searchParams.get("category");
  const sub    = searchParams.get("sub");
  const tag    = searchParams.get("tag");
  const sort   = searchParams.get("sort");
  const filter = searchParams.get("filter");
  const q      = searchParams.get("q");

  const meta = getPageMeta(searchParams);

  // Fetch all products from backend; fall back to demo data on failure
  const fetchProducts = useCallback(async () => {
    setApiLoading(true);
    try {
      const params = { limit: 100 };
      if (q)   params.keyword  = q;
      if (cat) params.category = cat;
      if (tag) params.tag      = tag;
      const res = await getProducts(params);
      // Normalise backend shape → local shape expected by ProductCard
      const normalised = (res.products || []).map(p => ({
        id:       p._id,
        name:     p.name,
        category: p.category,
        sub:      p.subCategory || "",
        price:    p.price,
        original: p.originalPrice || null,
        tag:      p.tag || null,
        colors:   p.colors?.length ? p.colors : ["#c9a84c"],
        image:    p.images?.[0]?.url || null,
        // keep extra fields for potential detail page use
        _raw: p,
      }));
      setApiProducts(normalised);
    } catch {
      // On error keep showing whatever was there (or empty — no crash)
      setApiProducts([]);
    } finally {
      setApiLoading(false);
    }
  }, [q, cat, tag]);

  useEffect(() => { window.scrollTo(0, 0); setSortBy("Featured"); fetchProducts(); }, [searchParams.toString()]);

  // Use live API data; fall back to static PRODUCTS only when still loading
  const sourceProducts = apiLoading ? PRODUCTS : apiProducts.length ? apiProducts : PRODUCTS;

  const filtered = sourceProducts
    .filter(p => {
      if (q)      return p.name.toLowerCase().includes(q.toLowerCase()) || p.category.toLowerCase().includes(q.toLowerCase());
      if (cat && tag === "SALE") return p.category === cat && p.tag === "SALE";
      if (tag === "SALE") return p.tag === "SALE";
      if (tag === "NEW") return p.tag === "NEW";
      if (sort === "trending") return p.tag === "NEW" || p.original;
      if (filter === "restock") return p.original !== null;
      if (filter === "editors") return [2, 7, 10, 12, 14, 20].includes(p.id);
      if (sub && cat) return p.category === cat && p.sub === sub;
      if (cat) return p.category === cat;
      return true;
    })
    .filter(p => p.price <= priceMax)
    .sort((a, b) => {
      if (sortBy === "Price: Low to High") return a.price - b.price;
      if (sortBy === "Price: High to Low") return b.price - a.price;
      if (sortBy === "Newest First") return (b.tag === "NEW" ? 1 : 0) - (a.tag === "NEW" ? 1 : 0);
      return 0;
    });

  return (
    <div style={{ paddingTop: "64px", background: "#f5f0eb", minHeight: "100vh" }}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}`}</style>

      {/* Hero header */}
      <div style={{ background: "linear-gradient(135deg,#1a1208 0%,#2a1e0a 50%,#1a1208 100%)",
        padding: "60px 48px 50px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0,
          background: "radial-gradient(ellipse 60% 80% at 50% 50%,rgba(201,168,76,0.07),transparent)",
          pointerEvents: "none" }} />
        {tag === "SALE" && (
          <div style={{ display: "inline-block", background: "#e07070", color: "#fff",
            fontSize: "8px", letterSpacing: "0.22em", padding: "4px 14px", marginBottom: 20 }}>
            UP TO 70% OFF
          </div>
        )}
        <div style={{ width: 40, height: 1, margin: "0 auto 20px",
          background: "linear-gradient(90deg,transparent,#c9a84c,transparent)" }} />
        <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(36px,5vw,64px)",
          fontWeight: 400, color: "#fff", margin: "0 0 10px", lineHeight: 1.05 }}>
          {meta.title}
        </h1>
        <p style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: "9.5px",
          letterSpacing: "0.28em", color: "rgba(255,255,255,0.38)" }}>
          {meta.sub}
        </p>
      </div>

      {/* Sort & filter bar */}
      <div style={{ background: "#fff", borderBottom: "1px solid rgba(201,168,76,0.15)",
        padding: "0 48px", position: "sticky", top: 64, zIndex: 100,
        display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
        <span style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: "12px",
          color: "#6b5c44", padding: "16px 0" }}>
          {filtered.length} {filtered.length === 1 ? "piece" : "pieces"}
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)}
            style={{ padding: "8px 14px", border: "1px solid rgba(201,168,76,0.3)", background: "#fff",
              fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: "11px",
              color: "#3a2e1e", cursor: "pointer", outline: "none" }}>
            {["Featured","Price: Low to High","Price: High to Low","Newest First"].map(o => <option key={o}>{o}</option>)}
          </select>
          <button onClick={() => setFilterOpen(f => !f)}
            style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 14px",
              border: `1px solid ${filterOpen ? C.gold : "rgba(201,168,76,0.3)"}`,
              background: filterOpen ? "rgba(201,168,76,0.05)" : "transparent",
              color: filterOpen ? C.gold : "#6b5c44", cursor: "pointer",
              fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: "11px", letterSpacing: "0.1em" }}>
            ▼ FILTER
          </button>
        </div>
      </div>

      {/* Filter drawer */}
      {filterOpen && (
        <div style={{ background: "#fff", borderBottom: "1px solid rgba(201,168,76,0.12)",
          padding: "20px 48px", display: "flex", alignItems: "center", gap: 32 }}>
          <div>
            <div style={{ fontSize: "9px", letterSpacing: "0.2em", color: "#3a2e1e", marginBottom: 10,
              fontFamily: "'Cormorant Garamond',Georgia,serif" }}>PRICE RANGE</div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: "12px", color: "#6b5c44", fontFamily: "'Cormorant Garamond',Georgia,serif" }}>₹0</span>
              <input type="range" min={0} max={60000} step={500} value={priceMax}
                onChange={e => setPriceMax(+e.target.value)}
                style={{ width: 160, accentColor: C.gold }} />
              <span style={{ fontSize: "12px", color: "#6b5c44", fontFamily: "'Cormorant Garamond',Georgia,serif" }}>
                ₹{priceMax.toLocaleString("en-IN")}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Grid */}
      <div style={{ padding: "48px", maxWidth: 1400, margin: "0 auto" }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
            <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, color: "#6b5c44" }}>
              No pieces found
            </p>
            <p style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: 14, color: "#b0a08a", marginTop: 8 }}>
              Try adjusting your filters or browse the full collection
            </p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: "32px 20px" }}>
            {filtered.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
          </div>
        )}
      </div>
    </div>
  );
}
