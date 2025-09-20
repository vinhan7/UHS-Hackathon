"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Users, Download, Grid3X3, Brain, BarChart3, Sparkles, Loader2, Upload, UserPlus, Trash2 } from "lucide-react"

interface StudentResult {
  studentName: string
  answers: Record<number, string>
  timestamp: string
  aiAnalysis?: any
}

export default function Dashboard() {
  const [students, setStudents] = useState<StudentResult[]>([])
  const [analyzingStudent, setAnalyzingStudent] = useState<string | null>(null)
  const [generatingChart, setGeneratingChart] = useState(false)
  const [showAddStudent, setShowAddStudent] = useState(false)
  const [showImportStudents, setShowImportStudents] = useState(false)
  const [showSeatingConfig, setShowSeatingConfig] = useState(false)
  const [newStudentName, setNewStudentName] = useState("")
  const [importText, setImportText] = useState("")
  const [numGroups, setNumGroups] = useState(6)
  const [studentsPerGroup, setStudentsPerGroup] = useState(4)

  useEffect(() => {
    // Load all student results from localStorage
    const loadedStudents: StudentResult[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith("student_")) {
        const data = localStorage.getItem(key)
        if (data) {
          loadedStudents.push(JSON.parse(data))
        }
      }
    }
    setStudents(loadedStudents)
  }, [])

  const removeStudent = (studentName: string) => {
    // Remove from localStorage
    localStorage.removeItem(`student_${studentName}`)
    // Update state
    setStudents((prev) => prev.filter((s) => s.studentName !== studentName))
  }

  const addManualStudent = () => {
    if (!newStudentName.trim()) return

    const randomAnswers = {
      1: Math.random() > 0.5 ? "extrovert" : "introvert",
      2: Math.random() > 0.5 ? "leader" : "supporter",
      3: Math.random() > 0.5 ? "collaborative" : "independent",
      4: Math.random() > 0.5 ? "creative" : "analytical",
      5: Math.random() > 0.5 ? "focused" : "distracted",
      6: Math.random() > 0.5 ? "leader" : "supporter",
      7: Math.random() > 0.5 ? "visual" : "auditory",
      8: Math.random() > 0.5 ? "auditory" : "visual",
      9: Math.random() > 0.5 ? "reading" : "kinesthetic",
      10: Math.random() > 0.5 ? "kinesthetic" : "reading",
      11: Math.random() > 0.5 ? "visual-kinesthetic" : "auditory-reading",
      12: Math.random() > 0.5 ? "interactive" : "quiet",
    }

    const newStudent: StudentResult = {
      studentName: newStudentName.trim(),
      answers: randomAnswers,
      timestamp: new Date().toISOString(),
    }

    // Save to localStorage
    localStorage.setItem(`student_${newStudentName.trim()}`, JSON.stringify(newStudent))

    // Update state
    setStudents((prev) => [...prev, newStudent])
    setNewStudentName("")
    setShowAddStudent(false)
  }

  const importStudents = () => {
    const names = importText
      .split("\n")
      .map((name) => name.trim())
      .filter((name) => name.length > 0)
      .filter((name) => !students.some((s) => s.studentName === name))

    const newStudents = names.map((name) => {
      const randomAnswers = {
        1: Math.random() > 0.5 ? "extrovert" : "introvert",
        2: Math.random() > 0.5 ? "leader" : "supporter",
        3: Math.random() > 0.5 ? "collaborative" : "independent",
        4: Math.random() > 0.5 ? "creative" : "analytical",
        5: Math.random() > 0.5 ? "focused" : "distracted",
        6: Math.random() > 0.5 ? "leader" : "supporter",
        7: Math.random() > 0.5 ? "visual" : "auditory",
        8: Math.random() > 0.5 ? "auditory" : "visual",
        9: Math.random() > 0.5 ? "reading" : "kinesthetic",
        10: Math.random() > 0.5 ? "kinesthetic" : "reading",
        11: Math.random() > 0.5 ? "visual-kinesthetic" : "auditory-reading",
        12: Math.random() > 0.5 ? "interactive" : "quiet",
      }

      return {
        studentName: name,
        answers: randomAnswers,
        timestamp: new Date().toISOString(),
      }
    })

    // Save all to localStorage
    newStudents.forEach((student) => {
      localStorage.setItem(`student_${student.studentName}`, JSON.stringify(student))
    })

    // Update state
    setStudents((prev) => [...prev, ...newStudents])
    setImportText("")
    setShowImportStudents(false)
  }

  const analyzeStudent = async (student: StudentResult) => {
    setAnalyzingStudent(student.studentName)
    try {
      const mockAnalysis = {
        archetype: getPersonalityArchetype(calculatePersonalityScores(student.answers)),
        description: `${student.studentName} demonstrates a unique blend of personality traits that make them a valuable member of the classroom community. Their learning style and social preferences create opportunities for both independent work and collaborative projects.`,
        strengths: ["Good communication", "Creative thinking", "Team collaboration"],
        challenges: ["Time management", "Focus in noisy environments"],
        learningStyle: {
          primary: "Visual-Kinesthetic Learner",
          recommendations: ["Use visual aids", "Incorporate hands-on activities", "Provide movement breaks"],
        },
        collaborationMatches: ["Creative thinkers", "Visual learners", "Team players"],
        collaborationChallenges: ["Highly analytical students", "Strict rule followers"],
        seatingRecommendations: {
          position: "middle",
          proximity: "with-peers",
          reasoning: "Benefits from peer interaction while maintaining focus on instruction",
        },
        teachingStrategies: ["Visual presentations", "Group projects", "Interactive discussions"],
      }

      const updatedStudent = { ...student, aiAnalysis: mockAnalysis }

      // Update localStorage
      localStorage.setItem(`student_${student.studentName}`, JSON.stringify(updatedStudent))

      // Update state
      setStudents((prev) => prev.map((s) => (s.studentName === student.studentName ? updatedStudent : s)))
    } catch (error) {
      console.error("Error analyzing student:", error)
    } finally {
      setAnalyzingStudent(null)
    }
  }

  const generateSeatingChart = async () => {
    setGeneratingChart(true)
    try {
      const studentsWithScores = students.map((student) => ({
        ...student,
        scores: calculatePersonalityScores(student.answers),
      }))

      const groups = []
      const availableStudents = [...studentsWithScores]

      for (let g = 0; g < numGroups && availableStudents.length > 0; g++) {
        const group = []

        const firstStudent = availableStudents.splice(Math.floor(Math.random() * availableStudents.length), 1)[0]
        group.push(firstStudent)

        for (let s = 1; s < studentsPerGroup && availableStudents.length > 0; s++) {
          let bestMatch = 0
          let bestIndex = 0

          availableStudents.forEach((student, index) => {
            let compatibility = 0
            group.forEach((groupMember) => {
              if (student.scores.extrovert !== groupMember.scores.extrovert) compatibility += 2
              if (student.scores.leader !== groupMember.scores.leader) compatibility += 2
              if (student.scores.collaborative === groupMember.scores.collaborative && student.scores.collaborative > 0)
                compatibility += 3
              if (student.scores.visual === groupMember.scores.visual) compatibility += 1
            })

            if (compatibility > bestMatch) {
              bestMatch = compatibility
              bestIndex = index
            }
          })

          group.push(availableStudents.splice(bestIndex, 1)[0])
        }

        groups.push(group)
      }

      const cols = Math.ceil(Math.sqrt(numGroups))
      const rows = Math.ceil(numGroups / cols)
      const layout = []

      for (let r = 0; r < rows; r++) {
        const row = []
        for (let c = 0; c < cols; c++) {
          const groupIndex = r * cols + c
          if (groupIndex < groups.length) {
            const group = groups[groupIndex]
            const groupLayout = group.map((student) => ({
              studentName: student.studentName,
              reasoning: `Group ${groupIndex + 1}: Compatible personality traits and learning styles`,
            }))
            row.push(...groupLayout)
          } else {
            row.push(null)
          }
        }
        layout.push(row)
      }

      const mockSeatingChart = {
        layout,
        groups: groups.map((group, index) => ({
          groupNumber: index + 1,
          students: group.map((s) => s.studentName),
          traits: {
            extroverts: group.filter((s) => s.scores.extrovert > 0).length,
            leaders: group.filter((s) => s.scores.leader > 0).length,
            collaborative: group.filter((s) => s.scores.collaborative > 0).length,
            visualLearners: group.filter((s) => s.scores.visual).length,
          },
        })),
        recommendations: [
          `Created ${numGroups} groups with ${studentsPerGroup} students each`,
          "Mixed personality types for balanced group dynamics",
          "Paired compatible learning styles within groups",
          "Leaders distributed across different groups",
          "Collaborative students grouped together when possible",
        ],
        considerations: {
          personalityBalance: `Groups balanced with mix of introverts/extroverts and leaders/supporters`,
          learningStyleMix: `Visual, auditory, and kinesthetic learners distributed for peer learning`,
          collaborationOpportunities: `${groups.filter((g) => g.some((s) => s.scores.collaborative > 0)).length} groups have strong collaborative potential`,
        },
      }

      localStorage.setItem("seating_chart", JSON.stringify(mockSeatingChart))
      setShowSeatingConfig(false)
      window.location.href = "/seating-chart"
    } catch (error) {
      console.error("Error generating seating chart:", error)
    } finally {
      setGeneratingChart(false)
    }
  }

  const exportToCSV = () => {
    const headers = [
      "Student Name",
      "Timestamp",
      "Extrovert Score",
      "Leader Score",
      "Collaborative Score",
      "Creative Score",
      "Focused Score",
      "Visual Learner",
      "Auditory Learner",
      "Reading/Writing Learner",
      "Kinesthetic Learner",
    ]

    const rows = students.map((student) => {
      const scores = calculatePersonalityScores(student.answers)
      return [
        student.studentName,
        new Date(student.timestamp).toLocaleDateString(),
        scores.extrovert,
        scores.leader,
        scores.collaborative,
        scores.creative,
        scores.focused,
        scores.visual ? "Yes" : "No",
        scores.auditory ? "Yes" : "No",
        scores.reading ? "Yes" : "No",
        scores.kinesthetic ? "Yes" : "No",
      ]
    })

    const csvContent = [headers, ...rows].map((row) => row.join(",")).join("\n")
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "student_personality_results.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  const calculatePersonalityScores = (answers: Record<number, string>) => {
    let extrovert = 0,
      leader = 0,
      collaborative = 0,
      creative = 0,
      focused = 0
    let visual = false,
      auditory = false,
      reading = false,
      kinesthetic = false

    Object.entries(answers).forEach(([questionId, answer]) => {
      const qId = Number.parseInt(questionId)

      if (qId === 1 && answer === "extrovert") extrovert++
      if (qId === 1 && answer === "introvert") extrovert--
      if ((qId === 2 || qId === 6) && answer === "leader") leader++
      if ((qId === 2 || qId === 6) && answer === "supporter") leader--
      if (qId === 3 && answer === "collaborative") collaborative++
      if (qId === 3 && answer === "independent") collaborative--
      if (qId === 4 && answer === "creative") creative++
      if (qId === 4 && answer === "analytical") creative--
      if (qId === 5 && answer === "focused") focused++
      if (qId === 5 && answer === "distracted") focused--
      if (qId === 12 && answer === "interactive") {
        extrovert++
        collaborative++
      }
      if (qId === 12 && answer === "quiet") {
        extrovert--
        collaborative--
      }

      if (qId === 7 && answer === "visual") visual = true
      if (qId === 8 && answer === "auditory") auditory = true
      if (qId === 9 && answer === "reading") reading = true
      if (qId === 10 && answer === "kinesthetic") kinesthetic = true
      if (qId === 11 && answer === "visual-kinesthetic") {
        visual = true
        kinesthetic = true
      }
      if (qId === 11 && answer === "auditory-reading") {
        auditory = true
        reading = true
      }
    })

    return { extrovert, leader, collaborative, creative, focused, visual, auditory, reading, kinesthetic }
  }

  const getPersonalityArchetype = (scores: ReturnType<typeof calculatePersonalityScores>) => {
    if (scores.leader > 0 && scores.extrovert > 0) return "The Natural Leader"
    if (scores.creative > 0 && scores.collaborative > 0) return "The Creative Collaborator"
    if (scores.focused > 0 && scores.extrovert < 0) return "The Thoughtful Solver"
    if (scores.collaborative > 0 && scores.extrovert > 0) return "The Team Player"
    if (scores.focused > 0 && scores.creative > 0) return "The Innovative Thinker"
    return "The Balanced Learner"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Student Profile Dashboard</h1>
            <p className="text-gray-600">Analyze personality traits and learning styles</p>
          </div>
          <div className="flex gap-3">
            <Dialog open={showAddStudent} onOpenChange={setShowAddStudent}>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2 bg-transparent">
                  <UserPlus className="w-4 h-4" />
                  Add Student
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Student</DialogTitle>
                  <DialogDescription>Add a student manually with randomized personality traits</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="studentName">Student Name</Label>
                    <Input
                      id="studentName"
                      value={newStudentName}
                      onChange={(e) => setNewStudentName(e.target.value)}
                      placeholder="Enter student name"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={addManualStudent} disabled={!newStudentName.trim()}>
                      Add Student
                    </Button>
                    <Button variant="outline" onClick={() => setShowAddStudent(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={showImportStudents} onOpenChange={setShowImportStudents}>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2 bg-transparent">
                  <Upload className="w-4 h-4" />
                  Import Students
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Import Student List</DialogTitle>
                  <DialogDescription>
                    Enter student names (one per line) with randomized personality traits
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="importText">Student Names</Label>
                    <Textarea
                      id="importText"
                      value={importText}
                      onChange={(e) => setImportText(e.target.value)}
                      placeholder="John Smith&#10;Jane Doe&#10;Mike Johnson"
                      rows={8}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={importStudents} disabled={!importText.trim()}>
                      Import Students
                    </Button>
                    <Button variant="outline" onClick={() => setShowImportStudents(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Button onClick={exportToCSV} variant="outline" className="flex items-center gap-2 bg-transparent">
              <Download className="w-4 h-4" />
              Export CSV
            </Button>

            <Dialog open={showSeatingConfig} onOpenChange={setShowSeatingConfig}>
              <DialogTrigger asChild>
                <Button
                  disabled={students.length === 0}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                >
                  <Grid3X3 className="w-4 h-4" />
                  Generate Seating Chart
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Seating Chart Configuration</DialogTitle>
                  <DialogDescription>Configure how you want to organize your students</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="numGroups">Number of Groups</Label>
                    <Input
                      id="numGroups"
                      type="number"
                      min="1"
                      max="10"
                      value={numGroups}
                      onChange={(e) => setNumGroups(Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="studentsPerGroup">Students per Group</Label>
                    <Input
                      id="studentsPerGroup"
                      type="number"
                      min="2"
                      max="8"
                      value={studentsPerGroup}
                      onChange={(e) => setStudentsPerGroup(Number(e.target.value))}
                    />
                  </div>
                  <div className="text-sm text-gray-600">
                    Total capacity: {numGroups * studentsPerGroup} students
                    <br />
                    Available students: {students.length}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={generateSeatingChart}
                      disabled={generatingChart}
                      className="flex items-center gap-2"
                    >
                      {generatingChart ? <Loader2 className="w-4 h-4 animate-spin" /> : <Grid3X3 className="w-4 h-4" />}
                      Generate Chart
                    </Button>
                    <Button variant="outline" onClick={() => setShowSeatingConfig(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{students.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Extroverts</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {students.filter((s) => calculatePersonalityScores(s.answers).extrovert > 0).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Visual Learners</CardTitle>
              <Brain className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {students.filter((s) => calculatePersonalityScores(s.answers).visual).length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Student Profiles */}
        <Tabs defaultValue="profiles" className="space-y-6">
          <TabsList>
            <TabsTrigger value="profiles">Student Profiles</TabsTrigger>
            <TabsTrigger value="analytics">Class Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="profiles" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {students.map((student, index) => {
                const scores = calculatePersonalityScores(student.answers)
                const archetype = getPersonalityArchetype(scores)

                return (
                  <Card key={index} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{student.studentName}</CardTitle>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{student.aiAnalysis?.archetype || archetype}</Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeStudent(student.studentName)}
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

                          <div>
                            <h4 className="font-medium mb-2">Seating Recommendation</h4>
                            <p className="text-xs text-gray-600">
                              {student.aiAnalysis.seatingRecommendations.reasoning}
                            </p>
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
                            onClick={() => analyzeStudent(student)}
                            disabled={analyzingStudent === student.studentName}
                            size="sm"
                            className="w-full bg-purple-600 hover:bg-purple-700"
                          >
                            {analyzingStudent === student.studentName ? (
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
              })}
            </div>
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Class Analytics</CardTitle>
                <CardDescription>Overview of personality distribution in your class</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Analytics visualization coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
