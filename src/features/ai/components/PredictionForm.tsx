import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

// import { Picker } from '@react-native-picker/picker'; // 模塊不存在，已移除
import { usePrediction } from '../hooks/usePrediction';
import type { PredictionRequest } from '../types/prediction';
import {
  PREDICTION_CONSTANTS,
  PredictionType,
  TimeHorizon,
} from '../types/prediction';

interface PredictionFormProps {
  cardId?: string;
  cardName?: string;
  series?: string;
  version?: string;
  currentPrice?: number;
  onPredictionComplete?: (result: unknown) => void;
  onCancel?: () => void;
}

export const PredictionForm: React.FC<PredictionFormProps> = ({
  cardId = '',
  cardName = '',
  series = '',
  version = '',
  currentPrice = 0,
  onPredictionComplete,
  onCancel,
}) => {
  const { predict, loading, error, clearError, getOptions, options } =
    usePrediction();

  const [formData, setFormData] = useState<Partial<PredictionRequest>>({
    cardId,
    cardName,
    series,
    version,
    currentPrice,
    predictionType: PredictionType.PRICE,
    timeHorizon: TimeHorizon.MEDIUM_TERM,
    confidenceLevel: PREDICTION_CONSTANTS.DEFAULT_CONFIDENCE_LEVEL,
  });

  useEffect(() => {
    getOptions();
  }, [getOptions]);

  useEffect(() => {
    if (error) {
      Alert.alert('預測錯誤', error.message);
      clearError();
    }
  }, [error, clearError]);

  const _handleInputChange = (field: keyof PredictionRequest, value: unknown) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const _handleSubmit = async () => {
    if (!formData.cardId || !formData.cardName || !formData.currentPrice) {
      Alert.alert('錯誤', '請填寫所有必填欄位');
      return;
    }

    if (formData.currentPrice <= 0) {
      Alert.alert('錯誤', '當前價格必須大於0');
      return;
    }

    try {
      const _result = await predict(formData as PredictionRequest);
      Alert.alert('預測成功', `預測值: ${result.predictedValue.toFixed(2)}`);
      onPredictionComplete?.(result);
    } catch (error) {
      console.error('Prediction failed:', error);
    }
  };

  const _getPredictionTypeLabel = (type: PredictionType) => {
    switch (type) {
      case PredictionType.PRICE:
        return '價格預測';
      case PredictionType.TREND:
        return '趨勢預測';
      case PredictionType.VOLATILITY:
        return '波動性預測';
      case PredictionType.VOLUME:
        return '交易量預測';
      case PredictionType.MARKET_CAP:
        return '市值預測';
      case PredictionType.COMPOSITE:
        return '綜合預測';
      default:
        return type;
    }
  };

  const _getTimeHorizonLabel = (horizon: TimeHorizon) => {
    switch (horizon) {
      case TimeHorizon.SHORT_TERM:
        return '短期 (1-7天)';
      case TimeHorizon.MEDIUM_TERM:
        return '中期 (1-4週)';
      case TimeHorizon.LONG_TERM:
        return '長期 (1-12個月)';
      case TimeHorizon.VERY_LONG_TERM:
        return '超長期 (1年以上)';
      default:
        return horizon;
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>AI 預測系統</Text>

      <View style={styles.form}>
        {/* 卡牌信息 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>卡牌信息</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>卡牌ID *</Text>
            <TextInput
              style={styles.input}
              value={formData.cardId}
              onChangeText={value => handleInputChange('cardId', value)}
              placeholder='輸入卡牌ID'
              editable={!cardId}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>卡牌名稱 *</Text>
            <TextInput
              style={styles.input}
              value={formData.cardName}
              onChangeText={value => handleInputChange('cardName', value)}
              placeholder='輸入卡牌名稱'
              editable={!cardName}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>系列</Text>
            <TextInput
              style={styles.input}
              value={formData.series}
              onChangeText={value => handleInputChange('series', value)}
              placeholder='輸入系列名稱'
              editable={!series}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>版本</Text>
            <TextInput
              style={styles.input}
              value={formData.version}
              onChangeText={value => handleInputChange('version', value)}
              placeholder='輸入版本信息'
              editable={!version}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>當前價格 *</Text>
            <TextInput
              style={styles.input}
              value={formData.currentPrice?.toString()}
              onChangeText={value =>
                handleInputChange('currentPrice', parseFloat(value) || 0)
              }
              placeholder='輸入當前價格'
              keyboardType='numeric'
              editable={!currentPrice}
            />
          </View>
        </View>

        {/* 預測設置 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>預測設置</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>預測類型</Text>
            <TouchableOpacity
              style={styles.pickerContainer}
              onPress={() => {
                // 簡化實現，直接設置第一個選項
                handleInputChange(
                  'predictionType',
                  Object.values(PredictionType)[0]
                );
              }}
            >
              <Text style={styles.pickerText}>
                {getPredictionTypeLabel(
                  formData.predictionType || PredictionType.PRICE
                )}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>時間範圍</Text>
            <TouchableOpacity
              style={styles.pickerContainer}
              onPress={() => {
                // 簡化實現，直接設置第一個選項
                handleInputChange('timeHorizon', Object.values(TimeHorizon)[0]);
              }}
            >
              <Text style={styles.pickerText}>
                {getTimeHorizonLabel(
                  formData.timeHorizon || TimeHorizon.MEDIUM_TERM
                )}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              置信度 ({Math.round((formData.confidenceLevel || 0) * 100)}%)
            </Text>
            <TextInput
              style={styles.input}
              value={((formData.confidenceLevel || 0) * 100).toString()}
              onChangeText={value => {
                const _numValue = parseInt(value) || 0;
                const _clampedValue = Math.max(50, Math.min(95, numValue));
                handleInputChange('confidenceLevel', clampedValue / 100);
              }}
              placeholder='50-95'
              keyboardType='numeric'
            />
          </View>
        </View>

        {/* 預測選項 */}
        {options && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>預測選項</Text>

            <View style={styles.optionGroup}>
              <Text style={styles.optionLabel}>算法: {options.algorithm}</Text>
            </View>

            <View style={styles.optionGroup}>
              <Text style={styles.optionLabel}>
                包含季節性: {options.includeSeasonality ? '是' : '否'}
              </Text>
            </View>

            <View style={styles.optionGroup}>
              <Text style={styles.optionLabel}>
                包含外部因素: {options.includeExternalFactors ? '是' : '否'}
              </Text>
            </View>

            <View style={styles.optionGroup}>
              <Text style={styles.optionLabel}>
                敏感性分析: {options.sensitivityAnalysis ? '是' : '否'}
              </Text>
            </View>

            <View style={styles.optionGroup}>
              <Text style={styles.optionLabel}>
                情景分析: {options.scenarioAnalysis ? '是' : '否'}
              </Text>
            </View>

            <View style={styles.optionGroup}>
              <Text style={styles.optionLabel}>
                更新頻率: {options.updateFrequency}
              </Text>
            </View>
          </View>
        )}

        {/* 操作按鈕 */}
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
              <Text style={styles.buttonText}>開始預測</Text>
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
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  picker: {
    height: 50,
  },
  pickerText: {
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  optionGroup: {
    marginBottom: 10,
  },
  optionLabel: {
    fontSize: 14,
    color: '#666',
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
