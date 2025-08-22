import {
  TaskDependencyManager,
  TaskStatus,
  TaskPriority,
  DependencyType,
  TaskExecutor,
  ProgressUpdate,
} from './taskDependencyManager';

const createProgressTestExecutor = (
  name: string,
  steps: string[] = ['初始化', '處理中', '完成']
): TaskExecutor => ({
  execute: async (task, progressTracker) => {
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      const percentage = ((i + 1) / steps.length) * 100;

      if (progressTracker) {
        progressTracker.updateProgress({
          percentage,
          currentStep: step,
          totalSteps: steps.length,
          currentStepIndex: i + 1,
          estimatedTimeRemaining:
            (task.estimatedDuration / steps.length) * (steps.length - i - 1),
        });
      }

      // 模擬步驟執行時間
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    return { message: `${name} 執行成功` };
  },
});

describe('TaskDependencyManager 進度追蹤', () => {
  let taskManager: TaskDependencyManager;

  beforeEach(() => {
    taskManager = new TaskDependencyManager({
      maxConcurrentTasks: 2,
      enableParallelExecution: true,
      enableRetry: false,
      enableTimeout: false,
    });
  });

  afterEach(() => {
    // 清理所有任務
    const tasks = taskManager.getAllTasks();
    tasks.forEach((task) => taskManager.removeTask(task.id));
  });

  describe('進度追蹤基本功能', () => {
    test('應該能夠創建進度追蹤器', () => {
      const taskId = taskManager.addTask({
        name: '測試任務',
        type: 'test',
        priority: TaskPriority.NORMAL,
        estimatedDuration: 1000,
        executor: createProgressTestExecutor('測試任務'),
      });

      const progress = taskManager.getTaskProgress(taskId);
      expect(progress).toBeUndefined(); // 任務尚未開始執行
    });

    test('應該能夠獲取任務進度', async () => {
      const taskId = taskManager.addTask({
        name: '進度測試任務',
        type: 'progress_test',
        priority: TaskPriority.NORMAL,
        estimatedDuration: 1000,
        executor: createProgressTestExecutor('進度測試任務'),
      });

      // 開始執行任務
      taskManager.startExecution();

      // 等待任務開始執行
      await new Promise((resolve) => setTimeout(resolve, 150));

      const progress = taskManager.getTaskProgress(taskId);
      expect(progress).toBeDefined();
      expect(progress!.percentage).toBeGreaterThan(0);
      expect(progress!.currentStep).toBeDefined();
      expect(progress!.totalSteps).toBe(3);
    });

    test('應該能夠獲取進度歷史', async () => {
      const taskId = taskManager.addTask({
        name: '歷史測試任務',
        type: 'history_test',
        priority: TaskPriority.NORMAL,
        estimatedDuration: 1000,
        executor: createProgressTestExecutor('歷史測試任務'),
      });

      // 開始執行任務
      taskManager.startExecution();

      // 等待任務完成
      await new Promise((resolve) => setTimeout(resolve, 500));

      const history = taskManager.getTaskProgressHistory(taskId);
      expect(history.length).toBeGreaterThan(0);
      expect(history[0].taskId).toBe(taskId);
      expect(history[history.length - 1].percentage).toBe(100);
    });
  });

  describe('進度摘要功能', () => {
    test('應該能夠獲取進度摘要', () => {
      // 添加多個任務
      taskManager.addTask({
        name: '任務1',
        type: 'test',
        priority: TaskPriority.NORMAL,
        estimatedDuration: 1000,
        executor: createProgressTestExecutor('任務1'),
      });

      taskManager.addTask({
        name: '任務2',
        type: 'test',
        priority: TaskPriority.HIGH,
        estimatedDuration: 1000,
        executor: createProgressTestExecutor('任務2'),
      });

      const summary = taskManager.getProgressSummary();
      expect(summary.totalTasks).toBe(2);
      expect(summary.pendingTasks).toBe(2);
      expect(summary.runningTasks).toBe(0);
      expect(summary.completedTasks).toBe(0);
      expect(summary.failedTasks).toBe(0);
      expect(summary.overallProgress).toBe(0);
      expect(summary.averageProgress).toBe(0);
    });

    test('應該能夠計算正確的整體進度', async () => {
      // 添加任務
      taskManager.addTask({
        name: '任務1',
        type: 'test',
        priority: TaskPriority.NORMAL,
        estimatedDuration: 1000,
        executor: createProgressTestExecutor('任務1'),
      });

      taskManager.addTask({
        name: '任務2',
        type: 'test',
        priority: TaskPriority.NORMAL,
        estimatedDuration: 1000,
        executor: createProgressTestExecutor('任務2'),
      });

      // 開始執行
      taskManager.startExecution();

      // 等待部分完成
      await new Promise((resolve) => setTimeout(resolve, 200));

      const summary = taskManager.getProgressSummary();
      expect(summary.totalTasks).toBe(2);
      expect(summary.runningTasks).toBeGreaterThan(0);
      expect(summary.overallProgress).toBeGreaterThan(0);
    });
  });

  describe('進度事件系統', () => {
    test('應該能夠監聽進度更新事件', (done) => {
      const taskId = taskManager.addTask({
        name: '事件測試任務',
        type: 'event_test',
        priority: TaskPriority.NORMAL,
        estimatedDuration: 1000,
        executor: createProgressTestExecutor('事件測試任務'),
      });

      let progressUpdateCount = 0;

      taskManager.on('taskProgressUpdate', (data) => {
        expect(data.taskId).toBe(taskId);
        expect(data.progress).toBeDefined();
        expect(data.progress.percentage).toBeGreaterThan(0);
        progressUpdateCount++;

        if (progressUpdateCount >= 3) {
          done();
        }
      });

      taskManager.startExecution();
    });

    test('應該能夠監聽進度完成事件', (done) => {
      const taskId = taskManager.addTask({
        name: '完成事件測試任務',
        type: 'complete_event_test',
        priority: TaskPriority.NORMAL,
        estimatedDuration: 1000,
        executor: createProgressTestExecutor('完成事件測試任務'),
      });

      taskManager.on('taskProgressComplete', (data) => {
        expect(data.taskId).toBe(taskId);
        done();
      });

      taskManager.startExecution();
    });

    test('應該能夠監聽進度失敗事件', (done) => {
      const failingExecutor: TaskExecutor = {
        execute: async (task, progressTracker) => {
          if (progressTracker) {
            progressTracker.updateProgress({
              percentage: 50,
              currentStep: '處理中',
              totalSteps: 2,
              currentStepIndex: 1,
            });
          }
          throw new Error('模擬失敗');
        },
      };

      const taskId = taskManager.addTask({
        name: '失敗事件測試任務',
        type: 'fail_event_test',
        priority: TaskPriority.NORMAL,
        estimatedDuration: 1000,
        executor: failingExecutor,
      });

      taskManager.on('taskProgressFailed', (data) => {
        expect(data.taskId).toBe(taskId);
        expect(data.error).toBe('模擬失敗');
        done();
      });

      taskManager.startExecution();
    });
  });

  describe('進度廣播功能', () => {
    test('應該能夠廣播進度更新', (done) => {
      taskManager.addTask({
        name: '廣播測試任務',
        type: 'broadcast_test',
        priority: TaskPriority.NORMAL,
        estimatedDuration: 1000,
        executor: createProgressTestExecutor('廣播測試任務'),
      });

      let broadcastCount = 0;

      taskManager.on('progressBroadcast', (data) => {
        expect(data.summary).toBeDefined();
        expect(data.runningTasks).toBeDefined();
        broadcastCount++;

        if (broadcastCount >= 2) {
          done();
        }
      });

      taskManager.startExecution();
    });

    test('應該能夠控制廣播間隔', (done) => {
      // 停止默認廣播
      taskManager.stopProgressBroadcast();

      // 設置較短的廣播間隔
      taskManager.startProgressBroadcast(100);

      taskManager.addTask({
        name: '間隔測試任務',
        type: 'interval_test',
        priority: TaskPriority.NORMAL,
        estimatedDuration: 1000,
        executor: createProgressTestExecutor('間隔測試任務'),
      });

      let broadcastCount = 0;

      taskManager.on('progressBroadcast', (data) => {
        broadcastCount++;

        if (broadcastCount >= 3) {
          done();
        }
      });

      taskManager.startExecution();
    });
  });

  describe('複雜進度場景', () => {
    test('應該能夠處理多個並行任務的進度', async () => {
      const taskIds = [];

      // 添加多個任務
      for (let i = 0; i < 3; i++) {
        const taskId = taskManager.addTask({
          name: `並行任務 ${i + 1}`,
          type: 'parallel_test',
          priority: TaskPriority.NORMAL,
          estimatedDuration: 1000,
          executor: createProgressTestExecutor(`並行任務 ${i + 1}`),
        });
        taskIds.push(taskId);
      }

      // 開始執行
      taskManager.startExecution();

      // 等待一段時間
      await new Promise((resolve) => setTimeout(resolve, 300));

      // 檢查所有任務的進度
      taskIds.forEach((taskId) => {
        const progress = taskManager.getTaskProgress(taskId);
        expect(progress).toBeDefined();
        expect(progress!.percentage).toBeGreaterThan(0);
      });

      const summary = taskManager.getProgressSummary();
      expect(summary.runningTasks).toBeGreaterThan(0);
    });

    test('應該能夠處理依賴任務的進度', async () => {
      // 創建依賴任務
      const task1Id = taskManager.addTask({
        name: '依賴任務1',
        type: 'dependency_test',
        priority: TaskPriority.NORMAL,
        estimatedDuration: 1000,
        executor: createProgressTestExecutor('依賴任務1'),
      });

      const task2Id = taskManager.addTask({
        name: '依賴任務2',
        type: 'dependency_test',
        priority: TaskPriority.NORMAL,
        estimatedDuration: 1000,
        executor: createProgressTestExecutor('依賴任務2'),
      });

      // 添加依賴關係
      taskManager.addDependency(task2Id, {
        taskId: task1Id,
        type: DependencyType.REQUIRES,
      });

      // 開始執行
      taskManager.startExecution();

      // 等待第一個任務完成
      await new Promise((resolve) => setTimeout(resolve, 500));

      const progress1 = taskManager.getTaskProgress(task1Id);
      const progress2 = taskManager.getTaskProgress(task2Id);

      expect(progress1).toBeDefined();
      expect(progress2).toBeUndefined(); // 第二個任務應該還沒開始
    });
  });

  describe('進度數據驗證', () => {
    test('進度百分比應該在0-100範圍內', async () => {
      const taskId = taskManager.addTask({
        name: '百分比測試任務',
        type: 'percentage_test',
        priority: TaskPriority.NORMAL,
        estimatedDuration: 1000,
        executor: createProgressTestExecutor('百分比測試任務'),
      });

      taskManager.startExecution();

      // 等待任務完成
      await new Promise((resolve) => setTimeout(resolve, 500));

      const history = taskManager.getTaskProgressHistory(taskId);
      history.forEach((update) => {
        expect(update.percentage).toBeGreaterThanOrEqual(0);
        expect(update.percentage).toBeLessThanOrEqual(100);
      });
    });

    test('進度步驟索引應該正確', async () => {
      const taskId = taskManager.addTask({
        name: '步驟索引測試任務',
        type: 'step_index_test',
        priority: TaskPriority.NORMAL,
        estimatedDuration: 1000,
        executor: createProgressTestExecutor('步驟索引測試任務', [
          '步驟1',
          '步驟2',
          '步驟3',
        ]),
      });

      taskManager.startExecution();

      // 等待任務完成
      await new Promise((resolve) => setTimeout(resolve, 500));

      const history = taskManager.getTaskProgressHistory(taskId);
      expect(history.length).toBeGreaterThan(0);

      // 檢查最後一個更新應該是100%
      const lastUpdate = history[history.length - 1];
      expect(lastUpdate.percentage).toBe(100);
      expect(lastUpdate.currentStepIndex).toBe(3);
      expect(lastUpdate.totalSteps).toBe(3);
    });
  });
});

// 控制台演示函數
export const demonstrateProgressTracking = async () => {
  const taskManager = new TaskDependencyManager({
    maxConcurrentTasks: 2,
    enableParallelExecution: true,
    enableRetry: false,
    enableTimeout: false,
  });

  // 設置事件監聽器
  taskManager.on('taskProgressUpdate', (data) => {
    console.log(
      `任務進度更新: ${data.progress.percentage}% - ${data.progress.currentStep}`
    );
  });

  taskManager.on('taskProgressComplete', (data) => {
    console.log(`任務完成: ${data.task.name}`);
  });

  taskManager.on('progressBroadcast', (data) => {
    console.log(
      `進度廣播: 總進度 ${data.summary.overallProgress}%, 執行中任務 ${data.summary.runningTasks} 個`
    );
  });

  // 創建演示任務
  const task1Id = taskManager.addTask({
    name: '數據收集',
    type: 'data_collection',
    priority: TaskPriority.HIGH,
    estimatedDuration: 3000,
    executor: createProgressTestExecutor('數據收集', [
      '初始化連接',
      '收集數據',
      '驗證數據',
      '保存結果',
    ]),
  });

  const task2Id = taskManager.addTask({
    name: '數據分析',
    type: 'data_analysis',
    priority: TaskPriority.NORMAL,
    estimatedDuration: 4000,
    executor: createProgressTestExecutor('數據分析', [
      '載入數據',
      '預處理',
      '分析計算',
      '生成報告',
      '完成',
    ]),
  });

  const task3Id = taskManager.addTask({
    name: '結果通知',
    type: 'notification',
    priority: TaskPriority.LOW,
    estimatedDuration: 1000,
    executor: createProgressTestExecutor('結果通知', ['準備通知', '發送通知']),
  });

  // 添加依賴關係
  taskManager.addDependency(task2Id, {
    taskId: task1Id,
    type: DependencyType.REQUIRES,
  });
  taskManager.addDependency(task3Id, {
    taskId: task2Id,
    type: DependencyType.REQUIRES,
  });

  // 開始執行
  taskManager.startExecution();

  // 監控進度
  const monitorProgress = setInterval(() => {
    const summary = taskManager.getProgressSummary();
    console.log(`總進度: ${summary.overallProgress}%`);

    if (summary.completedTasks === summary.totalTasks) {
      clearInterval(monitorProgress);
      // 顯示最終統計
      const finalSummary = taskManager.getProgressSummary();
      console.log(`最終進度: ${finalSummary.overallProgress}%`);
      console.log(
        `完成任務: ${finalSummary.completedTasks}/${finalSummary.totalTasks}`
      );

      // 顯示進度歷史
      [task1Id, task2Id, task3Id].forEach((taskId) => {
        const task = taskManager.getTask(taskId);
        const history = taskManager.getTaskProgressHistory(taskId);
        console.log(`任務 ${task.name} 歷史記錄: ${history.length} 條`);
      });
    }
  }, 1000);

  // 等待所有任務完成
  await new Promise((resolve) => setTimeout(resolve, 10000));
};
