// eBay OAuth Token 自動刷新管理器
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

class EbayOAuthManager {
  constructor() {
    this.config = {
      appId: 'EricChan-cardstra-PRD-011981293-9a68087c',
      clientSecret: 'SBX-12c11d4d937c-ea38-4d2e-bdad-9537', // 需要從 API.txt 獲取
      redirectUri: 'https://cardstrategyapp.com/oauth/callback',
      environment: 'production', // production 或 sandbox
      tokenFilePath: './ebay-tokens.json',
    };

    this.tokens = {
      accessToken: null,
      refreshToken: null,
      expiresAt: null,
      tokenType: 'Bearer',
    };

    this.isRefreshing = false;
    this.refreshPromise = null;

    console.log('🔄 eBay OAuth Manager 初始化');
  }

  // 獲取 API 基礎 URL
  getApiBaseUrl() {
    return this.config.environment === 'production'
      ? 'https://api.ebay.com'
      : 'https://api.sandbox.ebay.com';
  }

  // 獲取 OAuth 基礎 URL
  getOAuthBaseUrl() {
    return this.config.environment === 'production'
      ? 'https://auth.ebay.com'
      : 'https://auth.sandbox.ebay.com';
  }

  // 從 API.txt 文件讀取配置
  async loadConfigFromFile() {
    try {
      const apiContent = await fs.readFile('./API.txt', 'utf8');

      // 解析 eBay 配置
      const ebaySection = apiContent.match(/EBAY[\s\S]*?(?=\n\n|\n[A-Z]|$)/);
      if (ebaySection) {
        const ebayText = ebaySection[0];

        // 提取 Production App ID
        const productionAppIdMatch = ebayText.match(
          /EricChan-cardstra-PRD-[^\n]+/
        );
        if (productionAppIdMatch) {
          this.config.appId = productionAppIdMatch[0].trim();
        }

        // 提取 Production Client Secret
        const productionSecretMatch = ebayText.match(/PRD-[^\n]+/);
        if (productionSecretMatch) {
          this.config.clientSecret = productionSecretMatch[0].trim();
        }

        console.log('✅ 從 API.txt 加載 eBay Production 配置');
        console.log(`📱 App ID: ${this.config.appId}`);
        console.log(
          `🔑 Client Secret: ${this.config.clientSecret.substring(0, 10)}...`
        );
      }
    } catch (error) {
      console.error('❌ 讀取 API.txt 失敗:', error.message);
    }
  }

  // 加載已保存的 Token
  async loadTokens() {
    try {
      const tokenData = await fs.readFile(this.config.tokenFilePath, 'utf8');
      this.tokens = JSON.parse(tokenData);

      // 檢查 Token 是否過期
      if (
        this.tokens.expiresAt &&
        new Date() >= new Date(this.tokens.expiresAt)
      ) {
        console.log('⚠️ Token 已過期，需要刷新');
        await this.refreshToken();
      } else {
        console.log('✅ Token 仍然有效');
      }

      return true;
    } catch (error) {
      console.log('📝 沒有找到已保存的 Token，需要重新獲取');
      return false;
    }
  }

  // 保存 Token 到文件
  async saveTokens() {
    try {
      await fs.writeFile(
        this.config.tokenFilePath,
        JSON.stringify(this.tokens, null, 2)
      );
      console.log('💾 Token 已保存到文件');
    } catch (error) {
      console.error('❌ 保存 Token 失敗:', error.message);
    }
  }

  // 獲取新的 Access Token (使用 Refresh Token)
  async refreshToken() {
    if (this.isRefreshing && this.refreshPromise) {
      console.log('⏳ Token 刷新正在進行中，等待完成...');
      return await this.refreshPromise;
    }

    this.isRefreshing = true;
    this.refreshPromise = this._performTokenRefresh();

    try {
      const result = await this.refreshPromise;
      return result;
    } finally {
      this.isRefreshing = false;
      this.refreshPromise = null;
    }
  }

  // 執行 Token 刷新
  async _performTokenRefresh() {
    try {
      console.log('🔄 開始刷新 eBay OAuth Token...');

      if (!this.tokens.refreshToken) {
        throw new Error('沒有 Refresh Token，需要重新授權');
      }

      const tokenUrl = `${this.getOAuthBaseUrl()}/oauth2/token`;

      const params = new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: this.tokens.refreshToken,
        scope:
          'https://api.ebay.com/oauth/api_scope https://api.ebay.com/oauth/api_scope/sell.marketing.readonly https://api.ebay.com/oauth/api_scope/sell.marketing https://api.ebay.com/oauth/api_scope/sell.inventory.readonly https://api.ebay.com/oauth/api_scope/sell.inventory https://api.ebay.com/oauth/api_scope/sell.account.readonly https://api.ebay.com/oauth/api_scope/sell.account https://api.ebay.com/oauth/api_scope/sell.fulfillment.readonly https://api.ebay.com/oauth/api_scope/sell.fulfillment https://api.ebay.com/oauth/api_scope/sell.analytics.readonly',
      });

      const auth = Buffer.from(
        `${this.config.appId}:${this.config.clientSecret}`
      ).toString('base64');

      const response = await axios.post(tokenUrl, params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${auth}`,
          Accept: 'application/json',
        },
        timeout: 30000,
      });

      if (response.status === 200 && response.data) {
        const tokenData = response.data;

        // 更新 Token 信息
        this.tokens.accessToken = tokenData.access_token;
        this.tokens.tokenType = tokenData.token_type || 'Bearer';

        // 計算過期時間 (通常是 2 小時)
        const expiresIn = tokenData.expires_in || 7200; // 2 小時
        this.tokens.expiresAt = new Date(
          Date.now() + expiresIn * 1000
        ).toISOString();

        // 如果有新的 Refresh Token，更新它
        if (tokenData.refresh_token) {
          this.tokens.refreshToken = tokenData.refresh_token;
        }

        // 保存到文件
        await this.saveTokens();

        console.log('✅ Token 刷新成功');
        console.log(`⏰ 過期時間: ${this.tokens.expiresAt}`);

        return {
          success: true,
          accessToken: this.tokens.accessToken,
          expiresAt: this.tokens.expiresAt,
        };
      } else {
        throw new Error(
          `Token 刷新失敗: ${response.status} ${response.statusText}`
        );
      }
    } catch (error) {
      console.error('❌ Token 刷新失敗:', error.message);

      if (error.response) {
        console.error('📊 錯誤詳情:', error.response.data);

        // 如果是 Refresh Token 無效，需要重新授權
        if (
          error.response.status === 400 &&
          error.response.data?.error === 'invalid_grant'
        ) {
          console.error('🔄 Refresh Token 無效，需要重新授權');
          this.tokens.refreshToken = null;
          await this.saveTokens();
        }
      }

      throw error;
    }
  }

  // 獲取有效的 Access Token
  async getValidAccessToken() {
    // 如果沒有 Token，嘗試加載
    if (!this.tokens.accessToken) {
      const loaded = await this.loadTokens();
      if (!loaded) {
        throw new Error('沒有可用的 Token，需要重新授權');
      }
    }

    // 檢查 Token 是否即將過期 (提前 5 分鐘刷新)
    const now = new Date();
    const expiresAt = new Date(this.tokens.expiresAt);
    const timeUntilExpiry = expiresAt.getTime() - now.getTime();
    const fiveMinutes = 5 * 60 * 1000;

    if (timeUntilExpiry <= fiveMinutes) {
      console.log('⏰ Token 即將過期，自動刷新...');
      await this.refreshToken();
    }

    return this.tokens.accessToken;
  }

  // 生成授權 URL (用於初次授權)
  generateAuthUrl() {
    const scopes = [
      'https://api.ebay.com/oauth/api_scope',
      'https://api.ebay.com/oauth/api_scope/sell.marketing.readonly',
      'https://api.ebay.com/oauth/api_scope/sell.marketing',
      'https://api.ebay.com/oauth/api_scope/sell.inventory.readonly',
      'https://api.ebay.com/oauth/api_scope/sell.inventory',
      'https://api.ebay.com/oauth/api_scope/sell.account.readonly',
      'https://api.ebay.com/oauth/api_scope/sell.account',
      'https://api.ebay.com/oauth/api_scope/sell.fulfillment.readonly',
      'https://api.ebay.com/oauth/api_scope/sell.fulfillment',
      'https://api.ebay.com/oauth/api_scope/sell.analytics.readonly',
    ].join(' ');

    const params = new URLSearchParams({
      client_id: this.config.appId,
      response_type: 'code',
      redirect_uri: this.config.redirectUri,
      scope: scopes,
    });

    return `${this.getOAuthBaseUrl()}/oauth2/authorize?${params.toString()}`;
  }

  // 使用授權碼獲取 Token
  async exchangeCodeForToken(authorizationCode) {
    try {
      console.log('🔄 使用授權碼獲取 Token...');

      const tokenUrl = `${this.getOAuthBaseUrl()}/oauth2/token`;

      const params = new URLSearchParams({
        grant_type: 'authorization_code',
        code: authorizationCode,
        redirect_uri: this.config.redirectUri,
      });

      const auth = Buffer.from(
        `${this.config.appId}:${this.config.clientSecret}`
      ).toString('base64');

      const response = await axios.post(tokenUrl, params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${auth}`,
          Accept: 'application/json',
        },
        timeout: 30000,
      });

      if (response.status === 200 && response.data) {
        const tokenData = response.data;

        // 保存 Token 信息
        this.tokens.accessToken = tokenData.access_token;
        this.tokens.refreshToken = tokenData.refresh_token;
        this.tokens.tokenType = tokenData.token_type || 'Bearer';

        // 計算過期時間
        const expiresIn = tokenData.expires_in || 7200;
        this.tokens.expiresAt = new Date(
          Date.now() + expiresIn * 1000
        ).toISOString();

        // 保存到文件
        await this.saveTokens();

        console.log('✅ Token 獲取成功');
        console.log(`⏰ 過期時間: ${this.tokens.expiresAt}`);

        return {
          success: true,
          accessToken: this.tokens.accessToken,
          refreshToken: this.tokens.refreshToken,
          expiresAt: this.tokens.expiresAt,
        };
      } else {
        throw new Error(
          `Token 獲取失敗: ${response.status} ${response.statusText}`
        );
      }
    } catch (error) {
      console.error('❌ Token 獲取失敗:', error.message);
      if (error.response) {
        console.error('📊 錯誤詳情:', error.response.data);
      }
      throw error;
    }
  }

  // 設置自動刷新定時器
  setupAutoRefresh() {
    console.log('⏰ 設置自動 Token 刷新定時器...');

    // 每小時檢查一次 Token 狀態
    setInterval(
      async () => {
        try {
          if (this.tokens.accessToken && this.tokens.expiresAt) {
            const now = new Date();
            const expiresAt = new Date(this.tokens.expiresAt);
            const timeUntilExpiry = expiresAt.getTime() - now.getTime();
            const fiveMinutes = 5 * 60 * 1000;

            if (timeUntilExpiry <= fiveMinutes) {
              console.log('🔄 定時器觸發：Token 即將過期，自動刷新...');
              await this.refreshToken();
            }
          }
        } catch (error) {
          console.error('❌ 自動刷新失敗:', error.message);
        }
      },
      60 * 60 * 1000
    ); // 每小時檢查一次
  }

  // 獲取 Token 狀態
  getTokenStatus() {
    const now = new Date();
    const expiresAt = this.tokens.expiresAt
      ? new Date(this.tokens.expiresAt)
      : null;

    return {
      hasAccessToken: !!this.tokens.accessToken,
      hasRefreshToken: !!this.tokens.refreshToken,
      expiresAt: this.tokens.expiresAt,
      isExpired: expiresAt ? now >= expiresAt : true,
      timeUntilExpiry: expiresAt ? expiresAt.getTime() - now.getTime() : 0,
      tokenType: this.tokens.tokenType,
    };
  }

  // 初始化管理器
  async initialize() {
    console.log('🚀 初始化 eBay OAuth Manager...');

    // 加載配置
    await this.loadConfigFromFile();

    // 嘗試加載已保存的 Token
    const hasTokens = await this.loadTokens();

    if (!hasTokens) {
      console.log('📝 需要進行 OAuth 授權流程');
      console.log(`🔗 請訪問以下 URL 進行授權:`);
      console.log(this.generateAuthUrl());
      console.log(
        '\n💡 授權完成後，請使用 exchangeCodeForToken() 方法獲取 Token'
      );
    }

    // 設置自動刷新
    this.setupAutoRefresh();

    return hasTokens;
  }
}

// 如果直接運行此腳本
if (require.main === module) {
  async function testOAuthManager() {
    const oauthManager = new EbayOAuthManager();

    try {
      console.log('🧪 測試 eBay OAuth Manager');
      console.log('='.repeat(60));

      // 初始化
      const hasTokens = await oauthManager.initialize();

      if (hasTokens) {
        // 測試獲取有效 Token
        console.log('\n🔍 測試獲取有效 Token...');
        const accessToken = await oauthManager.getValidAccessToken();
        console.log(`✅ 獲取到有效 Token: ${accessToken.substring(0, 20)}...`);

        // 顯示 Token 狀態
        console.log('\n📊 Token 狀態:');
        const status = oauthManager.getTokenStatus();
        console.log(JSON.stringify(status, null, 2));
      } else {
        console.log('\n📝 需要進行 OAuth 授權');
        console.log('請按照以下步驟操作:');
        console.log('1. 訪問授權 URL');
        console.log('2. 完成授權');
        console.log('3. 獲取授權碼');
        console.log('4. 使用 exchangeCodeForToken() 方法獲取 Token');
      }
    } catch (error) {
      console.error('❌ 測試失敗:', error);
    }
  }

  testOAuthManager();
}

module.exports = EbayOAuthManager;
