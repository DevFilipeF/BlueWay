"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Clock, Users, DollarSign } from "lucide-react"

interface Trip {
  date: string
  time: string
  route: string
  passengers: number
  earnings: number
  duration: string
}

interface Earning {
  amount: number
  description: string
  date: string
  time: string
}

interface DriverHistoryModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  driverId: string
}

export function DriverHistoryModal({ open, onOpenChange, driverId }: DriverHistoryModalProps) {
  const [tripHistory, setTripHistory] = useState<Trip[]>([])
  const [earnings, setEarnings] = useState<Earning[]>([])

  useEffect(() => {
    if (open && driverId) {
      // Carregar histórico de viagens
      const trips = JSON.parse(localStorage.getItem(`driver_trips_${driverId}`) || "[]")
      setTripHistory(trips)

      // Carregar histórico de ganhos
      const earningsData = JSON.parse(localStorage.getItem(`driver_earnings_${driverId}`) || "[]")
      setEarnings(earningsData)
    }
  }, [open, driverId])

  const totalEarnings = earnings.reduce((sum, earning) => sum + earning.amount, 0)
  const totalTrips = tripHistory.length

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Histórico</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="trips" className="flex-1 overflow-hidden">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="trips">Viagens</TabsTrigger>
            <TabsTrigger value="earnings">Ganhos</TabsTrigger>
          </TabsList>

          <TabsContent value="trips" className="overflow-y-auto max-h-[60vh] space-y-3">
            {/* Resumo */}
            <div className="grid grid-cols-2 gap-3">
              <Card>
                <CardContent className="p-3 text-center">
                  <div className="text-2xl font-bold">{totalTrips}</div>
                  <div className="text-sm text-muted-foreground">Viagens</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3 text-center">
                  <div className="text-2xl font-bold">R$ {totalEarnings.toFixed(2)}</div>
                  <div className="text-sm text-muted-foreground">Total</div>
                </CardContent>
              </Card>
            </div>

            {/* Lista de viagens */}
            {tripHistory.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Nenhuma viagem realizada ainda</p>
              </div>
            ) : (
              tripHistory.map((trip, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{trip.date}</span>
                        <Clock className="h-4 w-4 text-muted-foreground ml-2" />
                        <span className="text-sm">{trip.time}</span>
                      </div>
                      <Badge variant="outline">{trip.route}</Badge>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-blue-600" />
                        <span>{trip.passengers} passageiros</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-green-600" />
                        <span>R$ {trip.earnings}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-orange-600" />
                        <span>{trip.duration}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="earnings" className="overflow-y-auto max-h-[60vh] space-y-3">
            {earnings.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <DollarSign className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Nenhum ganho registrado ainda</p>
              </div>
            ) : (
              earnings.map((earning, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">R$ {earning.amount.toFixed(2)}</div>
                        <div className="text-sm text-muted-foreground">{earning.description}</div>
                        <div className="text-xs text-muted-foreground">
                          {earning.date} às {earning.time}
                        </div>
                      </div>
                      <Badge variant="outline" className="text-green-600">
                        + R$ {earning.amount.toFixed(2)}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
