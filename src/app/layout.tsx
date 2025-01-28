"use client";

import { MantineProvider } from '@mantine/core';
import "@mantine/core/styles.css";
import { Notifications } from "@mantine/notifications";
import "@mantine/notifications/styles.css";
import { Poppins } from 'next/font/google';
import "./globals.css";

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
});
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  
  return (
    <html lang="en"  className={poppins.variable} >
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
          fontFamily: "Poppins, sans-serif",
          margin: 0,
          padding: 0,
          boxSizing: "border-box",
        }}
      >
        <MantineProvider
         theme={{
          fontFamily: 'Poppins, sans-serif',
          fontFamilyMonospace: 'Poppins, sans-serif',
        }}
        withGlobalClasses
        >
          <Notifications />
          {children}
        </MantineProvider>
      </body>
    </html>
  );
}
