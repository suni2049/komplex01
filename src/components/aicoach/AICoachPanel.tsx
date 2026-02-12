import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '../../utils/cn'
import ChatMessage from './ChatMessage'
import ChatInput from './ChatInput'
import QuickActions from './QuickActions'
import type { ChatMessage as ChatMessageType, QuickAction, AICoachError } from '../../types/aiCoach'

interface AICoachPanelProps {
  isOpen: boolean
  onClose: () => void
  messages: ChatMessageType[]
  onSendMessage: (message: string) => void
  onQuickAction: (action: QuickAction) => void
  isThinking: boolean
  error?: AICoachError | null
  onRetry?: () => void
}

// Close icon (X)
function CloseIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn('w-5 h-5', className)}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}

// Loading dots animation
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

export default function AICoachPanel({
  isOpen,
  onClose,
  messages,
  onSendMessage,
  onQuickAction,
  isThinking,
  error,
  onRetry,
}: AICoachPanelProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)

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

  // Filter out system messages for display
  const displayMessages = messages.filter((msg) => msg.role !== 'system')
  const showQuickActions = displayMessages.length === 0 && !isThinking && !error

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 mx-auto max-w-lg"
          >
            <div className="bg-surface-0 border-t-2 border-primary-500 rounded-t-xl max-h-[85vh] flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-surface-3">
                <div>
                  <h2 className="font-heading text-sm font-bold text-primary-500 tracking-widest">
                    AI COACH
                  </h2>
                  <p className="text-[9px] font-mono text-text-ghost tracking-wider">
                    TACTICAL TRAINING ASSISTANT
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 flex items-center justify-center text-text-muted hover:text-text-primary transition-colors"
                >
                  <CloseIcon />
                </button>
              </div>

              {/* Quick Actions (shown when chat is empty) */}
              {showQuickActions && (
                <div className="px-4 py-3 border-b border-surface-3">
                  <QuickActions onActionClick={onQuickAction} disabled={isThinking} />
                </div>
              )}

              {/* Messages */}
              <div
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto px-4 py-3 hide-scrollbar min-h-0"
              >
                {displayMessages.length === 0 && !isThinking && !error && (
                  <div className="text-center py-8">
                    <p className="text-xs font-mono text-text-muted">
                      Ask me anything about this exercise!
                    </p>
                    <p className="text-[10px] font-mono text-text-ghost mt-2">
                      Form cues • Modifications • Common mistakes
                    </p>
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
                    {error.retryable && onRetry && (
                      <button
                        onClick={onRetry}
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
              <ChatInput
                onSend={onSendMessage}
                disabled={isThinking}
                placeholder="Ask about form, technique, or modifications..."
              />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
