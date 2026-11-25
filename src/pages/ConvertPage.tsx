import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
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
  renderAllPagesToImages,
  loadPdfJsDocument,
  downloadFile,
} from '../services/pdfService';
import { isCancelledError } from '../utils/fileUtils';
import { RefreshCw, Download, Archive, ShieldAlert } from 'lucide-react';

interface ExportedImageWithUrl {
  pageNumber: number;
  blob: Blob;
  filename: string;
  previewUrl: string;
}

export const ConvertPage: React.FC = () => {
  const { t } = useLanguage();
  const gate = usePdfFileGate();
  const [file, setFile] = useState<File | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [format, setFormat] = useState<'image/png' | 'image/jpeg'>('image/png');
  const [scale, setScale] = useState(1.5);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  const [exportedImages, setExportedImages] = useState<ExportedImageWithUrl[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const previewUrlsRef = useRef<string[]>([]);
  const abortControllerRef = useRef<AbortController | null>(null);

  const clearExportedImages = () => {
    previewUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    previewUrlsRef.current = [];
    setExportedImages([]);
  };

  useEffect(() => {
    return () => {
      previewUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      previewUrlsRef.current = [];
    };
  }, []);

  const handleFileSelected = async (files: File[]) => {
    if (files.length === 0) return;
    const ready = await gate.prepareFiles([files[0]]);
    if (ready.length === 0) return;
    const selected = ready[0];
    setFile(selected);
    clearExportedImages();
    setErrorMessage(null);
    setSuccessMessage(null);

    let doc: Awaited<ReturnType<typeof loadPdfJsDocument>> | null = null;
    try {
      doc = await loadPdfJsDocument(selected);
      setTotalPages(doc.numPages);
    } catch (err: any) {
      console.error('Convert load error:', err);
      setErrorMessage(t.reader.pageRenderError);
      setFile(null);
    } finally {
      await doc?.loadingTask?.destroy().catch(() => {});
    }
  };

  const handleConvert = async () => {
    if (!file) return;

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsProcessing(true);
    setProgress(5);
    setStatusText(t.convert.convertingProgress);
    setErrorMessage(null);
    setSuccessMessage(null);
    clearExportedImages();

    try {
      const results = await renderAllPagesToImages(
        file,
        format,
        scale,
        (pct) => {
          setProgress(pct);
        },
        controller.signal
      );
      const withUrls = results.map((item) => {
        const previewUrl = URL.createObjectURL(item.blob);
        previewUrlsRef.current.push(previewUrl);
        return { ...item, previewUrl };
      });
      setExportedImages(withUrls);
      setSuccessMessage(`Successfully rendered ${results.length} page(s) to images!`);
    } catch (err: any) {
      if (isCancelledError(err)) {
        setErrorMessage(t.fileLimits.cancelledNotice);
      } else {
        console.error('Conversion error:', err);
        setErrorMessage(err?.message || t.common.error);
      }
    } finally {
      abortControllerRef.current = null;
      setIsProcessing(false);
    }
  };

  const handleDownloadSingleImage = (item: { blob: Blob; filename: string }) => {
    downloadFile(item.blob, item.filename, format);
  };

  const handleDownloadZip = async () => {
    if (exportedImages.length === 0) return;

    setIsProcessing(true);
    setStatusText('Compressing images into ZIP file...');

    try {
      const { default: JSZip } = await import('jszip');
      const zip = new JSZip();
      exportedImages.forEach((img) => {
        zip.file(img.filename, img.blob);
      });

      const zipBlob = await zip.generateAsync({ type: 'blob' }, (meta) => {
        setProgress(Math.round(meta.percent));
      });

      const baseName = file?.name.replace(/\.pdf$/i, '') || 'document';
      downloadFile(zipBlob, `${baseName}_images.zip`, 'application/zip');
    } catch (err: any) {
      console.error('ZIP error:', err);
      setErrorMessage('Failed to build ZIP archive.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <PageSeo pageKey="convert" />
      <PasswordModal {...gate.passwordModalProps} />
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <RefreshCw className="w-7 h-7 text-rose-600" />
          {t.convert.title}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          {t.convert.subtitle}
        </p>
      </div>

      {/* Conversion Type Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-700">
        <button
          type="button"
          className="px-5 py-2.5 text-sm font-semibold border-b-2 border-rose-600 text-rose-600 dark:text-rose-400"
        >
          {t.convert.pdfToImagesTab}
        </button>
        <Link
          to="/images-to-pdf"
          className="px-5 py-2.5 text-sm font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
        >
          {t.convert.imagesToPdfTab} &rarr;
        </Link>
      </div>

      {/* Honest Technical Limits Box */}
      <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 flex items-start gap-3 text-xs text-slate-600 dark:text-slate-300">
        <ShieldAlert className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-semibold text-slate-900 dark:text-white mb-1">
            {t.convert.honestDisclaimerTitle}
          </h4>
          <p className="leading-relaxed">{t.convert.honestDisclaimerText}</p>
        </div>
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

      {/* Drop Zone */}
      {!file && (
        <DropZone
          onFilesSelected={handleFileSelected}
          promptText={t.convert.dropPrompt}
          allowedFormatsText="PDF"
          multiple={false}
        />
      )}

      {/* Loaded Document & Conversion Controls */}
      {file && (
        <div className="space-y-6">
          <FileCard
            name={file.name}
            size={file.size}
            pageCount={totalPages}
            onRemove={() => {
              setFile(null);
              clearExportedImages();
              gate.clearNotices();
            }}
          />

          {/* Export Options */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {t.convert.exportFormat}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label
                className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                  format === 'image/png'
                    ? 'border-rose-500 bg-rose-50/40 dark:bg-rose-950/30'
                    : 'border-slate-200 dark:border-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name="exportFormat"
                  value="image/png"
                  checked={format === 'image/png'}
                  onChange={() => setFormat('image/png')}
                  className="mt-1 text-rose-600 focus:ring-rose-500"
                />
                <div>
                  <span className="font-semibold text-sm text-slate-900 dark:text-white block">
                    {t.convert.exportFormatPng}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Maximum sharpness and crisp vector-to-raster rendering.
                  </span>
                </div>
              </label>

              <label
                className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                  format === 'image/jpeg'
                    ? 'border-rose-500 bg-rose-50/40 dark:bg-rose-950/30'
                    : 'border-slate-200 dark:border-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name="exportFormat"
                  value="image/jpeg"
                  checked={format === 'image/jpeg'}
                  onChange={() => setFormat('image/jpeg')}
                  className="mt-1 text-rose-600 focus:ring-rose-500"
                />
                <div>
                  <span className="font-semibold text-sm text-slate-900 dark:text-white block">
                    {t.convert.exportFormatJpg}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Smaller file size, ideal for photo-heavy documents.
                  </span>
                </div>
              </label>
            </div>

            {/* Quality scale */}
            <div className="space-y-1 pt-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {t.convert.exportQuality}
              </label>
              <select
                value={scale}
                onChange={(e) => setScale(Number(e.target.value))}
                className="w-full sm:w-60 px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              >
                <option value={1.0}>Standard (100 DPI)</option>
                <option value={1.5}>High Quality (150 DPI)</option>
                <option value={2.0}>Ultra Crisp (200 DPI)</option>
              </select>
            </div>

            {/* Convert Button */}
            {!exportedImages.length && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleConvert}
                  disabled={isProcessing}
                  className="px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm shadow-md shadow-rose-600/20 disabled:opacity-50 transition-all"
                >
                  {t.convert.convertBtn}
                </button>
              </div>
            )}
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

          {/* Exported Image Results */}
          {exportedImages.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Exported Images ({exportedImages.length})
                </h3>
                {exportedImages.length > 1 && (
                  <button
                    type="button"
                    onClick={handleDownloadZip}
                    disabled={isProcessing}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm transition-all"
                  >
                    <Archive className="w-4 h-4" />
                    <span>{t.common.downloadZip}</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {exportedImages.map((img) => (
                    <div
                      key={img.pageNumber}
                      className="group p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2"
                    >
                      <div className="aspect-[3/4] bg-slate-100 dark:bg-slate-900 rounded-lg overflow-hidden flex items-center justify-center border border-slate-200 dark:border-slate-800">
                        <img
                          src={img.previewUrl}
                          alt={img.filename}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-slate-700 dark:text-slate-300">
                          Page {img.pageNumber}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleDownloadSingleImage(img)}
                          className="p-1 rounded text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50"
                          title="Download Image"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      <ToolSeoSection pageKey="convert" toolName={t.nav.convert} />
    </div>
  );
};
