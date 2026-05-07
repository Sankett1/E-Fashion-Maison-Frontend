import { useState } from "react";
import AdminLayout from "./AdminLayout";
import { C } from "../../components/shared";

// ── Storage Keys ──────────────────────────────────────────────────────────────
const KEYS = {
  heroBg:       "maison_story_hero_bg",
  storyMain:    "maison_story_main",
  storyTopRight:"maison_story_top_right",
  storyBotRight:"maison_story_bottom_right",
  gallery:      "maison_story_gallery",
  journey:      "maison_story_journey",
  values:       "maison_story_values",
  team:         "maison_story_team",
  ctaBg:        "maison_story_cta_bg",
};

// ── Defaults ──────────────────────────────────────────────────────────────────
const DEFAULTS = {
  heroBg:        "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&q=80&fit=crop",
  storyMain:     "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=800&q=80&fit=crop",
  storyTopRight: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&q=80&fit=crop",
  storyBotRight: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=600&q=80&fit=crop",
  gallery: [
    "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&q=80&fit=crop",
    "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600&q=80&fit=crop",
    "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&q=80&fit=crop",
    "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=600&q=80&fit=crop",
  ],
  journey: [
    { year:"2014", title:"The Beginning",    image:"https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&q=80&fit=crop" },
    { year:"2016", title:"First Collection", image:"https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&q=80&fit=crop" },
    { year:"2019", title:"BKC Atelier",      image:"https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=600&q=80&fit=crop" },
    { year:"2022", title:"Going Global",     image:"https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=600&q=80&fit=crop" },
    { year:"2024", title:"50K Community",    image:"https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&q=80&fit=crop" },
  ],
  values: [
    { title:"Artisan First",      icon:"🧵", image:"https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600&q=80&fit=crop" },
    { title:"Responsible Craft",  icon:"🌿", image:"https://images.unsplash.com/photo-1445205170230-053b83016050?w=600&q=80&fit=crop" },
    { title:"Timeless by Design", icon:"♾️", image:"https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=600&q=80&fit=crop" },
  ],
  team: [
    { name:"Aarav Shah",    title:"Founder & Creative Director", image:"https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&q=80&fit=crop" },
    { name:"Meera Pillai",  title:"Head of Design",              image:"https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=600&q=80&fit=crop" },
    { name:"Rahul Desai",   title:"Master Tailor",               image:"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80&fit=crop" },
  ],
  ctaBg: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1400&q=80&fit=crop",
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const load = (key, def) => {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : def;
  } catch { return def; }
};

// ── Shared styles ─────────────────────────────────────────────────────────────
const input = {
  width: "100%", padding: "10px 13px",
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(201,168,76,0.2)",
  color: "#fff", fontSize: "12px", outline: "none",
  fontFamily: "inherit", boxSizing: "border-box",
};
const label = {
  display: "block", fontSize: "9px",
  letterSpacing: "0.18em", color: "rgba(255,255,255,0.4)", marginBottom: "6px",
};
const card = {
  background: "linear-gradient(135deg,#0f0c08,#110e08)",
  border: "1px solid rgba(201,168,76,0.15)",
  padding: 20, marginBottom: 0,
};
const sectionTitle = {
  fontFamily: "'Playfair Display',serif", fontSize: 17,
  color: "#fff", marginBottom: 18,
};
const divider = { borderTop: "1px solid rgba(201,168,76,0.1)", margin: "28px 0" };

// ── ImageField — label + input + inline preview ───────────────────────────────
function ImageField({ label: lbl, value, onChange, aspect = "16/9", height = 72 }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={label}>{lbl}</label>
      <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 10, alignItems: "flex-start" }}>
        <input value={value} onChange={e => onChange(e.target.value)}
          placeholder="https://images.unsplash.com/..." style={input} />
        <div style={{ width: height * (aspect === "3/4" ? 0.75 : aspect === "1/1" ? 1 : 1.78),
          height, flexShrink: 0, background: "#0a0603", border: "1px solid rgba(201,168,76,0.15)", overflow: "hidden" }}>
          {value && <img src={value} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }}
            onError={e => { e.target.style.display = "none"; }} />}
        </div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function AdminStory() {
  const [heroBg,        setHeroBg]        = useState(() => load(KEYS.heroBg,        DEFAULTS.heroBg));
  const [storyMain,     setStoryMain]     = useState(() => load(KEYS.storyMain,     DEFAULTS.storyMain));
  const [storyTopRight, setStoryTopRight] = useState(() => load(KEYS.storyTopRight, DEFAULTS.storyTopRight));
  const [storyBotRight, setStoryBotRight] = useState(() => load(KEYS.storyBotRight, DEFAULTS.storyBotRight));
  const [gallery,       setGallery]       = useState(() => load(KEYS.gallery,       DEFAULTS.gallery));
  const [journey,       setJourney]       = useState(() => load(KEYS.journey,       DEFAULTS.journey));
  const [values,        setValues]        = useState(() => load(KEYS.values,        DEFAULTS.values));
  const [team,          setTeam]          = useState(() => load(KEYS.team,          DEFAULTS.team));
  const [ctaBg,         setCtaBg]         = useState(() => load(KEYS.ctaBg,         DEFAULTS.ctaBg));
  const [saved,         setSaved]         = useState(false);

  // ── Save all ──────────────────────────────────────────────────────────────
  const saveAll = () => {
    localStorage.setItem(KEYS.heroBg,        JSON.stringify(heroBg));
    localStorage.setItem(KEYS.storyMain,     JSON.stringify(storyMain));
    localStorage.setItem(KEYS.storyTopRight, JSON.stringify(storyTopRight));
    localStorage.setItem(KEYS.storyBotRight, JSON.stringify(storyBotRight));
    localStorage.setItem(KEYS.gallery,       JSON.stringify(gallery));
    localStorage.setItem(KEYS.journey,       JSON.stringify(journey));
    localStorage.setItem(KEYS.values,        JSON.stringify(values));
    localStorage.setItem(KEYS.team,          JSON.stringify(team));
    localStorage.setItem(KEYS.ctaBg,         JSON.stringify(ctaBg));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const resetAll = () => {
    Object.values(KEYS).forEach(k => localStorage.removeItem(k));
    setHeroBg(DEFAULTS.heroBg);
    setStoryMain(DEFAULTS.storyMain);
    setStoryTopRight(DEFAULTS.storyTopRight);
    setStoryBotRight(DEFAULTS.storyBotRight);
    setGallery(DEFAULTS.gallery);
    setJourney(DEFAULTS.journey);
    setValues(DEFAULTS.values);
    setTeam(DEFAULTS.team);
    setCtaBg(DEFAULTS.ctaBg);
  };

  // ── Helpers for array fields ──────────────────────────────────────────────
  const updateGallery  = (i, val) => setGallery(g => g.map((v, j) => j === i ? val : v));
  const updateJourney  = (i, field, val) => setJourney(j => j.map((v, k) => k === i ? { ...v, [field]: val } : v));
  const updateValues   = (i, field, val) => setValues(v => v.map((x, k) => k === i ? { ...x, [field]: val } : x));
  const updateTeam     = (i, field, val) => setTeam(t => t.map((x, k) => k === i ? { ...x, [field]: val } : x));

  return (
    <AdminLayout title="Our Story Images">
      {/* Info banner */}
      <div style={{ marginBottom: 24, padding: "14px 18px",
        background: "rgba(201,168,76,0.05)", border: "1px solid rgba(201,168,76,0.2)",
        fontFamily: "'Cormorant Garamond',serif", fontSize: 13,
        color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>
        ★ Manage all images on the <strong style={{ color: C.gold }}>/about</strong> (Our Story) page.
        Paste any image URL — changes are saved in your browser and applied instantly on reload.
      </div>

      {/* ── 1. Hero Background ───────────────────────────────────────────── */}
      <div style={card}>
        <div style={sectionTitle}>1 · Hero Banner Background</div>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginBottom: 16, fontFamily: "'Cormorant Garamond',serif" }}>
          Full-bleed background shown behind the "Our Story" headline at the top of the About page.
        </p>
        <ImageField label="HERO BACKGROUND IMAGE URL" value={heroBg} onChange={setHeroBg} aspect="16/9" height={80} />
      </div>

      <div style={divider} />

      {/* ── 2. Origin Story Grid ─────────────────────────────────────────── */}
      <div style={card}>
        <div style={sectionTitle}>2 · Origin Story Image Grid</div>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginBottom: 20, fontFamily: "'Cormorant Garamond',serif" }}>
          Three images displayed as a grid beside the brand origin text. Main image is tall (portrait), the two smaller ones stack on the right.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
          {/* Main */}
          <div style={{ gridRow: "span 2" }}>
            <label style={label}>MAIN IMAGE (tall, 3:4)</label>
            <div style={{ aspectRatio: "3/4", background: "#0a0603", border: "1px solid rgba(201,168,76,0.15)", overflow: "hidden", marginBottom: 8 }}>
              <img src={storyMain} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }}
                onError={e => { e.target.style.display = "none"; }} />
            </div>
            <input value={storyMain} onChange={e => setStoryMain(e.target.value)}
              placeholder="https://..." style={input} />
          </div>
          {/* Top right */}
          <div>
            <label style={label}>TOP RIGHT IMAGE (1:1)</label>
            <div style={{ aspectRatio: "1/1", background: "#0a0603", border: "1px solid rgba(201,168,76,0.15)", overflow: "hidden", marginBottom: 8 }}>
              <img src={storyTopRight} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }}
                onError={e => { e.target.style.display = "none"; }} />
            </div>
            <input value={storyTopRight} onChange={e => setStoryTopRight(e.target.value)}
              placeholder="https://..." style={input} />
          </div>
          {/* Bottom right */}
          <div>
            <label style={label}>BOTTOM RIGHT IMAGE (1:1)</label>
            <div style={{ aspectRatio: "1/1", background: "#0a0603", border: "1px solid rgba(201,168,76,0.15)", overflow: "hidden", marginBottom: 8 }}>
              <img src={storyBotRight} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }}
                onError={e => { e.target.style.display = "none"; }} />
            </div>
            <input value={storyBotRight} onChange={e => setStoryBotRight(e.target.value)}
              placeholder="https://..." style={input} />
          </div>
        </div>
      </div>

      <div style={divider} />

      {/* ── 3. Atelier Gallery Strip ──────────────────────────────────────── */}
      <div style={card}>
        <div style={sectionTitle}>3 · Atelier Gallery Strip (4 images)</div>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginBottom: 20, fontFamily: "'Cormorant Garamond',serif" }}>
          Full-width horizontal image strip displayed between the Origin Story and Journey sections.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 16 }}>
          {gallery.map((url, i) => (
            <div key={i} style={{ aspectRatio: "3/4", background: "#0a0603", border: "1px solid rgba(201,168,76,0.15)", overflow: "hidden" }}>
              <img src={url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }}
                onError={e => { e.target.style.display = "none"; }} />
            </div>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
          {gallery.map((url, i) => (
            <div key={i}>
              <label style={label}>GALLERY {i + 1}</label>
              <input value={url} onChange={e => updateGallery(i, e.target.value)}
                placeholder="https://..." style={input} />
            </div>
          ))}
        </div>
      </div>

      <div style={divider} />

      {/* ── 4. Journey / Timeline ─────────────────────────────────────────── */}
      <div style={card}>
        <div style={sectionTitle}>4 · Our Journey — Timeline Images</div>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginBottom: 20, fontFamily: "'Cormorant Garamond',serif" }}>
          Each milestone in the brand's history has an accompanying image.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 16 }}>
          {journey.map((item, i) => (
            <div key={i} style={{ border: "1px solid rgba(201,168,76,0.12)", overflow: "hidden" }}>
              <div style={{ height: 140, background: "#0a0603", overflow: "hidden", position: "relative" }}>
                <img src={item.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  onError={e => { e.target.style.display = "none"; }} />
                <div style={{ position: "absolute", bottom: 8, left: 12,
                  fontFamily: "'Playfair Display',serif", fontSize: 28,
                  color: "rgba(255,255,255,0.18)", lineHeight: 1 }}>{item.year}</div>
                <div style={{ position: "absolute", top: 8, right: 8,
                  background: C.gold, color: "#0f0c08", padding: "3px 8px",
                  fontSize: 9, letterSpacing: "0.12em", fontWeight: 700 }}>{item.year}</div>
              </div>
              <div style={{ padding: 14 }}>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginBottom: 8, fontFamily: "'Cormorant Garamond',serif" }}>
                  {item.title}
                </div>
                <label style={label}>IMAGE URL</label>
                <input value={item.image} onChange={e => updateJourney(i, "image", e.target.value)}
                  placeholder="https://..." style={input} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={divider} />

      {/* ── 5. Values Cards ───────────────────────────────────────────────── */}
      <div style={card}>
        <div style={sectionTitle}>5 · Brand Values — Card Images</div>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginBottom: 20, fontFamily: "'Cormorant Garamond',serif" }}>
          Background image shown at the top of each value card in the dark "What We Stand For" section.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
          {values.map((v, i) => (
            <div key={i} style={{ border: "1px solid rgba(201,168,76,0.12)", overflow: "hidden" }}>
              <div style={{ height: 130, background: "#0a0603", overflow: "hidden", position: "relative" }}>
                <img src={v.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  onError={e => { e.target.style.display = "none"; }} />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top,rgba(26,18,8,0.9) 0%,transparent 60%)" }} />
                <div style={{ position: "absolute", bottom: 10, left: 14, fontSize: 28 }}>{v.icon}</div>
              </div>
              <div style={{ padding: 14 }}>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginBottom: 8, fontFamily: "'Cormorant Garamond',serif" }}>
                  {v.title}
                </div>
                <label style={label}>IMAGE URL</label>
                <input value={v.image} onChange={e => updateValues(i, "image", e.target.value)}
                  placeholder="https://..." style={input} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={divider} />

      {/* ── 6. Team Portraits ─────────────────────────────────────────────── */}
      <div style={card}>
        <div style={sectionTitle}>6 · Team Portraits</div>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginBottom: 20, fontFamily: "'Cormorant Garamond',serif" }}>
          Portrait images for each team member in the "Minds Behind MAISON" section.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }}>
          {team.map((member, i) => (
            <div key={i} style={{ border: "1px solid rgba(201,168,76,0.12)", overflow: "hidden" }}>
              <div style={{ aspectRatio: "3/4", background: "#0a0603", overflow: "hidden", position: "relative" }}>
                <img src={member.image} alt={member.name}
                  style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top" }}
                  onError={e => { e.target.style.display = "none"; }} />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top,rgba(26,18,8,0.7) 0%,transparent 40%)" }} />
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 2,
                  background: `linear-gradient(90deg,transparent,${C.gold},transparent)` }} />
              </div>
              <div style={{ padding: 14 }}>
                <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 14, color: "#fff", marginBottom: 3 }}>{member.name}</div>
                <div style={{ fontSize: 10, letterSpacing: "0.12em", color: C.gold, marginBottom: 12 }}>{member.title.toUpperCase()}</div>
                <label style={label}>PORTRAIT URL</label>
                <input value={member.image} onChange={e => updateTeam(i, "image", e.target.value)}
                  placeholder="https://..." style={input} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={divider} />

      {/* ── 7. CTA Background ────────────────────────────────────────────── */}
      <div style={card}>
        <div style={sectionTitle}>7 · Call-to-Action Background</div>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginBottom: 16, fontFamily: "'Cormorant Garamond',serif" }}>
          Background image for the "Discover the Collection" banner at the bottom of the About page.
        </p>
        <ImageField label="CTA BACKGROUND IMAGE URL" value={ctaBg} onChange={setCtaBg} aspect="16/9" height={80} />
      </div>

      <div style={divider} />

      {/* ── Save / Reset bar ─────────────────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <button onClick={saveAll} style={{
          padding: "12px 32px",
          background: saved ? "#7ab87a" : C.gold,
          color: "#0f0c08", border: "none",
          fontSize: "10px", letterSpacing: "0.18em",
          cursor: "pointer", fontFamily: "inherit",
          fontWeight: 700, transition: "background 0.3s",
        }}>
          {saved ? "✓ SAVED" : "SAVE ALL CHANGES"}
        </button>
        <button onClick={resetAll} style={{
          padding: "12px 24px", background: "none",
          border: "1px solid rgba(255,255,255,0.12)",
          color: "rgba(255,255,255,0.4)", fontSize: "10px",
          letterSpacing: "0.16em", cursor: "pointer", fontFamily: "inherit",
        }}>
          RESET TO DEFAULTS
        </button>
        {saved && (
          <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 13,
            color: "#7ab87a", letterSpacing: "0.1em" }}>
            ✓ Saved — reload <a href="/about" target="_blank" rel="noreferrer"
              style={{ color: C.gold }}>/about</a> to see changes
          </div>
        )}
      </div>

      {/* ── Quick image reference ─────────────────────────────────────────── */}
      <div style={{ marginTop: 32, padding: "20px 24px",
        background: "linear-gradient(135deg,#0f0c08,#110e08)",
        border: "1px solid rgba(201,168,76,0.12)" }}>
        <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, color: "#fff", marginBottom: 16 }}>
          Quick Image Suggestions
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {[
            { label: "Atelier Interior",    url: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80&fit=crop" },
            { label: "Fabric Weaving",      url: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600&q=80&fit=crop" },
            { label: "Model — Women",       url: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&q=80&fit=crop" },
            { label: "Fashion Collection",  url: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=600&q=80&fit=crop" },
            { label: "Model — Men",         url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&q=80&fit=crop" },
            { label: "Luxury Garment",      url: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=800&q=80&fit=crop" },
            { label: "Designer Portrait",   url: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=600&q=80&fit=crop" },
            { label: "Tailor Workshop",     url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80&fit=crop" },
          ].map(item => (
            <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 40, height: 40, flexShrink: 0, overflow: "hidden", background: "#1a1208" }}>
                <img src={item.url} alt={item.label}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  onError={e => { e.target.style.display = "none"; }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", fontFamily: "'Cormorant Garamond',serif", marginBottom: 3 }}>
                  {item.label}
                </div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", fontFamily: "monospace",
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {item.url.slice(0, 50)}…
                </div>
              </div>
              <button
                onClick={() => navigator.clipboard.writeText(item.url)}
                style={{ padding: "4px 10px", background: "none",
                  border: "1px solid rgba(201,168,76,0.25)", color: C.gold,
                  fontSize: "9px", letterSpacing: "0.12em", cursor: "pointer",
                  fontFamily: "inherit", flexShrink: 0 }}>
                COPY
              </button>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}