import { useState } from "react";
import { C, GoldBar } from "../components/shared";

const ROLES = [
  { dept:"Design",      title:"Senior Fashion Designer",       loc:"Mumbai · Full-time",   desc:"Lead seasonal collections for Women's RTW. 5+ years luxury fashion experience required." },
  { dept:"Design",      title:"Junior Pattern Maker",          loc:"Mumbai · Full-time",   desc:"Collaborate with lead designers to develop and refine garment patterns." },
  { dept:"Technology",  title:"Full Stack Engineer",           loc:"Remote · Full-time",   desc:"Build and scale our e-commerce platform. React + Node.js + MongoDB stack." },
  { dept:"Technology",  title:"UI/UX Designer",                loc:"Mumbai / Remote",      desc:"Own the end-to-end digital experience across web and app surfaces." },
  { dept:"Operations",  title:"Supply Chain Manager",          loc:"Mumbai · Full-time",   desc:"Oversee sourcing, vendor relations, and logistics across India and overseas." },
  { dept:"Marketing",   title:"Brand & Content Lead",          loc:"Mumbai · Full-time",   desc:"Define and execute MAISON's brand voice across digital and editorial channels." },
  { dept:"Marketing",   title:"Social Media & Influencer Mgr", loc:"Mumbai / Remote",      desc:"Grow our organic presence across Instagram, YouTube, and emerging platforms." },
  { dept:"Retail",      title:"Store Manager — BKC Flagship",  loc:"Mumbai · Full-time",   desc:"Deliver an unmatched in-store luxury experience. 3+ years luxury retail experience." },
];

const DEPTS = ["All", ...Array.from(new Set(ROLES.map(r => r.dept)))];

const PERKS = [
  { icon:"✦", title:"Atelier Access",        desc:"Work alongside master craftspeople in our BKC studio." },
  { icon:"◈", title:"Learning Allowance",     desc:"₹60,000/year for courses, conferences, and workshops." },
  { icon:"◉", title:"Employee Wardrobe",      desc:"Generous seasonal clothing allowance on MAISON collections." },
  { icon:"◐", title:"Health & Wellness",      desc:"Comprehensive medical cover for you and your immediate family." },
  { icon:"◇", title:"Flexible Work",          desc:"Hybrid and remote options across most roles." },
  { icon:"◆", title:"ESOP Programme",         desc:"Equity participation for senior roles and long-tenure employees." },
];

export default function CareersPage() {
  const [dept, setDept] = useState("All");
  const filtered = dept === "All" ? ROLES : ROLES.filter(r => r.dept === dept);

  return (
    <div style={{ minHeight:"100vh", background:C.bg, paddingTop:100 }}>
      {/* Hero */}
      <div style={{ textAlign:"center", padding:"48px 20px 60px" }}>
        <div style={{ fontSize:"9.5px", letterSpacing:"0.28em", color:C.gold, marginBottom:14 }}>JOIN THE ATELIER</div>
        <h1 style={{ fontFamily:"'DM Serif Display',Georgia,serif", fontSize:"clamp(36px,5vw,60px)", fontWeight:400, color:"#fff", marginBottom:16 }}>Build Luxury With Us</h1>
        <GoldBar centered />
        <p style={{ fontSize:15, color:"rgba(255,255,255,0.45)", maxWidth:520, margin:"0 auto", lineHeight:1.9 }}>
          We're a small team obsessed with craft, code, and customer delight. If you believe Indian luxury deserves a global stage, we'd love to hear from you.
        </p>
      </div>

      {/* Perks */}
      <div style={{ maxWidth:1100, margin:"0 auto 80px", padding:"0 24px" }}>
        <div style={{ textAlign:"center", marginBottom:40 }}>
          <div style={{ fontSize:"9.5px", letterSpacing:"0.28em", color:C.gold, marginBottom:10 }}>WHY MAISON</div>
          <h2 style={{ fontFamily:"'DM Serif Display',Georgia,serif", fontSize:32, color:"#fff", fontWeight:400 }}>Life at the Atelier</h2>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:20 }}>
          {PERKS.map(p=>(
            <div key={p.title} style={{ padding:"28px 28px", border:"1px solid rgba(201,168,76,0.12)", background:"rgba(201,168,76,0.03)" }}>
              <div style={{ fontSize:22, color:C.gold, marginBottom:14 }}>{p.icon}</div>
              <div style={{ fontFamily:"'DM Serif Display',Georgia,serif", fontSize:18, color:"#fff", marginBottom:8 }}>{p.title}</div>
              <div style={{ fontFamily:"'DM Sans',system-ui,sans-serif", fontSize:14, color:"rgba(255,255,255,0.45)", lineHeight:1.7 }}>{p.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Open roles */}
      <div style={{ maxWidth:1000, margin:"0 auto 100px", padding:"0 24px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:16, marginBottom:36 }}>
          <h2 style={{ fontFamily:"'DM Serif Display',Georgia,serif", fontSize:30, color:"#fff", fontWeight:400 }}>Open Roles</h2>
          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
            {DEPTS.map(d=>(
              <button key={d} onClick={()=>setDept(d)}
                style={{ padding:"8px 18px", border:`1px solid ${dept===d?C.gold:"rgba(201,168,76,0.2)"}`,
                  background: dept===d?"rgba(201,168,76,0.1)":"transparent",
                  color: dept===d?C.gold:"rgba(255,255,255,0.4)",
                  fontFamily:"'DM Sans',system-ui,sans-serif", fontSize:11,
                  letterSpacing:"0.1em", cursor:"pointer" }}>
                {d.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
          {filtered.map((r,i)=>(
            <div key={i} style={{ borderTop:"1px solid rgba(201,168,76,0.12)",
              padding:"28px 0", display:"flex", justifyContent:"space-between",
              alignItems:"center", flexWrap:"wrap", gap:16 }}>
              <div style={{ flex:1 }}>
                <div style={{ fontFamily:"'DM Sans',system-ui,sans-serif", fontSize:"10px", letterSpacing:"0.18em", color:C.gold, marginBottom:6 }}>{r.dept.toUpperCase()}</div>
                <div style={{ fontFamily:"'DM Serif Display',Georgia,serif", fontSize:20, color:"#fff", marginBottom:6 }}>{r.title}</div>
                <div style={{ fontFamily:"'DM Sans',system-ui,sans-serif", fontSize:13, color:"rgba(255,255,255,0.35)", marginBottom:8 }}>{r.loc}</div>
                <div style={{ fontFamily:"'DM Sans',system-ui,sans-serif", fontSize:14, color:"rgba(255,255,255,0.5)", lineHeight:1.7 }}>{r.desc}</div>
              </div>
              <a href={`mailto:careers@maison.in?subject=Application — ${r.title}`}
                style={{ padding:"12px 28px", border:`1px solid ${C.gold}`,
                  color:C.gold, background:"transparent", textDecoration:"none",
                  fontFamily:"'DM Sans',system-ui,sans-serif", fontSize:11,
                  letterSpacing:"0.12em", whiteSpace:"nowrap",
                  transition:"all 0.2s" }}>
                APPLY NOW
              </a>
            </div>
          ))}
          <div style={{ borderTop:"1px solid rgba(201,168,76,0.12)" }}/>
        </div>

        {/* General applications */}
        <div style={{ textAlign:"center", marginTop:64, padding:"40px 32px",
          border:"1px solid rgba(201,168,76,0.15)", background:"rgba(201,168,76,0.03)" }}>
          <div style={{ fontSize:"9.5px", letterSpacing:"0.28em", color:C.gold, marginBottom:12 }}>DON'T SEE YOUR ROLE?</div>
          <h3 style={{ fontFamily:"'DM Serif Display',Georgia,serif", fontSize:24, color:"#fff", fontWeight:400, marginBottom:12 }}>Send a General Application</h3>
          <p style={{ fontFamily:"'DM Sans',system-ui,sans-serif", fontSize:14, color:"rgba(255,255,255,0.45)", marginBottom:24 }}>
            We're always interested in exceptional talent. Send your portfolio and CV to careers@maison.in
          </p>
          <a href="mailto:careers@maison.in"
            style={{ display:"inline-block", padding:"14px 36px", background:C.gold,
              color:"#0a0603", fontFamily:"'DM Sans',system-ui,sans-serif",
              fontSize:11, letterSpacing:"0.14em", fontWeight:600, textDecoration:"none" }}>
            GET IN TOUCH
          </a>
        </div>
      </div>
    </div>
  );
}
