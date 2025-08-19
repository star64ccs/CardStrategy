import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  BackHandler
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Loading } from '../common';
import { theme } from '../../config/theme';
import { termsService } from '../../services/termsService';
import { TermsAgreementModal } from './TermsAgreementModal';
import { TermsComplianceCheck } from '../../types/terms';
import { logger } from '../../utils/logger';

interface TermsComplianceCheckerProps {
  userId: string;
  onCompliancePass: () => void;
  onComplianceFail: () => void;
  children?: React.ReactNode;
}

export const TermsComplianceChecker: React.FC<TermsComplianceCheckerProps> = ({
  userId,
  onCompliancePass,
  onComplianceFail,
  children
}) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [compliance, setCompliance] = useState<TermsComplianceCheck | null>(null);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    checkCompliance();

    // 防止用戶返回
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (!compliance?.canUseApp) {
        Alert.alert(
          '無法退出',
          '您必須同意條款才能使用應用。',
          [{ text: '確定' }]
        );
        return true;
      }
      return false;
    });

    return () => backHandler.remove();
  }, []);

  const checkCompliance = async () => {
    if (hasChecked) return;

    setLoading(true);
    try {
      const complianceCheck = await termsService.checkUserConsent(userId);
      setCompliance(complianceCheck);
      setHasChecked(true);

      if (complianceCheck.canUseApp) {
        onCompliancePass();
      } else {
        // 檢查是否有待處理的條款
        if (complianceCheck.pendingTerms.length > 0) {
          setShowTermsModal(true);
        } else {
          onComplianceFail();
        }
      }
    } catch (error) {
      logger.error('檢查條款合規性失敗:', error);
      Alert.alert(
        '檢查失敗',
        '無法檢查條款同意狀態，請檢查網絡連接後重試。',
        [
          { text: '重試', onPress: checkCompliance },
          { text: '退出', onPress: onComplianceFail, style: 'destructive' }
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleTermsAgree = () => {
    setShowTermsModal(false);
    onCompliancePass();
  };

  const handleTermsDecline = () => {
    setShowTermsModal(false);
    Alert.alert(
      '無法使用應用',
      '您必須同意所有必要條款才能使用卡策。',
      [
        { text: '重新考慮', onPress: () => setShowTermsModal(true) },
        { text: '退出應用', onPress: onComplianceFail, style: 'destructive' }
      ]
    );
  };

  const handleTermsClose = () => {
    if (compliance?.canUseApp) {
      setShowTermsModal(false);
    } else {
      Alert.alert(
        '無法關閉',
        '您必須同意條款才能繼續使用應用。',
        [{ text: '確定' }]
      );
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Loading size="large" />
        <Text style={styles.loadingText}>正在檢查條款同意狀態...</Text>
      </View>
    );
  }

  if (!compliance?.canUseApp) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>條款同意檢查</Text>
          <Text style={styles.subtitle}>
            您需要同意以下條款才能使用卡策：
          </Text>

          {compliance?.pendingTerms && compliance.pendingTerms.length > 0 && (
            <View style={styles.pendingTerms}>
              {compliance.pendingTerms.map((term, index) => (
                <Text key={index} style={styles.pendingTerm}>
                  • {getTermsDisplayName(term)}
                </Text>
              ))}
            </View>
          )}

          <Text style={styles.description}>
            這些條款保護您的權益並確保服務的正常運作。請仔細閱讀並同意所有條款。
          </Text>

          <View style={styles.actions}>
            <Text style={styles.actionButton} onPress={() => setShowTermsModal(true)}>
              查看並同意條款
            </Text>
            <Text style={styles.declineButton} onPress={onComplianceFail}>
              不同意並退出
            </Text>
          </View>
        </View>

        <TermsAgreementModal
          visible={showTermsModal}
          userId={userId}
          onAgree={handleTermsAgree}
          onDecline={handleTermsDecline}
          onClose={handleTermsClose}
          forceAgreement={true}
        />
      </View>
    );
  }

  return <>{children}</>;
};

// 獲取條款顯示名稱
const getTermsDisplayName = (termType: string): string => {
  const displayNames: Record<string, string> = {
    purchase_refund_policy: '購買及退款政策',
    disclaimer: '免責聲明',
    cookie_policy: 'Cookie 政策',
    terms_of_use: '使用條款',
    ai_usage_policy: 'AI 使用政策'
  };
  return displayNames[termType] || termType;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: theme.colors.textSecondary
  },
  content: {
    maxWidth: 400,
    alignItems: 'center'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 16,
    textAlign: 'center'
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.text,
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 24
  },
  pendingTerms: {
    marginBottom: 20,
    alignSelf: 'stretch'
  },
  pendingTerm: {
    fontSize: 14,
    color: theme.colors.text,
    marginBottom: 8,
    paddingLeft: 16
  },
  description: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 30,
    textAlign: 'center',
    lineHeight: 20
  },
  actions: {
    flexDirection: 'row',
    gap: 16
  },
  actionButton: {
    backgroundColor: theme.colors.primary,
    color: theme.colors.white,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    fontSize: 16,
    fontWeight: '600',
    overflow: 'hidden'
  },
  declineButton: {
    backgroundColor: theme.colors.error,
    color: theme.colors.white,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    fontSize: 16,
    fontWeight: '600',
    overflow: 'hidden'
  }
});
