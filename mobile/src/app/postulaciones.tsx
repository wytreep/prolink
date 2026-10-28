import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Badge, Chip, type BadgeTone } from '@/components/ui/Badge';
import { AppHeader } from '@/components/ui/AppHeader';
import { StatTile } from '@/components/ui/Card';
import { EmptyState, Screen } from '@/components/ui/Screen';
import { useOffers } from '@/context/OffersContext';
import { getOffer } from '@/data/offers';
import { formatDate } from '@/lib/format';
import { colors, radius, shadow, typography } from '@/theme';
import type { ApplicationStatus } from '@/types';

type Filter = 'Todas' | ApplicationStatus;

const STATUS: Record<
  ApplicationStatus,
  { label: string; tone: BadgeTone; icon: keyof typeof Ionicons.glyphMap; color: string }
> = {
  enviada: { label: 'Enviada', tone: 'blue', icon: 'send-outline', color: colors.blue },
  en_revision: {
    label: 'En revisión',
    tone: 'yellow',
    icon: 'time-outline',
    color: colors.yellow,
  },
  entrevista: {
    label: 'Entrevista',
    tone: 'green',
    icon: 'people-outline',
    color: colors.greenDark,
  },
  no_seleccionada: {
    label: 'No seleccionada',
    tone: 'red',
    icon: 'close-circle-outline',
    color: colors.redDark,
  },
};

const FILTERS: Filter[] = ['Todas', 'en_revision', 'entrevista', 'enviada', 'no_seleccionada'];

export default function ApplicationsScreen() {
  const { applications } = useOffers();
  const [filter, setFilter] = useState<Filter>('Todas');

  const counts = useMemo(
    () => ({
      en_revision: applications.filter((item) => item.status === 'en_revision').length,
      entrevista: applications.filter((item) => item.status === 'entrevista').length,
      enviada: applications.filter((item) => item.status === 'enviada').length,
    }),
    [applications],
  );

  const filtered = useMemo(
    () =>
      applications
        .filter((item) => filter === 'Todas' || item.status === filter)
        .sort((a, b) => b.appliedAt.localeCompare(a.appliedAt)),
    [applications, filter],
  );

  return (
    <View style={styles.screen}>
      <AppHeader
        eyebrow="Seguimiento"
        title="Mis postulaciones"
        subtitle="Consulta en qué etapa va cada oportunidad."
        onBack={() => router.back()}
      />
      <Screen contentStyle={styles.content}>
        <View style={styles.statsRow}>
          <StatTile
            icon="time-outline"
            label="En revisión"
            value={String(counts.en_revision)}
            tone="orange"
          />
          <StatTile
            icon="people-outline"
            label="Entrevistas"
            value={String(counts.entrevista)}
            tone="green"
          />
          <StatTile
            icon="send-outline"
            label="Enviadas"
            value={String(counts.enviada)}
            tone="navy"
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filters}
        >
          {FILTERS.map((item) => (
            <Chip
              key={item}
              label={item === 'Todas' ? 'Todas' : STATUS[item].label}
              selected={filter === item}
              onPress={() => setFilter(item)}
            />
          ))}
        </ScrollView>

        {filtered.length ? (
          <View style={styles.list}>
            {filtered.map((application) => {
              const meta = STATUS[application.status];
              return (
                <Pressable
                  key={application.id}
                  accessibilityRole="button"
                  onPress={() => {
                    if (getOffer(application.offerId)) {
                      router.push({
                        pathname: '/ofertas/[id]',
                        params: { id: application.offerId },
                      });
                    }
                  }}
                  style={({ pressed }) => [styles.card, pressed && { opacity: 0.88 }]}
                >
                  <View style={styles.cardTop}>
                    <View style={[styles.icon, { backgroundColor: `${meta.color}18` }]}>
                      <Ionicons name={meta.icon} size={19} color={meta.color} />
                    </View>
                    <View style={styles.cardTitles}>
                      <Text style={styles.title}>{application.offerTitle}</Text>
                      <Text style={styles.company}>{application.company}</Text>
                    </View>
                    <Badge label={meta.label} tone={meta.tone} />
                  </View>

                  <View style={styles.cardBottom}>
                    <View style={styles.metaItem}>
                      <Ionicons name="calendar-outline" size={13} color={colors.muted} />
                      <Text style={styles.metaText}>
                        Postulada el {formatDate(application.appliedAt)}
                      </Text>
                    </View>
                    <View style={styles.match}>
                      <Ionicons name="sparkles-outline" size={13} color={colors.greenDark} />
                      <Text style={styles.matchText}>{application.matchPct}% match</Text>
                    </View>
                  </View>

                  {application.status === 'entrevista' ? (
                    <View style={styles.tip}>
                      <Ionicons name="bulb-outline" size={15} color={colors.greenDark} />
                      <Text style={styles.tipText}>
                        Prepara tu presentación de 90 segundos y revisa los consejos de entrevista
                        en tu hoja de vida.
                      </Text>
                    </View>
                  ) : null}
                </Pressable>
              );
            })}
          </View>
        ) : (
          <EmptyState
            icon="send-outline"
            title={applications.length ? 'No hay postulaciones en este estado' : 'Aún no te postulas'}
            message={
              applications.length
                ? 'Cambia el filtro para ver tus otras postulaciones.'
                : 'Explora las ofertas, revisa tu compatibilidad y envía tu primera postulación.'
            }
            actionLabel="Explorar ofertas"
            onAction={() => router.replace('/ofertas')}
          />
        )}
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
    gap: 14,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  filters: {
    gap: 8,
    paddingRight: 20,
  },
  list: {
    gap: 12,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: 16,
    gap: 12,
    ...shadow.card,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  icon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitles: {
    flex: 1,
    gap: 1,
  },
  title: {
    ...typography.title,
    color: colors.text,
  },
  company: {
    ...typography.tiny,
    color: colors.muted,
    fontWeight: '500',
  },
  cardBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    flexWrap: 'wrap',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    ...typography.tiny,
    color: colors.muted,
    fontWeight: '500',
  },
  match: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.greenSoft,
    borderRadius: radius.pill,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  matchText: {
    ...typography.tiny,
    color: colors.greenDark,
    fontWeight: '700',
  },
  tip: {
    flexDirection: 'row',
    gap: 7,
    backgroundColor: colors.greenSoft,
    borderRadius: radius.md,
    padding: 10,
  },
  tipText: {
    flex: 1,
    ...typography.tiny,
    color: colors.greenDark,
    fontWeight: '500',
    lineHeight: 15,
  },
});
