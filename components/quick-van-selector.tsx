"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Car, Star, Zap } from "lucide-react"

interface QuickVanSelectorProps {
  onSelectVan: (van: any) => void
  onRequestCustom: () => void
}

export function QuickVanSelector({ onSelectVan, onRequestCustom }: QuickVanSelectorProps) {
  const [isLoading, setIsLoading] = useState(false)

  // Van mais próxima disponível
  const nearestVan = {
    id: "van1",
    driver: {
      name: "Carlos Silva",
      rating: 4.8,
    },
    plate: "ABC-1234",
    model: "Sprinter 415",
    availableSeats: 10,
    totalSeats: 16,
    estimatedTime: 5,
    distance: "0.8 km",
    isFull: false, // Adicionar esta propriedade
  }

  // Atualizar para mostrar capacidade e desabilitar quando lotado
  const handleQuickSelect = () => {
    if (nearestVan.availableSeats <= 0) return

    setIsLoading(true)
    setTimeout(() => {
      onSelectVan(nearestVan)
      setIsLoading(false)
    }, 1000)
  }

  return (
    <div className="space-y-3">
      {/* Van mais próxima */}
      <Card className="border-green-200 bg-gradient-to-r from-green-50 to-blue-50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <div className="relative">
              <Car className="h-4 w-4 text-green-600" />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            </div>
            Van Mais Próxima
            <Badge className="bg-green-600 text-white gap-1 text-xs">
              <Zap className="h-3 w-3" />
              {nearestVan.estimatedTime} min
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-blue-600 text-white">
                {nearestVan.driver.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="font-medium">{nearestVan.driver.name}</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Star className="h-3 w-3 text-yellow-500 fill-current" />
                <span>{nearestVan.driver.rating}</span>
                <span>•</span>
                <span>{nearestVan.model}</span>
                <span>•</span>
                <span className="font-mono text-xs">{nearestVan.plate}</span>
              </div>
            </div>
            <div className="text-right">
              <Badge
                variant="outline"
                className={`text-xs ${
                  nearestVan.isFull
                    ? "text-red-700 border-red-300"
                    : nearestVan.availableSeats <= 2
                      ? "text-orange-700 border-orange-300"
                      : "text-green-700 border-green-300"
                }`}
              >
                {nearestVan.totalSeats - nearestVan.availableSeats}/{nearestVan.totalSeats} passageiros
              </Badge>
              <div className="text-xs text-muted-foreground">
                {nearestVan.isFull ? (
                  <span className="font-medium text-red-600">Lotada</span>
                ) : (
                  <>
                    <span
                      className={`font-medium ${nearestVan.availableSeats <= 2 ? "text-orange-600" : "text-green-600"}`}
                    >
                      {nearestVan.availableSeats}
                    </span>{" "}
                    vagas
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={handleQuickSelect}
              disabled={isLoading || nearestVan.isFull}
              className={`${
                nearestVan.isFull ? "bg-gray-400 hover:bg-gray-400" : "bg-green-600 hover:bg-green-700"
              } text-sm h-9`}
            >
              {isLoading ? (
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                  Confirmando...
                </div>
              ) : nearestVan.isFull ? (
                "Van Lotada"
              ) : (
                <>
                  <Zap className="h-3 w-3 mr-1" />
                  Embarcar Agora
                </>
              )}
            </Button>
            <Button onClick={onRequestCustom} variant="outline" className="text-sm h-9">
              Ver Outras Opções
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
