import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "./AdminLayout";
import { C, Spinner } from "../../components/shared";
import { getAnalytics } from "../../api/adminApi";

// ── Demo data ─────────────────────────────────────────────────────────────────
const DEMO = {
  kpis: { totalRevenue:8432000, totalOrders:347, totalUsers:1284, totalProducts:96, avgOrderValue:24300 },
  revenueByMonth: [
    { _id:"2025-07", revenue:420000, orders:29, avgOrderValue:14483 },
    { _id:"2025-08", revenue:580000, orders:40, avgOrderValue:14500 },
    { _id:"2025-09", revenue:660000, orders:46, avgOrderValue:14348 },
    { _id:"2025-10", revenue:520000, orders:36, avgOrderValue:14444 },
    { _id:"2025-11", revenue:680000, orders:47, avgOrderValue:14468 },
    { _id:"2025-12", revenue:1120000, orders:78, avgOrderValue:14359 },
    { _id:"2026-01", revenue:890000, orders:61, avgOrderValue:14590 },
    { _id:"2026-02", revenue:760000, orders:54, avgOrderValue:14074 },
    { _id:"2026-03", revenue:1340000, orders:92, avgOrderValue:14565 },
    { _id:"2026-04", revenue:1100000, orders:76, avgOrderValue:14473 },
    { _id:"2026-05", revenue:1220000, orders:84, avgOrderValue:14524 },
  ],
  revenueByDay: Array.from({length:30},(_,i)=>{
    const d = new Date(); d.setDate(d.getDate()-29+i);
    return { _id: d.toISOString().slice(0,10), revenue: 20000+Math.floor(Math.random()*80000), orders: 1+Math.floor(Math.random()*8) };
  }),
  salesByCategory: [
    { _id:"Women",       revenue:3240000, units:187 },
    { _id:"Men",         revenue:2100000, units:134 },
    { _id:"Accessories", revenue:1560000, units:312 },
    { _id:"Kids",        revenue:890000,  units:98  },
    { _id:"Home",        revenue:642000,  units:54  },
  ],
  topProducts: [
    { _id:"p1", name:"Cashmere Cardigan",       revenue:680000, unitsSold:28 },
    { _id:"p2", name:"Silk Wrap Dress",         revenue:540000, unitsSold:22 },
    { _id:"p3", name:"Shawl Collar Coat",       revenue:490000, unitsSold:14 },
    { _id:"p4", name:"Linen Kurta Set",         revenue:380000, unitsSold:32 },
    { _id:"p5", name:"Handwoven Stole",         revenue:290000, unitsSold:48 },
    { _id:"p6", name:"Embroidered Jacket",      revenue:270000, unitsSold:11 },
    { _id:"p7", name:"Block Print Saree",       revenue:240000, unitsSold:19 },
    { _id:"p8", name:"Merino Turtleneck",       revenue:198000, unitsSold:16 },
  ],
  ordersByStatus: [
    { _id:"Delivered", count:189 },{ _id:"Processing", count:72 },
    { _id:"Shipped", count:54 },{ _id:"Pending", count:22 },{ _id:"Cancelled", count:10 },
  ],
  usersByMonth: [
    { _id:"2025-07", count:62 },{ _id:"2025-08", count:78 },{ _id:"2025-09", count:91 },
    { _id:"2025-10", count:84 },{ _id:"2025-11", count:103 },{ _id:"2025-12", count:142 },
    { _id:"2026-01", count:118 },{ _id:"2026-02", count:96 },{ _id:"2026-03", count:134 },
    { _id:"2026-04", count:122 },{ _id:"2026-05", count:154 },
  ],
  paymentMethods: [
    { _id:"Razorpay", count:198, revenue:4820000 },
    { _id:"COD",      count:109, revenue:2640000 },
    { _id:"UPI",      count:40,  revenue:972000  },
  ],
};

// ── Color palette ─────────────────────────────────────────────────────────────
const PALETTE = [C.gold,"#7ab87a","#7aa8c0","#a08fc0","#f09090","#d4a04a","#80c0b0","#c07aa0"];
const PERIOD_OPTIONS = [
  { label:"3M",  value:"3"  },
  { label:"6M",  value:"6"  },
  { label:"12M", value:"12" },
  { label:"24M", value:"24" },
];
const TABS = ["Overview","Revenue","Products","Customers","Orders"];

const fmt = n => n >= 10000000 ? `₹${(n/10000000).toFixed(2)}Cr` : n >= 100000 ? `₹${(n/100000).toFixed(1)}L` : `₹${(n/1000).toFixed(0)}K`;
const fmtFull = n => `₹${Number(n).toLocaleString("en-IN")}`;

function timeLabel(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN",{ day:"2-digit", month:"short" });
}

// ── Animated counter ──────────────────────────────────────────────────────────
function CountUp({ to, prefix="", suffix="", duration=1200 }) {
  const [val, setVal] = useState(0);
  const raf = useRef(null);
  useEffect(() => {
    const start = performance.now();
    const tick = now => {
      const p = Math.min((now-start)/duration,1);
      const ease = 1-Math.pow(1-p,3);
      setVal(Math.round(to*ease));
      if (p<1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  },[to,duration]);
  return <>{prefix}{val.toLocaleString("en-IN")}{suffix}</>;
}

// ── SVG Line Chart ────────────────────────────────────────────────────────────
function LineChart({ series, height=200, showDots=true, showGrid=true, xLabels=[] }) {
  const [hovered, setHovered] = useState(null);
  if (!series.length || !series[0].data.length) return null;
  const n = series[0].data.length;
  const allVals = series.flatMap(s => s.data);
  const minV = Math.min(...allVals), maxV = Math.max(...allVals)||1;
  const range = maxV - minV || 1;
  const W = 100, H = 100;
  const px = i => (i/(n-1||1))*W;
  const py = v => H - ((v-minV)/range)*(H-10) - 5;
  const path = data => data.map((v,i) => `${i===0?"M":"L"} ${px(i).toFixed(1)} ${py(v).toFixed(1)}`).join(" ");
  const area = (data,color) => {
    const pts = data.map((v,i) => `${px(i).toFixed(1)},${py(v).toFixed(1)}`).join(" L ");
    return `M 0,${H} L ${pts} L ${W},${H} Z`;
  };
  const gridLines = 4;

  return (
    <div style={{ position:"relative", width:"100%", height }}>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none"
        style={{ width:"100%", height:"100%", overflow:"visible" }}
        onMouseLeave={() => setHovered(null)}
      >
        <defs>
          {series.map((s,i) => (
            <linearGradient key={i} id={`lg${i}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={s.color} stopOpacity="0.22"/>
              <stop offset="100%" stopColor={s.color} stopOpacity="0"/>
            </linearGradient>
          ))}
        </defs>
        {showGrid && Array.from({length:gridLines},(_,i) => {
          const y = (i/(gridLines-1))*H;
          return <line key={i} x1="0" y1={y} x2={W} y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth="0.3"/>;
        })}
        {series.map((s,si) => (
          <g key={si}>
            <path d={area(s.data,s.color)} fill={`url(#lg${si})`}/>
            <path d={path(s.data)} fill="none" stroke={s.color} strokeWidth="0.6" strokeLinecap="round" strokeLinejoin="round"/>
            {showDots && s.data.map((v,i) => (
              <circle key={i} cx={px(i)} cy={py(v)} r={hovered===i?"1.2":"0.6"}
                fill={s.color} opacity={hovered===i?1:0.7}
                style={{ transition:"r 0.1s" }}
              />
            ))}
          </g>
        ))}
        {/* Hover zones */}
        {Array.from({length:n},(_,i) => (
          <rect key={i}
            x={px(i)-W/(n*2)} y={0} width={W/n} height={H}
            fill="transparent" style={{ cursor:"crosshair" }}
            onMouseEnter={() => setHovered(i)}
          />
        ))}
        {/* Hover line */}
        {hovered !== null && (
          <line x1={px(hovered)} y1={0} x2={px(hovered)} y2={H}
            stroke="rgba(201,168,76,0.3)" strokeWidth="0.4" strokeDasharray="2 2"/>
        )}
      </svg>
      {/* Tooltip */}
      {hovered !== null && (
        <div style={{
          position:"absolute", top:8,
          left: `${Math.min(Math.max((hovered/(n-1||1))*100, 5), 80)}%`,
          transform:"translateX(-50%)",
          background:"#1a1208", border:`1px solid ${C.gold}40`,
          padding:"8px 12px", pointerEvents:"none", zIndex:10, minWidth:100,
        }}>
          {xLabels[hovered] && <div style={{ fontSize:9, color:"rgba(255,255,255,0.3)", letterSpacing:"0.1em", marginBottom:4 }}>{xLabels[hovered]}</div>}
          {series.map((s,si) => (
            <div key={si} style={{ fontSize:11, color:s.color, marginBottom:2 }}>
              {s.label}: {s.format ? s.format(s.data[hovered]) : s.data[hovered]?.toLocaleString("en-IN")}
            </div>
          ))}
        </div>
      )}
      {/* X-axis labels */}
      {xLabels.length > 0 && (
        <div style={{ display:"flex", justifyContent:"space-between", marginTop:6 }}>
          {xLabels.filter((_,i) => i===0 || i===Math.floor(n/2) || i===n-1).map((l,i) => (
            <span key={i} style={{ fontSize:9, color:"rgba(255,255,255,0.25)", letterSpacing:"0.05em" }}>{l}</span>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Horizontal bar ────────────────────────────────────────────────────────────
function HBar({ label, value, max, color, sub }) {
  const pct = Math.max((value/max)*100, 1);
  const [w, setW] = useState(0);
  useEffect(() => { const t = setTimeout(() => setW(pct), 80); return () => clearTimeout(t); }, [pct]);
  return (
    <div style={{ marginBottom:14 }}>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
        <span style={{ fontSize:12, color:"rgba(255,255,255,0.65)" }}>{label}</span>
        <div style={{ textAlign:"right" }}>
          <span style={{ fontSize:12, color:"#fff" }}>{fmt(value)}</span>
          {sub && <span style={{ fontSize:9, color:"rgba(255,255,255,0.3)", marginLeft:6 }}>{sub}</span>}
        </div>
      </div>
      <div style={{ height:6, background:"rgba(255,255,255,0.06)", borderRadius:0 }}>
        <div style={{ height:"100%", width:`${w}%`, background:`linear-gradient(90deg,${color},${color}99)`, transition:"width 0.8s cubic-bezier(0.34,1.56,0.64,1)" }}/>
      </div>
    </div>
  );
}

// ── KPI Card ──────────────────────────────────────────────────────────────────
function KpiCard({ label, value, color=C.gold, icon, sub }) {
  return (
    <div style={{ padding:"20px 22px", background:"linear-gradient(135deg,#0f0c08,#110e08)", border:"1px solid rgba(201,168,76,0.15)", position:"relative", overflow:"hidden" }}>
      <div style={{ position:"absolute", top:0, left:0, right:0, height:2, background:`linear-gradient(90deg,transparent,${color},transparent)` }}/>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
        <div>
          <div style={{ fontFamily:"'Playfair Display',serif", fontSize:26, color:"#fff", marginBottom:4 }}>
            {typeof value === "number" ? <CountUp to={value} prefix={value > 10000 ? "₹" : ""}/> : value}
          </div>
          <div style={{ fontSize:"9px", letterSpacing:"0.18em", color:"rgba(255,255,255,0.3)" }}>{label.toUpperCase()}</div>
          {sub && <div style={{ fontSize:11, color, marginTop:4 }}>{sub}</div>}
        </div>
        <div style={{ fontSize:22, opacity:0.7 }}>{icon}</div>
      </div>
    </div>
  );
}

// ── Section wrapper ───────────────────────────────────────────────────────────
const Section = ({ title, children, action }) => (
  <div style={{ background:"linear-gradient(135deg,#0f0c08,#110e08)", border:"1px solid rgba(201,168,76,0.15)", padding:24, marginBottom:20 }}>
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
      <div style={{ fontFamily:"'Playfair Display',serif", fontSize:17, color:"#fff" }}>{title}</div>
      {action}
    </div>
    {children}
  </div>
);

// ── Main Component ────────────────────────────────────────────────────────────
export default function AdminAnalytics() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod]   = useState("12");
  const [tab, setTab]         = useState("Overview");
  const [lastRefresh, setLastRefresh] = useState(null);
  const navigate = useNavigate();

  const load = useCallback((p = period) => {
    setLoading(true);
    getAnalytics(p)
      .then(res => { setData(res.success ? res : DEMO); setLastRefresh(new Date()); })
      .catch(() => { setData(DEMO); setLastRefresh(new Date()); })
      .finally(() => setLoading(false));
  }, [period]);

  useEffect(() => { /* no auto-fetch — use the Refresh button */ }, []);

  const changePeriod = p => { setPeriod(p); load(p); };

  if (!data) return (
    <AdminLayout title="Analytics">
      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", paddingTop:120, gap:20 }}>
        <div style={{ fontSize:48, opacity:0.3 }}>📈</div>
        <div style={{ fontFamily:"'Playfair Display',serif", fontSize:20, color:"rgba(255,255,255,0.3)" }}>No data loaded yet</div>
        <div style={{ fontSize:12, color:"rgba(255,255,255,0.2)", fontFamily:"'Cormorant Garamond',serif" }}>Click the Refresh button to load analytics data</div>
        <button onClick={() => load()} style={{ marginTop:8, padding:"12px 32px", background:"rgba(201,168,76,0.1)", border:`1px solid ${C.gold}`, color:C.gold, fontSize:"10px", letterSpacing:"0.2em", cursor:"pointer", fontFamily:"inherit" }}>
          ↻ LOAD DATA
        </button>
      </div>
    </AdminLayout>
  );

  const d = data || DEMO;
  const k = d.kpis || {};

  // Derived series
  const monthLabels = d.revenueByMonth.map(m => m._id?.slice(5)+"/"+m._id?.slice(2,4));
  const revSeries   = [{ label:"Revenue", color:C.gold, data: d.revenueByMonth.map(m=>m.revenue), format: fmt }];
  const ordSeries   = [{ label:"Orders",  color:"#7ab87a", data: d.revenueByMonth.map(m=>m.orders) }];
  const aovSeries   = [{ label:"Avg Order", color:"#7aa8c0", data: d.revenueByMonth.map(m=>Math.round(m.avgOrderValue||0)), format: fmtFull }];
  const dayLabels   = d.revenueByDay.map(m => timeLabel(m._id));
  const dayRevSeries= [{ label:"Revenue", color:C.gold, data: d.revenueByDay.map(m=>m.revenue), format:fmtFull }];
  const dayOrdSeries= [{ label:"Orders",  color:"#7ab87a", data: d.revenueByDay.map(m=>m.orders) }];
  const usrSeries   = [{ label:"New Users", color:"#7aa8c0", data: d.usersByMonth.map(m=>m.count) }];
  const usrLabels   = d.usersByMonth.map(m => m._id?.slice(5)+"/"+m._id?.slice(2,4));

  const maxCat = Math.max(...d.salesByCategory.map(c=>c.revenue),1);
  const maxProd= Math.max(...d.topProducts.map(p=>p.revenue),1);
  const totalOrders = d.ordersByStatus.reduce((s,o)=>s+o.count,0)||1;

  return (
    <AdminLayout title="Analytics">
      {/* ── Top bar ─────────────────────────────────────────────────────────── */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24, flexWrap:"wrap", gap:12 }}>
        <div style={{ display:"flex", gap:4 }}>
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding:"8px 16px", background: tab===t ? C.gold : "none",
              border:`1px solid ${tab===t ? C.gold : "rgba(201,168,76,0.2)"}`,
              color: tab===t ? "#0f0c08" : "rgba(255,255,255,0.45)",
              fontSize:"9px", letterSpacing:"0.14em", cursor:"pointer", fontFamily:"inherit",
              transition:"all 0.2s",
            }}>{t.toUpperCase()}</button>
          ))}
        </div>
        <div style={{ display:"flex", gap:8, alignItems:"center" }}>
          <span style={{ fontSize:10, color:"rgba(255,255,255,0.25)", letterSpacing:"0.1em" }}>PERIOD:</span>
          {PERIOD_OPTIONS.map(p => (
            <button key={p.value} onClick={() => changePeriod(p.value)} style={{
              padding:"6px 12px", background: period===p.value ? "rgba(201,168,76,0.15)" : "none",
              border:`1px solid ${period===p.value ? C.gold : "rgba(201,168,76,0.15)"}`,
              color: period===p.value ? C.gold : "rgba(255,255,255,0.35)",
              fontSize:"9px", letterSpacing:"0.12em", cursor:"pointer", fontFamily:"inherit",
            }}>{p.label}</button>
          ))}
          <button onClick={() => load()} disabled={loading} style={{ padding:"6px 14px", background:"none", border:"1px solid rgba(201,168,76,0.2)", color:C.gold, fontSize:"9px", letterSpacing:"0.14em", cursor:"pointer", fontFamily:"inherit", opacity:loading?0.5:1 }}>
            {loading ? "…" : "↻"}
          </button>
        </div>
      </div>

      {lastRefresh && (
        <div style={{ marginBottom:16, fontSize:10, color:"rgba(255,255,255,0.2)", letterSpacing:"0.1em" }}>
          LAST UPDATED {lastRefresh.toLocaleTimeString("en-IN")}
        </div>
      )}

      {/* ══════════════════════ OVERVIEW TAB ══════════════════════ */}
      {tab === "Overview" && (
        <>
          {/* KPIs */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:14, marginBottom:20 }}>
            <KpiCard label="Total Revenue"   value={Math.round(k.totalRevenue/100)} color={C.gold}    icon="💰" sub={`~${fmt(k.totalRevenue)}`} />
            <KpiCard label="Total Orders"    value={k.totalOrders}                  color="#7ab87a"   icon="📦" />
            <KpiCard label="Customers"       value={k.totalUsers}                   color="#7aa8c0"   icon="👥" />
            <KpiCard label="Active Products" value={k.totalProducts}                color="#a08fc0"   icon="👗" />
            <KpiCard label="Avg Order Value" value={Math.round(k.avgOrderValue/100)}color="#d4a04a"   icon="🧾" sub={fmtFull(k.avgOrderValue)} />
          </div>

          {/* Revenue + Orders line charts */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20, marginBottom:20 }}>
            <Section title="Monthly Revenue">
              <LineChart series={revSeries} height={180} xLabels={monthLabels} />
            </Section>
            <Section title="Monthly Orders">
              <LineChart series={ordSeries} height={180} xLabels={monthLabels} />
            </Section>
          </div>

          {/* Category + Payment */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
            <Section title="Revenue by Category">
              {d.salesByCategory.map((c,i) => (
                <HBar key={c._id} label={c._id||"Other"} value={c.revenue} max={maxCat} color={PALETTE[i%PALETTE.length]} sub={`${c.units} units`} />
              ))}
            </Section>
            <Section title="Payment Methods">
              {d.paymentMethods.map((p,i) => (
                <div key={p._id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 0", borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <div style={{ width:8, height:8, borderRadius:"50%", background:PALETTE[i%PALETTE.length] }}/>
                    <span style={{ fontSize:13, color:"rgba(255,255,255,0.6)" }}>{p._id||"Unknown"}</span>
                  </div>
                  <div style={{ textAlign:"right" }}>
                    <div style={{ fontSize:13, color:"#fff" }}>{fmt(p.revenue)}</div>
                    <div style={{ fontSize:9, color:"rgba(255,255,255,0.3)", letterSpacing:"0.1em" }}>{p.count} TRANSACTIONS</div>
                  </div>
                </div>
              ))}
            </Section>
          </div>
        </>
      )}

      {/* ══════════════════════ REVENUE TAB ══════════════════════ */}
      {tab === "Revenue" && (
        <>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14, marginBottom:20 }}>
            <KpiCard label="Total Revenue"   value={Math.round(k.totalRevenue/100)} color={C.gold}  icon="💰" sub={fmt(k.totalRevenue)} />
            <KpiCard label="This Month"      value={Math.round((d.revenueByMonth.slice(-1)[0]?.revenue||0)/100)} color="#7ab87a" icon="📅" sub={fmt(d.revenueByMonth.slice(-1)[0]?.revenue||0)} />
            <KpiCard label="Avg Order Value" value={Math.round(k.avgOrderValue/100)} color="#7aa8c0" icon="🧾" sub={fmtFull(k.avgOrderValue)} />
          </div>

          <Section title="Monthly Revenue Trend">
            <LineChart series={[...revSeries, aovSeries[0]]} height={220} xLabels={monthLabels} />
          </Section>

          <Section title="Daily Revenue — Last 30 Days">
            <LineChart series={dayRevSeries} height={180} xLabels={dayLabels} showDots={false} />
          </Section>

          <Section title="Revenue by Category">
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
              <div>
                {d.salesByCategory.map((c,i) => (
                  <HBar key={c._id} label={c._id||"Other"} value={c.revenue} max={maxCat} color={PALETTE[i%PALETTE.length]} sub={`${c.units} units`} />
                ))}
              </div>
              <div>
                {d.salesByCategory.map((c,i) => {
                  const pct = Math.round((c.revenue/(d.salesByCategory.reduce((s,x)=>s+x.revenue,0)||1))*100);
                  return (
                    <div key={c._id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 0", borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                        <div style={{ width:10, height:10, background:PALETTE[i%PALETTE.length] }}/>
                        <span style={{ fontSize:12, color:"rgba(255,255,255,0.6)" }}>{c._id||"Other"}</span>
                      </div>
                      <div style={{ display:"flex", gap:16 }}>
                        <span style={{ fontSize:12, color:"#fff" }}>{pct}%</span>
                        <span style={{ fontSize:12, color:PALETTE[i%PALETTE.length] }}>{fmt(c.revenue)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </Section>
        </>
      )}

      {/* ══════════════════════ PRODUCTS TAB ══════════════════════ */}
      {tab === "Products" && (
        <>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14, marginBottom:20 }}>
            <KpiCard label="Active Products" value={k.totalProducts} color="#a08fc0" icon="👗"/>
            <KpiCard label="Top Category"    value={d.salesByCategory[0]?._id||"—"} color={C.gold} icon="🏆" />
            <KpiCard label="Total Units Sold" value={d.topProducts.reduce((s,p)=>s+p.unitsSold,0)} color="#7ab87a" icon="📦"/>
          </div>

          <Section title="Top Products by Units Sold">
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
              {d.topProducts.map((p,i) => (
                <div key={p._id} style={{ display:"flex", alignItems:"center", gap:14, padding:"12px 0", borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
                  <div style={{ width:28, height:28, background:PALETTE[i%PALETTE.length]+"22", border:`1px solid ${PALETTE[i%PALETTE.length]}40`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, color:PALETTE[i%PALETTE.length], fontFamily:"'Playfair Display',serif", flexShrink:0 }}>
                    {i+1}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:12, color:"rgba(255,255,255,0.8)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{p.name}</div>
                    <div style={{ height:4, background:"rgba(255,255,255,0.06)", marginTop:6 }}>
                      <div style={{ height:"100%", width:`${(p.revenue/maxProd)*100}%`, background:PALETTE[i%PALETTE.length], transition:"width 1s ease" }}/>
                    </div>
                  </div>
                  <div style={{ textAlign:"right", flexShrink:0 }}>
                    <div style={{ fontSize:12, color:"#fff", fontFamily:"'Playfair Display',serif" }}>{p.unitsSold} <span style={{ fontSize:9, color:"rgba(255,255,255,0.3)" }}>UNITS</span></div>
                    <div style={{ fontSize:10, color:PALETTE[i%PALETTE.length] }}>{fmt(p.revenue)}</div>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Category Breakdown">
            {d.salesByCategory.map((c,i) => (
              <HBar key={c._id} label={c._id||"Other"} value={c.revenue} max={maxCat} color={PALETTE[i%PALETTE.length]} sub={`${c.units} units sold`} />
            ))}
          </Section>
        </>
      )}

      {/* ══════════════════════ CUSTOMERS TAB ══════════════════════ */}
      {tab === "Customers" && (
        <>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14, marginBottom:20 }}>
            <KpiCard label="Total Customers" value={k.totalUsers} color="#7aa8c0" icon="👥"/>
            <KpiCard label="This Month New"  value={d.usersByMonth.slice(-1)[0]?.count||0} color="#7ab87a" icon="🆕"/>
            <KpiCard label="Avg LTV"         value={k.totalUsers > 0 ? Math.round(k.totalRevenue/(k.totalUsers*100)) : 0} color={C.gold} icon="💎" sub={`~${fmt(k.totalUsers > 0 ? k.totalRevenue/k.totalUsers : 0)}`}/>
          </div>

          <Section title="New Customer Growth">
            <LineChart series={usrSeries} height={200} xLabels={usrLabels} />
          </Section>

          <Section title="Daily Order Activity — Last 30 Days">
            <LineChart series={dayOrdSeries} height={160} xLabels={dayLabels} showDots={false} />
          </Section>
        </>
      )}

      {/* ══════════════════════ ORDERS TAB ══════════════════════ */}
      {tab === "Orders" && (
        <>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:20 }}>
            <KpiCard label="Total Orders"    value={k.totalOrders}  color="#7ab87a" icon="📦"/>
            <KpiCard label="Delivered"       value={d.ordersByStatus.find(s=>s._id==="Delivered")?.count||0} color="#7ab87a" icon="✅"/>
            <KpiCard label="In Transit"      value={(d.ordersByStatus.find(s=>s._id==="Shipped")?.count||0)+(d.ordersByStatus.find(s=>s._id==="Out for Delivery")?.count||0)} color={C.gold} icon="🚚"/>
            <KpiCard label="Cancelled"       value={d.ordersByStatus.find(s=>s._id==="Cancelled")?.count||0} color="#f09090" icon="❌"/>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20, marginBottom:20 }}>
            <Section title="Monthly Order Volume">
              <LineChart series={ordSeries} height={180} xLabels={monthLabels} />
            </Section>
            <Section title="Order Status Distribution">
              <div style={{ display:"flex", flexDirection:"column", gap:2 }}>
                {d.ordersByStatus.map((o,i) => {
                  const pct = Math.round((o.count/totalOrders)*100);
                  const color = PALETTE[i%PALETTE.length];
                  const [w, setW] = useState(0);
                  useEffect(() => { const t = setTimeout(()=>setW(pct),100+i*60); return ()=>clearTimeout(t); },[pct]);
                  return (
                    <div key={o._id} style={{ marginBottom:14 }}>
                      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                          <div style={{ width:8, height:8, borderRadius:"50%", background:color }}/>
                          <span style={{ fontSize:12, color:"rgba(255,255,255,0.65)" }}>{o._id}</span>
                        </div>
                        <span style={{ fontSize:12, color:"#fff" }}>{o.count} <span style={{ fontSize:9, color:"rgba(255,255,255,0.3)" }}>({pct}%)</span></span>
                      </div>
                      <div style={{ height:6, background:"rgba(255,255,255,0.06)" }}>
                        <div style={{ height:"100%", width:`${w}%`, background:`linear-gradient(90deg,${color},${color}88)`, transition:"width 0.9s cubic-bezier(0.34,1.56,0.64,1)" }}/>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Section>
          </div>

          <Section title="Daily Orders — Last 30 Days">
            <LineChart series={dayOrdSeries} height={160} xLabels={dayLabels} showDots={false} />
          </Section>
        </>
      )}
    </AdminLayout>
  );
}