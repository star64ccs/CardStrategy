import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Share,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import {
  simulatedGradingService,
  GradingReport,
} from '../services/simulatedGradingService';
import { logger } from '../utils/logger';
import { formatCurrency } from '../utils/formatters';

interface GradingReportScreenProps {
  navigation: any;
  route: {
    params: {
      report?: GradingReport;
      gradingNumber?: string;
    };
  };
}

export const GradingReportScreen: React.FC<GradingReportScreenProps> = ({
  navigation,
  route,
}) => {
  const { colors } = useTheme();
  const { t } = useTranslation();

  const [report, setReport] = useState<GradingReport | null>(
    route.params.report || null
  );
  const [isLoading, setIsLoading] = useState(!route.params.report);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (route.params.gradingNumber && !route.params.report) {
      loadGradingReport(route.params.gradingNumber);
    }
  }, [route.params.gradingNumber]);

  const loadGradingReport = async (gradingNumber: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response =
        await simulatedGradingService.getGradingReport(gradingNumber);
      setReport(response.data);
    } catch (error: any) {
      setError(error.message || '載入鑑定報告失敗');
      logger.error('載入鑑定報告失敗:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = async () => {
    if (!report) return;

    try {
      await Share.share({
        message: `查看我的卡牌鑑定報告！\n\n卡牌: ${report.cardInfo.name}\n鑑定機構: ${report.agency}\n鑑定編號: ${report.gradingNumber}\n等級: ${report.gradingResult.overallGrade}\n\n${report.shareUrl}`,
        title: '卡牌鑑定報告',
      });
    } catch (error) {
      logger.error('分享失敗:', error);
    }
  };

  const getGradeColor = (grade: string) => {
    const gradeNum = parseFloat(grade);
    if (gradeNum >= 9) return '#4CAF50'; // 綠色 - 優秀
    if (gradeNum >= 7) return '#FF9800'; // 橙色 - 良好
    if (gradeNum >= 5) return '#FFC107'; // 黃色 - 一般
    return '#F44336'; // 紅色 - 較差
  };

  const getAgencyColor = (agency: string) => {
    switch (agency) {
      case 'PSA':
        return '#2196F3';
      case 'BGS':
        return '#FF5722';
      case 'CGC':
        return '#9C27B0';
      default:
        return colors.primary;
    }
  };

  const renderGradeBadge = () => {
    if (!report) return null;

    const grade = report.gradingResult.overallGrade;
    const color = getGradeColor(grade);

    return (
      <View style={[styles.gradeBadge, { backgroundColor: color }]}>
        <Text style={styles.gradeText}>{grade}</Text>
      </View>
    );
  };

  const renderSubGrades = () => {
    if (!report) return null;

    const { subGrades } = report.gradingResult;
    const subGradeItems = Object.entries(subGrades).map(([key, value]) => ({
      label: getSubGradeLabel(key),
      value: value as number,
      color: getGradeColor(value.toString()),
    }));

    return (
      <Card style={styles.subGradesCard}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          子評分
        </Text>
        <View style={styles.subGradesGrid}>
          {subGradeItems.map((item, index) => (
            <View key={index} style={styles.subGradeItem}>
              <Text
                style={[styles.subGradeLabel, { color: colors.textSecondary }]}
              >
                {item.label}
              </Text>
              <View
                style={[styles.subGradeBadge, { backgroundColor: item.color }]}
              >
                <Text style={styles.subGradeValue}>{item.value}</Text>
              </View>
            </View>
          ))}
        </View>
      </Card>
    );
  };

  const getSubGradeLabel = (key: string) => {
    const labels: Record<string, string> = {
      centering: '居中度',
      corners: '邊角',
      edges: '邊緣',
      surface: '表面',
      overallAppeal: '整體吸引力',
    };
    return labels[key] || key;
  };

  const renderMarketValue = () => {
    if (!report) return null;

    const { marketValue } = report.gradingResult;

    return (
      <Card style={styles.marketValueCard}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          市場價值評估
        </Text>
        <View style={styles.marketValueContent}>
          <View style={styles.estimatedValue}>
            <Text style={[styles.valueLabel, { color: colors.textSecondary }]}>
              預估價值
            </Text>
            <Text style={[styles.valueAmount, { color: colors.text }]}>
              {formatCurrency(marketValue.estimated)}
            </Text>
            <Text style={[styles.valueRange, { color: colors.textSecondary }]}>
              {formatCurrency(marketValue.range.min)} -{' '}
              {formatCurrency(marketValue.range.max)}
            </Text>
          </View>
          <View style={styles.valueFactors}>
            <Text
              style={[styles.factorsTitle, { color: colors.textSecondary }]}
            >
              影響因素:
            </Text>
            {marketValue.factors.map((factor, index) => (
              <Text
                key={index}
                style={[styles.factorItem, { color: colors.textSecondary }]}
              >
                • {factor}
              </Text>
            ))}
          </View>
        </View>
      </Card>
    );
  };

  const renderDetails = () => {
    if (!report) return null;

    return (
      <Card style={styles.detailsCard}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          鑑定詳情
        </Text>
        <View style={styles.detailsList}>
          {report.gradingResult.details.map((detail, index) => (
            <Text
              key={index}
              style={[styles.detailItem, { color: colors.text }]}
            >
              • {detail}
            </Text>
          ))}
        </View>
      </Card>
    );
  };

  const renderRecommendations = () => {
    if (!report) return null;

    return (
      <Card style={styles.recommendationsCard}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          改善建議
        </Text>
        <View style={styles.recommendationsList}>
          {report.gradingResult.recommendations.map((recommendation, index) => (
            <Text
              key={index}
              style={[styles.recommendationItem, { color: colors.text }]}
            >
              • {recommendation}
            </Text>
          ))}
        </View>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.text }]}>
            載入鑑定報告中...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !report) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: colors.error }]}>
            {error || '無法載入鑑定報告'}
          </Text>
          <Button
            title="返回"
            onPress={() => navigation.goBack()}
            style={styles.errorButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* 標題區域 */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Text style={[styles.title, { color: colors.text }]}>鑑定報告</Text>
            {renderGradeBadge()}
          </View>
          <Text style={[styles.gradingNumber, { color: colors.textSecondary }]}>
            {report.gradingNumber}
          </Text>
        </View>

        {/* 卡牌信息 */}
        <Card style={styles.cardInfoCard}>
          <View style={styles.cardInfoHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              卡牌信息
            </Text>
            <View
              style={[
                styles.agencyBadge,
                { backgroundColor: getAgencyColor(report.agency) },
              ]}
            >
              <Text style={styles.agencyText}>{report.agency}</Text>
            </View>
          </View>

          <View style={styles.cardInfoContent}>
            {report.cardInfo.imageUrl && (
              <Image
                source={{ uri: report.cardInfo.imageUrl }}
                style={styles.cardImage}
              />
            )}
            <View style={styles.cardInfoDetails}>
              <Text style={[styles.cardName, { color: colors.text }]}>
                {report.cardInfo.name}
              </Text>
              <Text style={[styles.cardSet, { color: colors.textSecondary }]}>
                {report.cardInfo.setName}
              </Text>
              <Text
                style={[styles.cardNumber, { color: colors.textSecondary }]}
              >
                #{report.cardInfo.cardNumber}
              </Text>
              <Text
                style={[styles.cardRarity, { color: colors.textSecondary }]}
              >
                {report.cardInfo.rarity}
              </Text>
            </View>
          </View>
        </Card>

        {/* 綜合鑑定結果 */}
        {report.gradingResult.details?.comprehensiveAnalysis && (
          <Card style={styles.comprehensiveCard}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              綜合鑑定結果
            </Text>
            <Text
              style={[
                styles.comprehensiveDescription,
                { color: colors.textSecondary },
              ]}
            >
              系統自動參考多個專業鑑定機構的評分準則
            </Text>

            <View style={styles.comprehensiveGrades}>
              <View style={styles.comprehensiveGradeItem}>
                <Text
                  style={[
                    styles.comprehensiveGradeLabel,
                    { color: colors.textSecondary },
                  ]}
                >
                  PSA
                </Text>
                <View
                  style={[
                    styles.comprehensiveGradeBadge,
                    { backgroundColor: getAgencyColor('PSA') },
                  ]}
                >
                  <Text style={styles.comprehensiveGradeText}>
                    {
                      report.gradingResult.details.comprehensiveAnalysis
                        .psaGrade
                    }
                  </Text>
                </View>
              </View>

              <View style={styles.comprehensiveGradeItem}>
                <Text
                  style={[
                    styles.comprehensiveGradeLabel,
                    { color: colors.textSecondary },
                  ]}
                >
                  BGS
                </Text>
                <View
                  style={[
                    styles.comprehensiveGradeBadge,
                    { backgroundColor: getAgencyColor('BGS') },
                  ]}
                >
                  <Text style={styles.comprehensiveGradeText}>
                    {
                      report.gradingResult.details.comprehensiveAnalysis
                        .bgsGrade
                    }
                  </Text>
                </View>
              </View>

              <View style={styles.comprehensiveGradeItem}>
                <Text
                  style={[
                    styles.comprehensiveGradeLabel,
                    { color: colors.textSecondary },
                  ]}
                >
                  CGC
                </Text>
                <View
                  style={[
                    styles.comprehensiveGradeBadge,
                    { backgroundColor: getAgencyColor('CGC') },
                  ]}
                >
                  <Text style={styles.comprehensiveGradeText}>
                    {
                      report.gradingResult.details.comprehensiveAnalysis
                        .cgcGrade
                    }
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.selectionReason}>
              <Text
                style={[
                  styles.selectionReasonText,
                  { color: colors.textSecondary },
                ]}
              >
                {
                  report.gradingResult.details.comprehensiveAnalysis
                    .selectionReason
                }
              </Text>
            </View>
          </Card>
        )}

        {/* 子評分 */}
        {renderSubGrades()}

        {/* 市場價值 */}
        {renderMarketValue()}

        {/* 鑑定詳情 */}
        {renderDetails()}

        {/* 改善建議 */}
        {renderRecommendations()}

        {/* 報告信息 */}
        <Card style={styles.reportInfoCard}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            報告信息
          </Text>
          <View style={styles.reportInfoList}>
            <View style={styles.reportInfoItem}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                信心度:
              </Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                {(report.gradingResult.confidence * 100).toFixed(0)}%
              </Text>
            </View>
            <View style={styles.reportInfoItem}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                查看次數:
              </Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                {report.viewCount}
              </Text>
            </View>
            <View style={styles.reportInfoItem}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                創建時間:
              </Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                {new Date(report.createdAt).toLocaleDateString('zh-TW')}
              </Text>
            </View>
            <View style={styles.reportInfoItem}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                有效期至:
              </Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                {new Date(report.expiresAt).toLocaleDateString('zh-TW')}
              </Text>
            </View>
          </View>
        </Card>

        {/* 操作按鈕 */}
        <View style={styles.actionButtons}>
          <Button
            title="分享報告"
            onPress={handleShare}
            style={[styles.shareButton, { backgroundColor: colors.primary }]}
          />
          <Button
            title="返回"
            onPress={() => navigation.goBack()}
            style={[styles.backButton, { backgroundColor: colors.border }]}
            textStyle={{ color: colors.text }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  errorButton: {
    width: 120,
  },
  header: {
    marginBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  gradingNumber: {
    fontSize: 16,
    fontWeight: '500',
  },
  gradeBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  gradeText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cardInfoCard: {
    marginBottom: 16,
  },
  cardInfoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  agencyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  agencyText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  cardInfoContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardImage: {
    width: 80,
    height: 112,
    borderRadius: 8,
    marginRight: 16,
  },
  cardInfoDetails: {
    flex: 1,
  },
  cardName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardSet: {
    fontSize: 14,
    marginBottom: 2,
  },
  cardNumber: {
    fontSize: 14,
    marginBottom: 2,
  },
  cardRarity: {
    fontSize: 14,
  },
  subGradesCard: {
    marginBottom: 16,
  },
  subGradesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  subGradeItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 12,
  },
  subGradeLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  subGradeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  subGradeValue: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  marketValueCard: {
    marginBottom: 16,
  },
  marketValueContent: {
    flexDirection: 'row',
  },
  estimatedValue: {
    flex: 1,
    alignItems: 'center',
    marginRight: 16,
  },
  valueLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  valueAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  valueRange: {
    fontSize: 12,
  },
  valueFactors: {
    flex: 1,
  },
  factorsTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  factorItem: {
    fontSize: 12,
    marginBottom: 2,
  },
  detailsCard: {
    marginBottom: 16,
  },
  detailsList: {
    marginTop: 8,
  },
  detailItem: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  recommendationsCard: {
    marginBottom: 16,
  },
  recommendationsList: {
    marginTop: 8,
  },
  recommendationItem: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  reportInfoCard: {
    marginBottom: 16,
  },
  reportInfoList: {
    marginTop: 8,
  },
  reportInfoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  comprehensiveCard: {
    marginBottom: 16,
  },
  comprehensiveDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  comprehensiveGrades: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  comprehensiveGradeItem: {
    alignItems: 'center',
  },
  comprehensiveGradeLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  comprehensiveGradeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  comprehensiveGradeText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  selectionReason: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  selectionReasonText: {
    fontSize: 12,
    lineHeight: 16,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  shareButton: {
    flex: 1,
    marginRight: 8,
  },
  backButton: {
    flex: 1,
    marginLeft: 8,
  },
});
