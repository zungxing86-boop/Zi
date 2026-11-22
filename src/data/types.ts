export type AnalyticalGroupId =
  | 'bio-biotech'
  | 'vital-env'
  | 'natural-tech'
  | 'crossborder-sec-soc'
  | 'cbrn-specialized';

export type BiosecurityTierId = 'A' | 'B' | 'C';

export type HazardFamilyCode =
  | 'BIO'
  | 'CHE'
  | 'RAD'
  | 'BTE'
  | 'WAT'
  | 'AGR'
  | 'ECO'
  | 'CLI'
  | 'GEO'
  | 'IND'
  | 'CYB'
  | 'SPA'
  | 'SUP'
  | 'DEM'
  | 'SEC'
  | 'GOV'
  | 'SOC'
  | 'OCC';

export interface AnalyticalGroupMeta {
  id: AnalyticalGroupId;
  name: string;
  shortName: string;
  families: HazardFamilyCode[];
  atlasRole: string;
  color: string;
  colorDark: string;
  bgSoft: string;
  textClass: string;
  borderClass: string;
}

export interface HazardFamily {
  code: HazardFamilyCode;
  name: string;
  shortName: string;
  sampleScope: string;
  biosecurityPosition: string;
  tier: BiosecurityTierId;
  group: AnalyticalGroupId;
  isAddedInMerged: boolean;
}

export interface SubHazard {
  code: string;
  familyCode: HazardFamilyCode;
  title: string;
  exposedOrPathways: string;
  exposedLabel: 'مسیرهای اصلی خطر' | 'حوزه‌های در معرض';
  consequences?: string;
  agencies: string;
  indicators: string;
}

export interface Megachallenge {
  code: string;
  title: string;
  definition: string;
  indicators: string;
  connectedFamilies: HazardFamilyCode[];
  primaryRelation: string;
}

export interface ScenarioStep {
  stage: 'محرک آغازگر' | 'رخداد میانی' | 'نقطه انتقال' | 'پیامد';
  text: string;
  controlPoint: string;
}

export interface CascadingScenario {
  code: string;
  title: string;
  chainText: string;
  steps: ScenarioStep[];
  involvedFamiliesText: string;
  familyCodes: HazardFamilyCode[];
  monitoringAxes: string;
  isNatech?: boolean;
  connectedMegachallenges: string[];
}

export interface RiskCriterion {
  id: string;
  title: string;
  question: string;
  lowNote: string;
  highNote: string;
}

export interface WarningLevel {
  id: 'green' | 'yellow' | 'orange' | 'red';
  colorName: string;
  title: string;
  status: string;
  action: string;
  hex: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
}

export interface AgencyDomain {
  id: string;
  domain: string;
  agencies: string;
  dominantRole: string;
  matchKeywords: string[];
  color: string;
}

export type DashboardSectionId =
  | 'overview'
  | 'atlas'
  | 'megachallenges'
  | 'risk-lab'
  | 'biosecurity'
  | 'governance'
  | 'roadmap';

export const ANALYTICAL_GROUPS: Record<AnalyticalGroupId, AnalyticalGroupMeta> = {
  'bio-biotech': {
    id: 'bio-biotech',
    name: 'زیستی و زیست‌فناورانه',
    shortName: 'زیستی و زیست‌فناوری',
    families: ['BIO', 'BTE'],
    atlasRole: 'پوشش هسته مستقیم امنیت زیستی و مخاطرات نوظهور زیستی',
    color: '#0D9488',
    colorDark: '#2DD4BF',
    bgSoft: 'bg-teal-50 dark:bg-teal-950/40',
    textClass: 'text-teal-700 dark:text-teal-300',
    borderClass: 'border-teal-200 dark:border-teal-800/70',
  },
  'vital-env': {
    id: 'vital-env',
    name: 'منابع حیاتی و محیطی',
    shortName: 'منابع حیاتی و اقلیم',
    families: ['WAT', 'AGR', 'ECO', 'CLI'],
    atlasRole: 'تحلیل آب، غذا، تولید، اکوسیستم و محرک‌های اقلیمی',
    color: '#2563EB',
    colorDark: '#60A5FA',
    bgSoft: 'bg-blue-50 dark:bg-blue-950/40',
    textClass: 'text-blue-700 dark:text-blue-300',
    borderClass: 'border-blue-200 dark:border-blue-800/70',
  },
  'natural-tech': {
    id: 'natural-tech',
    name: 'طبیعی، زمین‌شناختی و فناورانه',
    shortName: 'زمین، صنعت و فناوری',
    families: ['GEO', 'IND', 'CYB', 'SPA'],
    atlasRole: 'تحلیل رخدادهای طبیعی و اختلال فناوری و زیرساخت',
    color: '#7C3AED',
    colorDark: '#A78BFA',
    bgSoft: 'bg-violet-50 dark:bg-violet-950/40',
    textClass: 'text-violet-700 dark:text-violet-300',
    borderClass: 'border-violet-200 dark:border-violet-800/70',
  },
  'crossborder-sec-soc': {
    id: 'crossborder-sec-soc',
    name: 'فرامرزی، امنیتی و اجتماعی',
    shortName: 'فرامرزی، حکمرانی و اجتماع',
    families: ['SUP', 'DEM', 'SEC', 'GOV', 'SOC', 'OCC'],
    atlasRole: 'تحلیل ورود و انتشار، تهدید عمدی، حکمرانی، پیامدهای اجتماعی و ایمنی عملیاتی',
    color: '#D97706',
    colorDark: '#FBBF24',
    bgSoft: 'bg-amber-50 dark:bg-amber-950/40',
    textClass: 'text-amber-700 dark:text-amber-300',
    borderClass: 'border-amber-200 dark:border-amber-800/70',
  },
  'cbrn-specialized': {
    id: 'cbrn-specialized',
    name: 'تخصصی CBRN (شیمیایی و پرتوی)',
    shortName: 'تخصصی CBRN',
    families: ['CHE', 'RAD'],
    atlasRole: 'تفکیک حوزه‌های شیمیایی و پرتوی از مأموریت مستقیم امنیت زیستی در پیوند با BIO',
    color: '#E11D48',
    colorDark: '#FB7185',
    bgSoft: 'bg-rose-50 dark:bg-rose-950/40',
    textClass: 'text-rose-700 dark:text-rose-300',
    borderClass: 'border-rose-200 dark:border-rose-800/70',
  },
};

export const BIOSECURITY_TIER_META: Record<
  BiosecurityTierId,
  {
    id: BiosecurityTierId;
    title: string;
    shortTitle: string;
    criterion: string;
    examples: string;
    role: string;
    color: string;
    colorDark: string;
  }
> = {
  A: {
    id: 'A',
    title: 'سطح A — هسته امنیت زیستی',
    shortTitle: 'هسته امنیت زیستی',
    criterion: 'وجود مسیر زیستی مستقیم یا تهدید علیه عامل، موجود زنده یا دارایی زیستی',
    examples:
      'بیماری‌های انسانی، دامی و گیاهی؛ زئونوزها؛ حوادث آزمایشگاهی؛ تهدید زیستی عمدی؛ AMR؛ زیست‌فناوری دوکاربردی',
    role: 'پایش و مدیریت ریسک زیستی، یکپارچه‌سازی داده و هماهنگی پاسخ',
    color: '#0D9488',
    colorDark: '#2DD4BF',
  },
  B: {
    id: 'B',
    title: 'سطح B — همپوشان',
    shortTitle: 'همپوشان مشروط',
    criterion:
      'مخاطره در حوزه تخصصی دیگر است، اما پیامد آن به سلامت، آب، غذا، موجودات زنده یا اکوسیستم می‌رسد',
    examples: 'شیمیایی، پرتوی، آب، غذا، کشاورزی، آلودگی محیط‌زیست و برخی حوادث صنعتی',
    role: 'هماهنگی مشروط بر وجود مسیر یا پیامد زیستی قابل تعریف',
    color: '#2563EB',
    colorDark: '#60A5FA',
  },
  C: {
    id: 'C',
    title: 'سطح C — پشتیبان و توانمندساز',
    shortTitle: 'پشتیبان و توانمندساز',
    criterion: 'عامل، احتمال، شدت یا دشواری مدیریت مخاطرات زیستی را افزایش می‌دهد',
    examples: 'اقلیم، زیرساخت، سایبری، تجارت، حمل‌ونقل، مهاجرت، حکمرانی، اقتصاد و اعتماد عمومی',
    role: 'پایش وابستگی‌ها، تداوم خدمت، تبادل داده و پشتیبانی از آمادگی و پاسخ',
    color: '#D97706',
    colorDark: '#FBBF24',
  },
};

export function toPersianDigits(input: string | number): string {
  const map = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return String(input).replace(/\d/g, (d) => map[Number(d)]);
}
