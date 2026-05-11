import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { C } from "../components/shared";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { getProductById, getColorVariants, toggleWishlist } from "../api/productApi";

/* ─── Scoped Styles ──────────────────────────────────────────────────────────── */
const PdStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap');

    .pd-root {
      --pd-bg: #f7f4f0;
      --pd-white: #ffffff;
      --pd-text: #1c1714;
      --pd-mid: #4a3f35;
      --pd-muted: #8a7d70;
      --pd-accent: #c9a84c;
      --pd-accent-h: #e8c96e;
      --pd-accent-d: #a8863a;
      --pd-red: #d05050;
      --pd-green: #4a9060;
      --pd-amber: #c07820;
      --pd-bdr: rgba(60,40,20,0.10);
      --pd-bdr-gold: rgba(201,168,76,0.25);
      font-family: 'DM Sans', sans-serif;
    }

    /* Breadcrumb */
    .pd-crumb { font-family:'DM Sans',sans-serif; font-weight:500; font-size:12px; letter-spacing:0.06em; }

    /* Product title */
    .pd-title {
      font-family: 'DM Serif Display', serif;
      font-size: clamp(28px, 3.5vw, 42px);
      font-weight: 400;
      color: var(--pd-text);
      line-height: 1.15;
      margin: 0 0 10px;
    }

    /* Category label */
    .pd-cat {
      font-family: 'DM Sans', sans-serif;
      font-weight: 700;
      font-size: 11px;
      letter-spacing: 0.20em;
      text-transform: uppercase;
      color: var(--pd-accent-d);
      margin-bottom: 12px;
      display: block;
    }

    /* Price */
    .pd-price {
      font-family: 'DM Sans', sans-serif;
      font-weight: 700;
      font-size: 30px;
      color: var(--pd-text);
    }
    .pd-price-orig {
      font-family: 'DM Sans', sans-serif;
      font-weight: 400;
      font-size: 16px;
      color: var(--pd-muted);
      text-decoration: line-through;
    }
    .pd-discount {
      font-family: 'DM Sans', sans-serif;
      font-weight: 700;
      font-size: 13px;
      color: var(--pd-red);
    }

    /* Description */
    .pd-desc {
      font-family: 'DM Sans', sans-serif;
      font-weight: 400;
      font-size: 15px;
      line-height: 1.75;
      color: var(--pd-mid);
    }

    /* Section label */
    .pd-section-lbl {
      font-family: 'DM Sans', sans-serif;
      font-weight: 700;
      font-size: 11px;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: var(--pd-text);
    }

    /* Size buttons */
    .pd-size-btn {
      min-width: 52px; height: 50px; padding: 0 12px;
      font-family: 'DM Sans', sans-serif;
      font-weight: 600; font-size: 14px;
      border: 1.5px solid var(--pd-bdr);
      border-radius: 4px;
      background: var(--pd-white);
      color: var(--pd-mid);
      cursor: pointer;
      transition: all 0.18s;
    }
    .pd-size-btn:hover { border-color: var(--pd-accent); color: var(--pd-accent-d); }
    .pd-size-btn.pd-selected {
      border-color: var(--pd-accent);
      background: rgba(201,168,76,0.08);
      color: var(--pd-accent-d);
      font-weight: 700;
    }

    /* Qty control */
    .pd-qty-ctrl {
      display: flex;
      border: 1.5px solid var(--pd-bdr);
      border-radius: 4px;
      overflow: hidden;
    }
    .pd-qty-btn {
      width: 46px; height: 52px;
      background: none; border: none;
      font-family: 'DM Sans', sans-serif;
      font-size: 20px; font-weight: 400;
      color: var(--pd-mid); cursor: pointer;
      transition: background 0.15s;
    }
    .pd-qty-btn:hover { background: rgba(60,40,20,0.06); }
    .pd-qty-num {
      width: 46px; height: 52px;
      display: flex; align-items: center; justify-content: center;
      font-family: 'DM Sans', sans-serif;
      font-weight: 700; font-size: 16px;
      color: var(--pd-text);
      border-left: 1.5px solid var(--pd-bdr);
      border-right: 1.5px solid var(--pd-bdr);
    }

    /* Add to cart button */
    .pd-add-btn {
      flex: 1; height: 52px;
      font-family: 'DM Sans', sans-serif;
      font-weight: 700; font-size: 13px;
      letter-spacing: 0.16em; text-transform: uppercase;
      background: var(--pd-text); color: #ffffff;
      border: none; border-radius: 4px;
      cursor: pointer;
      transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
    }
    .pd-add-btn:hover { background: #2e2420; box-shadow: 0 6px 20px rgba(28,23,20,0.22); transform: translateY(-1px); }
    .pd-add-btn:disabled { background: rgba(60,40,20,0.15); color: var(--pd-muted); cursor: not-allowed; transform: none; box-shadow: none; }

    .pd-wish-btn {
      width: 52px; height: 52px;
      border: 1.5px solid var(--pd-bdr);
      border-radius: 4px;
      background: var(--pd-white);
      display: flex; align-items: center; justify-content: center;
      cursor: pointer;
      transition: all 0.2s;
    }
    .pd-wish-btn:hover { border-color: #d05050; }
    .pd-wish-btn.pd-wished { border-color: #d05050; background: rgba(208,80,80,0.06); }

    /* Stock badge */
    .pd-stock {
      font-family: 'DM Sans', sans-serif;
      font-weight: 600; font-size: 12px;
      letter-spacing: 0.10em;
      display: inline-flex; align-items: center; gap: 6px;
    }
    .pd-stock-dot {
      width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0;
    }

    /* Accordion */
    .pd-acc-btn {
      width: 100%; display: flex; justify-content: space-between; align-items: center;
      padding: 16px 0; background: none; border: none; cursor: pointer;
      font-family: 'DM Sans', sans-serif;
      font-weight: 600; font-size: 13px;
      letter-spacing: 0.08em; text-transform: uppercase;
      color: var(--pd-text);
    }
    .pd-acc-content {
      font-family: 'DM Sans', sans-serif;
      font-weight: 400; font-size: 14px;
      line-height: 1.75; color: var(--pd-mid);
      padding-bottom: 18px;
    }

    /* Size guide link */
    .pd-guide-link {
      font-family: 'DM Sans', sans-serif;
      font-weight: 600; font-size: 12px;
      color: var(--pd-accent-d);
      background: none; border: none;
      cursor: pointer; text-decoration: underline;
      text-underline-offset: 3px;
      display: inline-flex; align-items: center; gap: 5px;
    }

    /* Review card */
    .pd-review-card {
      background: var(--pd-white);
      border: 0.5px solid var(--pd-bdr);
      border-radius: 8px;
      padding: 22px 24px;
    }

    /* Color swatch */
    .pd-swatch {
      width: 36px; height: 36px; border-radius: 50%;
      cursor: pointer; border: none; padding: 0;
      transition: transform 0.15s, box-shadow 0.15s;
    }
    .pd-swatch:hover { transform: scale(1.08); }
    .pd-swatch.pd-selected {
      box-shadow: 0 0 0 2px var(--pd-bg), 0 0 0 3.5px var(--pd-accent);
      transform: scale(1.12);
    }

    /* Thumbnail */
    .pd-thumb {
      aspect-ratio: 1/1; cursor: pointer; overflow: hidden;
      border-radius: 4px; border: 2px solid transparent;
      transition: border-color 0.2s;
    }
    .pd-thumb.pd-thumb-active { border-color: var(--pd-accent); }

    /* Image nav button */
    .pd-img-nav {
      position: absolute; top: 50%; transform: translateY(-50%);
      width: 40px; height: 40px;
      background: rgba(255,255,255,0.92); border: none;
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; color: var(--pd-text);
      box-shadow: 0 2px 12px rgba(0,0,0,0.12);
      transition: box-shadow 0.2s;
    }
    .pd-img-nav:hover { box-shadow: 0 4px 20px rgba(0,0,0,0.18); }

    /* Cart message */
    .pd-cart-msg {
      border-radius: 4px; padding: 12px 16px; margin-bottom: 14px;
      font-family: 'DM Sans', sans-serif;
      font-weight: 600; font-size: 14px;
    }

    @keyframes pd-spin { to { transform: rotate(360deg); } }
    @keyframes pd-fade-in { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
  `}</style>
);

/* ─── Icons ────────────────────────────────────────────────────────────────── */
const StarIcon = ({ filled }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill={filled ? "#c9a84c" : "none"} stroke="#c9a84c" strokeWidth="1.5">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);
const ChevronIcon = ({ dir }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    {dir === "right" ? <path d="M9 18l6-6-6-6"/> : <path d="M15 18l-6-6 6-6"/>}
  </svg>
);
const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 6L6 18M6 6l12 12"/>
  </svg>
);
const RulerIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M21.3 15.3L15.3 21.3a2 2 0 0 1-2.8 0L2.7 11.5a2 2 0 0 1 0-2.8L8.7 2.7a2 2 0 0 1 2.8 0l9.8 9.8a2 2 0 0 1 0 2.8z"/>
    <path d="M7.5 10.5l1.5 1.5M10.5 7.5l1.5 1.5M13.5 4.5l1.5 1.5M4.5 13.5l1.5 1.5"/>
  </svg>
);

/* ─── Color helpers ─────────────────────────────────────────────────────────── */
const colorNameMap = {
  // Blacks
  "#000000":"Noir Black","#000":"Noir Black","#0a0a0a":"Jet Black","#111111":"Rich Black",
  "#1a1a1a":"Charcoal","#1c1714":"Dark Espresso","#1a1208":"Dark Mahogany","#0d0a06":"Ebony",
  // Whites & creams
  "#ffffff":"Ivory White","#fff":"Ivory White","#fafafa":"Snow","#f5f5f5":"Soft White",
  "#f5f0eb":"Linen Cream","#faf8f5":"Warm White","#f7f4f0":"Antique White","#fffef0":"Cream",
  // Greys
  "#808080":"Slate Grey","#888888":"Medium Grey","#999999":"Stone Grey","#aaaaaa":"Silver Mist",
  "#666666":"Steel Grey","#555555":"Charcoal Grey","#444444":"Gunmetal","#333333":"Graphite",
  "#c0c0c0":"Silver","#d3d3d3":"Light Grey","#b0b0b0":"French Grey","#dcdcdc":"Gainsboro",
  // Browns & tans
  "#8b4513":"Saddle Brown","#a0522d":"Sienna","#8a6228":"Caramel Brown","#6b4c36":"Walnut",
  "#c8a882":"Tan","#d2b48c":"Warm Tan","#c19a6b":"Camel","#a67c52":"Coffee","#7b5835":"Teak",
  "#4a3728":"Dark Chocolate","#c8860a":"Amber Brown","#b8860b":"Dark Goldenrod","#9c6b30":"Hazel",
  "#6f4e37":"Coffee Brown","#c4a35a":"Biscuit","#deb887":"Burlywood","#d2691e":"Chocolate",
  // Reds
  "#ff0000":"Red","#cc0000":"Deep Red","#990000":"Dark Red","#800000":"Maroon",
  "#800020":"Burgundy","#722f37":"Wine","#dc143c":"Crimson","#b22222":"Firebrick",
  "#e34234":"Vermillion","#cd5c5c":"Indian Red","#ff6347":"Tomato","#c41e3a":"Cardinal Red",
  // Pinks
  "#ff69b4":"Rose Pink","#ffb6c1":"Light Pink","#ff1493":"Deep Pink","#db7093":"Pale Violet Red",
  "#f08080":"Coral Pink","#ffc0cb":"Pink Blush","#e75480":"Dark Pink","#ff007f":"Cerise",
  "#f4c2c2":"Baby Pink","#c71585":"Medium Violet Red",
  // Oranges
  "#ff8c00":"Dark Orange","#ffa500":"Amber","#ff7f50":"Coral","#ff4500":"Orange Red",
  "#e2725b":"Terracotta","#cc5500":"Burnt Orange","#b7410e":"Rust","#f4a460":"Sandy Brown",
  // Yellows & golds
  "#c9a84c":"Maison Gold","#d4a04a":"Warm Amber","#ffd700":"Gold","#ffdf00":"Canary Yellow",
  "#f5c518":"Mustard","#e6be8a":"Champagne","#c8b560":"Straw","#e8c96e":"Light Gold",
  "#b8963e":"Antique Gold","#cfb53b":"Old Gold",
  // Greens
  "#008000":"Forest Green","#228b22":"Forest","#006400":"Dark Green","#2e8b57":"Sea Green",
  "#3cb371":"Medium Sea Green","#90ee90":"Light Green","#00fa9a":"Medium Spring Green",
  "#556b2f":"Olive Green","#6b8e23":"Olive Drab","#808000":"Olive","#4a7c59":"Sage Green",
  "#355e3b":"Hunter Green","#00a550":"Emerald","#50c878":"Emerald Green",
  // Blues
  "#0000ff":"Blue","#0000cd":"Medium Blue","#00008b":"Dark Blue","#000080":"Navy",
  "#001f3f":"Midnight Navy","#4169e1":"Royal Blue","#4682b4":"Steel Blue","#87ceeb":"Sky Blue",
  "#add8e6":"Light Blue","#1e90ff":"Dodger Blue","#00bfff":"Deep Sky Blue","#5f9ea0":"Cadet Blue",
  "#6495ed":"Cornflower Blue","#191970":"Midnight Blue","#003153":"Prussian Blue",
  // Purples
  "#800080":"Purple","#8b008b":"Dark Magenta","#9400d3":"Dark Violet","#4b0082":"Indigo",
  "#ee82ee":"Violet","#dda0dd":"Plum","#da70d6":"Orchid","#ff00ff":"Magenta","#c8a2c8":"Lilac",
  "#967bb6":"Lavender Purple","#e6e6fa":"Lavender","#9b59b6":"Amethyst","#7b2d8b":"Grape",
  // Other named
  black:"Noir Black",white:"Ivory White",grey:"Slate Grey",gray:"Slate Grey",
  navy:"Midnight Navy",beige:"Sand Beige",cream:"Ivory Cream",ivory:"Ivory White",
  red:"Scarlet Red",blue:"Classic Blue",green:"Forest Green",pink:"Blush Pink",
  purple:"Royal Purple",orange:"Burnt Orange",yellow:"Golden Yellow",brown:"Warm Brown",
  gold:"Maison Gold",silver:"Silver",coral:"Coral",teal:"Teal",mint:"Mint Green",
  lavender:"Lavender",maroon:"Deep Maroon",olive:"Olive",indigo:"Indigo",
  violet:"Violet",cyan:"Cyan",magenta:"Magenta",khaki:"Khaki",tan:"Tan",
  rose:"Rose","off-white":"Off White","off white":"Off White",
};

// Resolve any colour string → human-readable name
const getColorName = (c) => {
  if (!c) return "Colour";
  const key = c.toLowerCase().trim();
  if (colorNameMap[key]) return colorNameMap[key];
  // Try without '#' spaces
  if (c.startsWith("#")) return nearestColorName(c) || `Shade ${c.toUpperCase()}`;
  return c.charAt(0).toUpperCase() + c.slice(1);
};

// Find nearest named colour by Euclidean RGB distance
const hexToRgb = (hex) => {
  const h = hex.replace("#","");
  if (h.length === 3) {
    return [parseInt(h[0]+h[0],16), parseInt(h[1]+h[1],16), parseInt(h[2]+h[2],16)];
  }
  return [parseInt(h.slice(0,2),16), parseInt(h.slice(2,4),16), parseInt(h.slice(4,6),16)];
};
const NAMED_PALETTE = [
  ["#000000","Noir Black"],["#1a1208","Dark Mahogany"],["#3a2010","Dark Chocolate"],
  ["#6b4c36","Walnut Brown"],["#8b4513","Saddle Brown"],["#a0522d","Sienna"],
  ["#c8a882","Tan"],["#d2b48c","Warm Tan"],["#c9a84c","Maison Gold"],["#ffd700","Gold"],
  ["#ffffff","Ivory White"],["#f5f0eb","Linen Cream"],["#dcdcdc","Light Grey"],
  ["#808080","Slate Grey"],["#444444","Gunmetal"],["#222222","Charcoal"],
  ["#800020","Burgundy"],["#cc0000","Deep Red"],["#ff0000","Red"],["#ff69b4","Rose Pink"],
  ["#ffa500","Amber"],["#e2725b","Terracotta"],["#228b22","Forest Green"],
  ["#000080","Navy"],["#4169e1","Royal Blue"],["#87ceeb","Sky Blue"],
  ["#800080","Purple"],["#ee82ee","Violet"],["#c8a2c8","Lilac"],
];
const nearestColorName = (hex) => {
  try {
    const [r,g,b] = hexToRgb(hex);
    let best = Infinity, name = null;
    for (const [h,n] of NAMED_PALETTE) {
      const [pr,pg,pb] = hexToRgb(h);
      const d = (r-pr)**2 + (g-pg)**2 + (b-pb)**2;
      if (d < best) { best = d; name = n; }
    }
    return best < 15000 ? name : null; // only return if close enough
  } catch { return null; }
};

// Returns true if colour is light (needs dark tick/text)
const isLightColor = (hex) => {
  try {
    const [r,g,b] = hexToRgb(hex.replace(/^(?!#)/,"#"));
    return (r*299 + g*587 + b*114) / 1000 > 155;
  } catch { return false; }
};


/* ─── Size chart data ───────────────────────────────────────────────────────── */
const SIZE_DATA = {
  Women: {
    chart: [
      {size:"XS",chest:"79–82",waist:"61–64",hips:"87–90",intl:"US 2 / UK 6"},
      {size:"S", chest:"83–86",waist:"65–68",hips:"91–94",intl:"US 4 / UK 8"},
      {size:"M", chest:"87–91",waist:"69–73",hips:"95–99",intl:"US 6 / UK 10"},
      {size:"L", chest:"92–97",waist:"74–79",hips:"100–105",intl:"US 8–10 / UK 12"},
      {size:"XL",chest:"98–104",waist:"80–86",hips:"106–112",intl:"US 12 / UK 16"},
      {size:"XXL",chest:"105–112",waist:"87–94",hips:"113–120",intl:"US 14 / UK 18"},
    ],
    model:"Model is 5'8\" (173 cm), 60 kg, wearing size S.",
  },
  Men: {
    chart: [
      {size:"XS",chest:"86–89",waist:"73–76",hips:"—",intl:"EU 44"},
      {size:"S", chest:"90–94",waist:"77–80",hips:"—",intl:"EU 46"},
      {size:"M", chest:"95–99",waist:"81–85",hips:"—",intl:"EU 48–50"},
      {size:"L", chest:"100–104",waist:"86–90",hips:"—",intl:"EU 52"},
      {size:"XL",chest:"105–110",waist:"91–96",hips:"—",intl:"EU 54"},
      {size:"XXL",chest:"111–117",waist:"97–103",hips:"—",intl:"EU 56"},
    ],
    model:"Model is 6'1\" (185 cm), 78 kg, wearing size M.",
  },
  Accessories: {
    chart: [
      {size:"S/M",  chest:"Wrist ≤17 cm",waist:"Head ≤57 cm",hips:"Waist ≤80 cm",intl:"—"},
      {size:"M/L",  chest:"Wrist 17–19 cm",waist:"Head 57–59 cm",hips:"Waist 80–90 cm",intl:"—"},
      {size:"One Size",chest:"Adjustable",waist:"Adjustable",hips:"Adjustable",intl:"Universal"},
    ],
    model:"Accessories are predominantly one-size or adjustable.",
  },
};

/* ─── Size Guide Drawer ─────────────────────────────────────────────────────── */
function SizeGuideDrawer({ category, onClose }) {
  const [unit, setUnit] = useState("cm");
  const data = SIZE_DATA[category] || SIZE_DATA.Women;

  const thS = {
    padding:"11px 14px",
    fontFamily:"'DM Sans',sans-serif", fontWeight:700,
    fontSize:10, letterSpacing:"0.16em",
    color:"rgba(255,255,255,0.40)",
    textAlign:"left", borderBottom:"1px solid rgba(201,168,76,0.18)",
    textTransform:"uppercase",
  };
  const tdS = {
    padding:"12px 14px",
    fontFamily:"'DM Sans',sans-serif", fontWeight:400,
    fontSize:13, color:"rgba(255,255,255,0.72)",
    borderBottom:"1px solid rgba(255,255,255,0.04)",
  };
  const sizeCell = { ...tdS, fontWeight:700, fontSize:14, color:"#c9a84c" };

  const conv = (val) => {
    if (unit === "in" && typeof val === "string" && val.includes("–")) {
      const [a, b] = val.split("–");
      return `${(+a * 0.394).toFixed(1)}–${(+b * 0.394).toFixed(1)}`;
    }
    return val;
  };

  return (
    <>
      <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",zIndex:9000,backdropFilter:"blur(3px)"}} onClick={onClose}/>
      <div style={{
        position:"fixed",top:0,right:0,bottom:0,zIndex:9001,
        width:"min(600px,100vw)", background:"#0f0b07",
        borderLeft:"1px solid rgba(201,168,76,0.18)",
        overflowY:"auto", animation:"drawerIn 0.32s cubic-bezier(0.23,1,0.32,1)",
      }}>
        <style>{`@keyframes drawerIn{from{transform:translateX(100%)}to{transform:translateX(0)}}`}</style>

        {/* Header */}
        <div style={{
          position:"sticky",top:0,background:"#0f0b07",zIndex:10,
          borderBottom:"1px solid rgba(201,168,76,0.15)",
          padding:"24px 28px",
          display:"flex",justifyContent:"space-between",alignItems:"center",
        }}>
          <div>
            <div style={{fontFamily:"'DM Serif Display',serif",fontSize:24,color:"#fff",fontWeight:400}}>Size & Fit Guide</div>
            <div style={{fontFamily:"'DM Sans',sans-serif",fontWeight:500,fontSize:11,letterSpacing:"0.08em",color:"rgba(255,255,255,0.30)",marginTop:4,textTransform:"uppercase"}}>
              {(category||"Clothing")} · Measurements in {unit}
            </div>
          </div>
          <button onClick={onClose} style={{
            width:40,height:40,background:"rgba(255,255,255,0.06)",
            border:"1px solid rgba(255,255,255,0.10)",
            display:"flex",alignItems:"center",justifyContent:"center",
            cursor:"pointer",color:"rgba(255,255,255,0.50)",borderRadius:4,
            transition:"all 0.2s",
          }}
          onMouseEnter={e=>{e.currentTarget.style.borderColor="#c9a84c";e.currentTarget.style.color="#c9a84c";}}
          onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(255,255,255,0.10)";e.currentTarget.style.color="rgba(255,255,255,0.50)";}}>
            <CloseIcon/>
          </button>
        </div>

        {/* Unit toggle */}
        <div style={{padding:"18px 28px 0",display:"flex",gap:8,alignItems:"center"}}>
          {["cm","in"].map(u => (
            <button key={u} onClick={()=>setUnit(u)} style={{
              padding:"7px 20px",
              background:unit===u?"rgba(201,168,76,0.14)":"transparent",
              border:`1.5px solid ${unit===u?"#c9a84c":"rgba(255,255,255,0.12)"}`,
              color:unit===u?"#c9a84c":"rgba(255,255,255,0.40)",
              fontFamily:"'DM Sans',sans-serif", fontWeight:700,
              fontSize:11, letterSpacing:"0.14em",
              cursor:"pointer", transition:"all 0.2s", borderRadius:4,
            }}>{u.toUpperCase()}</button>
          ))}
        </div>

        {/* Size chart */}
        <div style={{padding:"24px 28px 48px"}}>
          <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color:"rgba(255,255,255,0.40)",lineHeight:1.7,marginBottom:20}}>
            All measurements refer to <strong style={{color:"rgba(255,255,255,0.65)"}}>body measurements</strong>, not garment dimensions.
          </p>
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",borderTop:"1px solid rgba(201,168,76,0.18)"}}>
              <thead>
                <tr style={{background:"rgba(201,168,76,0.05)"}}>
                  <th style={thS}>Size</th>
                  <th style={thS}>Chest ({unit})</th>
                  <th style={thS}>Waist ({unit})</th>
                  {category !== "Men" && <th style={thS}>Hips ({unit})</th>}
                  <th style={thS}>Intl.</th>
                </tr>
              </thead>
              <tbody>
                {data.chart.map((row,i) => (
                  <tr key={row.size} style={{background:i%2?"rgba(255,255,255,0.02)":"transparent"}}>
                    <td style={sizeCell}>{row.size}</td>
                    <td style={tdS}>{conv(row.chest)}</td>
                    <td style={tdS}>{conv(row.waist)}</td>
                    {category !== "Men" && <td style={tdS}>{conv(row.hips)}</td>}
                    <td style={{...tdS,color:"rgba(255,255,255,0.38)"}}>{row.intl}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{marginTop:16,padding:"13px 16px",background:"rgba(201,168,76,0.05)",border:"1px solid rgba(201,168,76,0.14)",borderRadius:4,fontFamily:"'DM Sans',sans-serif",fontSize:13,color:"rgba(255,255,255,0.40)",lineHeight:1.65}}>
            👤 {data.model}
          </div>
          <div style={{marginTop:12,padding:"13px 16px",background:"rgba(80,160,100,0.07)",border:"1px solid rgba(80,160,100,0.18)",borderRadius:4}}>
            <div style={{fontFamily:"'DM Sans',sans-serif",fontWeight:700,fontSize:11,letterSpacing:"0.12em",color:"#60b070",marginBottom:5}}>Between sizes?</div>
            <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color:"rgba(255,255,255,0.38)",lineHeight:1.65,margin:0}}>
              Size up for a relaxed fit, or size down for a tailored look. All MAISON garments include a small ease allowance.
            </p>
          </div>
          <div style={{marginTop:24,padding:"16px 18px",border:"1px solid rgba(201,168,76,0.14)",borderRadius:4}}>
            <div style={{fontFamily:"'DM Sans',sans-serif",fontWeight:700,fontSize:11,letterSpacing:"0.14em",color:"#c9a84c",marginBottom:8}}>✦ Shipping & Returns</div>
            <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color:"rgba(255,255,255,0.38)",lineHeight:1.65,margin:0}}>
              Free returns within 30 days. Reach our stylists at <span style={{color:"#c9a84c"}}>style@maisonluxury.in</span> Mon–Sat, 10am–7pm IST.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

/* ─── Spinner ───────────────────────────────────────────────────────────────── */
const Spinner = () => (
  <div style={{minHeight:"60vh",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:16}}>
    <div style={{width:36,height:36,border:"3px solid rgba(201,168,76,0.2)",borderTopColor:"#c9a84c",borderRadius:"50%",animation:"pd-spin 0.75s linear infinite"}}/>
    <span style={{fontFamily:"'DM Sans',sans-serif",fontWeight:600,fontSize:11,letterSpacing:"0.20em",color:"#8a7d70",textTransform:"uppercase"}}>Loading…</span>
  </div>
);

const GRADS = [
  "linear-gradient(160deg,#c8b484,#a09060)",
  "linear-gradient(160deg,#e8e0d4,#d0c8b8)",
  "linear-gradient(160deg,#906040,#6a4020)",
];

/* ─── Main Component ─────────────────────────────────────────────────────────── */
export default function ProductDetailPage() {
  const { id }      = useParams();
  const navigate    = useNavigate();
  const { addToCart } = useCart();
  const { user, refreshUser, isAuthenticated } = useAuth();

  const [product,       setProduct]       = useState(null);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState(null);
  const [selectedSize,  setSelectedSize]  = useState(null);
  const [qty,           setQty]           = useState(1);
  const [activeImg,     setActiveImg]     = useState(0);
  const [wished,        setWished]        = useState(false);
  const [cartMsg,       setCartMsg]       = useState(null);
  const [openAcc,       setOpenAcc]       = useState(null);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  // All products in the same colorGroup (includes current product)
  const [colorVariants, setColorVariants] = useState([]);

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true); setError(null);
    setActiveImg(0); setSelectedSize(null); setColorVariants([]);

    getProductById(id)
      .then(data => {
        const p = data.product;
        setProduct(p);
        if (user?.wishlist) setWished(user.wishlist.map(w => w._id || w).includes(id));
        // Fetch all colour variants in the same colorGroup
        getColorVariants(id)
          .then(res => setColorVariants(res.variants || []))
          .catch(() => setColorVariants([]));
      })
      .catch(() => setError("Product not found or unavailable."))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = () => {
    if (!selectedSize) { setCartMsg({type:"err",text:"Please select a size to continue"}); return; }
    addToCart({
      _id:product._id, name:product.name, price:product.price,
      category:product.category, images:product.images,
      color: product.colors?.[0] || null,
    }, selectedSize, qty);
    setCartMsg({type:"ok",text:"✓  Added to your cart"});
    setTimeout(()=>setCartMsg(null), 2500);
  };

  if (loading) return (
    <div className="pd-root" style={{paddingTop:"64px",background:"var(--pd-bg)",minHeight:"100vh"}}>
      <PdStyles/><Spinner/>
    </div>
  );
  if (error || !product) return (
    <div className="pd-root" style={{paddingTop:"64px",background:"var(--pd-bg)",minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:16}}>
      <PdStyles/>
      <div style={{fontFamily:"'DM Serif Display',serif",fontSize:26,color:"#4a3f35"}}>{error||"Product not found"}</div>
      <button onClick={()=>navigate("/shop")} className="m-btn-gold">Browse Collection</button>
    </div>
  );

  const images   = product.images?.length ? product.images : [];
  const imgUrls  = images.map(img => img.url);
  const sizes    = product.sizes?.length ? product.sizes : ["XS","S","M","L","XL","XXL"];
  const colors   = product.colors?.length ? product.colors : [];
  const rating   = product.ratings || 0;
  const reviews  = product.reviews || [];
  const hasOrig  = product.originalPrice && product.originalPrice > product.price;
  const discount = hasOrig ? Math.round((1 - product.price/product.originalPrice)*100) : 0;
  const isNumeric = sizes.every(s => /^\d+$/.test(s));

  const ACCORDIONS = [
    { id:"details", title:"Product Details",
      content: product.fabric
        ? `Fabric: ${product.fabric}. ${product.careInstructions||""}`
        : product.description||"Premium quality piece crafted at our Mumbai atelier." },
    { id:"sizing",  title:"Size & Fit",
      content:`${isNumeric?"Runs true to waist measurement.":"True to size."} ${product.fit?`Cut as ${product.fit}.`:"Regular fit."} Select your size above or consult the Size & Fit Guide.` },
    { id:"ship",    title:"Shipping & Returns",
      content:"Free shipping on orders above ₹2,000. Standard delivery in 3–5 business days. Free easy returns within 30 days of delivery." },
    { id:"care",    title:"Care Instructions",
      content: product.careInstructions||"Dry clean recommended. Do not bleach. Store in a breathable garment bag. Iron on low heat." },
  ];

  return (
    <div className="pd-root" style={{paddingTop:"64px",background:"var(--pd-bg)",minHeight:"100vh"}}>
      <PdStyles/>

      {sizeGuideOpen && <SizeGuideDrawer category={product.category} onClose={()=>setSizeGuideOpen(false)}/>}

      {/* ── Breadcrumb ────────────────────────────────────────────────────── */}
      <div className="r-section" style={{
        background:"var(--pd-white)",
        borderBottom:"1px solid var(--pd-bdr)",
        paddingTop:14, paddingBottom:14,
        display:"flex", alignItems:"center", gap:8,
      }}>
        {[
          {label:"Home", action:()=>navigate("/")},
          {label:product.category, action:()=>navigate(`/shop?category=${product.category}`)},
          {label:product.name, action:null},
        ].map((bc,i,arr) => (
          <span key={i} style={{display:"flex",alignItems:"center",gap:8}}>
            <span
              className="pd-crumb"
              style={{color:bc.action?"#8a7d70":"#1c1714",cursor:bc.action?"pointer":"default",textTransform:"uppercase",letterSpacing:"0.08em"}}
              onClick={bc.action||undefined}
            >{bc.label}</span>
            {i < arr.length-1 && <span style={{color:"#c0b4a8",fontSize:12}}>/</span>}
          </span>
        ))}
      </div>

      {/* ── Main content ─────────────────────────────────────────────────── */}
      <div className="r-section r-section-v r-grid-2" style={{maxWidth:1320,margin:"0 auto",gap:"72px",alignItems:"start"}}>

        {/* LEFT — Gallery */}
        <div>
          {/* Main image */}
          <div style={{
            position:"relative", overflow:"hidden",
            aspectRatio:"3/4", borderRadius:8,
            background:GRADS[activeImg % GRADS.length],
            marginBottom:12,
          }}>
            {imgUrls[activeImg]
              ? <img src={imgUrls[activeImg]} alt={product.name} style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover"}}/>
              : <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'DM Serif Display',serif",fontSize:20,color:"rgba(255,255,255,0.25)",letterSpacing:"0.10em"}}>MAISON</div>
            }
            {product.tag && (
              <div style={{
                position:"absolute",top:14,left:14,
                fontFamily:"'DM Sans',sans-serif",fontWeight:700,
                fontSize:10,letterSpacing:"0.14em",
                background:product.tag==="SALE"?"#d05050":"#c9a84c",
                color:product.tag==="SALE"?"#fff":"#1c1714",
                padding:"5px 12px",borderRadius:2,
              }}>{product.tag}</div>
            )}
            {imgUrls.length > 1 && (<>
              <button className="pd-img-nav" style={{left:12}} onClick={()=>setActiveImg(i=>(i-1+imgUrls.length)%imgUrls.length)}><ChevronIcon dir="left"/></button>
              <button className="pd-img-nav" style={{right:12}} onClick={()=>setActiveImg(i=>(i+1)%imgUrls.length)}><ChevronIcon dir="right"/></button>
            </>)}
            {imgUrls.length > 1 && (
              <div style={{position:"absolute",bottom:14,left:"50%",transform:"translateX(-50%)",display:"flex",gap:6}}>
                {imgUrls.map((_,i)=>(
                  <div key={i} onClick={()=>setActiveImg(i)} style={{width:activeImg===i?20:6,height:6,borderRadius:3,background:activeImg===i?"#c9a84c":"rgba(255,255,255,0.5)",cursor:"pointer",transition:"all 0.3s"}}/>
                ))}
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {imgUrls.length > 1 && (
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10}}>
              {imgUrls.map((src,i)=>(
                <div key={i} className={`pd-thumb${activeImg===i?" pd-thumb-active":""}`} onClick={()=>setActiveImg(i)}
                  style={{background:GRADS[i%GRADS.length]}}>
                  <img src={src} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT — Info */}
        <div style={{animation:"pd-fade-in 0.4s ease"}}>

          {/* Category */}
          <span className="pd-cat">
            {product.category}{product.subCategory ? ` · ${product.subCategory}` : ""}
          </span>

          {/* Title */}
          <h1 className="pd-title">{product.name}</h1>

          {/* Stars */}
          {reviews.length > 0 && (
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}>
              <div style={{display:"flex",gap:2}}>
                {[1,2,3,4,5].map(i=><StarIcon key={i} filled={i<=Math.round(rating)}/>)}
              </div>
              <span style={{fontFamily:"'DM Sans',sans-serif",fontWeight:500,fontSize:13,color:"#8a7d70"}}>
                {rating.toFixed(1)} · {reviews.length} review{reviews.length!==1?"s":""}
              </span>
            </div>
          )}

          {/* Price */}
          <div style={{display:"flex",alignItems:"baseline",gap:14,marginBottom:20}}>
            <span className="pd-price">₹{Number(product.price).toLocaleString("en-IN")}</span>
            {hasOrig && <>
              <span className="pd-price-orig">₹{Number(product.originalPrice).toLocaleString("en-IN")}</span>
              <span className="pd-discount">−{discount}% off</span>
            </>}
          </div>

          {/* Description */}
          {product.description && (
            <p className="pd-desc" style={{marginBottom:22}}>{product.description}</p>
          )}

          {/* Divider */}
          <div style={{height:"1px",background:"var(--pd-bdr)",marginBottom:24}}/>


          {/* ── Colour (Amazon / Flipkart style) ──────────────────────── */}
          {colorVariants.length > 0 && (() => {
            // current product is always in the list; find it by _id
            const currentColour = product.colors?.[0] || null;
            const currentName   = currentColour ? getColorName(currentColour) : product.name;

            return (
              <div style={{marginBottom:26}}>
                {/* Label row */}
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}>
                  <span className="pd-section-lbl">Colour</span>
                  <span style={{fontFamily:"'DM Sans',sans-serif",fontWeight:400,
                    fontSize:14,color:"#4a3f35"}}>
                    — {currentName}
                  </span>
                </div>

                {/* Swatch row */}
                <div style={{display:"flex",gap:12,flexWrap:"wrap",alignItems:"flex-start"}}>
                  {colorVariants.map(variant => {
                    const isCurrent  = variant._id === id;
                    const colHex     = variant.colors?.[0] || "#cccccc";
                    const colName    = getColorName(colHex);
                    const isLight    = isLightColor(colHex);

                    return (
                      <button
                        key={variant._id}
                        title={colName}
                        onClick={() => !isCurrent && navigate(`/shop/${variant._id}`)}
                        style={{
                          display:"flex",flexDirection:"column",alignItems:"center",
                          gap:6,padding:0,background:"none",border:"none",
                          cursor: isCurrent ? "default" : "pointer",
                          outline:"none",
                        }}
                      >
                        {/* Outer ring (gold when selected) */}
                        <div style={{
                          width:42, height:42,
                          borderRadius:"50%",
                          padding:3,
                          border: isCurrent
                            ? "2px solid #c9a84c"
                            : "2px solid transparent",
                          transition:"border-color 0.2s",
                        }}
                        onMouseEnter={e => {
                          if (!isCurrent) e.currentTarget.style.borderColor = "rgba(201,168,76,0.6)";
                        }}
                        onMouseLeave={e => {
                          if (!isCurrent) e.currentTarget.style.borderColor = "transparent";
                        }}
                        >
                          {/* Colour circle */}
                          <div style={{
                            width:"100%", height:"100%",
                            borderRadius:"50%",
                            background: colHex,
                            border: isLight
                              ? "1px solid rgba(0,0,0,0.15)"
                              : "1px solid rgba(0,0,0,0.08)",
                            display:"flex",alignItems:"center",justifyContent:"center",
                            transition:"transform 0.15s, box-shadow 0.15s",
                            boxShadow: isCurrent
                              ? "0 2px 8px rgba(0,0,0,0.18)"
                              : "0 1px 4px rgba(0,0,0,0.10)",
                          }}>
                            {/* Tick for current */}
                            {isCurrent && (
                              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                <path d="M2 6l3 3 5-5"
                                  stroke={isLight ? "#1c1714" : "#ffffff"}
                                  strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            )}
                          </div>
                        </div>

                        {/* Colour name */}
                        <span style={{
                          fontFamily:"'DM Sans',sans-serif",
                          fontWeight: isCurrent ? 700 : 400,
                          fontSize:11,
                          color: isCurrent ? "#a8863a" : "#8a7d70",
                          textAlign:"center",
                          maxWidth:64,
                          lineHeight:1.3,
                          wordBreak:"break-word",
                          borderBottom: isCurrent ? "1.5px solid #c9a84c" : "none",
                          paddingBottom: isCurrent ? 1 : 0,
                        }}>
                          {colName}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          {/* ── Size picker ───────────────────────────────────────────── */}
          <div style={{marginBottom:24}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <span className="pd-section-lbl">Select Size</span>
                {selectedSize && (
                  <span style={{fontFamily:"'DM Sans',sans-serif",fontWeight:400,fontSize:14,color:"#8a7d70"}}>
                    — {isNumeric ? `${selectedSize}"` : selectedSize}
                  </span>
                )}
              </div>
              <button className="pd-guide-link" onClick={()=>setSizeGuideOpen(true)}>
                <RulerIcon/> Size & Fit Guide
              </button>
            </div>

            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              {sizes.map(s=>(
                <button key={s}
                  className={`pd-size-btn${selectedSize===s?" pd-selected":""}`}
                  onClick={()=>setSelectedSize(s)}>
                  {isNumeric ? `${s}"` : s}
                </button>
              ))}
            </div>

            {!selectedSize && (
              <div style={{marginTop:10,fontFamily:"'DM Sans',sans-serif",fontWeight:400,fontSize:13,color:"#8a7d70"}}>
                Unsure of your size?{" "}
                <span style={{color:"#a8863a",cursor:"pointer",textDecoration:"underline",textUnderlineOffset:2,fontWeight:600}}
                  onClick={()=>setSizeGuideOpen(true)}>Open the guide →</span>
              </div>
            )}
          </div>

          {/* Stock indicator */}
          {product.stock !== undefined && (
            <div style={{marginBottom:20}}>
              <span className="pd-stock" style={{
                color: product.stock===0?"#d05050":product.stock<=5?"#c07820":"#4a9060"
              }}>
                <span className="pd-stock-dot" style={{
                  background: product.stock===0?"#d05050":product.stock<=5?"#c07820":"#4a9060"
                }}/>
                {product.stock===0 ? "Out of stock"
                  : product.stock<=5 ? `Only ${product.stock} left — selling fast`
                  : "In stock"}
              </span>
            </div>
          )}

          {/* ── Qty + Add to cart + Wishlist ─────────────────────────── */}
          <div style={{display:"flex",gap:10,marginBottom:14}}>
            <div className="pd-qty-ctrl">
              <button className="pd-qty-btn" onClick={()=>setQty(q=>Math.max(1,q-1))}>−</button>
              <span className="pd-qty-num">{qty}</span>
              <button className="pd-qty-btn" onClick={()=>setQty(q=>q+1)}>+</button>
            </div>
            <button className="pd-add-btn" onClick={handleAddToCart} disabled={product.stock===0}>
              {product.stock===0 ? "Out of Stock" : "Add to Cart"}
            </button>
            <button
              className={`pd-wish-btn${wished?" pd-wished":""}`}
              onClick={async()=>{
                if(!isAuthenticated){navigate("/login");return;}
                try{await toggleWishlist(product._id);await refreshUser();setWished(w=>!w);}catch{}
              }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill={wished?"#d05050":"none"} stroke={wished?"#d05050":"#8a7d70"} strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </button>
          </div>

          {/* Cart message */}
          {cartMsg && (
            <div className="pd-cart-msg" style={{
              background:cartMsg.type==="ok"?"rgba(74,144,96,0.09)":"rgba(208,80,80,0.09)",
              border:`1.5px solid ${cartMsg.type==="ok"?"rgba(74,144,96,0.30)":"rgba(208,80,80,0.30)"}`,
              color:cartMsg.type==="ok"?"#3a7855":"#c04040",
            }}>{cartMsg.text}</div>
          )}

          {/* Selection summary pill */}
          {selectedSize && (
            <div style={{
              padding:"10px 14px",marginBottom:14,
              background:"rgba(201,168,76,0.06)",
              border:"1px solid rgba(201,168,76,0.18)",
              borderRadius:4,
              fontFamily:"'DM Sans',sans-serif",fontWeight:500,fontSize:13,
              color:"#8a7d70",display:"flex",gap:18,flexWrap:"wrap",
            }}>
              {product.colors?.[0] && (
                <span>Colour: <strong style={{color:"#1c1714"}}>{getColorName(product.colors[0])}</strong></span>
              )}
              <span>Size: <strong style={{color:"#1c1714"}}>{isNumeric?`${selectedSize}"`:selectedSize}</strong></span>
            </div>
          )}

          {/* ── Accordions ────────────────────────────────────────────── */}
          <div style={{marginTop:6}}>
            {ACCORDIONS.map(acc=>(
              <div key={acc.id} style={{borderTop:"1px solid var(--pd-bdr)"}}>
                <button className="pd-acc-btn" onClick={()=>setOpenAcc(a=>a===acc.id?null:acc.id)}>
                  {acc.title}
                  <span style={{
                    color:"#8a7d70",
                    transform:openAcc===acc.id?"rotate(45deg)":"none",
                    transition:"transform 0.3s",
                    fontSize:22, fontWeight:400,
                    display:"inline-block",
                  }}>+</span>
                </button>
                <div style={{maxHeight:openAcc===acc.id?"320px":"0",overflow:"hidden",transition:"max-height 0.4s cubic-bezier(0.4,0,0.2,1)"}}>
                  {acc.id==="sizing" ? (
                    <div style={{paddingBottom:20}}>
                      <p className="pd-acc-content" style={{marginBottom:12}}>{acc.content}</p>
                      <button onClick={()=>setSizeGuideOpen(true)} style={{
                        display:"flex",alignItems:"center",gap:6,
                        fontFamily:"'DM Sans',sans-serif",fontWeight:700,fontSize:12,
                        letterSpacing:"0.10em",color:"#a8863a",
                        background:"none",
                        border:"1.5px solid rgba(201,168,76,0.35)",
                        borderRadius:4,padding:"9px 16px",
                        cursor:"pointer",
                      }}><RulerIcon/> View Size & Fit Guide</button>
                    </div>
                  ) : (
                    <p className="pd-acc-content">{acc.content}</p>
                  )}
                </div>
              </div>
            ))}
            <div style={{borderTop:"1px solid var(--pd-bdr)"}}/>
          </div>
        </div>
      </div>

      {/* ── Reviews ──────────────────────────────────────────────────────── */}
      {reviews.length > 0 && (
        <div className="r-section" style={{maxWidth:1320,margin:"0 auto",paddingBottom:80}}>
          <div style={{height:1,background:"var(--pd-bdr)",marginBottom:48}}/>
          <h2 style={{fontFamily:"'DM Serif Display',serif",fontSize:32,fontWeight:400,color:"#1c1714",marginBottom:10}}>
            Customer Reviews
          </h2>
          <div style={{fontFamily:"'DM Sans',sans-serif",fontWeight:500,fontSize:14,color:"#8a7d70",marginBottom:32}}>
            {reviews.length} review{reviews.length!==1?"s":""}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:20}}>
            {reviews.map((r,i)=>(
              <div key={i} className="pd-review-card">
                <div style={{display:"flex",gap:2,marginBottom:10}}>
                  {[1,2,3,4,5].map(s=><StarIcon key={s} filled={s<=r.rating}/>)}
                </div>
                <p style={{fontFamily:"'DM Serif Display',serif",fontStyle:"italic",fontSize:15,lineHeight:1.65,color:"#2c2420",marginBottom:14}}>"{r.comment}"</p>
                <div style={{fontFamily:"'DM Sans',sans-serif",fontWeight:600,fontSize:14,color:"#1c1714"}}>{r.name}</div>
                <div style={{fontFamily:"'DM Sans',sans-serif",fontWeight:400,fontSize:12,color:"#8a7d70",marginTop:3}}>
                  {new Date(r.createdAt).toLocaleDateString("en-IN",{month:"long",year:"numeric"})}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
