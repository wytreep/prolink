import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, typography } from '@/theme';

type Tone = 'info' | 'warning' | 'error' | 'success' | 'demo';

const TONES: Record<Tone, { bg: string; border: string; fg: string; icon: keyof typeof Ionicons.glyphMap }> = {
  info: { bg: '#E4EEFB', border: '#C9DCF6', fg: colors.blue, icon: 'information-circle-outline' },
  warning: { bg: colors.orangeSoft, border: '#F6D9A8', fg: colors.orangeDark, icon: 'cloud-offline-outline' },
  error: { bg: colors.redSoft, border: '#F2C7C5', fg: colors.redDark, icon: 'alert-circle-outline' },
  success: { bg: colors.greenSoft, border: '#C4E7D2', fg: colors.greenDark, icon: 'checkmark-circle-outline' },
  demo: { bg: colors.ice, border: '#CFDDEF', fg: colors.navy, icon: 'flask-outline' },
};

type Props = {
  tone: Tone;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  loading?: boolean;
};

export function Banner({ tone, title, message, actionLabel, onAction, loading }: Props) {
  const palette = TONES[tone];
  return (
    <View style={[styles.banner, { backgroundColor: palette.bg, borderColor: palette.border }]}>
      <Ionicons name={palette.icon} size={19} color={palette.fg} style={styles.icon} />
      <View style={styles.body}>
        <Text style={[styles.title, { color: palette.fg }]}>{title}</Text>
        {message ? <Text style={[styles.message, { color: palette.fg }]}>{message}</Text> : null}
      </View>
      {actionLabel && onAction ? (
        <Pressable
          accessibilityRole="button"
          onPress={onAction}
          disabled={loading}
          style={({ pressed }) => [
            styles.action,
            { borderColor: palette.fg },
            (pressed || loading) && { opacity: 0.6 },
          ]}
        >
          <Text style={[styles.actionText, { color: palette.fg }]}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: radius.md,
    borderWidth: 1,
    padding: 12,
  },
  icon: {
    marginTop: 1,
  },
  body: {
    flex: 1,
    gap: 2,
  },
  title: {
    ...typography.small,
    fontWeight: '700',
  },
  message: {
    ...typography.tiny,
    fontWeight: '500',
    lineHeight: 15,
    opacity: 0.9,
  },
  action: {
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  actionText: {
    ...typography.tiny,
    fontWeight: '800',
  },
});
