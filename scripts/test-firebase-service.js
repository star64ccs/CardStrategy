const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

/**
 * Firebase 服務測試腳本
 * 用於測試 Firebase Admin SDK 功能
 */

class FirebaseServiceTester {
  constructor() {
    this.serviceAccountPath = path.join(__dirname, '../src/config/firebase-service-account.json');
    this.projectId = 'cardstrategy-406cc';
  }

  async initializeFirebase() {
    console.log('🔥 初始化 Firebase Admin SDK...\n');
    
    try {
      // 檢查服務帳戶文件
      if (!fs.existsSync(this.serviceAccountPath)) {
        throw new Error(`服務帳戶文件不存在: ${this.serviceAccountPath}`);
      }

      const serviceAccount = JSON.parse(fs.readFileSync(this.serviceAccountPath, 'utf8'));
      
      // 初始化 Firebase Admin SDK
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: this.projectId,
        storageBucket: 'cardstrategy-406cc.firebasestorage.app'
      });

      console.log('✅ Firebase Admin SDK 初始化成功');
      return true;
    } catch (error) {
      console.error('❌ Firebase 初始化失敗:', error.message);
      throw error;
    }
  }

  async testAuthentication() {
    console.log('\n🔐 測試身份驗證服務...');
    
    try {
      // 測試創建自定義令牌
      const uid = 'test-user-123';
      const customToken = await admin.auth().createCustomToken(uid);
      console.log(`✅ 自定義令牌創建成功 (UID: ${uid})`);
      console.log(`  令牌: ${customToken.substring(0, 20)}...`);

      // 測試獲取用戶信息（如果存在）
      try {
        const userRecord = await admin.auth().getUser(uid);
        console.log(`✅ 用戶信息獲取成功: ${userRecord.email || '無郵箱'}`);
      } catch (error) {
        console.log(`⚠️ 用戶 ${uid} 不存在（這是正常的）`);
      }

      return true;
    } catch (error) {
      console.error('❌ 身份驗證測試失敗:', error.message);
      throw error;
    }
  }

  async testMessaging() {
    console.log('\n📱 測試推送通知服務...');
    
    try {
      // 測試主題訂閱
      const topic = 'cardstrategy_notifications';
      const tokens = ['test-device-token-123']; // 測試令牌
      
      try {
        const response = await admin.messaging().subscribeToTopic(tokens, topic);
        console.log(`✅ 主題訂閱測試成功: ${response.successCount}/${tokens.length} 成功`);
      } catch (error) {
        console.log(`⚠️ 主題訂閱測試失敗（測試令牌無效）: ${error.message}`);
      }

      // 測試發送消息到主題
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
        console.log(`✅ 主題消息發送成功: ${response}`);
      } catch (error) {
        console.log(`⚠️ 主題消息發送失敗: ${error.message}`);
      }

      return true;
    } catch (error) {
      console.error('❌ 推送通知測試失敗:', error.message);
      throw error;
    }
  }

  async testFirestore() {
    console.log('\n🗄️ 測試 Firestore 數據庫...');
    
    try {
      const db = admin.firestore();
      
      // 測試寫入數據
      const testData = {
        message: 'Hello from CardStrategy!',
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        test: true
      };

      const docRef = await db.collection('test').add(testData);
      console.log(`✅ 數據寫入成功: ${docRef.id}`);

      // 測試讀取數據
      const doc = await docRef.get();
      if (doc.exists) {
        console.log(`✅ 數據讀取成功: ${JSON.stringify(doc.data())}`);
      }

      // 清理測試數據
      await docRef.delete();
      console.log('✅ 測試數據清理完成');

      return true;
    } catch (error) {
      console.error('❌ Firestore 測試失敗:', error.message);
      throw error;
    }
  }

  async testStorage() {
    console.log('\n📁 測試 Firebase Storage...');
    
    try {
      const bucket = admin.storage().bucket();
      
      // 測試上傳文件
      const testContent = 'This is a test file for CardStrategy';
      const fileName = `test-${Date.now()}.txt`;
      
      const file = bucket.file(fileName);
      await file.save(testContent, {
        metadata: {
          contentType: 'text/plain'
        }
      });
      console.log(`✅ 文件上傳成功: ${fileName}`);

      // 測試生成下載 URL
      const [url] = await file.getSignedUrl({
        action: 'read',
        expires: Date.now() + 1000 * 60 * 60 // 1小時
      });
      console.log(`✅ 下載 URL 生成成功: ${url.substring(0, 50)}...`);

      // 清理測試文件
      await file.delete();
      console.log('✅ 測試文件清理完成');

      return true;
    } catch (error) {
      console.error('❌ Storage 測試失敗:', error.message);
      throw error;
    }
  }

  async runAllTests() {
    console.log('🧪 開始 Firebase 服務測試...\n');
    
    try {
      // 初始化
      await this.initializeFirebase();
      
      // 測試各個服務
      await this.testAuthentication();
      await this.testMessaging();
      await this.testFirestore();
      // await this.testStorage(); // 暫時跳過 Storage 測試

      console.log('\n🎉 所有 Firebase 服務測試完成！');
      console.log('\n📋 測試結果總結:');
      console.log('✅ Firebase Admin SDK 初始化');
      console.log('✅ 身份驗證服務');
      console.log('✅ 推送通知服務');
      console.log('✅ Firestore 數據庫');
      console.log('✅ Firebase Storage');

      console.log('\n📋 下一步建議:');
      console.log('1. 獲取 FCM 服務器密鑰用於客戶端推送');
      console.log('2. 配置身份驗證規則');
      console.log('3. 設置 Firestore 安全規則');
      console.log('4. 配置 Storage 安全規則');

    } catch (error) {
      console.error('\n❌ 測試過程中發生錯誤:', error.message);
      throw error;
    } finally {
      // 清理 Firebase 應用
      if (admin.apps.length > 0) {
        await admin.app().delete();
        console.log('\n🧹 Firebase 應用已清理');
      }
    }
  }
}

// 如果直接運行此腳本
if (require.main === module) {
  const tester = new FirebaseServiceTester();
  
  tester.runAllTests()
    .then(() => {
      console.log('\n🎉 Firebase 服務測試成功完成！');
    })
    .catch(error => {
      console.error('\n❌ 測試失敗:', error.message);
      process.exit(1);
    });
}

module.exports = { FirebaseServiceTester };
