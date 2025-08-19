import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  Switch,
  Slider
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '@/config/theme';

interface ChatSettings {
  enableVoiceInput: boolean;
  enableImageAnalysis: boolean;
  enableEmotionAnalysis: boolean;
  enableTranslation: boolean;
  enableSmartSuggestions: boolean;
  responseLength: 'short' | 'medium' | 'long';
  aiPersonality: 'professional' | 'friendly' | 'casual';
  autoScroll: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
}

interface ChatSettingsModalProps {
  visible: boolean;
  settings: Partial<ChatSettings>;
  onClose: () => void;
  onUpdate: (settings: ChatSettings) => void;
}

const DEFAULT_SETTINGS: ChatSettings = {
  enableVoiceInput: true,
  enableImageAnalysis: true,
  enableEmotionAnalysis: true,
  enableTranslation: false,
  enableSmartSuggestions: true,
  responseLength: 'medium',
  aiPersonality: 'friendly',
  autoScroll: true,
  soundEnabled: true,
  vibrationEnabled: true
};

export const ChatSettingsModal: React.FC<ChatSettingsModalProps> = ({
  visible,
  settings,
  onClose,
  onUpdate
}) => {
  const [currentSettings, setCurrentSettings] = useState<ChatSettings>({
    ...DEFAULT_SETTINGS,
    ...settings
  });

  const handleToggle = (key: keyof ChatSettings) => {
    const newSettings = {
      ...currentSettings,
      [key]: !currentSettings[key]
    };
    setCurrentSettings(newSettings);
  };

  const handleSave = () => {
    onUpdate(currentSettings);
    onClose();
  };

  const handleReset = () => {
    setCurrentSettings(DEFAULT_SETTINGS);
  };

  const renderSettingItem = (
    title: string,
    description: string,
    key: keyof ChatSettings,
    type: 'switch' | 'select' = 'switch',
    options?: { label: string; value: any }[]
  ) => (
    <View style={styles.settingItem}>
      <View style={styles.settingHeader}>
        <Text style={styles.settingTitle}>{title}</Text>
        {type === 'switch' && (
          <Switch
            value={currentSettings[key] as boolean}
            onValueChange={() => handleToggle(key)}
            trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
            thumbColor={currentSettings[key] ? '#fff' : '#f4f3f4'}
          />
        )}
      </View>
      <Text style={styles.settingDescription}>{description}</Text>
      
      {type === 'select' && options && (
        <View style={styles.optionsContainer}>
          {options.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.optionButton,
                currentSettings[key] === option.value && styles.optionButtonSelected
              ]}
              onPress={() => setCurrentSettings({
                ...currentSettings,
                [key]: option.value
              })}
            >
              <Text style={[
                styles.optionText,
                currentSettings[key] === option.value && styles.optionTextSelected
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <MaterialIcons name="settings" size={24} color={theme.colors.primary} />
              <Text style={styles.headerTitle}>聊天設置</Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <MaterialIcons name="close" size={24} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* 輸入功能 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>輸入功能</Text>
              {renderSettingItem(
                '語音輸入',
                '允許使用語音輸入消息',
                'enableVoiceInput'
              )}
              {renderSettingItem(
                '圖片分析',
                '支持上傳圖片進行分析',
                'enableImageAnalysis'
              )}
            </View>

            {/* AI功能 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>AI功能</Text>
              {renderSettingItem(
                '情感分析',
                '分析消息的情感傾向',
                'enableEmotionAnalysis'
              )}
              {renderSettingItem(
                '智能翻譯',
                '自動翻譯消息',
                'enableTranslation'
              )}
              {renderSettingItem(
                '智能建議',
                '提供相關問題建議',
                'enableSmartSuggestions'
              )}
            </View>

            {/* 回應設置 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>回應設置</Text>
              {renderSettingItem(
                '回應長度',
                'AI回應的詳細程度',
                'responseLength',
                'select',
                [
                  { label: '簡短', value: 'short' },
                  { label: '中等', value: 'medium' },
                  { label: '詳細', value: 'long' }
                ]
              )}
              {renderSettingItem(
                'AI個性',
                'AI助手的對話風格',
                'aiPersonality',
                'select',
                [
                  { label: '專業', value: 'professional' },
                  { label: '友好', value: 'friendly' },
                  { label: '隨意', value: 'casual' }
                ]
              )}
            </View>

            {/* 界面設置 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>界面設置</Text>
              {renderSettingItem(
                '自動滾動',
                '新消息時自動滾動到底部',
                'autoScroll'
              )}
              {renderSettingItem(
                '聲音提示',
                '收到消息時播放聲音',
                'soundEnabled'
              )}
              {renderSettingItem(
                '震動提示',
                '收到消息時震動',
                'vibrationEnabled'
              )}
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
              <MaterialIcons name="refresh" size={16} color={theme.colors.textSecondary} />
              <Text style={styles.resetButtonText}>重置</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>保存設置</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: theme.colors.background,
    borderRadius: 16,
    overflow: 'hidden'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginLeft: 8
  },
  closeButton: {
    padding: 4
  },
  content: {
    padding: 16
  },
  section: {
    marginBottom: 24
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginBottom: 12
  },
  settingItem: {
    marginBottom: 16
  },
  settingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4
  },
  settingTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.textPrimary
  },
  settingDescription: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    lineHeight: 16
  },
  optionsContainer: {
    flexDirection: 'row',
    marginTop: 8,
    flexWrap: 'wrap'
  },
  optionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 4,
    borderRadius: 16,
    backgroundColor: theme.colors.backgroundLight,
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  optionButtonSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary
  },
  optionText: {
    fontSize: 12,
    color: theme.colors.textPrimary
  },
  optionTextSelected: {
    color: '#fff'
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8
  },
  resetButtonText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginLeft: 4
  },
  saveButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff'
  }
});
