"use client";

import { Button, Text } from "@mantine/core";
import { useRouter } from "next/navigation";

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold text-gray-700 mb-4">403 - No Autorizado</h1>
      <Text className="mb-4 text-gray-500">
        No tienes permiso para acceder a esta página.
      </Text>
      <Button color="blue" onClick={() => router.push("/")}>
        Volver al Inicio
      </Button>
    </div>
  );
}
