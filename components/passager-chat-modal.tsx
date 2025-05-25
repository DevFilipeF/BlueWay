"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Send, MessageCircle } from "lucide-react"

interface PassengerChatModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  passenger: any
}

export function PassengerChatModal({ open, onOpenChange, passenger }: PassengerChatModalProps) {
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "driver",
      text: "Oi! Tá tranquilo?",
      time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
    },
  ])

  const handleSendMessage = () => {
    if (!message.trim()) return

    const newMessage = {
      id: messages.length + 1,
      sender: "driver",
      text: message,
      time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
    }

    setMessages([...messages, newMessage])
    setMessage("")

    // Simular resposta do passageiro após 2 segundos
    setTimeout(() => {
      const responses = [
        "Tudo bem, obrigado!",
        "Sim, tudo tranquilo por aqui",
        "Estou chegando no ponto",
        "Pode ir devagar, sem pressa",
        "Valeu, motorista!",
      ]
      const randomResponse = responses[Math.floor(Math.random() * responses.length)]

      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          sender: "passenger",
          text: randomResponse,
          time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
        },
      ])
    }, 2000)
  }

  if (!passenger) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md h-[500px] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Chat com {passenger.name}
          </DialogTitle>
        </DialogHeader>

        {/* Área de mensagens */}
        <div className="flex-1 overflow-y-auto space-y-3 p-2">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === "driver" ? "justify-end" : "justify-start"}`}>
              <div className={`flex items-end gap-2 max-w-[80%] ${msg.sender === "driver" ? "flex-row-reverse" : ""}`}>
                <Avatar className="h-6 w-6">
                  <AvatarFallback
                    className={msg.sender === "driver" ? "bg-blue-600 text-white" : "bg-gray-600 text-white"}
                  >
                    {msg.sender === "driver" ? "M" : passenger.name[0]}
                  </AvatarFallback>
                </Avatar>
                <div
                  className={`rounded-lg px-3 py-2 ${
                    msg.sender === "driver" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-900"
                  }`}
                >
                  <p className="text-sm">{msg.text}</p>
                  <p className={`text-xs mt-1 ${msg.sender === "driver" ? "text-blue-100" : "text-gray-500"}`}>
                    {msg.time}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Input de mensagem */}
        <div className="flex gap-2 pt-2 border-t">
          <Input
            placeholder="Digite sua mensagem..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
          />
          <Button onClick={handleSendMessage} size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
