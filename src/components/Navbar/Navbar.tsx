"use client";

import {
  AppShell,
  Burger,
  Group,
  NavLink,
  ScrollArea,
  Text,
  useMantineTheme,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconDashboard, IconLogout, IconUser } from "@tabler/icons-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [opened, { toggle }] = useDisclosure(false); // Estado para el Navbar móvil
  const theme = useMantineTheme();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.clear(); // Limpiar datos del usuario
    router.push("/auth/login"); // Redirigir al login
  };

  return (
    <AppShell
      header={{ height: 80 }}
      navbar={{
        width: 300,
        breakpoint: "sm",
        collapsed: { mobile: !opened },
      }}
      padding="md"
    >
      {/* Header */}
      <AppShell.Header>
        <Group px="md">
          {/* Logo animado */}
          <motion.div
            className="cursor-pointer"
            onClick={() => router.push("/dashboard")}
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
              className="w-12 h-12 object-cover rounded-full"
            />
          </motion.div>

          {/* Título */}
          <Text fw={700} size="lg" color={theme.colors.blue[6]}>
            Delivery Nono
          </Text>

          {/* Botón para abrir/cerrar el navbar */}
          <Burger
            opened={opened}
            onClick={toggle}
            hiddenFrom="sm"
            size="sm"
            color={theme.colors.gray[6]}
          />
        </Group>
      </AppShell.Header>

      {/* Navbar */}
      <AppShell.Navbar p="md" className="text-black">
        <ScrollArea style={{ height: "100%" }}>
          <NavLink
            label="Dashboard"
            leftSection={<IconDashboard size={16} />}
            onClick={() => router.push("/dashboard")}
            mb="sm"
          />
          <NavLink
            label="Perfil"
            leftSection={<IconUser size={16} />}
            onClick={() => router.push("/user")}
            mb="sm"
          />
          <NavLink
            label="Cerrar Sesión"
            leftSection={<IconLogout size={16} />}
            color="red"
            onClick={handleLogout}
          />
        </ScrollArea>
      </AppShell.Navbar>

      {/* Contenido principal */}
      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
};

export default AppLayout;
