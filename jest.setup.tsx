import { jest } from "@jest/globals";
import { MantineProvider } from "@mantine/core";
import "@testing-library/jest-dom";
import { render as testingLibraryRender } from "@testing-library/react";
import React from "react";

//**
//  * Mock de `getComputedStyle` para garantizar que las pruebas
//  * tengan acceso a estilos calculados sin errores.
//  */
const { getComputedStyle } = window;
window.getComputedStyle = (elt) => getComputedStyle(elt);

//**
//  * Mock de `scrollIntoView` para evitar errores en componentes que lo usen.
//  */
window.HTMLElement.prototype.scrollIntoView = () => {};

//**
//  * Mock de `matchMedia` para manejar consultas de medios (media queries) y evitar errores.
//  */
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false, // Simula que la consulta de medios no coincide.
    media: query,
    onchange: null,
    addListener: jest.fn(), // Métodos requeridos por `matchMedia`.
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

//**
//  * Mock de `ResizeObserver` para evitar errores al probar componentes que dependen del cambio de tamaño.
//  */
class ResizeObserver {
  observe() {} // Simula el método para observar cambios.
  unobserve() {} // Simula el método para detener la observación.
  disconnect() {} // Simula el método para desconectar el observador.
}

window.ResizeObserver = ResizeObserver;

//**
//  * Mock de `next/router` para pruebas relacionadas con rutas en aplicaciones Next.js.
//  */
jest.mock("next/router", () => ({
  useRouter: jest.fn().mockReturnValue({
    route: "/", // Ruta actual simulada.
    pathname: "/", // Ruta del archivo actual.
    query: {}, // Query string simulada.
    asPath: "/", // Path completo simulado.
  }),
}));

//**
//  * Mock de `firebase/app` para evitar inicializaciones reales de Firebase en las pruebas.
//  */
jest.mock("firebase/app", () => ({
  initializeApp: jest.fn(() => ({})), // Simula la inicialización de Firebase.
}));

//**
//  * Mock de `firebase/auth` para simular autenticación de usuarios.
//  */
jest.mock("firebase/auth", () => ({
  getAuth: jest.fn(() => ({
    signInWithEmailAndPassword: jest.fn(), // Mock de inicio de sesión con correo y contraseña.
  })),
}));

//**
//  * Mock de `firebase/database` para pruebas de operaciones en la base de datos de Firebase.
//  */
jest.mock("firebase/database", () => ({
  getDatabase: jest.fn(() => ({
    ref: jest.fn(), // Simula la referencia a una ubicación en la base de datos.
    remove: jest.fn(() => Promise.resolve()), // Simula la eliminación de datos.
    set: jest.fn(() => Promise.resolve()), // Simula el guardado de datos.
    update: jest.fn(() => Promise.resolve()), // Simula la actualización de datos.
  })),
  ref: jest.fn(() => "mockRef"), // Mock para la referencia directa.
  remove: jest.fn(() => Promise.resolve()), // Mock de eliminación directa.
  set: jest.fn(() => Promise.resolve()), // Mock de guardado directo.
  update: jest.fn(() => Promise.resolve()), // Mock de actualización directa.
}));

//**
//  * Mock de `@mantine/notifications` para pruebas de notificaciones en componentes Mantine.
//  */
jest.mock("@mantine/notifications", () => ({
  showNotification: jest.fn(), // Simula la llamada al método para mostrar notificaciones.
}));

//**
//  * Variables de entorno para configurar Firebase en un entorno de pruebas.
//  */
process.env.NEXT_PUBLIC_FIREBASE_API_KEY = "test-api-key";
process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = "test-auth-domain";
process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL =
  "https://test.firebaseio.com";
process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = "test-project-id";
process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = "test-storage-bucket";
process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID =
  "test-messaging-id";
process.env.NEXT_PUBLIC_FIREBASE_APP_ID = "test-app-id";

//**
//  * Función personalizada de renderizado que utiliza MantineProvider.
//  * Permite probar componentes con temas de Mantine aplicados.
//  *
//  * @param ui - El componente React que se quiere renderizar.
//  */
export function render(ui: React.ReactNode) {
  return testingLibraryRender(ui, {
    wrapper: ({ children }: { children: React.ReactNode }) => (
      // Proveedor de Mantine con tema personalizado para las pruebas.
      <MantineProvider theme={{ primaryColor: "blue" }}>
        {children}
      </MantineProvider>
    ),
  });
}
