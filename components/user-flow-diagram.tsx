"use client"

import { useEffect, useRef } from "react"

export default function UserFlowDiagram() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return

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
    const margin = 30
    const arrowSize = 8

    // Cores
    const colors = {
      start: "#1D4ED8",
      process: "#0369A1",
      decision: "#0E7490",
      end: "#0F766E",
      arrows: "#64748B",
      text: "#1E293B",
      background: "#F8FAFC",
    }

    // Função para desenhar caixa
    const drawBox = (
      x: number,
      y: number,
      width: number,
      height: number,
      color: string,
      text: string,
      shape: "rect" | "diamond" | "rounded" = "rounded",
    ) => {
      // Sombra
      ctx.shadowColor = "rgba(0, 0, 0, 0.1)"
      ctx.shadowBlur = 10
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 4

      // Caixa
      ctx.fillStyle = color
      ctx.beginPath()

      if (shape === "diamond") {
        ctx.moveTo(x + width / 2, y)
        ctx.lineTo(x + width, y + height / 2)
        ctx.lineTo(x + width / 2, y + height)
        ctx.lineTo(x, y + height / 2)
        ctx.closePath()
      } else if (shape === "rounded") {
        ctx.roundRect(x, y, width, height, boxRadius)
      } else {
        ctx.rect(x, y, width, height)
      }

      ctx.fill()

      // Texto
      ctx.shadowColor = "transparent"
      ctx.fillStyle = "white"
      ctx.font = "12px Inter, system-ui, sans-serif"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"

      // Quebrar texto em múltiplas linhas se necessário
      const words = text.split(" ")
      let line = ""
      const lineHeight = 14
      let yPos = y + height / 2 - (words.length > 3 ? lineHeight : 0)

      for (let i = 0; i < words.length; i++) {
        const testLine = line + words[i] + " "
        const metrics = ctx.measureText(testLine)

        if (metrics.width > width - 10 && i > 0) {
          ctx.fillText(line, x + width / 2, yPos)
          line = words[i] + " "
          yPos += lineHeight
        } else {
          line = testLine
        }
      }
      ctx.fillText(line, x + width / 2, yPos)
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

    // Desenhar fluxo do usuário
    const startX = 50
    const startY = 50

    // Login/Registro
    drawBox(startX, startY, boxWidth, boxHeight, colors.start, "Login / Registro")

    // Tela inicial com mapa
    const mapY = startY + boxHeight + margin
    drawBox(startX, mapY, boxWidth, boxHeight, colors.process, "Tela do Mapa")

    // Solicitar van
    const requestY = mapY + boxHeight + margin
    drawBox(startX, requestY, boxWidth, boxHeight, colors.process, "Solicitar Van")

    // Confirmar destino
    const confirmY = requestY + boxHeight + margin
    drawBox(startX, confirmY, boxWidth, boxHeight, colors.process, "Confirmar Destino")

    // Decisão de pagamento
    const paymentX = startX + boxWidth + margin
    const paymentY = confirmY
    drawBox(paymentX, paymentY, boxWidth, boxHeight, colors.decision, "Escolher Pagamento", "diamond")

    // Aguardar van
    const waitY = confirmY + boxHeight + margin
    drawBox(startX, waitY, boxWidth, boxHeight, colors.process, "Aguardar Van")

    // Acompanhar trajeto
    const trackY = waitY + boxHeight + margin
    drawBox(startX, trackY, boxWidth, boxHeight, colors.process, "Acompanhar Trajeto")

    // Finalizar viagem
    const finishY = trackY + boxHeight + margin
    drawBox(startX, finishY, boxWidth, boxHeight, colors.end, "Finalizar Viagem")

    // Desenhar setas
    drawArrow(startX + boxWidth / 2, startY + boxHeight, startX + boxWidth / 2, mapY)
    drawArrow(startX + boxWidth / 2, mapY + boxHeight, startX + boxWidth / 2, requestY)
    drawArrow(startX + boxWidth / 2, requestY + boxHeight, startX + boxWidth / 2, confirmY)
    drawArrow(startX + boxWidth, confirmY + boxHeight / 2, paymentX, paymentY + boxHeight / 2)
    drawArrow(paymentX + boxWidth / 2, paymentY + boxHeight, startX + boxWidth / 2, waitY)
    drawArrow(startX + boxWidth / 2, waitY + boxHeight, startX + boxWidth / 2, trackY)
    drawArrow(startX + boxWidth / 2, trackY + boxHeight, startX + boxWidth / 2, finishY)

    // Adicionar legendas
    ctx.fillStyle = colors.text
    ctx.font = "14px Inter, system-ui, sans-serif"
    ctx.textAlign = "center"
    ctx.fillText("Fluxo do Usuário - MobiComunidade", rect.width / 2, 20)
  }, [])

  return (
    <div className="w-full bg-slate-50 p-4 rounded-lg shadow-sm">
      <canvas ref={canvasRef} className="w-full h-[400px]" style={{ width: "100%", height: "400px" }} />
    </div>
  )
}
