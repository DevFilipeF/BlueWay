"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Car, Clock, Star, MapPin, Phone, MessageCircle, Navigation, CheckCircle, AlertCircle } from "lucide-react"
import { getCurrentUserTrip, getUser, simulateUserBoarding, simulateUserDropOff } from "@/services/user-service"
import type { LiveTripInfo, User } from "@/services/user-service"

export function LiveTripStatus() {
  const [tripInfo, setTripInfo] = useState<LiveTripInfo | null>(null)
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const currentUser = getUser()
    setUser(currentUser)

    if (!currentUser) return

    // Atualizar status da viagem a cada 2 segundos
    const interval = setInterval(() => {
      const trip = getCurrentUserTrip(currentUser.id)
      setTripInfo(trip)
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "waiting":
        return {
          text: "Aguardando Embarque",
          color: "bg-yellow-100 text-yellow-800",
          icon: Clock,
          progress: 25,
        }
      case "boarded":
        return {
          text: "Em Viagem",
          color: "bg-blue-100 text-blue-800",
          icon: Navigation,
          progress: 75,
        }
      case "dropped_off":
        return {
          text: "Viagem Concluída",
          color: "bg-green-100 text-green-800",
          icon: CheckCircle,
          progress: 100,
        }
      default:
        return {
          text: "Status Desconhecido",
          color: "bg-gray-100 text-gray-800",
          icon: AlertCircle,
          progress: 0,
        }
    }
  }

  const handleTestBoarding = () => {
    if (user) {
      simulateUserBoarding(user.id)
    }
  }

  const handleTestDropOff = () => {
    if (user) {
      simulateUserDropOff(user.id)
    }
  }

  if (!tripInfo) {
    return null
  }

  const statusInfo = getStatusInfo(tripInfo.status)
  const StatusIcon = statusInfo.icon

  return (
    <Card className="mb-4 border-blue-200 bg-blue-50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Car className="h-5 w-5 text-blue-600" />
          Sua Viagem
          <Badge className={statusInfo.color}>{statusInfo.text}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progresso da viagem</span>
            <span>{statusInfo.progress}%</span>
          </div>
          <Progress value={statusInfo.progress} className="h-2" />
        </div>

        {/* Driver Info */}
        <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
          <Avatar className="h-12 w-12">
            <AvatarFallback className="bg-blue-600 text-white">
              {tripInfo.driver.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h3 className="font-medium">{tripInfo.driver.name}</h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Star className="h-3 w-3 text-yellow-500 fill-current" />
              <span>{tripInfo.driver.rating}</span>
              <span>•</span>
              <span>{tripInfo.driver.vehicle.model}</span>
              <span>•</span>
              <span className="font-mono">{tripInfo.driver.vehicle.plate}</span>
            </div>
            <div className="flex items-center gap-1 text-sm text-blue-600">
              <MapPin className="h-3 w-3" />
              <span>{tripInfo.route}</span>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <Button variant="outline" size="sm" className="gap-1">
              <Phone className="h-3 w-3" />
              Ligar
            </Button>
            <Button variant="outline" size="sm" className="gap-1">
              <MessageCircle className="h-3 w-3" />
              Chat
            </Button>
          </div>
        </div>

        {/* Status Details */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-white rounded-lg border text-center">
            <StatusIcon className="h-6 w-6 mx-auto mb-1 text-blue-600" />
            <p className="text-sm font-medium">{statusInfo.text}</p>
          </div>
          <div className="p-3 bg-white rounded-lg border text-center">
            <Clock className="h-6 w-6 mx-auto mb-1 text-green-600" />
            <p className="text-sm font-medium">{tripInfo.estimatedArrival || "~15 min"}</p>
          </div>
        </div>

        {/* Test Buttons (apenas para demonstração) */}
        {process.env.NODE_ENV === "development" && (
          <div className="flex gap-2 pt-2 border-t">
            <Button variant="outline" size="sm" onClick={handleTestBoarding} disabled={tripInfo.status !== "waiting"}>
              Simular Embarque
            </Button>
            <Button variant="outline" size="sm" onClick={handleTestDropOff} disabled={tripInfo.status !== "boarded"}>
              Simular Desembarque
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
