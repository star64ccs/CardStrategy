// 響應式導航組件

import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { useDesignSystem } from '../../hooks/useDesignSystem';
import { useResponsive } from '../../hooks/useResponsive';
import type {
  ResponsiveNavigationItem,
  ResponsiveNavigationProps,
} from '../../types/responsive';

import { Button } from './Button';

export const ResponsiveNavigation: React.FC<ResponsiveNavigationProps> = ({
  mode = 'horizontal',
  theme = 'light',
  selectedKeys = [],
  defaultSelectedKeys = [],
  openKeys = [],
  defaultOpenKeys = [],
  items,
  collapsed,
  collapsedWidth = 80,
  trigger,
  onSelect,
  onOpenChange,
  onCollapse,
  className = '',
  style = {},
  'data-testid': dataTestId,
}) => {
  const { getResponsiveValue } = useResponsive();
  const { currentTheme, currentThemeData } = useDesignSystem();

  const [internalSelectedKeys, setInternalSelectedKeys] = useState<string[]>(
    selectedKeys.length > 0 ? selectedKeys : defaultSelectedKeys
  );
  const [internalOpenKeys, setInternalOpenKeys] = useState<string[]>(
    openKeys.length > 0 ? openKeys : defaultOpenKeys
  );
  const [internalCollapsed, setInternalCollapsed] = useState<boolean>(
    getResponsiveValue(collapsed) || false
  );
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // 響應式處理
  const _responsiveMode = useMemo(
    () => getResponsiveValue(mode),
    [mode, getResponsiveValue]
  );

  const _responsiveTheme = useMemo(
    () => getResponsiveValue(theme),
    [theme, getResponsiveValue]
  );

  const _responsiveCollapsed = useMemo(
    () => getResponsiveValue(collapsed),
    [collapsed, getResponsiveValue]
  );

  const _responsiveCollapsedWidth = useMemo(
    () => getResponsiveValue(collapsedWidth),
    [collapsedWidth, getResponsiveValue]
  );

  // 響應式項目過濾
  const _visibleItems = useMemo(() => {
    const _currentBreakpoint = 'md'; // 默認值

    return items.filter(item => {
      const _responsive = getResponsiveValue(item.responsive);
      const _priority = getResponsiveValue(item.priority);

      // 如果明確設置為不響應式，則顯示
      if (responsive === false) return true;

      // 如果設置了響應式，檢查當前斷點是否支持
      if (responsive === true) {
        // 根據優先級決定是否顯示
        if (priority !== undefined) {
          const breakpointPriority: Record<string, number> = {
            xs: 1,
            sm: 2,
            md: 3,
            lg: 4,
            xl: 5,
            xxl: 6,
          };
          return breakpointPriority[currentBreakpoint] >= priority;
        }
        return true;
      }

      return true;
    });
  }, [items, getResponsiveValue]);

  // 同步外部狀態
  useEffect(() => {
    if (selectedKeys.length > 0) {
      setInternalSelectedKeys(selectedKeys);
    }
  }, [selectedKeys]);

  useEffect(() => {
    if (openKeys.length > 0) {
      setInternalOpenKeys(openKeys);
    }
  }, [openKeys]);

  useEffect(() => {
    const _newCollapsed = getResponsiveValue(collapsed);
    if (newCollapsed !== undefined) {
      setInternalCollapsed(newCollapsed);
    }
  }, [collapsed, getResponsiveValue]);

  // 選擇處理
  const _handleSelect = useCallback(
    (key: string) => {
      const _newSelectedKeys = [key];
      setInternalSelectedKeys(newSelectedKeys);
      onSelect?.(newSelectedKeys);

      // 移動端選擇後關閉菜單
      if (responsiveMode === 'horizontal' && 'xs' === 'xs') {
        setMobileMenuOpen(false);
      }
    },
    [onSelect, responsiveMode]
  );

  // 展開/收起處理
  const _handleOpenChange = useCallback(
    (key: string) => {
      const _newOpenKeys = internalOpenKeys.includes(key)
        ? internalOpenKeys.filter(k => k !== key)
        : [...internalOpenKeys, key];

      setInternalOpenKeys(newOpenKeys);
      onOpenChange?.(newOpenKeys);
    },
    [internalOpenKeys, onOpenChange]
  );

  // 折疊處理
  const _handleCollapse = useCallback(() => {
    const _newCollapsed = !internalCollapsed;
    setInternalCollapsed(newCollapsed);
    onCollapse?.(newCollapsed);
  }, [internalCollapsed, onCollapse]);

  // 移動端菜單切換
  const _handleMobileMenuToggle = useCallback(() => {
    setMobileMenuOpen(prev => !prev);
  }, []);

  // 導航樣式
  const _navigationStyle = useMemo(() => {
    const _isDark = responsiveTheme === 'dark';
    const _isVertical = responsiveMode === 'vertical';
    const _isInline = responsiveMode === 'inline';

    const baseStyle: React.CSSProperties = {
      backgroundColor: isDark
        ? currentThemeData?.colors?.background?.secondary || '#1a1a1a'
        : currentThemeData?.colors?.background?.primary || '#ffffff',
      color: isDark
        ? currentThemeData?.colors?.text?.inverse || '#ffffff'
        : currentThemeData?.colors?.text?.primary || '#000000',
      borderRadius: currentThemeData?.borderRadius?.md || '8px',
      boxShadow: currentThemeData?.shadow?.sm || '0 1px 3px rgba(0, 0, 0, 0.1)',
      transition: 'all 0.3s ease',
      ...style,
    };

    // 佈局樣式
    if (isVertical) {
      baseStyle.display = 'flex';
      baseStyle.flexDirection = 'column';
      baseStyle.width = internalCollapsed
        ? `${responsiveCollapsedWidth}px`
        : '200px';
      baseStyle.height = '100vh';
      baseStyle.position = 'fixed';
      baseStyle.left = 0;
      baseStyle.top = 0;
      baseStyle.zIndex = 1000;
    } else if (isInline) {
      baseStyle.display = 'flex';
      baseStyle.alignItems = 'center';
      baseStyle.gap = '16px';
      baseStyle.padding = '8px 16px';
    } else {
      // horizontal
      baseStyle.display = 'flex';
      baseStyle.alignItems = 'center';
      baseStyle.justifyContent = 'space-between';
      baseStyle.padding = '0 16px';
      baseStyle.height = '64px';
    }

    return baseStyle;
  }, [
    responsiveTheme,
    responsiveMode,
    internalCollapsed,
    responsiveCollapsedWidth,
    currentTheme,
    style,
    currentThemeData,
  ]);

  // 渲染導航項目
  const _renderNavItem = (item: ResponsiveNavigationItem, level = 0) => {
    const _isSelected = internalSelectedKeys.includes(item.key);
    const _isOpen = internalOpenKeys.includes(item.key);
    const _hasChildren = item.children && item.children.length > 0;
    const _isCollapsed = internalCollapsed && level === 0;

    const itemStyle: React.CSSProperties = {
      display: 'flex',
      alignItems: 'center',
      justifyContent: isCollapsed ? 'center' : 'space-between',
      padding: isCollapsed ? '12px 8px' : '12px 16px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      borderRadius: currentThemeData?.borderRadius?.sm || '4px',
      backgroundColor: isSelected
        ? currentThemeData?.colors?.brand?.primary || '#007bff'
        : 'transparent',
      color: isSelected
        ? currentThemeData?.colors?.brand?.primary || '#007bff'
        : currentThemeData?.colors?.text?.primary || '#000000',
      marginBottom: level > 0 ? '4px' : '0',
      marginLeft: level > 0 ? `${level * 16}px` : '0',
      fontSize: level > 0 ? '14px' : '16px',
      fontWeight: isSelected ? '600' : '400',
    };

    const _handleClick = () => {
      if (hasChildren) {
        handleOpenChange(item.key);
      } else {
        handleSelect(item.key);
      }
    };

    return (
      <div key={item.key}>
        <div
          style={itemStyle}
          onClick={handleClick}
          onMouseEnter={e => {
            if (!isSelected) {
              e.currentTarget.style.backgroundColor =
                currentThemeData?.colors?.background?.secondary || '#f8f9fa';
            }
          }}
          onMouseLeave={e => {
            if (!isSelected) {
              e.currentTarget.style.backgroundColor = 'transparent';
            }
          }}
          className={`nav-item ${isSelected ? 'nav-item-selected' : ''} ${item.disabled ? 'nav-item-disabled' : ''}`}
        >
          {item.icon && (
            <span
              style={{
                marginRight: isCollapsed ? '0' : '8px',
                fontSize: '18px',
              }}
            >
              {item.icon}
            </span>
          )}

          {!isCollapsed && <span style={{ flex: 1 }}>{item.label}</span>}

          {hasChildren && !isCollapsed && (
            <span
              style={{
                transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s ease',
              }}
            >
              ▼
            </span>
          )}
        </div>

        {hasChildren && isOpen && !isCollapsed && (
          <div style={{ marginTop: '4px' }}>
            {item.children.map(child => renderNavItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  // 渲染移動端菜單按鈕
  const _renderMobileMenuButton = () => {
    if (responsiveMode !== 'horizontal' || 'xs' !== 'xs') {
      return null;
    }

    return (
      <Button
        variant='ghost'
        size='small'
        onClick={handleMobileMenuToggle}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '40px',
          height: '40px',
          padding: '0',
        }}
      >
        {mobileMenuOpen ? '✕' : '☰'}
      </Button>
    );
  };

  // 渲染折疊觸發器
  const _renderCollapseTrigger = () => {
    if (responsiveMode !== 'vertical') return null;

    return (
      <div
        style={{
          position: 'absolute',
          right: '-12px',
          top: '50%',
          transform: 'translateY(-50%)',
          width: '24px',
          height: '24px',
          backgroundColor:
            currentThemeData?.colors?.background?.primary || '#ffffff',
          border: `1px solid ${currentThemeData?.colors?.border?.primary || '#dee2e6'}`,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow:
            currentThemeData?.shadow?.sm || '0 1px 3px rgba(0, 0, 0, 0.1)',
          zIndex: 1001,
        }}
        onClick={handleCollapse}
      >
        {trigger || (internalCollapsed ? '→' : '←')}
      </div>
    );
  };

  // 渲染移動端菜單
  const _renderMobileMenu = () => {
    if (responsiveMode !== 'horizontal' || 'xs' !== 'xs' || !mobileMenuOpen) {
      return null;
    }

    return (
      <div
        style={{
          position: 'fixed',
          top: '64px',
          left: 0,
          right: 0,
          backgroundColor:
            currentThemeData?.colors?.background?.primary || '#ffffff',
          borderTop: `1px solid ${currentThemeData?.colors?.border?.primary || '#dee2e6'}`,
          boxShadow:
            currentThemeData?.shadow?.lg ||
            '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
          zIndex: 999,
          maxHeight: 'calc(100vh - 64px)',
          overflowY: 'auto',
        }}
      >
        {visibleItems.map(item => renderNavItem(item))}
      </div>
    );
  };

  return (
    <>
      <nav
        className={`responsive-navigation responsive-navigation-${responsiveMode} ${className}`}
        style={navigationStyle}
        data-testid={dataTestId}
      >
        {/* 桌面端導航項目 */}
        {responsiveMode === 'horizontal' && 'xs' !== 'xs' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {visibleItems.map(item => renderNavItem(item))}
          </div>
        )}

        {/* 移動端菜單按鈕 */}
        {renderMobileMenuButton()}

        {/* 垂直導航項目 */}
        {responsiveMode === 'vertical' && (
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px 0' }}>
            {visibleItems.map(item => renderNavItem(item))}
          </div>
        )}

        {/* 折疊觸發器 */}
        {renderCollapseTrigger()}
      </nav>

      {/* 移動端菜單 */}
      {renderMobileMenu()}

      {/* 移動端遮罩 */}
      {mobileMenuOpen && responsiveMode === 'horizontal' && 'xs' === 'xs' && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 998,
          }}
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </>
  );
};
