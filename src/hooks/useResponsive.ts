import { useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { layoutService } from '../services/layoutService';
import {
  selectCurrentBreakpoint,
  selectIsDesktop,
  selectIsLargeScreen,
  selectIsMobile,
  selectIsTablet,
  selectLayoutConfig,
  selectLayoutError,
  selectLayoutEvents,
  selectLayoutLoading,
  selectResponsiveState,
  selectWindowSize,
} from '../store/slices/layoutSlice';
import type {
  Breakpoint,
  ResponsiveEvent,
  ResponsiveState,
  ResponsiveValue,
} from '../types/layout';

// 響應式 Hook 返回值類型
export interface UseResponsiveReturn {
  // 響應式狀態
  responsive: ResponsiveState;
  currentBreakpoint: Breakpoint;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isLargeScreen: boolean;
  windowWidth: number;
  windowHeight: number;

  // 響應式工具方法
  getResponsiveValue: <T>(value: ResponsiveValue<T>) => T;
  isBreakpoint: (breakpoint: Breakpoint) => boolean;
  isAboveBreakpoint: (breakpoint: Breakpoint) => boolean;
  isBelowBreakpoint: (breakpoint: Breakpoint) => boolean;

  // 事件監聽
  onBreakpointChange: (
    callback: (event: ResponsiveEvent) => void
  ) => () => void;
  onResize: (callback: (event: ResponsiveEvent) => void) => () => void;

  // 配置和狀態
  config: unknown;
  isLoading: boolean;
  error: string | null;
  events: ResponsiveEvent[];

  // 工具方法
  getBreakpointConfig: () => any;
  getResponsiveState: () => ResponsiveState;
}

// 響應式 Hook
export const _useResponsive = (): UseResponsiveReturn => {
  const _dispatch = useDispatch();

  // 從 Redux 獲取狀態
  const _responsive = useSelector(selectResponsiveState);
  const _currentBreakpoint = useSelector(selectCurrentBreakpoint);
  const _isMobile = useSelector(selectIsMobile);
  const _isTablet = useSelector(selectIsTablet);
  const _isDesktop = useSelector(selectIsDesktop);
  const _isLargeScreen = useSelector(selectIsLargeScreen);
  const _windowSize = useSelector(selectWindowSize);
  const _config = useSelector(selectLayoutConfig);
  const _isLoading = useSelector(selectLayoutLoading);
  const _error = useSelector(selectLayoutError);
  const _events = useSelector(selectLayoutEvents);

  // 響應式值獲取
  const _getResponsiveValue = useCallback(<T>(value: ResponsiveValue<T>): T => {
    return layoutService.getResponsiveValue(value);
  }, []);

  // 斷點檢查方法
  const _isBreakpoint = useCallback((breakpoint: Breakpoint): boolean => {
    return layoutService.isBreakpoint(breakpoint);
  }, []);

  const _isAboveBreakpoint = useCallback((breakpoint: Breakpoint): boolean => {
    return layoutService.isAboveBreakpoint(breakpoint);
  }, []);

  const _isBelowBreakpoint = useCallback((breakpoint: Breakpoint): boolean => {
    return layoutService.isBelowBreakpoint(breakpoint);
  }, []);

  // 事件監聽方法
  const _onBreakpointChange = useCallback(
    (callback: (event: ResponsiveEvent) => void) => {
      return layoutService.onBreakpointChange(callback);
    },
    []
  );

  const _onResize = useCallback((callback: (event: ResponsiveEvent) => void) => {
    return layoutService.onResize(callback);
  }, []);

  // 配置和狀態獲取
  const _getBreakpointConfig = useCallback(() => {
    return layoutService.getBreakpointConfig();
  }, []);

  const _getResponsiveState = useCallback(() => {
    return layoutService.getResponsiveState();
  }, []);

  // 計算屬性
  const _windowWidth = useMemo(() => windowSize.width, [windowSize.width]);
  const _windowHeight = useMemo(() => windowSize.height, [windowSize.height]);

  return {
    // 響應式狀態
    responsive,
    currentBreakpoint,
    isMobile,
    isTablet,
    isDesktop,
    isLargeScreen,
    windowWidth,
    windowHeight,

    // 響應式工具方法
    getResponsiveValue,
    isBreakpoint,
    isAboveBreakpoint,
    isBelowBreakpoint,

    // 事件監聽
    onBreakpointChange,
    onResize,

    // 配置和狀態
    config,
    isLoading,
    error,
    events: events as any,

    // 工具方法
    getBreakpointConfig,
    getResponsiveState,
  };
};

// 響應式斷點 Hook
export const _useBreakpoint = (breakpoint: Breakpoint) => {
  const { isBreakpoint, isAboveBreakpoint, isBelowBreakpoint } =
    useResponsive();

  return useMemo(
    () => ({
      isCurrent: isBreakpoint(breakpoint),
      isAbove: isAboveBreakpoint(breakpoint),
      isBelow: isBelowBreakpoint(breakpoint),
    }),
    [breakpoint, isBreakpoint, isAboveBreakpoint, isBelowBreakpoint]
  );
};

// 響應式值 Hook
export const _useResponsiveValue = <T>(value: ResponsiveValue<T>) => {
  const { getResponsiveValue } = useResponsive();

  return useMemo(() => getResponsiveValue(value), [value, getResponsiveValue]);
};

// 設備類型 Hook
export const _useDeviceType = () => {
  const { isMobile, isTablet, isDesktop, isLargeScreen } = useResponsive();

  return useMemo(() => {
    if (isMobile) return 'mobile';
    if (isTablet) return 'tablet';
    if (isLargeScreen) return 'large-screen';
    return 'desktop';
  }, [isMobile, isTablet, isDesktop, isLargeScreen]);
};

// 響應式條件 Hook
export const _useResponsiveCondition = (condition: ResponsiveValue<boolean>) => {
  const { getResponsiveValue } = useResponsive();

  return useMemo(
    () => getResponsiveValue(condition),
    [condition, getResponsiveValue]
  );
};

// 響應式樣式 Hook
export const _useResponsiveStyle = (
  styles: ResponsiveValue<React.CSSProperties>
) => {
  const { getResponsiveValue } = useResponsive();

  return useMemo(
    () => getResponsiveValue(styles),
    [styles, getResponsiveValue]
  );
};

// 響應式類名 Hook
export const _useResponsiveClassName = (classNames: ResponsiveValue<string>) => {
  const { getResponsiveValue } = useResponsive();

  return useMemo(
    () => getResponsiveValue(classNames),
    [classNames, getResponsiveValue]
  );
};
