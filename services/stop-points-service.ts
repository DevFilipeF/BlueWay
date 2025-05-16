// Tipos para pontos de parada e rotas
export interface StopPoint {
  id: string
  name: string
  address: string
  description: string
  location: [number, number]
  availableVans: number
  waitingTime: string
  routes: string[] // IDs das rotas que passam por este ponto
}

export interface VanRoute {
  id: string
  name: string
  description: string
  color: string
  path: [number, number][] // Coordenadas da rota
  stops: string[] // IDs dos pontos de parada nesta rota
  frequency: string // Frequência das vans (ex: "10-15 min")
  firstDeparture: string // Horário da primeira van
  lastDeparture: string // Horário da última van
}

// Dados simulados de pontos de parada em São Paulo - Apenas os 3 principais
const stopPoints: StopPoint[] = [
  {
    id: "moema",
    name: "Moema",
    address: "Av. Ibirapuera, 3103 - Moema",
    description: "Ponto próximo ao Parque Ibirapuera",
    location: [-23.5913, -46.6652],
    availableVans: 5,
    waitingTime: "5-10 min",
    routes: ["route1", "route3"],
  },
  {
    id: "interlagos",
    name: "Shopping Interlagos",
    address: "Av. Interlagos, 2255 - Interlagos",
    description: "Ponto na entrada principal do Shopping",
    location: [-23.6815, -46.675],
    availableVans: 3,
    waitingTime: "10-15 min",
    routes: ["route2", "route3"],
  },
  {
    id: "paulista",
    name: "Av. Paulista",
    address: "Av. Paulista, 1578 - Bela Vista",
    description: "Ponto próximo ao MASP",
    location: [-23.563, -46.6543],
    availableVans: 7,
    waitingTime: "3-8 min",
    routes: ["route1", "route2"],
  },
]

// Dados simulados de rotas em São Paulo - Atualizados para usar apenas os 3 pontos principais
const vanRoutes: VanRoute[] = [
  {
    id: "route1",
    name: "Linha 1 - Paulista-Moema",
    description: "Rota que conecta a Av. Paulista a Moema",
    color: "#e74c3c", // Vermelho
    path: generateRoutePath([-23.563, -46.6543], [-23.5913, -46.6652], 20),
    stops: ["paulista", "moema"],
    frequency: "10-15 min",
    firstDeparture: "05:00",
    lastDeparture: "23:00",
  },
  {
    id: "route2",
    name: "Linha 2 - Paulista-Interlagos",
    description: "Rota que conecta a Av. Paulista ao Shopping Interlagos",
    color: "#3498db", // Azul
    path: generateRoutePath([-23.563, -46.6543], [-23.6815, -46.675], 30),
    stops: ["paulista", "interlagos"],
    frequency: "15-20 min",
    firstDeparture: "05:30",
    lastDeparture: "22:30",
  },
  {
    id: "route3",
    name: "Linha 3 - Moema-Interlagos",
    description: "Rota que conecta Moema ao Shopping Interlagos",
    color: "#2ecc71", // Verde
    path: generateRoutePath([-23.5913, -46.6652], [-23.6815, -46.675], 25),
    stops: ["moema", "interlagos"],
    frequency: "12-18 min",
    firstDeparture: "06:00",
    lastDeparture: "22:00",
  },
]

// Função auxiliar para gerar caminhos de rota
function generateRoutePath(start: [number, number], end: [number, number], numPoints: number): [number, number][] {
  const path: [number, number][] = []

  // Adicionar ponto inicial
  path.push(start)

  // Calcular diferenças
  const latDiff = end[0] - start[0]
  const lngDiff = end[1] - start[1]

  // Gerar pontos intermediários com pequenas variações para simular ruas não retas
  for (let i = 1; i < numPoints; i++) {
    const ratio = i / numPoints

    // Adicionar pequena variação aleatória para simular ruas não retas
    const randomLat = (Math.random() - 0.5) * 0.002
    const randomLng = (Math.random() - 0.5) * 0.002

    const lat = start[0] + latDiff * ratio + randomLat
    const lng = start[1] + lngDiff * ratio + randomLng

    path.push([lat, lng])
  }

  // Adicionar ponto final
  path.push(end)

  return path
}

// Funções para acessar os dados
export function getAllStopPoints(): StopPoint[] {
  return stopPoints
}

export function getStopPointById(id: string): StopPoint | undefined {
  return stopPoints.find((point) => point.id === id)
}

export function getAllRoutes(): VanRoute[] {
  return vanRoutes
}

export function getRouteById(id: string): VanRoute | undefined {
  return vanRoutes.find((route) => route.id === id)
}

export function getStopPointsByRouteId(routeId: string): StopPoint[] {
  const route = getRouteById(routeId)
  if (!route) return []
  return route.stops.map((stopId) => getStopPointById(stopId)).filter((stop): stop is StopPoint => !!stop)
}

export function getRoutesByStopPointId(stopPointId: string): VanRoute[] {
  const stopPoint = getStopPointById(stopPointId)
  if (!stopPoint) return []
  return stopPoint.routes.map((routeId) => getRouteById(routeId)).filter((route): route is VanRoute => !!route)
}
