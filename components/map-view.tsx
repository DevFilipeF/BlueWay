"use client"

import { useState, useEffect, useCallback } from "react"
import { MapPin, AlertTriangle, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import dynamic from "next/dynamic"
import { Skeleton } from "@/components/ui/skeleton"
import type { StopPoint, VanRoute } from "@/services/stop-points-service"

// Carregamento dinâmico do LeafletMap para evitar problemas de SSR
const DynamicLeafletMap = dynamic(() => import("./leaflet-map").then((mod) => mod.LeafletMap), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-100">
      <Skeleton className="w-full h-full" />
    </div>
  ),
})

interface MapViewProps {
  onRequestRide?: () => void
  onRequestRideFromStop?: (stopPoint: StopPoint, passengers: number) => void
  origin?: string
  destination?: string
  originCoords?: [number, number]
  destinationCoords?: [number, number]
  showRoute?: boolean
  vanPosition?: { lat: number; lng: number } | null
  rideStage?: string
  onVanPositionChange?: (position: { lat: number; lng: number }) => void
  onReserveSeat?: (stopPoint: StopPoint, passengers: number) => void
  onRequestRideFromRoute?: (location: [number, number], routeId: string, passengers: number) => void
  onNearStopPoint?: (stopPoint: StopPoint) => void
  onReachedStopPoint?: (stopPoint: StopPoint) => void
  selectedRoute?: VanRoute | null
}

export function MapView({
  onRequestRide,
  onRequestRideFromStop,
  origin,
  destination,
  originCoords,
  destinationCoords,
  showRoute = false,
  vanPosition = null,
  rideStage = "",
  onVanPositionChange,
  onReserveSeat,
  onRequestRideFromRoute,
  onNearStopPoint,
  onReachedStopPoint,
  selectedRoute,
}: MapViewProps) {
  const [loading, setLoading] = useState(true)
  const [mapError, setMapError] = useState(false)
  // Coordenadas padrão para São Paulo
  const defaultLocation: [number, number] = [-23.5505, -46.6333]
  const [userLocation, setUserLocation] = useState<[number, number]>(defaultLocation)
  const [vanPositionCoords, setVanPositionCoords] = useState<[number, number] | null>(null)
  const [locationDenied, setLocationDenied] = useState(false)
  const [showLocationHelp, setShowLocationHelp] = useState(false)
  const [mapKey, setMapKey] = useState(Date.now()) // Chave para forçar re-renderização
  const [geocodingError, setGeocodingError] = useState(false)
  const [isMapReady, setIsMapReady] = useState(false)
  const [selectedStopPoint, setSelectedStopPoint] = useState<StopPoint | null>(null)
  const [showRouteSelector, setShowRouteSelector] = useState(false)

  // Obter a localização do usuário
  useEffect(() => {
    let timer: NodeJS.Timeout

    // Iniciar com a localização padrão para evitar tela em branco
    setUserLocation(defaultLocation)
    setLoading(false) // Carregar o mapa imediatamente com a localização padrão

    timer = setTimeout(() => {
      // Tentar obter a localização real do usuário
      if (typeof navigator !== "undefined" && navigator.geolocation) {
        try {
          const geoWatchId = navigator.geolocation.watchPosition(
            (position) => {
              setUserLocation([position.coords.latitude, position.coords.longitude])
              setLocationDenied(false)
              setShowLocationHelp(false)
              // Remover a linha que força a re-renderização do mapa
              // setMapKey(Date.now())
            },
            (error) => {
              // Tratar erro de permissão negada de forma silenciosa
              console.log("Geolocalização não disponível:", error.message)
              setLocationDenied(true)
              // Continuar com a localização padrão
            },
            {
              enableHighAccuracy: true,
              maximumAge: 30000,
              timeout: 10000,
            },
          )

          // Limpar o watcher quando o componente for desmontado
          return () => {
            navigator.geolocation.clearWatch(geoWatchId)
            clearTimeout(timer)
          }
        } catch (error) {
          console.log("Erro ao solicitar geolocalização:", error)
          setLocationDenied(true)
        }
      } else {
        // Navegador não suporta geolocalização
        console.log("Navegador não suporta geolocalização")
        setLocationDenied(true)
      }
    }, 0)

    return () => clearTimeout(timer)
  }, [])

  // Usar coordenadas de origem fornecidas, se disponíveis
  useEffect(() => {
    if (originCoords) {
      setUserLocation(originCoords)
      // Não forçar re-renderização do mapa para evitar tremores
      // setMapKey(Date.now())
    }
  }, [originCoords])

  // Atualizar as coordenadas da van quando vanPosition mudar
  useEffect(() => {
    if (vanPosition && vanPosition.lat !== undefined && vanPosition.lng !== undefined) {
      setVanPositionCoords([vanPosition.lat, vanPosition.lng])
    } else {
      setVanPositionCoords(null)
    }
  }, [vanPosition])

  // Função para atualizar a posição da van - memoizada para evitar recriações
  const handleVanPositionChange = useCallback(
    (position: [number, number]) => {
      if (position && position[0] !== undefined && position[1] !== undefined && onVanPositionChange) {
        onVanPositionChange({ lat: position[0], lng: position[1] })
      }
    },
    [onVanPositionChange],
  )

  const handleRetryMap = () => {
    setLoading(true)
    setMapError(false)
    setMapKey(Date.now()) // Forçar re-renderização do mapa

    setTimeout(() => {
      setLoading(false)
    }, 1000)
  }

  const handleShowLocationHelp = () => {
    setShowLocationHelp(true)
  }

  const handleContinueWithDefaultLocation = () => {
    setLocationDenied(false)
    setShowLocationHelp(false)
  }

  const handleMapError = () => {
    setMapError(true)
  }

  if (mapError) {
    return (
      <div className="relative w-full h-[calc(100vh-4rem)]">
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100">
          <div className="text-destructive text-center p-4">
            <MapPin className="h-12 w-12 mx-auto text-destructive" />
            <p className="mt-2 font-medium">Erro ao carregar o mapa</p>
            <Button onClick={handleRetryMap} variant="outline" className="mt-4">
              Tentar novamente
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-[calc(100vh-4rem)]">
      {loading ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Carregando mapa...</p>
        </div>
      ) : (
        <>
          {locationDenied && !showLocationHelp && (
            <Alert
              variant="warning"
              className="absolute top-4 left-4 right-4 z-[900] bg-white/95 backdrop-blur-sm shadow-lg"
            >
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="flex justify-between items-center flex-wrap">
                <span className="mr-2">
                  Usando localização aproximada. Para uma melhor experiência, permita o acesso à sua localização.
                </span>
                <div className="flex gap-2 mt-2 sm:mt-0">
                  <Button size="sm" variant="outline" onClick={handleShowLocationHelp}>
                    Como permitir?
                  </Button>
                  <Button size="sm" variant="default" onClick={handleContinueWithDefaultLocation}>
                    Continuar assim
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {showLocationHelp && (
            <Alert className="absolute top-4 left-4 right-4 z-[900] bg-white/95 backdrop-blur-sm shadow-lg">
              <Info className="h-4 w-4" />
              <AlertTitle>Como permitir acesso à localização</AlertTitle>
              <AlertDescription className="mt-2">
                <p className="mb-2">Para permitir o acesso à sua localização:</p>
                <ol className="list-decimal pl-5 space-y-1 mb-3">
                  <li>Clique no ícone de cadeado ou informação na barra de endereço do navegador</li>
                  <li>Encontre as configurações de "Localização" ou "Permissões do site"</li>
                  <li>Altere a configuração para "Permitir"</li>
                  <li>Recarregue a página</li>
                </ol>
                <div className="flex justify-end">
                  <Button size="sm" onClick={handleContinueWithDefaultLocation}>
                    Entendi, continuar
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {geocodingError && (
            <Alert className="absolute top-4 left-4 right-4 z-[900] bg-white/95 backdrop-blur-sm shadow-lg">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Estamos com dificuldades para acessar o serviço de endereços. Algumas funcionalidades podem estar
                limitadas.
              </AlertDescription>
            </Alert>
          )}

          {/* Usar a chave para forçar re-renderização do mapa quando a localização mudar */}
          <DynamicLeafletMap
            key={mapKey}
            userLocation={
              userLocation && userLocation[0] !== undefined && userLocation[1] !== undefined
                ? userLocation
                : defaultLocation
            }
            destination={
              destinationCoords && destinationCoords[0] !== undefined && destinationCoords[1] !== undefined
                ? destinationCoords
                : undefined
            }
            showRoute={showRoute}
            vanPosition={
              vanPositionCoords && vanPositionCoords[0] !== undefined && vanPositionCoords[1] !== undefined
                ? vanPositionCoords
                : null
            }
            onRequestRide={onRequestRide}
            onRequestRideFromStop={onRequestRideFromStop}
            rideStage={rideStage}
            onVanPositionChange={handleVanPositionChange}
            onError={handleMapError}
            onMapReady={() => setIsMapReady(true)}
            setSelectedStopPoint={setSelectedStopPoint}
            setShowRouteSelector={setShowRouteSelector}
            onReserveSeat={onReserveSeat}
            onRequestRideFromRoute={onRequestRideFromRoute}
            onNearStopPoint={onNearStopPoint}
            onReachedStopPoint={onReachedStopPoint}
            selectedRoute={selectedRoute}
          />

          {/* Endereços de origem e destino (quando fornecidos) */}
          {(origin || destination) && (
            <div className="absolute top-4 left-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-3 z-[900] mt-16">
              <div className="space-y-2">
                {origin && (
                  <div className="flex items-center gap-2">
                    <div className="bg-primary/20 p-1 rounded-full">
                      <MapPin className="h-4 w-4 text-primary" />
                    </div>
                    <p className="text-sm truncate">{origin}</p>
                  </div>
                )}
                {destination && (
                  <div className="flex items-center gap-2">
                    <div className="bg-destructive/20 p-1 rounded-full">
                      <MapPin className="h-4 w-4 text-destructive" />
                    </div>
                    <p className="text-sm truncate">{destination}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Botão de solicitar van - APENAS O PRETO */}
          {!showRoute && !destination && onRequestRide && isMapReady && !selectedStopPoint && !showRouteSelector && (
            <div className="absolute bottom-24 left-4 right-4 z-[900] max-w-md mx-auto">
              <Button
                onClick={onRequestRide}
                className="w-full py-6 text-lg bg-black hover:bg-gray-800 rounded-xl shadow-lg"
              >
                Solicitar Van
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
