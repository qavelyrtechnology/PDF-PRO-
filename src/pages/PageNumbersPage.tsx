import React, { useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { DropZone } from '../components/DropZone';
import { FileCard } from '../components/FileCard';
import { ProgressBar } from '../components/ProgressBar';
import { StatusBanner } from '../components/StatusBanner';
import {
  loadPdfJsDocument,
  addPageNumbersToPdf,
  shareOrDownloadFile,
  PageNumberOptions,
} from '../services/pdfService';
import { Hash, Download, Share2, Settings } from 'lucide-react';

export const PageNumbersPage: React.FC = () => {
  const { t } = useLanguage();
  const [file, setFile] = useState<File | null>(null);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [position, setPosition] = useState<PageNumberOptions['position']>('bottom-center');
  const [format, setFormat] = useState<PageNumberOptions['format']>('page_x_of_y');
  const [skipFirst, setSkipFirst] = useState(false);
  const [fontSize, setFontSize] = useState(11);
  const [colorHex, setColorHex] = useState('#475569');

  const [isProcessing, setIsProcessing] = useState(false);
  const [numberedPdfBytes, setNumberedPdfBytes] = useState<Uint8Array | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleFileSelected = async (files: File[]) => {
    if (files.length === 0) return;
    const selected = files[0];
    setFile(selected);
    setNumberedPdfBytes(null);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const doc = await loadPdfJsDocument(selected);
      setTotalPages(doc.numPages);
    } catch (err: any) {
      console.error('Page numbers load error:', err);
      setErrorMessage(t.reader.pageRenderError);
      setFile(null);
    }
  };

  const handleAddPageNumbers = async () => {
    if (!file) return;

    setIsProcessing(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const bytes = await addPageNumbersToPdf(file, {
        position,
        format,
        skipFirst,
        fontSize,
        colorHex,
      });
      setNumberedPdfBytes(bytes);
      setSuccessMessage('Page numbers added successfully!');
    } catch (err: any) {
      console.error('Add page numbers error:', err);
      setErrorMessage(err?.message || t.common.error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!numberedPdfBytes || !file) return;
    const baseName = file.name.replace(/\.pdf$/i, '');
    shareOrDownloadFile(numberedPdfBytes, `${baseName}_numbered.pdf`);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Hash className="w-7 h-7 text-rose-600" />
          {t.pageNumbers.title}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          {t.pageNumbers.subtitle}
        </p>
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

      {/* Upload DropZone */}
      {!file && (
        <DropZone
          onFilesSelected={handleFileSelected}
          promptText={t.pageNumbers.dropPrompt}
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
              setNumberedPdfBytes(null);
            }}
          />

          {/* Configuration Card */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-5">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Settings className="w-4 h-4" />
              <span>Numbering Settings</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Position */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {t.pageNumbers.position}
                </label>
                <select
                  value={position}
                  onChange={(e) => setPosition(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                >
                  <option value="bottom-center">{t.pageNumbers.posBottomCenter}</option>
                  <option value="bottom-right">{t.pageNumbers.posBottomRight}</option>
                  <option value="bottom-left">{t.pageNumbers.posBottomLeft}</option>
                  <option value="top-right">{t.pageNumbers.posTopRight}</option>
                  <option value="top-center">{t.pageNumbers.posTopCenter}</option>
                </select>
              </div>

              {/* Format */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {t.pageNumbers.format}
                </label>
                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                >
                  <option value="page_x_of_y">{t.pageNumbers.formatPageXofY}</option>
                  <option value="x_of_y">{t.pageNumbers.formatXofY}</option>
                  <option value="number_only">{t.pageNumbers.formatNumberOnly}</option>
                </select>
              </div>

              {/* Font Size */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {t.pageNumbers.fontSize}
                </label>
                <select
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                >
                  <option value={9}>Small (9 pt)</option>
                  <option value={11}>Standard (11 pt)</option>
                  <option value={14}>Large (14 pt)</option>
                </select>
              </div>

              {/* Color */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {t.pageNumbers.color}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={colorHex}
                    onChange={(e) => setColorHex(e.target.value)}
                    className="w-9 h-9 rounded-lg cursor-pointer border-0 p-0"
                  />
                  <span className="text-xs font-mono text-slate-500">{colorHex}</span>
                </div>
              </div>
            </div>

            {/* Skip cover page checkbox */}
            <label className="flex items-center gap-2 cursor-pointer pt-2 text-xs font-medium text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={skipFirst}
                onChange={(e) => setSkipFirst(e.target.checked)}
                className="rounded text-rose-600 focus:ring-rose-500"
              />
              <span>{t.pageNumbers.skipFirst}</span>
            </label>

            {/* Action buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              {!numberedPdfBytes ? (
                <button
                  type="button"
                  onClick={handleAddPageNumbers}
                  disabled={isProcessing}
                  className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-md shadow-rose-600/20 disabled:opacity-50"
                >
                  {t.pageNumbers.addNumbersBtn}
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
                      shareOrDownloadFile(numberedPdfBytes, `${baseName}_numbered.pdf`);
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
    </div>
  );
};
