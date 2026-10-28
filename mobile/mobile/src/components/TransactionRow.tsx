import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Text, View } from 'react-native';

import { Badge } from '@/components/ui/Badge';
import { formatCOP } from '@/lib/format';
import { bucketMeta, colors, typography } from '@/theme';
import type { Transaction } from '@/types';

export function TransactionRow({ transaction }: { transaction: Transaction }) {
  const isIncome = transaction.type === 'income';
  const meta = !isIncome && transaction.bucket ? bucketMeta[transaction.bucket] : null;
  const icon = isIncome ? 'arrow-down' : (meta?.icon ?? 'card-outline');
  const color = isIncome ? colors.green : (meta?.color ?? colors.navy);
  const soft = isIncome ? colors.greenSoft : (meta?.soft ?? colors.ice);
  const label = isIncome ? 'Ingreso' : (meta?.label ?? 'Gasto');

  return (
    <View style={styles.row}>
      <View style={[styles.icon, { backgroundColor: soft }]}>
        <Ionicons name={icon} size={18} color={color} />
      </View>
      <View style={styles.body}>
        <Text style={styles.description} numberOfLines={1}>
          {transaction.description}
        </Text>
        <View style={styles.metaRow}>
          <Text style={styles.meta}>{label}</Text>
          {transaction.pending ? <Badge label="Pendiente" tone="orange" /> : null}
        </View>
      </View>
      <Text style={[styles.amount, { color: isIncome ? colors.greenDark : colors.text }]}>
        {isIncome ? '+' : '-'} {formatCOP(transaction.amountCop)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 11,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
    gap: 2,
  },
  description: {
    ...typography.bodyStrong,
    color: colors.text,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  meta: {
    ...typography.tiny,
    color: colors.muted,
    fontWeight: '600',
  },
  amount: {
    ...typography.bodyStrong,
    fontWeight: '800',
  },
});
