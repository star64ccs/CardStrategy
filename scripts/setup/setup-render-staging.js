const axios = require('axios');

// Render Configure
const renderConfig = {
  apiToken: process.env.RENDER_TOKEN,
  serviceId: process.env.RENDER_STAGING_SERVICE_ID,
  apiUrl: 'https://api.render.com/v1',
};

// logger.info('🧪 Render Test環境SettingsTool');
// logger.info('='.repeat(50));

// Check環境變數
function checkEnvironmentVariables() {
  // logger.info('🔍 Check環境變數...');

  if (!renderConfig.apiToken) {
    // logger.info('❌ 未Settings RENDER_TOKEN 環境變數');
    // logger.info('請在 GitHub Secrets 中Settings RENDER_TOKEN');
    return false;
  }

  if (!renderConfig.serviceId) {
    // logger.info('❌ 未Settings RENDER_STAGING_SERVICE_ID 環境變數');
    // logger.info('請在 GitHub Secrets 中Settings RENDER_STAGING_SERVICE_ID');
    return false;
  }

  // logger.info('✅ 環境變數Check通過');
  return true;
}

// GetServiceInformation
async function getServiceInfo() {
  // logger.info('\n🔍 GetServiceInformation...');

  try {
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
    const response = await axios.get(
      `${renderConfig.apiUrl}/services/${renderConfig.serviceId}`,
      {
        headers: {
          Authorization: `Bearer ${renderConfig.apiToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.data) {
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
      const service = response.data;
      // logger.info(`✅ Service名稱: ${service.service.name}`);
      // logger.info(`📊 Status: ${service.service.status}`);
      // logger.info(`🌐 URL: ${service.service.serviceDetails?.url || 'N/A'}`);
      // logger.info(`📅 CreateTime: ${new Date(service.service.createdAt).toLocaleString()}`);
      return service;
    }
  } catch (error) {
    // logger.info('❌ GetServiceInformationFailed:', error.message);
    return null;
  }
}

// 觸發Deploy
async function triggerDeploy() {
  // logger.info('\n🚀 觸發Deploy...');

  try {
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
    const response = await axios.post(
      `${renderConfig.apiUrl}/services/${renderConfig.serviceId}/deploys`,
      {},
      {
        headers: {
          Authorization: `Bearer ${renderConfig.apiToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.data) {
      const deploy = response.data;
      // logger.info(`✅ Deploy已觸發`);
      // logger.info(`🆔 Deploy ID: ${deploy.deploy.id}`);
      // logger.info(`📊 Status: ${deploy.deploy.status}`);
      // logger.info(`📅 BeginTime: ${new Date(deploy.deploy.createdAt).toLocaleString()}`);
      return deploy;
    }
  } catch (error) {
    // logger.info('❌ 觸發DeployFailed:', error.message);
    return null;
  }
}

// CheckDeployStatus
async function checkDeployStatus(deployId) {
  // logger.info('\n🔍 CheckDeployStatus...');

  try {
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
    const response = await axios.get(
      `${renderConfig.apiUrl}/services/${renderConfig.serviceId}/deploys/${deployId}`,
      {
        headers: {
          Authorization: `Bearer ${renderConfig.apiToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.data) {
      const deploy = response.data;
      // logger.info(`📊 DeployStatus: ${deploy.deploy.status}`);
      // logger.info(`⏱️  BeginTime: ${new Date(deploy.deploy.createdAt).toLocaleString()}`);

      if (deploy.deploy.finishedAt) {
        // logger.info(`✅ CompleteTime: ${new Date(deploy.deploy.finishedAt).toLocaleString()}`);
      }

      return deploy.deploy.status;
    }
  } catch (error) {
    // logger.info('❌ CheckDeployStatusFailed:', error.message);
    return null;
  }
}

// 健康Check
async function healthCheck(serviceUrl) {
  // logger.info('\n🏥 執Row健康Check...');

  try {
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
    const response = await axios.get(`${serviceUrl}/api/health`, {
      timeout: 10000,
    });

    if (response.data.success) {
      // logger.info('✅ 健康Check通過');
      // logger.info(`📊 ResponseTime: ${response.headers['x-response-time'] || 'N/A'}`);
      // logger.info(`📋 ResponseData:`, response.data);
      return true;
    } else {
      // logger.info('⚠️ 健康CheckResponse異常:', response.data);
      return false;
    }
  } catch (error) {
    // logger.info('❌ 健康CheckFailed:', error.message);
    return false;
  }
}

// AwaitDeployComplete
async function waitForDeploy(deployId, maxWaitTime = 300000) {
  // 5 Minute
  // logger.info('\n⏳ AwaitDeployComplete...');

  const startTime = Date.now();
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
  let status = 'pending';

  while (status === 'pending' || status === 'building') {
    if (Date.now() - startTime > maxWaitTime) {
      // logger.info('⏰ Deploy超時');
      return false;
    }

    status = await checkDeployStatus(deployId);

    if (status === 'live') {
      // logger.info('✅ DeploySuccessComplete');
      return true;
    } else if (status === 'failed') {
      // logger.info('❌ DeployFailed');
      return false;
    }

    // Await 10 Second後再次Check
    await new Promise((resolve) => setTimeout(resolve, 10000));
  }

  return false;
}

// 主Function
async function setupRenderStaging() {
  // logger.info('\n🚀 BeginSettings Render Test環境...\n');

  try {
    // 1. Check環境變數
    if (!checkEnvironmentVariables()) {
      return;
    }

    // 2. GetServiceInformation
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
    const service = await getServiceInfo();
    if (!service) {
      return;
    }

    // 3. 觸發Deploy
    const deploy = await triggerDeploy();
    if (!deploy) {
      return;
    }

    // 4. AwaitDeployComplete
    const deploySuccess = await waitForDeploy(deploy.deploy.id);
    if (!deploySuccess) {
      // logger.info('❌ DeployFailed或超時');
      return;
    }

    // 5. 健康Check
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
    const serviceUrl = service.service.serviceDetails?.url;
    if (serviceUrl) {
      await healthCheck(serviceUrl);
    }

    // logger.info('\n🎉 Render Test環境SettingsComplete！');
    // logger.info('\n📋 Test環境Information:');
    // logger.info('='.repeat(50));
    // logger.info(`🌐 Service URL: ${serviceUrl || 'N/A'}`);
    // logger.info(`🔧 API 端點: ${serviceUrl ? `${serviceUrl}/api` : 'N/A'}`);
    // logger.info(`📊 健康Check: ${serviceUrl ? `${serviceUrl}/api/health` : 'N/A'}`);
    // logger.info('='.repeat(50));

    // logger.info('\n📋 下一步Operation:');
    // logger.info('1. Test API 端點');
    // logger.info('2. VerifyDatabaseConnect');
    // logger.info('3. 運Row集成Test');
    // logger.info('4. Check前端Apply');
  } catch (error) {
    // logger.info('\n❌ SettingsFailed:', error.message);
  }
}

// 如果直接運Row此腳本
if (require.main === module) {
  setupRenderStaging()
    .then(() => {
      // logger.info('\n✅ 腳本執RowComplete');
      process.exit(0);
    })
    .catch((error) => {
      // logger.info('❌ 腳本執RowFailed:', error);
      process.exit(1);
    });
}

module.exports = {
  setupRenderStaging,
  getServiceInfo,
  triggerDeploy,
  healthCheck,
};
