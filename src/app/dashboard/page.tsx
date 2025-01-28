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
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
    const userRole = localStorage.getItem("userRole");

    if (!userRole) {
      router.push("/auth/login");
      return;
    }

    setRole(userRole);
    setLoading(false);
  }, [router]);

  // No renderizar nada hasta que el componente esté montado
  if (!mounted) {
    return null;
  }

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
            scale: [1, 1.2, 1],
            rotate: [0, 10, -10, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <Image
            src="https://static.vecteezy.com/system/resources/previews/019/796/973/non_2x/motorbike-delivery-man-logo-icon-symbol-template-free-vector.jpg"
            alt="Delivery Nono"
            width={36}
            height={36}
            className="w-36 h-36 object-cover rounded-full"
            priority
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
    switch (role) {
      case "admin":
        return <AdminDashboard />;
      case "client":
        return <ClientDashboard />;
      case "delivery":
        return <DeliveryDashboard />;
      default:
        return <Text>Rol desconocido. Por favor, contáctanos.</Text>;
    }
  };

  return <AppLayout>{renderDashboard()}</AppLayout>;
};

export default Dashboard;
