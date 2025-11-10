import "./globals.css";
import AppProvider from "../providers/AppProvider";
import SiteLayout from "../Components/Layout/SiteLayout";
import { AppContextProvider } from "@/providers/AppContext";
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
      <body>
        <AppProvider>
          <AppContextProvider>
            <SiteLayout>{children}</SiteLayout> 
          </AppContextProvider>
        </AppProvider>
      </body>
    </html>
  );
}
