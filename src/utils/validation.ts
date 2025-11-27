import ToastManager from '../components/common/ToastManager';
import { Strings } from '../constants/strings';

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: string) => boolean;
  message?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export class ValidationClass {
  private static instance: ValidationClass;
  
  private constructor() {}
  
  public static getInstance(): ValidationClass {
    if (!ValidationClass.instance) {
      ValidationClass.instance = new ValidationClass();
    }
    return ValidationClass.instance;
  }

  /**
   * Validate email format
   */
  public validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate password strength
   */
  public validatePassword(password: string): boolean {
    return password.length >= 8;
  }

  /**
   * Validate required field
   */
  public validateRequired(value: string): boolean {
    return value.trim().length > 0;
  }

  /**
   * Validate phone number
   */
  public validatePhoneNumber(phoneNumber: string): boolean {
    return phoneNumber.length >= 10;
  }

  /**
   * Generic field validation with rules
   */
  public validateField(value: string, rules: ValidationRule[]): ValidationResult {
    const errors: string[] = [];
    
    for (const rule of rules) {
      if (rule.required && !this.validateRequired(value)) {
        errors.push(rule.message || 'This field is required');
        continue;
      }
      
      if (rule.minLength && value.length < rule.minLength) {
        errors.push(rule.message || `Minimum length is ${rule.minLength}`);
        continue;
      }
      
      if (rule.maxLength && value.length > rule.maxLength) {
        errors.push(rule.message || `Maximum length is ${rule.maxLength}`);
        continue;
      }
      
      if (rule.pattern && !rule.pattern.test(value)) {
        errors.push(rule.message || 'Invalid format');
        continue;
      }
      
      if (rule.custom && !rule.custom(value)) {
        errors.push(rule.message || 'Invalid value');
        continue;
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate login form
   */
  public validateLoginForm(email: string, password: string): ValidationResult {
    const errors: string[] = [];
    
    if (!this.validateRequired(email)) {
      errors.push(Strings.AUTH.EMAIL_REQUIRED);
    } else if (!this.validateEmail(email)) {
      errors.push(Strings.AUTH.VALID_EMAIL_ADDRESS_REQUIRED);
    }
    
    if (!this.validateRequired(password)) {
      errors.push('Password is required');
    } else if (!this.validatePassword(password)) {
      errors.push('Password must be at least 8 characters long');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate forgot password form
   */
  public validateForgotPasswordForm(email: string): ValidationResult {
    const errors: string[] = [];
    
    if (!this.validateRequired(email)) {
      errors.push(Strings.AUTH.EMAIL_REQUIRED);
    } else if (!this.validateEmail(email)) {
      errors.push(Strings.AUTH.VALID_EMAIL_ADDRESS_REQUIRED);
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate registration form
   */
  public validateRegistrationForm(data: {
    email: string;
    password: string;
    confirmPassword: string;
    name?: string;
    phone?: string;
  }): ValidationResult {
    const errors: string[] = [];
    
    // Email validation
    if (!this.validateRequired(data.email)) {
      errors.push(Strings.AUTH.EMAIL_REQUIRED);
    } else if (!this.validateEmail(data.email)) {
      errors.push(Strings.AUTH.VALID_EMAIL_ADDRESS_REQUIRED);
    }
    
    // Password validation
    if (!this.validateRequired(data.password)) {
      errors.push('Password is required');
    } else if (!this.validatePassword(data.password)) {
      errors.push('Password must be at least 8 characters long');
    }
    
    // Confirm password validation
    if (!this.validateRequired(data.confirmPassword)) {
      errors.push('Please confirm your password');
    } else if (data.password !== data.confirmPassword) {
      errors.push('Passwords do not match');
    }
    
    // Name validation (if provided)
    if (data.name && !this.validateRequired(data.name)) {
      errors.push('Name is required');
    }
    
    // Phone validation (if provided)
    if (data.phone && !this.validatePhoneNumber(data.phone)) {
      errors.push('Please enter a valid phone number');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Show validation errors using ToastManager
   */
  public showValidationErrors(errors: string[]): void {
    if (errors.length > 0) {
      ToastManager.error(errors[0]);
    }
  }

  /**
   * Validate and show errors if validation fails
   */
  public validateAndShowErrors(value: string, rules: ValidationRule[]): boolean {
    const result = this.validateField(value, rules);
    if (!result.isValid) {
      this.showValidationErrors(result.errors);
    }
    return result.isValid;
  }

  /**
   * Validate login form and show errors
   */
  public validateLoginFormAndShowErrors(email: string, password: string): boolean {
    const result = this.validateLoginForm(email, password);
    if (!result.isValid) {
      this.showValidationErrors(result.errors);
    }
    return result.isValid;
  }

  /**
   * Validate forgot password form and show errors
   */
  public validateForgotPasswordFormAndShowErrors(email: string): boolean {
    const result = this.validateForgotPasswordForm(email);
    if (!result.isValid) {
      this.showValidationErrors(result.errors);
    }
    return result.isValid;
  }

  /**
   * Validate registration form and show errors
   */
  public validateRegistrationFormAndShowErrors(data: {
    email: string;
    password: string;
    confirmPassword: string;
    name?: string;
    phone?: string;
  }): boolean {
    const result = this.validateRegistrationForm(data);
    if (!result.isValid) {
      this.showValidationErrors(result.errors);
    }
    return result.isValid;
  }

  /**
   * Validate member name
   */
  public validateMemberName(name: string): boolean {
    const trimmedName = name.trim();
    return trimmedName.length >= 2 && trimmedName.length <= 50 && /^[a-zA-Z\s]+$/.test(trimmedName);
  }

  /**
   * Validate date of birth
   */
  public validateDateOfBirth(dateOfBirth: Date): boolean {
    const today = new Date();
    const minDate = new Date(today.getFullYear() - 120, today.getMonth(), today.getDate()); // Max age 120
    const maxDate = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate()); // Min age 1
    
    return dateOfBirth >= minDate && dateOfBirth <= maxDate;
  }

  /**
   * Validate relationship type
   */
  public validateRelationshipType(relationshipType: string): boolean {
    const validRelationships = [
      'Father', 'Mother', 'Son', 'Daughter', 'Brother', 'Sister', 
      'Husband', 'Wife', 'Grandfather', 'Grandmother', 'Grandson', 
      'Granddaughter', 'Uncle', 'Aunt', 'Nephew', 'Niece', 'Cousin',
      'Father-in-law', 'Mother-in-law', 'Son-in-law', 'Daughter-in-law',
      'Brother-in-law', 'Sister-in-law', 'Other'
    ];
    
    return validRelationships.includes(relationshipType.trim());
  }

  /**
   * Validate member form
   */
  public validateMemberForm(data: {
    name: string;
    dateOfBirth: Date;
    relationshipType: string;
  }): ValidationResult {
    const errors: string[] = [];
    
    // Name validation
    if (!this.validateRequired(data.name)) {
      errors.push('Member name is required');
    } else if (!this.validateMemberName(data.name)) {
      errors.push('Name must be 2-50 characters long and contain only letters and spaces');
    }
    
    // Date of birth validation
    if (!this.validateDateOfBirth(data.dateOfBirth)) {
      errors.push('Please select a valid date of birth (age must be between 1 and 120 years)');
    }
    
    // Relationship type validation
    if (!this.validateRequired(data.relationshipType)) {
      errors.push('Relationship type is required');
    } else if (!this.validateRelationshipType(data.relationshipType)) {
      errors.push('Please select a valid relationship type');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate member form and show errors
   */
  public validateMemberFormAndShowErrors(data: {
    name: string;
    dateOfBirth: Date;
    relationshipType: string;
  }): boolean {
    const result = this.validateMemberForm(data);
    if (!result.isValid) {
      this.showValidationErrors(result.errors);
    }
    return result.isValid;
  }
}

// Export singleton instance
export const Validation = ValidationClass.getInstance();

// Export individual validation functions for backward compatibility
export const validateEmail = (email: string): boolean => Validation.validateEmail(email);
export const validatePassword = (password: string): boolean => Validation.validatePassword(password);
export const validateRequired = (value: string): boolean => Validation.validateRequired(value);
export const validatePhoneNumber = (phoneNumber: string): boolean => Validation.validatePhoneNumber(phoneNumber);
