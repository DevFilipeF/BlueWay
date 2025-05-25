import type React from "react"
import { DriverAuthProvider } from "@/contexts/driver-auth-context"

export default function DriverLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <DriverAuthProvider>{children}</DriverAuthProvider>
}
