import React from 'react';
import { CardFilters as FiltersType } from '../types';

interface CardFiltersProps {
  filters: FiltersType;
  onFiltersChange: (filters: FiltersType) => void;
  onClearFilters: () => void;
}

const CardFilters: React.FC<CardFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
}) => {
  const handleFilterChange = (key: keyof FiltersType, value: any) => {
    const newFilters = { ...filters, [key]: value };
    onFiltersChange(newFilters);
  };

  const hasActiveFilters = Object.values(filters).some(
    (value) => value !== undefined && value !== ''
  );

  return (
    <div className="card-filters">
      <div className="filters-header">
        <h3>篩選條件</h3>
        {hasActiveFilters && (
          <button onClick={onClearFilters} className="clear-filters-btn">
            清除全部
          </button>
        )}
      </div>

      <div className="filters-content">
        <div className="filter-row">
          <div className="filter-item">
            <label>遊戲</label>
            <select
              value={filters.game || ''}
              onChange={(e) =>
                handleFilterChange('game', e.target.value || undefined)
              }
            >
              <option value="">全部遊戲</option>
              <option value="Pokemon TCG">Pokemon TCG</option>
              <option value="Yu-Gi-Oh!">Yu-Gi-Oh!</option>
              <option value="Magic: The Gathering">Magic: The Gathering</option>
              <option value="ONE PIECE TCG">ONE PIECE TCG</option>
            </select>
          </div>

          <div className="filter-item">
            <label>系列</label>
            <input
              type="text"
              placeholder="輸入系列名稱"
              value={filters.setName || ''}
              onChange={(e) =>
                handleFilterChange('setName', e.target.value || undefined)
              }
            />
          </div>
        </div>

        <div className="filter-row">
          <div className="filter-item">
            <label>稀有度</label>
            <select
              value={filters.rarity || ''}
              onChange={(e) =>
                handleFilterChange('rarity', e.target.value || undefined)
              }
            >
              <option value="">全部稀有度</option>
              <option value="普通">普通</option>
              <option value="非普通">非普通</option>
              <option value="稀有">稀有</option>
              <option value="超稀有">超稀有</option>
              <option value="傳說">傳說</option>
            </select>
          </div>

          <div className="filter-item">
            <label>類型</label>
            <select
              value={filters.type || ''}
              onChange={(e) =>
                handleFilterChange('type', e.target.value || undefined)
              }
            >
              <option value="">全部類型</option>
              <option value="基本">基本</option>
              <option value="進化">進化</option>
              <option value="道具">道具</option>
              <option value="能量">能量</option>
            </select>
          </div>
        </div>

        <div className="filter-row">
          <div className="filter-item">
            <label>狀態</label>
            <select
              value={filters.condition || ''}
              onChange={(e) =>
                handleFilterChange('condition', e.target.value || undefined)
              }
            >
              <option value="">全部狀態</option>
              <option value="全新">全新</option>
              <option value="近全新">近全新</option>
              <option value="良好">良好</option>
              <option value="一般">一般</option>
              <option value="較差">較差</option>
            </select>
          </div>

          <div className="filter-item">
            <label>語言</label>
            <select
              value={filters.language || ''}
              onChange={(e) =>
                handleFilterChange('language', e.target.value || undefined)
              }
            >
              <option value="">全部語言</option>
              <option value="繁體中文">繁體中文</option>
              <option value="英文">英文</option>
              <option value="日文">日文</option>
            </select>
          </div>
        </div>

        <div className="filter-row">
          <div className="filter-item">
            <label>價格範圍</label>
            <div className="price-inputs">
              <input
                type="number"
                placeholder="最低價"
                value={filters.priceMin || ''}
                onChange={(e) =>
                  handleFilterChange(
                    'priceMin',
                    e.target.value ? Number(e.target.value) : undefined
                  )
                }
              />
              <span className="price-separator">-</span>
              <input
                type="number"
                placeholder="最高價"
                value={filters.priceMax || ''}
                onChange={(e) =>
                  handleFilterChange(
                    'priceMax',
                    e.target.value ? Number(e.target.value) : undefined
                  )
                }
              />
            </div>
          </div>
        </div>
      </div>

      {hasActiveFilters && (
        <div className="active-filters">
          <h4>已啟用的篩選條件:</h4>
          <div className="active-filter-tags">
            {filters.game && (
              <span className="filter-tag">
                遊戲: {filters.game}
                <button onClick={() => handleFilterChange('game', undefined)}>
                  ×
                </button>
              </span>
            )}
            {filters.setName && (
              <span className="filter-tag">
                系列: {filters.setName}
                <button
                  onClick={() => handleFilterChange('setName', undefined)}
                >
                  ×
                </button>
              </span>
            )}
            {filters.rarity && (
              <span className="filter-tag">
                稀有度: {filters.rarity}
                <button onClick={() => handleFilterChange('rarity', undefined)}>
                  ×
                </button>
              </span>
            )}
            {filters.type && (
              <span className="filter-tag">
                類型: {filters.type}
                <button onClick={() => handleFilterChange('type', undefined)}>
                  ×
                </button>
              </span>
            )}
            {filters.condition && (
              <span className="filter-tag">
                狀態: {filters.condition}
                <button
                  onClick={() => handleFilterChange('condition', undefined)}
                >
                  ×
                </button>
              </span>
            )}
            {filters.language && (
              <span className="filter-tag">
                語言: {filters.language}
                <button
                  onClick={() => handleFilterChange('language', undefined)}
                >
                  ×
                </button>
              </span>
            )}
            {(filters.priceMin !== undefined ||
              filters.priceMax !== undefined) && (
              <span className="filter-tag">
                價格: {filters.priceMin || 0} - {filters.priceMax || '∞'}
                <button
                  onClick={() => {
                    handleFilterChange('priceMin', undefined);
                    handleFilterChange('priceMax', undefined);
                  }}
                >
                  ×
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CardFilters;
