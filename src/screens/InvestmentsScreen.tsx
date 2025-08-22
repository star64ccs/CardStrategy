import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Dimensions,
} from 'react-native';
import { portfolioService, PortfolioItem } from '../services/portfolioService';
import {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
} from '../config/theme';
import { logger } from '../utils/logger';

const { width } = Dimensions.get('window');

interface InvestmentsScreenProps {
  onCardPress: (card: any) => void;
}

const InvestmentsScreen: React.FC<InvestmentsScreenProps> = ({
  onCardPress,
}) => {
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [stats, setStats] = useState({
    totalValue: 0,
    totalCost: 0,
    totalProfit: 0,
    profitPercentage: 0,
    totalItems: 0,
  });
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPortfolio();
  }, []);

  const loadPortfolio = async () => {
    try {
      setIsLoading(true);
      const portfolioData = await portfolioService.getPortfolio();
      setPortfolio(portfolioData);

      const portfolioStats = portfolioService.getPortfolioStats();
      setStats({
        totalValue: portfolioStats.totalValue,
        totalCost: portfolioStats.totalCost,
        totalProfit: portfolioStats.totalProfit,
        profitPercentage: portfolioStats.profitPercentage,
        totalItems: portfolioStats.totalItems,
      });
    } catch (error) {
      logger.error('載入投資組合失敗:', { error });
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPortfolio();
    setRefreshing(false);
  };

  const handleRemoveItem = (itemId: string) => {
    Alert.alert('確認移除', '確定要從投資組合中移除這張卡片嗎？', [
      { text: '取消', style: 'cancel' },
      {
        text: '移除',
        style: 'destructive',
        onPress: async () => {
          try {
            await portfolioService.removeFromPortfolio(itemId);
            await loadPortfolio();
            Alert.alert('成功', '已從投資組合中移除');
          } catch (error) {
            Alert.alert('錯誤', '移除失敗，請稍後再試');
          }
        },
      },
    ]);
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toLocaleString()}`;
  };

  const formatPercentage = (percentage: number) => {
    const sign = percentage >= 0 ? '+' : '';
    return `${sign}${percentage.toFixed(2)}%`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-TW');
  };

  const renderPortfolioItem = ({ item }: { item: PortfolioItem }) => {
    const currentValue = item.card.price.current * item.quantity;
    const totalCost = item.purchasePrice * item.quantity;
    const profit = currentValue - totalCost;
    const profitPercentage = totalCost > 0 ? (profit / totalCost) * 100 : 0;

    return (
      <TouchableOpacity
        style={styles.portfolioItem}
        onPress={() => onCardPress(item.card)}
        activeOpacity={0.7}
      >
        <View style={styles.cardImageContainer}>
          <Text style={styles.cardImagePlaceholder}>🎴</Text>
        </View>

        <View style={styles.itemInfo}>
          <Text style={styles.cardName} numberOfLines={1}>
            {item.card.name}
          </Text>
          <Text style={styles.cardSetName} numberOfLines={1}>
            {item.card.setName}
          </Text>

          <View style={styles.itemMeta}>
            <Text style={styles.quantityText}>數量: {item.quantity}</Text>
            <Text style={styles.dateText}>
              購買: {formatDate(item.purchaseDate)}
            </Text>
          </View>

          <View style={styles.priceInfo}>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>購買價格:</Text>
              <Text style={styles.priceValue}>
                {formatCurrency(item.purchasePrice)}
              </Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>當前價格:</Text>
              <Text style={styles.priceValue}>
                {formatCurrency(item.card.price.current)}
              </Text>
            </View>
          </View>

          <View style={styles.profitInfo}>
            <View style={styles.profitRow}>
              <Text style={styles.profitLabel}>總收益:</Text>
              <Text
                style={[
                  styles.profitValue,
                  { color: profit >= 0 ? colors.success : colors.error },
                ]}
              >
                {formatCurrency(profit)}
              </Text>
            </View>
            <View style={styles.profitRow}>
              <Text style={styles.profitLabel}>收益率:</Text>
              <Text
                style={[
                  styles.profitValue,
                  {
                    color:
                      profitPercentage >= 0 ? colors.success : colors.error,
                  },
                ]}
              >
                {formatPercentage(profitPercentage)}
              </Text>
            </View>
          </View>

          {item.notes && (
            <Text style={styles.notesText} numberOfLines={2}>
              備註: {item.notes}
            </Text>
          )}
        </View>

        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => handleRemoveItem(item.id)}
        >
          <Text style={styles.removeButtonText}>移除</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const renderStatsCard = () => (
    <View style={styles.statsCard}>
      <Text style={styles.statsTitle}>📊 投資組合統計</Text>

      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>總價值</Text>
          <Text style={styles.statValue}>
            {formatCurrency(stats.totalValue)}
          </Text>
        </View>

        <View style={styles.statItem}>
          <Text style={styles.statLabel}>總成本</Text>
          <Text style={styles.statValue}>
            {formatCurrency(stats.totalCost)}
          </Text>
        </View>

        <View style={styles.statItem}>
          <Text style={styles.statLabel}>總收益</Text>
          <Text
            style={[
              styles.statValue,
              { color: stats.totalProfit >= 0 ? colors.success : colors.error },
            ]}
          >
            {formatCurrency(stats.totalProfit)}
          </Text>
        </View>

        <View style={styles.statItem}>
          <Text style={styles.statLabel}>收益率</Text>
          <Text
            style={[
              styles.statValue,
              {
                color:
                  stats.profitPercentage >= 0 ? colors.success : colors.error,
              },
            ]}
          >
            {formatPercentage(stats.profitPercentage)}
          </Text>
        </View>
      </View>

      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>總卡片數:</Text>
        <Text style={styles.summaryValue}>{stats.totalItems}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* 統計卡片 */}
      {renderStatsCard()}

      {/* 投資組合列表 */}
      <View style={styles.listContainer}>
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>💎 我的投資</Text>
          <Text style={styles.listSubtitle}>{portfolio.length} 張卡片</Text>
        </View>

        <FlatList
          data={portfolio}
          renderItem={renderPortfolioItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.portfolioList}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {isLoading ? '載入中...' : '您的投資組合還是空的'}
              </Text>
              <Text style={styles.emptySubtext}>
                開始添加卡片到您的投資組合吧！
              </Text>
            </View>
          }
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  statsCard: {
    backgroundColor: colors.backgroundPaper,
    borderRadius: borderRadius.large,
    padding: spacing.large,
    margin: spacing.large,
    ...shadows.base,
  },
  statsTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: '600' as const,
    color: colors.textPrimary,
    marginBottom: spacing.large,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: spacing.large,
  },
  statItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: spacing.medium,
  },
  statLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xsmall,
  },
  statValue: {
    fontSize: typography.fontSize.base,
    fontWeight: '600' as const,
    color: colors.textPrimary,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.medium,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  summaryLabel: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
  },
  summaryValue: {
    fontSize: typography.fontSize.base,
    fontWeight: '600' as const,
    color: colors.textPrimary,
  },
  listContainer: {
    flex: 1,
  },
  listHeader: {
    paddingHorizontal: spacing.large,
    paddingVertical: spacing.medium,
    backgroundColor: colors.backgroundPaper,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  listTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: '600' as const,
    color: colors.textPrimary,
    marginBottom: spacing.xsmall,
  },
  listSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  portfolioList: {
    paddingHorizontal: spacing.large,
    paddingBottom: spacing.xlarge,
  },
  portfolioItem: {
    backgroundColor: colors.backgroundPaper,
    borderRadius: borderRadius.large,
    padding: spacing.large,
    marginBottom: spacing.medium,
    flexDirection: 'row',
    ...shadows.base,
  },
  cardImageContainer: {
    width: 80,
    height: 120,
    backgroundColor: colors.background,
    borderRadius: borderRadius.medium,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.medium,
  },
  cardImagePlaceholder: {
    fontSize: 30,
  },
  itemInfo: {
    flex: 1,
  },
  cardName: {
    fontSize: typography.fontSize.base,
    fontWeight: '600' as const,
    color: colors.textPrimary,
    marginBottom: spacing.xsmall,
  },
  cardSetName: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.small,
  },
  itemMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.small,
  },
  quantityText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  dateText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  priceInfo: {
    marginBottom: spacing.small,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xsmall,
  },
  priceLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  priceValue: {
    fontSize: typography.fontSize.sm,
    fontWeight: '500' as const,
    color: colors.textPrimary,
  },
  profitInfo: {
    marginBottom: spacing.small,
  },
  profitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xsmall,
  },
  profitLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  profitValue: {
    fontSize: typography.fontSize.sm,
    fontWeight: '600' as const,
  },
  notesText: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  removeButton: {
    backgroundColor: colors.error,
    borderRadius: borderRadius.small,
    paddingHorizontal: spacing.medium,
    paddingVertical: spacing.small,
    justifyContent: 'center',
    marginLeft: spacing.small,
  },
  removeButtonText: {
    color: colors.white,
    fontSize: typography.fontSize.sm,
    fontWeight: '500' as const,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xlarge * 2,
  },
  emptyText: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.small,
  },
  emptySubtext: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});

export default InvestmentsScreen;
