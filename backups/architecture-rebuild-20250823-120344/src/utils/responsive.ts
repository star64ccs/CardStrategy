import { Dimensions } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const isTablet = () => screenWidth >= 768;
export const isDesktop = () => screenWidth >= 1024;
export const isMobile = () => screenWidth < 768;

export const getResponsiveValue = (mobile: any, tablet: any, desktop: any) => {
  if (isDesktop()) return desktop;
  if (isTablet()) return tablet;
  return mobile;
};

export const getResponsivePadding = () => {
  return getResponsiveValue(10, 20, 30);
};

export const getResponsiveFontSize = (baseSize: number) => {
  return getResponsiveValue(baseSize, baseSize * 1.2, baseSize * 1.4);
};

export const getResponsiveSpacing = (baseSpacing: number) => {
  return getResponsiveValue(baseSpacing, baseSpacing * 1.5, baseSpacing * 2);
};

export const getResponsiveGridColumns = () => {
  return getResponsiveValue(1, 2, 3);
};
