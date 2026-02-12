import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { groqService } from '../lib/groqService'
import { useSettings } from '../hooks/useSettings'
import { useWorkoutHistory } from '../hooks/useWorkoutHistory'
import { analyzeWorkoutHistory, buildCoachContext } from '../lib/workoutHistoryAnalyzer'
import { generateWorkout } from '../lib/workoutGenerator'
import ChatMessage from '../components/aicoach/ChatMessage'
import ChatInput from '../components/aicoach/ChatInput'
import { nanoid } from 'nanoid'
import type { ChatMessage as ChatMessageType, AICoachError } from '../types/aiCoach'
import type { WorkoutConfig, GeneratedWorkout } from '../types/workout'

interface QuickCoachAction {
  id: string
  label: string
  prompt: string
  icon: string
}

const QUICK_COACH_ACTIONS: QuickCoachAction[] = [
  {
    id: 'suggest-workout',
    label: 'Suggest Workout',
    prompt: 'Based on my recent training history, what workout should I do today? Consider muscle recovery and balance.',
    icon: '💪',
  },
  {
    id: 'generate-workout',
    label: 'Generate Workout',
    prompt: 'Generate a balanced workout for me today based on my training history. Make sure to avoid overworking recently trained muscles.',
    icon: '⚡',
  },
  {
    id: 'analyze-progress',
    label: 'Analyze Progress',
    prompt: 'Analyze my recent workout history. What muscle groups have I been focusing on? What areas might I be neglecting?',
    icon: '📊',
  },
  {
    id: 'recovery-tips',
    label: 'Recovery Tips',
    prompt: 'Give me some recovery tips based on my recent workouts. What should I focus on for optimal recovery?',
    icon: '🧘',
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

  const parseWorkoutFromResponse = useCallback((response: string): WorkoutConfig | null => {
    // Try to detect if the AI is suggesting a workout generation
    const lowerResponse = response.toLowerCase()

    // Look for workout generation keywords
    const isGenerating =
      lowerResponse.includes('generate') ||
      lowerResponse.includes('creating a workout') ||
      lowerResponse.includes("let's create") ||
      lowerResponse.includes('here is a workout') ||
      lowerResponse.includes("i'll generate")

    if (!isGenerating) {
      return null
    }

    // Extract workout parameters from the response
    const config: WorkoutConfig = {
      totalMinutes: settings.defaultDurationMinutes || 45,
      availableEquipment: settings.equipment || ['none'],
      difficulty: settings.defaultDifficulty || 'intermediate',
      focus: 'balanced',
    }

    // Try to detect focus area
    if (lowerResponse.includes('upper body') || lowerResponse.includes('push') || lowerResponse.includes('pull')) {
      const analysis = analyzeWorkoutHistory(history)
      // If recently worked push, suggest pull
      if (analysis.recentlyWorkedMuscles.some(m => ['chest', 'shoulders', 'triceps'].includes(m))) {
        config.focus = 'pull'
      } else if (analysis.recentlyWorkedMuscles.some(m => ['upper-back', 'lats', 'biceps'].includes(m))) {
        config.focus = 'push'
      }
    } else if (lowerResponse.includes('legs') || lowerResponse.includes('lower body')) {
      config.focus = 'legs'
    } else if (lowerResponse.includes('core') || lowerResponse.includes('abs')) {
      config.focus = 'core'
    }

    return config
  }, [settings, history])

  const generateAndSaveWorkout = useCallback(async (config: WorkoutConfig) => {
    try {
      const workout = generateWorkout(config)

      // Add AI Coach metadata
      const workoutWithMetadata: GeneratedWorkout = {
        ...workout,
        id: nanoid(),
        createdAt: new Date().toISOString(),
      }

      // Add system message to indicate workout generation
      const systemMsg: ChatMessageType = {
        id: nanoid(),
        role: 'assistant',
        content: `✅ **Workout Generated!**\n\nI've created a ${config.totalMinutes}-minute ${config.focus && config.focus !== 'balanced' ? config.focus + ' focused' : 'balanced'} workout for you.\n\nThe workout includes:\n- ${workout.warmUp.estimatedMinutes} min warm-up\n- ${workout.mainWorkout.estimatedMinutes} min main workout\n- ${workout.coolDown.estimatedMinutes} min cool-down\n\n**Total exercises:** ${workout.totalExerciseCount}\n\nClick "Start This Workout" below to begin!`,
        timestamp: new Date().toISOString(),
      }

      setMessages(prev => [...prev, systemMsg])

      // Save to history (as a template) and navigate
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

      // Store workout in sessionStorage and navigate
      setTimeout(() => {
        sessionStorage.setItem('activeWorkout', JSON.stringify(workoutWithMetadata))
        navigate('/workout')
      }, 1500)

    } catch (err) {
      console.error('Failed to generate workout:', err)
      setError({
        type: 'unknown',
        message: 'Failed to generate workout. Please try again.',
        retryable: true,
      })
    }
  }, [saveWorkout, navigate])

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

When suggesting workouts:
1. Consider recent muscle group usage and recovery needs
2. Avoid overworking recently trained muscles (worked in last 24h)
3. Prioritize well-rested muscle groups
4. Balance training over time
5. Use available equipment only

When asked to generate a workout:
1. Clearly state you're generating a workout
2. Explain the focus (push/pull/legs/core/balanced)
3. Mention key exercises or muscle groups
4. The system will automatically create and start the workout

Keep responses conversational, encouraging, and practical. Use bullet points for clarity.`

      const { message, error: apiError } = await groqService.sendMessage(
        userMessage,
        systemPrompt,
        messages
      )

      if (apiError) {
        setError(apiError)
        setIsThinking(false)
        return
      }

      // Add assistant response
      const assistantMsg: ChatMessageType = {
        id: nanoid(),
        role: 'assistant',
        content: message,
        timestamp: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, assistantMsg])

      // Check if AI wants to generate a workout
      const workoutConfig = parseWorkoutFromResponse(message)
      if (workoutConfig) {
        // Generate and save the workout
        await generateAndSaveWorkout(workoutConfig)
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
  }, [groqService, settings, history, messages, parseWorkoutFromResponse, generateAndSaveWorkout])

  const handleQuickAction = useCallback((action: QuickCoachAction) => {
    sendMessage(action.prompt)
  }, [sendMessage])

  const handleRetry = useCallback(() => {
    if (lastUserMessage) {
      sendMessage(lastUserMessage)
    }
  }, [lastUserMessage, sendMessage])

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
            {QUICK_COACH_ACTIONS.map((action) => (
              <button
                key={action.id}
                onClick={() => handleQuickAction(action)}
                disabled={isThinking}
                className="px-3 py-2 bg-surface-2 hover:bg-surface-3 border border-surface-3 hover:border-primary-500 rounded text-left transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="text-lg mb-1">{action.icon}</div>
                <p className="text-[10px] font-mono font-bold text-text-primary tracking-wider">
                  {action.label}
                </p>
              </button>
            ))}
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
            <div className="text-5xl mb-4">🎯</div>
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
