"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bell, Shield, Smartphone } from "lucide-react"

interface DriverSettingsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  driver: any
  onUpdateDriver: (updates: any) => void
}

export function DriverSettingsModal({ open, onOpenChange, driver, onUpdateDriver }: DriverSettingsModalProps) {
  const [settings, setSettings] = useState({
    notifications: true,
    soundAlerts: true,
    autoAcceptRides: false,
    shareLocation: true,
    nightMode: false,
    language: "pt-BR",
    maxPassengers: driver?.vehicle?.capacity || 16,
  })

  const handleSave = () => {
    // Salvar configurações no localStorage
    localStorage.setItem(`driver_settings_${driver.id}`, JSON.stringify(settings))
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Configurações</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Notificações */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Notificações
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="notifications">Receber notificações</Label>
                <Switch
                  id="notifications"
                  checked={settings.notifications}
                  onCheckedChange={(checked) => setSettings({ ...settings, notifications: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="soundAlerts">Alertas sonoros</Label>
                <Switch
                  id="soundAlerts"
                  checked={settings.soundAlerts}
                  onCheckedChange={(checked) => setSettings({ ...settings, soundAlerts: checked })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Viagens */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Smartphone className="h-4 w-4" />
                Viagens
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="autoAccept">Aceitar automaticamente</Label>
                <Switch
                  id="autoAccept"
                  checked={settings.autoAcceptRides}
                  onCheckedChange={(checked) => setSettings({ ...settings, autoAcceptRides: checked })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxPassengers">Máximo de passageiros</Label>
                <Input
                  id="maxPassengers"
                  type="number"
                  min="1"
                  max={driver?.vehicle?.capacity || 16}
                  value={settings.maxPassengers}
                  onChange={(e) => setSettings({ ...settings, maxPassengers: Number.parseInt(e.target.value) })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Privacidade */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Privacidade
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="shareLocation">Compartilhar localização</Label>
                <Switch
                  id="shareLocation"
                  checked={settings.shareLocation}
                  onCheckedChange={(checked) => setSettings({ ...settings, shareLocation: checked })}
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
