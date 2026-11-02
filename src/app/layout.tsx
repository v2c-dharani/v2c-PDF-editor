import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'v2c PDF editor — Free Online PDF Tools (Edit, Merge, Split, Convert, Sign)',
  description:
    'Free online PDF editor and tools to edit, merge, split, compress, convert, draw, add shapes, tables, and sign PDFs with 100% private in-browser processing. Powered by v2c PDF editor.',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.png', type: 'image/png', sizes: '32x32' },
      { url: '/icon-192.png', type: 'image/png', sizes: '192x192' },
      { url: '/icon-512.png', type: 'image/png', sizes: '512x512' },
    ],
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="min-h-screen flex flex-col bg-white text-slate-900 antialiased selection:bg-lime-200 selection:text-lime-900">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
