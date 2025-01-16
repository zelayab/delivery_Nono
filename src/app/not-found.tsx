"use client";

import { Button, Text } from "@mantine/core";
import { useRouter } from "next/navigation";

export default function NotFoundPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold text-gray-700 mb-4">404 - Página No Encontrada</h1>
      <Text className="mb-4 text-gray-500">
        La página que estás buscando no existe o ha sido movida.
      </Text>
      <Button color="blue" onClick={() => router.push("/")}>
        Volver al Inicio
      </Button>
    </div>
  );
}