import React, { useState, useRef } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { DropZone } from '../components/DropZone';
import { FileCard } from '../components/FileCard';
import { ProgressBar } from '../components/ProgressBar';
import { StatusBanner } from '../components/StatusBanner';
import { PageSeo } from '../components/PageSeo';
import { ToolSeoSection } from '../components/ToolSeoSection';
import { FileGateAlerts } from '../components/FileGateAlerts';
import { usePdfFileGate } from '../hooks/usePdfFileGate';
import { imagesToPdf, downloadFile } from '../services/pdfService';
import { isCancelledError } from '../utils/fileUtils';
import { Image as ImageIcon, Download, Settings, Trash2 } from 'lucide-react';

interface ImageItem {
  file: File;
  dataUrl: string;
}

export const ImagesToPdfPage: React.FC = () => {
  const { t } = useLanguage();
  const gate = usePdfFileGate();
  const [images, setImages] = useState<ImageItem[]>([]);
  const [pageSize, setPageSize] = useState<'a4' | 'letter' | 'fit'>('a4');
  const [orientation, setOrientation] = useState<'auto' | 'portrait' | 'landscape'>('auto');
  const [margin, setMargin] = useState<number>(15);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generatedPdfBytes, setGeneratedPdfBytes] = useState<Uint8Array | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleFilesSelected = (files: File[]) => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setGeneratedPdfBytes(null);

    const allowed = gate.checkFileSizes(files);
    const validFiles = allowed.filter(
      (f) =>
        f.type.startsWith('image/') ||
        /\.(jpe?g|png|webp|bmp)$/i.test(f.name)
    );

    if (validFiles.length === 0) {
      if (allowed.length > 0) {
        setErrorMessage('Please select valid image files (JPG, PNG, WebP).');
      }
      return;
    }

    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        setImages((prev) => [...prev, { file, dataUrl }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    setImages((prev) => {
      const next = [...prev];
      const temp = next[index - 1];
      next[index - 1] = next[index];
      next[index] = temp;
      return next;
    });
  };

  const handleMoveDown = (index: number) => {
    if (index >= images.length - 1) return;
    setImages((prev) => {
      const next = [...prev];
      const temp = next[index + 1];
      next[index + 1] = next[index];
      next[index] = temp;
      return next;
    });
  };

  const handleRemove = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setGeneratedPdfBytes(null);
  };

  const handleClearAll = () => {
    setImages([]);
    setGeneratedPdfBytes(null);
    setErrorMessage(null);
    setSuccessMessage(null);
    gate.clearNotices();
  };

  const handleGeneratePdf = async () => {
    if (images.length === 0) return;

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsProcessing(true);
    setProgress(10);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const pdfBytes = await imagesToPdf(
        images,
        {
          pageSize,
          orientation,
          margin,
        },
        (pct) => setProgress(pct),
        controller.signal
      );

      setGeneratedPdfBytes(pdfBytes);
      setSuccessMessage('PDF created successfully from selected images!');
    } catch (err: any) {
      if (isCancelledError(err)) {
        setErrorMessage(t.fileLimits.cancelledNotice);
      } else {
        console.error('Image to PDF error:', err);
        setErrorMessage(err?.message || t.common.error);
      }
    } finally {
      abortControllerRef.current = null;
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!generatedPdfBytes) return;
    downloadFile(generatedPdfBytes, 'images_converted.pdf');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <PageSeo pageKey="imagesToPdf" />

      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <ImageIcon className="w-7 h-7 text-rose-600" />
          {t.imagesToPdf.title}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          {t.imagesToPdf.subtitle}
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
        promptText={t.imagesToPdf.dropPrompt}
        accept="image/png,image/jpeg,image/webp"
        allowedFormatsText="PNG, JPG, WebP"
        multiple={true}
        disabled={isProcessing}
      />

      {/* Settings & Image List */}
      {images.length > 0 && (
        <div className="space-y-6">
          {/* Options Card */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-5">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Settings className="w-4 h-4" />
              <span>Layout & Page Sizing</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Page Size */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {t.imagesToPdf.pageSize}
                </label>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-1 focus:ring-rose-500"
                >
                  <option value="a4">{t.imagesToPdf.sizeA4}</option>
                  <option value="letter">{t.imagesToPdf.sizeLetter}</option>
                  <option value="fit">{t.imagesToPdf.sizeFitImage}</option>
                </select>
              </div>

              {/* Orientation */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {t.imagesToPdf.orientation}
                </label>
                <select
                  value={orientation}
                  disabled={pageSize === 'fit'}
                  onChange={(e) => setOrientation(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white disabled:opacity-50 focus:ring-1 focus:ring-rose-500"
                >
                  <option value="auto">{t.imagesToPdf.orientationAuto}</option>
                  <option value="portrait">{t.imagesToPdf.orientationPortrait}</option>
                  <option value="landscape">{t.imagesToPdf.orientationLandscape}</option>
                </select>
              </div>

              {/* Margin */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {t.imagesToPdf.margin}
                </label>
                <select
                  value={margin}
                  onChange={(e) => setMargin(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-1 focus:ring-rose-500"
                >
                  <option value={0}>{t.imagesToPdf.marginNone}</option>
                  <option value={15}>{t.imagesToPdf.marginSmall}</option>
                  <option value={30}>{t.imagesToPdf.marginNormal}</option>
                </select>
              </div>
            </div>
          </div>

          {/* Image List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm text-slate-900 dark:text-white">
                Selected Images ({images.length})
              </h3>
              <button
                type="button"
                onClick={handleClearAll}
                disabled={isProcessing}
                className="text-xs text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{t.common.clear}</span>
              </button>
            </div>

            <div className="space-y-2">
              {images.map((item, idx) => (
                <FileCard
                  key={`${item.file.name}-${idx}`}
                  name={item.file.name}
                  size={item.file.size}
                  type={item.file.type}
                  previewUrl={item.dataUrl}
                  index={idx}
                  canMoveUp={idx > 0 && !isProcessing}
                  canMoveDown={idx < images.length - 1 && !isProcessing}
                  onMoveUp={() => handleMoveUp(idx)}
                  onMoveDown={() => handleMoveDown(idx)}
                  onRemove={() => handleRemove(idx)}
                />
              ))}
            </div>
          </div>

          {/* Progress */}
          {isProcessing && (
            <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <ProgressBar
                progress={progress}
                statusText={t.imagesToPdf.generatingProgress}
                onCancel={() => abortControllerRef.current?.abort()}
                cancelLabel={t.fileLimits.cancelOperation}
              />
            </div>
          )}

          {/* Action buttons */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            {!generatedPdfBytes ? (
              <button
                type="button"
                onClick={handleGeneratePdf}
                disabled={isProcessing}
                className="px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm shadow-md shadow-rose-600/20 disabled:opacity-50 transition-all"
              >
                {t.imagesToPdf.generatePdfBtn}
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
      <ToolSeoSection pageKey="imagesToPdf" toolName={t.nav.imagesToPdf} />
    </div>
  );
};
