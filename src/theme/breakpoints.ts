export const _breakpoints = {
  mobile: 768,
  tablet: 1024,
  desktop: 1200,
};

export const _mediaQueries = {
  mobile: `@media (max-width: ${breakpoints.mobile - 1}px)`,
  tablet: `@media (min-width: ${breakpoints.mobile}px) and (max-width: ${breakpoints.tablet - 1}px)`,
  desktop: `@media (min-width: ${breakpoints.tablet}px)`,
};

export const _getDeviceType = () => {
  if (typeof window === 'undefined') return 'mobile';

  const _width = window.innerWidth;
  if (width >= breakpoints.desktop) return 'desktop';
  if (width >= breakpoints.tablet) return 'tablet';
  return 'mobile';
};
