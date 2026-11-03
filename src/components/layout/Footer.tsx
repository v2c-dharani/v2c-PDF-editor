'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { ShieldCheck, Lock, Sparkles, ExternalLink, ArrowUpRight } from 'lucide-react';
import { CATEGORIES, ALL_TOOLS } from '@/lib/tools-data';

// --- PIXEL-PERFECT BRAND ICONS ---

export function LinkedInIcon({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect width="24" height="24" rx="5" fill="#0A66C2" />
      <path
        d="M7.1 19V9.5H4v9.5h3.1zM5.5 8.2c1.1 0 1.8-.8 1.8-1.7-.1-1-.8-1.7-1.8-1.7-1 0-1.8.7-1.8 1.7 0 .9.7 1.7 1.8 1.7zm13.5 10.8v-5.2c0-2.8-1.5-4.1-3.5-4.1-1.6 0-2.3.9-2.7 1.5v-1.3H9.8c0 .9 0 9.1 0 9.1h3.1v-5.1c0-.3 0-.5.1-.7.3-.7.9-1.5 2-1.5 1.4 0 2 1.1 2 2.7v4.6h3.6z"
        fill="#ffffff"
      />
    </svg>
  );
}

export function WhatsAppIcon({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="12" fill="#25D366" />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 4.5A7.5 7.5 0 0 0 5.48 15.75L4.7 18.6l2.95-.77A7.5 7.5 0 1 0 12 4.5zm3.7 9.8c-.16.44-.92.83-1.28.88-.36.05-.8.07-2.35-.55-1.95-.78-3.2-2.76-3.3-2.9-.1-.13-.8-1.07-.8-2.04 0-.97.5-1.45.69-1.65.18-.2.4-.25.53-.25.13 0 .26 0 .37.01.12.01.28-.05.44.33.16.38.55 1.34.6 1.44.05.1.08.22.02.35-.06.13-.09.22-.19.33-.1.11-.2.25-.29.33-.1.1-.21.2-.09.4.12.2.53.88 1.15 1.43.8.71 1.47.93 1.68 1.03.2.1.33.09.45-.05.12-.14.52-.61.66-.82.14-.21.28-.18.47-.11.19.07 1.21.57 1.42.67.21.1.35.16.4.25.06.09.06.52-.1.96z"
        fill="#ffffff"
      />
    </svg>
  );
}

export function InstagramIcon({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="ig-footer-grad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#f09433" />
          <stop offset="25%" stopColor="#e6683c" />
          <stop offset="50%" stopColor="#dc2743" />
          <stop offset="75%" stopColor="#cc2366" />
          <stop offset="100%" stopColor="#bc1888" />
        </linearGradient>
      </defs>
      <rect width="24" height="24" rx="6" fill="url(#ig-footer-grad)" />
      <rect x="5.5" y="5.5" width="13" height="13" rx="3.5" stroke="#ffffff" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="3.2" stroke="#ffffff" strokeWidth="1.6" />
      <circle cx="15.5" cy="8.5" r="0.9" fill="#ffffff" />
    </svg>
  );
}

export function FacebookIcon({ className = 'w-6 h-6' }: { className?: string }) {
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

export function GithubIcon({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="12" fill="#181717" />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 5.5c-3.59 0-6.5 2.91-6.5 6.5 0 2.87 1.86 5.3 4.44 6.16.33.06.44-.14.44-.31v-1.1c-1.81.39-2.19-.87-2.19-.87-.3-.75-.72-.95-.72-.95-.59-.4.04-.4.04-.4.65.05 1 .67 1 .67.58 1 1.52.71 1.89.54.06-.42.23-.71.41-.87-1.44-.16-2.96-.72-2.96-3.21 0-.71.25-1.29.67-1.74-.07-.16-.29-.82.06-1.72 0 0 .55-.17 1.78.67a6.22 6.22 0 0 1 3.24 0c1.24-.84 1.78-.67 1.78-.67.35.9.13 1.56.06 1.72.42.45.67 1.03.67 1.74 0 2.5-1.52 3.05-2.97 3.21.23.2.44.6.44 1.21v1.79c0 .18.12.38.45.31A6.51 6.51 0 0 0 18.5 12c0-3.59-2.91-6.5-6.5-6.5z"
        fill="#ffffff"
      />
    </svg>
  );
}

// 5 Official Social & Support Channels
export const SOCIAL_CONTACTS = [
  {
    id: 'linkedin',
    name: 'LinkedIn',
    handle: '@vibe2code',
    subtitle: 'Official Company',
    href: 'https://www.linkedin.com/company/vibe2code-team/',
    icon: LinkedInIcon,
    ariaLabel: 'LinkedIn @vibe2code',
    tag: 'Official',
    hoverBorder: 'hover:border-blue-400 group-hover:text-blue-600',
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    handle: '+91 94451 77550',
    subtitle: 'Instant Support',
    href: 'https://wa.me/919445177550',
    icon: WhatsAppIcon,
    ariaLabel: 'WhatsApp +91 94451 77550',
    tag: 'Support',
    hoverBorder: 'hover:border-emerald-400 group-hover:text-emerald-700',
  },
  {
    id: 'instagram',
    name: 'Instagram',
    handle: '@vibe2.code',
    subtitle: 'Product & Team',
    href: 'https://www.instagram.com/vibe2.code?stkn=NzJscTJ5ZWlyYmdv',
    icon: InstagramIcon,
    ariaLabel: 'Instagram @vibe2.code',
    tag: 'Updates',
    hoverBorder: 'hover:border-rose-400 group-hover:text-rose-600',
  },
  {
    id: 'facebook',
    name: 'Facebook',
    handle: 'vibe2code',
    subtitle: 'Community Hub',
    href: 'https://www.facebook.com/share/19VXJTfA1e/',
    icon: FacebookIcon,
    ariaLabel: 'Facebook vibe2code',
    tag: 'Community',
    hoverBorder: 'hover:border-blue-500 group-hover:text-blue-700',
  },
  {
    id: 'github',
    name: 'GitHub',
    handle: 'V2C-Workspace',
    subtitle: 'Open Source',
    href: 'https://github.com/V2C-Workspace',
    icon: GithubIcon,
    ariaLabel: 'GitHub V2C-Workspace',
    tag: 'Source',
    hoverBorder: 'hover:border-slate-800 group-hover:text-slate-900',
  },
];

export function Footer() {
  const pathname = usePathname();

  // If a tool is selected (any /tools/* route), do not show the footer at all
  if (pathname?.startsWith('/tools/')) {
    return null;
  }

  return (
    <footer className="bg-gradient-to-b from-slate-50 via-slate-50 to-slate-100/80 border-t border-slate-200 mt-20 pt-16 pb-12 text-slate-600 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Directory Categorized Columns (5 Categories) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8 mb-14">
          {CATEGORIES.filter((c) => c.id !== 'all').map((cat) => (
            <div key={cat.id} className="space-y-3">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-sans">
                  {cat.name}
                </h4>
              </div>
              <ul className="space-y-2 text-xs text-slate-500 font-sans">
                {ALL_TOOLS.filter((t) => t.category === cat.id).map((tool) => (
                  <li key={tool.id}>
                    <Link
                      href={tool.href}
                      prefetch={true}
                      className="hover:text-blue-600 hover:translate-x-0.5 inline-block transition-all duration-150"
                    >
                      {tool.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* --- OFFICIAL SOCIAL & CONTACT SECTION --- */}
        <div className="pt-10 pb-8 border-t border-slate-200">
          <div className="text-center max-w-xl mx-auto mb-7">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-[11px] font-bold tracking-wide uppercase mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
              Official Channels &amp; Support
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              Connect with vibe2code
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Get direct support, request custom PDF tools, or follow our open source updates.
            </p>
          </div>

          {/* Social Cards Grid: Responsive 2-col on mobile, 5-col on desktop */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-2.5 sm:gap-4 max-w-5xl mx-auto">
            {SOCIAL_CONTACTS.map((item) => (
              <a
                key={item.id}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={item.ariaLabel}
                className={`group relative flex items-center gap-2.5 sm:gap-3 p-2.5 sm:p-3 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 ${
                  item.id === 'github' ? 'col-span-2 lg:col-span-1 justify-center sm:justify-start' : ''
                }`}
              >
                <div className="flex-shrink-0 transition-transform duration-200 group-hover:scale-110">
                  <item.icon className="w-7 h-7 sm:w-8 sm:h-8 shadow-xs rounded-xl" />
                </div>
                <div className="min-w-0 flex-1 text-left">
                  <div className="flex items-center gap-1">
                    <span className="text-xs sm:text-sm font-semibold text-slate-800 tracking-tight truncate group-hover:text-blue-600 transition-colors">
                      {item.handle}
                    </span>
                    <ArrowUpRight className="w-3 h-3 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                  </div>
                  <span className="text-[10px] sm:text-[11px] font-medium text-slate-400 block truncate">
                    {item.name} &bull; {item.tag}
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* --- BOTTOM COPYRIGHT & BRAND BAR --- */}
        <div className="pt-6 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          
          {/* Logo & Copyright */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <div className="bg-white px-2.5 py-1 rounded-lg border border-slate-200/80 shadow-xs flex items-center">
              <Image 
                src="/v2c-pdf-editor-logo.png" 
                alt="v2c PDF editor" 
                width={140} 
                height={48} 
                className="h-6 sm:h-7 w-auto object-contain mix-blend-multiply"
              />
            </div>
            <span className="text-slate-500 font-medium whitespace-nowrap">
              &copy; {new Date().getFullYear()} All rights reserved.
            </span>
          </div>

          {/* Developer Attribution */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
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
