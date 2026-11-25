import { describe, it, expect } from 'vitest';
import { PDFDocument, StandardFonts } from 'pdf-lib';
import JSZip from 'jszip';
import {
  FILE_SIZE_WARN_BYTES,
  FILE_SIZE_MAX_BYTES,
  validateFileSize,
  PdfPasswordRequiredError,
  InvalidPdfPasswordError,
} from '../utils/fileUtils';
import {
  encryptPdfDocument,
  inspectPdfEncryption,
  unlockPdfBytes,
  mergePdfs,
  splitPdfByRanges,
  inspectAndSanitizeMetadata,
  redactPdf,
} from '../services/pdfService';
import {
  convertPdfToDocx,
  isMostlyArabicText,
} from '../services/pdfToWordService';
import { translations } from '../i18n/translations';

function toPdfFile(bytes: Uint8Array, name: string): File {
  return new File([bytes as unknown as BlobPart], name, { type: 'application/pdf' });
}

async function createSamplePdfBytes(pagesText: string[]): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const boldFont = await doc.embedFont(StandardFonts.HelveticaBold);

  for (let i = 0; i < pagesText.length; i++) {
    const page = doc.addPage([600, 800]);
    if (i === 0) {
      page.drawText('Annual Report Heading', { x: 50, y: 740, size: 22, font: boldFont });
      page.drawText('This is a standard body paragraph describing the quarterly financial results.', {
        x: 50,
        y: 700,
        size: 11,
        font,
      });
      // Aligned 2-column table rows
      page.drawText('Metric', { x: 60, y: 640, size: 11, font: boldFont });
      page.drawText('Value', { x: 320, y: 640, size: 11, font: boldFont });
      page.drawText('Revenue', { x: 60, y: 618, size: 11, font });
      page.drawText('$125,000', { x: 320, y: 618, size: 11, font });
      page.drawText('Expenses', { x: 60, y: 596, size: 11, font });
      page.drawText('$42,000', { x: 320, y: 596, size: 11, font });
    }
    if (pagesText[i]) {
      page.drawText(pagesText[i], { x: 50, y: 520, size: 11, font });
    }
  }
  return await doc.save();
}

describe('File Size Validation Thresholds', () => {
  it('returns ok for files up to 50 MB', () => {
    const small = validateFileSize({ size: 1024 * 1024 });
    expect(small.status).toBe('ok');
    expect(small.formattedSize).toBe('1 MB');

    const exactBoundary = validateFileSize({ size: FILE_SIZE_WARN_BYTES });
    expect(exactBoundary.status).toBe('ok');
  });

  it('warns for files above 50 MB up to 200 MB', () => {
    const sixtyMb = validateFileSize({ size: 60 * 1024 * 1024 });
    expect(sixtyMb.status).toBe('warn');
    expect(sixtyMb.formattedSize).toBe('60 MB');

    const exactMax = validateFileSize({ size: FILE_SIZE_MAX_BYTES });
    expect(exactMax.status).toBe('warn');
  });

  it('blocks files above 200 MB', () => {
    const tooLarge = validateFileSize({ size: 210 * 1024 * 1024 });
    expect(tooLarge.status).toBe('blocked');
    expect(tooLarge.formattedSize).toBe('210 MB');
  });
});

describe('Password Protection, Unlocking & No-Bypass Encryption Guard', () => {
  it('encrypts a PDF with real AES-256 encryption, rejects wrong passwords, and unlocks cleanly', async () => {
    const plainBytes = await createSamplePdfBytes(['Confidential content']);
    const unencryptedStatus = await inspectPdfEncryption(plainBytes);
    expect(unencryptedStatus.encrypted).toBe(false);

    const encryptedBytes = await encryptPdfDocument(plainBytes, 'S3cretPass!', {
      algorithm: 'AES-256',
      allowPrinting: true,
      allowCopying: false,
      allowModifying: false,
    });

    const encStatus = await inspectPdfEncryption(encryptedBytes);
    expect(encStatus.encrypted).toBe(true);
    expect(encStatus.algorithm).toBe('AES-256');

    // Wrong password must throw InvalidPdfPasswordError
    await expect(unlockPdfBytes(encryptedBytes, 'WrongPassword')).rejects.toThrow(
      InvalidPdfPasswordError
    );

    // Correct password unlocks into a readable unencrypted PDF
    const unlockedBytes = await unlockPdfBytes(encryptedBytes, 'S3cretPass!');
    const unlockedStatus = await inspectPdfEncryption(unlockedBytes);
    expect(unlockedStatus.encrypted).toBe(false);

    const reloaded = await PDFDocument.load(unlockedBytes);
    expect(reloaded.getPageCount()).toBe(1);
  });

  it('supports Unicode / Arabic passwords with AES-256 and enforces PDF Bidi rules', async () => {
    const plainBytes = await createSamplePdfBytes(['Unicode password check']);
    // Pure RTL Arabic letters satisfy ISO 32000-2 SASLprep Bidi validation
    const encryptedBytes = await encryptPdfDocument(plainBytes, 'كلمةالمرور', {
      algorithm: 'AES-256',
    });

    const status = await inspectPdfEncryption(encryptedBytes);
    expect(status.encrypted).toBe(true);

    await expect(unlockPdfBytes(encryptedBytes, 'wrong')).rejects.toThrow(
      InvalidPdfPasswordError
    );

    const unlockedBytes = await unlockPdfBytes(encryptedBytes, 'كلمةالمرور');
    const unlockedStatus = await inspectPdfEncryption(unlockedBytes);
    expect(unlockedStatus.encrypted).toBe(false);

    // Mixed RTL start with trailing number is rejected per PDF standard Bidi rule
    await expect(
      encryptPdfDocument(plainBytes, 'سري١٢٣', { algorithm: 'AES-256' })
    ).rejects.toThrow();
  });

  it('supports RC4 128-bit encryption and rejects non-Latin RC4 passwords', async () => {
    const plainBytes = await createSamplePdfBytes(['RC4 compatibility test']);
    await expect(
      encryptPdfDocument(plainBytes, 'كلمة', { algorithm: 'RC4' })
    ).rejects.toThrow();

    const encryptedBytes = await encryptPdfDocument(plainBytes, 'legacy123', {
      algorithm: 'RC4',
    });
    const status = await inspectPdfEncryption(encryptedBytes);
    expect(status.encrypted).toBe(true);

    const unlockedBytes = await unlockPdfBytes(encryptedBytes, 'legacy123');
    const unlockedStatus = await inspectPdfEncryption(unlockedBytes);
    expect(unlockedStatus.encrypted).toBe(false);
  });

  it('never silently bypasses encryption in PDF tools (merge, split, metadata, redact)', async () => {
    const plainA = await createSamplePdfBytes(['Doc A']);
    const plainB = await createSamplePdfBytes(['Doc B']);
    const encA = await encryptPdfDocument(plainA, 'passA', { algorithm: 'AES-256' });

    const encFile = toPdfFile(encA, 'locked.pdf');
    const plainFile = toPdfFile(plainB, 'plain.pdf');

    await expect(mergePdfs([encFile, plainFile])).rejects.toThrow(PdfPasswordRequiredError);
    await expect(splitPdfByRanges(encFile, [{ start: 1, end: 1 }])).rejects.toThrow(
      PdfPasswordRequiredError
    );
    await expect(inspectAndSanitizeMetadata(encFile)).rejects.toThrow(
      PdfPasswordRequiredError
    );
    await expect(
      redactPdf(encFile, [
        { pageIndex: 0, rects: [{ x: 10, y: 10, width: 100, height: 30, color: 'black' }] },
      ])
    ).rejects.toThrow(PdfPasswordRequiredError);
  });
});

describe('Client-Side PDF to Word (.docx) Conversion', () => {
  it('detects Arabic vs English text directionality accurately', () => {
    expect(isMostlyArabicText('مرحبا بكم في محرر الملفات')).toBe(true);
    expect(isMostlyArabicText('Quarterly financial review 2026')).toBe(false);
    expect(isMostlyArabicText('   ')).toBe(false);
  });

  it('extracts headings, paragraphs, aligned tables, and page breaks into a valid .docx archive', async () => {
    const pdfBytes = await createSamplePdfBytes([
      'First page closing note.',
      'Second page detailed appendix.',
    ]);
    const file = toPdfFile(pdfBytes, 'report.pdf');

    let lastProgress = 0;
    const result = await convertPdfToDocx(file, {
      onProgress: (p) => {
        lastProgress = p;
      },
    });

    expect(lastProgress).toBe(100);
    expect(result.pageCount).toBe(2);
    expect(result.paragraphCount).toBeGreaterThanOrEqual(3);
    expect(result.tableCount).toBeGreaterThanOrEqual(1);
    expect(result.pagesWithoutText).toEqual([]);
    expect(result.ocrPagesUsed).toBe(0);

    // Inspect generated .docx ZIP payload
    const zip = await JSZip.loadAsync(result.bytes);
    const documentXml = await zip.file('word/document.xml')?.async('string');
    expect(documentXml).toBeDefined();
    expect(documentXml).toContain('Annual Report Heading');
    expect(documentXml).toContain('quarterly financial results');
    expect(documentXml).toContain('Second page detailed appendix.');
    expect(documentXml).toContain('<w:tbl>');
    expect(documentXml).toContain('Revenue');
    expect(documentXml).toContain('$125,000');
    expect(documentXml).toContain('w:type="page"');
  });

  it('flags pages without selectable text and injects RTL Arabic OCR fallback text cleanly', async () => {
    const blankDoc = await PDFDocument.create();
    blankDoc.addPage([595, 842]);
    const blankBytes = await blankDoc.save();
    const scannedFile = toPdfFile(blankBytes, 'scanned.pdf');

    // First pass without OCR detects scanned page
    const pass1 = await convertPdfToDocx(scannedFile);
    expect(pass1.pagesWithoutText).toEqual([1]);
    expect(pass1.ocrPagesUsed).toBe(0);

    // Second pass with OCR text includes Arabic RTL content in word/document.xml
    const ocrMap = new Map<number, string>([[1, 'تقرير المبيعات السنوي\n\nالفقرة الثانية من المستند']]);
    const pass2 = await convertPdfToDocx(scannedFile, { ocrTextByPage: ocrMap });
    expect(pass2.pagesWithoutText).toEqual([]);
    expect(pass2.ocrPagesUsed).toBe(1);
    expect(pass2.paragraphCount).toBeGreaterThanOrEqual(2);

    const zip = await JSZip.loadAsync(pass2.bytes);
    const documentXml = await zip.file('word/document.xml')?.async('string');
    expect(documentXml).toContain('تقرير المبيعات السنوي');
    expect(documentXml).toContain('w:bidi');
    expect(documentXml).toContain('w:rtl');
  });
});

describe('New Translations Parity (Qavelyr, Protect, Unlock, PDF to Word, SEO, Limits)', () => {
  it('has full EN and AR key parity across all newly added sections', () => {
    const sections = [
      'protect',
      'unlock',
      'pdfToWord',
      'passwordDialog',
      'fileLimits',
      'errorBoundary',
      'footer',
      'header',
      'about',
      'ocr',
      'seo',
    ] as const;

    for (const section of sections) {
      expect(Object.keys(translations.ar[section]).sort()).toEqual(
        Object.keys(translations.en[section]).sort()
      );
    }

    expect(Object.keys(translations.ar.seo.pages).sort()).toEqual(
      Object.keys(translations.en.seo.pages).sort()
    );
    expect(Object.keys(translations.en.seo.pages).length).toBeGreaterThanOrEqual(26);
    expect(translations.en.pdfToWord.honestNotice).toBe(
      'Text-focused conversion: complex layouts and images may not be preserved.'
    );
  });
});
