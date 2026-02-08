import { useState, useEffect } from 'react'

const SCRIPTS = [
  'KOMPLEX-01',
  'КОМПЛЕКС-01',
  '综合体-01',
  'コンプレクス-01',
  'كومبلكس-٠١',
]

// Characters to use for scramble frames
const GLITCH_CHARS = 'АБВГД漢字カタ٣٧αβγΔ01█▓░▒■'

function scramble(base: string): string {
  return base.split('').map(ch => {
    if (ch === '-') return ch
    if (Math.random() < 0.35) return ch
    return GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)]
  }).join('')
}

export default function GlitchTitle({ className }: { className?: string }) {
  const [display, setDisplay] = useState(SCRIPTS[0])

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>
    let frameTimeout: ReturnType<typeof setTimeout>
    let running = true

    const cycle = (scriptIndex: number) => {
      if (!running) return

      // Show the current script cleanly
      setDisplay(SCRIPTS[scriptIndex])

      // Hold the clean text for 2-4 seconds
      const holdTime = scriptIndex === 0 ? 3000 + Math.random() * 2000 : 1200 + Math.random() * 800

      timeout = setTimeout(() => {
        if (!running) return

        // Glitch transition: 6-10 rapid frames of scrambled text
        const totalFrames = 6 + Math.floor(Math.random() * 5)
        let frame = 0
        const nextScript = (scriptIndex + 1) % SCRIPTS.length

        const glitchTick = () => {
          if (!running) return
          if (frame >= totalFrames) {
            // Move to next script
            cycle(nextScript)
            return
          }

          // Mix between current, next, and random glitch chars
          if (frame < 2 || frame > totalFrames - 2) {
            // Start/end: heavy scramble
            setDisplay(scramble(SCRIPTS[scriptIndex]))
          } else if (Math.random() < 0.5) {
            // Middle: flash the target script
            setDisplay(SCRIPTS[nextScript])
          } else {
            // Middle: scrambled mix
            const src = Math.random() < 0.5 ? SCRIPTS[scriptIndex] : SCRIPTS[nextScript]
            setDisplay(scramble(src))
          }

          frame++
          frameTimeout = setTimeout(glitchTick, 40 + Math.random() * 60)
        }

        glitchTick()
      }, holdTime)
    }

    cycle(0)

    return () => {
      running = false
      clearTimeout(timeout)
      clearTimeout(frameTimeout)
    }
  }, [])

  return (
    <span className={`relative inline-block crt-text ${className ?? ''}`}>
      {display}
    </span>
  )
}
