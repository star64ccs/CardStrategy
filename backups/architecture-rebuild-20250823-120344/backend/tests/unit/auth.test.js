/* eslint-env jest */

const request = require('supertest');
const app = require('../../src/server');
const { sequelize } = require('../../src/config/database');
const User = require('../../src/models/User');
const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');

describe('認證 API 測試', () => {
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
      role: 'user',
    });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    // 每個測試前清理用戶會話
    authToken = null;
  });

  describe('POST /api/auth/register', () => {
    it('應該成功註冊新用戶', async () => {
      const userData = {
        username: 'newuser',
        email: 'newuser@example.com',
        password: 'newpassword123',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toHaveProperty('id');
      expect(response.body.data.user.username).toBe(userData.username);
      expect(response.body.data.user.email).toBe(userData.email);
      expect(response.body.data.user).not.toHaveProperty('password');
      expect(response.body.data).toHaveProperty('token');
    });

    it('應該拒絕重複的用戶名', async () => {
      const userData = {
        username: 'testuser', // 已存在的用戶名
        email: 'another@example.com',
        password: 'password123',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('用戶名已存在');
    });

    it('應該拒絕重複的電子郵件', async () => {
      const userData = {
        username: 'anotheruser',
        email: 'test@example.com', // 已存在的電子郵件
        password: 'password123',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('電子郵件已存在');
    });

    it('應該驗證密碼長度', async () => {
      const userData = {
        username: 'shortpass',
        email: 'short@example.com',
        password: '123', // 太短的密碼
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('密碼長度');
    });

    it('應該驗證電子郵件格式', async () => {
      const userData = {
        username: 'invalidemail',
        email: 'invalid-email',
        password: 'password123',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('電子郵件格式');
    });
  });

  describe('POST /api/auth/login', () => {
    it('應該成功登錄有效用戶', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'testpassword123',
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toHaveProperty('id');
      expect(response.body.data.user.email).toBe(loginData.email);
      expect(response.body.data.user).not.toHaveProperty('password');
      expect(response.body.data).toHaveProperty('token');

      // 保存 token 供後續測試使用
      authToken = response.body.data.token;
    });

    it('應該拒絕無效的電子郵件', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'testpassword123',
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('無效的憑證');
    });

    it('應該拒絕錯誤的密碼', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('無效的憑證');
    });

    it('應該驗證必填字段', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('電子郵件和密碼');
    });
  });

  describe('GET /api/auth/me', () => {
    it('應該返回當前用戶信息（有效 token）', async () => {
      // 先登錄獲取 token
      const loginResponse = await request(app).post('/api/auth/login').send({
        email: 'test@example.com',
        password: 'testpassword123',
      });

      const { token } = loginResponse.body.data;

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toHaveProperty('id');
      expect(response.body.data.user.email).toBe('test@example.com');
      expect(response.body.data.user).not.toHaveProperty('password');
    });

    it('應該拒絕無效的 token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('無效的 token');
    });

    it('應該拒絕缺少 token 的請求', async () => {
      const response = await request(app).get('/api/auth/me').expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('未提供 token');
    });
  });

  describe('PUT /api/auth/profile', () => {
    let userToken;

    beforeEach(async () => {
      // 登錄獲取 token
      const loginResponse = await request(app).post('/api/auth/login').send({
        email: 'test@example.com',
        password: 'testpassword123',
      });
      userToken = loginResponse.body.data.token;
    });

    it('應該成功更新用戶資料', async () => {
      const updateData = {
        username: 'updateduser',
        email: 'updated@example.com',
      };

      const response = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${userToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.username).toBe(updateData.username);
      expect(response.body.data.user.email).toBe(updateData.email);
    });

    it('應該驗證電子郵件格式', async () => {
      const updateData = {
        email: 'invalid-email-format',
      };

      const response = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${userToken}`)
        .send(updateData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('電子郵件格式');
    });

    it('應該拒絕重複的電子郵件', async () => {
      // 創建另一個用戶
      await User.create({
        username: 'anotheruser',
        email: 'another@example.com',
        password: await bcrypt.hash('password123', 10),
        role: 'user',
      });

      const updateData = {
        email: 'another@example.com',
      };

      const response = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${userToken}`)
        .send(updateData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('電子郵件已存在');
    });
  });

  describe('PUT /api/auth/password', () => {
    let userToken;

    beforeEach(async () => {
      // 登錄獲取 token
      const loginResponse = await request(app).post('/api/auth/login').send({
        email: 'test@example.com',
        password: 'testpassword123',
      });
      userToken = loginResponse.body.data.token;
    });

    it('應該成功更改密碼', async () => {
      const passwordData = {
        currentPassword: 'testpassword123',
        newPassword: 'newpassword123',
      };

      const response = await request(app)
        .put('/api/auth/password')
        .set('Authorization', `Bearer ${userToken}`)
        .send(passwordData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('密碼更改成功');
    });

    it('應該拒絕錯誤的當前密碼', async () => {
      const passwordData = {
        currentPassword: 'wrongpassword',
        newPassword: 'newpassword123',
      };

      const response = await request(app)
        .put('/api/auth/password')
        .set('Authorization', `Bearer ${userToken}`)
        .send(passwordData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('當前密碼錯誤');
    });

    it('應該驗證新密碼長度', async () => {
      const passwordData = {
        currentPassword: 'testpassword123',
        newPassword: '123', // 太短的密碼
      };

      const response = await request(app)
        .put('/api/auth/password')
        .set('Authorization', `Bearer ${userToken}`)
        .send(passwordData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('密碼長度');
    });
  });

  describe('POST /api/auth/logout', () => {
    let userToken;

    beforeEach(async () => {
      // 登錄獲取 token
      const loginResponse = await request(app).post('/api/auth/login').send({
        email: 'test@example.com',
        password: 'testpassword123',
      });
      userToken = loginResponse.body.data.token;
    });

    it('應該成功登出', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('登出成功');
    });

    it('應該拒絕無效 token 的登出請求', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('無效的 token');
    });
  });

  describe('速率限制測試', () => {
    it('應該限制登錄嘗試次數', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      // 嘗試多次登錄
      for (let i = 0; i < 6; i++) {
        const response = await request(app)
          .post('/api/auth/login')
          .send(loginData);

        if (i < 5) {
          expect(response.status).toBe(401);
        } else {
          // 第 6 次應該被限制
          expect(response.status).toBe(429);
          expect(response.body.message).toContain('請求過於頻繁');
        }
      }
    });
  });
});
