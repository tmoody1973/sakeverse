import type { Metadata } from "next"
import { Inter, Space_Grotesk, Noto_Sans_JP, Silkscreen } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { AppShell } from "@/components/layout/AppShell"
import { OrganizationSchema, WebSiteSchema, WebApplicationSchema } from "@/components/seo/StructuredData"
import "./globals.css"

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

const spaceGrotesk = Space_Grotesk({ 
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
})

const notoSansJP = Noto_Sans_JP({ 
  subsets: ["latin"],
  variable: "--font-noto-sans-jp",
  display: "swap",
})

const silkscreen = Silkscreen({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-silkscreen",
  display: "swap",
})

export const metadata: Metadata = {
  metadataBase: new URL("https://sakecosm.com"),
  title: {
    default: "Sakécosm - AI-Powered Sake Discovery & Learning Platform",
    template: "%s | Sakécosm"
  },
  description: "Discover Japanese sake with Kiki, your AI sommelier. Learn sake fundamentals, get personalized recommendations, explore breweries, and master food pairings. Perfect for wine lovers and sake beginners.",
  keywords: [
    "sake",
    "sake discovery",
    "sake AI",
    "sake sommelier",
    "learn sake",
    "sake recommendations",
    "sake pairing",
    "Japanese sake",
    "sake for wine lovers",
    "sake courses",
    "sake podcast",
    "sake map Japan",
    "AI sake recommendations",
    "sake tasting notes",
    "sake brewery map"
  ],
  authors: [{ name: "Sakécosm", url: "https://sakecosm.com" }],
  creator: "Sakécosm",
  publisher: "Sakécosm",
  icons: {
    icon: "/sakecosm.ico",
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    alternateLocale: ["ja_JP"],
    url: "https://sakecosm.com",
    siteName: "Sakécosm",
    title: "Sakécosm - AI-Powered Sake Discovery & Learning",
    description: "Discover Japanese sake with AI-powered recommendations, interactive learning, and expert guidance. Perfect for wine lovers exploring sake.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Sakécosm - AI Sake Discovery Platform",
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@sakecosm",
    creator: "@sakecosm",
    title: "Sakécosm - AI-Powered Sake Discovery",
    description: "Discover Japanese sake with AI-powered recommendations and interactive learning.",
    images: ["/twitter-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://sakecosm.com",
  },
  verification: {
    google: "your-google-verification-code",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable} ${notoSansJP.variable} ${silkscreen.variable}`}>
      <head>
        <OrganizationSchema />
        <WebSiteSchema />
        <WebApplicationSchema />
      </head>
      <body className="min-h-screen bg-sakura-white font-body antialiased" suppressHydrationWarning={true}>
        <AppShell>
          {children}
        </AppShell>
        <Analytics />
      </body>
    </html>
  )
}
