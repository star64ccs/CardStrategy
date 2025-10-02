import { MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';

import { logger } from '../../../core/utils/logger';
import { useCardRecognition } from '../hooks/useCardRecognition';
import type { CardGame } from '../types/recognition';
import {
  CardRecognitionResult,
  RecognitionHistory,
  RecognitionStats,
} from '../types/recognition';

export const CardRecognitionExample: React.FC = () => {
  const {
    isRecognizing,
    currentResult,
    recognitionError,
    history,
    isLoadingHistory,
    stats,
    isStatsLoading,
    config,
    recognize,
    loadHistory,
    loadStats,
    clearRecognitionError,
    getSupportedGames,
    formatProcessingTime,
    getConfidenceLevel,
  } = useCardRecognition({
    autoInitialize: true,
    autoLoadHistory: true,
    autoLoadStats: true,
    onRecognitionComplete: result => {
      Alert.alert('識別Success', `識別到卡牌: ${result.card.name}`);
    },
    onRecognitionError: error => {
      Alert.alert('識別Error', error);
    },
  });

  const [showHistory, setShowHistory] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [selectedGame, setSelectedGame] = useState<CardGame>('pokemon');

  // 模擬識別Test
  const _handleTestRecognition = async () => {
    try {
      // Create一個模擬的 Base64 Graph像Data（實際使用中應該YesTrue實的Graph像）
      const _mockImageData =
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='; // 1x1 透明像素

      await recognize({
        imageData: mockImageData,
        imageFormat: 'png',
        game: selectedGame,
        language: 'zh-TW',
        region: 'TW',
        options: {
          enableMultipleCards: false,
          enableTextExtraction: true,
          enableFeatureDetection: true,
          confidenceThreshold: 0.7,
          maxResults: 5,
          timeout: 30000,
          useCache: true,
        },
      });
    } catch (error: unknown) {
      logger.error('測試識別Failed:', error);
    }
  };

  // 渲染當前結果
  const _renderCurrentResult = () => {
    if (isRecognizing) {
      return (
        <View style={styles.resultContainer}>
          <ActivityIndicator size='large' color='#007AFF' />
          <Text style={styles.resultText}>識別中...</Text>
        </View>
      );
    }

    if (recognitionError) {
      return (
        <View style={styles.resultContainer}>
          <MaterialIcons name='error' size={48} color='#FF3B30' />
          <Text style={styles.errorText}>{recognitionError}</Text>
          <TouchableOpacity
            style={styles.clearButton}
            onPress={clearRecognitionError}
          >
            <Text style={styles.clearButtonText}>清除錯誤</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (currentResult) {
      return (
        <View style={styles.resultContainer}>
          <View style={styles.cardResultHeader}>
            <MaterialIcons name='check-circle' size={24} color='#34C759' />
            <Text style={styles.resultTitle}>識別成功</Text>
          </View>

          <View style={styles.cardInfo}>
            <View style={styles.cardDetails}>
              <Text style={styles.cardName}>{currentResult.card.name}</Text>
              <Text style={styles.cardSet}>{currentResult.set.name}</Text>
              <Text style={styles.cardNumber}>
                #{currentResult.card.cardNumber}
              </Text>

              <View style={styles.metricRow}>
                <Text style={styles.metricLabel}>信心度：</Text>
                <View
                  style={[
                    styles.confidenceBadge,
                    getConfidenceStyle(
                      getConfidenceLevel(currentResult.confidence)
                    ),
                  ]}
                >
                  <Text style={styles.confidenceText}>
                    {(currentResult.confidence * 100).toFixed(1)}%
                  </Text>
                </View>
              </View>

              <View style={styles.metricRow}>
                <Text style={styles.metricLabel}>處理時間：</Text>
                <Text style={styles.metricValue}>
                  {formatProcessingTime(currentResult.processingTime)}
                </Text>
              </View>

              <View style={styles.metricRow}>
                <Text style={styles.metricLabel}>遊戲：</Text>
                <Text style={styles.metricValue}>
                  {getGameDisplayName(currentResult.game)}
                </Text>
              </View>
            </View>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.resultContainer}>
        <MaterialIcons name='search' size={48} color='#999' />
        <Text style={styles.placeholderText}>尚未進行識別</Text>
      </View>
    );
  };

  // 渲染遊戲Select器
  const _renderGameSelector = () => {
    const _supportedGames = getSupportedGames();

    return (
      <View style={styles.gameSelectorContainer}>
        <Text style={styles.sectionTitle}>選擇遊戲類型</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.gameButtons}>
            {supportedGames.map(game => (
              <TouchableOpacity
                key={game}
                style={[
                  styles.gameButton,
                  selectedGame === game && styles.gameButtonSelected,
                ]}
                onPress={() => setSelectedGame(game)}
              >
                <Text
                  style={[
                    styles.gameButtonText,
                    selectedGame === game && styles.gameButtonTextSelected,
                  ]}
                >
                  {getGameDisplayName(game)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
    );
  };

  // 渲染歷史Record
  const _renderHistory = () => {
    if (!showHistory) return null;

    return (
      <View style={styles.historyContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>識別歷史</Text>
          {isLoadingHistory ? (
            <ActivityIndicator size='small' color='#007AFF' />
          ) : (
            <TouchableOpacity onPress={() => loadHistory('current_user', 10)}>
              <MaterialIcons name='refresh' size={20} color='#007AFF' />
            </TouchableOpacity>
          )}
        </View>

        <ScrollView style={styles.historyList}>
          {history.length > 0 ? (
            history.slice(0, 5).map((item, index) => (
              <View key={item.id || index} style={styles.historyItem}>
                <View style={styles.historyInfo}>
                  <Text style={styles.historyCardName}>
                    {item.recognizedCard?.name || '未知卡牌'}
                  </Text>
                  <Text style={styles.historyDate}>
                    {new Date(item.createdAt).toLocaleDateString('zh-TW')}
                  </Text>
                </View>
                <View style={styles.historyMetrics}>
                  <Text style={styles.historyConfidence}>
                    {item.confidence
                      ? `${(item.confidence * 100).toFixed(0)}%`
                      : 'N/A'}
                  </Text>
                  <Text style={styles.historyTime}>
                    {formatProcessingTime(item.processingTime)}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>暫無歷史記錄</Text>
          )}
        </ScrollView>
      </View>
    );
  };

  // 渲染StatisticsInformation
  const _renderStats = () => {
    if (!showStats || !stats) return null;

    return (
      <View style={styles.statsContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>識別統計</Text>
          {isStatsLoading ? (
            <ActivityIndicator size='small' color='#007AFF' />
          ) : (
            <TouchableOpacity onPress={loadStats}>
              <MaterialIcons name='refresh' size={20} color='#007AFF' />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.totalRecognitions}</Text>
            <Text style={styles.statLabel}>總識別次數</Text>
          </View>

          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {(stats.successRate * 100).toFixed(1)}%
            </Text>
            <Text style={styles.statLabel}>成功率</Text>
          </View>

          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {(stats.averageConfidence * 100).toFixed(1)}%
            </Text>
            <Text style={styles.statLabel}>平均信心度</Text>
          </View>

          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {formatProcessingTime(stats.averageProcessingTime)}
            </Text>
            <Text style={styles.statLabel}>平均處理時間</Text>
          </View>
        </View>

        {stats.popularGames.length > 0 && (
          <View style={styles.popularGames}>
            <Text style={styles.subTitle}>熱門遊戲</Text>
            {stats.popularGames.slice(0, 3).map((game, index) => (
              <View key={game.game} style={styles.gameStatItem}>
                <Text style={styles.gameStatName}>
                  {getGameDisplayName(game.game)}
                </Text>
                <Text style={styles.gameStatCount}>{game.count} 次</Text>
                <Text style={styles.gameStatRate}>
                  {(game.successRate * 100).toFixed(1)}%
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  // Get遊戲Show名稱
  const _getGameDisplayName = (game: CardGame): string => {
    const gameNames: Record<CardGame, string> = {
      pokemon: '寶可夢',
      yugioh: '遊戲王',
      magic: '魔法風雲會',
      digimon: '數碼寶貝',
      onepiece: '海賊王',
      dragonball: '七龍珠',
      flesh_and_blood: 'Flesh and Blood',
      lorcana: 'Lorcana',
      weiss_schwarz: 'Weiss Schwarz',
      cardfight_vanguard: 'Cardfight! Vanguard',
      force_of_will: 'Force of Will',
      other: '其他',
    };
    return gameNames[game] || game;
  };

  // Get信心度樣式
  const _getConfidenceStyle = (
    level: 'low' | 'medium' | 'high' | 'very_high'
  ) => {
    switch (level) {
      case 'very_high':
        return styles.confidenceVeryHigh;
      case 'high':
        return styles.confidenceHigh;
      case 'medium':
        return styles.confidenceMedium;
      case 'low':
        return styles.confidenceLow;
      default:
        return styles.confidenceLow;
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>卡牌識別系統</Text>
        <Text style={styles.subtitle}>智能識別卡牌種類、系列、版本</Text>
      </View>

      {/* 遊戲Select器 */}
      {renderGameSelector()}

      {/* Operation按鈕 */}
      <View style={styles.actionContainer}>
        <TouchableOpacity
          style={[
            styles.testButton,
            isRecognizing && styles.testButtonDisabled,
          ]}
          onPress={handleTestRecognition}
          disabled={isRecognizing}
        >
          <MaterialIcons
            name='search'
            size={20}
            color={isRecognizing ? '#999' : 'white'}
          />
          <Text
            style={[
              styles.testButtonText,
              isRecognizing && styles.testButtonTextDisabled,
            ]}
          >
            {isRecognizing ? '識別中...' : '測試識別'}
          </Text>
        </TouchableOpacity>

        <View style={styles.toggleButtons}>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              showHistory && styles.toggleButtonActive,
            ]}
            onPress={() => setShowHistory(!showHistory)}
          >
            <MaterialIcons
              name='history'
              size={16}
              color={showHistory ? 'white' : '#007AFF'}
            />
            <Text
              style={[
                styles.toggleButtonText,
                showHistory && styles.toggleButtonTextActive,
              ]}
            >
              歷史記錄
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.toggleButton,
              showStats && styles.toggleButtonActive,
            ]}
            onPress={() => setShowStats(!showStats)}
          >
            <MaterialIcons
              name='bar-chart'
              size={16}
              color={showStats ? 'white' : '#007AFF'}
            />
            <Text
              style={[
                styles.toggleButtonText,
                showStats && styles.toggleButtonTextActive,
              ]}
            >
              統計信息
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 識別結果 */}
      {renderCurrentResult()}

      {/* 歷史Record */}
      {renderHistory()}

      {/* StatisticsInformation */}
      {renderStats()}

      {/* ConfigureInformation */}
      <View style={styles.configContainer}>
        <Text style={styles.sectionTitle}>配置信息</Text>
        <View style={styles.configInfo}>
          <Text style={styles.configItem}>
            支持的遊戲: {config.enabledGames.length} 種
          </Text>
          <Text style={styles.configItem}>
            信心閾值:{' '}
            {(config.defaultOptions.confidenceThreshold * 100).toFixed(0)}%
          </Text>
          <Text style={styles.configItem}>
            最大結果數: {config.defaultOptions.maxResults}
          </Text>
          <Text style={styles.configItem}>
            超時時間: {config.defaultOptions.timeout / 1000} 秒
          </Text>
          <Text style={styles.configItem}>
            緩存啟用: {config.cacheSettings.enabled ? '是' : '否'}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const _styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },

  // 遊戲Select器
  gameSelectorContainer: {
    padding: 16,
    backgroundColor: 'white',
    marginTop: 8,
  },
  gameButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  gameButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  gameButtonSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  gameButtonText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  gameButtonTextSelected: {
    color: 'white',
  },

  // OperationDistrict域
  actionContainer: {
    padding: 16,
    backgroundColor: 'white',
    marginTop: 8,
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  testButtonDisabled: {
    backgroundColor: '#f0f0f0',
  },
  testButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
  testButtonTextDisabled: {
    color: '#999',
  },
  toggleButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: '#f0f8ff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#007AFF',
    gap: 6,
  },
  toggleButtonActive: {
    backgroundColor: '#007AFF',
  },
  toggleButtonText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  toggleButtonTextActive: {
    color: 'white',
  },

  // 結果District域
  resultContainer: {
    padding: 20,
    backgroundColor: 'white',
    margin: 16,
    marginBottom: 8,
    borderRadius: 12,
    alignItems: 'center',
  },
  resultText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
  },
  errorText: {
    fontSize: 14,
    color: '#FF3B30',
    textAlign: 'center',
    marginVertical: 12,
  },
  clearButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FF3B30',
    borderRadius: 6,
  },
  clearButtonText: {
    fontSize: 14,
    color: 'white',
    fontWeight: '500',
  },
  placeholderText: {
    fontSize: 16,
    color: '#999',
    marginTop: 12,
  },
  cardResultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#34C759',
  },
  cardInfo: {
    width: '100%',
  },
  cardDetails: {
    gap: 8,
  },
  cardName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  cardSet: {
    fontSize: 14,
    color: '#666',
  },
  cardNumber: {
    fontSize: 14,
    color: '#999',
  },
  metricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metricLabel: {
    fontSize: 14,
    color: '#666',
    minWidth: 80,
  },
  metricValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  confidenceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  confidenceVeryHigh: {
    backgroundColor: '#e3f2fd',
  },
  confidenceHigh: {
    backgroundColor: '#e8f5e8',
  },
  confidenceMedium: {
    backgroundColor: '#fff3e0',
  },
  confidenceLow: {
    backgroundColor: '#ffebee',
  },
  confidenceText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },

  // GenericPartial
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  subTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  // 歷史Record
  historyContainer: {
    padding: 16,
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
  },
  historyList: {
    maxHeight: 200,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  historyInfo: {
    flex: 1,
  },
  historyCardName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  historyDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  historyMetrics: {
    alignItems: 'flex-end',
  },
  historyConfidence: {
    fontSize: 12,
    fontWeight: '600',
    color: '#007AFF',
  },
  historyTime: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingVertical: 20,
  },

  // StatisticsInformation
  statsContainer: {
    padding: 16,
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
    minWidth: '45%',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  popularGames: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 16,
  },
  gameStatItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  gameStatName: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  gameStatCount: {
    fontSize: 14,
    color: '#666',
    marginRight: 16,
  },
  gameStatRate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#34C759',
  },

  // ConfigureInformation
  configContainer: {
    padding: 16,
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
  },
  configInfo: {
    gap: 8,
  },
  configItem: {
    fontSize: 14,
    color: '#666',
    paddingVertical: 4,
  },
});

export default CardRecognitionExample;
