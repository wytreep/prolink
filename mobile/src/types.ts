export type User = {
  id: string;
  name: string;
  email: string;
};

export type Bucket = 'needs' | 'wants' | 'savings';
export type TxType = 'income' | 'expense';
export type BucketStatus = 'ok' | 'warning' | 'exceeded';

export type Transaction = {
  clientId: string;
  type: TxType;
  bucket?: Bucket;
  amountCop: number;
  description: string;
  /** ISO string. La app guarda las fechas al mediodia local para evitar saltos de dia. */
  date: string;
  /** true = creada en el dispositivo y aun no confirmada por la API. */
  pending: boolean;
  createdAt: string;
};

export type BucketSummary = {
  bucket: Bucket;
  targetCop: number;
  spentCop: number;
  remainingCop: number;
  usedPct: number;
  status: BucketStatus;
};

export type FinanceSummary = {
  month: string;
  incomeCop: number;
  buckets: BucketSummary[];
  totalSpentCop: number;
  balanceCop: number;
};

export type Goal = {
  id: string;
  name: string;
  targetCop: number;
  savedCop: number;
  deadline?: string;
};

export type Offer = {
  id: string;
  title: string;
  companyId: string;
  company: string;
  sector: string;
  location: string;
  modality: 'Remoto' | 'Híbrido' | 'Presencial';
  contract: 'Medio tiempo' | 'Tiempo completo' | 'Pasantía';
  duration: string;
  salaryCop: number;
  description: string;
  responsibilities: string[];
  requirements: string[];
  skills: string[];
  publishedAt: string;
  logoColor: string;
  initials: string;
  featured?: boolean;
};

export type Company = {
  id: string;
  name: string;
  sector: string;
  city: string;
  employees: string;
  website: string;
  about: string;
  color: string;
  initials: string;
};

export type ApplicationStatus = 'enviada' | 'en_revision' | 'entrevista' | 'no_seleccionada';

export type Application = {
  id: string;
  offerId: string;
  offerTitle: string;
  company: string;
  status: ApplicationStatus;
  appliedAt: string;
  matchPct: number;
};

export type Experience = {
  id: string;
  role: string;
  company: string;
  start: string;
  end: string;
  description: string;
};

export type Education = {
  id: string;
  program: string;
  institution: string;
  start: string;
  end: string;
  detail: string;
};

export type CVData = {
  fullName: string;
  headline: string;
  email: string;
  phone: string;
  city: string;
  summary: string;
  skills: string[];
  experience: Experience[];
  education: Education[];
};

export type AuthResponse = {
  token: string;
  user: User;
};

export type ApiTransaction = {
  _id?: string;
  clientId: string;
  type: TxType;
  bucket?: Bucket;
  amountCop: number;
  description: string;
  date: string;
  createdAt?: string;
};

export type ApiSummary = {
  month: string;
  incomeCop: number;
  buckets: BucketSummary[];
};

export type ApiTransactionList = {
  month: string;
  items: ApiTransaction[];
};

export type ApiSyncResult = {
  received: number;
  created: number;
  duplicates: number;
};
