export interface StudentResult {
  studentName: string
  answers: Record<number, string>
  timestamp: string
  aiAnalysis?: AIAnalysis
}

export interface AIAnalysis {
  archetype: string
  description: string
  strengths: string[]
  challenges: string[]
  learningStyle: {
    primary: string
    recommendations: string[]
  }
  collaborationMatches: string[]
  collaborationChallenges: string[]
  seatingRecommendations: {
    position: string
    proximity: string
    reasoning: string
  }
  teachingStrategies: string[]
}

export interface Group {
  id: string
  name: string
  students: string[]
  traits: {
    extroverts: number
    leaders: number
    collaborative: number
    visualLearners: number
  }
}

export interface PersonalityScores {
  extrovert: number
  leader: number
  collaborative: number
  creative: number
  focused: number
  visual: boolean
  auditory: boolean
  reading: boolean
  kinesthetic: boolean
}
