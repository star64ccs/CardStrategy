#!/bin/bash

# ==================== 生產環境部署腳本 ====================
# 使用方法: ./scripts/deploy-production.sh [環境]

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

# 檢查環境變數
check_environment() {
    log_info "檢查環境變數..."
    
    required_vars=(
        "POSTGRES_HOST"
        "POSTGRES_USER"
        "POSTGRES_PASSWORD"
        "REDIS_HOST"
        "REDIS_PASSWORD"
        "JWT_SECRET"
        "JWT_REFRESH_SECRET"
        "SMTP_HOST"
        "SMTP_USER"
        "SMTP_PASS"
        "CLOUDINARY_CLOUD_NAME"
        "CLOUDINARY_API_KEY"
        "CLOUDINARY_API_SECRET"
        "STRIPE_SECRET_KEY"
        "STRIPE_WEBHOOK_SECRET"
        "TWILIO_ACCOUNT_SID"
        "TWILIO_AUTH_TOKEN"
        "TWILIO_PHONE_NUMBER"
        "GRAFANA_PASSWORD"
    )
    
    missing_vars=()
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            missing_vars+=("$var")
        fi
    done
    
    if [ ${#missing_vars[@]} -ne 0 ]; then
        log_error "缺少必要的環境變數:"
        for var in "${missing_vars[@]}"; do
            echo "  - $var"
        done
        exit 1
    fi
    
    log_success "環境變數檢查完成"
}

# 備份數據庫
backup_database() {
    log_info "開始備份數據庫..."
    
    backup_dir="./backups"
    timestamp=$(date +%Y%m%d_%H%M%S)
    backup_file="$backup_dir/backup_before_deploy_$timestamp.sql"
    
    mkdir -p "$backup_dir"
    
    if pg_dump -h "$POSTGRES_HOST" -U "$POSTGRES_USER" -d "${POSTGRES_DB:-cardstrategy_prod}" > "$backup_file"; then
        log_success "數據庫備份完成: $backup_file"
    else
        log_warning "數據庫備份失敗，繼續部署..."
    fi
}

# 檢查 Docker 和 Docker Compose
check_docker() {
    log_info "檢查 Docker 環境..."
    
    if ! command -v docker &> /dev/null; then
        log_error "Docker 未安裝"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose 未安裝"
        exit 1
    fi
    
    if ! docker info &> /dev/null; then
        log_error "Docker 服務未運行"
        exit 1
    fi
    
    log_success "Docker 環境檢查完成"
}

# 停止現有服務
stop_services() {
    log_info "停止現有服務..."
    
    if docker-compose -f docker-compose.production.yml down; then
        log_success "服務停止完成"
    else
        log_warning "停止服務時出現警告"
    fi
}

# 清理舊的鏡像和容器
cleanup_docker() {
    log_info "清理 Docker 資源..."
    
    # 清理未使用的鏡像
    docker image prune -f
    
    # 清理未使用的容器
    docker container prune -f
    
    # 清理未使用的網絡
    docker network prune -f
    
    log_success "Docker 資源清理完成"
}

# 構建和啟動服務
build_and_start() {
    log_info "構建和啟動服務..."
    
    # 構建鏡像
    log_info "構建 Docker 鏡像..."
    docker-compose -f docker-compose.production.yml build --no-cache
    
    # 啟動服務
    log_info "啟動服務..."
    docker-compose -f docker-compose.production.yml up -d
    
    log_success "服務啟動完成"
}

# 等待服務就緒
wait_for_services() {
    log_info "等待服務就緒..."
    
    # 等待 PostgreSQL
    log_info "等待 PostgreSQL 就緒..."
    timeout=60
    while ! docker exec cardstrategy_postgres_prod pg_isready -U "$POSTGRES_USER" &> /dev/null; do
        if [ $timeout -le 0 ]; then
            log_error "PostgreSQL 啟動超時"
            exit 1
        fi
        sleep 1
        timeout=$((timeout - 1))
    done
    
    # 等待 Redis
    log_info "等待 Redis 就緒..."
    timeout=30
    while ! docker exec cardstrategy_redis_prod redis-cli --raw incr ping &> /dev/null; do
        if [ $timeout -le 0 ]; then
            log_error "Redis 啟動超時"
            exit 1
        fi
        sleep 1
        timeout=$((timeout - 1))
    done
    
    # 等待後端服務
    log_info "等待後端服務就緒..."
    timeout=120
    while ! curl -f http://localhost:3000/health &> /dev/null; do
        if [ $timeout -le 0 ]; then
            log_error "後端服務啟動超時"
            exit 1
        fi
        sleep 2
        timeout=$((timeout - 2))
    done
    
    log_success "所有服務就緒"
}

# 運行數據庫遷移
run_migrations() {
    log_info "運行數據庫遷移..."
    
    if docker exec cardstrategy_backend_prod npm run migrate; then
        log_success "數據庫遷移完成"
    else
        log_error "數據庫遷移失敗"
        exit 1
    fi
}

# 健康檢查
health_check() {
    log_info "執行健康檢查..."
    
    # 檢查後端健康狀態
    if curl -f http://localhost:3000/health; then
        log_success "後端健康檢查通過"
    else
        log_error "後端健康檢查失敗"
        exit 1
    fi
    
    # 檢查 Nginx
    if curl -f http://localhost/health; then
        log_success "Nginx 健康檢查通過"
    else
        log_error "Nginx 健康檢查失敗"
        exit 1
    fi
    
    # 檢查監控服務
    if curl -f http://localhost:9090/-/healthy; then
        log_success "Prometheus 健康檢查通過"
    else
        log_warning "Prometheus 健康檢查失敗"
    fi
    
    log_success "健康檢查完成"
}

# 顯示服務狀態
show_status() {
    log_info "顯示服務狀態..."
    
    echo ""
    echo "=== 服務狀態 ==="
    docker-compose -f docker-compose.production.yml ps
    
    echo ""
    echo "=== 服務日誌 ==="
    docker-compose -f docker-compose.production.yml logs --tail=10
    
    echo ""
    echo "=== 訪問地址 ==="
    echo "主應用: http://localhost"
    echo "API: http://localhost:3000"
    echo "Grafana: http://localhost:3001"
    echo "Prometheus: http://localhost:9090"
    echo "Kibana: http://localhost:5601"
}

# 回滾函數
rollback() {
    log_error "部署失敗，開始回滾..."
    
    # 停止新服務
    docker-compose -f docker-compose.production.yml down
    
    # 恢復備份（如果存在）
    if [ -f "$backup_file" ]; then
        log_info "恢復數據庫備份..."
        psql -h "$POSTGRES_HOST" -U "$POSTGRES_USER" -d "${POSTGRES_DB:-cardstrategy_prod}" < "$backup_file"
    fi
    
    log_error "回滾完成"
    exit 1
}

# 主函數
main() {
    log_info "開始生產環境部署..."
    
    # 設置錯誤處理
    trap rollback ERR
    
    # 檢查環境
    check_environment
    check_docker
    
    # 備份數據庫
    backup_database
    
    # 停止現有服務
    stop_services
    
    # 清理 Docker 資源
    cleanup_docker
    
    # 構建和啟動服務
    build_and_start
    
    # 等待服務就緒
    wait_for_services
    
    # 運行遷移
    run_migrations
    
    # 健康檢查
    health_check
    
    # 顯示狀態
    show_status
    
    log_success "生產環境部署完成！"
}

# 執行主函數
main "$@"
