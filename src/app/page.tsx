import type { Metadata } from 'next';
import { HeroBanner } from '@/components/home/HeroBanner';
import { ToolsGrid } from '@/components/home/ToolsGrid';
import { RecentTasksBanner } from '@/components/home/RecentTasksBanner';

export const metadata: Metadata = {
  title: 'v2c PDF editor — Free Online PDF Tools (Edit, Merge, Split, Convert, Sign)',
  description:
    'Free online PDF editor and all-in-one suite to edit, merge, split, compress, convert, draw, add shapes, tables, and sign PDFs with 100% private in-browser processing.',
  alternates: {
    canonical: '/',
  },
};

export default function HomePage() {
  return (
    <div className="flex flex-col">
      <HeroBanner />
      <ToolsGrid />
      <RecentTasksBanner />
    </div>
  );
}
