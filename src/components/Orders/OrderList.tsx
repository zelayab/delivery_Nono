"use client";

import { db } from "@/firebase/firebaseConfig";
import {
  Accordion,
  Badge,
  Group,
  Image,
  Loader,
  Select,
  Stack,
  Table,
  Text,
  Title,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { IconCheck, IconX } from "@tabler/icons-react";
import { onValue, ref, update } from "firebase/database";
import { useEffect, useState } from "react";

interface Order {
  id: string;
  userId: string;
  items: { id: string; name: string; quantity: number; image: string , price:number}[];
  status: string;
  deliveryId?: string;
  timestamp: number;
  comments?: string;
  address: string;
  payment: string;
  total?: number;
}

interface OrderListProps {
  isAdmin?: boolean;
}

interface OrderStatusValidation {
  /* las palabras son entregado,cancelado */

}

const OrderList: React.FC<OrderListProps> = ({ isAdmin }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [deliveryPersons, setDeliveryPersons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ordersRef = ref(db, "orders");

    const unsubscribe = onValue(ordersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const formattedOrders = Object.entries(data).map(
          ([id, value]: [string, any]) => ({
            id,
            ...value,
          })
        );
        setOrders(formattedOrders);
      } else {
        setOrders([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (isAdmin) {
      const usersRef = ref(db, "users");
      onValue(usersRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const formattedUsers = Object.entries(data)
            .filter(([_, value]: [string, any]) => value.role === "delivery")
            .map(([id, value]: [string, any]) => ({
              value: id,
              label: value.name,
            }));
          setDeliveryPersons(formattedUsers);
        }
      });
    }
  }, [isAdmin]);

  const changeOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const orderRef = ref(db, `orders/${orderId}`);
      await update(orderRef, { status: newStatus });
      showNotification({
        title: "Estado actualizado",
        message: `El pedido ahora está "${newStatus}".`,
        color: "green",
        icon: <IconCheck size={16} />,
      });
    } catch (error) {
      console.error("Error al actualizar el estado:", error);
      showNotification({
        title: "Error",
        message: "No se pudo actualizar el estado del pedido.",
        color: "red",
        icon: <IconX size={16} />,
      });
    }
  };

  const assignDelivery = async (orderId: string, deliveryId: string) => {
    try {
      const orderRef = ref(db, `orders/${orderId}`);
      await update(orderRef, { deliveryId, status: "en camino" });
      showNotification({
        title: "Repartidor asignado",
        message: "El pedido ha sido asignado al repartidor correctamente.",
        color: "blue",
        icon: <IconCheck size={16} />,
      });
    } catch (error) {
      console.error("Error al asignar el pedido:", error);
      showNotification({
        title: "Error",
        message: "No se pudo asignar el pedido al repartidor.",
        color: "red",
        icon: <IconX size={16} />,
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader size="xl" color="blue" />
      </div>
    );
  }

  return (
    <Accordion className="text-black"
    
    styles={{
      item: {
        color: "black",
        borderRadius: "8px",
        marginBottom: "10px",
        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
      },
      control: {
        padding: "12px 16px",
      },
    }}>
      {orders.map((order) => (
        <Accordion.Item key={order.id} value={order.id}>
          <Accordion.Control>
            <Group>
              <Title order={6}>Pedido #{order.id}</Title>
              <Badge
                size="md"
                color={
                  order.status === "pendiente"
                    ? "yellow"
                    : order.status === "en camino"
                    ? "blue"
                    : order.status === "entregado"
                    ? "green"
                    : order.status === 'en preparacion'
                    ? "purple"
                    : "red"
                }
              >
                {order?.status?.toUpperCase()}
              </Badge>
            </Group>
          </Accordion.Control>
          <Accordion.Panel>
            <Stack>
              <Text>
                <strong>Cliente:</strong> {order.userId}
              </Text>
              <Text>
                <strong>Dirección:</strong> {order.address}
              </Text>
              <Text>
                <strong>Método de Pago:</strong> {order.payment}
              </Text>
              {order.comments && (
                <Text>
                  <strong>Comentarios:</strong> {order.comments}
                </Text>
              )}
              <Table striped>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Producto</Table.Th>
                    <Table.Th>Precio</Table.Th>
                    <Table.Th>Cantidad</Table.Th>
                    <Table.Th>Imagen</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {order.items.map((item) => (
                    <Table.Tr key={item.id}>
                      <Table.Td>{item.name}</Table.Td>
                      <Table.Td>${item.price}</Table.Td>
                      <Table.Td>{item.quantity}</Table.Td>
                      <Table.Td>
                        <Image
                          src={item.image}
                          alt={item.name}
                          style={{ width: "60px", borderRadius: "8px" }}
                        />
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>

              <Text>
                <strong>Total:</strong> ${order.total?.toFixed(2)}
              </Text>


              {isAdmin && !["entregado", "rechazado", "cancelado"].includes(order.status)  && (
                <Stack>
                  <Select
                  styles={{
                    option: {
                      color: "black",
                    },
                  }}
                    label="Cambiar Estado"
                    placeholder="Seleccionar estado"
                    data={[
                      { value: "en preparacion", label: "En preparación" },
                      { value: "pendiente", label: "Pendiente" },
                      { value: "en camino", label: "En Camino" },
                      { value: "entregado", label: "Entregado" },
                      { value: "rechazado", label: "Rechazado" },
                    ]}
                    value={order.status}
                    onChange={(value) =>
                      value && changeOrderStatus(order.id, value)
                    }
                  />
                  <Select
                  styles={{
                    option: {
                      color: "black",
                    },
                  }}
                    label="Asignar Repartidor"
                    placeholder="Seleccionar repartidor"
                    data={deliveryPersons}
                    onChange={(value) =>
                      value && assignDelivery(order.id, value)
                    }
                  />
                </Stack>
              )}
            </Stack>
          </Accordion.Panel>
        </Accordion.Item>
      ))}
    </Accordion>
  );
};

export default OrderList;
