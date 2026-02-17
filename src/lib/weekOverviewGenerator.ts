import { groqService } from './groqService'
import type { WorkoutPlan } from '../types/workout'

export async function generateWeekOverview(
  plans: WorkoutPlan[],
  rotationStrategy: string
): Promise<string | null> {
  if (!groqService.isInitialized()) return null

  const weekSummary = plans.map(p =>
    `${p.dayLabel}: ${p.focus.toUpperCase()} - ${p.workout.totalExerciseCount} exercises, ${p.workout.totalEstimatedMinutes} min`
  ).join('\n')

  const prompt = `Analyze this 7-day workout plan and provide a motivational 2-3 sentence overview.

WEEK PLAN (${rotationStrategy.toUpperCase()}):
${weekSummary}

Focus on:
- Overall training strategy and muscle group balance
- Progressive intensity or recovery patterns
- Brief motivational hook (military/tactical tone)

Keep it under 50 words. Be concise and direct.`

  const systemPrompt = `You are a tactical fitness advisor. Respond with a brief, motivational overview in military tone. No fluff, just facts and encouragement. 2-3 sentences max.`

  try {
    const { message, error } = await groqService.sendMessage(prompt, systemPrompt, [])
    if (error || !message) return null
    return message.trim()
  } catch (error) {
    console.warn('AI overview generation failed:', error)
    return null
  }
}
