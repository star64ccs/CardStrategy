const axios = require('axios');

// Render 配置
const renderConfig = {
  apiToken: process.env.RENDER_TOKEN,
  serviceId: process.env.RENDER_STAGING_SERVICE_ID,
  apiUrl: 'https://api.render.com/v1'
};

console.log('🧪 Render 測試環境設置工具');
console.log('='.repeat(50));

// 檢查環境變數
function checkEnvironmentVariables() {
  console.log('🔍 檢查環境變數...');
  
  if (!renderConfig.apiToken) {
    console.error('❌ 未設置 RENDER_TOKEN 環境變數');
    console.log('請在 GitHub Secrets 中設置 RENDER_TOKEN');
    return false;
  }
  
  if (!renderConfig.serviceId) {
    console.error('❌ 未設置 RENDER_STAGING_SERVICE_ID 環境變數');
    console.log('請在 GitHub Secrets 中設置 RENDER_STAGING_SERVICE_ID');
    return false;
  }
  
  console.log('✅ 環境變數檢查通過');
  return true;
}

// 獲取服務信息
async function getServiceInfo() {
  console.log('\n🔍 獲取服務信息...');
  
  try {
    const response = await axios.get(`${renderConfig.apiUrl}/services/${renderConfig.serviceId}`, {
      headers: {
        'Authorization': `Bearer ${renderConfig.apiToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.data) {
      const service = response.data;
      console.log(`✅ 服務名稱: ${service.service.name}`);
      console.log(`📊 狀態: ${service.service.status}`);
      console.log(`🌐 URL: ${service.service.serviceDetails?.url || 'N/A'}`);
      console.log(`📅 創建時間: ${new Date(service.service.createdAt).toLocaleString()}`);
      return service;
    }
  } catch (error) {
    console.error('❌ 獲取服務信息失敗:', error.message);
    return null;
  }
}

// 觸發部署
async function triggerDeploy() {
  console.log('\n🚀 觸發部署...');
  
  try {
    const response = await axios.post(`${renderConfig.apiUrl}/services/${renderConfig.serviceId}/deploys`, {}, {
      headers: {
        'Authorization': `Bearer ${renderConfig.apiToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.data) {
      const deploy = response.data;
      console.log(`✅ 部署已觸發`);
      console.log(`🆔 部署 ID: ${deploy.deploy.id}`);
      console.log(`📊 狀態: ${deploy.deploy.status}`);
      console.log(`📅 開始時間: ${new Date(deploy.deploy.createdAt).toLocaleString()}`);
      return deploy;
    }
  } catch (error) {
    console.error('❌ 觸發部署失敗:', error.message);
    return null;
  }
}

// 檢查部署狀態
async function checkDeployStatus(deployId) {
  console.log('\n🔍 檢查部署狀態...');
  
  try {
    const response = await axios.get(`${renderConfig.apiUrl}/services/${renderConfig.serviceId}/deploys/${deployId}`, {
      headers: {
        'Authorization': `Bearer ${renderConfig.apiToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.data) {
      const deploy = response.data;
      console.log(`📊 部署狀態: ${deploy.deploy.status}`);
      console.log(`⏱️  開始時間: ${new Date(deploy.deploy.createdAt).toLocaleString()}`);
      
      if (deploy.deploy.finishedAt) {
        console.log(`✅ 完成時間: ${new Date(deploy.deploy.finishedAt).toLocaleString()}`);
      }
      
      return deploy.deploy.status;
    }
  } catch (error) {
    console.error('❌ 檢查部署狀態失敗:', error.message);
    return null;
  }
}

// 健康檢查
async function healthCheck(serviceUrl) {
  console.log('\n🏥 執行健康檢查...');
  
  try {
    const response = await axios.get(`${serviceUrl}/api/health`, {
      timeout: 10000
    });
    
    if (response.data.success) {
      console.log('✅ 健康檢查通過');
      console.log(`📊 響應時間: ${response.headers['x-response-time'] || 'N/A'}`);
      console.log(`📋 響應數據:`, response.data);
      return true;
    } else {
      console.log('⚠️ 健康檢查響應異常:', response.data);
      return false;
    }
  } catch (error) {
    console.error('❌ 健康檢查失敗:', error.message);
    return false;
  }
}

// 等待部署完成
async function waitForDeploy(deployId, maxWaitTime = 300000) { // 5 分鐘
  console.log('\n⏳ 等待部署完成...');
  
  const startTime = Date.now();
  let status = 'pending';
  
  while (status === 'pending' || status === 'building') {
    if (Date.now() - startTime > maxWaitTime) {
      console.log('⏰ 部署超時');
      return false;
    }
    
    status = await checkDeployStatus(deployId);
    
    if (status === 'live') {
      console.log('✅ 部署成功完成');
      return true;
    } else if (status === 'failed') {
      console.log('❌ 部署失敗');
      return false;
    }
    
    // 等待 10 秒後再次檢查
    await new Promise(resolve => setTimeout(resolve, 10000));
  }
  
  return false;
}

// 主函數
async function setupRenderStaging() {
  console.log('\n🚀 開始設置 Render 測試環境...\n');
  
  try {
    // 1. 檢查環境變數
    if (!checkEnvironmentVariables()) {
      return;
    }
    
    // 2. 獲取服務信息
    const service = await getServiceInfo();
    if (!service) {
      return;
    }
    
    // 3. 觸發部署
    const deploy = await triggerDeploy();
    if (!deploy) {
      return;
    }
    
    // 4. 等待部署完成
    const deploySuccess = await waitForDeploy(deploy.deploy.id);
    if (!deploySuccess) {
      console.log('❌ 部署失敗或超時');
      return;
    }
    
    // 5. 健康檢查
    const serviceUrl = service.service.serviceDetails?.url;
    if (serviceUrl) {
      await healthCheck(serviceUrl);
    }
    
    console.log('\n🎉 Render 測試環境設置完成！');
    console.log('\n📋 測試環境信息:');
    console.log('='.repeat(50));
    console.log(`🌐 服務 URL: ${serviceUrl || 'N/A'}`);
    console.log(`🔧 API 端點: ${serviceUrl ? `${serviceUrl}/api` : 'N/A'}`);
    console.log(`📊 健康檢查: ${serviceUrl ? `${serviceUrl}/api/health` : 'N/A'}`);
    console.log('='.repeat(50));
    
    console.log('\n📋 下一步操作:');
    console.log('1. 測試 API 端點');
    console.log('2. 驗證數據庫連接');
    console.log('3. 運行集成測試');
    console.log('4. 檢查前端應用');
    
  } catch (error) {
    console.error('\n❌ 設置失敗:', error.message);
  }
}

// 如果直接運行此腳本
if (require.main === module) {
  setupRenderStaging()
    .then(() => {
      console.log('\n✅ 腳本執行完成');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ 腳本執行失敗:', error);
      process.exit(1);
    });
}

module.exports = {
  setupRenderStaging,
  getServiceInfo,
  triggerDeploy,
  healthCheck
};
