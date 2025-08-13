import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { theme } from '@/config/theme';
import { login } from '@/store/slices/authSlice';

export const LoginScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email) {
      newErrors.email = '請輸入電子郵件';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = '請輸入有效的電子郵件';
    }

    if (!password) {
      newErrors.password = '請輸入密碼';
    } else if (password.length < 6) {
      newErrors.password = '密碼至少需要 6 個字符';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await dispatch(login({ email, password }) as any);
    } catch (error: any) {
      Alert.alert('登入失敗', error.message || '請檢查您的帳號密碼');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = () => {
    navigation.navigate('Register' as never);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.content}>
          {/* Logo and Title */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Text style={styles.logo}>🎮</Text>
            </View>
            <Text style={styles.title}>卡策</Text>
            <Text style={styles.subtitle}>智選卡牌，策略致勝</Text>
          </View>

          {/* Login Form */}
          <Card variant="elevated" padding="large" style={styles.formCard}>
            <Text style={styles.formTitle}>登入帳號</Text>

            <Input
              label="電子郵件"
              placeholder="請輸入您的電子郵件"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              leftIcon="mail"
              error={errors.email}
            />

            <Input
              label="密碼"
              placeholder="請輸入您的密碼"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              leftIcon="lock-closed"
              error={errors.password}
            />

            <Button
              title="登入"
              onPress={handleLogin}
              loading={isLoading}
              fullWidth
              style={styles.loginButton}
            />

            <TouchableOpacity
              style={styles.forgotPassword}
              onPress={() => Alert.alert('功能開發中', '密碼重置功能即將推出')}
            >
              <Text style={styles.forgotPasswordText}>忘記密碼？</Text>
            </TouchableOpacity>
          </Card>

          {/* Register Link */}
          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>還沒有帳號？</Text>
            <TouchableOpacity onPress={handleRegister}>
              <Text style={styles.registerLink}>立即註冊</Text>
            </TouchableOpacity>
          </View>

          {/* Social Login */}
          <View style={styles.socialContainer}>
            <Text style={styles.socialText}>或使用以下方式登入</Text>
            <View style={styles.socialButtons}>
              <Button
                title="Google"
                variant="outline"
                onPress={() => Alert.alert('功能開發中', 'Google 登入功能即將推出')}
                style={styles.socialButton}
              />
              <Button
                title="Apple"
                variant="outline"
                onPress={() => Alert.alert('功能開發中', 'Apple 登入功能即將推出')}
                style={styles.socialButton}
              />
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.backgroundLight
  },
  keyboardAvoidingView: {
    flex: 1
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.large,
    justifyContent: 'center'
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xlarge
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.medium
  },
  logo: {
    fontSize: 40
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xsmall
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center'
  },
  formCard: {
    marginBottom: theme.spacing.large
  },
  formTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.large,
    textAlign: 'center'
  },
  loginButton: {
    marginTop: theme.spacing.medium
  },
  forgotPassword: {
    alignItems: 'center',
    marginTop: theme.spacing.medium
  },
  forgotPasswordText: {
    color: theme.colors.primary[500],
    fontSize: 14
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.large
  },
  registerText: {
    color: theme.colors.textSecondary,
    fontSize: 14
  },
  registerLink: {
    color: theme.colors.primary[500],
    fontSize: 14,
    fontWeight: '600',
    marginLeft: theme.spacing.xsmall
  },
  socialContainer: {
    alignItems: 'center'
  },
  socialText: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    marginBottom: theme.spacing.medium
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%'
  },
  socialButton: {
    flex: 1,
    marginHorizontal: theme.spacing.xsmall
  }
});
