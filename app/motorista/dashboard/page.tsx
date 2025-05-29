"use client"

import { useState, useEffect } from "react"
import { useDriverAuth } from "@/contexts/driver-auth-context"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { type VanRoute } from "@/services/stop-points-service"
import { type LivePassenger } from "@/services/real-time-service"
import {
  MapPin,
  CheckCircle,
  Power,
  PowerOff,
  Bell,
  MessageCircle,
  Route,
  DollarSign,
  Settings,
  History,
  AlertTriangle,
  Send,
  Car,
  User,
  LogOut,
  UserCheck,
  UserPlus,
  Play,
  Square,
  Map,
} from "lucide-react"
import {
  getRealTimeService,
  type LiveTrip,
  type DriverNotification,
} from "@/services/real-time-service"
import { DriverProtectedRoute } from "@/components/driver-protected-route"
import { DriverSettingsModal } from "@/components/driver-settings-modal"
import { DriverHistoryModal } from "@/components/driver-history-modal"
import { DriverProfileModal } from "@/components/driver-profile-modal"
import { DriverRouteConfigModal } from "@/components/driver-route-config-modal"
import { DriverRouteViewModal } from "@/components/driver-route-view-modal"
import { DriverWithdrawalModal } from "@/components/driver-withdrawal-modal"
import { DriverRouteMapModal } from "@/components/driver-route-map-modal"
import { LeafletMap } from "@/components/leaflet-map"

export default function DriverDashboard() {
  const { driver, updateStatus, logout, updateDriver } = useDriverAuth()
  const [currentTrip, setCurrentTrip] = useState<LiveTrip | null>(null)
  const [notifications, setNotifications] = useState<DriverNotification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [successMessage, setSuccessMessage] = useState("")
  const [isOnline, setIsOnline] = useState(false)
  const [selectedPassenger, setSelectedPassenger] = useState<LivePassenger | null>(null)
  const [chatMessage, setChatMessage] = useState("")
  const [showNotifications, setShowNotifications] = useState(false)
  const [realTimeService, setRealTimeService] = useState<any>(null)

  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [showRouteConfigModal, setShowRouteConfigModal] = useState(false)
  const [showRouteViewModal, setShowRouteViewModal] = useState(false)
  const [showChatModal, setShowChatModal] = useState(false)
  const [selectedChatPassenger, setSelectedChatPassenger] = useState<LivePassenger | null>(null)
  const [currentRoute, setCurrentRoute] = useState<VanRoute | null>(null)
  const [dailyEarnings, setDailyEarnings] = useState(0)

  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false)
  const [showRouteMapModal, setShowRouteMapModal] = useState(false)
  const [showMapView, setShowMapView] = useState(false)

  // Adicionar estado para controlar capacidade
  const [vanCapacity, setVanCapacity] = useState({
    total: 16,
    occupied: 0,
    available: 16,
  })

  // Estado para controlar a aba ativa
  const [activeTab, setActiveTab] = useState("waiting")

  // Inicializar o realTimeService no lado do cliente
  useEffect(() => {
    if (typeof window === "undefined") return;
    setRealTimeService(getRealTimeService());
  }, []);

  // Inicializar vanCapacity quando o driver estiver disponível
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (driver?.vehicle?.capacity) {
      setVanCapacity({
        total: driver.vehicle.capacity,
        occupied: 0,
        available: driver.vehicle.capacity,
      })
    }
  }, [driver])

  // Polling para atualizações em tempo real
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!realTimeService) return;
    
    const interval = setInterval(() => {
      if (driver) {
        const trip = realTimeService.getCurrentTrip()
        setCurrentTrip(trip)

        // Atualizar capacidade da van
        if (trip) {
          const boardedCount = trip.passengers.filter((p: LivePassenger) => p.status === "boarded").length
          const waitingCount = trip.passengers.filter((p: LivePassenger) => p.status === "waiting").length
          const totalOccupied = boardedCount + waitingCount

          setVanCapacity({
            total: trip.vehicle.capacity,
            occupied: totalOccupied,
            available: trip.vehicle.capacity - totalOccupied,
          })
        } else {
          setVanCapacity({
            total: driver.vehicle.capacity,
            occupied: 0,
            available: driver.vehicle.capacity,
          })
        }

        const driverNotifications = realTimeService.getDriverNotifications(driver.id)
        setNotifications(driverNotifications)
        setUnreadCount(driverNotifications.filter((n: DriverNotification) => !n.read).length)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [driver, currentRoute, realTimeService])

  // Configurar listeners para eventos em tempo real
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!driver || !realTimeService) return

    realTimeService.subscribe("passenger_requested", (data: { passenger: LivePassenger }) => {
      showSuccess(`Nova solicitação de ${data.passenger.name}!`)
      playNotificationSound()
    })

    realTimeService.subscribe("passenger_boarded", (data: { passenger: LivePassenger }) => {
      showSuccess(`${data.passenger.name} embarcou no veículo!`)
    })

    realTimeService.subscribe("driver_notification", (notification: DriverNotification) => {
      showSuccess(notification.title)
    })

    return () => {
      realTimeService.unsubscribe("passenger_requested")
      realTimeService.unsubscribe("passenger_boarded")
      realTimeService.unsubscribe("driver_notification")
    }
  }, [driver, realTimeService])

  const playNotificationSound = () => {
    if (typeof window === "undefined") return;
    
    try {
      if (!window.AudioContext && !(window as any).webkitAudioContext) {
        console.warn("AudioContext não suportado neste navegador");
        return;
      }

      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.frequency.value = 800
      gainNode.gain.value = 0.1

      oscillator.start()
      oscillator.stop(audioContext.currentTime + 0.2)
    } catch (error) {
      console.error("Erro ao tocar som de notificação:", error)
    }
  }

  const handleStartTrip = () => {
    if (typeof window === "undefined") return;
    if (!driver || !realTimeService) {
      console.error("Driver ou realTimeService não disponível");
      return;
    }

    console.log("Iniciando viagem...");
    const trip = realTimeService.startTrip(driver.id, driver, currentRoute?.name || "Linha Centro-Shopping")
    setCurrentTrip(trip)
    console.log("Viagem iniciada:", trip);
  }

  const handleEndTrip = () => {
    if (typeof window === "undefined") return;
    if (!driver || !realTimeService) {
      console.error("Driver ou realTimeService não disponível");
      return;
    }

    console.log("Finalizando viagem...");
    realTimeService.endTrip(driver.id)
    setCurrentTrip(null)
    console.log("Viagem finalizada");
  }

  const handleBoardPassenger = (passengerId: string) => {
    if (typeof window === "undefined") return;
    if (!driver || !realTimeService) {
      console.error("Driver ou realTimeService não disponível");
      return;
    }

    console.log("Embarcando passageiro:", passengerId);
    realTimeService.boardPassenger(driver.id, passengerId)
    console.log("Passageiro embarcado");
  }

  const generateNewPassengers = () => {
    if (vanCapacity.available <= 0) {
      console.log("Van lotada - não gerando novos passageiros")
      return []
    }

    const names = ["Ana Costa", "Pedro Lima", "Carla Santos", "Roberto Silva", "Lucia Oliveira", "Fernando Souza"]
    const origins = ["Terminal Central", "Shopping Norte", "Hospital Municipal", "Universidade", "Centro Comercial"]
    const destinations = ["Aeroporto", "Rodoviária", "Shopping Sul", "Parque Central", "Zona Industrial"]

    const newPassengers = []
    const maxNewPassengers = Math.min(vanCapacity.available, Math.floor(Math.random() * 3) + 1)

    for (let i = 0; i < maxNewPassengers; i++) {
      const passenger = {
        id: `passenger_${Date.now()}_${i}`,
        name: names[Math.floor(Math.random() * names.length)],
        phone: `(11) 9${Math.floor(Math.random() * 10000)}-${Math.floor(Math.random() * 10000)}`,
        origin: origins[Math.floor(Math.random() * origins.length)],
        destination: destinations[Math.floor(Math.random() * destinations.length)],
        status: "waiting",
        paymentStatus: "paid",
        paymentMethod: Math.random() > 0.5 ? "PIX" : "Cartão",
        amount: "R$ 8,50",
        requestTime: new Date().toLocaleString("pt-BR"),
      }
      newPassengers.push(passenger)
    }

    return newPassengers
  }

  const handleDropOffPassenger = (passengerId: string) => {
    if (!driver || !realTimeService) return
    realTimeService.dropOffPassenger(passengerId)

    const earning = 8.5
    setDailyEarnings((prev) => prev + earning)

    if (typeof window === "undefined") return;

    const earningsHistory = JSON.parse(localStorage.getItem(`driver_earnings_${driver.id}`) || "[]")
    earningsHistory.unshift({
      amount: earning,
      description: "Passageiro desembarcado",
      date: new Date().toLocaleDateString("pt-BR"),
      time: new Date().toLocaleTimeString("pt-BR"),
    })
    localStorage.setItem(`driver_earnings_${driver.id}`, JSON.stringify(earningsHistory))

    setTimeout(() => {
      const newPassengers = generateNewPassengers()
      newPassengers.forEach((passenger) => {
        setTimeout(() => {
          realTimeService.requestRide(passenger)
        }, Math.random() * 5000)
      })
    }, 3000)

    showSuccess("Passageiro desembarcado!")
  }

  const handleToggleStatus = () => {
    if (typeof window === "undefined") return;
    if (driver) {
      const newStatus = driver.status === "online" ? "offline" : "online"
      updateStatus(newStatus)
      setIsOnline(newStatus === "online")
    }
  }

  const handleSendMessage = () => {
    if (typeof window === "undefined") return;
    if (!chatMessage.trim() || !selectedPassenger) return
    showSuccess(`Mensagem enviada para ${selectedPassenger.name}`)
    setChatMessage("")
  }

  const markNotificationAsRead = (notificationId: string) => {
    if (typeof window === "undefined") return;
    if (!driver || !realTimeService) return;
    
    realTimeService.markNotificationAsRead(driver.id, notificationId)
  }

  const showSuccess = (message: string) => {
    if (typeof window === "undefined") return;
    setSuccessMessage(message)
    setTimeout(() => setSuccessMessage(""), 2000)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "waiting":
        return "bg-yellow-100 text-yellow-800"
      case "boarded":
        return "bg-blue-100 text-blue-800"
      case "dropped_off":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "waiting":
        return "Aguardando"
      case "boarded":
        return "Embarcado"
      case "dropped_off":
        return "Concluído"
      default:
        return status
    }
  }

  const handleWithdrawal = (amount: number, method: string, details: any) => {
    if (typeof window === "undefined") return;
    
    if (!driver) return

    const withdrawal = {
      id: `withdrawal_${Date.now()}`,
      amount,
      method,
      details,
      date: new Date().toLocaleDateString("pt-BR"),
      time: new Date().toLocaleTimeString("pt-BR"),
      status: "completed",
    }

    const withdrawals = JSON.parse(localStorage.getItem(`driver_withdrawals_${driver.id}`) || "[]")
    withdrawals.unshift(withdrawal)
    localStorage.setItem(`driver_withdrawals_${driver.id}`, JSON.stringify(withdrawals))

    setDailyEarnings((prev) => Math.max(0, prev - amount))
    showSuccess("Saque realizado com sucesso!")
  }

  // Função compacta para renderizar card de passageiro
  const renderPassengerCard = (passenger: LivePassenger) => (
    <div key={passenger.id} className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs">
              {passenger.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium text-sm">{passenger.name}</h3>
            <p className="text-xs text-muted-foreground">{passenger.amount}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Badge className={`${getStatusColor(passenger.status)} text-xs px-2 py-1`}>
            {getStatusText(passenger.status)}
          </Badge>
        </div>
      </div>

      <div className="text-xs text-muted-foreground mb-2">
        <div className="flex items-center gap-1 mb-1">
          <MapPin className="h-3 w-3 text-green-600" />
          <span className="truncate">{passenger.origin}</span>
        </div>
        <div className="flex items-center gap-1">
          <MapPin className="h-3 w-3 text-red-600" />
          <span className="truncate">{passenger.destination}</span>
        </div>
      </div>

      <div className="flex gap-1">
        {passenger.status === "waiting" && (
          <Button
            size="sm"
            onClick={() => handleBoardPassenger(passenger.id)}
            className="bg-blue-600 hover:bg-blue-700 text-xs h-7 flex-1"
          >
            Embarcar
          </Button>
        )}
        {passenger.status === "boarded" && (
          <Button
            size="sm"
            onClick={() => handleDropOffPassenger(passenger.id)}
            className="bg-green-600 hover:bg-green-700 text-xs h-7 flex-1"
          >
            Desembarcar
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setSelectedChatPassenger(passenger)
            setShowChatModal(true)
          }}
          className="text-xs h-7 px-2"
        >
          <MessageCircle className="h-3 w-3" />
        </Button>
      </div>
    </div>
  )

  if (!driver) {
    return <div>Carregando...</div>
  }

  const waitingPassengers = currentTrip?.passengers.filter((p) => p.status === "waiting") || []
  const boardedPassengers = currentTrip?.passengers.filter((p) => p.status === "boarded") || []
  const completedPassengers = currentTrip?.passengers.filter((p) => p.status === "dropped_off") || []

  // Se estiver mostrando o mapa, renderizar apenas o mapa
  if (showMapView) {
    return (
      <DriverProtectedRoute>
        <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
          {/* Header do Mapa */}
          <div className="bg-white shadow-sm border-b px-4 py-3 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" onClick={() => setShowMapView(false)}>
                  ← Voltar
                </Button>
                <div>
                  <h1 className="text-lg font-semibold">Mapa da Rota</h1>
                  <p className="text-sm text-muted-foreground">
                    {currentRoute ? currentRoute.name : "Visualização da rota"}
                  </p>
                </div>
              </div>
              <Badge className={currentTrip ? "bg-green-600" : "bg-gray-600"}>
                {currentTrip ? "Viagem Ativa" : "Visualização"}
              </Badge>
            </div>
          </div>

          {/* Mapa */}
          <div className="flex-1 p-4">
            <LeafletMap
              userLocation={[-23.563, -46.6543]}
              selectedRoute={currentRoute}
              rideStage={currentTrip ? "journey" : ""}
            />
          </div>

          {/* Info da viagem no mapa */}
          {currentTrip && (
            <div className="bg-white border-t p-4 flex-shrink-0">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-lg font-bold text-blue-600">{waitingPassengers.length}</div>
                  <div className="text-xs text-muted-foreground">Aguardando</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-green-600">{boardedPassengers.length}</div>
                  <div className="text-xs text-muted-foreground">Embarcados</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-orange-600">R$ {dailyEarnings.toFixed(0)}</div>
                  <div className="text-xs text-muted-foreground">Ganhos</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </DriverProtectedRoute>
    )
  }

  return (
    <DriverProtectedRoute>
      <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
        {/* Header Compacto */}
        <div className="bg-white shadow-sm border-b px-4 py-3 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-blue-600 text-white text-sm">
                  {driver.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-lg font-semibold">{driver.name}</h1>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Car className="h-3 w-3" />
                  {driver.vehicle.plate}
                  <Badge variant="outline" className="text-xs">
                    {vanCapacity.occupied}/{vanCapacity.total}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Botão do Mapa */}
              {(currentRoute || currentTrip) && (
                <Button variant="outline" size="sm" onClick={() => setShowMapView(true)} className="h-8 w-8 p-0">
                  <Map className="h-4 w-4" />
                </Button>
              )}

              {/* Notificações */}
              <DropdownMenu open={showNotifications} onOpenChange={setShowNotifications}>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="relative h-8 w-8 p-0">
                    <Bell className="h-4 w-4" />
                    {unreadCount > 0 && (
                      <Badge className="absolute -top-1 -right-1 h-4 w-4 rounded-full p-0 text-xs">{unreadCount}</Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-72 max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground text-sm">Nenhuma notificação</div>
                  ) : (
                    notifications.slice(0, 5).map((notification) => (
                      <DropdownMenuItem
                        key={notification.id}
                        className={`p-3 cursor-pointer ${!notification.read ? "bg-blue-50" : ""}`}
                        onClick={() => markNotificationAsRead(notification.id)}
                      >
                        <div className="w-full">
                          <div className="flex justify-between items-start">
                            <h4 className="font-medium text-xs">{notification.title}</h4>
                            <span className="text-xs text-muted-foreground">
                              {notification.timestamp.split(" ")[1]}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{notification.message}</p>
                        </div>
                      </DropdownMenuItem>
                    ))
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Status Online/Offline */}
              <Button
                variant={driver.status === "online" ? "default" : "outline"}
                onClick={handleToggleStatus}
                size="sm"
                className={`gap-1 h-8 text-xs ${driver.status === "online" ? "bg-green-600 hover:bg-green-700" : ""}`}
              >
                {driver.status === "online" ? (
                  <>
                    <Power className="h-3 w-3" />
                    Online
                  </>
                ) : (
                  <>
                    <PowerOff className="h-3 w-3" />
                    Offline
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Conteúdo Principal */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Mensagem de Sucesso */}
          {successMessage && (
            <Alert className="mx-4 mt-2 bg-green-50 border-green-200 py-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800 text-sm">{successMessage}</AlertDescription>
            </Alert>
          )}

          {/* Stats Compactos */}
          <div className="px-4 py-3">
            <div className="grid grid-cols-4 gap-2">
              <div className="bg-white rounded-lg p-2 text-center border">
                <div className="text-lg font-bold text-blue-600">{waitingPassengers.length}</div>
                <div className="text-xs text-muted-foreground">Aguardando</div>
              </div>
              <div className="bg-white rounded-lg p-2 text-center border">
                <div className="text-lg font-bold text-green-600">{boardedPassengers.length}</div>
                <div className="text-xs text-muted-foreground">Embarcados</div>
              </div>
              <div className="bg-white rounded-lg p-2 text-center border">
                <div className="text-lg font-bold text-purple-600">{completedPassengers.length}</div>
                <div className="text-xs text-muted-foreground">Concluídos</div>
              </div>
              <div className="bg-white rounded-lg p-2 text-center border">
                <div className="text-lg font-bold text-orange-600">R$ {dailyEarnings.toFixed(0)}</div>
                <div className="text-xs text-muted-foreground">Ganhos</div>
              </div>
            </div>
          </div>

          {/* Alertas de Capacidade */}
          {vanCapacity.available === 0 && currentTrip && (
            <Alert className="mx-4 mb-2 bg-red-50 border-red-200 py-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800 text-sm">
                Van lotada! ({vanCapacity.total} passageiros)
              </AlertDescription>
            </Alert>
          )}

          {/* Controle de Viagem Compacto */}
          <div className="px-4 mb-3">
            <div className="bg-white rounded-lg p-3 border">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="font-medium text-sm">
                    {currentTrip ? currentTrip.route : currentRoute ? currentRoute.name : "Configure uma rota"}
                  </h3>
                  {currentTrip && <p className="text-xs text-muted-foreground">Iniciada às {currentTrip.startTime}</p>}
                </div>
                {currentTrip && (
                  <Badge className={currentTrip.status === "in_progress" ? "bg-green-600" : "bg-yellow-600"}>
                    {currentTrip.status === "in_progress" ? "Ativa" : "Aguardando"}
                  </Badge>
                )}
              </div>

              <div className="flex gap-2">
                {!currentTrip ? (
                  <>
                    <Button
                      onClick={handleStartTrip}
                      className="bg-green-600 hover:bg-green-700 gap-1 flex-1 h-8 text-xs"
                      disabled={!currentRoute}
                    >
                      <Play className="h-3 w-3" />
                      Iniciar
                    </Button>
                    <Button
                      variant="outline"
                      className="gap-1 h-8 text-xs px-3"
                      onClick={() => setShowRouteConfigModal(true)}
                    >
                      <Settings className="h-3 w-3" />
                      Rota
                    </Button>
                  </>
                ) : (
                  <Button onClick={handleEndTrip} variant="destructive" className="gap-1 flex-1 h-8 text-xs">
                    <Square className="h-3 w-3" />
                    Finalizar
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Lista de Passageiros com Abas */}
          {currentTrip && currentTrip.passengers.length > 0 && (
            <div className="flex-1 overflow-hidden px-4">
              <div className="bg-white rounded-lg border h-full flex flex-col">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
                  <TabsList className="grid w-full grid-cols-3 m-2 h-8">
                    <TabsTrigger value="waiting" className="text-xs gap-1 h-6">
                      <UserPlus className="h-3 w-3" />
                      {waitingPassengers.length}
                    </TabsTrigger>
                    <TabsTrigger value="boarded" className="text-xs gap-1 h-6">
                      <UserCheck className="h-3 w-3" />
                      {boardedPassengers.length}
                    </TabsTrigger>
                    <TabsTrigger value="completed" className="text-xs gap-1 h-6">
                      <CheckCircle className="h-3 w-3" />
                      {completedPassengers.length}
                    </TabsTrigger>
                  </TabsList>

                  <div className="flex-1 overflow-hidden">
                    <TabsContent value="waiting" className="h-full overflow-y-auto p-2 space-y-2 m-0">
                      {waitingPassengers.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <UserPlus className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">Nenhum passageiro aguardando</p>
                        </div>
                      ) : (
                        waitingPassengers.map(renderPassengerCard)
                      )}
                    </TabsContent>

                    <TabsContent value="boarded" className="h-full overflow-y-auto p-2 space-y-2 m-0">
                      {boardedPassengers.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <UserCheck className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">Nenhum passageiro embarcado</p>
                        </div>
                      ) : (
                        boardedPassengers.map(renderPassengerCard)
                      )}
                    </TabsContent>

                    <TabsContent value="completed" className="h-full overflow-y-auto p-2 space-y-2 m-0">
                      {completedPassengers.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <CheckCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">Nenhuma viagem concluída</p>
                        </div>
                      ) : (
                        completedPassengers.map(renderPassengerCard)
                      )}
                    </TabsContent>
                  </div>
                </Tabs>
              </div>
            </div>
          )}

          {/* Mensagem quando não há viagem ativa */}
          {!currentTrip && (
            <div className="flex-1 flex items-center justify-center px-4">
              <div className="text-center">
                <Route className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                <h3 className="font-medium text-lg mb-2">Configure uma rota</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  {currentRoute ? "Pronto para iniciar viagem" : "Selecione uma rota para começar"}
                </p>
                <Button onClick={() => setShowRouteConfigModal(true)} className="gap-2">
                  <Settings className="h-4 w-4" />
                  {currentRoute ? "Alterar Rota" : "Configurar Rota"}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Footer com navegação estilo app */}
        <div className="bg-white border-t shadow-lg flex-shrink-0">
          <div className="grid grid-cols-5 gap-1 px-2 py-2">
            <Button
              variant="ghost"
              className="flex flex-col items-center gap-1 py-2 h-auto"
              onClick={() => setShowProfileModal(true)}
            >
              <User className="h-4 w-4" />
              <span className="text-xs">Perfil</span>
            </Button>

            <Button
              variant="ghost"
              className="flex flex-col items-center gap-1 py-2 h-auto"
              onClick={() => setShowHistoryModal(true)}
            >
              <History className="h-4 w-4" />
              <span className="text-xs">Histórico</span>
            </Button>

            <Button
              variant="ghost"
              className="flex flex-col items-center gap-1 py-2 h-auto"
              onClick={() => setShowSettingsModal(true)}
            >
              <Settings className="h-4 w-4" />
              <span className="text-xs">Config</span>
            </Button>

            <Button
              variant="ghost"
              className="flex flex-col items-center gap-1 py-2 h-auto"
              onClick={() => setShowWithdrawalModal(true)}
              disabled={dailyEarnings <= 0}
            >
              <DollarSign className="h-4 w-4" />
              <span className="text-xs">Sacar</span>
            </Button>

            <Button
              variant="ghost"
              className="flex flex-col items-center gap-1 py-2 h-auto text-red-600"
              onClick={logout}
            >
              <LogOut className="h-4 w-4" />
              <span className="text-xs">Sair</span>
            </Button>
          </div>
        </div>

        {/* Modal de Chat com Passageiro */}
        <Dialog open={showChatModal} onOpenChange={setShowChatModal}>
          <DialogContent className="sm:max-w-md h-[500px] flex flex-col">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Chat com {selectedChatPassenger?.name}
              </DialogTitle>
            </DialogHeader>

            {/* Área de mensagens */}
            <div className="flex-1 overflow-y-auto space-y-3 p-2">
              <div className="flex justify-end">
                <div className="flex items-end gap-2 max-w-[80%] flex-row-reverse">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="bg-blue-600 text-white">M</AvatarFallback>
                  </Avatar>
                  <div className="rounded-lg px-3 py-2 bg-blue-600 text-white">
                    <p className="text-sm">Oi! Tá tranquilo?</p>
                    <p className="text-xs mt-1 text-blue-100">
                      {new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-start">
                <div className="flex items-end gap-2 max-w-[80%]">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="bg-gray-600 text-white">
                      {selectedChatPassenger?.name?.[0] || "P"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="rounded-lg px-3 py-2 bg-gray-100 text-gray-900">
                    <p className="text-sm">Tudo bem, obrigado!</p>
                    <p className="text-xs mt-1 text-gray-500">
                      {new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Input de mensagem */}
            <div className="flex gap-2 pt-2 border-t">
              <Input
                placeholder="Digite sua mensagem..."
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              />
              <Button onClick={handleSendMessage} size="icon">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modais */}
        <DriverSettingsModal
          open={showSettingsModal}
          onOpenChange={setShowSettingsModal}
          driver={driver}
          onUpdateDriver={updateDriver}
        />

        <DriverHistoryModal open={showHistoryModal} onOpenChange={setShowHistoryModal} driverId={driver.id} />

        <DriverProfileModal
          open={showProfileModal}
          onOpenChange={setShowProfileModal}
          driver={driver}
          onUpdateDriver={updateDriver}
        />

        <DriverRouteConfigModal
          open={showRouteConfigModal}
          onOpenChange={setShowRouteConfigModal}
          currentRoute={currentRoute}
          onSelectRoute={(route) => {
            setCurrentRoute(route)
            showSuccess(`Rota configurada: ${route.name}`)
          }}
        />

        <DriverRouteViewModal open={showRouteViewModal} onOpenChange={setShowRouteViewModal} route={currentRoute} />

        <DriverWithdrawalModal
          open={showWithdrawalModal}
          onOpenChange={setShowWithdrawalModal}
          currentEarnings={dailyEarnings}
          driverId={driver.id}
          onWithdrawalComplete={handleWithdrawal}
        />

        <DriverRouteMapModal open={showRouteMapModal} onOpenChange={setShowRouteMapModal} route={currentRoute} />
      </div>
    </DriverProtectedRoute>
  )
}


