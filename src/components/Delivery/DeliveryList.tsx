



"use client";

import { db } from "@/firebase/firebaseConfig";
import { Avatar, Button, Card, Group, Stack, Text } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { onValue, ref, update } from "firebase/database";
import { useEffect, useState } from "react";

interface DeliveryPerson {
  id: string;
  name: string;
  email: string;
  role: string;
}

const DeliveryList = () => {
  const [deliveryPersons, setDeliveryPersons] = useState<DeliveryPerson[]>([]);

  useEffect(() => {
    const deliveryRef = ref(db, "users");

    const unsubscribe = onValue(deliveryRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const formattedDeliveryPersons = Object.entries(data).map(([id, value]: [string, any]) => ({
          id,
          ...value,
        }));
        setDeliveryPersons(formattedDeliveryPersons.filter((user) => user.role === "delivery"));
      }
    });

    return () => unsubscribe();
  }, []);

  const handleDemoteToClient = async (deliveryId: string) => {
    try {
      const deliveryRef = ref(db, `users/${deliveryId}`);
      await update(deliveryRef, { role: "client" });
      showNotification({
        title: "Éxito",
        message: "Repartidor degradado a cliente.",
        color: "blue",
      });
    } catch (error) {
      console.error("Error al degradar al repartidor:", error);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Repartidores</h1>
      <Stack >
        {deliveryPersons.map((delivery) => (
          <Card key={delivery.id} shadow="sm" padding="lg" radius="md" withBorder>
            <Group>
              <Avatar radius="xl" />
              <Stack >
                <Text w={500}>{delivery.name}</Text>
                <Text size="sm" color="dimmed">
                  {delivery.email}
                </Text>
              </Stack>
            </Group>
            <Group mt="md" >
              <Button size="xs" color="blue" onClick={() => handleDemoteToClient(delivery.id)}>
                Degradar a Cliente
              </Button>
            </Group>
          </Card>
        ))}
      </Stack>
    </div>
  );
};

export default DeliveryList;
