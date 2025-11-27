/**
 * Type definitions for react-native-square-in-app-payments
 * 
 * These types provide TypeScript support for Square In-App Payments SDK
 */

declare module 'react-native-square-in-app-payments' {
  /**
   * Card entry configuration options
   */
  export interface CardEntryConfig {
    collectPostalCode?: boolean;
  }

  /**
   * iOS-specific theme configuration for card entry
   */
  export interface IOSCardEntryTheme {
    saveButtonFont?: {
      size: number;
    };
    saveButtonTitle?: string;
    keyboardAppearance?: 'Light' | 'Dark';
    backgroundColor?: string;
    foregroundColor?: string;
    textColor?: string;
    placeholderTextColor?: string;
    tintColor?: string;
    messageColor?: string;
    errorColor?: string;
  }

  /**
   * Card details returned from card entry
   */
  export interface CardDetails {
    nonce: string;
    card?: {
      brand?: string;
      lastFourDigits?: string;
      expirationMonth?: number;
      expirationYear?: number;
      postalCode?: string;
    };
  }

  /**
   * Verification parameters for Strong Customer Authentication
   */
  export interface VerificationParameters {
    amount: number;
    currencyCode: string;
    intent: 'CHARGE' | 'STORE';
    // buyerAction: 'CHARGE' | 'STORE';
    givenName?: string;
    familyName?: string;
    addressLines?: string[];
    city?: string;
    countryCode?: string;
    postalCode?: string;
    phone?: string;
    email?: string;
  }

  /**
   * Apple Pay configuration
   */
  export interface ApplePayConfig {
    merchantIdentifier: string;
    countryCode: string;
    currencyCode: string;
  }

  /**
   * Google Pay configuration
   */
  export interface GooglePayConfig {
    squareLocationId: string;
    countryCode: string;
    currencyCode: string;
  }

  /**
   * SQIPCore module - Core SDK functionality
   */
  export namespace SQIPCore {
    /**
     * Initialize Square SDK
     * @param applicationId Your Square Application ID
     */
    export function setSquareApplicationId(applicationId: string): Promise<void>;

    /**
     * Check if Apple Pay is supported on device
     */
    export function canUseApplePay(): Promise<boolean>;

    /**
     * Check if Google Pay is supported on device
     */
    export function canUseGooglePay(): Promise<boolean>;
  }

  /**
   * SQIPCardEntry module - Card entry functionality
   */
  export namespace SQIPCardEntry {
    /**
     * Set iOS theme for card entry
     * @param theme iOS theme configuration
     */
    export function setIOSCardEntryTheme(theme: IOSCardEntryTheme): void;

    /**
     * Start card entry flow with callbacks
     * @param config Card entry configuration
     * @param onCardNonceRequestSuccess Callback when card nonce is received
     * @param onCardEntryCancel Callback when user cancels
     * @returns Promise that resolves when card entry starts
     */
    export function startCardEntryFlow(
      config: CardEntryConfig,
      onCardNonceRequestSuccess: (cardDetails: CardDetails) => Promise<void>,
      onCardEntryCancel: () => void
    ): Promise<void>;

    /**
     * Start card entry flow with buyer verification (3DS/SCA)
     * @param config Card entry configuration with verification parameters
     * @param onBuyerVerificationSuccess Callback when verification succeeds
     * @param onBuyerVerificationFailure Callback when verification fails
     * @param onCardEntryCancel Callback when user cancels
     */
    export function startCardEntryFlowWithBuyerVerification(
      config: CardEntryConfig & VerificationParameters & { squareLocationId: string },
      onBuyerVerificationSuccess: (verificationResult: any) => void,
      onBuyerVerificationFailure: (error: any) => void,
      onCardEntryCancel: () => void
    ): Promise<void>;

    /**
     * Complete card entry
     * Call this after successfully processing payment
     */
    export function completeCardEntry(onCardEntryComplete: () => void): void;

    /**
     * Show card nonce processing error
     * @param errorMessage Error message to display
     */
    export function showCardNonceProcessingError(errorMessage: string): void;
  }

  /**
   * SQIPApplePay module - Apple Pay functionality
   */
  export namespace SQIPApplePay {
    /**
     * Initialize Apple Pay
     * @param config Apple Pay configuration
     */
    export function initializeApplePay(config: ApplePayConfig): Promise<void>;

    /**
     * Request Apple Pay nonce
     * @param paymentRequest Payment request details
     * @returns Promise that resolves with nonce
     */
    export function requestApplePayNonce(paymentRequest: {
      price: string;
      summaryLabel: string;
      countryCode: string;
      currencyCode: string;
    }): Promise<{ nonce: string }>;

    /**
     * Complete Apple Pay authorization
     * @param success Whether payment was successful
     * @param errorMessage Optional error message if payment failed
     */
    export function completeApplePayAuthorization(
      success: boolean,
      errorMessage?: string
    ): void;
  }

  /**
   * SQIPGooglePay module - Google Pay functionality
   */
  export namespace SQIPGooglePay {
    /**
     * Initialize Google Pay
     * @param config Google Pay configuration
     */
    export function initializeGooglePay(config: GooglePayConfig): Promise<void>;

    /**
     * Request Google Pay nonce
     * @param paymentRequest Payment request details
     * @returns Promise that resolves with nonce
     */
    export function requestGooglePayNonce(paymentRequest: {
      price: string;
      priceStatus: 'FINAL' | 'ESTIMATED';
      currencyCode: string;
    }): Promise<{ nonce: string }>;
  }

  /**
   * Error types that can be thrown by SDK
   */
  export enum SquarePaymentErrorType {
    USAGE_ERROR = 'USAGE_ERROR',
    CARD_ENTRY_CANCELLED = 'CARD_ENTRY_CANCELLED',
    NO_NETWORK = 'NO_NETWORK',
    UNSUPPORTED = 'UNSUPPORTED',
  }

  export interface SquarePaymentError extends Error {
    type: SquarePaymentErrorType;
  }
}
