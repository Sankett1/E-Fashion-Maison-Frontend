import { C, GoldBar } from "../components/shared";

const SECTIONS = [
  {
    title: "Delivery Timelines",
    items: [
      { label: "Standard Delivery",       detail: "5–7 business days · Free on orders above ₹2,000" },
      { label: "Express Delivery",        detail: "2–3 business days · ₹299 flat fee" },
      { label: "Same-Day (Mumbai only)",  detail: "Order before 12 PM · ₹499 flat fee" },
      { label: "International Shipping",  detail: "10–14 business days · Calculated at checkout" },
    ],
  },
  {
    title: "How We Ship",
    body: "All MAISON orders are dispatched from our Mumbai atelier in signature gift-ready packaging. Each item is wrapped in acid-free tissue, sealed with our gold wax stamp, and placed in a rigid mailer. You'll receive a tracking link via email and WhatsApp as soon as your order ships.",
  },
  {
    title: "Tracking Your Order",
    body: "Once dispatched, visit the Track Order page and enter your order ID or the tracking number in your shipping confirmation email. Our courier partners include Delhivery, BlueDart, and Ecom Express for domestic shipments.",
  },
  {
    title: "Undeliverable Packages",
    body: "If a delivery attempt fails three times, the package is returned to us. We'll contact you within 48 hours to arrange re-delivery. Please ensure your address and phone number are accurate at checkout.",
  },
  {
    title: "Damaged or Lost Shipments",
    body: "In the rare event your order arrives damaged or goes missing in transit, email us at hello@maison.in within 48 hours of the expected delivery date with your order ID and photos (if applicable). We'll resolve it promptly.",
  },
];

export default function ShippingPolicyPage() {
  return (
    <div style={{ minHeight:"100vh", background:C.bg, paddingTop:100 }}>
      {/* Hero */}
      <div style={{ textAlign:"center", padding:"48px 20px 60px" }}>
        <div style={{ fontSize:"9.5px", letterSpacing:"0.28em", color:C.gold, marginBottom:14 }}>DELIVERY INFO</div>
        <h1 style={{ fontFamily:"'DM Serif Display',Georgia,serif", fontSize:"clamp(36px,5vw,54px)", fontWeight:400, color:"#fff", marginBottom:16 }}>Shipping Policy</h1>
        <GoldBar centered />
        <p style={{ fontSize:15, color:"rgba(255,255,255,0.45)", maxWidth:480, margin:"0 auto", lineHeight:1.8 }}>
          We ship across India and internationally. Every order leaves our atelier carefully packaged and fully tracked.
        </p>
      </div>

      {/* Content */}
      <div style={{ maxWidth:860, margin:"0 auto 100px", padding:"0 24px" }}>
        {SECTIONS.map(s => (
          <div key={s.title} style={{ marginBottom:48, borderTop:"1px solid rgba(201,168,76,0.12)", paddingTop:36 }}>
            <h2 style={{ fontFamily:"'DM Serif Display',Georgia,serif", fontSize:24, fontWeight:400, color:"#fff", marginBottom:20 }}>{s.title}</h2>
            {s.items
              ? <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(340px,1fr))", gap:16 }}>
                  {s.items.map(item => (
                    <div key={item.label} style={{ background:"rgba(201,168,76,0.04)", border:"1px solid rgba(201,168,76,0.12)", padding:"20px 24px" }}>
                      <div style={{ fontFamily:"'DM Sans',system-ui,sans-serif", fontSize:13, fontWeight:600, color:C.gold, letterSpacing:"0.06em", marginBottom:6 }}>{item.label}</div>
                      <div style={{ fontFamily:"'DM Sans',system-ui,sans-serif", fontSize:14, color:"rgba(255,255,255,0.55)", lineHeight:1.7 }}>{item.detail}</div>
                    </div>
                  ))}
                </div>
              : <p style={{ fontFamily:"'DM Sans',system-ui,sans-serif", fontSize:15, color:"rgba(255,255,255,0.55)", lineHeight:1.9 }}>{s.body}</p>
            }
          </div>
        ))}
      </div>
    </div>
  );
}
