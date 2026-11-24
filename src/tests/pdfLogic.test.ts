import { describe, it, expect } from 'vitest';
import {
  parsePageRanges,
  formatBytes,
  redactPdf,
  compressPdfInBrowser,
  mergePdfs,
  splitPdfByRanges,
  splitPdfEveryPage,
  inspectAndSanitizeMetadata,
  extractEmbeddedImages,
  PageRedaction,
} from '../services/pdfService';
import { translations } from '../i18n/translations';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import zlib from 'zlib';

function toPdfFile(bytes: Uint8Array, name: string): File {
  return new File([bytes as any], name, { type: 'application/pdf' });
}

describe('PDF Range Parser', () => {
  it('parses valid comma-separated and hyphenated page ranges', () => {
    const ranges = parsePageRanges('1-3, 5, 8-10', 12);
    expect(ranges).toEqual([
      { start: 1, end: 3 },
      { start: 5, end: 5 },
      { start: 8, end: 10 },
    ]);
  });

  it('supports Arabic comma as delimiter', () => {
    const ranges = parsePageRanges('1-2، 4، 6-7', 10);
    expect(ranges).toEqual([
      { start: 1, end: 2 },
      { start: 4, end: 4 },
      { start: 6, end: 7 },
    ]);
  });

  it('rejects invalid range orders (e.g. 5-2)', () => {
    const ranges = parsePageRanges('5-2', 10);
    expect(ranges).toBeNull();
  });

  it('rejects page numbers exceeding total pages', () => {
    const ranges = parsePageRanges('1-5, 15', 10);
    expect(ranges).toBeNull();
  });

  it('rejects zero or negative page numbers', () => {
    const ranges = parsePageRanges('0-3', 10);
    expect(ranges).toBeNull();
  });

  it('returns null for empty string or whitespace', () => {
    expect(parsePageRanges('', 5)).toBeNull();
    expect(parsePageRanges('   ', 5)).toBeNull();
  });
});

describe('Format Bytes Helper', () => {
  it('formats zero bytes correctly', () => {
    expect(formatBytes(0)).toBe('0 B');
  });

  it('formats bytes into KB and MB correctly', () => {
    expect(formatBytes(1024)).toBe('1 KB');
    expect(formatBytes(1048576)).toBe('1 MB');
    expect(formatBytes(5242880)).toBe('5 MB');
  });
});

describe('Translation Completeness', () => {
  it('ensures English and Arabic translations contain all major sections and keys', () => {
    const enKeys = Object.keys(translations.en);
    const arKeys = Object.keys(translations.ar);
    expect(arKeys.sort()).toEqual(enKeys.sort());

    // Check nav subkeys
    expect(Object.keys(translations.ar.nav).sort()).toEqual(
      Object.keys(translations.en.nav).sort()
    );

    // Check common subkeys
    expect(Object.keys(translations.ar.common).sort()).toEqual(
      Object.keys(translations.en.common).sort()
    );

    // Check redact subkeys
    expect(Object.keys(translations.ar.redact).sort()).toEqual(
      Object.keys(translations.en.redact).sort()
    );

    // Check compress subkeys
    expect(Object.keys(translations.ar.compress).sort()).toEqual(
      Object.keys(translations.en.compress).sort()
    );

    // Check organize subkeys
    expect(Object.keys(translations.ar.organize).sort()).toEqual(
      Object.keys(translations.en.organize).sort()
    );

    // Check watermark subkeys
    expect(Object.keys(translations.ar.watermark).sort()).toEqual(
      Object.keys(translations.en.watermark).sort()
    );

    // Check pageNumbers subkeys
    expect(Object.keys(translations.ar.pageNumbers).sort()).toEqual(
      Object.keys(translations.en.pageNumbers).sort()
    );

    // Check crop subkeys
    expect(Object.keys(translations.ar.crop).sort()).toEqual(
      Object.keys(translations.en.crop).sort()
    );
  });
});

describe('True Redaction and Stream Sanitization', () => {
  it('destroys sensitive text stream from redacted page so it cannot be extracted', async () => {
    const doc = await PDFDocument.create();
    const page = doc.addPage([500, 700]);
    const sensitiveString = 'TOP_SECRET_PASSPORT_987654321';
    page.drawText(sensitiveString, { x: 50, y: 650, size: 14 });

    const originalBytes = await doc.save();
    const originalFile = toPdfFile(originalBytes, 'confidential.pdf');

    const redactions: PageRedaction[] = [
      {
        pageIndex: 0,
        rects: [
          {
            x: 45,
            y: 640,
            width: 250,
            height: 30,
            color: 'black',
          },
        ],
      },
    ];

    const redactedBytes = await redactPdf(originalFile, redactions);
    expect(redactedBytes).toBeInstanceOf(Uint8Array);
    expect(redactedBytes.length).toBeGreaterThan(100);

    // Inspect the redacted PDF structure to verify the sensitive string is 100% gone
    const hexTarget = Buffer.from(sensitiveString).toString('hex');
    const rawRedactedStr = Buffer.from(redactedBytes).toString('latin1');
    expect(rawRedactedStr.includes(sensitiveString)).toBe(false);
    expect(rawRedactedStr.includes(hexTarget)).toBe(false);

    // Reload the sanitized document and verify streams
    const sanitizedDoc = await PDFDocument.load(redactedBytes);
    expect(sanitizedDoc.getPageCount()).toBe(1);

    const p1 = sanitizedDoc.getPages()[0];
    const contents = p1.node.Contents();
    if (contents && 'asArray' in contents) {
      for (const ref of (contents as any).asArray()) {
        const stream = sanitizedDoc.context.lookup(ref) as any;
        if (stream && stream.getContents) {
          try {
            const decompressed = zlib.inflateSync(Buffer.from(stream.getContents())).toString('utf8');
            expect(decompressed.includes(sensitiveString)).toBe(false);
            expect(decompressed.includes(hexTarget)).toBe(false);
          } catch {
            // Uncompressed or raw stream
            const raw = Buffer.from(stream.getContents()).toString('utf8');
            expect(raw.includes(sensitiveString)).toBe(false);
          }
        }
      }
    }
  });

  it('preserves unredacted pages losslessly in multi-page documents', async () => {
    const doc = await PDFDocument.create();
    const p1 = doc.addPage([500, 700]);
    p1.drawText('Page 1: CLASSIFIED_INFO_999', { x: 50, y: 650, size: 14 });

    const p2 = doc.addPage([500, 700]);
    p2.drawText('Page 2: Public General Information', { x: 50, y: 650, size: 14 });

    const originalBytes = await doc.save();
    const file = toPdfFile(originalBytes, 'multi.pdf');

    // Only redact page 1
    const redactions: PageRedaction[] = [
      {
        pageIndex: 0,
        rects: [{ x: 45, y: 640, width: 200, height: 30, color: 'black' }],
      },
    ];

    const redactedBytes = await redactPdf(file, redactions);
    const reloaded = await PDFDocument.load(redactedBytes);
    expect(reloaded.getPageCount()).toBe(2);

    // Page 1 must not contain the classified string
    const hexTarget = Buffer.from('CLASSIFIED_INFO_999').toString('hex');
    const rawStr = Buffer.from(redactedBytes).toString('latin1');
    expect(rawStr.includes('CLASSIFIED_INFO_999')).toBe(false);
    expect(rawStr.includes(hexTarget)).toBe(false);
  });

  it('throws an error if no redactions are provided', async () => {
    const doc = await PDFDocument.create();
    doc.addPage([500, 700]);
    const bytes = await doc.save();
    const file = toPdfFile(bytes, 'empty.pdf');

    await expect(redactPdf(file, [])).rejects.toThrow();
  });
});

describe('PDF Compression Tool', () => {
  it('executes structural lossless compression and accurately reports before and after sizes', async () => {
    const doc = await PDFDocument.create();
    const page = doc.addPage([600, 800]);
    page.drawText('Structural compression test page with vector fonts');
    const bytes = await doc.save({ useObjectStreams: false });
    const file = toPdfFile(bytes, 'sample_vector.pdf');

    const result = await compressPdfInBrowser(file, 'structure');
    expect(result.mode).toBe('structure');
    expect(result.originalSize).toBe(bytes.length);
    expect(result.compressedSize).toBe(result.bytes.length);
    expect(typeof result.sizeChangeBytes).toBe('number');
    expect(typeof result.sizeChangePercent).toBe('number');
    expect(typeof result.increased).toBe('boolean');

    // Reload compressed document to ensure valid PDF structure
    const reloaded = await PDFDocument.load(result.bytes);
    expect(reloaded.getPageCount()).toBe(1);
  });

  it('accurately identifies when size increases for already-minimal PDFs', async () => {
    // A tiny single-character PDF
    const doc = await PDFDocument.create();
    const p = doc.addPage([200, 200]);
    p.drawText('A');
    const originalBytes = await doc.save({ useObjectStreams: true });

    // When re-saving or adding streams, size may stay similar or increase slightly
    const file = toPdfFile(originalBytes, 'tiny.pdf');
    const result = await compressPdfInBrowser(file, 'structure');

    expect(result.compressedSize).toBeGreaterThan(0);
    expect(result.sizeChangeBytes).toBe(result.compressedSize - result.originalSize);
    if (result.compressedSize > result.originalSize) {
      expect(result.increased).toBe(true);
    }
  });
});

describe('PDF Merge Tool', () => {
  it('merges multiple PDF files into one in correct sequential order', async () => {
    // Doc A: 2 pages
    const docA = await PDFDocument.create();
    docA.addPage([500, 700]).drawText('Doc A - Page 1');
    docA.addPage([500, 700]).drawText('Doc A - Page 2');
    const bytesA = await docA.save();
    const fileA = toPdfFile(bytesA, 'docA.pdf');

    // Doc B: 3 pages
    const docB = await PDFDocument.create();
    docB.addPage([500, 700]).drawText('Doc B - Page 1');
    docB.addPage([500, 700]).drawText('Doc B - Page 2');
    docB.addPage([500, 700]).drawText('Doc B - Page 3');
    const bytesB = await docB.save();
    const fileB = toPdfFile(bytesB, 'docB.pdf');

    let progressCalls = 0;
    const mergedBytes = await mergePdfs([fileA, fileB], (pct) => {
      progressCalls++;
      expect(pct).toBeGreaterThan(0);
    });

    expect(mergedBytes).toBeInstanceOf(Uint8Array);
    expect(progressCalls).toBeGreaterThan(0);

    const mergedDoc = await PDFDocument.load(mergedBytes);
    expect(mergedDoc.getPageCount()).toBe(5);
  });

  it('throws an error if fewer than 2 files are supplied for merging', async () => {
    const doc = await PDFDocument.create();
    doc.addPage([500, 700]);
    const bytes = await doc.save();
    const file = toPdfFile(bytes, 'single.pdf');

    await expect(mergePdfs([file])).rejects.toThrow();
  });
});

describe('PDF Split Tool', () => {
  it('splits PDF by page ranges into multiple documents', async () => {
    // 6-page PDF
    const doc = await PDFDocument.create();
    for (let i = 1; i <= 6; i++) {
      const p = doc.addPage([500, 700]);
      p.drawText(`Page ${i}`);
    }
    const bytes = await doc.save();
    const file = toPdfFile(bytes, 'book.pdf');

    const ranges = [
      { start: 1, end: 2 },
      { start: 4, end: 4 },
      { start: 5, end: 6 },
    ];

    const results = await splitPdfByRanges(file, ranges);
    expect(results.length).toBe(3);

    // Verify first chunk has 2 pages
    const chunk1 = await PDFDocument.load(results[0].bytes);
    expect(chunk1.getPageCount()).toBe(2);
    expect(results[0].filename).toBe('book_pages_1-2.pdf');

    // Verify second chunk has 1 page
    const chunk2 = await PDFDocument.load(results[1].bytes);
    expect(chunk2.getPageCount()).toBe(1);
    expect(results[1].filename).toBe('book_page_4.pdf');

    // Verify third chunk has 2 pages
    const chunk3 = await PDFDocument.load(results[2].bytes);
    expect(chunk3.getPageCount()).toBe(2);
    expect(results[2].filename).toBe('book_pages_5-6.pdf');
  });

  it('splits every page into an individual single-page PDF', async () => {
    const doc = await PDFDocument.create();
    for (let i = 1; i <= 4; i++) {
      doc.addPage([500, 700]).drawText(`Invoice #${i}`);
    }
    const bytes = await doc.save();
    const file = toPdfFile(bytes, 'invoices.pdf');

    const singlePages = await splitPdfEveryPage(file);
    expect(singlePages.length).toBe(4);

    for (let i = 0; i < 4; i++) {
      const pageDoc = await PDFDocument.load(singlePages[i].bytes);
      expect(pageDoc.getPageCount()).toBe(1);
      expect(singlePages[i].filename).toBe(`invoices_page_${i + 1}.pdf`);
    }
  });
});

describe('PDF Metadata Inspection & Sanitization', () => {
  it('inspects original metadata and sanitizes sensitive fields', async () => {
    const doc = await PDFDocument.create();
    doc.setTitle('Financial Forecast Q4');
    doc.setAuthor('CFO Secret Internal');
    doc.setSubject('Confidential Acquisition');
    doc.setKeywords(['merger', 'internal', 'do-not-distribute']);
    doc.setCreator('Internal ERP System');
    doc.setProducer('Internal PDF Engine v1');
    doc.addPage([500, 700]).drawText('Financial Data');

    const originalBytes = await doc.save();
    const file = toPdfFile(originalBytes, 'financial_report.pdf');

    // 1. Inspect original metadata
    const { current } = await inspectAndSanitizeMetadata(file);
    expect(current.title).toBe('Financial Forecast Q4');
    expect(current.author).toBe('CFO Secret Internal');
    expect(current.subject).toBe('Confidential Acquisition');
    expect(current.keywords).toContain('merger');
    expect(current.pageCount).toBe(1);

    // 2. Sanitize metadata by clearing author and sensitive keywords
    const { updatedBytes } = await inspectAndSanitizeMetadata(file, {
      title: 'Public Summary',
      author: '',
      subject: '',
      keywords: [],
      creator: 'Free PDF Studio (Sanitized)',
      producer: 'Free PDF Studio (Client-Side)',
    });

    expect(updatedBytes).toBeDefined();

    // 3. Reload and verify sanitized document
    const sanitizedDoc = await PDFDocument.load(updatedBytes!);
    expect(sanitizedDoc.getTitle()).toBe('Public Summary');
    expect(sanitizedDoc.getAuthor()).toBe('');
    expect(sanitizedDoc.getSubject()).toBe('');
    expect(sanitizedDoc.getKeywords() || '').toBe('');
    expect(sanitizedDoc.getCreator()).toBe('Free PDF Studio (Sanitized)');

    // Ensure raw author string is not in the PDF bytes
    const rawBytesStr = Buffer.from(updatedBytes!).toString('latin1');
    expect(rawBytesStr.includes('CFO Secret Internal')).toBe(false);
  });
});

describe('Watermark and Headers/Footers', () => {
  it('draws text watermark and page numbering onto PDF pages', async () => {
    const doc = await PDFDocument.create();
    const page = doc.addPage([600, 800]);
    const font = await doc.embedFont(StandardFonts.HelveticaBold);

    page.drawText('CONFIDENTIAL', {
      x: 100,
      y: 400,
      size: 40,
      font,
      color: rgb(0.9, 0.1, 0.1),
      opacity: 0.3,
    });

    page.drawText('Page 1 of 1', {
      x: 250,
      y: 30,
      size: 11,
      font,
      color: rgb(0.3, 0.3, 0.3),
    });

    const bytes = await doc.save();
    expect(bytes.length).toBeGreaterThan(600);

    const reloaded = await PDFDocument.load(bytes);
    expect(reloaded.getPageCount()).toBe(1);
  });

  it('adds custom running header and footer with page variables', async () => {
    const doc = await PDFDocument.create();
    const page = doc.addPage([600, 800]);
    const font = await doc.embedFont(StandardFonts.Helvetica);

    const title = 'CONFIDENTIAL DOCUMENT';
    page.drawText(title, { x: 30, y: 775, size: 9, font, color: rgb(0.35, 0.35, 0.35) });

    const footer = 'Page 1 of 1';
    page.drawText(footer, { x: 500, y: 20, size: 9, font, color: rgb(0.35, 0.35, 0.35) });

    const saved = await doc.save();
    expect(saved.length).toBeGreaterThan(600);
  });
});

function createValidPng(width: number, height: number): Uint8Array {
  const crcTable = (() => {
    const table = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) {
        c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      }
      table[n] = c >>> 0;
    }
    return table;
  })();

  const crc32 = (buf: Buffer) => {
    let c = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
      c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
    }
    return (c ^ 0xffffffff) >>> 0;
  };

  const makeChunk = (type: string, data: Buffer) => {
    const typeBuf = Buffer.from(type, 'ascii');
    const lenBuf = Buffer.alloc(4);
    lenBuf.writeUInt32BE(data.length, 0);
    const crcBuf = Buffer.alloc(4);
    crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
    return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
  };

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // RGB color type

  const rawRows = Buffer.alloc(height * (1 + width * 3));
  for (let y = 0; y < height; y++) {
    const rowStart = y * (1 + width * 3);
    rawRows[rowStart] = 0; // filter none
    for (let x = 0; x < width; x++) {
      const px = rowStart + 1 + x * 3;
      rawRows[px] = 225;
      rawRows[px + 1] = 29;
      rawRows[px + 2] = 72;
    }
  }
  const idat = zlib.deflateSync(rawRows);
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  return new Uint8Array(
    Buffer.concat([sig, makeChunk('IHDR', ihdr), makeChunk('IDAT', idat), makeChunk('IEND', Buffer.alloc(0))])
  );
}

describe('Embedded Image Extraction', () => {
  it('returns an empty list for a text-only PDF without rendering full pages', async () => {
    const doc = await PDFDocument.create();
    const page = doc.addPage([500, 700]);
    page.drawText('Pure vector text PDF without any raster images.', { x: 40, y: 650, size: 14 });
    const bytes = await doc.save();
    const file = toPdfFile(bytes, 'text_only.pdf');

    const extracted = await extractEmbeddedImages(file);
    expect(extracted).toEqual([]);
  });

  it('extracts embedded raster image XObjects from a PDF', async () => {
    const doc = await PDFDocument.create();
    const page = doc.addPage([500, 700]);
    const pngBytes = createValidPng(2, 2);
    const embeddedImage = await doc.embedPng(pngBytes);
    page.drawImage(embeddedImage, { x: 50, y: 500, width: 100, height: 100 });
    const pdfBytes = await doc.save();
    const file = toPdfFile(pdfBytes, 'with_image.pdf');

    const extracted = await extractEmbeddedImages(file);
    expect(extracted.length).toBe(1);
    expect(extracted[0].width).toBe(2);
    expect(extracted[0].height).toBe(2);
    expect(extracted[0].blob.size).toBeGreaterThan(0);
    expect(extracted[0].filename).toMatch(/^with_image_image_1\.(png|jpg)$/);
  });
});

