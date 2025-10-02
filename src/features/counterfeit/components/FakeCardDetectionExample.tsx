import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { useFakeCardDetection } from '../hooks/useFakeCardDetection';
import type { CounterfeitRisk } from '../types/detection';
import { DetectionMethod } from '../types/detection';

import { DetectionResult } from './DetectionResult';

export const FakeCardDetectionExample: React.FC = () => {
  const {
    currentDetection,
    detectionHistory,
    detectionStats,
    batchDetections,
    loading,
    error,
    selectedMethods,
    reportForm,
    initialize,
    detectCard,
    batchDetect,
    getHistory,
    getStats,
    reportCard,
    setMethods,
    updateForm,
    resetForm,
    clearErrorState,
    utils,
    batchOperations,
  } = useFakeCardDetection();

  const [cardIdInput, setCardIdInput] = useState('pokemon_card_1');
  const [imageUrlInput, setImageUrlInput] = useState(
    'https://example.com/pokemon_card.jpg'
  );
  const [showReportModal, setShowReportModal] = useState(false);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [batchCardIds, setBatchCardIds] = useState(
    'pokemon_card_1,pokemon_card_2,pokemon_card_3'
  );

  useEffect(() => {
    // InitializeService
    initialize();

    // Load初始Data
    loadInitialData();
  }, []);

  const _loadInitialData = async () => {
    await getStats();
    await getHistory();
  };

  const _handleDetection = async () => {
    if (!cardIdInput.trim() || !imageUrlInput.trim()) {
      Alert.alert('Error', '請輸入卡牌ID和圖片URL');
      return;
    }

    await detectCard({
      cardId: cardIdInput,
      imageUrl: imageUrlInput,
      methods: selectedMethods,
      options: {
        highPrecision: true,
        includeFeatureAnalysis: true,
        generateReport: true,
        compareWithDatabase: true,
      },
    });
  };

  const _handleBatchDetection = async () => {
    const _cardIds = batchCardIds
      .split(',')
      .map(id => id.trim())
      .filter(Boolean);
    if (cardIds.length === 0) {
      Alert.alert('Error', '請輸入至少一個卡牌ID');
      return;
    }

    const _imageUrls = cardIds.map(
      (_, index) => `https://example.com/card_${index + 1}.jpg`
    );
    await batchOperations.detectMultiple(cardIds, imageUrls);
    setShowBatchModal(false);
  };

  const _handleMethodToggle = (method: DetectionMethod) => {
    const _newMethods = selectedMethods.includes(method)
      ? selectedMethods.filter(m => m !== method)
      : [...selectedMethods, method];
    setMethods(newMethods);
  };

  const _handleReport = async () => {
    if (!currentDetection) return;

    await reportCard({
      detectionId: currentDetection.id,
      cardId: currentDetection.cardId,
      imageUrl: currentDetection.imageUrl,
      reporterInfo: {
        userId: 'current_user',
        expertise: 'intermediate',
        reputation: 85,
      },
      evidence: {
        description: reportForm.description || '發現可疑特徵',
        additionalImages: reportForm.evidence.additionalImages,
        comparisonImages: reportForm.evidence.comparisonImages,
        references: reportForm.evidence.references,
      },
      severity: reportForm.severity,
      tags: ['user_report', 'suspicious'],
    });

    setShowReportModal(false);
    resetForm();
    Alert.alert('Success', '假卡報告已提交');
  };

  const _formatRiskText = (risk: CounterfeitRisk) => {
    return utils.getRiskText(risk);
  };

  const _formatMethodText = (method: DetectionMethod) => {
    return utils.formatMethod(method);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>假卡檢測系統</Text>
        <Text style={styles.subtitle}>AI驅動的卡牌真偽檢測</Text>
      </View>

      {/* 檢測InputDistrict域 */}
      <View style={styles.inputSection}>
        <Text style={styles.sectionTitle}>開始檢測</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>卡牌ID</Text>
          <TextInput
            style={styles.input}
            value={cardIdInput}
            onChangeText={setCardIdInput}
            placeholder='輸入卡牌ID'
            placeholderTextColor='#999999'
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>圖片URL</Text>
          <TextInput
            style={styles.input}
            value={imageUrlInput}
            onChangeText={setImageUrlInput}
            placeholder='輸入圖片URL'
            placeholderTextColor='#999999'
            multiline
          />
        </View>

        {/* 檢測MethodSelect */}
        <View style={styles.methodsContainer}>
          <Text style={styles.inputLabel}>檢測方法</Text>
          <View style={styles.methodsList}>
            {Object.values(DetectionMethod).map(method => (
              <TouchableOpacity
                key={method}
                style={[
                  styles.methodItem,
                  selectedMethods.includes(method) && styles.methodItemSelected,
                ]}
                onPress={() => handleMethodToggle(method)}
              >
                <Text
                  style={[
                    styles.methodText,
                    selectedMethods.includes(method) &&
                      styles.methodTextSelected,
                  ]}
                >
                  {formatMethodText(method)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.detectButton, loading && styles.disabledButton]}
            onPress={handleDetection}
            disabled={loading}
          >
            <Ionicons name='scan' size={20} color='#FFFFFF' />
            <Text style={styles.detectButtonText}>
              {loading ? '檢測中...' : '開始檢測'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.batchButton}
            onPress={() => setShowBatchModal(true)}
          >
            <Ionicons name='layers' size={20} color='#007AFF' />
            <Text style={styles.batchButtonText}>批量檢測</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 檢測結果 */}
      <DetectionResult
        result={currentDetection}
        loading={loading}
        onRetest={handleDetection}
        onReport={() => setShowReportModal(true)}
        showDetails={true}
      />

      {/* Statistics概覽 */}
      {detectionStats && (
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>系統統計</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {detectionStats.totalDetections}
              </Text>
              <Text style={styles.statLabel}>總檢測數</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: '#4CAF50' }]}>
                {detectionStats.authenticCards}
              </Text>
              <Text style={styles.statLabel}>真品</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: '#FF9800' }]}>
                {detectionStats.suspiciousCards}
              </Text>
              <Text style={styles.statLabel}>可疑</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: '#F44336' }]}>
                {detectionStats.fakeCards}
              </Text>
              <Text style={styles.statLabel}>假卡</Text>
            </View>
          </View>

          <View style={styles.accuracyContainer}>
            <Text style={styles.accuracyTitle}>檢測準確率</Text>
            <View style={styles.accuracyBar}>
              <View
                style={[
                  styles.accuracyFill,
                  { width: detectionStats.accuracyMetrics.precision * 100 },
                ]}
              />
            </View>
            <Text style={styles.accuracyText}>
              {(detectionStats.accuracyMetrics.precision * 100).toFixed(1)}%
              精確度
            </Text>
          </View>
        </View>
      )}

      {/* Batch檢測結果 */}
      {batchDetections.results.length > 0 && (
        <View style={styles.batchResultsSection}>
          <Text style={styles.sectionTitle}>批量檢測結果</Text>
          {batchDetections.results.map((result, index) => (
            <View key={index} style={styles.batchResultItem}>
              <View style={styles.batchResultHeader}>
                <Text style={styles.batchResultCardId}>{result.cardId}</Text>
                <View
                  style={[
                    styles.batchResultRisk,
                    { backgroundColor: utils.getRiskColor(result.overallRisk) },
                  ]}
                >
                  <Text style={styles.batchResultRiskText}>
                    {formatRiskText(result.overallRisk)}
                  </Text>
                </View>
              </View>
              <Text style={styles.batchResultSummary}>{result.summary}</Text>
            </View>
          ))}
        </View>
      )}

      {/* 檢測歷史 */}
      {detectionHistory.length > 0 && (
        <View style={styles.historySection}>
          <Text style={styles.sectionTitle}>檢測歷史</Text>
          {detectionHistory.slice(0, 5).map((history, index) => (
            <View key={index} style={styles.historyItem}>
              <View style={styles.historyHeader}>
                <Text style={styles.historyCardId}>{history.cardId}</Text>
                <Text style={styles.historyDate}>
                  {new Date(history.createdAt).toLocaleDateString('zh-TW')}
                </Text>
              </View>
              <View style={styles.historyResult}>
                <Ionicons
                  name={utils.getRiskIcon(history.result.overallRisk) as any}
                  size={16}
                  color={utils.getRiskColor(history.result.overallRisk)}
                />
                <Text style={styles.historyRiskText}>
                  {formatRiskText(history.result.overallRisk)}
                </Text>
              </View>
              {history.notes && (
                <Text style={styles.historyNotes}>{history.notes}</Text>
              )}
            </View>
          ))}
        </View>
      )}

      {/* ErrorShow */}
      {error && (
        <View style={styles.errorContainer}>
          <Ionicons name='alert-circle' size={24} color='#F44336' />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={clearErrorState}>
            <Text style={styles.errorDismiss}>關閉</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Report模態框 */}
      <Modal
        visible={showReportModal}
        animationType='slide'
        presentationStyle='pageSheet'
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>報告假卡</Text>
            <TouchableOpacity onPress={() => setShowReportModal(false)}>
              <Ionicons name='close' size={24} color='#666666' />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.modalInputContainer}>
              <Text style={styles.modalInputLabel}>問題描述</Text>
              <TextInput
                style={styles.modalTextArea}
                value={reportForm.description}
                onChangeText={text => updateForm({ description: text })}
                placeholder='請描述發現的問題...'
                multiline
                numberOfLines={4}
              />
            </View>

            <View style={styles.modalInputContainer}>
              <Text style={styles.modalInputLabel}>嚴重程度</Text>
              <View style={styles.severityButtons}>
                {['low', 'medium', 'high', 'critical'].map(severity => (
                  <TouchableOpacity
                    key={severity}
                    style={[
                      styles.severityButton,
                      reportForm.severity === severity &&
                        styles.severityButtonSelected,
                    ]}
                    onPress={() => updateForm({ severity: severity as any })}
                  >
                    <Text
                      style={[
                        styles.severityButtonText,
                        reportForm.severity === severity &&
                          styles.severityButtonTextSelected,
                      ]}
                    >
                      {severity === 'low' && '低'}
                      {severity === 'medium' && '中'}
                      {severity === 'high' && '高'}
                      {severity === 'critical' && '嚴重'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => setShowReportModal(false)}
            >
              <Text style={styles.modalCancelText}>取消</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalSubmitButton}
              onPress={handleReport}
            >
              <Text style={styles.modalSubmitText}>提交報告</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Batch檢測模態框 */}
      <Modal
        visible={showBatchModal}
        animationType='slide'
        presentationStyle='pageSheet'
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>批量檢測</Text>
            <TouchableOpacity onPress={() => setShowBatchModal(false)}>
              <Ionicons name='close' size={24} color='#666666' />
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <Text style={styles.modalInputLabel}>卡牌ID列表（用逗號分隔）</Text>
            <TextInput
              style={styles.modalTextArea}
              value={batchCardIds}
              onChangeText={setBatchCardIds}
              placeholder='pokemon_card_1,pokemon_card_2,pokemon_card_3'
              multiline
              numberOfLines={4}
            />

            {batchDetections.isProcessing && (
              <View style={styles.progressContainer}>
                <Text style={styles.progressText}>
                  檢測進度: {batchDetections.progress}/{batchDetections.total}
                </Text>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${utils.batchProgress}%` },
                    ]}
                  />
                </View>
              </View>
            )}
          </View>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => setShowBatchModal(false)}
            >
              <Text style={styles.modalCancelText}>取消</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.modalSubmitButton,
                batchDetections.isProcessing && styles.disabledButton,
              ]}
              onPress={handleBatchDetection}
              disabled={batchDetections.isProcessing}
            >
              <Text style={styles.modalSubmitText}>
                {batchDetections.isProcessing ? '檢測中...' : '開始檢測'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const _styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#2E7D32',
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#C8E6C9',
  },
  inputSection: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#000000',
  },
  methodsContainer: {
    marginBottom: 16,
  },
  methodsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  methodItem: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
  },
  methodItemSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  methodText: {
    fontSize: 12,
    color: '#666666',
  },
  methodTextSelected: {
    color: '#FFFFFF',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  detectButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2E7D32',
    paddingVertical: 14,
    borderRadius: 8,
  },
  detectButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: 8,
  },
  batchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 8,
  },
  batchButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
    marginLeft: 8,
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
  },
  statsSection: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666666',
  },
  accuracyContainer: {
    marginTop: 16,
  },
  accuracyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  accuracyBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    marginBottom: 8,
  },
  accuracyFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  accuracyText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
  },
  batchResultsSection: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  batchResultItem: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  batchResultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  batchResultCardId: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  batchResultRisk: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  batchResultRiskText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  batchResultSummary: {
    fontSize: 14,
    color: '#666666',
  },
  historySection: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  historyItem: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  historyCardId: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  historyDate: {
    fontSize: 12,
    color: '#666666',
  },
  historyResult: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  historyRiskText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  historyNotes: {
    fontSize: 12,
    color: '#999999',
    fontStyle: 'italic',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    margin: 16,
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#F44336',
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    color: '#D32F2F',
    marginLeft: 8,
  },
  errorDismiss: {
    fontSize: 14,
    color: '#F44336',
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  modalInputContainer: {
    marginBottom: 20,
  },
  modalInputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  modalTextArea: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#000000',
    textAlignVertical: 'top',
  },
  severityButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  severityButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
  },
  severityButtonSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  severityButtonText: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },
  severityButtonTextSelected: {
    color: '#FFFFFF',
  },
  modalActions: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
  modalCancelText: {
    fontSize: 16,
    color: '#666666',
    fontWeight: '600',
  },
  modalSubmitButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: '#2E7D32',
    borderRadius: 8,
  },
  modalSubmitText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  progressContainer: {
    marginTop: 20,
  },
  progressText: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 4,
  },
});
