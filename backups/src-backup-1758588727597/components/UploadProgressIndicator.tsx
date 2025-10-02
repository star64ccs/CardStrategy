import React, { useState, useEffect } from 'react';
import './UploadProgressIndicator.css';

interface UploadProgressProps {
  progress: number;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  filename?: string;
  error?: string;
  onRetry?: () => void;
  onCancel?: () => void;
}

const UploadProgressIndicator: React.FC<UploadProgressProps> = ({
  progress,
  status,
  filename,
  error,
  onRetry,
  onCancel
}) => {
  const [displayProgress, setDisplayProgress] = useState(0);

  useEffect(() => {
    // 平滑的進度條動畫
    const interval = setInterval(() => {
      setDisplayProgress(prev => {
        const diff = progress - prev;
        if (Math.abs(diff) < 0.1) {
          clearInterval(interval);
          return progress;
        }
        return prev + diff * 0.1;
      });
    }, 16);

    return () => clearInterval(interval);
  }, [progress]);

  const getStatusIcon = () => {
    switch (status) {
      case 'uploading':
        return '⏳';
      case 'processing':
        return '🔄';
      case 'completed':
        return '✅';
      case 'error':
        return '❌';
      default:
        return '📁';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'uploading':
        return '上傳中...';
      case 'processing':
        return '處理中...';
      case 'completed':
        return '上傳完成';
      case 'error':
        return '上傳失敗';
      default:
        return '準備中...';
    }
  };

  const getProgressBarColor = () => {
    switch (status) {
      case 'uploading':
      case 'processing':
        return '#3b82f6';
      case 'completed':
        return '#10b981';
      case 'error':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  return (
    <div className="upload-progress-container">
      <div className="upload-progress-header">
        <span className="upload-progress-icon">{getStatusIcon()}</span>
        <div className="upload-progress-info">
          <span className="upload-progress-status">{getStatusText()}</span>
          {filename && (
            <span className="upload-progress-filename">{filename}</span>
          )}
        </div>
        {status === 'uploading' && onCancel && (
          <button 
            className="upload-progress-cancel"
            onClick={onCancel}
            type="button"
          >
            ✕
          </button>
        )}
      </div>

      <div className="upload-progress-bar">
        <div 
          className="upload-progress-fill"
          style={{
            width: `${displayProgress}%`,
            backgroundColor: getProgressBarColor()
          }}
        />
      </div>

      <div className="upload-progress-percentage">
        {Math.round(displayProgress)}%
      </div>

      {error && (
        <div className="upload-progress-error">
          <p>{error}</p>
          {onRetry && (
            <button 
              className="upload-progress-retry"
              onClick={onRetry}
              type="button"
            >
              重試
            </button>
          )}
        </div>
      )}

      {status === 'processing' && (
        <div className="upload-progress-steps">
          <div className="upload-step active">
            <span>壓縮圖片</span>
          </div>
          <div className="upload-step">
            <span>生成縮略圖</span>
          </div>
          <div className="upload-step">
            <span>保存到數據庫</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadProgressIndicator;
