import { z } from "zod"

const seatingChartSchema = z.object({
  layout: z
    .array(
      z.array(
        z
          .object({
            studentName: z.string(),
            reasoning: z.string().describe("Why this student is placed here"),
          })
          .nullable(),
      ),
    )
    .describe("2D array representing classroom seating arrangement"),
  recommendations: z.array(z.string()).describe("General recommendations for this seating arrangement"),
  considerations: z.object({
    personalityBalance: z.string().describe("How personalities are balanced"),
    learningStyleMix: z.string().describe("How learning styles are distributed"),
    collaborationOpportunities: z.string().describe("Collaboration opportunities created"),
  }),
})

export async function POST(req: Request) {
  try {
    const { students, classroomLayout } = await req.json()

    // Default to 6x5 classroom if no layout specified
    const rows = classroomLayout?.rows || 5
    const cols = classroomLayout?.cols || 6

    const studentProfiles = students.map((student: any) => {
      const scores = calculatePersonalityScores(student.answers)
      return {
        name: student.studentName,
        extroversion: scores.extrovert > 0 ? "extrovert" : "introvert",
        leadership: scores.leader > 0 ? "leader" : "supporter",
        collaboration: scores.collaborative > 0 ? "collaborative" : "independent",
        focus: scores.focused > 0 ? "focused" : "distractible",
        learningStyles: {
          visual: scores.visual,
          auditory: scores.auditory,
          reading: scores.reading,
          kinesthetic: scores.kinesthetic,
        },
      }
    })

    const mockSeatingChart = generateMockSeatingChart(studentProfiles, rows, cols)

    return Response.json({ seatingChart: mockSeatingChart })
  } catch (error) {
    console.error("Error generating seating chart:", error)
    return Response.json({ error: "Failed to generate seating chart" }, { status: 500 })
  }
}

function generateMockSeatingChart(studentProfiles: any[], rows: number, cols: number) {
  const layout = Array(rows)
    .fill(null)
    .map(() => Array(cols).fill(null))

  // Shuffle students for random placement
  const shuffledStudents = [...studentProfiles].sort(() => Math.random() - 0.5)

  let studentIndex = 0

  // Fill seats with students
  for (let row = 0; row < rows && studentIndex < shuffledStudents.length; row++) {
    for (let col = 0; col < cols && studentIndex < shuffledStudents.length; col++) {
      const student = shuffledStudents[studentIndex]
      layout[row][col] = {
        studentName: student.name,
        reasoning: `Positioned to optimize ${student.extroversion === "extrovert" ? "social interaction" : "focused learning"} and support ${student.collaboration} work style`,
      }
      studentIndex++
    }
  }

  return {
    layout,
    recommendations: [
      "Monitor student interactions and adjust as needed",
      "Consider rotating seating monthly for variety",
      "Use this arrangement for group activities",
      "Place visual aids where all students can see clearly",
    ],
    considerations: {
      personalityBalance:
        "Extroverts and introverts are distributed to create balanced energy levels throughout the classroom",
      learningStyleMix:
        "Visual, auditory, and kinesthetic learners are mixed to encourage peer learning and diverse perspectives",
      collaborationOpportunities:
        "Collaborative students are positioned to facilitate group work while independent learners have space to focus",
    },
  }
}

function calculatePersonalityScores(answers: Record<number, string>) {
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
