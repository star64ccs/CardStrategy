import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useFormValidation } from '../../utils/useFormValidation';
import { LoginRequestSchema } from '../../utils/validationSchemas';
import { theme } from '../../config/theme';

// 登錄表單組件示例
export const ValidatedLoginForm: React.FC = () => {
  const {
    values,
    errors,
    touched,
    isValid,
    isSubmitting,
    handleChange,
    handleBlur,
    submit,
    getFieldError,
    shouldShowFieldError
  } = useFormValidation(LoginRequestSchema, {
    initialValues: {
      email: '',
      password: '',
      rememberMe: false
    },
    onSubmit: async (validatedData) => {
      try {
        // 這裡會調用實際的登錄 API
        console.log('提交驗證後的數據:', validatedData);
        Alert.alert('成功', '登錄數據驗證通過！');
      } catch (error) {
        Alert.alert('錯誤', '登錄失敗');
      }
    },
    onValidationError: (errors) => {
      console.log('驗證錯誤:', errors);
      Alert.alert('驗證錯誤', '請檢查輸入的數據');
    }
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>登錄表單（帶驗證）</Text>

      {/* 電子郵件輸入 */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>電子郵件</Text>
        <TextInput
          style={[
            styles.input,
            shouldShowFieldError('email') && styles.inputError
          ]}
          value={values.email}
          onChangeText={handleChange('email')}
          onBlur={handleBlur('email')}
          placeholder="請輸入電子郵件"
          keyboardType="email-address"
          autoCapitalize="none"
        />
        {shouldShowFieldError('email') && (
          <Text style={styles.errorText}>{getFieldError('email')}</Text>
        )}
      </View>

      {/* 密碼輸入 */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>密碼</Text>
        <TextInput
          style={[
            styles.input,
            shouldShowFieldError('password') && styles.inputError
          ]}
          value={values.password}
          onChangeText={handleChange('password')}
          onBlur={handleBlur('password')}
          placeholder="請輸入密碼"
          secureTextEntry
        />
        {shouldShowFieldError('password') && (
          <Text style={styles.errorText}>{getFieldError('password')}</Text>
        )}
      </View>

      {/* 記住我選項 */}
      <View style={styles.checkboxContainer}>
        <TouchableOpacity
          style={[
            styles.checkbox,
            values.rememberMe && styles.checkboxChecked
          ]}
          onPress={() => handleChange('rememberMe')(!values.rememberMe)}
        >
          {values.rememberMe && <Text style={styles.checkmark}>✓</Text>}
        </TouchableOpacity>
        <Text style={styles.checkboxLabel}>記住我</Text>
      </View>

      {/* 提交按鈕 */}
      <TouchableOpacity
        style={[
          styles.submitButton,
          (!isValid || isSubmitting) && styles.submitButtonDisabled
        ]}
        onPress={submit}
        disabled={!isValid || isSubmitting}
      >
        <Text style={styles.submitButtonText}>
          {isSubmitting ? '提交中...' : '登錄'}
        </Text>
      </TouchableOpacity>

      {/* 表單狀態顯示 */}
      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>
          表單有效: {isValid ? '是' : '否'}
        </Text>
        <Text style={styles.statusText}>
          已觸摸字段: {Object.keys(touched).length}
        </Text>
        <Text style={styles.statusText}>
          錯誤數量: {Object.keys(errors).length}
        </Text>
      </View>
    </View>
  );
};

// 註冊表單組件示例
export const ValidatedRegisterForm: React.FC = () => {
  const {
    values,
    errors,
    touched,
    isValid,
    isSubmitting,
    handleChange,
    handleBlur,
    submit,
    getFieldError,
    shouldShowFieldError
  } = useFormValidation(LoginRequestSchema, {
    initialValues: {
      email: '',
      password: '',
      confirmPassword: '',
      username: '',
      firstName: '',
      lastName: '',
      acceptTerms: false
    },
    onSubmit: async (validatedData) => {
      try {
        console.log('提交驗證後的數據:', validatedData);
        Alert.alert('成功', '註冊數據驗證通過！');
      } catch (error) {
        Alert.alert('錯誤', '註冊失敗');
      }
    },
    onValidationError: (errors) => {
      console.log('驗證錯誤:', errors);
      Alert.alert('驗證錯誤', '請檢查輸入的數據');
    }
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>註冊表單（帶驗證）</Text>

      {/* 用戶名輸入 */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>用戶名</Text>
        <TextInput
          style={[
            styles.input,
            shouldShowFieldError('username') && styles.inputError
          ]}
          value={values.username}
          onChangeText={handleChange('username')}
          onBlur={handleBlur('username')}
          placeholder="請輸入用戶名"
          autoCapitalize="none"
        />
        {shouldShowFieldError('username') && (
          <Text style={styles.errorText}>{getFieldError('username')}</Text>
        )}
      </View>

      {/* 電子郵件輸入 */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>電子郵件</Text>
        <TextInput
          style={[
            styles.input,
            shouldShowFieldError('email') && styles.inputError
          ]}
          value={values.email}
          onChangeText={handleChange('email')}
          onBlur={handleBlur('email')}
          placeholder="請輸入電子郵件"
          keyboardType="email-address"
          autoCapitalize="none"
        />
        {shouldShowFieldError('email') && (
          <Text style={styles.errorText}>{getFieldError('email')}</Text>
        )}
      </View>

      {/* 密碼輸入 */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>密碼</Text>
        <TextInput
          style={[
            styles.input,
            shouldShowFieldError('password') && styles.inputError
          ]}
          value={values.password}
          onChangeText={handleChange('password')}
          onBlur={handleBlur('password')}
          placeholder="請輸入密碼"
          secureTextEntry
        />
        {shouldShowFieldError('password') && (
          <Text style={styles.errorText}>{getFieldError('password')}</Text>
        )}
      </View>

      {/* 確認密碼輸入 */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>確認密碼</Text>
        <TextInput
          style={[
            styles.input,
            shouldShowFieldError('confirmPassword') && styles.inputError
          ]}
          value={values.confirmPassword}
          onChangeText={handleChange('confirmPassword')}
          onBlur={handleBlur('confirmPassword')}
          placeholder="請再次輸入密碼"
          secureTextEntry
        />
        {shouldShowFieldError('confirmPassword') && (
          <Text style={styles.errorText}>{getFieldError('confirmPassword')}</Text>
        )}
      </View>

      {/* 接受條款 */}
      <View style={styles.checkboxContainer}>
        <TouchableOpacity
          style={[
            styles.checkbox,
            values.acceptTerms && styles.checkboxChecked
          ]}
          onPress={() => handleChange('acceptTerms')(!values.acceptTerms)}
        >
          {values.acceptTerms && <Text style={styles.checkmark}>✓</Text>}
        </TouchableOpacity>
        <Text style={styles.checkboxLabel}>我接受條款和條件</Text>
      </View>

      {/* 提交按鈕 */}
      <TouchableOpacity
        style={[
          styles.submitButton,
          (!isValid || isSubmitting) && styles.submitButtonDisabled
        ]}
        onPress={submit}
        disabled={!isValid || isSubmitting}
      >
        <Text style={styles.submitButtonText}>
          {isSubmitting ? '提交中...' : '註冊'}
        </Text>
      </TouchableOpacity>

      {/* 表單狀態顯示 */}
      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>
          表單有效: {isValid ? '是' : '否'}
        </Text>
        <Text style={styles.statusText}>
          錯誤數量: {Object.keys(errors).length}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: theme.colors.background
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: theme.colors.text
  },
  inputContainer: {
    marginBottom: 15
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
    color: theme.colors.text
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: theme.colors.surface,
    color: theme.colors.text
  },
  inputError: {
    borderColor: theme.colors.error
  },
  errorText: {
    color: theme.colors.error,
    fontSize: 14,
    marginTop: 5
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    borderRadius: 4,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  checkboxChecked: {
    backgroundColor: theme.colors.primary
  },
  checkmark: {
    color: theme.colors.white,
    fontSize: 14,
    fontWeight: 'bold'
  },
  checkboxLabel: {
    fontSize: 16,
    color: theme.colors.text
  },
  submitButton: {
    backgroundColor: theme.colors.primary,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20
  },
  submitButtonDisabled: {
    backgroundColor: theme.colors.disabled
  },
  submitButtonText: {
    color: theme.colors.white,
    fontSize: 18,
    fontWeight: '600'
  },
  statusContainer: {
    backgroundColor: theme.colors.surface,
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  statusText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 5
  }
});
