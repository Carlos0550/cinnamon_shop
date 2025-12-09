import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Preguntas frecuentes | Cinnamon',
  description: 'Resuelve dudas sobre compras, envíos y pagos en Cinnamon.',
  robots: { index: true, follow: true },
  alternates: { canonical: '/faq' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}

