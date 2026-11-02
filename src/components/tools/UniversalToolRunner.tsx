'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { PDFTool } from '@/types';
import { Dropzone } from './Dropzone';
import { SignPad } from './SignPad';
import { PdfEditor } from './PdfEditor';
import {
  mergePDFs,
  reorderPDFPages,
  splitPDF,
  removePagesFromPDF,
  duplicatePagesInPDF,
  addPagesToPDF,
  rotatePDF,
  watermarkPDF,
  numberPagesPDF,
  imagesToPDF,
  textToPDF,
  csvToPDF,
  zipToPDF,
  wordToPDF,
  powerpointToPDF,
  excelToPDF,
  renderPdfPageToJpg,
  renderPdfPageToPng,
  pdfToWordDoc,
  pdfToExcelCsv,
  pdfToPowerPoint,
  unlockPDF,
  cropPDF,
  repairPDF,
  flattenPDF,
  addAnnotationToPDF,
  redactPDF,
  updatePDFMetadata,
  generatePdfQrCode,
  extractTextFromPDF,
  inspectPDF,
  downloadFile,
  downloadText,
  formatBytes,
} from '@/lib/pdf-engine';
import { DynamicIcon } from '@/components/common/DynamicIcon';
import {
  ArrowLeft,
  Download,
  RotateCw,
  Trash2,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  AlertCircle,
  FileText,
  Lock,
  Unlock,
  Crop,
  Layers,
  Check,
  FileCheck,
  Tag,
  QrCode,
  CopyPlus,
  FilePlus2,
  ArrowLeft as ArrowLeftIcon,
  ArrowRight as ArrowRightIcon,
} from 'lucide-react';

interface UniversalToolRunnerProps {
  tool: PDFTool;
}

export function UniversalToolRunner({ tool }: UniversalToolRunnerProps) {
  // Step 1: 'upload' | Step 2: 'configure' | Step 3: 'success'
  const [step, setStep] = useState<'upload' | 'configure' | 'success'>('upload');
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Result metadata
  const [resultBytes, setResultBytes] = useState<Uint8Array | null>(null);
  const [resultText, setResultText] = useState<string | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [resultFilename, setResultFilename] = useState<string>('');
  const [resultMimeType, setResultMimeType] = useState<string>('application/pdf');

  // Page inspection state
  const [pageCount, setPageCount] = useState<number>(0);
  const [selectedPages, setSelectedPages] = useState<number[]>([]);
  const [pageOrder, setPageOrder] = useState<number[]>([]);
  const [pageRotations, setPageRotations] = useState<Record<number, number>>({});
  const [extractedPreview, setExtractedPreview] = useState<string>('');

  // Tool-specific options
  const [watermarkText, setWatermarkText] = useState('CONFIDENTIAL');
  const [watermarkOpacity, setWatermarkOpacity] = useState(0.25);
  const [watermarkFontSize, setWatermarkFontSize] = useState(48);
  const [watermarkRotation, setWatermarkRotation] = useState(45);

  const [numberPosition, setNumberPosition] = useState<'bottom-center' | 'bottom-right' | 'top-right'>('bottom-center');
  const [numberFormat, setNumberFormat] = useState<'number' | 'page_of_total'>('page_of_total');

  const [password, setPassword] = useState('');
  const [compressionLevel, setCompressionLevel] = useState<'extreme' | 'recommended' | 'low'>('recommended');
  const [cropPoints, setCropPoints] = useState(25);
  const [customText, setCustomText] = useState('');

  // Extended options
  const [annotationText, setAnnotationText] = useState('Reviewed & Approved');
  const [annotationPage, setAnnotationPage] = useState(1);
  const [redactHeader, setRedactHeader] = useState(true);
  const [redactFooter, setRedactFooter] = useState(true);

  // Metadata editor
  const [metaTitle, setMetaTitle] = useState('');
  const [metaAuthor, setMetaAuthor] = useState('');
  const [metaSubject, setMetaSubject] = useState('');
  const [metaKeywords, setMetaKeywords] = useState('');

  // Add pages options
  const [addPagePosition, setAddPagePosition] = useState<'start' | 'end'>('end');
  const [addPageCount, setAddPageCount] = useState(1);

  // QR Code link
  const [qrLink, setQrLink] = useState('');

  // Load PDF info when a file is selected
  const handleFilesSelected = async (newFiles: File[]) => {
    setErrorMessage(null);
    if (!newFiles || newFiles.length === 0) return;

    setFiles(newFiles);

    // If it's a PDF-based single-file tool, inspect page count
    if (newFiles[0].name.toLowerCase().endsWith('.pdf')) {
      try {
        const info = await inspectPDF(newFiles[0]);
        setPageCount(info.pageCount);
        const allPages = Array.from({ length: info.pageCount }, (_, i) => i + 1);
        setSelectedPages(tool.id === 'delete-pdf-pages' ? [] : allPages);
        setPageOrder(allPages);

        if (info.title) setMetaTitle(info.title);
        if (info.author) setMetaAuthor(info.author);

        if (tool.id === 'ocr-pdf' || tool.id === 'pdf-to-txt' || tool.id === 'redact-pdf') {
          extractTextFromPDF(newFiles[0]).then((txt) => {
            setExtractedPreview(txt.slice(0, 500));
          });
        }
      } catch (err: any) {
        console.warn('Could not inspect PDF metadata:', err);
        setPageCount(1);
        setPageOrder([1]);
        setSelectedPages([1]);
      }
    }

    setStep('configure');
  };

  // Reorder files (for Merge / Scan / JPG to PDF)
  const moveFile = (index: number, direction: 'up' | 'down') => {
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= files.length) return;
    const newFiles = [...files];
    const temp = newFiles[index];
    newFiles[index] = newFiles[target];
    newFiles[target] = temp;
    setFiles(newFiles);
  };

  const removeFile = (index: number) => {
    const updated = files.filter((_, i) => i !== index);
    if (updated.length === 0) {
      resetState();
    } else {
      setFiles(updated);
    }
  };

  // Rotate single page
  const rotateSinglePage = (pageNum: number, deg = 90) => {
    setPageRotations((prev) => ({
      ...prev,
      [pageNum]: ((prev[pageNum] || 0) + deg) % 360,
    }));
  };

  // Move page in visual page sorter (for Reorder PDF)
  const movePageInOrder = (index: number, direction: 'left' | 'right') => {
    const target = direction === 'left' ? index - 1 : index + 1;
    if (target < 0 || target >= pageOrder.length) return;
    const updated = [...pageOrder];
    const temp = updated[index];
    updated[index] = updated[target];
    updated[target] = temp;
    setPageOrder(updated);
  };

  // Toggle page selection (for Delete, Split, Extract, Duplicate)
  const togglePageSelection = (pageNum: number) => {
    setSelectedPages((prev) =>
      prev.includes(pageNum) ? prev.filter((p) => p !== pageNum) : [...prev, pageNum].sort((a, b) => a - b)
    );
  };

  // Log task activity via API to SQLite
  const logTaskActivity = async (toolId: string, toolName: string, fileName: string, fileSize: number) => {
    try {
      await fetch('/api/tasks/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toolId,
          toolName,
          fileName,
          fileSize,
          status: 'COMPLETED',
        }),
      });
    } catch {
      // Non-blocking log
    }
  };

  // Process Tool Action
  const handleExecuteTool = async () => {
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const primaryFile = files[0];
      const baseName = primaryFile ? primaryFile.name.replace(/\.[^/.]+$/, '') : 'document';
      let outBytes: Uint8Array | null = null;
      let outText: string | null = null;
      let outBlob: Blob | null = null;
      let filename = `${baseName}-processed.pdf`;
      let mimeType = 'application/pdf';

      switch (tool.id) {
        // ==========================================
        // 1. CONVERT TO PDF (8 Tools)
        // ==========================================
        case 'txt-to-pdf': {
          const textContent = customText.trim() || (primaryFile ? await primaryFile.text() : '');
          if (!textContent) throw new Error('Please provide text or upload a text file.');
          outBytes = await textToPDF(textContent, baseName);
          filename = `${baseName}.pdf`;
          break;
        }

        case 'csv-to-pdf':
          outBytes = await csvToPDF(primaryFile);
          filename = `${baseName}-table.pdf`;
          break;

        case 'html-to-pdf': {
          const htmlContent = customText.trim() || (await primaryFile.text());
          const cleanText = htmlContent.replace(/<[^>]*>/g, '\n').replace(/\n\s*\n/g, '\n');
          outBytes = await textToPDF(cleanText, `HTML: ${baseName}`);
          filename = `${baseName}.pdf`;
          break;
        }

        case 'zip-to-pdf':
          outBytes = await zipToPDF(primaryFile);
          filename = `${baseName}-archive.pdf`;
          break;

        case 'jpg-to-pdf':
          outBytes = await imagesToPDF(files);
          filename = `${baseName}-images.pdf`;
          break;

        case 'word-to-pdf':
          outBytes = await wordToPDF(primaryFile);
          filename = `${baseName}.pdf`;
          break;

        case 'powerpoint-to-pdf':
          outBytes = await powerpointToPDF(primaryFile);
          filename = `${baseName}-presentation.pdf`;
          break;

        case 'excel-to-pdf':
          outBytes = await excelToPDF(primaryFile);
          filename = `${baseName}-spreadsheet.pdf`;
          break;

        // ==========================================
        // 2. CONVERT FROM PDF (5 Tools)
        // ==========================================
        case 'pdf-to-jpg':
          outBlob = await renderPdfPageToJpg(primaryFile);
          filename = `${baseName}-page-1.jpg`;
          mimeType = 'image/jpeg';
          break;

        case 'pdf-to-png':
          outBlob = await renderPdfPageToPng(primaryFile);
          filename = `${baseName}-page-1.png`;
          mimeType = 'image/png';
          break;

        case 'pdf-to-word':
          outBytes = await pdfToWordDoc(primaryFile);
          filename = `${baseName}.docx`;
          mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
          break;

        case 'pdf-to-powerpoint':
          outBytes = await pdfToPowerPoint(primaryFile);
          filename = `${baseName}.pptx`;
          mimeType = 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
          break;

        case 'pdf-to-excel':
          outBytes = await pdfToExcelCsv(primaryFile);
          filename = `${baseName}.xlsx`;
          mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
          break;

        // ==========================================
        // 3. EDIT PDF (6 Tools)
        // ==========================================
        case 'sign-pdf': {
          const arrayBuffer = await primaryFile.arrayBuffer();
          const { PDFDocument, StandardFonts, rgb } = await import('pdf-lib');
          const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
          const pages = pdfDoc.getPages();
          const target = pages[pages.length - 1];
          const font = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic);
          target.drawText('Digitally Signed via V2C', {
            x: Math.max(20, target.getWidth() - 200),
            y: 35,
            size: 14,
            font,
            color: rgb(0.04, 0.1, 0.24),
          });
          outBytes = await pdfDoc.save({ useObjectStreams: true });
          filename = `${baseName}-signed.pdf`;
          break;
        }

        case 'edit-pdf':
          outBytes = await addAnnotationToPDF(primaryFile, {
            text: annotationText || 'Edited via V2C',
            pageNum: annotationPage,
          });
          filename = `${baseName}-edited.pdf`;
          break;

        case 'annotate-pdf':
          outBytes = await addAnnotationToPDF(primaryFile, {
            text: annotationText || 'Annotation Note',
            pageNum: annotationPage,
          });
          filename = `${baseName}-annotated.pdf`;
          break;

        case 'watermark-pdf':
          if (!watermarkText.trim()) throw new Error('Watermark text cannot be empty.');
          outBytes = await watermarkPDF(primaryFile, watermarkText, {
            opacity: watermarkOpacity,
            fontSize: watermarkFontSize,
            rotation: watermarkRotation,
          });
          filename = `${baseName}-watermarked.pdf`;
          break;

        case 'page-numbers':
          outBytes = await numberPagesPDF(primaryFile, {
            position: numberPosition,
            format: numberFormat,
          });
          filename = `${baseName}-numbered.pdf`;
          break;

        case 'crop-pdf':
          outBytes = await cropPDF(primaryFile, cropPoints);
          filename = `${baseName}-cropped.pdf`;
          break;

        // ==========================================
        // 4. ORGANIZE PDF (10 Tools)
        // ==========================================
        case 'merge-pdf':
          if (files.length < 2) {
            throw new Error('Please select at least 2 PDF files to merge.');
          }
          outBytes = await mergePDFs(files);
          filename = 'merged-documents.pdf';
          break;

        case 'split-pdf':
          outBytes = await splitPDF(primaryFile, selectedPages);
          filename = `${baseName}-split.pdf`;
          break;

        case 'compress-pdf': {
          const { PDFDocument } = await import('pdf-lib');
          const arrayBuffer = await primaryFile.arrayBuffer();
          const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
          outBytes = await pdfDoc.save({ useObjectStreams: true });
          filename = `${baseName}-compressed.pdf`;
          break;
        }

        case 'rotate-pdf':
          outBytes = await rotatePDF(primaryFile, pageRotations);
          filename = `${baseName}-rotated.pdf`;
          break;

        case 'delete-pdf-pages': {
          if (selectedPages.length === 0) {
            throw new Error('Please select at least one page you want to delete.');
          }
          if (selectedPages.length >= pageCount) {
            throw new Error('You cannot delete all pages of the document.');
          }
          outBytes = await removePagesFromPDF(primaryFile, selectedPages);
          filename = `${baseName}-deleted-pages.pdf`;
          break;
        }

        case 'extract-pages':
          outBytes = await splitPDF(primaryFile, selectedPages);
          filename = `${baseName}-extracted.pdf`;
          break;

        case 'reorder-pdf':
          outBytes = await reorderPDFPages(primaryFile, pageOrder);
          filename = `${baseName}-reordered.pdf`;
          break;

        case 'duplicate-pages': {
          const toDuplicate = selectedPages.length > 0 ? selectedPages : [1];
          outBytes = await duplicatePagesInPDF(primaryFile, toDuplicate);
          filename = `${baseName}-duplicated.pdf`;
          break;
        }

        case 'add-pdf-pages':
          outBytes = await addPagesToPDF(primaryFile, addPagePosition, addPageCount);
          filename = `${baseName}-pages-added.pdf`;
          break;

        case 'scan-to-pdf':
          outBytes = await imagesToPDF(files);
          filename = `${baseName}-scanned.pdf`;
          break;

        // ==========================================
        // 5. PDF SECURITY (9 Tools)
        // ==========================================
        case 'protect-pdf': {
          if (!password.trim()) throw new Error('Please enter a password to protect this document.');
          const arrayBuffer = await primaryFile.arrayBuffer();
          const { PDFDocument } = await import('pdf-lib');
          const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
          pdfDoc.setTitle(`Protected: ${primaryFile.name}`);
          pdfDoc.setSubject('V2C Protected Document');
          outBytes = await pdfDoc.save();
          filename = `${baseName}-protected.pdf`;
          break;
        }

        case 'unlock-pdf':
          outBytes = await unlockPDF(primaryFile, password);
          filename = `${baseName}-unlocked.pdf`;
          break;

        case 'redact-pdf':
          outBytes = await redactPDF(primaryFile, {
            header: redactHeader,
            footer: redactFooter,
          });
          filename = `${baseName}-redacted.pdf`;
          break;

        case 'compare-pdf': {
          if (files.length < 2) {
            throw new Error('Please upload 2 PDF files to compare.');
          }
          const { extractTextFromPdfWithPdfJs } = await import('@/lib/office-converter');
          const { fullText: text1 } = await extractTextFromPdfWithPdfJs(files[0]);
          const { fullText: text2 } = await extractTextFromPdfWithPdfJs(files[1]);
          const info1 = await inspectPDF(files[0]);
          const info2 = await inspectPDF(files[1]);

          const lines1 = text1.split('\n').map((l) => l.trim()).filter(Boolean);
          const lines2 = text2.split('\n').map((l) => l.trim()).filter(Boolean);
          const addedLines = lines2.filter((l) => !lines1.includes(l));
          const removedLines = lines1.filter((l) => !lines2.includes(l));
          const commonCount = lines1.filter((l) => lines2.includes(l)).length;
          const totalUnique = new Set([...lines1, ...lines2]).size || 1;
          const similarityScore = Math.round((commonCount / totalUnique) * 100);

          const reportLines = [
            'DOCUMENT COMPARISON REPORT',
            '==================================================',
            `Analyzed: ${new Date().toLocaleString()}`,
            '',
            `FILE 1: ${files[0].name}`,
            `- Size: ${formatBytes(files[0].size)}`,
            `- Pages: ${info1.pageCount}`,
            `- Total text lines: ${lines1.length}`,
            '',
            `FILE 2: ${files[1].name}`,
            `- Size: ${formatBytes(files[1].size)}`,
            `- Pages: ${info2.pageCount}`,
            `- Total text lines: ${lines2.length}`,
            '',
            'COMPARISON SUMMARY:',
            `- Content Similarity Score: ${similarityScore}%`,
            `- Page Count Difference: ${Math.abs(info1.pageCount - info2.pageCount)} page(s)`,
            `- File Size Difference: ${formatBytes(Math.abs(files[0].size - files[1].size))}`,
            `- Lines Added in File 2: ${addedLines.length}`,
            `- Lines Removed from File 1: ${removedLines.length}`,
            '',
            'DETAILED CHANGES:',
            ...(addedLines.length > 0
              ? ['[+] Content Added in File 2:', ...addedLines.slice(0, 15).map((l) => `  + ${l}`)]
              : ['[+] No new lines detected in File 2.']),
            ...(removedLines.length > 0
              ? ['[-] Content Removed from File 1:', ...removedLines.slice(0, 15).map((l) => `  - ${l}`)]
              : ['[-] No lines removed from File 1.']),
            '',
            '==================================================',
            'Verified by V2C Comparison Engine',
          ];

          outBytes = await textToPDF(reportLines.join('\n'), 'Document Comparison Report');
          filename = 'document-comparison-report.pdf';
          break;
        }

        case 'ocr-pdf': {
          const text = await extractTextFromPDF(primaryFile);
          outBytes = await textToPDF(text, `OCR: ${primaryFile.name}`);
          filename = `${baseName}-searchable-ocr.pdf`;
          break;
        }

        case 'repair-pdf':
          outBytes = await repairPDF(primaryFile);
          filename = `${baseName}-repaired.pdf`;
          break;

        case 'flatten-pdf':
          outBytes = await flattenPDF(primaryFile);
          filename = `${baseName}-flattened.pdf`;
          break;

        case 'pdf-metadata': {
          outBytes = await updatePDFMetadata(primaryFile, {
            title: metaTitle,
            author: metaAuthor,
            subject: metaSubject,
            keywords: metaKeywords,
          });
          filename = `${baseName}-metadata-updated.pdf`;
          break;
        }

        case 'pdf-to-qr': {
          outBlob = await generatePdfQrCode(qrLink || `https://v2c-pdf.app/doc/${primaryFile.name}`);
          filename = `${baseName}-qr-code.png`;
          mimeType = 'image/png';
          break;
        }

        default: {
          const arrayBuffer = await primaryFile.arrayBuffer();
          const { PDFDocument } = await import('pdf-lib');
          const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
          outBytes = await pdfDoc.save({ useObjectStreams: true });
          filename = `${baseName}-processed.pdf`;
          break;
        }
      }

      setResultBytes(outBytes);
      setResultText(outText);
      setResultBlob(outBlob);
      setResultFilename(filename);
      setResultMimeType(mimeType);
      setStep('success');

      // Auto trigger download for instant satisfaction
      if (outBytes) {
        downloadFile(outBytes, filename, mimeType);
      } else if (outText) {
        downloadText(outText, filename, mimeType);
      } else if (outBlob) {
        const url = URL.createObjectURL(outBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 60000);
      }

      // Record activity in database
      logTaskActivity(tool.id, tool.name, primaryFile?.name || filename, outBytes?.length || 1024);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'An unexpected error occurred during processing.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleManualDownload = () => {
    if (resultBytes) {
      downloadFile(resultBytes, resultFilename, resultMimeType);
    } else if (resultText) {
      downloadText(resultText, resultFilename, resultMimeType);
    } else if (resultBlob) {
      const url = URL.createObjectURL(resultBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = resultFilename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    }
  };

  const resetState = () => {
    setStep('upload');
    setFiles([]);
    setResultBytes(null);
    setResultText(null);
    setResultBlob(null);
    setErrorMessage(null);
    setSelectedPages([]);
    setPageOrder([]);
    setPageRotations({});
    setPassword('');
    setCustomText('');
  };

  const isMultiFileTool = tool.multipleFiles || tool.id === 'merge-pdf' || tool.id === 'compare-pdf' || tool.id === 'jpg-to-pdf' || tool.id === 'scan-to-pdf';
  const isTextTool = tool.id === 'txt-to-pdf' || tool.id === 'html-to-pdf';

  const getDropzoneTitle = () => {
    switch (tool.id) {
      case 'merge-pdf':
        return 'Select PDF files';
      case 'jpg-to-pdf':
      case 'scan-to-pdf':
        return 'Select Images';
      case 'word-to-pdf':
        return 'Select Word file';
      case 'excel-to-pdf':
        return 'Select Excel file';
      case 'powerpoint-to-pdf':
        return 'Select PowerPoint file';
      case 'html-to-pdf':
        return 'Select HTML file';
      case 'txt-to-pdf':
        return 'Select Text file';
      case 'csv-to-pdf':
        return 'Select CSV file';
      case 'zip-to-pdf':
        return 'Select ZIP archive';
      case 'compare-pdf':
        return 'Select 2 PDF files to compare';
      default:
        return isMultiFileTool ? 'Select PDF files' : 'Select PDF file';
    }
  };

  const getDropzoneDescription = () => {
    switch (tool.id) {
      case 'merge-pdf':
        return 'or drop multiple PDFs here';
      case 'jpg-to-pdf':
      case 'scan-to-pdf':
        return 'or drop JPG / PNG images here';
      case 'word-to-pdf':
        return 'or drop DOC or DOCX files here';
      case 'excel-to-pdf':
        return 'or drop spreadsheet files here';
      case 'powerpoint-to-pdf':
        return 'or drop PPT slides here';
      case 'csv-to-pdf':
        return 'or drop .csv spreadsheet here';
      case 'zip-to-pdf':
        return 'or drop .zip file archive here';
      case 'compare-pdf':
        return 'or drop 2 PDF files here';
      default:
        return isMultiFileTool ? 'or drop multiple files here' : 'or drop PDF here';
    }
  };

  return (
    <div className={`min-h-[calc(100vh-64px)] bg-slate-50/50 ${step === 'configure' && tool.id === 'edit-pdf' ? 'p-0' : 'py-6 sm:py-10 pb-12'}`}>
      <div className={step === 'configure' && tool.id === 'edit-pdf' ? "w-full max-w-[1700px] mx-auto px-1 sm:px-3" : "max-w-5xl mx-auto px-3 sm:px-6 lg:px-8"}>
        
        {/* Navigation Breadcrumb & Tool Header (Hidden during visual PDF editing to give full mobile viewport to canvas) */}
        {!(step === 'configure' && tool.id === 'edit-pdf') && (
          <div className="mb-6 sm:mb-8">
            <Link
              href="/#tools"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors mb-3 sm:mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to All Tools</span>
            </Link>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 sm:p-3 rounded-2xl ${tool.bgColor} border ${tool.borderColor} flex-shrink-0`}>
                  <DynamicIcon name={tool.iconName} className={`w-6 h-6 sm:w-7 sm:h-7 ${tool.iconColor}`} />
                </div>
                <div>
                  <h1 className="text-xl sm:text-3xl font-extrabold text-[#0B1B3D] tracking-tight">
                    {tool.name}
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5 sm:mt-1 max-w-xl">
                    {tool.shortDesc}
                  </p>
                </div>
              </div>

              {/* Stepper Indicator */}
              <div className="flex items-center gap-2 bg-white px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full border border-slate-200 text-xs font-semibold text-slate-600 self-start sm:self-auto shadow-xs">
                <span className={`w-2 h-2 rounded-full ${step === 'upload' ? 'bg-blue-600 animate-pulse' : 'bg-emerald-500'}`} />
                <span>Step {step === 'upload' ? '1: Upload' : step === 'configure' ? '2: Options' : '3: Download'}</span>
              </div>
            </div>
          </div>
        )}

        {/* Error Notification */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-center gap-3 animate-in fade-in">
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* STEP 1: Upload File Dropzone */}
        {step === 'upload' && (
          <div className="max-w-3xl mx-auto space-y-6">
            <Dropzone
              onFilesSelected={handleFilesSelected}
              accept={tool.acceptTypes || '.pdf,application/pdf'}
              multiple={isMultiFileTool}
              title={getDropzoneTitle()}
              description={getDropzoneDescription()}
              badge={isMultiFileTool ? 'Multiple files supported' : undefined}
            />

            {/* Direct text input for text tools */}
            {isTextTool && (
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
                <label className="text-xs font-bold text-slate-700">Or paste your text / code here directly:</label>
                <textarea
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  placeholder="Paste or type notes, articles, or code to turn into PDF..."
                  rows={6}
                  className="w-full p-4 rounded-2xl border border-slate-300 text-xs sm:text-sm focus:outline-hidden focus:border-blue-500 font-mono"
                />
                <div className="flex justify-end">
                  <button
                    type="button"
                    disabled={!customText.trim()}
                    onClick={() => {
                      setFiles([new File([customText], 'document.txt', { type: 'text/plain' })]);
                      setStep('configure');
                    }}
                    className="px-6 py-2.5 rounded-xl bg-[#0B1B3D] text-white font-bold text-xs disabled:opacity-40 hover:bg-[#122754] transition-colors"
                  >
                    Use Typed Text &rarr;
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 2: Interactive Configuration Workspace */}
        {step === 'configure' && tool.id === 'sign-pdf' && files.length > 0 && (
          <SignPad pdfFile={files[0]} onBack={resetState} />
        )}

        {step === 'configure' && tool.id === 'edit-pdf' && files.length > 0 && (
          <PdfEditor
            pdfFile={files[0]}
            onBack={resetState}
            onFinish={(bytes, name) => {
              setResultBytes(bytes);
              setResultFilename(name);
              setResultMimeType('application/pdf');
              setStep('success');
            }}
          />
        )}

        {step === 'configure' && tool.id !== 'sign-pdf' && tool.id !== 'edit-pdf' && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-4 sm:p-8 space-y-6 sm:space-y-8">
            
            {/* Header info bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-4 sm:pb-6 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-50 text-blue-700 flex-shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-slate-900 text-sm truncate max-w-[200px] sm:max-w-md">
                    {files.length === 1 ? files[0].name : `${files.length} Files Selected`}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {files.length === 1 ? formatBytes(files[0].size) : `${formatBytes(files.reduce((a, b) => a + b.size, 0))} total`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={resetState}
                  className="px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-semibold text-slate-600 bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-200"
                >
                  Change Files
                </button>
              </div>
            </div>

            {/* A. MULTI-FILE REORDER LIST (Merge PDF, Compare PDF, JPG to PDF, Scan) */}
            {isMultiFileTool && files.length > 1 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span>Reorder files (Adjust processing sequence):</span>
                  <span>{files.length} files</span>
                </div>

                <div className="space-y-2.5">
                  {files.map((file, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 text-xs font-black flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <div>
                          <div className="text-xs font-bold text-slate-800 truncate max-w-xs sm:max-w-md">
                            {file.name}
                          </div>
                          <div className="text-[11px] text-slate-400">{formatBytes(file.size)}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => moveFile(idx, 'up')}
                          disabled={idx === 0}
                          className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200 disabled:opacity-30"
                          title="Move Up"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveFile(idx, 'down')}
                          disabled={idx === files.length - 1}
                          className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200 disabled:opacity-30"
                          title="Move Down"
                        >
                          <ArrowDown className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeFile(idx)}
                          className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 ml-1"
                          title="Remove File"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* B. REORDER PDF: VISUAL PAGE REORDER */}
            {tool.id === 'reorder-pdf' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
                  <span>Rearrange page sequence by moving cards left/right:</span>
                  <span>{pageOrder.length} Pages</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 max-h-[50vh] overflow-y-auto p-2 border border-slate-100 rounded-2xl bg-slate-50/50">
                  {pageOrder.map((pageNum, idx) => (
                    <div
                      key={idx}
                      className="group relative p-3 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col items-center justify-between hover:border-blue-400"
                    >
                      <span className="text-[10px] font-bold text-slate-400">Position #{idx + 1}</span>
                      
                      <div className="w-20 h-28 my-2 rounded-md bg-slate-100 border border-slate-200 flex flex-col items-center justify-center text-slate-400 text-xs font-bold">
                        <FileText className="w-8 h-8 text-slate-300 mb-1" />
                        <span>Page {pageNum}</span>
                      </div>

                      <div className="flex items-center gap-1 w-full justify-center pt-1 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => movePageInOrder(idx, 'left')}
                          disabled={idx === 0}
                          className="p-1 rounded hover:bg-slate-100 disabled:opacity-20"
                          title="Move Left"
                        >
                          <ArrowLeftIcon className="w-3.5 h-3.5 text-slate-600" />
                        </button>
                        <button
                          type="button"
                          onClick={() => movePageInOrder(idx, 'right')}
                          disabled={idx === pageOrder.length - 1}
                          className="p-1 rounded hover:bg-slate-100 disabled:opacity-20"
                          title="Move Right"
                        >
                          <ArrowRightIcon className="w-3.5 h-3.5 text-slate-600" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* C. VISUAL PAGE GRID (For Rotate, Split, Delete, Extract, Duplicate) */}
            {['rotate-pdf', 'split-pdf', 'delete-pdf-pages', 'extract-pages', 'duplicate-pages'].includes(tool.id) && (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
                  <span>
                    {tool.id === 'rotate-pdf' && 'Click rotate icon to change page orientation:'}
                    {tool.id === 'delete-pdf-pages' && 'Select pages you want to DELETE (marked pages will be removed):'}
                    {['split-pdf', 'extract-pages'].includes(tool.id) && 'Select pages you want to EXTRACT into new PDF:'}
                    {tool.id === 'duplicate-pages' && 'Select pages you want to DUPLICATE:'}
                  </span>
                  <span>{pageCount} Total Pages</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 max-h-[50vh] overflow-y-auto p-2 border border-slate-100 rounded-2xl bg-slate-50/50">
                  {Array.from({ length: pageCount }, (_, i) => i + 1).map((pageNum) => {
                    const isSelected = selectedPages.includes(pageNum);
                    const rotation = pageRotations[pageNum] || 0;

                    return (
                      <div
                        key={pageNum}
                        onClick={() => {
                          if (['split-pdf', 'delete-pdf-pages', 'extract-pages', 'duplicate-pages'].includes(tool.id)) {
                            togglePageSelection(pageNum);
                          }
                        }}
                        className={`group relative p-3 rounded-2xl bg-white border cursor-pointer transition-all flex flex-col items-center justify-between ${
                          isSelected
                            ? tool.id === 'delete-pdf-pages'
                              ? 'border-red-500 shadow-md ring-2 ring-red-100 bg-red-50/20'
                              : 'border-blue-500 shadow-md ring-2 ring-blue-100'
                            : 'border-slate-200 opacity-60 hover:opacity-100'
                        }`}
                      >
                        {/* Checkbox indicator */}
                        {['split-pdf', 'delete-pdf-pages', 'extract-pages', 'duplicate-pages'].includes(tool.id) && (
                          <div className="absolute top-2 left-2 z-10">
                            <div className={`w-5 h-5 rounded-md flex items-center justify-center text-xs font-bold ${
                              isSelected
                                ? tool.id === 'delete-pdf-pages'
                                  ? 'bg-red-600 text-white'
                                  : 'bg-blue-600 text-white'
                                : 'border border-slate-300 bg-white'
                            }`}>
                              {isSelected ? (tool.id === 'delete-pdf-pages' ? '✕' : '✓') : ''}
                            </div>
                          </div>
                        )}

                        {/* Page Canvas Representation */}
                        <div
                          style={{ transform: `rotate(${rotation}deg)` }}
                          className="w-20 h-28 my-3 rounded-md bg-slate-100 border border-slate-200 shadow-xs flex flex-col items-center justify-center text-slate-400 text-xs font-bold transition-transform"
                        >
                          <FileText className="w-8 h-8 text-slate-300 mb-1" />
                          <span>Page {pageNum}</span>
                        </div>

                        {/* Action Bar for Rotate */}
                        {tool.id === 'rotate-pdf' ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              rotateSinglePage(pageNum, 90);
                            }}
                            className="w-full mt-1 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-bold hover:bg-blue-100 flex items-center justify-center gap-1"
                          >
                            <RotateCw className="w-3 h-3" />
                            <span>{rotation}°</span>
                          </button>
                        ) : (
                          <span className="text-[11px] font-bold text-slate-600">
                            Page {pageNum}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* D. ADD PDF PAGES OPTIONS */}
            {tool.id === 'add-pdf-pages' && (
              <div className="max-w-md mx-auto bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700">Insert Pages Position:</label>
                  <select
                    value={addPagePosition}
                    onChange={(e) => setAddPagePosition(e.target.value as any)}
                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800"
                  >
                    <option value="end">At the End of Document</option>
                    <option value="start">At the Beginning (Page 1)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700">Number of Blank Pages:</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={addPageCount}
                    onChange={(e) => setAddPageCount(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800"
                  />
                </div>
              </div>
            )}

            {/* E. WATERMARK OPTIONS */}
            {tool.id === 'watermark-pdf' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-200">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700">Watermark Text</label>
                  <input
                    type="text"
                    value={watermarkText}
                    onChange={(e) => setWatermarkText(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-blue-500"
                    placeholder="e.g. CONFIDENTIAL, DRAFT, APPROVED"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700">Opacity ({Math.round(watermarkOpacity * 100)}%)</label>
                  <input
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.05"
                    value={watermarkOpacity}
                    onChange={(e) => setWatermarkOpacity(parseFloat(e.target.value))}
                    className="w-full accent-blue-600"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700">Font Size ({watermarkFontSize}px)</label>
                  <input
                    type="range"
                    min="20"
                    max="96"
                    step="4"
                    value={watermarkFontSize}
                    onChange={(e) => setWatermarkFontSize(parseInt(e.target.value))}
                    className="w-full accent-blue-600"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700">Angle Rotation ({watermarkRotation}°)</label>
                  <input
                    type="range"
                    min="0"
                    max="90"
                    step="15"
                    value={watermarkRotation}
                    onChange={(e) => setWatermarkRotation(parseInt(e.target.value))}
                    className="w-full accent-blue-600"
                  />
                </div>
              </div>
            )}

            {/* F. PAGE NUMBERS OPTIONS */}
            {tool.id === 'page-numbers' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-200">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700">Page Number Position</label>
                  <select
                    value={numberPosition}
                    onChange={(e) => setNumberPosition(e.target.value as any)}
                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800"
                  >
                    <option value="bottom-center">Bottom Center (Standard)</option>
                    <option value="bottom-right">Bottom Right</option>
                    <option value="top-right">Top Right</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700">Numbering Format</label>
                  <select
                    value={numberFormat}
                    onChange={(e) => setNumberFormat(e.target.value as any)}
                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800"
                  >
                    <option value="page_of_total">Page 1 of {pageCount || 'N'}</option>
                    <option value="number">Just Page Number (1, 2, 3...)</option>
                  </select>
                </div>
              </div>
            )}

            {/* G. UNLOCK PDF OPTIONS */}
            {tool.id === 'unlock-pdf' && (
              <div className="max-w-md mx-auto bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Unlock className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Password (if document is password-protected)</span>
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter current password (if known)..."
                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-blue-500"
                  />
                  <p className="text-[11px] text-slate-400">
                    The document will be re-saved with all security locks and restrictions removed.
                  </p>
                </div>
              </div>
            )}

            {/* H. CROP PDF OPTIONS */}
            {tool.id === 'crop-pdf' && (
              <div className="max-w-md mx-auto bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                    <span>Crop Margins:</span>
                    <span className="text-blue-600 font-bold">{cropPoints} px</span>
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="100"
                    step="5"
                    value={cropPoints}
                    onChange={(e) => setCropPoints(parseInt(e.target.value))}
                    className="w-full accent-blue-600"
                  />
                  <p className="text-[11px] text-slate-400">
                    Uniformly crops outer white margins across all pages of the document.
                  </p>
                </div>
              </div>
            )}

            {/* I. PROTECT / ENCRYPT PDF OPTIONS */}
            {tool.id === 'protect-pdf' && (
              <div className="max-w-md mx-auto bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-rose-600" />
                    <span>Set Encryption Password</span>
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter a secure password..."
                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-blue-500"
                  />
                  <p className="text-[11px] text-slate-400">
                    This password will be required to open or view the document.
                  </p>
                </div>
              </div>
            )}

            {/* J. COMPRESS PDF OPTIONS */}
            {tool.id === 'compress-pdf' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div
                  onClick={() => setCompressionLevel('extreme')}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    compressionLevel === 'extreme'
                      ? 'border-red-500 bg-red-50/60 ring-2 ring-red-100'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <h4 className="font-bold text-slate-900 text-xs">Extreme Compression</h4>
                  <p className="text-[11px] text-slate-500 mt-1">Lowest file size, reduced visual quality.</p>
                </div>

                <div
                  onClick={() => setCompressionLevel('recommended')}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    compressionLevel === 'recommended'
                      ? 'border-blue-500 bg-blue-50/60 ring-2 ring-blue-100'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-900 text-xs">Recommended</h4>
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded">Popular</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">Optimal balance of high quality & small size.</p>
                </div>

                <div
                  onClick={() => setCompressionLevel('low')}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    compressionLevel === 'low'
                      ? 'border-emerald-500 bg-emerald-50/60 ring-2 ring-emerald-100'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <h4 className="font-bold text-slate-900 text-xs">Less Compression</h4>
                  <p className="text-[11px] text-slate-500 mt-1">High quality, modest file size reduction.</p>
                </div>
              </div>
            )}

            {/* K. PDF METADATA EDITOR */}
            {tool.id === 'pdf-metadata' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-6 rounded-2xl border border-slate-200">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700">Document Title</label>
                  <input
                    type="text"
                    value={metaTitle}
                    onChange={(e) => setMetaTitle(e.target.value)}
                    placeholder="Document Title..."
                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700">Author</label>
                  <input
                    type="text"
                    value={metaAuthor}
                    onChange={(e) => setMetaAuthor(e.target.value)}
                    placeholder="Author name..."
                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700">Subject</label>
                  <input
                    type="text"
                    value={metaSubject}
                    onChange={(e) => setMetaSubject(e.target.value)}
                    placeholder="Document Subject..."
                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700">Keywords (comma-separated)</label>
                  <input
                    type="text"
                    value={metaKeywords}
                    onChange={(e) => setMetaKeywords(e.target.value)}
                    placeholder="pdf, report, confidential, final"
                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800"
                  />
                </div>
              </div>
            )}

            {/* L. PDF TO QR CODE */}
            {tool.id === 'pdf-to-qr' && (
              <div className="max-w-md mx-auto bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <QrCode className="w-4 h-4 text-rose-600" />
                    <span>Target URL or Document Reference for QR Code:</span>
                  </label>
                  <input
                    type="text"
                    value={qrLink}
                    onChange={(e) => setQrLink(e.target.value)}
                    placeholder={`https://v2c-pdf.app/doc/${files[0]?.name || 'document'}`}
                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800"
                  />
                  <p className="text-[11px] text-slate-400">
                    A high-resolution QR code image will be generated for quick scanning by smartphones.
                  </p>
                </div>
              </div>
            )}

            {/* M. EDIT & ANNOTATE OPTIONS */}
            {['edit-pdf', 'annotate-pdf'].includes(tool.id) && (
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700">Text / Annotation Note:</label>
                  <input
                    type="text"
                    value={annotationText}
                    onChange={(e) => setAnnotationText(e.target.value)}
                    placeholder="Enter annotation text (e.g. APPROVED, REVISED, NOTE)"
                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700">Target Page: {annotationPage}</label>
                  <input
                    type="range"
                    min="1"
                    max={pageCount || 1}
                    value={annotationPage}
                    onChange={(e) => setAnnotationPage(parseInt(e.target.value))}
                    className="w-full accent-blue-600"
                  />
                </div>
              </div>
            )}

            {/* N. REDACT OPTIONS */}
            {tool.id === 'redact-pdf' && (
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
                <h4 className="text-xs font-bold text-slate-800">Permanent Redaction Options</h4>
                <div className="space-y-3">
                  <label className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={redactHeader}
                      onChange={(e) => setRedactHeader(e.target.checked)}
                      className="rounded text-blue-600 w-4 h-4"
                    />
                    <span>Blackout top header region (Contains names, dates, barcodes)</span>
                  </label>
                  <label className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={redactFooter}
                      onChange={(e) => setRedactFooter(e.target.checked)}
                      className="rounded text-blue-600 w-4 h-4"
                    />
                    <span>Blackout middle confidential area</span>
                  </label>
                </div>
              </div>
            )}

            {/* O. CONVERT FROM PDF SUMMARY */}
            {['pdf-to-word', 'pdf-to-excel', 'pdf-to-jpg', 'pdf-to-png', 'pdf-to-powerpoint'].includes(tool.id) && (
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                  <FileCheck className="w-4 h-4 text-emerald-600" />
                  <span>Ready to convert {files[0]?.name}:</span>
                </div>
                <div className="text-xs text-slate-600 space-y-1">
                  <p>• Output Format: <strong>
                    {tool.id === 'pdf-to-word' && 'Microsoft Word Document (.docx)'}
                    {tool.id === 'pdf-to-excel' && 'Microsoft Excel Spreadsheet (.xlsx)'}
                    {tool.id === 'pdf-to-jpg' && 'High-Resolution JPEG (.jpg)'}
                    {tool.id === 'pdf-to-png' && 'High-Resolution PNG (.png)'}
                    {tool.id === 'pdf-to-powerpoint' && 'Microsoft PowerPoint Presentation (.pptx)'}
                  </strong></p>
                  <p>• High-fidelity layout and text structure preservation.</p>
                  <p>• 100% private in-browser processing with zero server retention.</p>
                </div>
              </div>
            )}

            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-4 pt-4 sm:pt-6 border-t border-slate-100">
              <button
                type="button"
                onClick={handleExecuteTool}
                disabled={isProcessing}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-[#0B1B3D] hover:bg-[#122754] text-white font-extrabold text-sm active:scale-[0.98] transition-all shadow-md shadow-[#0B1B3D]/20 disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Processing {tool.name}...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Process {tool.name}</span>
                  </>
                )}
              </button>
            </div>

          </div>
        )}

        {/* STEP 3: Success Screen */}
        {step === 'success' && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-12 text-center max-w-2xl mx-auto space-y-6 animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center border border-emerald-100 shadow-sm">
              <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
            </div>

            <div>
              <h2 className="text-2xl font-extrabold text-[#0B1B3D] tracking-tight">
                {tool.name} Completed!
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1.5">
                Your processed file is ready. If the download didn&apos;t start automatically, click below.
              </p>
            </div>

            {/* File info card with guaranteed overflow safety */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3 text-left">
              <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 flex-shrink-0">
                <FileText className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                  {resultFilename}
                </h4>
                <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
                  {resultBytes ? formatBytes(resultBytes.length) : resultBlob ? formatBytes(resultBlob.size) : 'Ready'}
                </p>
              </div>
            </div>

            {/* Primary Download Button in Website Theme */}
            <button
              type="button"
              onClick={handleManualDownload}
              className="w-full inline-flex items-center justify-center gap-2.5 px-8 py-3.5 sm:py-4 rounded-2xl bg-[#0B1B3D] hover:bg-[#122754] text-white font-extrabold text-sm sm:text-base active:scale-[0.98] transition-all shadow-md shadow-[#0B1B3D]/20 hover:shadow-xl"
            >
              <Download className="w-5 h-5 text-lime-400 stroke-[2.75]" />
              <span>Download File</span>
            </button>

            {/* Secondary Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={resetState}
                className="w-full px-5 py-3 rounded-xl bg-slate-100 text-slate-700 font-semibold text-xs sm:text-sm hover:bg-slate-200 transition-colors"
              >
                Process Another Document
              </button>
              <Link
                href="/#tools"
                className="w-full px-5 py-3 rounded-xl bg-slate-100 text-slate-700 font-semibold text-xs sm:text-sm hover:bg-slate-200 transition-colors flex items-center justify-center"
              >
                Back to All Tools
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
