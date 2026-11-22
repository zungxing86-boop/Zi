import React, { useEffect, useState } from 'react';
import {
  Activity,
  BookMarked,
  Building2,
  Download,
  GitBranch,
  Grid2x2,
  LayoutDashboard,
  Menu,
  Moon,
  ShieldCheck,
  Sun,
  X,
} from 'lucide-react';
import { AtlasView } from './components/AtlasView';
import { BiosecurityView } from './components/BiosecurityView';
import { GovernanceView } from './components/GovernanceView';
import { MegachallengesView } from './components/MegachallengesView';
import { OverviewView } from './components/OverviewView';
import { RiskLabView } from './components/RiskLabView';
import { RoadmapGlossaryView } from './components/RoadmapGlossaryView';
import { HAZARD_FAMILIES, SUB_HAZARDS } from './data/familiesAndSubhazards';
import {
  DashboardSectionId,
  HazardFamilyCode,
  SubHazard,
  toPersianDigits,
} from './data/types';
import { downloadCsv } from './utils/exportCsv';

const NAV_ITEMS: Array<{
  id: DashboardSectionId;
  label: string;
  shortDesc: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: string;
}> = [
  {
    id: 'overview',
    label: 'نمای کلان و معماری',
    shortDesc: 'فصول ۱ و ۲ · مرزبندی و آزمون ورود',
    icon: LayoutDashboard,
    accent: '#0D9488',
  },
  {
    id: 'atlas',
    label: 'اطلس ۱۸ خانواده مخاطره',
    shortDesc: 'فصل ۳ و پیوست الف · ۱۴۹ زیرشاخه',
    icon: Grid2x2,
    accent: '#2563EB',
  },
  {
    id: 'megachallenges',
    label: 'ابرچالش‌ها و سناریوها',
    shortDesc: 'فصول ۴ و ۵ · ۱۲ ابرچالش و ۱۰ سناریو',
    icon: GitBranch,
    accent: '#D97706',
  },
  {
    id: 'risk-lab',
    label: 'آزمایشگاه ارزیابی ریسک',
    shortDesc: 'فصل ۷ · ماتریس ۵×۵ و مدل ۱۰معیاره',
    icon: Activity,
    accent: '#E11D48',
  },
  {
    id: 'biosecurity',
    label: 'امنیت زیستی و سلامت واحد',
    shortDesc: 'فصل ۱۰ · ۱۵ زیرخانواده و ۹ عامل زیستی',
    icon: ShieldCheck,
    accent: '#059669',
  },
  {
    id: 'governance',
    label: 'حکمرانی، داده و هشدار',
    shortDesc: 'فصول ۸ و ۹ · دستگاه‌ها، RACI و هشدار',
    icon: Building2,
    accent: '#7C3AED',
  },
  {
    id: 'roadmap',
    label: 'نقشه راه و پیوست‌ها',
    shortDesc: 'فصول ۶ و ۱۱ · ۷ گام، کدگذاری و مراجع',
    icon: BookMarked,
    accent: '#0284C7',
  },
];

export function App() {
  const [activeSection, setActiveSection] = useState<DashboardSectionId>('overview');
  const [atlasFamilyFilter, setAtlasFamilyFilter] = useState<HazardFamilyCode | null>(null);
  const [riskPreloadSub, setRiskPreloadSub] = useState<SubHazard | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof document !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return false;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem('iran-hazard-theme', isDark ? 'dark' : 'light');
    } catch {
      // ignore storage restrictions
    }
  }, [isDark]);

  const handleNavigate = (section: DashboardSectionId, familyFilter?: HazardFamilyCode) => {
    if (section === 'atlas' && familyFilter) {
      setAtlasFamilyFilter(familyFilter);
    } else if (section === 'atlas') {
      setAtlasFamilyFilter(null);
    }
    setActiveSection(section);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEvaluateInRiskLab = (sub: SubHazard) => {
    setRiskPreloadSub(sub);
    setActiveSection('risk-lab');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleExportMasterCsv = () => {
    const famMap: Record<string, (typeof HAZARD_FAMILIES)[number]> = {};
    HAZARD_FAMILIES.forEach((f) => {
      famMap[f.code] = f;
    });
    downloadCsv(
      'iran-national-hazard-framework-master.csv',
      [
        'کد زیرشاخه',
        'کد خانواده',
        'خانواده مخاطره',
        'سطح امنیت زیستی',
        'عنوان زیرشاخه',
        'مسیر خطر / حوزه‌های در معرض',
        'پیامدهای مهم',
        'دستگاه‌های تخصصی پیشنهادی',
        'نشانه‌ها و داده‌های پایش',
      ],
      SUB_HAZARDS.map((s) => [
        s.code,
        s.familyCode,
        famMap[s.familyCode]?.name || '',
        `سطح ${famMap[s.familyCode]?.tier || ''}`,
        s.title,
        s.exposedOrPathways,
        s.consequences || '',
        s.agencies,
        s.indicators,
      ])
    );
  };

  const activeNavMeta = NAV_ITEMS.find((n) => n.id === activeSection) || NAV_ITEMS[0];

  return (
    <div className="min-h-screen flex bg-[#F6F7FA] dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100">
      {/* Desktop Right Sidebar (RTL) */}
      <aside className="hidden lg:flex lg:flex-col lg:w-68 xl:w-72 shrink-0 border-l border-slate-200 dark:border-slate-800/90 bg-white dark:bg-[#0F1524] sticky top-0 h-screen overflow-y-auto">
        <div className="px-5 py-5 border-b border-slate-200 dark:border-slate-800/90">
          <div className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white leading-snug">
            اطلس ملی مخاطرات ایران
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            مخاطرات · ابرچالش‌ها · امنیت زیستی
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1" aria-label="بخش‌های اصلی داشبورد">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavigate(item.id)}
                className={`w-full text-right flex items-start gap-3 px-3.5 py-2.5 rounded-xl transition-colors cursor-pointer ${
                  active
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <span
                  className="mt-0.5 shrink-0"
                  style={{ color: active ? undefined : item.accent }}
                >
                  <Icon className="w-4 h-4" />
                </span>
                <div className="min-w-0">
                  <div className="text-[13px] font-bold truncate">{item.label}</div>
                  <div
                    className={`text-[11px] truncate mt-0.5 ${
                      active
                        ? 'text-slate-300 dark:text-slate-600'
                        : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {item.shortDesc}
                  </div>
                </div>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800/90 space-y-2.5">
          <button
            type="button"
            onClick={handleExportMasterCsv}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>دانلود داده کامل اطلس (CSV)</span>
          </button>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 text-center leading-snug">
            سند تلفیقی پیشنهادی · آبان {toPersianDigits(1405)}
          </div>
        </div>
      </aside>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden bg-slate-950/50 backdrop-blur-xs flex justify-start"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="w-72 max-w-[85vw] h-full bg-white dark:bg-[#0F1524] border-l border-slate-200 dark:border-slate-800 p-4 flex flex-col justify-between overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
                <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                  اطلس ملی مخاطرات ایران
                </span>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="بستن منو"
                  className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="mt-4 space-y-1">
                {NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const active = activeSection === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleNavigate(item.id)}
                      className={`w-full text-right flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                        active
                          ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            <button
              type="button"
              onClick={handleExportMasterCsv}
              className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200"
            >
              <Download className="w-4 h-4" />
              <span>دانلود داده کامل (CSV)</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Clean Top Header Bar */}
        <header className="sticky top-0 z-30 h-14 border-b border-slate-200 dark:border-slate-800/90 bg-white/90 dark:bg-[#0B0F19]/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="باز کردن منوی ناوبری"
              className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-xs sm:text-sm min-w-0">
              <span className="hidden sm:inline text-slate-400 dark:text-slate-500 whitespace-nowrap shrink-0">
                چارچوب یکپارچه ملی
              </span>
              <span aria-hidden="true" className="hidden sm:inline text-slate-300 dark:text-slate-700">
                /
              </span>
              <span className="font-bold text-slate-900 dark:text-white truncate">
                {activeNavMeta.label}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setIsDark((d) => !d)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              aria-label="تغییر حالت روشن و تاریک"
            >
              {isDark ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span>حالت روشن</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-slate-600" />
                  <span>حالت تاریک</span>
                </>
              )}
            </button>
          </div>
        </header>

        {/* Active Section Viewport */}
        <main className="flex-1 w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {activeSection === 'overview' && <OverviewView onNavigate={handleNavigate} />}
          {activeSection === 'atlas' && (
            <AtlasView
              initialFamilyFilter={atlasFamilyFilter}
              onEvaluateInRiskLab={handleEvaluateInRiskLab}
            />
          )}
          {activeSection === 'megachallenges' && (
            <MegachallengesView
              onOpenFamilyInAtlas={(code) => handleNavigate('atlas', code)}
            />
          )}
          {activeSection === 'risk-lab' && (
            <RiskLabView preloadedSubHazard={riskPreloadSub} />
          )}
          {activeSection === 'biosecurity' && (
            <BiosecurityView onEvaluateInRiskLab={handleEvaluateInRiskLab} />
          )}
          {activeSection === 'governance' && <GovernanceView />}
          {activeSection === 'roadmap' && <RoadmapGlossaryView />}
        </main>

        {/* Quiet Editorial Footer */}
        <footer className="border-t border-slate-200 dark:border-slate-800/80 py-4 px-6 text-xs text-slate-500 dark:text-slate-400">
          <div className="max-w-[1400px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>
              چارچوب یکپارچه ملی مخاطرات، ابرچالش‌ها و امنیت زیستی ایران · سند مادر تلفیقی و بازطراحی‌شده
            </span>
            <span>نسخه کارشناسی جهت بازبینی و تکمیل · آبان ۱۴۰۵</span>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;
