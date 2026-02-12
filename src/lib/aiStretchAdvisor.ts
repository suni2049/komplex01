import { groqService } from './groqService'
import type { WorkoutPhase, WorkoutExercise } from '../types/workout'
import { analyzeMuscleLoad, getTopMuscles } from './stretchPairing'

export interface AIStretchAdvice {
  adjustments: StretchAdjustment[]
  reasoning: string
}

interface StretchAdjustment {
  stretchId: string
  newDurationSeconds?: number
  reason: string
}

/**
 * Build a summary of the workout for the AI to analyze.
 */
function buildWorkoutSummary(mainWorkout: WorkoutPhase): string {
  const lines: string[] = []
  for (const block of mainWorkout.blocks) {
    const exerciseList = block.exercises
      .map(we => {
        const reps = we.durationSeconds
          ? `${we.durationSeconds}s`
          : `${we.reps} reps${we.perSide ? ' each side' : ''}`
        return `  - ${we.exercise.name} (${reps}) [${we.exercise.primaryMuscles.join(', ')}]`
      })
      .join('\n')
    lines.push(`${block.name} (${block.rounds} rounds):\n${exerciseList}`)
  }
  return lines.join('\n\n')
}

function buildStretchList(exercises: WorkoutExercise[]): string {
  return exercises
    .map(we => {
      const dur = we.durationSeconds
        ? `${we.durationSeconds}s hold`
        : `${we.reps} reps${we.perSide ? ' each side' : ''}`
      return `- ${we.exercise.name} (${dur}) [targets: ${we.exercise.primaryMuscles.join(', ')}]`
    })
    .join('\n')
}

/**
 * Consult the AI to refine stretch selections and durations.
 * Returns adjustments and a human-readable reasoning string.
 * Falls back gracefully if the AI is unavailable or errors.
 */
export async function consultAIForStretches(
  mainWorkout: WorkoutPhase,
  warmUpExercises: WorkoutExercise[],
  coolDownExercises: WorkoutExercise[],
): Promise<AIStretchAdvice | null> {
  if (!groqService.isInitialized()) return null

  const muscleLoad = analyzeMuscleLoad(mainWorkout)
  const topMuscles = getTopMuscles(muscleLoad, 5)

  const prompt = `You are a sports recovery specialist. Analyze this workout and its paired stretches.

WORKOUT:
${buildWorkoutSummary(mainWorkout)}

MOST-LOADED MUSCLES (by volume): ${topMuscles.join(', ')}

WARM-UP STRETCHES:
${buildStretchList(warmUpExercises)}

COOL-DOWN STRETCHES:
${buildStretchList(coolDownExercises)}

Respond in this exact JSON format only, no other text:
{
  "adjustments": [
    { "stretchId": "exercise-id", "newDurationSeconds": 45, "reason": "brief reason" }
  ],
  "reasoning": "One sentence summary of the stretch pairing quality and any next-day soreness risks."
}`

  const systemPrompt = `You are a concise sports recovery AI. Respond ONLY with valid JSON. No markdown, no explanation outside the JSON. If the stretches are well-paired and no changes are needed, return an empty adjustments array. Focus on preventing next-day muscle soreness. Keep the reasoning under 30 words.`

  try {
    const { message, error } = await groqService.sendMessage(prompt, systemPrompt, [])

    if (error || !message) return null

    // Parse the JSON response — be tolerant of minor formatting issues
    const cleaned = message.replace(/```json?\n?/g, '').replace(/```/g, '').trim()
    const parsed = JSON.parse(cleaned)

    return {
      adjustments: Array.isArray(parsed.adjustments) ? parsed.adjustments : [],
      reasoning: typeof parsed.reasoning === 'string' ? parsed.reasoning : '',
    }
  } catch {
    // AI consultation is best-effort; never block workout generation
    return null
  }
}

/**
 * Apply AI adjustments to stretch exercises.
 * Mutates the exercise arrays in place for simplicity.
 */
export function applyAIAdjustments(
  warmUpExercises: WorkoutExercise[],
  coolDownExercises: WorkoutExercise[],
  advice: AIStretchAdvice,
): void {
  const allExercises = [...warmUpExercises, ...coolDownExercises]

  for (const adj of advice.adjustments) {
    const match = allExercises.find(we => we.exercise.id === adj.stretchId)
    if (match && adj.newDurationSeconds && adj.newDurationSeconds > 0) {
      // Only adjust timed exercises, cap at 90 seconds
      if (match.durationSeconds !== undefined) {
        match.durationSeconds = Math.min(adj.newDurationSeconds, 90)
      }
    }
  }
}
