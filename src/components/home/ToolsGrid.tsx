'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  CATEGORIES, 
  ALL_TOOLS, 
  ToolCategory, 
  PDFTool 
} from '@/lib/tools-data';
import { DynamicIcon } from '@/components/common/DynamicIcon';
import { ArrowUpRight } from 'lucide-react';

export function ToolsGrid() {
  const [activeCategory, setActiveCategory] = useState<ToolCategory | 'all'>('all');

  const filteredTools = ALL_TOOLS.filter((tool) => {
    return activeCategory === 'all' || tool.category === activeCategory;
  });

  return (
    <section id="tools" className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Category Filter Pills Header */}
        <div className="flex items-center justify-start sm:justify-center pb-6 border-b border-slate-100">
          
          {/* Scrollable Category Filter Pills (Mobile edge-to-edge scroll) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 sm:pb-0 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-3.5 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 active:scale-95 flex-shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-[#0B1B3D] text-white shadow-md shadow-navy-950/10'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
                  }`}
                >
                  <span>{cat.name}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {cat.id === 'all' ? ALL_TOOLS.length : ALL_TOOLS.filter(t => t.category === cat.id).length}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tools Cards Grid */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
          {filteredTools.map((tool) => {
            const badgeLabel = tool.badge || (tool.popular ? 'Popular' : null);
            return (
              <Link
                key={tool.id}
                href={tool.href}
                prefetch={false}
                aria-label={`Open ${tool.name} tool`}
                className={`group relative p-5 rounded-2xl bg-white border ${tool.borderColor} transition-all duration-200 hover:-translate-y-1 hover:shadow-lg active:scale-[0.98] flex flex-col justify-between cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-blue-500`}
              >
                {/* Badge if available */}
                {badgeLabel && (
                  <div className="absolute top-4 right-4 pointer-events-none">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      badgeLabel === 'Popular'
                        ? 'bg-blue-100 text-blue-800 border border-blue-200'
                        : 'bg-lime-100 text-lime-800 border border-lime-300'
                    }`}>
                      {badgeLabel}
                    </span>
                  </div>
                )}

                <div>
                  {/* Icon Container */}
                  <div className={`w-12 h-12 rounded-xl ${tool.bgColor} flex items-center justify-center mb-4 transition-transform group-hover:scale-105 pointer-events-none`}>
                    <DynamicIcon name={tool.iconName} className={`w-6 h-6 ${tool.iconColor}`} />
                  </div>

                  {/* Tool Name */}
                  <h3 className="font-bold text-slate-900 text-base group-hover:text-blue-600 transition-colors flex items-center gap-1.5">
                    <span>{tool.name}</span>
                    <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-blue-600 flex-shrink-0" />
                  </h3>

                  {/* Tool Description */}
                  <p className="mt-2 text-xs text-slate-500 leading-relaxed line-clamp-2">
                    {tool.shortDesc}
                  </p>
                </div>

                {/* Bottom Category Tag */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="capitalize font-medium">{tool.category.replace('-', ' ')}</span>
                  <span className="font-semibold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity text-xs">
                    Launch &rarr;
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredTools.length === 0 && (
          <div className="text-center py-16 bg-slate-50 rounded-2xl border border-dashed border-slate-300 mt-8">
            <p className="text-slate-500 text-sm font-medium">No PDF tools found in this category.</p>
            <button
              type="button"
              onClick={() => setActiveCategory('all')}
              className="mt-3 text-xs font-bold text-blue-600 hover:underline cursor-pointer"
            >
              Show all tools
            </button>
          </div>
        )}

      </div>
    </section>
  );
}
