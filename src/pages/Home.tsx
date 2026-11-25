import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext';
import { DropZone } from '../components/DropZone';
import { BrandMark } from '../components/BrandMark';
import { PageSeo } from '../components/PageSeo';
import { SITE_URL, QAVELYR_URL, APP_TOTAL_TOOLS } from '../config/brand';
import { validateFileSize } from '../utils/fileUtils';
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
  Lock,
  Unlock,
  FileType,
  Zap,
  CheckCircle2,
  ArrowRight,
  LayoutGrid,
  Hash,
  Stamp,
  Crop,
  EyeOff,
  CheckSquare,
  Columns2,
  Archive,
  AlignJustify,
  Search,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const { t, isRtl, language } = useLanguage();
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<'all' | 'organize' | 'edit' | 'convert' | 'security'>('all');

  const [dropError, setDropError] = useState<string | null>(null);

  const openCommandPalette = () => {
    window.dispatchEvent(new CustomEvent('open-command-palette'));
  };

  // If user drops a PDF directly on the home hero, validate size and guide them
  const handleQuickDrop = (files: File[]) => {
    if (files.length === 0) return;
    setDropError(null);
    for (const f of files) {
      const check = validateFileSize(f);
      if (check.status === 'blocked') {
        setDropError(
          t.fileLimits.blockTooLarge
            .replace('{name}', f.name)
            .replace('{size}', check.formattedSize)
        );
        return;
      }
    }
    if (files.length === 1) {
      const file = files[0];
      try {
        sessionStorage.setItem('quick_pdf_name', file.name);
        sessionStorage.setItem('quick_pdf_size', file.size.toString());
      } catch {
        // ignore quota limits
      }
      navigate('/reader');
    } else {
      navigate('/merge');
    }
  };

  const homeJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Free PDF Studio',
    url: SITE_URL,
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Any',
    inLanguage: ['en', 'ar'],
    isAccessibleForFree: true,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    description: t.seo.pages.home.description,
    creator: {
      '@type': 'Organization',
      name: 'Qavelyr',
      url: QAVELYR_URL,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Qavelyr',
      url: QAVELYR_URL,
    },
  };

  const toolCards = [
    {
      title: t.nav.reader,
      desc: t.reader.subtitle,
      path: '/reader',
      category: 'organize',
      icon: FileText,
      color: 'from-blue-500 to-indigo-600',
      badge: language === 'ar' ? 'قارئ سريع' : 'Viewer',
    },
    {
      title: t.nav.organize,
      desc: t.organize.subtitle,
      path: '/organize',
      category: 'organize',
      icon: LayoutGrid,
      color: 'from-amber-500 to-rose-600',
      badge: language === 'ar' ? 'ترتيب وتدوير' : 'Reorder',
    },
    {
      title: t.nav.merge,
      desc: t.merge.subtitle,
      path: '/merge',
      category: 'organize',
      icon: Layers,
      color: 'from-rose-500 to-pink-600',
      badge: language === 'ar' ? 'الأكثر طلباً' : 'Popular',
    },
    {
      title: t.nav.split,
      desc: t.split.subtitle,
      path: '/split',
      category: 'organize',
      icon: Scissors,
      color: 'from-amber-500 to-orange-600',
      badge: language === 'ar' ? 'تصدير ZIP' : 'Multi-mode',
    },
    {
      title: t.nav.compare,
      desc: t.compare.subtitle,
      path: '/compare',
      category: 'organize',
      icon: Columns2,
      color: 'from-sky-500 to-blue-600',
      badge: language === 'ar' ? 'مقارنة' : 'Compare',
    },
    {
      title: t.nav.annotate,
      desc: t.annotate.subtitle,
      path: '/annotate',
      category: 'edit',
      icon: PenTool,
      color: 'from-cyan-500 to-blue-600',
      badge: language === 'ar' ? 'توقيع وكتابة' : 'Sign & Draw',
    },
    {
      title: t.nav.redact,
      desc: t.redact.subtitle,
      path: '/redact',
      category: 'security',
      icon: EyeOff,
      color: 'from-rose-600 to-red-700',
      badge: language === 'ar' ? 'طمس وحجب' : 'Redact',
    },
    {
      title: t.nav.formFiller,
      desc: t.formFiller.subtitle,
      path: '/form-filler',
      category: 'edit',
      icon: CheckSquare,
      color: 'from-violet-500 to-purple-600',
      badge: language === 'ar' ? 'ملء النماذج' : 'Forms',
    },
    {
      title: t.nav.flatten,
      desc: t.flatten.subtitle,
      path: '/flatten',
      category: 'security',
      icon: Layers,
      color: 'from-stone-500 to-slate-700',
      badge: language === 'ar' ? 'تسطيح وقفل' : 'Flatten',
    },
    {
      title: t.nav.compress,
      desc: t.compress.subtitle,
      path: '/compress',
      category: 'edit',
      icon: Minimize2,
      color: 'from-emerald-500 to-teal-600',
      badge: language === 'ar' ? 'ضغط حجم' : 'Compress',
    },
    {
      title: t.nav.pageNumbers,
      desc: t.pageNumbers.subtitle,
      path: '/page-numbers',
      category: 'edit',
      icon: Hash,
      color: 'from-indigo-500 to-purple-600',
      badge: language === 'ar' ? 'ترقيم' : 'Numbering',
    },
    {
      title: t.nav.watermark,
      desc: t.watermark.subtitle,
      path: '/watermark',
      category: 'edit',
      icon: Stamp,
      color: 'from-pink-500 to-rose-600',
      badge: language === 'ar' ? 'علامة مائية' : 'Watermark',
    },
    {
      title: t.nav.headerFooter,
      desc: t.headerFooter.subtitle,
      path: '/header-footer',
      category: 'edit',
      icon: AlignJustify,
      color: 'from-blue-600 to-indigo-700',
      badge: language === 'ar' ? 'ترويسة وتذييل' : 'Header/Footer',
    },
    {
      title: t.nav.crop,
      desc: t.crop.subtitle,
      path: '/crop',
      category: 'edit',
      icon: Crop,
      color: 'from-emerald-500 to-cyan-600',
      badge: language === 'ar' ? 'قص هوامش' : 'Crop',
    },
    {
      title: t.nav.imagesToPdf,
      desc: t.imagesToPdf.subtitle,
      path: '/images-to-pdf',
      category: 'convert',
      icon: ImageIcon,
      color: 'from-purple-500 to-violet-600',
      badge: language === 'ar' ? 'صور إلى PDF' : 'Images to PDF',
    },
    {
      title: t.nav.convert,
      desc: t.convert.subtitle,
      path: '/convert',
      category: 'convert',
      icon: RefreshCw,
      color: 'from-teal-500 to-emerald-600',
      badge: language === 'ar' ? 'صفحات لصور' : 'PDF to Images',
    },
    {
      title: t.nav.extractImages,
      desc: t.extractImages.subtitle,
      path: '/extract-images',
      category: 'convert',
      icon: Archive,
      color: 'from-amber-600 to-orange-600',
      badge: language === 'ar' ? 'استخراج صور' : 'Asset Extract',
    },
    {
      title: t.nav.pdfToWord,
      desc: t.pdfToWord.subtitle,
      path: '/pdf-to-word',
      category: 'convert',
      icon: FileType,
      color: 'from-blue-600 to-indigo-700',
      badge: language === 'ar' ? 'DOCX · عربي RTL' : 'PDF to Word',
    },
    {
      title: t.nav.ocr,
      desc: t.ocr.subtitle,
      path: '/ocr',
      category: 'convert',
      icon: ScanText,
      color: 'from-red-500 to-rose-600',
      badge: language === 'ar' ? 'تعرف نصوص' : 'Arabic + English OCR',
    },
    {
      title: t.nav.protect,
      desc: t.protect.subtitle,
      path: '/protect',
      category: 'security',
      icon: Lock,
      color: 'from-rose-600 to-pink-700',
      badge: 'AES-256',
    },
    {
      title: t.nav.unlock,
      desc: t.unlock.subtitle,
      path: '/unlock',
      category: 'security',
      icon: Unlock,
      color: 'from-emerald-600 to-teal-700',
      badge: language === 'ar' ? 'فك التشفير' : 'Decrypt',
    },
    {
      title: t.nav.security,
      desc: t.security.subtitle,
      path: '/security',
      category: 'security',
      icon: ShieldCheck,
      color: 'from-slate-600 to-slate-800',
      badge: language === 'ar' ? 'تنظيف التتبع' : 'Metadata',
    },
  ];

  const categories = [
    { id: 'all', name: language === 'ar' ? `الكل (${APP_TOTAL_TOOLS} أداة)` : `All (${APP_TOTAL_TOOLS} Tools)` },
    { id: 'organize', name: language === 'ar' ? 'تنظيم وعرض' : 'Organize & View' },
    { id: 'edit', name: language === 'ar' ? 'تعديل وتوقيع' : 'Edit & Sign' },
    { id: 'convert', name: language === 'ar' ? 'تحويل واستخراج' : 'Convert & Extract' },
    { id: 'security', name: language === 'ar' ? 'حماية وأمان' : 'Security' },
  ];

  const visibleTools = toolCards.filter((t) => {
    if (activeCategory === 'all') return true;
    if (activeCategory === 'security') {
      return t.category === 'security' || t.path === '/redact' || t.path === '/flatten';
    }
    return t.category === activeCategory;
  });

  return (
    <div className="space-y-16 pb-12">
      <PageSeo pageKey="home" jsonLd={homeJsonLd} />
      {/* Architectural Studio Split Hero */}
      <section className="studio-grid-surface border-b border-slate-200/80 dark:border-slate-800/80 py-10 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Brand Narrative & Primary Actions */}
          <div className="lg:col-span-7 space-y-6 text-start">
            <div className="inline-flex items-center gap-3">
              <BrandMark size="md" />
              <div className="text-xs font-semibold tracking-wide text-rose-700 dark:text-rose-400">
                {t.home.heroBadge}
              </div>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
              {t.home.heroTitle}{' '}
              <span className="text-rose-600 dark:text-rose-400">
                {t.home.heroTitleHighlight}
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
              {t.home.heroSubtitle}
            </p>

            {/* Clean Unboxed Trust Markers */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs font-medium text-slate-600 dark:text-slate-300">
              <span className="inline-flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                {t.home.privacyPill}
              </span>
              <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
              <span className="inline-flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                {t.home.offlinePill}
              </span>
              <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-700 dark:text-slate-300 shrink-0" />
                {t.home.freePill}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                to="/tools"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm shadow-sm shadow-rose-600/20 whitespace-nowrap shrink-0 transition-colors"
              >
                <span>{t.home.getStartedBtn}</span>
                <ArrowRight className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
              </Link>

              <button
                type="button"
                onClick={openCommandPalette}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-sm border border-slate-200 dark:border-slate-700 whitespace-nowrap shrink-0 transition-colors"
              >
                <Search className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                <span>{language === 'ar' ? 'بحث سريع بالأدوات' : 'Search Tools'}</span>
                <kbd className="hidden sm:inline-block text-[10px] font-mono tabular-nums px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400">
                  ⌘K
                </kbd>
              </button>
            </div>
          </div>

          {/* Immediate Workbench Drop Zone */}
          <div className="lg:col-span-5">
            <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 shadow-sm">
              <DropZone
                onFilesSelected={handleQuickDrop}
                promptText={
                  language === 'ar'
                    ? 'أفلت أي مستند PDF هنا للمعاينة الفورية والبدء بالعمل عليه'
                    : 'Drop any PDF file here to inspect, read, or process immediately'
                }
                allowedFormatsText="PDF"
                multiple={true}
              />
              {dropError && (
                <p className="mt-2 px-2 text-xs text-rose-600 dark:text-rose-400">
                  {dropError}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Tools Grid Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              {t.home.quickToolsTitle}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {language === 'ar'
                ? 'كل ما تحتاجه للتعامل مع ملفات PDF في مساحة عمل موحدة ومجانية 100%'
                : 'Everything you need to read, edit, convert, and secure PDF documents'}
            </p>
          </div>

          {/* Category Switcher */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
                  activeCategory === cat.id
                    ? 'bg-slate-900 dark:bg-rose-600 text-white'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {visibleTools.map((tool) => {
            const Icon = tool.icon;
            return (
              <Link
                key={tool.path}
                to={tool.path}
                className="group relative flex flex-col justify-between p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-rose-400 dark:hover:border-rose-500/70 transition-all hover:-translate-y-0.5"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700/70 text-slate-700 dark:text-slate-200 group-hover:bg-rose-600 group-hover:border-rose-600 group-hover:text-white flex items-center justify-center transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
                      {tool.badge}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                    {tool.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed line-clamp-2">
                    {tool.desc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-rose-600 dark:text-rose-400">
                  <span>{language === 'ar' ? 'افتح الأداة' : 'Open Tool'}</span>
                  <ArrowRight
                    className={`w-4 h-4 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform ${
                      isRtl ? 'rotate-180' : ''
                    }`}
                  />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Why Free PDF Studio Section */}
      <section className="bg-slate-100/70 dark:bg-slate-900/50 border-y border-slate-200/80 dark:border-slate-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              {t.home.whyChooseUsTitle}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
              {t.home.whyChooseUsSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {t.home.featurePrivacyTitle}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {t.home.featurePrivacyDesc}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {t.home.featureSpeedTitle}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {t.home.featureSpeedDesc}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {t.home.featureFreeTitle}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {t.home.featureFreeDesc}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {t.home.featureOpenTitle}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {t.home.featureOpenDesc}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
