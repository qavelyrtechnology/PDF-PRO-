import React, { useRef, useState, DragEvent, ChangeEvent } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { UploadCloud, File, AlertCircle } from 'lucide-react';

interface DropZoneProps {
  onFilesSelected: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  maxFiles?: number;
  promptText?: string;
  allowedFormatsText?: string;
  disabled?: boolean;
}

export const DropZone: React.FC<DropZoneProps> = ({
  onFilesSelected,
  accept = '.pdf,application/pdf',
  multiple = false,
  maxFiles,
  promptText,
  allowedFormatsText,
  disabled = false,
}) => {
  const { t } = useLanguage();
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    setIsDragOver(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const validateAndPassFiles = (rawFiles: FileList | File[]) => {
    setErrorMessage(null);
    const filesArray = Array.from(rawFiles);
    if (filesArray.length === 0) return;

    if (!multiple && filesArray.length > 1) {
      onFilesSelected([filesArray[0]]);
      return;
    }

    if (maxFiles && filesArray.length > maxFiles) {
      setErrorMessage(`Please select no more than ${maxFiles} files.`);
      return;
    }

    onFilesSelected(filesArray);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndPassFiles(e.dataTransfer.files);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndPassFiles(e.target.files);
      // Reset input value so re-uploading the same file still triggers onChange
      e.target.value = '';
    }
  };

  const handleClick = () => {
    if (disabled) return;
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full">
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label={promptText || (multiple ? t.common.selectFiles : t.common.selectFile)}
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
          }
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all cursor-pointer select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 ${
          disabled
            ? 'opacity-60 cursor-not-allowed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/30'
            : isDragOver
            ? 'border-rose-500 bg-rose-50/60 dark:bg-rose-950/40 ring-4 ring-rose-500/10 scale-[1.005]'
            : 'border-slate-300 dark:border-slate-700 hover:border-rose-400 dark:hover:border-rose-600 bg-white/50 dark:bg-slate-900/40 hover:bg-rose-50/30 dark:hover:bg-slate-800/40'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileChange}
          disabled={disabled}
          className="hidden"
          aria-hidden="true"
        />

        <div className="flex flex-col items-center justify-center space-y-3">
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
              isDragOver
                ? 'bg-rose-500 text-white scale-110 shadow-lg shadow-rose-500/30'
                : 'bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 group-hover:scale-105'
            }`}
          >
            <UploadCloud className="w-7 h-7" />
          </div>

          <div>
            <p className="text-base sm:text-lg font-semibold text-slate-800 dark:text-slate-100">
              {promptText || (multiple ? t.common.selectFiles : t.common.selectFile)}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {t.common.dropHere}{' '}
              <span className="text-rose-600 dark:text-rose-400 font-medium underline underline-offset-2">
                {t.common.orBrowse}
              </span>
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-xs text-slate-400 dark:text-slate-500">
            <span className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 font-mono">
              {allowedFormatsText || (accept.includes('image') ? 'PNG, JPG, WebP' : 'PDF')}
            </span>
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              {t.home.privacyPill}
            </span>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="mt-3 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 flex items-center gap-2 text-xs text-rose-700 dark:text-rose-300">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
};
