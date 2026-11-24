import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext';
import {
  Search,
  X,
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
  EyeOff,
  CheckSquare,
  Columns2,
  Archive,
  AlignJustify,
  ArrowRight,
} from 'lucide-react';

interface ToolItem {
  id: string;
  name: string;
  desc: string;
  path: string;
  category: 'organize' | 'edit' | 'convert' | 'security';
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  keywords: string[];
}

export const CommandPalette: React.FC = () => {
  const { t, isRtl, language } = useLanguage();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const tools: ToolItem[] = [
    {
      id: 'reader',
      name: t.nav.reader,
      desc: t.reader.subtitle,
      path: '/reader',
      category: 'organize',
      icon: FileText,
      badge: 'Fast',
      keywords: ['reader', 'view', 'read', 'عرض', 'قارئ', 'قراءة'],
    },
    {
      id: 'organize',
      name: t.nav.organize,
      desc: t.organize.subtitle,
      path: '/organize',
      category: 'organize',
      icon: LayoutGrid,
      badge: 'Visual',
      keywords: ['organize', 'rotate', 'reorder', 'delete', 'ترتيب', 'تدوير', 'حذف صفحات'],
    },
    {
      id: 'merge',
      name: t.nav.merge,
      desc: t.merge.subtitle,
      path: '/merge',
      category: 'organize',
      icon: Layers,
      badge: 'Popular',
      keywords: ['merge', 'combine', 'join', 'دمج', 'تجميع'],
    },
    {
      id: 'split',
      name: t.nav.split,
      desc: t.split.subtitle,
      path: '/split',
      category: 'organize',
      icon: Scissors,
      badge: 'ZIP Export',
      keywords: ['split', 'extract', 'cut', 'تقسيم', 'فصل', 'استخراج'],
    },
    {
      id: 'compress',
      name: t.nav.compress,
      desc: t.compress.subtitle,
      path: '/compress',
      category: 'edit',
      icon: Minimize2,
      badge: 'Eco',
      keywords: ['compress', 'reduce size', 'optimize', 'ضغط', 'تصغير حجم'],
    },
    {
      id: 'annotate',
      name: t.nav.annotate,
      desc: t.annotate.subtitle,
      path: '/annotate',
      category: 'edit',
      icon: PenTool,
      badge: 'Signature',
      keywords: ['annotate', 'sign', 'draw', 'signature', 'توقيع', 'رسم', 'كتابة'],
    },
    {
      id: 'redact',
      name: t.nav.redact,
      desc: t.redact.subtitle,
      path: '/redact',
      category: 'security',
      icon: EyeOff,
      badge: 'Permanent',
      keywords: ['redact', 'blackout', 'hide', 'censor', 'طمس', 'تعتيم', 'إخفاء بيانات'],
    },
    {
      id: 'form-filler',
      name: t.nav.formFiller,
      desc: t.formFiller.subtitle,
      path: '/form-filler',
      category: 'edit',
      icon: CheckSquare,
      keywords: ['form', 'fill', 'acroform', 'تعبئة نموذج', 'استمارة'],
    },
    {
      id: 'flatten',
      name: t.nav.flatten,
      desc: t.flatten.subtitle,
      path: '/flatten',
      category: 'security',
      icon: Layers,
      keywords: ['flatten', 'lock', 'un-editable', 'تسطيح', 'قفل'],
    },
    {
      id: 'page-numbers',
      name: t.nav.pageNumbers,
      desc: t.pageNumbers.subtitle,
      path: '/page-numbers',
      category: 'edit',
      icon: Hash,
      keywords: ['page numbers', 'numbering', 'header', 'ترقيم', 'أرقام صفحات'],
    },
    {
      id: 'watermark',
      name: t.nav.watermark,
      desc: t.watermark.subtitle,
      path: '/watermark',
      category: 'edit',
      icon: Stamp,
      keywords: ['watermark', 'stamp', 'logo', 'علامة مائية', 'شعار'],
    },
    {
      id: 'crop',
      name: t.nav.crop,
      desc: t.crop.subtitle,
      path: '/crop',
      category: 'edit',
      icon: Crop,
      keywords: ['crop', 'margin', 'trim', 'قص', 'هوامش'],
    },
    {
      id: 'header-footer',
      name: t.nav.headerFooter,
      desc: t.headerFooter.subtitle,
      path: '/header-footer',
      category: 'edit',
      icon: AlignJustify,
      keywords: ['header', 'footer', 'title', 'تذييل', 'ترويسة'],
    },
    {
      id: 'compare',
      name: t.nav.compare,
      desc: t.compare.subtitle,
      path: '/compare',
      category: 'organize',
      icon: Columns2,
      badge: 'Side-by-side',
      keywords: ['compare', 'diff', 'revision', 'مقارنة', 'اختلاف'],
    },
    {
      id: 'images-to-pdf',
      name: t.nav.imagesToPdf,
      desc: t.imagesToPdf.subtitle,
      path: '/images-to-pdf',
      category: 'convert',
      icon: ImageIcon,
      badge: 'Batch',
      keywords: ['images to pdf', 'jpg to pdf', 'png to pdf', 'صور إلى pdf', 'تحويل الصور'],
    },
    {
      id: 'convert',
      name: t.nav.convert,
      desc: t.convert.subtitle,
      path: '/convert',
      category: 'convert',
      icon: RefreshCw,
      badge: 'PNG/JPG',
      keywords: ['pdf to images', 'convert', 'extract pages', 'تحويل الى صور'],
    },
    {
      id: 'extract-images',
      name: t.nav.extractImages,
      desc: t.extractImages.subtitle,
      path: '/extract-images',
      category: 'convert',
      icon: Archive,
      badge: 'All Assets',
      keywords: ['extract images', 'download photos', 'استخراج الصور'],
    },
    {
      id: 'ocr',
      name: t.nav.ocr,
      desc: t.ocr.subtitle,
      path: '/ocr',
      category: 'convert',
      icon: ScanText,
      badge: 'Offline AI',
      keywords: ['ocr', 'text recognition', 'tesseract', 'تعرف نصوص', 'استخراج نص'],
    },
    {
      id: 'security',
      name: t.nav.security,
      desc: t.security.subtitle,
      path: '/security',
      category: 'security',
      icon: ShieldCheck,
      badge: 'Sanitize',
      keywords: ['security', 'metadata', 'sanitize', 'حماية', 'بيانات وصفية'],
    },
  ];

  // Listen for keyboard shortcut Ctrl+K or Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        setIsOpen(false);
      }
    };

    const handleCustomOpen = () => {
      setIsOpen(true);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('open-command-palette', handleCustomOpen);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('open-command-palette', handleCustomOpen);
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
      setQuery('');
    }
  }, [isOpen]);

  const filteredTools = tools.filter((tool) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      tool.name.toLowerCase().includes(q) ||
      tool.desc.toLowerCase().includes(q) ||
      tool.keywords.some((k) => k.toLowerCase().includes(q))
    );
  });

  const handleSelect = (path: string) => {
    setIsOpen(false);
    navigate(path);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1 < filteredTools.length ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 >= 0 ? prev - 1 : filteredTools.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredTools[selectedIndex]) {
        handleSelect(filteredTools[selectedIndex].path);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={() => setIsOpen(false)}
    >
      <div
        className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[80vh] transition-all"
        onClick={(e) => e.stopPropagation()}
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        {/* Search Header */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <Search className="w-5 h-5 text-rose-500 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleInputKeyDown}
            placeholder={
              language === 'ar'
                ? 'ابحث عن أداة (مثال: دمج، توقيع، ضغط، طمس، استخراج نصوص)...'
                : 'Search any PDF tool (e.g. merge, compress, sign, redact, ocr)...'
            }
            className="flex-1 bg-transparent border-none text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none text-base"
          />
          {query ? (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium text-slate-400 dark:text-slate-500 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800">
              ESC
            </kbd>
          )}
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-2 divide-y divide-slate-100 dark:divide-slate-800/50">
          {filteredTools.length === 0 ? (
            <div className="p-8 text-center text-slate-500 dark:text-slate-400">
              <p className="font-medium text-sm">
                {language === 'ar' ? 'لم يتم العثور على أداة مطابقة' : 'No matching PDF tools found.'}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {language === 'ar' ? 'جرب البحث بكلمات أخرى مثل "دمج" أو "صور"' : 'Try searching for "merge", "sign", or "image"'}
              </p>
            </div>
          ) : (
            <div className="space-y-1 py-1">
              {filteredTools.map((tool, idx) => {
                const Icon = tool.icon;
                const isSelected = idx === selectedIndex;
                return (
                  <button
                    key={tool.id}
                    onClick={() => handleSelect(tool.path)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl text-left rtl:text-right transition-colors ${
                      isSelected
                        ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-950 dark:text-rose-100'
                        : 'hover:bg-slate-100/70 dark:hover:bg-slate-800/60 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                          isSelected
                            ? 'bg-rose-500 text-white shadow-sm shadow-rose-500/30'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm truncate">{tool.name}</span>
                          {tool.badge && (
                            <>
                              <span aria-hidden="true" className="text-slate-300 dark:text-slate-600">·</span>
                              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 shrink-0">
                                {tool.badge}
                              </span>
                            </>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-md">
                          {tool.desc}
                        </p>
                      </div>
                    </div>
                    <ArrowRight
                      className={`w-4 h-4 shrink-0 transition-transform ${
                        isRtl ? 'rotate-180' : ''
                      } ${isSelected ? 'text-rose-500 translate-x-0.5 rtl:-translate-x-0.5' : 'text-slate-300 dark:text-slate-600'}`}
                    />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-rose-500" />
            <span>
              {language === 'ar'
                ? '19 أداة مجانية 100% تعمل محلياً داخل متصفحك دون رفع ملفات'
                : '19 free, client-side tools processed 100% in your browser'}
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <span>
              {language === 'ar' ? 'استخدم الأسهم للتنقل و Enter للاختيار' : 'Use ↑↓ to navigate, Enter to open'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
