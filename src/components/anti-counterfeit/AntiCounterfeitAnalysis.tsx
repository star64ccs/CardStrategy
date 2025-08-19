import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Dimensions,
  Animated
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { ProgressBar } from '../common/ProgressBar';
import { Modal } from '../common/Modal';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { antiCounterfeitService, CounterfeitAnalysis } from '../../services/antiCounterfeitService';
import { logger } from '../../utils/logger';
import { theme } from '../../theme/designSystem';

const { width: screenWidth } = Dimensions.get('window');

interface AntiCounterfeitAnalysisProps {
  onAnalysisComplete?: (result: CounterfeitAnalysis) => void;
  onClose?: () => void;
}

export const AntiCounterfeitAnalysis: React.FC<AntiCounterfeitAnalysisProps> = ({
  onAnalysisComplete,
  onClose
}) => {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<CounterfeitAnalysis | null>(null);
  const [currentStep, setCurrentStep] = useState<'select' | 'analyzing' | 'complete'>('select');
  const [error, setError] = useState<string | null>(null);
  const [showReport, setShowReport] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  const selectImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permissionResult.granted === false) {
        Alert.alert('權限錯誤', '需要相冊權限來選擇圖片');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8
      });

      if (!result.canceled && result.assets[0]) {
        setImageUri(result.assets[0].uri);
        setError(null);
        setCurrentStep('select');
      }
    } catch (error: any) {
      logger.error('選擇圖片失敗:', { error: error.message });
      Alert.alert('錯誤', '選擇圖片失敗');
    }
  };

  const takePhoto = async () => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

      if (permissionResult.granted === false) {
        Alert.alert('權限錯誤', '需要相機權限來拍攝圖片');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8
      });

      if (!result.canceled && result.assets[0]) {
        setImageUri(result.assets[0].uri);
        setError(null);
        setCurrentStep('select');
      }
    } catch (error: any) {
      logger.error('拍攝圖片失敗:', { error: error.message });
      Alert.alert('錯誤', '拍攝圖片失敗');
    }
  };

  const startAnalysis = async () => {
    if (!imageUri) {
      Alert.alert('錯誤', '請先選擇卡片圖片');
      return;
    }

    try {
      setIsAnalyzing(true);
      setError(null);
      setCurrentStep('analyzing');

      // 轉換圖片為base64
      const base64Image = await convertImageToBase64(imageUri);

      // 執行防偽檢測
      const result = await antiCounterfeitService.detectCounterfeit(base64Image, {
        cardId: 'unknown',
        cardName: 'Unknown Card',
        cardType: 'Unknown',
        set: 'Unknown Set'
      });

      setAnalysisResult(result);
      setCurrentStep('complete');

      if (onAnalysisComplete) {
        onAnalysisComplete(result);
      }

      logger.info('防偽檢測完成', {
        isCounterfeit: result.isCounterfeit,
        confidence: result.confidence,
        riskLevel: result.riskLevel
      });

    } catch (error: any) {
      setError(error.message);
      logger.error('防偽檢測失敗:', { error: error.message });
      Alert.alert('分析失敗', error.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const convertImageToBase64 = async (uri: string): Promise<string> => {
    const response = await fetch(uri);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        resolve(base64.split(',')[1]); // 移除 data:image/jpeg;base64, 前綴
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return theme.colors.success;
      case 'medium': return theme.colors.warning;
      case 'high': return theme.colors.error;
      case 'critical': return theme.colors.error;
      default: return theme.colors.text.secondary;
    }
  };

  const getRiskLevelText = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return '低風險';
      case 'medium': return '中風險';
      case 'high': return '高風險';
      case 'critical': return '極高風險';
      default: return '未知';
    }
  };

  const renderAnalysisSteps = () => {
    const steps = [
      { key: 'print', label: '印刷質量分析', icon: 'print' },
      { key: 'material', label: '材質分析', icon: 'layers' },
      { key: 'color', label: '顏色分析', icon: 'color-palette' },
      { key: 'font', label: '字體分析', icon: 'text' },
      { key: 'hologram', label: '全息圖分析', icon: 'sparkles' },
      { key: 'database', label: '數據庫比對', icon: 'server' }
    ];

    return (
      <View style={styles.stepsContainer}>
        {steps.map((step, index) => (
          <View key={step.key} style={styles.stepItem}>
            <View style={styles.stepIcon}>
              <Ionicons name={step.icon as any} size={20} color={theme.colors.gold.primary} />
            </View>
            <Text style={styles.stepLabel}>{step.label}</Text>
            {isAnalyzing && (
              <ActivityIndicator size="small" color={theme.colors.gold.primary} />
            )}
          </View>
        ))}
      </View>
    );
  };

  const renderAnalysisResult = () => {
    if (!analysisResult) return null;

    return (
      <ScrollView style={styles.resultContainer} showsVerticalScrollIndicator={false}>
        {/* 主要結果 */}
        <Card style={styles.mainResultCard}>
          <View style={styles.resultHeader}>
            <Ionicons
              name={analysisResult.isCounterfeit ? 'warning' : 'checkmark-circle'}
              size={32}
              color={analysisResult.isCounterfeit ? theme.colors.error : theme.colors.success}
            />
            <Text style={styles.resultTitle}>
              {analysisResult.isCounterfeit ? '檢測到假卡' : '卡片真偽驗證通過'}
            </Text>
          </View>

          <View style={styles.confidenceContainer}>
            <Text style={styles.confidenceLabel}>可信度評分</Text>
            <ProgressBar
              progress={analysisResult.confidence}
              variant={analysisResult.confidence >= 80 ? 'success' : analysisResult.confidence >= 60 ? 'warning' : 'error'}
              size="large"
              showLabel
            />
          </View>

          <View style={styles.riskLevelContainer}>
            <Text style={styles.riskLevelLabel}>風險等級</Text>
            <Badge
              text={getRiskLevelText(analysisResult.riskLevel)}
              variant={analysisResult.riskLevel === 'low' ? 'success' : analysisResult.riskLevel === 'medium' ? 'warning' : 'error'}
              size="large"
            />
          </View>
        </Card>

        {/* 詳細分析 */}
        <Card style={styles.detailCard}>
          <Text style={styles.detailTitle}>詳細分析結果</Text>

          <View style={styles.analysisGrid}>
            <View style={styles.analysisItem}>
              <Text style={styles.analysisLabel}>印刷質量</Text>
              <ProgressBar progress={analysisResult.analysisDetails.printQuality.overallScore} size="small" />
              <Text style={styles.analysisScore}>{analysisResult.analysisDetails.printQuality.overallScore}%</Text>
            </View>

            <View style={styles.analysisItem}>
              <Text style={styles.analysisLabel}>材質分析</Text>
              <ProgressBar progress={analysisResult.analysisDetails.material.overallScore} size="small" />
              <Text style={styles.analysisScore}>{analysisResult.analysisDetails.material.overallScore}%</Text>
            </View>

            <View style={styles.analysisItem}>
              <Text style={styles.analysisLabel}>顏色分析</Text>
              <ProgressBar progress={analysisResult.analysisDetails.color.overallScore} size="small" />
              <Text style={styles.analysisScore}>{analysisResult.analysisDetails.color.overallScore}%</Text>
            </View>

            <View style={styles.analysisItem}>
              <Text style={styles.analysisLabel}>字體分析</Text>
              <ProgressBar progress={analysisResult.analysisDetails.font.overallScore} size="small" />
              <Text style={styles.analysisScore}>{analysisResult.analysisDetails.font.overallScore}%</Text>
            </View>

            <View style={styles.analysisItem}>
              <Text style={styles.analysisLabel}>全息圖</Text>
              <ProgressBar progress={analysisResult.analysisDetails.hologram.overallScore} size="small" />
              <Text style={styles.analysisScore}>{analysisResult.analysisDetails.hologram.overallScore}%</Text>
            </View>

            <View style={styles.analysisItem}>
              <Text style={styles.analysisLabel}>數據庫比對</Text>
              <ProgressBar progress={analysisResult.analysisDetails.databaseMatch.overallScore} size="small" />
              <Text style={styles.analysisScore}>{analysisResult.analysisDetails.databaseMatch.overallScore}%</Text>
            </View>
          </View>
        </Card>

        {/* 異常點 */}
        {analysisResult.anomalies.length > 0 && (
          <Card style={styles.anomaliesCard}>
            <Text style={styles.anomaliesTitle}>檢測到的異常點</Text>
            {analysisResult.anomalies.map((anomaly, index) => (
              <View key={index} style={styles.anomalyItem}>
                <View style={styles.anomalyHeader}>
                  <Ionicons
                    name="alert-circle"
                    size={20}
                    color={anomaly.severity === 'critical' ? theme.colors.error : theme.colors.warning}
                  />
                  <Text style={styles.anomalyType}>{anomaly.type.toUpperCase()}</Text>
                  <Badge
                    text={anomaly.severity === 'critical' ? '嚴重' : anomaly.severity === 'high' ? '高' : '中'}
                    variant={anomaly.severity === 'critical' ? 'error' : 'warning'}
                    size="small"
                  />
                </View>
                <Text style={styles.anomalyDescription}>{anomaly.description}</Text>
                <Text style={styles.anomalyLocation}>位置: {anomaly.location}</Text>
              </View>
            ))}
          </Card>
        )}

        {/* 建議 */}
        <Card style={styles.recommendationsCard}>
          <Text style={styles.recommendationsTitle}>建議</Text>
          {analysisResult.recommendations.map((recommendation, index) => (
            <View key={index} style={styles.recommendationItem}>
              <Ionicons name="bulb" size={16} color={theme.colors.gold.primary} />
              <Text style={styles.recommendationText}>{recommendation}</Text>
            </View>
          ))}
        </Card>

        {/* 處理時間 */}
        <Card style={styles.metadataCard}>
          <Text style={styles.metadataTitle}>分析信息</Text>
          <View style={styles.metadataGrid}>
            <View style={styles.metadataItem}>
              <Text style={styles.metadataLabel}>處理時間</Text>
              <Text style={styles.metadataValue}>{analysisResult.processingTime}ms</Text>
            </View>
            <View style={styles.metadataItem}>
              <Text style={styles.metadataLabel}>分析方法</Text>
              <Text style={styles.metadataValue}>{analysisResult.metadata.analysisMethod}</Text>
            </View>
            <View style={styles.metadataItem}>
              <Text style={styles.metadataLabel}>模型版本</Text>
              <Text style={styles.metadataValue}>{analysisResult.metadata.modelVersion}</Text>
            </View>
            <View style={styles.metadataItem}>
              <Text style={styles.metadataLabel}>分析時間</Text>
              <Text style={styles.metadataValue}>
                {analysisResult.timestamp.toLocaleString('zh-TW')}
              </Text>
            </View>
          </View>
        </Card>
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      {/* 標題 */}
      <View style={styles.header}>
        <Text style={styles.title}>防偽判斷分析</Text>
        <Text style={styles.subtitle}>AI 驅動的多維度防偽檢測</Text>
      </View>

      {/* 內容區域 */}
      <View style={styles.content}>
        {currentStep === 'select' && (
          <View style={styles.selectContainer}>
            {imageUri ? (
              <View style={styles.imagePreviewContainer}>
                <View style={styles.imagePreview}>
                  <Ionicons name="image" size={48} color={theme.colors.gold.primary} />
                  <Text style={styles.imagePreviewText}>已選擇圖片</Text>
                </View>
                <Button
                  title="開始分析"
                  onPress={startAnalysis}
                  variant="primary"
                  size="large"
                  style={styles.analyzeButton}
                />
                <Button
                  title="重新選擇"
                  onPress={() => setImageUri(null)}
                  variant="secondary"
                  size="medium"
                />
              </View>
            ) : (
              <View style={styles.imageSelectionContainer}>
                <Text style={styles.selectionTitle}>選擇卡片圖片</Text>
                <Text style={styles.selectionSubtitle}>
                  請選擇清晰的卡片正面圖片進行防偽分析
                </Text>

                <View style={styles.selectionButtons}>
                  <TouchableOpacity style={styles.selectionButton} onPress={takePhoto}>
                    <Ionicons name="camera" size={32} color={theme.colors.gold.primary} />
                    <Text style={styles.selectionButtonText}>拍攝照片</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.selectionButton} onPress={selectImage}>
                    <Ionicons name="images" size={32} color={theme.colors.gold.primary} />
                    <Text style={styles.selectionButtonText}>從相冊選擇</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        )}

        {currentStep === 'analyzing' && (
          <View style={styles.analyzingContainer}>
            <LoadingSpinner size="large" variant="spinner" />
            <Text style={styles.analyzingTitle}>正在進行防偽分析...</Text>
            <Text style={styles.analyzingSubtitle}>請稍候，AI 正在進行多維度檢測</Text>
            {renderAnalysisSteps()}
          </View>
        )}

        {currentStep === 'complete' && (
          <View style={styles.completeContainer}>
            {renderAnalysisResult()}
          </View>
        )}

        {error && (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={24} color={theme.colors.error} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
      </View>

      {/* 底部按鈕 */}
      <View style={styles.footer}>
        {currentStep === 'complete' && analysisResult && (
          <View style={styles.actionButtons}>
            <Button
              title="生成報告"
              onPress={() => setShowReport(true)}
              variant="primary"
              size="medium"
            />
            <Button
              title="重新分析"
              onPress={() => {
                setAnalysisResult(null);
                setCurrentStep('select');
              }}
              variant="secondary"
              size="medium"
            />
          </View>
        )}

        <Button
          title="關閉"
          onPress={onClose}
          variant="outline"
          size="medium"
        />
      </View>

      {/* 報告模態框 */}
      <Modal
        visible={showReport}
        onClose={() => setShowReport(false)}
        title="防偽檢測報告"
        size="large"
      >
        <ScrollView style={styles.reportContainer}>
          <Text style={styles.reportText}>
            這裡將顯示詳細的防偽檢測報告...
          </Text>
        </ScrollView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary
  },
  header: {
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.primary
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginBottom: 4
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.text.secondary
  },
  content: {
    flex: 1,
    padding: 20
  },
  selectContainer: {
    flex: 1,
    justifyContent: 'center'
  },
  imageSelectionContainer: {
    alignItems: 'center'
  },
  selectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginBottom: 8
  },
  selectionSubtitle: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: 32
  },
  selectionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%'
  },
  selectionButton: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: theme.colors.background.secondary,
    borderRadius: 12,
    minWidth: 120
  },
  selectionButtonText: {
    marginTop: 8,
    fontSize: 14,
    color: theme.colors.text.primary
  },
  imagePreviewContainer: {
    alignItems: 'center'
  },
  imagePreview: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: theme.colors.background.secondary,
    borderRadius: 12,
    marginBottom: 20
  },
  imagePreviewText: {
    marginTop: 8,
    fontSize: 16,
    color: theme.colors.text.primary
  },
  analyzeButton: {
    marginBottom: 12
  },
  analyzingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  analyzingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginTop: 20,
    marginBottom: 8
  },
  analyzingSubtitle: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: 32
  },
  stepsContainer: {
    width: '100%'
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: theme.colors.background.secondary,
    borderRadius: 8,
    marginBottom: 8
  },
  stepIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  stepLabel: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.text.primary
  },
  completeContainer: {
    flex: 1
  },
  resultContainer: {
    flex: 1
  },
  mainResultCard: {
    marginBottom: 16
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginLeft: 12
  },
  confidenceContainer: {
    marginBottom: 16
  },
  confidenceLabel: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginBottom: 8
  },
  riskLevelContainer: {
    alignItems: 'center'
  },
  riskLevelLabel: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginBottom: 8
  },
  detailCard: {
    marginBottom: 16
  },
  detailTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginBottom: 16
  },
  analysisGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  },
  analysisItem: {
    width: '48%',
    marginBottom: 16
  },
  analysisLabel: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    marginBottom: 4
  },
  analysisScore: {
    fontSize: 12,
    color: theme.colors.text.primary,
    marginTop: 4,
    textAlign: 'center'
  },
  anomaliesCard: {
    marginBottom: 16
  },
  anomaliesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginBottom: 16
  },
  anomalyItem: {
    marginBottom: 12,
    padding: 12,
    backgroundColor: theme.colors.background.secondary,
    borderRadius: 8
  },
  anomalyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  anomalyType: {
    flex: 1,
    fontSize: 12,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginLeft: 8
  },
  anomalyDescription: {
    fontSize: 14,
    color: theme.colors.text.primary,
    marginBottom: 4
  },
  anomalyLocation: {
    fontSize: 12,
    color: theme.colors.text.secondary
  },
  recommendationsCard: {
    marginBottom: 16
  },
  recommendationsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginBottom: 16
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8
  },
  recommendationText: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.text.primary,
    marginLeft: 8
  },
  metadataCard: {
    marginBottom: 16
  },
  metadataTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginBottom: 16
  },
  metadataGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  metadataItem: {
    width: '50%',
    marginBottom: 12
  },
  metadataLabel: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    marginBottom: 4
  },
  metadataValue: {
    fontSize: 14,
    color: theme.colors.text.primary
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: `${theme.colors.error  }20`,
    borderRadius: 8,
    marginTop: 16
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.error,
    marginLeft: 8
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.primary
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12
  },
  reportContainer: {
    maxHeight: 400
  },
  reportText: {
    fontSize: 14,
    color: theme.colors.text.primary
  }
});
