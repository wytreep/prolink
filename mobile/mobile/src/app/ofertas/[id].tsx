import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useLocalSearchParams } from 'expo-router';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { AppHeader, HeaderIconButton } from '@/components/ui/AppHeader';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { EmptyState } from '@/components/ui/Screen';
import { useCV } from '@/context/CVContext';
import { useOffers } from '@/context/OffersContext';
import {
  getCompany,
  getOffer,
  matchScore,
  matchedSkills,
  missingSkills,
} from '@/data/offers';
import { formatCOP, formatDate } from '@/lib/format';
import { colors, radius, shadow, typography } from '@/theme';

export default function OfferDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { cv } = useCV();
  const { isSaved, toggleSaved, hasApplied, applyToOffer } = useOffers();
  const offer = getOffer(id ?? '');
  const company = offer ? getCompany(offer.companyId) : undefined;

  if (!offer) {
    return (
      <View style={styles.screen}>
        <AppHeader title="Oferta" onBack={() => router.back()} />
        <EmptyState
          icon="briefcase-outline"
          title="Oferta no encontrada"
          message="Puede que ya no esté disponible. Vuelve al listado para ver otras oportunidades."
          actionLabel="Ver ofertas"
          onAction={() => router.replace('/ofertas')}
        />
      </View>
    );
  }

  const match = matchScore(offer, cv.skills);
  const owned = matchedSkills(offer, cv.skills);
  const missing = missingSkills(offer, cv.skills);
  const applied = hasApplied(offer.id);
  const saved = isSaved(offer.id);

  const handleApply = () => {
    Alert.alert(
      'Confirmar postulación',
      `Vas a postularte a ${offer.title} en ${offer.company}. Tu hoja de vida se compartirá con la empresa.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Enviar postulación',
          onPress: () => {
            const created = applyToOffer(offer, match);
            if (created) {
              Alert.alert(
                '¡Postulación enviada!',
                'Puedes seguir el estado en la sección Mis postulaciones.',
                [
                  { text: 'Seguir explorando', style: 'cancel' },
                  { text: 'Ver postulaciones', onPress: () => router.push('/postulaciones') },
                ],
              );
            }
          },
        },
      ],
    );
  };

  return (
    <View style={styles.screen}>
      <AppHeader
        title="Detalle de la oferta"
        onBack={() => router.back()}
        right={
          <HeaderIconButton
            icon={saved ? 'bookmark' : 'bookmark-outline'}
            label={saved ? 'Quitar de guardadas' : 'Guardar oferta'}
            onPress={() => toggleSaved(offer.id)}
          />
        }
      />
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 130 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.companyHeader}>
          <View style={[styles.logo, { backgroundColor: offer.logoColor }]}>
            <Text style={styles.logoText}>{offer.initials}</Text>
          </View>
          <View style={styles.companyText}>
            <Text style={styles.companyName}>{offer.company}</Text>
            <Text style={styles.sector}>
              {offer.sector} · Publicada el {formatDate(offer.publishedAt, { short: true })}
            </Text>
          </View>
          {offer.featured ? <Badge label="Destacada" tone="orange" icon="star" /> : null}
        </View>

        <View>
          <Text style={styles.title}>{offer.title}</Text>
          <View style={styles.metaRow}>
            <Meta icon="location-outline" text={offer.location} />
            <Meta icon="time-outline" text={offer.contract} />
            <Meta icon="calendar-outline" text={offer.duration} />
          </View>
        </View>

        <View style={styles.matchCard}>
          <View style={styles.matchTop}>
            <View>
              <Text style={styles.matchLabel}>Compatibilidad con tu perfil</Text>
              <Text style={styles.matchValue}>{match}%</Text>
            </View>
            <View style={styles.matchBadge}>
              <Ionicons name="sparkles" size={18} color={colors.greenDark} />
            </View>
          </View>
          <ProgressBar value={match} color={colors.green} height={10} />
          <Text style={styles.matchHint}>
            {owned.length} de {offer.skills.length} habilidades requeridas ya están en tu hoja de
            vida.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Habilidades que ya tienes</Text>
          {owned.length ? (
            <View style={styles.chips}>
              {owned.map((skill) => (
                <View key={skill} style={[styles.skill, styles.skillOwned]}>
                  <Ionicons name="checkmark" size={13} color={colors.greenDark} />
                  <Text style={[styles.skillText, { color: colors.greenDark }]}>{skill}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.mutedText}>
              Todavía no coincides con las habilidades de esta oferta. Actualiza tu hoja de vida.
            </Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Habilidades por desarrollar</Text>
          {missing.length ? (
            <View style={styles.chips}>
              {missing.map((skill) => (
                <View key={skill} style={[styles.skill, styles.skillMissing]}>
                  <Ionicons name="add" size={13} color={colors.orangeDark} />
                  <Text style={[styles.skillText, { color: colors.orangeDark }]}>{skill}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.mutedText}>
              ¡Cubres todas las habilidades! Es una excelente oportunidad para postularte.
            </Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sobre la práctica</Text>
          <Text style={styles.bodyText}>{offer.description}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Responsabilidades</Text>
          {offer.responsibilities.map((item) => (
            <Bullet key={item} text={item} icon="checkmark-circle" color={colors.green} />
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Requisitos</Text>
          {offer.requirements.map((item) => (
            <Bullet key={item} text={item} icon="ellipse" color={colors.orange} />
          ))}
        </View>

        {company ? (
          <View style={styles.companyCard}>
            <View style={styles.companyCardTop}>
              <View style={[styles.companyLogoSmall, { backgroundColor: company.color }]}>
                <Text style={styles.companyLogoSmallText}>{company.initials}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.companyCardName}>{company.name}</Text>
                <Text style={styles.companyCardMeta}>
                  {company.sector} · {company.city} · {company.employees} empleados
                </Text>
              </View>
            </View>
            <Text style={styles.companyAbout}>{company.about}</Text>
            <View style={styles.websiteRow}>
              <Ionicons name="globe-outline" size={14} color={colors.blue} />
              <Text style={styles.website}>{company.website}</Text>
            </View>
          </View>
        ) : null}

        {applied ? (
          <View style={styles.appliedBox}>
            <Ionicons name="checkmark-circle" size={20} color={colors.greenDark} />
            <View style={{ flex: 1 }}>
              <Text style={styles.appliedTitle}>Ya te postulaste</Text>
              <Text style={styles.appliedText}>
                Revisa el estado de tu postulación en la sección Mis postulaciones.
              </Text>
            </View>
            <Pressable accessibilityRole="button" onPress={() => router.push('/postulaciones')}>
              <Text style={styles.appliedLink}>Ver</Text>
            </Pressable>
          </View>
        ) : null}
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 12 }]}>
        <View>
          <Text style={styles.salaryLabel}>Auxilio mensual</Text>
          <Text style={styles.salary}>{formatCOP(offer.salaryCop)}</Text>
        </View>
        <Button
          title={applied ? 'Postulación enviada' : 'Postularme'}
          icon={applied ? 'checkmark' : 'send-outline'}
          onPress={handleApply}
          disabled={applied}
          style={styles.applyButton}
        />
      </View>
    </View>
  );
}

function Meta({ icon, text }: { icon: keyof typeof Ionicons.glyphMap; text: string }) {
  return (
    <View style={styles.metaItem}>
      <Ionicons name={icon} size={14} color={colors.muted} />
      <Text style={styles.metaText}>{text}</Text>
    </View>
  );
}

function Bullet({
  text,
  icon,
  color,
}: {
  text: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}) {
  return (
    <View style={styles.bullet}>
      <Ionicons name={icon} size={16} color={color} style={{ marginTop: 2 }} />
      <Text style={styles.bulletText}>{text}</Text>
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
    gap: 20,
  },
  companyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logo: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    color: colors.white,
    fontWeight: '800',
    fontSize: 18,
  },
  companyText: {
    flex: 1,
    gap: 2,
  },
  companyName: {
    ...typography.title,
    color: colors.text,
  },
  sector: {
    ...typography.tiny,
    color: colors.muted,
    fontWeight: '500',
  },
  title: {
    ...typography.h1,
    color: colors.text,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    ...typography.tiny,
    color: colors.muted,
    fontWeight: '600',
  },
  matchCard: {
    backgroundColor: colors.greenSoft,
    borderRadius: radius.lg,
    padding: 16,
    gap: 10,
  },
  matchTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  matchLabel: {
    ...typography.small,
    color: colors.greenDark,
    fontWeight: '600',
  },
  matchValue: {
    ...typography.h1,
    color: colors.greenDark,
    marginTop: 2,
  },
  matchBadge: {
    width: 42,
    height: 42,
    borderRadius: radius.pill,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  matchHint: {
    ...typography.tiny,
    color: colors.greenDark,
    fontWeight: '500',
  },
  section: {
    gap: 9,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: radius.pill,
    paddingHorizontal: 11,
    paddingVertical: 7,
  },
  skillOwned: {
    backgroundColor: colors.greenSoft,
  },
  skillMissing: {
    backgroundColor: colors.orangeSoft,
  },
  skillText: {
    ...typography.small,
    fontWeight: '700',
  },
  mutedText: {
    ...typography.small,
    color: colors.muted,
    lineHeight: 19,
  },
  bodyText: {
    ...typography.body,
    color: colors.muted,
    lineHeight: 21,
  },
  bullet: {
    flexDirection: 'row',
    gap: 8,
  },
  bulletText: {
    flex: 1,
    ...typography.small,
    color: colors.muted,
    lineHeight: 19,
  },
  companyCard: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: 16,
    gap: 10,
    ...shadow.card,
  },
  companyCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  companyLogoSmall: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  companyLogoSmallText: {
    color: colors.white,
    fontWeight: '800',
    fontSize: 13,
  },
  companyCardName: {
    ...typography.bodyStrong,
    color: colors.text,
  },
  companyCardMeta: {
    ...typography.tiny,
    color: colors.muted,
    fontWeight: '500',
    marginTop: 1,
  },
  companyAbout: {
    ...typography.small,
    color: colors.muted,
    lineHeight: 19,
  },
  websiteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  website: {
    ...typography.small,
    color: colors.blue,
    fontWeight: '600',
  },
  appliedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.greenSoft,
    borderRadius: radius.md,
    padding: 14,
  },
  appliedTitle: {
    ...typography.bodyStrong,
    color: colors.greenDark,
  },
  appliedText: {
    ...typography.tiny,
    color: colors.greenDark,
    fontWeight: '500',
    lineHeight: 15,
  },
  appliedLink: {
    ...typography.bodyStrong,
    color: colors.greenDark,
    fontWeight: '800',
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: 20,
    paddingTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    ...shadow.floating,
  },
  salaryLabel: {
    ...typography.tiny,
    color: colors.muted,
    fontWeight: '600',
  },
  salary: {
    ...typography.title,
    color: colors.navy,
    fontWeight: '800',
  },
  applyButton: {
    flex: 1,
    maxWidth: 220,
  },
});
