export interface PassengerRequest {
    id: string
    passengerId: string
    passengerName: string
    passengerPhone: string
    origin: string
    destination: string
    originCoords: [number, number]
    destinationCoords: [number, number]
    requestTime: string
    status: "pending" | "accepted" | "picked_up" | "in_transit" | "completed" | "cancelled"
    paymentMethod: string
    amount: string
    routeId: string
    routeName: string
    estimatedTime: string
    currentStop?: string
    hasBoarded: boolean
    hasPaid: boolean
    driverId?: string
  }
  
  export interface TripSummary {
    id: string
    date: string
    totalPassengers: number
    totalEarnings: string
    completedTrips: number
    cancelledTrips: number
    route: string
    startTime: string
    endTime: string
  }
  
  export function getPassengerRequests(): PassengerRequest[] {
    if (typeof window === "undefined") return []
  
    const requests = localStorage.getItem("blueWayPassengerRequests")
    return requests ? JSON.parse(requests) : []
  }
  
  export function updatePassengerRequest(requestId: string, updates: Partial<PassengerRequest>): void {
    const requests = getPassengerRequests()
    const updatedRequests = requests.map((request) => (request.id === requestId ? { ...request, ...updates } : request))
    localStorage.setItem("blueWayPassengerRequests", JSON.stringify(updatedRequests))
  }
  
  export function acceptPassengerRequest(requestId: string, driverId: string): void {
    updatePassengerRequest(requestId, {
      status: "accepted",
      driverId,
    })
  }
  
  export function markPassengerAsBoarded(requestId: string): void {
    updatePassengerRequest(requestId, {
      status: "picked_up",
      hasBoarded: true,
    })
  }
  
  export function markPassengerAsDropped(requestId: string): void {
    updatePassengerRequest(requestId, {
      status: "completed",
    })
  }
  
  export function confirmPayment(requestId: string): void {
    updatePassengerRequest(requestId, {
      hasPaid: true,
    })
  }
  
  export function getDriverTripSummary(driverId: string): TripSummary[] {
    if (typeof window === "undefined") return []
  
    const summaries = localStorage.getItem(`blueWayDriverSummary_${driverId}`)
    return summaries ? JSON.parse(summaries) : []
  }
  
  export function saveTripSummary(driverId: string, summary: TripSummary): void {
    const summaries = getDriverTripSummary(driverId)
    summaries.unshift(summary)
    localStorage.setItem(`blueWayDriverSummary_${driverId}`, JSON.stringify(summaries))
  }
  
  // Simular algumas requisições de exemplo
  export function initializeMockRequests(): void {
    if (typeof window === "undefined") return
  
    const existingRequests = localStorage.getItem("blueWayPassengerRequests")
    if (!existingRequests) {
      const mockRequests: PassengerRequest[] = [
        {
          id: "req_001",
          passengerId: "user_001",
          passengerName: "Maria Silva",
          passengerPhone: "(11) 99999-1111",
          origin: "Terminal Rodoviário",
          destination: "Shopping Center",
          originCoords: [-23.5505, -46.6333],
          destinationCoords: [-23.5489, -46.6388],
          requestTime: new Date().toLocaleTimeString("pt-BR"),
          status: "pending",
          paymentMethod: "PIX",
          amount: "R$ 8,50",
          routeId: "route_001",
          routeName: "Linha Centro-Shopping",
          estimatedTime: "25 min",
          hasBoarded: false,
          hasPaid: true,
        },
        {
          id: "req_002",
          passengerId: "user_002",
          passengerName: "João Santos",
          passengerPhone: "(11) 99999-2222",
          origin: "Praça Central",
          destination: "Hospital Municipal",
          originCoords: [-23.5515, -46.6344],
          destinationCoords: [-23.5478, -46.6401],
          requestTime: new Date(Date.now() - 300000).toLocaleTimeString("pt-BR"),
          status: "pending",
          paymentMethod: "Crédito Social",
          amount: "7 créditos",
          routeId: "route_002",
          routeName: "Linha Saúde",
          estimatedTime: "20 min",
          hasBoarded: false,
          hasPaid: true,
        },
      ]
  
      localStorage.setItem("blueWayPassengerRequests", JSON.stringify(mockRequests))
    }
  }
  