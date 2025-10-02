// 佈局Component統一Export

// 核心佈局Component
export { Container } from './Container';
export { Grid, GridItem } from './Grid';
export { Flex } from './Flex';
export { Stack } from './Stack';

// Response式提供者
export {
  ResponsiveProvider,
  useResponsive,
} from '../providers/ResponsiveProvider';

// Class型Export
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

// Hook Export
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
