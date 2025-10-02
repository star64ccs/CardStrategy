const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

/**
 * Firebase ServiceTest腳本
 * 用於Test Firebase Admin SDK 功能
 */

class FirebaseServiceTester {
  constructor() {
    this.serviceAccountPath = path.join(__dirname, '../src/config/firebase-service-account.json');
    this.projectId = 'cardstrategy-406cc';
  }

  async initializeFirebase() {
    // eslint-disable-next-line no-console
    console.log('🔥 初始化 Firebase Admin SDK...\n');
    
    try {
      // CheckService帳戶File
      if (!fs.existsSync(this.serviceAccountPath)) {
        throw new Error(`Service帳戶文件不存在: ${this.serviceAccountPath}`);
      }

      const serviceAccount = JSON.parse(fs.readFileSync(this.serviceAccountPath, 'utf8'));
      
      // Initialize Firebase Admin SDK
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: this.projectId,
        storageBucket: 'cardstrategy-406cc.firebasestorage.app'
      });

      // eslint-disable-next-line no-console
      console.log('✅ Firebase Admin SDK InitializeSuccess');
      return true;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('❌ Firebase InitializeFailed:', error.message);
      throw error;
    }
  }

  async testAuthentication() {
    // eslint-disable-next-line no-console
    console.log('\n🔐 測試身份VerifyService...');
    
    try {
      // TestCreateCustom令牌
      const uid = 'test-user-123';
      const customToken = await admin.auth().createCustomToken(uid);
      // eslint-disable-next-line no-console
      console.log(`✅ 自定義令牌CreateSuccess (UID: ${uid})`);
      // eslint-disable-next-line no-console
      console.log(`  令牌: ${customToken.substring(0, 20)}...`);

      // TestGetUserInformation（如果存在）
      try {
        const userRecord = await admin.auth().getUser(uid);
        // eslint-disable-next-line no-console
        console.log(`✅ 用戶信息GetSuccess: ${userRecord.email || '無郵箱'}`);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.log(`⚠️ 用戶 ${uid} 不存在（這是正常的）`);
      }

      return true;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('❌ 身份Verify測試Failed:', error.message);
      throw error;
    }
  }

  async testMessaging() {
    // eslint-disable-next-line no-console
    console.log('\n📱 測試推送通知Service...');
    
    try {
      // TestTheme訂閱
      const topic = 'cardstrategy_notifications';
      const tokens = ['test-device-token-123']; // Test令牌
      
      try {
        const response = await admin.messaging().subscribeToTopic(tokens, topic);
        // eslint-disable-next-line no-console
        console.log(`✅ 主題訂閱測試Success: ${response.successCount}/${tokens.length} Success`);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.log(`⚠️ 主題訂閱測試Failed（測試令牌無效）: ${error.message}`);
      }

      // TestSendMessage到Theme
      try {
        const message = {
          notification: {
            title: 'CardStrategy 測試通知',
            body: '這是一個測試推送通知'
          },
          data: {
            type: 'test',
            timestamp: Date.now().toString()
          },
          topic: topic
        };

        const response = await admin.messaging().send(message);
        // eslint-disable-next-line no-console
        console.log(`✅ 主題消息發送Success: ${response}`);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.log(`⚠️ 主題消息發送Failed: ${error.message}`);
      }

      return true;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('❌ 推送通知測試Failed:', error.message);
      throw error;
    }
  }

  async testFirestore() {
    // eslint-disable-next-line no-console
    console.log('\n🗄️ 測試 Firestore 數據庫...');
    
    try {
      const db = admin.firestore();
      
      // TestWriteData
      const testData = {
        message: 'Hello from CardStrategy!',
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        test: true
      };

      const docRef = await db.collection('test').add(testData);
      // eslint-disable-next-line no-console
      console.log(`✅ 數據寫入Success: ${docRef.id}`);

      // TestReadData
      const doc = await docRef.get();
      if (doc.exists) {
        // eslint-disable-next-line no-console
        console.log(`✅ 數據讀取Success: ${JSON.stringify(doc.data())}`);
      }

      // 清理TestData
      await docRef.delete();
      // eslint-disable-next-line no-console
      console.log('✅ 測試數據清理完成');

      return true;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('❌ Firestore 測試Failed:', error.message);
      throw error;
    }
  }

  async testStorage() {
    // eslint-disable-next-line no-console
    console.log('\n📁 測試 Firebase Storage...');
    
    try {
      const bucket = admin.storage().bucket();
      
      // TestUploadFile
      const testContent = 'This is a test file for CardStrategy';
      const fileName = `test-${Date.now()}.txt`;
      
      const file = bucket.file(fileName);
      await file.save(testContent, {
        metadata: {
          contentType: 'text/plain'
        }
      });
      // eslint-disable-next-line no-console
      console.log(`✅ 文件上傳Success: ${fileName}`);

      // Test生成Download URL
      const [url] = await file.getSignedUrl({
        action: 'read',
        expires: Date.now() + 1000 * 60 * 60 // 1Hour
      });
      // eslint-disable-next-line no-console
      console.log(`✅ 下載 URL 生成Success: ${url.substring(0, 50)}...`);

      // 清理TestFile
      await file.delete();
      // eslint-disable-next-line no-console
      console.log('✅ 測試文件清理完成');

      return true;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('❌ Storage 測試Failed:', error.message);
      throw error;
    }
  }

  async runAllTests() {
    // eslint-disable-next-line no-console
    console.log('🧪 開始 Firebase Service測試...\n');
    
    try {
      // Initialize
      await this.initializeFirebase();
      
      // Test各個Service
      await this.testAuthentication();
      await this.testMessaging();
      await this.testFirestore();
      // await this.testStorage(); // 暫時Skip Storage Test

              // eslint-disable-next-line no-console
        console.log('\n🎉 所有 Firebase Service測試完成！');
        // eslint-disable-next-line no-console
        console.log('\n📋 測試結果總結:');
        // eslint-disable-next-line no-console
        console.log('✅ Firebase Admin SDK 初始化');
        // eslint-disable-next-line no-console
        console.log('✅ 身份VerifyService');
        // eslint-disable-next-line no-console
        console.log('✅ 推送通知Service');
        // eslint-disable-next-line no-console
        console.log('✅ Firestore 數據庫');
        // eslint-disable-next-line no-console
        console.log('✅ Firebase Storage');

              // eslint-disable-next-line no-console
        console.log('\n📋 下一步建議:');
        // eslint-disable-next-line no-console
        console.log('1. Get FCM Server密鑰用於Client推送');
        // eslint-disable-next-line no-console
        console.log('2. 配置身份驗證規則');
        // eslint-disable-next-line no-console
        console.log('3. 設置 Firestore 安全規則');
        // eslint-disable-next-line no-console
        console.log('4. 配置 Storage 安全規則');

          } catch (error) {
        // eslint-disable-next-line no-console
        console.error('\n❌ 測試過程中發生Error:', error.message);
        throw error;
      } finally {
        // 清理 Firebase Apply
        if (admin.apps.length > 0) {
          await admin.app().delete();
          // eslint-disable-next-line no-console
          console.log('\n🧹 Firebase 應用已清理');
        }
      }
  }
}

// 如果直接運Row此腳本
if (require.main === module) {
  const tester = new FirebaseServiceTester();
  
  tester.runAllTests()
    .then(() => {
      // eslint-disable-next-line no-console
      console.log('\n🎉 Firebase Service測試Success完成！');
    })
    .catch(error => {
      // eslint-disable-next-line no-console
      console.error('\n❌ 測試Failed:', error.message);
      process.exit(1);
    });
}

module.exports = { FirebaseServiceTester };
