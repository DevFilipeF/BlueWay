"use client"

import { MapPin, Users, Clock, CreditCard, Shield, Building } from "lucide-react"
import { TechStack } from "./components/tech-stack"
import { FeatureCard } from "./components/feature-card"
import { ImplementationTimeline } from "./components/implementation-timeline"
import { MapImplementation } from "./components/map-implementation"
import ArchitectureDiagram from "./architecture-diagram"
import UserFlowDiagram from "./components/user-flow-diagram"

export default function ImplementationPlan() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="space-y-12">
        <section>
          <h1 className="text-3xl font-bold text-blue-800 mb-2">Plano de Implementação - MobiComunidade</h1>
          <p className="text-gray-600 mb-6">
            Baseado no briefing técnico, apresentamos um plano detalhado para o desenvolvimento do WebApp
            MobiComunidade, com foco em uma arquitetura escalável e experiência de usuário fluida.
          </p>

          <h2 className="text-2xl font-semibold text-blue-700 mb-4">Arquitetura Proposta</h2>
          <ArchitectureDiagram />

          <div className="mt-6 bg-blue-50 p-4 rounded-lg">
            <p className="text-blue-800">
              A arquitetura proposta segue um modelo cliente-servidor com comunicação em tempo real via WebSockets. O
              frontend em React se comunica com o backend Node.js, que gerencia a lógica de negócios e acessa o banco de
              dados PostgreSQL. Serviços externos como APIs de mapas são integrados para funcionalidades de
              geolocalização.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-blue-700 mb-4">Stack Tecnológico</h2>
          <TechStack />
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-blue-700 mb-4">Fluxo do Usuário</h2>
          <UserFlowDiagram />

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h3 className="font-semibold text-lg text-blue-700 mb-2">Usuário Comum</h3>
              <ol className="list-decimal pl-5 space-y-1 text-gray-700">
                <li>Registro/Login no aplicativo</li>
                <li>Visualização do mapa com sua localização</li>
                <li>Solicitação de van (origem e destino)</li>
                <li>Seleção de método de pagamento</li>
                <li>Acompanhamento da van em tempo real</li>
                <li>Recebimento de notificações de chegada</li>
                <li>Finalização da viagem</li>
              </ol>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h3 className="font-semibold text-lg text-blue-700 mb-2">Administrador</h3>
              <ol className="list-decimal pl-5 space-y-1 text-gray-700">
                <li>Login com credenciais de administrador</li>
                <li>Visualização do painel de controle</li>
                <li>Monitoramento de todas as vans ativas</li>
                <li>Verificação de status dos passageiros</li>
                <li>Gerenciamento de rotas e motoristas</li>
                <li>Acesso a relatórios e métricas</li>
                <li>Configuração de parâmetros do sistema</li>
              </ol>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-blue-700 mb-4">Funcionalidades Principais</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FeatureCard
              title="Mapa Interativo"
              description="Exibição de mapa com localização do usuário, van e destino, com rotas em tempo real."
              icon={<MapPin className="h-6 w-6 text-blue-600" />}
              difficulty="medium"
              priority="high"
            />
            <FeatureCard
              title="Autenticação de Usuários"
              description="Sistema de login/registro para usuários comuns e administradores."
              icon={<Shield className="h-6 w-6 text-blue-600" />}
              difficulty="easy"
              priority="high"
            />
            <FeatureCard
              title="Rastreamento em Tempo Real"
              description="Atualização da posição da van em tempo real usando WebSockets."
              icon={<Clock className="h-6 w-6 text-blue-600" />}
              difficulty="hard"
              priority="high"
            />
            <FeatureCard
              title="Painel de Administrador"
              description="Interface para monitoramento e gerenciamento de vans e passageiros."
              icon={<Users className="h-6 w-6 text-blue-600" />}
              difficulty="medium"
              priority="medium"
            />
            <FeatureCard
              title="Modo Empresa"
              description="Funcionalidades para empresas agendarem frotas para seus funcionários."
              icon={<Building className="h-6 w-6 text-blue-600" />}
              difficulty="hard"
              priority="medium"
            />
            <FeatureCard
              title="Sistema de Pagamento"
              description="Integração com métodos de pagamento (PIX, cartão, créditos sociais)."
              icon={<CreditCard className="h-6 w-6 text-blue-600" />}
              difficulty="hard"
              priority="low"
            />
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-blue-700 mb-4">Implementação do Mapa</h2>
          <MapImplementation />
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-blue-700 mb-4">Cronograma de Implementação</h2>
          <ImplementationTimeline />
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-blue-700 mb-4">Considerações Técnicas</h2>
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h3 className="font-semibold text-lg mb-2">Escalabilidade</h3>
              <p className="text-gray-700">
                A arquitetura foi projetada para escalar horizontalmente. O uso de WebSockets via Socket.io permite a
                implementação de um sistema de salas para gerenciar conexões de forma eficiente. O banco de dados
                PostgreSQL com a extensão PostGIS oferece excelente desempenho para consultas geoespaciais, essenciais
                para o rastreamento de vans.
              </p>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h3 className="font-semibold text-lg mb-2">Segurança</h3>
              <p className="text-gray-700">
                Implementaremos autenticação JWT com tokens de curta duração e refresh tokens. Todas as comunicações
                serão criptografadas via HTTPS. O acesso ao painel de administrador será protegido por autenticação de
                dois fatores. Dados sensíveis como informações de pagamento serão armazenados de forma segura seguindo
                as melhores práticas do PCI DSS.
              </p>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h3 className="font-semibold text-lg mb-2">Desempenho</h3>
              <p className="text-gray-700">Para garantir uma experiência fluida, implementaremos:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1 text-gray-700">
                <li>Lazy loading de componentes React para reduzir o tamanho do bundle inicial</li>
                <li>Otimização de imagens e assets</li>
                <li>Caching de dados de rotas e geocodificação</li>
                <li>Compressão de dados transmitidos via WebSockets</li>
                <li>Renderização condicional de elementos do mapa baseada na viewport</li>
              </ul>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h3 className="font-semibold text-lg mb-2">Offline First</h3>
              <p className="text-gray-700">
                Implementaremos uma abordagem "offline first" usando Service Workers para:
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-1 text-gray-700">
                <li>Armazenar dados de rotas frequentes em cache</li>
                <li>Permitir visualização do mapa mesmo sem conexão</li>
                <li>Enfileirar solicitações feitas offline para sincronização posterior</li>
                <li>Fornecer feedback claro ao usuário sobre o estado da conexão</li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-blue-700 mb-4">Próximos Passos</h2>
          <div className="bg-blue-50 p-4 rounded-lg">
            <ol className="list-decimal pl-5 space-y-2 text-blue-800">
              <li>
                <strong>Definição de requisitos detalhados:</strong> Refinar os requisitos funcionais e não-funcionais
                com base no briefing técnico.
              </li>
              <li>
                <strong>Prototipagem de interface:</strong> Criar wireframes e protótipos interativos para validação com
                stakeholders.
              </li>
              <li>
                <strong>Configuração do ambiente de desenvolvimento:</strong> Preparar repositório, CI/CD, ambientes de
                desenvolvimento, homologação e produção.
              </li>
              <li>
                <strong>Desenvolvimento MVP:</strong> Implementar as funcionalidades essenciais seguindo o cronograma
                proposto, começando pelo mapa interativo e autenticação.
              </li>
              <li>
                <strong>Testes e validação:</strong> Realizar testes unitários, de integração e de usabilidade para
                garantir a qualidade do produto.
              </li>
            </ol>
          </div>
        </section>
      </div>
    </div>
  )
}
