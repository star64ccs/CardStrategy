// 網絡狀態監控
class NetworkMonitoring {
  constructor() {
    this.status = {
      online: navigator.onLine,
      latency: 0,
      bandwidth: 0,
      quality: 'unknown'
    };
    this.listeners = [];
    this.startMonitoring();
  }

  // 開始監控
  startMonitoring() {
    // 監聽網絡狀態變化
    window.addEventListener('online', () => this.updateStatus({ online: true }));
    window.addEventListener('offline', () => this.updateStatus({ online: false }));

    // 定期測量延遲
    setInterval(() => this.measureLatency(), 30000);
  }

  // 測量延遲
  async measureLatency() {
    if (!this.status.online) return;

    const start = Date.now();
    try {
      await fetch('/api/ping', { method: 'HEAD' });
      const latency = Date.now() - start;
      this.updateStatus({ latency });
    } catch (error) {
      console.warn('延遲測量失敗:', error);
    }
  }

  // 更新狀態
  updateStatus(updates) {
    this.status = { ...this.status, ...updates };
    this.notifyListeners();
  }

  // 通知監聽器
  notifyListeners() {
    this.listeners.forEach(listener => listener(this.status));
  }

  // 添加狀態監聽器
  addListener(listener) {
    this.listeners.push(listener);
  }

  // 移除狀態監聽器
  removeListener(listener) {
    const index = this.listeners.indexOf(listener);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  // 獲取當前狀態
  getStatus() {
    return { ...this.status };
  }
}

export default new NetworkMonitoring();
