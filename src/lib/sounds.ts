let ctx: AudioContext | null = null

function getContext(): AudioContext | null {
  if (!ctx) {
    try {
      ctx = new AudioContext()
    } catch {
      return null
    }
  }
  if (ctx.state === 'suspended') ctx.resume()
  return ctx
}

// ── Utility ──

function tone(
  freq: number,
  duration: number,
  type: OscillatorType = 'square',
  volume = 0.15,
  delay = 0,
) {
  const c = getContext()
  if (!c) return
  const osc = c.createOscillator()
  const gain = c.createGain()
  osc.type = type
  osc.frequency.value = freq
  const t = c.currentTime + delay
  gain.gain.setValueAtTime(volume, t)
  gain.gain.exponentialRampToValueAtTime(0.001, t + duration)
  osc.connect(gain).connect(c.destination)
  osc.start(t)
  osc.stop(t + duration)
}

function sweep(
  startFreq: number,
  endFreq: number,
  duration: number,
  type: OscillatorType = 'sine',
  volume = 0.12,
  delay = 0,
) {
  const c = getContext()
  if (!c) return
  const osc = c.createOscillator()
  const gain = c.createGain()
  osc.type = type
  const t = c.currentTime + delay
  osc.frequency.setValueAtTime(startFreq, t)
  osc.frequency.exponentialRampToValueAtTime(endFreq, t + duration)
  gain.gain.setValueAtTime(volume, t)
  gain.gain.exponentialRampToValueAtTime(0.001, t + duration)
  osc.connect(gain).connect(c.destination)
  osc.start(t)
  osc.stop(t + duration)
}

// ── Sound Effects ──

/** Short percussive click — button taps, toggles */
export function playClick() {
  tone(800, 0.03, 'square', 0.12)
}

/** Softer selection blip — focus, difficulty, color change */
export function playSelect() {
  tone(600, 0.06, 'triangle', 0.1)
}

/** Rising sweep — generate workout button */
export function playGenerate() {
  sweep(200, 800, 0.4, 'sine', 0.1)
}

/** Two-tone confirmation — protocol ready */
export function playReady() {
  tone(600, 0.08, 'sine', 0.12)
  tone(800, 0.08, 'sine', 0.12, 0.1)
}

/** Three ascending tones — commence workout */
export function playCommence() {
  tone(400, 0.06, 'sine', 0.1)
  tone(600, 0.06, 'sine', 0.1, 0.08)
  tone(900, 0.08, 'sine', 0.12, 0.16)
}

/** Clean blip — exercise complete */
export function playComplete() {
  tone(900, 0.05, 'sine', 0.12)
}

/** Descending blip — skip exercise */
export function playSkip() {
  sweep(600, 300, 0.06, 'square', 0.1)
}

/** Very quiet tick — rest countdown */
export function playTick() {
  tone(1000, 0.02, 'sine', 0.06)
}

/** Double ping — rest period over */
export function playTimerDone() {
  tone(1000, 0.04, 'sine', 0.12)
  tone(1200, 0.04, 'sine', 0.12, 0.08)
}

/** Ascending arpeggio — workout complete */
export function playVictory() {
  tone(400, 0.1, 'sine', 0.1)
  tone(500, 0.1, 'sine', 0.1, 0.1)
  tone(600, 0.1, 'sine', 0.1, 0.2)
  tone(800, 0.15, 'sine', 0.12, 0.3)
}

/** Low buzz — warning/destructive action */
export function playWarning() {
  tone(200, 0.15, 'square', 0.1)
}

/** Short low blip — pause/resume */
export function playPause() {
  tone(400, 0.04, 'triangle', 0.1)
}
