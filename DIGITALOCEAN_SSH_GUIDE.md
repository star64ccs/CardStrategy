# DigitalOcean SSH 連接指南

## 🔑 **SSH 連接信息**

- **服務器 IP**: 159.223.84.189
- **用戶名**: root
- **端口**: 22

## 📧 **方法 1: 使用 DigitalOcean 發送的密碼**

### 檢查郵箱

DigitalOcean 應該已經發送了一封包含 root 密碼的郵件到您的註冊郵箱。

### 郵件標題通常是：

- "Your Droplet cardstrategy-server is ready"
- "Droplet creation complete"

### 郵件內容包含：

- Root 密碼
- SSH 連接命令
- 服務器詳情

## 🖥️ **方法 2: 使用 DigitalOcean Console (推薦)**

### 步驟：

1. 登錄 DigitalOcean 控制面板
2. 點擊您的 Droplet: **cardstrategy-server**
3. 點擊 **"Console"** 按鈕
4. 瀏覽器會打開一個內置終端
5. 直接輸入命令，無需密碼

### 優點：

- ✅ 無需密碼或 SSH 密鑰
- ✅ 直接訪問
- ✅ 適合緊急情況

## 🔧 **方法 3: 重置 Root 密碼**

### 在 DigitalOcean 控制面板中：

1. 點擊您的 Droplet
2. 點擊 **"Access"** 標籤
3. 點擊 **"Reset Root Password"**
4. 等待幾分鐘
5. 檢查郵箱獲取新密碼

## 🚀 **連接成功後的步驟**

一旦成功連接，運行以下命令：

```bash
# 更新系統
sudo apt update && sudo apt upgrade -y

# 下載並運行設置腳本
curl -fsSL https://raw.githubusercontent.com/your-repo/cardstrategy/main/scripts/setup-ubuntu-24.04.sh | bash
```

## 📋 **設置腳本會自動安裝**

- ✅ Node.js 18
- ✅ PostgreSQL
- ✅ Redis
- ✅ Nginx
- ✅ PM2
- ✅ Certbot
- ✅ 防火牆配置
- ✅ 安全設置

## 🔍 **故障排除**

### 如果 SSH 連接失敗：

1. 檢查防火牆設置
2. 確認服務器狀態為 "Running"
3. 嘗試使用 Console 方法
4. 重置 root 密碼

### 如果設置腳本失敗：

1. 檢查網絡連接
2. 確保有足夠的磁盤空間
3. 查看錯誤日誌

## 📞 **技術支持**

如果遇到問題：

1. 查看 DigitalOcean 文檔
2. 檢查服務器狀態
3. 使用 Console 功能
4. 聯繫 DigitalOcean 支持

---

**推薦使用 DigitalOcean Console 方法，最簡單直接！**
