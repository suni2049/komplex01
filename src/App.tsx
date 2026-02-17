import { BrowserRouter, Routes, Route } from 'react-router-dom'
import AppShell from './components/layout/AppShell'
import HomePage from './pages/HomePage'
import ActiveWorkoutPage from './pages/ActiveWorkoutPage'
import HistoryPage from './pages/HistoryPage'
import FavoritesPage from './pages/FavoritesPage'
import SettingsPage from './pages/SettingsPage'
import ExerciseBrowserPage from './pages/ExerciseBrowserPage'
import CoachPage from './pages/CoachPage'
import PlanPage from './pages/PlanPage'
import { useApplyTheme } from './hooks/useTheme'

export default function App() {
  useApplyTheme()

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<HomePage />} />
          <Route path="workout" element={<ActiveWorkoutPage />} />
          <Route path="plan" element={<PlanPage />} />
          <Route path="history" element={<HistoryPage />} />
          <Route path="coach" element={<CoachPage />} />
          <Route path="favorites" element={<FavoritesPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="exercises" element={<ExerciseBrowserPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
