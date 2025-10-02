// 離線模式支持
class OfflineMode {
  constructor() {
    this.isOnline = navigator.onLine;
    this.queue = [];
    this.setupEventListeners();
  }

  setupEventListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.processQueue();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  // 添加到離線隊列
  addToQueue(operation) {
    this.queue.push({
      ...operation,
      timestamp: Date.now()
    });
  }

  // 處理離線隊列
  async processQueue() {
    if (!this.isOnline || this.queue.length === 0) {
      return;
    }

    const operations = [...this.queue];
    this.queue = [];

    for (const operation of operations) {
      try {
        await this.executeOperation(operation);
      } catch (error) {
        console.error('離線操作執行失敗:', error);
        this.queue.push(operation);
      }
    }
  }

  // 執行操作
  async executeOperation(operation) {
    const { type, data, url, method } = operation;
    
    switch (type) {
      case 'API_CALL':
        return await this.executeAPICall(url, method, data);
      case 'FILE_UPLOAD':
        return await this.executeFileUpload(data);
      default:
        throw new Error('未知操作類型');
    }
  }

  // 執行 API 調用
  async executeAPICall(url, method, data) {
    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: data ? JSON.stringify(data) : undefined
    });

    if (!response.ok) {
      throw new Error(`API 調用失敗: ${response.status}`);
    }

    return response.json();
  }

  // 執行文件上傳
  async executeFileUpload(data) {
    const formData = new FormData();
    formData.append('file', data.file);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error(`文件上傳失敗: ${response.status}`);
    }

    return response.json();
  }
}

export default new OfflineMode();
