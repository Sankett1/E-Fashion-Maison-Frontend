import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "./shared";

// ── Hero-only keyframes (h* prefix avoids conflict with shared.jsx) ───────────
const HERO_CSS = `
  @keyframes hFadeUp  { from{opacity:0;transform:translateY(35px)} to{opacity:1;transform:translateY(0)} }
  @keyframes hFadeIn  { from{opacity:0} to{opacity:1} }
  @keyframes hScaleX  { from{transform:scaleX(0)} to{transform:scaleX(1)} }
  @keyframes hPulse   { 0%,100%{opacity:1} 50%{opacity:0.4} }

  .prod-1{background:linear-gradient(160deg,#e8e8e8 0%,#c8c8d0 50%,#a8a8b8 100%);}
  .prod-2{background:linear-gradient(160deg,#c8b080 0%,#a89060 50%,#806840 100%);}
  .prod-3{background:linear-gradient(160deg,#6b4c36 0%,#4a321e 50%,#2e1e0e 100%);}
  .prod-4{background:linear-gradient(160deg,#f0ebe0 0%,#e0d8c8 50%,#c8bca8 100%);}
  .col-card-1{background:linear-gradient(135deg,#8b6a42 0%,#5c4022 40%,#3d2810 100%);}
  .col-card-2{background:linear-gradient(135deg,#2a2a2a 0%,#1a1a1a 50%,#0d0d0d 100%);}
  .col-card-3{background:linear-gradient(135deg,#d4c4a8 0%,#c8b090 50%,#b89870 100%);}
`;

// ── Scroll-reveal via IntersectionObserver ────────────────────────────────────
function useScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".m-reveal, .m-reveal-left, .m-reveal-right");
    if (!els.length) return;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add("visible"); obs.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -60px 0px" });
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);
}

// ── Animated counters ─────────────────────────────────────────────────────────
function useCounterReveal() {
  useEffect(() => {
    const counters = [
      { id: "hStat1", target: 12,  suffix: "+" },
      { id: "hStat2", target: 50,  suffix: "K+" },
      { id: "hStat3", target: 200, suffix: "+" },
      { id: "hStat4", target: 100, suffix: "%" },
    ];
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        const el = e.target;
        const found = counters.find(c => c.id === el.id);
        if (!found) return;
        const { target, suffix } = found;
        const t0 = performance.now();
        const dur = 1800;
        const tick = (now) => {
          const p = Math.min((now - t0) / dur, 1);
          const v = Math.round((1 - Math.pow(1 - p, 3)) * target);
          el.textContent = v + suffix;
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        obs.unobserve(el);
      });
    }, { threshold: 0.5 });
    counters.forEach(({ id }) => { const el = document.getElementById(id); if (el) obs.observe(el); });
    return () => obs.disconnect();
  }, []);
}

// ── Inline SVG icons ──────────────────────────────────────────────────────────
const ArrowUpRight = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M7 17L17 7M7 7h10v10"/>
  </svg>
);
const HeartIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);

// ── Section header shared layout ──────────────────────────────────────────────
function SectionHeader({ title, sub }) {
  return (
    <div className="m-reveal" style={{ textAlign:"center", marginBottom:"56px" }}>
      <div style={{ width:"48px", height:"1px", margin:"0 auto 20px", background:"linear-gradient(90deg,transparent,#c9a84c,transparent)" }}/>
      <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(36px,4.5vw,54px)", fontWeight:500, color:"#1a1208", margin:"0 0 14px", lineHeight:1.1 }}>{title}</h2>
      <p style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"9.5px", letterSpacing:"0.3em", color:"#6b5c44", fontWeight:300 }}>{sub}</p>
    </div>
  );
}

// ── Footer column ─────────────────────────────────────────────────────────────
function FooterCol({ title, links }) {
  return (
    <div>
      <div style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"9.5px", letterSpacing:"0.25em", fontWeight:500, color:"#3a2e1e", marginBottom:"20px" }}>{title}</div>
      {links.map(l => <a key={l} className="m-footer-link">{l}</a>)}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN EXPORT
// ─────────────────────────────────────────────────────────────────────────────
export default function HeroPage({ onAuth }) {
  const navigate = useNavigate();
  const heroContentRef = useRef(null);
  const heroBeamRef    = useRef(null);
  const [email, setEmail]       = useState("");
  const [subState, setSubState] = useState("idle");

  useScrollReveal();
  useCounterReveal();

  // Parallax on hero scroll
  useEffect(() => {
    const fn = () => {
      const y = window.scrollY;
      if (y < window.innerHeight) {
        if (heroContentRef.current) heroContentRef.current.style.transform = `translateY(${y * 0.22}px)`;
        if (heroBeamRef.current)    heroBeamRef.current.style.transform    = `rotate(-10deg) translateY(${y * 0.1}px)`;
      }
    };
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const handleSubscribe = () => {
    if (!email.includes("@")) return;
    setSubState("success");
    setEmail("");
    setTimeout(() => setSubState("idle"), 3000);
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: HERO_CSS }}/>

      {/* ════════════════════════════════════════════
          HERO
      ════════════════════════════════════════════ */}
      <section id="hero" style={{
        position:"relative", minHeight:"100vh", overflow:"hidden",
        display:"flex", alignItems:"center",
        background:"linear-gradient(128deg,#cba96e 0%,#b89050 22%,#9f7538 48%,#8a6228 70%,#74501a 100%)",
      }}>
        {/* Overlays */}
        <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse 65% 75% at 72% 38%,rgba(255,225,150,0.1) 0%,transparent 65%)",pointerEvents:"none"}}/>
        <div style={{position:"absolute",inset:0,background:"linear-gradient(to right,rgba(12,7,0,0.52) 0%,rgba(12,7,0,0.08) 48%,transparent 100%)",pointerEvents:"none"}}/>
        <div style={{position:"absolute",bottom:0,left:0,right:0,height:"30%",background:"linear-gradient(to top,rgba(8,5,0,0.5) 0%,transparent 100%)",pointerEvents:"none"}}/>

        {/* Diagonal beam */}
        <div ref={heroBeamRef} style={{position:"absolute",top:0,right:"30%",width:"1.5px",height:"68%",background:"linear-gradient(to bottom,rgba(255,238,185,0.22) 0%,transparent 100%)",transform:"rotate(-10deg)",transformOrigin:"top center",pointerEvents:"none"}}/>

        {/* Right panel — SVG fashion silhouette */}
        <div style={{position:"absolute",right:0,top:0,bottom:0,width:"55%",overflow:"hidden",pointerEvents:"none"}}>
          <div style={{position:"absolute",inset:0,background:"linear-gradient(to left,rgba(165,115,42,0.1) 0%,transparent 55%)"}}/>
          <svg style={{position:"absolute",bottom:0,right:"9%",height:"90%",animation:"hFadeIn 1.4s ease 0.8s both"}} viewBox="0 0 280 700" preserveAspectRatio="xMidYMax meet">
            <defs>
              <linearGradient id="hbG" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%"   stopColor="#1e160e" stopOpacity=".9"/>
                <stop offset="55%"  stopColor="#100a04" stopOpacity="1"/>
                <stop offset="100%" stopColor="#1e160e" stopOpacity=".85"/>
              </linearGradient>
              <linearGradient id="hsG" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%"   stopColor="rgba(201,168,76,0)"/>
                <stop offset="50%"  stopColor="rgba(201,168,76,0.1)"/>
                <stop offset="100%" stopColor="rgba(201,168,76,0)"/>
              </linearGradient>
              <radialGradient id="hsdG" cx="50%" cy="100%" r="50%">
                <stop offset="0%"   stopColor="rgba(0,0,0,.45)"/>
                <stop offset="100%" stopColor="rgba(0,0,0,0)"/>
              </radialGradient>
              <filter id="hsf"><feGaussianBlur stdDeviation="2"/></filter>
            </defs>
            <ellipse cx="140" cy="694" rx="70" ry="7" fill="url(#hsdG)" filter="url(#hsf)"/>
            <ellipse cx="140" cy="36"  rx="30" ry="34" fill="#2e2210"/>
            <path d="M110 22Q140 6 170 22Q178 44 172 58Q155 38 140 30Q125 38 108 58Q102 44 110 22Z" fill="#a08860" opacity=".72"/>
            <path d="M92 72Q97 58 140 52Q183 58 188 72L206 230Q202 275 199 320L214 472Q218 552 213 632L202 700H78L67 632Q62 552 66 472L81 320Q78 275 74 230Z" fill="url(#hbG)"/>
            <path d="M92 82Q140 70 188 82L199 290Q160 273 81 290Z" fill="url(#hsG)"/>
            <path d="M140 90L116 188L130 224L140 202L150 224L164 188Z" fill="#100a04" opacity=".85"/>
            <path d="M125 70Q140 60 155 70L160 95Q140 80 120 95Z" fill="#1a1208" opacity=".9"/>
            <rect x="86" y="302" width="108" height="5" rx="1" fill="#c9a84c" opacity=".18"/>
            <path d="M92 108Q68 168 63 270Q71 282 80 276Q85 184 100 120Z" fill="#100a04" opacity=".88"/>
            <path d="M188 108Q212 165 217 268Q209 280 200 274Q196 182 180 120Z" fill="#100a04" opacity=".88"/>
            <path d="M200 268Q215 273 218 292Q207 302 197 291Z" fill="#1a1208" opacity=".8"/>
          </svg>
          <div style={{position:"absolute",top:"5%",right:"22%",width:"1.5px",height:"68%",background:"linear-gradient(to bottom,rgba(255,240,185,0.2) 0%,transparent 100%)",transform:"rotate(-10deg)",transformOrigin:"top center"}}/>
        </div>

        {/* Hero text */}
        <div ref={heroContentRef} style={{position:"relative",zIndex:10,paddingLeft:"clamp(32px,6vw,88px)",paddingTop:"80px",maxWidth:"580px"}}>
          <div style={{width:"72px",height:"1px",marginBottom:"38px",background:"linear-gradient(90deg,transparent,#c9a84c,transparent)",animation:"hScaleX 0.8s ease 0.4s both",transformOrigin:"left"}}/>
          <div style={{overflow:"hidden"}}>
            <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:"clamp(52px,8.5vw,98px)",fontWeight:400,color:"#fff",margin:0,lineHeight:1,textShadow:"0 2px 50px rgba(0,0,0,0.18)",animation:"hFadeUp 1s cubic-bezier(0.4,0,0.2,1) 0.55s forwards",opacity:0}}>Spring</h1>
          </div>
          <div style={{overflow:"hidden"}}>
            <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:"clamp(52px,8.5vw,98px)",fontStyle:"italic",fontWeight:400,color:"#fff",margin:0,lineHeight:1.05,textShadow:"0 2px 50px rgba(0,0,0,0.18)",animation:"hFadeUp 1s cubic-bezier(0.4,0,0.2,1) 0.72s forwards",opacity:0}}>Collection</h1>
          </div>
          <div style={{overflow:"hidden"}}>
            <p style={{fontFamily:"'Playfair Display',serif",fontSize:"clamp(60px,10vw,118px)",fontWeight:400,color:"#fff",margin:"4px 0 20px",lineHeight:1,textShadow:"0 4px 60px rgba(0,0,0,0.15)",animation:"hFadeUp 1s cubic-bezier(0.4,0,0.2,1) 0.88s forwards",opacity:0}}>2026</p>
          </div>
          <p style={{fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:"9.5px",letterSpacing:"0.35em",color:"rgba(255,255,255,0.65)",fontWeight:300,lineHeight:2.2,marginBottom:"44px",animation:"hFadeUp 0.8s ease 1.1s forwards",opacity:0}}>
            REDEFINING ELEGANCE THROUGH<br/>MODERN SILHOUETTES
          </p>
          <div style={{display:"flex",gap:"14px",flexWrap:"wrap",animation:"hFadeUp 0.7s ease 1.3s forwards",opacity:0}}>
            <button className="m-btn-gold"          onClick={() => navigate("/shop")}>EXPLORE NOW</button>
            <button className="m-btn-outline-white" onClick={() => navigate("/about")}>VIEW LOOKBOOK</button>
          </div>
        </div>

        {/* Scroll indicator */}
        <div style={{position:"absolute",bottom:"32px",left:"50%",transform:"translateX(-50%)",display:"flex",flexDirection:"column",alignItems:"center",gap:"8px",animation:"hFadeIn 0.6s ease 2.2s forwards",opacity:0}}>
          <span style={{fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:"8px",letterSpacing:"0.3em",color:"rgba(255,255,255,0.38)"}}>SCROLL</span>
          <div style={{width:"1px",height:"38px",background:"linear-gradient(to bottom,rgba(201,168,76,0.65),transparent)",animation:"hPulse 2s ease infinite"}}/>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          FEATURES BAR
      ════════════════════════════════════════════ */}
      <section style={{background:"#ede5d6",borderBottom:"1px solid rgba(201,168,76,0.2)",borderTop:"1px solid rgba(201,168,76,0.2)",padding:"36px 48px"}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:"24px",maxWidth:"1300px",margin:"0 auto"}}>
          {[
            { icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>,     title:"FREE SHIPPING",    sub:"On orders above ₹2,000", d:"m-d1" },
            { icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>,                                                                                           title:"EASY RETURNS",     sub:"30-day return policy",   d:"m-d2" },
            { icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,                                                                                                                          title:"SECURE PAYMENT",   sub:"Razorpay protected",     d:"m-d3" },
            { icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>,         title:"24/7 SUPPORT",     sub:"Dedicated care team",   d:"m-d4" },
            { icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,                                                                                   title:"EMI AVAILABLE",    sub:"No-cost EMI options",    d:"m-d5" },
            { icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>,                                       title:"PREMIUM PACKAGING", sub:"Gift-ready unboxing",   d:"m-d6" },
          ].map(({ icon, title, sub, d }) => (
            <div key={title} className={`m-feat-item m-reveal ${d}`} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:"12px",textAlign:"center"}}>
              <div className="m-feat-icon" style={{width:"52px",height:"52px",borderRadius:"50%",border:"1px solid rgba(201,168,76,0.35)",display:"flex",alignItems:"center",justifyContent:"center",color:"#c9a84c",background:"rgba(201,168,76,0.06)"}}>
                {icon}
              </div>
              <div>
                <div style={{fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:"10px",letterSpacing:"0.2em",fontWeight:500,color:"#3a2e1e"}}>{title}</div>
                <div style={{fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:"11px",color:"#6b5c44",fontWeight:300,lineHeight:1.5}}>{sub}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════════
          CURATED COLLECTIONS
      ════════════════════════════════════════════ */}
      <section style={{background:"#f5f0eb",padding:"90px 48px"}}>
        <SectionHeader title="Curated Collections" sub="DISCOVER WHAT DEFINES YOU"/>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"20px",maxWidth:"1300px",margin:"0 auto"}}>
          {[
            { cls:"col-card-1", eye:"SHARP & REFINED",  name:"Tailoring",   rev:"m-reveal-left",  d:"",  image:"https://images.unsplash.com/photo-1594938298870-5100bf2e3c8c?w=800&q=80&fit=crop" },
            { cls:"col-card-2", eye:"EFFORTLESS STYLE", name:"Casual Luxe", rev:"m-reveal",        d:"m-d2", image:"https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&q=80&fit=crop" },
            { cls:"col-card-3", eye:"FINAL TOUCHES",    name:"Accessories", rev:"m-reveal-right",  d:"",  image:"https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80&fit=crop" },
          ].map(({ cls, eye, name, rev, d, image }) => (
            <div key={name} className={`m-col-card ${rev} ${d}`} style={{position:"relative",overflow:"hidden",cursor:"pointer",aspectRatio:"3/4"}}>
              <div className={`m-col-bg ${cls}`} style={{position:"absolute",inset:0}}/>
              {image && <img src={image} alt={name} style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover"}} />}
              <div style={{position:"absolute",inset:0,background:"linear-gradient(to top,rgba(12,7,0,0.75) 0%,rgba(12,7,0,0.1) 50%,transparent 100%)"}}/>
              <div style={{position:"absolute",bottom:"28px",left:"28px",right:"28px"}}>
                <span style={{fontSize:"8.5px",letterSpacing:"0.28em",color:"rgba(255,255,255,0.6)",fontFamily:"'Cormorant Garamond',Georgia,serif",display:"block",marginBottom:"6px"}}>{eye}</span>
                <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:"28px",fontWeight:500,color:"#fff",margin:0,textShadow:"0 2px 20px rgba(0,0,0,0.3)"}}>{name}</h3>
              </div>
              <div className="m-col-arrow" style={{position:"absolute",top:"28px",right:"28px",width:"36px",height:"36px",border:"1px solid rgba(255,255,255,0.3)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff"}}>
                <ArrowUpRight/>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════════
          TRENDING NOW
      ════════════════════════════════════════════ */}
      <section style={{background:"#eee9e2",padding:"90px 48px"}}>
        <SectionHeader title="Trending Now" sub="MOST COVETED PIECES THIS SEASON"/>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"20px",maxWidth:"1300px",margin:"0 auto"}}>
          {[
            { cls:"prod-1", type:"MEN · FORMALWEAR",       name:"Navy Pinstripe Blazer", price:"₹18,500", d:"m-d1", image:"https://images.unsplash.com/photo-1594938298870-5100bf2e3c8c?w=600&q=80&fit=crop" },
            { cls:"prod-2", type:"WOMEN · OUTERWEAR",      name:"Belted Trench Coat",    price:"₹24,900", d:"m-d2", image:"https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&q=80&fit=crop" },
            { cls:"prod-3", type:"ACCESSORIES · FOOTWEAR", name:"Chelsea Leather Boots", price:"₹12,750", d:"m-d3", image:"https://images.unsplash.com/photo-1638247025967-51873b8a5a6b?w=600&q=80&fit=crop" },
            { cls:"prod-4", type:"WOMEN · TOPS",           name:"Silk Satin Blouse",     price:"₹8,200",  d:"m-d4", image:"https://images.unsplash.com/photo-1485968579580-ee2a6b1e450f?w=600&q=80&fit=crop" },
          ].map(({ cls, type, name, price, d, image }) => (
            <div key={name} className={`m-prod-card m-reveal ${d}`} style={{cursor:"pointer"}}>
              <div style={{position:"relative",overflow:"hidden",aspectRatio:"3/4",marginBottom:"16px"}}>
                <div className={`m-prod-bg ${cls}`} style={{position:"absolute",inset:0}}/>
                {image && <img src={image} alt={name} style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",transition:"transform 0.5s ease"}} className="m-prod-img" />}
                <button className="m-quick-add" style={{position:"absolute",bottom:0,left:0,right:0,padding:"14px",textAlign:"center",fontSize:"9.5px",letterSpacing:"0.2em",background:"#1a1208",color:"#fff",border:"none",width:"100%",fontFamily:"'Cormorant Garamond',Georgia,serif",cursor:"pointer"}}>QUICK ADD</button>
                <button className="m-wishlist"   style={{position:"absolute",top:"14px",right:"14px",width:"32px",height:"32px",background:"rgba(255,255,255,0.9)",display:"flex",alignItems:"center",justifyContent:"center",border:"none",cursor:"pointer",color:"#3a2e1e"}}><HeartIcon/></button>
              </div>
              <div style={{fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:"10px",letterSpacing:"0.14em",color:"#6b5c44",fontWeight:300,marginBottom:"4px"}}>{type}</div>
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:"16px",fontWeight:400,color:"#1a1208",marginBottom:"6px"}}>{name}</div>
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:"16px",color:"#3a2e1e",fontWeight:400}}>{price}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════════
          CRAFTED IN INDIA
      ════════════════════════════════════════════ */}
      <section style={{background:"#1a1208",padding:"100px 48px",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:"50%",right:"-2%",transform:"translateY(-50%)",fontFamily:"'Playfair Display',serif",fontSize:"clamp(80px,14vw,180px)",fontWeight:700,color:"rgba(255,255,255,0.025)",lineHeight:1,userSelect:"none",pointerEvents:"none",whiteSpace:"nowrap"}}>INDIA</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"80px",alignItems:"center",maxWidth:"1300px",margin:"0 auto"}}>
          <div className="m-reveal-left">
            <div style={{width:"64px",height:"1px",marginBottom:"32px",background:"linear-gradient(90deg,transparent,#c9a84c,transparent)"}}/>
            <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:"clamp(32px,4vw,50px)",fontWeight:500,color:"#fff",marginBottom:"28px",lineHeight:1.15}}>
              Crafted in India,<br/><em style={{fontStyle:"italic",color:"#e8c96e"}}>Made for the World</em>
            </h2>
            <p style={{fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:"15px",lineHeight:1.85,color:"rgba(255,255,255,0.55)",fontWeight:300,marginBottom:"20px"}}>
              MAISON was born from a belief that Indian luxury deserves a global stage. We source only the finest fabrics — Mysore silk, Rajasthani wool, Kanjeevaram weaves — and transform them through precise, modern tailoring.
            </p>
            <p style={{fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:"15px",lineHeight:1.85,color:"rgba(255,255,255,0.55)",fontWeight:300,marginBottom:"20px"}}>
              Every piece is designed in our Mumbai atelier, crafted by master artisans with decades of expertise, and delivered with the care that a luxury garment deserves.
            </p>
            <button className="m-btn-outline-light" onClick={() => navigate("/about")}>OUR STORY</button>
          </div>
          <div className="m-reveal-right" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"20px"}}>
            {[
              { id:"hStat1", init:"12+",  label:"YEARS OF CRAFT"  },
              { id:"hStat2", init:"50K+", label:"HAPPY CLIENTS"   },
              { id:"hStat3", init:"200+", label:"STYLES CURATED"  },
              { id:"hStat4", init:"100%", label:"ARTISAN MADE"    },
            ].map(({ id, init, label }) => (
              <div key={id} className="m-stat-card">
                <div id={id} className="m-shimmer-text" style={{fontFamily:"'Playfair Display',serif",fontSize:"clamp(32px,4vw,52px)",fontWeight:500,lineHeight:1,marginBottom:"10px"}}>{init}</div>
                <div style={{fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:"8.5px",letterSpacing:"0.22em",color:"rgba(255,255,255,0.35)",fontWeight:300}}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          TESTIMONIALS
      ════════════════════════════════════════════ */}
      <section style={{background:"#f5f0eb",padding:"90px 48px"}}>
        <SectionHeader title="What Our Clients Say" sub="STORIES FROM THE MAISON COMMUNITY"/>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"18px",maxWidth:"1300px",margin:"0 auto"}}>
          {[
            { text:"The quality of the Silk Satin Blouse is absolutely stunning. It feels luxurious and the fit is perfect. MAISON has become my go-to for premium fashion.",                name:"Priya Mehta",      loc:"MUMBAI, MAHARASHTRA",   purchase:"SILK SATIN BLOUSE",      d:"m-d1" },
            { text:"Bought the Structured Wool Blazer for a board meeting — received so many compliments! The craftsmanship is on par with international luxury brands.",                   name:"Arjun Kapoor",     loc:"DELHI, NCR",             purchase:"STRUCTURED WOOL BLAZER", d:"m-d2" },
            { text:"Delivery was surprisingly fast and the packaging was beautiful — felt like receiving a gift. The Chelsea Boots are worth every rupee.",                                 name:"Kavya Reddy",      loc:"HYDERABAD, TELANGANA",   purchase:"CHELSEA LEATHER BOOTS",  d:"m-d3" },
            { text:"Finally a brand that understands Indian aesthetics with a global sensibility. The Trench Coat drapes beautifully. Will definitely be ordering again.",                  name:"Rohan Singhania",  loc:"BENGALURU, KARNATAKA",   purchase:"BELTED TRENCH COAT",     d:"m-d4" },
          ].map(({ text, name, loc, purchase, d }) => (
            <div key={name} className={`m-test-card m-reveal ${d}`} style={{background:"#fff",padding:"32px 28px",border:"1px solid rgba(201,168,76,0.12)",position:"relative",overflow:"hidden"}}>
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:"42px",fontWeight:400,lineHeight:1,color:"#c9a84c",marginBottom:"18px",opacity:0.7}}>"</div>
              <p style={{fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:"13.5px",lineHeight:1.75,color:"#3a2e1e",fontWeight:300,marginBottom:"20px",fontStyle:"italic"}}>"{text}"</p>
              <div style={{width:"32px",height:"1px",marginBottom:"16px",background:"#c9a84c",opacity:0.5}}/>
              <div style={{display:"flex",gap:"3px",marginBottom:"12px"}}>{"★★★★★".split("").map((s,i) => <span key={i} style={{color:"#c9a84c",fontSize:"12px"}}>{s}</span>)}</div>
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:"15px",fontWeight:500,color:"#1a1208",marginBottom:"3px"}}>{name}</div>
              <div style={{fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:"8.5px",letterSpacing:"0.18em",color:"#6b5c44",marginBottom:"8px"}}>{loc}</div>
              <div style={{fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:"8.5px",letterSpacing:"0.14em",color:"#c9a84c"}}>PURCHASED: {purchase}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════════
          NEWSLETTER
      ════════════════════════════════════════════ */}
      <section style={{background:"#1a1208",padding:"100px 48px",textAlign:"center",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse 60% 50% at 50% 50%,rgba(201,168,76,0.06) 0%,transparent 65%)",pointerEvents:"none"}}/>
        <div style={{position:"relative",zIndex:1}}>
          <div className="m-reveal" style={{width:"48px",height:"1px",margin:"0 auto",background:"linear-gradient(90deg,transparent,rgba(201,168,76,0.5),transparent)"}}/>
          <div style={{height:"20px"}}/>
          <h2 className="m-reveal" style={{fontFamily:"'Playfair Display',serif",fontSize:"clamp(32px,4.5vw,52px)",fontWeight:500,color:"#fff",marginBottom:"14px",lineHeight:1.15}}>
            Stay in the <em style={{fontStyle:"italic",color:"#e8c96e"}}>Know</em>
          </h2>
          <p className="m-reveal m-d1" style={{fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:"9.5px",letterSpacing:"0.28em",color:"rgba(255,255,255,0.38)",marginBottom:"44px"}}>
            EXCLUSIVE ACCESS TO NEW ARRIVALS &amp; PRIVATE SALES
          </p>
          <div className="m-reveal m-d2" style={{display:"flex",maxWidth:"520px",margin:"0 auto"}}>
            <input
              className="m-newsletter-input"
              type="email"
              placeholder="Your email address"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSubscribe()}
            />
            <button
              className="m-newsletter-btn"
              onClick={handleSubscribe}
              style={subState === "success" ? {background:"#7ab87a",color:"#fff"} : {}}
            >
              {subState === "success" ? "✓  SUBSCRIBED" : <><span>SUBSCRIBE</span><ArrowRight/></>}
            </button>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          FOOTER
      ════════════════════════════════════════════ */}
      <footer style={{background:"#f5f0eb",padding:"72px 48px 40px"}}>
        <div style={{display:"grid",gridTemplateColumns:"1.6fr 1fr 1fr 1fr",gap:"48px",maxWidth:"1300px",margin:"0 auto 56px"}}>
          {/* Brand col */}
          <div>
            <div style={{fontFamily:"'Playfair Display',serif",fontSize:"20px",letterSpacing:"0.35em",fontWeight:600,color:"#1a1208",marginBottom:"16px"}}>MAISON</div>
            <p style={{fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:"14px",lineHeight:1.7,color:"#6b5c44",fontWeight:300,marginBottom:"24px"}}>
              Redefining modern luxury through timeless design and exceptional Indian craftsmanship.
            </p>
            {[
              { icon:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>, text:"MAISON Atelier, BKC, Mumbai 400051" },
              { icon:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.12 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.63a16 16 0 0 0 6 6l.92-.92a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 16z"/></svg>, text:"+91 98765 43210" },
              { icon:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>, text:"hello@maison.in" },
            ].map(({ icon, text }) => (
              <div key={text} style={{display:"flex",alignItems:"flex-start",gap:"10px",fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:"13px",color:"#6b5c44",marginBottom:"10px",fontWeight:300}}>
                <span style={{color:"#c9a84c",flexShrink:0,marginTop:"2px"}}>{icon}</span>{text}
              </div>
            ))}
          </div>
          <FooterCol title="SHOP"    links={["New Arrivals","Women","Men","Accessories","Sale"]}/>
          <FooterCol title="HELP"    links={["Contact Us","Shipping Policy","Returns & Exchanges","Size Guide","FAQ","Track Order"]}/>
          <FooterCol title="COMPANY" links={["About Us","Careers","Press & Media","Sustainability","Craftsmanship"]}/>
        </div>

        <hr style={{border:"none",borderTop:"1px solid rgba(201,168,76,0.18)",maxWidth:"1300px",margin:"0 auto 32px"}}/>

        <div style={{maxWidth:"1300px",margin:"0 auto",display:"flex",flexDirection:"column",gap:"20px"}}>
          <div>
            <div style={{fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:"8.5px",letterSpacing:"0.25em",color:"#6b5c44",marginBottom:"12px"}}>SECURE PAYMENT METHODS</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:"8px"}}>
              {["Razorpay","UPI","Net Banking","Visa","Mastercard","RuPay","EMI","PayTM","PhonePe","Google Pay"].map(p => (
                <span key={p} className="m-pay-badge">{p}</span>
              ))}
            </div>
          </div>
          <div style={{fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:"11px",color:"rgba(26,18,8,0.35)",letterSpacing:"0.1em",textAlign:"right"}}>
            © 2026 MAISON. All rights reserved.
          </div>
        </div>
      </footer>
    </>
  );
}