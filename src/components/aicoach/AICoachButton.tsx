import { motion } from 'framer-motion'
import { cn } from '../../utils/cn'

interface AICoachButtonProps {
  onClick: () => void
  className?: string
}

// AI Sparkle icon - custom design
function AIIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn('w-6 h-6', className)}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      {/* Chat bubble */}
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
      />
      {/* Sparkle on top */}
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 3l.5 1.5L14 5l-1.5.5L12 7l-.5-1.5L10 5l1.5-.5L12 3z"
        fill="currentColor"
      />
    </svg>
  )
}

export default function AICoachButton({ onClick, className }: AICoachButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      className={cn(
        'fixed bottom-20 right-4 z-50',
        'w-14 h-14',
        'bg-primary-600 text-white',
        'border-2 border-primary-500',
        'shadow-lg shadow-primary-900/50',
        'flex items-center justify-center',
        'transition-all duration-300',
        'hover:bg-primary-700 hover:shadow-xl',
        'animate-glow-pulse',
        className
      )}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      whileTap={{ scale: 0.9 }}
      transition={{ type: 'spring', damping: 15, stiffness: 300 }}
    >
      <AIIcon className="w-6 h-6" />
    </motion.button>
  )
}
