const ExcelJS = require('exceljs');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const PDFDocument = require('pdfkit');
// eslint-disable-next-line no-unused-vars
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
// eslint-disable-next-line no-unused-vars
const moment = require('moment');
// eslint-disable-next-line no-unused-vars
const logger = require('../utils/logger');
const { Op } = require('sequelize');

class DataExportService {
  constructor() {
    this.exportDirectory = path.join(__dirname, '../../exports');
    this.ensureExportDirectory();
  }

  /**
   * 確保ExportDirectory存在
   */
  ensureExportDirectory() {
    if (!fs.existsSync(this.exportDirectory)) {
      fs.mkdirSync(this.exportDirectory, { recursive: true });
    }
  }

  /**
   * Export卡片Data
   */
  async exportCardsData(format = 'excel', filters = {}, options = {}) {
    try {
// eslint-disable-next-line no-unused-vars
      const Card = require('../models/Card');

      // BuildQueryCondition
      const whereClause = {};
      if (filters.name) {
        whereClause.name = { [Op.iLike]: `%${filters.name}%` };
      }
      if (filters.setName) {
        whereClause.setName = { [Op.iLike]: `%${filters.setName}%` };
      }
      if (filters.rarity) {
        whereClause.rarity = filters.rarity;
      }
      if (filters.cardType) {
        whereClause.cardType = filters.cardType;
      }
      if (filters.minPrice) {
        whereClause.currentPrice = { [Op.gte]: filters.minPrice };
      }
      if (filters.maxPrice) {
        whereClause.currentPrice = {
          ...whereClause.currentPrice,
          [Op.lte]: filters.maxPrice,
        };
      }

      // GetData
      const cards = await Card.findAll({
        where: whereClause,
        order: [['name', 'ASC']],
        limit: options.limit || 10000,
      });

// eslint-disable-next-line no-unused-vars
      const data = cards.map((card) => ({
        id: card.id,
        name: card.name,
        setName: card.setName,
        rarity: card.rarity,
        cardType: card.cardType,
        currentPrice: card.currentPrice,
        marketCap: card.marketCap,
        totalSupply: card.totalSupply,
        imageUrl: card.imageUrl,
        description: card.description,
        createdAt: card.createdAt,
        updatedAt: card.updatedAt,
      }));

      // Root據格式Export
      switch (format.toLowerCase()) {
        case 'excel':
          return await this.exportToExcel(data, 'cards', options);
        case 'csv':
          return await this.exportToCSV(data, 'cards', options);
        case 'pdf':
          return await this.exportToPDF(data, 'cards', options);
        case 'json':
          return await this.exportToJSON(data, 'cards', options);
        default:
          throw new Error(`不支持的導出格式: ${format}`);
      }
    } catch (error) {
      logger.error('導出卡片數據Failed:', error);
      throw error;
    }
  }

  /**
   * Export投資Data
   */
  async exportInvestmentsData(
    userId,
    format = 'excel',
    filters = {},
    options = {}
  ) {
    try {
      const Investment = require('../models/Investment');
// eslint-disable-next-line no-unused-vars
      const Card = require('../models/Card');

      // BuildQueryCondition
      const whereClause = { userId };
      if (filters.isActive !== undefined) {
        whereClause.isActive = filters.isActive;
      }
      if (filters.minPurchasePrice) {
        whereClause.purchasePrice = { [Op.gte]: filters.minPurchasePrice };
      }
      if (filters.maxPurchasePrice) {
        whereClause.purchasePrice = {
          ...whereClause.purchasePrice,
          [Op.lte]: filters.maxPurchasePrice,
        };
      }

      // GetData
      const investments = await Investment.findAll({
        where: whereClause,
        include: [
          {
            model: Card,
            as: 'card',
            attributes: [
              'name',
              'setName',
              'rarity',
              'currentPrice',
              'imageUrl',
            ],
          },
        ],
        order: [['createdAt', 'DESC']],
        limit: options.limit || 10000,
      });

// eslint-disable-next-line no-unused-vars
      const data = investments.map((investment) => ({
        id: investment.id,
        cardName: investment.card?.name || 'Unknown',
        setName: investment.card?.setName || 'Unknown',
        rarity: investment.card?.rarity || 'Unknown',
        quantity: investment.quantity,
        purchasePrice: investment.purchasePrice,
        currentPrice: investment.card?.currentPrice || 0,
        totalCost: investment.quantity * investment.purchasePrice,
        currentValue:
          investment.quantity * (investment.card?.currentPrice || 0),
        returnAmount: investment.returnAmount || 0,
        returnPercentage: investment.returnPercentage || 0,
        purchaseDate: investment.purchaseDate,
        isActive: investment.isActive,
        createdAt: investment.createdAt,
        updatedAt: investment.updatedAt,
      }));

      // Root據格式Export
      switch (format.toLowerCase()) {
        case 'excel':
          return await this.exportToExcel(data, 'investments', options);
        case 'csv':
          return await this.exportToCSV(data, 'investments', options);
        case 'pdf':
          return await this.exportToPDF(data, 'investments', options);
        case 'json':
          return await this.exportToJSON(data, 'investments', options);
        default:
          throw new Error(`不支持的導出格式: ${format}`);
      }
    } catch (error) {
      logger.error('導出投資數據Failed:', error);
      throw error;
    }
  }

  /**
   * Export市場Data
   */
  async exportMarketData(format = 'excel', filters = {}, options = {}) {
    try {
// eslint-disable-next-line no-unused-vars
      const MarketData = require('../models/MarketData');
// eslint-disable-next-line no-unused-vars
      const Card = require('../models/Card');

      // BuildQueryCondition
      const whereClause = {};
      if (filters.cardId) {
        whereClause.cardId = filters.cardId;
      }
      if (filters.startDate) {
        whereClause.date = { [Op.gte]: new Date(filters.startDate) };
      }
      if (filters.endDate) {
        whereClause.date = {
          ...whereClause.date,
          [Op.lte]: new Date(filters.endDate),
        };
      }

      // GetData
      const marketData = await MarketData.findAll({
        where: whereClause,
        include: [
          {
            model: Card,
            as: 'card',
            attributes: ['name', 'setName', 'rarity'],
          },
        ],
        order: [['date', 'DESC']],
        limit: options.limit || 10000,
      });

// eslint-disable-next-line no-unused-vars
      const data = marketData.map((item) => ({
        id: item.id,
        cardName: item.card?.name || 'Unknown',
        setName: item.card?.setName || 'Unknown',
        rarity: item.card?.rarity || 'Unknown',
        date: item.date,
        price: item.price,
        volume: item.volume || 0,
        marketCap: item.marketCap || 0,
        priceChange: item.priceChange || 0,
        priceChangePercent: item.priceChangePercent || 0,
        createdAt: item.createdAt,
      }));

      // Root據格式Export
      switch (format.toLowerCase()) {
        case 'excel':
          return await this.exportToExcel(data, 'market_data', options);
        case 'csv':
          return await this.exportToCSV(data, 'market_data', options);
        case 'pdf':
          return await this.exportToPDF(data, 'market_data', options);
        case 'json':
          return await this.exportToJSON(data, 'market_data', options);
        default:
          throw new Error(`不支持的導出格式: ${format}`);
      }
    } catch (error) {
      logger.error('導出市場數據Failed:', error);
      throw error;
    }
  }

  /**
   * ExportUserData
   */
  async exportUsersData(format = 'excel', filters = {}, options = {}) {
    try {
      const User = require('../models/User');

      // BuildQueryCondition
      const whereClause = {};
      if (filters.role) {
        whereClause.role = filters.role;
      }
      if (filters.isActive !== undefined) {
        whereClause.isActive = filters.isActive;
      }
      if (filters.startDate) {
        whereClause.createdAt = { [Op.gte]: new Date(filters.startDate) };
      }
      if (filters.endDate) {
        whereClause.createdAt = {
          ...whereClause.createdAt,
          [Op.lte]: new Date(filters.endDate),
        };
      }

      // GetData
// eslint-disable-next-line no-unused-vars
      const users = await User.findAll({
        where: whereClause,
        attributes: { exclude: ['password'] },
        order: [['createdAt', 'DESC']],
        limit: options.limit || 10000,
      });

// eslint-disable-next-line no-unused-vars
      const data = users.map((user) => ({
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      }));

      // Root據格式Export
      switch (format.toLowerCase()) {
        case 'excel':
          return await this.exportToExcel(data, 'users', options);
        case 'csv':
          return await this.exportToCSV(data, 'users', options);
        case 'pdf':
          return await this.exportToPDF(data, 'users', options);
        case 'json':
          return await this.exportToJSON(data, 'users', options);
        default:
          throw new Error(`不支持的導出格式: ${format}`);
      }
    } catch (error) {
      logger.error('導出用戶數據Failed:', error);
      throw error;
    }
  }

  /**
   * Export到 Excel
   */
  async exportToExcel(data, sheetName, options = {}) {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet(sheetName);

      // SettingsColumn標題
      if (data.length > 0) {
        const headers = Object.keys(data[0]);
        worksheet.addRow(headers);

        // Settings標題樣式
        const headerRow = worksheet.getRow(1);
        headerRow.font = { bold: true };
        headerRow.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFE0E0E0' },
        };
      }

      // AddDataRow
      data.forEach((row) => {
        const values = Object.values(row).map((value) => {
          if (value instanceof Date) {
            return value.toISOString();
          }
          return value;
        });
        worksheet.addRow(values);
      });

      // Auto調整Column寬
      worksheet.columns.forEach((column) => {
        let maxLength = 0;
        column.eachCell({ includeEmpty: true }, (cell) => {
          const columnLength = cell.value ? cell.value.toString().length : 10;
          if (columnLength > maxLength) {
            maxLength = columnLength;
          }
        });
        column.width = Math.min(maxLength + 2, 50);
      });

      // 生成File名
      const timestamp = moment().format('YYYY-MM-DD_HH-mm-ss');
      const filename = `${sheetName}_${timestamp}.xlsx`;
      const filepath = path.join(this.exportDirectory, filename);

      // SaveFile
      await workbook.xlsx.writeFile(filepath);

      logger.info(`Excel 文件導出Success: ${filepath}`);
      return {
        filename,
        filepath,
        format: 'excel',
        recordCount: data.length,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      logger.error('Excel 導出Failed:', error);
      throw error;
    }
  }

  /**
   * Export到 CSV
   */
  async exportToCSV(data, filename, options = {}) {
    try {
      if (data.length === 0) {
        throw new Error('沒有數據可導出');
      }

      const timestamp = moment().format('YYYY-MM-DD_HH-mm-ss');
      const csvFilename = `${filename}_${timestamp}.csv`;
      const filepath = path.join(this.exportDirectory, csvFilename);

      // 準備 CSV 標題
      const headers = Object.keys(data[0]).map((key) => ({
        id: key,
        title: key,
      }));

      // Create CSV Writer
      const csvWriter = createCsvWriter({
        path: filepath,
        header: headers,
      });

      // HandleData
      const processedData = data.map((row) => {
        const processedRow = {};
        Object.keys(row).forEach((key) => {
          let value = row[key];
          if (value instanceof Date) {
            value = value.toISOString();
          }
          processedRow[key] = value;
        });
        return processedRow;
      });

      // Write CSV File
      await csvWriter.writeRecords(processedData);

      logger.info(`CSV 文件導出Success: ${filepath}`);
      return {
        filename: csvFilename,
        filepath,
        format: 'csv',
        recordCount: data.length,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      logger.error('CSV 導出Failed:', error);
      throw error;
    }
  }

  /**
   * Export到 PDF
   */
  async exportToPDF(data, filename, options = {}) {
    try {
      const timestamp = moment().format('YYYY-MM-DD_HH-mm-ss');
      const pdfFilename = `${filename}_${timestamp}.pdf`;
      const filepath = path.join(this.exportDirectory, pdfFilename);

      // Create PDF Documentation
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50,
      });

      // CreateWrite流
      const writeStream = fs.createWriteStream(filepath);
      doc.pipe(writeStream);

      // Add標題
      doc
        .fontSize(20)
        .font('Helvetica-Bold')
        .text(`${filename.toUpperCase()} REPORT`, { align: 'center' });

      doc.moveDown();
      doc
        .fontSize(12)
        .font('Helvetica')
        .text(`Generated on: ${new Date().toLocaleString()}`);
      doc.text(`Total Records: ${data.length}`);

      doc.moveDown(2);

      // AddTable格
      if (data.length > 0) {
        const headers = Object.keys(data[0]);
        const pageWidth = 500;
        const colWidth = pageWidth / headers.length;

        // 繪製Table格標題
        doc.fontSize(10).font('Helvetica-Bold');
        headers.forEach((header, index) => {
          doc.text(header, 50 + index * colWidth, doc.y, {
            width: colWidth - 5,
            align: 'left',
          });
        });

        doc.moveDown();

        // 繪製DataRow
        doc.fontSize(8).font('Helvetica');
        data.forEach((row, rowIndex) => {
          // CheckYesNo需要新頁面
          if (doc.y > 700) {
            doc.addPage();
            doc.fontSize(10).font('Helvetica-Bold');
            headers.forEach((header, index) => {
              doc.text(header, 50 + index * colWidth, doc.y, {
                width: colWidth - 5,
                align: 'left',
              });
            });
            doc.moveDown();
            doc.fontSize(8).font('Helvetica');
          }

          headers.forEach((header, colIndex) => {
            let value = row[header];
            if (value instanceof Date) {
              value = value.toLocaleDateString();
            }
            if (typeof value === 'boolean') {
              value = value ? 'Yes' : 'No';
            }
            if (value === null || value === undefined) {
              value = '';
            }

            doc.text(String(value), 50 + colIndex * colWidth, doc.y, {
              width: colWidth - 5,
              align: 'left',
            });
          });

          doc.moveDown();
        });
      }

      // Complete PDF
      doc.end();

      return new Promise((resolve, reject) => {
        writeStream.on('finish', () => {
          logger.info(`PDF 文件導出Success: ${filepath}`);
          resolve({
            filename: pdfFilename,
            filepath,
            format: 'pdf',
            recordCount: data.length,
            timestamp: new Date().toISOString(),
          });
        });

        writeStream.on('error', (error) => {
          logger.error('PDF 導出Failed:', error);
          reject(error);
        });
      });
    } catch (error) {
      logger.error('PDF 導出Failed:', error);
      throw error;
    }
  }

  /**
   * Export到 JSON
   */
  async exportToJSON(data, filename, options = {}) {
    try {
      const timestamp = moment().format('YYYY-MM-DD_HH-mm-ss');
      const jsonFilename = `${filename}_${timestamp}.json`;
      const filepath = path.join(this.exportDirectory, jsonFilename);

      // 準備ExportData
      const exportData = {
        metadata: {
          filename,
          recordCount: data.length,
          exportDate: new Date().toISOString(),
          format: 'json',
          version: '1.0',
        },
        data,
      };

      // Write JSON File
      fs.writeFileSync(filepath, JSON.stringify(exportData, null, 2), 'utf8');

      logger.info(`JSON 文件導出Success: ${filepath}`);
      return {
        filename: jsonFilename,
        filepath,
        format: 'json',
        recordCount: data.length,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      logger.error('JSON 導出Failed:', error);
      throw error;
    }
  }

  /**
   * 生成投資組合Report
   */
  async generatePortfolioReport(userId, format = 'pdf', options = {}) {
    try {
      const Investment = require('../models/Investment');
// eslint-disable-next-line no-unused-vars
      const Card = require('../models/Card');

      // GetUser投資組合
      const investments = await Investment.findAll({
        where: { userId, isActive: true },
        include: [
          {
            model: Card,
            as: 'card',
            attributes: [
              'name',
              'setName',
              'rarity',
              'currentPrice',
              'imageUrl',
            ],
          },
        ],
        order: [['createdAt', 'DESC']],
      });

      // 計算投資組合Statistics
      const portfolioStats = {
        totalInvestments: investments.length,
        totalCost: 0,
        currentValue: 0,
        totalReturn: 0,
        totalReturnPercentage: 0,
        topPerformers: [],
        worstPerformers: [],
      };

      const investmentData = investments.map((investment) => {
        const currentValue =
          investment.quantity * (investment.card?.currentPrice || 0);
        const totalCost = investment.quantity * investment.purchasePrice;
        const returnAmount = currentValue - totalCost;
        const returnPercentage =
          totalCost > 0 ? (returnAmount / totalCost) * 100 : 0;

        portfolioStats.totalCost += totalCost;
        portfolioStats.currentValue += currentValue;
        portfolioStats.totalReturn += returnAmount;

        return {
          cardName: investment.card?.name || 'Unknown',
          setName: investment.card?.setName || 'Unknown',
          rarity: investment.card?.rarity || 'Unknown',
          quantity: investment.quantity,
          purchasePrice: investment.purchasePrice,
          currentPrice: investment.card?.currentPrice || 0,
          totalCost,
          currentValue,
          returnAmount,
          returnPercentage,
          purchaseDate: investment.purchaseDate,
        };
      });

      // 計算總回報率
      if (portfolioStats.totalCost > 0) {
        portfolioStats.totalReturnPercentage =
          (portfolioStats.totalReturn / portfolioStats.totalCost) * 100;
      }

      // Sort找出最佳和最差Table現
      const sortedByReturn = [...investmentData].sort(
        (a, b) => b.returnPercentage - a.returnPercentage
      );
      portfolioStats.topPerformers = sortedByReturn.slice(0, 5);
      portfolioStats.worstPerformers = sortedByReturn.slice(-5).reverse();

      // MergeData
      const reportData = {
        portfolioStats,
        investments: investmentData,
      };

      // Root據格式Export
      switch (format.toLowerCase()) {
        case 'pdf':
          return await this.exportPortfolioToPDF(reportData, userId, options);
        case 'excel':
          return await this.exportPortfolioToExcel(reportData, userId, options);
        case 'json':
          return await this.exportToJSON(
            reportData,
            `portfolio_${userId}`,
            options
          );
        default:
          throw new Error(`不支持的報告格式: ${format}`);
      }
    } catch (error) {
      logger.error('生成投資組合報告Failed:', error);
      throw error;
    }
  }

  /**
   * Export投資組合到 PDF
   */
  async exportPortfolioToPDF(data, userId, options = {}) {
    try {
      const timestamp = moment().format('YYYY-MM-DD_HH-mm-ss');
      const pdfFilename = `portfolio_${userId}_${timestamp}.pdf`;
      const filepath = path.join(this.exportDirectory, pdfFilename);

      const doc = new PDFDocument({
        size: 'A4',
        margin: 50,
      });

      const writeStream = fs.createWriteStream(filepath);
      doc.pipe(writeStream);

      // 標題
      doc
        .fontSize(24)
        .font('Helvetica-Bold')
        .text('INVESTMENT PORTFOLIO REPORT', { align: 'center' });

      doc.moveDown();
      doc
        .fontSize(12)
        .font('Helvetica')
        .text(`User ID: ${userId}`)
        .text(`Generated: ${new Date().toLocaleString()}`);

      doc.moveDown(2);

      // 投資組合Statistics
      doc.fontSize(16).font('Helvetica-Bold').text('PORTFOLIO SUMMARY');
      doc.moveDown();

      const stats = data.portfolioStats;
      doc
        .fontSize(10)
        .font('Helvetica')
        .text(`Total Investments: ${stats.totalInvestments}`)
        .text(`Total Cost: $${stats.totalCost.toFixed(2)}`)
        .text(`Current Value: $${stats.currentValue.toFixed(2)}`)
        .text(`Total Return: $${stats.totalReturn.toFixed(2)}`)
        .text(`Return Percentage: ${stats.totalReturnPercentage.toFixed(2)}%`);

      doc.moveDown(2);

      // 最佳Table現者
      doc.fontSize(14).font('Helvetica-Bold').text('TOP PERFORMERS');
      doc.moveDown();

      stats.topPerformers.forEach((investment, index) => {
        doc
          .fontSize(10)
          .font('Helvetica')
          .text(`${index + 1}. ${investment.cardName} (${investment.setName})`)
          .fontSize(8)
          .text(
            `   Return: ${investment.returnPercentage.toFixed(2)}% | Value: $${investment.currentValue.toFixed(2)}`
          );
      });

      doc.moveDown(2);

      // 投資詳情Table格
      doc.fontSize(14).font('Helvetica-Bold').text('INVESTMENT DETAILS');
      doc.moveDown();

      const headers = ['Card', 'Set', 'Qty', 'Cost', 'Value', 'Return %'];
      const colWidths = [120, 100, 50, 80, 80, 70];

      // Table格標題
      doc.fontSize(8).font('Helvetica-Bold');
      headers.forEach((header, index) => {
        doc.text(
          header,
          50 + colWidths.slice(0, index).reduce((sum, width) => sum + width, 0),
          doc.y,
          {
            width: colWidths[index],
            align: 'left',
          }
        );
      });

      doc.moveDown();

      // Table格Data
      doc.fontSize(8).font('Helvetica');
      data.investments.forEach((investment) => {
        if (doc.y > 700) {
          doc.addPage();
        }

        const values = [
          investment.cardName,
          investment.setName,
          investment.quantity.toString(),
          `$${investment.totalCost.toFixed(2)}`,
          `$${investment.currentValue.toFixed(2)}`,
          `${investment.returnPercentage.toFixed(2)}%`,
        ];

        values.forEach((value, index) => {
          doc.text(
            value,
            50 +
              colWidths.slice(0, index).reduce((sum, width) => sum + width, 0),
            doc.y,
            {
              width: colWidths[index],
              align: 'left',
            }
          );
        });

        doc.moveDown();
      });

      doc.end();

      return new Promise((resolve, reject) => {
        writeStream.on('finish', () => {
          logger.info(`投資組合 PDF 報告生成Success: ${filepath}`);
          resolve({
            filename: pdfFilename,
            filepath,
            format: 'pdf',
            recordCount: data.investments.length,
            timestamp: new Date().toISOString(),
          });
        });

        writeStream.on('error', reject);
      });
    } catch (error) {
      logger.error('投資組合 PDF 導出Failed:', error);
      throw error;
    }
  }

  /**
   * Export投資組合到 Excel
   */
  async exportPortfolioToExcel(data, userId, options = {}) {
    try {
      const workbook = new ExcelJS.Workbook();

      // 投資組合摘要工作Table
// eslint-disable-next-line no-unused-vars
      const summarySheet = workbook.addWorksheet('Portfolio Summary');
      const stats = data.portfolioStats;

      summarySheet.addRow(['Portfolio Summary']);
      summarySheet.addRow(['Total Investments', stats.totalInvestments]);
      summarySheet.addRow(['Total Cost', `$${stats.totalCost.toFixed(2)}`]);
      summarySheet.addRow([
        'Current Value',
        `$${stats.currentValue.toFixed(2)}`,
      ]);
      summarySheet.addRow(['Total Return', `$${stats.totalReturn.toFixed(2)}`]);
      summarySheet.addRow([
        'Return Percentage',
        `${stats.totalReturnPercentage.toFixed(2)}%`,
      ]);

      // 投資詳情工作Table
      const detailsSheet = workbook.addWorksheet('Investment Details');
      const headers = [
        'Card Name',
        'Set Name',
        'Rarity',
        'Quantity',
        'Purchase Price',
        'Current Price',
        'Total Cost',
        'Current Value',
        'Return Amount',
        'Return %',
        'Purchase Date',
      ];

      detailsSheet.addRow(headers);
      data.investments.forEach((investment) => {
        detailsSheet.addRow([
          investment.cardName,
          investment.setName,
          investment.rarity,
          investment.quantity,
          investment.purchasePrice,
          investment.currentPrice,
          investment.totalCost,
          investment.currentValue,
          investment.returnAmount,
          investment.returnPercentage,
          investment.purchaseDate,
        ]);
      });

      // 最佳Table現者工作Table
      const topPerformersSheet = workbook.addWorksheet('Top Performers');
      topPerformersSheet.addRow([
        'Rank',
        'Card Name',
        'Set Name',
        'Return %',
        'Current Value',
      ]);
      stats.topPerformers.forEach((investment, index) => {
        topPerformersSheet.addRow([
          index + 1,
          investment.cardName,
          investment.setName,
          investment.returnPercentage,
          investment.currentValue,
        ]);
      });

      // 生成File名
      const timestamp = moment().format('YYYY-MM-DD_HH-mm-ss');
      const filename = `portfolio_${userId}_${timestamp}.xlsx`;
      const filepath = path.join(this.exportDirectory, filename);

      await workbook.xlsx.writeFile(filepath);

      logger.info(`投資組合 Excel 報告生成Success: ${filepath}`);
      return {
        filename,
        filepath,
        format: 'excel',
        recordCount: data.investments.length,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      logger.error('投資組合 Excel 導出Failed:', error);
      throw error;
    }
  }

  /**
   * 清理過期File
   */
  cleanupExpiredFiles(daysToKeep = 7) {
    try {
      const cutoffDate = moment().subtract(daysToKeep, 'days').toDate();
      const files = fs.readdirSync(this.exportDirectory);

      let deletedCount = 0;
      files.forEach((file) => {
        const filepath = path.join(this.exportDirectory, file);
        const stats = fs.statSync(filepath);

        if (stats.mtime < cutoffDate) {
          fs.unlinkSync(filepath);
          deletedCount++;
        }
      });

      logger.info(`清理過期導出文件完成: 刪除 ${deletedCount} 個文件`);
      return deletedCount;
    } catch (error) {
      logger.error('清理過期文件Failed:', error);
      throw error;
    }
  }

  /**
   * GetExportStatistics
   */
  getExportStats() {
    try {
      const files = fs.readdirSync(this.exportDirectory);
      const stats = {
        totalFiles: files.length,
        totalSize: 0,
        formats: {},
        timestamp: new Date().toISOString(),
      };

      files.forEach((file) => {
        const filepath = path.join(this.exportDirectory, file);
        const fileStats = fs.statSync(filepath);
        stats.totalSize += fileStats.size;

        const extension = path.extname(file).toLowerCase();
        stats.formats[extension] = (stats.formats[extension] || 0) + 1;
      });

      return stats;
    } catch (error) {
      logger.error('Get導出統計Failed:', error);
      throw error;
    }
  }
}

module.exports = new DataExportService();
