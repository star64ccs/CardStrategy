class ErrorTracker {
  constructor() {
    this.errors = [];
    this.maxErrors = 1000;
  }

  trackError(error, context = {}) {
    const errorInfo = {
      timestamp: new Date().toISOString(),
      message: error.message,
      stack: error.stack,
      context,
      type: error.constructor.name,
    };

    this.errors.push(errorInfo);

    // 保持錯誤數量在限制內
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(-this.maxErrors);
    }

    // 記錄到控制台
    // console.error('Error tracked:', errorInfo);
  }

  getErrors(limit = 50) {
    return this.errors.slice(-limit);
  }

  getErrorStats() {
    const errorTypes = {};
    this.errors.forEach((error) => {
      errorTypes[error.type] = (errorTypes[error.type] || 0) + 1;
    });

    return {
      total: this.errors.length,
      byType: errorTypes,
      recent: this.errors.slice(-10),
    };
  }

  clearErrors() {
    this.errors = [];
  }
}

export default new ErrorTracker();
