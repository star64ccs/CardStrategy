# 免費服務配置指南

## 概述

本文檔提供 CardStrategy 項目中所有免費第三方服務的配置指南。這些服務為項目提供重要的功能支持，包括用戶分析、郵件發送、錯誤監控、團隊溝通等。

## 已配置的免費服務

### 1. Mixpanel - 用戶行為分析
- **用途**: 追蹤用戶行為、事件分析、漏斗分析
- **免費限制**: 1,000 事件/月
- **配置指南**: [MIXPANEL_CONFIGURATION_GUIDE.md](./MIXPANEL_CONFIGURATION_GUIDE.md)
- **狀態**: ⏳ 待配置

### 2. SendGrid - 郵件發送服務
- **用途**: 事務性郵件、郵件模板、郵件追蹤
- **免費限制**: 100 郵件/天
- **配置指南**: [SENDGRID_CONFIGURATION_GUIDE.md](./SENDGRID_CONFIGURATION_GUIDE.md)
- **狀態**: ⏳ 待配置

### 3. LogRocket - 前端錯誤監控
- **用途**: 錯誤監控、會話重現、性能監控
- **免費限制**: 1,000 會話/月
- **配置指南**: [LOGROCKET_CONFIGURATION_GUIDE.md](./LOGROCKET_CONFIGURATION_GUIDE.md)
- **狀態**: ⏳ 待配置

### 4. Slack - 團隊溝通通知
- **用途**: 團隊溝通、錯誤警報、部署通知
- **免費限制**: 10,000 消息/月
- **配置指南**: [SLACK_CONFIGURATION_GUIDE.md](./SLACK_CONFIGURATION_GUIDE.md)
- **狀態**: ⏳ 待配置

### 5. SMTP - 郵件發送
- **用途**: 基本郵件發送、HTML 郵件、附件支持
- **免費限制**: Gmail 500/天, Outlook 300/天
- **配置指南**: [SMTP_CONFIGURATION_GUIDE.md](./SMTP_CONFIGURATION_GUIDE.md)
- **狀態**: ⏳ 待配置

## 快速開始

### 步驟 1: 檢查當前配置狀態
```bash
node scripts/check-free-services-config.js
```

### 步驟 2: 按優先級配置服務

#### 高優先級 (核心功能)
1. **SendGrid** - 郵件發送 (用戶註冊、密碼重置)
2. **SMTP** - 備用郵件服務

#### 中優先級 (監控和分析)
3. **LogRocket** - 前端錯誤監控
4. **Mixpanel** - 用戶行為分析

#### 低優先級 (團隊協作)
5. **Slack** - 團隊通知

### 步驟 3: 逐一配置服務
按照各服務的配置指南進行設置：

1. 註冊服務帳戶
2. 獲取 API Key 或 Token
3. 更新環境變量文件
4. 測試服務功能

## 配置文件結構

```
src/config/ai-keys/
├── mixpanel-config.json
├── sendgrid-config.json
├── logrocket-config.json
├── slack-config.json
└── smtp-config.json

backups/api-keys/
├── mixpanel-config-backup.json
├── sendgrid-config-backup.json
├── logrocket-config-backup.json
├── slack-config-backup.json
└── smtp-config-backup.json

環境變量模板:
├── mixpanel-config.env
├── sendgrid-config.env
├── logrocket-config.env
├── slack-config.env
└── smtp-config.env
```

## 安全措施

### 文件保護
- 所有配置文件都受到 `.gitignore` 保護
- 自動創建備份文件
- 環境變量模板已準備

### 最佳實踐
- 使用應用密碼而非登錄密碼
- 定期輪換 API Key
- 監控使用量避免超出免費限制
- 定期檢查服務狀態

## 使用限制和升級建議

### 免費版限制總結
| 服務 | 免費限制 | 建議升級時機 |
|------|----------|--------------|
| Mixpanel | 1,000 事件/月 | 月事件數超過 1,000 |
| SendGrid | 100 郵件/天 | 日郵件數超過 100 |
| LogRocket | 1,000 會話/月 | 月會話數超過 1,000 |
| Slack | 10,000 消息/月 | 月消息數超過 10,000 |
| SMTP | Gmail 500/天 | 日郵件數超過 500 |

### 升級策略
1. **監控使用量**: 定期檢查各服務的使用情況
2. **設置警報**: 在接近限制時收到通知
3. **評估需求**: 根據實際使用情況決定升級
4. **成本效益**: 比較免費版和付費版的功能差異

## 故障排除

### 常見問題
1. **API Key 無效**
   - 檢查 Key 是否正確複製
   - 確認 Key 是否已激活
   - 檢查權限設置

2. **服務連接失敗**
   - 檢查網絡連接
   - 確認防火牆設置
   - 檢查服務狀態

3. **超出免費限制**
   - 監控使用量
   - 實現使用量控制
   - 考慮升級或切換服務

### 支持資源
- 各服務官方文檔
- 配置指南文檔
- 項目技術文檔

## 維護和更新

### 定期檢查
- 每月檢查服務使用量
- 每季度檢查服務狀態
- 每年評估服務需求

### 更新流程
1. 檢查服務更新
2. 測試新功能
3. 更新配置文檔
4. 通知團隊成員

## 聯繫信息

如有問題或需要幫助，請參考：
- 各服務的配置指南
- 項目技術文檔
- 開發團隊

---

**最後更新**: 2025-08-21
**版本**: 1.0.0
**維護者**: CardStrategy 開發團隊
