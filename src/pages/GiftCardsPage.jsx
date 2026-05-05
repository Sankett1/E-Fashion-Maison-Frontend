import { useState } from "react";
import { C, GoldBar } from "../components/shared";

const AMOUNTS = [1000, 2500, 5000, 10000, 25000];

export default function GiftCardsPage({ onAuth }) {
  const [amount, setAmount]   = useState(5000);
  const [custom, setCustom]   = useState("");
  const [recipient, setRecipient] = useState({ name: "", email: "", message: "" });
  const [added, setAdded]     = useState(false);

  const finalAmount = custom ? parseInt(custom) || 0 : amount;

  return (
    <>
      <div style={{ minHeight: "100vh", background: C.bg, paddingTop: "100px" }}>
        <div className="r-section" style={{ textAlign: "center", paddingTop: "48px", paddingBottom: "60px" }}>
          <div style={{ fontSize: "9.5px", letterSpacing: "0.28em", color: C.gold, marginBottom: "14px" }}>THE PERFECT GIFT</div>
          <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: "52px", fontWeight: 400, color: "#fff", marginBottom: "16px" }}>Gift Cards</h1>
          <GoldBar centered />
          <p style={{ fontSize: "15px", color: "rgba(255,255,255,0.45)", maxWidth: "480px", margin: "0 auto", lineHeight: 1.8 }}>
            Give the gift of impeccable style. Redeemable on everything at MAISON.
          </p>
        </div>

        <div className="r-section r-grid-2" style={{ maxWidth: "960px", margin: "0 auto", paddingBottom: "80px", gap: "40px" }}>
          {/* Card preview */}
          <div>
            <div style={{ aspectRatio: "1.6/1", background: "linear-gradient(135deg, #1a1208 0%, #2a1e0a 40%, #3a2810 60%, #1a0f05 100%)", border: `1px solid ${C.border}`, padding: "36px", display: "flex", flexDirection: "column", justifyContent: "space-between", position: "relative", overflow: "hidden", marginBottom: "28px" }}>
              <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 70% 30%, rgba(201,168,76,0.08) 0%, transparent 60%)" }} />
              <div style={{ position: "absolute", bottom: "-20px", right: "-20px", width: "160px", height: "160px", border: "1px solid rgba(201,168,76,0.1)", borderRadius: "50%" }} />
              <div>
                <div style={{ fontFamily: "'Playfair Display',serif", fontSize: "22px", letterSpacing: "0.38em", color: "#fff" }}>MAISON</div>
                <div style={{ fontSize: "9px", letterSpacing: "0.2em", color: "rgba(201,168,76,0.6)", marginTop: "3px" }}>GIFT CARD</div>
              </div>
              <div>
                <div style={{ fontFamily: "'Playfair Display',serif", fontSize: "36px", color: C.gold }}>₹{finalAmount.toLocaleString()}</div>
                {recipient.name && <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", marginTop: "6px" }}>For {recipient.name}</div>}
              </div>
            </div>

            <div style={{ fontSize: "9.5px", letterSpacing: "0.16em", color: "rgba(255,255,255,0.35)", marginBottom: "14px" }}>SELECT AMOUNT</div>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "16px" }}>
              {AMOUNTS.map(a => (
                <button key={a} onClick={() => { setAmount(a); setCustom(""); }} style={{ padding: "9px 18px", background: amount === a && !custom ? "rgba(201,168,76,0.12)" : "transparent", border: `1px solid ${amount === a && !custom ? C.gold : "rgba(201,168,76,0.2)"}`, color: amount === a && !custom ? C.gold : "rgba(255,255,255,0.5)", fontSize: "12px", cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s" }}>
                  ₹{a.toLocaleString()}
                </button>
              ))}
            </div>
            <div>
              <label style={{ display: "block", fontSize: "9px", letterSpacing: "0.16em", color: "rgba(255,255,255,0.35)", marginBottom: "8px" }}>CUSTOM AMOUNT (₹)</label>
              <input type="number" value={custom} onChange={e => { setCustom(e.target.value); setAmount(0); }} placeholder="Enter amount…"
                style={{ width: "160px", padding: "10px 14px", background: "rgba(255,255,255,0.04)", border: `1px solid ${custom ? C.gold : "rgba(201,168,76,0.2)"}`, color: "#fff", fontSize: "13px", outline: "none", fontFamily: "inherit" }} />
            </div>
          </div>

          {/* Form */}
          <div style={{ background: C.surface, border: "1px solid rgba(201,168,76,0.12)", padding: "36px" }}>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: "20px", color: "#fff", marginBottom: "28px" }}>Recipient Details</div>
            {[
              { key: "name", label: "Recipient's Name", ph: "Full name" },
              { key: "email", label: "Recipient's Email", ph: "email@example.com" },
            ].map(f => (
              <div key={f.key} style={{ marginBottom: "18px" }}>
                <label style={{ display: "block", fontSize: "9px", letterSpacing: "0.18em", color: "rgba(255,255,255,0.35)", marginBottom: "8px" }}>{f.label.toUpperCase()}</label>
                <input value={recipient[f.key]} onChange={e => setRecipient(v => ({ ...v, [f.key]: e.target.value }))} placeholder={f.ph}
                  style={{ width: "100%", padding: "12px 16px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(201,168,76,0.2)", color: "#fff", fontSize: "13px", outline: "none", fontFamily: "inherit", boxSizing: "border-box" }} />
              </div>
            ))}
            <div style={{ marginBottom: "28px" }}>
              <label style={{ display: "block", fontSize: "9px", letterSpacing: "0.18em", color: "rgba(255,255,255,0.35)", marginBottom: "8px" }}>PERSONAL MESSAGE (OPTIONAL)</label>
              <textarea value={recipient.message} onChange={e => setRecipient(v => ({ ...v, message: e.target.value }))} rows={3} placeholder="A note to the recipient…"
                style={{ width: "100%", padding: "12px 16px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(201,168,76,0.2)", color: "#fff", fontSize: "13px", outline: "none", fontFamily: "inherit", resize: "vertical", boxSizing: "border-box" }} />
            </div>
            <div style={{ padding: "16px", background: "rgba(201,168,76,0.05)", border: "1px solid rgba(201,168,76,0.15)", marginBottom: "24px", display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: "10px", letterSpacing: "0.14em", color: "rgba(255,255,255,0.45)" }}>GIFT CARD VALUE</span>
              <span style={{ fontFamily: "'Playfair Display',serif", fontSize: "18px", color: C.gold }}>₹{finalAmount.toLocaleString()}</span>
            </div>
            <button onClick={() => setAdded(true)} className="m-btn-gold" style={{ width: "100%" }}>
              {added ? "✓ ADDED TO CART" : "ADD TO CART"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
