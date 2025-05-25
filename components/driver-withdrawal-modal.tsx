"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Smartphone, Building, CheckCircle, Copy } from "lucide-react"

interface DriverWithdrawalModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentEarnings: number
  driverId: string
  onWithdrawalComplete: (amount: number, method: string, details: any) => void
}

export function DriverWithdrawalModal({
  open,
  onOpenChange,
  currentEarnings,
  driverId,
  onWithdrawalComplete,
}: DriverWithdrawalModalProps) {
  const [withdrawalMethod, setWithdrawalMethod] = useState("pix")
  const [amount, setAmount] = useState(currentEarnings.toString())
  const [pixKey, setPixKey] = useState("")
  const [bankData, setBankData] = useState({
    bank: "",
    agency: "",
    account: "",
    accountType: "corrente",
    cpf: "",
  })
  const [isProcessing, setIsProcessing] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [transactionId, setTransactionId] = useState("")

  const handleWithdraw = async () => {
    setIsProcessing(true)

    // Simular processamento
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const withdrawalAmount = Number.parseFloat(amount)
    const newTransactionId = `TXN${Date.now()}`
    setTransactionId(newTransactionId)

    const withdrawalDetails = {
      transactionId: newTransactionId,
      method: withdrawalMethod,
      amount: withdrawalAmount,
      date: new Date().toLocaleDateString("pt-BR"),
      time: new Date().toLocaleTimeString("pt-BR"),
      status: "completed",
      ...(withdrawalMethod === "pix"
        ? { pixKey }
        : {
            bank: bankData.bank,
            agency: bankData.agency,
            account: bankData.account,
            accountType: bankData.accountType,
          }),
    }

    // Salvar no histórico de transações
    const transactions = JSON.parse(localStorage.getItem(`driver_transactions_${driverId}`) || "[]")
    transactions.unshift({
      id: newTransactionId,
      type: "withdrawal",
      amount: withdrawalAmount,
      method: withdrawalMethod,
      details: withdrawalDetails,
      date: new Date().toLocaleDateString("pt-BR"),
      time: new Date().toLocaleTimeString("pt-BR"),
      status: "completed",
    })
    localStorage.setItem(`driver_transactions_${driverId}`, JSON.stringify(transactions))

    setIsProcessing(false)
    setShowSuccess(true)

    // Chamar callback para atualizar os ganhos
    onWithdrawalComplete(withdrawalAmount, withdrawalMethod, withdrawalDetails)

    // Fechar modal após 3 segundos
    setTimeout(() => {
      setShowSuccess(false)
      onOpenChange(false)
      // Reset form
      setAmount("0")
      setPixKey("")
      setBankData({
        bank: "",
        agency: "",
        account: "",
        accountType: "corrente",
        cpf: "",
      })
    }, 3000)
  }

  const copyTransactionId = () => {
    navigator.clipboard.writeText(transactionId)
  }

  if (showSuccess) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <div className="text-center py-6">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-green-600 mb-2">Saque Realizado!</h2>
            <p className="text-muted-foreground mb-4">
              Seu saque de R$ {Number.parseFloat(amount).toFixed(2)} foi processado com sucesso.
            </p>
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">ID da Transação:</span>
                <div className="flex items-center gap-2">
                  <code className="text-sm bg-white px-2 py-1 rounded">{transactionId}</code>
                  <Button variant="outline" size="sm" onClick={copyTransactionId}>
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">O valor será creditado em sua conta em até 2 horas úteis.</p>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Sacar Ganhos</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Saldo Disponível */}
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-sm text-muted-foreground">Saldo Disponível</div>
              <div className="text-3xl font-bold text-green-600">R$ {currentEarnings.toFixed(2)}</div>
            </CardContent>
          </Card>

          {/* Valor do Saque */}
          <div className="space-y-2">
            <Label htmlFor="amount">Valor do Saque</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              max={currentEarnings}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0,00"
            />
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setAmount((currentEarnings * 0.5).toFixed(2))}>
                50%
              </Button>
              <Button variant="outline" size="sm" onClick={() => setAmount(currentEarnings.toFixed(2))}>
                Tudo
              </Button>
            </div>
          </div>

          {/* Método de Saque */}
          <Tabs value={withdrawalMethod} onValueChange={setWithdrawalMethod}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="pix" className="gap-2">
                <Smartphone className="h-4 w-4" />
                PIX
              </TabsTrigger>
              <TabsTrigger value="bank" className="gap-2">
                <Building className="h-4 w-4" />
                Conta Bancária
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pix" className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Smartphone className="h-4 w-4" />
                    Dados PIX
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="pixKey">Chave PIX</Label>
                    <Input
                      id="pixKey"
                      value={pixKey}
                      onChange={(e) => setPixKey(e.target.value)}
                      placeholder="CPF, e-mail, telefone ou chave aleatória"
                    />
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p>• Transferência instantânea</p>
                    <p>• Disponível 24h por dia</p>
                    <p>• Sem taxas adicionais</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="bank" className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    Dados Bancários
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="bank">Banco</Label>
                      <Input
                        id="bank"
                        value={bankData.bank}
                        onChange={(e) => setBankData({ ...bankData, bank: e.target.value })}
                        placeholder="Ex: 001 - Banco do Brasil"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="agency">Agência</Label>
                      <Input
                        id="agency"
                        value={bankData.agency}
                        onChange={(e) => setBankData({ ...bankData, agency: e.target.value })}
                        placeholder="0000"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="account">Conta</Label>
                      <Input
                        id="account"
                        value={bankData.account}
                        onChange={(e) => setBankData({ ...bankData, account: e.target.value })}
                        placeholder="00000-0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="accountType">Tipo</Label>
                      <select
                        id="accountType"
                        value={bankData.accountType}
                        onChange={(e) => setBankData({ ...bankData, accountType: e.target.value })}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                      >
                        <option value="corrente">Corrente</option>
                        <option value="poupanca">Poupança</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cpf">CPF do Titular</Label>
                    <Input
                      id="cpf"
                      value={bankData.cpf}
                      onChange={(e) => setBankData({ ...bankData, cpf: e.target.value })}
                      placeholder="000.000.000-00"
                    />
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p>• Processamento em até 2 horas úteis</p>
                    <p>• Disponível apenas em dias úteis</p>
                    <p>• Sem taxas adicionais</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancelar
            </Button>
            <Button
              onClick={handleWithdraw}
              disabled={
                isProcessing ||
                Number.parseFloat(amount) <= 0 ||
                Number.parseFloat(amount) > currentEarnings ||
                (withdrawalMethod === "pix" && !pixKey) ||
                (withdrawalMethod === "bank" && (!bankData.bank || !bankData.agency || !bankData.account))
              }
              className="flex-1"
            >
              {isProcessing ? "Processando..." : `Sacar R$ ${Number.parseFloat(amount || "0").toFixed(2)}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
