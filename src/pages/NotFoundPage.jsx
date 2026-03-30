import { useNavigate } from "react-router-dom";
import { C, GlobalStyles } from "../components/shared";

export default function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <>
      <GlobalStyles />
      <div style={{ minHeight: "100vh", background: C.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "40px" }}>
        <div style={{ fontFamily: "'Playfair Display',serif", fontSize: "120px", color: "rgba(201,168,76,0.15)", lineHeight: 1, marginBottom: "16px" }}>404</div>
        <div style={{ fontFamily: "'Playfair Display',serif", fontSize: "28px", color: "#fff", marginBottom: "12px" }}>Page Not Found</div>
        <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.4)", maxWidth: "360px", lineHeight: 1.8, marginBottom: "32px" }}>The page you're looking for doesn't exist or has been moved.</p>
        <div style={{ display: "flex", gap: "16px" }}>
          <button onClick={() => navigate("/")} className="m-btn-gold">RETURN HOME</button>
          <button onClick={() => navigate("/shop")} className="m-btn-outline-light">EXPLORE SHOP</button>
        </div>
      </div>
    </>
  );
}
