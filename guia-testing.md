# Guía de Configuración para Testing con Mantine, Jest y React Testing Library

Esta guía describe cómo configurar **Mantine**, **Jest**, y **React Testing Library** para realizar pruebas en componentes de React.

---

## 1. **Instalación de Dependencias**

Ejecuta los siguientes comandos para instalar las dependencias necesarias:

```bash
# Instalar Jest y React Testing Library
npm install --save-dev jest @testing-library/react @testing-library/jest-dom

# Instalar mock para Mantine Notifications
npm install --save-dev jest-mock

# Instalar React Testing Library para eventos DOM
npm install --save-dev @testing-library/user-event
```

---

## 2. **Configuración de Jest**

Crea o edita el archivo `jest.config.js` para que Jest reconozca la configuración:

```typescript
import type { Config } from "jest";

const config: Config = {
  testEnvironment: "jest-environment-jsdom",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
  },
  setupFilesAfterEnv: ["<rootDir>/jest.setup.tsx"],
  transform: {
    "^.+\\.(ts|tsx|js|jsx)$": "babel-jest",
  },
  transformIgnorePatterns: ["/node_modules/(?!(modulo-especial|otro-modulo)/)"],
  testPathIgnorePatterns: ["/node_modules/", "/.next/"],
  moduleDirectories: ["node_modules", "<rootDir>/"],
};

export default config;
```

---

## 3. **Configuración de `jest.setup.js`**

Configura Jest para que funcione con `@testing-library` y Mantine.

Crea un archivo llamado `jest.setup.js` y agrega:

```typescript

// en nuestro casoimport { jest } from "@jest/globals";
import { MantineProvider } from "@mantine/core";
import "@testing-library/jest-dom";
import { render as testingLibraryRender } from "@testing-library/react";
import React from "react";

const { getComputedStyle } = window;
window.getComputedStyle = (elt) => getComputedStyle(elt);
window.HTMLElement.prototype.scrollIntoView = () => {};

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

window.ResizeObserver = ResizeObserver;

jest.mock("next/router", () => ({
  useRouter: jest.fn().mockReturnValue({
    route: "/",
    pathname: "/",
    query: {},
    asPath: "/",
  }),
}));

jest.mock("firebase/app", () => ({
  initializeApp: jest.fn(() => ({})),
}));

jest.mock("firebase/auth", () => ({
  getAuth: jest.fn(() => ({
    signInWithEmailAndPassword: jest.fn(),
  })),
}));

jest.mock("firebase/database", () => ({
  getDatabase: jest.fn(() => ({
    ref: jest.fn(),
    remove: jest.fn(() => Promise.resolve()),
    set: jest.fn(() => Promise.resolve()),
    update: jest.fn(() => Promise.resolve()),
  })),
  ref: jest.fn(() => "mockRef"),
  remove: jest.fn(() => Promise.resolve()),
  set: jest.fn(() => Promise.resolve()),
  update: jest.fn(() => Promise.resolve()),
}));



jest.mock("@mantine/notifications", () => ({
  showNotification: jest.fn(),
}));

process.env.NEXT_PUBLIC_FIREBASE_API_KEY = "test-api-key";
process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = "test-auth-domain";
process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL = "https://test.firebaseio.com";
process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = "test-project-id";
process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = "test-storage-bucket";
process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = "test-messaging-id";
process.env.NEXT_PUBLIC_FIREBASE_APP_ID = "test-app-id";

export function render(ui: React.ReactNode) {
  return testingLibraryRender(ui, {
    wrapper: ({ children }: { children: React.ReactNode }) => (
      <MantineProvider theme={{ primaryColor: "blue" }}>
        {children}
      </MantineProvider>
    ),
  });
}

-------------------------------------
//en otro caso
import "@testing-library/jest-dom"; // Matchers personalizados
import { server } from "./src/mocks/server"; // Mock de backend si usas MSW

// Configuración para inicializar server de mocks antes de pruebas
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

---

## 4. **Mock de Mantine Notifications**

Para realizar pruebas que impliquen el uso de `showNotification`, configura un mock para evitar llamadas reales durante los tests.

Edita o crea un archivo `__mocks__/mantine.js`:

```typescript
export const showNotification = jest.fn();
```

En tu test, asegúrate de usar el mock:

```typescript
jest.mock("@mantine/notifications", () => ({
  showNotification: jest.fn(),
}));
```

---

## 5. **Renderizado con MantineProvider**

Para garantizar que los componentes se rendericen correctamente con los estilos de Mantine, crea un wrapper para envolver tu aplicación durante las pruebas:

Crea un archivo `src/test-utils/render.js`:

```typescript
import { MantineProvider } from "@mantine/core";
import { render as testingLibraryRender } from "@testing-library/react";

export function render(ui: React.ReactNode) {
  return testingLibraryRender(ui, {
    wrapper: ({ children }: { children: React.ReactNode }) => (
      <MantineProvider theme={{ primaryColor: "blue" }}>{children}</MantineProvider>
    ),
  });
}

```

En tus pruebas, importa `customRender` en lugar de `render`:

```typescript
import { customRender as render } from "@/test-utils/render";
```

---

## 6. **Escritura de Pruebas**

### a. **Test de Renderizado**
Prueba que el componente se renderice correctamente:

```typescript
test("Renders the product list", () => {
  render(<ItemManager items={mockItems} type="menu" />);
  expect(screen.getByText("Pizza")).toBeInTheDocument();
});
```

### b. **Test de Interacciones**
Prueba clics en botones y comportamiento dinámico:

```typescript
test("Muestra una notificación al eliminar un producto", async () => {
  render(<ItemManager items={mockItems} type="menu" />);

  const deleteButton = screen.getByRole("button", { name: /Eliminar/i });
  fireEvent.click(deleteButton);

  // Verifica que se haya mostrado la notificación
  expect(showNotification).toHaveBeenCalledWith(
    expect.objectContaining({
      title: "Producto/Promoción eliminado",
      message: "Producto/Promoción eliminado con éxito.",
    })
  );
});
```

### c. **Test de Formularios**
Simula el llenado de formularios y verifica la lógica del envío:

```typescript
test("Muestra una notificación al crear un producto", async () => {
  render(<ItemManager items={mockItems} type="menu" />);

  const createButton = screen.getByRole("button", { name: /Crear Nuevo Producto/i });
  fireEvent.click(createButton);

  // Completa el formulario
  fireEvent.change(screen.getByLabelText(/Nombre/i), { target: { value: "Nuevo Producto" } });
  fireEvent.change(screen.getByLabelText(/Precio/i), { target: { value: 100 } });

  const saveButton = screen.getByRole("button", { name: /Guardar/i });
  fireEvent.click(saveButton);

  // Verifica que se haya mostrado la notificación
  expect(showNotification).toHaveBeenCalledWith(
    expect.objectContaining({
      title: "Producto/Promoción creado",
      message: "Producto/Promoción creado con éxito.",
    })
  );
});
```

---

## 7. **Solución de Problemas Comunes**

### **Problema 1: Texto no encontrado en el DOM**
- Usa `waitFor` si el contenido tarda en renderizarse:
  ```typescript
  await waitFor(() => {
    expect(screen.getByText("Texto esperado")).toBeInTheDocument();
  });
  ```

### **Problema 2: Mocks de funciones no llamados**
- Asegúrate de usar el mock correcto (por ejemplo, `jest.mock`).
- Verifica que la función que estás testeando está conectada al evento que simulas.

### **Problema 3: Elementos no accesibles**
- Usa selectores más específicos o basados en accesibilidad:
  ```typescript
  screen.getByRole("button", { name: /Guardar/i });
  ```

---

## 8. **Ejecutar Pruebas**

Para ejecutar las pruebas, usa el siguiente comando:

```bash
npm test
```

Si necesitas ver más detalles del test:

```bash
npm test -- --watchAll --verbose
```

---

Con estos pasos, tendrás una configuración funcional para probar componentes de React con **Mantine**, **Jest**, y **React Testing Library**.
