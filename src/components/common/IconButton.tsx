import React from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Icon, IconName, IconProps } from './Icon';
import { theme } from '../../constants';

interface IconButtonProps extends Omit<IconProps, 'name'> {
  name: IconName;
  onPress: () => void;
  style?: ViewStyle;
  disabled?: boolean;
  hitSlop?: number;
  variant?: 'default' | 'filled' | 'outline';
  size?: number;
}

export const IconButton: React.FC<IconButtonProps> = ({
  name,
  onPress,
  style,
  disabled = false,
  hitSlop = 8,
  variant = 'default',
  size = 24,
  color,
  ...iconProps
}) => {
  const buttonStyle = [
    styles.base,
    styles[variant],
    disabled && styles.disabled,
    { width: size + 16, height: size + 16 },
    style,
  ];

  const iconColor = color || getIconColor(variant, disabled);

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled}
      hitSlop={{ top: hitSlop, bottom: hitSlop, left: hitSlop, right: hitSlop }}
      activeOpacity={0.7}
    >
      <Icon
        name={name}
        size={size}
        color={iconColor}
        {...iconProps}
      />
    </TouchableOpacity>
  );
};

const getIconColor = (variant: string, disabled: boolean): string => {
  if (disabled) return theme.colors.textSecondary;
  
  switch (variant) {
    case 'filled':
      return theme.colors.background;
    case 'outline':
      return theme.colors.primary;
    default:
      return theme.colors.text;
  }
};

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.borderRadius.md,
  },
  default: {
    backgroundColor: 'transparent',
  },
  filled: {
    backgroundColor: theme.colors.primary,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  disabled: {
    opacity: 0.5,
  },
});
