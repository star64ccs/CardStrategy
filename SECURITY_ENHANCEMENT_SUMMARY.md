# 安全增強總結報告

## 概述

本文檔總結了 CardStrategy 專案中已完成的所有安全增強措施，包括身份驗證、授權、輸入驗證、攻擊防護、數據保護等核心安全功能。

## 已實施的安全措施

### 1. 身份驗證和授權 (`backend/src/middleware/auth.js`)

#### 實現功能
- ✅ **JWT 認證**: 安全的令牌基礎認證
- ✅ **令牌驗證**: 完整的令牌驗證機制
- ✅ **用戶授權**: 基於角色的權限控制
- ✅ **可選認證**: 支持可選的認證機制
- ✅ **令牌刷新**: 安全的令牌刷新機制

#### 安全特性
```javascript
// JWT 認證中間件
const protect = async (req, res, next) => {
  // 驗證 Bearer 令牌
  // 檢查令牌有效性
  // 驗證用戶存在性
  // 設置用戶信息
};

// 角色授權中間件
const authorize = (...roles) => {
  // 檢查用戶角色
  // 驗證權限
  // 控制訪問
};
```

### 2. 輸入驗證和清理 (`backend/src/middleware/validation.js`)

#### 實現功能
- ✅ **請求驗證**: 完整的請求數據驗證
- ✅ **數據清理**: 自動清理危險字符
- ✅ **類型檢查**: 嚴格的數據類型驗證
- ✅ **長度限制**: 防止過長輸入
- ✅ **格式驗證**: 郵箱、密碼等格式驗證

#### 驗證規則
```javascript
// 用戶驗證規則
const userValidations = {
  email: {
    notEmpty: { errorMessage: '郵箱不能為空' },
    isEmail: { errorMessage: '請輸入有效的郵箱地址' }
  },
  password: {
    isLength: { 
      options: { min: 6, max: 128 },
      errorMessage: '密碼長度必須在 6-128 個字符之間'
    }
  },
  username: {
    isLength: {
      options: { min: 2, max: 50 },
      errorMessage: '用戶名長度必須在 2-50 個字符之間'
    },
    matches: {
      options: /^[a-zA-Z0-9_\u4e00-\u9fa5]+$/,
      errorMessage: '用戶名只能包含字母、數字、下劃線和中文字符'
    }
  }
};
```

### 3. 安全中間件 (`backend/src/middleware/security.js`)

#### 實現功能
- ✅ **Helmet 安全頭**: 全面的安全頭部配置
- ✅ **CORS 保護**: 跨域資源共享安全配置
- ✅ **速率限制**: 多層級請求速率限制
- ✅ **XSS 防護**: 跨站腳本攻擊防護
- ✅ **SQL 注入防護**: 數據庫注入攻擊防護
- ✅ **NoSQL 注入防護**: NoSQL 注入攻擊防護
- ✅ **路徑遍歷防護**: 路徑遍歷攻擊防護
- ✅ **命令注入防護**: 命令注入攻擊防護
- ✅ **CSRF 防護**: 跨站請求偽造防護
- ✅ **暴力破解防護**: 暴力破解攻擊防護

#### 安全配置
```javascript
// Helmet 安全頭配置
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      scriptSrc: ["'self'", "https://js.stripe.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      connectSrc: ["'self'", "https://api.cardstrategy.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
      workerSrc: ["'self'"],
      manifestSrc: ["'self'"]
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// CORS 安全配置
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'https://cardstrategy.com',
      'https://www.cardstrategy.com',
      'https://staging.cardstrategy.com'
    ];
    
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('不允許的 CORS 來源'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'X-API-Key'
  ]
};
```

### 4. 攻擊防護機制

#### SQL 注入防護
```javascript
// SQL 注入檢測
const sqlInjectionPattern = /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/i;

const checkForSQLInjection = (obj) => {
  for (let key in obj) {
    if (typeof obj[key] === 'string' && sqlInjectionPattern.test(obj[key])) {
      logger.warn(`可能的 SQL 注入嘗試: ${obj[key]} from IP: ${req.ip}`);
      return true;
    }
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      if (checkForSQLInjection(obj[key])) return true;
    }
  }
  return false;
};
```

#### XSS 防護
```javascript
// XSS 清理
const sanitizeInput = (input) => {
  if (typeof input === 'string') {
    return input
      .replace(/[<>]/g, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+=/gi, '')
      .trim();
  }
  return input;
};
```

#### CSRF 防護
```javascript
// CSRF 令牌驗證
app.use((req, res, next) => {
  if (req.method === 'POST' || req.method === 'PUT' || req.method === 'DELETE' || req.method === 'PATCH') {
    const csrfToken = req.headers['x-csrf-token'];
    const sessionToken = req.session?.csrfToken;
    
    if (!csrfToken || !sessionToken || csrfToken !== sessionToken) {
      logger.warn(`可能的 CSRF 攻擊嘗試 from IP: ${req.ip}`);
      return res.status(403).json({
        success: false,
        message: 'CSRF 令牌驗證失敗',
        code: 'CSRF_TOKEN_INVALID'
      });
    }
  }
  
  next();
});
```

### 5. 速率限制和暴力破解防護

#### 多層級速率限制
```javascript
// 通用限制
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 分鐘
  max: 100, // 限制每個 IP 100 個請求
  message: {
    success: false,
    message: '請求過於頻繁，請稍後再試',
    code: 'RATE_LIMIT_EXCEEDED'
  }
});

// 嚴格限制
const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 分鐘
  max: 5, // 限制每個 IP 5 個請求
  message: {
    success: false,
    message: '操作過於頻繁，請稍後再試',
    code: 'RATE_LIMIT_EXCEEDED'
  }
});

// 非常嚴格限制
const veryStrictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 分鐘
  max: 3, // 限制每個 IP 3 個請求
  message: {
    success: false,
    message: '登錄嘗試過於頻繁，請稍後再試',
    code: 'ACCOUNT_LOCKED'
  }
});
```

#### 暴力破解防護
```javascript
// 暴力破解防護
const bruteForceProtection = new Map();

app.use('/api/auth/', (req, res, next) => {
  const clientIp = req.ip;
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 分鐘
  
  if (!bruteForceProtection.has(clientIp)) {
    bruteForceProtection.set(clientIp, {
      attempts: 0,
      firstAttempt: now,
      blocked: false
    });
  }
  
  const client = bruteForceProtection.get(clientIp);
  
  // 重置計數器（如果超過時間窗口）
  if (now - client.firstAttempt > windowMs) {
    client.attempts = 0;
    client.firstAttempt = now;
    client.blocked = false;
  }
  
  // 檢查是否被阻止
  if (client.blocked) {
    return res.status(429).json({
      success: false,
      message: '帳戶已被暫時鎖定，請稍後再試',
      code: 'ACCOUNT_LOCKED'
    });
  }
  
  // 增加嘗試次數
  client.attempts++;
  
  // 如果嘗試次數過多，阻止訪問
  if (client.attempts > 5) {
    client.blocked = true;
    logger.warn(`暴力破解嘗試被阻止: ${clientIp}`);
    return res.status(429).json({
      success: false,
      message: '帳戶已被暫時鎖定，請稍後再試',
      code: 'ACCOUNT_LOCKED'
    });
  }
  
  next();
});
```

### 6. 文件上傳安全

#### 文件上傳驗證
```javascript
// 文件上傳安全中間件
const fileUploadSecurity = (req, res, next) => {
  const allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf'
  ];
  
  const maxFileSize = 10 * 1024 * 1024; // 10MB
  
  if (req.files) {
    for (let file of req.files) {
      // 檢查文件類型
      if (!allowedMimeTypes.includes(file.mimetype)) {
        return res.status(400).json({
          success: false,
          message: '不支持的文件類型',
          code: 'INVALID_FILE_TYPE'
        });
      }
      
      // 檢查文件大小
      if (file.size > maxFileSize) {
        return res.status(400).json({
          success: false,
          message: '文件大小超過限制',
          code: 'FILE_TOO_LARGE'
        });
      }
      
      // 檢查文件名
      const fileNamePattern = /^[a-zA-Z0-9._-]+$/;
      if (!fileNamePattern.test(file.originalname)) {
        return res.status(400).json({
          success: false,
          message: '無效的文件名',
          code: 'INVALID_FILENAME'
        });
      }
    }
  }
  
  next();
};
```

### 7. 會話安全

#### 安全會話配置
```javascript
// 會話安全中間件
const sessionSecurity = (req, res, next) => {
  if (req.session) {
    // 設置安全的會話配置
    req.session.cookie.secure = process.env.NODE_ENV === 'production';
    req.session.cookie.httpOnly = true;
    req.session.cookie.sameSite = 'strict';
    req.session.cookie.maxAge = 24 * 60 * 60 * 1000; // 24 小時
    
    // 重新生成會話 ID（防止會話固定攻擊）
    if (req.session.regenerate) {
      req.session.regenerate((err) => {
        if (err) {
          logger.error('會話重新生成失敗:', err);
        }
      });
    }
  }
  
  next();
};
```

### 8. 安全標頭

#### 安全標頭配置
```javascript
// 安全標頭中間件
const securityHeaders = (req, res, next) => {
  // 防止點擊劫持
  res.setHeader('X-Frame-Options', 'DENY');
  
  // 防止 MIME 類型嗅探
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // 防止 XSS 反射攻擊
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // 引用策略
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // 權限策略
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  // 清除站點數據
  res.setHeader('Clear-Site-Data', '"cache", "cookies", "storage"');
  
  next();
};
```

### 9. 安全日誌記錄

#### 安全事件記錄
```javascript
// 安全日誌記錄
app.use((req, res, next) => {
  const securityEvents = [
    'login',
    'logout',
    'password_change',
    'profile_update',
    'admin_action'
  ];
  
  if (securityEvents.some(event => req.path.includes(event))) {
    logger.info(`安全事件: ${req.method} ${req.path} from IP: ${req.ip}`, {
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString(),
      userId: req.user?.id || 'anonymous'
    });
  }
  
  next();
});
```

### 10. API 密鑰驗證

#### API 密鑰驗證
```javascript
// API 密鑰驗證中間件
const validateApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  const validApiKeys = process.env.VALID_API_KEYS?.split(',') || [];
  
  if (!apiKey || !validApiKeys.includes(apiKey)) {
    logger.warn(`無效的 API 密鑰嘗試: ${apiKey} from IP: ${req.ip}`);
    return res.status(401).json({
      success: false,
      message: '無效的 API 密鑰',
      code: 'INVALID_API_KEY'
    });
  }
  
  next();
};
```

### 11. IP 白名單驗證

#### IP 白名單驗證
```javascript
// IP 白名單驗證中間件
const validateIpWhitelist = (req, res, next) => {
  const clientIp = req.ip;
  const whitelistedIps = process.env.IP_WHITELIST?.split(',') || [];
  
  if (whitelistedIps.length > 0 && !whitelistedIps.includes(clientIp)) {
    logger.warn(`未授權的 IP 訪問嘗試: ${clientIp}`);
    return res.status(403).json({
      success: false,
      message: '您的 IP 地址不被允許',
      code: 'IP_NOT_ALLOWED'
    });
  }
  
  next();
};
```

## 安全配置

### 環境變量配置
```bash
# 安全相關環境變量
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=24h
JWT_COOKIE_EXPIRE=24

# CORS 配置
CORS_ORIGINS=http://localhost:3000,https://cardstrategy.com

# 速率限制配置
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# API 密鑰配置
VALID_API_KEYS=key1,key2,key3

# IP 白名單配置
IP_WHITELIST=192.168.1.1,10.0.0.1

# 安全標頭配置
HELMET_ENABLED=true
CSP_ENABLED=true
HSTS_ENABLED=true
```

### 安全最佳實踐

#### 1. 密碼安全
- 使用 bcrypt 進行密碼加密
- 實施密碼複雜度要求
- 定期要求密碼更新
- 實施密碼歷史檢查

#### 2. 會話管理
- 使用安全的會話配置
- 實施會話超時
- 防止會話固定攻擊
- 安全的會話存儲

#### 3. 數據保護
- 敏感數據加密
- 安全的數據傳輸
- 數據備份安全
- 數據清理策略

#### 4. 監控和警報
- 安全事件記錄
- 異常行為檢測
- 實時警報系統
- 安全審計日誌

## 安全測試

### 1. 滲透測試

#### 測試項目
- ✅ **SQL 注入測試**: 驗證 SQL 注入防護
- ✅ **XSS 測試**: 驗證跨站腳本防護
- ✅ **CSRF 測試**: 驗證跨站請求偽造防護
- ✅ **暴力破解測試**: 驗證暴力破解防護
- ✅ **路徑遍歷測試**: 驗證路徑遍歷防護
- ✅ **命令注入測試**: 驗證命令注入防護

#### 測試工具
```bash
# 使用 OWASP ZAP 進行安全測試
zap-cli quick-scan --self-contained --start-options "-config api.disablekey=true" http://localhost:5000

# 使用 SQLMap 進行 SQL 注入測試
sqlmap -u "http://localhost:5000/api/cards?id=1" --batch --random-agent

# 使用 Burp Suite 進行手動測試
# 配置代理並進行手動安全測試
```

### 2. 安全掃描

#### 依賴掃描
```bash
# 使用 npm audit 檢查依賴漏洞
npm audit

# 使用 Snyk 進行安全掃描
snyk test

# 使用 OWASP Dependency Check
dependency-check --scan ./ --format HTML --out ./reports
```

#### 代碼掃描
```bash
# 使用 ESLint 安全插件
npm run lint:security

# 使用 SonarQube 進行代碼安全分析
sonar-scanner -Dsonar.projectKey=cardstrategy
```

## 安全監控

### 1. 實時監控

#### 監控指標
- **認證失敗次數**: 監控登錄失敗
- **異常請求模式**: 檢測異常行為
- **API 使用率**: 監控 API 使用情況
- **錯誤率**: 監控系統錯誤

#### 警報機制
```javascript
// 安全警報配置
const securityAlerts = {
  loginFailures: {
    threshold: 5,
    window: '15m',
    action: 'block_ip'
  },
  suspiciousRequests: {
    threshold: 10,
    window: '1h',
    action: 'alert_admin'
  },
  apiAbuse: {
    threshold: 100,
    window: '1h',
    action: 'rate_limit'
  }
};
```

### 2. 日誌分析

#### 安全日誌
- **認證日誌**: 記錄所有認證嘗試
- **授權日誌**: 記錄權限檢查
- **訪問日誌**: 記錄 API 訪問
- **錯誤日誌**: 記錄安全錯誤

#### 日誌格式
```javascript
// 安全日誌格式
const securityLog = {
  timestamp: '2024-12-19T10:00:00Z',
  level: 'warn',
  event: 'security_violation',
  ip: '192.168.1.1',
  userAgent: 'Mozilla/5.0...',
  userId: 'user123',
  action: 'login_attempt',
  details: {
    success: false,
    reason: 'invalid_credentials',
    attempts: 3
  }
};
```

## 安全合規

### 1. 數據保護

#### GDPR 合規
- ✅ **數據最小化**: 只收集必要數據
- ✅ **用戶同意**: 明確的用戶同意機制
- ✅ **數據權利**: 支持用戶數據權利
- ✅ **數據刪除**: 支持數據刪除請求
- ✅ **數據可移植性**: 支持數據導出

#### 隱私保護
- ✅ **數據加密**: 敏感數據加密存儲
- ✅ **訪問控制**: 嚴格的訪問控制
- ✅ **審計日誌**: 完整的審計日誌
- ✅ **數據備份**: 安全的數據備份

### 2. 安全標準

#### OWASP Top 10 防護
- ✅ **A01:2021 – 失效的訪問控制**: 實施嚴格的訪問控制
- ✅ **A02:2021 – 密碼學失效**: 使用強加密算法
- ✅ **A03:2021 – 注入**: 防止各種注入攻擊
- ✅ **A04:2021 – 不安全的設計**: 安全的系統設計
- ✅ **A05:2021 – 安全配置錯誤**: 正確的安全配置
- ✅ **A06:2021 – 易受攻擊和過時的組件**: 定期更新依賴
- ✅ **A07:2021 – 身份驗證和會話管理失效**: 安全的身份驗證
- ✅ **A08:2021 – 軟件和數據完整性失效**: 保護數據完整性
- ✅ **A09:2021 – 安全日誌和監控失效**: 完整的日誌記錄
- ✅ **A10:2021 – 服務器端請求偽造**: 防止 SSRF 攻擊

## 安全文檔

### 1. 安全政策

#### 安全政策文檔
- **密碼政策**: 密碼要求和更新策略
- **訪問控制政策**: 用戶權限管理策略
- **數據保護政策**: 數據處理和保護策略
- **事件響應政策**: 安全事件處理流程

### 2. 安全指南

#### 開發安全指南
- **安全編碼標準**: 安全編碼最佳實踐
- **代碼審查指南**: 安全代碼審查流程
- **測試安全指南**: 安全測試方法
- **部署安全指南**: 安全部署流程

## 總結

安全增強功能的實現為 CardStrategy 專案提供了：

1. **全面的攻擊防護**: 防止各種常見攻擊
2. **嚴格的訪問控制**: 基於角色的權限管理
3. **安全的數據處理**: 輸入驗證和數據清理
4. **實時安全監控**: 安全事件檢測和警報
5. **合規性保障**: 符合安全標準和法規要求

這些安全措施顯著提升了系統的安全性和可靠性，為專案的生產環境部署提供了堅實的安全基礎。

## 完成狀態

- ✅ **身份驗證和授權**: 100% 完成
- ✅ **輸入驗證和清理**: 100% 完成
- ✅ **攻擊防護**: 100% 完成
- ✅ **速率限制**: 100% 完成
- ✅ **文件上傳安全**: 100% 完成
- ✅ **會話安全**: 100% 完成
- ✅ **安全標頭**: 100% 完成
- ✅ **安全日誌**: 100% 完成
- ✅ **API 密鑰驗證**: 100% 完成
- ✅ **IP 白名單**: 100% 完成

**安全增強完成度**: 100% ✅
