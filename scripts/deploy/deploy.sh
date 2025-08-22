#!/bin/bash

# CardStrategy 部署腳本
# 用於自動化部署 CardStrategy 應用程序

set -e  # 遇到錯誤時退出

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

# 檢查命令是否存在
check_command() {
    if ! command -v $1 &> /dev/null; then
        log_error "$1 未安裝，請先安裝 $1"
        exit 1
    fi
}

# 檢查環境變量
check_env_vars() {
    log_info "檢查環境變量..."
    
    required_vars=(
        "NODE_ENV"
        "DB_HOST"
        "DB_PORT"
        "DB_NAME"
        "DB_USER"
        "DB_PASSWORD"
        "REDIS_HOST"
        "REDIS_PORT"
        "JWT_SECRET"
        "API_PORT"
    )
    
    missing_vars=()
    
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            missing_vars+=("$var")
        fi
    done
    
    if [ ${#missing_vars[@]} -ne 0 ]; then
        log_error "缺少以下環境變量:"
        printf '%s\n' "${missing_vars[@]}"
        exit 1
    fi
    
    log_success "環境變量檢查完成"
}

# 備份數據庫
backup_database() {
    log_info "開始備份數據庫..."
    
    backup_dir="./backups"
    timestamp=$(date +"%Y%m%d_%H%M%S")
    backup_file="${backup_dir}/db_backup_${timestamp}.sql"
    
    mkdir -p "$backup_dir"
    
    if pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" > "$backup_file"; then
        log_success "數據庫備份完成: $backup_file"
    else
        log_error "數據庫備份失敗"
        exit 1
    fi
}

# 運行數據庫遷移
run_migrations() {
    log_info "運行數據庫遷移..."
    
    if [ -f "./init-db.sql" ]; then
        if psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "./init-db.sql"; then
            log_success "數據庫遷移完成"
        else
            log_error "數據庫遷移失敗"
            exit 1
        fi
    else
        log_warning "未找到 init-db.sql 文件，跳過數據庫遷移"
    fi
}

# 構建 Docker 鏡像
build_images() {
    log_info "構建 Docker 鏡像..."
    
    # 構建後端鏡像
    if docker build -t cardstrategy-backend:latest ./backend; then
        log_success "後端鏡像構建完成"
    else
        log_error "後端鏡像構建失敗"
        exit 1
    fi
    
    # 構建前端鏡像（如果存在）
    if [ -d "./frontend" ]; then
        if docker build -t cardstrategy-frontend:latest ./frontend; then
            log_success "前端鏡像構建完成"
        else
            log_error "前端鏡像構建失敗"
            exit 1
        fi
    fi
}

# 停止現有服務
stop_services() {
    log_info "停止現有服務..."
    
    if docker-compose down; then
        log_success "現有服務已停止"
    else
        log_warning "停止服務時出現警告，繼續執行..."
    fi
}

# 啟動服務
start_services() {
    log_info "啟動服務..."
    
    if docker-compose up -d; then
        log_success "服務啟動完成"
    else
        log_error "服務啟動失敗"
        exit 1
    fi
}

# 等待服務就緒
wait_for_services() {
    log_info "等待服務就緒..."
    
    # 等待後端服務
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -f -s "http://localhost:$API_PORT/api/health" > /dev/null; then
            log_success "後端服務已就緒"
            break
        fi
        
        log_info "等待後端服務... (嘗試 $attempt/$max_attempts)"
        sleep 10
        attempt=$((attempt + 1))
    done
    
    if [ $attempt -gt $max_attempts ]; then
        log_error "後端服務啟動超時"
        exit 1
    fi
    
    # 等待數據庫
    attempt=1
    while [ $attempt -le $max_attempts ]; do
        if docker-compose exec -T postgres pg_isready -U "$DB_USER" -d "$DB_NAME" > /dev/null 2>&1; then
            log_success "數據庫服務已就緒"
            break
        fi
        
        log_info "等待數據庫服務... (嘗試 $attempt/$max_attempts)"
        sleep 5
        attempt=$((attempt + 1))
    done
    
    if [ $attempt -gt $max_attempts ]; then
        log_error "數據庫服務啟動超時"
        exit 1
    fi
}

# 運行健康檢查
health_check() {
    log_info "執行健康檢查..."
    
    # 檢查後端健康狀態
    if curl -f -s "http://localhost:$API_PORT/api/health" | grep -q "healthy"; then
        log_success "後端健康檢查通過"
    else
        log_error "後端健康檢查失敗"
        exit 1
    fi
    
    # 檢查數據庫連接
    if docker-compose exec -T postgres pg_isready -U "$DB_USER" -d "$DB_NAME" > /dev/null 2>&1; then
        log_success "數據庫健康檢查通過"
    else
        log_error "數據庫健康檢查失敗"
        exit 1
    fi
    
    # 檢查 Redis 連接
    if docker-compose exec -T redis redis-cli ping | grep -q "PONG"; then
        log_success "Redis 健康檢查通過"
    else
        log_error "Redis 健康檢查失敗"
        exit 1
    fi
}

# 運行測試
run_tests() {
    log_info "運行測試..."
    
    if [ "$RUN_TESTS" = "true" ]; then
        # 運行後端測試
        if docker-compose exec -T backend npm test; then
            log_success "後端測試通過"
        else
            log_error "後端測試失敗"
            exit 1
        fi
        
        # 運行集成測試
        if docker-compose exec -T backend npm run test:integration; then
            log_success "集成測試通過"
        else
            log_error "集成測試失敗"
            exit 1
        fi
    else
        log_info "跳過測試 (RUN_TESTS=false)"
    fi
}

# 清理舊鏡像
cleanup_images() {
    log_info "清理舊鏡像..."
    
    # 清理懸掛的鏡像
    docker image prune -f
    
    # 清理未使用的鏡像
    docker image prune -a -f
    
    log_success "鏡像清理完成"
}

# 顯示部署信息
show_deployment_info() {
    log_success "部署完成！"
    echo
    echo "服務訪問地址:"
    echo "  - 應用程序: http://localhost:$API_PORT"
    echo "  - API 文檔: http://localhost:$API_PORT/api/docs"
    echo "  - 健康檢查: http://localhost:$API_PORT/api/health"
    echo "  - Grafana: http://localhost:3001"
    echo "  - Prometheus: http://localhost:9090"
    echo
    echo "管理員帳戶:"
    echo "  - 用戶名: admin"
    echo "  - 密碼: admin123"
    echo
    echo "日誌查看:"
    echo "  - docker-compose logs -f backend"
    echo "  - docker-compose logs -f postgres"
    echo "  - docker-compose logs -f redis"
}

# 主部署流程
main() {
    log_info "開始 CardStrategy 部署流程..."
    
    # 檢查必要命令
    check_command docker
    check_command docker-compose
    check_command curl
    check_command psql
    check_command pg_dump
    
    # 檢查環境變量
    check_env_vars
    
    # 備份數據庫
    if [ "$BACKUP_DB" = "true" ]; then
        backup_database
    fi
    
    # 停止現有服務
    stop_services
    
    # 構建鏡像
    build_images
    
    # 啟動服務
    start_services
    
    # 等待服務就緒
    wait_for_services
    
    # 運行數據庫遷移
    run_migrations
    
    # 運行測試
    run_tests
    
    # 健康檢查
    health_check
    
    # 清理舊鏡像
    cleanup_images
    
    # 顯示部署信息
    show_deployment_info
}

# 處理命令行參數
while [[ $# -gt 0 ]]; do
    case $1 in
        --no-backup)
            BACKUP_DB=false
            shift
            ;;
        --no-tests)
            RUN_TESTS=false
            shift
            ;;
        --help)
            echo "CardStrategy 部署腳本"
            echo
            echo "用法: $0 [選項]"
            echo
            echo "選項:"
            echo "  --no-backup    跳過數據庫備份"
            echo "  --no-tests     跳過測試執行"
            echo "  --help         顯示此幫助信息"
            echo
            echo "環境變量:"
            echo "  NODE_ENV       環境 (development/production)"
            echo "  DB_HOST        數據庫主機"
            echo "  DB_PORT        數據庫端口"
            echo "  DB_NAME        數據庫名稱"
            echo "  DB_USER        數據庫用戶"
            echo "  DB_PASSWORD    數據庫密碼"
            echo "  REDIS_HOST     Redis 主機"
            echo "  REDIS_PORT     Redis 端口"
            echo "  JWT_SECRET     JWT 密鑰"
            echo "  API_PORT       API 端口"
            exit 0
            ;;
        *)
            log_error "未知選項: $1"
            echo "使用 --help 查看幫助信息"
            exit 1
            ;;
    esac
done

# 設置默認值
BACKUP_DB=${BACKUP_DB:-true}
RUN_TESTS=${RUN_TESTS:-true}

# 執行主流程
main "$@"
