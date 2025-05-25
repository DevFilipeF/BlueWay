import { realTimeService } from "./real-time-service"

export interface User {
  id: string
  name: string
  email: string
  phone: string
  photoUrl?: string
  provider?: string
}

export interface Trip {
  id: string
  date: string
  time: string
  origin: string
  destination: string
  amount: string
  paymentMethod: string
  status: string
  driver?: {
    name: string
    rating: number
  }
  duration?: string
}

export interface Payment {
  id: string
  date: string
  time: string
  amount: string
  paymentMethod: string
  description: string
  status: string
}

export interface UserCredits {
  total: number
  expiration: string
}

export interface LiveTripInfo {
  id: string
  driver: {
    name: string
    phone: string
    vehicle: {
      plate: string
      model: string
      color: string
      capacity: number
    }
    rating: number
  }
  route: string
  status: "waiting" | "boarded" | "dropped_off"
  estimatedArrival?: string
  currentLocation: {
    lat: number
    lng: number
  }
}

// Atualizar função requestRideRealTime para verificar capacidade
export function requestRideRealTime(rideData: {
  origin: string
  destination: string
  paymentMethod: string
  amount: string
  user: User
}): boolean {
  try {
    // Verificar se há uma viagem ativa disponível
    const currentTrip = realTimeService.getCurrentTrip()
    if (!currentTrip) {
      return false // Nenhum motorista disponível
    }

    // Verificar se há capacidade disponível
    if (!realTimeService.canAcceptMorePassengers()) {
      return false // Van lotada
    }

    // Solicitar embarque na viagem ativa
    return realTimeService.requestRide({
      name: rideData.user.name,
      phone: rideData.user.phone,
      origin: rideData.origin,
      destination: rideData.destination,
      paymentStatus: "paid",
      paymentMethod: rideData.paymentMethod,
      amount: rideData.amount,
    })
  } catch (error) {
    console.error("Erro ao solicitar viagem:", error)
    return false
  }
}

// Verificar se há motoristas disponíveis
export function checkAvailableDrivers(): boolean {
  const currentTrip = realTimeService.getCurrentTrip()
  return !!currentTrip && currentTrip.status === "waiting_passengers"
}

// Obter informações da viagem atual do usuário
export function getCurrentUserTrip(userId: string): LiveTripInfo | null {
  const currentTrip = realTimeService.getCurrentTrip()
  if (!currentTrip) return null

  const userPassenger = currentTrip.passengers.find((p) => p.name === getUserById(userId)?.name)

  if (!userPassenger) return null

  return {
    id: currentTrip.id,
    driver: {
      name: currentTrip.driverName,
      phone: currentTrip.driverPhone,
      vehicle: currentTrip.vehicle,
      rating: 4.8,
    },
    route: currentTrip.route,
    status: userPassenger.status,
    estimatedArrival: currentTrip.estimatedArrival,
    currentLocation: currentTrip.currentLocation,
  }
}

// Atualizar função getAvailableDriver para incluir capacidade atual
export function getAvailableDriver() {
  const currentTrip = realTimeService.getCurrentTrip()
  if (!currentTrip || currentTrip.status !== "waiting_passengers") {
    return null
  }

  const boardedPassengers = currentTrip.passengers.filter((p) => p.status === "boarded").length
  const availableSeats = currentTrip.vehicle.capacity - boardedPassengers

  return {
    id: currentTrip.driverId,
    name: currentTrip.driverName,
    phone: currentTrip.driverPhone,
    vehicle: currentTrip.vehicle,
    route: currentTrip.route,
    passengers: boardedPassengers,
    capacity: currentTrip.vehicle.capacity,
    availableSeats: availableSeats,
    startTime: currentTrip.startTime,
    rating: 4.8,
    isFull: availableSeats <= 0,
  }
}

// Funções de usuário
export function getUser(): User | null {
  if (typeof window === "undefined") return null
  const user = localStorage.getItem("mobiUser")
  return user ? JSON.parse(user) : null
}

export function getUserById(userId: string): User | null {
  if (typeof window === "undefined") return null
  const users = JSON.parse(localStorage.getItem("mobiUsers") || "[]")
  return users.find((u: User) => u.id === userId) || null
}

// Função para simular embarque do usuário (para testes)
export function simulateUserBoarding(userId: string): boolean {
  const currentTrip = realTimeService.getCurrentTrip()
  if (!currentTrip) return false

  const user = getUserById(userId)
  if (!user) return false

  const passenger = currentTrip.passengers.find((p) => p.name === user.name)
  if (!passenger) return false

  realTimeService.boardPassenger(passenger.id)
  return true
}

// Função para simular desembarque do usuário (para testes)
export function simulateUserDropOff(userId: string): boolean {
  const currentTrip = realTimeService.getCurrentTrip()
  if (!currentTrip) return false

  const user = getUserById(userId)
  if (!user) return false

  const passenger = currentTrip.passengers.find((p) => p.name === user.name)
  if (!passenger) return false

  realTimeService.dropOffPassenger(passenger.id)
  return true
}

// Funções de viagem
export function saveTrip(trip: Trip): void {
  if (typeof window === "undefined") return
  const trips = getTrips()
  trips.unshift(trip)
  localStorage.setItem("mobiTrips", JSON.stringify(trips))
}

export function getTrips(): Trip[] {
  if (typeof window === "undefined") return []
  const trips = localStorage.getItem("mobiTrips")
  return trips ? JSON.parse(trips) : []
}

// Funções de pagamento
export function savePayment(payment: Payment): void {
  if (typeof window === "undefined") return
  const payments = getPayments()
  payments.unshift(payment)
  localStorage.setItem("mobiPayments", JSON.stringify(payments))
}

export function getPayments(): Payment[] {
  if (typeof window === "undefined") return []
  const payments = localStorage.getItem("mobiPayments")
  return payments ? JSON.parse(payments) : []
}

// Funções de créditos
export function getUserCredits(): UserCredits {
  if (typeof window === "undefined") return { total: 0, expiration: "" }
  const credits = localStorage.getItem("mobiCredits")
  return credits ? JSON.parse(credits) : { total: 50, expiration: "31/12/2024" }
}

export function spendCredits(amount: number): boolean {
  if (typeof window === "undefined") return false
  const credits = getUserCredits()
  if (credits.total >= amount) {
    credits.total -= amount
    localStorage.setItem("mobiCredits", JSON.stringify(credits))
    return true
  }
  return false
}
