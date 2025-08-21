import {
  convertImageToBase64,
  convertImagesToBase64,
  convertImageUrlToBase64,
  base64ToBlob,
  isValidImageBase64,
  getBase64ImageDimensions,
  compressBase64Image,
  dataQualityService,
  ImageToBase64Options
} from '../services/dataQualityService';

/**
 * 圖片轉base64功能使用示例
 */
export class ImageToBase64Example {

  /**
   * 示例1: 將單個圖片文件轉換為base64
   */
  static async exampleSingleImageConversion() {
    try {
      // 假設我們有一個文件輸入元素
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = 'image/*';

      fileInput.onchange = async (event) => {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (!file) return;

        const options: ImageToBase64Options = {
          quality: 0.8,
          maxWidth: 800,
          maxHeight: 600,
          format: 'jpeg',
          compression: true
        };

        try {
          const result = await convertImageToBase64(file, options);
          // logger.info('轉換結果:', result);

          // 顯示轉換後的圖片
          const img = document.createElement('img');
          img.src = result.base64;
          img.style.maxWidth = '300px';
          document.body.appendChild(img);

        } catch (error) {
          // logger.info('圖片轉換失敗:', error);
        }
      };

      fileInput.click();
    } catch (error) {
      // logger.info('示例執行失敗:', error);
    }
  }

  /**
   * 示例2: 批量轉換圖片
   */
  static async exampleBatchConversion() {
    try {
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = 'image/*';
      fileInput.multiple = true;

      fileInput.onchange = async (event) => {
        const files = Array.from((event.target as HTMLInputElement).files || []);
        if (files.length === 0) return;

        const options: ImageToBase64Options = {
          quality: 0.7,
          maxWidth: 1024,
          maxHeight: 768,
          format: 'webp',
          compression: true
        };

        try {
          const result = await convertImagesToBase64(files, options);
          // logger.info('批量轉換結果:', result);

          // 顯示轉換統計
          // logger.info(`總共處理 ${result.totalImages} 張圖片`);
          // logger.info(`成功轉換 ${result.successfulConversions} 張`);
          // logger.info(`失敗 ${result.failedConversions} 張`);
          // logger.info(`平均處理時間: ${result.averageProcessingTime.toFixed(2)}ms`);

        } catch (error) {
          // logger.info('批量轉換失敗:', error);
        }
      };

      fileInput.click();
    } catch (error) {
      // logger.info('示例執行失敗:', error);
    }
  }

  /**
   * 示例3: 從URL轉換圖片
   */
  static async exampleUrlConversion() {
    try {
      const imageUrl = 'https://example.com/sample-image.jpg';

      const options: ImageToBase64Options = {
        quality: 0.9,
        maxWidth: 1200,
        maxHeight: 800,
        format: 'png',
        compression: false
      };

      const result = await convertImageUrlToBase64(imageUrl, options);
      // logger.info('URL轉換結果:', result);

    } catch (error) {
      // logger.info('URL轉換失敗:', error);
    }
  }

  /**
   * 示例4: 使用DataQualityService類
   */
  static async exampleUsingService() {
    try {
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = 'image/*';

      fileInput.onchange = async (event) => {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (!file) return;

        const options: ImageToBase64Options = {
          quality: 0.8,
          maxWidth: 800,
          maxHeight: 600,
          format: 'jpeg',
          compression: true
        };

        try {
          // 使用服務類方法
          const result = await dataQualityService.convertImageToBase64(file, options);
          // logger.info('服務類轉換結果:', result);

          // 驗證base64格式
          const isValid = dataQualityService.isValidImageBase64(result.base64);
          // logger.info('base64格式有效:', isValid);

          // 獲取圖片尺寸
          const dimensions = await dataQualityService.getBase64ImageDimensions(result.base64);
          // logger.info('圖片尺寸:', dimensions);

          // 轉換回Blob
          const blob = dataQualityService.base64ToBlob(result.base64, result.mimeType);
          // logger.info('轉換回Blob:', blob);

        } catch (error) {
          // logger.info('服務類轉換失敗:', error);
        }
      };

      fileInput.click();
    } catch (error) {
      // logger.info('示例執行失敗:', error);
    }
  }

  /**
   * 示例5: 圖片壓縮
   */
  static async exampleImageCompression() {
    try {
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = 'image/*';

      fileInput.onchange = async (event) => {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (!file) return;

        try {
          // 先轉換為base64
          const originalResult = await convertImageToBase64(file, { compression: false });
          // logger.info('原始圖片大小:', originalResult.originalSize, 'bytes');

          // 壓縮圖片
          const compressedResult = await compressBase64Image(originalResult.base64, {
            quality: 0.5,
            maxWidth: 800,
            maxHeight: 600,
            format: 'jpeg'
          });

          // logger.info('壓縮後大小:', compressedResult.compressedSize, 'bytes');
          // logger.info('壓縮比例:', `${(compressedResult.compressionRatio * 100).toFixed(2)  }%`);

        } catch (error) {
          // logger.info('圖片壓縮失敗:', error);
        }
      };

      fileInput.click();
    } catch (error) {
      // logger.info('示例執行失敗:', error);
    }
  }

  /**
   * 示例6: 錯誤處理
   */
  static async exampleErrorHandling() {
    try {
      // 測試無效的base64字符串
      const invalidBase64 = 'invalid-base64-string';
      const isValid = isValidImageBase64(invalidBase64);
      // logger.info('無效base64驗證:', isValid);

      // 測試base64ToBlob錯誤處理
      try {
        const blob = base64ToBlob(invalidBase64);
        // logger.info('Blob轉換成功:', blob);
      } catch (error) {
        // logger.info('Blob轉換錯誤:', error instanceof Error ? error.message : '未知錯誤');
      }

    } catch (error) {
      // logger.info('錯誤處理示例失敗:', error);
    }
  }

  /**
   * 運行所有示例
   */
  static async runAllExamples() {
    // logger.info('開始運行圖片轉base64功能示例...');

    // 注意：這些示例需要在瀏覽器環境中運行
    // 因為它們依賴於DOM API和文件輸入

    // logger.info('示例1: 單個圖片轉換');
    // await this.exampleSingleImageConversion();

    // logger.info('示例2: 批量圖片轉換');
    // await this.exampleBatchConversion();

    // logger.info('示例3: URL圖片轉換');
    // await this.exampleUrlConversion();

    // logger.info('示例4: 使用服務類');
    // await this.exampleUsingService();

    // logger.info('示例5: 圖片壓縮');
    // await this.exampleImageCompression();

    // logger.info('示例6: 錯誤處理');
    await this.exampleErrorHandling();

    // logger.info('所有示例完成！');
  }
}

// 導出示例類
export default ImageToBase64Example;
