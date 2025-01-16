"use client";

import { db } from "@/firebase/firebaseConfig";
import { showNotification } from "@mantine/notifications";
import { onValue, ref, update } from "firebase/database";
import { useEffect, useState } from "react";

const DeliveryDashboard = () => {
  const [assignedOrders, setAssignedOrders] = useState<any[]>([]);
  const [completedOrders, setCompletedOrders] = useState<any[]>([]);
  const [deliveryData, setDeliveryData] = useState<any>(null);

  useEffect(() => {
    const deliveryId = localStorage.getItem("userId");

    if (!deliveryId) {
      showNotification({
        title: "Error",
        message: "No se encontró el ID del repartidor.",
        color: "red",
      });
      return;
    }

    // Referencia para obtener los datos del repartidor
    const deliveryRef = ref(db, `users/${deliveryId}`);

    onValue(deliveryRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setDeliveryData(data);
      } else {
        showNotification({
          title: "Error",
          message: "No se encontraron datos para este repartidor.",
          color: "red",
        });
      }
    });

    // Referencia para obtener las órdenes
    const ordersRef = ref(db, "orders");

    onValue(ordersRef, (snapshot) => {
      const data = snapshot.val();
      if (data && typeof data === "object") {
        const allOrders = Object.entries(data).map(([id, order]) => ({
          id,
          ...(order as any),
        }));

        const activeOrders = allOrders.filter(
          (order) => order.deliveryId === deliveryId && order.status !== "entregado"
        );

        const pastOrders = allOrders.filter(
          (order) => order.deliveryId === deliveryId && order.status === "entregado"
        );

        setAssignedOrders(activeOrders);
        setCompletedOrders(pastOrders);
      }
    });
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const orderRef = ref(db, `orders/${orderId}`);
      await update(orderRef, { status: newStatus });

      // Actualizar el estado local
      setAssignedOrders((prevAssignedOrders) =>
        prevAssignedOrders.filter((order) => {
          if (order.id === orderId && newStatus === "entregado") {
            setCompletedOrders((prevCompletedOrders) => [
              ...prevCompletedOrders,
              { ...order, status: newStatus },
            ]);
            return false; // Eliminar de pedidos asignados
          }
          return true;
        })
      );

      showNotification({
        title: "Estado Actualizado",
        message: "Estado del pedido actualizado correctamente.",
        color: "blue",
      });
    } catch (error) {
      console.error("Error al actualizar el estado del pedido:", error);
      showNotification({
        title: "Error",
        message: "No se pudo actualizar el estado del pedido.",
        color: "red",
      });
    }
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen text-black">
     Delivery Dashboard
    </div>
  );
};

export default DeliveryDashboard;
