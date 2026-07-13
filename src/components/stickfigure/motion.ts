import type { Pose, ExerciseAnimation, EasingPreset } from '../../types/animation'
import { torsoAnchors, type Vec } from './geometry'

// --- Easing functions ---

const SNAP_OVERSHOOT = 0.9

export const easingFns: Record<EasingPreset, (t: number) => number> = {
  linear: (t) => t,
  easeIn: (t) => t * t,
  easeOut: (t) => 1 - Math.pow(1 - t, 3),
  easeInOut: (t) => t * t * t * (t * (t * 6 - 15) + 10),
  easeInOutCubic: (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
  // Fast attack with a slight overshoot and settle
  snap: (t) => 1 + (SNAP_OVERSHOOT + 1) * Math.pow(t - 1, 3) + SNAP_OVERSHOOT * Math.pow(t - 1, 2),
}

// --- Segment timing ---

export interface SegmentInfo {
  index: number
  progress: number // 0-1 within segment, raw (before easing)
  easing: EasingPreset
}

export function getSegmentInfo(anim: ExerciseAnimation, elapsed: number): SegmentInfo {
  const totalPoses = anim.poses.length

  if (anim.segments && anim.segments.length > 0) {
    // Per-segment timing
    const segs = anim.segments
    const totalDuration = segs.reduce((sum, s) => sum + s.duration + (s.holdStart || 0) + (s.holdEnd || 0), 0)
    const loopTime = elapsed % totalDuration
    let accumulated = 0

    for (let i = 0; i < segs.length; i++) {
      const seg = segs[i]
      const segTotal = seg.duration + (seg.holdStart || 0) + (seg.holdEnd || 0)

      if (loopTime < accumulated + segTotal) {
        const segElapsed = loopTime - accumulated
        const holdStart = seg.holdStart || 0
        if (segElapsed < holdStart) {
          return { index: i, progress: 0, easing: seg.easing }
        } else if (segElapsed > holdStart + seg.duration) {
          return { index: i, progress: 1, easing: seg.easing }
        } else {
          const p = (segElapsed - holdStart) / seg.duration
          return { index: i, progress: p, easing: seg.easing }
        }
      }
      accumulated += segTotal
    }
    // Fallback
    return { index: segs.length - 1, progress: 1, easing: segs[segs.length - 1].easing }
  }

  // Legacy: even-split timing
  const segmentDuration = anim.duration / totalPoses
  const loopTime = elapsed % anim.duration
  const segmentIndex = Math.floor(loopTime / segmentDuration)
  const segmentProgress = (loopTime % segmentDuration) / segmentDuration
  return { index: segmentIndex % totalPoses, progress: segmentProgress, easing: 'easeInOut' }
}

// --- Pose interpolation ---

const TWO_PI = Math.PI * 2

// Interpolate a joint around its pivot in polar coordinates: the joint swings
// on a natural arc and keeps its distance to the pivot (limb length) intact,
// instead of cutting the chord and shrinking mid-transition.
function polarPoint(pivotA: Vec, pivotB: Vec, pivotT: Vec, qA: Vec, qB: Vec, t: number): Vec {
  const linear = { x: qA.x + (qB.x - qA.x) * t, y: qA.y + (qB.y - qA.y) * t }
  const vA = { x: qA.x - pivotA.x, y: qA.y - pivotA.y }
  const vB = { x: qB.x - pivotB.x, y: qB.y - pivotB.y }
  const rA = Math.hypot(vA.x, vA.y)
  const rB = Math.hypot(vB.x, vB.y)
  if (rA < 2 || rB < 2) return linear

  let dAng = Math.atan2(vB.y, vB.x) - Math.atan2(vA.y, vA.x)
  if (dAng > Math.PI) dAng -= TWO_PI
  if (dAng < -Math.PI) dAng += TWO_PI

  const ang = Math.atan2(vA.y, vA.x) + dAng * t
  const r = rA + (rB - rA) * t
  const polar = { x: pivotT.x + Math.cos(ang) * r, y: pivotT.y + Math.sin(ang) * r }

  // Near-180° folds can pick a bad arc direction — blend back toward linear
  const deg = Math.abs(dAng) * (180 / Math.PI)
  const linearBlend = Math.min(1, Math.max(0, (deg - 150) / 30))
  return {
    x: polar.x + (linear.x - polar.x) * linearBlend,
    y: polar.y + (linear.y - polar.y) * linearBlend,
  }
}

export function interpolatePose(a: Pose, b: Pose, t: number): Pose {
  const lerp = (v1: number, v2: number) => v1 + (v2 - v1) * t

  const anchorsA = torsoAnchors(a)
  const anchorsB = torsoAnchors(b)
  const shoulderT: Vec = {
    x: lerp(anchorsA.shoulderCenter.x, anchorsB.shoulderCenter.x),
    y: lerp(anchorsA.shoulderCenter.y, anchorsB.shoulderCenter.y),
  }
  const pelvisT: Vec = { x: lerp(a.torsoEndX, b.torsoEndX), y: lerp(a.torsoEndY, b.torsoEndY) }

  const chain = (pivotA: Vec, pivotB: Vec, pivotT: Vec, xKey: keyof Pose, yKey: keyof Pose) =>
    polarPoint(pivotA, pivotB, pivotT, { x: a[xKey], y: a[yKey] }, { x: b[xKey], y: b[yKey] }, t)

  const leftElbowA = { x: a.leftElbowX, y: a.leftElbowY }
  const leftElbowB = { x: b.leftElbowX, y: b.leftElbowY }
  const rightElbowA = { x: a.rightElbowX, y: a.rightElbowY }
  const rightElbowB = { x: b.rightElbowX, y: b.rightElbowY }
  const leftKneeA = { x: a.leftKneeX, y: a.leftKneeY }
  const leftKneeB = { x: b.leftKneeX, y: b.leftKneeY }
  const rightKneeA = { x: a.rightKneeX, y: a.rightKneeY }
  const rightKneeB = { x: b.rightKneeX, y: b.rightKneeY }

  const leftElbow = chain(anchorsA.shoulderCenter, anchorsB.shoulderCenter, shoulderT, 'leftElbowX', 'leftElbowY')
  const rightElbow = chain(anchorsA.shoulderCenter, anchorsB.shoulderCenter, shoulderT, 'rightElbowX', 'rightElbowY')
  const leftHand = chain(leftElbowA, leftElbowB, leftElbow, 'leftHandX', 'leftHandY')
  const rightHand = chain(rightElbowA, rightElbowB, rightElbow, 'rightHandX', 'rightHandY')
  const leftKnee = chain({ x: a.torsoEndX, y: a.torsoEndY }, { x: b.torsoEndX, y: b.torsoEndY }, pelvisT, 'leftKneeX', 'leftKneeY')
  const rightKnee = chain({ x: a.torsoEndX, y: a.torsoEndY }, { x: b.torsoEndX, y: b.torsoEndY }, pelvisT, 'rightKneeX', 'rightKneeY')
  const leftFoot = chain(leftKneeA, leftKneeB, leftKnee, 'leftFootX', 'leftFootY')
  const rightFoot = chain(rightKneeA, rightKneeB, rightKnee, 'rightFootX', 'rightFootY')

  return {
    headX: lerp(a.headX, b.headX),
    headY: lerp(a.headY, b.headY),
    torsoEndX: pelvisT.x,
    torsoEndY: pelvisT.y,
    leftElbowX: leftElbow.x, leftElbowY: leftElbow.y,
    leftHandX: leftHand.x, leftHandY: leftHand.y,
    rightElbowX: rightElbow.x, rightElbowY: rightElbow.y,
    rightHandX: rightHand.x, rightHandY: rightHand.y,
    leftKneeX: leftKnee.x, leftKneeY: leftKnee.y,
    leftFootX: leftFoot.x, leftFootY: leftFoot.y,
    rightKneeX: rightKnee.x, rightKneeY: rightKnee.y,
    rightFootX: rightFoot.x, rightFootY: rightFoot.y,
  }
}

// --- Idle / secondary motion (mutates the frame pose in place) ---

const BREATHE_OMEGA = 0.25 * TWO_PI

export function applyIdleMotion(pose: Pose, anim: ExerciseAnimation, nowMs: number): void {
  const tSec = nowMs / 1000
  // Breathing: hips lag the head slightly, with a faint lateral sway
  pose.headY += Math.sin(tSec * BREATHE_OMEGA) * 1.5
  pose.headX += Math.sin(tSec * BREATHE_OMEGA * 0.5) * 0.4
  pose.torsoEndY += Math.sin(tSec * BREATHE_OMEGA - 0.6) * 0.75

  if (anim.secondaryMotion) {
    for (const m of anim.secondaryMotion) {
      const offset = Math.sin(tSec * m.frequency * TWO_PI) * m.amplitude
      for (const joint of m.joints) {
        pose[joint] += offset
      }
    }
  }
}
