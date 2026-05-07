import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { C, HomeIconEl, TagIconEl, UsersIconEl, OrdersIcon, ChartIcon, SettingsIcon, LogoutIcon, BellIconEl, PlayIcon } from "../../components/shared";
import { useAuth } from "../../context/AuthContext";
import { useNotifications } from "../../context/NotificationContext";

const StoryIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
  </svg>
);
const NotifIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
);

const MENU = [
  { label: "Dashboard",     path: "/admin",               icon: HomeIconEl  },
  { label: "Products",      path: "/admin/products",      icon: TagIconEl   },
  { label: "Orders",        path: "/admin/orders",        icon: OrdersIcon  },
  { label: "Customers",     path: "/admin/customers",     icon: UsersIconEl },
  { label: "Analytics",     path: "/admin/analytics",     icon: ChartIcon   },
  { label: "Hero Images",   path: "/admin/hero",          icon: PlayIcon    },
  { label: "Our Story",     path: "/admin/story",         icon: StoryIcon   },
  { label: "Notifications", path: "/admin/notifications", icon: NotifIcon   },
  { label: "Settings",      path: "/admin/settings",      icon: SettingsIcon},
];

function timeAgo(iso) {
  const s = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (s < 60)    return `${s}s ago`;
  if (s < 3600)  return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

function BellDropdown({ onClose }) {
  const navigate = useNavigate();
  const { notifications, unreadCount, typeConfig, markRead, markAllRead, deleteNotification } = useNotifications();
  const recent = notifications.slice(0, 8);

  return (
    <div style={{
      position: "absolute", top: "calc(100% + 12px)", right: 0,
      width: 380, maxHeight: 520,
      background: "linear-gradient(160deg,#0d0a06,#0a0703)",
      border: "1px solid rgba(201,168,76,0.22)",
      boxShadow: "0 24px 64px rgba(0,0,0,0.7), 0 0 0 1px rgba(201,168,76,0.06)",
      zIndex: 9999, display: "flex", flexDirection: "column",
    }}>
      <div style={{ padding: "16px 18px 14px", borderBottom: "1px solid rgba(201,168,76,0.1)", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <div>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 15, color: "#fff" }}>Notifications</div>
          {unreadCount > 0 && (
            <div style={{ fontSize: 10, color: C.gold, letterSpacing: "0.12em", marginTop: 2 }}>{unreadCount} UNREAD</div>
          )}
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          {unreadCount > 0 && (
            <button onClick={markAllRead} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "9px", letterSpacing: "0.14em", color: C.gold, fontFamily: "inherit", padding: "4px 8px", borderBottom: `1px solid ${C.gold}40` }}>
              MARK ALL READ
            </button>
          )}
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.3)", fontSize: 16 }}>✕</button>
        </div>
      </div>

      <div style={{ overflowY: "auto", flex: 1 }}>
        {recent.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 24px", fontFamily: "'Cormorant Garamond',serif", fontSize: 14, color: "rgba(255,255,255,0.2)" }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>🔔</div>
            No notifications yet
          </div>
        ) : recent.map(n => {
          const cfg = typeConfig[n.type] || typeConfig.system;
          return (
            <div key={n.id}
              onClick={() => { markRead(n.id); onClose(); if (n.meta?.link) navigate(n.meta.link); }}
              style={{
                display: "flex", gap: 12, padding: "14px 18px",
                borderBottom: "1px solid rgba(255,255,255,0.04)",
                background: n.read ? "transparent" : "rgba(201,168,76,0.03)",
                cursor: "pointer", transition: "background 0.15s",
                position: "relative",
              }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(201,168,76,0.06)"}
              onMouseLeave={e => e.currentTarget.style.background = n.read ? "transparent" : "rgba(201,168,76,0.03)"}
            >
              {!n.read && <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 2, background: cfg.color }} />}
              <div style={{ width: 36, height: 36, borderRadius: "50%", flexShrink: 0, background: `${cfg.color}15`, border: `1px solid ${cfg.color}25`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>
                {cfg.icon}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginBottom: 2 }}>
                  <span style={{ fontFamily: "'Playfair Display',serif", fontSize: 12, color: n.read ? "rgba(255,255,255,0.55)" : "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {n.title}
                  </span>
                  <span style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", flexShrink: 0, fontFamily: "'Cormorant Garamond',serif" }}>
                    {timeAgo(n.createdAt)}
                  </span>
                </div>
                <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 12, color: "rgba(255,255,255,0.35)", lineHeight: 1.4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {n.message}
                </div>
              </div>
              <button
                onClick={e => { e.stopPropagation(); deleteNotification(n.id); }}
                style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,80,80,0.2)", fontSize: 13, flexShrink: 0, padding: "0 2px", alignSelf: "center", transition: "color 0.2s" }}
                onMouseEnter={e => e.currentTarget.style.color = "#f09090"}
                onMouseLeave={e => e.currentTarget.style.color = "rgba(255,80,80,0.2)"}
              >✕</button>
            </div>
          );
        })}
      </div>

      <div style={{ padding: "12px 18px", borderTop: "1px solid rgba(201,168,76,0.1)", flexShrink: 0 }}>
        <button
          onClick={() => { onClose(); navigate("/admin/notifications"); }}
          style={{ width: "100%", padding: "10px", background: "rgba(201,168,76,0.06)", border: "1px solid rgba(201,168,76,0.2)", color: C.gold, fontSize: "9.5px", letterSpacing: "0.18em", cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s" }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(201,168,76,0.12)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "rgba(201,168,76,0.06)"; }}
        >
          VIEW ALL NOTIFICATIONS
        </button>
      </div>
    </div>
  );
}

export default function AdminLayout({ children, title }) {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const [collapsed, setCollapsed]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [bellOpen, setBellOpen]     = useState(false);
  const bellRef = useRef(null);

  useEffect(() => {
    if (!bellOpen) return;
    const handler = (e) => {
      if (bellRef.current && !bellRef.current.contains(e.target)) setBellOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [bellOpen]);

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#060402", fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600&family=Cormorant+Garamond:wght@300;400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #070503 !important; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-track { background: #0a0803; }
        ::-webkit-scrollbar-thumb { background: #c9a84c; }
        .admin-sidebar { transition: transform 0.3s cubic-bezier(0.4,0,0.2,1), width 0.3s cubic-bezier(0.4,0,0.2,1); }
        .admin-hamburger { display: none; background: none; border: none; cursor: pointer; color: #fff; font-size: 20px; }
        .admin-overlay { display: none; }
        @media (max-width: 768px) {
          .admin-sidebar { position: fixed !important; z-index: 200; transform: translateX(-100%); width: 240px !important; }
          .admin-sidebar.mobile-open { transform: translateX(0); }
          .admin-overlay.mobile-open { display: block; position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 199; }
          .admin-hamburger { display: block; }
          .collapse-btn { display: none; }
          .admin-main-padding { padding: 16px !important; }
          .admin-topbar { padding: 0 16px !important; }
        }
        @keyframes notifPop { 0%{transform:scale(0.4);opacity:0} 60%{transform:scale(1.2)} 100%{transform:scale(1);opacity:1} }
        @keyframes bellWiggle { 0%,100%{transform:rotate(0)} 20%{transform:rotate(-18deg)} 40%{transform:rotate(16deg)} 60%{transform:rotate(-10deg)} 80%{transform:rotate(6deg)} }
      `}</style>

      <div className={`admin-overlay ${mobileOpen ? 'mobile-open' : ''}`} onClick={() => setMobileOpen(false)} />

      <aside className={`admin-sidebar ${mobileOpen ? 'mobile-open' : ''}`} style={{
        width: collapsed ? "64px" : "240px", flexShrink: 0,
        background: "linear-gradient(180deg, #0d0a06 0%, #080502 100%)",
        borderRight: "1px solid rgba(201,168,76,0.12)",
        display: "flex", flexDirection: "column",
        position: "sticky", top: 0, height: "100vh", overflow: "hidden",
      }}>
        <div style={{ padding: collapsed ? "20px 0" : "24px 20px", borderBottom: "1px solid rgba(201,168,76,0.1)", cursor: "pointer", display: "flex", alignItems: "center", gap: "12px", justifyContent: collapsed ? "center" : "space-between" }}
          onClick={() => !collapsed && navigate("/")}>
          {!collapsed && (
            <div>
              <div style={{ fontFamily: "'Playfair Display',serif", fontSize: "18px", letterSpacing: "0.36em", color: "#fff" }}>MAISON</div>
              <div style={{ fontSize: "9px", letterSpacing: "0.2em", color: C.gold, marginTop: "2px" }}>ADMIN PANEL</div>
            </div>
          )}
          {collapsed && <div style={{ fontFamily: "'Playfair Display',serif", fontSize: "16px", color: C.gold }}>M</div>}
          <button className="collapse-btn" onClick={e => { e.stopPropagation(); setCollapsed(c => !c); }} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.3)", fontSize: "16px", flexShrink: 0 }}>
            {collapsed ? "→" : "←"}
          </button>
        </div>

        <nav style={{ flex: 1, padding: "16px 0", overflowY: "auto" }}>
          {MENU.map(item => {
            const isActive = location.pathname === item.path;
            const isNotif  = item.path === "/admin/notifications";
            const Icon = item.icon;
            return (
              <div key={item.path}
                onClick={() => { navigate(item.path); setMobileOpen(false); }}
                style={{
                  display: "flex", alignItems: "center", gap: "12px",
                  padding: collapsed ? "12px 0" : "12px 20px",
                  cursor: "pointer", justifyContent: collapsed ? "center" : "flex-start",
                  background: isActive ? "rgba(201,168,76,0.1)" : "transparent",
                  borderLeft: isActive ? `2px solid ${C.gold}` : "2px solid transparent",
                  color: isActive ? C.gold : "rgba(255,255,255,0.45)",
                  fontSize: "10px", letterSpacing: "0.16em",
                  transition: "all 0.2s", marginBottom: "2px",
                  position: "relative",
                }}
                onMouseEnter={e => { if (!isActive) { e.currentTarget.style.color = "rgba(255,255,255,0.75)"; e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}}
                onMouseLeave={e => { if (!isActive) { e.currentTarget.style.color = "rgba(255,255,255,0.45)"; e.currentTarget.style.background = "transparent"; }}}
              >
                <span style={{ position: "relative", flexShrink: 0 }}>
                  <Icon />
                  {isNotif && unreadCount > 0 && (
                    <span style={{
                      position: "absolute", top: -4, right: -4,
                      minWidth: 16, height: 16, borderRadius: 8,
                      background: "#e05555", color: "#fff",
                      fontSize: 9, fontWeight: 700, lineHeight: "16px",
                      textAlign: "center", padding: "0 3px",
                      animation: "notifPop 0.4s cubic-bezier(0.23,1,0.32,1)",
                      fontFamily: "sans-serif",
                    }}>
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </span>
                {!collapsed && item.label.toUpperCase()}
              </div>
            );
          })}
        </nav>

        <div style={{ padding: collapsed ? "16px 0" : "16px 20px", borderTop: "1px solid rgba(201,168,76,0.1)" }}>
          {!collapsed && (
            <div style={{ marginBottom: "12px" }}>
              <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.75)", marginBottom: "2px" }}>{user?.name || "Admin"}</div>
              <div style={{ fontSize: "9.5px", letterSpacing: "0.1em", color: C.gold }}>ADMINISTRATOR</div>
            </div>
          )}
          <div onClick={logout} style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", color: "rgba(255,80,80,0.6)", fontSize: "10px", letterSpacing: "0.14em", justifyContent: collapsed ? "center" : "flex-start", transition: "color 0.2s" }}
            onMouseEnter={e => e.currentTarget.style.color = "#ff5050"}
            onMouseLeave={e => e.currentTarget.style.color = "rgba(255,80,80,0.6)"}
          >
            <LogoutIcon /> {!collapsed && "SIGN OUT"}
          </div>
        </div>
      </aside>

      <main style={{ flex: 1, background: "#080502", minHeight: "100vh", overflowY: "auto" }}>
        <div className="admin-topbar" style={{ height: "64px", borderBottom: "1px solid rgba(201,168,76,0.1)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 32px", background: "rgba(8,5,2,0.95)", position: "sticky", top: 0, zIndex: 100 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <button className="admin-hamburger" onClick={() => setMobileOpen(true)}>☰</button>
            <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: "22px", fontWeight: 400, color: "#fff" }}>{title}</h1>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            {/* Bell */}
            <div ref={bellRef} style={{ position: "relative" }}>
              <button
                onClick={() => setBellOpen(o => !o)}
                style={{
                  background: bellOpen ? "rgba(201,168,76,0.1)" : "none",
                  border: bellOpen ? "1px solid rgba(201,168,76,0.3)" : "1px solid transparent",
                  cursor: "pointer",
                  color: bellOpen ? C.gold : "rgba(255,255,255,0.4)",
                  position: "relative", padding: "6px", borderRadius: 0,
                  transition: "all 0.2s", display: "flex", alignItems: "center",
                }}
              >
                <span style={{ animation: unreadCount > 0 && !bellOpen ? "bellWiggle 1s ease 1s 1" : "none", display: "flex" }}>
                  <BellIconEl />
                </span>
                {unreadCount > 0 && (
                  <span style={{
                    position: "absolute", top: 2, right: 2,
                    minWidth: 16, height: 16, borderRadius: 8,
                    background: "#e05555", color: "#fff",
                    fontSize: 9, fontWeight: 700, lineHeight: "16px",
                    textAlign: "center", padding: "0 3px",
                    animation: "notifPop 0.4s cubic-bezier(0.23,1,0.32,1)",
                    fontFamily: "sans-serif",
                  }}>
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </button>
              {bellOpen && <BellDropdown onClose={() => setBellOpen(false)} />}
            </div>

            <div onClick={() => navigate("/")} style={{ cursor: "pointer", fontSize: "9.5px", letterSpacing: "0.18em", color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.1)", padding: "6px 14px", transition: "all 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.color = C.gold; e.currentTarget.style.borderColor = C.border; }}
              onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.4)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}>
              VIEW STORE
            </div>
          </div>
        </div>

        <div className="admin-main-padding" style={{ padding: "32px" }}>
          {children}
        </div>
      </main>
    </div>
  );
}