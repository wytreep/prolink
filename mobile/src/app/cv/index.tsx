import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { useState } from 'react';
import { Alert, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { AppHeader, HeaderIconButton } from '@/components/ui/AppHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { EmptyState, Screen, SectionHeader } from '@/components/ui/Screen';
import { useCV } from '@/context/CVContext';
import { interviewTips } from '@/data/demo';
import { initials } from '@/lib/format';
import { colors, radius, typography } from '@/theme';
import type { CVData } from '@/types';

export default function CVScreen() {
  const { cv, completeness } = useCV();
  const [downloading, setDownloading] = useState(false);
  const [openTip, setOpenTip] = useState<string | null>(null);

  const edit = (section: string) =>
    router.push({ pathname: '/cv/editar', params: { section } });

  const pdfLabel = Platform.OS === 'web' ? 'Guardar CV en PDF' : 'Descargar CV (PDF)';

  const downloadCV = async () => {
    setDownloading(true);
    try {
      const html = buildCVHtml(cv);

      // On web `Print.printAsync` prints the current page, so we render the CV in a
      // hidden iframe and send that document to the browser print dialog instead.
      if (Platform.OS === 'web') {
        await printHtmlOnWeb(html);
        return;
      }

      const { uri } = await Print.printToFileAsync({ html });
      const pdfUri = await renamePdf(uri, cv.fullName);

      if (!(await Sharing.isAvailableAsync())) {
        Alert.alert('Hoja de vida generada', `El archivo quedó en: ${pdfUri}`);
        return;
      }

      await Sharing.shareAsync(
        pdfUri,
        Platform.OS === 'ios'
          ? { UTI: 'com.adobe.pdf', dialogTitle: 'Compartir hoja de vida' }
          : { mimeType: 'application/pdf', dialogTitle: 'Compartir hoja de vida' },
      );
    } catch {
      Alert.alert(
        'No pudimos generar el PDF',
        'Revisa que tu dispositivo tenga espacio disponible e inténtalo de nuevo.',
      );
    } finally {
      setDownloading(false);
    }
  };

  return (
    <View style={styles.screen}>
      <AppHeader
        eyebrow="Perfil profesional"
        title="Mi hoja de vida"
        onBack={() => router.back()}
        right={
          <HeaderIconButton
            icon="create-outline"
            label="Editar hoja de vida"
            onPress={() => edit('profile')}
          />
        }
      />
      <Screen>
        <Card style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials(cv.fullName || 'ProLink')}</Text>
          </View>
          <Text style={styles.name}>{cv.fullName || 'Tu nombre'}</Text>
          <Text style={styles.headline}>{cv.headline || 'Agrega tu perfil profesional'}</Text>

          <View style={styles.contactList}>
            <Contact icon="mail-outline" text={cv.email || 'Agrega tu correo'} />
            <Contact icon="call-outline" text={cv.phone || 'Agrega tu teléfono'} />
            <Contact icon="location-outline" text={cv.city || 'Agrega tu ciudad'} />
          </View>

          <View style={styles.completeness}>
            <View style={styles.completenessTop}>
              <Text style={styles.completenessLabel}>Perfil completo</Text>
              <Text style={styles.completenessPct}>{completeness}%</Text>
            </View>
            <ProgressBar value={completeness} color={colors.navy} height={8} />
          </View>

          <Button
            title={downloading ? 'Generando PDF…' : pdfLabel}
            icon="download-outline"
            onPress={downloadCV}
            loading={downloading}
            fullWidth
          />
          <Button
            title="Editar hoja de vida"
            variant="secondary"
            icon="create-outline"
            onPress={() => edit('profile')}
            fullWidth
          />
        </Card>

        <SectionHeader title="Perfil profesional" actionLabel="Editar" onAction={() => edit('profile')} />
        <Card>
          <Text style={styles.bodyText}>
            {cv.summary || 'Escribe un resumen de quién eres, qué estudias y qué buscas.'}
          </Text>
        </Card>

        <SectionHeader title="Experiencia" actionLabel="Agregar" onAction={() => edit('experience')} />
        {cv.experience.length ? (
          <View style={styles.list}>
            {cv.experience.map((item) => (
              <Card key={item.id} style={styles.timelineCard}>
                <View style={styles.timelineDot} />
                <View style={styles.timelineBody}>
                  <Text style={styles.itemTitle}>{item.role}</Text>
                  <Text style={styles.itemSubtitle}>{item.company}</Text>
                  <Text style={styles.itemPeriod}>
                    {item.start} — {item.end}
                  </Text>
                  {item.description ? (
                    <Text style={styles.itemDescription}>{item.description}</Text>
                  ) : null}
                </View>
              </Card>
            ))}
          </View>
        ) : (
          <Card>
            <EmptyState
              icon="briefcase-outline"
              title="Aún no agregas experiencia"
              message="Incluye prácticas, monitorías, proyectos freelance o voluntariados."
              actionLabel="Agregar experiencia"
              onAction={() => edit('experience')}
            />
          </Card>
        )}

        <SectionHeader title="Habilidades" actionLabel="Editar" onAction={() => edit('skills')} />
        <Card>
          {cv.skills.length ? (
            <View style={styles.skills}>
              {cv.skills.map((skill) => (
                <View key={skill} style={styles.skill}>
                  <Text style={styles.skillText}>{skill}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.bodyText}>
              Agrega tus habilidades técnicas y blandas para calcular tu compatibilidad con las
              ofertas.
            </Text>
          )}
        </Card>

        <SectionHeader title="Educación" actionLabel="Agregar" onAction={() => edit('education')} />
        {cv.education.length ? (
          <View style={styles.list}>
            {cv.education.map((item) => (
              <Card key={item.id} style={styles.educationCard}>
                <View style={styles.educationIcon}>
                  <Ionicons name="school-outline" size={20} color={colors.navy} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemTitle}>{item.program}</Text>
                  <Text style={styles.itemSubtitle}>{item.institution}</Text>
                  <Text style={styles.itemPeriod}>
                    {item.start} — {item.end}
                  </Text>
                  {item.detail ? <Text style={styles.itemDescription}>{item.detail}</Text> : null}
                </View>
              </Card>
            ))}
          </View>
        ) : (
          <Card>
            <EmptyState
              icon="school-outline"
              title="Agrega tu formación"
              message="Incluye tu programa académico, institución y semestre actual."
              actionLabel="Agregar educación"
              onAction={() => edit('education')}
            />
          </Card>
        )}

        <SectionHeader title="Consejos de entrevista" />
        <Card style={styles.tipsCard}>
          {interviewTips.map((tip) => {
            const open = openTip === tip.title;
            return (
              <View key={tip.title} style={styles.tip}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ expanded: open }}
                  onPress={() => setOpenTip(open ? null : tip.title)}
                  style={styles.tipHeader}
                >
                  <View style={styles.tipIcon}>
                    <Ionicons name="bulb-outline" size={17} color={colors.orangeDark} />
                  </View>
                  <Text style={styles.tipTitle}>{tip.title}</Text>
                  <Ionicons
                    name={open ? 'chevron-up' : 'chevron-down'}
                    size={16}
                    color={colors.muted}
                  />
                </Pressable>
                {open ? <Text style={styles.tipBody}>{tip.body}</Text> : null}
              </View>
            );
          })}
        </Card>

        <Button
          title={downloading ? 'Generando PDF…' : pdfLabel}
          icon="download-outline"
          onPress={downloadCV}
          loading={downloading}
          fullWidth
        />
        <Text style={styles.footer}>
          {Platform.OS === 'web'
            ? 'Se abrirá el diálogo de impresión del navegador. Elige «Guardar como PDF» como destino.'
            : 'Tu hoja de vida se guarda en el dispositivo y se incluye al postularte.'}
        </Text>
      </Screen>
    </View>
  );
}

function Contact({ icon, text }: { icon: keyof typeof Ionicons.glyphMap; text: string }) {
  return (
    <View style={styles.contact}>
      <Ionicons name={icon} size={14} color={colors.muted} />
      <Text style={styles.contactText} numberOfLines={1}>
        {text}
      </Text>
    </View>
  );
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Renders the CV HTML in a hidden iframe so the browser prints the CV, not the app. */
function printHtmlOnWeb(html: string): Promise<void> {
  if (typeof document === 'undefined') {
    return Promise.reject(new Error('La impresión no está disponible en este navegador.'));
  }

  const frame = document.createElement('iframe');
  frame.setAttribute('aria-hidden', 'true');
  frame.style.position = 'fixed';
  frame.style.right = '0';
  frame.style.bottom = '0';
  frame.style.width = '0';
  frame.style.height = '0';
  frame.style.border = '0';
  frame.style.visibility = 'hidden';
  document.body.appendChild(frame);

  const frameWindow = frame.contentWindow;
  const frameDocument = frameWindow?.document;
  if (!frameWindow || !frameDocument) {
    frame.remove();
    return Promise.reject(new Error('No pudimos preparar la vista de impresión.'));
  }

  return new Promise<void>((resolve, reject) => {
    frameDocument.open();
    frameDocument.write(html);
    frameDocument.close();

    // Wait one frame so the browser paints the document before opening the dialog.
    frameWindow.requestAnimationFrame(() => {
      try {
        frameWindow.focus();
        frameWindow.print();
        resolve();
      } catch (error) {
        reject(error);
      } finally {
        window.setTimeout(() => frame.remove(), 1000);
      }
    });
  });
}

/** Gives the generated PDF a friendly file name, falling back to the original path. */
async function renamePdf(uri: string, fullName: string): Promise<string> {
  try {
    const { File, Paths } = await import('expo-file-system');
    const slug = fullName
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .toLowerCase();

    const source = new File(uri);
    const target = new File(Paths.cache, `hoja-de-vida-${slug || 'prolink'}.pdf`);
    if (target.exists) target.delete();
    await source.move(target);
    return target.uri;
  } catch {
    return uri;
  }
}

function buildCVHtml(cv: CVData): string {
  const skills = cv.skills.map((skill) => `<span class="chip">${escapeHtml(skill)}</span>`).join('');
  const experience = cv.experience
    .map(
      (item) => `
        <div class="item">
          <div class="item-head">
            <strong>${escapeHtml(item.role)}</strong>
            <span>${escapeHtml(item.start)} — ${escapeHtml(item.end)}</span>
          </div>
          <div class="item-sub">${escapeHtml(item.company)}</div>
          ${item.description ? `<p>${escapeHtml(item.description)}</p>` : ''}
        </div>`,
    )
    .join('');
  const education = cv.education
    .map(
      (item) => `
        <div class="item">
          <div class="item-head">
            <strong>${escapeHtml(item.program)}</strong>
            <span>${escapeHtml(item.start)} — ${escapeHtml(item.end)}</span>
          </div>
          <div class="item-sub">${escapeHtml(item.institution)}</div>
          ${item.detail ? `<p>${escapeHtml(item.detail)}</p>` : ''}
        </div>`,
    )
    .join('');

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    @page { margin: 36px; }
    * { box-sizing: border-box; }
    body { font-family: Helvetica, Arial, sans-serif; color: #1B2A41; margin: 0; font-size: 12px; line-height: 1.5; }
    .header { background: #1B3A6B; color: white; padding: 26px 28px; border-radius: 12px; }
    h1 { margin: 0; font-size: 28px; letter-spacing: -0.4px; }
    .headline { color: #F4A340; font-weight: bold; margin-top: 5px; font-size: 13px; }
    .contact { margin-top: 10px; color: #D7E2F2; font-size: 11px; }
    .contact span { margin-right: 16px; }
    h2 { color: #1B3A6B; font-size: 14px; margin: 24px 0 8px; padding-bottom: 4px; border-bottom: 2px solid #E8EFF9; text-transform: uppercase; letter-spacing: 0.7px; }
    p { margin: 4px 0; color: #4A5A70; }
    .chip { display: inline-block; background: #E8EFF9; color: #1B3A6B; border-radius: 20px; padding: 4px 10px; margin: 0 5px 5px 0; font-size: 10px; font-weight: bold; }
    .item { margin-bottom: 12px; }
    .item-head { display: flex; justify-content: space-between; gap: 12px; }
    .item-head strong { font-size: 12px; }
    .item-head span { color: #6B7A90; font-size: 10px; white-space: nowrap; }
    .item-sub { color: #1B3A6B; font-weight: bold; font-size: 11px; margin-bottom: 2px; }
    .footer { margin-top: 28px; padding-top: 10px; border-top: 1px solid #DCE5F0; color: #95A3B7; font-size: 9px; text-align: center; }
  </style>
</head>
<body>
  <div class="header">
    <h1>${escapeHtml(cv.fullName || 'Hoja de vida')}</h1>
    <div class="headline">${escapeHtml(cv.headline)}</div>
    <div class="contact">
      <span>${escapeHtml(cv.email)}</span>
      <span>${escapeHtml(cv.phone)}</span>
      <span>${escapeHtml(cv.city)}</span>
    </div>
  </div>

  ${cv.summary ? `<h2>Perfil profesional</h2><p>${escapeHtml(cv.summary)}</p>` : ''}
  ${skills ? `<h2>Habilidades</h2><div>${skills}</div>` : ''}
  ${experience ? `<h2>Experiencia</h2>${experience}` : ''}
  ${education ? `<h2>Educación</h2>${education}` : ''}

  <div class="footer">Generado con ProLink · UNIAJC · 2026</div>
</body>
</html>`;
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
    width: 76,
    height: 76,
    borderRadius: radius.pill,
    backgroundColor: colors.navy,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  avatarText: {
    color: colors.white,
    fontSize: 25,
    fontWeight: '800',
  },
  name: {
    ...typography.h2,
    color: colors.text,
  },
  headline: {
    ...typography.small,
    color: colors.navy,
    fontWeight: '600',
    textAlign: 'center',
  },
  contactList: {
    gap: 4,
    marginTop: 4,
  },
  contact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  contactText: {
    ...typography.tiny,
    color: colors.muted,
    fontWeight: '500',
  },
  completeness: {
    width: '100%',
    gap: 5,
    marginVertical: 6,
  },
  completenessTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  completenessLabel: {
    ...typography.tiny,
    color: colors.muted,
    fontWeight: '600',
  },
  completenessPct: {
    ...typography.small,
    color: colors.navy,
    fontWeight: '800',
  },
  bodyText: {
    ...typography.body,
    color: colors.muted,
    lineHeight: 21,
  },
  list: {
    gap: 10,
  },
  timelineCard: {
    flexDirection: 'row',
    gap: 10,
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.orange,
    marginTop: 5,
  },
  timelineBody: {
    flex: 1,
    gap: 2,
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
  itemDescription: {
    ...typography.small,
    color: colors.muted,
    lineHeight: 18,
    marginTop: 3,
  },
  skills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
  },
  skill: {
    backgroundColor: colors.ice,
    borderRadius: radius.pill,
    paddingHorizontal: 11,
    paddingVertical: 6,
  },
  skillText: {
    ...typography.small,
    color: colors.navy,
    fontWeight: '700',
  },
  educationCard: {
    flexDirection: 'row',
    gap: 11,
  },
  educationIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.ice,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipsCard: {
    gap: 0,
    paddingVertical: 4,
  },
  tip: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: 2,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    paddingVertical: 10,
  },
  tipIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: colors.orangeSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipTitle: {
    flex: 1,
    ...typography.small,
    color: colors.text,
    fontWeight: '700',
  },
  tipBody: {
    ...typography.small,
    color: colors.muted,
    lineHeight: 19,
    paddingBottom: 10,
    paddingLeft: 41,
  },
  footer: {
    ...typography.tiny,
    color: colors.mutedLight,
    textAlign: 'center',
    lineHeight: 16,
  },
});
