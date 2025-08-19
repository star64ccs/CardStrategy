const axios = require('axios');
const localAIService = require('./src/services/localAIService');

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
    authToken = loginResult.data.token;
    console.log('✅ 登錄成功');
    console.log('Token:', `${authToken.substring(0, 50)  }...`);
    return true;
  }
  console.log('❌ 登錄失敗');
  return false;

}

// 測試AI健康檢查
async function testAIHealth() {
  console.log('\n🏥 測試AI健康檢查...');

  const result = await makeRequest('GET', '/api/local-ai/health');

  if (result && result.success) {
    console.log('✅ AI健康檢查成功');
    console.log('   狀態:', result.data.status);
    console.log('   可用提供商:', result.data.status.availableProviders);
  } else {
    console.log('❌ AI健康檢查失敗');
  }
}

// 測試獲取AI提供商
async function testGetProviders() {
  console.log('\n🔧 測試獲取AI提供商...');

  const result = await makeRequest('GET', '/api/local-ai/providers', null, {
    Authorization: `Bearer ${authToken}`
  });

  if (result && result.success) {
    console.log('✅ 獲取AI提供商成功');
    console.log('   提供商數量:', result.data.count);
    result.data.providers.forEach(provider => {
      console.log(`   - ${provider.name}: ${provider.isAvailable ? '可用' : '不可用'}`);
    });
  } else {
    console.log('❌ 獲取AI提供商失敗');
  }
}

// 測試AI文本生成
async function testTextGeneration() {
  console.log('\n📝 測試AI文本生成...');

  const result = await makeRequest('POST', '/api/local-ai/generate', {
    prompt: '請簡短介紹一下卡片投資的基本概念和注意事項',
    taskType: 'text_generation',
    options: {
      temperature: 0.7,
      maxTokens: 200
    }
  }, {
    Authorization: `Bearer ${authToken}`
  });

  if (result && result.success) {
    console.log('✅ AI文本生成成功');
    console.log('   使用模型:', result.data.model);
    console.log('   提供商:', result.data.provider);
    console.log('   生成內容:', `${result.data.data.substring(0, 100)  }...`);
  } else {
    console.log('❌ AI文本生成失敗');
  }
}

// 測試卡片分析
async function testCardAnalysis() {
  console.log('\n🃏 測試卡片分析...');

  const cardData = {
    name: '青眼白龍',
    rarity: 'Ultra Rare',
    type: 'Monster',
    currentPrice: 150.00,
    releaseYear: 1999
  };

  const result = await makeRequest('POST', '/api/local-ai/analyze-card', {
    cardData,
    analysisType: 'investment'
  }, {
    Authorization: `Bearer ${authToken}`
  });

  if (result && result.success) {
    console.log('✅ 卡片分析成功');
    console.log('   使用模型:', result.data.model);
    console.log('   提供商:', result.data.provider);
    console.log('   分析結果:', `${result.data.data.substring(0, 150)  }...`);
  } else {
    console.log('❌ 卡片分析失敗');
  }
}

// 測試價格預測
async function testPricePrediction() {
  console.log('\n📈 測試價格預測...');

  const cardData = {
    name: '黑魔導',
    currentPrice: 80.00,
    priceHistory: [75, 78, 82, 80, 85],
    marketTrend: '上升'
  };

  const result = await makeRequest('POST', '/api/local-ai/predict-price', {
    cardData,
    timeframe: '1m'
  }, {
    Authorization: `Bearer ${authToken}`
  });

  if (result && result.success) {
    console.log('✅ 價格預測成功');
    console.log('   使用模型:', result.data.model);
    console.log('   提供商:', result.data.provider);
    console.log('   預測結果:', `${result.data.data.substring(0, 150)  }...`);
  } else {
    console.log('❌ 價格預測失敗');
  }
}

// 測試市場分析
async function testMarketAnalysis() {
  console.log('\n📊 測試市場分析...');

  const marketData = {
    topCards: ['青眼白龍', '黑魔導', '真紅眼黑龍'],
    trends: ['稀有卡價格上漲', '競技卡需求增加'],
    marketVolume: 1000000
  };

  const result = await makeRequest('POST', '/api/local-ai/analyze-market', {
    marketData
  }, {
    Authorization: `Bearer ${authToken}`
  });

  if (result && result.success) {
    console.log('✅ 市場分析成功');
    console.log('   使用模型:', result.data.model);
    console.log('   提供商:', result.data.provider);
    console.log('   分析結果:', `${result.data.data.substring(0, 150)  }...`);
  } else {
    console.log('❌ 市場分析失敗');
  }
}

// 測試批量分析
async function testBatchAnalysis() {
  console.log('\n🔄 測試批量分析...');

  const tasks = [
    {
      id: 1,
      type: 'card_analysis',
      data: { name: '青眼白龍', rarity: 'Ultra Rare', currentPrice: 150 },
      analysisType: 'investment'
    },
    {
      id: 2,
      type: 'price_prediction',
      data: { name: '黑魔導', currentPrice: 80, priceHistory: [75, 78, 82] },
      timeframe: '1m'
    },
    {
      id: 3,
      type: 'text_generation',
      prompt: '簡述卡片收藏的樂趣',
      taskType: 'text_generation',
      options: { maxTokens: 100 }
    }
  ];

  const result = await makeRequest('POST', '/api/local-ai/batch-analyze', {
    tasks
  }, {
    Authorization: `Bearer ${authToken}`
  });

  if (result && result.success) {
    console.log('✅ 批量分析成功');
    console.log('   總任務數:', result.data.data.summary.total);
    console.log('   成功任務:', result.data.data.summary.successful);
    console.log('   失敗任務:', result.data.data.summary.failed);
  } else {
    console.log('❌ 批量分析失敗');
  }
}

// 測試AI服務
async function testAIService() {
  console.log('\n🧪 測試AI服務...');

  const result = await makeRequest('POST', '/api/local-ai/test', {}, {
    Authorization: `Bearer ${authToken}`
  });

  if (result && result.success) {
    console.log('✅ AI服務測試成功');
    console.log('   使用模型:', result.data.data.model);
    console.log('   提供商:', result.data.data.provider);
    console.log('   測試結果:', `${result.data.data.data.substring(0, 100)  }...`);
  } else {
    console.log('❌ AI服務測試失敗');
  }
}

// 主測試函數
async function runTests() {
  console.log('🚀 開始測試本地AI服務...\n');

  // 登錄
  const loginSuccess = await login();
  if (!loginSuccess) {
    console.log('❌ 登錄失敗，無法繼續測試');
    return;
  }

  // 運行所有測試
  await testAIHealth();
  await testGetProviders();
  await testTextGeneration();
  await testCardAnalysis();
  await testPricePrediction();
  await testMarketAnalysis();
  await testBatchAnalysis();
  await testAIService();

  console.log('\n🎉 所有測試完成！');
}

// 運行測試
runTests().catch(error => {
  console.error('❌ 測試過程中發生錯誤:', error);
});
