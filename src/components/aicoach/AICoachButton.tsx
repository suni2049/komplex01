import { motion } from 'framer-motion'
import { cn } from '../../utils/cn'

interface AICoachButtonProps {
  onClick: () => void
  className?: string
}

// Brain icon for AI Coach
function BrainIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn('w-6 h-6', className)}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
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
        'w-14 h-14 rounded-full',
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
      <BrainIcon className="w-6 h-6" />
    </motion.button>
  )
}
