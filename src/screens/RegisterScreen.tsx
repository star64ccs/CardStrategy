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
  ScrollView
} from 'react-native';
import { useDispatch } from 'react-redux';
import { login } from '../store/slices/authSlice';
import { authService } from '../services/authService';
import { colors, typography, spacing, borderRadius, shadows } from '../config/theme';

interface RegisterScreenProps {
  onNavigate: (screen: 'Login' | 'Register' | 'Dashboard') => void;
}

const RegisterScreen: React.FC<RegisterScreenProps> = ({ onNavigate }) => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.email || !formData.username || !formData.password || !formData.confirmPassword) {
      Alert.alert('錯誤', '請填寫所有必填欄位');
      return false;
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      Alert.alert('錯誤', '請輸入有效的電子郵件地址');
      return false;
    }

    if (formData.username.length < 3) {
      Alert.alert('錯誤', '用戶名至少需要 3 個字符');
      return false;
    }

    if (formData.password.length < 6) {
      Alert.alert('錯誤', '密碼至少需要 6 個字符');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert('錯誤', '密碼確認不匹配');
      return false;
    }

    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const response = await authService.register({
        email: formData.email,
        username: formData.username,
        password: formData.password
      });

      if (response.success) {
        dispatch(login(response.data));
        Alert.alert('註冊成功', '歡迎加入卡策！', [
          { text: '確定', onPress: () => onNavigate('Dashboard') }
        ]);
      } else {
        Alert.alert('註冊失敗', response.message || '註冊時發生錯誤');
      }
    } catch (error: any) {
      Alert.alert('錯誤', error.message || '註冊時發生錯誤');
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
          <Text style={styles.title}>加入卡策</Text>
          <Text style={styles.subtitle}>開始您的卡牌投資之旅</Text>
        </View>

        {/* 註冊表單 */}
        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>創建帳號</Text>

          {/* 用戶名輸入 */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>用戶名</Text>
            <TextInput
              style={styles.input}
              value={formData.username}
              onChangeText={(value) => updateFormData('username', value)}
              placeholder="請輸入您的用戶名"
              placeholderTextColor={colors.textSecondary}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* 電子郵件輸入 */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>電子郵件</Text>
            <TextInput
              style={styles.input}
              value={formData.email}
              onChangeText={(value) => updateFormData('email', value)}
              placeholder="請輸入您的電子郵件"
              placeholderTextColor={colors.textSecondary}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* 密碼輸入 */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>密碼</Text>
            <TextInput
              style={styles.input}
              value={formData.password}
              onChangeText={(value) => updateFormData('password', value)}
              placeholder="請輸入您的密碼"
              placeholderTextColor={colors.textSecondary}
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          {/* 確認密碼輸入 */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>確認密碼</Text>
            <TextInput
              style={styles.input}
              value={formData.confirmPassword}
              onChangeText={(value) => updateFormData('confirmPassword', value)}
              placeholder="請再次輸入您的密碼"
              placeholderTextColor={colors.textSecondary}
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          {/* 註冊按鈕 */}
          <TouchableOpacity
            style={[styles.registerButton, isLoading && styles.registerButtonDisabled]}
            onPress={handleRegister}
            disabled={isLoading}
          >
            <Text style={styles.registerButtonText}>
              {isLoading ? '註冊中...' : '註冊'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* 登錄連結 */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>已有帳號？</Text>
          <TouchableOpacity onPress={() => onNavigate('Login')}>
            <Text style={styles.loginLink}>立即登錄</Text>
          </TouchableOpacity>
        </View>

        {/* 快速註冊選項 */}
        <View style={styles.quickRegisterContainer}>
          <Text style={styles.quickRegisterTitle}>快速註冊</Text>
          <View style={styles.quickRegisterButtons}>
            <TouchableOpacity
              style={styles.quickRegisterButton}
              onPress={() => {
                setFormData({
                  email: 'demo@cardstrategy.com',
                  username: 'demo_user',
                  password: 'demo123',
                  confirmPassword: 'demo123'
                });
              }}
            >
              <Text style={styles.quickRegisterButtonText}>試用帳號</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 條款和隱私政策 */}
        <View style={styles.termsContainer}>
          <Text style={styles.termsText}>
            註冊即表示您同意我們的{' '}
            <Text style={styles.termsLink}>服務條款</Text>
            {' '}和{' '}
            <Text style={styles.termsLink}>隱私政策</Text>
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.large,
    paddingTop: spacing.xlarge * 2,
    paddingBottom: spacing.xlarge
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xlarge * 2
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.medium,
    ...shadows.lg
  },
  logo: {
    fontSize: 40
  },
  title: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.small
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    textAlign: 'center'
  },
  formContainer: {
    backgroundColor: colors.backgroundPaper,
    borderRadius: borderRadius.large,
    padding: spacing.large,
    marginBottom: spacing.xlarge,
    ...shadows.base
  },
  formTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.textPrimary,
    marginBottom: spacing.large,
    textAlign: 'center'
  },
  inputContainer: {
    marginBottom: spacing.large
  },
  inputLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.textPrimary,
    marginBottom: spacing.small
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.medium,
    paddingHorizontal: spacing.medium,
    paddingVertical: spacing.medium,
    fontSize: typography.fontSize.base,
    color: colors.textPrimary,
    backgroundColor: colors.background
  },
  registerButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.medium,
    paddingVertical: spacing.medium,
    alignItems: 'center',
    marginBottom: spacing.medium,
    ...shadows.sm
  },
  registerButtonDisabled: {
    backgroundColor: colors.textDisabled
  },
  registerButtonText: {
    color: colors.white,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semiBold
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xlarge
  },
  footerText: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.base
  },
  loginLink: {
    color: colors.accent,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    marginLeft: spacing.small
  },
  quickRegisterContainer: {
    alignItems: 'center',
    marginBottom: spacing.large
  },
  quickRegisterTitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.medium
  },
  quickRegisterButtons: {
    flexDirection: 'row',
    gap: spacing.medium
  },
  quickRegisterButton: {
    backgroundColor: colors.secondary,
    borderRadius: borderRadius.medium,
    paddingHorizontal: spacing.large,
    paddingVertical: spacing.small
  },
  quickRegisterButtonText: {
    color: colors.white,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium
  },
  termsContainer: {
    alignItems: 'center'
  },
  termsText: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18
  },
  termsLink: {
    color: colors.accent,
    textDecorationLine: 'underline'
  }
});

export default RegisterScreen;
