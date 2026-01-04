import type { Metadata } from "next"
import { Inter, Space_Grotesk, Noto_Sans_JP } from "next/font/google"
import { ClerkProvider } from "@clerk/nextjs"
import { ConvexClientProvider } from "@/lib/convex"
import { Header } from "@/components/layout/Header"
import { BottomNav } from "@/components/layout/BottomNav"
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

export const metadata: Metadata = {
  title: "Sakéverse - AI-Powered Sake Discovery",
  description: "Discover Japanese sake through AI-powered conversations with Kiki (利き酒), your personal sake sommelier. Explore breweries, learn about regional styles, and find your perfect sake match.",
  keywords: ["sake", "japanese", "alcohol", "sommelier", "AI", "discovery", "brewery", "tasting"],
  authors: [{ name: "Sakéverse Team" }],
  creator: "Sakéverse",
  publisher: "Sakéverse",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://sakeverse.app"),
  openGraph: {
    title: "Sakéverse - AI-Powered Sake Discovery",
    description: "Discover Japanese sake through AI-powered conversations with Kiki (利き酒), your personal sake sommelier.",
    url: "https://sakeverse.app",
    siteName: "Sakéverse",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Sakéverse - AI-Powered Sake Discovery",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sakéverse - AI-Powered Sake Discovery",
    description: "Discover Japanese sake through AI-powered conversations with Kiki (利き酒), your personal sake sommelier.",
    images: ["/og-image.jpg"],
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
    <ClerkProvider>
      <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable} ${notoSansJP.variable}`}>
        <body className="min-h-screen bg-sakura-white font-body antialiased" suppressHydrationWarning={true}>
          <ConvexClientProvider>
            <div className="flex min-h-screen flex-col">
              <Header />
              <main className="flex-1 mobile-nav-offset">
                {children}
              </main>
              <BottomNav />
            </div>
          </ConvexClientProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
