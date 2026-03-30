import { useState, useRef, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { C, GoldBar, EyeIcon, XIcon, Spinner } from "./shared";

// ── Password strength meter ───────────────────────────────────────────────────
function StrengthMeter({ password }) {
  const getStrength = (pw) => {
    if (!pw) return 0;
    let s = 0;
    if (pw.length >= 8)              s++;
    if (/[A-Z]/.test(pw))            s++;
    if (/[0-9]/.test(pw))            s++;
    if (/[^A-Za-z0-9]/.test(pw))     s++;
    return s;
  };

  const strength = getStrength(password);
  const labels   = ["", "Weak", "Fair", "Strong", "Excellent"];
  const colors   = ["", "#e07070", "#d4a04a", "#7ab87a", "#c9a84c"];

  if (!password) return null;

  return (
    <div style={{ marginTop: "8px" }}>
      <div style={{ display: "flex", gap: "4px", marginBottom: "5px" }}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} style={{
            flex: 1, height: "2px",
            background: i <= strength ? colors[strength] : "rgba(255,255,255,0.08)",
            transition: "background 0.3s ease",
            borderRadius: "1px",
          }} />
        ))}
      </div>
      <div style={{
        fontSize: "9px", letterSpacing: "0.12em",
        color: colors[strength], textAlign: "right",
        transition: "color 0.3s",
      }}>
        {labels[strength].toUpperCase()}
      </div>
    </div>
  );
}

// ── Input field ───────────────────────────────────────────────────────────────
function AuthInput({ placeholder, value, onChange, onKeyDown, type = "text", icon, rightSlot, error }) {
  const [focused, setFocused] = useState(false);

  return (
    <div>
      <div style={{
        position: "relative",
        border: `1px solid ${error ? "rgba(220,100,100,0.5)" : focused ? "rgba(201,168,76,0.55)" : "rgba(255,255,255,0.09)"}`,
        background: error ? "rgba(220,100,100,0.04)" : focused ? "rgba(201,168,76,0.04)" : "rgba(255,255,255,0.03)",
        transition: "all 0.22s ease",
        display: "flex", alignItems: "center",
      }}>
        {icon && (
          <span style={{
            paddingLeft: "16px", flexShrink: 0,
            color: error ? "rgba(220,100,100,0.6)" : focused ? C.gold : "rgba(255,255,255,0.25)",
            display: "flex", transition: "color 0.22s",
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
            padding: icon ? "13px 12px" : "13px 16px",
            paddingRight: rightSlot ? "46px" : "16px",
            fontSize: "13px", fontWeight: 300, letterSpacing: "0.03em",
            background: "transparent", border: "none", outline: "none",
            color: "rgba(255,255,255,0.85)",
            fontFamily: "'Cormorant Garamond', serif",
          }}
        />
        {rightSlot && (
          <span style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)" }}>
            {rightSlot}
          </span>
        )}
      </div>
      {error && (
        <p style={{ fontSize: "10px", color: "#e07070", margin: "4px 0 0 2px", letterSpacing: "0.04em" }}>
          {error}
        </p>
      )}
    </div>
  );
}

// ── Checkbox ──────────────────────────────────────────────────────────────────
function GoldCheckbox({ checked, onChange, label }) {
  return (
    <label style={{ display: "flex", alignItems: "flex-start", gap: "10px", cursor: "pointer" }}>
      <div
        onClick={onChange}
        style={{
          width: "16px", height: "16px", flexShrink: 0, marginTop: "2px",
          border: `1px solid ${checked ? C.gold : "rgba(255,255,255,0.2)"}`,
          background: checked ? "rgba(201,168,76,0.15)" : "transparent",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "all 0.2s ease", cursor: "pointer",
        }}
      >
        {checked && (
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={C.gold} strokeWidth="2.5" strokeLinecap="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </div>
      <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", lineHeight: 1.6, letterSpacing: "0.04em" }}>
        {label}
      </span>
    </label>
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

// ── SignUp ────────────────────────────────────────────────────────────────────
export default function SignUp({ onClose, onSwitchToSignIn }) {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [showPw, setShowPw]         = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreed, setAgreed]         = useState(false);
  const [loading, setLoading]       = useState(false);
  const [errors, setErrors]         = useState({});
  const [msg, setMsg]               = useState({ type: "", text: "" });

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

  const dismiss = useCallback(() => {
    const overlay = overlayRef.current;
    const card    = cardRef.current;
    overlay.style.transition = "opacity 0.28s ease";
    card.style.transition    = "all 0.28s ease-in";
    overlay.style.opacity    = "0";
    card.style.opacity       = "0";
    card.style.transform     = "translateY(24px) scale(0.96)";
    setTimeout(onClose, 290);
  }, [onClose]);

  useEffect(() => {
    const h = e => e.key === "Escape" && dismiss();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [dismiss]);

  const validate = () => {
    const errs = {};
    if (!form.name.trim())              errs.name     = "Full name is required.";
    if (!form.email.includes("@"))      errs.email    = "Enter a valid email address.";
    if (form.password.length < 6)       errs.password = "Password must be at least 6 characters.";
    if (form.password !== form.confirm) errs.confirm  = "Passwords do not match.";
    if (!agreed)                        errs.terms    = "Please accept the terms to continue.";
    return errs;
  };

  const { register } = useAuth();

  const handleSubmit = async () => {
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setLoading(true);
    setMsg({ type: "", text: "" });

    try {
      await register({ name: form.name, email: form.email, password: form.password });
      setMsg({ type: "ok", text: "✓  Account created. Welcome to MAISON." });
      setTimeout(dismiss, 1000);
    } catch (err) {
      setMsg({
        type: "err",
        text: err?.response?.data?.message || "Something went wrong. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const set = key => e => {
    setForm({ ...form, [key]: e.target.value });
    if (errors[key]) setErrors({ ...errors, [key]: "" });
  };
  const onEnter = e => e.key === "Enter" && handleSubmit();

  const eyeBtn = (show, toggle) => (
    <button
      onClick={toggle}
      style={{
        background: "none", border: "none", cursor: "pointer",
        color: "rgba(255,255,255,0.3)", display: "flex", padding: 0,
        transition: "color 0.2s",
      }}
      onMouseEnter={e => e.currentTarget.style.color = C.gold}
      onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.3)"}
    >
      <EyeIcon off={show} />
    </button>
  );

  return (
    <div
      ref={overlayRef}
      onClick={e => e.currentTarget === e.target && dismiss()}
      style={{
        position: "fixed", inset: 0, zIndex: 9000,
        background: "rgba(4,2,0,0.88)",
        backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "20px", overflowY: "auto",
      }}
    >
      <div
        ref={cardRef}
        style={{
          width: "100%", maxWidth: "440px",
          background: "linear-gradient(160deg, #110e08 0%, #0b0804 100%)",
          border: `1px solid ${C.border}`,
          boxShadow: "0 50px 130px rgba(0,0,0,0.85), inset 0 1px 0 rgba(255,255,255,0.04)",
          position: "relative",
          margin: "auto",
        }}
      >
        {/* Gold top accent */}
        <div style={{ height: "2px", background: "linear-gradient(90deg, transparent, #c9a84c 35%, #e8c96e 60%, transparent)" }} />

        {/* Close */}
        <button
          onClick={dismiss}
          style={{
            position: "absolute", top: "16px", right: "16px",
            background: "none", border: "none", cursor: "pointer", display: "flex",
            color: "rgba(255,255,255,0.25)", padding: "5px", transition: "color 0.2s",
          }}
          onMouseEnter={e => e.currentTarget.style.color = C.gold}
          onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.25)"}
        >
          <XIcon />
        </button>

        <div style={{ padding: "48px 46px 42px" }}>

          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: "30px" }}>
            <GoldBar width="44px" centered />
            <div style={{ marginTop: "18px" }} />
            <h2 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "27px", fontWeight: 500,
              color: "#fff", margin: "0 0 8px",
            }}>
              Create Account
            </h2>
            <p style={{
              fontSize: "9.5px", letterSpacing: "0.28em",
              color: "rgba(255,255,255,0.3)", fontWeight: 400, margin: 0,
            }}>
              JOIN THE MAISON COMMUNITY
            </p>
          </div>

          {/* Fields */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <AuthInput
              placeholder="Full Name"
              value={form.name}
              onChange={set("name")}
              onKeyDown={onEnter}
              error={errors.name}
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                </svg>
              }
            />
            <AuthInput
              placeholder="Email Address"
              value={form.email}
              onChange={set("email")}
              onKeyDown={onEnter}
              type="email"
              error={errors.email}
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              }
            />

            {/* Password + strength */}
            <div>
              <AuthInput
                placeholder="Password"
                value={form.password}
                onChange={set("password")}
                onKeyDown={onEnter}
                type={showPw ? "text" : "password"}
                error={errors.password}
                icon={
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                }
                rightSlot={eyeBtn(showPw, () => setShowPw(s => !s))}
              />
              <StrengthMeter password={form.password} />
            </div>

            <AuthInput
              placeholder="Confirm Password"
              value={form.confirm}
              onChange={set("confirm")}
              onKeyDown={onEnter}
              type={showConfirm ? "text" : "password"}
              error={errors.confirm}
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              }
              rightSlot={eyeBtn(showConfirm, () => setShowConfirm(s => !s))}
            />
          </div>

          {/* Terms */}
          <div style={{ margin: "16px 0" }}>
            <GoldCheckbox
              checked={agreed}
              onChange={() => setAgreed(a => !a)}
              label={<>I agree to the <span style={{ color: C.gold, cursor: "pointer", textDecoration: "underline", textUnderlineOffset: "3px" }}>Terms of Service</span> and <span style={{ color: C.gold, cursor: "pointer", textDecoration: "underline", textUnderlineOffset: "3px" }}>Privacy Policy</span></>}
            />
            {errors.terms && (
              <p style={{ fontSize: "10px", color: "#e07070", margin: "5px 0 0 26px", letterSpacing: "0.04em" }}>
                {errors.terms}
              </p>
            )}
          </div>

          {/* Message */}
          {msg.text && (
            <p style={{
              fontSize: "11px", textAlign: "center", margin: "0 0 12px",
              color: msg.type === "err" ? "#e07070" : C.gold, letterSpacing: "0.04em",
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
            {loading ? "CREATING ACCOUNT…" : "CREATE ACCOUNT"}
          </button>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "20px 0 15px" }}>
            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.07)" }} />
            <span style={{ fontSize: "9px", letterSpacing: "0.16em", color: "rgba(255,255,255,0.2)" }}>OR CONTINUE WITH</span>
            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.07)" }} />
          </div>

          {/* Social */}
          <div style={{ display: "flex", gap: "10px", marginBottom: "22px" }}>
            <SocialBtn label="GOOGLE" />
            <SocialBtn label="APPLE" />
          </div>

          {/* Switch */}
          <p style={{ textAlign: "center", fontSize: "12px", color: "rgba(255,255,255,0.3)", margin: 0, fontWeight: 300 }}>
            Already have an account?{" "}
            <button
              onClick={onSwitchToSignIn}
              style={{
                background: "none", border: "none", cursor: "pointer",
                fontSize: "12px", color: "rgba(255,255,255,0.65)",
                fontFamily: "inherit", textDecoration: "underline",
                textUnderlineOffset: "3px", transition: "color 0.2s",
              }}
              onMouseEnter={e => e.currentTarget.style.color = C.gold}
              onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.65)"}
            >
              Sign In
            </button>
          </p>

        </div>
      </div>
    </div>
  );
}
