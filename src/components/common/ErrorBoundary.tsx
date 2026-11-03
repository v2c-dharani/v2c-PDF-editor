'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an unhandled error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[50vh] flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-3xl border border-rose-100 shadow-xl p-6 sm:p-8 text-center space-y-5 animate-in fade-in zoom-in-95">
            <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 mx-auto flex items-center justify-center shadow-xs">
              <AlertTriangle className="w-8 h-8 stroke-[2.25]" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-extrabold text-[#0B1B3D] tracking-tight">
                {this.props.fallbackTitle || 'Tool Encountered an Error'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                An unexpected problem occurred while rendering this tool. Your data was not sent to any server.
              </p>
              {this.state.error?.message && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-left">
                  <p className="text-[11px] font-mono text-slate-700 break-words">
                    {this.state.error.message}
                  </p>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
              <button
                type="button"
                onClick={this.handleReset}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#0B1B3D] text-white text-xs sm:text-sm font-bold hover:bg-[#122754] transition-colors shadow-xs"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Try Again
              </button>
              <Link
                href="/"
                prefetch={true}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs sm:text-sm font-semibold hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <Home className="w-3.5 h-3.5" /> Back to Homepage
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
