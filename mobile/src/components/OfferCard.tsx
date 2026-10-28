import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Badge } from '@/components/ui/Badge';
import { formatCOP } from '@/lib/format';
import { colors, radius, shadow, typography } from '@/theme';
import type { Offer } from '@/types';

type Props = {
  offer: Offer;
  matchPct: number;
  saved: boolean;
  onPress: () => void;
  onToggleSave: () => void;
  compact?: boolean;
};

export function OfferCard({ offer, matchPct, saved, onPress, onToggleSave, compact }: Props) {
  const matchTone = matchPct >= 75 ? 'green' : matchPct >= 55 ? 'yellow' : 'gray';
  return (
    <View style={styles.wrapper}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${offer.title} en ${offer.company}`}
        onPress={onPress}
        style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      >
        <View style={styles.topRow}>
          <View style={[styles.logo, { backgroundColor: offer.logoColor }]}>
            <Text style={styles.logoText}>{offer.initials}</Text>
          </View>
          <View style={styles.companyBlock}>
            <Text style={styles.company} numberOfLines={1}>
              {offer.company}
            </Text>
            <Text style={styles.sector} numberOfLines={1}>
              {offer.sector}
            </Text>
          </View>
          <View style={styles.savePlaceholder} />
        </View>

        <Text style={styles.title} numberOfLines={2}>
          {offer.title}
        </Text>

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Ionicons name="location-outline" size={13} color={colors.muted} />
            <Text style={styles.metaText} numberOfLines={1}>
              {offer.location}
            </Text>
          </View>
          <View style={styles.metaDot} />
          <Text style={styles.metaText}>{offer.duration}</Text>
        </View>

        {!compact ? (
          <Text style={styles.description} numberOfLines={2}>
            {offer.description}
          </Text>
        ) : null}

        <View style={styles.bottomRow}>
          <View style={styles.badges}>
            <Badge label={`${matchPct}% match`} tone={matchTone} icon="sparkles-outline" />
            <Badge label={offer.modality} tone="navy" />
          </View>
          <View style={styles.salaryBlock}>
            <Text style={styles.salaryLabel}>Auxilio</Text>
            <Text style={styles.salary}>{formatCOP(offer.salaryCop)}</Text>
          </View>
        </View>
      </Pressable>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={saved ? 'Quitar de guardadas' : 'Guardar oferta'}
        hitSlop={8}
        onPress={onToggleSave}
        style={({ pressed }) => [styles.saveButton, pressed && styles.pressed]}
      >
        <Ionicons
          name={saved ? 'bookmark' : 'bookmark-outline'}
          size={19}
          color={saved ? colors.orangeDark : colors.muted}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    borderRadius: radius.lg,
  },
  pressed: {
    opacity: 0.88,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: 16,
    gap: 10,
    ...shadow.card,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logo: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    color: colors.white,
    fontWeight: '800',
    fontSize: 14,
    letterSpacing: 0.3,
  },
  companyBlock: {
    flex: 1,
    gap: 1,
  },
  company: {
    ...typography.bodyStrong,
    color: colors.text,
  },
  sector: {
    ...typography.tiny,
    color: colors.muted,
    fontWeight: '500',
  },
  savePlaceholder: {
    width: 34,
    height: 34,
  },
  saveButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 34,
    height: 34,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.ice2,
  },
  title: {
    ...typography.h3,
    color: colors.text,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    flexShrink: 1,
  },
  metaText: {
    ...typography.tiny,
    color: colors.muted,
    fontWeight: '600',
  },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.mutedLight,
  },
  description: {
    ...typography.small,
    color: colors.muted,
    lineHeight: 18,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 2,
  },
  badges: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
    flex: 1,
  },
  salaryBlock: {
    alignItems: 'flex-end',
  },
  salaryLabel: {
    ...typography.tiny,
    color: colors.muted,
    fontWeight: '600',
  },
  salary: {
    ...typography.bodyStrong,
    color: colors.navy,
    fontWeight: '800',
  },
});
