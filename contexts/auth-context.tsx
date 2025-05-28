"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"

type User = {
  id: string
  name: string
  email: string
  phone: string
  photoUrl?: string
  provider?: string
}

type AuthContextType = {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  loginWithSocial: (provider: "google" | "apple" | "facebook") => Promise<boolean>
  register: (name: string, email: string, phone: string, password: string) => Promise<boolean>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Verificar se o usuário está logado ao carregar a página
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    const storedUser = localStorage.getItem("mobiUser")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setIsLoading(false)
  }, [])

  // Função de login
  const login = async (email: string, password: string): Promise<boolean> => {
    if (typeof window === "undefined") return false;
    
    setIsLoading(true)

    try {
      // Simulação de uma chamada de API
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Em uma aplicação real, isso seria validado no backend
      // Aqui estamos apenas simulando para demonstração
      const mockUsers = JSON.parse(localStorage.getItem("mobiUsers") || "[]")
      const foundUser = mockUsers.find((u: any) => u.email === email && u.password === password)

      if (!foundUser) {
        return false
      }

      // Remover a senha antes de armazenar no estado
      const { password: _, ...userWithoutPassword } = foundUser

      setUser(userWithoutPassword)
      localStorage.setItem("mobiUser", JSON.stringify(userWithoutPassword))
      return true
    } catch (error) {
      console.error("Erro ao fazer login:", error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Função de login com redes sociais
  const loginWithSocial = async (provider: "google" | "apple" | "facebook"): Promise<boolean> => {
    if (typeof window === "undefined") return false;
    
    setIsLoading(true)

    try {
      // Simulação de uma chamada de API para autenticação social
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Gerar um usuário simulado baseado no provedor
      const mockSocialUser: User = {
        id: `user_${Date.now()}`,
        name: provider === "google" ? "Usuário Google" : provider === "apple" ? "Usuário Apple" : "Usuário Facebook",
        email: `usuario.${provider}@example.com`,
        phone: "(00) 00000-0000",
        photoUrl: `/placeholder.svg?height=100&width=100&text=${provider.charAt(0).toUpperCase()}`,
        provider,
      }

      // Verificar se o usuário já existe
      const mockUsers = JSON.parse(localStorage.getItem("mobiUsers") || "[]")
      const existingUser = mockUsers.find((u: any) => u.email === mockSocialUser.email)

      if (!existingUser) {
        // Adicionar o novo usuário à "base de dados" simulada
        mockUsers.push(mockSocialUser)
        localStorage.setItem("mobiUsers", JSON.stringify(mockUsers))
      }

      // Fazer login com o usuário social
      setUser(mockSocialUser)
      localStorage.setItem("mobiUser", JSON.stringify(mockSocialUser))

      return true
    } catch (error) {
      console.error(`Erro ao fazer login com ${provider}:`, error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Função de registro
  const register = async (name: string, email: string, phone: string, password: string): Promise<boolean> => {
    if (typeof window === "undefined") return false;
    
    setIsLoading(true)

    try {
      // Simulação de uma chamada de API
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Em uma aplicação real, isso seria feito no backend
      const mockUsers = JSON.parse(localStorage.getItem("mobiUsers") || "[]")

      // Verificar se o email já está em uso
      if (mockUsers.some((u: any) => u.email === email)) {
        return false
      }

      // Criar novo usuário
      const newUser = {
        id: `user_${Date.now()}`,
        name,
        email,
        phone,
        password, // Em uma aplicação real, a senha seria hasheada
      }

      // Adicionar à "base de dados" simulada
      mockUsers.push(newUser)
      localStorage.setItem("mobiUsers", JSON.stringify(mockUsers))

      // Fazer login automaticamente após o registro
      const { password: _, ...userWithoutPassword } = newUser
      setUser(userWithoutPassword)
      localStorage.setItem("mobiUser", JSON.stringify(userWithoutPassword))

      return true
    } catch (error) {
      console.error("Erro ao registrar:", error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Função de logout
  const logout = () => {
    if (typeof window === "undefined") return;
    
    setUser(null)
    localStorage.removeItem("mobiUser")
    router.push("/login")
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, loginWithSocial, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider")
  }
  return context
}
