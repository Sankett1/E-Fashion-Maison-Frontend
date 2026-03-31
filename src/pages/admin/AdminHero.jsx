import { useState, useEffect } from "react";
import AdminLayout from "./AdminLayout";
import { C } from "../../components/shared";

// Default collection card data — matches HeroPage.jsx
const DEFAULT_CARDS = [
  { id: "card1", eye: "SHARP & REFINED",  name: "Tailoring",   link: "/shop?category=Men&sub=Suits",  image: "https://images.unsplash.com/photo-1617137968427-85924c800a22?w=800&q=80&fit=crop" },
  { id: "card2", eye: "EFFORTLESS STYLE", name: "Casual Luxe", link: "/shop?category=Women",          image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80&fit=crop" },
  { id: "card3", eye: "FINAL TOUCHES",    name: "Accessories", link: "/shop?category=Accessories",    image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80&fit=crop" },
];

const STORAGE_KEY = "maison_hero_cards";

export default function AdminHero() {
  const [cards, setCards] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_CARDS;
    } catch { return DEFAULT_CARDS; }
  });
  const [saved, setSaved] = useState(false);
  const [editing, setEditing] = useState(null); // index being edited

  const update = (index, field, value) => {
    setCards(prev => prev.map((c, i) => i === index ? { ...c, [field]: value } : c));
  };

  const save = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const reset = () => {
    setCards(DEFAULT_CARDS);
    localStorage.removeItem(STORAGE_KEY);
  };

  const inputStyle = {
    width: "100%", padding: "10px 13px",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(201,168,76,0.2)",
    color: "#fff", fontSize: "12px",
    outline: "none", fontFamily: "inherit",
    boxSizing: "border-box",
  };

  const labelStyle = {
    display: "block", fontSize: "9px",
    letterSpacing: "0.18em", color: "rgba(255,255,255,0.4)",
    marginBottom: "6px",
  };

  return (
    <AdminLayout title="Hero Settings">
      <div style={{ marginBottom: 24, padding: "14px 18px",
        background: "rgba(201,168,76,0.05)", border: "1px solid rgba(201,168,76,0.2)",
        fontFamily: "'Cormorant Garamond',serif", fontSize: "13px",
        color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>
        ★ Changes here update the 3 collection cards on the homepage. Paste any image URL
        (Unsplash, Cloudinary, etc.) — the card will display it immediately.
        Changes are saved in the browser and persist across sessions.
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20, marginBottom: 32 }}>
        {cards.map((card, i) => (
          <div key={card.id} style={{
            background: "linear-gradient(135deg,#0f0c08,#110e08)",
            border: `1px solid ${editing === i ? C.gold : "rgba(201,168,76,0.15)"}`,
            transition: "border-color 0.2s",
          }}>
            {/* Image preview */}
            <div style={{ position: "relative", aspectRatio: "3/4", overflow: "hidden",
              background: "linear-gradient(135deg,#1a1208,#2a1e0a)" }}>
              {card.image && (
                <img src={card.image} alt={card.name}
                  style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
                  onError={e => { e.target.style.display = "none"; }}
                />
              )}
              {/* Overlay */}
              <div style={{ position: "absolute", inset: 0,
                background: "linear-gradient(to top,rgba(0,0,0,0.7) 0%,transparent 50%)" }} />
              <div style={{ position: "absolute", bottom: 20, left: 20, right: 20 }}>
                <div style={{ fontSize: "8px", letterSpacing: "0.24em",
                  color: "rgba(255,255,255,0.6)", marginBottom: 6,
                  fontFamily: "'Cormorant Garamond',serif" }}>
                  {card.eye}
                </div>
                <div style={{ fontFamily: "'Playfair Display',serif",
                  fontSize: 22, fontWeight: 500, color: "#fff" }}>
                  {card.name}
                </div>
              </div>
              {/* Card number badge */}
              <div style={{ position: "absolute", top: 14, left: 14,
                background: C.gold, color: "#0f0c08",
                width: 24, height: 24, borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "11px", fontWeight: 700 }}>
                {i + 1}
              </div>
            </div>

            {/* Edit fields */}
            <div style={{ padding: 20 }} onClick={() => setEditing(i)}>
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>IMAGE URL</label>
                <input
                  value={card.image}
                  onChange={e => update(i, "image", e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  style={inputStyle}
                />
                <div style={{ marginTop: 6, fontSize: "10px", color: "rgba(255,255,255,0.25)",
                  fontFamily: "'Cormorant Garamond',serif" }}>
                  Paste any image URL — updates preview instantly
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
                <div>
                  <label style={labelStyle}>CARD TITLE</label>
                  <input value={card.name} onChange={e => update(i, "name", e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>EYEBROW TEXT</label>
                  <input value={card.eye} onChange={e => update(i, "eye", e.target.value)} style={inputStyle} />
                </div>
              </div>

              <div>
                <label style={labelStyle}>CLICK DESTINATION (URL PATH)</label>
                <input value={card.link} onChange={e => update(i, "link", e.target.value)}
                  placeholder="/shop?category=Women" style={inputStyle} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Save bar */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <button onClick={save} style={{
          padding: "12px 32px", background: saved ? "#7ab87a" : C.gold,
          color: "#0f0c08", border: "none", fontSize: "10px",
          letterSpacing: "0.18em", cursor: "pointer",
          fontFamily: "inherit", fontWeight: 700,
          transition: "background 0.3s",
        }}>
          {saved ? "✓ SAVED" : "SAVE CHANGES"}
        </button>
        <button onClick={reset} style={{
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
            ✓ Changes saved — reload homepage to see them
          </div>
        )}
      </div>

      {/* Quick URL reference */}
      <div style={{ marginTop: 32, padding: "20px 24px",
        background: "linear-gradient(135deg,#0f0c08,#110e08)",
        border: "1px solid rgba(201,168,76,0.12)" }}>
        <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 16,
          color: "#fff", marginBottom: 16 }}>Quick Image Sources</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {[
            { label: "Men's Suit", url: "https://images.unsplash.com/photo-1617137968427-85924c800a22?w=800&q=80&fit=crop" },
            { label: "Women's Coat", url: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80&fit=crop" },
            { label: "Leather Bag", url: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80&fit=crop" },
            { label: "Silk Dress", url: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80&fit=crop" },
            { label: "Accessories Flat", url: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&q=80&fit=crop" },
            { label: "Men's Casual", url: "https://images.unsplash.com/photo-1520975916090-8105d898b5a1?w=800&q=80&fit=crop" },
          ].map(item => (
            <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 40, height: 40, flexShrink: 0, overflow: "hidden",
                background: "#1a1208" }}>
                <img src={item.url} alt={item.label}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  onError={e => { e.target.style.display = "none"; }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)",
                  fontFamily: "'Cormorant Garamond',serif", marginBottom: 3 }}>
                  {item.label}
                </div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.25)",
                  fontFamily: "monospace", overflow: "hidden",
                  textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
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
