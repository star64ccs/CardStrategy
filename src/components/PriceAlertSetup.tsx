import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  Modal,
  ScrollView,
} from 'react-native';
import { theme } from '@/config/theme';
import { priceMonitorService } from '@/services/priceMonitorService';
import { logger } from '@/utils/logger';

interface PriceAlertSetupProps {
  cardId: string;
  cardName: string;
  currentPrice: number;
  isVisible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const PriceAlertSetup: React.FC<PriceAlertSetupProps> = ({
  cardId,
  cardName,
  currentPrice,
  isVisible,
  onClose,
  onSuccess,
}) => {
  const [targetPrice, setTargetPrice] = useState('');
  const [alertType, setAlertType] = useState<'above' | 'below'>('above');
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateAlert = async () => {
    if (!targetPrice || isNaN(Number(targetPrice))) {
      Alert.alert('錯誤', '請輸入有效的目標價格');
      return;
    }

    const price = Number(targetPrice);

    if (alertType === 'above' && price <= currentPrice) {
      Alert.alert('錯誤', '上漲提醒的目標價格必須高於當前價格');
      return;
    }

    if (alertType === 'below' && price >= currentPrice) {
      Alert.alert('錯誤', '下跌提醒的目標價格必須低於當前價格');
      return;
    }

    try {
      setIsLoading(true);

      // 使用價格監控服務創建提醒
      await priceMonitorService.addPriceAlert(cardId, price, alertType);

      Alert.alert(
        '成功',
        `已設置${alertType === 'above' ? '上漲' : '下跌'}提醒，當 ${cardName} 價格${alertType === 'above' ? '上漲' : '下跌'}到 ${price} TWD 時會通知您`,
        [
          {
            text: '確定',
            onPress: () => {
              onClose();
              onSuccess?.();
            },
          },
        ]
      );

      logger.info('價格提醒設置成功', {
        cardId,
        targetPrice: price,
        type: alertType,
      });
    } catch (error) {
      logger.error('設置價格提醒失敗:', { error });
      Alert.alert('錯誤', '設置價格提醒失敗，請重試');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setTargetPrice('');
    setAlertType('above');
    onClose();
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>設置價格提醒</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            {/* 卡片信息 */}
            <View style={styles.cardInfo}>
              <Text style={styles.cardName}>{cardName}</Text>
              <Text style={styles.currentPrice}>
                當前價格: {currentPrice} TWD
              </Text>
            </View>

            {/* 提醒類型選擇 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>提醒類型</Text>
              <View style={styles.typeContainer}>
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    alertType === 'above' && styles.typeButtonActive,
                  ]}
                  onPress={() => setAlertType('above')}
                >
                  <Text
                    style={[
                      styles.typeButtonText,
                      alertType === 'above' && styles.typeButtonTextActive,
                    ]}
                  >
                    📈 上漲提醒
                  </Text>
                  <Text style={styles.typeDescription}>
                    當價格上漲到目標價格時通知
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    alertType === 'below' && styles.typeButtonActive,
                  ]}
                  onPress={() => setAlertType('below')}
                >
                  <Text
                    style={[
                      styles.typeButtonText,
                      alertType === 'below' && styles.typeButtonTextActive,
                    ]}
                  >
                    📉 下跌提醒
                  </Text>
                  <Text style={styles.typeDescription}>
                    當價格下跌到目標價格時通知
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* 目標價格輸入 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>目標價格</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  value={targetPrice}
                  onChangeText={setTargetPrice}
                  placeholder={'輸入目標價格 (TWD)'}
                  placeholderTextColor={theme.colors.textSecondary}
                  keyboardType="numeric"
                  autoFocus={true}
                />
                <Text style={styles.currency}>TWD</Text>
              </View>

              {targetPrice && !isNaN(Number(targetPrice)) && (
                <View style={styles.priceInfo}>
                  <Text style={styles.priceInfoText}>
                    {alertType === 'above' ? '上漲' : '下跌'}幅度:
                    {Math.abs(Number(targetPrice) - currentPrice).toFixed(
                      2
                    )}{' '}
                    TWD (
                    {Math.abs(
                      ((Number(targetPrice) - currentPrice) / currentPrice) *
                        100
                    ).toFixed(2)}
                    %)
                  </Text>
                </View>
              )}
            </View>

            {/* 說明信息 */}
            <View style={styles.infoContainer}>
              <Text style={styles.infoTitle}>💡 使用說明</Text>
              <Text style={styles.infoText}>
                • 設置價格提醒後，當卡牌價格達到目標時會自動發送通知{'\n'}•
                您可以設置多個不同價格的提醒{'\n'}•
                提醒會在價格達到目標時立即發送{'\n'}•
                可以在通知設置中管理所有提醒
              </Text>
            </View>
          </ScrollView>

          {/* 底部按鈕 */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleClose}
              disabled={isLoading}
            >
              <Text style={styles.cancelButtonText}>取消</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.createButton,
                (!targetPrice || isLoading) && styles.createButtonDisabled,
              ]}
              onPress={handleCreateAlert}
              disabled={!targetPrice || isLoading}
            >
              <Text style={styles.createButtonText}>
                {isLoading ? '設置中...' : '創建提醒'}
              </Text>
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
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.colors.backgroundLight,
    borderTopLeftRadius: theme.borderRadius.large,
    borderTopRightRadius: theme.borderRadius.large,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.large,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.backgroundPaper,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: theme.colors.textSecondary,
  },
  content: {
    padding: theme.spacing.large,
  },
  cardInfo: {
    backgroundColor: theme.colors.backgroundPaper,
    padding: theme.spacing.large,
    borderRadius: theme.borderRadius.medium,
    marginBottom: theme.spacing.large,
  },
  cardName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.small,
  },
  currentPrice: {
    fontSize: 16,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  section: {
    marginBottom: theme.spacing.large,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.medium,
  },
  typeContainer: {
    flexDirection: 'row',
    gap: theme.spacing.medium,
  },
  typeButton: {
    flex: 1,
    padding: theme.spacing.medium,
    borderRadius: theme.borderRadius.medium,
    borderWidth: 2,
    borderColor: theme.colors.borderLight,
    alignItems: 'center',
  },
  typeButtonActive: {
    borderColor: theme.colors.primary,
    backgroundColor: `${theme.colors.primary}20`,
  },
  typeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.small,
  },
  typeButtonTextActive: {
    color: theme.colors.primary,
  },
  typeDescription: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    borderRadius: theme.borderRadius.medium,
    paddingHorizontal: theme.spacing.medium,
  },
  input: {
    flex: 1,
    paddingVertical: theme.spacing.medium,
    fontSize: 16,
    color: theme.colors.textPrimary,
  },
  currency: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  priceInfo: {
    marginTop: theme.spacing.small,
    padding: theme.spacing.small,
    backgroundColor: theme.colors.backgroundPaper,
    borderRadius: theme.borderRadius.small,
  },
  priceInfoText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  infoContainer: {
    backgroundColor: theme.colors.backgroundPaper,
    padding: theme.spacing.large,
    borderRadius: theme.borderRadius.medium,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.medium,
  },
  infoText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    padding: theme.spacing.large,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight,
    gap: theme.spacing.medium,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: theme.spacing.medium,
    borderRadius: theme.borderRadius.medium,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: theme.colors.textPrimary,
  },
  createButton: {
    flex: 1,
    paddingVertical: theme.spacing.medium,
    borderRadius: theme.borderRadius.medium,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
  },
  createButtonDisabled: {
    backgroundColor: theme.colors.gray,
    opacity: 0.6,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.white,
  },
});
