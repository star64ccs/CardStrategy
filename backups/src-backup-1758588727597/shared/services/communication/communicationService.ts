import type { ApiResponse } from '../../../core/types';
import { logger } from '../../../core/utils/logger';

import { gmailService } from './gmailService';
import { sendgridService } from './sendgridService';
import { twilioService } from './twilioService';

export interface CommunicationChannel {
  email: boolean;
  sms: boolean;
  voice: boolean;
}

export interface CommunicationPreferences {
  userId: string;
  email: boolean;
  sms: boolean;
  voice: boolean;
  emailAddress?: string;
  phoneNumber?: string;
}

export interface NotificationMessage {
  userId: string;
  type:
    | 'welcome'
    | 'password_reset'
    | 'price_alert'
    | 'security_alert'
    | 'verification';
  channel: 'email' | 'sms' | 'voice' | 'all';
  data: Record<string, any>;
  priority: 'low' | 'medium' | 'high';
}

export class CommunicationService {
  private static instance: CommunicationService;
  private readonly userPreferences: Map<string, CommunicationPreferences> =
    new Map();

  private constructor() {}

  static getInstance(): CommunicationService {
    if (!CommunicationService.instance) {
      CommunicationService.instance = new CommunicationService();
    }
    return CommunicationService.instance;
  }

  /**
   * 檢查服務可用性
   */
  getAvailableChannels(): CommunicationChannel {
    return {
      email: sendgridService.isAvailable() || gmailService.isAvailable(),
      sms: twilioService.isAvailable(),
      voice: twilioService.isAvailable(),
    };
  }

  /**
   * 設置用戶通信偏好
   */
  setUserPreferences(preferences: CommunicationPreferences): void {
    this.userPreferences.set(preferences.userId, preferences);
    logger.info('User communication preferences set:', {
      userId: preferences.userId,
      preferences,
    });
  }

  /**
   * 獲取用戶通信偏好
   */
  getUserPreferences(userId: string): CommunicationPreferences | null {
    return this.userPreferences.get(userId) || null;
  }

  /**
   * 發送通知
   */
  async sendNotification(notification: NotificationMessage): Promise<
    ApiResponse<{
      successCount: number;
      failedCount: number;
      results: {
        channel: string;
        success: boolean;
        messageId?: string;
        error?: string;
      }[];
    }>
  > {
    try {
      const userPrefs = this.getUserPreferences(notification.userId);
      if (!userPrefs) {
        return {
          success: false,
          data: undefined,
          message: 'User preferences not found',
          timestamp: new Date(),
        };
      }

      const results: {
        channel: string;
        success: boolean;
        messageId?: string;
        error?: string;
      }[] = [];
      let successCount = 0;
      let failedCount = 0;

      // 根據通知類型和用戶偏好決定發送渠道
      const channels = this.determineChannels(notification, userPrefs);

      // 發送郵件
      if (channels.email && userPrefs.email && userPrefs.emailAddress) {
        const emailResult = await this.sendEmailNotification(
          notification,
          userPrefs.emailAddress
        );
        results.push({
          channel: 'email',
          success: emailResult.success,
          messageId: emailResult.success
            ? emailResult.data?.messageId
            : undefined,
          error: emailResult.success ? undefined : emailResult.message,
        });

        if (emailResult.success) successCount++;
        else failedCount++;
      }

      // 發送 SMS
      if (channels.sms && userPrefs.sms && userPrefs.phoneNumber) {
        const smsResult = await this.sendSMSNotification(
          notification,
          userPrefs.phoneNumber
        );
        results.push({
          channel: 'sms',
          success: smsResult.success,
          messageId: smsResult.success ? smsResult.data?.messageSid : undefined,
          error: smsResult.success ? undefined : smsResult.message,
        });

        if (smsResult.success) successCount++;
        else failedCount++;
      }

      // 撥打語音電話
      if (channels.voice && userPrefs.voice && userPrefs.phoneNumber) {
        const voiceResult = await this.sendVoiceNotification(
          notification,
          userPrefs.phoneNumber
        );
        results.push({
          channel: 'voice',
          success: voiceResult.success,
          messageId: voiceResult.success
            ? voiceResult.data?.callSid
            : undefined,
          error: voiceResult.success ? undefined : voiceResult.message,
        });

        if (voiceResult.success) successCount++;
        else failedCount++;
      }

      return {
        success: successCount > 0,
        data: { successCount, failedCount, results },
        message: `Sent ${successCount} notifications successfully, ${failedCount} failed`,
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error('Error sending notification:', { error, notification });
      return {
        success: false,
        data: undefined,
        message: 'Failed to send notification',
        timestamp: new Date(),
      };
    }
  }

  /**
   * 確定發送渠道
   */
  private determineChannels(
    notification: NotificationMessage,
    userPrefs: CommunicationPreferences
  ): CommunicationChannel {
    const channels: CommunicationChannel = {
      email: false,
      sms: false,
      voice: false,
    };

    if (notification.channel === 'all') {
      channels.email = userPrefs.email;
      channels.sms = userPrefs.sms;
      channels.voice = userPrefs.voice;
    } else if (notification.channel === 'email') {
      channels.email = userPrefs.email;
    } else if (notification.channel === 'sms') {
      channels.sms = userPrefs.sms;
    } else if (notification.channel === 'voice') {
      channels.voice = userPrefs.voice;
    }

    return channels;
  }

  /**
   * 發送郵件通知
   */
  private async sendEmailNotification(
    notification: NotificationMessage,
    emailAddress: string
  ): Promise<ApiResponse<{ messageId: string }>> {
    try {
      // 優先使用 SendGrid，備用 Gmail
      if (sendgridService.isAvailable()) {
        return await this.sendEmailViaSendGrid(notification, emailAddress);
      } else if (gmailService.isAvailable()) {
        return await this.sendEmailViaGmail(notification, emailAddress);
      } else {
        return {
          success: false,
          data: undefined,
          message: 'No email service available',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('Error sending email notification:', {
        error,
        notification,
      });
      return {
        success: false,
        data: undefined,
        message: 'Failed to send email notification',
        timestamp: new Date(),
      };
    }
  }

  /**
   * 通過 SendGrid 發送郵件
   */
  private async sendEmailViaSendGrid(
    notification: NotificationMessage,
    emailAddress: string
  ): Promise<ApiResponse<{ messageId: string }>> {
    switch (notification.type) {
      case 'welcome':
        return sendgridService.sendWelcomeEmail(
          emailAddress,
          notification.data.userName
        );
      case 'password_reset':
        return sendgridService.sendPasswordResetEmail(
          emailAddress,
          notification.data.resetToken,
          notification.data.resetUrl
        );
      case 'price_alert':
        return sendgridService.sendPriceAlertEmail(
          emailAddress,
          notification.data.cardName,
          notification.data.currentPrice,
          notification.data.targetPrice
        );
      case 'security_alert':
        return sendgridService.sendEmail({
          to: emailAddress,
          from: 'noreply@cardstrategy.com',
          subject: '卡策 - 安全警告',
          html: `<h2>安全警告</h2><p>${notification.data.message}</p>`,
          text: `安全警告: ${notification.data.message}`,
        });
      default:
        return sendgridService.sendEmail({
          to: emailAddress,
          from: 'noreply@cardstrategy.com',
          subject: notification.data.subject || '卡策通知',
          html: notification.data.html || `<p>${notification.data.message}</p>`,
          text: notification.data.text || notification.data.message,
        });
    }
  }

  /**
   * 通過 Gmail 發送郵件
   */
  private async sendEmailViaGmail(
    notification: NotificationMessage,
    emailAddress: string
  ): Promise<ApiResponse<{ messageId: string }>> {
    switch (notification.type) {
      case 'welcome':
        return gmailService.sendWelcomeEmail(
          emailAddress,
          notification.data.userName
        );
      case 'password_reset':
        return gmailService.sendPasswordResetEmail(
          emailAddress,
          notification.data.resetToken,
          notification.data.resetUrl
        );
      case 'price_alert':
        return gmailService.sendPriceAlertEmail(
          emailAddress,
          notification.data.cardName,
          notification.data.currentPrice,
          notification.data.targetPrice
        );
      case 'security_alert':
        return gmailService.sendSecurityAlertEmail(
          emailAddress,
          notification.data.alertType,
          notification.data.details
        );
      default:
        return gmailService.sendEmail({
          to: emailAddress,
          from: 'noreply@cardstrategy.com',
          subject: notification.data.subject || '卡策通知',
          html: notification.data.html || `<p>${notification.data.message}</p>`,
          text: notification.data.text || notification.data.message,
        });
    }
  }

  /**
   * 發送 SMS 通知
   */
  private async sendSMSNotification(
    notification: NotificationMessage,
    phoneNumber: string
  ): Promise<ApiResponse<{ messageSid: string }>> {
    try {
      switch (notification.type) {
        case 'verification':
          return await twilioService.sendVerificationCode(
            phoneNumber,
            notification.data.code
          );
        case 'price_alert':
          return await twilioService.sendPriceAlertSMS(
            phoneNumber,
            notification.data.cardName,
            notification.data.currentPrice,
            notification.data.targetPrice
          );
        case 'security_alert':
          return await twilioService.sendSecurityAlertSMS(
            phoneNumber,
            notification.data.alertType,
            notification.data.details
          );
        default:
          return await twilioService.sendSMS({
            to: phoneNumber,
            from: '',
            body: notification.data.message || '卡策通知',
          });
      }
    } catch (error) {
      logger.error('Error sending SMS notification:', { error, notification });
      return {
        success: false,
        data: undefined,
        message: 'Failed to send SMS notification',
        timestamp: new Date(),
      };
    }
  }

  /**
   * 發送語音通知
   */
  private async sendVoiceNotification(
    notification: NotificationMessage,
    phoneNumber: string
  ): Promise<ApiResponse<{ callSid: string }>> {
    try {
      switch (notification.type) {
        case 'verification':
          return await twilioService.makeVerificationCall(
            phoneNumber,
            notification.data.code
          );
        default:
          // 對於其他類型的通知，可以創建自定義的語音消息
          const twiml = `
            <Response>
              <Say language="zh-TW">卡策通知</Say>
              <Say language="zh-TW">${notification.data.message || '您有一條新的通知'}</Say>
            </Response>
          `;

          return await twilioService.makeCall({
            to: phoneNumber,
            from: '',
            twiml,
          });
      }
    } catch (error) {
      logger.error('Error sending voice notification:', {
        error,
        notification,
      });
      return {
        success: false,
        data: undefined,
        message: 'Failed to send voice notification',
        timestamp: new Date(),
      };
    }
  }

  /**
   * 批量發送通知
   */
  async sendBulkNotifications(notifications: NotificationMessage[]): Promise<
    ApiResponse<{
      successCount: number;
      failedCount: number;
      results: { userId: string; success: boolean; error?: string }[];
    }>
  > {
    try {
      if (notifications.length === 0) {
        return {
          success: true,
          data: { successCount: 0, failedCount: 0, results: [] },
          message: 'No notifications to send',
          timestamp: new Date(),
        };
      }

      const results: { userId: string; success: boolean; error?: string }[] =
        [];
      let successCount = 0;
      let failedCount = 0;

      // 並行發送通知
      const promises = notifications.map(async (notification, index) => {
        try {
          const result = await this.sendNotification(notification);
          if (result.success) {
            results[index] = { userId: notification.userId, success: true };
            successCount++;
          } else {
            results[index] = {
              userId: notification.userId,
              success: false,
              error: result.message,
            };
            failedCount++;
          }
        } catch (error) {
          results[index] = {
            userId: notification.userId,
            success: false,
            error: error.message,
          };
          failedCount++;
        }
      });

      await Promise.all(promises);

      return {
        success: successCount > 0,
        data: { successCount, failedCount, results },
        message: `Sent ${successCount} notifications successfully, ${failedCount} failed`,
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error('Error in bulk notification sending:', { error });
      return {
        success: false,
        data: undefined,
        message: 'Failed to send bulk notifications',
        timestamp: new Date(),
      };
    }
  }

  /**
   * 獲取服務統計信息
   */
  async getServiceStats(): Promise<
    ApiResponse<{
      availableChannels: CommunicationChannel;
      sendgridStats: unknown;
      twilioStats: unknown;
      gmailStats: unknown;
      totalUsers: number;
    }>
  > {
    try {
      const availableChannels = this.getAvailableChannels();

      const [sendgridStats, twilioStats, gmailStats] = await Promise.all([
        sendgridService.getServiceStats(),
        twilioService.getServiceStats(),
        gmailService.getServiceStats(),
      ]);

      return {
        success: true,
        data: {
          availableChannels,
          sendgridStats: sendgridStats.success ? sendgridStats.data : null,
          twilioStats: twilioStats.success ? twilioStats.data : null,
          gmailStats: gmailStats.success ? gmailStats.data : null,
          totalUsers: this.userPreferences.size,
        },
        message: 'Service stats retrieved successfully',
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error('Error getting communication service stats:', { error });
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
export const communicationService = CommunicationService.getInstance();
