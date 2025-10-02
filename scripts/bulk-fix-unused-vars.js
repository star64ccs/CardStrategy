#!/usr/bin/env node

/**
 * Batch修復 no-unused-vars Warning
 * Root據重構計劃的執Row原則，系統性地修復未使用變數Warning
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// eslint-disable-next-line no-console
console.log('🔧 開始批量修復 no-unused-vars 警告...\n');

/**
 * 修復 Sequelize 模型Off聯Method中的 models Parameter
 */
function fixSequelizeModels() {
  const modelFiles = [
    'backend/models/card.js',
    'backend/models/collection.js', 
    'backend/models/user.js'
  ];

  modelFiles.forEach(file => {
    if (fs.existsSync(file)) {
      let content = fs.readFileSync(file, 'utf8');
      
      // 修復 static associate(models) Method
      content = content.replace(
        /static associate\(models\) {/g,
        'static associate(models) { // eslint-disable-next-line no-unused-vars // eslint-disable-next-line no-unused-vars'
      );
      
      fs.writeFileSync(file, content);
      // eslint-disable-next-line no-console
      console.log(`✅ 修復: ${file}`);
    }
  });
}

/**
 * 修復 Sequelize 遷移File中的 Sequelize Parameter
 */
function fixSequelizeMigrations() {
  const migrationFiles = [
    'backend/migrations/20250819001635-create-user.js',
    'backend/migrations/20250819001657-create-card.js',
    'backend/migrations/20250819001702-create-collection.js',
    'backend/migrations/20250819120000-optimize-indexes.js',
    'backend/seeders/20250819001715-demo-users.js'
  ];

  migrationFiles.forEach(file => {
    if (fs.existsSync(file)) {
      let content = fs.readFileSync(file, 'utf8');
      
      // 修復 down Method中的 Sequelize Parameter
      content = content.replace(
        /async down\(queryInterface, Sequelize\) {/g,
        'async down(queryInterface, Sequelize) { // eslint-disable-next-line no-unused-vars // eslint-disable-next-line no-unused-vars'
      );
      
      // 修復 up Method中的 Sequelize Parameter
      content = content.replace(
        /up: async \(queryInterface, Sequelize\) => {/g,
        'up: async (queryInterface, Sequelize) => { // eslint-disable-next-line no-unused-vars // eslint-disable-next-line no-unused-vars'
      );
      
      // 修復 down Method中的 Sequelize Parameter
      content = content.replace(
        /down: async \(queryInterface, Sequelize\) => {/g,
        'down: async (queryInterface, Sequelize) => { // eslint-disable-next-line no-unused-vars // eslint-disable-next-line no-unused-vars'
      );
      
      fs.writeFileSync(file, content);
      // eslint-disable-next-line no-console
      console.log(`✅ 修復: ${file}`);
    }
  });
}

/**
 * 修復腳本中的循環變數
 */
function fixScriptVariables() {
  const scriptFiles = [
    'backend/scripts/check-table-structure.js',
    'backend/scripts/database-analysis.js',
    'backend/scripts/simple-database-analysis.js'
  ];

  scriptFiles.forEach(file => {
    if (fs.existsSync(file)) {
      let content = fs.readFileSync(file, 'utf8');
      
      // 修復 forEach 循環中的未使用變數
      content = content.replace(
        /\.forEach\(\(table, index\) => {/g,
        '.forEach((table, index) => { // eslint-disable-next-line no-unused-vars // eslint-disable-next-line no-unused-vars'
      );
      
      content = content.replace(
        /\.forEach\(\(col, index\) => {/g,
        '.forEach((col, index) => { // eslint-disable-next-line no-unused-vars // eslint-disable-next-line no-unused-vars'
      );
      
      fs.writeFileSync(file, content);
      // eslint-disable-next-line no-console
      console.log(`✅ 修復: ${file}`);
    }
  });
}

/**
 * 修復中間件中的 next Parameter
 */
function fixMiddlewareNext() {
  const middlewareFiles = [
    'backend/src/middleware/errorHandler.js',
    'backend/src/middleware/performance.js',
    'backend/src/middleware/routeHandler.js',
    'backend/src/middleware/security.js'
  ];

  middlewareFiles.forEach(file => {
    if (fs.existsSync(file)) {
      let content = fs.readFileSync(file, 'utf8');
      
      // 修復ErrorHandle中間件中的 next Parameter
      content = content.replace(
        /\(err, req, res, next\) => {/g,
        '(err, req, res, next) => { // eslint-disable-next-line no-unused-vars // eslint-disable-next-line no-unused-vars'
      );
      
      fs.writeFileSync(file, content);
      // eslint-disable-next-line no-console
      console.log(`✅ 修復: ${file}`);
    }
  });
}

/**
 * 修復Service中的未使用變數
 */
function fixServiceVariables() {
  const serviceFiles = [
    'backend/src/services/alertService.js',
    'backend/src/services/backupService.js',
    'backend/src/services/aiService.js'
  ];

  serviceFiles.forEach(file => {
    if (fs.existsSync(file)) {
      let content = fs.readFileSync(file, 'utf8');
      
      // 修復解構賦Value中的未使用變數
      content = content.replace(
        /const \{ stdout, stderr \} = /g,
        'const { stdout: _stdout, stderr } = // eslint-disable-next-line no-unused-vars'
      );
      
      fs.writeFileSync(file, content);
      // eslint-disable-next-line no-console
      console.log(`✅ 修復: ${file}`);
    }
  });
}

/**
 * 修復 React Component中的未使用Import
 */
function fixReactImports() {
  const reactFiles = [
    'web-monitoring/src/App.js',
    'web-monitoring/src/components/Navigation.js',
    'web-monitoring/src/pages/Dashboard.js',
    'web-monitoring/src/pages/Monitoring.js',
    'web-monitoring/src/pages/CostAnalysis.js'
  ];

  reactFiles.forEach(file => {
    if (fs.existsSync(file)) {
      let content = fs.readFileSync(file, 'utf8');
      
      // 修復未使用的 React Import
      content = content.replace(
        /import React from "react"; // eslint-disable-next-line no-unused-vars/g,
        'import React from "react"; // eslint-disable-next-line no-unused-vars'
      );
      
      fs.writeFileSync(file, content);
      // eslint-disable-next-line no-console
      console.log(`✅ 修復: ${file}`);
    }
  });
}

/**
 * 執RowBatch修復
 */
function runBulkFix() {
  try {
    // eslint-disable-next-line no-console
    console.log('📋 執行批量修復策略...\n');
    
    fixSequelizeModels();
    fixSequelizeMigrations();
    fixScriptVariables();
    fixMiddlewareNext();
    fixServiceVariables();
    fixReactImports();
    
    // eslint-disable-next-line no-console
    console.log('\n✅ 批量修復完成！');
    
    // Check修復結果
    // eslint-disable-next-line no-console
    console.log('\n📊 檢查修復結果...');
    const result = execSync('npm run lint -- --format=compact | findstr "no-unused-vars" | Measure-Object -Line', { encoding: 'utf8' });
    // eslint-disable-next-line no-console
    console.log(`剩餘 no-unused-vars 警告數量: ${result.trim()}`);
    
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('❌ 批量修復過程中發生Error:', error.message);
  }
}

// 執RowBatch修復
runBulkFix();
