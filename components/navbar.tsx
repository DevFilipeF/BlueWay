"use client"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { MapPin } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export function Navbar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  // Não mostrar a navbar na página de login ou cadastro
  if (pathname === "/login" || pathname === "/cadastro") {
    return null
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 shadow-sm">
      <div className="container flex h-14 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <div className="bg-white rounded-full p-1.5">
          <Image src="/logo-blueway.png" alt="BlueWay Logo" width={40} height={40} />
          </div>
          <span className="font-bold text-lg">BlueWay</span>
        </Link>

        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar className="h-8 w-8 border-2 border-primary/20 cursor-pointer">
                <AvatarFallback className="bg-black text-white">
                  {user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={logout}>Sair</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  )
}
