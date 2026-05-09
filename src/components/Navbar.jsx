import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { NAV_ITEMS, C, SearchIcon, UserIcon, BagIcon, ChevDown, ArrowRight, LogoutIcon } from "./shared";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

// ─────────────────────────────────────────────────────────────────────────────
// Dropdown panel — slides down from its nav button
// ─────────────────────────────────────────────────────────────────────────────
function DropdownPanel({ items, visible, alignRight = false }) {
  const ref = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (visible) {
      el.style.display = "block";
      requestAnimationFrame(() => requestAnimationFrame(() => {
        el.style.opacity = "1";
        el.style.transform = "translateY(0) scaleY(1)";
        el.style.pointerEvents = "auto";
      }));
    } else {
      el.style.opacity = "0";
      el.style.transform = "translateY(-6px) scaleY(0.97)";
      el.style.pointerEvents = "none";
      setTimeout(() => { if (el) el.style.display = "none"; }, 180);
    }
  }, [visible]);

  return (
    <div
      ref={ref}
      style={{
        display: "none",
        position: "absolute",
        top: "calc(100% + 14px)",
        left: alignRight ? "auto" : "0",
        right: alignRight ? "0" : "auto",
        minWidth: "200px",
        background: "#0d0a06",
        border: `1px solid ${C.border}`,
        borderTop: `2px solid ${C.gold}`,
        boxShadow: "0 24px 60px rgba(0,0,0,0.75)",
        zIndex: 9999,
        opacity: 0,
        transform: "translateY(-6px) scaleY(0.97)",
        transformOrigin: "top center",
        transition: "opacity 0.18s ease, transform 0.18s ease",
      }}
    >
      <div style={{ height: "1px", background: "linear-gradient(90deg,transparent,rgba(201,168,76,0.35),transparent)" }} />
      {items.map((item, i) => (
        <div
          key={item.label}
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            navigate(item.path);
          }}
          style={{
            padding: "11px 20px",
            fontSize: "10px",
            letterSpacing: "0.15em",
            color: "rgba(255,255,255,0.55)",
            cursor: "pointer",
            borderBottom: i < items.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
            transition: "all 0.14s ease",
            fontFamily: "'DM Sans', serif",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = "rgba(201,168,76,0.07)";
            e.currentTarget.style.color = C.gold;
            e.currentTarget.style.paddingLeft = "26px";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = "";
            e.currentTarget.style.color = "rgba(255,255,255,0.55)";
            e.currentTarget.style.paddingLeft = "20px";
          }}
        >
          <span>{item.label.toUpperCase()}</span>
          <span style={{ color: C.gold, opacity: 0.7 }}><ArrowRight /></span>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Nav item — hover AND click opens dropdown
// ─────────────────────────────────────────────────────────────────────────────
function NavItem({ item, active, setActive, alignRight }) {
  const navigate = useNavigate();
  const leaveTimer = useRef(null);
  const isOpen = active === item.label;

  const handleEnter = () => {
    clearTimeout(leaveTimer.current);
    setActive(item.label);
  };
  const handleLeave = () => {
    leaveTimer.current = setTimeout(() => setActive(null), 120);
  };

  return (
    <div
      style={{ position: "relative" }}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          if (item.items?.length) {
            setActive(isOpen ? null : item.label);
          } else {
            navigate(item.path);
          }
        }}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "4px",
          fontSize: "10px",
          letterSpacing: "0.2em",
          fontWeight: 400,
          color: isOpen ? C.gold : "rgba(255,255,255,0.65)",
          fontFamily: "inherit",
          padding: "6px 0",
          transition: "color 0.18s",
          whiteSpace: "nowrap",
        }}
        onMouseEnter={e => { if (!isOpen) e.currentTarget.style.color = "#fff"; }}
        onMouseLeave={e => { if (!isOpen) e.currentTarget.style.color = "rgba(255,255,255,0.65)"; }}
      >
        {item.label}
        {item.items?.length > 0 && (
          <span style={{
            transition: "transform 0.2s ease",
            transform: isOpen ? "rotate(180deg)" : "none",
            opacity: 0.5,
            display: "flex",
          }}>
            <ChevDown />
          </span>
        )}
      </button>

      {item.items?.length > 0 && (
        <div
          onMouseEnter={() => clearTimeout(leaveTimer.current)}
          onMouseLeave={handleLeave}
          style={{ position: "absolute", top: 0, left: 0, right: 0 }}
        >
          <DropdownPanel items={item.items} visible={isOpen} alignRight={alignRight} />
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Search dropdown
// ─────────────────────────────────────────────────────────────────────────────
function SearchBar({ onClose }) {
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => { setTimeout(() => inputRef.current?.focus(), 60); }, []);

  const submit = () => {
    if (!query.trim()) return;
    navigate(`/shop?q=${encodeURIComponent(query.trim())}`);
    onClose();
  };

  return (
    <div
      onClick={e => e.stopPropagation()}
      className="r-search-bar"
      style={{
        position: "fixed",
        top: "64px",
        left: 0,
        right: 0,
        zIndex: 498,
        background: "rgba(8,5,2,0.97)",
        borderBottom: `1px solid ${C.border}`,
        backdropFilter: "blur(20px)",
        display: "flex",
        alignItems: "center",
        gap: "14px",
        boxShadow: "0 12px 40px rgba(0,0,0,0.6)",
        animation: "searchSlide 0.2s cubic-bezier(0.4,0,0.2,1) forwards",
      }}
    >
      <style>{`@keyframes searchSlide{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <span style={{ color: C.gold, display: "flex", flexShrink: 0 }}><SearchIcon /></span>
      <input
        ref={inputRef}
        value={query}
        onChange={e => setQuery(e.target.value)}
        onKeyDown={e => { if (e.key === "Enter") submit(); if (e.key === "Escape") onClose(); }}
        placeholder="Search collections, styles, products…"
        style={{
          flex: 1,
          background: "transparent",
          border: "none",
          borderBottom: `1px solid rgba(201,168,76,0.25)`,
          color: "#fff",
          fontSize: "14px",
          fontFamily: "'DM Sans', Georgia, serif",
          letterSpacing: "0.05em",
          padding: "6px 4px",
          outline: "none",
          minWidth: 0,
        }}
      />
      {query.trim() && (
        <button
          onClick={submit}
          style={{
            background: C.gold,
            border: "none",
            color: "#0f0c08",
            padding: "7px 18px",
            fontSize: "9.5px",
            letterSpacing: "0.16em",
            cursor: "pointer",
            fontFamily: "inherit",
            flexShrink: 0,
          }}
        >
          SEARCH
        </button>
      )}
      <button
        onClick={onClose}
        style={{
          background: "none",
          border: "none",
          color: "rgba(255,255,255,0.35)",
          cursor: "pointer",
          fontSize: "20px",
          lineHeight: 1,
          padding: "2px 4px",
          flexShrink: 0,
        }}
        onMouseEnter={e => e.currentTarget.style.color = "#fff"}
        onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.35)"}
      >×</button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Navbar
// ─────────────────────────────────────────────────────────────────────────────
export default function Navbar({ onAuth }) {
  const [active, setActive]     = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [userDrop, setUserDrop] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState(null);
  const userLeaveTimer = useRef(null);
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { cartCount } = useCart();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    const close = () => { setActive(null); setUserDrop(false); setSearchOpen(false); };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const LEFT  = NAV_ITEMS.slice(0, 3);
  const RIGHT = NAV_ITEMS.slice(3);
  const divider = <div style={{ width: 1, height: 18, background: "rgba(255,255,255,0.1)", flexShrink: 0 }} />;
  const iconBtn = (isActive) => ({
    background: "none", border: "none", cursor: "pointer",
    display: "flex", alignItems: "center", padding: "6px",
    color: isActive ? C.gold : "rgba(255,255,255,0.5)",
    transition: "color 0.18s",
  });
  const mobileNav = (path) => { navigate(path); setMobileOpen(false); setMobileExpanded(null); };

  return (
    <>
      <nav
        onClick={e => e.stopPropagation()}
        style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 500,
          height: "64px",
          display: "grid",
          gridTemplateColumns: "1fr auto 1fr",
          alignItems: "center",
          padding: "0 clamp(16px, 4vw, 40px)",
          background: scrolled ? "rgba(8,5,2,0.98)" : "rgba(8,5,2,0.95)",
          borderBottom: scrolled ? `1px solid ${C.border}` : "1px solid rgba(255,255,255,0.04)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          boxShadow: scrolled ? "0 8px 50px rgba(0,0,0,0.7)" : "none",
          transition: "background 0.3s, box-shadow 0.3s, border-color 0.3s",
          animation: "slideDown 0.8s cubic-bezier(0.4,0,0.2,1) forwards",
        }}
      >
        {/* LEFT */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-start" }}>
          <button className="m-hamburger" onClick={() => setMobileOpen(true)} aria-label="Open menu">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
          <div className="m-nav-desktop" style={{ display: "flex", alignItems: "center", gap: "28px" }}>
            {LEFT.map(item => (
              <NavItem key={item.label} item={item} active={active} setActive={setActive} />
            ))}
          </div>
        </div>

        {/* CENTRE */}
        <div onClick={() => navigate("/")} style={{ cursor: "pointer", userSelect: "none", textAlign: "center", padding: "0 clamp(12px,2vw,24px)", flexShrink: 0 }}>
          <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: "clamp(16px,2.5vw,20px)", letterSpacing: "0.46em", fontWeight: 600, color: "#fff", lineHeight: 1 }}>MAISON</div>
          <div style={{ height: "1px", marginTop: "4px", background: "linear-gradient(90deg,transparent,rgba(201,168,76,0.5),transparent)" }} />
        </div>

        {/* RIGHT */}
        <div style={{ display: "flex", alignItems: "center", gap: "clamp(8px,1.5vw,14px)", justifyContent: "flex-end" }}>
          <div className="m-nav-desktop" style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            {RIGHT.map(item => (
              <NavItem key={item.label} item={item} active={active} setActive={setActive} alignRight />
            ))}
            {divider}
          </div>

          <button onClick={() => setSearchOpen(s => !s)} style={iconBtn(searchOpen)}
            onMouseEnter={e => e.currentTarget.style.color = C.gold}
            onMouseLeave={e => e.currentTarget.style.color = searchOpen ? C.gold : "rgba(255,255,255,0.5)"}
          ><SearchIcon /></button>

          <button onClick={() => navigate("/cart")} style={{ ...iconBtn(false), position: "relative" }}
            onMouseEnter={e => e.currentTarget.style.color = C.gold}
            onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.5)"}
          >
            <BagIcon />
            {cartCount > 0 && (
              <span style={{ position: "absolute", top: 0, right: 0, width: 14, height: 14, background: C.gold, borderRadius: "50%", fontSize: "8px", color: "#0f0c08", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>{cartCount}</span>
            )}
          </button>

          <div className="m-nav-desktop" style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            {divider}
            {isAuthenticated ? (
              <div style={{ position: "relative" }}
                onMouseEnter={() => { clearTimeout(userLeaveTimer.current); setUserDrop(true); }}
                onMouseLeave={() => { userLeaveTimer.current = setTimeout(() => setUserDrop(false), 120); }}
              >
                <button style={{ background: "none", border: `1px solid ${C.border}`, cursor: "pointer", display: "flex", alignItems: "center", gap: "7px", padding: "6px 13px", color: C.gold, fontSize: "10px", letterSpacing: "0.14em", fontFamily: "inherit", whiteSpace: "nowrap" }}>
                  <UserIcon />{user?.name?.split(" ")[0] || "Account"}
                </button>
                {userDrop && (
                  <div onMouseEnter={() => clearTimeout(userLeaveTimer.current)} onMouseLeave={() => { userLeaveTimer.current = setTimeout(() => setUserDrop(false), 120); }}
                    style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, minWidth: "178px", background: "#0d0a06", border: `1px solid ${C.border}`, borderTop: `2px solid ${C.gold}`, boxShadow: "0 20px 50px rgba(0,0,0,0.7)", zIndex: 9999 }}
                  >
                    {[
                      { label: "MY ACCOUNT", path: "/account" },
                      { label: "MY ORDERS", path: "/account?tab=orders" },
                      ...(isAdmin ? [{ label: "⚙ ADMIN PANEL", path: "/admin", gold: true }] : []),
                    ].map(item => (
                      <div key={item.label} onMouseDown={() => { navigate(item.path); setUserDrop(false); }}
                        style={{ padding: "11px 18px", fontSize: "10px", letterSpacing: "0.14em", color: item.gold ? C.gold : "rgba(255,255,255,0.6)", cursor: "pointer", borderBottom: "1px solid rgba(255,255,255,0.05)", transition: "all 0.14s" }}
                        onMouseEnter={e => { e.currentTarget.style.color = C.gold; e.currentTarget.style.background = "rgba(201,168,76,0.07)"; }}
                        onMouseLeave={e => { e.currentTarget.style.color = item.gold ? C.gold : "rgba(255,255,255,0.6)"; e.currentTarget.style.background = ""; }}
                      >{item.label}</div>
                    ))}
                    <div onMouseDown={() => { logout(); setUserDrop(false); }}
                      style={{ padding: "11px 18px", fontSize: "10px", letterSpacing: "0.14em", color: "rgba(255,80,80,0.7)", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", transition: "all 0.14s" }}
                      onMouseEnter={e => { e.currentTarget.style.color = "#ff5050"; e.currentTarget.style.background = "rgba(255,80,80,0.05)"; }}
                      onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,80,80,0.7)"; e.currentTarget.style.background = ""; }}
                    ><LogoutIcon /> SIGN OUT</div>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "stretch", border: `1px solid rgba(201,168,76,0.25)`, overflow: "hidden", flexShrink: 0 }}>
                <button onClick={() => onAuth("signin")}
                  style={{ display: "flex", alignItems: "center", gap: "6px", padding: "0 14px", height: "34px", fontSize: "9.5px", letterSpacing: "0.16em", fontFamily: "'DM Sans', serif", cursor: "pointer", border: "none", color: "rgba(255,255,255,0.75)", background: "rgba(255,255,255,0.04)", transition: "all 0.2s", whiteSpace: "nowrap" }}
                  onMouseEnter={e => { e.currentTarget.style.color = C.gold; e.currentTarget.style.background = "rgba(201,168,76,0.08)"; }}
                  onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.75)"; e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
                ><UserIcon /> SIGN IN</button>
                <div style={{ width: "1px", background: "rgba(255,255,255,0.1)" }} />
                <button onClick={() => onAuth("signup")}
                  style={{ display: "flex", alignItems: "center", gap: "6px", padding: "0 14px", height: "34px", fontSize: "9.5px", letterSpacing: "0.16em", fontFamily: "'DM Sans', serif", cursor: "pointer", border: "none", color: "#0f0c08", background: `linear-gradient(90deg,${C.gold},${C.goldDark})`, transition: "all 0.2s", whiteSpace: "nowrap" }}
                  onMouseEnter={e => e.currentTarget.style.background = `linear-gradient(90deg,${C.goldLight},${C.gold})`}
                  onMouseLeave={e => e.currentTarget.style.background = `linear-gradient(90deg,${C.gold},${C.goldDark})`}
                ><UserIcon /> JOIN</button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* MOBILE DRAWER */}
      {mobileOpen && (
        <div onClick={() => setMobileOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 9998, background: "rgba(4,2,0,0.7)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)" }}>
          <div onClick={e => e.stopPropagation()} style={{ position: "absolute", top: 0, right: 0, bottom: 0, width: "min(340px, 85vw)", background: "linear-gradient(180deg, #0d0a06 0%, #080502 100%)", borderLeft: `1px solid ${C.border}`, animation: "mobileSlideIn 0.3s cubic-bezier(0.4,0,0.2,1) forwards", overflowY: "auto", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px", borderBottom: `1px solid ${C.border}` }}>
              <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: "16px", letterSpacing: "0.36em", color: "#fff" }}>MAISON</div>
              <button onClick={() => setMobileOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.4)", fontSize: "24px", padding: "4px", lineHeight: 1 }}>×</button>
            </div>
            <div style={{ flex: 1, padding: "8px 0" }}>
              {NAV_ITEMS.map(item => (
                <div key={item.label}>
                  <div onClick={() => { if (item.items?.length) setMobileExpanded(mobileExpanded === item.label ? null : item.label); else mobileNav(item.path); }}
                    style={{ padding: "16px 24px", fontSize: "11px", letterSpacing: "0.2em", color: mobileExpanded === item.label ? C.gold : "rgba(255,255,255,0.65)", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.04)", transition: "color 0.15s" }}>
                    {item.label}
                    {item.items?.length > 0 && <span style={{ transform: mobileExpanded === item.label ? "rotate(180deg)" : "none", transition: "transform 0.2s", opacity: 0.5 }}><ChevDown /></span>}
                  </div>
                  {mobileExpanded === item.label && item.items?.map(sub => (
                    <div key={sub.label} onClick={() => mobileNav(sub.path)}
                      style={{ padding: "12px 24px 12px 40px", fontSize: "10px", letterSpacing: "0.14em", color: "rgba(255,255,255,0.4)", cursor: "pointer", borderBottom: "1px solid rgba(255,255,255,0.02)", transition: "color 0.14s" }}>
                      {sub.label.toUpperCase()}
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <div style={{ padding: "20px 24px", borderTop: `1px solid ${C.border}` }}>
              {isAuthenticated ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <div style={{ fontSize: "10px", letterSpacing: "0.14em", color: C.gold, marginBottom: "4px", display: "flex", alignItems: "center", gap: "8px" }}><UserIcon /> {user?.name || "Account"}</div>
                  <div onClick={() => mobileNav("/account")} style={{ padding: "10px 0", fontSize: "10px", letterSpacing: "0.14em", color: "rgba(255,255,255,0.5)", cursor: "pointer" }}>MY ACCOUNT</div>
                  <div onClick={() => mobileNav("/account?tab=orders")} style={{ padding: "10px 0", fontSize: "10px", letterSpacing: "0.14em", color: "rgba(255,255,255,0.5)", cursor: "pointer" }}>MY ORDERS</div>
                  {isAdmin && <div onClick={() => mobileNav("/admin")} style={{ padding: "10px 0", fontSize: "10px", letterSpacing: "0.14em", color: C.gold, cursor: "pointer" }}>⚙ ADMIN PANEL</div>}
                  <div onClick={() => { logout(); setMobileOpen(false); }} style={{ padding: "10px 0", fontSize: "10px", letterSpacing: "0.14em", color: "rgba(255,80,80,0.7)", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}><LogoutIcon /> SIGN OUT</div>
                </div>
              ) : (
                <div style={{ display: "flex", gap: "10px" }}>
                  <button onClick={() => { setMobileOpen(false); onAuth("signin"); }} style={{ flex: 1, padding: "13px", fontSize: "9.5px", letterSpacing: "0.16em", fontFamily: "inherit", cursor: "pointer", border: "1px solid rgba(201,168,76,0.3)", color: "rgba(255,255,255,0.75)", background: "rgba(255,255,255,0.04)" }}>SIGN IN</button>
                  <button onClick={() => { setMobileOpen(false); onAuth("signup"); }} style={{ flex: 1, padding: "13px", fontSize: "9.5px", letterSpacing: "0.16em", fontFamily: "inherit", cursor: "pointer", border: "none", color: "#0f0c08", background: C.gold }}>JOIN</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {searchOpen && <SearchBar onClose={() => setSearchOpen(false)} />}
    </>
  );
}
