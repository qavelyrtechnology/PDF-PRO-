import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import { PDFDocument, rgb, degrees, StandardFonts, PDFName, PDFRawStream, PDFArray, PDFNumber } from 'pdf-lib';
import workerUrl from 'pdfjs-dist/legacy/build/pdf.worker.min.mjs?url';
import {
  formatBytes,
  downloadFile,
  shareOrDownloadFile,
  parsePageRanges,
  throwIfAborted,
  PdfPasswordRequiredError,
  InvalidPdfPasswordError,
  OperationCancelledError,
} from '../utils/fileUtils';

export {
  formatBytes,
  downloadFile,
  shareOrDownloadFile,
  parsePageRanges,
  throwIfAborted,
  PdfPasswordRequiredError,
  InvalidPdfPasswordError,
  OperationCancelledError,
};

// Polyfill ES2025 Promise.try for Node 22 and older browsers required by pdfjs-dist v6
if (typeof (Promise as any).try !== 'function') {
  (Promise as any).try = function <T, Args extends unknown[]>(
    fn: (...args: Args) => T | PromiseLike<T>,
    ...args: Args
  ): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      try {
        resolve(fn(...args));
      } catch (err) {
        reject(err);
      }
    });
  };
}

// Configure pdfjs worker locally (no external CDN)
if (typeof window !== 'undefined') {
  try {
    pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;
  } catch (e) {
    console.warn('Could not set GlobalWorkerOptions.workerSrc', e);
  }
}

export interface PdfMetadata {
  title?: string;
  author?: string;
  subject?: string;
  keywords?: string[];
  creator?: string;
  producer?: string;
  creationDate?: Date;
  modificationDate?: Date;
  pageCount: number;
}

export interface ImageToPdfOptions {
  pageSize: 'a4' | 'letter' | 'fit';
  orientation: 'auto' | 'portrait' | 'landscape';
  margin: number;
}

export interface AnnotationItem {
  pageIndex: number;
  drawingDataUrl?: string; // PNG data URL from signature canvas
  textNotes?: {
    text: string;
    xPercent: number; // 0 to 1 relative to page width
    yPercent: number; // 0 to 1 relative to page height
    fontSize: number;
    colorHex: string;
  }[];
}

export interface PdfEncryptionStatus {
  encrypted: boolean;
  algorithm?: 'AES-256' | 'RC4';
  version?: number;
  revision?: number;
  keyLength?: number;
}

export interface PdfProtectOptions {
  ownerPassword?: string;
  algorithm?: 'AES-256' | 'RC4';
  allowPrinting?: boolean;
  allowModifying?: boolean;
  allowCopying?: boolean;
  allowFillingForms?: boolean;
}

async function toUint8Array(fileOrBytes: File | ArrayBuffer | Uint8Array): Promise<Uint8Array> {
  if (fileOrBytes instanceof Uint8Array) {
    return fileOrBytes;
  }
  if (fileOrBytes instanceof ArrayBuffer) {
    return new Uint8Array(fileOrBytes);
  }
  return new Uint8Array(await fileOrBytes.arrayBuffer());
}

/**
 * Inspect whether a PDF has an encryption dictionary without silently bypassing it.
 */
export async function inspectPdfEncryption(
  fileOrBytes: File | ArrayBuffer | Uint8Array
): Promise<PdfEncryptionStatus> {
  const bytes = await toUint8Array(fileOrBytes);
  const { isEncrypted } = await import('@pdfsmaller/pdf-decrypt');
  return await isEncrypted(bytes);
}

/**
 * Decrypt an encrypted PDF with a user-supplied password.
 * Throws InvalidPdfPasswordError if the password is incorrect.
 */
export async function unlockPdfBytes(
  fileOrBytes: File | ArrayBuffer | Uint8Array,
  password: string
): Promise<Uint8Array> {
  const bytes = await toUint8Array(fileOrBytes);
  const { decryptPDF, isEncrypted } = await import('@pdfsmaller/pdf-decrypt');
  const status = await isEncrypted(bytes);
  if (!status.encrypted) {
    return bytes;
  }
  try {
    return await decryptPDF(bytes, password);
  } catch (err: any) {
    const msg = (err?.message || '').toLowerCase();
    if (
      msg.includes('password') ||
      msg.includes('incorrect') ||
      msg.includes('invalid') ||
      msg.includes('key') ||
      msg.includes('auth')
    ) {
      throw new InvalidPdfPasswordError(err?.message || 'Incorrect PDF password.');
    }
    throw err;
  }
}

/**
 * Encrypt a PDF with real AES-256 or RC4 standard security handler in browser memory.
 */
export async function encryptPdfDocument(
  fileOrBytes: File | ArrayBuffer | Uint8Array,
  userPassword: string,
  options?: PdfProtectOptions
): Promise<Uint8Array> {
  const bytes = await toUint8Array(fileOrBytes);
  const { encryptPDF } = await import('@pdfsmaller/pdf-encrypt');
  return await encryptPDF(bytes, userPassword, {
    ownerPassword: options?.ownerPassword || undefined,
    algorithm: options?.algorithm || 'AES-256',
    allowPrinting: options?.allowPrinting ?? true,
    allowModifying: options?.allowModifying ?? false,
    allowCopying: options?.allowCopying ?? true,
    allowFillingForms: options?.allowFillingForms ?? true,
    allowAnnotating: options?.allowModifying ?? false,
    allowExtraction: options?.allowCopying ?? true,
    allowAssembly: options?.allowModifying ?? false,
    allowHighQualityPrint: options?.allowPrinting ?? true,
  });
}

/**
 * Load PDF via pdf-lib without ignoreEncryption so encrypted documents are never silently bypassed.
 */
async function loadPdfLibSafe(fileOrBytes: File | ArrayBuffer | Uint8Array): Promise<PDFDocument> {
  const bytes = await toUint8Array(fileOrBytes);
  try {
    const doc = await PDFDocument.load(bytes);
    if (doc.isEncrypted) {
      throw new PdfPasswordRequiredError();
    }
    return doc;
  } catch (err: any) {
    if (err instanceof PdfPasswordRequiredError) throw err;
    const msg = (err?.message || '').toLowerCase();
    if (err?.name === 'EncryptedPDFError' || msg.includes('encrypted')) {
      throw new PdfPasswordRequiredError();
    }
    throw err;
  }
}

/**
 * Load PDF via PDF.js for rendering
 */
export async function loadPdfJsDocument(
  fileOrBytes: File | ArrayBuffer | Uint8Array,
  password?: string
) {
  let arrayBuffer: ArrayBuffer;
  if (fileOrBytes instanceof File) {
    arrayBuffer = await fileOrBytes.arrayBuffer();
  } else if (fileOrBytes instanceof Uint8Array) {
    arrayBuffer = fileOrBytes.slice().buffer as ArrayBuffer;
  } else {
    arrayBuffer = fileOrBytes;
  }

  const loadingTask = pdfjsLib.getDocument({
    data: arrayBuffer,
    ...(typeof window !== 'undefined'
      ? {
          cMapUrl: '/pdfjs/cmaps/',
          cMapPacked: true,
          standardFontDataUrl: '/pdfjs/standard_fonts/',
        }
      : {}),
    password,
  });

  try {
    return await loadingTask.promise;
  } catch (err: any) {
    if (err?.name === 'PasswordException') {
      if (err?.code === 2) {
        throw new InvalidPdfPasswordError();
      }
      throw new PdfPasswordRequiredError();
    }
    throw err;
  }
}

// Track active render tasks per canvas to avoid concurrent renders and allow clean cancellation
interface CanvasRenderState {
  requestId: number;
  renderTask?: { cancel: () => void; promise: Promise<any> };
}

const canvasRenderStates = new WeakMap<HTMLCanvasElement, CanvasRenderState>();

/**
 * Render a single PDF page onto an HTMLCanvasElement safely.
 * Uses an offscreen work canvas buffer and task tracking to eliminate:
 * "Cannot use the same canvas during multiple render() operations."
 */
export async function renderPdfPageToCanvas(
  pdfDoc: pdfjsLib.PDFDocumentProxy,
  pageNumber: number,
  canvas: HTMLCanvasElement,
  scale = 1.5,
  rotation = 0
): Promise<{ width: number; height: number }> {
  // Cancel any existing render operation on this target canvas
  let state = canvasRenderStates.get(canvas);
  if (!state) {
    state = { requestId: 0 };
    canvasRenderStates.set(canvas, state);
  }
  const currentRequestId = ++state.requestId;
  if (state.renderTask) {
    try {
      state.renderTask.cancel();
    } catch {
      // Ignore cancellation exceptions
    }
  }

  const page = await pdfDoc.getPage(pageNumber);
  const viewport = page.getViewport({ scale, rotation });

  // Use a dedicated work canvas for PDF.js rendering.
  // This guarantees that PDF.js never receives the same canvas for concurrent render operations.
  const workCanvas = document.createElement('canvas');
  workCanvas.width = Math.max(1, Math.floor(viewport.width));
  workCanvas.height = Math.max(1, Math.floor(viewport.height));

  const workContext = workCanvas.getContext('2d');
  if (!workContext) throw new Error('Could not get canvas context');

  workContext.fillStyle = '#ffffff';
  workContext.fillRect(0, 0, workCanvas.width, workCanvas.height);

  const renderContext = {
    canvasContext: workContext,
    viewport: viewport,
  };

  // @ts-expect-error pdfjs typing compatibility
  const renderTask = page.render(renderContext);
  state.renderTask = renderTask;

  try {
    await renderTask.promise;
  } catch (err: any) {
    // If the render was cancelled by a newer request or unmount, exit cleanly
    if (err?.name === 'RenderingCancelledException' || err?.message?.includes('cancelled')) {
      return { width: viewport.width, height: viewport.height };
    }
    throw err;
  }

  // If a newer render request has arrived for this canvas while we were rendering, do not overwrite
  if (state.requestId !== currentRequestId) {
    return { width: viewport.width, height: viewport.height };
  }

  // Blit the rendered buffer to the target canvas in one instantaneous frame
  canvas.width = workCanvas.width;
  canvas.height = workCanvas.height;
  const targetContext = canvas.getContext('2d');
  if (targetContext) {
    targetContext.clearRect(0, 0, canvas.width, canvas.height);
    targetContext.drawImage(workCanvas, 0, 0);
  }

  return { width: viewport.width, height: viewport.height };
}

/**
 * Merge multiple PDF files into one using pdf-lib
 */
export async function mergePdfs(
  files: (File | Uint8Array)[],
  onProgress?: (progress: number) => void,
  signal?: AbortSignal
): Promise<Uint8Array> {
  if (files.length < 2) {
    throw new Error('At least two PDF files are required for merging.');
  }

  const mergedPdf = await PDFDocument.create();
  const total = files.length;

  for (let i = 0; i < total; i++) {
    throwIfAborted(signal);
    const file = files[i];
    const doc = await loadPdfLibSafe(file);
    const copiedPages = await mergedPdf.copyPages(doc, doc.getPageIndices());
    copiedPages.forEach((page) => mergedPdf.addPage(page));

    if (onProgress) {
      onProgress(Math.round(((i + 1) / total) * 100));
    }
  }

  throwIfAborted(signal);
  return await mergedPdf.save({ useObjectStreams: true });
}

/**
 * Split PDF by ranges into separate files
 */
export async function splitPdfByRanges(
  file: File | Uint8Array,
  ranges: { start: number; end: number }[],
  onProgress?: (progress: number) => void,
  customName?: string,
  signal?: AbortSignal
): Promise<{ filename: string; bytes: Uint8Array }[]> {
  throwIfAborted(signal);
  const srcDoc = await loadPdfLibSafe(file);
  const baseName = (file instanceof Uint8Array ? (customName || 'document') : file.name).replace(/\.pdf$/i, '');
  const results: { filename: string; bytes: Uint8Array }[] = [];

  for (let idx = 0; idx < ranges.length; idx++) {
    throwIfAborted(signal);
    const range = ranges[idx];
    const newDoc = await PDFDocument.create();

    // 0-indexed page indices
    const pageIndices: number[] = [];
    for (let p = range.start; p <= range.end; p++) {
      pageIndices.push(p - 1);
    }

    const copiedPages = await newDoc.copyPages(srcDoc, pageIndices);
    copiedPages.forEach((p) => newDoc.addPage(p));

    const bytes = await newDoc.save({ useObjectStreams: true });
    const suffix = range.start === range.end ? `page_${range.start}` : `pages_${range.start}-${range.end}`;
    results.push({
      filename: `${baseName}_${suffix}.pdf`,
      bytes,
    });

    if (onProgress) {
      onProgress(Math.round(((idx + 1) / ranges.length) * 100));
    }
  }

  return results;
}

/**
 * Split every single page into separate PDF
 */
export async function splitPdfEveryPage(
  file: File | Uint8Array,
  onProgress?: (progress: number) => void,
  customName?: string,
  signal?: AbortSignal
): Promise<{ filename: string; bytes: Uint8Array }[]> {
  throwIfAborted(signal);
  const srcDoc = await loadPdfLibSafe(file);
  const totalPages = srcDoc.getPageCount();
  const baseName = (file instanceof Uint8Array ? (customName || 'document') : file.name).replace(/\.pdf$/i, '');
  const results: { filename: string; bytes: Uint8Array }[] = [];

  for (let i = 0; i < totalPages; i++) {
    throwIfAborted(signal);
    const newDoc = await PDFDocument.create();
    const [copiedPage] = await newDoc.copyPages(srcDoc, [i]);
    newDoc.addPage(copiedPage);

    const bytes = await newDoc.save({ useObjectStreams: true });
    results.push({
      filename: `${baseName}_page_${i + 1}.pdf`,
      bytes,
    });

    if (onProgress) {
      onProgress(Math.round(((i + 1) / totalPages) * 100));
    }
  }

  return results;
}

/**
 * Convert Images (PNG, JPG, WebP) to a unified PDF
 */
export async function imagesToPdf(
  images: { file: File; dataUrl: string }[],
  options: ImageToPdfOptions,
  onProgress?: (progress: number) => void,
  signal?: AbortSignal
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const standardSizes = {
    a4: { width: 595.28, height: 841.89 },
    letter: { width: 612.0, height: 792.0 },
  };

  const total = images.length;
  for (let i = 0; i < total; i++) {
    throwIfAborted(signal);
    const item = images[i];
    const imageBytes = await item.file.arrayBuffer();

    let embeddedImage;
    if (item.file.type === 'image/png') {
      embeddedImage = await pdfDoc.embedPng(imageBytes);
    } else {
      // JPEG or WebP converted to JPEG in canvas if needed
      try {
        embeddedImage = await pdfDoc.embedJpg(imageBytes);
      } catch {
        // Fallback: draw image on an offscreen canvas and convert to JPEG
        const img = new Image();
        img.src = item.dataUrl;
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
        });
        const offscreenCanvas = document.createElement('canvas');
        offscreenCanvas.width = img.naturalWidth || img.width;
        offscreenCanvas.height = img.naturalHeight || img.height;
        const ctx = offscreenCanvas.getContext('2d')!;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, offscreenCanvas.width, offscreenCanvas.height);
        ctx.drawImage(img, 0, 0);
        const jpegBlob = await new Promise<Blob>((res) =>
          offscreenCanvas.toBlob((b) => res(b!), 'image/jpeg', 0.92)
        );
        const fallbackBytes = await jpegBlob.arrayBuffer();
        embeddedImage = await pdfDoc.embedJpg(fallbackBytes);
      }
    }

    const { width: imgWidth, height: imgHeight } = embeddedImage;
    let pageWidth = imgWidth;
    let pageHeight = imgHeight;

    if (options.pageSize !== 'fit') {
      const base = standardSizes[options.pageSize];
      const isLandscape =
        options.orientation === 'landscape' ||
        (options.orientation === 'auto' && imgWidth > imgHeight);

      pageWidth = isLandscape ? base.height : base.width;
      pageHeight = isLandscape ? base.width : base.height;
    }

    const margin = options.margin || 0;
    const printableWidth = Math.max(pageWidth - margin * 2, 10);
    const printableHeight = Math.max(pageHeight - margin * 2, 10);

    // Calculate aspect ratio fitting
    const scale = Math.min(printableWidth / imgWidth, printableHeight / imgHeight);
    const renderWidth = imgWidth * scale;
    const renderHeight = imgHeight * scale;

    const x = margin + (printableWidth - renderWidth) / 2;
    const y = margin + (printableHeight - renderHeight) / 2;

    const page = pdfDoc.addPage([pageWidth, pageHeight]);
    page.drawImage(embeddedImage, {
      x,
      y,
      width: renderWidth,
      height: renderHeight,
    });

    if (onProgress) {
      onProgress(Math.round(((i + 1) / total) * 100));
    }
  }

  throwIfAborted(signal);
  return await pdfDoc.save();
}

export type CompressionMode = 'structure' | 'raster';

export interface CompressionResult {
  bytes: Uint8Array;
  originalSize: number;
  compressedSize: number;
  mode: CompressionMode;
  sizeChangeBytes: number;
  sizeChangePercent: number;
  increased: boolean;
}

/**
 * PDF Compression with distinct modes:
 * 1. 'structure': Lossless structural & object stream optimization. Preserves all vector text, fonts, links, and forms.
 * 2. 'raster': Aggressive rasterization into compressed JPEG images. Converts pages into bitmaps (loses searchable text and links).
 * Accurately calculates before & after size, even if the size increases.
 */
export async function compressPdfInBrowser(
  file: File | Uint8Array,
  mode: CompressionMode = 'structure',
  rasterLevel: 'low' | 'medium' | 'high' = 'medium',
  onProgress?: (progress: number) => void,
  signal?: AbortSignal
): Promise<CompressionResult> {
  throwIfAborted(signal);
  const originalSize = file instanceof Uint8Array ? file.byteLength : file.size;

  if (mode === 'structure') {
    if (onProgress) onProgress(20);
    const pdfDoc = await loadPdfLibSafe(file);
    throwIfAborted(signal);
    if (onProgress) onProgress(60);

    const bytes = await pdfDoc.save({
      useObjectStreams: true,
      addDefaultPage: false,
      objectsPerTick: 50,
    });
    if (onProgress) onProgress(100);

    const compressedSize = bytes.length;
    const diff = compressedSize - originalSize;
    const pct = originalSize > 0 ? Math.round((Math.abs(diff) / originalSize) * 100) : 0;

    return {
      bytes,
      originalSize,
      compressedSize,
      mode: 'structure',
      sizeChangeBytes: diff,
      sizeChangePercent: pct,
      increased: diff > 0,
    };
  }

  // Raster mode
  const pdfJsDoc = await loadPdfJsDocument(file);
  try {
    const totalPages = pdfJsDoc.numPages;

    const settings = {
      low: { scale: 1.5, quality: 0.85 },    // ~150 DPI
      medium: { scale: 1.0, quality: 0.72 }, // ~100 DPI
      high: { scale: 0.75, quality: 0.58 },  // ~72 DPI
    }[rasterLevel];

    const newDoc = await PDFDocument.create();

    for (let i = 1; i <= totalPages; i++) {
      throwIfAborted(signal);
      const page = await pdfJsDoc.getPage(i);
      const viewport = page.getViewport({ scale: settings.scale });

      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        page.cleanup();
        continue;
      }

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // @ts-expect-error pdfjs typing
      await page.render({ canvasContext: ctx, viewport }).promise;

      const jpegBlob = await new Promise<Blob>((res) =>
        canvas.toBlob((b) => res(b!), 'image/jpeg', settings.quality)
      );
      const jpegBytes = await jpegBlob.arrayBuffer();
      const embeddedImg = await newDoc.embedJpg(jpegBytes);

      // Original unscaled page dimensions
      const origViewport = page.getViewport({ scale: 1 });
      const pdfPage = newDoc.addPage([origViewport.width, origViewport.height]);

      pdfPage.drawImage(embeddedImg, {
        x: 0,
        y: 0,
        width: origViewport.width,
        height: origViewport.height,
      });

      page.cleanup();

      if (onProgress) {
        onProgress(Math.round((i / totalPages) * 100));
      }
    }

    throwIfAborted(signal);
    const bytes = await newDoc.save({ useObjectStreams: true });
    const compressedSize = bytes.length;
    const diff = compressedSize - originalSize;
    const pct = originalSize > 0 ? Math.round((Math.abs(diff) / originalSize) * 100) : 0;

    return {
      bytes,
      originalSize,
      compressedSize,
      mode: 'raster',
      sizeChangeBytes: diff,
      sizeChangePercent: pct,
      increased: diff > 0,
    };
  } finally {
    await pdfJsDoc.loadingTask?.destroy().catch(() => {});
  }
}

/**
 * Render all pages of a PDF to high-resolution images (PNG or JPEG)
 */
export async function renderAllPagesToImages(
  file: File,
  format: 'image/png' | 'image/jpeg',
  scale = 1.5,
  onProgress?: (progress: number) => void,
  signal?: AbortSignal
): Promise<{ pageNumber: number; blob: Blob; filename: string }[]> {
  throwIfAborted(signal);
  const pdfDoc = await loadPdfJsDocument(file);
  try {
    const totalPages = pdfDoc.numPages;
    const baseName = file.name.replace(/\.pdf$/i, '');
    const ext = format === 'image/png' ? 'png' : 'jpg';
    const results: { pageNumber: number; blob: Blob; filename: string }[] = [];

    for (let i = 1; i <= totalPages; i++) {
      throwIfAborted(signal);
      const page = await pdfDoc.getPage(i);
      const viewport = page.getViewport({ scale });
      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // @ts-expect-error pdfjs typing
      await page.render({ canvasContext: ctx, viewport }).promise;

      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => resolve(b!), format, format === 'image/jpeg' ? 0.9 : 1.0);
      });

      page.cleanup();

      results.push({
        pageNumber: i,
        blob,
        filename: `${baseName}_page_${i}.${ext}`,
      });

      if (onProgress) {
        onProgress(Math.round((i / totalPages) * 100));
      }
    }

    return results;
  } finally {
    await pdfDoc.loadingTask?.destroy().catch(() => {});
  }
}

/**
 * Embed Annotations & Signature into PDF byte stream
 */
export async function annotatePdf(
  file: File,
  annotations: AnnotationItem[]
): Promise<Uint8Array> {
  const pdfDoc = await loadPdfLibSafe(file);
  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const pages = pdfDoc.getPages();

  for (const item of annotations) {
    if (item.pageIndex < 0 || item.pageIndex >= pages.length) continue;
    const page = pages[item.pageIndex];
    const { width: pWidth, height: pHeight } = page.getSize();

    // 1. Embed Drawing / Signature overlay if present
    if (item.drawingDataUrl) {
      try {
        const pngImage = await pdfDoc.embedPng(item.drawingDataUrl);
        page.drawImage(pngImage, {
          x: 0,
          y: 0,
          width: pWidth,
          height: pHeight,
        });
      } catch (err) {
        console.error('Failed to embed drawing overlay:', err);
      }
    }

    // 2. Embed Text notes if present
    if (item.textNotes && item.textNotes.length > 0) {
      for (const textNote of item.textNotes) {
        if (!textNote.text.trim()) continue;

        // Convert percentage coordinate to PDF page coordinates
        // PDF coordinate origin (0,0) is bottom-left
        const x = textNote.xPercent * pWidth;
        const y = (1 - textNote.yPercent) * pHeight - (textNote.fontSize || 16);

        // Parse hex color into RGB
        let r = 0.9;
        let g = 0.1;
        let b = 0.1;
        if (textNote.colorHex && textNote.colorHex.startsWith('#')) {
          const hex = textNote.colorHex.replace('#', '');
          if (hex.length === 6) {
            r = parseInt(hex.substring(0, 2), 16) / 255;
            g = parseInt(hex.substring(2, 4), 16) / 255;
            b = parseInt(hex.substring(4, 6), 16) / 255;
          }
        }

        page.drawText(textNote.text, {
          x: Math.max(10, Math.min(x, pWidth - 100)),
          y: Math.max(10, Math.min(y, pHeight - 30)),
          size: textNote.fontSize || 14,
          font,
          color: rgb(r, g, b),
        });
      }
    }
  }

  return await pdfDoc.save();
}

/**
 * Get and update PDF metadata
 */
export async function inspectAndSanitizeMetadata(
  file: File | Uint8Array,
  newMetadata?: Partial<PdfMetadata>
): Promise<{ current: PdfMetadata; updatedBytes?: Uint8Array }> {
  const pdfDoc = await loadPdfLibSafe(file);

  const current: PdfMetadata = {
    title: pdfDoc.getTitle() || '',
    author: pdfDoc.getAuthor() || '',
    subject: pdfDoc.getSubject() || '',
    keywords: pdfDoc.getKeywords()
      ? pdfDoc
          .getKeywords()!
          .split(/[,;\s]+/)
          .map((s) => s.trim())
          .filter(Boolean)
      : [],
    creator: pdfDoc.getCreator() || '',
    producer: pdfDoc.getProducer() || '',
    creationDate: pdfDoc.getCreationDate(),
    modificationDate: pdfDoc.getModificationDate(),
    pageCount: pdfDoc.getPageCount(),
  };

  if (newMetadata) {
    if (newMetadata.title !== undefined) pdfDoc.setTitle(newMetadata.title);
    if (newMetadata.author !== undefined) pdfDoc.setAuthor(newMetadata.author);
    if (newMetadata.subject !== undefined) pdfDoc.setSubject(newMetadata.subject);
    if (newMetadata.keywords !== undefined) pdfDoc.setKeywords(newMetadata.keywords);
    if (newMetadata.creator !== undefined) pdfDoc.setCreator(newMetadata.creator);
    if (newMetadata.producer !== undefined) pdfDoc.setProducer(newMetadata.producer);
    pdfDoc.setModificationDate(new Date());

    const updatedBytes = await pdfDoc.save();
    return { current, updatedBytes };
  }

  return { current };
}

export interface PageNumberOptions {
  position: 'bottom-center' | 'bottom-right' | 'bottom-left' | 'top-right' | 'top-center';
  format: 'page_x_of_y' | 'x_of_y' | 'number_only';
  skipFirst: boolean;
  fontSize: number;
  colorHex: string;
}

export interface WatermarkOptions {
  type: 'text' | 'image';
  text?: string;
  imageDataUrl?: string;
  opacity: number;
  rotationDegrees: number;
  fontSize: number;
  colorHex: string;
}

/**
 * Reorder, rotate, or delete specific pages of a PDF
 */
export async function organizePdfPages(
  file: File,
  pageOrder: number[], // 1-based page numbers in desired order
  rotations: Map<number, number> // 1-based page -> extra rotation (0, 90, 180, 270)
): Promise<Uint8Array> {
  const srcDoc = await loadPdfLibSafe(file);
  const newDoc = await PDFDocument.create();

  // 0-indexed indices to copy
  const pageIndices = pageOrder.map((p) => p - 1);
  const copiedPages = await newDoc.copyPages(srcDoc, pageIndices);

  for (let i = 0; i < copiedPages.length; i++) {
    const page = copiedPages[i];
    const originalPageNum = pageOrder[i];
    const extraRotation = rotations.get(originalPageNum) || 0;

    if (extraRotation !== 0) {
      const currentRot = page.getRotation().angle;
      page.setRotation(degrees((currentRot + extraRotation) % 360));
    }
    newDoc.addPage(page);
  }

  return await newDoc.save();
}

/**
 * Add page numbers to document pages
 */
export async function addPageNumbersToPdf(
  file: File,
  options: PageNumberOptions
): Promise<Uint8Array> {
  const pdfDoc = await loadPdfLibSafe(file);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const pages = pdfDoc.getPages();
  const total = pages.length;

  // Parse color
  let r = 0.3;
  let g = 0.3;
  let b = 0.3;
  if (options.colorHex?.startsWith('#') && options.colorHex.length === 7) {
    r = parseInt(options.colorHex.substring(1, 3), 16) / 255;
    g = parseInt(options.colorHex.substring(3, 5), 16) / 255;
    b = parseInt(options.colorHex.substring(5, 7), 16) / 255;
  }

  for (let idx = 0; idx < total; idx++) {
    if (options.skipFirst && idx === 0) continue;

    const pageNum = idx + 1;
    const page = pages[idx];
    const { width, height } = page.getSize();

    let text = `${pageNum}`;
    if (options.format === 'page_x_of_y') {
      text = `Page ${pageNum} of ${total}`;
    } else if (options.format === 'x_of_y') {
      text = `${pageNum} / ${total}`;
    }

    const textWidth = font.widthOfTextAtSize(text, options.fontSize);
    let x = (width - textWidth) / 2;
    let y = 25;

    if (options.position === 'bottom-right') {
      x = width - textWidth - 30;
      y = 25;
    } else if (options.position === 'bottom-left') {
      x = 30;
      y = 25;
    } else if (options.position === 'top-center') {
      x = (width - textWidth) / 2;
      y = height - 30;
    } else if (options.position === 'top-right') {
      x = width - textWidth - 30;
      y = height - 30;
    }

    page.drawText(text, {
      x,
      y,
      size: options.fontSize,
      font,
      color: rgb(r, g, b),
    });
  }

  return await pdfDoc.save();
}

/**
 * Add text or image watermark across all pages
 */
export async function addWatermarkToPdf(
  file: File,
  options: WatermarkOptions
): Promise<Uint8Array> {
  const pdfDoc = await loadPdfLibSafe(file);
  const pages = pdfDoc.getPages();

  let embeddedImage;
  if (options.type === 'image' && options.imageDataUrl) {
    try {
      if (options.imageDataUrl.includes('png')) {
        embeddedImage = await pdfDoc.embedPng(options.imageDataUrl);
      } else {
        embeddedImage = await pdfDoc.embedJpg(options.imageDataUrl);
      }
    } catch (e) {
      console.error('Failed to embed watermark image:', e);
    }
  }

  let font;
  let r = 0.8;
  let g = 0.2;
  let b = 0.2;
  if (options.type === 'text') {
    font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    if (options.colorHex?.startsWith('#') && options.colorHex.length === 7) {
      r = parseInt(options.colorHex.substring(1, 3), 16) / 255;
      g = parseInt(options.colorHex.substring(3, 5), 16) / 255;
      b = parseInt(options.colorHex.substring(5, 7), 16) / 255;
    }
  }

  for (const page of pages) {
    const { width, height } = page.getSize();

    if (options.type === 'image' && embeddedImage) {
      const imgWidth = Math.min(width * 0.6, embeddedImage.width);
      const imgHeight = (imgWidth / embeddedImage.width) * embeddedImage.height;
      const x = (width - imgWidth) / 2;
      const y = (height - imgHeight) / 2;

      page.drawImage(embeddedImage, {
        x,
        y,
        width: imgWidth,
        height: imgHeight,
        opacity: options.opacity || 0.3,
        rotate: degrees(options.rotationDegrees || 0),
      });
    } else if (options.type === 'text' && options.text && font) {
      const textWidth = font.widthOfTextAtSize(options.text, options.fontSize);
      const textHeight = font.heightAtSize(options.fontSize);

      // Center the text
      const x = (width - textWidth) / 2;
      const y = (height - textHeight) / 2;

      page.drawText(options.text, {
        x,
        y,
        size: options.fontSize,
        font,
        color: rgb(r, g, b),
        opacity: options.opacity || 0.25,
        rotate: degrees(options.rotationDegrees || 45),
      });
    }
  }

  return await pdfDoc.save();
}

/**
 * Crop excess outer margins from all pages in PDF
 */
export async function cropPdfMargins(
  file: File,
  marginPt: number
): Promise<Uint8Array> {
  const pdfDoc = await loadPdfLibSafe(file);
  const pages = pdfDoc.getPages();

  for (const page of pages) {
    const { width, height } = page.getSize();
    if (width > marginPt * 2 + 50 && height > marginPt * 2 + 50) {
      page.setCropBox(
        marginPt,
        marginPt,
        width - marginPt * 2,
        height - marginPt * 2
      );
    }
  }

  return await pdfDoc.save();
}

export interface RedactionRect {
  x: number;
  y: number;
  width: number;
  height: number;
  xRatio?: number;
  yRatio?: number;
  widthRatio?: number;
  heightRatio?: number;
  color: 'black' | 'white';
}

export interface PageRedaction {
  pageIndex: number;
  rects: RedactionRect[];
}

/**
 * True Redaction: Completely and irreversibly sanitizes sensitive page data.
 * Redacted pages are rendered to high-resolution bitmaps with solid blackout/whiteout boxes
 * burned into the pixel buffer, and re-embedded into the PDF document with ZERO underlying
 * text streams, glyphs, font descriptors, or hidden vector layers.
 * Unredacted pages are preserved losslessly to keep crisp text and bookmarks.
 */
export async function redactPdf(
  file: File | Uint8Array,
  redactions: PageRedaction[],
  options?: {
    scale?: number;
    flattenAllPages?: boolean;
    onProgress?: (progress: number) => void;
    signal?: AbortSignal;
  }
): Promise<Uint8Array> {
  throwIfAborted(options?.signal);
  const sourcePdfDoc = await loadPdfLibSafe(file);
  const totalPages = sourcePdfDoc.getPageCount();

  const redactionsByPage = new Map<number, RedactionRect[]>();
  for (const item of redactions) {
    if (item.rects && item.rects.length > 0) {
      redactionsByPage.set(item.pageIndex, item.rects);
    }
  }

  if (redactionsByPage.size === 0 && !options?.flattenAllPages) {
    throw new Error('No redaction areas specified. Please mark at least one area to redact.');
  }

  const newDoc = await PDFDocument.create();

  // Check if browser environment with Canvas and PDF.js is available
  const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';

  if (isBrowser) {
    const pdfJsDoc = await loadPdfJsDocument(file);
    try {
      const renderScale = options?.scale || 2.0; // High resolution ~150-200 DPI

      for (let i = 1; i <= totalPages; i++) {
        throwIfAborted(options?.signal);
        const pageIndex = i - 1;
        const rects = redactionsByPage.get(pageIndex);
        const shouldSanitize = !!rects || options?.flattenAllPages;

        if (shouldSanitize) {
          const jsPage = await pdfJsDoc.getPage(i);
          const viewport = jsPage.getViewport({ scale: renderScale });
          const canvas = document.createElement('canvas');
          canvas.width = Math.round(viewport.width);
          canvas.height = Math.round(viewport.height);
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            jsPage.cleanup();
            continue;
          }

          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Render page visually
          // @ts-expect-error pdfjs typing
          await jsPage.render({ canvasContext: ctx, viewport }).promise;

          // Permanently burn blackout or whiteout boxes directly onto the pixel canvas
          if (rects) {
            for (const rect of rects) {
              ctx.fillStyle = rect.color === 'white' ? '#ffffff' : '#000000';
              let bx: number, by: number, bw: number, bh: number;
              if (
                rect.xRatio !== undefined &&
                rect.yRatio !== undefined &&
                rect.widthRatio !== undefined &&
                rect.heightRatio !== undefined
              ) {
                bx = rect.xRatio * canvas.width;
                by = rect.yRatio * canvas.height;
                bw = rect.widthRatio * canvas.width;
                bh = rect.heightRatio * canvas.height;
              } else {
                const origPage = sourcePdfDoc.getPage(pageIndex);
                const pw = origPage.getWidth();
                const ph = origPage.getHeight();
                bx = (rect.x / pw) * canvas.width;
                bw = (rect.width / pw) * canvas.width;
                by = ((ph - rect.y - rect.height) / ph) * canvas.height;
                bh = (rect.height / ph) * canvas.height;
              }
              ctx.fillRect(bx, by, bw, bh);
            }
          }

          // Export flattened image
          const imgBlob = await new Promise<Blob>((res) =>
            canvas.toBlob((b) => res(b!), 'image/jpeg', 0.95)
          );
          const imgBytes = await imgBlob.arrayBuffer();
          const embeddedImg = await newDoc.embedJpg(imgBytes);

          const origPage = sourcePdfDoc.getPage(pageIndex);
          const origWidth = origPage.getWidth();
          const origHeight = origPage.getHeight();
          const newPage = newDoc.addPage([origWidth, origHeight]);
          newPage.drawImage(embeddedImg, {
            x: 0,
            y: 0,
            width: origWidth,
            height: origHeight,
          });
          jsPage.cleanup();
        } else {
          // Unredacted pages are copied losslessly, keeping crisp text, links and vector paths
          const [copied] = await newDoc.copyPages(sourcePdfDoc, [pageIndex]);
          newDoc.addPage(copied);
        }

        if (options?.onProgress) {
          options.onProgress(Math.round((i / totalPages) * 100));
        }
      }
    } finally {
      await pdfJsDoc.loadingTask?.destroy().catch(() => {});
    }
  } else {
    // Node.js / Unit test fallback:
    // Sanitize redacted pages by removing their /Contents streams completely
    // so no underlying text or sensitive streams remain in the file.
    for (let i = 0; i < totalPages; i++) {
      throwIfAborted(options?.signal);
      const rects = redactionsByPage.get(i);
      if (rects && rects.length > 0) {
        const origPage = sourcePdfDoc.getPage(i);
        const pw = origPage.getWidth();
        const ph = origPage.getHeight();
        const cleanPage = newDoc.addPage([pw, ph]);
        for (const r of rects) {
          const fillColor = r.color === 'white' ? rgb(1, 1, 1) : rgb(0, 0, 0);
          cleanPage.drawRectangle({
            x: r.x,
            y: r.y,
            width: r.width,
            height: r.height,
            color: fillColor,
            opacity: 1.0,
          });
        }
      } else {
        const [copied] = await newDoc.copyPages(sourcePdfDoc, [i]);
        newDoc.addPage(copied);
      }
    }
  }

  throwIfAborted(options?.signal);
  return await newDoc.save({ useObjectStreams: true });
}

/**
 * Flatten interactive form fields and annotations into static page content
 */
export async function flattenPdf(file: File): Promise<Uint8Array> {
  const pdfDoc = await loadPdfLibSafe(file);
  try {
    const form = pdfDoc.getForm();
    form.flatten();
  } catch (err) {
    console.warn('No form fields found to flatten, saving standard document', err);
  }
  return await pdfDoc.save();
}

export interface FormFieldInfo {
  name: string;
  type: 'text' | 'checkbox' | 'dropdown' | 'other';
  currentValue: string | boolean;
  options?: string[];
}

/**
 * Inspect AcroForm fields
 */
export async function inspectPdfFormFields(file: File): Promise<FormFieldInfo[]> {
  const pdfDoc = await loadPdfLibSafe(file);
  const fieldsInfo: FormFieldInfo[] = [];

  try {
    const form = pdfDoc.getForm();
    const fields = form.getFields();

    for (const f of fields) {
      const name = f.getName();
      const constructorName = f.constructor.name;

      if (constructorName.includes('CheckBox')) {
        // @ts-expect-error pdf-lib typing
        const isChecked = f.isChecked ? f.isChecked() : false;
        fieldsInfo.push({ name, type: 'checkbox', currentValue: isChecked });
      } else if (constructorName.includes('Dropdown') || constructorName.includes('OptionList')) {
        // @ts-expect-error pdf-lib typing
        const selected = f.getSelected ? f.getSelected() : [];
        // @ts-expect-error pdf-lib typing
        const options = f.getOptions ? f.getOptions() : [];
        fieldsInfo.push({
          name,
          type: 'dropdown',
          currentValue: selected[0] || '',
          options,
        });
      } else if (constructorName.includes('TextField')) {
        // @ts-expect-error pdf-lib typing
        const text = f.getText ? f.getText() || '' : '';
        fieldsInfo.push({ name, type: 'text', currentValue: text });
      } else {
        fieldsInfo.push({ name, type: 'other', currentValue: '' });
      }
    }
  } catch (err) {
    console.warn('Form reading exception:', err);
  }

  return fieldsInfo;
}

/**
 * Fill interactive AcroForm fields
 */
export async function fillPdfFormFields(
  file: File,
  values: Record<string, string | boolean>
): Promise<Uint8Array> {
  const pdfDoc = await loadPdfLibSafe(file);

  try {
    const form = pdfDoc.getForm();
    for (const [fieldName, val] of Object.entries(values)) {
      try {
        const field = form.getField(fieldName);
        if (!field) continue;

        if (typeof val === 'boolean') {
          // @ts-expect-error pdf-lib
          if (val && field.check) field.check();
          // @ts-expect-error pdf-lib
          else if (!val && field.uncheck) field.uncheck();
        } else if (typeof val === 'string') {
          // @ts-expect-error pdf-lib
          if (field.setText) field.setText(val);
          // @ts-expect-error pdf-lib
          else if (field.select) field.select(val);
        }
      } catch (e) {
        console.warn(`Could not set field ${fieldName}:`, e);
      }
    }
  } catch (err) {
    console.warn('Form fill exception:', err);
  }

  return await pdfDoc.save();
}

export interface HeaderFooterOptions {
  topLeft?: string;
  topCenter?: string;
  topRight?: string;
  bottomLeft?: string;
  bottomCenter?: string;
  bottomRight?: string;
  fontSize?: number;
  colorHex?: string;
}

/**
 * Add professional running header and footer across all pages
 */
export async function addHeaderAndFooterToPdf(
  file: File,
  options: HeaderFooterOptions
): Promise<Uint8Array> {
  const pdfDoc = await loadPdfLibSafe(file);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const pages = pdfDoc.getPages();
  const total = pages.length;
  const size = options.fontSize || 9;

  let r = 0.35;
  let g = 0.35;
  let b = 0.35;
  if (options.colorHex?.startsWith('#') && options.colorHex.length === 7) {
    r = parseInt(options.colorHex.substring(1, 3), 16) / 255;
    g = parseInt(options.colorHex.substring(3, 5), 16) / 255;
    b = parseInt(options.colorHex.substring(5, 7), 16) / 255;
  }
  const color = rgb(r, g, b);

  for (let i = 0; i < total; i++) {
    const page = pages[i];
    const { width, height } = page.getSize();
    const pageNum = i + 1;

    const resolveDynamic = (str?: string) => {
      if (!str) return '';
      return str
        .replace(/{page}/g, `${pageNum}`)
        .replace(/{total}/g, `${total}`)
        .replace(/{date}/g, new Date().toLocaleDateString());
    };

    const tl = resolveDynamic(options.topLeft);
    const tc = resolveDynamic(options.topCenter);
    const tr = resolveDynamic(options.topRight);
    const bl = resolveDynamic(options.bottomLeft);
    const bc = resolveDynamic(options.bottomCenter);
    const br = resolveDynamic(options.bottomRight);

    const topY = height - 25;
    const bottomY = 20;

    if (tl) page.drawText(tl, { x: 30, y: topY, size, font, color });
    if (tc) {
      const w = font.widthOfTextAtSize(tc, size);
      page.drawText(tc, { x: (width - w) / 2, y: topY, size, font, color });
    }
    if (tr) {
      const w = font.widthOfTextAtSize(tr, size);
      page.drawText(tr, { x: width - w - 30, y: topY, size, font, color });
    }

    if (bl) page.drawText(bl, { x: 30, y: bottomY, size, font, color });
    if (bc) {
      const w = font.widthOfTextAtSize(bc, size);
      page.drawText(bc, { x: (width - w) / 2, y: bottomY, size, font, color });
    }
    if (br) {
      const w = font.widthOfTextAtSize(br, size);
      page.drawText(br, { x: width - w - 30, y: bottomY, size, font, color });
    }
  }

  return await pdfDoc.save();
}

export interface ExtractedImageItem {
  filename: string;
  blob: Blob;
  mimeType: string;
  width?: number;
  height?: number;
  pageNumber?: number;
}

function pdfDecodedImageToCanvas(img: any): HTMLCanvasElement | null {
  if (!img) return null;

  // Case 1: ImageBitmap directly or wrapped in { bitmap }
  const bitmap: ImageBitmap | undefined =
    typeof ImageBitmap !== 'undefined' && img instanceof ImageBitmap
      ? img
      : typeof ImageBitmap !== 'undefined' && img?.bitmap instanceof ImageBitmap
      ? img.bitmap
      : undefined;

  if (bitmap && bitmap.width > 0 && bitmap.height > 0) {
    const canvas = document.createElement('canvas');
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(bitmap, 0, 0);
    return canvas;
  }

  // Case 2: Raw pixel buffer { data, width, height, kind }
  const width = Number(img.width || 0);
  const height = Number(img.height || 0);
  const data = img.data as Uint8ClampedArray | Uint8Array | undefined;
  if (!data || width <= 0 || height <= 0) return null;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const rgba = new Uint8ClampedArray(width * height * 4);
  const pixelCount = width * height;

  if (img.kind === pdfjsLib.ImageKind.RGBA_32BPP || data.length === pixelCount * 4) {
    rgba.set(data.subarray(0, pixelCount * 4));
  } else if (img.kind === pdfjsLib.ImageKind.RGB_24BPP || data.length === pixelCount * 3) {
    for (let p = 0, s = 0, d = 0; p < pixelCount; p++, s += 3, d += 4) {
      rgba[d] = data[s];
      rgba[d + 1] = data[s + 1];
      rgba[d + 2] = data[s + 2];
      rgba[d + 3] = 255;
    }
  } else if (img.kind === pdfjsLib.ImageKind.GRAYSCALE_1BPP) {
    const rowBytes = Math.ceil(width / 8);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const byteIdx = y * rowBytes + (x >> 3);
        const bit = (data[byteIdx] >> (7 - (x & 7))) & 1;
        const val = bit ? 255 : 0;
        const dst = (y * width + x) * 4;
        rgba[dst] = val;
        rgba[dst + 1] = val;
        rgba[dst + 2] = val;
        rgba[dst + 3] = 255;
      }
    }
  } else {
    return null;
  }

  const imageData = new ImageData(rgba, width, height);
  ctx.putImageData(imageData, 0, 0);
  return canvas;
}

/**
 * Extract real embedded raster images from a PDF (without capturing full pages).
 * Returns an empty array if the PDF contains only text/vectors and no embedded raster graphics.
 */
export async function extractEmbeddedImages(
  file: File | Uint8Array,
  onProgress?: (pct: number) => void,
  customName?: string,
  signal?: AbortSignal
): Promise<ExtractedImageItem[]> {
  throwIfAborted(signal);
  const baseName = (file instanceof Uint8Array ? (customName || 'document') : file.name).replace(/\.pdf$/i, '');

  // Step 1: Inspect XObject streams via pdf-lib (collect mask refs to exclude alpha masks)
  const pdfLibDoc = await loadPdfLibSafe(file);
  const maskRefs = new Set<string>();
  const imageXObjects: {
    refKey: string;
    stream: PDFRawStream;
    isCleanJpeg: boolean;
    width: number;
    height: number;
  }[] = [];

  for (const [, obj] of pdfLibDoc.context.enumerateIndirectObjects()) {
    if (obj instanceof PDFRawStream) {
      const subtype = obj.dict.get(PDFName.of('Subtype'));
      if (subtype === PDFName.of('Image')) {
        const smask = obj.dict.get(PDFName.of('SMask'));
        const mask = obj.dict.get(PDFName.of('Mask'));
        if (smask) maskRefs.add(smask.toString());
        if (mask && !(mask instanceof PDFArray)) maskRefs.add(mask.toString());
      }
    }
  }

  for (const [ref, obj] of pdfLibDoc.context.enumerateIndirectObjects()) {
    const refKey = ref.toString();
    if (maskRefs.has(refKey)) continue;
    if (obj instanceof PDFRawStream) {
      const subtype = obj.dict.get(PDFName.of('Subtype'));
      if (subtype !== PDFName.of('Image')) continue;

      const filter = obj.dict.get(PDFName.of('Filter'));
      const smask = obj.dict.get(PDFName.of('SMask'));
      const mask = obj.dict.get(PDFName.of('Mask'));
      const decode = obj.dict.get(PDFName.of('Decode'));
      const colorSpace = obj.dict.get(PDFName.of('ColorSpace'));

      const wObj = obj.dict.get(PDFName.of('Width'));
      const hObj = obj.dict.get(PDFName.of('Height'));
      const width = wObj instanceof PDFNumber ? wObj.asNumber() : 0;
      const height = hObj instanceof PDFNumber ? hObj.asNumber() : 0;

      const isDct =
        filter === PDFName.of('DCTDecode') ||
        (filter instanceof PDFArray && filter.size() === 1 && filter.get(0) === PDFName.of('DCTDecode'));
      const isCmyk = colorSpace === PDFName.of('DeviceCMYK');
      const isCleanJpeg = Boolean(isDct && !smask && !mask && !decode && !isCmyk);

      imageXObjects.push({
        refKey,
        stream: obj,
        isCleanJpeg,
        width,
        height,
      });
    }
  }

  const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';

  // Node.js / test environment path
  if (!isBrowser) {
    if (onProgress) onProgress(100);
    return imageXObjects.map((item, idx) => {
      const mimeType = item.isCleanJpeg ? 'image/jpeg' : 'image/png';
      const ext = item.isCleanJpeg ? 'jpg' : 'png';
      return {
        filename: `${baseName}_image_${idx + 1}.${ext}`,
        blob: new Blob([item.stream.contents as unknown as BlobPart], { type: mimeType }),
        mimeType,
        width: item.width,
        height: item.height,
      };
    });
  }

  // Browser path: fast lossless extraction if every image in the PDF is a clean JPEG (no inline images needed if none exist)
  const pdfJsDoc = await loadPdfJsDocument(file);
  try {
    const total = pdfJsDoc.numPages;

    // Scan operator lists per page to detect both XObject and inline images
    let hasInlineImages = false;
    const pageImageOps: {
      pageNumber: number;
      page: pdfjsLib.PDFPageProxy;
      xObjectNames: string[];
      inlineImages: any[];
    }[] = [];

    for (let i = 1; i <= total; i++) {
      throwIfAborted(signal);
      const page = await pdfJsDoc.getPage(i);
      const opList = await page.getOperatorList();
      const xObjectNames: string[] = [];
      const inlineImages: any[] = [];

      for (let k = 0; k < opList.fnArray.length; k++) {
        const fn = opList.fnArray[k];
        const args = opList.argsArray[k];
        if (
          (fn === pdfjsLib.OPS.paintImageXObject || fn === pdfjsLib.OPS.paintImageXObjectRepeat) &&
          typeof args?.[0] === 'string'
        ) {
          if (!xObjectNames.includes(args[0])) {
            xObjectNames.push(args[0]);
          }
        } else if (fn === pdfjsLib.OPS.paintInlineImageXObject && args?.[0]) {
          hasInlineImages = true;
          inlineImages.push(args[0]);
        } else if (fn === pdfjsLib.OPS.paintInlineImageXObjectGroup && args?.[0]) {
          hasInlineImages = true;
          inlineImages.push(args[0]);
        }
      }

      if (xObjectNames.length > 0 || inlineImages.length > 0) {
        pageImageOps.push({ pageNumber: i, page, xObjectNames, inlineImages });
      } else {
        page.cleanup();
      }

      if (onProgress) {
        onProgress(Math.round((i / total) * 40));
      }
    }

    // Fast lossless JPEG extraction when all embedded images are clean DCTDecode JPEGs and no inline images exist
    if (!hasInlineImages && imageXObjects.length > 0 && imageXObjects.every((x) => x.isCleanJpeg)) {
      pageImageOps.forEach((p) => p.page.cleanup());
      if (onProgress) onProgress(100);
      return imageXObjects.map((item, idx) => ({
        filename: `${baseName}_image_${idx + 1}.jpg`,
        blob: new Blob([item.stream.contents as unknown as BlobPart], { type: 'image/jpeg' }),
        mimeType: 'image/jpeg',
        width: item.width,
        height: item.height,
      }));
    }

    // Decode all embedded XObject and inline images at native resolution via PDF.js
    const extractedImages: ExtractedImageItem[] = [];
    const seenCommonIds = new Set<string>();
    let imageCounter = 0;

    for (let idx = 0; idx < pageImageOps.length; idx++) {
      throwIfAborted(signal);
      const entry = pageImageOps[idx];
      const { pageNumber, page, xObjectNames, inlineImages } = entry;

      if (xObjectNames.length > 0) {
        // Trigger decoding of page image objects onto a tiny offscreen canvas
        const tinyViewport = page.getViewport({ scale: 0.1 });
        const dummyCanvas = document.createElement('canvas');
        dummyCanvas.width = Math.max(1, Math.round(tinyViewport.width));
        dummyCanvas.height = Math.max(1, Math.round(tinyViewport.height));
        const dummyCtx = dummyCanvas.getContext('2d');
        if (dummyCtx) {
          try {
            // @ts-expect-error pdfjs typing
            await page.render({ canvasContext: dummyCtx, viewport: tinyViewport }).promise;
          } catch (err) {
            console.warn(`Image decode render warning on page ${pageNumber}:`, err);
          }
        }

        for (const objName of xObjectNames) {
          throwIfAborted(signal);
          try {
            const isCommon = !page.objs.has(objName) && page.commonObjs.has(objName);
            if (isCommon && seenCommonIds.has(objName)) continue;

            const decoded = await new Promise<any>((resolve) => {
              if (page.objs.has(objName)) {
                page.objs.get(objName, (data: any) => resolve(data));
              } else if (page.commonObjs.has(objName)) {
                seenCommonIds.add(objName);
                page.commonObjs.get(objName, (data: any) => resolve(data));
              } else {
                resolve(null);
              }
            });

            const imgCanvas = pdfDecodedImageToCanvas(decoded);
            if (imgCanvas) {
              const blob = await new Promise<Blob | null>((res) =>
                imgCanvas.toBlob((b) => res(b), 'image/png')
              );
              if (blob) {
                imageCounter++;
                extractedImages.push({
                  filename: `${baseName}_p${pageNumber}_img${imageCounter}.png`,
                  blob,
                  mimeType: 'image/png',
                  width: imgCanvas.width,
                  height: imgCanvas.height,
                  pageNumber,
                });
              }
            }
          } catch (err) {
            console.warn(`Skipping unreadable image ${objName} on page ${pageNumber}:`, err);
          }
        }
      }

      for (const inlineImg of inlineImages) {
        try {
          const imgCanvas = pdfDecodedImageToCanvas(inlineImg);
          if (imgCanvas) {
            const blob = await new Promise<Blob | null>((res) =>
              imgCanvas.toBlob((b) => res(b), 'image/png')
            );
            if (blob) {
              imageCounter++;
              extractedImages.push({
                filename: `${baseName}_p${pageNumber}_inline${imageCounter}.png`,
                blob,
                mimeType: 'image/png',
                width: imgCanvas.width,
                height: imgCanvas.height,
                pageNumber,
              });
            }
          }
        } catch (err) {
          console.warn(`Skipping inline image on page ${pageNumber}:`, err);
        }
      }

      page.cleanup();

      if (onProgress) {
        onProgress(40 + Math.round(((idx + 1) / pageImageOps.length) * 60));
      }
    }

    // Fallback: if PDF.js produced 0 images (e.g. Form XObject nested images) but pdf-lib found clean JPEGs
    if (extractedImages.length === 0 && imageXObjects.length > 0) {
      for (let i = 0; i < imageXObjects.length; i++) {
        const item = imageXObjects[i];
        if (item.isCleanJpeg) {
          extractedImages.push({
            filename: `${baseName}_image_${i + 1}.jpg`,
            blob: new Blob([item.stream.contents as unknown as BlobPart], { type: 'image/jpeg' }),
            mimeType: 'image/jpeg',
            width: item.width,
            height: item.height,
          });
        }
      }
    }

    if (onProgress) onProgress(100);
    return extractedImages;
  } finally {
    await pdfJsDoc.loadingTask?.destroy().catch(() => {});
  }
}


