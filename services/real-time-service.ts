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
    private listeners: { [key: string]: Function[] } = {}
    private storage: Storage | {
      getItem: () => null
      setItem: () => void
      removeItem: () => void
    }
  
    private constructor() {
      this.storage = typeof window !== 'undefined' ? window.localStorage : {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {}
      }
      console.log("RealTimeService inicializado")
    }
  
    static getInstance(): RealTimeService {
      if (!RealTimeService.instance) {
        RealTimeService.instance = new RealTimeService()
      }
      return RealTimeService.instance
    }
  
    // Motorista inicia uma viagem
    startTrip(driverId: string, driverData: any, route: string): LiveTrip {
      console.log("Iniciando viagem com:", { driverId, driverData, route })
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
      console.log("Viagem iniciada com sucesso:", trip)
      return trip
    }
  
    // Solicitar uma corrida
    requestRide(passenger: LivePassenger): boolean {
      console.log("Solicitando corrida para:", passenger)
      const currentTrip = this.getCurrentTrip()
      if (!currentTrip) {
        console.error("Nenhuma viagem ativa encontrada")
        return false
      }
  
      if (currentTrip.status !== "waiting_passengers") {
        console.error("Viagem não está aceitando passageiros")
        return false
      }
  
      // Verificar capacidade
      const boardedCount = currentTrip.passengers.filter(p => p.status === "boarded").length
      const waitingCount = currentTrip.passengers.filter(p => p.status === "waiting").length
      const totalOccupied = boardedCount + waitingCount
  
      if (totalOccupied >= currentTrip.vehicle.capacity) {
        console.error("Van lotada")
        return false
      }
  
      // Adicionar passageiro à viagem
      currentTrip.passengers.push({
        ...passenger,
        id: `passenger_${Date.now()}`,
        status: "waiting",
        requestTime: new Date().toLocaleString("pt-BR")
      })
  
      this.setStorageItem("currentLiveTrip", JSON.stringify(currentTrip))
      this.notifyListeners("passenger_requested", { passenger })
      console.log("Corrida solicitada com sucesso")
      return true
    }
  
    // Verificar se pode aceitar mais passageiros
    canAcceptMorePassengers(): boolean {
      const currentTrip = this.getCurrentTrip()
      if (!currentTrip) return false
  
      const boardedCount = currentTrip.passengers.filter(p => p.status === "boarded").length
      const waitingCount = currentTrip.passengers.filter(p => p.status === "waiting").length
      const totalOccupied = boardedCount + waitingCount
  
      return totalOccupied < currentTrip.vehicle.capacity
    }
  
    // Obter viagem atual
    getCurrentTrip(): LiveTrip | null {
      const tripData = this.getStorageItem("currentLiveTrip")
      if (!tripData) return null
      try {
        return JSON.parse(tripData)
      } catch (error) {
        console.error("Erro ao parsear viagem:", error)
        return null
      }
    }
  
    // Métodos auxiliares
    private setStorageItem(key: string, value: string): void {
      try {
        this.storage.setItem(key, value)
      } catch (error) {
        console.error("Erro ao salvar no storage:", error)
      }
    }
  
    private getStorageItem(key: string): string | null {
      try {
        return this.storage.getItem(key)
      } catch (error) {
        console.error("Erro ao ler do storage:", error)
        return null
      }
    }
  
    private removeStorageItem(key: string): void {
      try {
        this.storage.removeItem(key)
      } catch (error) {
        console.error("Erro ao remover do storage:", error)
      }
    }
  
    // Sistema de eventos
    subscribe(event: string, callback: Function): void {
      if (!this.listeners[event]) {
        this.listeners[event] = []
      }
      this.listeners[event].push(callback)
    }
  
    unsubscribe(event: string, callback: Function): void {
      if (!this.listeners[event]) return
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback)
    }
  
    private notifyListeners(event: string, data: any): void {
      if (!this.listeners[event]) return
      this.listeners[event].forEach(callback => {
        try {
          callback(data)
        } catch (error) {
          console.error(`Erro ao notificar listener do evento ${event}:`, error)
        }
      })
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
  