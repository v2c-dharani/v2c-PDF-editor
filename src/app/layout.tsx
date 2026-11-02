import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'v2c PDF editor — Free Online PDF Tools (Edit, Merge, Split, Convert, Sign)',
  description:
    'Free online PDF editor and tools to edit, merge, split, compress, convert, draw, add shapes, tables, and sign PDFs with 100% private in-browser processing. Powered by v2c PDF editor.',
  icons: {
    icon: '/v2c-pdf-editor-logo.png',
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
