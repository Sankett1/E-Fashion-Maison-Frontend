import { useState } from "react";
import AdminLayout from "./AdminLayout";
import { C } from "../../components/shared";
import { useAuth } from "../../context/AuthContext";

export default function AdminSettings() {
  const { user } = useAuth();
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({ storeName: "MAISON", storeEmail: "hello@maison.in", currency: "INR", timezone: "Asia/Kolkata", orderPrefix: "MSN", freeShippingThreshold: "5000" });

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  const Field = ({ label, field, type = "text" }) => (
    <div style={{ marginBottom: "20px" }}>
      <label style={{ display: "block", fontSize: "9.5px", letterSpacing: "0.18em", color: "rgba(255,255,255,0.4)", marginBottom: "8px" }}>{label.toUpperCase()}</label>
      <input type={type} value={form[field]} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
        style={{ width: "100%", maxWidth: "400px", padding: "11px 14px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(201,168,76,0.2)", color: "#fff", fontSize: "13px", outline: "none", fontFamily: "inherit" }} />
    </div>
  );

  return (
    <AdminLayout title="Settings">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
        {/* Store Settings */}
        <div style={{ background: "linear-gradient(135deg,#0f0c08,#110e08)", border: "1px solid rgba(201,168,76,0.15)", padding: "28px" }}>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: "17px", color: "#fff", marginBottom: "24px" }}>Store Configuration</div>
          <Field label="Store Name" field="storeName" />
          <Field label="Store Email" field="storeEmail" />
          <Field label="Order ID Prefix" field="orderPrefix" />
          <Field label="Free Shipping Above (₹)" field="freeShippingThreshold" type="number" />
          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", fontSize: "9.5px", letterSpacing: "0.18em", color: "rgba(255,255,255,0.4)", marginBottom: "8px" }}>CURRENCY</label>
            <select value={form.currency} onChange={e => setForm(f => ({ ...f, currency: e.target.value }))} style={{ width: "200px", padding: "11px 14px", background: "#0f0c08", border: "1px solid rgba(201,168,76,0.2)", color: "#fff", fontSize: "13px", fontFamily: "inherit", outline: "none" }}>
              <option value="INR">INR (₹)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
            </select>
          </div>
          <button onClick={handleSave} style={{ padding: "11px 28px", background: saved ? "#7ab87a" : C.gold, color: "#0f0c08", border: "none", fontSize: "10px", letterSpacing: "0.18em", cursor: "pointer", fontFamily: "inherit", fontWeight: 600, transition: "background 0.3s" }}>
            {saved ? "✓ SAVED" : "SAVE SETTINGS"}
          </button>
        </div>

        {/* Admin Info */}
        <div style={{ background: "linear-gradient(135deg,#0f0c08,#110e08)", border: "1px solid rgba(201,168,76,0.15)", padding: "28px" }}>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: "17px", color: "#fff", marginBottom: "24px" }}>Admin Account</div>
          <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: `linear-gradient(135deg,${C.gold},${C.goldDark})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", color: "#0f0c08", fontWeight: 600, marginBottom: "20px" }}>
            {user?.name?.[0]?.toUpperCase() || "A"}
          </div>
          <div style={{ marginBottom: "16px" }}>
            <div style={{ fontSize: "9px", letterSpacing: "0.16em", color: "rgba(255,255,255,0.3)", marginBottom: "4px" }}>NAME</div>
            <div style={{ fontSize: "14px", color: "rgba(255,255,255,0.8)" }}>{user?.name || "Admin User"}</div>
          </div>
          <div style={{ marginBottom: "16px" }}>
            <div style={{ fontSize: "9px", letterSpacing: "0.16em", color: "rgba(255,255,255,0.3)", marginBottom: "4px" }}>EMAIL</div>
            <div style={{ fontSize: "14px", color: "rgba(255,255,255,0.8)" }}>{user?.email || "admin@maison.in"}</div>
          </div>
          <div>
            <div style={{ fontSize: "9px", letterSpacing: "0.16em", color: "rgba(255,255,255,0.3)", marginBottom: "4px" }}>ROLE</div>
            <span style={{ fontSize: "9px", letterSpacing: "0.14em", padding: "4px 12px", border: `1px solid ${C.border}`, color: C.gold, background: "rgba(201,168,76,0.08)" }}>ADMINISTRATOR</span>
          </div>

          <div style={{ marginTop: "28px", padding: "16px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <div style={{ fontSize: "10px", letterSpacing: "0.14em", color: "rgba(255,255,255,0.4)", marginBottom: "12px" }}>BACKEND API</div>
            <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", marginBottom: "6px" }}>Base URL: <span style={{ color: C.gold }}>{import.meta.env.VITE_API_URL || "http://localhost:5000/api"}</span></div>
            <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)" }}>MongoDB: <span style={{ color: "#7ab87a" }}>Connected</span></div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
