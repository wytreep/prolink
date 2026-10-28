import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, radius, typography } from '@/theme';

export type BadgeTone = 'navy' | 'blue' | 'green' | 'orange' | 'red' | 'yellow' | 'gray';

const TONES: Record<BadgeTone, { bg: string; fg: string }> = {
  navy: { bg: colors.ice, fg: colors.navy },
  blue: { bg: '#E4EEFB', fg: colors.blue },
  green: { bg: colors.greenSoft, fg: colors.greenDark },
  orange: { bg: colors.orangeSoft, fg: colors.orangeDark },
  red: { bg: colors.redSoft, fg: colors.redDark },
  yellow: { bg: colors.yellowSoft, fg: colors.yellow },
  gray: { bg: colors.ice2, fg: colors.muted },
};

type BadgeProps = {
  label: string;
  tone?: BadgeTone;
  icon?: keyof typeof Ionicons.glyphMap;
  style?: StyleProp<ViewStyle>;
};

export function Badge({ label, tone = 'navy', icon, style }: BadgeProps) {
  const palette = TONES[tone];
  return (
    <View style={[styles.badge, { backgroundColor: palette.bg }, style]}>
      {icon ? <Ionicons name={icon} size={12} color={palette.fg} /> : null}
      <Text style={[styles.badgeText, { color: palette.fg }]}>{label}</Text>
    </View>
  );
}

type ChipProps = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
};

export function Chip({ label, selected, onPress, icon }: ChipProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        selected ? styles.chipSelected : styles.chipIdle,
        pressed && styles.chipPressed,
      ]}
    >
      {icon ? (
        <Ionicons name={icon} size={14} color={selected ? colors.white : colors.navy} />
      ) : null}
      <Text style={[styles.chipText, selected ? styles.chipTextSelected : styles.chipTextIdle]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: radius.pill,
    paddingHorizontal: 9,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  badgeText: {
    ...typography.tiny,
    fontWeight: '700',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderWidth: 1,
  },
  chipIdle: {
    backgroundColor: colors.white,
    borderColor: colors.border,
  },
  chipSelected: {
    backgroundColor: colors.navy,
    borderColor: colors.navy,
  },
  chipPressed: {
    opacity: 0.8,
  },
  chipText: {
    ...typography.small,
    fontWeight: '700',
  },
  chipTextIdle: {
    color: colors.navy,
  },
  chipTextSelected: {
    color: colors.white,
  },
});
