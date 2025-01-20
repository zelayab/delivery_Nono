"use client";

import { db } from "@/firebase/firebaseConfig";
import { Select, Tabs, Text } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { IconHistory, IconTruckDelivery } from "@tabler/icons-react";
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
      <h1 className="text-2xl font-bold mb-6">Panel de Repartidor</h1>
      <Text className="mb-4 text-lg font-semibold text-blue-500">
        Bienvenido, {deliveryData?.name || "Repartidor"}.
      </Text>

      <Tabs defaultValue="assignedOrders" className="bg-gray-100 text-black">
        <Tabs.List>
          <Tabs.Tab value="assignedOrders" leftSection={<IconTruckDelivery size={16} />}>
            Pedidos Asignados
          </Tabs.Tab>
          <Tabs.Tab value="orderHistory" leftSection={<IconHistory size={16} />}>
            Historial de Pedidos
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="assignedOrders">
          {assignedOrders.length > 0 ? (
            <ul>
              {assignedOrders.map((order) => (
                <li key={order.id} className="mb-4 p-4 bg-white shadow rounded">
                  <p>
                    <strong>Número de Orden:</strong> {order.id}
                  </p>
                  <p>
                    <strong>Estado:</strong>{" "}
                    <span className="text-yellow-500">{order.status}</span>
                  </p>
                  <p>
                    <strong>Dirección:</strong> {order.address}
                  </p>
                  <ul className="mt-2">
                    {order.items.map((item: any) => (
                      <li key={item.id}>
                        {item.name} x {item.quantity}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4">
                    <Select
                      styles={{
                        option: {
                          color: "black",
                        },
                      }}
                      placeholder="Actualizar estado"
                      data={[
                        { value: "en preparacion", label: "En preparación" },
                        { value: "pendiente", label: "Pendiente" },
                        { value: "en camino", label: "En Camino" },
                        { value: "entregado", label: "Entregado" },
                      ]}
                      defaultValue={order.status}
                      onChange={(value) => handleStatusChange(order.id, value!)}
                    />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <Text>No tienes pedidos asignados actualmente.</Text>
          )}
        </Tabs.Panel>

        <Tabs.Panel value="orderHistory">
          {completedOrders.length > 0 ? (
            <ul>
              {completedOrders.map((order) => (
                <li key={order.id} className="mb-4 p-4 bg-white shadow rounded">
                  <p>
                    <strong>Número de Orden:</strong> {order.id}
                  </p>
                  <p>
                    <strong>Estado:</strong>{" "}
                    <span className="text-green-500">{order.status}</span>
                  </p>
                  <p>
                    <strong>Dirección:</strong> {order.address}
                  </p>
                  <ul className="mt-2">
                    {order.items.map((item: any) => (
                      <li key={item.id}>
                        {item.name} x {item.quantity}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          ) : (
            <Text>No tienes historial de pedidos.</Text>
          )}
        </Tabs.Panel>
      </Tabs>
    </div>
  );
};

export default DeliveryDashboard;
