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
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { ProgressBar } from '../common/ProgressBar';
import { Modal } from '../common/Modal';
import { LoadingSpinner } from '../common/LoadingSpinner';
import {
  simulatedGradingService,
  GradingResult,
  GradingAgency,
} from '../../services/simulatedGradingService';
import { logger } from '../../utils/logger';
import { theme } from '../../theme/designSystem';

const { width: screenWidth } = Dimensions.get('window');

interface SimulatedGradingAnalysisProps {
  onGradingComplete?: (result: GradingResult) => void;
  onClose?: () => void;
}

export const SimulatedGradingAnalysis: React.FC<
  SimulatedGradingAnalysisProps
> = ({ onGradingComplete, onClose }) => {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isGrading, setIsGrading] = useState(false);
  const [gradingResult, setGradingResult] = useState<GradingResult | null>(
    null
  );
  const [currentStep, setCurrentStep] = useState<
    'select' | 'grading' | 'complete'
  >('select');
  const [selectedAgency, setSelectedAgency] = useState<GradingAgency>('PSA');
  const [error, setError] = useState<string | null>(null);
  const [showReport, setShowReport] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  const selectImage = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permissionResult.granted === false) {
        Alert.alert('權限錯誤', '需要相冊權限來選擇圖片');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
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
      const permissionResult =
        await ImagePicker.requestCameraPermissionsAsync();

      if (permissionResult.granted === false) {
        Alert.alert('權限錯誤', '需要相機權限來拍攝圖片');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
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

  const startGrading = async () => {
    if (!imageUri) {
      Alert.alert('錯誤', '請先選擇卡片圖片');
      return;
    }

    try {
      setIsGrading(true);
      setError(null);
      setCurrentStep('grading');

      // 轉換圖片為base64
      const base64Image = await convertImageToBase64(imageUri);

      // 執行模擬鑑定
      const result = await simulatedGradingService.gradeCard(
        base64Image,
        {
          cardId: 'unknown',
          cardName: 'Unknown Card',
          cardType: 'Unknown',
          set: 'Unknown Set',
        },
        selectedAgency
      );

      setGradingResult(result);
      setCurrentStep('complete');

      if (onGradingComplete) {
        onGradingComplete(result);
      }

      logger.info('模擬鑑定完成', {
        agency: result.agency,
        overallGrade: result.overallGrade,
        confidence: result.confidence,
      });
    } catch (error: any) {
      setError(error.message);
      logger.error('模擬鑑定失敗:', { error: error.message });
      Alert.alert('鑑定失敗', error.message);
    } finally {
      setIsGrading(false);
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

  const getGradeColor = (grade: number) => {
    if (grade >= 9) return theme.colors.success;
    if (grade >= 7) return theme.colors.warning;
    if (grade >= 5) return theme.colors.error;
    return theme.colors.text.secondary;
  };

  const getGradeText = (grade: number) => {
    if (grade >= 9) return 'Mint';
    if (grade >= 8) return 'Near Mint';
    if (grade >= 7) return 'Excellent';
    if (grade >= 6) return 'Very Good';
    if (grade >= 5) return 'Good';
    if (grade >= 4) return 'Fair';
    return 'Poor';
  };

  const renderGradingSteps = () => {
    const steps = [
      { key: 'centering', label: '居中度分析', icon: 'resize' },
      { key: 'corners', label: '邊角分析', icon: 'square' },
      { key: 'edges', label: '邊緣分析', icon: 'git-branch' },
      { key: 'surface', label: '表面分析', icon: 'layers' },
    ];

    return (
      <View style={styles.stepsContainer}>
        {steps.map((step, index) => (
          <View key={step.key} style={styles.stepItem}>
            <View style={styles.stepIcon}>
              <Ionicons
                name={step.icon as any}
                size={20}
                color={theme.colors.gold.primary}
              />
            </View>
            <Text style={styles.stepLabel}>{step.label}</Text>
            {isGrading && (
              <ActivityIndicator
                size="small"
                color={theme.colors.gold.primary}
              />
            )}
          </View>
        ))}
      </View>
    );
  };

  const renderGradingResult = () => {
    if (!gradingResult) return null;

    return (
      <ScrollView
        style={styles.resultContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* 主要結果 */}
        <Card style={styles.mainResultCard}>
          <View style={styles.resultHeader}>
            <Ionicons
              name="trophy"
              size={32}
              color={getGradeColor(gradingResult.overallGrade)}
            />
            <Text style={styles.resultTitle}>
              {gradingResult.agency} 鑑定結果
            </Text>
          </View>

          <View style={styles.gradeContainer}>
            <Text style={styles.gradeLabel}>總評分</Text>
            <View style={styles.gradeDisplay}>
              <Text
                style={[
                  styles.gradeNumber,
                  { color: getGradeColor(gradingResult.overallGrade) },
                ]}
              >
                {gradingResult.overallGrade}
              </Text>
              <Text style={styles.gradeText}>
                {getGradeText(gradingResult.overallGrade)}
              </Text>
            </View>
          </View>

          <View style={styles.confidenceContainer}>
            <Text style={styles.confidenceLabel}>可信度</Text>
            <ProgressBar
              progress={gradingResult.confidence}
              variant={
                gradingResult.confidence >= 80
                  ? 'success'
                  : gradingResult.confidence >= 60
                    ? 'warning'
                    : 'error'
              }
              size="large"
              showLabel
            />
          </View>

          <View style={styles.serialNumberContainer}>
            <Text style={styles.serialNumberLabel}>序列號</Text>
            <Text style={styles.serialNumber}>
              {gradingResult.serialNumber}
            </Text>
          </View>
        </Card>

        {/* 子評分詳情 */}
        <Card style={styles.detailCard}>
          <Text style={styles.detailTitle}>子評分詳情</Text>

          <View style={styles.subGradesGrid}>
            <View style={styles.subGradeItem}>
              <Text style={styles.subGradeLabel}>居中度</Text>
              <ProgressBar
                progress={gradingResult.subGrades.centering * 10}
                size="small"
              />
              <Text style={styles.subGradeScore}>
                {gradingResult.subGrades.centering}
              </Text>
            </View>

            <View style={styles.subGradeItem}>
              <Text style={styles.subGradeLabel}>邊角</Text>
              <ProgressBar
                progress={gradingResult.subGrades.corners * 10}
                size="small"
              />
              <Text style={styles.subGradeScore}>
                {gradingResult.subGrades.corners}
              </Text>
            </View>

            <View style={styles.subGradeItem}>
              <Text style={styles.subGradeLabel}>邊緣</Text>
              <ProgressBar
                progress={gradingResult.subGrades.edges * 10}
                size="small"
              />
              <Text style={styles.subGradeScore}>
                {gradingResult.subGrades.edges}
              </Text>
            </View>

            <View style={styles.subGradeItem}>
              <Text style={styles.subGradeLabel}>表面</Text>
              <ProgressBar
                progress={gradingResult.subGrades.surface * 10}
                size="small"
              />
              <Text style={styles.subGradeScore}>
                {gradingResult.subGrades.surface}
              </Text>
            </View>
          </View>
        </Card>

        {/* 詳細分析 */}
        <Card style={styles.analysisCard}>
          <Text style={styles.analysisTitle}>詳細分析</Text>

          <View style={styles.analysisItem}>
            <Text style={styles.analysisLabel}>居中度分析</Text>
            <Text style={styles.analysisText}>
              {gradingResult.details.centeringAnalysis}
            </Text>
          </View>

          <View style={styles.analysisItem}>
            <Text style={styles.analysisLabel}>邊角分析</Text>
            <Text style={styles.analysisText}>
              {gradingResult.details.cornersAnalysis}
            </Text>
          </View>

          <View style={styles.analysisItem}>
            <Text style={styles.analysisLabel}>邊緣分析</Text>
            <Text style={styles.analysisText}>
              {gradingResult.details.edgesAnalysis}
            </Text>
          </View>

          <View style={styles.analysisItem}>
            <Text style={styles.analysisLabel}>表面分析</Text>
            <Text style={styles.analysisText}>
              {gradingResult.details.surfaceAnalysis}
            </Text>
          </View>

          <View style={styles.analysisItem}>
            <Text style={styles.analysisLabel}>總體分析</Text>
            <Text style={styles.analysisText}>
              {gradingResult.details.overallAnalysis}
            </Text>
          </View>
        </Card>

        {/* 估算價值 */}
        <Card style={styles.valueCard}>
          <Text style={styles.valueTitle}>估算價值</Text>
          <View style={styles.valueGrid}>
            <View style={styles.valueItem}>
              <Text style={styles.valueLabel}>最低價值</Text>
              <Text style={styles.valueAmount}>
                ${gradingResult.estimatedValue.min.toFixed(2)}
              </Text>
            </View>
            <View style={styles.valueItem}>
              <Text style={styles.valueLabel}>平均價值</Text>
              <Text style={styles.valueAmount}>
                ${gradingResult.estimatedValue.average.toFixed(2)}
              </Text>
            </View>
            <View style={styles.valueItem}>
              <Text style={styles.valueLabel}>最高價值</Text>
              <Text style={styles.valueAmount}>
                ${gradingResult.estimatedValue.max.toFixed(2)}
              </Text>
            </View>
          </View>
        </Card>

        {/* 建議 */}
        <Card style={styles.recommendationsCard}>
          <Text style={styles.recommendationsTitle}>建議</Text>
          {gradingResult.recommendations.map((recommendation, index) => (
            <View key={index} style={styles.recommendationItem}>
              <Ionicons
                name="bulb"
                size={16}
                color={theme.colors.gold.primary}
              />
              <Text style={styles.recommendationText}>{recommendation}</Text>
            </View>
          ))}
        </Card>

        {/* 鑑定信息 */}
        <Card style={styles.metadataCard}>
          <Text style={styles.metadataTitle}>鑑定信息</Text>
          <View style={styles.metadataGrid}>
            <View style={styles.metadataItem}>
              <Text style={styles.metadataLabel}>鑑定機構</Text>
              <Text style={styles.metadataValue}>{gradingResult.agency}</Text>
            </View>
            <View style={styles.metadataItem}>
              <Text style={styles.metadataLabel}>鑑定方法</Text>
              <Text style={styles.metadataValue}>
                {gradingResult.metadata.gradingMethod}
              </Text>
            </View>
            <View style={styles.metadataItem}>
              <Text style={styles.metadataLabel}>模型版本</Text>
              <Text style={styles.metadataValue}>
                {gradingResult.metadata.modelVersion}
              </Text>
            </View>
            <View style={styles.metadataItem}>
              <Text style={styles.metadataLabel}>處理時間</Text>
              <Text style={styles.metadataValue}>
                {gradingResult.processingTime}ms
              </Text>
            </View>
            <View style={styles.metadataItem}>
              <Text style={styles.metadataLabel}>鑑定日期</Text>
              <Text style={styles.metadataValue}>
                {gradingResult.gradingDate.toLocaleString('zh-TW')}
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
        <Text style={styles.title}>模擬鑑定分析</Text>
        <Text style={styles.subtitle}>專業級卡片鑑定服務</Text>
      </View>

      {/* 內容區域 */}
      <View style={styles.content}>
        {currentStep === 'select' && (
          <View style={styles.selectContainer}>
            {/* 機構選擇 */}
            <Card style={styles.agencyCard}>
              <Text style={styles.agencyTitle}>選擇鑑定機構</Text>
              <View style={styles.agencyOptions}>
                <TouchableOpacity
                  style={[
                    styles.agencyOption,
                    selectedAgency === 'PSA' && styles.agencyOptionSelected,
                  ]}
                  onPress={() => setSelectedAgency('PSA')}
                >
                  <Text
                    style={[
                      styles.agencyText,
                      selectedAgency === 'PSA' && styles.agencyTextSelected,
                    ]}
                  >
                    PSA
                  </Text>
                  <Text style={styles.agencyDescription}>
                    Professional Sports Authenticator
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.agencyOption,
                    selectedAgency === 'BGS' && styles.agencyOptionSelected,
                  ]}
                  onPress={() => setSelectedAgency('BGS')}
                >
                  <Text
                    style={[
                      styles.agencyText,
                      selectedAgency === 'BGS' && styles.agencyTextSelected,
                    ]}
                  >
                    BGS
                  </Text>
                  <Text style={styles.agencyDescription}>
                    Beckett Grading Services
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.agencyOption,
                    selectedAgency === 'CGC' && styles.agencyOptionSelected,
                  ]}
                  onPress={() => setSelectedAgency('CGC')}
                >
                  <Text
                    style={[
                      styles.agencyText,
                      selectedAgency === 'CGC' && styles.agencyTextSelected,
                    ]}
                  >
                    CGC
                  </Text>
                  <Text style={styles.agencyDescription}>
                    Certified Guaranty Company
                  </Text>
                </TouchableOpacity>
              </View>
            </Card>

            {imageUri ? (
              <View style={styles.imagePreviewContainer}>
                <View style={styles.imagePreview}>
                  <Ionicons
                    name="image"
                    size={48}
                    color={theme.colors.gold.primary}
                  />
                  <Text style={styles.imagePreviewText}>已選擇圖片</Text>
                </View>
                <Button
                  title="開始鑑定"
                  onPress={startGrading}
                  variant="primary"
                  size="large"
                  style={styles.gradeButton}
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
                  請選擇清晰的卡片正面圖片進行專業鑑定
                </Text>

                <View style={styles.selectionButtons}>
                  <TouchableOpacity
                    style={styles.selectionButton}
                    onPress={takePhoto}
                  >
                    <Ionicons
                      name="camera"
                      size={32}
                      color={theme.colors.gold.primary}
                    />
                    <Text style={styles.selectionButtonText}>拍攝照片</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.selectionButton}
                    onPress={selectImage}
                  >
                    <Ionicons
                      name="images"
                      size={32}
                      color={theme.colors.gold.primary}
                    />
                    <Text style={styles.selectionButtonText}>從相冊選擇</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        )}

        {currentStep === 'grading' && (
          <View style={styles.gradingContainer}>
            <LoadingSpinner size="large" variant="spinner" />
            <Text style={styles.gradingTitle}>正在進行專業鑑定...</Text>
            <Text style={styles.gradingSubtitle}>
              請稍候，AI 正在進行專業級分析
            </Text>
            {renderGradingSteps()}
          </View>
        )}

        {currentStep === 'complete' && (
          <View style={styles.completeContainer}>{renderGradingResult()}</View>
        )}

        {error && (
          <View style={styles.errorContainer}>
            <Ionicons
              name="alert-circle"
              size={24}
              color={theme.colors.error}
            />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
      </View>

      {/* 底部按鈕 */}
      <View style={styles.footer}>
        {currentStep === 'complete' && gradingResult && (
          <View style={styles.actionButtons}>
            <Button
              title="生成報告"
              onPress={() => setShowReport(true)}
              variant="primary"
              size="medium"
            />
            <Button
              title="分享結果"
              onPress={() => {
                // 實現分享功能
                Alert.alert('分享', '分享功能即將推出');
              }}
              variant="secondary"
              size="medium"
            />
            <Button
              title="重新鑑定"
              onPress={() => {
                setGradingResult(null);
                setCurrentStep('select');
              }}
              variant="outline"
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
        title="鑑定報告"
        size="large"
      >
        <ScrollView style={styles.reportContainer}>
          <Text style={styles.reportText}>這裡將顯示詳細的鑑定報告...</Text>
        </ScrollView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  header: {
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.primary,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  selectContainer: {
    flex: 1,
  },
  agencyCard: {
    marginBottom: 20,
  },
  agencyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginBottom: 16,
  },
  agencyOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  agencyOption: {
    flex: 1,
    padding: 16,
    backgroundColor: theme.colors.background.secondary,
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  agencyOptionSelected: {
    backgroundColor: `${theme.colors.gold.primary}20`,
    borderColor: theme.colors.gold.primary,
    borderWidth: 2,
  },
  agencyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginBottom: 4,
  },
  agencyTextSelected: {
    color: theme.colors.gold.primary,
  },
  agencyDescription: {
    fontSize: 10,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
  imageSelectionContainer: {
    alignItems: 'center',
  },
  selectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginBottom: 8,
  },
  selectionSubtitle: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: 32,
  },
  selectionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  selectionButton: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: theme.colors.background.secondary,
    borderRadius: 12,
    minWidth: 120,
  },
  selectionButtonText: {
    marginTop: 8,
    fontSize: 14,
    color: theme.colors.text.primary,
  },
  imagePreviewContainer: {
    alignItems: 'center',
  },
  imagePreview: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: theme.colors.background.secondary,
    borderRadius: 12,
    marginBottom: 20,
  },
  imagePreviewText: {
    marginTop: 8,
    fontSize: 16,
    color: theme.colors.text.primary,
  },
  gradeButton: {
    marginBottom: 12,
  },
  gradingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginTop: 20,
    marginBottom: 8,
  },
  gradingSubtitle: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: 32,
  },
  stepsContainer: {
    width: '100%',
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: theme.colors.background.secondary,
    borderRadius: 8,
    marginBottom: 8,
  },
  stepIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepLabel: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.text.primary,
  },
  completeContainer: {
    flex: 1,
  },
  resultContainer: {
    flex: 1,
  },
  mainResultCard: {
    marginBottom: 16,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginLeft: 12,
  },
  gradeContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  gradeLabel: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginBottom: 8,
  },
  gradeDisplay: {
    alignItems: 'center',
  },
  gradeNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  gradeText: {
    fontSize: 16,
    color: theme.colors.text.primary,
  },
  confidenceContainer: {
    marginBottom: 16,
  },
  confidenceLabel: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginBottom: 8,
  },
  serialNumberContainer: {
    alignItems: 'center',
  },
  serialNumberLabel: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginBottom: 8,
  },
  serialNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.gold.primary,
  },
  detailCard: {
    marginBottom: 16,
  },
  detailTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginBottom: 16,
  },
  subGradesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  subGradeItem: {
    width: '48%',
    marginBottom: 16,
  },
  subGradeLabel: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    marginBottom: 4,
  },
  subGradeScore: {
    fontSize: 12,
    color: theme.colors.text.primary,
    marginTop: 4,
    textAlign: 'center',
  },
  analysisCard: {
    marginBottom: 16,
  },
  analysisTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginBottom: 16,
  },
  analysisItem: {
    marginBottom: 12,
  },
  analysisLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginBottom: 4,
  },
  analysisText: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    lineHeight: 20,
  },
  valueCard: {
    marginBottom: 16,
  },
  valueTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginBottom: 16,
  },
  valueGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  valueItem: {
    flex: 1,
    alignItems: 'center',
  },
  valueLabel: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    marginBottom: 4,
  },
  valueAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.gold.primary,
  },
  recommendationsCard: {
    marginBottom: 16,
  },
  recommendationsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginBottom: 16,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  recommendationText: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.text.primary,
    marginLeft: 8,
  },
  metadataCard: {
    marginBottom: 16,
  },
  metadataTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginBottom: 16,
  },
  metadataGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  metadataItem: {
    width: '50%',
    marginBottom: 12,
  },
  metadataLabel: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    marginBottom: 4,
  },
  metadataValue: {
    fontSize: 14,
    color: theme.colors.text.primary,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: `${theme.colors.error}20`,
    borderRadius: 8,
    marginTop: 16,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.error,
    marginLeft: 8,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.primary,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  reportContainer: {
    maxHeight: 400,
  },
  reportText: {
    fontSize: 14,
    color: theme.colors.text.primary,
  },
});
