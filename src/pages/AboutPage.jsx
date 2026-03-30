import { useEffect } from "react";
import { C } from "../components/shared";

const TEAM = [
  { name:"Aarav Shah", title:"Founder & Creative Director", grad:"linear-gradient(160deg,#c8b080 0%,#8a6228 100%)" },
  { name:"Meera Pillai", title:"Head of Design", grad:"linear-gradient(160deg,#e8e0d0 0%,#c0a880 100%)" },
  { name:"Rahul Desai", title:"Master Tailor", grad:"linear-gradient(160deg,#6b4c36 0%,#2e1e0e 100%)" },
];

const VALUES = [
  { icon:"🧵", title:"Artisan First", text:"Every garment is conceived in close collaboration with Indian master craftspeople, ensuring techniques developed over generations continue to thrive." },
  { icon:"🌿", title:"Responsible Craft", text:"We partner exclusively with GOTS-certified farms and use low-impact dyes. Our packaging is 100% compostable, and we offset every shipment." },
  { icon:"♾️", title:"Timeless by Design", text:"We design against trends. Each MAISON piece is built to outlast seasons — in quality, construction, and aesthetic relevance." },
];

export default function AboutPage({ onAuth }) {
  useEffect(() => {
    window.scrollTo(0, 0);
    const els = document.querySelectorAll(".m-reveal, .m-reveal-left, .m-reveal-right");
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("visible"); obs.unobserve(e.target); } });
    }, { threshold: 0.1 });
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <>
      <div style={{ paddingTop:"64px", background:"#f5f0eb" }}>

        {/* Hero */}
        <section style={{
          minHeight:"70vh", display:"flex", alignItems:"center", justifyContent:"center",
          background:"linear-gradient(145deg,#0f0a04 0%,#1e140a 40%,#2a1a0a 70%,#1e140a 100%)",
          position:"relative", overflow:"hidden", padding:"80px 48px",
        }}>
          <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse 70% 60% at 50% 50%,rgba(201,168,76,0.07),transparent)", pointerEvents:"none" }}/>
          <div style={{ position:"absolute", top:"30%", right:"5%", fontFamily:"'Playfair Display',serif", fontSize:"clamp(80px,15vw,200px)", fontWeight:700, color:"rgba(201,168,76,0.04)", lineHeight:1, userSelect:"none", pointerEvents:"none" }}>MAISON</div>
          <div style={{ maxWidth:"700px", textAlign:"center", position:"relative", zIndex:1 }}>
            <div style={{ width:"48px", height:"1px", margin:"0 auto 32px", background:`linear-gradient(90deg,transparent,${C.gold},transparent)` }}/>
            <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(46px,7vw,88px)", fontWeight:400, color:"#fff", margin:"0 0 20px", lineHeight:1.05 }}>
              Our Story
            </h1>
            <p style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"9.5px", letterSpacing:"0.3em", color:"rgba(255,255,255,0.35)", marginBottom:"32px" }}>
              MUMBAI, INDIA · FOUNDED 2014
            </p>
            <p style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"18px", lineHeight:1.8, color:"rgba(255,255,255,0.6)", fontWeight:300, fontStyle:"italic" }}>
              "We didn't set out to build a fashion brand. We set out to prove that Indian luxury deserved a global audience."
            </p>
            <p style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"11px", letterSpacing:"0.16em", color:C.gold, marginTop:"16px" }}>— AARAV SHAH, FOUNDER</p>
          </div>
        </section>

        {/* Origin story */}
        <section style={{ padding:"100px 48px", background:"#f5f0eb" }}>
          <div style={{ maxWidth:"1200px", margin:"0 auto", display:"grid", gridTemplateColumns:"1fr 1fr", gap:"80px", alignItems:"center" }}>
            <div className="m-reveal-left">
              <div style={{ width:"56px", height:"1px", background:`linear-gradient(90deg,transparent,${C.gold},transparent)`, marginBottom:"28px" }}/>
              <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(30px,3.5vw,46px)", fontWeight:400, color:"#1a1208", marginBottom:"24px", lineHeight:1.2 }}>
                Born from a belief that<br/><em style={{ fontStyle:"italic", color:C.gold }}>heritage is the future</em>
              </h2>
              <p style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"15.5px", lineHeight:1.85, color:"#6b5c44", fontWeight:300, marginBottom:"20px" }}>
                MAISON began in 2014 when Aarav Shah returned from studying at Central Saint Martins in London and found himself frustrated. Indian textiles were among the finest in the world, yet were consistently positioned as inexpensive exports.
              </p>
              <p style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"15.5px", lineHeight:1.85, color:"#6b5c44", fontWeight:300, marginBottom:"20px" }}>
                Working out of a small studio in Bandra, he began sourcing Mysore silk, Rajasthani hand-woven wool, and Kanjeevaram weaves — fabrics that had clothed Indian royalty for centuries — and reimagining them through a contemporary lens.
              </p>
              <p style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"15.5px", lineHeight:1.85, color:"#6b5c44", fontWeight:300 }}>
                Today, MAISON operates from its flagship atelier in BKC, Mumbai, with a team of 40 artisans and a community of over 50,000 clients across India and internationally.
              </p>
            </div>
            <div className="m-reveal-right">
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px" }}>
                <div style={{ aspectRatio:"3/4", background:"linear-gradient(160deg,#c8b080 0%,#a89060 50%,#806840 100%)", gridRow:"span 2" }}/>
                <div style={{ aspectRatio:"1/1", background:"linear-gradient(160deg,#2a2a2a 0%,#1a1a1a 100%)" }}/>
                <div style={{ aspectRatio:"1/1", background:"linear-gradient(160deg,#f0ebe0 0%,#e0d8c8 100%)" }}/>
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section style={{ padding:"90px 48px", background:"#1a1208", position:"relative", overflow:"hidden" }}>
          <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse 70% 60% at 50% 50%,rgba(201,168,76,0.04),transparent)", pointerEvents:"none" }}/>
          <div style={{ maxWidth:"1200px", margin:"0 auto", position:"relative", zIndex:1 }}>
            <div style={{ textAlign:"center", marginBottom:"56px" }} className="m-reveal">
              <div style={{ width:"40px", height:"1px", margin:"0 auto 20px", background:`linear-gradient(90deg,transparent,${C.gold},transparent)` }}/>
              <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(32px,4vw,52px)", fontWeight:400, color:"#fff", marginBottom:"12px" }}>What We Stand For</h2>
              <p style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"9.5px", letterSpacing:"0.3em", color:"rgba(255,255,255,0.3)" }}>THE MAISON PRINCIPLES</p>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"28px" }}>
              {VALUES.map((v, i) => (
                <div key={v.title} className={`m-reveal m-d${i+1}`} style={{ padding:"36px 32px", border:"1px solid rgba(201,168,76,0.15)", background:"rgba(201,168,76,0.02)", transition:"all 0.3s" }}
                  onMouseEnter={e => { e.currentTarget.style.background="rgba(201,168,76,0.04)"; e.currentTarget.style.borderColor="rgba(201,168,76,0.3)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background="rgba(201,168,76,0.02)"; e.currentTarget.style.borderColor="rgba(201,168,76,0.15)"; }}
                >
                  <div style={{ fontSize:"28px", marginBottom:"20px" }}>{v.icon}</div>
                  <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:"22px", fontWeight:400, color:C.gold, marginBottom:"14px" }}>{v.title}</h3>
                  <p style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"14px", lineHeight:1.8, color:"rgba(255,255,255,0.5)", fontWeight:300 }}>{v.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Team */}
        <section style={{ padding:"90px 48px", background:"#f5f0eb" }}>
          <div style={{ maxWidth:"1200px", margin:"0 auto" }}>
            <div style={{ textAlign:"center", marginBottom:"56px" }} className="m-reveal">
              <div style={{ width:"40px", height:"1px", margin:"0 auto 20px", background:`linear-gradient(90deg,transparent,${C.gold},transparent)` }}/>
              <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(32px,4vw,52px)", fontWeight:400, color:"#1a1208", marginBottom:"12px" }}>The Minds Behind MAISON</h2>
              <p style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"9.5px", letterSpacing:"0.3em", color:"#6b5c44" }}>PEOPLE, CRAFT, VISION</p>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"28px" }}>
              {TEAM.map((member, i) => (
                <div key={member.name} className={`m-reveal m-d${i+1}`} style={{ textAlign:"center" }}>
                  <div style={{ aspectRatio:"1/1", background:member.grad, marginBottom:"20px" }}/>
                  <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:"20px", fontWeight:400, color:"#1a1208", marginBottom:"6px" }}>{member.name}</h3>
                  <p style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"11px", letterSpacing:"0.14em", color:C.gold }}>{member.title.toUpperCase()}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={{ padding:"90px 48px", background:"#1a1208", textAlign:"center" }}>
          <div style={{ maxWidth:"600px", margin:"0 auto" }}>
            <div style={{ width:"40px", height:"1px", margin:"0 auto 24px", background:`linear-gradient(90deg,transparent,${C.gold},transparent)` }}/>
            <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(30px,4vw,48px)", fontWeight:400, color:"#fff", marginBottom:"16px" }}>
              Discover the Collection
            </h2>
            <p style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"15px", color:"rgba(255,255,255,0.45)", fontWeight:300, marginBottom:"36px", lineHeight:1.8 }}>
              Explore pieces crafted at the intersection of heritage and modernity.
            </p>
            <button className="m-btn-gold">SHOP NOW</button>
          </div>
        </section>
      </div>
    </>
  );
}
