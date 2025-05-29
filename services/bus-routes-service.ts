import { type StopPoint, getAllStopPoints } from "./stop-points-service"

// Interface para representar uma rota de ônibus
export interface BusRoute {
  id: string
  name: string
  description: string
  stops: StopPoint[]
  schedule: RouteSchedule[]
  color: string
}

// Interface para representar o horário de uma rota
export interface RouteSchedule {
  dayType: "weekday" | "saturday" | "sunday"
  departures: string[] // Horários de partida no formato "HH:MM"
}

// Rotas de ônibus pré-definidas
const busRoutes: BusRoute[] = [
  {
    id: "route1",
    name: "Linha 1 - Circular",
    description: "Rota circular que conecta os principais pontos da cidade",
    stops: [], // Será preenchido dinamicamente
    schedule: [
      {
        dayType: "weekday",
        departures: ["06:00", "06:30", "07:00", "07:30", "08:00", "08:30", "09:00", "17:00", "17:30", "18:00", "18:30"],
      },
      {
        dayType: "saturday",
        departures: ["07:00", "08:00", "09:00", "17:00", "18:00"],
      },
      {
        dayType: "sunday",
        departures: ["08:00", "10:00", "16:00", "18:00"],
      },
    ],
    color: "#3b82f6", // Azul
  },
  {
    id: "route2",
    name: "Linha 2 - Expressa",
    description: "Rota expressa com menos paradas para viagens mais rápidas",
    stops: [], // Será preenchido dinamicamente
    schedule: [
      {
        dayType: "weekday",
        departures: ["06:15", "06:45", "07:15", "07:45", "08:15", "17:15", "17:45", "18:15"],
      },
      {
        dayType: "saturday",
        departures: ["07:15", "08:15", "17:15", "18:15"],
      },
      {
        dayType: "sunday",
        departures: ["09:15", "17:15"],
      },
    ],
    color: "#10b981", // Verde
  },
]

// Inicializar as rotas com os pontos de parada
export function initializeRoutes(): void {
  const allStops = getAllStopPoints()

  // Atribuir todos os pontos de parada à Linha 1
  busRoutes[0].stops = [...allStops]

  // Atribuir apenas alguns pontos de parada à Linha 2 (rota expressa)
  if (allStops.length >= 2) {
    busRoutes[1].stops = [allStops[0], allStops[allStops.length - 1]]
  } else {
    busRoutes[1].stops = [...allStops]
  }
}

// Inicializar as rotas quando o módulo for carregado
if (typeof window !== "undefined") {
  initializeRoutes()
}

// Funções para acessar as rotas
export function getAllRoutes(): BusRoute[] {
  return busRoutes
}

export function getRouteById(id: string): BusRoute | undefined {
  return busRoutes.find((route) => route.id === id)
}

export function getRoutesForStop(stopId: string): BusRoute[] {
  return busRoutes.filter((route) => route.stops.some((stop) => stop.id === stopId))
}

// Função para obter o próximo horário de partida para uma rota
export function getNextDeparture(routeId: string): string | null {
  const route = getRouteById(routeId)
  if (!route) return null

  const now = new Date()
  const currentHour = now.getHours()
  const currentMinute = now.getMinutes()
  const currentTime = currentHour * 60 + currentMinute // Tempo atual em minutos desde meia-noite

  // Determinar o tipo de dia (dia de semana, sábado ou domingo)
  const dayOfWeek = now.getDay() // 0 = Domingo, 1-5 = Segunda a Sexta, 6 = Sábado
  const dayType = dayOfWeek === 0 ? "sunday" : dayOfWeek === 6 ? "saturday" : "weekday"

  // Obter o horário para o tipo de dia atual
  const schedule = route.schedule.find((s) => s.dayType === dayType)
  if (!schedule) return null

  // Converter horários de partida para minutos e encontrar o próximo
  const departureTimes = schedule.departures.map((time) => {
    const [hours, minutes] = time.split(":").map(Number)
    return hours * 60 + minutes
  })

  // Encontrar o próximo horário de partida
  const nextDepartureMinutes = departureTimes.find((time) => time > currentTime)
  if (nextDepartureMinutes === undefined) return null

  // Converter de volta para o formato HH:MM
  const nextHour = Math.floor(nextDepartureMinutes / 60)
  const nextMinute = nextDepartureMinutes % 60
  return `${nextHour.toString().padStart(2, "0")}:${nextMinute.toString().padStart(2, "0")}`
}

// Função para calcular o tempo estimado de chegada a um ponto de parada
export function getEstimatedArrivalTime(routeId: string, stopId: string): string | null {
  const route = getRouteById(routeId)
  if (!route) return null

  const stopIndex = route.stops.findIndex((stop) => stop.id === stopId)
  if (stopIndex === -1) return null

  const nextDeparture = getNextDeparture(routeId)
  if (!nextDeparture) return null

  // Calcular tempo estimado (assumindo 5 minutos entre cada parada)
  const [departureHour, departureMinute] = nextDeparture.split(":").map(Number)
  const departureTime = departureHour * 60 + departureMinute
  const estimatedArrivalTime = departureTime + stopIndex * 5

  // Converter de volta para o formato HH:MM
  const arrivalHour = Math.floor(estimatedArrivalTime / 60) % 24
  const arrivalMinute = estimatedArrivalTime % 60
  return `${arrivalHour.toString().padStart(2, "0")}:${arrivalMinute.toString().padStart(2, "0")}`
}
