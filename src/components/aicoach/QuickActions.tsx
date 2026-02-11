import { motion } from 'framer-motion'
import { cn } from '../../utils/cn'
import type { QuickAction } from '../../types/aiCoach'

interface QuickActionsProps {
  onActionClick: (action: QuickAction) => void
  disabled?: boolean
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    id: 'explain-form',
    label: 'Explain Form',
    prompt: 'Explain the proper form for this exercise in detail',
  },
  {
    id: 'common-mistakes',
    label: 'Common Mistakes',
    prompt: 'What are the most common mistakes with this exercise?',
  },
  {
    id: 'modifications',
    label: 'Show Modifications',
    prompt: 'What are easier or harder modifications for this exercise?',
  },
]

export default function QuickActions({ onActionClick, disabled }: QuickActionsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2">
      {QUICK_ACTIONS.map((action, index) => (
        <motion.button
          key={action.id}
          onClick={() => onActionClick(action)}
          disabled={disabled}
          className={cn(
            'px-3 py-2 text-[10px] font-mono font-bold tracking-wider',
            'border border-primary-500 text-primary-500',
            'whitespace-nowrap uppercase',
            'transition-all hover:bg-primary-500 hover:text-white',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          whileTap={{ scale: 0.95 }}
        >
          {action.label}
        </motion.button>
      ))}
    </div>
  )
}
