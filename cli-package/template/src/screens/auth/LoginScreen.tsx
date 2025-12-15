import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  StatusBar,
  Platform,
} from 'react-native';
import { Button, TextInput } from '@components/common';
import { theme } from '@constants';
import { Strings } from '@constants/strings';
import { validateEmail, validatePassword } from '@utils';
import SVG from '@assets/icons';
import Images from '@assets/images';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { moderateScale, verticalScale } from '@utils/scaling';
import { Fonts } from '@constants/Fonts';
import { SafeAreaView } from 'react-native-safe-area-context';
import { hideLoader, showLoader } from '@components/common/AppLoader';
import ToastManager from '@components/common/ToastManager';
import { useLogin, getApiErrorInfo } from '@services/authService';
import { useAuthStore } from '@stores/authStore';
import NotificationManager from '@utils/NotificationManager';

interface LoginScreenProps {
  navigation: any;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const loginMutation = useLogin();
  const login = useAuthStore((state) => state.login);

  const onEmailChange = (text: string) => {
    const trimmedText = text.trim();
    setEmail(trimmedText);
  };
  const onPasswordChange = (text: string) => {
    const trimmedText = text.trim();
    setPassword(trimmedText);
  };

  useEffect(() => {
    const getToken = async () => {
      const token = await NotificationManager.getFCMToken();

      console.log("FCM token:", token);

    }
    getToken();
  }, []);


  const validateForm = () => {
    if (!email.trim()) {
      ToastManager.error('Email is required');
      return false;
    } else if (!validateEmail(email)) {
      ToastManager.error('Please enter a valid email address');
      return false;
    }

    if (!password.trim()) {
      ToastManager.error('Password is required');
      return false;
    } else if (!validatePassword(password)) {
      ToastManager.error('Password must be at least 8 characters long');
      return false;
    }

    return true;
  };

  const handleLogin = () => {
    if (!validateForm()) return;
    showLoader();
    loginMutation.mutate({
      email,
      password
    }, {
      onSuccess: (response) => {
        // Check if it's a 409 status (OTP verification needed)
        if (response.status === 409) {
          ToastManager.error(response.data.message || 'OTP verification required');
          navigation.navigate('OTPVerify', { email: email });


        } else {
          // Normal login success
          const userData = {
            userId: response?.data?.data?.userId,
            email: response?.data?.data?.email,
            Name: response?.data?.data?.Name,
            profileImage: response?.data?.data?.profileImage,
            isProfileCompleted: response?.data?.data?.isProfileCompleted,
            isAddMember: response?.data?.data?.isAddMember || false,
            userType: response?.data?.data?.userType,
          };

          login(userData, response?.data?.data?.accessToken, response?.data?.data?.authorizationToken);
          ToastManager.success(response.data.message || 'Welcome back!');
        }
      },
      onError: (error: any) => {
        const errorInfo = getApiErrorInfo(error);
        if (errorInfo.statusCode === 401) {
          console.log('Login error===>>>>14', errorInfo);
        } else {
          ToastManager.error(errorInfo?.message);
        }
      },
      onSettled: () => {
        hideLoader();
      }
    });
  };

  const navigateToRegister = () => {
    navigation.navigate('Register');
  };

  const navigateToForgotPassword = () => {
    navigation.navigate('ForgotPassword');
  };


  return (
    <ImageBackground
      source={Images.backgroundImage}
      style={styles.backgroundImage}
      resizeMode="contain"
    >
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor={theme.colors.background}
          translucent={Platform.OS === 'android' ? true : false}
        />
        <KeyboardAwareScrollView
          enableOnAndroid={true}
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.logoSection}>
            <SVG.login_logo height={moderateScale(150)} width={moderateScale(150)} style={styles.logoIcon} />
          </View>

          {/* Login Form */}
          <View style={styles.loginSection}>
            <Text style={styles.loginTitle}>{Strings.AUTH.LOGIN_TITLE}</Text>

            <View style={styles.form}>
              <TextInput
                label={Strings.COMMON.EMAIL}
                value={email}
                onChangeText={onEmailChange}
                placeholder={Strings.COMMON.EMAIL_PLACEHOLDER}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                variant="outlined"
                leftIcon={SVG.Email}
                maxLength={50}
              />

              <TextInput
                label={Strings.COMMON.PASSWORD}
                value={password}
                onChangeText={onPasswordChange}
                placeholder={Strings.COMMON.PASSWORD_PLACEHOLDER}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                leftIcon={SVG.Password}
                showPasswordToggle
                variant="outlined"
                maxLength={30}
              />

              <View style={styles.forgotPasswordContainer}>
                <Button
                  title={Strings.COMMON.FORGOT_PASSWORD}
                  onPress={navigateToForgotPassword}
                  variant="outline"
                  style={styles.forgotButton}
                  textStyle={styles.forgotButtonText}
                />
              </View>

              <Button
                title={Strings.COMMON.LOGIN}
                onPress={handleLogin}
                variant="primary"
                size="medium"
              />

              <View style={styles.divider}>
                <SVG.OR_separator />
              </View>

              <Button
                title={Strings.COMMON.SIGN_UP}
                onPress={navigateToRegister}
                variant="outline"
                textStyle={styles.signUpButtonText}
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
    marginTop: verticalScale(50)
  },
  logoIcon: {
    marginBottom: theme.spacing.md,
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
    fontSize: moderateScale(24),
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
});
