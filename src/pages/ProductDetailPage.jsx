import { useState } from "react";
import { C } from "../components/shared";
import { useCart } from "../context/CartContext";

const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
const REVIEWS = [
  { name:"Priya M.", rating:5, text:"Absolutely stunning quality. The fit is perfect and the fabric feels incredibly luxurious.", date:"March 2026" },
  { name:"Arjun K.", rating:5, text:"Best purchase I've made this year. Worth every rupee.", date:"February 2026" },
  { name:"Kavya R.", rating:4, text:"Beautiful piece, very well crafted. Slight delay in shipping but the product exceeded expectations.", date:"January 2026" },
];

const StarIcon = ({ filled }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill={filled ? C.gold : "none"} stroke={C.gold} strokeWidth="1.5">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);

const ChevronIcon = ({ dir }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    {dir === "right" ? <path d="M9 18l6-6-6-6"/> : <path d="M15 18l-6-6 6-6"/>}
  </svg>
);

const PRODUCT_IMAGES = [
  "https://images.unsplash.com/photo-1485968579580-ee2a6b1e450f?w=800&q=80&fit=crop",
  "https://images.unsplash.com/photo-1485968579580-ee2a6b1e450f?w=800&q=80&fit=crop&sat=-100",
  "https://images.unsplash.com/photo-1485968579580-ee2a6b1e450f?w=800&q=80&fit=crop&blur=1",
];
const IMAGES_GRADS = [
  "linear-gradient(160deg,#c8b080 0%,#a89060 50%,#806840 100%)",
  "linear-gradient(160deg,#e8e0d0 0%,#d8c8b8 50%,#c0b098 100%)",
  "linear-gradient(160deg,#8a6228 0%,#7a5218 50%,#6a4208 100%)",
];

export default function ProductDetailPage({ onAuth }) {
  const [selectedSize, setSelectedSize] = useState(null);
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [activeTab, setActiveTab] = useState("description");
  const [wishlist, setWishlist] = useState(false);
  const [cartMsg, setCartMsg] = useState(null);
  const [openAccordion, setOpenAccordion] = useState(null);

  const { addToCart: addCartItem } = useCart();

  const handleAddToCart = () => {
    if (!selectedSize) { setCartMsg({ type:"err", text:"Please select a size" }); return; }
    addCartItem({ _id: "silk-satin-blouse", name: "Silk Satin Blouse", price: 8200, category: "Women", images: [{ url: PRODUCT_IMAGES[0] }] }, selectedSize, qty);
    setCartMsg({ type:"ok", text:"✓  Added to your cart" });
    setTimeout(() => setCartMsg(null), 2500);
  };

  const ACCORDIONS = [
    { id:"details", title:"Product Details", content:"Crafted from 100% pure Mysore silk sourced from GOTS-certified farms. Tailored at our Mumbai atelier with French seam finishing. Dry clean recommended. Made in India." },
    { id:"sizing", title:"Size & Fit", content:"True to size. Model is 5'8\" wearing size S. Relaxed through the torso with a slightly cropped length. See our size guide for detailed measurements." },
    { id:"shipping", title:"Shipping & Returns", content:"Free shipping on orders above ₹2,000. Standard delivery in 3-5 business days. Express delivery available. Easy 30-day return policy — no questions asked." },
  ];

  return (
    <>
      <div style={{ paddingTop:"64px", background:"#f5f0eb", minHeight:"100vh" }}>
        {/* Breadcrumb */}
        <div style={{ padding:"18px 48px", background:"#fff", borderBottom:"1px solid rgba(201,168,76,0.1)" }}>
          <span style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"11px", color:"#b0a08a", letterSpacing:"0.1em" }}>
            HOME &nbsp;/&nbsp; WOMEN &nbsp;/&nbsp; <span style={{ color:C.gold }}>SILK SATIN BLOUSE</span>
          </span>
        </div>

        <div style={{ maxWidth:"1300px", margin:"0 auto", padding:"60px 48px", display:"grid", gridTemplateColumns:"1fr 1fr", gap:"72px", alignItems:"start" }}>
          {/* LEFT – Images */}
          <div>
            {/* Main image */}
            <div style={{ position:"relative", overflow:"hidden", aspectRatio:"3/4", background:IMAGES_GRADS[activeImg], marginBottom:"16px" }}>
              <img src={PRODUCT_IMAGES[activeImg]} alt="Silk Satin Blouse" style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover" }} />
              <button onClick={() => setActiveImg(i => (i - 1 + IMAGES_GRADS.length) % IMAGES_GRADS.length)}
                style={{ position:"absolute", left:"14px", top:"50%", transform:"translateY(-50%)", width:"40px", height:"40px", background:"rgba(255,255,255,0.9)", border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:"#1a1208" }}>
                <ChevronIcon dir="left"/>
              </button>
              <button onClick={() => setActiveImg(i => (i + 1) % IMAGES_GRADS.length)}
                style={{ position:"absolute", right:"14px", top:"50%", transform:"translateY(-50%)", width:"40px", height:"40px", background:"rgba(255,255,255,0.9)", border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:"#1a1208" }}>
                <ChevronIcon dir="right"/>
              </button>
              <div style={{ position:"absolute", bottom:"14px", left:"50%", transform:"translateX(-50%)", display:"flex", gap:"6px" }}>
                {IMAGES_GRADS.map((_, i) => (
                  <div key={i} onClick={() => setActiveImg(i)} style={{ width: activeImg===i ? "20px" : "6px", height:"6px", borderRadius:"3px", background: activeImg===i ? C.gold : "rgba(255,255,255,0.5)", cursor:"pointer", transition:"all 0.3s" }}/>
                ))}
              </div>
            </div>
            {/* Thumbnails */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"12px" }}>
              {PRODUCT_IMAGES.map((src, i) => (
                <div key={i} onClick={() => setActiveImg(i)} style={{
                  aspectRatio:"1/1", background:IMAGES_GRADS[i], cursor:"pointer", position:"relative", overflow:"hidden",
                  border: activeImg===i ? `2px solid ${C.gold}` : "2px solid transparent",
                  transition:"border-color 0.2s",
                }}>
                  <img src={src} alt="" style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover" }} />
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT – Details */}
          <div>
            <div style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"9.5px", letterSpacing:"0.22em", color:C.gold, marginBottom:"10px" }}>
              WOMEN · TOPS & BLOUSES
            </div>
            <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(28px,3vw,38px)", fontWeight:400, color:"#1a1208", margin:"0 0 8px", lineHeight:1.2 }}>
              Silk Satin Blouse
            </h1>
            <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"20px" }}>
              <div style={{ display:"flex", gap:"2px" }}>
                {[1,2,3,4,5].map(i => <StarIcon key={i} filled={i<=4}/>)}
              </div>
              <span style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"12px", color:"#6b5c44" }}>4.0 (32 reviews)</span>
            </div>
            <div style={{ display:"flex", alignItems:"baseline", gap:"14px", marginBottom:"32px" }}>
              <span style={{ fontFamily:"'Playfair Display',serif", fontSize:"28px", color:"#1a1208" }}>₹8,200</span>
              <span style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"14px", color:"#b0a08a", textDecoration:"line-through" }}>₹11,000</span>
              <span style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"11px", color:"#7ab87a", letterSpacing:"0.1em" }}>25% OFF</span>
            </div>

            {/* Divider */}
            <div style={{ height:"1px", background:"linear-gradient(90deg,transparent,rgba(201,168,76,0.3),transparent)", marginBottom:"28px" }}/>

            {/* Size selector */}
            <div style={{ marginBottom:"28px" }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"14px" }}>
                <span style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"10px", letterSpacing:"0.2em", color:"#3a2e1e" }}>SELECT SIZE</span>
                <button style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"11px", color:C.gold, background:"none", border:"none", cursor:"pointer", textDecoration:"underline", textUnderlineOffset:"3px" }}>Size Guide</button>
              </div>
              <div style={{ display:"flex", gap:"8px", flexWrap:"wrap" }}>
                {SIZES.map(s => (
                  <button key={s} onClick={() => setSelectedSize(s)} style={{
                    width:"48px", height:"48px", border: selectedSize===s ? `2px solid ${C.gold}` : "1px solid rgba(201,168,76,0.3)",
                    background: selectedSize===s ? "rgba(201,168,76,0.08)" : "transparent",
                    color: selectedSize===s ? C.gold : "#6b5c44",
                    fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"12px",
                    cursor:"pointer", transition:"all 0.2s",
                  }}>{s}</button>
                ))}
              </div>
            </div>

            {/* Quantity + Cart */}
            <div style={{ display:"flex", gap:"12px", marginBottom:"16px" }}>
              <div style={{ display:"flex", border:"1px solid rgba(201,168,76,0.3)", overflow:"hidden" }}>
                <button onClick={() => setQty(q => Math.max(1, q-1))} style={{ width:"44px", height:"54px", background:"none", border:"none", cursor:"pointer", color:"#6b5c44", fontSize:"18px" }}>−</button>
                <span style={{ width:"44px", height:"54px", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Playfair Display',serif", fontSize:"16px", color:"#1a1208", borderLeft:"1px solid rgba(201,168,76,0.2)", borderRight:"1px solid rgba(201,168,76,0.2)" }}>{qty}</span>
                <button onClick={() => setQty(q => q+1)} style={{ width:"44px", height:"54px", background:"none", border:"none", cursor:"pointer", color:"#6b5c44", fontSize:"18px" }}>+</button>
              </div>
              <button onClick={handleAddToCart} style={{
                flex:1, padding:"0 24px", height:"54px",
                background:"linear-gradient(90deg,#c9a84c,#e0b85a,#c9a84c)", backgroundSize:"200% 100%",
                border:"none", color:"#0f0c08", fontSize:"10px", letterSpacing:"0.22em",
                fontFamily:"'Cormorant Garamond',Georgia,serif", cursor:"pointer",
                transition:"all 0.3s",
              }}
                onMouseEnter={e => { e.currentTarget.style.backgroundPosition="100% 0"; e.currentTarget.style.transform="translateY(-1px)"; e.currentTarget.style.boxShadow="0 8px 28px rgba(201,168,76,0.35)"; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundPosition="0 0"; e.currentTarget.style.transform="none"; e.currentTarget.style.boxShadow="none"; }}
              >ADD TO CART</button>
              <button onClick={() => setWishlist(w => !w)} style={{
                width:"54px", height:"54px", border:`1px solid ${wishlist ? "#e07070" : "rgba(201,168,76,0.3)"}`,
                background: wishlist ? "rgba(220,100,100,0.06)" : "transparent",
                cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center",
                color: wishlist ? "#e07070" : "#6b5c44", transition:"all 0.2s",
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill={wishlist ? "#e07070" : "none"} stroke="currentColor" strokeWidth="1.8">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
              </button>
            </div>

            {/* Cart message */}
            {cartMsg && (
              <div style={{ padding:"12px 16px", background: cartMsg.type==="ok" ? "rgba(122,184,122,0.1)" : "rgba(220,100,100,0.1)", border:`1px solid ${cartMsg.type==="ok" ? "rgba(122,184,122,0.3)" : "rgba(220,100,100,0.3)"}`, fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"13px", color: cartMsg.type==="ok" ? "#7ab87a" : "#e07070", marginBottom:"16px" }}>
                {cartMsg.text}
              </div>
            )}

            {/* Accordions */}
            <div style={{ marginTop:"20px" }}>
              {ACCORDIONS.map(acc => (
                <div key={acc.id} style={{ borderTop:"1px solid rgba(201,168,76,0.15)" }}>
                  <button
                    onClick={() => setOpenAccordion(a => a===acc.id ? null : acc.id)}
                    style={{
                      width:"100%", display:"flex", justifyContent:"space-between", alignItems:"center",
                      padding:"18px 0", background:"none", border:"none", cursor:"pointer",
                      fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"11px", letterSpacing:"0.16em",
                      color:"#3a2e1e",
                    }}
                  >
                    {acc.title.toUpperCase()}
                    <span style={{ color:C.gold, transform: openAccordion===acc.id ? "rotate(45deg)" : "none", transition:"transform 0.3s", fontSize:"20px" }}>+</span>
                  </button>
                  <div style={{
                    maxHeight: openAccordion===acc.id ? "200px" : "0", overflow:"hidden",
                    transition:"max-height 0.4s cubic-bezier(0.4,0,0.2,1)",
                  }}>
                    <p style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"13.5px", color:"#6b5c44", lineHeight:1.7, paddingBottom:"18px", fontWeight:300 }}>
                      {acc.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div style={{ maxWidth:"1300px", margin:"0 auto", padding:"0 48px 80px" }}>
          <div style={{ height:"1px", background:"linear-gradient(90deg,transparent,rgba(201,168,76,0.2),transparent)", marginBottom:"56px" }}/>
          <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"32px", fontWeight:400, color:"#1a1208", marginBottom:"36px" }}>
            Customer Reviews
          </h2>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"24px" }}>
            {REVIEWS.map((r, i) => (
              <div key={i} style={{ background:"#fff", padding:"28px", border:"1px solid rgba(201,168,76,0.12)" }}>
                <div style={{ display:"flex", gap:"3px", marginBottom:"14px" }}>
                  {[1,2,3,4,5].map(s => <StarIcon key={s} filled={s<=r.rating}/>)}
                </div>
                <p style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"14px", lineHeight:1.7, color:"#3a2e1e", fontStyle:"italic", marginBottom:"16px" }}>"{r.text}"</p>
                <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"14px", color:"#1a1208" }}>{r.name}</div>
                <div style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"11px", color:"#b0a08a", marginTop:"3px" }}>{r.date}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
