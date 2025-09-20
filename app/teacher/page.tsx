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
import { Users, Download, Brain, BarChart3, Loader2, Upload, UserPlus, ArrowLeft } from "lucide-react"

import { StudentCard } from "@/components/student-card"
import { GroupCard } from "@/components/group-card"
import type { StudentResult, Group } from "@/types/student"
import { calculatePersonalityScores, getPersonalityArchetype, generateRandomAnswers } from "@/utils/personality"

export default function TeacherDashboard() {
  const [students, setStudents] = useState<StudentResult[]>([])
  const [groups, setGroups] = useState<Group[]>([])
  const [analyzingStudent, setAnalyzingStudent] = useState<string | null>(null)
  const [generatingGroups, setGeneratingGroups] = useState(false)
  const [showAddStudent, setShowAddStudent] = useState(false)
  const [showImportStudents, setShowImportStudents] = useState(false)
  const [showGroupConfig, setShowGroupConfig] = useState(false)
  const [newStudentName, setNewStudentName] = useState("")
  const [importText, setImportText] = useState("")
  const [numGroups, setNumGroups] = useState(6)
  const [studentsPerGroup, setStudentsPerGroup] = useState(4)
  const [editingGroup, setEditingGroup] = useState<string | null>(null)
  const [editGroupName, setEditGroupName] = useState("")

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

    // Load groups from localStorage
    const savedGroups = localStorage.getItem("classroom_groups")
    if (savedGroups) {
      setGroups(JSON.parse(savedGroups))
    }
  }, [])

  const removeStudent = (studentName: string) => {
    // Remove from localStorage
    localStorage.removeItem(`student_${studentName}`)
    // Update state
    setStudents((prev) => prev.filter((s) => s.studentName !== studentName))
    // Remove from groups
    setGroups((prev) =>
      prev.map((group) => ({
        ...group,
        students: group.students.filter((s) => s !== studentName),
      })),
    )
  }

  const addManualStudent = () => {
    if (!newStudentName.trim()) return

    const newStudent: StudentResult = {
      studentName: newStudentName.trim(),
      answers: generateRandomAnswers(),
      timestamp: new Date().toISOString(),
    }

    localStorage.setItem(`student_${newStudentName.trim()}`, JSON.stringify(newStudent))
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

    const newStudents = names.map((name) => ({
      studentName: name,
      answers: generateRandomAnswers(),
      timestamp: new Date().toISOString(),
    }))

    newStudents.forEach((student) => {
      localStorage.setItem(`student_${student.studentName}`, JSON.stringify(student))
    })

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
      localStorage.setItem(`student_${student.studentName}`, JSON.stringify(updatedStudent))
      setStudents((prev) => prev.map((s) => (s.studentName === student.studentName ? updatedStudent : s)))
    } catch (error) {
      console.error("Error analyzing student:", error)
    } finally {
      setAnalyzingStudent(null)
    }
  }

  const generateGroups = async () => {
    const totalCapacity = numGroups * studentsPerGroup
    const totalStudents = students.length

    if (totalCapacity < totalStudents) {
      alert(
        `Configuration impossible: You have ${totalStudents} students but your configuration (${numGroups} groups × ${studentsPerGroup} students per group) only has capacity for ${totalCapacity} students.\n\nPlease either:\n• Increase number of groups to ${Math.ceil(totalStudents / studentsPerGroup)}\n• Increase students per group to ${Math.ceil(totalStudents / numGroups)}\n• Or adjust both values`,
      )
      return
    }

    if (totalStudents === 0) {
      alert("No students available to create groups. Please add students first.")
      return
    }

    setGeneratingGroups(true)
    try {
      const studentsWithScores = students.map((student) => ({
        ...student,
        scores: calculatePersonalityScores(student.answers),
      }))

      const newGroups: Group[] = []
      const availableStudents = [...studentsWithScores]

      for (let g = 0; g < numGroups && availableStudents.length > 0; g++) {
        const groupStudents = []

        // Select first student randomly
        const firstStudent = availableStudents.splice(Math.floor(Math.random() * availableStudents.length), 1)[0]
        groupStudents.push(firstStudent)

        // Select remaining students based on compatibility
        for (let s = 1; s < studentsPerGroup && availableStudents.length > 0; s++) {
          let bestMatch = 0
          let bestIndex = 0

          availableStudents.forEach((student, index) => {
            let compatibility = 0
            groupStudents.forEach((groupMember) => {
              // Prefer mixing introverts and extroverts
              if (student.scores.extrovert !== groupMember.scores.extrovert) compatibility += 2
              // Distribute leaders across groups
              if (student.scores.leader !== groupMember.scores.leader) compatibility += 2
              // Group collaborative students together
              if (student.scores.collaborative === groupMember.scores.collaborative && student.scores.collaborative > 0)
                compatibility += 3
              // Mix learning styles
              if (student.scores.visual === groupMember.scores.visual) compatibility += 1
            })

            if (compatibility > bestMatch) {
              bestMatch = compatibility
              bestIndex = index
            }
          })

          groupStudents.push(availableStudents.splice(bestIndex, 1)[0])
        }

        const groupTraits = {
          extroverts: groupStudents.filter((s) => s.scores.extrovert > 0).length,
          leaders: groupStudents.filter((s) => s.scores.leader > 0).length,
          collaborative: groupStudents.filter((s) => s.scores.collaborative > 0).length,
          visualLearners: groupStudents.filter((s) => s.scores.visual).length,
        }

        const group: Group = {
          id: `group-${g + 1}`,
          name: `Group ${g + 1}`,
          students: groupStudents.map((s) => s.studentName),
          traits: groupTraits,
        }

        newGroups.push(group)
      }

      setGroups(newGroups)
      localStorage.setItem("classroom_groups", JSON.stringify(newGroups))
      setShowGroupConfig(false)
    } catch (error) {
      console.error("Error generating groups:", error)
    } finally {
      setGeneratingGroups(false)
    }
  }

  const removeGroup = (groupId: string) => {
    const updatedGroups = groups.filter((group) => group.id !== groupId)
    setGroups(updatedGroups)
    localStorage.setItem("classroom_groups", JSON.stringify(updatedGroups))
  }

  const updateGroupName = (groupId: string, newName: string) => {
    const updatedGroups = groups.map((group) => (group.id === groupId ? { ...group, name: newName } : group))
    setGroups(updatedGroups)
    localStorage.setItem("classroom_groups", JSON.stringify(updatedGroups))
    setEditingGroup(null)
    setEditGroupName("")
  }

  const removeStudentFromGroup = (groupId: string, studentName: string) => {
    const updatedGroups = groups.map((group) =>
      group.id === groupId ? { ...group, students: group.students.filter((s) => s !== studentName) } : group,
    )
    setGroups(updatedGroups)
    localStorage.setItem("classroom_groups", JSON.stringify(updatedGroups))
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => (window.location.href = "/")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Teacher Dashboard</h1>
              <p className="text-gray-600">Manage students and create optimal learning groups</p>
            </div>
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

            <Dialog open={showGroupConfig} onOpenChange={setShowGroupConfig}>
              <DialogTrigger asChild>
                <Button
                  disabled={students.length === 0}
                  className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700"
                >
                  <Users className="w-4 h-4" />
                  Create Groups
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Group Configuration</DialogTitle>
                  <DialogDescription>Configure how you want to organize your students into groups</DialogDescription>
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
                    {numGroups * studentsPerGroup < students.length && (
                      <div className="text-red-600 font-medium mt-1">⚠️ Not enough capacity for all students!</div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={generateGroups}
                      disabled={generatingGroups || numGroups * studentsPerGroup < students.length}
                      className="flex items-center gap-2"
                    >
                      {generatingGroups ? <Loader2 className="w-4 h-4 animate-spin" /> : <Users className="w-4 h-4" />}
                      Create Groups
                    </Button>
                    <Button variant="outline" onClick={() => setShowGroupConfig(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
              <CardTitle className="text-sm font-medium">Active Groups</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{groups.length}</div>
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

        {/* Main Content Tabs */}
        <Tabs defaultValue="profiles" className="space-y-6">
          <TabsList>
            <TabsTrigger value="profiles">Student Profiles</TabsTrigger>
            <TabsTrigger value="groups">Groups</TabsTrigger>
            <TabsTrigger value="analytics">Class Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="profiles" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {students.map((student, index) => (
                <StudentCard
                  key={index}
                  student={student}
                  onRemove={removeStudent}
                  onAnalyze={analyzeStudent}
                  isAnalyzing={analyzingStudent === student.studentName}
                  calculatePersonalityScores={calculatePersonalityScores}
                  getPersonalityArchetype={getPersonalityArchetype}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="groups" className="space-y-6">
            {groups.length === 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle>No Groups Created</CardTitle>
                  <CardDescription>Create groups to organize your students for collaborative learning</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={() => setShowGroupConfig(true)}
                    disabled={students.length === 0}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Create First Group
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {groups.map((group) => (
                  <GroupCard
                    key={group.id}
                    group={group}
                    editingGroup={editingGroup}
                    editGroupName={editGroupName}
                    onStartEdit={(groupId, currentName) => {
                      setEditingGroup(groupId)
                      setEditGroupName(currentName)
                    }}
                    onSaveEdit={updateGroupName}
                    onCancelEdit={() => {
                      setEditingGroup(null)
                      setEditGroupName("")
                    }}
                    onRemoveGroup={removeGroup}
                    onRemoveStudentFromGroup={removeStudentFromGroup}
                    setEditGroupName={setEditGroupName}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="analytics">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Personality Distribution</CardTitle>
                  <CardDescription>Overview of personality traits in your class</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Extroverts vs Introverts</span>
                      <div className="flex gap-2">
                        <Badge variant="outline" className="bg-green-50 text-green-700">
                          {students.filter((s) => calculatePersonalityScores(s.answers).extrovert > 0).length}{" "}
                          Extroverts
                        </Badge>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700">
                          {students.filter((s) => calculatePersonalityScores(s.answers).extrovert <= 0).length}{" "}
                          Introverts
                        </Badge>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Leaders vs Supporters</span>
                      <div className="flex gap-2">
                        <Badge variant="outline" className="bg-purple-50 text-purple-700">
                          {students.filter((s) => calculatePersonalityScores(s.answers).leader > 0).length} Leaders
                        </Badge>
                        <Badge variant="outline" className="bg-orange-50 text-orange-700">
                          {students.filter((s) => calculatePersonalityScores(s.answers).leader <= 0).length} Supporters
                        </Badge>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Work Style Preference</span>
                      <div className="flex gap-2">
                        <Badge variant="outline" className="bg-teal-50 text-teal-700">
                          {students.filter((s) => calculatePersonalityScores(s.answers).collaborative > 0).length}{" "}
                          Collaborative
                        </Badge>
                        <Badge variant="outline" className="bg-indigo-50 text-indigo-700">
                          {students.filter((s) => calculatePersonalityScores(s.answers).collaborative <= 0).length}{" "}
                          Independent
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Learning Styles</CardTitle>
                  <CardDescription>Distribution of learning preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Visual Learners</span>
                      <Badge variant="outline" className="bg-pink-50 text-pink-700">
                        {students.filter((s) => calculatePersonalityScores(s.answers).visual).length} students
                      </Badge>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Auditory Learners</span>
                      <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                        {students.filter((s) => calculatePersonalityScores(s.answers).auditory).length} students
                      </Badge>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Reading/Writing Learners</span>
                      <Badge variant="outline" className="bg-cyan-50 text-cyan-700">
                        {students.filter((s) => calculatePersonalityScores(s.answers).reading).length} students
                      </Badge>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Kinesthetic Learners</span>
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700">
                        {students.filter((s) => calculatePersonalityScores(s.answers).kinesthetic).length} students
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Group Summary</CardTitle>
                  <CardDescription>Overview of current group configurations</CardDescription>
                </CardHeader>
                <CardContent>
                  {groups.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">
                      No groups created yet. Create groups to see analytics.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {groups.map((group) => (
                        <div key={group.id} className="border rounded-lg p-4 space-y-2">
                          <h4 className="font-medium">{group.name}</h4>
                          <div className="text-sm text-gray-600">
                            <div>Students: {group.students.length}</div>
                            <div>Extroverts: {group.traits.extroverts}</div>
                            <div>Leaders: {group.traits.leaders}</div>
                            <div>Collaborative: {group.traits.collaborative}</div>
                            <div>Visual Learners: {group.traits.visualLearners}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
