import { test, expect, Page, Browser, BrowserContext } from '@playwright/test';
import {
  setupTestEnvironment,
  cleanupTestEnvironment,
} from '../setup/e2e-setup';

// 安全測試配置
const SECURITY_TEST_CONFIG = {
  // XSS 測試配置
  xss: {
    payloads: [
      '<script>alert("XSS")</script>',
      'javascript:alert("XSS")',
      '<img src="x" onerror="alert(\'XSS\')">',
      '<svg onload="alert(\'XSS\')">',
      '"><script>alert("XSS")</script>',
      '\'><script>alert("XSS")</script>',
      '"><img src="x" onerror="alert(\'XSS\')">',
      '\'><img src="x" onerror="alert(\'XSS\')">',
    ],
    expectedBehavior: 'sanitized',
  },
  // SQL 注入測試配置
  sqlInjection: {
    payloads: [
      "' OR '1'='1",
      "'; DROP TABLE users; --",
      "' UNION SELECT * FROM users --",
      "admin'--",
      "1' OR '1' = '1' --",
      "'; INSERT INTO users VALUES ('hacker', 'password'); --",
    ],
    expectedBehavior: 'rejected',
  },
  // CSRF 測試配置
  csrf: {
    testEndpoints: [
      '/api/cards/add',
      '/api/portfolio/update',
      '/api/user/settings',
      '/api/payment/process',
    ],
    expectedBehavior: 'protected',
  },
  // 認證測試配置
  authentication: {
    testScenarios: [
      'valid_credentials',
      'invalid_credentials',
      'expired_token',
      'missing_token',
      'tampered_token',
      'weak_password',
    ],
    expectedBehavior: 'secure',
  },
  // 授權測試配置
  authorization: {
    testScenarios: [
      'admin_access',
      'user_access',
      'guest_access',
      'cross_user_access',
      'privilege_escalation',
    ],
    expectedBehavior: 'restricted',
  },
};

// 安全測試工具類
class SecurityTestUtils {
  private page: Page;
  private securityViolations: {
    type: string;
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    timestamp: number;
    details: any;
  }[] = [];

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * 檢測 XSS 漏洞
   */
  async testXSSVulnerability(
    inputSelector: string,
    submitSelector: string
  ): Promise<boolean> {
    console.log('🔍 測試 XSS 漏洞...');

    for (const payload of SECURITY_TEST_CONFIG.xss.payloads) {
      try {
        // 輸入 XSS 載荷
        await this.page.fill(inputSelector, payload);
        await this.page.click(submitSelector);

        // 等待頁面響應
        await this.page.waitForTimeout(2000);

        // 檢查是否有彈出警告
        const dialog = await this.page
          .waitForEvent('dialog', { timeout: 1000 })
          .catch(() => null);
        if (dialog) {
          this.addSecurityViolation(
            'XSS',
            `檢測到 XSS 漏洞: ${payload}`,
            'high',
            { payload }
          );
          await dialog.dismiss();
          return true;
        }

        // 檢查頁面源碼是否包含未過濾的載荷
        const pageContent = await this.page.content();
        if (
          pageContent.includes(payload) &&
          !this.isSanitized(payload, pageContent)
        ) {
          this.addSecurityViolation(
            'XSS',
            `頁面包含未過濾的 XSS 載荷: ${payload}`,
            'medium',
            { payload }
          );
          return true;
        }
      } catch (error) {
        console.warn(`XSS 測試失敗: ${error.message}`);
      }
    }

    return false;
  }

  /**
   * 檢測 SQL 注入漏洞
   */
  async testSQLInjection(
    inputSelector: string,
    submitSelector: string
  ): Promise<boolean> {
    console.log('🔍 測試 SQL 注入漏洞...');

    for (const payload of SECURITY_TEST_CONFIG.sqlInjection.payloads) {
      try {
        // 輸入 SQL 注入載荷
        await this.page.fill(inputSelector, payload);
        await this.page.click(submitSelector);

        // 等待響應
        await this.page.waitForTimeout(2000);

        // 檢查是否有 SQL 錯誤信息
        const pageContent = await this.page.content();
        const sqlErrors = [
          'sql syntax',
          'mysql error',
          'oracle error',
          'postgresql error',
          'sqlite error',
          'database error',
        ];

        for (const error of sqlErrors) {
          if (pageContent.toLowerCase().includes(error)) {
            this.addSecurityViolation(
              'SQL Injection',
              `檢測到 SQL 錯誤信息: ${error}`,
              'high',
              { payload, error }
            );
            return true;
          }
        }

        // 檢查是否有意外的成功響應
        const successIndicators = [
          'welcome admin',
          'user list',
          'database',
          'table',
        ];

        for (const indicator of successIndicators) {
          if (pageContent.toLowerCase().includes(indicator)) {
            this.addSecurityViolation(
              'SQL Injection',
              `檢測到可能的 SQL 注入成功: ${indicator}`,
              'critical',
              { payload, indicator }
            );
            return true;
          }
        }
      } catch (error) {
        console.warn(`SQL 注入測試失敗: ${error.message}`);
      }
    }

    return false;
  }

  /**
   * 檢測 CSRF 漏洞
   */
  async testCSRFVulnerability(): Promise<boolean> {
    console.log('🔍 測試 CSRF 漏洞...');

    for (const endpoint of SECURITY_TEST_CONFIG.csrf.testEndpoints) {
      try {
        // 創建一個沒有 CSRF token 的請求
        const response = await this.page.request.post(endpoint, {
          data: {
            action: 'test',
            data: 'test_data',
          },
          headers: {
            'Content-Type': 'application/json',
          },
        });

        // 檢查響應狀態
        if (response.status() === 200) {
          this.addSecurityViolation(
            'CSRF',
            `端點 ${endpoint} 缺少 CSRF 保護`,
            'high',
            { endpoint, status: response.status() }
          );
          return true;
        }
      } catch (error) {
        console.warn(`CSRF 測試失敗: ${error.message}`);
      }
    }

    return false;
  }

  /**
   * 測試認證機制
   */
  async testAuthentication(): Promise<boolean> {
    console.log('🔍 測試認證機制...');

    // 測試無效憑證
    try {
      await this.page.fill('[data-testid="email-input"]', 'invalid@test.com');
      await this.page.fill('[data-testid="password-input"]', 'wrongpassword');
      await this.page.click('[data-testid="login-button"]');

      await this.page.waitForTimeout(2000);

      // 檢查是否仍然在登錄頁面
      const currentUrl = this.page.url();
      if (!currentUrl.includes('/login') && !currentUrl.includes('/auth')) {
        this.addSecurityViolation(
          'Authentication',
          '無效憑證仍能登錄',
          'critical',
          { email: 'invalid@test.com' }
        );
        return true;
      }
    } catch (error) {
      console.warn(`認證測試失敗: ${error.message}`);
    }

    // 測試弱密碼
    const weakPasswords = ['123456', 'password', 'admin', 'qwerty'];
    for (const weakPassword of weakPasswords) {
      try {
        await this.page.fill('[data-testid="password-input"]', weakPassword);
        await this.page.click('[data-testid="register-button"]');

        await this.page.waitForTimeout(1000);

        // 檢查是否有弱密碼警告
        const pageContent = await this.page.content();
        if (
          !pageContent.includes('weak') &&
          !pageContent.includes('password')
        ) {
          this.addSecurityViolation(
            'Authentication',
            `允許弱密碼: ${weakPassword}`,
            'medium',
            { password: weakPassword }
          );
          return true;
        }
      } catch (error) {
        console.warn(`弱密碼測試失敗: ${error.message}`);
      }
    }

    return false;
  }

  /**
   * 測試授權機制
   */
  async testAuthorization(): Promise<boolean> {
    console.log('🔍 測試授權機制...');

    // 測試跨用戶訪問
    try {
      // 先登錄為用戶 A
      await this.page.fill('[data-testid="email-input"]', 'userA@test.com');
      await this.page.fill('[data-testid="password-input"]', 'password123');
      await this.page.click('[data-testid="login-button"]');

      await this.page.waitForTimeout(2000);

      // 嘗試訪問用戶 B 的數據
      const response = await this.page.request.get('/api/user/B/profile');

      if (response.status() === 200) {
        this.addSecurityViolation(
          'Authorization',
          '允許跨用戶訪問',
          'critical',
          {
            requestedUser: 'B',
            currentUser: 'A',
          }
        );
        return true;
      }
    } catch (error) {
      console.warn(`授權測試失敗: ${error.message}`);
    }

    // 測試權限提升
    try {
      const response = await this.page.request.post('/api/admin/users', {
        data: {
          action: 'create',
          user: {
            email: 'hacker@test.com',
            role: 'admin',
          },
        },
      });

      if (response.status() === 200) {
        this.addSecurityViolation('Authorization', '允許權限提升', 'critical', {
          action: 'create_admin',
          status: response.status(),
        });
        return true;
      }
    } catch (error) {
      console.warn(`權限提升測試失敗: ${error.message}`);
    }

    return false;
  }

  /**
   * 測試輸入驗證
   */
  async testInputValidation(): Promise<boolean> {
    console.log('🔍 測試輸入驗證...');

    const maliciousInputs = [
      // 路徑遍歷
      '../../../etc/passwd',
      '..\\..\\..\\windows\\system32\\config\\sam',

      // 命令注入
      '; rm -rf /',
      '| cat /etc/passwd',
      '&& del C:\\Windows\\System32',

      // 特殊字符
      '<script>alert("test")</script>',
      'javascript:alert("test")',
      'data:text/html,<script>alert("test")</script>',
    ];

    for (const input of maliciousInputs) {
      try {
        // 測試搜索功能
        await this.page.fill('[data-testid="search-input"]', input);
        await this.page.click('[data-testid="search-button"]');

        await this.page.waitForTimeout(2000);

        // 檢查響應
        const pageContent = await this.page.content();
        if (
          pageContent.includes(input) &&
          !this.isSanitized(input, pageContent)
        ) {
          this.addSecurityViolation(
            'Input Validation',
            `輸入未正確驗證: ${input}`,
            'medium',
            { input }
          );
          return true;
        }
      } catch (error) {
        console.warn(`輸入驗證測試失敗: ${error.message}`);
      }
    }

    return false;
  }

  /**
   * 測試會話管理
   */
  async testSessionManagement(): Promise<boolean> {
    console.log('🔍 測試會話管理...');

    try {
      // 檢查會話超時
      const cookies = await this.page.context().cookies();
      const sessionCookie = cookies.find(
        (cookie) =>
          cookie.name.includes('session') ||
          cookie.name.includes('token') ||
          cookie.name.includes('auth')
      );

      if (sessionCookie) {
        // 檢查是否有過期時間
        if (!sessionCookie.expires) {
          this.addSecurityViolation(
            'Session Management',
            '會話 cookie 沒有過期時間',
            'medium',
            {
              cookieName: sessionCookie.name,
            }
          );
          return true;
        }

        // 檢查是否使用 HttpOnly
        if (!sessionCookie.httpOnly) {
          this.addSecurityViolation(
            'Session Management',
            '會話 cookie 未設置 HttpOnly',
            'medium',
            {
              cookieName: sessionCookie.name,
            }
          );
          return true;
        }

        // 檢查是否使用 Secure
        if (!sessionCookie.secure) {
          this.addSecurityViolation(
            'Session Management',
            '會話 cookie 未設置 Secure',
            'low',
            {
              cookieName: sessionCookie.name,
            }
          );
          return true;
        }
      }
    } catch (error) {
      console.warn(`會話管理測試失敗: ${error.message}`);
    }

    return false;
  }

  /**
   * 測試 HTTPS 和 SSL/TLS
   */
  async testHTTPSAndSSL(): Promise<boolean> {
    console.log('🔍 測試 HTTPS 和 SSL/TLS...');

    try {
      const currentUrl = this.page.url();

      // 檢查是否使用 HTTPS
      if (!currentUrl.startsWith('https://')) {
        this.addSecurityViolation('HTTPS', '未使用 HTTPS', 'high', {
          url: currentUrl,
        });
        return true;
      }

      // 檢查安全標頭
      const response = await this.page.request.get(currentUrl);
      const headers = response.headers();

      // 檢查 HSTS
      if (!headers['strict-transport-security']) {
        this.addSecurityViolation('HTTPS', '缺少 HSTS 標頭', 'medium', {
          headers,
        });
        return true;
      }

      // 檢查 CSP
      if (!headers['content-security-policy']) {
        this.addSecurityViolation('HTTPS', '缺少 CSP 標頭', 'medium', {
          headers,
        });
        return true;
      }

      // 檢查 X-Frame-Options
      if (!headers['x-frame-options']) {
        this.addSecurityViolation(
          'HTTPS',
          '缺少 X-Frame-Options 標頭',
          'medium',
          { headers }
        );
        return true;
      }
    } catch (error) {
      console.warn(`HTTPS 測試失敗: ${error.message}`);
    }

    return false;
  }

  /**
   * 測試敏感信息洩露
   */
  async testInformationDisclosure(): Promise<boolean> {
    console.log('🔍 測試敏感信息洩露...');

    try {
      const pageContent = await this.page.content();

      // 檢查是否洩露敏感信息
      const sensitivePatterns = [
        /password\s*[:=]\s*['"][^'"]+['"]/i,
        /api_key\s*[:=]\s*['"][^'"]+['"]/i,
        /secret\s*[:=]\s*['"][^'"]+['"]/i,
        /token\s*[:=]\s*['"][^'"]+['"]/i,
        /database_url\s*[:=]\s*['"][^'"]+['"]/i,
        /connection_string\s*[:=]\s*['"][^'"]+['"]/i,
      ];

      for (const pattern of sensitivePatterns) {
        const matches = pageContent.match(pattern);
        if (matches) {
          this.addSecurityViolation(
            'Information Disclosure',
            `檢測到敏感信息洩露: ${matches[0]}`,
            'high',
            {
              pattern: pattern.source,
              match: matches[0],
            }
          );
          return true;
        }
      }

      // 檢查錯誤信息
      const errorPatterns = [
        /sql.*error/i,
        /database.*error/i,
        /stack.*trace/i,
        /exception.*details/i,
      ];

      for (const pattern of errorPatterns) {
        const matches = pageContent.match(pattern);
        if (matches) {
          this.addSecurityViolation(
            'Information Disclosure',
            `檢測到詳細錯誤信息: ${matches[0]}`,
            'medium',
            {
              pattern: pattern.source,
              match: matches[0],
            }
          );
          return true;
        }
      }
    } catch (error) {
      console.warn(`信息洩露測試失敗: ${error.message}`);
    }

    return false;
  }

  /**
   * 添加安全違規記錄
   */
  private addSecurityViolation(
    type: string,
    description: string,
    severity: 'low' | 'medium' | 'high' | 'critical',
    details: any
  ) {
    this.securityViolations.push({
      type,
      description,
      severity,
      timestamp: Date.now(),
      details,
    });

    console.warn(`🚨 安全違規 [${severity.toUpperCase()}]: ${description}`);
  }

  /**
   * 檢查輸入是否被正確過濾
   */
  private isSanitized(input: string, content: string): boolean {
    // 檢查是否被 HTML 實體編碼
    const htmlEncoded = input
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');

    return content.includes(htmlEncoded);
  }

  /**
   * 獲取安全測試結果
   */
  getSecurityReport() {
    return {
      totalViolations: this.securityViolations.length,
      violationsBySeverity: {
        critical: this.securityViolations.filter(
          (v) => v.severity === 'critical'
        ).length,
        high: this.securityViolations.filter((v) => v.severity === 'high')
          .length,
        medium: this.securityViolations.filter((v) => v.severity === 'medium')
          .length,
        low: this.securityViolations.filter((v) => v.severity === 'low').length,
      },
      violationsByType: this.securityViolations.reduce(
        (acc, violation) => {
          acc[violation.type] = (acc[violation.type] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      ),
      violations: this.securityViolations,
    };
  }
}

describe('CardStrategy 安全測試', () => {
  let browser: Browser;
  let page: Page;
  let securityUtils: SecurityTestUtils;

  beforeAll(async () => {
    await setupTestEnvironment();
  });

  beforeEach(async ({ browser: testBrowser }) => {
    browser = testBrowser;
    page = await browser.newPage();
    securityUtils = new SecurityTestUtils(page);

    // 導航到應用
    await page.goto('http://localhost:3000');
  });

  afterAll(async () => {
    await cleanupTestEnvironment();
  });

  test('XSS 漏洞測試', async () => {
    console.log('🚀 開始 XSS 漏洞測試...');

    // 測試搜索框
    const hasXSSVulnerability = await securityUtils.testXSSVulnerability(
      '[data-testid="search-input"]',
      '[data-testid="search-button"]'
    );

    // 測試評論框
    if ((await page.locator('[data-testid="comment-input"]').count()) > 0) {
      const hasCommentXSS = await securityUtils.testXSSVulnerability(
        '[data-testid="comment-input"]',
        '[data-testid="comment-submit"]'
      );

      expect(hasCommentXSS).toBe(false);
    }

    expect(hasXSSVulnerability).toBe(false);
  });

  test('SQL 注入漏洞測試', async () => {
    console.log('🚀 開始 SQL 注入漏洞測試...');

    // 測試登錄表單
    const hasSQLInjection = await securityUtils.testSQLInjection(
      '[data-testid="email-input"]',
      '[data-testid="login-button"]'
    );

    expect(hasSQLInjection).toBe(false);
  });

  test('CSRF 漏洞測試', async () => {
    console.log('🚀 開始 CSRF 漏洞測試...');

    const hasCSRFVulnerability = await securityUtils.testCSRFVulnerability();

    expect(hasCSRFVulnerability).toBe(false);
  });

  test('認證機制測試', async () => {
    console.log('🚀 開始認證機制測試...');

    const hasAuthVulnerability = await securityUtils.testAuthentication();

    expect(hasAuthVulnerability).toBe(false);
  });

  test('授權機制測試', async () => {
    console.log('🚀 開始授權機制測試...');

    const hasAuthzVulnerability = await securityUtils.testAuthorization();

    expect(hasAuthzVulnerability).toBe(false);
  });

  test('輸入驗證測試', async () => {
    console.log('🚀 開始輸入驗證測試...');

    const hasInputValidationIssue = await securityUtils.testInputValidation();

    expect(hasInputValidationIssue).toBe(false);
  });

  test('會話管理測試', async () => {
    console.log('🚀 開始會話管理測試...');

    const hasSessionIssue = await securityUtils.testSessionManagement();

    expect(hasSessionIssue).toBe(false);
  });

  test('HTTPS 和 SSL/TLS 測試', async () => {
    console.log('🚀 開始 HTTPS 和 SSL/TLS 測試...');

    const hasHTTPSIssue = await securityUtils.testHTTPSAndSSL();

    expect(hasHTTPSIssue).toBe(false);
  });

  test('敏感信息洩露測試', async () => {
    console.log('🚀 開始敏感信息洩露測試...');

    const hasInfoDisclosure = await securityUtils.testInformationDisclosure();

    expect(hasInfoDisclosure).toBe(false);
  });

  test('綜合安全評估', async () => {
    console.log('🚀 開始綜合安全評估...');

    // 執行所有安全測試
    const tests = [
      securityUtils.testXSSVulnerability(
        '[data-testid="search-input"]',
        '[data-testid="search-button"]'
      ),
      securityUtils.testSQLInjection(
        '[data-testid="email-input"]',
        '[data-testid="login-button"]'
      ),
      securityUtils.testCSRFVulnerability(),
      securityUtils.testAuthentication(),
      securityUtils.testAuthorization(),
      securityUtils.testInputValidation(),
      securityUtils.testSessionManagement(),
      securityUtils.testHTTPSAndSSL(),
      securityUtils.testInformationDisclosure(),
    ];

    const results = await Promise.all(tests);
    const hasAnyVulnerability = results.some((result) => result === true);

    // 生成安全報告
    const securityReport = securityUtils.getSecurityReport();

    console.log('📊 安全測試報告:');
    console.log(`總違規數: ${securityReport.totalViolations}`);
    console.log('嚴重程度分布:', securityReport.violationsBySeverity);
    console.log('違規類型分布:', securityReport.violationsByType);

    if (securityReport.violations.length > 0) {
      console.log('🚨 發現的安全問題:');
      securityReport.violations.forEach((violation, index) => {
        console.log(
          `${index + 1}. [${violation.severity.toUpperCase()}] ${violation.type}: ${violation.description}`
        );
      });
    }

    expect(hasAnyVulnerability).toBe(false);
  });
});
