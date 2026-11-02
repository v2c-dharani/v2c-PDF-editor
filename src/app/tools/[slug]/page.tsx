import React from 'react';
import { notFound } from 'next/navigation';
import { ALL_TOOLS, getToolBySlug } from '@/lib/tools-data';
import { UniversalToolRunner } from '@/components/tools/UniversalToolRunner';
import type { Metadata } from 'next';

interface ToolPageProps {
  params: {
    slug: string;
  };
}

export function generateStaticParams() {
  return ALL_TOOLS.map((tool) => ({
    slug: tool.id,
  }));
}

export function generateMetadata({ params }: ToolPageProps): Metadata {
  const tool = getToolBySlug(params.slug);
  if (!tool) return { title: 'Tool Not Found — V2C PDF' };

  return {
    title: `${tool.name} — Free Online Tool | V2C PDF`,
    description: tool.shortDesc,
  };
}

export default function ToolPage({ params }: ToolPageProps) {
  const tool = getToolBySlug(params.slug);

  if (!tool) {
    notFound();
  }

  return <UniversalToolRunner tool={tool} />;
}
