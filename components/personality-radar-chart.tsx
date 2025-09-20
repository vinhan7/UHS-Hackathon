import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts"
import type { PersonalityScores } from "@/types/student"

interface PersonalityRadarChartProps {
  scores: PersonalityScores
  className?: string
}

export function PersonalityRadarChart({ scores, className = "h-80" }: PersonalityRadarChartProps) {
  const radarData = [
    {
      trait: "Extroversion",
      value: Math.max(0, Math.min(100, (scores.extrovert + 2) * 25)),
    },
    {
      trait: "Leadership",
      value: Math.max(0, Math.min(100, (scores.leader + 2) * 25)),
    },
    {
      trait: "Collaboration",
      value: Math.max(0, Math.min(100, (scores.collaborative + 2) * 25)),
    },
    {
      trait: "Creativity",
      value: Math.max(0, Math.min(100, (scores.creative + 2) * 25)),
    },
    {
      trait: "Focus",
      value: Math.max(0, Math.min(100, (scores.focused + 2) * 25)),
    },
  ]

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={radarData}>
          <PolarGrid />
          <PolarAngleAxis dataKey="trait" className="text-sm" />
          <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} />
          <Radar name="Personality" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} strokeWidth={2} />
        </RadarChart>
      </ResponsiveContainer>

      {/* Trait explanations */}
      <div className="mt-4 space-y-2 text-sm">
        {radarData.map((item) => (
          <div key={item.trait} className="flex justify-between items-center">
            <span className="text-gray-600">{item.trait}:</span>
            <div className="flex items-center gap-2">
              <div className="w-16 bg-gray-200 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${item.value}%` }} />
              </div>
              <span className="text-gray-900 font-medium w-8">{item.value}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
