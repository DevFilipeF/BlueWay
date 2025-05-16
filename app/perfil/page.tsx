"use client"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/contexts/auth-context"
import { User, Phone, Mail, LogOut, Camera, Check } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useTheme } from "next-themes"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

export default function PerfilPage() {
  const { user, logout } = useAuth()
  const [name, setName] = useState(user?.name || "")
  const [email, setEmail] = useState(user?.email || "")
  const [phone, setPhone] = useState(user?.phone || "")
  const [isEditing, setIsEditing] = useState(false)
  const [success, setSuccess] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const { theme, setTheme } = useTheme()

  // Atualizar os campos quando o usuário mudar
  useEffect(() => {
    if (user) {
      setName(user.name)
      setEmail(user.email)
      setPhone(user.phone)
    }
  }, [user])

  const handleSave = () => {
    // Simular salvamento
    setIsSaving(true)

    setTimeout(() => {
      // Em uma aplicação real, aqui você enviaria os dados para o backend
      // Atualizar o usuário no localStorage para simular a atualização
      if (user) {
        const updatedUser = {
          ...user,
          name,
          email,
          phone,
        }

        localStorage.setItem("mobiUser", JSON.stringify(updatedUser))

        // Atualizar também na "base de dados" simulada
        const mockUsers = JSON.parse(localStorage.getItem("mobiUsers") || "[]")
        const userIndex = mockUsers.findIndex((u: any) => u.id === user.id)

        if (userIndex !== -1) {
          mockUsers[userIndex] = {
            ...mockUsers[userIndex],
            name,
            email,
            phone,
          }
          localStorage.setItem("mobiUsers", JSON.stringify(mockUsers))
        }
      }

      setIsSaving(false)
      setIsEditing(false)
      setSuccess(true)

      // Esconder a mensagem de sucesso após 3 segundos
      setTimeout(() => setSuccess(false), 3000)
    }, 1000)
  }

  const toggleDarkMode = (checked: boolean) => {
    setTheme(checked ? "dark" : "light")
  }

  return (
    <ProtectedRoute>
      <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <main className="flex-1 container py-6 main-content-with-footer">
          <h1 className="text-2xl font-bold mb-6">Meu Perfil</h1>

          {success && (
            <Alert className="mb-4 bg-primary/10 border-primary/20">
              <Check className="h-4 w-4 text-primary" />
              <AlertDescription className="text-primary">Perfil atualizado com sucesso!</AlertDescription>
            </Alert>
          )}

          <div className="grid gap-6">
            <Card>
              <CardHeader className="pb-4">
                <div className="flex flex-col items-center">
                  <div className="relative mb-4">
                    <Avatar className="h-24 w-24 border-4 border-primary/20">
                      {user?.photoUrl ? (
                        <AvatarImage src={user.photoUrl || "/placeholder.svg"} alt={user.name} />
                      ) : (
                        <AvatarFallback className="bg-black text-white text-2xl">
                          {user?.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                            .slice(0, 2)}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <Button
                      size="icon"
                      variant="outline"
                      className="absolute bottom-0 right-0 rounded-full h-8 w-8 bg-white"
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                  </div>
                  <CardTitle>{user?.name}</CardTitle>
                  <CardDescription>
                    {user?.provider ? `Conectado com ${user.provider}` : "Usuário registrado"}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span>Nome</span>
                  </div>
                  {isEditing ? (
                    <Input value={name} onChange={(e) => setName(e.target.value)} className="uber-input" />
                  ) : (
                    <p>{user?.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span>Email</span>
                  </div>
                  {isEditing ? (
                    <Input value={email} onChange={(e) => setEmail(e.target.value)} className="uber-input" />
                  ) : (
                    <p>{user?.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <span>Telefone</span>
                  </div>
                  {isEditing ? (
                    <Input value={phone} onChange={(e) => setPhone(e.target.value)} className="uber-input" />
                  ) : (
                    <p>{user?.phone}</p>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                {isEditing ? (
                  <>
                    <Button variant="outline" onClick={() => setIsEditing(false)} disabled={isSaving}>
                      Cancelar
                    </Button>
                    <Button onClick={handleSave} className="bg-black hover:bg-gray-800" disabled={isSaving}>
                      {isSaving ? "Salvando..." : "Salvar"}
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" onClick={() => setIsEditing(true)}>
                      Editar Perfil
                    </Button>
                    <Button variant="destructive" onClick={logout} className="flex items-center gap-2">
                      <LogOut className="h-4 w-4" />
                      Sair
                    </Button>
                  </>
                )}
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Preferências</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="notifications" className="cursor-pointer">
                    Notificações
                  </Label>
                  <Switch id="notifications" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="darkMode" className="cursor-pointer">
                    Modo escuro
                  </Label>
                  <Switch id="darkMode" checked={theme === "dark"} onCheckedChange={toggleDarkMode} />
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
