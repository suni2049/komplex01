import { useEffect } from 'react'
import { accentThemes } from '../data/themes'

export function applyThemeColors(themeId: string) {
  const theme = accentThemes.find(t => t.id === themeId)
  if (!theme) return
  const root = document.documentElement
  Object.entries(theme.colors).forEach(([shade, value]) => {
    root.style.setProperty(`--color-primary-${shade}`, value)
  })
  localStorage.setItem('komplex-accent', themeId)
}

export function useApplyTheme() {
  useEffect(() => {
    const cached = localStorage.getItem('komplex-accent')
    if (cached) applyThemeColors(cached)
  }, [])
}
