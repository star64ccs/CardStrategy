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
   * Initialize WebSocket Service
   */
  initialize(server) {
    try {
      // Create Socket.IO Server
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
          // Allow所有Request，在Connect時進Row身份Verify
          callback(null, true);
        },
      });

      // Initialize Redis Client
      this.initializeRedis();

      // Settings中間件
      this.setupMiddleware();

      // SettingsEventHandle器
      this.setupEventHandlers();

      // Settings房間Manage
      this.setupRoomManagement();

      // Settings定期清理
      this.setupPeriodicCleanup();

      logger.info('WebSocket ServiceInitialize完成');
    } catch (error) {
      logger.error('WebSocket ServiceInitializeFailed:', error);
      throw error;
    }
  }

  /**
   * Initialize Redis Client
   */
  async initializeRedis() {
    try {
      this.redisClient = redis.createClient({
        url: process.env.REDIS_URL || 'redis://localhost:6379',
        retry_strategy: (options) => {
          if (options.error && options.error.code === 'ECONNREFUSED') {
            logger.error('Redis Server拒絕Connect');
            return new Error('Redis Server不可用');
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
      logger.info('Redis 客戶端ConnectSuccess');
    } catch (error) {
      logger.error('Redis 客戶端ConnectFailed:', error);
      // 如果 Redis 不可用，使用MemoryStorage
      this.redisClient = null;
    }
  }

  /**
   * Settings中間件
   */
  setupMiddleware() {
    // 身份Verify中間件
    this.io.use(async (socket, next) => {
      try {
        const token =
          socket.handshake.auth.token || socket.handshake.headers.authorization;

        if (!token) {
          return next(new Error('未提供認證令牌'));
        }

        // Remove Bearer 前綴
        const cleanToken = token.replace('Bearer ', '');

        // Verify JWT 令牌
        const decoded = jwt.verify(cleanToken, process.env.JWT_SECRET);

        // 將UserInformationAdd到 socket
        socket.userId = decoded.id;
        socket.userRole = decoded.role;
        socket.userData = decoded;

        next();
      } catch (error) {
        logger.error('WebSocket 身份VerifyFailed:', error);
        next(new Error('身份VerifyFailed'));
      }
    });

    // 速率Limit中間件
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
        logger.error('WebSocket 速率限制CheckFailed:', error);
        next();
      }
    });
  }

  /**
   * SettingsEventHandle器
   */
  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      logger.info(`用戶Connect: ${socket.userId} (${socket.handshake.address})`);

      // 將UserAdd到ConnectMap
      this.connectedUsers.set(socket.userId, {
        socketId: socket.id,
        userId: socket.userId,
        userRole: socket.userRole,
        connectedAt: new Date(),
        lastActivity: new Date(),
        rooms: new Set(),
      });

      // 加入User專屬房間
      socket.join(`user:${socket.userId}`);
      socket.join(`role:${socket.userRole}`);

      // Handle加入房間
      socket.on('join_room', (roomName) => {
        this.handleJoinRoom(socket, roomName);
      });

      // Handle離On房間
      socket.on('leave_room', (roomName) => {
        this.handleLeaveRoom(socket, roomName);
      });

      // Handle私人Message
      socket.on('private_message', (data) => {
        this.handlePrivateMessage(socket, data);
      });

      // Handle房間Message
      socket.on('room_message', (data) => {
        this.handleRoomMessage(socket, data);
      });

      // Handle廣播Message
      socket.on('broadcast_message', (data) => {
        this.handleBroadcastMessage(socket, data);
      });

      // HandleUserStatusUpdate
      socket.on('user_status_update', (data) => {
        this.handleUserStatusUpdate(socket, data);
      });

      // Handle心跳
      socket.on('ping', () => {
        socket.emit('pong', { timestamp: Date.now() });
        this.updateUserActivity(socket.userId);
      });

      // HandleDisconnectConnect
      socket.on('disconnect', (reason) => {
        this.handleDisconnect(socket, reason);
      });

      // HandleError
      socket.on('error', (error) => {
        logger.error(`Socket Error (${socket.userId}):`, error);
      });

      // Send歡迎Message
      socket.emit('welcome', {
        message: '歡迎使用 CardStrategy 實時Service',
        userId: socket.userId,
        timestamp: new Date().toISOString(),
      });

      // SendConnectStatistics
      this.sendConnectionStats();
    });
  }

  /**
   * Handle加入房間
   */
  handleJoinRoom(socket, roomName) {
    try {
      // Verify房間名稱
      if (!roomName || typeof roomName !== 'string') {
        socket.emit('error', { message: '無效的房間名稱' });
        return;
      }

      // CheckUser權限
      if (roomName.startsWith('admin:') && socket.userRole !== 'admin') {
        socket.emit('error', { message: '權限不足' });
        return;
      }

      // 加入房間
      socket.join(roomName);

      // UpdateUser房間List
// eslint-disable-next-line no-unused-vars
      const userData = this.connectedUsers.get(socket.userId);
      if (userData) {
        userData.rooms.add(roomName);
      }

      // Update房間成員List
      this.updateRoomMembers(roomName);

      socket.emit('room_joined', {
        room: roomName,
        message: `已加入房間: ${roomName}`,
        timestamp: new Date().toISOString(),
      });

      logger.info(`用戶 ${socket.userId} 加入房間: ${roomName}`);
    } catch (error) {
      logger.error('Handle加入房間Failed:', error);
      socket.emit('error', { message: '加入房間Failed' });
    }
  }

  /**
   * Handle離On房間
   */
  handleLeaveRoom(socket, roomName) {
    try {
      socket.leave(roomName);

      // UpdateUser房間List
// eslint-disable-next-line no-unused-vars
      const userData = this.connectedUsers.get(socket.userId);
      if (userData) {
        userData.rooms.delete(roomName);
      }

      // Update房間成員List
      this.updateRoomMembers(roomName);

      socket.emit('room_left', {
        room: roomName,
        message: `已離開房間: ${roomName}`,
        timestamp: new Date().toISOString(),
      });

      logger.info(`用戶 ${socket.userId} 離開房間: ${roomName}`);
    } catch (error) {
      logger.error('Handle離開房間Failed:', error);
      socket.emit('error', { message: '離開房間Failed' });
    }
  }

  /**
   * Handle私人Message
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

      // Send給目標User
      this.io.to(`user:${to}`).emit('private_message', messageData);

      // SendConfirm給Send者
      socket.emit('message_sent', {
        messageId: messageData.id,
        timestamp: messageData.timestamp,
      });

      // Save到 Redis
      this.saveMessageToRedis(messageData);

      logger.info(`私人消息: ${socket.userId} -> ${to}`);
    } catch (error) {
      logger.error('Handle私人消息Failed:', error);
      socket.emit('error', { message: '發送消息Failed' });
    }
  }

  /**
   * Handle房間Message
   */
  handleRoomMessage(socket, data) {
    try {
      const { room, message, type = 'text' } = data;

      if (!room || !message) {
        socket.emit('error', { message: '缺少必要參數' });
        return;
      }

      // CheckUserYesNo在房間中
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

      // Send到房間
      this.io.to(room).emit('room_message', messageData);

      // Save到 Redis
      this.saveMessageToRedis(messageData);

      logger.info(`房間消息: ${socket.userId} -> ${room}`);
    } catch (error) {
      logger.error('Handle房間消息Failed:', error);
      socket.emit('error', { message: '發送消息Failed' });
    }
  }

  /**
   * Handle廣播Message
   */
  handleBroadcastMessage(socket, data) {
    try {
      const { message, type = 'text', target = 'all' } = data;

      if (!message) {
        socket.emit('error', { message: '缺少消息內容' });
        return;
      }

      // Check權限
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

      // Root據目標Send廣播
      if (target === 'all') {
        this.io.emit('broadcast_message', messageData);
      } else if (target === 'admin') {
        this.io.to('role:admin').emit('broadcast_message', messageData);
      }

      logger.info(`廣播消息: ${socket.userId} -> ${target}`);
    } catch (error) {
      logger.error('Handle廣播消息Failed:', error);
      socket.emit('error', { message: '發送廣播Failed' });
    }
  }

  /**
   * HandleUserStatusUpdate
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

      // Notification其他UserStatusUpdate
      socket.broadcast.emit('user_status_changed', {
        userId: socket.userId,
        status,
        customStatus,
        timestamp: new Date().toISOString(),
      });

      logger.info(`用戶狀態更新: ${socket.userId} -> ${status}`);
    } catch (error) {
      logger.error('Handle用戶狀態UpdateFailed:', error);
      socket.emit('error', { message: '狀態UpdateFailed' });
    }
  }

  /**
   * HandleDisconnectConnect
   */
  handleDisconnect(socket, reason) {
    logger.info(`用戶斷開Connect: ${socket.userId} (原因: ${reason})`);

    // 從ConnectMap中Remove
    this.connectedUsers.delete(socket.userId);

    // Notification其他User
    socket.broadcast.emit('user_disconnected', {
      userId: socket.userId,
      timestamp: new Date().toISOString(),
    });

    // UpdateConnectStatistics
    this.sendConnectionStats();
  }

  /**
   * UpdateUser活動Time
   */
  updateUserActivity(userId) {
// eslint-disable-next-line no-unused-vars
    const userData = this.connectedUsers.get(userId);
    if (userData) {
      userData.lastActivity = new Date();
    }
  }

  /**
   * Update房間成員List
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

      // Send房間成員Update
      this.io.to(roomName).emit('room_members_updated', {
        room: roomName,
        members,
        memberCount: members.length,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Update房間成員Failed:', error);
    }
  }

  /**
   * SendConnectStatistics
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
   * SaveMessage到 Redis
   */
  async saveMessageToRedis(messageData) {
    if (!this.redisClient) return;

    try {
// eslint-disable-next-line no-unused-vars
      const key = `messages:${messageData.id}`;
      await this.redisClient.setex(key, 86400, JSON.stringify(messageData)); // 24Hour過期
    } catch (error) {
      logger.error('保存消息到 Redis Failed:', error);
    }
  }

  /**
   * Settings房間Manage
   */
  setupRoomManagement() {
    // CreateDefault房間
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
   * Settings定期清理
   */
  setupPeriodicCleanup() {
    // 每5Minute清理不活躍的Connect
    setInterval(
      () => {
// eslint-disable-next-line no-unused-vars
        const now = new Date();
        const inactiveThreshold = 30 * 60 * 1000; // 30Minute

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
   * SendNotification給User
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
      logger.error('發送通知Failed:', error);
    }
  }

  /**
   * SendNotification給房間
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
      logger.error('發送房間通知Failed:', error);
    }
  }

  /**
   * 廣播Notification
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
      logger.error('廣播通知Failed:', error);
    }
  }

  /**
   * GetConnectStatistics
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
   * GetUserInformation
   */
  getUserInfo(userId) {
    return this.connectedUsers.get(userId);
  }

  /**
   * CheckUserYesNo在線
   */
  isUserOnline(userId) {
    return this.connectedUsers.has(userId);
  }

  /**
   * Off閉Service
   */
  async close() {
    try {
      if (this.io) {
        this.io.close();
      }

      if (this.redisClient) {
        await this.redisClient.quit();
      }

      logger.info('WebSocket Service已關閉');
    } catch (error) {
      logger.error('關閉 WebSocket ServiceFailed:', error);
    }
  }
}

module.exports = new WebSocketService();
