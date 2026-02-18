import { useMemo } from 'react'
import { ShaderGradient, ShaderGradientCanvas } from 'shadergradient'
import { useCurrentTheme } from '../../hooks/useCurrentTheme'

// Interstellar nebula palette per accent theme.
// color1 = deep void, color2 = nebula core, color3 = nebula edge.
const NEBULA: Record<string, { c1: string; c2: string; c3: string }> = {
  'signal-red':      { c1: '#000000', c2: '#2d0000', c3: '#4a0a0a' },
  'military-green':  { c1: '#000000', c2: '#071a0d', c3: '#0f2d18' },
  'navy-blue':       { c1: '#000000', c2: '#050d1f', c3: '#0a1a3d' },
  'star-gold':       { c1: '#000000', c2: '#1a1000', c3: '#2d1e00' },
  'arctic-white':    { c1: '#050a14', c2: '#0f172a', c3: '#1e2d40' },
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
      {/* Interstellar shader gradient — fills the logo box only */}
      <ShaderGradientCanvas
        pixelDensity={1.5}
        style={{ position: 'absolute', inset: 0, zIndex: 0 }}
      >
        <ShaderGradient
          type="waterPlane"
          animate="on"
          uSpeed={0.15}
          uStrength={4.5}
          uDensity={1.5}
          uFrequency={5.5}
          uAmplitude={0}
          grain="on"
          grainBlending={0.7}
          brightness={1.3}
          lightType="3d"
          envPreset="city"
          reflection={0.15}
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

      {/* Content above the gradient */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {children}
      </div>
    </div>
  )
}
