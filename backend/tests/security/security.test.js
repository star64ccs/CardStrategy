const request = require('supertest');
const app = require('../../src/server');
const { sequelize } = require('../../src/config/database');
const User = require('../../src/models/User');
const bcrypt = require('bcryptjs');

describe('安全測試', () => {
  let testUser;
  let authToken;

  beforeAll(async () => {
    // 清理測試數據庫
    await sequelize.sync({ force: true });

    // 創建測試用戶
    const hashedPassword = await bcrypt.hash('testpassword123', 10);
    testUser = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      password: hashedPassword,
      role: 'user'
    });

    // 登錄獲取 token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'testpassword123'
      });
    authToken = loginResponse.body.data.token;
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('SQL 注入防護測試', () => {
    it('應該防止 SQL 注入攻擊在搜索參數中', async () => {
      const sqlInjectionPayloads = [
        "'; DROP TABLE users; --",
        "' OR '1'='1",
        "' UNION SELECT * FROM users --",
        "'; INSERT INTO users (username, email) VALUES ('hacker', 'hacker@evil.com'); --",
        "' OR 1=1; --",
        "'; UPDATE users SET role='admin' WHERE id=1; --"
      ];

      for (const payload of sqlInjectionPayloads) {
        const response = await request(app)
          .get('/api/cards')
          .query({ search: payload })
          .expect(200);

        // 應該返回空結果或錯誤，而不是執行惡意 SQL
        expect(response.body.success).toBe(true);
        expect(response.body.data.cards).toBeDefined();

        // 驗證沒有執行惡意操作
        const userCount = await User.count();
        expect(userCount).toBe(1); // 應該只有一個測試用戶
      }
    });

    it('應該防止 SQL 注入攻擊在用戶名中', async () => {
      const sqlInjectionPayloads = [
        "admin'; --",
        "' OR '1'='1' --",
        "'; DROP TABLE users; --"
      ];

      for (const payload of sqlInjectionPayloads) {
        const response = await request(app)
          .post('/api/auth/register')
          .send({
            username: payload,
            email: `test${Date.now()}@example.com`,
            password: 'testpassword123'
          });

        // 應該返回驗證錯誤，而不是執行惡意 SQL
        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
      }
    });

    it('應該防止 SQL 注入攻擊在電子郵件中', async () => {
      const sqlInjectionPayloads = [
        "test@example.com'; DROP TABLE users; --",
        "test@example.com' OR '1'='1",
        "'; INSERT INTO users VALUES (999, 'hacker', 'hacker@evil.com', 'hash', 'admin'); --"
      ];

      for (const payload of sqlInjectionPayloads) {
        const response = await request(app)
          .post('/api/auth/register')
          .send({
            username: `testuser${Date.now()}`,
            email: payload,
            password: 'testpassword123'
          });

        // 應該返回驗證錯誤
        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
      }
    });
  });

  describe('XSS 防護測試', () => {
    it('應該防止 XSS 攻擊在用戶名中', async () => {
      const xssPayloads = [
        '<script>alert("XSS")</script>',
        '<img src="x" onerror="alert(\'XSS\')">',
        'javascript:alert("XSS")',
        '<svg onload="alert(\'XSS\')">',
        '"><script>alert("XSS")</script>',
        '&#60;script&#62;alert("XSS")&#60;/script&#62;'
      ];

      for (const payload of xssPayloads) {
        const response = await request(app)
          .post('/api/auth/register')
          .send({
            username: payload,
            email: `test${Date.now()}@example.com`,
            password: 'testpassword123'
          });

        // 應該返回驗證錯誤
        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
      }
    });

    it('應該防止 XSS 攻擊在搜索參數中', async () => {
      const xssPayloads = [
        '<script>alert("XSS")</script>',
        '<img src="x" onerror="alert(\'XSS\')">',
        'javascript:alert("XSS")'
      ];

      for (const payload of xssPayloads) {
        const response = await request(app)
          .get('/api/cards')
          .query({ search: payload })
          .expect(200);

        // 應該返回空結果，而不是執行惡意腳本
        expect(response.body.success).toBe(true);
        expect(response.body.data.cards).toBeDefined();
      }
    });

    it('應該防止 XSS 攻擊在卡片描述中', async () => {
      const xssPayloads = [
        '<script>alert("XSS")</script>',
        '<img src="x" onerror="alert(\'XSS\')">',
        'javascript:alert("XSS")'
      ];

      for (const payload of xssPayloads) {
        const response = await request(app)
          .post('/api/cards')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            name: 'Test Card',
            description: payload,
            currentPrice: 100
          });

        // 應該返回驗證錯誤
        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
      }
    });
  });

  describe('路徑遍歷防護測試', () => {
    it('應該防止路徑遍歷攻擊', async () => {
      const pathTraversalPayloads = [
        '../../../etc/passwd',
        '..\\..\\..\\windows\\system32\\drivers\\etc\\hosts',
        '....//....//....//etc/passwd',
        '%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd',
        '..%252f..%252f..%252fetc%252fpasswd'
      ];

      for (const payload of pathTraversalPayloads) {
        const response = await request(app)
          .get(`/api/export/download/${payload}`)
          .set('Authorization', `Bearer ${authToken}`);

        // 應該返回 404 或 400 錯誤
        expect([400, 404]).toContain(response.status);
      }
    });

    it('應該防止路徑遍歷攻擊在文件上傳中', async () => {
      const pathTraversalPayloads = [
        '../../../etc/passwd',
        '..\\..\\..\\windows\\system32\\drivers\\etc\\hosts'
      ];

      for (const payload of pathTraversalPayloads) {
        const response = await request(app)
          .post('/api/cards/upload-image')
          .set('Authorization', `Bearer ${authToken}`)
          .attach('image', Buffer.from('fake image'), payload);

        // 應該返回驗證錯誤
        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
      }
    });
  });

  describe('命令注入防護測試', () => {
    it('應該防止命令注入攻擊', async () => {
      const commandInjectionPayloads = [
        '; rm -rf /',
        '| rm -rf /',
        '&& rm -rf /',
        '; cat /etc/passwd',
        '| cat /etc/passwd',
        '&& cat /etc/passwd',
        '$(rm -rf /)',
        '`rm -rf /`'
      ];

      for (const payload of commandInjectionPayloads) {
        const response = await request(app)
          .get('/api/cards')
          .query({ search: payload })
          .expect(200);

        // 應該返回空結果，而不是執行惡意命令
        expect(response.body.success).toBe(true);
        expect(response.body.data.cards).toBeDefined();
      }
    });
  });

  describe('CSRF 防護測試', () => {
    it('應該防止 CSRF 攻擊', async () => {
      // 模擬沒有 CSRF token 的請求
      const response = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          currentPassword: 'testpassword123',
          newPassword: 'newpassword123'
        });

      // 應該返回 403 錯誤（CSRF 保護）
      expect(response.status).toBe(403);
    });

    it('應該驗證 CSRF token', async () => {
      const response = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .set('x-csrf-token', 'invalid-token')
        .send({
          currentPassword: 'testpassword123',
          newPassword: 'newpassword123'
        });

      // 應該返回 403 錯誤（無效的 CSRF token）
      expect(response.status).toBe(403);
    });
  });

  describe('暴力破解防護測試', () => {
    it('應該防止暴力破解登錄', async () => {
      const maxAttempts = 5;

      // 嘗試多次錯誤登錄
      for (let i = 0; i < maxAttempts + 1; i++) {
        const response = await request(app)
          .post('/api/auth/login')
          .send({
            email: 'test@example.com',
            password: 'wrongpassword'
          });

        if (i < maxAttempts) {
          // 前幾次應該返回 401
          expect(response.status).toBe(401);
        } else {
          // 超過限制後應該返回 429（太多請求）
          expect(response.status).toBe(429);
        }
      }
    });

    it('應該防止暴力破解註冊', async () => {
      const maxAttempts = 10;

      // 嘗試多次註冊
      for (let i = 0; i < maxAttempts + 1; i++) {
        const response = await request(app)
          .post('/api/auth/register')
          .send({
            username: `testuser${i}`,
            email: `test${i}@example.com`,
            password: 'testpassword123'
          });

        if (i < maxAttempts) {
          // 前幾次應該成功或返回驗證錯誤
          expect([200, 201, 400]).toContain(response.status);
        } else {
          // 超過限制後應該返回 429
          expect(response.status).toBe(429);
        }
      }
    });
  });

  describe('權限提升防護測試', () => {
    it('應該防止普通用戶訪問管理員功能', async () => {
      const adminEndpoints = [
        { method: 'GET', path: '/api/monitoring/metrics' },
        { method: 'GET', path: '/api/export/users' },
        { method: 'DELETE', path: '/api/monitoring/cleanup' },
        { method: 'POST', path: '/api/monitoring/restart' }
      ];

      for (const endpoint of adminEndpoints) {
        const response = await request(app)
          [endpoint.method.toLowerCase()](endpoint.path)
          .set('Authorization', `Bearer ${authToken}`);

        // 應該返回 403 錯誤（權限不足）
        expect(response.status).toBe(403);
      }
    });

    it('應該防止用戶修改其他用戶的資料', async () => {
      // 創建另一個用戶
      const hashedPassword = await bcrypt.hash('testpassword123', 10);
      const otherUser = await User.create({
        username: 'otheruser',
        email: 'other@example.com',
        password: hashedPassword,
        role: 'user'
      });

      // 嘗試修改其他用戶的資料
      const response = await request(app)
        .put(`/api/auth/profile/${otherUser.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          username: 'hackeduser'
        });

      // 應該返回 403 錯誤（權限不足）
      expect(response.status).toBe(403);
    });
  });

  describe('JWT 安全測試', () => {
    it('應該拒絕無效的 JWT token', async () => {
      const invalidTokens = [
        'invalid.token.here',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid.signature',
        'Bearer invalid',
        ''
      ];

      for (const token of invalidTokens) {
        const response = await request(app)
          .get('/api/auth/me')
          .set('Authorization', `Bearer ${token}`);

        // 應該返回 401 錯誤
        expect(response.status).toBe(401);
      }
    });

    it('應該拒絕過期的 JWT token', async () => {
      // 創建一個過期的 token（這裡需要手動設置過期時間）
      const jwt = require('jsonwebtoken');
      const expiredToken = jwt.sign(
        { userId: testUser.id },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '-1h' } // 已經過期
      );

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${expiredToken}`);

      // 應該返回 401 錯誤
      expect(response.status).toBe(401);
    });

    it('應該拒絕篡改的 JWT token', async () => {
      // 創建一個被篡改的 token
      const jwt = require('jsonwebtoken');
      const tamperedToken = jwt.sign(
        { userId: 999999, role: 'admin' }, // 篡改用戶 ID 和角色
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '1h' }
      );

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${tamperedToken}`);

      // 應該返回 401 錯誤或找不到用戶
      expect([401, 404]).toContain(response.status);
    });
  });

  describe('輸入驗證測試', () => {
    it('應該驗證電子郵件格式', async () => {
      const invalidEmails = [
        'invalid-email',
        'test@',
        '@example.com',
        'test..test@example.com',
        'test@example..com',
        'test@example',
        'test@.com'
      ];

      for (const email of invalidEmails) {
        const response = await request(app)
          .post('/api/auth/register')
          .send({
            username: 'testuser',
            email,
            password: 'testpassword123'
          });

        // 應該返回驗證錯誤
        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
      }
    });

    it('應該驗證密碼強度', async () => {
      const weakPasswords = [
        '123',
        'password',
        '123456',
        'qwerty',
        'abc123',
        'password123'
      ];

      for (const password of weakPasswords) {
        const response = await request(app)
          .post('/api/auth/register')
          .send({
            username: 'testuser',
            email: 'test@example.com',
            password
          });

        // 應該返回驗證錯誤
        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
      }
    });

    it('應該驗證用戶名格式', async () => {
      const invalidUsernames = [
        '', // 空字符串
        'a', // 太短
        'a'.repeat(51), // 太長
        'user name', // 包含空格
        'user@name', // 包含特殊字符
        'user-name', // 包含連字符
        'user_name' // 包含下劃線
      ];

      for (const username of invalidUsernames) {
        const response = await request(app)
          .post('/api/auth/register')
          .send({
            username,
            email: 'test@example.com',
            password: 'testpassword123'
          });

        // 應該返回驗證錯誤
        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
      }
    });
  });

  describe('文件上傳安全測試', () => {
    it('應該拒絕非圖片文件', async () => {
      const nonImageFiles = [
        { name: 'test.txt', content: 'This is a text file' },
        { name: 'test.pdf', content: '%PDF-1.4 fake pdf content' },
        { name: 'test.exe', content: 'fake executable content' },
        { name: 'test.js', content: 'console.log("malicious code")' }
      ];

      for (const file of nonImageFiles) {
        const response = await request(app)
          .post('/api/cards/upload-image')
          .set('Authorization', `Bearer ${authToken}`)
          .attach('image', Buffer.from(file.content), file.name);

        // 應該返回驗證錯誤
        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
      }
    });

    it('應該拒絕過大的文件', async () => {
      // 創建一個超過 10MB 的文件
      const largeFile = Buffer.alloc(11 * 1024 * 1024); // 11MB

      const response = await request(app)
        .post('/api/cards/upload-image')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('image', largeFile, 'large-image.jpg');

      // 應該返回驗證錯誤
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('應該拒絕惡意文件名', async () => {
      const maliciousFilenames = [
        '../../../etc/passwd',
        'script.js',
        'virus.exe',
        'malware.bat',
        'shell.php'
      ];

      for (const filename of maliciousFilenames) {
        const response = await request(app)
          .post('/api/cards/upload-image')
          .set('Authorization', `Bearer ${authToken}`)
          .attach('image', Buffer.from('fake image'), filename);

        // 應該返回驗證錯誤
        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
      }
    });
  });

  describe('速率限制測試', () => {
    it('應該限制 API 請求速率', async () => {
      const maxRequests = 100; // 假設限制為 100 請求/分鐘

      // 發送大量請求
      const promises = [];
      for (let i = 0; i < maxRequests + 10; i++) {
        promises.push(
          request(app)
            .get('/api/cards')
            .query({ page: 1, limit: 10 })
        );
      }

      const responses = await Promise.all(promises);

      // 檢查是否有請求被限制
      const rateLimitedResponses = responses.filter(r => r.status === 429);

      // 應該有一些請求被限制
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });

    it('應該限制登錄嘗試速率', async () => {
      const maxAttempts = 5; // 假設限制為 5 次/分鐘

      // 嘗試多次登錄
      for (let i = 0; i < maxAttempts + 1; i++) {
        const response = await request(app)
          .post('/api/auth/login')
          .send({
            email: 'test@example.com',
            password: 'wrongpassword'
          });

        if (i >= maxAttempts) {
          // 超過限制後應該返回 429
          expect(response.status).toBe(429);
        }
      }
    });
  });

  describe('安全標頭測試', () => {
    it('應該設置正確的安全標頭', async () => {
      const response = await request(app)
        .get('/api/cards')
        .expect(200);

      // 檢查安全標頭
      expect(response.headers['x-frame-options']).toBe('DENY');
      expect(response.headers['x-content-type-options']).toBe('nosniff');
      expect(response.headers['x-xss-protection']).toBe('1; mode=block');
      expect(response.headers['referrer-policy']).toBeDefined();
      expect(response.headers['permissions-policy']).toBeDefined();
    });

    it('應該防止點擊劫持', async () => {
      const response = await request(app)
        .get('/api/cards')
        .expect(200);

      // X-Frame-Options 應該設置為 DENY
      expect(response.headers['x-frame-options']).toBe('DENY');
    });

    it('應該防止 MIME 類型嗅探', async () => {
      const response = await request(app)
        .get('/api/cards')
        .expect(200);

      // X-Content-Type-Options 應該設置為 nosniff
      expect(response.headers['x-content-type-options']).toBe('nosniff');
    });
  });

  describe('會話安全測試', () => {
    it('應該設置安全的會話 cookie', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'testpassword123'
        })
        .expect(200);

      // 檢查會話 cookie 的安全屬性
      const cookies = response.headers['set-cookie'];
      if (cookies) {
        const sessionCookie = cookies.find(cookie => cookie.includes('connect.sid'));
        if (sessionCookie) {
          expect(sessionCookie).toContain('HttpOnly');
          expect(sessionCookie).toContain('Secure');
          expect(sessionCookie).toContain('SameSite=Strict');
        }
      }
    });
  });
});
