import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext';
import { useTheme } from '../theme/ThemeContext';
import { PWAInstallButton } from './PWAInstallButton';
import { BrandMark } from './BrandMark';
import {
  FileText,
  Layers,
  Scissors,
  Minimize2,
  Image as ImageIcon,
  PenTool,
  RefreshCw,
  ScanText,
  ShieldCheck,
  LayoutGrid,
  Hash,
  Stamp,
  Crop,
  Info,
  Menu,
  X,
  Sun,
  Moon,
  Lock,
  Search,
  ChevronDown,
  EyeOff,
  CheckSquare,
  Columns2,
  Archive,
  AlignJustify,
  Unlock,
  FileType,
} from 'lucide-react';
import { APP_TOTAL_TOOLS } from '../config/brand';

export const Header: React.FC = () => {
  const { t, language, setLanguage, isRtl } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toolsDropdownOpen, setToolsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: globalThis.MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setToolsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setToolsDropdownOpen(false);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const openCommandPalette = () => {
    window.dispatchEvent(new CustomEvent('open-command-palette'));
  };

  const toolCategories = [
    {
      name: language === 'ar' ? 'تنظيم وعرض' : 'Organize & View',
      items: [
        { path: '/reader', label: t.nav.reader, icon: FileText, desc: t.reader.subtitle },
        { path: '/organize', label: t.nav.organize, icon: LayoutGrid, desc: t.organize.subtitle },
        { path: '/merge', label: t.nav.merge, icon: Layers, desc: t.merge.subtitle },
        { path: '/split', label: t.nav.split, icon: Scissors, desc: t.split.subtitle },
        { path: '/compare', label: t.nav.compare, icon: Columns2, desc: t.compare.subtitle },
      ],
    },
    {
      name: language === 'ar' ? 'تعديل وتوقيع' : 'Edit & Sign',
      items: [
        { path: '/annotate', label: t.nav.annotate, icon: PenTool, desc: t.annotate.subtitle },
        { path: '/redact', label: t.nav.redact, icon: EyeOff, desc: t.redact.subtitle },
        { path: '/form-filler', label: t.nav.formFiller, icon: CheckSquare, desc: t.formFiller.subtitle },
        { path: '/flatten', label: t.nav.flatten, icon: Layers, desc: t.flatten.subtitle },
        { path: '/watermark', label: t.nav.watermark, icon: Stamp, desc: t.watermark.subtitle },
        { path: '/header-footer', label: t.nav.headerFooter, icon: AlignJustify, desc: t.headerFooter.subtitle },
        { path: '/page-numbers', label: t.nav.pageNumbers, icon: Hash, desc: t.pageNumbers.subtitle },
        { path: '/crop', label: t.nav.crop, icon: Crop, desc: t.crop.subtitle },
        { path: '/compress', label: t.nav.compress, icon: Minimize2, desc: t.compress.subtitle },
      ],
    },
    {
      name: language === 'ar' ? 'تحويل وأمان' : 'Convert & Security',
      items: [
        { path: '/pdf-to-word', label: t.nav.pdfToWord, icon: FileType, desc: t.pdfToWord.subtitle },
        { path: '/images-to-pdf', label: t.nav.imagesToPdf, icon: ImageIcon, desc: t.imagesToPdf.subtitle },
        { path: '/convert', label: t.nav.convert, icon: RefreshCw, desc: t.convert.subtitle },
        { path: '/extract-images', label: t.nav.extractImages, icon: Archive, desc: t.extractImages.subtitle },
        { path: '/ocr', label: t.nav.ocr, icon: ScanText, desc: t.ocr.subtitle },
        { path: '/protect', label: t.nav.protect, icon: Lock, desc: t.protect.subtitle },
        { path: '/unlock', label: t.nav.unlock, icon: Unlock, desc: t.unlock.subtitle },
        { path: '/security', label: t.nav.security, icon: ShieldCheck, desc: t.security.subtitle },
      ],
    },
  ];

  const quickLinks = [
    { path: '/reader', label: t.nav.reader, icon: FileText },
    { path: '/merge', label: t.nav.merge, icon: Layers },
    { path: '/split', label: t.nav.split, icon: Scissors },
    { path: '/compress', label: t.nav.compress, icon: Minimize2 },
    { path: '/annotate', label: t.nav.annotate, icon: PenTool },
    { path: '/redact', label: t.nav.redact, icon: EyeOff },
  ];

  const secondaryNavItems = [
    { path: '/privacy', label: t.nav.privacy, icon: Lock },
    { path: '/about', label: t.nav.about, icon: Info },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <Link
            to="/"
            className="flex items-center gap-2.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 rounded-lg group shrink-0"
            onClick={() => setMobileMenuOpen(false)}
          >
            <BrandMark size="md" className="group-hover:scale-105 transition-transform duration-150" />
            <div className="flex items-baseline gap-1.5">
              <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-white whitespace-nowrap shrink-0">
                {t.appName}
              </span>
              <span className="hidden sm:inline text-[11px] font-medium text-slate-400 dark:text-slate-500 whitespace-nowrap">
                {t.header.byQavelyr}
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-1" aria-label="Main Navigation">
            {quickLinks.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap shrink-0 transition-colors ${
                    active
                      ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 font-semibold'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4 opacity-80 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}

            {/* All Tools Mega Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setToolsDropdownOpen(!toolsDropdownOpen)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                  toolsDropdownOpen || isActive('/tools')
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <span>{t.nav.tools}</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    toolsDropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Mega Menu Popup */}
              {toolsDropdownOpen && (
                <div
                  className="absolute top-full mt-2 w-[680px] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-4 grid grid-cols-3 gap-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                  style={{
                    [isRtl ? 'right' : 'left']: '-100px',
                  }}
                >
                  {toolCategories.map((cat, idx) => (
                    <div key={idx} className="space-y-2">
                      <div className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-2">
                        {cat.name}
                      </div>
                      <div className="space-y-0.5">
                        {cat.items.map((tool) => {
                          const Icon = tool.icon;
                          const active = isActive(tool.path);
                          return (
                            <Link
                              key={tool.path}
                              to={tool.path}
                              onClick={() => setToolsDropdownOpen(false)}
                              className={`flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium transition-colors ${
                                active
                                  ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-semibold'
                                  : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                              }`}
                            >
                              <Icon className="w-3.5 h-3.5 shrink-0 text-rose-500" />
                              <span className="truncate">{tool.label}</span>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  ))}

                  <div className="col-span-3 border-t border-slate-100 dark:border-slate-800 pt-3 flex items-center justify-between px-2">
                    <Link
                      to="/tools"
                      onClick={() => setToolsDropdownOpen(false)}
                      className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1"
                    >
                      <LayoutGrid className="w-3.5 h-3.5" />
                      <span>
                        {language === 'ar'
                          ? `عرض دليل الأدوات الشامل (${APP_TOTAL_TOOLS} أداة)`
                          : `View All ${APP_TOTAL_TOOLS} Tools Directory`}
                      </span>
                    </Link>
                    <span className="text-[11px] text-slate-400 tabular-nums">
                      {language === 'ar' ? '100% مجاني ومحلي' : '100% Free · Local'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </nav>

          {/* Quick Search & Controls */}
          <div className="flex items-center gap-2">
            {/* Quick Search Trigger */}
            <button
              type="button"
              onClick={openCommandPalette}
              className="flex items-center gap-2 px-2.5 py-1.5 text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-700/80 transition-colors"
              title={language === 'ar' ? 'بحث سريع بالأدوات (Ctrl+K)' : 'Quick Search Tools (Ctrl+K)'}
            >
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline font-medium">
                {language === 'ar' ? 'بحث' : 'Search'}
              </span>
              <kbd className="hidden md:inline-flex items-center gap-0.5 text-[10px] font-sans px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-400">
                ⌘K
              </kbd>
            </button>

            {/* PWA Install Button */}
            <PWAInstallButton />

            {/* Language Selector */}
            <div className="relative flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-2 py-1 text-xs font-semibold rounded-md transition-all ${
                  language === 'en'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
                title="Switch to English"
                aria-label="Switch to English"
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLanguage('ar')}
                className={`px-2 py-1 text-xs font-semibold rounded-md transition-all font-arabic ${
                  language === 'ar'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
                title="التحويل إلى العربية"
                aria-label="التحويل إلى العربية"
              >
                عربي
              </button>
            </div>

            {/* Theme Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 transition-colors"
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-amber-400" />
              ) : (
                <Moon className="w-5 h-5 text-slate-600" />
              )}
            </button>

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-4 pt-3 pb-6 max-h-[calc(100vh-4rem)] overflow-y-auto space-y-4">
          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen(false);
              openCommandPalette();
            }}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-medium"
          >
            <span className="flex items-center gap-2">
              <Search className="w-4 h-4 text-rose-500" />
              {language === 'ar' ? `بحث سريع في جميع الأدوات (${APP_TOTAL_TOOLS})` : `Search all ${APP_TOTAL_TOOLS} tools`}
            </span>
            <kbd className="text-xs px-2 py-0.5 rounded bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600">
              Ctrl+K
            </kbd>
          </button>

          {toolCategories.map((cat, idx) => (
            <div key={idx} className="space-y-1.5">
              <div className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-1">
                {cat.name}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {cat.items.map((tool) => {
                  const Icon = tool.icon;
                  const active = isActive(tool.path);
                  return (
                    <Link
                      key={tool.path}
                      to={tool.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-2 p-2.5 rounded-lg text-xs font-medium transition-all ${
                        active
                          ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 font-semibold'
                          : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0 text-rose-500" />
                      <span className="truncate">{tool.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}

          <div className="border-t border-slate-200 dark:border-slate-800 pt-3">
            <div className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 px-1">
              {t.footer.legal}
            </div>
            <div className="flex flex-col gap-1">
              {secondaryNavItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
                      active
                        ? 'text-rose-600 dark:text-rose-400 font-semibold bg-rose-50/50 dark:bg-rose-950/30'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0 opacity-70" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-300">
            <Lock className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span>{t.home.trustedBanner}</span>
          </div>
        </div>
      )}
    </header>
  );
};
