import * as React from "react"
import type { Metadata } from "next"
import { Inter } from 'next/font/google'
import "./globals.css"
import "./leaflet.css"
import { Providers } from "./providers"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "BlueWay - Transporte Comunitário",
  description: "Transporte comunitário acessível e seguro para sua comunidade",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" className="light" style={{ colorScheme: "light" }}>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}