"use client";

import Cart from "@/components/Cart/Cart";
import MenuList from "@/components/menu/MenuList";
import PromotionList from "@/components/Promotions/PromotionList";
import { db } from "@/firebase/firebaseConfig";
import { CartItem, Coupon, MenuItem, Order, Promotion } from "@/types";
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
import { DataSnapshot, onValue, push, ref, update } from "firebase/database";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

// Interfaces
interface FirebaseUser {
  role: string;
  name: string;
  email: string;
}

interface DeliveryMapState {
  [key: string]: string;
}

const ClientDashboard = () => {
  // Estados
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [orderHistory, setOrderHistory] = useState<Order[]>([]);
  const [deliveryMap, setDeliveryMap] = useState<DeliveryMapState>({});
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [comments, setComments] = useState("");
  const [activeTab, setActiveTab] = useState<string>("menu");
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  const router = useRouter();

  // Fetch delivery users
  useEffect(() => {
    try {
      const usersRef = ref(db, "users");
      const unsubscribe = onValue(usersRef, (snapshot: DataSnapshot) => {
        try {
          const data = snapshot.val();
          if (data) {
            const deliveryUsers = Object.entries(data)
              .filter(([_, user]: [string, any]) => 
                user && 
                typeof user === 'object' && 
                'role' in user && 
                user.role === 'delivery'
              )
              .reduce<DeliveryMapState>((acc, [id, user]  ) => {
                if (user && typeof user === 'object' && 'name' in user && typeof user.name === 'string') {
                  acc[id] = user.name;
                }
                return acc;
              }, {});
            setDeliveryMap(deliveryUsers);
          }
        } catch (error) {
          console.error('Error procesando datos de usuarios:', error);
          showNotification({
            title: 'Error',
            message: 'Error al cargar datos de repartidores',
            color: 'red',
          });
        } finally {
          setLoading(false);
        }
      });

      return () => unsubscribe();
    } catch (error) {
      console.error('Error en la suscripción de usuarios:', error);
      setLoading(false);
    }
  }, []);

  // Fetch user orders
  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      router.push("/auth/login");
      return;
    }

    try {
      const ordersRef = ref(db, "orders");
      const unsubscribe = onValue(ordersRef, (snapshot: DataSnapshot) => {
        try {
          const data = snapshot.val();
          if (data && typeof data === "object") {
            const userOrders = Object.entries(data)
              .map(([id, order]) => ({ ...(order as Order) }))
              .filter((order) => order.userId === userId);

            const activeOrder = userOrders.find(
              (order) => order.status === "pendiente"
            );
            const pastOrders = userOrders.filter(
              (order) => order.status !== "pendiente"
            );

            setCurrentOrder(activeOrder || null);
            setOrderHistory(pastOrders);
          }
        } catch (error) {
          console.error('Error procesando órdenes:', error);
          showNotification({
            title: 'Error',
            message: 'Error al cargar las órdenes',
            color: 'red',
          });
        }
      });

      return () => unsubscribe();
    } catch (error) {
      console.error('Error en la suscripción de órdenes:', error);
    }
  }, [router]);

  // Fetch promotions
  useEffect(() => {
    try {
      const promotionsRef = ref(db, "promotions");
      const unsubscribe = onValue(promotionsRef, (snapshot: DataSnapshot) => {
        try {
          const data = snapshot.val();
          if (data && typeof data === "object") {
            const promotionsArray = Object.entries(data).map(([id, promo]) => ({
              ...(promo as Promotion),
            }));
            setPromotions(promotionsArray);
          } else {
            setPromotions([]);
          }
        } catch (error) {
          console.error('Error procesando promociones:', error);
          showNotification({
            title: 'Error',
            message: 'Error al cargar las promociones',
            color: 'red',
          });
        }
      });

      return () => unsubscribe();
    } catch (error) {
      console.error('Error en la suscripción de promociones:', error);
    }
  }, []);

  // Handlers
  const addToCart = useCallback((item: MenuItem | Coupon, quantity: number) => {
    setCart((prev) => {
      const existingItem = prev.find((cartItem) => cartItem.id === item.id);
      if (existingItem) {
        return prev.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + quantity }
            : cartItem
        );
      }
      return [...prev, { ...item, quantity }];
    });
    setIsCartOpen(true);
  }, []);

  const removeFromCart = useCallback((id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const updateCartItem = useCallback((id: string, quantity: number) => {
    setCart((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  }, []);

  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value);
    if (value === "cart") {
      setIsCartOpen(true);
    }
  }, []);

  const handleCartClose = useCallback(() => {
    setIsCartOpen(false);
    setActiveTab("menu");
  }, []);

  const handleCancelOrder = useCallback(async (orderId: string) => {
    try {
      const orderRef = ref(db, `orders/${orderId}`);
      await update(orderRef, { status: "cancelado" });
      showNotification({
        title: "Pedido Cancelado",
        message: "Pedido cancelado correctamente.",
        color: "green",
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
  }, []);

  const handleConfirmOrder = useCallback(async () => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      showNotification({
        title: "Error",
        message: "Usuario no identificado",
        color: "red",
      });
      return;
    }

    const newOrder = {
      userId,
      items: cart,
      comments,
      status: "pendiente",
      total: cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
      createdAt: new Date().toISOString(),
    };

    try {
      await push(ref(db, "orders"), newOrder);
      showNotification({
        title: "Éxito",
        message: "Pedido confirmado correctamente",
        color: "green",
      });
      setCart([]);
      setComments("");
      setActiveTab("currentOrder");
    } catch (error) {
      console.error("Error al confirmar el pedido:", error);
      showNotification({
        title: "Error",
        message: "Hubo un problema al confirmar el pedido",
        color: "red",
      });
    }
  }, [cart, comments]);

  // Render
  if (loading) {
    return <div>Cargando...</div>;
  }

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