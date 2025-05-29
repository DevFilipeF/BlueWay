"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { User, Car } from "lucide-react"

interface DriverProfileModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  driver: any
  onUpdateDriver: (updates: any) => void
}

export function DriverProfileModal({ open, onOpenChange, driver, onUpdateDriver }: DriverProfileModalProps) {
  const [formData, setFormData] = useState({
    name: driver?.name || "",
    phone: driver?.phone || "",
    email: driver?.email || "",
    license: driver?.license || "",
    vehicleModel: driver?.vehicle?.model || "",
    vehicleColor: driver?.vehicle?.color || "",
    vehiclePlate: driver?.vehicle?.plate || "",
    vehicleCapacity: driver?.vehicle?.capacity || 16,
  })

  const handleSave = () => {
    const updatedDriver = {
      ...driver,
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      license: formData.license,
      vehicle: {
        ...driver.vehicle,
        model: formData.vehicleModel,
        color: formData.vehicleColor,
        plate: formData.vehiclePlate,
        capacity: formData.vehicleCapacity,
      },
    }

    onUpdateDriver(updatedDriver)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Perfil</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Avatar e Info Básica */}
          <div className="text-center">
            <Avatar className="h-20 w-20 mx-auto mb-4">
              <AvatarFallback className="bg-blue-600 text-white text-xl">
                {formData.name
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("")
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <Button variant="outline" size="sm">
              Alterar Foto
            </Button>
          </div>

          {/* Dados Pessoais */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <User className="h-4 w-4" />
                Dados Pessoais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome completo</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="license">CNH</Label>
                <Input
                  id="license"
                  value={formData.license}
                  onChange={(e) => setFormData({ ...formData, license: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Dados do Veículo */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Car className="h-4 w-4" />
                Veículo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="vehicleModel">Modelo</Label>
                <Input
                  id="vehicleModel"
                  value={formData.vehicleModel}
                  onChange={(e) => setFormData({ ...formData, vehicleModel: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vehicleColor">Cor</Label>
                <Input
                  id="vehicleColor"
                  value={formData.vehicleColor}
                  onChange={(e) => setFormData({ ...formData, vehicleColor: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vehiclePlate">Placa</Label>
                <Input
                  id="vehiclePlate"
                  value={formData.vehiclePlate}
                  onChange={(e) => setFormData({ ...formData, vehiclePlate: e.target.value.toUpperCase() })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vehicleCapacity">Capacidade</Label>
                <Input
                  id="vehicleCapacity"
                  type="number"
                  min="1"
                  max="50"
                  value={formData.vehicleCapacity}
                  onChange={(e) => setFormData({ ...formData, vehicleCapacity: Number.parseInt(e.target.value) })}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancelar
            </Button>
            <Button onClick={handleSave} className="flex-1">
              Salvar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
