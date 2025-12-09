import { ImageResponse } from 'next/og'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const runtime = 'edge'
export const alt = 'Producto | Cinnamon'

export default async function OG({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001'
  const bizImage = process.env.NEXT_PUBLIC_BUSINESS_IMAGE_URL || ''
  let product: { title?: string; category?: { title?: string }; price?: number; images?: string[] } = {}
  try {
    const res = await fetch(`${apiUrl}/products/public/${id}`, { next: { revalidate: 600 } })
    const json = await res.json().catch(() => null)
    product = json?.data?.product || json?.data || json || {}
  } catch {}
  const title = product?.title || 'Producto'
  const cat = product?.category?.title || 'Categoría'
  const price = typeof product?.price === 'number' ? new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(product.price as number) : ''
  const productImage = Array.isArray(product?.images) && product.images.length > 0 ? product.images[0] : ''

  return new ImageResponse(
    (
      <div
        style={{
          width: size.width,
          height: size.height,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'flex-start',
          padding: 64,
          background: 'linear-gradient(135deg, #ffffff 0%, #ffe6f1 60%, #ffc6de 100%)',
        }}
      >
        {bizImage && (
          <img
            src={bizImage}
            width={size.width}
            height={size.height}
            style={{ position: 'absolute', inset: 0, objectFit: 'cover', opacity: 0.25 }}
          />
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <img src={`${siteUrl}/logo.png`} width={80} height={80} style={{ borderRadius: 16 }} />
          <div style={{ fontSize: 48, fontWeight: 800, color: '#111' }}>Cinnamon Shop</div>
        </div>
        <div style={{ marginTop: 24, fontSize: 56, fontWeight: 700, color: '#111' }}>{title}</div>
        <div style={{ marginTop: 8, fontSize: 28, color: '#444' }}>{cat}</div>
        {price && <div style={{ marginTop: 8, fontSize: 32, fontWeight: 600, color: '#0a7' }}>{price}</div>}
        {productImage && (
          <img
            src={productImage}
            width={520}
            height={520}
            style={{ position: 'absolute', right: 48, top: 48, objectFit: 'cover', borderRadius: 24, boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }}
          />
        )}
        <div style={{ position: 'absolute', bottom: 32, right: 48, fontSize: 24, color: '#333' }}>{new URL(siteUrl).host}</div>
      </div>
    ),
    size
  )
}
