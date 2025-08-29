// 主題切換器組件
import React, { useState } from 'react';

import type { ThemeType } from '../../types/designSystem';
import { useDesignSystem } from '../providers/DesignSystemProvider';

// 主題切換器屬性
interface ThemeSwitcherProps {
  className?: string;
  showLabels?: boolean;
  size?: 'small' | 'medium' | 'large';
  variant?: 'button' | 'dropdown' | 'toggle';
}

// 主題選項
const themeOptions: { value: ThemeType; label: string; icon: string }[] = [
  { value: 'light', label: '淺色主題', icon: '☀️' },
  { value: 'dark', label: '深色主題', icon: '🌙' },
  { value: 'highContrast', label: '高對比度', icon: '🔍' },
];

// 主題切換器組件
export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({
  className = '',
  showLabels = true,
  size = 'medium',
  variant = 'button',
}) => {
  const { currentTheme, setTheme, themes } = useDesignSystem();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // 獲取當前主題的樣式
  const _currentThemeData = themes[currentTheme];
  const _currentOption = themeOptions.find(
    option => option.value === currentTheme
  );

  // 處理主題切換
  const _handleThemeChange = (theme: ThemeType) => {
    setTheme(theme);
    setIsDropdownOpen(false);
  };

  // 切換下拉選單
  const _toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // 按鈕變體
  if (variant === 'button') {
    return (
      <div className={`theme-switcher theme-switcher--${size} ${className}`}>
        {themeOptions.map(option => (
          <button
            key={option.value}
            onClick={() => handleThemeChange(option.value)}
            className={`theme-switcher__button ${
              currentTheme === option.value
                ? 'theme-switcher__button--active'
                : ''
            }`}
            aria-label={`切換到${option.label}`}
            style={{
              backgroundColor:
                currentTheme === option.value
                  ? currentThemeData?.colors?.brand?.primary || '#007AFF'
                  : 'transparent',
              color:
                currentTheme === option.value
                  ? '#FFFFFF'
                  : currentThemeData?.colors?.text?.primary || '#333333',
              border: `1px solid ${currentThemeData?.colors?.border?.primary || '#E0E0E0'}`,
              borderRadius: currentThemeData?.borderRadius?.md || '8px',
              padding:
                size === 'small'
                  ? '8px 12px'
                  : size === 'large'
                    ? '16px 24px'
                    : '12px 16px',
              fontSize:
                size === 'small' ? '14px' : size === 'large' ? '18px' : '16px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              margin: '0 4px',
            }}
          >
            <span className='theme-switcher__icon'>{option.icon}</span>
            {showLabels && (
              <span className='theme-switcher__label'>{option.label}</span>
            )}
          </button>
        ))}
      </div>
    );
  }

  // 下拉選單變體
  if (variant === 'dropdown') {
    return (
      <div className={`theme-switcher theme-switcher--dropdown ${className}`}>
        <button
          onClick={toggleDropdown}
          className='theme-switcher__dropdown-button'
          aria-label='選擇主題'
          aria-expanded={isDropdownOpen}
          style={{
            backgroundColor:
              currentThemeData?.colors?.background?.primary || '#FFFFFF',
            color: currentThemeData?.colors?.text?.primary || '#000000',
            border: `1px solid ${currentThemeData?.colors?.border?.primary || '#E0E0E0'}`,
            borderRadius: currentThemeData?.borderRadius?.md || '8px',
            padding:
              size === 'small'
                ? '8px 12px'
                : size === 'large'
                  ? '16px 24px'
                  : '12px 16px',
            fontSize:
              size === 'small' ? '14px' : size === 'large' ? '18px' : '16px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            minWidth: '120px',
          }}
        >
          <span className='theme-switcher__icon'>{currentOption?.icon}</span>
          {showLabels && (
            <span className='theme-switcher__label'>
              {currentOption?.label}
            </span>
          )}
          <span className='theme-switcher__arrow'>▼</span>
        </button>

        {isDropdownOpen && (
          <div
            className='theme-switcher__dropdown-menu'
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              backgroundColor:
                currentThemeData?.colors?.background?.primary || '#FFFFFF',
              border: `1px solid ${currentThemeData?.colors?.border?.primary || '#E0E0E0'}`,
              borderRadius: currentThemeData?.borderRadius?.md || '8px',
              boxShadow:
                currentThemeData?.shadow?.md || '0 4px 6px rgba(0, 0, 0, 0.1)',
              zIndex: 1000,
              marginTop: '4px',
            }}
          >
            {themeOptions.map(option => (
              <button
                key={option.value}
                onClick={() => handleThemeChange(option.value)}
                className={`theme-switcher__dropdown-item ${
                  currentTheme === option.value
                    ? 'theme-switcher__dropdown-item--active'
                    : ''
                }`}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  textAlign: 'left',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: currentThemeData?.colors?.text?.primary || '#000000',
                  fontSize: '14px',
                  transition: 'background-color 0.2s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.backgroundColor =
                    currentThemeData?.colors?.background?.secondary ||
                    '#F5F5F5';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <span className='theme-switcher__icon'>{option.icon}</span>
                <span className='theme-switcher__label'>{option.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // 切換變體
  if (variant === 'toggle') {
    const _nextTheme = currentTheme === 'light' ? 'dark' : 'light';
    const _nextOption = themeOptions.find(option => option.value === nextTheme);

    return (
      <button
        onClick={() => handleThemeChange(nextTheme)}
        className={`theme-switcher theme-switcher--toggle theme-switcher--${size} ${className}`}
        aria-label={`切換到${nextOption?.label}`}
        style={{
          backgroundColor:
            currentThemeData?.colors?.background?.secondary || '#F5F5F5',
          color: currentThemeData?.colors?.text?.primary || '#000000',
          border: `1px solid ${currentThemeData?.colors?.border?.primary || '#E0E0E0'}`,
          borderRadius: currentThemeData?.borderRadius?.lg || '24px',
          padding:
            size === 'small' ? '8px' : size === 'large' ? '16px' : '12px',
          fontSize:
            size === 'small' ? '16px' : size === 'large' ? '24px' : '20px',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minWidth:
            size === 'small' ? '40px' : size === 'large' ? '64px' : '48px',
          minHeight:
            size === 'small' ? '40px' : size === 'large' ? '64px' : '48px',
        }}
      >
        <span className='theme-switcher__icon'>{nextOption?.icon}</span>
      </button>
    );
  }

  return null;
};

// 導出組件
export default ThemeSwitcher;
