import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Keyboard,
  Platform,
} from 'react-native';
import { Button, hideLoader, showLoader, TextInput } from '../../components/common';
import { theme } from '../../constants';
import { Strings } from '../../constants/strings';
import { Validation } from '../../utils';
import { ImageBackground } from 'react-native';
import Images from '../../assets/images';
import SVG from '../../assets/icons';
import { moderateScale } from '../../utils/scaling';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'react-native';
import { Fonts } from '../../constants/Fonts';
import ToastManager from '../../components/common/ToastManager';
import { useForgotPassword } from '../../services/authService';

interface ForgotPasswordScreenProps {
  navigation: any;
}

export const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const forgotPasswordMutation = useForgotPassword();

  const handleSubmit = async () => {
    Keyboard.dismiss();
    if (!Validation.validateForgotPasswordFormAndShowErrors(email)) {
      return;
    }

    showLoader();
    forgotPasswordMutation.mutate({ email: email }
      , {
        onSuccess: (response) => {
          navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }],
          });
          ToastManager.success(response.data.message || 'Forgot password successful!');
          hideLoader();
        },
        onError: (error: any) => {
          console.error('Forgot password error:', error);
          if (error.response?.data?.message) {
            ToastManager.error( error.response.data.message);
          } else if (error.message) {
            ToastManager.error( error.message);
          } else {
            ToastManager.error('Something went wrong. Please try again.');
          }
          hideLoader();
        },
        onSettled: () => {
          hideLoader();
        }
      });
  };



  const onEmailChange = (text: string) => {
    const trimmedText = text.trim();
    setEmail(trimmedText);
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
          <TouchableOpacity style={{ marginLeft: theme.spacing.md }} onPress={() => navigation.goBack()}>
            <SVG.arrowLeft height={moderateScale(30)} width={moderateScale(30)} style={styles.logoIcon} />
          </TouchableOpacity>
          <View style={styles.logoSection}>
            <SVG.login_logo height={moderateScale(150)} width={moderateScale(150)} style={styles.logoIcon} />
          </View>

          {/* Login Form */}
          <View style={styles.loginSection}>
            <Text style={styles.loginTitle}>{Strings.AUTH.FORGOT_PASSWORD_TITLE}</Text>
            <Text style={styles.loginSubTitle}>{Strings.AUTH.FORGOT_PASSWORD_SUBTITLE}</Text>

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
              <Button
                title={Strings.COMMON.SUBMIT}
                onPress={handleSubmit}
                variant="primary"
                size="medium"
                style={styles.button}
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
      fontSize: moderateScale(24),
      color: theme.colors.black,
      marginBottom: theme.spacing.sm,
    },
    loginSubTitle: {
      fontFamily: Fonts.outfitRegular,
      fontSize: moderateScale(13),
      color: theme.colors.black,
      marginBottom: theme.spacing.md,
    },
  form: {
    gap: theme.spacing.sm,
  },
  button: {
    marginTop: theme.spacing.md,
  }
});