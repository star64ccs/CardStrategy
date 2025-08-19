#!/bin/bash

# ==================== 環境設置腳本 ====================
# 使用方法: ./scripts/setup-environment.sh [環境]

set -e

# 顏色定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日誌函數
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 檢查操作系統
check_os() {
    log_info "檢查操作系統..."
    
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        OS="linux"
        log_success "檢測到 Linux 系統"
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        OS="macos"
        log_success "檢測到 macOS 系統"
    elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]]; then
        OS="windows"
        log_success "檢測到 Windows 系統"
    else
        log_error "不支持的操作系統: $OSTYPE"
        exit 1
    fi
}

# 檢查必要工具
check_requirements() {
    log_info "檢查必要工具..."
    
    # 檢查 Git
    if ! command -v git &> /dev/null; then
        log_error "Git 未安裝"
        exit 1
    fi
    
    # 檢查 Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js 未安裝"
        exit 1
    fi
    
    # 檢查 npm
    if ! command -v npm &> /dev/null; then
        log_error "npm 未安裝"
        exit 1
    fi
    
    # 檢查 Docker
    if ! command -v docker &> /dev/null; then
        log_warning "Docker 未安裝，將跳過 Docker 相關設置"
        DOCKER_AVAILABLE=false
    else
        DOCKER_AVAILABLE=true
        log_success "Docker 已安裝"
    fi
    
    # 檢查 Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        log_warning "Docker Compose 未安裝，將跳過 Docker Compose 相關設置"
        DOCKER_COMPOSE_AVAILABLE=false
    else
        DOCKER_COMPOSE_AVAILABLE=true
        log_success "Docker Compose 已安裝"
    fi
    
    log_success "必要工具檢查完成"
}

# 創建環境配置文件
create_env_files() {
    log_info "創建環境配置文件..."
    
    # 前端環境配置
    if [ ! -f ".env" ]; then
        log_info "創建前端 .env 文件..."
        cp env.example .env
        log_success "前端 .env 文件創建完成"
    else
        log_warning "前端 .env 文件已存在，跳過創建"
    fi
    
    # 後端環境配置
    if [ ! -f "backend/.env" ]; then
        log_info "創建後端 .env 文件..."
        cp backend/env.example backend/.env
        log_success "後端 .env 文件創建完成"
    else
        log_warning "後端 .env 文件已存在，跳過創建"
    fi
    
    # 生產環境配置
    if [ ! -f "backend/env.production" ]; then
        log_info "創建生產環境配置文件..."
        cp backend/env.production backend/env.production.backup
        log_success "生產環境配置文件創建完成"
    fi
    
    # 測試環境配置
    if [ ! -f "backend/env.staging" ]; then
        log_info "創建測試環境配置文件..."
        cp backend/env.staging backend/env.staging.backup
        log_success "測試環境配置文件創建完成"
    fi
}

# 安裝依賴
install_dependencies() {
    log_info "安裝項目依賴..."
    
    # 安裝前端依賴
    log_info "安裝前端依賴..."
    npm ci
    
    # 安裝後端依賴
    log_info "安裝後端依賴..."
    cd backend && npm ci && cd ..
    
    log_success "依賴安裝完成"
}

# 設置數據庫
setup_database() {
    log_info "設置數據庫..."
    
    if [ "$DOCKER_AVAILABLE" = true ] && [ "$DOCKER_COMPOSE_AVAILABLE" = true ]; then
        log_info "使用 Docker 啟動數據庫服務..."
        
        # 啟動數據庫服務
        docker-compose up -d postgres redis
        
        # 等待數據庫就緒
        log_info "等待數據庫就緒..."
        sleep 10
        
        # 運行數據庫遷移
        log_info "運行數據庫遷移..."
        cd backend && npm run migrate && cd ..
        
        # 運行數據庫種子
        log_info "運行數據庫種子..."
        cd backend && npm run seed && cd ..
        
        log_success "數據庫設置完成"
    else
        log_warning "Docker 不可用，跳過數據庫設置"
        log_info "請手動設置 PostgreSQL 和 Redis"
    fi
}

# 設置 Git hooks
setup_git_hooks() {
    log_info "設置 Git hooks..."
    
    if [ -d ".git" ]; then
        # 安裝 Husky
        npm run prepare
        
        # 設置 pre-commit hooks
        npx husky add .husky/pre-commit "npm run lint && npm run type-check"
        npx husky add .husky/pre-push "npm run test:ci"
        
        log_success "Git hooks 設置完成"
    else
        log_warning "不是 Git 倉庫，跳過 Git hooks 設置"
    fi
}

# 設置 SSL 證書
setup_ssl() {
    log_info "設置 SSL 證書..."
    
    # 創建 SSL 目錄
    mkdir -p nginx/ssl
    
    # 生成自簽名證書（僅用於開發）
    if [ ! -f "nginx/ssl/cardstrategy.crt" ]; then
        log_info "生成自簽名 SSL 證書..."
        openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
            -keyout nginx/ssl/cardstrategy.key \
            -out nginx/ssl/cardstrategy.crt \
            -subj "/C=TW/ST=Taiwan/L=Taipei/O=CardStrategy/CN=cardstrategy.com"
        
        log_success "SSL 證書生成完成"
    else
        log_warning "SSL 證書已存在，跳過生成"
    fi
}

# 設置監控配置
setup_monitoring() {
    log_info "設置監控配置..."
    
    # 創建監控目錄
    mkdir -p monitoring/rules
    mkdir -p monitoring/grafana/dashboards
    mkdir -p monitoring/grafana/datasources
    mkdir -p monitoring/logstash/pipeline
    
    # 創建基本的 Prometheus 規則
    if [ ! -f "monitoring/rules/alerts.yml" ]; then
        log_info "創建 Prometheus 警報規則..."
        cat > monitoring/rules/alerts.yml << 'EOF'
groups:
  - name: cardstrategy_alerts
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.1
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "高錯誤率警報"
          description: "錯誤率超過 10%"

      - alert: HighResponseTime
        expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 1
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "高響應時間警報"
          description: "95% 響應時間超過 1 秒"

      - alert: DatabaseConnectionIssues
        expr: pg_up == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "數據庫連接問題"
          description: "PostgreSQL 數據庫無法連接"

      - alert: RedisConnectionIssues
        expr: redis_up == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Redis 連接問題"
          description: "Redis 緩存無法連接"
EOF
        log_success "Prometheus 警報規則創建完成"
    fi
    
    # 創建 Grafana 數據源配置
    if [ ! -f "monitoring/grafana/datasources/prometheus.yml" ]; then
        log_info "創建 Grafana 數據源配置..."
        cat > monitoring/grafana/datasources/prometheus.yml << 'EOF'
apiVersion: 1

datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true
    editable: true
EOF
        log_success "Grafana 數據源配置創建完成"
    fi
}

# 設置備份目錄
setup_backup() {
    log_info "設置備份目錄..."
    
    mkdir -p backups/production
    mkdir -p backups/staging
    mkdir -p backups/logs
    
    log_success "備份目錄設置完成"
}

# 設置日誌目錄
setup_logs() {
    log_info "設置日誌目錄..."
    
    mkdir -p logs/application
    mkdir -p logs/nginx
    mkdir -p logs/monitoring
    
    log_success "日誌目錄設置完成"
}

# 生成安全密鑰
generate_secrets() {
    log_info "生成安全密鑰..."
    
    # 生成 JWT 密鑰
    JWT_SECRET=$(openssl rand -base64 64)
    JWT_REFRESH_SECRET=$(openssl rand -base64 64)
    
    # 生成 Redis 密碼
    REDIS_PASSWORD=$(openssl rand -base64 32)
    
    # 生成數據庫密碼
    DB_PASSWORD=$(openssl rand -base64 32)
    
    # 更新環境文件
    if [ -f ".env" ]; then
        sed -i.bak "s/JWT_SECRET=.*/JWT_SECRET=$JWT_SECRET/" .env
        sed -i.bak "s/DB_PASSWORD=.*/DB_PASSWORD=$DB_PASSWORD/" .env
        sed -i.bak "s/REDIS_PASSWORD=.*/REDIS_PASSWORD=$REDIS_PASSWORD/" .env
    fi
    
    if [ -f "backend/.env" ]; then
        sed -i.bak "s/JWT_SECRET=.*/JWT_SECRET=$JWT_SECRET/" backend/.env
        sed -i.bak "s/JWT_REFRESH_SECRET=.*/JWT_REFRESH_SECRET=$JWT_REFRESH_SECRET/" backend/.env
        sed -i.bak "s/POSTGRES_PASSWORD=.*/POSTGRES_PASSWORD=$DB_PASSWORD/" backend/.env
        sed -i.bak "s/REDIS_PASSWORD=.*/REDIS_PASSWORD=$REDIS_PASSWORD/" backend/.env
    fi
    
    log_success "安全密鑰生成完成"
}

# 運行測試
run_tests() {
    log_info "運行測試套件..."
    
    # 運行前端測試
    log_info "運行前端測試..."
    npm run test:ci
    
    # 運行後端測試
    log_info "運行後端測試..."
    cd backend && npm run test:ci && cd ..
    
    log_success "測試完成"
}

# 顯示設置摘要
show_summary() {
    log_success "環境設置完成！"
    
    echo ""
    echo "=== 設置摘要 ==="
    echo "✅ 環境配置文件已創建"
    echo "✅ 依賴已安裝"
    echo "✅ 數據庫已設置"
    echo "✅ Git hooks 已配置"
    echo "✅ SSL 證書已生成"
    echo "✅ 監控配置已設置"
    echo "✅ 備份目錄已創建"
    echo "✅ 日誌目錄已創建"
    echo "✅ 安全密鑰已生成"
    echo "✅ 測試已通過"
    
    echo ""
    echo "=== 下一步操作 ==="
    echo "1. 配置環境變數文件 (.env 和 backend/.env)"
    echo "2. 設置第三方服務 API 密鑰"
    echo "3. 配置域名和 SSL 證書"
    echo "4. 啟動開發服務器: npm run dev:full"
    echo "5. 啟動生產服務: npm run docker:up"
    
    echo ""
    echo "=== 重要提醒 ==="
    echo "⚠️  請務必更新環境變數文件中的敏感信息"
    echo "⚠️  生產環境請使用正式的 SSL 證書"
    echo "⚠️  請定期備份數據庫"
    echo "⚠️  請監控系統性能和錯誤日誌"
}

# 主函數
main() {
    log_info "開始環境設置..."
    
    # 檢查操作系統
    check_os
    
    # 檢查必要工具
    check_requirements
    
    # 創建環境配置文件
    create_env_files
    
    # 安裝依賴
    install_dependencies
    
    # 設置數據庫
    setup_database
    
    # 設置 Git hooks
    setup_git_hooks
    
    # 設置 SSL 證書
    setup_ssl
    
    # 設置監控配置
    setup_monitoring
    
    # 設置備份目錄
    setup_backup
    
    # 設置日誌目錄
    setup_logs
    
    # 生成安全密鑰
    generate_secrets
    
    # 運行測試
    run_tests
    
    # 顯示設置摘要
    show_summary
}

# 執行主函數
main "$@"
