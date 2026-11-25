import React from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { ShieldCheck } from 'lucide-react';

interface ToolSeoSectionProps {
  pageKey: string;
  toolName: string;
}

export const ToolSeoSection: React.FC<ToolSeoSectionProps> = ({ pageKey, toolName }) => {
  const { t } = useLanguage();
  const entry = t.seo.pages[pageKey];
  const summary = entry?.summary || entry?.description;

  if (!summary) return null;

  return (
    <section
      aria-label={toolName}
      className="mt-10 p-5 sm:p-6 rounded-2xl bg-white/80 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800 space-y-2.5"
    >
      <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
        <span>{t.seo.aboutSectionHeading.replace('{tool}', toolName)}</span>
      </h2>
      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
        {summary}
      </p>
      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
        {t.seo.privacyFootnote}
      </p>
    </section>
  );
};
