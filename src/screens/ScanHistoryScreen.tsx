import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { theme } from '@/config/theme';
import { RootState } from '@/store';
import {
  fetchScanHistory,
  fetchScanStatistics,
  searchScanHistory,
  clearFilters,
  setFilters,
  toggleSelectionMode,
} from '@/store/slices/scanHistorySlice';
import { ScanHistoryList } from '@/components/scan/ScanHistoryList';
import { ScanHistoryDetail } from '@/components/scan/ScanHistoryDetail';
import { formatNumber } from '@/utils/formatters';
import { logger } from '@/utils/logger';

interface ScanHistoryScreenProps {
  navigation: any;
}

export const ScanHistoryScreen: React.FC<ScanHistoryScreenProps> = ({
  navigation,
}) => {
  const dispatch = useDispatch();
  const {
    history,
    statistics,
    isLoading,
    filters,
    selectedRecord,
    isSelectionMode,
  } = useSelector((state: RootState) => state.scanHistory);

  const [showFilters, setShowFilters] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecordForDetail, setSelectedRecordForDetail] =
    useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    dispatch(fetchScanHistory(filters));
    dispatch(fetchScanStatistics());
  };

  const handleRecordPress = (record: any) => {
    setSelectedRecordForDetail(record);
    setShowDetail(true);
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      dispatch(searchScanHistory({ query: searchQuery.trim(), filters }));
    } else {
      dispatch(fetchScanHistory(filters));
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    dispatch(fetchScanHistory(filters));
  };

  const handleFilterChange = (newFilters: any) => {
    dispatch(setFilters(newFilters));
  };

  const handleClearFilters = () => {
    dispatch(clearFilters());
    setShowFilters(false);
  };

  const handleExport = () => {
    Alert.alert('導出掃描歷史', '選擇導出格式', [
      { text: '取消', style: 'cancel' },
      { text: 'CSV', onPress: () => exportHistory('csv') },
      { text: 'JSON', onPress: () => exportHistory('json') },
      { text: 'PDF', onPress: () => exportHistory('pdf') },
    ]);
  };

  const exportHistory = (format: 'csv' | 'json' | 'pdf') => {
    // 這裡應該調用導出功能
    logger.info('Exporting scan history:', { format });
    Alert.alert('導出成功', `掃描歷史已導出為 ${format.toUpperCase()} 格式`);
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <Text style={styles.title}>掃描歷史</Text>
        <Text style={styles.subtitle}>
          共 {statistics?.totalScans || 0} 條記錄
        </Text>
      </View>
      <View style={styles.headerActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Ionicons
            name="filter"
            size={24}
            color={theme.colors.textSecondary}
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={handleExport}>
          <Ionicons
            name="download"
            size={24}
            color={theme.colors.textSecondary}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => dispatch(toggleSelectionMode())}
        >
          <Ionicons
            name="checkbox"
            size={24}
            color={theme.colors.textSecondary}
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderSearchBar = () => (
    <View style={styles.searchContainer}>
      <View style={styles.searchInputContainer}>
        <Ionicons name="search" size={20} color={theme.colors.textSecondary} />
        <Input
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="搜索掃描記錄..."
          style={styles.searchInput}
          onSubmitEditing={handleSearch}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={handleClearSearch}>
            <Ionicons
              name="close-circle"
              size={20}
              color={theme.colors.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>
      <Button
        title="搜索"
        onPress={handleSearch}
        disabled={!searchQuery.trim()}
        size="small"
      />
    </View>
  );

  const renderStatistics = () => {
    if (!statistics) return null;

    return (
      <View style={styles.statisticsContainer}>
        <Card style={styles.statisticsCard}>
          <Text style={styles.statisticsTitle}>掃描統計</Text>
          <View style={styles.statisticsGrid}>
            <View style={styles.statisticItem}>
              <Text style={styles.statisticValue}>
                {formatNumber(statistics.totalScans)}
              </Text>
              <Text style={styles.statisticLabel}>總掃描</Text>
            </View>
            <View style={styles.statisticItem}>
              <Text style={styles.statisticValue}>
                {formatNumber(statistics.successfulScans)}
              </Text>
              <Text style={styles.statisticLabel}>成功</Text>
            </View>
            <View style={styles.statisticItem}>
              <Text style={styles.statisticValue}>
                {statistics.successRate.toFixed(1)}%
              </Text>
              <Text style={styles.statisticLabel}>成功率</Text>
            </View>
            <View style={styles.statisticItem}>
              <Text style={styles.statisticValue}>
                {statistics.averageProcessingTime.toFixed(1)}s
              </Text>
              <Text style={styles.statisticLabel}>平均時間</Text>
            </View>
          </View>

          <View style={styles.scanTypeStats}>
            <Text style={styles.scanTypeTitle}>按類型統計</Text>
            <View style={styles.scanTypeGrid}>
              <View style={styles.scanTypeItem}>
                <Text style={styles.scanTypeLabel}>識別</Text>
                <Text style={styles.scanTypeValue}>
                  {statistics.scansByType.recognition}
                </Text>
              </View>
              <View style={styles.scanTypeItem}>
                <Text style={styles.scanTypeLabel}>條件分析</Text>
                <Text style={styles.scanTypeValue}>
                  {statistics.scansByType.condition}
                </Text>
              </View>
              <View style={styles.scanTypeItem}>
                <Text style={styles.scanTypeLabel}>真偽驗證</Text>
                <Text style={styles.scanTypeValue}>
                  {statistics.scansByType.authenticity}
                </Text>
              </View>
              <View style={styles.scanTypeItem}>
                <Text style={styles.scanTypeLabel}>批量掃描</Text>
                <Text style={styles.scanTypeValue}>
                  {statistics.scansByType.batch}
                </Text>
              </View>
            </View>
          </View>
        </Card>
      </View>
    );
  };

  const renderFilters = () => {
    if (!showFilters) return null;

    return (
      <Card style={styles.filtersCard}>
        <View style={styles.filtersHeader}>
          <Text style={styles.filtersTitle}>篩選條件</Text>
          <TouchableOpacity onPress={handleClearFilters}>
            <Text style={styles.clearFiltersText}>清除</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.filterOptions}>
          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>掃描類型</Text>
            <View style={styles.filterButtons}>
              {['recognition', 'condition', 'authenticity', 'batch'].map(
                (type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.filterButton,
                      filters.scanType === type && styles.filterButtonActive,
                    ]}
                    onPress={() =>
                      handleFilterChange({
                        scanType: filters.scanType === type ? undefined : type,
                      })
                    }
                  >
                    <Text
                      style={[
                        styles.filterButtonText,
                        filters.scanType === type &&
                          styles.filterButtonTextActive,
                      ]}
                    >
                      {getScanTypeLabel(type)}
                    </Text>
                  </TouchableOpacity>
                )
              )}
            </View>
          </View>

          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>排序方式</Text>
            <View style={styles.filterButtons}>
              {[
                { key: 'date', label: '時間' },
                { key: 'processingTime', label: '處理時間' },
                { key: 'confidence', label: '信心度' },
              ].map((sort) => (
                <TouchableOpacity
                  key={sort.key}
                  style={[
                    styles.filterButton,
                    filters.sortBy === sort.key && styles.filterButtonActive,
                  ]}
                  onPress={() => handleFilterChange({ sortBy: sort.key })}
                >
                  <Text
                    style={[
                      styles.filterButtonText,
                      filters.sortBy === sort.key &&
                        styles.filterButtonTextActive,
                    ]}
                  >
                    {sort.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>排序順序</Text>
            <View style={styles.filterButtons}>
              <TouchableOpacity
                style={[
                  styles.filterButton,
                  filters.sortOrder === 'desc' && styles.filterButtonActive,
                ]}
                onPress={() => handleFilterChange({ sortOrder: 'desc' })}
              >
                <Text
                  style={[
                    styles.filterButtonText,
                    filters.sortOrder === 'desc' &&
                      styles.filterButtonTextActive,
                  ]}
                >
                  降序
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.filterButton,
                  filters.sortOrder === 'asc' && styles.filterButtonActive,
                ]}
                onPress={() => handleFilterChange({ sortOrder: 'asc' })}
              >
                <Text
                  style={[
                    styles.filterButtonText,
                    filters.sortOrder === 'asc' &&
                      styles.filterButtonTextActive,
                  ]}
                >
                  升序
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Card>
    );
  };

  const getScanTypeLabel = (type: string) => {
    const labels = {
      recognition: '識別',
      condition: '條件分析',
      authenticity: '真偽驗證',
      batch: '批量掃描',
    };
    return labels[type as keyof typeof labels] || type;
  };

  return (
    <View style={styles.container}>
      {renderHeader()}
      {renderSearchBar()}
      {renderStatistics()}
      {renderFilters()}

      <ScanHistoryList onRecordPress={handleRecordPress} onRefresh={loadData} />

      {/* 詳細記錄模態框 */}
      <Modal
        visible={showDetail}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowDetail(false)}
            >
              <Ionicons name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>掃描詳情</Text>
            <View style={styles.modalPlaceholder} />
          </View>

          {selectedRecordForDetail && (
            <ScanHistoryDetail
              record={selectedRecordForDetail}
              onClose={() => setShowDetail(false)}
            />
          )}
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.medium,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerLeft: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.xsmall,
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  headerActions: {
    flexDirection: 'row',
    gap: theme.spacing.small,
  },
  actionButton: {
    padding: theme.spacing.small,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.medium,
    gap: theme.spacing.small,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.backgroundPaper,
    borderRadius: theme.borderRadius.medium,
    paddingHorizontal: theme.spacing.medium,
    paddingVertical: theme.spacing.small,
  },
  searchInput: {
    flex: 1,
    marginLeft: theme.spacing.small,
    fontSize: 16,
  },
  statisticsContainer: {
    paddingHorizontal: theme.spacing.medium,
    marginBottom: theme.spacing.medium,
  },
  statisticsCard: {
    padding: theme.spacing.medium,
  },
  statisticsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.medium,
  },
  statisticsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.large,
  },
  statisticItem: {
    alignItems: 'center',
    flex: 1,
  },
  statisticValue: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.primary,
    marginBottom: theme.spacing.xsmall,
  },
  statisticLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  scanTypeStats: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: theme.spacing.medium,
  },
  scanTypeTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.small,
  },
  scanTypeGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  scanTypeItem: {
    alignItems: 'center',
    flex: 1,
  },
  scanTypeLabel: {
    fontSize: 10,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xsmall,
  },
  scanTypeValue: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  filtersCard: {
    margin: theme.spacing.medium,
    padding: theme.spacing.medium,
  },
  filtersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.medium,
  },
  filtersTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  clearFiltersText: {
    fontSize: 14,
    color: theme.colors.primary,
  },
  filterOptions: {
    gap: theme.spacing.medium,
  },
  filterSection: {
    gap: theme.spacing.small,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
  },
  filterButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.small,
  },
  filterButton: {
    paddingHorizontal: theme.spacing.medium,
    paddingVertical: theme.spacing.small,
    borderRadius: theme.borderRadius.small,
    backgroundColor: theme.colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  filterButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  filterButtonText: {
    fontSize: 12,
    color: theme.colors.text,
  },
  filterButtonTextActive: {
    color: theme.colors.white,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.medium,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  closeButton: {
    padding: theme.spacing.small,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
  },
  modalPlaceholder: {
    width: 44,
  },
});

export default ScanHistoryScreen;
