import { useState, useEffect, useCallback } from 'react'
import { getSettings, updateSettings } from '../store/storage'
import type { UserSettings } from '../store/db'
import type { Equipment, Difficulty } from '../types/exercise'

export function useSettings() {
  const [settings, setSettings] = useState<UserSettings>({
    id: 'settings',
    equipment: ['none', 'push-up-bars'],
    defaultDifficulty: 'intermediate',
    defaultDurationMinutes: 60,
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

  return { settings, loading, toggleEquipment, setDifficulty, setDuration }
}
