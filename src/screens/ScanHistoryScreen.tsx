import { useNavigation } from '@react-navigation/native';
import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  RefreshControl,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';

import ScanHistoryList, { ScanRecord } from '../components/ScanHistoryList';
import type { RootState } from '../store';
import { fetchScanHistory } from '../store/slices/scanHistorySlice';

interface ScanHistoryScreenProps {
  navigation: unknown;
}

const ScanHistoryScreen: React.FC<ScanHistoryScreenProps> = ({
  navigation,
}) => {
  const _dispatch = useDispatch();
  const {
    history: scanHistory = [],
    isLoading: loading = false,
    error = null,
  } = useSelector((state: RootState) => state.scanHistory || {});
  const [refreshing, setRefreshing] = useState(false);

  const _loadScanHistory = useCallback(async () => {
    try {
      await dispatch(fetchScanHistory({}) as any);
    } catch (error) {
      console.error('Failed to load scan history:', error);
    }
  }, [dispatch]);

  useEffect(() => {
    // 在Test環境中不Auto加載Data
    if (process.env.NODE_ENV !== 'test') {
      loadScanHistory();
    }
  }, [loadScanHistory]);

  const _onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadScanHistory();
    } finally {
      setRefreshing(false);
    }
  }, [loadScanHistory]);

  const _handleRecordPress = useCallback(
    (record: unknown) => {
      navigation.navigate('ScanDetail', { record });
    },
    [navigation]
  );

  const _handleRefresh = useCallback(() => {
    onRefresh();
  }, [onRefresh]);

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size='large' color='#007AFF' />
        <Text style={styles.loadingText}>載入掃描歷史中...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>載入失敗</Text>
        <Text style={styles.errorMessage}>{error}</Text>
        <Text style={styles.retryText} onPress={loadScanHistory}>
          點擊重試
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          colors={['#007AFF']}
          tintColor='#007AFF'
        />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>掃描歷史</Text>
        <Text style={styles.subtitle}>共 {scanHistory.length} 筆記錄</Text>
      </View>

      {scanHistory.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>尚無掃描記錄</Text>
          <Text style={styles.emptySubtext}>
            開始掃描卡片來建立您的收藏記錄
          </Text>
        </View>
      ) : (
        <ScanHistoryList
          scanHistory={scanHistory as any}
          onRecordPress={handleRecordPress}
          onRefresh={handleRefresh}
        />
      )}
    </ScrollView>
  );
};

const _styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6C757D',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#DC3545',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: '#6C757D',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryText: {
    fontSize: 16,
    color: '#007AFF',
    textDecorationLine: 'underline',
  },
  header: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#212529',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6C757D',
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
});

export default ScanHistoryScreen;
