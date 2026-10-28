import Ionicons from '@expo/vector-icons/Ionicons';
import { ActivityIndicator, Pressable, StyleSheet, Text, View, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';

import { colors, radius, shadow } from '@/theme';

type Variant = 'primary' | 'secondary' | 'dark' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

type Props = {
  title: string;
  onPress?: () => void;
  variant?: Variant;
  size?: Size;
  icon?: keyof typeof Ionicons.glyphMap;
  iconRight?: keyof typeof Ionicons.glyphMap;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
};

const HEIGHT: Record<Size, number> = { sm: 40, md: 48, lg: 54 };
const FONT: Record<Size, number> = { sm: 13, md: 14, lg: 16 };

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  iconRight,
  loading,
  disabled,
  fullWidth,
  style,
  textStyle,
}: Props) {
  const palette = VARIANTS[variant];
  const isDisabled = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!isDisabled, busy: !!loading }}
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        {
          minHeight: HEIGHT[size],
          backgroundColor: palette.background,
          borderColor: palette.border,
          borderWidth: palette.border === 'transparent' ? 0 : 1,
          opacity: isDisabled ? 0.55 : pressed ? 0.86 : 1,
        },
        fullWidth && styles.fullWidth,
        variant === 'primary' && shadow.soft,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={palette.text} size="small" />
      ) : (
        <View style={styles.content}>
          {icon ? <Ionicons name={icon} size={FONT[size] + 3} color={palette.text} /> : null}
          <Text style={[styles.label, { color: palette.text, fontSize: FONT[size] }, textStyle]}>
            {title}
          </Text>
          {iconRight ? (
            <Ionicons name={iconRight} size={FONT[size] + 3} color={palette.text} />
          ) : null}
        </View>
      )}
    </Pressable>
  );
}

const VARIANTS: Record<
  Variant,
  { background: string; text: string; border: string }
> = {
  primary: { background: colors.orange, text: colors.white, border: 'transparent' },
  secondary: { background: colors.white, text: colors.navy, border: colors.navy },
  dark: { background: colors.navy, text: colors.white, border: 'transparent' },
  ghost: { background: 'transparent', text: colors.navy, border: 'transparent' },
  danger: { background: colors.redSoft, text: colors.redDark, border: colors.redSoft },
};

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    paddingHorizontal: 18,
  },
  fullWidth: {
    width: '100%',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  label: {
    fontWeight: '700',
    letterSpacing: 0.1,
  },
});
