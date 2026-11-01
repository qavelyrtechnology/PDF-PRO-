import React, { useState, useEffect } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { DropZone } from '../components/DropZone';
import { FileCard } from '../components/FileCard';
import { ProgressBar } from '../components/ProgressBar';
import { StatusBanner } from '../components/StatusBanner';
import {
  loadPdfJsDocument,
  renderPdfPageToCanvas,
  organizePdfPages,
  shareOrDownloadFile,
} from '../services/pdfService';
import type * as pdfjsLib from 'pdfjs-dist';
import {
  LayoutGrid,
  RotateCw,
  Trash2,
  Undo2,
  Download,
  Share2,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

interface PageThumbnailItem {
  pageNumber: number; // 1-based original page number
  dataUrl: string;
}

export const OrganizePage: React.FC = () => {
  const { t, isRtl } = useLanguage();
  const [file, setFile] = useState<File | null>(null);
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [thumbnails, setThumbnails] = useState<PageThumbnailItem[]>([]);
  const [pageOrder, setPageOrder] = useState<number[]>([]); // Current order of 1-based page numbers
  const [rotations, setRotations] = useState<Map<number, number>>(new Map()); // pageNum -> extra rotation (0, 90, 180, 270)
  const [deletedPages, setDeletedPages] = useState<Set<number>>(new Set());

  const [loadingThumbnails, setLoadingThumbnails] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [organizedPdfBytes, setOrganizedPdfBytes] = useState<Uint8Array | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleFileSelected = async (files: File[]) => {
    if (files.length === 0) return;
    const selected = files[0];
    setFile(selected);
    setOrganizedPdfBytes(null);
    setErrorMessage(null);
    setSuccessMessage(null);
    setDeletedPages(new Set());
    setRotations(new Map());

    try {
      const doc = await loadPdfJsDocument(selected);
      setPdfDoc(doc);
      setTotalPages(doc.numPages);

      const initialOrder = Array.from({ length: doc.numPages }, (_, i) => i + 1);
      setPageOrder(initialOrder);

      // Render thumbnails for each page
      setLoadingThumbnails(true);
      const items: PageThumbnailItem[] = [];
      for (let i = 1; i <= doc.numPages; i++) {
        const canvas = document.createElement('canvas');
        // Thumbnail resolution (~0.4 scale)
        await renderPdfPageToCanvas(doc, i, canvas, 0.4, 0);
        items.push({
          pageNumber: i,
          dataUrl: canvas.toDataURL('image/jpeg', 0.8),
        });
      }

      setThumbnails(items);
    } catch (err: any) {
      console.error('Organize load error:', err);
      setErrorMessage(t.reader.pageRenderError);
      setFile(null);
    } finally {
      setLoadingThumbnails(false);
    }
  };

  const handleRotatePage = (pageNum: number) => {
    setRotations((prev) => {
      const nextMap = new Map(prev);
      const current = nextMap.get(pageNum) || 0;
      nextMap.set(pageNum, (current + 90) % 360);
      return nextMap;
    });
  };

  const handleDeletePage = (pageNum: number) => {
    setDeletedPages((prev) => {
      const nextSet = new Set(prev);
      nextSet.add(pageNum);
      return nextSet;
    });
    setPageOrder((prev) => prev.filter((p) => p !== pageNum));
  };

  const handleMoveLeft = (index: number) => {
    if (index <= 0) return;
    setPageOrder((prev) => {
      const next = [...prev];
      const temp = next[index - 1];
      next[index - 1] = next[index];
      next[index] = temp;
      return next;
    });
  };

  const handleMoveRight = (index: number) => {
    if (index >= pageOrder.length - 1) return;
    setPageOrder((prev) => {
      const next = [...prev];
      const temp = next[index + 1];
      next[index + 1] = next[index];
      next[index] = temp;
      return next;
    });
  };

  const handleRestoreAll = () => {
    if (!totalPages) return;
    setPageOrder(Array.from({ length: totalPages }, (_, i) => i + 1));
    setDeletedPages(new Set());
    setRotations(new Map());
    setOrganizedPdfBytes(null);
  };

  const handleSaveOrganized = async () => {
    if (!file || pageOrder.length === 0) {
      setErrorMessage('Please keep at least one page in the document.');
      return;
    }

    setIsProcessing(true);
    setProgress(30);
    setErrorMessage(null);

    try {
      const bytes = await organizePdfPages(file, pageOrder, rotations);
      setOrganizedPdfBytes(bytes);
      setSuccessMessage('Pages successfully organized, rotated and updated!');
    } catch (err: any) {
      console.error('Save organized error:', err);
      setErrorMessage(err?.message || t.common.error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!organizedPdfBytes || !file) return;
    const baseName = file.name.replace(/\.pdf$/i, '');
    shareOrDownloadFile(organizedPdfBytes, `${baseName}_organized.pdf`);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <LayoutGrid className="w-7 h-7 text-rose-600" />
          {t.organize.title}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          {t.organize.subtitle}
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
          promptText={t.organize.dropPrompt}
          allowedFormatsText="PDF"
          multiple={false}
        />
      )}

      {/* Workspace */}
      {file && (
        <div className="space-y-6">
          <FileCard
            name={file.name}
            size={file.size}
            pageCount={pageOrder.length}
            onRemove={() => {
              setFile(null);
              setThumbnails([]);
              setPageOrder([]);
            }}
          />

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs">
            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
              <span className="font-semibold text-slate-900 dark:text-white">
                {pageOrder.length} of {totalPages} pages active
              </span>
              {deletedPages.size > 0 && (
                <span className="text-rose-500 font-medium">
                  ({deletedPages.size} deleted)
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {deletedPages.size > 0 && (
                <button
                  type="button"
                  onClick={handleRestoreAll}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-xs font-semibold text-slate-700 dark:text-slate-200"
                >
                  <Undo2 className="w-3.5 h-3.5" />
                  <span>{t.organize.restoreAll}</span>
                </button>
              )}

              {!organizedPdfBytes ? (
                <button
                  type="button"
                  onClick={handleSaveOrganized}
                  disabled={isProcessing || pageOrder.length === 0}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{t.organize.saveChangesBtn}</span>
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleDownload}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs"
                  >
                    <Download className="w-4 h-4" />
                    <span>{t.common.downloadPdf}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const baseName = file.name.replace(/\.pdf$/i, '');
                      shareOrDownloadFile(organizedPdfBytes, `${baseName}_organized.pdf`);
                    }}
                    className="flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200"
                    title={t.common.share}
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {loadingThumbnails && (
            <div className="p-8 text-center text-xs text-slate-500 animate-pulse">
              Generating page previews...
            </div>
          )}

          {/* Page Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {pageOrder.map((pageNum, idx) => {
              const thumb = thumbnails.find((t) => t.pageNumber === pageNum);
              const extraRot = rotations.get(pageNum) || 0;

              return (
                <div
                  key={`${pageNum}-${idx}`}
                  className="group relative p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs hover:border-rose-400 dark:hover:border-rose-500 transition-all flex flex-col justify-between"
                >
                  {/* Page Badge & Move controls */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="w-6 h-6 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-mono font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <div className="flex items-center gap-0.5">
                      <button
                        type="button"
                        onClick={() => handleMoveLeft(idx)}
                        disabled={idx === 0}
                        className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-20"
                        title="Move Earlier"
                      >
                        <ArrowLeft className={`w-3.5 h-3.5 ${isRtl ? 'rotate-180' : ''}`} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveRight(idx)}
                        disabled={idx === pageOrder.length - 1}
                        className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-20"
                        title="Move Later"
                      >
                        <ArrowRight className={`w-3.5 h-3.5 ${isRtl ? 'rotate-180' : ''}`} />
                      </button>
                    </div>
                  </div>

                  {/* Thumbnail Image */}
                  <div className="aspect-[3/4] bg-slate-100 dark:bg-slate-900 rounded-lg overflow-hidden flex items-center justify-center border border-slate-200/60 dark:border-slate-700/60 relative">
                    {thumb ? (
                      <img
                        src={thumb.dataUrl}
                        alt={`Page ${pageNum}`}
                        style={{ transform: `rotate(${extraRot}deg)` }}
                        className="w-full h-full object-contain transition-transform duration-200"
                      />
                    ) : (
                      <span className="text-xs text-slate-400">Page {pageNum}</span>
                    )}

                    {extraRot !== 0 && (
                      <span className="absolute top-1 right-1 text-[10px] font-mono font-bold px-1 rounded bg-black/60 text-white">
                        {extraRot}°
                      </span>
                    )}
                  </div>

                  {/* Rotate and Delete actions */}
                  <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-700/60">
                    <button
                      type="button"
                      onClick={() => handleRotatePage(pageNum)}
                      className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                      title={t.organize.rotatePage}
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeletePage(pageNum)}
                      className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                      title={t.organize.deletePage}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
