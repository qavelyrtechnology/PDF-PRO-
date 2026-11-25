import React from 'react';
import { AlertTriangle, AlertCircle } from 'lucide-react';

interface FileGateAlertsProps {
  warning?: string | null;
  error?: string | null;
}

export const FileGateAlerts: React.FC<FileGateAlertsProps> = ({ warning, error }) => {
  if (!warning && !error) return null;

  return (
    <div className="space-y-3">
      {warning && (
        <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 flex items-center gap-2.5 text-xs text-amber-800 dark:text-amber-300">
          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <span>{warning}</span>
        </div>
      )}
      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/50 flex items-center gap-2.5 text-xs text-rose-700 dark:text-rose-300">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
