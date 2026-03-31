import { createBrowserRouter, RouterProvider, Navigate, Outlet } from "react-router-dom";
import { useState } from "react";
import HeroPage        from "../components/HeroPage";
import SignIn          from "../components/Login";
import SignUp          from "../components/SignUp";
import Navbar          from "../components/Navbar";
import { GlobalStyles, C } from "../components/shared";
import { useAuth }     from "../context/AuthContext";

// Pages
import ShopPage           from "../pages/ShopPage";
import ProductDetailPage  from "../pages/ProductDetailPage";
import CartPage           from "../pages/CartPage";
import CheckoutPage       from "../pages/CheckoutPage";
import AccountPage        from "../pages/AccountPage";
import AboutPage          from "../pages/AboutPage";
import WishlistPage       from "../pages/WishlistPage";
import ContactPage        from "../pages/ContactPage";
import GiftCardsPage      from "../pages/GiftCardsPage";
import SizeGuidePage      from "../pages/SizeGuidePage";
import ReturnsPage        from "../pages/ReturnsPage";
import NotFoundPage       from "../pages/NotFoundPage";

// Admin
import AdminDashboard  from "../pages/admin/AdminDashboard";
import AdminProducts   from "../pages/admin/AdminProducts";
import AdminOrders     from "../pages/admin/AdminOrders";
import AdminCustomers  from "../pages/admin/AdminCustomers";
import AdminAnalytics  from "../pages/admin/AdminAnalytics";
import AdminSettings   from "../pages/admin/AdminSettings";

// ── Layout wrappers ───────────────────────────────────────────────────────────
function WithNavbar({ Page }) {
  const [authMode, setAuthMode] = useState(null);
  return (
    <>
      <GlobalStyles />
      <Navbar onAuth={setAuthMode} />
      <Page onAuth={setAuthMode} />
      {authMode === "signin" && <SignIn onClose={() => setAuthMode(null)} onSwitchToSignUp={() => setAuthMode("signup")} />}
      {authMode === "signup" && <SignUp onClose={() => setAuthMode(null)} onSwitchToSignIn={() => setAuthMode("signin")} />}
    </>
  );
}

function HomePage() {
  const [authMode, setAuthMode] = useState(null);
  return (
    <>
      <GlobalStyles />
      <Navbar onAuth={setAuthMode} />
      <main><HeroPage onAuth={setAuthMode} /></main>
      {authMode === "signin" && <SignIn onClose={() => setAuthMode(null)} onSwitchToSignUp={() => setAuthMode("signup")} />}
      {authMode === "signup" && <SignUp onClose={() => setAuthMode(null)} onSwitchToSignIn={() => setAuthMode("signin")} />}
    </>
  );
}

// ── Admin guard ───────────────────────────────────────────────────────────────
function AdminGuardOutlet() {
  const { isAuthenticated, isAdmin, hydrated } = useAuth();
  if (!hydrated) return (
    <div style={{ minHeight: "100vh", background: "#080502", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 32, height: 32, border: `2px solid ${C.gold}`, borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
  if (!isAuthenticated || !isAdmin) return <Navigate to="/" replace />;
  return <Outlet />;
}

// ── Router ────────────────────────────────────────────────────────────────────
// All navbar dropdown links use query params on /shop — ShopPage reads them.
// Dedicated clean URLs also exist for the key landing pages.
const router = createBrowserRouter([
  // Home
  { path: "/", element: <HomePage /> },

  // Shop — main collection + all filtered views via query params
  // e.g. /shop?category=Women&sub=Dresses, /shop?tag=SALE, /shop?tag=NEW, etc.
  { path: "/shop",     element: <WithNavbar Page={ShopPage} /> },
  { path: "/shop/:id", element: <WithNavbar Page={ProductDetailPage} /> },

  // NEW IN sub-routes (clean URLs pointing to filtered ShopPage)
  { path: "/new-arrivals",  element: <WithNavbar Page={ShopPage} /> },
  { path: "/trending",      element: <WithNavbar Page={ShopPage} /> },
  { path: "/back-in-stock", element: <WithNavbar Page={ShopPage} /> },
  { path: "/editors-picks", element: <WithNavbar Page={ShopPage} /> },

  // Women sub-category clean URLs
  { path: "/women",           element: <WithNavbar Page={ShopPage} /> },
  { path: "/women/dresses",   element: <WithNavbar Page={ShopPage} /> },
  { path: "/women/tops",      element: <WithNavbar Page={ShopPage} /> },
  { path: "/women/trousers",  element: <WithNavbar Page={ShopPage} /> },
  { path: "/women/outerwear", element: <WithNavbar Page={ShopPage} /> },
  { path: "/women/knitwear",  element: <WithNavbar Page={ShopPage} /> },
  { path: "/women/shoes",     element: <WithNavbar Page={ShopPage} /> },

  // Men sub-category clean URLs
  { path: "/men",             element: <WithNavbar Page={ShopPage} /> },
  { path: "/men/shirts",      element: <WithNavbar Page={ShopPage} /> },
  { path: "/men/trousers",    element: <WithNavbar Page={ShopPage} /> },
  { path: "/men/suits",       element: <WithNavbar Page={ShopPage} /> },
  { path: "/men/outerwear",   element: <WithNavbar Page={ShopPage} /> },
  { path: "/men/knitwear",    element: <WithNavbar Page={ShopPage} /> },
  { path: "/men/shoes",       element: <WithNavbar Page={ShopPage} /> },

  // Accessories sub-category clean URLs
  { path: "/accessories",            element: <WithNavbar Page={ShopPage} /> },
  { path: "/accessories/bags",       element: <WithNavbar Page={ShopPage} /> },
  { path: "/accessories/scarves",    element: <WithNavbar Page={ShopPage} /> },
  { path: "/accessories/belts",      element: <WithNavbar Page={ShopPage} /> },
  { path: "/accessories/jewellery",  element: <WithNavbar Page={ShopPage} /> },
  { path: "/accessories/sunglasses", element: <WithNavbar Page={ShopPage} /> },
  { path: "/accessories/hats",       element: <WithNavbar Page={ShopPage} /> },

  // Sale clean URLs
  { path: "/sale",              element: <WithNavbar Page={ShopPage} /> },
  { path: "/sale/women",        element: <WithNavbar Page={ShopPage} /> },
  { path: "/sale/men",          element: <WithNavbar Page={ShopPage} /> },
  { path: "/sale/accessories",  element: <WithNavbar Page={ShopPage} /> },

  // Other pages
  { path: "/cart",        element: <WithNavbar Page={CartPage} /> },
  { path: "/checkout",    element: <WithNavbar Page={CheckoutPage} /> },
  { path: "/account",     element: <WithNavbar Page={AccountPage} /> },
  { path: "/about",       element: <WithNavbar Page={AboutPage} /> },
  { path: "/wishlist",    element: <WithNavbar Page={WishlistPage} /> },
  { path: "/contact",     element: <WithNavbar Page={ContactPage} /> },
  { path: "/gift-cards",  element: <WithNavbar Page={GiftCardsPage} /> },
  { path: "/size-guide",  element: <WithNavbar Page={SizeGuidePage} /> },
  { path: "/returns",     element: <WithNavbar Page={ReturnsPage} /> },

  // Admin
  {
    element: <AdminGuardOutlet />,
    children: [
      { path: "/admin",            element: <AdminDashboard /> },
      { path: "/admin/products",   element: <AdminProducts /> },
      { path: "/admin/orders",     element: <AdminOrders /> },
      { path: "/admin/customers",  element: <AdminCustomers /> },
      { path: "/admin/analytics",  element: <AdminAnalytics /> },
      { path: "/admin/settings",   element: <AdminSettings /> },
    ],
  },

  { path: "*", element: <NotFoundPage /> },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
