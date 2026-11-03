import React from 'react';

export default function RootLoading() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-8">
      <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-sm font-medium text-slate-500 animate-pulse">Loading...</p>
    </div>
  );
}
