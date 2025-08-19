import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, selectIsLoading, selectError } from '../../store/slices/authSlice';
import { logger } from '../../utils/logger';

interface WebLoginScreenProps {
  onNavigate: (screen: string) => void;
}

const WebLoginScreen: React.FC<WebLoginScreenProps> = ({ onNavigate }) => {
  const dispatch = useDispatch();
  const isLoading = useSelector(selectIsLoading);
  const error = useSelector(selectError);

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!identifier.trim() || !password.trim()) {
      logger.warn('登錄失敗：請填寫所有必填欄位');
      return;
    }

    try {
      await dispatch(loginUser({ identifier, password })).unwrap();
      // 登錄成功後導航到主頁面
      onNavigate('Dashboard');
    } catch (error: any) {
      logger.error(`登錄失敗: ${error || '請檢查您的用戶名和密碼'}`);
    }
  };

  const handleRegister = () => {
    onNavigate('Register');
  };

  const handleForgotPassword = () => {
    logger.info('忘記密碼功能即將推出');
  };

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <div style={styles.header}>
          <h1 style={styles.title}>歡迎回來</h1>
          <p style={styles.subtitle}>登錄您的卡策帳戶</p>
        </div>

        <div style={styles.form}>
          <div style={styles.inputContainer}>
            <label style={styles.label}>用戶名或郵箱</label>
            <input
              style={styles.input}
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="輸入用戶名或郵箱"
              autoComplete="username"
            />
          </div>

          <div style={styles.inputContainer}>
            <label style={styles.label}>密碼</label>
            <div style={styles.passwordContainer}>
              <input
                style={styles.passwordInput}
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="輸入密碼"
                autoComplete="current-password"
              />
              <button
                style={styles.eyeButton}
                onClick={() => setShowPassword(!showPassword)}
                type="button"
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          <button
            style={styles.forgotPassword}
            onClick={handleForgotPassword}
            type="button"
          >
            忘記密碼？
          </button>

          <button
            style={[styles.loginButton, isLoading && styles.disabledButton]}
            onClick={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? '登錄中...' : '登錄'}
          </button>

          {error && (
            <div style={styles.errorContainer}>
              <p style={styles.errorText}>{error}</p>
            </div>
          )}

          <div style={styles.divider}>
            <div style={styles.dividerLine} />
            <span style={styles.dividerText}>或</span>
            <div style={styles.dividerLine} />
          </div>

          <button
            style={styles.registerButton}
            onClick={handleRegister}
            type="button"
          >
            創建新帳戶
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f8f9fa',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px'
  },
  content: {
    width: '100%',
    maxWidth: '400px'
  },
  header: {
    textAlign: 'center' as const,
    marginBottom: '40px'
  },
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: '8px',
    margin: '0 0 8px 0'
  },
  subtitle: {
    fontSize: '16px',
    color: '#7f8c8d',
    margin: '0'
  },
  form: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
  },
  inputContainer: {
    marginBottom: '20px'
  },
  label: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: '8px',
    display: 'block'
  },
  input: {
    width: '100%',
    border: '1px solid #e1e8ed',
    borderRadius: '8px',
    padding: '12px',
    fontSize: '16px',
    backgroundColor: '#ffffff',
    boxSizing: 'border-box' as const
  },
  passwordContainer: {
    position: 'relative' as const
  },
  passwordInput: {
    width: '100%',
    border: '1px solid #e1e8ed',
    borderRadius: '8px',
    padding: '12px 50px 12px 12px',
    fontSize: '16px',
    backgroundColor: '#ffffff',
    boxSizing: 'border-box' as const
  },
  eyeButton: {
    position: 'absolute' as const,
    right: '12px',
    top: '12px',
    background: 'none',
    border: 'none',
    fontSize: '20px',
    cursor: 'pointer',
    padding: '4px'
  },
  forgotPassword: {
    background: 'none',
    border: 'none',
    color: '#3498db',
    fontSize: '14px',
    cursor: 'pointer',
    alignSelf: 'flex-end' as const,
    marginBottom: '24px',
    display: 'block',
    marginLeft: 'auto'
  },
  loginButton: {
    width: '100%',
    backgroundColor: '#3498db',
    borderRadius: '8px',
    padding: '16px',
    border: 'none',
    color: '#ffffff',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    marginBottom: '16px'
  },
  disabledButton: {
    backgroundColor: '#bdc3c7',
    cursor: 'not-allowed'
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    borderRadius: '8px',
    padding: '12px',
    marginBottom: '16px'
  },
  errorText: {
    color: '#c62828',
    fontSize: '14px',
    textAlign: 'center' as const,
    margin: '0'
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    margin: '20px 0'
  },
  dividerLine: {
    flex: 1,
    height: '1px',
    backgroundColor: '#e1e8ed'
  },
  dividerText: {
    margin: '0 16px',
    color: '#7f8c8d',
    fontSize: '14px'
  },
  registerButton: {
    width: '100%',
    border: '1px solid #3498db',
    borderRadius: '8px',
    padding: '16px',
    backgroundColor: 'transparent',
    color: '#3498db',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer'
  }
};

export default WebLoginScreen;
