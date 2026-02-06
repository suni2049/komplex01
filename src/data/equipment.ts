import type { Equipment } from '../types/exercise'

export interface EquipmentInfo {
  id: Equipment
  name: string
  icon: string
  description: string
}

export const equipmentList: EquipmentInfo[] = [
  { id: 'none', name: 'Bodyweight', icon: '🏋️', description: 'No equipment needed' },
  { id: 'push-up-bars', name: 'Push-Up Bars', icon: '🫸', description: 'Elevated grip for deeper push-ups' },
  { id: 'pull-up-bar', name: 'Pull-Up Bar', icon: '🪝', description: 'Doorframe or wall-mounted bar' },
  { id: 'resistance-bands', name: 'Resistance Bands', icon: '🔗', description: 'Loop or tube bands' },
  { id: 'dumbbell', name: 'Dumbbells', icon: '🏋️', description: 'Any weight dumbbells' },
  { id: 'yoga-mat', name: 'Yoga Mat', icon: '🧘', description: 'Padded exercise mat' },
  { id: 'jump-rope', name: 'Jump Rope', icon: '🪢', description: 'Speed or weighted rope' },
  { id: 'parallettes', name: 'Parallettes', icon: '🤸', description: 'Low parallel bars' },
]
