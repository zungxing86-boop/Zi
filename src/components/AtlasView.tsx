import React, { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  Download,
  FileText,
  Filter,
  Search,
  Sparkles,
  X,
} from 'lucide-react';
import { HAZARD_FAMILIES, SUB_HAZARDS } from '../data/familiesAndSubhazards';
import { FIVE_ATLAS_AXES, ORIGIN_CODES, STANDARD_DOSSIER_SECTIONS } from '../data/frameworkCore';
import {
  ANALYTICAL_GROUPS,
  AnalyticalGroupId,
  BiosecurityTierId,
  HazardFamilyCode,
  SubHazard,
  toPersianDigits,
} from '../data/types';
import { downloadCsv } from '../utils/exportCsv';

interface AtlasViewProps {
  initialFamilyFilter?: HazardFamilyCode | null;
  onEvaluateInRiskLab: (sub: SubHazard) => void;
}

export const AtlasView: React.FC<AtlasViewProps> = ({
  initialFamilyFilter,
  onEvaluateInRiskLab,
}) => {
  const [selectedFamily, setSelectedFamily] = useState<HazardFamilyCode | 'ALL'>(
    initialFamilyFilter || 'ALL'
  );
  const [groupFilter, setGroupFilter] = useState<AnalyticalGroupId | 'all'>('all');
  const [tierFilter, setTierFilter] = useState<BiosecurityTierId | 'all'>('all');
  const [onlyNewFamilies, setOnlyNewFamilies] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSubHazard, setActiveSubHazard] = useState<SubHazard | null>(null);

  useEffect(() => {
    if (initialFamilyFilter) {
      setSelectedFamily(initialFamilyFilter);
      setGroupFilter('all');
      setTierFilter('all');
      setOnlyNewFamilies(false);
    }
  }, [initialFamilyFilter]);

  const familyMap = useMemo(() => {
    const map: Record<string, (typeof HAZARD_FAMILIES)[number]> = {};
    for (const f of HAZARD_FAMILIES) map[f.code] = f;
    return map;
  }, []);

  const subCountByFamily = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const s of SUB_HAZARDS) {
      counts[s.familyCode] = (counts[s.familyCode] || 0) + 1;
    }
    return counts;
  }, []);

  const visibleFamilies = useMemo(() => {
    return HAZARD_FAMILIES.filter((f) => {
      if (groupFilter !== 'all' && f.group !== groupFilter) return false;
      if (tierFilter !== 'all' && f.tier !== tierFilter) return false;
      if (onlyNewFamilies && !f.isAddedInMerged) return false;
      return true;
    });
  }, [groupFilter, tierFilter, onlyNewFamilies]);

  const filteredSubHazards = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const visibleFamilyCodes = new Set(visibleFamilies.map((f) => f.code));

    return SUB_HAZARDS.filter((s) => {
      if (!visibleFamilyCodes.has(s.familyCode)) return false;
      if (selectedFamily !== 'ALL' && s.familyCode !== selectedFamily) return false;
      if (!q) return true;
      return (
        s.code.toLowerCase().includes(q) ||
        s.title.toLowerCase().includes(q) ||
        s.exposedOrPathways.toLowerCase().includes(q) ||
        s.agencies.toLowerCase().includes(q) ||
        s.indicators.toLowerCase().includes(q) ||
        (s.consequences && s.consequences.toLowerCase().includes(q))
      );
    });
  }, [visibleFamilies, selectedFamily, searchQuery]);

  const handleExport = () => {
    const headers = [
      'کد زیرشاخه',
      'کد خانواده',
      'خانواده مخاطره',
      'سطح امنیت زیستی',
      'عنوان زیرشاخه',
      'مسیر خطر / حوزه‌های در معرض',
      'پیامدهای مهم',
      'دستگاه‌های تخصصی پیشنهادی',
      'نشانه‌ها و داده‌های پایش',
    ];
    const rows = filteredSubHazards.map((s) => {
      const fam = familyMap[s.familyCode];
      return [
        s.code,
        s.familyCode,
        fam.name,
        `سطح ${fam.tier}`,
        s.title,
        s.exposedOrPathways,
        s.consequences || '—',
        s.agencies,
        s.indicators,
      ];
    });
    downloadCsv('atlas-18-families-subhazards.csv', headers, rows);
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
              اطلس جامع ۱۸ خانواده و ۱۴۹ زیرشاخه مخاطره
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              ماتریس کامل پیوست الف و فصل سوم · کلیک بر روی هر ردیف شناسنامه استاندارد ۱۴بخشی را باز می‌کند.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleExport}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>خروجی CSV ({toPersianDigits(filteredSubHazards.length)})</span>
            </button>
          </div>
        </div>

        {/* Search + Filters */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800/80">
          <div className="lg:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجو در کد (مثلاً BIO-10)، نام مخاطره، دستگاه یا شاخص پایش..."
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/70 pr-10 pl-9 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label="پاک کردن جستجو"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="lg:col-span-7 flex flex-wrap items-center gap-2">
            {/* Tier Filter */}
            <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-100 dark:bg-slate-800/80">
              {(['all', 'A', 'B', 'C'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    setTierFilter(t);
                    setSelectedFamily('ALL');
                  }}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    tierFilter === t
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {t === 'all' ? 'همه سطوح' : `سطح ${t}`}
                </button>
              ))}
            </div>

            {/* Only New Merged Families */}
            <button
              type="button"
              onClick={() => {
                setOnlyNewFamilies((v) => !v);
                setSelectedFamily('ALL');
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                onlyNewFamilies
                  ? 'border-violet-500 bg-violet-600 text-white'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>۳ خانواده تکمیلی (GEO·SPA·OCC)</span>
            </button>

            {(selectedFamily !== 'ALL' ||
              groupFilter !== 'all' ||
              tierFilter !== 'all' ||
              onlyNewFamilies ||
              searchQuery) && (
              <button
                type="button"
                onClick={() => {
                  setSelectedFamily('ALL');
                  setGroupFilter('all');
                  setTierFilter('all');
                  setOnlyNewFamilies(false);
                  setSearchQuery('');
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
              >
                بازنشانی فیلترها
              </button>
            )}
          </div>
        </div>

        {/* 5 Analytical Groups Filter */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 ml-1">
            <Filter className="w-3.5 h-3.5" />
            گروه تحلیلی:
          </span>
          <button
            type="button"
            onClick={() => {
              setGroupFilter('all');
              setSelectedFamily('ALL');
            }}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
              groupFilter === 'all'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            همه گروه‌ها
          </button>
          {Object.values(ANALYTICAL_GROUPS).map((g) => (
            <button
              key={g.id}
              type="button"
              onClick={() => {
                setGroupFilter(groupFilter === g.id ? 'all' : g.id);
                setSelectedFamily('ALL');
              }}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                groupFilter === g.id
                  ? 'text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
              style={groupFilter === g.id ? { backgroundColor: g.color } : undefined}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: groupFilter === g.id ? '#fff' : g.color }}
              />
              <span>{g.name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* 18-Family Interactive Color Mosaic */}
      <section className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 xl:grid-cols-9 gap-2.5">
        {visibleFamilies.map((fam) => {
          const grp = ANALYTICAL_GROUPS[fam.group];
          const isSelected = selectedFamily === fam.code;
          const count = subCountByFamily[fam.code] || 0;
          return (
            <button
              key={fam.code}
              type="button"
              onClick={() =>
                setSelectedFamily(isSelected ? 'ALL' : fam.code)
              }
              className={`text-right rounded-xl border p-3 transition-all cursor-pointer ${
                isSelected
                  ? 'ring-2 ring-offset-1 dark:ring-offset-[#0B0F19] border-transparent text-white shadow-sm'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] hover:border-slate-300 dark:hover:border-slate-700'
              }`}
              style={
                isSelected
                  ? { backgroundColor: grp.color, boxShadow: `0 6px 20px -6px ${grp.color}88` }
                  : undefined
              }
            >
              <div className="flex items-center justify-between">
                <span
                  dir="ltr"
                  className="font-mono-code text-xs font-bold"
                  style={{ color: isSelected ? '#FFFFFF' : grp.color }}
                >
                  {fam.code}
                </span>
                <span
                  className={`text-[11px] font-bold tabular-nums ${
                    isSelected ? 'text-white/90' : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {toPersianDigits(count)}
                </span>
              </div>
              <div
                className={`mt-1.5 text-xs font-bold leading-snug line-clamp-2 ${
                  isSelected ? 'text-white' : 'text-slate-800 dark:text-slate-100'
                }`}
              >
                {fam.shortName}
              </div>
              <div
                className={`mt-1 text-[10px] ${
                  isSelected ? 'text-white/80' : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                سطح {fam.tier} {fam.isAddedInMerged ? '· جدید' : ''}
              </div>
            </button>
          );
        })}
      </section>

      {/* Selected Family Banner (if a single family is chosen) */}
      {selectedFamily !== 'ALL' && (
        <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span
                dir="ltr"
                className="font-mono-code font-bold text-sm"
                style={{ color: ANALYTICAL_GROUPS[familyMap[selectedFamily].group].color }}
              >
                {selectedFamily}
              </span>
              <span aria-hidden="true">·</span>
              <span>{ANALYTICAL_GROUPS[familyMap[selectedFamily].group].name}</span>
              <span aria-hidden="true">·</span>
              <span>جایگاه امنیت زیستی: {familyMap[selectedFamily].biosecurityPosition}</span>
            </div>
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
              {familyMap[selectedFamily].name}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              دامنه نمونه: {familyMap[selectedFamily].sampleScope}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setSelectedFamily('ALL')}
            className="self-start md:self-center px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 whitespace-nowrap shrink-0 cursor-pointer"
          >
            نمایش همه خانواده‌ها
          </button>
        </section>
      )}

      {/* High-Density Data Table */}
      <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>
            نمایش{' '}
            <strong className="text-slate-900 dark:text-white tabular-nums">
              {toPersianDigits(filteredSubHazards.length)}
            </strong>{' '}
            زیرشاخه از مجموع {toPersianDigits(SUB_HAZARDS.length)} زیرشاخه اطلس
          </span>
          <span>برای مشاهده شناسنامه استاندارد، روی هر ردیف کلیک کنید</span>
        </div>

        {filteredSubHazards.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              هیچ زیرشاخه‌ای با فیلترها یا عبارت جستجوی فعلی مطابقت ندارد.
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedFamily('ALL');
                setGroupFilter('all');
                setTierFilter('all');
                setOnlyNewFamilies(false);
                setSearchQuery('');
              }}
              className="px-4 py-2 rounded-lg bg-teal-600 text-white text-xs font-semibold hover:bg-teal-700 cursor-pointer"
            >
              نمایش همه ۱۴۹ زیرشاخه
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60 text-xs font-bold text-slate-600 dark:text-slate-300">
                  <th className="py-3 px-4 whitespace-nowrap">کد</th>
                  <th className="py-3 px-4">زیرشاخه مخاطره</th>
                  <th className="py-3 px-4">مسیر خطر / حوزه‌های در معرض</th>
                  <th className="py-3 px-4">دستگاه‌های تخصصی پیشنهادی</th>
                  <th className="py-3 px-4">نشانه‌ها و داده‌های پایش</th>
                  <th className="py-3 px-4 whitespace-nowrap text-center">اقدام</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs sm:text-[13px]">
                {filteredSubHazards.map((sub) => {
                  const fam = familyMap[sub.familyCode];
                  const grp = ANALYTICAL_GROUPS[fam.group];
                  return (
                    <tr
                      key={sub.code}
                      onClick={() => setActiveSubHazard(sub)}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                    >
                      <td className="py-3 px-4 whitespace-nowrap align-top">
                        <span
                          dir="ltr"
                          className="font-mono-code font-bold text-xs"
                          style={{ color: grp.color }}
                        >
                          {sub.code}
                        </span>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          سطح {fam.tier}
                        </div>
                      </td>
                      <td className="py-3 px-4 align-top font-semibold text-slate-900 dark:text-slate-100 min-w-[190px]">
                        <div>{sub.title}</div>
                        <div className="text-[11px] font-normal text-slate-500 dark:text-slate-400 mt-0.5">
                          {fam.shortName}
                        </div>
                      </td>
                      <td className="py-3 px-4 align-top text-slate-600 dark:text-slate-300 min-w-[200px] leading-relaxed">
                        {sub.exposedOrPathways}
                      </td>
                      <td className="py-3 px-4 align-top text-slate-600 dark:text-slate-300 min-w-[190px] leading-relaxed">
                        {sub.agencies}
                      </td>
                      <td className="py-3 px-4 align-top text-slate-600 dark:text-slate-300 min-w-[200px] leading-relaxed">
                        {sub.indicators}
                      </td>
                      <td
                        className="py-3 px-4 align-top whitespace-nowrap text-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() => setActiveSubHazard(sub)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-teal-400 text-xs font-medium text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>شناسنامه</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Standard Hazard Dossier Drawer/Modal */}
      {activeSubHazard && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-end bg-slate-950/50 backdrop-blur-xs"
          onClick={() => setActiveSubHazard(null)}
        >
          <div
            className="h-full w-full max-w-2xl bg-white dark:bg-[#0F172A] border-r border-slate-200 dark:border-slate-800 shadow-2xl overflow-y-auto p-6 space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span
                    dir="ltr"
                    className="font-mono-code font-bold text-sm px-2 py-0.5 rounded-md text-white"
                    style={{
                      backgroundColor:
                        ANALYTICAL_GROUPS[familyMap[activeSubHazard.familyCode].group].color,
                    }}
                  >
                    {activeSubHazard.code}
                  </span>
                  <span>{familyMap[activeSubHazard.familyCode].name}</span>
                  <span aria-hidden="true">·</span>
                  <span>سطح {familyMap[activeSubHazard.familyCode].tier} امنیت زیستی</span>
                </div>
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                  {activeSubHazard.title}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setActiveSubHazard(null)}
                aria-label="بستن شناسنامه"
                className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Key Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-1">
                <div className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  {activeSubHazard.exposedLabel}
                </div>
                <p className="text-slate-900 dark:text-slate-100 leading-relaxed">
                  {activeSubHazard.exposedOrPathways}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-1">
                <div className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  دستگاه‌های تخصصی پیشنهادی
                </div>
                <p className="text-slate-900 dark:text-slate-100 leading-relaxed">
                  {activeSubHazard.agencies}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-1 sm:col-span-2">
                <div className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  نشانه‌ها، شاخص‌های کلیدی و داده‌های پایش
                </div>
                <p className="text-slate-900 dark:text-slate-100 leading-relaxed">
                  {activeSubHazard.indicators}
                </p>
              </div>
              {activeSubHazard.consequences && (
                <div className="rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/20 p-4 space-y-1 sm:col-span-2">
                  <div className="text-xs font-bold text-rose-700 dark:text-rose-300">
                    پیامدهای مهم
                  </div>
                  <p className="text-slate-900 dark:text-slate-100 leading-relaxed">
                    {activeSubHazard.consequences}
                  </p>
                </div>
              )}
            </div>

            {/* Action to evaluate in Risk Lab */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-teal-200 dark:border-teal-800/70 bg-teal-50/60 dark:bg-teal-950/25 p-4">
              <div className="text-xs text-teal-900 dark:text-teal-200">
                می‌توانید این زیرشاخه را در آزمایشگاه امتیازدهی ۱۰معیاره (فصل ۷) ارزیابی کنید.
              </div>
              <button
                type="button"
                onClick={() => {
                  const target = activeSubHazard;
                  setActiveSubHazard(null);
                  onEvaluateInRiskLab(target);
                }}
                className="inline-flex items-center gap-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Activity className="w-4 h-4" />
                <span>ارسال به آزمایشگاه ریسک</span>
              </button>
            </div>

            {/* 5-Axis Atlas Registration Architecture */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                معماری ثبت پنج‌محوری در اطلس (فصل ۶)
              </h3>
              <div className="grid grid-cols-1 gap-2">
                {FIVE_ATLAS_AXES.map((ax) => (
                  <div
                    key={ax.num}
                    className="rounded-lg border border-slate-200 dark:border-slate-800 px-3.5 py-2.5 text-xs flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3"
                  >
                    <span className="font-bold text-teal-700 dark:text-teal-400 shrink-0 sm:w-36">
                      {toPersianDigits(ax.num)}. {ax.axis}
                    </span>
                    <span className="text-slate-600 dark:text-slate-300">{ax.values}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Origin codes quick guide */}
            <div className="space-y-2.5">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                برچسب‌های منشأ و ماهیت رخداد (قابل ثبت چندبرچسبی)
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {ORIGIN_CODES.map((o) => (
                  <div
                    key={o.code}
                    className="rounded-lg border border-slate-200 dark:border-slate-800 p-2.5 text-xs"
                  >
                    <div dir="ltr" className="font-mono-code font-bold text-blue-600 dark:text-blue-400 text-[11px]">
                      {o.code}
                    </div>
                    <div className="font-bold text-slate-800 dark:text-slate-100 mt-0.5">
                      {o.title}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 14-Section Standard Dossier Blueprint */}
            <div className="space-y-2.5">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                فیلدهای ۱۴بخشی شناسنامه استاندارد مخاطره و رخداد (فصل ۶ـ۳)
              </h3>
              <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden text-xs">
                {STANDARD_DOSSIER_SECTIONS.map((sec, idx) => (
                  <div
                    key={sec.section}
                    className="px-3.5 py-2 flex flex-col sm:flex-row gap-1 sm:gap-4 bg-white dark:bg-[#111827]"
                  >
                    <span className="font-bold text-slate-800 dark:text-slate-200 sm:w-36 shrink-0">
                      {toPersianDigits(idx + 1)}. {sec.section}
                    </span>
                    <span className="text-slate-600 dark:text-slate-400">{sec.fields}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
