import React, { useMemo, useState } from 'react';
import {
  Activity,
  Dna,
  HeartPulse,
  Leaf,
  Microscope,
  PawPrint,
  Shield,
  ShieldCheck,
  Waves,
} from 'lucide-react';
import { SUB_HAZARDS } from '../data/familiesAndSubhazards';
import {
  BIO_AGENT_TYPES,
  BIO_SURVEILLANCE_KPIS,
  BIO_SURVEILLANCE_PRIORITIES,
  BIOSAFETY_VS_BIOSECURITY,
} from '../data/frameworkCore';
import { SubHazard, toPersianDigits } from '../data/types';

interface BiosecurityViewProps {
  onEvaluateInRiskLab: (sub: SubHazard) => void;
}

type OneHealthPillar = 'all' | 'human' | 'animal' | 'plant' | 'env';

const ONE_HEALTH_PILLARS: Array<{
  id: OneHealthPillar;
  title: string;
  desc: string;
  color: string;
  codes: string[];
}> = [
  {
    id: 'human',
    title: 'سلامت انسان و غذا',
    desc: 'بیماری‌های عفونی انسانی، غذازاد، آب‌زاد، AMR، حوادث آزمایشگاهی و تهدیدات عمدی',
    color: '#0D9488',
    codes: ['BIO-01', 'BIO-02', 'BIO-06', 'BIO-07', 'BIO-08', 'BIO-10', 'BIO-11', 'BIO-13', 'BIO-14', 'BIO-15'],
  },
  {
    id: 'animal',
    title: 'سلامت دام، طیور و آبزیان',
    desc: 'زئونوزها، بیماری‌های دامی و آبزیان، حیات‌وحش و مقاومت ضدمیکروبی دامی',
    color: '#2563EB',
    codes: ['BIO-02', 'BIO-03', 'BIO-04', 'BIO-08', 'BIO-09', 'BIO-10', 'BIO-11'],
  },
  {
    id: 'plant',
    title: 'سلامت گیاه و کشاورزی',
    desc: 'آفات و بیماری‌های گیاهی قرنطینه‌ای، سموم قارچی و امنیت زنجیره تولید',
    color: '#16A34A',
    codes: ['BIO-05', 'BIO-11', 'BIO-15'],
  },
  {
    id: 'env',
    title: 'محیط‌زیست، آب و حیات‌وحش',
    desc: 'آلودگی زیستی محیط‌زیست، ناقلان محیطی، مخازن حیات‌وحش و آب‌های سطحی',
    color: '#D97706',
    codes: ['BIO-07', 'BIO-08', 'BIO-09', 'BIO-12', 'BIO-13', 'BIO-15'],
  },
];

export const BiosecurityView: React.FC<BiosecurityViewProps> = ({ onEvaluateInRiskLab }) => {
  const [activePillar, setActivePillar] = useState<OneHealthPillar>('all');
  const [selectedBioCode, setSelectedBioCode] = useState<string>('BIO-02');

  const bioSubHazards = useMemo(
    () => SUB_HAZARDS.filter((s) => s.familyCode === 'BIO'),
    []
  );

  const filteredBio = useMemo(() => {
    if (activePillar === 'all') return bioSubHazards;
    const pillar = ONE_HEALTH_PILLARS.find((p) => p.id === activePillar);
    if (!pillar) return bioSubHazards;
    return bioSubHazards.filter((s) => pillar.codes.includes(s.code));
  }, [activePillar, bioSubHazards]);

  const activeBio = useMemo(
    () => bioSubHazards.find((b) => b.code === selectedBioCode) || bioSubHazards[0],
    [bioSubHazards, selectedBioCode]
  );

  const kpiPhases = ['سرعت شناسایی', 'اثر و دامنه', 'ظرفیت شبکه', 'آمادگی و کیفیت'];

  return (
    <div className="space-y-8">
      {/* Hero Banner */}
      <section className="rounded-2xl border border-teal-200 dark:border-teal-900/70 bg-gradient-to-l from-teal-50/90 via-white to-blue-50/60 dark:from-teal-950/40 dark:via-[#111827] dark:to-blue-950/30 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-3xl">
            <div className="text-xs font-bold text-teal-700 dark:text-teal-400">
              فصل دهم · هسته اصلی نظام ملی امنیت زیستی
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
              زیرنظام تخصصی مخاطرات زیستی و رویکرد سلامت واحد (One Health)
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              یک رخداد ممکن است ابتدا در حیوان یا محیط مشاهده شود و سپس در جمعیت انسانی آشکار گردد؛ بنابراین سامانه‌های مراقبت نباید به جزایر مستقل داده‌ای تبدیل شوند.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0 text-xs text-slate-600 dark:text-slate-300">
            <span>۱۵ زیرخانواده عملیاتی</span>
            <span aria-hidden="true">·</span>
            <span>۹ دسته عامل زیستی</span>
            <span aria-hidden="true">·</span>
            <span>۱۰ شاخص مشترک عملکرد</span>
          </div>
        </div>
      </section>

      {/* Interactive One Health 4-Pillar Filter */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            پیوند چهارگانه سلامت واحد و ۱۵ زیرخانواده عملیاتی (BIO-01 تا BIO-15)
          </h2>
          {activePillar !== 'all' && (
            <button
              type="button"
              onClick={() => setActivePillar('all')}
              className="text-xs font-semibold text-teal-700 dark:text-teal-400 hover:underline cursor-pointer"
            >
              نمایش هر ۱۵ زیرخانواده
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5">
          {ONE_HEALTH_PILLARS.map((p) => {
            const isActive = activePillar === p.id;
            const Icon =
              p.id === 'human'
                ? HeartPulse
                : p.id === 'animal'
                ? PawPrint
                : p.id === 'plant'
                ? Leaf
                : Waves;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setActivePillar(isActive ? 'all' : p.id)}
                className={`text-right rounded-xl border p-4 transition-all cursor-pointer ${
                  isActive
                    ? 'border-transparent text-white shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] hover:border-slate-300 dark:hover:border-slate-700'
                }`}
                style={isActive ? { backgroundColor: p.color } : undefined}
              >
                <div className="flex items-center justify-between mb-2">
                  <Icon
                    className="w-5 h-5"
                    style={{ color: isActive ? '#FFFFFF' : p.color }}
                  />
                  <span
                    className={`text-xs font-bold tabular-nums ${
                      isActive ? 'text-white/90' : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {toPersianDigits(p.codes.length)} زیرخانواده
                  </span>
                </div>
                <div
                  className={`text-sm font-bold ${
                    isActive ? 'text-white' : 'text-slate-900 dark:text-white'
                  }`}
                >
                  {p.title}
                </div>
                <p
                  className={`text-xs mt-1 leading-relaxed ${
                    isActive ? 'text-white/90' : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {p.desc}
                </p>
              </button>
            );
          })}
        </div>

        {/* 15 Bio Sub-families Interactive Grid + Detail Inspector */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          <div className="xl:col-span-7 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {filteredBio.map((sub) => {
              const selected = sub.code === activeBio.code;
              return (
                <button
                  key={sub.code}
                  type="button"
                  onClick={() => setSelectedBioCode(sub.code)}
                  className={`text-right rounded-xl border p-3.5 transition-all cursor-pointer ${
                    selected
                      ? 'border-teal-600 bg-teal-600 text-white shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] hover:border-teal-300 dark:hover:border-teal-700'
                  }`}
                >
                  <div
                    dir="ltr"
                    className={`font-mono-code text-xs font-bold ${
                      selected ? 'text-teal-100' : 'text-teal-600 dark:text-teal-400'
                    }`}
                  >
                    {sub.code}
                  </div>
                  <div
                    className={`mt-1 text-xs sm:text-sm font-bold leading-snug ${
                      selected ? 'text-white' : 'text-slate-900 dark:text-slate-100'
                    }`}
                  >
                    {sub.title}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Selected BIO Operational Profile */}
          <div className="xl:col-span-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-6 space-y-4">
            <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <span
                  dir="ltr"
                  className="font-mono-code text-xs font-bold px-2 py-0.5 rounded-md bg-teal-600 text-white"
                >
                  {activeBio.code}
                </span>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mt-1.5">
                  {activeBio.title}
                </h3>
              </div>
              <Microscope className="w-6 h-6 text-teal-600 dark:text-teal-400 shrink-0" />
            </div>

            <div className="space-y-3 text-xs sm:text-sm">
              <div>
                <div className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-0.5">
                  مسیرهای اصلی خطر
                </div>
                <p className="text-slate-800 dark:text-slate-200 leading-relaxed">
                  {activeBio.exposedOrPathways}
                </p>
              </div>
              <div>
                <div className="text-xs font-bold text-rose-700 dark:text-rose-400 mb-0.5">
                  پیامدهای مهم
                </div>
                <p className="text-slate-800 dark:text-slate-200 leading-relaxed">
                  {activeBio.consequences}
                </p>
              </div>
              <div>
                <div className="text-xs font-bold text-blue-700 dark:text-blue-400 mb-0.5">
                  شاخص‌های کلیدی پایش
                </div>
                <p className="text-slate-800 dark:text-slate-200 leading-relaxed">
                  {activeBio.indicators}
                </p>
              </div>
              <div>
                <div className="text-xs font-bold text-amber-700 dark:text-amber-400 mb-0.5">
                  نقش تخصصی پیشنهادی
                </div>
                <p className="text-slate-800 dark:text-slate-200 leading-relaxed">
                  {activeBio.agencies}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onEvaluateInRiskLab(activeBio)}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-2.5 px-4 text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer"
            >
              <Activity className="w-4 h-4" />
              <span>ارزیابی ۱۰معیاره این زیرخانواده در آزمایشگاه ریسک</span>
            </button>
          </div>
        </div>
      </section>

      {/* Biosafety vs Biosecurity + 9 Biological Agent Types */}
      <section className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
        {/* Biosafety vs Biosecurity */}
        <div className="xl:col-span-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-6 space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            <span>تفکیک ایمنی زیستی (Biosafety) و امنیت زیستی (Biosecurity)</span>
          </h2>
          <div className="grid grid-cols-1 gap-4">
            {BIOSAFETY_VS_BIOSECURITY.map((item) => (
              <div
                key={item.concept}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 p-4 space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-extrabold" style={{ color: item.color }}>
                    {item.concept}
                  </h3>
                  <ShieldCheck className="w-4 h-4" style={{ color: item.color }} />
                </div>
                <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  <strong className="text-slate-900 dark:text-white">تمرکز اصلی: </strong>
                  {item.focus}
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed pt-2 border-t border-slate-200/80 dark:border-slate-800">
                  <strong className="text-slate-800 dark:text-slate-200">نمونه حوزه کنترل: </strong>
                  {item.controls}
                </div>
              </div>
            ))}
          </div>

          {/* 8 Bio Surveillance Priority Axes */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2.5">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              ۸ محور اولویت‌دار نظام پایش زیستی (فصل ۱۰ـ۴)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {BIO_SURVEILLANCE_PRIORITIES.map((axis, i) => (
                <div
                  key={axis}
                  className="flex items-start gap-2 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800 p-2.5 text-slate-700 dark:text-slate-300 leading-snug"
                >
                  <span className="font-bold text-teal-600 dark:text-teal-400 tabular-nums shrink-0">
                    {toPersianDigits(i + 1)}.
                  </span>
                  <span>{axis}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 9 Independent Biological Agent Types */}
        <div className="xl:col-span-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-6 space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Dna className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span>طبقه‌بندی مستقل بر اساس نوع عامل زیستی (فصل ۱۰ـ۲)</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              این محور جایگزین زیرخانواده عملیاتی نمی‌شود؛ یک عامل می‌تواند در چند حوزه مأموریتی نقش داشته باشد.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {BIO_AGENT_TYPES.map((ag, idx) => (
              <div
                key={ag.name}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/50 p-3.5 space-y-1.5"
              >
                <div className="text-[11px] font-bold text-blue-600 dark:text-blue-400 tabular-nums">
                  دسته {toPersianDigits(idx + 1)}
                </div>
                <div className="text-sm font-bold text-slate-900 dark:text-white">
                  {ag.name}
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {ag.note}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 10 Common Bio-Surveillance Performance KPIs */}
      <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-6 space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            ۱۰ شاخص مشترک عملکرد پایش زیستی (فصل ۱۰ـ۵)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            تعداد موارد بیماری به‌تنهایی برای صدور هشدار کافی نیست؛ سرعت گسترش، شدت پیامد، قابلیت تشخیص و ظرفیت پاسخ باید همزمان سنجیده شوند.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {kpiPhases.map((phase, pIdx) => {
            const colors = ['#0D9488', '#E11D48', '#2563EB', '#D97706'];
            const items = BIO_SURVEILLANCE_KPIS.filter((k) => k.phase === phase);
            return (
              <div
                key={phase}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/50 p-4 space-y-3"
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                  <span className="text-xs font-extrabold" style={{ color: colors[pIdx] }}>
                    {phase}
                  </span>
                  <span className="text-[11px] text-slate-400 tabular-nums">
                    {toPersianDigits(items.length)} شاخص
                  </span>
                </div>
                <div className="space-y-2.5">
                  {items.map((it) => (
                    <div key={it.kpi}>
                      <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        {it.kpi}
                      </div>
                      <div className="text-[11.5px] text-slate-600 dark:text-slate-400 mt-0.5 leading-snug">
                        {it.desc}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
