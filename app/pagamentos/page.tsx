"use client"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { CreditCard, Wallet, Clock, Plus, Download, Printer } from "lucide-react"
import { ProtectedRoute } from "@/components/protected-route"
import { getPayments, getUserCredits, type Payment, type UserCredits } from "@/services/user-service"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function PagamentosPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [credits, setCredits] = useState<UserCredits>({ total: 0, expiration: "" })
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const [receiptOpen, setReceiptOpen] = useState(false)

  useEffect(() => {
    // Carregar pagamentos e créditos
    const userPayments = getPayments()
    const userCredits = getUserCredits()

    setPayments(userPayments)
    setCredits(userCredits)
  }, [])

  const handleShowReceipt = (payment: Payment) => {
    setSelectedPayment(payment)
    setReceiptOpen(true)
  }

  const handlePrintReceipt = () => {
    window.print()
  }

  const handleDownloadReceipt = () => {
    // Simulação de download - em uma aplicação real, isso geraria um PDF
    alert("Recibo baixado com sucesso!")
    setReceiptOpen(false)
  }

  return (
    <ProtectedRoute>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 container py-6">
          <h1 className="text-2xl font-bold mb-6">Pagamentos</h1>

          <Tabs defaultValue="metodos" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="metodos">Métodos de Pagamento</TabsTrigger>
              <TabsTrigger value="historico">Histórico</TabsTrigger>
            </TabsList>

            <TabsContent value="metodos" className="space-y-4 mt-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-medium">Meus Métodos de Pagamento</h2>
                <Button variant="outline" size="sm" className="gap-1">
                  <Plus className="h-4 w-4" />
                  Adicionar
                </Button>
              </div>

              <Card>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Wallet className="h-5 w-5 text-primary" />
                      PIX
                    </CardTitle>
                    <CardDescription>
                      <span className="text-green-600 font-medium">Ativo</span>
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">Chave: ***@email.com</p>
                </CardContent>
                <CardFooter>
                  <Button variant="ghost" size="sm" className="ml-auto">
                    Editar
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-base flex items-center gap-2">
                      <CreditCard className="h-5 w-5 text-primary" />
                      Cartão de Crédito
                    </CardTitle>
                    <CardDescription>
                      <span className="text-green-600 font-medium">Ativo</span>
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">**** **** **** 5678</p>
                  <p className="text-sm text-muted-foreground">Validade: 12/27</p>
                </CardContent>
                <CardFooter>
                  <Button variant="ghost" size="sm" className="ml-auto">
                    Editar
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Clock className="h-5 w-5 text-primary" />
                      Crédito Social
                    </CardTitle>
                    <CardDescription>
                      <span className="text-green-600 font-medium">Ativo</span>
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">Saldo: {credits.total} créditos</p>
                  <p className="text-sm text-muted-foreground">Válido até: {credits.expiration}</p>
                </CardContent>
                <CardFooter>
                  <Button variant="ghost" size="sm" className="ml-auto">
                    Detalhes
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="historico" className="space-y-4 mt-4">
              <h2 className="text-lg font-medium">Histórico de Pagamentos</h2>

              {payments.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-muted-foreground">Você ainda não realizou nenhum pagamento.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {payments.map((payment) => (
                    <Card key={payment.id}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-base">
                            {payment.date} - {payment.time}
                          </CardTitle>
                          <CardDescription>
                            <span className="font-medium">{payment.amount}</span>
                          </CardDescription>
                        </div>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <p className="text-sm">{payment.description}</p>
                        <div className="flex items-center gap-1 mt-1">
                          {payment.paymentMethod === "PIX" ? (
                            <Wallet className="h-4 w-4" />
                          ) : payment.paymentMethod === "Cartão" ? (
                            <CreditCard className="h-4 w-4" />
                          ) : (
                            <Clock className="h-4 w-4" />
                          )}
                          <p className="text-sm text-muted-foreground">Pago com {payment.paymentMethod}</p>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="ml-auto"
                          onClick={() => handleShowReceipt(payment)}
                        >
                          Recibo
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* Modal de Recibo */}
          <Dialog open={receiptOpen} onOpenChange={setReceiptOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Recibo de Pagamento</DialogTitle>
                <DialogDescription>Detalhes do seu pagamento</DialogDescription>
              </DialogHeader>

              {selectedPayment && (
                <div className="space-y-4">
                  <div className="bg-gray-50 p-6 rounded-lg border">
                    <div className="text-center mb-4">
                      <h3 className="font-bold text-lg">MobiComunidade</h3>
                      <p className="text-sm text-muted-foreground">Recibo de Pagamento</p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Data:</span>
                        <span className="text-sm">
                          {selectedPayment.date} às {selectedPayment.time}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Valor:</span>
                        <span className="text-sm">{selectedPayment.amount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Método:</span>
                        <span className="text-sm">{selectedPayment.paymentMethod}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Descrição:</span>
                        <span className="text-sm">{selectedPayment.description}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Status:</span>
                        <span className="text-sm text-green-600">{selectedPayment.status}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">ID da Transação:</span>
                        <span className="text-sm">{selectedPayment.id}</span>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t text-center text-xs text-muted-foreground">
                      <p>Este recibo é válido como comprovante de pagamento.</p>
                      <p>MobiComunidade - CNPJ: 00.000.000/0001-00</p>
                    </div>
                  </div>
                </div>
              )}

              <DialogFooter className="flex justify-between">
                <Button variant="outline" size="sm" onClick={handlePrintReceipt} className="gap-2">
                  <Printer className="h-4 w-4" />
                  Imprimir
                </Button>
                <Button size="sm" onClick={handleDownloadReceipt} className="gap-2">
                  <Download className="h-4 w-4" />
                  Baixar PDF
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </ProtectedRoute>
  )
}
