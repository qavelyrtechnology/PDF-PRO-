import React, { useState, useRef, useEffect, MouseEvent, TouchEvent } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { DropZone } from '../components/DropZone';
import { StatusBanner } from '../components/StatusBanner';
import {
  loadPdfJsDocument,
  renderPdfPageToCanvas,
  annotatePdf,
  shareOrDownloadFile,
  AnnotationItem,
} from '../services/pdfService';
import type * as pdfjsLib from 'pdfjs-dist';
import {
  PenTool,
  Type,
  Calendar,
  Eraser,
  Download,
  Share2,
  ChevronLeft,
  ChevronRight,
  Info,
  CheckCircle2,
  Bookmark,
} from 'lucide-react';

export const AnnotatePage: React.FC = () => {
  const { t, isRtl } = useLanguage();
  const [file, setFile] = useState<File | null>(null);
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  // Active annotation tool: 'pen' | 'text' | 'signature'
  const [activeTool, setActiveTool] = useState<'pen' | 'text' | 'signature'>('pen');
  const [penColor, setPenColor] = useState('#0f172a');
  const [penWidth, setPenWidth] = useState(3);
  const [fontSize, setFontSize] = useState(16);
  const [textInput, setTextInput] = useState('');

  // Signature Studio States
  const [showSigModal, setShowSigModal] = useState(false);
  const [sigMode, setSigMode] = useState<'draw' | 'type' | 'upload'>('draw');
  const [typedSigText, setTypedSigText] = useState('');
  const [savedSignatures, setSavedSignatures] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('pdf_studio_saved_signatures');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Per-page annotations storage
  const [pageAnnotations, setPageAnnotations] = useState<Map<number, AnnotationItem>>(new Map());

  const [isDrawing, setIsDrawing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [annotatedPdfBytes, setAnnotatedPdfBytes] = useState<Uint8Array | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const bgCanvasRef = useRef<HTMLCanvasElement>(null);
  const drawCanvasRef = useRef<HTMLCanvasElement>(null);
  const sigPadRef = useRef<HTMLCanvasElement>(null);
  const [isSigPadDrawing, setIsSigPadDrawing] = useState(false);

  const handleFileSelected = async (files: File[]) => {
    if (files.length === 0) return;
    const selected = files[0];
    setFile(selected);
    setAnnotatedPdfBytes(null);
    setErrorMessage(null);
    setSuccessMessage(null);
    setPageAnnotations(new Map());

    try {
      const doc = await loadPdfJsDocument(selected);
      setPdfDoc(doc);
      setTotalPages(doc.numPages);
      setCurrentPage(1);
    } catch (err: any) {
      console.error('Annotate PDF load error:', err);
      setErrorMessage(t.reader.pageRenderError);
      setFile(null);
    }
  };

  // Render PDF page and restore page's annotation canvas
  useEffect(() => {
    if (!pdfDoc || !bgCanvasRef.current || !drawCanvasRef.current) return;

    let isCancelled = false;
    const render = async () => {
      try {
        const bgCanvas = bgCanvasRef.current!;
        const drawCanvas = drawCanvasRef.current!;
        const { width, height } = await renderPdfPageToCanvas(
          pdfDoc,
          currentPage,
          bgCanvas,
          1.5,
          0
        );

        drawCanvas.width = width;
        drawCanvas.height = height;

        const ctx = drawCanvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, width, height);

          // Restore saved annotations for this page if any
          const saved = pageAnnotations.get(currentPage - 1);
          if (saved?.drawingDataUrl) {
            const img = new Image();
            img.onload = () => {
              if (!isCancelled) ctx.drawImage(img, 0, 0);
            };
            img.src = saved.drawingDataUrl;
          }

          if (saved?.textNotes) {
            saved.textNotes.forEach((note) => {
              ctx.font = `bold ${note.fontSize * 1.5}px sans-serif`;
              ctx.fillStyle = note.colorHex;
              ctx.fillText(note.text, note.xPercent * width, note.yPercent * height);
            });
          }
        }
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
  }, [pdfDoc, currentPage]);

  const saveCurrentPageAnnotations = (extraTextNote?: {
    text: string;
    xPercent: number;
    yPercent: number;
    fontSize: number;
    colorHex: string;
  }) => {
    if (!drawCanvasRef.current) return;
    const canvas = drawCanvasRef.current;
    const dataUrl = canvas.toDataURL('image/png');
    const pageIdx = currentPage - 1;

    setPageAnnotations((prev) => {
      const nextMap = new Map(prev);
      const existing = nextMap.get(pageIdx) || { pageIndex: pageIdx, textNotes: [] };

      const updatedTextNotes = [...(existing.textNotes || [])];
      if (extraTextNote) {
        updatedTextNotes.push(extraTextNote);
      }

      nextMap.set(pageIdx, {
        pageIndex: pageIdx,
        drawingDataUrl: dataUrl,
        textNotes: updatedTextNotes,
      });
      return nextMap;
    });
  };

  // Main canvas drawing
  const startDrawing = (clientX: number, clientY: number) => {
    if (activeTool !== 'pen' || !drawCanvasRef.current) return;
    const canvas = drawCanvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (clientX - rect.left) * (canvas.width / rect.width);
    const y = (clientY - rect.top) * (canvas.height / rect.height);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.strokeStyle = penColor;
    ctx.lineWidth = penWidth * 1.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const drawMove = (clientX: number, clientY: number) => {
    if (!isDrawing || activeTool !== 'pen' || !drawCanvasRef.current) return;
    const canvas = drawCanvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (clientX - rect.left) * (canvas.width / rect.width);
    const y = (clientY - rect.top) * (canvas.height / rect.height);

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    saveCurrentPageAnnotations();
  };

  const handleCanvasClick = (e: MouseEvent<HTMLCanvasElement>) => {
    if (activeTool !== 'text' || !textInput.trim() || !drawCanvasRef.current) return;

    const canvas = drawCanvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.font = `bold ${fontSize * 1.5}px sans-serif`;
      ctx.fillStyle = penColor;
      ctx.fillText(textInput, x, y);
    }

    saveCurrentPageAnnotations({
      text: textInput,
      xPercent: x / canvas.width,
      yPercent: y / canvas.height,
      fontSize,
      colorHex: penColor,
    });
  };

  const handleStampDate = () => {
    const today = new Date().toLocaleDateString(isRtl ? 'ar-EG' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
    setTextInput(today);
    setActiveTool('text');
  };

  const handleClearDrawing = () => {
    if (!drawCanvasRef.current) return;
    const canvas = drawCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);

    setPageAnnotations((prev) => {
      const nextMap = new Map(prev);
      nextMap.delete(currentPage - 1);
      return nextMap;
    });
  };

  // Stamp a signature data URL onto the active PDF page
  const applySignatureToPage = (dataUrl: string) => {
    if (!drawCanvasRef.current) return;
    const canvas = drawCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      // Place signature in lower third
      const sigWidth = canvas.width * 0.35;
      const sigHeight = (sigWidth / img.width) * img.height;
      const x = (canvas.width - sigWidth) / 2;
      const y = canvas.height * 0.7;

      ctx.drawImage(img, x, y, sigWidth, sigHeight);
      saveCurrentPageAnnotations();
      setShowSigModal(false);
    };
    img.src = dataUrl;
  };

  // Image Upload with Auto-Transparency Thresholding
  const handleSignatureImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = img.width;
        tempCanvas.height = img.height;
        const ctx = tempCanvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0);

        // Pixel transparency processing: Turn light background pixels into transparent alpha
        const imgData = ctx.getImageData(0, 0, img.width, img.height);
        const data = imgData.data;
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          // Brightness threshold
          const brightness = (r + g + b) / 3;
          if (brightness > 210) {
            data[i + 3] = 0; // Transparent
          } else {
            // Keep ink dark
            data[i] = Math.min(r, 40);
            data[i + 1] = Math.min(g, 40);
            data[i + 2] = Math.min(b, 60);
          }
        }
        ctx.putImageData(imgData, 0, 0);
        const transparentDataUrl = tempCanvas.toDataURL('image/png');
        applySignatureToPage(transparentDataUrl);
      };
      img.src = ev.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Handle Type Signature generation
  const handleApplyTypedSig = () => {
    if (!typedSigText.trim()) return;
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = 600;
    tempCanvas.height = 200;
    const ctx = tempCanvas.getContext('2d')!;
    ctx.font = 'italic 52px "Brush Script MT", "Caveat", "Segoe Script", cursive';
    ctx.fillStyle = penColor;
    ctx.fillText(typedSigText, 40, 110);

    const dataUrl = tempCanvas.toDataURL('image/png');
    applySignatureToPage(dataUrl);

    // Save in storage
    saveSignatureLocally(dataUrl);
  };

  const saveSignatureLocally = (dataUrl: string) => {
    const updated = [dataUrl, ...savedSignatures.slice(0, 4)];
    setSavedSignatures(updated);
    try {
      localStorage.setItem('pdf_studio_saved_signatures', JSON.stringify(updated));
    } catch {
      // ignore quota
    }
  };

  // Signature Pad modal drawing
  const startSigPad = (e: MouseEvent<HTMLCanvasElement> | TouchEvent<HTMLCanvasElement>) => {
    const canvas = sigPadRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.strokeStyle = penColor;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsSigPadDrawing(true);
  };

  const moveSigPad = (e: MouseEvent<HTMLCanvasElement> | TouchEvent<HTMLCanvasElement>) => {
    if (!isSigPadDrawing || !sigPadRef.current) return;
    const canvas = sigPadRef.current;
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const stopSigPad = () => {
    setIsSigPadDrawing(false);
  };

  const handleApplyPadSig = () => {
    if (!sigPadRef.current) return;
    const dataUrl = sigPadRef.current.toDataURL('image/png');
    applySignatureToPage(dataUrl);
    saveSignatureLocally(dataUrl);
  };

  const handleApplyAndDownload = async () => {
    if (!file) return;

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const allAnnotations: AnnotationItem[] = Array.from(pageAnnotations.values());
      const bytes = await annotatePdf(file, allAnnotations);
      setAnnotatedPdfBytes(bytes);
      setSuccessMessage('Annotations successfully embedded into PDF document!');
      const baseName = file.name.replace(/\.pdf$/i, '');
      shareOrDownloadFile(bytes, `${baseName}_signed.pdf`);
    } catch (err: any) {
      console.error('Annotation embed error:', err);
      setErrorMessage(err?.message || t.common.error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <PenTool className="w-7 h-7 text-rose-600" />
          {t.annotate.title}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          {t.annotate.subtitle}
        </p>
      </div>

      {/* Notices */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 flex items-start gap-2.5 text-xs text-blue-900 dark:text-blue-200">
          <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <span>{t.annotate.embedNotice}</span>
        </div>
        <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-200">
          <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <span>{t.annotate.disclaimerSignature}</span>
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
          promptText={t.annotate.dropPrompt}
          allowedFormatsText="PDF"
          multiple={false}
        />
      )}

      {file && (
        <div className="space-y-4">
          {/* Annotation Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
            {/* Tool Selection */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setActiveTool('pen')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTool === 'pen'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                }`}
              >
                <PenTool className="w-3.5 h-3.5" />
                <span>{t.annotate.toolPen}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowSigModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 dark:bg-slate-950 hover:bg-rose-600 dark:hover:bg-rose-600 text-white shadow-xs transition-colors"
              >
                <PenTool className="w-3.5 h-3.5" />
                <span>{t.annotate.signStudio}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTool('text')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTool === 'text'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                }`}
              >
                <Type className="w-3.5 h-3.5" />
                <span>{t.annotate.toolText}</span>
              </button>

              <button
                type="button"
                onClick={handleStampDate}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 transition-all"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>{t.annotate.toolDate}</span>
              </button>
            </div>

            {/* Colors and Stroke / Font Size */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {['#0f172a', '#2563eb', '#dc2626', '#16a34a'].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setPenColor(c)}
                    style={{ backgroundColor: c }}
                    className={`w-6 h-6 rounded-full transition-transform ${
                      penColor === c ? 'ring-2 ring-offset-2 ring-rose-500 scale-110' : 'opacity-80'
                    }`}
                    aria-label={`Color ${c}`}
                  />
                ))}
              </div>

              {activeTool === 'pen' ? (
                <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 pl-2">
                  <span>Width</span>
                  <select
                    value={penWidth}
                    onChange={(e) => setPenWidth(Number(e.target.value))}
                    className="px-2 py-1 text-xs rounded bg-slate-100 dark:bg-slate-700 border-none"
                  >
                    <option value={2}>Fine (2px)</option>
                    <option value={4}>Medium (4px)</option>
                    <option value={6}>Bold (6px)</option>
                  </select>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 pl-2">
                  <span>Size</span>
                  <select
                    value={fontSize}
                    onChange={(e) => setFontSize(Number(e.target.value))}
                    className="px-2 py-1 text-xs rounded bg-slate-100 dark:bg-slate-700 border-none"
                  >
                    <option value={14}>14pt</option>
                    <option value={18}>18pt</option>
                    <option value={24}>24pt</option>
                  </select>
                </div>
              )}

              <button
                type="button"
                onClick={handleClearDrawing}
                className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-medium flex items-center gap-1 ml-1"
                title={t.annotate.toolClearDrawing}
              >
                <Eraser className="w-4 h-4" />
                <span className="hidden sm:inline">{t.annotate.toolClearDrawing}</span>
              </button>
            </div>
          </div>

          {/* Text Input Prompt */}
          {activeTool === 'text' && (
            <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-rose-300 dark:border-rose-900/60 shadow-xs flex items-center gap-2">
              <Type className="w-4 h-4 text-rose-500 shrink-0" />
              <input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder={t.annotate.textContentPlaceholder}
                className="w-full text-xs bg-transparent border-none focus:outline-none text-slate-900 dark:text-white"
              />
              <span className="text-[11px] text-slate-400 shrink-0">
                Click anywhere on page to place
              </span>
            </div>
          )}

          {/* Canvas Workspace Viewport */}
          <div className="flex items-center justify-center p-4 sm:p-8 bg-slate-200/70 dark:bg-slate-950/80 rounded-2xl min-h-[500px] overflow-auto border border-slate-200 dark:border-slate-800 shadow-inner">
            <div className="relative shadow-2xl rounded-sm overflow-hidden bg-white select-none">
              <canvas ref={bgCanvasRef} className="block max-w-full" />
              <canvas
                ref={drawCanvasRef}
                onMouseDown={(e) => startDrawing(e.clientX, e.clientY)}
                onMouseMove={(e) => drawMove(e.clientX, e.clientY)}
                onMouseUp={stopDrawing}
                onTouchStart={(e) => {
                  if (e.touches.length > 0) startDrawing(e.touches[0].clientX, e.touches[0].clientY);
                }}
                onTouchMove={(e) => {
                  if (e.touches.length > 0) drawMove(e.touches[0].clientX, e.touches[0].clientY);
                }}
                onTouchEnd={stopDrawing}
                onClick={handleCanvasClick}
                className={`absolute inset-0 w-full h-full ${
                  activeTool === 'pen' ? 'cursor-crosshair' : 'cursor-text'
                }`}
              />
            </div>
          </div>

          {/* Page Switcher & Download Bar */}
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

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleApplyAndDownload}
                disabled={isProcessing}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-md shadow-rose-600/20 disabled:opacity-50 transition-all"
              >
                <Download className="w-4 h-4" />
                <span>{t.annotate.applyAnnotationBtn}</span>
              </button>

              <button
                type="button"
                onClick={async () => {
                  const allAnnotations = Array.from(pageAnnotations.values());
                  const bytes = await annotatePdf(file, allAnnotations);
                  const baseName = file.name.replace(/\.pdf$/i, '');
                  shareOrDownloadFile(bytes, `${baseName}_signed.pdf`);
                }}
                className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200"
                title={t.common.share}
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Signature Studio Modal */}
      {showSigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <PenTool className="w-5 h-5 text-rose-600" />
                <span>{t.annotate.signStudio}</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowSigModal(false)}
                className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
              <button
                type="button"
                onClick={() => setSigMode('draw')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  sigMode === 'draw'
                    ? 'bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                {t.annotate.tabDraw}
              </button>
              <button
                type="button"
                onClick={() => setSigMode('type')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  sigMode === 'type'
                    ? 'bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                {t.annotate.tabType}
              </button>
              <button
                type="button"
                onClick={() => setSigMode('upload')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  sigMode === 'upload'
                    ? 'bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                {t.annotate.tabUpload}
              </button>
            </div>

            {/* Tab 1: Draw Signature */}
            {sigMode === 'draw' && (
              <div className="space-y-3">
                <div className="border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-950 overflow-hidden relative">
                  <canvas
                    ref={sigPadRef}
                    width={450}
                    height={160}
                    onMouseDown={startSigPad}
                    onMouseMove={moveSigPad}
                    onMouseUp={stopSigPad}
                    onTouchStart={startSigPad}
                    onTouchMove={moveSigPad}
                    onTouchEnd={stopSigPad}
                    className="w-full h-40 cursor-crosshair block"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const ctx = sigPadRef.current?.getContext('2d');
                      ctx?.clearRect(0, 0, 450, 160);
                    }}
                    className="absolute top-2 right-2 text-[11px] font-medium px-2 py-1 rounded bg-white/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 shadow-xs"
                  >
                    Clear
                  </button>
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={handleApplyPadSig}
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-xs"
                  >
                    Place Signature on Page
                  </button>
                </div>
              </div>
            )}

            {/* Tab 2: Type Signature */}
            {sigMode === 'type' && (
              <div className="space-y-4">
                <input
                  type="text"
                  value={typedSigText}
                  onChange={(e) => setTypedSigText(e.target.value)}
                  placeholder="Type your full name..."
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white"
                />

                {typedSigText && (
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center">
                    <p
                      style={{
                        fontFamily: 'cursive, "Brush Script MT", "Segoe Script"',
                        fontSize: '32px',
                        color: penColor,
                      }}
                    >
                      {typedSigText}
                    </p>
                  </div>
                )}

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleApplyTypedSig}
                    disabled={!typedSigText.trim()}
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-xs disabled:opacity-40"
                  >
                    Apply Cursive Signature
                  </button>
                </div>
              </div>
            )}

            {/* Tab 3: Upload with Auto-Transparent Thresholding */}
            {sigMode === 'upload' && (
              <div className="space-y-4">
                <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-xs text-emerald-900 dark:text-emerald-200 space-y-1">
                  <p className="font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>{t.annotate.removeWhiteBg}</span>
                  </p>
                  <p className="opacity-90">
                    Snap a photo of your signature on paper. The app will automatically remove the
                    white paper background and extract only the clean signature.
                  </p>
                </div>

                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleSignatureImageUpload}
                  className="text-xs text-slate-600 dark:text-slate-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-rose-50 file:text-rose-700 hover:file:bg-rose-100 dark:file:bg-rose-950 dark:file:text-rose-300"
                />
              </div>
            )}

            {/* Saved signatures in browser */}
            {savedSignatures.length > 0 && (
              <div className="border-t border-slate-100 dark:border-slate-800 pt-3 space-y-2">
                <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>{t.annotate.savedSignatures}</span>
                </h4>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {savedSignatures.map((dataUrl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => applySignatureToPage(dataUrl)}
                      className="p-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-rose-500 bg-white dark:bg-slate-800 shrink-0 h-14 w-28 overflow-hidden group"
                      title={t.annotate.useSaved}
                    >
                      <img src={dataUrl} alt="Saved signature" className="w-full h-full object-contain" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
