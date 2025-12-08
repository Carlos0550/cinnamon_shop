import type { Metadata } from "next"
import { Suspense } from "react"
import HomeComponent from "@/Components/Home/Home"


export default async function Home({ searchParams }: { searchParams?: Record<string, string | string[] | undefined> }) {
  const sp = searchParams || {}
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api"
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3001"
  const qp = new URLSearchParams()
  const titleQ = typeof sp.title === "string" ? sp.title.trim() : Array.isArray(sp.title) ? (sp.title[0] || "").trim() : ""
  const catQ = typeof sp.categoryId === "string" ? sp.categoryId.trim() : Array.isArray(sp.categoryId) ? (sp.categoryId[0] || "").trim() : ""
  if (titleQ) qp.append("title", titleQ)
  if (catQ) qp.append("categoryId", catQ)
  type PublicProduct = {
    id: string
    title: string
    images?: string[]
  }
  let products: PublicProduct[] = []
  try {
    const res = await fetch(`${baseUrl}/products/public?${qp.toString()}`, { next: { revalidate: 180 } })
    const json = await res.json().catch(() => null)
    products = (json?.data?.products || []) as PublicProduct[]
  } catch {}
  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    numberOfItems: Array.isArray(products) ? products.length : 0,
    itemListOrder: "https://schema.org/ItemListOrderAscending",
    itemListElement: Array.isArray(products) ? products.map((p: PublicProduct, idx: number) => ({
      "@type": "ListItem",
      position: idx + 1,
      url: `${siteUrl}/${p.id}`,
      name: p.title,
      image: Array.isArray(p.images) ? p.images[0] : undefined
    })) : []
  }
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    url: siteUrl,
    name: "Cinnamon Makeup",
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteUrl}/?title={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  }
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemList) }} />
      <Suspense fallback={null}>
        <HomeComponent />
      </Suspense>
    </>
  )
}

export async function generateMetadata({ searchParams }: { searchParams?: Record<string, string | string[] | undefined> }): Promise<Metadata> {
  const sp = searchParams || {}
  const titleQ = typeof sp.title === "string" ? sp.title.trim() : Array.isArray(sp.title) ? (sp.title[0] || "").trim() : undefined
  const catQ = typeof sp.categoryId === "string" ? sp.categoryId.trim() : Array.isArray(sp.categoryId) ? (sp.categoryId[0] || "").trim() : undefined
  const base = "Cinnamon Makeup"
  const parts = [base]
  if (titleQ) parts.push(`Buscar: ${titleQ}`)
  if (catQ) parts.push(`Categoría: ${catQ}`)
  const fullTitle = parts.join(" · ")
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3001"
  const qp = new URLSearchParams()
  if (titleQ) qp.append("title", titleQ)
  if (catQ) qp.append("categoryId", catQ)
  const canonical = `${siteUrl}${qp.toString() ? `/?${qp.toString()}` : "/"}`
  return {
    title: fullTitle,
    description: titleQ ? `Resultados para "${titleQ}" en Cinnamon` : "Explora categorías y productos en Cinnamon ",
    metadataBase: new URL(siteUrl),
    alternates: { canonical },
    openGraph: {
      title: fullTitle,
      description: titleQ ? `Resultados para "${titleQ}" en Cinnamon` : "Explora categorías y productos en Cinnamon ",
      url: canonical,
      type: "website",
      images: [{ url: `${siteUrl}/logo.png` }]
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: titleQ ? `Resultados para "${titleQ}" en Cinnamon` : "Explora categorías y productos en Cinnamon ",
      images: [`${siteUrl}/logo.png`]
    },
    keywords: [
      "Cinnamon",
      "maquillaje",
      "cosmética",
      "belleza",
      ...(titleQ ? [titleQ] : []),
      ...(catQ ? [catQ] : [])
    ],
    robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large" } }
  }
}
