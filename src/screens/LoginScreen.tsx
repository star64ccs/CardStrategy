import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from 'react-native';
import { useDispatch } from 'react-redux';

import { loginUser } from '../store/slices/authSlice';
import {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
} from '../config/theme';

// 臨時實現
const _authService = {
  login: async (credentials: { email: string; password: string }) => {
    return {
      success: true,
      data: {
        user: { id: '1', email: credentials.email },
        token: 'mock-token',
      },
      message: '登錄成功',
    };
  },
};

interface LoginScreenProps {
  onNavigate: (screen: 'Login' | 'Register' | 'Dashboard') => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onNavigate }) => {
  const _dispatch = useDispatch();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const _handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('錯誤', '請填寫所有必填欄位');
      return;
    }

    setIsLoading(true);
    try {
      const _response = await authService.login({ email, password });

      if (response.success) {
        dispatch(loginUser({ email, password }) as any);
        onNavigate('Dashboard');
      } else {
        Alert.alert('登錄失敗', response.message || '請檢查您的帳號密碼');
      }
    } catch (error: unknown) {
      Alert.alert('錯誤', error.message || '登錄時發生錯誤');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Logo 和標題 */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Text style={styles.logo}>🎴</Text>
          </View>
          <Text style={styles.title}>卡策</Text>
          <Text style={styles.subtitle}>智選卡牌，策略致勝</Text>
        </View>

        {/* 登錄表單 */}
        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>歡迎回來</Text>

          {/* 電子郵件輸入 */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>電子郵件</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder='請輸入您的電子郵件'
              placeholderTextColor={colors.textSecondary}
              keyboardType='email-address'
              autoCapitalize='none'
              autoCorrect={false}
            />
          </View>

          {/* 密碼輸入 */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>密碼</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder='請輸入您的密碼'
              placeholderTextColor={colors.textSecondary}
              secureTextEntry
              autoCapitalize='none'
              autoCorrect={false}
            />
          </View>

          {/* 登錄按鈕 */}
          <TouchableOpacity
            style={[
              styles.loginButton,
              isLoading && styles.loginButtonDisabled,
            ]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            <Text style={styles.loginButtonText}>
              {isLoading ? '登錄中...' : '登錄'}
            </Text>
          </TouchableOpacity>

          {/* 註冊連結 */}
          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>還沒有帳號？</Text>
            <TouchableOpacity onPress={() => onNavigate('Register')}>
              <Text style={styles.registerLink}>立即註冊</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const _styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.large,
    paddingTop: spacing.xlarge * 2,
    paddingBottom: spacing.xlarge,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xlarge * 2,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.medium,
    ...shadows.lg,
  },
  logo: {
    fontSize: 40,
  },
  title: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: 'bold' as any,
    color: colors.textPrimary,
    marginBottom: spacing.small,
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  formContainer: {
    backgroundColor: colors.backgroundPaper,
    borderRadius: borderRadius.large,
    padding: spacing.large,
    marginBottom: spacing.xlarge,
    ...shadows.base,
  },
  formTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: '600' as any,
    color: colors.textPrimary,
    marginBottom: spacing.large,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: spacing.large,
  },
  inputLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: '500' as any,
    color: colors.textPrimary,
    marginBottom: spacing.small,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.medium,
    paddingHorizontal: spacing.medium,
    paddingVertical: spacing.medium,
    fontSize: typography.fontSize.base,
    color: colors.textPrimary,
    backgroundColor: colors.background,
  },
  loginButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.medium,
    paddingVertical: spacing.medium,
    alignItems: 'center',
    marginBottom: spacing.medium,
    ...shadows.sm,
  },
  loginButtonDisabled: {
    backgroundColor: colors.textDisabled,
  },
  loginButtonText: {
    color: colors.white,
    fontSize: typography.fontSize.base,
    fontWeight: '600' as any,
  },
  forgotPassword: {
    alignItems: 'center',
  },
  forgotPasswordText: {
    color: colors.accent,
    fontSize: typography.fontSize.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xlarge,
  },
  footerText: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.base,
  },
  registerLink: {
    color: colors.accent,
    fontSize: typography.fontSize.base,
    fontWeight: '500' as any,
    marginLeft: spacing.small,
  },
  quickLoginContainer: {
    alignItems: 'center',
  },
  quickLoginTitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.medium,
  },
  quickLoginButtons: {
    flexDirection: 'row',
    gap: spacing.medium,
  },
  quickLoginButton: {
    backgroundColor: colors.secondary,
    borderRadius: borderRadius.medium,
    paddingHorizontal: spacing.large,
    paddingVertical: spacing.small,
  },
  quickLoginButtonText: {
    color: colors.white,
    fontSize: typography.fontSize.sm,
    fontWeight: '500' as any,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.medium,
  },
  registerText: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.base,
  },
});

export default LoginScreen;
