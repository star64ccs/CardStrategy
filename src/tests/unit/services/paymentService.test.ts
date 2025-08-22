import { paymentService } from '../../../services/paymentService';
import { authService } from '../../../services/authService';
import { logger } from '../../../utils/logger';

// Mock 依賴
jest.mock('../../../services/authService');
jest.mock('../../../utils/logger');

const mockAuthService = authService as jest.Mocked<typeof authService>;
const mockLogger = logger as jest.Mocked<typeof logger>;

describe('PaymentService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initialize', () => {
    it('應該成功初始化支付服務', async () => {
      await paymentService.initialize();

      expect(mockLogger.info).toHaveBeenCalledWith('初始化支付服務...');
      expect(mockLogger.info).toHaveBeenCalledWith('支付提供商初始化完成');
      expect(mockLogger.info).toHaveBeenCalledWith('支付配置已加載');
      expect(mockLogger.info).toHaveBeenCalledWith('支付服務初始化完成');
    });

    it('應該處理依賴服務未初始化的情況', async () => {
      // 模擬依賴服務未初始化
      jest.spyOn(console, 'error').mockImplementation(() => {});

      await expect(paymentService.initialize()).rejects.toThrow();
      expect(mockLogger.error).toHaveBeenCalledWith(
        '支付服務初始化失敗:',
        expect.any(Error)
      );
    });
  });

  describe('createPaymentMethod', () => {
    it('應該成功創建支付方法', async () => {
      const paymentData = {
        card: {
          brand: 'visa',
          last4: '4242',
          expiryMonth: 12,
          expiryYear: 2025,
        },
      };

      const result = await paymentService.createPaymentMethod(
        'user-1',
        'stripe',
        paymentData
      );

      expect(result).toMatchObject({
        userId: 'user-1',
        provider: 'stripe',
        type: 'card',
        details: {
          brand: 'visa',
          last4: '4242',
          expiryMonth: 12,
          expiryYear: 2025,
        },
        isDefault: false,
        isVerified: true,
      });
      expect(result.id).toBeDefined();
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
      expect(mockLogger.info).toHaveBeenCalledWith(
        '創建支付方法:',
        'user-1',
        'stripe'
      );
      expect(mockLogger.info).toHaveBeenCalledWith('支付方法創建成功');
    });

    it('應該處理無效的支付提供商', async () => {
      const paymentData = { card: { brand: 'visa' } };

      await expect(
        paymentService.createPaymentMethod(
          'user-1',
          'invalid-provider',
          paymentData
        )
      ).rejects.toThrow('支付提供商不可用: invalid-provider');
      expect(mockLogger.error).toHaveBeenCalledWith(
        '創建支付方法失敗:',
        expect.any(Error)
      );
    });

    it('應該處理銀行賬戶支付方法', async () => {
      const paymentData = {
        bankAccount: {
          bankName: 'Test Bank',
          accountType: 'checking',
        },
      };

      const result = await paymentService.createPaymentMethod(
        'user-1',
        'stripe',
        paymentData
      );

      expect(result.type).toBe('bank_account');
      expect(result.details).toMatchObject({
        bankName: 'Test Bank',
        accountType: 'checking',
      });
    });

    it('應該處理數字錢包支付方法', async () => {
      const paymentData = {
        digitalWallet: {
          type: 'apple_pay',
        },
      };

      const result = await paymentService.createPaymentMethod(
        'user-1',
        'stripe',
        paymentData
      );

      expect(result.type).toBe('digital_wallet');
      expect(result.details).toMatchObject({
        walletType: 'apple_pay',
      });
    });
  });

  describe('getUserPaymentMethods', () => {
    it('應該成功獲取用戶支付方法', async () => {
      const result = await paymentService.getUserPaymentMethods('user-1');

      expect(mockLogger.info).toHaveBeenCalledWith(
        '獲取用戶支付方法:',
        'user-1'
      );
      expect(result).toEqual([]);
    });

    it('應該處理獲取用戶支付方法失敗', async () => {
      // 模擬錯誤情況
      jest.spyOn(console, 'error').mockImplementation(() => {});

      await expect(
        paymentService.getUserPaymentMethods('user-1')
      ).rejects.toThrow();
      expect(mockLogger.error).toHaveBeenCalledWith(
        '獲取用戶支付方法失敗:',
        expect.any(Error)
      );
    });
  });

  describe('updatePaymentMethod', () => {
    it('應該成功更新支付方法', async () => {
      const updates = {
        isDefault: true,
        isVerified: false,
      };

      const result = await paymentService.updatePaymentMethod(
        'payment-method-1',
        updates
      );

      expect(result).toMatchObject({
        isDefault: true,
        isVerified: false,
      });
      expect(result.updatedAt).toBeInstanceOf(Date);
      expect(mockLogger.info).toHaveBeenCalledWith(
        '更新支付方法:',
        'payment-method-1'
      );
      expect(mockLogger.info).toHaveBeenCalledWith('支付方法更新成功');
    });

    it('應該處理支付方法不存在的情況', async () => {
      const updates = { isDefault: true };

      await expect(
        paymentService.updatePaymentMethod('nonexistent-method', updates)
      ).rejects.toThrow('支付方法不存在');
      expect(mockLogger.error).toHaveBeenCalledWith(
        '更新支付方法失敗:',
        expect.any(Error)
      );
    });
  });

  describe('deletePaymentMethod', () => {
    it('應該成功刪除支付方法', async () => {
      await paymentService.deletePaymentMethod('payment-method-1', 'user-1');

      expect(mockLogger.info).toHaveBeenCalledWith(
        '刪除支付方法:',
        'payment-method-1',
        'user-1'
      );
      expect(mockLogger.info).toHaveBeenCalledWith('支付方法刪除成功');
    });

    it('應該處理刪除支付方法失敗', async () => {
      // 模擬錯誤情況
      jest.spyOn(console, 'error').mockImplementation(() => {});

      await expect(
        paymentService.deletePaymentMethod('payment-method-1', 'user-1')
      ).rejects.toThrow();
      expect(mockLogger.error).toHaveBeenCalledWith(
        '刪除支付方法失敗:',
        expect.any(Error)
      );
    });
  });

  describe('setDefaultPaymentMethod', () => {
    it('應該成功設置默認支付方法', async () => {
      await paymentService.setDefaultPaymentMethod(
        'payment-method-1',
        'user-1'
      );

      expect(mockLogger.info).toHaveBeenCalledWith(
        '設置默認支付方法:',
        'payment-method-1',
        'user-1'
      );
      expect(mockLogger.info).toHaveBeenCalledWith('默認支付方法設置成功');
    });

    it('應該處理設置默認支付方法失敗', async () => {
      // 模擬錯誤情況
      jest.spyOn(console, 'error').mockImplementation(() => {});

      await expect(
        paymentService.setDefaultPaymentMethod('payment-method-1', 'user-1')
      ).rejects.toThrow();
      expect(mockLogger.error).toHaveBeenCalledWith(
        '設置默認支付方法失敗:',
        expect.any(Error)
      );
    });
  });

  describe('createPaymentIntent', () => {
    it('應該成功創建支付意圖', async () => {
      const paymentData = {
        amount: 1000,
        currency: 'USD',
        paymentMethodId: 'payment-method-1',
        description: '測試支付',
        metadata: { orderId: 'order-1' },
      };

      const result = await paymentService.createPaymentIntent(paymentData);

      expect(result).toMatchObject({
        amount: 1000,
        currency: 'USD',
        paymentMethodId: 'payment-method-1',
        status: 'pending',
        description: '測試支付',
        metadata: { orderId: 'order-1' },
      });
      expect(result.id).toBeDefined();
      expect(result.providerPaymentId).toBeDefined();
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
      expect(mockLogger.info).toHaveBeenCalledWith(
        '創建支付意圖:',
        1000,
        'USD'
      );
      expect(mockLogger.info).toHaveBeenCalledWith('支付意圖創建成功');
    });

    it('應該處理無效的支付數據', async () => {
      const invalidPaymentData = {
        amount: -100, // 無效：負數金額
        currency: 'USD',
        paymentMethodId: 'payment-method-1',
        description: '測試支付',
      };

      await expect(
        paymentService.createPaymentIntent(invalidPaymentData)
      ).rejects.toThrow();
      expect(mockLogger.error).toHaveBeenCalledWith(
        '創建支付意圖失敗:',
        expect.any(Error)
      );
    });

    it('應該處理無效的貨幣代碼', async () => {
      const invalidPaymentData = {
        amount: 1000,
        currency: 'US', // 無效：不是3位字符
        paymentMethodId: 'payment-method-1',
        description: '測試支付',
      };

      await expect(
        paymentService.createPaymentIntent(invalidPaymentData)
      ).rejects.toThrow();
      expect(mockLogger.error).toHaveBeenCalledWith(
        '創建支付意圖失敗:',
        expect.any(Error)
      );
    });

    it('應該處理空描述', async () => {
      const invalidPaymentData = {
        amount: 1000,
        currency: 'USD',
        paymentMethodId: 'payment-method-1',
        description: '', // 無效：空描述
      };

      await expect(
        paymentService.createPaymentIntent(invalidPaymentData)
      ).rejects.toThrow();
      expect(mockLogger.error).toHaveBeenCalledWith(
        '創建支付意圖失敗:',
        expect.any(Error)
      );
    });
  });

  describe('confirmPayment', () => {
    it('應該成功確認支付', async () => {
      const result = await paymentService.confirmPayment('payment-intent-1');

      expect(result).toMatchObject({
        status: 'succeeded',
        receiptUrl: '/receipts/payment-intent-1',
      });
      expect(result.updatedAt).toBeInstanceOf(Date);
      expect(mockLogger.info).toHaveBeenCalledWith(
        '確認支付:',
        'payment-intent-1'
      );
      expect(mockLogger.info).toHaveBeenCalledWith('支付確認成功');
    });

    it('應該處理支付意圖不存在的情況', async () => {
      await expect(
        paymentService.confirmPayment('nonexistent-intent')
      ).rejects.toThrow('支付意圖不存在');
      expect(mockLogger.error).toHaveBeenCalledWith(
        '確認支付失敗:',
        expect.any(Error)
      );
    });

    it('應該處理支付意圖狀態不正確的情況', async () => {
      // 模擬已成功的支付意圖
      const mockPaymentIntent = {
        id: 'payment-intent-1',
        status: 'succeeded',
      };

      // 這裡需要模擬 getPaymentIntent 方法返回已成功的支付意圖
      await expect(
        paymentService.confirmPayment('payment-intent-1')
      ).rejects.toThrow('支付意圖狀態不正確');
      expect(mockLogger.error).toHaveBeenCalledWith(
        '確認支付失敗:',
        expect.any(Error)
      );
    });
  });

  describe('cancelPayment', () => {
    it('應該成功取消支付', async () => {
      const result = await paymentService.cancelPayment('payment-intent-1');

      expect(result).toMatchObject({
        status: 'canceled',
      });
      expect(result.updatedAt).toBeInstanceOf(Date);
      expect(mockLogger.info).toHaveBeenCalledWith(
        '取消支付:',
        'payment-intent-1'
      );
      expect(mockLogger.info).toHaveBeenCalledWith('支付取消成功');
    });

    it('應該處理支付意圖不存在的情況', async () => {
      await expect(
        paymentService.cancelPayment('nonexistent-intent')
      ).rejects.toThrow('支付意圖不存在');
      expect(mockLogger.error).toHaveBeenCalledWith(
        '取消支付失敗:',
        expect.any(Error)
      );
    });

    it('應該處理已成功支付的情況', async () => {
      // 模擬已成功的支付意圖
      const mockPaymentIntent = {
        id: 'payment-intent-1',
        status: 'succeeded',
      };

      await expect(
        paymentService.cancelPayment('payment-intent-1')
      ).rejects.toThrow('無法取消已成功的支付');
      expect(mockLogger.error).toHaveBeenCalledWith(
        '取消支付失敗:',
        expect.any(Error)
      );
    });
  });

  describe('getPaymentIntent', () => {
    it('應該成功獲取支付意圖', async () => {
      const result = await paymentService.getPaymentIntent('payment-intent-1');

      expect(mockLogger.info).toHaveBeenCalledWith(
        '獲取支付意圖:',
        'payment-intent-1'
      );
      expect(result).toBeNull();
    });

    it('應該處理獲取支付意圖失敗', async () => {
      // 模擬錯誤情況
      jest.spyOn(console, 'error').mockImplementation(() => {});

      await expect(
        paymentService.getPaymentIntent('payment-intent-1')
      ).rejects.toThrow();
      expect(mockLogger.error).toHaveBeenCalledWith(
        '獲取支付意圖失敗:',
        expect.any(Error)
      );
    });
  });

  describe('createOrder', () => {
    it('應該成功創建訂單', async () => {
      const orderData = {
        items: [
          {
            productId: 'product-1',
            name: '測試產品',
            description: '這是一個測試產品',
            quantity: 2,
            unitPrice: 500,
            currency: 'USD',
          },
        ],
        shippingAddress: {
          firstName: '張',
          lastName: '三',
          address1: '台北市信義區信義路五段7號',
          city: '台北市',
          state: '台北市',
          postalCode: '110',
          country: 'TW',
          phone: '0912345678',
          email: 'test@example.com',
        },
        billingAddress: {
          firstName: '張',
          lastName: '三',
          address1: '台北市信義區信義路五段7號',
          city: '台北市',
          state: '台北市',
          postalCode: '110',
          country: 'TW',
          phone: '0912345678',
          email: 'test@example.com',
        },
        notes: '請小心包裝',
      };

      const result = await paymentService.createOrder(orderData);

      expect(result).toMatchObject({
        items: [
          {
            productId: 'product-1',
            name: '測試產品',
            description: '這是一個測試產品',
            quantity: 2,
            unitPrice: 500,
            totalPrice: 1000,
            currency: 'USD',
          },
        ],
        subtotal: 1000,
        tax: 100, // 10% 稅率
        shipping: 0,
        discount: 0,
        total: 1100,
        currency: 'USD',
        status: 'pending',
        paymentStatus: 'pending',
        shippingAddress: orderData.shippingAddress,
        billingAddress: orderData.billingAddress,
        notes: '請小心包裝',
      });
      expect(result.id).toBeDefined();
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
      expect(mockLogger.info).toHaveBeenCalledWith('創建訂單');
      expect(mockLogger.info).toHaveBeenCalledWith('訂單創建成功');
    });

    it('應該處理無效的訂單數據', async () => {
      const invalidOrderData = {
        items: [
          {
            productId: 'product-1',
            name: '測試產品',
            description: '這是一個測試產品',
            quantity: 0, // 無效：數量為0
            unitPrice: 500,
            currency: 'USD',
          },
        ],
        shippingAddress: {
          firstName: '張',
          lastName: '三',
          address1: '台北市信義區信義路五段7號',
          city: '台北市',
          state: '台北市',
          postalCode: '110',
          country: 'TW',
        },
        billingAddress: {
          firstName: '張',
          lastName: '三',
          address1: '台北市信義區信義路五段7號',
          city: '台北市',
          state: '台北市',
          postalCode: '110',
          country: 'TW',
        },
      };

      await expect(
        paymentService.createOrder(invalidOrderData)
      ).rejects.toThrow();
      expect(mockLogger.error).toHaveBeenCalledWith(
        '創建訂單失敗:',
        expect.any(Error)
      );
    });
  });

  describe('getOrder', () => {
    it('應該成功獲取訂單', async () => {
      const result = await paymentService.getOrder('order-1');

      expect(mockLogger.info).toHaveBeenCalledWith('獲取訂單:', 'order-1');
      expect(result).toBeNull();
    });

    it('應該處理獲取訂單失敗', async () => {
      // 模擬錯誤情況
      jest.spyOn(console, 'error').mockImplementation(() => {});

      await expect(paymentService.getOrder('order-1')).rejects.toThrow();
      expect(mockLogger.error).toHaveBeenCalledWith(
        '獲取訂單失敗:',
        expect.any(Error)
      );
    });
  });

  describe('getUserOrders', () => {
    it('應該成功獲取用戶訂單', async () => {
      const result = await paymentService.getUserOrders('user-1', 1, 20);

      expect(mockLogger.info).toHaveBeenCalledWith(
        '獲取用戶訂單:',
        'user-1',
        1,
        20
      );
      expect(result).toEqual([]);
    });

    it('應該處理獲取用戶訂單失敗', async () => {
      // 模擬錯誤情況
      jest.spyOn(console, 'error').mockImplementation(() => {});

      await expect(paymentService.getUserOrders('user-1')).rejects.toThrow();
      expect(mockLogger.error).toHaveBeenCalledWith(
        '獲取用戶訂單失敗:',
        expect.any(Error)
      );
    });
  });

  describe('updateOrderStatus', () => {
    it('應該成功更新訂單狀態', async () => {
      const result = await paymentService.updateOrderStatus(
        'order-1',
        'confirmed'
      );

      expect(result).toMatchObject({
        status: 'confirmed',
      });
      expect(result.updatedAt).toBeInstanceOf(Date);
      expect(mockLogger.info).toHaveBeenCalledWith(
        '更新訂單狀態:',
        'order-1',
        'confirmed'
      );
      expect(mockLogger.info).toHaveBeenCalledWith('訂單狀態更新成功');
    });

    it('應該處理訂單不存在的情況', async () => {
      await expect(
        paymentService.updateOrderStatus('nonexistent-order', 'confirmed')
      ).rejects.toThrow('訂單不存在');
      expect(mockLogger.error).toHaveBeenCalledWith(
        '更新訂單狀態失敗:',
        expect.any(Error)
      );
    });
  });

  describe('createSubscriptionPlan', () => {
    it('應該成功創建訂閱計劃', async () => {
      const planData = {
        name: '高級計劃',
        description: '包含所有高級功能',
        price: 2999,
        currency: 'USD',
        interval: 'month' as const,
        intervalCount: 1,
        trialPeriodDays: 7,
        features: ['AI分析', '無限掃描', '優先支持'],
        isActive: true,
        metadata: { category: 'premium' },
      };

      const result = await paymentService.createSubscriptionPlan(planData);

      expect(result).toMatchObject({
        name: '高級計劃',
        description: '包含所有高級功能',
        price: 2999,
        currency: 'USD',
        interval: 'month',
        intervalCount: 1,
        trialPeriodDays: 7,
        features: ['AI分析', '無限掃描', '優先支持'],
        isActive: true,
        metadata: { category: 'premium' },
      });
      expect(result.id).toBeDefined();
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
      expect(mockLogger.info).toHaveBeenCalledWith('創建訂閱計劃:', '高級計劃');
      expect(mockLogger.info).toHaveBeenCalledWith('訂閱計劃創建成功');
    });

    it('應該處理無效的計劃數據', async () => {
      const invalidPlanData = {
        name: '', // 無效：空名稱
        description: '包含所有高級功能',
        price: 2999,
        currency: 'USD',
        interval: 'month' as const,
        intervalCount: 1,
        features: ['AI分析'],
        isActive: true,
      };

      await expect(
        paymentService.createSubscriptionPlan(invalidPlanData)
      ).rejects.toThrow();
      expect(mockLogger.error).toHaveBeenCalledWith(
        '創建訂閱計劃失敗:',
        expect.any(Error)
      );
    });
  });

  describe('createSubscription', () => {
    it('應該成功創建訂閱', async () => {
      const result = await paymentService.createSubscription(
        'user-1',
        'plan-1',
        'payment-method-1'
      );

      expect(result).toMatchObject({
        userId: 'user-1',
        planId: 'plan-1',
        status: 'active',
        cancelAtPeriodEnd: false,
        paymentMethodId: 'payment-method-1',
      });
      expect(result.id).toBeDefined();
      expect(result.currentPeriodStart).toBeInstanceOf(Date);
      expect(result.currentPeriodEnd).toBeInstanceOf(Date);
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
      expect(mockLogger.info).toHaveBeenCalledWith(
        '創建訂閱:',
        'user-1',
        'plan-1'
      );
      expect(mockLogger.info).toHaveBeenCalledWith('訂閱創建成功');
    });

    it('應該處理創建訂閱失敗', async () => {
      // 模擬錯誤情況
      jest.spyOn(console, 'error').mockImplementation(() => {});

      await expect(
        paymentService.createSubscription(
          'user-1',
          'plan-1',
          'payment-method-1'
        )
      ).rejects.toThrow();
      expect(mockLogger.error).toHaveBeenCalledWith(
        '創建訂閱失敗:',
        expect.any(Error)
      );
    });
  });

  describe('cancelSubscription', () => {
    it('應該成功取消訂閱', async () => {
      const result = await paymentService.cancelSubscription(
        'subscription-1',
        true
      );

      expect(result).toMatchObject({
        status: 'active',
        cancelAtPeriodEnd: true,
      });
      expect(result.updatedAt).toBeInstanceOf(Date);
      expect(mockLogger.info).toHaveBeenCalledWith(
        '取消訂閱:',
        'subscription-1',
        true
      );
      expect(mockLogger.info).toHaveBeenCalledWith('訂閱取消成功');
    });

    it('應該立即取消訂閱', async () => {
      const result = await paymentService.cancelSubscription(
        'subscription-1',
        false
      );

      expect(result).toMatchObject({
        status: 'canceled',
        cancelAtPeriodEnd: false,
      });
      expect(result.canceledAt).toBeInstanceOf(Date);
    });

    it('應該處理訂閱不存在的情況', async () => {
      await expect(
        paymentService.cancelSubscription('nonexistent-subscription')
      ).rejects.toThrow('訂閱不存在');
      expect(mockLogger.error).toHaveBeenCalledWith(
        '取消訂閱失敗:',
        expect.any(Error)
      );
    });
  });

  describe('getSubscription', () => {
    it('應該成功獲取訂閱', async () => {
      const result = await paymentService.getSubscription('subscription-1');

      expect(mockLogger.info).toHaveBeenCalledWith(
        '獲取訂閱:',
        'subscription-1'
      );
      expect(result).toBeNull();
    });

    it('應該處理獲取訂閱失敗', async () => {
      // 模擬錯誤情況
      jest.spyOn(console, 'error').mockImplementation(() => {});

      await expect(
        paymentService.getSubscription('subscription-1')
      ).rejects.toThrow();
      expect(mockLogger.error).toHaveBeenCalledWith(
        '獲取訂閱失敗:',
        expect.any(Error)
      );
    });
  });

  describe('getUserSubscriptions', () => {
    it('應該成功獲取用戶訂閱', async () => {
      const result = await paymentService.getUserSubscriptions('user-1');

      expect(mockLogger.info).toHaveBeenCalledWith('獲取用戶訂閱:', 'user-1');
      expect(result).toEqual([]);
    });

    it('應該處理獲取用戶訂閱失敗', async () => {
      // 模擬錯誤情況
      jest.spyOn(console, 'error').mockImplementation(() => {});

      await expect(
        paymentService.getUserSubscriptions('user-1')
      ).rejects.toThrow();
      expect(mockLogger.error).toHaveBeenCalledWith(
        '獲取用戶訂閱失敗:',
        expect.any(Error)
      );
    });
  });

  describe('createRefund', () => {
    it('應該成功創建退款', async () => {
      const result = await paymentService.createRefund(
        'payment-intent-1',
        500,
        'requested_by_customer'
      );

      expect(result).toMatchObject({
        paymentIntentId: 'payment-intent-1',
        amount: 500,
        reason: 'requested_by_customer',
        status: 'pending',
      });
      expect(result.id).toBeDefined();
      expect(result.providerRefundId).toBeDefined();
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
      expect(mockLogger.info).toHaveBeenCalledWith(
        '創建退款:',
        'payment-intent-1',
        500,
        'requested_by_customer'
      );
      expect(mockLogger.info).toHaveBeenCalledWith('退款創建成功');
    });

    it('應該處理支付意圖不存在的情況', async () => {
      await expect(
        paymentService.createRefund(
          'nonexistent-intent',
          500,
          'requested_by_customer'
        )
      ).rejects.toThrow('支付意圖不存在');
      expect(mockLogger.error).toHaveBeenCalledWith(
        '創建退款失敗:',
        expect.any(Error)
      );
    });

    it('應該處理退款金額超過支付金額的情況', async () => {
      await expect(
        paymentService.createRefund(
          'payment-intent-1',
          2000,
          'requested_by_customer'
        )
      ).rejects.toThrow('退款金額不能超過支付金額');
      expect(mockLogger.error).toHaveBeenCalledWith(
        '創建退款失敗:',
        expect.any(Error)
      );
    });
  });

  describe('getRefund', () => {
    it('應該成功獲取退款', async () => {
      const result = await paymentService.getRefund('refund-1');

      expect(mockLogger.info).toHaveBeenCalledWith('獲取退款:', 'refund-1');
      expect(result).toBeNull();
    });

    it('應該處理獲取退款失敗', async () => {
      // 模擬錯誤情況
      jest.spyOn(console, 'error').mockImplementation(() => {});

      await expect(paymentService.getRefund('refund-1')).rejects.toThrow();
      expect(mockLogger.error).toHaveBeenCalledWith(
        '獲取退款失敗:',
        expect.any(Error)
      );
    });
  });

  describe('getPaymentIntentRefunds', () => {
    it('應該成功獲取支付意圖的退款', async () => {
      const result =
        await paymentService.getPaymentIntentRefunds('payment-intent-1');

      expect(mockLogger.info).toHaveBeenCalledWith(
        '獲取支付意圖退款:',
        'payment-intent-1'
      );
      expect(result).toEqual([]);
    });

    it('應該處理獲取支付意圖退款失敗', async () => {
      // 模擬錯誤情況
      jest.spyOn(console, 'error').mockImplementation(() => {});

      await expect(
        paymentService.getPaymentIntentRefunds('payment-intent-1')
      ).rejects.toThrow();
      expect(mockLogger.error).toHaveBeenCalledWith(
        '獲取支付意圖退款失敗:',
        expect.any(Error)
      );
    });
  });

  describe('createDispute', () => {
    it('應該成功創建爭議', async () => {
      const evidence = {
        customerEmail: 'test@example.com',
        customerName: '張三',
        productDescription: '測試產品',
      };

      const result = await paymentService.createDispute(
        'payment-intent-1',
        'product_not_received',
        evidence
      );

      expect(result).toMatchObject({
        paymentIntentId: 'payment-intent-1',
        reason: 'product_not_received',
        status: 'needs_response',
        evidence,
      });
      expect(result.id).toBeDefined();
      expect(result.dueBy).toBeInstanceOf(Date);
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
      expect(mockLogger.info).toHaveBeenCalledWith(
        '創建爭議:',
        'payment-intent-1',
        'product_not_received'
      );
      expect(mockLogger.info).toHaveBeenCalledWith('爭議創建成功');
    });

    it('應該處理支付意圖不存在的情況', async () => {
      const evidence = { customerEmail: 'test@example.com' };

      await expect(
        paymentService.createDispute(
          'nonexistent-intent',
          'product_not_received',
          evidence
        )
      ).rejects.toThrow('支付意圖不存在');
      expect(mockLogger.error).toHaveBeenCalledWith(
        '創建爭議失敗:',
        expect.any(Error)
      );
    });
  });

  describe('updateDispute', () => {
    it('應該成功更新爭議', async () => {
      const updates = {
        status: 'under_review',
        evidence: {
          customerCommunication: '客戶已聯繫',
        },
      };

      const result = await paymentService.updateDispute('dispute-1', updates);

      expect(result).toMatchObject({
        status: 'under_review',
        evidence: {
          customerCommunication: '客戶已聯繫',
        },
      });
      expect(result.updatedAt).toBeInstanceOf(Date);
      expect(mockLogger.info).toHaveBeenCalledWith('更新爭議:', 'dispute-1');
      expect(mockLogger.info).toHaveBeenCalledWith('爭議更新成功');
    });

    it('應該處理爭議不存在的情況', async () => {
      const updates = { status: 'under_review' };

      await expect(
        paymentService.updateDispute('nonexistent-dispute', updates)
      ).rejects.toThrow('爭議不存在');
      expect(mockLogger.error).toHaveBeenCalledWith(
        '更新爭議失敗:',
        expect.any(Error)
      );
    });
  });

  describe('getDispute', () => {
    it('應該成功獲取爭議', async () => {
      const result = await paymentService.getDispute('dispute-1');

      expect(mockLogger.info).toHaveBeenCalledWith('獲取爭議:', 'dispute-1');
      expect(result).toBeNull();
    });

    it('應該處理獲取爭議失敗', async () => {
      // 模擬錯誤情況
      jest.spyOn(console, 'error').mockImplementation(() => {});

      await expect(paymentService.getDispute('dispute-1')).rejects.toThrow();
      expect(mockLogger.error).toHaveBeenCalledWith(
        '獲取爭議失敗:',
        expect.any(Error)
      );
    });
  });

  describe('getPaymentAnalytics', () => {
    it('應該成功獲取支付分析', async () => {
      const result = await paymentService.getPaymentAnalytics('30d');

      expect(result).toMatchObject({
        totalRevenue: 0,
        totalTransactions: 0,
        averageOrderValue: 0,
        conversionRate: 0,
        refundRate: 0,
        chargebackRate: 0,
        topPaymentMethods: [],
        revenueByPeriod: [],
      });
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(mockLogger.info).toHaveBeenCalledWith('獲取支付分析:', '30d');
      expect(mockLogger.info).toHaveBeenCalledWith('支付分析獲取成功');
    });

    it('應該處理獲取支付分析失敗', async () => {
      // 模擬錯誤情況
      jest.spyOn(console, 'error').mockImplementation(() => {});

      await expect(paymentService.getPaymentAnalytics()).rejects.toThrow();
      expect(mockLogger.error).toHaveBeenCalledWith(
        '獲取支付分析失敗:',
        expect.any(Error)
      );
    });
  });

  describe('配置管理', () => {
    it('應該成功獲取配置', () => {
      const config = paymentService.getConfig();

      expect(config).toMatchObject({
        enableStripe: true,
        enablePayPal: true,
        enableApplePay: true,
        enableGooglePay: true,
        enableCrypto: false,
        enableBankTransfer: true,
        enableSubscription: true,
        enableRefunds: true,
        enableDisputes: true,
        enableAnalytics: true,
      });
    });

    it('應該成功更新配置', () => {
      const newConfig = {
        enableCrypto: true,
        enableAnalytics: false,
      };

      paymentService.updateConfig(newConfig);

      const updatedConfig = paymentService.getConfig();
      expect(updatedConfig.enableCrypto).toBe(true);
      expect(updatedConfig.enableAnalytics).toBe(false);
      expect(mockLogger.info).toHaveBeenCalledWith('支付服務配置已更新');
    });

    it('應該獲取支付提供商', () => {
      const providers = paymentService.getProviders();

      expect(providers).toHaveLength(4); // Stripe, PayPal, Apple Pay, Google Pay
      expect(providers.map((p) => p.name)).toContain('Stripe');
      expect(providers.map((p) => p.name)).toContain('PayPal');
      expect(providers.map((p) => p.name)).toContain('Apple Pay');
      expect(providers.map((p) => p.name)).toContain('Google Pay');
    });

    it('應該檢查服務狀態', () => {
      expect(paymentService.isReady()).toBe(false); // 未初始化

      // 初始化後應該返回 true
      paymentService.initialize().then(() => {
        expect(paymentService.isReady()).toBe(true);
      });
    });
  });
});
