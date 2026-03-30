import { createBrowserRouter, RouterProvider, Navigate, Outlet } from "react-router-dom";
import { useState } from "react";
import HeroPage from "../components/HeroPage";
import SignIn from "../components/Login";
import SignUp from "../components/SignUp";
import ShopPage from "../pages/ShopPage";
import ProductDetailPage from "../pages/ProductDetailPage";
import CartPage from "../pages/CartPage";
import CheckoutPage from "../pages/CheckoutPage";
import AccountPage from "../pages/AccountPage";
import AboutPage from "../pages/AboutPage";
import WishlistPage from "../pages/WishlistPage";
import ContactPage from "../pages/ContactPage";
import GiftCardsPage from "../pages/GiftCardsPage";
import SizeGuidePage from "../pages/SizeGuidePage";
import ReturnsPage from "../pages/ReturnsPage";
import NotFoundPage from "../pages/NotFoundPage";
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminProducts from "../pages/admin/AdminProducts";
import AdminOrders from "../pages/admin/AdminOrders";
import AdminCustomers from "../pages/admin/AdminCustomers";
import AdminAnalytics from "../pages/admin/AdminAnalytics";
import AdminSettings from "../pages/admin/AdminSettings";
import Navbar from "../components/Navbar";
import { GlobalStyles, C } from "../components/shared";
import { useAuth } from "../context/AuthContext";

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

// FIX: Wait for AuthContext to finish hydrating from localStorage before deciding
// to redirect. Without this, the guard fires on first render when isAuthenticated
// is still false (token hasn't been read yet) and bounces all admin routes to /.
function AdminGuardOutlet() {
  const { isAuthenticated, isAdmin, hydrated } = useAuth();

  // Still reading from localStorage / fetching getMe — show nothing yet
  if (!hydrated) {
    return (
      <div style={{
        minHeight: "100vh", background: "#080502",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <div style={{
          width: 32, height: 32, border: `2px solid ${C.gold}`,
          borderTopColor: "transparent", borderRadius: "50%",
          animation: "spin 0.7s linear infinite",
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Check authentication and admin permissions
  if (!isAuthenticated || !isAdmin) return <Navigate to="/" replace />;
  return <Outlet />;
}

const router = createBrowserRouter([
  { path: "/",           element: <HomePage /> },
  { path: "/shop",       element: <WithNavbar Page={ShopPage} /> },
  { path: "/shop/:id",   element: <WithNavbar Page={ProductDetailPage} /> },
  { path: "/cart",       element: <WithNavbar Page={CartPage} /> },
  { path: "/checkout",   element: <WithNavbar Page={CheckoutPage} /> },
  { path: "/account",    element: <WithNavbar Page={AccountPage} /> },
  { path: "/about",      element: <WithNavbar Page={AboutPage} /> },
  { path: "/wishlist",   element: <WithNavbar Page={WishlistPage} /> },
  { path: "/contact",    element: <WithNavbar Page={ContactPage} /> },
  { path: "/gift-cards", element: <WithNavbar Page={GiftCardsPage} /> },
  { path: "/size-guide", element: <WithNavbar Page={SizeGuidePage} /> },
  { path: "/returns",    element: <WithNavbar Page={ReturnsPage} /> },

  // Admin — guard waits for hydration, then checks role
  {
    element: <AdminGuardOutlet />,
    children: [
      { path: "/admin",           element: <AdminDashboard /> },
      { path: "/admin/products",  element: <AdminProducts /> },
      { path: "/admin/orders",    element: <AdminOrders /> },
      { path: "/admin/customers", element: <AdminCustomers /> },
      { path: "/admin/analytics", element: <AdminAnalytics /> },
      { path: "/admin/settings",  element: <AdminSettings /> },
    ],
  },

  { path: "*", element: <NotFoundPage /> },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
