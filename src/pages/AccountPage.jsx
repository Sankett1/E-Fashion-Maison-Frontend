import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { C } from "../components/shared";
import { useAuth } from "../context/AuthContext";
import { updateProfile, changePassword, addAddress, removeAddress } from "../api/authApi";
import { getMyOrders } from "../api/orderApi";

const TABS = ["Profile", "My Orders", "Wishlist", "Addresses", "Settings"];

const StatusBadge = ({ status }) => {
  const colors = {
    Delivered:  ["#7ab87a", "rgba(122,184,122,0.1)"],
    Shipped:    [C.gold,    "rgba(201,168,76,0.1)"],
    Processing: ["#d4a04a", "rgba(212,160,74,0.1)"],
    Pending:    ["#b0a08a", "rgba(176,160,138,0.1)"],
    Cancelled:  ["#e07070", "rgba(220,112,112,0.1)"],
  };
  const [color, bg] = colors[status] || ["#b0a08a", "rgba(176,160,138,0.1)"];
  return (
    <span style={{ padding:"4px 12px", background:bg, border:`1px solid ${color}30`,
      fontFamily:"'DM Sans',system-ui,sans-serif", fontSize:"10px",
      letterSpacing:"0.12em", color }}>
      {status?.toUpperCase()}
    </span>
  );
};

const Spinner = () => (
  <div style={{ display:"flex", alignItems:"center", justifyContent:"center", padding:"40px 0", gap:12 }}>
    <div style={{ width:24, height:24, border:`2px solid ${C.gold}`, borderTopColor:"transparent",
      borderRadius:"50%", animation:"acSpin 0.8s linear infinite" }}/>
    <style>{`@keyframes acSpin{to{transform:rotate(360deg)}}`}</style>
    <span style={{ fontFamily:"'DM Sans',system-ui,sans-serif", fontSize:12, letterSpacing:"0.16em", color:"#6b5c44" }}>
      LOADING…
    </span>
  </div>
);

export default function AccountPage() {
  const { user, logout, refreshUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Profile");

  // Profile
  const [editing,    setEditing]    = useState(false);
  const [editData,   setEditData]   = useState({ name:"", phone:"" });
  const [saving,     setSaving]     = useState(false);
  const [profileMsg, setProfileMsg] = useState(null);

  // Change password
  const [pwForm,   setPwForm]   = useState({ currentPassword:"", newPassword:"", confirm:"" });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMsg,    setPwMsg]    = useState(null);

  // Orders
  const [orders,        setOrders]        = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError,   setOrdersError]   = useState(null);

  // Addresses
  const [addingAddr, setAddingAddr] = useState(false);
  const [addrForm,   setAddrForm]   = useState({ label:"Home", address:"", city:"", state:"", pincode:"" });
  const [addrSaving, setAddrSaving] = useState(false);
  const [addrMsg,    setAddrMsg]    = useState(null);

  useEffect(() => { if (!isAuthenticated) navigate("/login"); }, [isAuthenticated]);
  useEffect(() => { if (user) setEditData({ name: user.name || "", phone: user.phone || "" }); }, [user]);

  useEffect(() => {
    if (activeTab !== "My Orders") return;
    setOrdersLoading(true);
    setOrdersError(null);
    getMyOrders()
      .then(d => setOrders(d.orders || []))
      .catch(() => setOrdersError("Could not load orders. Please try again."))
      .finally(() => setOrdersLoading(false));
  }, [activeTab]);

  const saveProfile = async () => {
    setSaving(true); setProfileMsg(null);
    try {
      await updateProfile({ name: editData.name, phone: editData.phone });
      await refreshUser();
      setEditing(false);
      setProfileMsg({ type:"ok", text:"Profile updated successfully." });
    } catch { setProfileMsg({ type:"err", text:"Failed to save changes. Please try again." }); }
    finally { setSaving(false); }
  };

  const handleChangePassword = async () => {
    if (pwForm.newPassword !== pwForm.confirm) { setPwMsg({ type:"err", text:"New passwords do not match." }); return; }
    if (pwForm.newPassword.length < 6) { setPwMsg({ type:"err", text:"Password must be at least 6 characters." }); return; }
    setPwSaving(true); setPwMsg(null);
    try {
      await changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      setPwMsg({ type:"ok", text:"Password changed successfully." });
      setPwForm({ currentPassword:"", newPassword:"", confirm:"" });
    } catch (err) { setPwMsg({ type:"err", text: err.response?.data?.message || "Incorrect current password." }); }
    finally { setPwSaving(false); }
  };

  const handleAddAddress = async () => {
    if (!addrForm.address.trim() || !addrForm.city.trim()) { setAddrMsg({ type:"err", text:"Please fill in required fields." }); return; }
    setAddrSaving(true); setAddrMsg(null);
    try {
      await addAddress(addrForm);
      await refreshUser();
      setAddingAddr(false);
      setAddrForm({ label:"Home", address:"", city:"", state:"", pincode:"" });
      setAddrMsg({ type:"ok", text:"Address added successfully." });
    } catch { setAddrMsg({ type:"err", text:"Failed to add address. Please try again." }); }
    finally { setAddrSaving(false); }
  };

  const handleRemoveAddress = async (id) => {
    try { await removeAddress(id); await refreshUser(); }
    catch { alert("Could not remove address."); }
  };

  if (!user) return <div style={{ paddingTop:"64px", background:"#f5f0eb", minHeight:"100vh" }}><Spinner /></div>;

  const wishlist  = user.wishlist  || [];
  const addresses = user.addresses || [];

  return (
    <div style={{ paddingTop:"64px", background:"#f5f0eb", minHeight:"100vh" }}>
      {/* Header */}
      <div className="r-section" style={{ background:"linear-gradient(135deg,#1a1208 0%,#2a1e0a 50%,#1a1208 100%)", paddingTop:"56px", paddingBottom:"48px" }}>
        <div style={{ maxWidth:"1200px", margin:"0 auto", display:"flex", alignItems:"center", gap:"28px" }}>
          <div style={{ width:"80px", height:"80px", borderRadius:"50%", overflow:"hidden", flexShrink:0,
            background:"linear-gradient(135deg,#c9a84c,#8a6228)",
            display:"flex", alignItems:"center", justifyContent:"center" }}>
            {user.avatar?.url
              ? <img src={user.avatar.url} alt={user.name} style={{ width:"100%", height:"100%", objectFit:"cover" }} />
              : <span style={{ fontFamily:"'DM Serif Display',Georgia,serif", fontSize:"28px", color:"#0f0c08", fontWeight:500 }}>
                  {user.name?.[0]?.toUpperCase() || "U"}
                </span>}
          </div>
          <div>
            <h1 style={{ fontFamily:"'DM Serif Display',Georgia,serif", fontSize:"28px", fontWeight:400, color:"#fff", margin:"0 0 6px" }}>{user.name}</h1>
            <p style={{ fontFamily:"'DM Sans',system-ui,sans-serif", fontSize:"13px", color:"rgba(255,255,255,0.45)", letterSpacing:"0.08em" }}>
              {user.email} · MAISON Member
            </p>
          </div>
        </div>
      </div>

      <div className="r-section" style={{ maxWidth:"1200px", margin:"0 auto", paddingBottom:"80px" }}>
        {/* Tab Nav */}
        <div className="r-tabs" style={{ display:"flex", borderBottom:"1px solid rgba(201,168,76,0.15)", marginBottom:"40px", overflowX:"auto" }}>
          {TABS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              padding:"18px 24px", background:"none", border:"none", cursor:"pointer",
              fontFamily:"'DM Sans',system-ui,sans-serif", fontSize:"11px", letterSpacing:"0.16em",
              color: activeTab===tab ? C.gold : "#6b5c44",
              borderBottom: activeTab===tab ? `2px solid ${C.gold}` : "2px solid transparent",
              transition:"all 0.2s", whiteSpace:"nowrap",
            }}>{tab.toUpperCase()}</button>
          ))}
        </div>

        {/* PROFILE */}
        {activeTab === "Profile" && (
          <div style={{ maxWidth:"600px" }}>
            <div style={{ background:"#fff", padding:"40px", border:"1px solid rgba(201,168,76,0.12)", marginBottom:24 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"32px" }}>
                <h2 style={{ fontFamily:"'DM Serif Display',Georgia,serif", fontSize:"22px", fontWeight:400, color:"#1a1208" }}>Personal Information</h2>
                <button onClick={() => editing ? saveProfile() : setEditing(true)} disabled={saving}
                  style={{ padding:"9px 22px", background: editing ? C.gold : "transparent",
                    border:`1px solid ${C.gold}`, color: editing ? "#0f0c08" : C.gold,
                    fontFamily:"'DM Sans',system-ui,sans-serif", fontSize:"10px", letterSpacing:"0.14em",
                    cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1 }}>
                  {saving ? "SAVING…" : editing ? "SAVE CHANGES" : "EDIT PROFILE"}
                </button>
              </div>
              {[["Full Name","name","text"],["Email Address","email","email"],["Phone","phone","tel"]].map(([label,key,type]) => (
                <div key={key} style={{ marginBottom:"20px" }}>
                  <label style={{ display:"block", fontFamily:"'DM Sans',system-ui,sans-serif", fontSize:"12px", letterSpacing:"0.08em", color:"#6b5c44", marginBottom:"8px" }}>
                    {label.toUpperCase()}
                  </label>
                  {editing && key !== "email"
                    ? <input value={editData[key] || ""} type={type} onChange={e => setEditData(d => ({ ...d, [key]: e.target.value }))}
                        style={{ width:"100%", padding:"12px 16px", boxSizing:"border-box", border:"1px solid rgba(201,168,76,0.35)", fontFamily:"'DM Sans',system-ui,sans-serif", fontSize:"15px", color:"#1a1208", outline:"none", background:"#fdfaf5" }}/>
                    : <p style={{ fontFamily:"'DM Sans',system-ui,sans-serif", fontSize:"15px", color:"#1a1208", padding:"12px 0", borderBottom:"1px solid rgba(201,168,76,0.1)", margin:0 }}>
                        {key === "email" ? user.email : (user[key] || "—")}
                      </p>}
                </div>
              ))}
              {profileMsg && (
                <div style={{ padding:"10px 14px", marginTop:8, background: profileMsg.type==="ok" ? "rgba(122,184,122,0.08)" : "rgba(220,100,100,0.08)", border:`1px solid ${profileMsg.type==="ok" ? "rgba(122,184,122,0.3)" : "rgba(220,100,100,0.3)"}`, fontFamily:"'DM Sans',system-ui,sans-serif", fontSize:"13px", color: profileMsg.type==="ok" ? "#7ab87a" : "#e07070" }}>
                  {profileMsg.text}
                </div>
              )}
            </div>

            {/* Change Password */}
            <div style={{ background:"#fff", padding:"40px", border:"1px solid rgba(201,168,76,0.12)" }}>
              <h2 style={{ fontFamily:"'DM Serif Display',Georgia,serif", fontSize:"22px", fontWeight:400, color:"#1a1208", marginBottom:"28px" }}>Change Password</h2>
              {[["Current Password","currentPassword"],["New Password","newPassword"],["Confirm New Password","confirm"]].map(([label,key]) => (
                <div key={key} style={{ marginBottom:16 }}>
                  <label style={{ display:"block", fontFamily:"'DM Sans',system-ui,sans-serif", fontSize:"12px", letterSpacing:"0.08em", color:"#6b5c44", marginBottom:8 }}>{label.toUpperCase()}</label>
                  <input type="password" value={pwForm[key]} onChange={e => setPwForm(f => ({ ...f, [key]: e.target.value }))}
                    style={{ width:"100%", padding:"12px 16px", boxSizing:"border-box", border:"1px solid rgba(201,168,76,0.25)", fontFamily:"'DM Sans',system-ui,sans-serif", fontSize:"14px", color:"#1a1208", outline:"none" }}/>
                </div>
              ))}
              {pwMsg && (
                <div style={{ padding:"10px 14px", marginBottom:12, background: pwMsg.type==="ok" ? "rgba(122,184,122,0.08)" : "rgba(220,100,100,0.08)", border:`1px solid ${pwMsg.type==="ok" ? "rgba(122,184,122,0.3)" : "rgba(220,100,100,0.3)"}`, fontFamily:"'DM Sans',system-ui,sans-serif", fontSize:"13px", color: pwMsg.type==="ok" ? "#7ab87a" : "#e07070" }}>
                  {pwMsg.text}
                </div>
              )}
              <button onClick={handleChangePassword} disabled={pwSaving}
                style={{ padding:"12px 28px", background:C.gold, border:"none", color:"#0f0c08", fontFamily:"'DM Sans',system-ui,sans-serif", fontSize:"10px", letterSpacing:"0.08em", cursor: pwSaving ? "not-allowed" : "pointer", opacity: pwSaving ? 0.7 : 1 }}>
                {pwSaving ? "UPDATING…" : "UPDATE PASSWORD"}
              </button>
            </div>
          </div>
        )}

        {/* ORDERS */}
        {activeTab === "My Orders" && (
          <div>
            <h2 style={{ fontFamily:"'DM Serif Display',Georgia,serif", fontSize:"24px", fontWeight:400, color:"#1a1208", marginBottom:"28px" }}>Order History</h2>
            {ordersLoading && <Spinner />}
            {ordersError && <div style={{ padding:"16px", background:"rgba(220,100,100,0.06)", border:"1px solid rgba(220,100,100,0.25)", fontFamily:"'DM Sans',system-ui,sans-serif", fontSize:"14px", color:"#e07070" }}>{ordersError}</div>}
            {!ordersLoading && !ordersError && orders.length === 0 && (
              <div style={{ textAlign:"center", padding:"60px 0" }}>
                <div style={{ fontSize:48, marginBottom:16 }}>📦</div>
                <p style={{ fontFamily:"'DM Serif Display',Georgia,serif", fontSize:20, color:"#6b5c44", marginBottom:20 }}>No orders yet</p>
                <button className="m-btn-gold" onClick={() => navigate("/shop")}>EXPLORE COLLECTION</button>
              </div>
            )}
            {orders.map(order => (
              <div key={order._id} style={{ background:"#fff", padding:"24px 28px", border:"1px solid rgba(201,168,76,0.12)", marginBottom:"14px", display:"flex", alignItems:"center", justifyContent:"space-between", gap:"24px", flexWrap:"wrap" }}>
                <div>
                  <div style={{ fontFamily:"'DM Serif Display',Georgia,serif", fontSize:"17px", color:C.gold, marginBottom:"4px" }}>
                    #{order.orderNumber || order._id.slice(-8).toUpperCase()}
                  </div>
                  <div style={{ fontFamily:"'DM Sans',system-ui,sans-serif", fontSize:"12px", color:"#b0a08a" }}>
                    {new Date(order.createdAt).toLocaleDateString("en-IN", { day:"numeric", month:"long", year:"numeric" })} · {order.items?.length || 0} {(order.items?.length||0)===1?"item":"items"}
                  </div>
                </div>
                <StatusBadge status={order.status} />
                <div style={{ textAlign:"right" }}>
                  <div style={{ fontFamily:"'DM Serif Display',Georgia,serif", fontSize:"18px", color:"#1a1208", marginBottom:"6px" }}>₹{Number(order.totalAmount).toLocaleString("en-IN")}</div>
                  <button style={{ fontFamily:"'DM Sans',system-ui,sans-serif", fontSize:"11px", color:C.gold, background:"none", border:"none", cursor:"pointer", textDecoration:"underline", textUnderlineOffset:"3px" }}>View Details</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* WISHLIST */}
        {activeTab === "Wishlist" && (
          <div>
            <h2 style={{ fontFamily:"'DM Serif Display',Georgia,serif", fontSize:"24px", fontWeight:400, color:"#1a1208", marginBottom:"28px" }}>Saved Items ({wishlist.length})</h2>
            {wishlist.length === 0 ? (
              <div style={{ textAlign:"center", padding:"60px 0" }}>
                <div style={{ fontSize:48, marginBottom:16 }}>🤍</div>
                <p style={{ fontFamily:"'DM Serif Display',Georgia,serif", fontSize:20, color:"#6b5c44", marginBottom:20 }}>Your wishlist is empty</p>
                <button className="m-btn-gold" onClick={() => navigate("/shop")}>EXPLORE COLLECTION</button>
              </div>
            ) : (
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))", gap:"24px" }}>
                {wishlist.map(item => (
                  <div key={item._id} style={{ background:"#fff", border:"1px solid rgba(201,168,76,0.1)", overflow:"hidden" }}>
                    <div style={{ aspectRatio:"3/4", background:"linear-gradient(160deg,#c8b080,#8a6228)", position:"relative", overflow:"hidden", cursor:"pointer" }} onClick={() => navigate(`/shop/${item._id}`)}>
                      {item.images?.[0]?.url && <img src={item.images[0].url} alt={item.name} style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover" }} />}
                    </div>
                    <div style={{ padding:"16px" }}>
                      <div style={{ fontFamily:"'DM Sans',system-ui,sans-serif", fontSize:"12px", letterSpacing:"0.14em", color:"#6b5c44", marginBottom:4 }}>{item.category?.toUpperCase()}</div>
                      <div style={{ fontFamily:"'DM Serif Display',Georgia,serif", fontSize:"16px", color:"#1a1208", marginBottom:"6px" }}>{item.name}</div>
                      <div style={{ fontFamily:"'DM Serif Display',Georgia,serif", fontSize:"15px", color:"#3a2e1e", marginBottom:"14px" }}>₹{Number(item.price).toLocaleString("en-IN")}</div>
                      <button className="m-btn-gold" style={{ width:"100%", padding:"11px" }} onClick={() => navigate(`/shop/${item._id}`)}>VIEW PRODUCT</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ADDRESSES */}
        {activeTab === "Addresses" && (
          <div style={{ maxWidth:"700px" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"28px" }}>
              <h2 style={{ fontFamily:"'DM Serif Display',Georgia,serif", fontSize:"24px", fontWeight:400, color:"#1a1208" }}>Saved Addresses</h2>
              <button className="m-btn-gold" style={{ padding:"10px 24px" }} onClick={() => setAddingAddr(a => !a)}>{addingAddr ? "CANCEL" : "+ ADD NEW"}</button>
            </div>
            {addrMsg && <div style={{ padding:"10px 14px", marginBottom:16, background: addrMsg.type==="ok" ? "rgba(122,184,122,0.08)" : "rgba(220,100,100,0.08)", border:`1px solid ${addrMsg.type==="ok" ? "rgba(122,184,122,0.3)" : "rgba(220,100,100,0.3)"}`, fontFamily:"'DM Sans',system-ui,sans-serif", fontSize:"13px", color: addrMsg.type==="ok" ? "#7ab87a" : "#e07070" }}>{addrMsg.text}</div>}
            {addingAddr && (
              <div style={{ background:"#fff", padding:"28px", border:"1px solid rgba(201,168,76,0.15)", marginBottom:20 }}>
                <h3 style={{ fontFamily:"'DM Serif Display',Georgia,serif", fontSize:"18px", fontWeight:400, color:"#1a1208", marginBottom:20 }}>New Address</h3>
                {[["Label","label","e.g. Home"],["Address","address","Street, Area, Landmark"]].map(([label,key,ph]) => (
                  <div key={key} style={{ marginBottom:12 }}>
                    <label style={{ display:"block", fontFamily:"'DM Sans',system-ui,sans-serif", fontSize:"12px", letterSpacing:"0.16em", color:"#6b5c44", marginBottom:6 }}>{label.toUpperCase()}</label>
                    <input value={addrForm[key]} placeholder={ph} onChange={e => setAddrForm(f => ({ ...f, [key]: e.target.value }))}
                      style={{ width:"100%", padding:"10px 14px", boxSizing:"border-box", border:"1px solid rgba(201,168,76,0.25)", fontFamily:"'DM Sans',system-ui,sans-serif", fontSize:"14px", color:"#1a1208", outline:"none" }}/>
                  </div>
                ))}
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12, marginBottom:20 }}>
                  {[["City","city","Mumbai"],["State","state","Maharashtra"],["Pincode","pincode","400001"]].map(([label,key,ph]) => (
                    <div key={key}>
                      <label style={{ display:"block", fontFamily:"'DM Sans',system-ui,sans-serif", fontSize:"12px", letterSpacing:"0.16em", color:"#6b5c44", marginBottom:6 }}>{label.toUpperCase()}</label>
                      <input value={addrForm[key]} placeholder={ph} onChange={e => setAddrForm(f => ({ ...f, [key]: e.target.value }))}
                        style={{ width:"100%", padding:"10px 14px", boxSizing:"border-box", border:"1px solid rgba(201,168,76,0.25)", fontFamily:"'DM Sans',system-ui,sans-serif", fontSize:"14px", color:"#1a1208", outline:"none" }}/>
                    </div>
                  ))}
                </div>
                <button onClick={handleAddAddress} disabled={addrSaving}
                  style={{ padding:"12px 28px", background:C.gold, border:"none", color:"#0f0c08", fontFamily:"'DM Sans',system-ui,sans-serif", fontSize:"10px", letterSpacing:"0.08em", cursor: addrSaving ? "not-allowed" : "pointer", opacity: addrSaving ? 0.7 : 1 }}>
                  {addrSaving ? "SAVING…" : "SAVE ADDRESS"}
                </button>
              </div>
            )}
            {addresses.length === 0 && !addingAddr && <div style={{ textAlign:"center", padding:"40px 0", fontFamily:"'DM Sans',system-ui,sans-serif", fontSize:15, color:"#b0a08a" }}>No saved addresses yet.</div>}
            {addresses.map(addr => (
              <div key={addr._id} style={{ background:"#fff", padding:"24px 28px", border:"1px solid rgba(201,168,76,0.12)", marginBottom:"14px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <div>
                  <span style={{ fontFamily:"'DM Sans',system-ui,sans-serif", fontSize:"12px", letterSpacing:"0.10em", background:"rgba(201,168,76,0.1)", color:C.gold, padding:"3px 10px", marginBottom:"10px", display:"inline-block" }}>{(addr.label||"ADDRESS").toUpperCase()}</span>
                  <p style={{ fontFamily:"'DM Sans',system-ui,sans-serif", fontSize:"14px", color:"#3a2e1e", lineHeight:1.6, marginTop:"6px" }}>
                    {addr.address}{addr.city?`, ${addr.city}`:""}{addr.state?`, ${addr.state}`:""}{addr.pincode?` - ${addr.pincode}`:""}
                  </p>
                </div>
                <button onClick={() => handleRemoveAddress(addr._id)} style={{ fontFamily:"'DM Sans',system-ui,sans-serif", fontSize:"11px", color:"#e07070", background:"none", border:"none", cursor:"pointer", flexShrink:0 }}>Delete</button>
              </div>
            ))}
          </div>
        )}

        {/* SETTINGS */}
        {activeTab === "Settings" && (
          <div style={{ maxWidth:"600px" }}>
            <h2 style={{ fontFamily:"'DM Serif Display',Georgia,serif", fontSize:"24px", fontWeight:400, color:"#1a1208", marginBottom:"28px" }}>Account Settings</h2>
            {[
              { title:"Account Role", value: user.role === "admin" ? "Administrator" : "Customer" },
              { title:"Member Since", value: user.createdAt ? new Date(user.createdAt).toLocaleDateString("en-IN",{month:"long",year:"numeric"}) : "—" },
              { title:"Wishlist Items", value: `${wishlist.length} saved piece${wishlist.length!==1?"s":""}` },
            ].map(row => (
              <div key={row.title} style={{ background:"#fff", padding:"24px 28px", border:"1px solid rgba(201,168,76,0.12)", marginBottom:12 }}>
                <div style={{ fontFamily:"'DM Serif Display',Georgia,serif", fontSize:"16px", color:"#1a1208", marginBottom:4 }}>{row.title}</div>
                <div style={{ fontFamily:"'DM Sans',system-ui,sans-serif", fontSize:"13px", color:"#6b5c44" }}>{row.value}</div>
              </div>
            ))}
            <div style={{ marginTop:"28px", paddingTop:"24px", borderTop:"1px solid rgba(201,168,76,0.12)" }}>
              <button onClick={logout} style={{ fontFamily:"'DM Sans',system-ui,sans-serif", fontSize:"12px", color:"#e07070", background:"none", border:"1px solid rgba(220,100,100,0.3)", padding:"10px 22px", cursor:"pointer", letterSpacing:"0.1em", transition:"all 0.2s" }}
                onMouseEnter={e => e.currentTarget.style.background="rgba(220,100,100,0.06)"}
                onMouseLeave={e => e.currentTarget.style.background="none"}>
                SIGN OUT
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
