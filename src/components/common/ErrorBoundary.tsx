import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { errorHandlerService } from '@/services/errorHandlerService';
import { logger } from '@/utils/logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetOnPropsChange?: boolean;
  componentName?: string;
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
    this.setState({ error, errorInfo });

    // 記錄錯誤到錯誤處理服務
    errorHandlerService.handleError(error, {
      category: 'ui',
      severity: 'critical',
      componentName: this.props.componentName,
      context: {
        type: 'errorBoundary',
        componentStack: errorInfo.componentStack,
        errorInfo,
      },
    });

    // 調用自定義錯誤處理函數
    this.props.onError?.(error, errorInfo);

    // 記錄錯誤日誌
    logger.error('錯誤邊界捕獲到錯誤', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      componentName: this.props.componentName,
    });
  }

  componentDidUpdate(prevProps: Props) {
    // 如果啟用了 props 變化重置，則在 props 變化時重置錯誤狀態
    if (
      this.props.resetOnPropsChange &&
      prevProps.children !== this.props.children
    ) {
      this.setState({
        hasError: false,
        error: undefined,
        errorInfo: undefined,
      });
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });

    // 記錄重置操作
    logger.info('錯誤邊界已重置', {
      componentName: this.props.componentName,
    });
  };

  handleReportError = () => {
    if (this.state.error) {
      // 顯示錯誤報告對話框
      Alert.alert('錯誤報告', '是否要報告此錯誤？', [
        { text: '取消', style: 'cancel' },
        {
          text: '報告',
          onPress: () => {
            // 這裡可以實現錯誤報告邏輯
            logger.info('用戶選擇報告錯誤', {
              error: this.state.error?.message,
              componentName: this.props.componentName,
            });
          },
        },
      ]);
    }
  };

  render() {
    if (this.state.hasError) {
      // 如果有自定義 fallback，使用它
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // 默認錯誤 UI
      return (
        <View style={styles.errorContainer}>
          <View style={styles.errorContent}>
            <Text style={styles.errorIcon}>⚠️</Text>
            <Text style={styles.errorTitle}>應用程序遇到問題</Text>
            <Text style={styles.errorMessage}>
              {this.state.error?.message || '發生未知錯誤'}
            </Text>

            {process.env.NODE_ENV === 'development' &&
              this.state.error?.stack && (
                <View style={styles.stackContainer}>
                  <Text style={styles.stackTitle}>錯誤堆疊:</Text>
                  <Text style={styles.stackText} numberOfLines={10}>
                    {this.state.error.stack}
                  </Text>
                </View>
              )}

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.resetButton]}
                onPress={this.handleReset}
              >
                <Text style={styles.resetButtonText}>重試</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.reportButton]}
                onPress={this.handleReportError}
              >
                <Text style={styles.reportButtonText}>報告錯誤</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

// 高階組件：為組件添加錯誤邊界
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
}

// Hook 版本錯誤邊界
export function useErrorBoundary(componentName?: string) {
  const handleError = (error: Error, errorInfo?: ErrorInfo) => {
    errorHandlerService.handleError(error, {
      category: 'ui',
      severity: 'critical',
      componentName,
      context: {
        type: 'errorBoundary',
        errorInfo,
        componentStack: errorInfo?.componentStack,
      },
    });
  };

  return { handleError };
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  errorContent: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    maxWidth: 400,
    width: '100%',
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#dc3545',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  stackContainer: {
    width: '100%',
    marginBottom: 20,
  },
  stackTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#495057',
    marginBottom: 8,
  },
  stackText: {
    fontSize: 12,
    color: '#6c757d',
    backgroundColor: '#f8f9fa',
    padding: 8,
    borderRadius: 4,
    fontFamily: 'monospace',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  resetButton: {
    backgroundColor: '#007bff',
  },
  resetButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  reportButton: {
    backgroundColor: '#6c757d',
  },
  reportButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
