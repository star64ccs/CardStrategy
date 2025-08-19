import React, { useState, useEffect } from 'react';
import { DataAnalysis } from '../types';

const DataAnalyzer: React.FC = () => {
  const [analyses, setAnalyses] = useState<DataAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'market_trend' | 'price_pattern' | 'volume_analysis' | 'correlation'>('all');

  useEffect(() => {
    const loadAnalyses = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockAnalyses: DataAnalysis[] = [
        {
          id: '1',
          type: 'market_trend',
          title: '龍族卡片市場趨勢分析',
          description: '分析顯示龍族卡片在過去30天內整體上漲趨勢明顯，特別是青眼白龍和真紅眼黑龍',
          insights: [
            '龍族卡片平均漲幅15.3%',
            '交易量增加45%',
            '收藏家需求上升',
            '新版本發布影響'
          ],
          dataPoints: 15000,
          confidence: 89.5,
          timestamp: new Date().toISOString(),
          modelVersion: '2.1.0'
        },
        {
          id: '2',
          type: 'price_pattern',
          title: '價格週期性模式識別',
          description: '發現多張熱門卡片存在週期性價格波動模式，可用於交易策略制定',
          insights: [
            '週末價格通常較低',
            '新卡包發售前價格上漲',
            '比賽期間需求增加',
            '季節性影響明顯'
          ],
          dataPoints: 25000,
          confidence: 92.1,
          timestamp: new Date().toISOString(),
          modelVersion: '2.1.0'
        },
        {
          id: '3',
          type: 'volume_analysis',
          title: '交易量異常分析',
          description: '檢測到黑魔導交易量異常增加，可能預示價格變動',
          insights: [
            '交易量增加300%',
            '大戶可能在建倉',
            '價格尚未明顯變動',
            '建議密切關注'
          ],
          dataPoints: 8000,
          confidence: 85.7,
          timestamp: new Date().toISOString(),
          modelVersion: '2.1.0'
        }
      ];

      setAnalyses(mockAnalyses);
      setLoading(false);
    };

    loadAnalyses();
  }, []);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'market_trend': return '📈';
      case 'price_pattern': return '🔄';
      case 'volume_analysis': return '📊';
      case 'correlation': return '🔗';
      default: return '📋';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'market_trend': return '市場趨勢';
      case 'price_pattern': return '價格模式';
      case 'volume_analysis': return '交易量分析';
      case 'correlation': return '相關性分析';
      default: return type;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'high';
    if (confidence >= 80) return 'medium';
    return 'low';
  };

  const filteredAnalyses = analyses.filter(analysis =>
    filter === 'all' || analysis.type === filter
  );

  if (loading) {
    return <div className="data-analyzer loading">載入分析數據中...</div>;
  }

  return (
    <div className="data-analyzer">
      <div className="analyzer-header">
        <h3>AI 數據分析</h3>
        <div className="analyzer-filters">
          <div className="filter-group">
            <label>分析類型:</label>
            <select value={filter} onChange={(e) => setFilter(e.target.value as any)}>
              <option value="all">全部類型</option>
              <option value="market_trend">市場趨勢</option>
              <option value="price_pattern">價格模式</option>
              <option value="volume_analysis">交易量分析</option>
              <option value="correlation">相關性分析</option>
            </select>
          </div>
        </div>
      </div>

      <div className="analyzer-stats">
        <div className="stat-card">
          <span className="stat-number">{analyses.length}</span>
          <span className="stat-label">總分析數</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">
            {analyses.reduce((sum, a) => sum + a.dataPoints, 0).toLocaleString()}
          </span>
          <span className="stat-label">總數據點</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">
            {(analyses.reduce((sum, a) => sum + a.confidence, 0) / analyses.length).toFixed(1)}%
          </span>
          <span className="stat-label">平均置信度</span>
        </div>
      </div>

      <div className="analyses-list">
        {filteredAnalyses.map(analysis => (
          <div key={analysis.id} className="analysis-card">
            <div className="analysis-header">
              <div className="analysis-type">
                <span className="type-icon">{getTypeIcon(analysis.type)}</span>
                <span className="type-label">{getTypeLabel(analysis.type)}</span>
              </div>
              <div className="analysis-confidence">
                <span className={`confidence-badge ${getConfidenceColor(analysis.confidence)}`}>
                  {analysis.confidence.toFixed(1)}% 置信度
                </span>
              </div>
            </div>

            <div className="analysis-content">
              <h4>{analysis.title}</h4>
              <p>{analysis.description}</p>
            </div>

            <div className="analysis-insights">
              <h5>關鍵洞察:</h5>
              <ul>
                {analysis.insights.map((insight, index) => (
                  <li key={index}>{insight}</li>
                ))}
              </ul>
            </div>

            <div className="analysis-meta">
              <div className="meta-item">
                <span className="meta-label">數據點:</span>
                <span className="meta-value">{analysis.dataPoints.toLocaleString()}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">模型版本:</span>
                <span className="meta-value">{analysis.modelVersion}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">分析時間:</span>
                <span className="meta-value">
                  {new Date(analysis.timestamp).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="analysis-actions">
              <button className="btn btn-primary">查看詳細報告</button>
              <button className="btn btn-secondary">導出數據</button>
              <button className="btn btn-outline">分享分析</button>
            </div>
          </div>
        ))}
      </div>

      {filteredAnalyses.length === 0 && (
        <div className="no-analyses">
          <p>沒有找到符合條件的分析</p>
          <button
            className="btn btn-primary"
            onClick={() => setFilter('all')}
          >
            清除篩選
          </button>
        </div>
      )}
    </div>
  );
};

export default DataAnalyzer;
