import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { AppHeader, HeaderIconButton } from '@/components/ui/AppHeader';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, StatTile } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Screen, SectionHeader } from '@/components/ui/Screen';
import { useAuth } from '@/context/AuthContext';
import { useCV } from '@/context/CVContext';
import { useFinance } from '@/context/FinanceContext';
import { useOffers } from '@/context/OffersContext';
import { API_BASE_URL } from '@/lib/api';
import { initials } from '@/lib/format';
import { colors, radius, typography } from '@/theme';

export default function ProfileScreen() {
  const { user, isDemo, signOut } = useAuth();
  const { cv, completeness } = useCV();
  const { applications, savedCount } = useOffers();
  const { pendingCount, isOffline } = useFinance();

  const handleSignOut = () => {
    Alert.alert(
      'Cerrar sesión',
      'Tus datos locales seguirán guardados en este dispositivo. Podrás volver a entrar cuando quieras.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Cerrar sesión', style: 'destructive', onPress: () => void signOut() },
      ],
    );
  };

  return (
    <View style={styles.screen}>
      <AppHeader
        eyebrow="Cuenta"
        title="Mi perfil"
        right={
          <HeaderIconButton
            icon="create-outline"
            label="Editar hoja de vida"
            onPress={() => router.push('/cv/editar')}
          />
        }
      />
      <Screen>
        <Card style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials(user?.name ?? 'ProLink')}</Text>
          </View>
          <Text style={styles.name}>{user?.name ?? 'Estudiante'}</Text>
          <Text style={styles.email}>{user?.email}</Text>
          <Text style={styles.headline}>{cv.headline}</Text>
          <View style={styles.badges}>
            <Badge
              label={isDemo ? 'Modo demo' : 'Sesión activa'}
              tone={isDemo ? 'orange' : 'green'}
              icon={isDemo ? 'flask-outline' : 'shield-checkmark-outline'}
            />
            <Badge label={`${completeness}% CV`} tone="navy" icon="document-text-outline" />
          </View>
          <Button
            title="Editar perfil y hoja de vida"
            variant="secondary"
            icon="create-outline"
            onPress={() => router.push('/cv/editar')}
            fullWidth
          />
        </Card>

        <View style={styles.statsRow}>
          <StatTile
            icon="send-outline"
            label="Postulaciones"
            value={String(applications.length)}
            tone="navy"
          />
          <StatTile
            icon="bookmark-outline"
            label="Guardadas"
            value={String(savedCount)}
            tone="orange"
          />
          <StatTile
            icon="checkmark-circle-outline"
            label="CV completo"
            value={`${completeness}%`}
            tone="green"
          />
        </View>

        <Card style={styles.cvProgress}>
          <View style={styles.cvProgressTop}>
            <View style={styles.cvProgressIcon}>
              <Ionicons name="document-text-outline" size={20} color={colors.navy} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cvProgressTitle}>Tu hoja de vida</Text>
              <Text style={styles.cvProgressText}>
                {completeness >= 100
                  ? 'Lista para descargar y compartir con las empresas.'
                  : 'Completa las secciones para aumentar tu compatibilidad.'}
              </Text>
            </View>
            <Text style={styles.cvPct}>{completeness}%</Text>
          </View>
          <ProgressBar value={completeness} color={colors.navy} height={8} />
        </Card>

        <SectionHeader title="Mi actividad" />
        <Card padded={false} style={styles.menu}>
          <MenuItem
            icon="document-text-outline"
            label="Mi hoja de vida"
            description="Perfil, experiencia, educación y habilidades"
            onPress={() => router.push('/cv')}
          />
          <MenuItem
            icon="send-outline"
            label="Mis postulaciones"
            description="Sigue el estado de cada proceso"
            onPress={() => router.push('/postulaciones')}
          />
          <MenuItem
            icon="bookmark-outline"
            label="Ofertas guardadas"
            description="Disponibles incluso sin conexión"
            onPress={() => router.push('/ofertas/guardadas')}
          />
        </Card>

        <SectionHeader title="Mis finanzas" />
        <Card padded={false} style={styles.menu}>
          <MenuItem
            icon="pie-chart-outline"
            label="Regla 50/30/20"
            description="Cómo se reparte tu presupuesto"
            onPress={() => router.push('/finanzas/regla')}
          />
          <MenuItem
            icon="flag-outline"
            label="Metas de ahorro"
            description="Crea y sigue tus objetivos"
            onPress={() => router.push('/finanzas/metas')}
          />
          <MenuItem
            icon="receipt-outline"
            label="Movimientos del mes"
            description="Ingresos, gastos y pendientes"
            onPress={() => router.push('/finanzas/movimientos')}
          />
        </Card>

        <SectionHeader title="Datos y conexión" />
        <Card style={styles.infoCard}>
          <InfoRow
            icon={isOffline ? 'cloud-offline-outline' : 'cloud-done-outline'}
            label="Estado"
            value={isOffline ? 'Sin conexión' : 'En línea'}
            tone={isOffline ? 'orange' : 'green'}
          />
          <InfoRow
            icon="sync-outline"
            label="Movimientos pendientes"
            value={String(pendingCount)}
            tone={pendingCount ? 'orange' : 'green'}
          />
          <InfoRow
            icon="server-outline"
            label="API"
            value={API_BASE_URL.replace('http://', '').replace('https://', '')}
            tone="navy"
          />
          <InfoRow icon="information-circle-outline" label="Versión" value="1.0.0" tone="navy" />
        </Card>

        <Button
          title="Cerrar sesión"
          variant="danger"
          icon="log-out-outline"
          onPress={handleSignOut}
          fullWidth
        />

        <Text style={styles.footer}>
          ProLink · Equipo NOVAFORCE{'\n'}UNIAJC · Programación en Dispositivos Móviles II
        </Text>
      </Screen>
    </View>
  );
}

function MenuItem({
  icon,
  label,
  description,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  description: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.menuItem, pressed && { backgroundColor: colors.ice2 }]}
    >
      <View style={styles.menuIcon}>
        <Ionicons name={icon} size={19} color={colors.navy} />
      </View>
      <View style={styles.menuText}>
        <Text style={styles.menuLabel}>{label}</Text>
        <Text style={styles.menuDescription}>{description}</Text>
      </View>
      <Ionicons name="chevron-forward" size={17} color={colors.mutedLight} />
    </Pressable>
  );
}

function InfoRow({
  icon,
  label,
  value,
  tone,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  tone: 'navy' | 'green' | 'orange';
}) {
  const color = {
    navy: colors.navy,
    green: colors.greenDark,
    orange: colors.orangeDark,
  }[tone];
  return (
    <View style={styles.infoRow}>
      <Ionicons name={icon} size={17} color={color} />
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={[styles.infoValue, { color }]} numberOfLines={1}>
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
  profileCard: {
    alignItems: 'center',
    gap: 6,
  },
  avatar: {
    width: 78,
    height: 78,
    borderRadius: radius.pill,
    backgroundColor: colors.orange,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  avatarText: {
    color: colors.white,
    fontSize: 26,
    fontWeight: '800',
  },
  name: {
    ...typography.h2,
    color: colors.text,
  },
  email: {
    ...typography.small,
    color: colors.muted,
    fontWeight: '500',
  },
  headline: {
    ...typography.small,
    color: colors.navy,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 2,
  },
  badges: {
    flexDirection: 'row',
    gap: 6,
    marginVertical: 4,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  cvProgress: {
    gap: 10,
  },
  cvProgressTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  cvProgressIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: colors.ice,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cvProgressTitle: {
    ...typography.bodyStrong,
    color: colors.text,
  },
  cvProgressText: {
    ...typography.tiny,
    color: colors.muted,
    fontWeight: '500',
    lineHeight: 15,
  },
  cvPct: {
    ...typography.title,
    color: colors.navy,
    fontWeight: '800',
  },
  menu: {
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: colors.ice,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuText: {
    flex: 1,
    gap: 1,
  },
  menuLabel: {
    ...typography.bodyStrong,
    color: colors.text,
  },
  menuDescription: {
    ...typography.tiny,
    color: colors.muted,
    fontWeight: '500',
  },
  infoCard: {
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoLabel: {
    flex: 1,
    ...typography.small,
    color: colors.muted,
    fontWeight: '600',
  },
  infoValue: {
    ...typography.tiny,
    fontWeight: '700',
    maxWidth: '55%',
  },
  footer: {
    ...typography.tiny,
    color: colors.mutedLight,
    textAlign: 'center',
    lineHeight: 16,
    marginTop: 4,
  },
});
