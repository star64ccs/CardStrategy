import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import type { RootState } from '../../store';
import { _fetchCardDetails as fetchCardDetails } from '../../store/slices/cardSlice';

interface CardDisplayProps {
  navigation: unknown;
}

const CardDisplay: React.FC<CardDisplayProps> = ({ navigation }) => {
  const dispatch = useDispatch();
  const {
    selectedCard,
    isLoading: loading,
    error,
  } = useSelector((state: RootState) => state.card);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isMonitoring, setIsMonitoring] = useState(false);

  useEffect(() => {
    // 只在沒有選中卡片且沒有錯誤且不在測試環境時才自動載入
    if (!selectedCard && !error && !loading && !__DEV__) {
      dispatch(fetchCardDetails('card1') as any);
    }
  }, [dispatch, selectedCard, error, loading]);

  const handleRetry = () => {
    dispatch(fetchCardDetails('card1') as any);
  };

  const handleBack = () => {
    if (
      navigation &&
      typeof navigation === 'object' &&
      'goBack' in navigation
    ) {
      (navigation as any).goBack();
    }
  };

  const handleEdit = () => {
    if (
      navigation &&
      typeof navigation === 'object' &&
      'navigate' in navigation
    ) {
      (navigation as any).navigate('EditCard', { cardId: selectedCard?.id });
    }
  };

  const handleFavorite = () => {
    setIsFavorite(!isFavorite);
    Alert.alert(
      isFavorite ? '已移除收藏' : '已加入收藏',
      isFavorite ? '卡片已從收藏中移除' : '卡片已加入收藏列表'
    );
  };

  const handleMonitoring = () => {
    setIsMonitoring(!isMonitoring);
    Alert.alert(
      isMonitoring ? '已停止監控' : '已開始監控',
      isMonitoring ? '價格監控已停止' : '價格監控已開始，將在價格變動時通知您'
    );
  };

  const handleShare = () => {
    Alert.alert('分享功能', '分享功能開發中...');
  };

  const handleReport = () => {
    Alert.alert('舉報功能', '舉報功能開發中...');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size='large' color='#007AFF' />
        <Text style={styles.loadingText}>載入中...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>載入失敗: {error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
          <Text style={styles.retryButtonText}>重試</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!selectedCard) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>沒有選中的卡片</Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
          <Text style={styles.retryButtonText}>載入卡片</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* 頭部操作欄 */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={handleBack}>
          <Text style={styles.headerButtonText}>← 返回</Text>
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton} onPress={handleShare}>
            <Text style={styles.headerButtonText}>分享</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton} onPress={handleEdit}>
            <Text style={styles.headerButtonText}>編輯</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 卡片圖片 */}
      <View style={styles.imageContainer}>
        {selectedCard.imageUrl ? (
          <Image
            source={{ uri: selectedCard.imageUrl }}
            style={styles.cardImage}
            resizeMode='contain'
          />
        ) : (
          <View style={styles.placeholderImage}>
            <Text style={styles.placeholderText}>無圖片</Text>
          </View>
        )}
      </View>

      {/* 卡片資訊 */}
      <View style={styles.infoContainer}>
        <Text style={styles.cardName}>{selectedCard.name}</Text>
        <Text style={styles.cardSet}>{selectedCard.setName}</Text>
        <Text style={styles.cardNumber}>#{selectedCard.cardNumber}</Text>
        <Text style={styles.cardRarity}>稀有度: {selectedCard.rarity}</Text>
        <Text style={styles.cardType}>類型: {selectedCard.type}</Text>
      </View>

      {/* 價格資訊 */}
      <View style={styles.priceContainer}>
        <Text style={styles.priceLabel}>當前價格</Text>
        <Text style={styles.currentPrice}>
          ${selectedCard.currentPrice || selectedCard.price || 0}
        </Text>
        {selectedCard.priceChange !== undefined && (
          <Text
            style={[
              styles.priceChange,
              {
                color: selectedCard.priceChange >= 0 ? '#34C759' : '#FF3B30',
              },
            ]}
          >
            {selectedCard.priceChange >= 0 ? '+' : ''}
            {selectedCard.priceChange.toFixed(2)}%
          </Text>
        )}
      </View>

      {/* 操作按鈕 */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.actionButton, isFavorite && styles.actionButtonActive]}
          onPress={handleFavorite}
        >
          <Text
            style={[
              styles.actionButtonText,
              isFavorite && styles.actionButtonTextActive,
            ]}
          >
            {isFavorite ? '❤️ 已收藏' : '🤍 收藏'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.actionButton,
            isMonitoring && styles.actionButtonActive,
          ]}
          onPress={handleMonitoring}
        >
          <Text
            style={[
              styles.actionButtonText,
              isMonitoring && styles.actionButtonTextActive,
            ]}
          >
            {isMonitoring ? '🔔 監控中' : '🔕 開始監控'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* 詳細資訊 */}
      <View style={styles.detailsContainer}>
        <Text style={styles.detailsTitle}>詳細資訊</Text>
        {selectedCard.description && (
          <Text style={styles.detailsText}>{selectedCard.description}</Text>
        )}
        <View style={styles.detailsRow}>
          <Text style={styles.detailsLabel}>條件:</Text>
          <Text style={styles.detailsValue}>
            {selectedCard.condition || '未知'}
          </Text>
        </View>
        <View style={styles.detailsRow}>
          <Text style={styles.detailsLabel}>創建時間:</Text>
          <Text style={styles.detailsValue}>
            {selectedCard.createdAt
              ? new Date(selectedCard.createdAt).toLocaleDateString()
              : '未知'}
          </Text>
        </View>
        <View style={styles.detailsRow}>
          <Text style={styles.detailsLabel}>更新時間:</Text>
          <Text style={styles.detailsValue}>
            {selectedCard.updatedAt
              ? new Date(selectedCard.updatedAt).toLocaleDateString()
              : '未知'}
          </Text>
        </View>
      </View>

      {/* 舉報按鈕 */}
      <TouchableOpacity style={styles.reportButton} onPress={handleReport}>
        <Text style={styles.reportButtonText}>舉報問題</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
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
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e8ed',
  },
  headerButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  headerButtonText: {
    fontSize: 16,
    color: '#007AFF',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 16,
  },
  imageContainer: {
    backgroundColor: '#fff',
    padding: 20,
    alignItems: 'center',
  },
  cardImage: {
    width: 200,
    height: 280,
    borderRadius: 8,
  },
  placeholderImage: {
    width: 200,
    height: 280,
    backgroundColor: '#e1e8ed',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 16,
    color: '#666',
  },
  infoContainer: {
    backgroundColor: '#fff',
    padding: 20,
    marginTop: 8,
  },
  cardName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  cardSet: {
    fontSize: 18,
    color: '#666',
    marginBottom: 4,
  },
  cardNumber: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  cardRarity: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  cardType: {
    fontSize: 16,
    color: '#666',
  },
  priceContainer: {
    backgroundColor: '#fff',
    padding: 20,
    marginTop: 8,
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  currentPrice: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  priceChange: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  actionsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 20,
    marginTop: 8,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#007AFF',
    alignItems: 'center',
  },
  actionButtonActive: {
    backgroundColor: '#007AFF',
  },
  actionButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: 'bold',
  },
  actionButtonTextActive: {
    color: '#fff',
  },
  detailsContainer: {
    backgroundColor: '#fff',
    padding: 20,
    marginTop: 8,
  },
  detailsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  detailsText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 16,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailsLabel: {
    fontSize: 16,
    color: '#666',
    fontWeight: 'bold',
  },
  detailsValue: {
    fontSize: 16,
    color: '#1a1a1a',
  },
  reportButton: {
    backgroundColor: '#FF3B30',
    margin: 20,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  reportButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CardDisplay;
