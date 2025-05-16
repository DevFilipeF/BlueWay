"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CreditCard, Wallet, Clock, Copy, Check } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface PaymentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  amount: string
  paymentMethod: string
}

export function PaymentModal({ open, onOpenChange, onConfirm, amount, paymentMethod }: PaymentModalProps) {
  const [copied, setCopied] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [cardNumber, setCardNumber] = useState("")
  const [cardName, setCardName] = useState("")
  const [cardExpiry, setCardExpiry] = useState("")
  const [cardCvc, setCardCvc] = useState("")

  const handleCopyPix = () => {
    navigator.clipboard.writeText(
      "00020126580014BR.GOV.BCB.PIX0136example@email.com5204000053039865802BR5913MobiComunidade6008Sao Paulo62070503***6304E2CA",
    )
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handlePayment = () => {
    setIsProcessing(true)

    // Simular processamento de pagamento
    setTimeout(() => {
      setIsProcessing(false)
      onConfirm()
    }, 2000)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Pagamento</DialogTitle>
          <DialogDescription>Escolha como deseja pagar sua viagem.</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue={paymentMethod} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pix" className="flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              <span>PIX</span>
            </TabsTrigger>
            <TabsTrigger value="card" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              <span>Cartão</span>
            </TabsTrigger>
            <TabsTrigger value="social" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>Crédito</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pix" className="space-y-4 mt-4">
            <div className="text-center">
              <p className="font-medium">Valor a pagar</p>
              <p className="text-2xl font-bold">{amount}</p>
            </div>

            <div className="flex justify-center">
              <Card className="w-full max-w-xs">
                <CardContent className="p-4 flex flex-col items-center">
                  {/* QR Code simulado */}
                  <div className="w-48 h-48 bg-white border border-gray-200 p-2 mb-4">
                    <div className="w-full h-full bg-[url('/placeholder.svg?height=180&width=180&text=QR+Code+PIX')] bg-center bg-no-repeat bg-contain"></div>
                  </div>

                  <div className="w-full">
                    <Button
                      variant="outline"
                      className="w-full flex items-center justify-center gap-2"
                      onClick={handleCopyPix}
                    >
                      {copied ? (
                        <>
                          <Check className="h-4 w-4" />
                          <span>Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4" />
                          <span>Copiar código PIX</span>
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <p className="text-sm text-center text-muted-foreground">
              Escaneie o QR code ou copie o código PIX para pagar
            </p>
          </TabsContent>

          <TabsContent value="card" className="space-y-4 mt-4">
            <div className="text-center mb-4">
              <p className="font-medium">Valor a pagar</p>
              <p className="text-2xl font-bold">{amount}</p>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="cardNumber">Número do cartão</Label>
                <Input
                  id="cardNumber"
                  placeholder="0000 0000 0000 0000"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="cardName">Nome no cartão</Label>
                <Input
                  id="cardName"
                  placeholder="Nome como está no cartão"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="cardExpiry">Validade</Label>
                  <Input
                    id="cardExpiry"
                    placeholder="MM/AA"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="cardCvc">CVC</Label>
                  <Input id="cardCvc" placeholder="000" value={cardCvc} onChange={(e) => setCardCvc(e.target.value)} />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="social" className="space-y-4 mt-4">
            <div className="text-center">
              <p className="font-medium">Valor a pagar</p>
              <p className="text-2xl font-bold">7 créditos</p>
              <p className="text-sm text-muted-foreground mt-1">Saldo atual: 120 créditos</p>
            </div>

            <div className="bg-muted p-4 rounded-md">
              <p className="text-sm">
                Você está utilizando seus créditos sociais para esta viagem. Estes créditos são fornecidos por programas
                sociais e atividades comunitárias.
              </p>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handlePayment} disabled={isProcessing}>
            {isProcessing ? "Processando..." : "Pagar e solicitar van"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
