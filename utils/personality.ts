import type { PersonalityScores } from "@/types/student"

export const calculatePersonalityScores = (answers: Record<number, string>): PersonalityScores => {
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

export const getPersonalityArchetype = (scores: PersonalityScores): string => {
  if (scores.leader > 0 && scores.extrovert > 0) return "The Natural Leader"
  if (scores.creative > 0 && scores.collaborative > 0) return "The Creative Collaborator"
  if (scores.focused > 0 && scores.extrovert < 0) return "The Thoughtful Solver"
  if (scores.collaborative > 0 && scores.extrovert > 0) return "The Team Player"
  if (scores.focused > 0 && scores.creative > 0) return "The Innovative Thinker"
  return "The Balanced Learner"
}

export const generateRandomAnswers = (): Record<number, string> => {
  return {
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
}
