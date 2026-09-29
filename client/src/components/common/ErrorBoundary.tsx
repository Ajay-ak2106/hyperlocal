import React, { Component, ErrorInfo, ReactNode } from 'react';
import { RefreshCw, AlertTriangle, Trash2, PhoneCall } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('NammaRescue Uncaught Component Error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleHardReset = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          for (const reg of registrations) {
            reg.unregister();
          }
        });
      }
      if ('caches' in window) {
        caches.keys().then((keys) => {
          for (const key of keys) {
            caches.delete(key);
          }
        });
      }
    } catch (e) {
      console.error(e);
    }
    setTimeout(() => {
      window.location.href = window.location.origin + '?reset=' + Date.now();
    }, 300);
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 selection:bg-rose-500 selection:text-white">
          <div className="max-w-md w-full bg-slate-900 border border-slate-700/80 rounded-2xl p-6 shadow-2xl text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-3xl">
              🆘
            </div>

            <div>
              <h2 className="text-xl font-extrabold text-white tracking-tight">
                NammaRescue Emergency Portal
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                சென்னை பேரிடர் மேலாண்மை மீட்பு தளம்
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 text-left text-xs space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-amber-400">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>Application Recovery Mode</span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                The portal encountered a temporary synchronization hiccup. Your emergency contacts and local disaster network remain operational.
              </p>
            </div>

            <div className="space-y-2.5 pt-1">
              <button
                onClick={this.handleReload}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md transition-all active:scale-95"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reload Emergency Portal</span>
              </button>

              <button
                onClick={this.handleHardReset}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs border border-slate-700 transition-all active:scale-95"
              >
                <Trash2 className="w-3.5 h-3.5 text-slate-400" />
                <span>Clear Cache & Clean Reload</span>
              </button>
            </div>

            {/* Direct Helplines */}
            <div className="pt-3 border-t border-slate-800 text-xs">
              <div className="text-[11px] font-semibold text-slate-400 mb-2 flex items-center justify-center gap-1">
                <PhoneCall className="w-3 h-3 text-red-400" />
                <span>Immediate 24/7 Helpline Numbers</span>
              </div>
              <div className="flex justify-center gap-4 text-xs font-bold">
                <a href="tel:1913" className="text-sky-400 hover:underline">GCC: 1913</a>
                <a href="tel:1070" className="text-amber-400 hover:underline">State: 1070</a>
                <a href="tel:108" className="text-emerald-400 hover:underline">Ambulance: 108</a>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
