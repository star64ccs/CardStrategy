import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
  Modal,
} from 'react-native';

import { useDashboard } from '../hooks/useDashboard';

const DashboardExample: React.FC = () => {
  const {
    isInitialized,
    dashboards,
    currentDashboard,
    isLoading,
    hasError,
    dashboardCount,
    activeAlerts,
    templates,
    config,
    fetchDashboards,
    create,
    remove,
    exportTo,
    createAlert,
    deleteAlert,
    fetchTemplates,
    fetchConfig,
    setCurrent,
    setPreview,
    setFullscreen,
    refreshData,
    removeWidget,
    clearErrors,
  } = useDashboard();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newDashboardName, setNewDashboardName] = useState('');
  const [newDashboardDescription, setNewDashboardDescription] = useState('');

  useEffect(() => {
    if (isInitialized) {
      fetchDashboards();
      fetchTemplates();
      fetchConfig();
    }
  }, [isInitialized, fetchDashboards, fetchTemplates, fetchConfig]);

  const _handleCreateDashboard = async () => {
    if (!newDashboardName.trim()) {
      Alert.alert('Error', '請輸入儀表板名稱');
      return;
    }

    try {
      const _dashboard = await create({
        name: newDashboardName,
        description: newDashboardDescription,
      });

      if (dashboard) {
        setShowCreateModal(false);
        setNewDashboardName('');
        setNewDashboardDescription('');
        Alert.alert('Success', '儀表板CreateSuccess');
      }
    } catch (error) {
      Alert.alert('Error', 'Create儀表板Failed');
    }
  };

  const _handleDeleteDashboard = async (dashboardId: string) => {
    Alert.alert('確認刪除', '確定要刪除這個儀表板嗎？', [
      { text: '取消', style: 'cancel' },
      {
        text: '刪除',
        style: 'destructive',
        onPress: async () => {
          try {
            const _success = await remove(dashboardId);
            if (success) {
              Alert.alert('Success', '儀表板已刪除');
            }
          } catch (error) {
            Alert.alert('Error', 'Delete儀表板Failed');
          }
        },
      },
    ]);
  };

  const _handleExportDashboard = async (
    dashboardId: string,
    format: 'pdf' | 'png' | 'jpg' | 'svg' | 'html'
  ) => {
    try {
      const _exportResult = await exportTo(dashboardId, format);
      if (exportResult) {
        Alert.alert('Success', `儀表板已導出為 ${format.toUpperCase()} 格式`);
      }
    } catch (error) {
      Alert.alert('Error', '導出儀表板Failed');
    }
  };

  if (!isInitialized) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size='large' color='#2196F3' />
        <Text style={styles.loadingText}>初始化儀表板系統...</Text>
      </View>
    );
  }

  if (hasError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>發生錯誤: {hasError}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={clearErrors}>
          <Text style={styles.retryButtonText}>重試</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>儀表板系統</Text>
        {isLoading && <ActivityIndicator size='small' color='#2196F3' />}
      </View>

      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'dashboard' && styles.activeTab]}
          onPress={() => setActiveTab('dashboard')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'dashboard' && styles.activeTabText,
            ]}
          >
            儀表板 ({dashboardCount})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'alerts' && styles.activeTab]}
          onPress={() => setActiveTab('alerts')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'alerts' && styles.activeTabText,
            ]}
          >
            警報 ({activeAlerts.length})
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
            模板 ({templates.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {activeTab === 'dashboard' && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>儀表板列表</Text>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => setShowCreateModal(true)}
              >
                <Text style={styles.addButtonText}>+ 新建</Text>
              </TouchableOpacity>
            </View>

            {dashboards.map(dashboard => (
              <View key={dashboard.id} style={styles.dashboardItem}>
                <View style={styles.dashboardInfo}>
                  <Text style={styles.dashboardName}>{dashboard.name}</Text>
                  <Text style={styles.dashboardDescription}>
                    {dashboard.description || '無描述'}
                  </Text>
                  <Text style={styles.dashboardMeta}>
                    創建於: {new Date(dashboard.createdAt).toLocaleDateString()}
                  </Text>
                </View>

                <View style={styles.dashboardActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => setCurrent(dashboard)}
                  >
                    <Text style={styles.actionButtonText}>查看</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleExportDashboard(dashboard.id, 'pdf')}
                  >
                    <Text style={styles.actionButtonText}>導出</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={() => handleDeleteDashboard(dashboard.id)}
                  >
                    <Text
                      style={[styles.actionButtonText, styles.deleteButtonText]}
                    >
                      刪除
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            {currentDashboard && (
              <View style={styles.currentDashboard}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>
                    當前儀表板: {currentDashboard.name}
                  </Text>
                  <View style={styles.dashboardControls}>
                    <TouchableOpacity
                      style={styles.controlButton}
                      onPress={() => setPreview(!currentDashboard)}
                    >
                      <Text style={styles.controlButtonText}>預覽</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.controlButton}
                      onPress={() => setFullscreen(!currentDashboard)}
                    >
                      <Text style={styles.controlButtonText}>全屏</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.controlButton}
                      onPress={() => refreshData(currentDashboard.id)}
                    >
                      <Text style={styles.controlButtonText}>刷新</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <Text style={styles.dashboardDescription}>
                  {currentDashboard.description || '無描述'}
                </Text>

                <View style={styles.widgetsContainer}>
                  {currentDashboard.layouts[0]?.widgets.map(widget => (
                    <View key={widget.id} style={styles.widgetItem}>
                      <View style={styles.widgetHeader}>
                        <Text style={styles.widgetTitle}>{widget.title}</Text>
                        <Text style={styles.widgetType}>{widget.type}</Text>
                      </View>

                      <Text style={styles.widgetDescription}>
                        {widget.description || '無描述'}
                      </Text>
                      <Text style={styles.widgetDataSource}>
                        數據源: {widget.dataSource}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        )}

        {activeTab === 'alerts' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>警報管理</Text>

            {activeAlerts.map(alert => (
              <View key={alert.id} style={styles.alertItem}>
                <View style={styles.alertInfo}>
                  <Text style={styles.alertMetric}>
                    {alert.condition.metric} {alert.condition.operator}{' '}
                    {alert.condition.value}
                  </Text>
                  <Text style={styles.alertAction}>
                    動作: {alert.action.type} - {alert.action.target}
                  </Text>
                  <Text style={styles.alertStatus}>
                    狀態: {alert.isActive ? '啟用' : '禁用'}
                  </Text>
                </View>

                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => deleteAlert(alert.id)}
                >
                  <Text
                    style={[styles.actionButtonText, styles.deleteButtonText]}
                  >
                    刪除
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {activeTab === 'templates' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>儀表板模板</Text>

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
                  <Text style={styles.templateRating}>
                    評分: {template.rating}/5
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => {
                    create({
                      name: `${template.name} - 副本`,
                      description: template.description,
                    });
                  }}
                >
                  <Text style={styles.actionButtonText}>使用模板</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <Modal
        visible={showCreateModal}
        animationType='slide'
        transparent={true}
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>創建新儀表板</Text>

            <TextInput
              style={styles.input}
              placeholder='儀表板名稱'
              value={newDashboardName}
              onChangeText={setNewDashboardName}
            />

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder='儀表板描述（可選）'
              value={newDashboardDescription}
              onChangeText={setNewDashboardDescription}
              multiline
              numberOfLines={3}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowCreateModal(false)}
              >
                <Text style={styles.cancelButtonText}>取消</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleCreateDashboard}
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

const _styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#2196F3',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
  },
  activeTabText: {
    color: '#2196F3',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
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
    color: '#333',
  },
  addButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  dashboardItem: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  dashboardInfo: {
    marginBottom: 8,
  },
  dashboardName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  dashboardDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  dashboardMeta: {
    fontSize: 12,
    color: '#999',
  },
  dashboardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginLeft: 8,
  },
  actionButtonText: {
    fontSize: 12,
    color: '#333',
  },
  deleteButton: {
    backgroundColor: '#ffebee',
  },
  deleteButtonText: {
    color: '#f44336',
  },
  currentDashboard: {
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  dashboardControls: {
    flexDirection: 'row',
  },
  controlButton: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginLeft: 8,
  },
  controlButtonText: {
    fontSize: 12,
    color: '#1976d2',
  },
  widgetsContainer: {
    marginTop: 16,
  },
  widgetItem: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  widgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  widgetTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  widgetType: {
    fontSize: 12,
    color: '#666',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  widgetDescription: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  widgetDataSource: {
    fontSize: 12,
    color: '#999',
  },
  alertItem: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  alertInfo: {
    flex: 1,
  },
  alertMetric: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  alertAction: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  alertStatus: {
    fontSize: 12,
    color: '#999',
  },
  templateItem: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  templateInfo: {
    flex: 1,
  },
  templateName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  templateDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  templateCategory: {
    fontSize: 12,
    color: '#999',
    marginBottom: 2,
  },
  templateRating: {
    fontSize: 12,
    color: '#999',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorText: {
    fontSize: 16,
    color: '#f44336',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 24,
    width: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 4,
    padding: 12,
    marginBottom: 16,
    fontSize: 14,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  modalButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 14,
  },
  confirmButton: {
    backgroundColor: '#2196F3',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default DashboardExample;
