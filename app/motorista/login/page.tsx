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
import { AlertCircle, Truck } from "lucide-react"

export default function DriverLoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const { login, isLoading } = useDriverAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!email || !password) {
      setError("Por favor, preencha todos os campos")
      return
    }

    const success = await login(email, password)
    if (success) {
      router.push("/motorista/dashboard")
    } else {
      setError("Email ou senha incorretos")
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Hero Section */}
      <div className="relative h-64 bg-gradient-to-r from-blue-600 to-blue-800">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: "url('/placeholder.svg?height=400&width=800&text=BlueWay Driver')" }}
        ></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            <div className="flex items-center justify-center gap-3 text-3xl font-bold mb-2">
              <Image src="/logo-blueway.png" alt="BlueWay Logo" width={80} height={80} />
              <Truck className="h-10 w-10" />
              <span>BlueWay Driver</span>
            </div>
            <p className="text-lg">Portal do Motorista</p>
          </div>
        </div>
      </div>

      {/* Login Form */}
      <div className="flex-1 px-6 py-8">
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-bold mb-6">Entrar como Motorista</h1>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Input
                id="email"
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="uber-input h-14"
                required
              />
            </div>
            <div className="space-y-2">
              <Input
                id="password"
                type="password"
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="uber-input h-14"
                required
              />
              <div className="text-right">
                <Link href="/motorista/esqueci-senha" className="text-sm text-blue-600 hover:underline">
                  Esqueceu a senha?
                </Link>
              </div>
            </div>
            <Button type="submit" className="w-full h-14 text-lg bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
              {isLoading ? "Entrando..." : "Entrar"}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-muted-foreground">
              Não tem uma conta?{" "}
              <Link href="/motorista/cadastro" className="text-blue-600 font-medium hover:underline">
                Cadastre-se como motorista
              </Link>
            </p>
          </div>

          <div className="mt-4 text-center">
            <p className="text-muted-foreground">
              É passageiro?{" "}
              <Link href="/login" className="text-primary font-medium hover:underline">
                Acesse a área do passageiro
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
