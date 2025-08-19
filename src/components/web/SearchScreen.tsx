import React, { useState, useEffect } from 'react';
import { Card } from '../../services/cardService';
import CardGrid from './CardGrid';
import { logger } from '../../utils/logger';

interface SearchFilters {
  setName: string;
  rarity: string;
  type: string;
  minPrice: number;
  maxPrice: number;
  sortBy: 'name' | 'price' | 'rarity' | 'date';
  sortOrder: 'asc' | 'desc';
}

const SearchScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({
    setName: '',
    rarity: '',
    type: '',
    minPrice: 0,
    maxPrice: 10000,
    sortBy: 'name',
    sortOrder: 'asc'
  });
  const [searchResults, setSearchResults] = useState<Card[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // 模擬卡片數據
  const allCards: Card[] = [
    {
      id: '1',
      name: '青眼白龍',
      setName: '遊戲王 初代',
      rarity: 'UR',
      type: '怪獸卡',
      imageUrl: 'https://via.placeholder.com/300x400/3498db/ffffff?text=青眼白龍',
      price: { current: 1500, change24h: 50, change7d: 200, change30d: -100 },
      marketData: { volume24h: 50000, totalSupply: 1000, circulatingSupply: 800 },
      stats: { attack: 3000, defense: 2500 },
      description: '傳說中的最強龍族怪獸，擁有毀滅性的力量。',
      tags: ['龍族', '傳說', '攻擊型'],
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    {
      id: '2',
      name: '黑魔導',
      setName: '遊戲王 初代',
      rarity: 'SR',
      type: '怪獸卡',
      imageUrl: 'https://via.placeholder.com/300x400/9b59b6/ffffff?text=黑魔導',
      price: { current: 800, change24h: 20, change7d: 80, change30d: 150 },
      marketData: { volume24h: 30000, totalSupply: 2000, circulatingSupply: 1800 },
      stats: { attack: 2500, defense: 2100 },
      description: '強大的魔法師，掌握著神秘的魔法力量。',
      tags: ['魔法師', '經典', '平衡型'],
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    {
      id: '3',
      name: '真紅眼黑龍',
      setName: '遊戲王 初代',
      rarity: 'UR',
      type: '怪獸卡',
      imageUrl: 'https://via.placeholder.com/300x400/e74c3c/ffffff?text=真紅眼黑龍',
      price: { current: 1200, change24h: -30, change7d: 100, change30d: 300 },
      marketData: { volume24h: 40000, totalSupply: 1500, circulatingSupply: 1200 },
      stats: { attack: 2400, defense: 2000 },
      description: '擁有真紅之眼的強大龍族，象徵著力量與榮耀。',
      tags: ['龍族', '稀有', '攻擊型'],
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    {
      id: '4',
      name: '混沌戰士',
      setName: '遊戲王 初代',
      rarity: 'UR',
      type: '怪獸卡',
      imageUrl: 'https://via.placeholder.com/300x400/f39c12/ffffff?text=混沌戰士',
      price: { current: 2000, change24h: 100, change7d: 400, change30d: 800 },
      marketData: { volume24h: 60000, totalSupply: 500, circulatingSupply: 400 },
      stats: { attack: 3000, defense: 2500 },
      description: '混沌與秩序的化身，擁有無與倫比的戰鬥力。',
      tags: ['戰士', '傳說', '混沌'],
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    {
      id: '5',
      name: '元素英雄 新宇俠',
      setName: '遊戲王 GX',
      rarity: 'SR',
      type: '融合怪獸',
      imageUrl: 'https://via.placeholder.com/300x400/2ecc71/ffffff?text=新宇俠',
      price: { current: 600, change24h: 15, change7d: 60, change30d: 120 },
      marketData: { volume24h: 25000, totalSupply: 3000, circulatingSupply: 2800 },
      stats: { attack: 2500, defense: 2000 },
      description: '元素英雄系列的代表，融合了多種元素的力量。',
      tags: ['英雄', '融合', '元素'],
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    }
  ];

  // 搜索邏輯
  const performSearch = () => {
    setIsSearching(true);

    // 模擬API延遲
    setTimeout(() => {
      const results = allCards.filter(card => {
        // 名稱搜索
        if (searchQuery && !card.name.toLowerCase().includes(searchQuery.toLowerCase())) {
          return false;
        }

        // 系列篩選
        if (filters.setName && card.setName !== filters.setName) {
          return false;
        }

        // 稀有度篩選
        if (filters.rarity && card.rarity !== filters.rarity) {
          return false;
        }

        // 類型篩選
        if (filters.type && card.type !== filters.type) {
          return false;
        }

        // 價格範圍篩選
        if (card.price.current < filters.minPrice || card.price.current > filters.maxPrice) {
          return false;
        }

        return true;
      });

      // 排序
      results.sort((a, b) => {
        let aValue: any, bValue: any;

        switch (filters.sortBy) {
          case 'name':
            aValue = a.name;
            bValue = b.name;
            break;
          case 'price':
            aValue = a.price.current;
            bValue = b.price.current;
            break;
          case 'rarity':
            aValue = a.rarity;
            bValue = b.rarity;
            break;
          case 'date':
            aValue = new Date(a.createdAt);
            bValue = new Date(b.createdAt);
            break;
          default:
            aValue = a.name;
            bValue = b.name;
        }

        if (filters.sortOrder === 'asc') {
          return aValue > bValue ? 1 : -1;
        }
        return aValue < bValue ? 1 : -1;

      });

      setSearchResults(results);
      setIsSearching(false);
    }, 500);
  };

  // 當搜索條件改變時自動搜索
  useEffect(() => {
    if (searchQuery || filters.setName || filters.rarity || filters.type) {
      performSearch();
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, filters]);

  const handleCardClick = (card: Card) => {
    logger.info(`點擊了卡片: ${card.name}，價格: ${card.price.current} TWD`);
  };

  const clearFilters = () => {
    setFilters({
      setName: '',
      rarity: '',
      type: '',
      minPrice: 0,
      maxPrice: 10000,
      sortBy: 'name',
      sortOrder: 'asc'
    });
    setSearchQuery('');
  };

  return (
    <div style={styles.container}>
      {/* 搜索標題 */}
      <div style={styles.header}>
        <h2 style={styles.title}>🔍 搜索卡片</h2>
        <p style={styles.subtitle}>找到您想要的卡片，查看實時價格和市場信息</p>
      </div>

      {/* 搜索欄 */}
      <div style={styles.searchSection}>
        <div style={styles.searchBar}>
          <input
            style={styles.searchInput}
            type="text"
            placeholder="搜索卡片名稱..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button
            style={styles.searchButton}
            onClick={performSearch}
            disabled={isSearching}
          >
            {isSearching ? '🔍' : '🔍'}
          </button>
        </div>

        <button
          style={styles.filterToggle}
          onClick={() => setShowFilters(!showFilters)}
        >
          {showFilters ? '隱藏篩選' : '顯示篩選'} ⚙️
        </button>
      </div>

      {/* 篩選器 */}
      {showFilters && (
        <div style={styles.filtersSection}>
          <div style={styles.filtersGrid}>
            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>系列</label>
              <select
                style={styles.filterSelect}
                value={filters.setName}
                onChange={(e) => setFilters({...filters, setName: e.target.value})}
              >
                <option value="">全部系列</option>
                <option value="遊戲王 初代">遊戲王 初代</option>
                <option value="遊戲王 GX">遊戲王 GX</option>
                <option value="遊戲王 5D&apos;s">遊戲王 5D&apos;s</option>
              </select>
            </div>

            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>稀有度</label>
              <select
                style={styles.filterSelect}
                value={filters.rarity}
                onChange={(e) => setFilters({...filters, rarity: e.target.value})}
              >
                <option value="">全部稀有度</option>
                <option value="UR">UR</option>
                <option value="SR">SR</option>
                <option value="R">R</option>
                <option value="N">N</option>
              </select>
            </div>

            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>類型</label>
              <select
                style={styles.filterSelect}
                value={filters.type}
                onChange={(e) => setFilters({...filters, type: e.target.value})}
              >
                <option value="">全部類型</option>
                <option value="怪獸卡">怪獸卡</option>
                <option value="融合怪獸">融合怪獸</option>
                <option value="魔法卡">魔法卡</option>
                <option value="陷阱卡">陷阱卡</option>
              </select>
            </div>

            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>價格範圍</label>
              <div style={styles.priceRange}>
                <input
                  style={styles.priceInput}
                  type="number"
                  placeholder="最低"
                  value={filters.minPrice}
                  onChange={(e) => setFilters({...filters, minPrice: Number(e.target.value)})}
                />
                <span style={styles.priceSeparator}>-</span>
                <input
                  style={styles.priceInput}
                  type="number"
                  placeholder="最高"
                  value={filters.maxPrice}
                  onChange={(e) => setFilters({...filters, maxPrice: Number(e.target.value)})}
                />
              </div>
            </div>

            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>排序</label>
              <div style={styles.sortControls}>
                <select
                  style={styles.sortSelect}
                  value={filters.sortBy}
                  onChange={(e) => setFilters({...filters, sortBy: e.target.value as any})}
                >
                  <option value="name">名稱</option>
                  <option value="price">價格</option>
                  <option value="rarity">稀有度</option>
                  <option value="date">日期</option>
                </select>
                <button
                  style={styles.sortButton}
                  onClick={() => setFilters({
                    ...filters,
                    sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc'
                  })}
                >
                  {filters.sortOrder === 'asc' ? '↑' : '↓'}
                </button>
              </div>
            </div>
          </div>

          <div style={styles.filterActions}>
            <button style={styles.clearButton} onClick={clearFilters}>
              清除篩選
            </button>
          </div>
        </div>
      )}

      {/* 搜索結果 */}
      <div style={styles.resultsSection}>
        {isSearching ? (
          <div style={styles.loadingContainer}>
            <div style={styles.loadingSpinner}></div>
            <div style={styles.loadingText}>搜索中...</div>
          </div>
        ) : searchResults.length > 0 ? (
          <>
            <div style={styles.resultsHeader}>
              <h3 style={styles.resultsTitle}>搜索結果</h3>
              <span style={styles.resultsCount}>找到 {searchResults.length} 張卡片</span>
            </div>
            <CardGrid cards={searchResults} onCardClick={handleCardClick} />
          </>
        ) : searchQuery || filters.setName || filters.rarity || filters.type ? (
          <div style={styles.noResults}>
            <div style={styles.noResultsIcon}>🔍</div>
            <div style={styles.noResultsText}>沒有找到匹配的卡片</div>
            <div style={styles.noResultsSubtext}>請嘗試調整搜索條件</div>
          </div>
        ) : (
          <div style={styles.initialState}>
            <div style={styles.initialIcon}>🎴</div>
            <div style={styles.initialText}>開始搜索您想要的卡片</div>
            <div style={styles.initialSubtext}>輸入卡片名稱或使用篩選器</div>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '24px'
  },
  header: {
    textAlign: 'center' as const,
    marginBottom: '32px'
  },
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#2c3e50',
    margin: '0 0 8px 0'
  },
  subtitle: {
    fontSize: '16px',
    color: '#7f8c8d',
    margin: '0'
  },
  searchSection: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '24px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    gap: '16px',
    alignItems: 'center'
  },
  searchBar: {
    flex: 1,
    display: 'flex',
    gap: '8px'
  },
  searchInput: {
    flex: 1,
    padding: '12px 16px',
    border: '1px solid #e1e8ed',
    borderRadius: '8px',
    fontSize: '16px',
    backgroundColor: '#ffffff'
  },
  searchButton: {
    padding: '12px 16px',
    backgroundColor: '#3498db',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px'
  },
  filterToggle: {
    padding: '12px 16px',
    backgroundColor: '#f8f9fa',
    color: '#2c3e50',
    border: '1px solid #e1e8ed',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px'
  },
  filtersSection: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '24px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
  },
  filtersGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    marginBottom: '16px'
  },
  filterGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px'
  },
  filterLabel: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#2c3e50'
  },
  filterSelect: {
    padding: '8px 12px',
    border: '1px solid #e1e8ed',
    borderRadius: '6px',
    backgroundColor: '#ffffff',
    fontSize: '14px'
  },
  priceRange: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  priceInput: {
    flex: 1,
    padding: '8px 12px',
    border: '1px solid #e1e8ed',
    borderRadius: '6px',
    fontSize: '14px'
  },
  priceSeparator: {
    color: '#7f8c8d'
  },
  sortControls: {
    display: 'flex',
    gap: '8px'
  },
  sortSelect: {
    flex: 1,
    padding: '8px 12px',
    border: '1px solid #e1e8ed',
    borderRadius: '6px',
    backgroundColor: '#ffffff',
    fontSize: '14px'
  },
  sortButton: {
    padding: '8px 12px',
    backgroundColor: '#f8f9fa',
    border: '1px solid #e1e8ed',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px'
  },
  filterActions: {
    display: 'flex',
    justifyContent: 'flex-end'
  },
  clearButton: {
    padding: '8px 16px',
    backgroundColor: '#e74c3c',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px'
  },
  resultsSection: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
  },
  resultsHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px'
  },
  resultsTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#2c3e50',
    margin: '0'
  },
  resultsCount: {
    fontSize: '14px',
    color: '#7f8c8d'
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    padding: '60px 20px'
  },
  loadingSpinner: {
    width: '40px',
    height: '40px',
    border: '3px solid #f3f3f3',
    borderTop: '3px solid #3498db',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '16px'
  },
  loadingText: {
    fontSize: '16px',
    color: '#7f8c8d'
  },
  noResults: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    padding: '60px 20px'
  },
  noResultsIcon: {
    fontSize: '48px',
    marginBottom: '16px'
  },
  noResultsText: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: '8px'
  },
  noResultsSubtext: {
    fontSize: '14px',
    color: '#7f8c8d'
  },
  initialState: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    padding: '60px 20px'
  },
  initialIcon: {
    fontSize: '48px',
    marginBottom: '16px'
  },
  initialText: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: '8px'
  },
  initialSubtext: {
    fontSize: '14px',
    color: '#7f8c8d'
  }
};

export default SearchScreen;
