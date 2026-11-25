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
import {
  loadPdfJsDocument,
  parsePageRanges,
  splitPdfByRanges,
  splitPdfEveryPage,
  downloadFile,
} from '../services/pdfService';
import { isCancelledError } from '../utils/fileUtils';
import { Scissors, Download, Archive, HelpCircle } from 'lucide-react';

export const SplitPage: React.FC = () => {
  const { t } = useLanguage();
  const gate = usePdfFileGate();
  const [file, setFile] = useState<File | null>(null);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [splitMode, setSplitMode] = useState<'ranges' | 'all'>('ranges');
  const [rangeInput, setRangeInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  const [results, setResults] = useState<{ filename: string; bytes: Uint8Array }[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleFileSelected = async (files: File[]) => {
    if (files.length === 0) return;
    const ready = await gate.prepareFiles([files[0]]);
    if (ready.length === 0) return;
    const selected = ready[0];
    setFile(selected);
    setResults([]);
    setErrorMessage(null);
    setSuccessMessage(null);

    let doc: Awaited<ReturnType<typeof loadPdfJsDocument>> | null = null;
    try {
      doc = await loadPdfJsDocument(selected);
      setTotalPages(doc.numPages);
      // Default initial range recommendation
      setRangeInput(doc.numPages > 1 ? `1-${Math.min(2, doc.numPages)}` : '1');
    } catch (err: any) {
      console.error('Split load error:', err);
      setErrorMessage(t.reader.pageRenderError);
      setFile(null);
    } finally {
      await doc?.loadingTask?.destroy().catch(() => {});
    }
  };

  const handleSplit = async () => {
    if (!file || totalPages === 0) return;

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setErrorMessage(null);
    setSuccessMessage(null);
    setIsProcessing(true);
    setProgress(10);
    setStatusText(t.split.splittingProgress);

    try {
      let outputFiles: { filename: string; bytes: Uint8Array }[] = [];

      if (splitMode === 'all') {
        outputFiles = await splitPdfEveryPage(
          file,
          (pct) => setProgress(pct),
          undefined,
          controller.signal
        );
      } else {
        const parsedRanges = parsePageRanges(rangeInput, totalPages);
        if (!parsedRanges) {
          setErrorMessage(t.split.invalidRangeError);
          setIsProcessing(false);
          abortControllerRef.current = null;
          return;
        }
        outputFiles = await splitPdfByRanges(
          file,
          parsedRanges,
          (pct) => setProgress(pct),
          undefined,
          controller.signal
        );
      }

      setResults(outputFiles);
      setSuccessMessage(
        t.split.extractedCount.replace('{count}', outputFiles.length.toString())
      );
    } catch (err: any) {
      if (isCancelledError(err)) {
        setErrorMessage(t.fileLimits.cancelledNotice);
      } else {
        console.error('Split error:', err);
        setErrorMessage(err?.message || t.common.error);
      }
    } finally {
      abortControllerRef.current = null;
      setIsProcessing(false);
    }
  };

  const handleDownloadSingle = (item: { filename: string; bytes: Uint8Array }) => {
    downloadFile(item.bytes, item.filename);
  };

  const handleDownloadAllZip = async () => {
    if (results.length === 0) return;

    setIsProcessing(true);
    setStatusText('Archiving split documents into ZIP file...');
    try {
      const { default: JSZip } = await import('jszip');
      const zip = new JSZip();
      results.forEach((item) => {
        zip.file(item.filename, item.bytes);
      });

      const zipBlob = await zip.generateAsync({ type: 'blob' }, (metadata) => {
        setProgress(Math.round(metadata.percent));
      });

      const baseName = file?.name.replace(/\.pdf$/i, '') || 'document';
      downloadFile(zipBlob, `${baseName}_split_pages.zip`, 'application/zip');
    } catch (err: any) {
      console.error('ZIP error:', err);
      setErrorMessage('Failed to create ZIP archive.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <PageSeo pageKey="split" />
      <PasswordModal {...gate.passwordModalProps} />

      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Scissors className="w-7 h-7 text-rose-600" />
          {t.split.title}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          {t.split.subtitle}
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

      {/* Upload Drop Zone if no file */}
      {!file && (
        <DropZone
          onFilesSelected={handleFileSelected}
          promptText={t.split.dropPrompt}
          allowedFormatsText="PDF"
          multiple={false}
        />
      )}

      {/* Selected File & Splitting Options */}
      {file && (
        <div className="space-y-6">
          <FileCard
            name={file.name}
            size={file.size}
            pageCount={totalPages}
            onRemove={() => {
              setFile(null);
              setResults([]);
              gate.clearNotices();
            }}
          />

          {/* Mode Selector */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-5">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {t.split.modeTitle}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label
                className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                  splitMode === 'ranges'
                    ? 'border-rose-500 bg-rose-50/40 dark:bg-rose-950/30'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="splitMode"
                  value="ranges"
                  checked={splitMode === 'ranges'}
                  onChange={() => setSplitMode('ranges')}
                  className="mt-1 text-rose-600 focus:ring-rose-500"
                />
                <div>
                  <span className="font-semibold text-sm text-slate-900 dark:text-white block">
                    {t.split.modeCustomRanges}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Extract specific ranges or individual page selections.
                  </span>
                </div>
              </label>

              <label
                className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                  splitMode === 'all'
                    ? 'border-rose-500 bg-rose-50/40 dark:bg-rose-950/30'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="splitMode"
                  value="all"
                  checked={splitMode === 'all'}
                  onChange={() => setSplitMode('all')}
                  className="mt-1 text-rose-600 focus:ring-rose-500"
                />
                <div>
                  <span className="font-semibold text-sm text-slate-900 dark:text-white block">
                    {t.split.modeEveryPage}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Create {totalPages} separate 1-page PDF files.
                  </span>
                </div>
              </label>
            </div>

            {/* Range Input if in custom ranges mode */}
            {splitMode === 'ranges' && (
              <div className="space-y-2 pt-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {t.split.rangeInputLabel}
                </label>
                <input
                  type="text"
                  value={rangeInput}
                  onChange={(e) => setRangeInput(e.target.value)}
                  placeholder={t.split.rangeInputPlaceholder}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5" />
                  {t.split.rangeInputHelp}
                </p>
              </div>
            )}

            {/* Action button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleSplit}
                disabled={isProcessing}
                className="px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm shadow-md shadow-rose-600/20 disabled:opacity-50 transition-all"
              >
                {t.split.splitButton}
              </button>
            </div>
          </div>

          {/* Progress Indicator */}
          {isProcessing && (
            <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <ProgressBar
                progress={progress}
                statusText={statusText}
                onCancel={
                  abortControllerRef.current
                    ? () => abortControllerRef.current?.abort()
                    : undefined
                }
                cancelLabel={t.fileLimits.cancelOperation}
              />
            </div>
          )}

          {/* Output Results */}
          {results.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Generated Documents ({results.length})
                </h3>
                {results.length > 1 && (
                  <button
                    type="button"
                    onClick={handleDownloadAllZip}
                    disabled={isProcessing}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm transition-all"
                  >
                    <Archive className="w-4 h-4" />
                    <span>{t.common.downloadZip}</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {results.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  >
                    <span className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate max-w-[200px]">
                      {item.filename}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDownloadSingle(item)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-rose-50 dark:hover:bg-rose-950 hover:text-rose-600 text-xs font-semibold transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>PDF</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      <ToolSeoSection pageKey="split" toolName={t.nav.split} />
    </div>
  );
};
