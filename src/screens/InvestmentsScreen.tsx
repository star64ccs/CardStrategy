import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
  RefreshControl,
  TouchableOpacity
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { useAppDispatch, RootState } from '@/store';
import { useTheme } from '@/config/ThemeProvider';
import { Button } from '@/components/common/Button';
import { Loading } from '@/components/common/Loading';
import { Card } from '@/components/common/Card';
import { Modal } from '@/components/common/Modal';
import { fetchInvestments, getPortfolio, addInvestment, updateInvestment } from '@/store/slices/investmentSlice';
import { Investment, InvestmentType } from '@/types';
import { formatCurrency, formatPercentage, formatDate } from '@/utils/formatters';
import { logger } from '@/utils/logger';

export const InvestmentsScreen: React.FC = () => {
  const { theme } = useTheme();
  const dispatch = useAppDispatch();
  const {
    investments,
    portfolio,
    isLoading,
    error,
    portfolioValue,
    totalProfitLoss,
    profitLossPercentage
  } = useSelector((state: RootState) => state.investments);
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'investments'>('overview');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedInvestment, setSelectedInvestment] = useState<Investment | null>(null);
  const [filterType, setFilterType] = useState<InvestmentType | 'all'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'profit' | 'value'>('date');

  // 加載投資數據
  useEffect(() => {
    loadInvestmentData();
  }, []);

  const loadInvestmentData = useCallback(async () => {
    try {
      await Promise.all([
        dispatch(fetchInvestments()),
        dispatch(getPortfolio())
      ]);
    } catch (error) {
      logger.error('Failed to load investment data:', { error });
      Alert.alert('錯誤', '載入投資數據失敗，請稍後再試');
    }
  }, [dispatch]);

  // 處理錯誤
  useEffect(() => {
    if (error) {
      Alert.alert('錯誤', error);
    }
  }, [error]);

  // 處理刷新
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadInvestmentData();
    setRefreshing(false);
  }, [loadInvestmentData]);

  // 計算投資統計
  const investmentStats = useMemo(() => {
    const totalInvestments = investments.length;
    const profitableInvestments = investments.filter((inv: any) => inv.profitLoss >= 0).length;
    const avgReturn = totalInvestments > 0 
      ? investments.reduce((sum: number, inv: any) => sum + inv.profitLossPercentage, 0) / totalInvestments 
      : 0;
    const bestInvestment = investments.reduce((best: any, inv: any) => 
      inv.profitLossPercentage > best.profitLossPercentage ? inv : best
    , investments[0] || null);
    const worstInvestment = investments.reduce((worst: any, inv: any) => 
      inv.profitLossPercentage < worst.profitLossPercentage ? inv : worst
    , investments[0] || null);

    return {
      totalInvestments,
      profitableInvestments,
      avgReturn,
      bestInvestment,
      worstInvestment
    };
  }, [investments]);

  // 過濾和排序投資
  const filteredAndSortedInvestments = useMemo(() => {
    let filtered = investments;
    
    // 應用類型過濾
    if (filterType !== 'all') {
      filtered = filtered.filter(inv => inv.type === filterType);
    }

    // 應用排序
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'profit':
          return b.profitLossPercentage - a.profitLossPercentage;
        case 'value':
          return b.currentValue - a.currentValue;
        default:
          return 0;
      }
    });

    return filtered;
  }, [investments, filterType, sortBy]);

  // 風險評估
  const riskAssessment = useMemo(() => {
    const highRiskInvestments = investments.filter(inv => inv.riskLevel === 'high').length;
    const mediumRiskInvestments = investments.filter(inv => inv.riskLevel === 'medium').length;
    const lowRiskInvestments = investments.filter(inv => inv.riskLevel === 'low').length;
    
    const totalRisk = highRiskInvestments * 3 + mediumRiskInvestments * 2 + lowRiskInvestments;
    const avgRisk = investments.length > 0 ? totalRisk / investments.length : 0;
    
    let riskLevel: RiskLevel = 'low';
    if (avgRisk > 2.5) riskLevel = 'high';
    else if (avgRisk > 1.5) riskLevel = 'medium';

    return {
      riskLevel,
      highRisk: highRiskInvestments,
      mediumRisk: mediumRiskInvestments,
      lowRisk: lowRiskInvestments,
      avgRisk
    };
  }, [investments]);

  // 添加新投資
  const handleAddInvestment = useCallback(() => {
    setShowAddModal(true);
  }, []);

  // 處理投資點擊
  const handleInvestmentPress = useCallback((investment: Investment) => {
    setSelectedInvestment(investment);
  }, []);

  // 獲取投資類型標籤
  const getInvestmentTypeLabel = (type: InvestmentType): string => {
    const labels: Record<InvestmentType, string> = {
      'purchase': '購買',
      'sale': '出售',
      'trade': '交易',
      'gift': '贈送',
      'auction': '拍賣'
    };
    return labels[type] || type;
  };

  // 獲取風險等級顏色
  const getRiskColor = (risk: RiskLevel): string => {
    const colors: Record<RiskLevel, string> = {
      'low': theme.colors.success,
      'medium': theme.colors.warning,
      'high': theme.colors.error
    };
    return colors[risk] || theme.colors.textSecondary;
  };

  const renderPortfolioOverview = () => (
    <View style={[styles.overviewContainer, { backgroundColor: theme.colors.backgroundPaper }]}>
      <Text style={[styles.overviewTitle, { color: theme.colors.textPrimary }]}>
        投資組合概覽
      </Text>

      <View style={styles.portfolioStats}>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: theme.colors.primary }]}>
            {formatCurrency(portfolioValue || 0)}
          </Text>
          <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
            總價值
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text
            style={[
              styles.statValue,
              { color: totalProfitLoss >= 0 ? theme.colors.success : theme.colors.error }
            ]}
          >
            {totalProfitLoss >= 0 ? '+' : ''}{formatCurrency(totalProfitLoss || 0)}
          </Text>
          <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
            總盈虧
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text
            style={[
              styles.statValue,
              { color: profitLossPercentage >= 0 ? theme.colors.success : theme.colors.error }
            ]}
          >
            {profitLossPercentage >= 0 ? '+' : ''}{formatPercentage(profitLossPercentage || 0)}
          </Text>
          <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
            收益率
          </Text>
        </View>
      </View>

      {/* 投資統計 */}
      <View style={styles.investmentStats}>
        <Card variant="elevated" padding="medium" style={styles.statCard}>
          <Text style={[styles.statNumber, { color: theme.colors.primary }]}>
            {investmentStats.totalInvestments}
          </Text>
          <Text style={[styles.statText, { color: theme.colors.textSecondary }]}>
            總投資數
          </Text>
        </Card>
        <Card variant="elevated" padding="medium" style={styles.statCard}>
          <Text style={[styles.statNumber, { color: theme.colors.success }]}>
            {investmentStats.profitableInvestments}
          </Text>
          <Text style={[styles.statText, { color: theme.colors.textSecondary }]}>
            盈利投資
          </Text>
        </Card>
        <Card variant="elevated" padding="medium" style={styles.statCard}>
          <Text style={[styles.statNumber, { color: getRiskColor(riskAssessment.riskLevel) }]}>
            {formatPercentage(investmentStats.avgReturn)}
          </Text>
          <Text style={[styles.statText, { color: theme.colors.textSecondary }]}>
            平均收益
          </Text>
        </Card>
      </View>

      {/* 風險評估 */}
      <Card variant="elevated" padding="medium" style={styles.riskCard}>
        <Text style={[styles.riskTitle, { color: theme.colors.textPrimary }]}>
          風險評估
        </Text>
        <View style={styles.riskBreakdown}>
          <View style={styles.riskItem}>
            <View style={[styles.riskIndicator, { backgroundColor: theme.colors.success }]} />
            <Text style={[styles.riskText, { color: theme.colors.textSecondary }]}>
              低風險: {riskAssessment.lowRisk}
            </Text>
          </View>
          <View style={styles.riskItem}>
            <View style={[styles.riskIndicator, { backgroundColor: theme.colors.warning }]} />
            <Text style={[styles.riskText, { color: theme.colors.textSecondary }]}>
              中風險: {riskAssessment.mediumRisk}
            </Text>
          </View>
          <View style={styles.riskItem}>
            <View style={[styles.riskIndicator, { backgroundColor: theme.colors.error }]} />
            <Text style={[styles.riskText, { color: theme.colors.textSecondary }]}>
              高風險: {riskAssessment.highRisk}
            </Text>
          </View>
        </View>
        <Text style={[styles.overallRisk, { color: getRiskColor(riskAssessment.riskLevel) }]}>
          整體風險等級: {riskAssessment.riskLevel === 'high' ? '高' : riskAssessment.riskLevel === 'medium' ? '中' : '低'}
        </Text>
      </Card>
    </View>
  );

  const renderInvestmentsList = () => (
    <View style={styles.investmentsContainer}>
      {/* 過濾和排序控制 */}
      <View style={styles.controlsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {['all', 'purchase', 'sale', 'trade', 'gift', 'auction'].map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.filterButton,
                {
                  backgroundColor: filterType === type 
                    ? theme.colors.primary[100] 
                    : theme.colors.background,
                  borderColor: theme.colors.borderLight
                }
              ]}
              onPress={() => setFilterType(type as InvestmentType | 'all')}
            >
              <Text style={[
                styles.filterButtonText,
                { color: filterType === type ? theme.colors.primary[500] : theme.colors.textSecondary }
              ]}>
                {type === 'all' ? '全部' : getInvestmentTypeLabel(type as InvestmentType)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.sortContainer}>
          <TouchableOpacity
            style={[
              styles.sortButton,
              { backgroundColor: sortBy === 'date' ? theme.colors.primary[100] : theme.colors.background }
            ]}
            onPress={() => setSortBy('date')}
          >
            <Text style={[styles.sortButtonText, { color: sortBy === 'date' ? theme.colors.primary[500] : theme.colors.textSecondary }]}>
              日期
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.sortButton,
              { backgroundColor: sortBy === 'profit' ? theme.colors.primary[100] : theme.colors.background }
            ]}
            onPress={() => setSortBy('profit')}
          >
            <Text style={[styles.sortButtonText, { color: sortBy === 'profit' ? theme.colors.primary[500] : theme.colors.textSecondary }]}>
              收益
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.sortButton,
              { backgroundColor: sortBy === 'value' ? theme.colors.primary[100] : theme.colors.background }
            ]}
            onPress={() => setSortBy('value')}
          >
            <Text style={[styles.sortButtonText, { color: sortBy === 'value' ? theme.colors.primary[500] : theme.colors.textSecondary }]}>
              價值
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 投資列表 */}
      <ScrollView style={styles.investmentsList}>
        {filteredAndSortedInvestments.map((investment) => (
          <TouchableOpacity
            key={investment.id}
            style={[styles.investmentItem, { backgroundColor: theme.colors.backgroundPaper }]}
            onPress={() => handleInvestmentPress(investment)}
          >
            <View style={styles.investmentHeader}>
              <Text style={[styles.investmentName, { color: theme.colors.textPrimary }]}>
                {investment.cardName}
              </Text>
              <View style={[styles.investmentType, { backgroundColor: theme.colors.primary[100] }]}>
                <Text style={[styles.investmentTypeText, { color: theme.colors.primary[500] }]}>
                  {getInvestmentTypeLabel(investment.type)}
                </Text>
              </View>
            </View>
            
            <View style={styles.investmentDetails}>
              <View style={styles.investmentRow}>
                <Text style={[styles.investmentLabel, { color: theme.colors.textSecondary }]}>
                  投資金額:
                </Text>
                <Text style={[styles.investmentValue, { color: theme.colors.textPrimary }]}>
                  {formatCurrency(investment.investmentAmount)}
                </Text>
              </View>
              <View style={styles.investmentRow}>
                <Text style={[styles.investmentLabel, { color: theme.colors.textSecondary }]}>
                  當前價值:
                </Text>
                <Text style={[styles.investmentValue, { color: theme.colors.textPrimary }]}>
                  {formatCurrency(investment.currentValue)}
                </Text>
              </View>
              <View style={styles.investmentRow}>
                <Text style={[styles.investmentLabel, { color: theme.colors.textSecondary }]}>
                  盈虧:
                </Text>
                <Text style={[
                  styles.investmentValue,
                  { color: investment.profitLoss >= 0 ? theme.colors.success : theme.colors.error }
                ]}>
                  {investment.profitLoss >= 0 ? '+' : ''}{formatCurrency(investment.profitLoss)}
                  {' '}({investment.profitLoss >= 0 ? '+' : ''}{formatPercentage(investment.profitLossPercentage)})
                </Text>
              </View>
            </View>

            <View style={styles.investmentFooter}>
              <Text style={[styles.investmentDate, { color: theme.colors.textSecondary }]}>
                {formatDate(investment.date)}
              </Text>
              <View style={[styles.riskBadge, { backgroundColor: getRiskColor(investment.riskLevel) + '20' }]}>
                <Text style={[styles.riskBadgeText, { color: getRiskColor(investment.riskLevel) }]}>
                  {investment.riskLevel === 'high' ? '高風險' : investment.riskLevel === 'medium' ? '中風險' : '低風險'}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.backgroundPaper }]}>
        <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>
          投資管理
        </Text>
        <Button
          title="添加投資"
          variant="primary"
          size="small"
          onPress={handleAddInvestment}
        />
      </View>

      {/* Tab Navigation */}
      <View style={[styles.tabContainer, { backgroundColor: theme.colors.backgroundPaper }]}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            { backgroundColor: selectedTab === 'overview' ? theme.colors.primary[500] : 'transparent' }
          ]}
          onPress={() => setSelectedTab('overview')}
        >
          <Text style={[
            styles.tabButtonText,
            { color: selectedTab === 'overview' ? theme.colors.white : theme.colors.textSecondary }
          ]}>
            概覽
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tabButton,
            { backgroundColor: selectedTab === 'investments' ? theme.colors.primary[500] : 'transparent' }
          ]}
          onPress={() => setSelectedTab('investments')}
        >
          <Text style={[
            styles.tabButtonText,
            { color: selectedTab === 'investments' ? theme.colors.white : theme.colors.textSecondary }
          ]}>
            投資記錄
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing || isLoading} 
            onRefresh={handleRefresh}
            colors={[theme.colors.primary[500] || '#007AFF']}
          />
        }
      >
        {selectedTab === 'overview' ? renderPortfolioOverview() : renderInvestmentsList()}
      </ScrollView>

      {/* Add Investment Modal */}
      <Modal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="添加投資"
      >
        <View style={styles.modalContent}>
          <Text style={[styles.modalText, { color: theme.colors.textSecondary }]}>
            此功能即將推出
          </Text>
          <Button
            title="關閉"
            onPress={() => setShowAddModal(false)}
            fullWidth
          />
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB'
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold'
  },
  content: {
    flex: 1,
    padding: 16
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB'
  },
  tabButton: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent'
  },
  tabButtonText: {
    fontSize: 16,
    fontWeight: '500'
  },
  overviewContainer: {
    margin: 8,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  overviewTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16
  },
  portfolioStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16
  },
  statItem: {
    alignItems: 'center'
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4
  },
  statLabel: {
    fontSize: 12
  },
  investmentStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16
  },
  statCard: {
    alignItems: 'center'
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4
  },
  statText: {
    fontSize: 12
  },
  riskCard: {
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  riskTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12
  },
  riskBreakdown: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12
  },
  riskItem: {
    alignItems: 'center'
  },
  riskIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginBottom: 4
  },
  riskText: {
    fontSize: 12
  },
  overallRisk: {
    fontSize: 16,
    fontWeight: 'bold'
  },
  investmentsContainer: {
    margin: 8,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginRight: 8
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500'
  },
  sortContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16
  },
  sortButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginRight: 8
  },
  sortButtonText: {
    fontSize: 14,
    fontWeight: '500'
  },
  investmentsList: {
    flex: 1
  },
  investmentItem: {
    margin: 8,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  investmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  investmentName: {
    fontSize: 16,
    fontWeight: '600'
  },
  investmentType: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8
  },
  investmentTypeText: {
    fontSize: 12,
    fontWeight: '500'
  },
  investmentDetails: {
    marginBottom: 12
  },
  investmentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4
  },
  investmentLabel: {
    fontSize: 12
  },
  investmentValue: {
    fontSize: 14,
    fontWeight: '500'
  },
  investmentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12
  },
  investmentDate: {
    fontSize: 12
  },
  riskBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12
  },
  riskBadgeText: {
    fontSize: 12,
    fontWeight: '500'
  },
  modalContent: {
    padding: 20,
    alignItems: 'center'
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center'
  }
});
