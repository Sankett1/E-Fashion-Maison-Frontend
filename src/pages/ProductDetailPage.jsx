import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { C } from "../components/shared";
import { useCart } from "../context/CartContext";
import { getProductById } from "../api/productApi";

const StarIcon = ({ filled }) => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill={filled ? C.gold : "none"} stroke={C.gold} strokeWidth="1.5">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);
const ChevronIcon = ({ dir }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    {dir === "right" ? <path d="M9 18l6-6-6-6"/> : <path d="M15 18l-6-6 6-6"/>}
  </svg>
);
const Spinner = () => (
  <div style={{ minHeight:"60vh", display:"flex", alignItems:"center", justifyContent:"center" }}>
    <div style={{ width:36, height:36, border:`2px solid ${C.gold}`, borderTopColor:"transparent", borderRadius:"50%", animation:"pdSpin 0.8s linear infinite" }}/>
    <style>{`@keyframes pdSpin{to{transform:rotate(360deg)}}`}</style>
  </div>
);

// Gradient fallback when no image
const GRADS = [
  "linear-gradient(160deg,#c8b080 0%,#a89060 50%,#806840 100%)",
  "linear-gradient(160deg,#e8e0d0 0%,#d8c8b8 50%,#c0b098 100%)",
  "linear-gradient(160deg,#8a6228 0%,#7a5218 50%,#6a4208 100%)",
];

export default function ProductDetailPage({ onAuth }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const [selectedSize, setSelectedSize]   = useState(null);
  const [qty, setQty]                     = useState(1);
  const [activeImg, setActiveImg]         = useState(0);
  const [wishlist, setWishlist]           = useState(false);
  const [cartMsg, setCartMsg]             = useState(null);
  const [openAccordion, setOpenAccordion] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);
    setError(null);
    setActiveImg(0);
    setSelectedSize(null);

    getProductById(id)
      .then(data => setProduct(data.product))
      .catch(err => {
        console.error("[ProductDetail] Failed to load product:", err.message);
        setError("Product not found or unavailable.");
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = () => {
    if (!selectedSize) {
      setCartMsg({ type:"err", text:"Please select a size" });
      return;
    }
    addToCart({
      _id:      product._id,
      name:     product.name,
      price:    product.price,
      category: product.category,
      images:   product.images,
    }, selectedSize, qty);
    setCartMsg({ type:"ok", text:"✓  Added to your cart" });
    setTimeout(() => setCartMsg(null), 2500);
  };

  if (loading) return (
    <div style={{ paddingTop:"64px", background:"#f5f0eb", minHeight:"100vh" }}><Spinner/></div>
  );

  if (error || !product) return (
    <div style={{ paddingTop:"64px", background:"#f5f0eb", minHeight:"100vh",
      display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:16 }}>
      <div style={{ fontFamily:"'Playfair Display',serif", fontSize:24, color:"#6b5c44" }}>
        {error || "Product not found"}
      </div>
      <button onClick={() => navigate("/shop")} className="m-btn-gold">BROWSE COLLECTION</button>
    </div>
  );

  const images  = product.images?.length ? product.images : [];
  const imgUrls = images.map(img => img.url);
  const sizes   = product.sizes?.length ? product.sizes : ["XS","S","M","L","XL","XXL"];
  const rating  = product.ratings || 0;
  const reviews = product.reviews || [];
  const hasOrig = product.originalPrice && product.originalPrice > product.price;
  const discount= hasOrig ? Math.round((1 - product.price / product.originalPrice) * 100) : 0;

  const ACCORDIONS = [
    { id:"details",  title:"Product Details",    content: product.fabric
        ? `Fabric: ${product.fabric}. ${product.careInstructions || ""}` 
        : product.description || "Premium quality piece crafted at our Mumbai atelier." },
    { id:"sizing",   title:"Size & Fit",         content:"True to size. See our size guide for detailed measurements. Model is 5\'8\" wearing size S." },
    { id:"shipping", title:"Shipping & Returns", content:"Free shipping on orders above ₹2,000. Standard delivery in 3–5 business days. Easy 30-day return policy." },
  ];

  return (
    <div style={{ paddingTop:"64px", background:"#f5f0eb", minHeight:"100vh" }}>

      {/* Breadcrumb */}
      <div className="r-section" style={{ background:"#fff", borderBottom:"1px solid rgba(201,168,76,0.1)", paddingTop:"16px", paddingBottom:"16px" }}>
        <span style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"11px",
          color:"#b0a08a", letterSpacing:"0.1em", cursor:"pointer" }}
          onClick={() => navigate("/")}>HOME</span>
        <span style={{ color:"#b0a08a", margin:"0 8px" }}>/</span>
        <span style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"11px",
          color:"#b0a08a", letterSpacing:"0.1em", cursor:"pointer" }}
          onClick={() => navigate(`/shop?category=${product.category}`)}>
          {product.category?.toUpperCase()}
        </span>
        <span style={{ color:"#b0a08a", margin:"0 8px" }}>/</span>
        <span style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"11px",
          color:C.gold, letterSpacing:"0.1em" }}>
          {product.name?.toUpperCase()}
        </span>
      </div>

      <div className="r-section r-section-v r-grid-2" style={{ maxWidth:1300, margin:"0 auto", gap:"72px", alignItems:"start" }}>

        {/* LEFT — Images */}
        <div>
          {/* Main image */}
          <div style={{ position:"relative", overflow:"hidden", aspectRatio:"3/4",
            background:GRADS[activeImg % GRADS.length], marginBottom:14 }}>
            {imgUrls[activeImg] ? (
              <img src={imgUrls[activeImg]} alt={product.name}
                style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover" }}/>
            ) : (
              <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center",
                justifyContent:"center", fontFamily:"'Playfair Display',serif", fontSize:18,
                color:"rgba(255,255,255,0.3)", letterSpacing:"0.2em" }}>
                MAISON
              </div>
            )}
            {/* Tag */}
            {product.tag && (
              <div style={{ position:"absolute", top:14, left:14,
                background: product.tag==="SALE" ? "#e07070" : C.gold,
                color:"#0f0c08", fontSize:"8px", letterSpacing:"0.18em", fontWeight:600, padding:"4px 10px" }}>
                {product.tag}
              </div>
            )}
            {/* Arrows (only if multiple images) */}
            {imgUrls.length > 1 && (
              <>
                <button onClick={() => setActiveImg(i => (i - 1 + imgUrls.length) % imgUrls.length)}
                  style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)",
                    width:38, height:38, background:"rgba(255,255,255,0.9)", border:"none",
                    cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:"#1a1208" }}>
                  <ChevronIcon dir="left"/>
                </button>
                <button onClick={() => setActiveImg(i => (i + 1) % imgUrls.length)}
                  style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)",
                    width:38, height:38, background:"rgba(255,255,255,0.9)", border:"none",
                    cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:"#1a1208" }}>
                  <ChevronIcon dir="right"/>
                </button>
              </>
            )}
            {/* Dots */}
            {imgUrls.length > 1 && (
              <div style={{ position:"absolute", bottom:14, left:"50%", transform:"translateX(-50%)",
                display:"flex", gap:6 }}>
                {imgUrls.map((_, i) => (
                  <div key={i} onClick={() => setActiveImg(i)}
                    style={{ width:activeImg===i?20:6, height:6, borderRadius:3,
                      background:activeImg===i?C.gold:"rgba(255,255,255,0.5)",
                      cursor:"pointer", transition:"all 0.3s" }}/>
                ))}
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {imgUrls.length > 1 && (
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10 }}>
              {imgUrls.map((src, i) => (
                <div key={i} onClick={() => setActiveImg(i)}
                  style={{ aspectRatio:"1/1", background:GRADS[i % GRADS.length],
                    cursor:"pointer", position:"relative", overflow:"hidden",
                    border: activeImg===i ? `2px solid ${C.gold}` : "2px solid transparent",
                    transition:"border-color 0.2s" }}>
                  <img src={src} alt="" style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover" }}/>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT — Details */}
        <div>
          <div style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"9.5px",
            letterSpacing:"0.22em", color:C.gold, marginBottom:10 }}>
            {product.category?.toUpperCase()}
            {product.subCategory ? ` · ${product.subCategory.toUpperCase()}` : ""}
          </div>

          <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(26px,3vw,36px)",
            fontWeight:400, color:"#1a1208", margin:"0 0 8px", lineHeight:1.2 }}>
            {product.name}
          </h1>

          {/* Rating */}
          {reviews.length > 0 && (
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
              <div style={{ display:"flex", gap:2 }}>
                {[1,2,3,4,5].map(i => <StarIcon key={i} filled={i <= Math.round(rating)}/>)}
              </div>
              <span style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"12px", color:"#6b5c44" }}>
                {rating.toFixed(1)} ({reviews.length} review{reviews.length !== 1 ? "s" : ""})
              </span>
            </div>
          )}

          {/* Price */}
          <div style={{ display:"flex", alignItems:"baseline", gap:14, marginBottom:28 }}>
            <span style={{ fontFamily:"'Playfair Display',serif", fontSize:"26px", color:"#1a1208" }}>
              ₹{Number(product.price).toLocaleString("en-IN")}
            </span>
            {hasOrig && (
              <>
                <span style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"15px",
                  color:"#b0a08a", textDecoration:"line-through" }}>
                  ₹{Number(product.originalPrice).toLocaleString("en-IN")}
                </span>
                <span style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"12px",
                  color:"#7ab87a", letterSpacing:"0.1em" }}>
                  {discount}% OFF
                </span>
              </>
            )}
          </div>

          {/* Description */}
          {product.description && (
            <p style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"14px",
              lineHeight:1.75, color:"#6b5c44", fontWeight:300, marginBottom:24 }}>
              {product.description}
            </p>
          )}

          <div style={{ height:1, background:"linear-gradient(90deg,transparent,rgba(201,168,76,0.3),transparent)", marginBottom:24 }}/>

          {/* Size selector */}
          <div style={{ marginBottom:24 }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:12 }}>
              <span style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"10px",
                letterSpacing:"0.2em", color:"#3a2e1e" }}>SELECT SIZE</span>
              <button onClick={() => navigate("/size-guide")}
                style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"11px",
                  color:C.gold, background:"none", border:"none", cursor:"pointer",
                  textDecoration:"underline", textUnderlineOffset:3 }}>
                Size Guide
              </button>
            </div>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
              {sizes.map(s => (
                <button key={s} onClick={() => setSelectedSize(s)}
                  style={{ minWidth:46, height:46, padding:"0 10px",
                    border: selectedSize===s ? `2px solid ${C.gold}` : "1px solid rgba(201,168,76,0.3)",
                    background: selectedSize===s ? "rgba(201,168,76,0.08)" : "transparent",
                    color: selectedSize===s ? C.gold : "#6b5c44",
                    fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"12px",
                    cursor:"pointer", transition:"all 0.2s" }}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Stock indicator */}
          {product.stock !== undefined && (
            <div style={{ marginBottom:20, fontFamily:"'Cormorant Garamond',Georgia,serif",
              fontSize:"11px", letterSpacing:"0.12em",
              color: product.stock <= 5 ? "#e07070" : "#7ab87a" }}>
              {product.stock === 0 ? "OUT OF STOCK"
                : product.stock <= 5 ? `ONLY ${product.stock} LEFT`
                : "IN STOCK"}
            </div>
          )}

          {/* Qty + Add to cart */}
          <div style={{ display:"flex", gap:12, marginBottom:16 }}>
            <div style={{ display:"flex", border:"1px solid rgba(201,168,76,0.3)", overflow:"hidden" }}>
              <button onClick={() => setQty(q => Math.max(1, q-1))}
                style={{ width:44, height:52, background:"none", border:"none", cursor:"pointer", color:"#6b5c44", fontSize:18 }}>−</button>
              <span style={{ width:44, height:52, display:"flex", alignItems:"center", justifyContent:"center",
                fontFamily:"'Playfair Display',serif", fontSize:16, color:"#1a1208",
                borderLeft:"1px solid rgba(201,168,76,0.2)", borderRight:"1px solid rgba(201,168,76,0.2)" }}>
                {qty}
              </span>
              <button onClick={() => setQty(q => q+1)}
                style={{ width:44, height:52, background:"none", border:"none", cursor:"pointer", color:"#6b5c44", fontSize:18 }}>+</button>
            </div>
            <button onClick={handleAddToCart} disabled={product.stock === 0}
              style={{ flex:1, padding:"0 24px", height:52,
                background: product.stock === 0 ? "rgba(201,168,76,0.2)" : `linear-gradient(90deg,${C.gold},${C.goldLight},${C.gold})`,
                backgroundSize:"200% 100%",
                border:"none", color:"#0f0c08", fontSize:"10px", letterSpacing:"0.22em",
                fontFamily:"'Cormorant Garamond',Georgia,serif",
                cursor: product.stock === 0 ? "not-allowed" : "pointer",
                transition:"all 0.3s" }}
              onMouseEnter={e => { if (product.stock > 0) { e.currentTarget.style.backgroundPosition="100% 0"; e.currentTarget.style.boxShadow=`0 8px 24px rgba(201,168,76,0.35)`; }}}
              onMouseLeave={e => { e.currentTarget.style.backgroundPosition="0 0"; e.currentTarget.style.boxShadow="none"; }}>
              {product.stock === 0 ? "OUT OF STOCK" : "ADD TO CART"}
            </button>
            <button onClick={() => setWishlist(w => !w)}
              style={{ width:52, height:52,
                border:`1px solid ${wishlist ? "#e07070" : "rgba(201,168,76,0.3)"}`,
                background: wishlist ? "rgba(220,100,100,0.06)" : "transparent",
                cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center",
                color: wishlist ? "#e07070" : "#6b5c44", transition:"all 0.2s" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill={wishlist?"#e07070":"none"} stroke="currentColor" strokeWidth="1.8">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </button>
          </div>

          {/* Cart message */}
          {cartMsg && (
            <div style={{ padding:"11px 16px", marginBottom:16,
              background: cartMsg.type==="ok" ? "rgba(122,184,122,0.1)" : "rgba(220,100,100,0.1)",
              border:`1px solid ${cartMsg.type==="ok" ? "rgba(122,184,122,0.3)" : "rgba(220,100,100,0.3)"}`,
              fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:13,
              color: cartMsg.type==="ok" ? "#7ab87a" : "#e07070" }}>
              {cartMsg.text}
            </div>
          )}

          {/* Color swatches */}
          {product.colors?.length > 0 && (
            <div style={{ marginBottom:24 }}>
              <div style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"10px",
                letterSpacing:"0.18em", color:"#3a2e1e", marginBottom:10 }}>AVAILABLE COLOURS</div>
              <div style={{ display:"flex", gap:8 }}>
                {product.colors.map((c, i) => (
                  <div key={i} style={{ width:22, height:22, borderRadius:"50%", background:c,
                    border:"2px solid rgba(255,255,255,0.8)",
                    boxShadow:"0 0 0 1px rgba(201,168,76,0.3)" }}/>
                ))}
              </div>
            </div>
          )}

          {/* Accordions */}
          <div style={{ marginTop:8 }}>
            {ACCORDIONS.map(acc => (
              <div key={acc.id} style={{ borderTop:"1px solid rgba(201,168,76,0.15)" }}>
                <button onClick={() => setOpenAccordion(a => a===acc.id ? null : acc.id)}
                  style={{ width:"100%", display:"flex", justifyContent:"space-between",
                    alignItems:"center", padding:"16px 0", background:"none", border:"none",
                    cursor:"pointer", fontFamily:"'Cormorant Garamond',Georgia,serif",
                    fontSize:"11px", letterSpacing:"0.16em", color:"#3a2e1e" }}>
                  {acc.title.toUpperCase()}
                  <span style={{ color:C.gold, transform:openAccordion===acc.id?"rotate(45deg)":"none",
                    transition:"transform 0.3s", fontSize:20 }}>+</span>
                </button>
                <div style={{ maxHeight:openAccordion===acc.id?"200px":"0", overflow:"hidden",
                  transition:"max-height 0.4s cubic-bezier(0.4,0,0.2,1)" }}>
                  <p style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"13.5px",
                    color:"#6b5c44", lineHeight:1.7, paddingBottom:18, fontWeight:300 }}>
                    {acc.content}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reviews */}
      {reviews.length > 0 && (
        <div className="r-section" style={{ maxWidth:1300, margin:"0 auto", paddingBottom:"80px" }}>
          <div style={{ height:1, background:"linear-gradient(90deg,transparent,rgba(201,168,76,0.2),transparent)", marginBottom:48 }}/>
          <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:30, fontWeight:400, color:"#1a1208", marginBottom:32 }}>
            Customer Reviews
          </h2>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:20 }}>
            {reviews.map((r, i) => (
              <div key={i} style={{ background:"#fff", padding:24, border:"1px solid rgba(201,168,76,0.12)" }}>
                <div style={{ display:"flex", gap:2, marginBottom:12 }}>
                  {[1,2,3,4,5].map(s => <StarIcon key={s} filled={s<=r.rating}/>)}
                </div>
                <p style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:14,
                  lineHeight:1.7, color:"#3a2e1e", fontStyle:"italic", marginBottom:14 }}>
                  "{r.comment}"
                </p>
                <div style={{ fontFamily:"'Playfair Display',serif", fontSize:13, color:"#1a1208" }}>{r.name}</div>
                <div style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:11, color:"#b0a08a", marginTop:3 }}>
                  {new Date(r.createdAt).toLocaleDateString("en-IN", { month:"long", year:"numeric" })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
