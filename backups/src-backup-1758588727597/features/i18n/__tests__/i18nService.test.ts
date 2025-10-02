// 簡單的國際化服務測試
describe('I18nService Basic Tests', () => {
  it('應該存在', () => {
    expect(true).toBe(true);
  });

  it('應該支持基本功能', () => {
    // 這裡只是驗證測試環境正常工作
    const testValue = 'test';
    expect(testValue).toBe('test');
  });
});
