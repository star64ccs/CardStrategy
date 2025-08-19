# 使用 Node.js 18 LTS 作為基礎鏡像
FROM node:18-alpine

# 設置工作目錄
WORKDIR /app

# 安裝系統依賴
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    postgresql-client \
    redis \
    && rm -rf /var/cache/apk/*

# 複製 package.json 和 package-lock.json
COPY package*.json ./

# 安裝依賴
RUN npm ci --only=production && npm cache clean --force

# 複製應用代碼
COPY . .

# 創建非 root 用戶
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# 創建必要的目錄並設置權限
RUN mkdir -p /app/uploads /app/logs /app/models /app/exports && \
    chown -R nodejs:nodejs /app

# 切換到非 root 用戶
USER nodejs

# 暴露端口
EXPOSE 3000

# 健康檢查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node healthcheck.js

# 啟動命令
CMD ["npm", "start"]
