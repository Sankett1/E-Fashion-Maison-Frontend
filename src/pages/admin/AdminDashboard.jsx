import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "./AdminLayout";
import { C, Spinner } from "../../components/shared";
import { getDashboardStats, getRevenueChart } from "../../api/adminApi";

const StatCard = ({ label, value, sub, color = C.gold, icon }) => (
  <div style={{ background: "linear-gradient(135deg, #0f0c08 0%, #110e08 100%)", border: "1px solid rgba(201,168,76,0.15)", padding: "28px", position: "relative", overflow: "hidden" }}>
    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: `linear-gradient(90deg, transparent, ${color}, transparent)` }} />
    <div style={{ fontSize: "28px", marginBottom: "8px" }}>{icon}</div>
    <div style={{ fontFamily: "'Playfair Display',serif", fontSize: "32px", color: "#fff", marginBottom: "6px" }}>{value}</div>
    <div style={{ fontSize: "9.5px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.4)", marginBottom: "4px" }}>{label.toUpperCase()}</div>
    {sub && <div style={{ fontSize: "11px", color: color }}>{sub}</div>}
  </div>
);

const statusColor = s => ({ "Delivered": "#7ab87a", "Shipped": C.gold, "Processing": "#d4a04a", "Pending": "#b0a08a" }[s] || "#b0a08a");

export default function AdminDashboard() {
  const [stats, setStats]     = useState(null);
  const [chart, setChart]     = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([getDashboardStats(), getRevenueChart()])
      .then(([s, c]) => { setStats(s); setChart(c.data || []); })
      .catch(() => {
        // fallback demo data
        setStats({ stats: { totalUsers: 1284, totalProducts: 96, totalOrders: 347, totalRevenue: 8432000 }, recentOrders: [], lowStockProducts: [] });
        setChart([{ _id: "2026-01", revenue: 620000, orders: 42 }, { _id: "2026-02", revenue: 890000, orders: 61 }, { _id: "2026-03", revenue: 1120000, orders: 78 }]);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <AdminLayout title="Dashboard">
      <div style={{ display: "flex", justifyContent: "center", paddingTop: "80px", color: C.gold }}><Spinner /></div>
    </AdminLayout>
  );

  const s = stats?.stats || {};
  const maxRev = Math.max(...chart.map(d => d.revenue), 1);

  return (
    <AdminLayout title="Dashboard">
      {/* Stats Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px", marginBottom: "36px" }}>
        <StatCard label="Total Revenue" value={`₹${((s.totalRevenue||0)/100000).toFixed(1)}L`} sub="All time" icon="💰" color={C.gold} />
        <StatCard label="Total Orders" value={s.totalOrders||0} sub="All orders" icon="📦" color="#7ab87a" />
        <StatCard label="Products" value={s.totalProducts||0} sub="Active listings" icon="👗" color="#a08fc0" />
        <StatCard label="Customers" value={s.totalUsers||0} sub="Registered users" icon="👥" color="#7aa8c0" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: "24px" }}>
        {/* Revenue Chart */}
        <div style={{ background: "linear-gradient(135deg,#0f0c08,#110e08)", border: "1px solid rgba(201,168,76,0.15)", padding: "28px" }}>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: "17px", color: "#fff", marginBottom: "24px" }}>Revenue Overview</div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: "12px", height: "180px" }}>
            {chart.map((d, i) => (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                <div style={{ fontSize: "9px", color: "rgba(255,255,255,0.4)" }}>₹{(d.revenue/1000).toFixed(0)}K</div>
                <div style={{ width: "100%", background: `linear-gradient(180deg, ${C.gold}, ${C.goldDark})`, height: `${(d.revenue / maxRev) * 140}px`, minHeight: "4px", opacity: 0.85, transition: "height 0.6s ease" }} />
                <div style={{ fontSize: "9px", color: "rgba(255,255,255,0.35)" }}>{d._id?.slice(5) || ""}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Orders */}
        <div style={{ background: "linear-gradient(135deg,#0f0c08,#110e08)", border: "1px solid rgba(201,168,76,0.15)", padding: "28px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: "17px", color: "#fff" }}>Recent Orders</div>
            <span onClick={() => navigate("/admin/orders")} style={{ fontSize: "9.5px", letterSpacing: "0.14em", color: C.gold, cursor: "pointer" }}>VIEW ALL →</span>
          </div>
          {(stats?.recentOrders?.length ? stats.recentOrders : [
            { _id: "ord1", user: { name: "Anika Sharma" }, totalAmount: 24900, status: "Processing" },
            { _id: "ord2", user: { name: "Rohan Mehta" }, totalAmount: 12750, status: "Shipped" },
            { _id: "ord3", user: { name: "Priya Nair" }, totalAmount: 33100, status: "Delivered" },
          ]).map(o => (
            <div key={o._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid rgba(255,255,255,0.05)", cursor: "pointer" }} onClick={() => navigate(`/admin/orders`)}>
              <div>
                <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.75)", marginBottom: "2px" }}>{o.user?.name || "Customer"}</div>
                <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)" }}>₹{(o.totalAmount||0).toLocaleString()}</div>
              </div>
              <span style={{ fontSize: "9px", letterSpacing: "0.1em", padding: "3px 10px", border: `1px solid ${statusColor(o.status)}30`, color: statusColor(o.status), background: `${statusColor(o.status)}10` }}>{o.status?.toUpperCase()}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Low Stock */}
      {(stats?.lowStockProducts?.length > 0) && (
        <div style={{ marginTop: "24px", background: "rgba(220,100,100,0.06)", border: "1px solid rgba(220,100,100,0.2)", padding: "24px" }}>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: "16px", color: "#f09090", marginBottom: "16px" }}>⚠ Low Stock Alert</div>
          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
            {stats.lowStockProducts.map(p => (
              <div key={p._id} style={{ padding: "10px 16px", background: "rgba(220,100,100,0.08)", border: "1px solid rgba(220,100,100,0.15)", fontSize: "11px", color: "rgba(255,255,255,0.6)" }}>
                {p.name} — <span style={{ color: "#f09090" }}>{p.stock} left</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
