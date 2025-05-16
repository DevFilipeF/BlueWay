import { Navbar } from "@/components/navbar"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { HelpCircle, MessageSquare, Phone } from "lucide-react"
import { ProtectedRoute } from "@/components/protected-route"

export default function AjudaPage() {
  return (
    <ProtectedRoute>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 container py-6">
          <h1 className="text-2xl font-bold mb-6">Central de Ajuda</h1>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <h2 className="text-lg font-medium flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-primary" />
                Perguntas Frequentes
              </h2>

              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>Como solicitar uma van?</AccordionTrigger>
                  <AccordionContent>
                    Para solicitar uma van, abra o aplicativo, permita o acesso à sua localização, e clique no botão
                    "Solicitar Van" na tela inicial. Preencha o destino e confirme a solicitação.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-2">
                  <AccordionTrigger>Como funciona o pagamento?</AccordionTrigger>
                  <AccordionContent>
                    Você pode pagar suas viagens usando PIX, cartão de crédito/débito ou créditos sociais. Selecione o
                    método de pagamento ao solicitar a van.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-3">
                  <AccordionTrigger>O que são créditos sociais?</AccordionTrigger>
                  <AccordionContent>
                    Créditos sociais são uma forma de pagamento subsidiada para moradores de comunidades cadastradas.
                    Você pode receber créditos através de programas sociais ou atividades comunitárias.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-4">
                  <AccordionTrigger>Como cancelar uma viagem?</AccordionTrigger>
                  <AccordionContent>
                    Você pode cancelar uma viagem clicando no botão "X" no canto superior direito do card de
                    acompanhamento da viagem. O cancelamento é gratuito se feito antes da van chegar ao local de
                    embarque.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-5">
                  <AccordionTrigger>Como reportar um problema?</AccordionTrigger>
                  <AccordionContent>
                    Para reportar um problema, acesse a seção "Ajuda" e clique em "Falar com Suporte". Descreva o
                    problema em detalhes para que possamos ajudar.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-medium">Precisa de mais ajuda?</h2>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-primary" />
                    Falar com Suporte
                  </CardTitle>
                  <CardDescription>Envie uma mensagem para nossa equipe de suporte</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Input placeholder="Assunto" />
                    <textarea
                      className="w-full min-h-[100px] p-2 border rounded-md"
                      placeholder="Descreva seu problema ou dúvida..."
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full">Enviar Mensagem</Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Phone className="h-5 w-5 text-primary" />
                    Suporte por Telefone
                  </CardTitle>
                  <CardDescription>Ligue para nossa central de atendimento</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-lg font-bold text-center">(21) 3333-4444</p>
                  <p className="text-sm text-center text-muted-foreground">Segunda a Sexta, 8h às 20h</p>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">
                    Ligar Agora
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
