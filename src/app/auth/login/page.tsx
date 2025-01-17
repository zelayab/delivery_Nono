"use client";

import { auth, db } from "@/firebase/firebaseConfig";
import { Button, TextInput } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { get, ref, set } from "firebase/database";
import { useRouter } from "next/navigation";
import { useState } from "react";

type UserData = {
  email: string;
  name: string;
  role: string;
};

const LoginPage = () => {
  const [email, setEmail] = useState<string>("");
  const router = useRouter();

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();

    try {
      // Inicia sesión con Google
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      if (!user) {
        throw new Error("No se obtuvo información del usuario.");
      }

      const userId = user.uid; // UID del usuario
      const userEmail = user.email; // Correo electrónico del usuario
      const userName = user.displayName || "Usuario de Google"; // Nombre del usuario

      if (!userEmail) {
        throw new Error("El correo electrónico de Google no está disponible.");
      }

      // Referencia al usuario en la base de datos
      const userRef = ref(db, `users/${userId}`);
      const snapshot = await get(userRef);

      if (!snapshot.exists()) {
        // Si el usuario no existe, lo creamos en la base de datos con rol "client"
        await set(userRef, {
          email: userEmail,
          name: userName,
          role: "client", // Rol predeterminado
        });

        showNotification({
          title: "Usuario Creado",
          message: "Se ha registrado como cliente. Por favor, complete su perfil.",
          color: "green",
        });

        // Guardamos en localStorage
        localStorage.setItem("userId", userId);
        localStorage.setItem("userRole", "client");
        localStorage.setItem("userEmail", userEmail);
        localStorage.setItem("userName", userName);

        // Redirigimos al perfil
        router.push("/user");
      } else {
        // Si el usuario ya existe, obtenemos sus datos
        const userData = snapshot.val();
        const { role } = userData;

        // Guardamos en localStorage
        localStorage.setItem("userId", userId);
        localStorage.setItem("userRole", role);
        localStorage.setItem("userEmail", userEmail);
        localStorage.setItem("userName", userName);

        showNotification({
          title: "Bienvenido de nuevo",
          message: `Iniciaste sesión como ${role}.`,
          color: "blue",
        });

        // Redirigimos al dashboard correspondiente
        router.push(`/dashboard`);
      }
    } catch (err: any) {
      console.error("Error al iniciar sesión con Google:", err.message || err);
      showNotification({
        title: "Error",
        message: "Ocurrió un error al iniciar sesión con Google. Por favor, intenta nuevamente.",
        color: "red",
      });
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
  
    try {
      const snapshot = await get(ref(db, "users"));
      const users = snapshot.val() as { [key: string]: UserData };
  
      if (!users) {
        showNotification({
          title: "Error",
          message: "No hay usuarios registrados.",
          color: "red",
        });
        return;
      }
  
      const userEntry = Object.entries(users).find(
        ([, user]) => user.email === email
      );
  
      if (!userEntry) {
        showNotification({
          title: "Error",
          message: "El correo no está registrado.",
          color: "red",
        });
        return;
      }
  
      const [userId, userData] = userEntry;
  
      const { role } = userData;
  
      localStorage.setItem("userRole", role);
      localStorage.setItem("userId", userId);
  
      router.push("/dashboard");
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      showNotification({
        title: "Error",
        message: "Ocurrió un error al iniciar sesión.",
        color: "red",
      });
    }
  };
  

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100 text-black">
      <div className="hidden md:flex flex-1 relative">
        <video
          autoPlay
          loop
          muted
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source
            src="https://videos.pexels.com/video-files/7362582/7362582-hd_1920_1080_24fps.mp4"
            type="video/mp4"
          />
        </video>
        <div className="absolute inset-0 bg-blue-500 bg-opacity-50"></div>
        <div className="relative z-10 flex flex-col items-center justify-center text-white left-44">
          <h1 className="text-4xl font-bold mb-2">Delivery Nono</h1>
          <p className="text-xl font-light">¡Bienvenido a nuestra plataforma!</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md bg-white rounded shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-6 text-center">
            Iniciar Sesión
          </h2>

          <Button
            fullWidth
            color="blue"
            mb="sm"
            onClick={handleGoogleLogin}
            leftSection={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 48 48"
                width="20px"
                height="20px"
              >
                <path
                  fill="#FFC107"
                  d="M43.611 20.083H42V20H24v8h11.243C33.65 32.072 29.406 34 24 34c-6.627 0-12-5.373-12-12s5.373-12 12-12c2.9 0 5.555 1.033 7.675 2.741L38.004 8.59C34.537 5.683 29.564 4 24 4 12.954 4 4 12.954 4 24s8.954 20 20 20c10.228 0 18.863-7.526 19.891-17.167.073-.627.109-1.268.109-1.916 0-.948-.1-1.87-.289-2.834z"
                />
                <path
                  fill="#FF3D00"
                  d="M6.306 14.691l6.571 4.821C14.461 16.019 19.525 14 24 14c2.9 0 5.555 1.033 7.675 2.741L38.004 8.59C34.537 5.683 29.564 4 24 4c-7.355 0-13.746 3.863-17.694 9.691z"
                />
                <path
                  fill="#4CAF50"
                  d="M24 44c5.319 0 10.192-2.044 13.852-5.356l-6.429-5.394C29.485 34.759 26.88 36 24 36c-5.378 0-9.627-3.372-11.232-8.048l-6.53 5.027C9.893 40.271 16.518 44 24 44z"
                />
                <path
                  fill="#1976D2"
                  d="M43.611 20.083H42V20H24v8h11.243c-1.28 3.517-4.507 6.24-8.243 7.151V39h6.852C36.063 37.222 40 31.173 40 24c0-.948-.1-1.87-.289-2.834z"
                />
              </svg>
            }
          >
            Iniciar Sesión con Google
          </Button>

          <div className="flex items-center my-4">
            <hr className="flex-grow border-gray-300" />
            <span className="mx-4 text-gray-500">o</span>
            <hr className="flex-grow border-gray-300" />
          </div>

          <form onSubmit={handleEmailLogin}>
            <TextInput
              label="Correo Electrónico"
              placeholder="Tu correo"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              mb="sm"
            />
            <Button type="submit" fullWidth color="blue">
              Iniciar Sesión
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
