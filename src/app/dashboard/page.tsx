"use client";

import AppLayout from "@/components/Navbar/Navbar";
import { Loader, Text } from "@mantine/core";
import { motion } from "motion/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AdminDashboard from "./admin/page";
import ClientDashboard from "./client/page";
import DeliveryDashboard from "./delivery/page";

const Dashboard = () => {
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const userRole = localStorage.getItem("userRole");

    if (!userRole) {
      router.push("/auth/login");
      return;
    }

    setRole(userRole);
    setLoading(false);
  }, [router]);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          textAlign: "center",
          width: "100%",
          backgroundColor: "#228be6",
        }}
      >
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
          <Image
            src="https://static.vecteezy.com/system/resources/previews/019/796/973/non_2x/motorbike-delivery-man-logo-icon-symbol-template-free-vector.jpg"
            alt="Delivery Nono"
            className="w-36 h-36 object-cover rounded-full"
          />
        </motion.div>
        <Loader size="4xl" variant="dots" color="blue" />
        <Text size="xl" mt="md">
          Cargando...
        </Text>
      </div>
    );
  }

  const renderDashboard = () => {
    if (role === "admin") return <AdminDashboard />;
    if (role === "client") return <ClientDashboard />;
    if (role === "delivery") return <DeliveryDashboard />;
    return <Text>Rol desconocido. Por favor, contáctanos.</Text>;
  };

  return <AppLayout>{renderDashboard()}</AppLayout>;
};

export default Dashboard;
