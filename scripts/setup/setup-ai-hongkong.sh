#!/bin/bash

# 🇭🇰 香港用戶 AI 服務設置腳本
# 專為香港用戶設計的 AI 服務配置腳本

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

# 檢查系統
check_system() {
    log_info "檢查系統環境..."
    
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        OS="linux"
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        OS="macos"
    elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]]; then
        OS="windows"
    else
        log_error "不支援的操作系統: $OSTYPE"
        exit 1
    fi
    
    log_success "檢測到操作系統: $OS"
}

# 檢查必要工具
check_requirements() {
    log_info "檢查必要工具..."
    
    # 檢查 curl
    if ! command -v curl &> /dev/null; then
        log_error "curl 未安裝，請先安裝 curl"
        exit 1
    fi
    
    # 檢查 git
    if ! command -v git &> /dev/null; then
        log_error "git 未安裝，請先安裝 git"
        exit 1
    fi
    
    # 檢查 Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js 未安裝，請先安裝 Node.js"
        exit 1
    fi
    
    log_success "所有必要工具已安裝"
}

# 創建環境變量文件
create_env_files() {
    log_info "創建環境變量文件..."
    
    # 創建 .env 文件
    if [ ! -f ".env" ]; then
        cat > .env << EOF
# ==================== AI 服務配置 (香港用戶專用) ====================

# Hugging Face (推薦 - 完全免費)
HUGGING_FACE_API_KEY=your_huggingface_token_here

# Cohere (免費額度 - 5 requests/minute)
COHERE_API_KEY=your_cohere_api_key_here

# Replicate (免費額度 - 500 requests/month)
REPLICATE_API_KEY=your_replicate_token_here

# 本地 AI 服務
OLLAMA_API_URL=http://localhost:11434/api/generate
LM_STUDER_API_URL=http://localhost:1234/v1/chat/completions

# 備用 OpenAI/Gemini (如果使用 VPN)
OPENAI_API_KEY=your_openai_api_key_here
GOOGLE_PALM_API_KEY=your_gemini_api_key_here

# ==================== 其他配置 ====================
NODE_ENV=development
EOF
        log_success "創建 .env 文件"
    else
        log_warning ".env 文件已存在，跳過創建"
    fi
    
    # 創建 backend/.env 文件
    if [ ! -f "backend/.env" ]; then
        cat > backend/.env << EOF
# ==================== 後端 AI 服務配置 ====================

# AI 服務配置
HUGGING_FACE_API_KEY=your_huggingface_token_here
COHERE_API_KEY=your_cohere_api_key_here
REPLICATE_API_KEY=your_replicate_token_here

# 本地 AI 配置
OLLAMA_API_URL=http://localhost:11434/api/generate
LM_STUDER_API_URL=http://localhost:1234/v1/chat/completions

# 備用配置
OPENAI_API_KEY=your_openai_api_key_here
GOOGLE_PALM_API_KEY=your_gemini_api_key_here

# 數據庫配置
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=cardstrategy_dev
POSTGRES_USER=cardstrategy_user
POSTGRES_PASSWORD=your_secure_password

# JWT 配置
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRE=24h

# 其他配置
NODE_ENV=development
PORT=3000
LOG_LEVEL=info
EOF
        log_success "創建 backend/.env 文件"
    else
        log_warning "backend/.env 文件已存在，跳過創建"
    fi
}

# 安裝 Ollama (本地 AI 模型)
install_ollama() {
    log_info "安裝 Ollama (本地 AI 模型)..."
    
    if command -v ollama &> /dev/null; then
        log_success "Ollama 已安裝"
        return
    fi
    
    case $OS in
        "macos")
            log_info "在 macOS 上安裝 Ollama..."
            if command -v brew &> /dev/null; then
                brew install ollama
            else
                log_error "請先安裝 Homebrew: https://brew.sh/"
                exit 1
            fi
            ;;
        "linux")
            log_info "在 Linux 上安裝 Ollama..."
            curl -fsSL https://ollama.ai/install.sh | sh
            ;;
        "windows")
            log_warning "請手動下載並安裝 Ollama: https://ollama.ai/download"
            log_info "下載後請運行: ollama serve"
            return
            ;;
    esac
    
    log_success "Ollama 安裝完成"
}

# 下載 Ollama 模型
download_ollama_models() {
    log_info "下載 Ollama 模型..."
    
    if ! command -v ollama &> /dev/null; then
        log_warning "Ollama 未安裝，跳過模型下載"
        return
    fi
    
    # 啟動 Ollama 服務
    if ! pgrep -x "ollama" > /dev/null; then
        log_info "啟動 Ollama 服務..."
        ollama serve &
        sleep 5
    fi
    
    # 下載常用模型
    models=("llama2" "codellama" "mistral")
    
    for model in "${models[@]}"; do
        log_info "下載模型: $model"
        ollama pull $model || log_warning "下載模型 $model 失敗"
    done
    
    log_success "模型下載完成"
}

# 測試 AI 服務
test_ai_services() {
    log_info "測試 AI 服務連接..."
    
    # 測試 Hugging Face
    if [ -n "$HUGGING_FACE_API_KEY" ] && [ "$HUGGING_FACE_API_KEY" != "your_huggingface_token_here" ]; then
        log_info "測試 Hugging Face API..."
        response=$(curl -s -X POST https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium \
            -H "Authorization: Bearer $HUGGING_FACE_API_KEY" \
            -H "Content-Type: application/json" \
            -d '{"inputs": "Hello"}' || echo "FAILED")
        
        if [[ $response != *"FAILED"* ]]; then
            log_success "Hugging Face API 連接成功"
        else
            log_warning "Hugging Face API 連接失敗"
        fi
    fi
    
    # 測試 Ollama
    if command -v ollama &> /dev/null; then
        log_info "測試 Ollama 服務..."
        if pgrep -x "ollama" > /dev/null; then
            response=$(curl -s -X POST http://localhost:11434/api/generate \
                -H "Content-Type: application/json" \
                -d '{"model": "llama2", "prompt": "Hello", "stream": false}' || echo "FAILED")
            
            if [[ $response != *"FAILED"* ]]; then
                log_success "Ollama 服務連接成功"
            else
                log_warning "Ollama 服務連接失敗"
            fi
        else
            log_warning "Ollama 服務未運行"
        fi
    fi
}

# 顯示設置指南
show_setup_guide() {
    log_info "顯示設置指南..."
    
    cat << EOF

${GREEN}🎉 AI 服務設置完成！${NC}

${BLUE}📋 下一步操作：${NC}

1. ${YELLOW}配置 API 密鑰：${NC}
   - 訪問 https://huggingface.co/ 註冊並獲取 API Token
   - 訪問 https://cohere.ai/ 註冊並獲取 API Key
   - 訪問 https://replicate.com/ 註冊並獲取 API Token

2. ${YELLOW}更新環境變量：${NC}
   - 編輯 .env 文件
   - 將 "your_xxx_here" 替換為實際的 API 密鑰

3. ${YELLOW}啟動 Ollama (可選)：${NC}
   - 運行: ollama serve
   - 下載模型: ollama pull llama2

4. ${YELLOW}測試服務：${NC}
   - 運行: npm run test:ai
   - 或手動測試各個 API

${BLUE}📚 詳細文檔：${NC}
- 香港用戶 AI 設置指南: docs/HONG_KONG_AI_SETUP_GUIDE.md
- 專案文檔: docs/

${BLUE}🔧 故障排除：${NC}
- 如果遇到問題，請查看 docs/HONG_KONG_AI_SETUP_GUIDE.md
- 或聯繫開發團隊

${GREEN}祝您使用愉快！🇭🇰${NC}

EOF
}

# 主函數
main() {
    echo -e "${BLUE}"
    echo "🇭🇰 CardStrategy AI 服務設置腳本 (香港用戶專用)"
    echo "================================================"
    echo -e "${NC}"
    
    check_system
    check_requirements
    create_env_files
    install_ollama
    download_ollama_models
    test_ai_services
    show_setup_guide
    
    log_success "設置完成！"
}

# 運行主函數
main "$@"
