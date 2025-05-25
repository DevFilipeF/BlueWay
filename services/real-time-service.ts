export interface LiveTrip {
    id: string
    driverId: string
    driverName: string
    driverPhone: string
    vehicle: {
      plate: string
      model: string
      color: string
      capacity: number
    }
    route: string
    status: "waiting_passengers" | "in_progress" | "completed"
    currentLocation: {
      lat: number
      lng: number
    }
    passengers: LivePassenger[]
    startTime: string
    estimatedArrival?: string
    currentStop?: string
    nextStop?: string
  }
  
  export interface LivePassenger {
    id: string
    name: string
    phone: string
    origin: string
    destination: string
    status: "waiting" | "boarded" | "dropped_off"
    boardingTime?: string
    dropOffTime?: string
    paymentStatus: "pending" | "paid"
    paymentMethod: string
    amount: string
    requestTime: string
  }
  
  export interface DriverNotification {
    id: string
    type: "new_passenger" | "passenger_boarded" | "passenger_dropped" | "payment_received" | "route_update"
    title: string
    message: string
    timestamp: string
    read: boolean
    passengerId?: string
  }
  
  export interface PassengerNotification {
    id: string
    type: "driver_found" | "driver_arriving" | "trip_started" | "approaching_stop" | "arrived_destination"
    title: string
    message: string
    timestamp: string
    read: boolean
    driverId?: string
  }
  
  // Serviço de viagens ao vivo
  export class RealTimeService {
    private static instance: RealTimeService
    private listeners: Map<string, (data: any) => void> = new Map()
  
    static getInstance(): RealTimeService {
      if (!RealTimeService.instance) {
        RealTimeService.instance = new RealTimeService()
      }
      return RealTimeService.instance
    }
  
    // Motorista inicia uma viagem
    startTrip(driverId: string, driverData: any, route: string): LiveTrip {
      const trip: LiveTrip = {
        id: `live_trip_${Date.now()}`,
        driverId,
        driverName: driverData.name,
        driverPhone: driverData.phone,
        vehicle: driverData.vehicle,
        route: route || "Linha 1 - Paulista-Moema", // Usar rota real como padrão
        status: "waiting_passengers",
        currentLocation: {
          lat: -23.563, // Começar na Av. Paulista
          lng: -46.6543,
        },
        passengers: [],
        startTime: new Date().toLocaleString("pt-BR"),
      }
  
      localStorage.setItem("currentLiveTrip", JSON.stringify(trip))
      this.notifyListeners("trip_started", trip)
      return trip
    }
  
    // Adicionar método para verificar capacidade disponível
    getAvailableCapacity(): number {
      const currentTrip = this.getCurrentTrip()
      if (!currentTrip) return 0
  
      const boardedPassengers = currentTrip.passengers.filter((p) => p.status === "boarded").length
      return currentTrip.vehicle.capacity - boardedPassengers
    }
  
    // Passageiro solicita embarque
    requestRide(passengerData: any): boolean {
      const currentTrip = this.getCurrentTrip()
      if (!currentTrip) return false
  
      // Verificar se há capacidade disponível
      const availableCapacity = this.getAvailableCapacity()
      if (availableCapacity <= 0) {
        return false // Van lotada
      }
  
      const passenger: LivePassenger = {
        id: `passenger_${Date.now()}`,
        name: passengerData.name,
        phone: passengerData.phone,
        origin: passengerData.origin,
        destination: passengerData.destination,
        status: "waiting",
        paymentStatus: passengerData.paymentStatus || "paid",
        paymentMethod: passengerData.paymentMethod,
        amount: passengerData.amount,
        requestTime: new Date().toLocaleString("pt-BR"),
      }
  
      currentTrip.passengers.push(passenger)
      localStorage.setItem("currentLiveTrip", JSON.stringify(currentTrip))
  
      // Notificar motorista
      this.addDriverNotification(currentTrip.driverId, {
        type: "new_passenger",
        title: "Nova solicitação!",
        message: `${passenger.name} solicitou embarque de ${passenger.origin} para ${passenger.destination}`,
        passengerId: passenger.id,
      })
  
      this.notifyListeners("passenger_requested", { trip: currentTrip, passenger })
      return true
    }
  
    // Passageiro embarca
    boardPassenger(passengerId: string): void {
      const currentTrip = this.getCurrentTrip()
      if (!currentTrip) return
  
      const passengerIndex = currentTrip.passengers.findIndex((p) => p.id === passengerId)
      if (passengerIndex === -1) return
  
      currentTrip.passengers[passengerIndex].status = "boarded"
      currentTrip.passengers[passengerIndex].boardingTime = new Date().toLocaleString("pt-BR")
  
      if (currentTrip.status === "waiting_passengers") {
        currentTrip.status = "in_progress"
      }
  
      localStorage.setItem("currentLiveTrip", JSON.stringify(currentTrip))
  
      const passenger = currentTrip.passengers[passengerIndex]
  
      // Notificar motorista
      this.addDriverNotification(currentTrip.driverId, {
        type: "passenger_boarded",
        title: "Passageiro embarcou!",
        message: `${passenger.name} embarcou no veículo`,
        passengerId: passenger.id,
      })
  
      this.notifyListeners("passenger_boarded", { trip: currentTrip, passenger })
    }
  
    // Passageiro desembarca
    dropOffPassenger(passengerId: string): void {
      const currentTrip = this.getCurrentTrip()
      if (!currentTrip) return
  
      const passengerIndex = currentTrip.passengers.findIndex((p) => p.id === passengerId)
      if (passengerIndex === -1) return
  
      currentTrip.passengers[passengerIndex].status = "dropped_off"
      currentTrip.passengers[passengerIndex].dropOffTime = new Date().toLocaleString("pt-BR")
  
      localStorage.setItem("currentLiveTrip", JSON.stringify(currentTrip))
  
      const passenger = currentTrip.passengers[passengerIndex]
  
      // Notificar motorista
      this.addDriverNotification(currentTrip.driverId, {
        type: "passenger_dropped",
        title: "Passageiro desembarcou!",
        message: `${passenger.name} desembarcou no destino`,
        passengerId: passenger.id,
      })
  
      this.notifyListeners("passenger_dropped", { trip: currentTrip, passenger })
    }
  
    // Finalizar viagem
    endTrip(): void {
      const currentTrip = this.getCurrentTrip()
      if (!currentTrip) return
  
      currentTrip.status = "completed"
      localStorage.setItem("currentLiveTrip", JSON.stringify(currentTrip))
  
      // Salvar no histórico
      const tripHistory = JSON.parse(localStorage.getItem("tripHistory") || "[]")
      tripHistory.unshift(currentTrip)
      localStorage.setItem("tripHistory", JSON.stringify(tripHistory))
  
      // Limpar viagem atual
      localStorage.removeItem("currentLiveTrip")
  
      this.notifyListeners("trip_ended", currentTrip)
    }
  
    // Obter viagem atual
    getCurrentTrip(): LiveTrip | null {
      const trip = localStorage.getItem("currentLiveTrip")
      return trip ? JSON.parse(trip) : null
    }
  
    // Atualizar localização do motorista
    updateDriverLocation(lat: number, lng: number): void {
      const currentTrip = this.getCurrentTrip()
      if (!currentTrip) return
  
      currentTrip.currentLocation = { lat, lng }
      localStorage.setItem("currentLiveTrip", JSON.stringify(currentTrip))
  
      this.notifyListeners("location_updated", { trip: currentTrip, location: { lat, lng } })
    }
  
    // Sistema de notificações para motorista
    addDriverNotification(driverId: string, notification: Omit<DriverNotification, "id" | "timestamp" | "read">): void {
      const notifications = this.getDriverNotifications(driverId)
      const newNotification: DriverNotification = {
        ...notification,
        id: `notif_${Date.now()}`,
        timestamp: new Date().toLocaleString("pt-BR"),
        read: false,
      }
  
      notifications.unshift(newNotification)
      localStorage.setItem(`driver_notifications_${driverId}`, JSON.stringify(notifications.slice(0, 50))) // Manter apenas 50 notificações
  
      this.notifyListeners("driver_notification", newNotification)
    }
  
    getDriverNotifications(driverId: string): DriverNotification[] {
      const notifications = localStorage.getItem(`driver_notifications_${driverId}`)
      return notifications ? JSON.parse(notifications) : []
    }
  
    markNotificationAsRead(driverId: string, notificationId: string): void {
      const notifications = this.getDriverNotifications(driverId)
      const notification = notifications.find((n) => n.id === notificationId)
      if (notification) {
        notification.read = true
        localStorage.setItem(`driver_notifications_${driverId}`, JSON.stringify(notifications))
      }
    }
  
    // Sistema de listeners para atualizações em tempo real
    subscribe(event: string, callback: (data: any) => void): void {
      this.listeners.set(event, callback)
    }
  
    unsubscribe(event: string): void {
      this.listeners.delete(event)
    }
  
    private notifyListeners(event: string, data: any): void {
      const callback = this.listeners.get(event)
      if (callback) {
        callback(data)
      }
    }
  
    // Adicionar método para verificar se pode aceitar mais passageiros
    canAcceptMorePassengers(): boolean {
      return this.getAvailableCapacity() > 0
    }
  
    // Simular dados de exemplo
    initializeMockData(): void {
      // Criar alguns passageiros de exemplo que solicitaram viagem
      const mockPassengers = [
        {
          name: "Maria Silva",
          phone: "(11) 99999-1111",
          origin: "Terminal Rodoviário",
          destination: "Shopping Center",
          paymentStatus: "paid",
          paymentMethod: "PIX",
          amount: "R$ 8,50",
        },
        {
          name: "João Santos",
          phone: "(11) 99999-2222",
          origin: "Praça Central",
          destination: "Hospital Municipal",
          paymentStatus: "paid",
          paymentMethod: "Cartão",
          amount: "R$ 8,50",
        },
      ]
  
      // Simular solicitações após 2 segundos
      setTimeout(() => {
        mockPassengers.forEach((passenger, index) => {
          setTimeout(() => {
            this.requestRide(passenger)
          }, index * 3000) // 3 segundos entre cada solicitação
        })
      }, 2000)
    }
  }
  
  export const realTimeService = RealTimeService.getInstance()
  