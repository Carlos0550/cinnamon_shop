import "./globals.css";
import AppProvider from "../providers/AppProvider";
import SiteLayout from "../Components/Layout/SiteLayout";
import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Inter } from "next/font/google";
import { getBusinessInfo } from "@/Api/useBusiness";

const inter = Inter({ subsets: ["latin"], variable: "--font-stack" });

export async function generateMetadata(): Promise<Metadata> {
  const business = await getBusinessInfo();
  const businessName = business?.name || "Tienda Online";
  const description = `Tienda online de ${businessName}`;

  return {
    title: {
      template: `%s | ${businessName}`,
      default: businessName,
    },
    description: description,
    icons: { icon: "/logo.png" },
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3001"),
    openGraph: {
      title: businessName,
      description: description,
      url: "/",
      type: "website",
      images: [{ url: process.env.NEXT_PUBLIC_BUSINESS_IMAGE_URL || "/logo.png" }],
      siteName: businessName,
    },
    twitter: {
      card: "summary_large_image",
      title: businessName,
      description: description,
      images: [process.env.NEXT_PUBLIC_BUSINESS_IMAGE_URL || "/logo.png"],
    },
    robots: { index: true, follow: true },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const business = await getBusinessInfo();
  const businessName = business?.name || "Tienda Online";
  
  return (
    <html lang="es" className={inter.variable}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#ffffff" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: businessName,
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
