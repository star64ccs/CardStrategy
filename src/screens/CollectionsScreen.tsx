import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { useAppDispatch, RootState } from '@/store';
import { useTheme } from '@/config/ThemeProvider';
import { Button } from '@/components/common/Button';
import { Loading } from '@/components/common/Loading';
import { CardList } from '@/components/cards/CardList';
import { fetchCollections } from '@/store/slices/collectionSlice';
import { Collection, Card } from '@/types';
import { logger } from '@/utils/logger';

export const CollectionsScreen: React.FC = () => {
  const { theme } = useTheme();
  const dispatch = useAppDispatch();
  const { collections, isLoading, error, statistics } = useSelector(
    (state: RootState) => state.collection
  );
  const [selectedCollection, setSelectedCollection] =
    useState<Collection | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // 加載收藏數據
  useEffect(() => {
    dispatch(fetchCollections());
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
    await dispatch(fetchCollections());
    setRefreshing(false);
  }, [dispatch]);

  // 處理收藏點擊
  const handleCollectionPress = useCallback((collection: Collection) => {
    setSelectedCollection(collection);
  }, []);

  // 處理卡片點擊
  const handleCardPress = useCallback((card: Card) => {
    logger.info('Card pressed:', { cardId: card.id });
  }, []);

  // 創建新收藏
  const handleCreateCollection = useCallback(() => {
    Alert.alert('創建收藏', '此功能即將推出');
  }, []);

  const renderCollectionStats = () => (
    <View
      style={[
        styles.statsContainer,
        { backgroundColor: theme.colors.backgroundPaper },
      ]}
    >
      <View style={styles.statItem}>
        <Text style={[styles.statValue, { color: theme.colors.primary }]}>
          {statistics.totalCards}
        </Text>
        <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
          總卡片數
        </Text>
      </View>
      <View style={styles.statItem}>
        <Text style={[styles.statValue, { color: theme.colors.secondary }]}>
          ${statistics.totalValue?.toFixed(2) || '0.00'}
        </Text>
        <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
          總價值
        </Text>
      </View>
      <View style={styles.statItem}>
        <Text style={[styles.statValue, { color: theme.colors.accent }]}>
          {collections.length}
        </Text>
        <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
          收藏夾
        </Text>
      </View>
    </View>
  );

  const renderCollectionsList = () => (
    <ScrollView
      style={styles.collectionsList}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      {collections.map((collection) => (
        <TouchableOpacity
          key={collection.id}
          style={[
            styles.collectionItem,
            { backgroundColor: theme.colors.backgroundPaper },
          ]}
          onPress={() => handleCollectionPress(collection)}
        >
          <View style={styles.collectionHeader}>
            <Text
              style={[
                styles.collectionName,
                { color: theme.colors.textPrimary },
              ]}
            >
              {collection.name}
            </Text>
            <Text
              style={[
                styles.collectionCount,
                { color: theme.colors.textSecondary },
              ]}
            >
              {collection.items?.length || 0} 張卡片
            </Text>
          </View>
          {collection.description && (
            <Text
              style={[
                styles.collectionDescription,
                { color: theme.colors.textSecondary },
              ]}
            >
              {collection.description}
            </Text>
          )}
          <View style={styles.collectionStats}>
            <Text
              style={[
                styles.collectionValue,
                { color: theme.colors.secondary },
              ]}
            >
              價值: ${collection.statistics?.totalValue?.toFixed(2) || '0.00'}
            </Text>
            <Text
              style={[
                styles.collectionCondition,
                { color: theme.colors.textSecondary },
              ]}
            >
              平均狀況:{' '}
              {collection.statistics?.averageCondition?.toFixed(1) || 'N/A'}
            </Text>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderSelectedCollection = () => {
    if (!selectedCollection) return null;

    return (
      <View style={styles.selectedCollection}>
        <View style={styles.selectedCollectionHeader}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setSelectedCollection(null)}
          >
            <Text
              style={[styles.backButtonText, { color: theme.colors.primary }]}
            >
              ← 返回
            </Text>
          </TouchableOpacity>
          <Text
            style={[
              styles.selectedCollectionTitle,
              { color: theme.colors.textPrimary },
            ]}
          >
            {selectedCollection.name}
          </Text>
        </View>
        <CardList
          cards={
            selectedCollection.items?.map((item) => ({
              id: item.cardId,
              name: `Card ${item.cardId}`,
              setName: 'Unknown Set',
              cardNumber: '001',
              rarity: 'common' as const,
              type: 'creature' as const,
              attributes: {},
              marketData: {
                currentPrice: item.currentValue,
                priceHistory: [],
                marketTrend: 'stable',
                volatility: 0,
                demand: 'medium',
                supply: 'medium',
                lastUpdated: new Date(),
              },
              images: {
                front: 'https://via.placeholder.com/300x420',
                thumbnail: 'https://via.placeholder.com/300x420',
              },
              metadata: {
                game: 'Unknown',
                set: 'Unknown Set',
                language: 'zh-TW',
                condition: item.condition,
                isFoil: false,
                isSigned: false,
                isGraded: false,
              },
              currentPrice: item.currentValue,
              condition: item.condition,
              imageUrl: 'https://via.placeholder.com/300x420',
              set: 'Unknown Set',
              createdAt: new Date(),
              updatedAt: new Date(),
            })) || []
          }
          onCardPress={handleCardPress}
          showPrice={true}
          showCondition={true}
          size="medium"
          variant="default"
          numColumns={2}
        />
      </View>
    );
  };

  if (isLoading && collections.length === 0) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <Loading />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      {selectedCollection ? (
        renderSelectedCollection()
      ) : (
        <>
          <View
            style={[
              styles.header,
              { backgroundColor: theme.colors.backgroundPaper },
            ]}
          >
            <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
              我的收藏
            </Text>
            <Button
              title="新建收藏"
              onPress={handleCreateCollection}
              variant="primary"
              size="small"
            />
          </View>
          {renderCollectionStats()}
          {renderCollectionsList()}
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    margin: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
  },
  collectionsList: {
    flex: 1,
    padding: 8,
  },
  collectionItem: {
    margin: 8,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  collectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  collectionName: {
    fontSize: 18,
    fontWeight: '600',
  },
  collectionCount: {
    fontSize: 14,
  },
  collectionDescription: {
    fontSize: 14,
    marginBottom: 8,
  },
  collectionStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  collectionValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  collectionCondition: {
    fontSize: 14,
  },
  selectedCollection: {
    flex: 1,
  },
  selectedCollectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    marginRight: 16,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  selectedCollectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});
