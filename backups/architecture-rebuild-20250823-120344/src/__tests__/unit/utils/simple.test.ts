/* global jest, describe, it, expect, beforeEach, afterEach */
describe('Simple Test', () => {
  it('應該通過基本測試', () => {
    expect(1 + 1).toBe(2);
  });

  it('應該處理字符串', () => {
    expect('hello').toBe('hello');
  });

  it('應該處理數組', () => {
    const arr = [1, 2, 3];
    expect(arr).toHaveLength(3);
    expect(arr).toContain(2);
  });

  it('應該處理對象', () => {
    const obj = { name: 'test', value: 42 };
    expect(obj.name).toBe('test');
    expect(obj.value).toBe(42);
  });
});
