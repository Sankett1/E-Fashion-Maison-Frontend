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
            // Use onMouseDown instead of onClick so it fires before parent onMouseLeave
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
            fontFamily: "'Cormorant Garamond', serif",
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
// FIX: use a leaveTimer so dropdown stays open long enough for mouse to enter it
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
    // Delay closing so the mouse can travel from button into the dropdown panel
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
        // The dropdown panel itself also pauses the close timer when hovered
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
// Search dropdown — compact, slides from under the navbar
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
      style={{
        position: "fixed",
        top: "64px",
        left: 0,
        right: 0,
        zIndex: 498,
        background: "rgba(8,5,2,0.97)",
        borderBottom: `1px solid ${C.border}`,
        backdropFilter: "blur(20px)",
        padding: "14px 48px",
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
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          letterSpacing: "0.05em",
          padding: "6px 4px",
          outline: "none",
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
  const userLeaveTimer = useRef(null);
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { cartCount } = useCart();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  // Close all menus on outside click
  useEffect(() => {
    const close = () => { setActive(null); setUserDrop(false); setSearchOpen(false); };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  const LEFT  = NAV_ITEMS.slice(0, 3);   // NEW IN, WOMEN, MEN
  const RIGHT = NAV_ITEMS.slice(3);      // ACCESSORIES, SALE

  const divider = <div style={{ width: 1, height: 18, background: "rgba(255,255,255,0.1)", flexShrink: 0 }} />;

  const iconBtn = (isActive) => ({
    background: "none", border: "none", cursor: "pointer",
    display: "flex", alignItems: "center", padding: "6px",
    color: isActive ? C.gold : "rgba(255,255,255,0.5)",
    transition: "color 0.18s",
  });

  return (
    <>
      <nav
        onClick={e => e.stopPropagation()}
        style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 500,
          height: "64px",
          // 3-column grid guarantees logo stays centred regardless of side content width
          display: "grid",
          gridTemplateColumns: "1fr auto 1fr",
          alignItems: "center",
          padding: "0 40px",
          background: scrolled ? "rgba(8,5,2,0.98)" : "rgba(8,5,2,0.95)",
          borderBottom: scrolled ? `1px solid ${C.border}` : "1px solid rgba(255,255,255,0.04)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          boxShadow: scrolled ? "0 8px 50px rgba(0,0,0,0.7)" : "none",
          transition: "background 0.3s, box-shadow 0.3s, border-color 0.3s",
          animation: "slideDown 0.8s cubic-bezier(0.4,0,0.2,1) forwards",
        }}
      >
        {/* ── LEFT: NEW IN · WOMEN · MEN ───────────────────────────── */}
        <div style={{ display: "flex", alignItems: "center", gap: "28px", justifyContent: "flex-start" }}>
          {LEFT.map(item => (
            <NavItem key={item.label} item={item} active={active} setActive={setActive} />
          ))}
        </div>

        {/* ── CENTRE: MAISON logo ───────────────────────────────────── */}
        <div
          onClick={() => navigate("/")}
          style={{ cursor: "pointer", userSelect: "none", textAlign: "center", padding: "0 24px", flexShrink: 0 }}
        >
          <div style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "20px", letterSpacing: "0.46em",
            fontWeight: 600, color: "#fff", lineHeight: 1,
          }}>MAISON</div>
          <div style={{ height: "1px", marginTop: "4px", background: "linear-gradient(90deg,transparent,rgba(201,168,76,0.5),transparent)" }} />
        </div>

        {/* ── RIGHT: ACCESSORIES · SALE · icons · auth ─────────────── */}
        <div style={{ display: "flex", alignItems: "center", gap: "14px", justifyContent: "flex-end" }}>
          {RIGHT.map(item => (
            <NavItem key={item.label} item={item} active={active} setActive={setActive} alignRight />
          ))}

          {divider}

          {/* Search */}
          <button
            onClick={() => setSearchOpen(s => !s)}
            style={iconBtn(searchOpen)}
            onMouseEnter={e => e.currentTarget.style.color = C.gold}
            onMouseLeave={e => e.currentTarget.style.color = searchOpen ? C.gold : "rgba(255,255,255,0.5)"}
          >
            <SearchIcon />
          </button>

          {/* Cart */}
          <button
            onClick={() => navigate("/cart")}
            style={{ ...iconBtn(false), position: "relative" }}
            onMouseEnter={e => e.currentTarget.style.color = C.gold}
            onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.5)"}
          >
            <BagIcon />
            {cartCount > 0 && (
              <span style={{
                position: "absolute", top: 0, right: 0,
                width: 14, height: 14, background: C.gold, borderRadius: "50%",
                fontSize: "8px", color: "#0f0c08", fontWeight: 700,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>{cartCount}</span>
            )}
          </button>

          {divider}

          {/* ── Auth ─────────────────────────────────────────────────── */}
          {isAuthenticated ? (
            <div
              style={{ position: "relative" }}
              onMouseEnter={() => { clearTimeout(userLeaveTimer.current); setUserDrop(true); }}
              onMouseLeave={() => { userLeaveTimer.current = setTimeout(() => setUserDrop(false), 120); }}
            >
              <button style={{
                background: "none", border: `1px solid ${C.border}`, cursor: "pointer",
                display: "flex", alignItems: "center", gap: "7px",
                padding: "6px 13px", color: C.gold, fontSize: "10px",
                letterSpacing: "0.14em", fontFamily: "inherit", whiteSpace: "nowrap",
              }}>
                <UserIcon />
                {user?.name?.split(" ")[0] || "Account"}
              </button>

              {userDrop && (
                <div
                  onMouseEnter={() => clearTimeout(userLeaveTimer.current)}
                  onMouseLeave={() => { userLeaveTimer.current = setTimeout(() => setUserDrop(false), 120); }}
                  style={{
                    position: "absolute", top: "calc(100% + 8px)", right: 0,
                    minWidth: "178px", background: "#0d0a06",
                    border: `1px solid ${C.border}`, borderTop: `2px solid ${C.gold}`,
                    boxShadow: "0 20px 50px rgba(0,0,0,0.7)", zIndex: 9999,
                  }}
                >
                  {[
                    { label: "MY ACCOUNT", path: "/account" },
                    { label: "MY ORDERS",  path: "/account?tab=orders" },
                    ...(isAdmin ? [{ label: "⚙ ADMIN PANEL", path: "/admin", gold: true }] : []),
                  ].map(item => (
                    <div
                      key={item.label}
                      onMouseDown={() => { navigate(item.path); setUserDrop(false); }}
                      style={{
                        padding: "11px 18px", fontSize: "10px", letterSpacing: "0.14em",
                        color: item.gold ? C.gold : "rgba(255,255,255,0.6)",
                        cursor: "pointer", borderBottom: "1px solid rgba(255,255,255,0.05)",
                        transition: "all 0.14s",
                      }}
                      onMouseEnter={e => { e.currentTarget.style.color = C.gold; e.currentTarget.style.background = "rgba(201,168,76,0.07)"; }}
                      onMouseLeave={e => { e.currentTarget.style.color = item.gold ? C.gold : "rgba(255,255,255,0.6)"; e.currentTarget.style.background = ""; }}
                    >
                      {item.label}
                    </div>
                  ))}
                  <div
                    onMouseDown={() => { logout(); setUserDrop(false); }}
                    style={{
                      padding: "11px 18px", fontSize: "10px", letterSpacing: "0.14em",
                      color: "rgba(255,80,80,0.7)", cursor: "pointer",
                      display: "flex", alignItems: "center", gap: "8px", transition: "all 0.14s",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.color = "#ff5050"; e.currentTarget.style.background = "rgba(255,80,80,0.05)"; }}
                    onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,80,80,0.7)"; e.currentTarget.style.background = ""; }}
                  >
                    <LogoutIcon /> SIGN OUT
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "stretch", border: `1px solid rgba(201,168,76,0.25)`, overflow: "hidden", flexShrink: 0 }}>
              <button
                onClick={() => onAuth("signin")}
                style={{
                  display: "flex", alignItems: "center", gap: "6px",
                  padding: "0 14px", height: "34px", fontSize: "9.5px",
                  letterSpacing: "0.16em", fontFamily: "'Cormorant Garamond', serif",
                  cursor: "pointer", border: "none",
                  color: "rgba(255,255,255,0.75)", background: "rgba(255,255,255,0.04)",
                  transition: "all 0.2s", whiteSpace: "nowrap",
                }}
                onMouseEnter={e => { e.currentTarget.style.color = C.gold; e.currentTarget.style.background = "rgba(201,168,76,0.08)"; }}
                onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.75)"; e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
              >
                <UserIcon /> SIGN IN
              </button>
              <div style={{ width: "1px", background: "rgba(255,255,255,0.1)" }} />
              <button
                onClick={() => onAuth("signup")}
                style={{
                  display: "flex", alignItems: "center", gap: "6px",
                  padding: "0 14px", height: "34px", fontSize: "9.5px",
                  letterSpacing: "0.16em", fontFamily: "'Cormorant Garamond', serif",
                  cursor: "pointer", border: "none", color: "#0f0c08",
                  background: `linear-gradient(90deg,${C.gold},${C.goldDark})`,
                  transition: "all 0.2s", whiteSpace: "nowrap",
                }}
                onMouseEnter={e => e.currentTarget.style.background = `linear-gradient(90deg,${C.goldLight},${C.gold})`}
                onMouseLeave={e => e.currentTarget.style.background = `linear-gradient(90deg,${C.gold},${C.goldDark})`}
              >
                <UserIcon /> JOIN
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Search bar — compact strip below navbar */}
      {searchOpen && <SearchBar onClose={() => setSearchOpen(false)} />}
    </>
  );
}
