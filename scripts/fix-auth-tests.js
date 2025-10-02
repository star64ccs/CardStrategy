const fs = require('fs');
const path = require('path');

// 修復 authSlice TestFile
function fixAuthSliceTests() {
  const testFile = path.join(__dirname, '../src/__tests__/unit/store/authSlice.test.ts');
  let content = fs.readFileSync(testFile, 'utf8');

  // 修復所有的 loading Property為 isLoading
  content = content.replace(/state\.loading/g, 'state.isLoading');
  
  // 修復所有的 tokens Property為 token
  content = content.replace(/state\.tokens/g, 'state.token');
  
  // 修復 registerData Undefined的問題
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

  // 修復 logoutSuccess Undefined的問題
  content = content.replace(
    /store\.dispatch\(logoutSuccess\(\)\)/g,
    'store.dispatch(logoutUser.fulfilled(null, \'test-request-id\'))'
  );

  // 修復 loginFailure Undefined的問題
  content = content.replace(
    /store\.dispatch\(loginFailure\('密碼Error'\)\)/g,
    'store.dispatch(loginUser.rejected(new Error(\'密碼錯誤\'), \'test-request-id\', { email: \'test@example.com\', password: \'wrong\' }, \'密碼錯誤\'))'
  );

  fs.writeFileSync(testFile, content);
  console.log('✅ 修復了 authSlice 測試文件');
}

// 修復 authService TestFile
function fixAuthServiceTests() {
  const testFile = path.join(__dirname, '../src/__tests__/unit/services/authService.test.ts');
  let content = fs.readFileSync(testFile, 'utf8');

  // 修復 mock Response格式
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

  // 修復 AsyncStorage Import問題
  content = content.replace(
    /const \{ AsyncStorage \} = await import\('@react-native-async-storage\/async-storage'\);/g,
    'const AsyncStorage = require(\'@react-native-async-storage/async-storage\');'
  );

  fs.writeFileSync(testFile, content);
  console.log('✅ 修復了 authService 測試文件');
}

// 修復 authenticityVerification TestFile
function fixAuthenticityVerificationTests() {
  const testFile = path.join(__dirname, '../src/__tests__/unit/services/authenticityVerification.test.ts');
  let content = fs.readFileSync(testFile, 'utf8');

  // Remove不存在的Import
  content = content.replace(
    /import \{ enhancedAIService \} from '\.\.\/\.\.\/\.\.\/services\/enhancedAIService';\nimport \{ authenticityService \} from '\.\.\/\.\.\/\.\.\/services\/authenticityService';\n\n/g,
    ''
  );

  // Add mock 實現
  content = content.replace(
    /\/\/ Mock 外部依賴/g,
    `// Mock External依賴
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

// 執Row修復
try {
  fixAuthSliceTests();
  fixAuthServiceTests();
  fixAuthenticityVerificationTests();
  console.log('🎉 所有測試修復完成！');
} catch (error) {
  console.error('❌ 修復過程中出現Error:', error);
}
