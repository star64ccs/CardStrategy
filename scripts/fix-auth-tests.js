const fs = require('fs');
const path = require('path');

// 修復 authSlice 測試文件
function fixAuthSliceTests() {
  const testFile = path.join(__dirname, '../src/__tests__/unit/store/authSlice.test.ts');
  let content = fs.readFileSync(testFile, 'utf8');

  // 修復所有的 loading 屬性為 isLoading
  content = content.replace(/state\.loading/g, 'state.isLoading');
  
  // 修復所有的 tokens 屬性為 token
  content = content.replace(/state\.tokens/g, 'state.token');
  
  // 修復 registerData 未定義的問題
  content = content.replace(
    /store\.dispatch\(registerUser\.fulfilled\(.*?registerData\)\)/g,
    (match) => {
      return match.replace('registerData', '{\n        email: \'new@example.com\',\n        password: \'password123\',\n        name: \'New User\',\n      }');
    }
  );
  
  content = content.replace(
    /store\.dispatch\(registerUser\.rejected\(.*?registerData.*?\)\)/g,
    (match) => {
      return match.replace('registerData', '{\n        email: \'new@example.com\',\n        password: \'password123\',\n        name: \'New User\',\n      }');
    }
  );

  // 修復 logoutSuccess 未定義的問題
  content = content.replace(
    /store\.dispatch\(logoutSuccess\(\)\)/g,
    'store.dispatch(logoutUser.fulfilled(null, \'test-request-id\'))'
  );

  // 修復 loginFailure 未定義的問題
  content = content.replace(
    /store\.dispatch\(loginFailure\('密碼錯誤'\)\)/g,
    'store.dispatch(loginUser.rejected(new Error(\'密碼錯誤\'), \'test-request-id\', { email: \'test@example.com\', password: \'wrong\' }, \'密碼錯誤\'))'
  );

  fs.writeFileSync(testFile, content);
  console.log('✅ 修復了 authSlice 測試文件');
}

// 修復 authService 測試文件
function fixAuthServiceTests() {
  const testFile = path.join(__dirname, '../src/__tests__/unit/services/authService.test.ts');
  let content = fs.readFileSync(testFile, 'utf8');

  // 修復 mock 響應格式
  content = content.replace(
    /validateApiResponse: jest\.fn\(\(\) => \(\{[\s\S]*?\}\)\)/g,
    `validateApiResponse: jest.fn(() => ({ 
    isValid: true, 
    errors: [],
    data: {
      success: true,
      data: {
        user: {
          id: '1',
          email: 'test@example.com',
          username: 'Test User',
        },
        token: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
      }
    }
  }))`
  );

  // 修復 AsyncStorage 導入問題
  content = content.replace(
    /const \{ AsyncStorage \} = await import\('@react-native-async-storage\/async-storage'\);/g,
    'const AsyncStorage = require(\'@react-native-async-storage/async-storage\');'
  );

  fs.writeFileSync(testFile, content);
  console.log('✅ 修復了 authService 測試文件');
}

// 修復 authenticityVerification 測試文件
function fixAuthenticityVerificationTests() {
  const testFile = path.join(__dirname, '../src/__tests__/unit/services/authenticityVerification.test.ts');
  let content = fs.readFileSync(testFile, 'utf8');

  // 移除不存在的導入
  content = content.replace(
    /import \{ enhancedAIService \} from '\.\.\/\.\.\/\.\.\/services\/enhancedAIService';\nimport \{ authenticityService \} from '\.\.\/\.\.\/\.\.\/services\/authenticityService';\n\n/g,
    ''
  );

  // 添加 mock 實現
  content = content.replace(
    /\/\/ Mock 外部依賴/g,
    `// Mock 外部依賴
jest.mock('../../../config/api', () => ({
  api: {
    post: jest.fn(),
    get: jest.fn(),
  },
}));

jest.mock('../../../services/authService', () => ({
  authService: {
    login: jest.fn(),
    register: jest.fn(),
  },
}));`
  );

  fs.writeFileSync(testFile, content);
  console.log('✅ 修復了 authenticityVerification 測試文件');
}

// 執行修復
try {
  fixAuthSliceTests();
  fixAuthServiceTests();
  fixAuthenticityVerificationTests();
  console.log('🎉 所有測試修復完成！');
} catch (error) {
  console.error('❌ 修復過程中出現錯誤:', error);
}
