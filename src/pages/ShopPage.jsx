import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { C } from "../components/shared";

const CATEGORIES = ["All", "Women", "Men", "Accessories", "New In", "Sale"];
const SORT_OPTIONS = ["Featured", "Price: Low to High", "Price: High to Low", "Newest First"];

// FIX: All product images updated to verified Unsplash URLs matched to product names.
// Each photo ID correctly depicts the named garment/accessory.
const PRODUCTS = [
  { id:1,  name:"Navy Pinstripe Blazer",    category:"Men",         price:18500, original:null,  tag:"NEW",  colors:["#1a2a4a","#2a2a2a","#c9a84c"], image:"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80&fit=crop" },
  { id:2,  name:"Belted Trench Coat",       category:"Women",       price:24900, original:null,  tag:"NEW",  colors:["#c8b080","#1a1a1a","#e8e8e8"], image:"https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=80&fit=crop" },
  { id:3,  name:"Chelsea Leather Boots",    category:"Accessories", price:12750, original:18000, tag:"SALE", colors:["#1a1208","#4a321e","#c8b080"], image:"https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80&fit=crop" },
  { id:4,  name:"Silk Satin Blouse",        category:"Women",       price:8200,  original:null,  tag:null,   colors:["#f0ebe0","#c9a84c","#1a2a4a"], image:"https://images.unsplash.com/photo-1485968579580-ee2a6b1e450f?w=600&q=80&fit=crop" },
  { id:5,  name:"Structured Wool Blazer",   category:"Men",         price:22000, original:28000, tag:"SALE", colors:["#2a2a2a","#8a6228","#e8e8e8"], image:"https://images.unsplash.com/photo-1594938298870-5100bf2e3c8c?w=600&q=80&fit=crop" },
  { id:6,  name:"Pleated Midi Skirt",       category:"Women",       price:9800,  original:null,  tag:"NEW",  colors:["#f0ebe0","#c9a84c","#1a2a4a"], image:"https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=600&q=80&fit=crop" },
  { id:7,  name:"Silk Scarf – Heritage",    category:"Accessories", price:6500,  original:null,  tag:null,   colors:["#c9a84c","#1a2a4a","#e07070"], image:"https://images.unsplash.com/photo-1601924638-f3a5efb9f5c9?w=600&q=80&fit=crop" },
  { id:8,  name:"Slim Fit Dress Trousers",  category:"Men",         price:11200, original:null,  tag:null,   colors:["#1a1a1a","#2a2a2a","#6b5c44"], image:"https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&q=80&fit=crop" },
  { id:9,  name:"Cashmere Wrap Cardigan",   category:"Women",       price:19500, original:26000, tag:"SALE", colors:["#e8e8e8","#c8b080","#1a1208"], image:"https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=600&q=80&fit=crop" },
  { id:10, name:"Leather Crossbody Bag",    category:"Accessories", price:16800, original:null,  tag:"NEW",  colors:["#4a321e","#1a1208","#c8b080"], image:"https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80&fit=crop" },
  { id:11, name:"Shawl Collar Overcoat",    category:"Men",         price:34500, original:null,  tag:null,   colors:["#2a2a2a","#6b5c44","#e8e8e8"], image:"https://images.unsplash.com/photo-1520975916090-8105d898b5a1?w=600&q=80&fit=crop" },
  { id:12, name:"Draped Maxi Dress",        category:"Women",       price:13900, original:null,  tag:"NEW",  colors:["#1a2a4a","#c9a84c","#e8e8e8"], image:"https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&q=80&fit=crop" },
  { id:13, name:"Double-Breasted Suit",     category:"Men",         price:48000, original:null,  tag:"NEW",  colors:["#1a1a1a","#2a2a2a","#c9a84c"], image:"https://images.unsplash.com/photo-1617137968427-85924c800a22?w=600&q=80&fit=crop" },
  { id:14, name:"Wrap Evening Dress",       category:"Women",       price:15500, original:null,  tag:"NEW",  colors:["#e8d5c0","#c9a84c","#4a2a1a"], image:"https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600&q=80&fit=crop" },
  { id:15, name:"Structured Leather Tote",  category:"Accessories", price:22000, original:null,  tag:null,   colors:["#1a1208","#4a321e","#e8e0d0"], image:"https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600&q=80&fit=crop" },
  { id:16, name:"Fine Merino Knitwear",     category:"Men",         price:14800, original:null,  tag:null,   colors:["#c8b080","#2a2a2a","#e8e8e8"], image:"https://images.unsplash.com/photo-1614935151651-0bea6508db6b?w=600&q=80&fit=crop" },
];

const GRAD = [
  "linear-gradient(160deg,#e8e8e8 0%,#c8c8d0 50%,#a8a8b8 100%)",
  "linear-gradient(160deg,#c8b080 0%,#a89060 50%,#806840 100%)",
  "linear-gradient(160deg,#6b4c36 0%,#4a321e 50%,#2e1e0e 100%)",
  "linear-gradient(160deg,#f0ebe0 0%,#e0d8c8 50%,#c8bca8 100%)",
  "linear-gradient(160deg,#2a2a2a 0%,#1a1a1a 50%,#0d0d0d 100%)",
  "linear-gradient(160deg,#c9a84c 0%,#b8953e 50%,#8a6228 100%)",
];

const HeartIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);

const FilterIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/>
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
      style={{ cursor:"pointer", animation:`fadeUp 0.6s ease ${index * 0.07}s both` }}
    >
      <div style={{ position:"relative", overflow:"hidden", aspectRatio:"3/4", marginBottom:"14px", background:grad }}>
        {product.image && !imgErr && (
          <img
            src={product.image}
            alt={product.name}
            onError={() => setImgErr(true)}
            style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", transition:"transform 0.5s ease", transform: hov ? "scale(1.06)" : "scale(1)" }}
          />
        )}
        {/* Hover overlay */}
        <div style={{ position:"absolute", inset:0, background:"rgba(0,0,0,0.18)", opacity: hov ? 1 : 0, transition:"opacity 0.3s ease" }}/>
        {/* Tag */}
        {product.tag && (
          <div style={{ position:"absolute", top:"14px", left:"14px", background: product.tag === "SALE" ? "#e07070" : C.gold, color:"#0f0c08", fontSize:"8px", letterSpacing:"0.18em", fontWeight:600, padding:"4px 10px" }}>{product.tag}</div>
        )}
        {/* Wishlist */}
        <button onClick={e => { e.stopPropagation(); setWishlist(w => !w); }} style={{ position:"absolute", top:"14px", right:"14px", width:"34px", height:"34px", background:"rgba(255,255,255,0.92)", display:"flex", alignItems:"center", justifyContent:"center", border:"none", cursor:"pointer", color: wishlist ? "#e07070" : "#3a2e1e", transition:"all 0.2s" }}>
          <HeartIcon/>
        </button>
        {/* Quick Add */}
        <button style={{ position:"absolute", bottom:0, left:0, right:0, padding:"14px", textAlign:"center", fontSize:"9.5px", letterSpacing:"0.2em", background:"#1a1208", color:"#fff", border:"none", width:"100%", fontFamily:"'Cormorant Garamond',Georgia,serif", cursor:"pointer", opacity: hov ? 1 : 0, transform: hov ? "translateY(0)" : "translateY(100%)", transition:"all 0.3s ease" }}>ADD TO CART</button>
        {/* Colors */}
        <div style={{ position:"absolute", bottom: hov ? "54px" : "14px", right:"14px", display:"flex", gap:"5px", transition:"bottom 0.3s ease" }}>
          {product.colors.map(c => (
            <div key={c} style={{ width:"12px", height:"12px", borderRadius:"50%", background:c, border:"1px solid rgba(255,255,255,0.5)" }}/>
          ))}
        </div>
      </div>
      <div style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"10px", letterSpacing:"0.14em", color:"#6b5c44", marginBottom:"4px" }}>
        {product.category.toUpperCase()}
      </div>
      <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"16px", color:"#1a1208", marginBottom:"6px" }}>
        {product.name}
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
        <span style={{ fontFamily:"'Playfair Display',serif", fontSize:"15px", color:"#1a1208" }}>
          ₹{product.price.toLocaleString("en-IN")}
        </span>
        {product.original && (
          <span style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"13px", color:"#b0a08a", textDecoration:"line-through" }}>
            ₹{product.original.toLocaleString("en-IN")}
          </span>
        )}
      </div>
    </div>
  );
}

export default function ShopPage({ onAuth }) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [sortBy, setSortBy] = useState("Featured");
  const [filterOpen, setFilterOpen] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 50000]);

  useEffect(() => {
    window.scrollTo(0, 0);
    const els = document.querySelectorAll(".m-reveal, .m-reveal-left, .m-reveal-right");
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("visible"); obs.unobserve(e.target); } });
    }, { threshold: 0.1 });
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const filtered = PRODUCTS
    .filter(p => {
      if (activeCategory === "All") return true;
      if (activeCategory === "New In") return p.tag === "NEW";
      if (activeCategory === "Sale") return p.tag === "SALE";
      return p.category === activeCategory;
    })
    .filter(p => p.price >= priceRange[0] && p.price <= priceRange[1])
    .sort((a, b) => {
      if (sortBy === "Price: Low to High") return a.price - b.price;
      if (sortBy === "Price: High to Low") return b.price - a.price;
      if (sortBy === "Newest First") return (b.tag === "NEW" ? 1 : 0) - (a.tag === "NEW" ? 1 : 0);
      return 0;
    });

  return (
    <>
      <div style={{ paddingTop:"64px", background:"#f5f0eb", minHeight:"100vh" }}>
        {/* Page Header */}
        <div style={{ background:"linear-gradient(135deg,#1a1208 0%,#2a1e0a 50%,#1a1208 100%)", padding:"72px 48px 60px", textAlign:"center", position:"relative", overflow:"hidden" }}>
          <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse 60% 80% at 50% 50%,rgba(201,168,76,0.08),transparent)", pointerEvents:"none" }}/>
          <div style={{ width:"48px", height:"1px", margin:"0 auto 24px", background:"linear-gradient(90deg,transparent,#c9a84c,transparent)" }}/>
          <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(42px,6vw,72px)", fontWeight:400, color:"#fff", margin:"0 0 14px", lineHeight:1 }}>
            The Collection
          </h1>
          <p style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"10px", letterSpacing:"0.3em", color:"rgba(255,255,255,0.4)" }}>
            SPRING / SUMMER 2026
          </p>
        </div>

        {/* Filter & Sort Bar */}
        <div style={{ background:"#fff", borderBottom:"1px solid rgba(201,168,76,0.15)", padding:"0 48px", position:"sticky", top:"64px", zIndex:100, display:"flex", alignItems:"center", justifyContent:"space-between", gap:"24px" }}>
          <div style={{ display:"flex", gap:"0", overflowX:"auto" }}>
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setActiveCategory(cat)} style={{ padding:"18px 22px", background:"none", border:"none", cursor:"pointer", fontSize:"10px", letterSpacing:"0.18em", color: activeCategory === cat ? C.gold : "#6b5c44", borderBottom: activeCategory === cat ? `2px solid ${C.gold}` : "2px solid transparent", fontFamily:"'Cormorant Garamond',Georgia,serif", transition:"all 0.2s", whiteSpace:"nowrap" }}>
                {cat.toUpperCase()}
              </button>
            ))}
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:"16px", flexShrink:0 }}>
            <span style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"12px", color:"#6b5c44" }}>{filtered.length} pieces</span>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ padding:"8px 16px", border:"1px solid rgba(201,168,76,0.3)", background:"#fff", fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"11px", color:"#3a2e1e", cursor:"pointer", outline:"none" }}>
              {SORT_OPTIONS.map(o => <option key={o}>{o}</option>)}
            </select>
            <button onClick={() => setFilterOpen(f => !f)} style={{ display:"flex", alignItems:"center", gap:"8px", padding:"8px 16px", border:`1px solid ${filterOpen ? C.gold : "rgba(201,168,76,0.3)"}`, background: filterOpen ? "rgba(201,168,76,0.06)" : "transparent", color: filterOpen ? C.gold : "#6b5c44", cursor:"pointer", fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"11px", letterSpacing:"0.1em", transition:"all 0.2s" }}>
              <FilterIcon/> FILTER
            </button>
          </div>
        </div>

        {/* Filter Drawer */}
        {filterOpen && (
          <div style={{ background:"#fff", borderBottom:"1px solid rgba(201,168,76,0.15)", padding:"28px 48px", display:"flex", alignItems:"center", gap:"48px" }}>
            <div>
              <div style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"9.5px", letterSpacing:"0.2em", color:"#3a2e1e", marginBottom:"14px" }}>PRICE RANGE</div>
              <div style={{ display:"flex", alignItems:"center", gap:"14px" }}>
                <span style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"13px", color:"#6b5c44" }}>₹0</span>
                <input type="range" min={0} max={50000} step={500} value={priceRange[1]} onChange={e => setPriceRange([priceRange[0], +e.target.value])} style={{ width:"160px", accentColor:C.gold }}/>
                <span style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"13px", color:"#6b5c44" }}>₹{priceRange[1].toLocaleString("en-IN")}</span>
              </div>
            </div>
          </div>
        )}

        {/* Product Grid */}
        <div style={{ padding:"56px 48px", maxWidth:"1400px", margin:"0 auto" }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign:"center", padding:"80px 0" }}>
              <p style={{ fontFamily:"'Playfair Display',serif", fontSize:"22px", color:"#6b5c44" }}>No pieces found</p>
              <p style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"14px", color:"#b0a08a", marginTop:"8px" }}>Try adjusting your filters</p>
            </div>
          ) : (
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))", gap:"32px 24px" }}>
              {filtered.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
