import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

export const metadata: Metadata = {
  title: {
    default: "VisaTN — Agence de Visas Tunisie",
    template: "%s | VisaTN",
  },
  description:
    "Plateforme professionnelle de traitement de visas depuis la Tunisie. France, Italie, Allemagne, Espagne, USA, Canada et eVisa. Suivi en temps réel.",
  keywords: ["visa", "Tunisie", "France", "Schengen", "TLSContact", "VFS", "dossier visa"],
  authors: [{ name: "VisaTN" }],
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: "fr_TN",
    siteName: "VisaTN",
    title: "VisaTN — Agence de Visas Tunisie",
    description: "Traitement professionnel de visas depuis la Tunisie",
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0066FF",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" className={`${inter.variable} h-full`}>
      <body className="min-h-full antialiased">{children}</body>
    </html>
  )
}
