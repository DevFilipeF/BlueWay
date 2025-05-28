"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"

export interface Driver {
  id: string
  name: string
  email: string
  phone: string
  license: string
  vehicle: {
    plate: string
    model: string
    color: string
    capacity: number
  }
  rating: number
  status: "online" | "offline" | "busy"
  currentRoute?: string
  photoUrl?: string
}

interface DriverAuthContextType {
  driver: Driver | null
  login: (email: string, password: string) => Promise<boolean>
  register: (data: RegisterData) => Promise<boolean>
  logout: () => void
  updateStatus: (status: "online" | "offline" | "busy") => void
  updateDriver: (updates: Partial<Driver>) => void
  isLoading: boolean
}

interface RegisterData {
  name: string
  email: string
  phone: string
  password: string
  license: string
  vehiclePlate: string
  vehicleModel: string
  vehicleColor: string
  vehicleCapacity: number
}

const DriverAuthContext = createContext<DriverAuthContextType | undefined>(undefined)

export function DriverAuthProvider({ children }: { children: React.ReactNode }) {
  const [driver, setDriver] = useState<Driver | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (typeof window === "undefined") return;
    
    // Verificar se há um motorista logado no localStorage
    const savedDriver = localStorage.getItem("blueWayDriver")
    if (savedDriver) {
      setDriver(JSON.parse(savedDriver))
    }
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    if (typeof window === "undefined") return false;
    
    setIsLoading(true)

    try {
      // Simular verificação de login
      const drivers = JSON.parse(localStorage.getItem("blueWayDrivers") || "[]")
      const foundDriver = drivers.find((d: any) => d.email === email && d.password === password)

      if (foundDriver) {
        const { password: _, ...driverData } = foundDriver
        setDriver(driverData)
        localStorage.setItem("blueWayDriver", JSON.stringify(driverData))
        return true
      }

      return false
    } catch (error) {
      console.error("Erro no login:", error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (data: RegisterData): Promise<boolean> => {
    if (typeof window === "undefined") return false;
    
    setIsLoading(true)

    try {
      const drivers = JSON.parse(localStorage.getItem("blueWayDrivers") || "[]")

      // Verificar se o email já existe
      if (drivers.some((d: any) => d.email === data.email)) {
        return false
      }

      const newDriver: Driver & { password: string } = {
        id: `driver_${Date.now()}`,
        name: data.name,
        email: data.email,
        phone: data.phone,
        license: data.license,
        vehicle: {
          plate: data.vehiclePlate,
          model: data.vehicleModel,
          color: data.vehicleColor,
          capacity: data.vehicleCapacity,
        },
        rating: 5.0,
        status: "offline",
        password: data.password,
      }

      drivers.push(newDriver)
      localStorage.setItem("blueWayDrivers", JSON.stringify(drivers))

      const { password: _, ...driverData } = newDriver
      setDriver(driverData)
      localStorage.setItem("blueWayDriver", JSON.stringify(driverData))

      return true
    } catch (error) {
      console.error("Erro no cadastro:", error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    if (typeof window === "undefined") return;
    
    setDriver(null)
    localStorage.removeItem("blueWayDriver")
    // Redirecionar para a tela de login
    router.push("/motorista/login")
  }

  const updateStatus = (status: "online" | "offline" | "busy") => {
    if (typeof window === "undefined") return;
    if (!driver) return;
    
    const updatedDriver = { ...driver, status }
    setDriver(updatedDriver)
    localStorage.setItem("blueWayDriver", JSON.stringify(updatedDriver))

    // Atualizar também na lista de motoristas
    const drivers = JSON.parse(localStorage.getItem("blueWayDrivers") || "[]")
    const updatedDrivers = drivers.map((d: any) => (d.id === driver.id ? { ...d, status } : d))
    localStorage.setItem("blueWayDrivers", JSON.stringify(updatedDrivers))
  }

  const updateDriver = (updates: Partial<Driver>) => {
    if (typeof window === "undefined") return;
    if (!driver) return;
    
    const updatedDriver = { ...driver, ...updates }
    setDriver(updatedDriver)
    localStorage.setItem("blueWayDriver", JSON.stringify(updatedDriver))

    // Atualizar também na lista de motoristas
    const drivers = JSON.parse(localStorage.getItem("blueWayDrivers") || "[]")
    const updatedDrivers = drivers.map((d: any) => (d.id === driver.id ? { ...d, ...updates } : d))
    localStorage.setItem("blueWayDrivers", JSON.stringify(updatedDrivers))
  }

  return (
    <DriverAuthContext.Provider
      value={{
        driver,
        login,
        register,
        logout,
        updateStatus,
        updateDriver,
        isLoading,
      }}
    >
      {children}
    </DriverAuthContext.Provider>
  )
}

export function useDriverAuth() {
  const context = useContext(DriverAuthContext)
  if (context === undefined) {
    throw new Error("useDriverAuth must be used within a DriverAuthProvider")
  }
  return context
}
