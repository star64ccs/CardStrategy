import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { uploadConfig } from '../config/upload-config.js';

// 創建上傳目錄
const ensureUploadDirs = async () => {
  const dirs = [
    uploadConfig.upload.destination,
    uploadConfig.upload.tempDestination
  ];
  
  for (const dir of dirs) {
    try {
      await fs.mkdir(dir, { recursive: true });
    } catch (error) {
      // 目錄可能已存在
    }
  }
};

// 配置 multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadConfig.upload.tempDestination);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// 文件過濾器
const fileFilter = (req, file, cb) => {
  const config = uploadConfig.limits.image;
  
  // 檢查文件類型
  if (!config.allowedTypes.includes(file.mimetype)) {
    return cb(new Error(uploadConfig.errorMessages.invalidType), false);
  }
  
  // 檢查文件擴展名
  const ext = path.extname(file.originalname).toLowerCase();
  if (!config.allowedExtensions.includes(ext)) {
    return cb(new Error(uploadConfig.errorMessages.invalidType), false);
  }
  
  cb(null, true);
};

// 創建 multer 實例
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: uploadConfig.limits.image.maxSize,
    files: 5 // 最多 5 個文件
  }
});

// 文件驗證中間件
export const validateFileUpload = (req, res, next) => {
  upload.array('files', 5)(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          error: uploadConfig.errorMessages.fileTooLarge
        });
      }
      if (err.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({
          success: false,
          error: '最多只能上傳 5 個文件'
        });
      }
      if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({
          success: false,
          error: '不支持的文件字段名'
        });
      }
    }
    
    if (err) {
      return res.status(400).json({
        success: false,
        error: err.message
      });
    }
    
    next();
  });
};

// 單個文件驗證
export const validateSingleFile = (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          error: uploadConfig.errorMessages.fileTooLarge
        });
      }
    }
    
    if (err) {
      return res.status(400).json({
        success: false,
        error: err.message
      });
    }
    
    next();
  });
};

// 初始化上傳目錄
export const initializeUploadDirs = async (req, res, next) => {
  try {
    await ensureUploadDirs();
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '無法創建上傳目錄'
    });
  }
};

export default {
  validateFileUpload,
  validateSingleFile,
  initializeUploadDirs
};
