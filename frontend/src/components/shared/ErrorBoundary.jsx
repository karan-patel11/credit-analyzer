import React from 'react';
import { AlertTriangleIcon, RefreshIcon } from '../../utils/icons';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center space-y-4 rounded-[12px] border border-[rgba(239,68,68,0.2)] bg-[var(--status-decline-subtle)] p-6 text-center">
          <AlertTriangleIcon className="h-8 w-8 text-[var(--status-decline)]" />
          <div>
            <h3 className="mb-1 font-medium text-[var(--text-primary)]">Something went wrong</h3>
            <p className="text-sm text-[var(--text-secondary)]">We couldn&apos;t load this section.</p>
          </div>
          <button 
            onClick={() => this.setState({ hasError: false })}
            className="tempo-button h-10 min-h-0 px-4 text-sm"
          >
            <RefreshIcon className="w-4 h-4" />
            <span>Try Again</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
