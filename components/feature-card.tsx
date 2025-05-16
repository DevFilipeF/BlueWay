import type { ReactNode } from "react"

interface FeatureCardProps {
  title: string
  description: string
  icon: ReactNode
  difficulty: "easy" | "medium" | "hard"
  priority: "low" | "medium" | "high"
}

export function FeatureCard({ title, description, icon, difficulty, priority }: FeatureCardProps) {
  const difficultyColors = {
    easy: "bg-green-100 text-green-800",
    medium: "bg-yellow-100 text-yellow-800",
    hard: "bg-red-100 text-red-800",
  }

  const priorityColors = {
    low: "bg-blue-100 text-blue-800",
    medium: "bg-purple-100 text-purple-800",
    high: "bg-pink-100 text-pink-800",
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-100">
      <div className="flex items-start">
        <div className="bg-blue-100 p-3 rounded-full mr-4">{icon}</div>
        <div className="flex-1">
          <h3 className="font-semibold text-lg mb-1">{title}</h3>
          <p className="text-gray-600 text-sm mb-3">{description}</p>
          <div className="flex flex-wrap gap-2">
            <span className={`text-xs px-2 py-1 rounded-full ${difficultyColors[difficulty]}`}>
              {difficulty === "easy" ? "Fácil" : difficulty === "medium" ? "Média" : "Difícil"}
            </span>
            <span className={`text-xs px-2 py-1 rounded-full ${priorityColors[priority]}`}>
              {priority === "low" ? "Prioridade Baixa" : priority === "medium" ? "Prioridade Média" : "Prioridade Alta"}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
