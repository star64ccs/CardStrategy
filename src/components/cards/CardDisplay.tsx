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
import { fetchCardDetails } from '../../store/slices/cardSlice';

interface CardDisplayProps {
  navigation: unknown;
}

const CardDisplay: React.FC<CardDisplayProps> = ({ navigation }) => {
  const _dispatch = useDispatch();
  const {
    selectedCard,
    isLoading: loading,
    error,
  } = useSelector((state: RootState) => state.card);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isMonitoring, setIsMonitoring] = useState(false);

  useEffect(() => {
    // 只在沒有選中卡片且沒有Error且不在Test環境時才AutoLoad
    if (!selectedCard && !error && !loading && !__DEV__) {
      dispatch(fetchCardDetails('card1') as any);
    }
  }, [dispatch, selectedCard, error, loading]);

  const _handleRetry = () => {
    dispatch(fetchCardDetails('card1') as any);
  };

  const _handleBack = () => {
    navigation.goBack();
  };

  const _handleEdit = () => {
    navigation.navigate('EditCard', { cardId: selectedCard?.id });
  };

  const _handleFavorite = () => {
    setIsFavorite(!isFavorite);
    Alert.alert('收藏', isFavorite ? '已從收藏移除' : '已添加到收藏');
  };

  const _handleShare = () => {
    Alert.alert('分享', '分享功能已觸發');
  };

  const _handleConditionAssessment = () => {
    Alert.alert('條件評估', '開始評估卡片條件');
  };

  const _handlePriceMonitoring = () => {
    setIsMonitoring(!isMonitoring);
    Alert.alert('價格監控', isMonitoring ? '已停止監控' : '已開始監控價格');
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator
          size='large'
          color='#007AFF'
          testID='loading-indicator'
        />
        <Text style={styles.loadingText}>載入卡片中...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>網絡連接失敗</Text>
        <Text style={styles.errorSubText}>檢查網絡連接</Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
          <Text style={styles.retryButtonText}>重試</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!selectedCard) {
    return (
      <View style={styles.container}>
        <Text style={styles.noCardText}>沒有選擇卡片</Text>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backButtonText}>返回</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      accessibilityRole={'main' as any}
      accessibilityLabel='卡片詳情頁面'
    >
      <View
        style={styles.header}
        accessibilityRole='header'
        accessibilityLabel='頁面標題區域'
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          testID='back-button'
          accessibilityRole='button'
          accessibilityLabel='返回上一頁'
          accessibilityHint='雙擊返回上一頁'
        >
          <Text style={styles.backButtonText}>返回</Text>
        </TouchableOpacity>
        <Text
          style={styles.title}
          accessibilityRole='header'
          accessibilityLabel='卡片詳情'
        >
          卡片詳情
        </Text>
        <TouchableOpacity
          style={styles.editButton}
          onPress={handleEdit}
          accessibilityRole='button'
          accessibilityLabel='編輯卡片'
          accessibilityHint='雙擊編輯卡片信息'
        >
          <Text style={styles.editButtonText}>編輯</Text>
        </TouchableOpacity>
      </View>

      <View
        style={styles.cardContainer}
        accessibilityRole={'article' as any}
        accessibilityLabel={`${selectedCard.name}卡片信息`}
      >
        <Image
          source={{ uri: selectedCard.images.front }}
          style={styles.cardImage}
          resizeMode='cover'
          testID='card-image'
          accessibilityLabel={`${selectedCard.name}卡片圖片`}
          accessibilityRole='image'
          accessibilityHint='卡片正面圖片'
        />

        <View
          style={styles.cardInfo}
          accessibilityRole='summary'
          accessibilityLabel='卡片詳細信息'
        >
          <Text
            style={styles.cardName}
            accessibilityRole='header'
            accessibilityLabel={`卡片名稱：${selectedCard.name}`}
          >
            {selectedCard.name}
          </Text>
          <Text
            style={styles.cardRarity}
            accessibilityLabel={`稀有度：${selectedCard.rarity}`}
          >
            稀有度：{selectedCard.rarity}
          </Text>
          <Text
            style={styles.cardPrice}
            accessibilityLabel={`價格：${selectedCard.price?.toLocaleString()}美元`}
          >
            價格：${selectedCard.price?.toLocaleString()}
          </Text>
          <Text
            style={styles.cardCondition}
            accessibilityLabel={`狀態：${selectedCard.condition}`}
          >
            狀態：{selectedCard.condition}
          </Text>
          <Text
            style={styles.cardDescription}
            accessibilityLabel={`描述：${selectedCard.description}`}
          >
            {selectedCard.description}
          </Text>
          <Text
            style={styles.cardSet}
            accessibilityLabel={`系列：${selectedCard.set}`}
          >
            系列：{selectedCard.set}
          </Text>
          <Text
            style={styles.cardNumber}
            accessibilityLabel={`編號：${selectedCard.cardNumber}`}
          >
            編號：{selectedCard.cardNumber}
          </Text>
          <Text
            style={styles.cardArtist}
            accessibilityLabel={`畫家：${selectedCard.attributes.artist}`}
          >
            畫家：{selectedCard.attributes.artist}
          </Text>
        </View>

        {/* 價格變化趨勢 */}
        <View
          style={styles.priceTrend}
          accessibilityRole='summary'
          accessibilityLabel='價格變化趨勢'
        >
          <Text
            style={styles.priceChange}
            accessibilityLabel='價格上漲百分之二十五'
          >
            +25%
          </Text>
          <Text
            style={styles.priceChangeAmount}
            accessibilityLabel='價格變化金額二百美元'
          >
            $200
          </Text>
        </View>

        {/* 功能按鈕District域 */}
        <View
          style={styles.actionButtons}
          accessibilityRole='toolbar'
          accessibilityLabel='卡片操作按鈕'
        >
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleConditionAssessment}
            testID='assess-button'
            accessibilityRole='button'
            accessibilityLabel='評估卡片條件'
            accessibilityHint='雙擊開始評估卡片物理條件'
          >
            <Text style={styles.actionButtonText}>評估條件</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, isFavorite && styles.favoriteActive]}
            onPress={handleFavorite}
            testID='favorite-button'
            accessibilityRole='button'
            accessibilityLabel={isFavorite ? '從收藏移除' : '添加到收藏'}
            accessibilityHint='雙擊切換收藏狀態'
          >
            <Text style={styles.actionButtonText}>
              {isFavorite ? '取消收藏' : '收藏'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleShare}
            testID='share-button'
            accessibilityRole='button'
            accessibilityLabel='分享卡片'
            accessibilityHint='雙擊分享卡片信息'
          >
            <Text style={styles.actionButtonText}>分享</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, isMonitoring && styles.monitorActive]}
            onPress={handlePriceMonitoring}
            testID='monitor-button'
            accessibilityRole='button'
            accessibilityLabel={isMonitoring ? '停止價格監控' : '開始價格監控'}
            accessibilityHint='雙擊切換價格監控狀態'
          >
            <Text style={styles.actionButtonText}>
              {isMonitoring ? '停止監控' : '監控價格'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const _styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: '#007AFF',
    fontSize: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 16,
    flex: 1,
  },
  editButton: {
    padding: 8,
  },
  editButtonText: {
    color: '#007AFF',
    fontSize: 16,
  },
  cardContainer: {
    padding: 16,
  },
  cardImage: {
    width: '100%',
    height: 300,
    borderRadius: 8,
    marginBottom: 16,
  },
  cardInfo: {
    gap: 8,
    marginBottom: 16,
  },
  cardName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  cardRarity: {
    fontSize: 16,
    color: '#666',
  },
  cardPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  cardCondition: {
    fontSize: 16,
    color: '#666',
  },
  cardDescription: {
    fontSize: 16,
    lineHeight: 24,
    marginTop: 8,
  },
  cardSet: {
    fontSize: 16,
    color: '#666',
  },
  cardNumber: {
    fontSize: 16,
    color: '#666',
  },
  cardArtist: {
    fontSize: 16,
    color: '#666',
  },
  cardReleaseDate: {
    fontSize: 16,
    color: '#666',
  },
  priceTrend: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f0f8ff',
    borderRadius: 8,
  },
  priceChange: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginRight: 8,
  },
  priceChangeAmount: {
    fontSize: 16,
    color: '#666',
  },
  actionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  favoriteActive: {
    backgroundColor: '#FF6B6B',
  },
  monitorActive: {
    backgroundColor: '#4CAF50',
  },
  loadingText: {
    marginTop: 16,
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#ff3b30',
    marginBottom: 8,
  },
  errorSubText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignSelf: 'center',
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  noCardText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
});

export default CardDisplay;
