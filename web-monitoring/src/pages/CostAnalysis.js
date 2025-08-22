import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Spin, Alert, Table, Tag } from 'antd';
import { 
  DollarOutlined, 
  ArrowUpOutlined, 
  ArrowDownOutlined 
} from '@ant-design/icons';
import { Line, Pie } from 'react-chartjs-2';
import { monitoringService } from '../services/monitoringService';

const CostAnalysis = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadCostData();
  }, []);

  const loadCostData = async () => {
    try {
      setLoading(true);
      const costData = await monitoringService.getCostData();
      setData(costData);
    } catch (err) {
      setError('加載成本數據失敗: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // 成本分布表格數據
  const costBreakdownData = [
    {
      key: '1',
      service: 'OpenAI API',
      cost: 125.50,
      percentage: 45.2,
      trend: 'up',
      status: 'active'
    },
    {
      key: '2',
      service: 'Google Gemini',
      cost: 89.30,
      percentage: 32.1,
      trend: 'down',
      status: 'active'
    },
    {
      key: '3',
      service: 'AWS 服務',
      cost: 35.20,
      percentage: 12.7,
      trend: 'stable',
      status: 'active'
    },
    {
      key: '4',
      service: '第三方服務',
      cost: 28.00,
      percentage: 10.0,
      trend: 'up',
      status: 'active'
    }
  ];

  const columns = [
    {
      title: '服務名稱',
      dataIndex: 'service',
      key: 'service',
    },
    {
      title: '成本 (USD)',
      dataIndex: 'cost',
      key: 'cost',
      render: (cost) => `$${cost.toFixed(2)}`,
    },
    {
      title: '佔比',
      dataIndex: 'percentage',
      key: 'percentage',
      render: (percentage) => `${percentage}%`,
    },
    {
      title: '趨勢',
      dataIndex: 'trend',
      key: 'trend',
      render: (trend) => {
        const color = trend === 'up' ? 'red' : trend === 'down' ? 'green' : 'blue';
        const icon = trend === 'up' ? <ArrowUpOutlined /> : trend === 'down' ? <ArrowDownOutlined /> : '-';
        return <Tag color={color}>{icon} {trend === 'up' ? '上升' : trend === 'down' ? '下降' : '穩定'}</Tag>;
      },
    },
  ];

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
      <h1><DollarOutlined /> 成本分析</h1>
      
      {/* 成本概覽 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="月度總成本"
              value={data?.monthlyCost || 277.00}
              precision={2}
              valueStyle={{ color: '#cf1322' }}
              prefix={<DollarOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="平均日成本"
              value={(data?.monthlyCost || 277.00) / 30}
              precision={2}
              valueStyle={{ color: '#1890ff' }}
              prefix={<DollarOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="成本趨勢"
              value={12.5}
              suffix="%"
              valueStyle={{ color: '#cf1322' }}
              prefix={<ArrowUpOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="預算使用率"
              value={85.2}
              suffix="%"
              valueStyle={{ color: '#faad14' }}
              prefix={<DollarOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* 圖表區域 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={12}>
          <Card title="成本趨勢">
            <Line
              data={{
                labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
                datasets: [{
                  label: '月度成本',
                  data: [180, 220, 195, 240, 260, 277],
                  borderColor: 'rgb(75, 192, 192)',
                  backgroundColor: 'rgba(75, 192, 192, 0.2)',
                  tension: 0.1
                }]
              }}
              options={{
                responsive: true,
                scales: {
                  y: {
                    beginAtZero: true
                  }
                }
              }}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="成本分布">
            <Pie
              data={{
                labels: ['OpenAI API', 'Google Gemini', 'AWS 服務', '第三方服務'],
                datasets: [{
                  data: [45.2, 32.1, 12.7, 10.0],
                  backgroundColor: [
                    'rgba(255, 99, 132, 0.8)',
                    'rgba(54, 162, 235, 0.8)',
                    'rgba(255, 205, 86, 0.8)',
                    'rgba(75, 192, 192, 0.8)'
                  ],
                  borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 205, 86, 1)',
                    'rgba(75, 192, 192, 1)'
                  ],
                  borderWidth: 1
                }]
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'bottom'
                  }
                }
              }}
            />
          </Card>
        </Col>
      </Row>

      {/* 成本明細表格 */}
      <Card title="成本明細">
        <Table 
          columns={columns} 
          dataSource={costBreakdownData} 
          pagination={false}
          size="middle"
        />
      </Card>
    </div>
  );
};

export default CostAnalysis;
