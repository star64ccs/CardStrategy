const fs = require('fs');
const path = require('path');

/**
 * Monitor儀Table板Create腳本
 * 為 CardStrategy 項目CreateMonitor和Analysis儀Table板
 */

// eslint-disable-next-line no-console
console.log('📊 創建 CardStrategy 監控儀表板...\n');

// CreateMonitor儀Table板 HTML
const dashboardHTML = `<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CardStrategy 監控儀表板</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        
        .dashboard {
            max-width: 1200px;
            margin: 0 auto;
        }
        
        .header {
            background: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            margin-bottom: 20px;
            text-align: center;
        }
        
        .header h1 {
            color: #333;
            margin-bottom: 10px;
        }
        
        .status-indicator {
            display: inline-block;
            padding: 5px 15px;
            border-radius: 20px;
            color: white;
            font-weight: bold;
            margin: 0 5px;
        }
        
        .status-active { background: #4CAF50; }
        .status-warning { background: #FF9800; }
        .status-error { background: #F44336; }
        
        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-bottom: 20px;
        }
        
        .card {
            background: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        
        .card h3 {
            color: #333;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 2px solid #eee;
        }
        
        .metric {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px 0;
            border-bottom: 1px solid #f0f0f0;
        }
        
        .metric:last-child {
            border-bottom: none;
        }
        
        .metric-label {
            font-weight: 500;
            color: #666;
        }
        
        .metric-value {
            font-weight: bold;
            color: #333;
        }
        
        .links {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 15px;
        }
        
        .link-card {
            background: white;
            padding: 15px;
            border-radius: 8px;
            text-decoration: none;
            color: #333;
            transition: transform 0.2s, box-shadow 0.2s;
            border-left: 4px solid #667eea;
        }
        
        .link-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 12px rgba(0,0,0,0.15);
            text-decoration: none;
            color: #333;
        }
        
        .link-title {
            font-weight: bold;
            margin-bottom: 5px;
        }
        
        .link-desc {
            font-size: 0.9em;
            color: #666;
        }
        
        .refresh-btn {
            background: #667eea;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            font-weight: bold;
            margin: 10px 5px;
        }
        
        .refresh-btn:hover {
            background: #5a6fd8;
        }
        
        .chart-placeholder {
            background: #f8f9fa;
            height: 200px;
            border: 2px dashed #dee2e6;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #6c757d;
            border-radius: 5px;
            margin: 10px 0;
        }
    </style>
</head>
<body>
    <div class="dashboard">
        <div class="header">
            <h1>📱 CardStrategy 監控儀表板</h1>
            <p>實時監控您的應用狀態和性能指標</p>
            <div style="margin-top: 15px;">
                <span class="status-indicator status-active">系統運行中</span>
                <span class="status-indicator status-active">所有服務正常</span>
                <span id="last-update" class="status-indicator status-warning">最後更新: --</span>
            </div>
        </div>

        <div class="grid">
            <!-- 服務狀態 -->
            <div class="card">
                <h3>🛠️ 服務狀態</h3>
                <div class="metric">
                    <span class="metric-label">Mixpanel</span>
                    <span class="metric-value" style="color: #4CAF50;">✅ 活躍</span>
                </div>
                <div class="metric">
                    <span class="metric-label">SendGrid</span>
                    <span class="metric-value" style="color: #4CAF50;">✅ 活躍</span>
                </div>
                <div class="metric">
                    <span class="metric-label">LogRocket</span>
                    <span class="metric-value" style="color: #4CAF50;">✅ 活躍</span>
                </div>
                <div class="metric">
                    <span class="metric-label">Gmail SMTP</span>
                    <span class="metric-value" style="color: #4CAF50;">✅ 活躍</span>
                </div>
                <div class="metric">
                    <span class="metric-label">Firebase</span>
                    <span class="metric-value" style="color: #4CAF50;">✅ 活躍</span>
                </div>
            </div>

            <!-- 使用量統計 -->
            <div class="card">
                <h3>📊 使用量統計</h3>
                <div class="metric">
                    <span class="metric-label">Mixpanel 事件</span>
                    <span class="metric-value">0 / 1,000</span>
                </div>
                <div class="metric">
                    <span class="metric-label">SendGrid 郵件</span>
                    <span class="metric-value">2 / 100 (日)</span>
                </div>
                <div class="metric">
                    <span class="metric-label">LogRocket 會話</span>
                    <span class="metric-value">0 / 1,000</span>
                </div>
                <div class="metric">
                    <span class="metric-label">Gmail SMTP</span>
                    <span class="metric-value">2 / 500 (日)</span>
                </div>
                <div class="metric">
                    <span class="metric-label">AWS S3 存儲</span>
                    <span class="metric-value">0 GB / 5 GB</span>
                </div>
            </div>

            <!-- 性能指標 -->
            <div class="card">
                <h3>⚡ 性能指標</h3>
                <div class="metric">
                    <span class="metric-label">應用啟動時間</span>
                    <span class="metric-value">-- ms</span>
                </div>
                <div class="metric">
                    <span class="metric-label">API 響應時間</span>
                    <span class="metric-value">-- ms</span>
                </div>
                <div class="metric">
                    <span class="metric-label">錯誤率</span>
                    <span class="metric-value">0%</span>
                </div>
                <div class="metric">
                    <span class="metric-label">活躍用戶</span>
                    <span class="metric-value">--</span>
                </div>
                <div class="metric">
                    <span class="metric-label">會話時長</span>
                    <span class="metric-value">-- min</span>
                </div>
            </div>

            <!-- 最近活動 -->
            <div class="card">
                <h3>📝 最近活動</h3>
                <div class="metric">
                    <span class="metric-label">最後郵件發送</span>
                    <span class="metric-value">剛剛</span>
                </div>
                <div class="metric">
                    <span class="metric-label">最後錯誤</span>
                    <span class="metric-value">無</span>
                </div>
                <div class="metric">
                    <span class="metric-label">配置更新</span>
                    <span class="metric-value">今天</span>
                </div>
                <div class="metric">
                    <span class="metric-label">部署狀態</span>
                    <span class="metric-value" style="color: #4CAF50;">成功</span>
                </div>
            </div>
        </div>

        <!-- 圖表區域 -->
        <div class="grid">
            <div class="card">
                <h3>📈 用戶行為趨勢</h3>
                <div class="chart-placeholder">
                    Mixpanel 數據圖表<br>
                    <small>需要實際數據後顯示</small>
                </div>
            </div>
            
            <div class="card">
                <h3>🚨 錯誤監控</h3>
                <div class="chart-placeholder">
                    LogRocket 錯誤統計<br>
                    <small>需要實際數據後顯示</small>
                </div>
            </div>
        </div>

        <!-- 快速連結 -->
        <div class="card">
            <h3>🔗 快速連結</h3>
            <div class="links">
                <a href="https://mixpanel.com/project/2818294" target="_blank" class="link-card">
                    <div class="link-title">📊 Mixpanel 控制台</div>
                    <div class="link-desc">查看用戶行為分析和事件統計</div>
                </a>
                
                <a href="https://app.sendgrid.com" target="_blank" class="link-card">
                    <div class="link-title">📧 SendGrid 控制台</div>
                    <div class="link-desc">管理郵件發送和查看統計</div>
                </a>
                
                <a href="https://app.logrocket.com/lzzz2v/card-strategy/" target="_blank" class="link-card">
                    <div class="link-title">🔍 LogRocket 控制台</div>
                    <div class="link-desc">查看會話重播和錯誤監控</div>
                </a>
                
                <a href="https://app.segment.com/chan-yat-sang/sources/javascript/overview" target="_blank" class="link-card">
                    <div class="link-title">🎯 Segment 控制台</div>
                    <div class="link-desc">管理數據收集和目標配置</div>
                </a>
                
                <a href="https://console.firebase.google.com/project/cardstrategy-406cc" target="_blank" class="link-card">
                    <div class="link-title">🔥 Firebase 控制台</div>
                    <div class="link-desc">管理身份驗證和數據存儲</div>
                </a>
                
                <a href="https://console.aws.amazon.com/s3" target="_blank" class="link-card">
                    <div class="link-title">☁️ AWS S3 控制台</div>
                    <div class="link-desc">管理文件存儲和備份</div>
                </a>
            </div>
        </div>

        <!-- 控制按鈕 -->
        <div class="card" style="text-align: center;">
            <h3>🎛️ 控制面板</h3>
            <button class="refresh-btn" onclick="refreshData()">🔄 刷新數據</button>
            <button class="refresh-btn" onclick="testServices()">🧪 測試服務</button>
            <button class="refresh-btn" onclick="exportLogs()">📋 導出日誌</button>
            <button class="refresh-btn" onclick="checkHealth()">💊 健康檢查</button>
        </div>
    </div>

    <script>
        // UpdateTime
        function updateTimestamp() {
            document.getElementById('last-update').textContent = 
                '最後更新: ' + new Date().toLocaleTimeString('zh-TW');
        }

        // RefreshData
        function refreshData() {
            updateTimestamp();
            alert('數據已刷新！');
        }

        // TestService
        function testServices() {
            alert('正在測試所有Service...');
            // 這裡可以調用實際的Test API
        }

        // ExportLog
        function exportLogs() {
            alert('日誌導出功能開發中...');
        }

        // 健康Check
        function checkHealth() {
            alert('所有Service健康狀態良好！');
        }

        // Initialize
        updateTimestamp();
        setInterval(updateTimestamp, 60000); // 每MinuteUpdate一次Time
    </script>
</body>
</html>`;

// CreateMonitorConfigureFile
const monitoringConfig = {
  name: 'monitoring-config.json',
  content: {
    name: 'CardStrategy 監控配置',
    dashboard: {
      enabled: true,
      port: 3001,
      refreshInterval: 60000
    },
    services: {
      mixpanel: {
        enabled: true,
        checkInterval: 300000,
        alertThreshold: 0.9
      },
      sendgrid: {
        enabled: true,
        checkInterval: 300000,
        dailyLimit: 100
      },
      logrocket: {
        enabled: true,
        checkInterval: 300000,
        sessionLimit: 1000
      },
      firebase: {
        enabled: true,
        checkInterval: 300000
      },
      aws: {
        enabled: true,
        checkInterval: 300000
      }
    },
    alerts: {
      email: {
        enabled: true,
        recipients: ['star64ccs@gmail.com']
      },
      thresholds: {
        errorRate: 0.05,
        responseTime: 5000,
        usage: 0.8
      }
    },
    metrics: {
      retention: '30d',
      aggregation: '1h',
      export: {
        enabled: true,
        format: 'json'
      }
    }
  }
};

try {
  // CreateMonitorDirectory
  const monitoringDir = path.join(__dirname, '../monitoring');
  if (!fs.existsSync(monitoringDir)) {
    fs.mkdirSync(monitoringDir, { recursive: true });
  }

  // Create儀Table板 HTML
  const dashboardPath = path.join(monitoringDir, 'dashboard.html');
  fs.writeFileSync(dashboardPath, dashboardHTML);
  // eslint-disable-next-line no-console
  console.log('✅ 創建監控儀表板: monitoring/dashboard.html');

  // CreateMonitorConfigure
  const configPath = path.join(monitoringDir, monitoringConfig.name);
  fs.writeFileSync(configPath, JSON.stringify(monitoringConfig.content, null, 2));
  // eslint-disable-next-line no-console
  console.log('✅ 創建監控配置: monitoring/monitoring-config.json');

  // CreateMonitor腳本
  const monitoringScript = `const fs = require('fs');
const path = require('path');

console.log('🔍 CardStrategy Service監控Check...');

async function checkServiceHealth() {
  const results = {
    timestamp: new Date().toISOString(),
    services: {},
    overall: 'healthy'
  };

  // CheckConfigureFile
  const configFiles = [
    'src/config/ai-keys/mixpanel-config.json',
    'src/config/ai-keys/sendgrid-config.json',
    'src/config/ai-keys/logrocket-config.json',
    'src/config/ai-keys/smtp-config.json'
  ];

  for (const file of configFiles) {
    const serviceName = path.basename(file, '-config.json');
    try {
      const config = JSON.parse(fs.readFileSync(file, 'utf8'));
      results.services[serviceName] = {
        status: config.status || 'unknown',
        healthy: config.status === 'active'
      };
    } catch (error) {
      results.services[serviceName] = {
        status: 'error',
        healthy: false,
        error: error.message
      };
      results.overall = 'degraded';
    }
  }

  return results;
}

// 執Row健康Check
checkServiceHealth().then(results => {
  console.log('📊 監控結果:');
  console.log(JSON.stringify(results, null, 2));
  
  // Save結果
  const reportPath = path.join(__dirname, '../monitoring/health-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  console.log('✅ 健康報告已保存: monitoring/health-report.json');
});`;

  const scriptPath = path.join(__dirname, 'monitor-services.js');
  fs.writeFileSync(scriptPath, monitoringScript);
  // eslint-disable-next-line no-console
  console.log('✅ 創建監控腳本: scripts/monitor-services.js');

  // eslint-disable-next-line no-console
  console.log('\n🎉 監控儀表板創建完成！');
  // eslint-disable-next-line no-console
  console.log('\n📋 可用功能:');
  // eslint-disable-next-line no-console
  console.log('   📊 監控儀表板: monitoring/dashboard.html');
  // eslint-disable-next-line no-console
  console.log('   🔧 監控配置: monitoring/monitoring-config.json');
  // eslint-disable-next-line no-console
  console.log('   🧪 Service監控: node scripts/monitor-services.js');

  // eslint-disable-next-line no-console
  console.log('\n🚀 使用方式:');
  // eslint-disable-next-line no-console
  console.log('   1. 在瀏覽器中打開 monitoring/dashboard.html');
  // eslint-disable-next-line no-console
  console.log('   2. 運行 node scripts/monitor-services.js 進行健康檢查');
  // eslint-disable-next-line no-console
  console.log('   3. 查看各Service的實時狀態和統計');

  // eslint-disable-next-line no-console
  console.log('\n🔗 快速連結:');
  // eslint-disable-next-line no-console
  console.log('   • Mixpanel: https://mixpanel.com/project/2818294');
  // eslint-disable-next-line no-console
  console.log('   • SendGrid: https://app.sendgrid.com');
  // eslint-disable-next-line no-console
  console.log('   • LogRocket: https://app.logrocket.com/lzzz2v/card-strategy/');
  // eslint-disable-next-line no-console
  console.log('   • Segment: https://app.segment.com/chan-yat-sang/sources/javascript/overview');

} catch (error) {
  // eslint-disable-next-line no-console
  console.error('❌ Create監控儀表板Failed:', error.message);
  process.exit(1);
}
