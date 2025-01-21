This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.


# 🍕 Delivery El Nono

Bienvenidos al sistema de gestión de pedidos de **Delivery El Nono**, una rotisería ubicada en el barrio de Tres Cerritos, Salta. Este proyecto tiene como objetivo digitalizar y optimizar la gestión de pedidos, clientes y repartidores.

## 🛠️ Tecnologías Utilizadas

Este proyecto utiliza las siguientes tecnologías y herramientas:

- **Frontend**: [Next.js](https://nextjs.org) ⚡
- **Estilo**: [Mantine UI](https://mantine.dev/) 🎨
- **Backend**: [Firebase Realtime Database](https://firebase.google.com/products/realtime-database) 🔥
- **Notificaciones**: [Mantine Notifications](https://mantine.dev/others/notifications/) 📬
- **Testing**: [Jest](https://jestjs.io/) y [React Testing Library](https://testing-library.com/) ✅
- **Control de versiones**: [GitHub](https://github.com) 🚀

## 🚀 Características Principales

1. **Gestión de Clientes**:
   - Registro con nombre, correo electrónico, domicilio y teléfono.
   - Acceso al menú y promociones.

2. **Gestión de Pedidos**:
   - Creación de pedidos con selección de platos y promociones.
   - Personalización de pedidos con comentarios adicionales (salsas, ingredientes, etc.).
   - Gestión de estados: aceptación, preparación y entrega.

3. **Gestión de Promociones**:
   - Promociones tipo combo y descuentos por monto mínimo.

4. **Control de Disponibilidad**:
   - Indicar si un plato o promoción está disponible.

5. **Feedback del Cliente**:
   - Opinión y reclamos tras la entrega.

## 📚 Estructura del Proyecto

- **Frontend**:
  - **Página principal**: Explora el menú y las promociones.
  - **Gestión de pedidos**: Registro, selección y confirmación.
  - **Componentes reutilizables**: Diseñados con Mantine UI.
- **Backend**:
  - Gestión en tiempo real con Firebase Realtime Database.

## 🔧 Configuración del Entorno

### Requisitos Previos

1. Node.js >= 16.x
2. Firebase Configurado.
3. Clonar el repositorio desde GitHub.

### Instalación

1. Clona este repositorio:
   ```bash
   git clone https://github.com/tu-repo/delivery-el-nono.git
   cd delivery-el-nono
   ```

2. Instala las dependencias:
   ```bash
   npm install
   ```

3. Crea un archivo `.env.local` con las claves de Firebase:
   ```plaintext
   NEXT_PUBLIC_FIREBASE_API_KEY=<tu-api-key>
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=<tu-auth-domain>
   NEXT_PUBLIC_FIREBASE_DATABASE_URL=<tu-database-url>
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=<tu-project-id>
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=<tu-storage-bucket>
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=<tu-messaging-id>
   NEXT_PUBLIC_FIREBASE_APP_ID=<tu-app-id>
   ```

4. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```

5. Accede a [http://localhost:3000](http://localhost:3000).

## 🧪 Pruebas

El proyecto utiliza **Jest** y **React Testing Library** para garantizar la calidad del código.

- Ejecuta los tests:
  ```bash
  npm test
  ```

- Para obtener la cobertura:
  ```bash
  npm test -- --coverage
  ```

## 📦 Despliegue

Este proyecto está diseñado para ser desplegado en [Vercel](https://vercel.com/).

1. Conecta tu repositorio con Vercel.
2. Configura las variables de entorno en el dashboard de Vercel.
3. Inicia el despliegue.

Consulta la [documentación oficial de Next.js](https://nextjs.org/docs/app/building-your-application/deploying) para más detalles.

## 🏆 Metodología Scrum

Este proyecto sigue la metodología ágil Scrum con las siguientes etapas:

1. **Sprint Planning**: Análisis y selección de tareas.
2. **Sprint Review**: Presentación de avances al cliente.
3. **Sprint Retrospective**: Evaluación del trabajo realizado.

### Tablero de Proyecto

El proyecto utiliza GitHub Projects para la gestión de tareas. Visítalo [aquí](https://docs.github.com/en/issues/planning-and-tracking-with-projects/learning-about-projects/about-projects).

## 📄 Licencia

Este proyecto es de código abierto bajo la licencia [MIT](LICENSE).

---

📬 **Contacto**: Para más información o soporte, por favor contáctanos en nuestros githubs

