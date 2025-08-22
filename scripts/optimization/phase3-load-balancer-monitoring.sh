#!/bin/bash

echo "🚀 開始第三階段：負載均衡和監控"
echo "=================================="

# 1. 創建 Nginx 負載均衡配置
echo "⚖️ 創建 Nginx 負載均衡配置..."
cat > nginx/load-balancer.conf << 'EOF'
upstream api_backend {
    least_conn;
    server api-gateway-1:3000 max_fails=3 fail_timeout=30s;
    server api-gateway-2:3000 max_fails=3 fail_timeout=30s;
    server api-gateway-3:3000 max_fails=3 fail_timeout=30s;
    keepalive 32;
}

upstream frontend_backend {
    least_conn;
    server frontend-1:3000 max_fails=3 fail_timeout=30s;
    server frontend-2:3000 max_fails=3 fail_timeout=30s;
    keepalive 32;
}

server {
    listen 80;
    server_name cardstrategy.com;

    # 健康檢查
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }

    # API 路由
    location /api/ {
        proxy_pass http://api_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # 超時設置
        proxy_connect_timeout 5s;
        proxy_send_timeout 10s;
        proxy_read_timeout 10s;
        
        # 緩存設置
        proxy_cache api_cache;
        proxy_cache_valid 200 5m;
        proxy_cache_valid 404 1m;
    }

    # 前端路由
    location / {
        proxy_pass http://frontend_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # 靜態文件
    location /static/ {
        expires 1d;
        add_header Cache-Control "public, immutable";
        proxy_pass http://frontend_backend;
    }
}
EOF

# 2. 創建 Prometheus 監控配置
echo "📊 創建 Prometheus 監控配置..."
cat > monitoring/prometheus.yml << 'EOF'
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "alert_rules.yml"

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager:9093

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'api-gateway'
    static_configs:
      - targets: ['api-gateway:3000']
    metrics_path: '/metrics'
    scrape_interval: 10s

  - job_name: 'user-service'
    static_configs:
      - targets: ['user-service:3000']
    metrics_path: '/metrics'
    scrape_interval: 10s

  - job_name: 'card-service'
    static_configs:
      - targets: ['card-service:3000']
    metrics_path: '/metrics'
    scrape_interval: 10s

  - job_name: 'market-service'
    static_configs:
      - targets: ['market-service:3000']
    metrics_path: '/metrics'
    scrape_interval: 10s

  - job_name: 'notification-service'
    static_configs:
      - targets: ['notification-service:3000']
    metrics_path: '/metrics'
    scrape_interval: 10s

  - job_name: 'analytics-service'
    static_configs:
      - targets: ['analytics-service:3000']
    metrics_path: '/metrics'
    scrape_interval: 10s

  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres-exporter:9187']

  - job_name: 'redis'
    static_configs:
      - targets: ['redis-exporter:9121']
EOF

# 3. 創建告警規則
echo "🚨 創建告警規則..."
cat > monitoring/alert_rules.yml << 'EOF'
groups:
  - name: cardstrategy_alerts
    rules:
      # API 響應時間告警
      - alert: HighResponseTime
        expr: http_request_duration_seconds{quantile="0.95"} > 1
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "API 響應時間過高"
          description: "95% 的 API 響應時間超過 1 秒"

      # 錯誤率告警
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) / rate(http_requests_total[5m]) > 0.05
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "錯誤率過高"
          description: "錯誤率超過 5%"

      # 數據庫連接告警
      - alert: DatabaseConnectionHigh
        expr: pg_stat_database_numbackends > 80
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "數據庫連接數過高"
          description: "數據庫連接數超過 80"

      # Redis 記憶體告警
      - alert: RedisMemoryHigh
        expr: redis_memory_used_bytes / redis_memory_max_bytes > 0.8
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Redis 記憶體使用率過高"
          description: "Redis 記憶體使用率超過 80%"

      # 服務不可用告警
      - alert: ServiceDown
        expr: up == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "服務不可用"
          description: "服務 {{ $labels.job }} 不可用"
EOF

# 4. 創建 Grafana 儀表板
echo "📈 創建 Grafana 儀表板..."
cat > monitoring/grafana-dashboards/cardstrategy-overview.json << 'EOF'
{
  "dashboard": {
    "id": null,
    "title": "CardStrategy 系統概覽",
    "tags": ["cardstrategy", "overview"],
    "timezone": "browser",
    "panels": [
      {
        "id": 1,
        "title": "API 響應時間",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_request_duration_seconds_sum[5m]) / rate(http_request_duration_seconds_count[5m])",
            "legendFormat": "{{job}}"
          }
        ],
        "yAxes": [
          {
            "label": "響應時間 (秒)",
            "min": 0
          }
        ]
      },
      {
        "id": 2,
        "title": "請求速率",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_total[5m])",
            "legendFormat": "{{job}} - {{method}}"
          }
        ],
        "yAxes": [
          {
            "label": "請求/秒",
            "min": 0
          }
        ]
      },
      {
        "id": 3,
        "title": "錯誤率",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_total{status=~\"5..\"}[5m]) / rate(http_requests_total[5m])",
            "legendFormat": "{{job}}"
          }
        ],
        "yAxes": [
          {
            "label": "錯誤率",
            "min": 0,
            "max": 1
          }
        ]
      },
      {
        "id": 4,
        "title": "數據庫連接數",
        "type": "graph",
        "targets": [
          {
            "expr": "pg_stat_database_numbackends",
            "legendFormat": "{{datname}}"
          }
        ],
        "yAxes": [
          {
            "label": "連接數",
            "min": 0
          }
        ]
      },
      {
        "id": 5,
        "title": "Redis 記憶體使用",
        "type": "graph",
        "targets": [
          {
            "expr": "redis_memory_used_bytes",
            "legendFormat": "已使用記憶體"
          }
        ],
        "yAxes": [
          {
            "label": "記憶體 (bytes)",
            "min": 0
          }
        ]
      }
    ],
    "time": {
      "from": "now-1h",
      "to": "now"
    },
    "refresh": "30s"
  }
}
EOF

# 5. 創建監控腳本
echo "📊 創建監控腳本..."
cat > monitoring/monitor.sh << 'EOF'
#!/bin/bash

echo "🔍 系統監控檢查"
echo "=================="

# 檢查服務狀態
echo "📋 檢查服務狀態..."
docker-compose -f docker-compose.microservices.yml ps

# 檢查 API 網關健康狀態
echo "🌐 檢查 API 網關..."
curl -f http://localhost:3000/health

# 檢查 Prometheus
echo "📊 檢查 Prometheus..."
curl -f http://localhost:9090/-/healthy

# 檢查 Grafana
echo "📈 檢查 Grafana..."
curl -f http://localhost:3006/api/health

# 檢查數據庫連接
echo "🗄️ 檢查數據庫連接..."
docker exec cardstrategy_postgres_1 pg_isready

# 檢查 Redis 連接
echo "🔴 檢查 Redis 連接..."
docker exec cardstrategy_redis_1 redis-cli ping

echo "✅ 監控檢查完成"
EOF

chmod +x monitoring/monitor.sh

# 6. 啟動監控服務
echo "🚀 啟動監控服務..."
docker-compose -f docker-compose.microservices.yml up -d prometheus grafana

# 7. 測試負載均衡
echo "🧪 測試負載均衡..."
for i in {1..10}; do
  curl -s http://localhost/api/health > /dev/null
  echo "請求 $i 完成"
done

echo "✅ 第三階段負載均衡和監控完成！"
echo "📋 下一步：進入第四階段 - 效能測試和調優"
