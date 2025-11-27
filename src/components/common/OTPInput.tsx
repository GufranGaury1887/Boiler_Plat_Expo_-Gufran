import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { OtpInput } from 'react-native-otp-entry';
import { theme } from '../../constants';
import { moderateScale } from '../../utils/scaling';

interface OTPInputProps {
  onTextChange: (text: string) => void;
  onFilled?: (text: string) => void;
  numberOfDigits?: number;
  disabled?: boolean;
}

export interface OTPInputRef {
  clear: () => void;
  focus: () => void;
}

export const OTPInputComponent = forwardRef<OTPInputRef, OTPInputProps>(({
  onTextChange,
  onFilled,
  numberOfDigits = 4,
  disabled = false,
}, ref) => {
  const otpInputRef = useRef<any>(null);

  useImperativeHandle(ref, () => ({
    clear: () => {
      if (otpInputRef.current) {
        otpInputRef.current.clear();
      }
    },
    focus: () => {
      if (otpInputRef.current) {
        otpInputRef.current.focus();
      }
    },
  }));

  return (
    <View style={styles.container}>
      <OtpInput
        ref={otpInputRef}
        numberOfDigits={numberOfDigits}
        onTextChange={onTextChange}
        onFilled={onFilled}
        disabled={disabled}
        focusColor={theme.colors.primary}
        focusStickBlinkingDuration={500}
        secureTextEntry={false}
        autoFocus={true}
        hideStick={false}
        blurOnFilled={false}
        type="numeric"
        textInputProps={{
          accessibilityLabel: 'One-Time Password',
          accessibilityHint: 'Enter the verification code sent to your email',
        }}
        theme={{
          containerStyle: styles.otpContainer,
          pinCodeContainerStyle: styles.pinCodeContainer,
          pinCodeTextStyle: styles.pinCodeText,
          focusStickStyle: styles.focusStick,
          focusedPinCodeContainerStyle: styles.focusedPinCodeContainer,
        }}
      />
    </View>
  );
});

OTPInputComponent.displayName = 'OTPInputComponent';

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: theme.spacing.md,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pinCodeContainer: {
    width: moderateScale(70),
    height: moderateScale(50),
    borderRadius: moderateScale(25),
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: moderateScale(8),
    shadowColor: theme.colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  pinCodeText: {
    fontSize: moderateScale(20),
    fontWeight: '600',
    color: theme.colors.text,
    textAlign: 'center',
  },
  focusStick: {
    width: moderateScale(2),
    height: moderateScale(30),
    backgroundColor: theme.colors.primary,
    borderRadius: moderateScale(1),
  },
  focusedPinCodeContainer: {
    borderColor: theme.colors.primary,
    borderWidth: 2,
    shadowColor: theme.colors.primary,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});

export default OTPInputComponent;
