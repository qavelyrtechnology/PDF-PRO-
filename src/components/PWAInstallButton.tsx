import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { useLanguage } from '../i18n/LanguageContext';
import { Download, Smartphone, X } from 'lucide-react';

export const PWAInstallButton: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const { isRtl } = useLanguage();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running standalone, hide the prompt
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={install}
        className={`flex items-center gap-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-xs transition-all ${
          compact ? 'px-2 py-1' : 'px-3 py-1.5'
        }`}
        title={isRtl ? 'تثبيت كبرنامج على الجهاز' : 'Install App on Device'}
        aria-label={isRtl ? 'تثبيت كبرنامج على الجهاز' : 'Install App on Device'}
      >
        <Download className="w-3.5 h-3.5" />
        <span>{isRtl ? 'تثبيت التطبيق' : 'Install App'}</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowIOSGuide(true)}
          className={`flex items-center gap-1.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium text-xs transition-all ${
            compact ? 'px-2 py-1' : 'px-3 py-1.5'
          }`}
          title={isRtl ? 'تثبيت على آيفون' : 'Install on iPhone'}
        >
          <Smartphone className="w-3.5 h-3.5 text-rose-500" />
          <span>{isRtl ? 'تثبيت على آيفون' : 'Install on iOS'}</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-rose-500" />
                  <span>{isRtl ? 'تثبيت على iPhone أو iPad' : 'Install on iPhone or iPad'}</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="text-xs text-slate-600 dark:text-slate-300 space-y-2 leading-relaxed">
                <p>
                  1.{' '}
                  {isRtl
                    ? 'اضغط على زر المشاركة (Share) في شريط متصفح Safari بالأسفل.'
                    : 'Tap the Share button in the Safari toolbar.'}
                </p>
                <p>
                  2.{' '}
                  {isRtl
                    ? 'مرر للأسفل واختر "إضافة إلى الشاشة الرئيسية" (Add to Home Screen).'
                    : 'Scroll down and tap "Add to Home Screen".'}
                </p>
                <p>
                  3.{' '}
                  {isRtl
                    ? 'اضغط على "إضافة" (Add) بالأعلى ليعمل التطبيق كبرنامج مستقل وسريع!'
                    : 'Tap "Add" in the top-right to enjoy full standalone offline access!'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200"
              >
                {isRtl ? 'حسناً، فهمت' : 'Got it'}
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
