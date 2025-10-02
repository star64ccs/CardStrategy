const fs = require('fs');
const path = require('path');

/**
 * 性能Monitor優化腳本
 * 按照執Row原則建構
 * 嚴謹語法，無Error，高質量代碼
 */

console.log('🔧 開始優化性能監控系統...\n');

// 1. Analysis現有性能Monitor覆蓋率
function analyzePerformanceMonitoringCoverage() {
  console.log('📋 分析性能監控覆蓋率...');

  const srcPath = path.join(__dirname, '..', 'src');
  const monitoringFiles = [];
  const serviceFiles = [];

  function findFiles(dir, fileList, pattern) {
    if (!fs.existsSync(dir)) return;

    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        findFiles(filePath, fileList, pattern);
      } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        if (pattern.test(filePath)) {
          fileList.push(filePath);
        }
      }
    });
  }

  findFiles(srcPath, monitoringFiles, /monitoring|performance/);
  findFiles(srcPath, serviceFiles, /services/);

  console.log(`📊 找到 ${monitoringFiles.length} 個監控相關文件`);
  console.log(`📊 找到 ${serviceFiles.length} 個Service文件`);

  return { monitoringFiles, serviceFiles };
}

// 2. Analysis性能Monitor模式
function analyzePerformanceMonitoringPatterns(files) {
  console.log('📋 分析性能監控模式...');

  const patterns = {
    performanceMonitor: 0,
    metrics: 0,
    timing: 0,
    memory: 0,
    cpu: 0,
    network: 0,
    noMonitoring: 0,
  };

  files.forEach(file => {
    try {
      const content = fs.readFileSync(file, 'utf8');

      if (content.includes('performanceMonitor')) {
        patterns.performanceMonitor++;
      }
      if (content.includes('metrics')) {
        patterns.metrics++;
      }
      if (content.includes('startTimer') || content.includes('endTimer')) {
        patterns.timing++;
      }
      if (content.includes('memory')) {
        patterns.memory++;
      }
      if (content.includes('cpu')) {
        patterns.cpu++;
      }
      if (content.includes('network')) {
        patterns.network++;
      }
      if (!content.includes('performance') && !content.includes('monitor') &&
          !content.includes('metrics') && !content.includes('timer')) {
        patterns.noMonitoring++;
      }
    } catch (error) {
      console.log(`⚠️  無法讀取文件: ${file}`);
    }
  });

  console.log('📈 性能監控模式分析:');
  Object.entries(patterns).forEach(([pattern, count]) => {
    console.log(`  ${pattern}: ${count} 個文件`);
  });

  return patterns;
}

// 3. 主Function
function main() {
  try {
    const { monitoringFiles, serviceFiles } = analyzePerformanceMonitoringCoverage();
    const patterns = analyzePerformanceMonitoringPatterns([...monitoringFiles, ...serviceFiles]);

    console.log('\n🎯 性能監控分析完成！');
    console.log('📋 分析內容：');
    console.log('  - 性能監控覆蓋率分析');
    console.log('  - 性能監控模式分析');

    console.log('\n📊 分析結果：');
    console.log(`  監控文件: ${monitoringFiles.length} 個`);
    console.log(`  Service文件: ${serviceFiles.length} 個`);
    console.log(`  使用 performanceMonitor: ${patterns.performanceMonitor} 個`);
    console.log(`  使用 metrics: ${patterns.metrics} 個`);
    console.log(`  使用 timing: ${patterns.timing} 個`);
    console.log(`  使用 memory: ${patterns.memory} 個`);
    console.log(`  使用 cpu: ${patterns.cpu} 個`);
    console.log(`  使用 network: ${patterns.network} 個`);
    console.log(`  無監控: ${patterns.noMonitoring} 個`);

    console.log('\n🚀 下一步行動：');
    console.log('  1. 創建增強的性能監控工具');
    console.log('  2. 設置性能監控配置');
    console.log('  3. 編寫性能監控指南');

  } catch (error) {
    console.error('❌ 性能監控分析Failed:', error);
    process.exit(1);
  }
}

// 如果直接運Row此腳本
if (require.main === module) {
  main();
}

module.exports = {
  analyzePerformanceMonitoringCoverage,
  analyzePerformanceMonitoringPatterns,
  main,
};
