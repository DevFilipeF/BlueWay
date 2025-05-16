import { CheckCircle, Circle, Clock } from "lucide-react"

export function ImplementationTimeline() {
  const phases = [
    {
      title: "Fase 1: Fundação (2-3 semanas)",
      status: "completed",
      tasks: [
        "Configuração do ambiente de desenvolvimento",
        "Implementação da autenticação de usuários",
        "Desenvolvimento do mapa básico com Leaflet",
        "Criação da estrutura de banco de dados",
      ],
    },
    {
      title: "Fase 2: Funcionalidades Principais (3-4 semanas)",
      status: "in-progress",
      tasks: [
        "Implementação do sistema de solicitação de vans",
        "Desenvolvimento do rastreamento em tempo real",
        "Criação do painel de administrador básico",
        "Integração com serviços de geolocalização",
      ],
    },
    {
      title: "Fase 3: Modo Empresa (2-3 semanas)",
      status: "pending",
      tasks: [
        "Desenvolvimento do sistema de agendamento de frotas",
        "Implementação de perfis corporativos",
        "Criação de relatórios para empresas",
        "Sistema de benefícios para funcionários",
      ],
    },
    {
      title: "Fase 4: Refinamento e Lançamento (2-3 semanas)",
      status: "pending",
      tasks: [
        "Testes de usabilidade e correções",
        "Otimização de desempenho",
        "Implementação de feedback dos usuários",
        "Preparação para lançamento",
      ],
    },
  ]

  return (
    <div className="space-y-6">
      {phases.map((phase, index) => (
        <div key={index} className="relative">
          {/* Linha vertical conectando as fases */}
          {index < phases.length - 1 && (
            <div className="absolute left-3.5 top-7 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />
          )}

          <div className="flex gap-4">
            <div className="flex-shrink-0 mt-1">
              {phase.status === "completed" ? (
                <CheckCircle className="h-7 w-7 text-green-500" />
              ) : phase.status === "in-progress" ? (
                <Clock className="h-7 w-7 text-blue-500" />
              ) : (
                <Circle className="h-7 w-7 text-gray-300" />
              )}
            </div>

            <div className="flex-1">
              <h3
                className={`font-medium text-lg ${
                  phase.status === "completed"
                    ? "text-green-700"
                    : phase.status === "in-progress"
                      ? "text-blue-700"
                      : "text-gray-700"
                }`}
              >
                {phase.title}
              </h3>

              <ul className="mt-2 space-y-2">
                {phase.tasks.map((task, taskIndex) => (
                  <li key={taskIndex} className="flex items-start gap-2 text-sm">
                    <div
                      className={`w-1.5 h-1.5 rounded-full mt-1.5 ${
                        phase.status === "completed"
                          ? "bg-green-500"
                          : phase.status === "in-progress"
                            ? "bg-blue-500"
                            : "bg-gray-400"
                      }`}
                    />
                    <span className="text-gray-600">{task}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
