export const FILE_SIZE_WARN_BYTES = 50 * 1024 * 1024; // 50 MB warning threshold
export const FILE_SIZE_MAX_BYTES = 200 * 1024 * 1024; // 200 MB hard limit

export interface FileSizeValidationResult {
  status: 'ok' | 'warn' | 'blocked';
  sizeBytes: number;
  formattedSize: string;
}

export class PdfPasswordRequiredError extends Error {
  constructor(message = 'This PDF is password-protected.') {
    super(message);
    this.name = 'PdfPasswordRequiredError';
  }
}

export class InvalidPdfPasswordError extends Error {
  constructor(message = 'Incorrect PDF password.') {
    super(message);
    this.name = 'InvalidPdfPasswordError';
  }
}

export class OperationCancelledError extends Error {
  constructor(message = 'Operation was cancelled.') {
    super(message);
    this.name = 'OperationCancelledError';
  }
}

export function throwIfAborted(signal?: AbortSignal): void {
  if (signal?.aborted) {
    throw new OperationCancelledError();
  }
}

export function isCancelledError(err: unknown): boolean {
  return (
    err instanceof OperationCancelledError ||
    (err instanceof Error &&
      (err.name === 'AbortError' ||
        err.name === 'OperationCancelledError' ||
        err.message.toLowerCase().includes('cancelled')))
  );
}

export function isPdfPasswordError(err: unknown): boolean {
  if (err instanceof PdfPasswordRequiredError || err instanceof InvalidPdfPasswordError) {
    return true;
  }
  if (!err || typeof err !== 'object') return false;
  const e = err as { name?: string; message?: string; code?: number };
  const msg = (e.message || '').toLowerCase();
  return (
    e.name === 'PasswordException' ||
    msg.includes('encrypted') ||
    msg.includes('password')
  );
}

/**
 * Format raw byte size into human-readable string
 */
export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.min(sizes.length - 1, Math.floor(Math.log(bytes) / Math.log(k)));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/**
 * Validate file size against browser memory thresholds (warn > 50 MB, block > 200 MB)
 */
export function validateFileSize(file: Pick<File, 'size'>): FileSizeValidationResult {
  const sizeBytes = file.size;
  const formattedSize = formatBytes(sizeBytes);

  if (sizeBytes > FILE_SIZE_MAX_BYTES) {
    return { status: 'blocked', sizeBytes, formattedSize };
  }
  if (sizeBytes > FILE_SIZE_WARN_BYTES) {
    return { status: 'warn', sizeBytes, formattedSize };
  }
  return { status: 'ok', sizeBytes, formattedSize };
}

/**
 * Trigger immediate browser download of a Blob or Uint8Array
 */
export function downloadFile(data: Uint8Array | Blob, filename: string, mimeType = 'application/pdf') {
  const blob = data instanceof Blob ? data : new Blob([data as unknown as BlobPart], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}

/**
 * Web Share API helper (for mobile or desktop direct sharing)
 */
export async function shareOrDownloadFile(
  data: Uint8Array | Blob,
  filename: string,
  mimeType = 'application/pdf'
): Promise<boolean> {
  const blob = data instanceof Blob ? data : new Blob([data as unknown as BlobPart], { type: mimeType });
  const file = new File([blob], filename, { type: mimeType });

  if (typeof navigator !== 'undefined' && navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({
        files: [file],
        title: filename,
        text: 'Document processed with Free PDF Studio (100% In-Browser)',
      });
      return true;
    } catch (err: any) {
      if (err?.name !== 'AbortError') {
        console.warn('Share failed, falling back to download', err);
      }
    }
  }

  downloadFile(blob, filename, mimeType);
  return false;
}

/**
 * Parse user page range input like "1-3, 5, 8-10"
 */
export function parsePageRanges(rangeStr: string, totalPages: number): { start: number; end: number }[] | null {
  const cleaned = rangeStr.trim();
  if (!cleaned) return null;

  const parts = cleaned.split(/[,،\s]+/).filter(Boolean);
  const ranges: { start: number; end: number }[] = [];

  for (const part of parts) {
    if (part.includes('-')) {
      const [startStr, endStr] = part.split('-');
      const start = parseInt(startStr, 10);
      const end = parseInt(endStr, 10);
      if (isNaN(start) || isNaN(end) || start < 1 || end < start || start > totalPages) {
        return null;
      }
      ranges.push({ start, end: Math.min(end, totalPages) });
    } else {
      const page = parseInt(part, 10);
      if (isNaN(page) || page < 1 || page > totalPages) {
        return null;
      }
      ranges.push({ start: page, end: page });
    }
  }

  return ranges.length > 0 ? ranges : null;
}
