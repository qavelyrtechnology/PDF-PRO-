import React, { useState, useRef } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { DropZone } from '../components/DropZone';
import { FileCard } from '../components/FileCard';
import { ProgressBar } from '../components/ProgressBar';
import { PasswordModal } from '../components/PasswordModal';
import { FileGateAlerts } from '../components/FileGateAlerts';
import { PageSeo } from '../components/PageSeo';
import { ToolSeoSection } from '../components/ToolSeoSection';
import { usePdfFileGate } from '../hooks/usePdfFileGate';
import { downloadFile, isCancelledError } from '../utils/fileUtils';
import { convertPdfToDocx, PdfToWordResult } from '../services/pdfToWordService';
import type { OcrLanguage } from '../services/ocrService';
import {
  FileText,
  Download,
  CheckCircle2,
  AlertCircle,
  Info,
  ScanText,
  Loader2,
} from 'lucide-react';

const DOCX_MIME = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

export const PdfToWordPage: React.FC = () => {
  const { t } = useLanguage();
  const gate = usePdfFileGate();
  const abortControllerRef = useRef<AbortController | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  const [ocrLanguage, setOcrLanguage] = useState<OcrLanguage>('eng+ara');
  const [result, setResult] = useState<PdfToWordResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cancelledNotice, setCancelledNotice] = useState(false);

  const handleFileSelected = async (files: File[]) => {
    setError(null);
    setResult(null);
    setCancelledNotice(false);
    const prepared = await gate.prepareFiles(files);
    if (prepared.length > 0) {
      setFile(prepared[0]);
    }
  };

  const handleCancel = () => {
    abortControllerRef.current?.abort();
  };

  const handleConvert = async (ocrPages?: number[]) => {
    if (!file) return;
    setError(null);
    setCancelledNotice(false);
    setIsProcessing(true);
    setProgress(0);
    setStatusText(t.pdfToWord.convertingProgress);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      let ocrMap: Map<number, string> | undefined;
      if (ocrPages && ocrPages.length > 0) {
        const { ocrSpecificPdfPages } = await import('../services/ocrService');
        ocrMap = await ocrSpecificPdfPages(
          file,
          ocrPages,
          ocrLanguage,
          (info) => {
            setProgress(Math.round(info.progress * 0.75));
            setStatusText(info.status);
          },
          controller.signal,
          t.ocr.downloadingLangData
        );
      }

      const convResult = await convertPdfToDocx(file, {
        ocrTextByPage: ocrMap,
        signal: controller.signal,
        onProgress: (pct) => {
          setProgress(ocrMap ? 75 + Math.round(pct * 0.25) : pct);
          setStatusText(t.pdfToWord.convertingProgress);
        },
      });

      setResult(convResult);
      const outName = file.name.replace(/\.pdf$/i, '') + '.docx';
      downloadFile(convResult.bytes, outName, DOCX_MIME);
    } catch (err: any) {
      if (isCancelledError(err)) {
        setCancelledNotice(true);
      } else {
        console.error(err);
        setError(err?.message || t.common.error);
      }
    } finally {
      abortControllerRef.current = null;
      setIsProcessing(false);
    }
  };

  const handleDownloadAgain = () => {
    if (!result || !file) return;
    const outName = file.name.replace(/\.pdf$/i, '') + '.docx';
    downloadFile(result.bytes, outName, DOCX_MIME);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <PageSeo pageKey="pdfToWord" />
      <PasswordModal {...gate.passwordModalProps} />

      {/* Header */}
      <div className="space-y-2 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 mb-2">
          <FileText className="w-6 h-6" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          {t.pdfToWord.title}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
          {t.pdfToWord.subtitle}
        </p>
      </div>

      {/* Honest Text-Focused Notice */}
      <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 flex items-start gap-3">
        <Info className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs sm:text-sm text-amber-800 dark:text-amber-200 space-y-0.5">
          <div className="font-bold">{t.pdfToWord.honestNoticeTitle}</div>
          <p>{t.pdfToWord.honestNotice}</p>
        </div>
      </div>

      <FileGateAlerts warning={gate.sizeWarning} error={gate.blockError} />

      {!file ? (
        <DropZone
          onFilesSelected={handleFileSelected}
          promptText={t.pdfToWord.dropPrompt}
          allowedFormatsText="PDF"
        />
      ) : (
        <div className="space-y-6">
          <FileCard
            name={file.name}
            size={file.size}
            onRemove={() => {
              abortControllerRef.current?.abort();
              setFile(null);
              setResult(null);
              setError(null);
              setCancelledNotice(false);
              gate.clearNotices();
            }}
          />

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-5">
            {isProcessing ? (
              <ProgressBar
                progress={progress}
                statusText={statusText}
                onCancel={handleCancel}
                cancelLabel={t.fileLimits.cancelOperation}
              />
            ) : (
              <button
                type="button"
                onClick={() => handleConvert()}
                className="w-full py-3.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md shadow-rose-600/20 transition-colors"
              >
                <FileText className="w-4 h-4" />
                <span>{t.pdfToWord.convertBtn}</span>
              </button>
            )}

            {result && !isProcessing && (
              <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 text-sm text-emerald-800 dark:text-emerald-300">
                    <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-500" />
                    <span>{t.pdfToWord.success}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleDownloadAgain}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shrink-0"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{t.pdfToWord.downloadDocx}</span>
                  </button>
                </div>

                {/* Conversion Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700">
                    <div className="text-lg font-bold font-mono text-slate-900 dark:text-white">
                      {result.pageCount}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      {t.pdfToWord.statsPages}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700">
                    <div className="text-lg font-bold font-mono text-slate-900 dark:text-white">
                      {result.paragraphCount}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      {t.pdfToWord.statsParagraphs}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700">
                    <div className="text-lg font-bold font-mono text-slate-900 dark:text-white">
                      {result.tableCount}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      {t.pdfToWord.statsTables}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700">
                    <div className="text-lg font-bold font-mono text-slate-900 dark:text-white">
                      {result.ocrPagesUsed}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      {t.pdfToWord.statsOcrPages}
                    </div>
                  </div>
                </div>

                {/* Scanned PDF / No Selectable Text OCR Offer */}
                {result.pagesWithoutText.length > 0 && (
                  <div className="p-5 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/50 space-y-4">
                    <div className="flex items-start gap-2.5 text-blue-900 dark:text-blue-200">
                      <ScanText className="w-5 h-5 shrink-0 text-blue-600 dark:text-blue-400 mt-0.5" />
                      <div className="space-y-1">
                        <div className="text-sm font-bold">{t.pdfToWord.scannedDetectedTitle}</div>
                        <p className="text-xs text-blue-800 dark:text-blue-300 leading-relaxed">
                          {t.pdfToWord.scannedDetectedDesc.replace(
                            '{count}',
                            String(result.pagesWithoutText.length)
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      <select
                        value={ocrLanguage}
                        onChange={(e) => setOcrLanguage(e.target.value as OcrLanguage)}
                        aria-label={t.pdfToWord.ocrLangLabel}
                        className="px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-800 text-xs font-medium text-slate-800 dark:text-slate-200"
                      >
                        <option value="eng+ara">{t.ocr.langBoth}</option>
                        <option value="ara">{t.ocr.langArabic}</option>
                        <option value="eng">{t.ocr.langEnglish}</option>
                      </select>

                      <button
                        type="button"
                        onClick={() => handleConvert(result.pagesWithoutText)}
                        disabled={isProcessing}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors disabled:opacity-50"
                      >
                        {isProcessing ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <ScanText className="w-3.5 h-3.5" />
                        )}
                        <span>{t.pdfToWord.runOcrBtn}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {cancelledNotice && (
        <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300">
          {t.fileLimits.cancelledNotice}
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/60 flex items-center gap-2.5 text-sm text-rose-700 dark:text-rose-300">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-500" />
          <span>{error}</span>
        </div>
      )}

      <ToolSeoSection pageKey="pdfToWord" toolName={t.nav.pdfToWord} />
    </div>
  );
};
