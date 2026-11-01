import React from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { useLanguage } from '../i18n/LanguageContext';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();
  const { isRtl } = useLanguage();

  if (isOnline) return null;

  return (
    <div
      role="status"
      className="fixed bottom-4 left-4 rtl:left-auto rtl:right-4 z-50 flex items-center gap-2 rounded-xl bg-amber-500/95 dark:bg-amber-600/95 text-white px-3.5 py-2 text-xs font-semibold shadow-lg backdrop-blur-xs animate-in fade-in slide-in-from-bottom-2 duration-300"
    >
      <WifiOff className="w-4 h-4 shrink-0" />
      <span>
        {isRtl
          ? 'وضع العمل دون إنترنت — جميع أدوات PDF تعمل محلياً بكامل طاقتها!'
          : 'Offline Mode — All PDF tools remain 100% operational locally!'}
      </span>
    </div>
  );
};
