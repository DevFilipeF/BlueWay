"use client"

import type React from "react"
import Image from "next/image"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useDriverAuth } from "@/contexts/driver-auth-context"
import { AlertCircle, ArrowLeft, Truck } from "lucide-react"

export default function DriverRegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    license: "",
    vehiclePlate: "",
    vehicleModel: "",
    vehicleColor: "",
    vehicleCapacity: "",
  })
  const [error, setError] = useState("")
  const { register, isLoading } = useDriverAuth()
  const router = useRouter()

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Validações
    if (Object.values(formData).some((value) => !value)) {
      setError("Por favor, preencha todos os campos")
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError("As senhas não coincidem")
      return
    }

    if (formData.password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres")
      return
    }

    const success = await register({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
      license: formData.license,
      vehiclePlate: formData.vehiclePlate,
      vehicleModel: formData.vehicleModel,
      vehicleColor: formData.vehicleColor,
      vehicleCapacity: Number.parseInt(formData.vehicleCapacity),
    })

    if (success) {
      router.push("/motorista/dashboard")
    } else {
      setError("Este email já está em uso")
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Header */}
      <div className="p-4 flex items-center bg-blue-600 text-white">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="mr-2 text-white hover:bg-blue-700">
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-xl font-semibold">Cadastro de Motorista</h1>
      </div>

      {/* Form */}
      <div className="flex-1 px-6 py-4">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-center gap-2 text-2xl font-bold mb-6">
            <Image src="/logo-blueway.png" alt="BlueWay Logo" width={60} height={60} />
            <Truck className="h-8 w-8 text-blue-600" />
            <span>BlueWay Driver</span>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                placeholder="Nome completo"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className="uber-input h-12"
                required
              />
            </div>
            <div>
              <Input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                className="uber-input h-12"
                required
              />
            </div>
            <div>
              <Input
                placeholder="Telefone"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                className="uber-input h-12"
                required
              />
            </div>
            <div>
              <Input
                placeholder="CNH (Número da carteira)"
                value={formData.license}
                onChange={(e) => handleChange("license", e.target.value)}
                className="uber-input h-12"
                required
              />
            </div>
            <div>
              <Input
                placeholder="Placa do veículo"
                value={formData.vehiclePlate}
                onChange={(e) => handleChange("vehiclePlate", e.target.value.toUpperCase())}
                className="uber-input h-12"
                required
              />
            </div>
            <div>
              <Input
                placeholder="Modelo do veículo"
                value={formData.vehicleModel}
                onChange={(e) => handleChange("vehicleModel", e.target.value)}
                className="uber-input h-12"
                required
              />
            </div>
            <div>
              <Input
                placeholder="Cor do veículo"
                value={formData.vehicleColor}
                onChange={(e) => handleChange("vehicleColor", e.target.value)}
                className="uber-input h-12"
                required
              />
            </div>
            <div>
              <Input
                type="number"
                placeholder="Capacidade de passageiros"
                value={formData.vehicleCapacity}
                onChange={(e) => handleChange("vehicleCapacity", e.target.value)}
                className="uber-input h-12"
                min="1"
                max="50"
                required
              />
            </div>
            <div>
              <Input
                type="password"
                placeholder="Senha"
                value={formData.password}
                onChange={(e) => handleChange("password", e.target.value)}
                className="uber-input h-12"
                required
              />
            </div>
            <div>
              <Input
                type="password"
                placeholder="Confirmar senha"
                value={formData.confirmPassword}
                onChange={(e) => handleChange("confirmPassword", e.target.value)}
                className="uber-input h-12"
                required
              />
            </div>
            <Button type="submit" className="w-full h-12 text-lg bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
              {isLoading ? "Cadastrando..." : "Cadastrar como Motorista"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-muted-foreground">
              Já tem uma conta?{" "}
              <Link href="/motorista/login" className="text-blue-600 font-medium hover:underline">
                Faça login
              </Link>
            </p>
          </div>

          <div className="mt-4 text-center">
            <p className="text-muted-foreground">
              É passageiro?{" "}
              <Link href="/cadastro" className="text-primary font-medium hover:underline">
                Cadastre-se como passageiro
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
