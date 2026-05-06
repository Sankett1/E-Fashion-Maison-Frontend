import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { C } from "../components/shared";
import { getProducts } from "../api/productApi";
import { toggleWishlist } from "../api/productApi";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

function getPageMeta(params) {
  const cat  = params.get("category");
  const sub  = params.get("sub");
  const tag  = params.get("tag");
  const sort = params.get("sort");
  const filter = params.get("filter");
  const q    = params.get("q");
  if (q)      return { title:`Search: "${q}"`,     sub:"SEARCH RESULTS" };
  if (sub)    return { title:sub,                   sub:`${cat?.toUpperCase()||""} · ${sub.toUpperCase()}` };
  if (tag==="SALE") {
    if (cat)  return { title:`${cat} Sale`,         sub:"UP TO 70% OFF" };
    return    { title:"Sale",                        sub:"UP TO 70% OFF · SELECTED STYLES" };
  }
  if (tag==="NEW") return { title:"New Arrivals",   sub:"SPRING / SUMMER 2026" };
  if (sort==="trending") return { title:"Trending Now", sub:"MOST COVETED THIS SEASON" };
  if (filter==="restock") return { title:"Back in Stock", sub:"RETURNED BY POPULAR DEMAND" };
  if (filter==="editors") return { title:"Editor's Picks", sub:"CURATED BY THE MAISON TEAM" };
  if (cat)   return { title:cat,                    sub:`THE ${cat.toUpperCase()} COLLECTION` };
  return     { title:"The Collection",              sub:"SPRING / SUMMER 2026" };
}

const HeartIcon = ({ filled }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill={filled?"#e07070":"none"} stroke="currentColor" strokeWidth="1.8">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);

const Spinner = () => (
  <div style={{ display:"flex", justifyContent:"center", alignItems:"center", padding:"80px 0", gap:14 }}>
    <div style={{ width:28, height:28, border:`2px solid ${C.gold}`, borderTopColor:"transparent", borderRadius:"50%", animation:"spSpin .75s linear infinite" }}/>
    <style>{`@keyframes spSpin{to{transform:rotate(360deg)}}`}</style>
    <span style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:12, letterSpacing:"0.2em", color:"#6b5c44" }}>LOADING…</span>
  </div>
);

const GRAD = [
  "linear-gradient(160deg,#e8e8e8,#c8c8d0)",
  "linear-gradient(160deg,#c8b080,#806840)",
  "linear-gradient(160deg,#6b4c36,#2e1e0e)",
  "linear-gradient(160deg,#f0ebe0,#c8bca8)",
  "linear-gradient(160deg,#2a2a2a,#0d0d0d)",
  "linear-gradient(160deg,#c9a84c,#8a6228)",
];

function ProductCard({ product, index, wishlistIds, onWishlistToggle }) {
  const [hov, setHov]         = useState(false);
  const [showSizes, setShowSizes] = useState(false);
  const [toast, setToast]     = useState(false);
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const isWished = wishlistIds.includes(product._id);
  const grad = GRAD[index % GRAD.length];
  const img  = product.images?.[0]?.url;
  const hasOrig = product.originalPrice && product.originalPrice > product.price;
  const disc    = hasOrig ? Math.round((1-product.price/product.originalPrice)*100) : 0;
  const sizes   = product.sizes?.length ? product.sizes : ["XS","S","M","L","XL"];

  const doAdd = (e, size) => {
    e.stopPropagation();
    addToCart({ _id:product._id, name:product.name, price:product.price, category:product.category, images:product.images }, size, 1);
    setShowSizes(false);
    setToast(true);
    setTimeout(() => setToast(false), 2000);
  };

  return (
    <>
      <div style={{ position:"fixed", bottom:32, left:"50%", transform:`translateX(-50%) translateY(${toast?0:"8px"})`, opacity:toast?1:0, pointerEvents:"none", background:"#1a1208", border:"1px solid rgba(201,168,76,0.4)", padding:"13px 28px", zIndex:9999, fontFamily:"'Cormorant Garamond',serif", fontSize:13, letterSpacing:"0.14em", color:"#e8c96e", transition:"all 0.35s" }}>
        ✓ &nbsp;Added to cart
      </div>
      <div onMouseEnter={() => setHov(true)} onMouseLeave={() => { setHov(false); setShowSizes(false); }}
        onClick={() => navigate(`/shop/${product._id}`)}
        style={{ cursor:"pointer", animation:`fadeUp 0.5s ease ${Math.min(index*0.05,0.4)}s both` }}>
        <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}`}</style>
        <div style={{ position:"relative", overflow:"hidden", aspectRatio:"3/4", marginBottom:"13px", background:grad }}>
          {img && <img src={img} alt={product.name} onError={e=>e.target.style.display="none"}
            style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", transition:"transform 0.5s ease", transform:hov?"scale(1.06)":"scale(1)" }}/>}
          <div style={{ position:"absolute", inset:0, background:"rgba(0,0,0,0.15)", opacity:hov?1:0, transition:"opacity 0.3s" }}/>

          {product.tag && (
            <div style={{ position:"absolute", top:12, left:12, background:product.tag==="SALE"?"#e07070":C.gold, color:"#0f0c08", fontSize:"8px", letterSpacing:"0.18em", fontWeight:600, padding:"3px 9px" }}>
              {product.tag}
            </div>
          )}

          <button onClick={e => { e.stopPropagation(); if(isAuthenticated) onWishlistToggle(product._id); else navigate("/login"); }}
            style={{ position:"absolute", top:12, right:12, width:32, height:32, background:"rgba(255,255,255,0.92)", display:"flex", alignItems:"center", justifyContent:"center", border:"none", cursor:"pointer", color:isWished?"#e07070":"#3a2e1e", transition:"all 0.2s" }}>
            <HeartIcon filled={isWished}/>
          </button>

          {/* Add to cart / size picker */}
          {hov && (
            <div style={{ position:"absolute", bottom:0, left:0, right:0, zIndex:10, background:"rgba(10,6,2,0.94)", padding:"12px" }}>
              {!showSizes
                ? <button onClick={e => { e.stopPropagation(); setShowSizes(true); }}
                    style={{ width:"100%", padding:"10px 0", background:"#c9a84c", border:"none", color:"#0f0c08", cursor:"pointer", fontFamily:"'Cormorant Garamond',serif", fontSize:"9px", letterSpacing:"0.22em", fontWeight:600 }}>
                    ADD TO CART
                  </button>
                : <div>
                    <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"8px", letterSpacing:"0.22em", color:"rgba(255,255,255,0.45)", marginBottom:8, textAlign:"center" }}>SELECT SIZE</div>
                    <div style={{ display:"flex", gap:6, justifyContent:"center", flexWrap:"wrap" }}>
                      {sizes.map(s => (
                        <button key={s} onClick={e => doAdd(e,s)}
                          style={{ width:36, height:36, background:"rgba(255,255,255,0.07)", border:"1px solid rgba(201,168,76,0.35)", color:"rgba(255,255,255,0.75)", cursor:"pointer", fontFamily:"'Cormorant Garamond',serif", fontSize:"11px", transition:"all .15s" }}
                          onMouseEnter={e => { e.currentTarget.style.background="#c9a84c"; e.currentTarget.style.color="#0f0c08"; }}
                          onMouseLeave={e => { e.currentTarget.style.background="rgba(255,255,255,0.07)"; e.currentTarget.style.color="rgba(255,255,255,0.75)"; }}>
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
              }
            </div>
          )}
        </div>

        <div style={{ fontSize:"9.5px", letterSpacing:"0.14em", color:"#6b5c44", fontFamily:"'Cormorant Garamond',Georgia,serif", marginBottom:3 }}>
          {product.category?.toUpperCase()}{product.subCategory ? ` · ${product.subCategory.toUpperCase()}` : ""}
        </div>
        <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"15px", color:"#1a1208", marginBottom:5 }}>{product.name}</div>
        <div style={{ display:"flex", alignItems:"center", gap:9 }}>
          <span style={{ fontFamily:"'Playfair Display',serif", fontSize:"14px", color:"#1a1208" }}>₹{Number(product.price).toLocaleString("en-IN")}</span>
          {hasOrig && <>
            <span style={{ fontSize:"12px", color:"#b0a08a", textDecoration:"line-through", fontFamily:"'Cormorant Garamond',Georgia,serif" }}>₹{Number(product.originalPrice).toLocaleString("en-IN")}</span>
            <span style={{ fontSize:"9px", color:"#e07070", letterSpacing:"0.1em" }}>{disc}% OFF</span>
          </>}
        </div>
      </div>
    </>
  );
}

export default function ShopPage() {
  const [searchParams] = useSearchParams();
  const [sortBy,      setSortBy]      = useState("Featured");
  const [priceMax,    setPriceMax]    = useState(60000);
  const [filterOpen,  setFilterOpen]  = useState(false);
  const [products,    setProducts]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [total,       setTotal]       = useState(0);
  const [page,        setPage]        = useState(1);
  const [wishlistIds, setWishlistIds] = useState([]);
  const { user, refreshUser }         = useAuth();
  const LIMIT = 24;

  const cat    = searchParams.get("category");
  const sub    = searchParams.get("sub");
  const tag    = searchParams.get("tag");
  const sort   = searchParams.get("sort");
  const filter = searchParams.get("filter");
  const q      = searchParams.get("q");
  const meta   = getPageMeta(searchParams);

  // Track wishlist ids from user
  useEffect(() => {
    if (user?.wishlist) setWishlistIds(user.wishlist.map(w => w._id || w));
  }, [user]);

  const sortParam = () => {
    if (sortBy === "Price: Low to High")  return "price";
    if (sortBy === "Price: High to Low")  return "-price";
    if (sortBy === "Newest First")        return "-createdAt";
    return "-createdAt";
  };

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = { limit:LIMIT, page, sort:sortParam(), maxPrice:priceMax };
      if (q)   params.keyword  = q;
      if (cat) params.category = cat;
      if (tag) params.tag      = tag;
      const res = await getProducts(params);
      setProducts(res.products || []);
      setTotal(res.total || 0);
    } catch {
      setProducts([]);
      setTotal(0);
    } finally { setLoading(false); }
  }, [q, cat, tag, page, sortBy, priceMax]);

  useEffect(() => { window.scrollTo(0,0); setPage(1); }, [searchParams.toString()]);
  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  // Client-side filter by sub/filter
  const filtered = products.filter(p => {
    if (sub && cat) return p.subCategory === sub;
    if (filter === "editors") return p.isFeatured;
    return true;
  });

  const totalPages = Math.ceil(total / LIMIT);

  const handleWishlistToggle = async (productId) => {
    try {
      await toggleWishlist(productId);
      await refreshUser();
    } catch { /* silent fail */ }
  };

  return (
    <div style={{ paddingTop:"64px", background:"#f5f0eb", minHeight:"100vh" }}>
      {/* Hero header */}
      <div className="r-section" style={{ background:"linear-gradient(135deg,#1a1208,#2a1e0a,#1a1208)", paddingTop:"60px", paddingBottom:"50px", textAlign:"center", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse 60% 80% at 50% 50%,rgba(201,168,76,0.07),transparent)", pointerEvents:"none" }}/>
        {tag === "SALE" && <div style={{ display:"inline-block", background:"#e07070", color:"#fff", fontSize:"8px", letterSpacing:"0.22em", padding:"4px 14px", marginBottom:20 }}>UP TO 70% OFF</div>}
        <div style={{ width:40, height:1, margin:"0 auto 20px", background:"linear-gradient(90deg,transparent,#c9a84c,transparent)" }}/>
        <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(36px,5vw,64px)", fontWeight:400, color:"#fff", margin:"0 0 10px", lineHeight:1.05 }}>{meta.title}</h1>
        <p style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"9.5px", letterSpacing:"0.28em", color:"rgba(255,255,255,0.38)" }}>{meta.sub}</p>
      </div>

      {/* Sort & filter bar */}
      <div className="r-section" style={{ background:"#fff", borderBottom:"1px solid rgba(201,168,76,0.15)", position:"sticky", top:64, zIndex:100, display:"flex", alignItems:"center", justifyContent:"space-between", gap:16, flexWrap:"wrap" }}>
        <span style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"12px", color:"#6b5c44", padding:"16px 0" }}>
          {loading ? "…" : `${total} ${total===1?"piece":"pieces"}`}
        </span>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <select value={sortBy} onChange={e => { setSortBy(e.target.value); setPage(1); }}
            style={{ padding:"8px 14px", border:"1px solid rgba(201,168,76,0.3)", background:"#fff", fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"11px", color:"#3a2e1e", cursor:"pointer", outline:"none" }}>
            {["Featured","Price: Low to High","Price: High to Low","Newest First"].map(o => <option key={o}>{o}</option>)}
          </select>
          <button onClick={() => setFilterOpen(f => !f)}
            style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 14px", border:`1px solid ${filterOpen?C.gold:"rgba(201,168,76,0.3)"}`, background:filterOpen?"rgba(201,168,76,0.05)":"transparent", color:filterOpen?C.gold:"#6b5c44", cursor:"pointer", fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"11px", letterSpacing:"0.1em" }}>
            ▼ FILTER
          </button>
        </div>
      </div>

      {/* Filter drawer */}
      {filterOpen && (
        <div className="r-section" style={{ background:"#fff", borderBottom:"1px solid rgba(201,168,76,0.12)", paddingTop:"20px", paddingBottom:"20px", display:"flex", alignItems:"center", gap:32 }}>
          <div>
            <div style={{ fontSize:"9px", letterSpacing:"0.2em", color:"#3a2e1e", marginBottom:10, fontFamily:"'Cormorant Garamond',Georgia,serif" }}>PRICE RANGE</div>
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              <span style={{ fontSize:"12px", color:"#6b5c44", fontFamily:"'Cormorant Garamond',Georgia,serif" }}>₹0</span>
              <input type="range" min={0} max={60000} step={500} value={priceMax} onChange={e => { setPriceMax(+e.target.value); setPage(1); }} style={{ width:160, accentColor:C.gold }}/>
              <span style={{ fontSize:"12px", color:"#6b5c44", fontFamily:"'Cormorant Garamond',Georgia,serif" }}>₹{priceMax.toLocaleString("en-IN")}</span>
            </div>
          </div>
        </div>
      )}

      {/* Grid */}
      <div className="r-section r-section-v" style={{ maxWidth:1400, margin:"0 auto" }}>
        {loading ? <Spinner /> : filtered.length === 0 ? (
          <div style={{ textAlign:"center", padding:"80px 0" }}>
            <div style={{ fontSize:48, marginBottom:16 }}>🔍</div>
            <p style={{ fontFamily:"'Playfair Display',serif", fontSize:22, color:"#6b5c44" }}>No pieces found</p>
            <p style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:14, color:"#b0a08a", marginTop:8 }}>Try adjusting your filters or browse the full collection</p>
          </div>
        ) : (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))", gap:"32px 20px" }}>
            {filtered.map((p, i) => (
              <ProductCard key={p._id} product={p} index={i} wishlistIds={wishlistIds} onWishlistToggle={handleWishlistToggle}/>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && !loading && (
          <div style={{ display:"flex", justifyContent:"center", flexWrap:"wrap", alignItems:"center", gap:8, marginTop:64 }}>
            <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1}
              style={{ padding:"9px 20px", background:"none", border:`1px solid ${page===1?"rgba(201,168,76,.2)":"#c9a84c"}`, color:page===1?"rgba(201,168,76,.3)":"#c9a84c", cursor:page===1?"not-allowed":"pointer", fontFamily:"'Cormorant Garamond',serif", fontSize:11, letterSpacing:"0.14em" }}>
              ← PREV
            </button>
            {Array.from({length:Math.min(totalPages,7)},(_,i)=>i+1).map(pg => (
              <button key={pg} onClick={() => setPage(pg)}
                style={{ width:38, height:38, background:pg===page?"#c9a84c":"transparent", border:`1px solid ${pg===page?"#c9a84c":"rgba(201,168,76,.3)"}`, color:pg===page?"#0f0c08":"#6b5c44", fontFamily:"'Cormorant Garamond',serif", fontSize:13, cursor:"pointer", transition:"all .2s" }}>
                {pg}
              </button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages,p+1))} disabled={page===totalPages}
              style={{ padding:"9px 20px", background:"none", border:`1px solid ${page===totalPages?"rgba(201,168,76,.2)":"#c9a84c"}`, color:page===totalPages?"rgba(201,168,76,.3)":"#c9a84c", cursor:page===totalPages?"not-allowed":"pointer", fontFamily:"'Cormorant Garamond',serif", fontSize:11, letterSpacing:"0.14em" }}>
              NEXT →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
