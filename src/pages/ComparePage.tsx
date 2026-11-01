import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { DropZone } from '../components/DropZone';
import { StatusBanner } from '../components/StatusBanner';
import { loadPdfJsDocument, renderPdfPageToCanvas } from '../services/pdfService';
import type * as pdfjsLib from 'pdfjs-dist';
import {
  Columns2,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  FileText,
  Upload,
} from 'lucide-react';

export const ComparePage: React.FC = () => {
  const { t, isRtl } = useLanguage();
  const [fileA, setFileA] = useState<File | null>(null);
  const [fileB, setFileB] = useState<File | null>(null);
  const [docA, setDocA] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [docB, setDocB] = useState<pdfjsLib.PDFDocumentProxy | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [maxPages, setMaxPages] = useState(0);
  const [scale, setScale] = useState(1.0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const canvasARef = useRef<HTMLCanvasElement>(null);
  const canvasBRef = useRef<HTMLCanvasElement>(null);

  const handleFileASelected = async (files: File[]) => {
    if (files.length === 0) return;
    const f = files[0];
    setFileA(f);
    try {
      const doc = await loadPdfJsDocument(f);
      setDocA(doc);
      setMaxPages((prev) => Math.max(prev, doc.numPages));
    } catch (e) {
      setErrorMessage('Could not load Document A.');
    }
  };

  const handleFileBSelected = async (files: File[]) => {
    if (files.length === 0) return;
    const f = files[0];
    setFileB(f);
    try {
      const doc = await loadPdfJsDocument(f);
      setDocB(doc);
      setMaxPages((prev) => Math.max(prev, doc.numPages));
    } catch (e) {
      setErrorMessage('Could not load Document B.');
    }
  };

  useEffect(() => {
    let isCancelled = false;
    const render = async () => {
      try {
        if (docA && canvasARef.current && currentPage <= docA.numPages) {
          await renderPdfPageToCanvas(docA, currentPage, canvasARef.current, scale, 0);
        }
        if (docB && canvasBRef.current && currentPage <= docB.numPages) {
          await renderPdfPageToCanvas(docB, currentPage, canvasBRef.current, scale, 0);
        }
      } catch (err: any) {
        if (!isCancelled && err?.name !== 'RenderingCancelledException' && !err?.message?.includes('cancelled')) {
          console.error('Compare render error:', err);
        }
      }
    };
    render();
    return () => {
      isCancelled = true;
    };
  }, [docA, docB, currentPage, scale]);

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage((p) => p - 1);
  };

  const handleNext = () => {
    if (currentPage < maxPages) setCurrentPage((p) => p + 1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Columns2 className="w-7 h-7 text-rose-600" />
          {t.compare.title}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          {t.compare.subtitle}
        </p>
      </div>

      {errorMessage && (
        <StatusBanner
          type="error"
          message={errorMessage}
          onDismiss={() => setErrorMessage(null)}
        />
      )}

      {/* Synchronized Toolbar */}
      {docA && docB && (
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrev}
              disabled={currentPage <= 1}
              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 disabled:opacity-30"
            >
              <ChevronLeft className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
            </button>
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
              {t.common.page} {currentPage} {t.common.of} {maxPages}
            </span>
            <button
              type="button"
              onClick={handleNext}
              disabled={currentPage >= maxPages}
              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 disabled:opacity-30"
            >
              <ChevronRight className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setScale((s) => Math.max(0.6, Number((s - 0.2).toFixed(1))))}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono font-semibold px-1 text-slate-700 dark:text-slate-300">
              {Math.round(scale * 100)}%
            </span>
            <button
              type="button"
              onClick={() => setScale((s) => Math.min(2.4, Number((s + 0.2).toFixed(1))))}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setScale(1.0)}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Dual Document Viewport Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Document A */}
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-500" />
              <span>{t.compare.originalDoc}</span>
            </h3>
            {fileA && (
              <span className="text-xs text-slate-500 truncate max-w-[150px]">{fileA.name}</span>
            )}
          </div>

          {!docA ? (
            <DropZone
              onFilesSelected={handleFileASelected}
              promptText={t.compare.dropPromptA}
              allowedFormatsText="PDF"
              multiple={false}
            />
          ) : (
            <div className="flex items-center justify-center p-4 bg-slate-200/70 dark:bg-slate-950/80 rounded-2xl min-h-[450px] overflow-auto border border-slate-200 dark:border-slate-800 shadow-inner">
              <canvas ref={canvasARef} className="max-w-full block shadow-md" />
            </div>
          )}
        </div>

        {/* Document B */}
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <FileText className="w-4 h-4 text-rose-500" />
              <span>{t.compare.revisedDoc}</span>
            </h3>
            {fileB && (
              <span className="text-xs text-slate-500 truncate max-w-[150px]">{fileB.name}</span>
            )}
          </div>

          {!docB ? (
            <DropZone
              onFilesSelected={handleFileBSelected}
              promptText={t.compare.dropPromptB}
              allowedFormatsText="PDF"
              multiple={false}
            />
          ) : (
            <div className="flex items-center justify-center p-4 bg-slate-200/70 dark:bg-slate-950/80 rounded-2xl min-h-[450px] overflow-auto border border-slate-200 dark:border-slate-800 shadow-inner">
              <canvas ref={canvasBRef} className="max-w-full block shadow-md" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
