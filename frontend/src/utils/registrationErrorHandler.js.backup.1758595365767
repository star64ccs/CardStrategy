// 註冊錯誤處理
class RegistrationErrorHandler {
  constructor() {
    this.errorMessages = {
      // 網絡錯誤
      networkError: '網絡連接失敗，請檢查網絡後重試',
      timeoutError: '請求超時，請重試',
      
      // 驗證錯誤
      validationError: '請檢查輸入信息是否正確',
      usernameExists: '用戶名已存在，請選擇其他用戶名',
      emailExists: '郵箱已被註冊，請使用其他郵箱',
      weakPassword: '密碼強度不足，請包含大小寫字母、數字和特殊字符',
      
      // 服務器錯誤
      serverError: '服務器暫時不可用，請稍後再試',
      databaseError: '數據庫連接失敗，請重試',
      
      // 其他錯誤
      unknownError: '發生未知錯誤，請聯繫客服'
    };
  }

  // 處理錯誤
  handleError(error, context = {}) {
    console.error('註冊錯誤:', error);

    const errorInfo = this.parseError(error);
    const message = this.getErrorMessage(errorInfo);
    const action = this.getSuggestedAction(errorInfo);

    return {
      success: false,
      error: {
        code: errorInfo.code,
        message,
        action,
        retryable: errorInfo.retryable,
        timestamp: new Date().toISOString()
      },
      context: {
        step: context.step,
        field: context.field,
        userId: context.userId
      }
    };
  }

  // 解析錯誤
  parseError(error) {
    // 網絡錯誤
    if (error.code === 'NETWORK_ERROR' || error.message.includes('fetch')) {
      return {
        code: 'NETWORK_ERROR',
        retryable: true,
        severity: 'high'
      };
    }

    // 超時錯誤
    if (error.code === 'TIMEOUT' || error.message.includes('timeout')) {
      return {
        code: 'TIMEOUT_ERROR',
        retryable: true,
        severity: 'medium'
      };
    }

    // 驗證錯誤
    if (error.status === 400 && error.message.includes('validation')) {
      return {
        code: 'VALIDATION_ERROR',
        retryable: false,
        severity: 'low'
      };
    }

    // 用戶名已存在
    if (error.status === 409 && error.message.includes('username')) {
      return {
        code: 'USERNAME_EXISTS',
        retryable: false,
        severity: 'low'
      };
    }

    // 郵箱已存在
    if (error.status === 409 && error.message.includes('email')) {
      return {
        code: 'EMAIL_EXISTS',
        retryable: false,
        severity: 'low'
      };
    }

    // 服務器錯誤
    if (error.status >= 500) {
      return {
        code: 'SERVER_ERROR',
        retryable: true,
        severity: 'high'
      };
    }

    // 默認錯誤
    return {
      code: 'UNKNOWN_ERROR',
      retryable: true,
      severity: 'medium'
    };
  }

  // 獲取錯誤信息
  getErrorMessage(errorInfo) {
    return this.errorMessages[errorInfo.code] || this.errorMessages.unknownError;
  }

  // 獲取建議操作
  getSuggestedAction(errorInfo) {
    const actions = {
      NETWORK_ERROR: '檢查網絡連接',
      TIMEOUT_ERROR: '稍後重試',
      VALIDATION_ERROR: '修正輸入信息',
      USERNAME_EXISTS: '選擇其他用戶名',
      EMAIL_EXISTS: '使用其他郵箱',
      SERVER_ERROR: '聯繫客服',
      UNKNOWN_ERROR: '重試或聯繫客服'
    };
    return actions[errorInfo.code] || '重試';
  }

  // 生成錯誤報告
  generateErrorReport(error, context) {
    return {
      timestamp: new Date().toISOString(),
      error: {
        message: error.message,
        code: error.code,
        stack: error.stack
      },
      context: {
        userAgent: navigator.userAgent,
        url: window.location.href,
        step: context.step,
        field: context.field
      },
      severity: this.parseError(error).severity
    };
  }
}

export default new RegistrationErrorHandler();
