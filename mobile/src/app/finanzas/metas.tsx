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

import { AppHeader, HeaderIconButton } from '@/components/ui/AppHeader';
import { Badge, Chip } from '@/components/ui/Badge';
import { Banner } from '@/components/ui/Banner';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Screen, SectionHeader } from '@/components/ui/Screen';
import { useAuth } from '@/context/AuthContext';
import { useFinance } from '@/context/FinanceContext';
import {
  formatAmountInput,
  formatCOP,
  formatDate,
  inputDateToIso,
  parseAmountInput,
} from '@/lib/format';
import { colors, radius, typography } from '@/theme';
import type { Goal } from '@/types';

const QUICK_CONTRIBUTIONS = [50_000, 100_000, 200_000];

/** Las fechas sin hora se interpretan al mediodía para no saltar de día por zona horaria. */
function deadlineLabel(deadline?: string): string | null {
  if (!deadline) return null;
  const normalized = /^\d{4}-\d{2}-\d{2}$/.test(deadline)
    ? `${deadline}T12:00:00`
    : deadline;
  return formatDate(normalized);
}

export default function GoalsScreen() {
  const { goals, addGoal, contributeToGoal, deleteGoal } = useFinance();
  const { isDemo } = useAuth();

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [target, setTarget] = useState(0);
  const [initial, setInitial] = useState(0);
  const [deadline, setDeadline] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const [contributingId, setContributingId] = useState<string | null>(null);
  const [contribution, setContribution] = useState(0);
  const [contributionError, setContributionError] = useState<string | null>(null);

  const totalTarget = goals.reduce((sum, goal) => sum + goal.targetCop, 0);
  const totalSaved = goals.reduce((sum, goal) => sum + goal.savedCop, 0);
  const totalPct = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;
  const completed = goals.filter((goal) => goal.savedCop >= goal.targetCop).length;
  const formVisible = showForm || goals.length === 0;

  const handleCreate = () => {
    setFormError(null);
    if (!name.trim()) {
      setFormError('Ponle un nombre a tu meta.');
      return;
    }
    if (target <= 0) {
      setFormError('Define un monto objetivo mayor a cero.');
      return;
    }
    if (initial > target) {
      setFormError('El ahorro inicial no puede superar el monto objetivo.');
      return;
    }
    let deadlineIso: string | undefined;
    if (deadline.trim()) {
      const parsed = inputDateToIso(deadline);
      if (!parsed) {
        setFormError('La fecha límite debe tener el formato DD/MM/AAAA.');
        return;
      }
      deadlineIso = parsed;
    }

    addGoal({
      name: name.trim(),
      targetCop: target,
      savedCop: Math.min(initial, target),
      ...(deadlineIso ? { deadline: deadlineIso } : {}),
    });

    setName('');
    setTarget(0);
    setInitial(0);
    setDeadline('');
    setShowForm(false);
    Alert.alert('Meta creada', 'Ya puedes aportar a tu meta desde esta pantalla.');
  };

  const toggleContribution = (goal: Goal) => {
    if (contributingId === goal.id) {
      setContributingId(null);
      setContribution(0);
      setContributionError(null);
      return;
    }
    setContributingId(goal.id);
    setContribution(0);
    setContributionError(null);
  };

  const handleContribute = (goal: Goal) => {
    const remaining = Math.max(0, goal.targetCop - goal.savedCop);
    if (remaining <= 0) {
      setContributionError('Esta meta ya está cumplida.');
      return;
    }
    if (contribution <= 0) {
      setContributionError('Escribe un monto mayor a cero.');
      return;
    }
    const amount = Math.min(contribution, remaining);
    contributeToGoal(goal.id, amount);
    setContributingId(null);
    setContribution(0);
    setContributionError(null);

    if (amount >= remaining) {
      Alert.alert(
        '¡Meta cumplida!',
        `Completaste "${goal.name}". Puedes crear una nueva meta o seguir ahorrando.`,
      );
    }
  };

  const handleDelete = (goal: Goal) => {
    Alert.alert(
      'Eliminar meta',
      `Se eliminará "${goal.name}" y su registro de ahorro de este dispositivo.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: () => deleteGoal(goal.id) },
      ],
    );
  };

  return (
    <View style={styles.screen}>
      <AppHeader
        eyebrow="Finanzas personales"
        title="Metas de ahorro"
        subtitle={
          goals.length
            ? `${goals.length} ${goals.length === 1 ? 'meta activa' : 'metas activas'}`
            : 'Tu primer objetivo te espera'
        }
        onBack={() => router.back()}
        right={
          <HeaderIconButton
            icon="add"
            label="Nueva meta"
            onPress={() => setShowForm(true)}
          />
        }
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Screen contentStyle={styles.content}>
          {isDemo ? (
            <Banner
              tone="demo"
              title="Modo demo"
              message="Tus metas se guardan solo en este dispositivo. Inicia sesión para conservarlas en tu cuenta."
            />
          ) : null}

          <Card style={styles.summaryCard}>
            <View style={styles.summaryTop}>
              <View style={styles.summaryIcon}>
                <Ionicons name="flag" size={22} color={colors.greenDark} />
              </View>
              <View style={styles.summaryText}>
                <Text style={styles.summaryLabel}>Ahorro total</Text>
                <Text style={styles.summaryValue}>{formatCOP(totalSaved)}</Text>
                <Text style={styles.summaryHint}>
                  de {formatCOP(totalTarget)} en {goals.length}{' '}
                  {goals.length === 1 ? 'meta' : 'metas'}
                </Text>
              </View>
              <Text style={styles.summaryPct}>{Math.round(totalPct)}%</Text>
            </View>

            <ProgressBar value={totalPct} color={colors.green} height={10} />

            <View style={styles.summaryStats}>
              <SummaryStat label="Metas" value={String(goals.length)} />
              <View style={styles.summaryDivider} />
              <SummaryStat label="Cumplidas" value={String(completed)} />
              <View style={styles.summaryDivider} />
              <SummaryStat
                label="Por ahorrar"
                value={formatCOP(Math.max(0, totalTarget - totalSaved))}
              />
            </View>
          </Card>

          <SectionHeader
            title="Tus metas"
            actionLabel={
              goals.length > 0 ? (showForm ? 'Cerrar formulario' : 'Nueva meta') : undefined
            }
            onAction={
              goals.length > 0 ? () => setShowForm((prev) => !prev) : undefined
            }
          />

          {goals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              expanded={contributingId === goal.id}
              contribution={contribution}
              error={contributingId === goal.id ? contributionError : null}
              onToggle={() => toggleContribution(goal)}
              onChangeContribution={setContribution}
              onConfirm={() => handleContribute(goal)}
              onDelete={() => handleDelete(goal)}
            />
          ))}

          {formVisible ? (
            <Card style={styles.formCard}>
              <View style={styles.formHeader}>
                <View style={styles.formIcon}>
                  <Ionicons name="add-circle-outline" size={21} color={colors.orangeDark} />
                </View>
                <View style={styles.formHeading}>
                  <Text style={styles.formTitle}>Nueva meta</Text>
                  <Text style={styles.formSubtitle}>
                    Define el objetivo y tu punto de partida.
                  </Text>
                </View>
              </View>

              {formError ? (
                <Banner tone="error" title="Revisa los datos" message={formError} />
              ) : null}

              <Input
                label="Nombre de la meta"
                placeholder="Ej. Viaje a Cartagena"
                icon="flag-outline"
                value={name}
                onChangeText={setName}
                maxLength={60}
              />

              <AmountField
                label="Monto objetivo"
                value={target}
                onChange={setTarget}
              />

              <AmountField
                label="Ahorro inicial (opcional)"
                value={initial}
                onChange={setInitial}
                hint="Si ya tienes algo ahorrado, regístralo aquí."
              />

              <Input
                label="Fecha límite (opcional)"
                placeholder="DD/MM/AAAA"
                icon="calendar-outline"
                keyboardType="numbers-and-punctuation"
                value={deadline}
                onChangeText={setDeadline}
                hint="Déjala vacía si aún no tienes una fecha."
              />

              <Button
                title="Crear meta"
                icon="checkmark-circle-outline"
                onPress={handleCreate}
                fullWidth
              />

              {goals.length > 0 ? (
                <Button
                  title="Cancelar"
                  variant="ghost"
                  onPress={() => {
                    setShowForm(false);
                    setFormError(null);
                  }}
                  fullWidth
                />
              ) : null}
            </Card>
          ) : null}

          <Card style={styles.tipCard}>
            <View style={styles.tipIcon}>
              <Ionicons name="information-circle-outline" size={20} color={colors.blue} />
            </View>
            <View style={styles.tipText}>
              <Text style={styles.tipTitle}>El ahorro sale de tu 20%</Text>
              <Text style={styles.tipBody}>
                La regla 50/30/20 sugiere destinar una quinta parte de tus ingresos al ahorro.
                Puedes repartirlo entre varias metas.
              </Text>
            </View>
          </Card>

          <Button
            title="Ver la regla 50/30/20"
            variant="secondary"
            icon="pie-chart-outline"
            onPress={() => router.push('/finanzas/regla')}
            fullWidth
          />
        </Screen>
      </KeyboardAvoidingView>
    </View>
  );
}

function SummaryStat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.summaryStat}>
      <Text style={styles.summaryStatLabel}>{label}</Text>
      <Text style={styles.summaryStatValue} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

function AmountField({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  hint?: string;
}) {
  return (
    <View style={styles.amountField}>
      <Text style={styles.amountLabel}>{label}</Text>
      <View style={styles.amountBox}>
        <Text style={styles.currency}>$</Text>
        <TextInput
          value={formatAmountInput(value)}
          onChangeText={(text) => onChange(parseAmountInput(text))}
          keyboardType="number-pad"
          placeholder="0"
          placeholderTextColor={colors.mutedLight}
          style={styles.amountInput}
          maxLength={12}
        />
        <Text style={styles.cop}>COP</Text>
      </View>
      {hint ? <Text style={styles.amountHint}>{hint}</Text> : null}
    </View>
  );
}

function GoalCard({
  goal,
  expanded,
  contribution,
  error,
  onToggle,
  onChangeContribution,
  onConfirm,
  onDelete,
}: {
  goal: Goal;
  expanded: boolean;
  contribution: number;
  error: string | null;
  onToggle: () => void;
  onChangeContribution: (value: number) => void;
  onConfirm: () => void;
  onDelete: () => void;
}) {
  const pct = goal.targetCop > 0 ? Math.min(100, (goal.savedCop / goal.targetCop) * 100) : 0;
  const isCompleted = goal.savedCop >= goal.targetCop;
  const remaining = Math.max(0, goal.targetCop - goal.savedCop);
  const deadline = deadlineLabel(goal.deadline);

  return (
    <Card style={styles.goalCard}>
      <View style={styles.goalTop}>
        <View style={[styles.goalIcon, isCompleted && styles.goalIconDone]}>
          <Ionicons
            name={isCompleted ? 'checkmark-circle' : 'flag-outline'}
            size={20}
            color={isCompleted ? colors.greenDark : colors.navy}
          />
        </View>
        <View style={styles.goalInfo}>
          <Text style={styles.goalName} numberOfLines={1}>
            {goal.name}
          </Text>
          <Text style={styles.goalDeadline}>
            {deadline ? `Meta para ${deadline}` : 'Sin fecha límite'}
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Eliminar ${goal.name}`}
          hitSlop={8}
          onPress={onDelete}
          style={({ pressed }) => [styles.deleteButton, pressed && { opacity: 0.6 }]}
        >
          <Ionicons name="trash-outline" size={18} color={colors.muted} />
        </Pressable>
      </View>

      <View style={styles.goalAmounts}>
        <View style={styles.goalAmountText}>
          <Text style={styles.goalSaved}>{formatCOP(goal.savedCop)}</Text>
          <Text style={styles.goalTarget}>de {formatCOP(goal.targetCop)}</Text>
        </View>
        <Badge
          label={isCompleted ? 'Cumplida' : `${Math.round(pct)}%`}
          tone={isCompleted ? 'green' : 'navy'}
        />
      </View>

      <ProgressBar
        value={pct}
        color={isCompleted ? colors.greenDark : colors.green}
        height={9}
      />

      <View style={styles.goalBottom}>
        <Text style={styles.goalRemaining}>
          {isCompleted
            ? '¡Lo lograste! Puedes crear otra meta.'
            : `Te faltan ${formatCOP(remaining)}`}
        </Text>
        {!isCompleted ? (
          <Pressable
            accessibilityRole="button"
            onPress={onToggle}
            style={({ pressed }) => [pressed && { opacity: 0.6 }]}
          >
            <Text style={styles.goalAction}>{expanded ? 'Cancelar' : 'Aportar'}</Text>
          </Pressable>
        ) : null}
      </View>

      {expanded && !isCompleted ? (
        <View style={styles.contribution}>
          <View style={styles.amountBox}>
            <Text style={styles.currency}>$</Text>
            <TextInput
              value={formatAmountInput(contribution)}
              onChangeText={(text) => onChangeContribution(parseAmountInput(text))}
              keyboardType="number-pad"
              placeholder="0"
              placeholderTextColor={colors.mutedLight}
              style={styles.contributionInput}
              maxLength={12}
            />
            <Text style={styles.cop}>COP</Text>
          </View>

          <View style={styles.quickRow}>
            {QUICK_CONTRIBUTIONS.map((value) => (
              <Chip
                key={value}
                label={`${value / 1000}k`}
                onPress={() => onChangeContribution(Math.min(value, remaining))}
              />
            ))}
            <Chip
              label="Restante"
              onPress={() => onChangeContribution(remaining)}
            />
          </View>

          {error ? <Text style={styles.contributionError}>{error}</Text> : null}

          <Button
            title="Confirmar aporte"
            icon="arrow-down-circle-outline"
            onPress={onConfirm}
            fullWidth
          />
        </View>
      ) : null}
    </Card>
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
  summaryCard: {
    gap: 13,
  },
  summaryTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  summaryIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.greenSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryText: {
    flex: 1,
    gap: 1,
  },
  summaryLabel: {
    ...typography.tiny,
    color: colors.muted,
    fontWeight: '600',
  },
  summaryValue: {
    ...typography.h2,
    color: colors.text,
  },
  summaryHint: {
    ...typography.tiny,
    color: colors.muted,
    fontWeight: '500',
  },
  summaryPct: {
    ...typography.title,
    color: colors.greenDark,
    fontWeight: '800',
  },
  summaryStats: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.ice2,
    borderRadius: radius.md,
    paddingVertical: 10,
  },
  summaryStat: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 6,
  },
  summaryStatLabel: {
    ...typography.tiny,
    color: colors.muted,
    fontWeight: '600',
  },
  summaryStatValue: {
    ...typography.small,
    color: colors.text,
    fontWeight: '800',
  },
  summaryDivider: {
    width: 1,
    height: 28,
    backgroundColor: colors.border,
  },
  goalCard: {
    gap: 11,
  },
  goalTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  goalIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: colors.ice,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalIconDone: {
    backgroundColor: colors.greenSoft,
  },
  goalInfo: {
    flex: 1,
    gap: 1,
  },
  goalName: {
    ...typography.title,
    color: colors.text,
  },
  goalDeadline: {
    ...typography.tiny,
    color: colors.muted,
    fontWeight: '500',
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.ice2,
  },
  goalAmounts: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 8,
  },
  goalAmountText: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 5,
    flexShrink: 1,
  },
  goalSaved: {
    ...typography.h3,
    color: colors.text,
  },
  goalTarget: {
    ...typography.small,
    color: colors.muted,
    fontWeight: '600',
  },
  goalBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  goalRemaining: {
    flex: 1,
    ...typography.tiny,
    color: colors.muted,
    fontWeight: '500',
  },
  goalAction: {
    ...typography.small,
    color: colors.blue,
    fontWeight: '800',
  },
  contribution: {
    gap: 9,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  quickRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
  },
  contributionError: {
    ...typography.tiny,
    color: colors.redDark,
    fontWeight: '600',
  },
  formCard: {
    gap: 13,
  },
  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  formIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: colors.orangeSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formHeading: {
    flex: 1,
    gap: 1,
  },
  formTitle: {
    ...typography.title,
    color: colors.text,
  },
  formSubtitle: {
    ...typography.tiny,
    color: colors.muted,
    fontWeight: '500',
  },
  amountField: {
    gap: 6,
  },
  amountLabel: {
    ...typography.small,
    color: colors.text,
    fontWeight: '700',
    marginLeft: 2,
  },
  amountBox: {
    minHeight: 52,
    borderRadius: radius.md,
    backgroundColor: colors.ice2,
    borderWidth: 1.5,
    borderColor: 'transparent',
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  currency: {
    ...typography.h3,
    color: colors.muted,
    fontWeight: '700',
  },
  amountInput: {
    flex: 1,
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
    padding: 0,
  },
  contributionInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
    padding: 0,
  },
  cop: {
    ...typography.tiny,
    color: colors.muted,
    fontWeight: '700',
  },
  amountHint: {
    ...typography.tiny,
    color: colors.muted,
    fontWeight: '500',
    marginLeft: 2,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  tipIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#E4EEFB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipText: {
    flex: 1,
    gap: 2,
  },
  tipTitle: {
    ...typography.bodyStrong,
    color: colors.text,
  },
  tipBody: {
    ...typography.tiny,
    color: colors.muted,
    fontWeight: '500',
    lineHeight: 15,
  },
});
