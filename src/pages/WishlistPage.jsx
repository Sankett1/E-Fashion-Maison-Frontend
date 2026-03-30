import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { C, GoldBar } from "../components/shared";

const WISHLIST = [
  { id: 1, name: "Shawl Collar Overcoat", category: "Men", price: 34500, image: "https://images.unsplash.com/photo-1520975916090-8105d898b5a1?w=600&q=80&fit=crop", grad: "linear-gradient(160deg,#2a2a2a 0%,#1a1a1a 50%,#0d0d0d 100%)" },
  { id: 2, name: "Cashmere Wrap Cardigan", category: "Women", price: 19500, original: 26000, image: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=600&q=80&fit=crop", grad: "linear-gradient(160deg,#e8e8e8 0%,#c8c8d0 50%,#a8a8b8 100%)" },
  { id: 3, name: "Leather Crossbody Bag", category: "Accessories", price: 16800, image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80&fit=crop", grad: "linear-gradient(160deg,#6b4c36 0%,#4a321e 50%,#2e1e0e 100%)" },
  { id: 4, name: "Pleated Midi Skirt", category: "Women", price: 9800, image: "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=600&q=80&fit=crop", grad: "linear-gradient(160deg,#f0ebe0 0%,#e0d8c8 50%,#c8bca8 100%)" },
];

export default function WishlistPage({ onAuth }) {
  const [items, setItems] = useState(WISHLIST);
  const navigate = useNavigate();
  const remove = (id) => setItems(prev => prev.filter(i => i.id !== id));

  return (
    <>
      <div style={{ paddingTop: "100px", minHeight: "100vh", background: C.bg, padding: "100px 80px 60px" }}>
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <div style={{ fontSize: "9.5px", letterSpacing: "0.28em", color: C.gold, marginBottom: "14px" }}>MY COLLECTION</div>
          <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: "40px", fontWeight: 400, color: "#fff", marginBottom: "16px" }}>Wishlist</h1>
          <GoldBar centered />
          <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)" }}>{items.length} saved {items.length === 1 ? "piece" : "pieces"}</p>
        </div>

        {!items.length ? (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <div style={{ fontSize: "48px", marginBottom: "20px" }}>🤍</div>
            <p style={{ fontFamily: "'Playfair Display',serif", fontSize: "22px", color: "rgba(255,255,255,0.4)" }}>Your wishlist is empty</p>
            <button onClick={() => navigate("/shop")} className="m-btn-gold" style={{ marginTop: "24px" }}>EXPLORE THE COLLECTION</button>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "24px" }}>
            {items.map(item => (
              <div key={item.id} style={{ background: C.surface }}>
                <div style={{ aspectRatio: "3/4", background: item.grad, position: "relative", overflow: "hidden", cursor: "pointer" }} onClick={() => navigate(`/shop/${item.id}`)}>
                  {item.image && <img src={item.image} alt={item.name} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />}
                  <button onClick={e => { e.stopPropagation(); remove(item.id); }} style={{ position: "absolute", top: "12px", right: "12px", width: "32px", height: "32px", background: "rgba(8,5,2,0.7)", border: "1px solid rgba(255,255,255,0.15)", color: "#f09090", cursor: "pointer", fontSize: "14px", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
                </div>
                <div style={{ padding: "16px" }}>
                  <div style={{ fontSize: "9px", letterSpacing: "0.16em", color: "rgba(255,255,255,0.3)", marginBottom: "6px" }}>{item.category.toUpperCase()}</div>
                  <div style={{ fontFamily: "'Playfair Display',serif", fontSize: "16px", color: "#fff", marginBottom: "8px" }}>{item.name}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
                    <span style={{ fontSize: "14px", color: C.gold }}>₹{item.price.toLocaleString()}</span>
                    {item.original && <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)", textDecoration: "line-through" }}>₹{item.original.toLocaleString()}</span>}
                  </div>
                  <button onClick={() => navigate(`/shop/${item.id}`)} className="m-btn-outline-light" style={{ width: "100%", padding: "10px" }}>ADD TO CART</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
