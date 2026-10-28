import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useFinance } from '@/context/FinanceContext';
import { colors } from '@/theme';

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const { pendingCount } = useFinance();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.orangeDark,
        tabBarInactiveTintColor: colors.mutedLight,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          height: 60 + insets.bottom,
          paddingTop: 6,
          paddingBottom: insets.bottom + 6,
          backgroundColor: colors.white,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          elevation: 12,
          shadowColor: colors.navy,
          shadowOpacity: 0.06,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: -3 },
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
          marginTop: 1,
        },
        tabBarItemStyle: {
          paddingVertical: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color, focused, size }) => (
            <Ionicons
              name={focused ? 'home' : 'home-outline'}
              size={size - 1}
              color={color as string}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="ofertas"
        options={{
          title: 'Ofertas',
          tabBarIcon: ({ color, focused, size }) => (
            <Ionicons
              name={focused ? 'briefcase' : 'briefcase-outline'}
              size={size - 1}
              color={color as string}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="finanzas"
        options={{
          title: 'Finanzas',
          tabBarBadge: pendingCount > 0 ? pendingCount : undefined,
          tabBarBadgeStyle: {
            backgroundColor: colors.orange,
            color: colors.white,
            fontSize: 9,
            fontWeight: '800',
            minWidth: 16,
            height: 16,
            lineHeight: 15,
          },
          tabBarIcon: ({ color, focused, size }) => (
            <Ionicons
              name={focused ? 'wallet' : 'wallet-outline'}
              size={size - 1}
              color={color as string}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, focused, size }) => (
            <Ionicons
              name={focused ? 'person' : 'person-outline'}
              size={size - 1}
              color={color as string}
            />
          ),
        }}
      />
    </Tabs>
  );
}
