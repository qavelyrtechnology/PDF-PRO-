import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext';
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
  Search,
  ArrowRight,
  EyeOff,
  CheckSquare,
  Columns2,
  Archive,
  AlignJustify,
  Sparkles,
} from 'lucide-react';

export const ToolsDirectory: React.FC = () => {
  const { t, isRtl, language } = useLanguage();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'organize' | 'edit' | 'convert' | 'security'>('all');

  const tools = [
    {
      id: 'reader',
      title: t.nav.reader,
      desc: t.reader.subtitle,
      path: '/reader',
      category: 'organize',
      icon: FileText,
      badge: language === 'ar' ? 'قارئ سريع' : 'Fast Viewer',
    },
    {
      id: 'organize',
      title: t.nav.organize,
      desc: t.organize.subtitle,
      path: '/organize',
      category: 'organize',
      icon: LayoutGrid,
      badge: language === 'ar' ? 'ترتيب بصري' : 'Visual Reorder',
    },
    {
      id: 'merge',
      title: t.nav.merge,
      desc: t.merge.subtitle,
      path: '/merge',
      category: 'organize',
      icon: Layers,
      badge: language === 'ar' ? 'الأكثر طلباً' : 'Popular',
    },
    {
      id: 'split',
      title: t.nav.split,
      desc: t.split.subtitle,
      path: '/split',
      category: 'organize',
      icon: Scissors,
      badge: language === 'ar' ? 'تصدير ZIP' : 'ZIP Export',
    },
    {
      id: 'compare',
      title: t.nav.compare,
      desc: t.compare.subtitle,
      path: '/compare',
      category: 'organize',
      icon: Columns2,
      badge: language === 'ar' ? 'جنباً إلى جنب' : 'Side-by-side',
    },
    {
      id: 'annotate',
      title: t.nav.annotate,
      desc: t.annotate.subtitle,
      path: '/annotate',
      category: 'edit',
      icon: PenTool,
      badge: language === 'ar' ? 'توقيع وكتابة' : 'Sign & Draw',
    },
    {
      id: 'redact',
      title: t.nav.redact,
      desc: t.redact.subtitle,
      path: '/redact',
      category: 'security',
      icon: EyeOff,
      badge: language === 'ar' ? 'حجب أمني' : 'Pixel Redact',
    },
    {
      id: 'form-filler',
      title: t.nav.formFiller,
      desc: t.formFiller.subtitle,
      path: '/form-filler',
      category: 'edit',
      icon: CheckSquare,
      badge: language === 'ar' ? 'نماذج تفاعلية' : 'AcroForms',
    },
    {
      id: 'flatten',
      title: t.nav.flatten,
      desc: t.flatten.subtitle,
      path: '/flatten',
      category: 'security',
      icon: Layers,
      badge: language === 'ar' ? 'تثبيت وقفل' : 'Lock Forms',
    },
    {
      id: 'compress',
      title: t.nav.compress,
      desc: t.compress.subtitle,
      path: '/compress',
      category: 'edit',
      icon: Minimize2,
      badge: language === 'ar' ? '100% بالمتصفح' : '100% Local',
    },
    {
      id: 'page-numbers',
      title: t.nav.pageNumbers,
      desc: t.pageNumbers.subtitle,
      path: '/page-numbers',
      category: 'edit',
      icon: Hash,
      badge: language === 'ar' ? 'تخصيص كامل' : 'Custom Style',
    },
    {
      id: 'watermark',
      title: t.nav.watermark,
      desc: t.watermark.subtitle,
      path: '/watermark',
      category: 'edit',
      icon: Stamp,
      badge: language === 'ar' ? 'نص وشعار' : 'Text & Image',
    },
    {
      id: 'header-footer',
      title: t.nav.headerFooter,
      desc: t.headerFooter.subtitle,
      path: '/header-footer',
      category: 'edit',
      icon: AlignJustify,
      badge: language === 'ar' ? 'ترويسة وتذييل' : 'Header & Footer',
    },
    {
      id: 'crop',
      title: t.nav.crop,
      desc: t.crop.subtitle,
      path: '/crop',
      category: 'edit',
      icon: Crop,
      badge: language === 'ar' ? 'قص الهوامش' : 'Trim Margins',
    },
    {
      id: 'images-to-pdf',
      title: t.nav.imagesToPdf,
      desc: t.imagesToPdf.subtitle,
      path: '/images-to-pdf',
      category: 'convert',
      icon: ImageIcon,
      badge: language === 'ar' ? 'A4 ورسائل' : 'A4 & Letter',
    },
    {
      id: 'convert',
      title: t.nav.convert,
      desc: t.convert.subtitle,
      path: '/convert',
      category: 'convert',
      icon: RefreshCw,
      badge: language === 'ar' ? 'PNG / JPG' : 'High-Res',
    },
    {
      id: 'extract-images',
      title: t.nav.extractImages,
      desc: t.extractImages.subtitle,
      path: '/extract-images',
      category: 'convert',
      icon: Archive,
      badge: language === 'ar' ? 'استخراج كلي' : 'All Assets',
    },
    {
      id: 'ocr',
      title: t.nav.ocr,
      desc: t.ocr.subtitle,
      path: '/ocr',
      category: 'convert',
      icon: ScanText,
      badge: language === 'ar' ? 'عربي وإنجليزي' : 'Arabic & English',
    },
    {
      id: 'security',
      title: t.nav.security,
      desc: t.security.subtitle,
      path: '/security',
      category: 'security',
      icon: ShieldCheck,
      badge: language === 'ar' ? 'تنظيف التتبع' : 'Metadata Strip',
    },
  ];

  const categories = [
    {
      id: 'all',
      name: language === 'ar' ? 'جميع الأدوات' : 'All Tools',
      count: tools.length,
    },
    {
      id: 'organize',
      name: language === 'ar' ? 'تنظيم وعرض' : 'Organize & View',
      count: tools.filter((t) => t.category === 'organize').length,
    },
    {
      id: 'edit',
      name: language === 'ar' ? 'تعديل وتوقيع' : 'Edit & Sign',
      count: tools.filter((t) => t.category === 'edit').length,
    },
    {
      id: 'convert',
      name: language === 'ar' ? 'تحويل واستخراج' : 'Convert & Extract',
      count: tools.filter((t) => t.category === 'convert').length,
    },
    {
      id: 'security',
      name: language === 'ar' ? 'أمان وخصوصية' : 'Security & Privacy',
      count: tools.filter((t) => t.category === 'security').length,
    },
  ];

  const filteredTools = tools.filter((tool) => {
    const matchesCategory =
      selectedCategory === 'all' ||
      tool.category === selectedCategory ||
      (selectedCategory === 'security' && (tool.id === 'redact' || tool.id === 'flatten' || tool.id === 'security'));
    const matchesSearch =
      tool.title.toLowerCase().includes(search.toLowerCase()) ||
      tool.desc.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-200 dark:border-rose-900/50">
          <Sparkles className="w-3.5 h-3.5 text-rose-500" />
          <span>{language === 'ar' ? '19 أداة بي دي إف احترافية مجانية' : '19 Professional Free PDF Tools'}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {t.nav.tools}
        </h1>
        <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400">
          {t.appDescription}
        </p>
      </div>

      {/* Search & Filter Controls */}
      <div className="space-y-4 max-w-4xl mx-auto">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 rtl:left-auto rtl:right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={
              language === 'ar'
                ? 'ابحث باسم الأداة أو نوعها (مثال: دمج، تقسيم، ضغط، توقيع، طمس)...'
                : 'Search any PDF tool (e.g. merge, split, compress, sign, redact, ocr)...'
            }
            className="w-full pl-10 rtl:pl-4 rtl:pr-10 pr-4 py-3 text-sm rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all text-slate-900 dark:text-white"
          />
        </div>

        {/* Categories Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id as any)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                selectedCategory === cat.id
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-750'
              }`}
            >
              <span>{cat.name}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  selectedCategory === cat.id
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                }`}
              >
                {cat.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Tools Grid */}
      {filteredTools.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-8 max-w-md mx-auto">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            {language === 'ar' ? 'لا توجد نتائج تطابق بحثك' : 'No tools found matching your search'}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            {language === 'ar' ? 'جرب كلمات أخرى أو امسح شريط البحث' : 'Try searching for something else or clear the filter'}
          </p>
          <button
            onClick={() => {
              setSearch('');
              setSelectedCategory('all');
            }}
            className="mt-4 px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-600 text-white hover:bg-rose-700 transition-colors"
          >
            {language === 'ar' ? 'إعادة ضبط البحث' : 'Reset search'}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredTools.map((tool) => {
            const Icon = tool.icon;
            return (
              <Link
                key={tool.id}
                to={tool.path}
                className="group relative flex flex-col justify-between p-5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/90 dark:border-slate-750 shadow-xs hover:shadow-lg hover:border-rose-400 dark:hover:border-rose-500/50 transition-all hover:-translate-y-0.5"
              >
                <div>
                  <div className="flex items-center justify-between mb-3.5">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-50 to-rose-100 dark:from-rose-950/60 dark:to-rose-900/40 text-rose-600 dark:text-rose-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Icon className="w-5 h-5" />
                    </div>
                    {tool.badge && (
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700/80 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700">
                        {tool.badge}
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                    {tool.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {tool.desc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/50 flex items-center justify-between text-xs font-semibold text-rose-600 dark:text-rose-400">
                  <span>{language === 'ar' ? 'افتح الأداة' : 'Launch tool'}</span>
                  <ArrowRight
                    className={`w-3.5 h-3.5 transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1 ${
                      isRtl ? 'rotate-180' : ''
                    }`}
                  />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};
