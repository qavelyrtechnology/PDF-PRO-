import React, { useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { DropZone } from '../components/DropZone';
import { FileCard } from '../components/FileCard';
import { StatusBanner } from '../components/StatusBanner';
import { PageSeo } from '../components/PageSeo';
import { ToolSeoSection } from '../components/ToolSeoSection';
import { FileGateAlerts } from '../components/FileGateAlerts';
import { PasswordModal } from '../components/PasswordModal';
import { usePdfFileGate } from '../hooks/usePdfFileGate';
import {
  loadPdfJsDocument,
  cropPdfMargins,
  shareOrDownloadFile,
} from '../services/pdfService';
import { Crop, Download, Share2, Info } from 'lucide-react';

export const CropPage: React.FC = () => {
  const { t } = useLanguage();
  const gate = usePdfFileGate();
  const [file, setFile] = useState<File | null>(null);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [margin, setMargin] = useState<number>(30);
  const [isProcessing, setIsProcessing] = useState(false);
  const [croppedBytes, setCroppedBytes] = useState<Uint8Array | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleFileSelected = async (files: File[]) => {
    if (files.length === 0) return;
    const ready = await gate.prepareFiles([files[0]]);
    if (ready.length === 0) return;
    const selected = ready[0];
    setFile(selected);
    setCroppedBytes(null);
    setErrorMessage(null);
    setSuccessMessage(null);

    let doc: Awaited<ReturnType<typeof loadPdfJsDocument>> | null = null;
    try {
      doc = await loadPdfJsDocument(selected);
      setTotalPages(doc.numPages);
    } catch (err: any) {
      console.error('Crop load error:', err);
      setErrorMessage(t.reader.pageRenderError);
      setFile(null);
    } finally {
      await doc?.loadingTask?.destroy().catch(() => {});
    }
  };

  const handleCrop = async () => {
    if (!file) return;

    setIsProcessing(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const bytes = await cropPdfMargins(file, margin);
      setCroppedBytes(bytes);
      setSuccessMessage('Margins cropped successfully without data loss!');
    } catch (err: any) {
      console.error('Crop error:', err);
      setErrorMessage(err?.message || t.common.error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!croppedBytes || !file) return;
    const baseName = file.name.replace(/\.pdf$/i, '');
    shareOrDownloadFile(croppedBytes, `${baseName}_cropped.pdf`);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <PageSeo pageKey="crop" />
      <PasswordModal {...gate.passwordModalProps} />

      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Crop className="w-7 h-7 text-rose-600" />
          {t.crop.title}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          {t.crop.subtitle}
        </p>
      </div>

      <FileGateAlerts warning={gate.sizeWarning} error={gate.blockError} />

      <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 flex items-start gap-3 text-xs text-blue-900 dark:text-blue-200">
        <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed opacity-90">{t.crop.cropNotice}</p>
      </div>

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
          promptText={t.crop.dropPrompt}
          allowedFormatsText="PDF"
          multiple={false}
        />
      )}

      {file && (
        <div className="space-y-6">
          <FileCard
            name={file.name}
            size={file.size}
            pageCount={totalPages}
            onRemove={() => {
              setFile(null);
              setCroppedBytes(null);
              gate.clearNotices();
            }}
          />

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {t.crop.marginAmount}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { val: 20, label: t.crop.marginSmall },
                { val: 40, label: t.crop.marginMedium },
                { val: 60, label: t.crop.marginLarge },
              ].map((m) => (
                <button
                  key={m.val}
                  type="button"
                  onClick={() => setMargin(m.val)}
                  className={`p-3.5 rounded-xl border text-center transition-all ${
                    margin === m.val
                      ? 'border-rose-500 bg-rose-50/40 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 font-bold'
                      : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span className="block text-sm">{m.label}</span>
                </button>
              ))}
            </div>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              {!croppedBytes ? (
                <button
                  type="button"
                  onClick={handleCrop}
                  disabled={isProcessing}
                  className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-md shadow-rose-600/20 disabled:opacity-50"
                >
                  {t.crop.applyCropBtn}
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleDownload}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-md shadow-emerald-600/20"
                  >
                    <Download className="w-4 h-4" />
                    <span>{t.common.downloadPdf}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const baseName = file.name.replace(/\.pdf$/i, '');
                      shareOrDownloadFile(croppedBytes, `${baseName}_cropped.pdf`);
                    }}
                    className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200"
                    title={t.common.share}
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      <ToolSeoSection pageKey="crop" toolName={t.nav.crop} />
    </div>
  );
};
