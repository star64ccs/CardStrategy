# 錯誤預防指南

## 常見錯誤預防

### no-undef錯誤
**描述**: 變數未定義錯誤

**預防措施**:
- 確保所有變數在使用前已定義
- 檢查導入語句是否正確
- 使用TypeScript嚴格模式
- 定期運行lint檢查

**示例**:
```typescript
// 錯誤
const result = someFunction(); // someFunction未定義

// 正確
import { someFunction } from "./utils";
const result = someFunction();
```

### no-unused-vars警告
**描述**: 未使用變數警告

**預防措施**:
- 使用下劃線前綴標記未使用變數
- 定期清理未使用的導入
- 使用ESLint自動修復

**示例**:
```typescript
// 錯誤
const unusedVar = "test";

// 正確
const _unusedVar = "test"; // eslint-disable-line @typescript-eslint/no-unused-vars
```

## 最佳實踐

- 使用TypeScript嚴格模式
- 定期運行代碼質量檢查
- 使用代碼模板確保一致性
- 實施代碼審查流程
- 建立自動化測試
- 使用ESLint和Prettier
- 定期更新依賴包
- 文檔化代碼變更

## 檢查清單

### 提交前檢查
- [ ] 運行lint檢查
- [ ] 運行類型檢查
- [ ] 運行單元測試
- [ ] 檢查代碼格式
- [ ] 更新文檔

### 構建前檢查
- [ ] 運行完整測試套件
- [ ] 檢查依賴安全性
- [ ] 驗證構建配置
- [ ] 檢查性能指標

### 部署前檢查
- [ ] 運行端到端測試
- [ ] 安全掃描
- [ ] 性能測試
- [ ] 用戶驗收測試
