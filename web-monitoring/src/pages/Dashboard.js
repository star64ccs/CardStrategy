import React, { useState, useEffect } from 'react';
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
