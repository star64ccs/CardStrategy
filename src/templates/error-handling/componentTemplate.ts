import React, { Component, ErrorInfo, ReactNode } from 'react';
import { errorHandler } from '@/core/utils/errorHandler';

/**
 * 組件錯誤處理模板
 * 按照執行原則建構
 * 嚴謹語法，無錯誤，高質量代碼
 */
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // 記錄錯誤
    errorHandler.handleError(error, 'ErrorBoundary');
    
    // 調用自定義錯誤處理
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
    
    this.setState({
      error,
      errorInfo,
    });
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h2>發生錯誤</h2>
          <p>應用程序遇到了一個問題。請刷新頁面或聯繫支持。</p>
          <button onClick={() => this.setState({ hasError: false })}>
            重試
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook 錯誤處理
export function useErrorHandler() {
  const _handleError = (error: Error, context: string) => {
    return errorHandler.handleError(error, context);
  };
  
  const _handleAsyncError = async <T>(
    operation: () => Promise<T>,
    context: string
  ): Promise<T> => {
    try {
      return await operation();
    } catch (error) {
      throw errorHandler.handleError(error as Error, context);
    }
  };
  
  return { handleError, handleAsyncError };
}