import React from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { Info, HelpCircle, Code, Cpu, ShieldCheck, Heart } from 'lucide-react';

export const AboutPage: React.FC = () => {
  const { t } = useLanguage();

  const faqs = [
    { q: t.about.faq1Q, a: t.about.faq1A },
    { q: t.about.faq2Q, a: t.about.faq2A },
    { q: t.about.faq3Q, a: t.about.faq3A },
    { q: t.about.faq4Q, a: t.about.faq4A },
  ];

  const technologies = [
    {
      name: 'pdf-lib',
      role: 'PDF creation, merging, splitting, vector text and image embedding',
      badge: 'Client-side TS',
    },
    {
      name: 'PDF.js (Mozilla)',
      role: 'Document parsing, canvas page rendering, rasterization',
      badge: 'WebAssembly / Worker',
    },
    {
      name: 'Tesseract.js',
      role: 'Client-side Optical Character Recognition (OCR) for English and Arabic',
      badge: 'WASM OCR',
    },
    {
      name: 'JSZip',
      role: 'In-memory multi-file zip archiving for split pages and image bundles',
      badge: 'Local Archiving',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
          {t.about.title}
        </h1>
        <p className="text-base text-slate-600 dark:text-slate-300">
          {t.about.subtitle}
        </p>
      </div>

      {/* Mission */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 text-rose-600 dark:text-rose-400 font-bold text-lg">
          <Heart className="w-6 h-6" />
          <h2>{t.about.missionTitle}</h2>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          {t.about.missionText}
        </p>
      </div>

      {/* Open Tech Stack */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Cpu className="w-5 h-5 text-rose-600" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {t.about.openTechTitle}
          </h2>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {t.about.openTechText}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {technologies.map((tech) => (
            <div
              key={tech.name}
              className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-slate-900 dark:text-white font-mono">
                  {tech.name}
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                  {tech.badge}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">{tech.role}</p>
            </div>
          ))}
        </div>
      </div>

      {/* FAQs */}
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-rose-600" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {t.about.faqTitle}
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="p-5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2"
            >
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">{faq.q}</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
