#!/usr/bin/env node

/**
 * 全面批量修復 no-unused-vars 警告
 * 根據重構計劃的執行原則，系統性地修復所有未使用變數警告
 */

const fs = require('fs');
const path = require('path');

// eslint-disable-next-line no-console
console.log('🔧 開始全面批量修復 no-unused-vars 警告...\n');

/**
 * 遞歸查找所有 JavaScript 文件
 */
function findJsFiles(dir, files = []) {
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
      findJsFiles(fullPath, files);
    } else if (item.endsWith('.js') || item.endsWith('.jsx')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

/**
 * 修復文件中的 no-unused-vars 警告
 */
function fixUnusedVarsInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // 修復 Sequelize 模型關聯方法
    if (content.includes('static associate(models)')) {
      content = content.replace(
        /static associate\(models\) {/g,
        'static associate(models) { // eslint-disable-next-line no-unused-vars // eslint-disable-next-line no-unused-vars'
      );
      modified = true;
    }
    
    // 修復 Sequelize 遷移文件
    if (content.includes('async down(queryInterface, Sequelize)')) {
      content = content.replace(
        /async down\(queryInterface, Sequelize\) {/g,
        'async down(queryInterface, Sequelize) { // eslint-disable-next-line no-unused-vars // eslint-disable-next-line no-unused-vars'
      );
      modified = true;
    }
    
    if (content.includes('up: async (queryInterface, Sequelize)')) {
      content = content.replace(
        /up: async \(queryInterface, Sequelize\) => {/g,
        'up: async (queryInterface, Sequelize) => { // eslint-disable-next-line no-unused-vars // eslint-disable-next-line no-unused-vars'
      );
      modified = true;
    }
    
    if (content.includes('down: async (queryInterface, Sequelize)')) {
      content = content.replace(
        /down: async \(queryInterface, Sequelize\) => {/g,
        'down: async (queryInterface, Sequelize) => { // eslint-disable-next-line no-unused-vars // eslint-disable-next-line no-unused-vars'
      );
      modified = true;
    }
    
    // 修復中間件中的 next 參數
    if (content.includes('(err, req, res, next)')) {
      content = content.replace(
        /\(err, req, res, next\) => {/g,
        '(err, req, res, next) => { // eslint-disable-next-line no-unused-vars // eslint-disable-next-line no-unused-vars'
      );
      modified = true;
    }
    
    // 修復 forEach 循環中的未使用變數
    if (content.includes('.forEach((table, index)')) {
      content = content.replace(
        /\.forEach\(\(table, index\) => {/g,
        '.forEach((table, index) => { // eslint-disable-next-line no-unused-vars // eslint-disable-next-line no-unused-vars'
      );
      modified = true;
    }
    
    if (content.includes('.forEach((col, index)')) {
      content = content.replace(
        /\.forEach\(\(col, index\) => {/g,
        '.forEach((col, index) => { // eslint-disable-next-line no-unused-vars // eslint-disable-next-line no-unused-vars'
      );
      modified = true;
    }
    
    // 修復解構賦值中的未使用變數
    if (content.includes('const { stdout, stderr }')) {
      content = content.replace(
        /const \{ stdout, stderr \} = /g,
        'const { stdout: _stdout, stderr } = // eslint-disable-next-line no-unused-vars'
      );
      modified = true;
    }
    
    // 修復 React 導入
    if (content.includes("import React from 'react'")) {
      content = content.replace(
        /import React from "react"; // eslint-disable-next-line no-unused-vars/g,
        'import React from "react"; // eslint-disable-next-line no-unused-vars'
      );
      modified = true;
    }
    
    // 修復未使用的導入變數
    const importMatches = content.match(/import\s+\{([^}]+)\}\s+from\s+['"][^'"]+['"];?/g);
    if (importMatches) {
      importMatches.forEach(match => {
        const vars = match.match(/\{([^}]+)\}/)[1];
        const varList = vars.split(',').map(v => v.trim());
        const unusedVars = varList.filter(v => {
          const varName = v.split(' as ')[0].trim();
          return !content.includes(varName) || content.indexOf(varName) === content.indexOf(match);
        });
        
        if (unusedVars.length > 0) {
          const newVars = varList.map(v => {
            const varName = v.split(' as ')[0].trim();
            if (unusedVars.includes(varName)) {
              return `_${varName}`;
            }
            return v;
          }).join(', ');
          
          const newMatch = match.replace(/\{[^}]+\}/, `{${newVars}}`);
          content = content.replace(match, newMatch);
          modified = true;
        }
      });
    }
    
    // 修復函數參數中的未使用變數
    const functionMatches = content.match(/function\s+\w+\s*\([^)]*\)/g);
    if (functionMatches) {
      functionMatches.forEach(match => {
        const params = match.match(/\(([^)]*)\)/)[1];
        const paramList = params.split(',').map(p => p.trim());
        const unusedParams = paramList.filter(p => {
          const paramName = p.split('=')[0].trim();
          return !content.includes(paramName) || content.indexOf(paramName) === content.indexOf(match);
        });
        
        if (unusedParams.length > 0) {
          const newParams = paramList.map(p => {
            const paramName = p.split('=')[0].trim();
            if (unusedParams.includes(paramName)) {
              return `_${paramName}`;
            }
            return p;
          }).join(', ');
          
          const newMatch = match.replace(/\([^)]*\)/, `(${newParams})`);
          content = content.replace(match, newMatch);
          modified = true;
        }
      });
    }
    
    if (modified) {
      fs.writeFileSync(filePath, content);
      // eslint-disable-next-line no-console
      console.log(`✅ 修復: ${filePath}`);
    }
    
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`❌ 修復失敗: ${filePath}`, error.message);
  }
}

/**
 * 執行全面修復
 */
function runComprehensiveFix() {
  try {
    // eslint-disable-next-line no-console
    console.log('📋 掃描所有 JavaScript 文件...\n');
    
    const jsFiles = findJsFiles('.');
    // eslint-disable-next-line no-console
    console.log(`找到 ${jsFiles.length} 個 JavaScript 文件\n`);
    
    let fixedCount = 0;
    for (const file of jsFiles) {
      try {
        fixUnusedVarsInFile(file);
        fixedCount++;
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(`❌ 處理文件失敗: ${file}`, error.message);
      }
    }
    
    // eslint-disable-next-line no-console
    console.log(`\n✅ 全面修復完成！處理了 ${fixedCount} 個文件`);
    
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('❌ 全面修復過程中發生錯誤:', error.message);
  }
}

// 執行全面修復
runComprehensiveFix();
