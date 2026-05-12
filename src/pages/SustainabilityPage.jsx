import { C, GoldBar } from "../components/shared";

const PILLARS = [
  {
    icon:"◈",
    title:"Artisan-First Sourcing",
    body:"Every fabric we use is sourced directly from weaving communities across India — Varanasi silk weavers, Kutch embroiderers, Dharmavaram handloom cooperatives. No middlemen. Fair wages, fair trade.",
    stat:"1,200+", statLabel:"Artisan families supported",
  },
  {
    icon:"◉",
    title:"Natural & Recycled Fibres",
    body:"Over 80% of our materials are natural (silk, wool, cotton, linen) or certified recycled. We are actively phasing out virgin synthetic fibres from our core collections by 2027.",
    stat:"80%+", statLabel:"Natural or recycled materials",
  },
  {
    icon:"◐",
    title:"Zero Waste Packaging",
    body:"Our signature black boxes are made from 100% recycled board. Tissue paper is FSC-certified. Mailers are compostable. We eliminated single-use plastic from our packaging in 2024.",
    stat:"0",  statLabel:"Single-use plastics in packaging",
  },
  {
    icon:"◇",
    title:"Carbon Conscious Delivery",
    body:"We offset 100% of domestic shipment emissions through certified Indian reforestation projects in the Western Ghats. International shipments are offset via Gold Standard carbon credits.",
    stat:"100%", statLabel:"Domestic shipments offset",
  },
  {
    icon:"✦",
    title:"Slow Fashion Philosophy",
    body:"We don't do weekly drops. Our collections are seasonal and intentional — designed to last years, not trends. We would rather sell fewer pieces than contribute to fast fashion waste.",
    stat:"2", statLabel:"Collections per year",
  },
  {
    icon:"◆",
    title:"Repair & Rewear Programme",
    body:"MAISON offers free garment repairs for the life of the product. Bring any piece back to our Mumbai atelier and our craftspeople will restore it to perfect condition.",
    stat:"Free",  statLabel:"Lifetime repairs for all garments",
  },
];

const GOALS = [
  { year:"2024", done:true,  goal:"Eliminate all single-use plastic packaging" },
  { year:"2025", done:true,  goal:"Achieve 80% natural/recycled material ratio" },
  { year:"2026", done:false, goal:"100% renewable energy at BKC atelier" },
  { year:"2027", done:false, goal:"Full supply chain transparency report published" },
  { year:"2028", done:false, goal:"Net-zero scope 1 & 2 emissions" },
  { year:"2030", done:false, goal:"Carbon negative across entire value chain" },
];

export default function SustainabilityPage() {
  return (
    <div style={{ minHeight:"100vh", background:C.bg, paddingTop:100 }}>
      {/* Hero */}
      <div style={{ textAlign:"center", padding:"48px 20px 60px" }}>
        <div style={{ fontSize:"9.5px", letterSpacing:"0.28em", color:C.gold, marginBottom:14 }}>OUR COMMITMENT</div>
        <h1 style={{ fontFamily:"'DM Serif Display',Georgia,serif", fontSize:"clamp(36px,5vw,60px)", fontWeight:400, color:"#fff", marginBottom:16 }}>Sustainability</h1>
        <GoldBar centered />
        <p style={{ fontSize:15, color:"rgba(255,255,255,0.45)", maxWidth:560, margin:"0 auto", lineHeight:1.9 }}>
          Luxury and responsibility are not in conflict. At MAISON, every choice — from the thread we source to the box we ship in — is made with craft, community, and the planet in mind.
        </p>
      </div>

      {/* Pillars */}
      <div style={{ maxWidth:1100, margin:"0 auto 80px", padding:"0 24px" }}>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))", gap:20 }}>
          {PILLARS.map(p=>(
            <div key={p.title} style={{ padding:"36px 32px", border:"1px solid rgba(201,168,76,0.12)", background:"rgba(201,168,76,0.025)" }}>
              <div style={{ fontSize:24, color:C.gold, marginBottom:16 }}>{p.icon}</div>
              <h3 style={{ fontFamily:"'DM Serif Display',Georgia,serif", fontSize:20, color:"#fff", fontWeight:400, marginBottom:12 }}>{p.title}</h3>
              <p style={{ fontFamily:"'DM Sans',system-ui,sans-serif", fontSize:14, color:"rgba(255,255,255,0.5)", lineHeight:1.8, marginBottom:24 }}>{p.body}</p>
              <div style={{ borderTop:"1px solid rgba(201,168,76,0.12)", paddingTop:16 }}>
                <div style={{ fontFamily:"'DM Serif Display',Georgia,serif", fontSize:30, color:C.gold }}>{p.stat}</div>
                <div style={{ fontFamily:"'DM Sans',system-ui,sans-serif", fontSize:11, letterSpacing:"0.1em", color:"rgba(255,255,255,0.3)" }}>{p.statLabel.toUpperCase()}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Roadmap */}
      <div style={{ maxWidth:760, margin:"0 auto 100px", padding:"0 24px" }}>
        <div style={{ textAlign:"center", marginBottom:48 }}>
          <div style={{ fontSize:"9.5px", letterSpacing:"0.28em", color:C.gold, marginBottom:10 }}>THE ROAD AHEAD</div>
          <h2 style={{ fontFamily:"'DM Serif Display',Georgia,serif", fontSize:32, color:"#fff", fontWeight:400 }}>Our Sustainability Roadmap</h2>
        </div>
        <div style={{ borderLeft:"1px solid rgba(201,168,76,0.15)", paddingLeft:32 }}>
          {GOALS.map((g,i)=>(
            <div key={i} style={{ position:"relative", paddingBottom:32 }}>
              <div style={{ position:"absolute", left:-40, top:4, width:14, height:14, borderRadius:"50%",
                background: g.done ? C.gold : "#1a1208",
                border:`2px solid ${g.done ? C.gold : "rgba(201,168,76,0.3)"}`,
                display:"flex", alignItems:"center", justifyContent:"center" }}>
                {g.done && <span style={{ color:"#0a0603", fontSize:8, fontWeight:900 }}>✓</span>}
              </div>
              <div style={{ display:"flex", gap:16, alignItems:"baseline", flexWrap:"wrap" }}>
                <span style={{ fontFamily:"'DM Sans',system-ui,sans-serif", fontSize:11, letterSpacing:"0.14em",
                  color: g.done ? C.gold : "rgba(255,255,255,0.25)", minWidth:36 }}>{g.year}</span>
                <span style={{ fontFamily:"'DM Sans',system-ui,sans-serif", fontSize:15,
                  color: g.done ? "#fff" : "rgba(255,255,255,0.45)" }}>{g.goal}</span>
                {g.done && <span style={{ fontFamily:"'DM Sans',system-ui,sans-serif", fontSize:10,
                  letterSpacing:"0.1em", color:"#5cba85", background:"rgba(92,186,133,0.1)",
                  padding:"2px 8px", border:"1px solid rgba(92,186,133,0.2)" }}>ACHIEVED</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
