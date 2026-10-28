import Ionicons from '@expo/vector-icons/Ionicons';
import type { ReactElement, ReactNode } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  type RefreshControlProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, radius, typography } from '@/theme';

type ScreenProps = {
  children: ReactNode;
  scroll?: boolean;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  refreshControl?: ReactElement<RefreshControlProps>;
  bottomInset?: number;
};

export function Screen({
  children,
  scroll = true,
  style,
  contentStyle,
  refreshControl,
  bottomInset = 110,
}: ScreenProps) {
  const insets = useSafeAreaInsets();
  if (!scroll) {
    return <View style={[styles.screen, style]}>{children}</View>;
  }
  return (
    <View style={[styles.screen, style]}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + bottomInset },
          contentStyle,
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={refreshControl}
      >
        {children}
      </ScrollView>
    </View>
  );
}

export function SectionHeader({
  title,
  actionLabel,
  onAction,
  style,
}: {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.sectionHeader, style]}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {actionLabel && onAction ? (
        <Text accessibilityRole="button" onPress={onAction} style={styles.sectionAction}>
          {actionLabel}
        </Text>
      ) : null}
    </View>
  );
}

export function EmptyState({
  icon,
  title,
  message,
  actionLabel,
  onAction,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <View style={styles.empty}>
      <View style={styles.emptyIcon}>
        <Ionicons name={icon} size={30} color={colors.navy} />
      </View>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyMessage}>{message}</Text>
      {actionLabel && onAction ? (
        <Text accessibilityRole="button" onPress={onAction} style={styles.emptyAction}>
          {actionLabel}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    padding: 20,
    gap: 18,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: -6,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
  },
  sectionAction: {
    ...typography.small,
    color: colors.blue,
    fontWeight: '700',
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 36,
    paddingHorizontal: 20,
    gap: 8,
  },
  emptyIcon: {
    width: 62,
    height: 62,
    borderRadius: radius.pill,
    backgroundColor: colors.ice,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyTitle: {
    ...typography.title,
    color: colors.text,
    textAlign: 'center',
  },
  emptyMessage: {
    ...typography.body,
    color: colors.muted,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 300,
  },
  emptyAction: {
    ...typography.bodyStrong,
    color: colors.orangeDark,
    marginTop: 6,
  },
});
