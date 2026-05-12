import { useState } from "react";
import { C, GoldBar } from "../components/shared";

const FAQS = [
  { cat:"Orders", q:"How do I place an order?", a:"Browse our collections, select your size and colour, then add to cart. Proceed to checkout, enter your delivery details and payment — you'll receive a confirmation email within minutes." },
  { cat:"Orders", q:"Can I modify or cancel my order?", a:"You can cancel or modify your order within 1 hour of placing it by contacting us at hello@maison.in. After that window, the order enters fulfilment and cannot be changed." },
  { cat:"Orders", q:"Do you offer gift wrapping?", a:"Yes — every MAISON order ships in our signature gift-ready packaging at no extra cost. For an additional personalised note, add your message in the 'Order Notes' field at checkout." },
  { cat:"Payment", q:"What payment methods do you accept?", a:"We accept Razorpay, UPI, Net Banking, Visa, Mastercard, RuPay, EMI (no-cost on select banks), PayTM, PhonePe, and Google Pay." },
  { cat:"Payment", q:"Is my payment information secure?", a:"Absolutely. All transactions are processed through Razorpay's PCI-DSS Level 1 certified gateway. MAISON never stores your card details." },
  { cat:"Payment", q:"Are EMI options available?", a:"No-cost EMI is available on orders above ₹5,000 via select credit cards (HDFC, ICICI, SBI, Axis). Options are shown at checkout based on your card." },
  { cat:"Shipping", q:"How long does delivery take?", a:"Standard delivery takes 5–7 business days across India. Express (2–3 days) and Same-Day (Mumbai only, order by 12 PM) are also available. See our Shipping Policy for full details." },
  { cat:"Shipping", q:"Do you ship internationally?", a:"Yes, we ship to over 40 countries. International delivery takes 10–14 business days. Duties and taxes are the customer's responsibility." },
  { cat:"Shipping", q:"How do I track my order?", a:"You'll receive a tracking link via email and WhatsApp once your order ships. You can also visit the Track Order page and enter your order ID." },
  { cat:"Returns", q:"What is your return policy?", a:"Full-price items can be returned within 14 days of delivery — unworn, unwashed, with original tags. Sale items are eligible for exchange only." },
  { cat:"Returns", q:"How do I start a return?", a:"Log in to your account, go to My Orders, select the item, and click 'Request Return'. You'll receive a prepaid label within 24 hours." },
  { cat:"Returns", q:"When will I get my refund?", a:"Refunds are processed within 5–7 business days of receiving the returned item, back to your original payment method." },
  { cat:"Products", q:"How do I find my size?", a:"Visit our Size Guide page for detailed measurements across all categories. If you're between sizes, we generally recommend sizing up for outerwear and sizing true for tailoring." },
  { cat:"Products", q:"Are your fabrics sustainably sourced?", a:"We prioritise Indian artisan-crafted fabrics — Mysore silk, Rajasthani wool, Kanjeevaram weaves. Our sustainability commitments are detailed on our Sustainability page." },
  { cat:"Products", q:"Do you restock sold-out items?", a:"Selected styles are restocked seasonally. Use the 'Notify Me' button on a sold-out product page to be alerted when it returns." },
];

const CATS = ["All", ...Array.from(new Set(FAQS.map(f => f.cat)))];

export default function FAQPage() {
  const [open, setOpen]   = useState(null);
  const [cat,  setCat]    = useState("All");
  const filtered = cat === "All" ? FAQS : FAQS.filter(f => f.cat === cat);

  return (
    <div style={{ minHeight:"100vh", background:C.bg, paddingTop:100 }}>
      {/* Hero */}
      <div style={{ textAlign:"center", padding:"48px 20px 56px" }}>
        <div style={{ fontSize:"9.5px", letterSpacing:"0.28em", color:C.gold, marginBottom:14 }}>QUICK ANSWERS</div>
        <h1 style={{ fontFamily:"'DM Serif Display',Georgia,serif", fontSize:"clamp(36px,5vw,54px)", fontWeight:400, color:"#fff", marginBottom:16 }}>Frequently Asked Questions</h1>
        <GoldBar centered />
        <p style={{ fontSize:15, color:"rgba(255,255,255,0.45)", maxWidth:480, margin:"0 auto", lineHeight:1.8 }}>
          Everything you need to know about ordering, shipping, returns, and more.
        </p>
      </div>

      {/* Category filter */}
      <div style={{ display:"flex", justifyContent:"center", gap:8, flexWrap:"wrap", padding:"0 20px 40px" }}>
        {CATS.map(c => (
          <button key={c} onClick={() => setCat(c)}
            style={{ padding:"8px 20px", border:`1px solid ${cat===c ? C.gold : "rgba(201,168,76,0.2)"}`,
              background: cat===c ? "rgba(201,168,76,0.1)" : "transparent",
              color: cat===c ? C.gold : "rgba(255,255,255,0.45)",
              fontFamily:"'DM Sans',system-ui,sans-serif", fontSize:11,
              letterSpacing:"0.12em", cursor:"pointer", transition:"all 0.2s" }}>
            {c.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Accordion */}
      <div style={{ maxWidth:800, margin:"0 auto 100px", padding:"0 24px" }}>
        {filtered.map((f, i) => (
          <div key={i} style={{ borderTop:"1px solid rgba(201,168,76,0.12)" }}>
            <button onClick={() => setOpen(open === i ? null : i)}
              style={{ width:"100%", background:"none", border:"none", padding:"24px 0",
                display:"flex", justifyContent:"space-between", alignItems:"center",
                cursor:"pointer", textAlign:"left", gap:16 }}>
              <span style={{ fontFamily:"'DM Serif Display',Georgia,serif", fontSize:18, color:"#fff", fontWeight:400 }}>{f.q}</span>
              <span style={{ color:C.gold, fontSize:20, flexShrink:0, transition:"transform 0.25s",
                transform: open===i ? "rotate(45deg)" : "none" }}>+</span>
            </button>
            {open === i && (
              <p style={{ fontFamily:"'DM Sans',system-ui,sans-serif", fontSize:15,
                color:"rgba(255,255,255,0.55)", lineHeight:1.9, paddingBottom:24, margin:0 }}>
                {f.a}
              </p>
            )}
          </div>
        ))}
        <div style={{ borderTop:"1px solid rgba(201,168,76,0.12)" }} />

        {/* Still need help */}
        <div style={{ textAlign:"center", marginTop:64, padding:"40px 32px",
          border:"1px solid rgba(201,168,76,0.15)", background:"rgba(201,168,76,0.03)" }}>
          <div style={{ fontSize:"9.5px", letterSpacing:"0.28em", color:C.gold, marginBottom:12 }}>STILL HAVE QUESTIONS?</div>
          <h3 style={{ fontFamily:"'DM Serif Display',Georgia,serif", fontSize:26, color:"#fff", fontWeight:400, marginBottom:12 }}>We're here to help</h3>
          <p style={{ fontFamily:"'DM Sans',system-ui,sans-serif", fontSize:14, color:"rgba(255,255,255,0.45)", marginBottom:24 }}>
            Our team typically responds within 2 hours on business days.
          </p>
          <a href="/contact" style={{ display:"inline-block", padding:"14px 36px",
            background:C.gold, color:"#0a0603",
            fontFamily:"'DM Sans',system-ui,sans-serif", fontSize:11,
            letterSpacing:"0.14em", fontWeight:600, textDecoration:"none" }}>
            CONTACT US
          </a>
        </div>
      </div>
    </div>
  );
}
