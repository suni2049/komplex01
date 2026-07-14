import type { Pose, ExerciseAnimation, PropSpec } from '../../types/animation'

// --- Figure proportions (viewBox units, 200x200) ---

export const HEAD_R = 11.5
export const NECK_W = 6
export const SHOULDER_HALF = 10
export const HIP_HALF = 7
export const UPPER_ARM_W = 7.5
export const FOREARM_W = 6.5
export const THIGH_W = 8.5
export const CALF_W = 7

export interface Vec { x: number; y: number }
export interface Line { x1: number; y1: number; x2: number; y2: number }

const add = (a: Vec, b: Vec): Vec => ({ x: a.x + b.x, y: a.y + b.y })
const sub = (a: Vec, b: Vec): Vec => ({ x: a.x - b.x, y: a.y - b.y })
const scale = (a: Vec, s: number): Vec => ({ x: a.x * s, y: a.y * s })
const len = (a: Vec): number => Math.hypot(a.x, a.y)
const dot = (a: Vec, b: Vec): number => a.x * b.x + a.y * b.y
const clamp = (v: number, lo: number, hi: number): number => Math.min(hi, Math.max(lo, v))
const r2 = (n: number): number => Math.round(n * 100) / 100

// --- Derived skeleton ---

export interface TorsoAnchors {
  head: Vec
  neck: Vec
  shoulderCenter: Vec
  pelvis: Vec
  axis: Vec // unit vector head -> hips
  perp: Vec
  widthScale: number
}

export function torsoAnchors(pose: Pose): TorsoAnchors {
  const head = { x: pose.headX, y: pose.headY }
  const pelvis = { x: pose.torsoEndX, y: pose.torsoEndY }
  const d = sub(pelvis, head)
  const l = len(d)
  // Degenerate torso (head on top of hips) — assume upright
  const axis = l < 4 ? { x: 0, y: 1 } : scale(d, 1 / l)
  const perp = { x: -axis.y, y: axis.x }
  const neck = add(head, scale(axis, HEAD_R - 2))
  const shoulderCenter = add(neck, scale(sub(pelvis, neck), 0.28))
  const widthScale = clamp(len(sub(pelvis, neck)) / 40, 0.6, 1)
  return { head, neck, shoulderCenter, pelvis, axis, perp, widthScale }
}

// Attach point offset along the torso's perpendicular, with a smooth sign so
// a limb crossing the torso axis slides across instead of popping sides.
function attachPoint(center: Vec, perp: Vec, toward: Vec, halfWidth: number): Vec {
  const side = clamp(dot(sub(toward, center), perp) / 8, -1, 1)
  return add(center, scale(perp, halfWidth * side))
}

// --- Torso path: tapered capsule between shoulders and hips ---

function torsoPath(a: TorsoAnchors): string {
  const sh = SHOULDER_HALF * a.widthScale
  const hh = HIP_HALF * a.widthScale
  const sL = add(a.neck, scale(a.perp, sh))
  const sR = sub(a.neck, scale(a.perp, sh))
  const hL = add(a.pelvis, scale(a.perp, hh))
  const hR = sub(a.pelvis, scale(a.perp, hh))
  const mid = scale(add(a.neck, a.pelvis), 0.5)
  // Slight taper toward a waist between shoulders and hips (no belly bulge)
  const bow = scale(a.perp, ((sh + hh) / 2) * 0.72)
  const cL = add(mid, bow)
  const cR = sub(mid, bow)
  return (
    `M ${r2(sL.x)} ${r2(sL.y)} ` +
    `Q ${r2(cL.x)} ${r2(cL.y)} ${r2(hL.x)} ${r2(hL.y)} ` +
    `A ${r2(hh)} ${r2(hh)} 0 0 0 ${r2(hR.x)} ${r2(hR.y)} ` +
    `Q ${r2(cR.x)} ${r2(cR.y)} ${r2(sR.x)} ${r2(sR.y)} ` +
    `A ${r2(sh)} ${r2(sh)} 0 0 0 ${r2(sL.x)} ${r2(sL.y)} Z`
  )
}

// --- Ground shadow ---

const JOINT_PAIRS: [keyof Pose, keyof Pose][] = [
  ['headX', 'headY'],
  ['torsoEndX', 'torsoEndY'],
  ['leftElbowX', 'leftElbowY'],
  ['leftHandX', 'leftHandY'],
  ['rightElbowX', 'rightElbowY'],
  ['rightHandX', 'rightHandY'],
  ['leftKneeX', 'leftKneeY'],
  ['leftFootX', 'leftFootY'],
  ['rightKneeX', 'rightKneeY'],
  ['rightFootX', 'rightFootY'],
]

const groundYCache = new Map<string, number>()

export function getGroundY(anim: ExerciseAnimation): number {
  const cached = groundYCache.get(anim.id)
  if (cached !== undefined) return cached
  let g = 0
  for (const pose of anim.poses) {
    for (const [, yKey] of JOINT_PAIRS) {
      if (pose[yKey] > g) g = pose[yKey]
    }
  }
  groundYCache.set(anim.id, g)
  return g
}

export interface ShadowGeometry {
  cx: number
  cy: number
  rx: number
  ry: number
  opacity: number
}

function computeShadow(pose: Pose, groundY: number): ShadowGeometry {
  let bottomY = -Infinity
  for (const [, yKey] of JOINT_PAIRS) {
    if (pose[yKey] > bottomY) bottomY = pose[yKey]
  }
  // Joints near the lowest point are ground contacts; in horizontal poses
  // (planks, pushups) this picks up hands and feet so the shadow spans the body.
  let minX = Infinity
  let maxX = -Infinity
  for (const [xKey, yKey] of JOINT_PAIRS) {
    if (pose[yKey] >= bottomY - 12) {
      if (pose[xKey] < minX) minX = pose[xKey]
      if (pose[xKey] > maxX) maxX = pose[xKey]
    }
  }
  const rx = clamp((maxX - minX) / 2 + 14, 18, 80)
  const airGap = Math.max(0, groundY - bottomY)
  const s = clamp(1 - airGap / 60, 0.35, 1)
  return {
    cx: r2((minX + maxX) / 2),
    cy: r2(Math.min(groundY + 5, 196)),
    rx: r2(rx * s),
    ry: r2(Math.max(4, rx * s * 0.18)),
    opacity: r2(0.45 * s),
  }
}

// --- Full figure geometry ---

export type LimbKey =
  | 'leftUpperArm' | 'leftForearm'
  | 'rightUpperArm' | 'rightForearm'
  | 'leftThigh' | 'leftCalf'
  | 'rightThigh' | 'rightCalf'

// --- Equipment prop geometry ---

export interface PropGeometry {
  pole?: Line
  // kettlebell: handle line from grip to the bell, plus the bell circle
  kettlebell?: { handle: Line; cx: number; cy: number; r: number }
}

const KB_BELL_R = 6.5

function computeProp(pose: Pose, prop?: PropSpec): PropGeometry | undefined {
  if (!prop) return undefined
  if (prop.kind === 'pole') {
    // A floor-standing pole spans the full frame height, independent of the
    // figure's pose, so hanging/L-sit moves still show a full pole.
    const x = r2(prop.x)
    return { pole: { x1: x, y1: 4, x2: x, y2: 188 } }
  }
  // kettlebell — track the gripping hand(s)
  let gx: number, gy: number
  if (prop.grip === 'left') { gx = pose.leftHandX; gy = pose.leftHandY }
  else if (prop.grip === 'right') { gx = pose.rightHandX; gy = pose.rightHandY }
  else { gx = (pose.leftHandX + pose.rightHandX) / 2; gy = (pose.leftHandY + pose.rightHandY) / 2 }
  const bellCy = gy + KB_BELL_R + 3
  return {
    kettlebell: {
      handle: { x1: r2(gx), y1: r2(gy), x2: r2(gx), y2: r2(gy + 4) },
      cx: r2(gx), cy: r2(bellCy), r: KB_BELL_R,
    },
  }
}

export interface FigureGeometry {
  head: { cx: number; cy: number }
  neck: Line
  torsoD: string
  limbs: Record<LimbKey, Line>
  shadow: ShadowGeometry
  prop?: PropGeometry
}

const line = (a: Vec, b: Vec): Line => ({ x1: r2(a.x), y1: r2(a.y), x2: r2(b.x), y2: r2(b.y) })

export function buildFigureGeometry(pose: Pose, groundY: number, prop?: PropSpec): FigureGeometry {
  const a = torsoAnchors(pose)
  const shoulderHalf = (SHOULDER_HALF - UPPER_ARM_W / 2) * a.widthScale
  const hipHalf = (HIP_HALF - THIGH_W / 2) * a.widthScale

  const leftElbow = { x: pose.leftElbowX, y: pose.leftElbowY }
  const rightElbow = { x: pose.rightElbowX, y: pose.rightElbowY }
  const leftKnee = { x: pose.leftKneeX, y: pose.leftKneeY }
  const rightKnee = { x: pose.rightKneeX, y: pose.rightKneeY }

  const leftShoulder = attachPoint(a.shoulderCenter, a.perp, leftElbow, shoulderHalf)
  const rightShoulder = attachPoint(a.shoulderCenter, a.perp, rightElbow, shoulderHalf)
  const leftHip = attachPoint(a.pelvis, a.perp, leftKnee, hipHalf)
  const rightHip = attachPoint(a.pelvis, a.perp, rightKnee, hipHalf)

  return {
    head: { cx: r2(a.head.x), cy: r2(a.head.y) },
    neck: line(a.head, a.shoulderCenter),
    torsoD: torsoPath(a),
    limbs: {
      leftUpperArm: line(leftShoulder, leftElbow),
      leftForearm: line(leftElbow, { x: pose.leftHandX, y: pose.leftHandY }),
      rightUpperArm: line(rightShoulder, rightElbow),
      rightForearm: line(rightElbow, { x: pose.rightHandX, y: pose.rightHandY }),
      leftThigh: line(leftHip, leftKnee),
      leftCalf: line(leftKnee, { x: pose.leftFootX, y: pose.leftFootY }),
      rightThigh: line(rightHip, rightKnee),
      rightCalf: line(rightKnee, { x: pose.rightFootX, y: pose.rightFootY }),
    },
    shadow: computeShadow(pose, groundY),
    prop: computeProp(pose, prop),
  }
}
