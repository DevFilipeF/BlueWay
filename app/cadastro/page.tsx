"use client"

import type React from "react"
import Image from "next/image"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/contexts/auth-context"
import { MapPin, AlertCircle, ArrowLeft, Apple, Facebook } from "lucide-react"
import { FcGoogle } from "react-icons/fc"
import { Separator } from "@/components/ui/separator"

export default function CadastroPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [socialLoading, setSocialLoading] = useState<string | null>(null)
  const { register, loginWithSocial, isLoading } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!name || !email || !phone || !password || !confirmPassword) {
      setError("Por favor, preencha todos os campos")
      return
    }

    if (password !== confirmPassword) {
      setError("As senhas não coincidem")
      return
    }

    const success = await register(name, email, phone, password)
    if (success) {
      router.push("/")
    } else {
      setError("Este email já está em uso")
    }
  }

  const handleSocialLogin = async (provider: "google" | "apple" | "facebook") => {
    setError("")
    setSocialLoading(provider)

    try {
      const success = await loginWithSocial(provider)
      if (success) {
        router.push("/")
      } else {
        setError(`Não foi possível fazer login com ${provider}. Tente novamente.`)
      }
    } catch (error) {
      setError(`Erro ao fazer login com ${provider}`)
    } finally {
      setSocialLoading(null)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Header */}
      <div className="p-4 flex items-center">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="mr-2">
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-xl font-semibold">Criar conta</h1>
      </div>

      {/* Form */}
      <div className="flex-1 px-6 py-4">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-center gap-2 text-2xl font-bold mb-6">
          <Image src="/logo-blueway.png" alt="BlueWay Logo" width={60} height={60} />
            <span>BlueWay</span>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Input
                id="name"
                placeholder="Nome completo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="uber-input h-14"
                required
              />
            </div>
            <div>
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
            <div>
              <Input
                id="phone"
                placeholder="Telefone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="uber-input h-14"
                required
              />
            </div>
            <div>
              <Input
                id="password"
                type="password"
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="uber-input h-14"
                required
              />
            </div>
            <div>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirmar senha"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="uber-input h-14"
                required
              />
            </div>
            <Button type="submit" className="w-full h-14 text-lg bg-black hover:bg-gray-800" disabled={isLoading}>
              {isLoading ? "Cadastrando..." : "Cadastrar"}
            </Button>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-muted-foreground">Ou continue com</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mt-6">
              <Button
                variant="outline"
                className="h-12"
                onClick={() => handleSocialLogin("google")}
                disabled={isLoading || socialLoading !== null}
              >
                {socialLoading === "google" ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-primary" />
                ) : (
                  <FcGoogle className="h-5 w-5" />
                )}
              </Button>
              <Button
                variant="outline"
                className="h-12"
                onClick={() => handleSocialLogin("apple")}
                disabled={isLoading || socialLoading !== null}
              >
                {socialLoading === "apple" ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-primary" />
                ) : (
                  <Apple className="h-5 w-5" />
                )}
              </Button>
              <Button
                variant="outline"
                className="h-12"
                onClick={() => handleSocialLogin("facebook")}
                disabled={isLoading || socialLoading !== null}
              >
                {socialLoading === "facebook" ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-primary" />
                ) : (
                  <Facebook className="h-5 w-5 text-blue-600" />
                )}
              </Button>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-muted-foreground">
              Já tem uma conta?{" "}
              <Link href="/login" className="text-primary font-medium hover:underline">
                Faça login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
