import { useState } from "react";
import { C, GoldBar, Spinner } from "../components/shared";

export default function ContactPage({ onAuth }) {
  const [form, setForm]   = useState({ name: "", email: "", subject: "", message: "" });
  const [sent, setSent]   = useState(false);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(null);

  const handle = async (e) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    setSent(true); setLoading(false);
  };

  const inputStyle = (key) => ({ width: "100%", padding: "14px 18px", background: focused === key ? "rgba(201,168,76,0.03)" : "rgba(255,255,255,0.03)", border: `1px solid ${focused === key ? C.gold : "rgba(201,168,76,0.2)"}`, color: "#fff", fontSize: "14px", outline: "none", fontFamily: "'DM Sans',system-ui,sans-serif", transition: "all 0.25s", boxSizing: "border-box" });

  return (
    <>
      <div style={{ minHeight: "100vh", background: C.bg, paddingTop: "100px" }}>
        {/* Hero */}
        <div className="r-section" style={{ textAlign: "center", paddingTop: "48px", paddingBottom: "60px" }}>
          <div style={{ fontSize: "9.5px", letterSpacing: "0.28em", color: C.gold, marginBottom: "14px" }}>WE'RE HERE</div>
          <h1 style={{ fontFamily: "'DM Serif Display',Georgia,serif", fontSize: "52px", fontWeight: 400, color: "#fff", marginBottom: "16px" }}>Get in Touch</h1>
          <GoldBar centered />
          <p style={{ fontSize: "15px", color: "rgba(255,255,255,0.45)", maxWidth: "480px", margin: "0 auto", lineHeight: 1.8 }}>
            Whether it's a styling question, order query, or just to say hello — we'd love to hear from you.
          </p>
        </div>

        <div className="r-section" style={{ paddingBottom: "80px" }}>
          <div className="r-grid-2" style={{ gap: "0", maxWidth: "1100px", margin: "0 auto", border: "1px solid rgba(201,168,76,0.15)" }}>
          {/* Info */}
          <div style={{ background: "linear-gradient(160deg, #0f0c08 0%, #1a1208 100%)", padding: "56px 48px", borderRight: "1px solid rgba(201,168,76,0.12)" }}>
            <div style={{ marginBottom: "48px" }}>
              <div style={{ fontSize: "9px", letterSpacing: "0.24em", color: C.gold, marginBottom: "16px" }}>MAISON ATELIER</div>
              <h2 style={{ fontFamily: "'DM Serif Display',Georgia,serif", fontSize: "28px", fontWeight: 400, color: "#fff", lineHeight: 1.4 }}>Crafted in India,<br />Loved Worldwide</h2>
            </div>
            {[
              { icon: "📍", label: "Address", value: "12, Altamount Road, Mumbai 400026" },
              { icon: "📞", label: "Phone", value: "+91 22 4000 1200" },
              { icon: "✉️", label: "Email", value: "hello@maison.in" },
              { icon: "🕐", label: "Hours", value: "Mon–Sat · 10am–7pm IST" },
            ].map(c => (
              <div key={c.label} style={{ marginBottom: "28px", display: "flex", gap: "16px", alignItems: "flex-start" }}>
                <span style={{ fontSize: "18px", marginTop: "2px" }}>{c.icon}</span>
                <div>
                  <div style={{ fontSize: "9px", letterSpacing: "0.18em", color: "rgba(255,255,255,0.3)", marginBottom: "5px" }}>{c.label.toUpperCase()}</div>
                  <div style={{ fontSize: "14px", color: "rgba(255,255,255,0.7)" }}>{c.value}</div>
                </div>
              </div>
            ))}
            <div style={{ marginTop: "40px", paddingTop: "28px", borderTop: "1px solid rgba(201,168,76,0.12)" }}>
              <div style={{ fontSize: "9px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.3)", marginBottom: "14px" }}>FOLLOW US</div>
              <div style={{ display: "flex", gap: "14px" }}>
                {["Instagram", "Pinterest", "Facebook"].map(s => (
                  <span key={s} style={{ fontSize: "10px", letterSpacing: "0.12em", color: "rgba(255,255,255,0.4)", cursor: "pointer", padding: "6px 14px", border: "1px solid rgba(255,255,255,0.1)", transition: "all 0.2s" }}
                    onMouseEnter={e => { e.currentTarget.style.color = C.gold; e.currentTarget.style.borderColor = C.border; }}
                    onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.4)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}>
                    {s.toUpperCase()}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Form */}
          <div style={{ background: C.surface, padding: "56px 48px" }}>
            {sent ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", textAlign: "center" }}>
                <div style={{ fontSize: "48px", marginBottom: "20px" }}>✉️</div>
                <h3 style={{ fontFamily: "'DM Serif Display',Georgia,serif", fontSize: "24px", color: "#fff", marginBottom: "12px" }}>Message Received</h3>
                <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.5)" }}>We'll be in touch within 24 hours.</p>
                <button onClick={() => setSent(false)} className="m-btn-outline-light" style={{ marginTop: "24px" }}>SEND ANOTHER</button>
              </div>
            ) : (
              <form onSubmit={handle}>
                <div style={{ fontFamily: "'DM Serif Display',Georgia,serif", fontSize: "22px", color: "#fff", marginBottom: "32px" }}>Send a Message</div>
                <div className="r-grid-2" style={{ gap: "16px", marginBottom: "16px" }}>
                  {[{ key: "name", ph: "Your Name" }, { key: "email", ph: "Email Address" }].map(f => (
                    <div key={f.key}>
                      <label style={{ display: "block", fontSize: "9px", letterSpacing: "0.18em", color: "rgba(255,255,255,0.35)", marginBottom: "8px" }}>{f.key.toUpperCase()}</label>
                      <input value={form[f.key]} onChange={e => setForm(v => ({ ...v, [f.key]: e.target.value }))} placeholder={f.ph} required
                        onFocus={() => setFocused(f.key)} onBlur={() => setFocused(null)}
                        style={inputStyle(f.key)} />
                    </div>
                  ))}
                </div>
                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "block", fontSize: "9px", letterSpacing: "0.18em", color: "rgba(255,255,255,0.35)", marginBottom: "8px" }}>SUBJECT</label>
                  <input value={form.subject} onChange={e => setForm(v => ({ ...v, subject: e.target.value }))} placeholder="How can we help?"
                    onFocus={() => setFocused("subject")} onBlur={() => setFocused(null)}
                    style={inputStyle("subject")} />
                </div>
                <div style={{ marginBottom: "28px" }}>
                  <label style={{ display: "block", fontSize: "9px", letterSpacing: "0.18em", color: "rgba(255,255,255,0.35)", marginBottom: "8px" }}>MESSAGE</label>
                  <textarea value={form.message} onChange={e => setForm(v => ({ ...v, message: e.target.value }))} placeholder="Your message…" rows={5} required
                    onFocus={() => setFocused("message")} onBlur={() => setFocused(null)}
                    style={{ ...inputStyle("message"), resize: "vertical" }} />
                </div>
                <button type="submit" disabled={loading} className="m-btn-gold" style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
                  {loading ? <><Spinner /> SENDING…</> : "SEND MESSAGE"}
                </button>
              </form>
            )}
          </div>
          </div>
        </div>
      </div>
    </>
  );
}
