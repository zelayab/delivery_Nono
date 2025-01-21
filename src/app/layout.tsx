"use client";

import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// Definición de fuentes personalizadas usando next/font
const poppins = Geist({
  subsets: ["latin"],
  variable: "--font-poppins",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${poppins.variable} ${geistMono.variable}`}>
      <body
        style={{
          fontFamily: "var(--font-poppins)",
          margin: 0,
          padding: 0,
          boxSizing: "border-box",
        }}
      >
        {/* Proveedor de tema Mantine */}
        <MantineProvider
          theme={{
            fontFamily: "var(--font-poppins)",
            fontFamilyMonospace: "var(--font-geist-mono)",
          }}
          withGlobalClasses
        >
          {/* Notificaciones */}
          <Notifications />
          {children}
        </MantineProvider>
      </body>
    </html>
  );
}
