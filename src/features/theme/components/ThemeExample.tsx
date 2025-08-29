import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Switch,
  TextInput,
} from 'react-native';

import { useTheme } from '../hooks/useTheme';
import type { ThemeCustomization } from '../types/theme';

const ThemeExample: React.FC = () => {
  const {
    currentTheme,
    availableThemes,
    isAutoTheme,
    systemTheme,
    isLoading,
    error,
    isDarkMode,
    colors,
    spacing,
    typography,
    borderRadius,
    shadows,
    changeTheme,
    toggle,
    setAuto,
    customize,
    reset,
    exportTheme,
    importTheme,
    clearError,
  } = useTheme();

  const [customPrimaryColor, setCustomPrimaryColor] = useState('#FF6B6B');
  const [customBackgroundColor, setCustomBackgroundColor] = useState('#F8F9FA');

  const _handleThemeChange = async (themeId: string) => {
    try {
      await changeTheme(themeId);
    } catch (error) {
      Alert.alert('錯誤', '切換主題失敗');
    }
  };

  const _handleToggleTheme = async () => {
    try {
      await toggle();
    } catch (error) {
      Alert.alert('錯誤', '切換主題失敗');
    }
  };

  const _handleAutoThemeToggle = async (enabled: boolean) => {
    try {
      await setAuto(enabled);
    } catch (error) {
      Alert.alert('錯誤', '設置自動主題失敗');
    }
  };

  const _handleCustomizeTheme = async () => {
    try {
      const customization: ThemeCustomization = {
        themeId: currentTheme.id,
        customizations: {
          primary: customPrimaryColor,
          background: customBackgroundColor,
        },
      };
      await customize(customization);
      Alert.alert('成功', '主題自定義成功');
    } catch (error) {
      Alert.alert('錯誤', '自定義主題失敗');
    }
  };

  const _handleResetTheme = async () => {
    try {
      await reset();
      Alert.alert('成功', '主題已重置');
    } catch (error) {
      Alert.alert('錯誤', '重置主題失敗');
    }
  };

  const _handleExportTheme = async () => {
    try {
      const _themeData = await exportTheme(currentTheme.id);
      Alert.alert('導出成功', `主題數據：${themeData.substring(0, 100)}...`);
    } catch (error) {
      Alert.alert('錯誤', '導出主題失敗');
    }
  };

  const _handleImportTheme = async () => {
    // 這裡應該有一個文件選擇器或輸入框
    Alert.alert('提示', '請在實際應用中實現文件選擇功能');
  };

  const _styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      padding: spacing.md,
    },
    title: {
      fontSize: typography.fontSize.xl,
      fontWeight: 'bold',
      color: colors.text.primary,
      marginBottom: spacing.lg,
      textAlign: 'center',
    },
    section: {
      marginBottom: spacing.xl,
      padding: spacing.md,
      backgroundColor: colors.card,
      borderRadius: borderRadius.md,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    sectionTitle: {
      fontSize: typography.fontSize.lg,
      fontWeight: '600',
      color: colors.text.primary,
      marginBottom: spacing.md,
    },
    themeButton: {
      padding: spacing.sm,
      marginVertical: spacing.xs,
      backgroundColor: colors.primary,
      borderRadius: borderRadius.sm,
      alignItems: 'center',
    },
    themeButtonText: {
      color: colors.text.inverse,
      fontSize: typography.fontSize.md,
      fontWeight: '500',
    },
    activeThemeButton: {
      backgroundColor: colors.accent,
    },
    toggleContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginVertical: spacing.sm,
    },
    toggleLabel: {
      fontSize: typography.fontSize.md,
      color: colors.text.primary,
      flex: 1,
    },
    toggleValue: {
      fontSize: typography.fontSize.sm,
      color: colors.text.secondary,
    },
    colorPreview: {
      width: 30,
      height: 30,
      borderRadius: borderRadius.sm,
      marginLeft: spacing.sm,
    },
    inputContainer: {
      marginVertical: spacing.sm,
    },
    inputLabel: {
      fontSize: typography.fontSize.sm,
      color: colors.text.secondary,
      marginBottom: spacing.xs,
    },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: borderRadius.sm,
      padding: spacing.sm,
      fontSize: typography.fontSize.md,
      color: colors.text.primary,
      backgroundColor: colors.surface,
    },
    actionButton: {
      padding: spacing.sm,
      marginVertical: spacing.xs,
      backgroundColor: colors.secondary,
      borderRadius: borderRadius.sm,
      alignItems: 'center',
    },
    actionButtonText: {
      color: colors.text.inverse,
      fontSize: typography.fontSize.md,
      fontWeight: '500',
    },
    dangerButton: {
      backgroundColor: colors.error,
    },
    infoText: {
      fontSize: typography.fontSize.sm,
      color: colors.text.secondary,
      marginTop: spacing.sm,
    },
    errorText: {
      fontSize: typography.fontSize.sm,
      color: colors.error,
      marginTop: spacing.sm,
    },
    loadingText: {
      fontSize: typography.fontSize.sm,
      color: colors.text.secondary,
      fontStyle: 'italic',
    },
  });

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>深色模式支持示例</Text>

      {/* 當前主題信息 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>當前主題</Text>
        <Text style={styles.infoText}>ID: {currentTheme.id}</Text>
        <Text style={styles.infoText}>名稱: {currentTheme.name}</Text>
        <Text style={styles.infoText}>類型: {currentTheme.type}</Text>
        <Text style={styles.infoText}>
          深色模式: {isDarkMode ? '是' : '否'}
        </Text>
        <Text style={styles.infoText}>
          自動主題: {isAutoTheme ? '是' : '否'}
        </Text>
        <Text style={styles.infoText}>系統主題: {systemTheme}</Text>
      </View>

      {/* 主題切換 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>主題切換</Text>
        {availableThemes.map(theme => (
          <TouchableOpacity
            key={theme.id}
            style={[
              styles.themeButton,
              currentTheme.id === theme.id && styles.activeThemeButton,
            ]}
            onPress={() => handleThemeChange(theme.id)}
            disabled={isLoading}
          >
            <Text style={styles.themeButtonText}>
              {theme.name} {currentTheme.id === theme.id ? '(當前)' : ''}
            </Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          style={styles.themeButton}
          onPress={handleToggleTheme}
          disabled={isLoading}
        >
          <Text style={styles.themeButtonText}>切換主題</Text>
        </TouchableOpacity>
      </View>

      {/* 自動主題設置 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>自動主題設置</Text>
        <View style={styles.toggleContainer}>
          <Text style={styles.toggleLabel}>啟用自動主題</Text>
          <Switch
            value={isAutoTheme}
            onValueChange={handleAutoThemeToggle}
            disabled={isLoading}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={
              isAutoTheme ? colors.text.inverse : colors.text.secondary
            }
          />
        </View>
        <Text style={styles.infoText}>
          自動主題會根據系統設置自動切換淺色/深色模式
        </Text>
      </View>

      {/* 主題自定義 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>主題自定義</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>主要顏色</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              value={customPrimaryColor}
              onChangeText={setCustomPrimaryColor}
              placeholder='#FF6B6B'
              placeholderTextColor={colors.text.secondary}
            />
            <View
              style={[
                styles.colorPreview,
                { backgroundColor: customPrimaryColor },
              ]}
            />
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>背景顏色</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              value={customBackgroundColor}
              onChangeText={setCustomBackgroundColor}
              placeholder='#F8F9FA'
              placeholderTextColor={colors.text.secondary}
            />
            <View
              style={[
                styles.colorPreview,
                { backgroundColor: customBackgroundColor },
              ]}
            />
          </View>
        </View>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleCustomizeTheme}
          disabled={isLoading}
        >
          <Text style={styles.actionButtonText}>應用自定義</Text>
        </TouchableOpacity>
      </View>

      {/* 主題管理 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>主題管理</Text>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleExportTheme}
          disabled={isLoading}
        >
          <Text style={styles.actionButtonText}>導出當前主題</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleImportTheme}
          disabled={isLoading}
        >
          <Text style={styles.actionButtonText}>導入主題</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.dangerButton]}
          onPress={handleResetTheme}
          disabled={isLoading}
        >
          <Text style={styles.actionButtonText}>重置主題</Text>
        </TouchableOpacity>
      </View>

      {/* 主題屬性展示 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>主題屬性</Text>

        <Text style={styles.infoText}>主要顏色: {colors.primary}</Text>
        <Text style={styles.infoText}>背景顏色: {colors.background}</Text>
        <Text style={styles.infoText}>文字顏色: {colors.text.primary}</Text>
        <Text style={styles.infoText}>邊框顏色: {colors.border}</Text>
        <Text style={styles.infoText}>間距 (md): {spacing.md}px</Text>
        <Text style={styles.infoText}>
          字體大小 (md): {typography.fontSize.md}px
        </Text>
        <Text style={styles.infoText}>圓角 (md): {borderRadius.md}px</Text>
      </View>

      {/* 狀態信息 */}
      {isLoading && (
        <View style={styles.section}>
          <Text style={styles.loadingText}>載入中...</Text>
        </View>
      )}

      {error && (
        <View style={styles.section}>
          <Text style={styles.errorText}>錯誤: {error}</Text>
          <TouchableOpacity style={styles.actionButton} onPress={clearError}>
            <Text style={styles.actionButtonText}>清除錯誤</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

export default ThemeExample;
