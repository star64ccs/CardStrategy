import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';

import { logger } from '../../../core/utils/logger';
import { useSession } from '../hooks/useSession';

import { SessionManager } from './SessionManager';

export const SessionExample: React.FC = () => {
  const {
    currentSession,
    isSessionValid,
    isSessionLoading,
    sessionError,
    isRefreshing,
    refreshError,
    isTerminating,
    terminationError,
    create,
    refresh,
    terminate,
    clearSessionError,
    clearRefreshError,
    clearTerminationError,
  } = useSession({
    onSessionCreated: session => {
      Alert.alert('Success', `會話CreateSuccess: ${session.id}`);
    },
    onSessionRefreshed: session => {
      Alert.alert('Success', `會話刷新Success: ${session.id}`);
    },
    onSessionTerminated: () => {
      Alert.alert('Success', '會話已終止');
    },
    onSessionError: error => {
      Alert.alert('Error', error);
    },
  });

  const [showSessionManager, setShowSessionManager] = useState(false);

  const _handleCreateSession = async () => {
    try {
      await create(
        'user123',
        `access_token_${Date.now()}`,
        `refresh_token_${Date.now()}`,
        3600 // 1Hour
      );
    } catch (error: unknown) {
      logger.error('Create會話Failed:', error);
    }
  };

  const _handleRefreshSession = async () => {
    if (!currentSession) {
      Alert.alert('Error', '沒有當前會話');
      return;
    }

    try {
      await refresh({
        refreshToken: currentSession.refreshToken,
        deviceId: currentSession.deviceInfo.deviceId,
      });
    } catch (error: unknown) {
      logger.error('刷新會話Failed:', error);
    }
  };

  const _handleTerminateSession = async () => {
    if (!currentSession) {
      Alert.alert('Error', '沒有當前會話');
      return;
    }

    Alert.alert('終止會話', '確定要終止當前會話嗎？', [
      { text: '取消', style: 'cancel' },
      {
        text: '終止',
        style: 'destructive',
        onPress: async () => {
          try {
            await terminate({ reason: '用戶手動終止' });
          } catch (error: unknown) {
            logger.error('終止會話Failed:', error);
          }
        },
      },
    ]);
  };

  const _handleTerminateAllSessions = async () => {
    Alert.alert('終止所有會話', '確定要終止所有會話嗎？這將登出所有設備。', [
      { text: '取消', style: 'cancel' },
      {
        text: '終止',
        style: 'destructive',
        onPress: async () => {
          try {
            await terminate({ reason: '終止所有會話', forceTerminate: true });
          } catch (error: unknown) {
            logger.error('終止所有會話Failed:', error);
          }
        },
      },
    ]);
  };

  const _renderSessionInfo = () => {
    if (isSessionLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size='large' color='#007AFF' />
          <Text style={styles.loadingText}>加載會話信息...</Text>
        </View>
      );
    }

    if (!currentSession) {
      return (
        <View style={styles.noSessionContainer}>
          <Text style={styles.noSessionText}>沒有當前會話</Text>
          <TouchableOpacity
            style={styles.createButton}
            onPress={handleCreateSession}
          >
            <Text style={styles.createButtonText}>創建會話</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.sessionInfoContainer}>
        <Text style={styles.sessionTitle}>當前會話信息</Text>

        <View style={styles.sessionDetail}>
          <Text style={styles.detailLabel}>會話 ID:</Text>
          <Text style={styles.detailValue}>{currentSession.id}</Text>
        </View>

        <View style={styles.sessionDetail}>
          <Text style={styles.detailLabel}>用戶 ID:</Text>
          <Text style={styles.detailValue}>{currentSession.userId}</Text>
        </View>

        <View style={styles.sessionDetail}>
          <Text style={styles.detailLabel}>設備:</Text>
          <Text style={styles.detailValue}>
            {currentSession.deviceInfo.deviceName ||
              currentSession.deviceInfo.deviceModel}
          </Text>
        </View>

        <View style={styles.sessionDetail}>
          <Text style={styles.detailLabel}>平台:</Text>
          <Text style={styles.detailValue}>
            {currentSession.deviceInfo.platform}{' '}
            {currentSession.deviceInfo.platformVersion}
          </Text>
        </View>

        <View style={styles.sessionDetail}>
          <Text style={styles.detailLabel}>位置:</Text>
          <Text style={styles.detailValue}>
            {currentSession.locationInfo?.country || '未知'}
          </Text>
        </View>

        <View style={styles.sessionDetail}>
          <Text style={styles.detailLabel}>創建時間:</Text>
          <Text style={styles.detailValue}>
            {currentSession.createdAt.toLocaleString()}
          </Text>
        </View>

        <View style={styles.sessionDetail}>
          <Text style={styles.detailLabel}>最後活動:</Text>
          <Text style={styles.detailValue}>
            {currentSession.lastActiveAt.toLocaleString()}
          </Text>
        </View>

        <View style={styles.sessionDetail}>
          <Text style={styles.detailLabel}>過期時間:</Text>
          <Text style={styles.detailValue}>
            {currentSession.expiresAt.toLocaleString()}
          </Text>
        </View>

        <View style={styles.sessionDetail}>
          <Text style={styles.detailLabel}>狀態:</Text>
          <Text
            style={[
              styles.detailValue,
              { color: isSessionValid ? '#4CAF50' : '#F44336' },
            ]}
          >
            {isSessionValid ? '有效' : '已過期'}
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.refreshButton,
              isRefreshing && styles.disabledButton,
            ]}
            onPress={handleRefreshSession}
            disabled={isRefreshing || !isSessionValid}
          >
            {isRefreshing ? (
              <ActivityIndicator size='small' color='#fff' />
            ) : (
              <Text style={styles.actionButtonText}>刷新會話</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.terminateButton,
              isTerminating && styles.disabledButton,
            ]}
            onPress={handleTerminateSession}
            disabled={isTerminating}
          >
            {isTerminating ? (
              <ActivityIndicator size='small' color='#fff' />
            ) : (
              <Text style={styles.actionButtonText}>終止會話</Text>
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[
            styles.actionButton,
            styles.terminateAllButton,
            isTerminating && styles.disabledButton,
          ]}
          onPress={handleTerminateAllSessions}
          disabled={isTerminating}
        >
          <Text style={styles.actionButtonText}>終止所有會話</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const _renderErrors = () => {
    const _errors = [sessionError, refreshError, terminationError].filter(
      Boolean
    );

    if (errors.length === 0) return null;

    return (
      <View style={styles.errorsContainer}>
        <Text style={styles.errorsTitle}>錯誤信息</Text>
        {errors.map((error, index) => (
          <View key={index} style={styles.errorItem}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              style={styles.clearErrorButton}
              onPress={() => {
                clearSessionError();
                clearRefreshError();
                clearTerminationError();
              }}
            >
              <Text style={styles.clearErrorButtonText}>清除</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>會話管理示例</Text>

      {renderSessionInfo()}
      {renderErrors()}

      <View style={styles.managerContainer}>
        <View style={styles.managerHeader}>
          <Text style={styles.managerTitle}>會話管理器</Text>
          <TouchableOpacity
            style={styles.toggleButton}
            onPress={() => setShowSessionManager(!showSessionManager)}
          >
            <Text style={styles.toggleButtonText}>
              {showSessionManager ? '隱藏' : '顯示'}
            </Text>
          </TouchableOpacity>
        </View>

        {showSessionManager && (
          <View style={styles.managerContent}>
            <SessionManager
              showHeader={false}
              onSessionTerminated={sessionId => {
                Alert.alert('會話終止', `會話 ${sessionId} 已終止`);
              }}
              onError={error => {
                Alert.alert('Error', error);
              }}
            />
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const _styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
    color: '#333',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
  },
  noSessionContainer: {
    padding: 20,
    alignItems: 'center',
  },
  noSessionText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  createButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  sessionInfoContainer: {
    backgroundColor: '#fff',
    margin: 15,
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  sessionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
    textAlign: 'center',
  },
  sessionDetail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    flex: 1,
    textAlign: 'right',
    marginLeft: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 10,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  refreshButton: {
    backgroundColor: '#4CAF50',
  },
  terminateButton: {
    backgroundColor: '#FF9800',
  },
  terminateAllButton: {
    backgroundColor: '#F44336',
    marginTop: 10,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  errorsContainer: {
    backgroundColor: '#fff',
    margin: 15,
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  errorsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F44336',
    marginBottom: 10,
  },
  errorItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  errorText: {
    fontSize: 14,
    color: '#F44336',
    flex: 1,
  },
  clearErrorButton: {
    backgroundColor: '#F44336',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    marginLeft: 10,
  },
  clearErrorButtonText: {
    color: '#fff',
    fontSize: 12,
  },
  managerContainer: {
    backgroundColor: '#fff',
    margin: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  managerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  managerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  toggleButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  toggleButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  managerContent: {
    height: 400,
  },
});

export default SessionExample;
