import { useState, useEffect, useRef } from "react";
import AdminLayout from "./AdminLayout";
import { C } from "../../components/shared";
import {
  getAboutContent,
  updateHeroImage, updateCtaImage, updateStorySlot,
  addAtelierImage, removeAtelierImage,
  addJourneyItem, updateJourneyItem, deleteJourneyItem,
  updateValueImage, updateTeamMemberApi,
} from "../../api/adminApi";

// ─────────────────────────────────────────────────────────────────────────────
// Fallback Unsplash images used when DB has no image yet
// ─────────────────────────────────────────────────────────────────────────────
const DEFAULTS = {
  hero:        "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&q=80&fit=crop",
  storyMain:   "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=600&q=80&fit=crop",
  storyTop:    "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&q=80&fit=crop",
  storyBottom: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=600&q=80&fit=crop",
  cta:         "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1200&q=80&fit=crop",
};

const FALLBACK_JOURNEY = [
  { year:"2014", title:"The Beginning",   text:"A small studio in Bandra, a big vision." },
  { year:"2016", title:"First Collection",text:"Our debut collection of 12 pieces sells out in 48 hours." },
  { year:"2019", title:"BKC Atelier",     text:"MAISON moves to its flagship atelier in Mumbai's BKC." },
  { year:"2022", title:"Going Global",    text:"International shipping launches across 28 countries." },
  { year:"2024", title:"50K Community",   text:"Our community crosses 50,000 discerning clients." },
];

const FALLBACK_VALUES = [
  { icon:"🧵", title:"Artisan First",      text:"Every garment conceived with Indian master craftspeople." },
  { icon:"🌿", title:"Responsible Craft",  text:"GOTS-certified farms and low-impact dyes." },
  { icon:"♾️", title:"Timeless by Design", text:"We design against trends — built to outlast seasons." },
];

const FALLBACK_TEAM = [
  { name:"Aarav Shah",   title:"Founder & Creative Director" },
  { name:"Meera Pillai", title:"Head of Design" },
  { name:"Rahul Desai",  title:"Master Tailor" },
];

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

const GOLD_LINE = (
  <div style={{ height:1, background:"linear-gradient(90deg,transparent,rgba(201,168,76,0.3),transparent)", margin:"32px 0" }}/>
);

function SectionHeader({ title, sub }) {
  return (
    <div style={{ marginBottom:28 }}>
      <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:22, fontWeight:400, color:"#fff", margin:"0 0 4px" }}>{title}</h2>
      {sub && <p style={{ fontSize:11, letterSpacing:"0.14em", color:"rgba(255,255,255,0.3)" }}>{sub}</p>}
    </div>
  );
}

function Msg({ msg }) {
  if (!msg) return null;
  return (
    <div style={{ padding:"10px 16px", marginTop:8,
      background: msg.type==="ok" ? "rgba(122,184,122,0.08)" : "rgba(220,100,100,0.08)",
      border:`1px solid ${msg.type==="ok" ? "rgba(122,184,122,0.3)" : "rgba(220,100,100,0.3)"}`,
      fontFamily:"'Cormorant Garamond',serif", fontSize:13,
      color: msg.type==="ok" ? "#7ab87a" : "#e07070" }}>
      {msg.text}
    </div>
  );
}

// Single image uploader card
function ImageUploadCard({ label, currentUrl, fallbackUrl, onUpload, uploading, aspect="4/3", note="" }) {
  const fileRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  const src = preview || currentUrl || fallbackUrl;

  const handleFile = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    setPreview(URL.createObjectURL(file));
    onUpload(file);
  };

  const handleDrop = (e) => {
    e.preventDefault(); setDragOver(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  return (
    <div style={{ background:"rgba(255,255,255,0.02)", border:"1px solid rgba(201,168,76,0.15)", padding:20 }}>
      <div style={{ fontSize:10, letterSpacing:"0.18em", color:"rgba(255,255,255,0.45)", marginBottom:12 }}>
        {label.toUpperCase()}
      </div>

      {/* Preview */}
      <div style={{ aspectRatio:aspect, background:"#111", marginBottom:12, position:"relative", overflow:"hidden",
          border:`2px dashed ${dragOver ? C.gold : "rgba(201,168,76,0.2)"}`, cursor:"pointer", transition:"border-color 0.2s" }}
        onClick={() => fileRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}>
        {src
          ? <img src={src} alt={label} style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
          : <div style={{ width:"100%", height:"100%", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:8, color:"rgba(255,255,255,0.2)" }}>
              <span style={{ fontSize:28 }}>🖼️</span>
              <span style={{ fontSize:10, letterSpacing:"0.16em" }}>DROP OR CLICK</span>
            </div>
        }
        {uploading && (
          <div style={{ position:"absolute", inset:0, background:"rgba(0,0,0,0.65)", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <div style={{ width:28, height:28, border:`2px solid ${C.gold}`, borderTopColor:"transparent", borderRadius:"50%", animation:"stSpin 0.7s linear infinite" }}/>
          </div>
        )}
        {dragOver && (
          <div style={{ position:"absolute", inset:0, background:"rgba(201,168,76,0.1)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, letterSpacing:"0.16em", color:C.gold }}>
            DROP IMAGE HERE
          </div>
        )}
      </div>

      <input ref={fileRef} type="file" accept="image/*" style={{ display:"none" }}
        onChange={e => handleFile(e.target.files[0])} />

      <button onClick={() => fileRef.current?.click()} disabled={uploading}
        style={{ width:"100%", padding:"9px 0", background:"transparent", border:`1px solid ${C.gold}`,
          color:C.gold, fontFamily:"'Cormorant Garamond',serif", fontSize:10, letterSpacing:"0.18em",
          cursor: uploading ? "not-allowed" : "pointer", opacity: uploading ? 0.6 : 1, transition:"all 0.2s" }}
        onMouseEnter={e => { if(!uploading){ e.currentTarget.style.background="rgba(201,168,76,0.08)"; }}}
        onMouseLeave={e => e.currentTarget.style.background="transparent"}>
        {uploading ? "UPLOADING…" : "CHANGE IMAGE"}
      </button>
      {note && <p style={{ fontSize:10, color:"rgba(255,255,255,0.25)", marginTop:6, lineHeight:1.5 }}>{note}</p>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────
export default function AdminStory() {
  const [content,  setContent]  = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [tab,      setTab]      = useState("hero");
  const [msgs,     setMsgs]     = useState({});
  const [busy,     setBusy]     = useState({});

  // Journey form state
  const [jForm, setJForm] = useState({ year:"", title:"", text:"" });
  const [jFile, setJFile] = useState(null);
  const [jEdit, setJEdit] = useState(null); // id of item being edited

  useEffect(() => {
    getAboutContent()
      .then(d => setContent(d.content))
      .catch(() => setContent(null))
      .finally(() => setLoading(false));
  }, []);

  const setMsg  = (key, type, text) => {
    setMsgs(m => ({ ...m, [key]: { type, text } }));
    setTimeout(() => setMsgs(m => { const n={...m}; delete n[key]; return n; }), 4000);
  };
  const setBusyKey = (key, v) => setBusy(b => ({ ...b, [key]: v }));

  const handleUpload = async (apiCall, msgKey) => {
    setBusyKey(msgKey, true);
    try {
      const res = await apiCall();
      // Refresh content
      const fresh = await getAboutContent();
      setContent(fresh.content);
      setMsg(msgKey, "ok", "Image updated successfully.");
    } catch (err) {
      setMsg(msgKey, "err", err.response?.data?.message || "Upload failed.");
    } finally { setBusyKey(msgKey, false); }
  };

  const TABS = [
    { key:"hero",    label:"Hero & CTA" },
    { key:"story",   label:"Origin Story" },
    { key:"atelier", label:"Gallery" },
    { key:"journey", label:"Journey" },
    { key:"values",  label:"Values" },
    { key:"team",    label:"Team" },
  ];

  const journeyItems = content?.journeyItems?.length ? content.journeyItems : FALLBACK_JOURNEY;
  const values       = content?.values?.length       ? content.values       : FALLBACK_VALUES;
  const team         = content?.team?.length         ? content.team         : FALLBACK_TEAM;

  return (
    <AdminLayout title="Our Story — Image Manager">
      <style>{`
        @keyframes stSpin { to { transform: rotate(360deg); } }
        .st-tab { padding:10px 20px; background:none; border:none; cursor:pointer; font:300 10px/1 'Cormorant Garamond',serif; letter-spacing:.16em; border-bottom:2px solid transparent; color:rgba(255,255,255,0.4); transition:all .2s; }
        .st-tab.on { color:#c9a84c; border-bottom-color:#c9a84c; }
        .st-tab:hover:not(.on) { color:rgba(255,255,255,0.7); }
        .st-input { width:100%; padding:10px 14px; background:rgba(255,255,255,0.04); border:1px solid rgba(201,168,76,0.2); color:#fff; font-family:'Cormorant Garamond',serif; font-size:14px; outline:none; box-sizing:border-box; transition:border-color .2s; }
        .st-input:focus { border-color:#c9a84c; }
        .st-textarea { width:100%; padding:10px 14px; background:rgba(255,255,255,0.04); border:1px solid rgba(201,168,76,0.2); color:#fff; font-family:'Cormorant Garamond',serif; font-size:14px; outline:none; box-sizing:border-box; resize:vertical; transition:border-color .2s; }
        .st-textarea:focus { border-color:#c9a84c; }
      `}</style>

      {/* Banner */}
      <div style={{ background:"linear-gradient(90deg,rgba(201,168,76,0.08),rgba(201,168,76,0.03))", border:"1px solid rgba(201,168,76,0.15)", padding:"16px 24px", marginBottom:32, display:"flex", alignItems:"center", gap:16 }}>
        <span style={{ fontSize:20 }}>🖼️</span>
        <div>
          <div style={{ fontSize:12, color:C.gold, letterSpacing:"0.14em", marginBottom:2 }}>ABOUT PAGE — IMAGE MANAGEMENT</div>
          <div style={{ fontSize:11, color:"rgba(255,255,255,0.35)", letterSpacing:"0.06em" }}>Upload and replace all images that appear on the public Our Story / About page</div>
        </div>
      </div>

      {loading ? (
        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", padding:"80px 0", gap:12 }}>
          <div style={{ width:28, height:28, border:`2px solid ${C.gold}`, borderTopColor:"transparent", borderRadius:"50%", animation:"stSpin 0.7s linear infinite" }}/>
          <span style={{ fontSize:12, letterSpacing:"0.16em", color:"rgba(255,255,255,0.3)" }}>LOADING…</span>
        </div>
      ) : (
        <>
          {/* Tab bar */}
          <div style={{ display:"flex", flexWrap:"wrap", borderBottom:"1px solid rgba(201,168,76,0.15)", marginBottom:36, gap:0 }}>
            {TABS.map(t => (
              <button key={t.key} className={`st-tab${tab===t.key?" on":""}`} onClick={() => setTab(t.key)}>
                {t.label.toUpperCase()}
              </button>
            ))}
          </div>

          {/* ── HERO & CTA ── */}
          {tab === "hero" && (
            <div>
              <SectionHeader title="Hero & CTA Backgrounds" sub="Full-width background images displayed in the page hero and call-to-action sections" />
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:24 }}>
                <div>
                  <ImageUploadCard
                    label="Hero Background (top of page)"
                    currentUrl={content?.heroImage?.url}
                    fallbackUrl={DEFAULTS.hero}
                    aspect="16/9"
                    note="Recommended: 1600×900px or larger. This image is animated with a slow Ken Burns zoom."
                    uploading={busy.hero}
                    onUpload={file => handleUpload(() => updateHeroImage(file), "hero")}
                  />
                  <Msg msg={msgs.hero} />
                </div>
                <div>
                  <ImageUploadCard
                    label="CTA Background (bottom of page)"
                    currentUrl={content?.ctaImage?.url}
                    fallbackUrl={DEFAULTS.cta}
                    aspect="16/9"
                    note="Recommended: 1400×800px or larger. Appears behind the 'Discover the Collection' CTA section."
                    uploading={busy.cta}
                    onUpload={file => handleUpload(() => updateCtaImage(file), "cta")}
                  />
                  <Msg msg={msgs.cta} />
                </div>
              </div>
            </div>
          )}

          {/* ── ORIGIN STORY ── */}
          {tab === "story" && (
            <div>
              <SectionHeader title="Origin Story Section" sub="3-image grid displayed alongside the founder text. The 'main' image is tall (3:4 ratio); the two right images are square." />
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:24 }}>
                {[
                  { slot:"main",        label:"Main (Large Left)",  fallback:DEFAULTS.storyMain,   aspect:"3/4",  note:"Portrait image occupying 2 grid rows. Recommended: 600×800px." },
                  { slot:"topRight",    label:"Top Right (Square)", fallback:DEFAULTS.storyTop,    aspect:"1/1",  note:"Square image. Recommended: 600×600px." },
                  { slot:"bottomRight", label:"Bottom Right (Square)", fallback:DEFAULTS.storyBottom, aspect:"1/1", note:"Square image. Recommended: 600×600px." },
                ].map(({ slot, label, fallback, aspect, note }) => (
                  <div key={slot}>
                    <ImageUploadCard
                      label={label}
                      currentUrl={content?.storyImages?.[slot]?.url}
                      fallbackUrl={fallback}
                      aspect={aspect}
                      note={note}
                      uploading={busy[`story_${slot}`]}
                      onUpload={file => handleUpload(() => updateStorySlot(slot, file), `story_${slot}`)}
                    />
                    <Msg msg={msgs[`story_${slot}`]} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── ATELIER GALLERY ── */}
          {tab === "atelier" && (
            <div>
              <SectionHeader title="Atelier Gallery Strip" sub={`Full-width image strip. Currently ${content?.atelierGallery?.length || 0}/8 images. Drag & drop or click to upload. Delete with the × button.`} />

              {/* Current gallery */}
              {content?.atelierGallery?.length > 0 ? (
                <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:28 }}>
                  {content.atelierGallery.map((img, i) => (
                    <div key={img.public_id || i} style={{ position:"relative", aspectRatio:"4/3", overflow:"hidden",
                      border:"1px solid rgba(201,168,76,0.2)", background:"#111" }}>
                      <img src={img.url} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                      <div style={{ position:"absolute", top:0, left:0, right:0, padding:"6px 8px", background:"linear-gradient(to bottom,rgba(0,0,0,0.7),transparent)", fontSize:9, letterSpacing:"0.14em", color:"rgba(255,255,255,0.6)" }}>
                        #{i+1}
                      </div>
                      <button
                        onClick={() => handleUpload(() => removeAtelierImage(img.public_id), `atelier_del_${i}`)}
                        disabled={busy[`atelier_del_${i}`]}
                        style={{ position:"absolute", top:6, right:6, width:26, height:26, borderRadius:"50%", background:"rgba(220,80,80,0.85)", border:"none", color:"#fff", cursor:"pointer", fontSize:14, display:"flex", alignItems:"center", justifyContent:"center", transition:"transform 0.15s" }}
                        onMouseEnter={e => e.currentTarget.style.transform="scale(1.15)"}
                        onMouseLeave={e => e.currentTarget.style.transform="scale(1)"}>
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ padding:"32px 0", textAlign:"center", color:"rgba(255,255,255,0.25)", fontSize:13, letterSpacing:"0.12em", marginBottom:20 }}>
                  No gallery images yet — add your first image below
                </div>
              )}

              {/* Add new */}
              {(content?.atelierGallery?.length || 0) < 8 && (
                <div style={{ border:"1px solid rgba(201,168,76,0.15)", padding:24, background:"rgba(255,255,255,0.01)" }}>
                  <div style={{ fontSize:10, letterSpacing:"0.18em", color:"rgba(255,255,255,0.4)", marginBottom:16 }}>ADD GALLERY IMAGE</div>
                  <AtelierUploader onUpload={async (file, label) => {
                    setBusyKey("atelier_add", true);
                    try {
                      await addAtelierImage(file, label);
                      const fresh = await getAboutContent();
                      setContent(fresh.content);
                      setMsg("atelier_add", "ok", "Image added to gallery.");
                    } catch (err) {
                      setMsg("atelier_add", "err", err.response?.data?.message || "Upload failed.");
                    } finally { setBusyKey("atelier_add", false); }
                  }} uploading={busy.atelier_add} />
                  <Msg msg={msgs.atelier_add} />
                </div>
              )}
            </div>
          )}

          {/* ── JOURNEY ── */}
          {tab === "journey" && (
            <div>
              <SectionHeader title="Journey Timeline" sub="Milestones displayed in the alternating timeline section. Sorted by year automatically." />

              {/* Existing items */}
              <div style={{ display:"flex", flexDirection:"column", gap:16, marginBottom:32 }}>
                {journeyItems.map((item, i) => {
                  const isEditing = jEdit === (item._id || item.year);
                  return (
                    <div key={item._id || item.year} style={{ background:"rgba(255,255,255,0.02)", border:"1px solid rgba(201,168,76,0.15)", padding:20 }}>
                      <div style={{ display:"flex", gap:20, alignItems:"flex-start" }}>
                        {/* thumb */}
                        <div style={{ width:80, aspectRatio:"16/10", flexShrink:0, background:"#111", position:"relative", overflow:"hidden" }}>
                          {item.image?.url && <img src={item.image.url} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }}/>}
                          {!item.image?.url && item.image && <span style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", fontSize:9, color:"rgba(255,255,255,0.3)", letterSpacing:"0.1em" }}>NO IMG</span>}
                          <div style={{ position:"absolute", bottom:2, left:4, fontFamily:"'Playfair Display',serif", fontSize:16, color:"rgba(255,255,255,0.15)", fontWeight:400 }}>{item.year}</div>
                        </div>

                        {isEditing ? (
                          <JourneyEditForm
                            initial={item}
                            onSave={async (body, file) => {
                              setBusyKey(`je_${item._id}`, true);
                              try {
                                await updateJourneyItem(item._id, file || null, body);
                                const fresh = await getAboutContent(); setContent(fresh.content);
                                setMsg("journey", "ok", "Journey item updated."); setJEdit(null);
                              } catch { setMsg("journey", "err", "Update failed."); }
                              finally { setBusyKey(`je_${item._id}`, false); }
                            }}
                            onCancel={() => setJEdit(null)}
                            uploading={busy[`je_${item._id}`]}
                          />
                        ) : (
                          <div style={{ flex:1 }}>
                            <div style={{ fontSize:10, letterSpacing:"0.22em", color:C.gold, marginBottom:4 }}>{item.year}</div>
                            <div style={{ fontFamily:"'Playfair Display',serif", fontSize:16, color:"#fff", marginBottom:4 }}>{item.title}</div>
                            <div style={{ fontSize:13, color:"rgba(255,255,255,0.4)", lineHeight:1.6 }}>{item.text}</div>
                          </div>
                        )}

                        {!isEditing && item._id && (
                          <div style={{ display:"flex", gap:8, flexShrink:0 }}>
                            <button onClick={() => { setJEdit(item._id); setJForm({ year:item.year, title:item.title, text:item.text }); }}
                              style={{ padding:"6px 14px", background:"transparent", border:`1px solid ${C.gold}`, color:C.gold, fontSize:9, letterSpacing:"0.16em", cursor:"pointer", fontFamily:"'Cormorant Garamond',serif" }}>
                              EDIT
                            </button>
                            <button onClick={async () => {
                              if (!confirm("Delete this journey item?")) return;
                              await deleteJourneyItem(item._id);
                              const fresh = await getAboutContent(); setContent(fresh.content);
                              setMsg("journey", "ok", "Item deleted.");
                            }} style={{ padding:"6px 14px", background:"transparent", border:"1px solid rgba(220,100,100,0.4)", color:"#e07070", fontSize:9, letterSpacing:"0.16em", cursor:"pointer", fontFamily:"'Cormorant Garamond',serif" }}>
                              DEL
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <Msg msg={msgs.journey} />
              {GOLD_LINE}

              {/* Add new journey item */}
              <SectionHeader title="Add New Milestone" />
              <JourneyAddForm
                onAdd={async (body, file) => {
                  setBusyKey("journey_add", true);
                  try {
                    await addJourneyItem(file || null, body);
                    const fresh = await getAboutContent(); setContent(fresh.content);
                    setMsg("journey_add", "ok", "Milestone added.");
                  } catch (err) { setMsg("journey_add", "err", err.response?.data?.message || "Failed."); }
                  finally { setBusyKey("journey_add", false); }
                }}
                uploading={busy.journey_add}
              />
              <Msg msg={msgs.journey_add} />
            </div>
          )}

          {/* ── VALUES ── */}
          {tab === "values" && (
            <div>
              <SectionHeader title="Values Section" sub="3 brand value cards with images displayed on the dark section." />
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:24 }}>
                {[0,1,2].map(idx => {
                  const v = values[idx] || {};
                  return (
                    <div key={idx}>
                      <ImageUploadCard
                        label={`Value ${idx+1} — ${v.title || "Untitled"}`}
                        currentUrl={v.image?.url}
                        aspect="4/3"
                        note="Appears behind value card header. Recommended: 600×450px."
                        uploading={busy[`val_${idx}`]}
                        onUpload={file => handleUpload(() => updateValueImage(idx, file), `val_${idx}`)}
                      />
                      <div style={{ marginTop:12, padding:"12px 16px", background:"rgba(255,255,255,0.02)", border:"1px solid rgba(201,168,76,0.1)" }}>
                        <div style={{ fontSize:18, marginBottom:4 }}>{v.icon || "—"}</div>
                        <div style={{ fontFamily:"'Playfair Display',serif", fontSize:14, color:"#fff", marginBottom:3 }}>{v.title || "—"}</div>
                        <div style={{ fontSize:11, color:"rgba(255,255,255,0.35)", lineHeight:1.5 }}>{v.text || "—"}</div>
                      </div>
                      <Msg msg={msgs[`val_${idx}`]} />
                    </div>
                  );
                })}
              </div>
              <div style={{ marginTop:16, padding:"12px 16px", background:"rgba(201,168,76,0.04)", border:"1px solid rgba(201,168,76,0.12)", fontSize:11, color:"rgba(255,255,255,0.3)", letterSpacing:"0.06em" }}>
                ℹ️ To edit value text and icons, update the <code style={{ color:C.gold }}>FALLBACK_VALUES</code> array in <code style={{ color:C.gold }}>AboutPage.jsx</code> or extend the API to include editable fields.
              </div>
            </div>
          )}

          {/* ── TEAM ── */}
          {tab === "team" && (
            <div>
              <SectionHeader title="Team Portraits" sub="3 team member profile photos displayed in the 'Minds Behind MAISON' section." />
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:24 }}>
                {[0,1,2].map(idx => {
                  const m = team[idx] || {};
                  return (
                    <div key={idx}>
                      <ImageUploadCard
                        label={`${m.name || `Team Member ${idx+1}`}`}
                        currentUrl={m.image?.url}
                        aspect="3/4"
                        note="Portrait photo, face centered. Recommended: 600×800px."
                        uploading={busy[`team_${idx}`]}
                        onUpload={file => handleUpload(() => updateTeamMemberApi(idx, file), `team_${idx}`)}
                      />
                      <div style={{ marginTop:10, padding:"10px 14px", background:"rgba(255,255,255,0.02)", border:"1px solid rgba(201,168,76,0.1)" }}>
                        <div style={{ fontFamily:"'Playfair Display',serif", fontSize:14, color:"#fff" }}>{m.name || `Member ${idx+1}`}</div>
                        <div style={{ fontSize:10, letterSpacing:"0.14em", color:C.gold, marginTop:2 }}>{m.title || "—"}</div>
                      </div>
                      <Msg msg={msgs[`team_${idx}`]} />
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </AdminLayout>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Atelier Upload sub-form
// ─────────────────────────────────────────────────────────────────────────────
function AtelierUploader({ onUpload, uploading }) {
  const fileRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [label,   setLabel]   = useState("");
  const [file,    setFile]    = useState(null);

  const handleFile = (f) => {
    if (!f || !f.type.startsWith("image/")) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleSubmit = () => {
    if (!file) return;
    onUpload(file, label);
    setFile(null); setPreview(null); setLabel("");
  };

  return (
    <div style={{ display:"flex", gap:20, alignItems:"flex-start", flexWrap:"wrap" }}>
      <div style={{ width:160, flexShrink:0 }}>
        <div style={{ aspectRatio:"4/3", background:"#0d0a06", border:`2px dashed ${preview?"rgba(201,168,76,0.5)":"rgba(201,168,76,0.2)"}`, cursor:"pointer", position:"relative", overflow:"hidden", transition:"border-color 0.2s" }}
          onClick={() => fileRef.current?.click()}>
          {preview
            ? <img src={preview} alt="preview" style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
            : <div style={{ width:"100%", height:"100%", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:6, color:"rgba(255,255,255,0.2)" }}>
                <span style={{ fontSize:22 }}>+</span>
                <span style={{ fontSize:9, letterSpacing:"0.14em" }}>SELECT IMAGE</span>
              </div>
          }
        </div>
        <input ref={fileRef} type="file" accept="image/*" style={{ display:"none" }} onChange={e => handleFile(e.target.files[0])}/>
      </div>
      <div style={{ flex:1, display:"flex", flexDirection:"column", gap:12 }}>
        <div>
          <label style={{ display:"block", fontSize:9, letterSpacing:"0.16em", color:"rgba(255,255,255,0.35)", marginBottom:6 }}>LABEL (OPTIONAL)</label>
          <input className="st-input" placeholder="e.g. Cutting room, Embroidery studio…" value={label} onChange={e => setLabel(e.target.value)} style={{ width:"100%", padding:"10px 14px", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(201,168,76,0.2)", color:"#fff", fontFamily:"'Cormorant Garamond',serif", fontSize:14, outline:"none", boxSizing:"border-box" }}/>
        </div>
        <button onClick={handleSubmit} disabled={!file || uploading}
          style={{ padding:"11px 24px", background: file ? C.gold : "rgba(201,168,76,0.2)", border:"none", color: file ? "#0f0c08" : "rgba(255,255,255,0.2)", fontFamily:"'Cormorant Garamond',serif", fontSize:10, letterSpacing:"0.18em", cursor: file && !uploading ? "pointer" : "not-allowed", alignSelf:"flex-start", transition:"all 0.2s" }}>
          {uploading ? "UPLOADING…" : "ADD TO GALLERY"}
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Journey Add Form
// ─────────────────────────────────────────────────────────────────────────────
function JourneyAddForm({ onAdd, uploading }) {
  const fileRef = useRef(null);
  const [form,    setForm]    = useState({ year:"", title:"", text:"" });
  const [file,    setFile]    = useState(null);
  const [preview, setPreview] = useState(null);

  const handleFile = (f) => {
    if (!f || !f.type.startsWith("image/")) return;
    setFile(f); setPreview(URL.createObjectURL(f));
  };

  const handleAdd = () => {
    if (!form.year || !form.title || !form.text) return;
    onAdd(form, file);
    setForm({ year:"", title:"", text:"" }); setFile(null); setPreview(null);
  };

  const inputStyle = { width:"100%", padding:"10px 14px", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(201,168,76,0.2)", color:"#fff", fontFamily:"'Cormorant Garamond',serif", fontSize:14, outline:"none", boxSizing:"border-box" };

  return (
    <div style={{ background:"rgba(255,255,255,0.02)", border:"1px solid rgba(201,168,76,0.15)", padding:24 }}>
      <div style={{ display:"grid", gridTemplateColumns:"120px 1fr", gap:20, alignItems:"flex-start" }}>
        {/* Image */}
        <div>
          <div style={{ fontSize:9, letterSpacing:"0.14em", color:"rgba(255,255,255,0.35)", marginBottom:8 }}>IMAGE</div>
          <div style={{ aspectRatio:"16/10", background:"#0d0a06", border:`2px dashed ${preview?"rgba(201,168,76,0.5)":"rgba(201,168,76,0.2)"}`, cursor:"pointer", position:"relative", overflow:"hidden" }}
            onClick={() => fileRef.current?.click()}>
            {preview
              ? <img src={preview} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
              : <div style={{ width:"100%", height:"100%", display:"flex", alignItems:"center", justifyContent:"center", color:"rgba(255,255,255,0.15)", fontSize:20 }}>+</div>
            }
          </div>
          <input ref={fileRef} type="file" accept="image/*" style={{ display:"none" }} onChange={e => handleFile(e.target.files[0])}/>
          <div style={{ fontSize:8, color:"rgba(255,255,255,0.2)", marginTop:4, textAlign:"center" }}>click to pick</div>
        </div>
        {/* Fields */}
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 2fr", gap:12 }}>
            <div>
              <label style={{ display:"block", fontSize:9, letterSpacing:"0.16em", color:"rgba(255,255,255,0.35)", marginBottom:6 }}>YEAR *</label>
              <input style={inputStyle} placeholder="2024" value={form.year} onChange={e => setForm(f=>({...f,year:e.target.value}))}/>
            </div>
            <div>
              <label style={{ display:"block", fontSize:9, letterSpacing:"0.16em", color:"rgba(255,255,255,0.35)", marginBottom:6 }}>TITLE *</label>
              <input style={inputStyle} placeholder="50K Community" value={form.title} onChange={e => setForm(f=>({...f,title:e.target.value}))}/>
            </div>
          </div>
          <div>
            <label style={{ display:"block", fontSize:9, letterSpacing:"0.16em", color:"rgba(255,255,255,0.35)", marginBottom:6 }}>DESCRIPTION *</label>
            <textarea style={{...inputStyle, resize:"vertical"}} rows={3} placeholder="Describe this milestone…" value={form.text} onChange={e => setForm(f=>({...f,text:e.target.value}))}/>
          </div>
          <button onClick={handleAdd} disabled={!form.year||!form.title||!form.text||uploading}
            style={{ padding:"11px 28px", background:C.gold, border:"none", color:"#0f0c08", fontFamily:"'Cormorant Garamond',serif", fontSize:10, letterSpacing:"0.18em", cursor:"pointer", alignSelf:"flex-start", opacity:(!form.year||!form.title||!form.text)?0.5:1, transition:"all 0.2s" }}>
            {uploading ? "ADDING…" : "+ ADD MILESTONE"}
          </button>
        </div>
      </div>
    </div>
  );
}

// Journey Edit Form (inline)
function JourneyEditForm({ initial, onSave, onCancel, uploading }) {
  const fileRef = useRef(null);
  const [form,    setForm]    = useState({ year:initial.year, title:initial.title, text:initial.text });
  const [file,    setFile]    = useState(null);
  const [preview, setPreview] = useState(null);

  const inputStyle = { width:"100%", padding:"8px 12px", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(201,168,76,0.25)", color:"#fff", fontFamily:"'Cormorant Garamond',serif", fontSize:13, outline:"none", boxSizing:"border-box" };

  return (
    <div style={{ flex:1 }}>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:10 }}>
        <div>
          <label style={{ display:"block", fontSize:8, letterSpacing:"0.14em", color:"rgba(255,255,255,0.3)", marginBottom:4 }}>YEAR</label>
          <input style={inputStyle} value={form.year} onChange={e => setForm(f=>({...f,year:e.target.value}))}/>
        </div>
        <div>
          <label style={{ display:"block", fontSize:8, letterSpacing:"0.14em", color:"rgba(255,255,255,0.3)", marginBottom:4 }}>TITLE</label>
          <input style={inputStyle} value={form.title} onChange={e => setForm(f=>({...f,title:e.target.value}))}/>
        </div>
      </div>
      <div style={{ marginBottom:10 }}>
        <label style={{ display:"block", fontSize:8, letterSpacing:"0.14em", color:"rgba(255,255,255,0.3)", marginBottom:4 }}>DESCRIPTION</label>
        <textarea style={{...inputStyle, resize:"vertical"}} rows={2} value={form.text} onChange={e => setForm(f=>({...f,text:e.target.value}))}/>
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
        <button onClick={() => fileRef.current?.click()} style={{ padding:"6px 12px", background:"transparent", border:"1px solid rgba(201,168,76,0.3)", color:"rgba(255,255,255,0.6)", fontSize:9, letterSpacing:"0.14em", cursor:"pointer", fontFamily:"'Cormorant Garamond',serif" }}>
          {preview ? "IMAGE SELECTED ✓" : "CHANGE IMAGE"}
        </button>
        <input ref={fileRef} type="file" accept="image/*" style={{ display:"none" }} onChange={e => { const f=e.target.files[0]; if(f){setFile(f);setPreview(URL.createObjectURL(f));} }}/>
        <button onClick={() => onSave(form, file)} disabled={uploading}
          style={{ padding:"6px 16px", background:C.gold, border:"none", color:"#0f0c08", fontSize:9, letterSpacing:"0.16em", cursor:uploading?"not-allowed":"pointer", fontFamily:"'Cormorant Garamond',serif", opacity:uploading?0.7:1 }}>
          {uploading ? "SAVING…" : "SAVE"}
        </button>
        <button onClick={onCancel} style={{ padding:"6px 14px", background:"transparent", border:"1px solid rgba(255,255,255,0.15)", color:"rgba(255,255,255,0.4)", fontSize:9, letterSpacing:"0.14em", cursor:"pointer", fontFamily:"'Cormorant Garamond',serif" }}>
          CANCEL
        </button>
      </div>
    </div>
  );
}
