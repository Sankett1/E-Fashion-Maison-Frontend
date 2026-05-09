import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "./shared";
import { getProducts } from "../api/productApi";

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
      <h2 style={{ fontFamily:"'DM Serif Display',Georgia,serif", fontSize:"clamp(36px,4.5vw,54px)", fontWeight:500, color:"#1a1208", margin:"0 0 14px", lineHeight:1.1 }}>{title}</h2>
      <p style={{ fontFamily:"'DM Sans',system-ui,sans-serif", fontSize:"12px", letterSpacing:"0.14em", color:"#6b5c44", fontWeight:400 }}>{sub}</p>
    </div>
  );
}

// ── Footer column ─────────────────────────────────────────────────────────────
function FooterCol({ title, links }) {
  return (
    <div>
      <div style={{ fontFamily:"'DM Sans',system-ui,sans-serif", fontSize:"12px", letterSpacing:"0.25em", fontWeight:500, color:"#3a2e1e", marginBottom:"20px" }}>{title}</div>
      {links.map(l => <a key={l} className="m-footer-link">{l}</a>)}
    </div>
  );
}


// ══════════════════════════════════════════════════════════════════════════════
// 3D ANIMATION SYSTEM
// ══════════════════════════════════════════════════════════════════════════════
const MX_CSS = `
  /* ── Scroll arrow ──────────────────────────────────────────────────── */
  @keyframes arrowBounce{
    0%,100%{transform:translateX(-50%) translateY(0px)}
    50%{transform:translateX(-50%) translateY(8px)}
  }
  @keyframes htSpin{to{transform:rotate(360deg)}}

  /* ── Trending horizontal scroll strip ─────────────────────────────── */
  .ht-scroll{
    overflow-x:auto;overflow-y:visible;
    -webkit-overflow-scrolling:touch;
    scrollbar-width:none;-ms-overflow-style:none;
    cursor:grab;padding:16px 0 48px;
  }
  .ht-scroll:active{cursor:grabbing}
  .ht-scroll::-webkit-scrollbar{display:none}
  .ht-track{display:flex;gap:22px;padding:0 48px;width:max-content}
  .ht-card{flex:0 0 265px;opacity:0;
    transform:translateY(60px) rotateX(20deg) scale(.93);
    transition:opacity .85s cubic-bezier(.23,1,.32,1),transform .85s cubic-bezier(.23,1,.32,1)}
  .ht-card.ht-in{opacity:1;transform:none}
  .ht-card:nth-child(1){transition-delay:0s}
  .ht-card:nth-child(2){transition-delay:.08s}
  .ht-card:nth-child(3){transition-delay:.16s}
  .ht-card:nth-child(4){transition-delay:.24s}
  .ht-card:nth-child(5){transition-delay:.32s}
  .ht-card:nth-child(6){transition-delay:.40s}
  .ht-card:nth-child(7){transition-delay:.48s}
  .ht-card:nth-child(8){transition-delay:.56s}

  .mx-scene{perspective:1400px;perspective-origin:50% 35%}
  .mx-card{transform-style:preserve-3d;will-change:transform;transition:box-shadow .4s ease;position:relative;overflow:hidden}
  .mx-card:hover{box-shadow:0 48px 96px rgba(0,0,0,.55),0 0 0 1px rgba(201,168,76,.22),inset 0 1px 0 rgba(255,255,255,.06)}
  .mx-holo{position:absolute;inset:0;z-index:30;pointer-events:none;border-radius:inherit;
    background:radial-gradient(ellipse 110% 75% at var(--hx,50%) var(--hy,50%),rgba(255,255,255,.13) 0%,rgba(201,168,76,.06) 35%,transparent 65%),
    linear-gradient(calc(var(--ha,135deg)),rgba(201,168,76,.04) 0%,transparent 40%,rgba(255,255,255,.04) 60%,transparent 100%);
    mix-blend-mode:screen}
  .mx-edge{position:absolute;top:0;left:0;right:0;height:1.5px;z-index:41;
    background:linear-gradient(90deg,transparent,rgba(201,168,76,.8),transparent);
    transform:scaleX(0);transform-origin:left;transition:transform .55s cubic-bezier(.23,1,.32,1)}
  .mx-card:hover .mx-edge{transform:scaleX(1)}

  /* Collection stagger reveal */
  .mxc-wrap{opacity:0;transform:translateY(72px) rotateX(14deg) scale(.97);
    transition:opacity .9s cubic-bezier(.23,1,.32,1),transform .9s cubic-bezier(.23,1,.32,1)}
  .mxc-wrap.mxc-in{opacity:1;transform:translateY(0) rotateX(0) scale(1)}
  .mxc-wrap:nth-child(1){transition-delay:0s}
  .mxc-wrap:nth-child(2){transition-delay:.13s}
  .mxc-wrap:nth-child(3){transition-delay:.26s}

  /* Trending cinematic rise */
  .mxt-wrap{opacity:0;transform:translateY(90px) rotateX(24deg) rotateZ(-1deg) scale(.91);
    transition:opacity 1s cubic-bezier(.23,1,.32,1),transform 1s cubic-bezier(.23,1,.32,1)}
  .mxt-wrap.mxt-in{opacity:1;transform:translateY(0) rotateX(0) rotateZ(0) scale(1)}
  .mxt-wrap:nth-child(1){transition-delay:0s}
  .mxt-wrap:nth-child(2){transition-delay:.1s}
  .mxt-wrap:nth-child(3){transition-delay:.2s}
  .mxt-wrap:nth-child(4){transition-delay:.3s}
  .mxt-img{transition:transform .6s cubic-bezier(.23,1,.32,1);width:100%;height:100%;object-fit:cover}
  .mxt-hover .mxt-img{transform:scale(1.07)}
  .mxt-qadd{position:absolute;bottom:0;left:0;right:0;padding:12px 0;text-align:center;
    font:300 9px/1 'DM Sans',system-ui,sans-serif;letter-spacing:.24em;color:#fff;
    background:linear-gradient(to top,rgba(8,4,1,.95),rgba(8,4,1,.85));
    transform:translateY(102%);transition:transform .38s cubic-bezier(.23,1,.32,1);z-index:5}
  .mxt-hover .mxt-qadd{transform:translateY(0)}

  /* Testimonial carousel */
  .mxq-scroll{overflow-x:auto;overflow-y:visible;-webkit-overflow-scrolling:touch;
    scrollbar-width:none;-ms-overflow-style:none;scroll-snap-type:x mandatory;
    cursor:grab;padding:32px 0 56px}
  .mxq-scroll::-webkit-scrollbar{display:none}
  .mxq-scroll:active{cursor:grabbing}
  .mxq-track{display:flex;gap:20px}
  .mxq-card{flex:0 0 360px;scroll-snap-align:center;opacity:0;
    transform:translateY(56px) rotateY(-10deg) scale(.92);
    transition:opacity .8s cubic-bezier(.23,1,.32,1),transform .8s cubic-bezier(.23,1,.32,1),
      box-shadow .4s ease,filter .4s ease;will-change:transform,opacity;position:relative;overflow:hidden}
  .mxq-card.mxq-in{opacity:1;transform:none}
  .mxq-card.mxq-center{transform:translateY(-7px) scale(1.035)!important;
    box-shadow:0 28px 64px rgba(0,0,0,.18),0 0 0 1.5px rgba(201,168,76,.35);filter:none;z-index:4}
  .mxq-card.mxq-far{transform:scale(.96) translateY(5px)!important;opacity:.65!important;filter:brightness(.95)}
  .mxq-progress{position:absolute;bottom:0;left:0;height:2px;width:0;
    background:linear-gradient(90deg,#c9a84c,#e8c96e);
    transition:width 4s linear}

  /* Animated header */
  .mxh-word{display:inline-block;opacity:0;transform:translateY(100%);
    transition:opacity .7s ease,transform .7s cubic-bezier(.23,1,.32,1)}
  .mxh-go .mxh-word{opacity:1;transform:translateY(0)}
  .mxh-go .mxh-word:nth-child(1){transition-delay:0s}
  .mxh-go .mxh-word:nth-child(2){transition-delay:.08s}
  .mxh-go .mxh-word:nth-child(3){transition-delay:.16s}
  .mxh-go .mxh-word:nth-child(4){transition-delay:.24s}
  .mxh-go .mxh-word:nth-child(5){transition-delay:.32s}
  .mxh-sub{opacity:0;transform:translateY(16px);transition:opacity .6s ease .3s,transform .6s cubic-bezier(.23,1,.32,1) .3s}
  .mxh-go .mxh-sub{opacity:1;transform:none}

  /* Dot navigator */
  .mxq-dot{width:6px;height:6px;border-radius:3px;background:rgba(201,168,76,.25);
    border:none;cursor:pointer;padding:0;transition:all .4s cubic-bezier(.23,1,.32,1)}
  .mxq-dot.on{width:28px;background:#c9a84c;box-shadow:0 2px 8px rgba(201,168,76,.4)}
`;

// ── useScrollIn: add className when element enters viewport ──────────────────
function useScrollIn(ref, addedClass, delay=0, opts={}) {
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        setTimeout(() => el.classList.add(addedClass), delay);
        obs.unobserve(el);
      }
    }, { threshold: opts.t||.12, rootMargin: opts.rm||"0px 0px -40px 0px" });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
}

// ── useMagTilt: smooth lerp magnetic tilt + holographic shine ────────────────
function useMagTilt(ref, str=1) {
  useEffect(() => {
    const el = ref.current; if (!el) return;
    let tx=0, ty=0, cx=0, cy=0, af=null;
    const lerp=(a,b,t)=>a+(b-a)*t;
    const tick=()=>{
      cx=lerp(cx,tx,.11); cy=lerp(cy,ty,.11);
      el.style.transform=`rotateX(${cy}deg) rotateY(${cx}deg) scale(${tx?1.02:1})`;
      if(Math.abs(cx-tx)>.01||Math.abs(cy-ty)>.01) af=requestAnimationFrame(tick); else af=null;
    };
    const mv=(e)=>{
      const r=el.getBoundingClientRect();
      const x=(e.clientX-r.left)/r.width, y=(e.clientY-r.top)/r.height;
      tx=(x-.5)*24*str; ty=(y-.5)*-20*str;
      const h=el.querySelector(".mx-holo");
      if(h){h.style.setProperty("--hx",`${x*100}%`);h.style.setProperty("--hy",`${y*100}%`);h.style.setProperty("--ha",`${x*120+45}deg`);}
      if(!af) af=requestAnimationFrame(tick);
    };
    const lv=()=>{ tx=0;ty=0; if(!af) af=requestAnimationFrame(tick); };
    el.addEventListener("mousemove",mv,{passive:true});
    el.addEventListener("mouseleave",lv);
    return()=>{ el.removeEventListener("mousemove",mv); el.removeEventListener("mouseleave",lv); if(af) cancelAnimationFrame(af); };
  },[]);
}

// ── AnimHeader ───────────────────────────────────────────────────────────────
function AnimHeader({title, sub, dark=false}) {
  const ref=useRef(null);
  useScrollIn(ref,"mxh-go",0,{t:.2});
  return (
    <div ref={ref} style={{textAlign:"center",marginBottom:56}}>
      <div style={{width:40,height:1,margin:"0 auto 20px",background:"linear-gradient(90deg,transparent,#c9a84c,transparent)"}}/>
      <h2 style={{fontFamily:"'DM Serif Display',Georgia,serif",fontSize:"clamp(34px,4.5vw,52px)",fontWeight:400,
        color:dark?"#fff":"#1a1208",margin:"0 0 14px",lineHeight:1.1,overflow:"hidden"}}>
        {title.split(" ").map((w,i)=>(
          <span key={i} className="mxh-word" style={{marginRight:"0.26em"}}>{w}</span>
        ))}
      </h2>
      <p className="mxh-sub" style={{fontFamily:"'DM Sans',system-ui,sans-serif",fontSize:"12px",
        letterSpacing:"0.14em",color:dark?"rgba(255,255,255,.35)":"#6b5c44",fontWeight:400}}>{sub}</p>
    </div>
  );
}

// ── CollectionCard ───────────────────────────────────────────────────────────
function CollectionCard({eye,name,image,link}) {
  const wrap=useRef(null), card=useRef(null);
  const nav=useNavigate();
  useScrollIn(wrap,"mxc-in");
  useMagTilt(card);
  return (
    <div ref={wrap} className="mxc-wrap">
      <div className="mx-scene" style={{aspectRatio:"3/4"}}>
        <div ref={card} className="mx-card" onClick={()=>nav(link||"/shop")}
          style={{width:"100%",height:"100%",background:"#0a0603",cursor:"pointer"}}>
          <div className="mx-holo"/><div className="mx-edge"/>
          {image&&<img src={image} alt={name}
            style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",transition:"transform .7s cubic-bezier(.23,1,.32,1)"}}
            onError={e=>{e.target.style.display="none"}}/>}
          {/* Overlays */}
          <div style={{position:"absolute",inset:0,zIndex:2,background:"linear-gradient(to top,rgba(4,2,0,.94) 0%,rgba(4,2,0,.28) 45%,transparent 75%)"}}/>
          <div style={{position:"absolute",inset:0,zIndex:3,background:"linear-gradient(135deg,rgba(201,168,76,.04) 0%,transparent 50%,rgba(0,0,0,.18) 100%)"}}/>
        
          {/* Vertical eyebrow */}
          <div style={{position:"absolute",left:20,top:"28%",zIndex:10,display:"flex",flexDirection:"column",alignItems:"center",gap:8}}>
            <div style={{width:1,height:28,background:"rgba(201,168,76,.35)"}}/>
            <span style={{fontSize:"12.5px",letterSpacing:"0.14em",color:"rgba(255,255,255,.4)",fontFamily:"'DM Sans',system-ui,sans-serif",writingMode:"vertical-rl",textOrientation:"sideways-right",fontWeight:500}}>{eye}</span>
          </div>

          {/* Bottom */}
          <div style={{position:"absolute",bottom:0,left:0,right:0,zIndex:10,padding:"0 26px 30px"}}>
            <div style={{width:28,height:1,background:"rgba(201,168,76,.55)",marginBottom:12}}/>
            <h3 style={{fontFamily:"'DM Serif Display',Georgia,serif",fontSize:"clamp(22px,2.4vw,30px)",fontWeight:400,color:"#fff",margin:"0 0 16px",lineHeight:1.1,textShadow:"0 4px 24px rgba(0,0,0,.6)"}}>{name}</h3>
            <div style={{display:"flex",alignItems:"center",gap:8,fontSize:"12px",letterSpacing:"0.12em",color:"rgba(201,168,76,.8)",fontFamily:"'DM Sans',system-ui,sans-serif"}}>
              EXPLORE
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── TrendingCard ─────────────────────────────────────────────────────────────
function TrendingCard({type,name,price,image,index,tag,originalPrice,productId,onClick}) {
  const wrap=useRef(null),img=useRef(null);
  const [wish,setWish]=useState(false),[hov,setHov]=useState(false);
  useScrollIn(wrap,"mxt-in");
  useMagTilt(img,.65);
  return (
    <div ref={wrap} className="mxt-wrap" onClick={onClick} style={{cursor:onClick?"pointer":"default"}}>
      <div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)} style={{cursor:"pointer"}}>
        <div className="mx-scene" style={{marginBottom:18,aspectRatio:"3/4"}}>
          <div ref={img} className={`mx-card ${hov?"mxt-hover":""}`} style={{width:"100%",height:"100%",background:"#e4e0d8"}}>
            <div className="mx-holo"/>
            {image&&<img className="mxt-img" src={image} alt={name} style={{position:"absolute",inset:0}} onError={e=>{e.target.style.display="none"}}/>}
            {tag&&<div style={{position:"absolute",top:12,left:12,zIndex:10,padding:"4px 9px",fontSize:"11px",letterSpacing:"0.10em",fontWeight:600,background:tag==="SALE"?"#e07070":"#c9a84c",color:"#0f0c08"}}>{tag}</div>}
            <div style={{position:"absolute",inset:0,zIndex:2,background:"rgba(0,0,0,.1)",opacity:hov?1:0,transition:"opacity .3s"}}/>
            <div style={{position:"absolute",top:0,left:0,right:0,height:"1.5px",zIndex:5,background:"linear-gradient(90deg,transparent,rgba(201,168,76,.55),transparent)"}}/>
            <button onClick={e=>{e.stopPropagation();setWish(w=>!w)}}
              style={{position:"absolute",top:13,right:13,zIndex:10,width:33,height:33,borderRadius:"50%",
                background:"rgba(255,255,255,.92)",border:"none",cursor:"pointer",
                display:"flex",alignItems:"center",justifyContent:"center",
                color:wish?"#e07070":"#3a2e1e",boxShadow:"0 2px 10px rgba(0,0,0,.14)",transition:"all .22s"}}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill={wish?"#e07070":"none"} stroke="currentColor" strokeWidth="1.8">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </button>
            <div className="mxt-qadd">ADD TO BAG</div>
          </div>
        </div>
        <div style={{fontFamily:"'DM Sans',system-ui,sans-serif",fontSize:"12px",letterSpacing:"0.08em",color:"#6b5c44",marginBottom:5}}>{type}</div>
        <div style={{fontFamily:"'DM Serif Display',Georgia,serif",fontSize:15,color:"#1a1208",marginBottom:7,lineHeight:1.3}}>{name}</div>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <span style={{fontFamily:"'DM Serif Display',Georgia,serif",fontSize:15,color:"#1a1208"}}>{price}</span>
          <div style={{flex:1,height:"0.5px",background:"linear-gradient(90deg,rgba(201,168,76,.4),transparent)"}}/>
        </div>
      </div>
    </div>
  );
}

// ── TestCarousel ─────────────────────────────────────────────────────────────
function TestCarousel({items}) {
  const scrollRef=useRef(null),trackRef=useRef(null);
  const [active,setActive]=useState(0),[ready,setReady]=useState(false);
  const CW=360+20;

  useEffect(()=>{
    const obs=new IntersectionObserver(([e])=>{
      if(e.isIntersecting&&!ready){
        setReady(true);
        trackRef.current?.querySelectorAll(".mxq-card").forEach((c,i)=>{
          setTimeout(()=>c.classList.add("mxq-in"),i*90);
        });
      }
    },{threshold:.08});
    if(scrollRef.current) obs.observe(scrollRef.current);
    return()=>obs.disconnect();
  },[ready]);

  const sync=(idx)=>{
    const clamped=Math.max(0,Math.min(idx,items.length-1));
    setActive(clamped);
    trackRef.current?.querySelectorAll(".mxq-card").forEach((c,i)=>{
      c.classList.remove("mxq-center","mxq-far");
      if(i===clamped) c.classList.add("mxq-center");
      else if(Math.abs(i-clamped)>=2) c.classList.add("mxq-far");
    });
  };
  const goTo=(idx)=>{ scrollRef.current?.scrollTo({left:idx*CW,behavior:"smooth"}); sync(idx); };
  const onScroll=()=>{ const idx=Math.round(scrollRef.current.scrollLeft/CW); sync(idx); };

  // Auto-advance
  useEffect(()=>{ const id=setInterval(()=>goTo((active+1)%items.length),4200); return()=>clearInterval(id); },[active,items.length]);

  return (
    <div style={{position:"relative"}}>
      <div ref={scrollRef} className="mxq-scroll" onScroll={onScroll}>
        <div ref={trackRef} className="mxq-track"
          style={{paddingLeft:"max(48px,calc((100vw - 1100px)/2))",paddingRight:"max(48px,calc((100vw - 1100px)/2))"}}>
          {items.map((item,i)=>(
            <div key={item.name} className="mxq-card"
              style={{background:"#fff",padding:"36px 30px",
                border:"1px solid rgba(201,168,76,.13)",transitionDelay:`${i*.07}s`}}>
              {/* Progress line — resets on active change via key */}
              {i===active&&<div key={`p${active}`} className="mxq-progress"
                ref={el=>{if(el) setTimeout(()=>{el.style.width="100%"},50)}}/>}
              <div style={{position:"absolute",top:0,left:0,right:0,height:i===active?"2px":"1px",
                background:i===active
                  ?"linear-gradient(90deg,transparent,#c9a84c 30%,#e8c96e 50%,#c9a84c 70%,transparent)"
                  :"linear-gradient(90deg,transparent,rgba(201,168,76,.18),transparent)",
                transition:"height .3s,background .3s"}}/>
              <div style={{fontFamily:"'DM Serif Display',Georgia,serif",fontSize:68,lineHeight:.75,
                color:"#c9a84c",opacity:i===active?.72:.2,marginBottom:22,userSelect:"none",
                transition:"opacity .4s"}}>"</div>
              <p style={{fontFamily:"'DM Sans',system-ui,sans-serif",fontSize:"13.5px",lineHeight:1.8,
                color:"#3a2e1e",fontWeight:400,fontStyle:"italic",marginBottom:22,minHeight:96}}>
                "{item.text}"</p>
              <div style={{width:22,height:"0.5px",background:"rgba(201,168,76,.5)",marginBottom:14}}/>
              <div style={{display:"flex",gap:2,marginBottom:11}}>
                {"★★★★★".split("").map((s,si)=><span key={si} style={{color:"#c9a84c",fontSize:10}}>{s}</span>)}
              </div>
              <div style={{fontFamily:"'DM Serif Display',Georgia,serif",fontSize:15,fontWeight:500,color:"#1a1208",marginBottom:3}}>{item.name}</div>
              <div style={{fontFamily:"'DM Sans',system-ui,sans-serif",fontSize:"12px",letterSpacing:"0.08em",color:"#6b5c44",marginBottom:9}}>{item.loc}</div>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <div style={{width:14,height:"0.5px",background:"rgba(201,168,76,.4)"}}/>
                <span style={{fontFamily:"'DM Sans',system-ui,sans-serif",fontSize:"11px",letterSpacing:"0.08em",color:"#c9a84c"}}>{item.purchase}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Dots */}
      <div style={{display:"flex",justifyContent:"center",gap:8,marginTop:28}}>
        {items.map((_,i)=><button key={i} onClick={()=>goTo(i)} className={`mxq-dot ${i===active?"on":""}`}/>)}
      </div>
      {/* Arrows */}
      {[{d:-1,s:"left"},{d:1,s:"right"}].map(({d,s})=>(
        <button key={s} onClick={()=>goTo(Math.max(0,Math.min(active+d,items.length-1)))}
          style={{position:"absolute",top:"38%",[s]:0,width:42,height:42,
            background:"rgba(255,255,255,.96)",border:"1px solid rgba(201,168,76,.22)",
            cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",
            color:"#1a1208",boxShadow:"0 4px 16px rgba(0,0,0,.1)",transition:"all .22s",zIndex:10}}
          onMouseEnter={e=>{e.currentTarget.style.background="#c9a84c";e.currentTarget.style.color="#fff";e.currentTarget.style.borderColor="#c9a84c"}}
          onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,.96)";e.currentTarget.style.color="#1a1208";e.currentTarget.style.borderColor="rgba(201,168,76,.22)"}}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            {d<0?<path d="M15 18l-6-6 6-6"/>:<path d="M9 18l6-6-6-6"/>}
          </svg>
        </button>
      ))}
    </div>
  );
}


// ── Fallback data for strip ───────────────────────────────────────────────────
const HT_FALLBACK = [
  {_id:"ht1",name:"Navy Pinstripe Blazer",   category:"Men",         subCategory:"Suits",      price:18500, tag:"NEW",  images:[{url:"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80&fit=crop"}]},
  {_id:"ht2",name:"Belted Trench Coat",      category:"Women",       subCategory:"Outerwear",  price:24900, tag:"NEW",  images:[{url:"https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=600&q=80&fit=crop"}]},
  {_id:"ht3",name:"Chelsea Leather Boots",   category:"Accessories", subCategory:"Shoes",      price:12750, originalPrice:18000, tag:"SALE", images:[{url:"https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80&fit=crop"}]},
  {_id:"ht4",name:"Silk Satin Blouse",       category:"Women",       subCategory:"Tops",       price:8200,  tag:null,   images:[{url:"https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=600&q=80&fit=crop"}]},
  {_id:"ht5",name:"Shawl Collar Overcoat",   category:"Men",         subCategory:"Outerwear",  price:34500, tag:"NEW",  images:[{url:"https://images.unsplash.com/photo-1520975916090-8105d898b5a1?w=600&q=80&fit=crop"}]},
  {_id:"ht6",name:"Cashmere Wrap Cardigan",  category:"Women",       subCategory:"Knitwear",   price:19500, originalPrice:26000, tag:"SALE", images:[{url:"https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=600&q=80&fit=crop"}]},
  {_id:"ht7",name:"Leather Crossbody Bag",   category:"Accessories", subCategory:"Bags",       price:16800, tag:"NEW",  images:[{url:"https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80&fit=crop"}]},
  {_id:"ht8",name:"Double-Breasted Suit",    category:"Men",         subCategory:"Suits",      price:48000, tag:"NEW",  images:[{url:"https://images.unsplash.com/photo-1617137968427-85924c800a22?w=600&q=80&fit=crop"}]},
];

// ── HomeTrendingStrip — horizontal scroll, wheel-driven, API-fetched ──────────
function HomeTrendingStrip() {
  const [items,  setItems]   = useState([]);
  const [loading,setLoading] = useState(true);
  const scrollEl = useRef(null);
  const trackEl  = useRef(null);
  const navigate = useNavigate();

  // Fetch from API (8 newest), fall back to static
  useEffect(() => {
    getProducts({ sort:"-createdAt", limit:8, page:1 })
      .then(d => { const p=d.products||[]; setItems(p.length ? p : HT_FALLBACK); })
      .catch(() => setItems(HT_FALLBACK))
      .finally(() => setLoading(false));
  }, []);

  // Mouse-wheel → horizontal scroll
  useEffect(() => {
    const el = scrollEl.current;
    if (!el) return;
    const onWheel = (e) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return; // native horizontal — leave alone
      e.preventDefault();
      el.scrollBy({ left: e.deltaY * 2.4, behavior:"auto" });
    };
    el.addEventListener("wheel", onWheel, { passive:false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [loading]);

  // Click-drag scroll
  useEffect(() => {
    const el = scrollEl.current;
    if (!el) return;
    let down=false, startX=0, sl=0;
    const md=(e)=>{ down=true; startX=e.pageX-el.offsetLeft; sl=el.scrollLeft; };
    const mu=()=>{ down=false; };
    const mm=(e)=>{ if(!down) return; e.preventDefault(); el.scrollLeft=sl-(e.pageX-el.offsetLeft-startX)*1.4; };
    el.addEventListener("mousedown",md);
    window.addEventListener("mouseup",mu);
    el.addEventListener("mousemove",mm);
    return ()=>{ el.removeEventListener("mousedown",md); window.removeEventListener("mouseup",mu); el.removeEventListener("mousemove",mm); };
  }, [loading]);

  // Scroll-reveal: stagger cards in when strip enters viewport
  useEffect(() => {
    if (loading || !trackEl.current) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        trackEl.current?.querySelectorAll(".ht-card").forEach((c,i) => {
          setTimeout(() => c.classList.add("ht-in"), i*80);
        });
        obs.disconnect();
      }
    }, { threshold:0.1 });
    obs.observe(trackEl.current);
    return () => obs.disconnect();
  }, [loading]);

  if (loading) return (
    <div style={{display:"flex",justifyContent:"center",alignItems:"center",
      gap:12,padding:"60px 0"}}>
      <div style={{width:26,height:26,border:"2px solid #c9a84c",borderTopColor:"transparent",
        borderRadius:"50%",animation:"htSpin .75s linear infinite"}}/>
      <span style={{fontFamily:"'DM Sans',system-ui,sans-serif",fontSize:12,
        letterSpacing:"0.08em",color:"#6b5c44"}}>LOADING…</span>
    </div>
  );

  return (
    <div style={{position:"relative"}}>
      {/* Left / right fade edges */}
      <div style={{position:"absolute",left:0,top:0,bottom:40,width:80,zIndex:10,pointerEvents:"none",
        background:"linear-gradient(to right,#f5f0eb,transparent)"}}/>
      <div style={{position:"absolute",right:0,top:0,bottom:40,width:80,zIndex:10,pointerEvents:"none",
        background:"linear-gradient(to left,#f5f0eb,transparent)"}}/>

      {/* Scroll hint */}
      <div style={{textAlign:"center",marginBottom:16,
        fontFamily:"'DM Sans',system-ui,sans-serif",fontSize:"12px",
        letterSpacing:"0.12em",color:"rgba(107,92,68,0.45)",
        display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
        <svg width="28" height="8" viewBox="0 0 28 8" fill="none">
          <path d="M1 4h22M18 1l4 3-4 3" stroke="rgba(201,168,76,0.45)" strokeWidth="1.2" strokeLinecap="round"/>
        </svg>
        SCROLL TO EXPLORE
        <svg width="28" height="8" viewBox="0 0 28 8" fill="none">
          <path d="M27 4H5M10 1L6 4l4 3" stroke="rgba(201,168,76,0.45)" strokeWidth="1.2" strokeLinecap="round"/>
        </svg>
      </div>

      {/* Scroll container */}
      <div ref={scrollEl} className="ht-scroll">
        <div ref={trackEl} className="ht-track">
          {items.map((p,i) => (
            <div key={p._id} className="ht-card">
              <TrendingCard
                productId={p._id}
                type={`${p.category?.toUpperCase()}${p.subCategory?" · "+p.subCategory.toUpperCase():""}`}
                name={p.name}
                price={"₹"+Number(p.price).toLocaleString("en-IN")}
                image={p.images?.[0]?.url}
                tag={p.tag}
                originalPrice={p.originalPrice}
                index={i}
                onClick={()=>navigate(`/shop/${p._id}`)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* View All CTA — centred below strip */}
      <div style={{textAlign:"center",marginTop:8}}>
        <button
          onClick={()=>navigate("/trending")}
          style={{
            fontFamily:"'DM Sans',system-ui,sans-serif",
            fontSize:"10px",letterSpacing:"0.12em",
            color:"#c9a84c",background:"none",
            border:"1px solid rgba(201,168,76,0.4)",
            padding:"11px 28px",cursor:"pointer",
            display:"inline-flex",alignItems:"center",gap:10,
            transition:"all 0.25s",
          }}
          onMouseEnter={e=>{e.currentTarget.style.background="rgba(201,168,76,0.08)";e.currentTarget.style.borderColor="#c9a84c";}}
          onMouseLeave={e=>{e.currentTarget.style.background="none";e.currentTarget.style.borderColor="rgba(201,168,76,0.4)";}}>
          VIEW ALL TRENDING
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </button>
      </div>
    </div>
  );
}

export default function HeroPage({ onAuth }) {
  const navigate = useNavigate();

  // Hero content can be customised from Admin → Hero Settings
  const heroCards = (() => {
    try {
      const saved = localStorage.getItem("maison_hero_cards");
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  })();

  // Video background — falls back to default Pexels fabric video
  const heroVideoUrl = localStorage.getItem("maison_hero_video") ||
    "https://res.cloudinary.com/dt2hohaty/video/upload/v1775057702/9541951-hd_2048_1080_25fps_j9bwer.mp4";

  const COLLECTION_CARDS = heroCards || [
    { id:"card1", eye:"SHARP & REFINED",  name:"Tailoring",   link:"/shop?category=Men&sub=Suits", image:"https://images.unsplash.com/photo-1617137968427-85924c800a22?w=800&q=80&fit=crop", cls:"col-card-1", rev:"m-reveal-left",  d:"" },
    { id:"card2", eye:"EFFORTLESS STYLE", name:"Casual Luxe", link:"/shop?category=Women",         image:"https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80&fit=crop", cls:"col-card-2", rev:"m-reveal",        d:"m-d2" },
    { id:"card3", eye:"FINAL TOUCHES",    name:"Accessories", link:"/shop?category=Accessories",   image:"https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80&fit=crop", cls:"col-card-3", rev:"m-reveal-right", d:"" },
  ];
  const heroContentRef = useRef(null);
  const heroBeamRef    = useRef(null);
  const trendingRef    = useRef(null);
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
      <style dangerouslySetInnerHTML={{ __html: HERO_CSS + MX_CSS }}/>

      {/* ════════════════════════════════════════════
          HERO
      ════════════════════════════════════════════ */}
      <section id="hero" style={{
        position:"relative", minHeight:"100vh", overflow:"hidden",
        display:"flex", alignItems:"center",
        background:"#080502",
      }}>
        {/* ── Full-bleed background video ─────────────────────────────────── */}
        <video
          autoPlay muted loop playsInline
          style={{
            position:"absolute", inset:0,
            width:"100%", height:"100%",
            objectFit:"cover",
            zIndex:0,
            opacity:0.85,
          }}
        >
          {/* Free fashion/fabric videos from Pexels CDN — no API key needed */}
          <source src={heroVideoUrl} type="video/mp4"/>
          {/* Fallback video if primary fails */}
          <source src="https://res.cloudinary.com/dt2hohaty/video/upload/v1775057702/9541951-hd_2048_1080_25fps_j9bwer.mp4" type="video/mp4"/>
        </video>

        {/* Dark overlay so text stays readable */}
        <div style={{position:"absolute",inset:0,background:"rgba(5,3,1,0.55)",zIndex:1,pointerEvents:"none",opacity:0.110}}/>
        {/* Left-side text vignette */}
        <div style={{position:"absolute",inset:0,background:"linear-gradient(to right,rgba(5,3,1,0.65) 0%,rgba(5,3,1,0.2) 50%,transparent 100%)",zIndex:1,pointerEvents:"none"}}/>
        {/* Bottom fade */}
        <div style={{position:"absolute",bottom:0,left:0,right:0,height:"25%",background:"linear-gradient(to top,rgba(8,5,0,0.7) 0%,transparent 100%)",zIndex:1,pointerEvents:"none"}}/>

        {/* Diagonal beam */}
        <div ref={heroBeamRef} style={{position:"absolute",zIndex:2,top:0,right:"30%",width:"1.5px",height:"68%",background:"linear-gradient(to bottom,rgba(255,238,185,0.18) 0%,transparent 100%)",transform:"rotate(-10deg)",transformOrigin:"top center",pointerEvents:"none"}}/>

        {/* Right panel placeholder (video fills full bg now, no SVG needed) */}
        <div style={{position:"absolute",right:0,top:0,bottom:0,width:"55%",overflow:"hidden",pointerEvents:"none",zIndex:1}}>
          <div style={{position:"absolute",inset:0,background:"linear-gradient(to left,rgba(5,3,1,0.1) 0%,transparent 55%)"}}/>

          <div style={{position:"absolute",top:"5%",right:"22%",width:"1.5px",height:"68%",background:"linear-gradient(to bottom,rgba(255,240,185,0.2) 0%,transparent 100%)",transform:"rotate(-10deg)",transformOrigin:"top center"}}/>
        </div>

        {/* Hero text */}
        <div ref={heroContentRef} style={{position:"relative",zIndex:10,paddingLeft:"clamp(32px,6vw,88px)",paddingTop:"80px",maxWidth:"580px",paddingBottom:"80px"}}>
          <div style={{width:"72px",height:"1px",marginBottom:"38px",background:"linear-gradient(90deg,transparent,#c9a84c,transparent)",animation:"hScaleX 0.8s ease 0.4s both",transformOrigin:"left"}}/>
          <div style={{overflow:"hidden"}}>
            <h1 style={{fontFamily:"'DM Serif Display',Georgia,serif",fontSize:"clamp(52px,8.5vw,98px)",fontWeight:400,color:"#fff",margin:0,lineHeight:1,textShadow:"0 2px 50px rgba(0,0,0,0.18)",animation:"hFadeUp 1s cubic-bezier(0.4,0,0.2,1) 0.55s forwards",opacity:0}}>Spring</h1>
          </div>
          <div style={{overflow:"hidden"}}>
            <h1 style={{fontFamily:"'DM Serif Display',Georgia,serif",fontSize:"clamp(52px,8.5vw,98px)",fontStyle:"italic",fontWeight:400,color:"#fff",margin:0,lineHeight:1.05,textShadow:"0 2px 50px rgba(0,0,0,0.18)",animation:"hFadeUp 1s cubic-bezier(0.4,0,0.2,1) 0.72s forwards",opacity:0}}>Collection</h1>
          </div>
          <div style={{overflow:"hidden"}}>
            <p style={{fontFamily:"'DM Serif Display',Georgia,serif",fontSize:"clamp(60px,10vw,118px)",fontWeight:400,color:"#fff",margin:"4px 0 20px",lineHeight:1,textShadow:"0 4px 60px rgba(0,0,0,0.15)",animation:"hFadeUp 1s cubic-bezier(0.4,0,0.2,1) 0.88s forwards",opacity:0}}>2026</p>
          </div>
          <p style={{fontFamily:"'DM Sans',system-ui,sans-serif",fontSize:"12px",letterSpacing:"0.12em",color:"rgba(255,255,255,0.65)",fontWeight:400,lineHeight:2.2,marginBottom:"44px",animation:"hFadeUp 0.8s ease 1.1s forwards",opacity:0}}>
            REDEFINING ELEGANCE THROUGH<br/>MODERN SILHOUETTES
          </p>
          <div style={{display:"flex",gap:"14px",flexWrap:"wrap",animation:"hFadeUp 0.7s ease 1.3s forwards",opacity:0}}>
            <button className="m-btn-gold"          onClick={() => navigate("/shop")}>EXPLORE NOW</button>
            <button className="m-btn-outline-white" onClick={() => navigate("/about")}>VIEW LOOKBOOK</button>
          </div>
        </div>

        {/* Scroll indicator */}
        <div style={{position:"absolute",bottom:"32px",left:"50%",transform:"translateX(-50%)",display:"flex",flexDirection:"column",alignItems:"center",gap:"8px",animation:"hFadeIn 0.6s ease 2.2s forwards",opacity:0}}>
          <span style={{fontFamily:"'DM Sans',system-ui,sans-serif",fontSize:"11px",letterSpacing:"0.14em",color:"rgba(255,255,255,0.38)"}}>SCROLL</span>
          <div style={{width:"1px",height:"38px",background:"linear-gradient(to bottom,rgba(201,168,76,0.65),transparent)",animation:"hPulse 2s ease infinite"}}/>
        </div>
      </section>


      {/* ════════ CURATED COLLECTIONS — magnetic 3D + scroll stagger ═══════ */}
      <section className="r-section-v r-section" style={{background:"#f5f0eb",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse 70% 60% at 50% 50%,rgba(201,168,76,.045) 0%,transparent 65%)",pointerEvents:"none"}}/>
        <div style={{position:"relative",zIndex:1}}>
          <AnimHeader title="Curated Collections" sub="DISCOVER WHAT DEFINES YOU"/>
          <div className="r-grid-3" style={{gap:"18px",maxWidth:"1260px",margin:"0 auto"}}>
            {COLLECTION_CARDS.map(({eye,name,image,link},i)=>(
              <CollectionCard key={name} eye={eye} name={name} image={image} link={link||"/shop"} index={i}/>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ TRENDING NOW — centered header + horizontal scroll ════════ */}
      <section ref={trendingRef} className="r-section-v" style={{
        background:"#f5f0eb",
        position:"relative",
        overflow:"hidden",
      }}>
        
        {/* ── Centered header ── */}
        <div className="r-section">
          <AnimHeader title="Trending Now" sub="MOST COVETED PIECES THIS SEASON"/>
        </div>

        {/* ── Horizontal scroll strip ── */}
        <HomeTrendingStrip/>
      </section>

      {/* ════════════════════════════════════════════
          CRAFTED IN INDIA
      ════════════════════════════════════════════ */}
      <section className="r-section-v r-section" style={{background:"#1a1208",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:"50%",right:"-2%",transform:"translateY(-50%)",fontFamily:"'DM Serif Display',Georgia,serif",fontSize:"clamp(80px,14vw,180px)",fontWeight:700,color:"rgba(255,255,255,0.025)",lineHeight:1,userSelect:"none",pointerEvents:"none",whiteSpace:"nowrap"}}>INDIA</div>
        <div className="r-grid-2" style={{gap:"clamp(40px, 6vw, 80px)",alignItems:"center",maxWidth:"1300px",margin:"0 auto"}}>
          <div className="m-reveal-left">
            <div style={{width:"64px",height:"1px",marginBottom:"32px",background:"linear-gradient(90deg,transparent,#c9a84c,transparent)"}}/>
            <h2 style={{fontFamily:"'DM Serif Display',Georgia,serif",fontSize:"clamp(32px,4vw,50px)",fontWeight:500,color:"#fff",marginBottom:"28px",lineHeight:1.15}}>
              Crafted in India,<br/><em style={{fontStyle:"italic",color:"#e8c96e"}}>Made for the World</em>
            </h2>
            <p style={{fontFamily:"'DM Sans',system-ui,sans-serif",fontSize:"15px",lineHeight:1.85,color:"rgba(255,255,255,0.55)",fontWeight:400,marginBottom:"20px"}}>
              MAISON was born from a belief that Indian luxury deserves a global stage. We source only the finest fabrics — Mysore silk, Rajasthani wool, Kanjeevaram weaves — and transform them through precise, modern tailoring.
            </p>
            <p style={{fontFamily:"'DM Sans',system-ui,sans-serif",fontSize:"15px",lineHeight:1.85,color:"rgba(255,255,255,0.55)",fontWeight:400,marginBottom:"20px"}}>
              Every piece is designed in our Mumbai atelier, crafted by master artisans with decades of expertise, and delivered with the care that a luxury garment deserves.
            </p>
            <button className="m-btn-outline-light" onClick={() => navigate("/about")}>OUR STORY</button>
          </div>
          <div className="m-reveal-right r-grid-2" style={{gap:"20px"}}>
            {[
              { id:"hStat1", init:"12+",  label:"YEARS OF CRAFT"  },
              { id:"hStat2", init:"50K+", label:"HAPPY CLIENTS"   },
              { id:"hStat3", init:"200+", label:"STYLES CURATED"  },
              { id:"hStat4", init:"100%", label:"ARTISAN MADE"    },
            ].map(({ id, init, label }) => (
              <div key={id} className="m-stat-card">
                <div id={id} className="m-shimmer-text" style={{fontFamily:"'DM Serif Display',Georgia,serif",fontSize:"clamp(32px,4vw,52px)",fontWeight:500,lineHeight:1,marginBottom:"10px"}}>{init}</div>
                <div style={{fontFamily:"'DM Sans',system-ui,sans-serif",fontSize:"12px",letterSpacing:"0.12em",color:"rgba(255,255,255,0.35)",fontWeight:400}}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ TESTIMONIALS — depth snap carousel + auto-advance ══════════ */}
      <section className="r-section-v" style={{background:"#0c0905",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:0,left:"50%",transform:"translateX(-50%)",
          width:"65%",height:"100%",pointerEvents:"none",
          background:"radial-gradient(ellipse 100% 55% at 50% 50%,rgba(201,168,76,.04) 0%,transparent 70%)"}}/>
        <div className="r-section" style={{position:"relative",zIndex:1}}>
          <AnimHeader title="What Our Clients Say" sub="STORIES FROM THE MAISON COMMUNITY" dark/>
        </div>
        <TestCarousel items={[
          {text:"The quality of the Silk Satin Blouse is absolutely stunning. It feels luxurious and the fit is perfect. MAISON has become my go-to for premium fashion.",                name:"Priya Mehta",      loc:"MUMBAI, MAHARASHTRA",   purchase:"SILK SATIN BLOUSE"},
          {text:"Bought the Structured Wool Blazer for a board meeting — received so many compliments! The craftsmanship is on par with international luxury brands.",                   name:"Arjun Kapoor",     loc:"DELHI, NCR",             purchase:"STRUCTURED WOOL BLAZER"},
          {text:"Delivery was surprisingly fast and the packaging was beautiful — felt like receiving a gift. The Chelsea Boots are worth every rupee.",                                 name:"Kavya Reddy",      loc:"HYDERABAD, TELANGANA",   purchase:"CHELSEA LEATHER BOOTS"},
          {text:"Finally a brand that understands Indian aesthetics with a global sensibility. The Trench Coat drapes beautifully. Will definitely be ordering again.",                  name:"Rohan Singhania",  loc:"BENGALURU, KARNATAKA",   purchase:"BELTED TRENCH COAT"},
          {text:"Ordered the Cashmere Cardigan and it arrived in the most gorgeous packaging. The fabric is unbelievably soft. This is genuinely world-class Indian luxury.",            name:"Ananya Pillai",    loc:"CHENNAI, TAMIL NADU",    purchase:"CASHMERE WRAP CARDIGAN"},
          {text:"The attention to detail in every stitch is remarkable. Wore the Double-Breasted Suit to a wedding — had strangers asking where I bought it. Worth every rupee.",        name:"Vikram Mehrotra",  loc:"PUNE, MAHARASHTRA",      purchase:"DOUBLE-BREASTED SUIT"},
        ]}/>
      </section>


      {/* ════════════════════════════════════════════
          NEWSLETTER
      ════════════════════════════════════════════ */}
      <section className="r-section-v r-section" style={{background:"#1a1208",textAlign:"center",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse 60% 50% at 50% 50%,rgba(201,168,76,0.06) 0%,transparent 65%)",pointerEvents:"none"}}/>
        <div style={{position:"relative",zIndex:1}}>
          <div className="m-reveal" style={{width:"48px",height:"1px",margin:"0 auto",background:"linear-gradient(90deg,transparent,rgba(201,168,76,0.5),transparent)"}}/>
          <div style={{height:"20px"}}/>
          <h2 className="m-reveal" style={{fontFamily:"'DM Serif Display',Georgia,serif",fontSize:"clamp(32px,4.5vw,52px)",fontWeight:500,color:"#fff",marginBottom:"14px",lineHeight:1.15}}>
            Stay in the <em style={{fontStyle:"italic",color:"#e8c96e"}}>Know</em>
          </h2>
          <p className="m-reveal m-d1" style={{fontFamily:"'DM Sans',system-ui,sans-serif",fontSize:"12px",letterSpacing:"0.14em",color:"rgba(255,255,255,0.38)",marginBottom:"44px"}}>
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
          TRUST BAR — below newsletter
      ════════════════════════════════════════════ */}
      <section className="r-section" style={{
        background:"#1a1208",
        borderTop:"1px solid rgba(201,168,76,0.12)",
        paddingTop:"36px", paddingBottom:"36px",
        position:"relative",
        overflow:"hidden",
      }}>
        <div style={{position:"absolute",inset:0,pointerEvents:"none",
          background:"radial-gradient(ellipse 80% 60% at 50% 50%,rgba(201,168,76,0.05) 0%,transparent 70%)"}}/>
        <div className="r-grid-6" style={{
          gap:"20px",
          maxWidth:"1300px",
          margin:"0 auto",
          position:"relative",
          zIndex:1,
        }}>
          {[
            { icon:<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>, title:"FREE SHIPPING",    sub:"On orders above ₹2,000" },
            { icon:<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>,                                                                                                title:"EASY RETURNS",     sub:"30-day return policy"   },
            { icon:<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,                                                                                                                           title:"SECURE PAYMENT",   sub:"Razorpay protected"     },
            { icon:<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>,          title:"24/7 SUPPORT",     sub:"Dedicated care team"    },
            { icon:<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,                                                                                    title:"EMI AVAILABLE",    sub:"No-cost EMI options"    },
            { icon:<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>,                                        title:"PREMIUM PACKAGING", sub:"Gift-ready unboxing"   },
          ].map(({ icon, title, sub }, i) => (
            <div key={title} style={{
              display:"flex", flexDirection:"column", alignItems:"center",
              textAlign:"center", gap:14, padding:"4px",
              opacity:0,
              animation:`trustIn 0.7s cubic-bezier(0.23,1,0.32,1) ${i * 0.08}s forwards`,
            }}>
              <style>{`@keyframes trustIn{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:none}}`}</style>
              <div
                style={{
                  width:52, height:52, borderRadius:"50%",
                  border:"1px solid rgba(201,168,76,0.3)",
                  background:"rgba(201,168,76,0.06)",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  color:"#c9a84c",
                  transition:"all 0.3s ease",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = "rgba(201,168,76,0.14)";
                  e.currentTarget.style.borderColor = "#c9a84c";
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow = "0 10px 28px rgba(201,168,76,0.22)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = "rgba(201,168,76,0.06)";
                  e.currentTarget.style.borderColor = "rgba(201,168,76,0.3)";
                  e.currentTarget.style.transform = "";
                  e.currentTarget.style.boxShadow = "";
                }}
              >
                {icon}
              </div>
              <div>
                <div style={{
                  fontFamily:"'DM Sans',system-ui,sans-serif",
                  fontSize:"10px", letterSpacing:"0.12em", fontWeight:600,
                  color:"rgba(255,255,255,0.88)", marginBottom:5,
                }}>
                  {title}
                </div>
                <div style={{
                  fontFamily:"'DM Sans',system-ui,sans-serif",
                  fontSize:"12px", color:"rgba(255,255,255,0.35)",
                  fontWeight:400, lineHeight:1.55,
                }}>
                  {sub}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════════
          FOOTER
      ════════════════════════════════════════════ */}
      <footer className="r-section" style={{background:"#f5f0eb",paddingTop:"72px",paddingBottom:"40px"}}>
        <div className="r-grid-4" style={{gap:"48px",maxWidth:"1300px",margin:"0 auto 56px"}}>
          {/* Brand col */}
          <div>
            <div style={{fontFamily:"'DM Serif Display',Georgia,serif",fontSize:"20px",letterSpacing:"0.12em",fontWeight:600,color:"#1a1208",marginBottom:"16px"}}>MAISON</div>
            <p style={{fontFamily:"'DM Sans',system-ui,sans-serif",fontSize:"14px",lineHeight:1.7,color:"#6b5c44",fontWeight:400,marginBottom:"24px"}}>
              Redefining modern luxury through timeless design and exceptional Indian craftsmanship.
            </p>
            {[
              { icon:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>, text:"MAISON Atelier, BKC, Mumbai 400051" },
              { icon:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.12 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.63a16 16 0 0 0 6 6l.92-.92a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 16z"/></svg>, text:"+91 98765 43210" },
              { icon:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>, text:"hello@maison.in" },
            ].map(({ icon, text }) => (
              <div key={text} style={{display:"flex",alignItems:"flex-start",gap:"10px",fontFamily:"'DM Sans',system-ui,sans-serif",fontSize:"13px",color:"#6b5c44",marginBottom:"10px",fontWeight:400}}>
                <span style={{color:"#c9a84c",flexShrink:0,marginTop:"2px"}}>{icon}</span>{text}
              </div>
            ))}
          </div>
          <FooterCol title="SHOP"    links={["New Arrivals","Women","Men","Accessories","Sale"]}/>
          <FooterCol title="HELP"    links={["Contact Us","Shipping Policy","Returns & Exchanges","Size Guide","FAQ","Track Order"]}/>
          <FooterCol title="COMPANY" links={["About Us","Careers","Press & Media","Sustainability","Craftsmanship"]}/>
        </div>

        <hr style={{border:"none",borderTop:"1px solid rgba(201,168,76,0.18)",maxWidth:"1300px",margin:"0 auto 32px"}}/>

        <div className="r-footer-bottom" style={{maxWidth:"1300px",margin:"0 auto"}}>
          <div>
            <div style={{fontFamily:"'DM Sans',system-ui,sans-serif",fontSize:"12px",letterSpacing:"0.25em",color:"#6b5c44",marginBottom:"12px"}}>SECURE PAYMENT METHODS</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:"8px"}}>
              {["Razorpay","UPI","Net Banking","Visa","Mastercard","RuPay","EMI","PayTM","PhonePe","Google Pay"].map(p => (
                <span key={p} className="m-pay-badge">{p}</span>
              ))}
            </div>
          </div>
          <div style={{fontFamily:"'DM Sans',system-ui,sans-serif",fontSize:"11px",color:"rgba(26,18,8,0.35)",letterSpacing:"0.1em",textAlign:"right"}}>
            © 2026 MAISON. All rights reserved.
          </div>
        </div>
      </footer>
    </>
  );
}