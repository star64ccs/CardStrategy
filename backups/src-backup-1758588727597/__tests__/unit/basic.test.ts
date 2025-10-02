// 基本測試驗證
describe('基本測試系統驗證', () => {
  it('應該能夠執行基本測試', () => {
    expect(1 + 1).toBe(2);
  });

  it('應該能夠處理字符串', () => {
    const text = 'Hello World';
    expect(text).toContain('Hello');
  });

  it('應該能夠處理數組', () => {
    const numbers = [1, 2, 3, 4, 5];
    expect(numbers).toHaveLength(5);
    expect(numbers).toContain(3);
  });

  it('應該能夠處理對象', () => {
    const user = {
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
    };

    expect(user).toHaveProperty('name');
    expect(user.name).toBe('Test User');
  });
});
