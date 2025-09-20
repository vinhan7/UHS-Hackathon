"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Download, RefreshCw, Users } from "lucide-react"

interface SeatingChartData {
  layout: ({ studentName: string; reasoning: string } | null)[][]
  groups?: {
    groupNumber: number
    students: string[]
    traits: {
      extroverts: number
      leaders: number
      collaborative: number
      visualLearners: number
    }
  }[]
  recommendations: string[]
  considerations: {
    personalityBalance: string
    learningStyleMix: string
    collaborationOpportunities: string
  }
}

export default function SeatingChart() {
  const [seatingChart, setSeatingChart] = useState<SeatingChartData | null>(null)

  useEffect(() => {
    const savedChart = localStorage.getItem("seating_chart")
    if (savedChart) {
      setSeatingChart(JSON.parse(savedChart))
    }
  }, [])

  const exportChart = () => {
    if (!seatingChart) return

    let chartText = ""

    if (seatingChart.groups) {
      chartText = seatingChart.groups
        .map((group) => `Group ${group.groupNumber}: ${group.students.join(", ")}`)
        .join("\n")
    } else {
      chartText = seatingChart.layout
        .map((row) => row.map((seat) => (seat ? seat.studentName : "[Empty]")).join("\t"))
        .join("\n")
    }

    const fullReport = `CLASSROOM SEATING CHART\n\n${chartText}\n\nRECOMMENDATIONS:\n${seatingChart.recommendations.join(
      "\n",
    )}\n\nCONSIDERATIONS:\n${Object.entries(seatingChart.considerations)
      .map(([key, value]) => `${key}: ${value}`)
      .join("\n")}`

    const blob = new Blob([fullReport], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "seating_chart.txt"
    a.click()
    URL.revokeObjectURL(url)
  }

  if (!seatingChart) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle>No Seating Chart Found</CardTitle>
            <CardDescription>Generate a seating chart from the dashboard first</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => (window.location.href = "/dashboard")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Classroom Seating Chart</h1>
            <p className="text-gray-600">AI-optimized arrangement for maximum learning potential</p>
          </div>
          <div className="flex gap-3">
            <Button onClick={() => (window.location.href = "/dashboard")} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <Button onClick={exportChart} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export Chart
            </Button>
          </div>
        </div>

        {seatingChart.groups ? (
          <div className="space-y-6">
            {/* Groups Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Student Groups
                </CardTitle>
                <CardDescription>Compatible students grouped for optimal collaboration</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {seatingChart.groups.map((group) => (
                    <Card key={group.groupNumber} className="border-2 border-blue-200">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg">Group {group.groupNumber}</CardTitle>
                        <CardDescription>{group.students.length} students</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="space-y-1">
                          {group.students.map((student, index) => (
                            <div key={index} className="text-sm font-medium text-gray-700">
                              {student}
                            </div>
                          ))}
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {group.traits.extroverts > 0 && (
                            <Badge variant="outline" className="text-xs bg-green-50">
                              {group.traits.extroverts} Extrovert{group.traits.extroverts > 1 ? "s" : ""}
                            </Badge>
                          )}
                          {group.traits.leaders > 0 && (
                            <Badge variant="outline" className="text-xs bg-purple-50">
                              {group.traits.leaders} Leader{group.traits.leaders > 1 ? "s" : ""}
                            </Badge>
                          )}
                          {group.traits.collaborative > 0 && (
                            <Badge variant="outline" className="text-xs bg-blue-50">
                              {group.traits.collaborative} Collaborative
                            </Badge>
                          )}
                          {group.traits.visualLearners > 0 && (
                            <Badge variant="outline" className="text-xs bg-orange-50">
                              {group.traits.visualLearners} Visual
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          /* Fallback to original grid layout */
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5" />
                Classroom Layout
              </CardTitle>
              <CardDescription>Front of classroom is at the top</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {/* Teacher's Desk */}
                <div className="text-center mb-6">
                  <div className="inline-block bg-gray-800 text-white px-6 py-2 rounded-lg font-medium">
                    Teacher's Desk
                  </div>
                </div>

                {/* Student Seating */}
                <div
                  className="grid gap-2"
                  style={{ gridTemplateColumns: `repeat(${seatingChart.layout[0]?.length || 6}, 1fr)` }}
                >
                  {seatingChart.layout.flat().map((seat, index) => (
                    <div
                      key={index}
                      className={`aspect-square border-2 rounded-lg flex items-center justify-center text-center p-2 ${
                        seat
                          ? "bg-blue-50 border-blue-200 hover:bg-blue-100 transition-colors cursor-pointer"
                          : "bg-gray-50 border-gray-200"
                      }`}
                      title={seat?.reasoning}
                    >
                      {seat ? (
                        <div className="text-sm">
                          <div className="font-medium text-gray-900 text-balance">{seat.studentName}</div>
                        </div>
                      ) : (
                        <div className="text-xs text-gray-400">Empty</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recommendations and Considerations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Seating Recommendations</CardTitle>
              <CardDescription>Key insights for this arrangement</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {seatingChart.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Badge variant="outline" className="mt-0.5 text-xs">
                      {index + 1}
                    </Badge>
                    <span className="text-sm text-gray-700 leading-relaxed">{rec}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Design Considerations</CardTitle>
              <CardDescription>How this layout optimizes learning</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium text-purple-700 mb-1">Personality Balance</h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {seatingChart.considerations.personalityBalance}
                </p>
              </div>
              <div>
                <h4 className="font-medium text-blue-700 mb-1">Learning Style Mix</h4>
                <p className="text-sm text-gray-600 leading-relaxed">{seatingChart.considerations.learningStyleMix}</p>
              </div>
              <div>
                <h4 className="font-medium text-green-700 mb-1">Collaboration Opportunities</h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {seatingChart.considerations.collaborationOpportunities}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
