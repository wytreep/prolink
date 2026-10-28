import * as Crypto from 'expo-crypto';

import type { Application, CVData, Goal, Transaction } from '@/types';

function dateInMonth(month: string, day: number): string {
  const [year, m] = month.split('-').map(Number);
  return new Date(year, m - 1, day, 12).toISOString();
}

/** Movimientos de ejemplo para mostrar la regla 50/30/20 sin depender del backend. */
export function buildSampleTransactions(month: string, pending = false): Transaction[] {
  const now = new Date().toISOString();
  const base = { pending, createdAt: now };
  return [
    {
      ...base,
      clientId: Crypto.randomUUID(),
      type: 'income',
      amountCop: 1_800_000,
      description: 'Auxilio de práctica',
      date: dateInMonth(month, 1),
    },
    {
      ...base,
      clientId: Crypto.randomUUID(),
      type: 'income',
      amountCop: 250_000,
      description: 'Trabajo freelance',
      date: dateInMonth(month, 12),
    },
    {
      ...base,
      clientId: Crypto.randomUUID(),
      type: 'expense',
      bucket: 'needs',
      amountCop: 650_000,
      description: 'Arriendo',
      date: dateInMonth(month, 2),
    },
    {
      ...base,
      clientId: Crypto.randomUUID(),
      type: 'expense',
      bucket: 'needs',
      amountCop: 120_000,
      description: 'Transporte',
      date: dateInMonth(month, 3),
    },
    {
      ...base,
      clientId: Crypto.randomUUID(),
      type: 'expense',
      bucket: 'needs',
      amountCop: 180_000,
      description: 'Mercado',
      date: dateInMonth(month, 6),
    },
    {
      ...base,
      clientId: Crypto.randomUUID(),
      type: 'expense',
      bucket: 'wants',
      amountCop: 120_000,
      description: 'Comida fuera',
      date: dateInMonth(month, 7),
    },
    {
      ...base,
      clientId: Crypto.randomUUID(),
      type: 'expense',
      bucket: 'wants',
      amountCop: 19_900,
      description: 'Suscripción streaming',
      date: dateInMonth(month, 9),
    },
    {
      ...base,
      clientId: Crypto.randomUUID(),
      type: 'expense',
      bucket: 'wants',
      amountCop: 80_000,
      description: 'Salida con amigos',
      date: dateInMonth(month, 14),
    },
    {
      ...base,
      clientId: Crypto.randomUUID(),
      type: 'expense',
      bucket: 'savings',
      amountCop: 180_000,
      description: 'Ahorro meta viaje',
      date: dateInMonth(month, 5),
    },
  ];
}

export function demoApplications(): Application[] {
  return [
    {
      id: Crypto.randomUUID(),
      offerId: 'frontend-jr',
      offerTitle: 'Frontend Jr.',
      company: 'Nexora Labs',
      status: 'en_revision',
      appliedAt: '2026-10-18T12:00:00.000Z',
      matchPct: 88,
    },
    {
      id: Crypto.randomUUID(),
      offerId: 'analista-datos',
      offerTitle: 'Analista de datos',
      company: 'DataMinds',
      status: 'entrevista',
      appliedAt: '2026-10-15T12:00:00.000Z',
      matchPct: 70,
    },
    {
      id: Crypto.randomUUID(),
      offerId: 'soporte-ti',
      offerTitle: 'Soporte TI',
      company: 'CloudBridge',
      status: 'enviada',
      appliedAt: '2026-10-11T12:00:00.000Z',
      matchPct: 55,
    },
    {
      id: Crypto.randomUUID(),
      offerId: 'qa-junior',
      offerTitle: 'QA Junior',
      company: 'SoftLab',
      status: 'no_seleccionada',
      appliedAt: '2026-10-03T12:00:00.000Z',
      matchPct: 55,
    },
  ];
}

export function demoGoals(): Goal[] {
  return [
    {
      id: Crypto.randomUUID(),
      name: 'Viaje a Cartagena',
      targetCop: 1_200_000,
      savedCop: 540_000,
      deadline: '2026-12-20',
    },
    {
      id: Crypto.randomUUID(),
      name: 'Fondo de emergencia',
      targetCop: 1_000_000,
      savedCop: 250_000,
    },
  ];
}

const DEFAULT_SKILLS = [
  'React',
  'JavaScript',
  'TypeScript',
  'Git',
  'HTML',
  'CSS',
  'Node.js',
  'SQL',
  'Comunicación',
];

export function defaultCV(name: string, email: string, isDemo: boolean): CVData {
  return {
    fullName: name,
    headline: 'Ingeniería de Sistemas · 8vo semestre',
    email,
    phone: isDemo ? '+57 300 123 4567' : '',
    city: 'Cali, Colombia',
    summary:
      'Estudiante de Ingeniería de Sistemas interesada en desarrollo de producto, experiencia de usuario y análisis de datos. Busco mi primera práctica para aportar en equipos ágiles y seguir aprendiendo.',
    skills: DEFAULT_SKILLS,
    experience: isDemo
      ? [
          {
            id: Crypto.randomUUID(),
            role: 'Monitora de programación',
            company: 'UNIAJC',
            start: '2025-02',
            end: 'Actualidad',
            description:
              'Acompañamiento a estudiantes en fundamentos de programación y resolución de ejercicios en Python y JavaScript.',
          },
          {
            id: Crypto.randomUUID(),
            role: 'Desarrolladora freelance',
            company: 'Proyectos independientes',
            start: '2025-06',
            end: '2025-12',
            description:
              'Construcción de landing pages y prototipos funcionales para pequeños emprendimientos locales.',
          },
        ]
      : [],
    education: [
      {
        id: Crypto.randomUUID(),
        program: 'Ingeniería de Sistemas',
        institution: 'Institución Universitaria Antonio José Camacho',
        start: '2022',
        end: '2026',
        detail: 'Semillero de desarrollo móvil · Promedio 4.2',
      },
    ],
  };
}

export const interviewTips = [
  {
    title: 'Investiga la empresa',
    body: 'Revisa su producto, sus clientes y las noticias recientes. En la entrevista menciona algo concreto que te llame la atención.',
  },
  {
    title: 'Prepara tu historia en 90 segundos',
    body: 'Cuenta quién eres, qué estudias, qué proyecto te enorgullece y por qué esa práctica es tu siguiente paso.',
  },
  {
    title: 'Usa la técnica STAR',
    body: 'Para preguntas de comportamiento describe Situación, Tarea, Acción y Resultado. Mantén el foco en lo que aprendiste.',
  },
  {
    title: 'Lleva preguntas propias',
    body: 'Pregunta por el acompañamiento, las herramientas del equipo y cómo miden el éxito de una persona en práctica.',
  },
  {
    title: 'Cuida los detalles',
    body: 'Prueba tu conexión si es virtual, ten tu hoja de vida a mano y agradece al final por el tiempo.',
  },
];
