/* global jest, describe, it, expect, beforeEach, afterEach */
import { paymentService } from '../../../services/paymentService';
import { mockApiResponse } from '../../setup/test-utils';

// Mock API service
jest.mock('../../../services/apiService', () => ({
  apiService: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('PaymentService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getPaymentMethods', () => {
    it('應該成功獲取支付方式列表', async () => {
      const mockPaymentMethods = [
        {
          id: '1',
          type: 'credit_card',
          last4: '1234',
          brand: 'visa',
          isDefault: true,
        },
        {
          id: '2',
          type: 'bank_account',
          last4: '5678',
          bankName: 'Test Bank',
          isDefault: false,
        },
      ];

      mockApiResponse('get', mockPaymentMethods);

      const result = await paymentService.getPaymentMethods();

      expect(result).toEqual(mockPaymentMethods);
    });

    it('應該處理獲取支付方式失敗的情況', async () => {
      mockApiResponse('get', null, new Error('Network error'));

      await expect(paymentService.getPaymentMethods()).rejects.toThrow(
        'Network error'
      );
    });
  });

  describe('addPaymentMethod', () => {
    it('應該成功添加信用卡支付方式', async () => {
      const paymentData = {
        type: 'credit_card',
        cardNumber: '4111111111111111',
        expiryMonth: '12',
        expiryYear: '2025',
        cvv: '123',
        cardholderName: 'Test User',
      };

      const mockResponse = {
        id: 'new_payment_method_id',
        type: 'credit_card',
        last4: '1111',
        brand: 'visa',
        isDefault: false,
      };

      mockApiResponse('post', mockResponse);

      const result = await paymentService.addPaymentMethod(paymentData);

      expect(result).toEqual(mockResponse);
    });

    it('應該成功添加銀行帳戶支付方式', async () => {
      const paymentData = {
        type: 'bank_account',
        accountNumber: '1234567890',
        routingNumber: '021000021',
        accountHolderName: 'Test User',
      };

      const mockResponse = {
        id: 'new_bank_account_id',
        type: 'bank_account',
        last4: '7890',
        bankName: 'Test Bank',
        isDefault: false,
      };

      mockApiResponse('post', mockResponse);

      const result = await paymentService.addPaymentMethod(paymentData);

      expect(result).toEqual(mockResponse);
    });

    it('應該處理添加支付方式失敗的情況', async () => {
      const paymentData = {
        type: 'credit_card',
        cardNumber: 'invalid',
        expiryMonth: '12',
        expiryYear: '2025',
        cvv: '123',
        cardholderName: 'Test User',
      };

      mockApiResponse('post', null, new Error('Invalid card number'));

      await expect(
        paymentService.addPaymentMethod(paymentData)
      ).rejects.toThrow('Invalid card number');
    });
  });

  describe('updatePaymentMethod', () => {
    it('應該成功更新支付方式', async () => {
      const paymentMethodId = 'payment_method_id';
      const updateData = {
        isDefault: true,
        cardholderName: 'Updated Name',
      };

      const mockResponse = {
        id: paymentMethodId,
        type: 'credit_card',
        last4: '1111',
        brand: 'visa',
        isDefault: true,
        cardholderName: 'Updated Name',
      };

      mockApiResponse('put', mockResponse);

      const result = await paymentService.updatePaymentMethod(
        paymentMethodId,
        updateData
      );

      expect(result).toEqual(mockResponse);
    });

    it('應該處理更新支付方式失敗的情況', async () => {
      const paymentMethodId = 'invalid_id';
      const updateData = { isDefault: true };

      mockApiResponse('put', null, new Error('Payment method not found'));

      await expect(
        paymentService.updatePaymentMethod(paymentMethodId, updateData)
      ).rejects.toThrow('Payment method not found');
    });
  });

  describe('deletePaymentMethod', () => {
    it('應該成功刪除支付方式', async () => {
      const paymentMethodId = 'payment_method_id';

      mockApiResponse('delete', { success: true });

      const result = await paymentService.deletePaymentMethod(paymentMethodId);

      expect(result).toEqual({ success: true });
    });

    it('應該處理刪除支付方式失敗的情況', async () => {
      const paymentMethodId = 'invalid_id';

      mockApiResponse(
        'delete',
        null,
        new Error('Cannot delete default payment method')
      );

      await expect(
        paymentService.deletePaymentMethod(paymentMethodId)
      ).rejects.toThrow('Cannot delete default payment method');
    });
  });

  describe('processPayment', () => {
    it('應該成功處理信用卡支付', async () => {
      const paymentData = {
        amount: 1000,
        currency: 'TWD',
        paymentMethodId: 'payment_method_id',
        description: 'Test payment',
      };

      const mockResponse = {
        transactionId: 'txn_123456',
        status: 'succeeded',
        amount: 1000,
        currency: 'TWD',
        createdAt: '2024-01-01T00:00:00Z',
      };

      mockApiResponse('post', mockResponse);

      const result = await paymentService.processPayment(paymentData);

      expect(result).toEqual(mockResponse);
    });

    it('應該處理支付失敗的情況', async () => {
      const paymentData = {
        amount: 1000,
        currency: 'TWD',
        paymentMethodId: 'invalid_method',
        description: 'Test payment',
      };

      mockApiResponse('post', null, new Error('Insufficient funds'));

      await expect(paymentService.processPayment(paymentData)).rejects.toThrow(
        'Insufficient funds'
      );
    });
  });

  describe('getPaymentHistory', () => {
    it('應該成功獲取支付歷史', async () => {
      const mockHistory = [
        {
          id: '1',
          amount: 1000,
          currency: 'TWD',
          status: 'succeeded',
          description: 'Premium subscription',
          createdAt: '2024-01-01T00:00:00Z',
        },
        {
          id: '2',
          amount: 500,
          currency: 'TWD',
          status: 'failed',
          description: 'Failed payment',
          createdAt: '2024-01-02T00:00:00Z',
        },
      ];

      mockApiResponse('get', mockHistory);

      const result = await paymentService.getPaymentHistory();

      expect(result).toEqual(mockHistory);
    });

    it('應該支持分頁參數', async () => {
      const page = 2;
      const limit = 10;

      mockApiResponse('get', []);

      await paymentService.getPaymentHistory(page, limit);

      // 驗證API調用包含分頁參數
      expect(
        require('../../../services/apiService').apiService.get
      ).toHaveBeenCalledWith(
        expect.stringContaining('payments'),
        expect.objectContaining({
          params: { page, limit },
        })
      );
    });
  });

  describe('getSubscriptionPlans', () => {
    it('應該成功獲取訂閱計劃列表', async () => {
      const mockPlans = [
        {
          id: 'basic',
          name: 'Basic Plan',
          price: 299,
          currency: 'TWD',
          interval: 'month',
          features: ['Basic features', 'Email support'],
        },
        {
          id: 'premium',
          name: 'Premium Plan',
          price: 599,
          currency: 'TWD',
          interval: 'month',
          features: ['All features', 'Priority support', 'Advanced analytics'],
        },
      ];

      mockApiResponse('get', mockPlans);

      const result = await paymentService.getSubscriptionPlans();

      expect(result).toEqual(mockPlans);
    });
  });

  describe('createSubscription', () => {
    it('應該成功創建訂閱', async () => {
      const subscriptionData = {
        planId: 'premium',
        paymentMethodId: 'payment_method_id',
        startDate: '2024-01-01',
      };

      const mockResponse = {
        id: 'sub_123456',
        planId: 'premium',
        status: 'active',
        currentPeriodStart: '2024-01-01T00:00:00Z',
        currentPeriodEnd: '2024-02-01T00:00:00Z',
      };

      mockApiResponse('post', mockResponse);

      const result = await paymentService.createSubscription(subscriptionData);

      expect(result).toEqual(mockResponse);
    });
  });

  describe('cancelSubscription', () => {
    it('應該成功取消訂閱', async () => {
      const subscriptionId = 'sub_123456';

      mockApiResponse('post', { success: true });

      const result = await paymentService.cancelSubscription(subscriptionId);

      expect(result).toEqual({ success: true });
    });
  });

  describe('getInvoiceHistory', () => {
    it('應該成功獲取發票歷史', async () => {
      const mockInvoices = [
        {
          id: 'inv_123456',
          amount: 599,
          currency: 'TWD',
          status: 'paid',
          dueDate: '2024-01-01T00:00:00Z',
          paidAt: '2024-01-01T00:00:00Z',
        },
      ];

      mockApiResponse('get', mockInvoices);

      const result = await paymentService.getInvoiceHistory();

      expect(result).toEqual(mockInvoices);
    });
  });

  describe('validateCardNumber', () => {
    it('應該驗證有效的信用卡號', () => {
      const validCardNumbers = [
        '4111111111111111', // Visa
        '5555555555554444', // Mastercard
        '378282246310005', // American Express
      ];

      validCardNumbers.forEach((cardNumber) => {
        expect(paymentService.validateCardNumber(cardNumber)).toBe(true);
      });
    });

    it('應該拒絕無效的信用卡號', () => {
      const invalidCardNumbers = [
        '4111111111111112',
        '1234567890123456',
        '0000000000000000',
        'invalid',
      ];

      invalidCardNumbers.forEach((cardNumber) => {
        expect(paymentService.validateCardNumber(cardNumber)).toBe(false);
      });
    });
  });

  describe('formatCardNumber', () => {
    it('應該正確格式化信用卡號', () => {
      expect(paymentService.formatCardNumber('4111111111111111')).toBe(
        '4111 1111 1111 1111'
      );
      expect(paymentService.formatCardNumber('5555555555554444')).toBe(
        '5555 5555 5555 4444'
      );
      expect(paymentService.formatCardNumber('378282246310005')).toBe(
        '3782 822463 10005'
      );
    });
  });

  describe('getPaymentStatus', () => {
    it('應該返回正確的支付狀態', () => {
      expect(paymentService.getPaymentStatus('succeeded')).toBe('成功');
      expect(paymentService.getPaymentStatus('pending')).toBe('處理中');
      expect(paymentService.getPaymentStatus('failed')).toBe('失敗');
      expect(paymentService.getPaymentStatus('cancelled')).toBe('已取消');
      expect(paymentService.getPaymentStatus('unknown')).toBe('未知');
    });
  });
});
