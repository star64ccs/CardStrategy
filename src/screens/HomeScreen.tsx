import React, { useEffect, useCallback, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { CardItem } from '@/components/cards/CardItem';
import { theme } from '@/config/theme';
import { RootState } from '@/store';
import { fetchCard } from '@/store/slices/cardSlice';
import { fetchCollections } from '@/store/slices/collectionSlice';
import { fetchInvestments } from '@/store/slices/investmentSlice';
import { fetchMarketData } from '@/store/slices/marketSlice';
import { logger } from '@/utils/logger';
import { formatCurrency, formatPercentage } from '@/utils/formatters';
import { getGreeting } from '@/utils/helpers';

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { cards, isLoading } = useSelector((state: RootState) => state.cards);
  const { collections } = useSelector((state: RootState) => state.collection);
  const { investments, portfolioValue, totalProfitLoss, profitLossPercentage } = useSelector((state: RootState) => state.investments);
  const { marketData, isLoading: marketLoading } = useSelector((state: RootState) => state.market);
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [refreshing, setRefreshing] = useState(false);
  const [greeting, setGreeting] = useState('');

  // 初始化問候語
  useEffect(() => {
    setGreeting(getGreeting());
  }, []);

  const loadData = useCallback(async () => {
    try {
      await Promise.all([
        dispatch(fetchCard('sample-id') as any),
        dispatch(fetchCollections() as any),
        dispatch(fetchInvestments() as any),
        dispatch(fetchMarketData() as any)
      ]);
    } catch (error) {
      logger.error('Failed to load home data:', { error });
      Alert.alert('錯誤', '載入數據失敗，請稍後再試');
    }
  }, [dispatch]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // 計算投資組合統計
  const getPortfolioStats = () => {
    const totalCards = cards.length;
    const totalCollections = collections.length;
    const totalInvestments = investments.length;
    const avgCardValue = totalCards > 0 ? portfolioValue / totalCards : 0;

    return {
      totalCards,
      totalCollections,
      totalInvestments,
      avgCardValue
    };
  };

  // 獲取市場趨勢摘要
  const getMarketTrends = () => {
    if (!marketData || marketData.length === 0) {
      return {
        trend: 'stable',
        change: 0,
        message: '市場數據載入中...'
      };
    }

    const recentData = marketData.slice(-7); // 最近7天
    const firstPrice = recentData[0]?.price || 0;
    const lastPrice = recentData[recentData.length - 1]?.price || 0;
    const change = ((lastPrice - firstPrice) / firstPrice) * 100;

    return {
      trend: change > 0 ? 'up' : change < 0 ? 'down' : 'stable',
      change: Math.abs(change),
      message: change > 0 
        ? `市場上漲 ${change.toFixed(2)}%`
        : change < 0 
        ? `市場下跌 ${change.toFixed(2)}%`
        : '市場穩定'
    };
  };

  // 獲取推薦卡牌
  const getRecommendedCards = () => {
    // 基於用戶收藏和投資歷史的簡單推薦邏輯
    const userCollections = collections.filter((c: any) => c.userId === user?.id);
    const userInvestments = investments.filter((i: any) => i.userId === user?.id);
    
    // 如果用戶有收藏，推薦相似卡牌
    if (userCollections.length > 0) {
      return cards.slice(0, 6);
    }
    
    // 如果用戶有投資，推薦熱門卡牌
    if (userInvestments.length > 0) {
      return cards.slice(0, 6);
    }
    
    // 默認推薦熱門卡牌
    return cards.slice(0, 6);
  };

  const quickActions = [
    {
      title: '掃描卡牌',
      icon: 'camera',
      color: theme.colors.primary[500],
      onPress: () => navigation.navigate('CardScanner' as never)
    },
    {
      title: '我的收藏',
      icon: 'albums',
      color: theme.colors.secondary[500],
      onPress: () => navigation.navigate('Collections' as never)
    },
    {
      title: '投資分析',
      icon: 'trending-up',
      color: theme.colors.success,
      onPress: () => navigation.navigate('Investments' as never)
    },
    {
      title: 'AI 助手',
      icon: 'chatbubble',
      color: theme.colors.warning,
      onPress: () => navigation.navigate('AIChat' as never)
    }
  ];

  const portfolioStats = getPortfolioStats();
  const marketTrends = getMarketTrends();
  const recommendedCards = getRecommendedCards();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing || isLoading} 
            onRefresh={handleRefresh}
            colors={[theme.colors.primary[500] || '#007AFF']}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              {greeting}，{user?.displayName || '用戶'}！
            </Text>
            <Text style={styles.subtitle}>探索你的卡牌世界</Text>
          </View>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => navigation.navigate('Profile' as never)}
          >
            <Ionicons name="person-circle" size={40} color={theme.colors.primary[500]} />
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>快速功能</Text>
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action, index) => (
              <TouchableOpacity
                key={index}
                style={styles.quickAction}
                onPress={action.onPress}
                activeOpacity={0.8}
              >
                <View style={[styles.actionIcon, { backgroundColor: action.color }]}>
                  <Ionicons name={action.icon as any} size={24} color={theme.colors.white} />
                </View>
                <Text style={styles.actionTitle}>{action.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Portfolio Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>投資組合概覽</Text>
          <View style={styles.statsGrid}>
            <Card variant="filled" padding="medium" style={styles.statCard}>
              <Text style={styles.statNumber}>{portfolioStats.totalCollections}</Text>
              <Text style={styles.statLabel}>收藏集</Text>
            </Card>
            <Card variant="filled" padding="medium" style={styles.statCard}>
              <Text style={styles.statNumber}>{portfolioStats.totalCards}</Text>
              <Text style={styles.statLabel}>卡牌</Text>
            </Card>
            <Card variant="filled" padding="medium" style={styles.statCard}>
              <Text style={styles.statNumber}>{portfolioStats.totalInvestments}</Text>
              <Text style={styles.statLabel}>投資</Text>
            </Card>
          </View>
          
          {/* Portfolio Value */}
          <Card variant="elevated" padding="medium" style={styles.portfolioCard}>
            <View style={styles.portfolioRow}>
              <View>
                <Text style={styles.portfolioLabel}>總價值</Text>
                <Text style={styles.portfolioValue}>
                  {formatCurrency(portfolioValue || 0)}
                </Text>
              </View>
              <View style={styles.portfolioChange}>
                <Text style={[
                  styles.portfolioChangeText,
                  { color: totalProfitLoss >= 0 ? theme.colors.success : theme.colors.error }
                ]}>
                  {totalProfitLoss >= 0 ? '+' : ''}{formatCurrency(totalProfitLoss || 0)}
                </Text>
                <Text style={[
                  styles.portfolioChangePercent,
                  { color: profitLossPercentage >= 0 ? theme.colors.success : theme.colors.error }
                ]}>
                  {profitLossPercentage >= 0 ? '+' : ''}{formatPercentage(profitLossPercentage || 0)}
                </Text>
              </View>
            </View>
          </Card>
        </View>

        {/* Recommended Cards */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>推薦卡牌</Text>
            <Button
              title="查看全部"
              variant="ghost"
              size="small"
              onPress={() => navigation.navigate('Cards' as never)}
            />
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.cardsRow}>
              {recommendedCards.map((card: any) => (
                <CardItem
                  key={card.id}
                  card={card}
                  variant="compact"
                  onPress={() => (navigation as any).navigate('CardDetail', { cardId: card.id })}
                />
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Market Trends */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>市場趨勢</Text>
          <Card variant="elevated" padding="medium">
            <View style={styles.marketTrendRow}>
              <View style={styles.marketTrendInfo}>
                <Text style={styles.trendText}>{marketTrends.message}</Text>
                {marketTrends.trend !== 'stable' && (
                  <View style={styles.trendIndicator}>
                    <Ionicons 
                      name={marketTrends.trend === 'up' ? 'trending-up' : 'trending-down'} 
                      size={16} 
                      color={marketTrends.trend === 'up' ? theme.colors.success : theme.colors.error} 
                    />
                    <Text style={[
                      styles.trendChange,
                      { color: marketTrends.trend === 'up' ? theme.colors.success : theme.colors.error }
                    ]}>
                      {marketTrends.change.toFixed(2)}%
                    </Text>
                  </View>
                )}
              </View>
              <Button
                title="查看詳細分析"
                variant="outline"
                size="small"
                onPress={() => navigation.navigate('MarketAnalysis' as never)}
              />
            </View>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.backgroundLight
  },
  scrollView: {
    flex: 1
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.large,
    paddingVertical: theme.spacing.medium
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.textPrimary
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xsmall
  },
  profileButton: {
    padding: theme.spacing.xsmall
  },
  section: {
    paddingHorizontal: theme.spacing.large,
    marginBottom: theme.spacing.large
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.medium
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.medium
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  },
  quickAction: {
    width: '48%',
    alignItems: 'center',
    padding: theme.spacing.medium,
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: theme.borderRadius.medium,
    marginBottom: theme.spacing.small
  },
  actionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.small
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.textPrimary,
    textAlign: 'center'
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  statCard: {
    flex: 1,
    marginHorizontal: theme.spacing.xsmall,
    alignItems: 'center'
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.primary[500]
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xsmall
  },
  portfolioCard: {
    marginTop: theme.spacing.medium,
    padding: theme.spacing.medium
  },
  portfolioRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  portfolioLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary
  },
  portfolioValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.textPrimary
  },
  portfolioChange: {
    alignItems: 'flex-end'
  },
  portfolioChangeText: {
    fontSize: 16,
    fontWeight: 'bold'
  },
  portfolioChangePercent: {
    fontSize: 14,
    marginTop: theme.spacing.xsmall
  },
  cardsRow: {
    flexDirection: 'row',
    paddingRight: theme.spacing.large
  },
  trendText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.medium
  },
  marketTrendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  marketTrendInfo: {
    flex: 1,
    marginRight: theme.spacing.medium
  },
  trendIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.xsmall
  },
  trendChange: {
    fontSize: 14,
    marginLeft: theme.spacing.xsmall
  }
});
