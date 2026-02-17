import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import StickFigure from '../components/stickfigure/StickFigure'
import { useTimer, useStopwatch } from '../hooks/useTimer'
import { useWorkoutHistory } from '../hooks/useWorkoutHistory'
import { useSettings } from '../hooks/useSettings'
import { formatSeconds } from '../utils/formatTime'
import { generateId } from '../utils/id'
import { cn } from '../utils/cn'
import { IconStarFilled, IconCheck } from '../components/icons/Icons'
import { useSound } from '../hooks/useSound'
import AICoachButton from '../components/aicoach/AICoachButton'
import AICoachPanel from '../components/aicoach/AICoachPanel'
import { groqService } from '../lib/groqService'
import { buildWorkoutContext, buildSystemPrompt } from '../lib/workoutContextBuilder'
import { markPlanWorkoutComplete } from '../store/storage'
import type { GeneratedWorkout, WorkoutExercise, CircuitBlock } from '../types/workout'
import type { ChatMessage, QuickAction, AICoachError } from '../types/aiCoach'

interface FlatExercise {
  exercise: WorkoutExercise
  block: CircuitBlock
  phase: string
  roundNum: number
  totalRounds: number
  indexInBlock: number
}

function flattenWorkout(
  workout: GeneratedWorkout,
  grouping: 'circuit' | 'grouped' = 'circuit'
): FlatExercise[] {
  const flat: FlatExercise[] = []
  const phases = [
    { phase: 'Warm-Up', data: workout.warmUp },
    { phase: 'Workout', data: workout.mainWorkout },
    { phase: 'Cool-Down', data: workout.coolDown },
  ]
  for (const { phase, data } of phases) {
    for (const block of data.blocks) {
      // Only apply grouping to multi-round main workout circuits
      if (grouping === 'grouped' && block.rounds > 1 && phase === 'Workout') {
        // Grouped mode: complete all sets of each exercise before moving to next
        block.exercises.forEach((ex, idx) => {
          for (let round = 1; round <= block.rounds; round++) {
            flat.push({
              exercise: ex,
              block,
              phase,
              roundNum: round,
              totalRounds: block.rounds,
              indexInBlock: idx,
            })
          }
        })
      } else {
        // Circuit mode: rotate through exercises for each round (current behavior)
        for (let round = 1; round <= block.rounds; round++) {
          block.exercises.forEach((ex, idx) => {
            flat.push({
              exercise: ex,
              block,
              phase,
              roundNum: round,
              totalRounds: block.rounds,
              indexInBlock: idx,
            })
          })
        }
      }
    }
  }
  return flat
}

export default function ActiveWorkoutPage() {
  const navigate = useNavigate()
  const { save } = useWorkoutHistory()
  const { settings } = useSettings()
  const sound = useSound()

  const workout = useMemo<GeneratedWorkout | null>(() => {
    const data = sessionStorage.getItem('activeWorkout')
    return data ? JSON.parse(data) : null
  }, [])

  const flatExercises = useMemo(() =>
    workout ? flattenWorkout(workout, settings.exerciseGrouping || 'circuit') : [],
    [workout, settings.exerciseGrouping]
  )

  const [currentIndex, setCurrentIndex] = useState(0)
  const [isResting, setIsResting] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [exercisesCompleted, setExercisesCompleted] = useState(0)
  const [exercisesSkipped, setExercisesSkipped] = useState(0)
  const [showQuitConfirm, setShowQuitConfirm] = useState(false)
  const [showFavoriteRename, setShowFavoriteRename] = useState(false)
  const [favoriteName, setFavoriteName] = useState('')
  const favoriteInputRef = useRef<HTMLInputElement>(null)

  // AI Coach state
  const [showAICoach, setShowAICoach] = useState(false)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [isAIThinking, setIsAIThinking] = useState(false)
  const [aiError, setAiError] = useState<AICoachError | null>(null)
  const lastExerciseIndexRef = useRef<number>(-1)

  const stopwatch = useStopwatch()

  const current = flatExercises[currentIndex]
  const exerciseDuration = current?.exercise.durationSeconds || 0
  const exerciseContentRef = useRef<HTMLDivElement>(null)

  // Forward declaration of handleNext using a ref to break excessive cycles
  const handleNextRef = useRef<(skipped: boolean) => void>(() => { })

  const timer = useTimer(
    isResting
      ? (current?.block.restBetweenExercises || 15)
      : exerciseDuration,
    () => {
      if (isResting) {
        sound.timerDone()
        setIsResting(false)
      } else if (exerciseDuration > 0) {
        handleNextRef.current(false)
      }
    }
  )

  useEffect(() => {
    if (isResting && timer.secondsLeft > 0) sound.tick()
  }, [isResting, timer.secondsLeft]) // eslint-disable-line

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    exerciseContentRef.current?.scrollTo(0, 0)
  }, [currentIndex])

  useEffect(() => {
    if (showFavoriteRename && favoriteInputRef.current) {
      favoriteInputRef.current.focus()
    }
  }, [showFavoriteRename])

  useEffect(() => {
    if (workout) stopwatch.start()
    return () => { stopwatch.pause() }
  }, []) // eslint-disable-line

  const goToNext = useCallback((skipped: boolean) => {
    if (!skipped) { setExercisesCompleted(c => c + 1); sound.complete() }
    else { setExercisesSkipped(c => c + 1); sound.skip() }

    if (currentIndex >= flatExercises.length - 1) {
      setIsComplete(true)
      stopwatch.pause()
      sound.victory()
      return
    }

    const next = flatExercises[currentIndex + 1]
    const needsRest = current && next && (
      current.block.name === next.block.name &&
      current.roundNum === next.roundNum &&
      current.block.restBetweenExercises > 0
    )
    const needsRoundRest = current && next && (
      current.block.name === next.block.name &&
      current.roundNum !== next.roundNum &&
      current.block.restBetweenRounds > 0
    )

    if (needsRest || needsRoundRest) {
      setIsResting(true)
      const restTime = needsRoundRest ? current.block.restBetweenRounds : current.block.restBetweenExercises
      timer.reset(restTime)
      timer.start()
    } else {
      setCurrentIndex(i => i + 1)
    }
  }, [currentIndex, flatExercises, current, timer, stopwatch, sound])

  const handleNext = useCallback((skipped: boolean) => {
    if (isResting) {
      setIsResting(false)
      setCurrentIndex(i => i + 1)
      return
    }
    goToNext(skipped)
  }, [isResting, goToNext])

  // Update the ref whenever handleNext changes
  useEffect(() => {
    handleNextRef.current = handleNext
  }, [handleNext])

  const handlePause = useCallback(() => {
    sound.pause()
    if (isPaused) {
      setIsPaused(false)
      stopwatch.start()
      if (timer.isRunning || isResting) timer.start()
    } else {
      setIsPaused(true)
      stopwatch.pause()
      timer.pause()
    }
  }, [isPaused, stopwatch, timer, isResting, sound])

  // AI Coach handlers
  const handleOpenAICoach = useCallback(() => {
    if (!settings.enableAICoach) return
    if (settings.groqApiKey) {
      groqService.initialize(settings.groqApiKey)
    }
    setShowAICoach(true)
    setAiError(null)
  }, [settings])

  const handleCloseAICoach = useCallback(() => {
    setShowAICoach(false)
  }, [])

  const handleSendMessage = useCallback(async (userMessage: string) => {
    if (!current) return

    const userChatMessage: ChatMessage = {
      id: generateId(),
      role: 'user',
      content: userMessage,
      timestamp: new Date().toISOString(),
    }

    setChatMessages(prev => [...prev, userChatMessage])
    setIsAIThinking(true)
    setAiError(null)

    const context = buildWorkoutContext(current)
    const systemPrompt = buildSystemPrompt(context)

    const { message, error } = await groqService.sendMessage(
      userMessage,
      systemPrompt,
      chatMessages
    )

    setIsAIThinking(false)

    if (error) {
      setAiError(error)
    } else if (message) {
      const assistantMessage: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: message,
        timestamp: new Date().toISOString(),
      }
      setChatMessages(prev => [...prev, assistantMessage])
    }
  }, [current, chatMessages])

  const handleQuickAction = useCallback((action: QuickAction) => {
    handleSendMessage(action.prompt)
  }, [handleSendMessage])

  const handleRetry = useCallback(() => {
    if (chatMessages.length > 0) {
      const lastUserMessage = [...chatMessages].reverse().find(msg => msg.role === 'user')
      if (lastUserMessage) {
        handleSendMessage(lastUserMessage.content)
      }
    }
  }, [chatMessages, handleSendMessage])

  // Reset chat when exercise changes
  useEffect(() => {
    if (currentIndex !== lastExerciseIndexRef.current) {
      lastExerciseIndexRef.current = currentIndex
      setChatMessages([])
      setAiError(null)
    }
  }, [currentIndex])

  const handleComplete = useCallback(async () => {
    if (!workout) return

    // Check if this workout was from a plan
    const planContextStr = sessionStorage.getItem('activePlanContext')
    const planContext = planContextStr ? JSON.parse(planContextStr) : null

    const historyEntry = await save({
      id: generateId(),
      createdAt: workout.createdAt,
      completedAt: new Date().toISOString(),
      workout,
      actualDurationSeconds: stopwatch.seconds,
      exercisesCompleted,
      exercisesSkipped,
      isFavorite: false,
      fromPlanId: planContext?.planId,
    })

    // If from plan, mark the plan day as complete
    if (planContext) {
      await markPlanWorkoutComplete(planContext.planId, planContext.dayId, historyEntry.id)
      sessionStorage.removeItem('activePlanContext')
    }

    sessionStorage.removeItem('activeWorkout')
    navigate('/history')
  }, [workout, save, stopwatch.seconds, exercisesCompleted, exercisesSkipped, navigate])

  const handleFavoriteAndComplete = useCallback(async (name?: string) => {
    if (!workout) return

    // Check if this workout was from a plan
    const planContextStr = sessionStorage.getItem('activePlanContext')
    const planContext = planContextStr ? JSON.parse(planContextStr) : null

    const historyEntry = await save({
      id: generateId(),
      name: name || undefined,
      createdAt: workout.createdAt,
      completedAt: new Date().toISOString(),
      workout,
      actualDurationSeconds: stopwatch.seconds,
      exercisesCompleted,
      exercisesSkipped,
      isFavorite: true,
      fromPlanId: planContext?.planId,
    })

    // If from plan, mark the plan day as complete
    if (planContext) {
      await markPlanWorkoutComplete(planContext.planId, planContext.dayId, historyEntry.id)
      sessionStorage.removeItem('activePlanContext')
    }

    sessionStorage.removeItem('activeWorkout')
    navigate('/favorites')
  }, [workout, save, stopwatch.seconds, exercisesCompleted, exercisesSkipped, navigate])

  if (!workout) {
    return (
      <div className="flex items-center justify-center h-full px-4">
        <div className="text-center">
          <p className="text-text-muted font-mono text-sm mb-4">NO PROTOCOL LOADED</p>
          <button onClick={() => navigate('/')} className="text-primary-500 font-heading font-bold tracking-wider text-sm border border-primary-500 px-4 py-2">
            RETURN TO BASE
          </button>
        </div>
      </div>
    )
  }

  // Completion screen
  if (isComplete) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col items-center justify-center h-[calc(100dvh-env(safe-area-inset-top,0px))] px-6 text-center"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.15, type: 'spring', stiffness: 200, damping: 18 }}
          className="border-2 border-primary-500 p-8 mb-6 w-full max-w-sm"
          style={{ boxShadow: '0 0 25px color-mix(in srgb, var(--color-primary-500) 20%, transparent), inset 0 0 15px color-mix(in srgb, var(--color-primary-500) 5%, transparent)' }}
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 250, damping: 15 }}
            className="text-primary-500 text-5xl font-heading font-bold mb-2 flex justify-center"
            style={{ textShadow: '0 0 20px color-mix(in srgb, var(--color-primary-500) 50%, transparent)' }}
          >
            <IconStarFilled className="w-16 h-16" />
          </motion.div>
          <motion.h1
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="font-heading text-2xl font-bold tracking-widest text-primary-500 mb-1"
          >
            MISSION COMPLETE
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-text-muted font-mono text-xs tracking-wider"
          >PROTOCOL EXECUTED SUCCESSFULLY</motion.p>
        </motion.div>

        <div className="grid grid-cols-3 gap-3 w-full max-w-sm mb-8">
          {[
            { value: formatSeconds(stopwatch.seconds), label: 'DURATION', highlight: true },
            { value: String(exercisesCompleted), label: 'COMPLETED', highlight: true },
            { value: String(exercisesSkipped), label: 'SKIPPED', highlight: false },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.55 + i * 0.1, type: 'spring', stiffness: 250, damping: 20 }}
              className="card-base p-3 text-center"
            >
              <p className={cn('font-mono text-xl font-bold', stat.highlight ? 'text-primary-500' : 'text-text-ghost')}>
                {stat.value}
              </p>
              <p className="text-[10px] text-text-muted font-mono tracking-wider">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.85 }}
          className="flex flex-col gap-3 w-full max-w-sm"
        >
          {showFavoriteRename ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full border border-primary-500 bg-surface-1 p-4"
            >
              <p className="font-heading text-xs font-bold text-primary-500 tracking-widest uppercase mb-1">NAME THIS PROTOCOL</p>
              <p className="text-[10px] text-text-muted font-mono mb-3">OPTIONAL — LEAVE BLANK TO USE DATE</p>
              <input
                ref={favoriteInputRef}
                type="text"
                value={favoriteName}
                onChange={(e) => setFavoriteName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleFavoriteAndComplete(favoriteName.trim())
                }}
                placeholder="e.g. UPPER BODY DESTROYER"
                className="w-full bg-surface-0 border border-surface-3 px-3 py-2.5 text-sm font-mono text-text-primary placeholder:text-text-ghost tracking-wider uppercase focus:border-primary-500 focus:outline-none mb-3"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => handleFavoriteAndComplete(favoriteName.trim())}
                  className="flex-1 py-3 bg-primary-600 text-white font-heading font-bold text-xs tracking-widest border border-primary-500 uppercase flex items-center justify-center gap-2"
                >
                  <IconStarFilled className="w-3 h-3" /> SAVE
                </button>
                <button
                  onClick={() => setShowFavoriteRename(false)}
                  className="px-4 py-3 bg-surface-2 text-text-secondary font-heading font-bold text-xs tracking-wider border border-surface-3 uppercase"
                >
                  BACK
                </button>
              </div>
            </motion.div>
          ) : (
            <>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowFavoriteRename(true)}
                className="w-full py-4 bg-primary-600 text-white font-heading font-bold tracking-widest text-sm border border-primary-500 flex items-center justify-center gap-2 animate-glow-pulse"
              >
                <IconStarFilled className="w-4 h-4" /> ARCHIVE TO FAVORITES
              </motion.button>
              <button
                onClick={handleComplete}
                className="w-full py-4 bg-surface-2 text-text-secondary font-heading font-bold tracking-wider text-sm border border-surface-3"
              >
                LOG & DISMISS
              </button>
            </>
          )}
        </motion.div>
      </motion.div>
    )
  }

  const totalExercises = flatExercises.length
  const progress = (currentIndex + 1) / totalExercises

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="h-[calc(100dvh-env(safe-area-inset-top,0px))] flex flex-col overflow-hidden"
    >
      {/* Quit confirmation overlay */}
      <AnimatePresence>
        {showQuitConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-surface-0/95 flex flex-col items-center justify-center px-6"
          >
            <motion.p
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="font-heading text-lg font-bold text-primary-500 tracking-widest uppercase mb-2"
            >ABORT MISSION?</motion.p>
            <motion.p
              initial={{ y: -6, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-xs text-text-muted font-mono mb-8 text-center"
            >PROGRESS WILL BE LOST</motion.p>
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex gap-3 w-full max-w-xs"
            >
              <button
                onClick={() => setShowQuitConfirm(false)}
                className="flex-1 py-3 bg-surface-2 text-text-secondary font-heading font-bold text-xs tracking-wider border border-surface-3 uppercase"
              >
                CONTINUE
              </button>
              <button
                onClick={() => { sessionStorage.removeItem('activeWorkout'); navigate('/') }}
                className="flex-1 py-3 bg-primary-600 text-white font-heading font-bold text-xs tracking-wider border border-primary-500 uppercase"
              >
                QUIT
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress bar */}
      <div className="px-4 pt-3 flex-shrink-0">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowQuitConfirm(true)}
              className="w-7 h-7 flex items-center justify-center text-text-muted hover:text-primary-500 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </button>
            <span className={cn(
              'text-[10px] font-heading font-bold tracking-widest px-2 py-0.5 border uppercase',
              current.phase === 'Warm-Up' ? 'border-star-gold text-star-gold' :
                current.phase === 'Cool-Down' ? 'border-khaki text-khaki' :
                  'border-primary-500 text-primary-500'
            )}>
              {current.phase}
            </span>
          </div>
          <span className="text-xs text-text-muted font-mono">{formatSeconds(stopwatch.seconds)}</span>
        </div>
        <div className="h-1 bg-surface-3 overflow-hidden">
          <motion.div
            className="h-full bg-primary-500"
            style={{ boxShadow: '0 0 8px color-mix(in srgb, var(--color-primary-500) 60%, transparent), 0 0 2px color-mix(in srgb, var(--color-primary-600) 80%, transparent)' }}
            animate={{ width: `${progress * 100}%` }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[10px] text-text-ghost font-mono uppercase">
            {current.block.name}
            {current.totalRounds > 1 && ` // ${settings.exerciseGrouping === 'grouped' ? 'SET' : 'RND'} ${current.roundNum}/${current.totalRounds}`}
            {current.totalRounds > 1 && settings.exerciseGrouping !== 'grouped' && (
              <span className="text-primary-500/60"> (x{current.totalRounds})</span>
            )}
          </span>
          <span className="text-[10px] text-text-ghost font-mono">
            {currentIndex + 1}/{totalExercises}
          </span>
        </div>
      </div>

      {/* Rest overlay */}
      <AnimatePresence>
        {isResting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-surface-0/95 flex flex-col items-center justify-center"
          >
            <motion.p
              initial={{ y: -8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="text-sm font-heading font-bold text-text-muted tracking-widest uppercase mb-2"
            >STAND BY</motion.p>
            <motion.p
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 15 }}
              className="font-mono text-7xl font-bold text-primary-500 mb-4"
              style={{ textShadow: '0 0 20px color-mix(in srgb, var(--color-primary-500) 40%, transparent)' }}
            >{timer.secondsLeft}</motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-xs text-text-muted font-mono mb-8 uppercase"
            >
              NEXT: {flatExercises[currentIndex + 1]?.exercise.exercise.name}
            </motion.p>
            <motion.button
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              onClick={() => handleNext(false)}
              className="px-8 py-3 bg-surface-2 text-text-primary font-heading font-bold text-sm tracking-wider border border-surface-3 uppercase"
            >
              SKIP REST
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Current Exercise */}
      <div ref={exerciseContentRef} className="flex-1 flex flex-col items-center px-6 py-3 min-h-0 overflow-y-auto hide-scrollbar">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 60, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -60, scale: 0.96 }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            className="w-full flex flex-col items-center"
          >
            {/* Stick figure */}
            <div
              className="mb-3 bg-surface-1 p-3 border-2 border-surface-3 relative animate-glow-pulse-inset"
            >
              <StickFigure
                animationId={current.exercise.exercise.animationId}
                playing={!isPaused}
                size={140}
              />
            </div>

            {/* Exercise name */}
            <motion.h2
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08, duration: 0.25 }}
              className="font-heading text-xl font-bold text-center text-text-primary tracking-wider uppercase mb-1"
            >
              {current.exercise.exercise.name}
            </motion.h2>

            {/* Rep/time info */}
            <motion.div
              className="text-center mb-2"
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.15, type: 'spring', stiffness: 300, damping: 20 }}
            >
              {current.exercise.durationSeconds ? (
                <p className="font-mono text-4xl font-bold text-primary-500" style={{ textShadow: '0 0 12px color-mix(in srgb, var(--color-primary-500) 30%, transparent)' }}>
                  {timer.secondsLeft}S
                </p>
              ) : (
                <p className="font-mono text-4xl font-bold text-primary-500" style={{ textShadow: '0 0 12px color-mix(in srgb, var(--color-primary-500) 30%, transparent)' }}>
                  {current.exercise.reps}{current.exercise.perSide ? ' EACH' : ' REPS'}
                </p>
              )}
            </motion.div>

            {/* Category badges */}
            <motion.div
              className="flex gap-1.5 mb-3"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.25 }}
            >
              {current.exercise.exercise.primaryMuscles.slice(0, 3).map(m => (
                <span key={m} className="text-[10px] bg-primary-900 text-primary-400 px-1.5 py-0.5 border border-primary-700 font-mono uppercase">
                  {m.replace('-', ' ')}
                </span>
              ))}
            </motion.div>

            {/* Instructions */}
            <motion.div
              className="w-full card-base p-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.3 }}
            >
              <p className="section-header mb-2">// EXECUTION PROTOCOL</p>
              {current.exercise.exercise.instructions.map((step, i) => (
                <div key={i} className="flex gap-2 mb-1.5">
                  <span className="text-xs font-mono font-bold text-primary-500 mt-0.5">{String(i + 1).padStart(2, '0')}</span>
                  <p className="text-sm text-text-secondary leading-snug">{step}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom controls */}
      <div className="px-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] pt-2 flex gap-2 items-center flex-shrink-0">
        <button
          onClick={handlePause}
          className="w-12 h-12 bg-surface-2 border border-surface-3 flex items-center justify-center"
        >
          <svg className="w-5 h-5 text-text-secondary" fill="currentColor" viewBox="0 0 24 24">
            {isPaused
              ? <path d="M8 5v14l11-7z" />
              : <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />}
          </svg>
        </button>

        <button
          onClick={() => handleNext(true)}
          className="flex-1 py-3.5 bg-surface-2 text-text-muted font-heading font-bold text-xs tracking-wider border border-surface-3 uppercase"
        >
          SKIP
        </button>

        <motion.button
          onClick={() => {
            if (current.exercise.durationSeconds && !timer.isRunning && timer.secondsLeft > 0) {
              timer.start()
            } else {
              handleNext(false)
            }
          }}
          whileTap={{ scale: 0.95 }}
          className="flex-[2] py-3.5 bg-primary-600 text-white font-heading font-bold text-sm tracking-widest border border-primary-500 uppercase flex items-center justify-center gap-2 animate-glow-pulse"
        >
          {current.exercise.durationSeconds && !timer.isRunning && timer.secondsLeft > 0
            ? 'START TIMER'
            : <><span className="mr-1">DONE</span> <IconCheck className="w-4 h-4" /></>}
        </motion.button>
      </div>

      {/* AI Coach Button (FAB) */}
      {settings.enableAICoach && !isResting && !showQuitConfirm && !isComplete && (
        <AICoachButton onClick={handleOpenAICoach} />
      )}

      {/* AI Coach Panel */}
      <AICoachPanel
        isOpen={showAICoach}
        onClose={handleCloseAICoach}
        messages={chatMessages}
        onSendMessage={handleSendMessage}
        onQuickAction={handleQuickAction}
        isThinking={isAIThinking}
        error={aiError}
        onRetry={handleRetry}
      />
    </motion.div>
  )
}
