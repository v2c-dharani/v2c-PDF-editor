'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { CATEGORIES, ALL_TOOLS } from '@/lib/tools-data';

export function Footer() {
  const pathname = usePathname();

  // If a tool is selected (any /tools/* route), do not show the footer at all
  if (pathname?.startsWith('/tools/')) {
    return null;
  }

  return (
    <footer className="bg-slate-50 border-t border-slate-200 mt-20 pt-16 pb-12 text-slate-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Directory Categorized Columns (5 Categories) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8 mb-12">
          {CATEGORIES.filter(c => c.id !== 'all').map((cat) => (
            <div key={cat.id} className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                {cat.name}
              </h4>
              <ul className="space-y-2 text-xs text-slate-500">
                {ALL_TOOLS.filter(t => t.category === cat.id).map((tool) => (
                  <li key={tool.id}>
                    <Link href={tool.href} prefetch={false} className="hover:text-blue-600 transition-colors">
                      {tool.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Copyright & Brand Bar */}
        <div className="pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-3">
            <Image 
              src="/v2c-pdf-editor-logo.png" 
              alt="v2c PDF editor" 
              width={206} 
              height={84} 
              className="h-7 w-auto object-contain"
            />
            <span>&copy; {new Date().getFullYear()} All rights reserved.</span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <span>Design and developed by</span>
            <a 
              href="https://vibe2code.in/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="font-bold text-blue-600 hover:text-blue-700 hover:underline transition-colors"
            >
              vibe2code
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
}
