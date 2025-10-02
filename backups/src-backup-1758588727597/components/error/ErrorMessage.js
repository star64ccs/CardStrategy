import React, { useState, useEffect } from 'react';

const ErrorMessage = ({ 
  message, 
  type = 'error', 
  duration = 5000, 
  onClose,
  showRetry = false,
  onRetry,
  className 
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        if (onClose) onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    if (onClose) onClose();
  };

  const handleRetry = () => {
    if (onRetry) onRetry();
  };

  if (!isVisible) return null;

  const getIcon = () => {
    switch (type) {
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      case 'success': return '✅';
      default: return '❌';
    }
  };

  const getColor = () => {
    switch (type) {
      case 'error': return '#dc3545';
      case 'warning': return '#ffc107';
      case 'info': return '#17a2b8';
      case 'success': return '#28a745';
      default: return '#dc3545';
    }
  };

  return (
    <div 
      className={`error-message ${className || ''}`}
      style={{
        padding: '12px 16px',
        backgroundColor: `${getColor()}15`,
        border: `1px solid ${getColor()}30`,
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '16px',
        animation: 'slideIn 0.3s ease-out'
      }}
    >
      <span style={{ fontSize: '18px' }}>{getIcon()}</span>
      <div style={{ flex: 1 }}>
        <p style={{ margin: 0, color: getColor(), fontWeight: '500' }}>
          {message}
        </p>
      </div>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        {showRetry && (
          <button 
            onClick={handleRetry}
            style={{
              background: 'none',
              border: 'none',
              color: getColor(),
              cursor: 'pointer',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '12px'
            }}
          >
            重試
          </button>
        )}
        <button 
          onClick={handleClose}
          style={{
            background: 'none',
            border: 'none',
            color: getColor(),
            cursor: 'pointer',
            padding: '4px',
            borderRadius: '4px'
          }}
        >
          ✕
        </button>
      </div>
    </div>
  );
};

const ErrorToast = ({ message, type = 'error', duration = 3000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onClose) onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!isVisible) return null;

  return (
    <div 
      className="error-toast"
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 9999,
        animation: 'slideInRight 0.3s ease-out'
      }}
    >
      <ErrorMessage message={message} type={type} onClose={onClose} showRetry={false} />
    </div>
  );
};

// CSS動畫
const errorStyles = `
@keyframes slideIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slideInRight {
  from { opacity: 0; transform: translateX(100%); }
  to { opacity: 1; transform: translateX(0); }
}

.error-boundary {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  padding: 20px;
}

.error-content {
  text-align: center;
  max-width: 500px;
}

.error-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 20px;
}

.error-details {
  margin-top: 20px;
  text-align: left;
  background: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
}

.error-details pre {
  font-size: 12px;
  color: #666;
  white-space: pre-wrap;
  word-break: break-word;
}
`;

export { ErrorMessage, ErrorToast, ErrorBoundary, errorStyles };