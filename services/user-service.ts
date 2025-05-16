// Tipos
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

// Funções para gerenciar o histórico de viagens
export function saveTrip(trip: Trip): void {
  // Obter viagens existentes
  const trips = getTrips()

  // Adicionar nova viagem
  trips.unshift(trip)

  // Salvar no localStorage
  localStorage.setItem("mobiTrips", JSON.stringify(trips))
}

export function getTrips(): Trip[] {
  const tripsJson = localStorage.getItem("mobiTrips")
  return tripsJson ? JSON.parse(tripsJson) : []
}

// Funções para gerenciar o histórico de pagamentos
export function savePayment(payment: Payment): void {
  // Obter pagamentos existentes
  const payments = getPayments()

  // Adicionar novo pagamento
  payments.unshift(payment)

  // Salvar no localStorage
  localStorage.setItem("mobiPayments", JSON.stringify(payments))
}

export function getPayments(): Payment[] {
  const paymentsJson = localStorage.getItem("mobiPayments")
  return paymentsJson ? JSON.parse(paymentsJson) : []
}

// Funções para gerenciar créditos
export function getUserCredits(): UserCredits {
  const creditsJson = localStorage.getItem("mobiCredits")
  if (creditsJson) {
    return JSON.parse(creditsJson)
  }

  // Valor padrão se não existir
  const defaultCredits = {
    total: 120,
    expiration: "31/12/2025",
  }

  localStorage.setItem("mobiCredits", JSON.stringify(defaultCredits))
  return defaultCredits
}

export function updateUserCredits(amount: number): UserCredits {
  const credits = getUserCredits()
  credits.total += amount

  localStorage.setItem("mobiCredits", JSON.stringify(credits))
  return credits
}

export function spendCredits(amount: number): boolean {
  const credits = getUserCredits()

  if (credits.total < amount) {
    return false // Créditos insuficientes
  }

  credits.total -= amount
  localStorage.setItem("mobiCredits", JSON.stringify(credits))
  return true
}
