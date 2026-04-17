import { useState, Fragment } from "react";
import { useNavigate } from "react-router-dom";
import { C } from "../components/shared";
import { useCart } from "../context/CartContext";
import { createOrder, createRazorpayOrder, verifyRazorpayPayment } from "../api/orderApi";

// ── Helper: load Razorpay script on demand ────────────────────────────────────
function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (document.getElementById("razorpay-sdk")) { resolve(true); return; }
    const script = document.createElement("script");
    script.id  = "razorpay-sdk";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload  = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

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

export default function CheckoutPage({ onAuth }) {
  const { cart, clearCart, cartTotal } = useCart();
  const navigate = useNavigate();

  const [step, setStep]         = useState(0);
  const [form, setForm]         = useState({ firstName:"", lastName:"", email:"", phone:"", address:"", city:"", state:"", pin:"" });
  const [errors, setErrors]     = useState({});
  const [placing, setPlacing]   = useState(false);
  const [orderNum, setOrderNum] = useState("");
  const [apiError, setApiError] = useState("");
  const [payMethod, setPayMethod] = useState("card");

  const subtotal       = cartTotal;
  const shippingCharge = subtotal >= 2000 ? 0 : 199;
  const total          = subtotal + shippingCharge;

  const set = key => e => {
    setForm({ ...form, [key]: e.target.value });
    if (errors[key]) setErrors({ ...errors, [key]:"" });
  };

  const validateStep0 = () => {
    const errs = {};
    if (!form.firstName.trim()) errs.firstName = "Required";
    if (!form.email.includes("@")) errs.email = "Valid email required";
    if (!form.phone.match(/^\d{10}$/)) errs.phone = "Valid 10-digit number required";
    if (!form.address.trim()) errs.address = "Required";
    if (!form.city.trim()) errs.city = "Required";
    if (!form.state.trim()) errs.state = "Required";
    if (!form.pin.match(/^\d{6}$/)) errs.pin = "Valid 6-digit PIN required";
    return errs;
  };

  // ── Full Razorpay payment flow ─────────────────────────────────────────────
  const handlePlaceOrder = async () => {
    setApiError("");
    setPlacing(true);
    try {
      // Step 1: load Razorpay JS SDK
      const loaded = await loadRazorpayScript();
      if (!loaded) throw new Error("Failed to load Razorpay SDK. Check your internet connection.");

      // Step 2: create a pending order in MongoDB
      const orderPayload = {
        items: cart.map(i => ({ product: i.id, size: i.size, qty: i.qty })),
        shippingAddress: {
          firstName: form.firstName,
          lastName:  form.lastName,
          email:     form.email,
          phone:     form.phone,
          address:   form.address,
          city:      form.city,
          state:     form.state,
          pincode:   form.pin,
        },
        paymentMethod: "razorpay",
      };
      const { order } = await createOrder(orderPayload);

      // Step 3: get Razorpay order ID from our server
      const rzpData = await createRazorpayOrder(order._id);

      // Step 4: open Razorpay checkout modal and wait for payment
      await new Promise((resolve, reject) => {
        // Map our UI method key to Razorpay's method identifiers
        const rzpMethodMap = { card:"card", upi:"upi", netbanking:"netbanking", wallet:"wallet", emi:"emi" };
        const selectedRzpMethod = rzpMethodMap[payMethod] || "card";

        const options = {
          key:         rzpData.razorpayKeyId,
          amount:      rzpData.amount,
          currency:    rzpData.currency,
          name:        "E-Fashion Maison",
          description: `Order ${rzpData.orderNumber}`,
          order_id:    rzpData.razorpayOrderId,
          prefill: {
            name:    rzpData.customerName,
            email:   rzpData.customerEmail,
            contact: rzpData.customerPhone,
            method:  selectedRzpMethod,
          },
          config: {
            display: {
              blocks: {
                preferred: {
                  name: "Preferred Payment",
                  instruments: [{ method: selectedRzpMethod }],
                },
              },
              sequence: ["block.preferred"],
              preferences: { show_default_blocks: true },
            },
          },
          theme: { color: "#C9A84C" },
          modal: { ondismiss: () => reject(new Error("Payment cancelled by user")) },
          handler: async (response) => {
            try {
              // Step 5: verify HMAC signature on our server
              const result = await verifyRazorpayPayment({
                orderId:             order._id,
                razorpay_order_id:   response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature:  response.razorpay_signature,
              });
              if (result.success) { setOrderNum(result.order.orderNumber); resolve(); }
              else reject(new Error("Payment verification failed"));
            } catch (err) { reject(err); }
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.on("payment.failed", (resp) => reject(new Error(resp.error?.description || "Payment failed")));
        rzp.open();
      });

      clearCart();
      setStep(2);
      window.scrollTo(0, 0);

    } catch (err) {
      if (err.message !== "Payment cancelled by user") {
        const msg = err.response?.data?.message || err.message || "Something went wrong. Please try again.";
        setApiError(msg);
      }
    } finally {
      setPlacing(false);
    }
  };

  const handleNext = () => {
    if (step === 0) {
      const errs = validateStep0();
      if (Object.keys(errs).length) { setErrors(errs); return; }
      setStep(1);
      window.scrollTo(0, 0);
    } else if (step === 1) {
      handlePlaceOrder();
    }
  };

  // If the cart is empty and we're not on the confirmation step, redirect to cart
  if (cart.length === 0 && step !== 2) {
    return (
      <div style={{ paddingTop:"64px", background:"#f5f0eb", minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center" }}>
        <div style={{ textAlign:"center" }}>
          <div style={{ width:"80px", height:"80px", margin:"0 auto 28px", border:"1px solid rgba(201,168,76,0.3)", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={C.gold} strokeWidth="1.5" strokeLinecap="round">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
          </div>
          <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"28px", fontWeight:400, color:"#1a1208", marginBottom:"12px" }}>
            Your bag is empty
          </h2>
          <p style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"14px", color:"#6b5c44", marginBottom:"28px" }}>
            Add items to your bag before checking out
          </p>
          <button className="m-btn-gold" onClick={() => navigate("/shop")}>EXPLORE COLLECTION</button>
        </div>
      </div>
    );
  }

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
            {/* ── Main Panel ─────────────────────────────────────────────── */}
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
                    <InputField label="State" placeholder="Maharashtra" value={form.state} onChange={set("state")} error={errors.state}/>
                    <InputField label="PIN Code" placeholder="400001" value={form.pin} onChange={set("pin")} error={errors.pin}/>
                  </div>
                </>
              )}

              {/* STEP 1 — Payment */}
              {step === 1 && (
                <>
                  <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"24px", fontWeight:400, color:"#1a1208", marginBottom:"8px" }}>Choose Payment Method</h2>
                  <p style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"13px", color:"#6b5c44", marginBottom:"28px", lineHeight:1.6 }}>
                    Select your preferred payment method. You'll be securely redirected to
                    complete the transaction via Razorpay.
                  </p>

                  {/* Payment method cards */}
                  <div style={{ display:"flex", flexDirection:"column", gap:"12px", marginBottom:"28px" }}>
                    {[
                      { key:"card",       icon:"💳", title:"Credit / Debit Card",  desc:"Visa, Mastercard, Rupay & more" },
                      { key:"upi",        icon:"₹",  title:"UPI",                  desc:"Google Pay, PhonePe, Paytm & BHIM" },
                      { key:"netbanking", icon:"🏦", title:"Net Banking",           desc:"All major Indian banks supported" },
                      { key:"wallet",     icon:"👜", title:"Wallets",               desc:"Paytm, Mobikwik, Freecharge & more" },
                      { key:"emi",        icon:"📦", title:"EMI",                   desc:"No-cost & standard EMI on cards" },
                    ].map(m => {
                      const sel = payMethod === m.key;
                      return (
                        <button
                          key={m.key}
                          onClick={() => setPayMethod(m.key)}
                          style={{
                            display:"flex", alignItems:"center", gap:"18px",
                            padding:"18px 22px", cursor:"pointer", textAlign:"left",
                            border: sel ? `2px solid ${C.gold}` : "1px solid rgba(201,168,76,0.2)",
                            background: sel ? "rgba(201,168,76,0.06)" : "#fff",
                            transition:"all 0.25s ease",
                            position:"relative", overflow:"hidden",
                          }}
                          onMouseEnter={e => { if (!sel) e.currentTarget.style.borderColor="rgba(201,168,76,0.5)"; }}
                          onMouseLeave={e => { if (!sel) e.currentTarget.style.borderColor="rgba(201,168,76,0.2)"; }}
                        >
                          {/* Radio indicator */}
                          <div style={{
                            width:"20px", height:"20px", borderRadius:"50%", flexShrink:0,
                            border: sel ? `2px solid ${C.gold}` : "2px solid rgba(201,168,76,0.3)",
                            display:"flex", alignItems:"center", justifyContent:"center",
                            transition:"all 0.2s",
                          }}>
                            {sel && <div style={{ width:"10px", height:"10px", borderRadius:"50%", background:C.gold }} />}
                          </div>
                          {/* Icon */}
                          <div style={{
                            width:"44px", height:"44px", display:"flex", alignItems:"center", justifyContent:"center",
                            fontSize:"22px", flexShrink:0,
                            background: sel ? "rgba(201,168,76,0.12)" : "rgba(201,168,76,0.05)",
                            borderRadius:"8px", transition:"background 0.2s",
                          }}>
                            {m.icon}
                          </div>
                          {/* Text */}
                          <div style={{ flex:1 }}>
                            <div style={{
                              fontFamily:"'Playfair Display',serif", fontSize:"15px",
                              color: sel ? "#1a1208" : "#3a2e1e", fontWeight: sel ? 500 : 400,
                              marginBottom:"3px", transition:"color 0.2s",
                            }}>
                              {m.title}
                            </div>
                            <div style={{
                              fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"12px",
                              color:"#b0a08a", letterSpacing:"0.02em",
                            }}>
                              {m.desc}
                            </div>
                          </div>
                          {/* Selected tick */}
                          {sel && (
                            <div style={{
                              fontFamily:"'Playfair Display',serif", fontSize:"14px",
                              color:C.gold, fontWeight:600,
                            }}>✓</div>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Security footer */}
                  <div style={{
                    display:"flex", alignItems:"center", gap:"14px",
                    padding:"16px 20px", background:"rgba(201,168,76,0.04)",
                    border:"1px solid rgba(201,168,76,0.12)",
                  }}>
                    <div style={{ fontSize:"20px" }}>🔒</div>
                    <div>
                      <div style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"11px", letterSpacing:"0.14em", color:"#6b5c44", marginBottom:"2px" }}>
                        SECURED BY RAZORPAY
                      </div>
                      <div style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"11px", color:"#b0a08a" }}>
                        256-bit SSL encryption · PCI DSS compliant · RBI regulated
                      </div>
                    </div>
                  </div>

                  {apiError && (
                    <div style={{ marginTop:"20px", padding:"12px 16px", background:"rgba(220,100,100,0.06)", border:"1px solid rgba(220,100,100,0.3)", fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"13px", color:"#c0504d" }}>
                      ⚠ {apiError}
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
                    Thank you for your purchase. Your order <strong style={{ color:C.gold }}>#{orderNum || "MSN-2026-XXXX"}</strong> has been placed and payment received.
                  </p>
                  <p style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"13px", color:"#b0a08a", marginBottom:"36px" }}>
                    A confirmation has been sent to {form.email || "your email"}.
                    Expected delivery: 3–5 business days.
                  </p>
                  <div style={{ display:"flex", gap:"14px", justifyContent:"center" }}>
                    <button className="m-btn-gold">TRACK ORDER</button>
                    <button className="m-btn-outline-white" style={{ color:"#3a2e1e", borderColor:"rgba(58,46,30,0.4)" }} onClick={() => navigate("/shop")}>CONTINUE SHOPPING</button>
                  </div>
                </div>
              )}

              {/* Navigation */}
              {step < 2 && (
                <div style={{ display:"flex", justifyContent:"space-between", marginTop:"36px", paddingTop:"24px", borderTop:"1px solid rgba(201,168,76,0.12)" }}>
                  {step > 0 ? (
                    <button onClick={() => { setStep(s => s-1); setApiError(""); }} className="m-btn-outline-white" style={{ color:"#3a2e1e", borderColor:"rgba(58,46,30,0.3)" }}>
                      BACK
                    </button>
                  ) : <div/>}
                  <button onClick={handleNext} className="m-btn-gold" disabled={placing} style={{ opacity:placing ? 0.7 : 1, cursor:placing ? "not-allowed" : "pointer" }}>
                    {placing ? "PROCESSING…" : step === 1 ? "PAY NOW" : "CONTINUE"}
                  </button>
                </div>
              )}
            </div>

            {/* ── Order Summary sidebar ──────────────────────────────────── */}
            <div style={{ background:"#fff", padding:"32px", border:"1px solid rgba(201,168,76,0.12)", position:"sticky", top:"90px" }}>
              <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:"20px", fontWeight:400, color:"#1a1208", marginBottom:"24px" }}>Order Summary</h3>
              {cart.map(item => (
                <div key={`${item.id}-${item.size}`} style={{ display:"flex", gap:"14px", marginBottom:"18px", alignItems:"center" }}>
                  <div style={{ width:"56px", aspectRatio:"3/4", background:item.grad, flexShrink:0, position:"relative", overflow:"hidden" }}>
                    {item.image && <img src={item.image} alt={item.name} style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover" }} />}
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"14px", color:"#1a1208", marginBottom:"3px" }}>{item.name}</div>
                    <div style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"11px", color:"#b0a08a" }}>Size: {item.size} · Qty: {item.qty}</div>
                  </div>
                  <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"14px", color:"#1a1208" }}>₹{(item.price * item.qty).toLocaleString("en-IN")}</div>
                </div>
              ))}

              {cart.length === 0 && step === 2 && (
                <div style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"13px", color:"#6b5c44", fontStyle:"italic", padding:"12px 0" }}>
                  Order completed successfully
                </div>
              )}

              <div style={{ height:"1px", background:"linear-gradient(90deg,transparent,rgba(201,168,76,0.2),transparent)", margin:"20px 0" }}/>

              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"8px" }}>
                <span style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"13px", color:"#6b5c44" }}>Subtotal</span>
                <span style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"13px", color:"#1a1208" }}>₹{subtotal.toLocaleString("en-IN")}</span>
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"16px" }}>
                <span style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"13px", color:"#6b5c44" }}>Shipping</span>
                <span style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"13px", color:shippingCharge === 0 ? "#7ab87a" : "#1a1208" }}>
                  {shippingCharge === 0 ? "FREE" : `₹${shippingCharge}`}
                </span>
              </div>

              <div style={{ height:"1px", background:"rgba(201,168,76,0.12)", margin:"0 0 16px" }}/>
              <div style={{ display:"flex", justifyContent:"space-between" }}>
                <span style={{ fontFamily:"'Playfair Display',serif", fontSize:"16px", color:"#1a1208" }}>Total</span>
                <span style={{ fontFamily:"'Playfair Display',serif", fontSize:"20px", color:"#1a1208" }}>₹{total.toLocaleString("en-IN")}</span>
              </div>

              <div style={{ marginTop:"16px", fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"12px", color:"#7ab87a", textAlign:"center" }}>
                🚚 Free Shipping on orders ₹2000+ · 🔒 Razorpay Secured
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
