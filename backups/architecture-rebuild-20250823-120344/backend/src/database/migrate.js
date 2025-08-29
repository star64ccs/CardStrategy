require('dotenv').config({
  path: require('path').resolve(__dirname, '..', '..', '.env'),
});

const { connectDB, getSequelize } = require('../config/database');
const logger = require('../utils/logger');

// 導入所有模型
const getUserModel = require('../models/User');
const getCardModel = require('../models/Card');
const getCollectionModel = require('../models/Collection');
const getInvestmentModel = require('../models/Investment');
const getCollectionCardModel = require('../models/CollectionCard');
const getPriceAlertModel = require('../models/PriceAlert');
const getMarketDataModel = require('../models/MarketData');
const getAIAnalysisModel = require('../models/AIAnalysis');

// 導入新的數據質量相關模型
const {
  createTrainingDataModel,
  getTrainingDataModel,
} = require('../models/TrainingData');
const {
  createAnnotatorModel,
  getAnnotatorModel,
} = require('../models/Annotator');
const {
  createAnnotationDataModel,
  getAnnotationDataModel,
} = require('../models/AnnotationData');
const {
  createDataQualityMetricsModel,
  getDataQualityMetricsModel,
} = require('../models/DataQualityMetrics');

// 導入反饋相關模型
const Feedback = require('../models/Feedback');
const FeedbackResponse = require('../models/FeedbackResponse');
const FeedbackAnalytics = require('../models/FeedbackAnalytics');
const DataQualityAssessment = require('../models/DataQualityAssessment');
const AssessmentSchedule = require('../models/AssessmentSchedule');

// 建立模型關聯
const setupAssociations = (sequelize) => {
  const User = getUserModel();
  const Card = getCardModel();
  const Collection = getCollectionModel();
  const Investment = getInvestmentModel();
  const CollectionCard = getCollectionCardModel();
  const PriceAlert = getPriceAlertModel();
  const MarketData = getMarketDataModel();
  const AIAnalysis = getAIAnalysisModel();

  // 新增的數據質量相關模型
  const TrainingData = getTrainingDataModel();
  const Annotator = getAnnotatorModel();
  const AnnotationData = getAnnotationDataModel();
  const DataQualityMetrics = getDataQualityMetricsModel();

  // 反饋相關模型
  // Feedback, FeedbackResponse, FeedbackAnalytics 已經通過 require 直接導入

  if (
    !User ||
    !Card ||
    !Collection ||
    !Investment ||
    !CollectionCard ||
    !PriceAlert ||
    !MarketData ||
    !AIAnalysis ||
    !TrainingData ||
    !Annotator ||
    !AnnotationData ||
    !DataQualityMetrics
  ) {
    throw new Error('無法創建模型實例');
  }

  try {
    // User 關聯
    User.hasMany(Collection, { foreignKey: 'userId', as: 'collections' });
    User.hasMany(Investment, { foreignKey: 'userId', as: 'investments' });
    User.hasMany(PriceAlert, { foreignKey: 'userId', as: 'priceAlerts' });
    User.hasMany(AIAnalysis, { foreignKey: 'userId', as: 'aiAnalyses' });
    User.hasOne(Annotator, { foreignKey: 'userId', as: 'annotator' });
    User.hasMany(Feedback, { foreignKey: 'userId', as: 'feedbacks' });
    User.hasMany(FeedbackResponse, {
      foreignKey: 'userId',
      as: 'feedbackResponses',
    });
    User.hasMany(DataQualityAssessment, {
      as: 'TriggeredAssessments',
      foreignKey: 'triggeredByUserId',
    });
    User.hasMany(AssessmentSchedule, {
      as: 'CreatedSchedules',
      foreignKey: 'createdBy',
    });

    Collection.belongsTo(User, { foreignKey: 'userId', as: 'user' });
    Investment.belongsTo(User, { foreignKey: 'userId', as: 'user' });
    PriceAlert.belongsTo(User, { foreignKey: 'userId', as: 'user' });
    AIAnalysis.belongsTo(User, { foreignKey: 'userId', as: 'user' });
    Annotator.belongsTo(User, { foreignKey: 'userId', as: 'user' });
    Feedback.belongsTo(User, { foreignKey: 'userId', as: 'user' });
    FeedbackResponse.belongsTo(User, { foreignKey: 'userId', as: 'user' });
    DataQualityAssessment.belongsTo(User, {
      as: 'TriggeredByUser',
      foreignKey: 'triggeredByUserId',
    });
    AssessmentSchedule.belongsTo(User, {
      as: 'CreatedByUser',
      foreignKey: 'createdBy',
    });

    // Card 關聯
    Card.hasMany(Investment, { foreignKey: 'cardId', as: 'investments' });
    Card.hasMany(PriceAlert, { foreignKey: 'cardId', as: 'priceAlerts' });
    Card.hasMany(MarketData, { foreignKey: 'cardId', as: 'marketDataRecords' });
    Card.hasMany(AIAnalysis, { foreignKey: 'cardId', as: 'aiAnalyses' });
    Card.hasMany(TrainingData, { foreignKey: 'cardId', as: 'trainingData' });
    Card.belongsToMany(Collection, {
      through: CollectionCard,
      foreignKey: 'cardId',
      otherKey: 'collectionId',
      as: 'collections',
    });

    Investment.belongsTo(Card, { foreignKey: 'cardId', as: 'card' });
    PriceAlert.belongsTo(Card, { foreignKey: 'cardId', as: 'card' });
    MarketData.belongsTo(Card, { foreignKey: 'cardId', as: 'card' });
    AIAnalysis.belongsTo(Card, { foreignKey: 'cardId', as: 'card' });
    TrainingData.belongsTo(Card, { foreignKey: 'cardId', as: 'card' });

    // Collection 關聯
    Collection.belongsToMany(Card, {
      through: CollectionCard,
      foreignKey: 'collectionId',
      otherKey: 'cardId',
      as: 'cards',
    });
    Collection.hasMany(CollectionCard, {
      foreignKey: 'collectionId',
      as: 'collectionCards',
    });

    // CollectionCard 關聯
    CollectionCard.belongsTo(Collection, {
      foreignKey: 'collectionId',
      as: 'collection',
    });
    CollectionCard.belongsTo(Card, { foreignKey: 'cardId', as: 'card' });

    // 數據質量相關關聯
    // TrainingData 關聯
    TrainingData.hasMany(AnnotationData, {
      foreignKey: 'trainingDataId',
      as: 'annotations',
    });
    TrainingData.belongsTo(Card, { foreignKey: 'cardId', as: 'card' });

    // Annotator 關聯
    Annotator.hasMany(AnnotationData, {
      foreignKey: 'annotatorId',
      as: 'annotations',
    });
    Annotator.hasMany(AnnotationData, {
      foreignKey: 'reviewedBy',
      as: 'reviewedAnnotations',
    });
    Annotator.belongsTo(User, { foreignKey: 'userId', as: 'user' });

    // AnnotationData 關聯
    AnnotationData.belongsTo(TrainingData, {
      foreignKey: 'trainingDataId',
      as: 'trainingData',
    });
    AnnotationData.belongsTo(Annotator, {
      foreignKey: 'annotatorId',
      as: 'annotator',
    });
    AnnotationData.belongsTo(Annotator, {
      foreignKey: 'reviewedBy',
      as: 'reviewer',
    });

    // 反饋相關關聯
    Feedback.hasMany(FeedbackResponse, {
      foreignKey: 'feedbackId',
      as: 'responses',
    });
    Feedback.belongsTo(User, { foreignKey: 'assignedTo', as: 'assignedUser' });
    Feedback.belongsTo(User, {
      foreignKey: 'resolvedBy',
      as: 'resolvedByUser',
    });
    FeedbackResponse.belongsTo(Feedback, {
      foreignKey: 'feedbackId',
      as: 'feedback',
    });

    // 數據質量評估關聯
    DataQualityAssessment.belongsTo(User, {
      as: 'TriggeredByUser',
      foreignKey: 'triggeredByUserId',
    });
    AssessmentSchedule.belongsTo(User, {
      as: 'CreatedByUser',
      foreignKey: 'createdBy',
    });

    logger.info('模型關聯設置完成');
  } catch (error) {
    logger.error('設置模型關聯時出錯：', error.message);
    throw error;
  }
};

// 同步數據庫
const syncDatabase = async () => {
  try {
    logger.info('開始數據庫遷移...');

    // 連接數據庫
    await connectDB();
    const sequelize = getSequelize();

    if (!sequelize) {
      throw new Error('無法獲取 Sequelize 實例');
    }

    // 初始化所有模型
    getUserModel();
    getCardModel();
    getCollectionModel();
    getInvestmentModel();
    getCollectionCardModel();
    getPriceAlertModel();
    getMarketDataModel();
    getAIAnalysisModel();

    // 初始化新的數據質量相關模型
    createTrainingDataModel(sequelize);
    createAnnotatorModel(sequelize);
    createAnnotationDataModel(sequelize);
    createDataQualityMetricsModel(sequelize);

    // 反饋相關模型已經通過 require 直接導入，無需額外初始化

    // 設置關聯
    setupAssociations(sequelize);

    // 同步數據庫表結構
    logger.info('正在同步數據庫表結構...');
    await sequelize.sync({ force: true });

    logger.info('✅ 數據庫遷移完成！');
    logger.info('已創建/更新的表：');
    logger.info('- users (用戶表)');
    logger.info('- cards (卡片表)');
    logger.info('- collections (收藏表)');
    logger.info('- investments (投資表)');
    logger.info('- collection_cards (收藏卡片關聯表)');
    logger.info('- price_alerts (價格提醒表)');
    logger.info('- market_data (市場數據表)');
    logger.info('- ai_analyses (AI分析表)');
    logger.info('- training_data (訓練數據表)');
    logger.info('- annotators (標註者表)');
    logger.info('- annotation_data (標註數據表)');
    logger.info('- data_quality_metrics (數據質量指標表)');
    logger.info('- feedbacks (反饋表)');
    logger.info('- feedback_responses (反饋回應表)');
    logger.info('- feedback_analytics (反饋分析表)');
    logger.info('- data_quality_assessments (數據質量評估表)');
    logger.info('- assessment_schedules (評估計劃表)');

    // 顯示表信息
    const tables = await sequelize.showAllSchemas();
    logger.info(
      '數據庫中的所有表：',
      tables.map((t) => t.name)
    );

    process.exit(0);
  } catch (error) {
    logger.error('❌ 數據庫遷移失敗：', error.message);
    logger.error('錯誤詳情：', error);
    process.exit(1);
  }
};

// 如果直接運行此腳本
if (require.main === module) {
  syncDatabase();
}

module.exports = { syncDatabase, setupAssociations };
