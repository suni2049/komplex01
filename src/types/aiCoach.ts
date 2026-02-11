export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: string
}

export interface WorkoutContext {
  exerciseName: string
  description: string
  instructions: string[]
  primaryMuscles: string[]
  secondaryMuscles: string[]
  difficulty: string
  category: string
  phase: string
  blockName: string
  roundInfo: string
  repsOrDuration: string
}

export interface QuickAction {
  id: string
  label: string
  prompt: string
}

export interface AICoachError {
  type: 'network' | 'rate_limit' | 'invalid_key' | 'no_key' | 'unknown'
  message: string
  retryable: boolean
}
