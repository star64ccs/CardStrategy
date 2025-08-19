import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
  Modal,
  ActivityIndicator
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { Card, Button, Loading } from '../common';
import { theme } from '../../config/theme';
import { termsService } from '../../services/termsService';
import {
  TermsType,
  TermsVersion,
  UserConsent,
  TermsComplianceCheck
} from '../../types/terms';
import { logger } from '../../utils/logger';

const { width, height } = Dimensions.get('window');

interface TermsAgreementModalProps {
  visible: boolean;
  userId: string;
  onAgree: () => void;
  onDecline: () => void;
  onClose: () => void;
  forceAgreement?: boolean; // 是否強制同意
}

export const TermsAgreementModal: React.FC<TermsAgreementModalProps> = ({
  visible,
  userId,
  onAgree,
  onDecline,
  onClose,
  forceAgreement = true
}) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [terms, setTerms] = useState<TermsVersion[]>([]);
  const [currentTermIndex, setCurrentTermIndex] = useState(0);
  const [agreedTerms, setAgreedTerms] = useState<Set<TermsType>>(new Set());
  const [compliance, setCompliance] = useState<TermsComplianceCheck | null>(null);
  const [showAllTerms, setShowAllTerms] = useState(false);

  useEffect(() => {
    if (visible) {
      loadTerms();
    }
  }, [visible]);

  const loadTerms = async () => {
    setLoading(true);
    try {
      // 檢查用戶同意狀態
      const complianceCheck = await termsService.checkUserConsent(userId);
      setCompliance(complianceCheck);

      if (complianceCheck.canUseApp && !forceAgreement) {
        onAgree();
        return;
      }

      // 獲取需要同意的條款
      const pendingTerms = await termsService.getPendingTerms(userId);
      setTerms(pendingTerms);
      setCurrentTermIndex(0);
      setAgreedTerms(new Set());
    } catch (error) {
      logger.error('加載條款失敗:', error);
      Alert.alert('錯誤', '無法加載條款內容，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  const handleAgreeToCurrentTerm = () => {
    if (terms.length === 0) return;

    const currentTerm = terms[currentTermIndex];
    const newAgreedTerms = new Set(agreedTerms);
    newAgreedTerms.add(currentTerm.type);
    setAgreedTerms(newAgreedTerms);

    if (currentTermIndex < terms.length - 1) {
      setCurrentTermIndex(currentTermIndex + 1);
    }
  };

  const handleDeclineCurrentTerm = () => {
    if (terms.length === 0) return;

    const currentTerm = terms[currentTermIndex];
    Alert.alert(
      '不同意條款',
      `您必須同意 ${currentTerm.title} 才能使用本應用。\n\n如果您不同意，將無法使用本應用。`,
      [
        { text: '重新考慮', style: 'cancel' },
        { text: '退出應用', style: 'destructive', onPress: onDecline }
      ]
    );
  };

  const handleAgreeToAllTerms = async () => {
    setLoading(true);
    try {
      const response = await termsService.acceptAllTerms(userId);

      if (response.success) {
        Alert.alert('成功', '您已成功同意所有條款！', [
          { text: '確定', onPress: onAgree }
        ]);
      } else {
        Alert.alert('錯誤', response.message || '同意條款時發生錯誤');
      }
    } catch (error) {
      logger.error('同意所有條款失敗:', error);
      Alert.alert('錯誤', '同意條款時發生錯誤，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  const handleIndividualAgreement = async () => {
    setLoading(true);
    try {
      const currentTerm = terms[currentTermIndex];
      const response = await termsService.recordConsent({
        userId,
        termsType: currentTerm.type,
        action: 'accept',
        version: currentTerm.version
      });

      if (response.success) {
        if (currentTermIndex < terms.length - 1) {
          setCurrentTermIndex(currentTermIndex + 1);
        } else {
          // 所有條款都已同意
          Alert.alert('成功', '您已成功同意所有條款！', [
            { text: '確定', onPress: onAgree }
          ]);
        }
      } else {
        Alert.alert('錯誤', response.message || '同意條款時發生錯誤');
      }
    } catch (error) {
      logger.error('同意條款失敗:', error);
      Alert.alert('錯誤', '同意條款時發生錯誤，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  const renderCurrentTerm = () => {
    if (terms.length === 0 || currentTermIndex >= terms.length) {
      return null;
    }

    const currentTerm = terms[currentTermIndex];
    const isLastTerm = currentTermIndex === terms.length - 1;

    return (
      <View style={styles.termContainer}>
        <View style={styles.termHeader}>
          <Text style={styles.termTitle}>{currentTerm.title}</Text>
          <Text style={styles.termVersion}>版本 {currentTerm.version}</Text>
        </View>

        <ScrollView style={styles.termContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.termText}>{currentTerm.content}</Text>
        </ScrollView>

        <View style={styles.termActions}>
          <Button
            title="不同意"
            onPress={handleDeclineCurrentTerm}
            style={[styles.declineButton, styles.actionButton]}
            textStyle={styles.declineButtonText}
          />
          <Button
            title={isLastTerm ? '同意所有條款' : '同意此條款'}
            onPress={handleIndividualAgreement}
            style={[styles.agreeButton, styles.actionButton]}
            loading={loading}
          />
        </View>
      </View>
    );
  };

  const renderAllTerms = () => {
    return (
      <View style={styles.allTermsContainer}>
        <View style={styles.allTermsHeader}>
          <Text style={styles.allTermsTitle}>所有條款</Text>
          <Text style={styles.allTermsSubtitle}>
            請仔細閱讀以下所有條款，然後選擇同意或不同意
          </Text>
        </View>

        <ScrollView style={styles.allTermsContent} showsVerticalScrollIndicator={false}>
          {terms.map((term, index) => (
            <Card key={term.id} style={styles.termCard}>
              <View style={styles.termCardHeader}>
                <Text style={styles.termCardTitle}>{term.title}</Text>
                <Text style={styles.termCardVersion}>版本 {term.version}</Text>
              </View>
              <ScrollView style={styles.termCardContent} showsVerticalScrollIndicator={false}>
                <Text style={styles.termCardText}>{term.content}</Text>
              </ScrollView>
            </Card>
          ))}
        </ScrollView>

        <View style={styles.allTermsActions}>
          <Button
            title="不同意"
            onPress={onDecline}
            style={[styles.declineButton, styles.actionButton]}
            textStyle={styles.declineButtonText}
          />
          <Button
            title="同意所有條款"
            onPress={handleAgreeToAllTerms}
            style={[styles.agreeButton, styles.actionButton]}
            loading={loading}
          />
        </View>
      </View>
    );
  };

  const renderProgress = () => {
    if (terms.length === 0) return null;

    const progress = ((currentTermIndex + 1) / terms.length) * 100;

    return (
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.progressText}>
          {currentTermIndex + 1} / {terms.length}
        </Text>
      </View>
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>條款同意</Text>
      <TouchableOpacity
        style={styles.closeButton}
        onPress={onClose}
        disabled={forceAgreement}
      >
        <Ionicons name="close" size={24} color={theme.colors.textSecondary} />
      </TouchableOpacity>
    </View>
  );

  if (loading && terms.length === 0) {
    return (
      <Modal visible={visible} transparent animationType="fade">
        <View style={styles.loadingContainer}>
          <Loading size="large" />
          <Text style={styles.loadingText}>正在加載條款...</Text>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        {renderHeader()}

        {renderProgress()}

        <View style={styles.content}>
          {showAllTerms ? renderAllTerms() : renderCurrentTerm()}
        </View>

        {!showAllTerms && terms.length > 1 && (
          <View style={styles.viewAllButton}>
            <Button
              title="查看所有條款"
              onPress={() => setShowAllTerms(true)}
              style={styles.viewAllButtonStyle}
              textStyle={styles.viewAllButtonText}
            />
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)'
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: theme.colors.text
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.surface
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text
  },
  closeButton: {
    padding: 4
  },
  progressContainer: {
    padding: 16,
    backgroundColor: theme.colors.surface
  },
  progressBar: {
    height: 4,
    backgroundColor: theme.colors.border,
    borderRadius: 2,
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary
  },
  progressText: {
    marginTop: 8,
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center'
  },
  content: {
    flex: 1,
    padding: 16
  },
  termContainer: {
    flex: 1
  },
  termHeader: {
    marginBottom: 16
  },
  termTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 4
  },
  termVersion: {
    fontSize: 14,
    color: theme.colors.textSecondary
  },
  termContent: {
    flex: 1,
    marginBottom: 16
  },
  termText: {
    fontSize: 16,
    lineHeight: 24,
    color: theme.colors.text
  },
  termActions: {
    flexDirection: 'row',
    gap: 12
  },
  actionButton: {
    flex: 1
  },
  declineButton: {
    backgroundColor: theme.colors.error
  },
  declineButtonText: {
    color: theme.colors.white
  },
  agreeButton: {
    backgroundColor: theme.colors.primary
  },
  allTermsContainer: {
    flex: 1
  },
  allTermsHeader: {
    marginBottom: 16
  },
  allTermsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 4
  },
  allTermsSubtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary
  },
  allTermsContent: {
    flex: 1,
    marginBottom: 16
  },
  termCard: {
    marginBottom: 16
  },
  termCardHeader: {
    marginBottom: 12
  },
  termCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 4
  },
  termCardVersion: {
    fontSize: 14,
    color: theme.colors.textSecondary
  },
  termCardContent: {
    maxHeight: 200
  },
  termCardText: {
    fontSize: 14,
    lineHeight: 20,
    color: theme.colors.text
  },
  allTermsActions: {
    flexDirection: 'row',
    gap: 12
  },
  viewAllButton: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border
  },
  viewAllButtonStyle: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.primary
  },
  viewAllButtonText: {
    color: theme.colors.primary
  }
});
