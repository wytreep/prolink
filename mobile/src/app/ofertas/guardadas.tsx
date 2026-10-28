import { router } from 'expo-router';
import { View, StyleSheet } from 'react-native';

import { OfferCard } from '@/components/OfferCard';
import { AppHeader } from '@/components/ui/AppHeader';
import { EmptyState, Screen } from '@/components/ui/Screen';
import { useCV } from '@/context/CVContext';
import { useOffers } from '@/context/OffersContext';
import { matchScore, offers } from '@/data/offers';
import { colors } from '@/theme';

export default function SavedOffersScreen() {
  const { cv } = useCV();
  const { savedOfferIds, isSaved, toggleSaved } = useOffers();
  const saved = offers
    .filter((offer) => savedOfferIds.includes(offer.id))
    .map((offer) => ({ offer, match: matchScore(offer, cv.skills) }))
    .sort((a, b) => b.match - a.match);

  return (
    <View style={styles.screen}>
      <AppHeader
        eyebrow="Empleabilidad"
        title="Ofertas guardadas"
        subtitle={`${saved.length} ${saved.length === 1 ? 'oferta guardada' : 'ofertas guardadas'}`}
        onBack={() => router.back()}
      />
      <Screen>
        {saved.length ? (
          saved.map(({ offer, match }) => (
            <OfferCard
              key={offer.id}
              offer={offer}
              matchPct={match}
              saved={isSaved(offer.id)}
              onPress={() => router.push({ pathname: '/ofertas/[id]', params: { id: offer.id } })}
              onToggleSave={() => toggleSaved(offer.id)}
            />
          ))
        ) : (
          <EmptyState
            icon="bookmark-outline"
            title="Todavía no guardas ofertas"
            message="Toca el marcador en cualquier oferta para revisarla después, incluso sin conexión."
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
});
