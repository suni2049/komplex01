import { useEffect, useRef } from 'react'

const SCRIPTS = [
  'KOMPLEX-01',
  'КОМПЛЕКС-01',
  '综合体-01',
  'コンプレクス-01',
  'كومبلكس-٠١',
]

const GLITCH_CHARS = 'АБВГД漢字カタ٣٧αβγΔ01█▓░▒■'
const GLITCH_FRAME_MS = 55
const GLITCH_FRAMES = 8

function scramble(base: string): string {
  let out = ''
  for (let i = 0; i < base.length; i++) {
    const ch = base[i]
    if (ch === '-') {
      out += ch
    } else if (Math.random() < 0.35) {
      out += ch
    } else {
      out += GLITCH_CHARS[(Math.random() * GLITCH_CHARS.length) | 0]
    }
  }
  return out
}

export default function GlitchTitle({ className }: { className?: string }) {
  const spanRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const el = spanRef.current
    if (!el) return

    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    el.textContent = SCRIPTS[0]
    if (reduced) return

    let rafId = 0
    let scriptIndex = 0
    // 'hold' = show clean text until holdUntil; 'glitch' = scramble frames
    let mode: 'hold' | 'glitch' = 'hold'
    let holdUntil = performance.now() + 3500
    let nextFrameAt = 0
    let frame = 0

    const tick = (now: number) => {
      if (mode === 'hold') {
        if (now >= holdUntil) {
          mode = 'glitch'
          frame = 0
          nextFrameAt = now
        }
      } else if (now >= nextFrameAt) {
        if (frame >= GLITCH_FRAMES) {
          // Land on the next script, enter hold
          scriptIndex = (scriptIndex + 1) % SCRIPTS.length
          el.textContent = SCRIPTS[scriptIndex]
          mode = 'hold'
          holdUntil =
            now + (scriptIndex === 0 ? 3500 + Math.random() * 1500 : 1400 + Math.random() * 600)
        } else {
          const nextScript = (scriptIndex + 1) % SCRIPTS.length
          if (frame < 2 || frame > GLITCH_FRAMES - 2) {
            el.textContent = scramble(SCRIPTS[scriptIndex])
          } else if (Math.random() < 0.5) {
            el.textContent = SCRIPTS[nextScript]
          } else {
            const src = Math.random() < 0.5 ? SCRIPTS[scriptIndex] : SCRIPTS[nextScript]
            el.textContent = scramble(src)
          }
          frame++
          nextFrameAt = now + GLITCH_FRAME_MS
        }
      }
      rafId = requestAnimationFrame(tick)
    }

    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [])

  return (
    <span ref={spanRef} className={`relative inline-block crt-text ${className ?? ''}`}>
      {SCRIPTS[0]}
    </span>
  )
}
