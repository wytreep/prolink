import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import {
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

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function RegisterScreen() {
  const insets = useSafeAreaInsets();
  const { signUp } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    setError(null);
    if (name.trim().length < 2) {
      setError('Escribe tu nombre completo.');
      return;
    }
    if (!EMAIL_RE.test(email.trim())) {
      setError('Escribe un correo válido.');
      return;
    }
    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    if (password !== confirm) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    setLoading(true);
    try {
      await signUp(name, email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No pudimos crear tu cuenta.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />
      <View style={styles.blob} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={[
            styles.content,
            { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 32 },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Volver"
            onPress={() => router.back()}
            style={styles.back}
          >
            <Ionicons name="arrow-back" size={20} color={colors.navy} />
            <Text style={styles.backText}>Volver</Text>
          </Pressable>

          <View style={styles.brandRow}>
            <BrandMark size={48} />
            <View>
              <Text style={styles.logo}>ProLink</Text>
              <Text style={styles.brandCaption}>Tu primera práctica empieza aquí</Text>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.title}>Crea tu cuenta</Text>
            <Text style={styles.subtitle}>
              Conecta tu perfil con prácticas, habilidades y finanzas en un solo lugar.
            </Text>

            {error ? <Banner tone="error" title="Revisa los datos" message={error} /> : null}

            <Input
              label="Nombre completo"
              placeholder="Laura Gómez"
              icon="person-outline"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              autoComplete="name"
              textContentType="name"
            />
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
            />
            <Input
              label="Contraseña"
              placeholder="Mínimo 8 caracteres"
              icon="lock-closed-outline"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="new-password"
              textContentType="newPassword"
              hint="Usa al menos 8 caracteres. Puedes combinar letras y números."
            />
            <Input
              label="Confirmar contraseña"
              placeholder="Repite tu contraseña"
              icon="shield-checkmark-outline"
              value={confirm}
              onChangeText={setConfirm}
              secureTextEntry
              autoComplete="new-password"
              textContentType="newPassword"
              onSubmitEditing={handleRegister}
            />

            <Button
              title="Crear cuenta"
              onPress={handleRegister}
              loading={loading}
              fullWidth
              size="lg"
            />
            <Text style={styles.terms}>
              Al crear tu cuenta aceptas el uso de tus datos para gestionar prácticas y
              presupuesto dentro de ProLink.
            </Text>
          </View>

          <View style={styles.loginRow}>
            <Text style={styles.loginText}>¿Ya tienes cuenta?</Text>
            <Pressable accessibilityRole="button" onPress={() => router.back()}>
              <Text style={styles.loginLink}>Inicia sesión</Text>
            </Pressable>
          </View>
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
  blob: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: colors.ice,
    top: -90,
    right: -70,
  },
  content: {
    paddingHorizontal: spacing.xl,
    gap: 20,
  },
  back: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingVertical: 6,
  },
  backText: {
    ...typography.bodyStrong,
    color: colors.navy,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logo: {
    ...typography.h2,
    color: colors.navy,
  },
  brandCaption: {
    ...typography.tiny,
    color: colors.muted,
    fontWeight: '500',
    marginTop: 1,
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
  terms: {
    ...typography.tiny,
    color: colors.muted,
    lineHeight: 15,
    textAlign: 'center',
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 5,
  },
  loginText: {
    ...typography.small,
    color: colors.muted,
  },
  loginLink: {
    ...typography.small,
    color: colors.blue,
    fontWeight: '700',
  },
});
