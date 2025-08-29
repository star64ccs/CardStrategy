import React, { useState } from 'react';
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

import { useReport } from '../hooks/useReport';
import {
  AggregationFunction,
  DeliveryMethod,
  ReportCategory,
  ReportType,
  VisualizationType,
  ExportFormat,
} from '../types/report';

const ReportExample: React.FC = () => {
  const {
    // 狀態
    templates,
    currentTemplate,
    reports,
    currentReport,
    exports,
    analytics,
    isLoading,
    error,
    status,

    // 計算屬性
    hasTemplates,
    hasReports,
    hasExports,
    hasAnalytics,
    templateCount,
    reportCount,
    exportCount,
    completedReportCount,
    completedExportCount,

    // 操作方法
    createNewTemplate,
    createNewReport,
    exportReportById,
    fetchAnalytics,
    selectTemplate,
    selectReport,

    // 快速方法
    quickCreateBusinessReport,
    quickCreateFinancialReport,
    quickExportToPDF,
    quickExportToExcel,
  } = useReport();

  const [activeTab, setActiveTab] = useState<
    'templates' | 'reports' | 'exports' | 'analytics'
  >('templates');
  const [showCreateTemplateModal, setShowCreateTemplateModal] = useState(false);
  const [showCreateReportModal, setShowCreateReportModal] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateDescription, setNewTemplateDescription] = useState('');
  const [newTemplateCategory, setNewTemplateCategory] =
    useState<ReportCategory>(ReportCategory.BUSINESS);
  const [newReportName, setNewReportName] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');

  const _handleCreateTemplate = async () => {
    if (!newTemplateName.trim()) {
      Alert.alert('錯誤', '請輸入模板名稱');
      return;
    }

    try {
      await createNewTemplate({
        name: newTemplateName,
        description: newTemplateDescription,
        category: newTemplateCategory,
        type: ReportType.DAILY,
        config: {
          dataSources: ['user_behavior', 'business_metrics'],
          filters: [],
          aggregations: [
            {
              field: 'revenue',
              function: AggregationFunction.SUM,
              alias: 'total_revenue',
            },
          ],
          visualizations: [
            {
              type: VisualizationType.LINE_CHART,
              config: {
                title: '收入趨勢',
                colors: ['#4CAF50'],
                legend: true,
                tooltip: true,
                animation: true,
                responsive: true,
              },
              position: { x: 0, y: 0 },
              size: { width: 600, height: 400 },
            },
          ],
          format: ExportFormat.PDF,
          delivery: {
            method: DeliveryMethod.EMAIL,
            email: {
              recipients: ['admin@example.com'],
              subject: '業務報告',
              body: '請查收附件中的業務報告',
              attachments: true,
            },
          },
          retention: {
            days: 30,
            maxReports: 100,
            archiveAfter: 7,
            deleteAfter: 30,
          },
        },
        recipients: ['admin@example.com'],
      });

      setShowCreateTemplateModal(false);
      setNewTemplateName('');
      setNewTemplateDescription('');
      setNewTemplateCategory(ReportCategory.BUSINESS);
      Alert.alert('成功', '模板創建成功');
    } catch (error) {
      Alert.alert('錯誤', `創建模板失敗: ${error}`);
    }
  };

  const _handleCreateReport = async () => {
    if (!newReportName.trim() || !selectedTemplateId) {
      Alert.alert('錯誤', '請輸入報告名稱並選擇模板');
      return;
    }

    try {
      await createNewReport({
        templateId: selectedTemplateId,
        name: newReportName,
      });

      setShowCreateReportModal(false);
      setNewReportName('');
      setSelectedTemplateId('');
      Alert.alert('成功', '報告創建成功');
    } catch (error) {
      Alert.alert('錯誤', `創建報告失敗: ${error}`);
    }
  };

  const _handleQuickCreateBusinessReport = async () => {
    try {
      await quickCreateBusinessReport('快速業務報告');
      Alert.alert('成功', '業務報告創建成功');
    } catch (error) {
      Alert.alert('錯誤', `創建業務報告失敗: ${error}`);
    }
  };

  const _handleQuickCreateFinancialReport = async () => {
    try {
      await quickCreateFinancialReport('快速財務報告');
      Alert.alert('成功', '財務報告創建成功');
    } catch (error) {
      Alert.alert('錯誤', `創建財務報告失敗: ${error}`);
    }
  };

  const _handleExportToPDF = async (reportId: string) => {
    try {
      await exportReportById(reportId, {
        format: ExportFormat.PDF,
      });
      Alert.alert('成功', 'PDF導出已開始');
    } catch (error) {
      Alert.alert('錯誤', `PDF導出失敗: ${error}`);
    }
  };

  const _handleExportToExcel = async (reportId: string) => {
    try {
      await quickExportToExcel(reportId);
      Alert.alert('成功', 'Excel導出已開始');
    } catch (error) {
      Alert.alert('錯誤', `Excel導出失敗: ${error}`);
    }
  };

  const _renderTemplatesTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.header}>
        <Text style={styles.title}>報告模板</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => setShowCreateTemplateModal(true)}
        >
          <Text style={styles.buttonText}>創建模板</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.summary}>總計: {templateCount} 個模板</Text>

      {templates.map(template => (
        <View key={template.id} style={styles.item}>
          <View style={styles.itemHeader}>
            <Text style={styles.itemTitle}>{template.name}</Text>
            <Text style={styles.itemStatus}>
              {template.isActive ? '啟用' : '停用'}
            </Text>
          </View>
          <Text style={styles.itemDescription}>{template.description}</Text>
          <View style={styles.itemMeta}>
            <Text style={styles.itemMetaText}>類別: {template.category}</Text>
            <Text style={styles.itemMetaText}>類型: {template.type}</Text>
          </View>
          <TouchableOpacity
            style={styles.selectButton}
            onPress={() => selectTemplate(template)}
          >
            <Text style={styles.selectButtonText}>選擇</Text>
          </TouchableOpacity>
        </View>
      ))}

      {templates.length === 0 && <Text style={styles.emptyText}>暫無模板</Text>}
    </View>
  );

  const _renderReportsTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.header}>
        <Text style={styles.title}>報告列表</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => setShowCreateReportModal(true)}
        >
          <Text style={styles.buttonText}>創建報告</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.quickActions}>
        <TouchableOpacity
          style={styles.quickButton}
          onPress={handleQuickCreateBusinessReport}
        >
          <Text style={styles.quickButtonText}>快速業務報告</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.quickButton}
          onPress={handleQuickCreateFinancialReport}
        >
          <Text style={styles.quickButtonText}>快速財務報告</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.summary}>
        總計: {reportCount} 個報告 (已完成: {completedReportCount})
      </Text>

      {reports.map(report => (
        <View key={report.id} style={styles.item}>
          <View style={styles.itemHeader}>
            <Text style={styles.itemTitle}>{report.name}</Text>
            <Text style={styles.itemStatus}>{report.status}</Text>
          </View>
          <Text style={styles.itemDescription}>
            模板ID: {report.templateId}
          </Text>
          <Text style={styles.itemDescription}>
            生成時間: {report.generatedAt.toLocaleString()}
          </Text>
          <View style={styles.itemActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => selectReport(report)}
            >
              <Text style={styles.actionButtonText}>查看</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleExportToPDF(report.id)}
            >
              <Text style={styles.actionButtonText}>導出PDF</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleExportToExcel(report.id)}
            >
              <Text style={styles.actionButtonText}>導出Excel</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}

      {reports.length === 0 && <Text style={styles.emptyText}>暫無報告</Text>}
    </View>
  );

  const _renderExportsTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.header}>
        <Text style={styles.title}>導出記錄</Text>
      </View>

      <Text style={styles.summary}>
        總計: {exportCount} 個導出 (已完成: {completedExportCount})
      </Text>

      {exports.map(exportInstance => (
        <View key={exportInstance.id} style={styles.item}>
          <View style={styles.itemHeader}>
            <Text style={styles.itemTitle}>
              導出 #{exportInstance.id.slice(-8)}
            </Text>
            <Text style={styles.itemStatus}>{exportInstance.status}</Text>
          </View>
          <Text style={styles.itemDescription}>
            報告ID: {exportInstance.reportId}
          </Text>
          <Text style={styles.itemDescription}>
            格式: {exportInstance.format}
          </Text>
          <Text style={styles.itemDescription}>
            創建時間: {exportInstance.createdAt.toLocaleString()}
          </Text>
          {exportInstance.url && (
            <Text style={styles.itemDescription}>
              下載鏈接: {exportInstance.url}
            </Text>
          )}
        </View>
      ))}

      {exports.length === 0 && (
        <Text style={styles.emptyText}>暫無導出記錄</Text>
      )}
    </View>
  );

  const _renderAnalyticsTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.header}>
        <Text style={styles.title}>分析統計</Text>
        <TouchableOpacity style={styles.button} onPress={fetchAnalytics}>
          <Text style={styles.buttonText}>刷新</Text>
        </TouchableOpacity>
      </View>

      {analytics ? (
        <View>
          <View style={styles.analyticsCard}>
            <Text style={styles.analyticsTitle}>基本統計</Text>
            <Text style={styles.analyticsText}>
              總報告數: {analytics.totalReports}
            </Text>
            <Text style={styles.analyticsText}>
              活躍模板: {analytics.activeTemplates}
            </Text>
            <Text style={styles.analyticsText}>
              調度報告: {analytics.scheduledReports}
            </Text>
          </View>

          <View style={styles.analyticsCard}>
            <Text style={styles.analyticsTitle}>交付統計</Text>
            <Text style={styles.analyticsText}>
              成功交付: {analytics.deliverySuccess}
            </Text>
            <Text style={styles.analyticsText}>
              失敗交付: {analytics.deliveryFailure}
            </Text>
            <Text style={styles.analyticsText}>
              平均生成時間: {analytics.averageGenerationTime.toFixed(2)}ms
            </Text>
          </View>

          <View style={styles.analyticsCard}>
            <Text style={styles.analyticsTitle}>熱門模板</Text>
            {analytics.popularTemplates.slice(0, 5).map((template, index) => (
              <Text key={index} style={styles.analyticsText}>
                {template.name}: {template.usageCount} 次使用
              </Text>
            ))}
          </View>
        </View>
      ) : (
        <Text style={styles.emptyText}>暫無分析數據</Text>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.pageTitle}>報告系統示例</Text>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>錯誤: {error}</Text>
        </View>
      )}

      <View style={styles.tabContainer}>
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
            模板 ({templateCount})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'reports' && styles.activeTab]}
          onPress={() => setActiveTab('reports')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'reports' && styles.activeTabText,
            ]}
          >
            報告 ({reportCount})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'exports' && styles.activeTab]}
          onPress={() => setActiveTab('exports')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'exports' && styles.activeTabText,
            ]}
          >
            導出 ({exportCount})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'analytics' && styles.activeTab]}
          onPress={() => setActiveTab('analytics')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'analytics' && styles.activeTabText,
            ]}
          >
            分析
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {isLoading && (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>載入中...</Text>
          </View>
        )}

        {activeTab === 'templates' && renderTemplatesTab()}
        {activeTab === 'reports' && renderReportsTab()}
        {activeTab === 'exports' && renderExportsTab()}
        {activeTab === 'analytics' && renderAnalyticsTab()}
      </ScrollView>

      {/* 創建模板模態框 */}
      <Modal
        visible={showCreateTemplateModal}
        animationType='slide'
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>創建新模板</Text>

            <TextInput
              style={styles.input}
              placeholder='模板名稱'
              value={newTemplateName}
              onChangeText={setNewTemplateName}
            />

            <TextInput
              style={styles.input}
              placeholder='模板描述'
              value={newTemplateDescription}
              onChangeText={setNewTemplateDescription}
              multiline
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setShowCreateTemplateModal(false)}
              >
                <Text style={styles.modalButtonText}>取消</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonPrimary]}
                onPress={handleCreateTemplate}
              >
                <Text
                  style={[
                    styles.modalButtonText,
                    styles.modalButtonPrimaryText,
                  ]}
                >
                  創建
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 創建報告模態框 */}
      <Modal
        visible={showCreateReportModal}
        animationType='slide'
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>創建新報告</Text>

            <TextInput
              style={styles.input}
              placeholder='報告名稱'
              value={newReportName}
              onChangeText={setNewReportName}
            />

            <Text style={styles.modalLabel}>選擇模板:</Text>
            <ScrollView style={styles.templateList}>
              {templates.map(template => (
                <TouchableOpacity
                  key={template.id}
                  style={[
                    styles.templateItem,
                    selectedTemplateId === template.id &&
                      styles.selectedTemplateItem,
                  ]}
                  onPress={() => setSelectedTemplateId(template.id)}
                >
                  <Text style={styles.templateItemText}>{template.name}</Text>
                  <Text style={styles.templateItemDescription}>
                    {template.description}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setShowCreateReportModal(false)}
              >
                <Text style={styles.modalButtonText}>取消</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonPrimary]}
                onPress={handleCreateReport}
              >
                <Text
                  style={[
                    styles.modalButtonText,
                    styles.modalButtonPrimaryText,
                  ]}
                >
                  創建
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const _styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
    color: '#333',
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 10,
    margin: 10,
    borderRadius: 5,
  },
  errorText: {
    color: '#c62828',
    fontSize: 14,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 10,
    borderRadius: 10,
    overflow: 'hidden',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#2196f3',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
  },
  activeTabText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    marginTop: 10,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  tabContent: {
    padding: 15,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  button: {
    backgroundColor: '#2196f3',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  quickActions: {
    flexDirection: 'row',
    marginBottom: 15,
    gap: 10,
  },
  quickButton: {
    backgroundColor: '#4caf50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 5,
    flex: 1,
  },
  quickButtonText: {
    color: '#fff',
    fontSize: 12,
    textAlign: 'center',
  },
  summary: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  item: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  itemStatus: {
    fontSize: 12,
    color: '#666',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  itemDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  itemMeta: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 10,
  },
  itemMetaText: {
    fontSize: 12,
    color: '#999',
  },
  itemActions: {
    flexDirection: 'row',
    gap: 10,
  },
  selectButton: {
    backgroundColor: '#2196f3',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 5,
  },
  selectButtonText: {
    color: '#fff',
    fontSize: 12,
  },
  actionButton: {
    backgroundColor: '#ff9800',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 11,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#999',
    marginTop: 50,
  },
  analyticsCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  analyticsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  analyticsText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    fontSize: 14,
  },
  modalLabel: {
    fontSize: 14,
    color: '#333',
    marginBottom: 10,
  },
  templateList: {
    maxHeight: 200,
    marginBottom: 15,
  },
  templateItem: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    marginBottom: 5,
  },
  selectedTemplateItem: {
    borderColor: '#2196f3',
    backgroundColor: '#e3f2fd',
  },
  templateItemText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  templateItemDescription: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  modalButtonPrimary: {
    backgroundColor: '#2196f3',
    borderColor: '#2196f3',
  },
  modalButtonText: {
    fontSize: 14,
    color: '#666',
  },
  modalButtonPrimaryText: {
    color: '#fff',
  },
});

export default ReportExample;
