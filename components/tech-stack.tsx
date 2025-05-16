import { CheckCircle } from "lucide-react"

export function TechStack() {
  const technologies = {
    frontend: [
      { name: "React", description: "Biblioteca para construção de interfaces" },
      { name: "Next.js", description: "Framework React com SSR e otimizações" },
      { name: "Tailwind CSS", description: "Framework CSS utilitário" },
      { name: "Leaflet.js", description: "Biblioteca de mapas interativos" },
      { name: "Socket.io-client", description: "Cliente WebSocket para atualizações em tempo real" },
    ],
    backend: [
      { name: "Node.js", description: "Ambiente de execução JavaScript" },
      { name: "Express", description: "Framework web para Node.js" },
      { name: "Socket.io", description: "Biblioteca para comunicação em tempo real" },
      { name: "Prisma", description: "ORM para acesso ao banco de dados" },
      { name: "JWT", description: "Autenticação baseada em tokens" },
    ],
    database: [
      { name: "PostgreSQL", description: "Banco de dados relacional" },
      { name: "PostGIS", description: "Extensão para dados geoespaciais" },
      { name: "Redis", description: "Armazenamento em cache e pub/sub" },
    ],
    devops: [
      { name: "Docker", description: "Containerização da aplicação" },
      { name: "GitHub Actions", description: "CI/CD automatizado" },
      { name: "Vercel/Netlify", description: "Hospedagem do frontend" },
      { name: "Heroku/Railway", description: "Hospedagem do backend" },
    ],
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {Object.entries(technologies).map(([category, techs]) => (
        <div key={category} className="bg-white rounded-lg shadow-sm p-4">
          <h3 className="text-lg font-semibold capitalize mb-3 text-blue-700">{category}</h3>
          <ul className="space-y-2">
            {techs.map((tech) => (
              <li key={tech.name} className="flex items-start">
                <CheckCircle className="h-5 w-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-medium">{tech.name}</span>
                  <p className="text-sm text-gray-600">{tech.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}
