import Ionicons from '@expo/vector-icons/Ionicons';
import type { ReactNode } from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, radius, shadow, typography } from '@/theme';

type CardProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  padded?: boolean;
};

export function Card({ children, style, padded = true }: CardProps) {
  return <View style={[styles.card, padded && styles.padded, style]}>{children}</View>;
}

type StatTileProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  tone?: 'navy' | 'orange' | 'green';
};

export function StatTile({ icon, label, value, tone = 'navy' }: StatTileProps) {
  const palette = {
    navy: { bg: colors.ice, fg: colors.navy },
    orange: { bg: colors.orangeSoft, fg: colors.orangeDark },
    green: { bg: colors.greenSoft, fg: colors.greenDark },
  }[tone];
  return (
    <View style={[styles.stat, { backgroundColor: palette.bg }]}>
      <Ionicons name={icon} size={18} color={palette.fg} />
      <Text style={[styles.statValue, { color: palette.fg }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    ...shadow.card,
  },
  padded: {
    padding: 16,
  },
  stat: {
    flex: 1,
    borderRadius: radius.md,
    paddingVertical: 12,
    paddingHorizontal: 10,
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    ...typography.h3,
    marginTop: 2,
  },
  statLabel: {
    ...typography.tiny,
    color: colors.muted,
    textAlign: 'center',
    fontWeight: '600',
  },
});
