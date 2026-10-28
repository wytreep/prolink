import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';

import { TransactionRow } from '@/components/TransactionRow';
import { AppHeader, HeaderIconButton } from '@/components/ui/AppHeader';
import { Banner } from '@/components/ui/Banner';
import { Chip } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { EmptyState, Screen } from '@/components/ui/Screen';
import { useFinance } from '@/context/FinanceContext';
import {
  dayLabel,
  formatCOP,
  isCurrentMonth,
  monthLabel,
  monthOf,
  shiftMonth,
} from '@/lib/format';
import { colors, radius, typography } from '@/theme';
import type { Transaction } from '@/types';

type Filter = 'Todos' | 'income' | 'expense' | 'pending';

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'Todos', label: 'Todos' },
  { key: 'income', label: 'Ingresos' },
  { key: 'expense', label: 'Gastos' },
  { key: 'pending', label: 'Pendientes' },
];

export default function MovementsScreen() {
  const {
    month,
    setMonth,
    transactions,
    isRefreshing,
    isSyncing,
    isOffline,
    pendingCount,
    lastError,
    refresh,
    syncPending,
  } = useFinance();
  const [filter, setFilter] = useState<Filter>('Todos');

  const monthTransactions = useMemo(
    () =>
      transactions
        .filter((transaction) => monthOf(transaction.date) === month)
        .sort((a, b) => b.date.localeCompare(a.date)),
    [transactions, month],
  );

  const filtered = useMemo(
    () =>
      monthTransactions.filter((transaction) => {
        if (filter === 'income') return transaction.type === 'income';
        if (filter === 'expense') return transaction.type === 'expense';
        if (filter === 'pending') return transaction.pending;
        return true;
      }),
    [monthTransactions, filter],
  );

  const grouped = useMemo(() => {
    const map = new Map<string, Transaction[]>();
    for (const transaction of filtered) {
      const key = transaction.date.slice(0, 10);
      map.set(key, [...(map.get(key) ?? []), transaction]);
    }
    return Array.from(map.entries()).sort((a, b) => b[0].localeCompare(a[0]));
  }, [filtered]);

  const income = monthTransactions
    .filter((transaction) => transaction.type === 'income')
    .reduce((sum, transaction) => sum + transaction.amountCop, 0);
  const expenses = monthTransactions
    .filter((transaction) => transaction.type === 'expense')
    .reduce((sum, transaction) => sum + transaction.amountCop, 0);

  return (
    <View style={styles.screen}>
      <AppHeader
        eyebrow="Historial"
        title="Movimientos"
        subtitle={monthLabel(month)}
        onBack={() => router.back()}
        right={
          isRefreshing ? (
            <View style={styles.loadingIcon}>
              <ActivityIndicator color={colors.white} size="small" />
            </View>
          ) : (
            <HeaderIconButton
              icon="refresh-outline"
              label="Actualizar movimientos"
              onPress={() => void refresh()}
            />
          )
        }
      />
      <Screen
        contentStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => void refresh()}
            tintColor={colors.navy}
            colors={[colors.navy]}
          />
        }
      >
        <View style={styles.monthRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Mes anterior"
            onPress={() => setMonth(shiftMonth(month, -1))}
            style={styles.monthButton}
          >
            <Ionicons name="chevron-back" size={18} color={colors.navy} />
          </Pressable>
          <Text style={styles.monthText}>{monthLabel(month)}</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Mes siguiente"
            disabled={isCurrentMonth(month)}
            onPress={() => setMonth(shiftMonth(month, 1))}
            style={[styles.monthButton, isCurrentMonth(month) && { opacity: 0.3 }]}
          >
            <Ionicons name="chevron-forward" size={18} color={colors.navy} />
          </Pressable>
        </View>

        {isOffline ? (
          <Banner
            tone="warning"
            title="Sin conexión"
            message={
              pendingCount > 0
                ? `${pendingCount} movimiento(s) pendiente(s).`
                : 'Estás viendo los datos guardados en tu dispositivo.'
            }
          />
        ) : pendingCount > 0 ? (
          <Banner
            tone="warning"
            title={`${pendingCount} movimiento(s) pendientes`}
            actionLabel={isSyncing ? 'Sincronizando…' : 'Sincronizar'}
            onAction={() => void syncPending()}
            loading={isSyncing}
          />
        ) : null}

        {lastError ? (
          <Banner
            tone="error"
            title="Error de conexión"
            message={lastError}
            actionLabel="Reintentar"
            onAction={() => void refresh()}
          />
        ) : null}

        <View style={styles.summary}>
          <SummaryItem label="Ingresos" value={formatCOP(income)} color={colors.greenDark} />
          <View style={styles.summaryDivider} />
          <SummaryItem label="Gastos" value={formatCOP(expenses)} color={colors.orangeDark} />
          <View style={styles.summaryDivider} />
          <SummaryItem
            label="Balance"
            value={formatCOP(income - expenses)}
            color={income - expenses >= 0 ? colors.navy : colors.redDark}
          />
        </View>

        <View style={styles.filters}>
          {FILTERS.map((item) => (
            <Chip
              key={item.key}
              label={item.label}
              selected={filter === item.key}
              onPress={() => setFilter(item.key)}
            />
          ))}
        </View>

        {grouped.length ? (
          grouped.map(([day, items]) => (
            <View key={day} style={styles.group}>
              <Text style={styles.day}>{dayLabel(items[0].date)}</Text>
              <Card padded={false} style={styles.groupCard}>
                {items.map((transaction, index) => (
                  <View
                    key={transaction.clientId}
                    style={[styles.row, index < items.length - 1 && styles.rowBorder]}
                  >
                    <TransactionRow transaction={transaction} />
                  </View>
                ))}
              </Card>
            </View>
          ))
        ) : (
          <EmptyState
            icon="receipt-outline"
            title="Sin movimientos"
            message={
              filter === 'Todos'
                ? 'Registra un ingreso o gasto para empezar a construir tu historial.'
                : 'No hay movimientos que coincidan con este filtro.'
            }
            actionLabel="Registrar movimiento"
            onAction={() => router.push('/finanzas/nuevo')}
          />
        )}
      </Screen>
    </View>
  );
}

function SummaryItem({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={styles.summaryItem}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={[styles.summaryValue, { color }]} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    gap: 14,
  },
  loadingIcon: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  monthButton: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  monthText: {
    ...typography.bodyStrong,
    color: colors.text,
    fontWeight: '800',
    minWidth: 150,
    textAlign: 'center',
  },
  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radius.md,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 6,
  },
  summaryLabel: {
    ...typography.tiny,
    color: colors.muted,
    fontWeight: '600',
  },
  summaryValue: {
    ...typography.small,
    fontWeight: '800',
  },
  summaryDivider: {
    width: 1,
    height: 30,
    backgroundColor: colors.border,
  },
  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  group: {
    gap: 6,
  },
  day: {
    ...typography.small,
    color: colors.muted,
    fontWeight: '700',
    marginLeft: 4,
  },
  groupCard: {
    overflow: 'hidden',
  },
  row: {
    paddingHorizontal: 16,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
});
