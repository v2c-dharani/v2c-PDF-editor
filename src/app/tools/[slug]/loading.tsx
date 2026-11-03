import React from 'react';

export default function ToolLoading() {
  return (
    <div className="min-h-screen bg-slate-50/50 py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* Breadcrumb Skeleton */}
        <div className="flex items-center gap-2 mb-8 animate-pulse">
          <div className="h-4 w-12 bg-slate-200 rounded" />
          <span className="text-slate-300">/</span>
          <div className="h-4 w-16 bg-slate-200 rounded" />
          <span className="text-slate-300">/</span>
          <div className="h-4 w-28 bg-slate-200 rounded" />
        </div>

        {/* Tool Header Skeleton */}
        <div className="text-center mb-8 animate-pulse">
          <div className="h-10 w-64 bg-slate-200 rounded-xl mx-auto mb-3" />
          <div className="h-4 w-96 max-w-full bg-slate-200 rounded mx-auto" />
        </div>

        {/* Upload Dropzone Skeleton Card */}
        <div className="bg-white rounded-3xl border-2 border-dashed border-slate-200 p-12 sm:p-16 text-center shadow-sm animate-pulse">
          <div className="w-16 h-16 bg-blue-50 border border-blue-100 rounded-2xl mx-auto mb-4 flex items-center justify-center">
            <div className="w-8 h-8 bg-blue-200 rounded-lg" />
          </div>
          <div className="h-5 w-48 bg-slate-200 rounded mx-auto mb-2" />
          <div className="h-3 w-64 max-w-full bg-slate-100 rounded mx-auto mb-6" />
          <div className="h-11 w-44 bg-blue-500/80 rounded-xl mx-auto" />
        </div>

        {/* Privacy Note Skeleton */}
        <div className="mt-8 text-center animate-pulse">
          <div className="h-3 w-72 bg-slate-200 rounded mx-auto" />
        </div>

      </div>
    </div>
  );
}
