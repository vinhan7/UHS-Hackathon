"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { GraduationCap, Users, Brain, BarChart3, ArrowLeft, User } from "lucide-react"

import { PersonalityRadarChart } from "@/components/personality-radar-chart"
import type { StudentResult } from "@/types/student"
import { calculatePersonalityScores, getPersonalityArchetype } from "@/utils/personality"
import { questions } from "@/data/quiz-questions"

export default function StudentPortal() {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [studentName, setStudentName] = useState("")
  const [showNameInput, setShowNameInput] = useState(true)
  const [isComplete, setIsComplete] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [studentData, setStudentData] = useState<StudentResult | null>(null)

  const progress = ((currentQuestion + 1) / questions.length) * 100

  useEffect(() => {
    // Check if student already has data
    const existingData = localStorage.getItem(`student_${studentName}`)
    if (existingData && studentName) {
      setStudentData(JSON.parse(existingData))
    }
  }, [studentName])

  const handleAnswer = (value: string) => {
    setAnswers((prev) => ({ ...prev, [questions[currentQuestion].id]: value }))
  }

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1)
    } else {
      setIsComplete(true)
      // Store results in localStorage
      const results = {
        studentName,
        answers,
        timestamp: new Date().toISOString(),
      }
      localStorage.setItem(`student_${studentName}`, JSON.stringify(results))
      setStudentData(results)
    }
  }

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1)
    }
  }

  const startQuiz = () => {
    if (studentName.trim()) {
      setShowNameInput(false)
    }
  }

  const viewProfile = () => {
    setShowProfile(true)
  }

  if (showNameInput) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Button variant="ghost" className="absolute top-4 left-4" onClick={() => (window.location.href = "/")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="mx-auto mb-4 w-16 h-16 bg-green-600 rounded-full flex items-center justify-center">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">Student Portal</CardTitle>
            <CardDescription className="text-gray-600">
              Take the personality quiz to help your teacher understand your learning style
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                Your Name
              </Label>
              <input
                id="name"
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Enter your full name"
              />
            </div>
            {studentData && (
              <div className="p-3 bg-blue-50 rounded-md">
                <p className="text-sm text-blue-700">
                  Welcome back! You completed the quiz on {new Date(studentData.timestamp).toLocaleDateString()}
                </p>
                <Button
                  onClick={viewProfile}
                  variant="outline"
                  size="sm"
                  className="mt-2 w-full bg-transparent border-blue-300 text-blue-700 hover:bg-blue-100"
                >
                  View My Profile
                </Button>
              </div>
            )}
            <Button
              onClick={startQuiz}
              className="w-full bg-green-600 hover:bg-green-700"
              disabled={!studentName.trim()}
            >
              {studentData ? "Retake Quiz" : "Start Quiz"}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (showProfile && studentData) {
    const scores = calculatePersonalityScores(studentData.answers)
    const archetype = getPersonalityArchetype(scores)

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-4xl mx-auto">
          <Button variant="ghost" className="mb-6" onClick={() => setShowProfile(false)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Profile Info */}
            <Card>
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl">{studentData.studentName}</CardTitle>
                <Badge variant="secondary" className="text-lg px-4 py-1">
                  {archetype}
                </Badge>
                <CardDescription>
                  Profile completed on {new Date(studentData.timestamp).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {studentData.aiAnalysis ? (
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2 text-gray-900">About Your Learning Style</h3>
                      <p className="text-gray-600 leading-relaxed">{studentData.aiAnalysis.description}</p>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2 text-green-700">Your Strengths</h3>
                      <div className="flex flex-wrap gap-2">
                        {studentData.aiAnalysis.strengths.map((strength: string, i: number) => (
                          <Badge key={i} variant="outline" className="bg-green-50 text-green-700">
                            {strength}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2 text-blue-700">Learning Style</h3>
                      <p className="text-gray-600 mb-2">{studentData.aiAnalysis.learningStyle.primary}</p>
                      <div className="space-y-1">
                        {studentData.aiAnalysis.learningStyle.recommendations.map((rec: string, i: number) => (
                          <div key={i} className="text-sm text-gray-600">
                            • {rec}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-3 text-gray-900">Your Learning Styles</h3>
                      <div className="flex flex-wrap gap-2">
                        {scores.visual && <Badge variant="outline">Visual</Badge>}
                        {scores.auditory && <Badge variant="outline">Auditory</Badge>}
                        {scores.reading && <Badge variant="outline">Reading/Writing</Badge>}
                        {scores.kinesthetic && <Badge variant="outline">Kinesthetic</Badge>}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Personality Profile</CardTitle>
                <CardDescription>Your traits on a 0-100 scale</CardDescription>
              </CardHeader>
              <CardContent>
                <PersonalityRadarChart scores={scores} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  // ... existing code for quiz interface ...

  if (isComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="mx-auto mb-4 w-16 h-16 bg-green-600 rounded-full flex items-center justify-center">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">Quiz Complete!</CardTitle>
            <CardDescription className="text-gray-600">
              Thank you, {studentName}! Your responses have been recorded.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Your teacher will use this information to create the best learning environment for you.
            </p>
            <div className="space-y-2">
              <Button onClick={viewProfile} className="w-full bg-blue-600 hover:bg-blue-700">
                View My Profile
              </Button>
              <Button onClick={() => (window.location.href = "/")} variant="outline" className="w-full bg-transparent">
                Back to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const currentQ = questions[currentQuestion]
  const selectedAnswer = answers[currentQ.id]

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4">
      <div className="max-w-2xl mx-auto">
        <Button variant="ghost" className="mb-6" onClick={() => (window.location.href = "/")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Users className="w-6 h-6 text-green-600" />
            <h1 className="text-2xl font-bold text-gray-900">Personality Assessment</h1>
          </div>
          <p className="text-gray-600">
            Question {currentQuestion + 1} of {questions.length}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question Card */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-green-600">{currentQ.category}</span>
            </div>
            <CardTitle className="text-xl text-gray-900">{currentQ.question}</CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup value={selectedAnswer} onValueChange={handleAnswer}>
              {currentQ.options.map((option, index) => (
                <div
                  key={option.value}
                  className="flex items-center space-x-2 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <RadioGroupItem value={option.value} id={option.value} />
                  <Label htmlFor={option.value} className="flex-1 cursor-pointer text-gray-700 leading-relaxed">
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={prevQuestion}
            disabled={currentQuestion === 0}
            className="px-6 bg-transparent"
          >
            Previous
          </Button>
          <Button onClick={nextQuestion} disabled={!selectedAnswer} className="px-6 bg-green-600 hover:bg-green-700">
            {currentQuestion === questions.length - 1 ? "Complete Quiz" : "Next Question"}
          </Button>
        </div>
      </div>
    </div>
  )
}
