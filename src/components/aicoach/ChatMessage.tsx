import { motion } from 'framer-motion'
import { cn } from '../../utils/cn'
import type { ChatMessage as ChatMessageType } from '../../types/aiCoach'

interface ChatMessageProps {
  message: ChatMessageType
}

// Simple function to render text with basic markdown support
function renderMarkdown(text: string) {
  const parts: Array<{ type: 'text' | 'bold' | 'italic'; content: string }> = []

  // Parse **bold**, *italic*
  const regex = /(\*\*(.+?)\*\*|\*(.+?)\*)/g
  let lastIndex = 0
  let match

  while ((match = regex.exec(text)) !== null) {
    // Add text before match
    if (match.index > lastIndex) {
      parts.push({ type: 'text', content: text.slice(lastIndex, match.index) })
    }

    // Add formatted text
    if (match[2]) {
      // Bold
      parts.push({ type: 'bold', content: match[2] })
    } else if (match[3]) {
      // Italic
      parts.push({ type: 'italic', content: match[3] })
    }

    lastIndex = regex.lastIndex
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push({ type: 'text', content: text.slice(lastIndex) })
  }

  return parts.map((part, i) => {
    if (part.type === 'bold') {
      return (
        <span key={i} className="font-bold">
          {part.content}
        </span>
      )
    } else if (part.type === 'italic') {
      return (
        <span key={i} className="italic">
          {part.content}
        </span>
      )
    } else {
      return <span key={i}>{part.content}</span>
    }
  })
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user'
  const isAssistant = message.role === 'assistant'

  // Don't render system messages
  if (message.role === 'system') return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className={cn('mb-4 flex', isUser ? 'justify-end' : 'justify-start')}
    >
      <div
        className={cn(
          'max-w-[85%] rounded px-3 py-2',
          isUser && 'bg-primary-600 text-white',
          isAssistant && 'bg-surface-2 text-text-primary'
        )}
      >
        <p className="text-xs font-mono whitespace-pre-wrap break-words">
          {renderMarkdown(message.content)}
        </p>
        <p
          className={cn(
            'text-[9px] font-mono mt-1',
            isUser ? 'text-primary-200' : 'text-text-ghost'
          )}
        >
          {new Date(message.timestamp).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>
    </motion.div>
  )
}
