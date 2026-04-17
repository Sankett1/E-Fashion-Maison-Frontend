import { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try { return JSON.parse(localStorage.getItem("maison_cart")) || []; } catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem("maison_cart", JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product, size = "M", qty = 1) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === product._id && i.size === size);
      if (existing) return prev.map(i => i.id === product._id && i.size === size ? { ...i, qty: i.qty + qty } : i);
      return [...prev, { id: product._id, name: product.name, price: product.price, size, qty, image: product.images?.[0]?.url || "", grad: "linear-gradient(160deg,#c8b080 0%,#8a6228 100%)", category: product.category }];
    });
  };

  const removeFromCart = (id, size) => setCart(prev => prev.filter(i => !(i.id === id && i.size === size)));
  const updateQty = (id, size, qty) => {
    if (qty < 1) return removeFromCart(id, size);
    setCart(prev => prev.map(i => i.id === id && i.size === size ? { ...i, qty } : i));
  };
  const clearCart = () => setCart([]);

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const cartTotal = cart.reduce((s, i) => s + i.price * i.qty, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQty, clearCart, cartCount, cartTotal }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
};
