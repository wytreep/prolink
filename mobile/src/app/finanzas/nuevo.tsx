import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { AppHeader } from '@/components/ui/AppHeader';
import { Banner } from '@/components/ui/Banner';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Screen } from '@/components/ui/Screen';
import { useAuth } from '@/context/AuthContext';
import { useFinance } from '@/context/FinanceContext';
import {
  formatAmountInput,
  inputDateToIso,
  isoToInputDate,
  parseAmountInput,
  todayAtNoonIso,
} from '@/lib/format';
import { bucketMeta, colors, radius, typography } from '@/theme';
import type { Bucket, TxType } from '@/types';

export default function NewTransactionScreen() {
  const { isDemo } = useAuth();
  const { addTransaction, isOffline } = useFinance();
  const [type, setType] = useState<TxType>('expense');
  const [amount, setAmount] = useState(0);
  const [description, setDescription] = useState('');
  const [bucket, setBucket] = useState<Bucket>('needs');
  const [dateInput, setDateInput] = useState(isoToInputDate(todayAtNoonIso()));
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const setQuickDate = (daysAgo: number) => {
    const now = new Date();
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysAgo, 12);
    setDateInput(isoToInputDate(date.toISOString()));
  };

  const handleSave = async () => {
    setError(null);
    if (amount <= 0) {
      setError('Escribe un monto mayor a cero.');
      return;
    }
    if (!description.trim()) {
      setError('Agrega una descripción para identificar el movimiento.');
      return;
    }
    const isoDate = inputDateToIso(dateInput);
    if (!isoDate) {
      setError('La fecha debe tener el formato DD/MM/AAAA.');
      return;
    }

    setSaving(true);
    try {
      await addTransaction({
        type,
        amountCop: amount,
        description,
        ...(type === 'expense' ? { bucket } : {}),
        date: isoDate,
      });
      Alert.alert(
        'Movimiento guardado',
        isOffline || isDemo
          ? 'Quedó guardado en tu dispositivo. Se sincronizará cuando tengas conexión.'
          : 'Tu presupuesto se actualizó correctamente.',
        [{ text: 'Listo', onPress: () => router.back() }],
      );
    } catch {
      setError('No pudimos guardar el movimiento. Inténtalo de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.screen}>
      <AppHeader
        title="Nuevo movimiento"
        eyebrow="Finanzas personales"
        onBack={() => router.back()}
      />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Screen contentStyle={styles.content}>
          <View style={styles.typeToggle}>
            <TypeButton
              active={type === 'expense'}
              icon="arrow-up-outline"
              label="Gasto"
              onPress={() => setType('expense')}
            />
            <TypeButton
              active={type === 'income'}
              icon="arrow-down-outline"
              label="Ingreso"
              onPress={() => {
                setType('income');
                setError(null);
              }}
            />
          </View>

          {error ? <Banner tone="error" title="Revisa el movimiento" message={error} /> : null}

          <Card style={styles.amountCard}>
            <Text style={styles.amountLabel}>Monto en pesos colombianos</Text>
            <View style={styles.amountRow}>
              <Text style={styles.currency}>$</Text>
              <TextInput
                value={formatAmountInput(amount)}
                onChangeText={(text) => setAmount(parseAmountInput(text))}
                keyboardType="number-pad"
                placeholder="0"
                placeholderTextColor={colors.mutedLight}
                style={styles.amountInput}
                maxLength={15}
              />
              <Text style={styles.cop}>COP</Text>
            </View>
            <Text style={styles.amountHint}>
              {type === 'income'
                ? 'Registra auxilio de práctica, mesada o ingresos freelance.'
                : 'Los gastos se clasifican automáticamente en la regla 50/30/20.'}
            </Text>
          </Card>

          <Input
            label="Descripción"
            placeholder={type === 'income' ? 'Ej. Auxilio de práctica' : 'Ej. Arriendo'}
            icon="create-outline"
            value={description}
            onChangeText={setDescription}
            maxLength={120}
          />

          {type === 'expense' ? (
            <View style={styles.bucketSection}>
              <Text style={styles.sectionTitle}>Clasifica el gasto</Text>
              <Text style={styles.sectionHint}>
                Elegir bien la categoría mantiene tu presupuesto bajo control.
              </Text>
              <View style={styles.bucketList}>
                {(Object.keys(bucketMeta) as Bucket[]).map((key) => {
                  const meta = bucketMeta[key];
                  const selected = bucket === key;
                  return (
                    <Pressable
                      key={key}
                      accessibilityRole="button"
                      accessibilityState={{ selected }}
                      onPress={() => setBucket(key)}
                      style={[
                        styles.bucketOption,
                        selected && { borderColor: meta.color, backgroundColor: meta.soft },
                      ]}
                    >
                      <View style={[styles.bucketIcon, { backgroundColor: meta.color }]}>
                        <Ionicons name={meta.icon} size={18} color={colors.white} />
                      </View>
                      <View style={styles.bucketText}>
                        <View style={styles.bucketTitleRow}>
                          <Text style={styles.bucketTitle}>{meta.label}</Text>
                          <Text style={[styles.bucketRule, { color: meta.color }]}>
                            {meta.rule}%
                          </Text>
                        </View>
                        <Text style={styles.bucketDescription}>{meta.description}</Text>
                      </View>
                      <View
                        style={[
                          styles.radio,
                          selected && { borderColor: meta.color, backgroundColor: meta.color },
                        ]}
                      >
                        {selected ? <Ionicons name="checkmark" size={12} color={colors.white} /> : null}
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          ) : null}

          <View style={styles.dateSection}>
            <Text style={styles.sectionTitle}>Fecha</Text>
            <View style={styles.quickDates}>
              <Chip label="Hoy" onPress={() => setQuickDate(0)} />
              <Chip label="Ayer" onPress={() => setQuickDate(1)} />
            </View>
            <Input
              value={dateInput}
              onChangeText={setDateInput}
              placeholder="DD/MM/AAAA"
              icon="calendar-outline"
              keyboardType="numbers-and-punctuation"
              hint="Formato DD/MM/AAAA"
            />
          </View>

          <Banner
            tone="info"
            title="Modo offline listo"
            message={
              isOffline || isDemo
                ? 'El movimiento se guarda en tu dispositivo y se sincroniza cuando recuperes la conexión.'
                : 'Si la API no responde, el movimiento se guarda localmente y se sincroniza después.'
            }
          />

          <Button
            title={saving ? 'Guardando…' : 'Guardar movimiento'}
            icon="checkmark-circle-outline"
            onPress={handleSave}
            loading={saving}
            fullWidth
            size="lg"
          />
        </Screen>
      </KeyboardAvoidingView>
    </View>
  );
}

function TypeButton({
  active,
  icon,
  label,
  onPress,
}: {
  active: boolean;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={[styles.typeButton, active && styles.typeButtonActive]}
    >
      <Ionicons name={icon} size={18} color={active ? colors.white : colors.navy} />
      <Text style={[styles.typeText, active && styles.typeTextActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  flex: {
    flex: 1,
  },
  content: {
    gap: 16,
  },
  typeToggle: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: 4,
    gap: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 11,
    borderRadius: radius.sm,
  },
  typeButtonActive: {
    backgroundColor: colors.navy,
  },
  typeText: {
    ...typography.bodyStrong,
    color: colors.navy,
  },
  typeTextActive: {
    color: colors.white,
  },
  amountCard: {
    gap: 8,
  },
  amountLabel: {
    ...typography.tiny,
    color: colors.muted,
    fontWeight: '600',
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  currency: {
    ...typography.h1,
    color: colors.muted,
    fontWeight: '700',
  },
  amountInput: {
    flex: 1,
    fontSize: 34,
    fontWeight: '800',
    color: colors.text,
    padding: 0,
  },
  cop: {
    ...typography.small,
    color: colors.muted,
    fontWeight: '700',
  },
  amountHint: {
    ...typography.tiny,
    color: colors.muted,
    fontWeight: '500',
    lineHeight: 15,
  },
  bucketSection: {
    gap: 7,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
  },
  sectionHint: {
    ...typography.tiny,
    color: colors.muted,
    fontWeight: '500',
    lineHeight: 15,
    marginTop: -3,
  },
  bucketList: {
    gap: 8,
    marginTop: 3,
  },
  bucketOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: 12,
  },
  bucketIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bucketText: {
    flex: 1,
    gap: 2,
  },
  bucketTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  bucketTitle: {
    ...typography.bodyStrong,
    color: colors.text,
  },
  bucketRule: {
    ...typography.tiny,
    fontWeight: '800',
  },
  bucketDescription: {
    ...typography.tiny,
    color: colors.muted,
    fontWeight: '500',
    lineHeight: 15,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateSection: {
    gap: 8,
  },
  quickDates: {
    flexDirection: 'row',
    gap: 8,
  },
});
