"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Car, Users, Star, Clock } from "lucide-react"

interface Van {
  id: string
  driver: {
    name: string
    rating: number
    image?: string
  }
  plate: string
  model: string
  availableSeats: number
  totalSeats: number
  estimatedTime: number
  distance: string
}

interface AvailableVansModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelectVan: (van: Van) => void
}

export function AvailableVansModal({ open, onOpenChange, onSelectVan }: AvailableVansModalProps) {
  const [selectedVanId, setSelectedVanId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Dados simulados de vans disponíveis
  const availableVans: Van[] = [
    {
      id: "van1",
      driver: {
        name: "Carlos Silva",
        rating: 4.8,
        image: "/placeholder.svg?height=40&width=40&text=CS",
      },
      plate: "ABC-1234",
      model: "Sprinter 415",
      availableSeats: 10,
      totalSeats: 16,
      estimatedTime: 5,
      distance: "0.8 km",
    },
    {
      id: "van2",
      driver: {
        name: "Maria Oliveira",
        rating: 4.9,
        image: "/placeholder.svg?height=40&width=40&text=MO",
      },
      plate: "DEF-5678",
      model: "Master L3H2",
      availableSeats: 8,
      totalSeats: 16,
      estimatedTime: 7,
      distance: "1.2 km",
    },
    {
      id: "van3",
      driver: {
        name: "João Santos",
        rating: 4.7,
        image: "/placeholder.svg?height=40&width=40&text=JS",
      },
      plate: "GHI-9012",
      model: "Transit Custom",
      availableSeats: 12,
      totalSeats: 16,
      estimatedTime: 10,
      distance: "1.5 km",
    },
  ]

  const handleSelectVan = () => {
    if (!selectedVanId) return

    setIsLoading(true)
    const selectedVan = availableVans.find((van) => van.id === selectedVanId)

    // Simular processamento
    setTimeout(() => {
      if (selectedVan) {
        onSelectVan(selectedVan)
      }
      setIsLoading(false)
    }, 1000)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[70vh] overflow-hidden flex flex-col">
        <DialogHeader className="pb-2">
          <DialogTitle>Vans Disponíveis</DialogTitle>
          <DialogDescription>Selecione uma van para sua viagem</DialogDescription>
        </DialogHeader>

        <div className="space-y-3 overflow-y-auto py-2 flex-grow">
          {availableVans.map((van) => (
            <Card
              key={van.id}
              className={`cursor-pointer transition-all ${
                selectedVanId === van.id ? "border-primary ring-2 ring-primary/20" : ""
              }`}
              onClick={() => setSelectedVanId(van.id)}
            >
              <CardHeader className="pb-1 pt-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={van.driver.image || "/placeholder.svg"} alt={van.driver.name} />
                      <AvatarFallback>
                        {van.driver.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-sm">{van.driver.name}</CardTitle>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Star className="h-3 w-3 text-yellow-500 mr-1" />
                        <span>{van.driver.rating}</span>
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline" className="font-normal text-xs">
                    {van.distance}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pb-1 pt-0">
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-1">
                    <Car className="h-3 w-3 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Veículo</p>
                      <p className="text-xs">{van.model}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Assentos</p>
                      <p className="text-xs">
                        {van.availableSeats} de {van.totalSeats}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-1 pb-3">
                <div className="w-full flex items-center justify-between">
                  <div className="flex items-center gap-1 text-xs">
                    <Clock className="h-3 w-3 text-primary" />
                    <span>Chega em {van.estimatedTime} min</span>
                  </div>
                  <CardDescription className="text-xs">Placa: {van.plate}</CardDescription>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>

        <DialogFooter className="pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} size="sm">
            Cancelar
          </Button>
          <Button onClick={handleSelectVan} disabled={!selectedVanId || isLoading} size="sm">
            {isLoading ? "Processando..." : "Selecionar Van"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
