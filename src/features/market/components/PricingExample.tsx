import { Ionicons } from '@expo/vector-icons';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
} from 'react-native';

import { usePricing } from '../hooks/usePricing';
import { PriceAlertType } from '../types/pricing';

import { PriceAlertForm } from './PriceAlertForm';
import { PriceDisplay } from './PriceDisplay';

export const PricingExample: React.FC = () => {
  const {
    currentPrice,
    priceHistory,
    marketAnalysis,
    userAlerts,
    marketStats,
    loading,
    error,
    lastUpdated,
    selectedCardId,
    selectedPeriod,
    alertForm,
    initialize,
    getCurrentPrice,
    getPriceHistory,
    createAlert,
    getUserAlerts,
    updateAlert,
    deleteAlert,
    getMarketStats,
    generateAnalysis,
    setCardId,
    setPeriod,
    updateForm,
    resetForm,
    clearErrorState,
    utils,
  } = usePricing();

  const [showAlertForm, setShowAlertForm] = useState(false);
  const [cardIdInput, setCardIdInput] = useState('card_1');
  const [periodInput, setPeriodInput] = useState('30d');

  useEffect(() => {
    // InitializeService
    initialize();

    // Load初始Data
    loadInitialData();
  }, []);

  const _loadInitialData = async () => {
    await getCurrentPrice({ cardId: 'card_1', includeHistory: true });
    await getMarketStats();
    await getUserAlerts();
  };

  const _handleSearchPrice = async () => {
    if (!cardIdInput.trim()) {
      Alert.alert('Error', '請輸入卡牌 ID');
      return;
    }

    setCardId(cardIdInput);
    await getCurrentPrice({
      cardId: cardIdInput,
      includeHistory: true,
      period: periodInput,
    });
  };

  const _handleCreateAlert = async (alertData: {
    cardId: string;
    type: PriceAlertType;
    threshold: number;
    isActive: boolean;
  }) => {
    await createAlert({
      ...alertData,
      userId: 'user_1', // 模擬UserID
    });
    setShowAlertForm(false);
    Alert.alert('Success', '價格警報已創建');
  };

  const _handleToggleAlert = async (alertId: string, isActive: boolean) => {
    await updateAlert(alertId, isActive);
  };

  const _handleDeleteAlert = async (alertId: string) => {
    Alert.alert('確認刪除', '確定要刪除此警報嗎？', [
      { text: '取消', style: 'cancel' },
      {
        text: '刪除',
        style: 'destructive',
        onPress: async () => {
          await deleteAlert(alertId);
          Alert.alert('Success', '警報已刪除');
        },
      },
    ]);
  };

  const _formatPrice = (price: number) => {
    return utils.formatPrice(price, 'USD');
  };

  const _formatPercentage = (percent: number) => {
    return utils.formatPercentage(percent);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>市場價格系統</Text>
        <Text style={styles.subtitle}>實時價格追蹤與歷史分析</Text>
      </View>

      {/* SearchDistrict域 */}
      <View style={styles.searchSection}>
        <Text style={styles.sectionTitle}>價格查詢</Text>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            value={cardIdInput}
            onChangeText={setCardIdInput}
            placeholder='輸入卡牌 ID'
            placeholderTextColor='#999999'
          />
          <TouchableOpacity
            style={styles.searchButton}
            onPress={handleSearchPrice}
            disabled={loading}
          >
            <Ionicons name='search' size={20} color='#FFFFFF' />
          </TouchableOpacity>
        </View>

        <View style={styles.periodSelector}>
          <Text style={styles.periodLabel}>歷史期間:</Text>
          {['7d', '30d', '90d'].map(period => (
            <TouchableOpacity
              key={period}
              style={[
                styles.periodButton,
                periodInput === period && styles.periodButtonActive,
              ]}
              onPress={() => setPeriodInput(period)}
            >
              <Text
                style={[
                  styles.periodButtonText,
                  periodInput === period && styles.periodButtonTextActive,
                ]}
              >
                {period}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* 當前價格Show */}
      <View style={styles.priceSection}>
        <Text style={styles.sectionTitle}>當前價格</Text>
        <PriceDisplay
          price={currentPrice}
          loading={loading}
          onRefresh={() => handleSearchPrice()}
          onPress={() => {
            if (currentPrice) {
              generateAnalysis(currentPrice.cardId);
            }
          }}
        />
      </View>

      {/* 市場Statistics */}
      {marketStats && (
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>市場概況</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>總卡牌數</Text>
              <Text style={styles.statValue}>
                {marketStats.totalCards.toLocaleString()}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>活躍市場</Text>
              <Text style={styles.statValue}>{marketStats.activeMarkets}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>24h成交量</Text>
              <Text style={styles.statValue}>
                {formatPrice(marketStats.totalVolume24h)}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>平均變化</Text>
              <Text
                style={[
                  styles.statValue,
                  {
                    color:
                      marketStats.averagePriceChange >= 0
                        ? '#4CAF50'
                        : '#F44336',
                  },
                ]}
              >
                {formatPercentage(marketStats.averagePriceChange)}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* 價格歷史Statistics */}
      {priceHistory && (
        <View style={styles.historySection}>
          <Text style={styles.sectionTitle}>歷史統計</Text>
          <View style={styles.historyStats}>
            <View style={styles.historyStat}>
              <Text style={styles.historyStatLabel}>最高價</Text>
              <Text style={styles.historyStatValue}>
                {formatPrice(priceHistory.statistics.high)}
              </Text>
            </View>
            <View style={styles.historyStat}>
              <Text style={styles.historyStatLabel}>最低價</Text>
              <Text style={styles.historyStatValue}>
                {formatPrice(priceHistory.statistics.low)}
              </Text>
            </View>
            <View style={styles.historyStat}>
              <Text style={styles.historyStatLabel}>平均價</Text>
              <Text style={styles.historyStatValue}>
                {formatPrice(priceHistory.statistics.average)}
              </Text>
            </View>
            <View style={styles.historyStat}>
              <Text style={styles.historyStatLabel}>波動性</Text>
              <Text style={styles.historyStatValue}>
                {priceHistory.statistics.volatility.toFixed(2)}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* 市場Analysis */}
      {marketAnalysis && (
        <View style={styles.analysisSection}>
          <Text style={styles.sectionTitle}>市場分析</Text>
          <View style={styles.analysisCard}>
            <View style={styles.analysisHeader}>
              <Text style={styles.analysisSummary}>
                {marketAnalysis.summary}
              </Text>
              <View style={styles.analysisMeta}>
                <Text style={styles.analysisConfidence}>
                  信心指數: {(marketAnalysis.confidence * 100).toFixed(1)}%
                </Text>
                <Text style={styles.analysisRisk}>
                  風險等級: {marketAnalysis.riskLevel}
                </Text>
              </View>
            </View>

            <View style={styles.factorsContainer}>
              <Text style={styles.factorsTitle}>影響因素</Text>
              <View style={styles.factorsList}>
                <View style={styles.factorItem}>
                  <Text style={styles.factorLabel}>市場需求</Text>
                  <View style={styles.factorBar}>
                    <View
                      style={[
                        styles.factorBarFill,
                        {
                          width: `${marketAnalysis.factors.marketDemand * 100}%`,
                        },
                      ]}
                    />
                  </View>
                </View>
                <View style={styles.factorItem}>
                  <Text style={styles.factorLabel}>供應水平</Text>
                  <View style={styles.factorBar}>
                    <View
                      style={[
                        styles.factorBarFill,
                        {
                          width: `${marketAnalysis.factors.supplyLevel * 100}%`,
                        },
                      ]}
                    />
                  </View>
                </View>
                <View style={styles.factorItem}>
                  <Text style={styles.factorLabel}>競爭程度</Text>
                  <View style={styles.factorBar}>
                    <View
                      style={[
                        styles.factorBarFill,
                        {
                          width: `${marketAnalysis.factors.competition * 100}%`,
                        },
                      ]}
                    />
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.recommendationsContainer}>
              <Text style={styles.recommendationsTitle}>投資建議</Text>
              {marketAnalysis.recommendations.map(
                (rec: string, index: number) => (
                  <View key={index} style={styles.recommendationItem}>
                    <Ionicons
                      name='checkmark-circle'
                      size={16}
                      color='#4CAF50'
                    />
                    <Text style={styles.recommendationText}>{rec}</Text>
                  </View>
                )
              )}
            </View>
          </View>
        </View>
      )}

      {/* 價格Alert */}
      <View style={styles.alertsSection}>
        <View style={styles.alertsHeader}>
          <Text style={styles.sectionTitle}>價格警報</Text>
          <TouchableOpacity
            style={styles.addAlertButton}
            onPress={() => setShowAlertForm(true)}
          >
            <Ionicons name='add' size={20} color='#FFFFFF' />
            <Text style={styles.addAlertText}>新增警報</Text>
          </TouchableOpacity>
        </View>

        {userAlerts.length === 0 ? (
          <View style={styles.noAlertsContainer}>
            <Ionicons name='notifications-off' size={48} color='#9E9E9E' />
            <Text style={styles.noAlertsText}>暫無價格警報</Text>
            <Text style={styles.noAlertsSubtext}>
              點擊上方按鈕創建新的價格警報
            </Text>
          </View>
        ) : (
          <View style={styles.alertsList}>
            {userAlerts.map((alert: unknown) => (
              <View key={alert.id} style={styles.alertItem}>
                <View style={styles.alertInfo}>
                  <Text style={styles.alertCardId}>{alert.cardId}</Text>
                  <Text style={styles.alertType}>
                    {alert.type === PriceAlertType.ABOVE && '價格上漲'}
                    {alert.type === PriceAlertType.BELOW && '價格下跌'}
                    {alert.type === PriceAlertType.PERCENTAGE_CHANGE &&
                      '百分比變化'}
                    {alert.type === PriceAlertType.VOLUME_SPIKE && '成交量激增'}
                  </Text>
                  <Text style={styles.alertThreshold}>
                    閾值: {alert.threshold}
                    {alert.type === PriceAlertType.PERCENTAGE_CHANGE && '%'}
                    {alert.type === PriceAlertType.VOLUME_SPIKE && '張'}
                    {alert.type !== PriceAlertType.PERCENTAGE_CHANGE &&
                      alert.type !== PriceAlertType.VOLUME_SPIKE &&
                      '$'}
                  </Text>
                </View>

                <View style={styles.alertActions}>
                  <TouchableOpacity
                    style={styles.alertToggle}
                    onPress={() => handleToggleAlert(alert.id, !alert.isActive)}
                  >
                    <Ionicons
                      name={alert.isActive ? 'toggle' : 'toggle-outline'}
                      size={24}
                      color={alert.isActive ? '#4CAF50' : '#9E9E9E'}
                    />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.alertDelete}
                    onPress={() => handleDeleteAlert(alert.id)}
                  >
                    <Ionicons name='trash-outline' size={20} color='#F44336' />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* ErrorShow */}
      {error && (
        <View style={styles.errorContainer}>
          <Ionicons name='alert-circle' size={24} color='#F44336' />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={clearErrorState}>
            <Text style={styles.errorDismiss}>關閉</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* AlertCreateTable單 */}
      <Modal
        visible={showAlertForm}
        animationType='slide'
        presentationStyle='pageSheet'
      >
        <PriceAlertForm
          cardId={selectedCardId || 'card_1'}
          currentPrice={currentPrice?.currentPrice || 0}
          onSubmit={handleCreateAlert}
          onCancel={() => setShowAlertForm(false)}
          loading={loading}
        />
      </Modal>
    </ScrollView>
  );
};

const _styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#007AFF',
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#E3F2FD',
  },
  searchSection: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#000000',
  },
  searchButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginLeft: 8,
    justifyContent: 'center',
  },
  periodSelector: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  periodLabel: {
    fontSize: 14,
    color: '#666666',
    marginRight: 8,
  },
  periodButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginRight: 8,
  },
  periodButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  periodButtonText: {
    fontSize: 12,
    color: '#666666',
  },
  periodButtonTextActive: {
    color: '#FFFFFF',
  },
  priceSection: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  statsSection: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statItem: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
  },
  historySection: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  historyStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  historyStat: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
  },
  historyStatLabel: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 4,
  },
  historyStatValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
  },
  analysisSection: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  analysisCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  analysisHeader: {
    marginBottom: 16,
  },
  analysisSummary: {
    fontSize: 16,
    color: '#000000',
    lineHeight: 24,
    marginBottom: 8,
  },
  analysisMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  analysisConfidence: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
  },
  analysisRisk: {
    fontSize: 14,
    color: '#FF9800',
    fontWeight: '600',
  },
  factorsContainer: {
    marginBottom: 16,
  },
  factorsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
  },
  factorsList: {
    gap: 8,
  },
  factorItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  factorLabel: {
    fontSize: 14,
    color: '#666666',
    width: 80,
  },
  factorBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    marginLeft: 8,
  },
  factorBarFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 4,
  },
  recommendationsContainer: {
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 16,
  },
  recommendationsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  recommendationText: {
    fontSize: 14,
    color: '#000000',
    marginLeft: 8,
    flex: 1,
  },
  alertsSection: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  alertsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  addAlertButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addAlertText: {
    fontSize: 14,
    color: '#FFFFFF',
    marginLeft: 4,
    fontWeight: '600',
  },
  noAlertsContainer: {
    alignItems: 'center',
    padding: 32,
  },
  noAlertsText: {
    fontSize: 16,
    color: '#666666',
    marginTop: 12,
    marginBottom: 4,
  },
  noAlertsSubtext: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
  },
  alertsList: {
    gap: 12,
  },
  alertItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
  },
  alertInfo: {
    flex: 1,
  },
  alertCardId: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 2,
  },
  alertType: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 2,
  },
  alertThreshold: {
    fontSize: 12,
    color: '#666666',
  },
  alertActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  alertToggle: {
    padding: 4,
  },
  alertDelete: {
    padding: 4,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    margin: 16,
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#F44336',
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    color: '#D32F2F',
    marginLeft: 8,
  },
  errorDismiss: {
    fontSize: 14,
    color: '#F44336',
    fontWeight: '600',
  },
});
