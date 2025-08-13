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
import { register } from '@/store/slices/authSlice';

export const RegisterScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name) {
      newErrors['name'] = '請輸入姓名';
    }

    if (!formData.email) {
      newErrors['email'] = '請輸入電子郵件';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors['email'] = '請輸入有效的電子郵件';
    }

    if (!formData.password) {
      newErrors['password'] = '請輸入密碼';
    } else if (formData.password.length < 6) {
      newErrors['password'] = '密碼至少需要 6 個字符';
    }

    if (!formData.confirmPassword) {
      newErrors['confirmPassword'] = '請確認密碼';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors['confirmPassword'] = '密碼不一致';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      // 轉換為註冊所需的格式
      const registerData = {
        username: formData.name,
        email: formData.email,
        password: formData.password,
        acceptTerms: true
      };
      await dispatch(register({ ...registerData, confirmPassword: registerData.password }) as any);
    } catch (error: any) {
      Alert.alert('註冊失敗', error.message || '請檢查您的輸入');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = () => {
    navigation.navigate('Login' as never);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Text style={styles.logo}>🎮</Text>
            </View>
            <Text style={styles.title}>卡策</Text>
            <Text style={styles.subtitle}>智選卡牌，策略致勝</Text>
          </View>

          {/* Register Form */}
          <Card variant="elevated" padding="large" style={styles.formCard}>
            <Text style={styles.formTitle}>註冊帳號</Text>

            <Input
              label="姓名"
              placeholder="請輸入您的姓名"
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              leftIcon="person"
              error={errors['name']}
            />

            <Input
              label="電子郵件"
              placeholder="請輸入您的電子郵件"
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              leftIcon="mail"
              error={errors['email']}
            />

            <Input
              label="密碼"
              placeholder="請輸入您的密碼"
              value={formData.password}
              onChangeText={(text) => setFormData({ ...formData, password: text })}
              secureTextEntry
              leftIcon="lock-closed"
              error={errors['password']}
            />

            <Input
              label="確認密碼"
              placeholder="請再次輸入密碼"
              value={formData.confirmPassword}
              onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
              secureTextEntry
              leftIcon="lock-closed"
              error={errors['confirmPassword']}
            />

            <Button
              title="註冊"
              onPress={handleRegister}
              loading={isLoading}
              fullWidth
              style={styles.registerButton}
            />
          </Card>

          {/* Login Link */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>已有帳號？</Text>
            <TouchableOpacity onPress={handleLogin}>
              <Text style={styles.loginLink}>立即登入</Text>
            </TouchableOpacity>
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
  registerButton: {
    marginTop: theme.spacing.medium
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
  loginText: {
    color: theme.colors.textSecondary,
    fontSize: 14
  },
  loginLink: {
    color: theme.colors.primary[500],
    fontSize: 14,
    fontWeight: '600',
    marginLeft: theme.spacing.xsmall
  }
});
