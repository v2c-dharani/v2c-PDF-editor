'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { 
  Search, 
  Menu, 
  X, 
  FileText
} from 'lucide-react';
import { ALL_TOOLS, CATEGORIES } from '@/lib/tools-data';
import { DynamicIcon } from '@/components/common/DynamicIcon';

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const searchBoxRef = useRef<HTMLDivElement>(null);

  // Close search popup on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchBoxRef.current && !searchBoxRef.current.contains(event.target as Node)) {
        setSearchFocused(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Lock body scroll when mobile menu is open to prevent underlying page from showing or scrolling
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const filteredSearchTools = searchQuery.trim()
    ? ALL_TOOLS.filter(
        (t) =>
          t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.shortDesc.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Left: Brand Logo (Replaced with new exact logo image as requested) */}
        <div className="flex items-center gap-3 sm:gap-6">
          <Link href="/" prefetch={false} className="flex items-center group transition-transform hover:opacity-90">
            <Image 
              src="/v2c-pdf-editor-logo.png" 
              alt="v2c PDF editor" 
              width={206} 
              height={84} 
              priority
              className="h-10 sm:h-11 w-auto object-contain"
            />
          </Link>
        </div>

        {/* Center: Search Bar with Autocomplete */}
        <div className="relative flex-1 max-w-md hidden md:block" ref={searchBoxRef}>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search PDF tools (e.g. merge, compress, word, sign)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-xs text-slate-800 placeholder-slate-400 rounded-full border border-slate-200 focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-100 transition-all"
            />
          </div>

          {/* Autocomplete Results Box */}
          {searchFocused && searchQuery.trim() && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-50 max-h-80 overflow-y-auto">
              {filteredSearchTools.length > 0 ? (
                filteredSearchTools.map((t) => (
                  <Link
                    key={t.id}
                    href={t.href}
                    prefetch={false}
                    onClick={() => {
                      setSearchFocused(false);
                      setSearchQuery('');
                    }}
                    className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <div className={`p-2 rounded-lg ${t.bgColor} ${t.iconColor}`}>
                      <DynamicIcon name={t.iconName} className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-800">{t.name}</div>
                      <div className="text-[11px] text-slate-500 truncate max-w-xs">{t.shortDesc}</div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="p-4 text-center text-xs text-slate-400">
                  No tools found matching &quot;{searchQuery}&quot;
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Direct Tool Links & Free Badges (No Login/Signup) */}
        <div className="flex items-center gap-2 sm:gap-3">
          <nav className="hidden lg:flex items-center gap-1 text-xs font-semibold text-slate-700">
            <Link href="/tools/merge-pdf" prefetch={false} className="px-3 py-2 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition-colors">
              Merge
            </Link>
            <Link href="/tools/split-pdf" prefetch={false} className="px-3 py-2 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition-colors">
              Split
            </Link>
            <Link href="/tools/compress-pdf" prefetch={false} className="px-3 py-2 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition-colors">
              Compress
            </Link>
            <Link href="/tools/jpg-to-pdf" prefetch={false} className="px-3 py-2 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition-colors">
              Convert
            </Link>
            <Link href="/tools/sign-pdf" prefetch={false} className="px-3 py-2 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition-colors">
              Sign
            </Link>
            <Link href="/tools/edit-pdf" prefetch={false} className="px-3 py-2 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition-colors">
              Edit
            </Link>
          </nav>

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-slate-700 hover:bg-slate-100 focus:outline-hidden"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation (Full screen solid overlay with zero bleed-through) */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-white flex flex-col h-[100dvh]">
          {/* Mobile Drawer Header */}
          <div className="h-16 px-4 flex items-center justify-between border-b border-slate-100 flex-shrink-0">
            <Link href="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center">
              <Image 
                src="/v2c-pdf-editor-logo.png" 
                alt="v2c PDF editor" 
                width={206} 
                height={84} 
                className="h-9 w-auto object-contain"
              />
            </Link>

            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-lg text-slate-700 hover:bg-slate-100 focus:outline-hidden"
              aria-label="Close navigation menu"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Mobile Drawer Scrollable Body */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
            {/* Mobile Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search PDF tools..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 text-xs rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-hidden"
              />
            </div>

            {/* If mobile search is active, show search results directly */}
            {searchQuery.trim() ? (
              <div className="space-y-1">
                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Matching Tools ({filteredSearchTools.length})
                </h4>
                {filteredSearchTools.length > 0 ? (
                  filteredSearchTools.map((t) => (
                    <Link
                      key={t.id}
                      href={t.href}
                      prefetch={false}
                      onClick={() => {
                        setMobileMenuOpen(false);
                        setSearchQuery('');
                      }}
                      className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 active:bg-slate-100 transition-colors"
                    >
                      <div className={`p-2 rounded-lg ${t.bgColor} ${t.iconColor}`}>
                        <DynamicIcon name={t.iconName} className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-800">{t.name}</div>
                        <div className="text-[11px] text-slate-500 truncate max-w-[220px]">{t.shortDesc}</div>
                      </div>
                    </Link>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 py-3 text-center">No tools found matching &quot;{searchQuery}&quot;</p>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {CATEGORIES.filter((c) => c.id !== 'all').map((cat) => {
                  const catTools = ALL_TOOLS.filter((t) => t.category === cat.id);
                  return (
                    <div key={cat.id} className="border-b border-slate-100 pb-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                        {cat.name}
                      </h4>
                      <div className="grid grid-cols-1 gap-1">
                        {catTools.map((t) => (
                          <Link
                            key={t.id}
                            href={t.href}
                            prefetch={false}
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 active:bg-slate-100 text-slate-700 text-xs transition-colors min-h-[40px]"
                          >
                            <div className={`p-1.5 rounded-lg ${t.bgColor} ${t.iconColor} flex-shrink-0`}>
                              <DynamicIcon name={t.iconName} className="w-4 h-4" />
                            </div>
                            <span className="truncate font-semibold">{t.name}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Clean end of sidebar marker */}
            <div className="pt-4 pb-6 border-t border-slate-100 text-center">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-[11px] font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>All 38 Tools Available &bull; 100% Free</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">End of tool directory</p>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
