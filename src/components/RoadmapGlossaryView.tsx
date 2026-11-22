import React, { useMemo, useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  Circle,
  Code2,
  Globe2,
  Milestone,
  Scale,
} from 'lucide-react';
import { HAZARD_FAMILIES, SUB_HAZARDS } from '../data/familiesAndSubhazards';
import {
  EDITORIAL_DECISIONS,
  EXECUTION_PREREQUISITES,
  EXPOSED_DOMAINS,
  GLOSSARY_TERMS,
  INTERNATIONAL_REFERENCES,
  ORIGIN_CODES,
  ROADMAP_PHASES,
} from '../data/frameworkCore';
import { HazardFamilyCode, toPersianDigits } from '../data/types';

const SAMPLE_PROVINCES = [
  { code: 'IR-07', name: 'تهران' },
  { code: 'IR-10', name: 'خوزستان' },
  { code: 'IR-04', name: 'اصفهان' },
  { code: 'IR-14', name: 'فارس' },
  { code: 'IR-30', name: 'خراسان رضوی' },
  { code: 'IR-13', name: 'سیستان و بلوچستان' },
];

export const RoadmapGlossaryView: React.FC = () => {
  const [selectedPhase, setSelectedPhase] = useState<number>(1);
  const [checkedPrereqs, setCheckedPrereqs] = useState<Record<number, boolean>>({
    0: true,
    1: false,
    2: false,
    3: false,
    4: false,
    5: false,
    6: false,
  });

  // Interactive Appendix B Coding & Event ID Composer
  const [demoFamily, setDemoFamily] = useState<HazardFamilyCode>('BIO');
  const [demoSubIdx, setDemoSubIdx] = useState<number>(0);
  const [demoYear, setDemoYear] = useState<string>('1405');
  const [demoSeq, setDemoSeq] = useState<string>('000123');
  const [demoProvince, setDemoProvince] = useState<string>('IR-07');
  const [demoOrigins, setDemoOrigins] = useState<string[]>(['OR-01', 'OR-07']);

  const familySubs = useMemo(
    () => SUB_HAZARDS.filter((s) => s.familyCode === demoFamily),
    [demoFamily]
  );

  const selectedSub = familySubs[demoSubIdx] || familySubs[0];
  const activePhase = ROADMAP_PHASES.find((p) => p.phase === selectedPhase) || ROADMAP_PHASES[0];
  const completedPrereqs = Object.values(checkedPrereqs).filter(Boolean).length;

  const toggleOrigin = (code: string) => {
    setDemoOrigins((prev) =>
      prev.includes(code)
        ? prev.length > 1
          ? prev.filter((c) => c !== code)
          : prev
        : [...prev, code]
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-6">
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
          نقشه راه هفت‌مرحله‌ای، کدگذاری استاندارد، واژگان و پیوست‌ها
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          پوشش کامل فصل یازدهم، واژگان پایه فصل اول، حوزه‌های در معرض فصل ششم و پیوست‌های ب، پ و ت.
        </p>
      </section>

      {/* Interactive 7-Phase Implementation Roadmap */}
      <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-6 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Milestone className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              <span>نقشه راه هفت‌مرحله‌ای استقرار چارچوب (فصل ۱۱ـ۲)</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              برای مشاهده اقدامات کلیدی و خروجی مصوب هر گام، روی مرحله مربوطه کلیک کنید.
            </p>
          </div>
        </div>

        {/* Stepper Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
          {ROADMAP_PHASES.map((ph) => {
            const active = ph.phase === selectedPhase;
            return (
              <button
                key={ph.phase}
                type="button"
                onClick={() => setSelectedPhase(ph.phase)}
                className={`text-right rounded-xl border p-3.5 transition-all cursor-pointer ${
                  active
                    ? 'border-transparent text-white shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
                style={active ? { backgroundColor: ph.color } : undefined}
              >
                <div
                  className={`text-xs font-extrabold tabular-nums ${
                    active ? 'text-white/90' : 'text-slate-400'
                  }`}
                >
                  مرحله {toPersianDigits(ph.phase)}
                </div>
                <div
                  className={`mt-1 text-xs font-bold leading-snug ${
                    active ? 'text-white' : 'text-slate-900 dark:text-slate-100'
                  }`}
                >
                  {ph.title}
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Phase Detail */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <div className="text-xs font-bold" style={{ color: activePhase.color }}>
              اقدامات کلیدی مرحله {toPersianDigits(activePhase.phase)} ({activePhase.title})
            </div>
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-relaxed">
              {activePhase.actions}
            </p>
          </div>
          <div className="space-y-1.5">
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400">
              خروجی رسمی مرحله
            </div>
            <p className="text-sm font-extrabold text-slate-900 dark:text-white leading-relaxed">
              {activePhase.output}
            </p>
          </div>
        </div>

        {/* 7 Execution Prerequisites Checklist */}
        <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              چک‌لیست ۷ الزام تبدیل چارچوب به سند اجرایی (فصل ۱۱ـ۳)
            </h3>
            <span className="font-bold text-teal-700 dark:text-teal-400 tabular-nums">
              {toPersianDigits(completedPrereqs)} از ۷ بررسی‌شده
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {EXECUTION_PREREQUISITES.map((req, idx) => {
              const checked = !!checkedPrereqs[idx];
              return (
                <button
                  key={req}
                  type="button"
                  onClick={() =>
                    setCheckedPrereqs((prev) => ({ ...prev, [idx]: !prev[idx] }))
                  }
                  className={`text-right flex items-start gap-2.5 p-3 rounded-xl border text-xs transition-colors cursor-pointer ${
                    checked
                      ? 'border-teal-300 dark:border-teal-800 bg-teal-50/60 dark:bg-teal-950/25 text-slate-900 dark:text-slate-100'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  {checked ? (
                    <CheckCircle2 className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                  ) : (
                    <Circle className="w-4 h-4 text-slate-300 dark:text-slate-600 shrink-0 mt-0.5" />
                  )}
                  <span className="leading-relaxed">{req}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Interactive Coding & Event ID Composer (Appendix B-1) */}
      <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-6 space-y-5">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Code2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span>سازنده تعاملی شناسه مخاطره و پرونده رخداد (پیوست بـ۱)</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            قاعده تفکیک: کد خانواده و زیرخانواده به <strong>نوع مخاطره</strong> اشاره دارد؛ شناسه رخداد به <strong>وقوع مشخص مکانی و زمانی</strong> اشاره می‌کند و این دو نباید با هم خلط شوند.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                کد خانواده (FAMILY)
              </label>
              <select
                value={demoFamily}
                onChange={(e) => {
                  setDemoFamily(e.target.value as HazardFamilyCode);
                  setDemoSubIdx(0);
                }}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-slate-100"
              >
                {HAZARD_FAMILIES.map((f) => (
                  <option key={f.code} value={f.code}>
                    {f.code} — {f.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                کد زیرخانواده (FAMILY-##)
              </label>
              <select
                value={demoSubIdx}
                onChange={(e) => setDemoSubIdx(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-slate-100"
              >
                {familySubs.map((s, idx) => (
                  <option key={s.code} value={idx}>
                    {s.code} — {s.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                سال و شماره یکتای رخداد
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  dir="ltr"
                  value={demoYear}
                  onChange={(e) => setDemoYear(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  className="w-20 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-2.5 py-2 font-mono-code text-center text-slate-900 dark:text-slate-100"
                />
                <input
                  type="text"
                  dir="ltr"
                  value={demoSeq}
                  onChange={(e) => setDemoSeq(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="flex-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-2.5 py-2 font-mono-code text-center text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                شناسه مکان / استان (GIS)
              </label>
              <select
                value={demoProvince}
                onChange={(e) => setDemoProvince(e.target.value)}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-slate-100"
              >
                {SAMPLE_PROVINCES.map((p) => (
                  <option key={p.code} value={p.code}>
                    {p.code} — {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <div className="font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                برچسب‌های چندگانه منشأ و ماهیت رخداد (OR-01 تا OR-08):
              </div>
              <div className="flex flex-wrap gap-1.5">
                {ORIGIN_CODES.map((o) => {
                  const active = demoOrigins.includes(o.code);
                  return (
                    <button
                      key={o.code}
                      type="button"
                      onClick={() => toggleOrigin(o.code)}
                      className={`px-2.5 py-1 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
                        active
                          ? 'border-blue-600 bg-blue-600 text-white'
                          : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <span dir="ltr" className="font-mono-code font-bold ml-1">
                        {o.code}
                      </span>
                      {o.title}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Live Generated Record Preview */}
          <div className="lg:col-span-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-950 text-slate-100 p-5 space-y-3">
            <div className="text-xs font-semibold text-teal-400">
              پیش‌نمایش رکورد استاندارد تبادل داده (v1.0)
            </div>
            <pre
              dir="ltr"
              className="font-mono-code text-xs leading-relaxed overflow-x-auto text-slate-200"
            >
{JSON.stringify(
  {
    event_id: `EVENT-${demoYear || '1405'}-${demoSeq || '000001'}`,
    hazard_family: demoFamily,
    sub_hazard_code: selectedSub.code,
    origin_tags: demoOrigins,
    location_gis_id: demoProvince,
    dictionary_version: 'v1.0',
  },
  null,
  2
)}
            </pre>
            <div className="pt-2 border-t border-slate-800 text-xs text-slate-400">
              موضوع ثبت‌شده: <strong className="text-white">{selectedSub.title}</strong>
            </div>
          </div>
        </div>
      </section>

      {/* Core Glossary (9 Terms) + 10 Exposed Domains */}
      <section className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        <div className="xl:col-span-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-6 space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            <span>واژگان پایه ۹گانه (فصل ۱ـ۲)</span>
          </h2>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {GLOSSARY_TERMS.map((g) => (
              <div key={g.en} className="py-3 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    {g.term}
                  </span>
                  <span dir="ltr" className="font-mono-code text-xs text-teal-700 dark:text-teal-400">
                    {g.en}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {g.def}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="xl:col-span-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-6 space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            ۱۰ حوزه در معرض آسیب (فصل ۶ـ۲)
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {EXPOSED_DOMAINS.map((d) => (
              <div
                key={d.domain}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 p-3.5 space-y-1 text-xs"
              >
                <div className="text-sm font-bold text-slate-900 dark:text-white">
                  {d.domain}
                </div>
                <div className="text-slate-600 dark:text-slate-300 leading-snug">
                  <strong>دارایی‌ها:</strong> {d.assets}
                </div>
                <div className="text-slate-500 dark:text-slate-400 leading-snug">
                  <strong>پیامد:</strong> {d.impact}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Appendix P (International References) + Appendix T (Editorial Merge Decisions) */}
      <section className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        <div className="xl:col-span-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-6 space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Globe2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span>منابع پایه بین‌المللی برای راستی‌آزمایی (پیوست پ)</span>
          </h2>
          <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            {INTERNATIONAL_REFERENCES.map((ref) => (
              <div key={ref.doc} className="py-3 space-y-1">
                <div className="flex flex-wrap items-center justify-between gap-1">
                  <span dir="ltr" className="font-mono-code font-bold text-blue-700 dark:text-blue-400">
                    {ref.org}
                  </span>
                </div>
                <div dir="ltr" className="font-semibold text-slate-800 dark:text-slate-200 text-left">
                  {ref.doc}
                </div>
                <div className="text-slate-600 dark:text-slate-400">{ref.use}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="xl:col-span-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-6 space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Scale className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <span>تصمیم‌های ویراستاری و یکپارچه‌سازی دو متن مبنا (پیوست ت)</span>
          </h2>
          <div className="space-y-3 text-xs">
            {EDITORIAL_DECISIONS.map((ed) => (
              <div
                key={ed.mismatch}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40 p-3.5 space-y-1.5"
              >
                <div className="text-slate-500 dark:text-slate-400">
                  <strong>ناهمسانی دو متن:</strong> {ed.mismatch}
                </div>
                <div className="text-slate-900 dark:text-slate-100 font-semibold leading-relaxed">
                  <strong>تصمیم یکپارچه‌سازی:</strong> {ed.decision}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
