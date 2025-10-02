// 圖片優化工具
class ImageOptimizer {
  constructor() {
    this.config = {
      formats: ['webp', 'avif', 'jpeg', 'png'],
      qualities: {
        hero: 90,
        card: 80,
        thumbnail: 75,
        background: 70
      },
      sizes: {
        hero: [1920, 1080],
        card: [400, 300],
        thumbnail: [150, 150],
        background: [800, 600]
      }
    };
  }

  // 生成響應式圖片
  generateResponsiveImage(src, alt, className = '') {
    const baseName = src.replace(/\.[^.]+$/, '');
    const extension = src.split('.').pop();

    return `
      <picture class="${className}">
        <source media="(min-width: 1200px)" srcset="${baseName}_large.webp" type="image/webp">
        <source media="(min-width: 768px)" srcset="${baseName}_medium.webp" type="image/webp">
        <source media="(min-width: 480px)" srcset="${baseName}_small.webp" type="image/webp">
        <source media="(min-width: 1200px)" srcset="${baseName}_large.${extension}">
        <source media="(min-width: 768px)" srcset="${baseName}_medium.${extension}">
        <source media="(min-width: 480px)" srcset="${baseName}_small.${extension}">
        <img src="${src}" alt="${alt}" loading="lazy" decoding="async">
      </picture>
    `;
  }

  // 懶加載圖片
  createLazyImage(src, alt, placeholder = null) {
    return `
      <div class="lazy-image-container" data-src="${src}">
        ${placeholder ? `<div class="placeholder">${placeholder}</div>` : ''}
        <img class="lazy-image" alt="${alt}" loading="lazy" decoding="async">
      </div>
    `;
  }

  // 預載入關鍵圖片
  preloadCriticalImages(images) {
    return images.map(src => 
      `<link rel="preload" as="image" href="${src}">`
    ).join('\n');
  }

  // 生成圖片佔位符
  generateImagePlaceholder(width, height, color = '#f0f0f0') {
    const svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="${color}"/>
        <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#999" font-family="Arial, sans-serif" font-size="14">
          載入中...
        </text>
      </svg>
    `;
    
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  }

  // 壓縮圖片
  async compressImage(file, quality = 80) {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        
        ctx.drawImage(img, 0, 0);
        
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality / 100);
        resolve(compressedDataUrl);
      };

      img.src = URL.createObjectURL(file);
    });
  }

  // 檢測 WebP 支持
  supportsWebP() {
    return new Promise((resolve) => {
      const webP = new Image();
      webP.onload = webP.onerror = () => {
        resolve(webP.height === 2);
      };
      webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
    });
  }

  // 檢測 AVIF 支持
  supportsAVIF() {
    return new Promise((resolve) => {
      const avif = new Image();
      avif.onload = avif.onerror = () => {
        resolve(avif.height === 2);
      };
      avif.src = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAABcAAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAEAAAABAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQAMAAAAABNjb2xybmNseAACAAIABoAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAAB1tZGF0EgAKCBgABogQEAwgMgkQAAAAB8i8OA==';
    });
  }

  // 獲取最佳圖片格式
  async getBestImageFormat() {
    const webpSupported = await this.supportsWebP();
    const avifSupported = await this.supportsAVIF();

    if (avifSupported) return 'avif';
    if (webpSupported) return 'webp';
    return 'jpeg';
  }

  // 生成圖片 URL
  generateImageUrl(baseUrl, width, height, format, quality = 80) {
    const params = new URLSearchParams({
      w: width,
      h: height,
      f: format,
      q: quality
    });
    
    return `${baseUrl}?${params.toString()}`;
  }
}

export default new ImageOptimizer();
