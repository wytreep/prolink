import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandMark } from '@/components/BrandMark';
import { Button } from '@/components/ui/Button';
import { colors, radius, typography } from '@/theme';

export default function NotFoundScreen() {
  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safe}>
        <BrandMark size={62} />

        <View style={styles.icon}>
          <Ionicons name="compass-outline" size={34} color={colors.navy} />
        </View>

        <Text style={styles.code}>404</Text>
        <Text style={styles.title}>Esta pantalla no existe</Text>
        <Text style={styles.message}>
          Puede que el enlace haya cambiado o que la página se haya movido. Vuelve al inicio
          para seguir explorando ProLink.
        </Text>

        <View style={styles.actions}>
          <Button
            title="Volver al inicio"
            icon="home-outline"
            onPress={() => router.replace('/')}
            fullWidth
          />
          <Button
            title="Ver ofertas"
            variant="secondary"
            icon="briefcase-outline"
            onPress={() => router.replace('/ofertas')}
            fullWidth
          />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  safe: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingVertical: 32,
  },
  icon: {
    width: 76,
    height: 76,
    borderRadius: radius.pill,
    backgroundColor: colors.ice,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 28,
  },
  code: {
    ...typography.h1,
    color: colors.orangeDark,
    fontSize: 42,
    marginTop: 14,
  },
  title: {
    ...typography.h2,
    color: colors.text,
    textAlign: 'center',
    marginTop: 4,
  },
  message: {
    ...typography.body,
    color: colors.muted,
    textAlign: 'center',
    lineHeight: 21,
    maxWidth: 320,
    marginTop: 8,
  },
  actions: {
    alignSelf: 'stretch',
    gap: 10,
    marginTop: 28,
  },
});
