import { useState, useEffect } from 'react'
import { defaultAccentId } from '../data/themes'

export function useCurrentTheme() {
  const [themeId, setThemeId] = useState<string>(
    () => localStorage.getItem('komplex-accent') ?? defaultAccentId
  )

  useEffect(() => {
    const sync = () => {
      setThemeId(localStorage.getItem('komplex-accent') ?? defaultAccentId)
    }
    window.addEventListener('komplex-theme-change', sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener('komplex-theme-change', sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  return { themeId }
}
