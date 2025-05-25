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
import { MapPin, AlertCircle, Apple, Facebook } from "lucide-react"
import { FcGoogle } from "react-icons/fc"
import { Separator } from "@/components/ui/separator"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [socialLoading, setSocialLoading] = useState<string | null>(null)
  const { login, loginWithSocial, isLoading } = useAuth()
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
      router.push("/")
    } else {
      setError("Email ou senha incorretos")
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
      {/* Hero Section */}
      <div className="relative h-64 bg-black">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-50"
          style={{ backgroundImage: "url('/placeholder.svg?height=400&width=800&text=MobiComunidade')" }}
        ></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            <div className="flex items-center justify-center gap-2 text-3xl font-bold mb-2">
              <Image src="/logo-blueway.png" alt="BlueWay Logo" width={80} height={80} />
              <span>BlueWay</span>
            </div>
            <p className="text-lg">Transporte comunitário acessível</p>
          </div>
        </div>
      </div>

      {/* Login Form */}
      <div className="flex-1 px-6 py-8">
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-bold mb-6">Entrar</h1>

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
                <Link href="/esqueci-senha" className="text-sm text-primary hover:underline">
                  Esqueceu a senha?
                </Link>
              </div>
            </div>
            <Button type="submit" className="w-full h-14 text-lg bg-black hover:bg-gray-800" disabled={isLoading}>
              {isLoading ? "Entrando..." : "Entrar"}
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
              Não tem uma conta?{" "}
              <Link href="/cadastro" className="text-primary font-medium hover:underline">
                Cadastre-se
              </Link>
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 text-center">
        <p className="text-muted-foreground">
        É motorista?{" "}
        <Link href="/motorista/login" className="text-blue-600  font-medium hover:underline">
        Acesse a área do motorista
        </Link>
        </p>
        </div>
    </div>
  )
}
