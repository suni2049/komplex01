import { useState, useRef, useEffect, type KeyboardEvent } from 'react'
import { cn } from '../../utils/cn'

interface ChatInputProps {
  onSend: (message: string) => void
  disabled?: boolean
  placeholder?: string
}

// Send icon (paper plane)
function SendIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn('w-4 h-4', className)}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
      />
    </svg>
  )
}

export default function ChatInput({ onSend, disabled, placeholder }: ChatInputProps) {
  const [message, setMessage] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 96)}px`
    }
  }, [message])

  const handleSend = () => {
    const trimmed = message.trim()
    if (trimmed && !disabled) {
      onSend(trimmed)
      setMessage('')
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter to send (Shift+Enter for new line)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const charCount = message.length
  const showCharCount = charCount > 400

  return (
    <div className="border-t border-surface-3 bg-surface-0 p-3">
      <div className="flex gap-2">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value.slice(0, 500))}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || 'Ask about this exercise...'}
          disabled={disabled}
          rows={1}
          className={cn(
            'flex-1 bg-surface-1 border-2 border-surface-3 px-3 py-2',
            'text-xs font-mono text-text-primary placeholder-text-ghost',
            'focus:border-primary-500 focus:outline-none',
            'resize-none transition-all',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
        />
        <button
          onClick={handleSend}
          disabled={!message.trim() || disabled}
          className={cn(
            'px-4 py-2 text-white transition-all',
            'border-2',
            message.trim() && !disabled
              ? 'bg-primary-600 border-primary-500 hover:bg-primary-700'
              : 'bg-surface-2 border-surface-3 opacity-50 cursor-not-allowed'
          )}
        >
          <SendIcon />
        </button>
      </div>

      {/* Character counter */}
      {showCharCount && (
        <p className="text-[9px] font-mono text-text-muted mt-1 text-right">
          {charCount}/500 characters
        </p>
      )}

      {/* Keyboard hint */}
      <p className="text-[9px] font-mono text-text-ghost mt-1">
        Press Enter to send • Shift+Enter for new line
      </p>
    </div>
  )
}
