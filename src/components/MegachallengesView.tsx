import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  GitBranch,
  Network,
  ShieldAlert,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { HAZARD_FAMILIES } from '../data/familiesAndSubhazards';
import {
  CASCADING_SCENARIOS,
  MEGACHALLENGES,
  NETWORK_RELATIONS,
} from '../data/frameworkCore';
import {
  ANALYTICAL_GROUPS,
  HazardFamilyCode,
  toPersianDigits,
} from '../data/types';

interface MegachallengesViewProps {
  onOpenFamilyInAtlas: (code: HazardFamilyCode) => void;
}

export const MegachallengesView: React.FC<MegachallengesViewProps> = ({
  onOpenFamilyInAtlas,
}) => {
  const [selectedMcCode, setSelectedMcCode] = useState<string>('MC02');
  const [hoveredFamilyCode, setHoveredFamilyCode] = useState<HazardFamilyCode | null>(null);
  const [activeScenarioCode, setActiveScenarioCode] = useState<string>('S01');
  const [controlAppliedAtStep, setControlAppliedAtStep] = useState<number | null>(null);

  const selectedMc = useMemo(
    () => MEGACHALLENGES.find((m) => m.code === selectedMcCode) || MEGACHALLENGES[0],
    [selectedMcCode]
  );

  const activeScenario = useMemo(
    () =>
      CASCADING_SCENARIOS.find((s) => s.code === activeScenarioCode) ||
      CASCADING_SCENARIOS[0],
    [activeScenarioCode]
  );

  const familyMap = useMemo(() => {
    const map: Record<string, (typeof HAZARD_FAMILIES)[number]> = {};
    for (const f of HAZARD_FAMILIES) map[f.code] = f;
    return map;
  }, []);

  const relationFaMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const r of NETWORK_RELATIONS) map[r.code] = r.fa;
    return map;
  }, []);

  // Deterministic bipartite layout for 12 Megachallenges (right column in RTL = x=660) & 18 Families (left column = x=140)
  const graphLayout = useMemo(() => {
    const mcPositions = MEGACHALLENGES.map((mc, idx) => ({
      ...mc,
      x: 685,
      y: 36 + idx * 43,
    }));
    const famPositions = HAZARD_FAMILIES.map((fam, idx) => ({
      ...fam,
      x: 135,
      y: 26 + idx * 29.5,
    }));
    const famPosMap: Record<string, { x: number; y: number }> = {};
    famPositions.forEach((f) => {
      famPosMap[f.code] = { x: f.x, y: f.y };
    });
    return { mcPositions, famPositions, famPosMap };
  }, []);

  return (
    <div className="space-y-8">
      {/* Section Header */}
      <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
              رجیستر ۱۲ ابرچالش فرابخشی و شبیه‌ساز ۱۰ سناریوی آبشاری
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              ابرچالش‌ها جایگزین خانواده‌های مخاطره نیستند؛ بلکه شبکه‌ای از روابط میان چند خانواده را شکل می‌دهند (فصول ۴ و ۵).
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 shrink-0">
            <span>۱۲ ابرچالش (MC01–MC12)</span>
            <span aria-hidden="true">·</span>
            <span>۱۰ سناریو (S01–S10)</span>
            <span aria-hidden="true">·</span>
            <span>۱۰ نوع رابطه شبکه‌ای</span>
          </div>
        </div>
      </section>

      {/* Interactive Bipartite Network Graph: 12 Megachallenges <-> 18 Families */}
      <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Network className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              <span>گراف پیوندهای شبکه‌ای ابرچالش‌ها و خانواده‌های مخاطره</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              روی هر ابرچالش (راست) یا هر خانواده مخاطره (چپ) کلیک یا توقف کنید تا مسیرهای تشدید و وابستگی برجسته شوند.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          {/* SVG Bipartite Network */}
          <div className="xl:col-span-8 overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/40 p-3">
            <svg
              viewBox="0 0 820 560"
              className="w-full min-w-[640px] h-auto select-none"
              role="img"
              aria-label="گراف ارتباطی ۱۲ ابرچالش با ۱۸ خانواده مخاطره"
            >
              {/* Column Titles */}
              <text
                x="135"
                y="12"
                textAnchor="middle"
                className="fill-slate-500 dark:fill-slate-400 text-[11px] font-bold"
              >
                ۱۸ خانواده مخاطره
              </text>
              <text
                x="685"
                y="12"
                textAnchor="middle"
                className="fill-slate-500 dark:fill-slate-400 text-[11px] font-bold"
              >
                ۱۲ ابرچالش فرابخشی
              </text>

              {/* Edges */}
              {graphLayout.mcPositions.map((mc) =>
                mc.connectedFamilies.map((fCode) => {
                  const target = graphLayout.famPosMap[fCode];
                  if (!target) return null;
                  const isHighlighted = hoveredFamilyCode
                    ? fCode === hoveredFamilyCode
                    : mc.code === selectedMc.code;
                  const grp = ANALYTICAL_GROUPS[familyMap[fCode].group];

                  return (
                    <path
                      key={`${mc.code}-${fCode}`}
                      d={`M ${mc.x - 105} ${mc.y} C 460 ${mc.y}, 360 ${target.y}, ${target.x + 88} ${target.y}`}
                      fill="none"
                      stroke={isHighlighted ? grp.color : '#94A3B8'}
                      strokeWidth={isHighlighted ? 2.4 : 0.9}
                      strokeOpacity={isHighlighted ? 0.9 : 0.16}
                      className="transition-all duration-200"
                    />
                  );
                })
              )}

              {/* Left Nodes: 18 Hazard Families */}
              {graphLayout.famPositions.map((fam) => {
                const grp = ANALYTICAL_GROUPS[fam.group];
                const isConnected = hoveredFamilyCode
                  ? hoveredFamilyCode === fam.code
                  : selectedMc.connectedFamilies.includes(fam.code);

                return (
                  <g
                    key={fam.code}
                    transform={`translate(${fam.x}, ${fam.y})`}
                    onMouseEnter={() => setHoveredFamilyCode(fam.code)}
                    onMouseLeave={() => setHoveredFamilyCode(null)}
                    onClick={() => onOpenFamilyInAtlas(fam.code)}
                    className="cursor-pointer"
                    style={{ opacity: isConnected ? 1 : 0.38 }}
                  >
                    <rect
                      x="-122"
                      y="-11"
                      width="210"
                      height="22"
                      rx="6"
                      fill={isConnected ? grp.color : '#FFFFFF'}
                      fillOpacity={isConnected ? 0.15 : 0.65}
                      stroke={isConnected ? grp.color : '#CBD5E1'}
                      strokeWidth={isConnected ? 1.5 : 0.8}
                      className="dark:fill-slate-900"
                    />
                    <circle cx="76" cy="0" r="4" fill={grp.color} />
                    <text
                      x="64"
                      y="1"
                      textAnchor="end"
                      dominantBaseline="middle"
                      className="fill-slate-800 dark:fill-slate-100 text-[10.5px] font-semibold"
                    >
                      {fam.shortName}
                    </text>
                    <text
                      x="-114"
                      y="1"
                      textAnchor="start"
                      dominantBaseline="middle"
                      fill={grp.color}
                      className="font-mono-code text-[10px] font-bold"
                    >
                      {fam.code}
                    </text>
                  </g>
                );
              })}

              {/* Right Nodes: 12 Megachallenges */}
              {graphLayout.mcPositions.map((mc) => {
                const isSelected = mc.code === selectedMc.code;
                const matchesHoveredFam = hoveredFamilyCode
                  ? mc.connectedFamilies.includes(hoveredFamilyCode)
                  : isSelected;

                return (
                  <g
                    key={mc.code}
                    transform={`translate(${mc.x}, ${mc.y})`}
                    onClick={() => setSelectedMcCode(mc.code)}
                    className="cursor-pointer"
                    style={{ opacity: matchesHoveredFam || isSelected ? 1 : 0.48 }}
                  >
                    <rect
                      x="-105"
                      y="-15"
                      width="230"
                      height="30"
                      rx="8"
                      fill={isSelected ? '#D97706' : '#FFFFFF'}
                      stroke={isSelected ? '#B45309' : matchesHoveredFam ? '#D97706' : '#CBD5E1'}
                      strokeWidth={isSelected ? 2 : 1}
                      className={isSelected ? '' : 'dark:fill-slate-900'}
                    />
                    <text
                      x="114"
                      y="1"
                      textAnchor="end"
                      dominantBaseline="middle"
                      fill={isSelected ? '#FFFFFF' : undefined}
                      className={
                        isSelected
                          ? 'text-[10.5px] font-bold'
                          : 'fill-slate-800 dark:fill-slate-100 text-[10.5px] font-semibold'
                      }
                    >
                      {mc.title}
                    </text>
                    <text
                      x="-96"
                      y="1"
                      textAnchor="start"
                      dominantBaseline="middle"
                      fill={isSelected ? '#FEF3C7' : '#D97706'}
                      className="font-mono-code text-[10px] font-bold"
                    >
                      {mc.code}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Selected Megachallenge Detail Card */}
          <div className="xl:col-span-4 space-y-4">
            <div className="rounded-xl border border-amber-200 dark:border-amber-800/70 bg-amber-50/50 dark:bg-amber-950/25 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span
                  dir="ltr"
                  className="font-mono-code text-sm font-bold px-2.5 py-1 rounded-lg bg-amber-600 text-white"
                >
                  {selectedMc.code}
                </span>
                <span className="text-xs font-medium text-amber-800 dark:text-amber-300">
                  رابطه غالب: {relationFaMap[selectedMc.primaryRelation]} ({selectedMc.primaryRelation})
                </span>
              </div>

              <div>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                  {selectedMc.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 mt-2 leading-relaxed">
                  {selectedMc.definition}
                </p>
              </div>

              <div className="pt-3 border-t border-amber-200/80 dark:border-amber-800/60 space-y-1.5">
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  شاخص‌های پیشنهادی سنجش (فصل ۴ـ۱):
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {selectedMc.indicators}
                </p>
              </div>

              <div className="pt-3 border-t border-amber-200/80 dark:border-amber-800/60 space-y-2">
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  خانواده‌های درگیر ({toPersianDigits(selectedMc.connectedFamilies.length)} خانواده):
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {selectedMc.connectedFamilies.map((fCode) => {
                    const fam = familyMap[fCode];
                    const grp = ANALYTICAL_GROUPS[fam.group];
                    return (
                      <button
                        key={fCode}
                        type="button"
                        onClick={() => onOpenFamilyInAtlas(fCode)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-800 dark:text-slate-200 hover:border-slate-400 transition-colors cursor-pointer"
                      >
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: grp.color }}
                        />
                        <span dir="ltr" className="font-mono-code font-bold text-[11px]">
                          {fCode}
                        </span>
                        <span>{fam.shortName}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 10 Network Relation Types Legend (Appendix B-2) */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 p-4 space-y-2.5">
              <div className="text-xs font-bold text-slate-900 dark:text-white">
                مدل ارتباطات برای GIS و تحلیل شبکه‌ای (پیوست بـ۲)
              </div>
              <div className="grid grid-cols-2 gap-1.5 text-[11.5px]">
                {NETWORK_RELATIONS.map((rel) => (
                  <div
                    key={rel.code}
                    className="flex items-center justify-between gap-1 px-2 py-1 rounded-md bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800"
                  >
                    <span className="text-slate-700 dark:text-slate-300">{rel.fa}</span>
                    <span dir="ltr" className="font-mono-code text-[10px] text-slate-500">
                      {rel.code}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Cascading Scenario Simulator (S01–S10) */}
      <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <GitBranch className="w-5 h-5 text-violet-600 dark:text-violet-400" />
              <span>شبیه‌ساز تعاملی ۱۰ سناریوی ترکیبی و آبشاری (فصل ۵)</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              سناریوها ابزار تحلیلی برای آزمون نظام ملی و شناسایی نقاط کنترل‌اند (نه پیش‌بینی قطعی). روی «اعمال نقطه کنترل» در هر مرحله کلیک کنید تا قطع زنجیره بحران را ببینید.
            </p>
          </div>
          {controlAppliedAtStep !== null && (
            <button
              type="button"
              onClick={() => setControlAppliedAtStep(null)}
              className="px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 whitespace-nowrap shrink-0 cursor-pointer"
            >
              بازنشانی شبیه‌سازی زنجیره
            </button>
          )}
        </div>

        {/* 10 Scenario Selector Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {CASCADING_SCENARIOS.map((sc) => {
            const active = sc.code === activeScenario.code;
            return (
              <button
                key={sc.code}
                type="button"
                onClick={() => {
                  setActiveScenarioCode(sc.code);
                  setControlAppliedAtStep(null);
                }}
                className={`text-right rounded-xl border p-3 transition-all cursor-pointer ${
                  active
                    ? 'border-violet-600 bg-violet-600 text-white shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 hover:border-violet-300 dark:hover:border-violet-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    dir="ltr"
                    className={`font-mono-code text-xs font-bold ${
                      active ? 'text-violet-100' : 'text-violet-600 dark:text-violet-400'
                    }`}
                  >
                    {sc.code}
                  </span>
                  {sc.isNatech && (
                    <span
                      dir="ltr"
                      className={`font-mono-code text-[10px] font-semibold ${
                        active ? 'text-amber-200' : 'text-amber-600 dark:text-amber-400'
                      }`}
                    >
                      Natech
                    </span>
                  )}
                </div>
                <div
                  className={`mt-1 text-xs font-bold leading-snug ${
                    active ? 'text-white' : 'text-slate-800 dark:text-slate-100'
                  }`}
                >
                  {sc.title}
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Scenario Flow Chain */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 p-5 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-200 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span dir="ltr" className="font-mono-code font-bold text-violet-600 dark:text-violet-400">
                  {activeScenario.code}
                </span>
                <span aria-hidden="true">·</span>
                <span>خانواده‌های درگیر: {activeScenario.involvedFamiliesText}</span>
                {activeScenario.isNatech && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="font-semibold text-amber-700 dark:text-amber-400">
                      مفهوم Natech (حادثه فناورانه ناشی از مخاطره طبیعی)
                    </span>
                  </>
                )}
              </div>
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mt-1">
                {activeScenario.title}
              </h3>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {activeScenario.familyCodes.map((fc) => (
                <button
                  key={fc}
                  type="button"
                  onClick={() => onOpenFamilyInAtlas(fc)}
                  className="font-mono-code text-[11px] font-bold px-2 py-1 rounded-md text-white cursor-pointer hover:opacity-90"
                  dir="ltr"
                  style={{ backgroundColor: ANALYTICAL_GROUPS[familyMap[fc].group].color }}
                >
                  {fc}
                </button>
              ))}
            </div>
          </div>

          {/* 4-Step Interactive Cascading Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
            {activeScenario.steps.map((step, idx) => {
              const isStoppedHere = controlAppliedAtStep === idx;
              const isMitigatedDownstream =
                controlAppliedAtStep !== null && idx > controlAppliedAtStep;
              const stepAccent = isMitigatedDownstream
                ? '#0D9488'
                : isStoppedHere
                ? '#16A34A'
                : idx === 0
                ? '#D97706'
                : idx === 1
                ? '#EA580C'
                : idx === 2
                ? '#E11D48'
                : '#B91C1C';

              return (
                <div
                  key={step.stage}
                  className={`relative rounded-xl border p-4 flex flex-col justify-between transition-all ${
                    isMitigatedDownstream
                      ? 'border-teal-300 dark:border-teal-800 bg-teal-50/60 dark:bg-teal-950/25'
                      : isStoppedHere
                      ? 'border-emerald-400 dark:border-emerald-700 bg-emerald-50/70 dark:bg-emerald-950/30 ring-2 ring-emerald-500/30'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827]'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span
                        className="text-xs font-bold"
                        style={{ color: stepAccent }}
                      >
                        گام {toPersianDigits(idx + 1)} · {step.stage}
                      </span>
                      {isMitigatedDownstream ? (
                        <ShieldCheck className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                      ) : isStoppedHere ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      ) : (
                        <Zap className="w-4 h-4 text-amber-500 shrink-0" />
                      )}
                    </div>

                    <p
                      className={`text-xs sm:text-sm font-bold leading-relaxed ${
                        isMitigatedDownstream
                          ? 'line-through text-slate-400 dark:text-slate-500'
                          : 'text-slate-900 dark:text-slate-100'
                      }`}
                    >
                      {step.text}
                    </p>

                    {isMitigatedDownstream ? (
                      <div className="mt-3 text-xs font-semibold text-teal-700 dark:text-teal-300">
                        مهارشده در اثر قطع زنجیره در گام {toPersianDigits((controlAppliedAtStep ?? 0) + 1)}
                      </div>
                    ) : (
                      <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          نقطه کنترل پیشنهادی:{' '}
                        </span>
                        {step.controlPoint}
                      </div>
                    )}
                  </div>

                  {idx < 3 && (
                    <button
                      type="button"
                      onClick={() =>
                        setControlAppliedAtStep(isStoppedHere ? null : idx)
                      }
                      className={`mt-4 w-full py-2 px-3 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                        isStoppedHere
                          ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-teal-600 hover:text-white'
                      }`}
                    >
                      {isStoppedHere
                        ? 'نقطه کنترل فعال شد (لغو)'
                        : 'اعمال نقطه کنترل و قطع زنجیره'}
                    </button>
                  )}

                  {idx < 3 && (
                    <ArrowLeft
                      aria-hidden="true"
                      className="hidden md:block w-4 h-4 text-slate-400 absolute -left-3 top-1/2 -translate-y-1/2 z-10"
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Monitoring & Early Warning Axes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-4 flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <div className="font-bold text-slate-900 dark:text-white">
                  محورهای پایش و شاخص هشدار زودهنگام
                </div>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  {activeScenario.monitoringAxes}
                </p>
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <div className="font-bold text-slate-900 dark:text-white">
                  ابرچالش‌های مرتبط در این سناریو
                </div>
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {activeScenario.connectedMegachallenges.map((mcId) => {
                    const mc = MEGACHALLENGES.find((m) => m.code === mcId);
                    if (!mc) return null;
                    return (
                      <button
                        key={mcId}
                        type="button"
                        onClick={() => setSelectedMcCode(mcId)}
                        className="px-2.5 py-1 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/70 font-medium cursor-pointer hover:bg-amber-100 dark:hover:bg-amber-900/50"
                      >
                        <span dir="ltr" className="font-mono-code font-bold ml-1">
                          {mc.code}
                        </span>
                        {mc.title}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
