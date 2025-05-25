"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import dynamic from "next/dynamic"
import type { VanRoute } from "@/services/stop-points-service"
import { Skeleton } from "@/components/ui/skeleton"

// Carregamento dinâmico do LeafletMap para evitar problemas de SSR
const DynamicLeafletMap = dynamic(() => import("./leaflet-map").then((mod) => mod.LeafletMap), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-100">
      <Skeleton className="w-full h-full" />
    </div>
  ),
})

interface DriverRouteMapModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  route: VanRoute | null
}

export function DriverRouteMapModal({ open, onOpenChange, route }: DriverRouteMapModalProps) {
  if (!route) return null

  // Usar o primeiro ponto da rota como localização do usuário para o mapa
  const userLocation: [number, number] = route.path[0] || [-23.563, -46.6543]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl h-[80vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: route.color }} />
            Mapa da Rota: {route.name}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 px-6 pb-6">
          <div className="h-full rounded-lg overflow-hidden border">
            <DynamicLeafletMap userLocation={userLocation} showRoute={false} selectedRoute={route} rideStage="" />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
