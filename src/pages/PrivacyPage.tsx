import React from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { PageSeo } from '../components/PageSeo';
import { Shield, Lock, EyeOff, Cpu, RefreshCw, CheckCircle2 } from 'lucide-react';

export const PrivacyPage: React.FC = () => {
  const { t } = useLanguage();

  const sections = [
    {
      title: t.privacy.section1Title,
      text: t.privacy.section1Text,
      icon: Lock,
    },
    {
      title: t.privacy.section2Title,
      text: t.privacy.section2Text,
      icon: EyeOff,
    },
    {
      title: t.privacy.section3Title,
      text: t.privacy.section3Text,
      icon: Cpu,
    },
    {
      title: t.privacy.section4Title,
      text: t.privacy.section4Text,
      icon: CheckCircle2,
    },
    {
      title: t.privacy.section5Title,
      text: t.privacy.section5Text,
      icon: RefreshCw,
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <PageSeo pageKey="privacy" />
      {/* Header */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
          <Shield className="w-3.5 h-3.5 text-emerald-500" />
          <span>{t.privacy.badge100Local}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
          {t.privacy.title}
        </h1>
        <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed">
          {t.privacy.summary}
        </p>
      </div>

      {/* Sections */}
      <div className="space-y-6">
        {sections.map((sec, idx) => {
          const Icon = sec.icon;
          return (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs space-y-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  {sec.title}
                </h2>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed pl-12 rtl:pl-0 rtl:pr-12">
                {sec.text}
              </p>
            </div>
          );
        })}
      </div>

      {/* Technical Guarantee Box */}
      <div className="p-6 rounded-2xl bg-slate-900 text-slate-100 dark:bg-slate-950 border border-slate-800 space-y-3">
        <h3 className="font-bold text-base flex items-center gap-2 text-rose-400">
          <Shield className="w-5 h-5" />
          <span>Technical Verification & Open Architecture</span>
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed">
          You can open your browser developer tools (F12) right now, switch to the
          &quot;Network&quot; tab, and process any PDF document. You will see 0 POST/PUT
          payloads transmitting your document bytes. Everything is powered by WebAssembly, Web
          Workers, and local JavaScript memory buffers.
        </p>
      </div>
    </div>
  );
};
