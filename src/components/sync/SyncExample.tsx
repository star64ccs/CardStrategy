import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useIncrementalSync } from '@/hooks/useIncrementalSync';
import { SyncStatusIndicator } from '@/components/common/SyncStatusIndicator';
import { incrementalSyncManager } from '@/utils/incrementalSyncManager';

export const SyncExample: React.FC = () => {
  const {
    syncStatus,
    lastSyncTime,
    pendingChangesCount,
    error,
    isOnline,
    forceSync,
    clearError,
    isSyncing,
    hasError,
    isOffline,
    hasPendingChanges
  } = useIncrementalSync();

  const [testData, setTestData] = useState({
    cardCount: 0,
    collectionCount: 0,
    annotationCount: 0
  });

  // 添加測試卡片
  const addTestCard = () => {
    const cardId = `test_card_${Date.now()}`;
    incrementalSyncManager.addChange({
      id: cardId,
      type: 'card',
      data: {
        name: `測試卡片 ${testData.cardCount + 1}`,
        description: '這是一個測試卡片',
        rarity: 'common',
        condition: 'mint',
        estimatedValue: 100
      }
    });
    setTestData(prev => ({ ...prev, cardCount: prev.cardCount + 1 }));
  };

  // 添加測試收藏
  const addTestCollection = () => {
    const collectionId = `test_collection_${Date.now()}`;
    incrementalSyncManager.addChange({
      id: collectionId,
      type: 'collection',
      data: {
        name: `測試收藏 ${testData.collectionCount + 1}`,
        description: '這是一個測試收藏',
        category: 'pokemon',
        isPublic: false
      }
    });
    setTestData(prev => ({ ...prev, collectionCount: prev.collectionCount + 1 }));
  };

  // 添加測試註釋
  const addTestAnnotation = () => {
    const annotationId = `test_annotation_${Date.now()}`;
    incrementalSyncManager.addChange({
      id: annotationId,
      type: 'annotation',
      data: {
        cardId: 'test_card_1',
        content: `測試註釋 ${testData.annotationCount + 1}`,
        type: 'note',
        position: { x: 100, y: 100 }
      }
    });
    setTestData(prev => ({ ...prev, annotationCount: prev.annotationCount + 1 }));
  };

  // 批量添加測試數據
  const addBatchTestData = () => {
    const items = [];

    // 添加5個卡片
    for (let i = 0; i < 5; i++) {
      items.push({
        id: `batch_card_${Date.now()}_${i}`,
        type: 'card' as const,
        data: {
          name: `批量卡片 ${i + 1}`,
          description: '批量添加的測試卡片',
          rarity: 'rare',
          condition: 'near_mint',
          estimatedValue: 200 + i * 50
        }
      });
    }

    // 添加3個收藏
    for (let i = 0; i < 3; i++) {
      items.push({
        id: `batch_collection_${Date.now()}_${i}`,
        type: 'collection' as const,
        data: {
          name: `批量收藏 ${i + 1}`,
          description: '批量添加的測試收藏',
          category: 'yugioh',
          isPublic: true
        }
      });
    }

    incrementalSyncManager.addBatchChanges(items);
    setTestData(prev => ({
      ...prev,
      cardCount: prev.cardCount + 5,
      collectionCount: prev.collectionCount + 3
    }));
  };

  // 清除所有待同步項目
  const clearAllPending = () => {
    Alert.alert(
      '確認清除',
      '確定要清除所有待同步的項目嗎？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '確定',
          style: 'destructive',
          onPress: () => {
            incrementalSyncManager.clearPendingChanges();
            setTestData({ cardCount: 0, collectionCount: 0, annotationCount: 0 });
          }
        }
      ]
    );
  };

  // 顯示同步詳情
  const showSyncDetails = () => {
    const state = incrementalSyncManager.getSyncState();
    Alert.alert(
      '同步詳情',
      `狀態: ${syncStatus}\n` +
      `待同步項目: ${pendingChangesCount}\n` +
      `最後同步: ${lastSyncTime ? new Date(lastSyncTime).toLocaleString() : '從未同步'}\n` +
      `網絡狀態: ${isOnline ? '在線' : '離線'}\n` +
      `錯誤: ${error || '無'}`
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>增量同步測試</Text>

      {/* 同步狀態指示器 */}
      <View style={styles.statusSection}>
        <Text style={styles.sectionTitle}>同步狀態</Text>
        <SyncStatusIndicator showDetails={true} />
      </View>

      {/* 測試按鈕 */}
      <View style={styles.testSection}>
        <Text style={styles.sectionTitle}>測試功能</Text>

        <TouchableOpacity
          style={[styles.button, styles.addButton]}
          onPress={addTestCard}
          disabled={isOffline}
        >
          <Text style={styles.buttonText}>添加測試卡片</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.addButton]}
          onPress={addTestCollection}
          disabled={isOffline}
        >
          <Text style={styles.buttonText}>添加測試收藏</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.addButton]}
          onPress={addTestAnnotation}
          disabled={isOffline}
        >
          <Text style={styles.buttonText}>添加測試註釋</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.batchButton]}
          onPress={addBatchTestData}
          disabled={isOffline}
        >
          <Text style={styles.buttonText}>批量添加測試數據</Text>
        </TouchableOpacity>
      </View>

      {/* 控制按鈕 */}
      <View style={styles.controlSection}>
        <Text style={styles.sectionTitle}>同步控制</Text>

        <TouchableOpacity
          style={[styles.button, styles.syncButton]}
          onPress={forceSync}
          disabled={isSyncing || isOffline || !hasPendingChanges}
        >
          <Text style={styles.buttonText}>
            {isSyncing ? '同步中...' : '強制同步'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.detailsButton]}
          onPress={showSyncDetails}
        >
          <Text style={styles.buttonText}>查看詳情</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.clearButton]}
          onPress={clearAllPending}
          disabled={!hasPendingChanges}
        >
          <Text style={styles.buttonText}>清除所有待同步項目</Text>
        </TouchableOpacity>

        {hasError && (
          <TouchableOpacity
            style={[styles.button, styles.errorButton]}
            onPress={clearError}
          >
            <Text style={styles.buttonText}>清除錯誤</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* 統計信息 */}
      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>統計信息</Text>
        <Text style={styles.statsText}>已添加卡片: {testData.cardCount}</Text>
        <Text style={styles.statsText}>已添加收藏: {testData.collectionCount}</Text>
        <Text style={styles.statsText}>已添加註釋: {testData.annotationCount}</Text>
        <Text style={styles.statsText}>待同步項目: {pendingChangesCount}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333'
  },
  statusSection: {
    marginBottom: 20
  },
  testSection: {
    marginBottom: 20
  },
  controlSection: {
    marginBottom: 20
  },
  statsSection: {
    marginBottom: 20
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333'
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
    alignItems: 'center'
  },
  addButton: {
    backgroundColor: '#4caf50'
  },
  batchButton: {
    backgroundColor: '#2196f3'
  },
  syncButton: {
    backgroundColor: '#ff9800'
  },
  detailsButton: {
    backgroundColor: '#9c27b0'
  },
  clearButton: {
    backgroundColor: '#f44336'
  },
  errorButton: {
    backgroundColor: '#ff5722'
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600'
  },
  statsText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4
  }
});
