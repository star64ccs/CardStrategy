// 自動保存功能
class AutoSave {
  constructor() {
    this.saveInterval = 30000; // 30秒
    this.maxRetries = 3;
    this.retryDelay = 5000; // 5秒
  }

  // 開始自動保存
  startAutoSave(formData, saveFunction) {
    const interval = setInterval(async () => {
      try {
        await this.saveFormData(formData, saveFunction);
      } catch (error) {
        console.warn('自動保存失敗:', error);
      }
    }, this.saveInterval);

    return () => clearInterval(interval);
  }

  // 保存表單數據
  async saveFormData(formData, saveFunction) {
    const data = this.prepareData(formData);
    
    if (!this.hasChanges(data)) {
      return;
    }

    let retries = 0;
    while (retries < this.maxRetries) {
      try {
        await saveFunction(data);
        this.updateLastSaved();
        break;
      } catch (error) {
        retries++;
        if (retries < this.maxRetries) {
          await this.delay(this.retryDelay);
        } else {
          throw error;
        }
      }
    }
  }

  // 準備數據
  prepareData(formData) {
    return {
      ...formData,
      timestamp: Date.now(),
      autoSave: true
    };
  }

  // 檢查是否有變化
  hasChanges(data) {
    const lastSaved = this.getLastSaved();
    if (!lastSaved) return true;

    return JSON.stringify(data) !== JSON.stringify(lastSaved);
  }

  // 獲取上次保存的數據
  getLastSaved() {
    try {
      const saved = localStorage.getItem('registration_autosave');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  }

  // 更新最後保存時間
  updateLastSaved() {
    localStorage.setItem('registration_lastSaved', Date.now().toString());
  }

  // 獲取最後保存時間
  getLastSavedTime() {
    const timestamp = localStorage.getItem('registration_lastSaved');
    return timestamp ? new Date(parseInt(timestamp)) : null;
  }

  // 清理自動保存數據
  clearAutoSave() {
    localStorage.removeItem('registration_autosave');
    localStorage.removeItem('registration_lastSaved');
  }

  // 恢復自動保存數據
  restoreAutoSave() {
    const saved = this.getLastSaved();
    if (saved) {
      const lastSaved = this.getLastSavedTime();
      const hoursAgo = (Date.now() - (lastSaved?.getTime() || 0)) / (1000 * 60 * 60);
      
      if (hoursAgo < 24) { // 24小時內
        return saved;
      }
    }
    return null;
  }

  // 延遲函數
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default new AutoSave();
