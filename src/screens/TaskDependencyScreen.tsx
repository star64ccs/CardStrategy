import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Alert,
  TouchableOpacity,
  ScrollView
} from 'react-native';
import { TaskDependencyVisualizer } from '@/components/task/TaskDependencyVisualizer';
import { TaskProgressDisplay } from '@/components/task/TaskProgressDisplay';
import { TaskSyncDisplay } from '@/components/task/TaskSyncDisplay';
import { TaskEncryptionDisplay } from '@/components/task/TaskEncryptionDisplay';
import {
  TaskDependencyManager,
  TaskStatus,
  DependencyType,
  TaskPriority,
  TaskExecutor
} from '@/utils/taskDependencyManager';
import { logger } from '@/utils/logger';

export const TaskDependencyScreen: React.FC = () => {
  const [taskManager] = useState(() => new TaskDependencyManager({
    maxConcurrentTasks: 3,
    enableParallelExecution: true,
    enableRetry: true,
    defaultRetryAttempts: 2,
    enableTimeout: true,
    defaultTimeout: 10000,
    enableDeadlockDetection: true,
    enableCircularDependencyCheck: true
  }));

  const [demoTasksCreated, setDemoTasksCreated] = useState(false);
  const [activeTab, setActiveTab] = useState<'visualizer' | 'progress' | 'sync' | 'encryption'>('progress');

  useEffect(() => {
    // 設置事件監聽器
    const handleTaskEvent = (eventData: any) => {
      logger.info(`[Task Screen] 任務事件: ${JSON.stringify(eventData)}`);
    };

    taskManager.on('taskStarted', handleTaskEvent);
    taskManager.on('taskCompleted', handleTaskEvent);
    taskManager.on('taskFailed', handleTaskEvent);
    taskManager.on('dependencyAdded', handleTaskEvent);

    return () => {
      taskManager.off('taskStarted', handleTaskEvent);
      taskManager.off('taskCompleted', handleTaskEvent);
      taskManager.off('taskFailed', handleTaskEvent);
      taskManager.off('dependencyAdded', handleTaskEvent);
    };
  }, [taskManager]);

  const createDemoTasks = () => {
    if (demoTasksCreated) {
      Alert.alert('提示', '演示任務已存在');
      return;
    }

    try {
      // 創建演示任務
      const task1Id = taskManager.addTask({
        name: '數據收集',
        description: '收集市場數據和價格信息',
        type: 'data_collection',
        priority: TaskPriority.HIGH,
        estimatedDuration: 3000,
        executor: createDemoExecutor('數據收集')
      });

      const task2Id = taskManager.addTask({
        name: '數據分析',
        description: '分析收集到的數據',
        type: 'data_analysis',
        priority: TaskPriority.NORMAL,
        estimatedDuration: 5000,
        executor: createDemoExecutor('數據分析')
      });

      const task3Id = taskManager.addTask({
        name: '生成報告',
        description: '生成分析報告',
        type: 'report_generation',
        priority: TaskPriority.NORMAL,
        estimatedDuration: 2000,
        executor: createDemoExecutor('生成報告')
      });

      const task4Id = taskManager.addTask({
        name: '發送通知',
        description: '發送完成通知',
        type: 'notification',
        priority: TaskPriority.LOW,
        estimatedDuration: 1000,
        executor: createDemoExecutor('發送通知')
      });

      // 建立依賴關係
      taskManager.addDependency(task2Id, {
        taskId: task1Id,
        type: DependencyType.REQUIRES
      });

      taskManager.addDependency(task3Id, {
        taskId: task2Id,
        type: DependencyType.REQUIRES
      });

      taskManager.addDependency(task4Id, {
        taskId: task3Id,
        type: DependencyType.TRIGGERS
      });

      setDemoTasksCreated(true);
      Alert.alert('成功', '演示任務已創建');
    } catch (error) {
      Alert.alert('錯誤', `創建演示任務失敗: ${error}`);
    }
  };

  const createDemoExecutor = (taskName: string): TaskExecutor => {
    return {
      execute: async (task, progressTracker) => {
        logger.info(`[Demo Executor] 開始執行任務: ${taskName}`);

        const steps = [
          '初始化',
          '數據準備',
          '處理中',
          '驗證結果',
          '完成'
        ];

        for (let i = 0; i < steps.length; i++) {
          const step = steps[i];
          const percentage = ((i + 1) / steps.length) * 100;

          // 更新進度
          if (progressTracker) {
            progressTracker.updateProgress({
              percentage,
              currentStep: step,
              totalSteps: steps.length,
              currentStepIndex: i + 1,
              estimatedTimeRemaining: (task.estimatedDuration / steps.length) * (steps.length - i - 1)
            });
          }

          // 模擬步驟執行時間
          await new Promise(resolve => setTimeout(resolve, task.estimatedDuration / steps.length));
        }

        logger.info(`[Demo Executor] 任務完成: ${taskName}`);
        return {
          message: `${taskName} 執行成功`,
          timestamp: new Date().toISOString(),
          duration: task.estimatedDuration
        };
      }
    };
  };

  const clearAllTasks = () => {
    Alert.alert(
      '確認清除',
      '確定要清除所有任務嗎？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '確定',
          style: 'destructive',
          onPress: () => {
            const tasks = taskManager.getAllTasks();
            tasks.forEach(task => {
              taskManager.removeTask(task.id);
            });
            setDemoTasksCreated(false);
            Alert.alert('成功', '所有任務已清除');
          }
        }
      ]
    );
  };

  const handleTaskSelect = (taskId: string) => {
    const task = taskManager.getTask(taskId);
    if (task) {
      logger.info(`[Task Screen] 選中任務: ${task.name} (${task.status})`);
    }
  };

  const handleDependencyAdd = (fromTaskId: string, toTaskId: string, type: DependencyType) => {
    const fromTask = taskManager.getTask(fromTaskId);
    const toTask = taskManager.getTask(toTaskId);

    if (fromTask && toTask) {
      logger.info(`[Task Screen] 添加依賴: ${fromTask.name} -> ${toTask.name} (${type})`);
    }
  };

  const handleTaskStatusChange = (taskId: string, status: TaskStatus) => {
    const task = taskManager.getTask(taskId);
    if (task) {
      logger.info(`[Task Screen] 任務狀態變更: ${task.name} -> ${status}`);
    }
  };

  const getStatistics = () => {
    return taskManager.getStatistics();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>任務依賴管理系統</Text>
        <Text style={styles.subtitle}>管理和可視化任務依賴關係</Text>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.controlButton, styles.primaryButton]}
          onPress={createDemoTasks}
        >
          <Text style={styles.controlButtonText}>創建演示任務</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlButton, styles.dangerButton]}
          onPress={clearAllTasks}
        >
          <Text style={styles.controlButtonText}>清除所有任務</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'progress' && styles.activeTabButton]}
          onPress={() => setActiveTab('progress')}
        >
          <Text style={[styles.tabButtonText, activeTab === 'progress' && styles.activeTabButtonText]}>
            進度顯示
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'visualizer' && styles.activeTabButton]}
          onPress={() => setActiveTab('visualizer')}
        >
          <Text style={[styles.tabButtonText, activeTab === 'visualizer' && styles.activeTabButtonText]}>
            依賴圖
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'sync' && styles.activeTabButton]}
          onPress={() => setActiveTab('sync')}
        >
          <Text style={[styles.tabButtonText, activeTab === 'sync' && styles.activeTabButtonText]}>
            跨設備同步
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'encryption' && styles.activeTabButton]}
          onPress={() => setActiveTab('encryption')}
        >
          <Text style={[styles.tabButtonText, activeTab === 'encryption' && styles.activeTabButtonText]}>
            加密管理
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <Text style={styles.statsTitle}>實時統計</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{getStatistics().totalTasks}</Text>
            <Text style={styles.statLabel}>總任務</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{getStatistics().runningTasks}</Text>
            <Text style={styles.statLabel}>執行中</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{getStatistics().completedTasks}</Text>
            <Text style={styles.statLabel}>已完成</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{getStatistics().successRate.toFixed(1)}%</Text>
            <Text style={styles.statLabel}>成功率</Text>
          </View>
        </View>
      </View>

      <View style={styles.mainContentContainer}>
        {activeTab === 'progress' ? (
          <TaskProgressDisplay
            taskManager={taskManager}
            showDetails={true}
            showHistory={true}
            autoRefresh={true}
            refreshInterval={1000}
          />
        ) : activeTab === 'visualizer' ? (
          <TaskDependencyVisualizer
            taskManager={taskManager}
            onTaskSelect={handleTaskSelect}
            onDependencyAdd={handleDependencyAdd}
            onTaskStatusChange={handleTaskStatusChange}
          />
        ) : activeTab === 'sync' ? (
          <TaskSyncDisplay
            taskManager={taskManager}
            showDetails={true}
            autoRefresh={true}
            refreshInterval={5000}
          />
        ) : (
          <TaskEncryptionDisplay
            taskManager={taskManager}
            showDetails={true}
            autoRefresh={true}
            refreshInterval={5000}
          />
        )}
      </View>

      <View style={styles.helpContainer}>
        <Text style={styles.helpTitle}>使用說明</Text>
        <ScrollView style={styles.helpContent}>
          <Text style={styles.helpText}>
            • 點擊「創建演示任務」來創建示例任務和依賴關係{'\n'}
            • 使用可視化界面添加、編輯和管理任務{'\n'}
            • 任務狀態顏色說明：{'\n'}
            {'  '}🟠 待處理 (PENDING){'\n'}
            {'  '}🟢 準備就緒 (READY){'\n'}
            {'  '}🔵 執行中 (RUNNING){'\n'}
            {'  '}🟢 已完成 (COMPLETED){'\n'}
            {'  '}🔴 失敗 (FAILED){'\n'}
            {'  '}⚫ 已取消 (CANCELLED){'\n'}
            {'  '}🟡 已阻塞 (BLOCKED){'\n'}
            • 依賴類型說明：{'\n'}
            {'  '}🔴 REQUIRES: 必須依賴{'\n'}
            {'  '}🟢 OPTIONAL: 可選依賴{'\n'}
            {'  '}🟡 BLOCKS: 阻塞依賴{'\n'}
            {'  '}🔵 TRIGGERS: 觸發依賴{'\n'}
          </Text>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5'
  },
  header: {
    backgroundColor: '#2196F3',
    padding: 20,
    alignItems: 'center'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4
  },
  subtitle: {
    fontSize: 14,
    color: '#E3F2FD'
  },
  controls: {
    flexDirection: 'row',
    padding: 16,
    gap: 12
  },
  controlButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center'
  },
  primaryButton: {
    backgroundColor: '#4CAF50'
  },
  dangerButton: {
    backgroundColor: '#F44336'
  },
  controlButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600'
  },
  statsContainer: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333'
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  statCard: {
    alignItems: 'center',
    flex: 1
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2196F3'
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 4,
    elevation: 2
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center'
  },
  activeTabButton: {
    backgroundColor: '#2196F3'
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666'
  },
  activeTabButtonText: {
    color: '#FFFFFF'
  },
  mainContentContainer: {
    flex: 1,
    margin: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden'
  },
  helpContainer: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    maxHeight: 200
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333'
  },
  helpContent: {
    flex: 1
  },
  helpText: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18
  }
});
