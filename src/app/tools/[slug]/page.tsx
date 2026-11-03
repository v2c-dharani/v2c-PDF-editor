import React from 'react';
import { notFound } from 'next/navigation';
import { ALL_TOOLS, getToolBySlug } from '@/lib/tools-data';
import { UniversalToolRunner } from '@/components/tools/UniversalToolRunner';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import type { Metadata } from 'next';

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.NEXT_PUBLIC_APP_URL && !process.env.NEXT_PUBLIC_APP_URL.includes('localhost')
    ? process.env.NEXT_PUBLIC_APP_URL
    : 'https://v2c-pdf.app');

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
  if (!tool) {
    return {
      title: 'Tool Not Found — v2c PDF editor',
      robots: { index: false, follow: false },
    };
  }

  const toolTitle = `${tool.name} — Free Online Tool`;
  const toolDescription = `${tool.shortDesc} 100% free, private in-browser tool with zero server uploads. Fast, secure, and no installation required.`;
  const canonicalUrl = `/tools/${tool.id}`;

  return {
    title: toolTitle,
    description: toolDescription,
    applicationName: 'v2c PDF editor',
    keywords: [
      tool.name,
      `${tool.name} online`,
      `${tool.name} free`,
      'online PDF tool',
      'v2c pdf',
      tool.category,
      'free pdf utilities',
      'browser pdf tool',
      'client side pdf',
    ],
    authors: [{ name: 'Vibe2Code', url: 'https://vibe2code.in' }],
    creator: 'Vibe2Code',
    publisher: 'v2c PDF editor',
    alternates: {
      canonical: canonicalUrl,
      languages: {
        'en-US': canonicalUrl,
      },
    },
    robots: {
      index: true,
      follow: true,
      nocache: false,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      title: `${tool.name} — Free Online Tool | v2c PDF editor`,
      description: toolDescription,
      url: canonicalUrl,
      siteName: 'v2c PDF editor',
      locale: 'en_US',
      type: 'website',
      images: [
        {
          url: '/v2c-pdf-editor-logo.png',
          width: 1200,
          height: 630,
          alt: `${tool.name} - v2c PDF editor`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${tool.name} — Free Online Tool | v2c PDF editor`,
      description: toolDescription,
      site: '@vibe2code',
      creator: '@vibe2code',
      images: ['/v2c-pdf-editor-logo.png'],
    },
  };
}

export default function ToolPage({ params }: ToolPageProps) {
  const tool = getToolBySlug(params.slug);

  if (!tool) {
    notFound();
  }

  const toolCanonical = `${siteUrl}/tools/${tool.id}`;

  // Structured Data (JSON-LD) for SoftwareApplication / WebApplication
  const applicationSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: `${tool.name} — v2c PDF editor`,
    url: toolCanonical,
    description: tool.shortDesc,
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'All',
    browserRequirements: 'Requires JavaScript. Requires HTML5.',
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
  };

  // Structured Data (JSON-LD) for Breadcrumbs
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: siteUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Tools',
        item: siteUrl,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: tool.name,
        item: toolCanonical,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(applicationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <ErrorBoundary fallbackTitle={`Error in ${tool.name}`}>
        <UniversalToolRunner tool={tool} />
      </ErrorBoundary>
    </>
  );
}
