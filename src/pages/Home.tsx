import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext';
import { DropZone } from '../components/DropZone';
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
  Zap,
  CheckCircle2,
  ArrowRight,
  ShieldAlert,
  Sparkles,
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

  const openCommandPalette = () => {
    window.dispatchEvent(new CustomEvent('open-command-palette'));
  };

  // If user drops a PDF directly on the home hero, guide them
  const handleQuickDrop = (files: File[]) => {
    if (files.length === 0) return;
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
      title: t.nav.ocr,
      desc: t.ocr.subtitle,
      path: '/ocr',
      category: 'convert',
      icon: ScanText,
      color: 'from-red-500 to-rose-600',
      badge: language === 'ar' ? 'تعرف نصوص' : 'Arabic + English OCR',
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
    { id: 'all', name: language === 'ar' ? 'الكل (19 أداة)' : 'All (19 Tools)' },
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
    <div className="space-y-16 py-8 sm:py-12">
      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-6">
        {/* Trust Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/60 text-xs font-semibold text-rose-700 dark:text-rose-300 shadow-xs">
          <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
          <span>{t.home.heroBadge}</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
          {t.home.heroTitle}{' '}
          <span className="bg-gradient-to-r from-rose-600 via-amber-500 to-rose-500 bg-clip-text text-transparent">
            {t.home.heroTitleHighlight}
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
          {t.home.heroSubtitle}
        </p>

        {/* Feature Badges */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2 text-xs font-medium text-slate-600 dark:text-slate-300">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {t.home.privacyPill}
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50">
            <Zap className="w-3.5 h-3.5" />
            {t.home.offlinePill}
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50">
            <Sparkles className="w-3.5 h-3.5" />
            {t.home.freePill}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
          <Link
            to="/tools"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm shadow-md shadow-rose-600/20 hover:shadow-lg hover:shadow-rose-600/30 transition-all"
          >
            <span>{t.home.getStartedBtn}</span>
            <ArrowRight className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
          </Link>

          <button
            type="button"
            onClick={openCommandPalette}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-sm border border-slate-200 dark:border-slate-700 transition-all shadow-xs"
          >
            <Search className="w-4 h-4 text-rose-500" />
            <span>{language === 'ar' ? 'بحث سريع بالأدوات' : 'Search Tools'}</span>
            <kbd className="hidden sm:inline-block text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-400">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Fast Drop Zone on Home */}
        <div className="max-w-2xl mx-auto pt-6">
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
        </div>
      </section>

      {/* Tools Grid Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              {t.home.quickToolsTitle}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {language === 'ar'
                ? 'كل ما تحتاجه للتعامل مع ملفات PDF في مكان واحد مجاني 100%'
                : 'Everything you need to read, edit, convert, and secure PDF documents'}
            </p>
          </div>

          {/* Category Switcher */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  activeCategory === cat.id
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
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
                className="group relative flex flex-col justify-between p-5 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 hover:border-rose-400 dark:hover:border-rose-500 shadow-xs hover:shadow-lg transition-all hover:-translate-y-0.5"
              >
                <div>
                  <div className="flex items-center justify-between mb-3.5">
                    <div
                      className={`w-11 h-11 rounded-xl bg-gradient-to-tr ${tool.color} flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                      {tool.badge}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                    {tool.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed line-clamp-2">
                    {tool.desc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs font-semibold text-rose-600 dark:text-rose-400">
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
      <section className="bg-slate-100/70 dark:bg-slate-900/60 border-y border-slate-200/80 dark:border-slate-800 py-16">
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
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {t.home.featurePrivacyTitle}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {t.home.featurePrivacyDesc}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {t.home.featureSpeedTitle}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {t.home.featureSpeedDesc}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {t.home.featureFreeTitle}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {t.home.featureFreeDesc}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
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
