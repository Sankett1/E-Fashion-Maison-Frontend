import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { C } from "../components/shared";
import { getProducts } from "../api/productApi";
import { useCart } from "../context/CartContext";

// ── Page-scoped styles ────────────────────────────────────────────────────────
const CSS = `
  @keyframes tpFadeUp   { from{opacity:0;transform:translateY(56px) rotateX(18deg) scale(.94)} to{opacity:1;transform:none} }
  @keyframes tpSpin     { to{transform:rotate(360deg)} }
  @keyframes tpShimmer  { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }
  @keyframes tpTicker   { from{transform:translateX(0)} to{transform:translateX(-50%)} }

  .tp-wrap {
    opacity:0;
    transform:translateY(56px) rotateX(18deg) scale(.94);
    transition:opacity .85s cubic-bezier(.23,1,.32,1),transform .85s cubic-bezier(.23,1,.32,1);
  }
  .tp-wrap.tp-in { opacity:1; transform:none; }

  .tp-img {
    position:relative; overflow:hidden; cursor:pointer;
    transform-style:preserve-3d; will-change:transform;
    transition:box-shadow .4s ease;
  }
  .tp-img:hover { box-shadow:0 36px 72px rgba(0,0,0,.28),0 8px 20px rgba(0,0,0,.14); }
  .tp-img img { transition:transform .55s cubic-bezier(.23,1,.32,1); }
  .tp-img:hover img { transform:scale(1.07); }
  .tp-img .tp-bag {
    position:absolute;bottom:0;left:0;right:0;z-index:10;
    padding:12px 0;text-align:center;
    font:300 9px/1 'Cormorant Garamond',serif;letter-spacing:.24em;color:#fff;
    background:rgba(10,6,2,.93);
    transform:translateY(102%);
    transition:transform .35s cubic-bezier(.23,1,.32,1);
  }
  .tp-img:hover .tp-bag { transform:translateY(0); }
  .tp-holo {
    position:absolute;inset:0;z-index:20;pointer-events:none;mix-blend-mode:screen;
    background:radial-gradient(ellipse 110% 75% at var(--hx,50%) var(--hy,50%),
      rgba(255,255,255,.1) 0%,rgba(201,168,76,.05) 35%,transparent 65%);
  }

  .tp-tab { padding:18px 22px;background:none;border:none;cursor:pointer;
    font:300 10px/1 'Cormorant Garamond',serif;letter-spacing:.18em;white-space:nowrap;
    border-bottom:2px solid transparent;color:#6b5c44;transition:all .2s; }
  .tp-tab.on { color:#c9a84c;border-bottom-color:#c9a84c; }
  .tp-sort { padding:7px 14px;background:transparent;cursor:pointer;
    font:300 10px/1 'Cormorant Garamond',serif;letter-spacing:.14em;
    border:1px solid rgba(201,168,76,.25);color:#6b5c44;transition:all .2s; }
  .tp-sort.on { background:rgba(201,168,76,.1);border-color:#c9a84c;color:#c9a84c; }

  .tp-gold {
    background:linear-gradient(90deg,#c9a84c,#e8c96e,#c9a84c);
    background-size:200% auto;
    -webkit-background-clip:text;-webkit-text-fill-color:transparent;
    background-clip:text;animation:tpShimmer 3s ease infinite;
  }
  .tp-toast {
    position:fixed;bottom:32px;left:50%;
    transform:translateX(-50%) translateY(8px);
    opacity:0;pointer-events:none;
    background:#1a1208;border:1px solid rgba(201,168,76,.4);
    padding:13px 28px;z-index:9999;
    font:300 13px/1 'Cormorant Garamond',serif;
    letter-spacing:.14em;color:#e8c96e;
    box-shadow:0 12px 40px rgba(0,0,0,.4);
    transition:all .35s cubic-bezier(.23,1,.32,1);
  }
  .tp-toast.on { opacity:1;transform:translateX(-50%) translateY(0); }
`;

// ── Fallback catalogue ────────────────────────────────────────────────────────
const FALLBACK = [
  { _id:"f1",  name:"Navy Pinstripe Blazer",   category:"Men",         subCategory:"Suits",      price:18500, tag:"NEW",  images:[{url:"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80&fit=crop"}] },
  { _id:"f2",  name:"Belted Trench Coat",       category:"Women",       subCategory:"Outerwear",  price:24900, tag:"NEW",  images:[{url:"https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=600&q=80&fit=crop"}] },
  { _id:"f3",  name:"Chelsea Leather Boots",    category:"Accessories", subCategory:"Shoes",      price:12750, originalPrice:18000, tag:"SALE", images:[{url:"https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80&fit=crop"}] },
  { _id:"f4",  name:"Silk Satin Blouse",        category:"Women",       subCategory:"Tops",       price:8200,  tag:null,   images:[{url:"https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=600&q=80&fit=crop"}] },
  { _id:"f5",  name:"Shawl Collar Overcoat",    category:"Men",         subCategory:"Outerwear",  price:34500, tag:"NEW",  images:[{url:"https://images.unsplash.com/photo-1520975916090-8105d898b5a1?w=600&q=80&fit=crop"}] },
  { _id:"f6",  name:"Cashmere Wrap Cardigan",   category:"Women",       subCategory:"Knitwear",   price:19500, originalPrice:26000, tag:"SALE", images:[{url:"https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=600&q=80&fit=crop"}] },
  { _id:"f7",  name:"Leather Crossbody Bag",    category:"Accessories", subCategory:"Bags",       price:16800, tag:"NEW",  images:[{url:"https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80&fit=crop"}] },
  { _id:"f8",  name:"Double-Breasted Suit",     category:"Men",         subCategory:"Suits",      price:48000, tag:"NEW",  images:[{url:"https://images.unsplash.com/photo-1617137968427-85924c800a22?w=600&q=80&fit=crop"}] },
  { _id:"f9",  name:"Draped Maxi Dress",        category:"Women",       subCategory:"Dresses",    price:13900, tag:"NEW",  images:[{url:"https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&q=80&fit=crop"}] },
  { _id:"f10", name:"Aviator Sunglasses",       category:"Accessories", subCategory:"Sunglasses", price:8900,  tag:"NEW",  images:[{url:"https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&q=80&fit=crop"}] },
  { _id:"f11", name:"Oxford Dress Shirt",       category:"Men",         subCategory:"Shirts",     price:6800,  tag:null,   images:[{url:"https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&q=80&fit=crop"}] },
  { _id:"f12", name:"Wide Leg Trousers",        category:"Women",       subCategory:"Trousers",   price:8900,  tag:"NEW",  images:[{url:"https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=600&q=80&fit=crop"}] },
];

const CATS  = ["All","Women","Men","Accessories"];
const SORTS = [
  { label:"Newest",   param:"-createdAt" },
  { label:"Price ↑",  param:"price"      },
  { label:"Price ↓",  param:"-price"     },
  { label:"A – Z",    param:"name"       },
];

// ── Count-up animation ────────────────────────────────────────────────────────
function CountUp({ end, suffix="" }) {
  const [v,setV] = useState(0);
  const ref      = useRef(null);
  useEffect(()=>{
    const obs = new IntersectionObserver(([e])=>{
      if (!e.isIntersecting) return;
      const t0 = performance.now();
      const tick = (now)=>{
        const p = Math.min((now-t0)/1500,1);
        setV(Math.round((1-Math.pow(1-p,3))*end));
        if(p<1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      obs.unobserve(e.target);
    },{threshold:.5});
    if(ref.current) obs.observe(ref.current);
    return()=>obs.disconnect();
  },[end]);
  return <span ref={ref}>{v}{suffix}</span>;
}

// ── 3D product card ───────────────────────────────────────────────────────────
function TrendCard({ product, index }) {
  const [wish,setWish]           = useState(false);
  const [hov,setHov]             = useState(false);
  const [showSizes,setShowSizes] = useState(false);
  const [toast,setToast]         = useState(false);
  const wrapRef = useRef(null);
  const imgRef  = useRef(null);
  const navigate = useNavigate();
  const { addToCart } = useCart();

  // Scroll reveal
  useEffect(()=>{
    const el=wrapRef.current; if(!el) return;
    const obs=new IntersectionObserver(([e])=>{
      if(e.isIntersecting){
        setTimeout(()=>el.classList.add("tp-in"),index*65);
        obs.unobserve(el);
      }
    },{threshold:.08});
    obs.observe(el);
    return()=>obs.disconnect();
  },[index]);

  // Magnetic tilt with lerp
  useEffect(()=>{
    const el=imgRef.current; if(!el) return;
    let tx=0,ty=0,cx=0,cy=0,af=null;
    const lerp=(a,b,t)=>a+(b-a)*t;
    const tick=()=>{
      cx=lerp(cx,tx,.1); cy=lerp(cy,ty,.1);
      el.style.transform=`rotateX(${cy}deg) rotateY(${cx}deg) scale(${tx?1.025:1})`;
      const h=el.querySelector(".tp-holo");
      if(h){ h.style.setProperty("--hx",`${(tx/22+.5)*100}%`); h.style.setProperty("--hy",`${(-ty/18+.5)*100}%`); }
      if(Math.abs(cx-tx)>.01||Math.abs(cy-ty)>.01) af=requestAnimationFrame(tick); else af=null;
    };
    const mv=(e)=>{ const r=el.getBoundingClientRect(); tx=((e.clientX-r.left)/r.width-.5)*22; ty=-((e.clientY-r.top)/r.height-.5)*18; if(!af) af=requestAnimationFrame(tick); };
    const lv=()=>{ tx=0;ty=0; if(!af) af=requestAnimationFrame(tick); };
    el.addEventListener("mousemove",mv,{passive:true});
    el.addEventListener("mouseleave",lv);
    return()=>{ el.removeEventListener("mousemove",mv); el.removeEventListener("mouseleave",lv); if(af) cancelAnimationFrame(af); };
  },[]);

  const doAdd = (e,size) => {
    e.stopPropagation();
    addToCart({_id:product._id,name:product.name,price:product.price,category:product.category,images:product.images},size,1);
    setShowSizes(false);
    setToast(true);
    setTimeout(()=>setToast(false),2200);
  };

  const img     = product.images?.[0]?.url;
  const hasOrig = product.originalPrice && product.originalPrice > product.price;
  const disc    = hasOrig ? Math.round((1-product.price/product.originalPrice)*100) : 0;
  const sizes   = product.sizes?.length ? product.sizes : ["XS","S","M","L","XL"];

  return (
    <>
      <div className={`tp-toast${toast?" on":""}`}>✓ &nbsp;Added to cart</div>

      <div ref={wrapRef} className="tp-wrap">
        {/* 3D image */}
        <div style={{perspective:"1200px",perspectiveOrigin:"50% 40%",marginBottom:16}}>
          <div ref={imgRef} className="tp-img"
            style={{aspectRatio:"3/4",background:"linear-gradient(160deg,#e8e6e0,#c8c4bc)",
              boxShadow:"0 8px 24px rgba(0,0,0,.1)"}}
            onMouseEnter={()=>setHov(true)}
            onMouseLeave={()=>{setHov(false);setShowSizes(false);}}
            onClick={()=>navigate(`/shop/${product._id}`)}>

            <div className="tp-holo"/>

            {img&&<img src={img} alt={product.name}
              style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover"}}
              onError={e=>{e.target.style.display="none"}}/>}

            {/* Gold edge */}
            <div style={{position:"absolute",top:0,left:0,right:0,height:"1.5px",zIndex:5,
              background:"linear-gradient(90deg,transparent,rgba(201,168,76,.55),transparent)"}}/>

            {/* Tag */}
            {product.tag&&(
              <div style={{position:"absolute",top:13,left:13,zIndex:10,
                padding:"4px 10px",fontSize:"8px",letterSpacing:"0.2em",fontWeight:600,
                background:product.tag==="SALE"?"#e07070":"#c9a84c",color:"#0f0c08"}}>
                {product.tag}
              </div>
            )}

            {/* Wishlist */}
            <button onClick={e=>{e.stopPropagation();setWish(w=>!w);}}
              style={{position:"absolute",top:12,right:12,zIndex:10,width:34,height:34,
                borderRadius:"50%",background:"rgba(255,255,255,.92)",border:"none",cursor:"pointer",
                display:"flex",alignItems:"center",justifyContent:"center",
                color:wish?"#e07070":"#3a2e1e",boxShadow:"0 2px 10px rgba(0,0,0,.12)",transition:"all .22s"}}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill={wish?"#e07070":"none"} stroke="currentColor" strokeWidth="1.8">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </button>

            {/* Add to cart / size picker */}
            {hov&&(
              <div style={{position:"absolute",bottom:0,left:0,right:0,zIndex:10,
                background:"rgba(10,6,2,.94)",padding:"14px 12px"}}>
                {!showSizes
                  ? <button
                      onClick={e=>{e.stopPropagation();setShowSizes(true);}}
                      style={{width:"100%",padding:"10px 0",background:"#c9a84c",border:"none",
                        color:"#0f0c08",cursor:"pointer",fontFamily:"'Cormorant Garamond',serif",
                        fontSize:"9px",letterSpacing:"0.24em",fontWeight:600}}
                      onMouseEnter={e=>e.currentTarget.style.background="#e8c96e"}
                      onMouseLeave={e=>e.currentTarget.style.background="#c9a84c"}>
                      ADD TO CART
                    </button>
                  : <div>
                      <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"8px",
                        letterSpacing:"0.22em",color:"rgba(255,255,255,.45)",marginBottom:8,textAlign:"center"}}>
                        SELECT SIZE
                      </div>
                      <div style={{display:"flex",gap:6,justifyContent:"center",flexWrap:"wrap"}}>
                        {sizes.map(s=>(
                          <button key={s} onClick={e=>doAdd(e,s)}
                            style={{width:36,height:36,background:"rgba(255,255,255,.07)",
                              border:"1px solid rgba(201,168,76,.35)",color:"rgba(255,255,255,.75)",
                              cursor:"pointer",fontFamily:"'Cormorant Garamond',serif",fontSize:"11px",
                              transition:"all .15s"}}
                            onMouseEnter={e=>{e.currentTarget.style.background="#c9a84c";e.currentTarget.style.color="#0f0c08";e.currentTarget.style.borderColor="#c9a84c";}}
                            onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,.07)";e.currentTarget.style.color="rgba(255,255,255,.75)";e.currentTarget.style.borderColor="rgba(201,168,76,.35)";}}>
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                }
              </div>
            )}
          </div>
        </div>

        {/* Info */}
        <div onClick={()=>navigate(`/shop/${product._id}`)} style={{cursor:"pointer"}}>
          <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"9.5px",
            letterSpacing:"0.16em",color:"#6b5c44",marginBottom:4}}>
            {product.category?.toUpperCase()}
            {product.subCategory?` · ${product.subCategory.toUpperCase()}`:""}
          </div>
          <div style={{fontFamily:"'Playfair Display',serif",fontSize:15,
            color:"#1a1208",marginBottom:7,lineHeight:1.3}}>
            {product.name}
          </div>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontFamily:"'Playfair Display',serif",fontSize:15,color:"#1a1208"}}>
              ₹{Number(product.price).toLocaleString("en-IN")}
            </span>
            {hasOrig&&<>
              <span style={{fontSize:12,color:"#b0a08a",textDecoration:"line-through",
                fontFamily:"'Cormorant Garamond',serif"}}>
                ₹{Number(product.originalPrice).toLocaleString("en-IN")}
              </span>
              <span style={{fontSize:"9px",color:"#e07070",letterSpacing:"0.1em"}}>{disc}% OFF</span>
            </>}
          </div>
        </div>
      </div>
    </>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function TrendingPage() {
  const navigate = useNavigate();
  const [products,setProducts] = useState([]);
  const [loading,setLoading]   = useState(true);
  const [cat,setCat]           = useState("All");
  const [si,setSi]             = useState(0);  // sort index
  const [page,setPage]         = useState(1);
  const [total,setTotal]       = useState(0);
  const LIMIT = 12;

  useEffect(()=>{ window.scrollTo(0,0); },[]);
  useEffect(()=>{ setPage(1); },[cat,si]);

  const fallback = ()=>{
    let fb=[...FALLBACK];
    if(cat!=="All") fb=fb.filter(p=>p.category===cat);
    const s=SORTS[si].param;
    if(s==="price") fb.sort((a,b)=>a.price-b.price);
    if(s==="-price") fb.sort((a,b)=>b.price-a.price);
    if(s==="name") fb.sort((a,b)=>a.name.localeCompare(b.name));
    return fb;
  };

  useEffect(()=>{
    setLoading(true);
    const params={sort:SORTS[si].param,limit:LIMIT,page};
    if(cat!=="All") params.category=cat;
    getProducts(params)
      .then(d=>{ const p=d.products||[]; setProducts(p.length?p:fallback()); setTotal(p.length?d.total||p.length:fallback().length); })
      .catch(()=>{ const fb=fallback(); setProducts(fb); setTotal(fb.length); })
      .finally(()=>setLoading(false));
  },[cat,si,page]);

  const totalPages = Math.ceil(total/LIMIT);

  return (
    <div style={{paddingTop:64,background:"#f5f0eb",minHeight:"100vh"}}>
      <style>{CSS}</style>

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <div style={{
        background:"linear-gradient(135deg,#0d0a06 0%,#1a1208 50%,#0d0a06 100%)",
        padding:"24px 28px 20px",textAlign:"center",position:"relative",overflow:"hidden",
      }}>
        {/* Grid lines */}
        <div style={{position:"absolute",inset:0,pointerEvents:"none",opacity:.025,
          backgroundImage:`repeating-linear-gradient(0deg,transparent,transparent 59px,rgba(201,168,76,1) 60px),
                           repeating-linear-gradient(90deg,transparent,transparent 59px,rgba(201,168,76,1) 60px)`}}/>
        <div style={{position:"absolute",inset:0,pointerEvents:"none",
          background:"radial-gradient(ellipse 65% 70% at 50% 50%,rgba(201,168,76,.07) 0%,transparent 65%)"}}/>

        {/* Flame */}
        <div style={{position:"relative",zIndex:1,marginBottom:8}}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
            stroke="#c9a84c" strokeWidth="1.5" strokeLinecap="round">
            <path d="M12 2c0 0-4 4-4 7a4 4 0 0 0 8 0c0-1.5-1-3-2-4l-1 2c0-1-1-4-1-5z"/>
            <path d="M12 22c-4.4 0-8-3.6-8-8 0-2 1-4 2-5"/>
            <path d="M12 22c4.4 0 8-3.6 8-8 0-2-1-4-2-5"/>
          </svg>
        </div>
        <div style={{width:32,height:1,margin:"0 auto 10px",
          background:"linear-gradient(90deg,transparent,#c9a84c,transparent)",position:"relative",zIndex:1}}/>
        <h1 style={{fontFamily:"'Playfair Display',serif",
          fontSize:"clamp(28px,4vw,44px)",fontWeight:400,color:"#fff",
          margin:"0 0 6px",lineHeight:1.1,position:"relative",zIndex:1}}>
          Trending Now
        </h1>
        <p style={{fontFamily:"'Cormorant Garamond',Georgia,serif",
          fontSize:"8.5px",letterSpacing:"0.3em",color:"rgba(255,255,255,.35)",
          position:"relative",zIndex:1}}>
          MOST COVETED PIECES THIS SEASON
        </p>

        {/* Stats */}
        <div style={{display:"flex",justifyContent:"center",gap:36,
          marginTop:16,position:"relative",zIndex:1}}>
          {[{n:50,s:"K+",l:"HAPPY CLIENTS"},{n:200,s:"+",l:"STYLES TRENDING"},{n:48,s:"HR",l:"NEW ARRIVALS"}]
            .map(({n,s,l})=>(
            <div key={l} style={{textAlign:"center"}}>
              <div className="tp-gold" style={{fontFamily:"'Playfair Display',serif",
                fontSize:"clamp(20px,2.5vw,28px)",fontWeight:400}}>
                <CountUp end={n} suffix={s}/>
              </div>
              <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"7.5px",
                letterSpacing:"0.22em",color:"rgba(255,255,255,.28)",marginTop:2}}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── TICKER ───────────────────────────────────────────────────────── */}
      <div style={{background:"#0d0a06",padding:"12px 0",overflow:"hidden",
        borderBottom:"1px solid rgba(201,168,76,.1)"}}>
        <div style={{display:"flex",alignItems:"center"}}>
          <div style={{flexShrink:0,display:"flex",alignItems:"center",gap:8,
            padding:"0 24px",borderRight:"1px solid rgba(201,168,76,.15)",
            fontFamily:"'Cormorant Garamond',serif",fontSize:"9px",
            letterSpacing:"0.28em",color:"rgba(201,168,76,.8)"}}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="#c9a84c">
              <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
            </svg>
            TRENDING
          </div>
          <div style={{flex:1,overflow:"hidden"}}>
            <div style={{display:"flex",gap:32,paddingLeft:32,whiteSpace:"nowrap",
              animation:"tpTicker 28s linear infinite"}}>
              {[...Array(2)].flatMap((_,ri)=>
                ["NAVY PINSTRIPE BLAZER","BELTED TRENCH COAT","CHELSEA BOOTS",
                 "SILK SATIN BLOUSE","CASHMERE CARDIGAN","LEATHER CROSSBODY",
                 "DOUBLE-BREASTED SUIT","DRAPED MAXI DRESS","AVIATOR SUNGLASSES"]
                .map((item,i)=>(
                  <span key={`${ri}-${i}`} style={{fontFamily:"'Cormorant Garamond',serif",
                    fontSize:"9px",letterSpacing:"0.2em",color:"rgba(255,255,255,.22)",flexShrink:0}}>
                    {item}&nbsp;&nbsp;·&nbsp;&nbsp;
                  </span>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── FILTER BAR ───────────────────────────────────────────────────── */}
      <div style={{background:"#fff",borderBottom:"1px solid rgba(201,168,76,.15)",
        position:"sticky",top:64,zIndex:100,
        padding:"0 48px",display:"flex",alignItems:"center",
        justifyContent:"space-between",gap:16}}>
        <div style={{display:"flex"}}>
          {CATS.map(c=>(
            <button key={c} className={`tp-tab${cat===c?" on":""}`}
              onClick={()=>setCat(c)}>
              {c.toUpperCase()}
            </button>
          ))}
        </div>
        <div style={{display:"flex",alignItems:"center",gap:12,flexShrink:0}}>
          {!loading&&<span style={{fontFamily:"'Cormorant Garamond',serif",
            fontSize:12,color:"#6b5c44"}}>{total} pieces</span>}
          <div style={{display:"flex",gap:6}}>
            {SORTS.map((s,i)=>(
              <button key={s.label} className={`tp-sort${si===i?" on":""}`}
                onClick={()=>setSi(i)}>
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── GRID ─────────────────────────────────────────────────────────── */}
      <div style={{padding:"56px 48px",maxWidth:1400,margin:"0 auto"}}>
        {loading
          ? <div style={{display:"flex",justifyContent:"center",alignItems:"center",
              padding:"80px 0",gap:14}}>
              <div style={{width:28,height:28,border:"2px solid #c9a84c",
                borderTopColor:"transparent",borderRadius:"50%",
                animation:"tpSpin .75s linear infinite"}}/>
              <span style={{fontFamily:"'Cormorant Garamond',serif",
                fontSize:12,letterSpacing:"0.2em",color:"#6b5c44"}}>
                LOADING TRENDING ITEMS…
              </span>
            </div>
          : products.length===0
            ? <div style={{textAlign:"center",padding:"80px 0"}}>
                <div style={{fontSize:48,marginBottom:16}}>🔍</div>
                <p style={{fontFamily:"'Playfair Display',serif",fontSize:20,color:"#6b5c44"}}>No items found</p>
                <button onClick={()=>setCat("All")}
                  style={{marginTop:20,padding:"12px 28px",background:"#c9a84c",
                    border:"none",color:"#0f0c08",cursor:"pointer",
                    fontFamily:"'Cormorant Garamond',serif",fontSize:11,letterSpacing:"0.2em"}}>
                  VIEW ALL
                </button>
              </div>
            : <div style={{display:"grid",
                gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",
                gap:"44px 24px"}}>
                {products.map((p,i)=><TrendCard key={p._id} product={p} index={i}/>)}
              </div>
        }

        {/* Pagination */}
        {totalPages>1&&!loading&&(
          <div style={{display:"flex",justifyContent:"center",
            alignItems:"center",gap:8,marginTop:64}}>
            <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1}
              style={{padding:"9px 20px",background:"none",
                border:`1px solid ${page===1?"rgba(201,168,76,.2)":"#c9a84c"}`,
                color:page===1?"rgba(201,168,76,.3)":"#c9a84c",
                cursor:page===1?"not-allowed":"pointer",
                fontFamily:"'Cormorant Garamond',serif",fontSize:11,letterSpacing:"0.14em"}}>
              ← PREV
            </button>
            {Array.from({length:totalPages},(_,i)=>i+1).map(pg=>(
              <button key={pg} onClick={()=>setPage(pg)}
                style={{width:38,height:38,
                  background:pg===page?"#c9a84c":"transparent",
                  border:`1px solid ${pg===page?"#c9a84c":"rgba(201,168,76,.3)"}`,
                  color:pg===page?"#0f0c08":"#6b5c44",
                  fontFamily:"'Cormorant Garamond',serif",fontSize:13,
                  cursor:"pointer",transition:"all .2s"}}>
                {pg}
              </button>
            ))}
            <button onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages}
              style={{padding:"9px 20px",background:"none",
                border:`1px solid ${page===totalPages?"rgba(201,168,76,.2)":"#c9a84c"}`,
                color:page===totalPages?"rgba(201,168,76,.3)":"#c9a84c",
                cursor:page===totalPages?"not-allowed":"pointer",
                fontFamily:"'Cormorant Garamond',serif",fontSize:11,letterSpacing:"0.14em"}}>
              NEXT →
            </button>
          </div>
        )}
      </div>

      {/* ── BACK ─────────────────────────────────────────────────────────── */}
      <div style={{textAlign:"center",padding:"0 0 64px"}}>
        <button onClick={()=>navigate("/shop")}
          style={{fontFamily:"'Cormorant Garamond',serif",fontSize:11,
            letterSpacing:"0.22em",color:"#6b5c44",background:"none",
            border:"1px solid rgba(201,168,76,.3)",padding:"13px 30px",
            cursor:"pointer",transition:"all .22s"}}
          onMouseEnter={e=>{e.currentTarget.style.borderColor="#c9a84c";e.currentTarget.style.color="#c9a84c";}}
          onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(201,168,76,.3)";e.currentTarget.style.color="#6b5c44";}}>
          EXPLORE FULL COLLECTION
        </button>
      </div>
    </div>
  );
}
