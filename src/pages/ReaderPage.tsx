import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { DropZone } from '../components/DropZone';
import { StatusBanner } from '../components/StatusBanner';
import {
  loadPdfJsDocument,
  renderPdfPageToCanvas,
  shareOrDownloadFile,
} from '../services/pdfService';
import type * as pdfjsLib from 'pdfjs-dist';
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Download,
  Share2,
  FileText,
  Maximize2,
  RefreshCw,
  Upload,
  Sidebar,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';

export const ReaderPage: React.FC = () => {
  const { t, isRtl } = useLanguage();
  const [file, setFile] = useState<File | null>(null);
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1.2);
  const [rotation, setRotation] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showThumbnails, setShowThumbnails] = useState(false);
  const [thumbnailUrls, setThumbnailUrls] = useState<string[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFilesSelected = async (files: File[]) => {
    if (files.length === 0) return;
    const selectedFile = files[0];
    setFile(selectedFile);
    setLoading(true);
    setErrorMessage(null);
    setThumbnailUrls([]);

    try {
      const doc = await loadPdfJsDocument(selectedFile);
      setPdfDoc(doc);
      setTotalPages(doc.numPages);
      setCurrentPage(1);
      setRotation(0);

      // Pre-render thumbnails for quick navigation
      generateThumbnails(doc);
    } catch (err: any) {
      console.error('PDF load error:', err);
      if (err?.name === 'PasswordException') {
        setErrorMessage(t.reader.passwordRequired);
      } else {
        setErrorMessage(t.reader.pageRenderError);
      }
      setPdfDoc(null);
    } finally {
      setLoading(false);
    }
  };

  const generateThumbnails = async (doc: pdfjsLib.PDFDocumentProxy) => {
    const urls: string[] = [];
    const count = Math.min(doc.numPages, 30); // Up to 30 thumbnails for fast loading
    for (let i = 1; i <= count; i++) {
      try {
        const canvas = document.createElement('canvas');
        await renderPdfPageToCanvas(doc, i, canvas, 0.2, 0);
        urls.push(canvas.toDataURL('image/jpeg', 0.7));
      } catch {
        // continue
      }
    }
    setThumbnailUrls(urls);
  };

  // Keyboard navigation shortcuts
  useEffect(() => {
    if (!pdfDoc) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

      if (e.key === 'ArrowRight') {
        if (isRtl) handlePrevPage();
        else handleNextPage();
      } else if (e.key === 'ArrowLeft') {
        if (isRtl) handleNextPage();
        else handlePrevPage();
      } else if (e.key === '+' || e.key === '=') {
        handleZoomIn();
      } else if (e.key === '-') {
        handleZoomOut();
      } else if (e.key === '0') {
        handleFitWidth();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pdfDoc, currentPage, totalPages, isRtl]);

  // Render current page when page, scale, or rotation changes
  useEffect(() => {
    if (!pdfDoc || !canvasRef.current) return;

    let isCancelled = false;
    const render = async () => {
      try {
        setLoading(true);
        if (canvasRef.current) {
          await renderPdfPageToCanvas(pdfDoc, currentPage, canvasRef.current, scale, rotation);
        }
      } catch (err: any) {
        if (!isCancelled && err?.name !== 'RenderingCancelledException' && !err?.message?.includes('cancelled')) {
          console.error('Render page error:', err);
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    render();
    return () => {
      isCancelled = true;
    };
  }, [pdfDoc, currentPage, scale, rotation]);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((p) => p - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((p) => p + 1);
  };

  const handleZoomIn = () => {
    setScale((s) => Math.min(3.0, Number((s + 0.2).toFixed(1))));
  };

  const handleZoomOut = () => {
    setScale((s) => Math.max(0.5, Number((s - 0.2).toFixed(1))));
  };

  const handleRotate = () => {
    setRotation((r) => (r + 90) % 360);
  };

  const handleFitWidth = () => {
    setScale(1.2);
  };

  const handleDownload = () => {
    if (!file) return;
    shareOrDownloadFile(file, file.name);
  };

  const handleReset = () => {
    setFile(null);
    setPdfDoc(null);
    setCurrentPage(1);
    setTotalPages(0);
    setErrorMessage(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-7 h-7 text-rose-600" />
            {t.reader.title}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t.reader.subtitle}
          </p>
        </div>

        {file && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs transition-all"
            >
              <Download className="w-4 h-4" />
              <span>{t.common.download}</span>
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
              title={t.common.share}
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium transition-all"
            >
              <Upload className="w-4 h-4" />
              <span>{t.common.reset}</span>
            </button>
          </div>
        )}
      </div>

      {errorMessage && (
        <StatusBanner
          type="error"
          message={errorMessage}
          onDismiss={() => setErrorMessage(null)}
        />
      )}

      {/* Upload Drop Zone if no PDF loaded */}
      {!pdfDoc && (
        <div className="max-w-xl mx-auto py-10">
          <DropZone
            onFilesSelected={handleFilesSelected}
            promptText={t.reader.openPdf}
            allowedFormatsText="PDF"
          />
        </div>
      )}

      {/* PDF Viewer Interface */}
      {pdfDoc && (
        <div className="space-y-4">
          {/* Viewer Toolbar */}
          <div className="sticky top-18 z-40 flex flex-wrap items-center justify-between gap-3 p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
            {/* Sidebar toggle & Page Navigation */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowThumbnails(!showThumbnails)}
                className={`p-1.5 rounded-lg transition-all ${
                  showThumbnails
                    ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 font-bold'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
                title={t.reader.thumbnails}
              >
                {showThumbnails ? (
                  <PanelLeftClose className="w-4 h-4" />
                ) : (
                  <PanelLeftOpen className="w-4 h-4" />
                )}
              </button>

              <button
                type="button"
                onClick={handlePrevPage}
                disabled={currentPage <= 1}
                className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                title={t.reader.previousPage}
                aria-label={t.reader.previousPage}
              >
                <ChevronLeft className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
              </button>

              <div className="flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-slate-300">
                <span>{t.common.page}</span>
                <input
                  type="number"
                  min={1}
                  max={totalPages}
                  value={currentPage}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    if (!isNaN(val) && val >= 1 && val <= totalPages) {
                      setCurrentPage(val);
                    }
                  }}
                  className="w-12 text-center py-1 rounded bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono text-xs focus:ring-1 focus:ring-rose-500"
                />
                <span>{t.common.of}</span>
                <span className="font-semibold">{totalPages}</span>
              </div>

              <button
                type="button"
                onClick={handleNextPage}
                disabled={currentPage >= totalPages}
                className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                title={t.reader.nextPage}
                aria-label={t.reader.nextPage}
              >
                <ChevronRight className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {/* Zoom & Rotation Controls */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleZoomOut}
                disabled={scale <= 0.6}
                className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30"
                title={`${t.common.zoomOut} (-)`}
                aria-label={t.common.zoomOut}
              >
                <ZoomOut className="w-4 h-4" />
              </button>

              <span className="text-xs font-mono font-semibold px-1 text-slate-700 dark:text-slate-300">
                {Math.round(scale * 100)}%
              </span>

              <button
                type="button"
                onClick={handleZoomIn}
                disabled={scale >= 2.8}
                className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30"
                title={`${t.common.zoomIn} (+)`}
                aria-label={t.common.zoomIn}
              >
                <ZoomIn className="w-4 h-4" />
              </button>

              <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-1" />

              <button
                type="button"
                onClick={handleFitWidth}
                className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                title={`${t.common.fitWidth} (0)`}
                aria-label={t.common.fitWidth}
              >
                <Maximize2 className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleRotate}
                className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                title={t.common.rotate}
                aria-label={t.common.rotate}
              >
                <RotateCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Workspace Layout: Optional Thumbnail Sidebar + Canvas Viewport */}
          <div className="flex gap-4">
            {/* Thumbnail Sidebar */}
            {showThumbnails && (
              <div className="w-40 shrink-0 p-3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 max-h-[700px] overflow-y-auto space-y-3">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 px-1">
                  {t.reader.thumbnails}
                </h4>
                <div className="space-y-2">
                  {thumbnailUrls.map((url, idx) => {
                    const pageNum = idx + 1;
                    const isSelected = pageNum === currentPage;
                    return (
                      <button
                        key={pageNum}
                        type="button"
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-full p-1.5 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/40 ring-2 ring-rose-500/20'
                            : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <div className="aspect-[3/4] bg-slate-100 dark:bg-slate-900 rounded-md overflow-hidden mb-1 flex items-center justify-center">
                          <img src={url} alt={`Page ${pageNum}`} className="w-full h-full object-contain" />
                        </div>
                        <span className="text-[11px] font-mono text-center block text-slate-600 dark:text-slate-400">
                          {pageNum}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Canvas Viewport */}
            <div className="flex-1 flex items-center justify-center p-4 sm:p-8 bg-slate-200/70 dark:bg-slate-950/80 rounded-2xl min-h-[500px] overflow-auto border border-slate-200 dark:border-slate-800 shadow-inner">
              <div className="relative shadow-2xl rounded-sm overflow-hidden bg-white">
                <canvas ref={canvasRef} className="max-w-full block" />
                {loading && (
                  <div className="absolute inset-0 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xs flex items-center justify-center">
                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-slate-800 shadow-md text-xs font-medium text-slate-700 dark:text-slate-300">
                      <RefreshCw className="w-4 h-4 animate-spin text-rose-500" />
                      <span>{t.common.loading}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
