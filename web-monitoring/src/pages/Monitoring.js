import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Progress, Spin, Alert } from 'antd';
import { 
  MonitorOutlined, 
  CheckCircleOutlined, 
  ExclamationCircleOutlined 
} from '@ant-design/icons';
import { Line } from 'react-chartjs-2';
import { monitoringService } from '../services/monitoringService';

const Monitoring = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadMonitoringData();
  }, []);

  const loadMonitoringData = async () => {
    try {
      setLoading(true);
      const monitoringData = await monitoringService.getPerformanceData();
      setData(monitoringData);
    } catch (err) {
      setError('加載監控數據失敗: ' + err.message);
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
      <h1><MonitorOutlined /> 系統監控</h1>
      
      {/* 系統性能指標 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="CPU 使用率"
              value={data?.metrics?.cpu || 0}
              suffix="%"
              valueStyle={{ color: data?.metrics?.cpu > 80 ? '#cf1322' : '#3f8600' }}
              prefix={<MonitorOutlined />}
            />
            <Progress 
              percent={data?.metrics?.cpu || 0} 
              status={data?.metrics?.cpu > 80 ? 'exception' : 'active'}
              size="small"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="內存使用率"
              value={data?.metrics?.memory || 0}
              suffix="%"
              valueStyle={{ color: data?.metrics?.memory > 85 ? '#cf1322' : '#3f8600' }}
              prefix={<MonitorOutlined />}
            />
            <Progress 
              percent={data?.metrics?.memory || 0} 
              status={data?.metrics?.memory > 85 ? 'exception' : 'active'}
              size="small"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="磁盤使用率"
              value={data?.metrics?.disk || 0}
              suffix="%"
              valueStyle={{ color: data?.metrics?.disk > 90 ? '#cf1322' : '#3f8600' }}
              prefix={<MonitorOutlined />}
            />
            <Progress 
              percent={data?.metrics?.disk || 0} 
              status={data?.metrics?.disk > 90 ? 'exception' : 'active'}
              size="small"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="網絡延遲"
              value={data?.metrics?.network || 0}
              suffix="ms"
              valueStyle={{ color: data?.metrics?.network > 100 ? '#cf1322' : '#3f8600' }}
              prefix={<MonitorOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* 性能趨勢圖 */}
      <Row gutter={16}>
        <Col span={24}>
          <Card title="系統性能趨勢">
            <Line
              data={{
                labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'],
                datasets: [
                  {
                    label: 'CPU 使用率',
                    data: [45, 52, 68, 75, 82, 78, 65],
                    borderColor: 'rgb(255, 99, 132)',
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    tension: 0.1
                  },
                  {
                    label: '內存使用率',
                    data: [60, 65, 72, 78, 85, 82, 75],
                    borderColor: 'rgb(54, 162, 235)',
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    tension: 0.1
                  },
                  {
                    label: '磁盤使用率',
                    data: [70, 72, 75, 78, 80, 82, 85],
                    borderColor: 'rgb(255, 205, 86)',
                    backgroundColor: 'rgba(255, 205, 86, 0.2)',
                    tension: 0.1
                  }
                ]
              }}
              options={{
                responsive: true,
                scales: {
                  y: {
                    beginAtZero: true,
                    max: 100
                  }
                }
              }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Monitoring;
