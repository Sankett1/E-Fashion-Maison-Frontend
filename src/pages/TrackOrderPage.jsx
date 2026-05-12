import { useState } from "react";
import { C, GoldBar } from "../components/shared";

const STEPS = ["Order Placed","Processing","Dispatched","Out for Delivery","Delivered"];

function mock(id) {
  const h = [...id].reduce((a,c)=>a+c.charCodeAt(0),0);
  const step = h % 5;
  const courier = ["Delhivery","BlueDart","Ecom Express"][h%3];
  const tracking = "DL"+String(h).padStart(10,"0").slice(0,10);
  const eta = ["Today","Tomorrow","In 2 days","In 3 days"][h%4];
  return { step, courier, tracking, eta,
    updates:[
      { time:"10:32 AM", date:"11 May 2026", msg:"Out for delivery — rider assigned", active: step>=3 },
      { time:"04:15 AM", date:"11 May 2026", msg:"Arrived at local hub — Mumbai Central", active: step>=2 },
      { time:"11:48 PM", date:"10 May 2026", msg:"Dispatched from MAISON Atelier, BKC", active: step>=2 },
      { time:"02:10 PM", date:"10 May 2026", msg:"Packed and quality checked", active: step>=1 },
      { time:"09:00 AM", date:"10 May 2026", msg:"Order confirmed and payment verified", active: step>=0 },
    ]
  };
}

export default function TrackOrderPage() {
  const [id,     setId]    = useState("");
  const [result, setResult] = useState(null);
  const [error,  setError]  = useState("");
  const [loading,setLoading]= useState(false);

  const handleTrack = () => {
    setError(""); setResult(null);
    if (!id.trim()) { setError("Please enter an order ID or tracking number."); return; }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (id.trim().length < 4) { setError("Order not found. Please check your ID and try again."); return; }
      setResult(mock(id.trim()));
    }, 1200);
  };

  return (
    <div style={{ minHeight:"100vh", background:C.bg, paddingTop:100 }}>
      {/* Hero */}
      <div style={{ textAlign:"center", padding:"48px 20px 56px" }}>
        <div style={{ fontSize:"9.5px", letterSpacing:"0.28em", color:C.gold, marginBottom:14 }}>LIVE TRACKING</div>
        <h1 style={{ fontFamily:"'DM Serif Display',Georgia,serif", fontSize:"clamp(36px,5vw,54px)", fontWeight:400, color:"#fff", marginBottom:16 }}>Track Your Order</h1>
        <GoldBar centered />
        <p style={{ fontSize:15, color:"rgba(255,255,255,0.45)", maxWidth:440, margin:"0 auto", lineHeight:1.8 }}>
          Enter your order ID from your confirmation email or the tracking number from your shipping notification.
        </p>
      </div>

      {/* Search box */}
      <div style={{ maxWidth:560, margin:"0 auto", padding:"0 24px 48px" }}>
        <div style={{ display:"flex", gap:0, border:"1px solid rgba(201,168,76,0.25)" }}>
          <input value={id} onChange={e=>setId(e.target.value)}
            onKeyDown={e=>e.key==="Enter"&&handleTrack()}
            placeholder="Order ID or tracking number"
            style={{ flex:1, background:"rgba(255,255,255,0.03)", border:"none", outline:"none",
              padding:"16px 20px", color:"#fff", fontFamily:"'DM Sans',system-ui,sans-serif", fontSize:14 }}/>
          <button onClick={handleTrack}
            style={{ padding:"16px 28px", background:C.gold, border:"none", cursor:"pointer",
              color:"#0a0603", fontFamily:"'DM Sans',system-ui,sans-serif",
              fontSize:11, letterSpacing:"0.14em", fontWeight:600, whiteSpace:"nowrap" }}>
            {loading ? "…" : "TRACK"}
          </button>
        </div>
        {error && <p style={{ color:"#e07070", fontFamily:"'DM Sans',system-ui,sans-serif", fontSize:13, marginTop:10 }}>{error}</p>}
      </div>

      {/* Result */}
      {result && (
        <div style={{ maxWidth:760, margin:"0 auto 100px", padding:"0 24px" }}>
          {/* Progress bar */}
          <div style={{ marginBottom:48 }}>
            <div style={{ display:"flex", justifyContent:"space-between", position:"relative", marginBottom:12 }}>
              <div style={{ position:"absolute", top:12, left:0, right:0, height:2, background:"rgba(201,168,76,0.12)", zIndex:0 }}/>
              <div style={{ position:"absolute", top:12, left:0, height:2, zIndex:1,
                background:C.gold, width:`${(result.step/4)*100}%`, transition:"width 0.6s ease" }}/>
              {STEPS.map((s,i)=>(
                <div key={s} style={{ display:"flex", flexDirection:"column", alignItems:"center", zIndex:2, flex:1 }}>
                  <div style={{ width:24, height:24, borderRadius:"50%",
                    background: i<=result.step ? C.gold : "#1a1208",
                    border:`2px solid ${i<=result.step ? C.gold : "rgba(201,168,76,0.2)"}`,
                    display:"flex", alignItems:"center", justifyContent:"center", marginBottom:8 }}>
                    {i<result.step && <span style={{ color:"#0a0603", fontSize:12, fontWeight:700 }}>✓</span>}
                    {i===result.step && <span style={{ width:8, height:8, borderRadius:"50%", background:"#0a0603", display:"block" }}/>}
                  </div>
                  <span style={{ fontFamily:"'DM Sans',system-ui,sans-serif", fontSize:"10px",
                    letterSpacing:"0.08em", color: i<=result.step ? C.gold : "rgba(255,255,255,0.3)",
                    textAlign:"center", maxWidth:80 }}>{s.toUpperCase()}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Info cards */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:16, marginBottom:40 }}>
            {[
              { label:"Status",    val: STEPS[result.step] },
              { label:"Courier",   val: result.courier },
              { label:"Tracking #",val: result.tracking },
              { label:"Est. Arrival", val: result.eta },
            ].map(({label,val})=>(
              <div key={label} style={{ padding:"20px 22px", border:"1px solid rgba(201,168,76,0.12)", background:"rgba(201,168,76,0.03)" }}>
                <div style={{ fontFamily:"'DM Sans',system-ui,sans-serif", fontSize:"10px", letterSpacing:"0.18em", color:"rgba(255,255,255,0.3)", marginBottom:6 }}>{label.toUpperCase()}</div>
                <div style={{ fontFamily:"'DM Serif Display',Georgia,serif", fontSize:18, color:"#fff" }}>{val}</div>
              </div>
            ))}
          </div>

          {/* Timeline */}
          <h3 style={{ fontFamily:"'DM Sans',system-ui,sans-serif", fontSize:"11px", letterSpacing:"0.2em", color:"rgba(255,255,255,0.3)", marginBottom:24 }}>SHIPMENT TIMELINE</h3>
          <div style={{ borderLeft:"1px solid rgba(201,168,76,0.15)", paddingLeft:24 }}>
            {result.updates.map((u,i)=>(
              <div key={i} style={{ position:"relative", paddingBottom:28, opacity: u.active ? 1 : 0.28 }}>
                <div style={{ position:"absolute", left:-29, top:4, width:10, height:10, borderRadius:"50%",
                  background: u.active ? C.gold : "rgba(201,168,76,0.2)",
                  border:`2px solid ${u.active ? C.gold : "rgba(201,168,76,0.2)"}` }}/>
                <div style={{ fontFamily:"'DM Sans',system-ui,sans-serif", fontSize:14, color: u.active?"#fff":"rgba(255,255,255,0.35)", marginBottom:4 }}>{u.msg}</div>
                <div style={{ fontFamily:"'DM Sans',system-ui,sans-serif", fontSize:12, color:"rgba(255,255,255,0.3)" }}>{u.time} · {u.date}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!result && !error && (
        <div style={{ textAlign:"center", padding:"0 20px 100px" }}>
          <p style={{ fontFamily:"'DM Sans',system-ui,sans-serif", fontSize:13, color:"rgba(255,255,255,0.25)", lineHeight:1.8 }}>
            Your tracking number is in the shipping confirmation email sent to your registered address.<br/>
            Need help? <a href="/contact" style={{ color:C.gold, textDecoration:"none" }}>Contact us</a>
          </p>
        </div>
      )}
    </div>
  );
}
