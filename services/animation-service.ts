import { getAllStopPoints, type StopPoint } from "@/services/stop-points-service"

// Função para verificar se a van está próxima a um ponto de parada
export function isNearStopPoint(vanPosition: [number, number], threshold = 0.001): StopPoint | null {
  const stopPoints = getAllStopPoints()

  for (const point of stopPoints) {
    const distance = calculateDistance(vanPosition, point.location)
    if (distance < threshold) {
      return point
    }
  }

  return null
}

// Função para calcular a distância entre dois pontos (em graus)
export function calculateDistance(point1: [number, number], point2: [number, number]): number {
  const latDiff = point1[0] - point2[0]
  const lngDiff = point1[1] - point2[1]
  return Math.sqrt(latDiff * latDiff + lngDiff * lngDiff)
}

// Função para gerar uma rota de animação para a van
export function generateVanAnimation(
  start: [number, number],
  end: [number, number],
  numPoints = 20,
): [number, number][] {
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

// Função para calcular o tempo estimado de viagem com base na distância
export function calculateEstimatedTravelTime(route: [number, number][]): number {
  if (route.length < 2) return 0

  // Calcular a distância total em graus
  let totalDistance = 0
  for (let i = 1; i < route.length; i++) {
    const latDiff = route[i][0] - route[i - 1][0]
    const lngDiff = route[i][1] - route[i - 1][1]
    totalDistance += Math.sqrt(latDiff * latDiff + lngDiff * lngDiff)
  }

  // Converter para km (aproximadamente)
  const distanceInKm = totalDistance * 111.32

  // Assumir velocidade média de 30 km/h
  const timeInHours = distanceInKm / 30

  // Converter para minutos
  const timeInMinutes = Math.round(timeInHours * 60)

  // Garantir um tempo mínimo
  return Math.max(5, timeInMinutes)
}
