import React, { useState, useEffect } from 'react';
import { CardFilters } from '../types';

interface CardSearchProps {
  onSearch?: (query: string) => void;
  onFiltersChange?: (filters: CardFilters) => void;
  filters?: CardFilters;
}

const CardSearch: React.FC<CardSearchProps> = ({
  onSearch,
  onFiltersChange,
  filters = {}
}) => {
  const [searchQuery, setSearchQuery] = useState(filters.search || '');
  const [localFilters, setLocalFilters] = useState<CardFilters>(filters);

  useEffect(() => {
    setLocalFilters(filters);
    setSearchQuery(filters.search || '');
  }, [filters]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const newFilters = { ...localFilters, search: searchQuery };
    setLocalFilters(newFilters);
    onSearch?.(searchQuery);
    onFiltersChange?.(newFilters);
  };

  const handleFilterChange = (key: keyof CardFilters, value: any) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFiltersChange?.(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters: CardFilters = {};
    setLocalFilters(clearedFilters);
    setSearchQuery('');
    onFiltersChange?.(clearedFilters);
  };

  return (
    <div className="card-search">
      <form onSubmit={handleSearch} className="search-form">
        <div className="search-input-group">
          <input
            type="text"
            placeholder="搜尋卡片名稱或系列..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="search-button">
            搜尋
          </button>
        </div>
      </form>

      <div className="filters-section">
        <h3>篩選條件</h3>

        <div className="filters-grid">
          <div className="filter-group">
            <label>遊戲</label>
            <select
              value={localFilters.game || ''}
              onChange={(e) => handleFilterChange('game', e.target.value || undefined)}
            >
              <option value="">全部遊戲</option>
              <option value="Pokemon TCG">Pokemon TCG</option>
              <option value="Yu-Gi-Oh!">Yu-Gi-Oh!</option>
              <option value="Magic: The Gathering">Magic: The Gathering</option>
              <option value="ONE PIECE TCG">ONE PIECE TCG</option>
            </select>
          </div>

          <div className="filter-group">
            <label>稀有度</label>
            <select
              value={localFilters.rarity || ''}
              onChange={(e) => handleFilterChange('rarity', e.target.value || undefined)}
            >
              <option value="">全部稀有度</option>
              <option value="普通">普通</option>
              <option value="非普通">非普通</option>
              <option value="稀有">稀有</option>
              <option value="超稀有">超稀有</option>
              <option value="傳說">傳說</option>
            </select>
          </div>

          <div className="filter-group">
            <label>類型</label>
            <select
              value={localFilters.type || ''}
              onChange={(e) => handleFilterChange('type', e.target.value || undefined)}
            >
              <option value="">全部類型</option>
              <option value="基本">基本</option>
              <option value="進化">進化</option>
              <option value="道具">道具</option>
              <option value="能量">能量</option>
            </select>
          </div>

          <div className="filter-group">
            <label>狀態</label>
            <select
              value={localFilters.condition || ''}
              onChange={(e) => handleFilterChange('condition', e.target.value || undefined)}
            >
              <option value="">全部狀態</option>
              <option value="全新">全新</option>
              <option value="近全新">近全新</option>
              <option value="良好">良好</option>
              <option value="一般">一般</option>
              <option value="較差">較差</option>
            </select>
          </div>

          <div className="filter-group">
            <label>語言</label>
            <select
              value={localFilters.language || ''}
              onChange={(e) => handleFilterChange('language', e.target.value || undefined)}
            >
              <option value="">全部語言</option>
              <option value="繁體中文">繁體中文</option>
              <option value="英文">英文</option>
              <option value="日文">日文</option>
            </select>
          </div>

          <div className="filter-group">
            <label>價格範圍</label>
            <div className="price-range">
              <input
                type="number"
                placeholder="最低價"
                value={localFilters.priceMin || ''}
                onChange={(e) => handleFilterChange('priceMin', e.target.value ? Number(e.target.value) : undefined)}
                className="price-input"
              />
              <span>-</span>
              <input
                type="number"
                placeholder="最高價"
                value={localFilters.priceMax || ''}
                onChange={(e) => handleFilterChange('priceMax', e.target.value ? Number(e.target.value) : undefined)}
                className="price-input"
              />
            </div>
          </div>
        </div>

        <div className="filter-actions">
          <button
            type="button"
            onClick={clearFilters}
            className="btn btn-outline"
          >
            清除篩選
          </button>
        </div>
      </div>
    </div>
  );
};

export default CardSearch;
