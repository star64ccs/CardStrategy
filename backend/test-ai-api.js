const axios = require('axios');

const BASE_URL = 'http://localhost:3000';
let authToken = '';

// 測試用戶數據
const testUser = {
  username: 'testuser',
  email: 'test@cardstrategy.com',
  password: 'password123',
  displayName: 'Test User'
};

// 通用請求函數
async function makeRequest(method, endpoint, data = null, headers = {}) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.error(`❌ ${method} ${endpoint} 失敗:`, error.response?.data || error.message);
    return null;
  }
}

// 登錄函數
async function login() {
  console.log('🔐 嘗試登錄...');

  // 先嘗試註冊
  const registerResult = await makeRequest('POST', '/api/auth/register', testUser);
  if (registerResult && registerResult.success) {
    console.log('✅ 註冊成功');
  } else {
    console.log('ℹ️ 用戶可能已存在，嘗試登錄');
  }

  // 登錄
  const loginResult = await makeRequest('POST', '/api/auth/login', {
    identifier: testUser.username,
    password: testUser.password
  });

  if (loginResult && loginResult.success) {
    authToken = loginResult.data.token; // 修正：使用 token 而不是 accessToken
    console.log('✅ 登錄成功');
    console.log('Token:', `${authToken.substring(0, 50)  }...`);
    return true;
  }
  console.log('❌ 登錄失敗');
  return false;

}

// 測試AI卡牌分析
async function testCardAnalysis() {
  console.log('\n📊 測試AI卡牌分析...');

  const result = await makeRequest('POST', '/api/ai/analyze-card', {
    cardId: 1,
    analysisType: 'investment'
  }, { Authorization: `Bearer ${authToken}` });

  if (result && result.success) {
    console.log('✅ AI卡牌分析成功');
    console.log(`   投資評分: ${result.data.analysis.investmentScore}`);
    console.log(`   風險等級: ${result.data.analysis.riskLevel}`);
    console.log(`   置信度: ${result.data.analysis.confidence}`);
  } else {
    console.log('❌ AI卡牌分析失敗');
  }
}

// 測試投資組合分析
async function testPortfolioAnalysis() {
  console.log('\n📈 測試投資組合分析...');

  const result = await makeRequest('POST', '/api/ai/portfolio-analysis', {}, {
    Authorization: `Bearer ${authToken}`
  });

  if (result && result.success) {
    console.log('✅ 投資組合分析成功');
    console.log(`   總投資: ${result.data.portfolioAnalysis.portfolioSummary.totalInvestment}`);
    console.log(`   當前價值: ${result.data.portfolioAnalysis.portfolioSummary.currentValue}`);
    console.log(`   總盈虧: ${result.data.portfolioAnalysis.portfolioSummary.totalProfit}`);
    console.log(`   盈虧百分比: ${result.data.portfolioAnalysis.portfolioSummary.profitPercentage}%`);
  } else {
    console.log('❌ 投資組合分析失敗');
  }
}

// 測試市場預測
async function testMarketPrediction() {
  console.log('\n🔮 測試市場預測...');

  const result = await makeRequest('POST', '/api/ai/market-prediction', {
    timeframe: '1m',
    cardIds: [1, 2]
  }, { Authorization: `Bearer ${authToken}` });

  if (result && result.success) {
    console.log('✅ 市場預測成功');
    console.log(`   時間框架: ${result.data.prediction.timeframe}`);
    console.log(`   整體趨勢: ${result.data.prediction.overallTrend}`);
    console.log(`   置信度: ${result.data.prediction.confidence}`);
    console.log(`   預測數量: ${result.data.prediction.predictions.length}`);
  } else {
    console.log('❌ 市場預測失敗');
  }
}

// 測試智能推薦
async function testSmartRecommendations() {
  console.log('\n🤖 測試智能推薦...');

  const result = await makeRequest('POST', '/api/ai/smart-recommendations', {
    budget: 5000,
    riskTolerance: 'medium',
    cardTypes: ['monster', 'spell'],
    rarities: ['rare', 'mythic']
  }, { Authorization: `Bearer ${authToken}` });

  if (result && result.success) {
    console.log('✅ 智能推薦成功');
    console.log(`   推薦數量: ${result.data.recommendations.recommendations.length}`);
    console.log(`   置信度: ${result.data.recommendations.confidence}`);
    console.log(`   市場機會: ${result.data.recommendations.marketOpportunities.length}`);
  } else {
    console.log('❌ 智能推薦失敗');
  }
}

// 測試圖像識別
async function testImageRecognition() {
  console.log('\n🖼️ 測試圖像識別...');

  // 模擬圖像數據（base64編碼的簡單圖像）
  const mockImageData = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxAAPwA/8A';

  const result = await makeRequest('POST', '/api/ai/image-recognition', {
    imageData: mockImageData
  }, { Authorization: `Bearer ${authToken}` });

  if (result && result.success) {
    console.log('✅ 圖像識別成功');
    console.log(`   識別卡片: ${result.data.recognitionResult.recognizedCard.name}`);
    console.log(`   置信度: ${result.data.recognitionResult.confidence}`);
    console.log(`   替代選項: ${result.data.recognitionResult.alternatives.length}`);
  } else {
    console.log('❌ 圖像識別失敗');
  }
}

// 測試AI聊天
async function testAIChat() {
  console.log('\n💬 測試AI聊天...');

  const result = await makeRequest('POST', '/api/ai/chat', {
    message: '你好，我想了解青眼白龍的投資價值',
    context: { cardId: 1 }
  }, { Authorization: `Bearer ${authToken}` });

  if (result && result.success) {
    console.log('✅ AI聊天成功');
    console.log(`   回應: ${result.data.response.response.substring(0, 50)}...`);
    console.log(`   建議數量: ${result.data.response.suggestions.length}`);
  } else {
    console.log('❌ AI聊天失敗');
  }
}

// 主測試函數
async function runTests() {
  console.log('🚀 開始AI功能API測試...\n');

  // 登錄
  const loginSuccess = await login();
  if (!loginSuccess) {
    console.log('❌ 無法登錄，測試終止');
    return;
  }

  // 執行所有測試
  await testCardAnalysis();
  await testPortfolioAnalysis();
  await testMarketPrediction();
  await testSmartRecommendations();
  await testImageRecognition();
  await testAIChat();

  console.log('\n🎉 AI功能API測試完成！');
}

// 運行測試
runTests().catch(error => {
  console.error('❌ 測試過程中發生錯誤:', error);
});
