import { useState, useEffect, useCallback } from 'react'
import {
  getFolders,
  createFolder as createFolderInDB,
  updateFolder as updateFolderInDB,
  deleteFolder as deleteFolderFromDB,
} from '../store/storage'
import type { WorkoutFolder } from '../types/workout'

export function useFolders() {
  const [folders, setFolders] = useState<WorkoutFolder[]>([])
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    const f = await getFolders()
    setFolders(f)
    setLoading(false)
  }, [])

  useEffect(() => { reload() }, [reload])

  const createFolder = useCallback(async (name: string, color: string): Promise<WorkoutFolder> => {
    const folder = await createFolderInDB(name, color)
    await reload()
    return folder
  }, [reload])

  const updateFolder = useCallback(async (id: string, changes: Partial<Pick<WorkoutFolder, 'name' | 'color' | 'order'>>) => {
    await updateFolderInDB(id, changes)
    await reload()
  }, [reload])

  const deleteFolder = useCallback(async (id: string) => {
    await deleteFolderFromDB(id)
    await reload()
  }, [reload])

  return { folders, loading, createFolder, updateFolder, deleteFolder, reload }
}
