'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { CATEGORIES, ALL_TOOLS } from '@/lib/tools-data';

function LinkedInIcon({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect width="24" height="24" rx="4.5" fill="#0A66C2" />
      <path
        d="M7.1 19V9.5H4v9.5h3.1zM5.5 8.2c1.1 0 1.8-.8 1.8-1.7-.1-1-.8-1.7-1.8-1.7-1 0-1.8.7-1.8 1.7 0 .9.7 1.7 1.8 1.7zm13.5 10.8v-5.2c0-2.8-1.5-4.1-3.5-4.1-1.6 0-2.3.9-2.7 1.5v-1.3H9.8c0 .9 0 9.1 0 9.1h3.1v-5.1c0-.3 0-.5.1-.7.3-.7.9-1.5 2-1.5 1.4 0 2 1.1 2 2.7v4.6h3.6z"
        fill="#ffffff"
      />
    </svg>
  );
}

function WhatsAppIcon({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2.05 21.95l4.912-1.353A9.956 9.956 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm.05 18.25c-1.63 0-3.15-.46-4.45-1.26l-.32-.2-2.92.8.8-2.85-.21-.33a8.212 8.212 0 0 1-1.2-4.41c0-4.58 3.72-8.3 8.3-8.3 4.58 0 8.3 3.72 8.3 8.3 0 4.58-3.72 8.25-8.3 8.25zm4.56-6.19c-.25-.13-1.48-.73-1.71-.81-.23-.09-.4-.13-.57.13-.17.25-.66.81-.81.98-.15.17-.3.19-.55.06-.25-.13-1.06-.39-2.02-1.24-.75-.67-1.25-1.49-1.4-1.74-.15-.25-.02-.39.11-.51.11-.11.25-.3.38-.44.13-.15.17-.25.25-.42.08-.17.04-.32-.02-.45-.06-.13-.57-1.37-.78-1.88-.2-.5-.41-.43-.57-.44h-.48c-.17 0-.44.06-.67.32-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.13.17 1.77 2.7 4.29 3.78.6.26 1.07.41 1.43.53.6.19 1.15.16 1.58.1.48-.07 1.48-.6 1.69-1.19.21-.58.21-1.08.15-1.19-.06-.11-.23-.17-.48-.3z"
        fill="#25D366"
      />
    </svg>
  );
}

function InstagramIcon({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="url(#instagram-gradient)"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="instagram-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#f09433" />
          <stop offset="25%" stopColor="#e6683c" />
          <stop offset="50%" stopColor="#dc2743" />
          <stop offset="75%" stopColor="#cc2366" />
          <stop offset="100%" stopColor="#bc1888" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" strokeWidth="2.5" />
    </svg>
  );
}

function FacebookIcon({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="12" fill="#1877F2" />
      <path
        d="M15.5 12.2h-2.3v7.3H10.1v-7.3H8.7V9.7h1.4V8c0-1.9 1.1-3 3-3h1.9v2.5h-1.2c-.9 0-1.1.4-1.1 1.1v1.1h2.5l-.4 2.5z"
        fill="#ffffff"
      />
    </svg>
  );
}

function GithubIcon({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="#000000" className={className} aria-hidden="true">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  );
}

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
                    <Link href={tool.href} prefetch={true} className="hover:text-blue-600 transition-colors">
                      {tool.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Social / Contact Grid Matching Custom Design */}
        <div className="pt-10 pb-10 border-t border-slate-200 flex justify-center">
          <div className="grid grid-cols-2 gap-x-6 sm:gap-x-16 gap-y-4 sm:gap-y-6 max-w-sm sm:max-w-md w-full mx-auto">
            
            {/* 1. LinkedIn */}
            <a
              href="https://www.linkedin.com/company/vibe2code-team/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn @vibe2code"
              className="flex items-center gap-2.5 sm:gap-3 text-slate-700 hover:text-slate-900 transition-colors group"
            >
              <LinkedInIcon className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 transition-transform group-hover:scale-105" />
              <span className="text-xs sm:text-sm md:text-base font-medium tracking-tight truncate">
                @vibe2code
              </span>
            </a>

            {/* 2. WhatsApp */}
            <a
              href="https://wa.me/919445177550"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp +91 94451 77550"
              className="flex items-center gap-2.5 sm:gap-3 text-slate-700 hover:text-slate-900 transition-colors group"
            >
              <WhatsAppIcon className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 transition-transform group-hover:scale-105" />
              <span className="text-xs sm:text-sm md:text-base font-medium tracking-tight truncate">
                +91 94451 77550
              </span>
            </a>

            {/* 3. Instagram */}
            <a
              href="https://www.instagram.com/vibe2.code?stkn=NzJscTJ5ZWlyYmdv"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram @vibe2.code"
              className="flex items-center gap-2.5 sm:gap-3 text-slate-700 hover:text-slate-900 transition-colors group"
            >
              <InstagramIcon className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 transition-transform group-hover:scale-105" />
              <span className="text-xs sm:text-sm md:text-base font-medium tracking-tight truncate">
                @vibe2.code
              </span>
            </a>

            {/* 4. Facebook */}
            <a
              href="https://www.facebook.com/share/19VXJTfA1e/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook vibe2code"
              className="flex items-center gap-2.5 sm:gap-3 text-slate-700 hover:text-slate-900 transition-colors group"
            >
              <FacebookIcon className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 transition-transform group-hover:scale-105" />
              <span className="text-xs sm:text-sm md:text-base font-medium tracking-tight truncate">
                vibe2code
              </span>
            </a>

            {/* 5. GitHub (centered on row 3) */}
            <div className="col-span-2 flex justify-center pt-1">
              <a
                href="https://github.com/V2C-Workspace"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub V2C-Workspace"
                className="flex items-center gap-2.5 sm:gap-3 text-slate-700 hover:text-slate-900 transition-colors group"
              >
                <GithubIcon className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 transition-transform group-hover:scale-105" />
                <span className="text-xs sm:text-sm md:text-base font-medium tracking-tight truncate">
                  V2C-Workspace
                </span>
              </a>
            </div>

          </div>
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
