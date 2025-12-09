import type { Metadata } from "next"
import HomeComponent from "@/Components/Home/Home"


export default async function Home({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const sp = await searchParams
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api"
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3001"
  const qp = new URLSearchParams()
  if (sp?.title && sp.title.trim()) qp.append("title", sp.title.trim())
  if (sp?.categoryId && sp.categoryId.trim()) qp.append("categoryId", sp.categoryId.trim())
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
    itemListElement: Array.isArray(products) ? products.map((p: PublicProduct, idx: number) => ({
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
      <HomeComponent />
    </>
  )
}

export async function generateMetadata({ searchParams }: { searchParams: Promise<Record<string, string>> }): Promise<Metadata> {
  const sp = await searchParams
  const titleQ = sp?.title?.trim()
  const catQ = sp?.categoryId?.trim()
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3001"
  const base = "Cinnamon Makeup"
  const parts = [base]
  if (titleQ) parts.push(`Buscar: ${titleQ}`)
  if (catQ) parts.push(`Categoría: ${catQ}`)
  const fullTitle = parts.join(" · ")
  return {
    title: fullTitle,
    description: titleQ ? `Resultados para "${titleQ}" en Cinnamon` : "Explora categorías y productos en Cinnamon ",
    robots: { index: true, follow: true },
    alternates: { canonical: siteUrl },
    openGraph: {
      title: fullTitle,
      description: titleQ ? `Resultados para "${titleQ}" en Cinnamon` : "Explora categorías y productos en Cinnamon ",
      url: siteUrl,
      type: "website",
      images: [{ url: `${siteUrl}/opengraph-image` }]
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: titleQ ? `Resultados para "${titleQ}" en Cinnamon` : "Explora categorías y productos en Cinnamon ",
      images: [`${siteUrl}/opengraph-image`]
    }
  }
}
