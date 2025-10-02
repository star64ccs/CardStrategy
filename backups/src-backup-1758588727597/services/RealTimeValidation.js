// 實時驗證服務
class RealTimeValidation {
  constructor() {
    this.validationRules = {
      username: {
        required: true,
        minLength: 3,
        maxLength: 20,
        pattern: /^[a-zA-Z0-9_]+$/,
        async: true
      },
      email: {
        required: true,
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        async: true
      },
      password: {
        required: true,
        minLength: 8,
        pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        async: false
      },
      confirmPassword: {
        required: true,
        match: 'password',
        async: false
      }
    };
  }

  // 驗證單個字段
  async validateField(fieldName, value, formData = {}) {
    const rule = this.validationRules[fieldName];
    if (!rule) return { valid: true, message: '' };

    const result = { valid: true, message: '', loading: false };

    // 必填驗證
    if (rule.required && (!value || value.trim() === '')) {
      result.valid = false;
      result.message = '此字段為必填項';
      return result;
    }

    // 長度驗證
    if (rule.minLength && value.length < rule.minLength) {
      result.valid = false;
      result.message = `至少需要 ${rule.minLength} 個字符`;
      return result;
    }

    if (rule.maxLength && value.length > rule.maxLength) {
      result.valid = false;
      result.message = `不能超過 ${rule.maxLength} 個字符`;
      return result;
    }

    // 格式驗證
    if (rule.pattern && !rule.pattern.test(value)) {
      result.valid = false;
      result.message = this.getPatternMessage(fieldName);
      return result;
    }

    // 匹配驗證
    if (rule.match && value !== formData[rule.match]) {
      result.valid = false;
      result.message = '密碼不匹配';
      return result;
    }

    // 異步驗證
    if (rule.async && value) {
      result.loading = true;
      try {
        const asyncResult = await this.validateAsync(fieldName, value);
        result.valid = asyncResult.valid;
        result.message = asyncResult.message;
        result.loading = false;
      } catch (error) {
        result.valid = false;
        result.message = '驗證服務暫時不可用';
        result.loading = false;
      }
    }

    return result;
  }

  // 異步驗證
  async validateAsync(fieldName, value) {
    switch (fieldName) {
      case 'username':
        return await this.validateUsername(value);
      case 'email':
        return await this.validateEmail(value);
      default:
        return { valid: true, message: '' };
    }
  }

  // 驗證用戶名
  async validateUsername(username) {
    try {
      const response = await fetch('/api/auth/check-username', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username })
      });

      const result = await response.json();
      
      if (result.exists) {
        return { valid: false, message: '用戶名已存在' };
      }
      
      return { valid: true, message: '用戶名可用' };
    } catch (error) {
      return { valid: false, message: '無法驗證用戶名' };
    }
  }

  // 驗證郵箱
  async validateEmail(email) {
    try {
      const response = await fetch('/api/auth/check-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const result = await response.json();
      
      if (result.exists) {
        return { valid: false, message: '郵箱已被註冊' };
      }
      
      return { valid: true, message: '郵箱可用' };
    } catch (error) {
      return { valid: false, message: '無法驗證郵箱' };
    }
  }

  // 獲取格式錯誤信息
  getPatternMessage(fieldName) {
    const messages = {
      username: '用戶名只能包含字母、數字和下劃線',
      email: '請輸入有效的郵箱地址',
      password: '密碼必須包含大小寫字母、數字和特殊字符'
    };
    return messages[fieldName] || '格式不正確';
  }

  // 驗證整個表單
  async validateForm(formData) {
    const results = {};
    let isValid = true;

    for (const [fieldName, value] of Object.entries(formData)) {
      const result = await this.validateField(fieldName, value, formData);
      results[fieldName] = result;
      if (!result.valid) {
        isValid = false;
      }
    }

    return { isValid, results };
  }
}

export default new RealTimeValidation();
