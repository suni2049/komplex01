import type { ReactNode } from 'react'
import type { Equipment } from '../types/exercise'
import {
    IconBodyweight,
    IconPushUpBars,
    IconPullUpBar,
    IconBands,
    IconDumbbell,
    IconMat,
    IconJumpRope,
    IconParallettes,
} from '../components/icons/Icons'

export interface EquipmentInfo {
    id: Equipment
    name: string
    icon: ReactNode
    description: string
}

export const equipmentList: EquipmentInfo[] = [
    { id: 'none', name: 'Bodyweight', icon: <IconBodyweight className="w-5 h-5" />, description: 'No equipment needed' },
    { id: 'push-up-bars', name: 'Push-Up Bars', icon: <IconPushUpBars className="w-5 h-5" />, description: 'Elevated grip for deeper push-ups' },
    { id: 'pull-up-bar', name: 'Pull-Up Bar', icon: <IconPullUpBar className="w-5 h-5" />, description: 'Doorframe or wall-mounted bar' },
    { id: 'resistance-bands', name: 'Resistance Bands', icon: <IconBands className="w-5 h-5" />, description: 'Loop or tube bands' },
    { id: 'dumbbell', name: 'Dumbbells', icon: <IconDumbbell className="w-5 h-5" />, description: 'Any weight dumbbells' },
    { id: 'yoga-mat', name: 'Yoga Mat', icon: <IconMat className="w-5 h-5" />, description: 'Padded exercise mat' },
    { id: 'jump-rope', name: 'Jump Rope', icon: <IconJumpRope className="w-5 h-5" />, description: 'Speed or weighted rope' },
    { id: 'parallettes', name: 'Parallettes', icon: <IconParallettes className="w-5 h-5" />, description: 'Low parallel bars' },
]
