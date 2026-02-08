import { useSettings } from './useSettings'
import * as sounds from '../lib/sounds'

export function useSound() {
  const { settings } = useSettings()
  const on = settings.soundEnabled

  return {
    click: () => { if (on) sounds.playClick() },
    select: () => { if (on) sounds.playSelect() },
    generate: () => { if (on) sounds.playGenerate() },
    ready: () => { if (on) sounds.playReady() },
    commence: () => { if (on) sounds.playCommence() },
    complete: () => { if (on) sounds.playComplete() },
    skip: () => { if (on) sounds.playSkip() },
    tick: () => { if (on) sounds.playTick() },
    timerDone: () => { if (on) sounds.playTimerDone() },
    victory: () => { if (on) sounds.playVictory() },
    warning: () => { if (on) sounds.playWarning() },
    pause: () => { if (on) sounds.playPause() },
  }
}
