import { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001'
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'

  const now = new Date()
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/`, lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: `${siteUrl}/faq`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${siteUrl}/account`, lastModified: now, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${siteUrl}/orders`, lastModified: now, changeFrequency: 'monthly', priority: 0.3 }
  ]

  let productRoutes: MetadataRoute.Sitemap = []
  try {
    const res = await fetch(`${apiUrl}/products/public?limit=1000`, { next: { revalidate: 3600 } })
    const json = await res.json().catch(() => null)
    const products = Array.isArray(json?.data?.products) ? json.data.products : []
    productRoutes = products.map((p: { id: string; updatedAt?: string }) => ({
      url: `${siteUrl}/${p.id}`,
      lastModified: p.updatedAt ? new Date(p.updatedAt) : now,
      changeFrequency: 'weekly',
      priority: 0.8
    }))
  } catch {
    productRoutes = []
  }

  return [...staticRoutes, ...productRoutes]
}

