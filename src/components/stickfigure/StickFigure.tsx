import { useEffect, useState, useRef, useCallback } from 'react'
import type { Pose, ExerciseAnimation, EasingPreset } from '../../types/animation'
import { animationRegistry } from './animations'

// --- Easing functions ---

const easingFns: Record<EasingPreset, (t: number) => number> = {
  linear: (t) => t,
  easeIn: (t) => t * t,
  easeOut: (t) => t * (2 - t),
  easeInOut: (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
  easeInOutCubic: (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
  snap: (t) => {
    // fast attack (~70% done by t=0.3), slow settle
    if (t < 0.3) return t / 0.3 * 0.7
    return 0.7 + (t - 0.3) / 0.7 * 0.3
  },
}

// --- Arc bias for extremity joints ---

const ARC_BIAS = 4 // pixels
const CENTER = 100 // viewBox center
const extremityKeys: (keyof Pose)[] = [
  'leftHandX', 'leftHandY', 'rightHandX', 'rightHandY',
  'leftFootX', 'leftFootY', 'rightFootX', 'rightFootY',
]

function interpolatePose(a: Pose, b: Pose, t: number): Pose {
  const lerp = (v1: number, v2: number) => v1 + (v2 - v1) * t

  const result: Pose = {
    headX: lerp(a.headX, b.headX),
    headY: lerp(a.headY, b.headY),
    torsoEndX: lerp(a.torsoEndX, b.torsoEndX),
    torsoEndY: lerp(a.torsoEndY, b.torsoEndY),
    leftElbowX: lerp(a.leftElbowX, b.leftElbowX),
    leftElbowY: lerp(a.leftElbowY, b.leftElbowY),
    leftHandX: lerp(a.leftHandX, b.leftHandX),
    leftHandY: lerp(a.leftHandY, b.leftHandY),
    rightElbowX: lerp(a.rightElbowX, b.rightElbowX),
    rightElbowY: lerp(a.rightElbowY, b.rightElbowY),
    rightHandX: lerp(a.rightHandX, b.rightHandX),
    rightHandY: lerp(a.rightHandY, b.rightHandY),
    leftKneeX: lerp(a.leftKneeX, b.leftKneeX),
    leftKneeY: lerp(a.leftKneeY, b.leftKneeY),
    leftFootX: lerp(a.leftFootX, b.leftFootX),
    leftFootY: lerp(a.leftFootY, b.leftFootY),
    rightKneeX: lerp(a.rightKneeX, b.rightKneeX),
    rightKneeY: lerp(a.rightKneeY, b.rightKneeY),
    rightFootX: lerp(a.rightFootX, b.rightFootX),
    rightFootY: lerp(a.rightFootY, b.rightFootY),
  }

  // Arc bias: push extremities outward from center at mid-interpolation
  const arcPush = Math.sin(t * Math.PI) * ARC_BIAS
  for (const key of extremityKeys) {
    const mid = (a[key] + b[key]) / 2
    result[key] += arcPush * Math.sign(mid - CENTER) * 0.5
  }

  return result
}

// --- Segment timing helpers ---

interface SegmentInfo {
  index: number
  progress: number // 0-1 within segment, raw (before easing)
  easing: EasingPreset
}

function getSegmentInfo(anim: ExerciseAnimation, elapsed: number): SegmentInfo {
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

// --- Component ---

interface StickFigureProps {
  animationId: string
  playing?: boolean
  size?: number
  color?: string
}

export default function StickFigure({ animationId, playing = true, size = 160, color = 'var(--color-primary-600)' }: StickFigureProps) {
  const anim: ExerciseAnimation | undefined = animationRegistry[animationId]
  const [pose, setPose] = useState<Pose | null>(() => anim ? anim.poses[0] : null)
  const rafRef = useRef<number>(0)
  const playingRef = useRef(playing)
  playingRef.current = playing

  // Smooth transition state
  const transitionRef = useRef<{ from: Pose; to: Pose; start: number } | null>(null)
  const currentPoseRef = useRef<Pose | null>(null)

  // Track current pose for transitions
  useEffect(() => {
    if (pose) currentPoseRef.current = pose
  }, [pose])

  // Smooth transition when animation changes
  useEffect(() => {
    if (anim) {
      const prev = currentPoseRef.current
      if (prev && playing) {
        transitionRef.current = {
          from: prev,
          to: anim.poses[0],
          start: performance.now(),
        }
      } else {
        setPose(anim.poses[0])
      }
    }
  }, [animationId]) // eslint-disable-line

  const animate = useCallback(() => {
    if (!anim || !playingRef.current) return

    const startTime = performance.now()

    function tick() {
      if (!playingRef.current) return
      const now = performance.now()

      // Handle transition cross-fade
      const tr = transitionRef.current
      if (tr) {
        const tElapsed = now - tr.start
        const TRANSITION_MS = 300
        if (tElapsed < TRANSITION_MS) {
          const t = easingFns.easeOut(tElapsed / TRANSITION_MS)
          setPose(interpolatePose(tr.from, tr.to, t))
          rafRef.current = requestAnimationFrame(tick)
          return
        }
        transitionRef.current = null
      }

      // Main animation loop
      const elapsed = now - startTime
      const seg = getSegmentInfo(anim!, elapsed)
      const totalPoses = anim!.poses.length
      const currentPose = anim!.poses[seg.index % totalPoses]
      const nextPose = anim!.poses[(seg.index + 1) % totalPoses]
      const easedT = easingFns[seg.easing](seg.progress)
      const interpolated = interpolatePose(currentPose, nextPose, easedT)

      // Secondary motion — universal breathing + per-animation overrides
      const breathe = Math.sin(now / 1000 * 0.25 * Math.PI * 2) * 1.5
      interpolated.headY += breathe
      interpolated.torsoEndY += breathe * 0.5

      if (anim!.secondaryMotion) {
        for (const m of anim!.secondaryMotion) {
          const offset = Math.sin(now / 1000 * m.frequency * Math.PI * 2) * m.amplitude
          for (const joint of m.joints) {
            interpolated[joint] += offset
          }
        }
      }

      setPose(interpolated)
      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
  }, [anim])

  // Start/stop animation
  useEffect(() => {
    if (playing && anim) {
      animate()
    }
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = 0
      }
    }
  }, [playing, animationId, animate]) // eslint-disable-line

  if (!pose) return null

  const sw = 5
  const headR = 11
  const torsoStartX = pose.headX
  const torsoStartY = pose.headY + headR
  const shoulderT = 0.28
  const shoulderX = torsoStartX + (pose.torsoEndX - torsoStartX) * shoulderT
  const shoulderY = torsoStartY + (pose.torsoEndY - torsoStartY) * shoulderT

  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      style={{ overflow: 'visible' }}
    >
      {/* Head - no fill, harsh stroke */}
      <circle cx={pose.headX} cy={pose.headY} r={headR} fill="none" stroke={color} strokeWidth={sw} />

      {/* Torso */}
      <line x1={pose.headX} y1={pose.headY + headR} x2={pose.torsoEndX} y2={pose.torsoEndY} stroke={color} strokeWidth={sw} strokeLinecap="square" />

      {/* Left Arm */}
      <line x1={shoulderX} y1={shoulderY} x2={pose.leftElbowX} y2={pose.leftElbowY} stroke={color} strokeWidth={sw} strokeLinecap="square" />
      <line x1={pose.leftElbowX} y1={pose.leftElbowY} x2={pose.leftHandX} y2={pose.leftHandY} stroke={color} strokeWidth={sw} strokeLinecap="square" />

      {/* Right Arm */}
      <line x1={shoulderX} y1={shoulderY} x2={pose.rightElbowX} y2={pose.rightElbowY} stroke={color} strokeWidth={sw} strokeLinecap="square" />
      <line x1={pose.rightElbowX} y1={pose.rightElbowY} x2={pose.rightHandX} y2={pose.rightHandY} stroke={color} strokeWidth={sw} strokeLinecap="square" />

      {/* Left Leg */}
      <line x1={pose.torsoEndX} y1={pose.torsoEndY} x2={pose.leftKneeX} y2={pose.leftKneeY} stroke={color} strokeWidth={sw} strokeLinecap="square" />
      <line x1={pose.leftKneeX} y1={pose.leftKneeY} x2={pose.leftFootX} y2={pose.leftFootY} stroke={color} strokeWidth={sw} strokeLinecap="square" />

      {/* Right Leg */}
      <line x1={pose.torsoEndX} y1={pose.torsoEndY} x2={pose.rightKneeX} y2={pose.rightKneeY} stroke={color} strokeWidth={sw} strokeLinecap="square" />
      <line x1={pose.rightKneeX} y1={pose.rightKneeY} x2={pose.rightFootX} y2={pose.rightFootY} stroke={color} strokeWidth={sw} strokeLinecap="square" />
    </svg>
  )
}
