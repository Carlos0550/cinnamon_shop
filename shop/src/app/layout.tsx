import "./globals.css";
import AppProvider from "../providers/AppProvider";
import SiteLayout from "../Components/Layout/SiteLayout";
import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";

export const metadata: Metadata = {
  title: "Cinnamon Shop",
  description: "Tienda Cinnamon",
  icons: { icon: "/logo.png" },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3001"),
  openGraph: {
    title: "Cinnamon Shop",
    description: "Tienda online de Maquillaje y cosméticos, situados en Candelaria Misiones Argentina",
    url: "/",
    type: "website",
    images: [{ url: "/logo.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Cinnamon Shop",
    description: "Tienda online de Maquillaje y cosméticos, situados en Candelaria Misiones Argentina",
    images: ["/logo.png"],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#ffffff" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Cinnamon Shop",
              url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3001",
              logo: "/logo.png",
              image: process.env.NEXT_PUBLIC_BUSINESS_IMAGE_URL || "/logo.png"
            })
          }}
        />
      </head>
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
