import { useMemo } from 'react'
import type { CSSProperties } from 'react'
import { ShaderGradient, ShaderGradientCanvas } from 'shadergradient'
import { useCurrentTheme } from '../../hooks/useCurrentTheme'

// Vivid interstellar palettes.
// The filled box area glows; text letters become transparent cutouts revealing the dark page bg.
const NEBULA: Record<string, { c1: string; c2: string; c3: string }> = {
  'signal-red':     { c1: '#050000', c2: '#8b0000', c3: '#ff2020' },
  'military-green': { c1: '#000500', c2: '#0a5a00', c3: '#22c55e' },
  'navy-blue':      { c1: '#00000f', c2: '#0a1a6e', c3: '#60a5fa' },
  'star-gold':      { c1: '#050300', c2: '#7a4f00', c3: '#fbbf24' },
  'arctic-white':   { c1: '#050a14', c2: '#1e3a5f', c3: '#7dd3fc' },
}

const FALLBACK = NEBULA['signal-red']

interface Props {
  children: React.ReactNode
  className?: string
}

export default function GradientLogoBox({ children, className = '' }: Props) {
  const { themeId } = useCurrentTheme()
  const pal = useMemo(() => NEBULA[themeId] ?? FALLBACK, [themeId])

  return (
    <div
      className={`relative overflow-hidden inline-block ${className}`}
      style={{ isolation: 'isolate' }}
    >
      {/* Vivid interstellar gradient fills the entire logo box */}
      <ShaderGradientCanvas
        pixelDensity={1.5}
        style={{ position: 'absolute', inset: 0, zIndex: 0 }}
      >
        <ShaderGradient
          type="waterPlane"
          animate="on"
          uSpeed={0.2}
          uStrength={5.5}
          uDensity={1.8}
          uFrequency={5.5}
          uAmplitude={0}
          grain="on"
          grainBlending={0.35}
          brightness={2.2}
          lightType="3d"
          envPreset="city"
          reflection={0.25}
          cDistance={3.5}
          cPolarAngle={80}
          cAzimuthAngle={180}
          cameraZoom={9.1}
          rotationX={0}
          rotationY={0}
          rotationZ={235}
          color1={pal.c1}
          color2={pal.c2}
          color3={pal.c3}
        />
      </ShaderGradientCanvas>

      {/* destination-out: wherever text pixels are opaque, the gradient beneath is erased,
          leaving transparent cutouts that reveal the dark page background — inverted logo effect. */}
      <div style={{ position: 'relative', zIndex: 1, mixBlendMode: 'destination-out' } as unknown as CSSProperties}>
        {children}
      </div>
    </div>
  )
}
