import React, { useState, useEffect, useRef } from 'react';
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
import { extractEmbeddedImages, downloadFile, ExtractedImageItem } from '../services/pdfService';
import { isCancelledError } from '../utils/fileUtils';
import { Image as ImageIcon, Download, Archive } from 'lucide-react';

type ExtractedImageWithUrl = ExtractedImageItem & { url: string };

export const ExtractImagesPage: React.FC = () => {
  const { t } = useLanguage();
  const gate = usePdfFileGate();
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [images, setImages] = useState<ExtractedImageWithUrl[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const urlsRef = useRef<string[]>([]);
  const abortControllerRef = useRef<AbortController | null>(null);

  const clearImages = () => {
    urlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    urlsRef.current = [];
    setImages([]);
  };

  useEffect(() => {
    return () => {
      urlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      urlsRef.current = [];
    };
  }, []);

  const handleFileSelected = async (files: File[]) => {
    if (files.length === 0) return;
    const ready = await gate.prepareFiles([files[0]]);
    if (ready.length === 0) return;
    setFile(ready[0]);
    clearImages();
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const handleExtract = async () => {
    if (!file) return;

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsProcessing(true);
    setProgress(5);
    setErrorMessage(null);
    setSuccessMessage(null);
    clearImages();

    try {
      const extracted = await extractEmbeddedImages(
        file,
        (pct) => setProgress(pct),
        undefined,
        controller.signal
      );
      if (extracted.length === 0) {
        setErrorMessage(t.extractImages.noImagesFound);
      } else {
        const withUrls = extracted.map((item) => {
          const url = URL.createObjectURL(item.blob);
          urlsRef.current.push(url);
          return {
            ...item,
            url,
          };
        });
        setImages(withUrls);
        setSuccessMessage(
          t.extractImages.foundCount.replace('{count}', extracted.length.toString())
        );
      }
    } catch (err: any) {
      if (isCancelledError(err)) {
        setErrorMessage(t.fileLimits.cancelledNotice);
      } else {
        console.error('Extract error:', err);
        setErrorMessage(err?.message || t.common.error);
      }
    } finally {
      abortControllerRef.current = null;
      setIsProcessing(false);
    }
  };

  const handleDownloadZip = async () => {
    if (images.length === 0) return;
    setIsProcessing(true);
    try {
      const { default: JSZip } = await import('jszip');
      const zip = new JSZip();
      images.forEach((img) => {
        zip.file(img.filename, img.blob);
      });
      const zipBlob = await zip.generateAsync({ type: 'blob' }, (meta) => {
        setProgress(Math.round(meta.percent));
      });
      const baseName = file?.name.replace(/\.pdf$/i, '') || 'document';
      downloadFile(zipBlob, `${baseName}_extracted_images.zip`, 'application/zip');
    } catch (err: any) {
      console.error('Zip build error:', err);
      setErrorMessage('Failed to create ZIP file.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <PageSeo pageKey="extractImages" />
      <PasswordModal {...gate.passwordModalProps} />
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <ImageIcon className="w-7 h-7 text-rose-600" />
          {t.extractImages.title}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          {t.extractImages.subtitle}
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

      {!file && (
        <DropZone
          onFilesSelected={handleFileSelected}
          promptText={t.extractImages.dropPrompt}
          allowedFormatsText="PDF"
          multiple={false}
        />
      )}

      {file && (
        <div className="space-y-6">
          <FileCard
            name={file.name}
            size={file.size}
            onRemove={() => {
              setFile(null);
              clearImages();
              gate.clearNotices();
            }}
          />

          {!images.length && (
            <div className="pt-2">
              <button
                type="button"
                onClick={handleExtract}
                disabled={isProcessing}
                className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-md shadow-rose-600/20 disabled:opacity-50 transition-all"
              >
                {t.extractImages.extractBtn}
              </button>
            </div>
          )}

          {isProcessing && (
            <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <ProgressBar
                progress={progress}
                statusText={t.extractImages.progress}
                onCancel={
                  abortControllerRef.current
                    ? () => abortControllerRef.current?.abort()
                    : undefined
                }
                cancelLabel={t.fileLimits.cancelOperation}
              />
            </div>
          )}

          {images.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  {t.extractImages.foundCount.replace('{count}', images.length.toString())}
                </h3>
                <button
                  type="button"
                  onClick={handleDownloadZip}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs"
                >
                  <Archive className="w-4 h-4" />
                  <span>{t.extractImages.downloadAllZip}</span>
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {images.map((img, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2"
                  >
                    <div className="aspect-square bg-slate-100 dark:bg-slate-900 rounded-lg overflow-hidden flex items-center justify-center">
                      <img src={img.url} alt={img.filename} className="w-full h-full object-contain" />
                    </div>
                    <div className="flex items-center justify-between text-xs gap-1">
                      <div className="min-w-0">
                        <span className="block truncate max-w-[120px] text-slate-600 dark:text-slate-300">
                          {img.filename}
                        </span>
                        {img.width && img.height ? (
                          <span className="block text-[10px] text-slate-400 font-mono">
                            {img.width}×{img.height}
                          </span>
                        ) : null}
                      </div>
                      <button
                        type="button"
                        onClick={() => downloadFile(img.blob, img.filename, img.mimeType)}
                        className="p-1 rounded text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 shrink-0"
                        title={t.common.download}
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
      <ToolSeoSection pageKey="extractImages" toolName={t.nav.extractImages} />
    </div>
  );
};
