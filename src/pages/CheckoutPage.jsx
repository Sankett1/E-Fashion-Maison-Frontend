import { useState, Fragment } from "react";
import { C } from "../components/shared";

const STEPS = ["Delivery", "Payment", "Confirmation"];

function StepIndicator({ current }) {
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:"0", marginBottom:"48px" }}>
      {STEPS.map((step, i) => (
        <Fragment key={step}>
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"8px" }}>
            <div style={{
              width:"36px", height:"36px", borderRadius:"50%",
              border: i <= current ? `2px solid ${C.gold}` : "2px solid rgba(201,168,76,0.2)",
              background: i < current ? C.gold : i === current ? "rgba(201,168,76,0.1)" : "transparent",
              display:"flex", alignItems:"center", justifyContent:"center",
              color: i < current ? "#0f0c08" : i === current ? C.gold : "#6b5c44",
              fontFamily:"'Playfair Display',serif", fontSize:"14px", fontWeight:500,
              transition:"all 0.3s",
            }}>
              {i < current ? "✓" : i + 1}
            </div>
            <span style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"10px", letterSpacing:"0.14em", color: i <= current ? C.gold : "#b0a08a" }}>
              {step.toUpperCase()}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div key={`line-${i}`} style={{ width:"80px", height:"1px", margin:"0 8px 22px", background: i < current ? C.gold : "rgba(201,168,76,0.2)", transition:"background 0.3s" }}/>
          )}
        </Fragment>
      ))}
    </div>
  );
}

function InputField({ label, placeholder, value, onChange, type="text", error }) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label style={{ display:"block", fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"9.5px", letterSpacing:"0.18em", color:"#6b5c44", marginBottom:"8px" }}>
        {label.toUpperCase()}
      </label>
      <input
        type={type} placeholder={placeholder} value={value} onChange={onChange}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{
          width:"100%", padding:"13px 16px", boxSizing:"border-box",
          border: `1px solid ${error ? "rgba(220,100,100,0.5)" : focused ? C.gold : "rgba(201,168,76,0.25)"}`,
          background: focused ? "rgba(201,168,76,0.02)" : "#fff",
          fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"14px", color:"#1a1208",
          outline:"none", transition:"all 0.2s",
        }}
      />
      {error && <p style={{ fontSize:"10px", color:"#e07070", margin:"4px 0 0", letterSpacing:"0.04em" }}>{error}</p>}
    </div>
  );
}

const ORDER_ITEMS = [
  { name:"Silk Satin Blouse", size:"M", qty:1, price:8200, image:"https://images.unsplash.com/photo-1485968579580-ee2a6b1e450f?w=200&q=80&fit=crop", grad:"linear-gradient(160deg,#f0ebe0 0%,#e0d8c8 50%,#c8bca8 100%)" },
  { name:"Belted Trench Coat", size:"S", qty:1, price:24900, image:"https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=200&q=80&fit=crop", grad:"linear-gradient(160deg,#c8b080 0%,#a89060 50%,#806840 100%)" },
];

export default function CheckoutPage({ onAuth }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ firstName:"", lastName:"", email:"", phone:"", address:"", city:"", state:"", pin:"", payMethod:"card", cardNum:"", expiry:"", cvv:"" });
  const [errors, setErrors] = useState({});

  const subtotal = ORDER_ITEMS.reduce((s, i) => s + i.price * i.qty, 0);
  const total = subtotal;

  const set = key => e => { setForm({ ...form, [key]: e.target.value }); if (errors[key]) setErrors({ ...errors, [key]:"" }); };

  const validateStep0 = () => {
    const errs = {};
    if (!form.firstName.trim()) errs.firstName = "Required";
    if (!form.email.includes("@")) errs.email = "Valid email required";
    if (!form.phone.match(/^\d{10}$/)) errs.phone = "Valid 10-digit number required";
    if (!form.address.trim()) errs.address = "Required";
    if (!form.city.trim()) errs.city = "Required";
    if (!form.pin.match(/^\d{6}$/)) errs.pin = "Valid 6-digit PIN required";
    return errs;
  };

  const handleNext = () => {
    if (step === 0) {
      const errs = validateStep0();
      if (Object.keys(errs).length) { setErrors(errs); return; }
    }
    setStep(s => s + 1);
    window.scrollTo(0, 0);
  };

  return (
    <>
      <div style={{ paddingTop:"64px", background:"#f5f0eb", minHeight:"100vh" }}>
        <div style={{ maxWidth:"1100px", margin:"0 auto", padding:"56px 48px" }}>
          <div style={{ textAlign:"center", marginBottom:"48px" }}>
            <div style={{ width:"40px", height:"1px", margin:"0 auto 20px", background:`linear-gradient(90deg,transparent,${C.gold},transparent)` }}/>
            <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:"38px", fontWeight:400, color:"#1a1208" }}>Checkout</h1>
          </div>

          <StepIndicator current={step} />

          <div style={{ display:"grid", gridTemplateColumns:"1fr 360px", gap:"48px", alignItems:"start" }}>
            {/* Main content */}
            <div style={{ background:"#fff", padding:"40px", border:"1px solid rgba(201,168,76,0.12)" }}>

              {/* STEP 0 — Delivery */}
              {step === 0 && (
                <>
                  <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"24px", fontWeight:400, color:"#1a1208", marginBottom:"32px" }}>Delivery Details</h2>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"16px", marginBottom:"16px" }}>
                    <InputField label="First Name" placeholder="Arjun" value={form.firstName} onChange={set("firstName")} error={errors.firstName}/>
                    <InputField label="Last Name" placeholder="Kapoor" value={form.lastName} onChange={set("lastName")}/>
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"16px", marginBottom:"16px" }}>
                    <InputField label="Email Address" type="email" placeholder="arjun@example.com" value={form.email} onChange={set("email")} error={errors.email}/>
                    <InputField label="Phone" placeholder="9876543210" value={form.phone} onChange={set("phone")} error={errors.phone}/>
                  </div>
                  <div style={{ marginBottom:"16px" }}>
                    <InputField label="Delivery Address" placeholder="Flat / House No., Street, Area" value={form.address} onChange={set("address")} error={errors.address}/>
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"16px" }}>
                    <InputField label="City" placeholder="Mumbai" value={form.city} onChange={set("city")} error={errors.city}/>
                    <InputField label="State" placeholder="Maharashtra" value={form.state} onChange={set("state")}/>
                    <InputField label="PIN Code" placeholder="400001" value={form.pin} onChange={set("pin")} error={errors.pin}/>
                  </div>
                </>
              )}

              {/* STEP 1 — Payment */}
              {step === 1 && (
                <>
                  <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"24px", fontWeight:400, color:"#1a1208", marginBottom:"32px" }}>Payment Method</h2>
                  {/* Method tabs */}
                  <div style={{ display:"flex", gap:"12px", marginBottom:"28px" }}>
                    {[["card","💳 Card"],["upi","₹ UPI"],["netbanking","🏦 Net Banking"]].map(([id, label]) => (
                      <button key={id} onClick={() => setForm({ ...form, payMethod:id })} style={{
                        flex:1, padding:"14px 0", fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"12px",
                        border: form.payMethod===id ? `2px solid ${C.gold}` : "1px solid rgba(201,168,76,0.25)",
                        background: form.payMethod===id ? "rgba(201,168,76,0.06)" : "#fff",
                        color: form.payMethod===id ? C.gold : "#6b5c44", cursor:"pointer", transition:"all 0.2s",
                      }}>{label}</button>
                    ))}
                  </div>
                  {form.payMethod === "card" && (
                    <div style={{ display:"flex", flexDirection:"column", gap:"16px" }}>
                      <InputField label="Card Number" placeholder="1234 5678 9012 3456" value={form.cardNum} onChange={set("cardNum")}/>
                      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"16px" }}>
                        <InputField label="Expiry" placeholder="MM / YY" value={form.expiry} onChange={set("expiry")}/>
                        <InputField label="CVV" placeholder="•••" type="password" value={form.cvv} onChange={set("cvv")}/>
                      </div>
                    </div>
                  )}
                  {form.payMethod === "upi" && (
                    <InputField label="UPI ID" placeholder="yourname@upi" value={form.cardNum} onChange={set("cardNum")}/>
                  )}
                  {form.payMethod === "netbanking" && (
                    <div>
                      <label style={{ display:"block", fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"9.5px", letterSpacing:"0.18em", color:"#6b5c44", marginBottom:"8px" }}>SELECT BANK</label>
                      <select style={{ width:"100%", padding:"13px 16px", border:"1px solid rgba(201,168,76,0.25)", fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"14px", color:"#1a1208", outline:"none", background:"#fff" }}>
                        {["SBI","HDFC Bank","ICICI Bank","Axis Bank","Kotak Bank","Yes Bank"].map(b => <option key={b}>{b}</option>)}
                      </select>
                    </div>
                  )}
                </>
              )}

              {/* STEP 2 — Confirmation */}
              {step === 2 && (
                <div style={{ textAlign:"center", padding:"20px 0" }}>
                  <div style={{ width:"72px", height:"72px", margin:"0 auto 24px", borderRadius:"50%", background:"rgba(122,184,122,0.12)", border:"2px solid rgba(122,184,122,0.4)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"28px" }}>
                    ✓
                  </div>
                  <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"28px", fontWeight:400, color:"#1a1208", marginBottom:"12px" }}>Order Confirmed!</h2>
                  <p style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"15px", color:"#6b5c44", lineHeight:1.7, marginBottom:"10px" }}>
                    Thank you for your purchase. Your order <strong style={{ color:C.gold }}>#MSN-2026-8847</strong> has been placed.
                  </p>
                  <p style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"13px", color:"#b0a08a", marginBottom:"36px" }}>
                    A confirmation has been sent to {form.email || "your email"}.
                    Expected delivery: 3–5 business days.
                  </p>
                  <div style={{ display:"flex", gap:"14px", justifyContent:"center" }}>
                    <button className="m-btn-gold">TRACK ORDER</button>
                    <button className="m-btn-outline-white" style={{ color:"#3a2e1e", borderColor:"rgba(58,46,30,0.4)" }}>CONTINUE SHOPPING</button>
                  </div>
                </div>
              )}

              {/* Navigation buttons */}
              {step < 2 && (
                <div style={{ display:"flex", justifyContent:"space-between", marginTop:"36px", paddingTop:"24px", borderTop:"1px solid rgba(201,168,76,0.12)" }}>
                  {step > 0 ? (
                    <button onClick={() => setStep(s => s-1)} className="m-btn-outline-white" style={{ color:"#3a2e1e", borderColor:"rgba(58,46,30,0.3)" }}>
                      BACK
                    </button>
                  ) : <div/>}
                  <button onClick={handleNext} className="m-btn-gold">
                    {step === 1 ? "PLACE ORDER" : "CONTINUE"}
                  </button>
                </div>
              )}
            </div>

            {/* Order Summary sidebar */}
            <div style={{ background:"#fff", padding:"32px", border:"1px solid rgba(201,168,76,0.12)", position:"sticky", top:"90px" }}>
              <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:"20px", fontWeight:400, color:"#1a1208", marginBottom:"24px" }}>Order Summary</h3>
              {ORDER_ITEMS.map(item => (
                <div key={item.name} style={{ display:"flex", gap:"14px", marginBottom:"18px", alignItems:"center" }}>
                  <div style={{ width:"56px", aspectRatio:"3/4", background:item.grad, flexShrink:0, position:"relative", overflow:"hidden" }}>
                    {item.image && <img src={item.image} alt={item.name} style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover" }} />}
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"14px", color:"#1a1208", marginBottom:"3px" }}>{item.name}</div>
                    <div style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"11px", color:"#b0a08a" }}>Size: {item.size} · Qty: {item.qty}</div>
                  </div>
                  <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"14px", color:"#1a1208" }}>₹{item.price.toLocaleString("en-IN")}</div>
                </div>
              ))}
              <div style={{ height:"1px", background:"linear-gradient(90deg,transparent,rgba(201,168,76,0.2),transparent)", margin:"20px 0" }}/>
              <div style={{ display:"flex", justifyContent:"space-between" }}>
                <span style={{ fontFamily:"'Playfair Display',serif", fontSize:"16px", color:"#1a1208" }}>Total</span>
                <span style={{ fontFamily:"'Playfair Display',serif", fontSize:"20px", color:"#1a1208" }}>₹{total.toLocaleString("en-IN")}</span>
              </div>
              <div style={{ marginTop:"16px", fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"12px", color:"#7ab87a", textAlign:"center" }}>
                🚚 Free Shipping · 🔒 Secure Payment
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
