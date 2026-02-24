import { useState, useEffect, useCallback } from 'react'
import {
  getWorkoutHistory,
  saveWorkout,
  deleteWorkout,
  toggleFavorite,
  renameWorkout,
  getFavorites,
  clearHistory,
  assignWorkoutToFolder,
} from '../store/storage'
import type { WorkoutHistoryEntry } from '../types/workout'

export function useWorkoutHistory() {
  const [history, setHistory] = useState<WorkoutHistoryEntry[]>([])
  const [favorites, setFavorites] = useState<WorkoutHistoryEntry[]>([])
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    const [h, f] = await Promise.all([getWorkoutHistory(), getFavorites()])
    setHistory(h)
    setFavorites(f)
    setLoading(false)
  }, [])

  useEffect(() => { reload() }, [reload])

  const save = useCallback(async (entry: WorkoutHistoryEntry) => {
    await saveWorkout(entry)
    await reload()
  }, [reload])

  const remove = useCallback(async (id: string) => {
    await deleteWorkout(id)
    await reload()
  }, [reload])

  const toggle = useCallback(async (id: string) => {
    await toggleFavorite(id)
    await reload()
  }, [reload])

  const rename = useCallback(async (id: string, name: string) => {
    await renameWorkout(id, name)
    await reload()
  }, [reload])

  const clear = useCallback(async () => {
    await clearHistory()
    await reload()
  }, [reload])

  const assignToFolder = useCallback(async (workoutId: string, folderId: string | null) => {
    await assignWorkoutToFolder(workoutId, folderId)
    await reload()
  }, [reload])

  return { history, favorites, loading, save, remove, toggleFavorite: toggle, renameWorkout: rename, clearHistory: clear, assignToFolder }
}
