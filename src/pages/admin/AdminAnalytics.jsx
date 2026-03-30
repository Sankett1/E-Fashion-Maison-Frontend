import { useState, useEffect } from "react";
import AdminLayout from "./AdminLayout";
import { C, Spinner } from "../../components/shared";
import { getRevenueChart, getOrderStats } from "../../api/adminApi";

const DEMO_CHART = [
  { _id: "2025-10", revenue: 520000, orders: 36 },
  { _id: "2025-11", revenue: 680000, orders: 47 },
  { _id: "2025-12", revenue: 1120000, orders: 78 },
  { _id: "2026-01", revenue: 890000, orders: 61 },
  { _id: "2026-02", revenue: 760000, orders: 54 },
  { _id: "2026-03", revenue: 1340000, orders: 92 },
];

const CATEGORY_DATA = [
  { label: "Women", value: 42, color: C.gold },
  { label: "Men", value: 31, color: "#7aa8c0" },
  { label: "Accessories", value: 19, color: "#a08fc0" },
  { label: "Kids", value: 8, color: "#7ab87a" },
];

export default function AdminAnalytics() {
  const [chart, setChart]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRevenueChart()
      .then(d => setChart(d.data?.length ? d.data : DEMO_CHART))
      .catch(() => setChart(DEMO_CHART))
      .finally(() => setLoading(false));
  }, []);

  const maxRev = Math.max(...chart.map(d => d.revenue), 1);
  const totalRev = chart.reduce((s, d) => s + d.revenue, 0);
  const totalOrders = chart.reduce((s, d) => s + d.orders, 0);
  const avgOrder = totalOrders ? Math.round(totalRev / totalOrders) : 0;

  return (
    <AdminLayout title="Analytics">
      {/* KPI cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px", marginBottom: "32px" }}>
        {[
          { label: "Total Revenue (12mo)", value: `₹${(totalRev / 100000).toFixed(1)}L`, color: C.gold },
          { label: "Total Orders (12mo)", value: totalOrders, color: "#7ab87a" },
          { label: "Avg. Order Value", value: `₹${avgOrder.toLocaleString()}`, color: "#7aa8c0" },
        ].map(k => (
          <div key={k.label} style={{ background: "linear-gradient(135deg,#0f0c08,#110e08)", border: "1px solid rgba(201,168,76,0.15)", padding: "28px", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: `linear-gradient(90deg, transparent, ${k.color}, transparent)` }} />
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: "30px", color: "#fff", marginBottom: "8px" }}>{k.value}</div>
            <div style={{ fontSize: "10px", letterSpacing: "0.16em", color: "rgba(255,255,255,0.35)" }}>{k.label.toUpperCase()}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "24px" }}>
        {/* Revenue chart */}
        <div style={{ background: "linear-gradient(135deg,#0f0c08,#110e08)", border: "1px solid rgba(201,168,76,0.15)", padding: "28px" }}>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: "17px", color: "#fff", marginBottom: "28px" }}>Monthly Revenue</div>
          {loading ? <div style={{ color: C.gold, textAlign: "center", padding: "40px" }}><Spinner /></div> : (
            <div>
              {/* Line chart simulation */}
              <div style={{ display: "flex", alignItems: "flex-end", gap: "8px", height: "200px", paddingBottom: "24px" }}>
                {chart.map((d, i) => (
                  <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                    <div style={{ fontSize: "9px", color: "rgba(255,255,255,0.35)" }}>₹{(d.revenue / 1000).toFixed(0)}K</div>
                    <div style={{ width: "100%", position: "relative", height: `${(d.revenue / maxRev) * 160}px`, minHeight: "4px" }}>
                      <div style={{ position: "absolute", bottom: 0, width: "100%", height: "100%", background: `linear-gradient(180deg, ${C.gold}dd, ${C.goldDark}88)`, transition: "height 0.8s ease" }} />
                    </div>
                    <div style={{ fontSize: "9px", color: "rgba(255,255,255,0.3)", marginTop: "2px" }}>{d._id?.slice(5)}/{d._id?.slice(2, 4)}</div>
                    <div style={{ fontSize: "9px", color: "rgba(255,255,255,0.2)" }}>{d.orders}o</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Category breakdown */}
        <div style={{ background: "linear-gradient(135deg,#0f0c08,#110e08)", border: "1px solid rgba(201,168,76,0.15)", padding: "28px" }}>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: "17px", color: "#fff", marginBottom: "24px" }}>Sales by Category</div>
          {CATEGORY_DATA.map(c => (
            <div key={c.label} style={{ marginBottom: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "7px" }}>
                <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.6)" }}>{c.label}</span>
                <span style={{ fontSize: "11px", color: c.color }}>{c.value}%</span>
              </div>
              <div style={{ height: "4px", background: "rgba(255,255,255,0.06)", borderRadius: "2px", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${c.value}%`, background: c.color, borderRadius: "2px", transition: "width 1s ease" }} />
              </div>
            </div>
          ))}

          <div style={{ marginTop: "28px", paddingTop: "20px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: "14px", color: "#fff", marginBottom: "16px" }}>Top Products</div>
            {[
              { name: "Belted Trench Coat", sales: 48 },
              { name: "Shawl Collar Overcoat", sales: 39 },
              { name: "Chelsea Boots", sales: 34 },
            ].map(p => (
              <div key={p.name} style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)" }}>{p.name}</span>
                <span style={{ fontSize: "11px", color: C.gold }}>{p.sales} sold</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
