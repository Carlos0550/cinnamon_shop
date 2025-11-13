import "./globals.css";
import AppProvider from "../providers/AppProvider";
import SiteLayout from "../Components/Layout/SiteLayout";
import { AppContextProvider } from "@/providers/AppContext";
import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";

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
        <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}>
          <AppProvider>
              <SiteLayout>{children}</SiteLayout>
          </AppProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
