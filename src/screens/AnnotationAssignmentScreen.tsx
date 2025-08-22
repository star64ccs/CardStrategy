import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useTheme } from '@/config/ThemeProvider';
import { useTranslation } from '@/i18n';
import { dataQualityService } from '@/services';
import {
  AssignmentOptions,
  AssignmentResponse,
  AssignmentConfig,
  AnnotatorDetails,
} from '@/services/dataQualityService';
import { Button, Card, Input, Modal, Toast } from '@/components/common';
import { BarChart, PieChart, LineChart } from 'react-native-chart-kit';

const { width } = Dimensions.get('window');

interface AssignmentStats {
  totalAssigned: number;
  averageExpectedQuality: number;
  distributionByType: Record<string, number>;
  distributionByDifficulty: Record<string, number>;
  distributionByAnnotator: Record<string, number>;
}

const AnnotationAssignmentScreen: React.FC = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState<AssignmentConfig | null>(null);
  const [annotators, setAnnotators] = useState<AnnotatorDetails[]>([]);
  const [stats, setStats] = useState<AssignmentStats | null>(null);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [assignmentOptions, setAssignmentOptions] = useState<AssignmentOptions>(
    {
      batchSize: 50,
      forceReassignment: false,
    }
  );

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [configRes, annotatorsRes] = await Promise.all([
        dataQualityService.getAssignmentConfig(),
        dataQualityService.getAnnotatorDetails(),
      ]);

      setConfig(configRes.data.config);
      setAnnotators(annotatorsRes.data.annotators);
    } catch (error) {
      // logger.info('加載數據失敗:', error);
      Toast.show('加載數據失敗', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSmartAssignment = async () => {
    setLoading(true);
    try {
      const response =
        await dataQualityService.assignAnnotationTasks(assignmentOptions);
      const result: AssignmentResponse = response.data;

      // 更新統計數據
      const newStats: AssignmentStats = {
        totalAssigned: result.totalAssigned,
        averageExpectedQuality:
          result.assignments.reduce((sum, a) => sum + a.expectedQuality, 0) /
          result.assignments.length,
        distributionByType: {},
        distributionByDifficulty: {},
        distributionByAnnotator: {},
      };

      result.assignments.forEach((assignment) => {
        newStats.distributionByType[assignment.annotationType] =
          (newStats.distributionByType[assignment.annotationType] || 0) + 1;
        newStats.distributionByAnnotator[assignment.annotatorId.toString()] =
          (newStats.distributionByAnnotator[
            assignment.annotatorId.toString()
          ] || 0) + 1;
      });

      setStats(newStats);
      setShowAssignmentModal(false);
      Toast.show(`成功分配 ${result.totalAssigned} 個任務`, 'success');
    } catch (error) {
      // logger.info('智能分配失敗:', error);
      Toast.show('智能分配失敗', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateConfig = async (newConfig: Partial<AssignmentConfig>) => {
    try {
      const response =
        await dataQualityService.updateAssignmentConfig(newConfig);
      setConfig(response.data.config);
      setShowConfigModal(false);
      Toast.show('配置更新成功', 'success');
    } catch (error) {
      // logger.info('配置更新失敗:', error);
      Toast.show('配置更新失敗', 'error');
    }
  };

  const renderAlgorithmFeatures = () => {
    const features = [
      '智能負載均衡',
      '專業化分配',
      '動態優先級',
      '質量預測',
      '學習機制',
    ];

    return (
      <View style={styles.featuresContainer}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          算法特性
        </Text>
        <View style={styles.featuresGrid}>
          {features.map((feature, index) => (
            <View
              key={index}
              style={[
                styles.featureItem,
                { backgroundColor: theme.colors.card },
              ]}
            >
              <Text style={[styles.featureText, { color: theme.colors.text }]}>
                {feature}
              </Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderConfigSection = () => {
    if (!config) return null;

    return (
      <Card style={styles.card}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          分配算法配置
        </Text>
        <View style={styles.configGrid}>
          <View style={styles.configItem}>
            <Text
              style={[
                styles.configLabel,
                { color: theme.colors.textSecondary },
              ]}
            >
              最大任務數
            </Text>
            <Text style={[styles.configValue, { color: theme.colors.text }]}>
              {config.maxTasksPerAnnotator}
            </Text>
          </View>
          <View style={styles.configItem}>
            <Text
              style={[
                styles.configLabel,
                { color: theme.colors.textSecondary },
              ]}
            >
              質量閾值
            </Text>
            <Text style={[styles.configValue, { color: theme.colors.text }]}>
              {(config.qualityThreshold * 100).toFixed(1)}%
            </Text>
          </View>
          <View style={styles.configItem}>
            <Text
              style={[
                styles.configLabel,
                { color: theme.colors.textSecondary },
              ]}
            >
              工作量權重
            </Text>
            <Text style={[styles.configValue, { color: theme.colors.text }]}>
              {(config.workloadWeight * 100).toFixed(1)}%
            </Text>
          </View>
          <View style={styles.configItem}>
            <Text
              style={[
                styles.configLabel,
                { color: theme.colors.textSecondary },
              ]}
            >
              專業度權重
            </Text>
            <Text style={[styles.configValue, { color: theme.colors.text }]}>
              {(config.expertiseWeight * 100).toFixed(1)}%
            </Text>
          </View>
        </View>
        <Button
          title="編輯配置"
          onPress={() => setShowConfigModal(true)}
          style={styles.editButton}
        />
      </Card>
    );
  };

  const renderAnnotatorsSection = () => {
    const expertAnnotators = annotators.filter((a) => a.level === 'expert');
    const seniorAnnotators = annotators.filter((a) => a.level === 'senior');
    const juniorAnnotators = annotators.filter((a) => a.level === 'junior');

    const chartData = [
      {
        name: '專家',
        population: expertAnnotators.length,
        color: '#FF6B6B',
        legendFontColor: theme.colors.text,
        legendFontSize: 12,
      },
      {
        name: '資深',
        population: seniorAnnotators.length,
        color: '#4ECDC4',
        legendFontColor: theme.colors.text,
        legendFontSize: 12,
      },
      {
        name: '初級',
        population: juniorAnnotators.length,
        color: '#45B7D1',
        legendFontColor: theme.colors.text,
        legendFontSize: 12,
      },
    ];

    return (
      <Card style={styles.card}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          標註者分佈
        </Text>
        <View style={styles.chartContainer}>
          <PieChart
            data={chartData}
            width={width - 80}
            height={200}
            chartConfig={{
              backgroundColor: theme.colors.background,
              backgroundGradientFrom: theme.colors.background,
              backgroundGradientTo: theme.colors.background,
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            }}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
          />
        </View>
        <View style={styles.annotatorStats}>
          <View style={styles.statItem}>
            <Text
              style={[styles.statLabel, { color: theme.colors.textSecondary }]}
            >
              總標註者
            </Text>
            <Text style={[styles.statValue, { color: theme.colors.text }]}>
              {annotators.length}
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text
              style={[styles.statLabel, { color: theme.colors.textSecondary }]}
            >
              活躍標註者
            </Text>
            <Text style={[styles.statValue, { color: theme.colors.text }]}>
              {annotators.filter((a) => a.isActive).length}
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text
              style={[styles.statLabel, { color: theme.colors.textSecondary }]}
            >
              平均準確率
            </Text>
            <Text style={[styles.statValue, { color: theme.colors.text }]}>
              {(
                (annotators.reduce((sum, a) => sum + a.accuracy, 0) /
                  annotators.length) *
                100
              ).toFixed(1)}
              %
            </Text>
          </View>
        </View>
      </Card>
    );
  };

  const renderAssignmentStats = () => {
    if (!stats) return null;

    const typeData = Object.entries(stats.distributionByType).map(
      ([type, count]) => ({
        name: type,
        count,
      })
    );

    const difficultyData = Object.entries(stats.distributionByDifficulty).map(
      ([difficulty, count]) => ({
        name: difficulty,
        count,
      })
    );

    return (
      <Card style={styles.card}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          分配統計
        </Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text
              style={[styles.statLabel, { color: theme.colors.textSecondary }]}
            >
              總分配數
            </Text>
            <Text style={[styles.statValue, { color: theme.colors.text }]}>
              {stats.totalAssigned}
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text
              style={[styles.statLabel, { color: theme.colors.textSecondary }]}
            >
              預期平均質量
            </Text>
            <Text style={[styles.statValue, { color: theme.colors.text }]}>
              {(stats.averageExpectedQuality * 100).toFixed(1)}%
            </Text>
          </View>
        </View>
        {typeData.length > 0 && (
          <View style={styles.chartContainer}>
            <Text style={[styles.chartTitle, { color: theme.colors.text }]}>
              按類型分佈
            </Text>
            <BarChart
              data={{
                labels: typeData.map((d) => d.name),
                datasets: [
                  {
                    data: typeData.map((d) => d.count),
                  },
                ],
              }}
              width={width - 80}
              height={200}
              chartConfig={{
                backgroundColor: theme.colors.background,
                backgroundGradientFrom: theme.colors.background,
                backgroundGradientTo: theme.colors.background,
                decimalPlaces: 0,
                color: (opacity = 1) => theme.colors.primary,
                labelColor: (opacity = 1) => theme.colors.text,
              }}
              style={styles.chart}
            />
          </View>
        )}
      </Card>
    );
  };

  const renderConfigModal = () => {
    if (!config) return null;

    const [tempConfig, setTempConfig] = useState<AssignmentConfig>(config);

    const handleSave = () => {
      handleUpdateConfig(tempConfig);
    };

    return (
      <Modal
        visible={showConfigModal}
        onClose={() => setShowConfigModal(false)}
        title="編輯分配算法配置"
      >
        <ScrollView style={styles.modalContent}>
          <View style={styles.configForm}>
            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: theme.colors.text }]}>
                最大任務數
              </Text>
              <Input
                value={tempConfig.maxTasksPerAnnotator.toString()}
                onChangeText={(text) =>
                  setTempConfig({
                    ...tempConfig,
                    maxTasksPerAnnotator: parseInt(text) || 10,
                  })
                }
                keyboardType="numeric"
                placeholder="10"
              />
            </View>
            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: theme.colors.text }]}>
                質量閾值 (0-1)
              </Text>
              <Input
                value={tempConfig.qualityThreshold.toString()}
                onChangeText={(text) =>
                  setTempConfig({
                    ...tempConfig,
                    qualityThreshold: parseFloat(text) || 0.85,
                  })
                }
                keyboardType="numeric"
                placeholder="0.85"
              />
            </View>
            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: theme.colors.text }]}>
                工作量權重 (0-1)
              </Text>
              <Input
                value={tempConfig.workloadWeight.toString()}
                onChangeText={(text) =>
                  setTempConfig({
                    ...tempConfig,
                    workloadWeight: parseFloat(text) || 0.3,
                  })
                }
                keyboardType="numeric"
                placeholder="0.3"
              />
            </View>
            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: theme.colors.text }]}>
                專業度權重 (0-1)
              </Text>
              <Input
                value={tempConfig.expertiseWeight.toString()}
                onChangeText={(text) =>
                  setTempConfig({
                    ...tempConfig,
                    expertiseWeight: parseFloat(text) || 0.4,
                  })
                }
                keyboardType="numeric"
                placeholder="0.4"
              />
            </View>
            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: theme.colors.text }]}>
                質量權重 (0-1)
              </Text>
              <Input
                value={tempConfig.qualityWeight.toString()}
                onChangeText={(text) =>
                  setTempConfig({
                    ...tempConfig,
                    qualityWeight: parseFloat(text) || 0.3,
                  })
                }
                keyboardType="numeric"
                placeholder="0.3"
              />
            </View>
          </View>
          <View style={styles.modalButtons}>
            <Button
              title="取消"
              onPress={() => setShowConfigModal(false)}
              style={[styles.modalButton, styles.cancelButton]}
            />
            <Button
              title="保存"
              onPress={handleSave}
              style={[styles.modalButton, styles.saveButton]}
            />
          </View>
        </ScrollView>
      </Modal>
    );
  };

  const renderAssignmentModal = () => {
    return (
      <Modal
        visible={showAssignmentModal}
        onClose={() => setShowAssignmentModal(false)}
        title="智能分配設置"
      >
        <ScrollView style={styles.modalContent}>
          <View style={styles.configForm}>
            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: theme.colors.text }]}>
                批次大小
              </Text>
              <Input
                value={assignmentOptions.batchSize?.toString()}
                onChangeText={(text) =>
                  setAssignmentOptions({
                    ...assignmentOptions,
                    batchSize: parseInt(text) || 50,
                  })
                }
                keyboardType="numeric"
                placeholder="50"
              />
            </View>
            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: theme.colors.text }]}>
                優先級過濾
              </Text>
              <Input
                value={assignmentOptions.priorityFilter}
                onChangeText={(text) =>
                  setAssignmentOptions({
                    ...assignmentOptions,
                    priorityFilter: text || undefined,
                  })
                }
                placeholder="high, normal, low"
              />
            </View>
            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: theme.colors.text }]}>
                難度過濾
              </Text>
              <Input
                value={assignmentOptions.difficultyFilter}
                onChangeText={(text) =>
                  setAssignmentOptions({
                    ...assignmentOptions,
                    difficultyFilter: text || undefined,
                  })
                }
                placeholder="easy, medium, hard"
              />
            </View>
            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: theme.colors.text }]}>
                標註類型過濾
              </Text>
              <Input
                value={assignmentOptions.annotationTypeFilter}
                onChangeText={(text) =>
                  setAssignmentOptions({
                    ...assignmentOptions,
                    annotationTypeFilter: text || undefined,
                  })
                }
                placeholder="card_identification, condition_assessment"
              />
            </View>
          </View>
          <View style={styles.modalButtons}>
            <Button
              title="取消"
              onPress={() => setShowAssignmentModal(false)}
              style={[styles.modalButton, styles.cancelButton]}
            />
            <Button
              title="開始分配"
              onPress={handleSmartAssignment}
              style={[styles.modalButton, styles.saveButton]}
              loading={loading}
            />
          </View>
        </ScrollView>
      </Modal>
    );
  };

  if (loading && !config) {
    return (
      <View
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          智能標註任務分配
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          優化算法 v2.0 - 智能負載均衡與專業化分配
        </Text>
      </View>

      {renderAlgorithmFeatures()}
      {renderConfigSection()}
      {renderAnnotatorsSection()}
      {renderAssignmentStats()}

      <View style={styles.actionButtons}>
        <Button
          title="智能分配任務"
          onPress={() => setShowAssignmentModal(true)}
          style={styles.primaryButton}
          loading={loading}
        />
        <Button
          title="刷新數據"
          onPress={loadData}
          style={styles.secondaryButton}
        />
      </View>

      {renderConfigModal()}
      {renderAssignmentModal()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  featuresContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  featureItem: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  featureText: {
    fontSize: 12,
    fontWeight: '500',
  },
  card: {
    marginBottom: 16,
    padding: 16,
  },
  configGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 16,
  },
  configItem: {
    flex: 1,
    minWidth: 120,
  },
  configLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  configValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  editButton: {
    marginTop: 8,
  },
  chartContainer: {
    marginVertical: 16,
  },
  chartTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  chart: {
    borderRadius: 8,
  },
  annotatorStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  actionButtons: {
    gap: 12,
    marginTop: 24,
    marginBottom: 32,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  secondaryButton: {
    backgroundColor: '#6C757D',
  },
  modalContent: {
    maxHeight: 400,
  },
  configForm: {
    gap: 16,
  },
  formGroup: {
    gap: 8,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  modalButton: {
    flex: 1,
  },
  cancelButton: {
    backgroundColor: '#6C757D',
  },
  saveButton: {
    backgroundColor: '#28A745',
  },
});

export default AnnotationAssignmentScreen;
