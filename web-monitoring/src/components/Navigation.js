import React from 'react';
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
