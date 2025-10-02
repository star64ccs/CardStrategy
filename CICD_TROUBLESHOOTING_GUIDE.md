# 🔧 CI/CD 故障排除指南

## 🚨 **常見問題與解決方案**

### 1. **GitHub Actions 工作流失敗**

#### 問題：工作流運行失敗

```bash
❌ 錯誤：Job failed with exit code 1
```

#### 解決方案：

1. **檢查工作流文件語法**

```bash
# 驗證 YAML 語法
yamllint .github/workflows/*.yml
```

2. **檢查 Node.js 版本兼容性**

```yaml
# 確保使用 Node.js 18
- uses: actions/setup-node@v4
  with:
    node-version: '18'
```

3. **修復測試失敗**

```bash
# 在本地運行測試
cd backend && npm test
cd frontend && npm test
```

### 2. **缺少 GitHub Secrets**

#### 問題：Secret 未設置

```bash
❌ 錯誤：Secret SNYK_TOKEN not found
```

#### 解決方案：

在 GitHub Repository → Settings → Secrets → Actions 中添加：

**必需的 Secrets：**

```bash
# 部署相關
DIGITALOCEAN_TOKEN=your_do_token
RENDER_TOKEN=your_render_token
DIGITALOCEAN_APP_ID=your_app_id

# 安全掃描（可選）
SNYK_TOKEN=your_snyk_token

# 通知（可選）
SLACK_WEBHOOK_URL=your_slack_webhook
```

**如何獲取 Secrets：**

1. **DIGITALOCEAN_TOKEN**
   - 登入 DigitalOcean
   - API → Tokens → Generate New Token
   - 複製 Token

2. **RENDER_TOKEN**
   - 登入 Render Dashboard
   - Account Settings → API Keys
   - Create API Key

3. **SNYK_TOKEN**
   - 註冊 https://snyk.io
   - Account Settings → API Token

### 3. **測試環境配置問題**

#### 問題：PostgreSQL/Redis 連接失敗

```bash
❌ 錯誤：Connection refused
```

#### 解決方案：

1. **檢查服務配置**

```yaml
services:
  postgres:
    image: postgres:15
    env:
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: test_db
    options: >-
      --health-cmd pg_isready --health-interval 10s --health-timeout 5s --health-retries 5
    ports:
      - 5432:5432
```

2. **檢查環境變數**

```yaml
env:
  DB_HOST: localhost
  DB_PORT: 5432
  DB_NAME: test_db
  DB_USER: postgres
  DB_PASSWORD: postgres
  REDIS_URL: redis://localhost:6379
```

### 4. **部署失敗**

#### 問題：部署到 Render/DigitalOcean 失敗

```bash
❌ 錯誤：Deployment failed
```

#### 解決方案：

1. **檢查 Render 配置**
   - 確認 `render.yml` 文件存在
   - 檢查服務名稱和配置

2. **檢查 DigitalOcean 配置**
   - 確認 App ID 正確
   - 檢查 API Token 權限

3. **檢查健康檢查端點**

```bash
# 測試 API 端點
curl -f https://cardstrategy-api.onrender.com/api/health
curl -f https://api.cardstrategy.com/api/health
```

### 5. **依賴安裝失敗**

#### 問題：npm install 失敗

```bash
❌ 錯誤：npm ERR! peer dep missing
```

#### 解決方案：

1. **清理並重新安裝**

```bash
rm -rf node_modules package-lock.json
npm install
```

2. **使用 npm ci**

```yaml
- name: Install dependencies
  run: npm ci
```

3. **修復版本衝突**

```bash
npm audit fix
```

## 🛠️ **快速修復命令**

### 1. **本地測試**

```bash
# 後端測試
cd backend
npm ci
npm run lint
npm test

# 前端測試
npm ci
npm run lint
npm run type-check
npm test
```

### 2. **檢查工作流**

```bash
# 驗證 YAML 語法
yamllint .github/workflows/*.yml

# 檢查 GitHub Actions 狀態
gh workflow list
gh run list
```

### 3. **部署測試**

```bash
# 測試 Render 部署
curl -X POST "https://api.render.com/v1/services/$RENDER_SERVICE_ID/deploys" \
  -H "Authorization: Bearer $RENDER_TOKEN"

# 測試 DigitalOcean 部署
doctl apps create-deployment $DIGITALOCEAN_APP_ID --wait
```

## 📋 **檢查清單**

### ✅ **部署前檢查**

- [ ] GitHub Secrets 已設置
- [ ] 工作流文件語法正確
- [ ] 本地測試通過
- [ ] 環境變數配置正確
- [ ] 健康檢查端點可用

### ✅ **部署後檢查**

- [ ] 服務正常啟動
- [ ] 健康檢查通過
- [ ] API 端點可訪問
- [ ] 數據庫連接正常
- [ ] 監控指標正常

## 🆘 **緊急修復**

### 如果 CI/CD 完全失敗：

1. **使用簡化工作流**

```bash
# 暫時使用簡化版本
mv .github/workflows/ci-cd-simplified.yml .github/workflows/ci-cd.yml
```

2. **跳過失敗的測試**

```yaml
- name: Run tests
  run: npm test || echo "Tests failed but continuing"
  continue-on-error: true
```

3. **手動部署**

```bash
# 直接部署到 Render
curl -X POST "https://api.render.com/v1/services/$RENDER_SERVICE_ID/deploys" \
  -H "Authorization: Bearer $RENDER_TOKEN"
```

## 📞 **獲得幫助**

如果問題仍然存在：

1. **檢查 GitHub Actions 日誌**
   - 前往 GitHub → Actions
   - 點擊失敗的工作流
   - 查看詳細錯誤信息

2. **檢查服務狀態**
   - Render Dashboard
   - DigitalOcean Dashboard
   - 服務健康檢查

3. **聯繫支持**
   - GitHub Actions 文檔
   - Render 支持
   - DigitalOcean 支持

---

**記住**：CI/CD 失敗通常是配置問題，不是代碼問題。按照這個指南逐步檢查，大多數問題都能快速解決。
