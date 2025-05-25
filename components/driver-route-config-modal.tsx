"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { getAllRoutes, type VanRoute } from "@/services/stop-points-service"
import { Bus, Clock, MapPin, CheckCircle } from "lucide-react"

interface DriverRouteConfigModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRoute?: VanRoute | null
  onSelectRoute: (route: VanRoute) => void
}

export function DriverRouteConfigModal({
  open,
  onOpenChange,
  currentRoute,
  onSelectRoute,
}: DriverRouteConfigModalProps) {
  const [routes] = useState<VanRoute[]>(getAllRoutes())
  const [selectedRoute, setSelectedRoute] = useState<VanRoute | null>(currentRoute || null)

  const handleConfirm = () => {
    if (selectedRoute) {
      onSelectRoute(selectedRoute)
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[70vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Configurar Rota</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 overflow-y-auto flex-1">
          {routes.map((route) => (
            <div
              key={route.id}
              className={`border rounded-lg p-4 cursor-pointer transition-all ${
                selectedRoute?.id === route.id
                  ? "border-primary ring-2 ring-primary/20 bg-primary/5"
                  : "hover:bg-gray-50"
              }`}
              onClick={() => setSelectedRoute(route)}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: route.color }} />
                  <h3 className="font-medium">{route.name}</h3>
                </div>
                {selectedRoute?.id === route.id && <CheckCircle className="h-5 w-5 text-primary" />}
              </div>
              <p className="text-sm text-gray-600 mb-2">{route.description}</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-1">
                  <Bus className="h-4 w-4 text-gray-500" />
                  <span>Frequência: {route.frequency}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span>
                    {route.firstDeparture} - {route.lastDeparture}
                  </span>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-1 text-sm text-primary">
                <MapPin className="h-4 w-4" />
                <span>{route.stops.length} pontos de parada</span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
            Cancelar
          </Button>
          <Button onClick={handleConfirm} disabled={!selectedRoute} className="flex-1">
            Confirmar Rota
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
