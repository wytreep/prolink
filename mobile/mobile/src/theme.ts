/**
 * Design tokens de ProLink.
 * Paleta basada en los mockups del Taller 1: azul institucional, naranja de
 * accion y verde de progreso sobre fondos azul hielo.
 */
export const colors = {
  navy: '#1B3A6B',
  navyDeep: '#122A4F',
  navySoft: '#2C5288',
  blue: '#3B6FB6',
  ice: '#E8EFF9',
  ice2: '#F3F7FD',
  orange: '#F4A340',
  orangeDark: '#DD8A22',
  orangeSoft: '#FDF0DC',
  green: '#2E9E5B',
  greenDark: '#237C47',
  greenSoft: '#E3F4EA',
  red: '#D9534F',
  redDark: '#B73E3A',
  redSoft: '#FBE7E6',
  yellow: '#C98A12',
  yellowSoft: '#FEF5DC',
  text: '#1B2A41',
  muted: '#6B7A90',
  mutedLight: '#95A3B7',
  border: '#DCE5F0',
  white: '#FFFFFF',
  bg: '#F6F8FC',
  black: '#0B1524',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  xxxl: 36,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 22,
  pill: 999,
} as const;

export const shadow = {
  card: {
    shadowColor: '#1B3A6B',
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 5 },
    elevation: 3,
  },
  soft: {
    shadowColor: '#1B3A6B',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  floating: {
    shadowColor: '#122A4F',
    shadowOpacity: 0.22,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
} as const;

export const typography = {
  h1: { fontSize: 28, fontWeight: '800' as const, letterSpacing: -0.4 },
  h2: { fontSize: 22, fontWeight: '800' as const, letterSpacing: -0.2 },
  h3: { fontSize: 18, fontWeight: '700' as const },
  title: { fontSize: 16, fontWeight: '700' as const },
  body: { fontSize: 14, fontWeight: '400' as const },
  bodyStrong: { fontSize: 14, fontWeight: '600' as const },
  small: { fontSize: 12, fontWeight: '500' as const },
  tiny: { fontSize: 11, fontWeight: '600' as const },
} as const;

export const bucketMeta = {
  needs: {
    label: 'Necesidades',
    shortLabel: 'Necesidades',
    rule: 50,
    color: colors.navy,
    soft: colors.ice,
    icon: 'home-outline' as const,
    description: 'Arriendo, transporte, mercado y servicios.',
  },
  wants: {
    label: 'Deseos',
    shortLabel: 'Deseos',
    rule: 30,
    color: colors.orange,
    soft: colors.orangeSoft,
    icon: 'cafe-outline' as const,
    description: 'Salidas, suscripciones y gustos personales.',
  },
  savings: {
    label: 'Ahorro',
    shortLabel: 'Ahorro',
    rule: 20,
    color: colors.green,
    soft: colors.greenSoft,
    icon: 'wallet-outline' as const,
    description: 'Metas, imprevistos y fondo de emergencia.',
  },
} as const;
