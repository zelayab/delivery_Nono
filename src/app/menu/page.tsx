"use client";

import Cart from "@/components/Cart/Cart";
import MenuList from "@/components/menu/MenuList";
import PromotionList from "@/components/Promotions/PromotionList";
import { useState } from "react";

const MenuPage = () => {
  const [cart, setCart] = useState<any[]>([]);
  const [promotions] = useState<any[]>([
    { id: "promo1", name: "Combo Familiar", price: 500 },
  ]);
  const [menu] = useState<any[]>([
    { id: "item1", name: "Pizza", price: 700 },
  ]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const addToCart = (item: any) => {
    const existingItem = cart.find((cartItem) => cartItem.id === item.id);
    if (existingItem) {
      setCart((prev) =>
        prev.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        )
      );
    } else {
      setCart((prev) => [...prev, { ...item, quantity: 1 }]);
    }
    setIsCartOpen(true);
  };

  return (
    <div style={{ backgroundColor: "white", color: "black", minHeight: "100vh", padding: "1rem" }}>
      <PromotionList promotions={promotions} onSelect={addToCart} />
      <MenuList onSelect={addToCart}
        showAddButton={true}
        isAdmin={false}
      />
      <Cart
        cart={cart}
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onRemove={(id) => setCart((prev) => prev.filter((item) => item.id !== id))}
        onUpdate={(id, quantity) =>
          setCart((prev) =>
            prev.map((item) =>
              item.id === id ? { ...item, quantity } : item
            )
          )
        }
      />
    </div>
  );
};

export default MenuPage;
