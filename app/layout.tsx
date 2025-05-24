import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { LanguageProvider } from "@/contexts/language-context"
import { CartProvider } from "@/contexts/cart-context"
import { StockProvider } from "@/contexts/stock-context"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "La Strada Restaurant | The Plaza Hotel Edirne",
  description: "Digital menu for La Strada Restaurant at The Plaza Hotel Edirne",
  generator: 'v0.dev',
  openGraph: {
    title: "La Strada Restaurant | The Plaza Hotel Edirne",
    description: "Our menu features a delightful blend of local and international cuisines, while our selection of wine and beer is sure to captivate you.",
    url: "https://menu.theplazahoteledirne.com/",
    images: [
      {
        url: "https://theplazahoteledirne.com/assets/images/lastrada-share-preview.jpg",
        width: 1200, // You might want to adjust these dimensions
        height: 630, // based on your image's actual size
        alt: "La Strada Restaurant Logo",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "La Strada Restaurant | The Plaza Hotel Edirne",
    description: "Our menu features a delightful blend of local and international cuisines, while our selection of wine and beer is sure to captivate you.",
    images: ["https://theplazahoteledirne.com/assets/images/lastrada-share-preview.jpg"],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
          <LanguageProvider>
            <CartProvider>
              <StockProvider>
                <main className="min-h-screen bg-[#0f172a]">{children}</main>
              </StockProvider>
            </CartProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
