import { test, expect, Page, Browser, BrowserContext } from '@playwright/test';
import { setupTestEnvironment, cleanupTestEnvironment } from '../setup/e2e-setup';

// 高級安全測試配置
const ADVANCED_SECURITY_CONFIG = {
  // 滲透測試配置
  penetration: {
    testScenarios: [
      'directory_traversal',
      'file_upload',
      'command_injection',
      'xml_external_entity',
      'server_side_request_forgery',
      'business_logic_flaws'
    ],
    expectedBehavior: 'secure'
  },
  // 加密測試配置
  encryption: {
    testScenarios: [
      'data_at_rest',
      'data_in_transit',
      'key_management',
      'hash_verification',
      'certificate_validation'
    ],
    expectedBehavior: 'encrypted'
  },
  // 安全標頭測試配置
  securityHeaders: {
    requiredHeaders: [
      'strict-transport-security',
      'content-security-policy',
      'x-frame-options',
      'x-content-type-options',
      'x-xss-protection',
      'referrer-policy',
      'permissions-policy'
    ],
    expectedBehavior: 'present'
  },
  // API 安全測試配置
  apiSecurity: {
    testEndpoints: [
      '/api/cards',
      '/api/users',
      '/api/portfolio',
      '/api/payments',
      '/api/admin'
    ],
    testMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    expectedBehavior: 'protected'
  }
};

// 高級安全測試工具類
class AdvancedSecurityTestUtils {
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
   * 測試目錄遍歷漏洞
   */
  async testDirectoryTraversal(): Promise<boolean> {
    console.log('🔍 測試目錄遍歷漏洞...');

    const traversalPayloads = [
      '../../../etc/passwd',
      '..\\..\\..\\windows\\system32\\config\\sam',
      '....//....//....//etc/passwd',
      '%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd',
      '..%252f..%252f..%252fetc%252fpasswd'
    ];

    for (const payload of traversalPayloads) {
      try {
        // 測試文件下載端點
        const response = await this.page.request.get(`/api/files/download?path=${payload}`);

        if (response.status() === 200) {
          const content = await response.text();

          // 檢查是否返回了系統文件內容
          if (content.includes('root:') || content.includes('Administrator') || content.includes('SAM')) {
            this.addSecurityViolation('Directory Traversal', `成功訪問系統文件: ${payload}`, 'critical', {
              payload,
              content: content.substring(0, 100)
            });
            return true;
          }
        }

      } catch (error) {
        console.warn(`目錄遍歷測試失敗: ${error.message}`);
      }
    }

    return false;
  }

  /**
   * 測試文件上傳漏洞
   */
  async testFileUploadVulnerability(): Promise<boolean> {
    console.log('🔍 測試文件上傳漏洞...');

    const maliciousFiles = [
      {
        name: 'test.php',
        content: '<?php echo "Hello World"; ?>',
        mimeType: 'application/x-php'
      },
      {
        name: 'test.jsp',
        content: '<% out.println("Hello World"); %>',
        mimeType: 'application/x-jsp'
      },
      {
        name: 'test.asp',
        content: '<% Response.Write("Hello World") %>',
        mimeType: 'application/x-asp'
      },
      {
        name: 'test.exe',
        content: 'MZ\x90\x00\x03\x00\x00\x00\x04\x00\x00\x00',
        mimeType: 'application/x-executable'
      }
    ];

    for (const file of maliciousFiles) {
      try {
        // 創建 FormData
        const formData = new FormData();
        const blob = new Blob([file.content], { type: file.mimeType });
        formData.append('file', blob, file.name);

        const response = await this.page.request.post('/api/files/upload', {
          data: formData,
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        if (response.status() === 200) {
          const result = await response.json();

          // 檢查是否成功上傳了惡意文件
          if (result.success && result.filename) {
            this.addSecurityViolation('File Upload', `成功上傳惡意文件: ${file.name}`, 'high', {
              filename: file.name,
              mimeType: file.mimeType
            });
            return true;
          }
        }

      } catch (error) {
        console.warn(`文件上傳測試失敗: ${error.message}`);
      }
    }

    return false;
  }

  /**
   * 測試命令注入漏洞
   */
  async testCommandInjection(): Promise<boolean> {
    console.log('🔍 測試命令注入漏洞...');

    const commandPayloads = [
      '; ls -la',
      '| cat /etc/passwd',
      '&& whoami',
      '; dir',
      '| type C:\\Windows\\System32\\drivers\\etc\\hosts',
      '&& net user'
    ];

    for (const payload of commandPayloads) {
      try {
        // 測試系統命令端點
        const response = await this.page.request.post('/api/system/command', {
          data: {
            command: payload
          },
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (response.status() === 200) {
          const result = await response.text();

          // 檢查是否執行了系統命令
          if (result.includes('root') || result.includes('Administrator') ||
              result.includes('drivers') || result.includes('hosts')) {
            this.addSecurityViolation('Command Injection', `成功執行系統命令: ${payload}`, 'critical', {
              payload,
              result: result.substring(0, 100)
            });
            return true;
          }
        }

      } catch (error) {
        console.warn(`命令注入測試失敗: ${error.message}`);
      }
    }

    return false;
  }

  /**
   * 測試 XML 外部實體注入
   */
  async testXXEVulnerability(): Promise<boolean> {
    console.log('🔍 測試 XML 外部實體注入...');

    const xxePayloads = [
      `<?xml version="1.0" encoding="ISO-8859-1"?>
       <!DOCTYPE foo [
         <!ELEMENT foo ANY >
         <!ENTITY xxe SYSTEM "file:///etc/passwd" >]>
       <foo>&xxe;</foo>`,

      `<?xml version="1.0" encoding="ISO-8859-1"?>
       <!DOCTYPE data [
         <!ENTITY file SYSTEM "file:///c:/windows/win.ini">
       ]>
       <data>&file;</data>`
    ];

    for (const payload of xxePayloads) {
      try {
        const response = await this.page.request.post('/api/xml/parse', {
          data: payload,
          headers: {
            'Content-Type': 'application/xml'
          }
        });

        if (response.status() === 200) {
          const result = await response.text();

          // 檢查是否讀取了系統文件
          if (result.includes('root:') || result.includes('[fonts]') || result.includes('Windows')) {
            this.addSecurityViolation('XXE', `成功讀取系統文件: ${payload.substring(0, 50)}...`, 'critical', {
              payload: payload.substring(0, 100),
              result: result.substring(0, 100)
            });
            return true;
          }
        }

      } catch (error) {
        console.warn(`XXE 測試失敗: ${error.message}`);
      }
    }

    return false;
  }

  /**
   * 測試服務器端請求偽造
   */
  async testSSRFVulnerability(): Promise<boolean> {
    console.log('🔍 測試服務器端請求偽造...');

    const ssrfPayloads = [
      'http://localhost:22',
      'http://127.0.0.1:3306',
      'http://169.254.169.254/latest/meta-data/',
      'http://10.0.0.1',
      'file:///etc/passwd'
    ];

    for (const payload of ssrfPayloads) {
      try {
        const response = await this.page.request.post('/api/proxy/fetch', {
          data: {
            url: payload
          },
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (response.status() === 200) {
          const result = await response.text();

          // 檢查是否訪問了內部服務
          if (result.includes('SSH') || result.includes('MySQL') ||
              result.includes('ami-id') || result.includes('root:')) {
            this.addSecurityViolation('SSRF', `成功訪問內部服務: ${payload}`, 'high', {
              payload,
              result: result.substring(0, 100)
            });
            return true;
          }
        }

      } catch (error) {
        console.warn(`SSRF 測試失敗: ${error.message}`);
      }
    }

    return false;
  }

  /**
   * 測試業務邏輯漏洞
   */
  async testBusinessLogicFlaws(): Promise<boolean> {
    console.log('🔍 測試業務邏輯漏洞...');

    // 測試價格操縱
    try {
      const response = await this.page.request.post('/api/payment/process', {
        data: {
          amount: -100,
          currency: 'USD',
          itemId: 'card_123'
        },
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.status() === 200) {
        const result = await response.json();
        if (result.success) {
          this.addSecurityViolation('Business Logic', '允許負數金額支付', 'high', {
            amount: -100,
            result
          });
          return true;
        }
      }

    } catch (error) {
      console.warn(`價格操縱測試失敗: ${error.message}`);
    }

    // 測試數量限制繞過
    try {
      const response = await this.page.request.post('/api/cards/add', {
        data: {
          cardId: 'card_123',
          quantity: 999999
        },
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.status() === 200) {
        const result = await response.json();
        if (result.success && result.quantity > 1000) {
          this.addSecurityViolation('Business Logic', '允許超量添加卡片', 'medium', {
            quantity: 999999,
            result
          });
          return true;
        }
      }

    } catch (error) {
      console.warn(`數量限制測試失敗: ${error.message}`);
    }

    return false;
  }

  /**
   * 測試數據加密
   */
  async testDataEncryption(): Promise<boolean> {
    console.log('🔍 測試數據加密...');

    try {
      // 檢查敏感數據是否加密
      const response = await this.page.request.get('/api/user/profile');

      if (response.status() === 200) {
        const result = await response.json();

        // 檢查密碼是否明文存儲
        if (result.password && result.password.length < 60) {
          this.addSecurityViolation('Encryption', '密碼未加密存儲', 'critical', {
            password: result.password
          });
          return true;
        }

        // 檢查信用卡號是否加密
        if (result.creditCard && result.creditCard.length === 16) {
          this.addSecurityViolation('Encryption', '信用卡號未加密', 'critical', {
            creditCard: result.creditCard
          });
          return true;
        }
      }

    } catch (error) {
      console.warn(`數據加密測試失敗: ${error.message}`);
    }

    return false;
  }

  /**
   * 測試安全標頭
   */
  async testSecurityHeaders(): Promise<boolean> {
    console.log('🔍 測試安全標頭...');

    try {
      const response = await this.page.request.get(this.page.url());
      const headers = response.headers();

      for (const requiredHeader of ADVANCED_SECURITY_CONFIG.securityHeaders.requiredHeaders) {
        if (!headers[requiredHeader]) {
          this.addSecurityViolation('Security Headers', `缺少安全標頭: ${requiredHeader}`, 'medium', {
            missingHeader: requiredHeader,
            availableHeaders: Object.keys(headers)
          });
          return true;
        }
      }

      // 檢查 CSP 標頭是否足夠嚴格
      const csp = headers['content-security-policy'];
      if (csp && !csp.includes("'unsafe-inline'") && !csp.includes("'unsafe-eval'")) {
        // CSP 配置良好
      } else {
        this.addSecurityViolation('Security Headers', 'CSP 配置不夠嚴格', 'medium', {
          csp
        });
        return true;
      }

    } catch (error) {
      console.warn(`安全標頭測試失敗: ${error.message}`);
    }

    return false;
  }

  /**
   * 測試 API 安全
   */
  async testAPISecurity(): Promise<boolean> {
    console.log('🔍 測試 API 安全...');

    for (const endpoint of ADVANCED_SECURITY_CONFIG.apiSecurity.testEndpoints) {
      for (const method of ADVANCED_SECURITY_CONFIG.apiSecurity.testMethods) {
        try {
          let response;

          switch (method) {
            case 'GET':
              response = await this.page.request.get(endpoint);
              break;
            case 'POST':
              response = await this.page.request.post(endpoint, {
                data: { test: 'data' }
              });
              break;
            case 'PUT':
              response = await this.page.request.put(endpoint, {
                data: { test: 'data' }
              });
              break;
            case 'DELETE':
              response = await this.page.request.delete(endpoint);
              break;
            case 'PATCH':
              response = await this.page.request.patch(endpoint, {
                data: { test: 'data' }
              });
              break;
          }

          // 檢查是否需要認證
          if (response.status() === 200 && endpoint.includes('/admin')) {
            this.addSecurityViolation('API Security', `管理端點 ${endpoint} 缺少認證`, 'critical', {
              endpoint,
              method,
              status: response.status()
            });
            return true;
          }

          // 檢查是否有速率限制
          if (response.status() === 429) {
            // 有速率限制，這是好的
          } else {
            // 快速發送多個請求測試速率限制
            const promises = Array(100).fill(null).map(() =>
              this.page.request.get(endpoint)
            );

            const responses = await Promise.all(promises);
            const successCount = responses.filter(r => r.status() === 200).length;

            if (successCount > 50) {
              this.addSecurityViolation('API Security', `端點 ${endpoint} 缺少速率限制`, 'medium', {
                endpoint,
                successCount
              });
              return true;
            }
          }

        } catch (error) {
          console.warn(`API 安全測試失敗: ${error.message}`);
        }
      }
    }

    return false;
  }

  /**
   * 測試 JWT 安全
   */
  async testJWTSecurity(): Promise<boolean> {
    console.log('🔍 測試 JWT 安全...');

    try {
      // 獲取當前的 JWT token
      const cookies = await this.page.context().cookies();
      const tokenCookie = cookies.find(cookie =>
        cookie.name.includes('token') ||
        cookie.name.includes('jwt') ||
        cookie.name.includes('auth')
      );

      if (tokenCookie) {
        const token = tokenCookie.value;

        // 檢查 token 是否使用強算法
        const parts = token.split('.');
        if (parts.length === 3) {
          const header = JSON.parse(Buffer.from(parts[0], 'base64').toString());

          if (header.alg === 'none' || header.alg === 'HS256') {
            this.addSecurityViolation('JWT Security', `使用弱算法: ${header.alg}`, 'medium', {
              algorithm: header.alg
            });
            return true;
          }
        }

        // 測試 token 篡改
        const tamperedToken = `${token  }tampered`;
        const response = await this.page.request.get('/api/user/profile', {
          headers: {
            'Authorization': `Bearer ${tamperedToken}`
          }
        });

        if (response.status() === 200) {
          this.addSecurityViolation('JWT Security', '篡改的 token 仍能通過驗證', 'critical', {
            originalToken: `${token.substring(0, 20)  }...`,
            tamperedToken: `${tamperedToken.substring(0, 20)  }...`
          });
          return true;
        }
      }

    } catch (error) {
      console.warn(`JWT 安全測試失敗: ${error.message}`);
    }

    return false;
  }

  /**
   * 添加安全違規記錄
   */
  private addSecurityViolation(type: string, description: string, severity: 'low' | 'medium' | 'high' | 'critical', details: any) {
    this.securityViolations.push({
      type,
      description,
      severity,
      timestamp: Date.now(),
      details
    });

    console.warn(`🚨 高級安全違規 [${severity.toUpperCase()}]: ${description}`);
  }

  /**
   * 獲取安全測試結果
   */
  getSecurityReport() {
    return {
      totalViolations: this.securityViolations.length,
      violationsBySeverity: {
        critical: this.securityViolations.filter(v => v.severity === 'critical').length,
        high: this.securityViolations.filter(v => v.severity === 'high').length,
        medium: this.securityViolations.filter(v => v.severity === 'medium').length,
        low: this.securityViolations.filter(v => v.severity === 'low').length
      },
      violationsByType: this.securityViolations.reduce((acc, violation) => {
        acc[violation.type] = (acc[violation.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      violations: this.securityViolations
    };
  }
}

describe('CardStrategy 高級安全測試', () => {
  let browser: Browser;
  let page: Page;
  let securityUtils: AdvancedSecurityTestUtils;

  beforeAll(async () => {
    await setupTestEnvironment();
  });

  beforeEach(async ({ browser: testBrowser }) => {
    browser = testBrowser;
    page = await browser.newPage();
    securityUtils = new AdvancedSecurityTestUtils(page);

    // 導航到應用
    await page.goto('http://localhost:3000');
  });

  afterAll(async () => {
    await cleanupTestEnvironment();
  });

  test('滲透測試 - 目錄遍歷', async () => {
    console.log('🚀 開始目錄遍歷測試...');

    const hasDirectoryTraversal = await securityUtils.testDirectoryTraversal();

    expect(hasDirectoryTraversal).toBe(false);
  });

  test('滲透測試 - 文件上傳漏洞', async () => {
    console.log('🚀 開始文件上傳漏洞測試...');

    const hasFileUploadVulnerability = await securityUtils.testFileUploadVulnerability();

    expect(hasFileUploadVulnerability).toBe(false);
  });

  test('滲透測試 - 命令注入', async () => {
    console.log('🚀 開始命令注入測試...');

    const hasCommandInjection = await securityUtils.testCommandInjection();

    expect(hasCommandInjection).toBe(false);
  });

  test('滲透測試 - XML 外部實體注入', async () => {
    console.log('🚀 開始 XML 外部實體注入測試...');

    const hasXXEVulnerability = await securityUtils.testXXEVulnerability();

    expect(hasXXEVulnerability).toBe(false);
  });

  test('滲透測試 - 服務器端請求偽造', async () => {
    console.log('🚀 開始服務器端請求偽造測試...');

    const hasSSRFVulnerability = await securityUtils.testSSRFVulnerability();

    expect(hasSSRFVulnerability).toBe(false);
  });

  test('滲透測試 - 業務邏輯漏洞', async () => {
    console.log('🚀 開始業務邏輯漏洞測試...');

    const hasBusinessLogicFlaw = await securityUtils.testBusinessLogicFlaws();

    expect(hasBusinessLogicFlaw).toBe(false);
  });

  test('加密測試 - 數據加密', async () => {
    console.log('🚀 開始數據加密測試...');

    const hasEncryptionIssue = await securityUtils.testDataEncryption();

    expect(hasEncryptionIssue).toBe(false);
  });

  test('安全標頭測試', async () => {
    console.log('🚀 開始安全標頭測試...');

    const hasSecurityHeaderIssue = await securityUtils.testSecurityHeaders();

    expect(hasSecurityHeaderIssue).toBe(false);
  });

  test('API 安全測試', async () => {
    console.log('🚀 開始 API 安全測試...');

    const hasAPISecurityIssue = await securityUtils.testAPISecurity();

    expect(hasAPISecurityIssue).toBe(false);
  });

  test('JWT 安全測試', async () => {
    console.log('🚀 開始 JWT 安全測試...');

    const hasJWTSecurityIssue = await securityUtils.testJWTSecurity();

    expect(hasJWTSecurityIssue).toBe(false);
  });

  test('綜合高級安全評估', async () => {
    console.log('🚀 開始綜合高級安全評估...');

    // 執行所有高級安全測試
    const tests = [
      securityUtils.testDirectoryTraversal(),
      securityUtils.testFileUploadVulnerability(),
      securityUtils.testCommandInjection(),
      securityUtils.testXXEVulnerability(),
      securityUtils.testSSRFVulnerability(),
      securityUtils.testBusinessLogicFlaws(),
      securityUtils.testDataEncryption(),
      securityUtils.testSecurityHeaders(),
      securityUtils.testAPISecurity(),
      securityUtils.testJWTSecurity()
    ];

    const results = await Promise.all(tests);
    const hasAnyVulnerability = results.some(result => result === true);

    // 生成安全報告
    const securityReport = securityUtils.getSecurityReport();

    console.log('📊 高級安全測試報告:');
    console.log(`總違規數: ${securityReport.totalViolations}`);
    console.log('嚴重程度分布:', securityReport.violationsBySeverity);
    console.log('違規類型分布:', securityReport.violationsByType);

    if (securityReport.violations.length > 0) {
      console.log('🚨 發現的高級安全問題:');
      securityReport.violations.forEach((violation, index) => {
        console.log(`${index + 1}. [${violation.severity.toUpperCase()}] ${violation.type}: ${violation.description}`);
      });
    }

    expect(hasAnyVulnerability).toBe(false);
  });
});
