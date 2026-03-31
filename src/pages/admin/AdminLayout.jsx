import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { C, HomeIconEl, TagIconEl, UsersIconEl, OrdersIcon, ChartIcon, SettingsIcon, LogoutIcon, BellIconEl, PlayIcon } from "../../components/shared";
import { useAuth } from "../../context/AuthContext";

const MENU = [
  { label: "Dashboard",     path: "/admin",            icon: HomeIconEl },
  { label: "Products",      path: "/admin/products",   icon: TagIconEl },
  { label: "Orders",        path: "/admin/orders",     icon: OrdersIcon },
  { label: "Customers",     path: "/admin/customers",  icon: UsersIconEl },
  { label: "Analytics",     path: "/admin/analytics",  icon: ChartIcon },
  { label: "Hero Images",   path: "/admin/hero",       icon: PlayIcon },
  { label: "Settings",      path: "/admin/settings",   icon: SettingsIcon },
];

export default function AdminLayout({ children, title }) {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#060402", fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600&family=Cormorant+Garamond:wght@300;400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #070503 !important; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-track { background: #0a0803; }
        ::-webkit-scrollbar-thumb { background: #c9a84c; }
      `}</style>

      {/* Sidebar */}
      <aside style={{
        width: collapsed ? "64px" : "240px", flexShrink: 0,
        background: "linear-gradient(180deg, #0d0a06 0%, #080502 100%)",
        borderRight: "1px solid rgba(201,168,76,0.12)",
        display: "flex", flexDirection: "column",
        transition: "width 0.3s cubic-bezier(0.4,0,0.2,1)",
        position: "sticky", top: 0, height: "100vh", overflow: "hidden",
      }}>
        {/* Logo */}
        <div style={{ padding: collapsed ? "20px 0" : "24px 20px", borderBottom: "1px solid rgba(201,168,76,0.1)", cursor: "pointer", display: "flex", alignItems: "center", gap: "12px", justifyContent: collapsed ? "center" : "space-between" }}
          onClick={() => !collapsed && navigate("/")}>
          {!collapsed && (
            <div>
              <div style={{ fontFamily: "'Playfair Display',serif", fontSize: "18px", letterSpacing: "0.36em", color: "#fff" }}>MAISON</div>
              <div style={{ fontSize: "9px", letterSpacing: "0.2em", color: C.gold, marginTop: "2px" }}>ADMIN PANEL</div>
            </div>
          )}
          {collapsed && <div style={{ fontFamily: "'Playfair Display',serif", fontSize: "16px", color: C.gold }}>M</div>}
          <button onClick={e => { e.stopPropagation(); setCollapsed(c => !c); }} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.3)", fontSize: "16px", flexShrink: 0 }}>
            {collapsed ? "→" : "←"}
          </button>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "16px 0", overflowY: "auto" }}>
          {MENU.map(item => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <div
                key={item.path}
                onClick={() => navigate(item.path)}
                style={{
                  display: "flex", alignItems: "center", gap: "12px",
                  padding: collapsed ? "12px 0" : "12px 20px",
                  cursor: "pointer", justifyContent: collapsed ? "center" : "flex-start",
                  background: isActive ? "rgba(201,168,76,0.1)" : "transparent",
                  borderLeft: isActive ? `2px solid ${C.gold}` : "2px solid transparent",
                  color: isActive ? C.gold : "rgba(255,255,255,0.45)",
                  fontSize: "10px", letterSpacing: "0.16em",
                  transition: "all 0.2s",
                  marginBottom: "2px",
                }}
                onMouseEnter={e => { if (!isActive) { e.currentTarget.style.color = "rgba(255,255,255,0.75)"; e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}}
                onMouseLeave={e => { if (!isActive) { e.currentTarget.style.color = "rgba(255,255,255,0.45)"; e.currentTarget.style.background = "transparent"; }}}
              >
                <Icon />
                {!collapsed && item.label.toUpperCase()}
              </div>
            );
          })}
        </nav>

        {/* User */}
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

      {/* Main content */}
      <main style={{ flex: 1, background: "#080502", minHeight: "100vh", overflowY: "auto" }}>
        {/* Top bar */}
        <div style={{ height: "64px", borderBottom: "1px solid rgba(201,168,76,0.1)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 32px", background: "rgba(8,5,2,0.95)", position: "sticky", top: 0, zIndex: 100 }}>
          <div>
            <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: "22px", fontWeight: 400, color: "#fff" }}>{title}</h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <button style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.4)", position: "relative" }}>
              <BellIconEl />
              <span style={{ position: "absolute", top: 0, right: 0, width: "8px", height: "8px", background: C.gold, borderRadius: "50%" }} />
            </button>
            <div onClick={() => navigate("/")} style={{ cursor: "pointer", fontSize: "9.5px", letterSpacing: "0.18em", color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.1)", padding: "6px 14px", transition: "all 0.2s" }} onMouseEnter={e => { e.currentTarget.style.color = C.gold; e.currentTarget.style.borderColor = C.border; }} onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.4)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}>
              VIEW STORE
            </div>
          </div>
        </div>
        <div style={{ padding: "32px" }}>
          {children}
        </div>
      </main>
    </div>
  );
}
