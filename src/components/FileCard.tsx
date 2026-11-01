import React from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { formatBytes } from '../services/pdfService';
import { FileText, Image as ImageIcon, ArrowUp, ArrowDown, Trash2 } from 'lucide-react';

interface FileCardProps {
  name: string;
  size: number;
  type?: string;
  previewUrl?: string;
  pageCount?: number;
  onRemove?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  index?: number;
}

export const FileCard: React.FC<FileCardProps> = ({
  name,
  size,
  type = 'pdf',
  previewUrl,
  pageCount,
  onRemove,
  onMoveUp,
  onMoveDown,
  canMoveUp = false,
  canMoveDown = false,
  index,
}) => {
  const { t } = useLanguage();
  const isImage = type.includes('image');

  return (
    <div className="flex items-center justify-between p-3.5 bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-xl shadow-xs transition-all hover:border-slate-300 dark:hover:border-slate-600">
      <div className="flex items-center gap-3 min-w-0">
        {/* Index indicator if provided */}
        {index !== undefined && (
          <span className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-mono text-xs font-semibold flex items-center justify-center shrink-0">
            {index + 1}
          </span>
        )}

        {/* Thumbnail or Icon */}
        <div className="w-10 h-10 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-100 dark:border-rose-900/40 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0 overflow-hidden">
          {previewUrl ? (
            <img src={previewUrl} alt={name} className="w-full h-full object-cover" />
          ) : isImage ? (
            <ImageIcon className="w-5 h-5" />
          ) : (
            <FileText className="w-5 h-5" />
          )}
        </div>

        {/* Details */}
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate max-w-[200px] sm:max-w-xs md:max-w-md" title={name}>
            {name}
          </p>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            <span>{formatBytes(size)}</span>
            {pageCount !== undefined && (
              <>
                <span>•</span>
                <span>
                  {pageCount} {pageCount === 1 ? t.common.page : t.common.pages}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-1 shrink-0 ml-2 rtl:ml-0 rtl:mr-2">
        {onMoveUp && (
          <button
            type="button"
            onClick={onMoveUp}
            disabled={!canMoveUp}
            className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            title={t.common.moveUp}
            aria-label={t.common.moveUp}
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        )}

        {onMoveDown && (
          <button
            type="button"
            onClick={onMoveDown}
            disabled={!canMoveDown}
            className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            title={t.common.moveDown}
            aria-label={t.common.moveDown}
          >
            <ArrowDown className="w-4 h-4" />
          </button>
        )}

        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors ml-1 rtl:ml-0 rtl:mr-1"
            title={t.common.remove}
            aria-label={t.common.remove}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
