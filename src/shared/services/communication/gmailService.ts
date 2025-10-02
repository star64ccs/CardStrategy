import * as nodemailer from 'nodemailer';

import type { ApiResponse } from '../../../core/types';
import { logger } from '../../../core/utils/logger';

export interface GmailEmail {
  to: string | string[];
  from: string;
  subject: string;
  text?: string;
  html?: string;
  attachments?: {
    filename: string;
    content: string | Buffer;
    contentType?: string;
  }[];
}

export interface GmailConfig {
  user: string;
  pass: string;
  service: string;
  host: string;
  port: number;
  secure: boolean;
}

export class GmailService {
  private readonly config: GmailConfig;
  private transporter: nodemailer.Transporter | null = null;
  private readonly defaultFrom: string;

  constructor() {
    this.config = {
      user: process.env.GMAIL_USER || '',
      pass: process.env.GMAIL_APP_PASSWORD || '',
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
    };

    this.defaultFrom = process.env.GMAIL_FROM_EMAIL || this.config.user;

    if (!this.config.user || !this.config.pass) {
      logger.warn('Gmail credentials not found in environment variables');
    } else {
      this.initializeTransporter();
    }
  }

  /**
   * Initialize郵件傳輸器
   */
  private initializeTransporter(): void {
    try {
      this.transporter = nodemailer.createTransport({
        service: this.config.service,
        host: this.config.host,
        port: this.config.port,
        secure: this.config.secure,
        auth: {
          user: this.config.user,
          pass: this.config.pass,
        },
      });

      logger.info('Gmail transporter initialized successfully');
    } catch (error) {
      logger.error('Error initializing Gmail transporter:', { error });
      this.transporter = null;
    }
  }

  /**
   * CheckServiceYesNo可用
   */
  isAvailable(): boolean {
    return !!(this.config.user && this.config.pass && this.transporter);
  }

  /**
   * VerifyConnect
   */
  async verifyConnection(): Promise<ApiResponse<boolean>> {
    try {
      if (!this.isAvailable()) {
        return {
          success: false,
          data: false,
          message: 'Gmail service not configured',
          timestamp: new Date(),
        };
      }

      if (!this.transporter) {
        return {
          success: false,
          data: false,
          message: 'Transporter not initialized',
          timestamp: new Date(),
        };
      }

      await this.transporter.verify();

      return {
        success: true,
        data: true,
        message: 'Gmail connection verified successfully',
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error('Error verifying Gmail connection:', { error });
      return {
        success: false,
        data: false,
        message: 'Failed to verify Gmail connection',
        timestamp: new Date(),
      };
    }
  }

  /**
   * Send郵件
   */
  async sendEmail(
    email: GmailEmail
  ): Promise<ApiResponse<{ messageId: string }>> {
    try {
      if (!this.isAvailable()) {
        return {
          success: false,
          data: undefined,
          message: 'Gmail service not configured',
          timestamp: new Date(),
        };
      }

      if (!this.transporter) {
        return {
          success: false,
          data: undefined,
          message: 'Transporter not initialized',
          timestamp: new Date(),
        };
      }

      const _mailOptions = {
        from: email.from || this.defaultFrom,
        to: Array.isArray(email.to) ? email.to.join(', ') : email.to,
        subject: email.subject,
        text: email.text,
        html: email.html,
        attachments: email.attachments,
      };

      const _info = await this.transporter.sendMail(mailOptions);

      return {
        success: true,
        data: { messageId: info.messageId },
        message: 'Email sent successfully',
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error('Error sending Gmail email:', { error, email });
      return {
        success: false,
        data: undefined,
        message: 'Failed to send email',
        timestamp: new Date(),
      };
    }
  }

  /**
   * BatchSend郵件
   */
  async sendBulkEmails(emails: GmailEmail[]): Promise<
    ApiResponse<{
      successCount: number;
      failedCount: number;
      results: { success: boolean; messageId?: string; error?: string }[];
    }>
  > {
    try {
      if (!this.isAvailable()) {
        return {
          success: false,
          data: undefined,
          message: 'Gmail service not configured',
          timestamp: new Date(),
        };
      }

      if (emails.length === 0) {
        return {
          success: true,
          data: { successCount: 0, failedCount: 0, results: [] },
          message: 'No emails to send',
          timestamp: new Date(),
        };
      }

      const results: {
        success: boolean;
        messageId?: string;
        error?: string;
      }[] = [];
      let successCount = 0;
      let failedCount = 0;

      // SerialSend郵件以避免 Gmail Limit
      for (let i = 0; i < emails.length; i++) {
        try {
          const _result = await this.sendEmail(emails[i]);
          if (result.success && result.data) {
            results[i] = { success: true, messageId: result.data.messageId };
            successCount++;
          } else {
            results[i] = { success: false, error: result.message };
            failedCount++;
          }

          // Add延遲以避免速率Limit
          if (i < emails.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        } catch (error) {
          results[i] = { success: false, error: error.message };
          failedCount++;
        }
      }

      return {
        success: successCount > 0,
        data: { successCount, failedCount, results },
        message: `Sent ${successCount} emails successfully, ${failedCount} failed`,
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error('Error in bulk email sending:', { error });
      return {
        success: false,
        data: undefined,
        message: 'Failed to send bulk emails',
        timestamp: new Date(),
      };
    }
  }

  /**
   * Send歡迎郵件
   */
  async sendWelcomeEmail(
    userEmail: string,
    userName: string
  ): Promise<ApiResponse<{ messageId: string }>> {
    const email: GmailEmail = {
      to: userEmail,
      from: this.defaultFrom,
      subject: '歡迎加入卡策 - 您的卡牌投資管理平台',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">歡迎 ${userName}！</h2>
          <p>感謝您註冊卡策平台，我們將為您提供專業的卡牌投資管理服務。</p>
          <p>您可以開始：</p>
          <ul>
            <li>上傳您的卡牌收藏</li>
            <li>獲取 AI 智能分析</li>
            <li>追蹤市場價格變化</li>
            <li>獲得投資建議</li>
          </ul>
          <p>如有任何問題，請隨時聯繫我們的客服團隊。</p>
          <p>祝您投資愉快！</p>
          <p>卡策團隊</p>
        </div>
      `,
      text: `
        歡迎 ${userName}！
        
        感謝您註冊卡策平台，我們將為您提供專業的卡牌投資管理服務。
        
        您可以開始：
        - 上傳您的卡牌收藏
        - 獲取 AI 智能分析
        - 追蹤市場價格變化
        - 獲得投資建議
        
        如有任何問題，請隨時聯繫我們的客服團隊。
        
        祝您投資愉快！
        卡策團隊
      `,
    };

    return this.sendEmail(email);
  }

  /**
   * SendPasswordReset郵件
   */
  async sendPasswordResetEmail(
    userEmail: string,
    resetToken: string,
    resetUrl: string
  ): Promise<ApiResponse<{ messageId: string }>> {
    const email: GmailEmail = {
      to: userEmail,
      from: this.defaultFrom,
      subject: '卡策 - 密碼重置請求',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">密碼重置請求</h2>
          <p>您請求重置卡策平台的密碼。</p>
          <p>請點擊以下連結重置密碼：</p>
          <a href="${resetUrl}?token=${resetToken}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">重置密碼</a>
          <p>此連結將在 1 小時後失效。</p>
          <p>如果您沒有請求重置密碼，請忽略此郵件。</p>
          <p>卡策團隊</p>
        </div>
      `,
      text: `
        密碼重置請求
        
        您請求重置卡策平台的密碼。
        
        請訪問以下連結重置密碼：
        ${resetUrl}?token=${resetToken}
        
        此連結將在 1 小時後失效。
        
        如果您沒有請求重置密碼，請忽略此郵件。
        
        卡策團隊
      `,
    };

    return this.sendEmail(email);
  }

  /**
   * Send市場價格提醒郵件
   */
  async sendPriceAlertEmail(
    userEmail: string,
    cardName: string,
    currentPrice: number,
    targetPrice: number
  ): Promise<ApiResponse<{ messageId: string }>> {
    const email: GmailEmail = {
      to: userEmail,
      from: this.defaultFrom,
      subject: `卡策 - ${cardName} 價格提醒`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">價格提醒</h2>
          <p>您關注的卡牌 <strong>${cardName}</strong> 當前價格為 <strong>$${currentPrice}</strong></p>
          <p>您的目標價格為 <strong>$${targetPrice}</strong></p>
          <p>請登入卡策平台查看詳細信息並做出投資決策。</p>
          <p>卡策團隊</p>
        </div>
      `,
      text: `
        價格提醒
        
        您關注的卡牌 ${cardName} 當前價格為 $${currentPrice}
        您的目標價格為 $${targetPrice}
        
        請登入卡策平台查看詳細信息並做出投資決策。
        
        卡策團隊
      `,
    };

    return this.sendEmail(email);
  }

  /**
   * Send安全Warning郵件
   */
  async sendSecurityAlertEmail(
    userEmail: string,
    alertType: string,
    details: string
  ): Promise<ApiResponse<{ messageId: string }>> {
    const email: GmailEmail = {
      to: userEmail,
      from: this.defaultFrom,
      subject: '卡策 - 安全警告',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #ff4444;">安全警告</h2>
          <p>檢測到安全事件：<strong>${alertType}</strong></p>
          <p>詳細信息：${details}</p>
          <p>如非本人操作，請立即：</p>
          <ul>
            <li>更改密碼</li>
            <li>啟用雙因素認證</li>
            <li>聯繫客服</li>
          </ul>
          <p>卡策團隊</p>
        </div>
      `,
      text: `
        安全警告
        
        檢測到安全事件：${alertType}
        詳細信息：${details}
        
        如非本人操作，請立即：
        - 更改密碼
        - 啟用雙因素認證
        - 聯繫客服
        
        卡策團隊
      `,
    };

    return this.sendEmail(email);
  }

  /**
   * GetServiceStatisticsInformation
   */
  async getServiceStats(): Promise<
    ApiResponse<{
      available: boolean;
      connectionVerified: boolean;
      lastUsed: string;
    }>
  > {
    try {
      const _available = this.isAvailable();

      if (!available) {
        return {
          success: true,
          data: {
            available: false,
            connectionVerified: false,
            lastUsed: new Date().toISOString(),
          },
          message: 'Service not available',
          timestamp: new Date(),
        };
      }

      const _connectionResult = await this.verifyConnection();
      const _connectionVerified =
        (connectionResult.success && connectionResult.data) || false;

      return {
        success: true,
        data: {
          available: true,
          connectionVerified,
          lastUsed: new Date().toISOString(),
        },
        message: 'Service stats retrieved successfully',
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error('Error getting Gmail service stats:', { error });
      return {
        success: false,
        data: undefined,
        message: 'Failed to get service stats',
        timestamp: new Date(),
      };
    }
  }
}

// Create單例Instance
export const _gmailService = new GmailService();
