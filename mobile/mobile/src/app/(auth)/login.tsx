import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BrandMark } from '@/components/BrandMark';
import { Banner } from '@/components/ui/Banner';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/context/AuthContext';
import { colors, radius, spacing, typography } from '@/theme';

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { signIn, signInDemo } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError(null);
    if (!email.trim() || !password) {
      setError('Escribe tu correo y tu contraseña.');
      return;
    }
    setLoading(true);
    try {
      await signIn(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No pudimos iniciar sesión.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInDemo();
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />
      <View style={styles.blobOne} />
      <View style={styles.blobTwo} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={[
            styles.content,
            { paddingTop: insets.top + 36, paddingBottom: insets.bottom + 32 },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.brand}>
            <BrandMark size={68} />
            <Text style={styles.logo}>ProLink</Text>
            <Text style={styles.tagline}>Tu primera práctica empieza aquí</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.title}>Iniciar sesión</Text>
            <Text style={styles.subtitle}>
              Entra con tu correo institucional para continuar.
            </Text>

            {error ? (
              <Banner tone="error" title="No pudimos entrar" message={error} />
            ) : null}

            <Input
              label="Correo institucional"
              placeholder="tu.correo@uniajc.edu.co"
              icon="mail-outline"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              textContentType="emailAddress"
              returnKeyType="next"
            />
            <Input
              label="Contraseña"
              placeholder="Tu contraseña"
              icon="lock-closed-outline"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="password"
              textContentType="password"
              returnKeyType="done"
              onSubmitEditing={handleLogin}
            />

            <Pressable
              accessibilityRole="button"
              onPress={() =>
                Alert.alert(
                  'Recuperar contraseña',
                  'Por ahora pide apoyo a la coordinación académica para restablecer tu acceso. El envío automático de correos llegará en un próximo sprint.',
                )
              }
              style={styles.forgot}
            >
              <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
            </Pressable>

            <Button
              title="Ingresar"
              onPress={handleLogin}
              loading={loading}
              fullWidth
              size="lg"
            />
            <Button
              title="Crear cuenta"
              variant="secondary"
              onPress={() => router.push('/register')}
              fullWidth
              disabled={loading}
            />
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={handleDemo}
            disabled={loading}
            style={({ pressed }) => [styles.demo, pressed && { opacity: 0.7 }]}
          >
            <Ionicons name="flask-outline" size={17} color={colors.navy} />
            <Text style={styles.demoText}>Explorar la app en modo demo</Text>
            <Ionicons name="arrow-forward" size={15} color={colors.navy} />
          </Pressable>

          <Text style={styles.footnote}>
            ProLink · Programación en Dispositivos Móviles II{'\n'}UNIAJC · 2026-2
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
    overflow: 'hidden',
  },
  flex: {
    flex: 1,
  },
  blobOne: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: colors.ice,
    top: -100,
    right: -90,
  },
  blobTwo: {
    position: 'absolute',
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: colors.orangeSoft,
    bottom: 40,
    left: -80,
    opacity: 0.8,
  },
  content: {
    paddingHorizontal: spacing.xl,
    gap: 22,
  },
  brand: {
    alignItems: 'center',
    gap: 8,
  },
  logo: {
    ...typography.h1,
    fontSize: 34,
    color: colors.navy,
    marginTop: 4,
  },
  tagline: {
    ...typography.body,
    color: colors.muted,
    textAlign: 'center',
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    padding: 20,
    gap: 14,
    shadowColor: colors.navy,
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  title: {
    ...typography.h2,
    color: colors.text,
  },
  subtitle: {
    ...typography.small,
    color: colors.muted,
    lineHeight: 18,
    marginTop: -8,
  },
  forgot: {
    alignSelf: 'flex-end',
    paddingVertical: 2,
  },
  forgotText: {
    ...typography.small,
    color: colors.blue,
    fontWeight: '600',
  },
  demo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: radius.md,
  },
  demoText: {
    ...typography.bodyStrong,
    color: colors.navy,
  },
  footnote: {
    ...typography.tiny,
    color: colors.mutedLight,
    textAlign: 'center',
    lineHeight: 16,
  },
});
