export interface Pose {
  headX: number; headY: number
  torsoEndX: number; torsoEndY: number
  leftElbowX: number; leftElbowY: number
  leftHandX: number; leftHandY: number
  rightElbowX: number; rightElbowY: number
  rightHandX: number; rightHandY: number
  leftKneeX: number; leftKneeY: number
  leftFootX: number; leftFootY: number
  rightKneeX: number; rightKneeY: number
  rightFootX: number; rightFootY: number
}

export type EasingPreset = 'easeInOut' | 'easeIn' | 'easeOut' | 'linear' | 'easeInOutCubic' | 'snap'

export interface SegmentConfig {
  duration: number
  easing: EasingPreset
  holdStart?: number
  holdEnd?: number
}

export interface SecondaryMotion {
  amplitude: number
  frequency: number
  joints: (keyof Pose)[]
}

export interface ExerciseAnimation {
  id: string
  poses: Pose[]
  duration: number
  segments?: SegmentConfig[]
  secondaryMotion?: SecondaryMotion[]
}
