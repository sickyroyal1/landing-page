import React, { Component } from 'react';
import { RefreshCw } from 'lucide-react';

interface ErrorBoundaryProps {
  children?: unknown;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

/**
 * App-level error boundary — a booking/payment runtime error shows a styled
 * fallback instead of white-screening the whole page.
 */
export class ErrorBoundary extends Component {
  // Type-only declaration (no runtime emit) — keeps `this.props` typed without
  // depending on React's generic Component types.
  props!: ErrorBoundaryProps;
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('App crashed:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
          <div className="w-full max-w-md bg-slate-900 border border-rose-500/30 rounded-3xl shadow-2xl p-8 text-center space-y-4">
            <div className="mx-auto w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center">
              <RefreshCw className="w-6 h-6 text-rose-400" />
            </div>
            <h1 className="text-lg font-black text-white">Something went wrong</h1>
            <p className="text-xs text-slate-400 leading-relaxed">
              An unexpected error occurred while rendering the page. Reload to get back to booking.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full py-3 bg-gradient-to-r from-purple-400 to-violet-400 hover:from-purple-300 hover:to-violet-300 text-slate-950 font-extrabold rounded-xl text-xs shadow-lg shadow-purple-500/25 transition-all cursor-pointer"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
