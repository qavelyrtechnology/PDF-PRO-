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
  compressPdfInBrowser,
  formatBytes,
  downloadFile,
  loadPdfJsDocument,
  CompressionMode,
  CompressionResult,
} from '../services/pdfService';
import { isCancelledError } from '../utils/fileUtils';
import {
  Minimize2,
  Download,
  Info,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Image as ImageIcon,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';

export const CompressPage: React.FC = () => {
  const { t } = useLanguage();
  const gate = usePdfFileGate();
  const [file, setFile] = useState<File | null>(null);
  const [totalPages, setTotalPages] = useState<number>(0);

  // Compression Mode: 'structure' (lossless content-preserving) vs 'raster' (convert pages to images)
  const [mode, setMode] = useState<CompressionMode>('structure');
  const [rasterLevel, setRasterLevel] = useState<'low' | 'medium' | 'high'>('medium');

  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<CompressionResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleFileSelected = async (files: File[]) => {
    if (files.length === 0) return;
    const ready = await gate.prepareFiles([files[0]]);
    if (ready.length === 0) return;
    const selected = ready[0];
    setFile(selected);
    setResult(null);
    setErrorMessage(null);

    let doc: Awaited<ReturnType<typeof loadPdfJsDocument>> | null = null;
    try {
      doc = await loadPdfJsDocument(selected);
      setTotalPages(doc.numPages);
    } catch (err: any) {
      console.error('Compress page load error:', err);
      setErrorMessage(t.reader.pageRenderError);
      setFile(null);
    } finally {
      await doc?.loadingTask?.destroy().catch(() => {});
    }
  };

  const handleCompress = async () => {
    if (!file) return;

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsProcessing(true);
    setProgress(10);
    setErrorMessage(null);
    setResult(null);

    try {
      const compressionResult = await compressPdfInBrowser(
        file,
        mode,
        rasterLevel,
        (pct) => {
          setProgress(pct);
        },
        controller.signal
      );
      setResult(compressionResult);
    } catch (err: any) {
      if (isCancelledError(err)) {
        setErrorMessage(t.fileLimits.cancelledNotice);
      } else {
        console.error('Compression execution error:', err);
        setErrorMessage(err?.message || t.common.error);
      }
    } finally {
      abortControllerRef.current = null;
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!result || !file) return;
    const baseName = file.name.replace(/\.pdf$/i, '');
    const suffix = result.mode === 'structure' ? 'optimized_structure' : `raster_${rasterLevel}`;
    downloadFile(result.bytes, `${baseName}_${suffix}.pdf`);
  };

  const sizeDiffFormatted = result ? formatBytes(Math.abs(result.sizeChangeBytes)) : '0 B';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <PageSeo pageKey="compress" />
      <PasswordModal {...gate.passwordModalProps} />

      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Minimize2 className="w-7 h-7 text-rose-600" />
          {t.compress.title}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          {t.compress.subtitle}
        </p>
      </div>

      <FileGateAlerts warning={gate.sizeWarning} error={gate.blockError} />

      {/* Honest In-Browser Disclaimer Box */}
      <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-start gap-3 text-xs text-amber-900 dark:text-amber-200">
        <Info className="w-5 h-5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
        <div>
          <h4 className="font-semibold mb-1">{t.compress.disclaimerTitle}</h4>
          <p className="leading-relaxed opacity-90">{t.compress.disclaimerDesc}</p>
        </div>
      </div>

      {errorMessage && (
        <StatusBanner
          type="error"
          message={errorMessage}
          onDismiss={() => setErrorMessage(null)}
        />
      )}

      {/* File Upload Zone */}
      {!file && (
        <DropZone
          onFilesSelected={handleFileSelected}
          promptText={t.compress.dropPrompt}
          allowedFormatsText="PDF"
          multiple={false}
        />
      )}

      {/* Document Loaded & Compression Configuration */}
      {file && (
        <div className="space-y-6">
          <FileCard
            name={file.name}
            size={file.size}
            pageCount={totalPages}
            onRemove={() => {
              setFile(null);
              setResult(null);
              gate.clearNotices();
            }}
          />

          {/* Mode Selector */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {t.compress.modeTitle}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {/* Option 1: Structure Optimization */}
              <label
                className={`flex flex-col p-4 rounded-xl border cursor-pointer transition-all ${
                  mode === 'structure'
                    ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/30 ring-2 ring-rose-500/20'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-rose-600" />
                    <span className="font-semibold text-sm text-slate-900 dark:text-white">
                      {t.compress.modeStructure}
                    </span>
                  </div>
                  <input
                    type="radio"
                    name="compressionMode"
                    value="structure"
                    checked={mode === 'structure'}
                    onChange={() => {
                      setMode('structure');
                      setResult(null);
                    }}
                    className="text-rose-600 focus:ring-rose-500"
                  />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {t.compress.modeStructureDesc}
                </p>
                <div className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800/40 w-fit">
                  ✓ Preserves Text & Vector Quality
                </div>
              </label>

              {/* Option 2: Image Rasterization */}
              <label
                className={`flex flex-col p-4 rounded-xl border cursor-pointer transition-all ${
                  mode === 'raster'
                    ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/30 ring-2 ring-rose-500/20'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-amber-600" />
                    <span className="font-semibold text-sm text-slate-900 dark:text-white">
                      {t.compress.modeRaster}
                    </span>
                  </div>
                  <input
                    type="radio"
                    name="compressionMode"
                    value="raster"
                    checked={mode === 'raster'}
                    onChange={() => {
                      setMode('raster');
                      setResult(null);
                    }}
                    className="text-rose-600 focus:ring-rose-500"
                  />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {t.compress.modeRasterDesc}
                </p>
                <div className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800/40 w-fit">
                  ⚠ Rasterizes Text to JPEG Images
                </div>
              </label>
            </div>

            {/* Warning when raster mode is selected */}
            {mode === 'raster' && (
              <div className="p-3.5 rounded-xl bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-200">
                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold mb-0.5">{t.compress.rasterWarningTitle}</h4>
                  <p className="leading-relaxed opacity-90">{t.compress.rasterWarningDesc}</p>
                </div>
              </div>
            )}

            {/* Quality Level Selector (Only for Raster mode) */}
            {mode === 'raster' && (
              <div className="pt-2 space-y-2.5">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {t.compress.compressionLevel}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {[
                    {
                      id: 'low',
                      label: t.compress.levelLow,
                      desc: t.compress.levelLowDesc,
                    },
                    {
                      id: 'medium',
                      label: t.compress.levelMedium,
                      desc: t.compress.levelMediumDesc,
                    },
                    {
                      id: 'high',
                      label: t.compress.levelHigh,
                      desc: t.compress.levelHighDesc,
                    },
                  ].map((opt) => (
                    <label
                      key={opt.id}
                      className={`flex flex-col p-3 rounded-xl border cursor-pointer transition-all ${
                        rasterLevel === opt.id
                          ? 'border-rose-500 bg-rose-50/40 dark:bg-rose-950/30'
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-xs text-slate-900 dark:text-white">
                          {opt.label}
                        </span>
                        <input
                          type="radio"
                          name="rasterQuality"
                          value={opt.id}
                          checked={rasterLevel === opt.id}
                          onChange={() => setRasterLevel(opt.id as any)}
                          className="text-rose-600 focus:ring-rose-500 text-xs"
                        />
                      </div>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        {opt.desc}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Start Button */}
            {!result && (
              <div className="pt-3">
                <button
                  type="button"
                  onClick={handleCompress}
                  disabled={isProcessing}
                  className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-md shadow-rose-600/20 disabled:opacity-50 transition-all flex items-center gap-2"
                >
                  <Minimize2 className="w-4 h-4" />
                  <span>{t.compress.compressBtn}</span>
                </button>
              </div>
            )}
          </div>

          {/* Progress */}
          {isProcessing && (
            <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <ProgressBar
                progress={progress}
                statusText={t.compress.compressingProgress}
                onCancel={() => abortControllerRef.current?.abort()}
                cancelLabel={t.fileLimits.cancelOperation}
              />
            </div>
          )}

          {/* Accurate Before & After Results Box */}
          {result && (
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>{t.compress.sizeChangeTitle}</span>
                </div>
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Mode: {result.mode === 'structure' ? 'Structure Preserving' : `Raster (${rasterLevel})`}
                </span>
              </div>

              {/* Exact Metrics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/60">
                  <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">
                    {t.compress.originalSize}
                  </span>
                  <span className="font-mono text-base font-bold text-slate-800 dark:text-slate-200">
                    {formatBytes(result.originalSize)}
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/60">
                  <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">
                    {t.compress.compressedSize}
                  </span>
                  <span
                    className={`font-mono text-base font-bold ${
                      result.increased
                        ? 'text-amber-600 dark:text-amber-400'
                        : 'text-emerald-600 dark:text-emerald-400'
                    }`}
                  >
                    {formatBytes(result.compressedSize)}
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/60">
                  <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">
                    {result.increased ? 'Size Increase' : t.compress.savedPercentage}
                  </span>
                  <span
                    className={`font-mono text-base font-bold ${
                      result.increased
                        ? 'text-amber-600 dark:text-amber-400'
                        : 'text-emerald-600 dark:text-emerald-400'
                    }`}
                  >
                    {result.increased
                      ? `+${result.sizeChangePercent}% (+${sizeDiffFormatted})`
                      : result.sizeChangePercent > 0
                      ? `-${result.sizeChangePercent}% (-${sizeDiffFormatted})`
                      : '0% (Exact Match)'}
                  </span>
                </div>
              </div>

              {/* Clear notice when file size increases */}
              {result.increased ? (
                <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-200">
                  <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    {t.compress.sizeIncreasedNotice
                      .replace('{sizeDiff}', sizeDiffFormatted)
                      .replace('{percentDiff}', result.sizeChangePercent.toString())}
                  </p>
                </div>
              ) : result.sizeChangePercent > 0 ? (
                <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-start gap-2.5 text-xs text-emerald-900 dark:text-emerald-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    {t.compress.sizeDecreasedNotice
                      .replace('{sizeDiff}', sizeDiffFormatted)
                      .replace('{percentDiff}', result.sizeChangePercent.toString())}
                  </p>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 p-3 rounded-lg bg-slate-100 dark:bg-slate-900">
                  <Info className="w-4 h-4 text-slate-500 shrink-0" />
                  <span>{t.compress.noReductionNotice}</span>
                </div>
              )}

              {/* Download Action */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleDownload}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-md shadow-emerald-600/20 transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>{t.compress.downloadResult}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setResult(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-semibold text-xs transition-all flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Change Settings</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      <ToolSeoSection pageKey="compress" toolName={t.nav.compress} />
    </div>
  );
};
