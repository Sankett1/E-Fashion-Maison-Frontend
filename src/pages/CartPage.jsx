import { C } from "../components/shared";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const TrashIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
  </svg>
);

function CartItem({ item, onQtyChange, onRemove }) {
  return (
    <div className="r-grid-cart-item" style={{
      gap:"24px", alignItems:"start", padding:"28px 0",
      borderBottom:"1px solid rgba(201,168,76,0.12)",
      animation:"fadeUp 0.5s ease both",
    }}>
      {/* Image */}
      <div style={{ aspectRatio:"3/4", background:item.grad, position:"relative", overflow:"hidden" }}>
        {item.image && <img src={item.image} alt={item.name} style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover" }} />}
      </div>
      {/* Info */}
      <div>
        <div style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"9.5px", letterSpacing:"0.18em", color:"#6b5c44", marginBottom:"6px" }}>
          {(item.category || "").toUpperCase()}
        </div>
        <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:"20px", fontWeight:400, color:"#1a1208", margin:"0 0 6px" }}>
          {item.name}
        </h3>
        <p style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"12px", color:"#b0a08a", marginBottom:"20px" }}>
          Size: {item.size}
        </p>
        {/* Qty controls */}
        <div style={{ display:"flex", alignItems:"center", gap:"14px" }}>
          <div style={{ display:"flex", border:"1px solid rgba(201,168,76,0.25)", overflow:"hidden" }}>
            <button onClick={() => onQtyChange(item.id, item.size, item.qty - 1)} style={{ width:"36px", height:"36px", background:"none", border:"none", cursor:"pointer", color:"#6b5c44", fontSize:"16px" }}>−</button>
            <span style={{ width:"36px", height:"36px", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Playfair Display',serif", fontSize:"14px", color:"#1a1208", borderLeft:"1px solid rgba(201,168,76,0.2)", borderRight:"1px solid rgba(201,168,76,0.2)" }}>{item.qty}</span>
            <button onClick={() => onQtyChange(item.id, item.size, item.qty + 1)} style={{ width:"36px", height:"36px", background:"none", border:"none", cursor:"pointer", color:"#6b5c44", fontSize:"16px" }}>+</button>
          </div>
          <button onClick={() => onRemove(item.id, item.size)} style={{ display:"flex", alignItems:"center", gap:"6px", background:"none", border:"none", cursor:"pointer", color:"#b0a08a", fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"11px", letterSpacing:"0.1em", transition:"color 0.2s" }}
            onMouseEnter={e => e.currentTarget.style.color="#e07070"}
            onMouseLeave={e => e.currentTarget.style.color="#b0a08a"}
          >
            <TrashIcon/> REMOVE
          </button>
        </div>
      </div>
      {/* Price */}
      <div style={{ textAlign:"right", paddingTop:"8px" }}>
        <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"18px", color:"#1a1208" }}>
          ₹{(item.price * item.qty).toLocaleString("en-IN")}
        </div>
        {item.qty > 1 && (
          <div style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"11px", color:"#b0a08a", marginTop:"3px" }}>
            ₹{item.price.toLocaleString("en-IN")} each
          </div>
        )}
      </div>
    </div>
  );
}

export default function CartPage({ onAuth }) {
  const { cart, updateQty, removeFromCart, cartTotal } = useCart();
  const navigate = useNavigate();
  const [coupon, setCoupon] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);

  const subtotal = cartTotal;
  const discount = couponApplied ? Math.round(subtotal * 0.1) : 0;
  const shipping = subtotal >= 2000 ? 0 : 199;
  const total = subtotal - discount + shipping;

  const applyCoupon = () => {
    if (coupon.trim().toUpperCase() === "MAISON10") setCouponApplied(true);
  };

  if (cart.length === 0) return (
    <>
      <div className="r-section" style={{ paddingTop:"64px", background:"#f5f0eb", minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center" }}>
        <div style={{ textAlign:"center" }}>
          <div style={{ width:"80px", height:"80px", margin:"0 auto 28px", border:`1px solid rgba(201,168,76,0.3)`, display:"flex", alignItems:"center", justifyContent:"center" }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={C.gold} strokeWidth="1.5" strokeLinecap="round">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
          </div>
          <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"32px", fontWeight:400, color:"#1a1208", marginBottom:"12px" }}>Your bag is empty</h2>
          <p style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"15px", color:"#6b5c44", marginBottom:"32px" }}>Discover our curated collection</p>
          <button className="m-btn-gold" onClick={() => navigate("/shop")}>EXPLORE COLLECTION</button>
        </div>
      </div>
    </>
  );

  return (
    <>
      <div style={{ paddingTop:"64px", background:"#f5f0eb", minHeight:"100vh" }}>
        <div className="r-section r-section-v" style={{ maxWidth:"1200px", margin:"0 auto" }}>
          <div style={{ display:"flex", alignItems:"baseline", gap:"16px", marginBottom:"48px" }}>
            <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:"42px", fontWeight:400, color:"#1a1208" }}>Your Bag</h1>
            <span style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"14px", color:"#6b5c44" }}>{cart.length} {cart.length === 1 ? "item" : "items"}</span>
          </div>

          <div className="r-grid-cart" style={{ gap:"56px", alignItems:"start" }}>
            {/* Cart Items */}
            <div>
              {cart.map(item => (
                <CartItem key={`${item.id}-${item.size}`} item={item} onQtyChange={updateQty} onRemove={removeFromCart} />
              ))}
            </div>

            {/* Order Summary */}
            <div style={{ background:"#fff", padding:"36px", border:"1px solid rgba(201,168,76,0.15)", position:"sticky", top:"90px" }}>
              <div style={{ width:"40px", height:"1px", background:"linear-gradient(90deg,transparent,#c9a84c,transparent)", marginBottom:"24px" }}/>
              <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"24px", fontWeight:400, color:"#1a1208", marginBottom:"28px" }}>
                Order Summary
              </h2>

              <div style={{ display:"flex", flexDirection:"column", gap:"14px", marginBottom:"24px" }}>
                {[
                  { label:"Subtotal", val:`₹${subtotal.toLocaleString("en-IN")}` },
                  couponApplied && { label:"Discount (MAISON10)", val:`−₹${discount.toLocaleString("en-IN")}`, color:"#7ab87a" },
                  { label:"Shipping", val: shipping === 0 ? "FREE" : `₹${shipping}`, color: shipping===0 ? "#7ab87a" : null },
                ].filter(Boolean).map(row => (
                  <div key={row.label} style={{ display:"flex", justifyContent:"space-between" }}>
                    <span style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"14px", color:"#6b5c44" }}>{row.label}</span>
                    <span style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"14px", color: row.color || "#3a2e1e" }}>{row.val}</span>
                  </div>
                ))}
              </div>

              {/* Coupon */}
              {!couponApplied ? (
                <div style={{ display:"flex", gap:"8px", marginBottom:"24px" }}>
                  <input
                    value={coupon}
                    onChange={e => setCoupon(e.target.value)}
                    onKeyDown={e => e.key==="Enter" && applyCoupon()}
                    placeholder="Coupon code"
                    style={{
                      flex:1, padding:"10px 14px", border:"1px solid rgba(201,168,76,0.25)",
                      background:"transparent", fontFamily:"'Cormorant Garamond',Georgia,serif",
                      fontSize:"12px", color:"#3a2e1e", outline:"none",
                    }}
                  />
                  <button onClick={applyCoupon} style={{
                    padding:"10px 18px", background:"transparent", border:`1px solid ${C.gold}`,
                    color:C.gold, fontFamily:"'Cormorant Garamond',Georgia,serif",
                    fontSize:"10px", letterSpacing:"0.1em", cursor:"pointer",
                    transition:"all 0.2s",
                  }}
                    onMouseEnter={e => { e.currentTarget.style.background=C.gold; e.currentTarget.style.color="#0f0c08"; }}
                    onMouseLeave={e => { e.currentTarget.style.background="transparent"; e.currentTarget.style.color=C.gold; }}
                  >APPLY</button>
                </div>
              ) : (
                <div style={{ padding:"10px 14px", background:"rgba(122,184,122,0.08)", border:"1px solid rgba(122,184,122,0.2)", fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"12px", color:"#7ab87a", marginBottom:"24px" }}>
                  ✓ Coupon MAISON10 applied — 10% off
                </div>
              )}

              <div style={{ height:"1px", background:"linear-gradient(90deg,transparent,rgba(201,168,76,0.2),transparent)", margin:"0 0 20px" }}/>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"28px" }}>
                <span style={{ fontFamily:"'Playfair Display',serif", fontSize:"18px", color:"#1a1208" }}>Total</span>
                <span style={{ fontFamily:"'Playfair Display',serif", fontSize:"22px", color:"#1a1208" }}>₹{total.toLocaleString("en-IN")}</span>
              </div>

              <button className="m-btn-gold" style={{ width:"100%", padding:"16px" }} onClick={() => navigate("/checkout")}>
                PROCEED TO CHECKOUT
              </button>
              <div style={{ textAlign:"center", marginTop:"14px" }}>
                <button onClick={() => navigate("/shop")} style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"12px", color:C.gold, background:"none", border:"none", cursor:"pointer", textDecoration:"underline", textUnderlineOffset:"3px" }}>
                  Continue Shopping
                </button>
              </div>

              {/* Trust badges */}
              <div style={{ marginTop:"24px", paddingTop:"20px", borderTop:"1px solid rgba(201,168,76,0.1)", display:"flex", justifyContent:"center", gap:"20px" }}>
                {["🔒 Secure", "🔄 Easy Returns", "🚚 Free Shipping"].map(t => (
                  <span key={t} style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"10.5px", color:"#b0a08a" }}>{t}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
