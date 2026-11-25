import { throwIfAborted } from '../utils/fileUtils';
import { loadPdfJsDocument } from './pdfService';

export interface PdfToWordResult {
  bytes: Uint8Array;
  pageCount: number;
  paragraphCount: number;
  tableCount: number;
  pagesWithoutText: number[];
  ocrPagesUsed: number;
}

export interface PdfToWordOptions {
  ocrTextByPage?: Map<number, string>;
  onProgress?: (progress: number) => void;
  signal?: AbortSignal;
}

interface PositionedTextRun {
  str: string;
  x: number;
  y: number;
  width: number;
  fontSize: number;
  hasEOL: boolean;
}

interface TextSegment {
  text: string;
  xStart: number;
  xEnd: number;
  fontSize: number;
}

interface ExtractedLine {
  y: number;
  fontSize: number;
  text: string;
  segments: TextSegment[];
  isArabic: boolean;
}

const ARABIC_CHAR_REGEX = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
const ARABIC_GLOBAL_REGEX = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/g;

export function isMostlyArabicText(text: string): boolean {
  const arabicMatches = text.match(ARABIC_GLOBAL_REGEX);
  if (!arabicMatches) return false;
  const nonSpace = text.replace(/\s+/g, '');
  if (!nonSpace.length) return false;
  return arabicMatches.length / nonSpace.length >= 0.25 || ARABIC_CHAR_REGEX.test(nonSpace[0]);
}

function estimateBodyFontSize(allRuns: PositionedTextRun[]): number {
  const counts = new Map<number, number>();
  let totalChars = 0;

  for (const r of allRuns) {
    const trimmed = r.str.trim();
    if (!trimmed) continue;
    const roundedSize = Math.round(r.fontSize * 2) / 2;
    counts.set(roundedSize, (counts.get(roundedSize) || 0) + trimmed.length);
    totalChars += trimmed.length;
  }

  if (totalChars === 0) return 11;

  let bestSize = 11;
  let bestWeight = -1;
  for (const [size, weight] of counts.entries()) {
    if (weight > bestWeight) {
      bestWeight = weight;
      bestSize = size;
    }
  }
  return bestSize || 11;
}

function buildLinesFromRuns(runs: PositionedTextRun[]): ExtractedLine[] {
  if (runs.length === 0) return [];

  // Sort top-to-bottom (higher PDF Y = higher on page)
  const sortedByY = [...runs].sort((a, b) => b.y - a.y);

  const rawRows: PositionedTextRun[][] = [];
  for (const run of sortedByY) {
    const lastRow = rawRows[rawRows.length - 1];
    if (!lastRow) {
      rawRows.push([run]);
      continue;
    }
    const rowY = lastRow[0].y;
    const avgSize = (lastRow[0].fontSize + run.fontSize) / 2;
    const yTolerance = Math.max(3, avgSize * 0.45);
    if (Math.abs(run.y - rowY) <= yTolerance) {
      lastRow.push(run);
    } else {
      rawRows.push([run]);
    }
  }

  const lines: ExtractedLine[] = [];

  for (const row of rawRows) {
    // Sort visually left-to-right for gap/column segmentation
    const sortedX = [...row].sort((a, b) => a.x - b.x);
    const avgFontSize =
      row.reduce((sum, item) => sum + item.fontSize, 0) / Math.max(1, row.length);

    const colGapThreshold = Math.max(20, avgFontSize * 2.0);
    const segments: TextSegment[] = [];

    let currentItems: PositionedTextRun[] = [sortedX[0]];
    for (let i = 1; i < sortedX.length; i++) {
      const prev = sortedX[i - 1];
      const curr = sortedX[i];
      const prevRight = prev.x + Math.max(prev.width, prev.str.length * avgFontSize * 0.35);
      const gap = curr.x - prevRight;

      if (gap > colGapThreshold) {
        segments.push(mergeSegmentItems(currentItems, avgFontSize));
        currentItems = [curr];
      } else {
        currentItems.push(curr);
      }
    }
    if (currentItems.length > 0) {
      segments.push(mergeSegmentItems(currentItems, avgFontSize));
    }

    const nonEmptySegments = segments.filter((s) => s.text.trim().length > 0);
    if (nonEmptySegments.length === 0) continue;

    // Combine full line text cleanly (RTL segments ordered right-to-left if entire line is Arabic)
    const joinedAll = nonEmptySegments.map((s) => s.text).join(' ');
    const lineArabic = isMostlyArabicText(joinedAll);
    const lineText = (
      lineArabic && nonEmptySegments.length > 1
        ? [...nonEmptySegments].reverse().map((s) => s.text).join(' ')
        : joinedAll
    )
      .replace(/\s+/g, ' ')
      .trim();

    if (!lineText) continue;

    lines.push({
      y: row[0].y,
      fontSize: avgFontSize,
      text: lineText,
      segments: nonEmptySegments,
      isArabic: lineArabic,
    });
  }

  return lines;
}

function mergeSegmentItems(items: PositionedTextRun[], avgFontSize: number): TextSegment {
  const segTextRaw = items.map((i) => i.str).join(' ');
  const isArabicSeg = isMostlyArabicText(segTextRaw);
  // In visual X order, Arabic multi-word items on the same baseline appear right-to-left
  const ordered =
    isArabicSeg && items.length > 1 ? [...items].reverse() : items;

  let text = '';
  for (let i = 0; i < ordered.length; i++) {
    const piece = ordered[i].str;
    if (!piece) continue;
    if (!text) {
      text = piece;
    } else if (/^\s|\s$/.test(text.slice(-1)) || /^\s/.test(piece)) {
      text += piece;
    } else if (/^[,.;:!?،؛)]/.test(piece)) {
      text += piece;
    } else {
      text += ' ' + piece;
    }
  }

  const xStart = Math.min(...items.map((i) => i.x));
  const xEnd = Math.max(...items.map((i) => i.x + Math.max(i.width, avgFontSize * 0.5)));

  return {
    text: text.replace(/\s+/g, ' ').trim(),
    xStart,
    xEnd,
    fontSize: avgFontSize,
  };
}

function tryDetectTableBlock(
  lines: ExtractedLine[],
  startIndex: number
): { endIndex: number; rows: string[][]; isArabicTable: boolean } | null {
  if (startIndex >= lines.length - 1) return null;
  if (lines[startIndex].segments.length < 2) return null;

  // Collect consecutive multi-column lines with consistent vertical spacing
  const candidateRows: ExtractedLine[] = [lines[startIndex]];
  for (let i = startIndex + 1; i < lines.length; i++) {
    const line = lines[i];
    const prev = lines[i - 1];
    const dy = prev.y - line.y;
    if (line.segments.length < 2 || dy > Math.max(line.fontSize * 3.2, 42)) {
      break;
    }
    candidateRows.push(line);
  }

  if (candidateRows.length < 2) return null;

  // Cluster segment start positions into column anchors (tolerance = 26pt)
  const anchors: number[] = [];
  for (const row of candidateRows) {
    for (const seg of row.segments) {
      const existing = anchors.find((a) => Math.abs(a - seg.xStart) <= 26);
      if (existing === undefined) {
        anchors.push(seg.xStart);
      }
    }
  }
  anchors.sort((a, b) => a - b);

  if (anchors.length < 2 || anchors.length > 8) {
    return null;
  }

  // Verify at least 70% of rows populate at least 2 distinct columns cleanly
  const matrix: string[][] = [];
  let wellAlignedRows = 0;

  for (const row of candidateRows) {
    const cells = new Array<string>(anchors.length).fill('');
    let distinctCols = 0;
    for (const seg of row.segments) {
      let bestCol = 0;
      let bestDist = Infinity;
      for (let c = 0; c < anchors.length; c++) {
        const d = Math.abs(seg.xStart - anchors[c]);
        if (d < bestDist) {
          bestDist = d;
          bestCol = c;
        }
      }
      if (!cells[bestCol]) distinctCols++;
      cells[bestCol] = cells[bestCol] ? `${cells[bestCol]} ${seg.text}` : seg.text;
    }
    if (distinctCols >= 2) wellAlignedRows++;
    matrix.push(cells);
  }

  if (wellAlignedRows < 2 || wellAlignedRows / candidateRows.length < 0.7) {
    return null;
  }

  const allText = matrix.flat().join(' ');
  const isArabicTable = isMostlyArabicText(allText);
  const finalRows = isArabicTable
    ? matrix.map((cells) => [...cells].reverse())
    : matrix;

  return {
    endIndex: startIndex + candidateRows.length - 1,
    rows: finalRows,
    isArabicTable,
  };
}

/**
 * Convert a PDF document completely in-browser into a structured Word (.docx) file.
 * Supports heading detection, paragraph merging, aligned table extraction, page breaks,
 * Arabic RTL paragraphs, and optional OCR fallback text for scanned pages.
 */
export async function convertPdfToDocx(
  file: File | Uint8Array,
  options?: PdfToWordOptions
): Promise<PdfToWordResult> {
  const signal = options?.signal;
  const onProgress = options?.onProgress;
  throwIfAborted(signal);

  const [pdfDoc, docx] = await Promise.all([
    loadPdfJsDocument(file),
    import('docx'),
  ]);

  const {
    Document,
    Packer,
    Paragraph,
    TextRun,
    HeadingLevel,
    AlignmentType,
    PageBreak,
    Table,
    TableRow,
    TableCell,
    WidthType,
    BorderStyle,
  } = docx;

  try {
    const totalPages = pdfDoc.numPages;
    const perPageRuns: PositionedTextRun[][] = [];
    const allRuns: PositionedTextRun[] = [];

    // Pass 1: Extract raw text items across pages
    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
      throwIfAborted(signal);
      const page = await pdfDoc.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageRuns: PositionedTextRun[] = [];

      for (const item of textContent.items as any[]) {
        if (!item || typeof item.str !== 'string') continue;
        if (!item.str.trim()) continue;
        const transform = Array.isArray(item.transform) ? item.transform : [11, 0, 0, 11, 0, 0];
        const fontSize =
          Math.hypot(Number(transform[0]) || 0, Number(transform[1]) || 0) ||
          Math.abs(Number(transform[3]) || 0) ||
          11;
        const run: PositionedTextRun = {
          str: item.str,
          x: Number(transform[4]) || 0,
          y: Number(transform[5]) || 0,
          width: Number(item.width) || 0,
          fontSize,
          hasEOL: Boolean(item.hasEOL),
        };
        pageRuns.push(run);
        allRuns.push(run);
      }

      page.cleanup();
      perPageRuns.push(pageRuns);

      if (onProgress) {
        onProgress(Math.round((pageNum / totalPages) * 45));
      }
    }

    const bodyFontSize = estimateBodyFontSize(allRuns);
    const children: any[] = [];
    const pagesWithoutText: number[] = [];
    let paragraphCount = 0;
    let tableCount = 0;
    let ocrPagesUsed = 0;

    const makeStyledParagraph = (
      text: string,
      heading?: (typeof HeadingLevel)[keyof typeof HeadingLevel],
      explicitRtl?: boolean
    ) => {
      const rtl = explicitRtl ?? isMostlyArabicText(text);
      paragraphCount++;
      return new Paragraph({
        heading,
        bidirectional: rtl,
        alignment: rtl ? AlignmentType.RIGHT : AlignmentType.LEFT,
        spacing: { after: heading ? 160 : 120, line: 276 },
        children: [
          new TextRun({
            text,
            rightToLeft: rtl,
            font: 'Arial',
            size: heading === HeadingLevel.HEADING_1 ? 32 : heading === HeadingLevel.HEADING_2 ? 26 : 22,
            bold: Boolean(heading),
          }),
        ],
      });
    };

    // Pass 2: Build paragraphs, headings, tables, and page breaks
    for (let pageIdx = 0; pageIdx < totalPages; pageIdx++) {
      throwIfAborted(signal);
      const pageNum = pageIdx + 1;
      const runs = perPageRuns[pageIdx];

      if (pageIdx > 0) {
        children.push(new Paragraph({ children: [new PageBreak()] }));
      }

      const lines = buildLinesFromRuns(runs);
      const charCount = lines.reduce((acc, l) => acc + l.text.length, 0);
      const ocrText = options?.ocrTextByPage?.get(pageNum);

      if (charCount < 5) {
        if (ocrText && ocrText.trim().length > 0) {
          ocrPagesUsed++;
          const ocrParagraphs = ocrText
            .split(/\n{2,}/)
            .map((p) => p.replace(/\n+/g, ' ').trim())
            .filter(Boolean);
          for (const paraText of ocrParagraphs) {
            children.push(makeStyledParagraph(paraText));
          }
        } else {
          pagesWithoutText.push(pageNum);
        }
      } else {
        let i = 0;
        let bufferedLines: ExtractedLine[] = [];

        const flushBuffer = () => {
          if (bufferedLines.length === 0) return;
          const combined = bufferedLines.map((l) => l.text).join(' ').replace(/\s+/g, ' ').trim();
          if (combined) {
            children.push(makeStyledParagraph(combined));
          }
          bufferedLines = [];
        };

        while (i < lines.length) {
          const line = lines[i];

          // 1. Heading detection by font size ratio against median body text
          const isHeadingCandidate =
            line.text.length <= 140 &&
            line.fontSize >= bodyFontSize * 1.18 &&
            line.segments.length === 1;

          if (isHeadingCandidate) {
            flushBuffer();
            const headingLevel =
              line.fontSize >= bodyFontSize * 1.45
                ? HeadingLevel.HEADING_1
                : HeadingLevel.HEADING_2;
            children.push(makeStyledParagraph(line.text, headingLevel, line.isArabic));
            i++;
            continue;
          }

          // 2. Simple aligned-column table detection
          const tableBlock = tryDetectTableBlock(lines, i);
          if (tableBlock) {
            flushBuffer();
            tableCount++;
            const tableRows = tableBlock.rows.map((rowCells) => {
              return new TableRow({
                children: rowCells.map((cellText) => {
                  const rtlCell = isMostlyArabicText(cellText);
                  return new TableCell({
                    borders: {
                      top: { style: BorderStyle.SINGLE, size: 4, color: 'CBD5E1' },
                      bottom: { style: BorderStyle.SINGLE, size: 4, color: 'CBD5E1' },
                      left: { style: BorderStyle.SINGLE, size: 4, color: 'CBD5E1' },
                      right: { style: BorderStyle.SINGLE, size: 4, color: 'CBD5E1' },
                    },
                    children: [
                      new Paragraph({
                        bidirectional: rtlCell,
                        alignment: rtlCell ? AlignmentType.RIGHT : AlignmentType.LEFT,
                        spacing: { before: 40, after: 40 },
                        children: [
                          new TextRun({
                            text: cellText || ' ',
                            rightToLeft: rtlCell,
                            font: 'Arial',
                            size: 20,
                          }),
                        ],
                      }),
                    ],
                  });
                }),
              });
            });

            children.push(
              new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                visuallyRightToLeft: tableBlock.isArabicTable,
                rows: tableRows,
              })
            );
            children.push(new Paragraph({ text: '', spacing: { after: 80 } }));
            i = tableBlock.endIndex + 1;
            continue;
          }

          // 3. Merge adjacent lines into paragraphs when spacing & direction match
          if (bufferedLines.length > 0) {
            const prev = bufferedLines[bufferedLines.length - 1];
            const dy = prev.y - line.y;
            const sameDir = prev.isArabic === line.isArabic;
            const normalLineSpacing = dy >= 0 && dy <= Math.max(prev.fontSize, line.fontSize) * 1.75;
            if (!sameDir || !normalLineSpacing) {
              flushBuffer();
            }
          }

          bufferedLines.push(line);
          i++;
        }

        flushBuffer();
      }

      if (onProgress) {
        onProgress(45 + Math.round((pageNum / totalPages) * 45));
      }
    }

    throwIfAborted(signal);

    if (children.length === 0) {
      children.push(new Paragraph({ children: [new TextRun({ text: '', font: 'Arial' })] }));
    }

    const doc = new Document({
      creator: 'Free PDF Studio',
      description: 'Converted client-side by Free PDF Studio',
      sections: [
        {
          properties: {},
          children,
        },
      ],
    });

    let bytes: Uint8Array;
    if (typeof window !== 'undefined' && typeof Blob !== 'undefined') {
      const blob = await Packer.toBlob(doc);
      bytes = new Uint8Array(await blob.arrayBuffer());
    } else {
      const buffer = await Packer.toBuffer(doc);
      bytes = new Uint8Array(buffer);
    }

    if (onProgress) onProgress(100);

    return {
      bytes,
      pageCount: totalPages,
      paragraphCount,
      tableCount,
      pagesWithoutText,
      ocrPagesUsed,
    };
  } finally {
    await pdfDoc.loadingTask?.destroy().catch(() => {});
  }
}
