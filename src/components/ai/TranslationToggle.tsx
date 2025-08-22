import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '@/config/theme';

interface TranslationToggleProps {
  isEnabled: boolean;
  onToggle: (enabled: boolean) => void;
  targetLanguage?: string;
  onLanguageChange?: (language: string) => void;
}

interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

const SUPPORTED_LANGUAGES: Language[] = [
  {
    code: 'zh-TW',
    name: 'Chinese (Traditional)',
    nativeName: '繁體中文',
    flag: '🇹🇼',
  },
  {
    code: 'zh-CN',
    name: 'Chinese (Simplified)',
    nativeName: '簡體中文',
    flag: '🇨🇳',
  },
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'th', name: 'Thai', nativeName: 'ไทย', flag: '🇹🇭' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', flag: '🇻🇳' },
];

export const TranslationToggle: React.FC<TranslationToggleProps> = ({
  isEnabled,
  onToggle,
  targetLanguage = 'zh-TW',
  onLanguageChange,
}) => {
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(targetLanguage);

  const currentLanguage =
    SUPPORTED_LANGUAGES.find((lang) => lang.code === selectedLanguage) ||
    SUPPORTED_LANGUAGES[0];

  const handleToggle = () => {
    onToggle(!isEnabled);
  };

  const handleLanguageSelect = (languageCode: string) => {
    setSelectedLanguage(languageCode);
    onLanguageChange?.(languageCode);
    setShowLanguageModal(false);
  };

  const openLanguageModal = () => {
    if (!isEnabled) {
      Alert.alert('翻譯功能未啟用', '請先啟用翻譯功能，然後選擇目標語言。', [
        { text: '取消', style: 'cancel' },
        { text: '啟用翻譯', onPress: () => onToggle(true) },
      ]);
      return;
    }
    setShowLanguageModal(true);
  };

  return (
    <>
      <View style={styles.container}>
        <TouchableOpacity
          style={[styles.toggleButton, isEnabled && styles.toggleButtonActive]}
          onPress={handleToggle}
          activeOpacity={0.7}
        >
          <MaterialIcons
            name="translate"
            size={16}
            color={isEnabled ? '#fff' : theme.colors.textSecondary}
          />
          <Text
            style={[styles.toggleText, isEnabled && styles.toggleTextActive]}
          >
            {isEnabled ? '翻譯已啟用' : '翻譯'}
          </Text>
        </TouchableOpacity>

        {isEnabled && (
          <TouchableOpacity
            style={styles.languageButton}
            onPress={openLanguageModal}
            activeOpacity={0.7}
          >
            <Text style={styles.languageFlag}>{currentLanguage.flag}</Text>
            <Text style={styles.languageCode}>{currentLanguage.code}</Text>
            <MaterialIcons
              name="arrow-drop-down"
              size={16}
              color={theme.colors.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>

      <Modal
        visible={showLanguageModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowLanguageModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>選擇目標語言</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowLanguageModal(false)}
              >
                <MaterialIcons
                  name="close"
                  size={24}
                  color={theme.colors.textSecondary}
                />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.languageList}
              showsVerticalScrollIndicator={false}
            >
              {SUPPORTED_LANGUAGES.map((language) => (
                <TouchableOpacity
                  key={language.code}
                  style={[
                    styles.languageItem,
                    selectedLanguage === language.code &&
                      styles.languageItemSelected,
                  ]}
                  onPress={() => handleLanguageSelect(language.code)}
                >
                  <Text style={styles.languageFlag}>{language.flag}</Text>
                  <View style={styles.languageInfo}>
                    <Text style={styles.languageName}>
                      {language.nativeName}
                    </Text>
                    <Text style={styles.languageEnglishName}>
                      {language.name}
                    </Text>
                  </View>
                  {selectedLanguage === language.code && (
                    <MaterialIcons
                      name="check"
                      size={20}
                      color={theme.colors.primary}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: theme.colors.backgroundLight,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  toggleButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  toggleText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginLeft: 4,
  },
  toggleTextActive: {
    color: '#fff',
  },
  languageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: theme.colors.backgroundLight,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  languageFlag: {
    fontSize: 16,
    marginRight: 4,
  },
  languageCode: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginRight: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    maxHeight: '70%',
    backgroundColor: theme.colors.background,
    borderRadius: 16,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
  },
  closeButton: {
    padding: 4,
  },
  languageList: {
    maxHeight: 400,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  languageItemSelected: {
    backgroundColor: theme.colors.primary + '10',
  },
  languageInfo: {
    flex: 1,
    marginLeft: 12,
  },
  languageName: {
    fontSize: 16,
    color: theme.colors.textPrimary,
    fontWeight: '500',
  },
  languageEnglishName: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
});
