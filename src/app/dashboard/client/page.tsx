"use client";

import Cart from "@/components/Cart/Cart";
import MenuList from "@/components/menu/MenuList";
import PromotionList from "@/components/Promotions/PromotionList";
import { db } from "@/firebase/firebaseConfig";
import {
  Accordion,
  Button,
  Divider,
  Group,
  Image,
  Text as MantineText,
  Table,
  Tabs,
  ThemeIcon,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import {
  IconBox,
  IconCircleCheck,
  IconCircleDashed,
  IconCircleX,
  IconHistory,
  IconShoppingCart,
} from "@tabler/icons-react";
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
      <h1 className="text-2xl font-bold mb-6">Panel del Cliente</h1>
      <MantineText className="mb-4 text-lg font-semibold text-blue-500">
        Bienvenido, {localStorage.getItem("userName") || "Cliente"}.
      </MantineText>

      <Tabs
        defaultValue="currentOrder"
        value={activeTab}
        onChange={(value) => handleTabChange(value as string)}
        className="bg-white rounded shadow p-4"
      >
        <Tabs.List>
          <Tabs.Tab
            value="currentOrder"
            leftSection={<IconShoppingCart size={16} />}
          >
            Orden Actual
          </Tabs.Tab>
          <Tabs.Tab
            value="orderHistory"
            leftSection={<IconHistory size={16} />}
          >
            Historial de Ordenes
          </Tabs.Tab>
          <Tabs.Tab value="menu" leftSection={<IconBox size={16} />}>
            Menú
          </Tabs.Tab>
          <Tabs.Tab
            value="cart"
            leftSection={<IconShoppingCart size={16} />}
            onClick={() => setIsCartOpen(true)}
          >
            Carrito
          </Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="currentOrder">
          {currentOrder ? (
            <div className="bg-white p-4 rounded shadow-md border border-gray-200">
              <h2 className="text-lg font-bold mb-4 text-blue-600 flex items-center">
                <IconShoppingCart size={20} className="mr-2" /> Orden en Curso
              </h2>
              <p>
                <strong>Número de Orden:</strong> {currentOrder.id}
              </p>
              <p>
                <strong>Estado:</strong>{" "}
                <span className="text-yellow-500">{currentOrder.status}</span>
              </p>
              <h3 className="mt-4 font-semibold">Productos:</h3>
              <ul className="list-disc pl-4">
                {currentOrder?.items?.map((item: any) => (
                  <li key={item.id}>
                    <Group>
                      <>
                        <div className="flex justify-between">
                          {item.name} x {item.quantity} - $
                          {(item.price * item.quantity).toFixed(2)}
                        </div>
                        <div className="mt-2 flex items-center">
                          <Image
                            src={item?.image}
                            alt={item.name}
                            h={60}
                            w={60}
                            radius="md"
                            fit="cover"
                          />
                        </div>
                      </>
                    </Group>
                  </li>
                ))}
              </ul>
              <p className="mt-4">
                <strong>Total:</strong> ${currentOrder?.total?.toFixed(2)}
              </p>

              {currentOrder.status === "pendiente" && (
                <Button
                  color="red"
                  onClick={() => handleCancelOrder(currentOrder.id)}
                  className="mt-4"
                >
                  Cancelar Pedido
                </Button>
              )}
            </div>
          ) : (
            <p>No tienes ninguna orden activa.</p>
          )}
        </Tabs.Panel>

        <Tabs.Panel value="orderHistory">
          {orderHistory.length > 0 ? (
            <div className="bg-white p-4 rounded shadow-md border border-gray-200">
              <h2 className="text-lg font-bold mb-4 text-blue-600">
                Historial de Órdenes
              </h2>

              <Accordion
                variant="separated"
                chevronPosition="right"
                transitionDuration={300}
                styles={{
                  control: { fontWeight: "bold" },
                }}
              >
                {orderHistory.map((order) => {
                  let statusColor = "gray";
                  let statusIcon = <IconCircleDashed />;

                  // Conditional styling for status
                  if (order.status === "entregado") {
                    statusColor = "green";
                    statusIcon = <IconCircleCheck />;
                  } else if (order.status === "pendiente") {
                    statusColor = "yellow";
                    statusIcon = <IconCircleDashed />;
                  } else if (
                    order.status === "rechazado" ||
                    order.status === "cancelado"
                  ) {
                    statusColor = "red";
                    statusIcon = <IconCircleX />;
                  }

                  return (
                    <Accordion.Item key={order.id} value={order.id}>
                      <Accordion.Control>
                        <ThemeIcon
                          color={statusColor}
                          size={20}
                          radius="xl"
                          mr="xs"
                        >
                          {statusIcon} {/* Icono de estado */}
                        </ThemeIcon>
                        {order.status}
                        <MantineText>
                          <strong>Número de Orden:</strong> {order.id}
                        </MantineText>
                      </Accordion.Control>

                      <Accordion.Panel>
                        <MantineText>
                          <strong>Productos:</strong>
                        </MantineText>
                        <Table highlightOnHover>
                          <Table.Thead>
                            <Table.Tr>
                              <Table.Th>Producto</Table.Th>
                              <Table.Th>Cantidad</Table.Th>
                              <Table.Th>Precio Total</Table.Th>
                            </Table.Tr>
                          </Table.Thead>
                          <Table.Tbody>
                            {order.items.map((item: any) => (
                              <Table.Tr key={item.id}>
                                <Table.Td>{item.name}</Table.Td>
                                <Table.Td>{item.quantity}</Table.Td>
                                <Table.Td>
                                  ${(item.quantity * item.price).toFixed(2)}
                                </Table.Td>
                              </Table.Tr>
                            ))}
                          </Table.Tbody>
                        </Table>

                        <MantineText mt="sm">
                          <strong>Total:</strong> ${order.total.toFixed(2)}
                        </MantineText>

                        <MantineText>
                          <strong>Estado:</strong>{" "}
                          <span style={{ color: statusColor }}>
                            {order.status.charAt(0).toUpperCase() +
                              order.status.slice(1)}
                          </span>
                        </MantineText>

                        <MantineText>
                          <strong>Repartidor Asignado:</strong>{" "}
                          {deliveryMap[order.deliveryId] || "No asignado"}
                        </MantineText>
                      </Accordion.Panel>
                    </Accordion.Item>
                  );
                })}
              </Accordion>

            </div>
          ) : (
            <MantineText>No tienes historial de órdenes.</MantineText>
          )}
        </Tabs.Panel>

        <Tabs.Panel value="menu">
          <MantineText size="xl" mb={20}>
            Promociones
          </MantineText>
          {promotions.length > 0 ? (
            <PromotionList
              promotions={promotions}
              onSelect={(promo) => addToCart(promo, 1)}
            />
          ) : (
            <p>No hay promociones disponibles.</p>
          )}
          <Divider size="xl" pt={20} />
          <MantineText size="xl" mb={20}>
            Menú
          </MantineText>
          <MenuList isAdmin={false} showAddButton={true} onSelect={addToCart} />
        </Tabs.Panel>
      </Tabs>

      <Cart
        cart={cart}
        isOpen={isCartOpen}
        onClose={handleCartClose}
        onRemove={removeFromCart}
        onUpdate={updateCartItem}
      ></Cart>
    </div>
  );
};

export default ClientDashboard;
