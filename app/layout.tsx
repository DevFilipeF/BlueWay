import type React from "react"
import type { Metadata } from "next"
import { Inter } from 'next/font/google'
import "./globals.css"
import "./leaflet.css" // Importar os estilos do Leaflet
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/contexts/auth-context"
import { DriverAuthProvider } from "@/contexts/driver-auth-context"

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
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <DriverAuthProvider>{children}</DriverAuthProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}