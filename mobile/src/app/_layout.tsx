import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider, useAuth } from '@/context/AuthContext';
import { CVProvider } from '@/context/CVContext';
import { FinanceProvider } from '@/context/FinanceContext';
import { OffersProvider } from '@/context/OffersContext';
import { colors } from '@/theme';

SplashScreen.preventAutoHideAsync().catch(() => {
  // La splash puede ya estar oculta en recargas de desarrollo.
});

function SplashController() {
  const { isLoading } = useAuth();
  useEffect(() => {
    if (!isLoading) void SplashScreen.hideAsync();
  }, [isLoading]);
  return null;
}

function RootNavigator() {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return null;

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.bg },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Protected guard={!isAuthenticated}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
      <Stack.Protected guard={isAuthenticated}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="ofertas/[id]" />
        <Stack.Screen name="ofertas/guardadas" />
        <Stack.Screen name="postulaciones" />
        <Stack.Screen name="cv/index" />
        <Stack.Screen name="cv/editar" />
        <Stack.Screen name="finanzas/nuevo" options={{ presentation: 'modal' }} />
        <Stack.Screen name="finanzas/movimientos" />
        <Stack.Screen name="finanzas/regla" />
        <Stack.Screen name="finanzas/metas" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <CVProvider>
          <OffersProvider>
            <FinanceProvider>
              <SplashController />
              <StatusBar style="light" />
              <RootNavigator />
            </FinanceProvider>
          </OffersProvider>
        </CVProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
