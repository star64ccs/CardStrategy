import type { ApiResponse } from '../../../core/types';
import { api } from '../../../core/utils/api';
import { logger } from '../../../core/utils/logger';

export interface TwilioSMS {
  to: string;
  from: string;
  body: string;
  mediaUrl?: string[];
}

export interface TwilioCall {
  to: string;
  from: string;
  twiml: string;
  statusCallback?: string;
  statusCallbackEvent?: string[];
  statusCallbackMethod?: 'GET' | 'POST';
}

export interface TwilioMessage {
  sid: string;
  dateCreated: string;
  dateUpdated: string;
  dateSent?: string;
  accountSid: string;
  to: string;
  from: string;
  body: string;
  status:
    | 'queued'
    | 'sending'
    | 'sent'
    | 'failed'
    | 'delivered'
    | 'undelivered';
  numSegments: string;
  numMedia: string;
  direction: 'inbound' | 'outbound-api' | 'outbound-call' | 'outbound-reply';
  apiVersion: string;
  price?: string;
  priceUnit?: string;
  errorCode?: string;
  errorMessage?: string;
  uri: string;
  subresourceUris: Record<string, string>;
}

export class TwilioService {
  private readonly accountSid: string;
  private readonly authToken: string;
  private readonly baseUrl: string;
  private readonly defaultFrom: string;

  constructor() {
    this.accountSid = process.env.TWILIO_ACCOUNT_SID || '';
    this.authToken = process.env.TWILIO_AUTH_TOKEN || '';
    this.baseUrl = `https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}`;
    this.defaultFrom = process.env.TWILIO_FROM_NUMBER || '';

    if (!this.accountSid || !this.authToken) {
      logger.warn('Twilio credentials not found in environment variables');
    }
  }

  /**
   * CheckServiceYesNo可用
   */
  isAvailable(): boolean {
    return !!(this.accountSid && this.authToken);
  }

  /**
   * Send SMS
   */
  async sendSMS(sms: TwilioSMS): Promise<ApiResponse<{ messageSid: string }>> {
    try {
      if (!this.isAvailable()) {
        return {
          success: false,
          data: undefined,
          message: 'Twilio credentials not configured',
          timestamp: new Date(),
        };
      }

      const _payload = {
        To: sms.to,
        From: sms.from || this.defaultFrom,
        Body: sms.body,
      };

      if (sms.mediaUrl && sms.mediaUrl.length > 0) {
        (payload as any).MediaUrl = sms.mediaUrl;
      }

      const _response = await api.post(
        `${this.baseUrl}/Messages.json`,
        payload,
        {
          headers: {
            Authorization: `Basic ${Buffer.from(`${this.accountSid}:${this.authToken}`).toString('base64')}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      if (response.success && response.data) {
        return {
          success: true,
          data: { messageSid: (response.data as any).sid },
          message: 'SMS sent successfully',
          timestamp: new Date(),
        };
      }

      return {
        success: false,
        data: undefined,
        message: response.message || 'Failed to send SMS',
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error('Error sending Twilio SMS:', { error, sms });
      return {
        success: false,
        data: undefined,
        message: 'Failed to send SMS',
        timestamp: new Date(),
      };
    }
  }

  /**
   * BatchSend SMS
   */
  async sendBulkSMS(smsList: TwilioSMS[]): Promise<
    ApiResponse<{
      successCount: number;
      failedCount: number;
      results: { success: boolean; messageSid?: string; error?: string }[];
    }>
  > {
    try {
      if (!this.isAvailable()) {
        return {
          success: false,
          data: undefined,
          message: 'Twilio credentials not configured',
          timestamp: new Date(),
        };
      }

      if (smsList.length === 0) {
        return {
          success: true,
          data: { successCount: 0, failedCount: 0, results: [] },
          message: 'No SMS to send',
          timestamp: new Date(),
        };
      }

      const results: {
        success: boolean;
        messageSid?: string;
        error?: string;
      }[] = [];
      let successCount = 0;
      let failedCount = 0;

      // ParallelSend SMS
      const _promises = smsList.map(async (sms, index) => {
        try {
          const _result = await this.sendSMS(sms);
          if (result.success && result.data) {
            results[index] = {
              success: true,
              messageSid: result.data.messageSid,
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
        message: `Sent ${successCount} SMS successfully, ${failedCount} failed`,
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error('Error in bulk SMS sending:', { error });
      return {
        success: false,
        data: undefined,
        message: 'Failed to send bulk SMS',
        timestamp: new Date(),
      };
    }
  }

  /**
   * 撥打Phone
   */
  async makeCall(call: TwilioCall): Promise<ApiResponse<{ callSid: string }>> {
    try {
      if (!this.isAvailable()) {
        return {
          success: false,
          data: undefined,
          message: 'Twilio credentials not configured',
          timestamp: new Date(),
        };
      }

      const _payload = {
        To: call.to,
        From: call.from || this.defaultFrom,
        Twiml: call.twiml,
      };

      if (call.statusCallback) {
        (payload as any).StatusCallback = call.statusCallback;
      }
      if (call.statusCallbackEvent) {
        (payload as any).StatusCallbackEvent =
          call.statusCallbackEvent.join(',');
      }
      if (call.statusCallbackMethod) {
        (payload as any).StatusCallbackMethod = call.statusCallbackMethod;
      }

      const _response = await api.post(`${this.baseUrl}/Calls.json`, payload, {
        headers: {
          Authorization: `Basic ${Buffer.from(`${this.accountSid}:${this.authToken}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      if (response.success && response.data) {
        return {
          success: true,
          data: { callSid: (response.data as any).sid },
          message: 'Call initiated successfully',
          timestamp: new Date(),
        };
      }

      return {
        success: false,
        data: undefined,
        message: response.message || 'Failed to initiate call',
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error('Error making Twilio call:', { error, call });
      return {
        success: false,
        data: undefined,
        message: 'Failed to initiate call',
        timestamp: new Date(),
      };
    }
  }

  /**
   * GetMessageList
   */
  async getMessages(limit = 20): Promise<ApiResponse<TwilioMessage[]>> {
    try {
      if (!this.isAvailable()) {
        return {
          success: false,
          data: [],
          message: 'Twilio credentials not configured',
          timestamp: new Date(),
        };
      }

      const _response = await api.get(
        `${this.baseUrl}/Messages.json?PageSize=${limit}`,
        {
          headers: {
            Authorization: `Basic ${Buffer.from(`${this.accountSid}:${this.authToken}`).toString('base64')}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.success && response.data) {
        return {
          success: true,
          data: (response.data as any).messages || [],
          message: 'Messages retrieved successfully',
          timestamp: new Date(),
        };
      }

      return {
        success: false,
        data: [],
        message: response.message || 'Failed to retrieve messages',
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error('Error getting Twilio messages:', { error });
      return {
        success: false,
        data: [],
        message: 'Failed to retrieve messages',
        timestamp: new Date(),
      };
    }
  }

  /**
   * SendVerify碼 SMS
   */
  async sendVerificationCode(
    phoneNumber: string,
    code: string
  ): Promise<ApiResponse<{ messageSid: string }>> {
    const sms: TwilioSMS = {
      to: phoneNumber,
      from: this.defaultFrom,
      body: `您的卡策驗證碼是：${code}。此驗證碼將在 5 分鐘後失效。請勿將此驗證碼告訴他人。`,
    };

    return this.sendSMS(sms);
  }

  /**
   * Send價格提醒 SMS
   */
  async sendPriceAlertSMS(
    phoneNumber: string,
    cardName: string,
    currentPrice: number,
    targetPrice: number
  ): Promise<ApiResponse<{ messageSid: string }>> {
    const sms: TwilioSMS = {
      to: phoneNumber,
      from: this.defaultFrom,
      body: `卡策價格提醒：${cardName} 當前價格 $${currentPrice}，您的目標價格 $${targetPrice}。請登入平台查看詳情。`,
    };

    return this.sendSMS(sms);
  }

  /**
   * Send安全Warning SMS
   */
  async sendSecurityAlertSMS(
    phoneNumber: string,
    alertType: string,
    details: string
  ): Promise<ApiResponse<{ messageSid: string }>> {
    const sms: TwilioSMS = {
      to: phoneNumber,
      from: this.defaultFrom,
      body: `卡策安全警告：${alertType} - ${details}。如非本人操作，請立即聯繫客服。`,
    };

    return this.sendSMS(sms);
  }

  /**
   * 撥打語音VerifyPhone
   */
  async makeVerificationCall(
    phoneNumber: string,
    code: string
  ): Promise<ApiResponse<{ callSid: string }>> {
    const _twiml = `
      <Response>
        <Say language="zh-TW">您的卡策驗證碼是</Say>
        <Say language="zh-TW">${code.split('').join(' ')}</Say>
        <Say language="zh-TW">此驗證碼將在 5 分鐘後失效</Say>
        <Say language="zh-TW">請勿將此驗證碼告訴他人</Say>
      </Response>
    `;

    const call: TwilioCall = {
      to: phoneNumber,
      from: this.defaultFrom,
      twiml,
    };

    return this.makeCall(call);
  }

  /**
   * GetServiceStatisticsInformation
   */
  async getServiceStats(): Promise<
    ApiResponse<{
      available: boolean;
      messagesCount: number;
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
            messagesCount: 0,
            lastUsed: new Date().toISOString(),
          },
          message: 'Service not available',
          timestamp: new Date(),
        };
      }

      const _messagesResult = await this.getMessages(1);
      const _messagesCount =
        messagesResult.success && messagesResult.data
          ? messagesResult.data.length
          : 0;

      return {
        success: true,
        data: {
          available: true,
          messagesCount,
          lastUsed: new Date().toISOString(),
        },
        message: 'Service stats retrieved successfully',
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error('Error getting Twilio service stats:', { error });
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
export const _twilioService = new TwilioService();
