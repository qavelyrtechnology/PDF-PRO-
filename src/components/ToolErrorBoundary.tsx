import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

interface BoundaryProps {
  children: React.ReactNode;
  resetKey?: string;
}

interface BoundaryState {
  hasError: boolean;
  errorMessage?: string;
}

class ErrorBoundaryInner extends React.Component<
  BoundaryProps & {
    title: string;
    description: string;
    tryAgainLabel: string;
    backHomeLabel: string;
  },
  BoundaryState
> {
  constructor(
    props: BoundaryProps & {
      title: string;
      description: string;
      tryAgainLabel: string;
      backHomeLabel: string;
    }
  ) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): BoundaryState {
    return { hasError: true, errorMessage: error?.message };
  }

  componentDidUpdate(prevProps: BoundaryProps) {
    if (prevProps.resetKey !== this.props.resetKey && this.state.hasError) {
      this.setState({ hasError: false, errorMessage: undefined });
    }
  }

  componentDidCatch(error: Error) {
    console.error('ToolErrorBoundary caught error:', error);
  }

  handleReset = () => {
    this.setState({ hasError: false, errorMessage: undefined });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="max-w-xl mx-auto px-4 py-16">
          <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/60 shadow-sm text-center space-y-5">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {this.props.title}
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {this.props.description}
              </p>
              {this.state.errorMessage && (
                <p className="text-xs font-mono text-rose-600 dark:text-rose-400 bg-rose-50/70 dark:bg-rose-950/30 rounded-lg px-3 py-2 break-words">
                  {this.state.errorMessage}
                </p>
              )}
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleReset}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span>{this.props.tryAgainLabel}</span>
              </button>
              <Link
                to="/"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-sm font-semibold transition-colors"
              >
                <Home className="w-4 h-4" />
                <span>{this.props.backHomeLabel}</span>
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export const ToolErrorBoundary: React.FC<BoundaryProps> = ({ children, resetKey }) => {
  const { t } = useLanguage();
  return (
    <ErrorBoundaryInner
      resetKey={resetKey}
      title={t.errorBoundary.title}
      description={t.errorBoundary.description}
      tryAgainLabel={t.errorBoundary.tryAgain}
      backHomeLabel={t.errorBoundary.backHome}
    >
      {children}
    </ErrorBoundaryInner>
  );
};
