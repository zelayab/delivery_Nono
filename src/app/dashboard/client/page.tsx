"use client";

import { db } from "@/firebase/firebaseConfig";
import { showNotification } from "@mantine/notifications";
import { onValue, push, ref, update } from "firebase/database";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const ClientDashboard = () => {
  const [currentOrder, setCurrentOrder] = useState<any>(null);
  const [orderHistory, setOrderHistory] = useState<any[]>([]);
  const [deliveryMap, setDeliveryMap] = useState<Record<string, string>>({}); // UID-to-Name map
  const [loading, setLoading] = useState<boolean>(true);
  const [cart, setCart] = useState<any[]>([]);
  const [promotions, setPromotions] = useState<any[]>([]);
  const [comments, setComments] = useState<string>(""); // Estado para los comentarios
  const [activeTab, setActiveTab] = useState<string>("menu");
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    // Fetch orders
    const ordersRef = ref(db, "orders");
    onValue(ordersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const formattedOrders = Object.entries(data).map(
          ([id, order]) => ({ id, ...(order as any) })
        );
        setOrderHistory(formattedOrders);
      } else {
        setOrderHistory([]);
      }
    });

    // Fetch delivery users
    const usersRef = ref(db, "users");
    onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const deliveryUsers = Object.entries(data)
          .filter(([_, user]: [string, any]) => user.role === "delivery") // Filter delivery users
          .reduce((acc, [id, user]: [string, any]) => {
            acc[id] = user.name; // Map UID to name
            return acc;
          }, {} as Record<string, string>);
        setDeliveryMap(deliveryUsers);
      }
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      router.push("/auth/login");
      return;
    }

    const ordersRef = ref(db, "orders");

    onValue(ordersRef, (snapshot) => {
      const data = snapshot.val();
      if (data && typeof data === "object") {
        const userOrders = Object.entries(data)
          .map(([id, order]) => ({ id, ...(order as any) }))
          .filter((order) => order.userId === userId);

        const activeOrder = userOrders.find(
          (order) => order.status === "pendiente"
        );
        const pastOrders = userOrders.filter(
          (order) => order.status !== "pendiente"
        );

        setCurrentOrder(activeOrder || null);
        setOrderHistory(pastOrders || []);
      }
    });
  }, [router]);

  useEffect(() => {
    const promotionsRef = ref(db, "promotions");
    onValue(promotionsRef, (snapshot) => {
      const data = snapshot.val();
      if (data && typeof data === "object") {
        const promotionsArray = Object.entries(data).map(([id, promo]) => ({
          id,
          ...(promo as any),
        }));
        setPromotions(promotionsArray);
      } else {
        setPromotions([]);
      }
    });
  }, []);

  const addToCart = (item: any, quantity: number) => {
    const existingItem = cart.find((cartItem) => cartItem.id === item.id);
    if (existingItem) {
      setCart((prev) =>
        prev.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + quantity }
            : cartItem
        )
      );
    } else {
      setCart((prev) => [...prev, { ...item, quantity }]);
    }
    setIsCartOpen(true);
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const updateCartItem = (id: string, quantity: number) => {
    setCart((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (value === "cart") {
      setIsCartOpen(true);
    }
  };

  const handleCartClose = () => {
    setIsCartOpen(false);
    setActiveTab("menu");
  };

  const handleCancelOrder = async (orderId: string) => {
    try {
      const orderRef = ref(db, `orders/${orderId}`);
      await update(orderRef, { status: "cancelado" });
      showNotification({
        title: "Pedido Cancelado",
        message: "Pedido cancelado correctamente.",
        color: "red",
      });
      setCurrentOrder(null);
    } catch (error) {
      console.error("Error al cancelar el pedido:", error);
      showNotification({
        title: "Error",
        message: "Hubo un problema al cancelar el pedido.",
        color: "red",
      });
    }
  };

  const handleConfirmOrder = async () => {
    const userId = localStorage.getItem("userId");
    const newOrder = {
      userId,
      items: cart,
      comments,
      status: "pendiente",
      total: cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    };

    try {
      await push(ref(db, "orders"), newOrder);
      alert("Pedido confirmado con éxito.");
      setCart([]);
      setComments("");
      setActiveTab("currentOrder");
    } catch (error) {
      console.error("Error al confirmar el pedido:", error);
      alert("Hubo un problema al confirmar el pedido.");
    }
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen text-black">
      Client Dashboard
      </div>
    
  );
};

export default ClientDashboard;
