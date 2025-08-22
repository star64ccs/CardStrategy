import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  Switch,
  Dimensions,
} from 'react-native';
import { logger } from '@/utils/logger';
import {
  TaskDependencyManager,
  Task,
  TaskStatus,
  TaskPriority,
  DependencyType,
  TaskExecutor,
} from '@/utils/taskDependencyManager';

interface TaskDependencyVisualizerProps {
  taskManager?: TaskDependencyManager;
  onTaskSelect?: (taskId: string) => void;
  onDependencyAdd?: (
    fromTaskId: string,
    toTaskId: string,
    type: DependencyType
  ) => void;
  onTaskStatusChange?: (taskId: string, status: TaskStatus) => void;
}

interface TaskNode {
  id: string;
  name: string;
  status: TaskStatus;
  priority: TaskPriority;
  x: number;
  y: number;
}

interface TaskEdge {
  from: string;
  to: string;
  type: DependencyType;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const TaskDependencyVisualizer: React.FC<
  TaskDependencyVisualizerProps
> = ({ taskManager, onTaskSelect, onDependencyAdd, onTaskStatusChange }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [dependencyGraph, setDependencyGraph] = useState<{
    nodes: {
      id: string;
      name: string;
      status: TaskStatus;
      priority: TaskPriority;
    }[];
    edges: { from: string; to: string; type: DependencyType }[];
  }>({ nodes: [], edges: [] });
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [showAddDependencyModal, setShowAddDependencyModal] = useState(false);
  const [newTask, setNewTask] = useState({
    name: '',
    description: '',
    type: '',
    priority: TaskPriority.NORMAL,
    estimatedDuration: 5000,
  });
  const [newDependency, setNewDependency] = useState({
    fromTaskId: '',
    toTaskId: '',
    type: DependencyType.REQUIRES,
  });
  const [statistics, setStatistics] = useState<any>({});

  // 使用默認的任務管理器
  const manager =
    taskManager ||
    require('@/utils/taskDependencyManager').taskDependencyManager;

  useEffect(() => {
    loadTasks();
    loadStatistics();

    // 設置事件監聽器
    const handleTaskUpdate = () => {
      loadTasks();
      loadStatistics();
    };

    manager.on('taskAdded', handleTaskUpdate);
    manager.on('taskUpdated', handleTaskUpdate);
    manager.on('taskCompleted', handleTaskUpdate);
    manager.on('taskFailed', handleTaskUpdate);
    manager.on('dependencyAdded', handleTaskUpdate);
    manager.on('dependencyRemoved', handleTaskUpdate);

    return () => {
      manager.off('taskAdded', handleTaskUpdate);
      manager.off('taskUpdated', handleTaskUpdate);
      manager.off('taskCompleted', handleTaskUpdate);
      manager.off('taskFailed', handleTaskUpdate);
      manager.off('dependencyAdded', handleTaskUpdate);
      manager.off('dependencyRemoved', handleTaskUpdate);
    };
  }, [manager]);

  const loadTasks = useCallback(() => {
    const allTasks = manager.getAllTasks();
    setTasks(allTasks);

    const graph = manager.getDependencyGraph();
    setDependencyGraph(graph);
  }, [manager]);

  const loadStatistics = useCallback(() => {
    const stats = manager.getStatistics();
    setStatistics(stats);
  }, [manager]);

  const handleAddTask = () => {
    if (!newTask.name.trim()) {
      Alert.alert('錯誤', '請輸入任務名稱');
      return;
    }

    try {
      // 創建一個簡單的執行器
      const executor: TaskExecutor = {
        execute: async (task: Task) => {
          // 模擬任務執行
          await new Promise((resolve) =>
            setTimeout(resolve, task.estimatedDuration)
          );
          return { message: `任務 ${task.name} 執行完成` };
        },
      };

      const taskId = manager.addTask({
        ...newTask,
        executor,
        dependencies: [],
        estimatedDuration: newTask.estimatedDuration,
      });

      setNewTask({
        name: '',
        description: '',
        type: '',
        priority: TaskPriority.NORMAL,
        estimatedDuration: 5000,
      });
      setShowAddTaskModal(false);

      logger.info(`[Task Visualizer] 新任務已添加: ${taskId}`);
    } catch (error) {
      Alert.alert('錯誤', `添加任務失敗: ${error}`);
    }
  };

  const handleAddDependency = () => {
    if (!newDependency.fromTaskId || !newDependency.toTaskId) {
      Alert.alert('錯誤', '請選擇依賴的任務');
      return;
    }

    if (newDependency.fromTaskId === newDependency.toTaskId) {
      Alert.alert('錯誤', '任務不能依賴自己');
      return;
    }

    try {
      const success = manager.addDependency(newDependency.toTaskId, {
        taskId: newDependency.fromTaskId,
        type: newDependency.type,
      });

      if (success) {
        setNewDependency({
          fromTaskId: '',
          toTaskId: '',
          type: DependencyType.REQUIRES,
        });
        setShowAddDependencyModal(false);
        onDependencyAdd?.(
          newDependency.fromTaskId,
          newDependency.toTaskId,
          newDependency.type
        );
      } else {
        Alert.alert('錯誤', '添加依賴關係失敗');
      }
    } catch (error) {
      Alert.alert('錯誤', `添加依賴關係失敗: ${error}`);
    }
  };

  const handleTaskAction = (taskId: string, action: string) => {
    const task = manager.getTask(taskId);
    if (!task) return;

    try {
      switch (action) {
        case 'start':
          if (task.status === TaskStatus.READY) {
            // 任務會自動開始執行
            logger.info(`[Task Visualizer] 任務 ${taskId} 準備執行`);
          }
          break;
        case 'pause':
          manager.pauseTask(taskId);
          break;
        case 'resume':
          manager.resumeTask(taskId);
          break;
        case 'cancel':
          manager.cancelTask(taskId);
          break;
        case 'remove':
          manager.removeTask(taskId);
          break;
      }
      onTaskStatusChange?.(taskId, task.status);
    } catch (error) {
      Alert.alert('錯誤', `操作失敗: ${error}`);
    }
  };

  const getStatusColor = (status: TaskStatus): string => {
    switch (status) {
      case TaskStatus.PENDING:
        return '#FFA500';
      case TaskStatus.READY:
        return '#4CAF50';
      case TaskStatus.RUNNING:
        return '#2196F3';
      case TaskStatus.COMPLETED:
        return '#4CAF50';
      case TaskStatus.FAILED:
        return '#F44336';
      case TaskStatus.CANCELLED:
        return '#9E9E9E';
      case TaskStatus.BLOCKED:
        return '#FF9800';
      default:
        return '#9E9E9E';
    }
  };

  const getPriorityColor = (priority: TaskPriority): string => {
    switch (priority) {
      case TaskPriority.CRITICAL:
        return '#F44336';
      case TaskPriority.HIGH:
        return '#FF9800';
      case TaskPriority.NORMAL:
        return '#2196F3';
      case TaskPriority.LOW:
        return '#4CAF50';
      default:
        return '#9E9E9E';
    }
  };

  const getDependencyTypeColor = (type: DependencyType): string => {
    switch (type) {
      case DependencyType.REQUIRES:
        return '#F44336';
      case DependencyType.OPTIONAL:
        return '#4CAF50';
      case DependencyType.BLOCKS:
        return '#FF9800';
      case DependencyType.TRIGGERS:
        return '#2196F3';
      default:
        return '#9E9E9E';
    }
  };

  const renderTaskNode = (task: Task) => {
    const isSelected = selectedTask === task.id;

    return (
      <TouchableOpacity
        key={task.id}
        style={[
          styles.taskNode,
          {
            borderColor: isSelected ? '#2196F3' : getStatusColor(task.status),
            borderWidth: isSelected ? 3 : 2,
            backgroundColor: isSelected ? '#E3F2FD' : '#FFFFFF',
          },
        ]}
        onPress={() => {
          setSelectedTask(task.id);
          onTaskSelect?.(task.id);
        }}
      >
        <View style={styles.taskHeader}>
          <Text style={styles.taskName} numberOfLines={1}>
            {task.name}
          </Text>
          <View
            style={[
              styles.priorityBadge,
              { backgroundColor: getPriorityColor(task.priority) },
            ]}
          >
            <Text style={styles.priorityText}>{task.priority}</Text>
          </View>
        </View>

        <Text style={styles.taskStatus} numberOfLines={1}>
          狀態: {task.status}
        </Text>

        {task.description && (
          <Text style={styles.taskDescription} numberOfLines={2}>
            {task.description}
          </Text>
        )}

        <View style={styles.taskFooter}>
          <Text style={styles.taskDuration}>
            {task.estimatedDuration / 1000}s
          </Text>
          <Text style={styles.taskDependencies}>
            依賴: {task.dependencies.length}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderDependencyEdge = (edge: TaskEdge) => {
    const fromTask = tasks.find((t) => t.id === edge.from);
    const toTask = tasks.find((t) => t.id === edge.to);

    if (!fromTask || !toTask) return null;

    return (
      <View
        key={`${edge.from}-${edge.to}`}
        style={[
          styles.dependencyEdge,
          {
            borderColor: getDependencyTypeColor(edge.type),
            borderWidth: 2,
          },
        ]}
      >
        <Text
          style={[
            styles.edgeLabel,
            { color: getDependencyTypeColor(edge.type) },
          ]}
        >
          {edge.type}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* 統計信息 */}
      <View style={styles.statisticsContainer}>
        <Text style={styles.statisticsTitle}>任務統計</Text>
        <View style={styles.statisticsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{statistics.totalTasks || 0}</Text>
            <Text style={styles.statLabel}>總任務</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {statistics.runningTasks || 0}
            </Text>
            <Text style={styles.statLabel}>執行中</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {statistics.completedTasks || 0}
            </Text>
            <Text style={styles.statLabel}>已完成</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{statistics.failedTasks || 0}</Text>
            <Text style={styles.statLabel}>失敗</Text>
          </View>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {statistics.successRate?.toFixed(1) || 0}%
          </Text>
          <Text style={styles.statLabel}>成功率</Text>
        </View>
      </View>

      {/* 操作按鈕 */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => setShowAddTaskModal(true)}
        >
          <Text style={styles.actionButtonText}>添加任務</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => setShowAddDependencyModal(true)}
        >
          <Text style={styles.actionButtonText}>添加依賴</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => manager.startExecution()}
        >
          <Text style={styles.actionButtonText}>開始執行</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => manager.stopExecution()}
        >
          <Text style={styles.actionButtonText}>停止執行</Text>
        </TouchableOpacity>
      </View>

      {/* 任務圖表 */}
      <ScrollView style={styles.graphContainer} horizontal>
        <ScrollView style={styles.graphContent}>
          <View style={styles.graphArea}>
            {/* 依賴邊 */}
            {dependencyGraph.edges.map(renderDependencyEdge)}

            {/* 任務節點 */}
            {tasks.map(renderTaskNode)}
          </View>
        </ScrollView>
      </ScrollView>

      {/* 選中任務的操作 */}
      {selectedTask && (
        <View style={styles.selectedTaskActions}>
          <Text style={styles.selectedTaskTitle}>
            選中任務: {tasks.find((t) => t.id === selectedTask)?.name}
          </Text>
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.smallActionButton}
              onPress={() => handleTaskAction(selectedTask, 'start')}
            >
              <Text style={styles.smallActionButtonText}>開始</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.smallActionButton}
              onPress={() => handleTaskAction(selectedTask, 'pause')}
            >
              <Text style={styles.smallActionButtonText}>暫停</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.smallActionButton}
              onPress={() => handleTaskAction(selectedTask, 'resume')}
            >
              <Text style={styles.smallActionButtonText}>恢復</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.smallActionButton}
              onPress={() => handleTaskAction(selectedTask, 'cancel')}
            >
              <Text style={styles.smallActionButtonText}>取消</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.smallActionButton}
              onPress={() => handleTaskAction(selectedTask, 'remove')}
            >
              <Text style={styles.smallActionButtonText}>移除</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* 添加任務模態框 */}
      <Modal
        visible={showAddTaskModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddTaskModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>添加新任務</Text>

            <TextInput
              style={styles.input}
              placeholder="任務名稱"
              value={newTask.name}
              onChangeText={(text) => setNewTask({ ...newTask, name: text })}
            />

            <TextInput
              style={styles.input}
              placeholder="任務描述"
              value={newTask.description}
              onChangeText={(text) =>
                setNewTask({ ...newTask, description: text })
              }
              multiline
            />

            <TextInput
              style={styles.input}
              placeholder="任務類型"
              value={newTask.type}
              onChangeText={(text) => setNewTask({ ...newTask, type: text })}
            />

            <View style={styles.priorityContainer}>
              <Text style={styles.priorityLabel}>優先級:</Text>
              {Object.values(TaskPriority).map((priority) => (
                <TouchableOpacity
                  key={priority}
                  style={[
                    styles.priorityOption,
                    newTask.priority === priority &&
                      styles.priorityOptionSelected,
                  ]}
                  onPress={() => setNewTask({ ...newTask, priority })}
                >
                  <Text style={styles.priorityOptionText}>{priority}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={styles.input}
              placeholder="預估執行時間 (毫秒)"
              value={String(newTask.estimatedDuration)}
              onChangeText={(text) =>
                setNewTask({
                  ...newTask,
                  estimatedDuration: parseInt(text) || 5000,
                })
              }
              keyboardType="numeric"
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setShowAddTaskModal(false)}
              >
                <Text style={styles.modalButtonText}>取消</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonPrimary]}
                onPress={handleAddTask}
              >
                <Text
                  style={[
                    styles.modalButtonText,
                    styles.modalButtonTextPrimary,
                  ]}
                >
                  添加
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 添加依賴模態框 */}
      <Modal
        visible={showAddDependencyModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddDependencyModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>添加依賴關係</Text>

            <View style={styles.dependencyContainer}>
              <Text style={styles.dependencyLabel}>從任務:</Text>
              <ScrollView style={styles.taskList}>
                {tasks.map((task) => (
                  <TouchableOpacity
                    key={task.id}
                    style={[
                      styles.taskOption,
                      newDependency.fromTaskId === task.id &&
                        styles.taskOptionSelected,
                    ]}
                    onPress={() =>
                      setNewDependency({
                        ...newDependency,
                        fromTaskId: task.id,
                      })
                    }
                  >
                    <Text style={styles.taskOptionText}>{task.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.dependencyContainer}>
              <Text style={styles.dependencyLabel}>到任務:</Text>
              <ScrollView style={styles.taskList}>
                {tasks.map((task) => (
                  <TouchableOpacity
                    key={task.id}
                    style={[
                      styles.taskOption,
                      newDependency.toTaskId === task.id &&
                        styles.taskOptionSelected,
                    ]}
                    onPress={() =>
                      setNewDependency({ ...newDependency, toTaskId: task.id })
                    }
                  >
                    <Text style={styles.taskOptionText}>{task.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.dependencyTypeContainer}>
              <Text style={styles.dependencyLabel}>依賴類型:</Text>
              {Object.values(DependencyType).map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.dependencyTypeOption,
                    newDependency.type === type &&
                      styles.dependencyTypeOptionSelected,
                  ]}
                  onPress={() => setNewDependency({ ...newDependency, type })}
                >
                  <Text style={styles.dependencyTypeOptionText}>{type}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setShowAddDependencyModal(false)}
              >
                <Text style={styles.modalButtonText}>取消</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonPrimary]}
                onPress={handleAddDependency}
              >
                <Text
                  style={[
                    styles.modalButtonText,
                    styles.modalButtonTextPrimary,
                  ]}
                >
                  添加
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  statisticsContainer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    margin: 8,
    borderRadius: 8,
    elevation: 2,
  },
  statisticsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  statisticsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  actionsContainer: {
    flexDirection: 'row',
    padding: 8,
    gap: 8,
  },
  actionButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    flex: 1,
  },
  actionButtonText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: '600',
  },
  graphContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    margin: 8,
    borderRadius: 8,
  },
  graphContent: {
    flex: 1,
  },
  graphArea: {
    minWidth: screenWidth * 2,
    minHeight: screenHeight * 1.5,
    padding: 20,
  },
  taskNode: {
    position: 'absolute',
    width: 150,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  taskName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  priorityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 4,
  },
  priorityText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  taskStatus: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  taskDescription: {
    fontSize: 11,
    color: '#888',
    marginBottom: 8,
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  taskDuration: {
    fontSize: 10,
    color: '#666',
  },
  taskDependencies: {
    fontSize: 10,
    color: '#666',
  },
  dependencyEdge: {
    position: 'absolute',
    height: 2,
    backgroundColor: 'transparent',
  },
  edgeLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: -8,
  },
  selectedTaskActions: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    margin: 8,
    borderRadius: 8,
    elevation: 2,
  },
  selectedTaskTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  smallActionButton: {
    backgroundColor: '#E0E0E0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    flex: 1,
  },
  smallActionButtonText: {
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 6,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  priorityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  priorityLabel: {
    fontSize: 16,
    marginRight: 12,
    color: '#333',
  },
  priorityOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    marginRight: 8,
    backgroundColor: '#E0E0E0',
  },
  priorityOptionSelected: {
    backgroundColor: '#2196F3',
  },
  priorityOptionText: {
    fontSize: 12,
    color: '#333',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 16,
  },
  modalButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
    backgroundColor: '#E0E0E0',
  },
  modalButtonPrimary: {
    backgroundColor: '#2196F3',
  },
  modalButtonText: {
    fontSize: 16,
    color: '#333',
  },
  modalButtonTextPrimary: {
    color: '#FFFFFF',
  },
  dependencyContainer: {
    marginBottom: 16,
  },
  dependencyLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  taskList: {
    maxHeight: 120,
  },
  taskOption: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 6,
    marginBottom: 4,
  },
  taskOptionSelected: {
    backgroundColor: '#E3F2FD',
    borderColor: '#2196F3',
  },
  taskOptionText: {
    fontSize: 14,
    color: '#333',
  },
  dependencyTypeContainer: {
    marginBottom: 16,
  },
  dependencyTypeOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    marginBottom: 4,
    backgroundColor: '#E0E0E0',
  },
  dependencyTypeOptionSelected: {
    backgroundColor: '#2196F3',
  },
  dependencyTypeOptionText: {
    fontSize: 14,
    color: '#333',
  },
});
