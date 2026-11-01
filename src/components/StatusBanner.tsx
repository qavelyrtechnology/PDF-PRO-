import React from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export type BannerType = 'success' | 'error' | 'warning' | 'info';

interface StatusBannerProps {
  type: BannerType;
  title?: string;
  message: string;
  onDismiss?: () => void;
  className?: string;
}

export const StatusBanner: React.FC<StatusBannerProps> = ({
  type,
  title,
  message,
  onDismiss,
  className = '',
}) => {
  const configs = {
    success: {
      bg: 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800/60',
      text: 'text-emerald-900 dark:text-emerald-200',
      icon: CheckCircle2,
      iconColor: 'text-emerald-600 dark:text-emerald-400',
    },
    error: {
      bg: 'bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-900/60',
      text: 'text-rose-900 dark:text-rose-200',
      icon: AlertCircle,
      iconColor: 'text-rose-600 dark:text-rose-400',
    },
    warning: {
      bg: 'bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800/60',
      text: 'text-amber-900 dark:text-amber-200',
      icon: AlertTriangle,
      iconColor: 'text-amber-600 dark:text-amber-400',
    },
    info: {
      bg: 'bg-sky-50 dark:bg-sky-950/50 border-sky-200 dark:border-sky-800/60',
      text: 'text-sky-900 dark:text-sky-200',
      icon: Info,
      iconColor: 'text-sky-600 dark:text-sky-400',
    },
  }[type];

  const Icon = configs.icon;

  return (
    <div
      role="alert"
      className={`p-4 rounded-xl border flex items-start justify-between gap-3 ${configs.bg} ${configs.text} ${className}`}
    >
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${configs.iconColor}`} />
        <div className="text-sm">
          {title && <h4 className="font-semibold mb-0.5">{title}</h4>}
          <p className="leading-relaxed opacity-90">{message}</p>
        </div>
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="p-1 rounded-md opacity-60 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5 transition-opacity"
          aria-label="Dismiss message"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
