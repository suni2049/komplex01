import { useLayoutEffect, useRef } from 'react'
import type { Pose, ExerciseAnimation, EasingPreset } from '../../types/animation'
import { animationRegistry } from './animations'

const easingFns: Record<EasingPreset, (t: number) => number> = {
  linear: (t) => t,
  easeIn: (t) => t * t,
  easeOut: (t) => t * (2 - t),
  easeInOut: (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
  easeInOutCubic: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  snap: (t) => (t < 0.3 ? (t / 0.3) * 0.7 : 0.7 + ((t - 0.3) / 0.7) * 0.3),
}

const ARC_BIAS = 4
const CENTER = 100
const TRANSITION_MS = 300
const TWO_PI = Math.PI * 2
const HEAD_R = 11
const STROKE_W = 5
const SHOULDER_T = 0.28

function clonePose(p: Pose): Pose {
  return {
    headX: p.headX, headY: p.headY,
    torsoEndX: p.torsoEndX, torsoEndY: p.torsoEndY,
    leftElbowX: p.leftElbowX, leftElbowY: p.leftElbowY,
    leftHandX: p.leftHandX, leftHandY: p.leftHandY,
    rightElbowX: p.rightElbowX, rightElbowY: p.rightElbowY,
    rightHandX: p.rightHandX, rightHandY: p.rightHandY,
    leftKneeX: p.leftKneeX, leftKneeY: p.leftKneeY,
    leftFootX: p.leftFootX, leftFootY: p.leftFootY,
    rightKneeX: p.rightKneeX, rightKneeY: p.rightKneeY,
    rightFootX: p.rightFootX, rightFootY: p.rightFootY,
  }
}

function interpolateInto(out: Pose, a: Pose, b: Pose, t: number): void {
  out.headX = a.headX + (b.headX - a.headX) * t
  out.headY = a.headY + (b.headY - a.headY) * t
  out.torsoEndX = a.torsoEndX + (b.torsoEndX - a.torsoEndX) * t
  out.torsoEndY = a.torsoEndY + (b.torsoEndY - a.torsoEndY) * t
  out.leftElbowX = a.leftElbowX + (b.leftElbowX - a.leftElbowX) * t
  out.leftElbowY = a.leftElbowY + (b.leftElbowY - a.leftElbowY) * t
  out.leftHandX = a.leftHandX + (b.leftHandX - a.leftHandX) * t
  out.leftHandY = a.leftHandY + (b.leftHandY - a.leftHandY) * t
  out.rightElbowX = a.rightElbowX + (b.rightElbowX - a.rightElbowX) * t
  out.rightElbowY = a.rightElbowY + (b.rightElbowY - a.rightElbowY) * t
  out.rightHandX = a.rightHandX + (b.rightHandX - a.rightHandX) * t
  out.rightHandY = a.rightHandY + (b.rightHandY - a.rightHandY) * t
  out.leftKneeX = a.leftKneeX + (b.leftKneeX - a.leftKneeX) * t
  out.leftKneeY = a.leftKneeY + (b.leftKneeY - a.leftKneeY) * t
  out.leftFootX = a.leftFootX + (b.leftFootX - a.leftFootX) * t
  out.leftFootY = a.leftFootY + (b.leftFootY - a.leftFootY) * t
  out.rightKneeX = a.rightKneeX + (b.rightKneeX - a.rightKneeX) * t
  out.rightKneeY = a.rightKneeY + (b.rightKneeY - a.rightKneeY) * t
  out.rightFootX = a.rightFootX + (b.rightFootX - a.rightFootX) * t
  out.rightFootY = a.rightFootY + (b.rightFootY - a.rightFootY) * t

  const arcPush = Math.sin(t * Math.PI) * ARC_BIAS * 0.5
  const midLHX = (a.leftHandX + b.leftHandX) * 0.5
  const midLHY = (a.leftHandY + b.leftHandY) * 0.5
  const midRHX = (a.rightHandX + b.rightHandX) * 0.5
  const midRHY = (a.rightHandY + b.rightHandY) * 0.5
  const midLFX = (a.leftFootX + b.leftFootX) * 0.5
  const midLFY = (a.leftFootY + b.leftFootY) * 0.5
  const midRFX = (a.rightFootX + b.rightFootX) * 0.5
  const midRFY = (a.rightFootY + b.rightFootY) * 0.5
  out.leftHandX += arcPush * Math.sign(midLHX - CENTER)
  out.leftHandY += arcPush * Math.sign(midLHY - CENTER)
  out.rightHandX += arcPush * Math.sign(midRHX - CENTER)
  out.rightHandY += arcPush * Math.sign(midRHY - CENTER)
  out.leftFootX += arcPush * Math.sign(midLFX - CENTER)
  out.leftFootY += arcPush * Math.sign(midLFY - CENTER)
  out.rightFootX += arcPush * Math.sign(midRFX - CENTER)
  out.rightFootY += arcPush * Math.sign(midRFY - CENTER)
}

interface SegmentInfo {
  index: number
  progress: number
  easing: EasingPreset
}

function getSegmentInfo(anim: ExerciseAnimation, elapsed: number): SegmentInfo {
  const totalPoses = anim.poses.length

  if (anim.segments && anim.segments.length > 0) {
    const segs = anim.segments
    let totalDuration = 0
    for (let i = 0; i < segs.length; i++) {
      const s = segs[i]
      totalDuration += s.duration + (s.holdStart || 0) + (s.holdEnd || 0)
    }
    const loopTime = elapsed % totalDuration
    let accumulated = 0

    for (let i = 0; i < segs.length; i++) {
      const seg = segs[i]
      const holdStart = seg.holdStart || 0
      const holdEnd = seg.holdEnd || 0
      const segTotal = seg.duration + holdStart + holdEnd

      if (loopTime < accumulated + segTotal) {
        const segElapsed = loopTime - accumulated
        if (segElapsed < holdStart) return { index: i, progress: 0, easing: seg.easing }
        if (segElapsed > holdStart + seg.duration) return { index: i, progress: 1, easing: seg.easing }
        return { index: i, progress: (segElapsed - holdStart) / seg.duration, easing: seg.easing }
      }
      accumulated += segTotal
    }
    return { index: segs.length - 1, progress: 1, easing: segs[segs.length - 1].easing }
  }

  const segmentDuration = anim.duration / totalPoses
  const loopTime = elapsed % anim.duration
  const segmentIndex = Math.floor(loopTime / segmentDuration)
  return {
    index: segmentIndex % totalPoses,
    progress: (loopTime % segmentDuration) / segmentDuration,
    easing: 'easeInOut',
  }
}

interface StickFigureProps {
  animationId: string
  playing?: boolean
  size?: number
  color?: string
}

export default function StickFigure({
  animationId,
  playing = true,
  size = 160,
  color = 'var(--color-primary-600)',
}: StickFigureProps) {
  const anim: ExerciseAnimation | undefined = animationRegistry[animationId]

  const headRef = useRef<SVGCircleElement>(null)
  const torsoRef = useRef<SVGLineElement>(null)
  const lUpperArmRef = useRef<SVGLineElement>(null)
  const lForearmRef = useRef<SVGLineElement>(null)
  const rUpperArmRef = useRef<SVGLineElement>(null)
  const rForearmRef = useRef<SVGLineElement>(null)
  const lThighRef = useRef<SVGLineElement>(null)
  const lShinRef = useRef<SVGLineElement>(null)
  const rThighRef = useRef<SVGLineElement>(null)
  const rShinRef = useRef<SVGLineElement>(null)

  // Survives animationId changes so we can cross-fade from the last visible pose.
  const lastPoseRef = useRef<Pose | null>(null)

  useLayoutEffect(() => {
    if (!anim) return

    const tmp: Pose = clonePose(anim.poses[0])

    const setLine = (
      el: SVGLineElement | null,
      x1: number,
      y1: number,
      x2: number,
      y2: number,
    ) => {
      if (!el) return
      el.x1.baseVal.value = x1
      el.y1.baseVal.value = y1
      el.x2.baseVal.value = x2
      el.y2.baseVal.value = y2
    }

    const applyPose = (p: Pose) => {
      const head = headRef.current
      if (head) {
        head.cx.baseVal.value = p.headX
        head.cy.baseVal.value = p.headY
      }
      const torsoStartX = p.headX
      const torsoStartY = p.headY + HEAD_R
      const shoulderX = torsoStartX + (p.torsoEndX - torsoStartX) * SHOULDER_T
      const shoulderY = torsoStartY + (p.torsoEndY - torsoStartY) * SHOULDER_T

      setLine(torsoRef.current, torsoStartX, torsoStartY, p.torsoEndX, p.torsoEndY)
      setLine(lUpperArmRef.current, shoulderX, shoulderY, p.leftElbowX, p.leftElbowY)
      setLine(lForearmRef.current, p.leftElbowX, p.leftElbowY, p.leftHandX, p.leftHandY)
      setLine(rUpperArmRef.current, shoulderX, shoulderY, p.rightElbowX, p.rightElbowY)
      setLine(rForearmRef.current, p.rightElbowX, p.rightElbowY, p.rightHandX, p.rightHandY)
      setLine(lThighRef.current, p.torsoEndX, p.torsoEndY, p.leftKneeX, p.leftKneeY)
      setLine(lShinRef.current, p.leftKneeX, p.leftKneeY, p.leftFootX, p.leftFootY)
      setLine(rThighRef.current, p.torsoEndX, p.torsoEndY, p.rightKneeX, p.rightKneeY)
      setLine(rShinRef.current, p.rightKneeX, p.rightKneeY, p.rightFootX, p.rightFootY)
    }

    const fromPose = lastPoseRef.current
    const transition =
      fromPose && playing
        ? { from: clonePose(fromPose), to: anim.poses[0], start: performance.now() }
        : null

    applyPose(transition ? transition.from : anim.poses[0])

    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (!playing || reduced) {
      lastPoseRef.current = clonePose(anim.poses[0])
      return
    }

    let rafId = 0
    const startTime = performance.now()
    let inTransition = transition

    const tick = (now: number) => {
      if (inTransition) {
        const tElapsed = now - inTransition.start
        if (tElapsed < TRANSITION_MS) {
          const t = easingFns.easeOut(tElapsed / TRANSITION_MS)
          interpolateInto(tmp, inTransition.from, inTransition.to, t)
          applyPose(tmp)
          rafId = requestAnimationFrame(tick)
          return
        }
        inTransition = null
      }

      const elapsed = now - startTime
      const seg = getSegmentInfo(anim, elapsed)
      const totalPoses = anim.poses.length
      const a = anim.poses[seg.index % totalPoses]
      const b = anim.poses[(seg.index + 1) % totalPoses]
      const easedT = easingFns[seg.easing](seg.progress)
      interpolateInto(tmp, a, b, easedT)

      const t = now / 1000
      const breathe = Math.sin(t * 0.25 * TWO_PI) * 1.5
      tmp.headY += breathe
      tmp.torsoEndY += breathe * 0.5

      if (anim.secondaryMotion) {
        for (let i = 0; i < anim.secondaryMotion.length; i++) {
          const m = anim.secondaryMotion[i]
          const offset = Math.sin(t * m.frequency * TWO_PI) * m.amplitude
          for (let j = 0; j < m.joints.length; j++) {
            tmp[m.joints[j]] += offset
          }
        }
      }

      applyPose(tmp)
      rafId = requestAnimationFrame(tick)
    }

    rafId = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(rafId)
      lastPoseRef.current = clonePose(tmp)
    }
  }, [animationId, playing, anim])

  if (!anim) return null

  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      style={{ overflow: 'visible' }}
    >
      <circle ref={headRef} r={HEAD_R} fill="none" stroke={color} strokeWidth={STROKE_W} />
      <line ref={torsoRef} stroke={color} strokeWidth={STROKE_W} strokeLinecap="square" />
      <line ref={lUpperArmRef} stroke={color} strokeWidth={STROKE_W} strokeLinecap="square" />
      <line ref={lForearmRef} stroke={color} strokeWidth={STROKE_W} strokeLinecap="square" />
      <line ref={rUpperArmRef} stroke={color} strokeWidth={STROKE_W} strokeLinecap="square" />
      <line ref={rForearmRef} stroke={color} strokeWidth={STROKE_W} strokeLinecap="square" />
      <line ref={lThighRef} stroke={color} strokeWidth={STROKE_W} strokeLinecap="square" />
      <line ref={lShinRef} stroke={color} strokeWidth={STROKE_W} strokeLinecap="square" />
      <line ref={rThighRef} stroke={color} strokeWidth={STROKE_W} strokeLinecap="square" />
      <line ref={rShinRef} stroke={color} strokeWidth={STROKE_W} strokeLinecap="square" />
    </svg>
  )
}
