"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { GraduationCap, Users, BookOpen } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-4xl mx-auto text-center">
        <div className="mb-8">
          <div className="mx-auto mb-6 w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center">
            <GraduationCap className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">AI Education Platform</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Analyze student personalities and create optimal learning environments with AI-powered insights
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {/* Student Interface */}
          <Card
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => (window.location.href = "/student")}
          >
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 bg-green-600 rounded-full flex items-center justify-center">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-xl">Student Portal</CardTitle>
              <CardDescription>Take the personality quiz and view your learning profile</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-green-600 hover:bg-green-700">Enter as Student</Button>
            </CardContent>
          </Card>

          {/* Teacher Interface */}
          <Card
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => (window.location.href = "/teacher")}
          >
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center">
                <Users className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-xl">Teacher Dashboard</CardTitle>
              <CardDescription>Manage students, analyze profiles, and create optimal groups</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-purple-600 hover:bg-purple-700">Enter as Teacher</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
