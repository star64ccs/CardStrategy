/**
 * 圖片轉 Base64 工具函數
 * 用於測試的簡單實現
 */

/**
 * 將圖片轉換為 base64 格式
 * @param imagePath 圖片路徑
 * @returns Promise<string> base64 字符串
 */
export const imageToBase64 = async (imagePath: string): Promise<string> => {
  // 模擬轉換過程
  return new Promise(resolve => {
    setTimeout(() => {
      // 返回一個模擬的 base64 字符串
      resolve('data:image/jpeg;base64,mock-base64-data-for-testing');
    }, 100);
  });
};

/**
 * 將多個圖片轉換為 base64 格式
 * @param imagePaths 圖片路徑數組
 * @returns Promise<string[]> base64 字符串數組
 */
export const imagesToBase64 = async (
  imagePaths: string[]
): Promise<string[]> => {
  const results = await Promise.all(
    imagePaths.map(path => imageToBase64(path))
  );
  return results;
};
