import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext';
import { FileText, Shield, Heart, Cpu, CheckCircle } from 'lucide-react';

export const Footer: React.FC = () => {
  const { t, language, setLanguage } = useLanguage();

  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 transition-colors mt-auto">
      {/* Privacy Guarantee Ribbon */}
      <div className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200/60 dark:border-slate-800/80 py-3 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4 text-xs text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-500 shrink-0" />
            <span className="font-medium">{t.footer.clientSideNotice}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              {t.home.offlinePill}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-8">
          {/* Column 1: Brand & Mission */}
          <div className="sm:col-span-2 md:col-span-1 space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-rose-600 flex items-center justify-center text-white">
                <FileText className="w-4 h-4" />
              </div>
              <span className="font-bold text-base text-slate-900 dark:text-white">
                {t.appName}
              </span>
            </Link>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {t.footer.tagline}
            </p>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`text-xs px-2.5 py-1 rounded-md border transition-colors ${
                  language === 'en'
                    ? 'border-rose-500 text-rose-600 dark:text-rose-400 font-semibold bg-rose-50 dark:bg-rose-950/40'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-400'
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setLanguage('ar')}
                className={`text-xs px-2.5 py-1 rounded-md border transition-colors font-arabic ${
                  language === 'ar'
                    ? 'border-rose-500 text-rose-600 dark:text-rose-400 font-semibold bg-rose-50 dark:bg-rose-950/40'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-400'
                }`}
              >
                العربية
              </button>
            </div>
          </div>

          {/* Column 2: Organize & View */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-slate-100 mb-3">
              {language === 'ar' ? 'تنظيم وعرض' : 'Organize & View'}
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/reader" className="text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors">
                  {t.nav.reader}
                </Link>
              </li>
              <li>
                <Link to="/organize" className="text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors">
                  {t.nav.organize}
                </Link>
              </li>
              <li>
                <Link to="/merge" className="text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors">
                  {t.nav.merge}
                </Link>
              </li>
              <li>
                <Link to="/split" className="text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors">
                  {t.nav.split}
                </Link>
              </li>
              <li>
                <Link to="/compare" className="text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors">
                  {t.nav.compare}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Edit & Sign */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-slate-100 mb-3">
              {language === 'ar' ? 'تعديل وتوقيع' : 'Edit & Sign'}
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/annotate" className="text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors">
                  {t.nav.annotate}
                </Link>
              </li>
              <li>
                <Link to="/redact" className="text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors">
                  {t.nav.redact}
                </Link>
              </li>
              <li>
                <Link to="/form-filler" className="text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors">
                  {t.nav.formFiller}
                </Link>
              </li>
              <li>
                <Link to="/flatten" className="text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors">
                  {t.nav.flatten}
                </Link>
              </li>
              <li>
                <Link to="/watermark" className="text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors">
                  {t.nav.watermark}
                </Link>
              </li>
              <li>
                <Link to="/header-footer" className="text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors">
                  {t.nav.headerFooter}
                </Link>
              </li>
              <li>
                <Link to="/page-numbers" className="text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors">
                  {t.nav.pageNumbers}
                </Link>
              </li>
              <li>
                <Link to="/compress" className="text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors">
                  {t.nav.compress}
                </Link>
              </li>
              <li>
                <Link to="/crop" className="text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors">
                  {t.nav.crop}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Convert & Extract */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-slate-100 mb-3">
              {language === 'ar' ? 'تحويل واستخراج' : 'Convert & Extract'}
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/images-to-pdf" className="text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors">
                  {t.nav.imagesToPdf}
                </Link>
              </li>
              <li>
                <Link to="/convert" className="text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors">
                  {t.nav.convert}
                </Link>
              </li>
              <li>
                <Link to="/extract-images" className="text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors">
                  {t.nav.extractImages}
                </Link>
              </li>
              <li>
                <Link to="/ocr" className="text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors">
                  {t.nav.ocr}
                </Link>
              </li>
              <li>
                <Link to="/security" className="text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors">
                  {t.nav.security}
                </Link>
              </li>
              <li className="pt-2">
                <Link to="/tools" className="font-semibold text-rose-600 dark:text-rose-400 hover:underline">
                  {language === 'ar' ? 'جميع الـ 19 أداة ←' : 'View all 19 tools →'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 5: Trust & Info */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-slate-100 mb-3">
              {t.footer.legal}
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/privacy" className="text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors">
                  {t.nav.privacy}
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors">
                  {t.nav.about}
                </Link>
              </li>
              <li className="pt-2 text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-slate-400" />
                <span>pdf-lib & PDF.js Engine</span>
              </li>
              <li className="text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                <span>100% In-Browser Sandbox</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <p>{t.footer.allRightsReserved}</p>
          <p className="flex items-center gap-1">
            <span>Free & Open Web Experience</span>
            <span>•</span>
            <span className="text-rose-500">❤️</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
