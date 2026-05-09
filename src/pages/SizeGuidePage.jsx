import { useState } from "react";
import { C, GoldBar } from "../components/shared";

const WOMEN_SIZES = [
  { size: "XS", bust: "80–83", waist: "62–65", hips: "88–91" },
  { size: "S",  bust: "84–87", waist: "66–69", hips: "92–95" },
  { size: "M",  bust: "88–91", waist: "70–73", hips: "96–99" },
  { size: "L",  bust: "92–97", waist: "74–79", hips: "100–105" },
  { size: "XL", bust: "98–103", waist: "80–85", hips: "106–111" },
];
const MEN_SIZES = [
  { size: "S",   chest: "86–91", waist: "71–76", shoulder: "42–43" },
  { size: "M",   chest: "92–97", waist: "77–82", shoulder: "44–45" },
  { size: "L",   chest: "98–103", waist: "83–88", shoulder: "46–47" },
  { size: "XL",  chest: "104–109", waist: "89–94", shoulder: "48–49" },
  { size: "XXL", chest: "110–117", waist: "95–102", shoulder: "50–52" },
];

export default function SizeGuidePage({ onAuth }) {
  const [tab, setTab] = useState("women");

  return (
    <>
      <div style={{ minHeight: "100vh", background: C.bg, paddingTop: "100px" }}>
        <div style={{ textAlign: "center", padding: "48px 20px 60px" }}>
          <div style={{ fontSize: "9.5px", letterSpacing: "0.28em", color: C.gold, marginBottom: "14px" }}>FIND YOUR FIT</div>
          <h1 style={{ fontFamily: "'DM Serif Display',Georgia,serif", fontSize: "52px", fontWeight: 400, color: "#fff", marginBottom: "16px" }}>Size Guide</h1>
          <GoldBar centered />
          <p style={{ fontSize: "15px", color: "rgba(255,255,255,0.45)", maxWidth: "480px", margin: "0 auto", lineHeight: 1.8 }}>
            All measurements are in centimetres. When between sizes, we recommend sizing up.
          </p>
        </div>

        <div style={{ maxWidth: "860px", margin: "0 auto 80px", padding: "0 40px" }}>
          {/* Tabs */}
          <div style={{ display: "flex", borderBottom: "1px solid rgba(201,168,76,0.15)", marginBottom: "36px" }}>
            {["women", "men"].map(t => (
              <button key={t} onClick={() => setTab(t)} style={{ padding: "12px 28px", background: "none", border: "none", borderBottom: tab === t ? `2px solid ${C.gold}` : "2px solid transparent", color: tab === t ? C.gold : "rgba(255,255,255,0.4)", fontSize: "10px", letterSpacing: "0.2em", cursor: "pointer", fontFamily: "inherit", marginBottom: "-1px", transition: "all 0.2s" }}>
                {t.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Table */}
          <div style={{ background: C.surface, border: "1px solid rgba(201,168,76,0.15)" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(201,168,76,0.15)" }}>
                  {(tab === "women" ? ["Size", "Bust (cm)", "Waist (cm)", "Hips (cm)"] : ["Size", "Chest (cm)", "Waist (cm)", "Shoulder (cm)"]).map(h => (
                    <th key={h} style={{ padding: "16px 24px", textAlign: "left", fontSize: "9px", letterSpacing: "0.2em", color: C.gold, fontWeight: 400 }}>{h.toUpperCase()}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(tab === "women" ? WOMEN_SIZES : MEN_SIZES).map((row, i) => (
                  <tr key={row.size} style={{ borderBottom: i < 4 ? "1px solid rgba(255,255,255,0.04)" : "none", transition: "background 0.15s" }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(201,168,76,0.04)"}
                    onMouseLeave={e => e.currentTarget.style.background = ""}>
                    <td style={{ padding: "16px 24px", fontFamily: "'DM Serif Display',Georgia,serif", fontSize: "16px", color: C.gold }}>{row.size}</td>
                    {Object.entries(row).filter(([k]) => k !== "size").map(([k, v]) => (
                      <td key={k} style={{ padding: "16px 24px", fontSize: "14px", color: "rgba(255,255,255,0.65)" }}>{v}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Tips */}
          <div style={{ marginTop: "36px", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
            {[
              { icon: "📏", title: "How to Measure", text: "Use a soft tape measure. Keep it snug but not tight. Measure over underwear or light clothing." },
              { icon: "🧵", title: "Fit Philosophy", text: "MAISON pieces are cut for a tailored fit. We suggest sizing up if you prefer a relaxed silhouette." },
              { icon: "🔄", title: "Easy Returns", text: "Not the right fit? Exchange within 14 days. See our Returns & Exchange policy for details." },
            ].map(tip => (
              <div key={tip.title} style={{ padding: "24px", background: C.surface, border: "1px solid rgba(201,168,76,0.1)" }}>
                <div style={{ fontSize: "24px", marginBottom: "12px" }}>{tip.icon}</div>
                <div style={{ fontFamily: "'DM Serif Display',Georgia,serif", fontSize: "14px", color: "#fff", marginBottom: "8px" }}>{tip.title}</div>
                <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.45)", lineHeight: 1.7 }}>{tip.text}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
