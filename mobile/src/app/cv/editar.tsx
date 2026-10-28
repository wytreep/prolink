import Ionicons from '@expo/vector-icons/Ionicons';
import * as Crypto from 'expo-crypto';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { AppHeader, HeaderIconButton } from '@/components/ui/AppHeader';
import { Chip } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Screen } from '@/components/ui/Screen';
import { useCV } from '@/context/CVContext';
import { allSkills } from '@/data/offers';
import { colors, radius, typography } from '@/theme';
import type { CVData } from '@/types';

type Tab = 'profile' | 'experience' | 'education' | 'skills';

const TABS: { key: Tab; label: string }[] = [
  { key: 'profile', label: 'Perfil' },
  { key: 'experience', label: 'Experiencia' },
  { key: 'education', label: 'Educación' },
  { key: 'skills', label: 'Habilidades' },
];

const EMPTY_EXPERIENCE = { role: '', company: '', start: '', end: '', description: '' };
const EMPTY_EDUCATION = { program: '', institution: '', start: '', end: '', detail: '' };

export default function CVEditorScreen() {
  const { section } = useLocalSearchParams<{ section?: string }>();
  const { cv, updateCV } = useCV();
  const initialTab = TABS.some((tab) => tab.key === section) ? (section as Tab) : 'profile';
  const [tab, setTab] = useState<Tab>(initialTab);
  const [draft, setDraft] = useState<CVData>(cv);
  const [experience, setExperience] = useState(EMPTY_EXPERIENCE);
  const [education, setEducation] = useState(EMPTY_EDUCATION);
  const [skill, setSkill] = useState('');

  const patch = (value: Partial<CVData>) => setDraft((prev) => ({ ...prev, ...value }));

  const save = () => {
    updateCV(draft);
    Alert.alert('Cambios guardados', 'Tu hoja de vida se actualizó correctamente.', [
      { text: 'Seguir editando', style: 'cancel' },
      { text: 'Volver', onPress: () => router.back() },
    ]);
  };

  const addExperience = () => {
    if (!experience.role.trim() || !experience.company.trim()) {
      Alert.alert('Faltan datos', 'Escribe el cargo y la empresa u organización.');
      return;
    }
    patch({
      experience: [
        { ...experience, id: Crypto.randomUUID(), role: experience.role.trim() },
        ...draft.experience,
      ],
    });
    setExperience(EMPTY_EXPERIENCE);
  };

  const addEducation = () => {
    if (!education.program.trim() || !education.institution.trim()) {
      Alert.alert('Faltan datos', 'Escribe el programa y la institución.');
      return;
    }
    patch({
      education: [
        { ...education, id: Crypto.randomUUID(), program: education.program.trim() },
        ...draft.education,
      ],
    });
    setEducation(EMPTY_EDUCATION);
  };

  const addSkill = (value = skill) => {
    const clean = value.trim();
    if (!clean) return;
    const exists = draft.skills.some((item) => item.toLowerCase() === clean.toLowerCase());
    if (exists) {
      setSkill('');
      return;
    }
    patch({ skills: [...draft.skills, clean] });
    setSkill('');
  };

  const suggestions = allSkills.filter(
    (item) => !draft.skills.some((owned) => owned.toLowerCase() === item.toLowerCase()),
  );

  return (
    <View style={styles.screen}>
      <AppHeader
        title="Editar hoja de vida"
        eyebrow="Perfil profesional"
        onBack={() => router.back()}
        right={<HeaderIconButton icon="checkmark" label="Guardar cambios" onPress={save} />}
      />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Screen contentStyle={styles.content}>
          <View style={styles.tabs}>
            {TABS.map((item) => {
              const active = tab === item.key;
              return (
                <Pressable
                  key={item.key}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  onPress={() => setTab(item.key)}
                  style={[styles.tab, active && styles.tabActive]}
                >
                  <Text style={[styles.tabText, active && styles.tabTextActive]}>{item.label}</Text>
                </Pressable>
              );
            })}
          </View>

          {tab === 'profile' ? (
            <Card style={styles.form}>
              <Text style={styles.sectionTitle}>Datos personales</Text>
              <Input
                label="Nombre completo"
                value={draft.fullName}
                onChangeText={(value) => patch({ fullName: value })}
                placeholder="Laura Gómez"
                autoCapitalize="words"
              />
              <Input
                label="Titular profesional"
                value={draft.headline}
                onChangeText={(value) => patch({ headline: value })}
                placeholder="Ingeniería de Sistemas · 8vo semestre"
              />
              <Input
                label="Correo"
                value={draft.email}
                onChangeText={(value) => patch({ email: value })}
                placeholder="tu.correo@uniajc.edu.co"
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <Input
                label="Teléfono"
                value={draft.phone}
                onChangeText={(value) => patch({ phone: value })}
                placeholder="+57 300 123 4567"
                keyboardType="phone-pad"
              />
              <Input
                label="Ciudad"
                value={draft.city}
                onChangeText={(value) => patch({ city: value })}
                placeholder="Cali, Colombia"
              />
              <Input
                label="Perfil profesional"
                value={draft.summary}
                onChangeText={(value) => patch({ summary: value })}
                placeholder="Cuenta quién eres, qué estudias y qué buscas..."
                multiline
                hint="Un buen resumen tiene entre 2 y 4 frases."
              />
            </Card>
          ) : null}

          {tab === 'experience' ? (
            <View style={styles.tabContent}>
              <Text style={styles.sectionTitle}>Experiencia registrada</Text>
              {draft.experience.length ? (
                draft.experience.map((item) => (
                  <Card key={item.id} style={styles.itemCard}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.itemTitle}>{item.role}</Text>
                      <Text style={styles.itemSubtitle}>{item.company}</Text>
                      <Text style={styles.itemPeriod}>
                        {item.start} — {item.end}
                      </Text>
                    </View>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="Eliminar experiencia"
                      onPress={() =>
                        patch({
                          experience: draft.experience.filter((exp) => exp.id !== item.id),
                        })
                      }
                      style={styles.deleteButton}
                    >
                      <Ionicons name="trash-outline" size={17} color={colors.redDark} />
                    </Pressable>
                  </Card>
                ))
              ) : (
                <Text style={styles.emptyText}>
                  Aún no has agregado experiencia. Incluye monitorías, proyectos freelance,
                  voluntariados o prácticas.
                </Text>
              )}

              <Card style={styles.form}>
                <Text style={styles.sectionTitle}>Agregar experiencia</Text>
                <Input
                  label="Cargo"
                  value={experience.role}
                  onChangeText={(value) => setExperience((prev) => ({ ...prev, role: value }))}
                  placeholder="Monitora de programación"
                />
                <Input
                  label="Empresa u organización"
                  value={experience.company}
                  onChangeText={(value) => setExperience((prev) => ({ ...prev, company: value }))}
                  placeholder="UNIAJC"
                />
                <View style={styles.row}>
                  <Input
                    label="Inicio"
                    value={experience.start}
                    onChangeText={(value) => setExperience((prev) => ({ ...prev, start: value }))}
                    placeholder="2025-02"
                    containerStyle={styles.half}
                  />
                  <Input
                    label="Fin"
                    value={experience.end}
                    onChangeText={(value) => setExperience((prev) => ({ ...prev, end: value }))}
                    placeholder="Actualidad"
                    containerStyle={styles.half}
                  />
                </View>
                <Input
                  label="Descripción"
                  value={experience.description}
                  onChangeText={(value) =>
                    setExperience((prev) => ({ ...prev, description: value }))
                  }
                  placeholder="¿Qué hiciste y qué lograste?"
                  multiline
                />
                <Button
                  title="Agregar experiencia"
                  icon="add-circle-outline"
                  variant="secondary"
                  onPress={addExperience}
                  fullWidth
                />
              </Card>
            </View>
          ) : null}

          {tab === 'education' ? (
            <View style={styles.tabContent}>
              <Text style={styles.sectionTitle}>Formación registrada</Text>
              {draft.education.length ? (
                draft.education.map((item) => (
                  <Card key={item.id} style={styles.itemCard}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.itemTitle}>{item.program}</Text>
                      <Text style={styles.itemSubtitle}>{item.institution}</Text>
                      <Text style={styles.itemPeriod}>
                        {item.start} — {item.end}
                      </Text>
                    </View>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="Eliminar educación"
                      onPress={() =>
                        patch({
                          education: draft.education.filter((edu) => edu.id !== item.id),
                        })
                      }
                      style={styles.deleteButton}
                    >
                      <Ionicons name="trash-outline" size={17} color={colors.redDark} />
                    </Pressable>
                  </Card>
                ))
              ) : (
                <Text style={styles.emptyText}>Agrega tu programa académico actual.</Text>
              )}

              <Card style={styles.form}>
                <Text style={styles.sectionTitle}>Agregar formación</Text>
                <Input
                  label="Programa"
                  value={education.program}
                  onChangeText={(value) => setEducation((prev) => ({ ...prev, program: value }))}
                  placeholder="Ingeniería de Sistemas"
                />
                <Input
                  label="Institución"
                  value={education.institution}
                  onChangeText={(value) =>
                    setEducation((prev) => ({ ...prev, institution: value }))
                  }
                  placeholder="UNIAJC"
                />
                <View style={styles.row}>
                  <Input
                    label="Inicio"
                    value={education.start}
                    onChangeText={(value) => setEducation((prev) => ({ ...prev, start: value }))}
                    placeholder="2022"
                    containerStyle={styles.half}
                  />
                  <Input
                    label="Fin"
                    value={education.end}
                    onChangeText={(value) => setEducation((prev) => ({ ...prev, end: value }))}
                    placeholder="2026"
                    containerStyle={styles.half}
                  />
                </View>
                <Input
                  label="Detalle"
                  value={education.detail}
                  onChangeText={(value) => setEducation((prev) => ({ ...prev, detail: value }))}
                  placeholder="Semillero, promedio, énfasis..."
                />
                <Button
                  title="Agregar formación"
                  icon="add-circle-outline"
                  variant="secondary"
                  onPress={addEducation}
                  fullWidth
                />
              </Card>
            </View>
          ) : null}

          {tab === 'skills' ? (
            <View style={styles.tabContent}>
              <Card style={styles.form}>
                <Text style={styles.sectionTitle}>Tus habilidades</Text>
                <Text style={styles.helpText}>
                  Se usan para calcular tu compatibilidad con cada oferta.
                </Text>
                <View style={styles.skillInputRow}>
                  <Input
                    value={skill}
                    onChangeText={setSkill}
                    placeholder="Ej. React, SQL, Figma"
                    containerStyle={styles.skillInput}
                    onSubmitEditing={() => addSkill()}
                  />
                  <Button title="Agregar" onPress={() => addSkill()} />
                </View>
                <View style={styles.skills}>
                  {draft.skills.map((item) => (
                    <Pressable
                      key={item}
                      accessibilityRole="button"
                      accessibilityLabel={`Quitar ${item}`}
                      onPress={() =>
                        patch({ skills: draft.skills.filter((owned) => owned !== item) })
                      }
                      style={styles.skillChip}
                    >
                      <Text style={styles.skillChipText}>{item}</Text>
                      <Ionicons name="close" size={13} color={colors.navy} />
                    </Pressable>
                  ))}
                </View>
              </Card>

              {suggestions.length ? (
                <Card style={styles.form}>
                  <Text style={styles.sectionTitle}>Sugerencias del mercado</Text>
                  <Text style={styles.helpText}>
                    Habilidades que piden las ofertas de prácticas y aún no están en tu perfil.
                  </Text>
                  <View style={styles.suggestions}>
                    {suggestions.map((item) => (
                      <Chip key={item} label={item} onPress={() => addSkill(item)} icon="add" />
                    ))}
                  </View>
                </Card>
              ) : null}
            </View>
          ) : null}

          <Button title="Guardar cambios" icon="checkmark" onPress={save} fullWidth size="lg" />
          <Text style={styles.footer}>
            Los cambios se guardan en tu dispositivo. Al postularte, la empresa recibe la versión
            más reciente.
          </Text>
        </Screen>
      </KeyboardAvoidingView>
    </View>
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
  tabs: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: 4,
    gap: 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: radius.sm,
  },
  tabActive: {
    backgroundColor: colors.navy,
  },
  tabText: {
    ...typography.tiny,
    color: colors.muted,
    fontWeight: '700',
  },
  tabTextActive: {
    color: colors.white,
  },
  form: {
    gap: 12,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
  },
  helpText: {
    ...typography.tiny,
    color: colors.muted,
    fontWeight: '500',
    lineHeight: 15,
    marginTop: -6,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  half: {
    flex: 1,
  },
  tabContent: {
    gap: 12,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  itemTitle: {
    ...typography.bodyStrong,
    color: colors.text,
  },
  itemSubtitle: {
    ...typography.small,
    color: colors.navy,
    fontWeight: '600',
  },
  itemPeriod: {
    ...typography.tiny,
    color: colors.muted,
    fontWeight: '500',
  },
  deleteButton: {
    width: 34,
    height: 34,
    borderRadius: radius.pill,
    backgroundColor: colors.redSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    ...typography.small,
    color: colors.muted,
    lineHeight: 19,
  },
  skillInputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  skillInput: {
    flex: 1,
  },
  skills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
  },
  skillChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.ice,
    borderRadius: radius.pill,
    paddingHorizontal: 11,
    paddingVertical: 7,
  },
  skillChipText: {
    ...typography.small,
    color: colors.navy,
    fontWeight: '700',
  },
  suggestions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  footer: {
    ...typography.tiny,
    color: colors.mutedLight,
    textAlign: 'center',
    lineHeight: 16,
  },
});
