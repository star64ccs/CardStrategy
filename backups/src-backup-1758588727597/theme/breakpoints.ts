export const breakpoints = {
  mobile: 768,
  tablet: 1024,
  desktop: 1200,
};

export const mediaQueries = {
  mobile: `@media (max-width: ${breakpoints.mobile - 1}px)`,
  tablet: `@media (min-width: ${breakpoints.mobile}px) and (max-width: ${breakpoints.tablet - 1}px)`,
  desktop: `@media (min-width: ${breakpoints.tablet}px)`,
};

export const getDeviceType = () => {
  if (typeof window === 'undefined') return 'mobile';

  const width = window.innerWidth;
  if (width >= breakpoints.desktop) return 'desktop';
  if (width >= breakpoints.tablet) return 'tablet';
  return 'mobile';
};
