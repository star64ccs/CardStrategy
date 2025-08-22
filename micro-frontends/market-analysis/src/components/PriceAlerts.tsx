import React, { useState, useEffect } from 'react';
import { PriceAlert } from '../types';

const PriceAlerts: React.FC = () => {
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newAlert, setNewAlert] = useState({
    cardId: '',
    cardName: '',
    targetPrice: '',
    condition: 'above' as 'above' | 'below',
  });

  useEffect(() => {
    const loadAlerts = async () => {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 800));

      const mockAlerts: PriceAlert[] = [
        {
          id: '1',
          cardId: 'card1',
          cardName: '青眼白龍',
          targetPrice: 1600,
          condition: 'above',
          isActive: true,
          createdAt: new Date().toISOString(),
        },
        {
          id: '2',
          cardId: 'card2',
          cardName: '黑魔導',
          targetPrice: 700,
          condition: 'below',
          isActive: true,
          createdAt: new Date().toISOString(),
        },
      ];

      setAlerts(mockAlerts);
      setLoading(false);
    };

    loadAlerts();
  }, []);

  const handleCreateAlert = () => {
    if (!newAlert.cardName || !newAlert.targetPrice) {
      alert('請填寫完整資訊');
      return;
    }

    const alert: PriceAlert = {
      id: Date.now().toString(),
      cardId: newAlert.cardId || `card-${Date.now()}`,
      cardName: newAlert.cardName,
      targetPrice: parseFloat(newAlert.targetPrice),
      condition: newAlert.condition,
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    setAlerts([...alerts, alert]);
    setNewAlert({
      cardId: '',
      cardName: '',
      targetPrice: '',
      condition: 'above',
    });
    setShowCreateForm(false);
  };

  const toggleAlert = (alertId: string) => {
    setAlerts(
      alerts.map((alert) =>
        alert.id === alertId ? { ...alert, isActive: !alert.isActive } : alert
      )
    );
  };

  const deleteAlert = (alertId: string) => {
    setAlerts(alerts.filter((alert) => alert.id !== alertId));
  };

  if (loading) {
    return <div className="price-alerts loading">載入價格警報中...</div>;
  }

  return (
    <div className="price-alerts">
      <div className="alerts-header">
        <h3>價格警報管理</h3>
        <button
          className="btn btn-primary"
          onClick={() => setShowCreateForm(true)}
        >
          新增警報
        </button>
      </div>

      {showCreateForm && (
        <div className="create-alert-form">
          <h4>新增價格警報</h4>
          <div className="form-group">
            <label>卡片名稱:</label>
            <input
              type="text"
              value={newAlert.cardName}
              onChange={(e) =>
                setNewAlert({ ...newAlert, cardName: e.target.value })
              }
              placeholder="輸入卡片名稱"
            />
          </div>
          <div className="form-group">
            <label>目標價格:</label>
            <input
              type="number"
              value={newAlert.targetPrice}
              onChange={(e) =>
                setNewAlert({ ...newAlert, targetPrice: e.target.value })
              }
              placeholder="輸入目標價格"
            />
          </div>
          <div className="form-group">
            <label>警報條件:</label>
            <select
              value={newAlert.condition}
              onChange={(e) =>
                setNewAlert({
                  ...newAlert,
                  condition: e.target.value as 'above' | 'below',
                })
              }
            >
              <option value="above">價格高於</option>
              <option value="below">價格低於</option>
            </select>
          </div>
          <div className="form-actions">
            <button className="btn btn-primary" onClick={handleCreateAlert}>
              創建警報
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => setShowCreateForm(false)}
            >
              取消
            </button>
          </div>
        </div>
      )}

      <div className="alerts-list">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`alert-card ${alert.isActive ? 'active' : 'inactive'}`}
          >
            <div className="alert-header">
              <div className="alert-info">
                <h4>{alert.cardName}</h4>
                <span
                  className={`alert-status ${alert.isActive ? 'active' : 'inactive'}`}
                >
                  {alert.isActive ? '啟用中' : '已停用'}
                </span>
              </div>
              <div className="alert-condition">
                <span className="condition-text">
                  {alert.condition === 'above' ? '價格高於' : '價格低於'}
                </span>
                <span className="target-price">
                  NT$ {alert.targetPrice.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="alert-meta">
              <span>
                創建時間: {new Date(alert.createdAt).toLocaleString()}
              </span>
            </div>

            <div className="alert-actions">
              <button
                className={`btn ${alert.isActive ? 'btn-warning' : 'btn-success'}`}
                onClick={() => toggleAlert(alert.id)}
              >
                {alert.isActive ? '停用警報' : '啟用警報'}
              </button>
              <button
                className="btn btn-danger"
                onClick={() => deleteAlert(alert.id)}
              >
                刪除警報
              </button>
            </div>
          </div>
        ))}
      </div>

      {alerts.length === 0 && (
        <div className="no-alerts">
          <p>目前沒有價格警報</p>
          <button
            className="btn btn-primary"
            onClick={() => setShowCreateForm(true)}
          >
            創建第一個警報
          </button>
        </div>
      )}

      <div className="alerts-summary">
        <div className="summary-item">
          <span className="summary-label">總警報數:</span>
          <span className="summary-value">{alerts.length}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">啟用中:</span>
          <span className="summary-value">
            {alerts.filter((a) => a.isActive).length}
          </span>
        </div>
        <div className="summary-item">
          <span className="summary-label">已停用:</span>
          <span className="summary-value">
            {alerts.filter((a) => !a.isActive).length}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PriceAlerts;
