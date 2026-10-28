import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Text, View } from 'react-native';

import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { formatCOP } from '@/lib/format';
import { bucketMeta, colors, radius, typography } from '@/theme';
import type { BucketSummary } from '@/types';

const STATUS_LABEL = {
  ok: 'En orden',
  warning: 'Cerca del límite',
  exceeded: 'Excedido',
} as const;

const STATUS_TONE = {
  ok: 'green',
  warning: 'yellow',
  exceeded: 'red',
} as const;

export function BucketRow({ summary }: { summary: BucketSummary }) {
  const meta = bucketMeta[summary.bucket];
  const displayPct = Math.min(100, summary.usedPct);
  return (
    <View style={styles.row}>
      <View style={styles.rowTop}>
        <View style={styles.labelBlock}>
          <View style={[styles.dot, { backgroundColor: meta.color }]} />
          <Text style={styles.label}>{meta.label}</Text>
          <Text style={styles.rule}>{meta.rule}%</Text>
        </View>
        <Text style={styles.amount}>
          {formatCOP(summary.spentCop)}
          <Text style={styles.target}> / {formatCOP(summary.targetCop)}</Text>
        </Text>
      </View>
      <ProgressBar value={displayPct} color={meta.color} height={9} />
      <View style={styles.rowBottom}>
        <Text style={[styles.status, { color: meta.color }]}>
          {summary.usedPct.toFixed(1).replace('.0', '')}% usado
        </Text>
        <Badge label={STATUS_LABEL[summary.status]} tone={STATUS_TONE[summary.status]} />
      </View>
    </View>
  );
}

export function BucketDetailCard({ summary }: { summary: BucketSummary }) {
  const meta = bucketMeta[summary.bucket];
  return (
    <View style={styles.detailCard}>
      <View style={styles.detailTop}>
        <View style={[styles.detailIcon, { backgroundColor: meta.soft }]}>
          <Ionicons name={meta.icon} size={21} color={meta.color} />
        </View>
        <View style={styles.detailTitleBlock}>
          <Text style={styles.detailTitle}>{meta.label}</Text>
          <Text style={styles.detailRule}>Regla {meta.rule}% del ingreso</Text>
        </View>
        <Badge label={STATUS_LABEL[summary.status]} tone={STATUS_TONE[summary.status]} />
      </View>
      <Text style={styles.detailDescription}>{meta.description}</Text>
      <ProgressBar value={Math.min(100, summary.usedPct)} color={meta.color} height={11} />
      <View style={styles.detailAmounts}>
        <View>
          <Text style={styles.detailLabel}>Meta</Text>
          <Text style={styles.detailValue}>{formatCOP(summary.targetCop)}</Text>
        </View>
        <View>
          <Text style={styles.detailLabel}>Gastado</Text>
          <Text style={[styles.detailValue, { color: meta.color }]}>
            {formatCOP(summary.spentCop)}
          </Text>
        </View>
        <View>
          <Text style={styles.detailLabel}>
            {summary.remainingCop >= 0 ? 'Disponible' : 'Excedido'}
          </Text>
          <Text
            style={[
              styles.detailValue,
              { color: summary.remainingCop >= 0 ? colors.text : colors.redDark },
            ]}
          >
            {formatCOP(Math.abs(summary.remainingCop))}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: 7,
  },
  rowTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  labelBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 1,
  },
  dot: {
    width: 9,
    height: 9,
    borderRadius: 3,
  },
  label: {
    ...typography.bodyStrong,
    color: colors.text,
  },
  rule: {
    ...typography.tiny,
    color: colors.muted,
    fontWeight: '600',
  },
  amount: {
    ...typography.small,
    color: colors.text,
    fontWeight: '700',
  },
  target: {
    color: colors.muted,
    fontWeight: '500',
  },
  rowBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  status: {
    ...typography.tiny,
    fontWeight: '700',
  },
  detailCard: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  detailTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  detailIcon: {
    width: 44,
    height: 44,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailTitleBlock: {
    flex: 1,
    gap: 1,
  },
  detailTitle: {
    ...typography.title,
    color: colors.text,
  },
  detailRule: {
    ...typography.tiny,
    color: colors.muted,
    fontWeight: '500',
  },
  detailDescription: {
    ...typography.small,
    color: colors.muted,
    lineHeight: 18,
  },
  detailAmounts: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  detailLabel: {
    ...typography.tiny,
    color: colors.muted,
    fontWeight: '600',
    marginBottom: 2,
  },
  detailValue: {
    ...typography.bodyStrong,
    color: colors.text,
    fontWeight: '800',
  },
});
