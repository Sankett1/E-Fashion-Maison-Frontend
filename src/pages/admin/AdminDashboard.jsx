import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "./AdminLayout";
import { C, Spinner } from "../../components/shared";
import { getDashboardStats, getRevenueChart } from "../../api/adminApi";

// ── Demo fallbacks ─────────────────────────────────────────────────────────────
const DEMO_STATS = {
  stats: {
    totalUsers: 1284, totalProducts: 96, totalOrders: 347,
    totalRevenue: 8432000, thisMonthOrders: 42,
    thisMonthRevenue: 1120000, thisMonthUsers: 38,
    ordersGrowth: 18, revenueGrowth: 24, usersGrowth: 12,
  },
  recentOrders: [
    { _id:"o1", orderNumber:"MSN-2026-4821", user:{ name:"Anika Sharma" }, totalAmount:24900, status:"Processing", createdAt: new Date(Date.now()-3600000).toISOString() },
    { _id:"o2", orderNumber:"MSN-2026-4820", user:{ name:"Rohan Mehta"  }, totalAmount:12750, status:"Shipped",    createdAt: new Date(Date.now()-7200000).toISOString() },
    { _id:"o3", orderNumber:"MSN-2026-4819", user:{ name:"Priya Nair"   }, totalAmount:33100, status:"Delivered",  createdAt: new Date(Date.now()-18000000).toISOString() },
    { _id:"o4", orderNumber:"MSN-2026-4818", user:{ name:"Dev Kapoor"   }, totalAmount:8400,  status:"Pending",    createdAt: new Date(Date.now()-36000000).toISOString() },
    { _id:"o5", orderNumber:"MSN-2026-4817", user:{ name:"Meera Singh"  }, totalAmount:19200, status:"Cancelled",  createdAt: new Date(Date.now()-72000000).toISOString() },
  ],
  lowStockProducts: [
    { _id:"p1", name:"Cashmere Cardigan",    stock:2, category:"Women" },
    { _id:"p2", name:"Shawl Collar Coat",    stock:3, category:"Men"   },
    { _id:"p3", name:"Silk Scarf — Crimson", stock:1, category:"Accessories" },
  ],
  statusBreakdown: [
    { _id:"Delivered", count:189 },{ _id:"Processing", count:72 },
    { _id:"Shipped", count:54 },{ _id:"Pending", count:22 },{ _id:"Cancelled", count:10 },
  ],
};

const DEMO_CHART = [
  { _id:"2025-10", revenue:520000, orders:36 },{ _id:"2025-11", revenue:680000, orders:47 },
  { _id:"2025-12", revenue:1120000, orders:78 },{ _id:"2026-01", revenue:890000, orders:61 },
  { _id:"2026-02", revenue:760000, orders:54 },{ _id:"2026-03", revenue:1340000, orders:92 },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
const statusConfig = {
  Delivered:        { color:"#7ab87a", bg:"rgba(122,184,122,0.1)",  dot:"#7ab87a" },
  Shipped:          { color:C.gold,    bg:"rgba(201,168,76,0.1)",   dot:C.gold    },
  Processing:       { color:"#d4a04a", bg:"rgba(212,160,74,0.1)",   dot:"#d4a04a" },
  Pending:          { color:"#b0a08a", bg:"rgba(176,160,138,0.1)",  dot:"#b0a08a" },
  Cancelled:        { color:"#f09090", bg:"rgba(240,144,144,0.1)",  dot:"#f09090" },
  "Out for Delivery":{ color:C.gold,   bg:"rgba(201,168,76,0.1)",   dot:C.gold    },
  Refunded:         { color:"#a08fc0", bg:"rgba(160,143,192,0.1)",  dot:"#a08fc0" },
};
const sc = s => statusConfig[s] || { color:"#888", bg:"rgba(136,136,136,0.1)", dot:"#888" };

function timeAgo(iso) {
  const s = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s/60)}m ago`;
  if (s < 86400) return `${Math.floor(s/3600)}h ago`;
  return `${Math.floor(s/86400)}d ago`;
}

const fmt = n => n >= 10000000 ? `₹${(n/10000000).toFixed(1)}Cr` : n >= 100000 ? `₹${(n/100000).toFixed(1)}L` : `₹${(n/1000).toFixed(0)}K`;

// ── Animated counter ──────────────────────────────────────────────────────────
function CountUp({ to, prefix = "", suffix = "", decimals = 0, duration = 1400 }) {
  const [val, setVal] = useState(0);
  const raf = useRef(null);
  useEffect(() => {
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setVal(+(to * ease).toFixed(decimals));
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [to, duration, decimals]);
  return <>{prefix}{typeof val === "number" && decimals ? val.toFixed(decimals) : val.toLocaleString("en-IN")}{suffix}</>;
}

// ── Mini sparkline SVG ────────────────────────────────────────────────────────
function Sparkline({ data, color = C.gold, height = 36, width = 100 }) {
  if (!data || data.length < 2) return null;
  const min = Math.min(...data), max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * width},${height - ((v - min) / range) * (height - 4) - 2}`);
  const d = `M ${pts.join(" L ")}`;
  const fill = `M ${pts[0]} L ${pts.join(" L ")} L ${width},${height} L 0,${height} Z`;
  return (
    <svg viewBox={`0 0 ${width} ${height}`} style={{ width: "100%", height }} preserveAspectRatio="none">
      <defs>
        <linearGradient id={`sg${color.replace("#","")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <path d={fill} fill={`url(#sg${color.replace("#","")})`}/>
      <path d={d} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

// ── KPI Card ──────────────────────────────────────────────────────────────────
function KpiCard({ label, value, display, growth, color, sparkData, icon, onClick }) {
  const [hover, setHover] = useState(false);
  const pos = growth > 0, neutral = growth === 0;
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: hover ? "linear-gradient(135deg,#120e09,#150e09)" : "linear-gradient(135deg,#0f0c08,#110e08)",
        border: `1px solid ${hover ? "rgba(201,168,76,0.3)" : "rgba(201,168,76,0.15)"}`,
        padding: "24px", cursor: onClick ? "pointer" : "default",
        transition: "all 0.25s", position: "relative", overflow: "hidden",
      }}
    >
      <div style={{ position:"absolute", top:0, left:0, right:0, height:2, background:`linear-gradient(90deg,transparent,${color},transparent)` }}/>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
        <div style={{ fontSize:24 }}>{icon}</div>
        {growth !== undefined && (
          <div style={{ fontSize:10, letterSpacing:"0.1em", padding:"3px 8px", background: pos ? "rgba(122,184,122,0.12)" : neutral ? "rgba(176,160,138,0.12)" : "rgba(240,144,144,0.12)", color: pos ? "#7ab87a" : neutral ? "#b0a08a" : "#f09090", border:`1px solid ${pos ? "rgba(122,184,122,0.2)" : "rgba(240,144,144,0.2)"}` }}>
            {pos ? "↑" : neutral ? "—" : "↓"} {Math.abs(growth)}%
          </div>
        )}
      </div>
      <div style={{ fontFamily:"'DM Serif Display',serif", fontSize:30, color:"#fff", marginBottom:4, lineHeight:1 }}>
        <CountUp to={typeof value === "number" ? value : 0} />
        {display && <span style={{ fontSize:15, color:"rgba(255,255,255,0.6)", marginLeft:4 }}>{display}</span>}
      </div>
      <div style={{ fontSize:"12px", letterSpacing:"0.18em", color:"rgba(255,255,255,0.35)", marginBottom:12 }}>{label.toUpperCase()}</div>
      {sparkData && <Sparkline data={sparkData} color={color} height={32} />}
    </div>
  );
}

// ── Bar chart ─────────────────────────────────────────────────────────────────
function BarChart({ data, height = 160, color = C.gold }) {
  const maxRev = Math.max(...data.map(d => d.revenue), 1);
  const [hovered, setHovered] = useState(null);
  return (
    <div style={{ display:"flex", alignItems:"flex-end", gap:6, height, paddingBottom:24, position:"relative" }}>
      {data.map((d, i) => {
        const barH = Math.max((d.revenue / maxRev) * (height - 30), 4);
        const isH = hovered === i;
        const month = d._id?.slice(5) || "";
        const year  = d._id?.slice(2,4) || "";
        return (
          <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:4, position:"relative" }}
            onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}>
            {isH && (
              <div style={{ position:"absolute", bottom: barH + 36, left:"50%", transform:"translateX(-50%)", background:"#1a1208", border:`1px solid ${color}40`, padding:"6px 10px", zIndex:10, whiteSpace:"nowrap", pointerEvents:"none" }}>
                <div style={{ fontSize:11, color:"#fff", fontFamily:"'DM Serif Display',serif" }}>₹{(d.revenue/1000).toFixed(0)}K</div>
                <div style={{ fontSize:12, color:"rgba(255,255,255,0.4)", letterSpacing:"0.1em" }}>{d.orders} ORDERS</div>
              </div>
            )}
            <div style={{ width:"100%", height:barH, background: isH ? `linear-gradient(180deg,${color},${color}aa)` : `linear-gradient(180deg,${color}cc,${color}55)`, transition:"height 0.7s cubic-bezier(0.34,1.56,0.64,1), background 0.2s", position:"relative" }}>
              {isH && <div style={{ position:"absolute", inset:0, background:"rgba(255,255,255,0.06)" }}/>}
            </div>
            <div style={{ fontSize:12, color:"rgba(255,255,255,0.3)", position:"absolute", bottom:0, letterSpacing:"0.05em" }}>{month}/{year}</div>
          </div>
        );
      })}
    </div>
  );
}

// ── Donut chart ───────────────────────────────────────────────────────────────
const DONUT_COLORS = ["#7ab87a","#c9a84c","#7aa8c0","#d4a04a","#f09090","#a08fc0"];
function DonutChart({ data, size = 120 }) {
  const total = data.reduce((s, d) => s + d.count, 0) || 1;
  let cumAngle = -90;
  const r = size / 2 - 12, cx = size / 2, cy = size / 2;
  const [hovered, setHovered] = useState(null);
  const slices = data.map((d, i) => {
    const angle = (d.count / total) * 360;
    const start = cumAngle;
    cumAngle += angle;
    const r1 = (start * Math.PI) / 180, r2 = ((start + angle) * Math.PI) / 180;
    const x1 = cx + r * Math.cos(r1), y1 = cy + r * Math.sin(r1);
    const x2 = cx + r * Math.cos(r2), y2 = cy + r * Math.sin(r2);
    const large = angle > 180 ? 1 : 0;
    return { ...d, path:`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`, color: DONUT_COLORS[i % DONUT_COLORS.length] };
  });
  return (
    <svg width={size} height={size} style={{ flexShrink:0 }}>
      {slices.map((s, i) => (
        <path key={i} d={s.path} fill={s.color}
          opacity={hovered === null || hovered === i ? 1 : 0.4}
          style={{ transition:"opacity 0.2s", cursor:"pointer" }}
          onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}
        />
      ))}
      <circle cx={cx} cy={cy} r={r * 0.55} fill="#0f0c08"/>
      {hovered !== null && (
        <>
          <text x={cx} y={cy - 6} textAnchor="middle" fill="#fff" fontSize={13} fontFamily="'DM Serif Display',serif">{slices[hovered]?.count}</text>
          <text x={cx} y={cy + 8} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize={8}>{((slices[hovered]?.count / total) * 100).toFixed(0)}%</text>
        </>
      )}
    </svg>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [stats, setStats]     = useState(null);
  const [chart, setChart]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(null);
  const navigate = useNavigate();

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([getDashboardStats(), getRevenueChart()])
      .then(([s, c]) => {
        setStats(s.success ? s : DEMO_STATS);
        setChart(c.data?.length ? c.data : DEMO_CHART);
        setLastRefresh(new Date());
      })
      .catch(() => { setStats(DEMO_STATS); setChart(DEMO_CHART); setLastRefresh(new Date()); })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { /* no auto-fetch — use the Refresh button */ }, []);

  if (!stats) return (
    <AdminLayout title="Dashboard">
      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", paddingTop:120, gap:20 }}>
        <div style={{ fontSize:48, opacity:0.3 }}>📊</div>
        <div style={{ fontFamily:"'DM Serif Display',serif", fontSize:20, color:"rgba(255,255,255,0.3)" }}>No data loaded yet</div>
        <div style={{ fontSize:12, color:"rgba(255,255,255,0.2)", fontFamily:"'DM Sans',sans-serif" }}>Click the Refresh button to load dashboard data</div>
        <button onClick={load} style={{ marginTop:8, padding:"12px 32px", background:"rgba(201,168,76,0.1)", border:`1px solid ${C.gold}`, color:C.gold, fontSize:"10px", letterSpacing:"0.2em", cursor:"pointer", fontFamily:"inherit" }}>
          ↻ LOAD DATA
        </button>
      </div>
    </AdminLayout>
  );

  const s  = stats?.stats || {};
  const sparkRevenue = chart.map(d => d.revenue);
  const sparkOrders  = chart.map(d => d.orders);
  const totalStatusCount = (stats?.statusBreakdown || []).reduce((a, b) => a + b.count, 0);

  return (
    <AdminLayout title="Dashboard">
      {/* Top bar */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:28, flexWrap:"wrap", gap:12 }}>
        <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13, color:"rgba(255,255,255,0.3)" }}>
          {lastRefresh ? `Last updated ${timeAgo(lastRefresh.toISOString())}` : "Loading…"}
        </div>
        <div style={{ display:"flex", gap:10 }}>
          <button onClick={load} disabled={loading} style={{ padding:"8px 18px", background:"none", border:"1px solid rgba(201,168,76,0.25)", color:C.gold, fontSize:"12px", letterSpacing:"0.16em", cursor:"pointer", fontFamily:"inherit", opacity: loading ? 0.5 : 1 }}>
            {loading ? "REFRESHING…" : "↻ REFRESH"}
          </button>
          <button onClick={() => navigate("/admin/analytics")} style={{ padding:"8px 18px", background:"rgba(201,168,76,0.08)", border:`1px solid ${C.gold}40`, color:C.gold, fontSize:"12px", letterSpacing:"0.16em", cursor:"pointer", fontFamily:"inherit" }}>
            VIEW ANALYTICS →
          </button>
        </div>
      </div>

      {/* ── KPI Grid ────────────────────────────────────────────────────────── */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:28 }}>
        <KpiCard label="Total Revenue" value={Math.round((s.totalRevenue||0)/100000)} display="L" growth={s.revenueGrowth} color={C.gold} sparkData={sparkRevenue} icon="💰" onClick={() => navigate("/admin/analytics")} />
        <KpiCard label="Total Orders"  value={s.totalOrders||0}   growth={s.ordersGrowth}  color="#7ab87a" sparkData={sparkOrders} icon="📦" onClick={() => navigate("/admin/orders")} />
        <KpiCard label="Active Products" value={s.totalProducts||0} color="#a08fc0" icon="👗" onClick={() => navigate("/admin/products")} />
        <KpiCard label="Customers" value={s.totalUsers||0} growth={s.usersGrowth} color="#7aa8c0" icon="👥" onClick={() => navigate("/admin/customers")} />
      </div>

      {/* ── This Month ──────────────────────────────────────────────────────── */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16, marginBottom:28 }}>
        {[
          { label:"This Month Revenue", value: fmt(s.thisMonthRevenue||0), growth: s.revenueGrowth, color:C.gold },
          { label:"This Month Orders",  value: s.thisMonthOrders||0,       growth: s.ordersGrowth,  color:"#7ab87a" },
          { label:"New Customers",      value: s.thisMonthUsers||0,        growth: s.usersGrowth,   color:"#7aa8c0" },
        ].map(k => (
          <div key={k.label} style={{ padding:"18px 22px", background:"linear-gradient(135deg,#0c0a06,#0f0c07)", border:"1px solid rgba(201,168,76,0.1)", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <div>
              <div style={{ fontFamily:"'DM Serif Display',serif", fontSize:22, color:"#fff", marginBottom:4 }}>{k.value}</div>
              <div style={{ fontSize:"12px", letterSpacing:"0.16em", color:"rgba(255,255,255,0.3)" }}>{k.label.toUpperCase()}</div>
            </div>
            {k.growth !== undefined && (
              <div style={{ fontSize:11, padding:"4px 10px", background: k.growth >= 0 ? "rgba(122,184,122,0.1)" : "rgba(240,144,144,0.1)", color: k.growth >= 0 ? "#7ab87a" : "#f09090", border:`1px solid ${k.growth >= 0 ? "rgba(122,184,122,0.2)" : "rgba(240,144,144,0.2)"}` }}>
                {k.growth >= 0 ? "↑" : "↓"} {Math.abs(k.growth)}%
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ── Revenue Chart + Recent Orders ───────────────────────────────────── */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 380px", gap:20, marginBottom:20 }}>
        {/* Chart */}
        <div style={{ background:"linear-gradient(135deg,#0f0c08,#110e08)", border:"1px solid rgba(201,168,76,0.15)", padding:24 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
            <div style={{ fontFamily:"'DM Serif Display',serif", fontSize:17, color:"#fff" }}>Revenue Overview</div>
            <div style={{ fontSize:10, color:"rgba(255,255,255,0.25)", letterSpacing:"0.1em" }}>{chart.length} MONTHS</div>
          </div>
          <BarChart data={chart} height={180} />
          <div style={{ display:"flex", justifyContent:"space-between", marginTop:8, paddingTop:12, borderTop:"1px solid rgba(255,255,255,0.05)" }}>
            <div>
              <div style={{ fontSize:11, color:"rgba(255,255,255,0.25)", letterSpacing:"0.12em", marginBottom:2 }}>TOTAL REVENUE</div>
              <div style={{ fontFamily:"'DM Serif Display',serif", fontSize:18, color:C.gold }}>{fmt(chart.reduce((s,d)=>s+d.revenue,0))}</div>
            </div>
            <div style={{ textAlign:"right" }}>
              <div style={{ fontSize:11, color:"rgba(255,255,255,0.25)", letterSpacing:"0.12em", marginBottom:2 }}>TOTAL ORDERS</div>
              <div style={{ fontFamily:"'DM Serif Display',serif", fontSize:18, color:"#7ab87a" }}>{chart.reduce((s,d)=>s+d.orders,0)}</div>
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div style={{ background:"linear-gradient(135deg,#0f0c08,#110e08)", border:"1px solid rgba(201,168,76,0.15)", padding:24, display:"flex", flexDirection:"column" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
            <div style={{ fontFamily:"'DM Serif Display',serif", fontSize:17, color:"#fff" }}>Recent Orders</div>
            <span onClick={() => navigate("/admin/orders")} style={{ fontSize:"12px", letterSpacing:"0.14em", color:C.gold, cursor:"pointer" }}>VIEW ALL →</span>
          </div>
          <div style={{ flex:1, overflowY:"auto" }}>
            {(stats?.recentOrders||[]).map(o => {
              const cfg = sc(o.status);
              return (
                <div key={o._id}
                  onClick={() => navigate("/admin/orders")}
                  style={{ display:"flex", alignItems:"center", gap:12, padding:"11px 0", borderBottom:"1px solid rgba(255,255,255,0.04)", cursor:"pointer" }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(201,168,76,0.03)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  <div style={{ width:8, height:8, borderRadius:"50%", background:cfg.dot, flexShrink:0 }}/>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:12, color:"rgba(255,255,255,0.8)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", fontFamily:"'DM Serif Display',serif" }}>
                      {o.user?.name || "Customer"}
                    </div>
                    <div style={{ fontSize:12, color:"rgba(255,255,255,0.25)", marginTop:2, letterSpacing:"0.08em" }}>
                      {o.orderNumber} · {timeAgo(o.createdAt)}
                    </div>
                  </div>
                  <div style={{ textAlign:"right", flexShrink:0 }}>
                    <div style={{ fontSize:12, color:"rgba(255,255,255,0.7)", fontFamily:"'DM Serif Display',serif" }}>₹{(o.totalAmount||0).toLocaleString("en-IN")}</div>
                    <div style={{ fontSize:11, letterSpacing:"0.1em", color:cfg.color, marginTop:2 }}>{o.status?.toUpperCase()}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Order Status + Low Stock ─────────────────────────────────────────── */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
        {/* Status donut */}
        <div style={{ background:"linear-gradient(135deg,#0f0c08,#110e08)", border:"1px solid rgba(201,168,76,0.15)", padding:24 }}>
          <div style={{ fontFamily:"'DM Serif Display',serif", fontSize:17, color:"#fff", marginBottom:20 }}>Order Status</div>
          <div style={{ display:"flex", alignItems:"center", gap:24 }}>
            <DonutChart data={stats?.statusBreakdown||[]} size={120} />
            <div style={{ flex:1 }}>
              {(stats?.statusBreakdown||[]).map((d, i) => (
                <div key={d._id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <div style={{ width:8, height:8, borderRadius:"50%", background:DONUT_COLORS[i % DONUT_COLORS.length], flexShrink:0 }}/>
                    <span style={{ fontSize:11, color:"rgba(255,255,255,0.5)" }}>{d._id}</span>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <span style={{ fontSize:11, color:"rgba(255,255,255,0.7)" }}>{d.count}</span>
                    <span style={{ fontSize:12, color:"rgba(255,255,255,0.25)" }}>{totalStatusCount ? Math.round((d.count/totalStatusCount)*100) : 0}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Low stock */}
        <div style={{ background:"linear-gradient(135deg,#0f0c08,#110e08)", border:`1px solid ${(stats?.lowStockProducts||[]).length ? "rgba(240,144,144,0.25)" : "rgba(201,168,76,0.15)"}`, padding:24 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
            <div style={{ fontFamily:"'DM Serif Display',serif", fontSize:17, color: (stats?.lowStockProducts||[]).length ? "#f09090" : "#fff" }}>
              {(stats?.lowStockProducts||[]).length ? "⚠ Low Stock Alert" : "Stock Status"}
            </div>
            <span onClick={() => navigate("/admin/products")} style={{ fontSize:"12px", letterSpacing:"0.12em", color:C.gold, cursor:"pointer" }}>MANAGE →</span>
          </div>
          {(stats?.lowStockProducts||[]).length === 0 ? (
            <div style={{ textAlign:"center", padding:"32px 0", fontFamily:"'DM Sans',sans-serif", fontSize:15, color:"rgba(122,184,122,0.6)" }}>✓ All products well stocked</div>
          ) : (
            (stats?.lowStockProducts||[]).map(p => (
              <div key={p._id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"11px 0", borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
                <div>
                  <div style={{ fontSize:12, color:"rgba(255,255,255,0.75)" }}>{p.name}</div>
                  <div style={{ fontSize:12, color:"rgba(255,255,255,0.3)", letterSpacing:"0.1em", marginTop:2 }}>{(p.category||"").toUpperCase()}</div>
                </div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ fontSize:14, fontFamily:"'DM Serif Display',serif", color: p.stock <= 1 ? "#f09090" : "#d4a04a" }}>{p.stock}</div>
                  <div style={{ fontSize:12, color:"rgba(255,255,255,0.3)", letterSpacing:"0.08em" }}>UNITS LEFT</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  );
}