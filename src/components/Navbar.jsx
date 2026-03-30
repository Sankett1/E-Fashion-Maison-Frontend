import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { NAV_ITEMS, C, SearchIcon, UserIcon, BagIcon, ChevDown, ArrowRight, LogoutIcon } from "./shared";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

// ── Nav dropdown panel ────────────────────────────────────────────────────────
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
      el.style.transform = "translateY(-8px) scaleY(0.96)";
      el.style.pointerEvents = "none";
      setTimeout(() => { if (el) el.style.display = "none"; }, 200);
    }
  }, [visible]);

  return (
    <div ref={ref} style={{
      display: "none",
      position: "absolute",
      top: "calc(100% + 10px)",
      left: alignRight ? "auto" : "0",
      right: alignRight ? "0" : "auto",
      minWidth: "210px",
      background: C.surface,
      border: `1px solid ${C.border}`,
      borderTop: `2px solid ${C.gold}`,
      boxShadow: "0 28px 70px rgba(0,0,0,0.7)",
      zIndex: 9999,
      opacity: 0,
      transform: "translateY(-8px) scaleY(0.96)",
      transformOrigin: "top center",
      transition: "opacity 0.2s ease, transform 0.2s ease",
    }}>
      <div style={{ height: "1px", width: "100%", background: "linear-gradient(90deg, transparent, rgba(201,168,76,0.4), transparent)" }} />
      {items.map((item, i) => (
        <div
          key={item.label}
          onClick={(e) => { e.stopPropagation(); navigate(item.path); }}
          style={{
            padding: "11px 20px",
            fontSize: "10px",
            letterSpacing: "0.16em",
            color: "rgba(255,255,255,0.55)",
            cursor: "pointer",
            borderBottom: i < items.length - 1 ? "1px solid rgba(255,255,255,0.045)" : "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
            transition: "all 0.15s ease",
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

// ── Individual nav button with dropdown ───────────────────────────────────────
function NavItem({ item, active, setActive, alignRight }) {
  const navigate = useNavigate();
  const isOpen = active === item.label;

  return (
    <div
      style={{ position: "relative" }}
      onMouseEnter={() => setActive(item.label)}
      onMouseLeave={() => setActive(null)}
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
            transition: "transform 0.22s ease",
            transform: isOpen ? "rotate(180deg)" : "none",
            opacity: 0.5,
            display: "flex",
          }}>
            <ChevDown />
          </span>
        )}
      </button>
      {item.items?.length > 0 && (
        <DropdownPanel items={item.items} visible={isOpen} alignRight={alignRight} />
      )}
    </div>
  );
}

// ── Search dropdown panel ─────────────────────────────────────────────────────
function SearchDropdown({ visible, onClose }) {
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (visible) setTimeout(() => inputRef.current?.focus(), 80);
    else setQuery("");
  }, [visible]);

  const submit = () => {
    if (!query.trim()) return;
    navigate(`/shop?q=${encodeURIComponent(query.trim())}`);
    onClose();
  };

  if (!visible) return null;

  return (
    <div
      style={{
        position: "absolute",
        top: "calc(100% + 1px)",
        left: 0,
        right: 0,
        background: "rgba(10,7,3,0.98)",
        borderBottom: `1px solid ${C.border}`,
        borderTop: `2px solid ${C.gold}`,
        backdropFilter: "blur(24px)",
        padding: "24px 48px",
        zIndex: 9998,
        display: "flex",
        alignItems: "center",
        gap: "16px",
        boxShadow: "0 20px 60px rgba(0,0,0,0.8)",
        animation: "searchSlide 0.22s cubic-bezier(0.4,0,0.2,1) forwards",
      }}
    >
      <style>{`@keyframes searchSlide { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }`}</style>
      <span style={{ color: C.gold, display: "flex" }}><SearchIcon /></span>
      <input
        ref={inputRef}
        value={query}
        onChange={e => setQuery(e.target.value)}
        onKeyDown={e => { if (e.key === "Enter") submit(); if (e.key === "Escape") onClose(); }}
        placeholder="Search styles, categories, products…"
        style={{
          flex: 1,
          background: "transparent",
          border: "none",
          borderBottom: `1px solid rgba(201,168,76,0.3)`,
          color: "#fff",
          fontSize: "16px",
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          letterSpacing: "0.06em",
          padding: "8px 4px",
          outline: "none",
        }}
      />
      {query && (
        <button
          onClick={submit}
          style={{
            background: C.gold,
            border: "none",
            color: "#0f0c08",
            padding: "8px 22px",
            fontSize: "9.5px",
            letterSpacing: "0.18em",
            cursor: "pointer",
            fontFamily: "inherit",
            transition: "background 0.2s",
            whiteSpace: "nowrap",
          }}
          onMouseEnter={e => e.currentTarget.style.background = "#e8c96e"}
          onMouseLeave={e => e.currentTarget.style.background = C.gold}
        >
          SEARCH
        </button>
      )}
      <button
        onClick={onClose}
        style={{ background: "none", border: "none", color: "rgba(255,255,255,0.3)", cursor: "pointer", fontSize: "20px", lineHeight: 1, padding: "4px" }}
        onMouseEnter={e => e.currentTarget.style.color = "#fff"}
        onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.3)"}
      >
        ×
      </button>
    </div>
  );
}

// ── Main Navbar ───────────────────────────────────────────────────────────────
export default function Navbar({ onAuth }) {
  const [active, setActive]   = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [userDrop, setUserDrop] = useState(false);
  const navigate  = useNavigate();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { cartCount } = useCart();

  // Scroll detection
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  // Close everything when clicking outside
  useEffect(() => {
    const close = () => { setActive(null); setUserDrop(false); setSearchOpen(false); };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  // LEFT: NEW IN, WOMEN, MEN  |  RIGHT: ACCESSORIES, SALE
  const LEFT  = NAV_ITEMS.slice(0, 3);
  const RIGHT = NAV_ITEMS.slice(3);

  // Icon button style helper
  const iconBtn = (active) => ({
    background: "none",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    padding: "6px",
    color: active ? C.gold : "rgba(255,255,255,0.5)",
    transition: "color 0.18s",
  });

  const divider = (
    <div style={{ width: 1, height: 18, background: "rgba(255,255,255,0.1)", flexShrink: 0 }} />
  );

  return (
    <>
      {/* ── Nav bar ─────────────────────────────────────────────── */}
      <nav
        onClick={e => e.stopPropagation()}
        style={{
          position: "fixed",
          top: 0, left: 0, right: 0,
          zIndex: 500,
          height: "64px",
          // 3-column grid: nav-left | MAISON logo | nav-right
          // Each side column is equal width (1fr) so logo is always perfectly centred.
          display: "grid",
          gridTemplateColumns: "1fr auto 1fr",
          alignItems: "center",
          padding: "0 40px",
          background: scrolled ? "rgba(8,5,2,0.98)" : "rgba(8,5,2,0.95)",
          borderBottom: scrolled ? `1px solid ${C.border}` : "1px solid rgba(255,255,255,0.04)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          boxShadow: scrolled ? "0 8px 50px rgba(0,0,0,0.7)" : "none",
          transition: "background 0.35s ease, box-shadow 0.35s ease, border-color 0.35s ease",
          animation: "slideDown 0.8s cubic-bezier(0.4,0,0.2,1) forwards",
        }}
      >
        {/* ── Column 1: LEFT nav links ──────────────────────────── */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "28px",
          justifyContent: "flex-start",
          overflow: "visible",
        }}>
          {LEFT.map(item => (
            <NavItem key={item.label} item={item} active={active} setActive={setActive} />
          ))}
        </div>

        {/* ── Column 2: MAISON logo (always centred in its own cell) */}
        <div
          onClick={() => navigate("/")}
          style={{
            cursor: "pointer",
            userSelect: "none",
            textAlign: "center",
            padding: "0 28px",
            flexShrink: 0,
          }}
        >
          <div style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "21px",
            letterSpacing: "0.44em",
            fontWeight: 600,
            color: "#fff",
            lineHeight: 1,
          }}>
            MAISON
          </div>
          <div style={{
            height: "1px",
            marginTop: "4px",
            background: "linear-gradient(90deg, transparent, rgba(201,168,76,0.5), transparent)",
          }} />
        </div>

        {/* ── Column 3: RIGHT nav links + icon cluster ──────────── */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "16px",
          justifyContent: "flex-end",
          overflow: "visible",
        }}>
          {RIGHT.map(item => (
            <NavItem key={item.label} item={item} active={active} setActive={setActive} alignRight />
          ))}

          {divider}

          {/* Search button */}
          <button
            onClick={() => setSearchOpen(s => !s)}
            style={iconBtn(searchOpen)}
            onMouseEnter={e => e.currentTarget.style.color = C.gold}
            onMouseLeave={e => e.currentTarget.style.color = searchOpen ? C.gold : "rgba(255,255,255,0.5)"}
            title="Search"
          >
            <SearchIcon />
          </button>

          {/* Cart */}
          <button
            onClick={() => navigate("/cart")}
            style={{ ...iconBtn(false), position: "relative" }}
            onMouseEnter={e => e.currentTarget.style.color = C.gold}
            onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.5)"}
            title="Cart"
          >
            <BagIcon />
            {cartCount > 0 && (
              <span style={{
                position: "absolute", top: 0, right: 0,
                width: 14, height: 14,
                background: C.gold,
                borderRadius: "50%",
                fontSize: "8px",
                color: "#0f0c08",
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
                {cartCount}
              </span>
            )}
          </button>

          {divider}

          {/* Auth area */}
          {isAuthenticated ? (
            <div
              style={{ position: "relative" }}
              onMouseEnter={() => setUserDrop(true)}
              onMouseLeave={() => setUserDrop(false)}
            >
              {/* User button */}
              <button style={{
                background: "none",
                border: `1px solid ${C.border}`,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "7px",
                padding: "6px 14px",
                color: C.gold,
                fontSize: "10px",
                letterSpacing: "0.14em",
                fontFamily: "inherit",
                transition: "all 0.2s",
                whiteSpace: "nowrap",
              }}>
                <UserIcon />
                {user?.name?.split(" ")[0] || "Account"}
              </button>

              {/* User dropdown */}
              {userDrop && (
                <div style={{
                  position: "absolute",
                  top: "calc(100% + 8px)",
                  right: 0,
                  minWidth: "180px",
                  background: C.surface,
                  border: `1px solid ${C.border}`,
                  borderTop: `2px solid ${C.gold}`,
                  boxShadow: "0 20px 50px rgba(0,0,0,0.7)",
                  zIndex: 9999,
                }}>
                  {[
                    { label: "MY ACCOUNT", path: "/account" },
                    { label: "MY ORDERS",  path: "/account?tab=orders" },
                    ...(isAdmin ? [{ label: "ADMIN PANEL", path: "/admin", gold: true }] : []),
                  ].map(item => (
                    <div
                      key={item.label}
                      onClick={() => { navigate(item.path); setUserDrop(false); }}
                      style={{
                        padding: "11px 18px",
                        fontSize: "10px",
                        letterSpacing: "0.14em",
                        color: item.gold ? C.gold : "rgba(255,255,255,0.6)",
                        cursor: "pointer",
                        borderBottom: "1px solid rgba(255,255,255,0.05)",
                        transition: "all 0.15s",
                      }}
                      onMouseEnter={e => { e.currentTarget.style.color = C.gold; e.currentTarget.style.background = "rgba(201,168,76,0.07)"; }}
                      onMouseLeave={e => { e.currentTarget.style.color = item.gold ? C.gold : "rgba(255,255,255,0.6)"; e.currentTarget.style.background = ""; }}
                    >
                      {item.label}
                    </div>
                  ))}
                  <div
                    onClick={() => { logout(); setUserDrop(false); }}
                    style={{
                      padding: "11px 18px",
                      fontSize: "10px",
                      letterSpacing: "0.14em",
                      color: "rgba(255,80,80,0.7)",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      transition: "all 0.15s",
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
            /* Sign In / Sign Up buttons */
            <div style={{
              display: "flex",
              alignItems: "stretch",
              border: `1px solid rgba(201,168,76,0.25)`,
              overflow: "hidden",
              flexShrink: 0,
            }}>
              <button
                onClick={() => onAuth("signin")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "0 16px",
                  height: "34px",
                  fontSize: "9.5px",
                  letterSpacing: "0.18em",
                  fontFamily: "'Cormorant Garamond', serif",
                  cursor: "pointer",
                  border: "none",
                  color: "rgba(255,255,255,0.7)",
                  background: "rgba(255,255,255,0.04)",
                  transition: "all 0.2s",
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={e => { e.currentTarget.style.color = C.gold; e.currentTarget.style.background = "rgba(201,168,76,0.09)"; }}
                onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.7)"; e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
              >
                <UserIcon /> SIGN IN
              </button>
              <div style={{ width: "1px", background: "rgba(255,255,255,0.1)" }} />
              <button
                onClick={() => onAuth("signup")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "0 16px",
                  height: "34px",
                  fontSize: "9.5px",
                  letterSpacing: "0.18em",
                  fontFamily: "'Cormorant Garamond', serif",
                  cursor: "pointer",
                  border: "none",
                  color: "#0f0c08",
                  background: `linear-gradient(90deg, ${C.gold}, ${C.goldDark})`,
                  transition: "all 0.2s",
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={e => { e.currentTarget.style.background = `linear-gradient(90deg, ${C.goldLight}, ${C.gold})`; }}
                onMouseLeave={e => { e.currentTarget.style.background = `linear-gradient(90deg, ${C.gold}, ${C.goldDark})`; }}
              >
                <UserIcon /> JOIN
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* ── Search dropdown — rendered outside the nav so it spans full width ── */}
      {searchOpen && (
        <div
          style={{
            position: "fixed",
            top: "64px",
            left: 0,
            right: 0,
            zIndex: 499,
          }}
          onClick={e => e.stopPropagation()}
        >
          <SearchDropdown visible={searchOpen} onClose={() => setSearchOpen(false)} />
        </div>
      )}
    </>
  );
}
