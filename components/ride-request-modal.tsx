"use client"

import { DialogFooter } from "@/components/ui/dialog"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { MapPin, Navigation, Clock, CreditCard, Wallet, Search, X, Loader2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { searchAddress, type GeocodingResult, getAddressFromCoordinates } from "@/services/geocoding-service"
import { useDebounce } from "@/hooks/use-debounce"

interface RideRequestModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (details: {
    origin: string
    destination: string
    originCoords: [number, number]
    destinationCoords: [number, number]
    passengers: number
    paymentMethod: string
  }) => void
  userLocation: [number, number]
}

export function RideRequestModal({ open, onOpenChange, onConfirm, userLocation }: RideRequestModalProps) {
  // Estados para os campos do formulário
  const [origin, setOrigin] = useState("Minha localização atual")
  const [originQuery, setOriginQuery] = useState("")
  const [destination, setDestination] = useState("")
  const [destinationQuery, setDestinationQuery] = useState("")
  const [passengers, setPassengers] = useState("1")
  const [paymentMethod, setPaymentMethod] = useState("pix")

  // Estados para as coordenadas
  const [originCoords, setOriginCoords] = useState<[number, number]>(userLocation)
  const [destinationCoords, setDestinationCoords] = useState<[number, number] | null>(null)

  // Estados para controle de UI
  const [isLoading, setIsLoading] = useState(false)
  const [isSearchingOrigin, setIsSearchingOrigin] = useState(false)
  const [isSearchingDestination, setIsSearchingDestination] = useState(false)
  const [showOriginSuggestions, setShowOriginSuggestions] = useState(false)
  const [showDestinationSuggestions, setShowDestinationSuggestions] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)
  const [step, setStep] = useState(1) // 1: Origem/Destino, 2: Detalhes
  const [geocodingError, setGeocodingError] = useState(false)
  const [showCharLimit, setShowCharLimit] = useState(false)
  const [isAuthorized, setIsAuthorized] = useState(false)

  // Constantes para limites de caracteres
  const MAX_CHARS = 100

  // Estados para resultados de pesquisa
  const [originResults, setOriginResults] = useState<GeocodingResult[]>([])
  const [destinationResults, setDestinationResults] = useState<GeocodingResult[]>([])

  // Refs para os inputs
  const originInputRef = useRef<HTMLInputElement>(null)
  const destinationInputRef = useRef<HTMLInputElement>(null)

  // Debounce para as consultas
  const debouncedOriginQuery = useDebounce(originQuery, 500)
  const debouncedDestinationQuery = useDebounce(destinationQuery, 500)

  // Atualizar as coordenadas de origem quando a localização do usuário mudar
  useEffect(() => {
    setOriginCoords(userLocation)
  }, [userLocation])

  // Obter endereço da localização atual quando o modal abrir
  useEffect(() => {
    if (open && origin === "Minha localização atual") {
      const fetchCurrentAddress = async () => {
        try {
          const address = await getAddressFromCoordinates(userLocation[0], userLocation[1])
          if (address) {
            setOrigin(address)
            setOriginCoords(userLocation)
          } else {
            // Fallback se não conseguir obter o endereço
            setOrigin("Localização atual (aproximada)")
          }
        } catch (error) {
          console.log("Erro ao obter endereço atual:", error)
          setOrigin("Localização atual (aproximada)")
          setGeocodingError(true)
        }
      }

      fetchCurrentAddress()
    }
  }, [open, userLocation])

  // Buscar sugestões de origem quando a consulta mudar
  useEffect(() => {
    if (debouncedOriginQuery && debouncedOriginQuery.length >= 3) {
      const fetchOriginSuggestions = async () => {
        setIsSearchingOrigin(true)
        try {
          const results = await searchAddress(debouncedOriginQuery)
          setOriginResults(results)
          setGeocodingError(false)
        } catch (error) {
          console.log("Erro ao buscar sugestões de origem:", error)
          setOriginResults([])
          setGeocodingError(true)
        } finally {
          setIsSearchingOrigin(false)
        }
      }

      fetchOriginSuggestions()
    } else {
      setOriginResults([])
    }
  }, [debouncedOriginQuery])

  // Buscar sugestões de destino quando a consulta mudar
  useEffect(() => {
    if (debouncedDestinationQuery && debouncedDestinationQuery.length >= 3) {
      const fetchDestinationSuggestions = async () => {
        setIsSearchingDestination(true)
        try {
          const results = await searchAddress(debouncedDestinationQuery)
          setDestinationResults(results)
          setGeocodingError(false)

          // Simular verificação de autorização para o destino
          // Em uma aplicação real, isso seria verificado no backend
          const isDestinationAuthorized = Math.random() > 0.3 // 70% de chance de ser autorizado
          setIsAuthorized(isDestinationAuthorized)
        } catch (error) {
          console.log("Erro ao buscar sugestões de destino:", error)
          setDestinationResults([])
          setGeocodingError(true)
        } finally {
          setIsSearchingDestination(false)
        }
      }

      fetchDestinationSuggestions()
    } else {
      setDestinationResults([])
    }
  }, [debouncedDestinationQuery])

  // Resetar o estado quando o modal é aberto
  useEffect(() => {
    if (open) {
      setDestination("")
      setDestinationQuery("")
      setDestinationCoords(null)
      setValidationError(null)
      setStep(1)
      setGeocodingError(false)
      setShowCharLimit(false)
      setIsAuthorized(false)
    }
  }, [open])

  // Fechar sugestões quando clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      // Fechar sugestões de origem
      if (
        originInputRef.current &&
        !originInputRef.current.contains(event.target as Node) &&
        !(event.target as HTMLElement).closest(".origin-suggestions-container")
      ) {
        setShowOriginSuggestions(false)
      }

      // Fechar sugestões de destino
      if (
        destinationInputRef.current &&
        !destinationInputRef.current.contains(event.target as Node) &&
        !(event.target as HTMLElement).closest(".destination-suggestions-container")
      ) {
        setShowDestinationSuggestions(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Handlers para os inputs
  const handleOriginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value.length <= MAX_CHARS) {
      setOrigin(value)
      setOriginQuery(value)
      setShowOriginSuggestions(value.length > 0)
      setShowCharLimit(value.length > MAX_CHARS * 0.7) // Mostrar aviso quando atingir 70% do limite
    }
  }

  const handleDestinationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value.length <= MAX_CHARS) {
      setDestination(value)
      setDestinationQuery(value)
      setShowDestinationSuggestions(value.length > 0)
      setShowCharLimit(value.length > MAX_CHARS * 0.7) // Mostrar aviso quando atingir 70% do limite
    }
  }

  // Handlers para seleção de sugestões
  const handleSelectOriginSuggestion = (result: GeocodingResult) => {
    setOrigin(result.display_name)
    setOriginQuery(result.display_name)
    setOriginCoords([Number.parseFloat(result.lat), Number.parseFloat(result.lon)])
    setShowOriginSuggestions(false)
    setShowCharLimit(false)
  }

  const handleSelectDestinationSuggestion = (result: GeocodingResult) => {
    setDestination(result.display_name)
    setDestinationQuery(result.display_name)
    setDestinationCoords([Number.parseFloat(result.lat), Number.parseFloat(result.lon)])
    setShowDestinationSuggestions(false)
    setShowCharLimit(false)

    // Simular verificação de autorização para o destino
    // Em uma aplicação real, isso seria verificado no backend
    const isDestinationAuthorized = Math.random() > 0.3 // 70% de chance de ser autorizado
    setIsAuthorized(isDestinationAuthorized)
  }

  // Handlers para limpar inputs
  const handleClearOrigin = () => {
    setOrigin("")
    setOriginQuery("")
    setShowOriginSuggestions(false)
    setShowCharLimit(false)
    if (originInputRef.current) {
      originInputRef.current.focus()
    }
  }

  const handleClearDestination = () => {
    setDestination("")
    setDestinationQuery("")
    setShowDestinationSuggestions(false)
    setShowCharLimit(false)
    setIsAuthorized(false)
    if (destinationInputRef.current) {
      destinationInputRef.current.focus()
    }
  }

  // Handler para avançar para o próximo passo
  const handleNextStep = () => {
    if (!destination || destination.trim() === "") {
      setValidationError("Por favor, informe o seu destino")
      return
    }

    // Se não temos coordenadas de destino, mas temos um destino digitado,
    // vamos gerar coordenadas simuladas para permitir que o fluxo continue
    if (!destinationCoords && destination) {
      // Gerar coordenadas simuladas próximas à localização do usuário
      const lat = userLocation[0] + (Math.random() * 0.05 - 0.025)
      const lng = userLocation[1] + (Math.random() * 0.05 - 0.025)
      setDestinationCoords([lat, lng])
    }

    setValidationError(null)
    setStep(2)
  }

  // Handler para voltar ao passo anterior
  const handlePreviousStep = () => {
    setStep(1)
  }

  // Handler para envio do formulário
  const handleSubmit = () => {
    setValidationError(null)
    setIsLoading(true)

    // Garantir que temos coordenadas de origem válidas
    const finalOriginCoords: [number, number] =
      originCoords && originCoords[0] !== undefined && originCoords[1] !== undefined ? originCoords : userLocation

    // Garantir que temos coordenadas de destino válidas
    const finalDestinationCoords: [number, number] =
      destinationCoords && destinationCoords[0] !== undefined && destinationCoords[1] !== undefined
        ? destinationCoords
        : [userLocation[0] + (Math.random() * 0.05 - 0.025), userLocation[1] + (Math.random() * 0.05 - 0.025)]

    // Simular processamento
    setTimeout(() => {
      onConfirm({
        origin,
        destination,
        originCoords: finalOriginCoords,
        destinationCoords: finalDestinationCoords,
        passengers: Number.parseInt(passengers),
        paymentMethod,
      })
      setIsLoading(false)
    }, 1000)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[60vh] overflow-hidden flex flex-col">
        <DialogHeader className="pb-2">
          <DialogTitle>{step === 1 ? "Para onde vamos?" : "Detalhes da viagem"}</DialogTitle>
          <DialogDescription>
            {step === 1 ? "Informe seu destino para solicitar uma van" : "Confirme os detalhes da sua viagem"}
          </DialogDescription>
        </DialogHeader>

        {validationError && (
          <Alert variant="destructive" className="mt-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{validationError}</AlertDescription>
          </Alert>
        )}

        {geocodingError && (
          <Alert variant="warning" className="mt-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Estamos com dificuldades para acessar o serviço de endereços. Você ainda pode digitar manualmente seu
              destino.
            </AlertDescription>
          </Alert>
        )}

        <div className="overflow-y-auto flex-grow py-2">
          {step === 1 ? (
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="origin">Origem</Label>
                <div className="flex items-center gap-2 border rounded-md p-2 relative">
                  <MapPin className="h-4 w-4 text-primary" />
                  <Input
                    id="origin"
                    ref={originInputRef}
                    value={origin}
                    onChange={handleOriginChange}
                    onFocus={() => setShowOriginSuggestions(true)}
                    className="border-0 p-0 focus-visible:ring-0"
                    placeholder="Ponto de partida"
                    maxLength={MAX_CHARS}
                  />
                  {origin && (
                    <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={handleClearOrigin}>
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => setShowOriginSuggestions(true)}
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
                {showCharLimit && origin.length > 0 && (
                  <p className={`text-xs ${origin.length >= MAX_CHARS ? "text-destructive" : "text-muted-foreground"}`}>
                    {origin.length}/{MAX_CHARS} caracteres
                  </p>
                )}

                {/* Sugestões de origem */}
                {showOriginSuggestions && (
                  <div className="absolute left-0 right-0 mt-1 bg-white border rounded-md shadow-lg z-50 max-h-40 overflow-y-auto origin-suggestions-container">
                    {isSearchingOrigin ? (
                      <div className="p-3 text-sm text-center">
                        <Loader2 className="h-4 w-4 animate-spin mx-auto mb-2" />
                        Buscando endereços...
                      </div>
                    ) : originResults.length === 0 ? (
                      <div className="p-3 text-sm text-muted-foreground">Nenhum endereço encontrado</div>
                    ) : (
                      originResults.map((result) => (
                        <div
                          key={result.place_id}
                          className="p-3 hover:bg-muted cursor-pointer flex items-center gap-2 border-b last:border-0"
                          onClick={() => handleSelectOriginSuggestion(result)}
                        >
                          <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
                          <div className="text-sm">{result.display_name}</div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              <div className="grid gap-2 relative">
                <Label htmlFor="destination">Destino</Label>
                <div className="flex items-center gap-2 border rounded-md p-2">
                  <Navigation className="h-4 w-4 text-primary" />
                  <Input
                    id="destination"
                    ref={destinationInputRef}
                    value={destination}
                    onChange={handleDestinationChange}
                    onFocus={() => setShowDestinationSuggestions(true)}
                    className="border-0 p-0 focus-visible:ring-0"
                    placeholder="Para onde você vai?"
                    maxLength={MAX_CHARS}
                  />
                  {destination && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={handleClearDestination}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => setShowDestinationSuggestions(true)}
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
                {showCharLimit && destination.length > 0 && (
                  <p
                    className={`text-xs ${destination.length >= MAX_CHARS ? "text-destructive" : "text-muted-foreground"}`}
                  >
                    {destination.length}/{MAX_CHARS} caracteres
                  </p>
                )}

                {/* Sugestões de destino */}
                {showDestinationSuggestions && (
                  <div className="absolute left-0 right-0 mt-1 bg-white border rounded-md shadow-lg z-50 max-h-40 overflow-y-auto destination-suggestions-container">
                    {isSearchingDestination ? (
                      <div className="p-3 text-sm text-center">
                        <Loader2 className="h-4 w-4 animate-spin mx-auto mb-2" />
                        Buscando endereços...
                      </div>
                    ) : destinationResults.length === 0 && destinationQuery.length >= 3 ? (
                      <div className="p-3 text-sm text-muted-foreground">Nenhum endereço encontrado</div>
                    ) : (
                      destinationResults.map((result) => (
                        <div
                          key={result.place_id}
                          className="p-3 hover:bg-muted cursor-pointer flex items-center gap-2 border-b last:border-0"
                          onClick={() => handleSelectDestinationSuggestion(result)}
                        >
                          <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
                          <div className="text-sm">{result.display_name}</div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              {destination && destination.length > 0 && (
                <Alert variant={isAuthorized ? "default" : "destructive"} className="bg-primary/10 border-primary/20">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {isAuthorized
                      ? "Você está autorizado a viajar para este destino."
                      : "Este destino requer autorização especial. Entre em contato com o administrador."}
                  </AlertDescription>
                </Alert>
              )}

              {geocodingError && (
                <div className="bg-blue-50 p-3 rounded-md text-sm text-blue-700">
                  <p>
                    <strong>Dica:</strong> Você pode digitar nomes de bairros como "Copacabana", "Ipanema", "Barra da
                    Tijuca" ou "Centro" para encontrar destinos.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="passengers">Número de passageiros</Label>
                <Select value={passengers} onValueChange={setPassengers}>
                  <SelectTrigger id="passengers">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 passageiro</SelectItem>
                    <SelectItem value="2">2 passageiros</SelectItem>
                    <SelectItem value="3">3 passageiros</SelectItem>
                    <SelectItem value="4">4 passageiros</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>Forma de pagamento</Label>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                  <div className="flex items-center space-x-2 border rounded-md p-2">
                    <RadioGroupItem value="pix" id="pix" />
                    <Label htmlFor="pix" className="flex items-center gap-2 cursor-pointer">
                      <Wallet className="h-4 w-4" />
                      <span>PIX</span>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 border rounded-md p-2">
                    <RadioGroupItem value="card" id="card" />
                    <Label htmlFor="card" className="flex items-center gap-2 cursor-pointer">
                      <CreditCard className="h-4 w-4" />
                      <span>Cartão de Crédito/Débito</span>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 border rounded-md p-2">
                    <RadioGroupItem value="social" id="social" />
                    <Label htmlFor="social" className="flex items-center gap-2 cursor-pointer">
                      <Clock className="h-4 w-4" />
                      <span>Crédito Social</span>
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="pt-2">
          {step === 1 ? (
            <>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} size="sm">
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={handleNextStep}
                size="sm"
                disabled={!isAuthorized && destination.length > 0}
              >
                Continuar
              </Button>
            </>
          ) : (
            <>
              <Button type="button" variant="outline" onClick={handlePreviousStep} size="sm">
                Voltar
              </Button>
              <Button type="button" onClick={handleSubmit} disabled={isLoading} size="sm">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processando...
                  </>
                ) : (
                  "Confirmar"
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
