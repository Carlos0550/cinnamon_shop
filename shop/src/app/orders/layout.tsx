import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Mis órdenes | Cinnamon',
  description: 'Consulta el historial y detalles de tus órdenes.',
  robots: { index: false, follow: false },
  alternates: { canonical: '/orders' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}

