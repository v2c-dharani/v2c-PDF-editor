'use client';

import React, { useRef, useState } from 'react';
import { FileUp, Plus } from 'lucide-react';

interface DropzoneProps {
  onFilesSelected: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  title?: string;
  description?: string;
  badge?: string;
}

export function Dropzone({
  onFilesSelected,
  accept = '.pdf,application/pdf',
  multiple = true,
  title = 'Select PDF files',
  description = 'or drop files here',
  badge,
}: DropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const selectedFiles = Array.from(e.dataTransfer.files);
      onFilesSelected(multiple ? selectedFiles : [selectedFiles[0]]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      onFilesSelected(multiple ? selectedFiles : [selectedFiles[0]]);
    }
    e.target.value = '';
  };

  const triggerPicker = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    fileInputRef.current?.click();
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => triggerPicker()}
      className={`group relative cursor-pointer overflow-hidden rounded-3xl border-2 border-dashed transition-all duration-300 p-8 sm:p-14 text-center bg-white ${
        isDragging
          ? 'border-[#0B1B3D] bg-slate-50 ring-4 ring-[#0B1B3D]/10 scale-[1.01]'
          : 'border-slate-300 hover:border-[#0B1B3D] bg-white hover:bg-slate-50/60 shadow-xs hover:shadow-md'
      }`}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileInput}
        className="hidden"
      />

      <div className="relative flex flex-col items-center justify-center space-y-4 sm:space-y-5">
        
        {/* Upload Icon in Website Brand Navy Theme */}
        <div className="relative pointer-events-none">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#0B1B3D] text-white flex items-center justify-center shadow-lg shadow-[#0B1B3D]/20 group-hover:scale-105 group-hover:-translate-y-1 group-hover:bg-[#122754] transition-all duration-300">
            <FileUp className="w-8 h-8 sm:w-10 sm:h-10 text-white stroke-[2]" />
          </div>
          <span className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-lime-400 text-[#0B1B3D] shadow-md border-2 border-white font-bold group-hover:rotate-90 transition-transform duration-300">
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
          </span>
        </div>

        {/* Primary Action Button in Website Navy Theme */}
        <div className="w-full sm:w-auto space-y-2">
          <button
            type="button"
            onClick={(e) => triggerPicker(e)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 sm:px-10 sm:py-4 rounded-2xl bg-[#0B1B3D] hover:bg-[#122754] text-white font-bold text-sm sm:text-base active:scale-[0.98] transition-all duration-200 shadow-md shadow-[#0B1B3D]/20 hover:shadow-xl group-hover:bg-[#122754]"
          >
            <Plus className="w-5 h-5 text-lime-400 stroke-[3]" />
            <span>{title}</span>
          </button>
          
          <p className="text-xs sm:text-sm font-medium text-slate-500 pointer-events-none pt-1">
            <span className="hidden sm:inline">{description}</span>
            <span className="sm:hidden">or tap anywhere to browse files</span>
          </p>
        </div>

        {/* Formats / Multiple hint badge */}
        {badge && (
          <span className="inline-block px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-[11px] font-bold border border-slate-200">
            {badge}
          </span>
        )}

      </div>
    </div>
  );
}
