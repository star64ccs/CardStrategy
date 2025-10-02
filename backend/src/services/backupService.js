// eslint-disable-next-line no-unused-vars
const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');
// eslint-disable-next-line no-unused-vars
const logger = require('../utils/logger');
// eslint-disable-next-line no-unused-vars
const moment = require('moment');

const execAsync = promisify(exec);

class BackupService {
  constructor() {
    this.backupDir = process.env.BACKUP_DIR || './backups';
    this.maxBackups = parseInt(process.env.MAX_BACKUPS) || 10;
    this.backupRetentionDays =
      parseInt(process.env.BACKUP_RETENTION_DAYS) || 30;
    this.initializeBackupDirectory();
  }

  /**
   * InitializeBackupDirectory
   */
  async initializeBackupDirectory() {
    try {
      await fs.mkdir(this.backupDir, { recursive: true });
      logger.info(`備份目錄InitializeSuccess: ${this.backupDir}`);
    } catch (error) {
      logger.error('Initialize備份目錄Failed:', error);
    }
  }

  /**
   * CreateDatabaseBackup
   */
  async createDatabaseBackup() {
    try {
      const timestamp = moment().format('YYYY-MM-DD_HH-mm-ss');
      const backupFileName = `database_backup_${timestamp}.sql`;
      const backupPath = path.join(this.backupDir, backupFileName);

      const dbConfig = {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        database: process.env.DB_NAME || 'cardstrategy',
        username: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || '',
      };

      // Build pg_dump 命令
      const pgDumpCommand = `PGPASSWORD="${dbConfig.password}" pg_dump -h ${dbConfig.host} -p ${dbConfig.port} -U ${dbConfig.username} -d ${dbConfig.database} -f "${backupPath}"`;

      logger.info('開始創建數據庫備份...');
      const { stdout: _stdout, stderr } = // eslint-disable-next-line no-unused-varsawait execAsync(pgDumpCommand);

      if (stderr) {
        logger.warn('備份過程中的警告:', stderr);
      }

      // CheckBackupFileYesNo存在
      const stats = await fs.stat(backupPath);
      const fileSize = (stats.size / 1024 / 1024).toFixed(2); // MB

      logger.info(`數據庫備份CreateSuccess: ${backupFileName} (${fileSize} MB)`);

      // 清理舊Backup
      await this.cleanupOldBackups();

      return {
        success: true,
        fileName: backupFileName,
        filePath: backupPath,
        fileSize: `${fileSize} MB`,
        timestamp: new Date(),
        type: 'database',
      };
    } catch (error) {
      logger.error('Create數據庫備份Failed:', error);
      throw error;
    }
  }

  /**
   * CreateFile系統Backup
   */
  async createFileSystemBackup() {
    try {
      const timestamp = moment().format('YYYY-MM-DD_HH-mm-ss');
      const backupFileName = `filesystem_backup_${timestamp}.tar.gz`;
      const backupPath = path.join(this.backupDir, backupFileName);

      // 需要Backup的Directory
      const directoriesToBackup = ['./uploads', './logs', './config'].filter(
        (dir) => {
          try {
            return require('fs').existsSync(dir);
          } catch {
            return false;
          }
        }
      );

      if (directoriesToBackup.length === 0) {
        logger.warn('沒有找到需要備份的目錄');
        return {
          success: false,
          message: '沒有找到需要備份的目錄',
        };
      }

      // Build tar 命令
      const tarCommand = `tar -czf "${backupPath}" ${directoriesToBackup.join(' ')}`;

      logger.info('開始創建文件系統備份...');
      const { stdout: _stdout, stderr } = // eslint-disable-next-line no-unused-varsawait execAsync(tarCommand);

      if (stderr) {
        logger.warn('備份過程中的警告:', stderr);
      }

      // CheckBackupFileYesNo存在
      const stats = await fs.stat(backupPath);
      const fileSize = (stats.size / 1024 / 1024).toFixed(2); // MB

      logger.info(`文件系統備份CreateSuccess: ${backupFileName} (${fileSize} MB)`);

      return {
        success: true,
        fileName: backupFileName,
        filePath: backupPath,
        fileSize: `${fileSize} MB`,
        timestamp: new Date(),
        type: 'filesystem',
        directories: directoriesToBackup,
      };
    } catch (error) {
      logger.error('Create文件系統備份Failed:', error);
      throw error;
    }
  }

  /**
   * Create完整Backup
   */
  async createFullBackup() {
    try {
      logger.info('開始創建完整備份...');

// eslint-disable-next-line no-unused-vars
      const results = {
        database: null,
        filesystem: null,
        timestamp: new Date(),
      };

      // ParallelCreateDatabase和File系統Backup
      const [dbResult, fsResult] = await Promise.allSettled([
        this.createDatabaseBackup(),
        this.createFileSystemBackup(),
      ]);

      if (dbResult.status === 'fulfilled') {
        results.database = dbResult.value;
      } else {
        logger.error('數據庫備份Failed:', dbResult.reason);
      }

      if (fsResult.status === 'fulfilled') {
        results.filesystem = fsResult.value;
      } else {
        logger.error('文件系統備份Failed:', fsResult.reason);
      }

      // 清理舊Backup
      await this.cleanupOldBackups();

      logger.info('完整備份創建完成');
      return results;
    } catch (error) {
      logger.error('Create完整備份Failed:', error);
      throw error;
    }
  }

  /**
   * RestoreDatabaseBackup
   */
  async restoreDatabaseBackup(backupFileName) {
    try {
      const backupPath = path.join(this.backupDir, backupFileName);

      // CheckBackupFileYesNo存在
      await fs.access(backupPath);

      const dbConfig = {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        database: process.env.DB_NAME || 'cardstrategy',
        username: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || '',
      };

      // Build psql 命令
      const psqlCommand = `PGPASSWORD="${dbConfig.password}" psql -h ${dbConfig.host} -p ${dbConfig.port} -U ${dbConfig.username} -d ${dbConfig.database} -f "${backupPath}"`;

      logger.info(`開始恢復數據庫備份: ${backupFileName}`);
      const { stdout: _stdout, stderr } = // eslint-disable-next-line no-unused-varsawait execAsync(psqlCommand);

      if (stderr) {
        logger.warn('恢復過程中的警告:', stderr);
      }

      logger.info(`數據庫備份恢復Success: ${backupFileName}`);
      return {
        success: true,
        fileName: backupFileName,
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error('恢復數據庫備份Failed:', error);
      throw error;
    }
  }

  /**
   * RestoreFile系統Backup
   */
  async restoreFileSystemBackup(backupFileName) {
    try {
      const backupPath = path.join(this.backupDir, backupFileName);

      // CheckBackupFileYesNo存在
      await fs.access(backupPath);

      // Build tar 解壓命令
      const tarCommand = `tar -xzf "${backupPath}" -C ./`;

      logger.info(`開始恢復文件系統備份: ${backupFileName}`);
      const { stdout: _stdout, stderr } = // eslint-disable-next-line no-unused-varsawait execAsync(tarCommand);

      if (stderr) {
        logger.warn('恢復過程中的警告:', stderr);
      }

      logger.info(`文件系統備份恢復Success: ${backupFileName}`);
      return {
        success: true,
        fileName: backupFileName,
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error('恢復文件系統備份Failed:', error);
      throw error;
    }
  }

  /**
   * GetBackupList
   */
  async getBackupList() {
    try {
      const files = await fs.readdir(this.backupDir);
      const backups = [];

      for (const file of files) {
// eslint-disable-next-line no-unused-vars
        const filePath = path.join(this.backupDir, file);
        const stats = await fs.stat(filePath);

        const backup = {
          fileName: file,
          filePath,
          fileSize: (stats.size / 1024 / 1024).toFixed(2), // MB
          createdAt: stats.birthtime,
          modifiedAt: stats.mtime,
          type: this.getBackupType(file),
        };

        backups.push(backup);
      }

      // 按CreateTimeSort
      backups.sort((a, b) => b.createdAt - a.createdAt);

      return backups;
    } catch (error) {
      logger.error('Get備份列表Failed:', error);
      throw error;
    }
  }

  /**
   * GetBackupClass型
   */
  getBackupType(fileName) {
    if (fileName.includes('database_backup')) {
      return 'database';
    } else if (fileName.includes('filesystem_backup')) {
      return 'filesystem';
    }
    return 'unknown';
  }

  /**
   * DeleteBackup
   */
  async deleteBackup(fileName) {
    try {
      const backupPath = path.join(this.backupDir, fileName);
      await fs.unlink(backupPath);

      logger.info(`備份已刪除: ${fileName}`);
      return {
        success: true,
        fileName,
      };
    } catch (error) {
      logger.error('Delete備份Failed:', error);
      throw error;
    }
  }

  /**
   * 清理舊Backup
   */
  async cleanupOldBackups() {
    try {
      const backups = await this.getBackupList();

      // 按Class型Group
// eslint-disable-next-line no-unused-vars
      const databaseBackups = backups.filter((b) => b.type === 'database');
      const filesystemBackups = backups.filter((b) => b.type === 'filesystem');

      // Delete超過保留天數的Backup
      const cutoffDate = moment()
        .subtract(this.backupRetentionDays, 'days')
        .toDate();

      const oldBackups = backups.filter(
        (backup) => backup.createdAt < cutoffDate
      );

      for (const backup of oldBackups) {
        await this.deleteBackup(backup.fileName);
      }

      // 如果Backup數量超過最大Limit，Delete最舊的
      if (databaseBackups.length > this.maxBackups) {
        const toDelete = databaseBackups.slice(this.maxBackups);
        for (const backup of toDelete) {
          await this.deleteBackup(backup.fileName);
        }
      }

      if (filesystemBackups.length > this.maxBackups) {
        const toDelete = filesystemBackups.slice(this.maxBackups);
        for (const backup of toDelete) {
          await this.deleteBackup(backup.fileName);
        }
      }

      logger.info(`清理完成，刪除了 ${oldBackups.length} 個舊備份`);
      return oldBackups.length;
    } catch (error) {
      logger.error('清理舊備份Failed:', error);
      throw error;
    }
  }

  /**
   * GetBackupStatistics
   */
  async getBackupStats() {
    try {
      const backups = await this.getBackupList();

      const stats = {
        total: backups.length,
        database: backups.filter((b) => b.type === 'database').length,
        filesystem: backups.filter((b) => b.type === 'filesystem').length,
        totalSize: 0,
        oldestBackup: null,
        newestBackup: null,
      };

      if (backups.length > 0) {
        stats.totalSize = backups.reduce(
          (sum, backup) => sum + parseFloat(backup.fileSize),
          0
        );
        stats.oldestBackup = backups[backups.length - 1];
        stats.newestBackup = backups[0];
      }

      return stats;
    } catch (error) {
      logger.error('Get備份統計Failed:', error);
      throw error;
    }
  }

  /**
   * VerifyBackup完整性
   */
  async validateBackup(fileName) {
    try {
      const backupPath = path.join(this.backupDir, fileName);

      // CheckFileYesNo存在
      await fs.access(backupPath);

      const stats = await fs.stat(backupPath);
      const fileSize = stats.size;

      // CheckFile大小YesNo合理
      if (fileSize === 0) {
        return {
          valid: false,
          error: '備份文件為空',
        };
      }

      // 對於 tar.gz File，嘗試解壓Test
      if (fileName.endsWith('.tar.gz')) {
        try {
// eslint-disable-next-line no-unused-vars
          const testCommand = `tar -tzf "${backupPath}" > /dev/null`;
          await execAsync(testCommand);
        } catch (error) {
          return {
            valid: false,
            error: '備份文件損壞或格式不正確',
          };
        }
      }

      return {
        valid: true,
        fileSize: `${(fileSize / 1024 / 1024).toFixed(2)} MB`,
        lastModified: stats.mtime,
      };
    } catch (error) {
      logger.error('Verify備份Failed:', error);
      return {
        valid: false,
        error: error.message,
      };
    }
  }
}

module.exports = new BackupService();
