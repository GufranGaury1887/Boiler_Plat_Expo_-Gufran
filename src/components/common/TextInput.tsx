import React, { useState, forwardRef, useImperativeHandle, useRef } from 'react';
import {
  TextInput as RNTextInput,
  View,
  Text,
  StyleSheet,
  TextInputProps as RNTextInputProps,
  ViewStyle,
  TextStyle,
  TouchableOpacity,
} from 'react-native';
import { IconAlt } from './IconAlt';
import { theme } from '../../constants';
import { SvgProps } from "react-native-svg";
import SVG from '../../assets/icons';
import { moderateScale } from '../../utils/scaling';
import { Fonts } from '../../constants/Fonts';

interface TextInputProps extends RNTextInputProps {
  label?: string;
  error?: string;
  leftIcon?: React.FC<SvgProps> | string;
  rightIcon?: string;
  onRightIconPress?: () => void;
  style?: ViewStyle;
  inputStyle?: TextStyle;
  showPasswordToggle?: boolean;
  variant?: 'default' | 'filled' | 'outlined';
  leftIconStyle?: ViewStyle;
  leftIconSizeWidth?: number;
  leftIconSizeHeight?: number;
}

export const TextInput = forwardRef<any, TextInputProps>(({
  label,
  error,
  leftIcon,
  rightIcon,
  onRightIconPress,
  style,
  inputStyle,
  showPasswordToggle = false,
  variant = 'outlined',
  secureTextEntry,
  leftIconStyle,
  leftIconSizeWidth = moderateScale(20),
  leftIconSizeHeight = moderateScale(20),
  ...props
}, ref) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(!secureTextEntry);
  const inputRef = useRef<RNTextInput>(null);
  // const [isFocused, setIsFocused] = useState(false);

  useImperativeHandle(ref, () => ({
    focus: () => {
      inputRef.current?.focus();
    },
    blur: () => {
      inputRef.current?.blur();
    },
  }));

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const containerStyle = [
    styles.container,
    styles[variant],
    // isFocused && styles.focusedContainer,
    error && styles.errorContainer, 
    style,
  ];

  const textInputStyle = [
    styles.input,
    leftIcon && styles.inputWithLeftIcon,
    (rightIcon || showPasswordToggle) && styles.inputWithRightIcon,
    inputStyle,
  ];

  return (
    <View style={styles.wrapper}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <View style={containerStyle}>
        {leftIcon && (
          <View style={[styles.leftIconContainer, leftIconStyle]}>
            {typeof leftIcon === 'string' ? (
              <IconAlt
                name={leftIcon as any}
                color={theme.colors.textSecondary}
                size={moderateScale(30)}
              />
            ) : (
              React.createElement(leftIcon, {
                width: leftIconSizeWidth,
                height: leftIconSizeHeight,
                color: theme.colors.textSecondary,
              })
            )}
          </View>
        )}
        
        <RNTextInput
          ref={inputRef}
          style={textInputStyle}
          placeholderTextColor={theme.colors.textSecondary}
          secureTextEntry={showPasswordToggle ? !isPasswordVisible : secureTextEntry}
          underlineColorAndroid="transparent"
          {...props}
        />
        
        {(rightIcon || showPasswordToggle) && (
          <View style={styles.rightIconContainer}>
            {showPasswordToggle ? (
              <TouchableOpacity
                onPress={togglePasswordVisibility}
                style={styles.eyeButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                {React.createElement(isPasswordVisible ? SVG.eye : SVG.eyeOff, {
                  width: leftIconSizeWidth,
                  height: leftIconSizeHeight,
                  color: theme.colors.textSecondary,
                })}
              </TouchableOpacity>
            ) : rightIcon ? (
              <IconAlt
                name={rightIcon as any}
                size={20}
                color={theme.colors.textSecondary}
              />
            ) : null}
          </View>
        )}
      </View>
      
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
});

TextInput.displayName = 'TextInput';

const styles = StyleSheet.create({
  wrapper: {
  },
  label: {
    fontFamily: Fonts.outfitRegular,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: moderateScale(50),
    borderRadius: moderateScale(30),
    paddingHorizontal: moderateScale(10),
  },
  default: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.background,
  },
  filled: {
    backgroundColor: '#F8F9FA',
    borderWidth: 0,
  },
  outlined: {
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    backgroundColor: theme.colors.background,
  },
  focusedContainer: {
    borderColor: '#3B82F6',
    borderWidth: 2,
    shadowColor: '#3B82F6',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  errorContainer: {
    borderColor: theme.colors.error,
    borderWidth: 2,
  },
  input: {
    flex: 1,
    fontFamily: Fonts.outfitRegular,
    marginLeft: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text,

  },
  inputWithLeftIcon: {
    paddingLeft: theme.spacing.xs,
  },
  inputWithRightIcon: {
    paddingRight: theme.spacing.xs,
  },
  leftIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightIconContainer: {
    paddingRight: theme.spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eyeButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontFamily: Fonts.outfitRegular,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.error,
    marginTop: theme.spacing.xs,
    marginLeft: theme.spacing.xs,
  },
});
