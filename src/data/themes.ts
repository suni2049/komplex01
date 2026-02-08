export interface AccentTheme {
  id: string
  name: string
  label: string
  preview: string
  colors: Record<string, string>
}

export const accentThemes: AccentTheme[] = [
  {
    id: 'signal-red',
    name: 'Signal Red',
    label: 'STANDARD ISSUE',
    preview: '#DC2626',
    colors: {
      '50': '#1A0808', '100': '#2D0E0E', '200': '#4A1515',
      '300': '#7A1E1E', '400': '#A52020', '500': '#C41E1E',
      '600': '#DC2626', '700': '#EF4444', '800': '#F87171', '900': '#FCA5A5',
    },
  },
  {
    id: 'military-green',
    name: 'Military Green',
    label: 'FIELD OPS',
    preview: '#22C55E',
    colors: {
      '50': '#071A0D', '100': '#0D2B16', '200': '#14532D',
      '300': '#166534', '400': '#15803D', '500': '#16A34A',
      '600': '#22C55E', '700': '#4ADE80', '800': '#86EFAC', '900': '#BBF7D0',
    },
  },
  {
    id: 'navy-blue',
    name: 'Navy Blue',
    label: 'NAVAL OPS',
    preview: '#3B82F6',
    colors: {
      '50': '#0A1228', '100': '#0F1D40', '200': '#1E3A5F',
      '300': '#1D4ED8', '400': '#2563EB', '500': '#3B82F6',
      '600': '#60A5FA', '700': '#93C5FD', '800': '#BFDBFE', '900': '#DBEAFE',
    },
  },
  {
    id: 'star-gold',
    name: 'Star Gold',
    label: 'COMMENDATION',
    preview: '#EAB308',
    colors: {
      '50': '#1A1508', '100': '#2D250E', '200': '#4A3D15',
      '300': '#854D0E', '400': '#A16207', '500': '#CA8A04',
      '600': '#EAB308', '700': '#FACC15', '800': '#FDE047', '900': '#FEF08A',
    },
  },
  {
    id: 'arctic-white',
    name: 'Arctic White',
    label: 'WINTER CAMO',
    preview: '#94A3B8',
    colors: {
      '50': '#0F172A', '100': '#1E293B', '200': '#334155',
      '300': '#475569', '400': '#64748B', '500': '#94A3B8',
      '600': '#CBD5E1', '700': '#E2E8F0', '800': '#F1F5F9', '900': '#F8FAFC',
    },
  },
]

export const defaultAccentId = 'signal-red'
