"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { getAllRoutes, type VanRoute } from "@/services/stop-points-service"
import { Bus, Clock, MapPin } from "lucide-react"

interface RouteSelectionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelectRoute: (route: VanRoute) => void
}

export function RouteSelectionModal({ open, onOpenChange, onSelectRoute }: RouteSelectionModalProps) {
  const [routes] = useState<VanRoute[]>(getAllRoutes())

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Selecione uma linha</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          {routes.map((route) => (
            <div
              key={route.id}
              className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
              onClick={() => onSelectRoute(route)}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: route.color }} />
                <h3 className="font-medium">{route.name}</h3>
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
      </DialogContent>
    </Dialog>
  )
}
