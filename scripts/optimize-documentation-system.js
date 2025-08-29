const fs = require('fs');
const path = require('path');

/**
 * 文檔系統優化腳本
 * 按照執行原則建構
 * 嚴謹語法，無錯誤，高質量代碼
 */

console.log('🔧 開始優化文檔系統...\n');

// 1. 分析現有文檔結構
function analyzeDocumentationStructure() {
  console.log('📋 分析現有文檔結構...');

  const docsPath = path.join(__dirname, '..', 'docs');
  const files = [];
  const directories = [];

  function scanDirectory(dir, level = 0) {
    if (!fs.existsSync(dir)) return;

    const items = fs.readdirSync(dir);
    items.forEach(item => {
      const itemPath = path.join(dir, item);
      const stat = fs.statSync(itemPath);
      const relativePath = path.relative(docsPath, itemPath);

      if (stat.isDirectory()) {
        directories.push({
          path: relativePath,
          level,
          name: item,
        });
        scanDirectory(itemPath, level + 1);
      } else if (item.endsWith('.md')) {
        files.push({
          path: relativePath,
          name: item,
          size: stat.size,
          modified: stat.mtime,
        });
      }
    });
  }

  scanDirectory(docsPath);

  console.log(`📊 找到 ${files.length} 個文檔文件`);
  console.log(`📊 找到 ${directories.length} 個文檔目錄`);

  return { files, directories };
}

// 2. 分析文檔內容質量
function analyzeDocumentationQuality(files) {
  console.log('📋 分析文檔內容質量...');

  const qualityMetrics = {
    totalFiles: files.length,
    totalSize: 0,
    averageSize: 0,
    categories: {
      guides: 0,
      reports: 0,
      apis: 0,
      setup: 0,
      maintenance: 0,
      other: 0,
    },
    lastModified: {
      recent: 0, // 7天內
      recentMonth: 0, // 30天內
      old: 0, // 超過30天
    },
  };

  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  files.forEach(file => {
    qualityMetrics.totalSize += file.size;

    // 分類文檔
    const fileName = file.name.toLowerCase();
    if (fileName.includes('guide') || fileName.includes('manual')) {
      qualityMetrics.categories.guides++;
    } else if (fileName.includes('report') || fileName.includes('summary')) {
      qualityMetrics.categories.reports++;
    } else if (fileName.includes('api')) {
      qualityMetrics.categories.apis++;
    } else if (fileName.includes('setup') || fileName.includes('install')) {
      qualityMetrics.categories.setup++;
    } else if (fileName.includes('maintenance') || fileName.includes('standard')) {
      qualityMetrics.categories.maintenance++;
    } else {
      qualityMetrics.categories.other++;
    }

    // 檢查修改時間
    if (file.modified > sevenDaysAgo) {
      qualityMetrics.lastModified.recent++;
    } else if (file.modified > thirtyDaysAgo) {
      qualityMetrics.lastModified.recentMonth++;
    } else {
      qualityMetrics.lastModified.old++;
    }
  });

  qualityMetrics.averageSize = qualityMetrics.totalSize / qualityMetrics.totalFiles;

  console.log('📈 文檔質量分析:');
  console.log(`  總文件數: ${qualityMetrics.totalFiles}`);
  console.log(`  總大小: ${(qualityMetrics.totalSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`  平均大小: ${(qualityMetrics.averageSize / 1024).toFixed(2)} KB`);

  console.log('\n📂 文檔分類:');
  Object.entries(qualityMetrics.categories).forEach(([category, count]) => {
    console.log(`  ${category}: ${count} 個文件`);
  });

  console.log('\n📅 修改時間:');
  console.log(`  最近7天: ${qualityMetrics.lastModified.recent} 個文件`);
  console.log(`  最近30天: ${qualityMetrics.lastModified.recentMonth} 個文件`);
  console.log(`  超過30天: ${qualityMetrics.lastModified.old} 個文件`);

  return qualityMetrics;
}

// 3. 主函數
function main() {
  try {
    const { files, directories } = analyzeDocumentationStructure();
    const qualityMetrics = analyzeDocumentationQuality(files);

    console.log('\n🎯 文檔系統分析完成！');
    console.log('📋 分析內容：');
    console.log('  - 文檔結構分析');
    console.log('  - 文檔質量分析');

    console.log('\n📊 分析結果：');
    console.log(`  文檔文件: ${qualityMetrics.totalFiles} 個`);
    console.log(`  總大小: ${(qualityMetrics.totalSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`  平均大小: ${(qualityMetrics.averageSize / 1024).toFixed(2)} KB`);

    console.log('\n📂 文檔分類：');
    Object.entries(qualityMetrics.categories).forEach(([category, count]) => {
      console.log(`  ${category}: ${count} 個文件`);
    });

    console.log('\n📅 更新狀態：');
    console.log(`  最近7天: ${qualityMetrics.lastModified.recent} 個文件`);
    console.log(`  最近30天: ${qualityMetrics.lastModified.recentMonth} 個文件`);
    console.log(`  超過30天: ${qualityMetrics.lastModified.old} 個文件`);

    console.log('\n🚀 下一步行動：');
    console.log('  1. 創建文檔索引');
    console.log('  2. 建立文檔模板');
    console.log('  3. 更新文檔標準');

  } catch (error) {
    console.error('❌ 文檔系統分析失敗:', error);
    process.exit(1);
  }
}

// 如果直接運行此腳本
if (require.main === module) {
  main();
}

module.exports = {
  analyzeDocumentationStructure,
  analyzeDocumentationQuality,
  main,
};
