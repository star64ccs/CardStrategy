import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';

import { useRecommendation } from '../hooks/useRecommendation';
import type {
  UserProfile,
  InvestmentRecommendationResult,
} from '../types/recommendation';
import {
  ExperienceLevel,
  KnowledgeLevel,
  CollectingStyle,
} from '../types/recommendation';

import { RecommendationRequestForm } from './RecommendationRequestForm';
import { RecommendationResult } from './RecommendationResult';
import { UserProfileForm } from './UserProfileForm';

export const RecommendationExample: React.FC = () => {
  const {
    currentRecommendation,
    recommendationStats,
    loading,
    getStats,
    clearRecommendation,
    resetState,
    formatCurrency,
    formatPercentage,
  } = useRecommendation();

  const [showProfileForm, setShowProfileForm] = useState(false);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  const _mockUserId = 'demo_user_1';

  useEffect(() => {
    getStats();
    // Settings模擬UserConfigure
    setUserProfile({
      age: 35,
      experience: ExperienceLevel.INTERMEDIATE,
      currentPortfolio: [],
      totalInvestment: 50000,
      monthlyIncome: 30000,
      investmentKnowledge: KnowledgeLevel.INTERMEDIATE,
      preferredGenres: ['Pokemon', 'Magic', 'Yu-Gi-Oh'],
      blacklistedCards: [],
      favoriteArtists: ['Ken Sugimori', 'Atsuko Nishida'],
      collectingStyle: CollectingStyle.INVESTOR,
    });
  }, [getStats]);

  const _handleSetupProfile = () => {
    setShowProfileForm(true);
    setShowRequestForm(false);
    setShowStats(false);
  };

  const _handleGenerateRecommendation = () => {
    if (!userProfile) {
      Alert.alert('提示', '請先設定用戶配置');
      handleSetupProfile();
      return;
    }
    setShowRequestForm(true);
    setShowProfileForm(false);
    setShowStats(false);
  };

  const _handleViewStats = () => {
    setShowStats(true);
    setShowProfileForm(false);
    setShowRequestForm(false);
  };

  const _handleProfileUpdate = (profile: UserProfile) => {
    setUserProfile(profile);
    setShowProfileForm(false);
    Alert.alert('Success', '用戶配置已更新，現在可以生成投資建議了');
  };

  const _handleRecommendationGenerated = (
    result: InvestmentRecommendationResult
  ) => {
    setShowRequestForm(false);
    Alert.alert('Success', `已生成 ${result.recommendations.length} 個投資建議`);
  };

  const _handleCancel = () => {
    setShowProfileForm(false);
    setShowRequestForm(false);
    setShowStats(false);
  };

  const _handleReset = () => {
    Alert.alert('重置確認', '確定要重置所有數據嗎？此操作不可撤銷。', [
      { text: '取消', style: 'cancel' },
      {
        text: '確定',
        style: 'destructive',
        onPress: () => {
          resetState();
          setUserProfile(null);
          setShowProfileForm(false);
          setShowRequestForm(false);
          setShowStats(false);
        },
      },
    ]);
  };

  const _formatNumber = (value: number) => {
    return new Intl.NumberFormat('zh-TW').format(value);
  };

  if (showProfileForm) {
    return (
      <View style={styles.container}>
        <UserProfileForm
          userId={mockUserId}
          initialProfile={userProfile || undefined}
          onProfileUpdate={handleProfileUpdate}
          onCancel={handleCancel}
        />
      </View>
    );
  }

  if (showRequestForm) {
    return (
      <View style={styles.container}>
        <RecommendationRequestForm
          userId={mockUserId}
          userProfile={userProfile || undefined}
          onRecommendationGenerated={handleRecommendationGenerated}
          onCancel={handleCancel}
        />
      </View>
    );
  }

  if (showStats) {
    return (
      <ScrollView style={styles.container}>
        <Text style={styles.title}>投資建議統計</Text>

        {recommendationStats ? (
          <View style={styles.statsContainer}>
            {/* 總體Statistics */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>總體統計</Text>

              <View style={styles.statRow}>
                <Text style={styles.statLabel}>總建議次數:</Text>
                <Text style={styles.statValue}>
                  {formatNumber(recommendationStats.totalRecommendations)}
                </Text>
              </View>

              <View style={styles.statRow}>
                <Text style={styles.statLabel}>成功率:</Text>
                <Text style={styles.statValue}>
                  {formatPercentage(recommendationStats.successRate)}
                </Text>
              </View>

              <View style={styles.statRow}>
                <Text style={styles.statLabel}>平均回報:</Text>
                <Text style={styles.statValue}>
                  {formatPercentage(recommendationStats.averageReturn)}
                </Text>
              </View>

              <View style={styles.statRow}>
                <Text style={styles.statLabel}>用戶滿意度:</Text>
                <Text style={styles.statValue}>
                  {formatPercentage(recommendationStats.userSatisfaction)}
                </Text>
              </View>

              <View style={styles.statRow}>
                <Text style={styles.statLabel}>轉化率:</Text>
                <Text style={styles.statValue}>
                  {formatPercentage(recommendationStats.conversionRate)}
                </Text>
              </View>

              <View style={styles.statRow}>
                <Text style={styles.statLabel}>組合改善:</Text>
                <Text style={styles.statValue}>
                  {formatPercentage(recommendationStats.portfolioImprovement)}
                </Text>
              </View>
            </View>

            {/* 最佳Table現 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>最佳表現卡牌</Text>

              <View style={styles.bestCard}>
                <Text style={styles.cardName}>
                  {recommendationStats.bestPerforming.cardName}
                </Text>
                <Text style={styles.cardSeries}>
                  {recommendationStats.bestPerforming.series}
                </Text>
                <View style={styles.cardStats}>
                  <Text style={styles.cardPrice}>
                    價格:{' '}
                    {formatCurrency(
                      recommendationStats.bestPerforming.currentPrice
                    )}
                  </Text>
                  <Text style={styles.cardReturn}>
                    回報:{' '}
                    {formatPercentage(
                      recommendationStats.bestPerforming.expectedReturn
                    )}
                  </Text>
                </View>
              </View>
            </View>

            {/* Operation按鈕 */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.button}
                onPress={() => setShowStats(false)}
              >
                <Text style={styles.buttonText}>返回</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size='large' color='#007AFF' />
            <Text style={styles.loadingText}>載入統計數據...</Text>
          </View>
        )}
      </ScrollView>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>投資建議系統</Text>

      <View style={styles.content}>
        <Text style={styles.description}>
          基於先進的機器學習算法和專業的風險評估模型，為您提供個性化的卡牌投資建議。
        </Text>

        {/* 功能特色 */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>功能特色</Text>

          <View style={styles.featureItem}>
            <Text style={styles.featureTitle}>🎯 個性化建議</Text>
            <Text style={styles.featureDescription}>
              根據您的投資經驗、風險承受度、財務狀況和偏好生成專屬建議
            </Text>
          </View>

          <View style={styles.featureItem}>
            <Text style={styles.featureTitle}>📊 全面風險評估</Text>
            <Text style={styles.featureDescription}>
              多維度風險分析，包括市場風險、流動性風險、集中度風險等
            </Text>
          </View>

          <View style={styles.featureItem}>
            <Text style={styles.featureTitle}>💼 投資組合優化</Text>
            <Text style={styles.featureDescription}>
              智能資產配置建議，優化投資組合多樣化和風險回報比
            </Text>
          </View>

          <View style={styles.featureItem}>
            <Text style={styles.featureTitle}>🔮 預期回報分析</Text>
            <Text style={styles.featureDescription}>
              提供樂觀、現實、悲觀三種情境下的回報預期和概率分布
            </Text>
          </View>

          <View style={styles.featureItem}>
            <Text style={styles.featureTitle}>📈 實時更新</Text>
            <Text style={styles.featureDescription}>
              根據市場變化和新數據持續更新建議，確保時效性
            </Text>
          </View>
        </View>

        {/* UserConfigureStatus */}
        <View style={styles.statusSection}>
          <Text style={styles.sectionTitle}>配置狀態</Text>

          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>用戶配置:</Text>
            <Text
              style={[
                styles.statusValue,
                { color: userProfile ? '#28a745' : '#dc3545' },
              ]}
            >
              {userProfile ? '已設定' : '未設定'}
            </Text>
          </View>

          {userProfile && (
            <>
              <View style={styles.statusItem}>
                <Text style={styles.statusLabel}>年齡:</Text>
                <Text style={styles.statusValue}>{userProfile.age} 歲</Text>
              </View>

              <View style={styles.statusItem}>
                <Text style={styles.statusLabel}>經驗水平:</Text>
                <Text style={styles.statusValue}>{userProfile.experience}</Text>
              </View>

              <View style={styles.statusItem}>
                <Text style={styles.statusLabel}>總投資:</Text>
                <Text style={styles.statusValue}>
                  {formatCurrency(userProfile.totalInvestment)}
                </Text>
              </View>

              <View style={styles.statusItem}>
                <Text style={styles.statusLabel}>收藏風格:</Text>
                <Text style={styles.statusValue}>
                  {userProfile.collectingStyle}
                </Text>
              </View>
            </>
          )}
        </View>

        {/* Statistics概覽 */}
        {recommendationStats && (
          <View style={styles.statsOverview}>
            <Text style={styles.sectionTitle}>統計概覽</Text>

            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>
                  {formatNumber(recommendationStats.totalRecommendations)}
                </Text>
                <Text style={styles.statLabel}>總建議次數</Text>
              </View>

              <View style={styles.statCard}>
                <Text style={styles.statNumber}>
                  {formatPercentage(recommendationStats.successRate)}
                </Text>
                <Text style={styles.statLabel}>成功率</Text>
              </View>

              <View style={styles.statCard}>
                <Text style={styles.statNumber}>
                  {formatPercentage(recommendationStats.averageReturn)}
                </Text>
                <Text style={styles.statLabel}>平均回報</Text>
              </View>

              <View style={styles.statCard}>
                <Text style={styles.statNumber}>
                  {formatPercentage(recommendationStats.userSatisfaction)}
                </Text>
                <Text style={styles.statLabel}>用戶滿意度</Text>
              </View>
            </View>
          </View>
        )}

        {/* Operation按鈕 */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={handleSetupProfile}
          >
            <Text style={styles.buttonText}>
              {userProfile ? '更新配置' : '設定配置'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.button,
              userProfile ? styles.primaryButton : styles.disabledButton,
            ]}
            onPress={handleGenerateRecommendation}
            disabled={!userProfile || loading}
          >
            {loading ? (
              <ActivityIndicator color='#fff' />
            ) : (
              <Text style={styles.buttonText}>生成建議</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={handleViewStats}
          >
            <Text style={styles.buttonText}>查看統計</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.dangerButton]}
            onPress={handleReset}
          >
            <Text style={styles.buttonText}>重置數據</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Show當前建議結果 */}
      {currentRecommendation &&
        !showProfileForm &&
        !showRequestForm &&
        !showStats && (
          <View style={styles.resultContainer}>
            <RecommendationResult
              recommendation={currentRecommendation}
              onNewRecommendation={handleGenerateRecommendation}
              onViewHistory={handleViewStats}
            />
          </View>
        )}
    </View>
  );
};

const _styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
    color: '#333',
  },
  content: {
    padding: 20,
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  featuresSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  featureItem: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  featureDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  statusSection: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statusItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  statusLabel: {
    fontSize: 16,
    color: '#555',
    flex: 1,
  },
  statusValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  statsOverview: {
    marginBottom: 30,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    width: '48%',
    marginBottom: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  buttonContainer: {
    marginBottom: 20,
  },
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  secondaryButton: {
    backgroundColor: '#34C759',
  },
  dangerButton: {
    backgroundColor: '#FF3B30',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  resultContainer: {
    flex: 1,
  },
  statsContainer: {
    padding: 20,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  statValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  bestCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#28a745',
  },
  cardName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  cardSeries: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  cardStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardPrice: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  cardReturn: {
    fontSize: 14,
    color: '#28a745',
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 50,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 15,
  },
});
