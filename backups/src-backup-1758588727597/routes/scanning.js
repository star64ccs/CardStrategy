// 卡牌掃描 API
import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import CardFileHandler from '../services/CardFileHandler.js';
import OptimizedUpload from '../services/OptimizedUpload.js';
import CardRecognition from '../services/CardRecognition.js';

const router = express.Router();

// 配置 multer
const storage = multer.diskStorage({
  destination: 'uploads/temp/',
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

/**
 * 掃描卡牌
 */
router.post('/scan', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: '沒有上傳圖片'
      });
    }

    // 處理文件
    const fileResult = await CardFileHandler.processUploadedFile(req.file);
    if (!fileResult.success) {
      return res.status(400).json({
        success: false,
        error: fileResult.error
      });
    }

    // 識別卡牌
    const recognitionResult = await CardRecognition.recognizeCard(
      fileResult.data.compressed.path
    );

    if (!recognitionResult.success) {
      return res.status(500).json({
        success: false,
        error: recognitionResult.error
      });
    }

    // 清理臨時文件
    await CardFileHandler.cleanupTempFiles([
      req.file.path,
      fileResult.data.compressed.path,
      fileResult.data.thumbnail.path
    ]);

    res.json({
      success: true,
      data: {
        file: fileResult.data,
        recognition: recognitionResult.data
      }
    });

  } catch (error) {
    console.error('掃描錯誤:', error);
    res.status(500).json({
      success: false,
      error: '掃描失敗，請重試'
    });
  }
});

/**
 * 分塊上傳
 */
router.post('/upload/chunk', async (req, res) => {
  try {
    const { uploadId, chunkIndex, totalChunks } = req.body;
    const chunk = req.files?.chunk;

    if (!chunk) {
      return res.status(400).json({
        success: false,
        error: '沒有上傳文件塊'
      });
    }

    // 保存文件塊
    const chunkPath = path.join('uploads/chunks', uploadId, `chunk_${chunkIndex}`);
    await fs.mkdir(path.dirname(chunkPath), { recursive: true });
    await fs.rename(chunk.path, chunkPath);

    res.json({
      success: true,
      data: {
        uploadId,
        chunkIndex,
        totalChunks
      }
    });

  } catch (error) {
    console.error('塊上傳錯誤:', error);
    res.status(500).json({
      success: false,
      error: '塊上傳失敗'
    });
  }
});

/**
 * 完成上傳
 */
router.post('/upload/finalize', async (req, res) => {
  try {
    const { uploadId } = req.body;
    
    // 合併文件塊
    const chunksDir = path.join('uploads/chunks', uploadId);
    const chunks = await fs.readdir(chunksDir);
    chunks.sort((a, b) => parseInt(a.split('_')[1]) - parseInt(b.split('_')[1]));

    const finalPath = path.join('uploads', `${uploadId}.tmp`);
    const writeStream = fs.createWriteStream(finalPath);

    for (const chunk of chunks) {
      const chunkPath = path.join(chunksDir, chunk);
      const chunkData = await fs.readFile(chunkPath);
      writeStream.write(chunkData);
    }

    writeStream.end();

    // 清理文件塊
    await fs.rmdir(chunksDir, { recursive: true });

    res.json({
      success: true,
      data: {
        uploadId,
        path: finalPath
      }
    });

  } catch (error) {
    console.error('完成上傳錯誤:', error);
    res.status(500).json({
      success: false,
      error: '完成上傳失敗'
    });
  }
});

/**
 * 取消上傳
 */
router.delete('/upload/cancel', async (req, res) => {
  try {
    const { uploadId } = req.body;
    
    // 清理文件塊
    const chunksDir = path.join('uploads/chunks', uploadId);
    try {
      await fs.rmdir(chunksDir, { recursive: true });
    } catch (error) {
      // 目錄可能不存在
    }

    res.json({
      success: true,
      message: '上傳已取消'
    });

  } catch (error) {
    console.error('取消上傳錯誤:', error);
    res.status(500).json({
      success: false,
      error: '取消失敗'
    });
  }
});

/**
 * 獲取掃描配置
 */
router.get('/config', (req, res) => {
  res.json({
    success: true,
    data: {
      maxFileSize: 10 * 1024 * 1024, // 10MB
      supportedFormats: ['jpg', 'jpeg', 'png', 'webp'],
      maxChunkSize: 1024 * 1024, // 1MB
      maxChunks: 10
    }
  });
});

export default router;
