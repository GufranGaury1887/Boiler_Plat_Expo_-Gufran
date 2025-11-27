/**
 * Payment Service
 * 
 * This service handles all payment-related operations using Square In-App Payments SDK
 * 
 * Features:
 * - Square SDK initialization
 * - Card entry flow management
 * - Payment processing
 * - Apple Pay support (optional)
 * - Google Pay support (optional)
 */

import {
  SQIPCore,
  SQIPCardEntry,
  CardDetails,
  IOSCardEntryTheme,
  CardEntryConfig,
  VerificationParameters,
} from 'react-native-square-in-app-payments';
import { Platform } from 'react-native';
import { SQUARE_CONFIG } from '../config/square.config'
import { mainService } from './mainServices';

/**
 * Payment result interface
 */
export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  amount?: number;
  currency?: string;
  message?: string;
  error?: string;
}

/**
 * Payment request interface
 */
export interface PaymentRequest {
  amount: number;
  clubId: number;
  locationId: string;
  currency?: string;
  memberId: number;
  metadata: {
    orderTypeId: number;
    id: number;
    referralCode: string;
  };
}

class PaymentService {
  private isInitialized: boolean = false;

  async initialize(applicationId?: string): Promise<void> {
    if (this.isInitialized) return;

    try {
      const appId = applicationId || SQUARE_CONFIG.applicationId;
      await SQIPCore.setSquareApplicationId(appId);

      if (Platform.OS === 'ios') {
        this.configureIOSTheme();
      }

      this.isInitialized = true;
    } catch (error) {
      console.error('[PaymentService] Initialize failed:', error);
      throw new Error('Failed to initialize payment system');
    }
  }

  private configureIOSTheme(): void {
    SQIPCardEntry.setIOSCardEntryTheme({
      saveButtonTitle: 'Pay',
      saveButtonFont: { size: 18 },
      keyboardAppearance: 'Light',
      backgroundColor: '#FFFFFF',
      foregroundColor: '#000000',
      textColor: '#000000',
      placeholderTextColor: '#999999',
      tintColor: '#4CAF50',
      messageColor: '#000000',
      errorColor: '#FF3B30',
    });
  }

  makePayment(request: PaymentRequest): Promise<PaymentResult> {
    return new Promise((resolve) => {

      const config = {
        amount: request.amount,
        currencyCode: request.currency || SQUARE_CONFIG.currencyCode,
        intent: 'CHARGE' as const,
        buyerAction:'CHARGE' as const,
        squareLocationId: request.locationId,
        givenName: "John",
        familyName: "Doe",
        email: "test@example.com",
        countryCode: "US"
      };

      const onSuccess = async (verificationResult: any) => {
        try {
          console.log('[PaymentService] Verification successful:', verificationResult);
          const nonce = verificationResult.nonce;
          const token = verificationResult.token
          const result = await this.processPayment(request, nonce, token);
          resolve(result);
        } catch (error: any) {
          resolve({
            success: false,
            error: error?.message || 'Payment processing failed',
          });
        }
      };

      const onCancel = () => {
        resolve({
          success: false,
          error: 'Payment cancelled by user',
        });
      };



      this.startCardEntryWithCallbacks(onSuccess, onCancel, config).catch((error) => {
        resolve({
          success: false,
          error: error?.message || 'Failed to start card entry',
        });
      });
    });
  }

  async processPayment(request: PaymentRequest, nonce: string, token: string): Promise<PaymentResult> {
    try {

      const response = await mainService.processPayment({
        nonce,
        amount: request.amount,
        clubId: request.clubId,
        token,
        memberId: request.memberId,
        metadata: request.metadata
      });

      SQIPCardEntry.completeCardEntry(() => {
        console.log('[PaymentService] Card entry completed');
      });

      await new Promise(resolve => setTimeout(resolve, 1500));

      return {
        success: true,
        message: response?.data?.message,
      };
    } catch (error: any) {
      SQIPCardEntry.showCardNonceProcessingError(
        error?.message || 'Payment processing failed'
      );

      return {
        success: false,
        error: error?.message || 'Payment processing failed',
      };
    }
  }

  async startCardEntryWithCallbacks(
    onSuccess: (verificationResult: any) => Promise<void>,
    onCancel: () => void,
    config: CardEntryConfig & VerificationParameters & { squareLocationId: string }
  ): Promise<void> {
    if (!this.isInitialized) await this.initialize();

    const onFailure = (error: any) => {
      console.error('[PaymentService] Buyer verification failed:', error);
      SQIPCardEntry.showCardNonceProcessingError(
        error?.message || 'Verification failed'
      );
    };

    await SQIPCardEntry.startCardEntryFlowWithBuyerVerification(
      config,
      onSuccess,
      onFailure,
      onCancel
    );
  }

  async startCardEntryFlowWithBuyerVerification(
    config: CardEntryConfig & VerificationParameters & { squareLocationId: string },
    onSuccess: (verificationResult: any) => Promise<void>,
    onFailure: (error: any) => void,
    onCancel: () => void
  ): Promise<void> {
    if (!this.isInitialized) await this.initialize();

    await SQIPCardEntry.startCardEntryFlowWithBuyerVerification(
      config,
      onSuccess,
      onFailure,
      onCancel
    );
  }

  /*
  async isApplePayAvailable(): Promise<boolean> {
    try {
      if (Platform.OS !== 'ios') return false;
      return await SQIPCore.canUseApplePay();
    } catch (error) {
      console.error('[PaymentService] Apple Pay check error:', error);
      return false;
    }
  }

  async isGooglePayAvailable(): Promise<boolean> {
    try {
      if (Platform.OS !== 'android') return false;
      return await SQIPCore.canUseGooglePay();
    } catch (error) {
      console.error('[PaymentService] Google Pay check error:', error);
      return false;
    }
  } */

  reset(): void {
    this.isInitialized = false;
  }
}

// Export singleton instance
export default new PaymentService();
