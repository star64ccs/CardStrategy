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
import type {
  InvestmentRecommendationRequest,
  UserProfile,
} from '../types/recommendation';
import {
  InvestmentTimeHorizon,
  RiskTolerance,
  InvestmentGoal,
  RECOMMENDATION_CONSTANTS,
} from '../types/recommendation';

interface RecommendationRequestFormProps {
  userId: string;
  userProfile?: UserProfile;
  onRecommendationGenerated?: (result: unknown) => void;
  onCancel?: () => void;
}

export const RecommendationRequestForm: React.FC<
  RecommendationRequestFormProps
> = ({ userId, userProfile, onRecommendationGenerated, onCancel }) => {
  const { generateInvestmentRecommendation, loading, error, clearError } =
    useRecommendation();

  const [formData, setFormData] = useState<
    Partial<InvestmentRecommendationRequest>
  >({
    userId,
    userProfile: userProfile || {
      age: 30,
      experience: 'intermediate' as any,
      currentPortfolio: [],
      totalInvestment: 0,
      investmentKnowledge: 'intermediate' as any,
      preferredGenres: [],
      blacklistedCards: [],
      favoriteArtists: [],
      collectingStyle: 'casual' as any,
    },
    budget: RECOMMENDATION_CONSTANTS.DEFAULT_BUDGET,
    timeHorizon: RECOMMENDATION_CONSTANTS.DEFAULT_TIME_HORIZON,
    riskTolerance: RECOMMENDATION_CONSTANTS.DEFAULT_RISK_TOLERANCE,
    investmentGoals: [InvestmentGoal.CAPITAL_APPRECIATION],
    excludeCategories: [],
  });

  const [newExcludeCategory, setNewExcludeCategory] = useState('');

  useEffect(() => {
    if (userProfile) {
      setFormData(prev => ({
        ...prev,
        userProfile,
      }));
    }
  }, [userProfile]);

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error.message);
      clearError();
    }
  }, [error, clearError]);

  const _handleInputChange = (
    field: keyof InvestmentRecommendationRequest,
    value: unknown
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const _toggleInvestmentGoal = (goal: InvestmentGoal) => {
    setFormData(prev => {
      const _currentGoals = prev.investmentGoals || [];
      const _hasGoal = currentGoals.includes(goal);

      if (hasGoal) {
        return {
          ...prev,
          investmentGoals: currentGoals.filter(g => g !== goal),
        };
      } else {
        return {
          ...prev,
          investmentGoals: [...currentGoals, goal],
        };
      }
    });
  };

  const _addExcludeCategory = () => {
    if (
      newExcludeCategory.trim() &&
      !formData.excludeCategories?.includes(newExcludeCategory.trim())
    ) {
      setFormData(prev => ({
        ...prev,
        excludeCategories: [
          ...(prev.excludeCategories || []),
          newExcludeCategory.trim(),
        ],
      }));
      setNewExcludeCategory('');
    }
  };

  const _removeExcludeCategory = (category: string) => {
    setFormData(prev => ({
      ...prev,
      excludeCategories:
        prev.excludeCategories?.filter(c => c !== category) || [],
    }));
  };

  const _handleSubmit = async () => {
    try {
      // Verify必填欄位
      if (
        !formData.budget ||
        formData.budget < RECOMMENDATION_CONSTANTS.MIN_BUDGET
      ) {
        Alert.alert(
          'Error',
          `預算不能少於 ${RECOMMENDATION_CONSTANTS.MIN_BUDGET}`
        );
        return;
      }

      if (formData.budget > RECOMMENDATION_CONSTANTS.MAX_BUDGET) {
        Alert.alert(
          'Error',
          `預算不能超過 ${RECOMMENDATION_CONSTANTS.MAX_BUDGET}`
        );
        return;
      }

      if (!formData.investmentGoals || formData.investmentGoals.length === 0) {
        Alert.alert('Error', '請至少選擇一個投資目標');
        return;
      }

      if (!formData.userProfile) {
        Alert.alert('Error', '請先設定用戶配置');
        return;
      }

      const _request = formData as InvestmentRecommendationRequest;
      const _result = await generateInvestmentRecommendation(request);
      Alert.alert('Success', '投資建議已生成');
      onRecommendationGenerated?.(result);
    } catch (error) {
      console.error('Failed to generate recommendation:', error);
    }
  };

  const _getTimeHorizonLabel = (horizon: InvestmentTimeHorizon) => {
    switch (horizon) {
      case InvestmentTimeHorizon.SHORT_TERM:
        return '短期 (1-6個月)';
      case InvestmentTimeHorizon.MEDIUM_TERM:
        return '中期 (6-18個月)';
      case InvestmentTimeHorizon.LONG_TERM:
        return '長期 (1.5-5年)';
      case InvestmentTimeHorizon.VERY_LONG_TERM:
        return '超長期 (5年以上)';
      default:
        return horizon;
    }
  };

  const _getRiskToleranceLabel = (tolerance: RiskTolerance) => {
    switch (tolerance) {
      case RiskTolerance.VERY_CONSERVATIVE:
        return '極保守';
      case RiskTolerance.CONSERVATIVE:
        return '保守';
      case RiskTolerance.MODERATE:
        return '中等';
      case RiskTolerance.AGGRESSIVE:
        return '積極';
      case RiskTolerance.VERY_AGGRESSIVE:
        return '極積極';
      default:
        return tolerance;
    }
  };

  const _getInvestmentGoalLabel = (goal: InvestmentGoal) => {
    switch (goal) {
      case InvestmentGoal.CAPITAL_APPRECIATION:
        return '資本增值';
      case InvestmentGoal.INCOME_GENERATION:
        return '收益生成';
      case InvestmentGoal.CAPITAL_PRESERVATION:
        return '資本保值';
      case InvestmentGoal.SPECULATION:
        return '投機獲利';
      case InvestmentGoal.COLLECTION_COMPLETION:
        return '收藏完整';
      case InvestmentGoal.PORTFOLIO_DIVERSIFICATION:
        return '組合多樣化';
      default:
        return goal;
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>投資建議請求</Text>

      <View style={styles.form}>
        {/* 基本Parameter */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>基本參數</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>投資預算 *</Text>
            <TextInput
              style={styles.input}
              value={formData.budget?.toString()}
              onChangeText={value =>
                handleInputChange('budget', parseFloat(value) || 0)
              }
              placeholder={`最少 ${RECOMMENDATION_CONSTANTS.MIN_BUDGET}`}
              keyboardType='numeric'
            />
            <Text style={styles.hint}>
              範圍: {RECOMMENDATION_CONSTANTS.MIN_BUDGET.toLocaleString()} -{' '}
              {RECOMMENDATION_CONSTANTS.MAX_BUDGET.toLocaleString()}
            </Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>投資時間範圍</Text>
            <View style={styles.buttonGroup}>
              {Object.values(InvestmentTimeHorizon).map(horizon => (
                <TouchableOpacity
                  key={horizon}
                  style={[
                    styles.optionButton,
                    formData.timeHorizon === horizon && styles.selectedOption,
                  ]}
                  onPress={() => handleInputChange('timeHorizon', horizon)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      formData.timeHorizon === horizon &&
                        styles.selectedOptionText,
                    ]}
                  >
                    {getTimeHorizonLabel(horizon)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>風險承受度</Text>
            <View style={styles.buttonGroup}>
              {Object.values(RiskTolerance).map(tolerance => (
                <TouchableOpacity
                  key={tolerance}
                  style={[
                    styles.optionButton,
                    formData.riskTolerance === tolerance &&
                      styles.selectedOption,
                  ]}
                  onPress={() => handleInputChange('riskTolerance', tolerance)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      formData.riskTolerance === tolerance &&
                        styles.selectedOptionText,
                    ]}
                  >
                    {getRiskToleranceLabel(tolerance)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* 投資目標 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>投資目標（可多選）</Text>

          {Object.values(InvestmentGoal).map(goal => (
            <TouchableOpacity
              key={goal}
              style={styles.checkboxContainer}
              onPress={() => toggleInvestmentGoal(goal)}
            >
              <View
                style={[
                  styles.checkbox,
                  formData.investmentGoals?.includes(goal) &&
                    styles.checkboxChecked,
                ]}
              >
                {formData.investmentGoals?.includes(goal) && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </View>
              <Text style={styles.checkboxLabel}>
                {getInvestmentGoalLabel(goal)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 排除Class別 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>排除類別（可選）</Text>

          <View style={styles.tagInputContainer}>
            <TextInput
              style={styles.tagInput}
              value={newExcludeCategory}
              onChangeText={setNewExcludeCategory}
              placeholder='輸入要排除的類別'
              onSubmitEditing={addExcludeCategory}
            />
            <TouchableOpacity
              style={styles.addButton}
              onPress={addExcludeCategory}
            >
              <Text style={styles.addButtonText}>添加</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.tagContainer}>
            {formData.excludeCategories?.map((category, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{category}</Text>
                <TouchableOpacity
                  onPress={() => removeExcludeCategory(category)}
                >
                  <Text style={styles.removeTag}>×</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        {/* UserConfigure摘要 */}
        {formData.userProfile && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>用戶配置摘要</Text>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>年齡:</Text>
              <Text style={styles.summaryValue}>
                {formData.userProfile.age} 歲
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>經驗水平:</Text>
              <Text style={styles.summaryValue}>
                {formData.userProfile.experience}
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>總投資:</Text>
              <Text style={styles.summaryValue}>
                {formData.userProfile.totalInvestment.toLocaleString()}
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>收藏風格:</Text>
              <Text style={styles.summaryValue}>
                {formData.userProfile.collectingStyle}
              </Text>
            </View>

            {formData.userProfile.preferredGenres.length > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>偏好類型:</Text>
                <Text style={styles.summaryValue}>
                  {formData.userProfile.preferredGenres.slice(0, 3).join(', ')}
                  {formData.userProfile.preferredGenres.length > 3 && '...'}
                </Text>
              </View>
            )}
          </View>
        )}

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
              <Text style={styles.buttonText}>生成建議</Text>
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
  hint: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
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
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 4,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  checkmark: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#333',
    flex: 1,
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
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  summaryValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
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
