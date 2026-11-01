import { createWorker } from 'tesseract.js';
import { loadPdfJsDocument } from './pdfService';

export type OcrLanguage = 'eng' | 'ara' | 'eng+ara';

export interface OcrProgressInfo {
  status: string;
  progress: number;
}

const LOCAL_TESSERACT_OPTIONS = {
  workerPath: '/tesseract/worker.min.js',
  corePath: '/tesseract/core',
  langPath: '/tesseract/lang',
};

/**
 * Perform client-side OCR on an image file, canvas, or PDF file completely offline
 */
export async function performOcr(
  source: File | HTMLCanvasElement,
  language: OcrLanguage = 'eng',
  onProgress?: (info: OcrProgressInfo) => void
): Promise<string> {
  // If the source is a PDF, render each page to canvas and OCR each page
  if (source instanceof File && (source.type === 'application/pdf' || source.name.toLowerCase().endsWith('.pdf'))) {
    return await ocrPdfFile(source, language, onProgress);
  }

  // Source is an image or canvas
  return await ocrImageSource(source, language, onProgress);
}

async function ocrImageSource(
  source: File | HTMLCanvasElement,
  language: OcrLanguage,
  onProgress?: (info: OcrProgressInfo) => void
): Promise<string> {
  const langs = language === 'eng+ara' ? 'eng+ara' : language;

  const worker = await createWorker(langs, undefined, {
    ...LOCAL_TESSERACT_OPTIONS,
    logger: (m: any) => {
      if (onProgress && typeof m.progress === 'number') {
        const percent = Math.min(100, Math.max(0, Math.round(m.progress * 100)));
        onProgress({ status: m.status || 'Processing', progress: percent });
      }
    },
  });

  try {
    const result = await worker.recognize(source);
    return result.data.text;
  } finally {
    await worker.terminate();
  }
}

async function ocrPdfFile(
  pdfFile: File,
  language: OcrLanguage,
  onProgress?: (info: OcrProgressInfo) => void
): Promise<string> {
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
        const overallProgress = Math.min(99, Math.round(pageBase + (m.progress * pageFraction)));
        onProgress({
          status: `${m.status || 'Analyzing'} (Page ${currentPageNum}/${totalPages})`,
          progress: overallProgress,
        });
      }
    },
  });

  const fullTextPages: string[] = [];

  try {
    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
      currentPageNum = pageNum;
      if (onProgress) {
        onProgress({
          status: `Rendering Page ${pageNum} of ${totalPages}`,
          progress: Math.round(((pageNum - 1) / totalPages) * 100),
        });
      }

      const page = await pdfDoc.getPage(pageNum);
      const viewport = page.getViewport({ scale: 2.0 }); // 2x scale for sharper OCR character detection
      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // @ts-expect-error pdfjs typing
      await page.render({ canvasContext: ctx, viewport }).promise;

      const result = await worker.recognize(canvas);
      fullTextPages.push(`--- [ Page ${pageNum} ] ---\n` + result.data.text.trim());

      if (onProgress) {
        onProgress({
          status: `Completed Page ${pageNum} of ${totalPages}`,
          progress: Math.round((pageNum / totalPages) * 100),
        });
      }
    }
  } finally {
    await worker.terminate();
  }

  return fullTextPages.join('\n\n');
}
