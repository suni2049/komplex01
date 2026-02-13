import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { groqService } from '../lib/groqService'
import { useSettings } from '../hooks/useSettings'
import { useWorkoutHistory } from '../hooks/useWorkoutHistory'
import { analyzeWorkoutHistory, buildCoachContext } from '../lib/workoutHistoryAnalyzer'
import { generateWorkout } from '../lib/workoutGenerator'
import ChatMessage from '../components/aicoach/ChatMessage'
import ChatInput from '../components/aicoach/ChatInput'
import WorkoutPreview from '../components/workout/WorkoutPreview'
import { IconTarget, IconLightning, IconChart, IconRecovery } from '../components/icons/Icons'
import { nanoid } from 'nanoid'
import type { ChatMessage as ChatMessageType, AICoachError } from '../types/aiCoach'
import type { WorkoutConfig, GeneratedWorkout } from '../types/workout'

interface QuickCoachAction {
  id: string
  label: string
  prompt: string
  IconComponent: React.ComponentType<{ className?: string }>
}

const QUICK_COACH_ACTIONS: QuickCoachAction[] = [
  {
    id: 'suggest-workout',
    label: 'Suggest Workout',
    prompt: 'Based on my recent training history, what workout should I do today? Consider muscle recovery and balance.',
    IconComponent: IconTarget,
  },
  {
    id: 'generate-workout',
    label: 'Generate Workout',
    prompt: 'Generate a balanced workout for me today based on my training history. Make sure to avoid overworking recently trained muscles.',
    IconComponent: IconLightning,
  },
  {
    id: 'analyze-progress',
    label: 'Analyze Progress',
    prompt: 'Analyze my recent workout history. What muscle groups have I been focusing on? What areas might I be neglecting?',
    IconComponent: IconChart,
  },
  {
    id: 'recovery-tips',
    label: 'Recovery Tips',
    prompt: 'Give me some recovery tips based on my recent workouts. What should I focus on for optimal recovery?',
    IconComponent: IconRecovery,
  },
]

function LoadingIndicator() {
  return (
    <div className="flex gap-1 items-center justify-start mb-4">
      <div className="bg-surface-2 rounded px-3 py-2">
        <div className="flex gap-1">
          <motion.div
            className="w-2 h-2 rounded-full bg-primary-500"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ repeat: Infinity, duration: 1.2, delay: 0 }}
          />
          <motion.div
            className="w-2 h-2 rounded-full bg-primary-500"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ repeat: Infinity, duration: 1.2, delay: 0.2 }}
          />
          <motion.div
            className="w-2 h-2 rounded-full bg-primary-500"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ repeat: Infinity, duration: 1.2, delay: 0.4 }}
          />
        </div>
      </div>
    </div>
  )
}

export default function CoachPage() {
  const navigate = useNavigate()
  const { settings } = useSettings()
  const { history, save: saveWorkout } = useWorkoutHistory()
  const [messages, setMessages] = useState<ChatMessageType[]>([])
  const [isThinking, setIsThinking] = useState(false)
  const [error, setError] = useState<AICoachError | null>(null)
  const [lastUserMessage, setLastUserMessage] = useState<string>('')
  const [generatedWorkout, setGeneratedWorkout] = useState<GeneratedWorkout | null>(null)
  const [workoutConfig, setWorkoutConfig] = useState<WorkoutConfig | null>(null)
  const [workoutReasoning, setWorkoutReasoning] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  // Initialize Groq service
  useEffect(() => {
    if (settings.groqApiKey && !groqService.isInitialized()) {
      groqService.initialize(settings.groqApiKey)
    }
  }, [settings.groqApiKey])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current && messagesContainerRef.current) {
      const container = messagesContainerRef.current
      const isNearBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight < 100

      if (isNearBottom || messages.length === 1) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }, [messages, isThinking])

  // Define the workout generation tool for AI function calling
  const workoutGenerationTool = useMemo(() => ({
    type: 'function' as const,
    function: {
      name: 'generate_workout',
      description: 'Generate a personalized workout based on parameters. Use this when the user asks you to create or generate a workout for them. You can specify exactly which muscles to target, which to avoid, and adjust the intensity.',
      parameters: {
        type: 'object',
        properties: {
          focus: {
            type: 'string',
            enum: ['push', 'pull', 'legs', 'core', 'cardio', 'flexibility', 'balanced'],
            description: 'The workout focus area. Choose based on user history and preferences. Use "balanced" for full-body workouts.',
          },
          durationMinutes: {
            type: 'number',
            description: 'Workout duration in minutes (15-90). Use user preferences if not specified.',
          },
          difficulty: {
            type: 'string',
            enum: ['beginner', 'intermediate', 'advanced'],
            description: 'Difficulty level based on user preferences.',
          },
          reasoning: {
            type: 'string',
            description: 'Brief explanation (1-2 sentences) of why this workout plan is optimal for the user right now.',
          },
          targetMuscles: {
            type: 'array',
            items: {
              type: 'string',
              enum: ['chest', 'shoulders', 'triceps', 'biceps', 'forearms', 'upper-back', 'lats', 'lower-back', 'core', 'obliques', 'hip-flexors', 'glutes', 'quads', 'hamstrings', 'calves', 'full-body'],
            },
            description: 'Specific muscle groups to prioritize in this workout. Use this to target well-rested muscles or address imbalances. Examples: ["chest", "triceps"] for push focus, ["quads", "glutes"] for leg day.',
          },
          avoidMuscles: {
            type: 'array',
            items: {
              type: 'string',
              enum: ['chest', 'shoulders', 'triceps', 'biceps', 'forearms', 'upper-back', 'lats', 'lower-back', 'core', 'obliques', 'hip-flexors', 'glutes', 'quads', 'hamstrings', 'calves'],
            },
            description: 'Muscle groups to avoid (for recovery). Use this for muscles worked in the last 24-48 hours to prevent overtraining.',
          },
          volumeModifier: {
            type: 'number',
            description: 'Adjust overall workout volume/intensity (0.7-1.3, default 1.0). Use 0.8-0.9 for recovery days, 1.1-1.2 for hard training days. This scales reps and duration.',
          },
          emphasizeCardio: {
            type: 'boolean',
            description: 'Set to true to include extra cardio exercises in the workout. Use when user wants fat loss, conditioning, or mentions cardio.',
          },
        },
        required: ['focus', 'durationMinutes', 'difficulty', 'reasoning'],
      },
    },
  }), [])

  const generateAndSaveWorkout = useCallback(async (config: WorkoutConfig, reasoning?: string) => {
    try {
      const workout = generateWorkout(config)

      // Add AI Coach metadata
      const workoutWithMetadata: GeneratedWorkout = {
        ...workout,
        id: nanoid(),
        createdAt: new Date().toISOString(),
      }

      // Store the workout, config, and reasoning for display and potential regeneration
      setGeneratedWorkout(workoutWithMetadata)
      setWorkoutConfig(config)
      setWorkoutReasoning(reasoning || null)

      // Add system message to indicate workout generation
      const focusLabel = config.focus && config.focus !== 'balanced'
        ? config.focus.charAt(0).toUpperCase() + config.focus.slice(1) + '-Focused'
        : 'Balanced'

      const systemMsg: ChatMessageType = {
        id: nanoid(),
        role: 'assistant',
        content: `**✓ WORKOUT GENERATED SUCCESSFULLY**

---

**WORKOUT DETAILS:**

**Type:** ${focusLabel}
**Duration:** ${config.totalMinutes} minutes
**Difficulty:** ${config.difficulty.toUpperCase()}

${reasoning ? `**Why this workout?**
${reasoning}

---

` : ''}**WORKOUT BREAKDOWN:**

**Warm-Up Phase** → ${workout.warmUp.estimatedMinutes} min
• ${workout.warmUp.blocks.reduce((sum, b) => sum + b.exercises.length, 0)} exercises to prepare your body

**Main Workout** → ${workout.mainWorkout.estimatedMinutes} min
• ${workout.mainWorkout.blocks.reduce((sum, b) => sum + b.exercises.length, 0)} exercises for strength and conditioning

**Cool-Down Phase** → ${workout.coolDown.estimatedMinutes} min
• ${workout.coolDown.blocks.reduce((sum, b) => sum + b.exercises.length, 0)} exercises for recovery

---

**TOTAL:** ${workout.totalExerciseCount} exercises across all phases

**STATUS:** Review the workout details below and commence when ready!`,
        timestamp: new Date().toISOString(),
      }

      setMessages(prev => [...prev, systemMsg])

      // Save to history (as a template)
      await saveWorkout({
        id: workoutWithMetadata.id,
        createdAt: workoutWithMetadata.createdAt,
        workout: workoutWithMetadata,
        completedAt: new Date().toISOString(),
        actualDurationSeconds: 0, // Not completed yet
        exercisesCompleted: 0,
        exercisesSkipped: 0,
        isFavorite: false,
        isTemplate: true, // Mark as template (not completed yet)
        name: `AI Coach: ${config.focus && config.focus !== 'balanced' ? config.focus.charAt(0).toUpperCase() + config.focus.slice(1) : 'Balanced'} Workout`,
      })

    } catch (err) {
      console.error('Failed to generate workout:', err)
      setError({
        type: 'unknown',
        message: 'Failed to generate workout. Please try again.',
        retryable: true,
      })
    }
  }, [saveWorkout])

  const sendMessage = useCallback(async (userMessage: string) => {
    if (!groqService.isInitialized()) {
      setError({
        type: 'no_key',
        message: 'Configure Groq API key in Settings to use AI Coach.',
        retryable: false,
      })
      return
    }

    setLastUserMessage(userMessage)
    setError(null)
    setIsThinking(true)
    // Clear any existing workout preview when sending a new message
    setGeneratedWorkout(null)
    setWorkoutConfig(null)
    setWorkoutReasoning(null)

    // Add user message
    const userMsg: ChatMessageType = {
      id: nanoid(),
      role: 'user',
      content: userMessage,
      timestamp: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, userMsg])

    try {
      // Analyze workout history
      const analysis = analyzeWorkoutHistory(history)
      const historyContext = buildCoachContext(analysis)

      // Build system prompt with workout history context
      const systemPrompt = `You are a knowledgeable and friendly fitness coach. You help users plan workouts, analyze their training, and provide exercise advice.

TRAINING CONTEXT:
${historyContext}

AVAILABLE EQUIPMENT:
${settings.equipment?.join(', ') || 'bodyweight only'}

USER PREFERENCES:
- Difficulty level: ${settings.defaultDifficulty || 'intermediate'}
- Typical workout duration: ${settings.defaultDurationMinutes || 45} minutes

When users ask you to create, generate, or suggest a workout:
1. ALWAYS use the generate_workout function to actually create the workout
2. Analyze their training history to identify:
   - Recently worked muscles (worked in last 24-48h) → Add to avoidMuscles
   - Well-rested muscles (not worked in 2+ days) → Add to targetMuscles
   - Muscle imbalances (some muscles trained more than others)
3. Set the focus parameter based on their request and history
4. Use the advanced parameters intelligently:
   - targetMuscles: List specific muscles to prioritize (e.g., ["chest", "triceps", "shoulders"] for push day)
   - avoidMuscles: List muscles that need recovery (recently worked in last 24-48h)
   - volumeModifier: Adjust intensity (0.8 for recovery/light day, 1.0 normal, 1.2 for hard training)
   - emphasizeCardio: Set to true if user mentions cardio, fat loss, or conditioning
5. Provide clear reasoning that explains your muscle targeting choices

EXAMPLES OF SMART WORKOUT GENERATION:

Example 1 - User worked chest yesterday:
- avoidMuscles: ["chest", "triceps", "shoulders"]
- targetMuscles: ["quads", "hamstrings", "glutes"]
- focus: "legs"
- reasoning: "Your chest, triceps, and shoulders need recovery from yesterday. Let's focus on legs which are well-rested."

Example 2 - User wants a recovery day:
- volumeModifier: 0.8
- emphasizeCardio: false
- reasoning: "Light intensity workout to promote active recovery while maintaining movement patterns."

Example 3 - User wants to work on weak areas:
- If analysis shows legs undertrained:
  - targetMuscles: ["quads", "hamstrings", "glutes", "calves"]
  - focus: "legs"
  - reasoning: "Your leg training has been light lately. This workout prioritizes lower body to balance your program."

For other questions (exercise advice, form tips, recovery advice):
- Respond conversationally and helpfully
- Be encouraging and practical
- Use bullet points for clarity

CRITICAL: When generating workouts, ALWAYS use the generate_workout tool with appropriate parameters - don't just describe a workout in text!`

      const { message, error: apiError, toolCalls } = await groqService.sendMessageWithTools(
        userMessage,
        systemPrompt,
        messages,
        [workoutGenerationTool]
      )

      if (apiError) {
        setError(apiError)
        setIsThinking(false)
        return
      }

      // Check if AI wants to call the workout generation tool
      if (toolCalls && toolCalls.length > 0) {
        const toolCall = toolCalls[0]

        if (toolCall.function.name === 'generate_workout') {
          try {
            const args = JSON.parse(toolCall.function.arguments)

            // Build workout config from AI's parameters
            const config: WorkoutConfig = {
              totalMinutes: args.durationMinutes || settings.defaultDurationMinutes || 45,
              availableEquipment: settings.equipment || ['none'],
              difficulty: args.difficulty || settings.defaultDifficulty || 'intermediate',
              focus: args.focus || 'balanced',
              // AI-enhanced parameters
              targetMuscles: args.targetMuscles,
              avoidMuscles: args.avoidMuscles,
              volumeModifier: args.volumeModifier,
              emphasizeCardio: args.emphasizeCardio,
            }

            // Generate and save the workout with AI's reasoning
            await generateAndSaveWorkout(config, args.reasoning)

            setIsThinking(false)
            return
          } catch (parseError) {
            console.error('Failed to parse tool call arguments:', parseError)
            setError({
              type: 'unknown',
              message: 'Failed to generate workout. Please try again.',
              retryable: true,
            })
            setIsThinking(false)
            return
          }
        }
      }

      // Add assistant response (for non-workout generation messages)
      if (message) {
        const assistantMsg: ChatMessageType = {
          id: nanoid(),
          role: 'assistant',
          content: message,
          timestamp: new Date().toISOString(),
        }
        setMessages((prev) => [...prev, assistantMsg])
      }

    } catch (err) {
      console.error('Error sending message:', err)
      setError({
        type: 'unknown',
        message: 'Failed to communicate with AI Coach. Please try again.',
        retryable: true,
      })
    } finally {
      setIsThinking(false)
    }
  }, [groqService, settings, history, messages, workoutGenerationTool, generateAndSaveWorkout])

  const handleQuickAction = useCallback((action: QuickCoachAction) => {
    sendMessage(action.prompt)
  }, [sendMessage])

  const handleRetry = useCallback(() => {
    if (lastUserMessage) {
      sendMessage(lastUserMessage)
    }
  }, [lastUserMessage, sendMessage])

  const handleStartWorkout = useCallback(() => {
    if (generatedWorkout) {
      sessionStorage.setItem('activeWorkout', JSON.stringify(generatedWorkout))
      navigate('/workout')
    }
  }, [generatedWorkout, navigate])

  const handleRegenerateWorkout = useCallback(() => {
    if (workoutConfig) {
      // Regenerate with the same config
      generateAndSaveWorkout(workoutConfig, workoutReasoning || undefined)
    }
  }, [workoutConfig, workoutReasoning, generateAndSaveWorkout])

  const displayMessages = messages.filter((msg) => msg.role !== 'system')
  const showQuickActions = displayMessages.length === 0 && !isThinking && !error

  return (
    <div className="flex flex-col h-screen bg-surface-0">
      {/* Header */}
      <div className="px-4 pt-10 pb-3 border-b border-surface-3 bg-surface-1">
        <h1 className="font-heading text-2xl font-bold text-text-primary tracking-wider mb-1">
          AI COACH
        </h1>
        <p className="text-[10px] font-mono text-text-ghost tracking-wider">
          PERSONALIZED TRAINING ASSISTANT
        </p>
      </div>

      {/* Quick Actions */}
      {showQuickActions && (
        <div className="px-4 py-4 border-b border-surface-3 bg-surface-1">
          <p className="text-xs font-mono text-text-muted mb-3">Quick Actions:</p>
          <div className="grid grid-cols-2 gap-2">
            {QUICK_COACH_ACTIONS.map((action) => {
              const Icon = action.IconComponent
              return (
                <button
                  key={action.id}
                  onClick={() => handleQuickAction(action)}
                  disabled={isThinking}
                  className="px-3 py-2 bg-surface-2 hover:bg-surface-3 border border-surface-3 hover:border-primary-500 rounded text-left transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Icon className="w-5 h-5 mb-1 text-primary-500" />
                  <p className="text-[10px] font-mono font-bold text-text-primary tracking-wider">
                    {action.label}
                  </p>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-4 py-3 hide-scrollbar"
      >
        {displayMessages.length === 0 && !isThinking && !error && (
          <div className="text-center py-12">
            <IconTarget className="w-16 h-16 mx-auto mb-4 text-primary-500" />
            <p className="text-sm font-mono text-text-primary font-bold tracking-wider mb-2">
              READY FOR TRAINING
            </p>
            <p className="text-xs font-mono text-text-muted mb-6">
              Ask me anything or use a quick action above
            </p>
            <div className="text-left max-w-md mx-auto space-y-2">
              <p className="text-[10px] font-mono text-text-ghost">
                • Generate personalized workouts based on your history
              </p>
              <p className="text-[10px] font-mono text-text-ghost">
                • Get recovery and training advice
              </p>
              <p className="text-[10px] font-mono text-text-ghost">
                • Analyze your progress and muscle balance
              </p>
              <p className="text-[10px] font-mono text-text-ghost">
                • Ask about exercise form and techniques
              </p>
            </div>
            <div className="mt-6 px-4">
              <div className="bg-surface-2 border border-surface-3 rounded p-3">
                <p className="text-[10px] font-mono text-text-muted">
                  <span className="text-primary-500 font-bold">TIP:</span> Just type naturally!
                  <br />
                  Try: "generate a push workout" or "I want to work legs today"
                </p>
              </div>
            </div>
          </div>
        )}

        {displayMessages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}

        {isThinking && <LoadingIndicator />}

        {/* Error Display */}
        {error && (
          <div className="bg-primary-900/30 border border-primary-700/50 rounded p-3 mb-4">
            <p className="text-xs font-mono text-primary-400 mb-2">{error.message}</p>
            {error.retryable && (
              <button
                onClick={handleRetry}
                className="text-[10px] font-mono font-bold text-primary-500 hover:text-primary-400 underline uppercase"
              >
                → Retry
              </button>
            )}
          </div>
        )}

        {/* Workout Preview */}
        {generatedWorkout && (
          <WorkoutPreview
            workout={generatedWorkout}
            onRegenerate={handleRegenerateWorkout}
            onStart={handleStartWorkout}
          />
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-surface-3">
        <ChatInput
          onSend={sendMessage}
          disabled={isThinking}
          placeholder="Ask about workouts, recovery, or training advice..."
        />
      </div>
    </div>
  )
}
