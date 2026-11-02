import { HeroBanner } from '@/components/home/HeroBanner';
import { ToolsGrid } from '@/components/home/ToolsGrid';
import { RecentTasksBanner } from '@/components/home/RecentTasksBanner';

export default function HomePage() {
  return (
    <div className="flex flex-col">
      <HeroBanner />
      <ToolsGrid />
      <RecentTasksBanner />
    </div>
  );
}
