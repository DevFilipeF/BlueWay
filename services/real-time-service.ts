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
    private isClient: boolean
  
    constructor() {
      this.isClient = typeof window !== "undefined"
    }
  
    static getInstance(): RealTimeService {
      if (!RealTimeService.instance) {
        RealTimeService.instance = new RealTimeService()
      }
      return RealTimeService.instance
    }
  
    private getStorageItem(key: string): string | null {
      if (!this.isClient) return null
      return localStorage.getItem(key)
    }
  
    private setStorageItem(key: string, value: string): void {
      if (!this.isClient) return
      localStorage.setItem(key, value)
    }
  
    private removeStorageItem(key: string): void {
      if (!this.isClient) return
      localStorage.removeItem(key)
    }
  
    // Motorista inicia uma viagem
    startTrip(driverId: string, driverData: any, route: string): LiveTrip {
      const trip: LiveTrip = {
        id: `live_trip_${Date.now()}`,
        driverId,
        driverName: driverData.name,
        driverPhone: driverData.phone,
        vehicle: driverData.vehicle,
        route: route || "Linha 1 - Paulista-Moema",
        status: "waiting_passengers",
        currentLocation: {
          lat: -23.563,
          lng: -46.6543,
        },
        passengers: [],
        startTime: new Date().toLocaleString("pt-BR"),
      }
  
      this.setStorageItem("currentLiveTrip", JSON.stringify(trip))
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
  
      const availableCapacity = this.getAvailableCapacity()
      if (availableCapacity <= 0) {
        return false
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
      this.setStorageItem("currentLiveTrip", JSON.stringify(currentTrip))
  
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
    boardPassenger(driverId: string, passengerId: string): void {
      const currentTrip = this.getCurrentTrip()
      if (!currentTrip || currentTrip.driverId !== driverId) {
        console.error("Viagem não encontrada ou motorista não autorizado");
        return;
      }

      const passengerIndex = currentTrip.passengers.findIndex((p) => p.id === passengerId)
      if (passengerIndex === -1) {
        console.error("Passageiro não encontrado");
        return;
      }

      currentTrip.passengers[passengerIndex].status = "boarded"
      currentTrip.passengers[passengerIndex].boardingTime = new Date().toLocaleString("pt-BR")

      if (currentTrip.status === "waiting_passengers") {
        currentTrip.status = "in_progress"
      }

      this.setStorageItem("currentLiveTrip", JSON.stringify(currentTrip))

      const passenger = currentTrip.passengers[passengerIndex]

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
  
      this.setStorageItem("currentLiveTrip", JSON.stringify(currentTrip))
  
      const passenger = currentTrip.passengers[passengerIndex]
  
      this.addDriverNotification(currentTrip.driverId, {
        type: "passenger_dropped",
        title: "Passageiro desembarcou!",
        message: `${passenger.name} desembarcou no destino`,
        passengerId: passenger.id,
      })
  
      this.notifyListeners("passenger_dropped", { trip: currentTrip, passenger })
    }
  
    // Finalizar viagem
    endTrip(driverId: string): void {
      const currentTrip = this.getCurrentTrip()
      if (!currentTrip || currentTrip.driverId !== driverId) {
        console.error("Viagem não encontrada ou motorista não autorizado");
        return;
      }

      currentTrip.status = "completed"
      this.setStorageItem("currentLiveTrip", JSON.stringify(currentTrip))
      this.notifyListeners("trip_ended", currentTrip)
      this.removeStorageItem("currentLiveTrip")
    }
  
    // Obter viagem atual
    getCurrentTrip(): LiveTrip | null {
      const trip = this.getStorageItem("currentLiveTrip")
      return trip ? JSON.parse(trip) : null
    }
  
    // Atualizar localização do motorista
    updateDriverLocation(lat: number, lng: number): void {
      const currentTrip = this.getCurrentTrip()
      if (!currentTrip) return
  
      currentTrip.currentLocation = { lat, lng }
      this.setStorageItem("currentLiveTrip", JSON.stringify(currentTrip))
  
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
      this.setStorageItem(`driver_notifications_${driverId}`, JSON.stringify(notifications.slice(0, 50)))
  
      this.notifyListeners("driver_notification", newNotification)
    }
  
    getDriverNotifications(driverId: string): DriverNotification[] {
      const notifications = this.getStorageItem(`driver_notifications_${driverId}`)
      return notifications ? JSON.parse(notifications) : []
    }
  
    markNotificationAsRead(driverId: string, notificationId: string): void {
      const notifications = this.getDriverNotifications(driverId)
      const notificationIndex = notifications.findIndex((n) => n.id === notificationId)
      if (notificationIndex === -1) return
  
      notifications[notificationIndex].read = true
      this.setStorageItem(`driver_notifications_${driverId}`, JSON.stringify(notifications))
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
  
  // Exportar uma função que retorna a instância ao invés da instância diretamente
  export const getRealTimeService = () => {
    if (typeof window === "undefined") {
      return null;
    }
    return RealTimeService.getInstance();
  }
  
  // Manter a exportação da instância para compatibilidade, mas com uma verificação
  export const realTimeService = typeof window === "undefined" ? null : RealTimeService.getInstance();
  