// 預載入配置
export const preloadConfig = {
  "criticalResources": [
    {
      "href": "/fonts/main-font.woff2",
      "as": "font",
      "type": "font/woff2",
      "crossorigin": "anonymous"
    },
    {
      "href": "/images/hero-image.webp",
      "as": "image",
      "type": "image/webp"
    },
    {
      "href": "/styles/critical.css",
      "as": "style"
    },
    {
      "href": "/scripts/main.js",
      "as": "script"
    }
  ],
  "prefetchResources": [
    {
      "href": "/images/card-images.webp",
      "as": "image"
    },
    {
      "href": "/scripts/analytics.js",
      "as": "script"
    }
  ]
};

// 動態預載入函數
export const preloadResource = (href, as, type, crossorigin) => {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = href;
  link.as = as;
  if (type) link.type = type;
  if (crossorigin) link.crossOrigin = crossorigin;
  document.head.appendChild(link);
};

// 批量預載入
export const preloadResources = (resources) => {
  resources.forEach(resource => {
    preloadResource(resource.href, resource.as, resource.type, resource.crossorigin);
  });
};
