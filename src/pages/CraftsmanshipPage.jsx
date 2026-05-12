import { C, GoldBar } from "../components/shared";

const STEPS = [
  { num:"01", title:"Fabric Selection", body:"Every season begins in the heart of India's weaving villages. Our design team visits Varanasi, Kutch, Dharmavaram, and Pochampally to hand-select fabrics directly from artisan looms — no intermediaries, no compromise on provenance." },
  { num:"02", title:"Pattern & Drape", body:"Our senior pattern makers work exclusively in muslin before a single metre of finished fabric is cut. Each silhouette goes through a minimum of three toile iterations until the drape, proportion, and ease are perfect." },
  { num:"03", title:"Hand Cutting",     body:"All cutting is done by hand using French-curve rulers and tailor's shears. We do not use die-cutting machines. Every seam allowance is marked by hand to preserve the integrity of the grain." },
  { num:"04", title:"Tailoring",        body:"Our in-house tailors are trained in both classic Savile Row construction and traditional Indian darzi techniques. Lapels are hand-padded. Collars are hand-rolled. Linings are hand-sewn." },
  { num:"05", title:"Embellishment",    body:"For embroidered pieces, we work with fourth-generation karigars from Lucknow and Bhopal. Every motif is hand-drawn, hand-embroidered, and quality-checked under 10x magnification before the garment moves forward." },
  { num:"06", title:"Final QC",         body:"Each finished garment is pressed, measured against the original specification sheet, and inspected under natural light. Any piece that doesn't meet our standards is sent back for rework — never to the customer." },
];

const NUMBERS = [
  { val:"40–80",  unit:"hours",   label:"Per tailored garment" },
  { val:"4th",    unit:"gen.",    label:"Artisan families we work with" },
  { val:"12",     unit:"states",  label:"Sourcing regions across India" },
  { val:"0",      unit:"%",       label:"Machine-cut finished pieces" },
];

export default function CraftsmanshipPage() {
  return (
    <div style={{ minHeight:"100vh", background:C.bg, paddingTop:100 }}>
      {/* Hero */}
      <div style={{ textAlign:"center", padding:"48px 20px 60px" }}>
        <div style={{ fontSize:"9.5px", letterSpacing:"0.28em", color:C.gold, marginBottom:14 }}>THE MAISON METHOD</div>
        <h1 style={{ fontFamily:"'DM Serif Display',Georgia,serif", fontSize:"clamp(36px,5vw,60px)", fontWeight:400, color:"#fff", marginBottom:16 }}>Craftsmanship</h1>
        <GoldBar centered />
        <p style={{ fontSize:15, color:"rgba(255,255,255,0.45)", maxWidth:560, margin:"0 auto", lineHeight:1.9 }}>
          Every MAISON garment is a record of human skill. We believe the marks of the hand — the slight irregularities, the careful tensions — are not flaws, but signatures.
        </p>
      </div>

      {/* Numbers */}
      <div style={{ maxWidth:1000, margin:"0 auto 80px", padding:"0 24px" }}>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:1, border:"1px solid rgba(201,168,76,0.12)" }}>
          {NUMBERS.map(n=>(
            <div key={n.label} style={{ padding:"36px 28px", background:"rgba(201,168,76,0.02)", textAlign:"center", borderRight:"1px solid rgba(201,168,76,0.08)" }}>
              <div style={{ display:"flex", alignItems:"baseline", justifyContent:"center", gap:4, marginBottom:8 }}>
                <span style={{ fontFamily:"'DM Serif Display',Georgia,serif", fontSize:42, color:C.gold, lineHeight:1 }}>{n.val}</span>
                <span style={{ fontFamily:"'DM Sans',system-ui,sans-serif", fontSize:13, color:"rgba(201,168,76,0.6)" }}>{n.unit}</span>
              </div>
              <div style={{ fontFamily:"'DM Sans',system-ui,sans-serif", fontSize:11, letterSpacing:"0.12em", color:"rgba(255,255,255,0.3)" }}>{n.label.toUpperCase()}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Process steps */}
      <div style={{ maxWidth:960, margin:"0 auto 80px", padding:"0 24px" }}>
        <div style={{ textAlign:"center", marginBottom:56 }}>
          <div style={{ fontSize:"9.5px", letterSpacing:"0.28em", color:C.gold, marginBottom:10 }}>FROM LOOM TO WARDROBE</div>
          <h2 style={{ fontFamily:"'DM Serif Display',Georgia,serif", fontSize:32, color:"#fff", fontWeight:400 }}>How a MAISON Garment Is Made</h2>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
          {STEPS.map((s,i)=>(
            <div key={s.num} style={{ display:"grid", gridTemplateColumns:"80px 1fr",
              borderTop:"1px solid rgba(201,168,76,0.12)", padding:"36px 0", gap:32 }}>
              <div>
                <div style={{ fontFamily:"'DM Serif Display',Georgia,serif", fontSize:36, color:"rgba(201,168,76,0.2)", lineHeight:1 }}>{s.num}</div>
              </div>
              <div>
                <h3 style={{ fontFamily:"'DM Serif Display',Georgia,serif", fontSize:22, color:C.gold, fontWeight:400, marginBottom:14 }}>{s.title}</h3>
                <p style={{ fontFamily:"'DM Sans',system-ui,sans-serif", fontSize:15, color:"rgba(255,255,255,0.55)", lineHeight:1.9, margin:0 }}>{s.body}</p>
              </div>
            </div>
          ))}
          <div style={{ borderTop:"1px solid rgba(201,168,76,0.12)" }}/>
        </div>
      </div>

      {/* Closing quote */}
      <div style={{ maxWidth:700, margin:"0 auto 100px", padding:"0 24px", textAlign:"center" }}>
        <div style={{ width:40, height:1, background:C.gold, margin:"0 auto 28px" }}/>
        <blockquote style={{ fontFamily:"'DM Serif Display',Georgia,serif", fontSize:"clamp(20px,3vw,28px)",
          fontStyle:"italic", color:"rgba(255,255,255,0.7)", lineHeight:1.7, margin:"0 0 20px" }}>
          "A garment that is made well will outlast fashion. That is the only luxury that matters."
        </blockquote>
        <div style={{ fontFamily:"'DM Sans',system-ui,sans-serif", fontSize:11, letterSpacing:"0.18em", color:C.gold }}>
          — MAISON ATELIER PRINCIPLE
        </div>
        <div style={{ width:40, height:1, background:C.gold, margin:"28px auto 0" }}/>
      </div>
    </div>
  );
}
