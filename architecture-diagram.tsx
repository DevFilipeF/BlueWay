"use client"

import { useEffect, useRef } from "react"

export default function ArchitectureDiagram() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current || typeof window === "undefined") return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Configurar canvas para alta resolução
    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)

    // Limpar canvas
    ctx.clearRect(0, 0, rect.width, rect.height)

    // Definir estilos
    const boxHeight = 40
    const boxWidth = 120
    const boxRadius = 6
    const margin = 20
    const arrowSize = 8

    // Cores
    const colors = {
      frontend: "#1D4ED8",
      backend: "#0369A1",
      database: "#0E7490",
      services: "#0F766E",
      arrows: "#64748B",
      text: "#1E293B",
      background: "#F8FAFC",
    }

    // Função para desenhar caixa
    const drawBox = (x: number, y: number, width: number, height: number, color: string, text: string) => {
      // Sombra
      ctx.shadowColor = "rgba(0, 0, 0, 0.1)"
      ctx.shadowBlur = 10
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 4

      // Caixa
      ctx.fillStyle = color
      ctx.beginPath()
      ctx.roundRect(x, y, width, height, boxRadius)
      ctx.fill()

      // Texto
      ctx.shadowColor = "transparent"
      ctx.fillStyle = "white"
      ctx.font = "12px Inter, system-ui, sans-serif"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText(text, x + width / 2, y + height / 2)
    }

    // Função para desenhar seta
    const drawArrow = (fromX: number, fromY: number, toX: number, toY: number) => {
      ctx.strokeStyle = colors.arrows
      ctx.lineWidth = 1.5

      // Linha
      ctx.beginPath()
      ctx.moveTo(fromX, fromY)
      ctx.lineTo(toX, toY)
      ctx.stroke()

      // Ponta da seta
      const angle = Math.atan2(toY - fromY, toX - fromX)
      ctx.beginPath()
      ctx.moveTo(toX, toY)
      ctx.lineTo(toX - arrowSize * Math.cos(angle - Math.PI / 6), toY - arrowSize * Math.sin(angle - Math.PI / 6))
      ctx.lineTo(toX - arrowSize * Math.cos(angle + Math.PI / 6), toY - arrowSize * Math.sin(angle + Math.PI / 6))
      ctx.closePath()
      ctx.fillStyle = colors.arrows
      ctx.fill()
    }

    // Desenhar camada de frontend
    const frontendY = 50
    drawBox(rect.width / 2 - boxWidth / 2, frontendY, boxWidth, boxHeight, colors.frontend, "Frontend (React)")

    // Desenhar camada de backend
    const backendY = frontendY + boxHeight + margin * 2
    drawBox(rect.width / 2 - boxWidth / 2, backendY, boxWidth, boxHeight, colors.backend, "Backend (Node.js)")

    // Desenhar banco de dados
    const dbY = backendY + boxHeight + margin * 2
    drawBox(rect.width / 2 - boxWidth / 2, dbY, boxWidth, boxHeight, colors.database, "PostgreSQL")

    // Desenhar serviços externos
    const servicesY = backendY
    const servicesX1 = rect.width / 2 - boxWidth / 2 - margin * 3 - boxWidth
    const servicesX2 = rect.width / 2 + boxWidth / 2 + margin * 3

    drawBox(servicesX1, servicesY, boxWidth, boxHeight, colors.services, "Maps API")
    drawBox(servicesX2, servicesY, boxWidth, boxHeight, colors.services, "WebSockets")

    // Desenhar setas
    // Frontend -> Backend
    drawArrow(rect.width / 2, frontendY + boxHeight, rect.width / 2, backendY)

    // Backend -> Frontend
    drawArrow(rect.width / 2 - 10, backendY, rect.width / 2 - 10, frontendY + boxHeight)

    // Backend -> Database
    drawArrow(rect.width / 2, backendY + boxHeight, rect.width / 2, dbY)

    // Database -> Backend
    drawArrow(rect.width / 2 - 10, dbY, rect.width / 2 - 10, backendY + boxHeight)

    // Backend -> Maps API
    drawArrow(rect.width / 2 - boxWidth / 2, backendY + boxHeight / 2, servicesX1 + boxWidth, servicesY + boxHeight / 2)

    // Maps API -> Backend
    drawArrow(
      servicesX1 + boxWidth,
      servicesY + boxHeight / 2 + 10,
      rect.width / 2 - boxWidth / 2,
      backendY + boxHeight / 2 + 10,
    )

    // Backend -> WebSockets
    drawArrow(rect.width / 2 + boxWidth / 2, backendY + boxHeight / 2, servicesX2, servicesY + boxHeight / 2)

    // WebSockets -> Frontend
    drawArrow(servicesX2 + boxWidth / 2, servicesY, rect.width / 2 + boxWidth / 4, frontendY + boxHeight)

    // Adicionar legendas
    ctx.fillStyle = colors.text
    ctx.font = "14px Inter, system-ui, sans-serif"
    ctx.textAlign = "center"
    ctx.fillText("Arquitetura MobiComunidade", rect.width / 2, 20)

    ctx.font = "10px Inter, system-ui, sans-serif"
    ctx.textAlign = "left"
    ctx.fillText("Comunicação em tempo real", servicesX2, servicesY - 15)
    ctx.fillText("Geolocalização e rotas", servicesX1, servicesY - 15)
  }, [])

  return (
    <div className="w-full bg-slate-50 p-4 rounded-lg shadow-sm">
      <canvas ref={canvasRef} className="w-full h-[300px]" style={{ width: "100%", height: "300px" }} />
    </div>
  )
}
