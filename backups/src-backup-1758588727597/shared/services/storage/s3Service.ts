import { api } from '../../../core/utils/api';
import { logger } from '../../../core/utils/logger';

export interface S3File {
  key: string;
  size: number;
  lastModified: Date;
  etag: string;
  contentType?: string;
  url?: string;
  metadata?: Record<string, any>;
}

export interface S3UploadOptions {
  contentType?: string;
  metadata?: Record<string, string>;
  public?: boolean;
  expiresIn?: number;
}

export interface S3DownloadOptions {
  expiresIn?: number;
  responseContentType?: string;
  responseContentDisposition?: string;
}

export interface S3ListOptions {
  prefix?: string;
  maxKeys?: number;
  continuationToken?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message: string;
  timestamp: Date;
}

export class S3Service {
  private readonly accessKeyId: string;
  private readonly secretAccessKey: string;
  private readonly region: string;
  private readonly bucket: string;
  private readonly baseUrl: string;
  private isInitialized: boolean = false;

  constructor() {
    this.accessKeyId = process.env.AWS_S3_ACCESS_KEY || '';
    this.secretAccessKey = process.env.AWS_S3_PRIVATE_KEY || '';
    this.region = process.env.AWS_S3_REGION || 'us-east-1';
    this.bucket = process.env.AWS_S3_BUCKET || '';
    this.baseUrl = `https://s3.${this.region}.amazonaws.com`;

    if (!this.accessKeyId || !this.secretAccessKey || !this.bucket) {
      logger.warn('AWS S3 credentials not found in environment variables');
    } else {
      this.isInitialized = true;
      logger.info('S3 service initialized successfully');
    }
  }

  isAvailable(): boolean {
    return (
      this.isInitialized &&
      !!this.accessKeyId &&
      !!this.secretAccessKey &&
      !!this.bucket
    );
  }

  async uploadFile(
    key: string,
    file: Buffer | string,
    options: S3UploadOptions = {}
  ): Promise<ApiResponse<S3File>> {
    try {
      if (!this.isAvailable()) {
        return {
          success: false,
          message: 'S3 service not available',
          timestamp: new Date(),
        };
      }

      const {
        contentType = 'application/octet-stream',
        metadata = {},
        public: isPublic = false,
      } = options;

      const response = await api.post(`/api/storage/s3/upload`, {
        key,
        file: file instanceof Buffer ? file.toString('base64') : file,
        contentType,
        metadata,
        public: isPublic,
        bucket: this.bucket,
        region: this.region,
      });

      if (response.success) {
        return {
          success: true,
          data: response.data as S3File,
          message: 'File uploaded successfully',
          timestamp: new Date(),
        };
      }

      return {
        success: false,
        message: response.message || 'Upload failed',
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error('S3 upload error:', error);
      return {
        success: false,
        message: `Upload error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date(),
      };
    }
  }

  async downloadFile(
    key: string,
    options: S3DownloadOptions = {}
  ): Promise<ApiResponse<Buffer>> {
    try {
      if (!this.isAvailable()) {
        return {
          success: false,
          message: 'S3 service not available',
          timestamp: new Date(),
        };
      }

      const { expiresIn = 3600 } = options;

      const response = await api.get(`/api/storage/s3/download`, {
        params: {
          key,
          bucket: this.bucket,
          region: this.region,
          expiresIn,
        },
      });

      if (response.success) {
        return {
          success: true,
          data: Buffer.from(response.data as string, 'base64'),
          message: 'File downloaded successfully',
          timestamp: new Date(),
        };
      }

      return {
        success: false,
        message: response.message || 'Download failed',
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error('S3 download error:', error);
      return {
        success: false,
        message: `Download error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date(),
      };
    }
  }

  async deleteFile(key: string): Promise<ApiResponse> {
    try {
      if (!this.isAvailable()) {
        return {
          success: false,
          message: 'S3 service not available',
          timestamp: new Date(),
        };
      }

      const response = await api.delete(`/api/storage/s3/delete`, {
        params: {
          key,
          bucket: this.bucket,
          region: this.region,
        },
      });

      if (response.success) {
        return {
          success: true,
          message: 'File deleted successfully',
          timestamp: new Date(),
        };
      }

      return {
        success: false,
        message: response.message || 'Delete failed',
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error('S3 delete error:', error);
      return {
        success: false,
        message: `Delete error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date(),
      };
    }
  }

  async listFiles(options: S3ListOptions = {}): Promise<ApiResponse<S3File[]>> {
    try {
      if (!this.isAvailable()) {
        return {
          success: false,
          message: 'S3 service not available',
          timestamp: new Date(),
        };
      }

      const { prefix = '', maxKeys = 1000, continuationToken } = options;

      const response = await api.get(`/api/storage/s3/list`, {
        params: {
          bucket: this.bucket,
          region: this.region,
          prefix,
          maxKeys,
          continuationToken,
        },
      });

      if (response.success) {
        return {
          success: true,
          data: response.data as S3File[],
          message: 'Files listed successfully',
          timestamp: new Date(),
        };
      }

      return {
        success: false,
        message: response.message || 'List failed',
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error('S3 list error:', error);
      return {
        success: false,
        message: `List error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date(),
      };
    }
  }

  async getFileUrl(
    key: string,
    expiresIn = 3600
  ): Promise<ApiResponse<string>> {
    try {
      if (!this.isAvailable()) {
        return {
          success: false,
          message: 'S3 service not available',
          timestamp: new Date(),
        };
      }

      const response = await api.get(`/api/storage/s3/url`, {
        params: {
          key,
          bucket: this.bucket,
          region: this.region,
          expiresIn,
        },
      });

      if (response.success) {
        return {
          success: true,
          data: response.data as string,
          message: 'File URL generated successfully',
          timestamp: new Date(),
        };
      }

      return {
        success: false,
        message: response.message || 'URL generation failed',
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error('S3 URL generation error:', error);
      return {
        success: false,
        message: `URL generation error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date(),
      };
    }
  }

  async copyFile(
    sourceKey: string,
    destinationKey: string
  ): Promise<ApiResponse<S3File>> {
    try {
      if (!this.isAvailable()) {
        return {
          success: false,
          message: 'S3 service not available',
          timestamp: new Date(),
        };
      }

      const response = await api.post(`/api/storage/s3/copy`, {
        sourceKey,
        destinationKey,
        bucket: this.bucket,
        region: this.region,
      });

      if (response.success) {
        return {
          success: true,
          data: response.data as S3File,
          message: 'File copied successfully',
          timestamp: new Date(),
        };
      }

      return {
        success: false,
        message: response.message || 'Copy failed',
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error('S3 copy error:', error);
      return {
        success: false,
        message: `Copy error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date(),
      };
    }
  }

  async getFileMetadata(key: string): Promise<ApiResponse<S3File>> {
    try {
      if (!this.isAvailable()) {
        return {
          success: false,
          message: 'S3 service not available',
          timestamp: new Date(),
        };
      }

      const response = await api.get(`/api/storage/s3/metadata`, {
        params: {
          key,
          bucket: this.bucket,
          region: this.region,
        },
      });

      if (response.success) {
        return {
          success: true,
          data: response.data as S3File,
          message: 'File metadata retrieved successfully',
          timestamp: new Date(),
        };
      }

      return {
        success: false,
        message: response.message || 'Metadata retrieval failed',
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error('S3 metadata error:', error);
      return {
        success: false,
        message: `Metadata error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date(),
      };
    }
  }

  async batchUploadFiles(
    files: {
      key: string;
      file: Buffer | string;
      options?: S3UploadOptions;
    }[]
  ): Promise<ApiResponse<S3File[]>> {
    try {
      if (!this.isAvailable()) {
        return {
          success: false,
          message: 'S3 service not available',
          timestamp: new Date(),
        };
      }

      if (files.length === 0) {
        return {
          success: true,
          data: [],
          message: 'No files to upload',
          timestamp: new Date(),
        };
      }

      const uploadPromises = files.map(({ key, file, options }) =>
        this.uploadFile(key, file, options)
      );

      const results = await Promise.all(uploadPromises);
      const successfulUploads = results.filter(result => result.success);
      const failedUploads = results.filter(result => !result.success);

      if (failedUploads.length > 0) {
        logger.warn(`${failedUploads.length} files failed to upload`);
      }

      return {
        success: successfulUploads.length > 0,
        data: successfulUploads
          .map(result => result.data)
          .filter(Boolean) as S3File[],
        message: `Uploaded ${successfulUploads.length}/${files.length} files successfully`,
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error('S3 batch upload error:', error);
      return {
        success: false,
        message: `Batch upload error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date(),
      };
    }
  }

  async getServiceStats(): Promise<ApiResponse> {
    try {
      if (!this.isAvailable()) {
        return {
          success: false,
          message: 'S3 service not available',
          timestamp: new Date(),
        };
      }

      const listResponse = await this.listFiles({ maxKeys: 1 });

      return {
        success: true,
        data: {
          service: 'AWS S3',
          bucket: this.bucket,
          region: this.region,
          available: this.isAvailable(),
          filesCount: listResponse.success ? 'Available' : 'Unknown',
        },
        message: 'S3 service statistics retrieved',
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error('S3 stats error:', error);
      return {
        success: false,
        message: `Stats error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date(),
      };
    }
  }
}

export const s3Service = new S3Service();
