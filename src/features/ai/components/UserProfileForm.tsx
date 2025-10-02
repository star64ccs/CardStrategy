import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';

// Remove Picker 依賴，使用CustomSelect器
import { useRecommendation } from '../hooks/useRecommendation';
import type { UserProfile } from '../types/recommendation';
import {
  ExperienceLevel,
  KnowledgeLevel,
  CollectingStyle,
  RECOMMENDATION_CONSTANTS,
} from '../types/recommendation';

interface UserProfileFormProps {
  userId: string;
  initialProfile?: UserProfile;
  onProfileUpdate?: (profile: UserProfile) => void;
  onCancel?: () => void;
}

export const UserProfileForm: React.FC<UserProfileFormProps> = ({
  userId,
  initialProfile,
  onProfileUpdate,
  onCancel,
}) => {
  const { updateProfile, loading, error, clearError } = useRecommendation();

  const [formData, setFormData] = useState<Partial<UserProfile>>({
    age: initialProfile?.age || 30,
    experience: initialProfile?.experience || ExperienceLevel.INTERMEDIATE,
    currentPortfolio: initialProfile?.currentPortfolio || [],
    totalInvestment: initialProfile?.totalInvestment || 0,
    monthlyIncome: initialProfile?.monthlyIncome || 0,
    investmentKnowledge:
      initialProfile?.investmentKnowledge || KnowledgeLevel.INTERMEDIATE,
    preferredGenres: initialProfile?.preferredGenres || [],
    blacklistedCards: initialProfile?.blacklistedCards || [],
    favoriteArtists: initialProfile?.favoriteArtists || [],
    collectingStyle: initialProfile?.collectingStyle || CollectingStyle.CASUAL,
  });

  const [newGenre, setNewGenre] = useState('');
  const [newArtist, setNewArtist] = useState('');

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error.message);
      clearError();
    }
  }, [error, clearError]);

  const _handleInputChange = (field: keyof UserProfile, value: unknown) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const _addGenre = () => {
    if (
      newGenre.trim() &&
      !formData.preferredGenres?.includes(newGenre.trim())
    ) {
      setFormData(prev => ({
        ...prev,
        preferredGenres: [...(prev.preferredGenres || []), newGenre.trim()],
      }));
      setNewGenre('');
    }
  };

  const _removeGenre = (genre: string) => {
    setFormData(prev => ({
      ...prev,
      preferredGenres: prev.preferredGenres?.filter(g => g !== genre) || [],
    }));
  };

  const _addArtist = () => {
    if (
      newArtist.trim() &&
      !formData.favoriteArtists?.includes(newArtist.trim())
    ) {
      setFormData(prev => ({
        ...prev,
        favoriteArtists: [...(prev.favoriteArtists || []), newArtist.trim()],
      }));
      setNewArtist('');
    }
  };

  const _removeArtist = (artist: string) => {
    setFormData(prev => ({
      ...prev,
      favoriteArtists: prev.favoriteArtists?.filter(a => a !== artist) || [],
    }));
  };

  const _handleSubmit = async () => {
    try {
      // Verify必填欄位
      if (!formData.age || formData.age < 18 || formData.age > 100) {
        Alert.alert('Error', '請輸入有效的年齡 (18-100)');
        return;
      }

      if (
        formData.totalInvestment !== undefined &&
        formData.totalInvestment < 0
      ) {
        Alert.alert('Error', '總投資金額不能為負數');
        return;
      }

      if (formData.monthlyIncome !== undefined && formData.monthlyIncome < 0) {
        Alert.alert('Error', '月收入不能為負數');
        return;
      }

      const _profile = formData as UserProfile;
      await updateProfile(userId, profile);
      Alert.alert('Success', '用戶配置已更新');
      onProfileUpdate?.(profile);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const _getExperienceLevelLabel = (level: ExperienceLevel) => {
    switch (level) {
      case ExperienceLevel.BEGINNER:
        return '新手';
      case ExperienceLevel.INTERMEDIATE:
        return '中級';
      case ExperienceLevel.ADVANCED:
        return '高級';
      case ExperienceLevel.EXPERT:
        return '專家';
      default:
        return level;
    }
  };

  const _getKnowledgeLevelLabel = (level: KnowledgeLevel) => {
    switch (level) {
      case KnowledgeLevel.BASIC:
        return '基礎';
      case KnowledgeLevel.INTERMEDIATE:
        return '中級';
      case KnowledgeLevel.ADVANCED:
        return '高級';
      case KnowledgeLevel.EXPERT:
        return '專家';
      default:
        return level;
    }
  };

  const _getCollectingStyleLabel = (style: CollectingStyle) => {
    switch (style) {
      case CollectingStyle.COMPLETIONIST:
        return '完整收藏';
      case CollectingStyle.INVESTOR:
        return '投資導向';
      case CollectingStyle.CASUAL:
        return '休閒收藏';
      case CollectingStyle.SPECULATOR:
        return '投機導向';
      case CollectingStyle.ARTIST_FOCUSED:
        return '藝術家導向';
      case CollectingStyle.META_FOCUSED:
        return '競技導向';
      default:
        return style;
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>用戶配置設定</Text>

      <View style={styles.form}>
        {/* 基本Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>基本信息</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>年齡 *</Text>
            <TextInput
              style={styles.input}
              value={formData.age?.toString()}
              onChangeText={value =>
                handleInputChange('age', parseInt(value) || 0)
              }
              placeholder='輸入年齡'
              keyboardType='numeric'
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>投資經驗</Text>
            <View style={styles.buttonGroup}>
              {Object.values(ExperienceLevel).map(level => (
                <TouchableOpacity
                  key={level}
                  style={[
                    styles.optionButton,
                    formData.experience === level && styles.selectedOption,
                  ]}
                  onPress={() => handleInputChange('experience', level)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      formData.experience === level &&
                        styles.selectedOptionText,
                    ]}
                  >
                    {getExperienceLevelLabel(level)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>投資知識水平</Text>
            <View style={styles.buttonGroup}>
              {Object.values(KnowledgeLevel).map(level => (
                <TouchableOpacity
                  key={level}
                  style={[
                    styles.optionButton,
                    formData.investmentKnowledge === level &&
                      styles.selectedOption,
                  ]}
                  onPress={() =>
                    handleInputChange('investmentKnowledge', level)
                  }
                >
                  <Text
                    style={[
                      styles.optionText,
                      formData.investmentKnowledge === level &&
                        styles.selectedOptionText,
                    ]}
                  >
                    {getKnowledgeLevelLabel(level)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>收藏風格</Text>
            <View style={styles.buttonGroup}>
              {Object.values(CollectingStyle).map(style => (
                <TouchableOpacity
                  key={style}
                  style={[
                    styles.optionButton,
                    formData.collectingStyle === style && styles.selectedOption,
                  ]}
                  onPress={() => handleInputChange('collectingStyle', style)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      formData.collectingStyle === style &&
                        styles.selectedOptionText,
                    ]}
                  >
                    {getCollectingStyleLabel(style)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* 財務Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>財務信息</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>總投資金額</Text>
            <TextInput
              style={styles.input}
              value={formData.totalInvestment?.toString()}
              onChangeText={value =>
                handleInputChange('totalInvestment', parseFloat(value) || 0)
              }
              placeholder='輸入總投資金額'
              keyboardType='numeric'
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>月收入（可選）</Text>
            <TextInput
              style={styles.input}
              value={formData.monthlyIncome?.toString()}
              onChangeText={value =>
                handleInputChange('monthlyIncome', parseFloat(value) || 0)
              }
              placeholder='輸入月收入'
              keyboardType='numeric'
            />
          </View>
        </View>

        {/* Preferences設定 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>偏好設定</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>偏好類型</Text>
            <View style={styles.tagInputContainer}>
              <TextInput
                style={styles.tagInput}
                value={newGenre}
                onChangeText={setNewGenre}
                placeholder='輸入偏好類型'
                onSubmitEditing={addGenre}
              />
              <TouchableOpacity style={styles.addButton} onPress={addGenre}>
                <Text style={styles.addButtonText}>添加</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.tagContainer}>
              {formData.preferredGenres?.map((genre, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{genre}</Text>
                  <TouchableOpacity onPress={() => removeGenre(genre)}>
                    <Text style={styles.removeTag}>×</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>喜愛的藝術家</Text>
            <View style={styles.tagInputContainer}>
              <TextInput
                style={styles.tagInput}
                value={newArtist}
                onChangeText={setNewArtist}
                placeholder='輸入藝術家名稱'
                onSubmitEditing={addArtist}
              />
              <TouchableOpacity style={styles.addButton} onPress={addArtist}>
                <Text style={styles.addButtonText}>添加</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.tagContainer}>
              {formData.favoriteArtists?.map((artist, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{artist}</Text>
                  <TouchableOpacity onPress={() => removeArtist(artist)}>
                    <Text style={styles.removeTag}>×</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Operation按鈕 */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={onCancel}
            disabled={loading}
          >
            <Text style={styles.buttonText}>取消</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.button,
              styles.submitButton,
              loading && styles.disabledButton,
            ]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color='#fff' />
            ) : (
              <Text style={styles.buttonText}>保存配置</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const _styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
    color: '#333',
  },
  form: {
    padding: 20,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
    color: '#555',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  buttonGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 5,
  },
  optionButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: '#fff',
  },
  selectedOption: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  optionText: {
    fontSize: 14,
    color: '#333',
  },
  selectedOptionText: {
    color: '#fff',
    fontWeight: '600',
  },
  tagInputContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  tagInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    marginRight: 10,
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e9ecef',
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 14,
    color: '#495057',
    marginRight: 5,
  },
  removeTag: {
    fontSize: 18,
    color: '#dc3545',
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  submitButton: {
    backgroundColor: '#007AFF',
  },
  cancelButton: {
    backgroundColor: '#FF3B30',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
