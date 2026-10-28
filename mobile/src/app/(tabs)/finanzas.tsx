import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { ActivityIndicator, Alert, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BucketRow } from '@/components/BucketCard';
import { TransactionRow } from '@/components/TransactionRow';
import { AppHeader, HeaderIconButton } from '@/components/ui/AppHeader';
import { Banner } from '@/components/ui/Banner';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { EmptyState, Screen, SectionHeader } from '@/components/ui/Screen';
import { useAuth } from '@/context/AuthContext';
import { useFinance } from '@/context/FinanceContext';
import {
  formatCOP,
  isCurrentMonth,
  monthLabel,
  monthOf,
  shiftMonth,
} from '@/lib/format';
import { colors, radius, shadow, typography } from '@/theme';

export default function FinanceScreen() {
  const insets = useSafeAreaInsets();
  const { isDemo } = useAuth();
  const {
    summary,
    month,
    setMonth,
    transactions,
    goals,
    isLoaded,
    isRefreshing,
    isSyncing,
    isOffline,
    pendingCount,
    lastError,
    refresh,
    syncPending,
    loadSampleData,
    setLastError,
  } = useFinance();

  const monthTransactions = transactions
    .filter((transaction) => monthOf(transaction.date) === month)
    .sort((a, b) => b.date.localeCompare(a.date));
  const recent = monthTransactions.slice(0, 5);

  const handleSample = () => {
    Alert.alert(
      'Cargar datos de ejemplo',
      'Se agregarán ingresos y gastos de ejemplo a este mes para que puedas probar la regla 50/30/20.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cargar',
          onPress: () => {
            void loadSampleData();
          },
        },
      ],
    );
  };

  return (
    <View style={styles.screen}>
      <AppHeader
        eyebrow="Finanzas personales"
        title="Mi presupuesto"
        right={
          isRefreshing ? (
            <View style={styles.loadingIcon}>
              <ActivityIndicator color={colors.white} size="small" />
            </View>
          ) : (
            <HeaderIconButton
              icon="refresh-outline"
              label="Actualizar finanzas"
              onPress={() => void refresh()}
            />
          )
        }
      >
        <View style={styles.monthSelector}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Mes anterior"
            onPress={() => setMonth(shiftMonth(month, -1))}
            style={({ pressed }) => [styles.monthButton, pressed && { opacity: 0.7 }]}
          >
            <Ionicons name="chevron-back" size={18} color={colors.white} />
          </Pressable>
          <View style={styles.monthCenter}>
            <Text style={styles.monthLabel}>{monthLabel(month)}</Text>
            <Text style={styles.monthHint}>
              {isCurrentMonth(month) ? 'Mes actual' : 'Consulta histórica'}
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Mes siguiente"
            disabled={isCurrentMonth(month)}
            onPress={() => setMonth(shiftMonth(month, 1))}
            style={({ pressed }) => [
              styles.monthButton,
              isCurrentMonth(month) && { opacity: 0.3 },
              pressed && { opacity: 0.7 },
            ]}
          >
            <Ionicons name="chevron-forward" size={18} color={colors.white} />
          </Pressable>
        </View>
      </AppHeader>

      <Screen
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => void refresh()}
            tintColor={colors.navy}
            colors={[colors.navy]}
          />
        }
      >
        {!isLoaded ? (
          <View style={styles.loading}>
            <ActivityIndicator color={colors.navy} />
            <Text style={styles.loadingText}>Cargando tus finanzas…</Text>
          </View>
        ) : (
          <>
            {isDemo ? (
              <Banner
                tone="demo"
                title="Modo demo"
                message="Los movimientos se guardan solo en este dispositivo. Inicia sesión para sincronizarlos con la API."
              />
            ) : isOffline ? (
              <Banner
                tone="warning"
                title="Sin conexión"
                message={
                  pendingCount > 0
                    ? `${pendingCount} movimiento(s) pendiente(s). Se sincronizarán al recuperar la conexión.`
                    : 'Estás viendo los datos guardados en tu dispositivo.'
                }
              />
            ) : pendingCount > 0 ? (
              <Banner
                tone="warning"
                title={`${pendingCount} movimiento(s) sin sincronizar`}
                message="Envíalos a la nube para respaldarlos."
                actionLabel={isSyncing ? 'Sincronizando…' : 'Sincronizar ahora'}
                onAction={() => void syncPending()}
                loading={isSyncing}
              />
            ) : null}

            {lastError ? (
              <Banner
                tone="error"
                title="No pudimos conectar con la API"
                message={lastError}
                actionLabel="Reintentar"
                onAction={() => void refresh()}
              />
            ) : null}

            {summary.incomeCop > 0 ? (
              <Card style={styles.incomeCard}>
                <View style={styles.incomeTop}>
                  <View>
                    <Text style={styles.incomeLabel}>Ingreso del mes</Text>
                    <Text style={styles.incomeValue}>{formatCOP(summary.incomeCop)}</Text>
                  </View>
                  <View style={styles.rulePill}>
                    <Ionicons name="pie-chart-outline" size={15} color={colors.navy} />
                    <Text style={styles.rulePillText}>50/30/20</Text>
                  </View>
                </View>
                <View style={styles.incomeStats}>
                  <MiniStat label="Gastado" value={formatCOP(summary.totalSpentCop)} tone="orange" />
                  <View style={styles.statDivider} />
                  <MiniStat
                    label="Saldo"
                    value={formatCOP(summary.balanceCop)}
                    tone={summary.balanceCop >= 0 ? 'green' : 'red'}
                  />
                  <View style={styles.statDivider} />
                  <MiniStat
                    label="Movimientos"
                    value={String(monthTransactions.length)}
                    tone="navy"
                  />
                </View>
              </Card>
            ) : (
              <Card style={styles.setupCard}>
                <View style={styles.setupIcon}>
                  <Ionicons name="wallet-outline" size={28} color={colors.navy} />
                </View>
                <Text style={styles.setupTitle}>Activa tu presupuesto</Text>
                <Text style={styles.setupText}>
                  Registra tu auxilio de práctica, mesada o ingresos freelance. ProLink calculará
                  automáticamente cuánto destinar a necesidades, deseos y ahorro.
                </Text>
                <Button
                  title="Registrar ingreso"
                  icon="add-circle-outline"
                  onPress={() => router.push('/finanzas/nuevo')}
                  fullWidth
                />
                <Button
                  title="Cargar datos de ejemplo"
                  variant="ghost"
                  onPress={handleSample}
                  fullWidth
                  disabled={monthTransactions.length > 0}
                />
              </Card>
            )}

            <Card style={styles.budgetCard}>
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.cardTitle}>Regla 50/30/20</Text>
                  <Text style={styles.cardSubtitle}>Así se reparte tu ingreso del mes</Text>
                </View>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => router.push('/finanzas/regla')}
                  style={({ pressed }) => [styles.link, pressed && { opacity: 0.7 }]}
                >
                  <Text style={styles.linkText}>Ver detalle</Text>
                  <Ionicons name="chevron-forward" size={14} color={colors.blue} />
                </Pressable>
              </View>
              {summary.buckets.map((bucket) => (
                <BucketRow key={bucket.bucket} summary={bucket} />
              ))}
              {summary.incomeCop === 0 ? (
                <Text style={styles.budgetEmptyHint}>
                  Aún no hay ingresos este mes. Registra uno para ver tus metas calculadas.
                </Text>
              ) : null}
            </Card>

            <SectionHeader
              title="Metas de ahorro"
              actionLabel="Gestionar"
              onAction={() => router.push('/finanzas/metas')}
            />
            <Card style={styles.goalsCard}>
              {goals.length ? (
                goals.slice(0, 2).map((goal) => {
                  const pct = goal.targetCop > 0 ? (goal.savedCop / goal.targetCop) * 100 : 0;
                  return (
                    <View key={goal.id} style={styles.goal}>
                      <View style={styles.goalTop}>
                        <Text style={styles.goalName} numberOfLines={1}>
                          {goal.name}
                        </Text>
                        <Text style={styles.goalPct}>{Math.round(pct)}%</Text>
                      </View>
                      <ProgressBar value={pct} color={colors.green} height={8} />
                      <Text style={styles.goalAmount}>
                        {formatCOP(goal.savedCop)} de {formatCOP(goal.targetCop)}
                      </Text>
                    </View>
                  );
                })
              ) : (
                <View style={styles.goalEmpty}>
                  <View style={styles.goalEmptyIcon}>
                    <Ionicons name="flag-outline" size={21} color={colors.greenDark} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.goalEmptyTitle}>Crea tu primera meta</Text>
                    <Text style={styles.goalEmptyText}>
                      Un viaje, un computador o tu fondo de emergencia.
                    </Text>
                  </View>
                  <Button
                    title="Crear"
                    size="sm"
                    variant="secondary"
                    onPress={() => router.push('/finanzas/metas')}
                  />
                </View>
              )}
              {goals.length ? (
                <Button
                  title="Gestionar metas"
                  variant="secondary"
                  icon="flag-outline"
                  onPress={() => router.push('/finanzas/metas')}
                />
              ) : null}
            </Card>

            <SectionHeader
              title="Movimientos recientes"
              actionLabel="Ver todos"
              onAction={() => router.push('/finanzas/movimientos')}
            />
            <Card padded={false} style={styles.transactionsCard}>
              {recent.length ? (
                recent.map((transaction, index) => (
                  <View
                    key={transaction.clientId}
                    style={[
                      styles.transactionWrapper,
                      index < recent.length - 1 && styles.transactionBorder,
                    ]}
                  >
                    <TransactionRow transaction={transaction} />
                  </View>
                ))
              ) : (
                <EmptyState
                  icon="receipt-outline"
                  title="Sin movimientos este mes"
                  message="Registra tus ingresos y gastos para llevar el control de tu presupuesto."
                  actionLabel="Registrar movimiento"
                  onAction={() => router.push('/finanzas/nuevo')}
                />
              )}
            </Card>

            {lastError ? (
              <Pressable onPress={() => setLastError(null)} style={styles.dismiss}>
                <Text style={styles.dismissText}>Ocultar aviso</Text>
              </Pressable>
            ) : null}
          </>
        )}
      </Screen>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Nuevo movimiento"
        onPress={() => router.push('/finanzas/nuevo')}
        style={({ pressed }) => [
          styles.fab,
          { bottom: insets.bottom + 76 },
          pressed && { opacity: 0.88 },
        ]}
      >
        <Ionicons name="add" size={22} color={colors.white} />
        <Text style={styles.fabText}>Nuevo</Text>
      </Pressable>
    </View>
  );
}

function MiniStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: 'navy' | 'orange' | 'green' | 'red';
}) {
  const color = {
    navy: colors.navy,
    orange: colors.orangeDark,
    green: colors.greenDark,
    red: colors.redDark,
  }[tone];
  return (
    <View style={styles.miniStat}>
      <Text style={styles.miniStatLabel}>{label}</Text>
      <Text style={[styles.miniStatValue, { color }]} numberOfLines={1}>
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
  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: radius.md,
    paddingHorizontal: 6,
    paddingVertical: 6,
    marginTop: 4,
  },
  monthButton: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthCenter: {
    alignItems: 'center',
    gap: 1,
  },
  monthLabel: {
    ...typography.bodyStrong,
    color: colors.white,
    fontWeight: '800',
  },
  monthHint: {
    ...typography.tiny,
    color: '#C9D7EC',
    fontWeight: '500',
  },
  loadingIcon: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loading: {
    paddingVertical: 60,
    alignItems: 'center',
    gap: 10,
  },
  loadingText: {
    ...typography.small,
    color: colors.muted,
  },
  incomeCard: {
    gap: 14,
  },
  incomeTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },
  incomeLabel: {
    ...typography.tiny,
    color: colors.muted,
    fontWeight: '600',
  },
  incomeValue: {
    ...typography.h1,
    color: colors.text,
    marginTop: 2,
  },
  rulePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.ice,
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  rulePillText: {
    ...typography.tiny,
    color: colors.navy,
    fontWeight: '800',
  },
  incomeStats: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.ice2,
    borderRadius: radius.md,
    paddingVertical: 10,
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: colors.border,
  },
  miniStat: {
    flex: 1,
    paddingHorizontal: 10,
    gap: 2,
  },
  miniStatLabel: {
    ...typography.tiny,
    color: colors.muted,
    fontWeight: '600',
  },
  miniStatValue: {
    ...typography.small,
    fontWeight: '800',
  },
  setupCard: {
    alignItems: 'center',
    gap: 10,
  },
  setupIcon: {
    width: 58,
    height: 58,
    borderRadius: radius.pill,
    backgroundColor: colors.ice,
    alignItems: 'center',
    justifyContent: 'center',
  },
  setupTitle: {
    ...typography.h3,
    color: colors.text,
  },
  setupText: {
    ...typography.small,
    color: colors.muted,
    textAlign: 'center',
    lineHeight: 19,
    maxWidth: 320,
  },
  budgetCard: {
    gap: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  cardTitle: {
    ...typography.h3,
    color: colors.text,
  },
  cardSubtitle: {
    ...typography.tiny,
    color: colors.muted,
    fontWeight: '500',
    marginTop: 1,
  },
  link: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  linkText: {
    ...typography.tiny,
    color: colors.blue,
    fontWeight: '700',
  },
  budgetEmptyHint: {
    ...typography.tiny,
    color: colors.muted,
    fontWeight: '500',
    lineHeight: 15,
  },
  goalsCard: {
    gap: 14,
  },
  goal: {
    gap: 6,
  },
  goalTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  goalName: {
    ...typography.bodyStrong,
    color: colors.text,
    flex: 1,
  },
  goalPct: {
    ...typography.small,
    color: colors.greenDark,
    fontWeight: '800',
  },
  goalAmount: {
    ...typography.tiny,
    color: colors.muted,
    fontWeight: '500',
  },
  goalEmpty: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  goalEmptyIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: colors.greenSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalEmptyTitle: {
    ...typography.bodyStrong,
    color: colors.text,
  },
  goalEmptyText: {
    ...typography.tiny,
    color: colors.muted,
    fontWeight: '500',
    lineHeight: 15,
  },
  transactionsCard: {
    overflow: 'hidden',
  },
  transactionWrapper: {
    paddingHorizontal: 16,
  },
  transactionBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dismiss: {
    alignSelf: 'center',
    paddingVertical: 4,
  },
  dismissText: {
    ...typography.tiny,
    color: colors.muted,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  fab: {
    position: 'absolute',
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.orange,
    borderRadius: radius.pill,
    paddingLeft: 12,
    paddingRight: 16,
    paddingVertical: 12,
    ...shadow.floating,
  },
  fabText: {
    ...typography.bodyStrong,
    color: colors.white,
    fontWeight: '800',
  },
});
