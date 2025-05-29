"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useDriverAuth } from "@/contexts/driver-auth-context"

interface DriverProtectedRouteProps {
  children: React.ReactNode
}

export function DriverProtectedRoute({ children }: DriverProtectedRouteProps) {
  const { driver } = useDriverAuth()
  const router = useRouter()

  useEffect(() => {
    if (!driver) {
      router.push("/motorista/login")
    }
  }, [driver, router])

  if (!driver) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Carregando...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
