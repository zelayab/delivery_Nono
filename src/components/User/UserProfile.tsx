"use client";

import { db } from "@/firebase/firebaseConfig";
import { Button, Loader, Stack, Text, TextInput } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { get, ref, update } from "firebase/database";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const sanitizeFirebaseKey = (key: string) => key.replace(/[.#$[\]]/g, "_");

const UserProfile = () => {
  const [name, setName] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [role, setRole] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const router = useRouter();

  useEffect(() => {
    const fetchUserProfile = async () => {
      const rawUserId = localStorage.getItem("userId");
      if (!rawUserId) {
        router.push("/auth/login");
        return;
      }

      //sanitize es una función que reemplaza los caracteres especiales por guiones bajos
      const userId = sanitizeFirebaseKey(rawUserId);

      try {
        const userRef = ref(db, `users/${userId}`);
        const snapshot = await get(userRef);

        if (snapshot.exists()) {
          const data = snapshot.val();
          setName(data.name || "");
          setAddress(data.address || "");
          setPhone(data.phone || "");
          setEmail(data.email || localStorage.getItem("userEmail") || "");
          setRole(data.role || "");
          setError(null); // Clear any existing error
        } else {
          setError("No se encontraron datos del usuario.");
        }
      } catch (err) {
        console.error("Error al obtener el perfil:", err);
        setError("Error al cargar los datos del perfil.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [router]);

  const handleSaveProfile = async () => {
    setError(null);

    const rawUserId = localStorage.getItem("userId");
    if (!rawUserId) {
      setError("No se encontró el usuario.");
      return;
    }

    const userId = sanitizeFirebaseKey(rawUserId);

    try {
      // Actualizar información del perfil
      const updateData: {
        name: string;
        address?: string;
        phone?: string;
      } = { name: name };

      if (role === "client") {
        updateData.address = address;
        updateData.phone = phone;
      }

      await update(ref(db, `users/${userId}`), updateData);

      showNotification({
        title: "Éxito",
        message: "Perfil actualizado correctamente.",
        color: "blue",
      });
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Error al guardar el perfil."
      );
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader size="xl" color="blue" />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ maxWidth: "400px", margin: "auto", padding: "20px" }}>
        <Text style={{ color: "red", marginBottom: "20px" }}>{error}</Text>
        <Button
          onClick={() => router.push("/dashboard/client")}
          fullWidth
          color="gray"
        >
          Volver al Panel
        </Button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "400px", margin: "auto", padding: "20px" }}>
      <h2>Completa tu Perfil</h2>
      <Stack>
        <TextInput
          label="Nombre Completo"
          placeholder="Tu nombre"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        {role === "client" && (
          <>
            <TextInput
              label="Dirección"
              placeholder="Tu dirección"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
            <TextInput
              label="Teléfono"
              placeholder="Tu teléfono"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </>
        )}
        <TextInput
          label="Correo Electrónico"
          placeholder="Tu correo"
          value={email}
          disabled
        />
      </Stack>
      <br />
      <Stack>
        <Button onClick={handleSaveProfile} fullWidth mt="sm">
          Guardar
        </Button>
        <Button onClick={() => router.back()} fullWidth color="gray">
          Volver
        </Button>
      </Stack>
    </div>
  );
};

export default UserProfile;
