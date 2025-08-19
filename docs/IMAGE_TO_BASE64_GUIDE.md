# 圖片轉Base64功能使用指南

## 概述

本功能提供了完整的圖片轉base64解決方案，支持單個圖片轉換、批量轉換、URL圖片轉換、圖片壓縮等功能。所有功能都經過優化，確保高效能和良好的用戶體驗。

## 功能特性

- ✅ **單個圖片轉換**: 將單個圖片文件轉換為base64格式
- ✅ **批量轉換**: 同時處理多個圖片文件
- ✅ **URL轉換**: 從網絡URL獲取圖片並轉換
- ✅ **圖片壓縮**: 支持質量調整和尺寸縮放
- ✅ **格式轉換**: 支持JPEG、PNG、WebP格式
- ✅ **錯誤處理**: 完善的錯誤處理機制
- ✅ **性能優化**: 高效的處理算法
- ✅ **類型安全**: 完整的TypeScript類型定義

## 快速開始

### 1. 基本使用

```typescript
import { convertImageToBase64 } from '../services/dataQualityService';

// 轉換單個圖片文件
const file = event.target.files[0]; // 從文件輸入獲取
const result = await convertImageToBase64(file, {
  quality: 0.8,
  maxWidth: 800,
  maxHeight: 600,
  format: 'jpeg',
  compression: true
});

console.log('轉換結果:', result.base64);
```

### 2. 使用服務類

```typescript
import { dataQualityService } from '../services/dataQualityService';

// 使用服務類方法
const result = await dataQualityService.convertImageToBase64(file, options);
```

## API 參考

### 接口定義

#### ImageToBase64Options
```typescript
interface ImageToBase64Options {
  quality?: number;        // 圖片質量 (0-1)，預設 0.8
  maxWidth?: number;       // 最大寬度
  maxHeight?: number;      // 最大高度
  format?: 'jpeg' | 'png' | 'webp'; // 輸出格式，預設 'jpeg'
  compression?: boolean;   // 是否啟用壓縮，預設 true
}
```

#### ImageToBase64Result
```typescript
interface ImageToBase64Result {
  base64: string;          // base64字符串
  originalSize: number;    // 原始文件大小 (bytes)
  compressedSize: number;  // 壓縮後大小 (bytes)
  width: number;           // 圖片寬度
  height: number;          // 圖片高度
  format: string;          // 輸出格式
  mimeType: string;        // MIME類型
  compressionRatio: number; // 壓縮比例
  processingTime: number;  // 處理時間 (ms)
}
```

### 主要函數

#### 1. convertImageToBase64
將單個圖片文件轉換為base64格式

```typescript
async convertImageToBase64(
  file: File | Blob, 
  options: ImageToBase64Options = {}
): Promise<ImageToBase64Result>
```

**參數:**
- `file`: 圖片文件 (File 或 Blob)
- `options`: 轉換選項

**返回值:**
- `Promise<ImageToBase64Result>`: 轉換結果

**示例:**
```typescript
const file = event.target.files[0];
const result = await convertImageToBase64(file, {
  quality: 0.8,
  maxWidth: 800,
  maxHeight: 600,
  format: 'jpeg',
  compression: true
});

console.log('base64:', result.base64);
console.log('尺寸:', result.width, 'x', result.height);
console.log('壓縮比例:', (result.compressionRatio * 100).toFixed(2) + '%');
```

#### 2. convertImagesToBase64
批量轉換多個圖片文件

```typescript
async convertImagesToBase64(
  files: (File | Blob)[], 
  options: ImageToBase64Options = {}
): Promise<BatchImageToBase64Result>
```

**參數:**
- `files`: 圖片文件數組
- `options`: 轉換選項

**返回值:**
- `Promise<BatchImageToBase64Result>`: 批量轉換結果

**示例:**
```typescript
const files = Array.from(event.target.files);
const result = await convertImagesToBase64(files, {
  quality: 0.7,
  maxWidth: 1024,
  format: 'webp'
});

console.log(`成功轉換 ${result.successfulConversions}/${result.totalImages} 張圖片`);
console.log(`平均處理時間: ${result.averageProcessingTime.toFixed(2)}ms`);
```

#### 3. convertImageUrlToBase64
從URL獲取圖片並轉換為base64

```typescript
async convertImageUrlToBase64(
  imageUrl: string, 
  options: ImageToBase64Options = {}
): Promise<ImageToBase64Result>
```

**參數:**
- `imageUrl`: 圖片URL
- `options`: 轉換選項

**返回值:**
- `Promise<ImageToBase64Result>`: 轉換結果

**示例:**
```typescript
const imageUrl = 'https://example.com/image.jpg';
const result = await convertImageUrlToBase64(imageUrl, {
  quality: 0.9,
  maxWidth: 1200,
  format: 'png'
});

console.log('URL圖片轉換完成:', result.base64);
```

#### 4. base64ToBlob
將base64字符串轉換回Blob對象

```typescript
base64ToBlob(base64: string, mimeType: string = 'image/jpeg'): Blob
```

**參數:**
- `base64`: base64字符串
- `mimeType`: MIME類型，預設 'image/jpeg'

**返回值:**
- `Blob`: Blob對象

**示例:**
```typescript
const blob = base64ToBlob(result.base64, result.mimeType);
const url = URL.createObjectURL(blob);
```

#### 5. isValidImageBase64
驗證base64字符串是否為有效的圖片

```typescript
isValidImageBase64(base64: string): boolean
```

**參數:**
- `base64`: base64字符串

**返回值:**
- `boolean`: 是否為有效的圖片base64

**示例:**
```typescript
const isValid = isValidImageBase64(result.base64);
if (isValid) {
  console.log('base64格式有效');
} else {
  console.log('base64格式無效');
}
```

#### 6. getBase64ImageDimensions
獲取base64圖片的尺寸信息

```typescript
async getBase64ImageDimensions(base64: string): Promise<{width: number, height: number}>
```

**參數:**
- `base64`: base64字符串

**返回值:**
- `Promise<{width: number, height: number}>`: 圖片尺寸

**示例:**
```typescript
const dimensions = await getBase64ImageDimensions(result.base64);
console.log('圖片尺寸:', dimensions.width, 'x', dimensions.height);
```

#### 7. compressBase64Image
壓縮base64圖片

```typescript
async compressBase64Image(
  base64: string, 
  options: ImageToBase64Options = {}
): Promise<ImageToBase64Result>
```

**參數:**
- `base64`: 原始base64字符串
- `options`: 壓縮選項

**返回值:**
- `Promise<ImageToBase64Result>`: 壓縮後的結果

**示例:**
```typescript
const compressedResult = await compressBase64Image(originalBase64, {
  quality: 0.5,
  maxWidth: 800,
  maxHeight: 600,
  format: 'jpeg'
});

console.log('壓縮比例:', (compressedResult.compressionRatio * 100).toFixed(2) + '%');
```

## 使用場景

### 1. 卡片掃描功能
```typescript
// 在卡片掃描時轉換圖片
const handleCardScan = async (file: File) => {
  try {
    const result = await convertImageToBase64(file, {
      quality: 0.9,
      maxWidth: 1200,
      maxHeight: 800,
      format: 'jpeg',
      compression: true
    });
    
    // 發送到AI分析服務
    const analysisResult = await sendToAIAnalysis(result.base64);
    
  } catch (error) {
    console.error('卡片掃描失敗:', error);
  }
};
```

### 2. 批量圖片處理
```typescript
// 批量處理用戶上傳的圖片
const handleBatchUpload = async (files: File[]) => {
  try {
    const result = await convertImagesToBase64(files, {
      quality: 0.8,
      maxWidth: 1024,
      maxHeight: 768,
      format: 'webp',
      compression: true
    });
    
    // 處理轉換結果
    result.results.forEach((item, index) => {
      console.log(`圖片 ${index + 1}:`, item.base64);
    });
    
  } catch (error) {
    console.error('批量處理失敗:', error);
  }
};
```

### 3. 圖片預覽
```typescript
// 創建圖片預覽
const createImagePreview = async (file: File) => {
  try {
    const result = await convertImageToBase64(file, {
      quality: 0.7,
      maxWidth: 300,
      maxHeight: 200,
      format: 'jpeg',
      compression: true
    });
    
    const img = document.createElement('img');
    img.src = result.base64;
    img.style.maxWidth = '100%';
    document.getElementById('preview').appendChild(img);
    
  } catch (error) {
    console.error('預覽創建失敗:', error);
  }
};
```

### 4. 圖片壓縮優化
```typescript
// 優化圖片大小
const optimizeImage = async (originalBase64: string) => {
  try {
    const optimized = await compressBase64Image(originalBase64, {
      quality: 0.6,
      maxWidth: 800,
      maxHeight: 600,
      format: 'jpeg'
    });
    
    console.log('原始大小:', optimized.originalSize);
    console.log('優化後大小:', optimized.compressedSize);
    console.log('節省空間:', (optimized.compressionRatio * 100).toFixed(2) + '%');
    
    return optimized.base64;
    
  } catch (error) {
    console.error('圖片優化失敗:', error);
    return originalBase64;
  }
};
```

## 錯誤處理

### 常見錯誤類型

1. **文件格式錯誤**
```typescript
try {
  const result = await convertImageToBase64(file);
} catch (error) {
  if (error.message.includes('文件不是有效的圖片格式')) {
    alert('請選擇有效的圖片文件');
  }
}
```

2. **圖片加載失敗**
```typescript
try {
  const result = await convertImageUrlToBase64(url);
} catch (error) {
  if (error.message.includes('圖片加載失敗')) {
    alert('圖片URL無效或無法訪問');
  }
}
```

3. **base64格式錯誤**
```typescript
try {
  const blob = base64ToBlob(invalidBase64);
} catch (error) {
  if (error.message.includes('無效的base64格式')) {
    alert('base64格式錯誤');
  }
}
```

### 錯誤處理最佳實踐

```typescript
const safeImageConversion = async (file: File) => {
  try {
    // 驗證文件類型
    if (!file.type.startsWith('image/')) {
      throw new Error('請選擇圖片文件');
    }
    
    // 驗證文件大小
    if (file.size > 10 * 1024 * 1024) { // 10MB
      throw new Error('文件大小不能超過10MB');
    }
    
    const result = await convertImageToBase64(file, {
      quality: 0.8,
      maxWidth: 1200,
      maxHeight: 800,
      format: 'jpeg',
      compression: true
    });
    
    return result;
    
  } catch (error) {
    console.error('圖片轉換失敗:', error);
    
    // 根據錯誤類型提供用戶友好的提示
    if (error.message.includes('文件不是有效的圖片格式')) {
      alert('請選擇有效的圖片文件 (JPG, PNG, WebP等)');
    } else if (error.message.includes('文件大小')) {
      alert('文件太大，請選擇較小的圖片');
    } else {
      alert('圖片處理失敗，請重試');
    }
    
    return null;
  }
};
```

## 性能優化建議

### 1. 合理設置圖片尺寸
```typescript
// 根據使用場景設置合適的尺寸
const options = {
  // 縮略圖
  thumbnail: { maxWidth: 200, maxHeight: 150, quality: 0.6 },
  
  // 預覽圖
  preview: { maxWidth: 800, maxHeight: 600, quality: 0.8 },
  
  // 高質量圖
  highQuality: { maxWidth: 1920, maxHeight: 1080, quality: 0.9 }
};
```

### 2. 使用WebP格式
```typescript
// WebP格式通常能提供更好的壓縮效果
const webpOptions = {
  format: 'webp',
  quality: 0.8,
  compression: true
};
```

### 3. 批量處理優化
```typescript
// 限制同時處理的圖片數量
const batchProcess = async (files: File[], batchSize = 5) => {
  const results = [];
  
  for (let i = 0; i < files.length; i += batchSize) {
    const batch = files.slice(i, i + batchSize);
    const batchResults = await convertImagesToBase64(batch);
    results.push(...batchResults.results);
    
    // 添加延遲避免阻塞UI
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  return results;
};
```

### 4. 緩存機制
```typescript
// 緩存已轉換的圖片
const imageCache = new Map();

const getCachedImage = async (file: File) => {
  const fileKey = `${file.name}-${file.size}-${file.lastModified}`;
  
  if (imageCache.has(fileKey)) {
    return imageCache.get(fileKey);
  }
  
  const result = await convertImageToBase64(file);
  imageCache.set(fileKey, result);
  
  return result;
};
```

## 瀏覽器兼容性

### 支持的瀏覽器
- ✅ Chrome 51+
- ✅ Firefox 42+
- ✅ Safari 10+
- ✅ Edge 79+
- ✅ Opera 38+

### 功能支持情況
- ✅ Canvas API
- ✅ FileReader API
- ✅ Blob API
- ✅ Promise API
- ✅ async/await

### 格式支持
- ✅ JPEG
- ✅ PNG
- ✅ WebP (需要瀏覽器支持)
- ✅ GIF (靜態)

## 測試

### 運行測試
```bash
# 運行單元測試
npm test -- --testPathPattern=imageToBase64

# 運行示例
npm run example:image-to-base64
```

### 測試覆蓋率
```bash
# 生成測試覆蓋率報告
npm run test:coverage
```

## 故障排除

### 常見問題

1. **圖片轉換失敗**
   - 檢查文件格式是否支持
   - 確認文件大小是否過大
   - 檢查瀏覽器是否支持Canvas API

2. **內存使用過高**
   - 減少同時處理的圖片數量
   - 降低圖片質量或尺寸
   - 使用WebP格式減少文件大小

3. **跨域問題**
   - 確保圖片URL支持CORS
   - 使用代理服務器
   - 考慮下載圖片到本地再處理

4. **性能問題**
   - 使用Web Workers處理大圖片
   - 實現圖片懶加載
   - 使用圖片預加載

## 更新日誌

### v1.0.0 (2024-01-XX)
- ✅ 初始版本發布
- ✅ 支持單個圖片轉換
- ✅ 支持批量圖片轉換
- ✅ 支持URL圖片轉換
- ✅ 支持圖片壓縮
- ✅ 完整的TypeScript類型定義
- ✅ 完善的錯誤處理機制

## 貢獻

歡迎提交Issue和Pull Request來改進這個功能！

## 授權

本項目採用MIT授權協議。
