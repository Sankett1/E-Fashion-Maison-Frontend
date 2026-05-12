import { C, GoldBar } from "../components/shared";

const FEATURES = [
  { outlet:"Vogue India",      date:"March 2026",    title:"'MAISON is redefining what Indian luxury looks like for a global generation'", type:"Feature" },
  { outlet:"Business of Fashion", date:"Feb 2026",   title:"The Indian brands making luxury accessible without compromising on craft", type:"Report" },
  { outlet:"Harper's Bazaar",  date:"Jan 2026",      title:"10 Indian designers to watch in 2026 — MAISON tops the list", type:"List" },
  { outlet:"The Hindu",        date:"Dec 2025",      title:"From BKC to Bombay: How MAISON is building a fashion atelier for modern India", type:"Profile" },
  { outlet:"Forbes India",     date:"Nov 2025",      title:"D2C luxury startups: The brands betting on Indian craftsmanship and digital retail", type:"Feature" },
  { outlet:"Mint Lounge",      date:"Oct 2025",      title:"Sustainable Indian fashion: MAISON's commitment to artisan weaving communities", type:"Interview" },
];

const AWARDS = [
  { year:"2026", award:"Best Indian Luxury D2C Brand", body:"India Luxury Summit" },
  { year:"2026", award:"Emerging Designer of the Year", body:"Lakmé Fashion Week" },
  { year:"2025", award:"Excellence in Sustainable Fashion", body:"Responsible Fashion Forum" },
  { year:"2025", award:"Best E-Commerce Experience — Fashion", body:"India Digital Awards" },
];

export default function PressPage() {
  return (
    <div style={{ minHeight:"100vh", background:C.bg, paddingTop:100 }}>
      {/* Hero */}
      <div style={{ textAlign:"center", padding:"48px 20px 60px" }}>
        <div style={{ fontSize:"9.5px", letterSpacing:"0.28em", color:C.gold, marginBottom:14 }}>IN THE NEWS</div>
        <h1 style={{ fontFamily:"'DM Serif Display',Georgia,serif", fontSize:"clamp(36px,5vw,60px)", fontWeight:400, color:"#fff", marginBottom:16 }}>Press & Media</h1>
        <GoldBar centered />
        <p style={{ fontSize:15, color:"rgba(255,255,255,0.45)", maxWidth:480, margin:"0 auto", lineHeight:1.9 }}>
          For press enquiries, image requests, or interview opportunities, contact our media team at <a href="mailto:press@maison.in" style={{ color:C.gold, textDecoration:"none" }}>press@maison.in</a>
        </p>
      </div>

      {/* Press features */}
      <div style={{ maxWidth:1000, margin:"0 auto 80px", padding:"0 24px" }}>
        <div style={{ fontSize:"9.5px", letterSpacing:"0.28em", color:C.gold, marginBottom:28 }}>AS FEATURED IN</div>
        <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
          {FEATURES.map((f,i)=>(
            <div key={i} style={{ borderTop:"1px solid rgba(201,168,76,0.12)", padding:"28px 0",
              display:"flex", gap:24, flexWrap:"wrap", alignItems:"flex-start" }}>
              <div style={{ minWidth:160 }}>
                <div style={{ fontFamily:"'DM Serif Display',Georgia,serif", fontSize:17, color:C.gold, marginBottom:4 }}>{f.outlet}</div>
                <div style={{ fontFamily:"'DM Sans',system-ui,sans-serif", fontSize:11, letterSpacing:"0.1em", color:"rgba(255,255,255,0.25)" }}>{f.date.toUpperCase()} · {f.type.toUpperCase()}</div>
              </div>
              <div style={{ flex:1 }}>
                <p style={{ fontFamily:"'DM Serif Display',Georgia,serif", fontSize:18, color:"rgba(255,255,255,0.8)", fontStyle:"italic", lineHeight:1.6, margin:0 }}>
                  {f.title}
                </p>
              </div>
            </div>
          ))}
          <div style={{ borderTop:"1px solid rgba(201,168,76,0.12)" }}/>
        </div>
      </div>

      {/* Awards */}
      <div style={{ maxWidth:1000, margin:"0 auto 80px", padding:"0 24px" }}>
        <div style={{ fontSize:"9.5px", letterSpacing:"0.28em", color:C.gold, marginBottom:28 }}>AWARDS & RECOGNITION</div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:16 }}>
          {AWARDS.map((a,i)=>(
            <div key={i} style={{ padding:"28px", border:"1px solid rgba(201,168,76,0.12)", background:"rgba(201,168,76,0.03)" }}>
              <div style={{ fontFamily:"'DM Sans',system-ui,sans-serif", fontSize:"10px", letterSpacing:"0.2em", color:"rgba(255,255,255,0.25)", marginBottom:10 }}>{a.year}</div>
              <div style={{ fontFamily:"'DM Serif Display',Georgia,serif", fontSize:20, color:"#fff", marginBottom:8, lineHeight:1.3 }}>{a.award}</div>
              <div style={{ fontFamily:"'DM Sans',system-ui,sans-serif", fontSize:13, color:C.gold }}>{a.body}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Press kit + contact */}
      <div style={{ maxWidth:1000, margin:"0 auto 100px", padding:"0 24px",
        display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))", gap:20 }}>
        <div style={{ padding:"36px", border:"1px solid rgba(201,168,76,0.15)", background:"rgba(201,168,76,0.03)" }}>
          <div style={{ fontSize:"9.5px", letterSpacing:"0.28em", color:C.gold, marginBottom:12 }}>PRESS KIT</div>
          <h3 style={{ fontFamily:"'DM Serif Display',Georgia,serif", fontSize:22, color:"#fff", fontWeight:400, marginBottom:12 }}>Brand Assets</h3>
          <p style={{ fontFamily:"'DM Sans',system-ui,sans-serif", fontSize:14, color:"rgba(255,255,255,0.45)", lineHeight:1.8, marginBottom:24 }}>
            Download high-resolution logos, brand guidelines, product imagery, and founder bio for editorial use.
          </p>
          <a href="mailto:press@maison.in?subject=Press Kit Request"
            style={{ display:"inline-block", padding:"12px 28px", border:`1px solid ${C.gold}`,
              color:C.gold, textDecoration:"none", fontFamily:"'DM Sans',system-ui,sans-serif",
              fontSize:11, letterSpacing:"0.12em" }}>
            REQUEST KIT
          </a>
        </div>
        <div style={{ padding:"36px", border:"1px solid rgba(201,168,76,0.15)", background:"rgba(201,168,76,0.03)" }}>
          <div style={{ fontSize:"9.5px", letterSpacing:"0.28em", color:C.gold, marginBottom:12 }}>MEDIA CONTACT</div>
          <h3 style={{ fontFamily:"'DM Serif Display',Georgia,serif", fontSize:22, color:"#fff", fontWeight:400, marginBottom:12 }}>Get in Touch</h3>
          <p style={{ fontFamily:"'DM Sans',system-ui,sans-serif", fontSize:14, color:"rgba(255,255,255,0.45)", lineHeight:1.8, marginBottom:16 }}>
            For features, collaborations, and editorial loans, please reach out directly.
          </p>
          <div style={{ fontFamily:"'DM Sans',system-ui,sans-serif", fontSize:14, color:"rgba(255,255,255,0.6)", marginBottom:6 }}>✉ press@maison.in</div>
          <div style={{ fontFamily:"'DM Sans',system-ui,sans-serif", fontSize:14, color:"rgba(255,255,255,0.6)" }}>☎ +91 98765 43211</div>
        </div>
      </div>
    </div>
  );
}
