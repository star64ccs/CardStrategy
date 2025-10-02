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

// Response式 Hook ReturnValueClass型
export interface UseResponsiveReturn {
  // Response式Status
  responsive: ResponsiveState;
  currentBreakpoint: Breakpoint;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isLargeScreen: boolean;
  windowWidth: number;
  windowHeight: number;

  // Response式ToolMethod
  getResponsiveValue: <T>(value: ResponsiveValue<T>) => T;
  isBreakpoint: (breakpoint: Breakpoint) => boolean;
  isAboveBreakpoint: (breakpoint: Breakpoint) => boolean;
  isBelowBreakpoint: (breakpoint: Breakpoint) => boolean;

  // Event監聽
  onBreakpointChange: (
    callback: (event: ResponsiveEvent) => void
  ) => () => void;
  onResize: (callback: (event: ResponsiveEvent) => void) => () => void;

  // Configure和Status
  config: unknown;
  isLoading: boolean;
  error: string | null;
  events: ResponsiveEvent[];

  // ToolMethod
  getBreakpointConfig: () => any;
  getResponsiveState: () => ResponsiveState;
}

// Response式 Hook
export const _useResponsive = (): UseResponsiveReturn => {
  const _dispatch = useDispatch();

  // 從 Redux GetStatus
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

  // Response式ValueGet
  const _getResponsiveValue = useCallback(<T>(value: ResponsiveValue<T>): T => {
    return layoutService.getResponsiveValue(value);
  }, []);

  // 斷點CheckMethod
  const _isBreakpoint = useCallback((breakpoint: Breakpoint): boolean => {
    return layoutService.isBreakpoint(breakpoint);
  }, []);

  const _isAboveBreakpoint = useCallback((breakpoint: Breakpoint): boolean => {
    return layoutService.isAboveBreakpoint(breakpoint);
  }, []);

  const _isBelowBreakpoint = useCallback((breakpoint: Breakpoint): boolean => {
    return layoutService.isBelowBreakpoint(breakpoint);
  }, []);

  // Event監聽Method
  const _onBreakpointChange = useCallback(
    (callback: (event: ResponsiveEvent) => void) => {
      return layoutService.onBreakpointChange(callback);
    },
    []
  );

  const _onResize = useCallback(
    (callback: (event: ResponsiveEvent) => void) => {
      return layoutService.onResize(callback);
    },
    []
  );

  // Configure和StatusGet
  const _getBreakpointConfig = useCallback(() => {
    return layoutService.getBreakpointConfig();
  }, []);

  const _getResponsiveState = useCallback(() => {
    return layoutService.getResponsiveState();
  }, []);

  // 計算Property
  const _windowWidth = useMemo(() => windowSize.width, [windowSize.width]);
  const _windowHeight = useMemo(() => windowSize.height, [windowSize.height]);

  return {
    // Response式Status
    responsive,
    currentBreakpoint,
    isMobile,
    isTablet,
    isDesktop,
    isLargeScreen,
    windowWidth,
    windowHeight,

    // Response式ToolMethod
    getResponsiveValue,
    isBreakpoint,
    isAboveBreakpoint,
    isBelowBreakpoint,

    // Event監聽
    onBreakpointChange,
    onResize,

    // Configure和Status
    config,
    isLoading,
    error,
    events: events as any,

    // ToolMethod
    getBreakpointConfig,
    getResponsiveState,
  };
};

// Response式斷點 Hook
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

// Response式Value Hook
export const _useResponsiveValue = <T>(value: ResponsiveValue<T>) => {
  const { getResponsiveValue } = useResponsive();

  return useMemo(() => getResponsiveValue(value), [value, getResponsiveValue]);
};

// 設備Class型 Hook
export const _useDeviceType = () => {
  const { isMobile, isTablet, isDesktop, isLargeScreen } = useResponsive();

  return useMemo(() => {
    if (isMobile) return 'mobile';
    if (isTablet) return 'tablet';
    if (isLargeScreen) return 'large-screen';
    return 'desktop';
  }, [isMobile, isTablet, isDesktop, isLargeScreen]);
};

// Response式Condition Hook
export const _useResponsiveCondition = (
  condition: ResponsiveValue<boolean>
) => {
  const { getResponsiveValue } = useResponsive();

  return useMemo(
    () => getResponsiveValue(condition),
    [condition, getResponsiveValue]
  );
};

// Response式樣式 Hook
export const _useResponsiveStyle = (
  styles: ResponsiveValue<React.CSSProperties>
) => {
  const { getResponsiveValue } = useResponsive();

  return useMemo(
    () => getResponsiveValue(styles),
    [styles, getResponsiveValue]
  );
};

// Response式Class名 Hook
export const _useResponsiveClassName = (
  classNames: ResponsiveValue<string>
) => {
  const { getResponsiveValue } = useResponsive();

  return useMemo(
    () => getResponsiveValue(classNames),
    [classNames, getResponsiveValue]
  );
};
