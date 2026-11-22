import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  Download,
  Plus,
  RotateCcw,
  Sliders,
  Trash2,
} from 'lucide-react';
import { SUB_HAZARDS } from '../data/familiesAndSubhazards';
import { PRIORITY_LEVELS, RISK_CRITERIA } from '../data/frameworkCore';
import { SubHazard, toPersianDigits } from '../data/types';
import { downloadCsv } from '../utils/exportCsv';

interface RiskLabViewProps {
  preloadedSubHazard?: SubHazard | null;
}

interface SavedAssessment {
  id: string;
  code: string;
  title: string;
  r0: number;
  weightedR: number;
  confidence: 'پایین' | 'متوسط' | 'بالا';
  priority: 'P1' | 'P2' | 'P3' | 'P4';
}

const SAMPLE_PROFILES: Array<{
  code: string;
  label: string;
  scores: Record<string, number>;
  confidence: 'پایین' | 'متوسط' | 'بالا';
}> = [
  {
    code: 'BIO-02',
    label: 'BIO-02 · بیماری‌های مشترک انسان و حیوان',
    scores: {
      likelihood: 4,
      impact: 4,
      geoSpread: 4,
      speed: 4,
      duration: 3,
      vulnerability: 4,
      cascading: 4,
      foreignDep: 3,
      detectionDiff: 3,
      responseDiff: 3,
    },
    confidence: 'متوسط',
  },
  {
    code: 'WAT-06',
    label: 'WAT-06 · خشکسالی و افت منابع آب',
    scores: {
      likelihood: 5,
      impact: 5,
      geoSpread: 5,
      speed: 2,
      duration: 5,
      vulnerability: 5,
      cascading: 5,
      foreignDep: 2,
      detectionDiff: 2,
      responseDiff: 4,
    },
    confidence: 'بالا',
  },
  {
    code: 'BIO-15',
    label: 'BIO-15 · عوامل زیستی نوظهور و ناشناخته',
    scores: {
      likelihood: 2,
      impact: 5,
      geoSpread: 4,
      speed: 5,
      duration: 4,
      vulnerability: 5,
      cascading: 5,
      foreignDep: 4,
      detectionDiff: 5,
      responseDiff: 4,
    },
    confidence: 'پایین',
  },
  {
    code: 'CYB-05',
    label: 'CYB-05 · حمله به زیرساخت انرژی و برق',
    scores: {
      likelihood: 3,
      impact: 4,
      geoSpread: 4,
      speed: 5,
      duration: 3,
      vulnerability: 4,
      cascading: 5,
      foreignDep: 3,
      detectionDiff: 3,
      responseDiff: 3,
    },
    confidence: 'متوسط',
  },
];

const DEFAULT_WEIGHTS: Record<string, number> = Object.fromEntries(
  RISK_CRITERIA.map((c) => [c.id, 10])
);

const DEFAULT_SCORES: Record<string, number> = {
  likelihood: 4,
  impact: 4,
  geoSpread: 4,
  speed: 4,
  duration: 3,
  vulnerability: 4,
  cascading: 4,
  foreignDep: 3,
  detectionDiff: 3,
  responseDiff: 3,
};

function getPriorityBand(weightedScore: number): 'P1' | 'P2' | 'P3' | 'P4' {
  if (weightedScore >= 4.0) return 'P1';
  if (weightedScore >= 3.2) return 'P2';
  if (weightedScore >= 2.3) return 'P3';
  return 'P4';
}

export const RiskLabView: React.FC<RiskLabViewProps> = ({ preloadedSubHazard }) => {
  const [selectedSubCode, setSelectedSubCode] = useState<string>(
    preloadedSubHazard?.code || 'BIO-02'
  );
  const [scores, setScores] = useState<Record<string, number>>(DEFAULT_SCORES);
  const [rawWeights, setRawWeights] = useState<Record<string, number>>(DEFAULT_WEIGHTS);
  const [confidence, setConfidence] = useState<'پایین' | 'متوسط' | 'بالا'>('متوسط');
  const [savedList, setSavedList] = useState<SavedAssessment[]>([
    {
      id: 'init-1',
      code: 'WAT-06',
      title: 'خشکسالی و افت منابع آب',
      r0: 25,
      weightedR: 4.0,
      confidence: 'بالا',
      priority: 'P1',
    },
    {
      id: 'init-2',
      code: 'BIO-15',
      title: 'عوامل زیستی نوظهور و ناشناخته',
      r0: 10,
      weightedR: 4.3,
      confidence: 'پایین',
      priority: 'P1',
    },
    {
      id: 'init-3',
      code: 'CYB-05',
      title: 'حمله به زیرساخت انرژی و برق',
      r0: 12,
      weightedR: 3.7,
      confidence: 'متوسط',
      priority: 'P2',
    },
  ]);

  useEffect(() => {
    if (preloadedSubHazard) {
      setSelectedSubCode(preloadedSubHazard.code);
    }
  }, [preloadedSubHazard]);

  const activeSub = useMemo(
    () => SUB_HAZARDS.find((s) => s.code === selectedSubCode) || SUB_HAZARDS[0],
    [selectedSubCode]
  );

  const normalizedWeights = useMemo(() => {
    const sum = Object.values(rawWeights).reduce((acc, v) => acc + v, 0) || 1;
    const norm: Record<string, number> = {};
    for (const k of Object.keys(rawWeights)) {
      norm[k] = rawWeights[k] / sum;
    }
    return norm;
  }, [rawWeights]);

  const r0 = scores.likelihood * scores.impact;
  const weightedR = useMemo(() => {
    let total = 0;
    for (const c of RISK_CRITERIA) {
      total += (normalizedWeights[c.id] || 0) * (scores[c.id] || 1);
    }
    return Number(total.toFixed(2));
  }, [normalizedWeights, scores]);

  const priorityCode = getPriorityBand(weightedR);
  const priorityMeta = PRIORITY_LEVELS.find((p) => p.code === priorityCode) || PRIORITY_LEVELS[0];

  // 10-Axis Radar Polygon math
  const radarGeometry = useMemo(() => {
    const cx = 190;
    const cy = 180;
    const maxR = 120;
    const total = RISK_CRITERIA.length;

    const points = RISK_CRITERIA.map((c, idx) => {
      const angle = -Math.PI / 2 + (2 * Math.PI * idx) / total;
      const val = scores[c.id] || 1;
      const r = (val / 5) * maxR;
      const labelR = maxR + 28;
      return {
        id: c.id,
        title: c.title,
        val,
        x: cx + r * Math.cos(angle),
        y: cy + r * Math.sin(angle),
        outerX: cx + maxR * Math.cos(angle),
        outerY: cy + maxR * Math.sin(angle),
        labelX: cx + labelR * Math.cos(angle),
        labelY: cy + labelR * Math.sin(angle),
      };
    });

    const polygonStr = points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
    return { cx, cy, maxR, points, polygonStr };
  }, [scores]);

  const handleSaveCurrent = () => {
    const newItem: SavedAssessment = {
      id: `${activeSub.code}-${Date.now()}`,
      code: activeSub.code,
      title: activeSub.title,
      r0,
      weightedR,
      confidence,
      priority: priorityCode,
    };
    setSavedList((prev) => [newItem, ...prev.filter((i) => i.code !== activeSub.code)]);
  };

  const handleExportSaved = () => {
    downloadCsv(
      'risk-assessment-lab.csv',
      ['کد زیرشاخه', 'عنوان', 'امتیاز غربالگری (R0=L×I)', 'امتیاز وزنی چندمعیاره (R)', 'سطح اطمینان شواهد', 'باند اولویت تمرینی'],
      savedList.map((i) => [i.code, i.title, i.r0, i.weightedR, i.confidence, i.priority])
    );
  };

  return (
    <div className="space-y-6">
      {/* Header & Methodological Guardrail */}
      <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-6 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
              آزمایشگاه ارزیابی و اولویت‌بندی چندمعیاره ریسک (فصل ۷)
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              غربالگری سریع <span dir="ltr" className="font-mono-code font-semibold text-slate-800 dark:text-slate-200">R₀ = L × I</span> و مدل وزنی ده‌معیاره <span dir="ltr" className="font-mono-code font-semibold text-slate-800 dark:text-slate-200">R = Σ(wᵢ × sᵢ)</span> با ثبت مستقل سطح اطمینان شواهد.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setRawWeights(DEFAULT_WEIGHTS)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>بازگشت به وزن برابر</span>
            </button>
            <button
              type="button"
              onClick={handleSaveCurrent}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>ثبت در جدول مقایسه</span>
            </button>
          </div>
        </div>

        {/* Methodological caution directly from Chapter 7-3 */}
        <div className="rounded-xl border border-amber-200 dark:border-amber-800/60 bg-amber-50/70 dark:bg-amber-950/25 px-4 py-3 flex items-start gap-3 text-xs text-amber-950 dark:text-amber-200">
          <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <span>
            <strong>محدودیت مدل (فصل ۷ـ۳):</strong> آستانه‌های عددی P1 تا P4 و وزن معیارها در سند مادر عمداً قطعی نشده‌اند. ارقام این آزمایشگاه صرفاً برای شبیه‌سازی کارشناسی و آزمون حساسیت است و نباید رتبه‌بندی رسمی تلقی شود.
          </span>
        </div>

        {/* Sub-hazard selector & Quick Sample Profiles */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 pt-1">
          <div className="lg:col-span-5">
            <label
              htmlFor="hazard-select"
              className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5"
            >
              انتخاب زیرشاخه مخاطره از اطلس (۱۴۹ مورد)
            </label>
            <select
              id="hazard-select"
              value={selectedSubCode}
              onChange={(e) => setSelectedSubCode(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500/40"
            >
              {SUB_HAZARDS.map((s) => (
                <option key={s.code} value={s.code}>
                  {s.code} — {s.title}
                </option>
              ))}
            </select>
          </div>

          <div className="lg:col-span-7">
            <div className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              بارگذاری نمونه تحلیلی آماده برای آزمون حساسیت:
            </div>
            <div className="flex flex-wrap gap-1.5">
              {SAMPLE_PROFILES.map((prof) => (
                <button
                  key={prof.code}
                  type="button"
                  onClick={() => {
                    setSelectedSubCode(prof.code);
                    setScores(prof.scores);
                    setConfidence(prof.confidence);
                  }}
                  className={`px-3 py-2 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
                    selectedSubCode === prof.code
                      ? 'border-teal-500 bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-200'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-slate-400'
                  }`}
                >
                  {prof.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Main Split: 10-Criteria Sliders + Live Visuals (Radar + 5x5 Matrix + Priority) */}
      <section className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* 10 Criteria Interactive Controls */}
        <div className="xl:col-span-7 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span>امتیازدهی ۱۰ معیار (مقیاس ۱ تا ۵) و وزن‌دهی (Σwᵢ = ۱)</span>
            </h2>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              ۱: سهم کم در ریسک · ۵: سهم زیاد
            </span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {RISK_CRITERIA.map((c) => {
              const sVal = scores[c.id] || 1;
              const wPct = Math.round((normalizedWeights[c.id] || 0) * 100);
              return (
                <div key={c.id} className="py-3.5 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        {c.title}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 mr-2">
                        {c.question}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs tabular-nums shrink-0">
                      <span className="text-slate-500 dark:text-slate-400">
                        وزن مؤثر: <strong className="text-slate-800 dark:text-slate-200">{toPersianDigits(wPct)}٪</strong>
                      </span>
                      <span
                        className="font-extrabold px-2 py-0.5 rounded-md text-white"
                        style={{
                          backgroundColor:
                            sVal >= 5
                              ? '#DC2626'
                              : sVal === 4
                              ? '#EA580C'
                              : sVal === 3
                              ? '#D97706'
                              : sVal === 2
                              ? '#2563EB'
                              : '#0D9488',
                        }}
                      >
                        {toPersianDigits(sVal)} / ۵
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                    {/* Score 1-5 buttons */}
                    <div className="sm:col-span-7 flex items-center gap-1.5">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setScores((prev) => ({ ...prev, [c.id]: n }))}
                          className={`flex-1 py-1.5 rounded-lg text-xs font-bold tabular-nums transition-colors cursor-pointer ${
                            sVal === n
                              ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                          }`}
                        >
                          {toPersianDigits(n)}
                        </button>
                      ))}
                    </div>

                    {/* Weight slider */}
                    <div className="sm:col-span-5 flex items-center gap-2">
                      <span className="text-[11px] text-slate-400 shrink-0">وزن:</span>
                      <input
                        type="range"
                        min={1}
                        max={30}
                        value={rawWeights[c.id]}
                        onChange={(e) =>
                          setRawWeights((prev) => ({
                            ...prev,
                            [c.id]: Number(e.target.value),
                          }))
                        }
                        aria-label={`وزن معیار ${c.title}`}
                        className="w-full accent-teal-600 cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>{c.lowNote}</span>
                    <span>{c.highNote}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Analytical Visualizations */}
        <div className="xl:col-span-5 space-y-6">
          {/* Live Result Summary + Evidence Confidence */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-6 space-y-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div dir="ltr" className="font-mono-code text-xs font-bold text-teal-600 dark:text-teal-400">
                  {activeSub.code}
                </div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5">
                  {activeSub.title}
                </h3>
              </div>
              <div
                className={`px-3 py-1.5 rounded-xl border text-center shrink-0 ${priorityMeta.bgClass} ${priorityMeta.borderClass}`}
              >
                <div dir="ltr" className={`font-mono-code text-base font-extrabold ${priorityMeta.textClass}`}>
                  {priorityMeta.code}
                </div>
                <div className={`text-[11px] font-semibold ${priorityMeta.textClass}`}>
                  {priorityMeta.title}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 p-3.5">
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  امتیاز وزنی چندمعیاره (R)
                </div>
                <div className="text-2xl font-extrabold tabular-nums text-slate-900 dark:text-white mt-1">
                  {toPersianDigits(weightedR.toFixed(2))}{' '}
                  <span className="text-xs font-medium text-slate-400">/ ۵</span>
                </div>
              </div>
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 p-3.5">
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  غربالگری سریع (R₀ = L × I)
                </div>
                <div className="text-2xl font-extrabold tabular-nums text-slate-900 dark:text-white mt-1">
                  {toPersianDigits(r0)}{' '}
                  <span className="text-xs font-medium text-slate-400">/ ۲۵</span>
                </div>
              </div>
            </div>

            <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              <strong className="text-slate-900 dark:text-white">کارکرد مدیریتی {priorityMeta.code}: </strong>
              {priorityMeta.action}
            </div>

            {/* Separate Evidence Confidence Selector */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  سطح اطمینان شواهد (جدا از امتیاز ریسک):
                </span>
                <span className="text-slate-500 dark:text-slate-400">اصل عدم قطعیت‌پذیری</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {(['پایین', 'متوسط', 'بالا'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setConfidence(lvl)}
                    className={`py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      confidence === lvl
                        ? lvl === 'پایین'
                          ? 'bg-rose-600 text-white'
                          : lvl === 'متوسط'
                          ? 'bg-amber-600 text-white'
                          : 'bg-teal-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    اطمینان {lvl}
                  </button>
                ))}
              </div>
              {weightedR >= 3.2 && confidence === 'پایین' && (
                <div className="rounded-lg bg-rose-50 dark:bg-rose-950/35 border border-rose-200 dark:border-rose-800 p-3 text-xs text-rose-800 dark:text-rose-200 font-medium">
                  هشدار روش‌شناختی (فصل ۷ـ۳): ریسک بالا با اطمینان پایین ثبت شده است؛ این مخاطره باید در <strong>اولویت بررسی تخصصی و تولید داده</strong> قرار گیرد.
                </div>
              )}
            </div>
          </div>

          {/* 10-Axis Live SVG Radar Chart */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-5">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
              نمایه راداری ۱۰ معیار ریسک
            </h3>
            <div className="flex justify-center">
              <svg
                viewBox="0 0 380 360"
                className="w-full max-w-[360px] h-auto select-none"
                role="img"
                aria-label="نمودار راداری ۱۰ معیار ارزیابی ریسک"
              >
                {/* Concentric pentagons / decagons */}
                {[1, 2, 3, 4, 5].map((ring) => {
                  const r = (ring / 5) * radarGeometry.maxR;
                  const pts = RISK_CRITERIA.map((_, idx) => {
                    const a = -Math.PI / 2 + (2 * Math.PI * idx) / RISK_CRITERIA.length;
                    return `${(radarGeometry.cx + r * Math.cos(a)).toFixed(1)},${(
                      radarGeometry.cy +
                      r * Math.sin(a)
                    ).toFixed(1)}`;
                  }).join(' ');
                  return (
                    <polygon
                      key={ring}
                      points={pts}
                      fill="none"
                      stroke="#94A3B8"
                      strokeOpacity={ring === 5 ? 0.45 : 0.22}
                      strokeWidth={1}
                    />
                  );
                })}

                {/* Axis lines & labels */}
                {radarGeometry.points.map((pt) => (
                  <g key={pt.id}>
                    <line
                      x1={radarGeometry.cx}
                      y1={radarGeometry.cy}
                      x2={pt.outerX}
                      y2={pt.outerY}
                      stroke="#94A3B8"
                      strokeOpacity={0.25}
                      strokeWidth={1}
                    />
                    <text
                      x={pt.labelX}
                      y={pt.labelY}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="fill-slate-600 dark:fill-slate-300 text-[9.5px] font-semibold"
                    >
                      {pt.title}
                    </text>
                  </g>
                ))}

                {/* Data Polygon */}
                <polygon
                  points={radarGeometry.polygonStr}
                  fill={priorityMeta.color}
                  fillOpacity={0.22}
                  stroke={priorityMeta.color}
                  strokeWidth={2.2}
                />

                {/* Vertex dots */}
                {radarGeometry.points.map((pt) => (
                  <circle
                    key={pt.id}
                    cx={pt.x}
                    cy={pt.y}
                    r={4}
                    fill={priorityMeta.color}
                    stroke="#FFFFFF"
                    strokeWidth={1.5}
                  />
                ))}
              </svg>
            </div>
          </div>

          {/* Interactive 5x5 Rapid Screening Heatmap (R0 = L x I) */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                ماتریس ۵×۵ غربالگری سریع (R₀ = L × I)
              </h3>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                کلیک روی سلول برای تغییر L و I
              </span>
            </div>

            <div className="grid grid-cols-6 gap-1.5 text-center text-xs">
              <div className="flex items-center justify-center text-[10px] text-slate-400 font-semibold">
                احتمال ↓ / شدت ←
              </div>
              {[1, 2, 3, 4, 5].map((imp) => (
                <div key={imp} className="py-1 font-bold text-slate-600 dark:text-slate-300 tabular-nums">
                  I={toPersianDigits(imp)}
                </div>
              ))}

              {[5, 4, 3, 2, 1].map((lik) => (
                <React.Fragment key={lik}>
                  <div className="flex items-center justify-center font-bold text-slate-600 dark:text-slate-300 tabular-nums">
                    L={toPersianDigits(lik)}
                  </div>
                  {[1, 2, 3, 4, 5].map((imp) => {
                    const val = lik * imp;
                    const isActive = scores.likelihood === lik && scores.impact === imp;
                    const bg =
                      val >= 16
                        ? 'bg-red-500/90 text-white'
                        : val >= 10
                        ? 'bg-orange-500/85 text-white'
                        : val >= 5
                        ? 'bg-amber-400/85 text-slate-950'
                        : 'bg-teal-500/80 text-white';

                    return (
                      <button
                        key={`${lik}-${imp}`}
                        type="button"
                        onClick={() =>
                          setScores((prev) => ({
                            ...prev,
                            likelihood: lik,
                            impact: imp,
                          }))
                        }
                        className={`h-10 rounded-lg font-bold tabular-nums transition-transform cursor-pointer ${bg} ${
                          isActive
                            ? 'ring-2 ring-slate-950 dark:ring-white scale-105 shadow-md'
                            : 'opacity-80 hover:opacity-100'
                        }`}
                      >
                        {toPersianDigits(val)}
                      </button>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Saved Comparison Table */}
      <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              جدول مقایسه ارزیابی‌های ثبت‌شده (ریسک در برابر سطح اطمینان)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              امکان مقایسه همزمان امتیاز غربالگری، امتیاز وزنی چندمعیاره و سطح اطمینان شواهد
            </p>
          </div>
          <button
            type="button"
            onClick={handleExportSaved}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>خروجی CSV جدول مقایسه</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300">
                <th className="py-3 px-4">کد</th>
                <th className="py-3 px-4">زیرشاخه مخاطره</th>
                <th className="py-3 px-4 tabular-nums">غربالگری R₀ (از ۲۵)</th>
                <th className="py-3 px-4 tabular-nums">امتیاز وزنی R (از ۵)</th>
                <th className="py-3 px-4">سطح اطمینان</th>
                <th className="py-3 px-4">باند تمرینی</th>
                <th className="py-3 px-4">اولویت تولید داده</th>
                <th className="py-3 px-4 text-center">حذف</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {savedList.map((item) => {
                const pMeta = PRIORITY_LEVELS.find((p) => p.code === item.priority) || PRIORITY_LEVELS[0];
                const needsDataPriority = item.weightedR >= 3.2 && item.confidence === 'پایین';
                return (
                  <tr key={item.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                    <td dir="ltr" className="py-3 px-4 font-mono-code font-bold text-teal-700 dark:text-teal-400">
                      {item.code}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">
                      {item.title}
                    </td>
                    <td className="py-3 px-4 tabular-nums font-bold text-slate-700 dark:text-slate-200">
                      {toPersianDigits(item.r0)}
                    </td>
                    <td className="py-3 px-4 tabular-nums font-extrabold text-slate-900 dark:text-white">
                      {toPersianDigits(item.weightedR.toFixed(2))}
                    </td>
                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                      {item.confidence}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`font-mono-code font-bold ${pMeta.textClass}`}>
                        {item.priority} ({pMeta.title})
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs">
                      {needsDataPriority ? (
                        <span className="font-bold text-rose-600 dark:text-rose-400">
                          اولویت فوری بررسی و تولید داده
                        </span>
                      ) : (
                        <span className="text-slate-500 dark:text-slate-400">مطابق برنامه پایش</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        type="button"
                        onClick={() =>
                          setSavedList((prev) => prev.filter((x) => x.id !== item.id))
                        }
                        aria-label={`حذف ${item.code}`}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
