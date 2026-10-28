import type { Company, Offer } from '@/types';

export const companies: Company[] = [
  {
    id: 'nexora',
    name: 'Nexora Labs',
    sector: 'Tecnología',
    city: 'Cali',
    employees: '80 - 150',
    website: 'nexoralabs.co',
    about:
      'Productora de software enfocada en experiencias digitales para el sector educativo y financiero. Su equipo de prácticas acompaña a estudiantes durante todo el semestre.',
    color: '#3B6FB6',
    initials: 'NX',
  },
  {
    id: 'dataminds',
    name: 'DataMinds',
    sector: 'Analítica y datos',
    city: 'Bogotá',
    employees: '40 - 80',
    website: 'dataminds.co',
    about:
      'Consultora de datos que ayuda a empresas a tomar decisiones con tableros, modelos predictivos y automatización de reportes.',
    color: '#2E9E5B',
    initials: 'DM',
  },
  {
    id: 'cloudbridge',
    name: 'CloudBridge',
    sector: 'Infraestructura cloud',
    city: 'Medellín',
    employees: '120 - 200',
    website: 'cloudbridge.io',
    about:
      'Integrador de soluciones cloud para empresas de logística y retail. Trabaja con AWS, Azure y equipos de soporte en toda Latinoamérica.',
    color: '#6C5CE7',
    initials: 'CB',
  },
  {
    id: 'softlab',
    name: 'SoftLab',
    sector: 'Desarrollo de software',
    city: 'Cali',
    employees: '25 - 50',
    website: 'softlab.com.co',
    about:
      'Estudio de desarrollo ágil que construye productos para startups. Sus prácticas incluyen mentoría técnica y participación en ceremonias Scrum.',
    color: '#F4A340',
    initials: 'SL',
  },
  {
    id: 'pixelstudio',
    name: 'PixelStudio',
    sector: 'Diseño y experiencia',
    city: 'Remoto',
    employees: '10 - 25',
    website: 'pixelstudio.design',
    about:
      'Estudio de diseño de producto que trabaja con marcas de consumo. Busca perfiles curiosos, con criterio visual y ganas de investigar usuarios.',
    color: '#E05B8A',
    initials: 'PX',
  },
  {
    id: 'fintrack',
    name: 'FinTrack',
    sector: 'Fintech',
    city: 'Bogotá',
    employees: '60 - 100',
    website: 'fintrack.co',
    about:
      'Fintech de educación financiera para jóvenes. Su app ayuda a organizar ingresos, gastos y metas de ahorro.',
    color: '#1B3A6B',
    initials: 'FT',
  },
];

export const offers: Offer[] = [
  {
    id: 'frontend-jr',
    title: 'Frontend Jr.',
    companyId: 'nexora',
    company: 'Nexora Labs',
    sector: 'Tecnología',
    location: 'Cali · Remoto',
    modality: 'Remoto',
    contract: 'Medio tiempo',
    duration: '6 meses',
    salaryCop: 1_200_000,
    description:
      'Únete al equipo de producto para construir interfaces claras y accesibles con React Native y TypeScript. Tendrás un mentor técnico y participarás en las decisiones de diseño de la app.',
    responsibilities: [
      'Construir pantallas y componentes reutilizables en React Native.',
      'Traducir diseños de Figma a interfaces funcionales y accesibles.',
      'Escribir pruebas básicas y documentar los componentes.',
      'Participar en dailies, refinamientos y revisiones de código.',
    ],
    requirements: [
      'Estudiante de Ingeniería de Sistemas, Software o afines.',
      'Semestre 6 en adelante.',
      'Portafolio o proyectos académicos de frontend.',
    ],
    skills: ['React', 'TypeScript', 'Git', 'CSS', 'Testing'],
    publishedAt: '2026-10-20T12:00:00.000Z',
    logoColor: '#3B6FB6',
    initials: 'NX',
    featured: true,
  },
  {
    id: 'analista-datos',
    title: 'Analista de datos',
    companyId: 'dataminds',
    company: 'DataMinds',
    sector: 'Analítica y datos',
    location: 'Bogotá · Híbrido',
    modality: 'Híbrido',
    contract: 'Medio tiempo',
    duration: '6 meses',
    salaryCop: 1_350_000,
    description:
      'Apoya la construcción de tableros y análisis exploratorios para clientes del sector retail. Aprenderás a limpiar datos, documentar hallazgos y comunicar resultados.',
    responsibilities: [
      'Limpiar y preparar datasets para análisis.',
      'Construir tableros de seguimiento en Power BI.',
      'Documentar hallazgos y presentarlos al equipo.',
    ],
    requirements: [
      'Estudiante de último año de Ingeniería o Estadística.',
      'Conocimientos de SQL y Excel.',
      'Curiosidad por los datos y buena comunicación.',
    ],
    skills: ['SQL', 'Python', 'Power BI', 'Excel'],
    publishedAt: '2026-10-18T12:00:00.000Z',
    logoColor: '#2E9E5B',
    initials: 'DM',
    featured: true,
  },
  {
    id: 'soporte-ti',
    title: 'Soporte TI',
    companyId: 'cloudbridge',
    company: 'CloudBridge',
    sector: 'Infraestructura cloud',
    location: 'Medellín · Presencial',
    modality: 'Presencial',
    contract: 'Medio tiempo',
    duration: '4 meses',
    salaryCop: 1_000_000,
    description:
      'Acompaña al equipo de soporte en la atención de solicitudes de primer nivel y en la documentación de soluciones para clientes empresariales.',
    responsibilities: [
      'Atender tickets de primer nivel y registrar soluciones.',
      'Apoyar la configuración de equipos y accesos.',
      'Documentar procedimientos y buenas prácticas.',
    ],
    requirements: [
      'Estudiante de Ingeniería de Sistemas o afines.',
      'Conocimientos básicos de redes y Windows.',
      'Excelente actitud de servicio.',
    ],
    skills: ['Windows', 'Redes', 'SQL', 'Atención al cliente'],
    publishedAt: '2026-10-15T12:00:00.000Z',
    logoColor: '#6C5CE7',
    initials: 'CB',
  },
  {
    id: 'qa-junior',
    title: 'QA Junior',
    companyId: 'softlab',
    company: 'SoftLab',
    sector: 'Desarrollo de software',
    location: 'Cali · Híbrido',
    modality: 'Híbrido',
    contract: 'Medio tiempo',
    duration: '6 meses',
    salaryCop: 1_150_000,
    description:
      'Haz parte del equipo de calidad: diseña casos de prueba, reporta hallazgos y acompaña los despliegues de productos para startups.',
    responsibilities: [
      'Diseñar y ejecutar casos de prueba funcionales.',
      'Reportar y dar seguimiento a defectos en Jira.',
      'Apoyar pruebas de regresión antes de cada release.',
    ],
    requirements: [
      'Estudiante de Ingeniería de Sistemas o Software.',
      'Interés por la calidad de software.',
      'Atención al detalle y pensamiento crítico.',
    ],
    skills: ['Testing', 'JavaScript', 'Jira', 'Atención al detalle'],
    publishedAt: '2026-10-12T12:00:00.000Z',
    logoColor: '#F4A340',
    initials: 'SL',
  },
  {
    id: 'backend-node',
    title: 'Backend Node.js',
    companyId: 'fintrack',
    company: 'FinTrack',
    sector: 'Fintech',
    location: 'Bogotá · Remoto',
    modality: 'Remoto',
    contract: 'Pasantía',
    duration: '6 meses',
    salaryCop: 1_500_000,
    description:
      'Trabaja en los servicios que procesan movimientos financieros de miles de jóvenes. Buscamos a alguien con bases sólidas de JavaScript y ganas de aprender arquitectura backend.',
    responsibilities: [
      'Construir endpoints REST con Node.js y TypeScript.',
      'Escribir pruebas y documentar la API.',
      'Participar en revisiones de código y monitoreo.',
    ],
    requirements: [
      'Estudiante de Ingeniería de Sistemas o Software.',
      'Conocimientos de JavaScript y bases de datos.',
      'Deseable experiencia con Docker.',
    ],
    skills: ['Node.js', 'SQL', 'Docker', 'AWS'],
    publishedAt: '2026-10-10T12:00:00.000Z',
    logoColor: '#1B3A6B',
    initials: 'FT',
  },
  {
    id: 'ux-ui',
    title: 'Diseño UX/UI',
    companyId: 'pixelstudio',
    company: 'PixelStudio',
    sector: 'Diseño y experiencia',
    location: 'Remoto',
    modality: 'Remoto',
    contract: 'Medio tiempo',
    duration: '5 meses',
    salaryCop: 1_100_000,
    description:
      'Apoya la investigación de usuarios y la creación de prototipos para productos digitales de consumo. Buscamos perfiles con criterio visual y curiosidad por entender a las personas.',
    responsibilities: [
      'Realizar entrevistas y pruebas de usabilidad.',
      'Construir wireframes y prototipos en Figma.',
      'Documentar hallazgos y recomendaciones de diseño.',
    ],
    requirements: [
      'Estudiante de Diseño, Ingeniería o afines.',
      'Portafolio con al menos un proyecto de producto.',
      'Manejo básico de Figma.',
    ],
    skills: ['Figma', 'Investigación', 'Prototipado', 'Comunicación'],
    publishedAt: '2026-10-08T12:00:00.000Z',
    logoColor: '#E05B8A',
    initials: 'PX',
  },
  {
    id: 'marketing-digital',
    title: 'Marketing digital',
    companyId: 'fintrack',
    company: 'FinTrack',
    sector: 'Fintech',
    location: 'Bogotá · Híbrido',
    modality: 'Híbrido',
    contract: 'Medio tiempo',
    duration: '4 meses',
    salaryCop: 950_000,
    description:
      'Apoya las campañas de adquisición y el contenido para redes sociales de una fintech enfocada en estudiantes universitarios.',
    responsibilities: [
      'Crear y programar contenido para redes sociales.',
      'Analizar métricas de campañas y proponer mejoras.',
      'Apoyar la organización de eventos universitarios.',
    ],
    requirements: [
      'Estudiante de Comunicación, Mercadeo o afines.',
      'Manejo de redes sociales y herramientas de diseño.',
      'Buena redacción y creatividad.',
    ],
    skills: ['Redes sociales', 'Copywriting', 'Analítica', 'Diseño'],
    publishedAt: '2026-10-05T12:00:00.000Z',
    logoColor: '#1B3A6B',
    initials: 'FT',
  },
  {
    id: 'ciberseguridad',
    title: 'Analista de ciberseguridad',
    companyId: 'cloudbridge',
    company: 'CloudBridge',
    sector: 'Infraestructura cloud',
    location: 'Medellín · Híbrido',
    modality: 'Híbrido',
    contract: 'Pasantía',
    duration: '6 meses',
    salaryCop: 1_400_000,
    description:
      'Aprende a identificar vulnerabilidades y a fortalecer la postura de seguridad de clientes empresariales junto a un equipo certificado.',
    responsibilities: [
      'Apoyar revisiones de configuración y análisis de vulnerabilidades.',
      'Documentar hallazgos y recomendaciones.',
      'Participar en simulacros y capacitaciones internas.',
    ],
    requirements: [
      'Estudiante de Ingeniería de Sistemas o Ciberseguridad.',
      'Conocimientos de redes y sistemas operativos.',
      'Interés por ethical hacking.',
    ],
    skills: ['Redes', 'Linux', 'Seguridad', 'Python'],
    publishedAt: '2026-10-02T12:00:00.000Z',
    logoColor: '#6C5CE7',
    initials: 'CB',
  },
];

export function getOffer(id: string): Offer | undefined {
  return offers.find((offer) => offer.id === id);
}

export function getCompany(id: string): Company | undefined {
  return companies.find((company) => company.id === id);
}

function normalizeSkill(skill: string): string {
  return skill
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/**
 * Compatibilidad = 40% base por el perfil universitario + 60% por habilidades
 * cubiertas. Asi una oferta sin coincidencias no queda en 0 y el indicador
 * sigue siendo util para priorizar.
 */
export function matchScore(offer: Offer, cvSkills: string[]): number {
  if (!offer.skills.length) return 100;
  const owned = new Set(cvSkills.map(normalizeSkill));
  const matched = offer.skills.filter((skill) => owned.has(normalizeSkill(skill))).length;
  return Math.round(40 + (matched / offer.skills.length) * 60);
}

export function matchedSkills(offer: Offer, cvSkills: string[]): string[] {
  const owned = new Set(cvSkills.map(normalizeSkill));
  return offer.skills.filter((skill) => owned.has(normalizeSkill(skill)));
}

export function missingSkills(offer: Offer, cvSkills: string[]): string[] {
  const owned = new Set(cvSkills.map(normalizeSkill));
  return offer.skills.filter((skill) => !owned.has(normalizeSkill(skill)));
}

export const allSkills = Array.from(new Set(offers.flatMap((offer) => offer.skills))).sort((a, b) =>
  a.localeCompare(b, 'es'),
);
