import React from 'react';
import { X } from 'lucide-react';

interface ProgressBarProps {
  progress: number; // 0 to 100
  statusText?: string;
  className?: string;
  onCancel?: () => void;
  cancelLabel?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  statusText,
  className = '',
  onCancel,
  cancelLabel = 'Cancel',
}) => {
  const clamped = Math.min(100, Math.max(0, progress));

  return (
    <div className={`w-full space-y-2 ${className}`}>
      <div className="flex justify-between items-center gap-3 text-xs font-medium">
        <span className="text-slate-700 dark:text-slate-300 truncate flex-1">
          {statusText || 'Processing...'}
        </span>
        <div className="flex items-center gap-2.5 shrink-0">
          <span className="text-rose-600 dark:text-rose-400 font-mono font-semibold tabular-nums">
            {clamped}%
          </span>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/50 text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 border border-slate-200 dark:border-slate-700 text-[11px] font-semibold transition-colors"
            >
              <X className="w-3 h-3" />
              <span>{cancelLabel}</span>
            </button>
          )}
        </div>
      </div>
      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
        <div
          className="bg-gradient-to-r from-rose-500 to-amber-500 h-2.5 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${clamped}%` }}
          role="progressbar"
          aria-valuenow={clamped}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
};
