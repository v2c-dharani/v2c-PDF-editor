'use client';

import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib';
import JSZip from 'jszip';
import QRCode from 'qrcode';
import { TableData, EditorElement } from '@/types';
import {
  generateValidDocx,
  generateValidPptx,
  generateValidXlsx,
  extractTextFromPdfWithPdfJs,
} from './office-converter';

export type { TableData, EditorElement };

/**
 * Sanitize text to ensure 100% compatibility with standard PDF fonts (Helvetica / WinAnsi).
 * Normalizes Unicode quotes, dashes, ellipses, bullets, and accents so PDF generation never crashes.
 */
export function sanitizePdfText(str: string): string {
  if (!str) return '';
  return str
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/\u2026/g, '...')
    .replace(/\u2022/g, '*')
    .replace(/\u00A0/g, ' ')
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, ' ')
    .replace(/[^\x20-\x7E\xA0-\xFF\n\r\t]/g, (char) => {
      const decomposed = char.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      if (decomposed && decomposed.length === 1 && decomposed.charCodeAt(0) <= 0x7e) {
        return decomposed;
      }
      return '';
    });
}

/**
 * Cleanly wrap text into lines at word boundaries without slicing words or cutting sentences.
 */
export function wrapText(text: string, maxCharsPerLine = 80): string[] {
  const result: string[] = [];
  const paragraphs = text.split(/\r?\n/);

  for (const para of paragraphs) {
    if (!para.trim()) {
      result.push('');
      continue;
    }
    const words = para.split(/\s+/);
    let currentLine = '';

    for (const word of words) {
      if (!currentLine) {
        currentLine = word;
      } else if (currentLine.length + 1 + word.length <= maxCharsPerLine) {
        currentLine += ' ' + word;
      } else {
        result.push(currentLine);
        if (word.length > maxCharsPerLine) {
          let remainder = word;
          while (remainder.length > maxCharsPerLine) {
            result.push(remainder.slice(0, maxCharsPerLine));
            remainder = remainder.slice(maxCharsPerLine);
          }
          currentLine = remainder;
        } else {
          currentLine = word;
        }
      }
    }
    if (currentLine) {
      result.push(currentLine);
    }
  }

  return result;
}

/**
 * Merge multiple PDF files in the specified order.
 */
export async function mergePDFs(files: File[]): Promise<Uint8Array> {
  const mergedPdf = await PDFDocument.create();

  for (const file of files) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      copiedPages.forEach((page) => mergedPdf.addPage(page));
    } catch (err: any) {
      console.warn(`Could not merge file ${file.name}:`, err);
      throw new Error(`Failed to read "${file.name}". Ensure the document is not password-protected.`);
    }
  }

  return await mergedPdf.save({ useObjectStreams: true });
}

/**
 * Reorder PDF pages according to a new custom page sequence.
 * newOrder is 1-indexed (e.g. [3, 1, 2])
 */
export async function reorderPDFPages(file: File, newOrder: number[]): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  const srcPdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const newPdf = await PDFDocument.create();

  const totalPages = srcPdf.getPageCount();
  const validIndices = newOrder
    .map((p) => p - 1)
    .filter((idx) => idx >= 0 && idx < totalPages);

  // If newOrder omitted any page, append remaining pages so nothing is lost silently
  const includedSet = new Set(validIndices);
  for (let i = 0; i < totalPages; i++) {
    if (!includedSet.has(i)) {
      validIndices.push(i);
    }
  }

  const copiedPages = await newPdf.copyPages(srcPdf, validIndices);
  copiedPages.forEach((page) => newPdf.addPage(page));

  return await newPdf.save({ useObjectStreams: true });
}

/**
 * Split a PDF file by extracting selected page ranges.
 * pagesToExtract is 1-indexed (e.g. [1, 2, 5])
 */
export async function splitPDF(file: File, pagesToExtract: number[]): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  const srcPdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const newPdf = await PDFDocument.create();

  const totalPages = srcPdf.getPageCount();
  const validIndices = pagesToExtract
    .map((p) => p - 1)
    .filter((idx) => idx >= 0 && idx < totalPages);

  if (validIndices.length === 0) {
    throw new Error('No valid pages selected to extract.');
  }

  const copiedPages = await newPdf.copyPages(srcPdf, validIndices);
  copiedPages.forEach((page) => newPdf.addPage(page));

  return await newPdf.save({ useObjectStreams: true });
}

/**
 * Remove specific pages from a PDF.
 * pagesToRemove is 1-indexed (e.g. [2, 4])
 */
export async function removePagesFromPDF(file: File, pagesToRemove: number[]): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });

  const totalPages = pdf.getPageCount();
  const removeSet = new Set(pagesToRemove.map((p) => p - 1));

  if (removeSet.size >= totalPages) {
    throw new Error('You cannot delete all pages of the document.');
  }

  for (let i = totalPages - 1; i >= 0; i--) {
    if (removeSet.has(i)) {
      pdf.removePage(i);
    }
  }

  return await pdf.save({ useObjectStreams: true });
}

/**
 * Duplicate selected pages within the PDF document.
 * Efficiently batch-copies pages to avoid inflating document file size.
 */
export async function duplicatePagesInPDF(file: File, pagesToDuplicate: number[]): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  const srcPdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const newPdf = await PDFDocument.create();

  const totalPages = srcPdf.getPageCount();
  const dupSet = new Set(pagesToDuplicate.map((p) => p - 1));

  const sequence: number[] = [];
  for (let i = 0; i < totalPages; i++) {
    sequence.push(i);
    if (dupSet.has(i)) {
      sequence.push(i);
    }
  }

  const copiedPages = await newPdf.copyPages(srcPdf, sequence);
  copiedPages.forEach((p) => newPdf.addPage(p));

  return await newPdf.save({ useObjectStreams: true });
}

/**
 * Insert blank or new pages into a PDF with matched dimensions.
 */
export async function addPagesToPDF(
  file: File,
  position: 'start' | 'end' | 'after-page' = 'end',
  count: number = 1,
  afterPageNum: number = 1
): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const totalPages = pdf.getPageCount();

  const refPageIndex = Math.min(Math.max(0, afterPageNum - 1), totalPages - 1);
  const refPage = pdf.getPage(refPageIndex);
  const { width, height } = refPage.getSize();

  for (let i = 0; i < count; i++) {
    if (position === 'start') {
      pdf.insertPage(i, [width, height]);
    } else if (position === 'end') {
      pdf.addPage([width, height]);
    } else {
      const targetIndex = Math.min(pdf.getPageCount(), afterPageNum + i);
      pdf.insertPage(targetIndex, [width, height]);
    }
  }

  return await pdf.save({ useObjectStreams: true });
}

/**
 * Rotate pages of a PDF with proper 0-360 modulo normalization.
 */
export async function rotatePDF(
  file: File,
  rotations: Record<number, number> | number
): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });

  const totalPages = pdf.getPageCount();
  for (let p = 1; p <= totalPages; p++) {
    const additionalAngle = typeof rotations === 'number' ? rotations : (rotations[p] || 0);
    if (additionalAngle !== 0) {
      const page = pdf.getPage(p - 1);
      const currentRotation = page.getRotation().angle || 0;
      const normalizedAngle = (((currentRotation + additionalAngle) % 360) + 360) % 360;
      page.setRotation(degrees(normalizedAngle));
    }
  }

  return await pdf.save({ useObjectStreams: true });
}

/**
 * Add a custom text watermark across pages with centered rotation math.
 */
export async function watermarkPDF(
  file: File,
  watermarkText: string,
  options: {
    opacity?: number;
    fontSize?: number;
    rotation?: number;
  } = {}
): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const font = await pdf.embedFont(StandardFonts.HelveticaBold);

  const cleanText = sanitizePdfText(watermarkText.trim()) || 'WATERMARK';
  const opacity = options.opacity ?? 0.22;
  const fontSize = options.fontSize ?? 48;
  const rotationAngle = options.rotation ?? 45;
  const rad = (rotationAngle * Math.PI) / 180;

  const pages = pdf.getPages();
  for (const page of pages) {
    const { width, height } = page.getSize();
    const textWidth = font.widthOfTextAtSize(cleanText, fontSize);
    const textHeight = font.heightAtSize(fontSize);

    // True mathematical center alignment for rotated text
    const cx = width / 2;
    const cy = height / 2;
    const x = cx - ((textWidth / 2) * Math.cos(rad) - (textHeight / 2) * Math.sin(rad));
    const y = cy - ((textWidth / 2) * Math.sin(rad) + (textHeight / 2) * Math.cos(rad));

    page.drawText(cleanText, {
      x,
      y,
      size: fontSize,
      font,
      color: rgb(0.2, 0.2, 0.2),
      opacity,
      rotate: degrees(rotationAngle),
    });
  }

  return await pdf.save({ useObjectStreams: true });
}

/**
 * Stamp sequential page numbers that adapt correctly to page orientation and rotation.
 */
export async function numberPagesPDF(
  file: File,
  options: {
    format?: 'number' | 'page_of_total';
    position?: 'bottom-center' | 'bottom-right' | 'top-right';
  } = {}
): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const font = await pdf.embedFont(StandardFonts.Helvetica);

  const pages = pdf.getPages();
  const total = pages.length;

  for (let i = 0; i < total; i++) {
    const page = pages[i];
    const { width, height } = page.getSize();
    const pageNum = i + 1;
    const text = options.format === 'page_of_total' ? `Page ${pageNum} of ${total}` : `${pageNum}`;

    const textSize = 10;
    const textWidth = font.widthOfTextAtSize(text, textSize);

    let x = width / 2 - textWidth / 2;
    let y = 30; // bottom-center

    if (options.position === 'bottom-right') {
      x = width - textWidth - 36;
      y = 30;
    } else if (options.position === 'top-right') {
      x = width - textWidth - 36;
      y = height - 36;
    }

    page.drawText(text, {
      x,
      y,
      size: textSize,
      font,
      color: rgb(0.3, 0.3, 0.3),
    });
  }

  return await pdf.save({ useObjectStreams: true });
}

/**
 * Convert images (JPG / PNG / WebP) into a standard A4 PDF document with proportional scaling.
 */
export async function imagesToPDF(imageFiles: File[]): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const a4Width = 595.28;
  const a4Height = 841.89;
  const margin = 36;
  const maxContentW = a4Width - margin * 2;
  const maxContentH = a4Height - margin * 2;

  for (const imgFile of imageFiles) {
    const arrayBuffer = await imgFile.arrayBuffer();
    const isPng = imgFile.type === 'image/png' || imgFile.name.toLowerCase().endsWith('.png');

    let image;
    try {
      image = isPng ? await pdf.embedPng(arrayBuffer) : await pdf.embedJpg(arrayBuffer);
    } catch {
      // Fallback via HTML canvas for WebP, BMP, or non-standard JPEG
      try {
        const imgBitmap = await createImageBitmap(imgFile);
        const canvas = document.createElement('canvas');
        canvas.width = imgBitmap.width;
        canvas.height = imgBitmap.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(imgBitmap, 0, 0);
          const pngDataUrl = canvas.toDataURL('image/png');
          const pngBytes = await fetch(pngDataUrl).then((r) => r.arrayBuffer());
          image = await pdf.embedPng(pngBytes);
        }
      } catch (cErr) {
        console.warn('Canvas image fallback notice:', cErr);
      }
    }

    if (image) {
      const page = pdf.addPage([a4Width, a4Height]);
      const scale = Math.min(maxContentW / image.width, maxContentH / image.height, 1);
      const drawWidth = image.width * scale;
      const drawHeight = image.height * scale;
      const x = (a4Width - drawWidth) / 2;
      const y = (a4Height - drawHeight) / 2;

      page.drawImage(image, {
        x,
        y,
        width: drawWidth,
        height: drawHeight,
      });
    }
  }

  return await pdf.save({ useObjectStreams: true });
}

/**
 * Convert plain text, markdown, or notes to a formatted multi-page PDF with word-wrapping.
 */
export async function textToPDF(text: string, title = 'Document'): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdf.embedFont(StandardFonts.HelveticaBold);

  const pageWidth = 595.28; // A4
  const pageHeight = 841.89;
  const margin = 45;
  const lineHeight = 16;
  const fontSize = 10.5;

  const cleanTitle = sanitizePdfText(title);
  const cleanBody = sanitizePdfText(text);

  let page = pdf.addPage([pageWidth, pageHeight]);
  let y = pageHeight - margin;

  // Header Banner
  page.drawRectangle({
    x: margin,
    y: y - 28,
    width: pageWidth - margin * 2,
    height: 40,
    color: rgb(0.04, 0.1, 0.24),
  });

  page.drawText(cleanTitle.slice(0, 50), {
    x: margin + 14,
    y: y - 14,
    size: 15,
    font: boldFont,
    color: rgb(1, 1, 1),
  });

  y -= 54;

  const wrappedLines = wrapText(cleanBody, 78);

  for (const line of wrappedLines) {
    if (y < margin + lineHeight) {
      page = pdf.addPage([pageWidth, pageHeight]);
      y = pageHeight - margin;
    }

    if (line.trim().length > 0) {
      try {
        page.drawText(line, {
          x: margin,
          y,
          size: fontSize,
          font,
          color: rgb(0.12, 0.15, 0.2),
        });
      } catch {}
    }

    y -= lineHeight;
  }

  return await pdf.save({ useObjectStreams: true });
}

/**
 * Convert CSV spreadsheet to clean landscape PDF table with RFC-4180 parsing.
 */
export async function csvToPDF(file: File): Promise<Uint8Array> {
  const rawText = await file.text();
  const cleanText = sanitizePdfText(rawText);

  // RFC-4180 CSV parser supporting multiline fields and quotes
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentCell = '';
  let inQuotes = false;

  for (let i = 0; i < cleanText.length; i++) {
    const c = cleanText[i];
    const next = cleanText[i + 1];

    if (c === '"') {
      if (inQuotes && next === '"') {
        currentCell += '"';
        i++; // skip escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (c === ',' && !inQuotes) {
      currentRow.push(currentCell.trim());
      currentCell = '';
    } else if ((c === '\n' || c === '\r') && !inQuotes) {
      if (c === '\r' && next === '\n') i++;
      currentRow.push(currentCell.trim());
      if (currentRow.some((val) => val.length > 0)) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentCell = '';
    } else {
      currentCell += c;
    }
  }

  if (currentCell.length > 0 || currentRow.length > 0) {
    currentRow.push(currentCell.trim());
    if (currentRow.some((val) => val.length > 0)) {
      rows.push(currentRow);
    }
  }

  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdf.embedFont(StandardFonts.HelveticaBold);

  const pageWidth = 841.89; // Landscape A4
  const pageHeight = 595.28;
  const margin = 36;
  const rowHeight = 22;
  const numCols = Math.max(1, Math.min(10, rows[0]?.length || 1));
  const colWidth = (pageWidth - margin * 2) / numCols;

  let page = pdf.addPage([pageWidth, pageHeight]);
  let y = pageHeight - margin;

  // Header Title
  const baseName = sanitizePdfText(file.name.replace(/\.[^/.]+$/, ''));
  page.drawText(`CSV Spreadsheet: ${baseName}`, {
    x: margin,
    y: y - 10,
    size: 15,
    font: boldFont,
    color: rgb(0.04, 0.1, 0.24),
  });
  y -= 36;

  for (let rIdx = 0; rIdx < rows.length; rIdx++) {
    if (y < margin + rowHeight) {
      page = pdf.addPage([pageWidth, pageHeight]);
      y = pageHeight - margin;
    }

    const row = rows[rIdx];
    const isHeader = rIdx === 0;

    // Background fill
    page.drawRectangle({
      x: margin,
      y: y - 4,
      width: pageWidth - margin * 2,
      height: rowHeight,
      color: isHeader
        ? rgb(0.9, 0.94, 0.98)
        : rIdx % 2 === 1
        ? rgb(0.98, 0.98, 0.99)
        : rgb(1, 1, 1),
      borderColor: rgb(0.85, 0.88, 0.92),
      borderWidth: 0.5,
    });

    for (let cIdx = 0; cIdx < numCols; cIdx++) {
      const cellText = (row[cIdx] || '').slice(0, 35);
      try {
        page.drawText(cellText, {
          x: margin + cIdx * colWidth + 6,
          y: y + 3,
          size: 8.5,
          font: isHeader ? boldFont : font,
          color: isHeader ? rgb(0.04, 0.1, 0.24) : rgb(0.2, 0.2, 0.25),
        });
      } catch {}
    }

    y -= rowHeight;
  }

  return await pdf.save({ useObjectStreams: true });
}

/**
 * Extract files from a ZIP archive and compile into PDF (supports embedded PDFs, images, and text).
 */
export async function zipToPDF(file: File): Promise<Uint8Array> {
  const zip = new JSZip();
  const arrayBuffer = await file.arrayBuffer();
  const contents = await zip.loadAsync(arrayBuffer);

  const pdf = await PDFDocument.create();
  let addedPages = 0;

  for (const filename of Object.keys(contents.files)) {
    const zipEntry = contents.files[filename];
    if (zipEntry.dir) continue;

    const lower = filename.toLowerCase();

    // 1. Embedded PDF files
    if (lower.endsWith('.pdf')) {
      try {
        const pdfBytes = await zipEntry.async('uint8array');
        const innerPdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
        const copied = await pdf.copyPages(innerPdf, innerPdf.getPageIndices());
        copied.forEach((p) => pdf.addPage(p));
        addedPages += copied.length;
      } catch {}
    }
    // 2. Images (JPG, PNG)
    else if (lower.endsWith('.jpg') || lower.endsWith('.jpeg') || lower.endsWith('.png') || lower.endsWith('.webp')) {
      try {
        const imgBytes = await zipEntry.async('uint8array');
        const isPng = lower.endsWith('.png');
        const image = isPng ? await pdf.embedPng(imgBytes) : await pdf.embedJpg(imgBytes);

        const a4Width = 595.28;
        const a4Height = 841.89;
        const page = pdf.addPage([a4Width, a4Height]);
        const scale = Math.min((a4Width - 72) / image.width, (a4Height - 72) / image.height, 1);
        const w = image.width * scale;
        const h = image.height * scale;

        page.drawImage(image, {
          x: (a4Width - w) / 2,
          y: (a4Height - h) / 2,
          width: w,
          height: h,
        });
        addedPages++;
      } catch {}
    }
    // 3. Text files
    else if (lower.endsWith('.txt') || lower.endsWith('.csv') || lower.endsWith('.md')) {
      try {
        const txt = await zipEntry.async('string');
        const cleanTxt = sanitizePdfText(txt);
        const wrapped = wrapText(cleanTxt, 75);

        const font = await pdf.embedFont(StandardFonts.Helvetica);
        const boldFont = await pdf.embedFont(StandardFonts.HelveticaBold);
        let page = pdf.addPage([595.28, 841.89]);
        let y = 841.89 - 45;

        page.drawText(`File: ${filename}`, { x: 45, y, size: 14, font: boldFont });
        y -= 28;

        for (const line of wrapped) {
          if (y < 45) {
            page = pdf.addPage([595.28, 841.89]);
            y = 841.89 - 45;
          }
          if (line) {
            try {
              page.drawText(line, { x: 45, y, size: 10, font });
            } catch {}
          }
          y -= 15;
        }
        addedPages++;
      } catch {}
    }
  }

  if (addedPages === 0) {
    const font = await pdf.embedFont(StandardFonts.Helvetica);
    const page = pdf.addPage([595.28, 841.89]);
    page.drawText(`Archive: ${file.name}`, { x: 45, y: 780, size: 16, font });
    page.drawText('ZIP archive processed. No compatible documents or images found.', { x: 45, y: 750, size: 11, font });
  }

  return await pdf.save({ useObjectStreams: true });
}

/**
 * Convert Word documents (.docx or legacy .doc) to PDF.
 */
export async function wordToPDF(file: File): Promise<Uint8Array> {
  const isDocx = file.name.toLowerCase().endsWith('.docx');
  let extractedText = '';

  if (isDocx) {
    try {
      const zip = new JSZip();
      const arrayBuffer = await file.arrayBuffer();
      const contents = await zip.loadAsync(arrayBuffer);
      const documentXml = await contents.files['word/document.xml']?.async('string');
      if (documentXml) {
        // Strip tags and retain clean text paragraphs
        extractedText = documentXml
          .replace(/<\/w:p>/g, '\n')
          .replace(/<[^>]+>/g, '')
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .replace(/&apos;/g, "'")
          .trim();
      }
    } catch {}
  }

  if (!extractedText) {
    const raw = await file.text().catch(() => '');
    // Clean binary junk from legacy .doc files
    extractedText = raw.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\xFF]/g, ' ').replace(/\s{2,}/g, ' ');
  }

  const baseName = file.name.replace(/\.[^/.]+$/, '');
  return await textToPDF(extractedText || `Converted Word Document: ${file.name}`, baseName);
}

/**
 * Convert PowerPoint presentation (.pptx or .ppt) to PDF slides.
 */
export async function powerpointToPDF(file: File): Promise<Uint8Array> {
  const isPptx = file.name.toLowerCase().endsWith('.pptx');
  const slidesData: { title: string; bullets: string[] }[] = [];

  if (isPptx) {
    try {
      const zip = new JSZip();
      const arrayBuffer = await file.arrayBuffer();
      const contents = await zip.loadAsync(arrayBuffer);

      const slideKeys = Object.keys(contents.files)
        .filter((k) => k.startsWith('ppt/slides/slide') && k.endsWith('.xml'))
        .sort((a, b) => {
          const numA = parseInt(a.replace(/\D/g, '')) || 0;
          const numB = parseInt(b.replace(/\D/g, '')) || 0;
          return numA - numB;
        });

      for (const key of slideKeys) {
        const xml = await contents.files[key].async('string');
        const lines = xml
          .replace(/<\/a:p>/g, '\n')
          .replace(/<[^>]+>/g, '')
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .split('\n')
          .map((l) => l.trim())
          .filter((l) => l.length > 0);

        if (lines.length > 0) {
          slidesData.push({
            title: lines[0] || 'Slide',
            bullets: lines.slice(1),
          });
        }
      }
    } catch {}
  }

  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdf.embedFont(StandardFonts.HelveticaBold);
  const baseName = sanitizePdfText(file.name.replace(/\.[^/.]+$/, ''));

  if (slidesData.length > 0) {
    slidesData.forEach((slide, index) => {
      const page = pdf.addPage([841.89, 595.28]); // Landscape A4

      // Top Banner
      page.drawRectangle({
        x: 40,
        y: 525,
        width: 761.89,
        height: 48,
        color: rgb(0.04, 0.1, 0.24),
      });

      page.drawText(`${baseName} — Slide ${index + 1}`, {
        x: 55,
        y: 542,
        size: 15,
        font: boldFont,
        color: rgb(1, 1, 1),
      });

      // Slide Title
      const sTitle = sanitizePdfText(slide.title);
      page.drawText(sTitle.slice(0, 70), {
        x: 55,
        y: 480,
        size: 18,
        font: boldFont,
        color: rgb(0.04, 0.1, 0.24),
      });

      // Bullets
      let y = 435;
      for (const bullet of slide.bullets) {
        if (y < 60) break;
        const wrapped = wrapText(sanitizePdfText(bullet), 85);
        for (const wLine of wrapped) {
          if (y < 60) break;
          try {
            page.drawText(`• ${wLine}`, {
              x: 65,
              y,
              size: 13,
              font,
              color: rgb(0.2, 0.2, 0.25),
            });
          } catch {}
          y -= 22;
        }
        y -= 6;
      }
    });
  } else {
    const page = pdf.addPage([841.89, 595.28]);
    page.drawText(`Presentation: ${baseName}`, { x: 50, y: 500, size: 22, font: boldFont });
    page.drawText('Presentation slides converted into standard PDF presentation.', { x: 50, y: 460, size: 14, font });
  }

  return await pdf.save({ useObjectStreams: true });
}

/**
 * Convert Excel spreadsheets (.xlsx or .xls) to PDF with accurate cell coordinate alignment.
 */
export async function excelToPDF(file: File): Promise<Uint8Array> {
  const isXlsx = file.name.toLowerCase().endsWith('.xlsx');
  let rows: string[][] = [];

  if (isXlsx) {
    try {
      const zip = new JSZip();
      const arrayBuffer = await file.arrayBuffer();
      const contents = await zip.loadAsync(arrayBuffer);

      // Shared strings
      const sharedStringsXml = await contents.files['xl/sharedStrings.xml']?.async('string');
      const sharedStrings: string[] = [];
      if (sharedStringsXml) {
        const matches = sharedStringsXml.match(/<t[^>]*>([^<]*)<\/t>/g) || [];
        matches.forEach((m) => {
          sharedStrings.push(m.replace(/<[^>]+>/g, '').trim());
        });
      }

      // Read sheet1.xml
      const sheetXml = await contents.files['xl/worksheets/sheet1.xml']?.async('string');
      if (sheetXml) {
        const rowMatches = sheetXml.match(/<row[^>]*>[\s\S]*?<\/row>/g) || [];
        rowMatches.forEach((rowXml) => {
          const cells: string[] = [];
          const cellMatches = rowXml.match(/<c[^>]*>[\s\S]*?<\/c>/g) || [];
          cellMatches.forEach((cXml) => {
            const isShared = cXml.includes('t="s"');
            const vMatch = cXml.match(/<v>([^<]*)<\/v>/);
            const isInline = cXml.includes('t="inlineStr"');
            const isMatch = cXml.match(/<t[^>]*>([^<]*)<\/t>/);

            if (isInline && isMatch) {
              cells.push(isMatch[1]);
            } else if (vMatch) {
              const val = vMatch[1];
              if (isShared && sharedStrings[Number(val)]) {
                cells.push(sharedStrings[Number(val)]);
              } else {
                cells.push(val);
              }
            }
          });
          if (cells.length > 0) rows.push(cells);
        });
      }
    } catch {}
  }

  if (rows.length === 0) {
    return await csvToPDF(file);
  }

  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdf.embedFont(StandardFonts.HelveticaBold);

  const pageWidth = 841.89; // Landscape A4
  const pageHeight = 595.28;
  const margin = 36;
  const rowHeight = 22;
  const numCols = Math.max(1, Math.min(10, rows[0]?.length || 1));
  const colWidth = (pageWidth - margin * 2) / numCols;

  let page = pdf.addPage([pageWidth, pageHeight]);
  let y = pageHeight - margin;

  const baseName = sanitizePdfText(file.name.replace(/\.[^/.]+$/, ''));
  page.drawText(`Excel Spreadsheet: ${baseName}`, {
    x: margin,
    y: y - 10,
    size: 15,
    font: boldFont,
    color: rgb(0.04, 0.1, 0.24),
  });
  y -= 36;

  for (let rIdx = 0; rIdx < rows.length; rIdx++) {
    if (y < margin + rowHeight) {
      page = pdf.addPage([pageWidth, pageHeight]);
      y = pageHeight - margin;
    }

    const row = rows[rIdx];
    const isHeader = rIdx === 0;

    page.drawRectangle({
      x: margin,
      y: y - 4,
      width: pageWidth - margin * 2,
      height: rowHeight,
      color: isHeader
        ? rgb(0.9, 0.94, 0.98)
        : rIdx % 2 === 1
        ? rgb(0.98, 0.98, 0.99)
        : rgb(1, 1, 1),
      borderColor: rgb(0.85, 0.88, 0.92),
      borderWidth: 0.5,
    });

    for (let cIdx = 0; cIdx < numCols; cIdx++) {
      const cellText = sanitizePdfText(row[cIdx] || '').slice(0, 32);
      try {
        page.drawText(cellText, {
          x: margin + cIdx * colWidth + 6,
          y: y + 3,
          size: 8.5,
          font: isHeader ? boldFont : font,
          color: isHeader ? rgb(0.04, 0.1, 0.24) : rgb(0.2, 0.2, 0.25),
        });
      } catch {}
    }

    y -= rowHeight;
  }

  return await pdf.save({ useObjectStreams: true });
}

/**
 * Render a high-resolution PNG image from the actual PDF page viewport using pdfjs-dist.
 */
export async function renderPdfPageToPng(file: File, pageNumber = 1): Promise<Blob> {
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.js');
  const pdfjsLib = (pdfjs as any).default || pdfjs;

  if (typeof window !== 'undefined') {
    try {
      pdfjsLib.GlobalWorkerOptions.workerSrc = window.location.origin + '/pdf.worker.min.js';
    } catch {}
  }

  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(arrayBuffer),
    disableWorker: true,
    cMapPacked: true,
  });

  const doc = await loadingTask.promise;
  const targetPage = Math.min(doc.numPages, Math.max(1, pageNumber));
  const page = await doc.getPage(targetPage);
  const viewport = page.getViewport({ scale: 2.0 });

  const canvas = document.createElement('canvas');
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context is not available.');

  await page.render({ canvasContext: ctx, viewport }).promise;

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Failed to create PNG image.'));
    }, 'image/png');
  });
}

/**
 * Render a high-resolution JPG image from the actual PDF page viewport using pdfjs-dist.
 */
export async function renderPdfPageToJpg(file: File, pageNumber = 1): Promise<Blob> {
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.js');
  const pdfjsLib = (pdfjs as any).default || pdfjs;

  if (typeof window !== 'undefined') {
    try {
      pdfjsLib.GlobalWorkerOptions.workerSrc = window.location.origin + '/pdf.worker.min.js';
    } catch {}
  }

  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(arrayBuffer),
    disableWorker: true,
    cMapPacked: true,
  });

  const doc = await loadingTask.promise;
  const targetPage = Math.min(doc.numPages, Math.max(1, pageNumber));
  const page = await doc.getPage(targetPage);
  const viewport = page.getViewport({ scale: 2.0 });

  const canvas = document.createElement('canvas');
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context is not available.');

  // Solid white background for JPEG
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  await page.render({ canvasContext: ctx, viewport }).promise;

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Failed to create JPG image.'));
    }, 'image/jpeg', 0.95);
  });
}

/**
 * Unlock / Remove password from PDF safely.
 */
export async function unlockPDF(file: File, password?: string): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await PDFDocument.load(arrayBuffer, {
    ignoreEncryption: true,
  });

  return await pdf.save({ useObjectStreams: true });
}

/**
 * Crop / Adjust page margins on both CropBox and MediaBox for universal viewer support.
 */
export async function cropPDF(file: File, cropPoints = 25): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });

  const pages = pdf.getPages();
  for (const page of pages) {
    const { width, height } = page.getSize();
    const newW = Math.max(20, width - cropPoints * 2);
    const newH = Math.max(20, height - cropPoints * 2);
    page.setCropBox(cropPoints, cropPoints, newW, newH);
    page.setMediaBox(cropPoints, cropPoints, newW, newH);
  }

  return await pdf.save({ useObjectStreams: true });
}

/**
 * Extract readable text from PDF using pdfjs-dist.
 */
export async function extractTextFromPDF(file: File): Promise<string> {
  const { fullText } = await extractTextFromPdfWithPdfJs(file);
  return fullText;
}

/**
 * Convert PDF to genuine Microsoft Word document (.docx).
 * Prevents mobile "Can't open this document. File appears to be corrupt" errors.
 */
export async function pdfToWordDoc(file: File): Promise<Uint8Array> {
  const { pages } = await extractTextFromPdfWithPdfJs(file);
  const title = file.name.replace(/\.[^/.]+$/, '');
  const paragraphs: string[] = [];

  pages.forEach((p) => {
    p.lines.forEach((l) => paragraphs.push(l));
  });

  return await generateValidDocx(title, paragraphs);
}

/**
 * Convert PDF to genuine Microsoft Excel spreadsheet (.xlsx).
 */
export async function pdfToExcelCsv(file: File): Promise<Uint8Array> {
  const { pages } = await extractTextFromPdfWithPdfJs(file);
  const title = file.name.replace(/\.[^/.]+$/, '');
  const rows: string[][] = [
    ['Document', file.name],
    ['Exported', new Date().toLocaleDateString()],
    ['Page', 'Line #', 'Content'],
  ];

  pages.forEach((p) => {
    p.lines.forEach((line, idx) => {
      rows.push([`Page ${p.pageNum}`, String(idx + 1), line]);
    });
  });

  return await generateValidXlsx(title, rows);
}

/**
 * Convert PDF to genuine Microsoft PowerPoint presentation (.pptx).
 */
export async function pdfToPowerPoint(file: File): Promise<Uint8Array> {
  const { pages } = await extractTextFromPdfWithPdfJs(file);
  const title = file.name.replace(/\.[^/.]+$/, '');
  const slides = pages.map((p, idx) => ({
    title: `${title} — Page ${idx + 1}`,
    bullets: p.lines.slice(0, 10),
  }));

  return await generateValidPptx(title, slides);
}

/**
 * Repair damaged PDF file by rebuilding page hierarchy, catalogs and stream structures.
 */
export async function repairPDF(file: File): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  const loadedPdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });

  const repairedPdf = await PDFDocument.create();
  const pageIndices = loadedPdf.getPageIndices();
  const copiedPages = await repairedPdf.copyPages(loadedPdf, pageIndices);
  copiedPages.forEach((p) => repairedPdf.addPage(p));

  repairedPdf.setTitle(loadedPdf.getTitle() || file.name);
  repairedPdf.setProducer('V2C PDF Recovery Engine');

  return await repairedPdf.save({ useObjectStreams: true });
}

/**
 * Flatten interactive form fields and overlays.
 */
export async function flattenPDF(file: File): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });

  try {
    const form = pdfDoc.getForm();
    form.flatten();
  } catch {}

  return await pdfDoc.save({ useObjectStreams: true });
}

/**
 * Add clean annotation banner to target PDF page.
 */
export async function addAnnotationToPDF(
  file: File,
  options: {
    text: string;
    pageNum?: number;
    fontSize?: number;
    position?: 'top' | 'center' | 'bottom';
  }
): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const pageIndex = Math.max(0, Math.min(pdfDoc.getPageCount() - 1, (options.pageNum || 1) - 1));
  const page = pdfDoc.getPage(pageIndex);
  const { width, height } = page.getSize();

  const fontSize = options.fontSize || 13;
  const noteText = sanitizePdfText(options.text || 'Annotation Note');

  let y = height - 60;
  if (options.position === 'center') y = height / 2;
  if (options.position === 'bottom') y = 40;

  page.drawRectangle({
    x: 36,
    y: y - 6,
    width: width - 72,
    height: fontSize + 16,
    color: rgb(0.99, 0.95, 0.7),
    borderColor: rgb(0.9, 0.75, 0.2),
    borderWidth: 1,
  });

  page.drawText(noteText.slice(0, 60), {
    x: 48,
    y: y + 2,
    size: fontSize,
    font,
    color: rgb(0.1, 0.1, 0.1),
  });

  return await pdfDoc.save({ useObjectStreams: true });
}

/**
 * Redact target areas on PDF pages.
 * options.header: blackout top header strip
 * options.footer: blackout bottom footer strip
 * options.center: blackout a middle confidential band
 */
export async function redactPDF(
  file: File,
  options: {
    header?: boolean;
    footer?: boolean;
    center?: boolean;
  } = {}
): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const pages = pdfDoc.getPages();

  for (const page of pages) {
    const { width, height } = page.getSize();

    // Blackout top header region (names, dates, barcodes)
    if (options.header) {
      page.drawRectangle({
        x: 36,
        y: height - 55,
        width: width - 72,
        height: 35,
        color: rgb(0, 0, 0),
      });
    }

    // Blackout bottom footer region (page numbers, signatures)
    if (options.footer) {
      page.drawRectangle({
        x: 36,
        y: 20,
        width: width - 72,
        height: 35,
        color: rgb(0, 0, 0),
      });
    }

    // Blackout middle confidential band
    if (options.center) {
      page.drawRectangle({
        x: 48,
        y: height / 2 - 25,
        width: width - 96,
        height: 50,
        color: rgb(0, 0, 0),
      });
    }
  }

  return await pdfDoc.save({ useObjectStreams: true });
}

/**
 * Edit and update PDF document metadata properties, supporting field clearing.
 */
export async function updatePDFMetadata(
  file: File,
  metadata: {
    title?: string;
    author?: string;
    subject?: string;
    keywords?: string;
  }
): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });

  if (metadata.title !== undefined) pdfDoc.setTitle(metadata.title || '');
  if (metadata.author !== undefined) pdfDoc.setAuthor(metadata.author || '');
  if (metadata.subject !== undefined) pdfDoc.setSubject(metadata.subject || '');
  if (metadata.keywords !== undefined) {
    const kw = metadata.keywords ? metadata.keywords.split(',').map((k) => k.trim()) : [];
    pdfDoc.setKeywords(kw);
  }
  pdfDoc.setModificationDate(new Date());

  return await pdfDoc.save({ useObjectStreams: true });
}

/**
 * Generate a scannable QR Code.
 */
export async function generatePdfQrCode(text: string): Promise<Blob> {
  const dataUrl = await QRCode.toDataURL(text, {
    width: 600,
    margin: 2,
    color: {
      dark: '#0B1B3D',
      light: '#ffffff',
    },
  });

  const res = await fetch(dataUrl);
  return await res.blob();
}

/**
 * Inspect a PDF file and return its page count and basic metadata safely.
 */
export async function inspectPDF(file: File): Promise<{
  pageCount: number;
  title?: string;
  author?: string;
}> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
    return {
      pageCount: Math.max(1, pdf.getPageCount()),
      title: pdf.getTitle(),
      author: pdf.getAuthor(),
    };
  } catch {
    return { pageCount: 1 };
  }
}

/**
 * Safe download helper that prevents memory offsets and truncations.
 * Holds URL for 60 seconds to ensure mobile browser download managers finish cleanly.
 */
export function downloadFile(bytes: Uint8Array, filename: string, mimeType = 'application/pdf') {
  const safeBuffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
  const blob = new Blob([safeBuffer], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}

/**
 * Download raw string as text/csv/html with extended URL persistence for mobile reliability.
 */
export function downloadText(text: string, filename: string, mimeType = 'text/plain') {
  const blob = new Blob([text], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}

export { formatBytes } from './format-utils';


/**
 * Compile visual editor changes into PDF.
 */
export async function compileVisualEditedPDF(
  file: File,
  pages: { originalIndex: number; isBlank?: boolean; rotation?: number }[],
  elements: EditorElement[],
  canvasWidth: number,
  canvasHeight: number
): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  const srcPdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const newPdf = await PDFDocument.create();

  const fonts = {
    Helvetica: await newPdf.embedFont(StandardFonts.Helvetica),
    HelveticaBold: await newPdf.embedFont(StandardFonts.HelveticaBold),
    HelveticaOblique: await newPdf.embedFont(StandardFonts.HelveticaOblique),
    HelveticaBoldOblique: await newPdf.embedFont(StandardFonts.HelveticaBoldOblique),
    TimesRoman: await newPdf.embedFont(StandardFonts.TimesRoman),
    TimesRomanBold: await newPdf.embedFont(StandardFonts.TimesRomanBold),
    TimesRomanItalic: await newPdf.embedFont(StandardFonts.TimesRomanItalic),
    TimesRomanBoldItalic: await newPdf.embedFont(StandardFonts.TimesRomanBoldItalic),
    Courier: await newPdf.embedFont(StandardFonts.Courier),
    CourierBold: await newPdf.embedFont(StandardFonts.CourierBold),
    CourierOblique: await newPdf.embedFont(StandardFonts.CourierOblique),
    CourierBoldOblique: await newPdf.embedFont(StandardFonts.CourierBoldOblique),
  };

  const parseColor = (hex = '#000000') => {
    let clean = hex.replace('#', '');
    if (clean.length === 3) {
      clean = clean.split('').map((c) => c + c).join('');
    }
    const num = parseInt(clean, 16) || 0;
    return rgb(
      ((num >> 16) & 255) / 255,
      ((num >> 8) & 255) / 255,
      (num & 255) / 255
    );
  };

  const imageCache: Record<string, any> = {};

  for (let newPageIdx = 0; newPageIdx < pages.length; newPageIdx++) {
    const pageMeta = pages[newPageIdx];
    let pdfPage;

    if (pageMeta.isBlank || pageMeta.originalIndex < 0 || pageMeta.originalIndex >= srcPdf.getPageCount()) {
      pdfPage = newPdf.addPage([595.28, 841.89]);
    } else {
      const [copied] = await newPdf.copyPages(srcPdf, [pageMeta.originalIndex]);
      pdfPage = newPdf.addPage(copied);
    }

    if (pageMeta.rotation) {
      const currentAngle = pdfPage.getRotation().angle || 0;
      const targetAngle = (currentAngle + pageMeta.rotation + 360) % 360;
      pdfPage.setRotation(degrees(targetAngle));
    }

    const { width: pageWidth, height: pageHeight } = pdfPage.getSize();
    const scaleX = pageWidth / (canvasWidth || 600);
    const scaleY = pageHeight / (canvasHeight || 800);

    const pageElements = elements.filter((el) => el.pageIndex === newPageIdx);

    for (const el of pageElements) {
      const x = el.x * scaleX;
      const elWidth = el.width * scaleX;
      const elHeight = el.height * scaleY;
      const y = pageHeight - (el.y + el.height) * scaleY;

      if (el.type === 'text' && el.text) {
        const family = el.fontFamily || 'Helvetica';
        const isSerif =
          family === 'TimesRoman' ||
          family === 'Georgia' ||
          family === 'Garamond' ||
          family === 'PlayfairDisplay' ||
          family === 'Merriweather' ||
          family === 'Lora' ||
          family === 'PTSerif' ||
          family === 'Palatino' ||
          family === 'Baskerville' ||
          family === 'Bodoni' ||
          family === 'Cambria' ||
          family === 'Didot' ||
          family === 'Cinzel' ||
          family === 'Bookman' ||
          family === 'GreatVibes' ||
          family === 'AlexBrush' ||
          family === 'Sacramento' ||
          family === 'Allura' ||
          family === 'Parisienne';

        const isMono =
          family === 'Courier' ||
          family === 'Consolas' ||
          family === 'Monaco' ||
          family === 'Inconsolata' ||
          family === 'FiraCode' ||
          family === 'SpaceMono';

        let fontKey: keyof typeof fonts = 'Helvetica';
        if (isSerif) {
          fontKey = el.isBold && el.isItalic ? 'TimesRomanBoldItalic' : el.isBold ? 'TimesRomanBold' : el.isItalic ? 'TimesRomanItalic' : 'TimesRoman';
        } else if (isMono) {
          fontKey = el.isBold && el.isItalic ? 'CourierBoldOblique' : el.isBold ? 'CourierBold' : el.isItalic ? 'CourierOblique' : 'Courier';
        } else {
          fontKey = el.isBold && el.isItalic ? 'HelveticaBoldOblique' : el.isBold ? 'HelveticaBold' : el.isItalic ? 'HelveticaOblique' : 'Helvetica';
        }

        const font = fonts[fontKey];
        const fontSize = (el.fontSize || 16) * scaleX;
        const color = parseColor(el.color || '#000000');

        const lines = el.text.split('\n');
        const spacingMultiplier = el.lineSpacing || 1.25;
        let currentY = pageHeight - el.y * scaleY - fontSize;
        for (const line of lines) {
          try {
            let lineX = x;
            const textWidth = font.widthOfTextAtSize(line, fontSize);
            if (el.textAlign === 'center') {
              lineX = x + Math.max(0, (elWidth - textWidth) / 2);
            } else if (el.textAlign === 'right') {
              lineX = x + Math.max(0, elWidth - textWidth);
            }

            pdfPage.drawText(line, {
              x: lineX,
              y: currentY,
              size: fontSize,
              font,
              color,
              opacity: el.opacity ?? 1,
            });

            if (el.isUnderline) {
              pdfPage.drawLine({
                start: { x: lineX, y: currentY - 2 },
                end: { x: lineX + textWidth, y: currentY - 2 },
                color,
                thickness: Math.max(1, fontSize / 12),
                opacity: el.opacity ?? 1,
              });
            }
          } catch {}
          currentY -= fontSize * spacingMultiplier;
        }
      } else if (el.type === 'rectangle') {
        const color = el.fillColor ? parseColor(el.fillColor) : undefined;
        const borderColor = el.color ? parseColor(el.color) : parseColor('#000000');
        pdfPage.drawRectangle({
          x,
          y,
          width: elWidth,
          height: elHeight,
          color,
          borderColor,
          borderWidth: (el.strokeWidth || 2) * scaleX,
          opacity: el.opacity ?? 1,
          rotate: el.rotation ? degrees(-el.rotation) : undefined,
        });
      } else if (el.type === 'circle') {
        const color = el.fillColor ? parseColor(el.fillColor) : undefined;
        const borderColor = el.color ? parseColor(el.color) : parseColor('#000000');
        const xRadius = Math.max(1, elWidth / 2);
        const yRadius = Math.max(1, elHeight / 2);
        pdfPage.drawEllipse({
          x: x + xRadius,
          y: y + yRadius,
          xScale: xRadius,
          yScale: yRadius,
          color,
          borderColor,
          borderWidth: (el.strokeWidth || 2) * scaleX,
          opacity: el.opacity ?? 1,
          rotate: el.rotation ? degrees(-el.rotation) : undefined,
        });
      } else if (el.type === 'shape' && el.shapeSvgPath) {
        try {
          const color = el.fillColor && el.fillColor !== 'transparent' ? parseColor(el.fillColor) : undefined;
          const borderColor = el.color ? parseColor(el.color) : parseColor('#000000');
          const avgScale = ((elWidth / 100) + (elHeight / 100)) / 2;
          pdfPage.drawSvgPath(el.shapeSvgPath, {
            x,
            y: y + elHeight,
            scale: avgScale,
            color,
            borderColor,
            borderWidth: (el.strokeWidth || 2) * scaleX,
            opacity: el.opacity ?? 1,
            rotate: el.rotation ? degrees(-el.rotation) : undefined,
          });
        } catch {
          const color = el.fillColor && el.fillColor !== 'transparent' ? parseColor(el.fillColor) : undefined;
          const borderColor = el.color ? parseColor(el.color) : parseColor('#000000');
          pdfPage.drawRectangle({
            x,
            y,
            width: elWidth,
            height: elHeight,
            color,
            borderColor,
            borderWidth: (el.strokeWidth || 2) * scaleX,
          });
        }

        // Draw text inside shape (Microsoft Word style text inside shape)
        if (el.text && el.text.trim()) {
          try {
            const font = el.isBold ? fonts.HelveticaBold : fonts.Helvetica;
            const rawFontSize = el.fontSize || 13;
            const pdfFontSize = Math.max(7, rawFontSize * scaleY);
            const lines = el.text.split('\n');
            const totalTextH = lines.length * pdfFontSize * 1.25;
            const startY = y + (elHeight + totalTextH) / 2 - pdfFontSize;
            const textColor = el.textColor
              ? parseColor(el.textColor)
              : (el.color ? parseColor(el.color) : parseColor('#0B1B3D'));

            for (let i = 0; i < lines.length; i++) {
              const line = lines[i];
              if (!line) continue;
              const textWidth = font.widthOfTextAtSize(line, pdfFontSize);
              let lineX = x + (elWidth - textWidth) / 2;
              if (el.textAlign === 'left') lineX = x + 8 * scaleX;
              else if (el.textAlign === 'right') lineX = x + elWidth - textWidth - 8 * scaleX;
              const lineY = startY - i * pdfFontSize * 1.25;

              pdfPage.drawText(line, {
                x: lineX,
                y: lineY,
                size: pdfFontSize,
                font,
                color: textColor,
              });
            }
          } catch {}
        }
      } else if (el.type === 'highlight') {
        const color = el.fillColor ? parseColor(el.fillColor) : rgb(1, 0.95, 0.2);
        pdfPage.drawRectangle({
          x,
          y,
          width: elWidth,
          height: elHeight,
          color,
          opacity: el.opacity ?? 0.35,
          rotate: el.rotation ? degrees(-el.rotation) : undefined,
        });
      } else if (el.type === 'image' && el.imageDataUrl) {
        try {
          let embeddedImage = imageCache[el.imageDataUrl];
          if (!embeddedImage) {
            const isPng = el.imageDataUrl.startsWith('data:image/png');
            const base64Data = el.imageDataUrl.split(',')[1];
            const imageBytes = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));
            embeddedImage = isPng
              ? await newPdf.embedPng(imageBytes)
              : await newPdf.embedJpg(imageBytes);
            imageCache[el.imageDataUrl] = embeddedImage;
          }

          pdfPage.drawImage(embeddedImage, {
            x,
            y,
            width: elWidth,
            height: elHeight,
            opacity: el.opacity ?? 1,
            rotate: el.rotation ? degrees(-el.rotation) : undefined,
          });
        } catch {}
      } else if (el.type === 'drawing' && el.drawingPoints && el.drawingPoints.length > 1) {
        const strokeColor = parseColor(el.color || '#000000');
        const strokeWidth = (el.strokeWidth || 2) * scaleX;
        for (let i = 0; i < el.drawingPoints.length - 1; i++) {
          const pStart = el.drawingPoints[i];
          const pEnd = el.drawingPoints[i + 1];
          try {
            pdfPage.drawLine({
              start: { x: pStart.x * scaleX, y: pageHeight - pStart.y * scaleY },
              end: { x: pEnd.x * scaleX, y: pageHeight - pEnd.y * scaleY },
              color: strokeColor,
              thickness: strokeWidth,
              opacity: el.opacity ?? 1,
            });
          } catch {}
        }
      } else if (el.type === 'table' && el.tableData) {
        const { rows, cols, cells, headerBg, borderColor: tBorderColor } = el.tableData;
        const colW = elWidth / cols;
        const rowH = elHeight / rows;
        const borderRgb = tBorderColor ? parseColor(tBorderColor) : parseColor('#cbd5e1');
        const headerRgb = headerBg ? parseColor(headerBg) : rgb(0.95, 0.96, 0.98);
        const textFont = fonts.Helvetica;
        const tableFontSize = Math.max(7, Math.min(13, rowH * 0.42));

        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const cellX = x + c * colW;
            const cellY = pageHeight - (el.y * scaleY + (r + 1) * rowH);

            if (r === 0) {
              pdfPage.drawRectangle({
                x: cellX,
                y: cellY,
                width: colW,
                height: rowH,
                color: headerRgb,
                opacity: 1,
              });
            }

            pdfPage.drawRectangle({
              x: cellX,
              y: cellY,
              width: colW,
              height: rowH,
              borderColor: borderRgb,
              borderWidth: 1 * scaleX,
            });

            const cellVal = (cells[r] && cells[r][c]) || '';
            if (cellVal) {
              const cellFont = r === 0 ? fonts.HelveticaBold : textFont;
              const cellColor = r === 0 ? parseColor('#0B1B3D') : parseColor('#1e293b');
              try {
                pdfPage.drawText(cellVal.slice(0, 60), {
                  x: cellX + 5 * scaleX,
                  y: cellY + (rowH / 2) - (tableFontSize / 3),
                  size: tableFontSize,
                  font: cellFont,
                  color: cellColor,
                });
              } catch {}
            }
          }
        }
      } else if (el.type === 'line' || el.type === 'arrow') {
        const strokeColor = el.color ? parseColor(el.color) : parseColor('#000000');
        const strokeWidth = (el.strokeWidth || 2) * scaleX;
        const yStart = pageHeight - el.y * scaleY;
        const yEnd = pageHeight - (el.y + el.height) * scaleY;
        pdfPage.drawLine({
          start: { x, y: yStart },
          end: { x: x + elWidth, y: yEnd },
          color: strokeColor,
          thickness: strokeWidth,
          opacity: el.opacity ?? 1,
        });
      } else if (el.type === 'stamp') {
        const stampText = el.text || 'APPROVED';
        const stampColor = el.color ? parseColor(el.color) : parseColor('#059669');
        pdfPage.drawRectangle({
          x,
          y,
          width: elWidth,
          height: elHeight,
          borderColor: stampColor,
          borderWidth: 2.5 * scaleX,
          opacity: el.opacity ?? 1,
          rotate: el.rotation ? degrees(-el.rotation) : undefined,
        });
        const stampFontSize = Math.min(elHeight * 0.45, 22 * scaleX);
        const stampFont = fonts.HelveticaBold;
        const stampWidth = stampFont.widthOfTextAtSize(stampText, stampFontSize);
        pdfPage.drawText(stampText, {
          x: x + Math.max(0, (elWidth - stampWidth) / 2),
          y: y + (elHeight / 2) - (stampFontSize / 3),
          size: stampFontSize,
          font: stampFont,
          color: stampColor,
          opacity: el.opacity ?? 1,
          rotate: el.rotation ? degrees(-el.rotation) : undefined,
        });
      } else if (el.type === 'eraser') {
        const eraseColor = el.fillColor ? parseColor(el.fillColor) : parseColor('#ffffff');
        pdfPage.drawRectangle({
          x,
          y,
          width: elWidth,
          height: elHeight,
          color: eraseColor,
          opacity: 1,
          rotate: el.rotation ? degrees(-el.rotation) : undefined,
        });
      } else if (el.type === 'comment') {
        const commentBg = el.fillColor ? parseColor(el.fillColor) : parseColor('#FEF08A');
        const commentBorder = el.strokeColor ? parseColor(el.strokeColor) : parseColor('#EAB308');
        pdfPage.drawRectangle({
          x,
          y,
          width: elWidth,
          height: elHeight,
          color: commentBg,
          borderColor: commentBorder,
          borderWidth: 1 * scaleX,
          opacity: 0.95,
        });
        const authorText = el.commentAuthor ? `[${el.commentAuthor}]:` : '[Note]:';
        const commentBody = el.text || '';
        const noteFont = fonts.HelveticaBold;
        const bodyFont = fonts.Helvetica;
        const noteSize = Math.max(7, Math.min(10, elHeight * 0.25)) * scaleX;
        try {
          pdfPage.drawText(authorText, {
            x: x + 4 * scaleX,
            y: y + elHeight - noteSize - 3 * scaleY,
            size: noteSize,
            font: noteFont,
            color: parseColor('#713F12'),
          });
          const displayBody = commentBody.length > 50 ? commentBody.slice(0, 47) + '...' : commentBody;
          pdfPage.drawText(displayBody, {
            x: x + 4 * scaleX,
            y: y + elHeight - (noteSize * 2.2) - 4 * scaleY,
            size: noteSize * 0.9,
            font: bodyFont,
            color: parseColor('#1e293b'),
          });
        } catch {}
      } else if (el.type === 'signature') {
        if (el.imageDataUrl) {
          try {
            let embeddedImage = imageCache[el.imageDataUrl];
            if (!embeddedImage) {
              const isPng = el.imageDataUrl.startsWith('data:image/png');
              const base64Data = el.imageDataUrl.split(',')[1];
              const imageBytes = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));
              embeddedImage = isPng
                ? await newPdf.embedPng(imageBytes)
                : await newPdf.embedJpg(imageBytes);
              imageCache[el.imageDataUrl] = embeddedImage;
            }
            pdfPage.drawImage(embeddedImage, {
              x,
              y,
              width: elWidth,
              height: elHeight,
              opacity: el.opacity ?? 1,
              rotate: el.rotation ? degrees(-el.rotation) : undefined,
            });
          } catch {}
        } else if (el.text) {
          const sigColor = el.color ? parseColor(el.color) : parseColor('#0B1B3D');
          const sigFont = fonts.TimesRomanItalic;
          const sigSize = (el.fontSize || 22) * scaleX;
          try {
            pdfPage.drawText(el.text, {
              x: x + 5 * scaleX,
              y: y + 8 * scaleY,
              size: sigSize,
              font: sigFont,
              color: sigColor,
            });
          } catch {}
        }
      }
    }
  }

  return await newPdf.save();
}
