import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { fakeCardCollectionService } from '../services/fakeCardCollectionService';
import { logger } from '../utils/logger';
import { theme } from '../theme';

interface FakeCardSubmission {
  id: string;
  cardName: string;
  cardType: string;
  fakeType: string;
  status: 'pending' | 'approved' | 'rejected';
  submissionDate: string;
  reviewerNotes?: string;
  rewardPoints?: number;
}

const FakeCardHistoryScreen: React.FC = () => {
  const navigation = useNavigation();
  const [submissions, setSubmissions] = useState<FakeCardSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  // 載入假卡提交記錄
  const loadSubmissions = async (refresh = false) => {
    try {
      const currentPage = refresh ? 1 : page;
      const response = await fakeCardCollectionService.getUserSubmissions();
      
      if (response.success && response.data) {
        const newSubmissions = response.data.submissions || [];
        
        if (refresh) {
          setSubmissions(newSubmissions);
        } else {
          setSubmissions(prev => [...prev, ...newSubmissions]);
        }
        
        setHasMore(newSubmissions.length === 10); // 假設每頁10條記錄
        setPage(currentPage + 1);
      }
    } catch (error) {
      logger.error('載入假卡提交記錄失敗:', error);
      Alert.alert('錯誤', '載入記錄失敗，請重試');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // 下拉刷新
  const onRefresh = () => {
    setRefreshing(true);
    setPage(1);
    setHasMore(true);
    loadSubmissions(true);
  };

  // 載入更多
  const loadMore = () => {
    if (hasMore && !loading) {
      loadSubmissions();
    }
  };

  // 過濾記錄
  const filteredSubmissions = selectedStatus
    ? submissions.filter(submission => submission.status === selectedStatus)
    : submissions;

  // 獲取狀態顯示信息
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return {
          label: '審核中',
          color: theme.colors.warning,
          icon: 'time-outline',
        };
      case 'approved':
        return {
          label: '已通過',
          color: theme.colors.success,
          icon: 'checkmark-circle-outline',
        };
      case 'rejected':
        return {
          label: '已拒絕',
          color: theme.colors.error,
          icon: 'close-circle-outline',
        };
      default:
        return {
          label: '未知',
          color: theme.colors.textSecondary,
          icon: 'help-outline',
        };
    }
  };

  // 獲取假卡類型顯示信息
  const getFakeTypeInfo = (fakeType: string) => {
    switch (fakeType) {
      case 'counterfeit':
        return { label: '假卡', color: theme.colors.error };
      case 'reprint':
        return { label: '重印卡', color: theme.colors.warning };
      case 'custom':
        return { label: '自製卡', color: theme.colors.info };
      case 'proxy':
        return { label: '代理卡', color: theme.colors.textSecondary };
      default:
        return { label: '未知', color: theme.colors.textSecondary };
    }
  };

  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // 渲染狀態過濾器
  const renderStatusFilter = () => (
    <View style={styles.filterContainer}>
      <Text style={styles.filterTitle}>狀態篩選</Text>
      <View style={styles.filterButtons}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            !selectedStatus && styles.filterButtonActive,
          ]}
          onPress={() => setSelectedStatus(null)}
        >
          <Text style={[
            styles.filterButtonText,
            !selectedStatus && styles.filterButtonTextActive,
          ]}>
            全部
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            selectedStatus === 'pending' && styles.filterButtonActive,
          ]}
          onPress={() => setSelectedStatus('pending')}
        >
          <Text style={[
            styles.filterButtonText,
            selectedStatus === 'pending' && styles.filterButtonTextActive,
          ]}>
            審核中
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            selectedStatus === 'approved' && styles.filterButtonActive,
          ]}
          onPress={() => setSelectedStatus('approved')}
        >
          <Text style={[
            styles.filterButtonText,
            selectedStatus === 'approved' && styles.filterButtonTextActive,
          ]}>
            已通過
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            selectedStatus === 'rejected' && styles.filterButtonActive,
          ]}
          onPress={() => setSelectedStatus('rejected')}
        >
          <Text style={[
            styles.filterButtonText,
            selectedStatus === 'rejected' && styles.filterButtonTextActive,
          ]}>
            已拒絕
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // 渲染假卡記錄項目
  const renderSubmissionItem = ({ item }: { item: FakeCardSubmission }) => {
    const statusInfo = getStatusInfo(item.status);
    const fakeTypeInfo = getFakeTypeInfo(item.fakeType);

    return (
      <View style={styles.submissionItem}>
        <View style={styles.submissionHeader}>
          <View style={styles.cardInfo}>
            <Text style={styles.cardName}>{item.cardName}</Text>
            <Text style={styles.cardType}>{item.cardType}</Text>
          </View>
          <View style={styles.statusContainer}>
            <Ionicons
              name={statusInfo.icon as any}
              size={20}
              color={statusInfo.color}
            />
            <Text style={[styles.statusText, { color: statusInfo.color }]}>
              {statusInfo.label}
            </Text>
          </View>
        </View>

        <View style={styles.submissionDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>假卡類型:</Text>
            <Text style={[styles.detailValue, { color: fakeTypeInfo.color }]}>
              {fakeTypeInfo.label}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>提交時間:</Text>
            <Text style={styles.detailValue}>
              {formatDate(item.submissionDate)}
            </Text>
          </View>

          {item.rewardPoints !== undefined && item.rewardPoints > 0 && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>獎勵積分:</Text>
              <Text style={[styles.detailValue, { color: theme.colors.success }]}>
                +{item.rewardPoints}
              </Text>
            </View>
          )}

          {item.reviewerNotes && (
            <View style={styles.notesContainer}>
              <Text style={styles.notesLabel}>審核備註:</Text>
              <Text style={styles.notesText}>{item.reviewerNotes}</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  // 渲染空狀態
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="document-outline" size={64} color={theme.colors.textSecondary} />
      <Text style={styles.emptyTitle}>暫無提交記錄</Text>
      <Text style={styles.emptyDescription}>
        您還沒有提交過假卡報告，快去提交第一個吧！
      </Text>
      <TouchableOpacity
        style={styles.submitButton}
        onPress={() => navigation.navigate('FakeCardReport' as any)}
      >
        <Ionicons name="add" size={20} color="white" />
        <Text style={styles.submitButtonText}>提交假卡報告</Text>
      </TouchableOpacity>
    </View>
  );

  // 渲染載入更多指示器
  const renderFooter = () => {
    if (!hasMore) {
      return (
        <View style={styles.footer}>
          <Text style={styles.footerText}>沒有更多記錄了</Text>
        </View>
      );
    }

    if (loading) {
      return (
        <View style={styles.footer}>
          <ActivityIndicator size="small" color={theme.colors.primary} />
          <Text style={styles.footerText}>載入中...</Text>
        </View>
      );
    }

    return null;
  };

  useEffect(() => {
    loadSubmissions(true);
  }, []);

  if (loading && submissions.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>載入中...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>假卡提交記錄</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('FakeCardReport' as any)}
        >
          <Ionicons name="add" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      {renderStatusFilter()}

      <FlatList
        data={filteredSubmissions}
        renderItem={renderSubmissionItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
          />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.1}
        ListEmptyComponent={renderEmptyState}
        ListFooterComponent={renderFooter}
        showsVerticalScrollIndicator={false}
      />
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  addButton: {
    padding: 8,
  },
  filterContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  filterTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 12,
  },
  filterButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  filterButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  filterButtonText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  filterButtonTextActive: {
    color: 'white',
  },
  listContainer: {
    flexGrow: 1,
    padding: 16,
  },
  submissionItem: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  submissionHeader: {
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
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 4,
  },
  cardType: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  submissionDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
  },
  notesContainer: {
    marginTop: 8,
    padding: 12,
    backgroundColor: theme.colors.background,
    borderRadius: 8,
  },
  notesLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  notesText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginTop: 16,
  },
  footer: {
    padding: 16,
    alignItems: 'center',
    gap: 8,
  },
  footerText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
});

export default FakeCardHistoryScreen;
