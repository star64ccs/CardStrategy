import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  registerUser,
  selectIsLoading,
  selectError,
} from '../../store/slices/authSlice';
import { logger } from '../../utils/logger';

interface WebRegisterScreenProps {
  onNavigate: (screen: string) => void;
}

const WebRegisterScreen: React.FC<WebRegisterScreenProps> = ({
  onNavigate,
}) => {
  const dispatch = useDispatch();
  const isLoading = useSelector(selectIsLoading);
  const error = useSelector(selectError);

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateForm = () => {
    if (
      !username.trim() ||
      !email.trim() ||
      !password.trim() ||
      !confirmPassword.trim() ||
      !displayName.trim()
    ) {
      logger.warn('註冊失敗：請填寫所有必填欄位');
      return false;
    }

    if (username.length < 3) {
      logger.warn('註冊失敗：用戶名至少需要3個字符');
      return false;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      logger.warn('註冊失敗：用戶名只能包含字母、數字和下劃線');
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      logger.warn('註冊失敗：請輸入有效的郵箱地址');
      return false;
    }

    if (password.length < 6) {
      logger.warn('註冊失敗：密碼至少需要6個字符');
      return false;
    }

    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      logger.warn('註冊失敗：密碼必須包含大小寫字母和數字');
      return false;
    }

    if (password !== confirmPassword) {
      logger.warn('註冊失敗：密碼確認不匹配');
      return false;
    }

    if (displayName.length < 2) {
      logger.warn('註冊失敗：顯示名稱至少需要2個字符');
      return false;
    }

    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      await dispatch(
        registerUser({
          username,
          email,
          password,
          displayName,
        })
      ).unwrap();

      logger.info('註冊成功！歡迎加入卡策！');
      onNavigate('Login');
    } catch (error: any) {
      logger.error(`註冊失敗: ${error || '請檢查您的輸入信息'}`);
    }
  };

  const handleLogin = () => {
    onNavigate('Login');
  };

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <div style={styles.header}>
          <h1 style={styles.title}>創建帳戶</h1>
          <p style={styles.subtitle}>加入卡策，開始您的卡牌投資之旅</p>
        </div>

        <div style={styles.form}>
          <div style={styles.inputContainer}>
            <label style={styles.label}>用戶名 *</label>
            <input
              style={styles.input}
              type='text'
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder='輸入用戶名（3-30字符）'
              autoComplete='username'
            />
            <p style={styles.hint}>只能包含字母、數字和下劃線</p>
          </div>

          <div style={styles.inputContainer}>
            <label style={styles.label}>郵箱 *</label>
            <input
              style={styles.input}
              type='email'
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder='輸入郵箱地址'
              autoComplete='email'
            />
          </div>

          <div style={styles.inputContainer}>
            <label style={styles.label}>顯示名稱 *</label>
            <input
              style={styles.input}
              type='text'
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              placeholder='輸入顯示名稱（2-50字符）'
              autoComplete='name'
            />
          </div>

          <div style={styles.inputContainer}>
            <label style={styles.label}>密碼 *</label>
            <div style={styles.passwordContainer}>
              <input
                style={styles.passwordInput}
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder='輸入密碼（至少6字符）'
                autoComplete='new-password'
              />
              <button
                style={styles.eyeButton}
                onClick={() => setShowPassword(!showPassword)}
                type='button'
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            <p style={styles.hint}>必須包含大小寫字母和數字</p>
          </div>

          <div style={styles.inputContainer}>
            <label style={styles.label}>確認密碼 *</label>
            <div style={styles.passwordContainer}>
              <input
                style={styles.passwordInput}
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder='再次輸入密碼'
                autoComplete='new-password'
              />
              <button
                style={styles.eyeButton}
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                type='button'
              >
                {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          <button
            style={[styles.registerButton, isLoading && styles.disabledButton]}
            onClick={handleRegister}
            disabled={isLoading}
          >
            {isLoading ? '註冊中...' : '創建帳戶'}
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
            style={styles.loginButton}
            onClick={handleLogin}
            type='button'
          >
            已有帳戶？登錄
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
    padding: '20px',
  },
  content: {
    width: '100%',
    maxWidth: '400px',
  },
  header: {
    textAlign: 'center' as const,
    marginBottom: '40px',
  },
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: '8px',
    margin: '0 0 8px 0',
  },
  subtitle: {
    fontSize: '16px',
    color: '#7f8c8d',
    margin: '0',
  },
  form: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  },
  inputContainer: {
    marginBottom: '20px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: '8px',
    display: 'block',
  },
  input: {
    width: '100%',
    border: '1px solid #e1e8ed',
    borderRadius: '8px',
    padding: '12px',
    fontSize: '16px',
    backgroundColor: '#ffffff',
    boxSizing: 'border-box' as const,
  },
  passwordContainer: {
    position: 'relative' as const,
  },
  passwordInput: {
    width: '100%',
    border: '1px solid #e1e8ed',
    borderRadius: '8px',
    padding: '12px 50px 12px 12px',
    fontSize: '16px',
    backgroundColor: '#ffffff',
    boxSizing: 'border-box' as const,
  },
  eyeButton: {
    position: 'absolute' as const,
    right: '12px',
    top: '12px',
    background: 'none',
    border: 'none',
    fontSize: '20px',
    cursor: 'pointer',
    padding: '4px',
  },
  hint: {
    fontSize: '12px',
    color: '#7f8c8d',
    marginTop: '4px',
    margin: '4px 0 0 0',
  },
  registerButton: {
    width: '100%',
    backgroundColor: '#27ae60',
    borderRadius: '8px',
    padding: '16px',
    border: 'none',
    color: '#ffffff',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    marginBottom: '16px',
  },
  disabledButton: {
    backgroundColor: '#bdc3c7',
    cursor: 'not-allowed',
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    borderRadius: '8px',
    padding: '12px',
    marginBottom: '16px',
  },
  errorText: {
    color: '#c62828',
    fontSize: '14px',
    textAlign: 'center' as const,
    margin: '0',
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    margin: '20px 0',
  },
  dividerLine: {
    flex: 1,
    height: '1px',
    backgroundColor: '#e1e8ed',
  },
  dividerText: {
    margin: '0 16px',
    color: '#7f8c8d',
    fontSize: '14px',
  },
  loginButton: {
    width: '100%',
    border: '1px solid #3498db',
    borderRadius: '8px',
    padding: '16px',
    backgroundColor: 'transparent',
    color: '#3498db',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
  },
};

export default WebRegisterScreen;
