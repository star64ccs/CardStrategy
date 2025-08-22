import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { Card } from '@/components/common/Card';
import { LazyImage } from '@/components/common/LazyImage';
import { Button } from '@/components/common/Button';
import { theme } from '@/config/theme';
import { RootState } from '@/store';
import {
  fetchScanHistory,
  deleteScanRecord,
  deleteMultipleRecords,
  toggleFavorite,
  toggleSelectionMode,
  toggleRecordSelection,
  selectAllRecords,
  clearSelection,
  setFilters,
} from '@/store/slices/scanHistorySlice';
import { formatDate, formatTime } from '@/utils/formatters';
import { logger } from '@/utils/logger';

const { width } = Dimensions.get('window');

interface ScanHistoryListProps {
  onRecordPress?: (record: any) => void;
  onRefresh?: () => void;
}

export const ScanHistoryList: React.FC<ScanHistoryListProps> = ({
  onRecordPress,
  onRefresh,
}) => {
  const dispatch = useDispatch();
  const {
    history,
    isLoading,
    isRefreshing,
    error,
    filters,
    pagination,
    selectedRecords,
    isSelectionMode,
  } = useSelector((state: RootState) => state.scanHistory);

  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadHistory();
  }, [filters]);

  const loadHistory = () => {
    dispatch(fetchScanHistory(filters));
  };

  const handleRefresh = () => {
    dispatch(fetchScanHistory(filters));
    onRefresh?.();
  };

  const handleRecordPress = (record: any) => {
    if (isSelectionMode) {
      dispatch(toggleRecordSelection(record.id));
    } else {
      onRecordPress?.(record);
    }
  };

  const handleLongPress = (record: any) => {
    if (!isSelectionMode) {
      dispatch(toggleSelectionMode());
      dispatch(toggleRecordSelection(record.id));
    }
  };

  const handleDeleteRecord = (recordId: string) => {
    Alert.alert('確認刪除', '確定要刪除這條掃描記錄嗎？此操作無法撤銷。', [
      { text: '取消', style: 'cancel' },
      {
        text: '刪除',
        style: 'destructive',
        onPress: () => dispatch(deleteScanRecord(recordId)),
      },
    ]);
  };

  const handleDeleteSelected = () => {
    if (selectedRecords.length === 0) return;

    Alert.alert(
      '確認批量刪除',
      `確定要刪除選中的 ${selectedRecords.length} 條記錄嗎？此操作無法撤銷。`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '刪除',
          style: 'destructive',
          onPress: () => dispatch(deleteMultipleRecords(selectedRecords)),
        },
      ]
    );
  };

  const handleToggleFavorite = (recordId: string) => {
    dispatch(toggleFavorite(recordId));
  };

  const handleSelectAll = () => {
    if (selectedRecords.length === history.length) {
      dispatch(clearSelection());
    } else {
      dispatch(selectAllRecords());
    }
  };

  const getScanTypeIcon = (scanType: string) => {
    const icons = {
      recognition: 'eye',
      condition: 'analytics',
      authenticity: 'shield-checkmark',
      batch: 'layers',
    };
    return icons[scanType as keyof typeof icons] || 'scan';
  };

  const getScanTypeColor = (scanType: string) => {
    const colors = {
      recognition: theme.colors.primary,
      condition: theme.colors.warning,
      authenticity: theme.colors.success,
      batch: theme.colors.info,
    };
    return (
      colors[scanType as keyof typeof colors] || theme.colors.textSecondary
    );
  };

  const getScanTypeLabel = (scanType: string) => {
    const labels = {
      recognition: '識別',
      condition: '條件分析',
      authenticity: '真偽驗證',
      batch: '批量掃描',
    };
    return labels[scanType as keyof typeof labels] || scanType;
  };

  const renderHistoryItem = ({ item }: { item: any }) => {
    const isSelected = selectedRecords.includes(item.id);

    return (
      <TouchableOpacity
        style={[styles.historyItem, isSelected && styles.selectedItem]}
        onPress={() => handleRecordPress(item)}
        onLongPress={() => handleLongPress(item)}
        activeOpacity={0.7}
      >
        {isSelectionMode && (
          <View style={styles.selectionIndicator}>
            <Ionicons
              name={isSelected ? 'checkmark-circle' : 'ellipse-outline'}
              size={24}
              color={
                isSelected ? theme.colors.primary : theme.colors.textSecondary
              }
            />
          </View>
        )}

        <View style={styles.itemContent}>
          <View style={styles.itemHeader}>
            <View style={styles.cardInfo}>
              <View style={styles.cardImageContainer}>
                {item.cardImage ? (
                  <LazyImage
                    uri={item.cardImage}
                    style={styles.cardImage}
                    quality="low"
                    cachePolicy="both"
                  />
                ) : (
                  <View style={styles.cardPlaceholder}>
                    <Ionicons
                      name="card"
                      size={24}
                      color={theme.colors.textSecondary}
                    />
                  </View>
                )}
              </View>
              <View style={styles.cardDetails}>
                <Text style={styles.cardName} numberOfLines={1}>
                  {item.cardName || '未知卡片'}
                </Text>
                <Text style={styles.scanDate}>
                  {formatDate(item.scanDate)} {formatTime(item.scanDate)}
                </Text>
              </View>
            </View>
            <View style={styles.scanInfo}>
              <View style={styles.scanTypeContainer}>
                <Ionicons
                  name={getScanTypeIcon(item.scanType)}
                  size={16}
                  color={getScanTypeColor(item.scanType)}
                />
                <Text
                  style={[
                    styles.scanType,
                    { color: getScanTypeColor(item.scanType) },
                  ]}
                >
                  {getScanTypeLabel(item.scanType)}
                </Text>
              </View>
              <View style={styles.confidenceContainer}>
                <Text style={styles.confidenceLabel}>信心度</Text>
                <Text style={styles.confidenceValue}>
                  {item.scanResult.confidence
                    ? Math.round(item.scanResult.confidence * 100)
                    : 0}
                  %
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.itemFooter}>
            <View style={styles.processingInfo}>
              <Text style={styles.processingTime}>
                處理時間: {item.processingTime.toFixed(1)}s
              </Text>
              <View style={styles.statusContainer}>
                <View
                  style={[
                    styles.statusIndicator,
                    {
                      backgroundColor: item.scanResult.success
                        ? theme.colors.success
                        : theme.colors.error,
                    },
                  ]}
                />
                <Text style={styles.statusText}>
                  {item.scanResult.success ? '成功' : '失敗'}
                </Text>
              </View>
            </View>
            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleToggleFavorite(item.id)}
              >
                <Ionicons
                  name={item.isFavorite ? 'heart' : 'heart-outline'}
                  size={20}
                  color={
                    item.isFavorite
                      ? theme.colors.error
                      : theme.colors.textSecondary
                  }
                />
              </TouchableOpacity>
              {!isSelectionMode && (
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleDeleteRecord(item.id)}
                >
                  <Ionicons
                    name="trash-outline"
                    size={20}
                    color={theme.colors.error}
                  />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {item.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {item.tags.slice(0, 3).map((tag: string, index: number) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>#{tag}</Text>
                </View>
              ))}
              {item.tags.length > 3 && (
                <Text style={styles.moreTags}>+{item.tags.length - 3}</Text>
              )}
            </View>
          )}

          {item.notes && (
            <View style={styles.notesContainer}>
              <Text style={styles.notesText} numberOfLines={2}>
                {item.notes}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="scan" size={64} color={theme.colors.textSecondary} />
      <Text style={styles.emptyTitle}>暫無掃描記錄</Text>
      <Text style={styles.emptySubtext}>
        您還沒有進行過卡片掃描，開始掃描您的第一張卡片吧！
      </Text>
    </View>
  );

  const renderSelectionHeader = () => {
    if (!isSelectionMode) return null;

    return (
      <View style={styles.selectionHeader}>
        <View style={styles.selectionInfo}>
          <Text style={styles.selectionText}>
            已選擇 {selectedRecords.length} 項
          </Text>
          <TouchableOpacity onPress={handleSelectAll}>
            <Text style={styles.selectAllText}>
              {selectedRecords.length === history.length ? '取消全選' : '全選'}
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.selectionActions}>
          <Button
            title="刪除"
            onPress={handleDeleteSelected}
            variant="danger"
            size="small"
            disabled={selectedRecords.length === 0}
          />
          <Button
            title="完成"
            onPress={() => dispatch(toggleSelectionMode())}
            variant="secondary"
            size="small"
          />
        </View>
      </View>
    );
  };

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={48} color={theme.colors.error} />
        <Text style={styles.errorTitle}>加載失敗</Text>
        <Text style={styles.errorText}>{error}</Text>
        <Button title="重試" onPress={loadHistory} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderSelectionHeader()}

      <FlatList
        data={history}
        renderItem={renderHistoryItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
        ListEmptyComponent={renderEmptyState}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        onEndReached={() => {
          if (pagination.hasNext && !isLoading) {
            dispatch(setFilters({ page: pagination.page + 1 }));
          }
        }}
        onEndReachedThreshold={0.1}
        ListFooterComponent={
          isLoading && pagination.page > 1 ? (
            <View style={styles.loadingFooter}>
              <ActivityIndicator size="small" color={theme.colors.primary} />
              <Text style={styles.loadingText}>加載更多...</Text>
            </View>
          ) : null
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  selectionHeader: {
    backgroundColor: theme.colors.backgroundPaper,
    padding: theme.spacing.medium,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  selectionInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.small,
  },
  selectionText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  selectAllText: {
    fontSize: 14,
    color: theme.colors.primary,
  },
  selectionActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.spacing.small,
  },
  listContainer: {
    padding: theme.spacing.medium,
  },
  historyItem: {
    backgroundColor: theme.colors.backgroundPaper,
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.medium,
    marginBottom: theme.spacing.medium,
    ...theme.shadows.small,
  },
  selectedItem: {
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  selectionIndicator: {
    position: 'absolute',
    top: theme.spacing.small,
    right: theme.spacing.small,
    zIndex: 1,
  },
  itemContent: {
    flex: 1,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.medium,
  },
  cardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cardImageContainer: {
    width: 60,
    height: 80,
    borderRadius: theme.borderRadius.small,
    overflow: 'hidden',
    marginRight: theme.spacing.medium,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: theme.colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardDetails: {
    flex: 1,
  },
  cardName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.xsmall,
  },
  scanDate: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  scanInfo: {
    alignItems: 'flex-end',
  },
  scanTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xsmall,
  },
  scanType: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  confidenceContainer: {
    alignItems: 'center',
  },
  confidenceLabel: {
    fontSize: 10,
    color: theme.colors.textSecondary,
  },
  confidenceValue: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.text,
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.small,
  },
  processingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  processingTime: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginRight: theme.spacing.medium,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: theme.spacing.small,
  },
  actionButton: {
    padding: theme.spacing.small,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: theme.spacing.small,
  },
  tag: {
    backgroundColor: theme.colors.backgroundSecondary,
    paddingHorizontal: theme.spacing.small,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.small,
    marginRight: theme.spacing.small,
    marginBottom: theme.spacing.xsmall,
  },
  tagText: {
    fontSize: 10,
    color: theme.colors.textSecondary,
  },
  moreTags: {
    fontSize: 10,
    color: theme.colors.textSecondary,
    alignSelf: 'center',
  },
  notesContainer: {
    backgroundColor: theme.colors.backgroundSecondary,
    padding: theme.spacing.small,
    borderRadius: theme.borderRadius.small,
  },
  notesText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
  },
  separator: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: theme.spacing.small,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing.xlarge,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginTop: theme.spacing.medium,
    marginBottom: theme.spacing.small,
  },
  emptySubtext: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: theme.spacing.large,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing.xlarge,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.error,
    marginTop: theme.spacing.medium,
    marginBottom: theme.spacing.small,
  },
  errorText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.medium,
  },
  loadingFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.medium,
  },
  loadingText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.small,
  },
});

export default ScanHistoryList;
