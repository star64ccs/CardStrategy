// GraphTable示例Component
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';

import useChart from '../hooks/useChart';
import type { ChartCreateRequest } from '../types/chart';
import { ChartType, ChartConfig, ChartData } from '../types/chart';

// GraphTable示例Component
const ChartExample: React.FC = () => {
  const {
    charts,
    currentChart,
    templates,
    statistics,
    loading,
    error,
    chartCount,
    hasCharts,
    isLoading,
    hasError,
    createNewChart,
    fetchCharts,
    removeChartById,
    exportChartAs,
    selectChart,
    clearErrors,
  } = useChart();

  const [activeTab, setActiveTab] = useState<
    'charts' | 'templates' | 'statistics'
  >('charts');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newChartTitle, setNewChartTitle] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');

  // AutoGetGraphTableList
  useEffect(() => {
    fetchCharts();
  }, [fetchCharts]);

  // Create新GraphTable
  const _handleCreateChart = async () => {
    if (!newChartTitle.trim()) {
      Alert.alert('Error', '請輸入圖表標題');
      return;
    }

    const request: ChartCreateRequest = {
      config: {
        type: ChartType.LINE,
        title: newChartTitle,
        responsive: true,
        animation: true,
        legend: {
          display: true,
          position: 'top',
          align: 'center',
          labels: {
            color: '#333333',
            fontSize: 12,
            fontFamily: 'Arial, sans-serif',
            padding: 10,
            usePointStyle: false,
          },
        },
        tooltip: {
          enabled: true,
          mode: 'index',
          intersect: false,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleColor: '#FFFFFF',
          bodyColor: '#FFFFFF',
          borderColor: '#000000',
          borderWidth: 1,
          cornerRadius: 4,
          caretSize: 5,
          displayColors: true,
          titleFontSize: 14,
          bodyFontSize: 12,
          footerFontSize: 10,
          padding: 8,
        },
        export: {
          enabled: true,
          formats: ['png', 'jpg', 'svg', 'pdf'],
          quality: 0.9,
        },
      },
      data: {
        labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
        datasets: [
          {
            label: '銷售額',
            data: [
              { label: '1月', value: Math.floor(Math.random() * 200) + 50 },
              { label: '2月', value: Math.floor(Math.random() * 200) + 50 },
              { label: '3月', value: Math.floor(Math.random() * 200) + 50 },
              { label: '4月', value: Math.floor(Math.random() * 200) + 50 },
              { label: '5月', value: Math.floor(Math.random() * 200) + 50 },
              { label: '6月', value: Math.floor(Math.random() * 200) + 50 },
            ],
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 2,
            fill: false,
            tension: 0.4,
          },
        ],
      },
      templateId: selectedTemplate || undefined,
    };

    const _chart = await createNewChart(request);
    if (chart) {
      setShowCreateModal(false);
      setNewChartTitle('');
      setSelectedTemplate('');
      Alert.alert('Success', '圖表CreateSuccess');
    }
  };

  // DeleteGraphTable
  const _handleDeleteChart = async (chartId: string) => {
    Alert.alert('確認刪除', '確定要刪除這個圖表嗎？', [
      { text: '取消', style: 'cancel' },
      {
        text: '刪除',
        style: 'destructive',
        onPress: async () => {
          const _success = await removeChartById(chartId);
          if (success) {
            Alert.alert('Success', '圖表DeleteSuccess');
          }
        },
      },
    ]);
  };

  // ExportGraphTable
  const _handleExportChart = async (
    chartId: string,
    format: 'png' | 'jpg' | 'svg' | 'pdf'
  ) => {
    const _success = await exportChartAs(chartId, format);
    if (success) {
      Alert.alert('Success', `圖表已導出為 ${format.toUpperCase()} 格式`);
    }
  };

  // SelectGraphTable
  const _handleSelectChart = (chartId: string) => {
    selectChart(chartId);
  };

  // 渲染GraphTableList
  const _renderChartsList = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>圖表列表 ({chartCount})</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => setShowCreateModal(true)}
        >
          <Text style={styles.createButtonText}>創建圖表</Text>
        </TouchableOpacity>
      </View>

      {hasCharts ? (
        <ScrollView style={styles.chartsList}>
          {charts.map(chart => (
            <View key={chart.id} style={styles.chartItem}>
              <View style={styles.chartInfo}>
                <Text style={styles.chartTitle}>
                  {chart.config.title || '未命名圖表'}
                </Text>
                <Text style={styles.chartType}>類型: {chart.config.type}</Text>
                <Text style={styles.chartStatus}>狀態: {chart.status}</Text>
                <Text style={styles.chartDate}>
                  更新時間: {chart.lastUpdate.toLocaleString()}
                </Text>
              </View>

              <View style={styles.chartActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleSelectChart(chart.id)}
                >
                  <Text style={styles.actionButtonText}>查看</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, styles.exportButton]}
                  onPress={() => handleExportChart(chart.id, 'png')}
                >
                  <Text style={styles.actionButtonText}>導出</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => handleDeleteChart(chart.id)}
                >
                  <Text style={styles.actionButtonText}>刪除</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>暫無圖表</Text>
          <Text style={styles.emptySubtext}>點擊"創建圖表"開始使用</Text>
        </View>
      )}
    </View>
  );

  // 渲染當前GraphTable
  const _renderCurrentChart = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>當前圖表</Text>

      {currentChart ? (
        <View style={styles.currentChart}>
          <Text style={styles.chartTitle}>{currentChart.config.title}</Text>
          <Text style={styles.chartType}>類型: {currentChart.config.type}</Text>
          <Text style={styles.chartStatus}>狀態: {currentChart.status}</Text>

          <View style={styles.chartData}>
            <Text style={styles.dataTitle}>
              數據集 ({currentChart.data.datasets.length})
            </Text>
            {currentChart.data.datasets.map((dataset, index) => (
              <Text key={index} style={styles.datasetInfo}>
                {dataset.label}: {dataset.data.length} 個數據點
              </Text>
            ))}
          </View>

          <View style={styles.chartActions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.exportButton]}
              onPress={() => handleExportChart(currentChart.id, 'png')}
            >
              <Text style={styles.actionButtonText}>導出 PNG</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.exportButton]}
              onPress={() => handleExportChart(currentChart.id, 'pdf')}
            >
              <Text style={styles.actionButtonText}>導出 PDF</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>未選擇圖表</Text>
          <Text style={styles.emptySubtext}>從圖表列表中選擇一個圖表</Text>
        </View>
      )}
    </View>
  );

  // 渲染模板List
  const _renderTemplatesList = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>圖表模板 ({templates.length})</Text>

      {templates.length > 0 ? (
        <ScrollView style={styles.templatesList}>
          {templates.map(template => (
            <View key={template.id} style={styles.templateItem}>
              <View style={styles.templateInfo}>
                <Text style={styles.templateName}>{template.name}</Text>
                <Text style={styles.templateDescription}>
                  {template.description}
                </Text>
                <Text style={styles.templateCategory}>
                  分類: {template.category}
                </Text>
                <Text style={styles.templateType}>類型: {template.type}</Text>
                <Text style={styles.templateRating}>
                  評分: {template.rating}/5
                </Text>
                <Text style={styles.templateDownloads}>
                  下載: {template.downloads}
                </Text>
              </View>

              <View style={styles.templateActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => {
                    setSelectedTemplate(template.id);
                    setShowCreateModal(true);
                  }}
                >
                  <Text style={styles.actionButtonText}>使用模板</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>暫無模板</Text>
        </View>
      )}
    </View>
  );

  // 渲染StatisticsInformation
  const _renderStatistics = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>統計信息</Text>

      {statistics ? (
        <View style={styles.statistics}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>總圖表數</Text>
            <Text style={styles.statValue}>{statistics.totalCharts}</Text>
          </View>

          <View style={styles.statItem}>
            <Text style={styles.statLabel}>總瀏覽量</Text>
            <Text style={styles.statValue}>{statistics.totalViews}</Text>
          </View>

          <View style={styles.statItem}>
            <Text style={styles.statLabel}>總導出數</Text>
            <Text style={styles.statValue}>{statistics.totalExports}</Text>
          </View>

          <View style={styles.statItem}>
            <Text style={styles.statLabel}>平均渲染時間</Text>
            <Text style={styles.statValue}>
              {statistics.averageRenderTime.toFixed(2)}ms
            </Text>
          </View>

          <View style={styles.statItem}>
            <Text style={styles.statLabel}>熱門模板</Text>
            <Text style={styles.statValue}>
              {statistics.popularTemplates.length} 個
            </Text>
          </View>
        </View>
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>暫無統計數據</Text>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* 標題 */}
      <View style={styles.header}>
        <Text style={styles.title}>圖表系統</Text>
        {hasError && (
          <TouchableOpacity style={styles.errorButton} onPress={clearErrors}>
            <Text style={styles.errorButtonText}>清除錯誤</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Error提示 */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* 加載指示器 */}
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size='large' color='#007AFF' />
          <Text style={styles.loadingText}>處理中...</Text>
        </View>
      )}

      {/* Tag頁 */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'charts' && styles.activeTab]}
          onPress={() => setActiveTab('charts')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'charts' && styles.activeTabText,
            ]}
          >
            圖表
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'templates' && styles.activeTab]}
          onPress={() => setActiveTab('templates')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'templates' && styles.activeTabText,
            ]}
          >
            模板
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'statistics' && styles.activeTab]}
          onPress={() => setActiveTab('statistics')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'statistics' && styles.activeTabText,
            ]}
          >
            統計
          </Text>
        </TouchableOpacity>
      </View>

      {/* ContentDistrict域 */}
      <ScrollView style={styles.content}>
        {activeTab === 'charts' && (
          <>
            {renderChartsList()}
            {renderCurrentChart()}
          </>
        )}

        {activeTab === 'templates' && renderTemplatesList()}
        {activeTab === 'statistics' && renderStatistics()}
      </ScrollView>

      {/* CreateGraphTable模態框 */}
      <Modal
        visible={showCreateModal}
        animationType='slide'
        transparent={true}
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>創建新圖表</Text>

            <TextInput
              style={styles.input}
              placeholder='圖表標題'
              value={newChartTitle}
              onChangeText={setNewChartTitle}
            />

            {templates.length > 0 && (
              <View style={styles.templateSelect}>
                <Text style={styles.templateSelectLabel}>選擇模板 (可選)</Text>
                <ScrollView style={styles.templateSelectList}>
                  {templates.map(template => (
                    <TouchableOpacity
                      key={template.id}
                      style={[
                        styles.templateOption,
                        selectedTemplate === template.id &&
                          styles.selectedTemplate,
                      ]}
                      onPress={() => setSelectedTemplate(template.id)}
                    >
                      <Text style={styles.templateOptionText}>
                        {template.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowCreateModal(false);
                  setNewChartTitle('');
                  setSelectedTemplate('');
                }}
              >
                <Text style={styles.cancelButtonText}>取消</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleCreateChart}
              >
                <Text style={styles.confirmButtonText}>創建</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// 樣式
const _styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
  },
  errorButton: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  errorButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
  },
  errorContainer: {
    backgroundColor: '#FFE5E5',
    padding: 12,
    margin: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FF3B30',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 8,
    color: '#666666',
    fontSize: 14,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#007AFF',
  },
  tabText: {
    fontSize: 16,
    color: '#666666',
  },
  activeTabText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  createButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  chartsList: {
    maxHeight: 300,
  },
  chartItem: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  chartInfo: {
    marginBottom: 12,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  chartType: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 2,
  },
  chartStatus: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 2,
  },
  chartDate: {
    fontSize: 12,
    color: '#999999',
  },
  chartActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    flex: 1,
    marginHorizontal: 4,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    textAlign: 'center',
  },
  exportButton: {
    backgroundColor: '#34C759',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999999',
  },
  currentChart: {
    borderWidth: 1,
    borderColor: '#007AFF',
    borderRadius: 8,
    padding: 16,
    backgroundColor: '#F0F8FF',
  },
  chartData: {
    marginTop: 12,
    marginBottom: 16,
  },
  dataTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  datasetInfo: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 4,
  },
  templatesList: {
    maxHeight: 400,
  },
  templateItem: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  templateInfo: {
    marginBottom: 12,
  },
  templateName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  templateDescription: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  templateCategory: {
    fontSize: 12,
    color: '#999999',
    marginBottom: 2,
  },
  templateType: {
    fontSize: 12,
    color: '#999999',
    marginBottom: 2,
  },
  templateRating: {
    fontSize: 12,
    color: '#999999',
    marginBottom: 2,
  },
  templateDownloads: {
    fontSize: 12,
    color: '#999999',
  },
  templateActions: {
    alignItems: 'flex-end',
  },
  statistics: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  templateSelect: {
    marginBottom: 20,
  },
  templateSelectLabel: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  templateSelectList: {
    maxHeight: 120,
  },
  templateOption: {
    padding: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 4,
    marginBottom: 4,
  },
  selectedTemplate: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  templateOptionText: {
    fontSize: 14,
    color: '#333333',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 8,
  },
  cancelButton: {
    backgroundColor: '#F2F2F2',
  },
  confirmButton: {
    backgroundColor: '#007AFF',
  },
  cancelButtonText: {
    color: '#666666',
    fontSize: 16,
    textAlign: 'center',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '600',
  },
});

export default ChartExample;
