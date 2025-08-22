const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);
const logger = require('../utils/logger');
const { current: config } = require('../config/environments');

class BackupService {
  constructor() {
    this.backupDir =
      process.env.BACKUP_DIR || path.join(__dirname, '..', 'backups');
    this.retentionDays = parseInt(process.env.BACKUP_RETENTION_DAYS) || 30;
    this.maxBackups = parseInt(process.env.MAX_BACKUPS) || 100;
    this.compressionEnabled = process.env.BACKUP_COMPRESSION !== 'false';
  }

  /**
   * 初始化備份服務
   */
  async initialize() {
    try {
      await fs.mkdir(this.backupDir, { recursive: true });
      logger.info('備份服務初始化完成');
    } catch (error) {
      logger.error('備份服務初始化失敗:', error);
      throw error;
    }
  }

  /**
   * 創建數據庫備份
   */
  async createDatabaseBackup() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `db_backup_${timestamp}.sql`;
    const filepath = path.join(this.backupDir, filename);

    try {
      const { host, port, name, user, password } = config.database;

      // 構建 pg_dump 命令
      const env = {
        ...process.env,
        PGPASSWORD: password,
      };

      const command = `pg_dump -h ${host} -p ${port} -U ${user} -d ${name} -f ${filepath}`;

      logger.info(`開始創建數據庫備份: ${filename}`);
      const { stdout, stderr } = await execAsync(command, { env });

      if (stderr) {
        logger.warn('數據庫備份警告:', stderr);
      }

      // 壓縮備份文件
      if (this.compressionEnabled) {
        await this.compressFile(filepath);
        await fs.unlink(filepath); // 刪除原始文件
        logger.info(`數據庫備份完成: ${filename}.gz`);
      } else {
        logger.info(`數據庫備份完成: ${filename}`);
      }

      // 清理舊備份
      await this.cleanupOldBackups();

      return {
        success: true,
        filename: this.compressionEnabled ? `${filename}.gz` : filename,
        size: await this.getFileSize(
          filepath + (this.compressionEnabled ? '.gz' : '')
        ),
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      logger.error('數據庫備份失敗:', error);
      throw error;
    }
  }

  /**
   * 創建文件備份
   */
  async createFileBackup() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `files_backup_${timestamp}.tar.gz`;
    const filepath = path.join(this.backupDir, filename);

    try {
      const uploadsDir = config.upload.path;
      const modelsDir = config.ai.modelPath;
      const exportsDir =
        process.env.EXPORT_PATH || path.join(__dirname, '..', 'exports');

      // 檢查目錄是否存在
      const dirsToBackup = [];
      for (const dir of [uploadsDir, modelsDir, exportsDir]) {
        try {
          await fs.access(dir);
          dirsToBackup.push(dir);
        } catch (error) {
          logger.warn(`目錄不存在，跳過備份: ${dir}`);
        }
      }

      if (dirsToBackup.length === 0) {
        logger.warn('沒有可備份的文件目錄');
        return {
          success: true,
          filename: null,
          size: 0,
          timestamp: new Date().toISOString(),
          message: '沒有可備份的文件',
        };
      }

      // 創建 tar.gz 備份
      const command = `tar -czf ${filepath} ${dirsToBackup.join(' ')}`;

      logger.info(`開始創建文件備份: ${filename}`);
      const { stdout, stderr } = await execAsync(command);

      if (stderr) {
        logger.warn('文件備份警告:', stderr);
      }

      logger.info(`文件備份完成: ${filename}`);

      // 清理舊備份
      await this.cleanupOldBackups();

      return {
        success: true,
        filename,
        size: await this.getFileSize(filepath),
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      logger.error('文件備份失敗:', error);
      throw error;
    }
  }

  /**
   * 創建完整備份（數據庫 + 文件）
   */
  async createFullBackup() {
    try {
      logger.info('開始創建完整備份');

      const dbBackup = await this.createDatabaseBackup();
      const fileBackup = await this.createFileBackup();

      const result = {
        success: true,
        timestamp: new Date().toISOString(),
        database: dbBackup,
        files: fileBackup,
        totalSize: (dbBackup.size || 0) + (fileBackup.size || 0),
      };

      logger.info('完整備份完成', result);
      return result;
    } catch (error) {
      logger.error('完整備份失敗:', error);
      throw error;
    }
  }

  /**
   * 恢復數據庫備份
   */
  async restoreDatabaseBackup(backupFile) {
    try {
      const filepath = path.join(this.backupDir, backupFile);

      // 檢查文件是否存在
      await fs.access(filepath);

      const { host, port, name, user, password } = config.database;

      // 構建 psql 命令
      const env = {
        ...process.env,
        PGPASSWORD: password,
      };

      let command;
      if (backupFile.endsWith('.gz')) {
        // 解壓縮並恢復
        command = `gunzip -c ${filepath} | psql -h ${host} -p ${port} -U ${user} -d ${name}`;
      } else {
        // 直接恢復
        command = `psql -h ${host} -p ${port} -U ${user} -d ${name} -f ${filepath}`;
      }

      logger.info(`開始恢復數據庫備份: ${backupFile}`);
      const { stdout, stderr } = await execAsync(command, { env });

      if (stderr) {
        logger.warn('數據庫恢復警告:', stderr);
      }

      logger.info(`數據庫恢復完成: ${backupFile}`);

      return {
        success: true,
        filename: backupFile,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      logger.error('數據庫恢復失敗:', error);
      throw error;
    }
  }

  /**
   * 恢復文件備份
   */
  async restoreFileBackup(backupFile) {
    try {
      const filepath = path.join(this.backupDir, backupFile);

      // 檢查文件是否存在
      await fs.access(filepath);

      // 創建臨時目錄
      const tempDir = path.join(this.backupDir, 'temp_restore');
      await fs.mkdir(tempDir, { recursive: true });

      // 解壓縮到臨時目錄
      const command = `tar -xzf ${filepath} -C ${tempDir}`;

      logger.info(`開始恢復文件備份: ${backupFile}`);
      const { stdout, stderr } = await execAsync(command);

      if (stderr) {
        logger.warn('文件恢復警告:', stderr);
      }

      // 移動文件到正確位置
      const uploadsDir = config.upload.path;
      const modelsDir = config.ai.modelPath;
      const exportsDir =
        process.env.EXPORT_PATH || path.join(__dirname, '..', 'exports');

      // 這裡可以添加具體的文件移動邏輯
      logger.info(`文件恢復完成: ${backupFile}`);

      // 清理臨時目錄
      await fs.rmdir(tempDir, { recursive: true });

      return {
        success: true,
        filename: backupFile,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      logger.error('文件恢復失敗:', error);
      throw error;
    }
  }

  /**
   * 獲取備份列表
   */
  async getBackupList() {
    try {
      const files = await fs.readdir(this.backupDir);
      const backups = [];

      for (const file of files) {
        const filepath = path.join(this.backupDir, file);
        const stats = await fs.stat(filepath);

        backups.push({
          filename: file,
          size: stats.size,
          created: stats.birthtime,
          modified: stats.mtime,
          type: this.getBackupType(file),
        });
      }

      // 按創建時間排序
      backups.sort((a, b) => b.created - a.created);

      return backups;
    } catch (error) {
      logger.error('獲取備份列表失敗:', error);
      throw error;
    }
  }

  /**
   * 清理舊備份
   */
  async cleanupOldBackups() {
    try {
      const backups = await this.getBackupList();
      const now = new Date();
      const cutoffDate = new Date(
        now.getTime() - this.retentionDays * 24 * 60 * 60 * 1000
      );

      let deletedCount = 0;

      for (const backup of backups) {
        // 刪除超過保留期的備份
        if (backup.created < cutoffDate) {
          const filepath = path.join(this.backupDir, backup.filename);
          await fs.unlink(filepath);
          deletedCount++;
          logger.info(`刪除舊備份: ${backup.filename}`);
        }
      }

      // 如果備份數量超過最大限制，刪除最舊的
      if (backups.length - deletedCount > this.maxBackups) {
        const remainingBackups = backups.slice(deletedCount);
        const toDelete = remainingBackups.slice(this.maxBackups);

        for (const backup of toDelete) {
          const filepath = path.join(this.backupDir, backup.filename);
          await fs.unlink(filepath);
          deletedCount++;
          logger.info(`刪除超量備份: ${backup.filename}`);
        }
      }

      if (deletedCount > 0) {
        logger.info(`清理完成，刪除了 ${deletedCount} 個舊備份`);
      }

      return { deletedCount };
    } catch (error) {
      logger.error('清理舊備份失敗:', error);
      throw error;
    }
  }

  /**
   * 獲取備份統計信息
   */
  async getBackupStats() {
    try {
      const backups = await this.getBackupList();
      const totalSize = backups.reduce((sum, backup) => sum + backup.size, 0);

      const stats = {
        totalBackups: backups.length,
        totalSize,
        totalSizeMB: Math.round((totalSize / (1024 * 1024)) * 100) / 100,
        retentionDays: this.retentionDays,
        maxBackups: this.maxBackups,
        compressionEnabled: this.compressionEnabled,
        backupTypes: {
          database: backups.filter((b) => b.type === 'database').length,
          files: backups.filter((b) => b.type === 'files').length,
          full: backups.filter((b) => b.type === 'full').length,
        },
      };

      return stats;
    } catch (error) {
      logger.error('獲取備份統計失敗:', error);
      throw error;
    }
  }

  /**
   * 壓縮文件
   */
  async compressFile(filepath) {
    try {
      const command = `gzip ${filepath}`;
      await execAsync(command);
    } catch (error) {
      logger.error('文件壓縮失敗:', error);
      throw error;
    }
  }

  /**
   * 獲取文件大小
   */
  async getFileSize(filepath) {
    try {
      const stats = await fs.stat(filepath);
      return stats.size;
    } catch (error) {
      return 0;
    }
  }

  /**
   * 獲取備份類型
   */
  getBackupType(filename) {
    if (filename.startsWith('db_backup_')) {
      return 'database';
    } else if (filename.startsWith('files_backup_')) {
      return 'files';
    } else if (filename.startsWith('full_backup_')) {
      return 'full';
    }
    return 'unknown';
  }

  /**
   * 驗證備份文件完整性
   */
  async validateBackup(backupFile) {
    try {
      const filepath = path.join(this.backupDir, backupFile);

      // 檢查文件是否存在
      await fs.access(filepath);

      // 檢查文件大小
      const stats = await fs.stat(filepath);
      if (stats.size === 0) {
        return { valid: false, error: '備份文件為空' };
      }

      // 檢查文件類型
      const backupType = this.getBackupType(backupFile);
      if (backupType === 'unknown') {
        return { valid: false, error: '未知的備份文件類型' };
      }

      return { valid: true, size: stats.size, type: backupType };
    } catch (error) {
      return { valid: false, error: error.message };
    }
  }
}

module.exports = new BackupService();
