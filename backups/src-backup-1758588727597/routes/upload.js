import express from 'express';
import { validateFileUpload, validateSingleFile, initializeUploadDirs } from '../middleware/fileValidation.js';
import uploadErrorHandler from '../utils/uploadErrorHandler.js';
import ImageCompressionService from '../services/ImageCompressionService.js';
import path from 'path';
import fs from 'fs/promises';

const router = express.Router();

// 應用中間件
router.use(initializeUploadDirs);

/**
 * 上傳單個文件
 */
router.post('/single', validateSingleFile, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: '沒有上傳文件'
      });
    }

    const { filename, path: tempPath, size } = req.file;
    
    // 壓縮圖片
    const compressedPath = path.join('uploads/', `compressed_${filename}`);
    const compressionResult = await ImageCompressionService.compressImage(
      tempPath,
      compressedPath
    );

    if (!compressionResult.success) {
      throw new Error(`圖片壓縮失敗: ${compressionResult.error}`);
    }

    // 生成縮略圖
    const thumbnailPath = path.join('uploads/', `thumb_${filename}`);
    const thumbnailResult = await ImageCompressionService.generateThumbnail(
      tempPath,
      thumbnailPath
    );

    // 清理臨時文件
    await fs.unlink(tempPath);

    res.json({
      success: true,
      data: {
        original: {
          filename,
          size,
          path: tempPath
        },
        compressed: {
          filename: `compressed_${filename}`,
          size: compressionResult.compressedSize,
          path: compressedPath,
          compressionRatio: compressionResult.compressionRatio
        },
        thumbnail: thumbnailResult.success ? {
          filename: `thumb_${filename}`,
          path: thumbnailPath,
          dimensions: thumbnailResult.dimensions
        } : null
      }
    });

  } catch (error) {
    uploadErrorHandler.handleUploadError(error, req, res);
  }
});

/**
 * 批量上傳文件
 */
router.post('/multiple', validateFileUpload, async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: '沒有上傳文件'
      });
    }

    const results = [];

    for (const file of req.files) {
      try {
        const { filename, path: tempPath, size } = file;
        
        // 壓縮圖片
        const compressedPath = path.join('uploads/', `compressed_${filename}`);
        const compressionResult = await ImageCompressionService.compressImage(
          tempPath,
          compressedPath
        );

        // 生成縮略圖
        const thumbnailPath = path.join('uploads/', `thumb_${filename}`);
        const thumbnailResult = await ImageCompressionService.generateThumbnail(
          tempPath,
          thumbnailPath
        );

        // 清理臨時文件
        await fs.unlink(tempPath);

        results.push({
          filename,
          success: true,
          original: { size, path: tempPath },
          compressed: compressionResult.success ? {
            size: compressionResult.compressedSize,
            path: compressedPath,
            compressionRatio: compressionResult.compressionRatio
          } : null,
          thumbnail: thumbnailResult.success ? {
            path: thumbnailPath,
            dimensions: thumbnailResult.dimensions
          } : null
        });

      } catch (error) {
        results.push({
          filename: file.filename,
          success: false,
          error: error.message
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.length - successCount;

    res.json({
      success: failureCount === 0,
      data: {
        total: results.length,
        success: successCount,
        failed: failureCount,
        results
      }
    });

  } catch (error) {
    uploadErrorHandler.handleUploadError(error, req, res);
  }
});

/**
 * 獲取上傳進度 (WebSocket 或 Server-Sent Events)
 */
router.get('/progress/:uploadId', (req, res) => {
  const { uploadId } = req.params;
  
  // 這裡應該從 Redis 或內存中獲取進度
  // 示例實現
  const progress = global.uploadProgress[uploadId] || {
    progress: 0,
    status: 'pending'
  };
  
  res.json({
    success: true,
    data: progress
  });
});

/**
 * 取消上傳
 */
router.delete('/cancel/:uploadId', async (req, res) => {
  try {
    const { uploadId } = req.params;
    
    // 清理相關的臨時文件和進度信息
    delete global.uploadProgress[uploadId];
    
    res.json({
      success: true,
      message: '上傳已取消'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '取消失敗'
    });
  }
});

/**
 * 獲取上傳配置
 */
router.get('/config', (req, res) => {
  res.json({
    success: true,
    data: {
      maxFileSize: 10 * 1024 * 1024, // 10MB
      allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
      maxFiles: 5
    }
  });
});

export default router;
