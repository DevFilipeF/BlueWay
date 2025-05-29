"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getStopPointsByRouteId, type VanRoute } from "@/services/stop-points-service"
import { MapPin, Clock, Bus } from "lucide-react"

interface DriverRouteViewModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  route: VanRoute | null
}

export function DriverRouteViewModal({ open, onOpenChange, route }: DriverRouteViewModalProps) {
  if (!route) return null

  const stopPoints = getStopPointsByRouteId(route.id)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[70vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: route.color }} />
            {route.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 overflow-y-auto flex-1">
          {/* Informações da Rota */}
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground mb-3">{route.description}</p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <Bus className="h-4 w-4 text-blue-600" />
                  <span>Frequência: {route.frequency}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-green-600" />
                  <span>
                    {route.firstDeparture} - {route.lastDeparture}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pontos de Parada */}
          <div>
            <h3 className="font-medium mb-3 flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Pontos de Parada ({stopPoints.length})
            </h3>
            <div className="space-y-2">
              {stopPoints.map((stop, index) => (
                <Card key={stop.id}>
                  <CardContent className="p-3">
                    <div className="flex items-start gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-medium">
                          {index + 1}
                        </div>
                        {index < stopPoints.length - 1 && <div className="w-0.5 h-8 bg-gray-200 mt-1" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm">{stop.name}</h4>
                        <p className="text-xs text-muted-foreground">{stop.address}</p>
                        <p className="text-xs text-muted-foreground mt-1">{stop.description}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {stop.availableVans} vans
                          </Badge>
                          <span className="text-xs text-muted-foreground">Espera: {stop.waitingTime}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
