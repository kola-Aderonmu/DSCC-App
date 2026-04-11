"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
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
          <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="h-8 w-8"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                />
              </svg>
            </div>
            <h2 className="mt-6 text-2xl font-bold text-slate-800">
              Something went wrong
            </h2>
            <p className="mt-2 text-slate-600">
              The application encountered an unexpected error.
            </p>
            <div className="mt-6 rounded-2xl bg-slate-100 p-4 text-left">
              <p className="text-xs font-mono text-slate-500 overflow-auto max-h-32">
                {this.state.error?.message}
              </p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="mt-8 w-full rounded-full bg-[#36c1bf] px-6 py-3 font-medium text-white transition hover:bg-[#29aeb2]"
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

export default ErrorBoundary;
