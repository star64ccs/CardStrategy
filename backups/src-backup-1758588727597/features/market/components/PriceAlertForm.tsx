import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';

import { PriceAlertType } from '../types/pricing';

interface PriceAlertFormProps {
  cardId: string;
  onSubmit: (alert: {
    cardId: string;
    type: PriceAlertType;
    threshold: number;
    isActive: boolean;
  }) => void;
  onCancel: () => void;
  loading?: boolean;
  currentPrice?: number;
}

export const PriceAlertForm: React.FC<PriceAlertFormProps> = ({
  cardId,
  onSubmit,
  onCancel,
  loading = false,
  currentPrice = 0,
}) => {
  const [type, setType] = useState<PriceAlertType>(PriceAlertType.ABOVE);
  const [threshold, setThreshold] = useState<string>('');
  const [isActive, setIsActive] = useState(true);

  const _handleSubmit = () => {
    const _thresholdValue = parseFloat(threshold);

    if (isNaN(thresholdValue) || thresholdValue <= 0) {
      Alert.alert('錯誤', '請輸入有效的價格閾值');
      return;
    }

    onSubmit({
      cardId,
      type,
      threshold: thresholdValue,
      isActive,
    });
  };

  const _getTypeDescription = (alertType: PriceAlertType) => {
    switch (alertType) {
      case PriceAlertType.ABOVE:
        return '當價格超過指定值時通知';
      case PriceAlertType.BELOW:
        return '當價格低於指定值時通知';
      case PriceAlertType.PERCENTAGE_CHANGE:
        return '當價格變化超過指定百分比時通知';
      case PriceAlertType.VOLUME_SPIKE:
        return '當成交量超過指定值時通知';
      default:
        return '';
    }
  };

  const _getTypeIcon = (alertType: PriceAlertType) => {
    switch (alertType) {
      case PriceAlertType.ABOVE:
        return 'arrow-up';
      case PriceAlertType.BELOW:
        return 'arrow-down';
      case PriceAlertType.PERCENTAGE_CHANGE:
        return 'trending-up';
      case PriceAlertType.VOLUME_SPIKE:
        return 'bar-chart';
      default:
        return 'notifications';
    }
  };

  const _getTypeColor = (alertType: PriceAlertType) => {
    switch (alertType) {
      case PriceAlertType.ABOVE:
        return '#4CAF50';
      case PriceAlertType.BELOW:
        return '#F44336';
      case PriceAlertType.PERCENTAGE_CHANGE:
        return '#FF9800';
      case PriceAlertType.VOLUME_SPIKE:
        return '#2196F3';
      default:
        return '#9E9E9E';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>創建價格警報</Text>
        <TouchableOpacity onPress={onCancel} style={styles.closeButton}>
          <Ionicons name='close' size={24} color='#666666' />
        </TouchableOpacity>
      </View>

      <View style={styles.cardInfo}>
        <Text style={styles.cardLabel}>卡牌 ID</Text>
        <Text style={styles.cardValue}>{cardId}</Text>
      </View>

      {currentPrice > 0 && (
        <View style={styles.currentPriceInfo}>
          <Text style={styles.currentPriceLabel}>當前價格</Text>
          <Text style={styles.currentPriceValue}>
            ${currentPrice.toFixed(2)}
          </Text>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>警報類型</Text>
        <View style={styles.typeOptions}>
          {Object.values(PriceAlertType).map(alertType => (
            <TouchableOpacity
              key={alertType}
              style={[
                styles.typeOption,
                type === alertType && styles.typeOptionSelected,
              ]}
              onPress={() => setType(alertType)}
            >
              <Ionicons
                name={getTypeIcon(alertType) as any}
                size={20}
                color={type === alertType ? '#FFFFFF' : getTypeColor(alertType)}
              />
              <Text
                style={[
                  styles.typeText,
                  type === alertType && styles.typeTextSelected,
                ]}
              >
                {alertType === PriceAlertType.ABOVE && '價格上漲'}
                {alertType === PriceAlertType.BELOW && '價格下跌'}
                {alertType === PriceAlertType.PERCENTAGE_CHANGE && '百分比變化'}
                {alertType === PriceAlertType.VOLUME_SPIKE && '成交量激增'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.typeDescription}>{getTypeDescription(type)}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>閾值設定</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={threshold}
            onChangeText={setThreshold}
            placeholder={
              type === PriceAlertType.PERCENTAGE_CHANGE
                ? '輸入百分比 (例如: 5)'
                : type === PriceAlertType.VOLUME_SPIKE
                  ? '輸入成交量 (例如: 1000)'
                  : '輸入價格 (例如: 100.50)'
            }
            keyboardType='numeric'
            placeholderTextColor='#999999'
          />
          <Text style={styles.inputUnit}>
            {type === PriceAlertType.PERCENTAGE_CHANGE && '%'}
            {type === PriceAlertType.VOLUME_SPIKE && '張'}
            {type !== PriceAlertType.PERCENTAGE_CHANGE &&
              type !== PriceAlertType.VOLUME_SPIKE &&
              '$'}
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>立即啟用警報</Text>
          <Switch
            value={isActive}
            onValueChange={setIsActive}
            trackColor={{ false: '#E0E0E0', true: '#4CAF50' }}
            thumbColor={isActive ? '#FFFFFF' : '#FFFFFF'}
          />
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={onCancel}
          disabled={loading}
        >
          <Text style={styles.cancelButtonText}>取消</Text>
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
            <Text style={styles.submitButtonText}>創建中...</Text>
          ) : (
            <Text style={styles.submitButtonText}>創建警報</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const _styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
  },
  closeButton: {
    padding: 4,
  },
  cardInfo: {
    marginBottom: 16,
  },
  cardLabel: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  cardValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  currentPriceInfo: {
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  currentPriceLabel: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 2,
  },
  currentPriceValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
  },
  typeOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
  },
  typeOptionSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  typeText: {
    fontSize: 14,
    color: '#666666',
    marginLeft: 6,
  },
  typeTextSelected: {
    color: '#FFFFFF',
  },
  typeDescription: {
    fontSize: 12,
    color: '#999999',
    marginTop: 8,
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#000000',
    paddingVertical: 12,
  },
  inputUnit: {
    fontSize: 16,
    color: '#666666',
    marginLeft: 8,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switchLabel: {
    fontSize: 16,
    color: '#000000',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F5F5F5',
  },
  submitButton: {
    backgroundColor: '#007AFF',
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666666',
    fontWeight: '600',
  },
  submitButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
