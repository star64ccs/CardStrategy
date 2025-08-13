const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cardstrategy';
    
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      bufferCommands: false,
      bufferMaxEntries: 0
    };

    await mongoose.connect(mongoURI, options);
    
    logger.info('MongoDB連接成功');
    
    // 監聽連接事件
    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB連接錯誤:', err);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB連接斷開');
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('MongoDB重新連接成功');
    });

  } catch (error) {
    logger.error('MongoDB連接失敗:', error);
    process.exit(1);
  }
};

module.exports = connectDB;
