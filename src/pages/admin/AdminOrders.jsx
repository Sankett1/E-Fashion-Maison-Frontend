import { useState, useEffect } from "react";
import AdminLayout from "./AdminLayout";
import { C, Spinner } from "../../components/shared";
import { getAllOrdersAdmin, updateOrderStatus } from "../../api/adminApi";

const STATUSES = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];
const statusColor = s => ({ Delivered: "#7ab87a", Shipped: C.gold, Processing: "#d4a04a", Pending: "#b0a08a", Cancelled: "#f09090" }[s] || "#b0a08a");

const DEMO_ORDERS = [
  { _id: "MSN-001", user: { name: "Anika Sharma", email: "anika@example.com" }, totalAmount: 33100, status: "Delivered", createdAt: "2026-03-22", orderItems: [{ name: "Silk Blouse" }, { name: "Trench Coat" }] },
  { _id: "MSN-002", user: { name: "Rohan Mehta", email: "rohan@example.com" }, totalAmount: 12750, status: "Shipped", createdAt: "2026-03-24", orderItems: [{ name: "Chelsea Boots" }] },
  { _id: "MSN-003", user: { name: "Priya Nair", email: "priya@example.com" }, totalAmount: 22000, status: "Processing", createdAt: "2026-03-27", orderItems: [{ name: "Wool Blazer" }] },
  { _id: "MSN-004", user: { name: "Vikram Singh", email: "vikram@example.com" }, totalAmount: 8200, status: "Pending", createdAt: "2026-03-28", orderItems: [{ name: "Silk Blouse" }] },
  { _id: "MSN-005", user: { name: "Meera Iyer", email: "meera@example.com" }, totalAmount: 19500, status: "Cancelled", createdAt: "2026-03-20", orderItems: [{ name: "Cashmere Cardigan" }] },
];

export default function AdminOrders() {
  const [orders, setOrders]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState("All");
  const [selected, setSelected] = useState(null);
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    getAllOrdersAdmin()
      .then(d => setOrders(d.orders || []))
      .catch(() => setOrders(DEMO_ORDERS))
      .finally(() => setLoading(false));
  }, []);

  const handleStatus = async (id, status) => {
    setUpdating(id);
    try {
      await updateOrderStatus(id, status);
      setOrders(o => o.map(x => x._id === id ? { ...x, status } : x));
      if (selected?._id === id) setSelected(s => ({ ...s, status }));
    } catch { alert("Error updating status"); }
    finally { setUpdating(null); }
  };

  const filtered = filter === "All" ? orders : orders.filter(o => o.status === filter);

  return (
    <AdminLayout title="Orders">
      {/* Filter tabs */}
      <div style={{ display: "flex", gap: "4px", marginBottom: "24px", borderBottom: "1px solid rgba(201,168,76,0.12)", paddingBottom: "0" }}>
        {["All", ...STATUSES].map(s => (
          <button key={s} onClick={() => setFilter(s)} style={{ padding: "10px 18px", background: "none", border: "none", borderBottom: filter === s ? `2px solid ${C.gold}` : "2px solid transparent", color: filter === s ? C.gold : "rgba(255,255,255,0.4)", fontSize: "10px", letterSpacing: "0.14em", cursor: "pointer", fontFamily: "inherit", marginBottom: "-1px", transition: "all 0.2s" }}>
            {s.toUpperCase()}
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: selected ? "1fr 360px" : "1fr", gap: "20px" }}>
        {/* Table */}
        <div style={{ background: "linear-gradient(135deg,#0f0c08,#110e08)", border: "1px solid rgba(201,168,76,0.15)" }}>
          {loading ? (
            <div style={{ padding: "48px", textAlign: "center", color: C.gold }}><Spinner /></div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(201,168,76,0.15)" }}>
                  {["Order ID", "Customer", "Items", "Amount", "Date", "Status", "Action"].map(h => (
                    <th key={h} style={{ padding: "14px 16px", textAlign: "left", fontSize: "9px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.3)", fontWeight: 400 }}>{h.toUpperCase()}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(o => (
                  <tr key={o._id} onClick={() => setSelected(o)} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", cursor: "pointer", background: selected?._id === o._id ? "rgba(201,168,76,0.05)" : "", transition: "background 0.15s" }}
                    onMouseEnter={e => { if (selected?._id !== o._id) e.currentTarget.style.background = "rgba(255,255,255,0.02)"; }}
                    onMouseLeave={e => { if (selected?._id !== o._id) e.currentTarget.style.background = ""; }}>
                    <td style={{ padding: "13px 16px", fontSize: "11px", color: C.gold, fontFamily: "'DM Sans',sans-serif" }}>{o._id?.slice(-6) || o._id}</td>
                    <td style={{ padding: "13px 16px" }}>
                      <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.75)" }}>{o.user?.name}</div>
                      <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)" }}>{o.user?.email}</div>
                    </td>
                    <td style={{ padding: "13px 16px", fontSize: "11px", color: "rgba(255,255,255,0.4)" }}>{o.orderItems?.length || 1} item{o.orderItems?.length !== 1 ? "s" : ""}</td>
                    <td style={{ padding: "13px 16px", fontSize: "13px", color: "#fff" }}>₹{o.totalAmount?.toLocaleString()}</td>
                    <td style={{ padding: "13px 16px", fontSize: "10px", color: "rgba(255,255,255,0.35)" }}>{o.createdAt?.slice(0, 10)}</td>
                    <td style={{ padding: "13px 16px" }}>
                      <span style={{ fontSize: "9px", letterSpacing: "0.1em", padding: "3px 10px", border: `1px solid ${statusColor(o.status)}40`, color: statusColor(o.status), background: `${statusColor(o.status)}10` }}>{o.status?.toUpperCase()}</span>
                    </td>
                    <td style={{ padding: "13px 16px" }} onClick={e => e.stopPropagation()}>
                      <select value={o.status} onChange={e => handleStatus(o._id, e.target.value)} disabled={updating === o._id}
                        style={{ background: "#0f0c08", border: "1px solid rgba(201,168,76,0.2)", color: C.gold, fontSize: "9.5px", padding: "4px 8px", cursor: "pointer", fontFamily: "inherit", outline: "none" }}>
                        {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
                {!filtered.length && (
                  <tr><td colSpan={7} style={{ padding: "48px", textAlign: "center", color: "rgba(255,255,255,0.2)", fontSize: "13px" }}>No orders found</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Detail Panel */}
        {selected && (
          <div style={{ background: "linear-gradient(135deg,#0f0c08,#110e08)", border: "1px solid rgba(201,168,76,0.15)", padding: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
              <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: "16px", color: "#fff" }}>Order Detail</div>
              <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.3)", cursor: "pointer", fontSize: "18px" }}>×</button>
            </div>
            <div style={{ fontSize: "11px", color: C.gold, marginBottom: "16px", letterSpacing: "0.1em" }}>#{selected._id}</div>
            <div style={{ marginBottom: "16px", padding: "14px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.8)", marginBottom: "4px" }}>{selected.user?.name}</div>
              <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)" }}>{selected.user?.email}</div>
            </div>
            {(selected.orderItems || []).map((item, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.05)", fontSize: "12px", color: "rgba(255,255,255,0.7)" }}>
                <span>{item.name}</span>
                {item.price && <span style={{ color: C.gold }}>₹{item.price?.toLocaleString()}</span>}
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "16px", paddingTop: "12px", borderTop: "1px solid rgba(201,168,76,0.2)" }}>
              <span style={{ fontSize: "11px", letterSpacing: "0.14em", color: "rgba(255,255,255,0.4)" }}>TOTAL</span>
              <span style={{ fontFamily: "'DM Serif Display',serif", fontSize: "18px", color: "#fff" }}>₹{selected.totalAmount?.toLocaleString()}</span>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
