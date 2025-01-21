"use client";

import { db } from "@/firebase/firebaseConfig";
import { Loader } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { get, ref } from "firebase/database";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

// Tipos para el pedido
interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  items: OrderItem[];
  total: number;
  discount: number;
  address: string;
  comments: string;
}

const ConfirmOrder = () => {
  const [order, setOrder] = useState<Order | null>(null);
  const searchParams = useSearchParams(); // Obtener los parámetros de la URL
  const router = useRouter();

  useEffect(() => {
    const fetchOrder = async () => {
      const orderId = searchParams.get("orderId"); // Obtener el parámetro "orderId" desde la URL
      if (!orderId) {
        showNotification({
          title: "Error",
          message: "No se encontró el pedido.",
          color: "red",
        });
        router.push("/dashboard");
        return;
      }

      try {
        console.log("Fetching order with ID:", orderId); // Debugging
        const orderRef = ref(db, `orders/${orderId}`);
        const snapshot = await get(orderRef);
        if (snapshot.exists()) {
          console.log("Order data:", snapshot.val()); // Debugging
          setOrder(snapshot.val());
        } else {
          showNotification({
            title: "Error",
            message: "Pedido no encontrado.",
            color: "red",
          });
          router.push("/dashboard");
        }
      } catch (error) {
        console.error("Error al obtener el pedido:", error);
        showNotification({
          title: "Error",
          message: "Hubo un problema al cargar el pedido.",
          color: "red",
        });
        router.push("/dashboard");
      }
    };

    fetchOrder();
  }, [router, searchParams]);

  if (!order) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader size="xl" color="blue" />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 text-black">
      <div className="bg-white p-8 rounded shadow-md max-w-md w-full text-center">
        <h1 className="text-2xl font-bold mb-4">Confirmación de Pedido</h1>
        <p className="mb-4">Gracias por tu pedido. Estamos procesándolo.</p>

        <div className="text-left mb-6">
          <h2 className="text-lg font-semibold mb-2">Resumen del Pedido</h2>
          <p><strong>Número de Orden:</strong> {order.id}</p>
          <ul className="mt-2">
            {order.items.map((item) => (
              <li key={item.id} className="flex justify-between border-b py-1">
                <span>{item.name} x {item.quantity}</span>
                <span>${(item.price * item.quantity).toFixed(2)}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 flex justify-between">
            <strong>Subtotal:</strong>
            <span>${order.total.toFixed(2)}</span>
          </p>
          {order.discount > 0 && (
            <p className="flex justify-between text-green-500">
              <strong>Descuento:</strong>
              <span>-${order.discount.toFixed(2)}</span>
            </p>
          )}
          <p className="flex justify-between font-bold">
            <strong>Total:</strong>
            <span>${(order.total - order.discount).toFixed(2)}</span>
          </p>
          <p className="mt-4">
            <strong>Dirección:</strong> {order.address}
          </p>
          <p>
            <strong>Comentarios:</strong> {order.comments}
          </p>
        </div>

        <button
          onClick={() => router.push("/dashboard")}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Volver al Panel
        </button>
      </div>
    </div>
  );
};



export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Cargando...</div>}>
      <ConfirmOrder />
    </Suspense>
  );
}