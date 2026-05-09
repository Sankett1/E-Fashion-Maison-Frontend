import { useState } from "react";
import { C, GoldBar } from "../components/shared";

const FAQS = [
  { q: "What is MAISON's return policy?", a: "We offer a 14-day return window from the date of delivery for all full-price items. Sale items are eligible for exchange only." },
  { q: "How do I initiate a return?", a: "Log in to your account, go to 'My Orders', select the order and click 'Request Return'. You'll receive a prepaid return label within 24 hours." },
  { q: "When will I receive my refund?", a: "Refunds are processed within 5–7 business days after we receive the returned item. The amount will appear in your original payment method within 3–5 additional working days." },
  { q: "Can I exchange an item for a different size?", a: "Yes, exchanges for size or colour are available within 14 days. Go to 'My Orders' and select 'Request Exchange'." },
  { q: "What condition should items be returned in?", a: "Items must be unworn, unwashed, with original tags attached. Items showing signs of use cannot be accepted." },
];

export default function ReturnsPage({ onAuth }) {
  const [open, setOpen] = useState(null);

  return (
    <>
      <div style={{ minHeight: "100vh", background: C.bg, paddingTop: "100px" }}>
        <div style={{ textAlign: "center", padding: "48px 20px 60px" }}>
          <div style={{ fontSize: "9.5px", letterSpacing: "0.28em", color: C.gold, marginBottom: "14px" }}>HASSLE-FREE</div>
          <h1 style={{ fontFamily: "'DM Serif Display',Georgia,serif", fontSize: "52px", fontWeight: 400, color: "#fff", marginBottom: "16px" }}>Returns & Exchanges</h1>
          <GoldBar centered />
          <p style={{ fontSize: "15px", color: "rgba(255,255,255,0.45)", maxWidth: "480px", margin: "0 auto", lineHeight: 1.8 }}>
            Shopping with confidence. Our returns process is simple, transparent, and free.
          </p>
        </div>

        <div style={{ maxWidth: "900px", margin: "0 auto 80px", padding: "0 40px" }}>
          {/* Steps */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1px", background: "rgba(201,168,76,0.12)", marginBottom: "56px" }}>
            {[
              { num: "01", title: "Request", desc: "Log in and initiate your return within 14 days" },
              { num: "02", title: "Print Label", desc: "We email a prepaid return shipping label" },
              { num: "03", title: "Drop Off", desc: "Drop at any BlueDart or DTDC location" },
              { num: "04", title: "Refund", desc: "Processed within 5–7 business days of receipt" },
            ].map(s => (
              <div key={s.num} style={{ padding: "32px 24px", background: C.surface, textAlign: "center" }}>
                <div style={{ fontFamily: "'DM Serif Display',Georgia,serif", fontSize: "28px", color: C.gold, marginBottom: "10px" }}>{s.num}</div>
                <div style={{ fontSize: "12px", letterSpacing: "0.14em", color: "#fff", marginBottom: "8px" }}>{s.title.toUpperCase()}</div>
                <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", lineHeight: 1.6 }}>{s.desc}</div>
              </div>
            ))}
          </div>

          {/* Policy highlights */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "48px" }}>
            {[
              { icon: "📅", title: "14-Day Window", text: "Returns accepted within 14 days of delivery for full-price items." },
              { icon: "🔄", title: "Free Returns", text: "We provide a prepaid label. No deduction from your refund." },
              { icon: "💳", title: "Original Payment", text: "Refunds go back to your original payment method or as store credit." },
              { icon: "🚫", title: "Non-Returnable", text: "Intimate apparel, altered items, and final sale items cannot be returned." },
            ].map(item => (
              <div key={item.title} style={{ padding: "28px", background: C.surface, border: "1px solid rgba(201,168,76,0.1)", display: "flex", gap: "18px", alignItems: "flex-start" }}>
                <span style={{ fontSize: "24px", flexShrink: 0 }}>{item.icon}</span>
                <div>
                  <div style={{ fontFamily: "'DM Serif Display',Georgia,serif", fontSize: "15px", color: "#fff", marginBottom: "7px" }}>{item.title}</div>
                  <div style={{ fontSize: "12.5px", color: "rgba(255,255,255,0.45)", lineHeight: 1.7 }}>{item.text}</div>
                </div>
              </div>
            ))}
          </div>

          {/* FAQs */}
          <div style={{ fontFamily: "'DM Serif Display',Georgia,serif", fontSize: "26px", color: "#fff", marginBottom: "24px" }}>Frequently Asked Questions</div>
          {FAQS.map((faq, i) => (
            <div key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", overflow: "hidden" }}>
              <button onClick={() => setOpen(open === i ? null : i)} style={{ width: "100%", background: "none", border: "none", padding: "20px 0", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", color: open === i ? C.gold : "rgba(255,255,255,0.75)", fontFamily: "'DM Sans',system-ui,sans-serif", fontSize: "15px", transition: "color 0.2s", textAlign: "left" }}>
                {faq.q}
                <span style={{ fontSize: "20px", transition: "transform 0.25s", transform: open === i ? "rotate(45deg)" : "none", color: C.gold, flexShrink: 0, marginLeft: "16px" }}>+</span>
              </button>
              <div style={{ maxHeight: open === i ? "200px" : "0", overflow: "hidden", transition: "max-height 0.35s ease" }}>
                <p style={{ padding: "0 0 20px", fontSize: "13.5px", color: "rgba(255,255,255,0.5)", lineHeight: 1.8 }}>{faq.a}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
