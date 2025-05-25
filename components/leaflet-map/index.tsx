"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, ZoomControl, useMapEvents } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { Button } from "@/components/ui/button"
import { getRoute } from "@/services/routing-service"
import { getAllStopPoints, getAllRoutes, type StopPoint, type VanRoute } from "@/services/stop-points-service"
import { Bus } from "lucide-react"
import { isNearStopPoint } from "@/services/animation-service"

// Componente para controlar o mapa
function MapControls({ center, zoom }: { center: [number, number]; zoom?: number }) {
  const map = useMap()

  useEffect(() => {
    if (center && center[0] !== undefined && center[1] !== undefined) {
      if (zoom) {
        map.setView(center, zoom)
      } else {
        map.setView(center)
      }
    }
  }, [])

  return null
}

// Componente para renderizar a rota
function RouteDisplay({
  points,
  color,
  weight = 5,
  opacity = 0.8,
  isFixedRoute = false,
}: {
  points: [number, number][]
  color: string
  weight?: number
  opacity?: number
  isFixedRoute?: boolean
}) {
  return (
    <>
      <Polyline positions={points} color="#000" weight={weight + 3} opacity={0.15} lineJoin="round" lineCap="round" />
      <Polyline positions={points} color={color} weight={weight} opacity={opacity} lineJoin="round" lineCap="round" />
      <Polyline positions={points} color="#fff" weight={2} opacity={0.4} lineJoin="round" lineCap="round" />
    </>
  )
}

// Componente para animar o movimento da van
function AnimatedVanMarker({
  routePoints,
  vanIcon,
  rideStage,
  onPositionChange,
  onNearStopPoint,
  onReachedStopPoint,
}: {
  routePoints: [number, number][]
  vanIcon: L.Icon | null
  rideStage: string
  onPositionChange: (position: [number, number]) => void
  onNearStopPoint?: (stopPoint: StopPoint) => void
  onReachedStopPoint?: (stopPoint: StopPoint) => void
}) {
  const currentPositionRef = useRef<[number, number] | null>(null)
  const currentPointIndexRef = useRef(0)
  const lastTimestampRef = useRef(0)
  const animationRef = useRef<number | null>(null)
  const animationSpeedRef = useRef(0.5)
  const lastCameraUpdateRef = useRef(0)
  const cameraUpdateIntervalRef = useRef(1000)
  const animationCompletedRef = useRef(false)
  const lastReportedPositionRef = useRef<string | null>(null)
  const lastNearStopPointRef = useRef<string | null>(null)
  const lastReachedStopPointRef = useRef<string | null>(null)

  const [, setAnimationTick] = useState(0)

  const map = useMap()

  const calculateRotation = useCallback((from: [number, number], to: [number, number]): number => {
    const dx = to[1] - from[1]
    const dy = to[0] - from[0]
    return (Math.atan2(dy, dx) * 180) / Math.PI
  }, [])

  const animateMovement = useCallback(
    (timestamp: number) => {
      if (routePoints.length < 2 || currentPointIndexRef.current >= routePoints.length - 1) {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current)
          animationRef.current = null
          animationCompletedRef.current = true
        }
        return
      }

      if (!lastTimestampRef.current) {
        lastTimestampRef.current = timestamp
        animationRef.current = requestAnimationFrame(animateMovement)
        return
      }

      const deltaTime = timestamp - lastTimestampRef.current
      lastTimestampRef.current = timestamp

      if (rideStage === "arriving") {
        animationSpeedRef.current = 0.004
      } else if (rideStage === "journey") {
        animationSpeedRef.current = 0.006
      }

      const startPoint = routePoints[currentPointIndexRef.current]
      const endPoint = routePoints[currentPointIndexRef.current + 1]

      const latDiff = endPoint[0] - startPoint[0]
      const lngDiff = endPoint[1] - startPoint[1]
      const distance = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff)

      const step = animationSpeedRef.current * deltaTime * 0.01
      const progress = Math.min(step / distance, 1)

      const newLat = startPoint[0] + latDiff * progress
      const newLng = startPoint[1] + lngDiff * progress
      const newPosition: [number, number] = [newLat, newLng]

      const rotation = calculateRotation(startPoint, endPoint)

      if (vanIcon) {
        const vanElement = document.querySelector(".van-icon-with-logo") as HTMLElement
        if (vanElement) {
          vanElement.style.transform = `rotate(${rotation}deg)`
        }
      }

      currentPositionRef.current = newPosition

      const positionKey = `${newPosition[0].toFixed(5)},${newPosition[1].toFixed(5)}`
      if (positionKey !== lastReportedPositionRef.current) {
        lastReportedPositionRef.current = positionKey
        if (
          currentPositionRef.current &&
          currentPositionRef.current[0] !== undefined &&
          currentPositionRef.current[1] !== undefined
        ) {
          onPositionChange(newPosition)

          const nearStopPoint = isNearStopPoint(newPosition, 0.001)
          if (nearStopPoint && onNearStopPoint && nearStopPoint.id !== lastNearStopPointRef.current) {
            lastNearStopPointRef.current = nearStopPoint.id
            onNearStopPoint(nearStopPoint)
          }

          const reachedStopPoint = isNearStopPoint(newPosition, 0.0005)
          if (reachedStopPoint && onReachedStopPoint && reachedStopPoint.id !== lastReachedStopPointRef.current) {
            lastReachedStopPointRef.current = reachedStopPoint.id
            onReachedStopPoint(reachedStopPoint)

            animationSpeedRef.current = 0.002

            setTimeout(() => {
              animationSpeedRef.current = 0.006
            }, 3000)
          }
        }
      }

      if (progress >= 1) {
        currentPointIndexRef.current += 1
      }

      animationRef.current = requestAnimationFrame(animateMovement)
    },
    [routePoints, rideStage, vanIcon, onPositionChange, onNearStopPoint, onReachedStopPoint, calculateRotation],
  )

  useEffect(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
      animationRef.current = null
    }

    currentPointIndexRef.current = 0
    lastTimestampRef.current = 0
    animationCompletedRef.current = false
    lastReportedPositionRef.current = null
    lastNearStopPointRef.current = null
    lastReachedStopPointRef.current = null

    if (routePoints.length > 0 && (rideStage === "arriving" || rideStage === "journey")) {
      currentPositionRef.current = routePoints[0]
      if (
        currentPositionRef.current &&
        currentPositionRef.current[0] !== undefined &&
        currentPositionRef.current[1] !== undefined
      ) {
        const positionKey = `${routePoints[0][0].toFixed(5)},${routePoints[0][1].toFixed(5)}`
        lastReportedPositionRef.current = positionKey
        onPositionChange(routePoints[0])
      }

      animationRef.current = requestAnimationFrame(animateMovement)
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
        animationRef.current = null
      }
    }
  }, [routePoints, rideStage, animateMovement, onPositionChange])

  return null
}

function MapEvents({ onClick }: { onClick: (e: L.LeafletMouseEvent) => void }) {
  useMapEvents({
    click: onClick,
  })
  return null
}

interface LeafletMapProps {
  userLocation: [number, number]
  destination?: [number, number]
  showRoute?: boolean
  vanPosition?: { lat: number; lng: number } | null
  onRequestRide?: () => void
  onReserveSeat?: (stopPoint: StopPoint, passengers: number) => void
  onRequestRideFromRoute?: (location: [number, number], routeId: string, passengers: number) => void
  rideStage?: string
  onVanPositionChange?: (position: { lat: number; lng: number }) => void
  onNearStopPoint?: (stopPoint: StopPoint) => void
  onReachedStopPoint?: (stopPoint: StopPoint) => void
  onError?: () => void
  selectedRoute?: VanRoute | null
}

export function LeafletMap({
  userLocation,
  destination,
  showRoute = false,
  vanPosition = null,
  onRequestRide,
  onReserveSeat,
  onRequestRideFromRoute,
  rideStage = "",
  onVanPositionChange,
  onNearStopPoint,
  onReachedStopPoint,
  onError,
  selectedRoute,
}: LeafletMapProps) {
  const [isMapReady, setIsMapReady] = useState(false)
  const mapRef = useRef<L.Map | null>(null)
  const [vanIcon, setVanIcon] = useState<L.Icon | null>(null)
  const [stopPointIcon, setStopPointIcon] = useState<L.Icon | null>(null)
  const [pickupRoutePoints, setPickupRoutePoints] = useState<[number, number][]>([])
  const [journeyRoutePoints, setJourneyRoutePoints] = useState<[number, number][]>([])
  const [currentVanPosition, setCurrentVanPosition] = useState<[number, number] | null>(null)
  const [showMarkers, setShowMarkers] = useState(true)
  const [mapStyle, setMapStyle] = useState("osm")
  const [mapZoom, setMapZoom] = useState<number | undefined>(15)
  const [isLoadingRoute, setIsLoadingRoute] = useState(false)
  const [routeCalculated, setRouteCalculated] = useState({
    pickup: false,
    journey: false,
  })
  const [stopPoints, setStopPoints] = useState<StopPoint[]>([])
  const [vanRoutes, setVanRoutes] = useState<VanRoute[]>([])
  const [selectedStopPoint, setSelectedStopPoint] = useState<StopPoint | null>(null)
  const [selectedLocation, setSelectedLocation] = useState<[number, number] | null>(null)
  const [passengerCount, setPassengerCount] = useState(1)
  const [showRouteSelector, setShowRouteSelector] = useState(false)
  const [nextStopPoint, setNextStopPoint] = useState<StopPoint | null>(null)
  const [estimatedTravelTime, setEstimatedTravelTime] = useState<number | null>(null)
  const [distanceTraveled, setDistanceTraveled] = useState<number>(0)
  const [totalTravelTime, setTotalTravelTime] = useState<number>(0)

  const lastReportedVanPositionRef = useRef<string | null>(null)

  const handleVanPositionChange = useCallback(
    (position: [number, number]) => {
      if (!position || position[0] === undefined || position[1] === undefined) return

      const positionKey = `${position[0].toFixed(5)},${position[1].toFixed(5)}`

      if (positionKey !== lastReportedVanPositionRef.current) {
        lastReportedVanPositionRef.current = positionKey
        setCurrentVanPosition(position)

        if (onVanPositionChange) {
          onVanPositionChange({ lat: position[0], lng: position[1] })
        }
      }
    },
    [onVanPositionChange],
  )

  useEffect(() => {
    if (typeof window !== "undefined") {
      // @ts-ignore
      delete L.Icon.Default.prototype._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
      })

      setVanIcon(
        new L.Icon({
          iconUrl: "https://cdn-icons-png.flaticon.com/512/3097/3097144.png",
          iconSize: [48, 48],
          iconAnchor: [24, 24],
          popupAnchor: [0, -24],
          className: "van-icon-with-logo" + (rideStage === "journey" ? " van-moving" : ""),
        }),
      )

      setStopPointIcon(
        new L.Icon({
          iconUrl: "https://cdn-icons-png.flaticon.com/512/4874/4874738.png",
          iconSize: [40, 40],
          iconAnchor: [20, 40],
          popupAnchor: [0, -40],
          className: "stop-point-icon",
        }),
      )
    }
  }, [rideStage])

  useEffect(() => {
    const points = getAllStopPoints()
    const routes = getAllRoutes()
    setStopPoints(points)
    setVanRoutes(routes)
  }, [])

  useEffect(() => {
    if (mapRef.current && stopPoints.length > 0) {
      const bounds = L.latLngBounds(stopPoints.map((point) => point.location))
      mapRef.current.fitBounds(bounds, {
        padding: [50, 50],
        maxZoom: 13,
        animate: true,
        duration: 1,
      })
    }
  }, [stopPoints])

  // Usar a rota selecionada para a animação da van
  useEffect(() => {
    if (selectedRoute && showRoute) {
      // Usar o caminho da rota selecionada para a animação da van
      setJourneyRoutePoints(selectedRoute.path)
      setRouteCalculated((prev) => ({ ...prev, journey: true }))

      // Ajustar o mapa para mostrar a rota completa
      if (mapRef.current) {
        const bounds = L.latLngBounds(selectedRoute.path)
        mapRef.current.fitBounds(bounds, {
          padding: [50, 50],
          animate: true,
          duration: 1,
        })
      }
    }
  }, [selectedRoute, showRoute])

  const generateRandomVanStartPosition = useCallback((userLoc: [number, number]): [number, number] => {
    const radius = 0.01 + Math.random() * 0.02
    const angle = Math.random() * Math.PI * 2
    const latOffset = radius * Math.sin(angle)
    const lngOffset = radius * Math.cos(angle)
    return [userLoc[0] + latOffset, userLoc[1] + lngOffset]
  }, [])

  const generateRoutePoints = useCallback(
    (start: [number, number], end: [number, number], numPoints: number): [number, number][] => {
      const latDiff = end[0] - start[0]
      const lngDiff = end[1] - start[1]
      const points: [number, number][] = []
      for (let i = 0; i <= numPoints; i++) {
        points.push([start[0] + (latDiff * i) / numPoints, start[1] + (lngDiff * i) / numPoints])
      }
      return points
    },
    [],
  )

  // Obter rota quando o destino mudar (apenas para a fase de pickup)
  useEffect(() => {
    if (showRoute && !routeCalculated.pickup && selectedRoute) {
      const fetchRoute = async () => {
        setIsLoadingRoute(true)
        try {
          // Gerar uma posição inicial aleatória para a van
          const randomVanStart = generateRandomVanStartPosition(userLocation)

          // Usar o primeiro ponto da rota selecionada como destino da fase de pickup
          const firstRoutePoint = selectedRoute.path[0]

          // Obter rota da van até o primeiro ponto da rota
          const pickupRouteResult = await getRoute(randomVanStart, firstRoutePoint)
          setPickupRoutePoints(pickupRouteResult.coordinates)

          // Definir a posição inicial da van
          if (!currentVanPosition && pickupRouteResult.coordinates.length > 0) {
            const initialPosition = pickupRouteResult.coordinates[0]
            const positionKey = `${initialPosition[0].toFixed(5)},${initialPosition[1].toFixed(5)}`
            lastReportedVanPositionRef.current = positionKey
            setCurrentVanPosition(initialPosition)

            if (onVanPositionChange) {
              onVanPositionChange({ lat: initialPosition[0], lng: initialPosition[1] })
            }
          }

          // Ajustar o zoom para mostrar a rota de pickup inicialmente
          if (mapRef.current) {
            const bounds = L.latLngBounds([randomVanStart, firstRoutePoint])
            mapRef.current.fitBounds(bounds, {
              padding: [50, 50],
              animate: true,
              duration: 1,
            })
          }

          // Marcar a rota como calculada
          setRouteCalculated((prev) => ({ ...prev, pickup: true }))
        } catch (error) {
          console.error("Erro ao calcular rotas:", error)
          if (onError) onError()

          // Usar fallback
          const randomVanStart = generateRandomVanStartPosition(userLocation)
          const firstRoutePoint = selectedRoute.path[0]
          const fallbackRoute = generateRoutePoints(randomVanStart, firstRoutePoint, 15)
          setPickupRoutePoints(fallbackRoute)

          if (!currentVanPosition && fallbackRoute.length > 0) {
            const initialPosition = fallbackRoute[0]
            const positionKey = `${initialPosition[0].toFixed(5)},${initialPosition[1].toFixed(5)}`
            lastReportedVanPositionRef.current = positionKey
            setCurrentVanPosition(initialPosition)

            if (onVanPositionChange) {
              onVanPositionChange({ lat: initialPosition[0], lng: initialPosition[1] })
            }
          }

          setRouteCalculated((prev) => ({ ...prev, pickup: true }))
        } finally {
          setIsLoadingRoute(false)
        }
      }

      fetchRoute()
    } else if (!showRoute) {
      setPickupRoutePoints([])
      setJourneyRoutePoints([])
      setRouteCalculated({ pickup: false, journey: false })
    }
  }, [
    showRoute,
    selectedRoute,
    userLocation,
    onVanPositionChange,
    routeCalculated.pickup,
    onError,
    generateRandomVanStartPosition,
    generateRoutePoints,
    currentVanPosition,
  ])

  const toggleMapStyle = useCallback(() => {
    const newStyle =
      mapStyle === "osm"
        ? "osm-dark"
        : mapStyle === "osm-dark"
          ? "osm-humanitarian"
          : mapStyle === "osm-humanitarian"
            ? "osm-topo"
            : "osm"
    localStorage.setItem("mobiMapStyle", newStyle)
    setMapStyle(newStyle)
  }, [mapStyle])

  const getTileUrl = useCallback(() => {
    const isDarkMode = document.documentElement.classList.contains("dark")
    if (isDarkMode) {
      return "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
    }
    switch (mapStyle) {
      case "osm-dark":
        return "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      case "osm-humanitarian":
        return "https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png"
      case "osm-topo":
        return "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
      default:
        return "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    }
  }, [mapStyle])

  const getTileAttribution = useCallback(() => {
    switch (mapStyle) {
      case "osm-dark":
        return '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
      case "osm-humanitarian":
        return '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Tiles style by <a href="https://www.hotosm.org/" target="_blank">Humanitarian OpenStreetMap Team</a>'
      case "osm-topo":
        return 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a>'
      default:
        return '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }
  }, [mapStyle])

  useEffect(() => {
    if (vanPosition && vanPosition.lat !== undefined && vanPosition.lng !== undefined) {
      const newPosition: [number, number] = [vanPosition.lat, vanPosition.lng]
      const positionKey = `${newPosition[0].toFixed(5)},${newPosition[1].toFixed(5)}`
      if (positionKey !== lastReportedVanPositionRef.current) {
        lastReportedVanPositionRef.current = positionKey
        setCurrentVanPosition(newPosition)
      }
    }
  }, [vanPosition])

  useEffect(() => {
    const savedMapStyle = localStorage.getItem("mobiMapStyle")
    if (savedMapStyle) {
      setMapStyle(savedMapStyle)
    }
  }, [])

  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains("dark")
    if (isDarkMode && mapStyle !== "osm-dark") {
      setMapStyle("osm-dark")
      localStorage.setItem("mobiMapStyle", "osm-dark")
    }
  }, [mapStyle])

  const handleSelectStopPoint = (stopPoint: StopPoint) => {
    setSelectedStopPoint(stopPoint)
    setSelectedLocation(null)
    if (mapRef.current) {
      mapRef.current.flyTo(stopPoint.location, 16, {
        animate: true,
        duration: 1,
      })
    }
  }

  const handleMapClick = (e: L.LeafletMouseEvent) => {
    // Desativado durante a viagem
    if (rideStage !== "") return

    const clickLocation: [number, number] = [e.latlng.lat, e.latlng.lng]
    let closestRoute: VanRoute | null = null
    let closestDistance = Number.POSITIVE_INFINITY
    let closestPoint: [number, number] | null = null

    vanRoutes.forEach((route) => {
      route.path.forEach((point) => {
        const distance = calculateDistance(clickLocation, point)
        if (distance < closestDistance && distance < 0.005) {
          closestDistance = distance
          closestRoute = route
          closestPoint = point
        }
      })
    })

    if (closestRoute && closestPoint) {
      setSelectedLocation(closestPoint)
      if (mapRef.current) {
        mapRef.current.flyTo(closestPoint, 16, {
          animate: true,
          duration: 1,
        })
      }
    }
  }

  const calculateDistance = (point1: [number, number], point2: [number, number]): number => {
    const latDiff = point1[0] - point2[0]
    const lngDiff = point1[1] - point2[1]
    return Math.sqrt(latDiff * latDiff + lngDiff * lngDiff)
  }

  const handleReserveSeat = () => {
    if (selectedStopPoint && onReserveSeat) {
      onReserveSeat(selectedStopPoint, passengerCount)
      setSelectedStopPoint(null)
    }
  }

  const handleRequestStop = () => {
    console.log("Parada solicitada")
  }

  const centerMapOnUser = useCallback(() => {
    if (mapRef.current && userLocation) {
      mapRef.current.flyTo(userLocation, 15, {
        animate: true,
        duration: 1,
      })
    }
  }, [userLocation])

  if (typeof window === "undefined") {
    return null
  }

  return (
    <div className="w-full h-full relative">
      <MapContainer
        center={userLocation}
        zoom={15}
        style={{ height: "100%", width: "100%", zIndex: 1 }}
        whenReady={() => setIsMapReady(true)}
        ref={(ref) => {
          if (ref) {
            mapRef.current = ref
          }
        }}
        zoomControl={false}
        className="map-container"
        zoomAnimation={false}
      >
        <TileLayer url={getTileUrl()} />
        <ZoomControl position="bottomright" />
        <MapEvents onClick={handleMapClick} />

        {/* Renderizar todas as rotas disponíveis */}
        {vanRoutes.map((route) => (
          <RouteDisplay
            key={route.id}
            points={route.path}
            color={route.color}
            weight={selectedRoute && selectedRoute.id === route.id ? 6 : 4}
            opacity={selectedRoute && selectedRoute.id === route.id ? 1 : 0.5}
            isFixedRoute={true}
          />
        ))}

        {/* Marcadores dos pontos de parada */}
        {stopPoints.map((point) => (
          <Marker
            key={point.id}
            position={point.location}
            icon={stopPointIcon || new L.Icon.Default()}
            eventHandlers={{
              click: () => handleSelectStopPoint(point),
            }}
          >
            <Popup className="stop-point-popup">
              <div className="p-2 max-w-xs">
                <h3 className="font-bold text-lg">{point.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{point.address}</p>
                <p className="text-sm mb-1">{point.description}</p>
                <div className="flex justify-between items-center mt-2 mb-2">
                  <div className="flex items-center">
                    <Bus className="h-4 w-4 mr-1 text-primary" />
                    <span className="text-sm font-medium">{point.availableVans} vans disponíveis</span>
                  </div>
                  <div className="text-sm font-medium text-primary">Espera: {point.waitingTime}</div>
                </div>
                <div className="mt-3">
                  <Button onClick={() => handleSelectStopPoint(point)} className="w-full" variant="default">
                    Reservar Lugar
                  </Button>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Rota da van até o ponto inicial */}
        {showRoute && rideStage === "arriving" && pickupRoutePoints.length > 0 && (
          <RouteDisplay points={pickupRoutePoints} color="#8b5cf6" />
        )}

        {/* Rota da viagem (usando a rota selecionada) */}
        {showRoute && (rideStage === "journey" || rideStage === "complete") && journeyRoutePoints.length > 0 && (
          <RouteDisplay points={journeyRoutePoints} color={selectedRoute?.color || "#3b82f6"} />
        )}

        {/* Animação da van na fase de pickup */}
        {showRoute && rideStage === "arriving" && pickupRoutePoints.length > 0 && (
          <AnimatedVanMarker
            routePoints={pickupRoutePoints}
            vanIcon={vanIcon}
            rideStage={rideStage}
            onPositionChange={handleVanPositionChange}
            onNearStopPoint={onNearStopPoint}
            onReachedStopPoint={onReachedStopPoint}
          />
        )}

        {/* Animação da van na fase de viagem */}
        {showRoute && rideStage === "journey" && journeyRoutePoints.length > 0 && (
          <AnimatedVanMarker
            routePoints={journeyRoutePoints}
            vanIcon={vanIcon}
            rideStage={rideStage}
            onPositionChange={handleVanPositionChange}
            onNearStopPoint={onNearStopPoint}
            onReachedStopPoint={onReachedStopPoint}
          />
        )}

        {/* Marcador da van */}
        {showMarkers &&
          currentVanPosition &&
          currentVanPosition[0] !== undefined &&
          currentVanPosition[1] !== undefined &&
          vanIcon &&
          (rideStage === "arriving" || rideStage === "journey") && (
            <Marker position={currentVanPosition} icon={vanIcon}>
              <Popup className="custom-popup">
                <div className="p-2">
                  <h3 className="font-medium text-sm">Sua van está a caminho</h3>
                  <p className="text-xs text-muted-foreground">Chegando em breve</p>
                </div>
              </Popup>
            </Marker>
          )}

        <MapControls center={userLocation} zoom={mapZoom} />
      </MapContainer>

      <div className="absolute top-4 right-4">
        <Button onClick={toggleMapStyle} className="mr-2" variant="default">
          Mudar Estilo do Mapa
        </Button>
        <Button onClick={centerMapOnUser} variant="default">
          Centralizar no Usuário
        </Button>
      </div>

      {showRoute && rideStage === "journey" && (
        <div className="absolute bottom-4 left-4 bg-white dark:bg-gray-800 p-4 rounded shadow-lg">
          <h4 className="font-bold text-sm mb-2">Informações da Viagem</h4>
          {nextStopPoint && (
            <div>
              <p className="text-sm mb-1">Próximo Ponto de Parada: {nextStopPoint.name}</p>
              <p className="text-sm mb-1">
                Tempo Estimado até o Próximo Ponto: {estimatedTravelTime || "5-10"} minutos
              </p>
            </div>
          )}
          <p className="text-sm mb-1">Distância Percorrida: {distanceTraveled.toFixed(2)} km</p>
          <p className="text-sm mb-1">Tempo Total de Viagem: {totalTravelTime.toFixed(2)} minutos</p>
          <Button onClick={handleRequestStop} className="mt-2 w-full" variant="default">
            Descer Aqui
          </Button>
        </div>
      )}

      {selectedStopPoint && (
        <div className="absolute bottom-4 right-4 bg-white dark:bg-gray-800 p-4 rounded shadow-lg max-w-xs">
          <h4 className="font-bold text-sm mb-2">Reservar Lugar</h4>
          <p className="text-sm mb-2">Ponto: {selectedStopPoint.name}</p>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm">Passageiros:</p>
            <div className="flex items-center">
              <Button
                onClick={() => setPassengerCount(Math.max(1, passengerCount - 1))}
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                disabled={passengerCount <= 1}
              >
                -
              </Button>
              <span className="mx-3 font-medium">{passengerCount}</span>
              <Button
                onClick={() => setPassengerCount(Math.min(4, passengerCount + 1))}
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                disabled={passengerCount >= 4}
              >
                +
              </Button>
            </div>
          </div>
          <Button onClick={handleReserveSeat} className="w-full" variant="default">
            Confirmar Reserva
          </Button>
        </div>
      )}
    </div>
  )
}
