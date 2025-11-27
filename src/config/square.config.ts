/**
 * Square Payment SDK Configuration
 * 
 * This file contains configuration for Square In-App Payments SDK.
 * 
 * IMPORTANT: 
 * - Replace 'REPLACE_WITH_YOUR_APPLICATION_ID' with your actual Square Application ID
 * - Use SANDBOX Application ID for testing
 * - Use PRODUCTION Application ID only when ready for live payments
 * 
 * Get your Application ID:
 * 1. Visit https://developer.squareup.com/apps
 * 2. Create or select your application
 * 3. Go to Credentials tab
 * 4. Copy Sandbox Application ID for testing
 */

export const SQUARE_CONFIG = {
  /**
   * Your Square Application ID
   * Get it from: https://developer.squareup.com/apps
   */
  applicationId: 'sandbox-sq0idb-ZdovxodFQVwsEZ2EwriDdg',
  
  /**
   * Environment mode
   * - 'SANDBOX': For testing with test cards (no real money)
   * - 'PRODUCTION': For live payments (real money)
   */
  environment: 'SANDBOX' as 'SANDBOX' | 'PRODUCTION',
  
  /**
   * Currency code (ISO 4217)
   * Examples: 'USD', 'EUR', 'GBP', 'AUD', 'CAD'
   */
  currencyCode: 'USD',
  
  /**
   * Country code (ISO 3166-1 alpha-2)
   * Examples: 'US', 'GB', 'AU', 'CA'
   */
  countryCode: 'AU',
};

/**
 * Test card numbers for Sandbox testing
 * Use these cards to test payment flows without charging real money
 * 
 * For all cards:
 * - Expiration: Any future date (e.g., 12/25)
 * - CVV: Any 3 digits (e.g., 111)
 * - Postal Code: Any 5 digits (e.g., 12345)
 */
export const SANDBOX_TEST_CARDS = {
  /**
   * Successful payment test cards
   */
  success: [
    {
      type: 'Visa',
      number: '4111 1111 1111 1111',
      description: 'Successful Visa payment',
    },
    {
      type: 'Mastercard',
      number: '5105 1051 0510 5100',
      description: 'Successful Mastercard payment',
    },
    {
      type: 'Discover',
      number: '6011 0000 0000 0004',
      description: 'Successful Discover payment',
    },
    {
      type: 'American Express',
      number: '3782 822463 10005',
      description: 'Successful Amex payment',
    },
  ],
  
  /**
   * Failed payment test cards
   */
  failure: [
    {
      type: 'Declined',
      number: '4000 0000 0000 0002',
      description: 'Card declined',
    },
  ],
};

/**
 * Raffle ticket prices and options
 */
export const RAFFLE_TICKETS = [
  {
    id: 'ticket_1',
    quantity: 1,
    price: 50.00,
    description: '1 Raffle Ticket',
    popular: false,
  },
  {
    id: 'ticket_5',
    quantity: 5,
    price: 200.00,
    description: '5 Raffle Tickets',
    savings: 5.00,
    popular: true,
  },
  {
    id: 'ticket_10',
    quantity: 10,
    price: 350.00,
    description: '10 Raffle Tickets',
    savings: 15.00,
    popular: false,
  },
  {
    id: 'ticket_25',
    quantity: 25,
    price: 750.00,
    description: '25 Raffle Tickets',
    savings: 50.00,
    popular: false,
  },
];

/**
 * Validate Square configuration
 */
export const isSquareConfigured = (): boolean => {
  return SQUARE_CONFIG.applicationId !== 'REPLACE_WITH_YOUR_APPLICATION_ID';
};

/**
 * Get configuration warnings
 */
export const getConfigWarnings = (): string[] => {
  const warnings: string[] = [];
  
  if (!isSquareConfigured()) {
    warnings.push('Square Application ID not configured. Update src/config/square.config.ts');
  }
  
  if (SQUARE_CONFIG.environment === 'PRODUCTION') {
    warnings.push('⚠️ PRODUCTION mode enabled! Real money will be charged.');
  }
  
  return warnings;
};

/**
 * Format currency amount
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: SQUARE_CONFIG.currencyCode,
  }).format(amount);
};
