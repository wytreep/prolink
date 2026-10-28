import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { OfferCard } from '@/components/OfferCard';
import { Badge } from '@/components/ui/Badge';
import { Banner } from '@/components/ui/Banner';
import { Button } from '@/components/ui/Button';
import { Card, StatTile } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Screen, SectionHeader } from '@/components/ui/Screen';
import { useAuth } from '@/context/AuthContext';
import { useCV } from '@/context/CVContext';
import { useFinance } from '@/context/FinanceContext';
import { useOffers } from '@/context/OffersContext';
import { matchScore, offers } from '@/data/offers';
import { firstName, formatCOP, initials, monthLabel } from '@/lib/format';
import { bucketMeta, colors, radius, spacing, typography } from '@/theme';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { user, isDemo } = useAuth();
  const { cv, completeness } = useCV();
  const { applications, savedCount, isSaved, toggleSaved, activeApplications } = useOffers();
  const { summary, month, pendingCount, isOffline, syncPending, isSyncing, lastError, refresh } =
    useFinance();

  const ranked = [...offers]
    .map((offer) => ({ offer, match: matchScore(offer, cv.skills) }))
    .sort((a, b) => b.match - a.match);
  const topMatch = ranked[0]?.match ?? 0;
  const spentPct = summary.incomeCop > 0 ? (summary.totalSpentCop / summary.incomeCop) * 100 : 0;

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + 14 }]}>
        <View style={styles.headerRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials(user?.name ?? 'ProLink')}</Text>
          </View>
          <View style={styles.greetingBlock}>
            <Text style={styles.greeting}>Hola, {firstName(user?.name ?? 'estudiante')}</Text>
            <Text style={styles.greetingSub}>
              {isDemo ? 'Explorando ProLink en modo demo' : 'Bienvenida de nuevo a ProLink'}
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Ver postulaciones"
            onPress={() => router.push('/postulaciones')}
            style={({ pressed }) => [styles.headerButton, pressed && { opacity: 0.7 }]}
          >
            <Ionicons name="notifications-outline" size={21} color={colors.white} />
            {activeApplications > 0 ? <View style={styles.notificationDot} /> : null}
          </Pressable>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/ofertas')}
          style={({ pressed }) => [styles.search, pressed && { opacity: 0.9 }]}
        >
          <Ionicons name="search" size={18} color={colors.muted} />
          <Text style={styles.searchText}>Busca prácticas por cargo o empresa</Text>
          <Ionicons name="options-outline" size={18} color={colors.navy} />
        </Pressable>
      </View>

      <Screen>
        {isDemo ? (
          <Banner
            tone="demo"
            title="Modo demo activo"
            message="Puedes probar todo el flujo. Tus datos se guardan solo en este dispositivo."
          />
        ) : isOffline ? (
          <Banner
            tone="warning"
            title="Sin conexión"
            message={
              pendingCount > 0
                ? `${pendingCount} movimiento(s) esperando sincronización.`
                : 'Puedes seguir consultando ofertas, tu CV y tus finanzas guardadas.'
            }
          />
        ) : pendingCount > 0 ? (
          <Banner
            tone="warning"
            title={`${pendingCount} movimiento(s) pendientes`}
            message="Guarda tus cambios en la nube para verlos en otros dispositivos."
            actionLabel={isSyncing ? 'Sincronizando…' : 'Sincronizar'}
            onAction={() => void syncPending()}
            loading={isSyncing}
          />
        ) : null}

        {lastError ? (
          <Banner
            tone="error"
            title="No pudimos actualizar"
            message={lastError}
            actionLabel="Reintentar"
            onAction={() => void refresh()}
          />
        ) : null}

        <View style={styles.hero}>
          <View style={styles.heroCircle} />
          <View style={styles.heroCircleSmall} />
          <Badge label="Prácticas 2026-2" tone="navy" icon="sparkles-outline" />
          <Text style={styles.heroTitle}>Tu próxima práctica está más cerca</Text>
          <Text style={styles.heroText}>
            Tenemos {offers.length} ofertas activas y tu mejor compatibilidad es del {topMatch}%.
            Explora, guarda y postúlate en pocos pasos.
          </Text>
          <Button
            title="Explorar ofertas"
            icon="briefcase-outline"
            variant="dark"
            onPress={() => router.push('/ofertas')}
            style={styles.heroButton}
          />
        </View>

        <View style={styles.statsRow}>
          <StatTile
            icon="send-outline"
            label="Postulaciones activas"
            value={String(activeApplications)}
            tone="navy"
          />
          <StatTile
            icon="bookmark-outline"
            label="Ofertas guardadas"
            value={String(savedCount)}
            tone="orange"
          />
          <StatTile
            icon="sparkles-outline"
            label="Mejor match"
            value={`${topMatch}%`}
            tone="green"
          />
        </View>

        <SectionHeader
          title="Recomendadas para ti"
          actionLabel="Ver todas"
          onAction={() => router.push('/ofertas')}
        />
        <View style={styles.offersList}>
          {ranked.slice(0, 2).map(({ offer, match }) => (
            <OfferCard
              key={offer.id}
              offer={offer}
              matchPct={match}
              saved={isSaved(offer.id)}
              onPress={() => router.push({ pathname: '/ofertas/[id]', params: { id: offer.id } })}
              onToggleSave={() => toggleSaved(offer.id)}
              compact
            />
          ))}
        </View>

        <SectionHeader
          title="Tu presupuesto"
          actionLabel={monthLabel(month)}
          onAction={() => router.push('/finanzas')}
        />
        <Card style={styles.budgetCard}>
          {summary.incomeCop > 0 ? (
            <>
              <View style={styles.budgetTop}>
                <View>
                  <Text style={styles.budgetLabel}>Ingreso del mes</Text>
                  <Text style={styles.budgetIncome}>{formatCOP(summary.incomeCop)}</Text>
                </View>
                <View style={styles.balancePill}>
                  <Text style={styles.balanceLabel}>Saldo</Text>
                  <Text style={styles.balanceValue}>{formatCOP(summary.balanceCop)}</Text>
                </View>
              </View>
              <ProgressBar
                value={spentPct}
                color={spentPct >= 100 ? colors.red : spentPct >= 80 ? colors.orange : colors.green}
                height={10}
              />
              <Text style={styles.budgetHint}>
                Has gastado {Math.round(spentPct)}% de tus ingresos este mes.
              </Text>
              <View style={styles.bucketsRow}>
                {summary.buckets.map((bucket) => {
                  const meta = bucketMeta[bucket.bucket];
                  return (
                    <View key={bucket.bucket} style={styles.bucketMini}>
                      <View style={styles.bucketMiniLabel}>
                        <View style={[styles.bucketDot, { backgroundColor: meta.color }]} />
                        <Text style={styles.bucketMiniText}>{meta.shortLabel}</Text>
                      </View>
                      <Text style={styles.bucketMiniAmount}>{formatCOP(bucket.spentCop)}</Text>
                    </View>
                  );
                })}
              </View>
              <Button
                title="Ver finanzas"
                variant="secondary"
                icon="wallet-outline"
                onPress={() => router.push('/finanzas')}
              />
            </>
          ) : (
            <View style={styles.emptyBudget}>
              <View style={styles.emptyBudgetIcon}>
                <Ionicons name="wallet-outline" size={26} color={colors.navy} />
              </View>
              <View style={styles.emptyBudgetText}>
                <Text style={styles.emptyBudgetTitle}>Aún no registras ingresos</Text>
                <Text style={styles.emptyBudgetMessage}>
                  Registra tu auxilio o mesada para activar la regla 50/30/20.
                </Text>
              </View>
              <Button
                title="Registrar"
                size="sm"
                onPress={() => router.push('/finanzas/nuevo')}
              />
            </View>
          )}
        </Card>

        <SectionHeader title="Tu hoja de vida" actionLabel="Editar" onAction={() => router.push('/cv')} />
        <Card style={styles.cvCard}>
          <View style={styles.cvTop}>
            <View style={styles.cvIcon}>
              <Ionicons name="id-card-outline" size={22} color={colors.navy} />
            </View>
            <View style={styles.cvText}>
              <Text style={styles.cvTitle}>{completeness}% completo</Text>
              <Text style={styles.cvMessage}>
                {completeness >= 100
                  ? 'Tu hoja de vida está lista para postularte.'
                  : 'Completa tu perfil para mejorar tu compatibilidad con las ofertas.'}
              </Text>
            </View>
            <Badge
              label={completeness >= 80 ? 'Muy bien' : 'En progreso'}
              tone={completeness >= 80 ? 'green' : 'yellow'}
            />
          </View>
          <ProgressBar value={completeness} color={colors.navy} height={9} />
          <Button
            title="Ver mi hoja de vida"
            variant="secondary"
            icon="document-text-outline"
            onPress={() => router.push('/cv')}
          />
        </Card>

        <SectionHeader title="Accesos rápidos" />
        <View style={styles.quickGrid}>
          <QuickAction
            icon="briefcase-outline"
            label="Buscar prácticas"
            tone="navy"
            onPress={() => router.push('/ofertas')}
          />
          <QuickAction
            icon="send-outline"
            label={`Postulaciones${applications.length ? ` (${applications.length})` : ''}`}
            tone="orange"
            onPress={() => router.push('/postulaciones')}
          />
          <QuickAction
            icon="flag-outline"
            label="Metas de ahorro"
            tone="green"
            onPress={() => router.push('/finanzas/metas')}
          />
          <QuickAction
            icon="calculator-outline"
            label="Regla 50/30/20"
            tone="blue"
            onPress={() => router.push('/finanzas/regla')}
          />
        </View>
      </Screen>
    </View>
  );
}

function QuickAction({
  icon,
  label,
  tone,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  tone: 'navy' | 'orange' | 'green' | 'blue';
  onPress: () => void;
}) {
  const palette = {
    navy: { bg: colors.ice, fg: colors.navy },
    orange: { bg: colors.orangeSoft, fg: colors.orangeDark },
    green: { bg: colors.greenSoft, fg: colors.greenDark },
    blue: { bg: '#E4EEFB', fg: colors.blue },
  }[tone];
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.quick, pressed && { opacity: 0.8 }]}
    >
      <View style={[styles.quickIcon, { backgroundColor: palette.bg }]}>
        <Ionicons name={icon} size={21} color={palette.fg} />
      </View>
      <Text style={styles.quickLabel}>{label}</Text>
      <Ionicons name="chevron-forward" size={16} color={colors.mutedLight} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    backgroundColor: colors.navy,
    paddingHorizontal: spacing.xl,
    paddingBottom: 18,
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
    gap: 14,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: radius.pill,
    backgroundColor: colors.orange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: colors.white,
    fontWeight: '800',
    fontSize: 16,
  },
  greetingBlock: {
    flex: 1,
    gap: 1,
  },
  greeting: {
    ...typography.h3,
    color: colors.white,
  },
  greetingSub: {
    ...typography.tiny,
    color: '#C9D7EC',
    fontWeight: '500',
  },
  headerButton: {
    width: 42,
    height: 42,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationDot: {
    position: 'absolute',
    top: 10,
    right: 11,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.orange,
    borderWidth: 1.5,
    borderColor: colors.navy,
  },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    height: 46,
  },
  searchText: {
    flex: 1,
    ...typography.small,
    color: colors.muted,
  },
  hero: {
    backgroundColor: colors.orange,
    borderRadius: radius.xl,
    padding: 20,
    gap: 10,
    overflow: 'hidden',
  },
  heroCircle: {
    position: 'absolute',
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: 'rgba(255,255,255,0.18)',
    right: -60,
    top: -70,
  },
  heroCircleSmall: {
    position: 'absolute',
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(255,255,255,0.14)',
    right: 38,
    bottom: -46,
  },
  heroTitle: {
    ...typography.h2,
    color: colors.navyDeep,
    maxWidth: '85%',
  },
  heroText: {
    ...typography.small,
    color: colors.navyDeep,
    lineHeight: 19,
    maxWidth: '92%',
    opacity: 0.85,
  },
  heroButton: {
    alignSelf: 'flex-start',
    marginTop: 4,
    paddingHorizontal: 18,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  offersList: {
    gap: 12,
  },
  budgetCard: {
    gap: 12,
  },
  budgetTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 10,
  },
  budgetLabel: {
    ...typography.tiny,
    color: colors.muted,
    fontWeight: '600',
  },
  budgetIncome: {
    ...typography.h2,
    color: colors.text,
    marginTop: 2,
  },
  balancePill: {
    backgroundColor: colors.greenSoft,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: 7,
    alignItems: 'flex-end',
  },
  balanceLabel: {
    ...typography.tiny,
    color: colors.greenDark,
    fontWeight: '600',
  },
  balanceValue: {
    ...typography.bodyStrong,
    color: colors.greenDark,
    fontWeight: '800',
  },
  budgetHint: {
    ...typography.tiny,
    color: colors.muted,
    fontWeight: '500',
  },
  bucketsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  bucketMini: {
    flex: 1,
    backgroundColor: colors.ice2,
    borderRadius: radius.sm,
    padding: 9,
    gap: 4,
  },
  bucketMiniLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  bucketDot: {
    width: 7,
    height: 7,
    borderRadius: 3,
  },
  bucketMiniText: {
    ...typography.tiny,
    color: colors.muted,
    fontWeight: '600',
  },
  bucketMiniAmount: {
    ...typography.small,
    color: colors.text,
    fontWeight: '800',
  },
  emptyBudget: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  emptyBudgetIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: colors.ice,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyBudgetText: {
    flex: 1,
    gap: 2,
  },
  emptyBudgetTitle: {
    ...typography.bodyStrong,
    color: colors.text,
  },
  emptyBudgetMessage: {
    ...typography.tiny,
    color: colors.muted,
    lineHeight: 15,
  },
  cvCard: {
    gap: 12,
  },
  cvTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cvIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: colors.ice,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cvText: {
    flex: 1,
    gap: 2,
  },
  cvTitle: {
    ...typography.bodyStrong,
    color: colors.text,
  },
  cvMessage: {
    ...typography.tiny,
    color: colors.muted,
    lineHeight: 15,
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  quick: {
    flexGrow: 1,
    flexBasis: '46%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  quickIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickLabel: {
    flex: 1,
    ...typography.tiny,
    color: colors.text,
    fontWeight: '700',
    lineHeight: 14,
  },
});
