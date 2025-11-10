import "./globals.css";
import AppProvider from "../providers/AppProvider";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cinnamon Shop",
  description: "Tienda Cinnamon",
  icons: { icon: "/logo.png" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body suppressHydrationWarning>
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
