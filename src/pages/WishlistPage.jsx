import { useNavigate } from "react-router-dom";
import { C, GoldBar } from "../components/shared";
import { useAuth } from "../context/AuthContext";
import { toggleWishlist } from "../api/productApi";
import { useCart } from "../context/CartContext";

export default function WishlistPage() {
  const { user, refreshUser, isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const items = user?.wishlist || [];

  const handleRemove = async (productId) => {
    try {
      await toggleWishlist(productId);
      await refreshUser();
    } catch {
      alert("Could not remove item. Please try again.");
    }
  };

  const handleAddToCart = (item) => {
    addToCart(
      { _id: item._id, name: item.name, price: item.price, category: item.category, images: item.images },
      "M",
      1
    );
    navigate("/cart");
  };

  if (!isAuthenticated) return (
    <div style={{ paddingTop:"100px", minHeight:"100vh", background:C.bg, display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ textAlign:"center" }}>
        <div style={{ fontSize:48, marginBottom:20 }}>🔒</div>
        <p style={{ fontFamily:"'Playfair Display',serif", fontSize:22, color:"rgba(255,255,255,0.5)", marginBottom:24 }}>Sign in to view your wishlist</p>
        <button className="m-btn-gold" onClick={() => navigate("/login")}>SIGN IN</button>
      </div>
    </div>
  );

  return (
    <div style={{ paddingTop:"100px", minHeight:"100vh", background:C.bg, padding:"100px 80px 60px" }}>
      <div style={{ textAlign:"center", marginBottom:"48px" }}>
        <div style={{ fontSize:"9.5px", letterSpacing:"0.28em", color:C.gold, marginBottom:"14px" }}>MY COLLECTION</div>
        <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:"40px", fontWeight:400, color:"#fff", marginBottom:"16px" }}>Wishlist</h1>
        <GoldBar centered />
        <p style={{ fontSize:"13px", color:"rgba(255,255,255,0.4)" }}>{items.length} saved {items.length === 1 ? "piece" : "pieces"}</p>
      </div>

      {items.length === 0 ? (
        <div style={{ textAlign:"center", padding:"80px 0" }}>
          <div style={{ fontSize:"48px", marginBottom:"20px" }}>🤍</div>
          <p style={{ fontFamily:"'Playfair Display',serif", fontSize:"22px", color:"rgba(255,255,255,0.4)" }}>Your wishlist is empty</p>
          <button onClick={() => navigate("/shop")} className="m-btn-gold" style={{ marginTop:"24px" }}>EXPLORE THE COLLECTION</button>
        </div>
      ) : (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))", gap:"24px" }}>
          {items.map(item => (
            <div key={item._id} style={{ background:C.surface }}>
              <div style={{ aspectRatio:"3/4", background:"linear-gradient(160deg,#c8b080,#8a6228)", position:"relative", overflow:"hidden", cursor:"pointer" }} onClick={() => navigate(`/shop/${item._id}`)}>
                {item.images?.[0]?.url && (
                  <img src={item.images[0].url} alt={item.name} style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover" }} />
                )}
                <button onClick={e => { e.stopPropagation(); handleRemove(item._id); }}
                  style={{ position:"absolute", top:"12px", right:"12px", width:"32px", height:"32px", background:"rgba(8,5,2,0.7)", border:"1px solid rgba(255,255,255,0.15)", color:"#f09090", cursor:"pointer", fontSize:"14px", display:"flex", alignItems:"center", justifyContent:"center" }}>
                  ✕
                </button>
              </div>
              <div style={{ padding:"16px" }}>
                <div style={{ fontSize:"9px", letterSpacing:"0.16em", color:"rgba(255,255,255,0.3)", marginBottom:"6px" }}>
                  {item.category?.toUpperCase()}
                </div>
                <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"16px", color:"#fff", marginBottom:"8px" }}>{item.name}</div>
                <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"14px" }}>
                  <span style={{ fontSize:"14px", color:C.gold }}>₹{Number(item.price).toLocaleString("en-IN")}</span>
                  {item.originalPrice && (
                    <span style={{ fontSize:"12px", color:"rgba(255,255,255,0.3)", textDecoration:"line-through" }}>
                      ₹{Number(item.originalPrice).toLocaleString("en-IN")}
                    </span>
                  )}
                </div>
                <button onClick={() => handleAddToCart(item)} className="m-btn-outline-light" style={{ width:"100%", padding:"10px" }}>
                  ADD TO CART
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
