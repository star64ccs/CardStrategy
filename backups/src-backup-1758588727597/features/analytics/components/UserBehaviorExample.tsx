import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { useUserBehavior } from '../hooks/useUserBehavior';

const UserBehaviorExample: React.FC = () => {
  const {
    analysis,
    isInitialized,
    isLoading,
    error,
    config,
    alerts,
    recentEvents,
    realTimeMetrics,
    insights,
    recommendations,
    currentReport,
    reports,
    derivedData,
    getAnalysis,
    generateReport,
    exportData,
    createAlert,
    updateAlert,
    deleteAlert,
    getUserProfile,
    getUserPatterns,
    getUserMetrics,
    setFilter,
    clearFilter,
    updateConfig,
    addEvent,
    setInsights,
    setRecommendations,
    clearError,
    setCurrentReport,
    addReport,
    deleteReport,
  } = useUserBehavior();

  const [selectedTab, setSelectedTab] = useState<
    'dashboard' | 'profiles' | 'alerts' | 'reports' | 'config'
  >('dashboard');
  const [selectedUserId, setSelectedUserId] = useState<string>('user123');
  const [filterPeriod, setFilterPeriod] = useState<{
    start: number;
    end: number;
  }>({
    start: Date.now() - 7 * 24 * 60 * 60 * 1000,
    end: Date.now(),
  });

  // 模擬用戶事件
  const _simulateUserEvent = () => {
    const _eventTypes = [
      'page_view',
      'card_view',
      'search',
      'purchase',
      'add_to_cart',
      'favorite',
    ];
    const _randomEventType =
      eventTypes[Math.floor(Math.random() * eventTypes.length)];

    addEvent({
      id: `event_${Date.now()}`,
      userId: selectedUserId,
      sessionId: `session_${Date.now()}`,
      eventType: randomEventType as any,
      timestamp: Date.now(),
      page: '/cards',
      cardId: `card_${Math.floor(Math.random() * 1000)}`,
      searchQuery: randomEventType === 'search' ? 'pokemon' : undefined,
      platform: 'Web',
      userAgent: 'Mozilla/5.0',
      deviceInfo: {
        deviceType: 'desktop',
        os: 'Windows',
        browser: 'Chrome',
        screenResolution: '1920x1080',
        language: 'zh-TW',
      },
      metadata: {
        userAgent: 'Mozilla/5.0',
        ipAddress: '192.168.1.1',
        location: 'Taipei, Taiwan',
      },
    } as any);
  };

  // 生成報告
  const _handleGenerateReport = async () => {
    try {
      await generateReport(
        '用戶行為分析報告',
        '分析用戶在平台上的行為模式和趨勢',
        filterPeriod
      );
      Alert.alert('成功', '報告生成成功！');
    } catch (error) {
      Alert.alert('錯誤', '報告生成失敗');
    }
  };

  // 創建警報
  const _handleCreateAlert = async () => {
    try {
      await createAlert({
        name: '用戶流失警報',
        description: '檢測到用戶流失率異常',
        condition: {
          metric: 'churnRate',
          timeWindow: 3600000,
          aggregation: 'avg',
        },
        threshold: 0.1,
        operator: 'gt',
        enabled: true,
        notificationChannels: ['admin@example.com'],
      });
      Alert.alert('成功', '警報創建成功！');
    } catch (error) {
      Alert.alert('錯誤', '警報創建失敗');
    }
  };

  // 導出數據
  const _handleExportData = async () => {
    if (!analysis) return;

    try {
      await exportData(
        analysis as any,
        {
          format: 'json',
          includeMetadata: true,
          compression: false,
        } as any
      );
      Alert.alert('成功', '數據導出成功！');
    } catch (error) {
      Alert.alert('錯誤', '數據導出失敗');
    }
  };

  // 獲取用戶數據
  const _handleGetUserData = async () => {
    try {
      await Promise.all([
        getUserProfile(selectedUserId),
        getUserPatterns(selectedUserId),
        getUserMetrics(selectedUserId),
      ]);
      Alert.alert('成功', '用戶數據獲取成功！');
    } catch (error) {
      Alert.alert('錯誤', '用戶數據獲取失敗');
    }
  };

  // 渲染儀表板
  const _renderDashboard = () => (
    <ScrollView style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 16 }}>
        用戶行為分析儀表板
      </Text>

      {/* 狀態指示器 */}
      <View style={{ flexDirection: 'row', marginBottom: 16 }}>
        <View
          style={{
            backgroundColor: isInitialized ? '#4CAF50' : '#FF9800',
            padding: 8,
            borderRadius: 4,
            marginRight: 8,
          }}
        >
          <Text style={{ color: 'white' }}>
            {isInitialized ? '已初始化' : '未初始化'}
          </Text>
        </View>
        {Boolean(isLoading) && (
          <View
            style={{ backgroundColor: '#2196F3', padding: 8, borderRadius: 4 }}
          >
            <Text style={{ color: 'white' }}>載入中...</Text>
          </View>
        )}
        {Boolean(error) && (
          <View
            style={{ backgroundColor: '#F44336', padding: 8, borderRadius: 4 }}
          >
            <Text style={{ color: 'white' }}>錯誤: {String(error)}</Text>
          </View>
        )}
      </View>

      {/* 實時指標 */}
      <View
        style={{
          backgroundColor: '#f5f5f5',
          padding: 16,
          borderRadius: 8,
          marginBottom: 16,
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>
          實時指標
        </Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <View>
            <Text style={{ fontSize: 12, color: '#666' }}>活躍用戶</Text>
            <Text style={{ fontSize: 20, fontWeight: 'bold' }}>
              {(realTimeMetrics as any).activeUsers || 0}
            </Text>
          </View>
          <View>
            <Text style={{ fontSize: 12, color: '#666' }}>平均會話時長</Text>
            <Text style={{ fontSize: 20, fontWeight: 'bold' }}>
              {(realTimeMetrics as any).averageSessionDuration || 0}s
            </Text>
          </View>
          <View>
            <Text style={{ fontSize: 12, color: '#666' }}>轉換率</Text>
            <Text style={{ fontSize: 20, fontWeight: 'bold' }}>
              {((realTimeMetrics as any).conversionRate || 0 * 100).toFixed(1)}%
            </Text>
          </View>
          <View>
            <Text style={{ fontSize: 12, color: '#666' }}>參與度</Text>
            <Text style={{ fontSize: 20, fontWeight: 'bold' }}>
              {((realTimeMetrics as any).engagementScore || 0).toFixed(1)}
            </Text>
          </View>
        </View>
      </View>

      {/* 分析數據 */}
      {Boolean(analysis) && typeof analysis === 'object' && (
        <View
          style={{
            backgroundColor: '#f5f5f5',
            padding: 16,
            borderRadius: 8,
            marginBottom: 16,
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>
            分析數據
          </Text>
          <View style={{ marginBottom: 8 }}>
            <Text>總用戶數: {(analysis as any).stats?.totalUsers || 0}</Text>
            <Text>活躍用戶: {(analysis as any).stats?.activeUsers || 0}</Text>
            <Text>新用戶: {(analysis as any).stats?.newUsers || 0}</Text>
            <Text>
              回訪用戶: {(analysis as any).stats?.returningUsers || 0}
            </Text>
            <Text>
              流失率:{' '}
              {((analysis as any).stats?.churnRate || 0 * 100).toFixed(1)}%
            </Text>
          </View>
          <View style={{ marginBottom: 8 }}>
            <Text>總事件數: {(analysis as any).stats?.totalEvents || 0}</Text>
            <Text>
              平均每用戶事件:{' '}
              {((analysis as any).stats?.averageEventsPerUser || 0).toFixed(1)}
            </Text>
            <Text>
              平均會話時長:{' '}
              {(analysis as any).stats?.averageSessionDuration || 0}秒
            </Text>
            <Text>
              轉換率:{' '}
              {((analysis as any).stats?.conversionRate || 0 * 100).toFixed(1)}%
            </Text>
          </View>
        </View>
      )}

      {/* 衍生數據 */}
      {derivedData && typeof derivedData === 'object' && (
        <View
          style={{
            backgroundColor: '#f5f5f5',
            padding: 16,
            borderRadius: 8,
            marginBottom: 16,
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>
            衍生數據
          </Text>
          <View style={{ marginBottom: 8 }}>
            <Text>
              行為模式數量:{' '}
              {(derivedData as any).behaviorPatterns?.totalPatterns || 0}
            </Text>
            <Text>
              事件類型數量:{' '}
              {(derivedData as any).eventStats?.topEventTypes?.length || 0}
            </Text>
          </View>
        </View>
      )}

      {/* 最近事件 */}
      <View
        style={{
          backgroundColor: '#f5f5f5',
          padding: 16,
          borderRadius: 8,
          marginBottom: 16,
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>
          最近事件 ({(recentEvents as any[])?.length || 0})
        </Text>
        {(recentEvents as any[])
          ?.slice(0, 5)
          .map((event: unknown, index: number) => (
            <View
              key={index}
              style={{
                marginBottom: 8,
                padding: 8,
                backgroundColor: 'white',
                borderRadius: 4,
              }}
            >
              <Text style={{ fontWeight: 'bold' }}>{event.eventType}</Text>
              <Text>用戶: {event.userId}</Text>
              <Text>時間: {new Date(event.timestamp).toLocaleString()}</Text>
            </View>
          ))}
      </View>

      {/* 操作按鈕 */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        <TouchableOpacity
          style={{ backgroundColor: '#2196F3', padding: 12, borderRadius: 4 }}
          onPress={() => getAnalysis()}
        >
          <Text style={{ color: 'white' }}>獲取分析</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{ backgroundColor: '#4CAF50', padding: 12, borderRadius: 4 }}
          onPress={handleGenerateReport}
        >
          <Text style={{ color: 'white' }}>生成報告</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{ backgroundColor: '#FF9800', padding: 12, borderRadius: 4 }}
          onPress={handleExportData}
        >
          <Text style={{ color: 'white' }}>導出數據</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{ backgroundColor: '#9C27B0', padding: 12, borderRadius: 4 }}
          onPress={simulateUserEvent}
        >
          <Text style={{ color: 'white' }}>模擬事件</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  // 渲染用戶畫像
  const _renderProfiles = () => (
    <ScrollView style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 16 }}>
        用戶畫像
      </Text>

      {/* 用戶選擇 */}
      <View style={{ marginBottom: 16 }}>
        <Text style={{ marginBottom: 8 }}>選擇用戶ID:</Text>
        <TextInput
          style={{
            borderWidth: 1,
            borderColor: '#ddd',
            padding: 8,
            borderRadius: 4,
          }}
          value={selectedUserId}
          onChangeText={setSelectedUserId}
          placeholder='輸入用戶ID'
        />
      </View>

      {/* 用戶數據按鈕 */}
      <TouchableOpacity
        style={{
          backgroundColor: '#2196F3',
          padding: 12,
          borderRadius: 4,
          marginBottom: 16,
        }}
        onPress={handleGetUserData}
      >
        <Text style={{ color: 'white', textAlign: 'center' }}>
          獲取用戶數據
        </Text>
      </TouchableOpacity>

      {/* 用戶畫像數據將在這裡顯示 */}
      <View
        style={{ backgroundColor: '#f5f5f5', padding: 16, borderRadius: 8 }}
      >
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>
          用戶畫像數據
        </Text>
        <Text>選擇用戶ID: {selectedUserId}</Text>
        <Text>點擊上方按鈕獲取詳細數據</Text>
      </View>
    </ScrollView>
  );

  // 渲染警報
  const _renderAlerts = () => (
    <ScrollView style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 16 }}>
        警報管理
      </Text>

      {/* 創建警報按鈕 */}
      <TouchableOpacity
        style={{
          backgroundColor: '#4CAF50',
          padding: 12,
          borderRadius: 4,
          marginBottom: 16,
        }}
        onPress={handleCreateAlert}
      >
        <Text style={{ color: 'white', textAlign: 'center' }}>創建新警報</Text>
      </TouchableOpacity>

      {/* 警報列表 */}
      <View
        style={{ backgroundColor: '#f5f5f5', padding: 16, borderRadius: 8 }}
      >
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>
          警報列表 ({(alerts as any[])?.length || 0})
        </Text>
        {(alerts as any[])?.length === 0 ? (
          <Text>暫無警報</Text>
        ) : (
          (alerts as any[])?.map((alert: unknown, index: number) => (
            <View
              key={index}
              style={{
                marginBottom: 12,
                padding: 12,
                backgroundColor: 'white',
                borderRadius: 4,
              }}
            >
              <Text style={{ fontWeight: 'bold' }}>{alert.name}</Text>
              <Text>{alert.description}</Text>
              <Text>嚴重程度: {alert.severity}</Text>
              <Text>狀態: {alert.enabled ? '啟用' : '禁用'}</Text>
              <Text>觸發次數: {alert.triggerCount}</Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );

  // 渲染報告
  const _renderReports = () => (
    <ScrollView style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 16 }}>
        報告管理
      </Text>

      {/* 報告列表 */}
      <View
        style={{
          backgroundColor: '#f5f5f5',
          padding: 16,
          borderRadius: 8,
          marginBottom: 16,
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>
          報告列表 ({(reports as any[])?.length || 0})
        </Text>
        {(reports as any[])?.length === 0 ? (
          <Text>暫無報告</Text>
        ) : (
          (reports as any[])?.map((report: unknown, index: number) => (
            <View
              key={index}
              style={{
                marginBottom: 12,
                padding: 12,
                backgroundColor: 'white',
                borderRadius: 4,
              }}
            >
              <Text style={{ fontWeight: 'bold' }}>{report.title}</Text>
              <Text>{report.description}</Text>
              <Text>
                生成時間: {new Date(report.createdAt).toLocaleString()}
              </Text>
              <Text>狀態: {report.status}</Text>
            </View>
          ))
        )}
      </View>

      {/* 當前報告 */}
      {Boolean(currentReport) && (
        <View
          style={{ backgroundColor: '#f5f5f5', padding: 16, borderRadius: 8 }}
        >
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>
            當前報告
          </Text>
          <Text style={{ fontWeight: 'bold' }}>
            {(currentReport as any).title}
          </Text>
          <Text>{(currentReport as any).description}</Text>
          <Text>
            生成時間:{' '}
            {new Date((currentReport as any).createdAt).toLocaleString()}
          </Text>
          <Text>狀態: {(currentReport as any).status}</Text>
        </View>
      )}
    </ScrollView>
  );

  // 渲染配置
  const _renderConfig = () => (
    <ScrollView style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 16 }}>
        配置管理
      </Text>

      {/* 配置選項 */}
      <View
        style={{
          backgroundColor: '#f5f5f5',
          padding: 16,
          borderRadius: 8,
          marginBottom: 16,
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>
          當前配置
        </Text>
        <Text>啟用追蹤: {(config as any).enabled ? '是' : '否'}</Text>
        <Text>追蹤間隔: {(config as any).trackingInterval}ms</Text>
        <Text>數據保留天數: {(config as any).dataRetentionDays}</Text>
        <Text>隱私模式: {(config as any).privacyMode ? '是' : '否'}</Text>
        <Text>匿名化數據: {(config as any).anonymizeData ? '是' : '否'}</Text>
        <Text>實時追蹤: {(config as any).realTimeTracking ? '是' : '否'}</Text>
        <Text>批次處理: {(config as any).batchProcessing ? '是' : '否'}</Text>
        <Text>事件緩衝大小: {(config as any).eventBufferSize}</Text>
        <Text>每會話最大事件: {(config as any).maxEventsPerSession}</Text>
        <Text>會話超時: {(config as any).sessionTimeout}ms</Text>
        <Text>
          地理位置追蹤: {(config as any).geolocationTracking ? '是' : '否'}
        </Text>
        <Text>設備追蹤: {(config as any).deviceTracking ? '是' : '否'}</Text>
        <Text>自定義事件: {(config as any).customEvents ? '是' : '否'}</Text>
      </View>

      {/* 配置更新按鈕 */}
      <TouchableOpacity
        style={{
          backgroundColor: '#FF9800',
          padding: 12,
          borderRadius: 4,
          marginBottom: 8,
        }}
        onPress={() => updateConfig({ enabled: !(config as any).enabled })}
      >
        <Text style={{ color: 'white', textAlign: 'center' }}>
          {(config as any).enabled ? '禁用' : '啟用'}追蹤
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={{
          backgroundColor: '#9C27B0',
          padding: 12,
          borderRadius: 4,
          marginBottom: 8,
        }}
        onPress={() =>
          updateConfig({ privacyMode: !(config as any).privacyMode })
        }
      >
        <Text style={{ color: 'white', textAlign: 'center' }}>
          {(config as any).privacyMode ? '關閉' : '開啟'}隱私模式
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );

  return (
    <View style={{ flex: 1 }}>
      {/* 標籤欄 */}
      <View style={{ flexDirection: 'row', backgroundColor: '#f0f0f0' }}>
        {(
          ['dashboard', 'profiles', 'alerts', 'reports', 'config'] as const
        ).map(tab => (
          <TouchableOpacity
            key={tab}
            style={{
              flex: 1,
              padding: 12,
              backgroundColor: selectedTab === tab ? '#2196F3' : 'transparent',
              alignItems: 'center',
            }}
            onPress={() => setSelectedTab(tab)}
          >
            <Text
              style={{
                color: selectedTab === tab ? 'white' : '#333',
                fontWeight: selectedTab === tab ? 'bold' : 'normal',
              }}
            >
              {tab === 'dashboard' && '儀表板'}
              {tab === 'profiles' && '用戶畫像'}
              {tab === 'alerts' && '警報'}
              {tab === 'reports' && '報告'}
              {tab === 'config' && '配置'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 內容區域 */}
      {selectedTab === 'dashboard' && renderDashboard()}
      {selectedTab === 'profiles' && renderProfiles()}
      {selectedTab === 'alerts' && renderAlerts()}
      {selectedTab === 'reports' && renderReports()}
      {selectedTab === 'config' && renderConfig()}
    </View>
  );
};

export default UserBehaviorExample;
