import React, { useState, useEffect } from 'react';
import { TradingVolume } from '../types';

const TradingVolumeComponent: React.FC = () => {
  const [volumeData, setVolumeData] = useState<TradingVolume[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<
    '1h' | '24h' | '7d' | '30d'
  >('24h');
  const [sortBy, setSortBy] = useState<'volume' | 'volumeChange' | 'cardName'>(
    'volume'
  );

  useEffect(() => {
    const loadVolumeData = async () => {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 800));

      const mockVolumeData: TradingVolume[] = [
        {
          id: '1',
          cardId: 'card1',
          cardName: '青眼白龍',
          volume: 1250,
          averageVolume: 800,
          volumeChange: 56.25,
          period: selectedPeriod,
          timestamp: new Date().toISOString(),
        },
        {
          id: '2',
          cardId: 'card2',
          cardName: '黑魔導',
          volume: 890,
          averageVolume: 600,
          volumeChange: 48.33,
          period: selectedPeriod,
          timestamp: new Date().toISOString(),
        },
        {
          id: '3',
          cardId: 'card3',
          cardName: '真紅眼黑龍',
          volume: 650,
          averageVolume: 750,
          volumeChange: -13.33,
          period: selectedPeriod,
          timestamp: new Date().toISOString(),
        },
        {
          id: '4',
          cardId: 'card4',
          cardName: '混沌戰士',
          volume: 420,
          averageVolume: 300,
          volumeChange: 40.0,
          period: selectedPeriod,
          timestamp: new Date().toISOString(),
        },
      ];

      setVolumeData(mockVolumeData);
      setLoading(false);
    };

    loadVolumeData();
  }, [selectedPeriod]);

  const getPeriodLabel = (period: string) => {
    switch (period) {
      case '1h':
        return '1小時';
      case '24h':
        return '24小時';
      case '7d':
        return '7天';
      case '30d':
        return '30天';
      default:
        return '24小時';
    }
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1000000) {
      return `${(volume / 1000000).toFixed(1)}M`;
    } else if (volume >= 1000) {
      return `${(volume / 1000).toFixed(1)}K`;
    }
    return volume.toString();
  };

  const getVolumeChangeColor = (change: number) => {
    if (change > 0) return 'positive';
    if (change < 0) return 'negative';
    return 'neutral';
  };

  const getVolumeChangeIcon = (change: number) => {
    if (change > 0) return '📈';
    if (change < 0) return '📉';
    return '➡️';
  };

  const sortedData = [...volumeData].sort((a, b) => {
    switch (sortBy) {
      case 'volume':
        return b.volume - a.volume;
      case 'volumeChange':
        return b.volumeChange - a.volumeChange;
      case 'cardName':
        return a.cardName.localeCompare(b.cardName);
      default:
        return 0;
    }
  });

  if (loading) {
    return <div className="trading-volume loading">載入交易量數據中...</div>;
  }

  return (
    <div className="trading-volume">
      <div className="volume-header">
        <h3>交易量分析</h3>
        <div className="volume-controls">
          <div className="period-selector">
            <label>時間週期:</label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as any)}
            >
              <option value="1h">1小時</option>
              <option value="24h">24小時</option>
              <option value="7d">7天</option>
              <option value="30d">30天</option>
            </select>
          </div>
          <div className="sort-selector">
            <label>排序方式:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
            >
              <option value="volume">按交易量</option>
              <option value="volumeChange">按變化率</option>
              <option value="cardName">按名稱</option>
            </select>
          </div>
        </div>
      </div>

      <div className="volume-summary">
        <div className="summary-card">
          <span className="summary-number">
            {formatVolume(volumeData.reduce((sum, d) => sum + d.volume, 0))}
          </span>
          <span className="summary-label">總交易量</span>
        </div>
        <div className="summary-card">
          <span className="summary-number">{volumeData.length}</span>
          <span className="summary-label">活躍卡片</span>
        </div>
        <div className="summary-card">
          <span className="summary-number">
            {(
              volumeData.reduce((sum, d) => sum + d.volumeChange, 0) /
              volumeData.length
            ).toFixed(1)}
            %
          </span>
          <span className="summary-label">平均變化率</span>
        </div>
      </div>

      <div className="volume-table">
        <table>
          <thead>
            <tr>
              <th>排名</th>
              <th>卡片名稱</th>
              <th>當前交易量</th>
              <th>平均交易量</th>
              <th>變化率</th>
              <th>趨勢</th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((data, index) => (
              <tr key={data.id} className="volume-row">
                <td className="rank">#{index + 1}</td>
                <td className="card-name">{data.cardName}</td>
                <td className="current-volume">{formatVolume(data.volume)}</td>
                <td className="average-volume">
                  {formatVolume(data.averageVolume)}
                </td>
                <td
                  className={`volume-change ${getVolumeChangeColor(data.volumeChange)}`}
                >
                  <span className="change-icon">
                    {getVolumeChangeIcon(data.volumeChange)}
                  </span>
                  {data.volumeChange > 0 ? '+' : ''}
                  {data.volumeChange.toFixed(1)}%
                </td>
                <td className="volume-trend">
                  <div className="trend-bar">
                    <div
                      className="trend-fill"
                      style={{
                        width: `${Math.min(Math.abs(data.volumeChange) * 2, 100)}%`,
                        backgroundColor:
                          data.volumeChange > 0 ? '#4CAF50' : '#F44336',
                      }}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="volume-insights">
        <h4>交易量洞察</h4>
        <div className="insights-grid">
          <div className="insight-item">
            <span className="insight-icon">🔥</span>
            <div className="insight-content">
              <h5>最活躍卡片</h5>
              <p>
                {sortedData[0]?.cardName} -{' '}
                {formatVolume(sortedData[0]?.volume || 0)} 交易量
              </p>
            </div>
          </div>
          <div className="insight-item">
            <span className="insight-icon">📈</span>
            <div className="insight-content">
              <h5>增長最快</h5>
              <p>
                {
                  sortedData.sort((a, b) => b.volumeChange - a.volumeChange)[0]
                    ?.cardName
                }{' '}
                - +
                {sortedData
                  .sort((a, b) => b.volumeChange - a.volumeChange)[0]
                  ?.volumeChange.toFixed(1)}
                %
              </p>
            </div>
          </div>
          <div className="insight-item">
            <span className="insight-icon">📊</span>
            <div className="insight-content">
              <h5>市場活躍度</h5>
              <p>
                平均每張卡片交易量:{' '}
                {formatVolume(
                  volumeData.reduce((sum, d) => sum + d.volume, 0) /
                    volumeData.length
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradingVolumeComponent;
