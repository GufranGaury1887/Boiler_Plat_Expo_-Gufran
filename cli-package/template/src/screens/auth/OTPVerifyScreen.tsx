import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  Platform
} from 'react-native';
import { Button, hideLoader, OTPInputComponent, OTPInputRef, showLoader } from '../../components/common';
import { theme } from '../../constants';
import { Strings } from '../../constants/strings';
import { getApiErrorInfo, useResendOTP, useVerifyOTP } from '../../services/authService';
import { moderateScale } from '../../utils/scaling';
import { Fonts } from '../../constants/Fonts';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Images from '../../assets/images';
import SVG from '../../assets/icons';
import ToastManager from '../../components/common/ToastManager';
import { useAuthStore } from '../../stores/authStore';

interface OTPVerifyScreenProps {
  navigation: any;
  route?: {
    params?: {
      email?: string;
    };
  };
}

export const OTPVerifyScreen: React.FC<OTPVerifyScreenProps> = ({ navigation, route }) => {

  const [isLoading, setIsLoading] = useState(false);
  const emailParam = route?.params?.email || 'your email';
  const verifyOTPMutation = useVerifyOTP();
  const resendOTPMutation = useResendOTP();
  const [otp, setOtp] = useState('');
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const { login } = useAuthStore();
  const otpInputRef = useRef<OTPInputRef>(null);

  useEffect(() => {
    // Initialize timer with start time
    if (startTime === null) {
      const initialStartTime = Date.now();
      setStartTime(initialStartTime);
      runTimer(initialStartTime);
    }

    return () => {
      // Cleanup will be handled in runTimer function
    };
  }, [startTime]);

  const runTimer = (initialStartTime: number) => {
    setResendTimer(60);
    setCanResend(false);
    
    const timerInterval = setInterval(() => {
      const elapsedTime = (Date.now() - initialStartTime) / 1000; // Elapsed time in seconds
      const remaining = Math.max(60 - elapsedTime, 0); // Calculate remaining time
      
      setResendTimer(remaining);
      
      if (remaining <= 0) {
        setCanResend(true);
        clearInterval(timerInterval);
      }
    }, 1000); // Update every second

    // Store interval reference for cleanup
    return timerInterval;
  };


  const validateOTP = () => {
    if (!otp.trim()) {
      ToastManager.error('OTP is required');
      return false;
    }

    if (otp.length !== 4) {
      ToastManager.error('Please enter a complete 4-digit OTP');
      return false;
    }

    return true;
  };

  const handleVerify = async () => {
    // navigation.navigate('AddMember');
    // return
    if (!validateOTP()) return;
    showLoader();
    await verifyOTPMutation.mutateAsync({
      email: emailParam,
      otp: otp,
      deviceToken: "jhjhjghgj",
      deviceType: Platform.OS === "ios" ? 2 : 1,
    }, {
      onSuccess: (response) => {
        ToastManager.success(response?.data?.message || Strings.AUTH.OTP_VERIFIED_SUCCESS);

        // Handle the response data based on the API structure you provided
        if (response.data) {
          const userData = {
            userId: response.data.data.userId,
            Name: response.data.data.Name,
            email: response.data.data.email,
            profileImage: response?.data?.data?.profileImage || "",
            isProfileCompleted: response?.data?.data?.isProfileCompleted,
            isAddMember: response?.data?.data?.isAddMember,
            userType: response?.data?.data?.userType
          };

          // Save both tokens and user data
          login(userData, response.data.data.accessToken, response.data.data.authorizationToken);


        }
      },
      onError: (error) => {
        const errorInfo = getApiErrorInfo(error);
        ToastManager.error(errorInfo.message || Strings.AUTH.OTP_VERIFIED_FAILED);
        console.error('Verify OTP error:', error);
      },
      onSettled: () => {
        hideLoader();
        console.log('Verify OTP settled');
      }
    });


  };


  const onOTPChange = (text: string) => {
    setOtp(text);
  };

  const onOTPFilled = (text: string) => {
    setOtp(text);
  };

  const onResendOTPClick = () => {
    if (!canResend) return;

    resendOTPMutation.mutate({
      email: emailParam,
    }, {
      onSuccess: (response) => {
        ToastManager.success(response?.data?.message || Strings.AUTH.OTP_SEND_SUCCESS);

        // Reset timer by setting new start time
        const newStartTime = Date.now();
        setStartTime(newStartTime);
        setOtp(''); // Clear current OTP
        otpInputRef.current?.clear(); // Clear OTP input component

        // Start new timer
        runTimer(newStartTime);
      },
      onError: (error) => {
        const errorInfo = getApiErrorInfo(error);
        ToastManager.error(errorInfo.message || 'Failed to send OTP. Please try again.');
        console.error('Resend OTP error:', error);
      },
      onSettled: () => {
        console.log('Resend OTP settled');
      }
    });
  };


  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };


  return (
    <ImageBackground
      source={Images.backgroundImage}
      style={styles.backgroundImage}
      resizeMode="contain"
    >
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        <StatusBar barStyle="dark-content" />
        <KeyboardAwareScrollView
          enableOnAndroid={true}
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <TouchableOpacity style={{ marginLeft: theme.spacing.md, marginTop: theme.spacing.md }} onPress={() => navigation.goBack()}>
            <SVG.arrowLeft height={moderateScale(30)} width={moderateScale(30)} style={styles.logoIcon} />
          </TouchableOpacity>
          <View style={styles.logoSection}>
            <SVG.login_logo height={moderateScale(150)} width={moderateScale(150)} style={styles.logoIcon} />
          </View>

          {/* Login Form */}
          <View style={styles.loginSection}>
            <Text style={styles.loginTitle}>{Strings.AUTH.EMAIL_VERIFY_TITLE}</Text>
            <Text style={styles.emailVerifySubTitle}>{Strings.AUTH.EMAIL_VERIFY_SUBTITLE}</Text>

            <View style={styles.form}>

              <OTPInputComponent
                ref={otpInputRef}
                onTextChange={onOTPChange}
                onFilled={onOTPFilled}
                numberOfDigits={4}
                disabled={isLoading}
              />

              {/* Resend Section */}
              <View style={styles.resendSection}>
                <Text style={styles.resendText}>Didn't receive OTP? </Text>
                {canResend ? (
                  <TouchableOpacity
                    onPress={onResendOTPClick}
                    disabled={isLoading}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.resendButton, isLoading && styles.resendButtonDisabled]}>
                      Resend Code
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <Text style={styles.timerText}>
                    Resend in {formatTimer(resendTimer)}
                  </Text>
                )}
              </View>


              <Button
                title={Strings.COMMON.VERIFY}
                onPress={handleVerify}
                variant="primary"
                size="medium"
              />



            </View>
          </View>
        </KeyboardAwareScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flexGrow: 1,
  },
  // Logo Section
  logoSection: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  logoIcon: {
    marginBottom: theme.spacing.xs,
  },
  // Login Section
  loginSection: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.lg,
    borderTopLeftRadius: moderateScale(30),
    borderTopRightRadius: moderateScale(30),
    paddingTop: moderateScale(20),
  },
  loginTitle: {
    fontFamily: Fonts.outfitSemiBold,
    fontSize: moderateScale(22),
    color: theme.colors.black,
    marginBottom: theme.spacing.xs,
  },
  emailVerifySubTitle: {
    fontFamily: Fonts.outfitRegular,
    fontSize: moderateScale(15),
    color: theme.colors.black,
    marginBottom: theme.spacing.md,
  },
  form: {
    gap: theme.spacing.sm,
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginTop: -8,
  },
  forgotButton: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    shadowOpacity: 0,
    elevation: 0,
    paddingHorizontal: 0,
    paddingVertical: 4,
    minHeight: 'auto',
  },
  forgotButtonText: {
    color: theme.colors.appleGreen,
    fontSize: theme.typography.fontSize.sm,
    fontFamily: Fonts.outfitRegular,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: theme.spacing.sm,
  },
  signUpButton: {
    borderColor: theme.colors.appleGreen,
  },
  signUpButtonText: {
    color: theme.colors.appleGreen,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  resendSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: theme.spacing.sm,
  },
  resendText: {
    fontFamily: Fonts.outfitRegular,
    fontSize: moderateScale(15),
    color: theme.colors.black,
  },
  resendButton: {
    fontFamily: Fonts.outfitSemiBold,
    fontSize: moderateScale(15),
    color: theme.colors.primary,
    textDecorationLine: 'underline',
  },
  resendButtonDisabled: {
    color: theme.colors.textSecondary,
    textDecorationLine: 'none',
  },
  timerText: {
    fontFamily: Fonts.outfitSemiBold,
    fontSize: moderateScale(15),
    color: theme.colors.warning,
  },
});

