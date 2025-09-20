import { z } from "zod"

const personalityAnalysisSchema = z.object({
  archetype: z.string().describe('Personality archetype name like "The Creative Collaborator"'),
  description: z.string().describe("One paragraph personality description"),
  strengths: z.array(z.string()).describe("Key strengths and positive traits"),
  challenges: z.array(z.string()).describe("Potential challenges or areas for growth"),
  learningStyle: z.object({
    primary: z.string().describe("Primary learning style"),
    secondary: z.string().optional().describe("Secondary learning style"),
    recommendations: z.array(z.string()).describe("Teaching recommendations for this student"),
  }),
  collaborationMatches: z.array(z.string()).describe("Types of students they work well with"),
  collaborationChallenges: z.array(z.string()).describe("Types of students they might clash with"),
  seatingRecommendations: z.object({
    position: z.enum(["front", "middle", "back"]).describe("Recommended seating position"),
    proximity: z.enum(["near-teacher", "with-peers", "quiet-area"]).describe("Proximity preference"),
    reasoning: z.string().describe("Why this seating arrangement works best"),
  }),
  teachingStrategies: z.array(z.string()).describe("Specific strategies to help this student succeed"),
})

export async function POST(req: Request) {
  try {
    const { studentName, answers } = await req.json()

    const personalityData = analyzeAnswers(answers)

    const mockAnalysis = {
      archetype: getArchetypeFromData(personalityData),
      description: `${studentName} demonstrates a ${personalityData.extroversion.toLowerCase()} personality with ${personalityData.leadership.toLowerCase()} tendencies. They prefer ${personalityData.collaboration.toLowerCase()} work environments and show ${personalityData.problemSolving.toLowerCase()} problem-solving approaches.`,
      strengths: getStrengthsFromData(personalityData),
      challenges: getChallengesFromData(personalityData),
      learningStyle: {
        primary: getPrimaryLearningStyle(personalityData),
        recommendations: getRecommendationsFromData(personalityData),
      },
      collaborationMatches: getCollaborationMatches(personalityData),
      collaborationChallenges: getCollaborationChallenges(personalityData),
      seatingRecommendations: {
        position: getSeatingPosition(personalityData),
        proximity: getProximityPreference(personalityData),
        reasoning: getSeatingReasoning(personalityData),
      },
      teachingStrategies: getTeachingStrategies(personalityData),
    }

    return Response.json({ analysis: mockAnalysis })
  } catch (error) {
    console.error("Error analyzing personality:", error)
    return Response.json({ error: "Failed to analyze personality" }, { status: 500 })
  }
}

function analyzeAnswers(answers: Record<number, string>) {
  let extroversion = 0,
    leadership = 0,
    collaboration = 0,
    problemSolving = "",
    focus = ""
  let visual = false,
    auditory = false,
    reading = false,
    kinesthetic = false
  let seatingPreference = ""

  Object.entries(answers).forEach(([questionId, answer]) => {
    const qId = Number.parseInt(questionId)

    switch (qId) {
      case 1:
        extroversion += answer === "extrovert" ? 1 : -1
        break
      case 2:
      case 6:
        leadership += answer === "leader" ? 1 : -1
        break
      case 3:
        collaboration += answer === "collaborative" ? 1 : -1
        break
      case 4:
        problemSolving = answer === "creative" ? "Creative" : "Analytical"
        break
      case 5:
        focus = answer === "focused" ? "Highly Focused" : "Easily Distracted"
        break
      case 7:
        visual = answer === "visual"
        break
      case 8:
        auditory = answer === "auditory"
        break
      case 9:
        reading = answer === "reading"
        break
      case 10:
        kinesthetic = answer === "kinesthetic"
        break
      case 11:
        if (answer === "visual-kinesthetic") {
          visual = true
          kinesthetic = true
        } else if (answer === "auditory-reading") {
          auditory = true
          reading = true
        }
        break
      case 12:
        seatingPreference = answer === "interactive" ? "Interactive/Social" : "Quiet/Independent"
        if (answer === "interactive") {
          extroversion++
          collaboration++
        } else {
          extroversion--
          collaboration--
        }
        break
    }
  })

  return {
    extroversion: extroversion > 0 ? "Extroverted" : "Introverted",
    leadership: leadership > 0 ? "Natural Leader" : "Supportive Follower",
    collaboration: collaboration > 0 ? "Collaborative" : "Independent",
    problemSolving,
    focus,
    visual,
    auditory,
    reading,
    kinesthetic,
    seatingPreference,
  }
}

// Helper functions for mock analysis
function getArchetypeFromData(data: any): string {
  if (data.leadership === "Natural Leader" && data.extroversion === "Extroverted") return "The Natural Leader"
  if (data.problemSolving === "Creative" && data.collaboration === "Collaborative") return "The Creative Collaborator"
  if (data.focus === "Highly Focused" && data.extroversion === "Introverted") return "The Thoughtful Solver"
  if (data.collaboration === "Collaborative" && data.extroversion === "Extroverted") return "The Team Player"
  if (data.focus === "Highly Focused" && data.problemSolving === "Creative") return "The Innovative Thinker"
  return "The Balanced Learner"
}

function getStrengthsFromData(data: any): string[] {
  const strengths = []
  if (data.extroversion === "Extroverted") strengths.push("Strong communication skills")
  if (data.leadership === "Natural Leader") strengths.push("Leadership abilities")
  if (data.collaboration === "Collaborative") strengths.push("Team collaboration")
  if (data.problemSolving === "Creative") strengths.push("Creative thinking")
  if (data.focus === "Highly Focused") strengths.push("Strong focus and attention")
  return strengths.slice(0, 3)
}

function getChallengesFromData(data: any): string[] {
  const challenges = []
  if (data.extroversion === "Introverted") challenges.push("May need encouragement to participate")
  if (data.focus === "Easily Distracted") challenges.push("Difficulty maintaining focus")
  if (data.collaboration === "Independent") challenges.push("May prefer working alone")
  return challenges.slice(0, 2)
}

function getPrimaryLearningStyle(data: any): string {
  const styles = []
  if (data.visual) styles.push("Visual")
  if (data.auditory) styles.push("Auditory")
  if (data.kinesthetic) styles.push("Kinesthetic")
  if (data.reading) styles.push("Reading/Writing")
  return styles.length > 0 ? styles.join("-") + " Learner" : "Multi-modal Learner"
}

function getRecommendationsFromData(data: any): string[] {
  const recommendations = []
  if (data.visual) recommendations.push("Use visual aids and diagrams")
  if (data.auditory) recommendations.push("Incorporate verbal explanations")
  if (data.kinesthetic) recommendations.push("Provide hands-on activities")
  if (data.reading) recommendations.push("Offer written materials")
  return recommendations
}

function getCollaborationMatches(data: any): string[] {
  const matches = []
  if (data.collaboration === "Collaborative") matches.push("Other collaborative students")
  if (data.extroversion === "Extroverted") matches.push("Outgoing personalities")
  if (data.problemSolving === "Creative") matches.push("Creative thinkers")
  return matches
}

function getCollaborationChallenges(data: any): string[] {
  const challenges = []
  if (data.extroversion === "Extroverted") challenges.push("Very quiet students")
  if (data.problemSolving === "Creative") challenges.push("Highly structured thinkers")
  return challenges
}

function getSeatingPosition(data: any): "front" | "middle" | "back" {
  if (data.focus === "Easily Distracted") return "front"
  if (data.extroversion === "Extroverted") return "middle"
  return "middle"
}

function getProximityPreference(data: any): "near-teacher" | "with-peers" | "quiet-area" {
  if (data.focus === "Easily Distracted") return "near-teacher"
  if (data.collaboration === "Collaborative") return "with-peers"
  return "quiet-area"
}

function getSeatingReasoning(data: any): string {
  if (data.focus === "Easily Distracted") return "Close to teacher to minimize distractions and maximize engagement"
  if (data.collaboration === "Collaborative") return "Near peers to facilitate group work and discussion"
  return "Positioned to balance focus and social interaction"
}

function getTeachingStrategies(data: any): string[] {
  const strategies = []
  if (data.extroversion === "Extroverted") strategies.push("Encourage class participation")
  if (data.visual) strategies.push("Use visual presentations")
  if (data.collaboration === "Collaborative") strategies.push("Assign group projects")
  if (data.problemSolving === "Creative") strategies.push("Allow creative expression")
  return strategies
}
