import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.NEXT_PUBLIC_APP_URL && !process.env.NEXT_PUBLIC_APP_URL.includes('localhost')
    ? process.env.NEXT_PUBLIC_APP_URL
    : 'https://v2c-pdf.app');

// 1. Viewport & Theme Configuration
export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  colorScheme: 'light',
};

// 2. Comprehensive SEO Metadata
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),

  title: {
    default: 'v2c PDF editor — Free Online PDF Tools (Edit, Merge, Split, Convert, Sign)',
    template: '%s | v2c PDF editor',
  },
  description:
    'Free online PDF editor and tools to edit, merge, split, compress, convert, draw, add shapes, tables, and sign PDFs with 100% private in-browser processing. Powered by v2c PDF editor.',
  applicationName: 'v2c PDF editor',
  keywords: [
    'PDF editor',
    'free online PDF editor',
    'edit PDF',
    'merge PDF',
    'split PDF',
    'compress PDF',
    'convert PDF',
    'PDF to Word',
    'Word to PDF',
    'sign PDF',
    'fill PDF forms',
    'rotate PDF',
    'PDF security',
    'watermark PDF',
    'offline PDF editor',
    'client-side PDF editor',
    'private PDF tools',
    'v2c PDF',
    'vibe2code',
  ],
  authors: [{ name: 'Vibe2Code', url: 'https://vibe2code.in' }],
  creator: 'Vibe2Code',
  publisher: 'v2c PDF editor',
  category: 'Utilities',

  // Canonical & Multilingual / Hreflang
  alternates: {
    canonical: '/',
    languages: {
      'en-US': '/',
      'x-default': '/',
    },
  },

  // Robots & Crawlers Directives
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  // Open Graph (Facebook, LinkedIn, Discord, Slack)
  openGraph: {
    title: 'v2c PDF editor — Free Online PDF Tools (Edit, Merge, Split, Convert, Sign)',
    description:
      'Free online PDF editor and tools to edit, merge, split, compress, convert, draw, add shapes, tables, and sign PDFs with 100% private in-browser processing.',
    url: siteUrl,
    siteName: 'v2c PDF editor',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/v2c-pdf-editor-logo.png',
        width: 1200,
        height: 630,
        alt: 'v2c PDF editor - Free Online PDF Tools Suite',
      },
    ],
  },

  // Twitter Cards
  twitter: {
    card: 'summary_large_image',
    title: 'v2c PDF editor — Free Online PDF Tools',
    description:
      'Free online PDF editor and tools to edit, merge, split, compress, convert, draw, and sign PDFs with 100% private in-browser processing.',
    site: '@vibe2code',
    creator: '@vibe2code',
    images: ['/v2c-pdf-editor-logo.png'],
  },

  // Icons & Favicons
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: {
      rel: 'apple-touch-icon-precomposed',
      url: '/apple-touch-icon.png',
    },
  },

  // Manifest
  manifest: '/site.webmanifest',

  // Search Engine Verification Tags
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || 'google-site-verification-token',
    yandex: 'yandex-verification-token',
    yahoo: 'yahoo-verification-token',
    other: {
      me: ['https://vibe2code.in/'],
    },
  },

  // Custom / Fallback Meta Tags
  other: {
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'apple-mobile-web-app-title': 'v2c PDF',
    'application-name': 'v2c PDF editor',
    'mobile-web-app-capable': 'yes',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Schema.org Structured Data: WebSite Schema
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'v2c PDF editor',
    alternateName: 'V2C PDF',
    url: siteUrl,
    description:
      'Free online PDF editor and tools suite with private in-browser processing.',
    potentialAction: {
      '@type': 'SearchAction',
      target: `${siteUrl}/?search={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };

  // Schema.org Structured Data: WebApplication Schema
  const webAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'v2c PDF editor',
    alternateName: 'V2C PDF Editor Suite',
    url: siteUrl,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'All',
    browserRequirements: 'Requires JavaScript. Requires HTML5.',
    description:
      'Free online PDF editor and all-in-one suite to edit, merge, split, compress, convert, draw, add shapes, tables, and sign PDFs with 100% private in-browser processing.',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    creator: {
      '@type': 'Organization',
      name: 'Vibe2Code',
      url: 'https://vibe2code.in',
    },
    featureList: [
      'Edit PDF online',
      'Merge multiple PDFs',
      'Split PDF pages',
      'Compress PDF file size',
      'Convert PDF to Word, Excel, PowerPoint, Images, Text',
      'Sign PDF electronically',
      'Protect PDF with password',
      '100% Private in-browser processing',
    ],
  };

  // Schema.org Structured Data: Organization Schema
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'v2c PDF editor',
    url: siteUrl,
    logo: `${siteUrl}/v2c-pdf-editor-logo.png`,
    sameAs: [
      'https://vibe2code.in/',
      'https://www.linkedin.com/company/vibe2code-team/',
      'https://wa.me/919445177550',
      'https://www.instagram.com/vibe2.code?stkn=NzJscTJ5ZWlyYmdv',
      'https://www.facebook.com/share/19VXJTfA1e/',
      'https://github.com/V2C-Workspace',
    ],
  };

  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
      </head>
      <body className="font-sans min-h-screen flex flex-col bg-white text-slate-900 antialiased selection:bg-lime-200 selection:text-lime-900">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
