import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions
} from 'react-native';
import { logger } from '@/utils/logger';
import {
  TaskDependencyManager,
  Task,
  TaskStatus,
  ProgressUpdate
} from '@/utils/taskDependencyManager';

interface TaskProgressDisplayProps {
  taskManager?: TaskDependencyManager;
  showDetails?: boolean;
  showHistory?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface ProgressSummary {
  totalTasks: number;
  completedTasks: number;
  runningTasks: number;
  pendingTasks: number;
  failedTasks: number;
  overallProgress: number;
  averageProgress: number;
}

const { width: screenWidth } = Dimensions.get('window');

export const TaskProgressDisplay: React.FC<TaskProgressDisplayProps> = ({
  taskManager,
  showDetails = true,
  showHistory = false,
  autoRefresh = true,
  refreshInterval = 1000
}) => {
  const [progressSummary, setProgressSummary] = useState<ProgressSummary>({
    totalTasks: 0,
    completedTasks: 0,
    runningTasks: 0,
    pendingTasks: 0,
    failedTasks: 0,
    overallProgress: 0,
    averageProgress: 0
  });
  const [runningTasks, setRunningTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [progressAnimations] = useState(new Map<string, Animated.Value>());

  const manager = taskManager || require('@/utils/taskDependencyManager').taskDependencyManager;

  useEffect(() => {
    loadProgressData();

    if (autoRefresh) {
      const interval = setInterval(loadProgressData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [manager, autoRefresh, refreshInterval]);

  useEffect(() => {
    // 設置事件監聽器
    const handleProgressUpdate = (data: { taskId: string; progress: ProgressUpdate }) => {
      updateTaskProgress(data.taskId, data.progress);
    };

    const handleProgressBroadcast = (data: { summary: ProgressSummary; runningTasks: any[] }) => {
      setProgressSummary(data.summary);
      setRunningTasks(data.runningTasks);
    };

    const handleTaskUpdate = () => {
      loadProgressData();
    };

    manager.on('taskProgressUpdate', handleProgressUpdate);
    manager.on('progressBroadcast', handleProgressBroadcast);
    manager.on('taskCompleted', handleTaskUpdate);
    manager.on('taskFailed', handleTaskUpdate);
    manager.on('taskAdded', handleTaskUpdate);
    manager.on('taskRemoved', handleTaskUpdate);

    return () => {
      manager.off('taskProgressUpdate', handleProgressUpdate);
      manager.off('progressBroadcast', handleProgressBroadcast);
      manager.off('taskCompleted', handleTaskUpdate);
      manager.off('taskFailed', handleTaskUpdate);
      manager.off('taskAdded', handleTaskUpdate);
      manager.off('taskRemoved', handleTaskUpdate);
    };
  }, [manager]);

  const loadProgressData = useCallback(() => {
    try {
      const summary = manager.getProgressSummary();
      setProgressSummary(summary);

      const allTasks = manager.getAllTasks();
      const running = allTasks.filter(t => t.status === TaskStatus.RUNNING);
      setRunningTasks(running);
    } catch (error) {
      logger.error('[TaskProgressDisplay] 載入進度數據失敗:', error);
    }
  }, [manager]);

  const updateTaskProgress = useCallback((taskId: string, progress: ProgressUpdate) => {
    // 創建或更新動畫值
    if (!progressAnimations.has(taskId)) {
      progressAnimations.set(taskId, new Animated.Value(0));
    }

    const animation = progressAnimations.get(taskId)!;
    Animated.timing(animation, {
      toValue: progress.percentage,
      duration: 300,
      useNativeDriver: false
    }).start();
  }, [progressAnimations]);

  const getStatusColor = (status: TaskStatus): string => {
    switch (status) {
      case TaskStatus.COMPLETED: return '#4CAF50';
      case TaskStatus.RUNNING: return '#2196F3';
      case TaskStatus.FAILED: return '#F44336';
      case TaskStatus.PENDING: return '#FF9800';
      case TaskStatus.READY: return '#9C27B0';
      case TaskStatus.BLOCKED: return '#607D8B';
      case TaskStatus.CANCELLED: return '#9E9E9E';
      default: return '#757575';
    }
  };

  const formatDuration = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    }
    return `${seconds}s`;

  };

  const renderOverallProgress = () => (
    <View style={styles.overallProgressContainer}>
      <Text style={styles.overallProgressTitle}>整體進度</Text>
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBarBackground}>
          <Animated.View
            style={[
              styles.progressBarFill,
              {
                width: `${progressSummary.overallProgress}%`,
                backgroundColor: progressSummary.overallProgress === 100 ? '#4CAF50' : '#2196F3'
              }
            ]}
          />
        </View>
        <Text style={styles.progressText}>{progressSummary.overallProgress.toFixed(1)}%</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>總任務</Text>
          <Text style={styles.statValue}>{progressSummary.totalTasks}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>已完成</Text>
          <Text style={[styles.statValue, { color: '#4CAF50' }]}>{progressSummary.completedTasks}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>執行中</Text>
          <Text style={[styles.statValue, { color: '#2196F3' }]}>{progressSummary.runningTasks}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>等待中</Text>
          <Text style={[styles.statValue, { color: '#FF9800' }]}>{progressSummary.pendingTasks}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>失敗</Text>
          <Text style={[styles.statValue, { color: '#F44336' }]}>{progressSummary.failedTasks}</Text>
        </View>
      </View>
    </View>
  );

  const renderTaskProgress = (task: Task) => {
    const {progress} = task;
    const isSelected = selectedTask === task.id;

    return (
      <TouchableOpacity
        key={task.id}
        style={[styles.taskProgressItem, isSelected && styles.selectedTask]}
        onPress={() => setSelectedTask(isSelected ? null : task.id)}
      >
        <View style={styles.taskHeader}>
          <Text style={styles.taskName} numberOfLines={1}>{task.name}</Text>
          <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(task.status) }]} />
        </View>

        {progress && (
          <View style={styles.taskProgressDetails}>
            <View style={styles.progressBarContainer}>
              <View style={styles.progressBarBackground}>
                <Animated.View
                  style={[
                    styles.progressBarFill,
                    {
                      width: `${progress.percentage}%`,
                      backgroundColor: progress.percentage === 100 ? '#4CAF50' : '#2196F3'
                    }
                  ]}
                />
              </View>
              <Text style={styles.progressText}>{progress.percentage.toFixed(1)}%</Text>
            </View>

            <Text style={styles.currentStepText}>{progress.currentStep}</Text>

            {showDetails && (
              <View style={styles.taskDetails}>
                <Text style={styles.detailText}>
                  步驟: {progress.currentStepIndex}/{progress.totalSteps}
                </Text>
                {progress.estimatedTimeRemaining && (
                  <Text style={styles.detailText}>
                    剩餘時間: {formatDuration(progress.estimatedTimeRemaining)}
                  </Text>
                )}
                {task.startedAt && (
                  <Text style={styles.detailText}>
                    開始時間: {task.startedAt.toLocaleTimeString()}
                  </Text>
                )}
              </View>
            )}
          </View>
        )}

        {isSelected && showHistory && (
          <View style={styles.taskHistory}>
            <Text style={styles.historyTitle}>進度歷史</Text>
            {manager.getTaskProgressHistory(task.id).map((update, index) => (
              <View key={index} style={styles.historyItem}>
                <Text style={styles.historyTime}>
                  {update.timestamp.toLocaleTimeString()}
                </Text>
                <Text style={styles.historyProgress}>
                  {update.percentage.toFixed(1)}% - {update.currentStep}
                </Text>
              </View>
            ))}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {renderOverallProgress()}

      {runningTasks.length > 0 && (
        <View style={styles.runningTasksContainer}>
          <Text style={styles.sectionTitle}>執行中的任務 ({runningTasks.length})</Text>
          <ScrollView style={styles.tasksList} showsVerticalScrollIndicator={false}>
            {runningTasks.map(renderTaskProgress)}
          </ScrollView>
        </View>
      )}

      {progressSummary.totalTasks === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>暫無任務</Text>
          <Text style={styles.emptyStateSubtext}>添加任務後將顯示進度</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16
  },
  overallProgressContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  overallProgressTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333'
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  progressBarBackground: {
    flex: 1,
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginRight: 8
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    minWidth: 50,
    textAlign: 'right'
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap'
  },
  statItem: {
    alignItems: 'center',
    minWidth: 60
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333'
  },
  runningTasksContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333'
  },
  tasksList: {
    maxHeight: 400
  },
  taskProgressItem: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3'
  },
  selectedTask: {
    backgroundColor: '#e3f2fd',
    borderLeftColor: '#1976d2'
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  taskName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    flex: 1
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8
  },
  taskProgressDetails: {
    marginTop: 8
  },
  currentStepText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4
  },
  taskDetails: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0'
  },
  detailText: {
    fontSize: 11,
    color: '#888',
    marginBottom: 2
  },
  taskHistory: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0'
  },
  historyTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4
  },
  historyTime: {
    fontSize: 10,
    color: '#888'
  },
  historyProgress: {
    fontSize: 10,
    color: '#666',
    flex: 1,
    textAlign: 'right'
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40
  },
  emptyStateText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 8
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999'
  }
});
