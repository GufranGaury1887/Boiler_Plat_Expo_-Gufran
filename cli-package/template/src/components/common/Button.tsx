import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import { theme } from '../../constants';
import { moderateScale } from '../../utils/scaling';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  testID?: string;
  leftIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
  testID,
  leftIcon,
}) => {
  const buttonStyle = [
    styles.base,
    styles[variant],
    styles[size],
    disabled && styles.disabled,
    style,
  ];

  const buttonTextStyle = [
    styles.text,
    styles[`${variant}Text`],
    styles[`${size}Text`],
    disabled && styles.disabledText,
    textStyle,
  ];

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled || loading}
      testID={testID}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'outline' ? theme.colors.primary : theme.colors.background}
          size="small"
        />
      ) : (
        <View style={styles.contentContainer}>
          {leftIcon && <View style={styles.leftIconContainer}>{leftIcon}</View>}
          <Text style={buttonTextStyle}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: theme.borderRadius.xxl,
    alignItems: 'center',
    borderWidth: 1.5,
    justifyContent: 'center',
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  // Variants
  primary: {
    backgroundColor: theme.colors.blue, // Blue-800
    shadowColor: theme.colors.blue,
    shadowOpacity: 0.3,
    borderColor: theme.colors.blue,
  },
  secondary: {
    backgroundColor: '#F9FAFB',
    borderColor: '#E5E7EB',
    shadowOpacity: 0.05,
  },
  outline: {
    backgroundColor: 'transparent',
    borderColor: theme.colors.appleGreen,
    shadowOpacity: 0,
    elevation: 0,
  },
  // Sizes
  small: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    minHeight: moderateScale(40),
  },
  medium: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    minHeight: moderateScale(50),
  },
  large: {
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
    minHeight: moderateScale(60),
  },
  // Text styles
  text: {
    fontWeight: theme.typography.fontWeight.semibold,
    textAlign: 'center',
  },
  primaryText: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.md,
  },
  secondaryText: {
    color: theme.colors.text,
    fontSize: theme.typography.fontSize.md,
  },
  outlineText: {
    color: "red",
    fontSize: theme.typography.fontSize.md,
  },
  smallText: {
    fontSize: theme.typography.fontSize.sm,
  },
  mediumText: {
    fontSize: theme.typography.fontSize.md,
  },
  largeText: {
    fontSize: theme.typography.fontSize.lg,
  },
  // Disabled states
  disabled: {
    opacity: 0.5,
    shadowOpacity: 0,
    elevation: 0,
    borderColor: theme.colors.border,
  },
  disabledText: {
    opacity: 0.7,
  },
  // Icon container styles
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  leftIconContainer: {
    marginRight: theme.spacing.xs,
  },
});
