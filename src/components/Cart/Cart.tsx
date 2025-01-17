"use client";

import { db } from "@/firebase/firebaseConfig";
import {
    ActionIcon,
    Button,
    Drawer,
    Group,
    Image,
    NumberInput,
    SegmentedControl,
    Stack,
    Text,
    TextInput,
    Title,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { IconCheck, IconMinus, IconPlus, IconTrash, IconX } from "@tabler/icons-react";
import { onValue, push, ref } from "firebase/database";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  image: string;
}

interface NewOrder {
  items: OrderItem[];
  userId: string;
  status: string;
  timestamp: number;
  total: number;
  payment: string;
  address: string;
  comments?: string;
  discount?: number;
  deliveryId?: string | null;
  change?: number | null;


}

interface CartProps {
  cart: OrderItem[];
  onRemove: (id: string) => void;
  onUpdate: (id: string, quantity: number) => void;
  isOpen: boolean;
  onClose: () => void;
}

const Cart: React.FC<CartProps> = ({
  cart,
  onRemove,
  onUpdate,
  isOpen,
  onClose,
}) => {
  const [couponCode, setCouponCode] = useState<string>("");
  const [discountPercentage, setDiscountPercentage] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<string>("efectivo");
  const [isClient, setIsClient] = useState<boolean>(true);
  const [comments, setComments] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    if (role !== "client") {
      setIsClient(false);
    }
  }, []);

  if (!isClient) {
    return null; // No renderizar el carrito si el usuario no es cliente
  }

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount = (total * discountPercentage) / 100;
  const finalTotal = total - discount;

  const applyCoupon = () => {
    const couponRef = ref(db, `coupons/${couponCode}`);
    console.log("Applying coupon:", couponCode);

    onValue(
      couponRef,
      (snapshot: any) => {
        const data = snapshot.val();
        console.log("Coupon data:", data);

        if (data && data.isActive) {
          const now = new Date();
          const expiresAt = new Date(data.expiresAt);

          if (now > expiresAt) {
            showNotification({
              title: "Cupón Expirado",
              message: "Este cupón ya no es válido.",
              color: "red",
              icon: <IconX size={16} />,
            });
          } else {
            setDiscountPercentage(data.discount);
            showNotification({
              title: "Cupón Aplicado",
              message: `Se ha aplicado un descuento del ${data.discount}% a tu carrito.`,
              color: "green",
              icon: <IconCheck size={16} />,
            });
          }
        } else {
          showNotification({
            title: "Cupón Inválido",
            message: "El cupón ingresado no es válido.",
            color: "red",
            icon: <IconX size={16} />,
          });
        }
      },
      { onlyOnce: true }
    );
  };

  const handleConfirmOrder = async () => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      showNotification({
        title: "Error",
        message: "Inicia sesión para confirmar tu pedido.",
        color: "red",
        icon: <IconX size={16} />,
      });
      return;
    }

    const currentTimestamp = Date.now();

    const newOrder: NewOrder = {
      userId,
      items: cart.map((item) => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        image: item.image,
      })),
      status: "pendiente",
      deliveryId: null,
      timestamp: currentTimestamp,
      comments: comments,
      address: "Domicilio registrado o personalizado",
      total: finalTotal,
      payment: paymentMethod,
      change: paymentMethod === "efectivo" ? 0 : null,
      discount: discount,
    };

    try {
      const ordersRef = ref(db, `orders`);
      const orderRef = await push(ordersRef, newOrder); // Almacenar en un nodo global de órdenes

      showNotification({
        title: "Pedido Confirmado",
        message: "Tu pedido ha sido registrado exitosamente.",
        color: "green",
        icon: <IconCheck size={16} />,
      });

      localStorage.setItem("orderId", orderRef.key!);
      router.push(`/confirm-order?orderId=${orderRef.key}`);
    } catch (error) {
      console.error("Error al guardar el pedido:", error);
      showNotification({
        title: "Error",
        message: "No se pudo guardar el pedido. Inténtalo de nuevo.",
        color: "red",
        icon: <IconX size={16} />,
      });
    }
  };

  const postComments = (comments: string) => {
    if (comments.length > 100) {
      showNotification({
        title: "Comentario muy largo",
        message: "El comentario no puede tener más de 100 caracteres.",
        color: "red",
        icon: <IconX size={16} />,
      });
      return;
    }
    setComments(comments);
  }

  

  return (
    <Drawer
      opened={isOpen}
      onClose={onClose}
      title="Tu Carrito"
      padding="xl"
      size="lg"
      position="right"
      className="text-black"
    >
      {cart.length === 0 ? (
        <Stack align="center" justify="center" mt="xl">
          <Text color="dimmed">No hay productos en el carrito.</Text>
          <Text size="sm" color="dimmed">
            ¡Agrega productos desde el menú o las promociones!
          </Text>
        </Stack>
      ) : (
        <>
          <Stack>
            {cart.map((item) => (
              <Group key={item.id} align="center" mb="sm" wrap="nowrap">
                <Image
                  src={item?.image}
                  alt={item.name}
                  h={60}
                  w={60}
                  radius="md"
                  fit="cover"
                />
                <div style={{ flex: 1 }}>
                  <Title order={5}>{item.name}</Title>
                  <Text size="sm" color="dimmed">
                    ${item.price} x {item.quantity}
                  </Text>
                </div>
                <Group gap={10}>
                  <ActionIcon
                    color="blue"
                    onClick={() => onUpdate(item.id, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                  >
                    <IconMinus size={16} />
                  </ActionIcon>
                  <NumberInput
                    value={item.quantity}
                    onChange={(value) =>
                      onUpdate(item.id, Number(value) ? Number(value) : 1)
                    }
                    min={1}
                    max={10}
                    hideControls
                    size="xs"
                    style={{ width: 60 }}
                  />
                  <ActionIcon
                    color="blue"
                    onClick={() => onUpdate(item.id, item.quantity + 1)}
                  >
                    <IconPlus size={16} />
                  </ActionIcon>
                </Group>
                <ActionIcon
                  color="red"
                  onClick={() => onRemove(item.id)}
                  size="lg"
                >
                  <IconTrash size={18} />
                </ActionIcon>
              </Group>
            ))}
          </Stack>

          <Stack mt="lg">
            <TextInput
              label="Ingresa un cupón"
              placeholder="Ej: 50%OFF"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
            />
            <Button onClick={applyCoupon} color="blue" size="md">
              Aplicar Cupón
            </Button>
          </Stack>

          
          <Stack mt="lg">
            <Text fw={700}>Método de Pago</Text>
            <SegmentedControl
              value={paymentMethod}
              onChange={setPaymentMethod}
              data={[
                { label: "Efectivo", value: "efectivo" },
                { label: "Transferencia", value: "transferencia" },
              ]}
            />
          </Stack>

          <Stack mt="lg">
            <Text fw={700}>Comentarios</Text>
            <TextInput
              placeholder="Agrega comentarios adicionales..."
              onChange={(e) => postComments(e.target.value)}
              radius="md"
            />
          </Stack>

          <Stack mt="lg" py="md" px="lg" style={{ borderTop: "1px solid #e9ecef" }}>
            <Group gap={10}>
              <Text>Subtotal:</Text>
              <Text fw={700}>${total.toFixed(2)}</Text>
            </Group>
            {discount > 0 && (
              <Group gap={10} color="green">
                <Text>Descuento:</Text>
                <Text fw={700}>-${discount.toFixed(2)}</Text>
              </Group>
            )}
            <Group gap={10}>
              <Text>Total:</Text>
              <Text fw={700}>${finalTotal.toFixed(2)}</Text>
            </Group>
            <Button color="green" fullWidth mt="md" radius="md" onClick={handleConfirmOrder}>
              Confirmar Pedido
            </Button>
          </Stack>
        </>
      )}
    </Drawer>
  );
};

export default Cart;
