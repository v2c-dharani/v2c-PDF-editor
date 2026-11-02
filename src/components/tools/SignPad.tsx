'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Pen, Type, RotateCcw, Check, Download, ArrowLeft } from 'lucide-react';
import { PDFDocument, rgb } from 'pdf-lib';
import { downloadFile, formatBytes } from '@/lib/pdf-engine';

interface SignPadProps {
  pdfFile: File;
  onBack: () => void;
  onFinish?: (bytes: Uint8Array, filename: string) => void;
}

export function SignPad({ pdfFile, onBack, onFinish }: SignPadProps) {
  const [tab, setTab] = useState<'draw' | 'type'>('draw');
  const [typedName, setTypedName] = useState('');
  const [penColor, setPenColor] = useState<'#000000' | '#1e40af'>('#000000');
  const [placement, setPlacement] = useState<'last' | 'first' | 'all'>('last');
  const [position, setPosition] = useState<'bottom-right' | 'bottom-left' | 'center'>('bottom-right');
  const [isProcessing, setIsProcessing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = penColor;
  }, [penColor]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if ('touches' in e && e.cancelable) {
      e.preventDefault();
    }
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    isDrawing.current = true;
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const scaleX = canvas.width / (rect.width || 1);
    const scaleY = canvas.height / (rect.height || 1);

    ctx.beginPath();
    ctx.moveTo((clientX - rect.left) * scaleX, (clientY - rect.top) * scaleY);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current) return;
    if ('touches' in e && e.cancelable) {
      e.preventDefault();
    }
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const scaleX = canvas.width / (rect.width || 1);
    const scaleY = canvas.height / (rect.height || 1);

    ctx.lineTo((clientX - rect.left) * scaleX, (clientY - rect.top) * scaleY);
    ctx.stroke();
  };

  const stopDrawing = () => {
    isDrawing.current = false;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleApplySignature = async () => {
    setIsProcessing(true);
    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);

      let signatureDataUrl = '';
      if (tab === 'draw') {
        const canvas = canvasRef.current;
        if (!canvas) return;
        signatureDataUrl = canvas.toDataURL('image/png');
      } else {
        // Render typed text to temporary canvas
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = 400;
        tempCanvas.height = 120;
        const ctx = tempCanvas.getContext('2d');
        if (ctx) {
          ctx.font = 'italic 36px cursive, sans-serif';
          ctx.fillStyle = penColor;
          ctx.fillText(typedName || 'Signature', 20, 70);
          signatureDataUrl = tempCanvas.toDataURL('image/png');
        }
      }

      if (!signatureDataUrl) throw new Error('Please create a signature first.');

      const sigImageBytes = await fetch(signatureDataUrl).then((res) => res.arrayBuffer());
      const sigImage = await pdfDoc.embedPng(sigImageBytes);

      const pages = pdfDoc.getPages();
      const targetPages =
        placement === 'all'
          ? pages
          : placement === 'first'
          ? [pages[0]]
          : [pages[pages.length - 1]];

      const sigWidth = 140;
      const sigHeight = (sigImage.height / sigImage.width) * sigWidth;

      for (const p of targetPages) {
        const { width, height } = p.getSize();
        let x = width - sigWidth - 40;
        let y = 40;

        if (position === 'bottom-left') {
          x = 40;
          y = 40;
        } else if (position === 'center') {
          x = (width - sigWidth) / 2;
          y = (height - sigHeight) / 2;
        }

        p.drawImage(sigImage, {
          x,
          y,
          width: sigWidth,
          height: sigHeight,
        });
      }

      const outputBytes = await pdfDoc.save({ useObjectStreams: true });
      const baseName = pdfFile.name.replace(/\.[^/.]+$/, '');
      const outputFilename = `${baseName}-signed.pdf`;

      if (onFinish) {
        onFinish(outputBytes, outputFilename);
      } else {
        downloadFile(outputBytes, outputFilename);
      }
    } catch (err: any) {
      alert(err.message || 'Error signing PDF.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-4 sm:p-8 space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="min-w-0">
          <h3 className="font-extrabold text-slate-900 text-base sm:text-lg">Sign Your Document</h3>
          <p className="text-xs text-slate-500 truncate max-w-[180px] sm:max-w-md">Draw or type your signature for {pdfFile.name}</p>
        </div>
        <button
          onClick={onBack}
          className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1 flex-shrink-0"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Change
        </button>
      </div>

      {/* Tabs: Draw vs Type */}
      <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl max-w-xs">
        <button
          type="button"
          onClick={() => setTab('draw')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
            tab === 'draw' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Pen className="w-3.5 h-3.5" /> Draw
        </button>
        <button
          type="button"
          onClick={() => setTab('type')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
            tab === 'type' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Type className="w-3.5 h-3.5" /> Type
        </button>
      </div>

      {/* Canvas Area */}
      {tab === 'draw' ? (
        <div className="space-y-3">
          <div className="relative border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50 overflow-hidden">
            <canvas
              ref={canvasRef}
              width={560}
              height={180}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              onTouchCancel={stopDrawing}
              style={{ touchAction: 'none' }}
              className="w-full h-44 cursor-crosshair touch-none"
            />
            <div className="absolute bottom-2 left-3 text-[11px] text-slate-400 pointer-events-none">
              Sign above this line
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-semibold">Ink color:</span>
              <button
                type="button"
                onClick={() => setPenColor('#000000')}
                className={`w-5 h-5 rounded-full bg-black border-2 ${
                  penColor === '#000000' ? 'border-blue-500 scale-110' : 'border-transparent'
                }`}
              />
              <button
                type="button"
                onClick={() => setPenColor('#1e40af')}
                className={`w-5 h-5 rounded-full bg-blue-800 border-2 ${
                  penColor === '#1e40af' ? 'border-blue-500 scale-110' : 'border-transparent'
                }`}
              />
            </div>

            <button
              type="button"
              onClick={clearCanvas}
              className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-800"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Clear Signature
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Type Your Full Name / Initials</label>
            <input
              type="text"
              value={typedName}
              onChange={(e) => setTypedName(e.target.value)}
              placeholder="e.g. John Doe"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:border-blue-500"
            />
          </div>

          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center">
            <p
              style={{ color: penColor }}
              className="text-3xl italic font-serif tracking-wider select-none"
            >
              {typedName || 'Your Signature Preview'}
            </p>
          </div>
        </div>
      )}

      {/* Placement & Position Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700">Apply Signature To:</label>
          <select
            value={placement}
            onChange={(e) => setPlacement(e.target.value as any)}
            className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:outline-hidden focus:border-blue-500"
          >
            <option value="last">Last Page Only</option>
            <option value="first">First Page Only</option>
            <option value="all">All Pages</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700">Signature Position:</label>
          <select
            value={position}
            onChange={(e) => setPosition(e.target.value as any)}
            className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:outline-hidden focus:border-blue-500"
          >
            <option value="bottom-right">Bottom Right</option>
            <option value="bottom-left">Bottom Left</option>
            <option value="center">Page Center</option>
          </select>
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
        <button
          type="button"
          disabled={isProcessing}
          onClick={handleApplySignature}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-[#0B1B3D] text-white font-bold text-sm hover:bg-[#122754] transition-all shadow-md active:scale-98 disabled:opacity-50"
        >
          <Check className="w-4 h-4 text-lime-400" />
          <span>{isProcessing ? 'Signing Document...' : 'Sign & Download PDF'}</span>
        </button>
      </div>
    </div>
  );
}
