import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { C } from "../components/shared";
import { getProducts } from "../api/productApi";

// ── Fallback static products (shown when API is offline) ─────────────────────
const FALLBACK = [
  { _id:"1",  name:"Navy Pinstripe Blazer",   category:"Men",         subCategory:"Suits",      price:18500, tag:"NEW",  colors:["#1a2a4a","#2a2a2a","#c9a84c"], images:[{url:"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80&fit=crop"}] },
  { _id:"2",  name:"Belted Trench Coat",      category:"Women",       subCategory:"Outerwear",  price:24900, tag:"NEW",  colors:["#c8b080","#1a1a1a","#e8e8e8"], images:[{url:"https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=80&fit=crop"}] },
  { _id:"3",  name:"Chelsea Leather Boots",   category:"Accessories", subCategory:"Shoes",      price:12750, originalPrice:18000, tag:"SALE", colors:["#1a1208","#4a321e","#c8b080"], images:[{url:"https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80&fit=crop"}] },
  { _id:"4",  name:"Silk Satin Blouse",       category:"Women",       subCategory:"Tops",       price:8200,  tag:null,   colors:["#f0ebe0","#c9a84c","#1a2a4a"], images:[{url:"https://images.unsplash.com/photo-1485968579580-ee2a6b1e450f?w=600&q=80&fit=crop"}] },
  { _id:"5",  name:"Structured Wool Blazer",  category:"Men",         subCategory:"Suits",      price:22000, originalPrice:28000, tag:"SALE", colors:["#2a2a2a","#8a6228","#e8e8e8"], images:[{url:"https://images.unsplash.com/photo-1594938298870-5100bf2e3c8c?w=600&q=80&fit=crop"}] },
  { _id:"6",  name:"Pleated Midi Skirt",      category:"Women",       subCategory:"Dresses",    price:9800,  tag:"NEW",  colors:["#f0ebe0","#c9a84c","#1a2a4a"], images:[{url:"https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=600&q=80&fit=crop"}] },
  { _id:"7",  name:"Silk Scarf Heritage",     category:"Accessories", subCategory:"Scarves",    price:6500,  tag:null,   colors:["#c9a84c","#1a2a4a","#e07070"], images:[{url:"https://images.unsplash.com/photo-1601924638-f3a5efb9f5c9?w=600&q=80&fit=crop"}] },
  { _id:"8",  name:"Slim Fit Dress Trousers", category:"Men",         subCategory:"Trousers",   price:11200, tag:null,   colors:["#1a1a1a","#2a2a2a","#6b5c44"], images:[{url:"https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&q=80&fit=crop"}] },
  { _id:"9",  name:"Cashmere Wrap Cardigan",  category:"Women",       subCategory:"Knitwear",   price:19500, originalPrice:26000, tag:"SALE", colors:["#e8e8e8","#c8b080","#1a1208"], images:[{url:"https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=600&q=80&fit=crop"}] },
  { _id:"10", name:"Leather Crossbody Bag",   category:"Accessories", subCategory:"Bags",       price:16800, tag:"NEW",  colors:["#4a321e","#1a1208","#c8b080"], images:[{url:"https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80&fit=crop"}] },
  { _id:"11", name:"Shawl Collar Overcoat",   category:"Men",         subCategory:"Outerwear",  price:34500, tag:null,   colors:["#2a2a2a","#6b5c44","#e8e8e8"], images:[{url:"https://images.unsplash.com/photo-1520975916090-8105d898b5a1?w=600&q=80&fit=crop"}] },
  { _id:"12", name:"Draped Maxi Dress",       category:"Women",       subCategory:"Dresses",    price:13900, tag:"NEW",  colors:["#1a2a4a","#c9a84c","#e8e8e8"], images:[{url:"https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&q=80&fit=crop"}] },
];

const GRAD = [
  "linear-gradient(160deg,#e8e8e8 0%,#c8c8d0 100%)",
  "linear-gradient(160deg,#c8b080 0%,#806840 100%)",
  "linear-gradient(160deg,#6b4c36 0%,#2e1e0e 100%)",
  "linear-gradient(160deg,#f0ebe0 0%,#c8bca8 100%)",
  "linear-gradient(160deg,#2a2a2a 0%,#0d0d0d 100%)",
  "linear-gradient(160deg,#c9a84c 0%,#8a6228 100%)",
];

function getPageMeta(params) {
  const cat    = params.get("category");
  const sub    = params.get("sub");
  const tag    = params.get("tag");
  const sort   = params.get("sort");
  const filter = params.get("filter");
  const q      = params.get("q");
  if (q)                    return { title: `"${q}"`,          sub: "SEARCH RESULTS" };
  if (sub && cat)           return { title: sub,               sub: `${cat.toUpperCase()} · ${sub.toUpperCase()}` };
  if (tag === "SALE" && cat)return { title: `${cat} Sale`,     sub: "UP TO 70% OFF" };
  if (tag === "SALE")       return { title: "Sale",            sub: "UP TO 70% OFF · SELECTED STYLES" };
  if (tag === "NEW")        return { title: "New Arrivals",    sub: "SPRING / SUMMER 2026" };
  if (sort === "trending")  return { title: "Trending Now",    sub: "MOST COVETED THIS SEASON" };
  if (filter === "restock") return { title: "Back in Stock",  sub: "RETURNED BY POPULAR DEMAND" };
  if (filter === "editors") return { title: "Editor's Picks", sub: "CURATED BY THE MAISON TEAM" };
  if (cat)                  return { title: cat,              sub: `THE ${cat.toUpperCase()} COLLECTION` };
  return                           { title: "The Collection", sub: "SPRING / SUMMER 2026" };
}

// Sub-category values in URL ?sub= match Product.subCategory exactly (same strings)

const HeartIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);

const Spinner = () => (
  <div style={{ display:"flex", justifyContent:"center", alignItems:"center", padding:"80px 0" }}>
    <div style={{ width:36, height:36, border:`2px solid ${C.gold}`, borderTopColor:"transparent", borderRadius:"50%", animation:"shopSpin 0.8s linear infinite" }}/>
    <style>{`@keyframes shopSpin{to{transform:rotate(360deg)}}`}</style>
  </div>
);

function ProductCard({ product, index }) {
  const [wishlist, setWishlist] = useState(false);
  const [hov, setHov] = useState(false);
  const [imgErr, setImgErr] = useState(false);
  const navigate = useNavigate();

  const image    = product.images?.[0]?.url;
  const grad     = GRAD[index % GRAD.length];
  const hasOrig  = product.originalPrice && product.originalPrice > product.price;
  const discount = hasOrig ? Math.round((1 - product.price / product.originalPrice) * 100) : 0;

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onClick={() => navigate(`/shop/${product._id}`)}
      style={{ cursor:"pointer", animation:`fadeUp 0.5s ease ${Math.min(index * 0.05, 0.4)}s both` }}
    >
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}`}</style>

      {/* Image container */}
      <div style={{ position:"relative", overflow:"hidden", aspectRatio:"3/4", marginBottom:13, background:grad }}>
        {image && !imgErr && (
          <img src={image} alt={product.name} onError={() => setImgErr(true)}
            style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover",
              transition:"transform 0.5s ease", transform:hov ? "scale(1.06)" : "scale(1)" }}
          />
        )}
        <div style={{ position:"absolute", inset:0, background:"rgba(0,0,0,0.15)", opacity:hov?1:0, transition:"opacity 0.3s" }}/>

        {/* Tag badge */}
        {product.tag && (
          <div style={{ position:"absolute", top:12, left:12,
            background: product.tag==="SALE" ? "#e07070" : C.gold,
            color:"#0f0c08", fontSize:"8px", letterSpacing:"0.18em", fontWeight:600, padding:"3px 9px" }}>
            {product.tag}
          </div>
        )}

        {/* Wishlist */}
        <button onClick={e => { e.stopPropagation(); setWishlist(w => !w); }}
          style={{ position:"absolute", top:12, right:12, width:32, height:32,
            background:"rgba(255,255,255,0.92)", display:"flex", alignItems:"center",
            justifyContent:"center", border:"none", cursor:"pointer",
            color:wishlist?"#e07070":"#3a2e1e", transition:"all 0.2s" }}>
          <HeartIcon/>
        </button>

        {/* Quick add on hover */}
        <button style={{ position:"absolute", bottom:0, left:0, right:0, padding:"12px",
          textAlign:"center", fontSize:"9px", letterSpacing:"0.2em",
          background:"#1a1208", color:"#fff", border:"none", width:"100%",
          fontFamily:"'Cormorant Garamond',Georgia,serif", cursor:"pointer",
          opacity:hov?1:0, transform:hov?"translateY(0)":"translateY(100%)",
          transition:"all 0.28s ease" }}>
          ADD TO CART
        </button>

        {/* Color swatches */}
        {product.colors?.length > 0 && (
          <div style={{ position:"absolute", bottom:hov?46:12, right:12,
            display:"flex", gap:4, transition:"bottom 0.28s ease" }}>
            {product.colors.slice(0,4).map((c,i) => (
              <div key={i} style={{ width:10, height:10, borderRadius:"50%",
                background:c, border:"1px solid rgba(255,255,255,0.5)" }}/>
            ))}
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ fontSize:"9.5px", letterSpacing:"0.14em", color:"#6b5c44",
        fontFamily:"'Cormorant Garamond',Georgia,serif", marginBottom:3 }}>
        {product.category?.toUpperCase()}{product.subCategory ? ` · ${product.subCategory.toUpperCase()}` : ""}
      </div>
      <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"15px", color:"#1a1208", marginBottom:5, lineHeight:1.3 }}>
        {product.name}
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:9 }}>
        <span style={{ fontFamily:"'Playfair Display',serif", fontSize:"14px", color:"#1a1208" }}>
          ₹{Number(product.price).toLocaleString("en-IN")}
        </span>
        {hasOrig && (
          <>
            <span style={{ fontSize:"12px", color:"#b0a08a", textDecoration:"line-through",
              fontFamily:"'Cormorant Garamond',Georgia,serif" }}>
              ₹{Number(product.originalPrice).toLocaleString("en-IN")}
            </span>
            <span style={{ fontSize:"9px", color:"#e07070", letterSpacing:"0.1em" }}>
              {discount}% OFF
            </span>
          </>
        )}
      </div>
    </div>
  );
}

export default function ShopPage() {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [total, setTotal]       = useState(0);
  const [page, setPage]         = useState(1);
  const [sortBy, setSortBy]     = useState("Featured");
  const [filterOpen, setFilterOpen] = useState(false);
  const [priceMax, setPriceMax] = useState(100000);
  const [usingFallback, setUsingFallback] = useState(false);

  const cat    = searchParams.get("category");
  const sub    = searchParams.get("sub");
  const tag    = searchParams.get("tag");
  const sort   = searchParams.get("sort");
  const filter = searchParams.get("filter");
  const q      = searchParams.get("q");
  const meta   = getPageMeta(searchParams);

  // Map sort UI → API sort param
  const sortParam = {
    "Featured": "-createdAt",
    "Price: Low to High": "price",
    "Price: High to Low": "-price",
    "Newest First": "-createdAt",
  }[sortBy] || "-createdAt";

  const fetchProducts = useCallback(async (pg = 1) => {
    setLoading(true);
    try {
      // Build API query params from URL search params
      const params = { page: pg, limit: 12, sort: sortParam };

      if (q)                        params.keyword    = q;
      if (cat)                      params.category   = cat;
      if (sub)                       params.subCategory = sub;  // exact match against Product.subCategory
      if (tag === "SALE")           params.tag        = "SALE";
      if (tag === "NEW")            params.tag        = "NEW";
      if (sort === "trending")      params.sort       = "-ratings";
      if (filter === "restock")     { /* backend doesn't have restock filter, show all */ }
      if (priceMax < 100000)        params.maxPrice   = priceMax;

      const data = await getProducts(params);
      setProducts(data.products || []);
      setTotal(data.total || 0);
      setUsingFallback(false);
    } catch (err) {
      console.warn("[ShopPage] API unavailable, using fallback data:", err.message);
      // Apply basic filtering on fallback data
      let fb = FALLBACK;
      if (cat)   fb = fb.filter(p => p.category === cat);
      if (sub)   fb = fb.filter(p => p.subCategory?.toLowerCase() === sub.toLowerCase());
      if (tag)   fb = fb.filter(p => p.tag === tag);
      if (q)     fb = fb.filter(p => p.name.toLowerCase().includes(q.toLowerCase()));
      setProducts(fb);
      setTotal(fb.length);
      setUsingFallback(true);
    } finally {
      setLoading(false);
    }
  }, [searchParams.toString(), sortParam, priceMax]);

  useEffect(() => {
    window.scrollTo(0, 0);
    setPage(1);
    fetchProducts(1);
  }, [searchParams.toString(), sortBy]);

  useEffect(() => {
    if (page > 1) fetchProducts(page);
  }, [page]);

  const LIMIT = 12;
  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div style={{ paddingTop:"64px", background:"#f5f0eb", minHeight:"100vh" }}>

      {/* Hero header */}
      <div style={{ background:"linear-gradient(135deg,#1a1208 0%,#2a1e0a 50%,#1a1208 100%)",
        padding:"56px 48px 44px", textAlign:"center", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", inset:0,
          background:"radial-gradient(ellipse 60% 80% at 50% 50%,rgba(201,168,76,0.07),transparent)",
          pointerEvents:"none" }}/>
        {tag === "SALE" && (
          <div style={{ display:"inline-block", background:"#e07070", color:"#fff",
            fontSize:"8px", letterSpacing:"0.22em", padding:"4px 14px", marginBottom:16 }}>
            UP TO 70% OFF
          </div>
        )}
        <div style={{ width:40, height:1, margin:"0 auto 18px",
          background:"linear-gradient(90deg,transparent,#c9a84c,transparent)" }}/>
        <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(34px,5vw,60px)",
          fontWeight:400, color:"#fff", margin:"0 0 10px", lineHeight:1.05 }}>
          {meta.title}
        </h1>
        <p style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"9.5px",
          letterSpacing:"0.28em", color:"rgba(255,255,255,0.38)" }}>
          {meta.sub}
        </p>
        {!loading && (
          <p style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"11px",
            color:"rgba(255,255,255,0.25)", marginTop:8 }}>
            {total} {total === 1 ? "piece" : "pieces"}
            {usingFallback && " · showing sample collection"}
          </p>
        )}
      </div>

      {/* Sort & filter bar */}
      <div style={{ background:"#fff", borderBottom:"1px solid rgba(201,168,76,0.15)",
        padding:"0 48px", position:"sticky", top:64, zIndex:100,
        display:"flex", alignItems:"center", justifyContent:"flex-end", gap:12 }}>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)}
          style={{ padding:"14px 14px", border:"1px solid rgba(201,168,76,0.3)", background:"#fff",
            fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"11px",
            color:"#3a2e1e", cursor:"pointer", outline:"none", margin:"8px 0" }}>
          {["Featured","Price: Low to High","Price: High to Low","Newest First"].map(o => (
            <option key={o}>{o}</option>
          ))}
        </select>
        <button onClick={() => setFilterOpen(f => !f)}
          style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 14px",
            border:`1px solid ${filterOpen ? C.gold : "rgba(201,168,76,0.3)"}`,
            background:filterOpen ? "rgba(201,168,76,0.05)" : "transparent",
            color:filterOpen ? C.gold : "#6b5c44", cursor:"pointer",
            fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"11px", letterSpacing:"0.1em" }}>
          ▼ FILTER
        </button>
      </div>

      {/* Filter drawer */}
      {filterOpen && (
        <div style={{ background:"#fff", borderBottom:"1px solid rgba(201,168,76,0.12)",
          padding:"18px 48px", display:"flex", alignItems:"center", gap:32 }}>
          <div>
            <div style={{ fontSize:"9px", letterSpacing:"0.2em", color:"#3a2e1e", marginBottom:10,
              fontFamily:"'Cormorant Garamond',Georgia,serif" }}>PRICE RANGE</div>
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              <span style={{ fontSize:"12px", color:"#6b5c44", fontFamily:"'Cormorant Garamond',Georgia,serif" }}>₹0</span>
              <input type="range" min={0} max={100000} step={1000} value={priceMax}
                onChange={e => setPriceMax(+e.target.value)}
                style={{ width:160, accentColor:C.gold }}/>
              <span style={{ fontSize:"12px", color:"#6b5c44", fontFamily:"'Cormorant Garamond',Georgia,serif" }}>
                ₹{priceMax.toLocaleString("en-IN")}
              </span>
              <button onClick={() => fetchProducts(1)}
                style={{ padding:"6px 16px", background:C.gold, border:"none", color:"#0f0c08",
                  fontSize:"9.5px", letterSpacing:"0.14em", cursor:"pointer",
                  fontFamily:"'Cormorant Garamond',Georgia,serif" }}>
                APPLY
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Product grid */}
      <div style={{ padding:"48px", maxWidth:1400, margin:"0 auto" }}>
        {loading ? (
          <Spinner/>
        ) : products.length === 0 ? (
          <div style={{ textAlign:"center", padding:"80px 0" }}>
            <div style={{ fontSize:48, marginBottom:16 }}>🔍</div>
            <p style={{ fontFamily:"'Playfair Display',serif", fontSize:22, color:"#6b5c44" }}>No pieces found</p>
            <p style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:14, color:"#b0a08a", marginTop:8 }}>
              Try adjusting your filters or browse the full collection
            </p>
          </div>
        ) : (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))", gap:"32px 20px" }}>
            {products.map((p, i) => <ProductCard key={p._id} product={p} index={i}/>)}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && !loading && (
          <div style={{ display:"flex", justifyContent:"center", gap:8, marginTop:56 }}>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(pg => (
              <button key={pg} onClick={() => setPage(pg)}
                style={{ width:36, height:36,
                  background: pg === page ? C.gold : "transparent",
                  border:`1px solid ${pg === page ? C.gold : "rgba(201,168,76,0.3)"}`,
                  color: pg === page ? "#0f0c08" : "#6b5c44",
                  fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"13px",
                  cursor:"pointer", transition:"all 0.2s" }}>
                {pg}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
