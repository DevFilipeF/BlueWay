"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { Home, Clock, CreditCard, HelpCircle, User } from "lucide-react"
import { cn } from "@/lib/utils"

export function FooterNavigation() {
  const pathname = usePathname()

  const navItems = [
    {
      href: "/",
      label: "Início",
      icon: <Home className="h-6 w-6" />,
      active: pathname === "/",
    },
    {
      href: "/viagens",
      label: "Viagens",
      icon: <Clock className="h-6 w-6" />,
      active: pathname === "/viagens",
    },
    {
      href: "/pagamentos",
      label: "Pagamentos",
      icon: <CreditCard className="h-6 w-6" />,
      active: pathname === "/pagamentos",
    },
    {
      href: "/ajuda",
      label: "Ajuda",
      icon: <HelpCircle className="h-6 w-6" />,
      active: pathname === "/ajuda",
    },
    {
      href: "/perfil",
      label: "Perfil",
      icon: <User className="h-6 w-6" />,
      active: pathname === "/perfil",
    },
  ]

  return (
    <nav className="footer-nav">
      {navItems.map((item) => (
        <Link key={item.href} href={item.href} className={cn("footer-nav-item", item.active && "active")}>
          {item.icon}
          <span>{item.label}</span>
        </Link>
      ))}
    </nav>
  )
}
