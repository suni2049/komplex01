import { useEffect, useLayoutEffect, useRef, useId, memo } from 'react'
import type { Pose } from '../../types/animation'
import { animationRegistry } from './animations'
import {
  buildFigureGeometry, getGroundY,
  HEAD_R, NECK_W, UPPER_ARM_W, FOREARM_W, THIGH_W, CALF_W,
  type FigureGeometry, type Line, type LimbKey,
} from './geometry'
import { easingFns, getSegmentInfo, interpolatePose, applyIdleMotion } from './motion'

const TRANSITION_MS = 400

// Equipment prop colors — deliberately distinct from the figure's accent color
// so the pole and kettlebell read as separate objects in any theme.
const POLE_COLOR = '#38bdf8'      // sky blue — metal pole
const KETTLEBELL_COLOR = '#f59e0b' // amber — cast bell
const POLE_W = 5
const KB_HANDLE_W = 3.5

const EXTREMITY_KEYS = [
  'leftHandX', 'leftHandY', 'rightHandX', 'rightHandY',
  'leftFootX', 'leftFootY', 'rightFootX', 'rightFootY',
] as const

const LIMB_WIDTHS: Record<LimbKey, number> = {
  leftUpperArm: UPPER_ARM_W, leftForearm: FOREARM_W,
  rightUpperArm: UPPER_ARM_W, rightForearm: FOREARM_W,
  leftThigh: THIGH_W, leftCalf: CALF_W,
  rightThigh: THIGH_W, rightCalf: CALF_W,
}

const FAR_LIMBS: LimbKey[] = ['leftUpperArm', 'leftForearm', 'leftThigh', 'leftCalf']
const NEAR_LIMBS: LimbKey[] = ['rightUpperArm', 'rightForearm', 'rightThigh', 'rightCalf']

type ElementMap = Record<string, SVGElement | null>

function setLine(el: SVGElement, l: Line) {
  el.setAttribute('x1', String(l.x1))
  el.setAttribute('y1', String(l.y1))
  el.setAttribute('x2', String(l.x2))
  el.setAttribute('y2', String(l.y2))
}

function applyGeometry(els: ElementMap, geo: FigureGeometry) {
  els.torso?.setAttribute('d', geo.torsoD)
  if (els.neck) setLine(els.neck, geo.neck)
  if (els.head) {
    els.head.setAttribute('cx', String(geo.head.cx))
    els.head.setAttribute('cy', String(geo.head.cy))
  }
  for (const key of Object.keys(geo.limbs) as LimbKey[]) {
    const el = els[key]
    if (el) setLine(el, geo.limbs[key])
  }
  const sh = els.shadow
  if (sh) {
    sh.setAttribute('cx', String(geo.shadow.cx))
    sh.setAttribute('cy', String(geo.shadow.cy))
    sh.setAttribute('rx', String(geo.shadow.rx))
    sh.setAttribute('ry', String(geo.shadow.ry))
    sh.setAttribute('opacity', String(geo.shadow.opacity))
  }
  const p = geo.prop
  if (els.pole && p?.pole) setLine(els.pole, p.pole)
  if (p?.kettlebell) {
    if (els.kbHandle) setLine(els.kbHandle, p.kettlebell.handle)
    if (els.kbBell) {
      els.kbBell.setAttribute('cx', String(p.kettlebell.cx))
      els.kbBell.setAttribute('cy', String(p.kettlebell.cy))
    }
  }
}

interface StickFigureProps {
  animationId: string
  playing?: boolean
  size?: number
  color?: string
}

interface LastFrame {
  animId: string
  pose: Pose
  groundY: number
}

function StickFigure({ animationId, playing = true, size = 160, color = 'var(--color-primary-600)' }: StickFigureProps) {
  const anim = animationRegistry[animationId]
  const gradId = useId()

  const els = useRef<ElementMap>({})
  const lastFrameRef = useRef<LastFrame | null>(null)
  const transitionRef = useRef<{ from: Pose; fromGroundY: number; start: number } | null>(null)
  const followRef = useRef<Record<string, number> | null>(null)
  const prevAnimIdRef = useRef(animationId)

  // Cross-fade setup when the animation changes mid-play
  useEffect(() => {
    if (prevAnimIdRef.current !== animationId) {
      const last = lastFrameRef.current
      if (anim && last && playing) {
        transitionRef.current = { from: last.pose, fromGroundY: last.groundY, start: performance.now() }
      } else {
        transitionRef.current = null
      }
      followRef.current = null
      prevAnimIdRef.current = animationId
    }
  }, [animationId, anim, playing])

  // Animation loop: imperative attribute writes, no per-frame React state
  useEffect(() => {
    if (!playing || !anim) return

    followRef.current = null
    const groundY = getGroundY(anim)
    let startTime = performance.now()
    let lastTick = startTime
    let raf = 0

    const tick = () => {
      const now = performance.now()
      const dt = Math.min(now - lastTick, 100)
      lastTick = now

      let pose: Pose | null = null
      let gY = groundY

      const tr = transitionRef.current
      if (tr) {
        const tt = (now - tr.start) / TRANSITION_MS
        if (tt >= 1) {
          transitionRef.current = null
          startTime = now
        } else {
          const e = easingFns.easeInOutCubic(tt)
          pose = interpolatePose(tr.from, anim.poses[0], e)
          gY = tr.fromGroundY + (groundY - tr.fromGroundY) * e
        }
      }

      if (!pose) {
        const elapsed = now - startTime
        const seg = getSegmentInfo(anim, elapsed)
        const totalPoses = anim.poses.length
        const easedT = easingFns[seg.easing](seg.progress)
        pose = interpolatePose(anim.poses[seg.index % totalPoses], anim.poses[(seg.index + 1) % totalPoses], easedT)
      }

      applyIdleMotion(pose, anim, now)

      // Follow-through: extremities trail their targets by ~40ms
      const k = 1 - Math.pow(0.28, dt / 16.667)
      const prev = followRef.current
      if (prev) {
        for (const key of EXTREMITY_KEYS) {
          pose[key] = prev[key] + (pose[key] - prev[key]) * k
        }
      }
      const next: Record<string, number> = {}
      for (const key of EXTREMITY_KEYS) next[key] = pose[key]
      followRef.current = next

      lastFrameRef.current = { animId: animationId, pose, groundY: gY }
      applyGeometry(els.current, buildFigureGeometry(pose, gY, anim.prop))
      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [playing, anim, animationId])

  // Re-renders reconcile the JSX back to poses[0]; before paint, restore the
  // latest animated frame so prop changes don't cause a visible snap. A stale
  // frame is only restored if a running loop or cross-fade will overwrite it.
  useLayoutEffect(() => {
    const last = lastFrameRef.current
    if (last && (last.animId === animationId || playing)) {
      applyGeometry(els.current, buildFigureGeometry(last.pose, last.groundY, anim?.prop))
    }
  })

  if (!anim) return null

  const geo = buildFigureGeometry(anim.poses[0], getGroundY(anim), anim.prop)

  const setEl = (key: string) => (el: SVGElement | null) => { els.current[key] = el }
  const farColor = `color-mix(in srgb, ${color} 70%, #000)`
  const headColor = `color-mix(in srgb, ${color} 88%, #fff)`

  const limbLines = (keys: LimbKey[], stroke: string) => keys.map((key) => (
    <line
      key={key}
      ref={setEl(key)}
      {...geo.limbs[key]}
      stroke={stroke}
      strokeWidth={LIMB_WIDTHS[key]}
      strokeLinecap="round"
    />
  ))

  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      style={{ overflow: 'visible' }}
    >
      <defs>
        <radialGradient id={gradId}>
          <stop offset="0%" stopColor={`color-mix(in srgb, ${color} 60%, transparent)`} />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
      </defs>

      {/* Ground shadow */}
      <ellipse
        ref={setEl('shadow')}
        cx={geo.shadow.cx}
        cy={geo.shadow.cy}
        rx={geo.shadow.rx}
        ry={geo.shadow.ry}
        opacity={geo.shadow.opacity}
        fill={`url(#${gradId})`}
      />

      {/* Pole prop — behind the figure so hands grip in front of it */}
      {anim.prop?.kind === 'pole' && geo.prop?.pole && (
        <line
          ref={setEl('pole')}
          {...geo.prop.pole}
          stroke={POLE_COLOR}
          strokeWidth={POLE_W}
          strokeLinecap="round"
        />
      )}

      {/* Far limbs (darker, behind torso) */}
      {limbLines(FAR_LIMBS, farColor)}

      {/* Neck + torso */}
      <line ref={setEl('neck')} {...geo.neck} stroke={color} strokeWidth={NECK_W} strokeLinecap="round" />
      <path ref={setEl('torso')} d={geo.torsoD} fill={color} />

      {/* Head */}
      <circle ref={setEl('head')} cx={geo.head.cx} cy={geo.head.cy} r={HEAD_R} fill={headColor} />

      {/* Near limbs */}
      {limbLines(NEAR_LIMBS, color)}

      {/* Kettlebell prop — in front, tracks the gripping hand(s) */}
      {anim.prop?.kind === 'kettlebell' && geo.prop?.kettlebell && (
        <>
          <line
            ref={setEl('kbHandle')}
            {...geo.prop.kettlebell.handle}
            stroke={`color-mix(in srgb, ${KETTLEBELL_COLOR} 70%, #000)`}
            strokeWidth={KB_HANDLE_W}
            strokeLinecap="round"
          />
          <circle
            ref={setEl('kbBell')}
            cx={geo.prop.kettlebell.cx}
            cy={geo.prop.kettlebell.cy}
            r={geo.prop.kettlebell.r}
            fill={KETTLEBELL_COLOR}
          />
        </>
      )}
    </svg>
  )
}

export default memo(StickFigure)
