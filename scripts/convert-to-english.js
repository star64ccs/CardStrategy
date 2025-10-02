#!/usr/bin/env node

/**
 * Convert Chinese comments and strings to English
 * Batch conversion script for code internationalization
 */

const fs = require('fs');
const path = require('path');

console.log('🌐 Converting Chinese to English...\n');

// Common Chinese to English translations for code
const translations = {
  // Comments
  '初始化': 'Initialize',
  '檢查': 'Check',
  '驗證': 'Validate',
  '創建': 'Create',
  '更新': 'Update',
  '刪除': 'Delete',
  '獲取': 'Get',
  '設置': 'Set',
  '配置': 'Configure',
  '處理': 'Process',
  'Connect': 'Connect',
  '斷開': 'Disconnect',
  'Success': 'Success',
  'Failed': 'Failed',
  'Error': 'Error',
  '警告': 'Warning',
  '信息': 'Info',
  '調試': 'Debug',
  '客戶端': 'Client',
  'Server': 'Server',
  'Service': 'Service',
  '數據庫': 'Database',
  '緩存': 'Cache',
  '隊列': 'Queue',
  '任務': 'Task',
  '操作': 'Operation',
  '批量': 'Batch',
  '單個': 'Single',
  '多個': 'Multiple',
  '全部': 'All',
  '部分': 'Partial',
  '完成': 'Complete',
  '進行中': 'In Progress',
  '等待': 'Waiting',
  '暫停': 'Paused',
  '取消': 'Cancelled',
  '重試': 'Retry',
  '跳過': 'Skip',
  '忽略': 'Ignore',
  '返回': 'Return',
  '發送': 'Send',
  '接收': 'Receive',
  '保存': 'Save',
  '載入': 'Load',
  '讀取': 'Read',
  '寫入': 'Write',
  '查詢': 'Query',
  '搜索': 'Search',
  '過濾': 'Filter',
  '排序': 'Sort',
  '分頁': 'Paginate',
  '限制': 'Limit',
  '偏移': 'Offset',
  '計數': 'Count',
  '統計': 'Statistics',
  '分析': 'Analysis',
  '報告': 'Report',
  '日誌': 'Log',
  '記錄': 'Record',
  '追蹤': 'Trace',
  '監控': 'Monitor',
  '測試': 'Test',
  '驗收': 'Acceptance',
  '部署': 'Deploy',
  '構建': 'Build',
  '編譯': 'Compile',
  '打包': 'Package',
  '發布': 'Release',
  '版本': 'Version',
  '分支': 'Branch',
  '合併': 'Merge',
  '提交': 'Commit',
  '推送': 'Push',
  '拉取': 'Pull',
  '克隆': 'Clone',
  '復制': 'Copy',
  '移動': 'Move',
  '重命名': 'Rename',
  '替換': 'Replace',
  '轉換': 'Convert',
  '格式化': 'Format',
  '解析': 'Parse',
  '編碼': 'Encode',
  '解碼': 'Decode',
  '加密': 'Encrypt',
  '解密': 'Decrypt',
  '簽名': 'Sign',
  '驗證': 'Verify',
  '授權': 'Authorize',
  '認證': 'Authenticate',
  '登錄': 'Login',
  '註冊': 'Register',
  '註銷': 'Logout',
  '重置': 'Reset',
  '恢復': 'Restore',
  '備份': 'Backup',
  '還原': 'Restore',
  '同步': 'Sync',
  '異步': 'Async',
  '並發': 'Concurrent',
  '並行': 'Parallel',
  '串行': 'Serial',
  '線程': 'Thread',
  '進程': 'Process',
  '內存': 'Memory',
  '存儲': 'Storage',
  '磁盤': 'Disk',
  '網絡': 'Network',
  '協議': 'Protocol',
  '端口': 'Port',
  '地址': 'Address',
  '域名': 'Domain',
  '路徑': 'Path',
  '文件': 'File',
  '目錄': 'Directory',
  '文件夾': 'Folder',
  '資源': 'Resource',
  '資產': 'Asset',
  '內容': 'Content',
  '數據': 'Data',
  '信息': 'Information',
  '消息': 'Message',
  '通知': 'Notification',
  '警報': 'Alert',
  '事件': 'Event',
  '狀態': 'Status',
  '條件': 'Condition',
  '參數': 'Parameter',
  '變量': 'Variable',
  '常量': 'Constant',
  '屬性': 'Property',
  '方法': 'Method',
  '函數': 'Function',
  '類': 'Class',
  '對象': 'Object',
  '實例': 'Instance',
  '模塊': 'Module',
  '包': 'Package',
  '庫': 'Library',
  '框架': 'Framework',
  '工具': 'Tool',
  '插件': 'Plugin',
  '擴展': 'Extension',
  '組件': 'Component',
  '元素': 'Element',
  '節點': 'Node',
  '樹': 'Tree',
  '圖': 'Graph',
  '列表': 'List',
  '數組': 'Array',
  '集合': 'Set',
  '映射': 'Map',
  '字典': 'Dictionary',
  '表': 'Table',
  '行': 'Row',
  '列': 'Column',
  '字段': 'Field',
  '鍵': 'Key',
  '值': 'Value',
  '索引': 'Index',
  '標識符': 'Identifier',
  '標籤': 'Tag',
  '標記': 'Mark',
  '標誌': 'Flag',
  '類型': 'Type',
  '接口': 'Interface',
  '抽象': 'Abstract',
  '具體': 'Concrete',
  '公共': 'Public',
  '私有': 'Private',
  '受保護': 'Protected',
  '靜態': 'Static',
  '動態': 'Dynamic',
  '本地': 'Local',
  '全局': 'Global',
  '外部': 'External',
  '內部': 'Internal',
  '上級': 'Parent',
  '下級': 'Child',
  '祖先': 'Ancestor',
  '後代': 'Descendant',
  '兄弟': 'Sibling',
  '根': 'Root',
  '葉': 'Leaf',
  '頂部': 'Top',
  '底部': 'Bottom',
  '開始': 'Start',
  '結束': 'End',
  '開始': 'Begin',
  '停止': 'Stop',
  '暫停': 'Pause',
  '繼續': 'Continue',
  '重啟': 'Restart',
  '刷新': 'Refresh',
  '重新': 'Re',
  '自動': 'Auto',
  '手動': 'Manual',
  '強制': 'Force',
  '可選': 'Optional',
  '必需': 'Required',
  '默認': 'Default',
  '自定義': 'Custom',
  '標準': 'Standard',
  '特殊': 'Special',
  '通用': 'Generic',
  '特定': 'Specific',
  '唯一': 'Unique',
  '重複': 'Duplicate',
  '空': 'Empty',
  '空值': 'Null',
  '未定義': 'Undefined',
  '真': 'True',
  '假': 'False',
  '是': 'Yes',
  '否': 'No',
  '開': 'On',
  '關': 'Off',
  '啟用': 'Enable',
  '禁用': 'Disable',
  '激活': 'Activate',
  '停用': 'Deactivate',
  '允許': 'Allow',
  '禁止': 'Deny',
  '拒絕': 'Reject',
  '接受': 'Accept',
  '同意': 'Agree',
  '不同意': 'Disagree',
  '確認': 'Confirm',
  '取消': 'Cancel',
  '確定': 'OK',
  '應用': 'Apply',
  '提交': 'Submit',
  '發送': 'Send',
  '接收': 'Receive',
  '上傳': 'Upload',
  '下載': 'Download',
  '導入': 'Import',
  '導出': 'Export',
  '輸入': 'Input',
  '輸出': 'Output',
  '請求': 'Request',
  '響應': 'Response',
  '回調': 'Callback',
  '承諾': 'Promise',
  '異步': 'Async',
  '等待': 'Await',
  '解決': 'Resolve',
  '拒絕': 'Reject',
  '捕獲': 'Catch',
  '拋出': 'Throw',
  '處理': 'Handle',
  '管理': 'Manage',
  '控制': 'Control',
  '調度': 'Schedule',
  '執行': 'Execute',
  '運行': 'Run',
  '啟動': 'Start',
  '停止': 'Stop',
  '退出': 'Exit',
  '關閉': 'Close',
  '打開': 'Open',
  '顯示': 'Show',
  '隱藏': 'Hide',
  '切換': 'Toggle',
  '切換': 'Switch',
  '改變': 'Change',
  '修改': 'Modify',
  '編輯': 'Edit',
  '添加': 'Add',
  '移除': 'Remove',
  '插入': 'Insert',
  '刪除': 'Delete',
  '清除': 'Clear',
  '清空': 'Empty',
  '重置': 'Reset',
  '恢復': 'Restore',
  '復原': 'Undo',
  '重做': 'Redo',
  '復制': 'Copy',
  '粘貼': 'Paste',
  '剪切': 'Cut',
  '選擇': 'Select',
  '全選': 'Select All',
  '取消選擇': 'Deselect',
  '查找': 'Find',
  '替換': 'Replace',
  '搜索': 'Search',
  '過濾': 'Filter',
  '排序': 'Sort',
  '分組': 'Group',
  '分類': 'Category',
  '標記': 'Mark',
  '標籤': 'Tag',
  '註釋': 'Comment',
  '說明': 'Description',
  '描述': 'Description',
  '文檔': 'Documentation',
  '幫助': 'Help',
  '支持': 'Support',
  '關於': 'About',
  '版本': 'Version',
  '更新': 'Update',
  '升級': 'Upgrade',
  '降級': 'Downgrade',
  '安裝': 'Install',
  '卸載': 'Uninstall',
  '配置': 'Configure',
  '設置': 'Settings',
  '選項': 'Options',
  '偏好': 'Preferences',
  '主題': 'Theme',
  '語言': 'Language',
  '地區': 'Locale',
  '時區': 'Timezone',
  '日期': 'Date',
  '時間': 'Time',
  '年份': 'Year',
  '月份': 'Month',
  '日期': 'Day',
  '小時': 'Hour',
  '分鐘': 'Minute',
  '秒': 'Second',
  '毫秒': 'Millisecond',
  '微秒': 'Microsecond',
  '納秒': 'Nanosecond',
  '今天': 'Today',
  '昨天': 'Yesterday',
  '明天': 'Tomorrow',
  '本週': 'This Week',
  '上週': 'Last Week',
  '下週': 'Next Week',
  '本月': 'This Month',
  '上月': 'Last Month',
  '下月': 'Next Month',
  '今年': 'This Year',
  '去年': 'Last Year',
  '明年': 'Next Year',
  '用戶': 'User',
  '用戶名': 'Username',
  '密碼': 'Password',
  '郵箱': 'Email',
  '電話': 'Phone',
  '地址': 'Address',
  '姓名': 'Name',
  '性別': 'Gender',
  '年齡': 'Age',
  '生日': 'Birthday',
  '國家': 'Country',
  '城市': 'City',
  '省': 'Province',
  '區': 'District',
  '街道': 'Street',
  '郵編': 'Postal Code',
  '身份證': 'ID Card',
  '護照': 'Passport',
  '駕駛證': 'Driver License',
  '銀行卡': 'Bank Card',
  '信用卡': 'Credit Card',
  '支付寶': 'Alipay',
  '微信': 'WeChat',
  'QQ': 'QQ',
  '微博': 'Weibo',
  'Facebook': 'Facebook',
  'Twitter': 'Twitter',
  'Instagram': 'Instagram',
  'LinkedIn': 'LinkedIn',
  'GitHub': 'GitHub',
  'GitLab': 'GitLab',
  'Bitbucket': 'Bitbucket',
  'Jira': 'Jira',
  'Confluence': 'Confluence',
  'Slack': 'Slack',
  'Discord': 'Discord',
  'Telegram': 'Telegram',
  'WhatsApp': 'WhatsApp',
  'Line': 'Line',
  'Skype': 'Skype',
  'Zoom': 'Zoom',
  'Teams': 'Teams',
  'Meet': 'Meet',
  'Hangouts': 'Hangouts',
  'Calendar': 'Calendar',
  'Gmail': 'Gmail',
  'Outlook': 'Outlook',
  'Yahoo': 'Yahoo',
  'Hotmail': 'Hotmail',
  'iCloud': 'iCloud',
  'Dropbox': 'Dropbox',
  'Google Drive': 'Google Drive',
  'OneDrive': 'OneDrive',
  'Box': 'Box',
  'AWS': 'AWS',
  'Azure': 'Azure',
  'GCP': 'GCP',
  'DigitalOcean': 'DigitalOcean',
  'Heroku': 'Heroku',
  'Netlify': 'Netlify',
  'Vercel': 'Vercel',
  'Render': 'Render',
  'Railway': 'Railway',
  'Fly.io': 'Fly.io',
  'Supabase': 'Supabase',
  'Firebase': 'Firebase',
  'MongoDB': 'MongoDB',
  'PostgreSQL': 'PostgreSQL',
  'MySQL': 'MySQL',
  'Redis': 'Redis',
  'Elasticsearch': 'Elasticsearch',
  'Docker': 'Docker',
  'Kubernetes': 'Kubernetes',
  'Jenkins': 'Jenkins',
  'GitHub Actions': 'GitHub Actions',
  'GitLab CI': 'GitLab CI',
  'Travis CI': 'Travis CI',
  'CircleCI': 'CircleCI',
  'Netlify': 'Netlify',
  'Vercel': 'Vercel',
  'Heroku': 'Heroku',
  'Railway': 'Railway',
  'Fly.io': 'Fly.io',
  'Supabase': 'Supabase',
  'Firebase': 'Firebase',
  'AWS': 'AWS',
  'Azure': 'Azure',
  'GCP': 'GCP',
  'DigitalOcean': 'DigitalOcean',
  'MongoDB': 'MongoDB',
  'PostgreSQL': 'PostgreSQL',
  'MySQL': 'MySQL',
  'Redis': 'Redis',
  'Elasticsearch': 'Elasticsearch',
  'Docker': 'Docker',
  'Kubernetes': 'Kubernetes',
  'Jenkins': 'Jenkins',
  'GitHub Actions': 'GitHub Actions',
  'GitLab CI': 'GitLab CI',
  'Travis CI': 'Travis CI',
  'CircleCI': 'CircleCI'
};

// Function to convert Chinese comments to English
function convertChineseToEnglish(content) {
  let converted = content;
  
  // Convert common Chinese patterns
  for (const [chinese, english] of Object.entries(translations)) {
    // Convert in comments (// and /* */)
    const commentPattern = new RegExp(`(//.*|/\\*[\\s\\S]*?\\*/)`, 'g');
    converted = converted.replace(commentPattern, (match) => {
      return match.replace(new RegExp(chinese, 'g'), english);
    });
    
    // Convert in string literals (but be careful with user-facing strings)
    const stringPattern = /(['"`])(.*?)\1/g;
    converted = converted.replace(stringPattern, (match, quote, str) => {
      // Only convert technical/log messages, not user-facing strings
      if (str.includes('Service') || str.includes('Connect') || str.includes('Success') || str.includes('Failed') || str.includes('Error')) {
        return quote + str.replace(new RegExp(chinese, 'g'), english) + quote;
      }
      return match;
    });
  }
  
  return converted;
}

// Function to process a single file
function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const converted = convertChineseToEnglish(content);
    
    if (content !== converted) {
      fs.writeFileSync(filePath, converted, 'utf8');
      console.log(`✅ Converted: ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Function to recursively process directory
function processDirectory(dirPath) {
  const files = fs.readdirSync(dirPath);
  let convertedCount = 0;
  
  files.forEach(file => {
    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Skip node_modules and other common directories
      if (!['node_modules', '.git', 'dist', 'build', 'coverage'].includes(file)) {
        convertedCount += processDirectory(filePath);
      }
    } else if (stat.isFile()) {
      // Process JavaScript, TypeScript, and other code files
      const ext = path.extname(file);
      if (['.js', '.ts', '.jsx', '.tsx', '.vue', '.json'].includes(ext)) {
        if (processFile(filePath)) {
          convertedCount++;
        }
      }
    }
  });
  
  return convertedCount;
}

// Main execution
function main() {
  try {
    const directories = ['backend/src', 'src', 'scripts'];
    let totalConverted = 0;
    
    directories.forEach(dir => {
      if (fs.existsSync(dir)) {
        console.log(`📁 Processing directory: ${dir}`);
        const converted = processDirectory(dir);
        totalConverted += converted;
        console.log(`   Converted ${converted} files\n`);
      }
    });
    
    console.log(`🎉 Conversion complete!`);
    console.log(`📊 Total files converted: ${totalConverted}`);
    console.log(`\n⚠️  Note: User-facing strings should be moved to i18n files`);
    console.log(`📝 Manual review recommended for user interface text`);
    
  } catch (error) {
    console.error('❌ Conversion failed:', error.message);
    process.exit(1);
  }
}

// Execute if called directly
if (require.main === module) {
  main();
}

module.exports = { convertChineseToEnglish, processFile, processDirectory };
