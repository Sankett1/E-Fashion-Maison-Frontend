import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { C, GoldBar, EyeIcon, MailIcon, LockIcon, XIcon, Spinner } from "./shared";

// ── Input field ───────────────────────────────────────────────────────────────
function AuthInput({ placeholder, value, onChange, onKeyDown, type = "text", icon, rightSlot }) {
  const [focused, setFocused] = useState(false);

  return (
    <div style={{
      position: "relative",
      border: `1px solid ${focused ? "rgba(201,168,76,0.55)" : "rgba(255,255,255,0.09)"}`,
      background: focused ? "rgba(201,168,76,0.04)" : "rgba(255,255,255,0.03)",
      transition: "all 0.22s ease",
      display: "flex", alignItems: "center",
    }}>
      {/* Left icon */}
      {icon && (
        <span style={{
          paddingLeft: "16px", color: focused ? C.gold : "rgba(255,255,255,0.25)",
          display: "flex", transition: "color 0.22s", flexShrink: 0,
        }}>
          {icon}
        </span>
      )}

      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          flex: 1,
          padding: icon ? "14px 12px" : "14px 16px",
          paddingRight: rightSlot ? "46px" : "16px",
          fontSize: "13px", fontWeight: 400,
          letterSpacing: "0.03em",
          background: "transparent", border: "none", outline: "none",
          color: "rgba(255,255,255,0.85)",
          fontFamily: "'DM Sans', serif",
        }}
      />

      {/* Right slot (eye toggle etc.) */}
      {rightSlot && (
        <span style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)" }}>
          {rightSlot}
        </span>
      )}
    </div>
  );
}

// ── Social button ─────────────────────────────────────────────────────────────
function SocialBtn({ label }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        flex: 1, padding: "11px 0",
        fontSize: "10px", letterSpacing: "0.14em", fontWeight: 400,
        background: hov ? "rgba(201,168,76,0.07)" : "rgba(255,255,255,0.04)",
        border: `1px solid ${hov ? "rgba(201,168,76,0.4)" : "rgba(255,255,255,0.08)"}`,
        color: hov ? C.gold : "rgba(255,255,255,0.45)",
        cursor: "pointer", fontFamily: "inherit",
        transition: "all 0.2s ease",
      }}>
      {label}
    </button>
  );
}

// ── SignIn ────────────────────────────────────────────────────────────────────
export default function SignIn({ onClose, onSwitchToSignUp }) {
  const [form, setForm]       = useState({ email: "", password: "" });
  const [showPw, setShowPw]   = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg]         = useState({ type: "", text: "" });
  const overlayRef = useRef(null);
  const cardRef    = useRef(null);

  // Entrance animation
  useEffect(() => {
    const overlay = overlayRef.current;
    const card    = cardRef.current;
    overlay.style.opacity = "0";
    card.style.opacity    = "0";
    card.style.transform  = "translateY(45px) scale(0.94)";
    requestAnimationFrame(() => {
      overlay.style.transition = "opacity 0.35s ease";
      card.style.transition    = "all 0.45s cubic-bezier(0.34, 1.15, 0.64, 1)";
      overlay.style.opacity    = "1";
      card.style.opacity       = "1";
      card.style.transform     = "translateY(0) scale(1)";
    });
  }, []);

  const dismiss = () => {
    const overlay = overlayRef.current;
    const card    = cardRef.current;
    overlay.style.transition = "opacity 0.28s ease";
    card.style.transition    = "all 0.28s ease-in";
    overlay.style.opacity    = "0";
    card.style.opacity       = "0";
    card.style.transform     = "translateY(24px) scale(0.96)";
    setTimeout(onClose, 290);
  };

  // ESC to close
  useEffect(() => {
    const h = e => e.key === "Escape" && dismiss();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!form.email.includes("@")) return setMsg({ type: "err", text: "Enter a valid email address." });
    if (form.password.length < 6)  return setMsg({ type: "err", text: "Password must be at least 6 characters." });

    setLoading(true);
    setMsg({ type: "", text: "" });

    try {
      const data = await login({ email: form.email, password: form.password });
      setMsg({ type: "ok", text: "✓  Welcome back to MAISON." });
      setTimeout(() => {
        dismiss();
        if (data?.user?.role === "admin") navigate("/admin");
      }, 800);
    } catch (err) {
      setMsg({ type: "err", text: err?.response?.data?.message || "Invalid credentials. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const set = key => e => setForm({ ...form, [key]: e.target.value });
  const onEnter = e => e.key === "Enter" && handleSubmit();

  return (
    <div
      ref={overlayRef}
      onClick={e => e.currentTarget === e.target && dismiss()}
      style={{
        position: "fixed", inset: 0, zIndex: 9000,
        background: "rgba(4,2,0,0.88)",
        backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "20px",
      }}
    >
      <div
        ref={cardRef}
        style={{
          width: "100%", maxWidth: "430px",
          background: "linear-gradient(160deg, #110e08 0%, #0b0804 100%)",
          border: `1px solid ${C.border}`,
          boxShadow: "0 50px 130px rgba(0,0,0,0.85), inset 0 1px 0 rgba(255,255,255,0.04)",
          position: "relative",
        }}
      >
        {/* Gold top accent */}
        <div style={{ height: "2px", background: "linear-gradient(90deg, transparent, #c9a84c 35%, #e8c96e 60%, transparent)", width: "100%" }} />

        {/* Close */}
        <button
          onClick={dismiss}
          style={{
            position: "absolute", top: "16px", right: "16px",
            background: "none", border: "none", cursor: "pointer", display: "flex",
            color: "rgba(255,255,255,0.25)", padding: "5px",
            transition: "color 0.2s",
          }}
          onMouseEnter={e => e.currentTarget.style.color = C.gold}
          onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.25)"}
        >
          <XIcon />
        </button>

        <div style={{ padding: "50px 46px 44px" }}>

          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: "34px" }}>
            <GoldBar width="44px" centered />
            <div style={{ marginTop: "18px" }} />
            <h2 style={{
              fontFamily: "'DM Serif Display', serif",
              fontSize: "27px", fontWeight: 500,
              color: "#fff", margin: "0 0 8px",
            }}>
              Welcome Back
            </h2>
            <p style={{
              fontSize: "9.5px", letterSpacing: "0.28em",
              color: "rgba(255,255,255,0.3)", fontWeight: 400, margin: 0,
            }}>
              SIGN IN TO YOUR ACCOUNT
            </p>
          </div>

          {/* Fields */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "6px" }}>
            <AuthInput
              placeholder="Email Address"
              value={form.email}
              onChange={set("email")}
              onKeyDown={onEnter}
              type="email"
              icon={<MailIcon />}
            />
            <AuthInput
              placeholder="Password"
              value={form.password}
              onChange={set("password")}
              onKeyDown={onEnter}
              type={showPw ? "text" : "password"}
              icon={<LockIcon />}
              rightSlot={
                <button
                  onClick={() => setShowPw(s => !s)}
                  style={{
                    background: "none", border: "none", cursor: "pointer",
                    color: "rgba(255,255,255,0.3)", display: "flex", padding: 0,
                    transition: "color 0.2s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = C.gold}
                  onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.3)"}
                >
                  <EyeIcon off={showPw} />
                </button>
              }
            />
          </div>

          {/* Forgot */}
          <div style={{ textAlign: "right", marginBottom: "14px" }}>
            <button
              style={{
                background: "none", border: "none", cursor: "pointer",
                fontSize: "11px", letterSpacing: "0.05em",
                color: "rgba(255,255,255,0.3)", fontFamily: "inherit",
                transition: "color 0.2s",
              }}
              onMouseEnter={e => e.currentTarget.style.color = C.gold}
              onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.3)"}
            >
              Forgot password?
            </button>
          </div>

          {/* Message */}
          {msg.text && (
            <p style={{
              fontSize: "11px", textAlign: "center",
              margin: "0 0 12px",
              color: msg.type === "err" ? "#e07070" : C.gold,
              letterSpacing: "0.04em",
            }}>
              {msg.text}
            </p>
          )}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              width: "100%", padding: "15px",
              fontSize: "10px", letterSpacing: "0.26em", fontWeight: 500,
              color: "#0f0c08", fontFamily: "inherit",
              background: loading
                ? "rgba(201,168,76,0.5)"
                : "linear-gradient(90deg, #c9a84c 0%, #e0b85a 50%, #c9a84c 100%)",
              backgroundSize: "200% 100%",
              border: "none", cursor: loading ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
              transition: "all 0.35s ease",
            }}
            onMouseEnter={e => {
              if (!loading) {
                e.currentTarget.style.backgroundPosition = "100% 0";
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.boxShadow = "0 8px 28px rgba(201,168,76,0.35)";
              }
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundPosition = "0 0";
              e.currentTarget.style.transform = "none";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            {loading && <Spinner />}
            {loading ? "SIGNING IN…" : "SIGN IN"}
          </button>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "22px 0 16px" }}>
            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.07)" }} />
            <span style={{ fontSize: "9px", letterSpacing: "0.16em", color: "rgba(255,255,255,0.2)" }}>OR CONTINUE WITH</span>
            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.07)" }} />
          </div>

          {/* Social */}
          <div style={{ display: "flex", gap: "10px", marginBottom: "24px" }}>
            <SocialBtn label="GOOGLE" />
            <SocialBtn label="APPLE" />
          </div>

          {/* Switch */}
          <p style={{ textAlign: "center", fontSize: "12px", color: "rgba(255,255,255,0.3)", margin: 0, fontWeight: 400 }}>
            Don't have an account?{" "}
            <button
              onClick={onSwitchToSignUp}
              style={{
                background: "none", border: "none", cursor: "pointer",
                fontSize: "12px", color: "rgba(255,255,255,0.65)",
                fontFamily: "inherit", textDecoration: "underline",
                textUnderlineOffset: "3px", transition: "color 0.2s",
              }}
              onMouseEnter={e => e.currentTarget.style.color = C.gold}
              onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.65)"}
            >
              Sign Up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
