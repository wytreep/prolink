import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { BucketDetailCard } from '@/components/BucketCard';
import { AppHeader } from '@/components/ui/AppHeader';
import { Banner } from '@/components/ui/Banner';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Screen, SectionHeader } from '@/components/ui/Screen';
import { useFinance } from '@/context/FinanceContext';
import { formatCOP, monthLabel } from '@/lib/format';
import { bucketMeta, colors, radius, typography } from '@/theme';
import type { Bucket, BucketSummary } from '@/types';

const ORDER: Bucket[] = ['needs', 'wants', 'savings'];

const TIPS: { icon: keyof typeof Ionicons.glyphMap; title: string; body: string }[] = [
  {
    icon: 'repeat-outline',
    title: 'Automatiza el ahorro',
    body: 'Aparta el 20% apenas recibas tu ingreso. Si esperas a fin de mes, es más fácil gastarlo.',
  },
  {
    icon: 'albums-outline',
    title: 'Separa tus bolsillos',
    body: 'Usa cuentas o bolsillos distintos para necesidades, gustos y ahorro. Verlos separados ayuda a no mezclarlos.',
  },
  {
    icon: 'calendar-outline',
    title: 'Revisa cada semana',
    body: 'Dedica diez minutos a revisar tus movimientos. Detectar un exceso a tiempo es más fácil que corregirlo al final.',
  },
  {
    icon: 'happy-outline',
    title: 'Ajusta sin culpa',
    body: 'La regla es una guía, no una camisa de fuerza. Si un mes gastas más en deseos, compensa al siguiente.',
  },
];

export default function RuleScreen() {
  const { summary, month } = useFinance();

  const buckets = ORDER.map((bucket) =>
    summary.buckets.find((item) => item.bucket === bucket),
  ).filter((item): item is BucketSummary => Boolean(item));

  return (
    <View style={styles.screen}>
      <AppHeader
        eyebrow="Educación financiera"
        title="Regla 50/30/20"
        subtitle={monthLabel(month)}
        onBack={() => router.back()}
      />

      <Screen contentStyle={styles.content}>
        {summary.incomeCop === 0 ? (
          <Banner
            tone="info"
            title="Aún no hay ingresos este mes"
            message="Registra tu auxilio, mesada o ingresos freelance para calcular cuánto destinar a cada categoría."
            actionLabel="Registrar"
            onAction={() => router.push('/finanzas/nuevo')}
          />
        ) : null}

        <Card style={styles.introCard}>
          <View style={styles.introTop}>
            <View style={styles.introIcon}>
              <Ionicons name="pie-chart-outline" size={24} color={colors.navy} />
            </View>
            <View style={styles.introText}>
              <Text style={styles.introLabel}>Ingreso del mes</Text>
              <Text style={styles.introValue}>{formatCOP(summary.incomeCop)}</Text>
            </View>
          </View>

          <Text style={styles.introBody}>
            La regla 50/30/20 reparte tu ingreso en tres bloques: la mitad para lo esencial, un
            30% para disfrutar y un 20% para construir tu futuro.
          </Text>

          <View style={styles.stack}>
            {buckets.map((item) => {
              const meta = bucketMeta[item.bucket];
              return (
                <View
                  key={item.bucket}
                  style={[
                    styles.stackSegment,
                    { flex: meta.rule, backgroundColor: meta.color },
                  ]}
                />
              );
            })}
          </View>

          <View style={styles.legend}>
            {buckets.map((item) => {
              const meta = bucketMeta[item.bucket];
              return (
                <View key={item.bucket} style={styles.legendRow}>
                  <View style={[styles.legendDot, { backgroundColor: meta.color }]} />
                  <View style={styles.legendText}>
                    <Text style={styles.legendLabel}>{meta.label}</Text>
                    <Text style={styles.legendDescription}>{meta.description}</Text>
                  </View>
                  <View style={styles.legendRight}>
                    <Text style={[styles.legendPct, { color: meta.color }]}>{meta.rule}%</Text>
                    <Text style={styles.legendAmount}>{formatCOP(item.targetCop)}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </Card>

        <SectionHeader title="Tus límites este mes" />
        {buckets.map((item) => (
          <BucketDetailCard key={item.bucket} summary={item} />
        ))}

        <SectionHeader title="Cómo cumplirla" />
        <Card padded={false} style={styles.tipsCard}>
          {TIPS.map((tip, index) => (
            <View
              key={tip.title}
              style={[styles.tip, index < TIPS.length - 1 && styles.tipBorder]}
            >
              <View style={styles.tipIcon}>
                <Ionicons name={tip.icon} size={18} color={colors.navy} />
              </View>
              <View style={styles.tipText}>
                <Text style={styles.tipTitle}>{tip.title}</Text>
                <Text style={styles.tipBody}>{tip.body}</Text>
              </View>
            </View>
          ))}
        </Card>

        <Card style={styles.goalsCard}>
          <View style={styles.goalsTop}>
            <View style={styles.goalsIcon}>
              <Ionicons name="flag-outline" size={21} color={colors.greenDark} />
            </View>
            <View style={styles.goalsText}>
              <Text style={styles.goalsTitle}>Convierte tu 20% en metas</Text>
              <Text style={styles.goalsBody}>
                Usa el bloque de ahorro para tu fondo de emergencia, un viaje o tu primer
                computador. Cada aporte te acerca.
              </Text>
            </View>
          </View>
          <Button
            title="Ver metas de ahorro"
            variant="secondary"
            icon="flag-outline"
            onPress={() => router.push('/finanzas/metas')}
            fullWidth
          />
        </Card>

        <Button
          title="Registrar un movimiento"
          icon="add-circle-outline"
          onPress={() => router.push('/finanzas/nuevo')}
          fullWidth
        />
      </Screen>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    gap: 16,
  },
  introCard: {
    gap: 14,
  },
  introTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  introIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.ice,
    alignItems: 'center',
    justifyContent: 'center',
  },
  introText: {
    flex: 1,
    gap: 1,
  },
  introLabel: {
    ...typography.tiny,
    color: colors.muted,
    fontWeight: '600',
  },
  introValue: {
    ...typography.h2,
    color: colors.text,
  },
  introBody: {
    ...typography.small,
    color: colors.muted,
    lineHeight: 19,
  },
  stack: {
    flexDirection: 'row',
    height: 16,
    borderRadius: radius.pill,
    overflow: 'hidden',
    backgroundColor: colors.ice,
  },
  stackSegment: {
    height: '100%',
  },
  legend: {
    gap: 12,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 9,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 3,
    marginTop: 4,
  },
  legendText: {
    flex: 1,
    gap: 1,
  },
  legendLabel: {
    ...typography.bodyStrong,
    color: colors.text,
  },
  legendDescription: {
    ...typography.tiny,
    color: colors.muted,
    fontWeight: '500',
    lineHeight: 15,
  },
  legendRight: {
    alignItems: 'flex-end',
    gap: 1,
  },
  legendPct: {
    ...typography.bodyStrong,
    fontWeight: '800',
  },
  legendAmount: {
    ...typography.tiny,
    color: colors.muted,
    fontWeight: '600',
  },
  tipsCard: {
    overflow: 'hidden',
  },
  tip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 11,
    padding: 14,
  },
  tipBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tipIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: colors.ice,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipText: {
    flex: 1,
    gap: 2,
  },
  tipTitle: {
    ...typography.bodyStrong,
    color: colors.text,
  },
  tipBody: {
    ...typography.tiny,
    color: colors.muted,
    fontWeight: '500',
    lineHeight: 16,
  },
  goalsCard: {
    gap: 12,
  },
  goalsTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },
  goalsIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: colors.greenSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalsText: {
    flex: 1,
    gap: 2,
  },
  goalsTitle: {
    ...typography.bodyStrong,
    color: colors.text,
  },
  goalsBody: {
    ...typography.tiny,
    color: colors.muted,
    fontWeight: '500',
    lineHeight: 15,
  },
});
