import type { ExerciseAnimation } from '../../../types/animation'

// Standing base pose reference:
// Head at (100, 30), torso end at (100, 100)
// Shoulders ~(100, 58), Hips at (100, 100)

const standing = {
  headX: 100, headY: 30,
  torsoEndX: 100, torsoEndY: 100,
  leftElbowX: 75, leftElbowY: 75,
  leftHandX: 70, leftHandY: 100,
  rightElbowX: 125, rightElbowY: 75,
  rightHandX: 130, rightHandY: 100,
  leftKneeX: 88, leftKneeY: 135,
  leftFootX: 82, leftFootY: 170,
  rightKneeX: 112, rightKneeY: 135,
  rightFootX: 118, rightFootY: 170,
}

// Breathing config for isometric holds
const holdBreathing = [
  { amplitude: 3, frequency: 0.25, joints: ['headY' as const, 'torsoEndY' as const] },
]

export const animationRegistry: Record<string, ExerciseAnimation> = {
  // === PUSH-UP (4 keyframes: plank → lower mid → bottom → push mid) ===
  pushup: {
    id: 'pushup',
    duration: 2000,
    poses: [
      // Plank (top)
      { headX: 45, headY: 85, torsoEndX: 130, torsoEndY: 90,
        leftElbowX: 55, leftElbowY: 105, leftHandX: 55, leftHandY: 130,
        rightElbowX: 120, rightElbowY: 105, rightHandX: 120, rightHandY: 130,
        leftKneeX: 155, leftKneeY: 95, leftFootX: 175, leftFootY: 100,
        rightKneeX: 155, rightKneeY: 100, rightFootX: 175, rightFootY: 105 },
      // Lowering midpoint
      { headX: 45, headY: 100, torsoEndX: 130, torsoEndY: 101,
        leftElbowX: 47, leftElbowY: 105, leftHandX: 55, leftHandY: 130,
        rightElbowX: 112, rightElbowY: 105, rightHandX: 120, rightHandY: 130,
        leftKneeX: 155, leftKneeY: 105, leftFootX: 175, leftFootY: 109,
        rightKneeX: 155, rightKneeY: 110, rightFootX: 175, rightFootY: 114 },
      // Bottom
      { headX: 45, headY: 115, torsoEndX: 130, torsoEndY: 112,
        leftElbowX: 40, leftElbowY: 105, leftHandX: 55, leftHandY: 130,
        rightElbowX: 105, rightElbowY: 105, rightHandX: 120, rightHandY: 130,
        leftKneeX: 155, leftKneeY: 115, leftFootX: 175, leftFootY: 118,
        rightKneeX: 155, rightKneeY: 120, rightFootX: 175, rightFootY: 123 },
      // Pushing back up midpoint
      { headX: 45, headY: 95, torsoEndX: 130, torsoEndY: 98,
        leftElbowX: 50, leftElbowY: 105, leftHandX: 55, leftHandY: 130,
        rightElbowX: 115, rightElbowY: 105, rightHandX: 120, rightHandY: 130,
        leftKneeX: 155, leftKneeY: 102, leftFootX: 175, leftFootY: 106,
        rightKneeX: 155, rightKneeY: 107, rightFootX: 175, rightFootY: 111 },
    ],
    segments: [
      { duration: 400, easing: 'easeOut' },           // plank → lower mid: controlled start
      { duration: 350, easing: 'easeOut', holdEnd: 80 }, // lower mid → bottom: decelerate, pause
      { duration: 300, easing: 'easeIn' },             // bottom → push mid: explosive push
      { duration: 300, easing: 'easeOut', holdEnd: 120 }, // push mid → top: decelerate, hold
    ],
  },

  // === PUSH-UP WIDE ===
  pushupWide: {
    id: 'pushupWide',
    duration: 2200,
    poses: [
      // Top — hands wider apart
      { headX: 45, headY: 85, torsoEndX: 130, torsoEndY: 90,
        leftElbowX: 45, leftElbowY: 108, leftHandX: 40, leftHandY: 130,
        rightElbowX: 128, rightElbowY: 108, rightHandX: 135, rightHandY: 130,
        leftKneeX: 155, leftKneeY: 95, leftFootX: 175, leftFootY: 100,
        rightKneeX: 155, rightKneeY: 100, rightFootX: 175, rightFootY: 105 },
      // Mid descent
      { headX: 45, headY: 100, torsoEndX: 130, torsoEndY: 101,
        leftElbowX: 35, leftElbowY: 108, leftHandX: 40, leftHandY: 130,
        rightElbowX: 118, rightElbowY: 108, rightHandX: 135, rightHandY: 130,
        leftKneeX: 155, leftKneeY: 105, leftFootX: 175, leftFootY: 109,
        rightKneeX: 155, rightKneeY: 110, rightFootX: 175, rightFootY: 114 },
      // Bottom — elbows flare out
      { headX: 45, headY: 115, torsoEndX: 130, torsoEndY: 112,
        leftElbowX: 28, leftElbowY: 105, leftHandX: 40, leftHandY: 130,
        rightElbowX: 108, rightElbowY: 105, rightHandX: 135, rightHandY: 130,
        leftKneeX: 155, leftKneeY: 115, leftFootX: 175, leftFootY: 118,
        rightKneeX: 155, rightKneeY: 120, rightFootX: 175, rightFootY: 123 },
      // Push back up
      { headX: 45, headY: 95, torsoEndX: 130, torsoEndY: 98,
        leftElbowX: 40, leftElbowY: 108, leftHandX: 40, leftHandY: 130,
        rightElbowX: 122, rightElbowY: 108, rightHandX: 135, rightHandY: 130,
        leftKneeX: 155, leftKneeY: 102, leftFootX: 175, leftFootY: 106,
        rightKneeX: 155, rightKneeY: 107, rightFootX: 175, rightFootY: 111 },
    ],
    segments: [
      { duration: 450, easing: 'easeOut' },
      { duration: 400, easing: 'easeOut', holdEnd: 80 },
      { duration: 350, easing: 'easeIn' },
      { duration: 300, easing: 'easeOut', holdEnd: 120 },
    ],
  },

  // === PUSH-UP DIAMOND ===
  pushupDiamond: {
    id: 'pushupDiamond',
    duration: 2200,
    poses: [
      // Top — hands close together under chest
      { headX: 45, headY: 85, torsoEndX: 130, torsoEndY: 90,
        leftElbowX: 55, leftElbowY: 110, leftHandX: 75, leftHandY: 130,
        rightElbowX: 120, rightElbowY: 110, rightHandX: 100, rightHandY: 130,
        leftKneeX: 155, leftKneeY: 95, leftFootX: 175, leftFootY: 100,
        rightKneeX: 155, rightKneeY: 100, rightFootX: 175, rightFootY: 105 },
      // Bottom — elbows tight to body
      { headX: 45, headY: 115, torsoEndX: 130, torsoEndY: 112,
        leftElbowX: 48, leftElbowY: 108, leftHandX: 75, leftHandY: 130,
        rightElbowX: 112, rightElbowY: 108, rightHandX: 100, rightHandY: 130,
        leftKneeX: 155, leftKneeY: 115, leftFootX: 175, leftFootY: 118,
        rightKneeX: 155, rightKneeY: 120, rightFootX: 175, rightFootY: 123 },
    ],
    segments: [
      { duration: 700, easing: 'easeOut', holdEnd: 100 },
      { duration: 550, easing: 'easeIn', holdEnd: 150 },
    ],
  },

  // === PUSH-UP ARCHER ===
  pushupArcher: {
    id: 'pushupArcher',
    duration: 2400,
    poses: [
      // Top — one arm extended wide
      { headX: 45, headY: 85, torsoEndX: 130, torsoEndY: 90,
        leftElbowX: 55, leftElbowY: 105, leftHandX: 55, leftHandY: 130,
        rightElbowX: 140, rightElbowY: 90, rightHandX: 155, rightHandY: 95,
        leftKneeX: 155, leftKneeY: 95, leftFootX: 175, leftFootY: 100,
        rightKneeX: 155, rightKneeY: 100, rightFootX: 175, rightFootY: 105 },
      // Bottom — working arm bends, support arm stays straight
      { headX: 50, headY: 115, torsoEndX: 130, torsoEndY: 110,
        leftElbowX: 40, leftElbowY: 105, leftHandX: 55, leftHandY: 130,
        rightElbowX: 140, rightElbowY: 100, rightHandX: 155, rightHandY: 108,
        leftKneeX: 155, leftKneeY: 115, leftFootX: 175, leftFootY: 118,
        rightKneeX: 155, rightKneeY: 118, rightFootX: 175, rightFootY: 122 },
    ],
    segments: [
      { duration: 800, easing: 'easeOut', holdEnd: 120 },
      { duration: 600, easing: 'easeIn', holdEnd: 150 },
    ],
  },

  // === PIKE PUSH-UP ===
  pikePushup: {
    id: 'pikePushup',
    duration: 2200,
    poses: [
      // Pike position up
      { headX: 70, headY: 70, torsoEndX: 100, torsoEndY: 95,
        leftElbowX: 55, leftElbowY: 90, leftHandX: 55, leftHandY: 130,
        rightElbowX: 85, rightElbowY: 90, rightHandX: 85, rightHandY: 130,
        leftKneeX: 120, leftKneeY: 100, leftFootX: 140, leftFootY: 130,
        rightKneeX: 125, rightKneeY: 105, rightFootX: 145, rightFootY: 130 },
      // Pike position down
      { headX: 65, headY: 110, torsoEndX: 100, torsoEndY: 100,
        leftElbowX: 45, leftElbowY: 100, leftHandX: 55, leftHandY: 130,
        rightElbowX: 78, rightElbowY: 100, rightHandX: 85, rightHandY: 130,
        leftKneeX: 120, leftKneeY: 105, leftFootX: 140, leftFootY: 130,
        rightKneeX: 125, rightKneeY: 108, rightFootX: 145, rightFootY: 130 },
    ],
    segments: [
      { duration: 700, easing: 'easeOut', holdEnd: 80 },
      { duration: 550, easing: 'easeIn', holdEnd: 120 },
    ],
  },

  // === DIP ===
  dip: {
    id: 'dip',
    duration: 2000,
    poses: [
      // Top
      { ...standing, headY: 25, torsoEndY: 95,
        leftElbowX: 72, leftElbowY: 72, leftHandX: 60, leftHandY: 95,
        rightElbowX: 128, rightElbowY: 72, rightHandX: 140, rightHandY: 95,
        leftKneeX: 90, leftKneeY: 130, leftFootX: 85, leftFootY: 165,
        rightKneeX: 110, rightKneeY: 130, rightFootX: 115, rightFootY: 165 },
      // Bottom
      { ...standing, headY: 50, torsoEndY: 120,
        leftElbowX: 65, leftElbowY: 100, leftHandX: 60, leftHandY: 95,
        rightElbowX: 135, rightElbowY: 100, rightHandX: 140, rightHandY: 95,
        leftKneeX: 90, leftKneeY: 150, leftFootX: 85, leftFootY: 175,
        rightKneeX: 110, rightKneeY: 150, rightFootX: 115, rightFootY: 175 },
    ],
    segments: [
      { duration: 650, easing: 'easeOut', holdEnd: 80 },
      { duration: 500, easing: 'easeIn', holdEnd: 120 },
    ],
  },

  // === BAND PRESS ===
  bandPress: {
    id: 'bandPress',
    duration: 2000,
    poses: [
      // Arms back
      { ...standing, leftElbowX: 72, leftElbowY: 60, leftHandX: 65, leftHandY: 70,
        rightElbowX: 128, rightElbowY: 60, rightHandX: 135, rightHandY: 70 },
      // Arms extended
      { ...standing, leftElbowX: 55, leftElbowY: 55, leftHandX: 35, leftHandY: 55,
        rightElbowX: 145, rightElbowY: 55, rightHandX: 165, rightHandY: 55 },
    ],
    segments: [
      { duration: 500, easing: 'easeIn', holdEnd: 100 },
      { duration: 600, easing: 'easeOut', holdEnd: 100 },
    ],
  },

  // === PULL-UP (4 keyframes: hang → half pull → chin over → controlled lower) ===
  pullup: {
    id: 'pullup',
    duration: 3000,
    poses: [
      // Dead hang
      { headX: 100, headY: 50, torsoEndX: 100, torsoEndY: 120,
        leftElbowX: 80, leftElbowY: 30, leftHandX: 75, leftHandY: 10,
        rightElbowX: 120, rightElbowY: 30, rightHandX: 125, rightHandY: 10,
        leftKneeX: 92, leftKneeY: 150, leftFootX: 90, leftFootY: 175,
        rightKneeX: 108, rightKneeY: 150, rightFootX: 110, rightFootY: 175 },
      // Half pull
      { headX: 100, headY: 35, torsoEndX: 100, torsoEndY: 105,
        leftElbowX: 75, leftElbowY: 42, leftHandX: 75, leftHandY: 10,
        rightElbowX: 125, rightElbowY: 42, rightHandX: 125, rightHandY: 10,
        leftKneeX: 92, leftKneeY: 135, leftFootX: 90, leftFootY: 163,
        rightKneeX: 108, rightKneeY: 135, rightFootX: 110, rightFootY: 163 },
      // Chin over bar
      { headX: 100, headY: 20, torsoEndX: 100, torsoEndY: 90,
        leftElbowX: 72, leftElbowY: 50, leftHandX: 75, leftHandY: 10,
        rightElbowX: 128, rightElbowY: 50, rightHandX: 125, rightHandY: 10,
        leftKneeX: 92, leftKneeY: 120, leftFootX: 90, leftFootY: 150,
        rightKneeX: 108, rightKneeY: 120, rightFootX: 110, rightFootY: 150 },
      // Controlled lower (back to half)
      { headX: 100, headY: 38, torsoEndX: 100, torsoEndY: 108,
        leftElbowX: 76, leftElbowY: 40, leftHandX: 75, leftHandY: 10,
        rightElbowX: 124, rightElbowY: 40, rightHandX: 125, rightHandY: 10,
        leftKneeX: 92, leftKneeY: 138, leftFootX: 90, leftFootY: 166,
        rightKneeX: 108, rightKneeY: 138, rightFootX: 110, rightFootY: 166 },
    ],
    segments: [
      { duration: 500, easing: 'easeInOutCubic' },          // hang → half: grind up
      { duration: 400, easing: 'easeInOutCubic', holdEnd: 100 }, // half → chin: push through
      { duration: 600, easing: 'easeOut' },                   // chin → lower: slow controlled
      { duration: 500, easing: 'easeOut', holdEnd: 150 },     // lower → hang: settle
    ],
  },

  // === PULL-UP WIDE ===
  pullupWide: {
    id: 'pullupWide',
    duration: 3000,
    poses: [
      // Hanging — wide grip
      { headX: 100, headY: 50, torsoEndX: 100, torsoEndY: 120,
        leftElbowX: 68, leftElbowY: 30, leftHandX: 60, leftHandY: 10,
        rightElbowX: 132, rightElbowY: 30, rightHandX: 140, rightHandY: 10,
        leftKneeX: 92, leftKneeY: 150, leftFootX: 90, leftFootY: 175,
        rightKneeX: 108, rightKneeY: 150, rightFootX: 110, rightFootY: 175 },
      // Top — elbows flare wide
      { headX: 100, headY: 22, torsoEndX: 100, torsoEndY: 92,
        leftElbowX: 58, leftElbowY: 52, leftHandX: 60, leftHandY: 10,
        rightElbowX: 142, rightElbowY: 52, rightHandX: 140, rightHandY: 10,
        leftKneeX: 92, leftKneeY: 122, leftFootX: 90, leftFootY: 152,
        rightKneeX: 108, rightKneeY: 122, rightFootX: 110, rightFootY: 152 },
    ],
    segments: [
      { duration: 800, easing: 'easeInOutCubic', holdEnd: 100 },
      { duration: 700, easing: 'easeOut', holdEnd: 200 },
    ],
  },

  // === BAND PULL ===
  bandPull: {
    id: 'bandPull',
    duration: 2000,
    poses: [
      // Arms forward
      { ...standing, leftElbowX: 70, leftElbowY: 55, leftHandX: 50, leftHandY: 55,
        rightElbowX: 130, rightElbowY: 55, rightHandX: 150, rightHandY: 55 },
      // Arms apart
      { ...standing, leftElbowX: 55, leftElbowY: 55, leftHandX: 30, leftHandY: 60,
        rightElbowX: 145, rightElbowY: 55, rightHandX: 170, rightHandY: 60 },
    ],
    segments: [
      { duration: 500, easing: 'easeIn', holdEnd: 120 },
      { duration: 500, easing: 'easeOut', holdEnd: 100 },
    ],
  },

  // === SUPERMAN ===
  superman: {
    id: 'superman',
    duration: 2500,
    poses: [
      // Lying flat
      { headX: 35, headY: 130, torsoEndX: 120, torsoEndY: 132,
        leftElbowX: 25, leftElbowY: 128, leftHandX: 10, leftHandY: 128,
        rightElbowX: 25, rightElbowY: 135, rightHandX: 10, rightHandY: 135,
        leftKneeX: 145, leftKneeY: 132, leftFootX: 170, leftFootY: 132,
        rightKneeX: 145, rightKneeY: 138, rightFootX: 170, rightFootY: 138 },
      // Lifted
      { headX: 35, headY: 115, torsoEndX: 120, torsoEndY: 130,
        leftElbowX: 22, leftElbowY: 110, leftHandX: 8, leftHandY: 108,
        rightElbowX: 22, rightElbowY: 118, rightHandX: 8, rightHandY: 115,
        leftKneeX: 145, leftKneeY: 125, leftFootX: 172, leftFootY: 118,
        rightKneeX: 145, rightKneeY: 128, rightFootX: 172, rightFootY: 122 },
    ],
    segments: [
      { duration: 600, easing: 'easeOut', holdEnd: 200 },
      { duration: 500, easing: 'easeIn', holdEnd: 200 },
    ],
  },

  // === INVERTED ROW ===
  invertedRow: {
    id: 'invertedRow',
    duration: 2000,
    poses: [
      // Extended
      { headX: 40, headY: 100, torsoEndX: 130, torsoEndY: 105,
        leftElbowX: 50, leftElbowY: 80, leftHandX: 50, leftHandY: 60,
        rightElbowX: 110, rightElbowY: 80, rightHandX: 110, rightHandY: 60,
        leftKneeX: 150, leftKneeY: 105, leftFootX: 175, leftFootY: 120,
        rightKneeX: 155, rightKneeY: 110, rightFootX: 178, rightFootY: 125 },
      // Pulled up
      { headX: 40, headY: 75, torsoEndX: 130, torsoEndY: 80,
        leftElbowX: 40, leftElbowY: 72, leftHandX: 50, leftHandY: 60,
        rightElbowX: 100, rightElbowY: 72, rightHandX: 110, rightHandY: 60,
        leftKneeX: 150, leftKneeY: 85, leftFootX: 175, leftFootY: 110,
        rightKneeX: 155, rightKneeY: 90, rightFootX: 178, rightFootY: 115 },
    ],
    segments: [
      { duration: 500, easing: 'easeIn', holdEnd: 120 },
      { duration: 600, easing: 'easeOut', holdEnd: 100 },
    ],
  },

  // === SQUAT (4 keyframes: stand → quarter → parallel → rise) ===
  squat: {
    id: 'squat',
    duration: 2400,
    poses: [
      // Standing
      { ...standing, leftHandX: 60, leftHandY: 55, rightHandX: 140, rightHandY: 55 },
      // Quarter squat — torso tilts forward slightly
      { headX: 100, headY: 42, torsoEndX: 100, torsoEndY: 106,
        leftElbowX: 73, leftElbowY: 68, leftHandX: 60, leftHandY: 65,
        rightElbowX: 127, rightElbowY: 68, rightHandX: 140, rightHandY: 65,
        leftKneeX: 80, leftKneeY: 135, leftFootX: 78, leftFootY: 170,
        rightKneeX: 120, rightKneeY: 135, rightFootX: 122, rightFootY: 170 },
      // Parallel (full depth)
      { headX: 100, headY: 60, torsoEndX: 100, torsoEndY: 115,
        leftElbowX: 72, leftElbowY: 80, leftHandX: 60, leftHandY: 80,
        rightElbowX: 128, rightElbowY: 80, rightHandX: 140, rightHandY: 80,
        leftKneeX: 72, leftKneeY: 135, leftFootX: 75, leftFootY: 170,
        rightKneeX: 128, rightKneeY: 135, rightFootX: 125, rightFootY: 170 },
      // Rising (slight bounce past standing)
      { headX: 100, headY: 32, torsoEndX: 100, torsoEndY: 101,
        leftElbowX: 74, leftElbowY: 74, leftHandX: 60, leftHandY: 57,
        rightElbowX: 126, rightElbowY: 74, rightHandX: 140, rightHandY: 57,
        leftKneeX: 87, leftKneeY: 135, leftFootX: 82, leftFootY: 170,
        rightKneeX: 113, rightKneeY: 135, rightFootX: 118, rightFootY: 170 },
    ],
    segments: [
      { duration: 350, easing: 'easeOut' },            // stand → quarter
      { duration: 400, easing: 'easeOut', holdEnd: 80 }, // quarter → parallel: decelerate
      { duration: 350, easing: 'easeIn' },              // parallel → rise: drive up
      { duration: 300, easing: 'easeOut', holdEnd: 100 }, // rise → stand: settle
    ],
  },

  // === SUMO SQUAT ===
  sumoSquat: {
    id: 'sumoSquat',
    duration: 2400,
    poses: [
      // Wide stance standing
      { headX: 100, headY: 30, torsoEndX: 100, torsoEndY: 100,
        leftElbowX: 75, leftElbowY: 75, leftHandX: 70, leftHandY: 100,
        rightElbowX: 125, rightElbowY: 75, rightHandX: 130, rightHandY: 100,
        leftKneeX: 72, leftKneeY: 135, leftFootX: 60, leftFootY: 170,
        rightKneeX: 128, rightKneeY: 135, rightFootX: 140, rightFootY: 170 },
      // Sumo squat — knees wide, torso upright
      { headX: 100, headY: 55, torsoEndX: 100, torsoEndY: 115,
        leftElbowX: 72, leftElbowY: 82, leftHandX: 65, leftHandY: 95,
        rightElbowX: 128, rightElbowY: 82, rightHandX: 135, rightHandY: 95,
        leftKneeX: 58, leftKneeY: 130, leftFootX: 55, leftFootY: 170,
        rightKneeX: 142, rightKneeY: 130, rightFootX: 145, rightFootY: 170 },
    ],
    segments: [
      { duration: 650, easing: 'easeOut', holdEnd: 100 },
      { duration: 550, easing: 'easeIn', holdEnd: 100 },
    ],
  },

  // === PISTOL SQUAT ===
  pistolSquat: {
    id: 'pistolSquat',
    duration: 3000,
    poses: [
      // Standing on one leg
      { headX: 100, headY: 30, torsoEndX: 100, torsoEndY: 100,
        leftElbowX: 70, leftElbowY: 55, leftHandX: 55, leftHandY: 55,
        rightElbowX: 130, rightElbowY: 55, rightHandX: 145, rightHandY: 55,
        leftKneeX: 95, leftKneeY: 135, leftFootX: 93, leftFootY: 170,
        rightKneeX: 120, rightKneeY: 115, rightFootX: 140, rightFootY: 110 },
      // Deep single-leg squat — non-working leg extended forward
      { headX: 100, headY: 65, torsoEndX: 100, torsoEndY: 120,
        leftElbowX: 70, leftElbowY: 80, leftHandX: 55, leftHandY: 80,
        rightElbowX: 130, rightElbowY: 80, rightHandX: 145, rightHandY: 80,
        leftKneeX: 75, leftKneeY: 140, leftFootX: 72, leftFootY: 170,
        rightKneeX: 120, rightKneeY: 100, rightFootX: 150, rightFootY: 95 },
    ],
    segments: [
      { duration: 900, easing: 'easeOut', holdEnd: 150 },
      { duration: 800, easing: 'easeInOutCubic', holdEnd: 200 },
    ],
  },

  // === HIP HINGE (RDL / Good Morning) ===
  hipHinge: {
    id: 'hipHinge',
    duration: 2600,
    poses: [
      // Standing tall
      { ...standing, leftHandX: 75, leftHandY: 75, rightHandX: 125, rightHandY: 75 },
      // Hinged forward — flat back, slight knee bend
      { headX: 65, headY: 55, torsoEndX: 100, torsoEndY: 105,
        leftElbowX: 60, leftElbowY: 70, leftHandX: 68, leftHandY: 85,
        rightElbowX: 90, rightElbowY: 70, rightHandX: 95, rightHandY: 85,
        leftKneeX: 88, leftKneeY: 138, leftFootX: 82, leftFootY: 170,
        rightKneeX: 112, rightKneeY: 138, rightFootX: 118, rightFootY: 170 },
    ],
    segments: [
      { duration: 700, easing: 'easeOut', holdEnd: 200 },
      { duration: 600, easing: 'easeIn', holdEnd: 200 },
    ],
  },

  // === JUMP SQUAT (4 keyframes: squat → power up → airborne → soft land) ===
  jumpSquat: {
    id: 'jumpSquat',
    duration: 1800,
    poses: [
      // Deep squat
      { headX: 100, headY: 60, torsoEndX: 100, torsoEndY: 115,
        leftElbowX: 72, leftElbowY: 80, leftHandX: 60, leftHandY: 90,
        rightElbowX: 128, rightElbowY: 80, rightHandX: 140, rightHandY: 90,
        leftKneeX: 72, leftKneeY: 135, leftFootX: 75, leftFootY: 170,
        rightKneeX: 128, rightKneeY: 135, rightFootX: 125, rightFootY: 170 },
      // Power up — legs extending, arms swinging
      { headX: 100, headY: 28, torsoEndX: 100, torsoEndY: 92,
        leftElbowX: 72, leftElbowY: 55, leftHandX: 60, leftHandY: 40,
        rightElbowX: 128, rightElbowY: 55, rightHandX: 140, rightHandY: 40,
        leftKneeX: 88, leftKneeY: 125, leftFootX: 82, leftFootY: 160,
        rightKneeX: 112, rightKneeY: 125, rightFootX: 118, rightFootY: 160 },
      // Airborne
      { headX: 100, headY: 10, torsoEndX: 100, torsoEndY: 78,
        leftElbowX: 72, leftElbowY: 30, leftHandX: 60, leftHandY: 15,
        rightElbowX: 128, rightElbowY: 30, rightHandX: 140, rightHandY: 15,
        leftKneeX: 88, leftKneeY: 110, leftFootX: 82, leftFootY: 140,
        rightKneeX: 112, rightKneeY: 110, rightFootX: 118, rightFootY: 140 },
      // Soft landing (quarter squat)
      { headX: 100, headY: 42, torsoEndX: 100, torsoEndY: 108,
        leftElbowX: 72, leftElbowY: 70, leftHandX: 60, leftHandY: 78,
        rightElbowX: 128, rightElbowY: 70, rightHandX: 140, rightHandY: 78,
        leftKneeX: 80, leftKneeY: 135, leftFootX: 78, leftFootY: 170,
        rightKneeX: 120, rightKneeY: 135, rightFootX: 122, rightFootY: 170 },
    ],
    segments: [
      { duration: 250, easing: 'snap' },                // squat → power up: explosive
      { duration: 200, easing: 'easeOut' },              // power up → airborne: launch
      { duration: 250, easing: 'easeIn' },               // airborne → landing: gravity
      { duration: 400, easing: 'easeOut', holdEnd: 100 }, // landing → squat: absorb
    ],
  },

  // === LUNGE (3 keyframes: stand → step → deep lunge) ===
  lunge: {
    id: 'lunge',
    duration: 2400,
    poses: [
      // Standing
      standing,
      // Step forward
      { headX: 100, headY: 35, torsoEndX: 100, torsoEndY: 105,
        leftElbowX: 82, leftElbowY: 82, leftHandX: 80, leftHandY: 105,
        rightElbowX: 118, rightElbowY: 82, rightHandX: 120, rightHandY: 105,
        leftKneeX: 78, leftKneeY: 132, leftFootX: 62, leftFootY: 170,
        rightKneeX: 120, rightKneeY: 140, rightFootX: 130, rightFootY: 170 },
      // Deep lunge
      { headX: 100, headY: 40, torsoEndX: 100, torsoEndY: 110,
        leftElbowX: 82, leftElbowY: 85, leftHandX: 80, leftHandY: 110,
        rightElbowX: 118, rightElbowY: 85, rightHandX: 120, rightHandY: 110,
        leftKneeX: 70, leftKneeY: 130, leftFootX: 55, leftFootY: 170,
        rightKneeX: 130, rightKneeY: 150, rightFootX: 140, rightFootY: 170 },
    ],
    segments: [
      { duration: 400, easing: 'easeOut' },              // stand → step
      { duration: 400, easing: 'easeOut', holdEnd: 100 }, // step → deep: controlled
      { duration: 500, easing: 'easeIn', holdEnd: 80 },   // deep → stand: drive back
    ],
  },

  // === LATERAL LUNGE ===
  lateralLunge: {
    id: 'lateralLunge',
    duration: 2400,
    poses: [
      // Standing
      standing,
      // Lateral lunge left — wide step, one leg bent
      { headX: 75, headY: 55, torsoEndX: 80, torsoEndY: 115,
        leftElbowX: 62, leftElbowY: 82, leftHandX: 58, leftHandY: 100,
        rightElbowX: 98, rightElbowY: 82, rightHandX: 95, rightHandY: 100,
        leftKneeX: 55, leftKneeY: 135, leftFootX: 45, leftFootY: 170,
        rightKneeX: 115, rightKneeY: 125, rightFootX: 135, rightFootY: 170 },
    ],
    segments: [
      { duration: 600, easing: 'easeOut', holdEnd: 150 },
      { duration: 500, easing: 'easeIn', holdEnd: 100 },
    ],
  },

  // === SPLIT SQUAT (Bulgarian) ===
  splitSquat: {
    id: 'splitSquat',
    duration: 2400,
    poses: [
      // Standing split stance — rear foot elevated
      { headX: 100, headY: 30, torsoEndX: 100, torsoEndY: 100,
        leftElbowX: 82, leftElbowY: 75, leftHandX: 80, leftHandY: 100,
        rightElbowX: 118, rightElbowY: 75, rightHandX: 120, rightHandY: 100,
        leftKneeX: 82, leftKneeY: 135, leftFootX: 75, leftFootY: 170,
        rightKneeX: 128, rightKneeY: 120, rightFootX: 145, rightFootY: 110 },
      // Deep split — front knee bends, rear knee drops
      { headX: 100, headY: 50, torsoEndX: 100, torsoEndY: 115,
        leftElbowX: 82, leftElbowY: 88, leftHandX: 80, leftHandY: 115,
        rightElbowX: 118, rightElbowY: 88, rightHandX: 120, rightHandY: 115,
        leftKneeX: 72, leftKneeY: 140, leftFootX: 65, leftFootY: 170,
        rightKneeX: 130, rightKneeY: 150, rightFootX: 145, rightFootY: 130 },
    ],
    segments: [
      { duration: 650, easing: 'easeOut', holdEnd: 100 },
      { duration: 550, easing: 'easeIn', holdEnd: 100 },
    ],
  },

  // === CALF RAISE ===
  calfRaise: {
    id: 'calfRaise',
    duration: 1600,
    poses: [
      standing,
      { ...standing, headY: 22, torsoEndY: 92,
        leftElbowY: 67, leftHandY: 92,
        rightElbowY: 67, rightHandY: 92,
        leftKneeY: 127, leftFootY: 160,
        rightKneeY: 127, rightFootY: 160 },
    ],
    segments: [
      { duration: 400, easing: 'easeIn', holdEnd: 150 },
      { duration: 350, easing: 'easeOut', holdEnd: 100 },
    ],
  },

  // === BRIDGE ===
  bridge: {
    id: 'bridge',
    duration: 2200,
    poses: [
      // Down
      { headX: 40, headY: 135, torsoEndX: 100, torsoEndY: 135,
        leftElbowX: 50, leftElbowY: 120, leftHandX: 50, leftHandY: 135,
        rightElbowX: 80, rightElbowY: 120, rightHandX: 80, rightHandY: 135,
        leftKneeX: 120, leftKneeY: 110, leftFootX: 140, leftFootY: 140,
        rightKneeX: 130, rightKneeY: 115, rightFootX: 155, rightFootY: 140 },
      // Up (bridged)
      { headX: 40, headY: 135, torsoEndX: 100, torsoEndY: 110,
        leftElbowX: 50, leftElbowY: 120, leftHandX: 50, leftHandY: 135,
        rightElbowX: 80, rightElbowY: 120, rightHandX: 80, rightHandY: 135,
        leftKneeX: 120, leftKneeY: 95, leftFootX: 140, leftFootY: 140,
        rightKneeX: 130, rightKneeY: 100, rightFootX: 155, rightFootY: 140 },
    ],
    segments: [
      { duration: 500, easing: 'easeIn', holdEnd: 200 },
      { duration: 500, easing: 'easeOut', holdEnd: 150 },
    ],
  },

  // === WALL SIT (isometric with breathing) ===
  wallSit: {
    id: 'wallSit',
    duration: 3000,
    poses: [
      { headX: 100, headY: 40, torsoEndX: 100, torsoEndY: 110,
        leftElbowX: 72, leftElbowY: 85, leftHandX: 65, leftHandY: 110,
        rightElbowX: 128, rightElbowY: 85, rightHandX: 135, rightHandY: 110,
        leftKneeX: 65, leftKneeY: 115, leftFootX: 65, leftFootY: 170,
        rightKneeX: 135, rightKneeY: 115, rightFootX: 135, rightFootY: 170 },
      { headX: 100, headY: 38, torsoEndX: 100, torsoEndY: 108,
        leftElbowX: 72, leftElbowY: 83, leftHandX: 65, leftHandY: 108,
        rightElbowX: 128, rightElbowY: 83, rightHandX: 135, rightHandY: 108,
        leftKneeX: 65, leftKneeY: 113, leftFootX: 65, leftFootY: 170,
        rightKneeX: 135, rightKneeY: 113, rightFootX: 135, rightFootY: 170 },
    ],
    secondaryMotion: holdBreathing,
  },

  // === PLANK (isometric with breathing) ===
  plank: {
    id: 'plank',
    duration: 3000,
    poses: [
      { headX: 40, headY: 100, torsoEndX: 135, torsoEndY: 105,
        leftElbowX: 50, leftElbowY: 115, leftHandX: 40, leftHandY: 130,
        rightElbowX: 95, rightElbowY: 115, rightHandX: 85, rightHandY: 130,
        leftKneeX: 150, leftKneeY: 108, leftFootX: 175, leftFootY: 112,
        rightKneeX: 155, rightKneeY: 112, rightFootX: 178, rightFootY: 116 },
      { headX: 40, headY: 98, torsoEndX: 135, torsoEndY: 103,
        leftElbowX: 50, leftElbowY: 113, leftHandX: 40, leftHandY: 130,
        rightElbowX: 95, rightElbowY: 113, rightHandX: 85, rightHandY: 130,
        leftKneeX: 150, leftKneeY: 106, leftFootX: 175, leftFootY: 110,
        rightKneeX: 155, rightKneeY: 110, rightFootX: 178, rightFootY: 114 },
    ],
    secondaryMotion: holdBreathing,
  },

  // === SIDE PLANK (isometric with breathing) ===
  sidePlank: {
    id: 'sidePlank',
    duration: 3000,
    poses: [
      { headX: 55, headY: 55, torsoEndX: 55, torsoEndY: 125,
        leftElbowX: 55, leftElbowY: 140, leftHandX: 55, leftHandY: 165,
        rightElbowX: 55, rightElbowY: 40, rightHandX: 55, rightHandY: 20,
        leftKneeX: 55, leftKneeY: 150, leftFootX: 55, leftFootY: 175,
        rightKneeX: 55, rightKneeY: 150, rightFootX: 55, rightFootY: 175 },
      { headX: 55, headY: 53, torsoEndX: 55, torsoEndY: 123,
        leftElbowX: 55, leftElbowY: 138, leftHandX: 55, leftHandY: 165,
        rightElbowX: 55, rightElbowY: 38, rightHandX: 55, rightHandY: 18,
        leftKneeX: 55, leftKneeY: 148, leftFootX: 55, leftFootY: 175,
        rightKneeX: 55, rightKneeY: 148, rightFootX: 55, rightFootY: 175 },
    ],
    secondaryMotion: holdBreathing,
  },

  // === DEAD BUG ===
  deadBug: {
    id: 'deadBug',
    duration: 2400,
    poses: [
      { headX: 100, headY: 145, torsoEndX: 100, torsoEndY: 110,
        leftElbowX: 80, leftElbowY: 95, leftHandX: 75, leftHandY: 80,
        rightElbowX: 120, rightElbowY: 130, rightHandX: 135, rightHandY: 145,
        leftKneeX: 80, leftKneeY: 100, leftFootX: 70, leftFootY: 80,
        rightKneeX: 120, rightKneeY: 95, rightFootX: 120, rightFootY: 80 },
      { headX: 100, headY: 145, torsoEndX: 100, torsoEndY: 110,
        leftElbowX: 80, leftElbowY: 130, leftHandX: 65, leftHandY: 145,
        rightElbowX: 120, rightElbowY: 95, rightHandX: 125, rightHandY: 80,
        leftKneeX: 80, leftKneeY: 95, leftFootX: 80, leftFootY: 80,
        rightKneeX: 120, rightKneeY: 100, rightFootX: 130, rightFootY: 80 },
    ],
    segments: [
      { duration: 600, easing: 'easeInOut', holdEnd: 150 },
      { duration: 600, easing: 'easeInOut', holdEnd: 150 },
    ],
  },

  // === CRUNCH / V-UP ===
  crunch: {
    id: 'crunch',
    duration: 2000,
    poses: [
      // Lying flat
      { headX: 40, headY: 130, torsoEndX: 110, torsoEndY: 130,
        leftElbowX: 35, leftElbowY: 115, leftHandX: 40, leftHandY: 115,
        rightElbowX: 45, rightElbowY: 118, rightHandX: 50, rightHandY: 118,
        leftKneeX: 130, leftKneeY: 110, leftFootX: 155, leftFootY: 130,
        rightKneeX: 135, rightKneeY: 115, rightFootX: 160, rightFootY: 130 },
      // Crunched
      { headX: 60, headY: 105, torsoEndX: 110, torsoEndY: 120,
        leftElbowX: 50, leftElbowY: 90, leftHandX: 55, leftHandY: 85,
        rightElbowX: 60, rightElbowY: 93, rightHandX: 65, rightHandY: 88,
        leftKneeX: 120, leftKneeY: 100, leftFootX: 130, leftFootY: 120,
        rightKneeX: 125, rightKneeY: 105, rightFootX: 135, rightFootY: 120 },
    ],
    segments: [
      { duration: 450, easing: 'easeIn', holdEnd: 100 },
      { duration: 500, easing: 'easeOut', holdEnd: 100 },
    ],
  },

  // === LEG RAISE ===
  legRaise: {
    id: 'legRaise',
    duration: 2200,
    poses: [
      // Legs down
      { headX: 40, headY: 130, torsoEndX: 110, torsoEndY: 130,
        leftElbowX: 50, leftElbowY: 120, leftHandX: 60, leftHandY: 130,
        rightElbowX: 90, rightElbowY: 120, rightHandX: 100, rightHandY: 130,
        leftKneeX: 135, leftKneeY: 130, leftFootX: 165, leftFootY: 130,
        rightKneeX: 138, rightKneeY: 135, rightFootX: 168, rightFootY: 135 },
      // Legs up
      { headX: 40, headY: 130, torsoEndX: 110, torsoEndY: 130,
        leftElbowX: 50, leftElbowY: 120, leftHandX: 60, leftHandY: 130,
        rightElbowX: 90, rightElbowY: 120, rightHandX: 100, rightHandY: 130,
        leftKneeX: 125, leftKneeY: 95, leftFootX: 140, leftFootY: 65,
        rightKneeX: 128, rightKneeY: 98, rightFootX: 143, rightFootY: 68 },
    ],
    segments: [
      { duration: 600, easing: 'easeInOutCubic', holdEnd: 100 },
      { duration: 650, easing: 'easeOut', holdEnd: 100 },
    ],
  },

  // === FLUTTER KICK ===
  flutterKick: {
    id: 'flutterKick',
    duration: 800,
    poses: [
      { headX: 40, headY: 130, torsoEndX: 110, torsoEndY: 130,
        leftElbowX: 50, leftElbowY: 120, leftHandX: 60, leftHandY: 130,
        rightElbowX: 90, rightElbowY: 120, rightHandX: 100, rightHandY: 130,
        leftKneeX: 135, leftKneeY: 118, leftFootX: 165, leftFootY: 110,
        rightKneeX: 138, rightKneeY: 135, rightFootX: 168, rightFootY: 138 },
      { headX: 40, headY: 130, torsoEndX: 110, torsoEndY: 130,
        leftElbowX: 50, leftElbowY: 120, leftHandX: 60, leftHandY: 130,
        rightElbowX: 90, rightElbowY: 120, rightHandX: 100, rightHandY: 130,
        leftKneeX: 135, leftKneeY: 135, leftFootX: 165, leftFootY: 138,
        rightKneeX: 138, rightKneeY: 118, rightFootX: 168, rightFootY: 110 },
    ],
    segments: [
      { duration: 200, easing: 'linear' },
      { duration: 200, easing: 'linear' },
    ],
  },

  // === RUSSIAN TWIST ===
  russianTwist: {
    id: 'russianTwist',
    duration: 1600,
    poses: [
      { headX: 85, headY: 50, torsoEndX: 100, torsoEndY: 120,
        leftElbowX: 55, leftElbowY: 80, leftHandX: 45, leftHandY: 95,
        rightElbowX: 70, rightElbowY: 80, rightHandX: 55, rightHandY: 95,
        leftKneeX: 85, leftKneeY: 115, leftFootX: 80, leftFootY: 95,
        rightKneeX: 115, rightKneeY: 115, rightFootX: 120, rightFootY: 95 },
      { headX: 115, headY: 50, torsoEndX: 100, torsoEndY: 120,
        leftElbowX: 130, leftElbowY: 80, leftHandX: 145, leftHandY: 95,
        rightElbowX: 145, rightElbowY: 80, rightHandX: 155, rightHandY: 95,
        leftKneeX: 85, leftKneeY: 115, leftFootX: 80, leftFootY: 95,
        rightKneeX: 115, rightKneeY: 115, rightFootX: 120, rightFootY: 95 },
    ],
    segments: [
      { duration: 350, easing: 'easeInOut', holdEnd: 50 },
      { duration: 350, easing: 'easeInOut', holdEnd: 50 },
    ],
  },

  // === HOLLOW HOLD (isometric with breathing) ===
  hollowHold: {
    id: 'hollowHold',
    duration: 3000,
    poses: [
      { headX: 45, headY: 118, torsoEndX: 110, torsoEndY: 130,
        leftElbowX: 30, leftElbowY: 108, leftHandX: 15, leftHandY: 105,
        rightElbowX: 35, rightElbowY: 112, rightHandX: 20, rightHandY: 108,
        leftKneeX: 130, leftKneeY: 120, leftFootX: 155, leftFootY: 112,
        rightKneeX: 133, rightKneeY: 123, rightFootX: 158, rightFootY: 115 },
      { headX: 45, headY: 116, torsoEndX: 110, torsoEndY: 128,
        leftElbowX: 30, leftElbowY: 106, leftHandX: 15, leftHandY: 103,
        rightElbowX: 35, rightElbowY: 110, rightHandX: 20, rightHandY: 106,
        leftKneeX: 130, leftKneeY: 118, leftFootX: 155, leftFootY: 110,
        rightKneeX: 133, rightKneeY: 121, rightFootX: 158, rightFootY: 113 },
    ],
    secondaryMotion: holdBreathing,
  },

  // === L-SIT (isometric with breathing) ===
  lSit: {
    id: 'lSit',
    duration: 3000,
    poses: [
      { headX: 100, headY: 30, torsoEndX: 100, torsoEndY: 100,
        leftElbowX: 72, leftElbowY: 80, leftHandX: 65, leftHandY: 100,
        rightElbowX: 128, rightElbowY: 80, rightHandX: 135, rightHandY: 100,
        leftKneeX: 75, leftKneeY: 85, leftFootX: 50, leftFootY: 85,
        rightKneeX: 80, rightKneeY: 90, rightFootX: 55, rightFootY: 90 },
      { headX: 100, headY: 28, torsoEndX: 100, torsoEndY: 98,
        leftElbowX: 72, leftElbowY: 78, leftHandX: 65, leftHandY: 100,
        rightElbowX: 128, rightElbowY: 78, rightHandX: 135, rightHandY: 100,
        leftKneeX: 75, leftKneeY: 83, leftFootX: 50, leftFootY: 83,
        rightKneeX: 80, rightKneeY: 88, rightFootX: 55, rightFootY: 88 },
    ],
    secondaryMotion: holdBreathing,
  },

  // === MOUNTAIN CLIMBER ===
  mountainClimber: {
    id: 'mountainClimber',
    duration: 800,
    poses: [
      // Left knee in
      { headX: 45, headY: 85, torsoEndX: 120, torsoEndY: 92,
        leftElbowX: 50, leftElbowY: 105, leftHandX: 45, leftHandY: 130,
        rightElbowX: 100, rightElbowY: 105, rightHandX: 95, rightHandY: 130,
        leftKneeX: 90, leftKneeY: 90, leftFootX: 80, leftFootY: 105,
        rightKneeX: 155, rightKneeY: 98, rightFootX: 175, rightFootY: 105 },
      // Right knee in
      { headX: 45, headY: 85, torsoEndX: 120, torsoEndY: 92,
        leftElbowX: 50, leftElbowY: 105, leftHandX: 45, leftHandY: 130,
        rightElbowX: 100, rightElbowY: 105, rightHandX: 95, rightHandY: 130,
        leftKneeX: 155, leftKneeY: 98, leftFootX: 175, leftFootY: 105,
        rightKneeX: 90, rightKneeY: 90, rightFootX: 80, rightFootY: 105 },
    ],
    segments: [
      { duration: 200, easing: 'snap' },
      { duration: 200, easing: 'snap' },
    ],
  },

  // === JUMPING JACK (4 keyframes: closed → mid-open → full open → mid-close) ===
  jumpingJack: {
    id: 'jumpingJack',
    duration: 1200,
    poses: [
      // Closed
      { ...standing },
      // Mid-opening — arms at 45deg, feet stepping out
      { headX: 100, headY: 29, torsoEndX: 100, torsoEndY: 99,
        leftElbowX: 67, leftElbowY: 58, leftHandX: 55, leftHandY: 45,
        rightElbowX: 133, rightElbowY: 58, rightHandX: 145, rightHandY: 45,
        leftKneeX: 80, leftKneeY: 132, leftFootX: 70, leftFootY: 169,
        rightKneeX: 120, rightKneeY: 132, rightFootX: 130, rightFootY: 169 },
      // Full open
      { headX: 100, headY: 28, torsoEndX: 100, torsoEndY: 98,
        leftElbowX: 60, leftElbowY: 45, leftHandX: 42, leftHandY: 22,
        rightElbowX: 140, rightElbowY: 45, rightHandX: 158, rightHandY: 22,
        leftKneeX: 72, leftKneeY: 130, leftFootX: 58, leftFootY: 168,
        rightKneeX: 128, rightKneeY: 130, rightFootX: 142, rightFootY: 168 },
      // Mid-closing
      { headX: 100, headY: 29, torsoEndX: 100, torsoEndY: 99,
        leftElbowX: 67, leftElbowY: 58, leftHandX: 55, leftHandY: 45,
        rightElbowX: 133, rightElbowY: 58, rightHandX: 145, rightHandY: 45,
        leftKneeX: 80, leftKneeY: 132, leftFootX: 70, leftFootY: 169,
        rightKneeX: 120, rightKneeY: 132, rightFootX: 130, rightFootY: 169 },
    ],
    segments: [
      { duration: 150, easing: 'easeIn' },     // closed → mid-out
      { duration: 150, easing: 'easeOut' },     // mid-out → full
      { duration: 150, easing: 'easeIn' },      // full → mid-close
      { duration: 150, easing: 'easeOut' },     // mid-close → closed
    ],
  },

  // === BURPEE (5 keyframes: stand → squat → plank → squat → jump) ===
  burpee: {
    id: 'burpee',
    duration: 3200,
    poses: [
      // Standing
      standing,
      // Squat down
      { headX: 100, headY: 65, torsoEndX: 100, torsoEndY: 118,
        leftElbowX: 72, leftElbowY: 95, leftHandX: 60, leftHandY: 118,
        rightElbowX: 128, rightElbowY: 95, rightHandX: 140, rightHandY: 118,
        leftKneeX: 72, leftKneeY: 140, leftFootX: 75, leftFootY: 170,
        rightKneeX: 128, rightKneeY: 140, rightFootX: 125, rightFootY: 170 },
      // Plank
      { headX: 45, headY: 100, torsoEndX: 130, torsoEndY: 105,
        leftElbowX: 55, leftElbowY: 115, leftHandX: 55, leftHandY: 135,
        rightElbowX: 120, rightElbowY: 115, rightHandX: 120, rightHandY: 135,
        leftKneeX: 155, leftKneeY: 108, leftFootX: 175, leftFootY: 112,
        rightKneeX: 155, rightKneeY: 114, rightFootX: 175, rightFootY: 118 },
      // Back to squat
      { headX: 100, headY: 65, torsoEndX: 100, torsoEndY: 118,
        leftElbowX: 72, leftElbowY: 95, leftHandX: 60, leftHandY: 118,
        rightElbowX: 128, rightElbowY: 95, rightHandX: 140, rightHandY: 118,
        leftKneeX: 72, leftKneeY: 140, leftFootX: 75, leftFootY: 170,
        rightKneeX: 128, rightKneeY: 140, rightFootX: 125, rightFootY: 170 },
      // Jump
      { headX: 100, headY: 10, torsoEndX: 100, torsoEndY: 78,
        leftElbowX: 72, leftElbowY: 30, leftHandX: 60, leftHandY: 12,
        rightElbowX: 128, rightElbowY: 30, rightHandX: 140, rightHandY: 12,
        leftKneeX: 88, leftKneeY: 112, leftFootX: 82, leftFootY: 142,
        rightKneeX: 112, rightKneeY: 112, rightFootX: 118, rightFootY: 142 },
    ],
    segments: [
      { duration: 350, easing: 'easeOut' },             // stand → squat
      { duration: 300, easing: 'snap' },                 // squat → plank: fast kick back
      { duration: 300, easing: 'snap' },                 // plank → squat: fast hop in
      { duration: 250, easing: 'snap' },                 // squat → jump: explosive
      { duration: 350, easing: 'easeOut', holdEnd: 100 }, // jump → stand: land and settle
    ],
  },

  // === HIGH KNEES (4 keyframes: L-up → transition → R-up → transition) ===
  highKnees: {
    id: 'highKnees',
    duration: 800,
    poses: [
      // Left knee up
      { headX: 100, headY: 25, torsoEndX: 100, torsoEndY: 95,
        leftElbowX: 120, leftElbowY: 60, leftHandX: 125, leftHandY: 50,
        rightElbowX: 75, rightElbowY: 70, rightHandX: 70, rightHandY: 85,
        leftKneeX: 95, leftKneeY: 85, leftFootX: 95, leftFootY: 110,
        rightKneeX: 108, rightKneeY: 130, rightFootX: 112, rightFootY: 168 },
      // Transition — both feet passing
      { headX: 100, headY: 26, torsoEndX: 100, torsoEndY: 95,
        leftElbowX: 95, leftElbowY: 65, leftHandX: 92, leftHandY: 68,
        rightElbowX: 105, rightElbowY: 65, rightHandX: 108, rightHandY: 68,
        leftKneeX: 95, leftKneeY: 115, leftFootX: 93, leftFootY: 145,
        rightKneeX: 105, rightKneeY: 115, rightFootX: 107, rightFootY: 145 },
      // Right knee up
      { headX: 100, headY: 25, torsoEndX: 100, torsoEndY: 95,
        leftElbowX: 75, leftElbowY: 70, leftHandX: 70, leftHandY: 85,
        rightElbowX: 120, rightElbowY: 60, rightHandX: 125, rightHandY: 50,
        leftKneeX: 92, leftKneeY: 130, leftFootX: 88, leftFootY: 168,
        rightKneeX: 105, rightKneeY: 85, rightFootX: 105, rightFootY: 110 },
      // Transition — both feet passing
      { headX: 100, headY: 26, torsoEndX: 100, torsoEndY: 95,
        leftElbowX: 105, leftElbowY: 65, leftHandX: 108, leftHandY: 68,
        rightElbowX: 95, rightElbowY: 65, rightHandX: 92, rightHandY: 68,
        leftKneeX: 95, leftKneeY: 115, leftFootX: 93, leftFootY: 145,
        rightKneeX: 105, rightKneeY: 115, rightFootX: 107, rightFootY: 145 },
    ],
    segments: [
      { duration: 80, easing: 'snap' },
      { duration: 80, easing: 'linear' },
      { duration: 80, easing: 'snap' },
      { duration: 80, easing: 'linear' },
    ],
  },

  // === JUMP ROPE ===
  jumpRope: {
    id: 'jumpRope',
    duration: 600,
    poses: [
      { headX: 100, headY: 18, torsoEndX: 100, torsoEndY: 85,
        leftElbowX: 72, leftElbowY: 70, leftHandX: 60, leftHandY: 82,
        rightElbowX: 128, rightElbowY: 70, rightHandX: 140, rightHandY: 82,
        leftKneeX: 92, leftKneeY: 115, leftFootX: 90, leftFootY: 148,
        rightKneeX: 108, rightKneeY: 115, rightFootX: 110, rightFootY: 148 },
      { headX: 100, headY: 25, torsoEndX: 100, torsoEndY: 92,
        leftElbowX: 72, leftElbowY: 77, leftHandX: 60, leftHandY: 90,
        rightElbowX: 128, rightElbowY: 77, rightHandX: 140, rightHandY: 90,
        leftKneeX: 92, leftKneeY: 125, leftFootX: 90, leftFootY: 165,
        rightKneeX: 108, rightKneeY: 125, rightFootX: 110, rightFootY: 165 },
    ],
    segments: [
      { duration: 150, easing: 'easeIn' },
      { duration: 150, easing: 'easeOut' },
    ],
  },

  // === SKATER JUMP ===
  skaterJump: {
    id: 'skaterJump',
    duration: 1400,
    poses: [
      { headX: 70, headY: 40, torsoEndX: 80, torsoEndY: 110,
        leftElbowX: 50, leftElbowY: 80, leftHandX: 40, leftHandY: 100,
        rightElbowX: 100, rightElbowY: 85, rightHandX: 110, rightHandY: 100,
        leftKneeX: 68, leftKneeY: 135, leftFootX: 60, leftFootY: 170,
        rightKneeX: 95, rightKneeY: 130, rightFootX: 88, rightFootY: 155 },
      { headX: 130, headY: 40, torsoEndX: 120, torsoEndY: 110,
        leftElbowX: 100, leftElbowY: 85, leftHandX: 90, leftHandY: 100,
        rightElbowX: 150, rightElbowY: 80, rightHandX: 160, rightHandY: 100,
        leftKneeX: 105, leftKneeY: 130, leftFootX: 112, leftFootY: 155,
        rightKneeX: 132, rightKneeY: 135, rightFootX: 140, rightFootY: 170 },
    ],
    segments: [
      { duration: 350, easing: 'snap', holdEnd: 100 },
      { duration: 350, easing: 'snap', holdEnd: 100 },
    ],
  },

  // === ARM CIRCLE ===
  armCircle: {
    id: 'armCircle',
    duration: 2000,
    poses: [
      { ...standing, leftElbowX: 55, leftElbowY: 50, leftHandX: 30, leftHandY: 55,
        rightElbowX: 145, rightElbowY: 50, rightHandX: 170, rightHandY: 55 },
      { ...standing, leftElbowX: 75, leftElbowY: 25, leftHandX: 65, leftHandY: 5,
        rightElbowX: 125, rightElbowY: 25, rightHandX: 135, rightHandY: 5 },
      { ...standing, leftElbowX: 72, leftElbowY: 50, leftHandX: 55, leftHandY: 55,
        rightElbowX: 128, rightElbowY: 50, rightHandX: 145, rightHandY: 55 },
      { ...standing },
    ],
    segments: [
      { duration: 250, easing: 'linear' },
      { duration: 250, easing: 'linear' },
      { duration: 250, easing: 'linear' },
      { duration: 250, easing: 'linear' },
    ],
  },

  // === LEG SWING ===
  legSwing: {
    id: 'legSwing',
    duration: 1800,
    poses: [
      { ...standing, leftKneeX: 65, leftKneeY: 110, leftFootX: 45, leftFootY: 125 },
      { ...standing, leftKneeX: 105, leftKneeY: 130, leftFootX: 120, leftFootY: 150 },
    ],
    segments: [
      { duration: 450, easing: 'easeInOut' },
      { duration: 450, easing: 'easeInOut' },
    ],
  },

  // === CAT-COW ===
  catCow: {
    id: 'catCow',
    duration: 3000,
    poses: [
      // Cow (back arched down)
      { headX: 45, headY: 85, torsoEndX: 130, torsoEndY: 95,
        leftElbowX: 50, leftElbowY: 105, leftHandX: 45, leftHandY: 130,
        rightElbowX: 120, rightElbowY: 105, rightHandX: 115, rightHandY: 130,
        leftKneeX: 145, leftKneeY: 110, leftFootX: 145, leftFootY: 130,
        rightKneeX: 155, rightKneeY: 115, rightFootX: 155, rightFootY: 130 },
      // Cat (back arched up)
      { headX: 55, headY: 95, torsoEndX: 130, torsoEndY: 88,
        leftElbowX: 55, leftElbowY: 108, leftHandX: 45, leftHandY: 130,
        rightElbowX: 115, rightElbowY: 105, rightHandX: 115, rightHandY: 130,
        leftKneeX: 145, leftKneeY: 108, leftFootX: 145, leftFootY: 130,
        rightKneeX: 155, rightKneeY: 112, rightFootX: 155, rightFootY: 130 },
    ],
    segments: [
      { duration: 800, easing: 'easeInOut', holdEnd: 200 },
      { duration: 800, easing: 'easeInOut', holdEnd: 200 },
    ],
  },

  // === STRETCH (generic) ===
  stretch: {
    id: 'stretch',
    duration: 3000,
    poses: [
      { headX: 80, headY: 55, torsoEndX: 100, torsoEndY: 115,
        leftElbowX: 55, leftElbowY: 55, leftHandX: 35, leftHandY: 60,
        rightElbowX: 65, rightElbowY: 55, rightHandX: 42, rightHandY: 58,
        leftKneeX: 80, leftKneeY: 140, leftFootX: 60, leftFootY: 165,
        rightKneeX: 120, rightKneeY: 140, rightFootX: 140, rightFootY: 165 },
      { headX: 100, headY: 45, torsoEndX: 100, torsoEndY: 115,
        leftElbowX: 72, leftElbowY: 85, leftHandX: 60, leftHandY: 100,
        rightElbowX: 128, rightElbowY: 85, rightHandX: 140, rightHandY: 100,
        leftKneeX: 80, leftKneeY: 140, leftFootX: 60, leftFootY: 165,
        rightKneeX: 120, rightKneeY: 140, rightFootX: 140, rightFootY: 165 },
    ],
    segments: [
      { duration: 800, easing: 'easeInOut', holdEnd: 200 },
      { duration: 800, easing: 'easeInOut', holdEnd: 200 },
    ],
  },

  // === BICEP CURL ===
  bicepCurl: {
    id: 'bicepCurl',
    duration: 2000,
    poses: [
      // Arms down
      { ...standing, leftElbowX: 75, leftElbowY: 78, leftHandX: 72, leftHandY: 105,
        rightElbowX: 125, rightElbowY: 78, rightHandX: 128, rightHandY: 105 },
      // Arms curled
      { ...standing, leftElbowX: 75, leftElbowY: 78, leftHandX: 72, leftHandY: 58,
        rightElbowX: 125, rightElbowY: 78, rightHandX: 128, rightHandY: 58 },
    ],
    segments: [
      { duration: 500, easing: 'easeIn', holdEnd: 120 },
      { duration: 500, easing: 'easeOut', holdEnd: 100 },
    ],
  },

  // === ROW ===
  row: {
    id: 'row',
    duration: 2200,
    poses: [
      // Bent over, arms extended
      { headX: 60, headY: 55, torsoEndX: 100, torsoEndY: 100,
        leftElbowX: 60, leftElbowY: 78, leftHandX: 62, leftHandY: 100,
        rightElbowX: 90, rightElbowY: 78, rightHandX: 92, rightHandY: 100,
        leftKneeX: 88, leftKneeY: 135, leftFootX: 82, leftFootY: 170,
        rightKneeX: 112, rightKneeY: 135, rightFootX: 118, rightFootY: 170 },
      // Bent over, arms pulled back
      { headX: 60, headY: 52, torsoEndX: 100, torsoEndY: 98,
        leftElbowX: 55, leftElbowY: 65, leftHandX: 62, leftHandY: 72,
        rightElbowX: 88, rightElbowY: 65, rightHandX: 92, rightHandY: 72,
        leftKneeX: 88, leftKneeY: 135, leftFootX: 82, leftFootY: 170,
        rightKneeX: 112, rightKneeY: 135, rightFootX: 118, rightFootY: 170 },
    ],
    segments: [
      { duration: 500, easing: 'easeIn', holdEnd: 150 },
      { duration: 550, easing: 'easeOut', holdEnd: 100 },
    ],
  },
}
