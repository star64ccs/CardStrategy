import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useDispatch } from 'react-redux';

import {
  deleteScanRecord,
  toggleFavorite,
} from '../store/slices/scanHistorySlice';

export interface ScanRecord {
  id: string;
  cardName: string;
  cardType: string;
  scanDate: string;
  isFavorite: boolean;
  confidence: number;
  processingTime: number;
}

interface ScanHistoryListProps {
  scanHistory: ScanRecord[];
  onRecordPress?: (record: ScanRecord) => void;
  onRefresh?: () => void;
}

const ScanHistoryList: React.FC<ScanHistoryListProps> = ({
  scanHistory,
  onRecordPress,
  onRefresh,
}) => {
  const _dispatch = useDispatch();
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [loading, setLoading] = useState(false);

  const _handleRecordPress = useCallback(
    (record: ScanRecord) => {
      if (isSelectionMode) {
        toggleItemSelection(record.id);
      } else {
        onRecordPress?.(record);
      }
    },
    [isSelectionMode, onRecordPress]
  );

  const _handleLongPress = useCallback(
    (record: ScanRecord) => {
      if (!isSelectionMode) {
        setIsSelectionMode(true);
        setSelectedItems([record.id]);
      }
    },
    [isSelectionMode]
  );

  const _toggleItemSelection = useCallback((itemId: string) => {
    setSelectedItems(prev => {
      if (prev.includes(itemId)) {
        const _newSelection = prev.filter(id => id !== itemId);
        if (newSelection.length === 0) {
          setIsSelectionMode(false);
        }
        return newSelection;
      } else {
        return [...prev, itemId];
      }
    });
  }, []);

  const _handleFavoriteToggle = useCallback(
    async (record: ScanRecord) => {
      try {
        await dispatch(toggleFavorite(record.id) as any);
      } catch (error) {
        console.error('Failed to toggle favorite:', error);
      }
    },
    [dispatch]
  );

  const _handleDeleteRecord = useCallback(
    async (record: ScanRecord) => {
      Alert.alert(
        '確認刪除',
        `確定要刪除 "${record.cardName}" 的掃描記錄嗎？`,
        [
          { text: '取消', style: 'cancel' },
          {
            text: '刪除',
            style: 'destructive',
            onPress: async () => {
              try {
                setLoading(true);
                await dispatch(deleteScanRecord(record.id) as any);
              } catch (error) {
                console.error('Failed to delete record:', error);
                Alert.alert('錯誤', '刪除記錄失敗');
              } finally {
                setLoading(false);
              }
            },
          },
        ]
      );
    },
    [dispatch]
  );

  const _handleBatchDelete = useCallback(async () => {
    if (selectedItems.length === 0) return;

    Alert.alert(
      '批量刪除',
      `確定要刪除選中的 ${selectedItems.length} 筆記錄嗎？`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '刪除',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              for (const itemId of selectedItems) {
                await dispatch(deleteScanRecord(itemId) as any);
              }
              setSelectedItems([]);
              setIsSelectionMode(false);
            } catch (error) {
              console.error('Failed to batch delete:', error);
              Alert.alert('錯誤', '批量刪除失敗');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  }, [selectedItems, dispatch]);

  const _handleSelectAll = useCallback(() => {
    if (selectedItems.length === scanHistory.length) {
      setSelectedItems([]);
      setIsSelectionMode(false);
    } else {
      setSelectedItems(scanHistory.map(record => record.id));
    }
  }, [selectedItems.length, scanHistory]);

  const _handleClearSelection = useCallback(() => {
    setSelectedItems([]);
    setIsSelectionMode(false);
  }, []);

  const _renderScanRecord = useCallback(
    ({ item }: { item: ScanRecord }) => {
      const _isSelected = selectedItems.includes(item.id);

      return (
        <TouchableOpacity
          style={[
            styles.recordItem,
            isSelected && styles.selectedItem,
            isSelectionMode && styles.selectionModeItem,
          ]}
          onPress={() => handleRecordPress(item)}
          onLongPress={() => handleLongPress(item)}
          testID={`scan-record-${item.id}`}
        >
          <View style={styles.recordHeader}>
            <View style={styles.cardInfo}>
              <Text style={styles.cardName}>{item.cardName}</Text>
              <Text style={styles.cardType}>{item.cardType}</Text>
            </View>

            <View style={styles.recordActions}>
              {!isSelectionMode && (
                <TouchableOpacity
                  style={styles.favoriteButton}
                  onPress={() => handleFavoriteToggle(item)}
                  testID={`favorite-button-${item.id}`}
                >
                  <Text
                    style={[
                      styles.favoriteIcon,
                      item.isFavorite && styles.favoriteActive,
                    ]}
                  >
                    {item.isFavorite ? '★' : '☆'}
                  </Text>
                </TouchableOpacity>
              )}

              {isSelectionMode && (
                <View
                  style={[
                    styles.selectionIndicator,
                    isSelected && styles.selectedIndicator,
                  ]}
                >
                  <Text style={styles.selectionText}>
                    {isSelected ? '✓' : ''}
                  </Text>
                </View>
              )}
            </View>
          </View>

          <View style={styles.recordDetails}>
            <Text style={styles.scanDate}>掃描時間：{item.scanDate}</Text>
            <Text style={styles.confidence}>置信度：{item.confidence}%</Text>
            <Text style={styles.processingTime}>
              處理時間：{item.processingTime}ms
            </Text>
          </View>

          {!isSelectionMode && (
            <View style={styles.recordFooter}>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeleteRecord(item)}
              >
                <Text style={styles.deleteButtonText}>刪除</Text>
              </TouchableOpacity>
            </View>
          )}
        </TouchableOpacity>
      );
    },
    [
      selectedItems,
      isSelectionMode,
      handleRecordPress,
      handleLongPress,
      handleFavoriteToggle,
      handleDeleteRecord,
    ]
  );

  const _renderSelectionHeader = () => {
    if (!isSelectionMode) return null;

    return (
      <View style={styles.selectionHeader}>
        <TouchableOpacity
          style={styles.selectAllButton}
          onPress={handleSelectAll}
        >
          <Text style={styles.selectAllText}>
            {selectedItems.length === scanHistory.length ? '取消全選' : '全選'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.selectionCount}>
          已選擇 {selectedItems.length} 項
        </Text>

        <View style={styles.selectionActions}>
          <TouchableOpacity
            style={styles.clearButton}
            onPress={handleClearSelection}
          >
            <Text style={styles.clearButtonText}>清除</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.batchDeleteButton,
              selectedItems.length === 0 && styles.batchDeleteButtonDisabled,
            ]}
            onPress={handleBatchDelete}
            disabled={selectedItems.length === 0}
          >
            <Text style={styles.batchDeleteButtonText}>刪除</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const _renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>尚無掃描記錄</Text>
      <Text style={styles.emptySubtext}>開始掃描卡片來建立您的收藏記錄</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size='large' color='#007AFF' />
        <Text style={styles.loadingText}>處理中...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderSelectionHeader()}

      <FlatList
        data={scanHistory}
        renderItem={renderScanRecord}
        keyExtractor={item => item.id}
        style={styles.list}
        contentContainerStyle={
          scanHistory.length === 0 ? styles.emptyList : undefined
        }
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
        onEndReachedThreshold={0.1}
      />
    </View>
  );
};

const _styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  selectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  selectAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  selectAllText: {
    fontSize: 14,
    color: '#007AFF',
  },
  selectionCount: {
    fontSize: 14,
    color: '#6C757D',
  },
  selectionActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  clearButtonText: {
    fontSize: 14,
    color: '#6C757D',
  },
  batchDeleteButton: {
    backgroundColor: '#DC3545',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  batchDeleteButtonDisabled: {
    backgroundColor: '#E9ECEF',
  },
  batchDeleteButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  list: {
    flex: 1,
  },
  emptyList: {
    flex: 1,
    justifyContent: 'center',
  },
  recordItem: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  selectedItem: {
    backgroundColor: '#E3F2FD',
    borderColor: '#007AFF',
    borderWidth: 2,
  },
  selectionModeItem: {
    paddingLeft: 48,
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardInfo: {
    flex: 1,
  },
  cardName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 4,
  },
  cardType: {
    fontSize: 14,
    color: '#6C757D',
  },
  recordActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  favoriteButton: {
    padding: 4,
  },
  favoriteIcon: {
    fontSize: 20,
    color: '#E9ECEF',
  },
  favoriteActive: {
    color: '#FFD700',
  },
  selectionIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E9ECEF',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  selectedIndicator: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  selectionText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  recordDetails: {
    marginBottom: 12,
  },
  scanDate: {
    fontSize: 14,
    color: '#6C757D',
    marginBottom: 4,
  },
  confidence: {
    fontSize: 14,
    color: '#6C757D',
    marginBottom: 4,
  },
  processingTime: {
    fontSize: 14,
    color: '#6C757D',
  },
  recordFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  deleteButton: {
    backgroundColor: '#DC3545',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  deleteButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6C757D',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#ADB5BD',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6C757D',
  },
});

export default ScanHistoryList;
