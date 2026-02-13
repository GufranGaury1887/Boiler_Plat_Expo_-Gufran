/**
 * Centralized String Management Class
 * All app strings are organized here for easy maintenance and localization
 */
export class Strings {
  // MARK: - Common Strings
  static readonly COMMON = {
    // Buttons
    LOGIN: 'Login',
    SIGN_UP: 'Sign Up',
    SIGN_IN: 'Sign In',
    CREATE_ACCOUNT: 'Create Account',
    FORGOT_PASSWORD: 'Forgot Password?',
    SEND_RESET_LINK: 'Send Reset Link',
    SUBMIT: 'Submit',
    VERIFY: 'Verify',
    BACK_TO_LOGIN: 'Back to Login',
    TRY_DIFFERENT_EMAIL: 'Try Different Email',
    VIEW_PROFILE: 'View Profile',
    SETTINGS: 'Settings',
    VIEW_DETAILS: 'View Details',
    OTP: 'OTP',
    // Form Labels
    EMAIL: 'Email',
    PASSWORD: 'Password',
    NAME: 'Name',
    CONFIRM_PASSWORD: 'Confirm Password',
    EMAIL_ADDRESS: 'Email Address',
    PHONE: 'Phone',
    // Placeholders
    EMAIL_PLACEHOLDER: 'Email',
    PASSWORD_PLACEHOLDER: '••••••••',
    NAME_PLACEHOLDER: 'Name',
    PHONE_PLACEHOLDER: 'Phone',
    EMAIL_INPUT_PLACEHOLDER: 'Enter your email',
    PASSWORD_CREATE_PLACEHOLDER: 'Create a password',
    PASSWORD_CONFIRM_PLACEHOLDER: 'Confirm your password',
    PHONE_INPUT_PLACEHOLDER: 'Enter your phone',
    // Navigation
    HOME: 'Home',
    PROFILE: 'Profile',
    DETAILS: 'Details',

    // Status
    LOADING: 'Loading...',
    SUCCESS: 'Success',
    ERROR: 'Error',
    FAILED: 'Failed',
  };

  // MARK: - Authentication Strings
  static readonly AUTH = {
    // Titles
    LOGIN_TITLE: 'Log In',
    REGISTER_TITLE: 'Create Account',
    SIGN_UP_TITLE: 'Sign Up',
    FORGOT_PASSWORD_TITLE: 'Forgot Password',
    TERMS_AND_CONDITIONS: 'Terms & Conditions',
    FORGOT_PASSWORD_SUBTITLE: 'Please enter your email address, you will receive a link to create a new password via email.',

    PRIVACY_POLICY: 'Privacy Policy',
    EMAIL_VERIFY_TITLE: 'Verify Email',
    EMAIL_VERIFY_SUBTITLE: "4 digit code has been sent to your email id.",
    // Subtitles
    REGISTER_SUBTITLE: 'Join our community today',
    OTP_VERIFY_SUBTITLE: 'Enter the OTP sent to your email',
    // Success Messages
    ACCOUNT_CREATED_SUCCESS: 'Account created successfully!',
    CHECK_EMAIL_TITLE: 'Check your email',
    CHECK_EMAIL_MESSAGE: "We've sent a password reset link to",

    // Error Messages
    LOGIN_FAILED: 'Login Failed',
    REGISTRATION_FAILED: 'Registration Failed',
    INVALID_CREDENTIALS: 'Invalid email or password',
    UNABLE_TO_CREATE_ACCOUNT: 'Unable to create account',
    LOGIN_ERROR: 'An error occurred during login',
    REGISTRATION_ERROR: 'An error occurred during registration',
    RESET_EMAIL_ERROR: 'Failed to send reset email. Please try again.',
    OTP_VERIFY_ERROR: 'Failed to verify OTP. Please try again.',
    OTP_VERIFIED_SUCCESS: 'OTP verified successfully!',
    OTP_SEND_SUCCESS: 'OTP sent successfully!',
    OTP_VERIFIED_FAILED: 'Failed to verify OTP. Please try again.',
    // Add Member
    ADD_MEMBER_TITLE: 'Add Member',
    ADD_MEMBER_SUBTITLE: 'Add Member',
    JOIN_CLUB: 'Join Club',
    ADD_MEMBER_SECTION_TITLE: 'ADD MEMBER',
    MY_CLUBS_SECTION_TITLE: 'My CLUBS',
    SKIP: 'Skip',
    NEXT: 'Next',
    SAVE: 'Save',
    UPLOAD_MEMBER_PHOTO: 'Upload Member Photo',
    MEMBER_NAME: 'Member Name',
    MEMBER_NAME_PLACEHOLDER: 'Member Name',
    DATE_OF_BIRTH: 'Date of Birth',
    DATE_OF_BIRTH_PLACEHOLDER: 'DD/MM/YYYY',
    TYPE_OF_RELATIONSHIP: 'Type of Relationship',
    TYPE_OF_RELATIONSHIP_PLACEHOLDER: 'Enter',
    // Validation Messages
    EMAIL_REQUIRED: 'Email is required',
    PASSWORD_REQUIRED: 'Password is required',
    NAME_REQUIRED: 'Name is required',
    CONFIRM_PASSWORD_REQUIRED: 'Please confirm your password',
    VALID_EMAIL_REQUIRED: 'Please enter a valid email',
    VALID_EMAIL_ADDRESS_REQUIRED: 'Please enter a valid email address',
    PASSWORD_MIN_LENGTH: 'Password must be at least 8 characters',
    PASSWORDS_DO_NOT_MATCH: 'Passwords do not match',
    VALID_PHONE_NUMBER_REQUIRED: 'Please enter a valid phone number',
    PHONE_NUMBER_REQUIRED: 'Phone number is required',
    I_AGREE_TO_THE_TERMS_AND_CONDITIONS: 'I agree to the Terms and Conditions',
    // Footer Messages
    ALREADY_HAVE_ACCOUNT: 'Already have an account?',
    REMEMBER_PASSWORD: 'Remember your password?',
  };

  // MARK: - Home Screen Strings
  static readonly HOME = {
    WELCOME_TITLE: 'Welcome to Club Yakka',
    WELCOME_SUBTITLE: 'Your React Native Navigation App',
    QUICK_ACTIONS_TITLE: 'Quick Actions',
    FEATURES_TITLE: 'Features',

    // Features List
    FEATURE_TYPESCRIPT: '✅ TypeScript Support',
    FEATURE_NAVIGATION: '✅ React Navigation',
    FEATURE_COMPONENTS: '✅ Common Components',
    FEATURE_THEME: '✅ Theme System',
    FEATURE_UTILITIES: '✅ Utility Functions',
  };





  

  
 

 

}

// Default export
export default Strings;
