import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { C } from "../components/shared";
import { getProducts } from "../api/productApi";
import { toggleWishlist } from "../api/productApi";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

/* ─── Scoped styles ─────────────────────────────────────────────────────────── */
const ShopStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&family=Bebas+Neue&display=swap');

    .sp-root {
      --sp-bg: #f7f4f0;
      --sp-card: #ffffff;
      --sp-text: #1c1714;
      --sp-mid: #4a3f35;
      --sp-muted: #8a7d70;
      --sp-accent: #c9a84c;
      --sp-accent-h: #e8c96e;
      --sp-accent-d: #a8863a;
      --sp-red: #d05050;
      --sp-bdr: rgba(60,40,20,0.10);
    }

    /* Hero */
    .sp-title {
      font-family: 'Bebas Neue', sans-serif;
      letter-spacing: 0.03em;
      line-height: 0.92;
      color: #ffffff;
      font-size: clamp(56px, 7.5vw, 104px);
      text-shadow: 0 2px 40px rgba(0,0,0,0.4);
      margin: 0 0 14px;
    }
    .sp-subtitle {
      font-family: 'DM Sans', sans-serif;
      font-weight: 600;
      letter-spacing: 0.24em;
      font-size: 11px;
      color: rgba(255,255,255,0.45);
      text-transform: uppercase;
    }

    /* Cards */
    .sp-card {
      background: #fff;
      border-radius: 6px;
      overflow: hidden;
      cursor: pointer;
      transition: box-shadow 0.3s ease, transform 0.3s ease;
    }
    .sp-card:hover {
      box-shadow: 0 10px 40px rgba(28,23,20,0.14);
      transform: translateY(-4px);
    }
    .sp-cat-label {
      font-family: 'DM Sans', sans-serif;
      font-weight: 700;
      font-size: 10px;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: var(--sp-muted);
      margin-bottom: 5px;
    }
    .sp-name {
      font-family: 'DM Serif Display', serif;
      font-size: 17px;
      line-height: 1.25;
      color: var(--sp-text);
      margin-bottom: 10px;
    }
    .sp-price {
      font-family: 'DM Sans', sans-serif;
      font-weight: 700;
      font-size: 16px;
      color: var(--sp-text);
    }
    .sp-price-orig {
      font-family: 'DM Sans', sans-serif;
      font-weight: 400;
      font-size: 13px;
      color: var(--sp-muted);
      text-decoration: line-through;
    }
    .sp-disc {
      font-family: 'DM Sans', sans-serif;
      font-weight: 700;
      font-size: 11px;
      color: var(--sp-red);
    }

    /* Toolbar */
    .sp-count {
      font-family: 'DM Sans', sans-serif;
      font-weight: 500;
      font-size: 14px;
      color: var(--sp-muted);
    }
    .sp-sort {
      font-family: 'DM Sans', sans-serif;
      font-size: 13px;
      font-weight: 500;
      color: var(--sp-mid);
      padding: 9px 14px;
      border: 1.5px solid var(--sp-bdr);
      border-radius: 4px;
      background: #fff;
      cursor: pointer;
      outline: none;
      transition: border-color .2s;
    }
    .sp-sort:focus, .sp-sort:hover { border-color: var(--sp-accent); }
    .sp-filter-btn {
      font-family: 'DM Sans', sans-serif;
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 0.1em;
      display: flex; align-items: center; gap: 7px;
      padding: 9px 18px;
      border: 1.5px solid var(--sp-bdr);
      border-radius: 4px;
      background: transparent;
      color: var(--sp-mid);
      cursor: pointer;
      transition: all .2s;
    }
    .sp-filter-btn.sp-active, .sp-filter-btn:hover {
      border-color: var(--sp-accent);
      color: var(--sp-accent-d);
      background: rgba(201,168,76,0.05);
    }

    /* Add to cart */
    .sp-add-btn {
      font-family: 'DM Sans', sans-serif;
      font-weight: 700;
      font-size: 11px;
      letter-spacing: 0.18em;
      width: 100%;
      padding: 13px 0;
      background: var(--sp-accent);
      border: none;
      color: #1c1714;
      cursor: pointer;
      transition: background .2s;
      text-transform: uppercase;
    }
    .sp-add-btn:hover { background: var(--sp-accent-h); }

    .sp-size-btn {
      font-family: 'DM Sans', sans-serif;
      font-weight: 600;
      font-size: 12px;
      width: 38px; height: 38px;
      background: rgba(255,255,255,0.08);
      border: 1.5px solid rgba(255,255,255,0.22);
      color: rgba(255,255,255,0.85);
      cursor: pointer;
      border-radius: 3px;
      transition: all .15s;
    }
    .sp-size-btn:hover {
      background: var(--sp-accent);
      color: #1c1714;
      border-color: var(--sp-accent);
    }

    /* Pagination */
    .sp-pg-num {
      font-family: 'DM Sans', sans-serif;
      font-weight: 600;
      font-size: 13px;
      width: 40px; height: 40px;
      border-radius: 4px;
      border: 1.5px solid var(--sp-bdr);
      background: transparent;
      color: var(--sp-mid);
      cursor: pointer;
      transition: all .2s;
    }
    .sp-pg-num:hover { border-color: var(--sp-accent); color: var(--sp-accent-d); }
    .sp-pg-num.sp-cur {
      background: var(--sp-accent);
      border-color: var(--sp-accent);
      color: #1c1714;
    }
    .sp-pg-nav {
      font-family: 'DM Sans', sans-serif;
      font-weight: 700;
      font-size: 12px;
      letter-spacing: 0.12em;
      padding: 10px 22px;
      border-radius: 4px;
      border: 1.5px solid var(--sp-bdr);
      background: transparent;
      color: var(--sp-mid);
      cursor: pointer;
      transition: all .2s;
    }
    .sp-pg-nav:hover:not(:disabled) { border-color: var(--sp-accent); color: var(--sp-accent-d); }
    .sp-pg-nav:disabled { opacity: 0.3; cursor: not-allowed; }

    /* Sale badge */
    .sp-sale-tag {
      font-family: 'DM Sans', sans-serif;
      font-weight: 700;
      font-size: 9px;
      letter-spacing: 0.14em;
    }

    @keyframes sp-fade-up {
      from { opacity:0; transform:translateY(22px); }
      to   { opacity:1; transform:translateY(0); }
    }
    @keyframes sp-spin { to { transform: rotate(360deg); } }
  `}</style>
);

function getPageMeta(params) {
  const cat=params.get("category"), sub=params.get("sub"), tag=params.get("tag");
  const sort=params.get("sort"), filter=params.get("filter"), q=params.get("q");
  if(q)            return {title:`"${q}"`, sub:"SEARCH RESULTS"};
  if(sub)          return {title:sub, sub:`${cat?.toUpperCase()||""} · ${sub.toUpperCase()}`};
  if(tag==="SALE"){
    if(cat)        return {title:`${cat} Sale`, sub:"UP TO 70% OFF"};
    return         {title:"Sale", sub:"UP TO 70% OFF · SELECTED STYLES"};
  }
  if(tag==="NEW")  return {title:"New Arrivals", sub:"SPRING / SUMMER 2026"};
  if(sort==="trending") return {title:"Trending Now", sub:"MOST COVETED THIS SEASON"};
  if(filter==="restock") return {title:"Back in Stock", sub:"RETURNED BY POPULAR DEMAND"};
  if(filter==="editors") return {title:"Editor's Picks", sub:"CURATED BY THE MAISON TEAM"};
  if(cat)          return {title:cat, sub:`THE ${cat.toUpperCase()} COLLECTION`};
  return           {title:"The Collection", sub:"SPRING / SUMMER 2026"};
}

const HeartIcon = ({filled}) => (
  <svg width="15" height="15" viewBox="0 0 24 24"
    fill={filled?"#d05050":"none"} stroke={filled?"#d05050":"currentColor"} strokeWidth="2">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);

const GRAD = [
  "linear-gradient(160deg,#ece8e2,#c8c0b4)",
  "linear-gradient(160deg,#d4bc96,#a07850)",
  "linear-gradient(160deg,#7e6048,#3a2416)",
  "linear-gradient(160deg,#f0ede5,#d4cabb)",
  "linear-gradient(160deg,#363030,#181414)",
  "linear-gradient(160deg,#d4b444,#906820)",
];

function ProductCard({product, index, wishlistIds, onWishlistToggle}) {
  const [hov, setHov]             = useState(false);
  const [showSizes, setShowSizes] = useState(false);
  const [toast, setToast]         = useState(false);
  const navigate     = useNavigate();
  const {addToCart}  = useCart();
  const {isAuthenticated} = useAuth();
  const isWished = wishlistIds.includes(product._id);
  const img      = product.images?.[0]?.url;
  const hasOrig  = product.originalPrice && product.originalPrice > product.price;
  const disc     = hasOrig ? Math.round((1 - product.price/product.originalPrice)*100) : 0;
  const sizes    = product.sizes?.length ? product.sizes : ["XS","S","M","L","XL"];

  const doAdd = (e, size) => {
    e.stopPropagation();
    addToCart({_id:product._id, name:product.name, price:product.price, category:product.category, images:product.images}, size, 1);
    setShowSizes(false);
    setToast(true);
    setTimeout(()=>setToast(false), 2200);
  };

  return (
    <>
      {/* Toast */}
      <div style={{
        position:"fixed", bottom:32, left:"50%",
        transform:`translateX(-50%) translateY(${toast?0:"12px"})`,
        opacity:toast?1:0, pointerEvents:"none",
        background:"#1c1714", border:"1.5px solid rgba(201,168,76,0.5)",
        padding:"14px 32px", zIndex:9999,
        fontFamily:"'DM Sans',sans-serif", fontSize:14, fontWeight:700,
        letterSpacing:"0.08em", color:"#e8c96e",
        borderRadius:4, boxShadow:"0 8px 30px rgba(0,0,0,0.28)",
        transition:"all 0.3s cubic-bezier(0.4,0,0.2,1)"
      }}>
        ✓ &nbsp;Added to cart
      </div>

      <div
        className="sp-card"
        onMouseEnter={()=>setHov(true)}
        onMouseLeave={()=>{setHov(false);setShowSizes(false);}}
        onClick={()=>navigate(`/shop/${product._id}`)}
        style={{animation:`sp-fade-up 0.45s ease ${Math.min(index*0.045,0.35)}s both`}}
      >
        {/* Image */}
        <div style={{position:"relative", overflow:"hidden", aspectRatio:"3/4", background:GRAD[index%GRAD.length]}}>
          {img && (
            <img src={img} alt={product.name}
              onError={e=>e.target.style.display="none"}
              style={{
                position:"absolute", inset:0, width:"100%", height:"100%",
                objectFit:"cover",
                transition:"transform 0.55s cubic-bezier(0.4,0,0.2,1)",
                transform: hov ? "scale(1.07)" : "scale(1)"
              }}
            />
          )}
          <div style={{
            position:"absolute", inset:0, background:"rgba(0,0,0,0.16)",
            opacity:hov?1:0, transition:"opacity 0.3s"
          }}/>

          {product.tag && (
            <div className="sp-sale-tag" style={{
              position:"absolute", top:12, left:12,
              background: product.tag==="SALE" ? "#d05050" : C.gold,
              color: product.tag==="SALE" ? "#fff" : "#1c1714",
              padding:"4px 10px", borderRadius:2
            }}>
              {product.tag}
            </div>
          )}

          <button
            onClick={e=>{e.stopPropagation(); if(isAuthenticated) onWishlistToggle(product._id); else navigate("/login");}}
            style={{
              position:"absolute", top:12, right:12,
              width:36, height:36,
              background:"rgba(255,255,255,0.95)", backdropFilter:"blur(4px)",
              display:"flex", alignItems:"center", justifyContent:"center",
              border:"none", cursor:"pointer",
              color: isWished?"#d05050":"#4a3f35",
              borderRadius:"50%",
              boxShadow:"0 2px 8px rgba(0,0,0,0.12)",
              transition:"all 0.2s"
            }}
          >
            <HeartIcon filled={isWished}/>
          </button>

          {hov && (
            <div style={{
              position:"absolute", bottom:0, left:0, right:0,
              background:"rgba(14,9,4,0.93)", padding:"14px 14px 16px",
              backdropFilter:"blur(2px)"
            }}>
              {!showSizes
                ? <button className="sp-add-btn" onClick={e=>{e.stopPropagation();setShowSizes(true);}}>ADD TO CART</button>
                : <div>
                    <div style={{
                      fontFamily:"'DM Sans',sans-serif", fontWeight:700,
                      fontSize:10, letterSpacing:"0.10em",
                      color:"rgba(255,255,255,0.45)", marginBottom:10,
                      textAlign:"center", textTransform:"uppercase"
                    }}>Select Size</div>
                    <div style={{display:"flex", gap:6, justifyContent:"center", flexWrap:"wrap"}}>
                      {sizes.map(s=>(
                        <button key={s} className="sp-size-btn" onClick={e=>doAdd(e,s)}>{s}</button>
                      ))}
                    </div>
                  </div>
              }
            </div>
          )}
        </div>

        {/* Info */}
        <div style={{padding:"15px 16px 20px"}}>
          <div className="sp-cat-label">{product.category?.toUpperCase()}{product.subCategory ? ` · ${product.subCategory.toUpperCase()}` : ""}</div>
          <div className="sp-name">{product.name}</div>
          <div style={{display:"flex", alignItems:"center", gap:10}}>
            <span className="sp-price">₹{Number(product.price).toLocaleString("en-IN")}</span>
            {hasOrig && <>
              <span className="sp-price-orig">₹{Number(product.originalPrice).toLocaleString("en-IN")}</span>
              <span className="sp-disc">−{disc}%</span>
            </>}
          </div>
        </div>
      </div>
    </>
  );
}

const Spinner = () => (
  <div style={{display:"flex", flexDirection:"column", alignItems:"center", padding:"100px 0", gap:18}}>
    <div style={{
      width:36, height:36,
      border:"3px solid rgba(201,168,76,0.2)",
      borderTopColor:"#c9a84c", borderRadius:"50%",
      animation:"sp-spin 0.75s linear infinite"
    }}/>
    <span style={{fontFamily:"'DM Sans',sans-serif", fontWeight:600, fontSize:11, letterSpacing:"0.12em", color:"#8a7d70", textTransform:"uppercase"}}>
      Loading…
    </span>
  </div>
);

export default function ShopPage() {
  const [searchParams] = useSearchParams();
  const [sortBy,     setSortBy]     = useState("Featured");
  const [priceMax,   setPriceMax]   = useState(60000);
  const [filterOpen, setFilterOpen] = useState(false);
  const [products,   setProducts]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [total,      setTotal]      = useState(0);
  const [page,       setPage]       = useState(1);
  const [wishlistIds,setWishlistIds]= useState([]);
  const {user, refreshUser} = useAuth();
  const LIMIT = 24;

  const cat=searchParams.get("category"), sub=searchParams.get("sub");
  const tag=searchParams.get("tag"), sort=searchParams.get("sort");
  const filter=searchParams.get("filter"), q=searchParams.get("q");
  const meta = getPageMeta(searchParams);

  useEffect(()=>{
    if(user?.wishlist) setWishlistIds(user.wishlist.map(w=>w._id||w));
  },[user]);

  const sortParam = ()=>{
    if(sortBy==="Price: Low to High")  return "price";
    if(sortBy==="Price: High to Low")  return "-price";
    if(sortBy==="Newest First")        return "-createdAt";
    return "-createdAt";
  };

  const fetchProducts = useCallback(async()=>{
    setLoading(true);
    try {
      const params = {limit:LIMIT, page, sort:sortParam(), maxPrice:priceMax};
      if(q)   params.keyword     = q;
      if(cat) params.category    = cat;
      if(sub) params.subCategory = sub;
      if(tag) params.tag         = tag;
      const res = await getProducts(params);
      setProducts(res.products||[]);
      setTotal(res.total||0);
    } catch { setProducts([]); setTotal(0); }
    finally  { setLoading(false); }
  },[q,cat,sub,tag,page,sortBy,priceMax]);

  useEffect(()=>{ window.scrollTo(0,0); setPage(1); },[searchParams.toString()]);
  useEffect(()=>{ fetchProducts(); },[fetchProducts]);

  const filtered = products.filter(p=>{
    if(filter==="editors") return p.isFeatured;
    return true;
  });

  const displayCount = sub ? filtered.length : total;
  const totalPages = Math.ceil((sub ? filtered.length : total) / LIMIT);

  const handleWishlistToggle = async(productId)=>{
    try { await toggleWishlist(productId); await refreshUser(); } catch {}
  };

  return (
    <div className="sp-root" style={{paddingTop:"64px", background:"var(--sp-bg)", minHeight:"100vh"}}>
      <ShopStyles/>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div className="r-section" style={{
        background:"linear-gradient(145deg,#1c1410 0%,#2a1e0e 48%,#1c1410 100%)",
        paddingTop:"72px", paddingBottom:"64px",
        textAlign:"center", position:"relative", overflow:"hidden"
      }}>
        <div style={{position:"absolute",inset:0,backgroundImage:"radial-gradient(ellipse 70% 90% at 50% 50%,rgba(201,168,76,0.09) 0%,transparent 70%)",pointerEvents:"none"}}/>
        {tag==="SALE" && (
          <div style={{
            display:"inline-block", background:"#d05050", color:"#fff",
            fontFamily:"'DM Sans',sans-serif", fontWeight:700,
            fontSize:10, letterSpacing:"0.12em",
            padding:"5px 18px", marginBottom:22, borderRadius:2
          }}>UP TO 70% OFF</div>
        )}
        <div style={{width:48,height:2,margin:"0 auto 22px",background:"linear-gradient(90deg,transparent,#c9a84c,transparent)"}}/>
        <h1 className="sp-title">{meta.title}</h1>
        <p className="sp-subtitle">{meta.sub}</p>
      </div>

      {/* ── Toolbar ──────────────────────────────────────────────────────── */}
      <div className="r-section" style={{
        background:"#fff",
        borderBottom:"1.5px solid rgba(60,40,20,0.08)",
        position:"sticky", top:64, zIndex:100,
        display:"flex", alignItems:"center",
        justifyContent:"space-between", gap:16, flexWrap:"wrap",
        boxShadow:"0 2px 12px rgba(0,0,0,0.05)"
      }}>
        <span className="sp-count" style={{padding:"16px 0"}}>
          {loading ? "—" : `${displayCount.toLocaleString()} ${displayCount===1?"piece":"pieces"}`}
        </span>
        <div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 0"}}>
          <select className="sp-sort" value={sortBy} onChange={e=>{setSortBy(e.target.value);setPage(1);}}>
            {["Featured","Price: Low to High","Price: High to Low","Newest First"].map(o=><option key={o}>{o}</option>)}
          </select>
          <button
            className={`sp-filter-btn${filterOpen?" sp-active":""}`}
            onClick={()=>setFilterOpen(f=>!f)}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="4" y1="6" x2="20" y2="6"/>
              <line x1="8" y1="12" x2="16" y2="12"/>
              <line x1="11" y1="18" x2="13" y2="18"/>
            </svg>
            FILTER
          </button>
        </div>
      </div>

      {/* ── Filter Drawer ─────────────────────────────────────────────────── */}
      {filterOpen && (
        <div className="r-section" style={{
          background:"#faf8f5",
          borderBottom:"1.5px solid rgba(60,40,20,0.08)",
          paddingTop:24,paddingBottom:24,
          display:"flex",alignItems:"center",gap:40
        }}>
          <div>
            <div style={{fontFamily:"'DM Sans',sans-serif",fontWeight:700,fontSize:10,letterSpacing:"0.20em",color:"#1c1714",marginBottom:12,textTransform:"uppercase"}}>
              Price Range
            </div>
            <div style={{display:"flex",alignItems:"center",gap:14}}>
              <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:500,color:"#8a7d70"}}>₹0</span>
              <input type="range" min={0} max={60000} step={500} value={priceMax}
                onChange={e=>{setPriceMax(+e.target.value);setPage(1);}}
                style={{width:180, accentColor:"#c9a84c", cursor:"pointer"}}
              />
              <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:700,color:"#1c1714"}}>
                ₹{priceMax.toLocaleString("en-IN")}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ── Grid ──────────────────────────────────────────────────────────── */}
      <div className="r-section r-section-v" style={{maxWidth:1400,margin:"0 auto"}}>
        {loading ? <Spinner/> : filtered.length===0 ? (
          <div style={{textAlign:"center",padding:"80px 0"}}>
            <div style={{fontSize:48,marginBottom:20}}>🔍</div>
            <p style={{fontFamily:"'DM Serif Display',serif",fontSize:26,color:"#4a3f35",marginBottom:10}}>
              No pieces found
            </p>
            <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:15,color:"#8a7d70"}}>
              Try adjusting your filters or browse the full collection
            </p>
          </div>
        ) : (
          <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(250px,1fr))", gap:"32px 20px"}}>
            {filtered.map((p,i)=>(
              <ProductCard key={p._id} product={p} index={i} wishlistIds={wishlistIds} onWishlistToggle={handleWishlistToggle}/>
            ))}
          </div>
        )}

        {/* ── Pagination ────────────────────────────────────────────────── */}
        {totalPages>1 && !loading && (
          <div style={{display:"flex",justifyContent:"center",alignItems:"center",flexWrap:"wrap",gap:8,marginTop:72}}>
            <button className="sp-pg-nav" onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1}>← PREV</button>
            {Array.from({length:Math.min(totalPages,7)},(_,i)=>i+1).map(pg=>(
              <button key={pg} className={`sp-pg-num${pg===page?" sp-cur":""}`} onClick={()=>setPage(pg)}>{pg}</button>
            ))}
            <button className="sp-pg-nav" onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages}>NEXT →</button>
          </div>
        )}
      </div>
    </div>
  );
}