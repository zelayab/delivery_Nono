"use client";

import { Anchor, Loader, Text, Title } from "@mantine/core";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userRole = localStorage.getItem("userRole");
        if (userRole) {
          setIsAuthenticated(true);
          router.push(`/dashboard/${userRole}`);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Error verificando autenticación:", error);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader size="xl" color="blue" />
      </div>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-blue-500 text-white">
      {/* Logo con animación de Framer Motion */}
      <motion.div
        className="w-48 h-48 bg-white rounded-full shadow-lg flex items-center justify-center mb-6"
        animate={{
          scale: [1, 1.2, 1], // Escala
          rotate: [0, 10, -10, 0], // Rotación
        }}
        transition={{
          duration: 2, // Duración
          repeat: Infinity, // Repetir indefinidamente
          ease: "easeInOut", // Suavizado
        }}
      >
        <img
          src="https://static.vecteezy.com/system/resources/previews/019/796/973/non_2x/motorbike-delivery-man-logo-icon-symbol-template-free-vector.jpg"
          alt="Delivery Nono"
          className="w-36 h-36 object-cover rounded-full"
        />
      </motion.div>

      <Title order={1} className="text-center mb-4 text-white">
        Delivery Nono
      </Title>
      <Text className="text-center mb-6 text-white">
        ¡Bienvenido a Delivery Nono! Si eres un cliente, puedes iniciar sesión{" "}
        <Anchor href="/auth/login" underline="hover" className="text-white font-semibold">
          aquí
        </Anchor>.
      </Text>
    </div>
  );
}
