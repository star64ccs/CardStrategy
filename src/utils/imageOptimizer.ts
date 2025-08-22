import { PixelRatio, Dimensions, Platform } from 'react-native';

export interface ImageOptimizationOptions {
  width: number;
  height?: number;
  quality: number;
  format: 'webp' | 'jpg' | 'png';
}

export interface ResponsiveImageSizes {
  small: number;
  medium: number;
  large: number;
  xlarge: number;
}

export class ImageOptimizer {
  private static readonly DEFAULT_QUALITY = 0.8;
  private static readonly DEFAULT_FORMAT = 'webp';
  private static readonly SUPPORTED_FORMATS = ['webp', 'jpg', 'png'];

  /**
   * 優化圖片 URL
   */
  static optimizeImage(
    url: string,
    options: Partial<ImageOptimizationOptions> = {}
  ): string {
    const {
      width,
      height,
      quality = this.DEFAULT_QUALITY,
      format = this.DEFAULT_FORMAT,
    } = options;

    if (!url) return url;

    // 檢查是否已經是優化過的 URL
    if (url.includes('?w=') || url.includes('&w=')) {
      return url;
    }

    const params = new URLSearchParams();

    if (width) {
      const pixelRatio = PixelRatio.get();
      const adjustedWidth = Math.round(width * pixelRatio);
      params.append('w', adjustedWidth.toString());
    }

    if (height) {
      const pixelRatio = PixelRatio.get();
      const adjustedHeight = Math.round(height * pixelRatio);
      params.append('h', adjustedHeight.toString());
    }

    if (quality !== this.DEFAULT_QUALITY) {
      params.append('q', quality.toString());
    }

    if (
      format !== this.DEFAULT_FORMAT &&
      this.SUPPORTED_FORMATS.includes(format)
    ) {
      params.append('fmt', format);
    }

    const queryString = params.toString();
    return queryString ? `${url}?${queryString}` : url;
  }

  /**
   * 獲取響應式圖片 URL
   */
  static getResponsiveImage(url: string, sizes: ResponsiveImageSizes): string {
    const screenWidth = Dimensions.get('window').width;

    let targetWidth: number;

    if (screenWidth < 480) {
      targetWidth = sizes.small;
    } else if (screenWidth < 768) {
      targetWidth = sizes.medium;
    } else if (screenWidth < 1024) {
      targetWidth = sizes.large;
    } else {
      targetWidth = sizes.xlarge;
    }

    return this.optimizeImage(url, {
      width: targetWidth,
      quality: this.DEFAULT_QUALITY,
      format: this.DEFAULT_FORMAT,
    });
  }

  /**
   * 預加載圖片
   */
  static async preloadImages(urls: string[]): Promise<void[]> {
    const { Image } = await import('react-native');

    return Promise.all(
      urls.map((url) => {
        return new Promise<void>((resolve, reject) => {
          Image.prefetch(url)
            .then(() => resolve())
            .catch(reject);
        });
      })
    );
  }

  /**
   * 批量優化圖片
   */
  static batchOptimizeImages(
    images: { url: string; options?: Partial<ImageOptimizationOptions> }[]
  ): string[] {
    return images.map(({ url, options }) => this.optimizeImage(url, options));
  }

  /**
   * 檢查圖片格式支持
   */
  static async checkFormatSupport(): Promise<Record<string, boolean>> {
    const support = {
      webp: false,
      avif: false,
      jpg: true,
      png: true,
    };

    // 在 React Native 中，我們假設支持常見格式
    // 實際的格式檢測需要根據平台實現
    if (Platform.OS === 'web') {
      // Web 平台的格式檢測
      const canvas = document.createElement('canvas');
      support.webp =
        canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
      support.avif =
        canvas.toDataURL('image/avif').indexOf('data:image/avif') === 0;
    } else {
      // React Native 平台通常支持 WebP
      support.webp = true;
    }

    return support;
  }

  /**
   * 獲取最佳圖片格式
   */
  static getBestFormat(supportedFormats: Record<string, boolean>): string {
    if (supportedFormats.avif) return 'avif';
    if (supportedFormats.webp) return 'webp';
    return 'jpg';
  }

  /**
   * 計算圖片尺寸
   */
  static calculateImageDimensions(
    originalWidth: number,
    originalHeight: number,
    maxWidth: number,
    maxHeight?: number
  ): { width: number; height: number } {
    const aspectRatio = originalWidth / originalHeight;

    let width = maxWidth;
    let height = maxWidth / aspectRatio;

    if (maxHeight && height > maxHeight) {
      height = maxHeight;
      width = maxHeight * aspectRatio;
    }

    return {
      width: Math.round(width),
      height: Math.round(height),
    };
  }

  /**
   * 生成圖片縮略圖 URL
   */
  static generateThumbnailUrl(url: string, size: number = 150): string {
    return this.optimizeImage(url, {
      width: size,
      height: size,
      quality: 0.6,
      format: 'webp',
    });
  }

  /**
   * 清理圖片緩存
   */
  static async clearImageCache(): Promise<void> {
    try {
      const { Image } = await import('react-native');
      if (Image.clearMemoryCache) {
        Image.clearMemoryCache();
      }
    } catch (error) {
      // logger.info('Failed to clear image cache:', error);
    }
  }
}

// 導出便捷函數
export const optimizeImage = (
  url: string,
  options?: Partial<ImageOptimizationOptions>
) => ImageOptimizer.optimizeImage(url, options);

export const getResponsiveImage = (url: string, sizes: ResponsiveImageSizes) =>
  ImageOptimizer.getResponsiveImage(url, sizes);

export const preloadImages = (urls: string[]) =>
  ImageOptimizer.preloadImages(urls);

export const generateThumbnail = (url: string, size?: number) =>
  ImageOptimizer.generateThumbnailUrl(url, size);
