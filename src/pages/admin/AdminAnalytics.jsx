import { useState, useEffect, useCallback, useRef, memo } from "react";
import AdminLayout from "./AdminLayout";
import { C, Spinner } from "../../components/shared";
import { getAnalytics } from "../../api/adminApi";

/* ─── Demo data ─────────────────────────────────────────────────────────────── */
const DEMO = {
  kpis: { totalRevenue:8432000, totalOrders:347, totalUsers:1284, totalProducts:96, avgOrderValue:24300 },
  revenueByMonth: [
    { _id:"2025-07", revenue:420000,  orders:29, avgOrderValue:14483 },
    { _id:"2025-08", revenue:580000,  orders:40, avgOrderValue:14500 },
    { _id:"2025-09", revenue:660000,  orders:46, avgOrderValue:14348 },
    { _id:"2025-10", revenue:520000,  orders:36, avgOrderValue:14444 },
    { _id:"2025-11", revenue:680000,  orders:47, avgOrderValue:14468 },
    { _id:"2025-12", revenue:1120000, orders:78, avgOrderValue:14359 },
    { _id:"2026-01", revenue:890000,  orders:61, avgOrderValue:14590 },
    { _id:"2026-02", revenue:760000,  orders:54, avgOrderValue:14074 },
    { _id:"2026-03", revenue:1340000, orders:92, avgOrderValue:14565 },
    { _id:"2026-04", revenue:1100000, orders:76, avgOrderValue:14473 },
    { _id:"2026-05", revenue:1220000, orders:84, avgOrderValue:14524 },
  ],
  revenueByDay: Array.from({length:30},(_,i) => {
    const d = new Date("2026-04-12"); d.setDate(d.getDate()+i);
    return { _id:d.toISOString().slice(0,10), revenue:20000+Math.floor((i*7+13)*2743)%80000, orders:1+Math.floor((i*3+7)%8) };
  }),
  salesByCategory: [
    { _id:"Women",       revenue:3240000, units:187 },
    { _id:"Men",         revenue:2100000, units:134 },
    { _id:"Accessories", revenue:1560000, units:312 },
    { _id:"Kids",        revenue:890000,  units:98  },
  ],
  topProducts: [
    { _id:"p1", name:"Cashmere Cardigan",  revenue:680000, unitsSold:28 },
    { _id:"p2", name:"Silk Wrap Dress",    revenue:540000, unitsSold:22 },
    { _id:"p3", name:"Shawl Collar Coat",  revenue:490000, unitsSold:14 },
    { _id:"p4", name:"Linen Kurta Set",    revenue:380000, unitsSold:32 },
    { _id:"p5", name:"Handwoven Stole",    revenue:290000, unitsSold:48 },
    { _id:"p6", name:"Embroidered Jacket", revenue:270000, unitsSold:11 },
    { _id:"p7", name:"Block Print Saree",  revenue:240000, unitsSold:19 },
    { _id:"p8", name:"Merino Turtleneck",  revenue:198000, unitsSold:16 },
  ],
  ordersByStatus: [
    { _id:"Delivered",  count:189 },
    { _id:"Processing", count:72  },
    { _id:"Shipped",    count:54  },
    { _id:"Pending",    count:22  },
    { _id:"Cancelled",  count:10  },
  ],
  usersByMonth: [
    { _id:"2025-07", count:62  },{ _id:"2025-08", count:78  },{ _id:"2025-09", count:91  },
    { _id:"2025-10", count:84  },{ _id:"2025-11", count:103 },{ _id:"2025-12", count:142 },
    { _id:"2026-01", count:118 },{ _id:"2026-02", count:96  },{ _id:"2026-03", count:134 },
    { _id:"2026-04", count:122 },{ _id:"2026-05", count:154 },
  ],
  paymentMethods: [
    { _id:"Razorpay", count:198, revenue:4820000 },
    { _id:"COD",      count:109, revenue:2640000 },
    { _id:"UPI",      count:40,  revenue:972000  },
  ],
};

/* ─── Helpers ───────────────────────────────────────────────────────────────── */
const PALETTE = [C.gold,"#7ab87a","#7aa8c0","#a08fc0","#f09090","#d4a04a","#80c0b0","#c07aa0"];
const PERIOD_OPTIONS = [{ label:"3M",value:"3" },{ label:"6M",value:"6" },{ label:"12M",value:"12" },{ label:"24M",value:"24" }];
const TABS = ["Overview","Revenue","Products","Customers","Orders"];

const fmt = n => {
  if (!n || isNaN(n)) return "₹0";
  if (n >= 10000000) return `₹${(n/10000000).toFixed(2)}Cr`;
  if (n >= 100000)   return `₹${(n/100000).toFixed(1)}L`;
  if (n >= 1000)     return `₹${(n/1000).toFixed(0)}K`;
  return `₹${Number(n).toLocaleString("en-IN")}`;
};
const fmtFull  = n => `₹${Number(n||0).toLocaleString("en-IN")}`;
const monthLbl = id => { if (!id) return ""; const [y,m] = id.split("-"); return `${m}/${y?.slice(2)}`; };
const dayLbl   = iso => { try { return new Date(iso).toLocaleDateString("en-IN",{day:"2-digit",month:"short"}); } catch { return iso; } };

/* ─── Animated counter ──────────────────────────────────────────────────────── */
function CountUp({ to, format, duration=1200 }) {
  const [val, setVal] = useState(0);
  const raf = useRef(null);
  useEffect(() => {
    let start = null;
    const tick = ts => {
      if (!start) start = ts;
      const p  = Math.min((ts - start) / duration, 1);
      const ep = 1 - Math.pow(1 - p, 3);
      setVal(Math.round((to || 0) * ep));
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [to, duration]);

  if (format) return <>{format(val)}</>;
  return <>{val.toLocaleString("en-IN")}</>;
}

/* ─── SVG Line Chart ─────────────────────────────────────────────────────────── */
function LineChart({ series, height=200, showDots=true, xLabels=[] }) {
  const [hovered, setHovered] = useState(null);
  if (!series?.length || !series[0]?.data?.length) return (
    <div style={{ height, display:"flex", alignItems:"center", justifyContent:"center", color:"rgba(255,255,255,0.2)", fontSize:13, fontFamily:"'DM Sans',sans-serif" }}>
      No data available
    </div>
  );

  const n      = series[0].data.length;
  const allV   = series.flatMap(s => s.data.filter(v => typeof v === "number" && !isNaN(v)));
  const minV   = allV.length ? Math.min(...allV) : 0;
  const maxV   = allV.length ? Math.max(...allV) : 1;
  const range  = (maxV - minV) || 1;
  const W = 100, H = 100;
  const px = i  => n > 1 ? (i / (n-1)) * W : W/2;
  const py = v  => H - (((v||0) - minV) / range) * (H - 12) - 6;
  const pathD = data => data.map((v,i) => `${i===0?"M":"L"}${px(i).toFixed(2)},${py(v||0).toFixed(2)}`).join(" ");
  const areaD = data => {
    const pts = data.map((v,i) => `${px(i).toFixed(2)},${py(v||0).toFixed(2)}`).join(" L ");
    return `M0,${H} L${pts} L${W},${H}Z`;
  };

  return (
    <div style={{ position:"relative", width:"100%", height }}>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none"
        style={{ width:"100%", height:"100%", overflow:"visible", display:"block" }}
        onMouseLeave={() => setHovered(null)}>
        <defs>
          {series.map((s,i) => (
            <linearGradient key={i} id={`lg_${i}_${s.label}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor={s.color} stopOpacity="0.20"/>
              <stop offset="100%" stopColor={s.color} stopOpacity="0"/>
            </linearGradient>
          ))}
        </defs>

        {/* Grid lines */}
        {[0,25,50,75,100].map(y => (
          <line key={y} x1="0" y1={y} x2={W} y2={y} stroke="rgba(255,255,255,0.04)" strokeWidth="0.4"/>
        ))}

        {series.map((s,si) => (
          <g key={si}>
            <path d={areaD(s.data)} fill={`url(#lg_${si}_${s.label})`}/>
            <path d={pathD(s.data)} fill="none" stroke={s.color} strokeWidth="0.7"
              strokeLinecap="round" strokeLinejoin="round"/>
            {showDots && s.data.map((v,i) => (
              <circle key={i} cx={px(i)} cy={py(v||0)}
                r={hovered===i ? 1.4 : 0.7}
                fill={s.color} opacity={hovered===i ? 1 : 0.65}
                style={{ transition:"r 0.1s" }}
              />
            ))}
          </g>
        ))}

        {/* Invisible hover zones */}
        {Array.from({length:n},(_,i) => (
          <rect key={i}
            x={Math.max(0, px(i) - W/(n*2))} y={0}
            width={W/Math.max(n,1)} height={H}
            fill="transparent" style={{ cursor:"crosshair" }}
            onMouseEnter={() => setHovered(i)}
          />
        ))}

        {/* Hover crosshair */}
        {hovered !== null && (
          <line x1={px(hovered)} y1={0} x2={px(hovered)} y2={H}
            stroke="rgba(201,168,76,0.35)" strokeWidth="0.5" strokeDasharray="2,2"/>
        )}
      </svg>

      {/* Tooltip */}
      {hovered !== null && (
        <div style={{
          position:"absolute", top:4,
          left:`${Math.min(Math.max((px(hovered)), 5), 75)}%`,
          transform:"translateX(-50%)",
          background:"#1a1208", border:`1px solid ${C.gold}40`,
          padding:"8px 12px", pointerEvents:"none", zIndex:10,
          minWidth:110, borderRadius:3,
        }}>
          {xLabels[hovered] && (
            <div style={{ fontSize:11, color:"rgba(255,255,255,0.35)", letterSpacing:"0.08em", marginBottom:4, fontFamily:"'DM Sans',sans-serif" }}>
              {xLabels[hovered]}
            </div>
          )}
          {series.map((s,si) => (
            <div key={si} style={{ fontSize:12, color:s.color, marginBottom:2, fontFamily:"'DM Sans',sans-serif", fontWeight:500 }}>
              {s.label}: {s.format ? s.format(s.data[hovered]||0) : (s.data[hovered]||0).toLocaleString("en-IN")}
            </div>
          ))}
        </div>
      )}

      {/* X-axis labels */}
      {xLabels.length > 0 && n > 1 && (
        <div style={{ display:"flex", justifyContent:"space-between", marginTop:6, paddingTop:2 }}>
          {[0, Math.floor((n-1)/2), n-1].map(i => (
            <span key={i} style={{ fontSize:11, color:"rgba(255,255,255,0.22)", fontFamily:"'DM Sans',sans-serif" }}>
              {xLabels[i]}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Horizontal bar — NO hooks inside, fully self-contained ────────────────── */
const HBar = memo(function HBar({ label, value, max, color, sub }) {
  const [w, setW] = useState(0);
  const pct = max > 0 ? Math.max((value / max) * 100, 1) : 0;
  useEffect(() => { const t = setTimeout(() => setW(pct), 80); return () => clearTimeout(t); }, [pct]);
  return (
    <div style={{ marginBottom:14 }}>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
        <span style={{ fontSize:13, color:"rgba(255,255,255,0.65)", fontFamily:"'DM Sans',sans-serif" }}>{label}</span>
        <div style={{ textAlign:"right" }}>
          <span style={{ fontSize:13, color:"#fff", fontFamily:"'DM Sans',sans-serif", fontWeight:600 }}>{fmt(value)}</span>
          {sub && <span style={{ fontSize:11, color:"rgba(255,255,255,0.3)", marginLeft:8, fontFamily:"'DM Sans',sans-serif" }}>{sub}</span>}
        </div>
      </div>
      <div style={{ height:6, background:"rgba(255,255,255,0.07)", borderRadius:3 }}>
        <div style={{ height:"100%", width:`${w}%`, background:`linear-gradient(90deg,${color},${color}99)`, borderRadius:3, transition:"width 0.85s cubic-bezier(0.34,1.56,0.64,1)" }}/>
      </div>
    </div>
  );
});

/* ─── Status bar — extracted to fix hooks-in-map bug ────────────────────────── */
const StatusBar = memo(function StatusBar({ label, count, total, color, delay=0 }) {
  const [w, setW] = useState(0);
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  useEffect(() => { const t = setTimeout(() => setW(pct), 100 + delay); return () => clearTimeout(t); }, [pct, delay]);
  return (
    <div style={{ marginBottom:14 }}>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ width:8, height:8, borderRadius:"50%", background:color, flexShrink:0 }}/>
          <span style={{ fontSize:13, color:"rgba(255,255,255,0.65)", fontFamily:"'DM Sans',sans-serif" }}>{label}</span>
        </div>
        <span style={{ fontSize:13, color:"#fff", fontFamily:"'DM Sans',sans-serif", fontWeight:600 }}>
          {count} <span style={{ fontSize:11, color:"rgba(255,255,255,0.3)", fontWeight:400 }}>({pct}%)</span>
        </span>
      </div>
      <div style={{ height:6, background:"rgba(255,255,255,0.07)", borderRadius:3 }}>
        <div style={{ height:"100%", width:`${w}%`, background:`linear-gradient(90deg,${color},${color}88)`, borderRadius:3, transition:"width 0.9s cubic-bezier(0.34,1.56,0.64,1)" }}/>
      </div>
    </div>
  );
});

/* ─── KPI Card ──────────────────────────────────────────────────────────────── */
function KpiCard({ label, value, color=C.gold, icon, sub, isText=false }) {
  return (
    <div style={{ padding:"20px 22px", background:"linear-gradient(135deg,#0f0c08,#110e08)", border:"1px solid rgba(201,168,76,0.15)", position:"relative", overflow:"hidden", borderRadius:4 }}>
      <div style={{ position:"absolute", top:0, left:0, right:0, height:2, background:`linear-gradient(90deg,transparent,${color},transparent)` }}/>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontFamily:"'DM Serif Display',serif", fontSize:26, color:"#fff", marginBottom:4, lineHeight:1 }}>
            {isText
              ? value
              : <CountUp to={typeof value === "number" ? value : 0} />
            }
          </div>
          <div style={{ fontSize:10, letterSpacing:"0.16em", color:"rgba(255,255,255,0.3)", textTransform:"uppercase", fontFamily:"'DM Sans',sans-serif", fontWeight:600 }}>{label}</div>
          {sub && <div style={{ fontSize:12, color, marginTop:5, fontFamily:"'DM Sans',sans-serif", fontWeight:500 }}>{sub}</div>}
        </div>
        <div style={{ fontSize:22, opacity:0.65, flexShrink:0, marginLeft:8 }}>{icon}</div>
      </div>
    </div>
  );
}

/* ─── Section wrapper ───────────────────────────────────────────────────────── */
const Section = ({ title, children, action }) => (
  <div style={{ background:"linear-gradient(135deg,#0f0c08,#110e08)", border:"1px solid rgba(201,168,76,0.15)", padding:24, marginBottom:20, borderRadius:4 }}>
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
      <div style={{ fontFamily:"'DM Serif Display',serif", fontSize:18, color:"#fff", fontWeight:400 }}>{title}</div>
      {action}
    </div>
    {children}
  </div>
);

/* ─── Legend row ────────────────────────────────────────────────────────────── */
const Legend = ({ items }) => (
  <div style={{ display:"flex", gap:16, flexWrap:"wrap", marginBottom:12 }}>
    {items.map((it,i) => (
      <div key={i} style={{ display:"flex", alignItems:"center", gap:5 }}>
        <div style={{ width:10, height:3, borderRadius:2, background:it.color }}/>
        <span style={{ fontSize:11, color:"rgba(255,255,255,0.45)", fontFamily:"'DM Sans',sans-serif" }}>{it.label}</span>
      </div>
    ))}
  </div>
);

/* ─── Main component ─────────────────────────────────────────────────────────── */
export default function AdminAnalytics() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [period,  setPeriod]  = useState("12");
  const [tab,     setTab]     = useState("Overview");
  const [refreshedAt, setRefreshedAt] = useState(null);

  const load = useCallback((p) => {
    setLoading(true);
    getAnalytics(p)
      .then(res => { setData(res?.success ? res : DEMO); setRefreshedAt(new Date()); })
      .catch(() => { setData(DEMO); setRefreshedAt(new Date()); })
      .finally(() => setLoading(false));
  }, []);

  // Load on mount
  useEffect(() => { load(period); }, []);

  const changePeriod = p => { setPeriod(p); load(p); };

  if (loading && !data) return (
    <AdminLayout title="Analytics">
      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", paddingTop:120, gap:16 }}>
        <Spinner/>
        <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13, color:"rgba(255,255,255,0.3)", letterSpacing:"0.12em" }}>LOADING ANALYTICS…</div>
      </div>
    </AdminLayout>
  );

  const d = data || DEMO;
  const k = d.kpis || {};

  // ── Derived data (computed once, no hooks) ────────────────────────────────
  const monthLabels  = (d.revenueByMonth||[]).map(m => monthLbl(m._id));
  const revSeries    = [{ label:"Revenue",   color:C.gold,    data:(d.revenueByMonth||[]).map(m=>m.revenue||0),    format:fmt }];
  const ordSeries    = [{ label:"Orders",    color:"#7ab87a", data:(d.revenueByMonth||[]).map(m=>m.orders||0) }];
  const aovSeries    = [{ label:"Avg Order", color:"#7aa8c0", data:(d.revenueByMonth||[]).map(m=>Math.round(m.avgOrderValue||0)), format:fmtFull }];
  const dayLabels    = (d.revenueByDay||[]).map(m => dayLbl(m._id));
  const dayRevSeries = [{ label:"Revenue",   color:C.gold,    data:(d.revenueByDay||[]).map(m=>m.revenue||0), format:fmtFull }];
  const dayOrdSeries = [{ label:"Orders",    color:"#7ab87a", data:(d.revenueByDay||[]).map(m=>m.orders||0) }];
  const usrSeries    = [{ label:"New Users", color:"#7aa8c0", data:(d.usersByMonth||[]).map(m=>m.count||0) }];
  const usrLabels    = (d.usersByMonth||[]).map(m => monthLbl(m._id));

  const maxCat  = Math.max(...(d.salesByCategory||[]).map(c=>c.revenue||0), 1);
  const maxProd = Math.max(...(d.topProducts||[]).map(p=>p.revenue||0), 1);
  const totalOrderCount = (d.ordersByStatus||[]).reduce((s,o)=>s+(o.count||0),0) || 1;
  const totalCatRev = (d.salesByCategory||[]).reduce((s,c)=>s+(c.revenue||0),0) || 1;

  const topCat     = (d.salesByCategory||[])[0]?._id || "—";
  const totalUnits = (d.topProducts||[]).reduce((s,p)=>s+(p.unitsSold||0),0);
  const thisMonthRev = (d.revenueByMonth||[]).slice(-1)[0]?.revenue || 0;
  const thisMonthNew = (d.usersByMonth||[]).slice(-1)[0]?.count || 0;
  const avgLTV       = k.totalUsers > 0 ? Math.round(k.totalRevenue / k.totalUsers) : 0;

  return (
    <AdminLayout title="Analytics">
      {/* ── Top bar ── */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20, flexWrap:"wrap", gap:12 }}>
        {/* Tabs */}
        <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>
          {TABS.map(t => (
            <button key={t} onClick={()=>setTab(t)} style={{
              padding:"8px 16px",
              background: tab===t ? C.gold : "none",
              border:`1px solid ${tab===t ? C.gold : "rgba(201,168,76,0.2)"}`,
              color: tab===t ? "#0f0c08" : "rgba(255,255,255,0.45)",
              fontSize:11, letterSpacing:"0.14em", cursor:"pointer",
              fontFamily:"'DM Sans',sans-serif", fontWeight:700,
              transition:"all 0.2s", borderRadius:3,
            }}>{t.toUpperCase()}</button>
          ))}
        </div>

        {/* Period + refresh */}
        <div style={{ display:"flex", gap:6, alignItems:"center" }}>
          <span style={{ fontSize:10, color:"rgba(255,255,255,0.25)", letterSpacing:"0.12em", fontFamily:"'DM Sans',sans-serif" }}>PERIOD:</span>
          {PERIOD_OPTIONS.map(p => (
            <button key={p.value} onClick={()=>changePeriod(p.value)} style={{
              padding:"5px 11px",
              background: period===p.value ? "rgba(201,168,76,0.15)" : "none",
              border:`1px solid ${period===p.value ? C.gold : "rgba(201,168,76,0.15)"}`,
              color: period===p.value ? C.gold : "rgba(255,255,255,0.35)",
              fontSize:11, letterSpacing:"0.10em", cursor:"pointer",
              fontFamily:"'DM Sans',sans-serif", fontWeight:600, borderRadius:3,
            }}>{p.label}</button>
          ))}
          <button onClick={()=>load(period)} disabled={loading} style={{
            padding:"5px 12px", background:"none",
            border:"1px solid rgba(201,168,76,0.2)", color:C.gold,
            fontSize:14, cursor:loading?"not-allowed":"pointer",
            fontFamily:"inherit", opacity:loading?0.4:1, borderRadius:3,
            display:"flex", alignItems:"center",
          }}>
            {loading ? <Spinner/> : "↻"}
          </button>
        </div>
      </div>

      {refreshedAt && (
        <div style={{ marginBottom:14, fontSize:10, color:"rgba(255,255,255,0.18)", letterSpacing:"0.10em", fontFamily:"'DM Sans',sans-serif" }}>
          LAST UPDATED: {refreshedAt.toLocaleTimeString("en-IN")}
        </div>
      )}

      {/* ══ OVERVIEW ══ */}
      {tab === "Overview" && (
        <>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:14, marginBottom:20 }}>
            <KpiCard label="Total Revenue"   value={k.totalRevenue||0}  color={C.gold}    icon="💰" sub={fmt(k.totalRevenue||0)} />
            <KpiCard label="Total Orders"    value={k.totalOrders||0}   color="#7ab87a"   icon="📦" />
            <KpiCard label="Customers"       value={k.totalUsers||0}    color="#7aa8c0"   icon="👥" />
            <KpiCard label="Products"        value={k.totalProducts||0} color="#a08fc0"   icon="👗" />
            <KpiCard label="Avg Order Value" value={k.avgOrderValue||0} color="#d4a04a"   icon="🧾" sub={fmtFull(k.avgOrderValue||0)} />
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20, marginBottom:20 }}>
            <Section title="Monthly Revenue">
              <Legend items={revSeries}/>
              <LineChart series={revSeries} height={180} xLabels={monthLabels}/>
            </Section>
            <Section title="Monthly Orders">
              <Legend items={ordSeries}/>
              <LineChart series={ordSeries} height={180} xLabels={monthLabels}/>
            </Section>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
            <Section title="Revenue by Category">
              {(d.salesByCategory||[]).map((c,i) => (
                <HBar key={c._id||i} label={c._id||"Other"} value={c.revenue||0} max={maxCat} color={PALETTE[i%PALETTE.length]} sub={`${c.units||0} units`}/>
              ))}
            </Section>
            <Section title="Payment Methods">
              {(d.paymentMethods||[]).map((p,i) => (
                <div key={p._id||i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 0", borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <div style={{ width:8, height:8, borderRadius:"50%", background:PALETTE[i%PALETTE.length] }}/>
                    <span style={{ fontSize:13, color:"rgba(255,255,255,0.65)", fontFamily:"'DM Sans',sans-serif" }}>{p._id||"Unknown"}</span>
                  </div>
                  <div style={{ textAlign:"right" }}>
                    <div style={{ fontSize:13, color:"#fff", fontFamily:"'DM Sans',sans-serif", fontWeight:600 }}>{fmt(p.revenue||0)}</div>
                    <div style={{ fontSize:11, color:"rgba(255,255,255,0.3)", fontFamily:"'DM Sans',sans-serif" }}>{p.count||0} transactions</div>
                  </div>
                </div>
              ))}
            </Section>
          </div>
        </>
      )}

      {/* ══ REVENUE ══ */}
      {tab === "Revenue" && (
        <>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14, marginBottom:20 }}>
            <KpiCard label="Total Revenue"   value={k.totalRevenue||0}   color={C.gold}    icon="💰" sub={fmt(k.totalRevenue||0)} />
            <KpiCard label="This Month"      value={thisMonthRev}         color="#7ab87a"   icon="📅" sub={fmt(thisMonthRev)} />
            <KpiCard label="Avg Order Value" value={k.avgOrderValue||0}   color="#7aa8c0"   icon="🧾" sub={fmtFull(k.avgOrderValue||0)} />
          </div>

          <Section title="Monthly Revenue & Avg Order Value">
            <Legend items={[...revSeries, ...aovSeries]}/>
            <LineChart series={[...revSeries, ...aovSeries]} height={220} xLabels={monthLabels}/>
          </Section>

          <Section title="Daily Revenue — Last 30 Days">
            <Legend items={dayRevSeries}/>
            <LineChart series={dayRevSeries} height={180} xLabels={dayLabels} showDots={false}/>
          </Section>

          <Section title="Revenue by Category">
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:24 }}>
              <div>
                {(d.salesByCategory||[]).map((c,i) => (
                  <HBar key={c._id||i} label={c._id||"Other"} value={c.revenue||0} max={maxCat} color={PALETTE[i%PALETTE.length]} sub={`${c.units||0} units`}/>
                ))}
              </div>
              <div>
                {(d.salesByCategory||[]).map((c,i) => {
                  const pct = Math.round(((c.revenue||0) / totalCatRev) * 100);
                  return (
                    <div key={c._id||i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 0", borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                        <div style={{ width:10, height:10, background:PALETTE[i%PALETTE.length], borderRadius:2 }}/>
                        <span style={{ fontSize:13, color:"rgba(255,255,255,0.65)", fontFamily:"'DM Sans',sans-serif" }}>{c._id||"Other"}</span>
                      </div>
                      <div style={{ display:"flex", gap:14 }}>
                        <span style={{ fontSize:13, color:"rgba(255,255,255,0.5)", fontFamily:"'DM Sans',sans-serif" }}>{pct}%</span>
                        <span style={{ fontSize:13, color:PALETTE[i%PALETTE.length], fontFamily:"'DM Sans',sans-serif", fontWeight:600 }}>{fmt(c.revenue||0)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </Section>
        </>
      )}

      {/* ══ PRODUCTS ══ */}
      {tab === "Products" && (
        <>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14, marginBottom:20 }}>
            <KpiCard label="Active Products"  value={k.totalProducts||0} color="#a08fc0" icon="👗"/>
            <KpiCard label="Top Category"     value={topCat}             color={C.gold}  icon="🏆" isText/>
            <KpiCard label="Total Units Sold" value={totalUnits}         color="#7ab87a" icon="📦"/>
          </div>

          <Section title="Top Products by Revenue">
            {(d.topProducts||[]).map((p,i) => (
              <div key={p._id||i} style={{ display:"flex", alignItems:"center", gap:14, padding:"12px 0", borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
                <div style={{ width:30, height:30, background:`${PALETTE[i%PALETTE.length]}22`, border:`1px solid ${PALETTE[i%PALETTE.length]}40`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, color:PALETTE[i%PALETTE.length], fontFamily:"'DM Serif Display',serif", flexShrink:0, borderRadius:2 }}>
                  {i+1}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:13, color:"rgba(255,255,255,0.82)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", fontFamily:"'DM Sans',sans-serif", marginBottom:6 }}>{p.name}</div>
                  <div style={{ height:4, background:"rgba(255,255,255,0.07)", borderRadius:2 }}>
                    <div style={{ height:"100%", width:`${maxProd>0?((p.revenue||0)/maxProd)*100:0}%`, background:PALETTE[i%PALETTE.length], borderRadius:2, transition:"width 1s ease" }}/>
                  </div>
                </div>
                <div style={{ textAlign:"right", flexShrink:0 }}>
                  <div style={{ fontSize:13, color:"#fff", fontFamily:"'DM Sans',sans-serif", fontWeight:700 }}>{p.unitsSold||0} <span style={{ fontSize:11, color:"rgba(255,255,255,0.3)", fontWeight:400 }}>units</span></div>
                  <div style={{ fontSize:12, color:PALETTE[i%PALETTE.length], fontFamily:"'DM Sans',sans-serif" }}>{fmt(p.revenue||0)}</div>
                </div>
              </div>
            ))}
          </Section>

          <Section title="Category Breakdown">
            {(d.salesByCategory||[]).map((c,i) => (
              <HBar key={c._id||i} label={c._id||"Other"} value={c.revenue||0} max={maxCat} color={PALETTE[i%PALETTE.length]} sub={`${c.units||0} units sold`}/>
            ))}
          </Section>
        </>
      )}

      {/* ══ CUSTOMERS ══ */}
      {tab === "Customers" && (
        <>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14, marginBottom:20 }}>
            <KpiCard label="Total Customers" value={k.totalUsers||0}  color="#7aa8c0" icon="👥"/>
            <KpiCard label="New This Month"  value={thisMonthNew}      color="#7ab87a" icon="🆕"/>
            <KpiCard label="Avg LTV"         value={avgLTV}            color={C.gold}  icon="💎" sub={fmt(avgLTV)}/>
          </div>

          <Section title="New Customer Growth (Monthly)">
            <Legend items={usrSeries}/>
            <LineChart series={usrSeries} height={200} xLabels={usrLabels}/>
          </Section>

          <Section title="Daily Order Activity — Last 30 Days">
            <Legend items={dayOrdSeries}/>
            <LineChart series={dayOrdSeries} height={160} xLabels={dayLabels} showDots={false}/>
          </Section>
        </>
      )}

      {/* ══ ORDERS ══ */}
      {tab === "Orders" && (
        <>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:20 }}>
            <KpiCard label="Total Orders"
              value={k.totalOrders||0} color="#7ab87a" icon="📦"/>
            <KpiCard label="Delivered"
              value={(d.ordersByStatus||[]).find(s=>s._id==="Delivered")?.count||0}
              color="#7ab87a" icon="✅"/>
            <KpiCard label="In Transit"
              value={((d.ordersByStatus||[]).find(s=>s._id==="Shipped")?.count||0) + ((d.ordersByStatus||[]).find(s=>s._id==="Out for Delivery")?.count||0)}
              color={C.gold} icon="🚚"/>
            <KpiCard label="Cancelled"
              value={(d.ordersByStatus||[]).find(s=>s._id==="Cancelled")?.count||0}
              color="#f09090" icon="❌"/>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20, marginBottom:20 }}>
            <Section title="Monthly Order Volume">
              <Legend items={ordSeries}/>
              <LineChart series={ordSeries} height={180} xLabels={monthLabels}/>
            </Section>

            {/* ✅ StatusBar is a proper component — no hooks in map */}
            <Section title="Order Status Distribution">
              {(d.ordersByStatus||[]).map((o,i) => (
                <StatusBar
                  key={o._id||i}
                  label={o._id||"Unknown"}
                  count={o.count||0}
                  total={totalOrderCount}
                  color={PALETTE[i%PALETTE.length]}
                  delay={i*60}
                />
              ))}
            </Section>
          </div>

          <Section title="Daily Orders — Last 30 Days">
            <Legend items={dayOrdSeries}/>
            <LineChart series={dayOrdSeries} height={160} xLabels={dayLabels} showDots={false}/>
          </Section>
        </>
      )}
    </AdminLayout>
  );
}
