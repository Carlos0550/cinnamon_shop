import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Mi cuenta | Cinnamon',
  description: 'Gestiona tu perfil y datos de envío en Cinnamon.',
  robots: { index: false, follow: false },
  alternates: { canonical: '/account' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}

