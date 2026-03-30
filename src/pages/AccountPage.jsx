import { useState } from "react";
import { C } from "../components/shared";

const TABS = ["Profile", "My Orders", "Wishlist", "Addresses", "Settings"];

const ORDERS = [
  { id:"MSN-2026-8847", date:"March 12, 2026", total:"₹33,100", status:"Delivered", items:2 },
  { id:"MSN-2026-7231", date:"February 24, 2026", total:"₹12,750", status:"Shipped", items:1 },
  { id:"MSN-2026-5501", date:"January 8, 2026", total:"₹22,000", status:"Delivered", items:1 },
];

const WISHLIST = [
  { name:"Shawl Collar Overcoat", price:"₹34,500", image:"https://images.unsplash.com/photo-1520975916090-8105d898b5a1?w=400&q=80&fit=crop", grad:"linear-gradient(160deg,#2a2a2a 0%,#1a1a1a 50%,#0d0d0d 100%)" },
  { name:"Cashmere Wrap Cardigan", price:"₹19,500", image:"https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400&q=80&fit=crop", grad:"linear-gradient(160deg,#e8e8e8 0%,#c8c8d0 50%,#a8a8b8 100%)" },
  { name:"Leather Crossbody Bag", price:"₹16,800", image:"https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&q=80&fit=crop", grad:"linear-gradient(160deg,#6b4c36 0%,#4a321e 50%,#2e1e0e 100%)" },
];

const StatusBadge = ({ status }) => {
  const colors = { Delivered:["#7ab87a","rgba(122,184,122,0.1)"], Shipped:[C.gold,"rgba(201,168,76,0.1)"], Processing:["#d4a04a","rgba(212,160,74,0.1)"] };
  const [color, bg] = colors[status] || ["#b0a08a","rgba(176,160,138,0.1)"];
  return (
    <span style={{ padding:"4px 12px", background:bg, border:`1px solid ${color}30`, borderRadius:"2px", fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"10px", letterSpacing:"0.12em", color }}>{status.toUpperCase()}</span>
  );
};

export default function AccountPage({ onAuth }) {
  const [activeTab, setActiveTab] = useState("Profile");
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState({ name:"Arjun Kapoor", email:"arjun@example.com", phone:"9876543210" });
  const [editData, setEditData] = useState({ ...profile });

  const saveProfile = () => { setProfile({ ...editData }); setEditing(false); };

  return (
    <>
      <div style={{ paddingTop:"64px", background:"#f5f0eb", minHeight:"100vh" }}>
        {/* Header */}
        <div style={{ background:"linear-gradient(135deg,#1a1208 0%,#2a1e0a 50%,#1a1208 100%)", padding:"56px 48px 48px" }}>
          <div style={{ maxWidth:"1200px", margin:"0 auto", display:"flex", alignItems:"center", gap:"28px" }}>
            <div style={{
              width:"80px", height:"80px", borderRadius:"50%",
              background:"linear-gradient(135deg,#c9a84c,#8a6228)",
              display:"flex", alignItems:"center", justifyContent:"center",
              fontFamily:"'Playfair Display',serif", fontSize:"28px", color:"#0f0c08", fontWeight:500,
            }}>
              {profile.name[0]}
            </div>
            <div>
              <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:"28px", fontWeight:400, color:"#fff", margin:"0 0 6px" }}>{profile.name}</h1>
              <p style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"13px", color:"rgba(255,255,255,0.45)", letterSpacing:"0.08em" }}>{profile.email} · MAISON Member since 2025</p>
            </div>
          </div>
        </div>

        <div style={{ maxWidth:"1200px", margin:"0 auto", padding:"0 48px 80px" }}>
          {/* Tab Nav */}
          <div style={{ display:"flex", gap:"0", borderBottom:"1px solid rgba(201,168,76,0.15)", marginBottom:"40px" }}>
            {TABS.map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} style={{
                padding:"18px 24px", background:"none", border:"none", cursor:"pointer",
                fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"11px", letterSpacing:"0.16em",
                color: activeTab===tab ? C.gold : "#6b5c44",
                borderBottom: activeTab===tab ? `2px solid ${C.gold}` : "2px solid transparent",
                transition:"all 0.2s",
              }}>{tab.toUpperCase()}</button>
            ))}
          </div>

          {/* PROFILE TAB */}
          {activeTab === "Profile" && (
            <div style={{ background:"#fff", padding:"40px", border:"1px solid rgba(201,168,76,0.12)", maxWidth:"600px" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"32px" }}>
                <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"22px", fontWeight:400, color:"#1a1208" }}>Personal Information</h2>
                <button onClick={() => editing ? saveProfile() : setEditing(true)} style={{
                  padding:"9px 22px", background: editing ? C.gold : "transparent",
                  border:`1px solid ${C.gold}`, color: editing ? "#0f0c08" : C.gold,
                  fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"10px", letterSpacing:"0.14em",
                  cursor:"pointer", transition:"all 0.2s",
                }}>{editing ? "SAVE CHANGES" : "EDIT PROFILE"}</button>
              </div>
              {[["Full Name","name"],["Email Address","email"],["Phone","phone"]].map(([label, key]) => (
                <div key={key} style={{ marginBottom:"20px" }}>
                  <label style={{ display:"block", fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"9.5px", letterSpacing:"0.18em", color:"#6b5c44", marginBottom:"8px" }}>
                    {label.toUpperCase()}
                  </label>
                  {editing ? (
                    <input value={editData[key]} onChange={e => setEditData({ ...editData, [key]:e.target.value })} style={{
                      width:"100%", padding:"12px 16px", border:`1px solid rgba(201,168,76,0.35)`,
                      fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"15px", color:"#1a1208", outline:"none", background:"#fdfaf5",
                    }}/>
                  ) : (
                    <p style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"15px", color:"#1a1208", padding:"12px 0", borderBottom:"1px solid rgba(201,168,76,0.1)" }}>
                      {profile[key]}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* ORDERS TAB */}
          {activeTab === "My Orders" && (
            <div>
              <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"24px", fontWeight:400, color:"#1a1208", marginBottom:"28px" }}>Order History</h2>
              {ORDERS.map(order => (
                <div key={order.id} style={{ background:"#fff", padding:"24px 28px", border:"1px solid rgba(201,168,76,0.12)", marginBottom:"14px", display:"flex", alignItems:"center", justifyContent:"space-between", gap:"24px" }}>
                  <div>
                    <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"17px", color:C.gold, marginBottom:"4px" }}>#{order.id}</div>
                    <div style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"12px", color:"#b0a08a" }}>{order.date} · {order.items} {order.items===1?"item":"items"}</div>
                  </div>
                  <div style={{ textAlign:"center" }}>
                    <StatusBadge status={order.status}/>
                  </div>
                  <div style={{ textAlign:"right" }}>
                    <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"18px", color:"#1a1208", marginBottom:"6px" }}>{order.total}</div>
                    <button style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"11px", color:C.gold, background:"none", border:"none", cursor:"pointer", textDecoration:"underline", textUnderlineOffset:"3px" }}>View Details</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* WISHLIST TAB */}
          {activeTab === "Wishlist" && (
            <div>
              <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"24px", fontWeight:400, color:"#1a1208", marginBottom:"28px" }}>Saved Items</h2>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))", gap:"24px" }}>
                {WISHLIST.map(item => (
                  <div key={item.name} style={{ background:"#fff", border:"1px solid rgba(201,168,76,0.1)", overflow:"hidden", cursor:"pointer" }}>
                  <div style={{ aspectRatio:"3/4", background:item.grad, position:"relative", overflow:"hidden" }}>
                    {item.image && <img src={item.image} alt={item.name} style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover" }} />}
                  </div>
                    <div style={{ padding:"16px" }}>
                      <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"16px", color:"#1a1208", marginBottom:"6px" }}>{item.name}</div>
                      <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"15px", color:"#3a2e1e", marginBottom:"14px" }}>{item.price}</div>
                      <button className="m-btn-gold" style={{ width:"100%", padding:"11px" }}>ADD TO CART</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ADDRESSES TAB */}
          {activeTab === "Addresses" && (
            <div style={{ maxWidth:"700px" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"28px" }}>
                <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"24px", fontWeight:400, color:"#1a1208" }}>Saved Addresses</h2>
                <button className="m-btn-gold" style={{ padding:"10px 24px" }}>+ ADD NEW</button>
              </div>
              {[{ label:"Home", address:"Flat 14B, Pinnacle Towers, BKC, Mumbai 400051, Maharashtra" },
                { label:"Office", address:"MAISON Atelier, 3rd Floor, Nariman Point, Mumbai 400021, Maharashtra" }].map(addr => (
                <div key={addr.label} style={{ background:"#fff", padding:"24px 28px", border:`1px solid rgba(201,168,76,0.12)`, marginBottom:"14px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <div>
                    <span style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"9px", letterSpacing:"0.2em", background:`rgba(201,168,76,0.1)`, color:C.gold, padding:"3px 10px", marginBottom:"10px", display:"inline-block" }}>{addr.label.toUpperCase()}</span>
                    <p style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"14px", color:"#3a2e1e", lineHeight:1.6, marginTop:"6px" }}>{addr.address}</p>
                  </div>
                  <div style={{ display:"flex", gap:"10px" }}>
                    <button style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"11px", color:C.gold, background:"none", border:"none", cursor:"pointer", textDecoration:"underline", textUnderlineOffset:"3px" }}>Edit</button>
                    <button style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"11px", color:"#e07070", background:"none", border:"none", cursor:"pointer" }}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* SETTINGS TAB */}
          {activeTab === "Settings" && (
            <div style={{ maxWidth:"600px" }}>
              <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"24px", fontWeight:400, color:"#1a1208", marginBottom:"28px" }}>Account Settings</h2>
              {[
                { title:"Newsletter Subscriptions", desc:"Receive updates on new arrivals, exclusive offers, and style guides.", checked:true },
                { title:"Order Notifications", desc:"SMS and email alerts for order updates and delivery.", checked:true },
                { title:"Personalised Recommendations", desc:"Allow MAISON to curate personalised product suggestions.", checked:false },
              ].map(setting => (
                <div key={setting.title} style={{ background:"#fff", padding:"22px 24px", border:"1px solid rgba(201,168,76,0.12)", marginBottom:"12px", display:"flex", justifyContent:"space-between", alignItems:"center", gap:"24px" }}>
                  <div>
                    <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"16px", color:"#1a1208", marginBottom:"4px" }}>{setting.title}</div>
                    <div style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"13px", color:"#6b5c44", fontWeight:300 }}>{setting.desc}</div>
                  </div>
                  <div style={{
                    width:"42px", height:"22px", borderRadius:"11px",
                    background: setting.checked ? C.gold : "rgba(201,168,76,0.2)",
                    position:"relative", cursor:"pointer", transition:"background 0.3s", flexShrink:0,
                  }}>
                    <div style={{ position:"absolute", top:"3px", left: setting.checked ? "22px" : "3px", width:"16px", height:"16px", borderRadius:"50%", background:"#fff", transition:"left 0.3s" }}/>
                  </div>
                </div>
              ))}
              <div style={{ marginTop:"28px", paddingTop:"24px", borderTop:"1px solid rgba(201,168,76,0.12)" }}>
                <button style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"12px", color:"#e07070", background:"none", border:"1px solid rgba(220,100,100,0.3)", padding:"10px 22px", cursor:"pointer", letterSpacing:"0.1em", transition:"all 0.2s" }}
                  onMouseEnter={e => e.currentTarget.style.background="rgba(220,100,100,0.06)"}
                  onMouseLeave={e => e.currentTarget.style.background="none"}
                >SIGN OUT</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
