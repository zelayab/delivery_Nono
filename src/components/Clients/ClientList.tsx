"use client";

import { db } from "@/firebase/firebaseConfig";
import { Avatar, Button, Card, Container, Group, Stack, Text } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { onValue, ref, update } from "firebase/database";
import { useEffect, useState } from "react";

interface Client {
  id: string;
  name: string;
  email: string;
  role: string;
}

const ClientList = () => {
  const [clients, setClients] = useState<Client[]>([]);

  useEffect(() => {
    const clientRef = ref(db, "users");

    const unsubscribe = onValue(clientRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const formattedClients = Object.entries(data).map(([id, value]: [string, any]) => ({
          id,
          ...value,
        }));
        setClients(formattedClients.filter((user) => user.role === "client"));
      }
    });

    return () => unsubscribe();
  }, []);

  const handlePromoteToDelivery = async (clientId: string) => {
    try {
      const clientRef = ref(db, `users/${clientId}`);
      await update(clientRef, { role: "delivery" });
      showNotification({
        title: "Éxito",
        message: "Cliente promovido a repartidor.",
        color: "blue",
      });
    } catch (error) {
      console.error("Error al promover a repartidor:", error);
    }
  };

  const handleDeleteClient = async (clientId: string) => {
    try {
      const clientRef = ref(db, `users/${clientId}`);
      await update(clientRef, { role: "inactive" });
      showNotification({
        title: "Éxito",
        message: "Cliente dado de baja.",
        color: "red",
      });
    } catch (error) {
      console.error("Error al dar de baja al cliente:", error);
    }
  };

  return (
    <Container>
      <h1 className="text-2xl font-bold mb-6">Clientes</h1>
      <Stack p={20}>
        {clients.map((client) => (
          <Card key={client.id} shadow="sm" padding="lg" radius="md" withBorder>
            <Group>
              <Avatar radius="xl" />
              <Stack >
                <Text w={500}>{client.name}</Text>
                <Text size="sm" color="dimmed">
                  {client.email}
                </Text>
              </Stack>
            </Group>
            <Group mt="md">
              <Button size="xs" color="blue" onClick={() => handlePromoteToDelivery(client.id)}>
                Promover a Repartidor
              </Button>
              <Button size="xs" color="red" onClick={() => handleDeleteClient(client.id)}>
                Dar de Baja
              </Button>
            </Group>
          </Card>
        ))}
      </Stack>
    </Container>
  );
};

export default ClientList;