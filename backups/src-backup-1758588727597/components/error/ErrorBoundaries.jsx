// 錯誤邊界組件
import React, { Component } from 'react';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="error-content">
            <h2>哎呀！出現了一些問題</h2>
            <p>我們正在努力修復這個問題。請稍後再試。</p>
            <button onClick={this.handleRetry} className="retry-button">
              重試
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
