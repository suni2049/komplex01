import type { WorkoutContext } from '../types/aiCoach'

interface FlatExercise {
  exercise: {
    exercise: {
      name: string
      description: string
      instructions: string[]
      primaryMuscles: string[]
      secondaryMuscles?: string[]
      difficulty: string
      category: string
    }
    reps?: number
    durationSeconds?: number
    perSide?: boolean
  }
  block: {
    name: string
  }
  phase: string
  roundNum: number
  totalRounds: number
}

export function buildWorkoutContext(current: FlatExercise): WorkoutContext {
  const { exercise, block, phase, roundNum, totalRounds } = current
  const { name, description, instructions, primaryMuscles, secondaryMuscles, difficulty, category } =
    exercise.exercise

  // Format reps or duration
  let repsOrDuration: string
  if (exercise.durationSeconds) {
    repsOrDuration = `${exercise.durationSeconds} seconds`
  } else {
    const repsText = `${exercise.reps} reps`
    repsOrDuration = exercise.perSide ? `${repsText} each side` : repsText
  }

  // Format round info
  const roundInfo = `Round ${roundNum} of ${totalRounds}`

  return {
    exerciseName: name,
    description,
    instructions,
    primaryMuscles,
    secondaryMuscles: secondaryMuscles || [],
    difficulty,
    category,
    phase,
    blockName: block.name,
    roundInfo,
    repsOrDuration,
  }
}

export function buildSystemPrompt(context: WorkoutContext): string {
  const instructionsList = context.instructions.map((inst, i) => `${i + 1}. ${inst}`).join('\n')

  return `You are a tactical fitness coach with military-style communication.
Be direct, motivating, and concise. Keep responses under 150 words unless asked for more detail.

CURRENT EXERCISE CONTEXT:
Name: ${context.exerciseName}
Description: ${context.description}
Instructions:
${instructionsList}

Primary Muscles: ${context.primaryMuscles.join(', ')}
${context.secondaryMuscles.length > 0 ? `Secondary Muscles: ${context.secondaryMuscles.join(', ')}` : ''}
Difficulty: ${context.difficulty}
Category: ${context.category}
Phase: ${context.phase}
Block: ${context.blockName}
${context.roundInfo}
Target: ${context.repsOrDuration}

Answer questions about form, technique, modifications, and motivation.
Use tactical language when appropriate. Be encouraging but professional.
Focus on actionable advice and clear explanations.`
}
