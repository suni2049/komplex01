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

export const animationRegistry: Record<string, ExerciseAnimation> = {
  // === PUSH-UP ===
  pushup: {
    id: 'pushup',
    duration: 2000,
    poses: [
      // Up position (plank)
      { headX: 45, headY: 85, torsoEndX: 130, torsoEndY: 90,
        leftElbowX: 55, leftElbowY: 105, leftHandX: 55, leftHandY: 130,
        rightElbowX: 120, rightElbowY: 105, rightHandX: 120, rightHandY: 130,
        leftKneeX: 155, leftKneeY: 95, leftFootX: 175, leftFootY: 100,
        rightKneeX: 155, rightKneeY: 100, rightFootX: 175, rightFootY: 105 },
      // Down position
      { headX: 45, headY: 115, torsoEndX: 130, torsoEndY: 112,
        leftElbowX: 40, leftElbowY: 105, leftHandX: 55, leftHandY: 130,
        rightElbowX: 105, rightElbowY: 105, rightHandX: 120, rightHandY: 130,
        leftKneeX: 155, leftKneeY: 115, leftFootX: 175, leftFootY: 118,
        rightKneeX: 155, rightKneeY: 120, rightFootX: 175, rightFootY: 123 },
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
  },

  // === PULL-UP ===
  pullup: {
    id: 'pullup',
    duration: 2500,
    poses: [
      // Hanging
      { headX: 100, headY: 50, torsoEndX: 100, torsoEndY: 120,
        leftElbowX: 80, leftElbowY: 30, leftHandX: 75, leftHandY: 10,
        rightElbowX: 120, rightElbowY: 30, rightHandX: 125, rightHandY: 10,
        leftKneeX: 92, leftKneeY: 150, leftFootX: 90, leftFootY: 175,
        rightKneeX: 108, rightKneeY: 150, rightFootX: 110, rightFootY: 175 },
      // Top
      { headX: 100, headY: 20, torsoEndX: 100, torsoEndY: 90,
        leftElbowX: 72, leftElbowY: 50, leftHandX: 75, leftHandY: 10,
        rightElbowX: 128, rightElbowY: 50, rightHandX: 125, rightHandY: 10,
        leftKneeX: 92, leftKneeY: 120, leftFootX: 90, leftFootY: 150,
        rightKneeX: 108, rightKneeY: 120, rightFootX: 110, rightFootY: 150 },
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
  },

  // === SQUAT ===
  squat: {
    id: 'squat',
    duration: 2200,
    poses: [
      // Standing
      { ...standing, leftHandX: 60, leftHandY: 55, rightHandX: 140, rightHandY: 55 },
      // Squatted
      { headX: 100, headY: 60, torsoEndX: 100, torsoEndY: 115,
        leftElbowX: 72, leftElbowY: 80, leftHandX: 60, leftHandY: 80,
        rightElbowX: 128, rightElbowY: 80, rightHandX: 140, rightHandY: 80,
        leftKneeX: 72, leftKneeY: 135, leftFootX: 75, leftFootY: 170,
        rightKneeX: 128, rightKneeY: 135, rightFootX: 125, rightFootY: 170 },
    ],
  },

  // === JUMP SQUAT ===
  jumpSquat: {
    id: 'jumpSquat',
    duration: 1800,
    poses: [
      // Squatted
      { headX: 100, headY: 60, torsoEndX: 100, torsoEndY: 115,
        leftElbowX: 72, leftElbowY: 80, leftHandX: 60, leftHandY: 90,
        rightElbowX: 128, rightElbowY: 80, rightHandX: 140, rightHandY: 90,
        leftKneeX: 72, leftKneeY: 135, leftFootX: 75, leftFootY: 170,
        rightKneeX: 128, rightKneeY: 135, rightFootX: 125, rightFootY: 170 },
      // Jumping
      { headX: 100, headY: 10, torsoEndX: 100, torsoEndY: 78,
        leftElbowX: 72, leftElbowY: 30, leftHandX: 60, leftHandY: 15,
        rightElbowX: 128, rightElbowY: 30, rightHandX: 140, rightHandY: 15,
        leftKneeX: 88, leftKneeY: 110, leftFootX: 82, leftFootY: 140,
        rightKneeX: 112, rightKneeY: 110, rightFootX: 118, rightFootY: 140 },
    ],
  },

  // === LUNGE ===
  lunge: {
    id: 'lunge',
    duration: 2200,
    poses: [
      // Standing
      standing,
      // Lunged
      { headX: 100, headY: 40, torsoEndX: 100, torsoEndY: 110,
        leftElbowX: 82, leftElbowY: 85, leftHandX: 80, leftHandY: 110,
        rightElbowX: 118, rightElbowY: 85, rightHandX: 120, rightHandY: 110,
        leftKneeX: 70, leftKneeY: 130, leftFootX: 55, leftFootY: 170,
        rightKneeX: 130, rightKneeY: 150, rightFootX: 140, rightFootY: 170 },
    ],
  },

  // === CALF RAISE ===
  calfRaise: {
    id: 'calfRaise',
    duration: 1600,
    poses: [
      // Flat
      standing,
      // Raised
      { ...standing, headY: 22, torsoEndY: 92,
        leftElbowY: 67, leftHandY: 92,
        rightElbowY: 67, rightHandY: 92,
        leftKneeY: 127, leftFootY: 160,
        rightKneeY: 127, rightFootY: 160 },
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
  },

  // === WALL SIT ===
  wallSit: {
    id: 'wallSit',
    duration: 3000,
    poses: [
      // Sitting
      { headX: 100, headY: 40, torsoEndX: 100, torsoEndY: 110,
        leftElbowX: 72, leftElbowY: 85, leftHandX: 65, leftHandY: 110,
        rightElbowX: 128, rightElbowY: 85, rightHandX: 135, rightHandY: 110,
        leftKneeX: 65, leftKneeY: 115, leftFootX: 65, leftFootY: 170,
        rightKneeX: 135, rightKneeY: 115, rightFootX: 135, rightFootY: 170 },
      // Slight shift
      { headX: 100, headY: 38, torsoEndX: 100, torsoEndY: 108,
        leftElbowX: 72, leftElbowY: 83, leftHandX: 65, leftHandY: 108,
        rightElbowX: 128, rightElbowY: 83, rightHandX: 135, rightHandY: 108,
        leftKneeX: 65, leftKneeY: 113, leftFootX: 65, leftFootY: 170,
        rightKneeX: 135, rightKneeY: 113, rightFootX: 135, rightFootY: 170 },
    ],
  },

  // === PLANK ===
  plank: {
    id: 'plank',
    duration: 3000,
    poses: [
      { headX: 40, headY: 100, torsoEndX: 135, torsoEndY: 105,
        leftElbowX: 50, leftElbowY: 115, leftHandX: 40, leftHandY: 130,
        rightElbowX: 95, rightElbowY: 115, rightHandX: 85, rightHandY: 130,
        leftKneeX: 150, leftKneeY: 108, leftFootX: 175, leftFootY: 112,
        rightKneeX: 155, rightKneeY: 112, rightFootX: 178, rightFootY: 116 },
      // Slight breathing shift
      { headX: 40, headY: 98, torsoEndX: 135, torsoEndY: 103,
        leftElbowX: 50, leftElbowY: 113, leftHandX: 40, leftHandY: 130,
        rightElbowX: 95, rightElbowY: 113, rightHandX: 85, rightHandY: 130,
        leftKneeX: 150, leftKneeY: 106, leftFootX: 175, leftFootY: 110,
        rightKneeX: 155, rightKneeY: 110, rightFootX: 178, rightFootY: 114 },
    ],
  },

  // === SIDE PLANK ===
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
  },

  // === DEAD BUG ===
  deadBug: {
    id: 'deadBug',
    duration: 2400,
    poses: [
      // Right arm + left leg extended
      { headX: 100, headY: 145, torsoEndX: 100, torsoEndY: 110,
        leftElbowX: 80, leftElbowY: 95, leftHandX: 75, leftHandY: 80,
        rightElbowX: 120, rightElbowY: 130, rightHandX: 135, rightHandY: 145,
        leftKneeX: 80, leftKneeY: 100, leftFootX: 70, leftFootY: 80,
        rightKneeX: 120, rightKneeY: 95, rightFootX: 120, rightFootY: 80 },
      // Left arm + right leg extended
      { headX: 100, headY: 145, torsoEndX: 100, torsoEndY: 110,
        leftElbowX: 80, leftElbowY: 130, leftHandX: 65, leftHandY: 145,
        rightElbowX: 120, rightElbowY: 95, rightHandX: 125, rightHandY: 80,
        leftKneeX: 80, leftKneeY: 95, leftFootX: 80, leftFootY: 80,
        rightKneeX: 120, rightKneeY: 100, rightFootX: 130, rightFootY: 80 },
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
  },

  // === RUSSIAN TWIST ===
  russianTwist: {
    id: 'russianTwist',
    duration: 1600,
    poses: [
      // Twist left
      { headX: 85, headY: 50, torsoEndX: 100, torsoEndY: 120,
        leftElbowX: 55, leftElbowY: 80, leftHandX: 45, leftHandY: 95,
        rightElbowX: 70, rightElbowY: 80, rightHandX: 55, rightHandY: 95,
        leftKneeX: 85, leftKneeY: 115, leftFootX: 80, leftFootY: 95,
        rightKneeX: 115, rightKneeY: 115, rightFootX: 120, rightFootY: 95 },
      // Twist right
      { headX: 115, headY: 50, torsoEndX: 100, torsoEndY: 120,
        leftElbowX: 130, leftElbowY: 80, leftHandX: 145, leftHandY: 95,
        rightElbowX: 145, rightElbowY: 80, rightHandX: 155, rightHandY: 95,
        leftKneeX: 85, leftKneeY: 115, leftFootX: 80, leftFootY: 95,
        rightKneeX: 115, rightKneeY: 115, rightFootX: 120, rightFootY: 95 },
    ],
  },

  // === HOLLOW HOLD ===
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
  },

  // === L-SIT ===
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
  },

  // === JUMPING JACK ===
  jumpingJack: {
    id: 'jumpingJack',
    duration: 1200,
    poses: [
      // Closed
      { ...standing },
      // Open
      { headX: 100, headY: 28, torsoEndX: 100, torsoEndY: 98,
        leftElbowX: 60, leftElbowY: 45, leftHandX: 42, leftHandY: 22,
        rightElbowX: 140, rightElbowY: 45, rightHandX: 158, rightHandY: 22,
        leftKneeX: 72, leftKneeY: 130, leftFootX: 58, leftFootY: 168,
        rightKneeX: 128, rightKneeY: 130, rightFootX: 142, rightFootY: 168 },
    ],
  },

  // === BURPEE ===
  burpee: {
    id: 'burpee',
    duration: 3000,
    poses: [
      // Standing
      standing,
      // Squat
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
      // Jump
      { headX: 100, headY: 10, torsoEndX: 100, torsoEndY: 78,
        leftElbowX: 72, leftElbowY: 30, leftHandX: 60, leftHandY: 12,
        rightElbowX: 128, rightElbowY: 30, rightHandX: 140, rightHandY: 12,
        leftKneeX: 88, leftKneeY: 112, leftFootX: 82, leftFootY: 142,
        rightKneeX: 112, rightKneeY: 112, rightFootX: 118, rightFootY: 142 },
    ],
  },

  // === HIGH KNEES ===
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
      // Right knee up
      { headX: 100, headY: 25, torsoEndX: 100, torsoEndY: 95,
        leftElbowX: 75, leftElbowY: 70, leftHandX: 70, leftHandY: 85,
        rightElbowX: 120, rightElbowY: 60, rightHandX: 125, rightHandY: 50,
        leftKneeX: 92, leftKneeY: 130, leftFootX: 88, leftFootY: 168,
        rightKneeX: 105, rightKneeY: 85, rightFootX: 105, rightFootY: 110 },
    ],
  },

  // === JUMP ROPE ===
  jumpRope: {
    id: 'jumpRope',
    duration: 600,
    poses: [
      // Up
      { headX: 100, headY: 18, torsoEndX: 100, torsoEndY: 85,
        leftElbowX: 72, leftElbowY: 70, leftHandX: 60, leftHandY: 82,
        rightElbowX: 128, rightElbowY: 70, rightHandX: 140, rightHandY: 82,
        leftKneeX: 92, leftKneeY: 115, leftFootX: 90, leftFootY: 148,
        rightKneeX: 108, rightKneeY: 115, rightFootX: 110, rightFootY: 148 },
      // Down
      { headX: 100, headY: 25, torsoEndX: 100, torsoEndY: 92,
        leftElbowX: 72, leftElbowY: 77, leftHandX: 60, leftHandY: 90,
        rightElbowX: 128, rightElbowY: 77, rightHandX: 140, rightHandY: 90,
        leftKneeX: 92, leftKneeY: 125, leftFootX: 90, leftFootY: 165,
        rightKneeX: 108, rightKneeY: 125, rightFootX: 110, rightFootY: 165 },
    ],
  },

  // === SKATER JUMP ===
  skaterJump: {
    id: 'skaterJump',
    duration: 1400,
    poses: [
      // Left side
      { headX: 70, headY: 40, torsoEndX: 80, torsoEndY: 110,
        leftElbowX: 50, leftElbowY: 80, leftHandX: 40, leftHandY: 100,
        rightElbowX: 100, rightElbowY: 85, rightHandX: 110, rightHandY: 100,
        leftKneeX: 68, leftKneeY: 135, leftFootX: 60, leftFootY: 170,
        rightKneeX: 95, rightKneeY: 130, rightFootX: 88, rightFootY: 155 },
      // Right side
      { headX: 130, headY: 40, torsoEndX: 120, torsoEndY: 110,
        leftElbowX: 100, leftElbowY: 85, leftHandX: 90, leftHandY: 100,
        rightElbowX: 150, rightElbowY: 80, rightHandX: 160, rightHandY: 100,
        leftKneeX: 105, leftKneeY: 130, leftFootX: 112, leftFootY: 155,
        rightKneeX: 132, rightKneeY: 135, rightFootX: 140, rightFootY: 170 },
    ],
  },

  // === ARM CIRCLE ===
  armCircle: {
    id: 'armCircle',
    duration: 2000,
    poses: [
      // Arms out
      { ...standing, leftElbowX: 55, leftElbowY: 50, leftHandX: 30, leftHandY: 55,
        rightElbowX: 145, rightElbowY: 50, rightHandX: 170, rightHandY: 55 },
      // Arms up
      { ...standing, leftElbowX: 75, leftElbowY: 25, leftHandX: 65, leftHandY: 5,
        rightElbowX: 125, rightElbowY: 25, rightHandX: 135, rightHandY: 5 },
      // Arms forward
      { ...standing, leftElbowX: 72, leftElbowY: 50, leftHandX: 55, leftHandY: 55,
        rightElbowX: 128, rightElbowY: 50, rightHandX: 145, rightHandY: 55 },
      // Arms down
      { ...standing },
    ],
  },

  // === LEG SWING ===
  legSwing: {
    id: 'legSwing',
    duration: 1800,
    poses: [
      // Leg forward
      { ...standing, leftKneeX: 65, leftKneeY: 110, leftFootX: 45, leftFootY: 125 },
      // Leg back
      { ...standing, leftKneeX: 105, leftKneeY: 130, leftFootX: 120, leftFootY: 150 },
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
  },

  // === STRETCH (generic) ===
  stretch: {
    id: 'stretch',
    duration: 3000,
    poses: [
      // Reaching forward
      { headX: 80, headY: 55, torsoEndX: 100, torsoEndY: 115,
        leftElbowX: 55, leftElbowY: 55, leftHandX: 35, leftHandY: 60,
        rightElbowX: 65, rightElbowY: 55, rightHandX: 42, rightHandY: 58,
        leftKneeX: 80, leftKneeY: 140, leftFootX: 60, leftFootY: 165,
        rightKneeX: 120, rightKneeY: 140, rightFootX: 140, rightFootY: 165 },
      // Seated upright
      { headX: 100, headY: 45, torsoEndX: 100, torsoEndY: 115,
        leftElbowX: 72, leftElbowY: 85, leftHandX: 60, leftHandY: 100,
        rightElbowX: 128, rightElbowY: 85, rightHandX: 140, rightHandY: 100,
        leftKneeX: 80, leftKneeY: 140, leftFootX: 60, leftFootY: 165,
        rightKneeX: 120, rightKneeY: 140, rightFootX: 140, rightFootY: 165 },
    ],
  },
}
