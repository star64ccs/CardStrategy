import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme/designSystem';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Card } from '../../components/common/Card';

interface LoginScreenProps {
  navigation: any;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {}
  );

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email) {
      newErrors.email = '請輸入電子郵件';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = '請輸入有效的電子郵件地址';
    }

    if (!password) {
      newErrors.password = '請輸入密碼';
    } else if (password.length < 6) {
      newErrors.password = '密碼至少需要6個字符';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // 這裡會調用實際的登入 API
      // logger.info('登入:', { email, password });

      // 模擬 API 調用
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // 登入成功後導航到主畫面
      navigation.replace('Main');
    } catch (error) {
      Alert.alert('登入失敗', '請檢查您的電子郵件和密碼');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    navigation.navigate('ForgotPassword');
  };

  const handleSignUp = () => {
    navigation.navigate('Register');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Logo 和標題區域 */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <View style={styles.logoIcon}>
                <Ionicons
                  name="trending-up"
                  size={32}
                  color={theme.colors.gold.primary}
                />
              </View>
              <Text style={styles.logoText}>卡策</Text>
            </View>
            <Text style={styles.subtitle}>CardStrategy</Text>
            <Text style={styles.description}>智能卡牌投資與收藏管理平台</Text>
          </View>

          {/* 登入表單 */}
          <Card style={styles.formCard} variant="elevated">
            <Text style={styles.formTitle}>登入您的帳戶</Text>

            <Input
              label="電子郵件"
              placeholder="請輸入您的電子郵件"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              leftIcon="mail-outline"
              error={errors.email}
            />

            <Input
              label="密碼"
              placeholder="請輸入您的密碼"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              leftIcon="lock-closed-outline"
              error={errors.password}
            />

            <TouchableOpacity
              style={styles.forgotPassword}
              onPress={handleForgotPassword}
            >
              <Text style={styles.forgotPasswordText}>忘記密碼？</Text>
            </TouchableOpacity>

            <Button
              title={loading ? '登入中...' : '登入'}
              onPress={handleLogin}
              loading={loading}
              style={styles.loginButton}
            />
          </Card>

          {/* 註冊連結 */}
          <View style={styles.signUpContainer}>
            <Text style={styles.signUpText}>還沒有帳戶？</Text>
            <TouchableOpacity onPress={handleSignUp}>
              <Text style={styles.signUpLink}>立即註冊</Text>
            </TouchableOpacity>
          </View>

          {/* 快速登入選項 */}
          <Card style={styles.quickLoginCard} variant="outlined">
            <Text style={styles.quickLoginTitle}>快速登入</Text>
            <View style={styles.socialButtons}>
              <Button
                title="Google"
                onPress={() => {
                  /* logger.info('Google 登入') */
                }}
                variant="secondary"
                style={styles.socialButton}
                icon={
                  <Ionicons
                    name="logo-google"
                    size={20}
                    color={theme.colors.gold.primary}
                  />
                }
              />
              <Button
                title="Apple"
                onPress={() => {
                  /* logger.info('Apple 登入') */
                }}
                variant="secondary"
                style={styles.socialButton}
                icon={
                  <Ionicons
                    name="logo-apple"
                    size={20}
                    color={theme.colors.gold.primary}
                  />
                }
              />
            </View>
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: theme.spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
    marginTop: theme.spacing.xl,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  logoIcon: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.background.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.sm,
    borderWidth: 2,
    borderColor: theme.colors.gold.primary,
  },
  logoText: {
    fontSize: theme.typography.sizes['3xl'],
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.gold.primary,
  },
  subtitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  description: {
    fontSize: theme.typography.sizes.base,
    color: theme.colors.text.tertiary,
    textAlign: 'center',
  },
  formCard: {
    marginBottom: theme.spacing.lg,
  },
  formTitle: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: theme.spacing.lg,
  },
  forgotPasswordText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.gold.primary,
    fontWeight: theme.typography.weights.medium,
  },
  loginButton: {
    marginBottom: theme.spacing.md,
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  signUpText: {
    fontSize: theme.typography.sizes.base,
    color: theme.colors.text.secondary,
    marginRight: theme.spacing.xs,
  },
  signUpLink: {
    fontSize: theme.typography.sizes.base,
    color: theme.colors.gold.primary,
    fontWeight: theme.typography.weights.semibold,
  },
  quickLoginCard: {
    marginBottom: theme.spacing.lg,
  },
  quickLoginTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  socialButton: {
    flex: 1,
    marginHorizontal: theme.spacing.xs,
  },
});
