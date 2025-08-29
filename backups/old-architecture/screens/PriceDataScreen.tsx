import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { theme } from '@/config/theme';
import { HistoricalPriceChart } from '@/components/price/HistoricalPriceChart';
import { GradingAgencyDisplay } from '@/components/price/GradingAgencyDisplay';
import { Button, Loading, Modal, Toast } from '@/components/common';
import {
  fetchHistoricalPrices,
  fetchGradingAgencyData,
  fetchRecommendedPlatforms,
  checkPlatformStatus,
  setFilters,
  clearFilters,
  selectPriceData,
  selectHistoricalPrices,
  selectGradingData,
  selectRecommendedPlatforms,
  selectPlatformStatus,
  selectFilters,
  selectIsLoading,
  selectIsUpdating,
  selectError,
} from '@/store/slices/priceDataSlice';
import { PricePlatform, GradingAgency } from '@/services/priceDataService';
import { formatPrice } from '@/utils/formatters';

interface PriceDataScreenProps {
  route: {
    params: {
      cardId?: string;
      cardName?: string;
    };
  };
  navigation: any;
}

export const PriceDataScreen: React.FC<PriceDataScreenProps> = ({
  route,
  navigation,
}) => {
  const dispatch = useDispatch();
  const {
    historicalPrices,
    gradingData,
    recommendedPlatforms,
    platformStatus,
    filters,
    isLoading,
    isUpdating,
    error,
  } = useSelector(selectPriceData);

  const [refreshing, setRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState(
    route.params?.cardId || ''
  );
  const [selectedCardName, setSelectedCardName] = useState(
    route.params?.cardName || ''
  );

  // 平台選項
  const pricePlatforms: PricePlatform[] = [
    'EBAY',
    'TCGPLAYER',
    'CARDMARKET',
    'PRICE_CHARTING',
    'MERCARI',
    'SNKR',
  ];
  const gradingAgencies: GradingAgency[] = ['PSA', 'BGS', 'CGC'];

  // 初始化數據
  useEffect(() => {
    if (selectedCardId) {
      loadPriceData();
    }
    loadRecommendedPlatforms();
    checkPlatformsStatus();
  }, [selectedCardId]);

  // 錯誤處理
  useEffect(() => {
    if (error) {
      Toast.show('error', '錯誤', error);
    }
  }, [error]);

  // 加載價格數據
  const loadPriceData = async () => {
    if (!selectedCardId) return;

    try {
      await Promise.all([
        dispatch(
          fetchHistoricalPrices({
            cardId: selectedCardId,
            platforms: filters.selectedPlatforms,
            timeRange: filters.timeRange,
          }) as any
        ),
        dispatch(
          fetchGradingAgencyData({
            cardId: selectedCardId,
            agencies: filters.selectedAgencies,
          }) as any
        ),
      ]);
    } catch (error) {
      // logger.info('Failed to load price data:', error);
    }
  };

  // 加載平台推薦
  const loadRecommendedPlatforms = async () => {
    try {
      await dispatch(fetchRecommendedPlatforms() as any);
    } catch (error) {
      // logger.info('Failed to load recommended platforms:', error);
    }
  };

  // 檢查平台狀態
  const checkPlatformsStatus = async () => {
    try {
      await dispatch(
        checkPlatformStatus([...pricePlatforms, ...gradingAgencies]) as any
      );
    } catch (error) {
      // logger.info('Failed to check platform status:', error);
    }
  };

  // 下拉刷新
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        loadPriceData(),
        loadRecommendedPlatforms(),
        checkPlatformsStatus(),
      ]);
    } finally {
      setRefreshing(false);
    }
  };

  // 更新過濾器
  const updateFilters = (newFilters: Partial<typeof filters>) => {
    dispatch(setFilters(newFilters));
  };

  // 清除過濾器
  const handleClearFilters = () => {
    dispatch(clearFilters());
  };

  // 選擇卡牌
  const selectCard = () => {
    // 這裡可以導航到卡牌選擇屏幕
    Alert.alert('選擇卡牌', '請從收藏中選擇要查看價格數據的卡牌');
  };

  // 獲取當前卡牌的歷史價格數據
  const getCurrentHistoricalData = () => {
    if (!selectedCardId || !historicalPrices[selectedCardId]) return [];
    return Object.values(historicalPrices[selectedCardId]);
  };

  // 獲取當前卡牌的鑑定機構數據
  const getCurrentGradingData = () => {
    if (!selectedCardId || !gradingData[selectedCardId]) return [];
    return Object.values(gradingData[selectedCardId]);
  };

  // 獲取平台狀態指示器
  const getPlatformStatusIndicator = (platform: string) => {
    const status = platformStatus[platform];
    if (!status) return '⚪'; // 未知
    switch (status.status) {
      case 'online':
        return '🟢';
      case 'limited':
        return '🟡';
      case 'offline':
        return '🔴';
      default:
        return '⚪';
    }
  };

  return (
    <View style={styles.container}>
      {/* 標題欄 */}
      <View style={styles.header}>
        <Text style={styles.title}>價格數據分析</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowFilters(true)}
          >
            <Text style={styles.filterButtonText}>篩選</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 卡牌選擇 */}
      <View style={styles.cardSelector}>
        <TouchableOpacity
          style={styles.cardSelectorButton}
          onPress={selectCard}
        >
          <Text style={styles.cardSelectorText}>
            {selectedCardName || '選擇卡牌查看價格數據'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* 平台狀態 */}
      <View style={styles.platformStatus}>
        <Text style={styles.sectionTitle}>平台狀態</Text>
        <View style={styles.platformGrid}>
          {pricePlatforms.map(platform => (
            <View key={platform} style={styles.platformItem}>
              <Text style={styles.platformStatusIndicator}>
                {getPlatformStatusIndicator(platform)}
              </Text>
              <Text style={styles.platformName}>{platform}</Text>
            </View>
          ))}
        </View>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* 歷史價格圖表 */}
        {selectedCardId && (
          <View style={styles.section}>
            <HistoricalPriceChart
              data={getCurrentHistoricalData()}
              selectedPlatforms={filters.selectedPlatforms}
              timeRange={filters.timeRange}
              height={300}
              showLegend={true}
              showStatistics={true}
            />
          </View>
        )}

        {/* 鑑定機構數據 */}
        {selectedCardId && (
          <View style={styles.section}>
            <GradingAgencyDisplay
              data={getCurrentGradingData()}
              selectedAgencies={filters.selectedAgencies}
              showPopulationChart={true}
              showPriceChart={true}
              showPremiumChart={true}
            />
          </View>
        )}

        {/* 平台推薦 */}
        {recommendedPlatforms && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>推薦平台</Text>
            <View style={styles.recommendationsContainer}>
              <Text style={styles.subsectionTitle}>價格平台</Text>
              {recommendedPlatforms.pricePlatforms.map(platform => (
                <View key={platform.platform} style={styles.recommendationItem}>
                  <View style={styles.recommendationHeader}>
                    <Text style={styles.platformName}>{platform.platform}</Text>
                    <View style={styles.reliabilityContainer}>
                      <Text style={styles.reliabilityLabel}>可靠性</Text>
                      <Text style={styles.reliabilityValue}>
                        {(platform.reliability * 100).toFixed(0)}%
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.recommendationDescription}>
                    {platform.description}
                  </Text>
                  <Text style={styles.recommendationDetails}>
                    更新頻率: {platform.updateFrequency} | 覆蓋範圍:{' '}
                    {platform.coverage}
                  </Text>
                </View>
              ))}

              <Text style={styles.subsectionTitle}>鑑定機構</Text>
              {recommendedPlatforms.gradingAgencies.map(agency => (
                <View key={agency.agency} style={styles.recommendationItem}>
                  <View style={styles.recommendationHeader}>
                    <Text style={styles.platformName}>{agency.agency}</Text>
                    <View style={styles.reliabilityContainer}>
                      <Text style={styles.reliabilityLabel}>可靠性</Text>
                      <Text style={styles.reliabilityValue}>
                        {(agency.reliability * 100).toFixed(0)}%
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.recommendationDescription}>
                    {agency.description}
                  </Text>
                  <Text style={styles.recommendationDetails}>
                    更新頻率: {agency.updateFrequency} | 覆蓋範圍:{' '}
                    {agency.coverage}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* 加載指示器 */}
        {isLoading && (
          <View style={styles.loadingContainer}>
            <Loading size='large' />
            <Text style={styles.loadingText}>正在加載價格數據...</Text>
          </View>
        )}
      </ScrollView>

      {/* 過濾器模態框 */}
      <Modal
        visible={showFilters}
        onClose={() => setShowFilters(false)}
        title='數據過濾器'
      >
        <View style={styles.filterModal}>
          <Text style={styles.filterSectionTitle}>價格平台</Text>
          <View style={styles.filterOptions}>
            {pricePlatforms.map(platform => (
              <TouchableOpacity
                key={platform}
                style={[
                  styles.filterOption,
                  filters.selectedPlatforms.includes(platform) &&
                    styles.filterOptionSelected,
                ]}
                onPress={() => {
                  const newPlatforms = filters.selectedPlatforms.includes(
                    platform
                  )
                    ? filters.selectedPlatforms.filter(p => p !== platform)
                    : [...filters.selectedPlatforms, platform];
                  updateFilters({ selectedPlatforms: newPlatforms });
                }}
              >
                <Text
                  style={[
                    styles.filterOptionText,
                    filters.selectedPlatforms.includes(platform) &&
                      styles.filterOptionTextSelected,
                  ]}
                >
                  {platform}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.filterSectionTitle}>鑑定機構</Text>
          <View style={styles.filterOptions}>
            {gradingAgencies.map(agency => (
              <TouchableOpacity
                key={agency}
                style={[
                  styles.filterOption,
                  filters.selectedAgencies.includes(agency) &&
                    styles.filterOptionSelected,
                ]}
                onPress={() => {
                  const newAgencies = filters.selectedAgencies.includes(agency)
                    ? filters.selectedAgencies.filter(a => a !== agency)
                    : [...filters.selectedAgencies, agency];
                  updateFilters({ selectedAgencies: newAgencies });
                }}
              >
                <Text
                  style={[
                    styles.filterOptionText,
                    filters.selectedAgencies.includes(agency) &&
                      styles.filterOptionTextSelected,
                  ]}
                >
                  {agency}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.filterActions}>
            <Button
              title='清除篩選'
              onPress={handleClearFilters}
              variant='outline'
              style={styles.filterButton}
            />
            <Button
              title='應用篩選'
              onPress={() => {
                setShowFilters(false);
                loadPriceData();
              }}
              style={styles.filterButton}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  title: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
  },
  headerActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  filterButton: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.sm,
  },
  filterButtonText: {
    color: theme.colors.white,
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.semibold,
  },
  cardSelector: {
    padding: theme.spacing.md,
  },
  cardSelectorButton: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderStyle: 'dashed',
  },
  cardSelectorText: {
    textAlign: 'center',
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text.secondary,
  },
  platformStatus: {
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  platformGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  platformItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  platformStatusIndicator: {
    fontSize: 16,
    marginRight: theme.spacing.xs,
  },
  platformName: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text.primary,
  },
  content: {
    flex: 1,
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  recommendationsContainer: {
    padding: theme.spacing.md,
  },
  subsectionTitle: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text.primary,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  recommendationItem: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  recommendationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  reliabilityContainer: {
    alignItems: 'center',
  },
  reliabilityLabel: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.text.secondary,
  },
  reliabilityValue: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.primary,
  },
  recommendationDescription: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  recommendationDetails: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.text.secondary,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  loadingText: {
    marginTop: theme.spacing.sm,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
  },
  filterModal: {
    padding: theme.spacing.md,
  },
  filterSectionTitle: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text.primary,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  filterOption: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  filterOptionSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  filterOptionText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.primary,
  },
  filterOptionTextSelected: {
    color: theme.colors.white,
  },
  filterActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.lg,
  },
});
