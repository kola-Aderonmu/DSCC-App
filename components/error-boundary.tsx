"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertCircle, RefreshCcw } from "lucide-react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-6 text-center">
          <div className="max-w-md space-y-6 rounded-[2.5rem] bg-white p-10 shadow-xl border border-slate-100">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-rose-50 text-rose-500">
              <AlertCircle className="h-10 w-10" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-slate-800">Something went wrong</h2>
              <p className="text-slate-500 font-medium">
                We encountered an unexpected error. Don't worry, your data is safe.
              </p>
            </div>
            {this.state.error && (
              <div className="rounded-2xl bg-slate-50 p-4 text-left text-xs font-mono text-slate-400 overflow-auto max-h-32">
                {this.state.error.message}
              </div>
            )}
            <button
              onClick={() => window.location.reload()}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#36c1bf] py-4 font-bold text-white shadow-lg shadow-[#36c1bf]/20 transition hover:bg-[#29aeb2]"
            >
              <RefreshCcw className="h-5 w-5" />
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
