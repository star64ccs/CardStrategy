# 多階段構建 Dockerfile
FROM node:18-alpine AS base

# 設置工作目錄
WORKDIR /app

# 複製 package.json 文件
COPY package*.json ./

# 安裝依賴
RUN npm ci --only=production

# 複製源代碼
COPY . .

# 構建階段
FROM base AS build

# 安裝所有依賴（包括開發依賴）
RUN npm ci

# 構建應用
RUN npm run build:web

# 生產階段
FROM nginx:alpine AS production

# 複製構建結果到 nginx
COPY --from=build /app/dist /usr/share/nginx/html

# 複製 nginx 配置
COPY nginx/nginx.conf /etc/nginx/nginx.conf

# 暴露端口
EXPOSE 80

# 啟動 nginx
CMD ["nginx", "-g", "daemon off;"]
