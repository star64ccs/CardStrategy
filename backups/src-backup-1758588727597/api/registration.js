// 優化的註冊 API
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';

const db = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'cardstrategy',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432
});

// 註冊用戶
export async function registerUser(req, res) {
  try {
    // 驗證輸入
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: '輸入驗證失敗',
        details: errors.array()
      });
    }

    const { username, email, password, confirmPassword } = req.body;

    // 檢查密碼匹配
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        error: '密碼不匹配'
      });
    }

    // 檢查用戶名是否已存在
    const usernameExists = await checkUsernameExists(username);
    if (usernameExists) {
      return res.status(409).json({
        success: false,
        error: '用戶名已存在'
      });
    }

    // 檢查郵箱是否已存在
    const emailExists = await checkEmailExists(email);
    if (emailExists) {
      return res.status(409).json({
        success: false,
        error: '郵箱已被註冊'
      });
    }

    // 加密密碼
    const hashedPassword = await bcrypt.hash(password, 12);

    // 創建用戶
    const result = await db.query(
      'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email, created_at',
      [username, email, hashedPassword]
    );

    const user = result.rows[0];

    // 生成 JWT token
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          createdAt: user.created_at
        },
        token
      },
      message: '註冊成功'
    });

  } catch (error) {
    console.error('註冊錯誤:', error);
    res.status(500).json({
      success: false,
      error: '服務器錯誤，請稍後再試'
    });
  }
}

// 檢查用戶名是否存在
export async function checkUsernameExists(username) {
  const result = await db.query(
    'SELECT id FROM users WHERE username = $1',
    [username]
  );
  return result.rows.length > 0;
}

// 檢查郵箱是否存在
export async function checkEmailExists(email) {
  const result = await db.query(
    'SELECT id FROM users WHERE email = $1',
    [email]
  );
  return result.rows.length > 0;
}

// 驗證註冊數據
export const validateRegistration = [
  body('username')
    .isLength({ min: 3, max: 20 })
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('用戶名格式不正確'),
  body('email')
    .isEmail()
    .withMessage('郵箱格式不正確'),
  body('password')
    .isLength({ min: 8 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('密碼強度不足')
];
