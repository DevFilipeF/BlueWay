"use client"

import { useState, useEffect, useCallback } from "react"
import { Navbar } from "@/components/navbar"
import { MapView } from "@/components/map-view"
import { RideTracking } from "@/components/ride-tracking"
import { PaymentModal } from "@/components/payment-modal"
import { RouteSelectionModal } from "@/components/route-selection-modal"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { ProtectedRoute } from "@/components/protected-route"
import { saveTrip, savePayment, spendCredits } from "@/services/user-service"
import { Button } from "@/components/ui/button"
import { getAllStopPoints, getStopPointsByRouteId, type StopPoint, type VanRoute } from "@/services/stop-points-service"

export default function Home() {
  const [isRouteModalOpen, setIsRouteModalOpen] = useState(false)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [rideRequested, setRideRequested] = useState(false)
  const [rideDetails, setRideDetails] = useState<{
    origin: string
    destination: string
    originCoords: [number, number]
    destinationCoords: [number, number]
    passengers: number
    paymentMethod: string
    driver?: {
      name: string
      rating: number
    }
    plate?: string
    route?: VanRoute
  } | null>(null)
  const [mapError, setMapError] = useState(false)
  const [vanPosition, setVanPosition] = useState<{ lat: number; lng: number } | null>(null)
  const [rideStage, setRideStage] = useState<"searching" | "found" | "arriving" | "pickup" | "journey" | "complete">(
    "searching",
  )
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [currentStop, setCurrentStop] = useState<string | null>(null)
  const [nextStop, setNextStop] = useState<string | null>(null)
  const [stopPoints, setStopPoints] = useState<StopPoint[]>([])
  const [currentStopIndex, setCurrentStopIndex] = useState(0)
  const [selectedRoute, setSelectedRoute] = useState<VanRoute | null>(null)
  const [routeStopPoints, setRouteStopPoints] = useState<StopPoint[]>([])

  // Coordenadas padrão para São Paulo
  const [userLocation, setUserLocation] = useState<[number, number]>([-23.5505, -46.6333])

  // Carregar pontos de parada
  useEffect(() => {
    const points = getAllStopPoints()
    setStopPoints(points)
  }, [])

  // Obter a localização do usuário de forma segura
  useEffect(() => {
    if (typeof navigator !== "undefined" && navigator.geolocation) {
      try {
        const successCallback = (position: GeolocationPosition) => {
          setUserLocation([position.coords.latitude, position.coords.longitude])
        }

        const errorCallback = (error: GeolocationPositionError) => {
          console.log("Usando localização padrão:", error.message)
        }

        navigator.geolocation.getCurrentPosition(successCallback, errorCallback, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        })
      } catch (error) {
        console.log("Erro ao acessar geolocalização:", error)
      }
    }
  }, [])

  // Atualizar pontos de parada quando uma rota é selecionada
  useEffect(() => {
    if (selectedRoute) {
      const routePoints = getStopPointsByRouteId(selectedRoute.id)
      setRouteStopPoints(routePoints)

      // Definir o primeiro ponto como origem e o último como destino
      if (routePoints.length > 0) {
        const firstStop = routePoints[0]
        const lastStop = routePoints[routePoints.length - 1]

        setRideDetails({
          origin: firstStop.name,
          destination: lastStop.name,
          originCoords: firstStop.location,
          destinationCoords: lastStop.location,
          passengers: 1,
          paymentMethod: "pix",
          route: selectedRoute,
        })
      }
    }
  }, [selectedRoute])

  // Simular movimento da van quando a viagem estiver em andamento
  useEffect(() => {
    if (!rideRequested || !rideDetails || !selectedRoute) return

    // Iniciar a simulação da van procurando
    setRideStage("searching")

    // Após 3 segundos, a van é encontrada e começa a se mover
    const timer1 = setTimeout(() => {
      setRideStage("found")

      // Após 2 segundos, a van começa a se aproximar
      setTimeout(() => {
        setRideStage("arriving")

        // Após 10 segundos, a van chega ao ponto de embarque
        setTimeout(() => {
          setRideStage("pickup")

          // Após 3 segundos no ponto de embarque, iniciar a viagem
          setTimeout(() => {
            setRideStage("journey")

            // Iniciar a simulação de passagem pelos pontos
            if (routeStopPoints.length > 0) {
              setCurrentStop(routeStopPoints[0].name)
              setCurrentStopIndex(0)

              if (routeStopPoints.length > 1) {
                setNextStop(routeStopPoints[1].name)
              }

              // Simular passagem pelos pontos a cada 10 segundos
              const stopInterval = setInterval(() => {
                setCurrentStopIndex((prev) => {
                  const newIndex = prev + 1

                  if (newIndex < routeStopPoints.length) {
                    setCurrentStop(routeStopPoints[newIndex].name)

                    if (newIndex + 1 < routeStopPoints.length) {
                      setNextStop(routeStopPoints[newIndex + 1].name)
                    } else {
                      setNextStop(null)
                    }

                    // Mostrar mensagem de chegada ao ponto
                    setSuccessMessage(`Chegamos ao ponto ${routeStopPoints[newIndex].name}. Deseja descer aqui?`)
                    setTimeout(() => setSuccessMessage(null), 5000)

                    return newIndex
                  } else {
                    // Chegou ao último ponto
                    clearInterval(stopInterval)

                    // Após 5 segundos no último ponto, concluir a viagem
                    setTimeout(() => {
                      setRideStage("complete")

                      // Atualizar o status da viagem para "Concluída"
                      const trips = JSON.parse(localStorage.getItem("mobiTrips") || "[]")
                      if (trips.length > 0) {
                        trips[0].status = "Concluída"
                        localStorage.setItem("mobiTrips", JSON.stringify(trips))
                      }
                    }, 5000)

                    return prev
                  }
                })
              }, 10000) // 10 segundos entre cada ponto

              return () => clearInterval(stopInterval)
            }
          }, 3000)
        }, 10000)
      }, 2000)
    }, 3000)

    return () => {
      clearTimeout(timer1)
    }
  }, [rideRequested, rideDetails, selectedRoute, routeStopPoints])

  const handleRequestRide = () => {
    setIsRouteModalOpen(true)
  }

  const handleSelectRoute = (route: VanRoute) => {
    setSelectedRoute(route)
    setIsRouteModalOpen(false)

    // Simular um motorista e placa
    const driver = {
      name: `Motorista ${Math.floor(Math.random() * 100)}`,
      rating: 4 + Math.random(),
    }

    const plate = `ABC-${Math.floor(Math.random() * 10000)}`

    // Atualizar os detalhes da viagem com o motorista e placa
    if (rideDetails) {
      setRideDetails({
        ...rideDetails,
        driver,
        plate,
        route,
      })
    }

    // Abrir o modal de pagamento
    setIsPaymentModalOpen(true)
  }

  const handleConfirmPayment = () => {
    if (!rideDetails || !selectedRoute) return

    // Verificar se tem créditos suficientes se o método de pagamento for crédito social
    if (rideDetails.paymentMethod === "social") {
      const success = spendCredits(7) // Gastar 7 créditos
      if (!success) {
        setErrorMessage("Créditos insuficientes. Por favor, escolha outro método de pagamento.")
        setIsPaymentModalOpen(false)
        setTimeout(() => setErrorMessage(null), 5000)
        return
      }
    }

    setIsPaymentModalOpen(false)
    setRideRequested(true)

    // Salvar a viagem no histórico
    const now = new Date()
    const tripId = `trip_${Date.now()}`

    // Salvar a viagem no histórico
    saveTrip({
      id: tripId,
      date: now.toLocaleDateString("pt-BR"),
      time: now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      origin: rideDetails.origin,
      destination: rideDetails.destination,
      amount: rideDetails.paymentMethod === "social" ? "7 créditos" : "R$ 8,50",
      paymentMethod:
        rideDetails.paymentMethod === "pix"
          ? "PIX"
          : rideDetails.paymentMethod === "card"
            ? "Cartão"
            : "Crédito Social",
      status: "Em andamento",
      driver: rideDetails.driver,
      duration: "~25 min",
    })

    // Salvar o pagamento no histórico
    savePayment({
      id: `payment_${Date.now()}`,
      date: now.toLocaleDateString("pt-BR"),
      time: now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      amount: rideDetails.paymentMethod === "social" ? "7 créditos" : "R$ 8,50",
      paymentMethod:
        rideDetails.paymentMethod === "pix"
          ? "PIX"
          : rideDetails.paymentMethod === "card"
            ? "Cartão"
            : "Crédito Social",
      description: `Viagem: ${rideDetails.origin.substring(0, 15)}... → ${rideDetails.destination.substring(0, 15)}...`,
      status: "Concluído",
    })

    // Mostrar mensagem de sucesso
    setSuccessMessage(`Viagem confirmada na linha ${selectedRoute.name}. A van está a caminho!`)
    setTimeout(() => setSuccessMessage(null), 5000)
  }

  const handleCancelRide = () => {
    setRideRequested(false)
    setRideDetails(null)
    setVanPosition(null)
    setRideStage("searching")
    setCurrentStop(null)
    setNextStop(null)
    setCurrentStopIndex(0)
    setSelectedRoute(null)
    setRouteStopPoints([])
  }

  const handleCompleteRide = () => {
    setRideRequested(false)
    setRideDetails(null)
    setVanPosition(null)
    setRideStage("searching")
    setCurrentStop(null)
    setNextStop(null)
    setCurrentStopIndex(0)
    setSelectedRoute(null)
    setRouteStopPoints([])
  }

  // Função para atualizar a posição da van a partir do mapa
  const handleVanPositionChange = useCallback((position: { lat: number; lng: number }) => {
    if (position && position.lat !== undefined && position.lng !== undefined) {
      setVanPosition(position)
    }
  }, [])

  // Função para lidar com a chegada a um ponto de parada
  const handleReachedStopPoint = useCallback(
    (stopPoint: StopPoint) => {
      setCurrentStop(stopPoint.name)

      // Encontrar o índice do ponto atual
      const index = routeStopPoints.findIndex((p) => p.id === stopPoint.id)
      if (index !== -1) {
        setCurrentStopIndex(index)

        // Definir o próximo ponto, se houver
        if (index + 1 < routeStopPoints.length) {
          setNextStop(routeStopPoints[index + 1].name)
        } else {
          setNextStop(null)
        }
      }

      // Mostrar mensagem de chegada ao ponto
      setSuccessMessage(`Chegamos ao ponto ${stopPoint.name}. Deseja descer aqui?`)
      setTimeout(() => setSuccessMessage(null), 5000)
    },
    [routeStopPoints],
  )

  // Função para lidar com a aproximação de um ponto de parada
  const handleNearStopPoint = useCallback((stopPoint: StopPoint) => {
    // Mostrar mensagem de aproximação do ponto
    setSuccessMessage(`Aproximando-se do ponto ${stopPoint.name}. Prepare-se para descer.`)
    setTimeout(() => setSuccessMessage(null), 5000)
  }, [])

  // Função para solicitar parada
  const handleRequestStop = useCallback(() => {
    // Mostrar mensagem de solicitação de parada
    setSuccessMessage("Parada solicitada. O motorista irá parar no próximo ponto.")
    setTimeout(() => setSuccessMessage(null), 5000)
  }, [])

  return (
    <ProtectedRoute>
      <div className="flex flex-col min-h-screen bg-white">
        <Navbar />
        <main className="flex-1 relative main-content-with-footer">
          {mapError && (
            <Alert variant="destructive" className="m-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Erro</AlertTitle>
              <AlertDescription>
                Não foi possível carregar o mapa. Verifique sua conexão e tente novamente.
              </AlertDescription>
            </Alert>
          )}

          {errorMessage && (
            <Alert variant="destructive" className="absolute top-4 left-4 right-4 z-[1001]">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          {successMessage && (
            <Alert className="absolute top-4 left-4 right-4 z-[1001] bg-green-50 border-green-200">
              <AlertCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">{successMessage}</AlertDescription>
            </Alert>
          )}

          <MapView
            onRequestRide={handleRequestRide}
            origin={rideDetails?.origin}
            destination={rideDetails?.destination}
            originCoords={
              rideDetails?.originCoords &&
              rideDetails.originCoords[0] !== undefined &&
              rideDetails.originCoords[1] !== undefined
                ? rideDetails.originCoords
                : undefined
            }
            destinationCoords={
              rideDetails?.destinationCoords &&
              rideDetails.destinationCoords[0] !== undefined &&
              rideDetails.destinationCoords[1] !== undefined
                ? rideDetails.destinationCoords
                : undefined
            }
            showRoute={!!rideDetails}
            vanPosition={
              vanPosition && vanPosition.lat !== undefined && vanPosition.lng !== undefined ? vanPosition : null
            }
            rideStage={rideStage}
            onVanPositionChange={handleVanPositionChange}
            onNearStopPoint={handleNearStopPoint}
            onReachedStopPoint={handleReachedStopPoint}
            selectedRoute={selectedRoute}
          />

          {!rideRequested && !rideDetails && (
            <div className="absolute bottom-40 left-4 right-4 z-[1001] max-w-md mx-auto">
              <Button
                onClick={handleRequestRide}
                className="w-full py-6 text-lg bg-black hover:bg-gray-800 rounded-xl shadow-lg"
              >
                Solicitar Van
              </Button>
            </div>
          )}

          {rideRequested && rideDetails && (
            <div className="absolute bottom-40 left-0 right-0 z-[1001] max-w-md mx-auto px-4">
              <RideTracking
                rideDetails={rideDetails}
                onCancel={handleCancelRide}
                onComplete={handleCompleteRide}
                rideStage={rideStage}
                currentStop={currentStop}
                nextStop={nextStop}
                routeName={selectedRoute?.name}
              />
            </div>
          )}

          <RouteSelectionModal
            open={isRouteModalOpen}
            onOpenChange={setIsRouteModalOpen}
            onSelectRoute={handleSelectRoute}
          />

          <PaymentModal
            open={isPaymentModalOpen}
            onOpenChange={setIsPaymentModalOpen}
            onConfirm={handleConfirmPayment}
            amount={rideDetails?.paymentMethod === "social" ? "7 créditos" : "R$ 8,50"}
            paymentMethod={rideDetails?.paymentMethod || "pix"}
          />
        </main>
      </div>
    </ProtectedRoute>
  )
}
