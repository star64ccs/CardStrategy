import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/apiService';

interface ApiStatusProps {
  onStatusChange?: (isOnline: boolean) => void;
}

const ApiStatus: React.FC<ApiStatusProps> = ({ onStatusChange }) => {
  const [isOnline, setIsOnline] = useState<boolean | null>(null);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    checkApiStatus();
    // 每30秒檢查一次 API 狀態
    const interval = setInterval(checkApiStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isOnline !== null) {
      onStatusChange?.(isOnline);
    }
  }, [isOnline, onStatusChange]);

  const checkApiStatus = async () => {
    setChecking(true);
    try {
      const isHealthy = await apiService.checkHealth();
      setIsOnline(isHealthy);
      setLastCheck(new Date());
    } catch (error) {
      setIsOnline(false);
      setLastCheck(new Date());
    } finally {
      setChecking(false);
    }
  };

  const getStatusColor = () => {
    if (isOnline === null) return '#7f8c8d';
    return isOnline ? '#27ae60' : '#e74c3c';
  };

  const getStatusText = () => {
    if (isOnline === null) return '檢查中...';
    return isOnline ? 'API 在線' : 'API 離線';
  };

  const getStatusIcon = () => {
    if (checking) return '🔄';
    if (isOnline === null) return '⏳';
    return isOnline ? '🟢' : '🔴';
  };

  return (
    <div style={styles.container}>
      <div style={styles.statusIndicator}>
        <span style={styles.icon}>{getStatusIcon()}</span>
        <span style={{
          ...styles.statusText,
          color: getStatusColor()
        }}>
          {getStatusText()}
        </span>
      </div>

      {lastCheck && (
        <div style={styles.lastCheck}>
          最後檢查: {lastCheck.toLocaleTimeString()}
        </div>
      )}

      {!isOnline && (
        <div style={styles.warning}>
          <span style={styles.warningIcon}>⚠️</span>
          <span style={styles.warningText}>
            使用模擬數據，部分功能可能受限
          </span>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '8px',
    padding: '12px',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    border: '1px solid #ecf0f1',
    fontSize: '12px'
  },
  statusIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  icon: {
    fontSize: '14px'
  },
  statusText: {
    fontWeight: 'bold'
  },
  lastCheck: {
    fontSize: '10px',
    color: '#7f8c8d'
  },
  warning: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 8px',
    backgroundColor: '#fff3cd',
    borderRadius: '4px',
    border: '1px solid #ffeaa7'
  },
  warningIcon: {
    fontSize: '12px'
  },
  warningText: {
    fontSize: '10px',
    color: '#856404'
  }
};

export default ApiStatus;
