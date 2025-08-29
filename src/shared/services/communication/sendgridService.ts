import type { ApiResponse } from '../../../core/types';
import { api } from '../../../core/utils/api';
import { logger } from '../../../core/utils/logger';

export interface SendGridEmail {
  to: string | string[];
  from: string;
  subject: string;
  text?: string;
  html?: string;
  templateId?: string;
  dynamicTemplateData?: Record<string, any>;
  attachments?: {
    content: string;
    filename: string;
    type: string;
    disposition?: string;
  }[];
}

export interface SendGridTemplate {
  id: string;
  name: string;
  version: string;
  subject: string;
  htmlContent: string;
  plainContent: string;
  active: boolean;
}

export class SendGridService {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly defaultFrom: string;

  constructor() {
    this.apiKey = process.env.SENDGRID_API_KEY || '';
    this.baseUrl = 'https://api.sendgrid.com/v3';
    this.defaultFrom =
      process.env.SENDGRID_FROM_EMAIL || 'noreply@cardstrategy.com';

    if (!this.apiKey) {
      logger.warn('SendGrid API key not found in environment variables');
    }
  }

  /**
   * 檢查服務是否可用
   */
  isAvailable(): boolean {
    return !!this.apiKey;
  }

  /**
   * 發送郵件
   */
  async sendEmail(
    email: SendGridEmail
  ): Promise<ApiResponse<{ messageId: string }>> {
    try {
      if (!this.isAvailable()) {
        return {
          success: false,
          data: undefined,
          message: 'SendGrid API key not configured',
          timestamp: new Date(),
        };
      }

      const _payload = {
        personalizations: [
          {
            to: Array.isArray(email.to)
              ? email.to.map(addr => ({ email: addr }))
              : [{ email: email.to }],
          },
        ],
        from: { email: email.from || this.defaultFrom },
        subject: email.subject,
      };

      if (email.templateId) {
        (payload.personalizations[0] as any).dynamic_template_data =
          email.dynamicTemplateData;
        (payload as any).template_id = email.templateId;
      } else {
        if (email.text) {
          (payload as any).content = [
            { type: 'text/plain', value: email.text },
          ];
        }
        if (email.html) {
          (payload as any).content = [{ type: 'text/html', value: email.html }];
        }
      }

      if (email.attachments && email.attachments.length > 0) {
        (payload as any).attachments = email.attachments;
      }

      const _response = await api.post(`${this.baseUrl}/mail/send`, payload, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.success) {
        return {
          success: true,
          data: { messageId: (response.data as any)?.message_id || 'unknown' },
          message: 'Email sent successfully',
          timestamp: new Date(),
        };
      }

      return {
        success: false,
        data: undefined,
        message: response.message || 'Failed to send email',
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error('Error sending SendGrid email:', { error, email });
      return {
        success: false,
        data: undefined,
        message: 'Failed to send email',
        timestamp: new Date(),
      };
    }
  }

  /**
   * 批量發送郵件
   */
  async sendBulkEmails(emails: SendGridEmail[]): Promise<
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
          message: 'SendGrid API key not configured',
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

      // 並行發送郵件
      const _promises = emails.map(async (email, index) => {
        try {
          const _result = await this.sendEmail(email);
          if (result.success && result.data) {
            results[index] = {
              success: true,
              messageId: result.data.messageId,
            };
            successCount++;
          } else {
            results[index] = { success: false, error: result.message };
            failedCount++;
          }
        } catch (error) {
          results[index] = { success: false, error: error.message };
          failedCount++;
        }
      });

      await Promise.all(promises);

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
   * 獲取模板列表
   */
  async getTemplates(): Promise<ApiResponse<SendGridTemplate[]>> {
    try {
      if (!this.isAvailable()) {
        return {
          success: false,
          data: [],
          message: 'SendGrid API key not configured',
          timestamp: new Date(),
        };
      }

      const _response = await api.get(`${this.baseUrl}/templates`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.success && response.data) {
        return {
          success: true,
          data: (response.data as any).templates || [],
          message: 'Templates retrieved successfully',
          timestamp: new Date(),
        };
      }

      return {
        success: false,
        data: [],
        message: response.message || 'Failed to retrieve templates',
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error('Error getting SendGrid templates:', { error });
      return {
        success: false,
        data: [],
        message: 'Failed to retrieve templates',
        timestamp: new Date(),
      };
    }
  }

  /**
   * 發送歡迎郵件
   */
  async sendWelcomeEmail(
    userEmail: string,
    userName: string
  ): Promise<ApiResponse<{ messageId: string }>> {
    const email: SendGridEmail = {
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
   * 發送密碼重置郵件
   */
  async sendPasswordResetEmail(
    userEmail: string,
    resetToken: string,
    resetUrl: string
  ): Promise<ApiResponse<{ messageId: string }>> {
    const email: SendGridEmail = {
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
   * 發送市場價格提醒郵件
   */
  async sendPriceAlertEmail(
    userEmail: string,
    cardName: string,
    currentPrice: number,
    targetPrice: number
  ): Promise<ApiResponse<{ messageId: string }>> {
    const email: SendGridEmail = {
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
   * 獲取服務統計信息
   */
  async getServiceStats(): Promise<
    ApiResponse<{
      available: boolean;
      templatesCount: number;
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
            templatesCount: 0,
            lastUsed: new Date().toISOString(),
          },
          message: 'Service not available',
          timestamp: new Date(),
        };
      }

      const _templatesResult = await this.getTemplates();
      const _templatesCount =
        templatesResult.success && templatesResult.data
          ? templatesResult.data.length
          : 0;

      return {
        success: true,
        data: {
          available: true,
          templatesCount,
          lastUsed: new Date().toISOString(),
        },
        message: 'Service stats retrieved successfully',
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error('Error getting SendGrid service stats:', { error });
      return {
        success: false,
        data: undefined,
        message: 'Failed to get service stats',
        timestamp: new Date(),
      };
    }
  }
}

// 創建單例實例
export const _sendgridService = new SendGridService();
