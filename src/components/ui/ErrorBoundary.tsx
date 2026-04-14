/**
 * Error Boundary Component
 * Catches React crashes and displays error information
 */

import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { mobileLogger } from '../../utils/mobileLogger';
import './ErrorBoundary.css';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('React Error Boundary caught an error:', error, errorInfo);
    
    // Log to mobile logger for detailed debugging
    mobileLogger.error('React Error Boundary caught error', {
      errorMessage: error.message,
      errorStack: error.stack,
      componentStack: errorInfo.componentStack,
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString()
    });
    
    this.setState({
      error,
      errorInfo,
    });

    // Log error details for debugging
    console.log('Error Stack:', error.stack);
    console.log('Component Stack:', errorInfo.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="error-content">
            <h1>SLAMZ PRO-TOUR</h1>
            <div className="error-message">
              <h2>Application Error</h2>
              <p>The game encountered an error and crashed.</p>
            </div>

            <div className="error-details">
              <h3>Error Details:</h3>
              <div className="error-stack">
                <p><strong>Error:</strong> {this.state.error?.message}</p>
                {this.state.error?.stack && (
                  <details>
                    <summary>Error Stack</summary>
                    <pre>{this.state.error?.stack}</pre>
                  </details>
                )}
                {this.state.errorInfo?.componentStack && (
                  <details>
                    <summary>Component Stack</summary>
                    <pre>{this.state.errorInfo?.componentStack}</pre>
                  </details>
                )}
              </div>
            </div>

            <div className="device-info">
              <h4>Device Information:</h4>
              <p>Browser: {navigator.userAgent.substring(0, 50)}...</p>
              <p>Screen: {window.innerWidth}x{window.innerHeight}</p>
              <p>URL: {window.location.href}</p>
              <p>Timestamp: {new Date().toISOString()}</p>
            </div>

            <div className="actions">
              <button onClick={() => window.location.reload()} className="primary-button">
                Reload Page
              </button>
              <button onClick={() => {
                // Try to clear error and continue
                this.setState({ hasError: false, error: undefined, errorInfo: undefined });
              }} className="secondary-button">
                Try Continue
              </button>
              <button onClick={() => {
                // Copy error to clipboard
                const errorText = `Error: ${this.state.error?.message}\n\nStack: ${this.state.error?.stack}\n\nComponent Stack: ${this.state.errorInfo?.componentStack}\n\nUser Agent: ${navigator.userAgent}\n\nScreen: ${window.innerWidth}x${window.innerHeight}`;
                navigator.clipboard.writeText(errorText);
                alert('Error details copied to clipboard');
              }} className="secondary-button">
                Copy Error
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
