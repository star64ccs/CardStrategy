const fs = require('fs');
// eslint-disable-next-line no-unused-vars
const path = require('path');

/**
 * 基於現有系統的網頁監控儀表板創建腳本
 * 零成本，使用現有的API和數據
 */

// eslint-disable-next-line no-console
console.log('🚀 創建基於現有系統的網頁監控儀表板...\n');

// 項目配置
const config = {
  projectName: 'cardstrategy-web-monitoring',
  port: 3000,
  apiBaseUrl: 'http://localhost:3001/api' // 假設後端API端口
};

// 創建項目目錄
function createProjectStructure() {
  // eslint-disable-next-line no-console
  console.log('📁 創建項目結構...');
  
  const dirs = [
    'web-monitoring',
    'web-monitoring/src',
    'web-monitoring/src/components',
    'web-monitoring/src/pages',
    'web-monitoring/src/services',
    'web-monitoring/src/utils',
    'web-monitoring/public'
  ];
  
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      // eslint-disable-next-line no-console
      console.log(`   ✅ ${dir}`);
    }
  });
}

// 創建 package.json
function createPackageJson() {
  // eslint-disable-next-line no-console
  console.log('📦 創建 package.json...');
  
  const packageJson = {
    name: config.projectName,
    version: '1.0.0',
    description: 'CardStrategy 網頁監控儀表板 - 基於現有系統',
    private: true,
    scripts: {
      start: 'react-scripts start',
      build: 'react-scripts build',
      test: 'react-scripts test',
      eject: 'react-scripts eject'
    },
    dependencies: {
      react: '^18.2.0',
      'react-dom': '^18.2.0',
      'react-router-dom': '^6.8.0',
      'react-scripts': '5.0.1',
      axios: '^1.3.0',
      'chart.js': '^4.0.0',
      'react-chartjs-2': '^5.0.0',
      antd: '^5.0.0',
      dayjs: '^1.11.0'
    },
    browserslist: {
      production: [
        '>0.2%',
        'not dead',
        'not op_mini all'
      ],
      development: [
        'last 1 chrome version',
        'last 1 firefox version',
        'last 1 safari version'
      ]
    }
  };
  
  fs.writeFileSync(
    'web-monitoring/package.json',
    JSON.stringify(packageJson, null, 2)
  );
  // eslint-disable-next-line no-console
  console.log('   ✅ package.json');
}

// 創建主要組件
function createMainComponents() {
  // eslint-disable-next-line no-console
  console.log('🔧 創建主要組件...');
  
  // App.js
  const AppJs = `import React from "react"; // eslint-disable-next-line no-unused-vars
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from 'antd';
import Dashboard from './pages/Dashboard';
import Monitoring from './pages/Monitoring';
import CostAnalysis from './pages/CostAnalysis';
import Navigation from './components/Navigation';
import './App.css';

const { Content } = Layout;

function App() {
  return (
    <Router>
      <Layout style={{ minHeight: '100vh' }}>
        <Navigation />
        <Layout>
          <Content style={{ margin: '24px 16px', padding: 24, background: '#fff' }}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/monitoring" element={<Monitoring />} />
              <Route path="/cost-analysis" element={<CostAnalysis />} />
            </Routes>
          </Content>
        </Layout>
      </Layout>
    </Router>
  );
}

export default App;
`;
  
  fs.writeFileSync('web-monitoring/src/App.js', AppJs);
  
  // Dashboard.js
  const DashboardJs = `import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Spin, Alert } from 'antd';
import { 
  DashboardOutlined, 
  DollarOutlined, 
  CheckCircleOutlined, 
  ExclamationCircleOutlined 
} from '@ant-design/icons';
import { Line, Bar } from 'react-chartjs-2';
import { monitoringService } from '../services/monitoringService';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const dashboardData = await monitoringService.getDashboardData();
      setData(dashboardData);
    } catch (err) {
      setError('加載數據失敗: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <p>加載中...</p>
      </div>
    );
  }

  if (error) {
    return <Alert message="錯誤" description={error} type="error" showIcon />;
  }

  return (
    <div>
      <h1><DashboardOutlined /> CardStrategy 監控儀表板</h1>
      
      {/* 關鍵指標 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="系統健康度"
              value={data?.systemHealth || 0}
              suffix="%"
              valueStyle={{ color: data?.systemHealth > 80 ? '#3f8600' : '#cf1322' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="月度成本"
              value={data?.monthlyCost || 0}
              precision={2}
              valueStyle={{ color: '#cf1322' }}
              prefix={<DollarOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="API 成功率"
              value={data?.apiSuccessRate || 0}
              suffix="%"
              valueStyle={{ color: '#3f8600' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="活躍用戶"
              value={data?.activeUsers || 0}
              valueStyle={{ color: '#1890ff' }}
              prefix={<DashboardOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* 圖表 */}
      <Row gutter={16}>
        <Col span={12}>
          <Card title="成本趨勢">
            <Line
              data={{
                labels: data?.costTrend?.labels || [],
                datasets: [{
                  label: '月度成本',
                  data: data?.costTrend?.data || [],
                  borderColor: 'rgb(75, 192, 192)',
                  tension: 0.1
                }]
              }}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="系統性能">
            <Bar
              data={{
                labels: ['CPU', '內存', '磁盤', '網絡'],
                datasets: [{
                  label: '使用率 (%)',
                  data: [
                    data?.systemMetrics?.cpu || 0,
                    data?.systemMetrics?.memory || 0,
                    data?.systemMetrics?.disk || 0,
                    data?.systemMetrics?.network || 0
                  ],
                  backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 205, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)'
                  ]
                }]
              }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
`;
  
  fs.writeFileSync('web-monitoring/src/pages/Dashboard.js', DashboardJs);
  
  // Navigation.js
  const NavigationJs = `import React from "react"; // eslint-disable-next-line no-unused-vars
import { Layout, Menu } from 'antd';
import { Link, useLocation } from 'react-router-dom';
import {
  DashboardOutlined,
  MonitorOutlined,
  DollarOutlined
} from '@ant-design/icons';

const { Sider } = Layout;

const Navigation = () => {
  const location = useLocation();

  const menuItems = [
    {
      key: '/',
      icon: <DashboardOutlined />,
      label: <Link to="/">儀表板</Link>
    },
    {
      key: '/monitoring',
      icon: <MonitorOutlined />,
      label: <Link to="/monitoring">系統監控</Link>
    },
    {
      key: '/cost-analysis',
      icon: <DollarOutlined />,
      label: <Link to="/cost-analysis">成本分析</Link>
    }
  ];

  return (
    <Sider width={200} style={{ background: '#fff' }}>
      <div style={{ height: 32, margin: 16, background: 'rgba(255, 255, 255, 0.2)' }} />
      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        style={{ height: '100%', borderRight: 0 }}
        items={menuItems}
      />
    </Sider>
  );
};

export default Navigation;
`;
  
  fs.writeFileSync('web-monitoring/src/components/Navigation.js', NavigationJs);
  
  // eslint-disable-next-line no-console
  console.log('   ✅ 主要組件');
}

// 創建服務層
function createServices() {
  // eslint-disable-next-line no-console
  console.log('🔌 創建服務層...');
  
  // monitoringService.js
  const monitoringService = `import axios from 'axios';

const API_BASE_URL = '${config.apiBaseUrl}';

class MonitoringService {
  async getDashboardData() {
    try {
      // 調用現有的API接口
      const [aiEcosystem, performance, cost] = await Promise.all([
        this.getAIEcosystemData(),
        this.getPerformanceData(),
        this.getCostData()
      ]);

      return {
        systemHealth: this.calculateSystemHealth(performance),
        monthlyCost: cost.monthlyCost,
        apiSuccessRate: aiEcosystem.successRate * 100,
        activeUsers: performance.activeUsers,
        costTrend: cost.trend,
        systemMetrics: performance.metrics
      };
    } catch (error) {
      console.error('獲取儀表板數據失敗:', error);
      throw error;
    }
  }

  async getAIEcosystemData() {
    try {
      const response = await axios.get(\`\${API_BASE_URL}/ai-ecosystem/stats\`);
      return response.data;
    } catch (error) {
      console.error('獲取AI生態系統數據失敗:', error);
      return {
        successRate: 0,
        totalRequests: 0,
        monthlyCost: 0
      };
    }
  }

  async getPerformanceData() {
    try {
      const response = await axios.get(\`\${API_BASE_URL}/performance/metrics\`);
      return response.data;
    } catch (error) {
      console.error('獲取性能數據失敗:', error);
      return {
        activeUsers: 0,
        metrics: {
          cpu: 0,
          memory: 0,
          disk: 0,
          network: 0
        }
      };
    }
  }

  async getCostData() {
    try {
      const response = await axios.get(\`\${API_BASE_URL}/cost/analysis\`);
      return response.data;
    } catch (error) {
      console.error('獲取成本數據失敗:', error);
      return {
        monthlyCost: 0,
        trend: {
          labels: [],
          data: []
        }
      };
    }
  }

  calculateSystemHealth(performance) {
    const { cpu, memory, disk } = performance.metrics;
    const avgUsage = (cpu + memory + disk) / 3;
    return Math.max(0, 100 - avgUsage);
  }
}

export const monitoringService = new MonitoringService();
`;
  
  fs.writeFileSync('web-monitoring/src/services/monitoringService.js', monitoringService);
  // eslint-disable-next-line no-console
  console.log('   ✅ 服務層');
}

// 創建樣式文件
function createStyles() {
  // eslint-disable-next-line no-console
  console.log('🎨 創建樣式文件...');
  
  const AppCss = `body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

code {
  font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
    monospace;
}

.ant-layout-sider {
  box-shadow: 2px 0 8px 0 rgba(29, 35, 41, 0.05);
}

.ant-card {
  box-shadow: 0 1px 2px -2px rgba(0, 0, 0, 0.16), 0 3px 6px 0 rgba(0, 0, 0, 0.12), 0 5px 12px 4px rgba(0, 0, 0, 0.09);
}
`;
  
  fs.writeFileSync('web-monitoring/src/App.css', AppCss);
  // eslint-disable-next-line no-console
  console.log('   ✅ 樣式文件');
}

// 創建 README
function createReadme() {
  // eslint-disable-next-line no-console
  console.log('📖 創建 README...');
  
  const readme = `# CardStrategy 網頁監控儀表板

## 🚀 快速開始

### 安裝依賴
\`\`\`bash
cd web-monitoring
npm install
\`\`\`

### 啟動開發服務器
\`\`\`bash
npm start
\`\`\`

### 訪問應用
打開瀏覽器訪問: http://localhost:${config.port}

## 📊 功能特性

- ✅ 實時系統監控
- ✅ 成本分析追蹤
- ✅ AI生態系統監控
- ✅ 性能指標展示
- ✅ 響應式設計

## 🛠️ 技術棧

- React 18
- Ant Design
- Chart.js
- Axios
- React Router

## 🔌 API 集成

本應用調用現有的 CardStrategy API 接口：

- \`/api/ai-ecosystem/stats\` - AI生態系統統計
- \`/api/performance/metrics\` - 性能指標
- \`/api/cost/analysis\` - 成本分析

## 📁 項目結構

\`\`\`
web-monitoring/
├── src/
│   ├── components/     # 可重用組件
│   ├── pages/         # 頁面組件
│   ├── services/      # API 服務
│   ├── utils/         # 工具函數
│   ├── App.js         # 主應用組件
│   └── App.css        # 樣式文件
├── public/            # 靜態資源
└── package.json       # 項目配置
\`\`\`

## 🎯 零成本優勢

- 使用現有的 API 接口
- 重用現有的數據庫
- 基於現有的監控服務
- 無需額外服務器資源
`;
  
  fs.writeFileSync('web-monitoring/README.md', readme);
  // eslint-disable-next-line no-console
  console.log('   ✅ README.md');
}

// 主函數
function main() {
  createProjectStructure();
  createPackageJson();
  createMainComponents();
  createServices();
  createStyles();
  createReadme();
  
  // eslint-disable-next-line no-console
  console.log('\n✅ 網頁監控儀表板創建完成！');
  // eslint-disable-next-line no-console
  console.log('\n📋 下一步操作:');
  // eslint-disable-next-line no-console
  console.log('   1. cd web-monitoring');
  // eslint-disable-next-line no-console
  console.log('   2. npm install');
  // eslint-disable-next-line no-console
  console.log('   3. npm start');
  // eslint-disable-next-line no-console
  console.log('   4. 訪問 http://localhost:${config.port}');
  
  // eslint-disable-next-line no-console
  console.log('\n💡 優勢:');
  // eslint-disable-next-line no-console
  console.log('   • 零額外開發成本');
  // eslint-disable-next-line no-console
  console.log('   • 使用現有API和數據');
  // eslint-disable-next-line no-console
  console.log('   • 快速部署上線');
  // eslint-disable-next-line no-console
  console.log('   • 專業的監控界面');
}

main();
