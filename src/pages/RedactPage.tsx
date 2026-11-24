import React, { useState, useRef, useEffect, PointerEvent } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { DropZone } from '../components/DropZone';
import { StatusBanner } from '../components/StatusBanner';
import {
  loadPdfJsDocument,
  renderPdfPageToCanvas,
  redactPdf,
  shareOrDownloadFile,
  RedactionRect,
  PageRedaction,
} from '../services/pdfService';
import type * as pdfjsLib from 'pdfjs-dist';
import {
  EyeOff,
  Share2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Hand,
  SquareDashed,
  Undo2,
} from 'lucide-react';

export const RedactPage: React.FC = () => {
  const { t, isRtl } = useLanguage();
  const [file, setFile] = useState<File | null>(null);
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const [boxColor, setBoxColor] = useState<'black' | 'white'>('black');
  const [interactionMode, setInteractionMode] = useState<'draw' | 'pan'>('draw');
  // Map of pageIndex -> RedactionRect[]
  const [pageRedactions, setPageRedactions] = useState<Map<number, RedactionRect[]>>(new Map());

  const [isSelecting, setIsSelecting] = useState(false);
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null);
  const [currentRect, setCurrentRect] = useState<{ x: number; y: number; w: number; h: number } | null>(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const [redactedPdfBytes, setRedactedPdfBytes] = useState<Uint8Array | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const bgCanvasRef = useRef<HTMLCanvasElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileSelected = async (files: File[]) => {
    if (files.length === 0) return;
    const selected = files[0];
    setFile(selected);
    setRedactedPdfBytes(null);
    setErrorMessage(null);
    setSuccessMessage(null);
    setPageRedactions(new Map());
    setInteractionMode('draw');
    setIsSelecting(false);
    setStartPos(null);
    setCurrentRect(null);

    try {
      const doc = await loadPdfJsDocument(selected);
      setPdfDoc(doc);
      setTotalPages(doc.numPages);
      setCurrentPage(1);
    } catch (err: any) {
      console.error('Redact PDF load error:', err);
      setErrorMessage(t.reader.pageRenderError);
      setFile(null);
    }
  };

  // Render current PDF page and overlay redaction rectangles
  useEffect(() => {
    if (!pdfDoc || !bgCanvasRef.current || !overlayCanvasRef.current) return;

    let isCancelled = false;
    const render = async () => {
      try {
        const bgCanvas = bgCanvasRef.current!;
        const overlayCanvas = overlayCanvasRef.current!;
        const { width, height } = await renderPdfPageToCanvas(
          pdfDoc,
          currentPage,
          bgCanvas,
          1.5,
          0
        );

        overlayCanvas.width = width;
        overlayCanvas.height = height;

        drawOverlayRects();
      } catch (err: any) {
        if (!isCancelled && err?.name !== 'RenderingCancelledException' && !err?.message?.includes('cancelled')) {
          console.error('Render error:', err);
        }
      }
    };

    render();
    return () => {
      isCancelled = true;
    };
  }, [pdfDoc, currentPage, pageRedactions]);

  const drawOverlayRects = () => {
    const overlay = overlayCanvasRef.current;
    if (!overlay) return;
    const ctx = overlay.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, overlay.width, overlay.height);

    const saved = pageRedactions.get(currentPage - 1) || [];
    for (const r of saved) {
      ctx.fillStyle = r.color === 'white' ? 'rgba(255, 255, 255, 0.95)' : 'rgba(0, 0, 0, 0.95)';
      ctx.fillRect(r.x, overlay.height - r.y - r.height, r.width, r.height);
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 1;
      ctx.strokeRect(r.x, overlay.height - r.y - r.height, r.width, r.height);
    }
  };

  const getCanvasPoint = (e: PointerEvent<HTMLCanvasElement>, overlay: HTMLCanvasElement) => {
    const rect = overlay.getBoundingClientRect();
    const rawX = (e.clientX - rect.left) * (overlay.width / rect.width);
    const rawY = (e.clientY - rect.top) * (overlay.height / rect.height);
    return {
      x: Math.max(0, Math.min(overlay.width, rawX)),
      y: Math.max(0, Math.min(overlay.height, rawY)),
    };
  };

  // Unified mouse/touch/stylus drag selection handlers
  const handlePointerDown = (e: PointerEvent<HTMLCanvasElement>) => {
    if (interactionMode !== 'draw') return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;

    const overlay = overlayCanvasRef.current;
    if (!overlay) return;

    e.preventDefault();
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Ignore if pointer capture is unavailable
    }

    const pt = getCanvasPoint(e, overlay);
    setIsSelecting(true);
    setStartPos(pt);
    setCurrentRect(null);
  };

  const handlePointerMove = (e: PointerEvent<HTMLCanvasElement>) => {
    if (interactionMode !== 'draw' || !isSelecting || !startPos || !overlayCanvasRef.current) return;
    e.preventDefault();

    const overlay = overlayCanvasRef.current;
    const pt = getCanvasPoint(e, overlay);

    const x = Math.min(startPos.x, pt.x);
    const y = Math.min(startPos.y, pt.y);
    const w = Math.abs(pt.x - startPos.x);
    const h = Math.abs(pt.y - startPos.y);

    setCurrentRect({ x, y, w, h });

    // Live redraw
    drawOverlayRects();
    const ctx = overlay.getContext('2d');
    if (ctx) {
      ctx.fillStyle = boxColor === 'white' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(x, y, w, h);
      ctx.strokeStyle = '#e11d48';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(x, y, w, h);
    }
  };

  const releasePointer = (e: PointerEvent<HTMLCanvasElement>) => {
    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch {
      // Ignore
    }
  };

  const handlePointerUp = (e: PointerEvent<HTMLCanvasElement>) => {
    releasePointer(e);

    if (!isSelecting || !startPos || !currentRect || !overlayCanvasRef.current) {
      setIsSelecting(false);
      setStartPos(null);
      setCurrentRect(null);
      drawOverlayRects();
      return;
    }
    const overlay = overlayCanvasRef.current;

    // Minimum size filter
    if (currentRect.w > 5 && currentRect.h > 5) {
      // In PDF coordinates, origin (0,0) is bottom-left
      const pdfY = overlay.height - currentRect.y - currentRect.h;
      const xRatio = Math.max(0, currentRect.x / overlay.width);
      const yRatio = Math.max(0, currentRect.y / overlay.height);
      const widthRatio = Math.min(1 - xRatio, currentRect.w / overlay.width);
      const heightRatio = Math.min(1 - yRatio, currentRect.h / overlay.height);

      const newRedaction: RedactionRect = {
        x: currentRect.x,
        y: pdfY,
        width: currentRect.w,
        height: currentRect.h,
        xRatio,
        yRatio,
        widthRatio,
        heightRatio,
        color: boxColor,
      };

      setPageRedactions((prev) => {
        const nextMap = new Map(prev);
        const list = nextMap.get(currentPage - 1) || [];
        nextMap.set(currentPage - 1, [...list, newRedaction]);
        return nextMap;
      });
    } else {
      drawOverlayRects();
    }

    setIsSelecting(false);
    setStartPos(null);
    setCurrentRect(null);
  };

  const handlePointerCancel = (e: PointerEvent<HTMLCanvasElement>) => {
    releasePointer(e);
    setIsSelecting(false);
    setStartPos(null);
    setCurrentRect(null);
    drawOverlayRects();
  };

  const handleUndoLast = () => {
    setPageRedactions((prev) => {
      const list = prev.get(currentPage - 1);
      if (!list || list.length === 0) return prev;
      const nextMap = new Map(prev);
      if (list.length === 1) {
        nextMap.delete(currentPage - 1);
      } else {
        nextMap.set(currentPage - 1, list.slice(0, -1));
      }
      return nextMap;
    });
  };

  const handleClearCurrentPage = () => {
    setPageRedactions((prev) => {
      const nextMap = new Map(prev);
      nextMap.delete(currentPage - 1);
      return nextMap;
    });
  };

  const handleApplyRedactions = async () => {
    if (!file) return;

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const items: PageRedaction[] = [];
      pageRedactions.forEach((rects, pageIndex) => {
        if (rects.length > 0) items.push({ pageIndex, rects });
      });

      if (items.length === 0) {
        setErrorMessage(t.redact.noMarksWarning);
        setIsProcessing(false);
        return;
      }

      const bytes = await redactPdf(file, items);
      setRedactedPdfBytes(bytes);
      setSuccessMessage(t.redact.success);
      const baseName = file.name.replace(/\.pdf$/i, '');
      shareOrDownloadFile(bytes, `${baseName}_redacted.pdf`);
    } catch (err: any) {
      console.error('Redact error:', err);
      setErrorMessage(err?.message || t.common.error);
    } finally {
      setIsProcessing(false);
    }
  };

  const currentRedactionsCount = pageRedactions.get(currentPage - 1)?.length || 0;
  let totalRedactionMarks = 0;
  pageRedactions.forEach((rects) => {
    totalRedactionMarks += rects.length;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <EyeOff className="w-7 h-7 text-rose-600" />
          {t.redact.title}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          {t.redact.subtitle}
        </p>
      </div>

      {/* Honest Security Notice */}
      <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 flex items-start gap-3 text-xs text-slate-800 dark:text-slate-200">
        <ShieldAlert className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-semibold mb-1 text-slate-900 dark:text-white">
            {t.redact.securityNoticeTitle}
          </h4>
          <p className="leading-relaxed opacity-90">{t.redact.warningPermanent}</p>
        </div>
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
          promptText={t.redact.dropPrompt}
          allowedFormatsText="PDF"
          multiple={false}
        />
      )}

      {file && (
        <div className="space-y-4">
          {/* Redaction Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex flex-wrap items-center gap-2">
              {/* Draw vs Scroll/Pan mode toggle */}
              <div className="inline-flex items-center p-0.5 rounded-lg bg-slate-100 dark:bg-slate-700/80 border border-slate-200 dark:border-slate-600">
                <button
                  type="button"
                  onClick={() => setInteractionMode('draw')}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                    interactionMode === 'draw'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-white/60 dark:hover:bg-slate-600/60'
                  }`}
                >
                  <SquareDashed className="w-3.5 h-3.5" />
                  <span>{t.redact.modeDraw}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setInteractionMode('pan');
                    setIsSelecting(false);
                    setStartPos(null);
                    setCurrentRect(null);
                  }}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                    interactionMode === 'pan'
                      ? 'bg-slate-900 dark:bg-slate-950 text-white shadow-xs'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-white/60 dark:hover:bg-slate-600/60'
                  }`}
                >
                  <Hand className="w-3.5 h-3.5" />
                  <span>{t.redact.modePan}</span>
                </button>
              </div>

              <span className="hidden sm:inline-block h-4 w-px bg-slate-200 dark:bg-slate-700 mx-1" />

              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {t.redact.boxColor}:
              </span>
              <button
                type="button"
                onClick={() => setBoxColor('black')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  boxColor === 'black'
                    ? 'bg-slate-900 text-white dark:bg-black dark:text-white shadow-xs ring-2 ring-rose-500'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                }`}
              >
                <span className="w-3 h-3 rounded-full bg-black inline-block border border-slate-600" />
                <span>{t.redact.colorBlack}</span>
              </button>

              <button
                type="button"
                onClick={() => setBoxColor('white')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  boxColor === 'white'
                    ? 'bg-white text-slate-900 shadow-xs ring-2 ring-rose-500'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                }`}
              >
                <span className="w-3 h-3 rounded-full bg-white inline-block border border-slate-300" />
                <span>{t.redact.colorWhite}</span>
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                {t.redact.marksOnPage
                  .replace('{count}', currentRedactionsCount.toString())
                  .replace('{page}', currentPage.toString())}
              </span>
              {currentRedactionsCount > 0 && (
                <>
                  <button
                    type="button"
                    onClick={handleUndoLast}
                    className="p-1.5 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-medium flex items-center gap-1"
                  >
                    <Undo2 className="w-3.5 h-3.5" />
                    <span>{t.redact.undoLast}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleClearCurrentPage}
                    className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-medium flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{t.redact.clearBoxes}</span>
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="space-y-1 px-1 text-xs text-slate-500 dark:text-slate-400">
            <p>{t.redact.drawBoxHint}</p>
            <p>{t.redact.touchHint}</p>
          </div>

          {/* Canvas Viewport */}
          <div
            className={`flex items-center justify-center p-4 sm:p-8 bg-slate-200/70 dark:bg-slate-950/80 rounded-2xl min-h-[500px] overflow-auto border border-slate-200 dark:border-slate-800 shadow-inner ${
              interactionMode === 'pan' ? 'cursor-grab' : ''
            }`}
          >
            <div className="relative shadow-2xl rounded-sm overflow-hidden bg-white select-none">
              <canvas ref={bgCanvasRef} className="block max-w-full" />
              <canvas
                ref={overlayCanvasRef}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerCancel}
                className={`absolute inset-0 w-full h-full ${
                  interactionMode === 'draw'
                    ? 'touch-none cursor-crosshair'
                    : 'pointer-events-none'
                }`}
              />
            </div>
          </div>

          {/* Page Navigator & Burn Action */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 disabled:opacity-30"
              >
                <ChevronLeft className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
              </button>
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                {t.common.page} {currentPage} {t.common.of} {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 disabled:opacity-30"
              >
                <ChevronRight className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {totalRedactionMarks === 0 && (
                <span className="text-xs text-amber-700 dark:text-amber-400 font-medium px-2 py-1 rounded bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/40">
                  {t.redact.noMarksWarning}
                </span>
              )}

              <button
                type="button"
                onClick={handleApplyRedactions}
                disabled={isProcessing || totalRedactionMarks === 0}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-md shadow-rose-600/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                title={totalRedactionMarks === 0 ? t.redact.noMarksWarning : t.redact.burnRedactionBtn}
              >
                <EyeOff className="w-4 h-4" />
                <span>{t.redact.burnRedactionBtn}</span>
                {totalRedactionMarks > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-white/20 text-white">
                    {totalRedactionMarks}
                  </span>
                )}
              </button>

              {redactedPdfBytes && (
                <button
                  type="button"
                  onClick={() => {
                    const baseName = file.name.replace(/\.pdf$/i, '');
                    shareOrDownloadFile(redactedPdfBytes, `${baseName}_redacted.pdf`);
                  }}
                  className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200"
                  title={t.common.share}
                >
                  <Share2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
