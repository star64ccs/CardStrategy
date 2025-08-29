import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { useSelector } from 'react-redux';
import { selectUser } from '../store/slices/authSlice';
import { cardService, Card } from '../services/cardService';
import { portfolioService, PortfolioItem } from '../services/portfolioService';
import {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
} from '../config/theme';
import { logger } from '../utils/logger';
import { errorHandlerService } from '../services/errorHandlerService';
import {
  FadeInView,
  SlideUpView,
  AnimatedButton,
  SkeletonText,
  SkeletonTitle,
} from '../components/common';

const { width } = Dimensions.get('window');

interface HomeScreenProps {
  onCardPress: (card: Card) => void;
  onNavigateToPortfolio: () => void;
  onNavigateToMarket: () => void;
  onNavigateToAI: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onCardPress,
  onNavigateToPortfolio,
  onNavigateToMarket,
  onNavigateToAI,
}) => {
  const user = useSelector(selectUser);
  const [cards, setCards] = useState<Card[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [portfolioStats, setPortfolioStats] = useState({
    totalValue: 0,
    totalProfit: 0,
    profitPercentage: 0,
  });
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // 使用真實 API 獲取卡片數據
      const cardsResponse = await cardService.getCards({
        page: 1,
        limit: 10,
        sortBy: 'date',
        sortOrder: 'desc',
      });

      if (cardsResponse.success) {
        setCards(cardsResponse.data.cards);
      } else {
        // 如果 API 失敗，使用模擬數據作為備用
        logger.warn('API 獲取卡片失敗，使用模擬數據', {
          error: cardsResponse.message,
        });
        const mockCards = cardService.getMockCards();
        setCards(mockCards);
      }

      // 獲取投資組合數據
      const portfolioData = await portfolioService.getPortfolio();
      setPortfolio(portfolioData);

      // 獲取投資組合統計
      const stats = portfolioService.getPortfolioStats();
      setPortfolioStats({
        totalValue: stats.totalValue,
        totalProfit: stats.totalProfit,
        profitPercentage: stats.profitPercentage,
      });
    } catch (error) {
      // 使用統一的錯誤處理
      await errorHandlerService.handleError(
        error as Error,
        'HomeScreen.loadData',
        'medium',
        'api'
      );
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toLocaleString()}`;
  };

  const formatPercentage = (percentage: number) => {
    const sign = percentage >= 0 ? '+' : '';
    return `${sign}${percentage.toFixed(2)}%`;
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* 歡迎區域 */}
      <FadeInView animation='fadeIn' duration={800} delay={200}>
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>
            歡迎回來，{user?.username || '用戶'}！
          </Text>
          <Text style={styles.welcomeSubtext}>今天想要探索什麼卡牌呢？</Text>
        </View>
      </FadeInView>

      {/* 投資組合概覽 */}
      <SlideUpView animation='slideUp' duration={600} delay={400}>
        <View style={styles.portfolioSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>💎 投資組合</Text>
            <AnimatedButton onPress={onNavigateToPortfolio} scaleOnPress={true}>
              <Text style={styles.seeAllText}>查看全部</Text>
            </AnimatedButton>
          </View>

          <View style={styles.portfolioCard}>
            <View style={styles.portfolioStats}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>總價值</Text>
                <Text style={styles.statValue}>
                  {formatCurrency(portfolioStats.totalValue)}
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>總收益</Text>
                <Text
                  style={[
                    styles.statValue,
                    {
                      color:
                        portfolioStats.totalProfit >= 0
                          ? colors.success
                          : colors.error,
                    },
                  ]}
                >
                  {formatCurrency(portfolioStats.totalProfit)}
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>收益率</Text>
                <Text
                  style={[
                    styles.statValue,
                    {
                      color:
                        portfolioStats.profitPercentage >= 0
                          ? colors.success
                          : colors.error,
                    },
                  ]}
                >
                  {formatPercentage(portfolioStats.profitPercentage)}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.portfolioButton}
              onPress={onNavigateToPortfolio}
            >
              <Text style={styles.portfolioButtonText}>管理投資組合</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SlideUpView>

      {/* 快速操作 */}
      <View style={styles.quickActionsSection}>
        <Text style={styles.sectionTitle}>🚀 快速操作</Text>
        <View style={styles.quickActionsGrid}>
          <TouchableOpacity
            style={styles.quickActionCard}
            onPress={onNavigateToMarket}
          >
            <Text style={styles.quickActionIcon}>📊</Text>
            <Text style={styles.quickActionTitle}>市場分析</Text>
            <Text style={styles.quickActionSubtitle}>查看市場趨勢</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionCard}
            onPress={onNavigateToAI}
          >
            <Text style={styles.quickActionIcon}>🤖</Text>
            <Text style={styles.quickActionTitle}>AI 助手</Text>
            <Text style={styles.quickActionSubtitle}>智能投資建議</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickActionCard}>
            <Text style={styles.quickActionIcon}>🔍</Text>
            <Text style={styles.quickActionTitle}>掃描卡片</Text>
            <Text style={styles.quickActionSubtitle}>快速識別卡片</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickActionCard}>
            <Text style={styles.quickActionIcon}>📈</Text>
            <Text style={styles.quickActionTitle}>價格追蹤</Text>
            <Text style={styles.quickActionSubtitle}>監控價格變化</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 熱門卡片 */}
      <View style={styles.hotCardsSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>🔥 熱門卡片</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>查看全部</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.hotCardsContainer}
        >
          {cards.slice(0, 5).map(card => (
            <TouchableOpacity
              key={card.id}
              style={styles.hotCard}
              onPress={() => onCardPress(card)}
            >
              <View style={styles.cardImageContainer}>
                <Text style={styles.cardImagePlaceholder}>🎴</Text>
              </View>
              <View style={styles.cardInfo}>
                <Text style={styles.cardName} numberOfLines={1}>
                  {card.name}
                </Text>
                <Text style={styles.cardSeries} numberOfLines={1}>
                  {card.setName}
                </Text>
                <Text style={styles.cardPrice}>
                  {formatCurrency(card.price.current)}
                </Text>
                <Text
                  style={[
                    styles.cardChange,
                    {
                      color:
                        card.price.change24h >= 0
                          ? colors.success
                          : colors.error,
                    },
                  ]}
                >
                  {formatPercentage(card.price.change24h)}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* 市場概覽 */}
      <View style={styles.marketSection}>
        <Text style={styles.sectionTitle}>📈 市場概覽</Text>
        <View style={styles.marketCard}>
          <View style={styles.marketStat}>
            <Text style={styles.marketStatLabel}>今日漲幅最大</Text>
            <Text style={styles.marketStatValue}>青眼白龍 +15.2%</Text>
          </View>
          <View style={styles.marketStat}>
            <Text style={styles.marketStatLabel}>今日跌幅最大</Text>
            <Text style={styles.marketStatValue}>黑魔導 -8.7%</Text>
          </View>
          <View style={styles.marketStat}>
            <Text style={styles.marketStatLabel}>交易量最高</Text>
            <Text style={styles.marketStatValue}>藍眼白龍 2.3M</Text>
          </View>
        </View>
      </View>

      {/* 底部間距 */}
      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  welcomeSection: {
    paddingHorizontal: spacing.large,
    paddingTop: spacing.large,
    paddingBottom: spacing.medium,
  },
  welcomeText: {
    fontSize: typography.fontSize.xl,
    fontWeight: '700' as const,
    color: colors.textPrimary,
    marginBottom: spacing.small,
  },
  welcomeSubtext: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
  },
  portfolioSection: {
    paddingHorizontal: spacing.large,
    marginBottom: spacing.xlarge,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.medium,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: '600' as const,
    color: colors.textPrimary,
  },
  seeAllText: {
    fontSize: typography.fontSize.sm,
    color: colors.accent,
    fontWeight: '500' as const,
  },
  portfolioCard: {
    backgroundColor: colors.backgroundPaper,
    borderRadius: borderRadius.large,
    padding: spacing.large,
    ...shadows.base,
  },
  portfolioStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.large,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
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
  portfolioButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.medium,
    paddingVertical: spacing.medium,
    alignItems: 'center',
  },
  portfolioButtonText: {
    color: colors.white,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semiBold,
  },
  quickActionsSection: {
    paddingHorizontal: spacing.large,
    marginBottom: spacing.xlarge,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionCard: {
    backgroundColor: colors.backgroundPaper,
    borderRadius: borderRadius.medium,
    padding: spacing.medium,
    width: (width - spacing.large * 2 - spacing.medium) / 2,
    marginBottom: spacing.medium,
    alignItems: 'center',
    ...shadows.sm,
  },
  quickActionIcon: {
    fontSize: 32,
    marginBottom: spacing.small,
  },
  quickActionTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.textPrimary,
    marginBottom: spacing.xsmall,
  },
  quickActionSubtitle: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  hotCardsSection: {
    paddingHorizontal: spacing.large,
    marginBottom: spacing.xlarge,
  },
  hotCardsContainer: {
    paddingRight: spacing.large,
  },
  hotCard: {
    backgroundColor: colors.backgroundPaper,
    borderRadius: borderRadius.medium,
    padding: spacing.medium,
    marginRight: spacing.medium,
    width: 160,
    ...shadows.sm,
  },
  cardImageContainer: {
    width: '100%',
    height: 100,
    backgroundColor: colors.background,
    borderRadius: borderRadius.small,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.small,
  },
  cardImagePlaceholder: {
    fontSize: 40,
  },
  cardInfo: {
    flex: 1,
  },
  cardName: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.textPrimary,
    marginBottom: spacing.xsmall,
  },
  cardSeries: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginBottom: spacing.xsmall,
  },
  cardPrice: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xsmall,
  },
  cardChange: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
  },
  marketSection: {
    paddingHorizontal: spacing.large,
    marginBottom: spacing.xlarge,
  },
  marketCard: {
    backgroundColor: colors.backgroundPaper,
    borderRadius: borderRadius.large,
    padding: spacing.large,
    ...shadows.base,
  },
  marketStat: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.medium,
  },
  marketStatLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  marketStatValue: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.textPrimary,
  },
  bottomSpacing: {
    height: spacing.xlarge,
  },
});

export default HomeScreen;
