import React, { useMemo, useState } from 'react';
import {
  BellRing,
  Building2,
  Database,
  Layers,
  ShieldAlert,
  Users,
} from 'lucide-react';
import { SUB_HAZARDS } from '../data/familiesAndSubhazards';
import {
  AGENCY_DOMAINS,
  DATA_ARCHITECTURE_LAYERS,
  DATA_CADENCE_MATRIX,
  DATA_GOVERNANCE_PRINCIPLES,
  INSTITUTIONAL_ARCHITECTURE,
  INSTITUTIONAL_ROLES,
  WARNING_LEVELS,
} from '../data/frameworkCore';
import { toPersianDigits } from '../data/types';

type RaciValue = '' | 'R' | 'A' | 'C' | 'I';

const RACI_AGENCIES = [
  'وزارت بهداشت',
  'سازمان دامپزشکی',
  'جهاد کشاورزی',
  'محیط‌زیست',
  'وزارت نیرو',
  'مدیریت بحران',
];

const INITIAL_RACI_ROWS: Array<{
  id: string;
  activity: string;
  assignments: Record<string, RaciValue>;
}> = [
  {
    id: 'zoonosis',
    activity: 'پایش و کنترل کانون بیماری مشترک انسان و حیوان (BIO-02)',
    assignments: {
      'وزارت بهداشت': 'A',
      'سازمان دامپزشکی': 'R',
      'جهاد کشاورزی': 'C',
      'محیط‌زیست': 'R',
      'وزارت نیرو': 'I',
      'مدیریت بحران': 'C',
    },
  },
  {
    id: 'water-contam',
    activity: 'پاسخ به آلودگی میکروبی یا شیمیایی منابع آب شرب (WAT-01/02)',
    assignments: {
      'وزارت بهداشت': 'R',
      'سازمان دامپزشکی': 'I',
      'جهاد کشاورزی': 'C',
      'محیط‌زیست': 'R',
      'وزارت نیرو': 'A',
      'مدیریت بحران': 'C',
    },
  },
  {
    id: 'agri-quarantine',
    activity: 'مهار آفت قرنطینه‌ای گیاهی و حفاظت از امنیت غذایی (AGR-02)',
    assignments: {
      'وزارت بهداشت': 'I',
      'سازمان دامپزشکی': 'I',
      'جهاد کشاورزی': 'A',
      'محیط‌زیست': 'C',
      'وزارت نیرو': 'I',
      'مدیریت بحران': 'C',
    },
  },
  {
    id: 'multi-cascade',
    activity: 'هماهنگی پاسخ فرابخشی در سناریوی سیل و حادثه صنعتی (S01)',
    assignments: {
      'وزارت بهداشت': 'R',
      'سازمان دامپزشکی': 'C',
      'جهاد کشاورزی': 'C',
      'محیط‌زیست': 'R',
      'وزارت نیرو': 'R',
      'مدیریت بحران': 'A',
    },
  },
];

const RACI_CYCLE: RaciValue[] = ['', 'R', 'A', 'C', 'I'];

export const GovernanceView: React.FC = () => {
  const [selectedAgencyId, setSelectedAgencyId] = useState<string>(AGENCY_DOMAINS[0].id);
  const [activeWarningId, setActiveWarningId] = useState<'green' | 'yellow' | 'orange' | 'red'>(
    'orange'
  );
  const [raciRows, setRaciRows] = useState(INITIAL_RACI_ROWS);

  const selectedAgency = useMemo(
    () => AGENCY_DOMAINS.find((a) => a.id === selectedAgencyId) || AGENCY_DOMAINS[0],
    [selectedAgencyId]
  );

  const agencyLinkedSubHazards = useMemo(() => {
    return SUB_HAZARDS.filter((sub) =>
      selectedAgency.matchKeywords.some((kw) => sub.agencies.includes(kw))
    );
  }, [selectedAgency]);

  const activeWarning = useMemo(
    () => WARNING_LEVELS.find((w) => w.id === activeWarningId) || WARNING_LEVELS[0],
    [activeWarningId]
  );

  const toggleRaciCell = (rowId: string, agency: string) => {
    setRaciRows((prev) =>
      prev.map((row) => {
        if (row.id !== rowId) return row;
        const curr = row.assignments[agency] || '';
        const next = RACI_CYCLE[(RACI_CYCLE.indexOf(curr) + 1) % RACI_CYCLE.length];
        const updated = { ...row.assignments, [agency]: next };
        // Enforce Chapter 8-4 rule: only ONE Accountable (A) per activity
        if (next === 'A') {
          for (const key of Object.keys(updated)) {
            if (key !== agency && updated[key] === 'A') {
              updated[key] = 'R';
            }
          }
        }
        return { ...row, assignments: updated };
      })
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-6">
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
          حکمرانی ملی، معماری داده و نظام هشدار چهارسطحی (فصول ۸ و ۹)
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
          تفکیک مسئول تخصصی، هماهنگ‌کننده ملی، تولیدکننده داده و پاسخ‌دهنده عملیاتی همراه با معماری ۶لایه پایش و الگوی چهارسطحی هشدار.
        </p>
      </section>

      {/* Interactive 4-Level Early Warning Console (Chapter 9-4) */}
      <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-6 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BellRing className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              <span>مدل چهارسطحی هشدار زودهنگام (فصل ۹ـ۴)</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              سطح رنگی، سطح مدیریتی و اقدام مورد انتظار را نشان می‌دهد؛ نه اینکه شدت علمی همه مخاطرات با یک معیار واحد سنجیده شود.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {WARNING_LEVELS.map((w) => {
            const active = w.id === activeWarning.id;
            return (
              <button
                key={w.id}
                type="button"
                onClick={() => setActiveWarningId(w.id)}
                className={`text-right rounded-xl border p-4 transition-all cursor-pointer ${
                  active
                    ? 'text-white border-transparent shadow-md'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
                style={active ? { backgroundColor: w.hex } : undefined}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-sm font-extrabold ${
                      active ? 'text-white' : 'text-slate-900 dark:text-white'
                    }`}
                  >
                    سطح {w.colorName}
                  </span>
                  <span
                    className="h-3 w-3 rounded-full border border-white/70"
                    style={{ backgroundColor: active ? '#FFFFFF' : w.hex }}
                  />
                </div>
                <div
                  className={`text-xs font-bold mt-1 ${
                    active ? 'text-white/95' : 'text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {w.title}
                </div>
              </button>
            );
          })}
        </div>

        <div className={`rounded-xl border p-5 ${activeWarning.bgClass} ${activeWarning.borderClass}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className={`text-xs font-bold ${activeWarning.textClass}`}>
                تعریف وضعیت در سطح {activeWarning.colorName} ({activeWarning.title})
              </div>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-relaxed">
                {activeWarning.status}
              </p>
            </div>
            <div className="space-y-1">
              <div className={`text-xs font-bold ${activeWarning.textClass}`}>
                اقدام مدیریتی و عملیاتی مورد انتظار
              </div>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-relaxed">
                {activeWarning.action}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4-Tier Institutional Architecture + 8 Roles */}
      <section className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-6 space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span>معماری نهادی چهارسطحی پیشنهادی (فصل ۸ـ۱)</span>
          </h2>
          <div className="space-y-3">
            {INSTITUTIONAL_ARCHITECTURE.map((tier, idx) => (
              <div
                key={tier.level}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 p-4 space-y-1.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-extrabold" style={{ color: tier.color }}>
                    {toPersianDigits(idx + 1)}. {tier.level}
                  </span>
                </div>
                <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed">
                  <strong>مأموریت:</strong> {tier.mission}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  <strong>مرز مسئولیت:</strong> {tier.boundary}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="xl:col-span-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-6 space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            <span>۸ نقش نهادی و حکمرانی داده (فصل ۸ـ۲)</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {INSTITUTIONAL_ROLES.map((role) => (
              <div
                key={role.code}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 p-3.5 space-y-1"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {role.title}
                  </span>
                  <span
                    dir="ltr"
                    className="font-mono-code text-[10.5px] font-semibold text-teal-700 dark:text-teal-400"
                  >
                    {role.code}
                  </span>
                </div>
                <p className="text-[11.5px] text-slate-600 dark:text-slate-300 leading-snug">
                  {role.definition}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200/60 dark:border-slate-800">
                  نمونه: {role.example}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive 15 Specialized Agency Domains Explorer */}
      <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-6 space-y-5">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            کاوشگر ۱۵ حوزه تخصصی و دستگاه‌های پیشنهادی (فصل ۸ـ۳)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            با انتخاب هر حوزه، فهرست زیرشاخه‌های مرتبط در اطلس ۱۴۹موردی که به نقش پیشنهادی این دستگاه اشاره دارند نمایش داده می‌شود (پیشنهاد اولیه، غیرحقوقی).
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          <div className="xl:col-span-5 grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-2 gap-2">
            {AGENCY_DOMAINS.map((ag) => {
              const active = ag.id === selectedAgency.id;
              return (
                <button
                  key={ag.id}
                  type="button"
                  onClick={() => setSelectedAgencyId(ag.id)}
                  className={`text-right rounded-xl border p-3 transition-all cursor-pointer ${
                    active
                      ? 'border-transparent text-white shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/50 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                  style={active ? { backgroundColor: ag.color } : undefined}
                >
                  <div
                    className={`text-xs font-bold ${
                      active ? 'text-white' : 'text-slate-900 dark:text-slate-100'
                    }`}
                  >
                    {ag.domain}
                  </div>
                  <div
                    className={`text-[11px] mt-0.5 line-clamp-1 ${
                      active ? 'text-white/85' : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {ag.agencies}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="xl:col-span-7 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/50 p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  {selectedAgency.domain} — {selectedAgency.agencies}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                  نقش غالب: {selectedAgency.dominantRole}
                </p>
              </div>
              <span
                className="text-xs font-bold tabular-nums px-2.5 py-1 rounded-lg text-white shrink-0"
                style={{ backgroundColor: selectedAgency.color }}
              >
                {toPersianDigits(agencyLinkedSubHazards.length)} زیرشاخه مرتبط
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[300px] overflow-y-auto pl-1">
              {agencyLinkedSubHazards.map((sub) => (
                <div
                  key={sub.code}
                  className="rounded-lg border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#111827] p-3 text-xs"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      dir="ltr"
                      className="font-mono-code font-bold text-[11px]"
                      style={{ color: selectedAgency.color }}
                    >
                      {sub.code}
                    </span>
                    <span className="text-[10.5px] text-slate-400">{sub.familyCode}</span>
                  </div>
                  <div className="font-bold text-slate-800 dark:text-slate-100 mt-1">
                    {sub.title}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                    پایش: {sub.indicators}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Interactive RACI Matrix Builder (Chapter 8-4) */}
      <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-violet-600 dark:text-violet-400" />
              <span>الگوی تعاملی ماتریس RACI (فصل ۸ـ۴)</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              روی هر خانه کلیک کنید تا نقش تغییر کند. قاعده سند به صورت خودکار اعمال می‌شود: <strong>برای هر وظیفه دقیقاً یک پاسخ‌گوی نهایی (A) مجاز است.</strong>
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-300 shrink-0">
            <span><strong className="text-teal-600">R</strong> اجراکننده</span>
            <span><strong className="text-rose-600">A</strong> پاسخ‌گوی نهایی</span>
            <span><strong className="text-blue-600">C</strong> مشاور</span>
            <span><strong className="text-amber-600">I</strong> مطلع</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 font-bold text-slate-600 dark:text-slate-300">
                <th className="py-3 px-4 min-w-[260px]">فعالیت یا سناریوی نمونه</th>
                {RACI_AGENCIES.map((ag) => (
                  <th key={ag} className="py-3 px-2 text-center whitespace-nowrap">
                    {ag}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {raciRows.map((row) => (
                <tr key={row.id}>
                  <td className="py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">
                    {row.activity}
                  </td>
                  {RACI_AGENCIES.map((ag) => {
                    const val = row.assignments[ag] || '';
                    const style =
                      val === 'A'
                        ? 'bg-rose-600 text-white'
                        : val === 'R'
                        ? 'bg-teal-600 text-white'
                        : val === 'C'
                        ? 'bg-blue-600 text-white'
                        : val === 'I'
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400';

                    return (
                      <td key={ag} className="py-2.5 px-2 text-center">
                        <button
                          type="button"
                          onClick={() => toggleRaciCell(row.id, ag)}
                          className={`w-9 h-9 rounded-lg font-mono-code font-bold text-xs transition-transform hover:scale-105 cursor-pointer ${style}`}
                        >
                          {val || '—'}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 6-Layer Data Architecture + 10-Domain Data Cadence */}
      <section className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* 6 Layers */}
        <div className="xl:col-span-7 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-6 space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span>معماری شش‌لایه داده و پایش ملی (فصل ۹ـ۱)</span>
          </h2>
          <div className="space-y-2.5">
            {DATA_ARCHITECTURE_LAYERS.map((layer) => (
              <div
                key={layer.step}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 p-4 flex items-start gap-3.5"
              >
                <div
                  className="w-8 h-8 rounded-lg text-white text-sm font-extrabold flex items-center justify-center shrink-0 tabular-nums"
                  style={{ backgroundColor: layer.color }}
                >
                  {toPersianDigits(layer.step)}
                </div>
                <div className="space-y-1 text-xs">
                  <div className="text-sm font-bold text-slate-900 dark:text-white">
                    {layer.title}
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                    {layer.role}
                  </p>
                  <p className="text-slate-500 dark:text-slate-400">
                    نمونه سامانه/داده: {layer.samples}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Data Cadence + 5 Governance Principles */}
        <div className="xl:col-span-5 space-y-6">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-6 space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              <span>تناوب هدف پیشنهادی دریافت داده (فصل ۹ـ۲)</span>
            </h2>
            <div className="space-y-3">
              {DATA_CADENCE_MATRIX.map((row) => (
                <div key={row.domain} className="space-y-1">
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="font-bold text-slate-800 dark:text-slate-100">
                      {row.domain}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      {row.cadence}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${row.speed * 20}%`,
                        backgroundColor:
                          row.speed === 5
                            ? '#E11D48'
                            : row.speed === 4
                            ? '#D97706'
                            : row.speed === 3
                            ? '#2563EB'
                            : '#0D9488',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-6 space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              ۵ اصل حکمرانی داده (فصل ۹ـ۳)
            </h3>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {DATA_GOVERNANCE_PRINCIPLES.map((pr, idx) => (
                <li key={pr} className="flex items-start gap-2">
                  <span className="font-bold text-teal-600 dark:text-teal-400 tabular-nums shrink-0">
                    {toPersianDigits(idx + 1)}.
                  </span>
                  <span>{pr}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
};
