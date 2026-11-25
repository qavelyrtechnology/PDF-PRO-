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
  addHeaderAndFooterToPdf,
  shareOrDownloadFile,
} from '../services/pdfService';
import { AlignJustify, Info } from 'lucide-react';

export const HeaderFooterPage: React.FC = () => {
  const { t } = useLanguage();
  const gate = usePdfFileGate();
  const [file, setFile] = useState<File | null>(null);
  const [totalPages, setTotalPages] = useState(0);

  const [topLeft, setTopLeft] = useState('');
  const [topCenter, setTopCenter] = useState('');
  const [topRight, setTopRight] = useState('{date}');
  const [bottomLeft, setBottomLeft] = useState('CONFIDENTIAL');
  const [bottomCenter, setBottomCenter] = useState('');
  const [bottomRight, setBottomRight] = useState('Page {page} of {total}');
  const [fontSize, setFontSize] = useState(9);
  const [colorHex, setColorHex] = useState('#475569');

  const [isProcessing, setIsProcessing] = useState(false);
  const [headerFooterBytes, setHeaderFooterBytes] = useState<Uint8Array | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleFileSelected = async (files: File[]) => {
    if (files.length === 0) return;
    const ready = await gate.prepareFiles([files[0]]);
    if (ready.length === 0) return;
    const selected = ready[0];
    setFile(selected);
    setHeaderFooterBytes(null);
    setErrorMessage(null);
    setSuccessMessage(null);

    let doc: Awaited<ReturnType<typeof loadPdfJsDocument>> | null = null;
    try {
      doc = await loadPdfJsDocument(selected);
      setTotalPages(doc.numPages);
    } catch {
      setErrorMessage(t.reader.pageRenderError);
      setFile(null);
    } finally {
      await doc?.loadingTask?.destroy().catch(() => {});
    }
  };

  const handleApply = async () => {
    if (!file) return;

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const bytes = await addHeaderAndFooterToPdf(file, {
        topLeft,
        topCenter,
        topRight,
        bottomLeft,
        bottomCenter,
        bottomRight,
        fontSize,
        colorHex,
      });
      setHeaderFooterBytes(bytes);
      setSuccessMessage('Header & footer inserted successfully!');
      const baseName = file.name.replace(/\.pdf$/i, '');
      shareOrDownloadFile(bytes, `${baseName}_header_footer.pdf`);
    } catch (err: any) {
      console.error('Header footer error:', err);
      setErrorMessage(err?.message || t.common.error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <PageSeo pageKey="headerFooter" />
      <PasswordModal {...gate.passwordModalProps} />

      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <AlignJustify className="w-7 h-7 text-rose-600" />
          {t.headerFooter.title}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          {t.headerFooter.subtitle}
        </p>
      </div>

      <FileGateAlerts warning={gate.sizeWarning} error={gate.blockError} />

      <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 flex items-start gap-2.5 text-xs text-blue-900 dark:text-blue-200">
        <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
        <span>
          Dynamic tags supported: <strong>{'{page}'}</strong> (current page), <strong>{'{total}'}</strong> (total pages), <strong>{'{date}'}</strong> (today&apos;s date).
        </span>
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
          promptText={t.headerFooter.dropPrompt}
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
              setHeaderFooterBytes(null);
              gate.clearNotices();
            }}
          />

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-5">
            {/* Top Header Grid */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                Running Headers (Top of Pages)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  value={topLeft}
                  onChange={(e) => setTopLeft(e.target.value)}
                  placeholder={t.headerFooter.topLeft}
                  className="px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
                <input
                  type="text"
                  value={topCenter}
                  onChange={(e) => setTopCenter(e.target.value)}
                  placeholder={t.headerFooter.topCenter}
                  className="px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
                <input
                  type="text"
                  value={topRight}
                  onChange={(e) => setTopRight(e.target.value)}
                  placeholder={t.headerFooter.topRight}
                  className="px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* Bottom Footer Grid */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-700/60">
              <h3 className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                Running Footers (Bottom of Pages)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  value={bottomLeft}
                  onChange={(e) => setBottomLeft(e.target.value)}
                  placeholder={t.headerFooter.bottomLeft}
                  className="px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
                <input
                  type="text"
                  value={bottomCenter}
                  onChange={(e) => setBottomCenter(e.target.value)}
                  placeholder={t.headerFooter.bottomCenter}
                  className="px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
                <input
                  type="text"
                  value={bottomRight}
                  onChange={(e) => setBottomRight(e.target.value)}
                  placeholder={t.headerFooter.bottomRight}
                  className="px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* Size & Color */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-700/60">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Font Size ({fontSize} pt)
                </label>
                <input
                  type="range"
                  min={8}
                  max={14}
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="w-full accent-rose-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Text Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={colorHex}
                    onChange={(e) => setColorHex(e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0"
                  />
                  <span className="text-xs font-mono text-slate-500">{colorHex}</span>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleApply}
                disabled={isProcessing}
                className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-md shadow-rose-600/20 disabled:opacity-50 transition-all"
              >
                {t.headerFooter.applyBtn}
              </button>
            </div>
          </div>
        </div>
      )}
      <ToolSeoSection pageKey="headerFooter" toolName={t.nav.headerFooter} />
    </div>
  );
};
