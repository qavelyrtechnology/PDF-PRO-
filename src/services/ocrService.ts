import { throwIfAborted } from '../utils/fileUtils';
import { loadPdfJsDocument } from './pdfService';

export type OcrLanguage = 'eng' | 'ara' | 'eng+ara';

export interface OcrProgressInfo {
  status: string;
  progress: number;
  phase?: 'downloading' | 'recognizing';
}

const LOCAL_TESSERACT_OPTIONS = {
  workerPath: '/tesseract/worker.min.js',
  corePath: '/tesseract/core',
  langPath: '/tesseract/lang',
};

const EXPECTED_LANG_BYTES: Record<'eng' | 'ara', number> = {
  eng: 4.1 * 1024 * 1024,
  ara: 8.8 * 1024 * 1024,
};

/**
 * Fetch and warm browser Cache Storage for Tesseract OCR worker & language packs on demand.
 * Shows clear MB download progress the first time a language pack is fetched.
 */
async function preloadOcrAssets(
  language: OcrLanguage,
  onProgress?: (info: OcrProgressInfo) => void,
  signal?: AbortSignal,
  downloadMessageTemplate?: string
): Promise<void> {
  if (typeof window === 'undefined' || typeof fetch === 'undefined') return;
  throwIfAborted(signal);

  const langCodes: ('eng' | 'ara')[] =
    language === 'eng+ara' ? ['eng', 'ara'] : [language];

  const assetsToFetch: { url: string; fallbackBytes: number }[] = [
    { url: '/tesseract/worker.min.js', fallbackBytes: 120 * 1024 },
    ...langCodes.map((code) => ({
      url: `/tesseract/lang/${code}.traineddata.gz`,
      fallbackBytes: EXPECTED_LANG_BYTES[code],
    })),
  ];

  // Check which assets are missing from Cache Storage
  const missing: { url: string; fallbackBytes: number }[] = [];
  if ('caches' in window) {
    for (const item of assetsToFetch) {
      try {
        const cached = await caches.match(item.url);
        if (!cached) {
          missing.push(item);
        }
      } catch {
        missing.push(item);
      }
    }
  } else {
    missing.push(...assetsToFetch);
  }

  if (missing.length === 0) return;

  const estimatedTotalBytes = missing.reduce((acc, item) => acc + item.fallbackBytes, 0);
  let downloadedBytes = 0;

  const formatDownloadText = (bytes: number) => {
    const mb = (bytes / (1024 * 1024)).toFixed(1);
    if (downloadMessageTemplate) {
      return downloadMessageTemplate.replace('{size}', mb);
    }
    return `Downloading OCR language data (${mb} MB)...`;
  };

  if (onProgress) {
    onProgress({
      phase: 'downloading',
      status: formatDownloadText(estimatedTotalBytes),
      progress: 2,
    });
  }

  let cache: Cache | null = null;
  if ('caches' in window) {
    try {
      cache = await caches.open('tesseract-traineddata');
    } catch {
      cache = null;
    }
  }

  for (const item of missing) {
    throwIfAborted(signal);
    const response = await fetch(item.url, { signal });
    if (!response.ok) {
      throw new Error(`Failed to fetch OCR resource (${item.url}): HTTP ${response.status}`);
    }

    const contentLengthHeader = response.headers.get('content-length');
    const itemTotal = contentLengthHeader ? parseInt(contentLengthHeader, 10) : item.fallbackBytes;
    const totalTarget = Math.max(estimatedTotalBytes, downloadedBytes + itemTotal);

    if (response.body && typeof response.body.getReader === 'function') {
      const reader = response.body.getReader();
      const chunks: Uint8Array[] = [];
      let receivedForItem = 0;

      while (true) {
        throwIfAborted(signal);
        const { done, value } = await reader.read();
        if (done) break;
        if (value) {
          chunks.push(value);
          receivedForItem += value.byteLength;
          downloadedBytes += value.byteLength;

          if (onProgress) {
            const pct = Math.min(25, Math.max(2, Math.round((downloadedBytes / totalTarget) * 25)));
            onProgress({
              phase: 'downloading',
              status: formatDownloadText(downloadedBytes),
              progress: pct,
            });
          }
        }
      }

      if (cache) {
        try {
          const merged = new Uint8Array(receivedForItem);
          let offset = 0;
          for (const chunk of chunks) {
            merged.set(chunk, offset);
            offset += chunk.byteLength;
          }
          await cache.put(
            item.url,
            new Response(merged, {
              headers: {
                'Content-Type': response.headers.get('Content-Type') || 'application/octet-stream',
              },
            })
          );
        } catch {
          // Ignore cache write quota errors; Tesseract still operates in memory
        }
      }
    } else {
      const buf = await response.arrayBuffer();
      downloadedBytes += buf.byteLength;
      if (cache) {
        try {
          await cache.put(item.url, new Response(buf));
        } catch {
          // Ignore cache quota errors
        }
      }
    }
  }
}

/**
 * Perform client-side OCR on an image file, canvas, or PDF file completely offline.
 * Downloads OCR language data only on demand and caches it for subsequent runs.
 */
export async function performOcr(
  source: File | HTMLCanvasElement,
  language: OcrLanguage = 'eng',
  onProgress?: (info: OcrProgressInfo) => void,
  signal?: AbortSignal,
  downloadMessageTemplate?: string
): Promise<string> {
  throwIfAborted(signal);
  await preloadOcrAssets(language, onProgress, signal, downloadMessageTemplate);
  throwIfAborted(signal);

  if (
    source instanceof File &&
    (source.type === 'application/pdf' || source.name.toLowerCase().endsWith('.pdf'))
  ) {
    return await ocrPdfFile(source, language, onProgress, signal);
  }

  return await ocrImageSource(source, language, onProgress, signal);
}

/**
 * OCR specific page numbers of an already-loaded or uploaded PDF file (used by PDF to Word scanned fallback).
 */
export async function ocrSpecificPdfPages(
  pdfFile: File | Uint8Array,
  pageNumbers: number[],
  language: OcrLanguage = 'eng',
  onProgress?: (info: OcrProgressInfo) => void,
  signal?: AbortSignal,
  downloadMessageTemplate?: string
): Promise<Map<number, string>> {
  const resultMap = new Map<number, string>();
  if (pageNumbers.length === 0) return resultMap;

  throwIfAborted(signal);
  await preloadOcrAssets(language, onProgress, signal, downloadMessageTemplate);
  throwIfAborted(signal);

  const { createWorker } = await import('tesseract.js');
  const pdfDoc = await loadPdfJsDocument(pdfFile);
  const langs = language === 'eng+ara' ? 'eng+ara' : language;

  let activeIdx = 0;
  const total = pageNumbers.length;

  const worker = await createWorker(langs, undefined, {
    ...LOCAL_TESSERACT_OPTIONS,
    logger: (m: any) => {
      if (onProgress && typeof m.progress === 'number') {
        const pageFraction = 100 / total;
        const pageBase = activeIdx * pageFraction;
        const overallProgress = Math.min(99, Math.round(pageBase + m.progress * pageFraction));
        onProgress({
          phase: 'recognizing',
          status: `${m.status || 'OCR'} (${activeIdx + 1}/${total})`,
          progress: overallProgress,
        });
      }
    },
  });

  try {
    for (let idx = 0; idx < total; idx++) {
      throwIfAborted(signal);
      activeIdx = idx;
      const pageNum = pageNumbers[idx];
      const page = await pdfDoc.getPage(pageNum);
      const viewport = page.getViewport({ scale: 2.0 });
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(viewport.width));
      canvas.height = Math.max(1, Math.round(viewport.height));

      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // @ts-expect-error pdfjs typing
      await page.render({ canvasContext: ctx, viewport }).promise;
      page.cleanup();

      throwIfAborted(signal);
      const res = await worker.recognize(canvas);
      resultMap.set(pageNum, res.data.text.trim());

      if (onProgress) {
        onProgress({
          phase: 'recognizing',
          status: `OCR ${idx + 1}/${total}`,
          progress: Math.round(((idx + 1) / total) * 100),
        });
      }
    }
  } finally {
    await worker.terminate().catch(() => {});
    await pdfDoc.loadingTask?.destroy().catch(() => {});
  }

  return resultMap;
}

async function ocrImageSource(
  source: File | HTMLCanvasElement,
  language: OcrLanguage,
  onProgress?: (info: OcrProgressInfo) => void,
  signal?: AbortSignal
): Promise<string> {
  throwIfAborted(signal);
  const { createWorker } = await import('tesseract.js');
  const langs = language === 'eng+ara' ? 'eng+ara' : language;

  const worker = await createWorker(langs, undefined, {
    ...LOCAL_TESSERACT_OPTIONS,
    logger: (m: any) => {
      if (onProgress && typeof m.progress === 'number') {
        const percent = Math.min(100, Math.max(0, Math.round(m.progress * 100)));
        onProgress({
          phase: 'recognizing',
          status: m.status || 'Processing',
          progress: percent,
        });
      }
    },
  });

  try {
    throwIfAborted(signal);
    const result = await worker.recognize(source);
    throwIfAborted(signal);
    return result.data.text;
  } finally {
    await worker.terminate().catch(() => {});
  }
}

async function ocrPdfFile(
  pdfFile: File,
  language: OcrLanguage,
  onProgress?: (info: OcrProgressInfo) => void,
  signal?: AbortSignal
): Promise<string> {
  throwIfAborted(signal);
  const { createWorker } = await import('tesseract.js');
  const pdfDoc = await loadPdfJsDocument(pdfFile);
  const totalPages = pdfDoc.numPages;
  const langs = language === 'eng+ara' ? 'eng+ara' : language;

  let currentPageNum = 1;

  const worker = await createWorker(langs, undefined, {
    ...LOCAL_TESSERACT_OPTIONS,
    logger: (m: any) => {
      if (onProgress && typeof m.progress === 'number') {
        const pageFraction = 100 / totalPages;
        const pageBase = (currentPageNum - 1) * pageFraction;
        const overallProgress = Math.min(99, Math.round(pageBase + m.progress * pageFraction));
        onProgress({
          phase: 'recognizing',
          status: `${m.status || 'Analyzing'} (Page ${currentPageNum}/${totalPages})`,
          progress: overallProgress,
        });
      }
    },
  });

  const fullTextPages: string[] = [];

  try {
    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
      throwIfAborted(signal);
      currentPageNum = pageNum;
      if (onProgress) {
        onProgress({
          phase: 'recognizing',
          status: `Rendering Page ${pageNum} of ${totalPages}`,
          progress: Math.round(((pageNum - 1) / totalPages) * 100),
        });
      }

      const page = await pdfDoc.getPage(pageNum);
      const viewport = page.getViewport({ scale: 2.0 });
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(viewport.width));
      canvas.height = Math.max(1, Math.round(viewport.height));

      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // @ts-expect-error pdfjs typing
      await page.render({ canvasContext: ctx, viewport }).promise;
      page.cleanup();

      throwIfAborted(signal);
      const result = await worker.recognize(canvas);
      fullTextPages.push(`--- [ Page ${pageNum} ] ---\n` + result.data.text.trim());

      if (onProgress) {
        onProgress({
          phase: 'recognizing',
          status: `Completed Page ${pageNum} of ${totalPages}`,
          progress: Math.round((pageNum / totalPages) * 100),
        });
      }
    }
  } finally {
    await worker.terminate().catch(() => {});
    await pdfDoc.loadingTask?.destroy().catch(() => {});
  }

  return fullTextPages.join('\n\n');
}
