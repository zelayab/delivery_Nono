"use client";

import { MantineProvider } from "@mantine/core";
import "@mantine/notifications/styles.css";

import { Notifications } from "@mantine/notifications";
import "@mantine/notifications/styles.css";

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
       <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
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
