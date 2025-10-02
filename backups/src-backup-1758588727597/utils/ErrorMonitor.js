// 錯誤監控工具
class ErrorMonitor {
  constructor(options = {}) {
    this.endpoint = options.endpoint || '/api/errors';
    this.errors = [];
  }

  captureError(errorData) {
    const error = {
      ...errorData,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent
    };

    this.errors.push(error);
    this.sendError(error);
  }

  async sendError(error) {
    try {
      await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(error)
      });
    } catch (err) {
      console.error('發送錯誤報告失敗:', err);
    }
  }
}

export default ErrorMonitor;
