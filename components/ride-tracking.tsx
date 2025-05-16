"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Navigation, Clock, Bus, X } from "lucide-react"

interface RideTrackingProps {
  rideDetails: {
    origin: string
    destination: string
    driver?: {
      name: string
      rating: number
    }
    plate?: string
  }
  onCancel: () => void
  onComplete: () => void
  rideStage: string
  currentStop?: string | null
  nextStop?: string | null
  routeName?: string
}

export function RideTracking({
  rideDetails,
  onCancel,
  onComplete,
  rideStage,
  currentStop,
  nextStop,
  routeName,
}: RideTrackingProps) {
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)

  // Iniciar o contador de tempo quando a viagem começar
  useEffect(() => {
    if (rideStage === "journey") {
      const timer = setInterval(() => {
        setTimeElapsed((prev) => prev + 1)
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [rideStage])

  // Formatar o tempo decorrido
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  // Obter o status da viagem com base no estágio
  const getRideStatus = () => {
    switch (rideStage) {
      case "searching":
        return "Procurando van..."
      case "found":
        return "Van encontrada!"
      case "arriving":
        return "Van a caminho"
      case "pickup":
        return "Embarque"
      case "journey":
        return "Em viagem"
      case "complete":
        return "Viagem concluída"
      default:
        return "Aguardando"
    }
  }

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        {showCancelConfirm ? (
          <div className="space-y-4">
            <h3 className="font-bold text-lg">Cancelar viagem?</h3>
            <p className="text-sm text-muted-foreground">
              Tem certeza que deseja cancelar esta viagem? Você poderá ser cobrado por uma taxa de cancelamento.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" className="w-full" onClick={() => setShowCancelConfirm(false)}>
                Voltar
              </Button>
              <Button variant="destructive" className="w-full" onClick={onCancel}>
                Confirmar Cancelamento
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-bold text-lg">Sua Viagem</h3>
                {routeName && (
                  <Badge variant="outline" className="mt-1">
                    {routeName}
                  </Badge>
                )}
              </div>
              <Badge variant="secondary">{getRideStatus()}</Badge>
            </div>

            {rideStage === "journey" && (
              <div className="mb-4">
                <div className="text-sm font-medium text-muted-foreground mb-1">Tempo de viagem</div>
                <div className="text-2xl font-bold">{formatTime(timeElapsed)}</div>
              </div>
            )}

            <div className="space-y-3 mb-4">
              <div className="flex items-start gap-2">
                <MapPin className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <div className="text-sm font-medium">Origem</div>
                  <div className="text-sm">{rideDetails.origin}</div>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Navigation className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <div className="text-sm font-medium">Destino</div>
                  <div className="text-sm">{rideDetails.destination}</div>
                </div>
              </div>

              {currentStop && (
                <div className="flex items-start gap-2">
                  <Bus className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <div className="text-sm font-medium">Ponto Atual</div>
                    <div className="text-sm">{currentStop}</div>
                  </div>
                </div>
              )}

              {nextStop && (
                <div className="flex items-start gap-2">
                  <Clock className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <div className="text-sm font-medium">Próximo Ponto</div>
                    <div className="text-sm">{nextStop}</div>
                  </div>
                </div>
              )}
            </div>

            {rideDetails.driver && (
              <div className="border-t pt-3 mb-4">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-sm font-medium">Motorista</div>
                    <div className="text-sm">{rideDetails.driver.name}</div>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">{rideDetails.driver.rating.toFixed(1)}</span> ★
                  </div>
                </div>
                {rideDetails.plate && (
                  <div className="mt-1">
                    <div className="text-sm font-medium">Placa</div>
                    <div className="text-sm">{rideDetails.plate}</div>
                  </div>
                )}
              </div>
            )}

            {rideStage === "complete" ? (
              <Button onClick={onComplete} className="w-full" variant="default">
                Concluir
              </Button>
            ) : (
              <Button
                onClick={() => setShowCancelConfirm(true)}
                className="w-full"
                variant="outline"
                disabled={rideStage === "complete"}
              >
                <X className="h-4 w-4 mr-2" />
                Cancelar Viagem
              </Button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
