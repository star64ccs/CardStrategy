#!/bin/bash

# ==================== SSH 密鑰設置腳本 ====================
# 用於生成和設置 DigitalOcean Droplet 的 SSH 密鑰

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

# 檢查 SSH 目錄
check_ssh_directory() {
    log_info "檢查 SSH 目錄..."
    
    if [ ! -d ~/.ssh ]; then
        log_info "創建 SSH 目錄..."
        mkdir -p ~/.ssh
        chmod 700 ~/.ssh
    fi
    
    log_success "SSH 目錄檢查完成"
}

# 生成 SSH 密鑰對
generate_ssh_key() {
    local key_name="cardstrategy_digitalocean"
    local key_path="$HOME/.ssh/$key_name"
    
    log_info "生成 SSH 密鑰對..."
    
    if [ -f "$key_path" ]; then
        log_warning "SSH 密鑰已存在: $key_path"
        read -p "是否要重新生成？(y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log_info "使用現有密鑰"
            return
        fi
        rm -f "$key_path" "$key_path.pub"
    fi
    
    # 生成密鑰
    ssh-keygen -t rsa -b 4096 -f "$key_path" -C "cardstrategy@digitalocean.com" -N ""
    
    # 設置權限
    chmod 600 "$key_path"
    chmod 644 "$key_path.pub"
    
    log_success "SSH 密鑰生成完成"
}

# 顯示密鑰信息
show_key_info() {
    local key_name="cardstrategy_digitalocean"
    local key_path="$HOME/.ssh/$key_name"
    
    log_info "SSH 密鑰信息:"
    echo "=================================================="
    echo "私鑰路徑: $key_path"
    echo "公鑰路徑: $key_path.pub"
    echo "=================================================="
    
    log_info "公鑰內容 (添加到 DigitalOcean):"
    echo "=================================================="
    cat "$key_path.pub"
    echo "=================================================="
    
    log_info "私鑰內容 (添加到 GitHub Secrets):"
    echo "=================================================="
    cat "$key_path"
    echo "=================================================="
}

# 測試 SSH 連接
test_ssh_connection() {
    local key_name="cardstrategy_digitalocean"
    local key_path="$HOME/.ssh/$key_name"
    local droplet_ip="159.223.84.189"
    
    log_info "測試 SSH 連接..."
    
    if ssh -i "$key_path" -o ConnectTimeout=10 -o StrictHostKeyChecking=no root@"$droplet_ip" "echo 'SSH 連接成功!'"; then
        log_success "SSH 連接測試成功"
    else
        log_warning "SSH 連接測試失敗，請檢查以下項目:"
        echo "1. 公鑰是否已添加到 DigitalOcean"
        echo "2. Droplet IP 是否正確"
        echo "3. 防火牆設置是否允許 SSH 連接"
    fi
}

# 顯示設置指南
show_setup_guide() {
    log_info "設置指南:"
    echo "=================================================="
    echo "1. 複製公鑰內容到 DigitalOcean:"
    echo "   - 前往 DigitalOcean 控制台"
    echo "   - Settings → Security → SSH Keys"
    echo "   - 點擊 'Add SSH Key'"
    echo "   - 貼上公鑰內容"
    echo ""
    echo "2. 複製私鑰內容到 GitHub Secrets:"
    echo "   - 前往 GitHub 倉庫"
    echo "   - Settings → Secrets and variables → Actions"
    echo "   - 點擊 'New repository secret'"
    echo "   - Name: PRODUCTION_SSH_KEY"
    echo "   - Value: 貼上私鑰內容"
    echo "=================================================="
}

# 主函數
main() {
    echo "🔑 SSH 密鑰設置工具"
    echo "=================================================="
    
    # 檢查 SSH 目錄
    check_ssh_directory
    
    # 生成 SSH 密鑰
    generate_ssh_key
    
    # 顯示密鑰信息
    show_key_info
    
    # 顯示設置指南
    show_setup_guide
    
    # 詢問是否測試連接
    read -p "是否要測試 SSH 連接？(y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        test_ssh_connection
    fi
    
    log_success "SSH 密鑰設置完成！"
}

# 運行主函數
main "$@"
