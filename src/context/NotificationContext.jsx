//@refresh reset
import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { getDashboardStats, getAllOrdersAdmin } from "../api/adminApi";

// ── Types & helpers ────────────────────────────────────────────────────────────
const STORAGE_KEY    = "maison_admin_notifications";
const SEEN_ORDERS    = "maison_admin_seen_orders";
const POLL_INTERVAL  = 30_000; // 30 s

const uid = () => Math.random().toString(36).slice(2, 10);

const typeConfig = {
  order:    { icon: "📦", color: "#c9a84c",  label: "New Order"    },
  lowstock: { icon: "⚠️",  color: "#f09090",  label: "Low Stock"    },
  user:     { icon: "👤", color: "#7aa8c0",  label: "New Customer" },
  system:   { icon: "🔔", color: "#a08fc0",  label: "System"       },
};

export const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); }
    catch { return []; }
  });

  const seenOrdersRef = useRef(new Set(
    JSON.parse(localStorage.getItem(SEEN_ORDERS) || "[]")
  ));

  // Persist whenever notifications change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications.slice(0, 100)));
  }, [notifications]);

  // ── Add notification ────────────────────────────────────────────────────────
  const addNotification = useCallback((type, title, message, meta = {}) => {
    const notif = {
      id: uid(), type, title, message, meta,
      read: false,
      createdAt: new Date().toISOString(),
    };
    setNotifications(prev => [notif, ...prev].slice(0, 100));
    return notif.id;
  }, []);

  // ── Mark read / unread ──────────────────────────────────────────────────────
  const markRead = useCallback((id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const deleteNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAll = useCallback(() => setNotifications([]), []);

  // ── Poll for new orders & low stock ────────────────────────────────────────
  const poll = useCallback(async () => {
    try {
      // Check dashboard for low stock + new user count
      const dash = await getDashboardStats().catch(() => null);
      if (dash?.lowStockProducts?.length) {
        dash.lowStockProducts.forEach(p => {
          const key = `ls_${p._id}`;
          if (!seenOrdersRef.current.has(key)) {
            seenOrdersRef.current.add(key);
            addNotification("lowstock", "Low Stock Alert",
              `${p.name} only has ${p.stock} unit${p.stock === 1 ? "" : "s"} left.`,
              { productId: p._id, stock: p.stock, link: "/admin/products" });
          }
        });
      }

      // Check for new orders
      const ordersRes = await getAllOrdersAdmin({ limit: 10, sort: "-createdAt" }).catch(() => null);
      const orders = ordersRes?.orders || [];
      const newOrders = orders.filter(o => !seenOrdersRef.current.has(`ord_${o._id}`));

      newOrders.forEach(o => {
        seenOrdersRef.current.add(`ord_${o._id}`);
        addNotification("order", "New Order Received",
          `${o.user?.name || "A customer"} placed an order for ₹${(o.totalAmount || 0).toLocaleString("en-IN")}.`,
          { orderId: o._id, amount: o.totalAmount, status: o.status, link: "/admin/orders" });
      });

      // Persist seen set
      localStorage.setItem(SEEN_ORDERS, JSON.stringify([...seenOrdersRef.current].slice(-200)));
    } catch {
      // silently ignore poll errors
    }
  }, [addNotification]);

  // Initial poll + interval
  useEffect(() => {
    poll();
    const id = setInterval(poll, POLL_INTERVAL);
    return () => clearInterval(id);
  }, [poll]);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider value={{
      notifications, unreadCount, typeConfig,
      addNotification, markRead, markAllRead,
      deleteNotification, clearAll,
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications must be inside NotificationProvider");
  return ctx;
};

export { typeConfig };