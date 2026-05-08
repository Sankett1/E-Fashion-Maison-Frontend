import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { C } from "../components/shared";
import { getAboutContent } from "../api/adminApi";

const TEAM = [
  { name:"Aarav Shah",   title:"Founder & Creative Director", image:"https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&q=80&fit=crop" },
  { name:"Meera Pillai", title:"Head of Design",              image:"https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=600&q=80&fit=crop" },
  { name:"Rahul Desai",  title:"Master Tailor",               image:"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80&fit=crop" },
];

const VALUES = [
  { icon:"🧵", title:"Artisan First",      text:"Every garment is conceived in close collaboration with Indian master craftspeople, ensuring techniques developed over generations continue to thrive.", image:"https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600&q=80&fit=crop" },
  { icon:"🌿", title:"Responsible Craft",  text:"We partner exclusively with GOTS-certified farms and use low-impact dyes. Our packaging is 100% compostable, and we offset every shipment.",      image:"https://images.unsplash.com/photo-1445205170230-053b83016050?w=600&q=80&fit=crop" },
  { icon:"♾️", title:"Timeless by Design", text:"We design against trends. Each MAISON piece is built to outlast seasons — in quality, construction, and aesthetic relevance.",                     image:"https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=600&q=80&fit=crop" },
];

// Fallback images (used when CMS has no upload yet)
const FALLBACK = {
  hero:        "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&q=80&fit=crop",
  storyMain:   "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=800&q=80&fit=crop",
  storyTop:    "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&q=80&fit=crop",
  storyBot:    "https://images.unsplash.com/photo-1445205170230-053b83016050?w=600&q=80&fit=crop",
  cta:         "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1400&q=80&fit=crop",
  atelier: [
    "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&q=80&fit=crop",
    "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600&q=80&fit=crop",
    "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&q=80&fit=crop",
    "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=600&q=80&fit=crop",
  ],
  journey: [
    { year:"2014", title:"The Beginning",    text:"A small studio in Bandra, a big vision — Aarav Shah begins sourcing India's finest textiles.",                         image:"https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&q=80&fit=crop" },
    { year:"2016", title:"First Collection", text:"Our debut collection of 12 pieces sells out in 48 hours, validating the demand for Indian luxury.",                     image:"https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&q=80&fit=crop" },
    { year:"2019", title:"BKC Atelier",      text:"MAISON moves to its flagship atelier in Mumbai's Bandra-Kurla Complex, housing 40 artisans.",                          image:"https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=600&q=80&fit=crop" },
    { year:"2022", title:"Going Global",     text:"International shipping launches. MAISON pieces find homes across 28 countries.",                                        image:"https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=600&q=80&fit=crop" },
    { year:"2024", title:"50K Community",    text:"Our community crosses 50,000 discerning clients. Sustainability certification achieved.",                               image:"https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&q=80&fit=crop" },
  ],
};

function ImgWithFallback({ src, alt, style, grad }) {
  const [err, setErr] = useState(false);
  return err
    ? <div style={{ ...style, background: grad || "linear-gradient(160deg,#c8b080 0%,#806840 100%)" }} />
    : <img src={src} alt={alt} onError={() => setErr(true)} style={style} />;
}

export default function AboutPage({ onAuth }) {
  const navigate = useNavigate();
  const [cms, setCms] = useState(null); // CMS content from API

  // Fetch CMS content; silently fall back to defaults if API is offline
  useEffect(() => {
    getAboutContent().then(d => setCms(d.content)).catch(() => {});
  }, []);

  // Merge CMS images with fallback
  const heroImg     = cms?.heroImage?.url      || FALLBACK.hero;
  const ctaImg      = cms?.ctaImage?.url       || FALLBACK.cta;
  const storyMain   = cms?.storyImages?.main?.url        || FALLBACK.storyMain;
  const storyTop    = cms?.storyImages?.topRight?.url    || FALLBACK.storyTop;
  const storyBot    = cms?.storyImages?.bottomRight?.url || FALLBACK.storyBot;

  const atelierGallery = cms?.atelierGallery?.length
    ? cms.atelierGallery.map(img => img.url)
    : FALLBACK.atelier;

  const journeyItems = cms?.journeyItems?.length
    ? cms.journeyItems.map(item => ({
        ...item,
        image: item.image?.url || FALLBACK.journey.find(f => f.year === item.year)?.image || FALLBACK.journey[0].image,
      }))
    : FALLBACK.journey;

  // Merge team & values images from CMS if available
  const teamData   = TEAM.map((m, i)   => ({ ...m,   image: cms?.team?.[i]?.image?.url   || m.image }));
  const valuesData = VALUES.map((v, i) => ({ ...v, image: cms?.values?.[i]?.image?.url || v.image }));

  useEffect(() => {
    window.scrollTo(0, 0);
    const els = document.querySelectorAll(".m-reveal, .m-reveal-left, .m-reveal-right");
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("visible"); obs.unobserve(e.target); } });
    }, { threshold: 0.1 });
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, [cms]); // re-run after cms loads so new elements get observed

  return (
    <>
      <style>{`
        @keyframes aboutFadeUp { from{opacity:0;transform:translateY(40px)} to{opacity:1;transform:none} }
        @keyframes aboutKen { 0%{transform:scale(1)} 100%{transform:scale(1.08)} }
        .about-img-hover { transition: transform 0.7s cubic-bezier(0.23,1,0.32,1), filter 0.4s ease; }
        .about-img-hover:hover { transform: scale(1.05); filter: brightness(1.05); }
        .journey-card { transition: all 0.4s cubic-bezier(0.23,1,0.32,1); }
        .journey-card:hover { transform: translateY(-6px); box-shadow: 0 20px 50px rgba(0,0,0,0.12); }
        .journey-card:hover .journey-year { color: ${C.gold}; }
        .gallery-img { transition: transform 0.6s cubic-bezier(0.23,1,0.32,1); }
        .gallery-img:hover { transform: scale(1.04); }
      `}</style>

      <div style={{ paddingTop:"64px", background:"#f5f0eb" }}>

        {/* ════════════════════════════════════════════
            HERO — with background image
        ════════════════════════════════════════════ */}
        <section className="r-section" style={{
          minHeight:"75vh", display:"flex", alignItems:"center", justifyContent:"center",
          position:"relative", overflow:"hidden", paddingTop:"80px", paddingBottom:"80px",
        }}>
          {/* Background image */}
          <div style={{ position:"absolute", inset:0, zIndex:0 }}>
            <img
              src={heroImg}
              alt="Maison atelier"
              style={{ width:"100%", height:"100%", objectFit:"cover", animation:"aboutKen 20s ease infinite alternate" }}
            />
          </div>
          {/* Dark overlay */}
          <div style={{ position:"absolute", inset:0, background:"linear-gradient(145deg,rgba(15,10,4,0.92) 0%,rgba(30,20,10,0.85) 40%,rgba(42,26,10,0.88) 70%,rgba(15,10,4,0.92) 100%)", zIndex:1 }}/>
          {/* Radial glow */}
          <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse 70% 60% at 50% 50%,rgba(201,168,76,0.07),transparent)", pointerEvents:"none", zIndex:2 }}/>
          {/* Large watermark */}
          <div style={{ position:"absolute", top:"30%", right:"5%", fontFamily:"'Playfair Display',serif", fontSize:"clamp(80px,15vw,200px)", fontWeight:700, color:"rgba(201,168,76,0.04)", lineHeight:1, userSelect:"none", pointerEvents:"none", zIndex:2 }}>MAISON</div>
          
          <div style={{ maxWidth:"700px", textAlign:"center", position:"relative", zIndex:3 }}>
            <div style={{ width:"48px", height:"1px", margin:"0 auto 32px", background:`linear-gradient(90deg,transparent,${C.gold},transparent)` }}/>
            <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(46px,7vw,88px)", fontWeight:400, color:"#fff", margin:"0 0 20px", lineHeight:1.05, animation:"aboutFadeUp 1s ease 0.3s both" }}>
              Our Story
            </h1>
            <p style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"9.5px", letterSpacing:"0.3em", color:"rgba(255,255,255,0.35)", marginBottom:"32px", animation:"aboutFadeUp 1s ease 0.5s both" }}>
              MUMBAI, INDIA · FOUNDED 2014
            </p>
            <p style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"18px", lineHeight:1.8, color:"rgba(255,255,255,0.6)", fontWeight:300, fontStyle:"italic", animation:"aboutFadeUp 1s ease 0.7s both" }}>
              "We didn't set out to build a fashion brand. We set out to prove that Indian luxury deserved a global audience."
            </p>
            <p style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"11px", letterSpacing:"0.16em", color:C.gold, marginTop:"16px", animation:"aboutFadeUp 1s ease 0.9s both" }}>— AARAV SHAH, FOUNDER</p>
          </div>
        </section>

        {/* ════════════════════════════════════════════
            ORIGIN STORY — with image grid
        ════════════════════════════════════════════ */}
        <section className="r-section r-section-v" style={{ background:"#f5f0eb" }}>
          <div className="r-grid-2" style={{ maxWidth:"1200px", margin:"0 auto", gap:"80px", alignItems:"center" }}>
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
                {/* Main tall image */}
                <div style={{ aspectRatio:"3/4", gridRow:"span 2", overflow:"hidden", position:"relative" }}>
                  <ImgWithFallback
                    src={storyMain}
                    alt="MAISON atelier craftsmanship"
                    style={{ width:"100%", height:"100%", objectFit:"cover", position:"absolute", inset:0 }}
                    grad="linear-gradient(160deg,#c8b080 0%,#a89060 50%,#806840 100%)"
                  />
                  <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top,rgba(26,18,8,0.3),transparent 50%)" }}/>
                </div>
                {/* Top right */}
                <div style={{ aspectRatio:"1/1", overflow:"hidden", position:"relative" }}>
                  <ImgWithFallback
                    src={storyTop}
                    alt="Fashion fabric detail"
                    style={{ width:"100%", height:"100%", objectFit:"cover", position:"absolute", inset:0 }}
                    grad="linear-gradient(160deg,#2a2a2a 0%,#1a1a1a 100%)"
                  />
                </div>
                {/* Bottom right */}
                <div style={{ aspectRatio:"1/1", overflow:"hidden", position:"relative" }}>
                  <ImgWithFallback
                    src={storyBot}
                    alt="Luxury fashion showcase"
                    style={{ width:"100%", height:"100%", objectFit:"cover", position:"absolute", inset:0 }}
                    grad="linear-gradient(160deg,#f0ebe0 0%,#e0d8c8 100%)"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════
            ATELIER GALLERY — fullbleed image strip
        ════════════════════════════════════════════ */}
        <section style={{ padding:"0", overflow:"hidden" }}>
          <div className="r-grid-4" style={{ gap:0, height:"clamp(240px,28vw,380px)" }}>
            {atelierGallery.map((src, i) => (
              <div key={i} style={{ overflow:"hidden", position:"relative" }}>
                <img
                  className="gallery-img"
                  src={src} alt={`MAISON atelier ${i+1}`}
                  style={{ width:"100%", height:"100%", objectFit:"cover" }}
                />
                <div style={{ position:"absolute", inset:0, background:"rgba(26,18,8,0.15)", pointerEvents:"none" }}/>
              </div>
            ))}
          </div>
        </section>

        {/* ════════════════════════════════════════════
            OUR JOURNEY — Timeline with images
        ════════════════════════════════════════════ */}
        <section className="r-section r-section-v" style={{ background:"#f5f0eb", position:"relative" }}>
          <div style={{ maxWidth:"1200px", margin:"0 auto" }}>
            <div style={{ textAlign:"center", marginBottom:"64px" }} className="m-reveal">
              <div style={{ width:"40px", height:"1px", margin:"0 auto 20px", background:`linear-gradient(90deg,transparent,${C.gold},transparent)` }}/>
              <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(32px,4vw,52px)", fontWeight:400, color:"#1a1208", marginBottom:"12px" }}>Our Journey</h2>
              <p style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"9.5px", letterSpacing:"0.3em", color:"#6b5c44" }}>A DECADE OF CRAFTSMANSHIP</p>
            </div>

            {/* Timeline line */}
            <div style={{ position:"relative" }}>
              <div style={{ position:"absolute", left:"50%", top:0, bottom:0, width:"1px", background:`linear-gradient(to bottom,transparent,${C.gold}30,${C.gold}30,transparent)`, transform:"translateX(-50%)" }}/>
              
              {journeyItems.map((item, i) => (
                <div key={item.year} className={`m-reveal ${i % 2 === 0 ? "m-reveal-left" : "m-reveal-right"} r-grid-2`} style={{
                  gap:"48px", alignItems:"center",
                  marginBottom: i < journeyItems.length - 1 ? "64px" : 0,
                  direction: i % 2 === 1 ? "rtl" : "ltr",
                }}>
                  {/* Image side */}
                  <div className="journey-card" style={{
                    overflow:"hidden", position:"relative", aspectRatio:"16/10",
                    boxShadow:"0 8px 32px rgba(0,0,0,0.08)", direction:"ltr",
                  }}>
                    <img
                      className="about-img-hover"
                      src={item.image} alt={item.title}
                      style={{ width:"100%", height:"100%", objectFit:"cover" }}
                    />
                    <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top,rgba(26,18,8,0.5) 0%,transparent 50%)" }}/>
                    <div style={{ position:"absolute", bottom:16, left:20, fontFamily:"'Playfair Display',serif", fontSize:"clamp(36px,5vw,56px)", fontWeight:400, color:"rgba(255,255,255,0.12)", lineHeight:1 }}>
                      {item.year}
                    </div>
                  </div>
                  {/* Text side */}
                  <div style={{ padding:"20px 0", direction:"ltr" }}>
                    <div style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"11px", letterSpacing:"0.3em", color:C.gold, marginBottom:"12px" }}>{item.year}</div>
                    <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(22px,2.5vw,32px)", fontWeight:400, color:"#1a1208", marginBottom:"14px", lineHeight:1.2 }}>{item.title}</h3>
                    <p style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"15px", lineHeight:1.8, color:"#6b5c44", fontWeight:300 }}>{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════
            VALUES — with background imagery
        ════════════════════════════════════════════ */}
        <section className="r-section" style={{ paddingTop:"100px", paddingBottom:"100px", background:"#1a1208", position:"relative", overflow:"hidden" }}>
          <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse 70% 60% at 50% 50%,rgba(201,168,76,0.04),transparent)", pointerEvents:"none" }}/>
          {/* Subtle background image */}
          <div style={{ position:"absolute", inset:0, opacity:0.04, zIndex:0 }}>
            <img src="https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=1400&q=60&fit=crop" alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
          </div>
          <div style={{ maxWidth:"1200px", margin:"0 auto", position:"relative", zIndex:1 }}>
            <div style={{ textAlign:"center", marginBottom:"56px" }} className="m-reveal">
              <div style={{ width:"40px", height:"1px", margin:"0 auto 20px", background:`linear-gradient(90deg,transparent,${C.gold},transparent)` }}/>
              <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(32px,4vw,52px)", fontWeight:400, color:"#fff", marginBottom:"12px" }}>What We Stand For</h2>
              <p style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"9.5px", letterSpacing:"0.3em", color:"rgba(255,255,255,0.3)" }}>THE MAISON PRINCIPLES</p>
            </div>
            <div className="r-grid-3" style={{ gap:"28px" }}>
              {valuesData.map((v, i) => (
                <div key={v.title} className={`m-reveal m-d${i+1}`} style={{
                  border:"1px solid rgba(201,168,76,0.15)", background:"rgba(201,168,76,0.02)",
                  transition:"all 0.4s", overflow:"hidden",
                }}
                  onMouseEnter={e => { e.currentTarget.style.background="rgba(201,168,76,0.04)"; e.currentTarget.style.borderColor="rgba(201,168,76,0.3)"; e.currentTarget.style.transform="translateY(-4px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background="rgba(201,168,76,0.02)"; e.currentTarget.style.borderColor="rgba(201,168,76,0.15)"; e.currentTarget.style.transform=""; }}
                >
                  {/* Value image header */}
                  <div style={{ height:"180px", overflow:"hidden", position:"relative" }}>
                    <img
                      src={v.image} alt={v.title}
                      style={{ width:"100%", height:"100%", objectFit:"cover", transition:"transform 0.6s ease" }}
                    />
                    <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top,rgba(26,18,8,0.95) 0%,rgba(26,18,8,0.3) 60%,transparent 100%)" }}/>
                    <div style={{ position:"absolute", bottom:16, left:20, fontSize:"36px" }}>{v.icon}</div>
                  </div>
                  <div style={{ padding:"28px 28px 32px" }}>
                    <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:"22px", fontWeight:400, color:C.gold, marginBottom:"14px" }}>{v.title}</h3>
                    <p style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"14px", lineHeight:1.8, color:"rgba(255,255,255,0.5)", fontWeight:300 }}>{v.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════
            TEAM — with portrait images
        ════════════════════════════════════════════ */}
        <section className="r-section" style={{ paddingTop:"100px", paddingBottom:"100px", background:"#f5f0eb" }}>
          <div style={{ maxWidth:"1200px", margin:"0 auto" }}>
            <div style={{ textAlign:"center", marginBottom:"56px" }} className="m-reveal">
              <div style={{ width:"40px", height:"1px", margin:"0 auto 20px", background:`linear-gradient(90deg,transparent,${C.gold},transparent)` }}/>
              <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(32px,4vw,52px)", fontWeight:400, color:"#1a1208", marginBottom:"12px" }}>The Minds Behind MAISON</h2>
              <p style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"9.5px", letterSpacing:"0.3em", color:"#6b5c44" }}>PEOPLE, CRAFT, VISION</p>
            </div>
            <div className="r-grid-3" style={{ gap:"28px" }}>
              {teamData.map((member, i) => (
                <div key={member.name} className={`m-reveal m-d${i+1}`} style={{ textAlign:"center" }}>
                  <div style={{
                    aspectRatio:"3/4", overflow:"hidden", position:"relative", marginBottom:"20px",
                    boxShadow:"0 8px 32px rgba(0,0,0,0.08)",
                  }}>
                    <ImgWithFallback
                      src={member.image}
                      alt={member.name}
                      style={{ width:"100%", height:"100%", objectFit:"cover", objectPosition:"center top", position:"absolute", inset:0, transition:"transform 0.6s cubic-bezier(0.23,1,0.32,1)" }}
                      grad={`linear-gradient(160deg,#c8b080 0%,#806840 100%)`}
                    />
                    {/* Overlay */}
                    <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top,rgba(26,18,8,0.6) 0%,transparent 40%)", transition:"opacity 0.3s" }}/>
                    {/* Gold bottom line */}
                    <div style={{ position:"absolute", bottom:0, left:0, right:0, height:"2px", background:`linear-gradient(90deg,transparent,${C.gold},transparent)` }}/>
                  </div>
                  <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:"20px", fontWeight:400, color:"#1a1208", marginBottom:"6px" }}>{member.name}</h3>
                  <p style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"11px", letterSpacing:"0.14em", color:C.gold }}>{member.title.toUpperCase()}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════
            CTA — with background image
        ════════════════════════════════════════════ */}
        <section className="r-section r-section-v" style={{ position:"relative", overflow:"hidden", textAlign:"center" }}>
          {/* Background image */}
          <div style={{ position:"absolute", inset:0, zIndex:0 }}>
            <img
              src={ctaImg}
              alt="Collection showcase"
              style={{ width:"100%", height:"100%", objectFit:"cover" }}
            />
          </div>
          <div style={{ position:"absolute", inset:0, background:"rgba(26,18,8,0.88)", zIndex:1 }}/>
          <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse 60% 50% at 50% 50%,rgba(201,168,76,0.06),transparent)", zIndex:2, pointerEvents:"none" }}/>
          
          <div style={{ maxWidth:"600px", margin:"0 auto", position:"relative", zIndex:3 }}>
            <div style={{ width:"40px", height:"1px", margin:"0 auto 24px", background:`linear-gradient(90deg,transparent,${C.gold},transparent)` }}/>
            <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(30px,4vw,48px)", fontWeight:400, color:"#fff", marginBottom:"16px" }}>
              Discover the Collection
            </h2>
            <p style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"15px", color:"rgba(255,255,255,0.45)", fontWeight:300, marginBottom:"36px", lineHeight:1.8 }}>
              Explore pieces crafted at the intersection of heritage and modernity.
            </p>
            <div style={{ display:"flex", gap:"14px", justifyContent:"center", flexWrap:"wrap" }}>
              <button className="m-btn-gold" onClick={() => navigate("/shop")}>SHOP NOW</button>
              <button className="m-btn-outline-white" onClick={() => navigate("/shop?tag=NEW")}>NEW ARRIVALS</button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
