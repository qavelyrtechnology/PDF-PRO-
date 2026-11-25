import React, { useState, useRef } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { DropZone } from '../components/DropZone';
import { FileCard } from '../components/FileCard';
import { ProgressBar } from '../components/ProgressBar';
import { StatusBanner } from '../components/StatusBanner';
import { PageSeo } from '../components/PageSeo';
import { ToolSeoSection } from '../components/ToolSeoSection';
import { FileGateAlerts } from '../components/FileGateAlerts';
import { PasswordModal } from '../components/PasswordModal';
import { usePdfFileGate } from '../hooks/usePdfFileGate';
import { mergePdfs, downloadFile } from '../services/pdfService';
import { isCancelledError } from '../utils/fileUtils';
import { Layers, Download, Trash2, ArrowRight } from 'lucide-react';

export const MergePage: React.FC = () => {
  const { t, isRtl } = useLanguage();
  const gate = usePdfFileGate();
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  const [mergedPdfBytes, setMergedPdfBytes] = useState<Uint8Array | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleFilesSelected = async (newFiles: File[]) => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setMergedPdfBytes(null);

    // Filter valid PDFs
    const valid = newFiles.filter(
      (f) => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf')
    );

    if (valid.length === 0) {
      setErrorMessage('Please select valid PDF documents.');
      return;
    }

    const ready = await gate.prepareFiles(valid);
    if (ready.length > 0) {
      setFiles((prev) => [...prev, ...ready]);
    }
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    setFiles((prev) => {
      const next = [...prev];
      const temp = next[index - 1];
      next[index - 1] = next[index];
      next[index] = temp;
      return next;
    });
  };

  const handleMoveDown = (index: number) => {
    if (index >= files.length - 1) return;
    setFiles((prev) => {
      const next = [...prev];
      const temp = next[index + 1];
      next[index + 1] = next[index];
      next[index] = temp;
      return next;
    });
  };

  const handleRemove = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setMergedPdfBytes(null);
  };

  const handleClearAll = () => {
    setFiles([]);
    setMergedPdfBytes(null);
    setErrorMessage(null);
    setSuccessMessage(null);
    gate.clearNotices();
  };

  const handleMerge = async () => {
    if (files.length < 2) {
      setErrorMessage(t.merge.needAtLeastTwo);
      return;
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsProcessing(true);
    setProgress(10);
    setStatusText(t.merge.mergingProgress);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const bytes = await mergePdfs(
        files,
        (pct) => {
          setProgress(pct);
        },
        controller.signal
      );
      setMergedPdfBytes(bytes);
      setSuccessMessage(t.merge.mergedSuccess);
    } catch (err: any) {
      if (isCancelledError(err)) {
        setErrorMessage(t.fileLimits.cancelledNotice);
      } else {
        console.error('Merge error:', err);
        setErrorMessage(err?.message || t.common.error);
      }
    } finally {
      abortControllerRef.current = null;
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!mergedPdfBytes) return;
    const baseName = files[0]?.name.replace(/\.pdf$/i, '') || 'document';
    downloadFile(mergedPdfBytes, `${baseName}_merged.pdf`);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <PageSeo pageKey="merge" />
      <PasswordModal {...gate.passwordModalProps} />

      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Layers className="w-7 h-7 text-rose-600" />
          {t.merge.title}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          {t.merge.subtitle}
        </p>
      </div>

      <FileGateAlerts warning={gate.sizeWarning} error={gate.blockError} />

      {errorMessage && (
        <StatusBanner
          type="error"
          message={errorMessage}
          onDismiss={() => setErrorMessage(null)}
        />
      )}

      {successMessage && (
        <StatusBanner
          type="success"
          message={successMessage}
          onDismiss={() => setSuccessMessage(null)}
        />
      )}

      {/* Upload Drop Zone */}
      <DropZone
        onFilesSelected={handleFilesSelected}
        promptText={t.merge.dropPrompt}
        allowedFormatsText="PDF"
        multiple={true}
        disabled={isProcessing}
      />

      {/* Selected Files List */}
      {files.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                {t.merge.fileListTitle} ({files.length})
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t.merge.reorderHint}
              </p>
            </div>
            <button
              type="button"
              onClick={handleClearAll}
              disabled={isProcessing}
              className="inline-flex items-center gap-1 text-xs text-rose-600 dark:text-rose-400 hover:underline"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{t.common.clear}</span>
            </button>
          </div>

          <div className="space-y-2">
            {files.map((f, idx) => (
              <FileCard
                key={`${f.name}-${idx}`}
                name={f.name}
                size={f.size}
                index={idx}
                canMoveUp={idx > 0 && !isProcessing}
                canMoveDown={idx < files.length - 1 && !isProcessing}
                onMoveUp={() => handleMoveUp(idx)}
                onMoveDown={() => handleMoveDown(idx)}
                onRemove={() => handleRemove(idx)}
              />
            ))}
          </div>

          {/* Progress bar during merge */}
          {isProcessing && (
            <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <ProgressBar
                progress={progress}
                statusText={statusText}
                onCancel={() => abortControllerRef.current?.abort()}
                cancelLabel={t.fileLimits.cancelOperation}
              />
            </div>
          )}

          {/* Merge or Download Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            {!mergedPdfBytes ? (
              <button
                type="button"
                onClick={handleMerge}
                disabled={files.length < 2 || isProcessing}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm shadow-md shadow-rose-600/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <span>{t.merge.mergeButton}</span>
                <ArrowRight className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleDownload}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-md shadow-emerald-600/20 transition-all"
              >
                <Download className="w-4 h-4" />
                <span>{t.common.downloadPdf}</span>
              </button>
            )}
          </div>
        </div>
      )}
      <ToolSeoSection pageKey="merge" toolName={t.nav.merge} />
    </div>
  );
};
