import { useState, useEffect, useCallback } from 'react'
import { getSettings, updateSettings } from '../store/storage'
import { applyThemeColors } from './useTheme'
import type { UserSettings } from '../store/db'
import type { Equipment, Difficulty } from '../types/exercise'
import type { WorkoutGrouping } from '../types/workout'

export function useSettings() {
  const [settings, setSettings] = useState<UserSettings>({
    id: 'settings',
    equipment: ['none', 'push-up-bars'],
    defaultDifficulty: 'intermediate',
    defaultDurationMinutes: 60,
    accentColor: 'signal-red',
    soundEnabled: true,
    workoutGrouping: 'circuit',
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getSettings().then(s => { setSettings(s); setLoading(false) })
  }, [])

  const toggleEquipment = useCallback(async (eq: Equipment) => {
    const current = settings.equipment
    const next = current.includes(eq)
      ? current.filter(e => e !== eq)
      : [...current, eq]
    // 'none' is always included
    const withNone = next.includes('none') ? next : ['none' as Equipment, ...next]
    const updated = await updateSettings({ equipment: withNone })
    setSettings(updated)
  }, [settings])

  const setDifficulty = useCallback(async (d: Difficulty) => {
    const updated = await updateSettings({ defaultDifficulty: d })
    setSettings(updated)
  }, [])

  const setDuration = useCallback(async (m: number) => {
    const updated = await updateSettings({ defaultDurationMinutes: m })
    setSettings(updated)
  }, [])

  const setAccentColor = useCallback(async (colorId: string) => {
    applyThemeColors(colorId)
    const updated = await updateSettings({ accentColor: colorId })
    setSettings(updated)
  }, [])

  const toggleSound = useCallback(async () => {
    const updated = await updateSettings({ soundEnabled: !settings.soundEnabled })
    setSettings(updated)
  }, [settings.soundEnabled])

  const setWorkoutGrouping = useCallback(async (g: WorkoutGrouping) => {
    const updated = await updateSettings({ workoutGrouping: g })
    setSettings(updated)
  }, [])

  return { settings, loading, toggleEquipment, setDifficulty, setDuration, setAccentColor, toggleSound, setWorkoutGrouping }
}
