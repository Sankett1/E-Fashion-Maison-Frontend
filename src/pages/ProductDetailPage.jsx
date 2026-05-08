import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { C } from "../components/shared";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { getProductById, toggleWishlist } from "../api/productApi";

// ─── Icons ────────────────────────────────────────────────────────────────────
const StarIcon = ({ filled }) => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill={filled ? C.gold : "none"} stroke={C.gold} strokeWidth="1.5">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);
const ChevronIcon = ({ dir }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    {dir === "right" ? <path d="M9 18l6-6-6-6"/> : <path d="M15 18l-6-6 6-6"/>}
  </svg>
);
const RulerIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
    <path d="M21.3 15.3L15.3 21.3a2 2 0 0 1-2.8 0L2.7 11.5a2 2 0 0 1 0-2.8L8.7 2.7a2 2 0 0 1 2.8 0l9.8 9.8a2 2 0 0 1 0 2.8z"/>
    <path d="M7.5 10.5l1.5 1.5M10.5 7.5l1.5 1.5M13.5 4.5l1.5 1.5M4.5 13.5l1.5 1.5"/>
  </svg>
);
const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
    <path d="M18 6L6 18M6 6l12 12"/>
  </svg>
);

const Spinner = () => (
  <div style={{ minHeight:"60vh", display:"flex", alignItems:"center", justifyContent:"center" }}>
    <div style={{ width:36, height:36, border:`2px solid ${C.gold}`, borderTopColor:"transparent", borderRadius:"50%", animation:"pdSpin 0.8s linear infinite" }}/>
    <style>{`@keyframes pdSpin{to{transform:rotate(360deg)}}`}</style>
  </div>
);

const GRADS = [
  "linear-gradient(160deg,#c8b080 0%,#a89060 50%,#806840 100%)",
  "linear-gradient(160deg,#e8e0d0 0%,#d8c8b8 50%,#c0b098 100%)",
  "linear-gradient(160deg,#8a6228 0%,#7a5218 50%,#6a4208 100%)",
];

// ─── Color name helper ────────────────────────────────────────────────────────
// Maps CSS color strings or hex values to readable names
const colorNameMap = {
  "#000000":"Noir Black", "#ffffff":"Ivory White", "#fff":"Ivory White",
  "#000":"Noir Black", black:"Noir Black", white:"Ivory White",
  "#1a1208":"Dark Mahogany", "#c9a84c":"Maison Gold", "#8a6228":"Caramel Brown",
  "#f5f0eb":"Linen Cream", "#d4a04a":"Warm Amber", navy:"Midnight Navy",
  "#001f3f":"Midnight Navy", beige:"Sand Beige", cream:"Ivory Cream",
  ivory:"Ivory", "#f5deb3":"Wheat", "#ffe4c4":"Bisque Peach",
  "#deb887":"Burlywood", "#d2691e":"Cinnamon", "#8b4513":"Saddle Brown",
  "#a0522d":"Sienna", "#808080":"Slate Grey", grey:"Slate Grey", gray:"Slate Grey",
  "#2f4f4f":"Dark Slate", "#556b2f":"Olive", "#6b8e23":"Moss Green",
  "#4682b4":"Steel Blue", "#b0c4de":"Light Steel Blue", "#6a5acd":"Lavender",
  "#800020":"Burgundy", "#722f37":"Wine", "#dc143c":"Crimson", red:"Scarlet Red",
  blue:"Classic Blue", "#0000ff":"Classic Blue", "#4169e1":"Royal Blue",
  green:"Forest Green", "#008000":"Forest Green",
  "#ff69b4":"Rose Pink", pink:"Blush Pink", "#ffb6c1":"Blush Pink",
  "#ffdab9":"Peach",
};
const getColorName = (c) => {
  if (!c) return "Color";
  const key = c.toLowerCase().trim();
  return colorNameMap[key] || (c.startsWith("#") ? `Shade ${c.toUpperCase()}` : c.charAt(0).toUpperCase() + c.slice(1));
};

// ─── Size & Fit Guide data ────────────────────────────────────────────────────
const SIZE_DATA = {
  Women: {
    chart: [
      { size:"XS", chest:"79–82", waist:"61–64", hips:"87–90", ukus:"US 2 / UK 6" },
      { size:"S",  chest:"83–86", waist:"65–68", hips:"91–94", ukus:"US 4 / UK 8" },
      { size:"M",  chest:"87–91", waist:"69–73", hips:"95–99", ukus:"US 6 / UK 10" },
      { size:"L",  chest:"92–97", waist:"74–79", hips:"100–105", ukus:"US 8–10 / UK 12–14" },
      { size:"XL", chest:"98–104", waist:"80–86", hips:"106–112", ukus:"US 12 / UK 16" },
      { size:"XXL",chest:"105–112", waist:"87–94", hips:"113–120", ukus:"US 14 / UK 18" },
    ],
    tips: [
      { icon:"📐", title:"Bust", tip:"Measure the fullest part of your chest, keeping the tape parallel to the ground." },
      { icon:"⬜", title:"Waist", tip:"Measure at your natural waistline, the narrowest point, usually 2–3 cm above your navel." },
      { icon:"📏", title:"Hips", tip:"Measure the fullest part of your hips and seat, approximately 20 cm below your waist." },
    ],
    fit: [
      { label:"Relaxed Fit", desc:"1–3 cm ease — loose, laid-back silhouette." },
      { label:"Regular Fit", desc:"2–5 cm ease — classic, comfortable everyday wear." },
      { label:"Slim Fit",    desc:"0–2 cm ease — close to the body, tailored look." },
    ],
    model: "Model is 5'8\" (173 cm), 60 kg, and wears size S.",
  },
  Men: {
    chart: [
      { size:"XS",  chest:"86–89", waist:"73–76", hips:"—",   ukus:"EU 44" },
      { size:"S",   chest:"90–94", waist:"77–80", hips:"—",   ukus:"EU 46" },
      { size:"M",   chest:"95–99", waist:"81–85", hips:"—",   ukus:"EU 48–50" },
      { size:"L",   chest:"100–104", waist:"86–90", hips:"—", ukus:"EU 52" },
      { size:"XL",  chest:"105–110", waist:"91–96", hips:"—", ukus:"EU 54" },
      { size:"XXL", chest:"111–117", waist:"97–103", hips:"—",ukus:"EU 56" },
    ],
    tips: [
      { icon:"📐", title:"Chest",     tip:"Measure the fullest part of your chest, under your arms. Keep tape firm but not tight." },
      { icon:"⬜", title:"Waist",     tip:"Measure at your natural waistline. Stand relaxed — don't suck in." },
      { icon:"📏", title:"Shoulders", tip:"Measure across the back from shoulder seam to shoulder seam while wearing a well-fitted shirt." },
    ],
    fit: [
      { label:"Regular Fit",  desc:"2–5 cm ease — traditional, balanced silhouette." },
      { label:"Slim Fit",     desc:"0–3 cm ease — contemporary, cut close to the body." },
      { label:"Relaxed Fit",  desc:"5+ cm ease — oversized, unstructured feel." },
    ],
    model: "Model is 6'1\" (185 cm), 78 kg, and wears size M.",
  },
  Accessories: {
    chart: [
      { size:"XS/S",   chest:"Wrist: ≤15 cm",   waist:"Head: ≤55 cm", hips:"Waist: ≤70 cm", ukus:"—" },
      { size:"S/M",    chest:"Wrist: 15–17 cm",  waist:"Head: 55–57 cm",hips:"Waist: 70–80 cm",ukus:"—" },
      { size:"M/L",    chest:"Wrist: 17–19 cm",  waist:"Head: 57–59 cm",hips:"Waist: 80–90 cm",ukus:"—" },
      { size:"L/XL",   chest:"Wrist: 19–21 cm",  waist:"Head: 59–61 cm",hips:"Waist: 90–100 cm",ukus:"—" },
      { size:"One Size",chest:"Adjustable",       waist:"Adjustable",   hips:"Adjustable",    ukus:"Universal" },
    ],
    tips: [
      { icon:"📐", title:"Wrist",    tip:"Measure your wrist circumference just above the wrist bone for bangles and bracelets." },
      { icon:"⬜", title:"Head",     tip:"Measure around the fullest part of your head, about 1 cm above your ears, for hats." },
      { icon:"📏", title:"Shoulder", tip:"For bags and scarves, measure across the back from shoulder bone to shoulder bone." },
    ],
    fit: [
      { label:"Belt & Waist", desc:"Order your usual trouser/skirt waist size. Our belts have 5 holes for adjustability." },
      { label:"Hats & Caps",  desc:"We offer S/M (55–57 cm) and L/XL (58–60 cm). Most styles are adjustable." },
      { label:"Scarves & Wraps", desc:"All scarves are one-size. See individual product pages for dimensions." },
    ],
    model: "All measurements are in centimetres. Accessories are predominantly one-size or adjustable.",
  },
};

// Numeric trouser sizes
const TROUSER_DATA = [
  { size:"28", waist:"71–73 cm", inseam:"76–79 cm", hip:"91–94 cm" },
  { size:"30", waist:"76–78 cm", inseam:"79–81 cm", hip:"96–99 cm" },
  { size:"32", waist:"81–83 cm", inseam:"81–84 cm", hip:"101–104 cm" },
  { size:"34", waist:"86–88 cm", inseam:"82–85 cm", hip:"106–109 cm" },
  { size:"36", waist:"91–93 cm", inseam:"83–86 cm", hip:"111–114 cm" },
  { size:"38", waist:"96–98 cm", inseam:"84–87 cm", hip:"116–119 cm" },
];

// Shoe sizes (UK / EU / US)
const SHOE_DATA = [
  { uk:"3",  eu:"36", us_w:"5",  us_m:"—", cm:"22.5" },
  { uk:"4",  eu:"37", us_w:"6",  us_m:"—", cm:"23.5" },
  { uk:"5",  eu:"38", us_w:"7",  us_m:"5.5",cm:"24" },
  { uk:"6",  eu:"39", us_w:"8",  us_m:"6.5",cm:"24.5" },
  { uk:"7",  eu:"40", us_w:"9",  us_m:"7.5",cm:"25.5" },
  { uk:"8",  eu:"41", us_w:"10", us_m:"8",  cm:"26" },
  { uk:"9",  eu:"42", us_w:"11", us_m:"9",  cm:"27" },
  { uk:"10", eu:"43", us_w:"—",  us_m:"10", cm:"27.5" },
  { uk:"11", eu:"44", us_w:"—",  us_m:"11", cm:"28.5" },
];

// ─── Size & Fit Guide Drawer ──────────────────────────────────────────────────
function SizeGuideDrawer({ category, onClose }) {
  const [unit,    setUnit]    = useState("cm");
  const [section, setSection] = useState("garments");
  const data = SIZE_DATA[category] || SIZE_DATA.Women;

  const isShoeCategory = category === "Accessories";
  const hasTrouser     = category === "Men";

  const convertMeasurement = (val) => {
    if (unit === "in" && typeof val === "string" && val.includes("–")) {
      const [a, b] = val.split("–");
      return `${(+a * 0.394).toFixed(1)}–${(+b * 0.394).toFixed(1)}`;
    }
    return val;
  };

  const thStyle  = { padding:"10px 14px", fontFamily:"'Cormorant Garamond',serif", fontSize:10, letterSpacing:"0.18em", color:"rgba(255,255,255,0.35)", textAlign:"left", borderBottom:"1px solid rgba(201,168,76,0.2)", whiteSpace:"nowrap" };
  const tdStyle  = { padding:"11px 14px", fontFamily:"'Cormorant Garamond',serif", fontSize:13, color:"rgba(255,255,255,0.75)", borderBottom:"1px solid rgba(255,255,255,0.04)" };
  const sizeTd   = { ...tdStyle, fontFamily:"'Playfair Display',serif", fontSize:15, color:C.gold };

  return (
    <>
      {/* Backdrop */}
      <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.6)", zIndex:9000, backdropFilter:"blur(3px)" }}
        onClick={onClose} />

      {/* Drawer */}
      <div style={{
        position:"fixed", top:0, right:0, bottom:0, zIndex:9001,
        width:"min(620px, 100vw)", background:"#0d0a06",
        borderLeft:"1px solid rgba(201,168,76,0.2)",
        overflowY:"auto", animation:"drawerSlide 0.35s cubic-bezier(0.23,1,0.32,1)",
      }}>
        <style>{`
          @keyframes drawerSlide { from{transform:translateX(100%)} to{transform:translateX(0)} }
          .sg-tab { padding:9px 16px; background:none; border:none; cursor:pointer; font:300 9px/1 'Cormorant Garamond',serif; letter-spacing:.18em; border-bottom:2px solid transparent; color:rgba(255,255,255,0.35); transition:all .2s; }
          .sg-tab.on { color:#c9a84c; border-bottom-color:#c9a84c; }
          .sg-tab:hover:not(.on){color:rgba(255,255,255,.6);}
          .sg-tip-card:hover { border-color:rgba(201,168,76,0.35) !important; background:rgba(201,168,76,0.05) !important; }
        `}</style>

        {/* Header */}
        <div style={{ position:"sticky", top:0, background:"#0d0a06", zIndex:10, borderBottom:"1px solid rgba(201,168,76,0.15)", padding:"22px 28px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div>
            <div style={{ fontFamily:"'Playfair Display',serif", fontSize:22, color:"#fff", fontWeight:400 }}>Size & Fit Guide</div>
            <div style={{ fontSize:9.5, letterSpacing:"0.22em", color:"rgba(255,255,255,0.3)", marginTop:3 }}>
              {(category || "CLOTHING").toUpperCase()} · MEASUREMENTS IN {unit.toUpperCase()}
            </div>
          </div>
          <button onClick={onClose} style={{ width:38, height:38, background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:"rgba(255,255,255,0.5)", transition:"all 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor=C.gold; e.currentTarget.style.color=C.gold; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor="rgba(255,255,255,0.1)"; e.currentTarget.style.color="rgba(255,255,255,0.5)"; }}>
            <CloseIcon/>
          </button>
        </div>

        {/* cm / inch toggle */}
        <div style={{ padding:"16px 28px", display:"flex", gap:8, alignItems:"center" }}>
          {["cm","in"].map(u => (
            <button key={u} onClick={() => setUnit(u)} style={{ padding:"6px 18px", background:unit===u?"rgba(201,168,76,0.15)":"transparent", border:`1px solid ${unit===u?C.gold:"rgba(255,255,255,0.1)"}`, color:unit===u?C.gold:"rgba(255,255,255,0.4)", fontFamily:"'Cormorant Garamond',serif", fontSize:10, letterSpacing:"0.14em", cursor:"pointer", transition:"all 0.2s" }}>
              {u.toUpperCase()}
            </button>
          ))}
          <span style={{ fontSize:10, color:"rgba(255,255,255,0.25)", marginLeft:8, letterSpacing:"0.1em" }}>SELECT UNIT</span>
        </div>

        {/* Section tabs */}
        <div style={{ display:"flex", borderBottom:"1px solid rgba(201,168,76,0.12)", padding:"0 16px" }}>
          {[
            { key:"garments", label:"Garments" },
            ...(hasTrouser ? [{ key:"trousers", label:"Trousers / Bottoms" }] : []),
            ...(isShoeCategory ? [] : [{ key:"shoes", label:"Footwear" }]),
            { key:"howto", label:"How to Measure" },
            { key:"fit",   label:"Fit Guide" },
          ].map(t => (
            <button key={t.key} className={`sg-tab${section===t.key?" on":""}`} onClick={() => setSection(t.key)}>
              {t.label.toUpperCase()}
            </button>
          ))}
        </div>

        <div style={{ padding:"24px 28px 48px" }}>

          {/* ── Garment size chart ── */}
          {section === "garments" && (
            <div>
              <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:13, color:"rgba(255,255,255,0.4)", lineHeight:1.7, marginBottom:20 }}>
                All measurements refer to <strong style={{ color:"rgba(255,255,255,0.65)" }}>body measurements</strong>, not garment dimensions. For a perfect fit, measure your body and match it to the table below.
              </p>
              <div style={{ overflowX:"auto" }}>
                <table style={{ width:"100%", borderCollapse:"collapse", borderTop:"1px solid rgba(201,168,76,0.2)" }}>
                  <thead>
                    <tr style={{ background:"rgba(201,168,76,0.06)" }}>
                      <th style={thStyle}>SIZE</th>
                      <th style={thStyle}>CHEST ({unit})</th>
                      <th style={thStyle}>WAIST ({unit})</th>
                      <th style={{ ...thStyle, display: category==="Men"?"none":"" }}>HIPS ({unit})</th>
                      <th style={thStyle}>INT'L</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.chart.map((row, i) => (
                      <tr key={row.size} style={{ background:i%2===0?"transparent":"rgba(255,255,255,0.02)" }}>
                        <td style={sizeTd}>{row.size}</td>
                        <td style={tdStyle}>{convertMeasurement(row.chest)}</td>
                        <td style={tdStyle}>{convertMeasurement(row.waist)}</td>
                        <td style={{ ...tdStyle, display: category==="Men"?"none":"" }}>{convertMeasurement(row.hips)}</td>
                        <td style={{ ...tdStyle, color:"rgba(255,255,255,0.45)" }}>{row.ukus}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{ marginTop:16, padding:"12px 16px", background:"rgba(201,168,76,0.04)", border:"1px solid rgba(201,168,76,0.12)", display:"flex", gap:10, alignItems:"flex-start" }}>
                <span style={{ fontSize:16, flexShrink:0 }}>👤</span>
                <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:12, color:"rgba(255,255,255,0.4)", lineHeight:1.6, margin:0 }}>
                  {data.model}
                </p>
              </div>
              <div style={{ marginTop:12, padding:"12px 16px", background:"rgba(122,184,122,0.05)", border:"1px solid rgba(122,184,122,0.15)" }}>
                <span style={{ fontSize:10, letterSpacing:"0.14em", color:"#7ab87a" }}>💡 BETWEEN SIZES?</span>
                <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:12, color:"rgba(255,255,255,0.4)", lineHeight:1.6, margin:"6px 0 0" }}>
                  If your measurements fall between two sizes, we recommend sizing up for a more relaxed fit, or sizing down for a more tailored look. All MAISON garments are cut with a small amount of ease built in.
                </p>
              </div>
            </div>
          )}

          {/* ── Trouser chart ── */}
          {section === "trousers" && (
            <div>
              <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:13, color:"rgba(255,255,255,0.4)", lineHeight:1.7, marginBottom:20 }}>
                For bottoms and trousers, measure your <strong style={{ color:"rgba(255,255,255,0.65)" }}>natural waist</strong> and <strong style={{ color:"rgba(255,255,255,0.65)" }}>inseam length</strong>.
              </p>
              <div style={{ overflowX:"auto" }}>
                <table style={{ width:"100%", borderCollapse:"collapse", borderTop:"1px solid rgba(201,168,76,0.2)" }}>
                  <thead>
                    <tr style={{ background:"rgba(201,168,76,0.06)" }}>
                      <th style={thStyle}>SIZE (IN)</th>
                      <th style={thStyle}>WAIST ({unit})</th>
                      <th style={thStyle}>INSEAM ({unit})</th>
                      <th style={thStyle}>HIP ({unit})</th>
                    </tr>
                  </thead>
                  <tbody>
                    {TROUSER_DATA.map((row, i) => (
                      <tr key={row.size} style={{ background:i%2===0?"transparent":"rgba(255,255,255,0.02)" }}>
                        <td style={sizeTd}>{row.size}"</td>
                        <td style={tdStyle}>{convertMeasurement(row.waist.replace(" cm",""))}</td>
                        <td style={tdStyle}>{convertMeasurement(row.inseam.replace(" cm",""))}</td>
                        <td style={tdStyle}>{convertMeasurement(row.hip.replace(" cm",""))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{ marginTop:16, padding:"12px 16px", background:"rgba(201,168,76,0.04)", border:"1px solid rgba(201,168,76,0.12)", fontSize:12, color:"rgba(255,255,255,0.4)", fontFamily:"'Cormorant Garamond',serif", lineHeight:1.6 }}>
                <strong style={{ color:"rgba(255,255,255,0.65)" }}>Inseam tip:</strong> For regular length trousers, we recommend an inseam of 76–81 cm. Long length: 82–86 cm. Short length: 70–75 cm.
              </div>
            </div>
          )}

          {/* ── Footwear chart ── */}
          {section === "shoes" && (
            <div>
              <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:13, color:"rgba(255,255,255,0.4)", lineHeight:1.7, marginBottom:20 }}>
                All MAISON footwear is designed and sized for the Indian and British markets. Measure your foot length for the most accurate conversion.
              </p>
              <div style={{ overflowX:"auto" }}>
                <table style={{ width:"100%", borderCollapse:"collapse", borderTop:"1px solid rgba(201,168,76,0.2)" }}>
                  <thead>
                    <tr style={{ background:"rgba(201,168,76,0.06)" }}>
                      <th style={thStyle}>FOOT ({unit})</th>
                      <th style={thStyle}>UK</th>
                      <th style={thStyle}>EU</th>
                      <th style={thStyle}>US WOMEN</th>
                      <th style={thStyle}>US MEN</th>
                    </tr>
                  </thead>
                  <tbody>
                    {SHOE_DATA.map((row, i) => (
                      <tr key={row.uk} style={{ background:i%2===0?"transparent":"rgba(255,255,255,0.02)" }}>
                        <td style={tdStyle}>{unit==="cm" ? row.cm : (+(row.cm)*0.394).toFixed(1)}</td>
                        <td style={sizeTd}>{row.uk}</td>
                        <td style={tdStyle}>{row.eu}</td>
                        <td style={tdStyle}>{row.us_w}</td>
                        <td style={tdStyle}>{row.us_m}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{ marginTop:16, padding:"12px 16px", background:"rgba(201,168,76,0.04)", border:"1px solid rgba(201,168,76,0.12)", fontSize:12, color:"rgba(255,255,255,0.4)", fontFamily:"'Cormorant Garamond',serif", lineHeight:1.6 }}>
                <strong style={{ color:"rgba(255,255,255,0.65)" }}>Pro tip:</strong> Measure your feet in the evening when they are at their largest. If you are between sizes, we recommend sizing up. MAISON footwear uses genuine leather that molds to the foot over time.
              </div>
            </div>
          )}

          {/* ── How to Measure ── */}
          {section === "howto" && (
            <div>
              <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:13, color:"rgba(255,255,255,0.4)", lineHeight:1.7, marginBottom:24 }}>
                Use a soft measuring tape for accurate results. Measure over light, form-fitting clothing or directly on skin. Keep the tape level and snug but not tight.
              </p>
              <div style={{ display:"flex", flexDirection:"column", gap:14, marginBottom:28 }}>
                {data.tips.map((tip, i) => (
                  <div key={i} className="sg-tip-card" style={{ display:"flex", gap:16, padding:"18px 20px", border:"1px solid rgba(201,168,76,0.12)", background:"rgba(255,255,255,0.01)", transition:"all 0.2s" }}>
                    <div style={{ fontSize:22, flexShrink:0 }}>{tip.icon}</div>
                    <div>
                      <div style={{ fontFamily:"'Playfair Display',serif", fontSize:15, color:"#fff", marginBottom:5 }}>{tip.title}</div>
                      <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:13, color:"rgba(255,255,255,0.45)", lineHeight:1.65 }}>{tip.tip}</div>
                    </div>
                  </div>
                ))}
              </div>
              {/* Diagram illustration (SVG body outline) */}
              <div style={{ border:"1px solid rgba(201,168,76,0.12)", padding:"24px", textAlign:"center" }}>
                <div style={{ fontSize:9.5, letterSpacing:"0.2em", color:"rgba(255,255,255,0.25)", marginBottom:16 }}>MEASUREMENT GUIDE</div>
                <svg viewBox="0 0 220 420" width="130" style={{ opacity:0.65 }}>
                  {/* Simple body outline */}
                  <ellipse cx="110" cy="55" rx="28" ry="35" fill="none" stroke={C.gold} strokeWidth="1.2"/>
                  {/* Neck */}
                  <line x1="97" y1="88" x2="97" y2="105" stroke={C.gold} strokeWidth="1.2"/>
                  <line x1="123" y1="88" x2="123" y2="105" stroke={C.gold} strokeWidth="1.2"/>
                  {/* Chest */}
                  <path d="M60 105 Q40 110 35 140 L40 200 Q50 210 110 210 Q170 210 180 200 L185 140 Q180 110 160 105 Q140 95 110 95 Q80 95 60 105Z" fill="none" stroke={C.gold} strokeWidth="1.2"/>
                  {/* Arms */}
                  <path d="M60 110 Q30 130 22 200" fill="none" stroke={C.gold} strokeWidth="1.2"/>
                  <path d="M160 110 Q190 130 198 200" fill="none" stroke={C.gold} strokeWidth="1.2"/>
                  {/* Waist */}
                  <line x1="45" y1="195" x2="175" y2="195" stroke="rgba(201,168,76,0.4)" strokeWidth="0.8" strokeDasharray="4,3"/>
                  {/* Hips */}
                  <path d="M40 210 Q35 240 38 280 L70 340 Q90 360 110 360 Q130 360 150 340 L182 280 Q185 240 180 210Z" fill="none" stroke={C.gold} strokeWidth="1.2"/>
                  {/* Legs */}
                  <line x1="70" y1="360" x2="65" y2="420" stroke={C.gold} strokeWidth="1.2"/>
                  <line x1="150" y1="360" x2="155" y2="420" stroke={C.gold} strokeWidth="1.2"/>
                  {/* Chest measurement arrow */}
                  <line x1="35" y1="145" x2="7" y2="145" stroke={C.gold} strokeWidth="0.8"/>
                  <text x="2" y="143" fill={C.gold} fontSize="9" textAnchor="middle">A</text>
                  {/* Waist arrow */}
                  <line x1="43" y1="195" x2="13" y2="195" stroke={C.gold} strokeWidth="0.8"/>
                  <text x="8" y="193" fill={C.gold} fontSize="9" textAnchor="middle">B</text>
                  {/* Hip arrow */}
                  <line x1="37" y1="250" x2="7" y2="250" stroke={C.gold} strokeWidth="0.8"/>
                  <text x="2" y="248" fill={C.gold} fontSize="9" textAnchor="middle">C</text>
                </svg>
                <div style={{ display:"flex", justifyContent:"center", gap:24, marginTop:16 }}>
                  {[["A","Chest/Bust"],["B","Waist"],["C","Hips"]].map(([k,v]) => (
                    <div key={k} style={{ textAlign:"center" }}>
                      <span style={{ fontFamily:"'Playfair Display',serif", fontSize:13, color:C.gold }}>{k}</span>
                      <div style={{ fontSize:9, letterSpacing:"0.14em", color:"rgba(255,255,255,0.3)", marginTop:2 }}>{v}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Fit Guide ── */}
          {section === "fit" && (
            <div>
              <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:13, color:"rgba(255,255,255,0.4)", lineHeight:1.7, marginBottom:24 }}>
                Fit describes how much extra room (ease) a garment has beyond your body measurements. Our garments are labelled with their intended fit on the product page.
              </p>
              <div style={{ display:"flex", flexDirection:"column", gap:12, marginBottom:28 }}>
                {data.fit.map((f, i) => (
                  <div key={i} style={{ padding:"20px 22px", border:"1px solid rgba(201,168,76,0.15)", background:"rgba(255,255,255,0.01)", position:"relative", overflow:"hidden" }}>
                    <div style={{ position:"absolute", left:0, top:0, bottom:0, width:3, background:`linear-gradient(to bottom,transparent,${C.gold},transparent)` }}/>
                    <div style={{ fontFamily:"'Playfair Display',serif", fontSize:16, color:"#fff", marginBottom:5 }}>{f.label}</div>
                    <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:13, color:"rgba(255,255,255,0.45)", lineHeight:1.6 }}>{f.desc}</div>
                  </div>
                ))}
              </div>
              <div style={{ padding:"20px 22px", background:"rgba(201,168,76,0.05)", border:"1px solid rgba(201,168,76,0.18)" }}>
                <div style={{ fontSize:10, letterSpacing:"0.18em", color:C.gold, marginBottom:10 }}>✦ MAISON FIT PHILOSOPHY</div>
                <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:13, color:"rgba(255,255,255,0.45)", lineHeight:1.7, margin:0 }}>
                  We design to flatter a range of body shapes. Our patterns are created with a 2–4 cm ease allowance as standard, ensuring comfort without sacrificing silhouette. When in doubt, consult the model measurements listed on each product — our models are selected to represent a realistic range of proportions.
                </p>
              </div>
              <div style={{ marginTop:16, padding:"16px 20px", border:"1px solid rgba(255,255,255,0.07)" }}>
                <div style={{ fontSize:10, letterSpacing:"0.16em", color:"rgba(255,255,255,0.35)", marginBottom:8 }}>STILL UNSURE?</div>
                <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:13, color:"rgba(255,255,255,0.4)", lineHeight:1.65, margin:0 }}>
                  Our styling team is available Monday–Saturday, 10 am–7 pm IST. Reach us at{" "}
                  <span style={{ color:C.gold }}>style@maisonluxury.in</span> or via live chat on the website.
                </p>
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ProductDetailPage({ onAuth }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct]         = useState(null);
  const [loading, setLoading]         = useState(true);
  const [error,   setError]           = useState(null);
  const [selectedSize,  setSelectedSize]  = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [qty,           setQty]           = useState(1);
  const [activeImg,     setActiveImg]     = useState(0);
  const [wishlist,      setWishlist]      = useState(false);
  const [cartMsg,       setCartMsg]       = useState(null);
  const [openAccordion, setOpenAccordion] = useState(null);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const { user, refreshUser, isAuthenticated } = useAuth();

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true); setError(null); setActiveImg(0); setSelectedSize(null); setSelectedColor(null);
    getProductById(id)
      .then(data => {
        setProduct(data.product);
        if (data.product?.colors?.length) setSelectedColor(data.product.colors[0]);
        if (user?.wishlist) {
          const ids = user.wishlist.map(w => w._id || w);
          setWishlist(ids.includes(id));
        }
      })
      .catch(err => setError("Product not found or unavailable."))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = () => {
    if (!selectedSize) { setCartMsg({ type:"err", text:"Please select a size" }); return; }
    addToCart({ _id:product._id, name:product.name, price:product.price, category:product.category, images:product.images, color:selectedColor }, selectedSize, qty);
    setCartMsg({ type:"ok", text:"✓  Added to your cart" });
    setTimeout(() => setCartMsg(null), 2500);
  };

  if (loading) return <div style={{ paddingTop:"64px", background:"#f5f0eb", minHeight:"100vh" }}><Spinner/></div>;
  if (error || !product) return (
    <div style={{ paddingTop:"64px", background:"#f5f0eb", minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:16 }}>
      <div style={{ fontFamily:"'Playfair Display',serif", fontSize:24, color:"#6b5c44" }}>{error || "Product not found"}</div>
      <button onClick={() => navigate("/shop")} className="m-btn-gold">BROWSE COLLECTION</button>
    </div>
  );

  const images  = product.images?.length ? product.images : [];
  const imgUrls = images.map(img => img.url);
  const sizes   = product.sizes?.length ? product.sizes : ["XS","S","M","L","XL","XXL"];
  const colors  = product.colors?.length ? product.colors : [];
  const rating  = product.ratings || 0;
  const reviews = product.reviews || [];
  const hasOrig = product.originalPrice && product.originalPrice > product.price;
  const discount= hasOrig ? Math.round((1 - product.price / product.originalPrice) * 100) : 0;

  // Detect numeric sizes (trouser) vs alpha sizes
  const isNumericSizes = sizes.every(s => /^\d+$/.test(s));
  // Detect shoe sizes
  const isShoeSizes    = sizes.every(s => /^\d{2}$/.test(s) && +s >= 36);

  const ACCORDIONS = [
    { id:"details",  title:"Product Details",
      content: product.fabric
        ? `Fabric: ${product.fabric}. ${product.careInstructions || ""}`
        : product.description || "Premium quality piece crafted at our Mumbai atelier." },
    { id:"sizing",   title:"Size & Fit",
      content:`${isNumericSizes ? "Runs true to waist measurement." : "True to size."} ${
        product.fit ? `Cut as ${product.fit}.` : "Regular fit."
      } Select your size above or open the Size & Fit Guide for detailed measurements. ${
        imgUrls.length ? "Model is 5'8\" wearing size S." : ""
      }` },
    { id:"shipping", title:"Shipping & Returns",
      content:"Free shipping on orders above ₹2,000. Standard delivery in 3–5 business days. Free easy returns within 30 days of delivery." },
    { id:"care",     title:"Care Instructions",
      content: product.careInstructions || "Dry clean recommended. Do not bleach. Store in breathable garment bag. Iron on low heat." },
  ];

  return (
    <div style={{ paddingTop:"64px", background:"#f5f0eb", minHeight:"100vh" }}>

      {/* Size guide drawer */}
      {sizeGuideOpen && (
        <SizeGuideDrawer category={product.category} onClose={() => setSizeGuideOpen(false)}/>
      )}

      {/* Breadcrumb */}
      <div className="r-section" style={{ background:"#fff", borderBottom:"1px solid rgba(201,168,76,0.1)", paddingTop:"16px", paddingBottom:"16px" }}>
        {[
          { label:"HOME", action:() => navigate("/") },
          { label:product.category?.toUpperCase(), action:() => navigate(`/shop?category=${product.category}`) },
          { label:product.name?.toUpperCase(), action:null },
        ].map((bc, i, arr) => (
          <span key={i}>
            <span style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"11px", color:bc.action?`#b0a08a`:C.gold, letterSpacing:"0.1em", cursor:bc.action?"pointer":"default" }}
              onClick={bc.action || undefined}>{bc.label}</span>
            {i < arr.length - 1 && <span style={{ color:"#b0a08a", margin:"0 8px" }}>/</span>}
          </span>
        ))}
      </div>

      <div className="r-section r-section-v r-grid-2" style={{ maxWidth:1300, margin:"0 auto", gap:"72px", alignItems:"start" }}>

        {/* LEFT — Images */}
        <div>
          <div style={{ position:"relative", overflow:"hidden", aspectRatio:"3/4", background:GRADS[activeImg % GRADS.length], marginBottom:14 }}>
            {imgUrls[activeImg] ? (
              <img src={imgUrls[activeImg]} alt={product.name}
                style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover" }}/>
            ) : (
              <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center",
                fontFamily:"'Playfair Display',serif", fontSize:18, color:"rgba(255,255,255,0.3)", letterSpacing:"0.2em" }}>
                MAISON
              </div>
            )}
            {product.tag && (
              <div style={{ position:"absolute", top:14, left:14, background:product.tag==="SALE"?"#e07070":C.gold, color:"#0f0c08", fontSize:"8px", letterSpacing:"0.18em", fontWeight:600, padding:"4px 10px" }}>
                {product.tag}
              </div>
            )}
            {imgUrls.length > 1 && (
              <>
                <button onClick={() => setActiveImg(i => (i - 1 + imgUrls.length) % imgUrls.length)}
                  style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", width:38, height:38, background:"rgba(255,255,255,0.9)", border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:"#1a1208" }}>
                  <ChevronIcon dir="left"/>
                </button>
                <button onClick={() => setActiveImg(i => (i + 1) % imgUrls.length)}
                  style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", width:38, height:38, background:"rgba(255,255,255,0.9)", border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:"#1a1208" }}>
                  <ChevronIcon dir="right"/>
                </button>
              </>
            )}
            {imgUrls.length > 1 && (
              <div style={{ position:"absolute", bottom:14, left:"50%", transform:"translateX(-50%)", display:"flex", gap:6 }}>
                {imgUrls.map((_, i) => (
                  <div key={i} onClick={() => setActiveImg(i)} style={{ width:activeImg===i?20:6, height:6, borderRadius:3, background:activeImg===i?C.gold:"rgba(255,255,255,0.5)", cursor:"pointer", transition:"all 0.3s" }}/>
                ))}
              </div>
            )}
          </div>
          {imgUrls.length > 1 && (
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10 }}>
              {imgUrls.map((src, i) => (
                <div key={i} onClick={() => setActiveImg(i)}
                  style={{ aspectRatio:"1/1", background:GRADS[i % GRADS.length], cursor:"pointer", position:"relative", overflow:"hidden",
                    border:activeImg===i?`2px solid ${C.gold}`:"2px solid transparent", transition:"border-color 0.2s" }}>
                  <img src={src} alt="" style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover" }}/>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT — Details */}
        <div>
          <div style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"9.5px", letterSpacing:"0.22em", color:C.gold, marginBottom:10 }}>
            {product.category?.toUpperCase()}{product.subCategory ? ` · ${product.subCategory.toUpperCase()}` : ""}
          </div>

          <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(26px,3vw,36px)", fontWeight:400, color:"#1a1208", margin:"0 0 8px", lineHeight:1.2 }}>
            {product.name}
          </h1>

          {reviews.length > 0 && (
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
              <div style={{ display:"flex", gap:2 }}>
                {[1,2,3,4,5].map(i => <StarIcon key={i} filled={i <= Math.round(rating)}/>)}
              </div>
              <span style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"12px", color:"#6b5c44" }}>
                {rating.toFixed(1)} ({reviews.length} review{reviews.length !== 1 ? "s" : ""})
              </span>
            </div>
          )}

          <div style={{ display:"flex", alignItems:"baseline", gap:14, marginBottom:24 }}>
            <span style={{ fontFamily:"'Playfair Display',serif", fontSize:"26px", color:"#1a1208" }}>
              ₹{Number(product.price).toLocaleString("en-IN")}
            </span>
            {hasOrig && (
              <>
                <span style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"15px", color:"#b0a08a", textDecoration:"line-through" }}>
                  ₹{Number(product.originalPrice).toLocaleString("en-IN")}
                </span>
                <span style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"12px", color:"#7ab87a", letterSpacing:"0.1em" }}>
                  {discount}% OFF
                </span>
              </>
            )}
          </div>

          {product.description && (
            <p style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"14px", lineHeight:1.75, color:"#6b5c44", fontWeight:300, marginBottom:22 }}>
              {product.description}
            </p>
          )}

          <div style={{ height:1, background:"linear-gradient(90deg,transparent,rgba(201,168,76,0.3),transparent)", marginBottom:24 }}/>

          {/* ── COLOR SELECTOR ── */}
          {colors.length > 0 && (
            <div style={{ marginBottom:26 }}>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
                <span style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"10px", letterSpacing:"0.2em", color:"#3a2e1e" }}>
                  COLOUR
                </span>
                {selectedColor && (
                  <span style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"12px", color:"#6b5c44" }}>
                    — {getColorName(selectedColor)}
                  </span>
                )}
              </div>
              <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
                {colors.map((col, i) => {
                  const isSelected = selectedColor === col;
                  return (
                    <button
                      key={i}
                      title={getColorName(col)}
                      onClick={() => setSelectedColor(col)}
                      style={{
                        position:"relative", width:34, height:34, borderRadius:"50%", cursor:"pointer",
                        background:col, border:"none", padding:0,
                        boxShadow: isSelected
                          ? `0 0 0 2px #f5f0eb, 0 0 0 3.5px ${C.gold}, 0 4px 12px rgba(0,0,0,0.18)`
                          : "0 0 0 1.5px rgba(0,0,0,0.12), 0 2px 6px rgba(0,0,0,0.08)",
                        transition:"box-shadow 0.2s, transform 0.15s",
                        transform: isSelected ? "scale(1.12)" : "scale(1)",
                      }}
                      onMouseEnter={e => { if(!isSelected) e.currentTarget.style.transform="scale(1.07)"; }}
                      onMouseLeave={e => { if(!isSelected) e.currentTarget.style.transform="scale(1)"; }}
                    >
                      {isSelected && (
                        <div style={{ position:"absolute", inset:0, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center" }}>
                          {/* Checkmark — use contrasting color */}
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <path d="M2 6l3 3 5-5" stroke={col.toLowerCase()==="#ffffff"||col.toLowerCase()==="white"||col.toLowerCase()==="#fff"?"#000":"#fff"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
              {/* Color name list below swatches */}
              <div style={{ display:"flex", flexWrap:"wrap", gap:"8px 20px", marginTop:10 }}>
                {colors.map((col, i) => (
                  <span key={i} onClick={() => setSelectedColor(col)}
                    style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:11, letterSpacing:"0.08em",
                      color: selectedColor===col ? C.gold : "#b0a08a",
                      cursor:"pointer", borderBottom: selectedColor===col ? `1px solid ${C.gold}` : "1px solid transparent",
                      paddingBottom:1, transition:"all 0.2s" }}>
                    {getColorName(col)}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* ── SIZE SELECTOR ── */}
          <div style={{ marginBottom:24 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <span style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"10px", letterSpacing:"0.2em", color:"#3a2e1e" }}>
                  SELECT SIZE
                </span>
                {selectedSize && (
                  <span style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"12px", color:"#6b5c44" }}>
                    — {isNumericSizes ? `${selectedSize}"` : selectedSize}
                  </span>
                )}
              </div>
              <button onClick={() => setSizeGuideOpen(true)}
                style={{ display:"flex", alignItems:"center", gap:5, fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"11px", color:C.gold, background:"none", border:"none", cursor:"pointer", textDecoration:"underline", textUnderlineOffset:3, letterSpacing:"0.06em" }}>
                <RulerIcon/>
                Size & Fit Guide
              </button>
            </div>

            <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
              {sizes.map(s => (
                <button key={s} onClick={() => setSelectedSize(s)}
                  style={{
                    minWidth: isNumericSizes ? 52 : 46, height:46, padding:"0 10px",
                    border: selectedSize===s ? `2px solid ${C.gold}` : "1px solid rgba(201,168,76,0.3)",
                    background: selectedSize===s ? "rgba(201,168,76,0.08)" : "transparent",
                    color: selectedSize===s ? C.gold : "#6b5c44",
                    fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"12px",
                    cursor:"pointer", transition:"all 0.2s", position:"relative",
                  }}
                  onMouseEnter={e => { if(selectedSize!==s){e.currentTarget.style.borderColor="rgba(201,168,76,0.6)";e.currentTarget.style.color="#3a2e1e";}}}
                  onMouseLeave={e => { if(selectedSize!==s){e.currentTarget.style.borderColor="rgba(201,168,76,0.3)";e.currentTarget.style.color="#6b5c44";}}}>
                  {isNumericSizes ? `${s}"` : s}
                </button>
              ))}
            </div>

            {/* Inline size hint */}
            {!selectedSize && (
              <div style={{ marginTop:10, fontSize:11, color:"#b0a08a", fontFamily:"'Cormorant Garamond',serif", letterSpacing:"0.06em" }}>
                Unsure of your size?{" "}
                <span style={{ color:C.gold, cursor:"pointer", textDecoration:"underline", textUnderlineOffset:2 }}
                  onClick={() => setSizeGuideOpen(true)}>
                  Open the guide →
                </span>
              </div>
            )}
          </div>

          {/* Stock indicator */}
          {product.stock !== undefined && (
            <div style={{ marginBottom:20, fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"11px", letterSpacing:"0.12em",
              color: product.stock === 0 ? "#e07070" : product.stock <= 5 ? "#d4a04a" : "#7ab87a" }}>
              {product.stock === 0 ? "● OUT OF STOCK"
                : product.stock <= 5 ? `● ONLY ${product.stock} LEFT — SELLING FAST`
                : "● IN STOCK"}
            </div>
          )}

          {/* Qty + Add to cart + Wishlist */}
          <div style={{ display:"flex", gap:12, marginBottom:16 }}>
            <div style={{ display:"flex", border:"1px solid rgba(201,168,76,0.3)", overflow:"hidden" }}>
              <button onClick={() => setQty(q => Math.max(1, q-1))}
                style={{ width:44, height:52, background:"none", border:"none", cursor:"pointer", color:"#6b5c44", fontSize:18 }}>−</button>
              <span style={{ width:44, height:52, display:"flex", alignItems:"center", justifyContent:"center",
                fontFamily:"'Playfair Display',serif", fontSize:16, color:"#1a1208",
                borderLeft:"1px solid rgba(201,168,76,0.2)", borderRight:"1px solid rgba(201,168,76,0.2)" }}>
                {qty}
              </span>
              <button onClick={() => setQty(q => q+1)}
                style={{ width:44, height:52, background:"none", border:"none", cursor:"pointer", color:"#6b5c44", fontSize:18 }}>+</button>
            </div>
            <button onClick={handleAddToCart} disabled={product.stock === 0}
              style={{ flex:1, padding:"0 24px", height:52,
                background: product.stock === 0 ? "rgba(201,168,76,0.2)" : `linear-gradient(90deg,${C.gold},${C.goldLight||"#e0b84c"},${C.gold})`,
                backgroundSize:"200% 100%", border:"none", color:"#0f0c08", fontSize:"10px", letterSpacing:"0.22em",
                fontFamily:"'Cormorant Garamond',Georgia,serif",
                cursor: product.stock === 0 ? "not-allowed" : "pointer", transition:"all 0.3s" }}
              onMouseEnter={e => { if(product.stock>0){e.currentTarget.style.backgroundPosition="100% 0";e.currentTarget.style.boxShadow=`0 8px 24px rgba(201,168,76,0.35)`;} }}
              onMouseLeave={e => { e.currentTarget.style.backgroundPosition="0 0";e.currentTarget.style.boxShadow="none"; }}>
              {product.stock === 0 ? "OUT OF STOCK" : "ADD TO CART"}
            </button>
            <button onClick={async () => {
                if (!isAuthenticated) { navigate("/login"); return; }
                try { await toggleWishlist(product._id); await refreshUser(); setWishlist(w => !w); } catch {}
              }}
              style={{ width:52, height:52, border:`1px solid ${wishlist?"#e07070":"rgba(201,168,76,0.3)"}`,
                background:wishlist?"rgba(220,100,100,0.06)":"transparent", cursor:"pointer",
                display:"flex", alignItems:"center", justifyContent:"center",
                color:wishlist?"#e07070":"#6b5c44", transition:"all 0.2s" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill={wishlist?"#e07070":"none"} stroke="currentColor" strokeWidth="1.8">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </button>
          </div>

          {cartMsg && (
            <div style={{ padding:"11px 16px", marginBottom:16,
              background:cartMsg.type==="ok"?"rgba(122,184,122,0.1)":"rgba(220,100,100,0.1)",
              border:`1px solid ${cartMsg.type==="ok"?"rgba(122,184,122,0.3)":"rgba(220,100,100,0.3)"}`,
              fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:13,
              color:cartMsg.type==="ok"?"#7ab87a":"#e07070" }}>
              {cartMsg.text}
            </div>
          )}

          {/* Selected options summary */}
          {(selectedSize || selectedColor) && (
            <div style={{ padding:"10px 14px", marginBottom:16, background:"rgba(201,168,76,0.04)", border:"1px solid rgba(201,168,76,0.12)", fontFamily:"'Cormorant Garamond',serif", fontSize:12, color:"#6b5c44", letterSpacing:"0.06em", display:"flex", gap:16, flexWrap:"wrap" }}>
              {selectedColor && <span>Colour: <strong style={{ color:"#3a2e1e" }}>{getColorName(selectedColor)}</strong></span>}
              {selectedSize  && <span>Size: <strong style={{ color:"#3a2e1e" }}>{isNumericSizes?`${selectedSize}"`:`${selectedSize}`}</strong></span>}
            </div>
          )}

          {/* Accordions */}
          <div style={{ marginTop:8 }}>
            {ACCORDIONS.map(acc => (
              <div key={acc.id} style={{ borderTop:"1px solid rgba(201,168,76,0.15)" }}>
                <button onClick={() => setOpenAccordion(a => a===acc.id ? null : acc.id)}
                  style={{ width:"100%", display:"flex", justifyContent:"space-between", alignItems:"center",
                    padding:"16px 0", background:"none", border:"none", cursor:"pointer",
                    fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"11px", letterSpacing:"0.16em", color:"#3a2e1e" }}>
                  {acc.title.toUpperCase()}
                  <span style={{ color:C.gold, transform:openAccordion===acc.id?"rotate(45deg)":"none", transition:"transform 0.3s", fontSize:20 }}>+</span>
                </button>
                <div style={{ maxHeight:openAccordion===acc.id?"300px":"0", overflow:"hidden", transition:"max-height 0.4s cubic-bezier(0.4,0,0.2,1)" }}>
                  {acc.id === "sizing" ? (
                    <div style={{ paddingBottom:18 }}>
                      <p style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"13.5px", color:"#6b5c44", lineHeight:1.7, fontWeight:300, marginBottom:12 }}>
                        {acc.content}
                      </p>
                      <button onClick={() => setSizeGuideOpen(true)} style={{ display:"flex", alignItems:"center", gap:6, fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:12, color:C.gold, background:"none", border:`1px solid ${C.gold}`, padding:"8px 16px", cursor:"pointer", letterSpacing:"0.12em" }}>
                        <RulerIcon/> VIEW FULL SIZE & FIT GUIDE
                      </button>
                    </div>
                  ) : (
                    <p style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"13.5px", color:"#6b5c44", lineHeight:1.7, paddingBottom:18, fontWeight:300 }}>
                      {acc.content}
                    </p>
                  )}
                </div>
              </div>
            ))}
            <div style={{ borderTop:"1px solid rgba(201,168,76,0.15)" }}/>
          </div>
        </div>
      </div>

      {/* Reviews */}
      {reviews.length > 0 && (
        <div className="r-section" style={{ maxWidth:1300, margin:"0 auto", paddingBottom:"80px" }}>
          <div style={{ height:1, background:"linear-gradient(90deg,transparent,rgba(201,168,76,0.2),transparent)", marginBottom:48 }}/>
          <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:30, fontWeight:400, color:"#1a1208", marginBottom:32 }}>Customer Reviews</h2>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:20 }}>
            {reviews.map((r, i) => (
              <div key={i} style={{ background:"#fff", padding:24, border:"1px solid rgba(201,168,76,0.12)" }}>
                <div style={{ display:"flex", gap:2, marginBottom:12 }}>
                  {[1,2,3,4,5].map(s => <StarIcon key={s} filled={s<=r.rating}/>)}
                </div>
                <p style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:14, lineHeight:1.7, color:"#3a2e1e", fontStyle:"italic", marginBottom:14 }}>"{r.comment}"</p>
                <div style={{ fontFamily:"'Playfair Display',serif", fontSize:13, color:"#1a1208" }}>{r.name}</div>
                <div style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:11, color:"#b0a08a", marginTop:3 }}>
                  {new Date(r.createdAt).toLocaleDateString("en-IN", { month:"long", year:"numeric" })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
