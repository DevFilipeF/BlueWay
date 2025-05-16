"use client"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Clock, CreditCard, Star } from "lucide-react"
import { ProtectedRoute } from "@/components/protected-route"
import { getTrips, type Trip } from "@/services/user-service"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

export default function ViagensPage() {
  const [viagens, setViagens] = useState<Trip[]>([])

  useEffect(() => {
    // Carregar viagens do serviço
    const trips = getTrips()
    setViagens(trips)
  }, [])

  return (
    <ProtectedRoute>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 container py-6">
          <h1 className="text-2xl font-bold mb-6">Minhas Viagens</h1>

          {viagens.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-muted-foreground">Você ainda não realizou nenhuma viagem.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {viagens.map((viagem) => (
                <Card key={viagem.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg">
                        {viagem.date} - {viagem.time}
                      </CardTitle>
                      <CardDescription>
                        <Badge
                          variant={viagem.status === "Concluída" ? "outline" : "secondary"}
                          className={viagem.status === "Concluída" ? "text-green-600" : "text-blue-600"}
                        >
                          {viagem.status}
                        </Badge>
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <MapPin className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">De</p>
                          <p>{viagem.origin}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <MapPin className="h-5 w-5 text-destructive mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">Para</p>
                          <p>{viagem.destination}</p>
                        </div>
                      </div>

                      {viagem.driver && (
                        <div className="flex items-center gap-2 mt-3 pt-3 border-t">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {viagem.driver.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{viagem.driver.name}</p>
                            <div className="flex items-center">
                              <Star className="h-3 w-3 text-yellow-500 mr-1" />
                              <span className="text-xs">{viagem.driver.rating}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="pt-2">
                    <div className="w-full flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <p>Duração: {viagem.duration || "~25 min"}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <CreditCard className="h-4 w-4" />
                        <p>
                          {viagem.amount} • {viagem.paymentMethod}
                        </p>
                      </div>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  )
}
