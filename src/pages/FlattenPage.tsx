import React, { useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { DropZone } from '../components/DropZone';
import { FileCard } from '../components/FileCard';
import { StatusBanner } from '../components/StatusBanner';
import { flattenPdf, shareOrDownloadFile } from '../services/pdfService';
import { Layers, Download, Share2, Info } from 'lucide-react';

export const FlattenPage: React.FC = () => {
  const { t } = useLanguage();
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [flattenedBytes, setFlattenedBytes] = useState<Uint8Array | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleFileSelected = (files: File[]) => {
    if (files.length === 0) return;
    setFile(files[0]);
    setFlattenedBytes(null);
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const handleFlatten = async () => {
    if (!file) return;

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const bytes = await flattenPdf(file);
      setFlattenedBytes(bytes);
      setSuccessMessage(t.flatten.success);
      const baseName = file.name.replace(/\.pdf$/i, '');
      shareOrDownloadFile(bytes, `${baseName}_flattened.pdf`);
    } catch (err: any) {
      console.error('Flatten error:', err);
      setErrorMessage(err?.message || t.common.error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Layers className="w-7 h-7 text-rose-600" />
          {t.flatten.title}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          {t.flatten.subtitle}
        </p>
      </div>

      <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 flex items-start gap-3 text-xs text-blue-900 dark:text-blue-200">
        <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed opacity-90">{t.flatten.explanation}</p>
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
          promptText={t.flatten.dropPrompt}
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
              setFlattenedBytes(null);
            }}
          />

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex flex-wrap items-center gap-3">
            {!flattenedBytes ? (
              <button
                type="button"
                onClick={handleFlatten}
                disabled={isProcessing}
                className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-md shadow-rose-600/20 disabled:opacity-50 transition-all"
              >
                {t.flatten.flattenBtn}
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const baseName = file.name.replace(/\.pdf$/i, '');
                    shareOrDownloadFile(flattenedBytes, `${baseName}_flattened.pdf`);
                  }}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-md shadow-emerald-600/20"
                >
                  <Download className="w-4 h-4" />
                  <span>{t.common.downloadPdf}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const baseName = file.name.replace(/\.pdf$/i, '');
                    shareOrDownloadFile(flattenedBytes, `${baseName}_flattened.pdf`);
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
      )}
    </div>
  );
};
