import {
  TaskDependencyManager,
  TaskStatus,
  TaskPriority,
  DependencyType,
  TaskExecutor
} from './taskDependencyManager';

// 測試用的任務執行器
const createTestExecutor = (name: string, shouldFail = false): TaskExecutor => ({
  execute: async (task) => {
    console.log(`[Test] 執行任務: ${name}`);

    // 模擬執行時間
    await new Promise(resolve => setTimeout(resolve, task.estimatedDuration));

    if (shouldFail) {
      throw new Error(`${name} 執行失敗`);
    }

    return { message: `${name} 執行成功`, timestamp: new Date().toISOString() };
  }
});

describe('TaskDependencyManager', () => {
  let taskManager: TaskDependencyManager;

  beforeEach(() => {
    taskManager = new TaskDependencyManager({
      maxConcurrentTasks: 2,
      enableParallelExecution: true,
      enableRetry: true,
      defaultRetryAttempts: 2,
      enableTimeout: true,
      defaultTimeout: 5000,
      enableDeadlockDetection: true,
      enableCircularDependencyCheck: true
    });
  });

  afterEach(() => {
    // 清理所有任務
    const tasks = taskManager.getAllTasks();
    tasks.forEach(task => taskManager.removeTask(task.id));
  });

  describe('基本任務管理', () => {
    test('應該能夠添加任務', () => {
      const taskId = taskManager.addTask({
        name: '測試任務',
        description: '這是一個測試任務',
        type: 'test',
        priority: TaskPriority.NORMAL,
        estimatedDuration: 1000,
        executor: createTestExecutor('測試任務')
      });

      expect(taskId).toBeDefined();

      const task = taskManager.getTask(taskId);
      expect(task).toBeDefined();
      expect(task?.name).toBe('測試任務');
      expect(task?.status).toBe(TaskStatus.PENDING);
    });

    test('應該能夠移除任務', () => {
      const taskId = taskManager.addTask({
        name: '測試任務',
        type: 'test',
        priority: TaskPriority.NORMAL,
        estimatedDuration: 1000,
        executor: createTestExecutor('測試任務')
      });

      const result = taskManager.removeTask(taskId);
      expect(result).toBe(true);

      const task = taskManager.getTask(taskId);
      expect(task).toBeUndefined();
    });

    test('應該能夠更新任務', () => {
      const taskId = taskManager.addTask({
        name: '原始任務',
        type: 'test',
        priority: TaskPriority.NORMAL,
        estimatedDuration: 1000,
        executor: createTestExecutor('測試任務')
      });

      const result = taskManager.updateTask(taskId, {
        name: '更新後的任務',
        priority: TaskPriority.HIGH
      });

      expect(result).toBe(true);

      const task = taskManager.getTask(taskId);
      expect(task?.name).toBe('更新後的任務');
      expect(task?.priority).toBe(TaskPriority.HIGH);
    });
  });

  describe('依賴關係管理', () => {
    test('應該能夠添加依賴關係', () => {
      const task1Id = taskManager.addTask({
        name: '任務1',
        type: 'test',
        priority: TaskPriority.NORMAL,
        estimatedDuration: 1000,
        executor: createTestExecutor('任務1')
      });

      const task2Id = taskManager.addTask({
        name: '任務2',
        type: 'test',
        priority: TaskPriority.NORMAL,
        estimatedDuration: 1000,
        executor: createTestExecutor('任務2')
      });

      const result = taskManager.addDependency(task2Id, {
        taskId: task1Id,
        type: DependencyType.REQUIRES
      });

      expect(result).toBe(true);

      const dependencies = taskManager.getTaskDependencies(task2Id);
      expect(dependencies).toHaveLength(1);
      expect(dependencies[0].taskId).toBe(task1Id);
      expect(dependencies[0].type).toBe(DependencyType.REQUIRES);
    });

    test('應該能夠移除依賴關係', () => {
      const task1Id = taskManager.addTask({
        name: '任務1',
        type: 'test',
        priority: TaskPriority.NORMAL,
        estimatedDuration: 1000,
        executor: createTestExecutor('任務1')
      });

      const task2Id = taskManager.addTask({
        name: '任務2',
        type: 'test',
        priority: TaskPriority.NORMAL,
        estimatedDuration: 1000,
        executor: createTestExecutor('任務2')
      });

      taskManager.addDependency(task2Id, {
        taskId: task1Id,
        type: DependencyType.REQUIRES
      });

      const result = taskManager.removeDependency(task2Id, task1Id);
      expect(result).toBe(true);

      const dependencies = taskManager.getTaskDependencies(task2Id);
      expect(dependencies).toHaveLength(0);
    });

    test('應該檢測循環依賴', () => {
      const task1Id = taskManager.addTask({
        name: '任務1',
        type: 'test',
        priority: TaskPriority.NORMAL,
        estimatedDuration: 1000,
        executor: createTestExecutor('任務1')
      });

      const task2Id = taskManager.addTask({
        name: '任務2',
        type: 'test',
        priority: TaskPriority.NORMAL,
        estimatedDuration: 1000,
        executor: createTestExecutor('任務2')
      });

      // 添加第一個依賴
      taskManager.addDependency(task2Id, {
        taskId: task1Id,
        type: DependencyType.REQUIRES
      });

      // 嘗試添加循環依賴
      const result = taskManager.addDependency(task1Id, {
        taskId: task2Id,
        type: DependencyType.REQUIRES
      });

      expect(result).toBe(false);
    });
  });

  describe('任務執行', () => {
    test('應該能夠執行簡單任務', async () => {
      const taskId = taskManager.addTask({
        name: '簡單任務',
        type: 'test',
        priority: TaskPriority.NORMAL,
        estimatedDuration: 100,
        executor: createTestExecutor('簡單任務')
      });

      // 開始執行
      const executionPromise = taskManager.startExecution();

      // 等待執行完成
      await new Promise(resolve => setTimeout(resolve, 200));

      const task = taskManager.getTask(taskId);
      expect(task?.status).toBe(TaskStatus.COMPLETED);
    }, 10000);

    test('應該能夠處理依賴關係', async () => {
      const task1Id = taskManager.addTask({
        name: '前置任務',
        type: 'test',
        priority: TaskPriority.NORMAL,
        estimatedDuration: 100,
        executor: createTestExecutor('前置任務')
      });

      const task2Id = taskManager.addTask({
        name: '後置任務',
        type: 'test',
        priority: TaskPriority.NORMAL,
        estimatedDuration: 100,
        executor: createTestExecutor('後置任務')
      });

      // 添加依賴關係
      taskManager.addDependency(task2Id, {
        taskId: task1Id,
        type: DependencyType.REQUIRES
      });

      // 開始執行
      const executionPromise = taskManager.startExecution();

      // 等待執行完成
      await new Promise(resolve => setTimeout(resolve, 300));

      const task1 = taskManager.getTask(task1Id);
      const task2 = taskManager.getTask(task2Id);

      expect(task1?.status).toBe(TaskStatus.COMPLETED);
      expect(task2?.status).toBe(TaskStatus.COMPLETED);
    }, 10000);

    test('應該能夠處理失敗任務', async () => {
      const taskId = taskManager.addTask({
        name: '失敗任務',
        type: 'test',
        priority: TaskPriority.NORMAL,
        estimatedDuration: 100,
        executor: createTestExecutor('失敗任務', true), // 設置為失敗
        maxRetries: 1
      });

      // 開始執行
      const executionPromise = taskManager.startExecution();

      // 等待執行完成
      await new Promise(resolve => setTimeout(resolve, 500));

      const task = taskManager.getTask(taskId);
      expect(task?.status).toBe(TaskStatus.FAILED);
      expect(task?.error).toContain('執行失敗');
    }, 10000);
  });

  describe('統計信息', () => {
    test('應該能夠獲取統計信息', () => {
      // 添加一些任務
      taskManager.addTask({
        name: '任務1',
        type: 'test',
        priority: TaskPriority.NORMAL,
        estimatedDuration: 1000,
        executor: createTestExecutor('任務1')
      });

      taskManager.addTask({
        name: '任務2',
        type: 'test',
        priority: TaskPriority.HIGH,
        estimatedDuration: 1000,
        executor: createTestExecutor('任務2')
      });

      const stats = taskManager.getStatistics();

      expect(stats.totalTasks).toBe(2);
      expect(stats.pendingTasks).toBe(2);
      expect(stats.runningTasks).toBe(0);
      expect(stats.completedTasks).toBe(0);
      expect(stats.failedTasks).toBe(0);
    });
  });

  describe('依賴圖', () => {
    test('應該能夠獲取依賴圖', () => {
      const task1Id = taskManager.addTask({
        name: '任務1',
        type: 'test',
        priority: TaskPriority.NORMAL,
        estimatedDuration: 1000,
        executor: createTestExecutor('任務1')
      });

      const task2Id = taskManager.addTask({
        name: '任務2',
        type: 'test',
        priority: TaskPriority.NORMAL,
        estimatedDuration: 1000,
        executor: createTestExecutor('任務2')
      });

      taskManager.addDependency(task2Id, {
        taskId: task1Id,
        type: DependencyType.REQUIRES
      });

      const graph = taskManager.getDependencyGraph();

      expect(graph.nodes).toHaveLength(2);
      expect(graph.edges).toHaveLength(1);
      expect(graph.edges[0].from).toBe(task1Id);
      expect(graph.edges[0].to).toBe(task2Id);
      expect(graph.edges[0].type).toBe(DependencyType.REQUIRES);
    });
  });

  describe('事件系統', () => {
    test('應該能夠監聽任務事件', (done) => {
      const events: string[] = [];

      taskManager.on('taskAdded', () => events.push('taskAdded'));
      taskManager.on('taskStarted', () => events.push('taskStarted'));
      taskManager.on('taskCompleted', () => events.push('taskCompleted'));

      const taskId = taskManager.addTask({
        name: '事件測試任務',
        type: 'test',
        priority: TaskPriority.NORMAL,
        estimatedDuration: 100,
        executor: createTestExecutor('事件測試任務')
      });

      // 開始執行
      taskManager.startExecution();

      // 等待事件觸發
      setTimeout(() => {
        expect(events).toContain('taskAdded');
        expect(events).toContain('taskStarted');
        expect(events).toContain('taskCompleted');
        done();
      }, 200);
    }, 10000);
  });

  describe('複雜工作流', () => {
    test('應該能夠處理複雜的依賴關係', async () => {
      // 創建一個複雜的工作流：A -> B, A -> C, B -> D, C -> D
      const taskA = taskManager.addTask({
        name: '任務A',
        type: 'test',
        priority: TaskPriority.HIGH,
        estimatedDuration: 100,
        executor: createTestExecutor('任務A')
      });

      const taskB = taskManager.addTask({
        name: '任務B',
        type: 'test',
        priority: TaskPriority.NORMAL,
        estimatedDuration: 100,
        executor: createTestExecutor('任務B')
      });

      const taskC = taskManager.addTask({
        name: '任務C',
        type: 'test',
        priority: TaskPriority.NORMAL,
        estimatedDuration: 100,
        executor: createTestExecutor('任務C')
      });

      const taskD = taskManager.addTask({
        name: '任務D',
        type: 'test',
        priority: TaskPriority.NORMAL,
        estimatedDuration: 100,
        executor: createTestExecutor('任務D')
      });

      // 建立依賴關係
      taskManager.addDependency(taskB, { taskId: taskA, type: DependencyType.REQUIRES });
      taskManager.addDependency(taskC, { taskId: taskA, type: DependencyType.REQUIRES });
      taskManager.addDependency(taskD, { taskId: taskB, type: DependencyType.REQUIRES });
      taskManager.addDependency(taskD, { taskId: taskC, type: DependencyType.REQUIRES });

      // 開始執行
      taskManager.startExecution();

      // 等待執行完成
      await new Promise(resolve => setTimeout(resolve, 500));

      // 驗證所有任務都已完成
      const allTasks = taskManager.getAllTasks();
      allTasks.forEach(task => {
        expect(task.status).toBe(TaskStatus.COMPLETED);
      });
    }, 10000);
  });
});

// 演示函數
export const demonstrateTaskDependencySystem = async () => {
  console.log('=== 任務依賴管理系統演示 ===');

  const taskManager = new TaskDependencyManager({
    maxConcurrentTasks: 3,
    enableParallelExecution: true,
    enableRetry: true,
    defaultRetryAttempts: 2,
    enableTimeout: true,
    defaultTimeout: 10000,
    enableDeadlockDetection: true,
    enableCircularDependencyCheck: true
  });

  // 設置事件監聽器
  taskManager.on('taskStarted', (data) => {
    console.log(`🚀 任務開始: ${data.taskId}`);
  });

  taskManager.on('taskCompleted', (data) => {
    console.log(`✅ 任務完成: ${data.taskId}`, data.result);
  });

  taskManager.on('taskFailed', (data) => {
    console.log(`❌ 任務失敗: ${data.taskId}`, data.error);
  });

  // 創建演示任務
  console.log('\n📋 創建演示任務...');

  const dataCollectionId = taskManager.addTask({
    name: '數據收集',
    description: '收集市場數據和價格信息',
    type: 'data_collection',
    priority: TaskPriority.HIGH,
    estimatedDuration: 2000,
    executor: createTestExecutor('數據收集')
  });

  const dataAnalysisId = taskManager.addTask({
    name: '數據分析',
    description: '分析收集到的數據',
    type: 'data_analysis',
    priority: TaskPriority.NORMAL,
    estimatedDuration: 3000,
    executor: createTestExecutor('數據分析')
  });

  const reportGenerationId = taskManager.addTask({
    name: '生成報告',
    description: '生成分析報告',
    type: 'report_generation',
    priority: TaskPriority.NORMAL,
    estimatedDuration: 1500,
    executor: createTestExecutor('生成報告')
  });

  const notificationId = taskManager.addTask({
    name: '發送通知',
    description: '發送完成通知',
    type: 'notification',
    priority: TaskPriority.LOW,
    estimatedDuration: 1000,
    executor: createTestExecutor('發送通知')
  });

  // 建立依賴關係
  console.log('\n🔗 建立依賴關係...');

  taskManager.addDependency(dataAnalysisId, {
    taskId: dataCollectionId,
    type: DependencyType.REQUIRES
  });

  taskManager.addDependency(reportGenerationId, {
    taskId: dataAnalysisId,
    type: DependencyType.REQUIRES
  });

  taskManager.addDependency(notificationId, {
    taskId: reportGenerationId,
    type: DependencyType.TRIGGERS
  });

  // 顯示依賴圖
  console.log('\n📊 依賴圖:');
  const graph = taskManager.getDependencyGraph();
  graph.nodes.forEach(node => {
    console.log(`  📦 ${node.name} (${node.status})`);
  });

  graph.edges.forEach(edge => {
    const fromNode = graph.nodes.find(n => n.id === edge.from);
    const toNode = graph.nodes.find(n => n.id === edge.to);
    console.log(`  🔗 ${fromNode?.name} -> ${toNode?.name} (${edge.type})`);
  });

  // 開始執行
  console.log('\n🚀 開始執行任務...');
  await taskManager.startExecution();

  // 顯示最終統計
  console.log('\n📈 執行統計:');
  const stats = taskManager.getStatistics();
  console.log(`  總任務數: ${stats.totalTasks}`);
  console.log(`  已完成: ${stats.completedTasks}`);
  console.log(`  失敗: ${stats.failedTasks}`);
  console.log(`  成功率: ${stats.successRate.toFixed(1)}%`);
  console.log(`  平均執行時間: ${stats.averageExecutionTime.toFixed(0)}ms`);

  console.log('\n✅ 演示完成！');
};
