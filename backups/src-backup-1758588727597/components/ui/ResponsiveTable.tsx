// 響應式表格組件

import React, { useCallback, useMemo, useState } from 'react';

import { useDesignSystem } from '../../hooks/useDesignSystem';
import { useResponsive } from '../../hooks/useResponsive';
import type { ResponsiveTableProps } from '../../types/responsive';

import { Button } from './Button';
import { Input } from './Input';

export const ResponsiveTable: React.FC<ResponsiveTableProps> = ({
  data,
  columns,
  sortable = false,
  pagination,
  searchable = false,
  selectable = false,
  responsive,
  className = '',
  style = {},
  'data-testid': dataTestId,
}) => {
  const { getResponsiveValue } = useResponsive();
  const { currentTheme, currentThemeData } = useDesignSystem();

  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc';
  } | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [currentPage, setCurrentPage] = useState<number>(
    pagination?.current || 1
  );
  const [pageSize, setPageSize] = useState<number>(
    getResponsiveValue(pagination?.pageSize || 10)
  );

  const breakpointPriority: Record<string, number> = {
    xs: 1,
    sm: 2,
    md: 3,
    lg: 4,
    xl: 5,
    xxl: 6,
  };

  const _shouldShowColumn = (breakpoint: string, priority: number): boolean => {
    const _currentBreakpoint = 'md'; // 默認值
    return breakpointPriority[currentBreakpoint] >= priority;
  };

  // 響應式列過濾
  const _visibleColumns = useMemo(() => {
    const _currentBreakpoint = getResponsiveValue('md');

    return columns.filter(column => {
      const _responsive = getResponsiveValue(column.responsive);
      const _priority = getResponsiveValue(column.priority);

      // 如果明確設置為不響應式，則顯示
      if (responsive === false) return true;

      // 如果設置了響應式，檢查當前斷點是否支持
      if (responsive === true) {
        // 根據優先級決定是否顯示
        if (priority !== undefined) {
          return breakpointPriority[currentBreakpoint] >= priority;
        }
        return true;
      }

      return true;
    });
  }, [columns, getResponsiveValue]);

  // 搜索過濾
  const _filteredData = useMemo(() => {
    if (!searchTerm) return data;

    return data.filter(row => {
      return visibleColumns.some(column => {
        const _value = row[column.dataIndex];
        if (value == null) return false;
        return String(value).toLowerCase().includes(searchTerm.toLowerCase());
      });
    });
  }, [data, searchTerm, visibleColumns]);

  // 排序
  const _sortedData = useMemo(() => {
    if (!sortConfig) return filteredData;

    return [...filteredData].sort((a, b) => {
      const _aValue = a[sortConfig.key];
      const _bValue = b[sortConfig.key];

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [filteredData, sortConfig]);

  // 分頁
  const _paginatedData = useMemo(() => {
    if (!pagination) return sortedData;

    const _startIndex = (currentPage - 1) * pageSize;
    const _endIndex = startIndex + pageSize;
    return sortedData.slice(startIndex, endIndex);
  }, [sortedData, currentPage, pageSize, pagination]);

  // 排序處理
  const _handleSort = useCallback(
    (key: string) => {
      if (!sortable) return;

      setSortConfig(prev => {
        if (prev?.key === key) {
          return {
            key,
            direction: prev.direction === 'asc' ? 'desc' : 'asc',
          };
        }
        return { key, direction: 'asc' };
      });
    },
    [sortable]
  );

  // 選擇處理
  const _handleSelectAll = useCallback(() => {
    if (selectedRows.size === paginatedData.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(paginatedData.map((_, index) => index)));
    }
  }, [selectedRows.size, paginatedData.length]);

  const _handleSelectRow = useCallback((index: number) => {
    setSelectedRows(prev => {
      const _newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  }, []);

  // 分頁處理
  const _handlePageChange = useCallback(
    (page: number) => {
      setCurrentPage(page);
      pagination?.onChange?.(page, pageSize);
    },
    [pageSize, pagination]
  );

  const _handlePageSizeChange = useCallback(
    (newPageSize: number) => {
      setPageSize(newPageSize);
      setCurrentPage(1);
      pagination?.onChange?.(1, newPageSize);
    },
    [pagination]
  );

  // 表格樣式
  const _tableStyle = useMemo(() => {
    const baseStyle: React.CSSProperties = {
      width: '100%',
      borderCollapse: 'collapse',
      backgroundColor:
        currentThemeData?.colors?.background?.primary || '#ffffff',
      borderRadius: currentThemeData?.borderRadius?.md || '8px',
      overflow: 'hidden',
      boxShadow: currentThemeData?.shadow?.sm || '0 1px 3px rgba(0, 0, 0, 0.1)',
      ...style,
    };

    // 響應式處理
    if (responsive?.scroll) {
      baseStyle.overflowX = 'auto';
      baseStyle.minWidth = '600px';
    }

    return baseStyle;
  }, [currentTheme, responsive, style]);

  // 渲染表頭
  const _renderHeader = () => (
    <thead>
      <tr>
        {selectable && (
          <th
            style={{
              padding: '12px',
              backgroundColor:
                currentThemeData?.colors?.background?.secondary || '#f8f9fa',
              borderBottom: `1px solid ${currentThemeData?.colors?.border?.primary || '#dee2e6'}`,
              textAlign: 'center',
              width: '50px',
            }}
          >
            <input
              type='checkbox'
              checked={
                selectedRows.size === paginatedData.length &&
                paginatedData.length > 0
              }
              onChange={handleSelectAll}
              style={{ cursor: 'pointer' }}
            />
          </th>
        )}
        {visibleColumns.map(column => (
          <th
            key={column.key}
            style={{
              padding: '12px',
              backgroundColor:
                currentThemeData?.colors?.background?.secondary || '#f8f9fa',
              borderBottom: `1px solid ${currentThemeData?.colors?.border?.primary || '#dee2e6'}`,
              textAlign: getResponsiveValue(column.align) || 'left',
              cursor: sortable ? 'pointer' : 'default',
              minWidth: getResponsiveValue(column.minWidth),
              maxWidth: getResponsiveValue(column.maxWidth),
              width: getResponsiveValue(column.width),
            }}
            onClick={() => handleSort(column.key)}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              {column.title}
              {sortable && sortConfig?.key === column.key && (
                <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
              )}
            </div>
          </th>
        ))}
      </tr>
    </thead>
  );

  // 渲染表格行
  const _renderRow = (row: unknown, rowIndex: number) => (
    <tr
      key={rowIndex}
      style={{
        backgroundColor: selectedRows.has(rowIndex)
          ? currentThemeData?.colors?.brand?.primary || '#007bff'
          : currentThemeData?.colors?.background?.primary || '#ffffff',
        borderBottom: `1px solid ${currentThemeData?.colors?.border?.primary || '#dee2e6'}`,
        transition: 'background-color 0.2s ease',
      }}
    >
      {selectable && (
        <td
          style={{
            padding: '12px',
            textAlign: 'center',
            borderBottom: `1px solid ${currentThemeData?.colors?.border?.primary || '#dee2e6'}`,
          }}
        >
          <input
            type='checkbox'
            checked={selectedRows.has(rowIndex)}
            onChange={() => handleSelectRow(rowIndex)}
            style={{ cursor: 'pointer' }}
          />
        </td>
      )}
      {visibleColumns.map(column => (
        <td
          key={column.key}
          style={{
            padding: '12px',
            textAlign: getResponsiveValue(column.align) || 'left',
            borderBottom: `1px solid ${currentThemeData?.colors?.border?.primary || '#dee2e6'}`,
            wordBreak: 'break-word',
          }}
        >
          {column.render
            ? column.render(row[column.dataIndex], row, rowIndex)
            : row[column.dataIndex]}
        </td>
      ))}
    </tr>
  );

  // 渲染分頁
  const _renderPagination = () => {
    if (!pagination) return null;

    const _totalPages = Math.ceil(filteredData.length / pageSize);
    const _startItem = (currentPage - 1) * pageSize + 1;
    const _endItem = Math.min(currentPage * pageSize, filteredData.length);

    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px',
          backgroundColor:
            currentThemeData?.colors?.background?.secondary || '#f8f9fa',
          borderTop: `1px solid ${currentThemeData?.colors?.border?.primary || '#dee2e6'}`,
        }}
      >
        <div
          style={{
            color: currentThemeData?.colors?.text?.secondary || '#666666',
          }}
        >
          {pagination.showTotal
            ? pagination.showTotal(filteredData.length, [startItem, endItem])
            : `顯示 ${startItem}-${endItem} 條，共 ${filteredData.length} 條`}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Button
            variant='outline'
            size='small'
            disabled={currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1)}
          >
            上一頁
          </Button>

          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const _page = i + 1;
            return (
              <Button
                key={page}
                variant={currentPage === page ? 'primary' : 'outline'}
                size='small'
                onClick={() => handlePageChange(page)}
              >
                {page}
              </Button>
            );
          })}

          <Button
            variant='outline'
            size='small'
            disabled={currentPage === totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
          >
            下一頁
          </Button>

          {pagination.showSizeChanger && (
            <select
              value={pageSize}
              onChange={e => handlePageSizeChange(Number(e.target.value))}
              style={{
                padding: '4px 8px',
                border: `1px solid ${currentThemeData?.colors?.border?.primary || '#dee2e6'}`,
                borderRadius: currentThemeData?.borderRadius?.sm || '4px',
                backgroundColor:
                  currentThemeData?.colors?.background?.primary || '#ffffff',
              }}
            >
              <option value={10}>10 條/頁</option>
              <option value={20}>20 條/頁</option>
              <option value={50}>50 條/頁</option>
            </select>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={`responsive-table ${className}`} data-testid={dataTestId}>
      {/* 搜索欄 */}
      {searchable && (
        <div
          style={{
            padding: '16px',
            backgroundColor:
              currentThemeData?.colors?.background?.secondary || '#f8f9fa',
            borderBottom: `1px solid ${currentThemeData?.colors?.border?.primary || '#dee2e6'}`,
          }}
        >
          <Input
            placeholder='搜索...'
            value={searchTerm}
            onChange={(value: string) => setSearchTerm(value)}
            style={{ maxWidth: '300px' }}
          />
        </div>
      )}

      {/* 表格 */}
      <div style={{ overflowX: 'auto' }}>
        <table style={tableStyle}>
          {renderHeader()}
          <tbody>
            {paginatedData.map((row, index) => renderRow(row, index))}
          </tbody>
        </table>
      </div>

      {/* 分頁 */}
      {renderPagination()}
    </div>
  );
};
