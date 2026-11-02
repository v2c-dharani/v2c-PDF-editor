'use client';

import React from 'react';

interface HeroBannerProps {
  onSelectCategory?: (category: string) => void;
}

export function HeroBanner({ onSelectCategory }: HeroBannerProps) {
  return (
    <section className="relative overflow-hidden pt-12 pb-14 bg-gradient-to-b from-slate-50 via-white to-white border-b border-slate-100">
      {/* Decorative subtle ambient lights */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 pointer-events-none opacity-40">
        <div className="absolute top-4 left-1/4 w-72 h-72 bg-blue-100 rounded-full blur-3xl" />
        <div className="absolute top-12 right-1/4 w-64 h-64 bg-lime-100 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">

        {/* Hero Title */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#0B1B3D] max-w-4xl mx-auto leading-[1.2] sm:leading-[1.15]">
          Every tool you need to work with PDFs, in{' '}
          <span className="relative whitespace-nowrap text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900">
            one place
            <svg 
              className="absolute -bottom-2 left-0 w-full text-lime-500/80" 
              viewBox="0 0 250 12" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M2.5 9.5C65.5 2.5 185.5 1.5 247.5 7.5" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
            </svg>
          </span>
        </h1>

        {/* Subhead */}
        <p className="mt-4 sm:mt-6 text-sm sm:text-lg text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed px-2">
          Merge, split, compress, convert, edit, and sign PDFs. 100% free with fast, private in-browser processing.
        </p>

      </div>
    </section>
  );
}
