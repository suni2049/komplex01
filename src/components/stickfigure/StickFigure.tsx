import { useEffect, useState } from 'react'
import type { Pose, ExerciseAnimation } from '../../types/animation'
import { animationRegistry } from './animations'

function interpolatePose(a: Pose, b: Pose, t: number): Pose {
  const lerp = (v1: number, v2: number) => v1 + (v2 - v1) * t
  return {
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
}

function easeInOut(t: number): number {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
}

interface StickFigureProps {
  animationId: string
  playing?: boolean
  size?: number
  color?: string
}

export default function StickFigure({ animationId, playing = true, size = 160, color = '#DC2626' }: StickFigureProps) {
  const anim: ExerciseAnimation | undefined = animationRegistry[animationId]
  const [pose, setPose] = useState<Pose | null>(() => anim ? anim.poses[0] : null)

  useEffect(() => {
    if (anim) setPose(anim.poses[0])
  }, [animationId]) // eslint-disable-line

  useEffect(() => {
    if (!anim || !playing) return

    let animFrame: number
    const startTime = performance.now()

    function tick(now: number) {
      const elapsed = (now - startTime) % anim!.duration
      const totalPoses = anim!.poses.length
      const segmentDuration = anim!.duration / totalPoses
      const segmentIndex = Math.floor(elapsed / segmentDuration)
      const segmentProgress = (elapsed % segmentDuration) / segmentDuration
      const currentPose = anim!.poses[segmentIndex % totalPoses]
      const nextPose = anim!.poses[(segmentIndex + 1) % totalPoses]
      setPose(interpolatePose(currentPose, nextPose, easeInOut(segmentProgress)))
      animFrame = requestAnimationFrame(tick)
    }

    animFrame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(animFrame)
  }, [anim, playing])

  if (!pose) return null

  const sw = 5
  const headR = 11
  const shoulderY = pose.headY + 28
  const shoulderX = (pose.headX + pose.torsoEndX) / 2

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
