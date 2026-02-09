import { Outlet, useLocation } from 'react-router-dom'
import BottomNav from './BottomNav'

export default function AppShell() {
  const location = useLocation()
  const isWorkout = location.pathname === '/workout'

  return (
    <div className="min-h-full flex flex-col pt-[env(safe-area-inset-top)]">
      <main className={`flex-1 max-w-lg mx-auto w-full ${isWorkout ? '' : 'pb-24'}`}>
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
