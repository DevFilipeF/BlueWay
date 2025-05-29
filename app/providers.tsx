"use client"

import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/contexts/auth-context"
import { DriverAuthProvider } from "@/contexts/driver-auth-context"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
      <AuthProvider>
        <DriverAuthProvider>{children}</DriverAuthProvider>
      </AuthProvider>
    </ThemeProvider>
  )
} 