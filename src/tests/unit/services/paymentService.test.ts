import { authService } from '../../../services/authService';
import { paymentService } from '../../../services/paymentService';
import { logger } from '../../../utils/logger';

// Mock 依賴
jest.mock('../../../services/authService');
jest.mock('../../../utils/logger');

const _mockAuthService = authService as jest.Mocked<typeof authService>;
const _mockLogger = logger as jest.Mocked<typeof logger>;

describe('PaymentService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initialize', () => {
    it('應該SuccessInitialize支付Service', async () => {
      await paymentService.initialize();

      expect(mockLogger.info).toHaveBeenCalledWith('Initialize支付Service...');
      expect(mockLogger.info).toHaveBeenCalledWith('支付提供商初始化完成');
      expect(mockLogger.info).toHaveBeenCalledWith('支付配置已加載');
      expect(mockLogger.info).toHaveBeenCalledWith('支付ServiceInitialize完成');
    });

    it('應該Handle依賴Service未Initialize的情況', async () => {
      // 模擬依賴Service未Initialize
      jest.spyOn(console, 'error').mockImplementation(() => {});

      await expect(paymentService.initialize()).rejects.toThrow();
      expect(mockLogger.error).toHaveBeenCalledWith(
        '支付ServiceInitializeFailed:',
        expect.any(Error)
      );
    });
  });

  describe('createPaymentMethod', () => {
    it('應該SuccessCreate支付方法', async () => {
      const _paymentData = {
        card: {
          brand: 'visa',
          last4: '4242',
          expiryMonth: 12,
          expiryYear: 2025,
        },
      };

      const _result = await paymentService.createPaymentMethod(
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
      expect(mockLogger.info).toHaveBeenCalledWith('支付方法CreateSuccess');
    });

    it('應該處理無效的支付提供商', async () => {
      const _paymentData = { card: { brand: 'visa' } };

      await expect(
        paymentService.createPaymentMethod(
          'user-1',
          'invalid-provider',
          paymentData
        )
      ).rejects.toThrow('支付提供商不可用: invalid-provider');
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Create支付方法Failed:',
        expect.any(Error)
      );
    });

    it('應該處理銀行賬戶支付方法', async () => {
      const _paymentData = {
        bankAccount: {
          bankName: 'Test Bank',
          accountType: 'checking',
        },
      };

      const _result = await paymentService.createPaymentMethod(
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
      const _paymentData = {
        digitalWallet: {
          type: 'apple_pay',
        },
      };

      const _result = await paymentService.createPaymentMethod(
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
    it('應該SuccessGet用戶支付方法', async () => {
      const _result = await paymentService.getUserPaymentMethods('user-1');

      expect(mockLogger.info).toHaveBeenCalledWith(
        '獲取用戶支付方法:',
        'user-1'
      );
      expect(result).toEqual([]);
    });

    it('應該HandleGet用戶支付方法Failed', async () => {
      // 模擬Error情況
      jest.spyOn(console, 'error').mockImplementation(() => {});

      await expect(
        paymentService.getUserPaymentMethods('user-1')
      ).rejects.toThrow();
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Get用戶支付方法Failed:',
        expect.any(Error)
      );
    });
  });

  describe('updatePaymentMethod', () => {
    it('應該SuccessUpdate支付方法', async () => {
      const _updates = {
        isDefault: true,
        isVerified: false,
      };

      const _result = await paymentService.updatePaymentMethod(
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
      expect(mockLogger.info).toHaveBeenCalledWith('支付方法UpdateSuccess');
    });

    it('應該處理支付方法不存在的情況', async () => {
      const _updates = { isDefault: true };

      await expect(
        paymentService.updatePaymentMethod('nonexistent-method', updates)
      ).rejects.toThrow('支付方法不存在');
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Update支付方法Failed:',
        expect.any(Error)
      );
    });
  });

  describe('deletePaymentMethod', () => {
    it('應該SuccessDelete支付方法', async () => {
      await paymentService.deletePaymentMethod('payment-method-1', 'user-1');

      expect(mockLogger.info).toHaveBeenCalledWith(
        '刪除支付方法:',
        'payment-method-1',
        'user-1'
      );
      expect(mockLogger.info).toHaveBeenCalledWith('支付方法DeleteSuccess');
    });

    it('應該HandleDelete支付方法Failed', async () => {
      // 模擬Error情況
      jest.spyOn(console, 'error').mockImplementation(() => {});

      await expect(
        paymentService.deletePaymentMethod('payment-method-1', 'user-1')
      ).rejects.toThrow();
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Delete支付方法Failed:',
        expect.any(Error)
      );
    });
  });

  describe('setDefaultPaymentMethod', () => {
    it('應該SuccessSettings默認支付方法', async () => {
      await paymentService.setDefaultPaymentMethod(
        'payment-method-1',
        'user-1'
      );

      expect(mockLogger.info).toHaveBeenCalledWith(
        '設置默認支付方法:',
        'payment-method-1',
        'user-1'
      );
      expect(mockLogger.info).toHaveBeenCalledWith('默認支付方法SettingsSuccess');
    });

    it('應該HandleSettings默認支付方法Failed', async () => {
      // 模擬Error情況
      jest.spyOn(console, 'error').mockImplementation(() => {});

      await expect(
        paymentService.setDefaultPaymentMethod('payment-method-1', 'user-1')
      ).rejects.toThrow();
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Settings默認支付方法Failed:',
        expect.any(Error)
      );
    });
  });

  describe('createPaymentIntent', () => {
    it('應該SuccessCreate支付意圖', async () => {
      const _paymentData = {
        amount: 1000,
        currency: 'USD',
        paymentMethodId: 'payment-method-1',
        description: '測試支付',
        metadata: { orderId: 'order-1' },
      };

      const _result = await paymentService.createPaymentIntent(paymentData);

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
      expect(mockLogger.info).toHaveBeenCalledWith('支付意圖CreateSuccess');
    });

    it('應該處理無效的支付數據', async () => {
      const _invalidPaymentData = {
        amount: -100, // 無效：負數金額
        currency: 'USD',
        paymentMethodId: 'payment-method-1',
        description: '測試支付',
      };

      await expect(
        paymentService.createPaymentIntent(invalidPaymentData)
      ).rejects.toThrow();
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Create支付意圖Failed:',
        expect.any(Error)
      );
    });

    it('應該處理無效的貨幣代碼', async () => {
      const _invalidPaymentData = {
        amount: 1000,
        currency: 'US', // 無效：不Yes3位字符
        paymentMethodId: 'payment-method-1',
        description: '測試支付',
      };

      await expect(
        paymentService.createPaymentIntent(invalidPaymentData)
      ).rejects.toThrow();
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Create支付意圖Failed:',
        expect.any(Error)
      );
    });

    it('應該處理空描述', async () => {
      const _invalidPaymentData = {
        amount: 1000,
        currency: 'USD',
        paymentMethodId: 'payment-method-1',
        description: '', // 無效：EmptyDescription
      };

      await expect(
        paymentService.createPaymentIntent(invalidPaymentData)
      ).rejects.toThrow();
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Create支付意圖Failed:',
        expect.any(Error)
      );
    });
  });

  describe('confirmPayment', () => {
    it('應該Success確認支付', async () => {
      const _result = await paymentService.confirmPayment('payment-intent-1');

      expect(result).toMatchObject({
        status: 'succeeded',
        receiptUrl: '/receipts/payment-intent-1',
      });
      expect(result.updatedAt).toBeInstanceOf(Date);
      expect(mockLogger.info).toHaveBeenCalledWith(
        '確認支付:',
        'payment-intent-1'
      );
      expect(mockLogger.info).toHaveBeenCalledWith('支付確認Success');
    });

    it('應該處理支付意圖不存在的情況', async () => {
      await expect(
        paymentService.confirmPayment('nonexistent-intent')
      ).rejects.toThrow('支付意圖不存在');
      expect(mockLogger.error).toHaveBeenCalledWith(
        '確認支付Failed:',
        expect.any(Error)
      );
    });

    it('應該處理支付意圖狀態不正確的情況', async () => {
      // 模擬已Success的支付意Graph
      const _mockPaymentIntent = {
        id: 'payment-intent-1',
        status: 'succeeded',
      };

      // 這裡需要模擬 getPaymentIntent MethodReturn已Success的支付意Graph
      await expect(
        paymentService.confirmPayment('payment-intent-1')
      ).rejects.toThrow('支付意圖狀態不正確');
      expect(mockLogger.error).toHaveBeenCalledWith(
        '確認支付Failed:',
        expect.any(Error)
      );
    });
  });

  describe('cancelPayment', () => {
    it('應該Success取消支付', async () => {
      const _result = await paymentService.cancelPayment('payment-intent-1');

      expect(result).toMatchObject({
        status: 'canceled',
      });
      expect(result.updatedAt).toBeInstanceOf(Date);
      expect(mockLogger.info).toHaveBeenCalledWith(
        '取消支付:',
        'payment-intent-1'
      );
      expect(mockLogger.info).toHaveBeenCalledWith('支付取消Success');
    });

    it('應該處理支付意圖不存在的情況', async () => {
      await expect(
        paymentService.cancelPayment('nonexistent-intent')
      ).rejects.toThrow('支付意圖不存在');
      expect(mockLogger.error).toHaveBeenCalledWith(
        '取消支付Failed:',
        expect.any(Error)
      );
    });

    it('應該Handle已Success支付的情況', async () => {
      // 模擬已Success的支付意Graph
      const _mockPaymentIntent = {
        id: 'payment-intent-1',
        status: 'succeeded',
      };

      await expect(
        paymentService.cancelPayment('payment-intent-1')
      ).rejects.toThrow('無法取消已Success的支付');
      expect(mockLogger.error).toHaveBeenCalledWith(
        '取消支付Failed:',
        expect.any(Error)
      );
    });
  });

  describe('getPaymentIntent', () => {
    it('應該SuccessGet支付意圖', async () => {
      const _result = await paymentService.getPaymentIntent('payment-intent-1');

      expect(mockLogger.info).toHaveBeenCalledWith(
        '獲取支付意圖:',
        'payment-intent-1'
      );
      expect(result).toBeNull();
    });

    it('應該HandleGet支付意圖Failed', async () => {
      // 模擬Error情況
      jest.spyOn(console, 'error').mockImplementation(() => {});

      await expect(
        paymentService.getPaymentIntent('payment-intent-1')
      ).rejects.toThrow();
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Get支付意圖Failed:',
        expect.any(Error)
      );
    });
  });

  describe('createOrder', () => {
    it('應該SuccessCreate訂單', async () => {
      const _orderData = {
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

      const _result = await paymentService.createOrder(orderData);

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
      expect(mockLogger.info).toHaveBeenCalledWith('訂單CreateSuccess');
    });

    it('應該處理無效的訂單數據', async () => {
      const _invalidOrderData = {
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
        'Create訂單Failed:',
        expect.any(Error)
      );
    });
  });

  describe('getOrder', () => {
    it('應該SuccessGet訂單', async () => {
      const _result = await paymentService.getOrder('order-1');

      expect(mockLogger.info).toHaveBeenCalledWith('獲取訂單:', 'order-1');
      expect(result).toBeNull();
    });

    it('應該HandleGet訂單Failed', async () => {
      // 模擬Error情況
      jest.spyOn(console, 'error').mockImplementation(() => {});

      await expect(paymentService.getOrder('order-1')).rejects.toThrow();
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Get訂單Failed:',
        expect.any(Error)
      );
    });
  });

  describe('getUserOrders', () => {
    it('應該SuccessGet用戶訂單', async () => {
      const _result = await paymentService.getUserOrders('user-1', 1, 20);

      expect(mockLogger.info).toHaveBeenCalledWith(
        '獲取用戶訂單:',
        'user-1',
        1,
        20
      );
      expect(result).toEqual([]);
    });

    it('應該HandleGet用戶訂單Failed', async () => {
      // 模擬Error情況
      jest.spyOn(console, 'error').mockImplementation(() => {});

      await expect(paymentService.getUserOrders('user-1')).rejects.toThrow();
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Get用戶訂單Failed:',
        expect.any(Error)
      );
    });
  });

  describe('updateOrderStatus', () => {
    it('應該SuccessUpdate訂單狀態', async () => {
      const _result = await paymentService.updateOrderStatus(
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
      expect(mockLogger.info).toHaveBeenCalledWith('訂單狀態UpdateSuccess');
    });

    it('應該處理訂單不存在的情況', async () => {
      await expect(
        paymentService.updateOrderStatus('nonexistent-order', 'confirmed')
      ).rejects.toThrow('訂單不存在');
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Update訂單狀態Failed:',
        expect.any(Error)
      );
    });
  });

  describe('createSubscriptionPlan', () => {
    it('應該SuccessCreate訂閱計劃', async () => {
      const _planData = {
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

      const _result = await paymentService.createSubscriptionPlan(planData);

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
      expect(mockLogger.info).toHaveBeenCalledWith('訂閱計劃CreateSuccess');
    });

    it('應該處理無效的計劃數據', async () => {
      const _invalidPlanData = {
        name: '', // 無效：Empty名稱
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
        'Create訂閱計劃Failed:',
        expect.any(Error)
      );
    });
  });

  describe('createSubscription', () => {
    it('應該SuccessCreate訂閱', async () => {
      const _result = await paymentService.createSubscription(
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
      expect(mockLogger.info).toHaveBeenCalledWith('訂閱CreateSuccess');
    });

    it('應該HandleCreate訂閱Failed', async () => {
      // 模擬Error情況
      jest.spyOn(console, 'error').mockImplementation(() => {});

      await expect(
        paymentService.createSubscription(
          'user-1',
          'plan-1',
          'payment-method-1'
        )
      ).rejects.toThrow();
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Create訂閱Failed:',
        expect.any(Error)
      );
    });
  });

  describe('cancelSubscription', () => {
    it('應該Success取消訂閱', async () => {
      const _result = await paymentService.cancelSubscription(
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
      expect(mockLogger.info).toHaveBeenCalledWith('訂閱取消Success');
    });

    it('應該立即取消訂閱', async () => {
      const _result = await paymentService.cancelSubscription(
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
        '取消訂閱Failed:',
        expect.any(Error)
      );
    });
  });

  describe('getSubscription', () => {
    it('應該SuccessGet訂閱', async () => {
      const _result = await paymentService.getSubscription('subscription-1');

      expect(mockLogger.info).toHaveBeenCalledWith(
        '獲取訂閱:',
        'subscription-1'
      );
      expect(result).toBeNull();
    });

    it('應該HandleGet訂閱Failed', async () => {
      // 模擬Error情況
      jest.spyOn(console, 'error').mockImplementation(() => {});

      await expect(
        paymentService.getSubscription('subscription-1')
      ).rejects.toThrow();
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Get訂閱Failed:',
        expect.any(Error)
      );
    });
  });

  describe('getUserSubscriptions', () => {
    it('應該SuccessGet用戶訂閱', async () => {
      const _result = await paymentService.getUserSubscriptions('user-1');

      expect(mockLogger.info).toHaveBeenCalledWith('獲取用戶訂閱:', 'user-1');
      expect(result).toEqual([]);
    });

    it('應該HandleGet用戶訂閱Failed', async () => {
      // 模擬Error情況
      jest.spyOn(console, 'error').mockImplementation(() => {});

      await expect(
        paymentService.getUserSubscriptions('user-1')
      ).rejects.toThrow();
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Get用戶訂閱Failed:',
        expect.any(Error)
      );
    });
  });

  describe('createRefund', () => {
    it('應該SuccessCreate退款', async () => {
      const _result = await paymentService.createRefund(
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
      expect(mockLogger.info).toHaveBeenCalledWith('退款CreateSuccess');
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
        'Create退款Failed:',
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
        'Create退款Failed:',
        expect.any(Error)
      );
    });
  });

  describe('getRefund', () => {
    it('應該SuccessGet退款', async () => {
      const _result = await paymentService.getRefund('refund-1');

      expect(mockLogger.info).toHaveBeenCalledWith('獲取退款:', 'refund-1');
      expect(result).toBeNull();
    });

    it('應該HandleGet退款Failed', async () => {
      // 模擬Error情況
      jest.spyOn(console, 'error').mockImplementation(() => {});

      await expect(paymentService.getRefund('refund-1')).rejects.toThrow();
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Get退款Failed:',
        expect.any(Error)
      );
    });
  });

  describe('getPaymentIntentRefunds', () => {
    it('應該SuccessGet支付意圖的退款', async () => {
      const _result =
        await paymentService.getPaymentIntentRefunds('payment-intent-1');

      expect(mockLogger.info).toHaveBeenCalledWith(
        '獲取支付意圖退款:',
        'payment-intent-1'
      );
      expect(result).toEqual([]);
    });

    it('應該HandleGet支付意圖退款Failed', async () => {
      // 模擬Error情況
      jest.spyOn(console, 'error').mockImplementation(() => {});

      await expect(
        paymentService.getPaymentIntentRefunds('payment-intent-1')
      ).rejects.toThrow();
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Get支付意圖退款Failed:',
        expect.any(Error)
      );
    });
  });

  describe('createDispute', () => {
    it('應該SuccessCreate爭議', async () => {
      const _evidence = {
        customerEmail: 'test@example.com',
        customerName: '張三',
        productDescription: '測試產品',
      };

      const _result = await paymentService.createDispute(
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
      expect(mockLogger.info).toHaveBeenCalledWith('爭議CreateSuccess');
    });

    it('應該處理支付意圖不存在的情況', async () => {
      const _evidence = { customerEmail: 'test@example.com' };

      await expect(
        paymentService.createDispute(
          'nonexistent-intent',
          'product_not_received',
          evidence
        )
      ).rejects.toThrow('支付意圖不存在');
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Create爭議Failed:',
        expect.any(Error)
      );
    });
  });

  describe('updateDispute', () => {
    it('應該SuccessUpdate爭議', async () => {
      const _updates = {
        status: 'under_review',
        evidence: {
          customerCommunication: '客戶已聯繫',
        },
      };

      const _result = await paymentService.updateDispute('dispute-1', updates);

      expect(result).toMatchObject({
        status: 'under_review',
        evidence: {
          customerCommunication: '客戶已聯繫',
        },
      });
      expect(result.updatedAt).toBeInstanceOf(Date);
      expect(mockLogger.info).toHaveBeenCalledWith('更新爭議:', 'dispute-1');
      expect(mockLogger.info).toHaveBeenCalledWith('爭議UpdateSuccess');
    });

    it('應該處理爭議不存在的情況', async () => {
      const _updates = { status: 'under_review' };

      await expect(
        paymentService.updateDispute('nonexistent-dispute', updates)
      ).rejects.toThrow('爭議不存在');
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Update爭議Failed:',
        expect.any(Error)
      );
    });
  });

  describe('getDispute', () => {
    it('應該SuccessGet爭議', async () => {
      const _result = await paymentService.getDispute('dispute-1');

      expect(mockLogger.info).toHaveBeenCalledWith('獲取爭議:', 'dispute-1');
      expect(result).toBeNull();
    });

    it('應該HandleGet爭議Failed', async () => {
      // 模擬Error情況
      jest.spyOn(console, 'error').mockImplementation(() => {});

      await expect(paymentService.getDispute('dispute-1')).rejects.toThrow();
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Get爭議Failed:',
        expect.any(Error)
      );
    });
  });

  describe('getPaymentAnalytics', () => {
    it('應該SuccessGet支付分析', async () => {
      const _result = await paymentService.getPaymentAnalytics('30d');

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
      expect(mockLogger.info).toHaveBeenCalledWith('支付分析GetSuccess');
    });

    it('應該HandleGet支付分析Failed', async () => {
      // 模擬Error情況
      jest.spyOn(console, 'error').mockImplementation(() => {});

      await expect(paymentService.getPaymentAnalytics()).rejects.toThrow();
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Get支付分析Failed:',
        expect.any(Error)
      );
    });
  });

  describe('配置管理', () => {
    it('應該SuccessGetConfigure', () => {
      const _config = paymentService.getConfig();

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

    it('應該SuccessUpdateConfigure', () => {
      const _newConfig = {
        enableCrypto: true,
        enableAnalytics: false,
      };

      paymentService.updateConfig(newConfig);

      const _updatedConfig = paymentService.getConfig();
      expect(updatedConfig.enableCrypto).toBe(true);
      expect(updatedConfig.enableAnalytics).toBe(false);
      expect(mockLogger.info).toHaveBeenCalledWith('支付ServiceConfigure已Update');
    });

    it('應該獲取支付提供商', () => {
      const _providers = paymentService.getProviders();

      expect(providers).toHaveLength(4); // Stripe, PayPal, Apple Pay, Google Pay
      expect(providers.map(p => p.name)).toContain('Stripe');
      expect(providers.map(p => p.name)).toContain('PayPal');
      expect(providers.map(p => p.name)).toContain('Apple Pay');
      expect(providers.map(p => p.name)).toContain('Google Pay');
    });

    it('應該CheckService狀態', () => {
      expect(paymentService.isReady()).toBe(false); // 未Initialize

      // Initialize後應該Return true
      paymentService.initialize().then(() => {
        expect(paymentService.isReady()).toBe(true);
      });
    });
  });
});
