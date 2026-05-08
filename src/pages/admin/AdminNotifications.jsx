import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "./AdminLayout";
import { C } from "../../components/shared";
import { useNotifications } from "../../context/NotificationContext";

const FILTERS = ["All", "Unread", "Orders", "Stock", "Customers", "System"];

const typeMap = {
  order:    "Orders",
  lowstock: "Stock",
  user:     "Customers",
  system:   "System",
};

function timeAgo(iso) {
  const s = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (s < 60)   return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400)return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export default function AdminNotifications() {
  const navigate = useNavigate();
  const { notifications, unreadCount, typeConfig, markRead, markAllRead, deleteNotification, clearAll, addNotification } = useNotifications();
  const [filter, setFilter] = useState("All");
  const [confirmClear, setConfirmClear] = useState(false);

  const filtered = notifications.filter(n => {
    if (filter === "All")    return true;
    if (filter === "Unread") return !n.read;
    return typeMap[n.type] === filter;
  });

  const handleClick = (n) => {
    markRead(n.id);
    if (n.meta?.link) navigate(n.meta.link);
  };

  return (
    <AdminLayout title="Notifications">
      {/* Header row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 13, color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em" }}>
            {unreadCount > 0 ? <span style={{ color: C.gold }}>{unreadCount} unread</span> : "All caught up"}
            {" "}· {notifications.length} total
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          {unreadCount > 0 && (
            <button onClick={markAllRead} style={btnStyle("#0f0c08", "rgba(201,168,76,0.3)", C.gold)}>
              ✓ MARK ALL READ
            </button>
          )}
          {confirmClear ? (
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span style={{ fontSize: 11, color: "rgba(255,80,80,0.7)", fontFamily: "'Cormorant Garamond',serif" }}>Sure?</span>
              <button onClick={() => { clearAll(); setConfirmClear(false); }} style={btnStyle("#200808", "rgba(255,80,80,0.3)", "#f09090")}>YES, CLEAR</button>
              <button onClick={() => setConfirmClear(false)} style={btnStyle("#0f0c08", "rgba(255,255,255,0.1)", "rgba(255,255,255,0.4)")}>CANCEL</button>
            </div>
          ) : (
            <button onClick={() => setConfirmClear(true)} style={btnStyle("#0f0c08", "rgba(255,80,80,0.2)", "rgba(255,80,80,0.7)")}>
              🗑 CLEAR ALL
            </button>
          )}
        </div>
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
        {FILTERS.map(f => {
          const count = f === "All" ? notifications.length
            : f === "Unread" ? unreadCount
            : notifications.filter(n => typeMap[n.type] === f).length;
          const active = filter === f;
          return (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: "7px 16px",
              background: active ? C.gold : "rgba(255,255,255,0.04)",
              border: `1px solid ${active ? C.gold : "rgba(201,168,76,0.2)"}`,
              color: active ? "#0f0c08" : "rgba(255,255,255,0.5)",
              fontSize: "9.5px", letterSpacing: "0.14em",
              cursor: "pointer", fontFamily: "inherit",
              display: "flex", alignItems: "center", gap: 6,
              transition: "all 0.2s",
            }}>
              {f.toUpperCase()}
              {count > 0 && (
                <span style={{
                  background: active ? "rgba(0,0,0,0.2)" : "rgba(201,168,76,0.15)",
                  color: active ? "#0f0c08" : C.gold,
                  borderRadius: 20, padding: "1px 6px", fontSize: 9,
                }}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
      
      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 0", fontFamily: "'Cormorant Garamond',serif", fontSize: 16, color: "rgba(255,255,255,0.2)" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔔</div>
          No notifications{filter !== "All" ? ` in "${filter}"` : " yet"}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {filtered.map(n => {
            const cfg = typeConfig[n.type] || typeConfig.system;
            return (
              <div
                key={n.id}
                style={{
                  display: "flex", alignItems: "flex-start", gap: 16,
                  padding: "18px 20px",
                  background: n.read ? "linear-gradient(135deg,#0a0703,#0c0905)" : "linear-gradient(135deg,#0f0c08,#120e09)",
                  border: `1px solid ${n.read ? "rgba(201,168,76,0.08)" : "rgba(201,168,76,0.22)"}`,
                  cursor: "pointer", transition: "all 0.2s",
                  position: "relative", overflow: "hidden",
                }}
                onClick={() => handleClick(n)}
                onMouseEnter={e => { e.currentTarget.style.background = "linear-gradient(135deg,#130f0a,#150e09)"; e.currentTarget.style.borderColor = `rgba(201,168,76,0.3)`; }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = n.read ? "linear-gradient(135deg,#0a0703,#0c0905)" : "linear-gradient(135deg,#0f0c08,#120e09)";
                  e.currentTarget.style.borderColor = n.read ? "rgba(201,168,76,0.08)" : "rgba(201,168,76,0.22)";
                }}
              >
                {/* Unread indicator */}
                {!n.read && (
                  <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: 3, background: cfg.color }} />
                )}

                {/* Icon */}
                <div style={{
                  width: 44, height: 44, borderRadius: "50%", flexShrink: 0,
                  background: `${cfg.color}15`,
                  border: `1px solid ${cfg.color}30`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 18,
                }}>
                  {cfg.icon}
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: "9px", letterSpacing: "0.16em", color: cfg.color, fontFamily: "'Cormorant Garamond',serif" }}>
                      {cfg.label.toUpperCase()}
                    </span>
                    {!n.read && (
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: cfg.color, display: "inline-block" }} />
                    )}
                  </div>
                  <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 14, color: n.read ? "rgba(255,255,255,0.6)" : "#fff", marginBottom: 4 }}>
                    {n.title}
                  </div>
                  <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 13, color: "rgba(255,255,255,0.4)", lineHeight: 1.5 }}>
                    {n.message}
                  </div>
                </div>

                {/* Right side */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10, flexShrink: 0 }}>
                  <span style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", fontFamily: "'Cormorant Garamond',serif", whiteSpace: "nowrap" }}>
                    {timeAgo(n.createdAt)}
                  </span>
                  <button
                    onClick={e => { e.stopPropagation(); deleteNotification(n.id); }}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,80,80,0.3)", fontSize: 14, padding: "2px 4px", transition: "color 0.2s" }}
                    onMouseEnter={e => e.currentTarget.style.color = "#f09090"}
                    onMouseLeave={e => e.currentTarget.style.color = "rgba(255,80,80,0.3)"}
                    title="Delete"
                  >✕</button>
                  {n.meta?.link && (
                    <span style={{ fontSize: "9px", color: C.gold, letterSpacing: "0.1em", fontFamily: "'Cormorant Garamond',serif" }}>VIEW →</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AdminLayout>
  );
}

const btnStyle = (bg, border, color) => ({
  padding: "8px 16px", background: bg,
  border: `1px solid ${border}`, color,
  fontSize: "9px", letterSpacing: "0.14em",
  cursor: "pointer", fontFamily: "inherit",
  transition: "all 0.2s",
});