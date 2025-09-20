"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trash2, Sparkles, Loader2 } from "lucide-react"
import type { StudentResult, PersonalityScores } from "@/types/student"

interface StudentCardProps {
  student: StudentResult
  onRemove: (studentName: string) => void
  onAnalyze: (student: StudentResult) => void
  isAnalyzing: boolean
  calculatePersonalityScores: (answers: Record<number, string>) => PersonalityScores
  getPersonalityArchetype: (scores: PersonalityScores) => string
}

export function StudentCard({
  student,
  onRemove,
  onAnalyze,
  isAnalyzing,
  calculatePersonalityScores,
  getPersonalityArchetype,
}: StudentCardProps) {
  const scores = calculatePersonalityScores(student.answers)
  const archetype = getPersonalityArchetype(scores)

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{student.studentName}</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{student.aiAnalysis?.archetype || archetype}</Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRemove(student.studentName)}
              className="text-red-500 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <CardDescription>Completed {new Date(student.timestamp).toLocaleDateString()}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {student.aiAnalysis ? (
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 leading-relaxed">{student.aiAnalysis.description}</p>
            </div>

            <div>
              <h4 className="font-medium mb-2 text-green-700">Strengths</h4>
              <div className="flex flex-wrap gap-1">
                {student.aiAnalysis.strengths.slice(0, 3).map((strength: string, i: number) => (
                  <Badge key={i} variant="outline" className="text-xs bg-green-50 text-green-700">
                    {strength}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Learning Style</h4>
              <p className="text-sm text-gray-600">{student.aiAnalysis.learningStyle.primary}</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Personality Traits</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Extroversion:</span>
                  <span className={scores.extrovert > 0 ? "text-green-600" : "text-blue-600"}>
                    {scores.extrovert > 0 ? "Extrovert" : "Introvert"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Leadership:</span>
                  <span className={scores.leader > 0 ? "text-purple-600" : "text-orange-600"}>
                    {scores.leader > 0 ? "Leader" : "Supporter"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Work Style:</span>
                  <span className={scores.collaborative > 0 ? "text-teal-600" : "text-indigo-600"}>
                    {scores.collaborative > 0 ? "Collaborative" : "Independent"}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Learning Styles</h4>
              <div className="flex flex-wrap gap-1">
                {scores.visual && (
                  <Badge variant="outline" className="text-xs">
                    Visual
                  </Badge>
                )}
                {scores.auditory && (
                  <Badge variant="outline" className="text-xs">
                    Auditory
                  </Badge>
                )}
                {scores.reading && (
                  <Badge variant="outline" className="text-xs">
                    Reading/Writing
                  </Badge>
                )}
                {scores.kinesthetic && (
                  <Badge variant="outline" className="text-xs">
                    Kinesthetic
                  </Badge>
                )}
              </div>
            </div>

            <Button
              onClick={() => onAnalyze(student)}
              disabled={isAnalyzing}
              size="sm"
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  AI Analysis
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
