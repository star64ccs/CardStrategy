import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Dimensions
} from 'react-native';
import { useTheme } from '@/config/theme';
import { useTranslation } from '@/i18n';
import { api } from '@/config/api';
import { Button, Card, Input, Modal, Toast, Loading } from '@/components/common';
import { PieChart, BarChart, LineChart } from 'react-native-chart-kit';

const { width } = Dimensions.get('window');

interface Feedback {
  id: number;
  userId: number;
  feedbackType: string;
  category: string;
  severity: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  assignedTo?: number;
  resolution?: string;
  resolutionDate?: string;
  resolvedBy?: number;
  tags: string[];
  attachments: any[];
  metadata: any;
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    username: string;
    email: string;
  };
  assignedUser?: {
    id: number;
    username: string;
  };
  resolvedByUser?: {
    id: number;
    username: string;
  };
  responses: {
    id: number;
    userId: number;
    responseType: string;
    content: string;
    isInternal: boolean;
    createdAt: string;
    user: {
      id: number;
      username: string;
    };
  }[];
}

interface FeedbackStats {
  totalSubmitted: number;
  totalResolved: number;
  averageResolutionTime: number;
  feedbackTypeDistribution: { [key: string]: number };
  categoryDistribution: { [key: string]: number };
  priorityDistribution: { [key: string]: number };
  statusDistribution: { [key: string]: number };
  severityDistribution: { [key: string]: number };
  dailyTrend: {
    date: string;
    submitted: number;
    resolved: number;
  }[];
}

interface FeedbackSuggestion {
  priority: string;
  category: string;
  title: string;
  description: string;
  action: string;
}

const FeedbackManagementScreen: React.FC = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [stats, setStats] = useState<FeedbackStats | null>(null);
  const [suggestions, setSuggestions] = useState<FeedbackSuggestion[]>([]);
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [responseContent, setResponseContent] = useState('');
  const [responseType, setResponseType] = useState('comment');
  const [isInternal, setIsInternal] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });

  // 篩選器狀態
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    feedbackType: '',
    category: '',
    severity: ''
  });

  const loadFeedbacks = useCallback(async (page = 1, refresh = false) => {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        ...filters
      });

      const response = await api.get(`/data-quality/feedback?${params}`);
      const {data} = response;

      if (refresh) {
        setFeedbacks(data.feedbacks);
      } else {
        setFeedbacks(prev => (page === 1 ? data.feedbacks : [...prev, ...data.feedbacks]));
      }

      setPagination(data.pagination);
    } catch (error) {
      console.error('載入反饋列表失敗:', error);
      Toast.show('載入反饋列表失敗', 'error');
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.limit]);

  const loadStats = useCallback(async () => {
    try {
      const response = await api.get('/data-quality/feedback/stats');
      setStats(response.data);
    } catch (error) {
      console.error('載入反饋統計失敗:', error);
    }
  }, []);

  const loadSuggestions = useCallback(async () => {
    try {
      const response = await api.get('/data-quality/feedback/suggestions');
      setSuggestions(response.data);
    } catch (error) {
      console.error('載入改進建議失敗:', error);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      loadFeedbacks(1, true),
      loadStats(),
      loadSuggestions()
    ]);
    setRefreshing(false);
  }, [loadFeedbacks, loadStats, loadSuggestions]);

  const handleStatusUpdate = async (feedbackId: number, status: string, resolution?: string) => {
    try {
      await api.put(`/data-quality/feedback/${feedbackId}/status`, {
        status,
        resolution
      });

      Toast.show('狀態已更新', 'success');
      onRefresh();
    } catch (error) {
      console.error('更新狀態失敗:', error);
      Toast.show('更新狀態失敗', 'error');
    }
  };

  const handleAssignFeedback = async (feedbackId: number, assignedTo: number) => {
    try {
      await api.put(`/data-quality/feedback/${feedbackId}/assign`, {
        assignedTo
      });

      Toast.show('反饋已分配', 'success');
      onRefresh();
    } catch (error) {
      console.error('分配反饋失敗:', error);
      Toast.show('分配反饋失敗', 'error');
    }
  };

  const handleAddResponse = async () => {
    if (!selectedFeedback || !responseContent.trim()) {
      Toast.show('請輸入回應內容', 'warning');
      return;
    }

    try {
      await api.post(`/data-quality/feedback/${selectedFeedback.id}/response`, {
        content: responseContent,
        responseType,
        isInternal
      });

      Toast.show('回應已添加', 'success');
      setResponseContent('');
      setShowResponseModal(false);
      onRefresh();
    } catch (error) {
      console.error('添加回應失敗:', error);
      Toast.show('添加回應失敗', 'error');
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: '#FFA500',
      under_review: '#007AFF',
      in_progress: '#FF6B35',
      resolved: '#4CAF50',
      rejected: '#F44336',
      closed: '#9E9E9E'
    };
    return colors[status as keyof typeof colors] || '#9E9E9E';
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      urgent: '#F44336',
      high: '#FF9800',
      normal: '#2196F3',
      low: '#4CAF50'
    };
    return colors[priority as keyof typeof colors] || '#9E9E9E';
  };

  const getSeverityColor = (severity: string) => {
    const colors = {
      critical: '#D32F2F',
      high: '#F57C00',
      medium: '#FFA000',
      low: '#388E3C'
    };
    return colors[severity as keyof typeof colors] || '#9E9E9E';
  };

  useEffect(() => {
    onRefresh();
  }, [onRefresh]);

  const renderFeedbackItem = (feedback: Feedback) => (
    <Card key={feedback.id} style={styles.feedbackCard}>
      <View style={styles.feedbackHeader}>
        <View style={styles.feedbackTitle}>
          <Text style={[styles.feedbackTitleText, { color: theme.colors.text }]}>
            {feedback.title}
          </Text>
          <View style={styles.feedbackBadges}>
            <View style={[styles.badge, { backgroundColor: getStatusColor(feedback.status) }]}>
              <Text style={styles.badgeText}>{feedback.status}</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: getPriorityColor(feedback.priority) }]}>
              <Text style={styles.badgeText}>{feedback.priority}</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: getSeverityColor(feedback.severity) }]}>
              <Text style={styles.badgeText}>{feedback.severity}</Text>
            </View>
          </View>
        </View>
        <Text style={[styles.feedbackMeta, { color: theme.colors.textSecondary }]}>
          {feedback.feedbackType} • {feedback.category}
        </Text>
      </View>

      <Text style={[styles.feedbackDescription, { color: theme.colors.text }]} numberOfLines={2}>
        {feedback.description}
      </Text>

      <View style={styles.feedbackFooter}>
        <Text style={[styles.feedbackUser, { color: theme.colors.textSecondary }]}>
          由 {feedback.user.username} 提交
        </Text>
        <Text style={[styles.feedbackDate, { color: theme.colors.textSecondary }]}>
          {new Date(feedback.createdAt).toLocaleDateString()}
        </Text>
      </View>

      <View style={styles.feedbackActions}>
        <Button
          title="查看詳情"
          onPress={() => {
            setSelectedFeedback(feedback);
            setShowDetailModal(true);
          }}
          style={styles.actionButton}
        />
        <Button
          title="添加回應"
          onPress={() => {
            setSelectedFeedback(feedback);
            setShowResponseModal(true);
          }}
          style={styles.actionButton}
        />
      </View>
    </Card>
  );

  const renderStatsCharts = () => {
    if (!stats) return null;

    const chartConfig = {
      backgroundColor: theme.colors.background,
      backgroundGradientFrom: theme.colors.background,
      backgroundGradientTo: theme.colors.background,
      decimalPlaces: 0,
      color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
      labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
      style: {
        borderRadius: 16
      }
    };

    const pieData = Object.entries(stats.feedbackTypeDistribution).map(([key, value], index) => ({
      name: key,
      population: value,
      color: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'][index % 5],
      legendFontColor: theme.colors.text,
      legendFontSize: 12
    }));

    const barData = {
      labels: Object.keys(stats.statusDistribution),
      datasets: [{
        data: Object.values(stats.statusDistribution)
      }]
    };

    return (
      <View style={styles.chartsContainer}>
        <Text style={[styles.chartTitle, { color: theme.colors.text }]}>反饋類型分佈</Text>
        <PieChart
          data={pieData}
          width={width - 40}
          height={200}
          chartConfig={chartConfig}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="15"
        />

        <Text style={[styles.chartTitle, { color: theme.colors.text }]}>狀態分佈</Text>
        <BarChart
          data={barData}
          width={width - 40}
          height={200}
          chartConfig={chartConfig}
          style={styles.chart}
        />
      </View>
    );
  };

  const renderSuggestions = () => (
    <View style={styles.suggestionsContainer}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>改進建議</Text>
      {suggestions.map((suggestion, index) => (
        <Card key={index} style={styles.suggestionCard}>
          <View style={styles.suggestionHeader}>
            <Text style={[styles.suggestionTitle, { color: theme.colors.text }]}>
              {suggestion.title}
            </Text>
            <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(suggestion.priority) }]}>
              <Text style={styles.badgeText}>{suggestion.priority}</Text>
            </View>
          </View>
          <Text style={[styles.suggestionDescription, { color: theme.colors.textSecondary }]}>
            {suggestion.description}
          </Text>
          <Text style={[styles.suggestionAction, { color: theme.colors.primary }]}>
            建議行動: {suggestion.action}
          </Text>
        </Card>
      ))}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* 統計概覽 */}
        {stats && (
          <View style={styles.statsContainer}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>統計概覽</Text>
            <View style={styles.statsGrid}>
              <Card style={styles.statCard}>
                <Text style={[styles.statNumber, { color: theme.colors.primary }]}>
                  {stats.totalSubmitted}
                </Text>
                <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                  總提交數
                </Text>
              </Card>
              <Card style={styles.statCard}>
                <Text style={[styles.statNumber, { color: theme.colors.success }]}>
                  {stats.totalResolved}
                </Text>
                <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                  已解決
                </Text>
              </Card>
              <Card style={styles.statCard}>
                <Text style={[styles.statNumber, { color: theme.colors.warning }]}>
                  {stats.averageResolutionTime.toFixed(1)}
                </Text>
                <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                  平均解決時間(天)
                </Text>
              </Card>
            </View>
          </View>
        )}

        {/* 圖表 */}
        {renderStatsCharts()}

        {/* 改進建議 */}
        {renderSuggestions()}

        {/* 反饋列表 */}
        <View style={styles.feedbacksContainer}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>反饋列表</Text>
          {feedbacks.map(renderFeedbackItem)}
        </View>

        {/* 載入更多 */}
        {pagination.page < pagination.totalPages && (
          <Button
            title="載入更多"
            onPress={() => loadFeedbacks(pagination.page + 1)}
            loading={loading}
            style={styles.loadMoreButton}
          />
        )}
      </ScrollView>

      {/* 反饋詳情模態框 */}
      <Modal
        visible={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="反饋詳情"
      >
        {selectedFeedback && (
          <ScrollView style={styles.detailContent}>
            <View style={styles.detailSection}>
              <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>標題</Text>
              <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                {selectedFeedback.title}
              </Text>
            </View>

            <View style={styles.detailSection}>
              <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>描述</Text>
              <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                {selectedFeedback.description}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <View style={styles.detailSection}>
                <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>類型</Text>
                <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                  {selectedFeedback.feedbackType}
                </Text>
              </View>
              <View style={styles.detailSection}>
                <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>分類</Text>
                <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                  {selectedFeedback.category}
                </Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <View style={styles.detailSection}>
                <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>狀態</Text>
                <View style={[styles.badge, { backgroundColor: getStatusColor(selectedFeedback.status) }]}>
                  <Text style={styles.badgeText}>{selectedFeedback.status}</Text>
                </View>
              </View>
              <View style={styles.detailSection}>
                <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>優先級</Text>
                <View style={[styles.badge, { backgroundColor: getPriorityColor(selectedFeedback.priority) }]}>
                  <Text style={styles.badgeText}>{selectedFeedback.priority}</Text>
                </View>
              </View>
            </View>

            {selectedFeedback.responses.length > 0 && (
              <View style={styles.detailSection}>
                <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>回應</Text>
                {selectedFeedback.responses.map((response, index) => (
                  <View key={index} style={styles.responseItem}>
                    <View style={styles.responseHeader}>
                      <Text style={[styles.responseUser, { color: theme.colors.text }]}>
                        {response.user.username}
                      </Text>
                      <Text style={[styles.responseDate, { color: theme.colors.textSecondary }]}>
                        {new Date(response.createdAt).toLocaleString()}
                      </Text>
                    </View>
                    <Text style={[styles.responseContent, { color: theme.colors.text }]}>
                      {response.content}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            <View style={styles.detailActions}>
              <Button
                title="更新狀態"
                onPress={() => {
                  Alert.prompt(
                    '更新狀態',
                    '請選擇新狀態',
                    [
                      { text: '取消', style: 'cancel' },
                      { text: '待處理', onPress: () => handleStatusUpdate(selectedFeedback.id, 'pending') },
                      { text: '審核中', onPress: () => handleStatusUpdate(selectedFeedback.id, 'under_review') },
                      { text: '處理中', onPress: () => handleStatusUpdate(selectedFeedback.id, 'in_progress') },
                      { text: '已解決', onPress: () => handleStatusUpdate(selectedFeedback.id, 'resolved') },
                      { text: '已拒絕', onPress: () => handleStatusUpdate(selectedFeedback.id, 'rejected') },
                      { text: '已關閉', onPress: () => handleStatusUpdate(selectedFeedback.id, 'closed') }
                    ]
                  );
                }}
                style={styles.actionButton}
              />
              <Button
                title="分配給"
                onPress={() => {
                  Alert.prompt(
                    '分配反饋',
                    '請輸入用戶ID',
                    [
                      { text: '取消', style: 'cancel' },
                      {
                        text: '確定',
                        onPress: (userId) => {
                          if (userId) {
                            handleAssignFeedback(selectedFeedback.id, parseInt(userId));
                          }
                        }
                      }
                    ],
                    'plain-text'
                  );
                }}
                style={styles.actionButton}
              />
            </View>
          </ScrollView>
        )}
      </Modal>

      {/* 添加回應模態框 */}
      <Modal
        visible={showResponseModal}
        onClose={() => setShowResponseModal(false)}
        title="添加回應"
      >
        <View style={styles.responseForm}>
          <Input
            label="回應內容"
            value={responseContent}
            onChangeText={setResponseContent}
            multiline
            numberOfLines={4}
            placeholder="請輸入回應內容..."
          />

          <View style={styles.responseOptions}>
            <Text style={[styles.optionLabel, { color: theme.colors.text }]}>回應類型:</Text>
            <View style={styles.optionButtons}>
              {['comment', 'status_update', 'assignment', 'resolution', 'follow_up'].map(type => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.optionButton,
                    responseType === type && { backgroundColor: theme.colors.primary }
                  ]}
                  onPress={() => setResponseType(type)}
                >
                  <Text style={[
                    styles.optionButtonText,
                    { color: responseType === type ? 'white' : theme.colors.text }
                  ]}>
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.responseOptions}>
            <Text style={[styles.optionLabel, { color: theme.colors.text }]}>內部回應:</Text>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                isInternal && { backgroundColor: theme.colors.primary }
              ]}
              onPress={() => setIsInternal(!isInternal)}
            >
              <Text style={[
                styles.toggleButtonText,
                { color: isInternal ? 'white' : theme.colors.text }
              ]}>
                {isInternal ? '是' : '否'}
              </Text>
            </TouchableOpacity>
          </View>

          <Button
            title="提交回應"
            onPress={handleAddResponse}
            style={styles.submitButton}
          />
        </View>
      </Modal>

      <Loading visible={loading} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  scrollView: {
    flex: 1,
    padding: 20
  },
  statsContainer: {
    marginBottom: 20
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  statCard: {
    flex: 1,
    marginHorizontal: 5,
    padding: 15,
    alignItems: 'center'
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center'
  },
  chartsContainer: {
    marginBottom: 20
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 20
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16
  },
  suggestionsContainer: {
    marginBottom: 20
  },
  suggestionCard: {
    marginBottom: 10,
    padding: 15
  },
  suggestionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  suggestionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12
  },
  suggestionDescription: {
    fontSize: 14,
    marginBottom: 10
  },
  suggestionAction: {
    fontSize: 12,
    fontStyle: 'italic'
  },
  feedbacksContainer: {
    marginBottom: 20
  },
  feedbackCard: {
    marginBottom: 15,
    padding: 15
  },
  feedbackHeader: {
    marginBottom: 10
  },
  feedbackTitle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 5
  },
  feedbackTitleText: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 10
  },
  feedbackBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 5,
    marginBottom: 5
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold'
  },
  feedbackMeta: {
    fontSize: 12
  },
  feedbackDescription: {
    fontSize: 14,
    marginBottom: 10
  },
  feedbackFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10
  },
  feedbackUser: {
    fontSize: 12
  },
  feedbackDate: {
    fontSize: 12
  },
  feedbackActions: {
    flexDirection: 'row',
    justifyContent: 'space-around'
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 5
  },
  loadMoreButton: {
    marginTop: 20
  },
  detailContent: {
    maxHeight: 500
  },
  detailSection: {
    marginBottom: 15
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  detailLabel: {
    fontSize: 12,
    marginBottom: 5
  },
  detailValue: {
    fontSize: 14
  },
  responseItem: {
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 8
  },
  responseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5
  },
  responseUser: {
    fontSize: 12,
    fontWeight: 'bold'
  },
  responseDate: {
    fontSize: 10
  },
  responseContent: {
    fontSize: 12
  },
  detailActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20
  },
  responseForm: {
    padding: 20
  },
  responseOptions: {
    marginTop: 15
  },
  optionLabel: {
    fontSize: 14,
    marginBottom: 10
  },
  optionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  optionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: '#f0f0f0'
  },
  optionButtonText: {
    fontSize: 12
  },
  toggleButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    alignSelf: 'flex-start'
  },
  toggleButtonText: {
    fontSize: 14
  },
  submitButton: {
    marginTop: 20
  }
});

export default FeedbackManagementScreen;
