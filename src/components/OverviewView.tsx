import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowUpLeft,
  CheckCircle2,
  Circle,
  Compass,
  Info,
  Layers,
  ShieldCheck,
} from 'lucide-react';
import { HAZARD_FAMILIES, SUB_HAZARDS } from '../data/familiesAndSubhazards';
import {
  BIOSECURITY_ENTRY_TEST,
  DESIGN_DECISIONS,
  DESIGN_PRINCIPLES,
  DOCUMENT_META,
  THREE_DELIVERABLES,
} from '../data/frameworkCore';
import {
  ANALYTICAL_GROUPS,
  AnalyticalGroupId,
  BIOSECURITY_TIER_META,
  BiosecurityTierId,
  DashboardSectionId,
  HazardFamily,
  HazardFamilyCode,
  toPersianDigits,
} from '../data/types';

interface OverviewViewProps {
  onNavigate: (section: DashboardSectionId, familyFilter?: HazardFamilyCode) => void;
}

const ENTRY_TEST_PRESETS = [
  {
    id: 'zoonosis',
    label: 'شیوع بیماری مشترک انسان و دام',
    checks: { pathway: true, exposed: true, 'cross-sector': true, 'value-add': true },
  },
  {
    id: 'chem-only',
    label: 'آلودگی صرفاً شیمیایی بدون پیامد زیستی',
    checks: { pathway: false, exposed: true, 'cross-sector': true, 'value-add': false },
  },
  {
    id: 'cold-chain',
    label: 'قطع برق سردخانه واکسن و دارو',
    checks: { pathway: true, exposed: true, 'cross-sector': true, 'value-add': true },
  },
  {
    id: 'cyber-general',
    label: 'حمله سایبری عمومی به سامانه اداری',
    checks: { pathway: false, exposed: false, 'cross-sector': false, 'value-add': false },
  },
];

export const OverviewView: React.FC<OverviewViewProps> = ({ onNavigate }) => {
  const [selectedTier, setSelectedTier] = useState<BiosecurityTierId | null>(null);
  const [selectedFamily, setSelectedFamily] = useState<HazardFamily>(HAZARD_FAMILIES[0]);
  const [selectedGroupFilter, setSelectedGroupFilter] = useState<AnalyticalGroupId | 'all'>('all');
  const [showNote, setShowNote] = useState(false);

  // Interactive 4-step biosecurity entry test
  const [testChecks, setTestChecks] = useState<Record<string, boolean>>({
    pathway: true,
    exposed: true,
    'cross-sector': true,
    'value-add': true,
  });

  const subCountByFamily = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const s of SUB_HAZARDS) {
      counts[s.familyCode] = (counts[s.familyCode] || 0) + 1;
    }
    return counts;
  }, []);

  const familyNodes = useMemo(() => {
    const byTier: Record<BiosecurityTierId, HazardFamily[]> = { A: [], B: [], C: [] };
    for (const f of HAZARD_FAMILIES) {
      byTier[f.tier].push(f);
    }
    const radii: Record<BiosecurityTierId, number> = { A: 72, B: 138, C: 204 };
    const startOffsets: Record<BiosecurityTierId, number> = { A: -90, B: -54, C: -72 };

    const result: Array<HazardFamily & { x: number; y: number; count: number }> = [];
    (['A', 'B', 'C'] as BiosecurityTierId[]).forEach((tier) => {
      const list = byTier[tier];
      list.forEach((fam, idx) => {
        const angleDeg = startOffsets[tier] + (360 / list.length) * idx;
        const rad = (angleDeg * Math.PI) / 180;
        const cx = 250 + radii[tier] * Math.cos(rad);
        const cy = 250 + radii[tier] * Math.sin(rad);
        result.push({
          ...fam,
          x: cx,
          y: cy,
          count: subCountByFamily[fam.code] || 0,
        });
      });
    });
    return result;
  }, [subCountByFamily]);

  const sortedFamiliesForBars = useMemo(() => {
    return HAZARD_FAMILIES.filter(
      (f) => selectedGroupFilter === 'all' || f.group === selectedGroupFilter
    )
      .map((f) => ({ ...f, count: subCountByFamily[f.code] || 0 }))
      .sort((a, b) => b.count - a.count);
  }, [selectedGroupFilter, subCountByFamily]);

  const passedCount = Object.values(testChecks).filter(Boolean).length;
  const entryVerdict = useMemo(() => {
    if (passedCount === 4) {
      return {
        status: 'ورود مستقیم به قلمرو نظام ملی امنیت زیستی (سطح A یا B)',
        detail:
          'هر ۴ معیار آزمون برقرار است؛ موضوع باید در اطلس تخصصی امنیت زیستی ثبت و به سازوکار هماهنگی بین‌بخشی متصل شود.',
        color: '#0D9488',
        bg: 'bg-teal-50 dark:bg-teal-950/35 border-teal-200 dark:border-teal-800',
        text: 'text-teal-800 dark:text-teal-200',
      };
    }
    if (testChecks.pathway && testChecks.exposed) {
      return {
        status: 'پایش تخصصی در دستگاه متولی با پیوند مشروط به امنیت زیستی',
        detail:
          'مسیر زیستی و حوزه در معرض وجود دارد، اما به دلیل عدم نیاز به هماهنگی فرابخشی گسترده، مدیریت در سطح تخصصی با اشتراک داده انجام می‌شود.',
        color: '#2563EB',
        bg: 'bg-blue-50 dark:bg-blue-950/35 border-blue-200 dark:border-blue-800',
        text: 'text-blue-800 dark:text-blue-200',
      };
    }
    if (!testChecks.pathway && (testChecks['cross-sector'] || testChecks.exposed)) {
      return {
        status: 'مدیریت در نظام تخصصی خود (خارج از مأموریت مستقیم امنیت زیستی)',
        detail:
          'مطابق مرز مأموریتی سند، مخاطره فاقد مسیر زیستی روشن در نظام تخصصی خود (مانند CBRN، زیرساخت یا سایبری) مدیریت می‌شود و تنها در صورت اثر بر ظرفیت پایش و پاسخ به عنوان سطح C (پشتیبان) متصل می‌گردد.',
        color: '#D97706',
        bg: 'bg-amber-50 dark:bg-amber-950/35 border-amber-200 dark:border-amber-800',
        text: 'text-amber-800 dark:text-amber-200',
      };
    }
    return {
      status: 'خارج از قلمرو امنیت زیستی',
      detail:
        'موضوع معیارهای ورود به قلمرو امنیت زیستی را احراز نمی‌کند و در سبد جامع مخاطرات ملی یا سامانه‌های بخشی مربوط پیگیری می‌شود.',
      color: '#64748B',
      bg: 'bg-slate-100 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700',
      text: 'text-slate-700 dark:text-slate-200',
    };
  }, [passedCount, testChecks]);

  const kpis: Array<{
    value: string;
    label: string;
    sub: string;
    accent: string;
    target: DashboardSectionId;
  }> = [
    {
      value: toPersianDigits(18),
      label: 'خانواده مخاطره ملی',
      sub: '۱۵ خانواده مبنا + ۳ حوزه تکمیلی',
      accent: '#0D9488',
      target: 'atlas',
    },
    {
      value: toPersianDigits(SUB_HAZARDS.length),
      label: 'زیرشاخه قابل ثبت در اطلس',
      sub: 'کدگذاری یکنواخت FAMILY-##',
      accent: '#2563EB',
      target: 'atlas',
    },
    {
      value: toPersianDigits(12),
      label: 'ابرچالش فرابخشی',
      sub: 'محرک‌ها و عوامل تشدیدکننده',
      accent: '#D97706',
      target: 'megachallenges',
    },
    {
      value: toPersianDigits(10),
      label: 'سناریوی ترکیبی و آبشاری',
      sub: 'آزمون وابستگی و نقاط کنترل',
      accent: '#7C3AED',
      target: 'megachallenges',
    },
    {
      value: toPersianDigits(15),
      label: 'زیرخانواده عملیاتی زیستی',
      sub: 'هسته سلامت واحد (One Health)',
      accent: '#059669',
      target: 'biosecurity',
    },
    {
      value: toPersianDigits(7),
      label: 'مرحله نقشه راه اجرا',
      sub: 'از تثبیت طبقه‌بندی تا بازنگری',
      accent: '#E11D48',
      target: 'roadmap',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Executive Hero Banner */}
      <section className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-6 md:p-8">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full opacity-20 dark:opacity-15 blur-3xl"
          style={{
            background:
              'radial-gradient(circle, #0D9488 0%, #2563EB 50%, transparent 75%)',
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-24 right-1/3 h-64 w-64 rounded-full opacity-15 dark:opacity-10 blur-3xl"
          style={{
            background:
              'radial-gradient(circle, #D97706 0%, #E11D48 55%, transparent 75%)',
          }}
        />

        <div className="relative flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
              <span>{DOCUMENT_META.subtitle}</span>
              <span aria-hidden="true">·</span>
              <span>نسخه پیشنهادی برای بازبینی و تکمیل کارشناسی</span>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">{DOCUMENT_META.date}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight [text-wrap:balance]">
              {DOCUMENT_META.title}
            </h1>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
              معماری واحد برای طبقه‌بندی، ارزیابی چندمعیاره، پایش، هشدار زودهنگام و حکمرانی مخاطرات ملی با تمرکز راهبردی بر مرزبندی نظام ملی امنیت زیستی و رویکرد سلامت واحد.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => onNavigate('atlas')}
              className="inline-flex items-center gap-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 text-sm font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <span>کاوش اطلس ۱۸ خانواده</span>
              <ArrowUpLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setShowNote((v) => !v)}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 px-4 py-2.5 text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Info className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>حدود اعتبار سند</span>
            </button>
          </div>
        </div>

        {showNote && (
          <div className="relative mt-5 rounded-xl border border-amber-200 dark:border-amber-800/70 bg-amber-50/80 dark:bg-amber-950/30 p-4 text-xs sm:text-sm text-amber-950 dark:text-amber-200 leading-relaxed">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1.5">
                <p className="font-bold">تذکر روش‌شناختی و حدود اعتبار</p>
                <p>{DOCUMENT_META.methodologicalNote}</p>
                <p className="text-xs text-amber-800 dark:text-amber-300/90">
                  مبنای تدوین: {DOCUMENT_META.basis} · وضعیت: {DOCUMENT_META.status}
                </p>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* 6-Column Quantitative KPI Strip */}
      <section className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpis.map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={() => onNavigate(item.target)}
            className="group text-right rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-4 hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between mb-2">
              <span
                className="inline-block h-2 w-8 rounded-full"
                style={{ backgroundColor: item.accent }}
              />
              <ArrowUpLeft className="w-4 h-4 text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors" />
            </div>
            <div
              className="text-3xl font-extrabold tabular-nums tracking-tight"
              style={{ color: item.accent }}
            >
              {item.value}
            </div>
            <div className="mt-1 text-sm font-bold text-slate-900 dark:text-slate-100">
              {item.label}
            </div>
            <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 leading-snug">
              {item.sub}
            </div>
          </button>
        ))}
      </section>

      {/* Main Analytical Pair: Concentric Biosecurity Architecture + 18-Family Distribution */}
      <section className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
        {/* Concentric Biosecurity Tiers Diagram */}
        <div className="xl:col-span-7 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-6 flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  معماری سه‌سطحی ارتباط ۱۸ خانواده با امنیت زیستی
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  برای بررسی مرز مأموریتی و دامنه، روی هر لایه یا کد خانواده در نمودار کلیک کنید.
                </p>
              </div>
              <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-100 dark:bg-slate-800/80">
                <button
                  type="button"
                  onClick={() => setSelectedTier(null)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    selectedTier === null
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  همه سطوح
                </button>
                {(['A', 'B', 'C'] as BiosecurityTierId[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setSelectedTier(selectedTier === t ? null : t)}
                    className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      selectedTier === t
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    سطح {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center mt-4">
              {/* SVG Concentric Rings */}
              <div className="md:col-span-7 flex justify-center">
                <svg
                  viewBox="0 0 500 500"
                  className="w-full max-w-[430px] h-auto select-none"
                  role="img"
                  aria-label="نمودار هم‌مرکز سه سطح ارتباط ۱۸ خانواده مخاطره با امنیت زیستی"
                >
                  {/* Outer Ring C */}
                  <circle
                    cx="250"
                    cy="250"
                    r="234"
                    fill="#D97706"
                    fillOpacity={selectedTier === null || selectedTier === 'C' ? 0.08 : 0.02}
                    stroke="#D97706"
                    strokeWidth={selectedTier === 'C' ? 2.5 : 1.25}
                    strokeDasharray="6 4"
                    className="cursor-pointer transition-opacity"
                    onClick={() => setSelectedTier(selectedTier === 'C' ? null : 'C')}
                  />
                  {/* Middle Ring B */}
                  <circle
                    cx="250"
                    cy="250"
                    r="168"
                    fill="#2563EB"
                    fillOpacity={selectedTier === null || selectedTier === 'B' ? 0.1 : 0.03}
                    stroke="#2563EB"
                    strokeWidth={selectedTier === 'B' ? 2.5 : 1.25}
                    className="cursor-pointer transition-opacity"
                    onClick={() => setSelectedTier(selectedTier === 'B' ? null : 'B')}
                  />
                  {/* Core Ring A */}
                  <circle
                    cx="250"
                    cy="250"
                    r="102"
                    fill="#0D9488"
                    fillOpacity={selectedTier === null || selectedTier === 'A' ? 0.16 : 0.04}
                    stroke="#0D9488"
                    strokeWidth={selectedTier === 'A' ? 2.5 : 1.5}
                    className="cursor-pointer transition-opacity"
                    onClick={() => setSelectedTier(selectedTier === 'A' ? null : 'A')}
                  />

                  {/* Center label */}
                  <text
                    x="250"
                    y="244"
                    textAnchor="middle"
                    className="fill-teal-800 dark:fill-teal-200 text-[13px] font-bold"
                  >
                    هسته امنیت زیستی
                  </text>
                  <text
                    x="250"
                    y="262"
                    textAnchor="middle"
                    className="fill-slate-500 dark:fill-slate-400 text-[10px]"
                  >
                    One Health
                  </text>

                  {/* Ring Indicators */}
                  <text
                    x="250"
                    y="108"
                    textAnchor="middle"
                    className="fill-blue-700 dark:fill-blue-300 text-[10px] font-semibold"
                  >
                    سطح B · همپوشان
                  </text>
                  <text
                    x="250"
                    y="32"
                    textAnchor="middle"
                    className="fill-amber-700 dark:fill-amber-300 text-[10px] font-semibold"
                  >
                    سطح C · پشتیبان و توانمندساز
                  </text>

                  {/* Family Nodes */}
                  {familyNodes.map((node) => {
                    const grp = ANALYTICAL_GROUPS[node.group];
                    const isSelected = selectedFamily.code === node.code;
                    const dimmed = selectedTier !== null && node.tier !== selectedTier;
                    return (
                      <g
                        key={node.code}
                        transform={`translate(${node.x}, ${node.y})`}
                        onClick={() => setSelectedFamily(node)}
                        className="cursor-pointer transition-opacity"
                        style={{ opacity: dimmed ? 0.22 : 1 }}
                      >
                        <circle
                          r={isSelected ? 24 : 20}
                          fill={grp.color}
                          stroke={isSelected ? '#0F172A' : '#FFFFFF'}
                          strokeWidth={isSelected ? 3 : 2}
                        />
                        <text
                          y="1"
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fill="#FFFFFF"
                          className="font-mono-code text-[10.5px] font-bold"
                        >
                          {node.code}
                        </text>
                        <text
                          y="12"
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fill="#FFFFFF"
                          fillOpacity="0.88"
                          className="text-[8px] font-medium"
                        >
                          {toPersianDigits(node.count)}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>

              {/* Active Family / Tier Inspector */}
              <div className="md:col-span-5 space-y-4">
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60 p-4 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      dir="ltr"
                      className="font-mono-code text-sm font-bold px-2.5 py-1 rounded-lg text-white"
                      style={{ backgroundColor: ANALYTICAL_GROUPS[selectedFamily.group].color }}
                    >
                      {selectedFamily.code}
                    </span>
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      سطح {selectedFamily.tier} · {toPersianDigits(subCountByFamily[selectedFamily.code] || 0)} زیرشاخه
                    </span>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {selectedFamily.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      گروه تحلیلی: {ANALYTICAL_GROUPS[selectedFamily.group].name}
                    </p>
                  </div>
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                    <div>
                      <span className="font-semibold text-slate-700 dark:text-slate-200">
                        جایگاه در امنیت زیستی:{' '}
                      </span>
                      <span className="text-slate-600 dark:text-slate-300">
                        {selectedFamily.biosecurityPosition}
                      </span>
                    </div>
                    <div>
                      <span className="font-semibold text-slate-700 dark:text-slate-200">
                        دامنه نمونه:{' '}
                      </span>
                      <span className="text-slate-600 dark:text-slate-300 leading-relaxed">
                        {selectedFamily.sampleScope}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onNavigate('atlas', selectedFamily.code)}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-3 py-2 text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer"
                  >
                    <span>مشاهده زیرشاخه‌های {selectedFamily.code} در اطلس</span>
                    <ArrowUpLeft className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* 3 Tiers Quick Summary */}
                <div className="space-y-2">
                  {(['A', 'B', 'C'] as BiosecurityTierId[]).map((t) => {
                    const meta = BIOSECURITY_TIER_META[t];
                    const active = selectedTier === t;
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setSelectedTier(active ? null : t)}
                        className={`w-full text-right rounded-lg border px-3 py-2.5 text-xs transition-colors cursor-pointer ${
                          active
                            ? 'border-slate-400 dark:border-slate-500 bg-slate-100 dark:bg-slate-800'
                            : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                        }`}
                      >
                        <div className="flex items-center justify-between font-bold text-slate-800 dark:text-slate-100">
                          <span>{meta.title}</span>
                          <span
                            className="h-2.5 w-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: meta.color }}
                          />
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                          {meta.role}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sub-hazard Distribution by 18 Families */}
        <div className="xl:col-span-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  توزیع ۱۴۹ زیرشاخه در ۱۸ خانواده
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  تفکیک بر اساس ۵ گروه تحلیلی اطلس (کلیک برای ورود به اطلس)
                </p>
              </div>
            </div>

            {/* 5 Analytical Groups Filter */}
            <div className="flex flex-wrap gap-1.5 mb-4">
              <button
                type="button"
                onClick={() => setSelectedGroupFilter('all')}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                  selectedGroupFilter === 'all'
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                همه ({toPersianDigits(18)})
              </button>
              {Object.values(ANALYTICAL_GROUPS).map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() =>
                    setSelectedGroupFilter(selectedGroupFilter === g.id ? 'all' : g.id)
                  }
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                    selectedGroupFilter === g.id
                      ? 'text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                  style={
                    selectedGroupFilter === g.id ? { backgroundColor: g.color } : undefined
                  }
                >
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{
                      backgroundColor: selectedGroupFilter === g.id ? '#FFFFFF' : g.color,
                    }}
                  />
                  <span>{g.shortName}</span>
                </button>
              ))}
            </div>

            {/* Bars */}
            <div className="space-y-2 max-h-[380px] overflow-y-auto pl-1">
              {sortedFamiliesForBars.map((f) => {
                const grp = ANALYTICAL_GROUPS[f.group];
                const pct = Math.round((f.count / 15) * 100);
                return (
                  <button
                    key={f.code}
                    type="button"
                    onClick={() => onNavigate('atlas', f.code)}
                    className="w-full group flex items-center gap-3 py-1 px-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer text-right"
                  >
                    <span
                      dir="ltr"
                      className="font-mono-code text-xs font-bold w-10 text-left shrink-0"
                      style={{ color: grp.color }}
                    >
                      {f.code}
                    </span>
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-200 w-32 truncate shrink-0">
                      {f.shortName}
                    </span>
                    <div className="flex-1 h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{ width: `${pct}%`, backgroundColor: grp.color }}
                      />
                    </div>
                    <span className="text-xs font-bold tabular-nums text-slate-700 dark:text-slate-200 w-7 text-left shrink-0">
                      {toPersianDigits(f.count)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>۳ خانواده افزوده‌شده در سند تلفیقی: GEO، SPA، OCC</span>
            <span className="font-semibold tabular-nums text-slate-800 dark:text-slate-200">
              مجموع: {toPersianDigits(SUB_HAZARDS.length)} زیرشاخه
            </span>
          </div>
        </div>
      </section>

      {/* Interactive 4-Step Biosecurity Entry Test + 3 Linked Deliverables */}
      <section className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
        {/* Biosecurity Entry Test */}
        <div className="xl:col-span-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-6 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                <span>آزمون تعاملی ورود به قلمرو امنیت زیستی (فصل ۲ـ۳)</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                برای سنجش مرز مأموریتی، یکی از نمونه‌های آماده را انتخاب کنید یا ۴ معیار زیر را بررسی نمایید.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {ENTRY_TEST_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => setTestChecks(preset.checks)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 hover:border-teal-400 dark:hover:border-teal-500 text-xs font-medium text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
              >
                {preset.label}
              </button>
            ))}
          </div>

          <div className="space-y-2.5">
            {BIOSECURITY_ENTRY_TEST.map((item) => {
              const checked = !!testChecks[item.id];
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() =>
                    setTestChecks((prev) => ({ ...prev, [item.id]: !prev[item.id] }))
                  }
                  className={`w-full text-right flex items-start gap-3 p-3 rounded-xl border transition-colors cursor-pointer ${
                    checked
                      ? 'border-teal-300 dark:border-teal-800 bg-teal-50/50 dark:bg-teal-950/25'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  {checked ? (
                    <CheckCircle2 className="w-5 h-5 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-300 dark:text-slate-600 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      {item.title}
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                      {item.desc}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className={`rounded-xl border p-4 ${entryVerdict.bg}`}>
            <div className={`text-sm font-bold ${entryVerdict.text}`}>
              نتیجه آزمون ({toPersianDigits(passedCount)} از ۴ معیار): {entryVerdict.status}
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 leading-relaxed">
              {entryVerdict.detail}
            </p>
          </div>
        </div>

        {/* 3 Linked Deliverables + 7 Design Decisions */}
        <div className="xl:col-span-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-6 flex flex-col justify-between space-y-5">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span>سه محصول مستقل اما پیوسته (نتیجه طراحی)</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              {DOCUMENT_META.designConclusion}
            </p>

            <div className="grid grid-cols-1 gap-3 mt-4">
              {THREE_DELIVERABLES.map((prod) => (
                <div
                  key={prod.id}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 p-4"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-7 h-7 rounded-lg text-white text-sm font-bold flex items-center justify-center shrink-0"
                        style={{ backgroundColor: prod.accent }}
                      >
                        {prod.number}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        {prod.title}
                      </h3>
                    </div>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      مخاطب: {prod.audience}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                    {prod.content}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* 7 Core Design Decisions compact table */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2.5 flex items-center gap-2">
              <Compass className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>۷ تصمیم کلیدی طراحی در سند تلفیقی</span>
            </h3>
            <div className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs">
              {DESIGN_DECISIONS.map((d) => (
                <div key={d.decision} className="py-2 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                  <span className="font-bold text-slate-800 dark:text-slate-200 sm:w-36 shrink-0">
                    {d.decision}
                  </span>
                  <span className="text-slate-600 dark:text-slate-400">{d.rule}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 7 Design Principles Strip */}
      <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-6">
        <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4">
          اصول هفت‌گانه طراحی چارچوب (فصل ۱ـ۳)
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3">
          {DESIGN_PRINCIPLES.map((p, i) => (
            <div
              key={p.title}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 p-3.5"
            >
              <div className="text-xs font-bold text-teal-700 dark:text-teal-400 tabular-nums mb-1">
                اصل {toPersianDigits(i + 1)}
              </div>
              <div className="text-xs font-bold text-slate-900 dark:text-slate-100 mb-1">
                {p.title}
              </div>
              <p className="text-[11.5px] text-slate-600 dark:text-slate-400 leading-relaxed">
                {p.desc}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
