import { useLocation } from 'react-router-dom'

export default function FooterWatermark() {
  const location = useLocation()
  if (location.pathname === '/workout') return null

  return (
    <div className="fixed bottom-[calc(3.25rem+env(safe-area-inset-bottom))] left-0 right-0 z-40 pointer-events-none">
      <div className="max-w-lg mx-auto flex items-center justify-center gap-2 py-1.5 pointer-events-auto">
        <a
          href="https://half-tone.co.uk"
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-[9px] tracking-widest uppercase text-text-ghost hover:text-text-muted transition-colors"
        >
          half-tone.co.uk
        </a>
        <span className="text-text-ghost">|</span>
        <a
          href="mailto:info@half-tone.co.uk"
          className="text-text-ghost hover:text-text-muted transition-colors"
          aria-label="Email info@half-tone.co.uk"
        >
          <svg
            className="w-3 h-3"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            viewBox="0 0 24 24"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
          </svg>
        </a>
      </div>
    </div>
  )
}
