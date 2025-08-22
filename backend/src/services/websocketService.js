const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
// eslint-disable-next-line no-unused-vars
const logger = require('../utils/logger');
const redis = require('redis');
const { v4: uuidv4 } = require('uuid');

class WebSocketService {
  constructor() {
    this.io = null;
    this.redisClient = null;
    this.connectedUsers = new Map();
    this.rooms = new Map();
    this.eventEmitter = null;
  }

  /**
   * 初始化 WebSocket 服務
   */
  initialize(server) {
    try {
      // 創建 Socket.IO 服務器
      this.io = new Server(server, {
        cors: {
          origin: [
            'http://localhost:3000',
            'http://localhost:3001',
            'https://cardstrategy.com',
            'https://www.cardstrategy.com',
            'https://staging.cardstrategy.com',
          ],
          methods: ['GET', 'POST'],
          credentials: true,
        },
        transports: ['websocket', 'polling'],
        allowEIO3: true,
        pingTimeout: 60000,
        pingInterval: 25000,
        upgradeTimeout: 10000,
        maxHttpBufferSize: 1e8,
        allowRequest: (req, callback) => {
          // 允許所有請求，在連接時進行身份驗證
          callback(null, true);
        },
      });

      // 初始化 Redis 客戶端
      this.initializeRedis();

      // 設置中間件
      this.setupMiddleware();

      // 設置事件處理器
      this.setupEventHandlers();

      // 設置房間管理
      this.setupRoomManagement();

      // 設置定期清理
      this.setupPeriodicCleanup();

      logger.info('WebSocket 服務初始化完成');
    } catch (error) {
      logger.error('WebSocket 服務初始化失敗:', error);
      throw error;
    }
  }

  /**
   * 初始化 Redis 客戶端
   */
  async initializeRedis() {
    try {
      this.redisClient = redis.createClient({
        url: process.env.REDIS_URL || 'redis://localhost:6379',
        retry_strategy: (options) => {
          if (options.error && options.error.code === 'ECONNREFUSED') {
            logger.error('Redis 服務器拒絕連接');
            return new Error('Redis 服務器不可用');
          }
          if (options.total_retry_time > 1000 * 60 * 60) {
            logger.error('Redis 重試時間超過限制');
            return new Error('Redis 重試時間超過限制');
          }
          if (options.attempt > 10) {
            logger.error('Redis 重試次數超過限制');
            return new Error('Redis 重試次數超過限制');
          }
          return Math.min(options.attempt * 100, 3000);
        },
      });

      await this.redisClient.connect();
      logger.info('Redis 客戶端連接成功');
    } catch (error) {
      logger.error('Redis 客戶端連接失敗:', error);
      // 如果 Redis 不可用，使用內存存儲
      this.redisClient = null;
    }
  }

  /**
   * 設置中間件
   */
  setupMiddleware() {
    // 身份驗證中間件
    this.io.use(async (socket, next) => {
      try {
        const token =
          socket.handshake.auth.token || socket.handshake.headers.authorization;

        if (!token) {
          return next(new Error('未提供認證令牌'));
        }

        // 移除 Bearer 前綴
        const cleanToken = token.replace('Bearer ', '');

        // 驗證 JWT 令牌
        const decoded = jwt.verify(cleanToken, process.env.JWT_SECRET);

        // 將用戶信息添加到 socket
        socket.userId = decoded.id;
        socket.userRole = decoded.role;
        socket.userData = decoded;

        next();
      } catch (error) {
        logger.error('WebSocket 身份驗證失敗:', error);
        next(new Error('身份驗證失敗'));
      }
    });

    // 速率限制中間件
    this.io.use(async (socket, next) => {
      try {
        const clientId = socket.handshake.address;
// eslint-disable-next-line no-unused-vars
        const key = `ws_rate_limit:${clientId}`;

        if (this.redisClient) {
          const current = await this.redisClient.get(key);
          if (current && parseInt(current) > 100) {
            return next(new Error('速率限制超出'));
          }
          await this.redisClient.incr(key);
          await this.redisClient.expire(key, 60);
        }

        next();
      } catch (error) {
        logger.error('WebSocket 速率限制檢查失敗:', error);
        next();
      }
    });
  }

  /**
   * 設置事件處理器
   */
  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      logger.info(`用戶連接: ${socket.userId} (${socket.handshake.address})`);

      // 將用戶添加到連接映射
      this.connectedUsers.set(socket.userId, {
        socketId: socket.id,
        userId: socket.userId,
        userRole: socket.userRole,
        connectedAt: new Date(),
        lastActivity: new Date(),
        rooms: new Set(),
      });

      // 加入用戶專屬房間
      socket.join(`user:${socket.userId}`);
      socket.join(`role:${socket.userRole}`);

      // 處理加入房間
      socket.on('join_room', (roomName) => {
        this.handleJoinRoom(socket, roomName);
      });

      // 處理離開房間
      socket.on('leave_room', (roomName) => {
        this.handleLeaveRoom(socket, roomName);
      });

      // 處理私人消息
      socket.on('private_message', (data) => {
        this.handlePrivateMessage(socket, data);
      });

      // 處理房間消息
      socket.on('room_message', (data) => {
        this.handleRoomMessage(socket, data);
      });

      // 處理廣播消息
      socket.on('broadcast_message', (data) => {
        this.handleBroadcastMessage(socket, data);
      });

      // 處理用戶狀態更新
      socket.on('user_status_update', (data) => {
        this.handleUserStatusUpdate(socket, data);
      });

      // 處理心跳
      socket.on('ping', () => {
        socket.emit('pong', { timestamp: Date.now() });
        this.updateUserActivity(socket.userId);
      });

      // 處理斷開連接
      socket.on('disconnect', (reason) => {
        this.handleDisconnect(socket, reason);
      });

      // 處理錯誤
      socket.on('error', (error) => {
        logger.error(`Socket 錯誤 (${socket.userId}):`, error);
      });

      // 發送歡迎消息
      socket.emit('welcome', {
        message: '歡迎使用 CardStrategy 實時服務',
        userId: socket.userId,
        timestamp: new Date().toISOString(),
      });

      // 發送連接統計
      this.sendConnectionStats();
    });
  }

  /**
   * 處理加入房間
   */
  handleJoinRoom(socket, roomName) {
    try {
      // 驗證房間名稱
      if (!roomName || typeof roomName !== 'string') {
        socket.emit('error', { message: '無效的房間名稱' });
        return;
      }

      // 檢查用戶權限
      if (roomName.startsWith('admin:') && socket.userRole !== 'admin') {
        socket.emit('error', { message: '權限不足' });
        return;
      }

      // 加入房間
      socket.join(roomName);

      // 更新用戶房間列表
// eslint-disable-next-line no-unused-vars
      const userData = this.connectedUsers.get(socket.userId);
      if (userData) {
        userData.rooms.add(roomName);
      }

      // 更新房間成員列表
      this.updateRoomMembers(roomName);

      socket.emit('room_joined', {
        room: roomName,
        message: `已加入房間: ${roomName}`,
        timestamp: new Date().toISOString(),
      });

      logger.info(`用戶 ${socket.userId} 加入房間: ${roomName}`);
    } catch (error) {
      logger.error('處理加入房間失敗:', error);
      socket.emit('error', { message: '加入房間失敗' });
    }
  }

  /**
   * 處理離開房間
   */
  handleLeaveRoom(socket, roomName) {
    try {
      socket.leave(roomName);

      // 更新用戶房間列表
// eslint-disable-next-line no-unused-vars
      const userData = this.connectedUsers.get(socket.userId);
      if (userData) {
        userData.rooms.delete(roomName);
      }

      // 更新房間成員列表
      this.updateRoomMembers(roomName);

      socket.emit('room_left', {
        room: roomName,
        message: `已離開房間: ${roomName}`,
        timestamp: new Date().toISOString(),
      });

      logger.info(`用戶 ${socket.userId} 離開房間: ${roomName}`);
    } catch (error) {
      logger.error('處理離開房間失敗:', error);
      socket.emit('error', { message: '離開房間失敗' });
    }
  }

  /**
   * 處理私人消息
   */
  handlePrivateMessage(socket, data) {
    try {
      const { to, message, type = 'text' } = data;

      if (!to || !message) {
        socket.emit('error', { message: '缺少必要參數' });
        return;
      }

      const messageData = {
        id: uuidv4(),
        from: socket.userId,
        to,
        message,
        type,
        timestamp: new Date().toISOString(),
      };

      // 發送給目標用戶
      this.io.to(`user:${to}`).emit('private_message', messageData);

      // 發送確認給發送者
      socket.emit('message_sent', {
        messageId: messageData.id,
        timestamp: messageData.timestamp,
      });

      // 保存到 Redis
      this.saveMessageToRedis(messageData);

      logger.info(`私人消息: ${socket.userId} -> ${to}`);
    } catch (error) {
      logger.error('處理私人消息失敗:', error);
      socket.emit('error', { message: '發送消息失敗' });
    }
  }

  /**
   * 處理房間消息
   */
  handleRoomMessage(socket, data) {
    try {
      const { room, message, type = 'text' } = data;

      if (!room || !message) {
        socket.emit('error', { message: '缺少必要參數' });
        return;
      }

      // 檢查用戶是否在房間中
// eslint-disable-next-line no-unused-vars
      const userData = this.connectedUsers.get(socket.userId);
      if (!userData || !userData.rooms.has(room)) {
        socket.emit('error', { message: '您不在該房間中' });
        return;
      }

      const messageData = {
        id: uuidv4(),
        from: socket.userId,
        room,
        message,
        type,
        timestamp: new Date().toISOString(),
      };

      // 發送到房間
      this.io.to(room).emit('room_message', messageData);

      // 保存到 Redis
      this.saveMessageToRedis(messageData);

      logger.info(`房間消息: ${socket.userId} -> ${room}`);
    } catch (error) {
      logger.error('處理房間消息失敗:', error);
      socket.emit('error', { message: '發送消息失敗' });
    }
  }

  /**
   * 處理廣播消息
   */
  handleBroadcastMessage(socket, data) {
    try {
      const { message, type = 'text', target = 'all' } = data;

      if (!message) {
        socket.emit('error', { message: '缺少消息內容' });
        return;
      }

      // 檢查權限
      if (target === 'admin' && socket.userRole !== 'admin') {
        socket.emit('error', { message: '權限不足' });
        return;
      }

      const messageData = {
        id: uuidv4(),
        from: socket.userId,
        message,
        type,
        target,
        timestamp: new Date().toISOString(),
      };

      // 根據目標發送廣播
      if (target === 'all') {
        this.io.emit('broadcast_message', messageData);
      } else if (target === 'admin') {
        this.io.to('role:admin').emit('broadcast_message', messageData);
      }

      logger.info(`廣播消息: ${socket.userId} -> ${target}`);
    } catch (error) {
      logger.error('處理廣播消息失敗:', error);
      socket.emit('error', { message: '發送廣播失敗' });
    }
  }

  /**
   * 處理用戶狀態更新
   */
  handleUserStatusUpdate(socket, data) {
    try {
      const { status, customStatus } = data;

// eslint-disable-next-line no-unused-vars
      const userData = this.connectedUsers.get(socket.userId);
      if (userData) {
        userData.status = status;
        userData.customStatus = customStatus;
        userData.lastActivity = new Date();
      }

      // 通知其他用戶狀態更新
      socket.broadcast.emit('user_status_changed', {
        userId: socket.userId,
        status,
        customStatus,
        timestamp: new Date().toISOString(),
      });

      logger.info(`用戶狀態更新: ${socket.userId} -> ${status}`);
    } catch (error) {
      logger.error('處理用戶狀態更新失敗:', error);
      socket.emit('error', { message: '狀態更新失敗' });
    }
  }

  /**
   * 處理斷開連接
   */
  handleDisconnect(socket, reason) {
    logger.info(`用戶斷開連接: ${socket.userId} (原因: ${reason})`);

    // 從連接映射中移除
    this.connectedUsers.delete(socket.userId);

    // 通知其他用戶
    socket.broadcast.emit('user_disconnected', {
      userId: socket.userId,
      timestamp: new Date().toISOString(),
    });

    // 更新連接統計
    this.sendConnectionStats();
  }

  /**
   * 更新用戶活動時間
   */
  updateUserActivity(userId) {
// eslint-disable-next-line no-unused-vars
    const userData = this.connectedUsers.get(userId);
    if (userData) {
      userData.lastActivity = new Date();
    }
  }

  /**
   * 更新房間成員列表
   */
  async updateRoomMembers(roomName) {
    try {
      const sockets = await this.io.in(roomName).fetchSockets();
      const members = sockets.map((socket) => ({
        userId: socket.userId,
        userRole: socket.userRole,
        connectedAt: socket.handshake.time,
      }));

      this.rooms.set(roomName, {
        name: roomName,
        members,
        memberCount: members.length,
        lastUpdated: new Date(),
      });

      // 發送房間成員更新
      this.io.to(roomName).emit('room_members_updated', {
        room: roomName,
        members,
        memberCount: members.length,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('更新房間成員失敗:', error);
    }
  }

  /**
   * 發送連接統計
   */
  sendConnectionStats() {
    const stats = {
      totalConnections: this.connectedUsers.size,
      activeRooms: this.rooms.size,
      timestamp: new Date().toISOString(),
    };

    this.io.emit('connection_stats', stats);
  }

  /**
   * 保存消息到 Redis
   */
  async saveMessageToRedis(messageData) {
    if (!this.redisClient) return;

    try {
// eslint-disable-next-line no-unused-vars
      const key = `messages:${messageData.id}`;
      await this.redisClient.setex(key, 86400, JSON.stringify(messageData)); // 24小時過期
    } catch (error) {
      logger.error('保存消息到 Redis 失敗:', error);
    }
  }

  /**
   * 設置房間管理
   */
  setupRoomManagement() {
    // 創建默認房間
    const defaultRooms = ['general', 'trading', 'analysis', 'news', 'support'];

    defaultRooms.forEach((room) => {
      this.rooms.set(room, {
        name: room,
        members: [],
        memberCount: 0,
        lastUpdated: new Date(),
      });
    });
  }

  /**
   * 設置定期清理
   */
  setupPeriodicCleanup() {
    // 每5分鐘清理不活躍的連接
    setInterval(
      () => {
// eslint-disable-next-line no-unused-vars
        const now = new Date();
        const inactiveThreshold = 30 * 60 * 1000; // 30分鐘

        for (const [userId, userData] of this.connectedUsers.entries()) {
          if (now - userData.lastActivity > inactiveThreshold) {
            logger.info(`清理不活躍用戶: ${userId}`);
            this.connectedUsers.delete(userId);
          }
        }
      },
      5 * 60 * 1000
    );
  }

  /**
   * 發送通知給用戶
   */
  sendNotificationToUser(userId, notification) {
    try {
      this.io.to(`user:${userId}`).emit('notification', {
        id: uuidv4(),
        ...notification,
        timestamp: new Date().toISOString(),
      });

      logger.info(`發送通知給用戶: ${userId}`);
    } catch (error) {
      logger.error('發送通知失敗:', error);
    }
  }

  /**
   * 發送通知給房間
   */
  sendNotificationToRoom(roomName, notification) {
    try {
      this.io.to(roomName).emit('notification', {
        id: uuidv4(),
        ...notification,
        timestamp: new Date().toISOString(),
      });

      logger.info(`發送通知給房間: ${roomName}`);
    } catch (error) {
      logger.error('發送房間通知失敗:', error);
    }
  }

  /**
   * 廣播通知
   */
  broadcastNotification(notification, target = 'all') {
    try {
// eslint-disable-next-line no-unused-vars
      const notificationData = {
        id: uuidv4(),
        ...notification,
        timestamp: new Date().toISOString(),
      };

      if (target === 'all') {
        this.io.emit('notification', notificationData);
      } else if (target === 'admin') {
        this.io.to('role:admin').emit('notification', notificationData);
      }

      logger.info(`廣播通知: ${target}`);
    } catch (error) {
      logger.error('廣播通知失敗:', error);
    }
  }

  /**
   * 獲取連接統計
   */
  getConnectionStats() {
    return {
      totalConnections: this.connectedUsers.size,
      activeRooms: this.rooms.size,
      connectedUsers: Array.from(this.connectedUsers.keys()),
      rooms: Array.from(this.rooms.keys()),
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * 獲取用戶信息
   */
  getUserInfo(userId) {
    return this.connectedUsers.get(userId);
  }

  /**
   * 檢查用戶是否在線
   */
  isUserOnline(userId) {
    return this.connectedUsers.has(userId);
  }

  /**
   * 關閉服務
   */
  async close() {
    try {
      if (this.io) {
        this.io.close();
      }

      if (this.redisClient) {
        await this.redisClient.quit();
      }

      logger.info('WebSocket 服務已關閉');
    } catch (error) {
      logger.error('關閉 WebSocket 服務失敗:', error);
    }
  }
}

module.exports = new WebSocketService();
