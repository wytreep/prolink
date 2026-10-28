import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { OfferCard } from '@/components/OfferCard';
import { AppHeader, HeaderIconButton } from '@/components/ui/AppHeader';
import { Chip } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { EmptyState, Screen } from '@/components/ui/Screen';
import { useCV } from '@/context/CVContext';
import { useOffers } from '@/context/OffersContext';
import { matchScore, offers } from '@/data/offers';
import { colors, typography } from '@/theme';

type Filter = 'Todas' | 'Remoto' | 'Híbrido' | 'Presencial' | 'Guardadas';

const FILTERS: Filter[] = ['Todas', 'Remoto', 'Híbrido', 'Presencial', 'Guardadas'];

export default function OffersScreen() {
  const { cv } = useCV();
  const { isSaved, toggleSaved, savedCount } = useOffers();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('Todas');

  const results = useMemo(() => {
    const query = search.trim().toLowerCase();
    return offers
      .map((offer) => ({ offer, match: matchScore(offer, cv.skills) }))
      .filter(({ offer }) => {
        if (filter === 'Guardadas' && !isSaved(offer.id)) return false;
        if (filter !== 'Todas' && filter !== 'Guardadas' && offer.modality !== filter) return false;
        if (!query) return true;
        const haystack = [
          offer.title,
          offer.company,
          offer.sector,
          offer.location,
          ...offer.skills,
        ]
          .join(' ')
          .toLowerCase();
        return haystack.includes(query);
      })
      .sort((a, b) => b.match - a.match);
  }, [cv.skills, filter, isSaved, search]);

  return (
    <View style={styles.screen}>
      <AppHeader
        eyebrow="Empleabilidad"
        title="Ofertas de prácticas"
        right={
          <HeaderIconButton
            icon="bookmark-outline"
            label="Ofertas guardadas"
            badge={savedCount}
            onPress={() => router.push('/ofertas/guardadas')}
          />
        }
      />
      <Screen contentStyle={styles.content}>
        <Input
          placeholder="Buscar por cargo, empresa o habilidad"
          icon="search-outline"
          value={search}
          onChangeText={setSearch}
          autoCapitalize="none"
          returnKeyType="search"
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filters}
        >
          {FILTERS.map((item) => (
            <Chip
              key={item}
              label={item}
              selected={filter === item}
              onPress={() => setFilter(item)}
              icon={item === 'Guardadas' ? 'bookmark-outline' : undefined}
            />
          ))}
        </ScrollView>

        <View style={styles.resultsHeader}>
          <Text style={styles.resultsCount}>
            {results.length} {results.length === 1 ? 'oferta' : 'ofertas'}
          </Text>
          <View style={styles.sort}>
            <Ionicons name="sparkles-outline" size={13} color={colors.greenDark} />
            <Text style={styles.sortText}>Ordenadas por compatibilidad</Text>
          </View>
        </View>

        {results.length ? (
          <View style={styles.list}>
            {results.map(({ offer, match }) => (
              <OfferCard
                key={offer.id}
                offer={offer}
                matchPct={match}
                saved={isSaved(offer.id)}
                onPress={() =>
                  router.push({ pathname: '/ofertas/[id]', params: { id: offer.id } })
                }
                onToggleSave={() => toggleSaved(offer.id)}
              />
            ))}
          </View>
        ) : (
          <EmptyState
            icon="search-outline"
            title="No encontramos ofertas"
            message="Prueba con otro cargo, empresa o cambia el filtro de modalidad."
            actionLabel="Limpiar filtros"
            onAction={() => {
              setSearch('');
              setFilter('Todas');
            }}
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
  filters: {
    gap: 8,
    paddingRight: 20,
  },
  resultsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    flexWrap: 'wrap',
  },
  resultsCount: {
    ...typography.bodyStrong,
    color: colors.text,
  },
  sort: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sortText: {
    ...typography.tiny,
    color: colors.greenDark,
    fontWeight: '600',
  },
  list: {
    gap: 12,
  },
});
