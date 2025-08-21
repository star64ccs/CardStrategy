import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Dimensions,
  Alert,
  TouchableOpacity
} from 'react-native';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import { useTheme } from '@/config/ThemeProvider';
import { useTranslation } from '@/i18n';
import { dataQualityService } from '@/services/dataQualityService';
import { Button, Card, Input, Modal, Toast } from '@/components/common';
import { Loading } from '@/components/common/Loading';

const { width: screenWidth } = Dimensions.get('window');

interface AssessmentStats {
  totalAssessments: number;
  completedAssessments: number;
  failedAssessments: number;
  averageExecutionTime: number;
  averageOverallScore: number;
  statusDistribution: { [key: string]: number };
  typeDistribution: { [key: string]: number };
  dailyTrend: {
    date: string;
    total: number;
    completed: number;
    failed: number;
  }[];
}

interface AssessmentSchedule {
  id: number;
  name: string;
  description?: string;
  assessmentType: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'custom';
  frequency: {
    interval: number;
    unit: string;
    timeOfDay: string;
    daysOfWeek: number[];
    dayOfMonth: number;
    monthOfQuarter: number;
  };
  dataTypes: string[];
  assessmentCriteria: {
    completeness: { weight: number; threshold: number };
    accuracy: { weight: number; threshold: number };
    consistency: { weight: number; threshold: number };
    timeliness: { weight: number; threshold: number };
  };
  isActive: boolean;
  startDate: string;
  endDate?: string;
  lastRunDate?: string;
  nextRunDate?: string;
  totalRuns: number;
  successfulRuns: number;
  failedRuns: number;
  averageExecutionTime?: number;
  notificationSettings: {
    onSuccess: boolean;
    onFailure: boolean;
    onCompletion: boolean;
    recipients: string[];
    emailNotifications: boolean;
    slackNotifications: boolean;
  };
  createdBy: number;
  metadata: any;
  createdAt: string;
  updatedAt: string;
  createdByUser?: { id: number; username: string; email: string };
}

interface DataQualityAssessment {
  id: number;
  assessmentType: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'custom';
  assessmentDate: string;
  scheduledDate: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'failed' | 'cancelled';
  dataTypes: string[];
  assessmentCriteria: {
    completeness: { weight: number; threshold: number };
    accuracy: { weight: number; threshold: number };
    consistency: { weight: number; threshold: number };
    timeliness: { weight: number; threshold: number };
  };
  results: {
    overallScore: number;
    completeness: number;
    accuracy: number;
    consistency: number;
    timeliness: number;
    sampleSize: number;
    dataSources: {
      type: string;
      sampleSize: number;
      completeness: number;
      accuracy: number;
      consistency: number;
      timeliness: number;
      issues: {
        type: string;
        category?: string;
        message: string;
      }[];
    }[];
    qualityDistribution: {
      excellent: number;
      good: number;
      fair: number;
      poor: number;
    };
    issues: {
      type: string;
      dataType?: string;
      message: string;
    }[];
    recommendations: {
      priority: string;
      category: string;
      title: string;
      description: string;
      action: string;
    }[];
  };
  executionTime?: number;
  errorMessage?: string;
  triggeredBy: 'system' | 'manual' | 'api';
  triggeredByUserId?: number;
  nextAssessmentDate?: string;
  metadata: any;
  createdAt: string;
  updatedAt: string;
  triggeredByUser?: { id: number; username: string; email: string };
}

const DataQualityAssessmentScreen: React.FC = () => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<AssessmentStats | null>(null);
  const [schedules, setSchedules] = useState<AssessmentSchedule[]>([]);
  const [assessments, setAssessments] = useState<DataQualityAssessment[]>([]);
  const [currentTab, setCurrentTab] = useState<'overview' | 'schedules' | 'assessments'>('overview');
  const [showCreateScheduleModal, setShowCreateScheduleModal] = useState(false);
  const [showExecuteAssessmentModal, setShowExecuteAssessmentModal] = useState(false);
  const [showAssessmentDetailModal, setShowAssessmentDetailModal] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState<DataQualityAssessment | null>(null);
  const [executingAssessment, setExecutingAssessment] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadStats(),
        loadSchedules(),
        loadAssessments()
      ]);
    } catch (error) {
      // logger.info('加載數據失敗:', error);
      Toast.show('加載數據失敗', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await dataQualityService.getAssessmentStats();
      setStats(statsData);
    } catch (error) {
      // logger.info('加載統計數據失敗:', error);
    }
  };

  const loadSchedules = async () => {
    try {
      const schedulesData = await dataQualityService.getAssessmentSchedules({ limit: 10 });
      setSchedules(schedulesData.schedules);
    } catch (error) {
      // logger.info('加載評估計劃失敗:', error);
    }
  };

  const loadAssessments = async () => {
    try {
      const assessmentsData = await dataQualityService.getAssessments({ limit: 10 });
      setAssessments(assessmentsData.assessments);
    } catch (error) {
      // logger.info('加載評估記錄失敗:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleExecuteAssessment = async (scheduleId: number) => {
    try {
      setExecutingAssessment(true);
      await dataQualityService.executeScheduledAssessment(scheduleId);
      Toast.show('評估執行成功', 'success');
      await loadData();
    } catch (error) {
      // logger.info('執行評估失敗:', error);
      Toast.show('執行評估失敗', 'error');
    } finally {
      setExecutingAssessment(false);
    }
  };

  const handleViewAssessmentDetail = async (assessmentId: number) => {
    try {
      const assessment = await dataQualityService.getAssessmentById(assessmentId);
      setSelectedAssessment(assessment);
      setShowAssessmentDetailModal(true);
    } catch (error) {
      // logger.info('獲取評估詳情失敗:', error);
      Toast.show('獲取評估詳情失敗', 'error');
    }
  };

  const renderOverview = () => {
    if (!stats) return null;

    return (
      <ScrollView style={styles.container}>
        {/* 統計概覽 */}
        <View style={styles.statsGrid}>
          <Card style={[styles.statCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.statValue, { color: colors.text }]}>{stats.totalAssessments}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>總評估次數</Text>
          </Card>
          <Card style={[styles.statCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.statValue, { color: colors.text }]}>{stats.completedAssessments}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>成功完成</Text>
          </Card>
          <Card style={[styles.statCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.statValue, { color: colors.text }]}>{stats.failedAssessments}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>執行失敗</Text>
          </Card>
          <Card style={[styles.statCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {(stats.averageOverallScore * 100).toFixed(1)}%
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>平均分數</Text>
          </Card>
        </View>

        {/* 狀態分佈圖表 */}
        <Card style={[styles.chartCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>評估狀態分佈</Text>
          <PieChart
            data={Object.entries(stats.statusDistribution).map(([status, count], index) => ({
              name: status,
              population: count,
              color: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'][index % 5],
              legendFontColor: colors.text,
              legendFontSize: 12
            }))}
            width={screenWidth - 40}
            height={200}
            chartConfig={{
              backgroundColor: colors.card,
              backgroundGradientFrom: colors.card,
              backgroundGradientTo: colors.card,
              color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`
            }}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
          />
        </Card>

        {/* 每日趨勢圖表 */}
        <Card style={[styles.chartCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>每日評估趨勢</Text>
          <LineChart
            data={{
              labels: stats.dailyTrend.slice(-7).map(item => item.date.slice(5)),
              datasets: [
                {
                  data: stats.dailyTrend.slice(-7).map(item => item.total),
                  color: (opacity = 1) => `rgba(54, 162, 235, ${opacity})`,
                  strokeWidth: 2
                },
                {
                  data: stats.dailyTrend.slice(-7).map(item => item.completed),
                  color: (opacity = 1) => `rgba(75, 192, 192, ${opacity})`,
                  strokeWidth: 2
                }
              ]
            }}
            width={screenWidth - 40}
            height={200}
            chartConfig={{
              backgroundColor: colors.card,
              backgroundGradientFrom: colors.card,
              backgroundGradientTo: colors.card,
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              style: {
                borderRadius: 16
              }
            }}
            bezier
            style={{
              marginVertical: 8,
              borderRadius: 16
            }}
          />
          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#36A2EB' }]} />
              <Text style={[styles.legendText, { color: colors.text }]}>總數</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#4BC0C0' }]} />
              <Text style={[styles.legendText, { color: colors.text }]}>完成</Text>
            </View>
          </View>
        </Card>
      </ScrollView>
    );
  };

  const renderSchedules = () => {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>評估計劃</Text>
          <Button
            title="創建計劃"
            onPress={() => setShowCreateScheduleModal(true)}
            style={styles.createButton}
          />
        </View>

        {schedules.map(schedule => (
          <Card key={schedule.id} style={[styles.scheduleCard, { backgroundColor: colors.card }]}>
            <View style={styles.scheduleHeader}>
              <Text style={[styles.scheduleName, { color: colors.text }]}>{schedule.name}</Text>
              <View style={[styles.statusBadge, { backgroundColor: schedule.isActive ? '#4CAF50' : '#F44336' }]}>
                <Text style={styles.statusText}>{schedule.isActive ? '啟用' : '停用'}</Text>
              </View>
            </View>

            {schedule.description && (
              <Text style={[styles.scheduleDescription, { color: colors.textSecondary }]}>
                {schedule.description}
              </Text>
            )}

            <View style={styles.scheduleDetails}>
              <Text style={[styles.scheduleDetail, { color: colors.textSecondary }]}>
                類型: {schedule.assessmentType}
              </Text>
              <Text style={[styles.scheduleDetail, { color: colors.textSecondary }]}>
                數據類型: {schedule.dataTypes.join(', ')}
              </Text>
              <Text style={[styles.scheduleDetail, { color: colors.textSecondary }]}>
                總運行: {schedule.totalRuns} | 成功: {schedule.successfulRuns} | 失敗: {schedule.failedRuns}
              </Text>
              {schedule.nextRunDate && (
                <Text style={[styles.scheduleDetail, { color: colors.textSecondary }]}>
                  下次運行: {new Date(schedule.nextRunDate).toLocaleString()}
                </Text>
              )}
            </View>

            <View style={styles.scheduleActions}>
              <Button
                title="執行"
                onPress={() => handleExecuteAssessment(schedule.id)}
                loading={executingAssessment}
                style={styles.actionButton}
              />
              <Button
                title={schedule.isActive ? '停用' : '啟用'}
                onPress={() => handleToggleSchedule(schedule.id, !schedule.isActive)}
                style={[styles.actionButton, { backgroundColor: schedule.isActive ? '#F44336' : '#4CAF50' }]}
              />
            </View>
          </Card>
        ))}
      </ScrollView>
    );
  };

  const renderAssessments = () => {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>評估記錄</Text>
          <Button
            title="手動評估"
            onPress={() => setShowExecuteAssessmentModal(true)}
            style={styles.createButton}
          />
        </View>

        {assessments.map(assessment => (
          <Card key={assessment.id} style={[styles.assessmentCard, { backgroundColor: colors.card }]}>
            <View style={styles.assessmentHeader}>
              <Text style={[styles.assessmentType, { color: colors.text }]}>
                {assessment.assessmentType.toUpperCase()}
              </Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(assessment.status) }]}>
                <Text style={styles.statusText}>{getStatusText(assessment.status)}</Text>
              </View>
            </View>

            <View style={styles.assessmentDetails}>
              <Text style={[styles.assessmentDetail, { color: colors.textSecondary }]}>
                執行時間: {new Date(assessment.assessmentDate).toLocaleString()}
              </Text>
              <Text style={[styles.assessmentDetail, { color: colors.textSecondary }]}>
                觸發方式: {assessment.triggeredBy}
              </Text>
              <Text style={[styles.assessmentDetail, { color: colors.textSecondary }]}>
                數據類型: {assessment.dataTypes.join(', ')}
              </Text>
              {assessment.results && (
                <Text style={[styles.assessmentDetail, { color: colors.textSecondary }]}>
                  總體分數: {(assessment.results.overallScore * 100).toFixed(1)}%
                </Text>
              )}
              {assessment.executionTime && (
                <Text style={[styles.assessmentDetail, { color: colors.textSecondary }]}>
                  執行時間: {assessment.executionTime}ms
                </Text>
              )}
            </View>

            <Button
              title="查看詳情"
              onPress={() => handleViewAssessmentDetail(assessment.id)}
              style={styles.actionButton}
            />
          </Card>
        ))}
      </ScrollView>
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#4CAF50';
      case 'failed': return '#F44336';
      case 'in_progress': return '#FF9800';
      case 'scheduled': return '#2196F3';
      case 'cancelled': return '#9E9E9E';
      default: return '#9E9E9E';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return '完成';
      case 'failed': return '失敗';
      case 'in_progress': return '執行中';
      case 'scheduled': return '已計劃';
      case 'cancelled': return '已取消';
      default: return status;
    }
  };

  const handleToggleSchedule = async (scheduleId: number, isActive: boolean) => {
    try {
      await dataQualityService.updateScheduleStatus(scheduleId, isActive);
      Toast.show(`計劃${isActive ? '啟用' : '停用'}成功`, 'success');
      await loadSchedules();
    } catch (error) {
      // logger.info('更新計劃狀態失敗:', error);
      Toast.show('更新計劃狀態失敗', 'error');
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* 標籤欄 */}
      <View style={[styles.tabBar, { backgroundColor: colors.card }]}>
        <TouchableOpacity
          style={[styles.tab, currentTab === 'overview' && styles.activeTab]}
          onPress={() => setCurrentTab('overview')}
        >
          <Text style={[styles.tabText, { color: colors.text }, currentTab === 'overview' && styles.activeTabText]}>
            概覽
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, currentTab === 'schedules' && styles.activeTab]}
          onPress={() => setCurrentTab('schedules')}
        >
          <Text style={[styles.tabText, { color: colors.text }, currentTab === 'schedules' && styles.activeTabText]}>
            計劃
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, currentTab === 'assessments' && styles.activeTab]}
          onPress={() => setCurrentTab('assessments')}
        >
          <Text style={[styles.tabText, { color: colors.text }, currentTab === 'assessments' && styles.activeTabText]}>
            記錄
          </Text>
        </TouchableOpacity>
      </View>

      {/* 內容區域 */}
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {currentTab === 'overview' && renderOverview()}
        {currentTab === 'schedules' && renderSchedules()}
        {currentTab === 'assessments' && renderAssessments()}
      </ScrollView>

      {/* 評估詳情模態框 */}
      <Modal
        visible={showAssessmentDetailModal}
        onClose={() => setShowAssessmentDetailModal(false)}
        title="評估詳情"
      >
        {selectedAssessment && (
          <ScrollView style={styles.modalContent}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>評估結果</Text>

            {selectedAssessment.results && (
              <View style={styles.resultsGrid}>
                <View style={styles.resultItem}>
                  <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>總體分數</Text>
                  <Text style={[styles.resultValue, { color: colors.text }]}>
                    {(selectedAssessment.results.overallScore * 100).toFixed(1)}%
                  </Text>
                </View>
                <View style={styles.resultItem}>
                  <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>完整性</Text>
                  <Text style={[styles.resultValue, { color: colors.text }]}>
                    {(selectedAssessment.results.completeness * 100).toFixed(1)}%
                  </Text>
                </View>
                <View style={styles.resultItem}>
                  <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>準確性</Text>
                  <Text style={[styles.resultValue, { color: colors.text }]}>
                    {(selectedAssessment.results.accuracy * 100).toFixed(1)}%
                  </Text>
                </View>
                <View style={styles.resultItem}>
                  <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>一致性</Text>
                  <Text style={[styles.resultValue, { color: colors.text }]}>
                    {(selectedAssessment.results.consistency * 100).toFixed(1)}%
                  </Text>
                </View>
                <View style={styles.resultItem}>
                  <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>時效性</Text>
                  <Text style={[styles.resultValue, { color: colors.text }]}>
                    {(selectedAssessment.results.timeliness * 100).toFixed(1)}%
                  </Text>
                </View>
                <View style={styles.resultItem}>
                  <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>樣本數量</Text>
                  <Text style={[styles.resultValue, { color: colors.text }]}>
                    {selectedAssessment.results.sampleSize}
                  </Text>
                </View>
              </View>
            )}

            {selectedAssessment.results?.recommendations && selectedAssessment.results.recommendations.length > 0 && (
              <View style={styles.recommendationsSection}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>改進建議</Text>
                {selectedAssessment.results.recommendations.map((rec, index) => (
                  <Card key={index} style={[styles.recommendationCard, { backgroundColor: colors.card }]}>
                    <Text style={[styles.recommendationTitle, { color: colors.text }]}>{rec.title}</Text>
                    <Text style={[styles.recommendationDescription, { color: colors.textSecondary }]}>
                      {rec.description}
                    </Text>
                    <Text style={[styles.recommendationAction, { color: colors.primary }]}>
                      建議行動: {rec.action}
                    </Text>
                  </Card>
                ))}
              </View>
            )}

            {selectedAssessment.errorMessage && (
              <View style={styles.errorSection}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>錯誤信息</Text>
                <Text style={[styles.errorMessage, { color: '#F44336' }]}>
                  {selectedAssessment.errorMessage}
                </Text>
              </View>
            )}
          </ScrollView>
        )}
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0'
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8
  },
  activeTab: {
    backgroundColor: 'rgba(33, 150, 243, 0.1)'
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500'
  },
  activeTabText: {
    color: '#2196F3',
    fontWeight: '600'
  },
  content: {
    flex: 1
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12
  },
  statCard: {
    width: '48%',
    padding: 16,
    alignItems: 'center',
    borderRadius: 12
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center'
  },
  chartCard: {
    margin: 16,
    padding: 16,
    borderRadius: 12
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
    gap: 16
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 4
  },
  legendText: {
    fontSize: 12
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600'
  },
  createButton: {
    backgroundColor: '#2196F3'
  },
  scheduleCard: {
    margin: 16,
    padding: 16,
    borderRadius: 12
  },
  scheduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  scheduleName: {
    fontSize: 16,
    fontWeight: '600'
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500'
  },
  scheduleDescription: {
    fontSize: 14,
    marginBottom: 12
  },
  scheduleDetails: {
    marginBottom: 12
  },
  scheduleDetail: {
    fontSize: 12,
    marginBottom: 4
  },
  scheduleActions: {
    flexDirection: 'row',
    gap: 8
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#2196F3'
  },
  assessmentCard: {
    margin: 16,
    padding: 16,
    borderRadius: 12
  },
  assessmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  assessmentType: {
    fontSize: 14,
    fontWeight: '600'
  },
  assessmentDetails: {
    marginBottom: 12
  },
  assessmentDetail: {
    fontSize: 12,
    marginBottom: 4
  },
  modalContent: {
    padding: 16
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16
  },
  resultsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24
  },
  resultItem: {
    width: '48%',
    padding: 12,
    backgroundColor: 'rgba(33, 150, 243, 0.1)',
    borderRadius: 8,
    alignItems: 'center'
  },
  resultLabel: {
    fontSize: 12,
    marginBottom: 4
  },
  resultValue: {
    fontSize: 16,
    fontWeight: '600'
  },
  recommendationsSection: {
    marginBottom: 24
  },
  recommendationCard: {
    padding: 12,
    marginBottom: 8,
    borderRadius: 8
  },
  recommendationTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4
  },
  recommendationDescription: {
    fontSize: 12,
    marginBottom: 4
  },
  recommendationAction: {
    fontSize: 12,
    fontWeight: '500'
  },
  errorSection: {
    marginBottom: 24
  },
  errorMessage: {
    fontSize: 12,
    padding: 12,
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
    borderRadius: 8
  }
});

export default DataQualityAssessmentScreen;
