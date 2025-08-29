// 佈局組件統一導出

// 核心佈局組件
export { Container } from './Container';
export { Grid, GridItem } from './Grid';
export { Flex } from './Flex';
export { Stack } from './Stack';

// 響應式提供者
export {
  ResponsiveProvider,
  useResponsive,
} from '../providers/ResponsiveProvider';

// 類型導出
export type {
  ContainerProps,
  GridProps,
  GridItemProps,
  FlexProps,
  StackProps,
  ResponsiveProviderProps,
  ResponsiveState,
  ResponsiveEvent,
  Breakpoint,
  BreakpointConfig,
  ResponsiveValue,
  LayoutService,
  LayoutComponentRegistration,
  LayoutSystemConfig,
  LayoutSystemState,
  LayoutSystemEvent,
} from '../../types/layout';

// Hook 導出
export {
  useResponsive as useResponsiveHook,
  useBreakpoint,
  useResponsiveValue,
  useDeviceType,
  useResponsiveCondition,
  useResponsiveStyle,
  useResponsiveClassName,
  type UseResponsiveReturn,
} from '../../hooks/useResponsive';
