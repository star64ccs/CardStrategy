// 電子郵件驗證
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// 密碼驗證
export const validatePassword = (password: string): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('密碼至少需要 8 個字元');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('密碼需要包含至少一個大寫字母');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('密碼需要包含至少一個小寫字母');
  }

  if (!/\d/.test(password)) {
    errors.push('密碼需要包含至少一個數字');
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('密碼需要包含至少一個特殊字元');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// 用戶名驗證
export const validateUsername = (username: string): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  if (username.length < 3) {
    errors.push('用戶名至少需要 3 個字元');
  }

  if (username.length > 20) {
    errors.push('用戶名不能超過 20 個字元');
  }

  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    errors.push('用戶名只能包含字母、數字和底線');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// 手機號碼驗證
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^(\+886|886)?[0-9]{9}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

// 價格驗證
export const isValidPrice = (price: number): boolean => {
  return price >= 0 && !isNaN(price) && isFinite(price);
};

// 數量驗證
export const isValidQuantity = (quantity: number): boolean => {
  return quantity > 0 && Number.isInteger(quantity);
};

// 卡牌編號驗證
export const isValidCardNumber = (cardNumber: string): boolean => {
  // 基本格式驗證：字母數字組合
  const cardNumberRegex = /^[A-Z0-9]+$/;
  return cardNumberRegex.test(cardNumber) && cardNumber.length >= 1;
};

// 卡牌名稱驗證
export const isValidCardName = (name: string): boolean => {
  return name.trim().length >= 1 && name.trim().length <= 100;
};

// 集合名稱驗證
export const isValidSetName = (setName: string): boolean => {
  return setName.trim().length >= 1 && setName.trim().length <= 50;
};

// 描述驗證
export const isValidDescription = (description: string): boolean => {
  return description.length <= 500; // 最大 500 字元
};

// 標籤驗證
export const isValidTag = (tag: string): boolean => {
  return tag.trim().length >= 1 && tag.trim().length <= 20;
};

// 檔案大小驗證
export const isValidFileSize = (fileSize: number, maxSize: number): boolean => {
  return fileSize <= maxSize;
};

// 檔案類型驗證
export const isValidImageType = (fileType: string): boolean => {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  return validTypes.includes(fileType);
};

// 必填欄位驗證
export const isRequired = (value: any): boolean => {
  if (typeof value === 'string') {
    return value.trim().length > 0;
  }
  return value !== null && value !== undefined;
};

// 範圍驗證
export const isInRange = (value: number, min: number, max: number): boolean => {
  return value >= min && value <= max;
};

// 長度驗證
export const isValidLength = (value: string, min: number, max: number): boolean => {
  return value.length >= min && value.length <= max;
};

// 日期驗證
export const isValidDate = (date: string | Date): boolean => {
  const dateObj = new Date(date);
  return !isNaN(dateObj.getTime());
};

// 未來日期驗證
export const isFutureDate = (date: string | Date): boolean => {
  const dateObj = new Date(date);
  const now = new Date();
  return dateObj > now;
};

// 過去日期驗證
export const isPastDate = (date: string | Date): boolean => {
  const dateObj = new Date(date);
  const now = new Date();
  return dateObj < now;
};

// URL 驗證
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// 信用卡號驗證 (Luhn 演算法)
export const isValidCreditCard = (cardNumber: string): boolean => {
  const cleanNumber = cardNumber.replace(/\s/g, '');

  if (!/^\d+$/.test(cleanNumber)) {
    return false;
  }

  let sum = 0;
  let isEven = false;

  for (let i = cleanNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cleanNumber[i] || '0');

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
};

// 表單驗證工具
export const validateForm = (data: Record<string, any>, rules: Record<string, any[]>): {
  isValid: boolean;
  errors: Record<string, string[]>;
} => {
  const errors: Record<string, string[]> = {};
  let isValid = true;

  for (const [field, fieldRules] of Object.entries(rules)) {
    const fieldErrors: string[] = [];
    const value = data[field];

    for (const rule of fieldRules) {
      if (typeof rule === 'function') {
        const result = rule(value);
        if (typeof result === 'boolean' && !result) {
          fieldErrors.push('驗證失敗');
        } else if (typeof result === 'object' && !result.isValid) {
          fieldErrors.push(...result.errors);
        }
      }
    }

    if (fieldErrors.length > 0) {
      errors[field] = fieldErrors;
      isValid = false;
    }
  }

  return { isValid, errors };
};
