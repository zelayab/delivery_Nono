"use client";

import AppLayout from "@/components/Navbar/Navbar";
import { Container, Loader, Text } from "@mantine/core";
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
      <Container>
        <Loader size="lg" variant="dots" mt="xl" />
        <Text size="lg" mt="sm" >
          Cargando...
        </Text>
      </Container>
    );
  }

  const renderDashboard = () => {
    if (role === "admin") return <AdminDashboard />;
    if (role === "client") return <ClientDashboard />;
    if (role === "delivery") return <DeliveryDashboard />;
    return <Text >Rol desconocido. Por favor, contáctanos.</Text>;
  };

  return <AppLayout>{renderDashboard()}</AppLayout>;
};

export default Dashboard;
