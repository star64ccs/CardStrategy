/**
 * Graph片轉 Base64 ToolFunction
 * 用於Test的簡單實現
 */

/**
 * 將Graph片Convert為 base64 格式
 * @param imagePath Graph片Path
 * @returns Promise<string> base64 字符串
 */
export const _imageToBase64 = async (imagePath: string): Promise<string> => {
  // 模擬Convert過程
  return new Promise(resolve => {
    setTimeout(() => {
      // Return一個模擬的 base64 字符串
      resolve('data:image/jpeg;base64,mock-base64-data-for-testing');
    }, 100);
  });
};

/**
 * 將MultipleGraph片Convert為 base64 格式
 * @param imagePaths Graph片PathArray
 * @returns Promise<string[]> base64 字符串Array
 */
export const _imagesToBase64 = async (
  imagePaths: string[]
): Promise<string[]> => {
  const _results = await Promise.all(
    imagePaths.map(path => imageToBase64(path))
  );
  return results;
};
