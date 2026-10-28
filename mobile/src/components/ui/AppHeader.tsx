import Ionicons from '@expo/vector-icons/Ionicons';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, radius, typography } from '@/theme';

type Props = {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  onBack?: () => void;
  right?: ReactNode;
  children?: ReactNode;
};

export function AppHeader({ title, subtitle, eyebrow, onBack, right, children }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.container, { paddingTop: insets.top + 10 }]}>
      <View style={styles.row}>
        {onBack ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Volver"
            hitSlop={8}
            onPress={onBack}
            style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
          >
            <Ionicons name="arrow-back" size={22} color={colors.white} />
          </Pressable>
        ) : null}
        <View style={styles.titles}>
          {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          {subtitle ? (
            <Text style={styles.subtitle} numberOfLines={2}>
              {subtitle}
            </Text>
          ) : null}
        </View>
        {right ? <View style={styles.right}>{right}</View> : null}
      </View>
      {children}
    </View>
  );
}

export function HeaderIconButton({
  icon,
  onPress,
  badge,
  label,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  badge?: number;
  label: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={8}
      onPress={onPress}
      style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
    >
      <Ionicons name={icon} size={21} color={colors.white} />
      {badge ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge > 9 ? '9+' : badge}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.navy,
    paddingHorizontal: 20,
    paddingBottom: 18,
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  titles: {
    flex: 1,
  },
  eyebrow: {
    ...typography.tiny,
    color: colors.orange,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  title: {
    ...typography.h2,
    color: colors.white,
  },
  subtitle: {
    ...typography.small,
    color: '#C9D7EC',
    marginTop: 3,
    fontWeight: '500',
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  pressed: {
    opacity: 0.7,
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 1,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.orange,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: colors.white,
    fontSize: 9,
    fontWeight: '800',
  },
});
