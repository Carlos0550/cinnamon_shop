import type { Metadata } from "next"
import HomeComponent from "@/Components/Home/Home"
import { ProductsResponse, Products } from "@/Api/useProducts"
import { CategoriesResponse } from "@/Api/useCategories"
import { getBusinessInfo } from "@/Api/useBusiness"

export default async function Home({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const sp = await searchParams
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api"
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3001"
  const business = await getBusinessInfo();
  const businessName = business?.name || "Tienda Online";
  const businessImage = business?.business_image || `${siteUrl}/logo.png`;
  
  // Prepare Query Params for Products
  const qp = new URLSearchParams()
  qp.append("limit", "30") // Default limit in Home.tsx
  if (sp?.title && sp.title.trim()) qp.append("title", sp.title.trim())
  if (sp?.categoryId && sp.categoryId.trim()) qp.append("categoryId", sp.categoryId.trim())
  
  // Fetch Products
  let productsData: ProductsResponse | undefined = undefined
  let products: Products[] = []
  try {
    const res = await fetch(`${baseUrl}/products/public?${qp.toString()}`, { next: { revalidate: 180 } })
    if (res.ok) {
        productsData = await res.json()
        products = productsData?.data?.products || []
    }
  } catch {}

  // Fetch Categories
  let categoriesData: CategoriesResponse | undefined = undefined
  try {
    const resCat = await fetch(`${baseUrl}/products/public/categories`, { next: { revalidate: 3600 } })
    if (resCat.ok) {
        categoriesData = await resCat.json()
    }
  } catch {}

  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: Array.isArray(products) ? products.map((p, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      url: `${siteUrl}/${p.id}`,
      name: p.title,
      image: Array.isArray(p.images) ? p.images[0] : undefined
    })) : []
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemList) }} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: businessName,
            url: siteUrl,
            image: businessImage,
          })
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: "Productos",
            url: siteUrl,
            primaryImageOfPage: businessImage,
          })
        }}
      />
      <HomeComponent initialProducts={productsData} initialCategories={categoriesData} />
    </>
  )
}

export async function generateMetadata({ searchParams }: { searchParams: Promise<Record<string, string>> }): Promise<Metadata> {
  const sp = await searchParams
  const titleQ = sp?.title?.trim()
  const catQ = sp?.categoryId?.trim()
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3001"
  
  const business = await getBusinessInfo();
  const businessName = business?.name || "Tienda Online";
  const bizDescription = business?.description || ''
  const businessImage = business?.business_image || `${siteUrl}/opengraph-image`;
  const base = businessName;
  
  const parts = [base]
  if (titleQ) parts.push(`Buscar: ${titleQ}`)
  if (catQ) parts.push(`Categoría: ${catQ}`)
  const fullTitle = parts.join(" · ")
  return {
    title: fullTitle,
    description: titleQ ? `Resultados para "${titleQ}" en ${businessName}` : bizDescription,
    robots: { index: true, follow: true },
    alternates: { canonical: siteUrl },
    openGraph: {
      title: fullTitle,
      description: titleQ ? `Resultados para "${titleQ}" en ${businessName}` : bizDescription,
      url: siteUrl,
      type: "website",
      images: [
        { url: businessImage },
      ]
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: titleQ ? `Resultados para "${titleQ}" en ${businessName}` : bizDescription,
      images: [businessImage]
    }
  }
}
