// 簡單的測試來驗證 Jest 配置是否正常工作
describe('Jest 配置測試', () => {
  it('應該能夠運行基本測試', () => {
    expect(1 + 1).toBe(2);
  });

  it('應該能夠處理字符串', () => {
    const message = 'Hello World';
    expect(message).toContain('Hello');
  });

  it('應該能夠處理數組', () => {
    const numbers = [1, 2, 3, 4, 5];
    expect(numbers).toHaveLength(5);
    expect(numbers[0]).toBe(1);
  });

  it('應該能夠處理對象', () => {
    const obj = { name: 'CardStrategy', version: '1.0.0' };
    expect(obj.name).toBe('CardStrategy');
    expect(obj.version).toBe('1.0.0');
  });
});
