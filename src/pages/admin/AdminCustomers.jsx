import { useState, useEffect } from "react";
import AdminLayout from "./AdminLayout";
import { C, Spinner } from "../../components/shared";
import { getAllUsers, updateUserRole, deactivateUser } from "../../api/adminApi";

const DEMO_USERS = [
  { _id: "u1", name: "Anika Sharma", email: "anika@example.com", role: "user", isActive: true, createdAt: "2025-12-10" },
  { _id: "u2", name: "Rohan Mehta", email: "rohan@example.com", role: "user", isActive: true, createdAt: "2026-01-05" },
  { _id: "u3", name: "Priya Nair", email: "priya@example.com", role: "admin", isActive: true, createdAt: "2025-11-20" },
  { _id: "u4", name: "Vikram Singh", email: "vikram@example.com", role: "user", isActive: false, createdAt: "2026-02-14" },
];

export default function AdminCustomers() {
  const [users, setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState("");
  const [total, setTotal]     = useState(0);

  useEffect(() => {
    getAllUsers({ search })
      .then(d => { setUsers(d.users || []); setTotal(d.total || 0); })
      .catch(() => { setUsers(DEMO_USERS); setTotal(DEMO_USERS.length); })
      .finally(() => setLoading(false));
  }, [search]);

  const handleRole = async (id, role) => {
    try { await updateUserRole(id, role); setUsers(u => u.map(x => x._id === id ? { ...x, role } : x)); }
    catch { alert("Error updating role"); }
  };

  const handleDeactivate = async (id) => {
    if (!confirm("Deactivate this user?")) return;
    try { await deactivateUser(id); setUsers(u => u.map(x => x._id === id ? { ...x, isActive: false } : x)); }
    catch { alert("Error deactivating user"); }
  };

  const filtered = search ? users.filter(u => u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase())) : users;

  return (
    <AdminLayout title="Customers">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search customers…"
          style={{ padding: "10px 16px", background: "#0f0c08", border: "1px solid rgba(201,168,76,0.25)", color: "#fff", fontSize: "12px", outline: "none", width: "280px", fontFamily: "inherit" }} />
        <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)" }}>{total} total customers</div>
      </div>

      <div style={{ background: "linear-gradient(135deg,#0f0c08,#110e08)", border: "1px solid rgba(201,168,76,0.15)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(201,168,76,0.15)" }}>
              {["Customer", "Email", "Role", "Status", "Joined", "Actions"].map(h => (
                <th key={h} style={{ padding: "14px 18px", textAlign: "left", fontSize: "9px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.3)", fontWeight: 400 }}>{h.toUpperCase()}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ padding: "48px", textAlign: "center", color: C.gold }}><Spinner /></td></tr>
            ) : filtered.map(u => (
              <tr key={u._id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", transition: "background 0.15s" }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.02)"}
                onMouseLeave={e => e.currentTarget.style.background = ""}>
                <td style={{ padding: "14px 18px" }}>
                  <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: `linear-gradient(135deg,${C.gold},${C.goldDark})`, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "12px", color: "#0f0c08", fontWeight: 600, marginRight: "12px", verticalAlign: "middle" }}>
                    {u.name?.[0]?.toUpperCase()}
                  </div>
                  <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.8)", verticalAlign: "middle" }}>{u.name}</span>
                </td>
                <td style={{ padding: "14px 18px", fontSize: "12px", color: "rgba(255,255,255,0.45)" }}>{u.email}</td>
                <td style={{ padding: "14px 18px" }}>
                  <select value={u.role} onChange={e => handleRole(u._id, e.target.value)}
                    style={{ background: "#0f0c08", border: `1px solid ${u.role === "admin" ? C.border : "rgba(255,255,255,0.1)"}`, color: u.role === "admin" ? C.gold : "rgba(255,255,255,0.5)", fontSize: "9.5px", padding: "4px 8px", cursor: "pointer", fontFamily: "inherit", outline: "none", letterSpacing: "0.1em" }}>
                    <option value="user">USER</option>
                    <option value="admin">ADMIN</option>
                  </select>
                </td>
                <td style={{ padding: "14px 18px" }}>
                  <span style={{ fontSize: "9px", letterSpacing: "0.1em", padding: "3px 10px", border: `1px solid ${u.isActive ? "#7ab87a40" : "rgba(255,80,80,0.3)"}`, color: u.isActive ? "#7ab87a" : "#f09090", background: u.isActive ? "rgba(122,184,122,0.08)" : "rgba(255,80,80,0.06)" }}>
                    {u.isActive ? "ACTIVE" : "INACTIVE"}
                  </span>
                </td>
                <td style={{ padding: "14px 18px", fontSize: "11px", color: "rgba(255,255,255,0.3)" }}>{u.createdAt?.slice(0, 10)}</td>
                <td style={{ padding: "14px 18px" }}>
                  {u.isActive && (
                    <button onClick={() => handleDeactivate(u._id)} style={{ background: "none", border: "1px solid rgba(255,80,80,0.3)", color: "#f09090", padding: "5px 12px", fontSize: "9.5px", letterSpacing: "0.12em", cursor: "pointer", fontFamily: "inherit" }}>DEACTIVATE</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
